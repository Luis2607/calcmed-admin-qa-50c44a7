# App-wide AS-IS — Auth, Onboarding & Shell (não-clínico)

> Fonte: bundle Flutter web decodificado `_source/main.decoded.js` (dart2js). Toda copy é **verbatim** do bundle (extraída por byte-offset + tabela i18n master `B.cfK` no offset ~10.303M + objeto de strings longas `var u={…}` no offset ~9.176M).
> Escopo: Auth (login/register/recover), splash, force-update, drawer/menu, settings/idioma, support/contact-us/suggestion, references, notepad, blog, partners, about/terms, entrada Eletro (calcmed-eletro-1/2/3), location-selection/register/address-search, encerrar conta, paywall pós-cadastro.
> **NÃO** cobre o conteúdo clínico (pediatria/PCR/calculadoras) — isso é de outros agentes.
> Convenção: `{var}` = placeholder de template literal do app. `u.XX` = chave do objeto de strings longas (resolvida inline). Onde há incerteza, marcado **[FLAG]**.

---

## 0. Stack & arquitetura de navegação (confirmado)

- **App é Flutter compilado para web** (dart2js), não React. Roteamento via go_router-like: registries `A.aG(a,"/rota",builder)` (sem sub-rotas) e `A.ib(a,"/rota",[redirect],builder)`.
- **i18n com 3 locales** (PT/EN/ES). Cada locale é uma array de valores indexada por um mapa `chave:índice` (3 mapas no fim do bundle ~10.28M / 10.44M / 10.50M). A array PT canônica é `B.cfK` (1075+ strings). Render via `A.I(a,B.B,t.J).A("chave")` com fallback hard-coded em PT.
- **Locales expostos ao usuário:** `"Português"`, `"Inglês"`, `"Espanhol"` (labels em `B.cfK`; toggle "Trocar idioma" / "Idioma"). Sub-rota dedicada `/settings/language` existe (builder `cOA`). **[FLAG]** não há tela de seleção de idioma standalone com aquele texto — a troca vive dentro de Configurações.
- **Analytics:** funções `A.fz(nome, tela)` e `A.lY(slug)` disparadas em quase toda navegação (slugs verbatim citados abaixo). Há também `A.aIn("register_google",!0)` no register.
- **Dark mode** é first-class: assets de logo trocam (`logo.png` claro vs `logo_sub_white.png`/`logo_sub_blue.png` escuro) e cores derivam de `A.d(a).ax`.

### Mapa de rotas top-level (router raiz, `jW`, offset ~3.246M)
```
/force-update      → Sq (Atualização obrigatória)
/  (redirect /home/)→ ahQ
/splash            → aXL → "/" → WO (SplashScreen)
/quiz-management   → aln        /banners-management → aaP
/benefits-management → aaU      /quiz → aTN
/onboarding        → aQF        /register → alG
/home              → aL1 (router aninhado — ver §11)
/users /equation /pediatra /dashboard /settings /benefits /store
/support           → aY9
/notepad/          → aQn
/commitment        → aDc (Passômetro)
/redirectToCheckout→ XP
```

---

## 1. SPLASH — `/splash` (builder `WO` → `bke`)

**Propósito:** boot do app; verifica versão e conexão, decide rota inicial.

**Estados (texto de status verbatim, enum `SplashState`):**
| idx | copy |
|---|---|
| 0 | `Iniciando...` |
| 1 | `Verificando versão...` |
| 2 | `Carregando serviços...` |
| 3 | `Verificando conexão...` |
| 4 | `Carregando dados...` / (offline) `Carregando dados offline...` |
| 5 | `Sincronizando...` |
| 6 | `Modo Offline` |
| 7 | `Pronto!` |

**Regra de fluxo:** roda `apF` (checagem de força-update) → se precisa atualizar `→ /force-update`; senão `→ /home/`. Logo central (`logo.png` ou `logo_sub_white.png` conforme dark), spinner + ícone por estado.

---

## 2. FORCE-UPDATE — `/force-update` (builder `Sq`, copy offset ~2.669M)

**Propósito:** bloqueia uso até atualizar para versão mínima.

| Elemento | Copy verbatim |
|---|---|
| Título | `Atualização Obrigatória` |
| Corpo | `Para continuar usando o Calcmed, você precisa atualizar para a versão mais recente.` |
| Card | `Versão Atual:` `{this.d}` · `Versão Mínima:` `{this.e}` |
| Botão primário | `Atualizar Agora` |
| Botão secundário | `Fechar App` |
| Rodapé | `Esta atualização contém melhorias importantes de segurança e funcionalidades.` |
| Toast web (Fechar App) | `Por favor, atualize o navegador ou acesse a versão mais recente.` |

---

## 3. AUTH — Login (builder compartilhado `dQ4`, mobile≡desktop, só muda wrapper `DESKTOP`)

**Rota:** `/onboarding/login` (navegado de várias telas). **Propósito:** autenticação por e-mail+senha.

**Campos & copy (verbatim):**
- Logo (troca por dark).
- Título: `Bem vindo`
- Subtítulo: `Por favor, insira as informações`
- Campo: `Email` (label/placeholder)
- Campo: `Senha` (toggle de visibilidade)
- Checkbox: `Lembrar de mim` · Link à direita: `Recuperar senha`
- Botão primário: `Entrar`
- Botão secundário (outline): `Criar conta`
- Rodapé texto+link: `ou entre em ` + `contato conosco`
- Seção social: `Conheça Nossas Redes` + ícones Facebook / Instagram / LinkedIn (`facebook-web.svg`, `instagram-web.svg`, `linkedIn-web.svg`)

**Estados:**
- Sucesso → limpa e navega `/home/`.
- Erro (estado `B.b_`): dialog com botão `Tentar Novamente`.
- Lista de erros de validação por campo (renderizada acima do campo de senha).

**Regras / NÃO existe:** sem login social (Google/Apple) — só link p/ redes sociais. CPF **não** aparece no login (CPF é coletado/exibido no perfil — ver §13). Há flag de analytics implícito; o botão "Criar conta" leva ao register.

---

## 4. AUTH — Register (builder `VJ` → `bhJ`, offset ~5.65M)

**Rota:** `/register` (e `/onboarding/register/...`). **Propósito:** criar conta gratuita.

**Copy verbatim:**
- Botão voltar (seta) → `/onboarding/login`
- Título: `Bem-vindo a CalcMed`
- Subtítulo: `Crie sua conta e comece sua jornada na CalcMed`
- Campo: `Nome Completo` — placeholder `Digite aqui` — validação `Campo obrigatório`
- Campo: `E-mail` — placeholder `user@gmail.com` — validação `Campo obrigatório`
- Campo: `Senha` — placeholder `******` — toggle olho (`hidePassword.svg`)
- Termos: `Ao efetuar seu cadastro, você estará de acordo com nossos ` + link `Termos e Condições` → `/onboarding/register/termsWeb`
- Botão: `Continuar` → dispara analytics `register_google` e navega `/onboarding/register/terms`
- Rodapé: i18n `register_has_account` (`Já tenho conta. `) + `register_login` (`Fazer login`) → `/onboarding/login`
- **[FLAG]** existe um campo `Sexo` (Select) no fluxo de cadastro mobile (builder `e69`/`e66`) — pode ser de uma etapa de onboarding, não da tela web principal.

**Modal de sucesso pós-cadastro** (verbatim):
- Título: `🎉 Cadastro realizado!` (`alert_registration_success_title`)
- Mensagem (`u.BN`): `Bem-vindo a CalcMed! Você já pode começar a usar as funcionalidades gratuitas.`
- Badge: `PLANO GRATUITO ATIVADO` (`alert_free_plan_activated`)
- Features (`u.BF`): `✅ Calculadoras básicas\n✅ Conversores de unidades\n✅ Algumas funcionalidades de urgência`
- Dica (`u.gA`): `💡 Dica: Assine agora e desbloqueie o premium - aproveite todas as funcionalidades do CalcMed.`
- Botão (`alert_start_using`): `Começar a usar!` → `/home/`
- Analytics: `fz("cadastro","cadastro")`

---

## 5. AUTH — Onboarding / Termos (builder `X7` → `bl5`)

**Rota:** `/onboarding/register/terms` (mobile) · `/onboarding/register/termsWeb` (web link).

**Copy verbatim:**
- Header: `Termos de uso` (botão fechar → `/onboarding/login`)
- Viewer PDF embutido de `https://calcmed.com.br/files/terms.pdf` (link "abrir" → `eeF` abre o mesmo PDF externo)
- Checkbox: `Eu li e aceito os ` + link `Termos e Condições`
- Indicador de progresso: 3 dots (2º ativo)
- Botão continuar: hexágono + seta (`hexagon.png` + `arrow.svg`)

---

## 6. AUTH — Recuperar senha (copy em `B.cfK`, builder ~3.22M)

**Rota:** `/recover` (acessada via "Recuperar senha" no login).

**Copy verbatim (sequência):**
- Título: `Esqueceu sua senha?`
- Instrução (`u.oW`): `Insira seu email abaixo para enviarmos um link para redefinição de senha. Procure na caixa de Spam também.`
- Campo: `E-mail` — placeholder `user@gmail.com` — validação `Campo obrigatório`
- Botão: `Enviar E-mail`
- **Sucesso:** título `E-mail Enviado!` · corpo `Um link de recuperação foi enviado para {email}. Verifique sua caixa de entrada e também a pasta de spam.` · botão `OK`
- **Erro genérico:** título `Erro ao Enviar E-mail` · corpo `Não foi possível enviar o e-mail de recuperação. Verifique se o e-mail está correto e tente novamente.` · botão `Tentar Novamente`
- **Erro conta inexistente:** `u.gL` `Não encontramos uma conta com este e-mail.` + `u.dx` `Verifique se digitou corretamente ou cadastre-se.`

---

## 7. DRAWER / MENU lateral (mobile, builder `aGT`; web sidebar `ebh`)

**Propósito:** navegação global. Todo item dispara `fz(slug,"menu_lateral_drawer")`.

### Mobile drawer — ordem, ícone, rota, analytics (verbatim)
| # | Label (i18n / fallback) | Ícone | Rota / ação | analytics `lY` |
|---|---|---|---|---|
| 1 | `dashboard` (web-only) | `chart_line_up.svg` | `/dashboard/dashboardWeb` | — |
| 2 | `profile_title` (Perfil) | `user_circle.svg` | `/home/profile` | `perfil` |
| 3 | `benefits` (Minhas Vantagens) | `gift.svg` | `/benefits/` | `presenteie-um-amigo` |
| 4 | `calcmed_eletro_app_name` (CalcMed Eletro) | `calcmed_eletro.svg` | store externo (ver §9) | — |
| 5 | `notepad_title` (Notepad/Minhas Anotações) | `notepad.svg` | `/notepad/` | — |
| 6 | `contact_us` (Fale Conosco) | `suporte.svg` | `/first/contact-us` | `fale-conosco` |
| 7 | `Mensagens ao suporte` (web-only, literal) | — | `/support/` | — |
| 8 | `settings` (Configurações) | (settings) | `/settings/` | `configuracoes` |
| 9 | `about` (Sobre) | `info.svg` | `/home/about` | `sobre` |
| 10 | `logout` (Sair) | (logout) | confirm → logout | `sair` |
| rodapé | `Versão do app: {versão}` | — | — | — |

### Web sidebar (builder `ebh`) — itens
`Assinatura` (crown.svg) · `Blog` · `Fale Conosco` · `Sugestões` · `Loja` · `Parcerias` (trophy.svg) · `Presenteie um Amigo ` (gift.svg) · `Referências` · `Configurações` (settings.svg) · `Sair` (logout.svg).

### Logout (builder `bYo`/`bYe`)
- Dialog: título `Tem certeza que deseja sair?` · corpo `Você precisará fazer login novamente para acessar sua conta.`
- On confirm: analytics `sair`, limpa auth + push token, navega `/`.
- Erro: título `Erro ao fazer logout` · corpo `Não foi possível fazer logout. Tente novamente.` · botão `Voltar`.

---

## 8. SETTINGS / Configurações (web builder `anr`→`bjj`, rotas `/` + `/language`)

**Propósito:** preferências do usuário. Analytics `fz("configuracoes","configuracoes_web")`.

**Seções verbatim:**
- `NOTIFICAÇÕES` → toggle `Notificações via Aplicativo` + toggle `Newsletter`
- `CONTA` → `Editar Perfil` (→ `/home/profile`, analytics `perfil`) + `Encerrar Conta` (→ `/home/settings/delete`, analytics `encerrar-conta`)
- Aparência (mobile, i18n `settings_appearance`/`settings_light`/`settings_dark`): `APARÊNCIA` · `Claro` · `Escuro`
- Idioma: `Idioma` · `Português` / `Inglês` / `Espanhol`
- Rodapé: `Versão do app` + `Sobre` + `Termos de Uso` + `Política de Privacidade` + `Referências`

---

## 9. CalcMed Eletro — entrada/benefício (`/benefits/{id}/calcmed-eletro-1|2|3`)

**Propósito:** cross-sell do app B2B Eletro com recompensa de 30 moedas. Itens do menu/benefício abrem ou o fluxo de resgate ou o store.

### Card de benefício (lista de Vantagens)
- `assets/images/benefits/calcmed_eletro_logo.png`
- `calcmed_eletro_benefit_title` (`Benefício CalcMed`) · `calcmed_eletro_coins_amount` (`30 moedas`) · `calcmed_eletro_free` (`GRÁTIS`)
- Botão `calcmed_eletro_redeem_now` (`Resgatar Agora`)

### Passo 1 — `calcmed-eletro-1` (builder `Nn`)
- `calcmed_eletro_earn_coins` (`Ganhe 30 moedas na`) + `CalcMed Eletro`
- `calcmed_eletro_phone.png`
- `1º Passo` · `Baixe o App` (+ app name) · `tocando no botão a baixo:`
- Botão `Baixar agora` → abre `https://calcmedeletro.com.br/`
- Botão `Já baixei` → `/benefits/{id}/calcmed-eletro-2`

### Passo 2 — `calcmed-eletro-2` (builder `No`)
- `Ganhe 30 moedas na` + `CalcMed Eletro`
- `calcmed_eletro_web.png`
- `2º Passo` · `Após realizar o cadastro no` + `App, ` + `resgate seu benefício:`
- Botão `Resgatar benefício` / `Resgatar agora` → `/benefits/{id}/calcmed-eletro-3`

### Passo 3 — `calcmed-eletro-3` (builder `Np`) — geração do cupom
- Chama `UL(id)` (gera cupom de moedas).
- Erro id ausente: `ID do benefício não encontrado. Tente novamente.` / título `Erro`
- Cooldown 30 dias (`calcmed_eletro_redemption_limit`): `Ei! Você só pode resgatar suas moedas CalcMed Eletro a cada 30 dias. Seu último resgate foi em {date}. Fique de olho e aproveite! 😉`
- Erro carregar: `Erro ao carregar benefício`
- Erros de URL: `URL não disponível` · `Erro ao abrir link: ` (+ detalhe)

### Item de menu "CalcMed Eletro" (deep-link p/ store por plataforma)
- Android: `https://play.google.com/store/apps/details?id=com.youdevelop.appcalcmedeletro&hl=pt_BR`
- iOS: `https://apps.apple.com/br/app/calcmed-eletro/id6578433060`
- Web/outros: `https://calcmedeletro.com.br/`

---

## 10. SUPPORT / Contact-us / Suggestion

### Fale Conosco — `/first/contact-us` (builder `Ql`→`b68`; web `abY`→`b69`)
- Título `contact_us_title` (`Fale Conosco`)
- `contact_us_get_in_touch` (`Entrar em contato`)
- `Via E-mail` (`email.svg`) — checa app de e-mail, senão fallback
- `Via WhatsApp` (`whatsapp.svg`) → `https://api.whatsapp.com/send?phone=5511918733252&text=Ola,%20preciso%20de%20ajuda!` (`u.yL`)
- `Perguntas Frequentes:` (`contact_us_faq`) → accordion (FAQ em §15)
- Analytics web: `fz("contato","fale_conosco_web")`

### Sugestões — `/suggestion` (builder `WY`→`bkz`; web `aoo`→`bkA`)
- Título `suggestion_title` (`Sugestões`)
- Header `ENVIAR SUGESTÃO` (`suggestion_get_in_touch`)
- `Via E-mail` → `mailto:contato@calcmed.com.br` com `subject=Sugestão para CalcMed`
- `Via WhatsApp` → `https://api.whatsapp.com/send?phone=5511918733252&text=Olá,%20gostaria%20de%20enviar%20uma%20sugestão!` (`u.sc`)
- Analytics: `fz("sugestoes","sugestoes_web")`

### Support — `/support/` (builder `aY9`)
Rota web-only acessada por "Mensagens ao suporte". **[FLAG]** builder distinto do contact-us; provável canal de chat/mensagens (não consegui isolar copy própria — pode reutilizar o widget de FAQ/contato).

---

## 11. Sobre / Termos — `/home/about` (builder `MP`→`b25`)

- Título `about_title` (`Sobre`)
- `about_terms_of_use` (`Termos de Uso`) → PDF `https://calcmed.com.br/files/terms.pdf`
- `about_privacy_policy` (`Política de Privacidade`) → PDF `https://calcmed.com.br/files/policy.pdf`
- `about_references` (`Referências`) → `/references/` (analytics `referencias`)
- Analytics: `fz("info","about")`

---

## 12. References — `/references/` (builder `VH`→`bhE`)

- Título `references_title` (`Referências\nBibliográficas`)
- Grupo colapsável `references_adult` (`Referências Adulto`)
- Grupo colapsável `references_pediatrics` (`Referências Pediatra`)
- Cada grupo expande lista de referências carregada do backend (`nL`); itens selecionáveis (checkbox).

---

## 13. Notepad — `/notepad/` (builder `aQn`, copy em `B.cfK`)

- Títulos: `Notepad` · `Minhas Anotações`
- Vazio: `Nenhuma nota encontrada.` · `Adicione uma nova nota para começar.` · `Crie sua primeira nota!`
- Ação: `Adicionar nota` / `Nova Nota` · `Editar Nota` (campo `Título`)
- Persistência: `Salvar` · `Excluir`
- Toasts: `Nota salva com sucesso!` · `Erro ao salvar a nota.` · `Nota excluída com sucesso!` · `Erro ao excluir a nota.` · `Erro ao carregar notas` · `Erro desconhecido`
- Confirmar exclusão: `Confirmar exclusão` / `Tem certeza que deseja excluir esta nota?` / `Deseja realmente excluir esta nota?` (botões `Cancelar` · `Confirmar`)
- Guarda de saída: `Alterações não salvas` + `u.Ft` (`Você possui alterações não salvas. Deseja realmente sair sem salvar?`) → `Sair sem salvar` · `Cancelar`

---

## 14. Perfil / Encerrar conta (em `B.cfK` + builder `QH`→`b7q`)

**Perfil — "Dados de cadastro":** `Minha Conta` · `Dados de cadastro` · `Nome` · `E-mail` · `Informações de segurança` · `CPF` · `WhatsApp` · `Ocupação` · `Área de atuação` · `Selecione a ocupação` · `Selecione a área de atuação` · `Estado`/`Cidade` (`Selecione o estado`/`Selecione a cidade`/`Selecione um estado primeiro`, `u.cU`) · botão `Salvar Alterações`. Toasts: `Algo deu errado. Tente novamente.` · `Alterações salvas com sucesso.` · `CPF inválido.` · `Sucesso` · `Carregando...`

**Encerrar Conta — `/home/settings/delete` (builder `QH`→`b7q`):**
- Corpo: `Deseja mesmo encerrar sua conta?\nTodos os seus dados serão excluídos, incluindo seu acesso as calculadoras, suas preferências e favoritos.\n\nCaso queira acessar novamente, você precisará criar uma nova conta.`
- Botão: `Continuar`
- Se plano ativo: bloqueio título `Ops...` / corpo `Identificamos que você possui um plano ativo. Para que as cobranças do mesmo não continuem após o encerramento da conta, toque no botão abaixo e cancele sua assinatura.` / botão `Cancelar assinatura` → `/home/activePlan`
- Sucesso: título `Conta encerrada` / corpo `Estaremos aqui se precisar. Já estamos com saudades!` / botão `Sair` → `/onboarding/`

---

## 15. FAQ (accordion de Fale Conosco) — perguntas e respostas verbatim

| Pergunta | Resposta |
|---|---|
| `Existe um tutorial para uso do aplicativo?` (`u.Dh`) | `Sim. No aplicativo, na sessão "menu", disponibilizamos um tutorial para facilitar sua experiência com a CalcMed.` |
| `Quais as referências bibliográficas das informações?` (`u.yH`) | `Todas as calculadoras foram criadas baseadas em um fonte de literatura confiável, como UpToDate e Sanford. Na sessão "referências bibliográficas" você encontra todo material utilizado para criação de cada uma das calculadoras.` (`u.EH`) |
| `Como entro em contato com o suporte técnico?` (`u.eW`) | `No aplicativo, na sessão "fale conosco", você tem as opções de nos contactar por WhatsApp ou Email.` (`u.Aa`) |
| `Como mudar meu plano?` | `A Calcmed oferece opções de plano mensal ou anual. Para alterar seu plano, basta acessar no menu do aplicativo a sessão "assinatura".` (`u.F3`) |
| `Quais os diferenciais da CalcMed?` | `A CalcMed oferece de uma forma muito prática e intuitiva a prescrição pronta para diversas situações de urgência e emergência. Individualizada para o seu paciente.` (`u.u8`) |
| `Como acessar pelo computador?` | `Basta acessar app.calcmed.com.br` |
| `Quais são as formas de pagamento disponíveis?` (`u.vj`) | `Cartão de crédito e Pix.` |
| `Como retomar minha assinatura CalcMed?` | `Ao acessar a CalcMed com plano inativo surgirá uma tela em que você poderá escolher o novo plano.` (`u.eQ`) |
| `Estou com problema para contratar/renovar meu plano, o que fazer?` (`u.zh`) | `Entre em contato conosco pelo email: contato@calcmed.com.br\nOu na sessão "Fale Conosco".` (`u.sP`) |
| `Qual meu plano?` | `Para saber qual seu plano, basta acessar no menu do aplicativo a sessão "assinatura".` (`u.rM`) |
| `Como mudar a forma de pagamento?` | `Para alterar a forma de pagamento, basta acessar no menu do aplicativo a sessão "assinatura". Lá você encontrará a opção "alterar plano".` (`u.mV`) |
| `Fiz o cancelamento de minha assinatura, mas continuei sendo cobrado. O que fazer?` (`u.Az`) | `Antes de tudo, pedimos desculpas pelo transtorno. Para resolvermos entre em contato conosco pelo email: contato@calcmed.com.br\nOu na sessão "Fale Conosco" do aplicativo.` (`u.pW`) |
| `Como funciona a parceria com a calcmed?` | `Temos uma equipe especializada e motivada para atender e estudar formas de parcerias em prol do conhecimento médico. Entre em contato conosco pelo email: parceiros@calcmed.com.br` (`u.F6`) |

---

## 16. Blog & Partners & Loja (links externos / mailto)

- **Blog** — `/home/blog`: abre `https://calcmed.com.br/blog` no browser (analytics `blog`).
- **Loja** — abre `https://calcmed.com.br/loja` (analytics `loja`).
- **Parcerias** — `/home/partners` (builder `cgv`): título `Programa\nDe Parcerias`, botão `Quero fazer parceria` → `mailto:parceiros@calcmed.com.br` com subject `Tenho interesse no programa de parcerias!` (`u.cP`).

---

## 17. Location / Work-place (sub-fluxo do Passômetro — `/commitment/*`)

Router `bSx`: `/`, `/commitment-register`, `/color-selection`, `/location-selection`, `/location-register`, `/address-search`. Copy verbatim em `B.cfK`:
- `/ Selecione um Local` · `Criar Local de Trabalho` · `Nenhum local cadastrado` · `Toque em "Criar Local de Trabalho" para começar` · `Locais de trabalhos registrados` · `Remover associação`
- `Novo Local` / `/ Crie um novo local` · campos `Título` · `Hospital` · `Nome da Rua` · `Endereço completo` · `Rua` · `Número` · `Bairro` · `Cidade` · `Estado` · botão `Concluir`
- Validações: `Título é obrigatório` · `Endereço é obrigatório` · toasts `Local atualizado com sucesso!` / `Local criado com sucesso!` / `Erro ao salvar local. Tente novamente.`
- Cores (`/ Selecionar cor`): `Laranja` `Vermelho` `Azul` `Verde` `Magenta` `Indigo` `Rosa` `Roxo` `Verde-azulado` `Amarelo` `Marrom` `Personalizada`
- `/ Procurar endereço` · `Buscar endereço`

---

## 18. Paywall / Assinatura — copy não-clínica relevante (em `B.cfK`)

- Estados de plano: `Seu plano:` · `Ver planos disponíveis` · `Renovação:` · `Cancelar assinatura` · `Retomar Assinatura` · `Gerenciar assinatura` · `Assinatura cancelada` · `Sua assinatura expira em ` · `Sua assinatura expirou em ` · `Nenhum plano escolhido`
- Planos: `Plano Mensal` · `Plano Anual` · `Plano Anual Parcelado` · `Período Gratuito` · `Equivale a {price} R$/mês`
- Cancelamento (`u.j` confirm): `Tem certeza de que deseja cancelar a sua assinatura? Ao cancelar, você poderá usar sua conta até a data de renovação.` · sucesso `u.U` `Sua assinatura foi cancelada com sucesso. Você pode usar sua conta até a data de renovação.` · erro `u.e0` `Não foi possível cancelar sua assinatura. Tente novamente mais tarde.`
- **Upsell Premium (gate de feature):** `Ainda não é Premium?` · `O Premium libera tudo o que faz diferença no plantão.` · `✔ Doses e diluições prontas\n✔ Cetoacidose diabética (completa)\n✔ Intubação\n✔ Ajuste de Varfarina\n✔ Toda a Pediatria desbloqueada` · `Você vai sentir a diferença já no próximo plantão.` · botões `Continuar no Básico` / `Assinar Premium`
- Área de Vantagens (`u.kC`/`u.o1`): `Agora você conta com uma área exclusiva feita para quem usa a CalcMed.` / `Explore vantagens especiais pensadas para apoiar sua jornada profissional e oferecer recompensas exclusivas dentro e fora do app.` · vazio `Nenhum benefício disponível no momento.`

**Regra que libera Premium:** o gate aparece quando o usuário toca em feature premium (doses/diluições, CAD completa, intubação, varfarina, pediatria inteira). Conta gratuita = "Básico" (`✅ Calculadoras básicas / ✅ Conversores / ✅ Algumas funcionalidades de urgência`).

---

## ARQUÉTIPOS (padrões transversais)

1. **Tela de status/boot multi-estágio** — splash com 8 estados textuais + ícone por estado, decide rota (force-update vs home).
2. **Gate bloqueante full-screen** — force-update (não-dispensável, botão "Fechar App") e encerrar-conta-com-plano-ativo seguem o mesmo molde "ícone + título + corpo + card de dados + 2 botões + rodapé fino".
3. **Auth e-mail-first sem social login** — login/register só e-mail+senha; "social" = apenas links de redes (Facebook/Instagram/LinkedIn), nunca OAuth. Identifier-first NÃO está implementado nesta build (login pede e-mail+senha juntos).
4. **Fluxo wizard de N passos com dots** — onboarding/termos (3 dots) e Eletro (1º/2º/3º Passo) usam stepper linear com botão hexágono/seta ou "Já baixei/Resgatar".
5. **Item de menu = (ícone svg + label i18n + rota/ação + analytics slug)** — drawer e sidebar são listas declarativas; toda ação loga `fz/lY`. Itens web-only (Dashboard, Mensagens ao suporte) gated por flag.
6. **Canal de contato dual e-mail/WhatsApp** — contact-us e suggestion compartilham o par "Via E-mail (mailto com subject) + Via WhatsApp (link api.whatsapp pré-preenchido)". Números/subjects diferem por contexto.
7. **Conteúdo institucional via PDF/URL externa** — Termos, Política, Blog, Loja, parcerias e referências apontam para `calcmed.com.br/*` (PDF embutido ou browser), não telas nativas de conteúdo.
8. **Diálogo de confirmação destrutiva** — logout, excluir nota, encerrar conta, cancelar assinatura usam o mesmo molde título+corpo+2 botões (ação destrutiva + Cancelar/Voltar) com toasts de sucesso/erro padronizados.
9. **Guarda de "alterações não salvas"** — notepad/perfil interceptam saída com dialog `Alterações não salvas` → `Sair sem salvar`/`Cancelar`.
10. **Feature-gate premium contextual** — paywall não é tela de entrada; aparece ao tocar feature premium, com lista de bullets fixos (doses/CAD/intubação/varfarina/pediatria) e par "Continuar no Básico / Assinar Premium".
11. **i18n PT/EN/ES com fallback hard-coded em PT** — toda string passa por `A("chave")` com `?? "texto PT"`, e idioma é preferência em Configurações (não tela própria).
12. **Cross-sell B2B (Eletro) como "benefício gamificado"** — 30 moedas grátis a cada 30 dias, deep-link por plataforma p/ store, cupom gerado no passo 3.
