import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

type MarketRow = {
  id: string;
  bairro: string;
  tipo: string;
  valorM2: number;
  variacao: number | null;
  anuncios: number;
};

const marketData: MarketRow[] = [
  {
    id: "indaia-apartamento",
    bairro: "Indaiá",
    tipo: "Apartamento",
    valorM2: 6500,
    variacao: 2.4,
    anuncios: 18,
  },
  {
    id: "centro-casa",
    bairro: "Centro",
    tipo: "Casa",
    valorM2: 5800,
    variacao: 1.2,
    anuncios: 11,
  },
  {
    id: "martim-de-sa-apartamento",
    bairro: "Martim de Sá",
    tipo: "Apartamento",
    valorM2: 6200,
    variacao: 3.1,
    anuncios: 15,
  },
  {
    id: "porto-novo-casa",
    bairro: "Porto Novo",
    tipo: "Casa",
    valorM2: 4300,
    variacao: -0.8,
    anuncios: 9,
  },
  {
    id: "jaragua-terreno",
    bairro: "Jaraguá",
    tipo: "Terreno",
    valorM2: 2100,
    variacao: 0.5,
    anuncios: 7,
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatVariation = (value: number | null) => {
  if (value === null) return "—";
  if (value > 0) return `+${value.toFixed(1)}%`;
  if (value < 0) return `${value.toFixed(1)}%`;
  return "0,0%";
};

const getVariationClass = (value: number | null) => {
  if (value === null) return "text-muted-foreground";
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
};

const DadosMercado = () => {
  const totalAnuncios = marketData.reduce((acc, item) => acc + item.anuncios, 0);
  const mediaValorM2 =
    marketData.length > 0
      ? marketData.reduce((acc, item) => acc + item.valorM2, 0) / marketData.length
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Dados de Mercado
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Valores médios por m² por bairro. Estrutura pronta para análise de mercado.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Registros exibidos</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{marketData.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total de anúncios</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalAnuncios}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Valor médio por m²</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(mediaValorM2)}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Bairro
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Valor/m²
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Variação
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Anúncios
                  </th>
                </tr>
              </thead>

              <tbody>
                {marketData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Nenhum dado de mercado disponível no momento.
                    </td>
                  </tr>
                ) : (
                  marketData.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-card-foreground">
                        {d.bairro}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.tipo}</td>
                      <td className="px-4 py-3 text-right font-medium text-card-foreground">
                        {formatCurrency(d.valorM2)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${getVariationClass(
                          d.variacao
                        )}`}
                      >
                        {formatVariation(d.variacao)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {d.anuncios}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DadosMercado;