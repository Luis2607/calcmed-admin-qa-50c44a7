# Decisões das últimas calls — Release 2.0

**Período coberto:** calls de 19/06 (review/retro da Sprint 9, daily do passômetro, escopo + admin) e a call de alinhamento da Release 2.0 com o Gustavo em 20/06.
**Última atualização:** 22/06/2026.
**Para quem:** time todo (portal do Gui).

Este documento reúne as decisões que ficaram fechadas nas últimas reuniões e o que ainda depende de alguém decidir. A ideia é ser a referência rápida: cada decisão tem o que foi resolvido, o porquê em uma linha e o status. No fim tem a lista do que ainda está em aberto.

Legenda de status: **Feito** (resolvido/entregue) · **Em andamento** (acordado e sendo executado) · **Pendente** (aguarda decisão de alguém, em geral Luis ou Gustavo).

---

## A regra que rege tudo: escopo congelado

**O escopo da Release 2.0 está congelado.** O que está no documento de escopo é o compromisso da entrega; ideia ou demanda nova vira upgrade pós-release (3.0/4.0).
Por quê: previsibilidade de prazo. Sem congelar, "fica uma esteira que nunca acaba" e o cliente nunca sabe quando o produto chega.
Status: **Feito** — aprovado pelo Gustavo na call de 20/06. Pendência ligada: OK formal por e-mail (ver lista de pendentes).

**O documento de escopo é também o checklist de aceite.** Na entrega, bate-se item a item; só conta como entregue quando estiver 100%.
Por quê: dar um critério objetivo de "pronto".
Status: **Em andamento** — vira o release tracker (com o Mateus) a partir da planning de 22/06.

---

## Central de Urgência

**As 5 ferramentas saem juntas, não só o PCR.** A estratégia é um dev por ferramenta; se alguma der intercorrência grave, avalia-se deixá-la de fora, mas o plano é entregar todas.
Por quê: é o maior diferencial da versão; o Gustavo quer lançar o pacote completo.
Status: **Em andamento** — martelo batido pelo Gustavo. PCR já tem a lógica pronta; as outras dependem de paralelizar devs.

**Pediatria vira rota/arquivo próprio, deixa de ser só um filtro da Home.**
Por quê: hoje não dá para mandar notificação ou campanha para a pediatria porque ela não tem link próprio; o mesmo vale para tabs de calculadora (ex.: distúrbio do cálcio).
Status: **Em andamento** — reestruturação de roteamento dentro da release; Gui já ciente.

**A Central precisa ser testada por outros médicos antes de fechar.**
Por quê: achar problema clínico agora, enquanto dá para corrigir.
Status: **Pendente** — Gustavo envia para testadores externos e reúne o parecer; depois marca call de revisão.

---

## Admin — acesso, cargos e publicação após revisão

> Esta é a camada transversal do admin. Vale para todos os módulos (antibióticos, condutas, checklists, escores, banners), não para um só.

**Todo conteúdo cadastrado no admin tem um ciclo de status:** rascunho → revisão → publicado. Nada vai para o app por cadastro direto.
Por quê: segurança clínica — conteúdo errado não pode ir direto ao ar.
Status: **Feito (decisão)** / **Em andamento (build)** — front já mapeado por Luis; back é dev.

**Cargos e permissões separam quem cadastra de quem publica.** Uma pessoa pode criar/editar um item sem ter permissão de publicá-lo; a publicação exige revisão de alguém autorizado (hoje, o Gustavo).
Por quê: escalar o cadastro para mais gente (ex.: liberar para pediatra) sem perder controle de qualidade e mantendo trilha de auditoria.
Status: **Em andamento** — RBAC pode entrar enxuto na release; o fluxo de status entra de qualquer forma.

**Publicar = passar pelo gate de revisão médica.** Só depois de revisado o item ganha status "publicado" e aparece no app.
Por quê: tira o Gustavo de ser o único testador/cadastrador e garante revisão clínica.
Status: **Feito (decisão)** — Gustavo aprovou enfaticamente ("Faz, faz muito").

**Padrão único para o admin inteiro:** mesmas listagens com filtros + status + "números relevantes" no topo, espelhando a coesão visual do app.
Por quê: consistência; a ideia já tinha aparecido no admin de escores e virou regra geral.
Status: **Em andamento.**

**Handoff do admin é code-first:** o front já foi construído por Luis; o dev revisa o código e faz o back-end (banco, conexão, persistência, segurança), não reescreve do zero.
Por quê: aproveitar o que já está pronto e acelerar.
Status: **Em andamento** — admin hoje é "só visual", sem banco conectado; novo dev dedicado entrou.

**Operações de conteúdo:** múltipla seleção + ações em massa (publicar/excluir vários), com confirmação para ações destrutivas; Export CSV + Import JSON.
Por quê: gerir volume de conteúdo sem fricção, com proteção contra erro irreversível.
Status: **Em andamento** — já funcionais no front.

**Categorias por módulo no padrão de duas abas** (listagem + configurar categorias), que viram filtros no app.
Por quê: poder classificar cada item (ex.: um checklist específico), não só ter uma categoria geral.
Status: **Em andamento** — doc refinada, falta aplicar.

---

## Admin — Antibióticos (módulo mais complexo)

> Os números de dose/faixa que apareceram na call são exemplos de UI / casos de teste, não doses validadas. Toda dose real entra sob revisão médica.

**Fórmulas fixas vão em hardcode** (ex.: clearance / Cockcroft-Gault). No admin só se liga/desliga ("este antibiótico TEM o cálculo"), sem reconfigurar a fórmula.
Por quê: personalizar todos os cálculos viraria "um sistema à parte"; reduz a carga sobre o dev (Gui).
Status: **Feito (decisão).**

**O admin guarda o TIPO de cálculo, nunca o resultado** — o resultado é calculado em runtime.
Por quê: salvar resultado por faixa seria muito mais complexo.
Status: **Feito (decisão).**

**Cada antibiótico é adulto OU pediátrico, nunca ambos.**
Por quê: a lógica e até as telas mudam (pediatria não usa clearance).
Status: **Feito (decisão).**

**Faixas de idade abertas/personalizáveis por medicação** — cada droga tem o próprio corte; o admin cadastra quantas faixas precisar.
Por quê: não há um padrão único de faixa; precisa checar droga por droga.
Status: **Feito (decisão).**

**Peso como variável multiplicadora opcional** (box sim/não na UI de dose). É o componente central de dose e vira molde para as demais ferramentas.
Por quê: a maioria das doses depende do peso, mas não todas — daí o toggle.
Status: **Feito (decisão).**

**Dose como intervalo (Dose A / Dose B)** via dois campos + toggle "é intervalo? sim/não", gerando preview de faixa.
Por quê: representar faixas reais de dose (ex.: 200 a 400 para um paciente de 100 kg).
Status: **Feito (decisão).**

**Faseamento:** formulário visual primeiro (mais rápido); a lógica/JSON é incrementada dias depois e fica com o Gui.
Por quê: entregar a parte visual logo e separar o que é fixo (JSON) do que o não-dev edita.
Status: **Em andamento.**

**Pediatria via admin, nesta release, cobre só antibióticos e sintomáticos** (mesma lógica). As demais ferramentas pediátricas ficam para depois.
Por quê: sintomático é praticamente igual a antibiótico; o resto explode a complexidade.
Status: **Feito (decisão).**

---

## Admin — Condutas, Referências e Banners

**Condutas:** CRUDs/modelos com campos que puxam textos; inclui receitas (a versão robusta com paciente/assinatura fica para o futuro) e encaminhamentos.
Por quê: é majoritariamente cadastro de conteúdo, baixa complexidade.
Status: **Em andamento** — Luis finalizando no fim de semana de 20–21/06.

**Referências e ferramentas similares saem do hardcode e viram editáveis no admin.** O Gustavo controla, por calculadora, as referências e quais ferramentas similares aparecem; cadastro via busca/select linkado (relação real, não texto solto).
Por quê: tirar a carga clínica do dev e dar o controle a quem tem conhecimento médico.
Status: **Feito (decisão)** — Gustavo aprovou ("melhor ainda do que ficar no hard code").

**Banners — público como seleção múltipla** (Gratuito / Premium Mensal / Premium Anual).
Por quê: campanha de conversão mirando só um plano (ex.: o mensal).
Status: **Em andamento.**

**Banners — filtro de superfície como seleção múltipla** (Home Adulto / Home Pediatria / Todos / Menu).
Por quê: lançar em Home Adulto e Pediatria ao mesmo tempo.
Status: **Em andamento.**

**Banners — dimensão/resolução recomendada da imagem exibida nos dois cards** (mobile e web).
Por quê: orientar quem sobe a arte sobre a proporção certa. (A dimensão final ainda será confirmada pelo Luis.)
Status: **Em andamento.**

---

## Métricas, feedback e tags de marketing

**A feature de métricas/feedback (joinha) fica na release** — no app, joinha cima/baixo + comentário; no admin, listagem (calculadora, comentário, data) + exportação.
Por quê: o Gustavo entende que o esforço vale a pena; reverteu o corte que o Luis queria fazer.
Status: **Feito (decisão)** — decidido pelo Gustavo.

**Tags de marketing / log de eventos no Firebase em todas as telas:** registrar acesso, jornada e erros; servir de base para construir públicos e disparar campanhas automáticas por comportamento.
Por quê: entender a jornada e habilitar campanhas segmentadas.
Status: **Em andamento** — instrumentação pendente; o modelo atual precisa ser "bem definido" para escalar. Públicos no Firebase provavelmente com o Kilder.

---

## Home única (Home V2) e Busca

**Home V2:** hub personalizável para o plantonista (estilo iFood) com cards/widgets, busca unificada ("busque ou pergunte à IA"), categorias colapsadas no topo e a Central de Urgência dentro da própria Home.
Por quê: uma home única que concentra a experiência do plantonista.
Status: **Em andamento** — apresentada ao Gustavo na call; vai para Figma/documentação nesta sprint.

**Busca por palavras relacionadas:** já existe; o objetivo é manter (ex.: "hipernatremia" leva a "distúrbio do sódio"). É distinta da busca com IA.
Por quê: comportamento que já funciona, não precisa rework.
Status: **Feito** — só manter.

---

## Calculadoras, Pediatria, Passômetro e Escala

**Todas as calculadoras, scores e conversores do app atual, reformulados.**
Status: **Em andamento** — muita coisa já desenvolvida, falta testar.

**CID / código de internação + referências médicas nas calculadoras são para AGORA**, não futuro. Não é "ferramenta" nova, é upgrade das calculadoras.
Por quê: reclassificação corrigida na call — é conteúdo clínico que já cabe nesta release.
Status: **Em andamento** — Luis fazendo o upgrade no fim de semana de 20–21/06.

**Manter todas as telas de pediatria existentes;** os devs reaproveitam componentes a partir do código atual, sem recriar do zero.
Por quê: zero perda; partir do que já existe.
Status: **Em andamento** — telas-template já feitas; o restante passa aos devs quando esvaziarem a fila (a partir de 22/06).

**Calculadoras (responsivo web/mobile do protótipo) não consomem capacidade de dev — Luis executa.**
Status: **Pendente/Em andamento** — responsivo web ainda não feito; Luis faz nos próximos dias.

**Passômetro — telas de lixeira/excluídas (recuperar em 24h).** O app já tem o comportamento de deletar → aviso de 24h + aba de "deletadas", mas isso não existia no Figma.
Por quê: descoberto no handoff; nem Luis nem Gustavo lembravam. Vira task nova pequena.
Status: **Em andamento** — Luis cria a task; ajustar também a copy de confirmação do delete.

**Passômetro — "Gerenciar" é um modo, não uma aba** (ao entrar, o botão vira "Salvar lista"); **componente "análise com IA" removido**; **criar paciente vai direto ao formulário** (IPS vs normal fica no nome do paciente); **renomear pasta mantém** no menu de 3 pontos.
Por quê: dúvidas de layout do handoff resolvidas na hora.
Status: **Feito (decisões).**

**Passômetro — readback/compartilhamento/envio da passagem fica no escopo por enquanto.**
Por quê: ninguém lembrou com certeza se já foi validado; o Gustavo prefere não remover antes de checar.
Status: **Pendente** — Gustavo vai abrir o FigJam do workshop para revisar.

**Escala de plantões** (quase 100%) e **Passômetro** (perto de concluir) entram na release.
Status: **Em andamento.**

---

## Monetização, Assinaturas e Auth

**ALF / deep link (AppsFlyer) + login único / auth unificado entram na release.**
Por quê: item que tinha escapado; os devs lembraram. Habilita deep links para calculadoras.
Status: **Em andamento** — SDK ok; o ALF ainda não foi validado para o caso de onboarding (com o Peres).

**Planos novos e paywall:** dependem da definição do Gustavo (planos e preços); o paywall foi puxado para a próxima sprint.
Status: **Pendente** — aguarda o Gustavo enviar os planos/preços ("Black" e o outro).

**Onboarding novo entra na release**, mesmo com a task ainda em refino (call na semana de 22/06).
Status: **Em andamento / Pendente** (pontos a refinar em call).

---

## Suporte — fora do MVP (ferramenta externa)

**O admin de suporte interno não será construído.** Os tickets entram via ferramenta externa pronta (provável Microsoft, a confirmar; Trello como provisório).
Por quê: construir suporte interno seria "um sistema dentro do sistema"; a filosofia do Gustavo é não recriar o que já existe. Objetivo prático: tirar o Gustavo de responder todo mundo no WhatsApp.
Status: **Em andamento (decisão fechada)** — falta identificar a ferramenta exata. Na prática R1, o botão "preciso de ajuda → WhatsApp" vira link de formulário → e-mail + Microsoft To Do (Teams) com rastreio.

---

## Requisitos técnicos transversais (viram checklist de aceite)

Todos estes viram itens do documento-guia e tasks no board; só contam como entregues quando estiverem 100%.

- **Responsividade web / mobile / iPad, incluindo o zoom do dispositivo** (hoje, com zoom ligado, há botões que o usuário não consegue clicar). Status: **Em andamento** — Gustavo passa os detalhes por WhatsApp; tratado como trabalho de QA.
- **Detecção da navbar inferior do Android** (safe area). Status: **Em andamento** (devs FT).
- **Modo dark / light.** Status: **Em andamento.**
- **Modo offline** (já falhou antes; manter no radar, mobile-first). Status: **Em andamento.**
- **Shortbuild / OTA (CodePush):** publicar atualizações sem subir versão na loja. Status: **Em andamento** — resolve um incômodo crônico do Gustavo; existe parcialmente.

---

## Time, processo e cronograma

**Modelo de devs: não fixar 24h; escalar até ~10 devs conforme a necessidade.** (Esta é a versão final; substitui a ideia anterior de jornada fixa.)
Por quê: resolver a concentração de trabalho no Guilherme sem estender o prazo — paraleliza-se com mais gente em vez de esperar.
Status: **Em andamento (decisão)** — Luis reforça com a FT/Peres.

**Sprint semanal com ritos ágeis:** planning na segunda, daily às 14h, review + retro na sexta.
Por quê: cadência semanal de entrega; primeira execução validada na retro.
Status: **Feito** — já em prática.

**Os cálculos vão escritos na documentação/descrição das tasks** (não só no Figma).
Por quê: o dev travou em calculadoras sem o cálculo esperado e teve que perguntar ao Luis; tira o gargalo.
Status: **Feito (decisão)** — aplicar ao escrever as próximas tasks.

**Mateus faz o QA a fundo do trabalho dos devs;** decidido também contratar um QA dedicado (pedir à FT/Peres).
Por quê: o risco central é regressão (uma funcionalidade quebrar outra); Mateus está sobrecarregado e Luis foca no design.
Status: **Em andamento** — Luis passa a demanda do QA dedicado na segunda 22/06.

**Release tracker fica com o Mateus,** atualizado em tempo real, entregue na planning de 22/06.
Por quê: o Gustavo acompanha o estado real sem ver o board cheio.
Status: **Em andamento.**

**Templates dos alinhamentos migram para o FigJam** (arquivo duplicável por semana, com post-its do time).
Por quê: ninguém esquecer de preencher; melhorar o meta-processo.
Status: **Em andamento** — Luis conduz a montagem na semana de 22/06.

**Handover das telas com o Luis durante a planning,** com critérios de "pronto para dev".
Por quê: pegar problemas de layout/comportamento no começo, não no meio do desenvolvimento (proposta do Sergio).
Status: **Em andamento** — entra a partir da próxima planning.

**Adicionar Gui e Souza aos próximos workshops** (sem tirar ninguém; Kilder permanece).
Por quê: time mais alinhado ao domínio de urgência/emergência.
Status: **Feito (decisão).**

**Atrito de processo em aberto: fluxo de branches/merge.** Não-mergear demandas dependentes causou perda de trabalho.
Status: **Pendente** — Sergio + devs definem a estratégia de integração.

---

## Roadmap futuro (3.0+) — o que NÃO entra agora

Confirmado fora da Release 2.0:

- Onboarding / login rápido instantâneo via Google (depende do ALF, ainda não validado).
- Teste A/B (Guilherme não domina; faz mais sentido depois).
- IA multimodal nível top (áudio / imagem / arquivo) + quiz.
- Motion / microinterações no app B2C ("firula": depois do app funcionar).
- Prescrição de receitas com paciente + assinatura digital + salvar dados.
- Notificação via WhatsApp por comportamento (vira marketing / configuração externa).
- Calculadoras 100% personalizáveis ponta a ponta + update inteligente (uma das maiores prioridades pós-release).
- Admin de suporte construído internamente.
- Tradução / i18n.
- Animais peçonhentos (ofídicos / escorpiônicos / araquinídeos), queimadura, transfusão / HD, hemorragia digestiva alta, intoxicação, mordeduras.
- Novos lançamentos de pediatria em geral (dengue, asma, zinco / potássio e similares).
- Escala de plantões conectada ao Google Agenda.
- Área do estudante (ranking, trilhas, flash cards, quiz).

---

## Pendentes que dependem de decisão (Luis / Gustavo)

**Aguardando o Gustavo:**

1. **OK formal no escopo** — aprovar o documento de escopo (vai por e-mail).
2. **Planos novos + preços** — enviar a definição ("Black", o outro plano, valores) para o Luis montar os cards; depois marca-se call.
3. **JSON da pediatria** — liberar para desbloquear os pediatras (tratado com o Gui). Bloqueador de produto, ainda não de cronograma.
4. **Central de Urgência para teste externo** — enviar a outros médicos, reunir o parecer; depois marca-se call de revisão.
5. **Requisitos técnicos por WhatsApp** — passar os requisitos que tem em mente (responsividade etc.) para entrarem no documento-guia.
6. **Testar o admin** (Equipe, Banners) pelo link e dar feedback.
7. **Passômetro readback** — confirmar, abrindo o FigJam do workshop, se já foi validado.

**Aguardando o Luis / time:**

8. **Estimativa honesta por tarefa** (escopo ~90% batido, faltam 10%) — Mateus + devs na planning de 22/06.
9. **Como paralelizar a Central de Urgência** (briefing de gente nova, framework) — refino na semana de 22/06.
10. **Ferramenta de suporte da Microsoft** — identificar qual é (Souza sugeriu Trello como provisório).
11. **Publicação de dose pediátrica** — hoje o app só publica conteúdo adulto; decidir se a dose pediátrica é publicável nesta release (decisão de Luis + Gustavo + Gui).
12. **Loading state do app** — definir o padrão: shimmer/skeleton ou bolinha (circular progress, ~90% do app hoje).
13. **Templates de antibiótico** — validar quais fazem sentido (call de antibióticos com o Gui).
14. **Mapeamento das variáveis de antibiótico adulto vs. pediátrico** e quais cálculos podem ir para hardcode (call de antibióticos).
15. **Bugs clínicos do conteúdo de origem** — revisar antes de migrar qualquer dose ao admin; nada é copiado verbatim sem revisão/assinatura clínica do Gustavo.

---

*Fontes: atas de 19/06 (review/retro Sprint 9, daily passômetro, escopo+admin/antibióticos), ata-omega da call Gustavo de 20/06 (Release 2.0), documento de escopo congelado da Release 2.0 e decisão wiki do admin (status/cargos/publicação após revisão).*
