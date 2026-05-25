import fs from "fs";

export function salvarJson(dados) {
  fs.writeFileSync(
    "resultado.json",
    JSON.stringify(dados, null, 2),
    "utf8"
  );

  console.log("\nArquivo resultado.json gerado com sucesso.");
}