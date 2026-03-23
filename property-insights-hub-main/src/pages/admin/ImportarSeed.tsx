import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function ImportarSeed() {
  const [loading, setLoading] = useState(false);

 const handleUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  setLoading(true);

  function normalize(text: string) {
    return text
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    // 🔥 carrega tudo do banco
    const { data: cities } = await supabase
      .from("cities")
      .select("id, name");

    const { data: neighborhoods } = await supabase
      .from("neighborhoods")
      .select("id, name");

    // 🔥 cria mapas normalizados
    const cityMap = new Map(
      cities?.map((c) => [normalize(c.name), c.id])
    );

    const neighborhoodMap = new Map(
      neighborhoods?.map((n) => [normalize(n.name), n.id])
    );

    const inserts = [];

    for (const row of rows) {
      const cityId = cityMap.get(
        normalize(row.cidade || row.city)
      );

      const neighborhoodId = neighborhoodMap.get(
        normalize(row.bairro || row.neighborhood)
      );

      if (!cityId || !neighborhoodId) {
        console.warn("❌ Não encontrado:", row);
        continue;
      }

      inserts.push({
        city_id: cityId,
        neighborhood_id: neighborhoodId,
        tipo: row.tipo,
        padrao: row.padrao,
        rent_m2: row.rent_m2 || null,
        sale_m2: row.sale_m2 || null,
      });
    }

    if (inserts.length === 0) {
      alert("Nenhum dado válido encontrado.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("market_seed_values")
      .insert(inserts);

    if (error) {
      console.error(error);
      alert("Erro ao importar");
    } else {
      alert(`Importado com sucesso! (${inserts.length} registros)`);
    }

  } catch (err) {
    console.error(err);
    alert("Erro ao processar arquivo");
  }

  setLoading(false);
};

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <h1 className="text-2xl font-bold">
          Importar Base de Mercado
        </h1>

        <input type="file" accept=".xlsx, .xls" onChange={handleUpload} />

        {loading && <p>Importando...</p>}

      </div>
    </DashboardLayout>
  );
}