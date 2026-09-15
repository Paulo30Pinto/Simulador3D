# Base44 Dev Environment

## Stack
Vite 6 + React 18 + TypeScript + MUI 7 + Toolpad Core. Pure frontend — no backend, no database.

## Running
`docker compose -f docker-compose.base44.yml up -d` starts a `node:22` container that bind-mounts the source, runs `npm install --legacy-peer-deps`, and starts the Vite dev server on port 5173 (mapped to host port 3000).

## Quirks
- `npm install` REQUIRES `--legacy-peer-deps`: `@react-three/drei@10` wants React 19 but the project pins React 18. A plain install fails with ERESOLVE.
- The Vite dev server must bind `0.0.0.0` and accept the preview origin. `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed bare in the compose environment (Vite >= 6.1 appends it to allowedHosts).
- `src/services/api/gemeniChat.ts` and `src/services/api/mistralchat.ts` are standalone experimental scripts (hardcoded/placeholder API keys) and are NOT imported by the running UI. No external credentials are required to boot the app.
- Routing is handled in-memory by Toolpad's `AppProvider` router (pathname state in `App.tsx`), not react-router. `src/containers/pageContent.tsx` switches on the pathname segment.

## Verify it works
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
- `/src/main.tsx` served through Vite returns transformed (unhashed) source, confirming live edit loop.
