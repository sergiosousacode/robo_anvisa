import "dotenv/config";
import { processarPdfArquivo } from "./processarAnvisa.js";
import { salvarJson } from "./salvarJson.js";

async function main() {
  const caminhoPdf = process.env.PDF_PATH || "downloads/2026_05_25_ASSINADO_do1.pdf";

  console.log("PDF usado:", caminhoPdf);

  console.log("Filtrando publicações da ANVISA...");
  const { total, dados } = await processarPdfArquivo(caminhoPdf);

  console.log(`Encontradas: ${total}`);
  console.table(dados.map(({ textoOriginal, ...resto }) => resto));
  res.json(dadosLimpos);

  dados.forEach((item, index) => {
    console.log("\n");
    console.log("========================================");
    console.log(`REGISTRO ${index + 1}`);
    console.log("========================================");

    console.log("RAZÃO SOCIAL:");
    console.log(item.razaoSocial);

    console.log("\nCNPJ:");
    console.log(item.cnpj);

    console.log("\nEXPEDIENTE:");
    console.log(item.expediente);

    console.log("\nASSUNTO:");
    console.log(item.assunto);

    console.log("\nMOTIVO DO INDEFERIMENTO:");
    console.log(item.motivoIndeferimento);

    console.log("\n========================================");
  });

  salvarJson(dados);
}

main().catch((error) => {
  console.error("Erro no robô:", error.message);
});
