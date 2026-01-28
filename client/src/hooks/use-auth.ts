import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient"; 

//Definindo o tipo localmente para remover os erros vermelhos
export interface User {
  id: string;
  email?: string;
  name?: string;
  plan?: string;
  planSelectedAt?: string; // Importante para o seu App.tsx
  [key: string]: any; 
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Função para buscar a sessão atual e os dados do banco
    const getSession = async () => {
      try {
        // Pergunta ao Supabase se tem sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setIsLoading(false);
          return;
        }

        // 2. Se tem sessão, busca os detalhes na tabela 'customers'
        // IMPORTANTE: Usando a tabela 'customers' conforme seu plano
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("email", session.user.email) // Busca pelo email do usuário logado
          .single();

        if (customerError) {
          console.error("Erro ao buscar dados do cliente:", customerError);
          // Se o usuário existe no Auth mas não na tabela, podemos usar os dados básicos
          setUser({
            id: session.user.id,
            username: session.user.email || "",
            // Adapte estes campos conforme o seu tipo 'User' espera
            ...session.user 
          } as unknown as User);
        } else {
          // Combina dados da sessão com dados da tabela
          setUser({ ...session.user, ...customerData } as unknown as User);
        }

      } catch (error) {
        console.error("Erro na autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // 3. Escuta mudanças em tempo real (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        // Recarrega dados se logar
        getSession(); 
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função de Logout corrigida para Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"; // Força ida para home/login
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: false, // O Supabase é instantâneo, não precisa de loading aqui
  };
}