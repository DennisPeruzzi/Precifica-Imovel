import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const soldProperties = [
  { id: "1", endereco: "Rua da Consolação, 500", bairro: "Consolação", tipo: "Apartamento", metragem: 72, valorAnunciado: "R$ 480.000", valorVendido: "R$ 455.000", tempoVenda: 38 },
  { id: "2", endereco: "Rua Pamplona, 120", bairro: "Jardins", tipo: "Apartamento", metragem: 95, valorAnunciado: "R$ 780.000", valorVendido: "R$ 750.000", tempoVenda: 22 },
  { id: "3", endereco: "Rua Vergueiro, 800", bairro: "Vila Mariana", tipo: "Casa", metragem: 180, valorAnunciado: "R$ 950.000", valorVendido: "R$ 920.000", tempoVenda: 55 },
];

const ImoveisVendidos = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Imóveis Vendidos</h1>
            <p className="text-sm text-muted-foreground mt-1">Registre vendas para melhorar suas avaliações</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Venda
          </Button>
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
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Anunciado</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Vendido</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Dias</th>
                </tr>
              </thead>
              <tbody>
                {soldProperties.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground">{p.endereco}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.bairro}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.tipo}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{p.metragem}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{p.valorAnunciado}</td>
                    <td className="px-4 py-3 text-right font-medium text-card-foreground">{p.valorVendido}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{p.tempoVenda}</td>
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

export default ImoveisVendidos;
