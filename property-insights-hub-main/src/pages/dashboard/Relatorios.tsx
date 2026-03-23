import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Report = {
  id: string;
  valuation_id: string | null;
  storage_path: string;
  deal_type: string;
  template: string;
  created_at: string;
};

export default function Relatorios() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-display font-bold">
            Relatórios Gerados
          </h1>
          <p className="text-muted-foreground text-sm">
            Histórico de laudos emitidos
          </p>
        </div>

        {loading && <p>Carregando relatórios...</p>}

        {!loading && reports.length === 0 && (
          <p>Nenhum relatório gerado ainda.</p>
        )}

        <div className="space-y-4">
          {reports.map((report) => (
            <ReportItem key={report.id} report={report} />
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
function ReportItem({ report }: { report: Report }) {

  const handleDownload = async () => {

    const { data, error } = await supabase.storage
      .from("reports")
      .createSignedUrl(report.storage_path, 60);

    if (error) {
      console.error(error);
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const dataFormatada = new Date(report.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="flex items-center justify-between border rounded-lg p-4">

      <div>
        <p className="font-medium">
          Laudo {report.deal_type}
        </p>

        <p className="text-sm text-muted-foreground">
          Template: {report.template}
        </p>

        <p className="text-xs text-muted-foreground">
          Gerado em {dataFormatada}
        </p>
      </div>

      <Button onClick={handleDownload}>
        Baixar PDF
      </Button>

    </div>
  );
}

