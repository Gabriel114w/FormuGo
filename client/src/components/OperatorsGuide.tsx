import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Calculator, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperatorsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OperatorInfo {
  symbol: string;
  name: string;
  description: string;
  example: string;
  result: string;
  whenToUse: string;
  realWorldExample: string;
}

const operators: OperatorInfo[] = [
  {
    symbol: "+",
    name: "Adição",
    description: "Soma dois ou mais valores.",
    example: "5 + 3",
    result: "8",
    whenToUse: "Quando você precisa juntar quantidades.",
    realWorldExample: "Você comprou 5 maçãs e ganhou mais 3. Total: 5 + 3 = 8 maçãs."
  },
  {
    symbol: "−",
    name: "Subtração",
    description: "Remove um valor de outro.",
    example: "10 - 4",
    result: "6",
    whenToUse: "Quando você precisa tirar uma quantidade de outra.",
    realWorldExample: "Você tinha R$10 e gastou R$4. Sobrou: 10 - 4 = R$6."
  },
  {
    symbol: "×",
    name: "Multiplicação",
    description: "Soma repetida de um mesmo número.",
    example: "4 × 3",
    result: "12",
    whenToUse: "Quando você tem grupos iguais de coisas.",
    realWorldExample: "3 caixas com 4 lápis cada: 4 × 3 = 12 lápis no total."
  },
  {
    symbol: "÷",
    name: "Divisão",
    description: "Divide um valor em partes iguais.",
    example: "15 ÷ 3",
    result: "5",
    whenToUse: "Quando você quer repartir algo igualmente.",
    realWorldExample: "15 balas divididas entre 3 amigos: 15 ÷ 3 = 5 balas para cada."
  },
  {
    symbol: "^",
    name: "Potenciação",
    description: "Multiplica um número por ele mesmo várias vezes.",
    example: "2^3",
    result: "8",
    whenToUse: "Para calcular áreas, volumes ou crescimento exponencial.",
    realWorldExample: "Área de um quadrado de lado 5: 5^2 = 25 m²."
  },
  {
    symbol: "√",
    name: "Raiz Quadrada",
    description: "Encontra qual número, multiplicado por si mesmo, dá o valor.",
    example: "√16",
    result: "4",
    whenToUse: "Para descobrir o lado de um quadrado conhecendo a área.",
    realWorldExample: "Um quadrado de área 25m²: √25 = 5m de lado."
  },
  {
    symbol: "%",
    name: "Resto da Divisão",
    description: "O que sobra após dividir um número por outro.",
    example: "17 % 5",
    result: "2",
    whenToUse: "Para verificar divisibilidade ou distribuir sobras.",
    realWorldExample: "17 chocolates entre 5 pessoas: cada um leva 3 e sobram 2."
  },
  {
    symbol: "log",
    name: "Logaritmo (base 10)",
    description: "Responde: 'A qual potência devo elevar 10 para obter este número?'",
    example: "log(100)",
    result: "2",
    whenToUse: "Para medir ordens de grandeza (terremotos, som, pH).",
    realWorldExample: "Um terremoto de magnitude 6 é 10x mais forte que um de magnitude 5."
  },
  {
    symbol: "sin",
    name: "Seno",
    description: "Razão trigonométrica: cateto oposto / hipotenusa.",
    example: "sin(30)",
    result: "0.5",
    whenToUse: "Para calcular alturas, distâncias e ângulos em triângulos.",
    realWorldExample: "Uma rampa de 10m com inclinação de 30°: altura = 10 × sin(30°) = 5m."
  },
  {
    symbol: "cos",
    name: "Cosseno",
    description: "Razão trigonométrica: cateto adjacente / hipotenusa.",
    example: "cos(60)",
    result: "0.5",
    whenToUse: "Para calcular projeções horizontais e trabalho em física.",
    realWorldExample: "Sombra de um poste de 10m quando o sol está a 60°: 10 × cos(60°) = 5m."
  },
  {
    symbol: "tan",
    name: "Tangente",
    description: "Razão trigonométrica: cateto oposto / cateto adjacente.",
    example: "tan(45)",
    result: "1",
    whenToUse: "Para calcular inclinações e ângulos de elevação.",
    realWorldExample: "Inclinação de uma ladeira: se sobe 3m a cada 3m horizontal, tan = 1 (45°)."
  },
  {
    symbol: "!",
    name: "Fatorial",
    description: "Multiplica todos os números inteiros de 1 até n.",
    example: "5!",
    result: "120",
    whenToUse: "Para calcular combinações e permutações.",
    realWorldExample: "De quantas formas 5 pessoas podem sentar em fila? 5! = 120 formas."
  },
  {
    symbol: "( )",
    name: "Parênteses",
    description: "Define a ordem de execução das operações.",
    example: "(2 + 3) × 4",
    result: "20",
    whenToUse: "Para garantir que uma operação seja feita primeiro.",
    realWorldExample: "Preço total: (quantidade + bônus) × preço unitário."
  }
];

export function OperatorsGuide({ isOpen, onClose }: OperatorsGuideProps) {
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
            className="fixed inset-x-0 bottom-0 h-[90vh] bg-zinc-900 rounded-t-3xl z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Guia de Operadores</h2>
                  <p className="text-sm text-zinc-400">Aprenda quando e como usar cada um</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                data-testid="button-close-guide"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {operators.map((op, index) => (
                <motion.div
                  key={op.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-zinc-800/50 rounded-2xl border border-zinc-800 overflow-hidden"
                >
                  {/* Cabeçalho do operador */}
                  <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl font-bold text-orange-400">
                      {op.symbol}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{op.name}</h3>
                      <p className="text-sm text-zinc-400">{op.description}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Exemplo */}
                    <div className="flex items-center gap-3">
                      <Calculator className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Exemplo:</span>
                        <code className="px-2 py-1 bg-zinc-900 rounded text-blue-300 font-mono">{op.example}</code>
                        <span className="text-zinc-500">=</span>
                        <code className="px-2 py-1 bg-green-500/20 rounded text-green-300 font-mono">{op.result}</code>
                      </div>
                    </div>

                    {/* Quando usar */}
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-zinc-400">Quando usar: </span>
                        <span className="text-zinc-200">{op.whenToUse}</span>
                      </div>
                    </div>

                    {/* Exemplo do mundo real */}
                    <div className="bg-zinc-900/50 rounded-xl p-3 border-l-2 border-orange-500/50">
                      <p className="text-sm text-zinc-300 italic">
                        {op.realWorldExample}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="h-8" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
