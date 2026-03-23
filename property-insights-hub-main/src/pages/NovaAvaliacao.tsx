import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { saveRentalValuation } from "@/integrations/supabase/saveRentalValuation";
import { pdf } from "@react-pdf/renderer"
import { LaudoLocacaoPDF } from "@/features/pdf/LaudoLocacaoPDF";
import { v4 as uuidv4 } from "uuid";
import { MessageCircle } from "lucide-react";

type DealType = "venda" | "locacao";

type RentalResult =
  | {
      ok: true;
      rent_estimada: number;
      rent_min: number;
      rent_max: number;
      confidence: "alta" | "media" | "baixa";
      scope: "bairro" | "cidade";
      comps_utilizadas: number;
      message?: string;
      metric?: {
        mediana_r_m2?: number;
        p25_r_m2?: number;
        p75_r_m2?: number;
      };
    }
  | {
      ok: false;
      message: string;
      confidence?: "alta" | "media" | "baixa";
      scope?: "bairro" | "cidade";
      comps_utilizadas?: number;
    };

const NovaAvaliacao = () => {
  
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

  // Novo: tipo de avaliação
  const [dealType, setDealType] = useState<DealType>("venda");

  // Campos (controlados)
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");

  const [cidades, setCidades] = useState<any[]>([]);
  const [bairros, setBairros] = useState<any[]>([]);

  const [tipo, setTipo] = useState<string>("");
  const [metragem, setMetragem] = useState<string>(""); // guardo como string e converto
  const [quartos, setQuartos] = useState<string>("");
  const [banheiros, setBanheiros] = useState<string>(""); // opcional
  const [vagas, setVagas] = useState<string>("");
  const [edícula, setEdícula] = useState<"sim" | "nao">("nao"); // opcional
  const [padrao, setPadrao] = useState<string>("");

  // Locação (opcional)
  const [mobiliado, setMobiliado] = useState<"sim" | "nao">("nao");

  // Estratégia (venda)
  const [estrategiaVenda, setEstrategiaVenda] = useState<string>("");

  // Estado de execução
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resultado
  const [rentalResult, setRentalResult] = useState<RentalResult | null>(null);

  const [profile, setProfile] = useState<{ nome: string | null; creci: string | null; plano: string | null; apelido: string | null } | null>(null);

  const cidadeNome = cidades.find((c) => c.id === cidade)?.name || cidade

useEffect(() => {
  const loadProfile = async () => {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error("Erro ao obter usuário", userErr);
      return;
    }
    const user = userRes?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("nome, creci, plano, apelido")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao carregar profile", error);
      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  loadProfile();
}, []);

useEffect(() => {

  const loadCidades = async () => {

    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao carregar cidades", error);
      return;
    }

    setCidades(data || []);

  };

  loadCidades();

}, []);

useEffect(() => {

  if (!cidade) return;

  const loadBairros = async () => {

    const { data, error } = await supabase
      .from("neighborhoods")
      .select("*")
      .eq("city_id", cidade)
      .order("name");

    if (error) {
      console.error("Erro ao carregar bairros", error);
      return;
    }

    setBairros(data || []);

  };

  loadBairros();

}, [cidade]);

  const stepLabel = useMemo(() => {
    if (step === 1) return "Localização";
    if (step === 2) return "Características";
    return dealType === "venda" ? "Estratégia" : "Resumo";
  }, [step, dealType]);

  const canGoStep2 = cidade && bairro;
  const canGoStep3 = tipo && padrao && Number(metragem) > 0;

 const handleCalculate = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg(null);
  setLoading(true);

  try {
    if (!cidade || !bairro || !tipo || !padrao || !metragem) {
      throw new Error("Preencha cidade, bairro, tipo, padrão e metragem.");
    }

// =============================
// LOCACAO
// =============================
if (dealType === "locacao") {

  const area = Number(metragem);
  const q = quartos ? Number(quartos) : null;

  const cidadeSelecionada = cidades.find(c => c.id === cidade);

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const userId = userRes.user?.id;
  if (!userId) throw new Error("Usuário não autenticado.");

  // ===== learned =====
  const { data: learnedRows } = await supabase.rpc("learned_rent_m2", {
    p_cidade: cidadeSelecionada?.name,
    p_bairro: bairro,
    p_tipo: tipo,
    p_padrao: padrao,
    p_area: area,
    p_quartos: q,
    p_mobiliado: mobiliado === "sim",
  });

  const learned = Array.isArray(learnedRows) ? learnedRows[0] : null;

  // ===== seed =====
  const { data: seedData } = await supabase.rpc("get_market_rent_m2", {
    p_cidade: cidadeSelecionada?.name,
    p_bairro: bairro,
    p_tipo: tipo,
    p_padrao: padrao,
    p_quartos: q,
    p_mobiliado: mobiliado === "sim",
  });

  const seed = Array.isArray(seedData) ? seedData[0] : seedData;

  // ===== NORMALIZA =====
  const seedM2 = seed?.m2_median ? Number(seed.m2_median) : null;
  const learnedM2 = learned?.m2 ? Number(learned.m2) : null;

  // ===== MOTOR HÍBRIDO =====
  if ((seedM2 && seedM2 > 0) || (learnedM2 && learnedM2 > 0)) {

    let finalM2 = 0;
    let confidence = "media";
    let source = "";

    if (seedM2 && learnedM2) {
      finalM2 = (seedM2 * 0.6) + (learnedM2 * 0.4);
      confidence = "alta";
      source = "seed + learned";
    } else if (learnedM2) {
      finalM2 = learnedM2;
      source = "learned";
    } else if (seedM2) {
      finalM2 = seedM2;
      source = "seed";
    }

    const rentEst = finalM2 * area;
    const rentMin = rentEst * 0.9;
    const rentMax = rentEst * 1.1;

    const result: RentalResult = {
      ok: true,
      rent_estimada: rentEst,
      rent_min: rentMin,
      rent_max: rentMax,
      confidence,
      scope: source,
      comps_utilizadas: learned?.n ?? 0,
      message: `Estimativa baseada em ${source}.`,
    };

    setRentalResult(result);

    try {
      const saved = await saveRentalValuation({
        user_id: userId,
        status: "avaliado",
        cidade: cidadeSelecionada?.name,
        bairro,
        tipo,
        padrao,
        area_m2: area,
        quartos: q ?? null,
        banheiros: banheiros ? Number(banheiros) : null,
        vagas: vagas ? Number(vagas) : null,
        edícula: edícula === "sim",
        mobiliado: mobiliado === "sim",
        rent_estimada: rentEst,
        rent_min: rentMin,
        rent_max: rentMax,
        confidence,
        explain_json: {
          source,
          seed_m2: seedM2,
          learned_m2: learnedM2,
          final_m2: finalM2,
        },
      });

      setRentalResult(prev =>
        prev
          ? {
              ...prev,
              evaluation_id: saved.id,
              evaluation_created_at: saved.created_at,
            }
          : prev
      );

    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar avaliação.");
      return;
    }

    setShowResult(true);
    setStep(3);
    return;
  }

  // ===== FALLBACK =====
  const { data } = await supabase.rpc("calculate_rental_price", {
    p_cidade: cidadeSelecionada?.name,
    p_bairro: bairro,
    p_tipo: tipo,
    p_padrao: padrao,
    p_area: area,
    p_quartos: q,
    p_mobiliado: mobiliado === "sim",
  });

  const fallback = Array.isArray(data) ? data[0] : data;

  let finalResult: RentalResult;

  if (fallback && fallback.rent_estimada) {
    finalResult = fallback;
  } else {
    const defaultM2 = 35;
    const rentEst = defaultM2 * area;

    finalResult = {
      ok: true,
      rent_estimada: rentEst,
      rent_min: rentEst * 0.9,
      rent_max: rentEst * 1.1,
      confidence: "baixa",
      scope: "fallback",
      comps_utilizadas: 0,
      message: "Estimativa baseada em fallback de segurança.",
    };
  }

  setRentalResult(finalResult);

  setShowResult(true);
  setStep(3);
  return;
}

setRentalResult(finalResult);

try{
const saved = await saveRentalValuation({
  user_id: userId,
  status: "avaliado",
  cidade: cidadeSelecionada?.name,
  bairro: bairro,
  tipo,
  padrao,
  area_m2: Number(metragem) || null,
  quartos: q ?? null,
  banheiros: banheiros ? Number(banheiros) : null,
  vagas: vagas ? Number(vagas) : null,
  edícula: edícula === "sim",
  mobiliado: mobiliado === "sim",
  rent_estimada: finalResult.rent_estimada ?? null,
  rent_min: finalResult.rent_min ?? null,
  rent_max: finalResult.rent_max ?? null,
  confidence: finalResult.confidence ?? null,
  explain_json: {
    source: "fallback",
    raw: data,
    normalized: fallback ?? null,
    final: finalResult,
  },

});

setRentalResult(prev =>
  prev
    ? {
        ...prev,
        evaluation_id: saved.id,
        evaluation_created_at: saved.created_at,
      }
    : prev
); 

  setShowResult(true);
  setStep(3);
} catch (err) {
  console.error(err);
  toast.error("Erro ao salvar avaliação.");
  return;
}

    // =============================
    // VENDA (placeholder)
    // =============================
    setShowResult(true);
    setStep(3);
    
  } catch (err: any) {
    console.error(err);
    setErrorMsg(err?.message ?? "Erro ao calcular. Tente novamente.");
  } finally {

    setLoading(false);
  }
};

// Formatação BRL
const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const copyToClipboardFallback = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
};

const handleCopyResumo = async (e?: React.MouseEvent<HTMLButtonElement>) => {
  e?.preventDefault();
  e?.stopPropagation();

  try {
    if (!rentalResult?.ok) {
      toast.error("Gere a avaliação antes de copiar o resumo.");
      return;
    }

    const scopeLabel =
      rentalResult.scope === "bairro"
        ? "Bairro"
        : rentalResult.scope === "seed"
        ? "Base de Mercado"
        : "Cidade";

    const baseDadosLabel =
      rentalResult.confidence === "alta"
        ? "Dados amplos"
        : rentalResult.confidence === "media"
        ? "Dados consistentes"
        : "Dados iniciais";

    // ✅ seus states são string → normaliza para exibição
 const tipoLabel = tipo || "Imóvel";

const metragemNum = Number(metragem);
const metragemLabel = Number.isFinite(metragemNum) && metragemNum > 0 ? `${metragemNum}m²` : "-";

const quartosNum = Number(quartos);
const quartosLabel = Number.isFinite(quartosNum) && quartosNum > 0 ? `${quartosNum} quartos` : "- quartos";

const banheirosNum = Number(banheiros);
const banheirosLabel = Number.isFinite(banheirosNum) && banheirosNum > 0 ? `${banheirosNum} banheiro${banheirosNum === 1 ? "" : "s"}` : "- banheiros";

const vagasNum = Number(vagas);
const vagasLabel = Number.isFinite(vagasNum) ? `${vagasNum} vaga${vagasNum === 1 ? "" : "s"}` : "- vagas";

const edículaLabel = edícula === "sim" ? "Edícula" : "- edícula";

const mobiliadoLabel =
  dealType === "locacao" ? (mobiliado === "sim" ? "Mobiliado" : "Não mobiliado") : null;

const linhaImovelPremium = [
  tipoLabel,
  metragemLabel,
  quartosLabel,
  banheirosLabel,
  vagasLabel,
  edículaLabel,
  mobiliadoLabel,
].filter(Boolean).join(" • ");

const localLabel = [bairro, cidadeNome].filter(Boolean).join(", ");

const padraoLine = padrao ? `🏷️ Padrão do imóvel: ${padrao}` : null;

const texto = [
  `📌 *Resumo da Avaliação (Locação)*`,
  ``,
  linhaImovelPremium,
  `💰 *Aluguel sugerido:* ${formatBRL(rentalResult.rent_estimada)}`,
  `↕️ Faixa estimada: ${formatBRL(rentalResult.rent_min)} – ${formatBRL(rentalResult.rent_max)}`,
  ``,
  localLabel ? `📍 ${localLabel}` : null,
  ``,
  `📊 Fonte: ${scopeLabel}`,
  `Base de dados: ${baseDadosLabel}`,
  `Comparáveis analisados: ${rentalResult.comps_utilizadas ?? 0}`,
  ``,
  padraoLine,
  rentalResult.message
    ? `ℹ️ ${rentalResult.message}`
    : `ℹ️ Estimativa baseada em modelo estatístico com dados de mercado.`,
  ``,
  `Calculado por Precifica Imóvel`,
].filter((x) => typeof x === "string" && x.trim().length > 0).join("\n");

    // 👉 http/ip (inseguro) = cai direto no fallback mantendo user gesture
    const canUseModernClipboard =
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof window !== "undefined" &&
      window.isSecureContext;

    if (!canUseModernClipboard) {
      const ok = copyToClipboardFallback(texto);
      if (ok) {
        toast.success("Resumo copiado com sucesso!", {
          description: "Copiado via modo compatível (HTTP).",
        });
        return;
      }
      toast.error("Não foi possível copiar no HTTP. Tente localhost ou HTTPS.");
      return;
    }

    await navigator.clipboard.writeText(texto);

    toast.success("Resumo copiado com sucesso!", {
      description: "Você pode colar no WhatsApp ou enviar ao proprietário.",
    });
  } catch (err) {
    console.error("Falha no Copiar Resumo:", err);
    toast.error("Não foi possível copiar o resumo. Veja o console.");
  }
};

 const handleGerarPdf = async () => {
  if (!rentalResult?.ok) {
    toast.error("Gere a avaliação antes de emitir o laudo.");
    return;
  }

  if (!profile) {
    toast.error("Carregando seus dados (nome/CRECI)... tente novamente.");
    return;
  }

  try {

    const requestedTemplate = profile?.plano === "basic" ? "basic" : "premium";

    // 1️⃣ autorização
    const { data: authData, error: authErr } = await supabase.rpc("authorize_pdf_export", {
      p_template: requestedTemplate,
      p_evaluation_id: rentalResult.evaluation_id ?? null,
    });

    if (authErr) throw authErr;

    const authRow = authData?.[0];

    if (!authRow?.allowed) {
      toast.error("Limite do plano Basic atingido", {
        description: "Você pode emitir até 10 laudos em PDF por mês.",
      });
      return;
    }

    const template = authRow.enforced_template as "basic" | "premium";

    // 2️⃣ data avaliação
    const dataAvaliacao = rentalResult.evaluation_created_at
      ? new Date(rentalResult.evaluation_created_at).toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");

    const scopeLabel =
      rentalResult.scope === "bairro" ? "Bairro" :
      rentalResult.scope === "seed" ? "Base de Mercado" : "Cidade";

    const baseDadosLabel =
      rentalResult.confidence === "alta" ? "Dados amplos" :
      rentalResult.confidence === "media" ? "Dados consistentes" : "Dados iniciais";

    // 3️⃣ dados do PDF

let marketData = null;

if (template === "premium") {

  const { data } = await supabase
    .from("v_market_liquidez")
    .select("*")
    .eq("cidade", cidadeNome)
    .eq("bairro", bairro)
    .limit(1)
    .maybeSingle();

  if (data) {
    marketData = {
      preco_m2: data?.preco_m2_medio
    ? `R$ ${Number(data.preco_m2_medio).toFixed(2)}`
    : "—",

  tempo_medio: data?.tempo_medio_locacao
    ? `${data.tempo_medio_locacao} dias`
    : "—",

  desconto_medio: data?.desconto_medio
    ? `${(Number(data.desconto_medio) * 100).toFixed(1)}%`
    : "—"
    };
  }
}
    const d = {
      market: marketData,
      template,
      corretorNome: profile?.apelido || profile?.nome || "Dennis Peruzzi",
      creci: profile?.creci ?? "245646",
      dataAvaliacao,
      tipo: tipo || "Imóvel",
      metragem: metragem || "-",
      quartos: quartos || "-",
      banheiros: banheiros || "-",
      vagas: vagas || "-",
      edícula: edícula === "sim" ? "Sim" : "Não",
      mobiliado: dealType === "locacao" ? (mobiliado === "sim" ? "Mobiliado" : "Não mobiliado") : null,
      padrao: padrao || null,
      bairro: bairro || "-",
      cidade: cidadeNome || "-",
      aluguelSugerido: formatBRL(rentalResult.rent_estimada),
      faixaMin: formatBRL(rentalResult.rent_min),
      faixaMax: formatBRL(rentalResult.rent_max),
      fonte: scopeLabel,
      baseDados: baseDadosLabel,
      comps: rentalResult.comps_utilizadas ?? 0,
      obs: rentalResult.message ?? null,
    };

    // 4️⃣ gerar PDF como Blob
   const blob = await pdf(
  <LaudoLocacaoPDF d={d} />
).toBlob();

    // 5️⃣ usuário atual
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    // 6️⃣ criar nome do arquivo
    const fileName = `laudo-${uuidv4()}.pdf`;

    const storagePath = `${user.id}/locacao/${fileName}`;

    // 7️⃣ upload no Storage
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, blob, {
        contentType: "application/pdf"
      });

    if (uploadError) throw uploadError;

    // 8️⃣ salvar registro na tabela reports
    const { error: dbError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        evaluation_id: rentalResult.evaluation_id,
        storage_path: storagePath,
        deal_type: "locacao",
        template
      });

    if (dbError) throw dbError;

    // 9️⃣ download imediato
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `laudo-${bairro}-${cidadeNome}.pdf`;
    link.click();

    toast.success("Laudo gerado com sucesso!", {
      description:
        template === "basic"
          ? `Plano Basic: restam ${authRow.remaining} laudos neste mês.`
          : "PDF premium pronto para download.",
    });

  } catch (err) {
    console.error(err);
    toast.error("Falha ao gerar o PDF.");
  }
};

const handleWhatsapp = async () => {

  if (!rentalResult?.evaluation_id) {
    toast.error("Gere o laudo antes de compartilhar.");
    return;
  }

  const { data: report } = await supabase
      .from("reports")
      .select("storage_path")
      .eq("evaluation_id", rentalResult.evaluation_id)
      .eq("deal_type", "locacao")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
  
  if (!report) {
    toast.error("Laudo não encontrado.");
    return;
  }
  const { data: urlData } = supabase.storage
  .from("reports")
  .getPublicUrl(report.storage_path);

  if (!urlData?.publicUrl) {
    toast.error("Erro ao gerar link do laudo.");
    return;
  }

  if (!rentalResult?.evaluation_id) {
  toast.error("Avaliação ainda não registrada.");
  return;
}

  const mensagem = `Olá! Aqui é ${profile?.apelido || profile?.nome}, corretor imobiliário.

Segue o laudo completo:
${urlData.publicUrl}

Caso queira posso explicar os dados da avaliação.`;

  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
};

  return (
    <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Nova Avaliação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados do imóvel para gerar a precificação{" "}
            {dealType === "locacao" ? "de locação (aluguel separado de custos)" : "de venda"}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step >= s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 rounded ${step > s ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
          <span className="ml-3 text-sm text-muted-foreground">{stepLabel}</span>
        </div>

        <form onSubmit={handleCalculate}>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
            {errorMsg && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Tipo de avaliação */}
                <div className="space-y-2">
                  <Label>Tipo de Avaliação</Label>
                  <Select value={dealType} onValueChange={(v) => setDealType(v as DealType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="locacao">Locação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço (opcional)</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                   <Select value={bairro || ""} onValueChange={setBairro}>
                   <SelectTrigger>
                  <SelectValue placeholder="Selecione o bairro" />
                   </SelectTrigger>

                   <SelectContent side="bottom" position="popper" className="max-h-60 overflow-y-auto">
                   {bairros.length === 0 && (
                  <SelectItem value="loading" disabled>
                    Carregando bairros...
                  </SelectItem>
                   )}

                  {bairros.map((b) => (
                   <SelectItem key={b.id} value={b.name}>
                   {b.name}
                   </SelectItem>
                   ))}
                  </SelectContent>
                  </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                <Select  value={cidade}  onValueChange={(value) => {
                    setCidade(value.trim());
                    setBairro("")
                    }}>
                  <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>

                  <SelectContent>
                   {cidades.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                   ))}
                  </SelectContent>
                </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={!canGoStep2}
                    onClick={() => setStep(2)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo do Imóvel</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Dica: mantenha estes valores iguais aos que você usa nos comps (ex.: 'Apartamento') */}
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metragem">Metragem (m²)</Label>
                    <Input
                      id="metragem"
                      type="number"
                      value={metragem}
                      onChange={(e) => setMetragem(e.target.value)}
                      placeholder="85"
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quartos">Quartos</Label>
                    <Select value={quartos} onValueChange={setQuartos}>
                     <SelectTrigger>
                     <SelectValue placeholder="Quartos" />
                    </SelectTrigger>
                     <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banheiros">Banheiros</Label>
                    <Select value={banheiros} onValueChange={setBanheiros}>
                     <SelectTrigger>
                     <SelectValue placeholder="Banheiros" />
                    </SelectTrigger>
                     <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vagas">Vagas</Label>
                    <Select value={vagas} onValueChange={setVagas}>
                     <SelectTrigger>
                     <SelectValue placeholder="Vagas" />
                    </SelectTrigger>
                     <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2 col-span-4">
                    <Label htmlFor="edicula">Edícula</Label>
                    <Select value={edícula} onValueChange={(v) => setEdícula(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Edícula" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao">Não</SelectItem>
                        <SelectItem value="sim">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                   </div>
                  </div>
                <div className="space-y-2">
                  <Label>Padrão Construtivo</Label>
                  <Select value={padrao} onValueChange={setPadrao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* valores alinhados ao banco: simples/medio/alto */}
                      <SelectItem value="simples">Simples</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dealType === "locacao" && (
                  <div className="space-y-2">
                    <Label>Mobiliado</Label>
                    <Select value={mobiliado} onValueChange={(v) => setMobiliado(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao">Não</SelectItem>
                        <SelectItem value="sim">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Condomínio/IPTU podem ser informados depois, mas **não entram** no cálculo do aluguel.
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    disabled={!canGoStep3}
                    onClick={() => setStep(3)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {dealType === "venda" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Estratégia de Venda</Label>
                      <Select value={estrategiaVenda} onValueChange={setEstrategiaVenda}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rapido">Venda Rápida (preço agressivo)</SelectItem>
                          <SelectItem value="equilibrio">Equilíbrio (preço justo)</SelectItem>
                          <SelectItem value="maximizar">Maximizar Valor (preço premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Calculator className="mr-2 h-4 w-4" /> {loading ? "Calculando..." : "Calcular Preço"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Resumo (Locação)</p>
                      <p>
                        {tipo} • {padrao} • {metragem}m² • {quartos || 0} quartos • {banheiros || 0} banheiros• {vagas || 0} vagas •{" "}
                        {mobiliado === "sim" ? "Mobiliado" : "Não mobiliado"}
                        {edícula === "sim" ? " • Edícula" : ""}
                      </p>
                      <p>
                        {bairro}, {cidadeNome}
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Calculator className="mr-2 h-4 w-4" /> {loading ? "Calculando..." : "Calcular Aluguel"}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </form>

        {/* Result */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-accent bg-card p-6 shadow-accent-glow"
          >
            <h2 className="font-display text-lg font-bold text-card-foreground mb-4">Resultado da Avaliação</h2>

            {dealType === "locacao" ? (
              <>
                {rentalResult?.ok ? (
                  <>
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-1">Aluguel sugerido (mês)</p>
                      <p className="text-4xl font-display font-bold text-accent">
                        {formatBRL(rentalResult.rent_estimada)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Faixa: {formatBRL(rentalResult.rent_min)} – {formatBRL(rentalResult.rent_max)}
                      </p>
                   
                   {rentalResult?.message && (
                        <p className="text-sm text-muted-foreground mt-2">
                        {rentalResult.message}
                      </p>
              )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Escopo</p>
                        <p className="text-sm font-semibold text-card-foreground">
                         {rentalResult.scope === "bairro"
                          ? "Bairro"
                          : rentalResult.scope === "seed"
                          ? "Base de Mercado"
                           : "Cidade"}
                        </p>
                      </div>
                    </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Comps usadas</p>
                        <p className="text-sm font-semibold text-card-foreground">{rentalResult.comps_utilizadas}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Base de Dados</p>
                        <p
                          className={`text-sm font-semibold ${
                            rentalResult.confidence === "alta"
                              ? "text-success"
                              : rentalResult.confidence === "media"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {rentalResult.confidence === "alta"
                               ? "Dados amplos"
                                : rentalResult.confidence === "media"
                                ? "Dados consistentes"
                                : "Dados iniciais"}
                        </p>
                      </div>

                  <div className="mt-6 flex gap-3">
                     <Button type="button" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleGerarPdf}>
                        Gerar Laudo PDF
                      </Button>

                      <Button type="button" variant="outline" className="flex-1" onClick={handleCopyResumo}
                        disabled={!rentalResult?.ok}>
                         Copiar Resumo
                      </Button>

                      <Button type="button" variant="outline" className="flex-1"onClick={() => navigate("/dashboard/locacoes")}>
                         Ver Histórico
                      </Button>
                     
                      <Button onClick={handleWhatsapp} variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2"/>
                       WhatsApp
                      </Button>
                  
                   </div> 
                 </>
                  ) : (

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium text-foreground">Sem dados suficientes</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rentalResult?.message ??
                        "Ainda não há comps suficientes para este filtro. Cadastre mais imóveis locados."}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Placeholder venda (você substitui depois pelo seu motor de venda) */}
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">Preço Sugerido</p>
                  <p className="text-4xl font-display font-bold text-accent">R$ 520.000</p>
                  <p className="text-sm text-muted-foreground mt-2">Faixa: R$ 480.000 – R$ 560.000</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Valor Base/m²</p>
                    <p className="text-sm font-semibold text-card-foreground">R$ 6.117</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Tempo Estimado</p>
                    <p className="text-sm font-semibold text-card-foreground">45 dias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Base de Dados</p>
                    <p className="text-sm font-semibold text-success">Alta</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">Gerar Laudo PDF</Button>
                  <Button variant="outline" className="flex-1">
                    Salvar Avaliação
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );


};

export default NovaAvaliacao;
