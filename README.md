# Vehicle Maintenance Backend

Language: English (default) | [Portuguese (Brazil)](README.pt-BR.md)

Serverless TypeScript backend to manage vehicles, odometer updates, fuel entries, maintenance records, and reminders.

## Stack

- Next.js App Router (API routes)
- TypeScript
- MongoDB + Mongoose
- JWT stateless authentication
- Zod validation

## Requirements

- Node.js 20+
- MongoDB instance
- Vercel project (for deployment)

## Environment Variables

Use [.env.example](.env.example) as the base:

```bash
MONGODB_URI=
JWT_SECRET=
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
ALLOW_PUBLIC_REGISTRATION=false
APP_SETUP_TOKEN=
```

## Installation

```bash
npm install
npm run dev
```

Local endpoints:

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

## API Contract

- List responses return `data` + `meta` with `page`, `pageSize`, `totalItems`, `totalPages`.
- Error responses return `error.message`, `error.code`, `error.details`.
- OpenAPI spec is available at [public/openapi.json](public/openapi.json), `GET /api/openapi`, and `GET /docs`.
- `GET /docs` uses Swagger UI and includes Quick Auth (login + automatic Bearer authorization).
- OpenAPI includes complete request/response examples for key endpoints.

## Implemented Endpoints

### Auth

- `POST /api/auth/register` (requires `x-app-setup-token` header when public registration is disabled)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Vehicles

- `GET /api/vehicles?page=1&pageSize=20&search=`
- `POST /api/vehicles`
- `GET /api/vehicles/:vehicleId`
- `PATCH /api/vehicles/:vehicleId`
- `DELETE /api/vehicles/:vehicleId`
- `POST /api/vehicles/:vehicleId/odometer`

### Fuel Entries

- `GET /api/vehicles/:vehicleId/fuel-entries?page=1&pageSize=20&fuelType=&from=&to=`
- `POST /api/vehicles/:vehicleId/fuel-entries`

### Maintenance Entries

- `GET /api/vehicles/:vehicleId/maintenance-entries?page=1&pageSize=20&maintenanceType=&from=&to=`
- `POST /api/vehicles/:vehicleId/maintenance-entries`

### Reminders

- `GET /api/vehicles/:vehicleId/reminders?page=1&pageSize=20&status=&due=`
- `POST /api/vehicles/:vehicleId/reminders`

## Current Rules

- JWT login and refresh tokens
- Public registration is disabled by default
- User provisioning can be protected with `x-app-setup-token`
- User-level data isolation
- Vehicle creation with description, plate, category, and current odometer
- Odometer regression prevention
- Fuel total calculated in backend as `quantity * unitPrice`
- Pagination and basic filters on list endpoints
- Stable structured error codes for client integration
- Maintenance records use the vehicle's current odometer
- Reminder triggers by mileage and/or date
- Backend returns reminder due-state for mobile local notifications

## Project Structure

```text
src/
  app/api/
  lib/
  models/
  validators/
```

## Tests

Integration tests use in-memory MongoDB.

```bash
npm run test
```

Current coverage includes:

- authentication, refresh, and current user
- structured errors for duplicate/invalid credentials
- vehicle pagination and filtering
- user ownership isolation
- fuel total calculation
- paginated filters for fuel and maintenance entries
- due reminders by mileage/date

## Next Steps

- add reminder completion/cancellation endpoints
- extend endpoint-level examples/documentation
- add more negative-case tests for vehicle PATCH/DELETE

## User Provisioning (Secure)

By default, user registration is not publicly open.

Use one of the options below:

- Keep `ALLOW_PUBLIC_REGISTRATION=false` and set `APP_SETUP_TOKEN`; then send `x-app-setup-token` in `POST /api/auth/register`.
- Set `ALLOW_PUBLIC_REGISTRATION=true` only in controlled environments where open registration is acceptable.

Example curl with setup token:

```bash
curl -X POST "https://YOUR-PROJECT.vercel.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "x-app-setup-token: YOUR_APP_SETUP_TOKEN" \
  -d '{
    "name": "Your Name",
    "email": "you@example.com",
    "password": "YourStrongPassword123!"
  }'
```
