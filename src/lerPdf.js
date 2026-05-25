import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function lerTextoPdf(caminhoArquivo) {
  const buffer = fs.readFileSync(caminhoArquivo);

  return lerTextoPdfBuffer(buffer);
}

export async function lerTextoPdfBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  return result.text;
}
