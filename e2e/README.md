# Testes de participação em empresa

A suíte usa o Chromium, a interface Next.js, a API Express e um PostgreSQL 17 exclusivo dos testes. Cada cenário cria uma empresa e duas contas pela API. O funcionário e o proprietário usam sessões independentes. As ações avaliadas passam pela interface e os testes fazem novas consultas para verificar o vínculo e o acesso.

| História | Ação na interface | Resultado verificado |
| --- | --- | --- |
| HU006, issue #13 | Buscar a empresa pelo CNPJ, solicitar participação e tentar novamente | O proprietário visualiza cargo e mensagem. Há um único vínculo pendente e o funcionário ainda não pode consultar os registros. |
| HU008, issue #19 | Aprovar uma solicitação pendente | A solicitação sai da fila, o funcionário aparece na lista de ativos e ganha acesso aos registros da empresa. |
| HU008, issue #19 | Recusar uma solicitação pendente | A solicitação sai da fila, o vínculo fica rejeitado e o funcionário continua sem acesso aos registros. |

## Primeira execução

Use Node e npm compatíveis com o projeto, Docker com Compose e o código da main que contém as rotas /solicitar-participacao e /receber-solicitacao. Execute a partir da raiz, preferencialmente em uma cópia de trabalho própria para os testes. O Next em desenvolvimento usa o diretório .next desta cópia.

```bash
npm ci
npm --prefix backend install
npm --prefix frontend ci
npx playwright install chromium
docker compose -f e2e/compose.yml up -d --wait
npm run test:e2e
```

A configuração aplica as migrations ao banco evidence_e2e na porta 55434, gera o Prisma Client e inicia a API na porta 3334 e o frontend na 3100. Todos os serviços do teste usam o endereço local. O banco usa memória temporária e permanece disponível para repetir a suíte durante a sessão. A instalação de pacotes e do navegador e o primeiro acesso às fontes usadas pelo frontend podem precisar de internet.

## Relatório e repetição

```bash
npm run test:e2e -- --headed
npx playwright show-report e2e/report
```

O relatório inclui cada cenário. Em caso de falha, o Playwright guarda o trace em e2e/test-results. Para repetir apenas uma história, use por exemplo `npm run test:e2e -- --grep HU006`.

Ao terminar a sessão, o comando abaixo encerra o PostgreSQL temporário e descarta somente os dados do ambiente de teste.

```bash
docker compose -f e2e/compose.yml down
```
