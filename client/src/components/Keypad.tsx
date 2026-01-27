import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calculator, RotateCcw, Variable } from "lucide-react";

interface KeypadProps {
  onPress: (key: string, type: 'number' | 'operator' | 'function' | 'scientific') => void;
  className?: string;
}

export function Keypad({ onPress, className }: KeypadProps) {
  // Button Configuration
  const buttons = [
    // Row 1
    { label: "AC", type: "function", action: "AC", style: "calc-btn-function" },
    { label: "DEL", type: "function", action: "DEL", style: "calc-btn-function" },
    { label: "%", type: "operator", action: "%", style: "calc-btn-function" },
    { label: "÷", type: "operator", action: "/", style: "calc-btn-operator" },

    // Row 2
    { label: "7", type: "number", action: "7", style: "calc-btn-number" },
    { label: "8", type: "number", action: "8", style: "calc-btn-number" },
    { label: "9", type: "number", action: "9", style: "calc-btn-number" },
    { label: "×", type: "operator", action: "*", style: "calc-btn-operator" },

    // Row 3
    { label: "4", type: "number", action: "4", style: "calc-btn-number" },
    { label: "5", type: "number", action: "5", style: "calc-btn-number" },
    { label: "6", type: "number", action: "6", style: "calc-btn-number" },
    { label: "−", type: "operator", action: "-", style: "calc-btn-operator" },

    // Row 4
    { label: "1", type: "number", action: "1", style: "calc-btn-number" },
    { label: "2", type: "number", action: "2", style: "calc-btn-number" },
    { label: "3", type: "number", action: "3", style: "calc-btn-number" },
    { label: "+", type: "operator", action: "+", style: "calc-btn-operator" },

    // Row 5
    { label: "0", type: "number", action: "0", style: "calc-btn-number col-span-2 aspect-[2.1/1] rounded-[40px] pl-8 justify-start" },
    { label: ".", type: "number", action: ".", style: "calc-btn-number" },
    { label: "=", type: "function", action: "=", style: "calc-btn-operator" },
  ];

  const scientificButtons = [
    { label: "sin", type: "scientific", action: "sin", display: "sin" },
    { label: "cos", type: "scientific", action: "cos", display: "cos" },
    { label: "tan", type: "scientific", action: "tan", display: "tan" },
    { label: "√", type: "scientific", action: "sqrt", display: "√" },
    { label: "^", type: "operator", action: "^", display: "xʸ" },
    { label: "(", type: "operator", action: "(", display: "(" },
    { label: ")", type: "operator", action: ")", display: ")" },
    { label: "log", type: "scientific", action: "log", display: "log" },
  ];

  return (
    <div className={cn("flex flex-col h-full w-full gap-4", className)}>
      {/* Scientific Row (scrollable on mobile) */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-6 no-scrollbar snap-x">
        {scientificButtons.map((btn) => (
          <motion.button
            key={btn.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPress(btn.action, btn.type as any)}
            className="flex-shrink-0 w-16 h-10 rounded-full bg-zinc-800 text-white font-medium text-sm flex items-center justify-center snap-start border border-zinc-700 hover:bg-zinc-700"
          >
            {btn.display}
          </motion.button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-4 gap-3 px-4 pb-8 flex-1 content-end">
        {buttons.map((btn) => (
          <motion.button
            key={btn.label}
            onClick={() => onPress(btn.action, btn.type as any)}
            className={cn("calc-btn aspect-square", btn.style)}
            whileHover={{ filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.92 }}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
