import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Perfil() {

  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [perfil, setPerfil] = useState({
    nome: "",
    apelido: "",
    telefone: "",
    creci: "",
    plano: ""
  });

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setPerfil({
      nome: data.nome || "",
      apelido: data.apelido || "",
      telefone: data.telefone || "",
      creci: data.creci || "",
      plano: data.plano || ""
    });

    setLoading(false);
  }

  async function salvarPerfil() {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        nome: perfil.nome,
        apelido: perfil.apelido,
        telefone: perfil.telefone,
        creci: perfil.creci,
        plano: perfil.plano
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
      console.error(error);
      return;
    }

    toast.success("Perfil atualizado com sucesso");
  }

  if (loading) {
    
    return (
      <DashboardLayout>
        <p>Carregando perfil...</p>
      </DashboardLayout>
    );
  }

  async function updatePassword() {
  if (password.length < 6) {
    toast.error("A senha deve ter pelo menos 6 caracteres");
    return;
  }

  if (password !== confirmPassword) {
    toast.error("As senhas não coincidem");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    toast.error("Erro ao atualizar senha");
    console.error(error);
    return;
  }

  toast.success("Senha atualizada com sucesso!");
  setPassword("");
  setConfirmPassword("");
}

  return (
    <DashboardLayout>

      <div className="max-w-xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-display font-bold">
            Perfil do Corretor
          </h1>
          <p className="text-sm text-muted-foreground">
            Essas informações aparecerão no laudo.
          </p>
        </div>
        <div className="text-sm bg-primary/10 px-3 py-1 rounded">
            Plano {perfil.plano === "premium" ? "premium" : "Basic"}
        </div>

        <div className="space-y-4">

          <div>
            <Label>Nome completo</Label>
            <Input
              value={perfil.nome}
              onChange={(e) =>
                setPerfil({ ...perfil, nome: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Apelido para o laudo</Label>
            <Input
              placeholder="Ex: Peruzzi"
              value={perfil.apelido}
              onChange={(e) =>
                setPerfil({ ...perfil, apelido: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              value={perfil.telefone}
              onChange={(e) =>
                setPerfil({ ...perfil, telefone: e.target.value })
              }
            />
          </div>

          <div>
            <Label>CRECI</Label>
            <Input
              value={perfil.creci}
              onChange={(e) =>
                setPerfil({ ...perfil, creci: e.target.value })
              }
            />
          </div>
            <div className="p-4 border rounded-lg bg-muted/30 mt-4">

            <p className="text-sm text-muted-foreground mb-2">
                Pré-visualização do laudo
             </p>

            <p className="font-semibold">
             {perfil.apelido || perfil.nome}
             </p>

            <p className="text-sm text-muted-foreground">
                CRECI {perfil.creci || "000000"}
             </p>

            </div>

          <Button onClick={salvarPerfil}>
            Salvar alterações
          </Button>

          <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">
              Alterar senha
           </h2>

          <div>
          <Label>Nova senha</Label>
          <Input
          type="password"
           placeholder="Digite uma nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />
          </div>

          <div>
          <Label>Confirmar nova senha</Label>
          <Input
           type="password"
          placeholder="Confirme a nova senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
           />
          </div>

        <Button variant="secondary" onClick={updatePassword}>
        Alterar senha
        </Button>
        </div>

        </div>

      </div>

    </DashboardLayout>
  );
}