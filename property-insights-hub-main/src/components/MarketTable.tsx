import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

type MarketRow = {
  id: string;
  user_id: string | null;

  cidade: string;
  bairro: string;
  tipo: string;
  padrao: string;

  quartos_min: number | null;
  quartos_max: number | null;
  mobiliado?: boolean | null; // só locação

  m2_median: number;
  m2_p25: number | null;
  m2_p75: number | null;

  source: string | null;
  notes: string | null;

  updated_at: string | null;
};

type Props = {
  tableName: "market_rent_m2" | "market_sale_m2";
  title: string;
  adminUid: string; // seu UID
  hasMobiliado: boolean;
};

function toNumOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toBoolOrNull(v: any): boolean | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "sim", "yes"].includes(s)) return true;
  if (["false", "0", "nao", "não", "no"].includes(s)) return false;
  return null;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MarketTable({ tableName, title, adminUid, hasMobiliado }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const isAdmin = userId === adminUid;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MarketRow[]>([]);

  // filtros simples
  const [fCidade, setFCidade] = useState("");
  const [fBairro, setFBairro] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fPadrao, setFPadrao] = useState("");

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<MarketRow>>({});

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id ?? null);
  }

  async function fetchRows() {
    setLoading(true);
    try {
      let query = supabase
        .from(tableName)
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5000);

      if (fCidade.trim()) query = query.ilike("cidade", `%${fCidade.trim()}%`);
      if (fBairro.trim()) query = query.ilike("bairro", `%${fBairro.trim()}%`);
      if (fTipo.trim()) query = query.ilike("tipo", `%${fTipo.trim()}%`);
      if (fPadrao.trim()) query = query.ilike("padrao", `%${fPadrao.trim()}%`);

      const { data, error } = await query;
      if (error) throw error;

      setRows((data ?? []) as MarketRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fCidade, fBairro, fTipo, fPadrao, tableName]);

  const headerHint = useMemo(() => {
    const base = ["cidade", "bairro", "tipo", "padrao", "quartos_min", "quartos_max"];
    if (hasMobiliado) base.push("mobiliado");
    base.push("m2_median", "m2_p25", "m2_p75", "source", "notes");
    return base.join(", ");
  }, [hasMobiliado]);

  function startEdit(r: MarketRow) {
    setEditingId(r.id);
    setDraft({ ...r });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  async function saveEdit(id: string) {
    if (!isAdmin) return;

    // validação mínima
    const m2 = toNumOrNull(draft.m2_median);
    if (!m2 || m2 <= 0) {
      alert("m2_median precisa ser um número > 0");
      return;
    }

    const payload: any = {
      cidade: String(draft.cidade ?? "").trim(),
      bairro: String(draft.bairro ?? "*").trim() || "*",
      tipo: String(draft.tipo ?? "").trim(),
      padrao: String(draft.padrao ?? "").trim(),
      quartos_min: toNumOrNull(draft.quartos_min),
      quartos_max: toNumOrNull(draft.quartos_max),
      m2_median: m2,
      m2_p25: toNumOrNull(draft.m2_p25),
      m2_p75: toNumOrNull(draft.m2_p75),
      source: (draft.source ?? null) ? String(draft.source).trim() : null,
      notes: (draft.notes ?? null) ? String(draft.notes).trim() : null,
    };

    if (hasMobiliado) payload.mobiliado = toBoolOrNull((draft as any).mobiliado);

    // campos obrigatórios
    if (!payload.cidade || !payload.tipo || !payload.padrao) {
      alert("cidade, tipo e padrao são obrigatórios.");
      return;
    }

    // faixa de quartos
    if (payload.quartos_min !== null && payload.quartos_max !== null && payload.quartos_min > payload.quartos_max) {
      alert("quartos_min não pode ser maior que quartos_max");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).update(payload).eq("id", id);
      if (error) throw error;

      cancelEdit();
      await fetchRows();
    } finally {
      setLoading(false);
    }
  }

  async function addRow() {
    if (!isAdmin) return;
    const payload: any = {
      user_id: userId,
      cidade: "Caraguatatuba",
      bairro: "*",
      tipo: "Apartamento",
      padrao: "medio",
      quartos_min: null,
      quartos_max: null,
      m2_median: 35,
      m2_p25: null,
      m2_p75: null,
      source: "manual",
      notes: null,
    };
    if (hasMobiliado) payload.mobiliado = null;

    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).insert(payload);
      if (error) throw error;
      await fetchRows();
    } finally {
      setLoading(false);
    }
  }

  async function duplicateRow(r: MarketRow) {
    if (!isAdmin) return;
    const payload: any = {
      user_id: userId,
      cidade: r.cidade,
      bairro: r.bairro,
      tipo: r.tipo,
      padrao: r.padrao,
      quartos_min: r.quartos_min,
      quartos_max: r.quartos_max,
      m2_median: r.m2_median,
      m2_p25: r.m2_p25,
      m2_p75: r.m2_p75,
      source: r.source,
      notes: r.notes,
    };
    if (hasMobiliado) payload.mobiliado = (r as any).mobiliado ?? null;

    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).insert(payload);
      if (error) throw error;
      await fetchRows();
    } finally {
      setLoading(false);
    }
  }

  async function deleteRow(id: string) {
    if (!isAdmin) return;
    if (!confirm("Excluir esta linha da base de mercado?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;
      await fetchRows();
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const cols = [
      "cidade",
      "bairro",
      "tipo",
      "padrao",
      "quartos_min",
      "quartos_max",
      ...(hasMobiliado ? ["mobiliado"] : []),
      "m2_median",
      "m2_p25",
      "m2_p75",
      "source",
      "notes",
    ];

    const data = rows.map((r) => {
      const base: any = {
        cidade: r.cidade,
        bairro: r.bairro,
        tipo: r.tipo,
        padrao: r.padrao,
        quartos_min: r.quartos_min ?? "",
        quartos_max: r.quartos_max ?? "",
        m2_median: r.m2_median,
        m2_p25: r.m2_p25 ?? "",
        m2_p75: r.m2_p75 ?? "",
        source: r.source ?? "",
        notes: r.notes ?? "",
      };
      if (hasMobiliado) base.mobiliado = (r as any).mobiliado ?? "";
      return base;
    });

    const csv = Papa.unparse({ fields: cols, data });
    downloadText(`${tableName}.csv`, csv);
  }

  async function importCsv(file: File) {
    if (!isAdmin) return;

    const text = await file.text();
    const parsed = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors?.length) {
      console.warn("CSV parse errors", parsed.errors);
      alert("Erros ao ler CSV. Veja o console.");
      return;
    }

    const inputRows = (parsed.data ?? []).filter((r) => Object.keys(r).length > 0);

    const toInsert = inputRows.map((r) => {
      const payload: any = {
        user_id: userId,
        cidade: String(r.cidade ?? "").trim(),
        bairro: String(r.bairro ?? "*").trim() || "*",
        tipo: String(r.tipo ?? "").trim(),
        padrao: String(r.padrao ?? "").trim(),
        quartos_min: toNumOrNull(r.quartos_min),
        quartos_max: toNumOrNull(r.quartos_max),
        m2_median: Number(r.m2_median),
        m2_p25: toNumOrNull(r.m2_p25),
        m2_p75: toNumOrNull(r.m2_p75),
        source: (r.source ?? null) ? String(r.source).trim() : null,
        notes: (r.notes ?? null) ? String(r.notes).trim() : null,
      };

      if (hasMobiliado) payload.mobiliado = toBoolOrNull(r.mobiliado);

      return payload;
    });

    // validação simples
    for (const r of toInsert) {
      if (!r.cidade || !r.tipo || !r.padrao || !Number.isFinite(r.m2_median) || r.m2_median <= 0) {
        alert("CSV inválido: verifique cidade/tipo/padrao/m2_median. Dica: cabeçalho esperado:\n" + headerHint);
        return;
      }
      if (r.quartos_min !== null && r.quartos_max !== null && r.quartos_min > r.quartos_max) {
        alert("CSV inválido: quartos_min > quartos_max em alguma linha.");
        return;
      }
    }

    setLoading(true);
    try {
      // inserção em lote (se der erro, o supabase vai retornar)
      const { error } = await supabase.from(tableName).insert(toInsert);
      if (error) throw error;

      await fetchRows();
      alert("Importação concluída!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h1>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {isAdmin ? "Modo admin: edição liberada." : "Somente leitura."}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={exportCsv} disabled={loading} style={{ padding: "8px 10px" }}>
            Exportar CSV
          </button>

          {isAdmin && (
            <>
              <label style={{ display: "inline-block" }}>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importCsv(f);
                    e.currentTarget.value = "";
                  }}
                  style={{ display: "none" }}
                />
                <span style={{ padding: "8px 10px", border: "1px solid #ccc", cursor: "pointer" }}>Importar CSV</span>
              </label>

              <button onClick={addRow} disabled={loading} style={{ padding: "8px 10px" }}>
                + Adicionar
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Cidade" value={fCidade} onChange={(e) => setFCidade(e.target.value)} />
        <input placeholder="Bairro" value={fBairro} onChange={(e) => setFBairro(e.target.value)} />
        <input placeholder="Tipo" value={fTipo} onChange={(e) => setFTipo(e.target.value)} />
        <input placeholder="Padrão" value={fPadrao} onChange={(e) => setFPadrao(e.target.value)} />
        <button onClick={fetchRows} disabled={loading} style={{ padding: "6px 10px" }}>
          Filtrar
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.8 }}>
        Cabeçalho CSV esperado: <code>{headerHint}</code>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Cidade",
                "Bairro",
                "Tipo",
                "Padrão",
                "Q min",
                "Q max",
                ...(hasMobiliado ? ["Mob"] : []),
                "m² med",
                "m² p25",
                "m² p75",
                "Fonte",
                "Obs",
                "Atualizado",
                "Ações",
              ].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee", fontSize: 12 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const isEditing = editingId === r.id;

              return (
                <tr key={r.id}>
                  {/* texto */}
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input value={String(draft.cidade ?? "")} onChange={(e) => setDraft((d) => ({ ...d, cidade: e.target.value }))} />
                    ) : (
                      r.cidade
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input value={String(draft.bairro ?? "")} onChange={(e) => setDraft((d) => ({ ...d, bairro: e.target.value }))} />
                    ) : (
                      r.bairro
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input value={String(draft.tipo ?? "")} onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value }))} />
                    ) : (
                      r.tipo
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input value={String(draft.padrao ?? "")} onChange={(e) => setDraft((d) => ({ ...d, padrao: e.target.value }))} />
                    ) : (
                      r.padrao
                    )}
                  </td>

                  {/* quartos */}
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input
                        value={draft.quartos_min ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, quartos_min: toNumOrNull(e.target.value) }))}
                        style={{ width: 60 }}
                      />
                    ) : (
                      r.quartos_min ?? ""
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input
                        value={draft.quartos_max ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, quartos_max: toNumOrNull(e.target.value) }))}
                        style={{ width: 60 }}
                      />
                    ) : (
                      r.quartos_max ?? ""
                    )}
                  </td>

                  {/* mobiliado */}
                  {hasMobiliado && (
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      {isEditing ? (
                        <select
                          value={
                            (draft as any).mobiliado === null || (draft as any).mobiliado === undefined
                              ? ""
                              : String((draft as any).mobiliado)
                          }
                          onChange={(e) => setDraft((d) => ({ ...d, mobiliado: toBoolOrNull(e.target.value) } as any))}
                        >
                          <option value="">Ambos</option>
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      ) : (r as any).mobiliado === null || (r as any).mobiliado === undefined ? (
                        "—"
                      ) : (r as any).mobiliado ? (
                        "Sim"
                      ) : (
                        "Não"
                      )}
                    </td>
                  )}

                  {/* números */}
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input
                        value={draft.m2_median ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, m2_median: toNumOrNull(e.target.value) as any }))}
                        style={{ width: 90 }}
                      />
                    ) : (
                      r.m2_median
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input
                        value={draft.m2_p25 ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, m2_p25: toNumOrNull(e.target.value) }))}
                        style={{ width: 90 }}
                      />
                    ) : (
                      r.m2_p25 ?? ""
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input
                        value={draft.m2_p75 ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, m2_p75: toNumOrNull(e.target.value) }))}
                        style={{ width: 90 }}
                      />
                    ) : (
                      r.m2_p75 ?? ""
                    )}
                  </td>

                  {/* meta */}
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input value={String(draft.source ?? "")} onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))} />
                    ) : (
                      r.source ?? ""
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                    {isEditing ? (
                      <input value={String(draft.notes ?? "")} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
                    ) : (
                      r.notes ?? ""
                    )}
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2", fontSize: 12, opacity: 0.75 }}>
                    {r.updated_at ? new Date(r.updated_at).toLocaleString() : ""}
                  </td>

                  {/* ações */}
                  <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2", whiteSpace: "nowrap" }}>
                    {!isAdmin ? (
                      <span style={{ fontSize: 12, opacity: 0.6 }}>—</span>
                    ) : isEditing ? (
                      <>
                        <button onClick={() => saveEdit(r.id)} disabled={loading} style={{ marginRight: 6 }}>
                          Salvar
                        </button>
                        <button onClick={cancelEdit} disabled={loading}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(r)} disabled={loading} style={{ marginRight: 6 }}>
                          Editar
                        </button>
                        <button onClick={() => duplicateRow(r)} disabled={loading} style={{ marginRight: 6 }}>
                          Duplicar
                        </button>
                        <button onClick={() => deleteRow(r.id)} disabled={loading}>
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td colSpan={hasMobiliado ? 14 : 13} style={{ padding: 16, fontSize: 14, opacity: 0.7 }}>
                  {loading ? "Carregando..." : "Nenhum registro encontrado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        Dica: use bairro <code>*</code> para fallback de cidade. Quanto mais específico, mais prioridade (bairro exato ganha do *).
      </div>
    </div>
  );
}