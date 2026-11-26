# Checklist de avaliação

Organizamos esta checklist para relacionar os critérios da disciplina aos locais do projeto que podem ser consultados durante a correção.

- [ ] **Controle de usuários:** cadastro, autenticação e gerenciamento do perfil.  
  Evidências: `frontend/app/cadastro/`, `frontend/app/login/`, `frontend/app/configuracoes/`, `backend/src/routes/user.routes.ts` e `backend/src/routes/auth.routes.ts`.

- [ ] **De 3 a 5 cadastros com operações e consulta:** telas, componentes, rotas e modelos de dados.  
  Evidências: `frontend/features/`, `frontend/app/registros/`, `frontend/app/empresa/`, `frontend/app/gerenciar-empresa/`, `backend/src/routes/` e `backend/prisma/schema.prisma`.

- [ ] **Duas operações do sistema com testes:** solicitação de participação e aprovação ou recusa de solicitação.  
  Evidências: `e2e/participacao.spec.mjs` e `e2e/README.md`.

- [ ] **Padrão de projeto documentado e implementado:** usamos Strategy para compor os filtros dos registros.  
  Evidências: `README.md`, `backend/src/services/activity-record.filter-strategy.ts` e `backend/src/services/activity-record.filter-strategy.test.ts`.

- [ ] **Instruções para executar o projeto:** instalação e inicialização do frontend, backend e banco de dados.  
  Evidências: `README.md`, `backend/.env.example` e `frontend/.env.example`.

- [ ] **Docker — critério de pontuação extra:** configuração dos bancos usados no desenvolvimento e nos testes E2E.  
  Evidências: `backend/docker-compose.yml` e `e2e/compose.yml`.

- [ ] **Histórias e alterações rastreáveis no GitHub:** Issues e Pull Requests relacionados ao desenvolvimento.  
  Evidências: [Issues](https://github.com/caiobotelho1/evidence/issues) e [Pull Requests](https://github.com/caiobotelho1/evidence/pulls).