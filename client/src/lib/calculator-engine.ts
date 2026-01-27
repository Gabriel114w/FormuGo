// Avaliador customizado com explicações passo-a-passo em Português
// Suporta PEMDAS e algumas funções científicas

export type Step = string;

export interface CalculationResult {
  value: string;
  steps: Step[];
  error?: string;
}

// Tipos de token
type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'FUNCTION';

interface Token {
  type: TokenType;
  value: string;
}

// Mapeamento de precedência
const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 3,
  'sqrt': 4,
  'log': 4,
  'sin': 4,
  'cos': 4,
  'tan': 4,
  '!': 4,
};

// Fecha parênteses automaticamente
function autoCloseParentheses(expr: string): string {
  let openCount = 0;
  for (const char of expr) {
    if (char === '(') openCount++;
    if (char === ')') openCount--;
  }
  // Adiciona os parênteses faltantes no final
  if (openCount > 0) {
    return expr + ')'.repeat(openCount);
  }
  return expr;
}

// Função principal de avaliação
export function evaluateExpression(expression: string): CalculationResult {
  const steps: Step[] = [];
  try {
    // Fecha parênteses automaticamente se esquecidos
    const fixedExpression = autoCloseParentheses(expression);
    
    const tokens = tokenize(fixedExpression);
    const rpn = shuntingYard(tokens);
    const result = solveRPN(rpn, steps);
    
    // Formata o resultado para evitar decimais muito longos
    let finalValue = Number(result);
    if (!isFinite(finalValue)) throw new Error("Resultado indefinido");
    
    // Corrige erros de ponto flutuante (ex: 0.1 + 0.2 = 0.30000000000000004)
    const stringResult = parseFloat(finalValue.toPrecision(12)).toString();
    
    steps.push(`Resultado Final: ${stringResult}`);
    
    return { value: stringResult, steps };
  } catch (e: any) {
    return { value: "Erro", steps: [], error: e.message };
  }
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  // Limpa a expressão
  expr = expr.replace(/\s+/g, '');

  while (i < expr.length) {
    const char = expr[i];

    if (/[0-9.]/.test(char)) {
      let num = char;
      i++;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num });
    } else if (/[a-z]/.test(char)) {
      let func = char;
      i++;
      while (i < expr.length && /[a-z]/.test(expr[i])) {
        func += expr[i];
        i++;
      }
      tokens.push({ type: 'FUNCTION', value: func });
    } else if ('+-*/^%!'.includes(char)) {
      // Trata números negativos no início ou após operador/parêntese
      if (char === '-' && (tokens.length === 0 || tokens[tokens.length-1].type === 'OPERATOR' || tokens[tokens.length-1].type === 'LPAREN')) {
         tokens.push({ type: 'FUNCTION', value: 'neg' });
         i++;
         continue;
      }

      tokens.push({ type: 'OPERATOR', value: char });
      i++;
    } else if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
    } else {
      throw new Error(`Caractere desconhecido: ${char}`);
    }
  }
  return tokens;
}

function shuntingYard(tokens: Token[]): Token[] {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'FUNCTION') {
      operatorStack.push(token);
    } else if (token.type === 'OPERATOR') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'LPAREN' &&
        (operatorStack[operatorStack.length - 1].type === 'FUNCTION' ||
        PRECEDENCE[operatorStack[operatorStack.length - 1].value] >= PRECEDENCE[token.value])
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) throw new Error("Parênteses desbalanceados");
      operatorStack.pop();
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op.type === 'LPAREN') throw new Error("Parênteses desbalanceados");
    outputQueue.push(op);
  }

  return outputQueue;
}

function solveRPN(rpn: Token[], steps: Step[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'OPERATOR' || token.type === 'FUNCTION') {
      const op = token.value;
      
      // Operações unárias
      if (['sqrt', 'log', 'sin', 'cos', 'tan', '!', 'neg'].includes(op)) {
        if (stack.length < 1) throw new Error("Expressão inválida");
        const a = stack.pop()!;
        let res = 0;
        let desc = "";

        switch (op) {
          case 'sqrt': 
            res = Math.sqrt(a); 
            desc = `A raiz quadrada de ${a} é ${format(res)}`; 
            break;
          case 'log': 
            res = Math.log10(a); 
            desc = `O logaritmo base 10 de ${a} é ${format(res)}`; 
            break;
          case 'sin': 
            res = Math.sin(a * Math.PI / 180); 
            desc = `O seno de ${a}° é ${format(res)}`; 
            break;
          case 'cos': 
            res = Math.cos(a * Math.PI / 180); 
            desc = `O cosseno de ${a}° é ${format(res)}`; 
            break;
          case 'tan': 
            res = Math.tan(a * Math.PI / 180); 
            desc = `A tangente de ${a}° é ${format(res)}`; 
            break;
          case '!': 
            res = factorial(a); 
            desc = `O fatorial de ${a} (${a}!) é ${format(res)}`; 
            break;
          case 'neg': 
            res = -a; 
            desc = `O negativo de ${a} é ${format(res)}`; 
            break;
        }
        
        stack.push(res);
        steps.push(desc);
        
      } else {
        // Operações binárias
        if (stack.length < 2) throw new Error("Expressão inválida");
        const b = stack.pop()!;
        const a = stack.pop()!;
        let res = 0;
        let desc = "";
        
        switch (op) {
          case '+': 
            res = a + b; 
            desc = `Somamos ${format(a)} + ${format(b)} = ${format(res)}`;
            break;
          case '-': 
            res = a - b; 
            desc = `Subtraímos ${format(a)} - ${format(b)} = ${format(res)}`;
            break;
          case '*': 
            res = a * b; 
            desc = `Multiplicamos ${format(a)} × ${format(b)} = ${format(res)}`;
            break;
          case '/': 
            if (b === 0) throw new Error("Divisão por zero não é permitida");
            res = a / b; 
            desc = `Dividimos ${format(a)} ÷ ${format(b)} = ${format(res)}`;
            break;
          case '%': 
            res = a % b; 
            desc = `O resto da divisão de ${format(a)} por ${format(b)} é ${format(res)}`;
            break;
          case '^': 
            res = Math.pow(a, b); 
            desc = `${format(a)} elevado a ${format(b)} = ${format(res)}`;
            break;
        }
        
        stack.push(res);
        steps.push(desc);
      }
    }
  }

  if (stack.length !== 1) throw new Error("Expressão inválida");
  return stack[0];
}

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function format(n: number): string {
  const str = parseFloat(n.toPrecision(10)).toString();
  return str;
}
