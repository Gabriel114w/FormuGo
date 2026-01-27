import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, ArrowRight, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface FormulaCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  formulaId: string | null;
}

interface FormulaConfig {
  name: string;
  formula: string;
  premium?: boolean;
  variables: { key: string; label: string; unit: string; placeholder: string }[];
  calculate: (values: Record<string, number>) => { result: number; unit: string; explanation: string[] };
}

const formulaConfigs: Record<string, FormulaConfig> = {
  "bhaskara": {
    name: "Equação do 2º grau (Bhaskara)",
    formula: "x = (-b ± √(b² - 4ac)) / 2a",
    variables: [
      { key: "a", label: "Coeficiente a", unit: "", placeholder: "Ex: 1" },
      { key: "b", label: "Coeficiente b", unit: "", placeholder: "Ex: -5" },
      { key: "c", label: "Coeficiente c", unit: "", placeholder: "Ex: 6" }
    ],
    calculate: (v) => {
      const delta = v.b * v.b - 4 * v.a * v.c;
      if (delta < 0) {
        return { result: NaN, unit: "", explanation: ["Δ = " + delta, "Δ < 0: Não existem raízes reais"] };
      }
      const x1 = (-v.b + Math.sqrt(delta)) / (2 * v.a);
      const x2 = (-v.b - Math.sqrt(delta)) / (2 * v.a);
      return {
        result: x1,
        unit: "",
        explanation: [
          `Δ = b² - 4ac = ${v.b}² - 4(${v.a})(${v.c}) = ${delta}`,
          `x₁ = (-${v.b} + √${delta}) / (2 × ${v.a}) = ${x1.toFixed(2)}`,
          `x₂ = (-${v.b} - √${delta}) / (2 × ${v.a}) = ${x2.toFixed(2)}`,
          delta === 0 ? `Raiz única: x = ${x1}` : `Raízes: x₁ = ${x1.toFixed(2)} e x₂ = ${x2.toFixed(2)}`
        ]
      };
    }
  },
  "funcao-afim": {
    name: "Função Afim",
    formula: "f(x) = ax + b",
    variables: [
      { key: "a", label: "Coeficiente a", unit: "", placeholder: "Ex: 2" },
      { key: "b", label: "Coeficiente b", unit: "", placeholder: "Ex: 5" },
      { key: "x", label: "Valor de x", unit: "", placeholder: "Ex: 10" }
    ],
    calculate: (v) => {
      const result = v.a * v.x + v.b;
      return {
        result,
        unit: "",
        explanation: [
          `f(x) = ${v.a}x + ${v.b}`,
          `f(${v.x}) = ${v.a} × ${v.x} + ${v.b}`,
          `f(${v.x}) = ${v.a * v.x} + ${v.b} = ${result}`
        ]
      };
    }
  },
  "funcao-exponencial": {
    name: "Função Exponencial",
    formula: "f(x) = a · bˣ",
    variables: [
      { key: "a", label: "Valor inicial (a)", unit: "", placeholder: "Ex: 100" },
      { key: "b", label: "Fator de crescimento (b)", unit: "", placeholder: "Ex: 2" },
      { key: "x", label: "Tempo/expoente (x)", unit: "", placeholder: "Ex: 3" }
    ],
    calculate: (v) => {
      const result = v.a * Math.pow(v.b, v.x);
      return {
        result,
        unit: "",
        explanation: [
          `f(x) = ${v.a} × ${v.b}^${v.x}`,
          `f(${v.x}) = ${v.a} × ${Math.pow(v.b, v.x)}`,
          `Resultado: ${result}`
        ]
      };
    }
  },
  "area-triangulo": {
    name: "Área do Triângulo",
    formula: "A = (b × h) / 2",
    variables: [
      { key: "b", label: "Base", unit: "m", placeholder: "Ex: 6" },
      { key: "h", label: "Altura", unit: "m", placeholder: "Ex: 4" }
    ],
    calculate: (v) => {
      const result = (v.b * v.h) / 2;
      return {
        result,
        unit: "m²",
        explanation: [
          `A = (base × altura) / 2`,
          `A = (${v.b} × ${v.h}) / 2`,
          `A = ${v.b * v.h} / 2 = ${result}`
        ]
      };
    }
  },
  "area-circulo": {
    name: "Área do Círculo",
    formula: "A = π × r²",
    variables: [
      { key: "r", label: "Raio", unit: "m", placeholder: "Ex: 5" }
    ],
    calculate: (v) => {
      const result = Math.PI * v.r * v.r;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m²",
        explanation: [
          `A = π × r²`,
          `A = π × ${v.r}²`,
          `A = 3,14159 × ${v.r * v.r}`,
          `A ≈ ${result.toFixed(2)}`
        ]
      };
    }
  },
  "circunferencia": {
    name: "Circunferência",
    formula: "C = 2 × π × r",
    variables: [
      { key: "r", label: "Raio", unit: "m", placeholder: "Ex: 7" }
    ],
    calculate: (v) => {
      const result = 2 * Math.PI * v.r;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m",
        explanation: [
          `C = 2 × π × r`,
          `C = 2 × 3,14159 × ${v.r}`,
          `C ≈ ${result.toFixed(2)}`
        ]
      };
    }
  },
  "pitagoras": {
    name: "Teorema de Pitágoras",
    formula: "a² = b² + c²",
    variables: [
      { key: "b", label: "Cateto b", unit: "m", placeholder: "Ex: 3" },
      { key: "c", label: "Cateto c", unit: "m", placeholder: "Ex: 4" }
    ],
    calculate: (v) => {
      const result = Math.sqrt(v.b * v.b + v.c * v.c);
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m",
        explanation: [
          `a² = b² + c²`,
          `a² = ${v.b}² + ${v.c}²`,
          `a² = ${v.b * v.b} + ${v.c * v.c} = ${v.b * v.b + v.c * v.c}`,
          `a = √${v.b * v.b + v.c * v.c} = ${result.toFixed(2)}`
        ]
      };
    }
  },
  "velocidade-media": {
    name: "Velocidade Média",
    formula: "Vm = Δs / Δt",
    variables: [
      { key: "s", label: "Distância (Δs)", unit: "km", placeholder: "Ex: 150" },
      { key: "t", label: "Tempo (Δt)", unit: "h", placeholder: "Ex: 2" }
    ],
    calculate: (v) => {
      const result = v.s / v.t;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "km/h",
        explanation: [
          `Vm = Δs / Δt`,
          `Vm = ${v.s} / ${v.t}`,
          `Vm = ${result.toFixed(2)}`
        ]
      };
    }
  },
  "mru": {
    name: "MRU",
    formula: "S = S₀ + v × t",
    variables: [
      { key: "s0", label: "Posição inicial (S₀)", unit: "m", placeholder: "Ex: 10" },
      { key: "v", label: "Velocidade (v)", unit: "m/s", placeholder: "Ex: 20" },
      { key: "t", label: "Tempo (t)", unit: "s", placeholder: "Ex: 5" }
    ],
    calculate: (v) => {
      const result = v.s0 + v.v * v.t;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m",
        explanation: [
          `S = S₀ + v × t`,
          `S = ${v.s0} + ${v.v} × ${v.t}`,
          `S = ${v.s0} + ${v.v * v.t} = ${result}`
        ]
      };
    }
  },
  "mruv-velocidade": {
    name: "MRUV - Velocidade Final",
    formula: "v = v₀ + a × t",
    variables: [
      { key: "v0", label: "Velocidade inicial (v₀)", unit: "m/s", placeholder: "Ex: 0" },
      { key: "a", label: "Aceleração (a)", unit: "m/s²", placeholder: "Ex: 2" },
      { key: "t", label: "Tempo (t)", unit: "s", placeholder: "Ex: 5" }
    ],
    calculate: (v) => {
      const result = v.v0 + v.a * v.t;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m/s",
        explanation: [
          `v = v₀ + a × t`,
          `v = ${v.v0} + ${v.a} × ${v.t}`,
          `v = ${v.v0} + ${v.a * v.t} = ${result}`
        ]
      };
    }
  },
  "newton": {
    name: "2ª Lei de Newton",
    formula: "F = m × a",
    variables: [
      { key: "m", label: "Massa (m)", unit: "kg", placeholder: "Ex: 5" },
      { key: "a", label: "Aceleração (a)", unit: "m/s²", placeholder: "Ex: 3" }
    ],
    calculate: (v) => {
      const result = v.m * v.a;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "N",
        explanation: [
          `F = m × a`,
          `F = ${v.m} × ${v.a}`,
          `F = ${result}`
        ]
      };
    }
  },
  "trabalho": {
    name: "Trabalho",
    formula: "W = F × d × cos(θ)",
    variables: [
      { key: "f", label: "Força (F)", unit: "N", placeholder: "Ex: 20" },
      { key: "d", label: "Deslocamento (d)", unit: "m", placeholder: "Ex: 5" },
      { key: "theta", label: "Ângulo θ", unit: "°", placeholder: "Ex: 0" }
    ],
    calculate: (v) => {
      const cosTheta = Math.cos(v.theta * Math.PI / 180);
      const result = v.f * v.d * cosTheta;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "J",
        explanation: [
          `W = F × d × cos(θ)`,
          `W = ${v.f} × ${v.d} × cos(${v.theta}°)`,
          `W = ${v.f} × ${v.d} × ${cosTheta.toFixed(4)}`,
          `W = ${result.toFixed(2)}`
        ]
      };
    }
  },
  "energia-cinetica": {
    name: "Energia Cinética",
    formula: "Ec = (m × v²) / 2",
    variables: [
      { key: "m", label: "Massa (m)", unit: "kg", placeholder: "Ex: 2" },
      { key: "v", label: "Velocidade (v)", unit: "m/s", placeholder: "Ex: 5" }
    ],
    calculate: (v) => {
      const result = (v.m * v.v * v.v) / 2;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "J",
        explanation: [
          `Ec = (m × v²) / 2`,
          `Ec = (${v.m} × ${v.v}²) / 2`,
          `Ec = (${v.m} × ${v.v * v.v}) / 2`,
          `Ec = ${v.m * v.v * v.v} / 2 = ${result}`
        ]
      };
    }
  },
  "energia-potencial": {
    name: "Energia Potencial Gravitacional",
    formula: "Ep = m × g × h",
    variables: [
      { key: "m", label: "Massa (m)", unit: "kg", placeholder: "Ex: 3" },
      { key: "g", label: "Gravidade (g)", unit: "m/s²", placeholder: "Ex: 10" },
      { key: "h", label: "Altura (h)", unit: "m", placeholder: "Ex: 4" }
    ],
    calculate: (v) => {
      const result = v.m * v.g * v.h;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "J",
        explanation: [
          `Ep = m × g × h`,
          `Ep = ${v.m} × ${v.g} × ${v.h}`,
          `Ep = ${result}`
        ]
      };
    }
  },
  "lei-ohm": {
    name: "Lei de Ohm",
    formula: "U = R × I",
    variables: [
      { key: "r", label: "Resistência (R)", unit: "Ω", placeholder: "Ex: 100" },
      { key: "i", label: "Corrente (I)", unit: "A", placeholder: "Ex: 2" }
    ],
    calculate: (v) => {
      const result = v.r * v.i;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "V",
        explanation: [
          `U = R × I`,
          `U = ${v.r} × ${v.i}`,
          `U = ${result}`
        ]
      };
    }
  },
  "potencia-eletrica": {
    name: "Potência Elétrica",
    formula: "P = U × I",
    variables: [
      { key: "u", label: "Tensão (U)", unit: "V", placeholder: "Ex: 220" },
      { key: "i", label: "Corrente (I)", unit: "A", placeholder: "Ex: 0.5" }
    ],
    calculate: (v) => {
      const result = v.u * v.i;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "W",
        explanation: [
          `P = U × I`,
          `P = ${v.u} × ${v.i}`,
          `P = ${result}`
        ]
      };
    }
  },
  "concentracao-comum": {
    name: "Concentração Comum",
    formula: "C = m / V",
    variables: [
      { key: "m", label: "Massa do soluto (m)", unit: "g", placeholder: "Ex: 30" },
      { key: "v", label: "Volume da solução (V)", unit: "L", placeholder: "Ex: 2" }
    ],
    calculate: (v) => {
      const result = v.m / v.v;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "g/L",
        explanation: [
          `C = m / V`,
          `C = ${v.m} / ${v.v}`,
          `C = ${result}`
        ]
      };
    }
  },
  "molaridade": {
    name: "Concentração Molar",
    formula: "M = n / V",
    variables: [
      { key: "n", label: "Número de mols (n)", unit: "mol", placeholder: "Ex: 0.5" },
      { key: "v", label: "Volume (V)", unit: "L", placeholder: "Ex: 0.25" }
    ],
    calculate: (v) => {
      const result = v.n / v.v;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "mol/L",
        explanation: [
          `M = n / V`,
          `M = ${v.n} / ${v.v}`,
          `M = ${result}`
        ]
      };
    }
  },
  "gases-ideais": {
    name: "Equação dos Gases Ideais",
    formula: "P × V = n × R × T",
    variables: [
      { key: "n", label: "Número de mols (n)", unit: "mol", placeholder: "Ex: 2" },
      { key: "t", label: "Temperatura", unit: "°C", placeholder: "Ex: 27" },
      { key: "p", label: "Pressão (P)", unit: "atm", placeholder: "Ex: 1" }
    ],
    calculate: (v) => {
      const tempK = v.t + 273;
      const R = 0.082;
      const result = (v.n * R * tempK) / v.p;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "L",
        explanation: [
          `V = (n × R × T) / P`,
          `T(K) = ${v.t} + 273 = ${tempK} K`,
          `V = (${v.n} × 0,082 × ${tempK}) / ${v.p}`,
          `V = ${(v.n * R * tempK).toFixed(2)} / ${v.p}`,
          `V = ${result.toFixed(2)}`
        ]
      };
    }
  },
  "quantidade-calor": {
    name: "Quantidade de Calor",
    formula: "Q = m × c × ΔT",
    variables: [
      { key: "m", label: "Massa (m)", unit: "g", placeholder: "Ex: 500" },
      { key: "c", label: "Calor específico (c)", unit: "cal/g°C", placeholder: "Ex: 1" },
      { key: "ti", label: "Temperatura inicial", unit: "°C", placeholder: "Ex: 20" },
      { key: "tf", label: "Temperatura final", unit: "°C", placeholder: "Ex: 80" }
    ],
    calculate: (v) => {
      const deltaT = v.tf - v.ti;
      const result = v.m * v.c * deltaT;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "cal",
        explanation: [
          `Q = m × c × ΔT`,
          `ΔT = ${v.tf} - ${v.ti} = ${deltaT}°C`,
          `Q = ${v.m} × ${v.c} × ${deltaT}`,
          `Q = ${result}`
        ]
      };
    }
  },
  "juros-compostos": {
    name: "Juros Compostos",
    formula: "M = C × (1 + i)^t",
    premium: true,
    variables: [
      { key: "c", label: "Capital inicial (C)", unit: "R$", placeholder: "Ex: 1000" },
      { key: "i", label: "Taxa de juros (i)", unit: "%", placeholder: "Ex: 5" },
      { key: "t", label: "Tempo (t)", unit: "períodos", placeholder: "Ex: 12" }
    ],
    calculate: (v) => {
      const taxa = v.i / 100;
      const result = v.c * Math.pow(1 + taxa, v.t);
      const juros = result - v.c;
      return {
        result: parseFloat(result.toFixed(2)),
        unit: "R$",
        explanation: [
          `M = C × (1 + i)^t`,
          `M = ${v.c} × (1 + ${taxa})^${v.t}`,
          `M = ${v.c} × ${Math.pow(1 + taxa, v.t).toFixed(4)}`,
          `M = R$ ${result.toFixed(2)}`,
          `Juros acumulados: R$ ${juros.toFixed(2)}`
        ]
      };
    }
  },
  "progressao-aritmetica": {
    name: "Progressão Aritmética (PA)",
    formula: "aₙ = a₁ + (n-1) × r",
    premium: true,
    variables: [
      { key: "a1", label: "Primeiro termo (a₁)", unit: "", placeholder: "Ex: 2" },
      { key: "r", label: "Razão (r)", unit: "", placeholder: "Ex: 3" },
      { key: "n", label: "Posição (n)", unit: "", placeholder: "Ex: 10" }
    ],
    calculate: (v) => {
      const result = v.a1 + (v.n - 1) * v.r;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "",
        explanation: [
          `aₙ = a₁ + (n-1) × r`,
          `a${v.n} = ${v.a1} + (${v.n}-1) × ${v.r}`,
          `a${v.n} = ${v.a1} + ${v.n - 1} × ${v.r}`,
          `a${v.n} = ${v.a1} + ${(v.n - 1) * v.r} = ${result}`
        ]
      };
    }
  },
  "progressao-geometrica": {
    name: "Progressão Geométrica (PG)",
    formula: "aₙ = a₁ × q^(n-1)",
    premium: true,
    variables: [
      { key: "a1", label: "Primeiro termo (a₁)", unit: "", placeholder: "Ex: 2" },
      { key: "q", label: "Razão (q)", unit: "", placeholder: "Ex: 3" },
      { key: "n", label: "Posição (n)", unit: "", placeholder: "Ex: 5" }
    ],
    calculate: (v) => {
      const result = v.a1 * Math.pow(v.q, v.n - 1);
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "",
        explanation: [
          `aₙ = a₁ × q^(n-1)`,
          `a${v.n} = ${v.a1} × ${v.q}^(${v.n}-1)`,
          `a${v.n} = ${v.a1} × ${v.q}^${v.n - 1}`,
          `a${v.n} = ${v.a1} × ${Math.pow(v.q, v.n - 1)} = ${result}`
        ]
      };
    }
  },
  "queda-livre": {
    name: "Queda Livre",
    formula: "h = g × t² / 2",
    premium: true,
    variables: [
      { key: "g", label: "Gravidade (g)", unit: "m/s²", placeholder: "Ex: 10" },
      { key: "t", label: "Tempo (t)", unit: "s", placeholder: "Ex: 3" }
    ],
    calculate: (v) => {
      const result = (v.g * v.t * v.t) / 2;
      const velocidade = v.g * v.t;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m",
        explanation: [
          `h = g × t² / 2`,
          `h = ${v.g} × ${v.t}² / 2`,
          `h = ${v.g} × ${v.t * v.t} / 2`,
          `h = ${v.g * v.t * v.t} / 2 = ${result} m`,
          `Velocidade final: v = g × t = ${velocidade} m/s`
        ]
      };
    }
  },
  "lancamento-vertical": {
    name: "Lançamento Vertical",
    formula: "v² = v₀² + 2gΔh",
    premium: true,
    variables: [
      { key: "v0", label: "Velocidade inicial (v₀)", unit: "m/s", placeholder: "Ex: 20" },
      { key: "g", label: "Gravidade (g)", unit: "m/s²", placeholder: "Ex: 10" },
      { key: "h", label: "Altura (Δh)", unit: "m", placeholder: "Ex: 15" }
    ],
    calculate: (v) => {
      const v2 = v.v0 * v.v0 - 2 * v.g * v.h;
      const result = v2 >= 0 ? Math.sqrt(v2) : NaN;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "m/s",
        explanation: [
          `v² = v₀² - 2gΔh (subindo)`,
          `v² = ${v.v0}² - 2 × ${v.g} × ${v.h}`,
          `v² = ${v.v0 * v.v0} - ${2 * v.g * v.h}`,
          `v² = ${v2}`,
          v2 >= 0 ? `v = √${v2} = ${result.toFixed(2)} m/s` : `Altura não atingível com essa velocidade`
        ]
      };
    }
  },
  "diluicao": {
    name: "Diluição de Soluções",
    formula: "C₁ × V₁ = C₂ × V₂",
    premium: true,
    variables: [
      { key: "c1", label: "Concentração inicial (C₁)", unit: "mol/L", placeholder: "Ex: 2" },
      { key: "v1", label: "Volume inicial (V₁)", unit: "L", placeholder: "Ex: 0.5" },
      { key: "v2", label: "Volume final (V₂)", unit: "L", placeholder: "Ex: 2" }
    ],
    calculate: (v) => {
      const result = (v.c1 * v.v1) / v.v2;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "mol/L",
        explanation: [
          `C₁ × V₁ = C₂ × V₂`,
          `C₂ = (C₁ × V₁) / V₂`,
          `C₂ = (${v.c1} × ${v.v1}) / ${v.v2}`,
          `C₂ = ${v.c1 * v.v1} / ${v.v2}`,
          `C₂ = ${result.toFixed(4)} mol/L`
        ]
      };
    }
  },
  "rendimento": {
    name: "Rendimento de Reação",
    formula: "η = (real / teórico) × 100",
    premium: true,
    variables: [
      { key: "real", label: "Quantidade real", unit: "g", placeholder: "Ex: 45" },
      { key: "teorico", label: "Quantidade teórica", unit: "g", placeholder: "Ex: 50" }
    ],
    calculate: (v) => {
      const result = (v.real / v.teorico) * 100;
      return {
        result: parseFloat(result.toFixed(2)),
        unit: "%",
        explanation: [
          `η = (quantidade real / quantidade teórica) × 100`,
          `η = (${v.real} / ${v.teorico}) × 100`,
          `η = ${(v.real / v.teorico).toFixed(4)} × 100`,
          `η = ${result.toFixed(2)}%`
        ]
      };
    }
  },
  "densidade": {
    name: "Densidade",
    formula: "d = m / V",
    premium: true,
    variables: [
      { key: "m", label: "Massa (m)", unit: "g", placeholder: "Ex: 100" },
      { key: "v", label: "Volume (V)", unit: "cm³", placeholder: "Ex: 50" }
    ],
    calculate: (v) => {
      const result = v.m / v.v;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "g/cm³",
        explanation: [
          `d = m / V`,
          `d = ${v.m} / ${v.v}`,
          `d = ${result.toFixed(4)} g/cm³`
        ]
      };
    }
  },
  "impulso": {
    name: "Impulso e Quantidade de Movimento",
    formula: "I = F × Δt = Δp",
    premium: true,
    variables: [
      { key: "f", label: "Força (F)", unit: "N", placeholder: "Ex: 50" },
      { key: "t", label: "Tempo (Δt)", unit: "s", placeholder: "Ex: 2" }
    ],
    calculate: (v) => {
      const result = v.f * v.t;
      return {
        result: parseFloat(result.toFixed(4)),
        unit: "N·s",
        explanation: [
          `I = F × Δt`,
          `I = ${v.f} × ${v.t}`,
          `I = ${result} N·s (ou kg·m/s)`,
          `Variação da quantidade de movimento: Δp = ${result} kg·m/s`
        ]
      };
    }
  }
};

export function FormulaCalculator({ isOpen, onClose, formulaId }: FormulaCalculatorProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: number; unit: string; explanation: string[] } | null>(null);
  const { user } = useAuth();
  
  const config = formulaId ? formulaConfigs[formulaId] : null;
  const isPremiumFormula = config?.premium === true;
  const userHasPremium = user?.plan === "premium";
  const isLocked = isPremiumFormula && !userHasPremium;
  
  const handleCalculate = () => {
    if (!config) return;
    
    const numericValues: Record<string, number> = {};
    for (const variable of config.variables) {
      const val = parseFloat(values[variable.key] || "0");
      if (isNaN(val)) {
        return;
      }
      numericValues[variable.key] = val;
    }
    
    const calcResult = config.calculate(numericValues);
    setResult({ value: calcResult.result, unit: calcResult.unit, explanation: calcResult.explanation });
  };
  
  const handleClose = () => {
    setValues({});
    setResult(null);
    onClose();
  };
  
  if (!config) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-zinc-900 rounded-t-3xl z-50 p-6 shadow-2xl"
            >
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Fórmula Indisponível</h3>
                <p className="text-zinc-400 mb-6">Esta fórmula ainda não está disponível. Escolha outra da lista.</p>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  if (isLocked) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-zinc-900 rounded-t-3xl z-50 p-6 shadow-2xl"
            >
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Fórmula Premium</h3>
                <p className="text-zinc-400 mb-2">{config.name}</p>
                <code className="text-sm text-orange-400 block mb-4">{config.formula}</code>
                <p className="text-zinc-500 text-sm mb-6">
                  Esta fórmula avançada está disponível apenas para assinantes Premium.
                </p>
                <div className="space-y-3">
                  <a 
                    href="/plans"
                    className="block w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                  >
                    Assinar Premium - R$ 15/mês
                  </a>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 text-zinc-400 hover:text-white transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 max-h-[90vh] bg-zinc-900 rounded-t-3xl z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Calculator className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{config.name}</h2>
                  <code className="text-sm text-zinc-400">{config.formula}</code>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                data-testid="button-close-formula-calc"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Campos de entrada */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Insira os valores</h3>
                {config.variables.map((variable) => (
                  <div key={variable.key} className="flex items-center gap-3">
                    <label className="text-sm text-zinc-300 w-40 flex-shrink-0">
                      {variable.label}
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="any"
                        value={values[variable.key] || ""}
                        onChange={(e) => setValues({ ...values, [variable.key]: e.target.value })}
                        placeholder={variable.placeholder}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        data-testid={`input-${variable.key}`}
                      />
                      {variable.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                          {variable.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão calcular */}
              <button
                onClick={handleCalculate}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                data-testid="button-calculate-formula"
              >
                Calcular <ArrowRight className="w-5 h-5" />
              </button>

              {/* Resultado */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-4"
                  >
                    {/* Resultado principal */}
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                      <p className="text-sm text-green-400 uppercase tracking-wider mb-2">Resultado</p>
                      <p className="text-4xl font-bold text-white">
                        {isNaN(result.value) ? "Sem solução real" : result.value.toLocaleString('pt-BR')} 
                        <span className="text-xl text-green-400 ml-2">{result.unit}</span>
                      </p>
                    </div>

                    {/* Explicação passo a passo */}
                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Passo a passo</h4>
                      <div className="space-y-2">
                        {result.explanation.map((step, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-orange-400 font-bold text-sm">{i + 1}.</span>
                            <code className="text-zinc-300 text-sm">{step}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const availableFormulas = Object.keys(formulaConfigs);
export const premiumFormulas = Object.entries(formulaConfigs)
  .filter(([_, config]) => config.premium === true)
  .map(([id]) => id);
export const freeFormulas = Object.entries(formulaConfigs)
  .filter(([_, config]) => config.premium !== true)
  .map(([id]) => id);
