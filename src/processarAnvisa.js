import { lerTextoPdf, lerTextoPdfBuffer } from "./lerPdf.js";
import { extrairDados, filtrarPublicacoesAnvisa } from "./filtrarAnvisa.js";

export async function processarPdfArquivo(caminhoArquivo) {
  const texto = await lerTextoPdf(caminhoArquivo);
  return processarTextoAnvisa(texto);
}

export async function processarPdfBuffer(buffer) {
  const texto = await lerTextoPdfBuffer(buffer);
  return processarTextoAnvisa(texto);
}

export function processarTextoAnvisa(texto) {
  const publicacoes = filtrarPublicacoesAnvisa(texto);
  const dados = publicacoes.map(extrairDados);

  return {
    total: dados.length,
    dados,
  };
}
