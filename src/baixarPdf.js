import fs from "fs";
import { pipeline } from "stream/promises";

export async function baixarPdf(url, caminhoArquivo) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/pdf,*/*",
      "Referer": "https://pesquisa.in.gov.br/"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao baixar PDF: ${response.status} ${response.statusText}`);
  }

  await pipeline(response.body, fs.createWriteStream(caminhoArquivo));

  return caminhoArquivo;
}