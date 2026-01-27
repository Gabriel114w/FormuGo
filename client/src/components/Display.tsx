import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisplayProps {
  expression: string;
  result: string;
  onExplain?: () => void;
  showExplainButton?: boolean;
}

export function Display({ expression, result, onExplain, showExplainButton }: DisplayProps) {
  return (
    <div className="flex flex-col items-end justify-end p-6 md:p-8 w-full h-[30vh] min-h-[180px] text-right space-y-2 select-none">
      {/* Expressão (Histórico do cálculo atual) */}
      <motion.div 
        className="text-muted-foreground font-mono text-lg md:text-xl truncate w-full"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {expression || "\u00A0"}
      </motion.div>

      {/* Resultado Principal */}
      <div className="relative w-full flex items-center justify-end">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={result}
            initial={{ opacity: 0.5, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "text-6xl md:text-8xl font-light tracking-tight text-white truncate w-full",
              result.length > 9 && "text-4xl md:text-6xl",
              result.length > 15 && "text-2xl md:text-4xl"
            )}
          >
            {result || "0"}
          </motion.div>
        </AnimatePresence>
        
        {/* Botão de Explicação */}
        {showExplainButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onExplain}
            className="absolute left-0 bottom-2 p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            title="Explicar este cálculo"
            data-testid="button-explain"
          >
            <Info className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
