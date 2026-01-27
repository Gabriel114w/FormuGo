import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-xl text-zinc-400">Página não encontrada</p>
        <Link 
          href="/" 
          className="inline-block mt-4 px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
        >
          Voltar para a Calculadora
        </Link>
      </div>
    </div>
  );
}
