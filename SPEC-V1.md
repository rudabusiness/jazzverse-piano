# jazzverse-piano — SPEC v1 (Fábrica de Apps)

Aprovada pelo Rudá a 23/11/2026 (alteração às tarefas 4 e 6 aprovada a 24/11/2026). Fonte: 1 · Arquiteto. O `SPEC.md` (revisão 1.0, visão completa) continua a ser a referência de produto; para a v1 manda este ficheiro.

## SPEC
- **Objetivo:** demo da academia de piano jazz. O aluno vê o trecho 3:09–4:32 da aula *Bebop Blues* do Jeff Gardner com as notas a cair no piano, alinhadas ao vídeo, e repete um loop A–B. As notas vêm de um rascunho de IA que o Rudá corrige num editor da app.
- **Utilizadores:** (1) aluno de piano jazz (público ainda por validar); (2) o Rudá como editor das notas.
- **Funcionalidades v1:**
  1. Clipe local 3:09–4:32 (~83 s) de https://www.youtube.com/watch?v=p-hZGY7wNE8 no player `/lesson` (alojado por nós, sem YouTube embutido).
  2. Notas a cair sincronizadas com o vídeo (relógio = `currentTime` do vídeo, com ≥ 2 âncoras de sincronismo).
  3. Loop A–B por tempo no clipe.
  4. Rascunho MIDI gerado por IA (Basic Pitch por defeito) e importado como `draft.json`; também aceita um `.mid` externo (ex.: MT3, modelo de piano `ismir2021`, corrido à mão no Colab).
  5. Editor `/editor`: ver notas sobre o vídeo, mover/apagar/adicionar notas, criar/mover âncoras, guardar rascunho e publicar `published.json` (exige "revisto à mão" + ≥ 2 âncoras). Sem base de dados: os ficheiros ficam no repositório.
  6. `/lesson` só carrega o publicado. Sem publicado, mostra o vídeo e "notas ainda em revisão".
  7. Opcional: modo prática já existente (Web MIDI, ±150 ms, andamento à escolha, nota no fim) sobre as notas publicadas.
- **Fora do âmbito:** catálogo tipo Netflix, contas, progresso, mascote a responder, motion graphics, várias aulas, microfone, gravar MIDI ao filmar, banda virtual, repo novo, merge para `main`, publicação em produção, Supabase, Stripe, Tailwind.
- **Tecnologia:** continuar no ramo `feat/phase1-app-foundation` de https://github.com/rudabusiness/jazzverse-piano (PR #2, rascunho): Next.js 15.5.29 (fixar esta versão; a estável é a 16.4.6, mas não se salta de major nesta v1), React 19, TypeScript 5.9, CSS próprio (`app/globals.css`). Novo na app: `@tonejs/midi` 2.0.28. Só no pipeline de conteúdo (fora da app): Python 3.10/3.11 + basic-pitch 0.4.0, yt-dlp 2026.10.26, FFmpeg 9.1. Porquê não Supabase/Stripe: a v1 não tem contas, dados nem pagamentos.
- **Segredos necessários:** nenhum (demo local / pré-visualização).
- **Está feito quando:**
  1. `/lesson` mostra o trecho 3:09–4:32.
  2. As notas caem alinhadas com o que o Jeff toca, com MIDI corrigido à mão no editor e ≥ 2 âncoras.
  3. O loop A–B funciona.
  4. A transcrição automática crua não é a versão publicada (há um teste que o garante).
  5. Opcional: no modo prática, com teclado MIDI, o aluno recebe uma nota.
  6. Corre como demo local (`npm run dev`) ou pré-visualização.
  Não está feito se as notas saltarem do tempo, se o loop falhar, ou se o publicado for o resultado cru da IA.

