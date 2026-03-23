import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const marketData = [
  { bairro: "Jardins", tipo: "Apartamento", valorM2: "R$ 12.500", variacao: "+4.2%", anuncios: 342 },
  { bairro: "Consolação", tipo: "Apartamento", valorM2: "R$ 9.800", variacao: "+2.1%", anuncios: 187 },
  { bairro: "Bela Vista", tipo: "Apartamento", valorM2: "R$ 8.200", variacao: "-1.3%", anuncios: 256 },
  { bairro: "Pinheiros", tipo: "Apartamento", valorM2: "R$ 11.300", variacao: "+5.8%", anuncios: 198 },
  { bairro: "Vila Mariana", tipo: "Apartamento", valorM2: "R$ 9.100", variacao: "+3.0%", anuncios: 165 },
  { bairro: "Moema", tipo: "Apartamento", valorM2: "R$ 10.700", variacao: "+2.5%", anuncios: 143 },
  { bairro: "Itaim Bibi", tipo: "Apartamento", valorM2: "R$ 13.800", variacao: "+6.1%", anuncios: 210 },
];

const DadosMercado = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dados de Mercado</h1>
          <p className="text-sm text-muted-foreground mt-1">Valores médios por m² por bairro — atualizado em Fev/2026</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bairro</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor/m²</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Variação</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Anúncios</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((d) => (
                  <tr key={d.bairro} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground">{d.bairro}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.tipo}</td>
                    <td className="px-4 py-3 text-right font-medium text-card-foreground">{d.valorM2}</td>
                    <td className={`px-4 py-3 text-right font-medium ${d.variacao.startsWith("+") ? "text-success" : "text-destructive"}`}>
                      {d.variacao}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{d.anuncios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DadosMercado;
