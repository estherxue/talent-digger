# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Monorepo layout

- **miniapp/** — WeChat mini-program (uni-app + Vue 3). Primary product.
- **admin/** — Web admin dashboard (Vite + Vue 3 + Element Plus).
- **shared/** — Shared TypeScript types only (no runtime server).
- **scripts/** — Optional CloudBase DB seeding (not part of pnpm workspace).

Package manager: **pnpm** from repo root (`pnpm-workspace.yaml`).

### Services

| Service | Command | Port / output | Required for |
|---------|---------|---------------|--------------|
| Miniapp dev build | `cd miniapp && pnpm dev` | `miniapp/dist/` | WeChat mini-program UI dev |
| Admin dev server | `pnpm dev:admin` | `http://localhost:3001` | Admin UI dev |
| Unit tests | `cd miniapp && pnpm test` | — | CI / logic verification |
| Weapp log bridge | `cd miniapp && pnpm log:server` | `127.0.0.1:8787` | Optional dev error logging |

Use **tmux** for long-running dev servers (admin, miniapp watch build).

### Important gotchas

1. **Prefer `cd miniapp && pnpm dev`** over root `pnpm dev:miniapp`. Root `dev:miniapp` runs `npx vite` (dev server); the WeChat workflow uses `vite build --watch` and opens **`miniapp/dist/`** in WeChat Developer Tools.
2. **WeChat Developer Tools** is required for full mini-program E2E but is not available in Cloud Agent VMs. Verify miniapp via `pnpm test` and `pnpm build` (or watch build) instead.
3. **No ESLint/lint npm scripts** — formatting uses `.prettierrc` (editor/Prettier only). Admin type-check runs as part of `pnpm build:admin` (`vue-tsc`).
4. **CloudBase is optional for local miniapp dev** — APIs fall back to mocks in `miniapp/src/data/mock/`. Admin expects an external CloudBase HTTP API at `VITE_API_BASE`; UI still loads without it (empty tables).
5. **Node** `>=18` (tested with Node 22).

### Standard commands (see also root `README.md`)

```bash
pnpm install              # from repo root
cd miniapp && pnpm test   # 73 vitest tests
pnpm build:miniapp        # production WeChat build → miniapp/dist/
pnpm build:admin          # vue-tsc + vite build
pnpm dev:admin            # admin at :3001
```

### Environment files

- `miniapp/.env.example` → copy to `miniapp/.env` for CloudBase (`VITE_CLOUDBASE_ENV`, `VITE_WECHAT_APPID`).
- Admin API base: set `VITE_API_BASE` when pointing at a live CloudBase admin endpoint.
