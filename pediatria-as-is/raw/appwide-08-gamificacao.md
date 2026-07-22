# App de Produção (as-is) — Veias NÃO-clínicas · Domínio 08: Gamificação & Engajamento

> **Fonte:** `_source/main.decoded.js` (Flutter Web compilado p/ JS, 11 MB). Copy extraída do mapa i18n `B.chD` (locale pt-BR, 1076 chaves alinhadas 1:1 ao array `new A.ar(B.chD,[...])` em char-offset ~10.012M) + literais inline nos widgets. **Toda copy abaixo é VERBATIM.** Incertezas estão marcadas com ⚠️.
> **Método:** chave i18n → índice → string; refs `u.XX` resolvidos contra a tabela de constantes. Rotas extraídas dos `d5("/...")` (push de navegação). Eventos de analytics do enum em offset ~280k.

Este domínio cobre o **Quiz** (núcleo de gamificação), **Ranking**, **Conquistas/Selos (achievements)**, **Níveis (Bronze/Prata/Ouro)**, **Minhas Vantagens/Benefícios** (resgate de moedas CalcMed Eletro), **Compromisso/Escala** (tracker de plantões — engajamento recorrente), **Color-selection** (seletor de cor do local de trabalho, subparte do Compromisso), **Indique um Amigo** (referral) e **Onboarding** (pós-cadastro + onboarding do Modo PCR).

---

## 1. QUIZ — núcleo de gamificação

### 1.1 Rotas
| Rota | Propósito |
|---|---|
| `/quiz` | Home do Quiz (hub: nível atual, cards de Ranking/Conquistas/Teste) |
| `/quiz/` | Fluxo de jogo (pergunta atual) ⚠️ rota com barra final distinta de `/quiz` |
| `/quiz/question/` | Tela da pergunta (responder) |
| `/quiz/question/history/{id}` | Histórico de respostas por categoria |
| `/quiz/ranking` | Ranking (3 abas) |
| `/quiz/ranking/share` | Tela de compartilhar ranking |
| `/quiz/achievements` | Grade de conquistas/selos |
| `/quiz-management`, `/quiz-management/question/new`, `/quiz-management/question/{id}` | Admin de perguntas (CRUD) — não é tela de usuário final |

### 1.2 Propósito
Engajamento por conhecimento médico: o usuário responde perguntas por categoria (especialidade), ganha pontos, sobe de nível (Bronze→Prata→Ouro) e coleciona selos por especialidade. Sobe no ranking competitivo.

### 1.3 Copy da home / cards (verbatim)
- Título: **"Quiz"** (`quizTitle`)
- **"Teste Seus Conhecimentos"** (`quiz_test_knowledge`)
- **"Responda a perguntas sobre emergências médicas, diagnósticos e procedimentos. A cada resposta certa, você sobe no ranking! Comece escolhendo uma categoria:"** (`quiz_test_knowledge_desc`)
- **"Ver histórico"** (`quiz_history`)
- Card Ranking: título **"Ranking"** (`quiz_ranking`); CTA **"Acesse o ranking"** (`quiz_ranking_acess`); subtítulo **"E conheça os melhores do Quiz"** (`quiz_ranking_details`)
- Card Conquistas: título **"Minhas Conquistas"** (`quiz_achievements`); CTA **"Acesse suas conquistas"** (`quiz_achievements_comp`); subtítulo **"Saiba quais selos você possui"** (`quiz_achievements_badges`)
- Texto de conquistas (acesso): **"Conquiste selos ao responder perguntas e subir de nível! Cada selo conquistado é um passo a mais para se tornar um especialista na CalcMed."** (`quiz_achieviments_acess`)
- Banner de progresso do nível (inline, widget `a5v`): **"Você será Bronze ao atingir 50 pontos. Vamos lá!"**

### 1.4 Categorias do Quiz (enum `AR`, 18 itens — = especialidades médicas)
`Anestesiologia` · `Cardiologia` · `Dermatologia` · `Endocrinologia` · `Gastroenterologia` · `Ginecologia e Obstetrícia` · `Infectologia` · `Medicina Intensiva` · `Nefrologia` · `Neurologia` · `Ortopedia` · `Pediatria` · `Pneumologia` · `Psiquiatria` · `Reumatologia` · `Cirurgia` · `Urologia` · `Outros`
> Ícones por categoria em `assets/icons/quiz/{categoria}_{tier}.svg` (ex.: `cardiologia_bronze.svg`, `medicinaintenciva_ouro.svg`). Tier sufixo ∈ `bronze | prata | ouro | default` (função `cET`). Nota: `medicinaintenciva` e `ginecologia` têm grafia de asset própria.

### 1.5 Modelo de dados da pergunta (parser `cFt`)
Campos: `id`, `reference`, `question`, `category` (índice no enum `B.p7`), `amount_points`, `image_url`, `choices[]`.
Modelo da alternativa (`choice`): `text`, `explanation`, `is_correct_answer`, `question_id`.
> O **conteúdo das perguntas/respostas é gerenciado por backend** (admin `/quiz-management` grava em subcoleção `choices`); não está hardcoded no bundle. As categorias são fixas no app (enum acima).

### 1.6 Fluxo da pergunta (widget `e4q`/`e4r`) — estados
- Botão alterna conforme estado de resposta: **"Responder"** → após responder vira **"Próxima"** (flag `l.w`; `l.w?"Próxima":"Responder"`).
- Ao responder, abre explicação da alternativa (`is_correct_answer` + `explanation`); selo/feedback visual por acerto.
- "Ver histórico" leva a `/quiz/question/history/{categoria}`.
- Loading: **"Carregando..."** (inline na tela de ranking/pergunta).

### 1.7 Eventos de analytics do Quiz (enum, offset ~280k)
`quiz_click` (20) · `quiz_view` (21) · `quiz_started` (22) · `quiz_finished` (23). Params de log no jogo: `question_id`, `is_correct`, `score`. (Outros eventos do app no mesmo enum: `share_gift`=4, `edit_profile_click`=5, `pediatrics_toggle`=6, `calculator_view/bookmark/result`, `change_plan_click`, `subscription_cancel`, etc.)

---

## 2. NÍVEIS / TIERS (sistema de progressão por pontos)

Função `f5u(a)` = mensagens motivacionais por nível (4 estados), e `f5t(a)` = cor do tier. **Thresholds verbatim:**
- **"Você será Bronze ao atingir 50 pontos. Vamos lá!"** (inline home) → **Bronze = 50 pts**
- **"Você começou bem! Com 250 pontos, será Prata!"** → **Prata = 250 pts**
- **"Que demais! Atingindo 500 pontos, você será Ouro!"** → **Ouro = 500 pts**
- **"Incrível! Você alcançou o Ouro! Parabéns!."** (topo, com ponto final após "!" — sic)
- **"Continue respondendo para alcançar o bronze!"** (estado default/abaixo de Bronze)

Tiers nomeados (sufixos de asset): `bronze`, `prata`, `ouro`, `default`. ⚠️ Não há tier acima de Ouro no bundle.

---

## 3. CONQUISTAS / SELOS (achievements)

- Rota `/quiz/achievements`. Tela `MR` renderiza um selo por categoria, com avatar/badge SVG do tier atingido naquela especialidade.
- Ícone: `assets/icons/quiz/{categoria}_{tier}.svg` + `assets/icons/reward.svg` (header).
- Copy da seção (reaproveita): **"Acesse suas conquistas"** / **"Saiba quais selos você possui"**.
- Estado conquistado vs. não-conquistado: badge colorido (cor do tier) vs. badge esmaecido/cinza (lógica `r?A.aO(...)cinza:f5t(p.f)` no widget `MR`). ⚠️ Sem copy de "bloqueado"; é puramente visual.

---

## 4. RANKING

### 4.1 Abas (enum `erZ`/`erY`)
| Índice | Label (UI) | Chave analytics |
|---|---|---|
| 0 | **"Geral"** | `ranking` |
| 1 | **"Hoje"** | `daily_ranking` |
| 2 | **"Mês atual"** | `monthly_ranking` |

### 4.2 Estrutura / estados (widget `bha`/`e4W`)
- Pódio dos top 3 (slots 0,1,2 via `J.F(m.b,0/1/2)`), depois lista.
- Loading: **"Carregando..."**.
- CTA de compartilhar (só quando há dados — `if(J.dJ(m.b))`): **"Compartilhe e ganhe pontos!"** → navega `/quiz/ranking/share`.
- Evento ao abrir: `A.fz("ranking","quiz")`.

### 4.3 Tela de share (`Wz`/`bjE`)
Gera arte do ranking p/ compartilhamento (delay ~200ms, render). Reforça loop: compartilhar = ganhar pontos. ⚠️ Mecânica exata do ganho de pontos por compartilhar não está explícita no bundle (provável backend).

---

## 5. MINHAS VANTAGENS / BENEFÍCIOS (resgate de moedas)

### 5.1 Propósito
Área de recompensas/parcerias. Núcleo atual = **resgatar 30 moedas baixando o CalcMed Eletro** (cross-promo entre os apps do ecossistema CalcMed).

### 5.2 Copy (verbatim)
- Menu/título: **"Minhas Vantagens"** (`benefits`)
- **"Agora você conta com uma área exclusiva feita para quem usa a CalcMed."** (`benefits_description1`)
- **"Explore vantagens especiais pensadas para apoiar sua jornada profissional e oferecer recompensas exclusivas dentro e fora do app."** (`benefits_description2`)
- Estado vazio: **"Nenhum benefício disponível no momento."** (`no_benefits_available`)
- Loading: **"Carregando benefício..."**

### 5.3 Benefício CalcMed Eletro (passo-a-passo) — chaves `calcmed_eletro_*`
- Título do benefício: **"Benefício CalcMed"** · App: **"CalcMed Eletro"**
- **"Ganhe 30 moedas na"** (`calcmed_eletro_earn_coins`) + **"CalcMed Eletro"**
- **"1º Passo"** · **"2º Passo"** (inline) · **"Baixe o App"** · **"tocando no botão a baixo:"** (sic — "a baixo")
- CTAs: **"Baixar agora"** · **"Já baixei"** · **"Resgatar Agora"**
- **"30 moedas"** · **"GRÁTIS"**
- **Regra de limite (verbatim):** **"Ei! Você só pode resgatar suas moedas CalcMed Eletro a cada 30 dias. Seu último resgate foi em {date}. Fique de olho e aproveite! 😉"** (`calcmed_eletro_redemption_limit`)
- Erros: **"URL não disponível"** · **"Erro ao abrir link: "**
- Asset: `assets/images/benefits/calcmed_eletro_web.png`. Evento: `A.fz("gift","gift_web")` na tela web.

### 5.4 Regra de liberação
Resgate de moedas tem **cooldown de 30 dias** (gate temporal, não premium). Benefícios são listados dinamicamente (estado vazio se nenhum).

---

## 6. COMPROMISSO / ESCALA (tracker de plantões) — engajamento recorrente

> Feature de retenção/utilidade (não clínica): o profissional cadastra plantões, locais de trabalho, valor, recorrência, e acompanha progresso financeiro. Gera lembretes (push) → loop de retorno ao app.

### 6.1 Abas / navegação (`commitment_*_tab`)
**"Hoje"** · **"Calendário"** · **"Histórico"** · **"Hospitais"**. Menu: **"Escala"** (`commitment`), **"Plantões"** (`commitments`), **"Plantões Realizados"** (`commitment_shifts_worked`), **"Progresso Financeiro"** (`commitment_financial_progress`).

### 6.2 Criar/editar plantão (campos verbatim)
`Nova Escala` / `Criar Plantão` / `Criar novo plantão`. Campos:
- **"Título"** — hint **"Ex: Hospital Einstein"**
- **"Cor"** (abre color-selection, §7)
- **"Definir local de trabalho (opcional)"** → **"Selecionar local"**; info: **"Ao escolher um local para o plantão, a cor dele será automaticamente conforme a cor do local de trabalho escolhido."**
- **"Valor"** · **"Marcar como pago"**
- **"Inicia em"** · **"Termina em"** · **"Duração"** · **"Selecionar data e hora"**
- Validação: **"A data final deve ser posterior à data inicial. Por favor, selecione uma data e hora diferente."**
- **"Tornar recorrente"** → **"Nunca"** / opções de recorrência (§6.3)
- **"Data final"** · **"Selecionar data final"**
- **"Quero receber notificações"** (toggle de lembrete)
- **"Comentários e Anotações"** — hint **"Ex: Pagamento 60 dias após o plantão"**

### 6.3 Recorrência (rótulos verbatim)
**"Diariamente"** · **"Seg a Sex"** · **"Dias alternados"** · **"A cada uma semana"** · **"A cada 15 dias"** · **"A cada 3 semanas"** · **"A cada mês"** · **"Não Definido"**. (Outra lista no form: `Diário`, `Diário sem fins de semana`, `Semanal`, `Quinzenal`, `Mensal`, `Bimestral`.)

### 6.4 Locais de trabalho (CRUD)
- **"Criar Local de Trabalho"** · **"Locais de trabalhos registrados"** (sic plural) · vazio: **"Nenhum local cadastrado"** + **"Toque em \"Criar Local de Trabalho\" para começar"**
- Form do local: **"Título"** (hint **"Hospital"**), **"Nome da Rua"**, **"Endereço completo"**, **"Rua"**, **"Número"**, **"Bairro"**, **"Cidade"**, **"Estado"**, **"Concluir"**, **"Buscar endereço"**
- Validações: **"Título é obrigatório"** · **"Endereço é obrigatório"**
- Sucesso: **"Local atualizado com sucesso!"** · **"Local criado com sucesso!"** · Erro: **"Erro ao salvar local. Tente novamente."**
- **"Seus Hospitais"** · **"Nenhum hospital cadastrado"** · **"Toque no + para adicionar um novo hospital"** · **"Remover associação"**

### 6.5 Filtros / financeiro
- **"Filtros"** · **"Status de pagamento"** · **"Escalas pagas"** · **"Escalas não pagas"** · **"Por locais"** · **"Redefinir filtros"** · **"Aplicar filtros"**
- **"Detalhes da escala"** · **"Marcar como pago:"** · **"Escala pago"** (sic) · **"Data do pagamento"**
- Resumo: **"Escalas:"** · **"Total pago:"** · **"Total não pago:"** · **"Total de horas:"**

### 6.6 Modelos (templates de plantão)
**"Modelos"** · **"Nenhum modelo criado ainda"** · **"Excluir modelo"** · **"Confirmar exclusão do modelo"** + **"Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita."** · **"Modelo excluído com sucesso!"** · **"Erro ao excluir modelo."**

### 6.7 Estados vazios / loading
**"Nenhuma escala para este dia"** · **"Nenhuma escala encontrada"** · **"Este dia não possui escalas registradas"** · **"Este mês não possui escalas registradas"** · **"Não há escalas em {month} com os filtros aplicados"** · **"Carregando compromissos..."** · **"Locais não cadastrados"**.

### 6.8 Exclusão com recorrência (regra)
**"Este Plantão tem recorrência. Deseja deletar?"** → opções **"Somente este plantão"** / **"Todos os Plantões seguintes"** / **"Todos os Plantões"**. Sem recorrência: **"Tem certeza que deseja excluir este plantão?"** → **"Sim"** / **"Não"**. Outras: **"Confirmar exclusão"** / **"Tem certeza que deseja apagar esta escala?"** / **"Apagando escala..."** / **"Apagar"** / **"Apagar escala"**.

### 6.9 Lembretes (engajamento via push)
**"Lembrete da escala"** (`commitment_shift_reminder`) · **"Lembrete da escala recorrente"** (`commitment_recurring_shift_reminder`). Loop: agendamento → push no dia do plantão → reabertura do app.

---

## 7. COLOR-SELECTION (seletor de cor — subparte do Compromisso)

Tela **"/ Selecionar cor"** (`commitment_select_color_title`). Cores nomeadas (verbatim):
**Laranja** · **Vermelho** · **Azul** · **Verde** · **Magenta** · **Indigo** · **Rosa** · **Roxo** · **Verde-azulado** · **Amarelo** · **Marrom** · **Personalizada** (`commitment_color_*`). A opção **Personalizada** abre color-picker custom. Usada para colorir local de trabalho/plantão no calendário.

---

## 8. INDIQUE UM AMIGO (referral / share_gift)

- Título da tela: **"Indique um Amigo"** (widget `bcH`/`bcI`).
- Headline: **"Presenteie a CalcMed\npara seus amigos!"**
- Subcopy: **"Dê a eles a oportunidade de conhecer a CalcMed "** (ref `u.nG`) + destaque **"com um desconto de 10%."**
- Slug/deep-link interno: `presenteie-um-amigo`.
- Asset: `assets/images/online-doctor.png`. Evento: `A.fz("gift","gift_web")`.
- Mecânica: gera link de indicação que dá **10% de desconto** ao indicado. ⚠️ Recompensa para o indicador não está explícita no bundle (provável backend / atrelada a moedas).

---

## 9. ONBOARDING

### 9.1 Onboarding pós-cadastro (welcome / ativação plano grátis) — chaves `alert_*`
Modal/tela após registro, estados verbatim:
- **"🎉 Cadastro realizado!"** (`alert_registration_success_title`)
- **"Bem-vindo a CalcMed! Você já pode começar a usar as funcionalidades gratuitas."** (`alert_registration_success_message`, ref `u.BN`)
- **"PLANO GRATUITO ATIVADO"** (`alert_free_plan_activated`)
- Features grátis: **"✅ Calculadoras básicas\n✅ Conversores de unidades\n✅ Algumas funcionalidades de urgência"** (ref `u.BF`)
- Dica: **"💡 Dica: Assine agora e desbloqueie o premium - aproveite todas as funcionalidades do CalcMed."** (ref `u.gA`)
- CTA: **"Começar a usar!"** (`alert_start_using`)
- Upsell premium: **"Ainda não é Premium?"** · **"O Premium libera tudo o que faz diferença no plantão."** · features premium: **"✔ Doses e diluições prontas\n✔ Cetoacidose diabética (completa)\n✔ Intubação\n✔ Ajuste de Varfarina\n✔ Toda a Pediatria desbloqueada"** · **"Você vai sentir a diferença já no próximo plantão."**
- Botões: **"Continuar no Básico"** / **"Assinar Premium"**

> **Regra de liberação premium (load-bearing):** o que distingue Free de Premium, conforme a copy: **Doses e diluições prontas, Cetoacidose diabética completa, Intubação, Ajuste de Varfarina, e toda a Pediatria** ficam atrás do paywall. Free = calculadoras básicas + conversores + algumas funções de urgência.

### 9.2 Onboarding do Modo PCR (carrossel 4 passos) — chaves `pcr_onboarding_*`
1. Intro — badge **"Parada Cardiorrespiratória"** / título **"Modo PCR"** / **"Uma ferramenta completa para te auxiliar durante o atendimento de uma PCR."** + features **"Cronômetros inteligentes"**, **"Controle de ciclos"**, **"Registro de eventos"**
2. Compressões — badge **"Cronômetros automáticos"** / título **"Compressões & Adrenalina"** / **"Acompanhe os tempos de compressão torácica (2 min) e intervalos de adrenalina (3 min) com alertas visuais."**
3. Ritmo — badge **"Selecione o ritmo cardíaco"** / título **"Ritmo"** / **"Ao iniciar, escolha entre FV, TV sem pulso, AESP ou Assistolia. O protocolo se adapta ao ritmo selecionado."**
4. Pronto — badge **"Tudo preparado"** / título **"Pronto para começar!"** / **"O Modo PCR simplifica a interface para foco total. Desative a qualquer momento pelo toggle no cabeçalho."**
- Botões: **"Ativar Modo PCR"** · **"Anterior"** · **"Cancelar"** · **"Continuar"**

---

## 10. ARQUÉTIPOS (padrões reutilizáveis identificados)

1. **Loop de progressão por pontos com tiers nomeados.** Pontos → nível (Bronze 50 / Prata 250 / Ouro 500) → cor + selo. Mensagem motivacional muda por estado (`f5u`, 4 frases). Arquétipo: *threshold ladder com copy de incentivo por estágio.*
2. **Coleção de selos por categoria (taxonomia fixa × tier).** 18 especialidades × 4 tiers = grade de badges (`{categoria}_{tier}.svg`). Estado conquistado = colorido; pendente = esmaecido (sem texto de bloqueio). Arquétipo: *grade de coleção sticker-book.*
3. **Ranking competitivo multi-período.** 3 abas (Geral/Hoje/Mês atual) + pódio top-3 + lista. Arquétipo: *leaderboard com janelas temporais.*
4. **Share-to-earn / viralidade.** "Compartilhe e ganhe pontos!" (ranking) + "Indique um Amigo" com desconto de 10%. Arquétipo: *referral/share com recompensa e deep-link.*
5. **Recompensa com cooldown temporal (não-premium).** Resgate de 30 moedas CalcMed Eletro a cada 30 dias com `{date}` do último resgate. Arquétipo: *daily/periodic reward com gate de tempo.*
6. **Cross-promo de ecossistema (moedas inter-app).** Moeda compartilhada entre CalcMed Urgência ↔ CalcMed Eletro. Arquétipo: *currency bridge entre apps da mesma marca.*
7. **Loop de retenção utilitário (Escala/Plantões).** Cadastro de plantões recorrentes + lembretes push → retorno periódico + valor financeiro (progresso $). Arquétipo: *habit hook via utilidade + notificação agendada.*
8. **Onboarding em carrossel com badge+título+descrição+features por slide** (Modo PCR, 4 passos; botões Anterior/Continuar/Cancelar). Arquétipo: *feature-tour carousel.*
9. **Onboarding pós-cadastro como momento de upsell.** Celebração ("🎉 Cadastro realizado!") → confirma valor grátis → tip premium → escolha "Continuar no Básico" vs "Assinar Premium". Arquétipo: *welcome + soft-paywall com features lado-a-lado.*
10. **Conteúdo gerenciado por backend com taxonomia fixa no cliente.** Perguntas/respostas vêm do admin (`/quiz-management`), mas as 18 categorias são enum hardcoded. Arquétipo: *CMS-driven content sobre estrutura fixa.*
11. **Seletor de cor reutilizável com paleta nomeada + custom.** 11 cores nomeadas + "Personalizada". Arquétipo: *named-palette picker com fallback custom.*

---

## 11. FLAGS / INCERTEZAS

- ⚠️ **Conteúdo do Quiz** (texto das perguntas, alternativas, pontos por pergunta) NÃO está no bundle — é servido por backend (Firestore via admin). Só a estrutura/categorias/UI são extraíveis.
- ⚠️ **Mecânica exata de "ganhe pontos ao compartilhar"** não aparece no código cliente; provável lógica de servidor.
- ⚠️ **Recompensa do indicador** no referral não explicitada (só o desconto de 10% do indicado consta).
- ⚠️ Existe distinção entre rotas `/quiz` e `/quiz/` (com barra) — ambas aparecem como destinos de navegação; provável que `/quiz` = entry/hub e `/quiz/` = jogo, mas não 100% confirmado.
- ✅ Sem incerteza: thresholds de nível, nomes de categorias, copy i18n (extraída 1:1 do mapa pt-BR), regra de cooldown de 30 dias, features do paywall.
- Nota de copy: ortografia do app preservada verbatim — "tocando no botão a baixo", "Escala pago", "Locais de trabalhos registrados", ponto extra em "Parabéns!." são do produto, não erros de transcrição.
