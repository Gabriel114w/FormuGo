import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Trash2 } from "lucide-react";
import { type HistoryItem } from "@shared/schema";
import { cn } from "@/lib/utils";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryDrawer({ isOpen, onClose, history, onSelect, onClear }: HistoryDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fundo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Gaveta */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold font-display">Histórico</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClear}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Limpar Histórico"
                  data-testid="button-clear-history"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  data-testid="button-close-history"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                  <Clock className="w-12 h-12 opacity-20" />
                  <p>Nenhum cálculo ainda</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`history-${item.id}`}
                    onClick={() => onSelect(item)}
                    className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 cursor-pointer transition-all group"
                    data-testid={`history-item-${item.id}`}
                  >
                    <div className="text-zinc-400 font-mono text-sm mb-1">{item.expression}</div>
                    <div className="text-white text-2xl font-light font-display group-hover:text-orange-400 transition-colors">
                      = {item.result}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
