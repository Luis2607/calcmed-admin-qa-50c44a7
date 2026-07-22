# App-wide #09 — Monetização & Conta (as-is, app de produção)

> Fonte: `_source/main.decoded.js` (bundle Flutter web minificado e decodificado). Toda copy abaixo é **verbatim** do bundle. Identificadores ofuscados (`gBz`, `B.qq`, etc.) preservados como evidência. Incertezas estão marcadas com **[?]**.
> Domínio: planos, preços/copy, paywall/upsell, mapa free×premium, store/loja, gift, profile, settings, cancelamento, pagamento.

---

## 0. A regra de gating (o coração da monetização)

Existe um controller `_ActivePlanControllerBase` (classe base ofuscada `A.Fa`) cujo estado `this.ch` é a string do tipo de plano (`"free"` / `"premium"`). Os getters computados:

| Getter ofuscado | Nome real (no bundle) | Lógica verbatim |
|---|---|---|
| `gSM` | `isFreePlan` | `return this.ch==="free"` |
| `gMm` | `isUserAdmin` | lê claim do usuário (`r.f.b===!0`) |
| `gBz` | `hasPremiumAccess` | `if(!isUserAdmin){ s = this.ch==="premium" \|\| cV2 } else s=!0` |
| `gbp9` | `planDisplayName` | Admin→`"ADMINISTRADOR"`; premium→`"PREMIUM"`; free/default→`"GRATUITO"` |
| `gbp8` | `planDescription` | (ver abaixo) |
| `cV2` | (acesso por graça/trial) | `true` se `subscription.status` ∈ {`grace_period`, `active`} ou `f4C(...)` |

`gbp8` (planDescription) — **verbatim**:
- Admin: `"Acesso completo a todas as funcionalidades (Admin)"`
- premium: `"Acesso completo a todas as funcionalidades"`
- free: `"Acesso a conversores, dividir descanso, anafilaxia, hipoglicemia, enxaqueca e corticoides pediátricos"`
- default: `"Acesso limitado às funcionalidades básicas"`

**Como o gating aparece na UI** (closure `djG`, verbatim): `r=o.e.gBz?r:r+" (Premium)"` — o label de uma feature recebe o sufixo **" (Premium)"** quando o usuário NÃO tem `hasPremiumAccess`. (Ícone de cadeado `B.it` é empurrado ao lado quando a condição `m` é verdadeira.)

### Mapa free × premium (verbatim do bundle)
- **Free libera** (`gbp8` free): `conversores, dividir descanso, anafilaxia, hipoglicemia, enxaqueca e corticoides pediátricos`.
- **Free libera** (constante `u.BF`, tela de boas-vindas): `"✅ Calculadoras básicas\n✅ Conversores de unidades\n✅ Algumas funcionalidades de urgência"`
- **Premium libera** (paywall, ver §2): `"✔ Doses e diluições prontas\n✔ Cetoacidose diabética (completa)\n✔ Intubação\n✔ Ajuste de Varfarina\n✔ Toda a Pediatria desbloqueada"`

---

## 1. Planos (PlansEnum) e nomes

Enum `PlansEnum` resolvido por `eE_` (mapeia string canônica/i18n → constante) e por `oA` (constante → display name PT-BR fallback):

| Índice (`a.a`) | Enum | i18n key | Display PT-BR (fallback) | Const ofusc. |
|---|---|---|---|---|
| 0 | `premiumMonthly` | `planMonthly` | **Plano Mensal** | `B.qq` |
| 1 | `premiumAnual` | `planAnnual` | **Plano Anual** | `B.Es` |
| 2 | `premiumAnualInstallments` | `planAnnualInstallments` | **Plano Anual Parcelado** | `B.an2` |
| 3 | `freeDays` | `planFreeDays` | **Período Gratuito** | `B.an3` |
| 4 | `free` | `planFree` | **Plano Gratuito** | `B.Nj` |
| 5 | — | `planNone` | **Nenhum plano escolhido** | `B.cmh` |

`eE_` também aceita as variantes `"premiumMonthly"`, `"PlansEnum.premiumMonthly"`, `"PlansEnum.premiumAnual"`, `"PlansEnum.premiumAnualInstallments"`, `"PlansEnum.freeDays"`, `"PlansEnum.free"`, `"free"`.

### Copy de preço
- `"Equivale a {price} R$/mês"` — usado no card de plano (placeholder `{price}` injetado em runtime; valor numérico **não** está no bundle — vem do backend/loja).
- Analytics buckets de preço: `"monthly_plan"`, `"annual_plan"`, `"annual_plan_installment"`.

### Cláusulas de plano (Termo de Uso, verbatim, seção **PLANOS DE ASSINATURA**)
- "O Usuário deve optar pela assinatura do plano mensal ou anual para utilizar o CALCMED."
- "O plano mensal garante ao Usuário o uso do Software pelo período de 30 (tinta) dias…" *(sic: "tinta")*
- "O plano anual garante ao Usuário o uso do Software pelo período de 365 (trezentos e sessenta e cinco) dias…"
- "O plano de assinatura mensal ou anual será renovado automaticamente pelo mesmo período… em caso de ausência de cancelamento do Usuário."
- "O pagamento do plano de assinatura será realizado diretamente na Apple Store ou Google Store…"

---

## 2. Paywall / Upsell

### 2.1 Paywall pós-cadastro ("Ainda não é Premium?")
Sequência verbatim (após `"🎉 Cadastro realizado!"` → `"PLANO GRATUITO ATIVADO"`):
- Título: **"Ainda não é Premium?"**
- Subtítulo: **"O Premium libera tudo o que faz diferença no plantão."**
- Lista: **"✔ Doses e diluições prontas\n✔ Cetoacidose diabética (completa)\n✔ Intubação\n✔ Ajuste de Varfarina\n✔ Toda a Pediatria desbloqueada"**
- Reforço: **"Você vai sentir a diferença já no próximo plantão."**
- CTA secundário: **"Continuar no Básico"**
- CTA primário: **"Assinar Premium"**

### 2.2 Boas-vindas free (constantes)
- `u.BN`: **"Bem-vindo a CalcMed! Você já pode começar a usar as funcionalidades gratuitas."**
- `u.gA` (dica de upsell): **"💡 Dica: Assine agora e desbloqueie o premium - aproveite todas as funcionalidades do CalcMed."**
- CTA: **"Começar a usar!"**
- Analytics: `alert_free_plan_activated`, `alert_free_plan_features`, `alert_premium_tip`.

### 2.3 Tela "ACESSO EXPIRADO" (premium expirou — bloqueio)
- Título: **"SEU ACESSO PREMIUM EXPIROU"**
- Corpo: **"Não perca tempo e faça a diferença na vida de seus pacientes com o suporte da CalcMed. Estamos ansiosos para continuar sendo uma parte vital da sua prática médica."**
- Imagem: `assets/images/time-expired.png`
- CTA primário: **"Quero assinar a CalcMed"**
- CTA secundário: **"Já realizou o pagamento? Toque aqui"**

### 2.4 Sufixo de gating inline
Qualquer feature bloqueada recebe **" (Premium)"** no rótulo + ícone de cadeado (ver §0).

---

## 3. Store / Loja & Benefícios

Dois conceitos coexistem: **Loja** (link externo de compra) e **Benefícios/Vantagens** (perks de parceiros).

- Rota: `/store` (handler `aXT`). Labels: **"Loja Calcmed"**, **"Loja"**, **"Loja online"**, **"Acessar loja"**.
- Rota: `/benefits` (handler `aBC`), `/benefits/nome-beneficio`.
- Copy benefícios (verbatim):
  - `u.o1`: **"Explore vantagens especiais pensadas para apoiar sua jornada profissional e oferecer recompensas exclusivas dentro e fora do app."**
  - **"Minhas Vantagens"**, **"Beneficios"**, **"Beneficio CalcMed"**
  - Empty state ES: **"No hay beneficios disponibles en este momento."**
  - CTA: **"Resgatar Agora"** / **"Resgatar agora"** / **"Resgatar benefício"**
  - **"resgate seu benefício:"**, **"para resgatar"**

---

## 4. Gift / Presentear

- Rota: `/gift` (handler `aKo`). Analytics: `gift`, `gift_web`.
- Título (mobile): **"Presenteie a CalcMed\npara seus amigos!"**
- Subtítulo: rich text — **"…com um desconto de 10%."**
- Imagem: `assets/images/online-doctor.png`
- AppBar: **"Indique um Amigo"** (mobile) / **"Presenteie um Amigo"**
- Mensagem de compartilhamento (cupom embutido, verbatim):
  > "…acredita que a CalcMed pode revolucionar sua prática médica, e estamos prontos para provar isso!\n\nVocê recebe um desconto exclusivo de 10% na assinatura do CalcMed, o app repleto de calculadoras essenciais para médicos. Simplifique seus plantões e acelere seu atendimento.\n\nBasta acessar nosso site agora e utilizar o cupom CALCMED10.\n\nAcesse:\nhttps://checkout.calcmed.com.br/?plan=monthly&coupon=CALCMED10 \n\nObrigado por confiar na recomendação!\n\n#CalcMed #MedicinaEficiente #DescontoEspecial"

> Nota: cupons gerenciados no Admin (`/dashboard/manageCoupons`, `/manageCoupons`): "Novo cupom", "Editar cupom de desconto", "Digite o percentual de desconto do cupom", "Validade do cupom em meses:", "Cupons mais utilizados:". Isso é admin, fora do app B2C, mas a copy do cupom **CALCMED10** aparece no fluxo de gift.

---

## 5. Subscription / Plano ativo (Gerenciar assinatura)

Rotas: `/subscription` (handler `cgD`), `/subscription/grace-period-expired` (`cgE`), `/availablePlans` (`cgH`), `/selectedPlan` (`cgI`), `/subscriptionPayment` (`cgJ`), `/activePlan` (`cgy`), `/subscriptions` (Stripe API, ver §8).

Copy da tela de plano (verbatim):
- **"Seu plano"** / **"Seu plano:"**
- **"Plano Mensal"** / **"Plano Anual"** (display dinâmico via `oA`)
- **"Ver planos disponíveis"** (`available_plans`)
- **"Renovação:"** (ES: "Renovación:")
- **"Expira em"** / **"Expira em: "** / **"Expirado"**
- **"Sua assinatura expira em "** / **"Sua assinatura expirou em "**
- **"Nenhum plano escolhido"**
- **"Gerenciar assinatura"** / **"Gerenciar Assinatura"** (`manage_subscription`)
- **"Cancelar assinatura"** / **"Renovar Assinatura"** / **"Retomar Assinatura"** (`change_plan_click`)
- Microcopy de tranquilidade: **"Cancele quando quiser"**, **"Cancele a qualquer momento"**
- Ícone: `assets/icons/logo_sub_blue.png`

Estados de assinatura (string `subscription.status`): `active`, `canceled`, `grace_period`, `expired`.

---

## 6. Cancelamento

Rotas: `/informationCancellation` (`cgz`), `/cancelPlan` (`cgA`), `/canceledPlan` (`cgB`), `/canceledStripePlan` (`cgC`), `/home/informationCancellation`.
Analytics: `cancel_subscription`, `cancel_subscription_confirm`, `cancel_subscription_success`, `cancel_subscription_error`.

### 6.1 Tela de motivo (informationCancellation)
- Título: **"Conte-nos mais sobre sua decisão"**
- Corpo: **"Isso nos ajuda a entender o que podemos melhorar no futuro, para melhor atendê-lo.\n\nQual foi o motivo pelo qual você optou pelo cancelamento de sua assinatura?"**
- Campo de texto livre + CTA **"Cancelar Assinatura"** (habilitado só quando preenchido — `if(m.e!=="")`).

### 6.2 Confirmação de cancelamento
- Pergunta: **"Tem certeza de que deseja cancelar sua assinatura?"**
- Corpo: **"Ao cancelar a assinatura, você poderá usar sua conta até a data de renovação."**
- (EN) **"Are you sure you want to cancel your subscription? After canceling, you can use your account until the renewal date."**
- (ES) **"Su suscripción ha sido cancelada con éxito. Puede usar su cuenta hasta la fecha de renovación."**
- CTA: **"Cancelar assinatura"** / **"Cancel subscription"** / **"Cancelar suscripción"**

### 6.3 Sucesso
- Título: **"Assinatura cancelada com sucesso."**
- Corpo (com data formatada `dd/MM/yyyy`): **"Você poderá usufruir dos benefícios até o último dia do seu ciclo atual, {data}"**
- Estados visuais: **"Assinatura\nCancelada"**, **"Assinatura cancelada"**, **"Cancelado"**, **"Conta encerrada"**, **"Conta Suspensa"**.

### 6.4 Erros de cancelamento
- `u.e0`: **"Não foi possível cancelar sua assinatura. Tente novamente mais tarde."**
- **"A assinatura que você está tentando cancelar não foi encontrada."**

### 6.5 Trocar plano com premium ativo (downgrade/switch)
Dialog (verbatim, com placeholder de dias): **"Ao continuar, seu plano Premium atual será cancelado automaticamente. Você ainda tem {n} dias restantes."** — botões **"Não"** / **"Sim, continuar"**, título **"Cancelar plano atual"**.

### 6.6 Cláusula legal de cancelamento (Termo de Uso, verbatim, seção **CANCELAMENTO**)
- "O Usuário poderá solicitar o cancelamento do plano a qualquer tempo."
- "O Usuário que cancelar o plano mensal ou anual garante que o contrato não será renovado…"
- "O Usuário terá o prazo de 7 (sete) dias para se arrepender da assinatura… sendo integralmente reembolsado…"

---

## 7. Pagamento (payment-with-card)

Rota: `/payment-with-card` (handler `cHK`), `/order` (`cHL`), `/payment_methods`, `/redirectToCheckout` (handler `bw5`).
Controller `_PaymentControllerBase` (campos: `cvvCode`, `errorCvvCode`, `expiryDate`, `errorExpiryDate`, `validExpiryDate`, `validCVC`).
Analytics: `begin_checkout`, `in_app_purchase`, `default_payment_method`, `payment_method`.

### 7.1 Campos do cartão (verbatim)
- **"Data de validade"** / erro **"Data de validade inválida"** / **"Cartão expirado!"** / **"Cartão expirado!\nNenhuma cobrança foi efetuada."**
- **"CVV"** / **"CVV inválido"**
- **"Preencha os dados para pagamento da fatura"**
- **"Finalizar compra"**
- **"Data do pagamento"** / **"Status de pagamento"** / **"Pagamento em "**

> **[?]** Não localizei rótulos literais "Número do cartão" / "Nome no cartão" no bundle (provavelmente vêm de um widget de cartão dinâmico ou do Stripe SDK nativo). Sinalizado como incerto.

### 7.2 Formas de pagamento (FAQ)
- `contact_us_faq_payment_methods`: **"Quais são as formas de pagamento disponíveis?"** (`u.vj`)
- `contact_us_faq_payment_methods_answer` (fallback): **"Cartão de crédito e Pix"**

### 7.3 Resultados de pagamento (verbatim)
- Sucesso: **"Pagamento Realizado"**
- Genérico: **"Pagamento"** / **"Erro de Pagamento"** / **"Ocorreu um erro no pagamento."** / **"Ocorreu um erro no pagamento.\nNenhuma cobrança foi efetuada."**
- **"Erro no pagamento. Tente novamente mais tarde."**
- **"Erro ao processar pagamento: {…}"**
- **"Ocorreu um erro ao criar o método de pagamento"**
- Recusas: **"Pagamento recusado pelo emissor."** / **"Pagamento recusado pelo emissor.\nNenhuma cobrança foi efetuada."** / **"Pagamento recusado. Entre em contato com seu banco."**
- Fraude: **"Pagamento bloqueado por suspeita de fraude."** / **"…\nNenhuma cobrança foi efetuada."**

### 7.4 Tela "PARABÉNS VOCÊ GANHOU" (concessão de acesso / free-days / gift recebido)
- Título: **"PARABÉNS VOCÊ GANHOU"**
- Selo: **"ACESSO PREMIUM"** (badge `assets/icons/logo.png`)

---

## 8. Stripe / Checkout (camada técnica)

- Base de checkout web: `https://checkout.calcmed.com.br/`, variantes: `?email={…}`, `?userExists=1`, `?plan=monthly&coupon=CALCMED10`.
- Handler interno `/redirectToCheckout` (`bw5`).
- API Stripe `POST {base}/subscriptions` com payload:
  - `default_payment_method`
  - `items[0][price]` OU `items[0][price_data][currency|unit_amount|product|recurring][interval|interval_count]`
  - **`trial_period_days = "7"`** ← **trial de 7 dias hardcoded** na criação da assinatura Stripe.
- Tipos de assinatura no perfil (string serializada): `monthlyPlan, yearlyPlan, appleSubscription, googleSubscription, stripeSubscription, coupons`.
- Copy admin/analytics: **"Assinatura via Stripe"**, **"E-mails de usuários com assinatura Stripe"** (`u.mx`), `"E-mails de usuários com assinatura Google"` (`u.U`).
- Erros: **"Falha ao criar a assinatura no Stripe. "**, `StripeError(type: …)`, `stripeErrorCode`.
- App stores (analytics): `app_store_subscription_cancel/convert/renew`, `app_store_refund`, `af_start_trial`, `start_trial`, `trial_from_plan`, `trial_period_days`, `Free Trial`.

---

## 9. Profile / Conta

Rota: `/profile` (handler `cgw`), `/userManagement`, `/logout`.
- **"Minha Conta"** / **"Acessar minha conta"**
- **"Editar Perfil"** / **"Editar Foto de perfil"** / **"Editar Nome"**
- Cadastro (Termo, **CADASTRO DO USUÁRIO**): obrigatórios = Nome, E-mail, Senha; opcionais = Ocupação, Área de atuação, Sexo, Idade, Cidade, Estado, Foto de perfil. Idade mínima 18.
- Excluir conta: **"Não foi possível deletar sua conta no momento"** (existe fluxo de deleção; rótulo do botão **[?]** não isolado verbatim além dos erros).

---

## 10. Settings / Configurações

Rota: `/settings` (handler `anp`). Estrutura por seções (headers verbatim):
- **"NOTIFICAÇÕES"** — toggle (`receiveNotifications`); rotas `/notification`, `/manageNotifications`.
- **"CONTA"** — bloco de conta.
- Labels gerais: **"Configurações"** / **"Configurações do aplicativo"** / **"Configurações avançadas:"** / **"Idioma"** (Português/Inglês/Espanhol; ES "Cambiar idioma"), tema **"Dark"**.
- **"Fale Conosco"** / **"Contact Us"** / **"ENTRAR EM CONTATO"** — rota `/contact-us`, `/first/contact-us`; form com nome/email/mensagem ("Complete los campos a continuación para contactarnos.").

### FAQ de assinatura/pagamento (verbatim, fallbacks PT-BR)
| Pergunta | Resposta |
|---|---|
| "Qual meu plano?" (`u.rM`) | "Para saber qual seu plano, basta acessar no menu do aplicativo a sessão "assinatura"." |
| "Como mudar meu plano?" (`u.F3`) | "A Calcmed oferece opções de plano mensal ou anual. Para alterar seu plano, basta acessar no menu do aplicativo a sessão "assinatura"." |
| "Como mudar a forma de pagamento?" (`u.mV`) | "Para alterar a forma de pagamento, basta acessar no menu do aplicativo a sessão "assinatura". Lá você encontrará a opção "alterar plano"." |
| "Quais são as formas de pagamento disponíveis?" (`u.vj`) | "Cartão de crédito e Pix" |
| "Fiz o cancelamento… mas continuei sendo cobrado…" (`u.Az`) | "Antes de tudo, pedimos desculpas pelo transtorno. Para resolvermos entre em contato conosco pelo email: contato@calcmed.com.br\nOu na sessão "Fale Conosco" do aplicativo." (`u.pW`) |
| "Estou com problema para contratar/renovar meu plano, o que fazer?" (`u.zh`) | "Entre em contato conosco pelo email: contato@calcmed.com.br\nOu na sessão "Fale Conosco"." (`u.sP`) |
| Como retomar/resumir plano (`u.eQ`) | "Ao acessar a CalcMed com plano inativo surgirá uma tela em que você poderá escolher o novo plano." |
| "Como funciona a parceria com a CalcMed?" | "Temos uma equipe especializada e motivada… Entre em contato conosco pelo email: parceiros@calcmed.com.br" (`u.F6`); CTA "Tenho interesse no programa de parcerias!" (`u.cP`) |

---

## 11. Entidade legal & contatos (Termo de Uso / Política de Privacidade)
- Empresa: **Carajas Medicina Especializada LTDA** (também grafada "Carajás"), CNPJ **39.265.769/0001-77**, Rua Kaxinawas, s/n, quadra 002, lote 017, sala 2.
- Foro: **Belo Horizonte/MG**.
- DPO/LGPD: **lgpd@calcmed.com.br** (exclusão em até 72h).
- Suporte: **contato@calcmed.com.br**; parcerias: **parceiros@calcmed.com.br**.
- SaaS, renovação automática, pagamento via Apple/Google Store (Termo) — **diverge** do fluxo real do app que usa **Stripe + Pix + cartão** e checkout web próprio (Termo está desatualizado vs. implementação). **[flag]**

---

## ARQUÉTIPOS (padrões reutilizáveis identificados)

1. **Gating por sufixo "(Premium)" + cadeado** — feature bloqueada não some; ela aparece com label `+ " (Premium)"` e ícone de cadeado. Estado derivado de `hasPremiumAccess` (premium OU grace_period/active OU admin). Free é uma allowlist explícita de features, não um bloqueio total.
2. **Tela-bloqueio de acesso expirado** — full-screen com ilustração + 2 CTAs ("Quero assinar" / "Já realizou o pagamento?"). Mesmo padrão visual do "PARABÉNS VOCÊ GANHOU" (logo + badge full-screen) — par celebração/bloqueio.
3. **Paywall de 5 blocos** — Título-gancho ("Ainda não é Premium?") → promessa ("libera tudo o que faz diferença no plantão") → bullets ✔ → reforço emocional ("já no próximo plantão") → par de CTAs (continuar grátis / assinar). Linguagem de plantão/clínica como driver de valor.
4. **Cancelamento em funil de 3 passos com fricção/retenção** — motivo obrigatório (texto livre) → confirmação ("até a data de renovação") → sucesso com data de fim de ciclo. Microcopy de retenção ("Cancele quando quiser") aparece ANTES, na tela de plano.
5. **Trial de 7 dias hardcoded no Stripe** (`trial_period_days="7"`) — espelhado no direito de arrependimento legal de 7 dias e nos eventos `start_trial`.
6. **Cupom como alavanca de indicação** — CALCMED10 (10%) embutido na mensagem de gift compartilhável + deep-link de checkout com `?coupon=`. Gift = canal de aquisição, não compra de presente real (texto é uma indicação com desconto).
7. **Plano = enum de 6 estados** com tripla resolução (string canônica / i18n key / display PT-BR) e fallback hardcoded — robusto a i18n ausente.
8. **FAQ como camada de auto-atendimento de billing** — toda dúvida de plano/pagamento/cancelamento aponta de volta para "sessão assinatura" ou e-mail de suporte; reduz tickets.
9. **Store vs. Benefícios desacoplados** — "Loja" (compra externa) e "Benefícios/Vantagens" (perks de parceiros, "Resgatar") são superfícies distintas, ambas fora do core clínico.
10. **Divergência Termo↔Implementação** — Termo diz pagamento via Apple/Google Store; código usa Stripe/Pix/cartão + checkout web. Risco de compliance/atualização legal.
