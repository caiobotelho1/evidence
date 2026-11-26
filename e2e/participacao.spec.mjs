import { randomInt, randomUUID } from "node:crypto";
import { test as base, expect } from "playwright/test";

async function cadastrarEAutenticar(page, nome, email) {
  const password = "Senha-Evidence-E2E";
  const cadastro = await page.request.post("/api/users", {
    data: { name: nome, email, phone: "44999999999", password },
  });
  expect(cadastro.status(), await cadastro.text()).toBe(201);
  const login = await page.request.post("/api/auth/login", { data: { email, password } });
  await expect(login).toBeOK();
}

const test = base.extend({
  cenario: async ({ browser, baseURL, page }, use) => {
    const contextoDono = await browser.newContext({ baseURL });
    try {
      const dono = await contextoDono.newPage();
      const id = randomUUID();
      const email = `funcionario-${id}@example.test`;
      await cadastrarEAutenticar(dono, "Proprietário E2E", `dono-${id}@example.test`);
      await cadastrarEAutenticar(page, "Funcionário E2E", email);
      const nomeEmpresa = `Empresa E2E ${id}`;
      const cnpj = String(randomInt(0, 100_000_000_000_000)).padStart(14, "0");
      const resposta = await dono.request.post("/api/companies", {
        data: { legalName: nomeEmpresa, cnpj },
      });
      expect(resposta.status(), await resposta.text()).toBe(201);
      const empresa = await resposta.json();
      await use({ dono, funcionario: page, email, empresa });
    } finally {
      await contextoDono.close();
    }
  },
});

async function preencherSolicitacao({ funcionario, empresa }) {
  await funcionario.goto("/solicitar-participacao");
  await funcionario.getByLabel("CNPJ da empresa").fill(empresa.cnpj);
  await funcionario.getByRole("button", { name: "Buscar empresa" }).click();
  await expect(funcionario.getByRole("heading", { name: empresa.legalName })).toBeVisible();
  await funcionario.getByLabel("Cargo ou função na empresa").fill("Analista");
  await funcionario.getByLabel(/Mensagem para o responsável/).fill("Solicito participação na equipe.");
}

async function abrirPendencia({ dono, email }) {
  await dono.goto("/gerenciar-empresa");
  await dono.getByRole("link", { name: /Ver solicitações/i }).click();
  const cartao = dono.getByRole("article").filter({ hasText: email });
  await expect(cartao).toContainText("Analista");
  await expect(cartao).toContainText("Solicito participação na equipe.");
  return cartao;
}

async function conferirVinculo({ funcionario, empresa }, status, httpEsperado) {
  const perfil = await funcionario.request.get("/api/auth/me");
  await expect(perfil).toBeOK();
  const { user } = await perfil.json();
  const vinculos = user.memberships.filter((item) => item.companyId === empresa.id);
  expect(vinculos).toHaveLength(1);
  expect(vinculos[0]).toMatchObject({ role: "EMPLOYEE", status });
  const registros = await funcionario.request.get(`/api/companies/${empresa.id}/records`);
  expect(registros.status()).toBe(httpEsperado);
}

test("HU006 | solicitar entrada mantém o vínculo pendente e impede duplicatas", async ({ cenario }) => {
  const { funcionario } = cenario;
  await preencherSolicitacao(cenario);
  await funcionario.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(funcionario.getByRole("heading", { name: "Solicitação enviada!" })).toBeVisible();
  await abrirPendencia(cenario);
  await conferirVinculo(cenario, "PENDING", 403);

  await preencherSolicitacao(cenario);
  await funcionario.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(funcionario.locator("form").getByRole("alert")).toContainText("solicitação pendente");
  await conferirVinculo(cenario, "PENDING", 403);
});

const decisoes = [
  { acao: "Aprovar", titulo: "Solicitação aprovada!", status: "ACTIVE", http: 200 },
  { acao: "Recusar", titulo: "Solicitação recusada.", status: "REJECTED", http: 403 },
];

for (const decisao of decisoes) {
  test(`HU008 | ${decisao.acao} solicitação atualiza o acesso do funcionário`, async ({ cenario }) => {
    const { funcionario, empresa, dono, email } = cenario;
    const pendencia = await funcionario.request.post(`/api/companies/${empresa.id}/membership-requests`, {
      data: { jobTitle: "Analista", message: "Solicito participação na equipe." },
    });
    expect(pendencia.status(), await pendencia.text()).toBe(201);
    const cartao = await abrirPendencia(cenario);
    await cartao.getByRole("button", { name: `${decisao.acao} solicitação` }).click();
    await expect(dono.getByRole("heading", { name: decisao.titulo, exact: true })).toBeVisible({ timeout: 60_000 });

    await dono.goto("/receber-solicitacao");
    await expect(dono.getByText("Não há solicitações pendentes para esta empresa.")).toBeVisible();
    await conferirVinculo(cenario, decisao.status, decisao.http);
    await dono.goto("/gerenciar-empresa");
    if (decisao.status === "ACTIVE") {
      await expect(dono.getByText(email, { exact: true })).toBeVisible();
    } else {
      await expect(dono.getByText("Nenhum funcionário ativo nesta empresa.")).toBeVisible();
    }
  });
}
