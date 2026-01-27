# Plano de Integração com Supabase

## Visão Geral

Este documento descreve o plano para integrar o CalcEdu com o Supabase para gerenciamento de clientes, pagamentos e assinaturas.

## 1. Configuração do Supabase

### 1.1 Criar Projeto no Supabase
- Acessar https://supabase.com e criar novo projeto
- Configurar região (recomendado: São Paulo - sa-east-1)
- Salvar as credenciais: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### 1.2 Variáveis de Ambiente Necessárias
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1... (apenas servidor)
```

## 2. Estrutura do Banco de Dados

### 2.1 Tabela: `customers` (Clientes)
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  document TEXT, -- CPF para pagamentos brasileiros
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Dados do Replit Auth (se migrar)
  replit_id TEXT UNIQUE,
  profile_image_url TEXT,
  
  -- Metadados
  last_login_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_replit_id ON customers(replit_id);
```

### 2.2 Tabela: `subscriptions` (Assinaturas)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Status da assinatura
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, canceled, past_due
  plan TEXT NOT NULL DEFAULT 'free', -- free, premium
  
  -- Período
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Preço
  price_cents INTEGER DEFAULT 1500, -- R$ 15,00 em centavos
  currency TEXT DEFAULT 'BRL',
  
  -- Gateway de pagamento (Stripe, PagSeguro, etc.)
  payment_gateway TEXT,
  external_subscription_id TEXT, -- ID no gateway
  
  -- Cancelamento
  canceled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 2.3 Tabela: `payments` (Pagamentos)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Valores
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  
  -- Status
  status TEXT NOT NULL, -- pending, paid, failed, refunded
  payment_method TEXT, -- credit_card, pix, boleto
  
  -- Gateway
  payment_gateway TEXT NOT NULL, -- stripe, pagseguro, mercadopago
  external_payment_id TEXT,
  external_invoice_id TEXT,
  
  -- Datas
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Metadados
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 2.4 Tabela: `usage_logs` (Logs de Uso - para limites)
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Tipo de uso
  action_type TEXT NOT NULL, -- calculation, explanation, formula_use
  
  -- Período (para controle de limites)
  period_date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  
  -- Metadados
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único para contagem diária
CREATE UNIQUE INDEX idx_usage_daily ON usage_logs(customer_id, action_type, period_date);
CREATE INDEX idx_usage_customer ON usage_logs(customer_id);
```

### 2.5 Tabela: `calculation_history` (Histórico - migrar da atual)
```sql
CREATE TABLE calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  expression TEXT NOT NULL,
  result TEXT NOT NULL,
  explanation JSONB, -- Array de passos
  formula_used TEXT, -- ID da fórmula se aplicável
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_customer ON calculation_history(customer_id);
```

## 3. Row Level Security (RLS)

### 3.1 Políticas de Segurança
```sql
-- Customers: usuário só vê seu próprio registro
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions: usuário só vê sua própria assinatura
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (customer_id = auth.uid());

-- Payments: usuário só vê seus próprios pagamentos
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (customer_id = auth.uid());

-- Usage logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_logs FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own usage"
  ON usage_logs FOR INSERT
  WITH CHECK (customer_id = auth.uid());
```

## 4. Integração com Gateway de Pagamento

### 4.1 Opções Recomendadas para Brasil
1. **Stripe** (internacional, aceita cartões e alguns métodos BR)
2. **PagSeguro** (popular no Brasil, PIX, boleto)
3. **Mercado Pago** (PIX, boleto, cartão)
4. **Asaas** (focado em recorrência)

### 4.2 Webhooks Necessários
```javascript
// Endpoints para receber webhooks
POST /api/webhooks/stripe
POST /api/webhooks/pagseguro

// Eventos importantes:
// - payment_intent.succeeded
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.paid
// - invoice.payment_failed
```

## 5. Fluxo de Assinatura

### 5.1 Novo Usuário
```
1. Usuário clica "Assinar Premium"
2. Frontend cria sessão de checkout no gateway
3. Gateway processa pagamento
4. Webhook atualiza Supabase
5. Usuário ganha acesso Premium
```

### 5.2 Renovação Automática
```
1. Gateway cobra automaticamente
2. Webhook recebe confirmação
3. Atualiza period_end em subscriptions
4. Log de pagamento criado
```

### 5.3 Cancelamento
```
1. Usuário clica "Cancelar"
2. API marca cancel_at_period_end = true
3. Acesso mantido até period_end
4. Após expirar, status = 'canceled'
```

## 6. Limites do Plano Free

### 6.1 Implementação de Limites
```javascript
// Verificar limite antes de cada ação
async function checkUsageLimit(customerId, actionType) {
  const { data } = await supabase
    .from('usage_logs')
    .select('count')
    .eq('customer_id', customerId)
    .eq('action_type', actionType)
    .eq('period_date', new Date().toISOString().split('T')[0])
    .single();
  
  const limits = {
    calculation: 50,    // 50 cálculos/dia
    explanation: 10,    // 10 explicações/dia
    formula_use: 5      // 5 fórmulas/dia
  };
  
  return (data?.count || 0) < limits[actionType];
}
```

### 6.2 Limites Sugeridos
| Recurso | Free | Premium |
|---------|------|---------|
| Cálculos/dia | 50 | Ilimitado |
| Explicações/dia | 10 | Ilimitado |
| Fórmulas básicas | Sim | Sim |
| Fórmulas avançadas | Não | Sim |
| Histórico | 10 itens | Ilimitado |

## 7. Migração de Dados

### 7.1 Migrar Usuários Existentes
```sql
-- Migrar usuários do PostgreSQL atual para Supabase
INSERT INTO customers (replit_id, email, name, created_at)
SELECT id, email, first_name, created_at
FROM current_users;

-- Migrar planos
INSERT INTO subscriptions (customer_id, plan, status)
SELECT c.id, u.plan, CASE WHEN u.plan = 'premium' THEN 'active' ELSE 'inactive' END
FROM customers c
JOIN current_users u ON c.replit_id = u.id;
```

## 8. Estimativa de Implementação

### Fase 1: Setup (1-2 dias)
- [ ] Criar projeto Supabase
- [ ] Criar tabelas e políticas RLS
- [ ] Configurar variáveis de ambiente

### Fase 2: Integração Gateway (3-5 dias)
- [ ] Escolher e configurar gateway (Stripe recomendado)
- [ ] Implementar checkout
- [ ] Configurar webhooks
- [ ] Testar fluxo de pagamento

### Fase 3: Backend (2-3 dias)
- [ ] Migrar autenticação para Supabase Auth
- [ ] Implementar APIs de assinatura
- [ ] Implementar controle de limites
- [ ] Webhooks para processar pagamentos

### Fase 4: Frontend (2-3 dias)
- [ ] Tela de pagamento
- [ ] Gerenciamento de assinatura
- [ ] Exibição de limites de uso
- [ ] Portal do cliente

### Fase 5: Migração (1-2 dias)
- [ ] Migrar dados existentes
- [ ] Testes end-to-end
- [ ] Deploy em produção

## 9. Custos Estimados

### Supabase
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/mês (8GB database, 50GB bandwidth)

### Gateway de Pagamento
- Stripe: 2.9% + $0.30 por transação
- PagSeguro: ~4% por transação
- PIX via gateway: ~1% por transação

### Estimativa Mensal (100 assinantes)
- Receita: 100 × R$15 = R$1.500
- Supabase Pro: ~R$130
- Gateway (4%): ~R$60
- Lucro estimado: ~R$1.310

## 10. Próximos Passos

1. Confirmar escolha do gateway de pagamento
2. Criar conta no Supabase
3. Implementar Fase 1 (Setup)
4. Testar integração em ambiente de desenvolvimento
5. Implementar fases seguintes incrementalmente
