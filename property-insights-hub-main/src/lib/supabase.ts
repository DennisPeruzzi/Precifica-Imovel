// Re-export do client Supabase
export { supabase } from "@/integrations/supabase/client";

import { supabase } from "@/integrations/supabase/client";

// ========== Helpers de Autenticação ==========

/** Retorna o usuário autenticado ou null */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao buscar usuário:", error.message);
    return null;
  }
  return user;
}

/** Retorna o ID do usuário autenticado ou null */
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/** Verifica se há um usuário logado */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// ========== Helpers de Perfil ==========

/** Busca o perfil completo do usuário logado */
export async function getMyProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error.message);
    return null;
  }
  return data;
}

/** Busca o perfil de qualquer usuário por ID */
export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error.message);
    return null;
  }
  return data;
}

// ========== Helpers de Avaliações ==========

/** Busca todas as avaliações do usuário logado */
export async function getMyValuations() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("property_valuations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar avaliações:", error.message);
    return [];
  }
  return data;
}

// ========== Helpers de Uso Mensal ==========

/** Busca o controle de uso do mês atual */
export async function getMyMonthlyUsage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { data, error } = await supabase
    .from("usage_control")
    .select("*")
    .eq("user_id", userId)
    .eq("mes_referencia", mesAtual)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar uso mensal:", error.message);
    return null;
  }
  return data;
}
