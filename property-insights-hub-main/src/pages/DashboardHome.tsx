import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, PlusCircle, TrendingUp, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface Valuation {
  id: string;
  endereco: string | null;
  bairro: string | null;
  tipo: string | null;
  preco_calculado: number | null;
  created_at: string | null;
}

interface StatItem {
  label: string;
  value: string;
  icon: typeof BarChart3;
  change: string;
}

const DashboardHome = () => {
  const [name, setName] = useState("");
  const [recentValuations, setRecentValuations] = useState<Valuation[]>([]);
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Avaliações este mês", value: "0", icon: BarChart3, change: "" },
    { label: "Valor médio avaliado", value: "R$ 0", icon: TrendingUp, change: "" },
    { label: "Laudos gerados", value: "0", icon: FileText, change: "" },
  ]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {navigate("/login"); return;} 

      const userId = userData.user.id;

      // Buscar nome do perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      if (profile) {
        setName(profile.name ?? "");
      }

      // Buscar avaliações recentes
      const { data: valuations } = await supabase
        .from("property_valuations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (valuations) {
        setRecentValuations(valuations);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const thisMonth = valuations.filter((v) => {
          const date = new Date(v.created_at ?? "");
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        });

        const avgPrice =
          valuations.length > 0
            ? valuations.reduce((acc, v) => acc + Number(v.preco_calculado ?? 0), 0) /
              valuations.length
            : 0;

        setStats([
          {
            label: "Avaliações este mês",
            value: String(thisMonth.length),
            icon: BarChart3,
            change: "",
          },
          {
            label: "Valor médio avaliado",
            value: `R$ ${avgPrice.toLocaleString("pt-BR")}`,
            icon: TrendingUp,
            change: "",
          },
          {
            label: "Laudos gerados",
            value: String(valuations.length),
            icon: FileText,
            change: "",
          },
        ]);
      }
    };

    loadDashboardData();
  }, []);

  const { profile, loading } = useProfile();

  if (loading) return <p>Carregando...</p>;


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bem-vindo de volta, {""}{profile?.name || "Usuário"}
            </p>
          </div>
          <Link to="/dashboard/nova-avaliacao">
            <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors shadow-accent-glow">
              <PlusCircle className="h-4 w-4" />
              Nova Avaliação
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-2xl font-display font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent valuations */}
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Avaliações Recentes</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Endereço</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bairro</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentValuations.map((v) => (
                    <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-card-foreground">{v.endereco}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.bairro}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.tipo}</td>
                      <td className="px-4 py-3 text-right font-medium text-card-foreground">
                        R$ {Number(v.preco_calculado ?? 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(v.created_at ?? "").toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                  {recentValuations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        Nenhuma avaliação encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
