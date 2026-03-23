import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { supabase } from "@/integrations/supabase/client"

export default function RankingBairros() {

const [data,setData] = useState<any[]>([])
const [loading,setLoading] = useState(true)

useEffect(()=>{
load()
},[])

async function load(){

const { data,error } = await supabase
.from("v_market_liquidez")
.select("*")
.order("dias_medio_locacao",{ascending:true})

if(!error) setData(data || [])

setLoading(false)

}

return(

<DashboardLayout>

<div className="max-w-6xl mx-auto space-y-6">

<h1 className="text-2xl font-semibold">
Ranking de Liquidez de Bairros
</h1>

<p className="text-sm text-muted-foreground">
Bairros onde os imóveis alugam mais rápido.
</p>

{loading ? (

<p>Carregando...</p>

):(

<div className="rounded-xl border border-border overflow-hidden">

<table className="w-full text-sm">

<thead className="bg-muted/40">

<tr>

<th className="px-4 py-3 text-left">#</th>
<th className="px-4 py-3 text-left">Bairro</th>
<th className="px-4 py-3 text-left">Tipo</th>
<th className="px-4 py-3 text-left">Liquidez</th>
<th className="px-4 py-3 text-left">Aluguel médio</th>
<th className="px-4 py-3 text-left">Desconto médio</th>
<th className="px-4 py-3 text-left">Locações</th>

</tr>

</thead>

<tbody>

{data.map((r,i)=>(

<tr key={i} className="border-t">

<td className="px-4 py-3 font-medium">
{i+1}
</td>

<td className="px-4 py-3">
{r.bairro}
</td>

<td className="px-4 py-3">
{r.tipo}
</td>

<td className="px-4 py-3">
{r.dias_medio_locacao} dias
</td>

<td className="px-4 py-3">
R$ {Number(r.aluguel_medio).toLocaleString("pt-BR")}
</td>

<td className="px-4 py-3">
{Number(r.desconto_medio).toFixed(2)}%
</td>

<td className="px-4 py-3">
{r.total_locacoes}
</td>

</tr>

))}

</tbody>

</table>

</div>

)}

</div>

</DashboardLayout>

)

}