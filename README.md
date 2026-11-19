# 🎹 JazzVerse Piano

> **AI-Powered Interactive Jazz Piano Academy**  
> *Guitar Hero-style practice, Netflix-style courses & an intelligent Bluey-style jazz mentor.*

---

## 🌟 Visão Geral

O **JazzVerse Piano** une a gamificação em tempo real, o ensino com professores humanos reais e inteligência artificial que realmente entende de harmonia jazzística.

### 🎮 Três Pilares da Experiência
1. **Guitar Hero-Style Practice**: Notas caindo (Falling Notes) sincronizadas, detecção Web MIDI de baixa latência e pontuação em tempo real.
2. **Netflix-Style Learning**: Catálogo imersivo com trilhas e integração direta dos vídeos gravados do professor.
3. **Player Unificado 3-em-1**:
   - **Modo A (Falling Notes)**: Gamificado e visual para iniciantes.
   - **Modo B (Sheet Music)**: Partitura tradicional sincronizada (MusicXML).
   - **Modo C (Híbrido)**: Partitura + notas caindo simultâneas para aprender leitura real enquanto joga.
4. **Mascote / Mentor AI (estilo Bluey)**: No cantinho da tela com dois modos (olhinhos discretos ou mascote completo), explicando acordes e voicings (*ii–V–I*), sem alucinações.

---

## 📂 Documentação Oficial

- [📘 SPEC.md](./SPEC.md) — Especificação oficial completa do produto, regras de negócio e critérios de aceite.
- [📝 BRIEFING.md](./BRIEFING.md) — Briefing original compilado da descoberta e planejamento.

---

## 🚀 Roadmap de Desenvolvimento

- [x] **Fase 0 — Planejamento & Especificação Técnica**: `SPEC.md` oficial homologado.
- [ ] **Fase 1 — Vertical Slice (Próximo Passo)**:
  - Base Next.js 14 + React + TypeScript + Tailwind CSS.
  - Tela de Descoberta estilo Netflix com lições.
  - Player Interativo com Web MIDI funcional e 1 lição jogável (*ii–V–I* em Jazz).
  - Mascote flutuante com alternância de visualização.
- [ ] **Fase 2 — Plataforma & Ingestão de Aulas**: Ingestão de vídeos, mapeamento de áudio/MIDI e biblioteca de cursos.
- [ ] **Fase 3 — Jazz Intelligence**: IA de harmonia avançada, improvisação guiada e avaliação de voicings.
- [ ] **Fase 4 — Living Jazz World**: Banda virtual interativa (baixo e bateria adaptativos) e desafios.

---

## Prática ii–V–I

Em `/lesson`, a cadência original de demonstração tem três compassos a 60 BPM. Notas descendentes, partitura e avaliação local usam os mesmos 12 eventos de `lib/lesson-timeline.ts`. O transporte tem um compasso de preparação visual, pausa e reinício. O botão Metrónomo ativa os cliques na preparação e durante a prática, com o primeiro tempo de cada compasso acentuado. A troca de vista preserva a tentativa. Podes praticar a 30, 45, 60 ou 72 BPM. Mudar o andamento reinicia a tentativa e mantém a tolerância MIDI de ±150 ms. Em Repetição, escolhe um compasso ou um trecho contínuo. O trecho volta ao início automaticamente após a primeira contagem preparatória. A repetição é prática livre, sem pontuação. Liga um teclado Web MIDI antes de começar uma tentativa completa para obter pontuação.

**Piano acústico.** Em `/lesson`, escolhe **Tocar com microfone** e concede permissão no navegador. O reconhecimento é experimental e corre localmente com [PitchPlease 3.1.0 (MIT)](https://github.com/markusstrasser/pitchplease). O áudio do microfone não é guardado nem enviado a um servidor. No fim, vês a melhor deteção simultânea por acorde e as notas por confirmar. A pontuação de ritmo continua disponível com MIDI. Se usares o metrónomo com o microfone, usa auscultadores para evitar que os cliques entrem na captação.

A partitura incorporada desenha a cadência fixa diretamente desses eventos. O ficheiro MusicXML, disponível na vista Partitura e Híbrido, é gerado dos mesmos eventos e conserva os seus IDs. A importação de MusicXML externo e a sincronização com o vídeo do professor ficam para uma etapa posterior.

Para verificar esta etapa, executa `npm install`, `npm run typecheck`, `npm test` e `npm run build`.

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Música & Áudio:** Web MIDI API determinística (local, sem latência de rede), MusicXML / VexFlow.
- **Orquestração de Agentes:** OpenMausBot (Agent Architect team) + OpenAI Codex / Antigravity.

---

*Repositório gerenciado pelo time de desenvolvimento OpenMausBot & Codex.*
