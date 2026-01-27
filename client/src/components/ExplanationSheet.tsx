import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  steps: string[];
  expression: string;
  result: string;
}

export function ExplanationSheet({ isOpen, onClose, steps, expression, result }: ExplanationSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 h-[85vh] bg-zinc-900 rounded-t-3xl z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Explicação</h2>
                  <p className="text-sm text-zinc-400">Solução passo a passo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                data-testid="button-close-explanation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-black/20">
              {/* Enunciado do Problema */}
              <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-800">
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Problema</h3>
                <div className="text-3xl font-light text-white font-mono">{expression}</div>
              </div>

              {/* Passos */}
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/>
                  Passos da Solução
                </h3>
                
                <div className="relative border-l-2 border-zinc-800 pl-8 space-y-8 ml-3">
                  {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <span className={cn(
                          "absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-zinc-900",
                          isLast ? "bg-green-500" : "bg-zinc-700"
                        )} />
                        
                        <div className={cn(
                          "p-4 rounded-xl border",
                          isLast 
                            ? "bg-green-500/10 border-green-500/20 text-green-100" 
                            : "bg-zinc-800/30 border-zinc-800 text-zinc-300"
                        )}>
                          <div className="font-mono text-lg">{step}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              
              <div className="h-12" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
