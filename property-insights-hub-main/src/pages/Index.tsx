import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: BarChart3,
    title: "Pare de precificar no achismo",
    description: "Use dados reais de mercado para definir o valor correto do imóvel com mais segurança.",
  },
  {
    icon: TrendingUp,
    title: "Base real por bairro",
    description: "Valores atualizados com base em imóveis reais e comportamento do mercado local.",
  },
  {
    icon: FileText,
    title: "Laudos profissionais",
    description: "Gere PDFs prontos para apresentar ao cliente e fechar mais captações.",
  },
  {
    icon: Database,
    title: "Histórico inteligente",
    description: "Seu sistema aprende com os imóveis avaliados e melhora com o tempo.",
  },
  {
    icon: Zap,
    title: "Rápido e simples",
    description: "Precifique um imóvel completo em menos de 2 minutos.",
  },
  {
    icon: Shield,
    title: "Mais credibilidade",
    description: "Apresente dados concretos e ganhe confiança do cliente.",
  },
];

const plans = [
  {
    name: "Basic",
    price: "89",
    description: "Para corretores autônomos",
    features: ["10 avaliações/mês", "Base de mercado", "Laudos em PDF", "Suporte básico"],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "199",
    description: "Para quem quer escalar",
    features: ["Avaliações ilimitadas", "Dados avançados", "Laudos personalizados", "Histórico completo", "Suporte prioritário"],
    highlighted: true,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-sem-nome.png" className="h-10 w-auto" />
            <span className="text-2xl font-display font-bold">Precifica Imóvel</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-accent text-accent-foreground">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-hero opacity-85" />
        </div>

        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-6">
              Para corretores que querem fechar mais
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Pare de precificar imóveis no achismo
            </h1>

            <p className="text-lg text-primary-foreground/70 mb-8">
              Descubra o valor real de imóveis com base em dados de mercado,
              imóveis comparáveis e inteligência automatizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-accent text-accent-foreground px-8">
                  Testar grátis agora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <a href="#features">
                <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/30">
                  Ver como funciona
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="container">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Chega de achismo. Use dados.
            </h2>
            <p className="text-muted-foreground">
              Tudo que você precisa para precificar com confiança
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
                className="rounded-xl border bg-card p-6"
              >
                <div className="mb-4 text-accent">
                  <feature.icon />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA / QUEBRA DE OBJEÇÃO */}
      <section className="bg-muted/50 py-20">
        <div className="container text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">
            A maioria dos corretores ainda precifica errado
          </h2>

          <p className="text-muted-foreground mb-8">
            Baseado no proprietário, em anúncios irreais ou no “feeling”.
            Isso faz você perder credibilidade e deixar dinheiro na mesa.
          </p>

          <Link to="/register">
            <Button size="lg" className="bg-accent">
              Começar agora
            </Button>
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="container text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Planos simples e diretos
          </h2>
          <p className="text-muted-foreground">
            Comece grátis e evolua conforme seu volume
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className="border rounded-xl p-8">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>

              <div className="my-6">
                <span className="text-4xl font-bold">R${plan.price}</span>
                <span>/mês</span>
              </div>

              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f}>✔ {f}</li>
                ))}
              </ul>

              <Link to="/register">
                <Button className="w-full bg-accent">
                  Começar
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Comece a precificar com segurança hoje
        </h2>

        <Link to="/register">
          <Button size="lg" className="bg-accent px-8">
            Criar conta grátis
          </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-sm text-muted-foreground">
        © 2026 Precifica Imóvel
      </footer>
    </div>
  );
};

export default Index;