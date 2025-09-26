# PiGalleryDeploy

One-line summary  
Builds and packages a Next.js frontend and an Express backend, then deploys and runs them on a locally connected Raspberry Pi (Raspberry Pi OS) using Ansible. Provides a web UI to upload, organize, and control photos displayed on the Pi.

---

## Table of contents
- [Features](#features)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
- [Build & package for deployment](#build--package-for-deployment)
- [Deploy to a Raspberry Pi (example)](#deploy-to-a-raspberry-pi-example)
- [What Ansible does](#what-ansible-does)
- [Best practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Next.js frontend providing a photo upload and management UI.
- Express.js backend for serving and controlling the photo frame on the Pi.
- Ansible-based provisioning and deployment to Raspberry Pi OS.
- Systemd-managed service with optional nginx reverse proxy.
- Packaging scripts to produce deployable artifacts suitable for CI.

---

## Repository layout
Top-level folders of interest:
- `infra/` — Ansible playbooks, roles, inventories, templates, helper scripts  
- `packages/frontend/` — Next.js app (React) (components, pages/app router, styles)  
- `packages/server/` — Express server (API, controllers, views, public assets)  
- `packages/shared/` — Shared types/utilities (optional)  
- `scripts/` — Repo-level build/package/deploy helpers  
- `docs/` — Architecture and provisioning guides  
- `tests/` — Unit and integration tests

---

## Prerequisites
- Node.js 18+ (LTS recommended)  
- npm, pnpm, or yarn  
- Ansible 2.11+ (or latest stable)  
- SSH access to target Raspberry Pi (key-based recommended)  
- Optional: Docker (for CI builds)

---

## Local development

Install dependencies (root monorepo using your package manager; example uses npm):
```bash
# from repo root
npm install
# or pnpm install
# or yarn install
```

Frontend (Next.js) dev server:
```bash
cd packages/frontend
npm run dev
# open http://localhost:3000
```

Server (Express) dev server:
```bash
cd packages/server
npm run dev
# or: node src/index.js
```

---

## Build & package for deployment

Typical CI/local flow:
1. Build frontend:
```bash
cd packages/frontend
npm run build
```

2. Create deploy artifact (example helper):
```bash
# from repo root
./scripts/build-all.sh
# or
./scripts/create-deploy-archive.sh
```
These scripts should run tests/lint, build frontend, copy built assets into the server package (or produce a tarball), and create a deployable archive for Ansible to transfer.

---

## Deploy to a Raspberry Pi (example)

1. Edit inventory: `infra/inventories/local/hosts.yml` (or `hosts.ini`) — set host, user, and SSH key info. Use `host_vars/` or `group_vars/` for per-host configuration.

2. Run Ansible playbook:
```bash
cd infra
ansible-playbook -i inventories/local playbooks/site.yml
# or use helper:
./infra/scripts/run-ansible-deploy.sh --inventory infra/inventories/local
```

Notes:
- If using the helper script, ensure it points to the correct deploy artifact produced in the previous step.
- Use `ansible-vault` for secrets; do not commit private keys or passwords to the repo.

---

## What Ansible does (high level)
- Installs Node.js (or ensures a runtime is present).
- Transfers the packaged artifact (built frontend + server code).
- Installs files and sets correct ownership/permissions.
- Installs/configures nginx (optional) and places templated config.
- Installs a systemd unit for the app service and enables/restarts it via handlers.
- Applies idempotent tasks and uses handlers to restart only on changes.

---

## Best practices
- Use role-based Ansible layout (`infra/roles/`) for modular, testable provisioning.
- Keep secrets out of repo; use `ansible-vault` or external secret manager.
- Build artifacts in CI and let Ansible only transfer/install artifacts (avoid building on-device).
- Use a package manager workspace (pnpm/yarn workspaces) to share types and speed installs.
- Keep Pi-specific overrides in `infra/inventories/local` and avoid committing sensitive host data.

---

## Troubleshooting
- SSH connection issues: verify IP, SSH key, and that SSH user has sudo or required privileges.
- Permission issues: check file ownership and systemd unit user settings.
- Slow transfers/timeouts: increase Ansible connection/file timeout settings or use async file transfer patterns.
- Service fails to start: check `journalctl -u <service-name>` on the Pi and validate environment variables.

---

## Contributing
- Run tests and linting before submitting PRs.
- Add unit/integration tests under `tests/`.
- Improve Ansible roles with idempotency and handlers.
- Add CI pipeline to build artifacts and run tests.

---

## Useful commands
- Install deps (root): `npm install`  
- Frontend dev: `cd packages/frontend && npm run dev`  
- Frontend build: `cd packages/frontend && npm run build`  
- Server dev: `cd packages/server && npm run dev`  
- Build & package all: `./scripts/build-all.sh`  
- Run Ansible deploy: `./infra/scripts/run-ansible-deploy.sh --inventory infra/inventories/local`

---

## Fixes — Vitest / @vitejs/plugin-react / Next.js TypeScript

This section documents applied fixes and step-by-step remediation for two issues encountered when adding @vitejs/plugin-react and running Next.js builds in a TypeScript project.

### 1 — ERESOLVE when installing @vitejs/plugin-react

Problem:
- npm install failed with error code `ERESOLVE` while adding `@vitejs/plugin-react`.

Cause:
- Missing Node type definitions caused dependency/type resolution issues during install.

Fix (steps):
1. Install Node type definitions as a dev dependency:
   ```bash
   npm install --save-dev @types/node
   ```
2. Re-run the install for the plugin if needed:
   ```bash
   npm install --save-dev @vitejs/plugin-react
   ```
3. Verify install succeeded:
   - Check package.json contains `@types/node` and `@vitejs/plugin-react`.
   - Run a quick TypeScript compile or linter to confirm no missing types.

Optional:
- If you use pnpm or yarn, use the equivalent add command.

---

### 2 — Next.js type-checking files inside @vitejs/plugin-react

Problem:
- `npm run build` failed because Next.js’ TypeScript type-check included files in `node_modules/@vitejs/plugin-react`.

Cause:
- tsconfig include/exclude settings were broad or missing, allowing Next’s type-check step to pick up files under `node_modules`.

Fix (steps):
1. Create or update tsconfig.app.json at the repo root (used for the Next build) with a focused exclude:
   ```json
   {
     "extends": "./tsconfig.json",
     "exclude": ["node_modules", ".next", "dist", "vitest.config.ts"]
   }
   ```
2. Ensure your base tsconfig.json has a narrow include (recommended):
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",
       "skipLibCheck": true
     },
     "include": ["src/**/*", "next-env.d.ts"]
   }
   ```
3. Confirm Next uses the root tsconfig (Next auto-detects root tsconfig). Avoid importing dev-only configs or files from pages/components.
4. Clean caches and rebuild:
   ```bash
   rm -rf .next node_modules/.vite
   npm run build
   ```

Notes and recommendations:
- `skipLibCheck: true` in compilerOptions reduces noise from declaration files in node_modules but does not replace proper excludes.
- Avoid overly broad "include": ["**/*"] in tsconfig roots; prefer explicit folders like `src`.
- If you only need `@vitejs/plugin-react` for testing (Vitest), ensure that plugin is referenced only in vitest.config.ts and not imported by any code that Next builds.
