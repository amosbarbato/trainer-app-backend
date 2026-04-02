<h1 align="center">🚀 Trainer AI Backend</h1>

## 📌 O projeto

Aplicação completa de gestão de treinos, com foco em personalização, acompanhamento de desempenho e uso de Inteligência Artificial para geração automatizada de treinos.
Uma plataforma inteligente que ajuda usuários a manter consistência nos treinos, acompanhar sua evolução e receber recomendações personalizadas de forma prática e automatizada.

### Principais Funcionalidades

**Chatbot com IA:**

- Geração automática de treinos personalizados
- Baseado em dados do usuário (objetivo, nível, disponibilidade, etc.)
- Interação simples e dinâmica via chat

**Gestão de Treinos:**

- Criação e organização de planos de treino
- Visualização dos treinos por dia/semana
- Marcação de treinos como 

**Dashboard de Acompanhamento**

- Monitoramento da consistência semanal
- Exibição de sequência atual (streak)
- Registro de recordes pessoais
- Indicadores visuais de evolução

**Diferenciais do Projeto**

- Integração de IA para personalização dos treinos
- Experiência centrada no usuário
- Visualização clara de progresso e desempenho

### Frontend

**Outra parte do projeto:** [trainer-app-frontend](https://github.com/amosbarbato/trainer-app-frontend) - Web App (Next.JS).

## 🛠️ Stack

- **Node.js** 20+
- **TypeScript**
- **Fastify com Zod Type Provider** - Rest API
- **Prisma** ORM
- **PostgreSQL** - NeonDB Database
- **Better Auth** - auth (Google)
- **Zod** - validation

## 📥 Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor dev com watch mode (tsx --watch) |
| `pnpm build` | Build com tsup |
| `pnpm start` | Inicia o servidor build |
| `pnpm prisma generate` | Gera o Prisma client |
| `pnpm prisma db pull` | 
| `pnpm prisma studio` | Abre o Prisma Studio GUI |
| `pnpm eslint` | Executa o ESLint |

## 🧩 Arquitetura

### Variaveis `.env`
```bash
PORT=8080

# Database for Prisma
DATABASE_URL=""

# Better Auth Keys
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=

API_BASE_URL=
```

### Estrutura de Diretórios

- `src/` - Código fonte
  - `lib/db.ts` - Setup do client do banco (Prisma)
  - `lib/env.ts` - Schema Zod para validar o 
  - `lib/auth.ts` - Auth Client com Better-Auth
  - `errors/` - Arquivos com classes de erro
  - `schemas/` - Schemas Zod para validação de request/response
  - `routes/` - Rotas API
  - `services/` - Classe lógica de negócio
  - `generated/` - Prisma client gerado automaticamente (output em `generated/prisma`)
- `prisma/` - Schema e migrations do Prisma 

### Documentação da API

Swagger UI disponível em `/docs` quando o servidor está rodando.