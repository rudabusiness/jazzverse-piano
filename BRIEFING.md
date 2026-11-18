# JazzVerse Piano — Briefing Completo e Requisitos (Baseado no Planejamento Oficial)

## 1. Visão do Produto
- **Nome:** JazzVerse Piano
- **Proposta Central:** Unir a gamificação de prática no estilo Guitar Hero, a estrutura de catálogo de cursos estilo Netflix e um professor/mentor particular com IA conversacional em uma plataforma unificada de aprendizado de piano.
- **DNA Musical:** Foco principal em Jazz Piano (harmonia, voicings, ii-V-I, improvisação, escuta ativa), mas com suporte expansível para Clássico, Blues/Gospel e Pop.
- **Diferenciação Crítica:** Uma IA que realmente compreende jazz (distingue notas intencionais de tensão harmônica de erros reais) e conecta vídeos gravados de aulas a uma timeline interativa de execução com MIDI.

## 2. Pilares de Experiência
1. **Guitar Hero-Style Practice:**
   - Notas caindo (Falling Notes) sincronizadas com a música.
   - Reconhecimento real via Web MIDI (teclado USB ou Bluetooth MIDI).
   - Avaliação de timing, acurácia e pontuação com feedback imediato.
2. **Netflix-Style Learning:**
   - Catálogo estruturado de trilhas e cursos com professores reais.
   - Integração direta dos vídeos gravados do professor.
   - Progressão visual e desbloqueio de lições.
3. **Player Unificado (3 Modos):**
   - **Modo A (Falling Notes):** Visual gamificado para iniciantes.
   - **Modo B (Sheet Music):** Partitura tradicional sincronizada (MusicXML renderer).
   - **Modo C (Híbrido):** Notas caindo + partitura tradicional simultaneamente (ensina a ler partitura enquanto joga).
4. **Mascote / AI Mentor (estilo "Bluey"):**
   - Personagem azul no canto inferior da tela.
   - Dois modos visuais: apenas os olhinhos observando ou personagem completo.
   - Explica conceitos específicos da lição (ex: "Por que toquei Eb sobre C7?"), analisa execução e dá feedback motivador sem fingir ouvir o que não mediu.
5. **AI Jazz Band & Improvisation Lab:**
   - Prática com baixo e bateria virtuais que acompanham o andamento.
   - Exercícios de improvisação guiada sobre ii-V-I e outros ciclos harmônicos.

## 3. Arquitetura e Stack Técnica
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS / Shadcn UI.
- **Áudio / Entrada:** Web MIDI API local determinística (baixa latência). Nunca usar LLM para julgamento de nota em tempo real.
- **Renderização de Partituras:** MusicXML / VexFlow / OpenSheetMusicDisplay.
- **Backend / Dados:** Banco relacional para trilhas, lições, perfis e histórico de performance MIDI do aluno.

## 4. Escopo da Fase 1 (Vertical Slice)
- Estrutura base da aplicação com Next.js e TypeScript.
- Tela de catálogo e descoberta de cursos estilo Netflix.
- Player de lição interativo completo:
  - Vídeo instrutivo do professor.
  - Conexão e detecção Web MIDI funcional.
  - Renderização sincronizada (Falling notes + Partitura).
  - Mascote flutuante no canto com alternância (olhinhos / corpo inteiro).
- 1 Lição jogável completa: Exercício de cadência jazzística ii-V-I com avaliação de notas e tempo, pontuação e persistência de progresso.
