# Claude Code instructions — JazzVerse Piano

Follow `AGENTS.md` as the engineering policy and read all required product specifications before editing files. Do not drift into a generic SaaS dashboard: this is a music-first interactive academy with cinematic catalog, real lessons, synchronized score/falling notes, accurate MIDI capture, and a compact corner mascot with Eyes-only / Full options.

Work from small verified plans: (1) inspect repo and product specs; (2) propose target files and acceptance; (3) implement one vertical slice; (4) run typecheck/unit/browser tests; (5) report exact commands and gaps. Respect existing work and request user approval before production deployment, expensive services, or uploading private recordings. Never suggest complex jazz-polyphony transcription is flawless.

Start by reading `agent/START_HERE_PROMPT.md` and `docs/ROADMAP.md`. Treat HTML prototype and PNG designs as **visual references only**, not as production implementation. Prioritize the instructor video + MIDI + hybrid notation + grounded coach loop.

## v1 da Fábrica de Apps (manda sobre o resto)
- SPEC da v1: `SPEC-V1.md`. Plano: `PLANO.md` (uma tarefa de cada vez). `SPEC.md` = visão completa, só referência.
- Ramo: `feat/phase1-app-foundation`. Nunca push para `main`, nunca fundir o PR #2, nada de produção/Vercel.
- Tecnologia: Next.js **15.5.29 fixo** (não subir para Next 16), React 19, TypeScript 5.9, CSS próprio em `app/globals.css` (sem Tailwind). Novo: `@tonejs/midi` 2.0.28.
- Pipeline de conteúdo (fora da app): Python venv em `.venv/` (fora do git) com basic-pitch 0.4.0, yt-dlp, ffmpeg. Documentar em `docs/VIDEO_PIPELINE.md`.
- Verificação obrigatória no fim de cada tarefa: `npm run typecheck && npm test && npm run build`. Os testes novos entram no script `npm test`.
- Nunca escrever segredos no código. Nunca publicar a transcrição crua da IA como `published.json` revisto (testes usam fixtures).
