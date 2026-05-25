import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { processarPdfBuffer } from "./processarAnvisa.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/processar-pdf", async (req, res) => {
  try {
    const { arquivoBase64, nomeArquivo } = req.body ?? {};

    if (!arquivoBase64) {
      return res.status(400).json({
        error: "Envie o PDF em base64 no campo arquivoBase64.",
      });
    }

    const base64Limpo = arquivoBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Limpo, "base64");
    const { total, dados } = await processarPdfBuffer(buffer);

    return res.json({
      arquivo: nomeArquivo ?? "arquivo.pdf",
      total,
      dados,
      geradoEm: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Falha ao processar o PDF.",
      detalhe: error.message,
    });
  }
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
