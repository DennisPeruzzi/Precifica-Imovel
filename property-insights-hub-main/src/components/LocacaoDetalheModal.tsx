import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RentalValuationRow = {
  id: string;
  created_at: string;
  cidade: string;
  bairro: string;
  tipo: string;
  padrao: string;
  area_m2: number;
  quartos: number | null;
  vagas: number | null;
  mobiliado: boolean | null;
  rent_estimada: number | null;
  rent_min: number | null;
  rent_max: number | null;
  confidence: string | null;
  explain_json: any;
};

const formatBRL = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

const formatDateTimeBR = (iso: string) => new Date(iso).toLocaleString("pt-BR");

function safeStringify(value: any) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return String(value);
  }
}

export function LocacaoDetalheModal({
  open,
  onOpenChange,
  row,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: RentalValuationRow | null;
}) {
  const jsonText = useMemo(() => safeStringify(row?.explain_json), [row]);

  const copyResumo = async () => {
    if (!row) return;
    const resumo =
      [
        `Histórico de Locação`,
        `Data: ${formatDateTimeBR(row.created_at)}`,
        `Local: ${row.bairro} - ${row.cidade}`,
        `Imóvel: ${row.tipo} • ${row.padrao} • ${row.area_m2}m² • ${row.quartos ?? 0}q • ${row.vagas ?? 0}v • ${
          row.mobiliado ? "Mobiliado" : "Não mobiliado"
        }`,
        `Aluguel estimado: ${formatBRL(row.rent_estimada)}`,
        `Faixa: ${formatBRL(row.rent_min)} – ${formatBRL(row.rent_max)}`,
        `base de dados: ${(row.confidence ?? "baixa").toUpperCase()}`,
      ].join("\n") + "\n";

    await navigator.clipboard.writeText(resumo);
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(jsonText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Locação</DialogTitle>
          <DialogDescription>Resumo + explain_json</DialogDescription>
        </DialogHeader>

        {!row ? (
          <div className="text-sm text-muted-foreground">Sem dados para exibir.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Data</div>
                  <div className="font-medium">{formatDateTimeBR(row.created_at)}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Aluguel estimado</div>
                  <div className="text-xl font-bold">{formatBRL(row.rent_estimada)}</div>
                  <div className="text-xs text-muted-foreground">
                    Faixa: {formatBRL(row.rent_min)} – {formatBRL(row.rent_max)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Local</div>
                  <div className="font-medium">{row.bairro}</div>
                  <div className="text-xs text-muted-foreground">{row.cidade}</div>
                </div>

                <div className="rounded-lg bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Imóvel</div>
                  <div className="font-medium">
                    {row.tipo} • {row.padrao}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.area_m2}m² • {row.quartos ?? 0}q • {row.vagas ?? 0}v •{" "}
                    {row.mobiliado ? "Mobiliado" : "Não mobiliado"}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Base de dados</div>
                  <div className="font-medium">{(row.confidence ?? "baixa").toUpperCase()}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={copyResumo}>
                  Copiar resumo
                </Button>
                <Button variant="outline" onClick={copyJson}>
                  Copiar JSON
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-medium">Explicação (JSON)</p>
                <p className="text-xs text-muted-foreground">explain_json</p>
              </div>
              <pre className="p-4 text-xs overflow-auto max-h-[420px] bg-muted/20">{jsonText}</pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
