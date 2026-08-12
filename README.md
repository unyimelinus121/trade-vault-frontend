# TradeVault web application

This repository contains the TradeVault customer and administrator Next.js application. The API, PostgreSQL migrations, and production deployment bundle live in the separate `trade-vault-backend` repository.

## Development

```sh
cp .env.example .env.local
npm ci
npm run dev
```

For the full containerized application, clone both repositories as sibling directories named `frontend` and `backend`, then use `backend/compose.local.yml`.

## Validation

```sh
npm run lint
npm run build -- --webpack
npm audit --omit=dev --audit-level=high
```

## Container

The multi-stage Dockerfile validates and builds Next.js standalone output, then runs it as an unprivileged user with a built-in health check. `BACKEND_URL` is server-only and must resolve to the API container at runtime. Browser requests remain same-origin and Socket.IO defaults to the public page origin.

```sh
docker build -t trade-vault-frontend .
docker run --rm -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:4001 trade-vault-frontend
```

## CI/CD

GitHub Actions validates pull requests. A push to `main` publishes immutable images to `ghcr.io/<owner>/trade-vault-frontend` and updates the frontend and edge services on the deployment host.

Set the repository variable `DEPLOY_ENABLED=true`, then create the protected
`production` GitHub environment and secrets documented in the backend
repository. Deploy the backend once first so
`/opt/trade-vault/docker-compose.yml` exists.
