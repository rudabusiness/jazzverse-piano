# jazzverse-piano — PLANO v1 (Fábrica de Apps)

Aprovado pelo Rudá a 23/11/2026 (alteração às tarefas 4 e 6 aprovada a 24/11/2026). SPEC: `SPEC-V1.md`.

## PLANO (10 tarefas, por ordem)
Regras para todas: trabalhar no ramo `feat/phase1-app-foundation`; não fundir o PR #2 nem publicar; no fim de cada tarefa `npm run typecheck && npm test && npm run build` passam.

### Tarefa 1 — Lockfile e versões fixas
- **Fazer:** fixar `next@15.5.29`, gerar e commitar `package-lock.json`, mudar o CI para `npm ci`. Corrigir no README "Next.js 14 + Tailwind" para "Next.js 15, CSS próprio".
- **Verificar:** `rm -rf node_modules && npm ci && npm run typecheck && npm test && npm run build` passam (16/16 testes); CI verde no PR #2.

### Tarefa 2 — Clipe local e `<video>` no player
- **Fazer:** extrair 3:09–4:32 com `yt-dlp --download-sections "*3:09-4:32" --force-keyframes-at-cuts` + ffmpeg para `public/lessons/bebop-blues/clip.mp4`; trocar o placeholder "VÍDEO AINDA NÃO DISPONÍVEL" de `components/lesson-player.tsx` por um `<video>` desse clipe. Documentar o comando em `docs/VIDEO_PIPELINE.md`.
- **Verificar:** em `npm run dev`, `/lesson` reproduz o clipe; `ffprobe` dá duração entre 82 e 84 s.

### Tarefa 3 — Manifesto da aula e relógio do vídeo
- **Fazer:** criar `content/bebop-blues/` com o manifesto (a partir de `examples/lesson-manifest.example.json`: `video.url`, `durationMs`, `syncAnchors`, notas). As notas a cair passam a usar `video.currentTime` como relógio, convertido em beats pelas âncoras (interpolação linear). `/lesson` deixa de depender da fixture ii–V–I.
- **Verificar:** teste de unidade: com âncoras (0 s → beat 0) e (10 s → beat 20), `currentTime` 5 s dá beat 10; play, pausa e seek no vídeo movem as notas.

### Tarefa 4 — Importar o rascunho da IA
- **Fazer:** extrair o áudio do clipe, correr `basic-pitch` 0.4.0 → `.mid`; acrescentar `@tonejs/midi` 2.0.28 e um conversor `.mid` → notas do manifesto, gravado em `content/bebop-blues/draft.json` com `interactiveStatus: "draft"`. Comando `npm run import-midi -- [ficheiro.mid]`: sem argumento usa o `.mid` do Basic Pitch; com argumento converte esse `.mid` (ex.: exportado do MT3).
- **Verificar:** teste lê um `.mid` de fixture e produz o número e as alturas de notas esperados; `draft.json` existe e tem notas; `npm run import-midi -- <fixture>.mid` regrava `draft.json` com as notas dessa fixture.

### Tarefa 5 — `/lesson` só aceita o publicado
- **Fazer:** o loader do aluno só carrega `published.json` com `reviewedByHand: true`, `interactiveStatus: "ready"` e ≥ 2 âncoras. Sem isso, mostra o vídeo e "Notas ainda em revisão", sem notas a cair.
- **Verificar:** teste: o loader recusa um manifesto `draft` e um com 1 âncora, e aceita um válido; em `npm run dev`, sem `published.json`, `/lesson` mostra o aviso.

### Tarefa 6 — Editor: ver notas sobre o vídeo
- **Fazer:** nova rota `/editor` que carrega `draft.json` (ou `published.json`, se existir) e mostra o clipe com as notas a cair (reutilizar `FallingNotes`), só leitura. Botão "Importar MIDI…" carrega um `.mid` do computador (ex.: do MT3) e substitui as notas mostradas.
- **Verificar:** abrir `/editor`, carregar em play, e as notas do rascunho acompanham o vídeo; seek move as notas; "Importar MIDI…" com a fixture `.mid` mostra as notas dessa fixture.

### Tarefa 7 — Editor: mover, apagar e adicionar notas
- **Fazer:** selecionar nota; arrastar no tempo e na altura; apagar (tecla Delete e botão); clicar para criar. Botão "Guardar rascunho" exporta `draft.json` (descarrega o ficheiro; em `npm run dev` pode também gravar em `content/` através de uma rota só de desenvolvimento).
- **Verificar:** adicionar 1 nota, mover outra e apagar uma terceira → o JSON exportado tem as 3 alterações; reabrir o editor com esse JSON mantém-nas.

### Tarefa 8 — Editor: âncoras e publicar
- **Fazer:** criar/mover/apagar âncoras (tempo do vídeo ↔ beat). Botão "Publicar": exige caixa "Revisto à mão" marcada e ≥ 2 âncoras; escreve `published.json` (`reviewedByHand: true`, `interactiveStatus: "ready"`) sem apagar o rascunho.
- **Verificar:** com 1 âncora, "Publicar" fica bloqueado; com 2 âncoras + caixa, gera `published.json`; com ele, `/lesson` mostra as notas e, em cada âncora, a nota correspondente cai a ≤ 50 ms do tempo da âncora (teste de unidade).

### Tarefa 9 — Loop A–B
- **Fazer:** no `/lesson`, botões "Marcar A" e "Marcar B" e um interruptor de loop. Ao chegar a B, o vídeo volta a A e as notas acompanham.
- **Verificar:** com A = 10 s e B = 20 s, depois de B o `currentTime` volta a ~10 s (±0,3 s) e as notas não ficam dessincronizadas; com o loop desligado, o clipe corre até ao fim.

### Tarefa 10 — (Opcional) Modo prática sobre o publicado + fecho
- **Fazer:** ligar o modo prática existente (`createPracticeTimeline`, `evaluateOnsets`, Web MIDI ±150 ms, andamentos) às notas publicadas. Atualizar `docs/VIDEO_PIPELINE.md` com o pipeline completo (yt-dlp → ffmpeg → basic-pitch → editor → publicar).
- **Verificar:** uma performance simulada perfeita sobre o publicado dá 100; sem teclado MIDI não aparece nota; `npm ci && npm run typecheck && npm test && npm run build` passam; percorrer os critérios 1–6 em `npm run dev`.

Nota: a correção manual das notas (usar o editor) é trabalho do Rudá depois da tarefa 8; o critério 2 só fica cumprido quando ele publicar.
