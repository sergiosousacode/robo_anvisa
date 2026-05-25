export function filtrarPublicacoesAnvisa(texto) {
  const blocos = texto
    .split(/(?=MOTIVO\s+DO\s+INDEFERIMENTO:)/i)
    .map((item) => item.trim())
    .filter(Boolean);

  return blocos.filter((bloco) => {
    return (
      /MOTIVO\s+DO\s+INDEFERIMENTO:/i.test(bloco) &&
      /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(bloco)
    );
  });
}

export function extrairDados(bloco) {
  return {
    razaoSocial: extrairRazaoSocial(bloco),
    cnpj: extrairCnpj(bloco),
    expediente: extrairExpediente(bloco),
    assunto: extrairAssunto(bloco),
    motivoIndeferimento: extrairMotivoIndeferimento(bloco),
    textoOriginal: bloco,
  };
}

function extrairAssunto(texto) {
  const expediente = extrairExpediente(texto);
  if (!expediente) return null;

  const antesDoExpediente = texto.split(expediente)[0];

  const linhas = antesDoExpediente
    .split("\n")
    .map(limparEspacos)
    .filter(Boolean);

  const linhaAssunto = linhas.at(-1);

  if (!linhaAssunto) return null;

  const partes = linhaAssunto.split("-").map((item) => item.trim());

  return partes.at(-1)?.replace(/\s*\/\s*$/, "") ?? null;
}

function limparEspacos(texto) {
  return texto
    ?.replace(/\s+/g, " ")
    .trim() ?? null;
}

function extrairCnpj(texto) {
  return texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)?.[0] ?? null;
}

function extrairRazaoSocial(texto) {
  const cnpj = extrairCnpj(texto);
  if (!cnpj) return null;

  const antesDoCnpj = texto.split(cnpj)[0];

  const linhas = antesDoCnpj
    .split("\n")
    .map(limparEspacos)
    .filter(Boolean);

  return linhas.at(-1)?.replace(/\s*\/\s*$/, "") ?? null;
}

function extrairExpediente(texto) {
  const match = texto.match(/\/\s*(\d{8,13})\s*(?:\n|$)/);
  return match ? match[1] : null;
}

function extrairMotivoIndeferimento(texto) {
  const match = texto.match(
    /MOTIVO\s+DO\s+INDEFERIMENTO:\s*([\s\S]*?)(?:\n\s*-{10,}\s*\n|$)/i
  );

  if (!match) return null;

  return limparEspacos(match[1]);
}
