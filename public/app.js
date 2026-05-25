const state = {
  arquivo: null,
  dados: [],
  filtrados: [],
  geradoEm: null,
};

const uploadForm = document.querySelector("#upload-form");
const pdfInput = document.querySelector("#pdf-input");
const fileName = document.querySelector("#file-name");
const processButton = document.querySelector("#process-button");
const statusMessage = document.querySelector("#status-message");
const searchInput = document.querySelector("#search-input");
const assuntoFilter = document.querySelector("#assunto-filter");
const resultsBody = document.querySelector("#results-body");
const resultCount = document.querySelector("#result-count");
const statFile = document.querySelector("#stat-file");
const statTotal = document.querySelector("#stat-total");
const statAssuntos = document.querySelector("#stat-assuntos");
const statEmpresas = document.querySelector("#stat-empresas");
const reportHighlights = document.querySelector("#report-highlights");
const exportCsvButton = document.querySelector("#export-csv");
const exportJsonButton = document.querySelector("#export-json");
const printReportButton = document.querySelector("#print-report");

pdfInput.addEventListener("change", () => {
  const [arquivo] = pdfInput.files;
  fileName.textContent = arquivo ? arquivo.name : "Nenhum arquivo selecionado";
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const [arquivo] = pdfInput.files;

  if (!arquivo) {
    setStatus("Selecione um PDF antes de processar.", "error");
    return;
  }

  processButton.disabled = true;
  setStatus("Processando PDF, isso pode levar alguns segundos...", "");

  try {
    const arquivoBase64 = await fileToBase64(arquivo);

    const response = await fetch("/api/processar-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomeArquivo: arquivo.name,
        arquivoBase64,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.detalhe || payload.error || "Falha ao processar o PDF.");
    }

    state.arquivo = payload.arquivo;
    state.dados = payload.dados || [];
    state.geradoEm = payload.geradoEm;

    preencherAssuntos(state.dados);
    aplicarFiltros();

    setStatus(
      `PDF processado com sucesso. ${state.dados.length} registros carregados.`,
      "success"
    );
    atualizarResumo();
    atualizarRelatorio();
    atualizarAcoes();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    processButton.disabled = false;
  }
});

searchInput.addEventListener("input", aplicarFiltros);
assuntoFilter.addEventListener("change", aplicarFiltros);
exportCsvButton.addEventListener("click", exportarCsv);
exportJsonButton.addEventListener("click", exportarJson);
printReportButton.addEventListener("click", () => window.print());

function preencherAssuntos(dados) {
  const assuntos = [...new Set(dados.map((item) => item.assunto).filter(Boolean))].sort();

  assuntoFilter.innerHTML = '<option value="">Todos</option>';

  assuntos.forEach((assunto) => {
    const option = document.createElement("option");
    option.value = assunto;
    option.textContent = assunto;
    assuntoFilter.append(option);
  });
}

function aplicarFiltros() {
  const termo = normalize(searchInput.value);
  const assunto = assuntoFilter.value;

  state.filtrados = state.dados.filter((item) => {
    const matchAssunto = !assunto || item.assunto === assunto;
    const textoBusca = normalize(
      [
        item.razaoSocial,
        item.cnpj,
        item.expediente,
        item.assunto,
        item.motivoIndeferimento,
      ]
        .filter(Boolean)
        .join(" ")
    );

    const matchBusca = !termo || textoBusca.includes(termo);
    return matchAssunto && matchBusca;
  });

  renderTabela();
  atualizarResumo();
  atualizarRelatorio();
  atualizarAcoes();
}

function renderTabela() {
  if (!state.filtrados.length) {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table">Nenhum registro encontrado para os filtros atuais.</td>
      </tr>
    `;
    resultCount.textContent = "0 registros exibidos";
    return;
  }

  resultsBody.innerHTML = state.filtrados
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.razaoSocial || "-")}</td>
          <td>${escapeHtml(item.cnpj || "-")}</td>
          <td>${escapeHtml(item.expediente || "-")}</td>
          <td>${escapeHtml(item.assunto || "-")}</td>
          <td>${escapeHtml(item.motivoIndeferimento || "-")}</td>
        </tr>
      `
    )
    .join("");

  resultCount.textContent = `${state.filtrados.length} registros exibidos`;
}

function atualizarResumo() {
  const assuntos = new Set(state.filtrados.map((item) => item.assunto).filter(Boolean));
  const empresas = new Set(state.filtrados.map((item) => item.razaoSocial).filter(Boolean));

  statFile.textContent = state.arquivo || "Nenhum";
  statTotal.textContent = String(state.filtrados.length);
  statAssuntos.textContent = String(assuntos.size);
  statEmpresas.textContent = String(empresas.size);
}

function atualizarRelatorio() {
  if (!state.dados.length) {
    reportHighlights.className = "report-highlights empty-state";
    reportHighlights.textContent = "O relatório aparecerá aqui depois do processamento.";
    return;
  }

  const topAssuntos = contarPorCampo(state.filtrados, "assunto").slice(0, 3);
  const topEmpresas = contarPorCampo(state.filtrados, "razaoSocial").slice(0, 3);

  reportHighlights.className = "report-highlights";
  reportHighlights.innerHTML = `
    <div class="highlight-list">
      <article class="highlight-card">
        <strong>Arquivo processado</strong>
        <span>${escapeHtml(state.arquivo || "-")}</span>
      </article>
      <article class="highlight-card">
        <strong>Período do relatório</strong>
        <span>${formatarDataHora(state.geradoEm)}</span>
      </article>
      <article class="highlight-card">
        <strong>Filtro ativo</strong>
        <span>${escapeHtml(descreverFiltroAtual())}</span>
      </article>
      <article class="highlight-card">
        <strong>Total exibido</strong>
        <span>${state.filtrados.length} publicações</span>
      </article>
      <article class="highlight-card">
        <strong>Assuntos mais frequentes</strong>
        <span>${escapeHtml(formatarRanking(topAssuntos))}</span>
      </article>
      <article class="highlight-card">
        <strong>Empresas mais frequentes</strong>
        <span>${escapeHtml(formatarRanking(topEmpresas))}</span>
      </article>
    </div>
  `;
}

function atualizarAcoes() {
  const habilitar = state.filtrados.length > 0;
  exportCsvButton.disabled = !habilitar;
  exportJsonButton.disabled = !habilitar;
  printReportButton.disabled = !habilitar;
}

function contarPorCampo(dados, campo) {
  const mapa = new Map();

  dados.forEach((item) => {
    const chave = item[campo];
    if (!chave) return;
    mapa.set(chave, (mapa.get(chave) || 0) + 1);
  });

  return [...mapa.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, total]) => ({ label, total }));
}

function formatarRanking(itens) {
  if (!itens.length) return "Sem dados suficientes";
  return itens.map((item) => `${item.label} (${item.total})`).join(" | ");
}

function descreverFiltroAtual() {
  const partes = [];

  if (searchInput.value.trim()) {
    partes.push(`Busca: ${searchInput.value.trim()}`);
  }

  if (assuntoFilter.value) {
    partes.push(`Assunto: ${assuntoFilter.value}`);
  }

  return partes.length ? partes.join(" | ") : "Sem filtros adicionais";
}

function exportarCsv() {
  const headers = [
    "razaoSocial",
    "cnpj",
    "expediente",
    "assunto",
    "motivoIndeferimento",
  ];

  const linhas = [
    headers.join(","),
    ...state.filtrados.map((item) =>
      headers
        .map((header) => `"${String(item[header] || "").replaceAll('"', '""')}"`)
        .join(",")
    ),
  ];

  baixarArquivo(
    new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" }),
    "relatorio-anvisa.csv"
  );
}

function exportarJson() {
  baixarArquivo(
    new Blob([JSON.stringify(state.filtrados, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
    "relatorio-anvisa.json"
  );
}

function baixarArquivo(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function setStatus(message, tone) {
  statusMessage.textContent = message;

  if (tone) {
    statusMessage.dataset.tone = tone;
    return;
  }

  delete statusMessage.dataset.tone;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarDataHora(dataIso) {
  if (!dataIso) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dataIso));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
