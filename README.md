# Robô ANVISA

Aplicação para importar PDFs do Diário Oficial, extrair publicações com indeferimentos da ANVISA e visualizar os dados em uma interface web com filtros e exportação de relatório.

## O que o projeto faz

- importa um PDF da ANVISA
- extrai razão social, CNPJ, expediente, assunto e motivo do indeferimento
- exibe os resultados em tela
- permite filtrar os registros
- exporta relatório em `CSV`, `JSON` e impressão

## Requisitos

- `Node.js` 18 ou superior
- `npm`

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Crie seu `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variáveis disponíveis:

- `PORT`: porta do servidor web
- `PDF_PATH`: caminho padrão do PDF usado no modo CLI

## Como rodar

### Painel web

Inicia a interface para upload do PDF e geração do relatório:

```bash
npm start
```

Depois, abra:

```text
http://localhost:3000
```

### Desenvolvimento

Roda o servidor com `nodemon`:

```bash
npm run dev
```

### Modo CLI

Processa o PDF direto no terminal e gera o `resultado.json`:

```bash
npm run cli
```

## Estrutura principal

- [src/server.js](/home/sergi/profissional/robo_anvisa/src/server.js): servidor Express e API
- [src/processarAnvisa.js](/home/sergi/profissional/robo_anvisa/src/processarAnvisa.js): fluxo central de processamento
- [src/filtrarAnvisa.js](/home/sergi/profissional/robo_anvisa/src/filtrarAnvisa.js): filtros e extração dos campos
- [public/index.html](/home/sergi/profissional/robo_anvisa/public/index.html): interface web
- [public/app.js](/home/sergi/profissional/robo_anvisa/public/app.js): upload, filtros e exportação

## Saídas geradas

- `resultado.json`: gerado no modo CLI
- `downloads/`: diretório usado para PDFs locais

Esses arquivos já estão cobertos no `.gitignore`.
