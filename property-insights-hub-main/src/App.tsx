import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHome from "./pages/DashboardHome";
import NovaAvaliacao from "./pages/NovaAvaliacao";
import Avaliacoes from "./pages/Avaliacoes";
import DadosMercado from "./pages/DadosMercado";
import ImoveisVendidos from "./pages/ImoveisVendidos";
import HistoricoLocacoes from "./pages/HistoricoLocacoes";
import BaseMercadoLocacao from "./pages/dashboard/base-mercado/locacao";
import BaseMercadoVenda from "./pages/dashboard/base-mercado/venda";
import Relatorios from "@/pages/dashboard/Relatorios";
import Perfil from "@/pages/dashboard/Perfil";
import RankingBairros from "@/pages/dashboard/RankingBairros";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Admin from "./pages/Admin";
import AdminRoute from "@/components/AdminRoute";
import ImportarSeed from "@/pages/admin/ImportarSeed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner richColors position="top-right" />

        <BrowserRouter>
          <Routes>
            {/* públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            

            {/* protegidas */}
            <Route path="/dashboard" element={ <ProtectedRoute><DashboardHome /></ProtectedRoute> } />
            <Route path="/dashboard/nova-avaliacao" element={ <ProtectedRoute><NovaAvaliacao /></ProtectedRoute>} />
            <Route path="/dashboard/avaliacoes" element={ <ProtectedRoute><Avaliacoes /></ProtectedRoute> } />
            <Route path="/dashboard/mercado" element={ <ProtectedRoute><DadosMercado /></ProtectedRoute>} />
            <Route path="/dashboard/vendidos" element={ <ProtectedRoute><ImoveisVendidos /></ProtectedRoute>} />
            <Route path="/dashboard/locacoes" element={ <ProtectedRoute><HistoricoLocacoes /></ProtectedRoute>} />
            <Route path="/dashboard/base-mercado/locacao" element={ <ProtectedRoute><BaseMercadoLocacao /></ProtectedRoute> } />
            <Route path="/dashboard/base-mercado/venda" element={ <ProtectedRoute><BaseMercadoVenda /></ProtectedRoute> } />
            <Route path="/dashboard/relatorios" element={ <ProtectedRoute><Relatorios /></ProtectedRoute> } />
            <Route path="/dashboard/perfil" element={ <ProtectedRoute><Perfil /></ProtectedRoute> } />
            <Route path="/dashboard/ranking-bairros" element={ <ProtectedRoute><RankingBairros /></ProtectedRoute> } />
            <Route path="/admin" element={ <AdminRoute><Admin /></AdminRoute> } />
            <Route path="/admin/importar-seed" element={<ProtectedRoute><AdminRoute><ImportarSeed /></AdminRoute></ProtectedRoute> } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;