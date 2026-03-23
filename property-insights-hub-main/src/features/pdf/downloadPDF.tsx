import { pdf } from "@react-pdf/renderer";
import { LaudoLocacaoPDF, LaudoData } from "./LaudoLocacaoPDF";

export async function downloadLaudoPdf(d: LaudoData, filename: string) {
  const blob = await pdf(<LaudoLocacaoPDF d={d} />).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}