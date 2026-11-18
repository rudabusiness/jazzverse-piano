# JazzVerse Piano — SPEC oficial

**Revisão:** 1.0 · **Data:** 18/11/2026 · **Dono editorial:** Product Manager  
**Status:** documento oficial de referência criado a pedido do usuário; escopo transcrito do briefing. Parâmetros novos explicitamente propostos abaixo não têm aprovação individual registrada.  
**Fonte:** `inbox/mausbot/dc8bf96a-8838-481f-b32b-3ad20f6c9e9a/jazzverse-piano-briefing.md`.

## 1. Governança e leitura

Este documento define comportamento, regras de negócio e aceite. Não comprova implementação ou homologação. Todos os requisitos e critérios desta edição pertencem à revisão 1.0. IDs permanecem estáveis em revisões futuras.

- **Confirmado no briefing:** requisito explicitamente descrito na fonte recebida.
- **Proposto:** detalhamento editorial necessário para tornar o comportamento verificável; sujeito à validação do produto antes de virar compromisso de entrega.
- **Aberto:** informação ausente; não equivale a funcionalidade aprovada.

Mudanças de regra de produto passam pelo Product Manager, único editor de SPEC.md. Contribuições técnicas e de UX, Segurança e QA são insumos, não aprovação de escopo. O System Architect valida arquitetura; o Orchestrator autoriza tarefas de implementação.

### Histórico e decisões

| Registro | Revisão | Decisão / origem | Situação |
|---|---|---|---|
| DEC-001 | 1.0 | Criar SPEC.md oficial, pedido do usuário retransmitido por MausBot | Solicitação registrada |
| DEC-002 | 1.0 | Consolidar catálogo, player, MIDI, mentor e vertical slice ii-V-I | Confirmado no briefing |
| DEC-003 | 1.0 | Fixar dados de exercício, fórmula de pontuação e metas numéricas abaixo | Proposto, sem aprovação registrada |
| DEC-004 | 1.0 | Documentar stack do briefing sem selecionar biblioteca de partitura ou fornecedor de IA | Escolhas finais abertas |

## 2. Visão e objetivos estratégicos

JazzVerse Piano reúne prática gamificada de piano, catálogo de cursos com professores reais e mentor conversacional contextual. O foco é Jazz Piano: harmonia, voicings, cadências ii-V-I, improvisação e escuta ativa. Clássico, Blues/Gospel e Pop são extensões de visão, sem entrega comprometida na Fase 1.

| Objetivo | Evidência de sucesso na Fase 1 |
|---|---|
| Unir instrução e prática | Abrir uma lição pelo catálogo, assistir ao vídeo e executar o exercício no mesmo player |
| Conectar leitura e execução | Alternar Falling Notes, partitura e modo híbrido preservando o ponto da lição |
| Dar avaliação musical confiável | Mesma sequência MIDI e configuração produzem o mesmo resultado |
| Ensinar jazz sem punir tensões válidas | Classificar notas conforme a política harmônica explícita da lição |
| Oferecer orientação contextual honesta | Mentor explica o acorde atual e distingue dados medidos de inferências |
| Tornar evolução visível | Resultado concluído e progresso reaparecem após recarregar |

Retenção, conversão, receita e eficácia pedagógica longitudinal não têm metas aprovadas nesta revisão. Pontuação de exercício não prova aprendizagem ou domínio musical.

## 3. Personas e casos de uso

Personas são hipóteses de produto, não resultado de pesquisa com usuários.

| Persona | Necessidade | Caso de uso principal |
|---|---|---|
| Iniciante com teclado MIDI | Praticar sem dominar leitura | Seguir notas caindo em andamento reduzido |
| Pianista que lê partitura | Aprender linguagem jazzística | Ler voicings sincronizados e revisar execução |
| Estudante de jazz | Entender tensões e condução de vozes | Perguntar por que uma nota funciona no acorde atual |
| Aluno de curso gravado | Transformar explicação em prática | Assistir à demonstração e repetir o trecho no player |

Fluxo principal: catálogo → detalhe da lição → vídeo/demonstração → conexão MIDI → prática → resultado → explicação contextual → nova tentativa ou retomada posterior.

## 4. Catálogo e descoberta

### CAT-001 — Catálogo de cursos e trilhas

**Base:** confirmado no briefing. Apresentar cursos, trilhas e lições em coleções visuais inspiradas em serviços de streaming, com título, professor, nível, descrição e estado de progresso. A inspiração é de navegação; não exige copiar marca ou identidade de terceiros.

**Regra:** uma trilha ordena cursos ou lições; um curso contém lições. O aluno identifica o conteúdo disponível antes de abri-lo. Fase 1 precisa de apenas um percurso real e uma lição jogável; cards de demonstração devem indicar indisponibilidade.

**Exceções:** catálogo vazio e falha de carregamento têm mensagem e opção de tentar novamente. Conteúdo sem vídeo ou exercício válido não aparece como jogável.

**Aceite CAT-001-A:** a lição ii-V-I pode ser aberta a partir do catálogo; título, nível e disponibilidade são legíveis e o destino corresponde ao card.

### CAT-002 — Progressão e desbloqueio

**Base:** progressão visual e desbloqueio confirmados; política detalhada proposta.

**Regra proposta:** estados `não iniciada`, `em andamento` e `concluída`. Iniciar prática marca andamento; terminar a sequência válida gera conclusão, independentemente da nota. Pré-requisitos, quando existirem, são explícitos. A lição inicial fica desbloqueada. Uma tentativa interrompida não conclui a lição.

**Exceções:** erro ao salvar mantém o resultado visível e informa que a persistência falhou. Não apresentar confirmação de salvamento antes da confirmação efetiva.

**Aceite CAT-002-A:** após uma tentativa completa, recarregar mantém conclusão, última pontuação e melhor pontuação para a mesma identidade de aluno. A Fase 1 não exige um segundo conteúdo bloqueado.

## 5. Interactive Lesson Player

### PLY-001 — Vídeo e transporte unificados

**Base:** integração de vídeo e timeline interativa confirmada; controles e sincronização detalhados são propostos.

**Comportamento:** vídeo instrutivo do professor no player; reproduzir, pausar, reiniciar, escolher andamento de prática e repetir o exercício. Distinguir segmentos de explicação dos segmentos tocáveis por um mapa temporal da lição.

**Regra:** notas, partitura, acorde atual e julgamento usam a mesma posição musical. Em trechos com demonstração simultânea, o vídeo deve ter mapeamento explícito para essa posição. Explicação sem mapeamento não recebe pontuação. Não presumir que todo segundo do vídeo corresponde a um compasso.

**Exceções:** buffering pausa a prática vinculada, sem gerar erros de execução; seek descarta notas pendentes e reinicia a janela de avaliação. Troca de andamento inicia nova tentativa para não misturar métricas. Esses comportamentos são propostas.

**Aceite PLY-001-A:** pausar congela a posição e a avaliação; reiniciar zera a tentativa; buscar um trecho não gera erros por notas anteriores. Vídeo e prática integrados podem ser percorridos sem sair da lição.

### PLY-002 — Três modos de visualização

**Base:** confirmado no briefing.

| Modo | Comportamento | Aceite |
|---|---|---|
| Falling Notes | Notas descem até a linha de execução e mostram registro/duração | PLY-002-A: notas do exercício alcançam a linha na posição esperada |
| Sheet Music | Partitura proveniente de MusicXML com indicação da posição atual | PLY-002-B: compassos e notas correspondem ao exercício e o indicador acompanha a reprodução |
| Híbrido | Notas caindo e partitura simultâneas | PLY-002-C: as duas representações indicam o mesmo evento musical |

**Regra proposta:** alternar o modo não reinicia posição, andamento nem pontuação. Controles e indicação do acorde permanecem acessíveis em todos os modos.

**Exceções:** MusicXML inválido mostra erro explícito e oferece Falling Notes se os eventos do exercício forem válidos; a lição não é homologada como completa nos três modos nesse estado.

**Aceite PLY-002-D:** alternar os três modos durante uma tentativa preserva posição e métricas; a divergência visual máxima proposta é 50 ms, medida sobre o relógio de referência em ambiente de teste documentado.

## 6. Motor MIDI e avaliação musical

### MID-001 — Conexão e ciclo do dispositivo

**Base:** Web MIDI local, USB/Bluetooth e detecção real confirmados. Disponibilidade depende do navegador, sistema, dispositivo e autorização.

**Comportamento:** solicitar acesso por ação do aluno; listar entradas disponíveis e indicar a selecionada, conexão e atividade de notas. A escolha de uma entrada entre várias é proposta para evitar duplicação de eventos.

**Regra:** julgamento acontece localmente, de forma determinística, sem chamadas ao LLM por nota. Interpretar note-on, note-off e note-on com velocidade zero como soltura. Pedal de sustain não cria novos ataques.

**Exceções:** permissão negada, API ausente, nenhuma entrada e desconexão têm estados distintos. Desconexão pausa a tentativa e evita notas presas; reconexão requer retomada explícita. Sem MIDI é possível consultar vídeo e partitura, mas não obter pontuação de execução real.

**Aceite MID-001-A:** um teclado conectado produz notas identificáveis; soltura limpa o estado; desconectar pausa a tentativa sem penalidade; negar acesso não bloqueia consulta à lição. USB é obrigatório no cenário de homologação; Bluetooth é verificado separadamente quando disponível, sem presumir suporte universal.

### MID-002 — Modelo temporal e classificação

**Base:** avaliação de notas, timing, acurácia e pontuação confirmada. Fórmulas e limites abaixo são propostos.

Cada evento esperado tem ID, posição musical, altura MIDI, duração, mão opcional e grupo de acorde. Cada entrada observada tem timestamp local, altura e velocidade. O relógio musical e os timestamps MIDI são normalizados à mesma base temporal.

**Regras propostas:**

1. Uma entrada pode corresponder a no máximo um evento esperado, e vice-versa.
2. Associar à nota esperada de mesma altura mais próxima dentro de ±150 ms; desempatar pelo evento esperado mais antigo. A janela é fixa em milissegundos nesta revisão.
3. Para execução estrita, a oitava importa. Uma política por classe de altura só vale se declarada na lição.
4. Acordes são avaliados por suas notas; ataques dentro de 80 ms entre si formam um agrupamento para feedback, sem dispensar o timing individual.
5. Notas não tocadas até o fim da janela contam como omissões; entradas sem associação são classificadas pela política harmônica abaixo.
6. A Fase 1 mede ataque e altura. Duração, dinâmica, pedal e qualidade sonora não entram na nota.
7. A tentativa encerra após a última janela; entradas fora da região de prática não contam. Pausa e seek limpam associações pendentes sem gerar penalidades artificiais.

**Aceite MID-002-A:** fixtures em −150, 0 e +150 ms associam; ±151 ms não associam. Entradas duplicadas não geram crédito duplicado; repetição da mesma fixture produz resultado idêntico.

### MID-003 — Tolerância harmônica para jazz

**Base:** distinguir tensões intencionais de erros confirmado; política operacional proposta.

Cada região harmônica informa acorde, notas-alvo, notas adicionais permitidas e política de oitava. A classificação determinística usa essa configuração, nunca um parecer do LLM em tempo real.

| Categoria | Regra | Efeito proposto |
|---|---|---|
| Nota-alvo | Altura esperada no tempo permitido | Crédito de execução |
| Tensão permitida | Nota adicional explicitamente permitida no acorde vigente | Não penaliza; não substitui nota-alvo ausente |
| Nota inesperada | Não é alvo associado nem pertence à lista permitida | Penalidade identificável |
| Nota-alvo atrasada/adiantada | Altura-alvo fora da janela | Sem crédito; feedback de timing, sem crédito harmônico automático |

**Exceções:** sem mapa harmônico válido, utilizar modo estrito anunciado ao aluno. Uma nota fora da lista é “inesperada neste exercício”, não universalmente errada no jazz. A intenção musical não é inferida apenas pelo MIDI. Em fronteiras de acorde, a nota associada a um alvo usa o contexto desse alvo; entradas extras usam o acorde no instante observado.

**Aceite MID-003-A:** no contexto proposto de C7, Eb adicional permitido não gera penalidade, mas também não preenche E ausente; a mesma nota em outra região só é tolerada se autorizada ali. O resultado registra a categoria e sua razão.

### MID-004 — Pontuação e resultado

**Base:** pontuação e histórico confirmados; fórmula proposta.

Sejam N notas-alvo, H alvos associados, E entradas inesperadas, e q de cada acerto igual a `max(0, 1 − |desvio_ms| / 150)`. Precisão de notas = `H / (N + E)`; timing = `soma(q) / N`; pontuação = arredondamento de `100 × (0,7 × precisão + 0,3 × timing)`. Com N=0, não gerar tentativa pontuada. Tensões permitidas não entram em E. Resultado fica entre 0 e 100.

Exibir pontuação, alvos acertados/total, omissões, entradas inesperadas, tensões toleradas e desvio médio absoluto dos acertos (ou “sem dados” se H=0). Identificar andamento e versão do exercício. Melhor resultado compara apenas a mesma versão/configuração; andamento acompanha o resultado e não representa dificuldade equivalente.

**Aceite MID-004-A:** execução perfeita sem extras resulta em 100; silêncio resulta em 0; tensão permitida adicional mantém a nota; omissão reduz a nota; extras inesperados reduzem precisão. Reexecutar não apaga o melhor resultado anterior.

## 7. Mentor AI e mascote azul

### AI-001 — Presença e modos visuais

**Base:** personagem azul no canto inferior, modos olhinhos e corpo inteiro confirmados. “Estilo Bluey” descreve a referência afetiva do briefing; nome comercial e desenho final estão abertos.

**Regra proposta:** controles alternam os modos, minimizam a conversa e permitem reduzir animação. O mascote não cobre teclado, partitura, transporte ou diálogos. Modo visual não altera avaliação.

**Exceções:** falha da IA não impede prática; movimento reduzido do sistema é respeitado.

**Aceite AI-001-A:** ambos os modos funcionam, preservam a tentativa e não obstruem controles na resolução de homologação; a lição continua sem resposta da IA.

### AI-002 — Contexto e explicações

**Base:** explicar conceitos específicos da lição, analisar execução e motivar sem fingir ouvir confirmado.

**Comportamento:** responder usando lição, trecho selecionado ou acorde atual, andamento, política harmônica, conceitos do professor e resumo da tentativa quando disponível. Uma pergunta sobre trecho anterior pode selecionar esse contexto explicitamente.

**Regras:**

- Separar observação (“o MIDI registrou…”) de hipótese pedagógica (“isso pode indicar…”).
- Não afirmar ouvir áudio, avaliar timbre, postura, emoção ou intenção sem medição correspondente.
- Explicar por que uma tensão pode funcionar musicalmente e por que o exercício pode ter uma regra mais restrita.
- Não alterar notas, pontuação, permissões harmônicas ou desbloqueios por conversa.
- Sem execução medida, explicar teoria e declarar ausência de dados de performance.
- Sem contexto suficiente, indicar a lacuna; não inventar o que o professor disse.

**Aceite AI-002-A:** “Por que toquei Eb sobre C7?” recebe explicação contextual sobre a tensão possível, sem alegar intenção comprovada; sem MIDI o mentor não afirma ter observado execução. Perguntar por timbre não gera avaliação sonora fictícia.

### AI-003 — Momento e formato de feedback

**Base:** feedback imediato e motivador confirmado; cadência proposta.

**Regra proposta:** durante a execução, indicadores locais discretos mostram acerto, omissão e timing. Comentário conversacional aparece ao pausar, ao terminar ou por solicitação. O resumo oferece no máximo três observações concretas e uma sugestão praticável. Não interromper o transporte para falar e não usar mensagens humilhantes.

**Exceções:** indisponibilidade, timeout ou resposta inválida da IA mostram mensagem curta e preservam resultado determinístico. Resumo local continua disponível.

**Aceite AI-003-A:** bloquear o serviço de IA não altera pontuação; concluir uma tentativa ainda exibe métricas locais; feedback faz referência a dados existentes e não interrompe a prática.

## 8. Arquitetura de referência e requisitos não funcionais

### ARC-001 — Limites e stack do briefing

**Confirmado:** Next.js, React, TypeScript; Tailwind CSS / Shadcn UI; Web MIDI local; MusicXML com VexFlow ou OpenSheetMusicDisplay; banco relacional para trilhas, lições, perfis e histórico.

Fluxo lógico de referência, sem impor decisões de implementação:

`Catálogo → lição + vídeo + MusicXML + eventos + mapa harmônico → transporte comum → visuais`

`Entrada MIDI → normalização temporal local → avaliador determinístico → feedback e resultado → persistência`

`Contexto pedagógico + resumo medido → mentor conversacional → explicação`

A interface não deve esperar o backend ou a IA para julgar uma nota. MusicXML, eventos-alvo e vídeo devem apontar para a mesma revisão da lição. O mecanismo de sincronização, biblioteca final, hospedagem, fornecedor de IA, banco e autenticação dependem do System Architect e não são decisões tomadas por este SPEC.

**Aceite ARC-001-A:** inspeção e teste com rede interrompida após carregar os recursos demonstram continuidade da avaliação MIDI local; salvamento e IA podem apresentar indisponibilidade explícita.

### NFR-001 — Latência e sincronismo

**Metas propostas, não medições existentes:** callback MIDI até atualização de feedback visual, p95 ≤50 ms; divergência entre visuais sincronizados ≤50 ms; entre vídeo e posição musical em trecho mapeado ≤100 ms após estabilização. Medir em execução de cinco minutos, registrando equipamento, navegador, conexão, andamento e método. A latência física tecla→sistema e a do Bluetooth são reportadas separadamente; não podem ser inferidas do callback.

**Aceite NFR-001-A:** relatório reproduzível atende às metas no ambiente acordado ou registra desvio impeditivo de homologação. Ambiente e matriz final de navegadores permanecem abertos.

### NFR-002 — Privacidade, integridade e persistência

**Detalhamento proposto:** não captar microfone para o fluxo MIDI. Não enviar o fluxo bruto de notas ao LLM por padrão; fornecer contexto e resumo necessários. Histórico MIDI pode ser representado por métricas e eventos relevantes; retenção do fluxo bruto depende de decisão específica. Credenciais de serviço não ficam expostas no cliente.

Persistir identidade do aluno, lição/revisão, tentativa, andamento, configuração de julgamento, métricas, horário e estado de progresso. Não misturar histórico entre alunos. Tentativa salva duas vezes com o mesmo ID não duplica histórico.

**Aceite NFR-002-A:** inspecionar tráfego confirma ausência de áudio e de streaming de notas ao LLM; repetir salvamento mantém um registro; recarregar restaura dados da mesma identidade. Política de retenção, exportação/exclusão e mecanismo de identidade estão abertos e precisam ser resolvidos antes de uso público com dados pessoais.

### NFR-003 — Acesso e resiliência

**Detalhamento proposto:** controles operáveis por teclado, foco visível, nomes acessíveis e estados expressos por texto/ícone além de cor. Redução de movimento não impede ler a posição musical. Catálogo e controles funcionam a 360 px; modo híbrido deve oferecer disposição empilhada se necessário. Layout de prática de referência proposto: 1280×720.

**Aceite NFR-003-A:** percorrer catálogo, abrir lição, alternar modo, conectar MIDI e iniciar/pausar apenas por teclado; nenhum controle essencial fica inacessível nas larguras citadas. Testes documentam limitações do navegador/dispositivo.

## 9. Contrato de conteúdo da lição

### LES-001 — Pacote consistente e versionado

**Detalhamento proposto:** cada lição possui ID, revisão, título, professor, nível, objetivos, vídeo autorizado, segmentos de instrução/prática, duração musical, BPM e compasso, MusicXML, eventos-alvo, mapa harmônico e contexto pedagógico do mentor. Pré-requisitos são opcionais.

**Regra:** alteração em alvos, timing ou tolerância gera nova revisão; resultados anteriores preservam a revisão original. Uma única fonte editorial deve sustentar notas, partitura e avaliação; o formato técnico é decisão arquitetural.

**Exceções:** conteúdo incompleto não pode ser marcado pronto para prática homologada. Ausência de direitos de uso impede publicação do vídeo ou assets.

**Aceite LES-001-A:** validar que MusicXML, lista de alvos e harmonia representam a mesma sequência; editar uma revisão não reinterpreta silenciosamente tentativas antigas.

## 10. Fase 1 — Vertical slice ii-V-I

### Escopo confirmado

- Aplicação base Next.js/TypeScript e catálogo de descoberta.
- Uma lição jogável completa, com vídeo instrutivo integrado.
- Conexão MIDI real e avaliação local de notas e tempo.
- Falling Notes, partitura e modo híbrido sincronizados.
- Mascote com olhinhos/corpo inteiro e mentor contextual.
- Pontuação, resultado e persistência de progresso.

### PH1-001 — Fixture pedagógica proposta

Para viabilizar teste reproduzível, adotar provisoriamente uma cadência em Dó maior: Dm7 → G7 → Cmaj7; compasso 4/4, 60 BPM, um acorde por compasso; voicings MIDI `[50,53,57,60]`, `[43,47,50,53]`, `[48,52,55,59]`, um ataque de cada nota no primeiro tempo, sustentado por quatro tempos na notação. São 12 notas-alvo por ciclo. Contagem preparatória proposta: um compasso, sem pontuação. A duração sustentada não é julgada na Fase 1.

Mapa adicional proposto: Dm7 admite classes E/G/B; G7 admite A/C/E; Cmaj7 admite D/A, em qualquer oitava. Isso é uma política do exercício, não uma regra geral de jazz. O caso C7/Eb de MID-003 é uma fixture unitária separada e não muda a cadência publicada. Revisão pedagógica do professor está pendente.

**Aceite PH1-001-A:** o ciclo apresenta os três acordes nessa ordem e os 12 alvos nas três visualizações; execução perfeita gera 100 e progresso persistido. O vídeo real deve corresponder ao conteúdo homologado.

### Fora da Fase 1

AI Jazz Band com baixo/bateria adaptativos, Improvisation Lab completo, geração livre de exercícios, catálogo multigênero, autoria de cursos, pagamentos, comunidade, captura por microfone e reconhecimento de áudio não integram o vertical slice. São visão futura ou questões de evolução, sem aprovação de entrega. Não há compromisso de aplicativo nativo ou suporte universal a dispositivos.

### Matriz de homologação

| Teste | Cenário verificável | Resultado esperado | Requisitos |
|---|---|---|---|
| AC-01 | Abrir catálogo e lição real | Conteúdo e disponibilidade corretos | CAT-001, LES-001 |
| AC-02 | Assistir, pausar e reiniciar | Vídeo integrado e transporte coerente | PLY-001 |
| AC-03 | Alternar três modos durante prática | Posição e métricas preservadas | PLY-002 |
| AC-04 | Conectar teclado USB e tocar/soltar | Altura detectada, sem nota presa | MID-001 |
| AC-05 | Negar MIDI e desconectar durante prática | Estados claros; sem conclusão/punição indevida | MID-001 |
| AC-06 | Reproduzir fixtures de fronteira e duplicatas | Associação determinística sem crédito duplo | MID-002 |
| AC-07 | Tocar alvos, tensão permitida e nota inesperada | Categorias e efeitos corretos | MID-003, MID-004 |
| AC-08 | Completar cadência e recarregar | Resultado e progresso restaurados | CAT-002, PH1-001, NFR-002 |
| AC-09 | Alternar mascote e pedir explicação | Dois modos; explicação ancorada no contexto | AI-001, AI-002 |
| AC-10 | Interromper IA/rede após carregar recursos | Avaliação local e resumo continuam; falhas declaradas | AI-003, ARC-001 |
| AC-11 | Medir execução no ambiente documentado | Metas de latência/sincronismo verificadas | NFR-001 |
| AC-12 | Navegar por teclado e nas larguras definidas | Controles essenciais acessíveis | NFR-003 |
| AC-13 | Inspecionar tráfego, repetição de save e versões | Privacidade e integridade do histórico preservadas | NFR-002, LES-001 |

Homologação da Fase 1 exige todos os cenários aplicáveis aprovados, conteúdo real autorizado e resolução dos parâmetros propostos que impactam esses testes. Nenhum teste foi executado nesta entrega documental.

## 11. Questões abertas e itens não aprovados

| ID | Questão / proposta ainda não aprovada | Impacto e responsável sugerido |
|---|---|---|
| Q-01 | Voicings, BPM, duração, lista de tensões e vídeo definitivo | Professor / Produto: validar PH1-001 antes da homologação |
| Q-02 | Janela ±150 ms, agrupamento 80 ms, fórmula 70/30 e conclusão sem nota mínima | Produto com QA: validar métricas e regra de progresso |
| Q-03 | Matriz de navegadores/dispositivos e metas de desempenho | Arquiteto / QA: fixar ambiente de homologação |
| Q-04 | Biblioteca MusicXML, relógio/sincronização, banco, IA e autenticação | System Architect: decidir solução técnica |
| Q-05 | Identidade, retenção, exclusão e dados enviados ao mentor | Produto / Segurança: resolver antes de uso público |
| Q-06 | Nome, aparência e direitos do mascote; assets e vídeo | Produto / UX: aprovar identidade original e licenças |
| Q-07 | Busca, recomendações, filtros e política de desbloqueio de múltiplas lições | Produto: fora do compromisso detalhado desta fase |
| Q-08 | Critério de retomada exata do vídeo e tentativa após fechar a página | Produto: nesta revisão só resultado/progresso têm persistência definida |

Não há pareceres recebidos de UX, Segurança, QA ou System Architect nesta entrega. As responsabilidades acima são destinos de revisão, não revisões já realizadas.

## 12. Handoff

**Ao Orchestrator:** SPEC revisão 1.0; requisitos CAT-001 a PH1-001 e matriz AC-01 a AC-13. Escopo funcional originado no briefing; parâmetros propostos e questões Q-01 a Q-08 permanecem sem aprovação registrada. A criação deste documento não autoriza implementação nem resolve arquitetura. Usar os pontos abertos para preparar decisões e tarefas concretas.

**Ao QA:** usar critérios por requisito e matriz de homologação; registrar fixtures MIDI, configuração, versão de conteúdo, ambiente e evidências. Distinguir cenários determinísticos de avaliação qualitativa do mentor. Pontos numéricos propostos precisam de validação antes de se tornarem gates definitivos.
