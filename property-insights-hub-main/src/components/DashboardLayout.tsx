import { Link, useLocation, } from "react-router-dom";
import { TrendingUp, LayoutDashboard, List, BarChart3, Building, LogOut, Calculator, UserRoundPen, BadgeDollarSign, ListCheck, House,ChartBarBig, } from "lucide-react";
import { useRole } from "@/hooks/useRole";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/dashboard/nova-avaliacao", icon: Calculator, label: "Nova Avaliação" },
  { to: "/dashboard/avaliacoes", icon: List, label: "Avaliações Venda" },
  { to: "/dashboard/mercado", icon: BarChart3, label: "Dados de Mercado" },
  { to: "/dashboard/vendidos", icon: Building, label: "Histórico Vendas" },
  { to: "/dashboard/locacoes", icon: House, label: "Histórico Locações" },
  { to: "/dashboard/base-mercado/locacao", icon: BadgeDollarSign, label: "Base de Mercado (Locação)" },
  { to: "/dashboard/base-mercado/venda", icon: BadgeDollarSign, label: "Base de Mercado (Venda)" },
  { to: "/dashboard/relatorios", icon: ListCheck, label: "Relatórios Locação" },
  { to: "/dashboard/ranking-bairros", icon: ChartBarBig, label: "Ranking de Bairros" },
  { to: "/dashboard/perfil", icon: UserRoundPen, label: "Perfil" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { role } = useRole();

   return (
    <div className="min-h-screen flex bg-background font-body">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src="/logo-sem-nome.png" className="h-10 w-auto" />
              <span className="text-2xl font-display font-bold text-primary-foreground">PrecificaImóvel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <div>🛠 Admin</div>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between border-b border-border p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src="/logo-sem-nome.png" className="h-8 w-auto" />
             <span className="text-2xl font-display font-bold text-primary-foreground">PrecificaImóvel</span>
            </div>
          </Link>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 p-2 border-b border-border overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
