import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocacaoDetalheModal } from "@/components/LocacaoDetalheModal";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";

const ALL = "__ALL__";

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

const formatBRL = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDateTimeBR = (iso: string) => new Date(iso).toLocaleString("pt-BR");

const getScopeLabel = (row: RentalValuationRow) => {
  const scope = row?.explain_json?.source ?? row?.explain_json?.final?.scope ?? row?.explain_json?.raw?.scope;

  if (scope === "seed" || scope === "market_rent_m2") return "Pesquisa de mercado";
  if (scope === "bairro") return "Pesquisa local";
  if (scope === "cidade") return "Pesquisa regional";
  if (scope === "learned" || scope === "learned_rent_m2") return "Pesquisa local";
  if (scope === "fallback") return "Fallback";
  return "Referência de mercado";
};

export default function HistoricoLocacoes() {
  const [rows, setRows] = useState<RentalValuationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState(ALL);
  const [bairro, setBairro] = useState(ALL);
  const [tipo, setTipo] = useState(ALL);
  const [padrao, setPadrao] = useState(ALL);

  const [selected, setSelected] = useState<RentalValuationRow | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [openLocadoModal, setOpenLocadoModal] = useState(false);
  const [selectedLocacao, setSelectedLocacao] = useState<RentalValuationRow | null>(null);

  const [precoAnunciado, setPrecoAnunciado] = useState("");
  const [precoLocado, setPrecoLocado] = useState("");
  const [diasParaAlugar, setDiasParaAlugar] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchesQuery =
        !query ||
        `${r.cidade} ${r.bairro} ${r.tipo} ${r.padrao}`.toLowerCase().includes(query);

      const matchesCidade = cidade === ALL || r.cidade === cidade;
      const matchesBairro = bairro === ALL || r.bairro === bairro;
      const matchesTipo = tipo === ALL || r.tipo === tipo;
      const matchesPadrao = padrao === ALL || r.padrao === padrao;

      return matchesQuery && matchesCidade && matchesBairro && matchesTipo && matchesPadrao;
    });
  }, [rows, q, cidade, bairro, tipo, padrao]);

  const cidades = useMemo(() => Array.from(new Set(rows.map((r) => r.cidade))).sort(), [rows]);

  const bairros = useMemo(() => {
    const base = rows
      .filter((r) => (cidade === ALL ? true : r.cidade === cidade))
      .map((r) => r.bairro);
    return Array.from(new Set(base)).sort();
  }, [rows, cidade]);

  const tipos = useMemo(() => Array.from(new Set(rows.map((r) => r.tipo))).sort(), [rows]);
  const padroes = useMemo(() => Array.from(new Set(rows.map((r) => r.padrao))).sort(), [rows]);

  const load = async () => {
    console.log("[HistoricoLocacoes] load() iniciou");
    setLoading(true);
    setErrorMsg(null);

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao buscar no Supabase (8s)")), 8000)
      );

      const request = supabase
        .from("rental_valuations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const res: any = await Promise.race([request, timeout]);

      console.log("[HistoricoLocacoes] resposta supabase:", res);

      const { data, error } = res;
      if (error) throw error;

      setRows((data ?? []) as RentalValuationRow[]);
    } catch (err: any) {
      console.error("[HistoricoLocacoes] ERRO no load():", err);
      setErrorMsg(err?.message ?? "Erro ao carregar histórico.");
    } finally {
      console.log("[HistoricoLocacoes] load() finalizou -> setLoading(false)");
      setLoading(false);
    }
  };

  const csvEscape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const jsonOneLine = (value: any) => {
    try {
      return JSON.stringify(value ?? null);
    } catch {
      return String(value ?? "");
    }
  };

  const exportCSV = () => {
    const headers = [
      "data",
      "cidade",
      "bairro",
      "tipo",
      "padrao",
      "area_m2",
      "quartos",
      "banheiros",
      "vagas",
      "mobiliado",
      "aluguel_estimado",
      "aluguel_min",
      "aluguel_max",
      "confianca",
      "explain_json",
      "id",
    ];

    const lines = [
      headers.join(";"),
      ...filtered.map((r) =>
        [
          formatDateTimeBR(r.created_at),
          r.cidade,
          r.bairro,
          r.tipo,
          r.padrao,
          r.area_m2,
          r.quartos ?? "",
          r.banheiros ?? "",
          r.vagas ?? "",
          r.mobiliado ? "sim" : "nao",
          r.rent_estimada ?? "",
          r.rent_min ?? "",
          r.rent_max ?? "",
          r.confidence ?? "",
          jsonOneLine(r.explain_json),
          r.id,
        ]
          .map(csvEscape)
          .join(";")
      ),
    ];

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    a.href = url;
    a.download = `historico-locacoes-${yyyy}-${mm}-${dd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success("CSV exportado com sucesso!");
  };

  const handleSalvarLocacao = async () => {
    if (!selectedLocacao) return;

    const anunciado = Number(precoAnunciado);
    const locado = Number(precoLocado);
    const dias = Number(diasParaAlugar);

    if (!anunciado || !locado) {
      toast.error("Preencha os valores obrigatórios.");
      return;
    }

    const desconto = ((anunciado - locado) / anunciado) * 100;

    const { error } = await supabase
      .from("rental_valuations")
      .update({
        status: "locado",
        valor_anunciado: anunciado,
        rent_real: locado,
        dias_para_locar: dias,
        percentual_desconto: desconto,
        locado_em: new Date().toISOString(),
      })
      .eq("id", selectedLocacao.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setOpenLocadoModal(false);
    setSelectedLocacao(null);
    setPrecoAnunciado("");
    setPrecoLocado("");
    setDiasParaAlugar("");

    await load();
    toast.success("Locação registrada com sucesso.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta avaliação?")) return;

    const { error } = await supabase.from("rental_valuations").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await load();
    toast.success("Avaliação excluída com sucesso.");
  };

  const handleVerDetalhes = (row: RentalValuationRow) => {
    setSelected(row);
    setOpenModal(true);
  };

  const handleGerarPdf = async (row: RentalValuationRow) => {
    try {
      const { data: report, error } = await supabase
        .from("reports")
        .select("storage_path")
        .eq("evaluation_id", row.id)
        .eq("deal_type", "locacao")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!report?.storage_path) {
        toast("Este laudo ainda não foi gerado por esta tela.");
        return;
      }

      const { data } = supabase.storage.from("reports").getPublicUrl(report.storage_path);

      if (!data?.publicUrl) {
        toast.error("Não foi possível obter o link do PDF.");
        return;
      }

      window.open(data.publicUrl, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao abrir o PDF.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Histórico de Locações
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Últimas estimativas de aluguel geradas (aluguel separado de custos)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={exportCSV} variant="outline" disabled={loading || filtered.length === 0}>
              Exportar CSV
            </Button>
            <Button onClick={load} variant="outline" disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              placeholder="Buscar (cidade, bairro, tipo...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="md:col-span-2"
            />

            <Select value={cidade} onValueChange={setCidade}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {cidades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bairro} onValueChange={setBairro}>
              <SelectTrigger>
                <SelectValue placeholder="Bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {bairros.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={padrao} onValueChange={setPadrao}>
              <SelectTrigger>
                <SelectValue placeholder="Padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {padroes.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setQ("");
              setCidade(ALL);
              setBairro(ALL);
              setTipo(ALL);
              setPadrao(ALL);
            }}
          >
            Limpar filtros
          </Button>

          {errorMsg && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="text-foreground font-medium">{filtered.length}</span> registros
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nenhuma locação encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Data</th>
                    <th className="text-left font-medium px-4 py-3">Local</th>
                    <th className="text-left font-medium px-4 py-3">Imóvel</th>
                    <th className="text-left font-medium px-4 py-3">Aluguel</th>
                    <th className="text-left font-medium px-4 py-3">Faixa</th>
                    <th className="text-left font-medium px-4 py-3">Base de Dados</th>
                    <th className="text-left font-medium px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateTimeBR(r.created_at)}</td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{r.bairro}</div>
                        <div className="text-xs text-muted-foreground">{r.cidade}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {r.tipo} • {r.padrao}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.area_m2}m² • {r.quartos ?? 0}q • {r.vagas ?? 0}v • {r.mobiliado ? "Mobiliado" : "Não mobiliado"}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatBRL(r.rent_estimada)}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {formatBRL(r.rent_min)} – {formatBRL(r.rent_max)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-card-foreground">
                          {getScopeLabel(r)}
                        </div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              (r.confidence ?? "").toLowerCase() === "alta"
                                ? "bg-green-500/10 text-green-600"
                                : (r.confidence ?? "").toLowerCase() === "media"
                                ? "bg-yellow-500/10 text-yellow-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {(r.confidence ?? "baixa").toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGerarPdf(r);
                            }}
                          >
                            Gerar PDF
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalhes(r);
                            }}
                          >
                            Ver Detalhes
                          </Button>

                          {r.status !== "locado" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLocacao(r);
                                setOpenLocadoModal(true);
                              }}
                            >
                              Imóvel Locado?
                            </Button>
                          )}

                          {r.status !== "locado" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(r.id);
                              }}
                            >
                              Excluir
                            </Button>
                          )}

                          {r.status === "locado" && (
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600">
                              Locação registrada
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <LocacaoDetalheModal open={openModal} onOpenChange={setOpenModal} row={selected} />

      <Dialog
  open={openLocadoModal}
  onOpenChange={(open) => {
    setOpenLocadoModal(open);
    if (!open) {
      setSelectedLocacao(null);
      setPrecoAnunciado("");
      setPrecoLocado("");
      setDiasParaAlugar("");
    }
  }}
>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Registrar locação</DialogTitle>
      <DialogDescription>
        Informe os dados reais da locação para alimentar a inteligência de mercado.
      </DialogDescription>
    </DialogHeader>

    {selectedLocacao && (
      <div className="space-y-5">
        <div className="rounded-xl border p-4 space-y-2">
          <h3 className="font-semibold text-foreground">Resumo do imóvel</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Local:</span>{" "}
              {selectedLocacao.bairro} / {selectedLocacao.cidade}
            </p>
            <p>
              <span className="font-medium text-foreground">Imóvel:</span>{" "}
              {selectedLocacao.tipo} • {selectedLocacao.padrao}
            </p>
            <p>
              <span className="font-medium text-foreground">Metragem:</span>{" "}
              {selectedLocacao.area_m2} m²
            </p>
            <p>
              <span className="font-medium text-foreground">Aluguel estimado:</span>{" "}
              {formatBRL(selectedLocacao.rent_estimada)}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Preço anunciado</label>
            <Input
              value={precoAnunciado}
              onChange={(e) => setPrecoAnunciado(e.target.value)}
              placeholder="Ex: 3500"
              inputMode="decimal"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Preço que foi locado</label>
            <Input
              value={precoLocado}
              onChange={(e) => setPrecoLocado(e.target.value)}
              placeholder="Ex: 3200"
              inputMode="decimal"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Dias para alugar</label>
            <Input
              value={diasParaAlugar}
              onChange={(e) => setDiasParaAlugar(e.target.value)}
              placeholder="Ex: 18"
              inputMode="numeric"
              className="mt-1"
            />
          </div>
        </div>

        {precoAnunciado && precoLocado && Number(precoAnunciado) > 0 && Number(precoLocado) > 0 && (
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
            <p>
              <span className="font-medium text-foreground">Desconto da negociação:</span>{" "}
              <strong>
                {(
                  ((Number(precoAnunciado) - Number(precoLocado)) / Number(precoAnunciado)) *
                  100
                ).toFixed(2)}
                %
              </strong>
            </p>

            <p>
              <span className="font-medium text-foreground">Preço final por m²:</span>{" "}
              <strong>
                {formatBRL(Number(precoLocado) / selectedLocacao.area_m2)}
              </strong>
            </p>
          </div>
        )}
      </div>
    )}

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setOpenLocadoModal(false);
          setSelectedLocacao(null);
          setPrecoAnunciado("");
          setPrecoLocado("");
          setDiasParaAlugar("");
        }}
      >
        Cancelar
      </Button>

      <Button onClick={handleSalvarLocacao}>
        Salvar locação
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </DashboardLayout>
  );
}