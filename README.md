# Evidence

Sistema de registros com interface web (Next.js) e API (Express + Prisma + PostgreSQL).

## Estrutura

```
EVIDENCE/
├── frontend/                  # Interface do sistema (Next.js)
│   ├── app/                   # Páginas e rotas
│   │   ├── page.tsx           # Página inicial
│   │   ├── login/page.tsx     # Tela de login
│   │   ├── cadastro/page.tsx  # Tela de cadastro
│   │   ├── registros/page.tsx # Tela de registros
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/                # Button, Input...
│   │   └── layout/            # Header...
│   ├── features/              # Componentes específicos por funcionalidade
│   │   ├── auth/components/
│   │   └── registros/components/
│   ├── public/                # Imagens, ícones, logos
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── backend/                   # API e regras de negócio
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   └── server.ts
│   └── package.json
│
├── .gitignore
└── README.md
```

## Como rodar

### Backend

```bash
cd backend
docker compose up -d          # sobe o PostgreSQL (porta 5434)
npm install
```

Crie o arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://evidence_user:teste@localhost:5434/evidence_db"
PORT=3333
```

> Use uma porta diferente de 3000 no backend para não conflitar com o Next.js.

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
