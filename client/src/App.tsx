import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import CalculatorPage from "@/pages/Calculator";
import LandingPage from "@/pages/LandingPage";
import PlansPage from "@/pages/PlansPage";
import { Loader2 } from "lucide-react";
import { supabase } from "./supabaseClient"; // ✅ import do Supabase

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );
}

function AuthenticatedRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (!user?.planSelectedAt && location !== "/plans") {
    return <PlansPage />;
  }

  return (
    <Switch>
      <Route path="/" component={CalculatorPage} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/plans" component={PlansPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // ✅ função de teste de conexão
  const testConnection = async () => {
    const { data, error } = await supabase.from("customers").select("*");
    console.log("Conexão com Customers:", data, error);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Botão temporário para testar conexão */}
        <div className="p-4">
          <button
            onClick={testConnection}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Testar Supabase
          </button>
        </div>
        <AuthenticatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
