import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error) {
        setRole(data?.role || null);
      }

      setLoading(false);
    };

    loadRole();
  }, []);

  return { role, loading };
}