import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import MarketTable from "@/components/MarketTable";

const ADMIN_UID = "b8138fd8-cb7f-4b5c-9d6d-3f901e454983";

export default function BaseMercadoVendaPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <MarketTable
          tableName="market_sale_m2"
          title="Base de Mercado — Venda (R$/m²)"
          adminUid={ADMIN_UID}
          hasMobiliado={false}
        />
      </div>
    </DashboardLayout>
  );
}