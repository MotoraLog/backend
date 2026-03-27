# Vehicle Maintenance Backend

Idioma: [English (default)](README.md) | Português (Brasil)

Backend serverless em TypeScript para gerenciar veículos, atualizações de hodômetro, abastecimentos, manutenções e lembretes.

## Stack

- Next.js App Router (rotas de API)
- TypeScript
- MongoDB + Mongoose
- Autenticação stateless com JWT
- Validação com Zod

## Requisitos

- Node.js 20+
- Instância MongoDB
- Projeto na Vercel (para deploy)

## Variáveis de Ambiente

Use [.env.example](.env.example) como base:

```bash
MONGODB_URI=
JWT_SECRET=
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
ALLOW_PUBLIC_REGISTRATION=false
APP_SETUP_TOKEN=
```

## Instalação

```bash
npm install
npm run dev
```

Endpoints locais:

- App: `http://localhost:3000`
- Health: `GET http://localhost:3000/api/health`
- OpenAPI JSON: `GET http://localhost:3000/api/openapi`
- Docs UI: `GET http://localhost:3000/docs`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run test
```

## Contrato da API

- Listagens retornam `data` + `meta` com `page`, `pageSize`, `totalItems`, `totalPages`.
- Erros retornam `error.message`, `error.code`, `error.details`.
- A spec OpenAPI está disponível em [public/openapi.json](public/openapi.json), em `GET /api/openapi` e em `GET /docs`.
- `GET /docs` usa Swagger UI com Quick Auth (login + autorização Bearer automática).
- A OpenAPI inclui exemplos completos de request/response nos endpoints principais.

## Endpoints Implementados

### Auth

- `POST /api/auth/register` (exige header `x-app-setup-token` quando cadastro público estiver desabilitado)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Veículos

- `GET /api/vehicles?page=1&pageSize=20&search=`
- `POST /api/vehicles`
- `GET /api/vehicles/:vehicleId`
- `PATCH /api/vehicles/:vehicleId`
- `DELETE /api/vehicles/:vehicleId`
- `POST /api/vehicles/:vehicleId/odometer`

### Abastecimentos

- `GET /api/vehicles/:vehicleId/fuel-entries?page=1&pageSize=20&fuelType=&from=&to=`
- `POST /api/vehicles/:vehicleId/fuel-entries`

### Manutenções

- `GET /api/vehicles/:vehicleId/maintenance-entries?page=1&pageSize=20&maintenanceType=&from=&to=`
- `POST /api/vehicles/:vehicleId/maintenance-entries`

### Lembretes

- `GET /api/vehicles/:vehicleId/reminders?page=1&pageSize=20&status=&due=`
- `POST /api/vehicles/:vehicleId/reminders`

## Regras Atuais

- Login JWT com refresh token
- Cadastro público desabilitado por padrão
- Provisionamento de usuários protegido por `x-app-setup-token`
- Isolamento de dados por usuário
- Cadastro de veículo com descrição, placa, categoria e hodômetro atual
- Bloqueio de regressão de hodômetro
- Total de abastecimento calculado no backend como `quantity * unitPrice`
- Paginação e filtros básicos nas listagens
- Códigos de erro estruturados para integração com cliente
- Manutenção registra a quilometragem atual do veículo
- Lembretes com gatilho por quilometragem e/ou data
- Backend retorna estado de vencimento de lembrete para notificações locais no app

## Estrutura do Projeto

```text
src/
  app/api/
  lib/
  models/
  validators/
```

## Testes

Os testes de integração usam MongoDB em memória.

```bash
npm run test
```

A cobertura atual inclui:

- autenticação, refresh e usuário atual
- erros estruturados para duplicidade/credenciais inválidas
- paginação e filtro de veículos
- isolamento por ownership de usuário
- cálculo de total de abastecimento
- filtros paginados de abastecimentos e manutenções
- lembretes vencidos por quilometragem/data

## Próximos Passos

- adicionar endpoints de concluir/cancelar lembretes
- expandir exemplos e documentação por endpoint
- adicionar mais testes de cenários negativos para PATCH/DELETE de veículo

## Provisionamento de Usuário (Seguro)

Por padrão, o cadastro não fica aberto publicamente.

Use uma destas opções:

- Manter `ALLOW_PUBLIC_REGISTRATION=false` e definir `APP_SETUP_TOKEN`; nesse caso envie `x-app-setup-token` em `POST /api/auth/register`.
- Definir `ALLOW_PUBLIC_REGISTRATION=true` somente em ambientes controlados onde cadastro aberto seja aceitável.

Exemplo de curl com setup token:

```bash
curl -X POST "https://SEU-PROJETO.vercel.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "x-app-setup-token: SEU_APP_SETUP_TOKEN" \
  -d '{
    "name": "Seu Nome",
    "email": "seu-email@exemplo.com",
    "password": "SuaSenhaForte123!"
  }'
```
