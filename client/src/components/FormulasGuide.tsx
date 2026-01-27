import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Calculator, Lightbulb, AlertTriangle, ChevronDown, ChevronUp, Play, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { availableFormulas, premiumFormulas } from "./FormulaCalculator";
import { useAuth } from "@/hooks/use-auth";

interface FormulasGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula?: (formulaId: string) => void;
}

interface Formula {
  id: string;
  name: string;
  formula: string;
  premium?: boolean;
  whenToUse: string;
  examples: string[];
  howToUse: {
    variables: string;
    steps: string[];
    solvedExample: {
      problem: string;
      solution: string[];
      answer: string;
    };
  };
  calculatorUsage: string;
  tips?: string[];
  commonErrors?: string[];
}

interface AreaData {
  name: string;
  icon: string;
  color: string;
  formulas: Formula[];
}

const areasData: AreaData[] = [
  {
    name: "Matemática",
    icon: "📐",
    color: "blue",
    formulas: [
      {
        id: "bhaskara",
        name: "Equação do 2º grau (Bhaskara)",
        formula: "x = (-b ± √(b² - 4ac)) / 2a",
        whenToUse: "Quando você precisa encontrar os valores de x em uma equação do tipo ax² + bx + c = 0.",
        examples: ["Encontrar as raízes de x² - 5x + 6 = 0", "Calcular quando uma bola lançada para cima atinge o solo"],
        howToUse: {
          variables: "a = coeficiente de x², b = coeficiente de x, c = termo independente",
          steps: ["Identifique os valores de a, b e c", "Calcule Δ = b² - 4ac", "Aplique a fórmula de Bhaskara"],
          solvedExample: { problem: "x² - 5x + 6 = 0", solution: ["a=1, b=-5, c=6", "Δ = 25-24 = 1"], answer: "x = 2 ou x = 3" }
        },
        calculatorUsage: "Digite os valores de a, b e c",
        tips: ["Se Δ < 0, não existem raízes reais"]
      },
      {
        id: "funcao-afim",
        name: "Função afim",
        formula: "f(x) = ax + b",
        whenToUse: "Para modelar situações com crescimento ou decrescimento constante.",
        examples: ["Preço de táxi", "Salário com comissão"],
        howToUse: {
          variables: "a = taxa de variação, b = valor inicial",
          steps: ["Identifique a e b", "Monte f(x) = ax + b", "Substitua x"],
          solvedExample: { problem: "Táxi: R$5 + R$2/km, 10 km?", solution: ["f(x) = 2x + 5", "f(10) = 25"], answer: "R$ 25" }
        },
        calculatorUsage: "Digite a, b e x"
      },
      {
        id: "funcao-exponencial",
        name: "Função exponencial",
        formula: "f(x) = a · bˣ",
        whenToUse: "Para crescimento ou decrescimento exponencial.",
        examples: ["Crescimento populacional", "Juros compostos"],
        howToUse: {
          variables: "a = valor inicial, b = fator, x = tempo",
          steps: ["Identifique a, b e x", "Calcule a × bˣ"],
          solvedExample: { problem: "100 bactérias, dobra/hora, 3h?", solution: ["f(3) = 100 × 2³"], answer: "800" }
        },
        calculatorUsage: "Digite a, b e x"
      },
      {
        id: "funcao-log",
        name: "Função logarítmica",
        formula: "log_b(x) = y",
        whenToUse: "Para encontrar expoentes.",
        examples: ["Escala Richter", "pH"],
        howToUse: {
          variables: "b = base, x = número",
          steps: ["Use log base 10"],
          solvedExample: { problem: "log(1000)?", solution: ["10³ = 1000"], answer: "3" }
        },
        calculatorUsage: "Use log(x) na calculadora"
      },
      {
        id: "area-triangulo",
        name: "Área do triângulo",
        formula: "A = (b × h) / 2",
        whenToUse: "Para calcular área de triângulos.",
        examples: ["Terreno triangular", "Parede triangular"],
        howToUse: {
          variables: "b = base, h = altura",
          steps: ["Multiplique base × altura", "Divida por 2"],
          solvedExample: { problem: "Base 6, altura 4", solution: ["A = 24/2"], answer: "12 cm²" }
        },
        calculatorUsage: "Digite base e altura"
      },
      {
        id: "area-circulo",
        name: "Área do círculo",
        formula: "A = π × r²",
        whenToUse: "Para calcular área de círculos.",
        examples: ["Pizza", "Piscina circular"],
        howToUse: {
          variables: "r = raio",
          steps: ["Eleve raio ao quadrado", "Multiplique por π"],
          solvedExample: { problem: "Raio 5 cm", solution: ["A = π × 25"], answer: "≈ 78,5 cm²" }
        },
        calculatorUsage: "Digite o raio"
      },
      {
        id: "circunferencia",
        name: "Circunferência",
        formula: "C = 2 × π × r",
        whenToUse: "Para calcular perímetro do círculo.",
        examples: ["Cerca circular", "Pneu"],
        howToUse: {
          variables: "r = raio",
          steps: ["Multiplique 2 × π × raio"],
          solvedExample: { problem: "Raio 7 m", solution: ["C = 2π × 7"], answer: "≈ 44 m" }
        },
        calculatorUsage: "Digite o raio"
      },
      {
        id: "pitagoras",
        name: "Teorema de Pitágoras",
        formula: "a² = b² + c²",
        whenToUse: "Para triângulos retângulos.",
        examples: ["Diagonal de TV", "Escada na parede"],
        howToUse: {
          variables: "a = hipotenusa, b e c = catetos",
          steps: ["Some os quadrados dos catetos", "Tire a raiz"],
          solvedExample: { problem: "Catetos 3 e 4", solution: ["a² = 9 + 16 = 25"], answer: "a = 5" }
        },
        calculatorUsage: "Digite os catetos"
      },
      {
        id: "rel-trig",
        name: "Relação fundamental da trigonometria",
        formula: "sen²θ + cos²θ = 1",
        whenToUse: "Para encontrar seno ou cosseno.",
        examples: ["Se cos = 0,6, encontrar sen"],
        howToUse: {
          variables: "θ = ângulo",
          steps: ["sen²θ = 1 - cos²θ"],
          solvedExample: { problem: "cos = 0,8", solution: ["sen² = 1 - 0,64"], answer: "sen = 0,6" }
        },
        calculatorUsage: "Use sen e cos da calculadora"
      },
      {
        id: "tangente",
        name: "Tangente",
        formula: "tan(θ) = sen(θ) / cos(θ)",
        whenToUse: "Para inclinações e rampas.",
        examples: ["Rampa de acessibilidade"],
        howToUse: {
          variables: "θ = ângulo em graus",
          steps: ["Use tan do ângulo"],
          solvedExample: { problem: "tan(45°)?", solution: ["tan(45) = 1"], answer: "1" }
        },
        calculatorUsage: "Use tan(x) na calculadora"
      },
      {
        id: "lei-senos",
        name: "Lei dos senos",
        formula: "a/sen(A) = b/sen(B)",
        whenToUse: "Para triângulos quaisquer.",
        examples: ["Distância inacessível"],
        howToUse: {
          variables: "a, b = lados; A, B = ângulos opostos",
          steps: ["Monte a proporção e resolva"],
          solvedExample: { problem: "a=10, A=30°, B=60°", solution: ["b = 10×sen(60)/sen(30)"], answer: "b ≈ 17,3" }
        },
        calculatorUsage: "Use a proporção na calculadora"
      },
      {
        id: "lei-cossenos",
        name: "Lei dos cossenos",
        formula: "a² = b² + c² - 2bc×cos(A)",
        whenToUse: "Para triângulos conhecendo 2 lados e ângulo.",
        examples: ["Terceiro lado de triângulo"],
        howToUse: {
          variables: "a, b, c = lados; A = ângulo",
          steps: ["Substitua e calcule"],
          solvedExample: { problem: "b=5, c=7, A=60°", solution: ["a² = 25+49-35"], answer: "a ≈ 6,2" }
        },
        calculatorUsage: "Use a fórmula na calculadora"
      },
      {
        id: "juros-compostos",
        name: "Juros Compostos",
        formula: "M = C × (1 + i)^t",
        premium: true,
        whenToUse: "Para calcular rendimento de investimentos ou empréstimos.",
        examples: ["Investimento em poupança", "Financiamento de carro"],
        howToUse: {
          variables: "C = capital, i = taxa (%), t = tempo",
          steps: ["Converta taxa para decimal", "Calcule (1+i)^t", "Multiplique por C"],
          solvedExample: { problem: "R$1000, 5%/mês, 12 meses", solution: ["M = 1000 × 1,05^12"], answer: "R$ 1.795,86" }
        },
        calculatorUsage: "Digite capital, taxa e tempo"
      },
      {
        id: "progressao-aritmetica",
        name: "Progressão Aritmética (PA)",
        formula: "aₙ = a₁ + (n-1) × r",
        premium: true,
        whenToUse: "Para sequências com crescimento constante.",
        examples: ["Numeração de casas", "Parcelas fixas"],
        howToUse: {
          variables: "a₁ = primeiro termo, r = razão, n = posição",
          steps: ["Identifique a₁ e r", "Aplique a fórmula"],
          solvedExample: { problem: "PA: 2, 5, 8... qual o 10º termo?", solution: ["a₁=2, r=3", "a₁₀ = 2 + 9×3"], answer: "29" }
        },
        calculatorUsage: "Digite a₁, r e n"
      },
      {
        id: "progressao-geometrica",
        name: "Progressão Geométrica (PG)",
        formula: "aₙ = a₁ × q^(n-1)",
        premium: true,
        whenToUse: "Para sequências com crescimento multiplicativo.",
        examples: ["Crescimento exponencial", "Juros compostos"],
        howToUse: {
          variables: "a₁ = primeiro termo, q = razão, n = posição",
          steps: ["Identifique a₁ e q", "Aplique a fórmula"],
          solvedExample: { problem: "PG: 2, 6, 18... qual o 5º termo?", solution: ["a₁=2, q=3", "a₅ = 2 × 3^4"], answer: "162" }
        },
        calculatorUsage: "Digite a₁, q e n"
      }
    ]
  },
  {
    name: "Física",
    icon: "⚡",
    color: "yellow",
    formulas: [
      {
        id: "velocidade-media",
        name: "Velocidade média",
        formula: "Vm = Δs / Δt",
        whenToUse: "Para calcular velocidade média.",
        examples: ["Viagem de carro"],
        howToUse: {
          variables: "Δs = distância, Δt = tempo",
          steps: ["Divida distância por tempo"],
          solvedExample: { problem: "150 km em 2 h", solution: ["Vm = 150/2"], answer: "75 km/h" }
        },
        calculatorUsage: "Digite distância e tempo"
      },
      {
        id: "mru",
        name: "MRU",
        formula: "S = S₀ + v × t",
        whenToUse: "Movimento com velocidade constante.",
        examples: ["Carro em estrada"],
        howToUse: {
          variables: "S₀ = posição inicial, v = velocidade, t = tempo",
          steps: ["Some S₀ + v×t"],
          solvedExample: { problem: "Parte do km 10 a 60 km/h, 3h", solution: ["S = 10 + 180"], answer: "190 km" }
        },
        calculatorUsage: "Digite S₀, v e t"
      },
      {
        id: "mruv-velocidade",
        name: "MRUV",
        formula: "v = v₀ + at",
        whenToUse: "Movimento com aceleração constante.",
        examples: ["Carro acelerando"],
        howToUse: {
          variables: "v₀ = velocidade inicial, a = aceleração, t = tempo",
          steps: ["Some v₀ + a×t"],
          solvedExample: { problem: "Repouso, a=2, t=5s", solution: ["v = 0 + 10"], answer: "10 m/s" }
        },
        calculatorUsage: "Digite v₀, a e t"
      },
      {
        id: "newton",
        name: "2ª Lei de Newton",
        formula: "F = m × a",
        whenToUse: "Para calcular força.",
        examples: ["Empurrar carro"],
        howToUse: {
          variables: "m = massa (kg), a = aceleração (m/s²)",
          steps: ["Multiplique massa × aceleração"],
          solvedExample: { problem: "5 kg, a=3", solution: ["F = 15"], answer: "15 N" }
        },
        calculatorUsage: "Digite massa e aceleração"
      },
      {
        id: "trabalho",
        name: "Trabalho",
        formula: "W = F × d × cos(θ)",
        whenToUse: "Para calcular trabalho de uma força.",
        examples: ["Empurrar caixa"],
        howToUse: {
          variables: "F = força, d = deslocamento, θ = ângulo",
          steps: ["Multiplique F × d × cos(θ)"],
          solvedExample: { problem: "20 N, 5 m, θ=0°", solution: ["W = 100"], answer: "100 J" }
        },
        calculatorUsage: "Digite F, d e ângulo"
      },
      {
        id: "energia-cinetica",
        name: "Energia cinética",
        formula: "Ec = (m × v²) / 2",
        whenToUse: "Energia de corpo em movimento.",
        examples: ["Energia de um carro"],
        howToUse: {
          variables: "m = massa, v = velocidade",
          steps: ["Calcule m×v²/2"],
          solvedExample: { problem: "2 kg a 5 m/s", solution: ["Ec = 50/2"], answer: "25 J" }
        },
        calculatorUsage: "Digite massa e velocidade"
      },
      {
        id: "energia-potencial",
        name: "Energia potencial gravitacional",
        formula: "Ep = m × g × h",
        whenToUse: "Energia devido à altura.",
        examples: ["Água em represa"],
        howToUse: {
          variables: "m = massa, g = gravidade, h = altura",
          steps: ["Multiplique m × g × h"],
          solvedExample: { problem: "3 kg, h=4 m, g=10", solution: ["Ep = 120"], answer: "120 J" }
        },
        calculatorUsage: "Digite m, g e h"
      },
      {
        id: "lei-ohm",
        name: "Lei de Ohm",
        formula: "U = R × I",
        whenToUse: "Circuitos elétricos.",
        examples: ["Resistor"],
        howToUse: {
          variables: "R = resistência, I = corrente",
          steps: ["Multiplique R × I"],
          solvedExample: { problem: "100 Ω, 2 A", solution: ["U = 200"], answer: "200 V" }
        },
        calculatorUsage: "Digite R e I"
      },
      {
        id: "potencia-eletrica",
        name: "Potência elétrica",
        formula: "P = U × I",
        whenToUse: "Consumo de aparelhos.",
        examples: ["Lâmpada"],
        howToUse: {
          variables: "U = tensão, I = corrente",
          steps: ["Multiplique U × I"],
          solvedExample: { problem: "220 V, 0,5 A", solution: ["P = 110"], answer: "110 W" }
        },
        calculatorUsage: "Digite U e I"
      },
      {
        id: "queda-livre",
        name: "Queda Livre",
        formula: "h = g × t² / 2",
        premium: true,
        whenToUse: "Para objetos caindo do repouso.",
        examples: ["Objeto caindo de prédio", "Fruta caindo da árvore"],
        howToUse: {
          variables: "g = gravidade, t = tempo",
          steps: ["Calcule t²", "Multiplique por g/2"],
          solvedExample: { problem: "Queda por 3s, g=10", solution: ["h = 10 × 9 / 2"], answer: "45 m" }
        },
        calculatorUsage: "Digite g e t"
      },
      {
        id: "lancamento-vertical",
        name: "Lançamento Vertical",
        formula: "v² = v₀² + 2gΔh",
        premium: true,
        whenToUse: "Para objetos lançados para cima.",
        examples: ["Bola jogada para cima", "Foguete subindo"],
        howToUse: {
          variables: "v₀ = velocidade inicial, g = gravidade, h = altura",
          steps: ["Calcule v₀²", "Subtraia 2gh"],
          solvedExample: { problem: "v₀=20m/s, h=15m, g=10", solution: ["v² = 400 - 300"], answer: "10 m/s" }
        },
        calculatorUsage: "Digite v₀, g e h"
      },
      {
        id: "impulso",
        name: "Impulso e Quantidade de Movimento",
        formula: "I = F × Δt = Δp",
        premium: true,
        whenToUse: "Para colisões e impactos.",
        examples: ["Chute na bola", "Colisão de carros"],
        howToUse: {
          variables: "F = força, t = tempo",
          steps: ["Multiplique F × t"],
          solvedExample: { problem: "50 N por 2s", solution: ["I = 50 × 2"], answer: "100 N·s" }
        },
        calculatorUsage: "Digite F e t"
      }
    ]
  },
  {
    name: "Química",
    icon: "🧪",
    color: "green",
    formulas: [
      {
        id: "concentracao-comum",
        name: "Concentração comum",
        formula: "C = m / V",
        whenToUse: "Massa de soluto por volume.",
        examples: ["Sal em água"],
        howToUse: {
          variables: "m = massa (g), V = volume (L)",
          steps: ["Divida massa por volume"],
          solvedExample: { problem: "30 g em 2 L", solution: ["C = 15"], answer: "15 g/L" }
        },
        calculatorUsage: "Digite massa e volume"
      },
      {
        id: "molaridade",
        name: "Concentração molar",
        formula: "M = n / V",
        whenToUse: "Mols por volume.",
        examples: ["Soluções de laboratório"],
        howToUse: {
          variables: "n = mols, V = volume em L",
          steps: ["Divida n por V"],
          solvedExample: { problem: "0,5 mol em 0,25 L", solution: ["M = 2"], answer: "2 mol/L" }
        },
        calculatorUsage: "Digite n e V"
      },
      {
        id: "gases-ideais",
        name: "Equação dos gases ideais",
        formula: "PV = nRT",
        whenToUse: "Comportamento de gases.",
        examples: ["Balão de gás"],
        howToUse: {
          variables: "P = pressão, V = volume, n = mols, T = temperatura (K)",
          steps: ["Use R = 0,082", "T(K) = °C + 273"],
          solvedExample: { problem: "2 mol, 27°C, 1 atm", solution: ["V = 2×0,082×300"], answer: "49,2 L" }
        },
        calculatorUsage: "Digite n, T(°C) e P",
        commonErrors: ["Esquecer de converter °C para K"]
      },
      {
        id: "quantidade-calor",
        name: "Quantidade de calor",
        formula: "Q = m × c × ΔT",
        whenToUse: "Energia térmica.",
        examples: ["Aquecer água"],
        howToUse: {
          variables: "m = massa, c = calor específico, ΔT = variação de temp",
          steps: ["Calcule ΔT = Tf - Ti", "Multiplique m × c × ΔT"],
          solvedExample: { problem: "500 g água, 20°C a 80°C", solution: ["Q = 500×1×60"], answer: "30.000 cal" }
        },
        calculatorUsage: "Digite m, c, Ti e Tf"
      },
      {
        id: "diluicao",
        name: "Diluição de Soluções",
        formula: "C₁ × V₁ = C₂ × V₂",
        premium: true,
        whenToUse: "Para diluir ou concentrar soluções.",
        examples: ["Diluir suco", "Preparar reagente"],
        howToUse: {
          variables: "C₁, V₁ = inicial; C₂, V₂ = final",
          steps: ["Use a relação C₁V₁ = C₂V₂"],
          solvedExample: { problem: "2M, 0,5L para 2L", solution: ["C₂ = 2×0,5/2"], answer: "0,5 mol/L" }
        },
        calculatorUsage: "Digite C₁, V₁ e V₂"
      },
      {
        id: "rendimento",
        name: "Rendimento de Reação",
        formula: "η = (real / teórico) × 100",
        premium: true,
        whenToUse: "Para calcular eficiência de reações.",
        examples: ["Produção industrial", "Síntese em laboratório"],
        howToUse: {
          variables: "real = obtido, teórico = esperado",
          steps: ["Divida real por teórico", "Multiplique por 100"],
          solvedExample: { problem: "Obteve 45g, esperava 50g", solution: ["η = 45/50 × 100"], answer: "90%" }
        },
        calculatorUsage: "Digite quantidade real e teórica"
      },
      {
        id: "densidade",
        name: "Densidade",
        formula: "d = m / V",
        premium: true,
        whenToUse: "Para calcular densidade de materiais.",
        examples: ["Identificar metais", "Verificar pureza"],
        howToUse: {
          variables: "m = massa, V = volume",
          steps: ["Divida massa por volume"],
          solvedExample: { problem: "100g em 50cm³", solution: ["d = 100/50"], answer: "2 g/cm³" }
        },
        calculatorUsage: "Digite m e V"
      }
    ]
  }
];

function FormulaCard({ formula, color, onUseFormula, userPlan }: { formula: Formula; color: string; onUseFormula?: (id: string) => void; userPlan?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAvailable = availableFormulas.includes(formula.id);
  const isPremium = premiumFormulas.includes(formula.id);
  const isLocked = isPremium && userPlan !== "premium";
  
  const colorClasses = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400"
  };

  const handleUseFormula = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUseFormula) {
      onUseFormula(formula.id);
    }
  };

  return (
    <div className={cn(
      "bg-zinc-800/50 rounded-xl border overflow-hidden",
      isPremium ? "border-orange-500/30" : "border-zinc-800"
    )}>
      <div className="flex items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-4 flex items-center justify-between hover:bg-zinc-800/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn("px-3 py-1 rounded-lg text-xs font-mono", colorClasses[color as keyof typeof colorClasses])}>
              {formula.formula.length > 20 ? formula.formula.substring(0, 20) + "..." : formula.formula}
            </div>
            <span className="font-medium text-white text-sm">{formula.name}</span>
            {isPremium && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-xs">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
        
        <button
          onClick={handleUseFormula}
          className={cn(
            "px-4 py-4 border-l border-zinc-700 transition-colors flex items-center gap-2",
            isAvailable 
              ? isLocked
                ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400"
                : "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400" 
              : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
          )}
          title={isAvailable ? (isLocked ? "Premium - Clique para ver" : "Usar esta fórmula") : "Fórmula ainda não disponível"}
          data-testid={`button-use-${formula.id}`}
        >
          {isLocked ? <Crown className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-xs font-medium hidden sm:inline">{isLocked ? "Ver" : "Usar"}</span>
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3 border-t border-zinc-800">
              <div className="bg-zinc-900 p-3 rounded-lg">
                <code className="text-lg text-white font-mono">{formula.formula}</code>
              </div>
              
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Quando usar
                </h4>
                <p className="text-zinc-300 text-sm">{formula.whenToUse}</p>
              </div>
              
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                <h4 className="text-xs uppercase tracking-wider text-green-400 mb-2">Exemplo</h4>
                <p className="text-white text-sm font-medium">{formula.howToUse.solvedExample.problem}</p>
                <p className="text-green-400 font-bold text-sm mt-1">{formula.howToUse.solvedExample.answer}</p>
              </div>

              {isAvailable && (
                <button
                  onClick={handleUseFormula}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calcular com esta fórmula
                </button>
              )}

              {!isAvailable && (
                <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Esta fórmula ainda não está disponível para cálculo automático
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FormulasGuide({ isOpen, onClose, onSelectFormula }: FormulasGuideProps) {
  const [activeArea, setActiveArea] = useState<string>("Matemática");
  const { user } = useAuth();
  
  const handleUseFormula = (formulaId: string) => {
    if (onSelectFormula) {
      onSelectFormula(formulaId);
      onClose();
    }
  };
  
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
            className="fixed inset-x-0 bottom-0 h-[95vh] bg-zinc-900 rounded-t-3xl z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Guia de Fórmulas</h2>
                  <p className="text-xs text-zinc-400">Toque em "Usar" para calcular</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                data-testid="button-close-formulas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 p-4 border-b border-zinc-800 overflow-x-auto">
              {areasData.map((area) => (
                <button
                  key={area.name}
                  onClick={() => setActiveArea(area.name)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    activeArea === area.name
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {area.icon} {area.name}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {areasData
                .filter((area) => area.name === activeArea)
                .map((area) => (
                  <div key={area.name} className="space-y-3">
                    {area.formulas.map((formula) => (
                      <FormulaCard 
                        key={formula.id} 
                        formula={formula} 
                        color={area.color}
                        onUseFormula={handleUseFormula}
                        userPlan={user?.plan ?? undefined}
                      />
                    ))}
                  </div>
                ))}
              
              <div className="h-8" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
