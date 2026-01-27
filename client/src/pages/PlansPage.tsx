import { Check, Crown, Zap, Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PlanFeature {
  text: string;
  included: boolean;
}

const freePlanFeatures: PlanFeature[] = [
  { text: "Calculadora básica", included: true },
  { text: "Operações fundamentais (+, -, *, /)", included: true },
  { text: "Histórico limitado (10 cálculos)", included: true },
  { text: "Guia de operadores", included: true },
  { text: "Fórmulas científicas", included: false },
  { text: "Explicações detalhadas ilimitadas", included: false },
  { text: "Calculadora de fórmulas", included: false },
  { text: "Sem anúncios", included: false },
];

const premiumPlanFeatures: PlanFeature[] = [
  { text: "Calculadora científica completa", included: true },
  { text: "Todas as operações e funções", included: true },
  { text: "Histórico ilimitado", included: true },
  { text: "Guia de operadores completo", included: true },
  { text: "25+ fórmulas do ensino médio", included: true },
  { text: "Explicações passo a passo", included: true },
  { text: "Calculadora interativa de fórmulas", included: true },
  { text: "Sem anúncios", included: true },
];

export default function PlansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const selectPlan = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest("POST", "/api/user/plan", { plan });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Plano selecionado!",
        description: data.plan === "premium" 
          ? "Bem-vindo ao CalcEdu Premium!" 
          : "Plano gratuito ativado com sucesso.",
      });
      setLocation("/calculator");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível selecionar o plano. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-y-auto">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/80 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">CalcEdu</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              {user.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-zinc-400">
                {user.firstName || user.email}
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu plano
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Selecione o plano ideal para você. Você pode mudar a qualquer momento.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-zinc-800 rounded-xl">
                <Zap className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Free</h2>
                <p className="text-zinc-500 text-sm">Plano gratuito</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 0</span>
              <span className="text-zinc-500">/mês</span>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {freePlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                  )}
                  <span className={feature.included ? "text-zinc-300" : "text-zinc-600"}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full py-6 border-zinc-700 hover:bg-zinc-800"
              onClick={() => selectPlan.mutate("free")}
              disabled={selectPlan.isPending}
              data-testid="button-select-free"
            >
              {selectPlan.isPending ? "Processando..." : "Selecionar Gratuito"}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border-2 border-orange-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Crown className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Premium</h2>
                <p className="text-orange-400/70 text-sm">Acesso completo</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 15</span>
              <span className="text-zinc-400">/mês</span>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {premiumPlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-zinc-200">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-bold"
              onClick={() => selectPlan.mutate("premium")}
              disabled={selectPlan.isPending}
              data-testid="button-select-premium"
            >
              {selectPlan.isPending ? "Processando..." : "Assinar Premium"}
            </Button>
          </motion.div>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-8 max-w-md">
          O pagamento do plano Premium será configurado em breve. 
          Por enquanto, você pode testar todas as funcionalidades.
        </p>
      </main>
    </div>
  );
}
