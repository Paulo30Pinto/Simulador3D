# Base44 Dev Environment

## Stack
Vite 6 + React 18 + TypeScript + MUI 7 + Toolpad Core. Pure frontend — no backend, no database.

## Running
`docker compose -f docker-compose.base44.yml up -d` starts an `oven/bun:1` container that bind-mounts the
source, runs `bun install --frozen-lockfile`, and starts the Vite dev server on container port 3000
(host port 3000). `bun.lock` is the committed lockfile — after changing `package.json` run `bun install`
once so the lockfile stays in sync, otherwise the frozen install at container start fails.

## Quirks
- **Dependency pins are load-bearing.** `@google/model-viewer` must stay on the `4.1.x` line: 4.2.x peers
  `three@^0.182.0` and 4.3.x peers `three@^0.183.0`, while this project pins `three@^0.172.0`. With 4.3.x a
  plain `npm install` aborts with ERESOLVE, nothing gets installed and the app cannot start. `~4.1.0` is the
  version whose peer range matches `three@0.172.0`.
- `.npmrc` sets `legacy-peer-deps=true`: `@react-three/drei@10` peers React 19 but the project pins React 18,
  so npm's strict peer resolution aborts the install. bun ignores peers and needs no flag.
- Routing is in-memory (Toolpad `AppProvider` pathname state in `src/App.tsx`), not URL based: the dev server
  only ever serves `/`, and `src/containers/pageContent.tsx` switches content on the segment. The pages are
  reached by clicking the sidebar, so URL-level checks only cover the Motor (home) page.
- `src/containers/three.ts` still drives an unused legacy dat.gui scene; the visible 3D views are
  `src/components/model-viewer.tsx` (Google `<model-viewer>`).
- 3D models live in `public/assets/elementos3d/*.glb` and are 5–10 MB each; first paint of a page with a
  viewer is slow on a cold cache.
- `.env.example` mentions `GEMINI_API_KEY` / `OPENROUTER_API_KEY`, but no code reads them (they belong to
  removed `src/services/api/*` scripts). No credentials are needed to boot or use the app.

## Verify it works
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
- `curl -s http://localhost:3000/src/main.tsx | head -1` returns unhashed transformed source, confirming the
  live edit loop rather than a prebuilt bundle.
- In the browser: all five sidebar pages must render a `<model-viewer>` with `loaded === true` (the `.glb`
  requests return 200), clicking `LIGAR` on the Motor page must spin the simulation up to ~1484 RPM, and the
  console must stay free of errors.
- `npm install && npm run build` (`tsc -b && vite build`) must also succeed for npm-based environments.

## Jogo da oficina (sidebar → Oficina)
- Código em `src/game/` — `parts/` (catálogo das peças), `state/` (regras + contexto), `audio/` (Web Audio sintetizado
  + `/mp3/electric-motor-whir-77588.mp3` para o motor), `components/`, `phases/`, `legacy/` (MotorAria/MotorCopilot, não usados).
- Estado do jogo: React Context + reducer (`GameProvider`), **sem dependências novas**. Persiste em
  `localStorage['motor-game-v1']` = fase, peças montadas e record de diagnósticos; ao abrir, o jogo retoma a fase
  guardada, por isso os ícones de fase no HUD são clicáveis (recomeçam qualquer fase).
- O motor é ilustrado por um único `<model-viewer>` que troca de `.glb`: peça selecionada, ou o conjunto
  (`motor.glb` → `motor_aberto1.glb` → `estator2.glb`) conforme as peças saem. As peças são pontos interactivos
  (chips) sobre a bancada, não malhas separadas dentro do modelo.
- Gestos: arrastar chip → bandeja (desmontar) e bandeja → bancada (montar); clique/toque selecciona (e, no
  diagnóstico, lê a peça com a ferramenta activa). Implementado com Pointer Events + `elementFromPoint`.
- Verificação (a que correu bem): desmontagem fora de ordem é recusada com vibração vermelha; a ordem guiada
  funciona; a fase de diagnóstico só fica verde com a ferramenta certa na peça avariada; apontar a peça avariada
  passa à reparação com a peça nova a brilhar na bandeja.
- Verificação manual ainda em falta: remontagem completa + veredito "Motor OK" (o iframe do preview caiu a meio
  da última sequência; o servidor manteve-se saudável).
