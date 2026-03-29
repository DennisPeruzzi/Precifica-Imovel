import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,} from "@/components/ui/dialog";
import { pdf } from "@react-pdf/renderer";
import { v4 as uuidv4 } from "uuid";
import { LaudoVendaPDF } from "@/features/pdf/LaudoVendaPDF";

type SaleHistoryRow = {
  id: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  tipo: string | null;
  metragem: number | null;
  quartos: number | null;
  banheiros: number | null;
  vagas: number | null;
  padrao: string | null;
  estrategia: "rapido" | "normal" | "maximizar" | string | null;
  valor_base_m2: number | null;
  preco_calculado: number | null;
  faixa_min: number | null;
  faixa_max: number | null;
  tempo_estimado: number | null;
  valor_anunciado: number | null;
  preco_venda_real: number | null;
  status: string | null;
  vendido_em: string | null;
  notes: string | null;
  created_at: string | null;
};

const formatBRL = (value?: number | null) => {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
};

const formatTipo = (value?: string | null) => {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatEstrategia = (value?: string | null) => {
  if (!value) return "—";
  if (value === "rapido") return "Rápido";
  if (value === "maximizar") return "Maximizar";
  return "Equilíbrio";
};

const ImoveisVendidos = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<SaleHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [estrategiaFilter, setEstrategiaFilter] = useState("todos");
  const [padraoFilter, setPadraoFilter] = useState("todos");

  const [openVendidoModal, setOpenVendidoModal] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<SaleHistoryRow | null>(null);

  const [valorAnunciado, setValorAnunciado] = useState("");
  const [valorVendido, setValorVendido] = useState("");
  const [dataVenda, setDataVenda] = useState("");

  const [selectedSale, setSelectedSale] = useState<SaleHistoryRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [profile, setProfile] = useState<{ nome: string | null; creci: string | null; plano: string | null; apelido: string | null; } | null>(null);

  const [laudosEmitidos, setLaudosEmitidos] = useState<Record<string, boolean>>({});

  const handleViewDetails = (sale: SaleHistoryRow) => { setSelectedSale(sale); setDetailsOpen(true);};

  const loadSalesHistory = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from("property_valuations")
        .select(`
          id,
          endereco,
          bairro,
          cidade,
          tipo,
          metragem,
          quartos,
          banheiros,
          vagas,
          padrao,
          estrategia,
          valor_base_m2,
          preco_calculado,
          faixa_min,
          faixa_max,
          tempo_estimado,
          valor_anunciado,
          preco_venda_real,
          status,
          vendido_em,
          notes,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const sales = (data as SaleHistoryRow[]) || [];
      setItems(sales);

      const ids = sales.map((item) => item.id);

      if (ids.length > 0) {
      const { data: reportRows, error: reportError } = await supabase
      .from("reports")
      .select("evaluation_id")
      .eq("deal_type", "venda")
      .in("evaluation_id", ids);

      if (reportError) throw reportError;

      const map: Record<string, boolean> = {};
        (reportRows || []).forEach((rep: any) => {
      if (rep.evaluation_id) {
        map[rep.evaluation_id] = true;
      }
    });

      setLaudosEmitidos(map);
    } else {
      setLaudosEmitidos({});
    }

    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar histórico de vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesHistory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();

      const matchSearch =
        !q ||
        item.endereco?.toLowerCase().includes(q) ||
        item.bairro?.toLowerCase().includes(q) ||
        item.cidade?.toLowerCase().includes(q) ||
        item.tipo?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "todos" || (item.status ?? "avaliado") === statusFilter;

      const matchTipo =
        tipoFilter === "todos" || (item.tipo ?? "") === tipoFilter;

      const matchEstrategia =
        estrategiaFilter === "todos" || (item.estrategia ?? "") === estrategiaFilter;

      const matchPadrao =
        padraoFilter === "todos" || (item.padrao ?? "") === padraoFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchTipo &&
        matchEstrategia &&
        matchPadrao
      );
    });
  }, [items, search, statusFilter, tipoFilter, estrategiaFilter, padraoFilter]);

useEffect(() => {
  const loadProfile = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("nome, creci, plano, apelido")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  loadProfile();
}, []);

  const totalAvaliacoes = filteredItems.length;

  const totalVendidos = useMemo(
    () => filteredItems.filter((item) => item.status === "vendido").length,
    [filteredItems]
  );

  const ticketMedioVendido = useMemo(() => {
    const vendidos = filteredItems.filter(
      (item) => item.status === "vendido" && item.preco_venda_real
    );

    if (vendidos.length === 0) return null;

    const total = vendidos.reduce(
      (acc, item) => acc + Number(item.preco_venda_real || 0),
      0
    );

    return total / vendidos.length;
  }, [filteredItems]);

  const handleExportCsv = () => {
    try {
      if (filteredItems.length === 0) {
        toast.error("Não há dados para exportar.");
        return;
      }

      const headers = [
        "data",
        "cidade",
        "bairro",
        "tipo",
        "padrao",
        "metragem",
        "quartos",
        "banheiros",
        "vagas",
        "estrategia",
        "preco_calculado",
        "faixa_min",
        "faixa_max",
        "valor_anunciado",
        "preco_venda_real",
        "status",
      ];

      const rows = filteredItems.map((item) => [
        item.status === "vendido" ? formatDate(item.vendido_em) : formatDate(item.created_at),
        item.cidade ?? "",
        item.bairro ?? "",
        item.tipo ?? "",
        item.padrao ?? "",
        item.metragem ?? "",
        item.quartos ?? "",
        item.banheiros ?? "",
        item.vagas ?? "",
        item.estrategia ?? "",
        item.preco_calculado ?? "",
        item.faixa_min ?? "",
        item.faixa_max ?? "",
        item.valor_anunciado ?? "",
        item.preco_venda_real ?? "",
        item.status ?? "",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "historico-vendas.csv";
      link.click();

      URL.revokeObjectURL(url);
      toast.success("CSV exportado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar CSV.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Deseja excluir esta avaliação de venda?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("property_valuations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Avaliação excluída com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir avaliação.");
    }
  };

    const handleVerLaudo = async (evaluationId: string) => {
    try {
    const { data: report, error } = await supabase
      .from("reports")
      .select("storage_path")
      .eq("evaluation_id", evaluationId)
      .eq("deal_type", "venda")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!report?.storage_path) {
      toast.error("Laudo ainda não emitido para esta avaliação.");
      return;
    }

    const { data } = supabase.storage.from("reports").getPublicUrl(report.storage_path);

    if (!data?.publicUrl) {
      throw new Error("Não foi possível obter o link do PDF.");
    }

    window.open(data.publicUrl, "_blank");
  } catch (err) {
    console.error(err);
    toast.error("Falha ao abrir o laudo.");
  }
};

    const clearFilters = () => {
    setSearch("");
    setStatusFilter("todos");
    setTipoFilter("todos");
    setEstrategiaFilter("todos");
    setPadraoFilter("todos");
  };

  const handleSalvarVenda = async () => {
  if (!selectedVenda) return;

  const anunciado = Number(valorAnunciado);
  const vendido = Number(valorVendido);
  const dataFinal = dataVenda || new Date().toISOString().slice(0, 10);

  if (!anunciado || !vendido) {
    toast.error("Preencha valor anunciado e valor vendido.");
    return;
  }

  try {
    const { error } = await supabase
      .from("property_valuations")
      .update({
        status: "vendido",
        valor_anunciado: anunciado,
        preco_venda_real: vendido,
        vendido_em: dataFinal,
      })
      .eq("id", selectedVenda.id);

    if (error) throw error;

    setOpenVendidoModal(false);
    setSelectedVenda(null);
    setValorAnunciado("");
    setValorVendido("");
    setDataVenda("");

    await loadSalesHistory();
    toast.success("Venda registrada com sucesso.");
  } catch (err) {
    console.error(err);
    toast.error("Erro ao registrar venda.");
  }
};

   const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

  const formatStatusLabel = (status?: string | null) => {
  if (!status) return "Pendente";
  if (status === "vendido") return "Vendido";
  return "Avaliado";
};

  const formatStrategyLabel = (estrategia?: string | null) => {
  if (!estrategia) return "—";
  if (estrategia === "rapido") return "Venda Rápida";
  if (estrategia === "normal") return "Venda Normal";
  if (estrategia === "maximizar") return "Maximizar Valor";
  return estrategia;
};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Histórico de Vendas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Últimas avaliações de venda geradas e vendas concluídas.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportCsv}>
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={loadSalesHistory}>
              Atualizar
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate("/dashboard/nova-avaliacao")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Buscar (cidade, bairro, tipo...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="avaliado">Avaliados</SelectItem>
                <SelectItem value="vendido">Vendidos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
              </SelectContent>
            </Select>

            <Select value={estrategiaFilter} onValueChange={setEstrategiaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estratégia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="rapido">Rápido</SelectItem>
                <SelectItem value="normal">Equilíbrio</SelectItem>
                <SelectItem value="maximizar">Maximizar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Select value={padraoFilter} onValueChange={setPadraoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="simples">Simples</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-foreground hover:underline"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Avaliações salvas</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalAvaliacoes}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Imóveis vendidos</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalVendidos}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Ticket médio vendido</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {ticketMedioVendido ? formatBRL(ticketMedioVendido) : "—"}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-card"
        >
          <div className="border-b border-border px-4 py-3 text-muted-foreground">
            Mostrando {filteredItems.length} registros
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Local</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Imóvel</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Avaliação</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Faixa</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estratégia</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Carregando histórico...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma avaliação de venda encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {item.status === "vendido"
                          ? formatDate(item.vendido_em)
                          : formatDate(item.created_at)}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-card-foreground">
                          {item.bairro || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.cidade || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-card-foreground">
                          {formatTipo(item.tipo)} • {item.padrao || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.metragem ? `${item.metragem}m²` : "—"}
                          {item.quartos !== null && item.quartos !== undefined ? ` • ${item.quartos}q` : ""}
                          {item.banheiros !== null && item.banheiros !== undefined ? ` • ${item.banheiros}b` : ""}
                          {item.vagas !== null && item.vagas !== undefined ? ` • ${item.vagas}v` : ""}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.endereco || "Endereço não informado"}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top text-right font-semibold text-card-foreground">
                        {formatBRL(item.preco_calculado)}
                      </td>

                      <td className="px-4 py-3 align-top text-right text-muted-foreground">
                        {formatBRL(item.faixa_min)} — {formatBRL(item.faixa_max)}
                      </td>

                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatEstrategia(item.estrategia)}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <Badge variant={item.status === "vendido" ? "default" : "secondary"}>
                          {item.status === "vendido" ? "Vendido" : "Avaliado"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          {laudosEmitidos[item.id] ? (
                            <Button type="button" variant="outline" size="sm" onClick={() => handleVerLaudo(item.id)} >
                              Ver Laudo
                            </Button>
                            
                        ) : (
                             <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
                              Laudo não emitido
                              </span>
                            )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                          >
                            Ver Detalhes
                          </Button>

                          {item.status !== "vendido" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVenda(item);
                                setOpenVendidoModal(true);
                              }}
                            >
                              Imóvel Vendido?
                            </Button>
                          )}

                          {item.status !== "vendido" && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Excluir
                            </Button>
                          )}

                          {item.status === "vendido" && (
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600">
                              Venda registrada
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Dialog
  open={openVendidoModal}
  onOpenChange={(open) => {
    setOpenVendidoModal(open);
    if (!open) {
      setSelectedVenda(null);
      setValorAnunciado("");
      setValorVendido("");
      setDataVenda("");
    }
  }}
>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Registrar venda</DialogTitle>
      <DialogDescription>
        Informe os dados reais da venda para alimentar a inteligência de mercado.
      </DialogDescription>
    </DialogHeader>

    {selectedVenda && (
      <div className="space-y-5">
        <div className="rounded-xl border p-4 space-y-2">
          <h3 className="font-semibold text-foreground">Resumo do imóvel</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">Endereço:</span>{" "}
              {selectedVenda.endereco || "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Local:</span>{" "}
              {selectedVenda.bairro || "—"} / {selectedVenda.cidade || "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Imóvel:</span>{" "}
              {formatTipo(selectedVenda.tipo)} • {selectedVenda.padrao || "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Metragem:</span>{" "}
              {selectedVenda.metragem ? `${selectedVenda.metragem} m²` : "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Preço calculado:</span>{" "}
              {formatBRL(selectedVenda.preco_calculado)}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Valor anunciado</label>
            <Input
              value={valorAnunciado}
              onChange={(e) => setValorAnunciado(e.target.value)}
              placeholder="Ex: 620000"
              inputMode="decimal"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Valor vendido</label>
            <Input
              value={valorVendido}
              onChange={(e) => setValorVendido(e.target.value)}
              placeholder="Ex: 598000"
              inputMode="decimal"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Data da venda</label>
            <Input
              type="date"
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {valorAnunciado &&
          valorVendido &&
          Number(valorAnunciado) > 0 &&
          Number(valorVendido) > 0 && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Desconto da negociação:</span>{" "}
                <strong>
                  {(
                    ((Number(valorAnunciado) - Number(valorVendido)) /
                      Number(valorAnunciado)) *
                    100
                  ).toFixed(2)}
                  %
                </strong>
              </p>

              <p>
                <span className="font-medium text-foreground">Valor final por m²:</span>{" "}
                <strong>
                  {formatBRL(Number(valorVendido) / Number(selectedVenda.metragem || 1))}
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
          setOpenVendidoModal(false);
          setSelectedVenda(null);
          setValorAnunciado("");
          setValorVendido("");
          setDataVenda("");
        }}
      >
        Cancelar
      </Button>

      <Button onClick={handleSalvarVenda}>
        Salvar venda
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
  <DialogContent className="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Detalhes da Avaliação de Venda</DialogTitle>
      <DialogDescription>
        Visualize os dados completos da precificação realizada.
      </DialogDescription>
    </DialogHeader>

    {selectedSale && (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Imóvel</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Endereço:</span> {selectedSale.endereco || "—"}</p>
              <p><span className="font-medium text-foreground">Bairro:</span> {selectedSale.bairro || "—"}</p>
              <p><span className="font-medium text-foreground">Cidade:</span> {selectedSale.cidade || "—"}</p>
              <p><span className="font-medium text-foreground">Tipo:</span> {selectedSale.tipo || "—"}</p>
              <p><span className="font-medium text-foreground">Padrão:</span> {selectedSale.padrao || "—"}</p>
              <p><span className="font-medium text-foreground">Metragem:</span> {selectedSale.metragem ? `${selectedSale.metragem} m²` : "—"}</p>
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Características</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Quartos:</span> {selectedSale.quartos ?? "—"}</p>
              <p><span className="font-medium text-foreground">Banheiros:</span> {selectedSale.banheiros ?? "—"}</p>
              <p><span className="font-medium text-foreground">Vagas:</span> {selectedSale.vagas ?? "—"}</p>
              <p><span className="font-medium text-foreground">Estratégia:</span> {formatStrategyLabel(selectedSale.estrategia)}</p>
              <p>
                <span className="font-medium text-foreground">Status:</span>{" "}
                <Badge variant={selectedSale.status === "vendido" ? "default" : "secondary"}>
                  {formatStatusLabel(selectedSale.status)}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Precificação</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Valor base m²:</span> {formatCurrency(selectedSale.valor_base_m2)}</p>
              <p><span className="font-medium text-foreground">Preço calculado:</span> {formatCurrency(selectedSale.preco_calculado)}</p>
              <p><span className="font-medium text-foreground">Faixa mínima:</span> {formatCurrency(selectedSale.faixa_min)}</p>
              <p><span className="font-medium text-foreground">Faixa máxima:</span> {formatCurrency(selectedSale.faixa_max)}</p>
              <p><span className="font-medium text-foreground">Tempo estimado:</span> {selectedSale.tempo_estimado ? `${selectedSale.tempo_estimado} dias` : "—"}</p>
              <p><span className="font-medium text-foreground">Data da avaliação:</span> {formatDate(selectedSale.created_at)}</p>
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Fechamento / Venda Real</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Valor anunciado:</span> {formatCurrency(selectedSale.valor_anunciado)}</p>
              <p><span className="font-medium text-foreground">Preço de venda real:</span> {formatCurrency(selectedSale.preco_venda_real)}</p>
              <p><span className="font-medium text-foreground">Vendido em:</span> {formatDate(selectedSale.vendido_em)}</p>
              <p><span className="font-medium text-foreground">Observações:</span> {selectedSale.notes || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    )}

    <DialogFooter>
      <Button variant="outline" onClick={() => setDetailsOpen(false)}>
        Fechar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </DashboardLayout>
  );
};

export default ImoveisVendidos;