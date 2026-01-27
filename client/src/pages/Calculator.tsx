import { useState, useCallback } from "react";
import { History, BookOpen, GraduationCap, LogOut, Crown } from "lucide-react";
import { motion } from "framer-motion";

import { Display } from "@/components/Display";
import { Keypad } from "@/components/Keypad";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { ExplanationSheet } from "@/components/ExplanationSheet";
import { OperatorsGuide } from "@/components/OperatorsGuide";
import { FormulasGuide } from "@/components/FormulasGuide";
import { FormulaCalculator } from "@/components/FormulaCalculator";
import { useHistory, useCreateHistory, useClearHistory } from "@/hooks/use-history";
import { evaluateExpression } from "@/lib/calculator-engine";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function CalculatorPage() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [lastSteps, setLastSteps] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);

  const { data: history = [] } = useHistory();
  const createHistory = useCreateHistory();
  const clearHistory = useClearHistory();
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePress = useCallback((key: string, type: 'number' | 'operator' | 'function' | 'scientific') => {
    if (type === 'function') {
      if (key === 'AC') {
        setExpression("");
        setResult("0");
        setLastSteps([]);
        setCalculated(false);
        return;
      }
      if (key === 'DEL') {
        if (calculated) {
          setExpression("");
          setCalculated(false);
        } else {
          setExpression((prev) => prev.slice(0, -1));
        }
        return;
      }
      if (key === '=') {
        if (!expression) return;
        
        const { value, steps, error } = evaluateExpression(expression);
        
        if (error) {
          toast({
            title: "Erro",
            description: error,
            variant: "destructive",
          });
          setResult("Erro");
        } else {
          setResult(value);
          setLastSteps(steps);
          setCalculated(true);
          
          // Salva no backend
          createHistory.mutate({
            expression: expression,
            result: value,
            explanation: steps
          });
        }
        return;
      }
    }

    // Lógica de auto-limpar: se acabamos de calcular e digitamos um número, começamos do zero.
    // Se digitamos operador, continuamos com o resultado.
    if (calculated) {
      if (type === 'number' || key === 'sin' || key === 'cos' || key === 'tan' || key === 'log' || key === 'sqrt') {
        setExpression(key === 'scientific' ? `${key}(` : key);
        setCalculated(false);
      } else if (type === 'operator') {
        setExpression(result + key);
        setCalculated(false);
      }
      return;
    }

    if (type === 'scientific') {
      setExpression((prev) => prev + key + '(');
    } else {
      setExpression((prev) => prev + key);
    }
  }, [expression, result, calculated, createHistory, toast]);

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden relative">
      {/* Cabeçalho / Navegação */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-3 bg-zinc-900/50 backdrop-blur rounded-full hover:bg-zinc-800 transition-colors"
            data-testid="button-history"
            title="Histórico"
          >
            <History className="w-5 h-5 text-zinc-400" />
          </button>
          {user?.plan === "premium" && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
              <Crown className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-orange-400">Premium</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="p-3 bg-zinc-900/50 backdrop-blur rounded-full hover:bg-zinc-800 transition-colors"
            data-testid="button-guide"
            title="Guia de Operadores"
          >
            <BookOpen className="w-5 h-5 text-orange-400" />
          </button>
          <button 
            onClick={() => setIsFormulasOpen(true)}
            className="p-3 bg-zinc-900/50 backdrop-blur rounded-full hover:bg-zinc-800 transition-colors"
            data-testid="button-formulas"
            title="Fórmulas do Ensino Médio"
          >
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </button>
          <a 
            href="/api/logout"
            className="p-3 bg-zinc-900/50 backdrop-blur rounded-full hover:bg-zinc-800 transition-colors"
            data-testid="button-logout"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-zinc-400" />
          </a>
        </div>
      </div>

      {/* Área Principal do Display */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full h-full">
        <Display 
          expression={expression} 
          result={result} 
          showExplainButton={calculated && lastSteps.length > 0}
          onExplain={() => setIsExplainOpen(true)}
        />
        
        <div className="flex-1 bg-black pb-6 pt-2 rounded-t-[32px] shadow-[0_-10px_40px_rgba(255,255,255,0.05)] border-t border-white/5">
           <Keypad onPress={handlePress} />
        </div>
      </main>

      {/* Overlays */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setExpression(item.expression);
          setResult(item.result);
          setLastSteps(item.explanation as string[]);
          setCalculated(true);
          setIsHistoryOpen(false);
        }}
        onClear={() => clearHistory.mutate()}
      />

      <ExplanationSheet 
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        steps={lastSteps}
        expression={expression}
        result={result}
      />

      <OperatorsGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <FormulasGuide
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
        onSelectFormula={(formulaId) => {
          setSelectedFormula(formulaId);
        }}
      />

      <FormulaCalculator
        isOpen={selectedFormula !== null}
        onClose={() => setSelectedFormula(null)}
        formulaId={selectedFormula}
      />
    </div>
  );
}
