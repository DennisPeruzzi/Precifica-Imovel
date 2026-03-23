import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const valuations = [
  { id: "1", endereco: "Rua Augusta, 1200", bairro: "Consolação", cidade: "São Paulo", tipo: "Apartamento", metragem: 85, preco: "R$ 520.000", estrategia: "equilibrio", data: "08/02/2026", hasReport: true },
  { id: "2", endereco: "Av. Paulista, 800", bairro: "Bela Vista", cidade: "São Paulo", tipo: "Apartamento", metragem: 120, preco: "R$ 890.000", estrategia: "maximizar", data: "07/02/2026", hasReport: true },
  { id: "3", endereco: "Rua Oscar Freire, 340", bairro: "Jardins", cidade: "São Paulo", tipo: "Casa", metragem: 200, preco: "R$ 1.250.000", estrategia: "equilibrio", data: "05/02/2026", hasReport: false },
  { id: "4", endereco: "Rua Haddock Lobo, 55", bairro: "Cerqueira César", cidade: "São Paulo", tipo: "Apartamento", metragem: 65, preco: "R$ 410.000", estrategia: "rapido", data: "03/02/2026", hasReport: true },
  { id: "5", endereco: "Al. Santos, 1500", bairro: "Jardins", cidade: "São Paulo", tipo: "Apartamento", metragem: 150, preco: "R$ 1.050.000", estrategia: "maximizar", data: "01/02/2026", hasReport: false },
];

const estrategiaLabel: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  rapido: { label: "Rápido", variant: "outline" },
  equilibrio: { label: "Equilíbrio", variant: "secondary" },
  maximizar: { label: "Maximizar", variant: "default" },
};

const Avaliacoes = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Avaliações</h1>
            <p className="text-sm text-muted-foreground mt-1">Histórico de precificações realizadas</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por endereço ou bairro..." className="pl-9" />
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Endereço</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bairro</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">m²</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estratégia</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Laudo</th>
                </tr>
              </thead>
              <tbody>
                {valuations.map((v) => {
                  const est = estrategiaLabel[v.estrategia];
                  return (
                    <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-card-foreground">{v.endereco}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.bairro}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.tipo}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{v.metragem}</td>
                      <td className="px-4 py-3 text-right font-medium text-card-foreground">{v.preco}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={est.variant}>{est.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{v.data}</td>
                      <td className="px-4 py-3 text-center">
                        {v.hasReport ? (
                          <button className="text-accent hover:text-accent/80 transition-colors">
                            <FileText className="h-4 w-4 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Avaliacoes;
