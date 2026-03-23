import { supabase } from "@/integrations/supabase/client";

export async function saveRentalValuation(payload: any) {

  const cleanPayload = {
    user_id: payload.user_id,
    status: payload.status,
    cidade: payload.cidade,
    bairro: payload.bairro,
    tipo: payload.tipo,
    padrao: payload.padrao,
    area_m2: payload.area_m2,
    quartos: payload.quartos,
    banheiros: payload.banheiros,
    vagas: payload.vagas,
    possui_edicula: payload.possui_edicula,
    mobiliado: payload.mobiliado,
    rent_estimada: payload.rent_estimada,
    rent_min: payload.rent_min,
    rent_max: payload.rent_max,
    confidence: payload.confidence,
    explain_json: payload.explain_json
  };

  const { data, error } = await supabase
    .from("rental_valuations")
    .insert(cleanPayload)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("Erro ao salvar avaliação:", error);
    throw error;
  }

  return data;
}