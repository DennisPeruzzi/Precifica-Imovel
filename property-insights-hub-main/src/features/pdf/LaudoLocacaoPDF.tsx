import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

type Template = "basic" | "premium";

export type LaudoData = {
  template: Template;
  corretorNome: string;
  creci: string;
  dataAvaliacao: string; // "24/02/2026"
  tipo: string;
  metragem: string; // "80"
  quartos: string; // "2"
  banheiros: string; // "1"
  vagas: string; // "1"
  edícula: string; // "sim" | "não"
  mobiliado?: string | null; // "Mobiliado" | "Não mobiliado"
  padrao?: string | null;
  bairro: string;
  cidade: string;
  aluguelSugerido: string; // "R$ 2.800,00"
  faixaMin: string;
  faixaMax: string;
  fonte: string; // "Cidade" | "Bairro" | "Base de Mercado"
  baseDados: string; // "Dados amplos"...
  comps: number;
  obs?: string | null;

  market?: {
  preco_m2?: string | null;
  liquidez?: string | null;
  tempo_medio?: string | null;
  desconto_medio?: string | null;
}
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#0f172a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  brand: { fontSize: 10, color: "#b45309", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: 16, fontWeight: 700, marginTop: 4 },
  muted: { color: "#475569" },
  card: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginTop: 10 },
  kpi: { borderWidth: 1, borderColor: "#fed7aa", borderRadius: 12, padding: 12, marginTop: 10, backgroundColor: "#fff7ed" },
  kpiLabel: { fontSize: 9, color: "#9a3412", textTransform: "uppercase", letterSpacing: 0.8 },
  kpiValue: { fontSize: 26, fontWeight: 800, color: "#7c2d12", marginTop: 6 },
  gridRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  col: { flexGrow: 1 },
  h: { fontWeight: 700, marginBottom: 6 },
  footer: {position: "absolute", bottom: 20, left: 30, right: 30, fontSize: 9, color: "#262e3a", boardertopWidth: 1, boardertopColor: "#7d89a0", paddingTop: 6, textAlign: "center" },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between"},
  logo: { width: 30, height: 30, marginBottom: 10},
  footerText: { flex: 1, textAlign: "center", fontSize: 9, color: "#888" },
  headerBasic: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, borderBottomWidth: 2, borderBottomColor: "#2563EB", paddingBottom: 8 },
  blueBar: { height: 4, backgroundColor: "#2563EB", marginBottom: 10},
  headerPremium: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, borderBottomWidth: 2, borderBottomColor: "#C9A227", paddingBottom: 8},
  goldBar: { height: 4, backgroundColor: "#C9A227", marginBottom: 10},
  coverPage: { padding: 40, display: "flex", justifyContent: "center", alignItems: "center" },
  coverBrand: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#0f172a" },
  coverSubtitle: { fontSize: 16, marginBottom: 40, color: "#475569" },
  coverBox: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 20, width: "100%", marginBottom: 20 },
  coverTitle: { fontSize: 18, textTransform: "uppercase", color: "#64748b", marginBottom: 60, letterSpacing: 1 },
  coverText: { fontSize: 14, fontWeight: 600 },
  coverContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  coverLogo: { fontSize: 34, fontWeight: "bold", marginBottom: 12 }, 
  coverCard: { width: "100%", padding: 18, borderRadius: 12, marginBottom: 18 },
  coverLabel: { fontSize: 10, textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 },
  coverValue: { fontSize: 12, fontWeight: "bold" },
  cover: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40,},
  title2: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10,},
  subtitle: { fontSize: 14,textAlign: "center", fontWeight: "bold", marginBottom: 5,},
  date: { fontSize: 12, marginBottom: 20,},
  divider: { width: "80%", height: 1, backgroundColor: "#ccc",alignSelf: "center", marginVertical: 20,},
  corretor: { fontSize: 14, fontWeight: "bold",},
  creci: { fontSize: 10, color: "#666",},
  watermark: {position: "absolute", top: "40%", left: "15%", fontSize: 60, opacity: 0.5,},
});

const theme = { basic: { primary: "#2563EB", soft: "#DBEAFE", }, premium: { primary: "#C9A227", soft: "#FFF6CC", }
};

const CoverPageBasic = ({ d }: { d: LaudoData }) => {

  const colors = theme[d.template];

  return (

    <Page size="A4" style={styles.page}>
    <View style={styles.blueBar} />
    <View style={styles.headerBasic}>
      <View>
        <Text style={styles.title}>Laudo Simplificado de Locação</Text>
        <Text style={styles.muted}>Data da avaliação: {d.dataAvaliacao}</Text>
      </View>
      <View style={{ textAlign: "right" }}>
        <Text style={{ fontWeight: 700 , fontSize: 12 }}>{d.corretorNome}</Text>
        <Text style={styles.muted}>CRECI: {d.creci}</Text>
      </View>
    </View>

    <View style={styles.coverContainer}>

       <Text style={[styles.coverLogo, { color: "black" }]}>
         LAUDO DE AVALIAÇÃO IMOBILIÁRIA
        </Text>

        <Text style={[styles.coverTitle, { color: "black" }]}>
        Relatório técnico de precificação baseado em dados de mercado
        </Text>

      <View style={[
          styles.coverCard,
          { backgroundColor: colors.soft }
        ]}>
        <Text style={[styles.coverLabel, { color: "black" }]}>
           Imóvel
        </Text>
         <Text style={styles.coverValue}>
          {d.tipo} - {d.bairro}, {d.cidade}
        </Text>
      </View>

       <View style={[
        styles.coverCard,
       { backgroundColor: colors.soft }
       ]}>
       <Text style={[styles.coverLabel, { color: "black" }]}>
         Este laudo foi gerado com base em dados reais de mercado e análise estatística automatizada.
        </Text>
       </View>
      

       </View>

        <View style={styles.footer} fixed>

          <View style={styles.footerRow}>

            <Image src="/logo-sem-nome.png" style={styles.logo} />

            <View style={styles.footerText}>
              <Text>
                Documento gerado por inteligência de mercado • Precifica Imóvel
              </Text>

              <Text>
              www.precificaimovel.com.br
              </Text>

              <Text
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
                }
                />
            </View>
          </View>
       </View>
     </Page>
  );
};


const CoverPagePremium = ({ d }: { d: LaudoData }) => {

  const colors = theme[d.template];

   return (
    <Page size="A4" style={styles.page}>
      <View style={styles.goldBar} />
      <View style={styles.headerPremium}>
        <View>
          <Text style={styles.brand}>Precifica Imóvel - Sistema Inteligente de Precificação</Text>
          <Text style={{ fontSize: 16, fontWeight: 800 }}>Laudo Premium - Avaliação de Locação</Text>
          <Text style={styles.muted}>Data da avaliação: {d.dataAvaliacao}</Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={{ fontWeight: 800 , fontSize: 12 }}>{d.corretorNome}</Text>
          <Text style={styles.muted}>CRECI: {d.creci}</Text>
        </View>
      </View>

      <View style={styles.coverContainer}>

        <Text style={[styles.coverLogo, { color: "black" }]}>
          LAUDO DE AVALIAÇÃO IMOBILIÁRIA
          </Text>

          <Text style={[styles.coverTitle, { color: "black" }]}>
          Relatório técnico de precificação baseado em dados de mercado
          </Text>

        <View style={[
            styles.coverCard,
              { backgroundColor: colors.soft }
            ]}>
          <Text style={[styles.coverLabel, { color: colors.primary }]}>
             Imóvel
          </Text>
            <Text style={styles.coverValue}>
            { `${d.tipo}\n ${d.bairro},\n ${d.cidade}` }
            </Text>
        </View>

        <View style={[
          styles.coverCard,
        { backgroundColor: colors.soft }
        ]}>
          <Text style={[styles.coverLabel, { color: "black" }]}>
          Este laudo foi gerado com base em dados reais de mercado e análise estatística automatizada.
          </Text>
        
       </View>

       </View>

       <View style={styles.footer} fixed>

          <View style={styles.footerRow}>

            <Image src="/logo-sem-nome.png" style={styles.logo} />

            <View style={styles.footerText}>
              <Text>
                Documento gerado por inteligência de mercado • Precifica Imóvel
              </Text>

              <Text>
              www.precificaimovel.com.br
              </Text>

              <Text
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
                }
                />
            </View>
          </View>
       </View>

     </Page>
  );
};


const BasicLayout = ({ d }: { d: LaudoData }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.blueBar} />
    <View style={styles.headerBasic}>
      <View>
        <Text style={styles.title}>Laudo Simplificado de Locação</Text>
        <Text style={styles.muted}>Data da avaliação: {d.dataAvaliacao}</Text>
      </View>
      <View style={{ textAlign: "right" }}>
        <Text style={{ fontWeight: 700 , fontSize: 12 }}>{d.corretorNome}</Text>
        <Text style={styles.muted}>CRECI: {d.creci}</Text>
      </View>
    </View>

      <View style={styles.card}>
      <Text style={styles.h}>Imóvel</Text>
      <Text style={styles.muted}>
        {d.tipo} • {d.metragem}m² • {d.quartos} quartos • {d.banheiros} banheiros • {d.vagas} vagas • {d.edícula} edícula
        {d.mobiliado ? ` • ${d.mobiliado}` : ""}
        {d.padrao ? ` • Padrão: ${d.padrao}` : ""}
      </Text>
      <Text style={[styles.muted, { marginTop: 6 }]}>
        Localização: {d.bairro}, {d.cidade}
      </Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.h}>Resultado</Text>
      <Text style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>{d.aluguelSugerido}</Text>
      <Text style={styles.muted}>Faixa estimada: {d.faixaMin} – {d.faixaMax}</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.muted}>
        Fonte: {d.fonte} | Base: {d.baseDados} | Comps: {d.comps}
      </Text>
      {!!d.obs && <Text style={[styles.muted, { marginTop: 8 }]}>{d.obs}</Text>}
    </View>
        
        <View style={styles.footer} fixed>

          <View style={styles.footerRow}>

            <Image src="/logo-sem-nome.png" style={styles.logo} />

            <View style={styles.footerText}>
              <Text>
                Documento gerado por inteligência de mercado • Precifica Imóvel
              </Text>

              <Text>
              www.precificaimovel.com.br
              </Text>

              <Text
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
                }
                />
            </View>
          </View>
       </View>
   
  </Page>
);

const PremiumLayout = ({ d }: { d: LaudoData }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.goldBar} />
    <View style={styles.headerPremium}>
      <View>
        <Text style={styles.brand}>Precifica Imóvel</Text>
        <Text style={{ fontSize: 16, fontWeight: 800 }}>Laudo Premium - Avaliação de Locação</Text>
        <Text style={styles.muted}>Data da avaliação: {d.dataAvaliacao}</Text>
      </View>
      <View style={{ textAlign: "right" }}>
        <Text style={{ fontWeight: 800 , fontSize: 12 }}>{d.corretorNome}</Text>
        <Text style={styles.muted}>CRECI: {d.creci}</Text>
      </View>
    </View>

      <View style={styles.card}>
      <Text style={styles.h}>Identificação do imóvel</Text>
      <Text style={styles.muted}>{d.bairro}, {d.cidade}</Text>
      <Text style={[styles.muted, { marginTop: 8 }]}>
        {d.tipo} • {d.metragem}m² • {d.quartos} quartos • {d.banheiros} banheiros • {d.vagas} vagas • {d.edícula} edícula
        {d.mobiliado ? ` • ${d.mobiliado}` : ""}
        {d.padrao ? ` • Padrão: ${d.padrao}` : ""}
      </Text>
    </View>

    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>Aluguel sugerido (mês)</Text>
      <Text style={styles.kpiValue}>{d.aluguelSugerido}</Text>
      <Text style={styles.muted}>Faixa estimada: {d.faixaMin} – {d.faixaMax}</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.h}>Base e metodologia</Text>
      <View style={styles.gridRow}>
        <View style={styles.col}>
          <Text style={{ fontWeight: 700 }}>Fonte</Text>
          <Text style={styles.muted}>{d.fonte}</Text>
        </View>
        <View style={styles.col}>
          <Text style={{ fontWeight: 700 }}>Base de dados</Text>
          <Text style={styles.muted}>{d.baseDados}</Text>
        </View>
        <View style={styles.col}>
          <Text style={{ fontWeight: 700 }}>Comparáveis</Text>
          <Text style={styles.muted}>{d.comps}</Text>
        </View>
      </View>
      {!!d.obs && <Text style={[styles.muted, { marginTop: 10 }]}>{d.obs}</Text>}
    </View>

        <View style={styles.footer} fixed>

          <View style={styles.footerRow}>

            <Image src="/logo-sem-nome.png" style={styles.logo} />

            <View style={styles.footerText}>
              <Text>
                Documento gerado por inteligência de mercado • Precifica Imóvel
              </Text>

              <Text>
              www.precificaimovel.com.br
              </Text>

              <Text
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
                }
                />
            </View>
          </View>
       </View>
  </Page>
);

const MarketAnalysisPage = ({ d }: { d: LaudoData }) => {
  const market = {
    preco_m2: d.market?.preco_m2 ?? "—",
    liquidez: d.market?.liquidez ?? "—",
    tempo_medio: d.market?.tempo_medio ?? "—",
    desconto_medio: d.market?.desconto_medio ?? "—",
  };

  return (
    <Page size="A4" style={styles.page}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 800 }}>
          Análise de Mercado
        </Text>
        <Text style={styles.muted}>
          Indicadores baseados em imóveis locados na região
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Preço médio por m²</Text>
        <Text style={{ fontSize: 18, fontWeight: 800 }}>
          {market.preco_m2}
        </Text>
      </View>

      <View style={styles.gridRow}>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.h}>Liquidez do bairro</Text>
          <Text>{market.liquidez}</Text>
        </View>

        <View style={[styles.card, styles.col]}>
          <Text style={styles.h}>Tempo médio para locação</Text>
          <Text>{market.tempo_medio}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Desconto médio de negociação</Text>
        <Text>{market.desconto_medio}</Text>
      </View>

      <View style={styles.footer} fixed>
        <View style={styles.footerRow}>
          <Image src="/logo-sem-nome.png" style={styles.logo} />

          <View style={styles.footerText}>
            <Text>
              Documento gerado por inteligência de mercado • Precifica Imóvel
            </Text>

            <Text>www.precificaimovel.com.br</Text>

            <Text
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </View>
    </Page>
  );
};

export const LaudoLocacaoPDF = ({ d }: { d: LaudoData }) => (
  <Document>

    {d.template === "basic"
      ? <CoverPageBasic d={d} />
      : <CoverPagePremium d={d} />} 

    
    {d.template === "basic"
      ? <BasicLayout d={d} />
      : <PremiumLayout d={d} />}

    {d.template === "premium" && (
      <MarketAnalysisPage d={d} />
    )}

  </Document>
);