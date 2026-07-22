# App-wide 07 — Modelo de dados/conteúdo + inventário do shell (não-clínico)

> Fonte: `CalcMed Urgencia/pediatria-as-is/_source/main.decoded.js` (bundle Flutter **dart2js** desofuscado, ~11 MB). 
> Escopo deste doc: **PARTE 1 — modelo de dados de conteúdo** (o esqueleto que o backend do Gui precisa servir) + **PARTE 2 — inventário das telas não-clínicas (shell)**. NÃO repete pediatria (já auditada em raw/01-05) nem cataloga as features clínicas adultas (esse é o domínio dos outros agentes).
>
> ⚠️ **Natureza do bundle:** é Flutter/dart2js, NÃO um webpack JS app. Os "construtores A.cr/A.bH" do briefing são classes minificadas Dart. Achei os modelos pelos métodos `co` (= `toJson`, `A.D(["chave",valor,...])`) e pelas factories `fromJson` (`q.i(0,"chave")`). As **chaves de string** (`"name"`, `"route"`, `"equations"`) são literais reais do contrato JSON — é o que o backend serializa. Reproduzi-as **exatas**, incluindo os typos load-bearing (`aditionalTexts`, `biggerThen`) que a memória do cérebro já registrava.
>
> ⚠️ **Onde mora o conteúdo clínico:** o bundle traz o **shell + os modelos + o roteamento**, mas o **conteúdo das calculadoras/drogas/condutas é servido pela API** (Firebase/Supabase), não hard-coded. As exceções hard-coded são poucos protocolos especiais (CAD, hipocalemia) embutidos como árvore de `content` widgets. Logo: o que documento aqui é o **schema do contrato**, fiel; valores de doses/fórmulas individuais vêm do banco e foram auditados pelos outros agentes a partir do conteúdo, não do shell.

---

## PARTE 1 — MODELO DE DADOS DE CONTEÚDO (o mais importante)

### 1.1 Visão geral da árvore de conteúdo

O conteúdo do app é uma árvore de 3 níveis para as **calculadoras/equações** + uma família paralela para **escores**:

```
Category (A.cr)               ← "/equation/category/<slug-da-route>"
 ├── equations[]  (A.bH)      ← item/leaf navegável (nome + route própria)
 │     └── equations[]        ← recursivo: uma leaf pode ter sub-equações (fórmulas)
 │     └── fromPediatra (bool)← marca itens herdados do lado pediátrico
 └── subcategories[] (A.bH)   ← agrupador intermediário

Equation/Formula payload (A.xl)  ← o "motor" de cálculo de uma equação
 ├── select[]    (A.Ah)   ← campos de seleção (dropdown/radio) name/value/isInteger
 ├── inputs{}    (map)    ← campos numéricos de entrada (chave→config)
 ├── make[]      (A.xM)   ← passos/regras de cálculo (int/end/result/isMl)
 ├── type
 └── reference            ← texto de referência bibliográfica

Score (A.amM raiz / modelo de escore)   ← "/equation/score-categories/"
 ├── name, category, id
 ├── questions[]      (A.nV)   id/name/type/options
 │     └── options[]  (A.lK)   id/name/points
 ├── result          (A.amM)   meaningTitle + variations[]
 │     └── variations[] (A.nW) id/title/meaning/biggerThen  ← faixa por pontuação
 └── aditionalTexts[] (A.pF)   id/title/description   ← textos extras (typo proposital)
```

### 1.2 `Category` — modelo `A.cr` (categoria de calculadora)

**toJson (`co`, offset ~4327817):**
```js
A.D(["name", a, "id", b, "equations", [...], "subcategories", [...]])
```
**fromJson (factory `bI0`, offset ~4328000) — lê MAIS campos do que o toJson emite:**
```js
route = json["route"] ?? ""
name  = json["name"]  ?? ""
id    = json["id"]    ?? ""
icon  = json["icon"]  ?? ""
equations = []        // populadas separadamente
subcategories = []
```

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string | id do banco |
| `name` | string | rótulo exibido |
| `route` | string | **slug da rota** → `"/equation/category/<route>"` (ex.: `intubacao`, `drogas-vasoativas`, `imc`) |
| `icon` | string | nome/asset do ícone |
| `equations[]` | `A.bH[]` | itens navegáveis |
| `subcategories[]` | `A.bH[]` | agrupadores |
| (slots extras na classe) | — | a classe `A.cr` tem ~15 slots; `premium`/flags moram na **assinatura do usuário** (ver §1.7), não na categoria. |

### 1.3 `Equation item` — modelo `A.bH` (leaf navegável / item de calculadora)

**toJson (`co`, offset ~4330856):**
```js
A.D(["name", a, "id", c, "route", d,
     "equations", [...recursivo...],
     "fromPediatra", x])
```

| Campo | Tipo | Observação |
|---|---|---|
| `name` | string | rótulo do item |
| `id` | string | id do banco |
| `route` | string | rota própria do item |
| `equations[]` | `A.bH[]` | **recursivo** — um item pode conter sub-itens/fórmulas |
| `fromPediatra` | bool | **flag load-bearing**: marca conteúdo que veio do lado pediátrico reaproveitado no adulto (e vice-versa). É o único discriminador adulto-vs-pediatria no item. |

### 1.4 `Formula payload` — modelo `A.xl` (motor de cálculo) ⭐

Este é o coração das calculadoras-fórmula. **toJson (`co`, offset ~4328783):**
```js
A.D(["select",  [ {name, value, isInteger},... ],   // A.Ah
     "inputs",  { <chave>: <config>,... },            // mapa nome→input
     "make",    [ {int, end, result, isMl},... ],     // A.xM = passos
     "type",    <enum>,
     "reference", <string>])
```

- **`select[]`** (`A.Ah`: `{name, value, isInteger}`) — opções de um seletor (ex.: via de administração, apresentação). `value` numérico, `isInteger` controla formatação.
- **`inputs{}`** — campos numéricos digitados (peso, dose desejada, clearance…). Mapa chave→config.
- **`make[]`** (`A.xM`: `{int, end, result, isMl}`) — **passos/regras de cálculo**. `int` (início), `end` (fim/limite), `result` (numérico, default 0), `isMl` (bool — se o resultado é volume em mL). É assim que o app modela "se valor entre X e Y → resultado Z" (faixas) e conversões.
- **`type`** — discriminador do tipo de equação.
- **`reference`** — string de referência bibliográfica exibida no rodapé da calc.

> ⚠️ Incerteza honesta: a semântica exata de `int`/`end` em `make` (faixa numérica vs. interpolação) está ofuscada; a estrutura observada é faixa→resultado. Doses específicas não estão aqui — vêm do banco.

### 1.5 `Score` — modelo de escore por pontos ⭐

Tela-mãe: `"/equation/score-categories/"`. **toJson do escore (offset ~3308522):**
```js
A.D(["name", a, "category", c, "id", b,
     "aditionalTexts", [ {id,title,description},... ],   // A.pF  (typo: "aditional")
     "result", { meaningTitle, variations:[...] },        // A.amM
     "questions", [ {id,name,type,options:[...]},... ]])  // A.nV
```

**Question (`A.nV`):**
```js
A.D(["id", a, "name", b, "type", <enum>, "options", [ {id,name,points},... ]])
```

**Question type enum** (mapeadores `f6D`/`f6E`/`f6F`, offset ~385344):
| valor JSON | UI | label PT |
|---|---|---|
| `single-choice` | radio vertical | "Escolha única" |
| `multiple-choice` | checkbox | "Múltipla escolha" |
| `horizontal-single-choice` | radio horizontal | (label PT 3º case) |

**Option (`A.lK`):** `{id, name, points}` — `points` int (default 0). Pontuação somada.

**Result/variation (`A.amM` + `A.nW`):**
```js
result  = { "meaningTitle": <string>, "variations": [... ] }
variation = { "id":..., "title":..., "meaning":..., "biggerThen": <int> }
```
- `biggerThen` (**typo proposital de "biggerThan"**, default 0) — limiar de pontuação: a variação se aplica quando a soma dos pontos é **maior que** esse valor. É como o escore mapeia faixa de pontos → interpretação (`meaning`/`title`).

**aditionalText (`A.pF`):** `{id, title, description}` — blocos de texto livre anexados ao escore (notas, fórmula, fonte). Typo `aditional` é o nome real do campo.

### 1.6 Protocolos / condutas embutidos (hard-coded, exceção)

Poucos protocolos têm a árvore de **conteúdo** embutida no shell como widgets `{id, title, content}` em vez de vir do banco — vistos no bundle:
- **CAD** (cetoacidose): 8 passos (`"Critérios Diagnóstico"`, `"Manejo Inicial"`, `"Após o Diagnóstico"`, `"Antes da Insulina"`, `"Após avaliar o Potássio"`, `"Reavaliação da CAD"`, `"Correção da CAD"`, `"Após correção da CAD"`) — offset ~567177.
- **Distúrbio de potássio**: 3 faixas (`"K⁺ < 3,5"`, `"K⁺ 3,5 a 5"`, `"K⁺ > 5"`) — offset ~4480607.
- Bloco insulina prévia/primeira descompensação — offset ~4484856.

Arquétipo: `[{id, title, content:Widget}]` — **conteúdo clínico como árvore de seções acordeão**, não como dados. Para o backend do Gui, valeria normalizar isso para o mesmo schema de `Protocol` (abaixo).

### 1.7 Premium / gating (assinatura) — modelo `A.zl`

Gating NÃO está no conteúdo; está no **estado de assinatura do usuário**:
```js
A.D(["premium", <bool>, "expirationDate", <date>])   // A.zl, offsets 545473 / 4327561
```
- `premium: bool` + `expirationDate`. O app decide livre-vs-gated comparando esse estado, não um flag por calculadora. **Implicação p/ schema:** se o backend quiser gating por conteúdo, precisa adicionar um campo (`isPremium`/`accessLevel`) que **hoje não existe** no modelo de Category/Equation.

**Plano (`A.cw?`, offset ~5580933):** `{id, name, value, interval}` com `interval ∈ {"month"→"Plano Mensal", "year"→"Plano Anual"}`.

### 1.8 Outros modelos persistidos (não-conteúdo, mas relevantes ao backend)

| Modelo | Chaves principais (offset) | Uso |
|---|---|---|
| **User** | `id, isAdmin, name, email, photoUrl, createdAt, provider, usertype, acceptedTerms, city, state, cpf, whatsapp, whatsappIsoCode, ocupation, work, plan` (3206067) | perfil/conta |
| **Patient** | `id, name, name_initials, age, age_type, background, diagnostic_impression, atb, dva, exams, pending_issues, observation, folder_id, dih, devices, index, ai_analysis_result, created_at, last_edited_at` (4138581) | anotações de paciente |
| **Patient folder** | `id, name, created_at, deleted_at, last_edited_at, number_of_patients` (4137864) | pastas de pacientes (com soft-delete) |
| **PCR session** | `id, patient_id, start_time, end_time, last_cycle, compressions_count, epinephrine_count, defibrillator_count, first/last_compression_time, first/last_epinephrine_time` (4518355) | Modo PCR |
| **Banner** | `id, open, title, body, internalUrl, externalUrl, buttonTitle, imageUrl, createdAt` (2685155) | banners (bate com o Admin de Banners do cérebro) |
| **Notification (scheduled)** | `id, title, body, tags, scheduledDateTime, cronExpression, isRecurring, priority, status, errorMessage, retries, maxRetries, createdAt` (2831444) | push agendado |
| **Dilution calc (local)** | `id, name, weight, drugPresentation, drugPresentationUnit, desiredDose, desiredDoseUnit, drugVolume, diluentVolume, targetConcentrationSolution, type` (5115217) | calculadora de diluição salva |
| **"My solutions" calc (local)** | `id, name, concentrationAmpola, mlAmpola, qtAmpola, qtSoroMl, createdAt` (4120832) | soluções personalizadas (rota `my-solutions`) |
| **Stripe Customer / PaymentMethod / Subscription** | (5579611, 5579932, 8587608…) | pagamentos |

### 1.9 SCHEMA JSON UNIFICADO PROPOSTO (para o backend do Gui)

Esqueleto único que cobre todos os tipos de conteúdo, normalizando os 4 arquétipos num envelope comum. Mantive os nomes de campo **existentes** quando havia (`route`, `equations`, `fromPediatra`) e **corrigi os typos** propondo aliases de compat.

```jsonc
// ---- Envelope comum de qualquer item de conteúdo ----
{
  "id": "string",
  "type": "category | equation | score | protocol | drug | converter | reference-table | tool",
  "name": "string",
  "route": "string",                  // slug → /equation/category/<route>
  "icon": "string|null",
  "fromPediatra": false,              // discriminador adulto<->pediatria (manter o nome real)
  "access": { "level": "free | premium" },  // NOVO: gating hoje inexistente no conteúdo
  "order": 0,
  "children": [ /* ids ou objetos: equations[] + subcategories[] unificados */ ],

  // ---- payload polimórfico por type ----
  "equation": {                       // type == equation/converter/tool
    "inputs":  { "<key>": { "label":"", "unit":"", "isInteger":false } },
    "select":  [ { "id":"", "name":"", "value":0, "isInteger":false } ],
    "steps":   [ { "from":0, "to":0, "result":0, "isMl":false } ],  // ex-"make": int/end/result/isMl
    "formula": "string-literal-ou-expr",   // NOVO: fórmula textual auditável
    "reference": "string"
  },

  "score": {                          // type == score
    "questions": [
      { "id":"", "name":"",
        "questionType": "single-choice | multiple-choice | horizontal-single-choice",
        "options": [ { "id":"", "name":"", "points":0 } ] }
    ],
    "result": {
      "meaningTitle": "",
      "variations": [
        { "id":"", "title":"", "meaning":"", "minPoints": 0 }  // ex-"biggerThen" (>, default 0)
      ]
    },
    "additionalTexts": [ { "id":"", "title":"", "description":"" } ]  // ex-"aditionalTexts"
  },

  "protocol": {                       // type == protocol (CAD, potássio…) — normalizar os hard-coded
    "sections": [ { "id":"", "title":"", "body": "richtext/markdown" } ]
  }
}
```

> Notas de migração para o Gui:
> 1. **`equations[]` + `subcategories[]` → `children[]`** com `type` discriminando (hoje são listas separadas por motivo histórico).
> 2. **`fromPediatra`** deve sobreviver — é o único elo adulto/pediatria.
> 3. **Gating de conteúdo não existe** no schema atual (só na assinatura). Adicionar `access.level` se o produto quiser calc premium individual.
> 4. **Corrigir typos** (`aditionalTexts`→`additionalTexts`, `biggerThen`→`minPoints`) só com camada de compat, porque o app legado lê os nomes errados.
> 5. **`make`/`steps`** modela faixas (`from`–`to`→`result`). Para auditabilidade clínica, adicionar `formula` textual ao lado.

---

## PARTE 2 — INVENTÁRIO DO SHELL (telas não-clínicas)

Uma linha cada. Rotas confirmadas no registro de rotas do bundle (offsets 2676795–3290101).

| Tela / feature | Rota | 1-linha |
|---|---|---|
| **Splash** | `/splash` | tela inicial de carregamento/boot do app. |
| **Force update** | `/force-update` | bloqueio de versão obsoleta forçando atualização. |
| **Onboarding** | `/onboarding` | introdução pós-cadastro (apresentação do app). |
| **Quiz** | `/quiz` | questionário de perfilamento do usuário no onboarding. |
| **Login** | `/login` | autenticação (e-mail/senha + provider/social). |
| **Register** | `/register` | cadastro de conta. |
| **Recover** | `/recover` | recuperação de senha. |
| **Home** | `/home` | hub principal com acesso às categorias, banners e atalhos. |
| **Commitment** | `/commitment`, `/commitment-register` | "compromisso" de uso/meta — feature de engajamento (hábito). |
| **Benefits** | `/benefits`, `/benefits-management` | catálogo de benefícios/parcerias resgatáveis. |
| **Ranking** | (`/specificDataRanking` no admin; tela in-app) | ranking/gamificação entre usuários. |
| **Achievements / Conquistas** | (in-app) | conquistas/badges por uso. |
| **Store** | `/store` | loja (planos/itens) dentro do app. |
| **Subscription / Checkout** | `/redirectToCheckout`, `/store` | assinatura premium (Stripe) — mensal/anual. |
| **References / Referências** | (in-app) | bibliografia/fontes das calculadoras. |
| **Notepad / Anotações** | `/new` (paciente) | bloco de anotações + pacientes/pastas (modelo Patient/Folder §1.8). |
| **Profile** | (in-app via Settings) | dados do usuário (nome, ocupação, cidade, CPF, whatsapp). |
| **Settings** | `/settings`, `/language` | preferências, idioma, gerenciar notificações, conta. |
| **Contact / Support** | `/contact-us`, `/suggestion`, `/support` | fale conosco, sugestões, suporte. |
| **Delete account** | `/delete` | exclusão de conta (LGPD). |
| **Location** | `/location-selection`, `/location-register`, `/address-search` | seleção/cadastro de localidade (usado em benefícios/ranking regional). |
| **Drawer / Menu** | (componente) | menu lateral de navegação do app. |
| **Eletro cross-links** | `/calcmed-eletro-2`, `/calcmed-eletro-3` | links para o produto B2B Eletro. |
| **Admin web** | `/dashboardWeb`, `/generalData`, `/manageNotifications`, `/manageCoupons`, `/specificDataPlan`, `/specificDataUsers`, `/specificDataRanking`, `/report`, `/quiz-management`, `/banners-management`, `/benefits-management`, `/users`, `/dashboard`, `/report` | painel administrativo embutido (notificações, cupons, planos, usuários, ranking, relatórios, quiz, banners, benefícios). |

> Observação: **Gift** não aparece como rota/símbolo (0 hits) — não há feature de "presente/gift" neste bundle. **Streak** também 0 (engajamento é via Commitment + Achievements + Ranking, não streak nomeado).

---

## PADRÕES (arquétipos de modelo observados)

1. **Árvore de catálogo recursiva** — `Category → equations[]/subcategories[] → equations[]` (`A.cr`/`A.bH`). Navegação dirigida por `route` (slug). Reaproveitamento cross-domínio via `fromPediatra`.
2. **Equação-motor declarativa** (`A.xl`) — calculadora = dados (`inputs` + `select` + `make` faixas/regras + `reference`), não código. O app interpreta `make[]` (`int/end/result/isMl`) como faixas→resultado. É o arquétipo "calculadora-fórmula-por-regras".
3. **Escore-por-pontos** (`A.nV`+`A.lK`+`A.nW`) — perguntas (3 tipos de UI) → opções com `points` → soma → `variations[]` por limiar `biggerThen`. Arquétipo "escore-soma-faixa".
4. **Protocolo-acordeão hard-coded** (CAD, potássio) — `[{id,title,content}]` como seções; conteúdo clínico embutido no shell, fora do banco. Candidato a normalização.
5. **Envelope toJson/fromJson assimétrico** — `co` (toJson) frequentemente emite MENOS campos do que `fromJson` lê (ex.: Category emite 4, lê 6 incl. `route`/`icon`). Ao desenhar o backend, confiar no **superset do fromJson**, não no toJson.
6. **Gating por assinatura, não por conteúdo** (`A.zl` `{premium, expirationDate}`) — não há flag premium por calculadora; o paywall é global. Schema atual não suporta calc-premium individual.
7. **Typos load-bearing no contrato** (`aditionalTexts`, `biggerThen`, `ocupation`) — nomes de campo errados são o contrato real; migração exige camada de compat.
8. **Soft-delete + auditoria temporal** nos dados de usuário (`created_at/last_edited_at/deleted_at`) — padrão consistente em Patient/Folder.
