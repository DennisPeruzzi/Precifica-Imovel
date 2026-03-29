import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RentalValuationRow = {
  id: string;
  created_at: string;
  cidade: string;
  bairro: string;
  tipo: string;
  padrao: string;
  area_m2: number;
  quartos: number | null;
  banheiros?: number | null;
  vagas: number | null;
  mobiliado: boolean | null;
  possui_edicula?: boolean | null;
  rent_estimada: number | null;
  rent_min: number | null;
  rent_max: number | null;
  confidence: string | null;
  explain_json: any;
  status?: string | null;
  valor_anunciado?: number | null;
  rent_real?: number | null;
  dias_para_locar?: number | null;
  percentual_desconto?: number | null;
  locado_em?: string | null;
  notes?: string | null;
};

type LocacaoDetalheModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: RentalValuationRow | null;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
};

const getScopeLabel = (row?: RentalValuationRow | null) => {
  const scope =
    row?.explain_json?.source ??
    row?.explain_json?.final?.scope ??
    row?.explain_json?.raw?.scope;

  if (scope === "seed" || scope === "market_rent_m2") return "Pesquisa de mercado";
  if (scope === "bairro") return "Pesquisa local";
  if (scope === "cidade") return "Pesquisa regional";
  if (scope === "learned" || scope === "learned_rent_m2") return "Pesquisa local";
  if (scope === "fallback") return "Fallback";
  return "Referência de mercado";
};

const getConfidenceLabel = (confidence?: string | null) => {
  if (!confidence) return "Baixa";
  if (confidence.toLowerCase() === "alta") return "Alta";
  if (confidence.toLowerCase() === "media") return "Média";
  return "Baixa";
};

const getStatusLabel = (status?: string | null) => {
  if (status === "locado") return "Locado";
  return "Avaliado";
};

export function LocacaoDetalheModal({
  open,
  onOpenChange,
  row,
}: LocacaoDetalheModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Avaliação de Locação</DialogTitle>
          <DialogDescription>
            Visualize os dados completos da estimativa de aluguel realizada.
          </DialogDescription>
        </DialogHeader>

        {row && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4 space-y-2">
                <h3 className="font-semibold text-foreground">Imóvel</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Bairro:</span> {row.bairro || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Cidade:</span> {row.cidade || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Tipo:</span> {row.tipo || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Padrão:</span> {row.padrao || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Metragem:</span>{" "}
                    {row.area_m2 ? `${row.area_m2} m²` : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <h3 className="font-semibold text-foreground">Características</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Quartos:</span> {row.quartos ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Banheiros:</span> {row.banheiros ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Vagas:</span> {row.vagas ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Mobiliado:</span>{" "}
                    {row.mobiliado ? "Sim" : "Não"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Edícula:</span>{" "}
                    {row.possui_edicula ? "Sim" : "Não"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Status:</span>{" "}
                    <Badge variant={row.status === "locado" ? "default" : "secondary"}>
                      {getStatusLabel(row.status)}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4 space-y-2">
                <h3 className="font-semibold text-foreground">Precificação</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Aluguel estimado:</span>{" "}
                    {formatCurrency(row.rent_estimada)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Faixa mínima:</span>{" "}
                    {formatCurrency(row.rent_min)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Faixa máxima:</span>{" "}
                    {formatCurrency(row.rent_max)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Base de dados:</span>{" "}
                    {getScopeLabel(row)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Confiança:</span>{" "}
                    {getConfidenceLabel(row.confidence)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Data da avaliação:</span>{" "}
                    {formatDateTime(row.created_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <h3 className="font-semibold text-foreground">Locação Real</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Valor anunciado:</span>{" "}
                    {formatCurrency(row.valor_anunciado)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Valor locado:</span>{" "}
                    {formatCurrency(row.rent_real)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Dias para alugar:</span>{" "}
                    {row.dias_para_locar ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Desconto:</span>{" "}
                    {row.percentual_desconto !== null && row.percentual_desconto !== undefined
                      ? `${row.percentual_desconto.toFixed(2)}%`
                      : "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Locado em:</span>{" "}
                    {formatDate(row.locado_em)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Observações:</span>{" "}
                    {row.notes || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}