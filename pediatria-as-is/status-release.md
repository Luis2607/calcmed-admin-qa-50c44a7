# Status da Release 2.0: onde estamos

> Foto honesta do que já está de pé e do que ainda falta. Atualizado em 22/06/2026. Vale pro time todo.

A ideia aqui é dar uma leitura rápida do estado real, sem inflar. Cada bloco diz o que está pronto, o que está em andamento e o que ainda depende de decisão. Quando um número ajuda a entender, ele está aqui; quando não ajuda, ficou de fora.

A regra que rege tudo: o escopo da Release 2.0 está congelado. O documento de escopo é também o checklist de aceite. Um item só conta como entregue quando está 100%.

---

## O que já está no ar

Coisas que existem, funcionam e dá pra mexer hoje.

- **Login e cargos no admin.** Tela de login construída, com cargos e permissões separando quem cadastra de quem publica. O fluxo já existe ponta a ponta; falta só ligar a versão de produção no deploy (criar a conta do admin e fechar o acesso anônimo).
- **Backend na nuvem das ferramentas do admin.** Antibióticos, condutas, checklists, banners e o resto gravam no Supabase, não mais só no navegador. Cada item é uma linha com o conteúdo inteiro num campo JSON, e o servidor guarda o histórico de quem mexeu.
- **Gate de revisão médica no servidor.** Conteúdo clínico não vai pro app por cadastro direto. Pra publicar, o item precisa estar aprovado na revisão. Isso é barrado no servidor, não só na tela, então não tem como furar pelo cliente.
- **Busca por palavra relacionada.** Já funciona. Buscar "hipernatremia" leva a "distúrbio do sódio". É a busca que o app já tinha; o objetivo é manter, não refazer.
- **Antibióticos (o módulo mais complexo) montado.** Formulário visual completo: vias múltiplas por checkbox, peso opcional por droga, observações com título, nomes comerciais no topo, preview ao vivo em claro e escuro, multi-seleção, ações em massa, exportar CSV e importar JSON. 104 itens já carregados como rascunho (todos aguardando a revisão do Gustavo antes de ir ao ar).
- **Referências e ferramentas similares editáveis.** Saíram do hardcode. O Gustavo controla, por calculadora, quais referências e quais ferramentas similares aparecem, cadastrando por relação (select linkado), não por texto solto.
- **Banners nos dois formatos.** Texto e imagem, com período, ativação e duplicar. Público (Gratuito, Premium Mensal, Premium Anual) e superfície (Home Adulto, Home Pediatria, Todos, Menu) viraram seleção múltipla.
- **Visão geral do admin.** Lista o que está pendente e o que falta revisar, por módulo.
- **Este portal (Centro de Comando).** As-is do app, escopo, handoff e specs num lugar só, com busca e o checklist ao vivo.

---

## Em andamento

Decidido e sendo executado, mas ainda não fechado.

- **Central de Urgência.** As 5 ferramentas saem juntas (um dev por ferramenta). O PCR já tem a lógica pronta; as outras dependem de paralelizar mais gente. Antes de fechar, a Central vai ser testada por outros médicos.
- **Pediatria como rota própria.** Deixa de ser só um filtro da Home e ganha link próprio, pra dar pra mandar notificação e campanha. Reestruturação de roteamento dentro da release. Nesta versão, a edição via admin cobre só antibióticos e sintomáticos; o resto da pediatria fica pra depois.
- **A ponte do admin pro app.** Hoje o app ainda não lê o conteúdo do admin em tempo real (a dose vive fixa no app). Construir essa leitura é a peça central do backend. Enquanto não existe, o conteúdo roda a partir do que está embarcado.
- **Calculadoras, scores e conversores reformulados.** Muita coisa já desenvolvida, falta testar. CID, código de internação e referências entram nas calculadoras agora (é upgrade das calculadoras, não ferramenta nova).
- **Responsivo de verdade.** Web, mobile e iPad, incluindo o caso do zoom ligado (hoje tem botão que não dá pra clicar com zoom). Tratado como trabalho de QA.
- **Dark e light, offline e publicação sem subir versão na loja (OTA).** No radar, em andamento.
- **Métricas e feedback (joinha).** No app, joinha pra cima/baixo com comentário; no admin, listagem com calculadora, comentário e data, mais exportação. Ficou na release.
- **Passômetro e Escala de plantões.** Escala quase pronta, passômetro perto de concluir. Inclui a lixeira de itens excluídos (recuperar em 24h), que existia no app mas não no Figma.
- **Login único e deep link.** Auth unificado e deep link pras calculadoras entram na release. O SDK está ok; o deep link ainda precisa ser validado pro caso de onboarding.

---

## Ainda falta decidir

Itens parados esperando alguém bater o martelo, não esperando código.

**Com o Gustavo:**

- OK formal no escopo (vai por e-mail).
- Planos novos e preços, pra montar os cards do paywall.
- Liberar o JSON da pediatria pra desbloquear os pediatras.
- Mandar a Central pra teste com outros médicos e reunir o parecer.
- Testar o admin (Equipe, Banners) pelo link e dar feedback.
- Revisar e assinar as doses droga a droga (é o que destrava a publicação do conteúdo clínico).

**Com o Luis e o time:**

- Estimativa honesta por tarefa (escopo ~90% batido, faltam uns 10%).
- Como paralelizar a Central de Urgência (briefing pra gente nova).
- Gerenciador de categorias por módulo (decidir se vale pra todo o admin e qual o limite). É o maior buraco funcional ainda aberto.
- CID nas calculadoras: sair do discovery e implementar.
- Dimensão recomendada da imagem dos banners (falta o valor em px do design).
- Definir o loading padrão do app (skeleton ou bolinha).
- Quais templates de antibiótico fazem sentido, e quais cálculos vão pra hardcode.

---

## Fora da Release 2.0

Confirmado pra depois (3.0 em diante), pra ninguém contar com isso agora: onboarding via Google, teste A/B, IA multimodal de ponta, motion no app, receita com paciente e assinatura, calculadoras 100% personalizáveis ponta a ponta, admin de suporte interno (os tickets vão por ferramenta externa), tradução, e os próximos lançamentos de pediatria.

---

## Como ler o progresso no dia a dia

O checklist ao vivo (em **Acompanhar → Escopo & progresso**) é a fonte de verdade do estado de cada bloco. O Overview mostra o número-mestre de % da release. Os dois leem o mesmo estado, então não divergem. Se um item está marcado "feito" lá, é porque bateu 100% no critério de aceite.
