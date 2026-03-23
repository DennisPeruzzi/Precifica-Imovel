import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [creci, setCreci] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !creci || !password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

setLoading(true);
      
await supabase.auth.signOut();

try {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
        creci,
        telefone,
      },
    },
  });

  if (error) {
    toast.error(error.message);
    setLoading(false);
    return;
  }

  if (data.session) {
    toast.success("Conta criada com sucesso!");
    navigate("/confirm-email");
  } else {
    toast.success("Verifique seu email para confirmar a conta.");
  }
} catch (err) {
  toast.error("Erro ao criar conta. Tente novamente.");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen flex font-body">
      <div className="hidden lg:flex lg:w-1/2 bg-hero items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-3">
              <img src="/logo-sem-nome.png" className="h-10 w-auto" />
              <span className="text-2xl font-display font-bold text-primary-foreground">PrecificaImóvel</span>
             </div>
             
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Comece a precificar em minutos
          </h2>
          <p className="text-primary-foreground/60">
            Crie sua conta gratuita e tenha acesso a dados reais de mercado para suas avaliações.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
           <div className="flex items-center gap-2">
              <img src="/logo-sem-nome.png" className="h-10 w-auto" />
              <span className="font-20 font-semibold text-gray-1000">
                Precifica Imóvel
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Já tem conta?{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">Entrar</Link>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" placeholder="João Silva" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creci">CRECI</Label>
              <Input id="creci" placeholder="Ex: 12345-F" value={creci} onChange={(e) => setCreci(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</> : "Criar Conta"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Ao criar uma conta, você concorda com os Termos de Uso e Política de Privacidade.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
