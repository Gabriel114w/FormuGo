import { useState } from "react"; // ✅ Adicionado
import { Calculator, Sparkles, BookOpen, GraduationCap, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ✅ Certifique-se que este componente existe
import { motion } from "framer-motion";
import { supabase } from "@/supabaseClient";

export default function LandingPage() {
  const [email, setEmail] = useState(""); // ✅ Estado para o e-mail
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);
    if (error) {
      alert("Erro: " + error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-y-auto">
      {/* Nav ... igual anterior ... */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/80 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">CalcEdu</span>
          </div>
          <Button variant="ghost" onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Entrar
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Aprenda matemática <span className="text-orange-500">enquanto calcula</span>
          </h1>

          {/* ✅ NOVO FORMULÁRIO DE LOGIN DEBAIXO DO TEXTO */}
          <div id="login-section" className="mt-10 max-w-md mx-auto p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
            {!sent ? (
              <form onSubmit={handleLogin} className="flex flex-col md:flex-row gap-2 p-2">
                <Input 
                  type="email" 
                  placeholder="Seu melhor e-mail..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-zinc-500"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-6"
                >
                  {isLoading ? "Enviando..." : "Começar Agora"}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="p-6 text-center animate-in fade-in zoom-in">
                <Mail className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg">Verifique seu e-mail!</h3>
                <p className="text-zinc-400 text-sm">Enviamos um link mágico para você acessar sua conta.</p>
              </div>
            )}
          </div>

          <p className="text-sm text-zinc-500 mt-6">
            Plano gratuito disponível para estudantes.
          </p>
        </motion.div>

        {/* ... Seus cards de funcionalidades aqui embaixo ... */}
      </main>
    </div>
  );
}