import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";

export default function Admin() {
  return (
    <DashboardLayout>
      <div className="space-y-6">

        <h1 className="text-2xl font-bold">
          Painel Administrativo
        </h1>

        <div className="grid gap-4">

          <Link to="/admin/base-locacao">
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
              Base de Mercado (Locação)
            </div>
          </Link>

          <Link to="/admin/base-venda">
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
              Base de Mercado (Venda)
            </div>
          </Link>

          <Link to="/admin/importar-seed">
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
              Importar Seed (Excel)
            </div>
          </Link>

        </div>

      </div>
    </DashboardLayout>
  );
}