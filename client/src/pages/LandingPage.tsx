import { Calculator, Sparkles, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/supabaseClient"; // ✅ Importando o Supabase

export default function LandingPage() {

  // ✅ Função para lidar com o login
  const handleLogin = async () => {
    // Tenta fazer login com o Google (ou outro provedor que você configurou)
    // Se preferir Magic Link ou Senha, podemos ajustar depois.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Garante que ele volte para a sua URL da Vercel
      }
    });

    if (error) {
      alert("Erro ao conectar com o Supabase: " + error.message);
    }
  };

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

          {/* ✅ MUDANÇA AQUI: Trocamos <a> por onClick */}
          <Button 
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium" 
            data-testid="button-login-nav"
          >
            Entrar
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Calculadora Educacional
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Aprenda matemática
            <br />
            <span className="text-orange-500">enquanto calcula</span>
          </h1>

          <p className="text-lg text-zinc-400 mb-8 max-w-lg mx-auto">
            Calculadora científica com explicações passo a passo, guia de fórmulas do ensino médio e muito mais.
          </p>

          {/* ✅ MUDANÇA AQUI: Trocamos <a> por onClick */}
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-6 gap-2" 
            data-testid="button-login-hero"
          >
            Começar Agora <ChevronRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-zinc-500 mt-4">
            Plano gratuito disponível
          </p>
        </motion.div>

        {/* ... restante dos cards igual ... */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto w-full"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
              <Calculator className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Calculadora Científica</h3>
            <p className="text-zinc-400 text-sm">
              Funções trigonométricas, logaritmos, raízes e muito mais com explicações detalhadas.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="p-3 bg-orange-500/10 rounded-xl w-fit mb-4">
              <BookOpen className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Guia de Operadores</h3>
            <p className="text-zinc-400 text-sm">
              Aprenda como usar cada operador matemático com exemplos práticos do dia a dia.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
              <GraduationCap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Fórmulas do Ensino Médio</h3>
            <p className="text-zinc-400 text-sm">
              25+ fórmulas de Matemática, Física e Química prontas para usar.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-sm text-zinc-500">
        CalcEdu 2026 - Calculadora Educacional
      </footer>
    </div>
  );
}