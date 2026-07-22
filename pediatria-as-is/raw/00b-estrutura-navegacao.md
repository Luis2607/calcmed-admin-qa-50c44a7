# Pediatria — Estrutura, Navegação e Padrões Transversais (AS-IS)

> Fonte: bundle Flutter web decodificado `_source/main.decoded.js` + `raw/_route-tree.txt`.
> Escopo deste doc: **arquitetura de navegação e padrões de tela** (não o conteúdo clínico droga-a-droga, que é de outros agentes).
> Tudo verbatim do bundle. Onde o app calcula a partir de peso/idade, marcado como `[valor calculado]` com o template literal ao redor.

---

## 1. TOGGLE Pediatria — como se entra no modo pediátrico

**Não é um toggle de estado na home adulta. É uma ROTA própria.**

- Registro de rota (route registry, byte ~3.246M):
  ```
  A.ib(a,"/pediatra",A.a([new A.x2("/")],s),new A.aRQ,r)
  ```
  `/pediatra` é uma rota top-level irmã de `/home`, `/equation`, `/dashboard`, `/settings`, `/store`, `/quiz`. O builder da home pediátrica é `aRQ`.
- O item de entrada é **"Pediatria"** na sidebar/menu global (string canônica na tabela i18n, posição entre `"CalcMed Eletro"` e `"Passômetro"`). Tocar nele navega para `/pediatra`.
- Cada item pediátrico carrega uma **flag `fromPediatra`** no seu modelo de rota (`bH`), serializada no objeto da equação:
  ```
  A.D(["name",..,"id",..,"route",..,"equations",..,"fromPediatra",this.x],t.N,t.z)
  ```
- No **desktop/web**, o contexto pediátrico é detectado por:
  ```
  s = b.ok || B.j.v(a1.a,"Pediatria") || B.j.bg(a1.e,"/pediatra/")
  ```
  ou seja: nome contém "Pediatria" **OU** a rota começa com `/pediatra/`.

**FLAG (incerteza):** não encontrei um booleano persistido tipo `isPediatraMode` em storage. O "modo" é **derivado da rota atual** (`/pediatra/...`) e da flag `fromPediatra` por item, não um estado global salvo. A home pediátrica é uma tela inteira separada, não uma variação visual da home adulta.

---

## 2. HOME pediátrica — ordem e rótulos das seções

A home (`/pediatra`) é uma lista vertical de blocos. Confirmando contra a tabela i18n canônica (byte ~10.307M) e o route-tree, a composição é:

| # | Bloco | Rótulo verbatim no bundle | Observação |
|---|---|---|---|
| 1 | **Carrossel / Banners** | (banner_quiz.png + banners dinâmicos) | Widget `Cv` → carrossel `aCc` com dots; toca abre `/quiz/` ou URL externa. |
| 2 | **Passômetro** | `"Passômetro"` | Mesmo widget do app adulto (escala de plantões). |
| 3 | **Busca** | `"O que você precisa hoje?"` | Campo de pesquisa (ver §6). |
| 4 | **Sintomáticos** | `"Sintomáticos"` | Grupo de categorias por-droga (antitérmicos, AINE, antieméticos, etc.). |
| 5 | **Antibióticos** | `"Antibióticos Pediatria"` | Categoria por-droga. |
| 6 | **Urgências** | (categorias listadas abaixo) | Diarreia, Asma, Convulsão, Anafilaxia, Hipoglicemia, Bradi/Taqui, PCR, Intubação, etc. |
| 7 | **Diluições e Doses** | `"Diluições e Doses"` / Drogas Vasoativas / Soluções Personalizadas | Inclui "Drogas Vasoativas Pediatria" e "Soluções Personalizadas Pediatria". |
| 8 | **Calculadoras Médicas** | `"Calculadoras Médicas"` | Clearance, Taxa de Infusão, Superfície Corporal. |
| 9 | **Conversores** | `"Conversores"` / `"Conversor"` | Família `/equation/category/conversor-*` + `/pediatra/conversor/mLh-mcgKgMin`. |
| 10 | **Informações** | `"Informações"` | Sinais Vitais Normais. |
| 11 | **Plantão** | `"Plantão"` | Atalho ao módulo de plantões. |

**Rótulos verbatim do bloco de categorias (i18n, em ordem de declaração):**
```
"Antibióticos Pediatria", "Antitérmicos e Analgésicos", "Anti-inflamatórios",
"Antieméticos", "Antihistamínicos", "Broncodilatadores", "Antiespasmódico",
"Antidiarreicos", "Laxativos", "Corticoides", "Diarreia na Criança",
"Exacerbação de Asma", "Crise Convulsiva Pediatria", "Anafilaxia",
"Hipoglicemia Pediatria", "Bradicardia", "Taquicardia", "PCR",
"Intubação Pediatria", "Drogas Vasoativas Pediatria",
"Soluções Personalizadas Pediatria", "Novo", "Acessar",
"Clearance de Creatinina", "Taxa de Infusão mL/h ou gts/min",
"Superfície Corporal", "Sinais Vitais Normais"
```

**FLAG (ordem):** os rótulos acima estão na ordem de *declaração na tabela de strings*, que é a ordem mais provável de render, mas **a agregação visual em blocos nomeados (Sintomáticos vs Urgências vs Calculadoras) é feita por agrupamento de `category` no código de montagem**, não por uma lista linear única. A ordem dos 11 blocos (tabela acima) está confirmada pelo cluster i18n e pelo route-tree; a alocação exata de cada categoria a cada bloco deve ser validada visualmente (alta confiança, não 100% byte-exata).

---

## 3. PADRÕES DE TELA

### Header / AppBar (transversal — todas as telas pediátricas)
Construído por `A.bf(scaffoldKey, "<Título>",...)` dentro de `A.b7(...)`. Ex. da tela Sintomáticos:
```
A.b7(A.bf(s,"Sintomáticos",new A.bk(r,s),...,r.a,!0,s,!1,!1,!1,!0),...)
```
- Título = nome da categoria.
- Botão voltar implícito (navegação push).
- No **web/desktop**, em vez de título simples há **breadcrumb**: `pediatrics + " > " + <categoria>` (montado em `ddL`). Ex.: "Pediatria > Antibióticos".

### Tile da home (widget `MZ`)
Cada card de categoria na home:
- Ícone (SVG em `assets/icons/categories/*.svg`, ex. `capsule.svg`) + nome.
- Badge **"Em breve"** se a categoria não tem itens: `if(j.e.length===0)... A.h("Em breve",...)`.
- Badge **"Novo"** (widget `btX`) quando `j.y && GS(...)` — pílula com fundo destacado.
- Badge **"Premium"** + tap → paywall quando sem acesso (ver §4).

### (a) Categoria → Lista de drogas (categorias COM rota por-droga)
Ex.: Antibióticos, Antitérmicos, AINE, Antieméticos, Broncodilatadores, Corticoides, Laxativos, Antiespasmódico, PCR.
- Tela = lista vertical de itens; cada item navega para `/pediatra/<categoria>/<droga>` (push: `o.y.eM(...)` / `d5(route)`).
- Itens favoritáveis individualmente (estrela — ver §5).
- Header com nome da categoria.

### (b) Calculadora de dose por peso
Padrão visto na Intubação/IOT e drogas individuais:
- Input **"Peso"** com sufixo **"kg"** (`intubacao_peso` / `intubacao_kg`).
- Blocos de resultado por classe (Analgesia / Sedação / Bloqueador Neuromuscular).
- Por droga: apresentação verbatim + **"Dose usual..."** + linha de prescrição com **valores calculados**. Template literal típico:
  ```
  "Fentanil (50 mcg/mL) " [valor calculado] " mL + " [valor calculado] " mL SF 0,9% EV em BIC a " [valor calculado] " mL/h"
  ```
  ```
  "Faça " [valor calculado] " mL a " [valor calculado] " mL EV em bolus."
  ```
- Os `[valor calculado]` saem de `B.e.t(a.a*<fator>/<concentração>, <casas>)` onde `a.a` = peso.

### (c) Protocolo / fluxo multi-step
Ex.: Crise de Asma (`/pediatra/crise-asma` → `/grave`, `/leve-moderada`), PCR, Diarreia, Anafilaxia, Hipoglicemia, Convulsão.
- Tela de entrada com sub-rotas (gravidade/ritmo).
- Conteúdo em **acordeões** (`fQ` / `j5`): cabeçalho `A.c2(...)`, linhas de texto `A.H(...)`, valores calculados `A.a0(<expr>,...)`, separadores `A.cp`/`A.c4`, rodapé `A.b4(...)`.
- PCR pediátrico tem seu próprio ecossistema (cargas/doses, adrenalina, amiodarona, lidocaína, sulfato de magnésio, carga-choque) — ver sub-cérebro Modo PCR.

### (d) Calculadora de diluição — "Monte sua solução"
Padrão das Drogas Vasoativas / BNM em infusão (`/pediatra/drogas-vasoativas`, `/custom-solutions`).
- Bloco **"Solução padrão"** (preset) no topo + opção **"Monte sua solução:"** (`generic_monte_sua_solucao`).
- Campos: **"Nº de ampolas"** (`generic_num_ampolas`), **"mL de soro"** (`generic_ml_soro`), exibe **"Concentração [valor] mg/mL"** (`generic_concentracao` + `generic_mg_ml`).
- **"Defina a dose"** (`generic_defina_dose`) com unidade (ex. `mcg/kg/min`, `mg/kg/h`).
- Resultado: linha de prescrição com volume/vazão calculados.
- **Soluções Personalizadas** (`/pediatra/custom-solutions/`) tem 3 sub-tipos: **Oral** (`/oral/new`), **Por Vazão** (`/flow-rate`), **Por Volume** (`/volume`). Chooser modal com título **"Escolha:"** → opções **"Solução Oral" / "Cálculo por Vazão" / "Cálculo por Volume"**. Empty state: **"Personalize e salve as soluções que você mais usa aqui"** / **"Vamos começar do zero?"**. Itens salvos podem ser editados/excluídos.

### (e) Conversor
Telas `/pediatra/conversor/mLh-mcgKgMin` + família `/equation/category/conversor-*` (corticoides, mcg↔mL/h, mcg/min↔mL/h, mL/h↔gts/min, mL/h↔mcg, mL/h↔mcg/min, %↔mg/mL).
Anatomia (widget `b4y`/`d9W`):
- Label **"De:"** + dropdown de unidade origem (`A.hO(...)`).
- Input **"Valor"** + sufixo da unidade (ex. "mg").
- Label **"Para:"** + dropdown de unidade destino.
- Chip de resultado: **"Resultado: [valor calculado] mg"** (`A.aoY("Resultado: ", B.e.t(g.gn5(0),2), " mg")`), recalcula a cada mudança.

### (f) Tabela de referência
Ex.: Sinais Vitais Normais (`/pediatra/informations/sinais-vitais-normais`), tabelas de antibiótico por indicação.
- Acordeões por faixa etária / indicação: cabeçalhos **"Recém-nascido"**, **"Lactente"**, **"Crianças e Lactentes"**, ou por indicação ("Infecções do SNC", "Meningite", etc.).
- Linhas montadas com `A.c2` (título da indicação), `A.cp`, `A.H` (rótulo), `A.a0` (valor, possivelmente calculado por peso), `A.lL`/`A.m7` (subtítulos).

---

## 4. PREMIUM / ASSINATURA — o que é gated e como

Controlador de plano: `_ActivePlanControllerBase` / `Fa`. Métodos-chave (byte ~4.359M):
- `gBz` = **isPremium**. `true` se admin (`gMm`), ou `ch==="premium"`, ou assinatura em `active`/`grace_period`/`expired?não`.
- `gSM` = **isFree** (`ch === "free"`).
- `GS(a,b)` = **canAccessCategory(category, subcategory)** — a regra do paywall.
- `R9(a,b)` = canAccessSubcategory.

**Regra de acesso no plano FREE** (verbatim da lógica `GS`):
```
GS(a,b){
  if(this.gBz) return true;                 // premium libera tudo
  if(this.gSM){
    if(this.bn5(a,b)) return true;            // categorias sempre-livres (listas B.bFV / B.a7c)
    if(a==="1" && b!=null){
      if(B.j.v(b,"mL/h")||B.j.v(b,"mcg")||B.j.v(b,"gts/min")||B.j.v(b,"%")||B.j.v(b,"Corticóides")) return true;
      if(b==="emergency_anafilaxia"||b==="emergency_hipoglicemia"||b==="emergency_enxaqueca") return true;
    }
  }
  return false;
}
```
Descrição do plano FREE (verbatim, `gbp8`):
> "Acesso a conversores, dividir descanso, anafilaxia, hipoglicemia, enxaqueca e corticoides pediátricos"

Labels de plano (`gbp9`): **"GRATUITO"**, **"PREMIUM"**, **"ADMINISTRADOR"**.

**O que fica gated na Pediatria (plano free):** praticamente toda a Pediatria de doses/diluições/antibióticos/sintomáticos. **Livre no free:** Conversores, Anafilaxia, Hipoglicemia, Corticoides pediátricos (e Enxaqueca, Dividir Descanso — não exclusivos da pediatria). Confirmado pela copy de upsell: **"✔ Toda a Pediatria desbloqueada"** no card Premium.

**Como o bloqueio aparece:**
- **Tile / item da home**: quando `!GS(category, drug)`, o tap chama `A.wR(context)` (abre paywall) via `btW: $0{A.wR(this.a)}`. No web, o item ganha um chip **"Premium"** com ícone de cadeado (`B.kq`).
- **Lista de conversores/itens** (widget `djG`): nome recebe sufixo dinâmico — `r = a.a; r = o.e.gBz ? r : r + " (Premium)"` — e o tap, se `!gBz`, chama `A.wR(s)` em vez de navegar (`djD`).
- **Card de upsell "Ainda não é Premium?"** (byte ~10.314M), copy verbatim:
  ```
  "Ainda não é Premium?"
  "O Premium libera tudo o que faz diferença no plantão."
  "✔ Doses e diluições prontas\n✔ Cetoacidose diabética (completa)\n✔ Intubação\n✔ Ajuste de Varfarina\n✔ Toda a Pediatria desbloqueada"
  "Você vai sentir a diferença já no próximo plantão."
  [Continuar no Básico] [Assinar Premium]
  ```
- Planos: **"Plano Mensal" / "Plano Anual" / "Plano Anual Parcelado" / "Período Gratuito"**, com **"Equivale a {price} R$/mês"**.

**FLAG:** o argumento `a` em `GS` é a **categoria como string-id** (no free, o ramo `a==="1"` cobre conversores/corticoides); a semântica exata de `"1"` (provável id da seção/coleção de conversores+corticoides) não está 100% explicitada no bundle — validar com produto/banco.

---

## 5. FAVORITAR

Persistência local (controlador `IQ`, byte ~2.697M), via store `B.f5` (chave-valor):
- **`"favorites"`** — drogas/itens favoritados (JSON serializado: `B.a9.hf([...])`).
- **`"favorites-category"`** — categorias favoritadas.

Operações: `f6` lê a lista; `ZI(a)`/`a24(a)` adicionam/removem item; `ZJ(a)` para categoria. Toggle: na lista (`d7R`) — `if(contém) remove; else push`, re-render.
- A estrela aparece por item na lista da categoria e o estado é o `B.f.v(favs, id)`.
- Tela **"Favoritos"** no menu global agrega ambos (drogas + categorias).
- O **selecionado/checado** na lista usa ícone `B.it` ao lado do item quando ativo (`if(n) s.push(... A.aD(B.it,...))`).

**FLAG:** favoritos são **por usuário/local-storage**, não há indicação de sync server-side no trecho lido (chave plana em `B.f5`). Drogas pediátricas e adultas dividem o mesmo namespace `"favorites"` (id inclui categoria + id da droga: `a.a+"-"+a.c`).

---

## 6. BUSCA

Duas superfícies:
- **Home pediátrica** — campo de busca com placeholder **"O que você precisa hoje?"** (i18n, byte ~10.307M). É o search principal da home; filtra/abre categorias e itens.
- **Home global (app adulto)** — placeholder genérico **"Pesquisar"** (i18n, junto de "Olá").
- Em telas internas a busca filtra a lista de drogas da categoria (sem placeholder dedicado encontrado para a categoria — provavelmente reusa o mesmo campo).

**FLAG:** "O que você precisa hoje?" é a string canônica de busca da **home** (adulta e/ou pediátrica). Não há um segundo placeholder distinto "para categoria" no bundle; a busca de categoria parece reusar o mesmo widget. Validar visualmente onde cada um aparece.

---

## 7. SIDEBAR GLOBAL e HEADER

Itens da sidebar/menu (i18n verbatim, byte ~10.304M, em ordem):
```
"Início", "Favoritos", "Quiz", "Menu", "Configurações", "Sair", "Sobre",
"Mensagens ao suporte", "Trocar idioma" (Português/Inglês/Espanhol),
"Urgências", "Diluições e Doses", "Calculadoras Médicas", "Protocolos Clínicos",
"Escores", "Conversores", "Plantão", "Loja Calcmed", "Configurações do aplicativo",
"Idioma"
...
"CalcMed Eletro", "Pediatria", "Passômetro",...
```
- **"Pediatria"** é o item que entra no modo pediátrico (rota `/pediatra`).
- Header global: saudação **"Olá"** + nome, busca **"Pesquisar"**, status do plano (**"Seu plano:"**, **"Ver planos disponíveis"**, **"Renovação:"**, **"Gerenciar assinatura"**), logo.
- **Web/desktop**: a navegação vira uma **árvore lateral expansível** com breadcrumb no topo do conteúdo (montado em `ddL`), incluindo contagem de itens, chip "Premium" (cadeado) por nó bloqueado e botão de favoritar/expandir por nó.
- Header de tela interna (`bf`): título da categoria, voltar, e (mobile) sem breadcrumb; (web) com breadcrumb "Pediatria > Categoria".

---

## 8. Categorias SEM rota por-droga vs. COM rota por-droga

**SEM sub-rota de droga (tela única multi-droga, acordeão):** — confirmado no route-tree (a categoria existe mas não há `/categoria/<droga>` abaixo):
- **`/pediatra/antihistaminicos`** — tela única (nenhuma droga-filha no route-tree).
- **`/pediatra/antidiarreicos`** — tela única. Confirmado no código (widget `b4j`/`NW`): itens renderizados como **acordeões expansíveis** (`qD(...)`) dentro de uma só tela — ex. Floratil® (Saccharomyces boulardii) e Zinco aparecem como seções `af4`/`afd`, não como rotas. Header "Sintomáticos".

**COM sub-rota por-droga** (`/pediatra/<categoria>/<droga>`):
- `aine` (cetoprofeno, nimesulida), `antibioticos` (21 drogas), `antiemetico` (4), `antiespasmodico` (3), `antitermicos-analgesicos` (3), `broncodilatadores` (8), `corticoides` (7), `laxativos` (5), `pcr` (5).

**Single-screen sem filhos também:** `anafilaxia`, `bradicardia`, `taquicardia`, `diarreia-na-crianca`, `hidratacao-manutencao`, `hipoglicemia`, `crise-convulsiva`, `intubacao`, `ventilacao-mecanica`, `clearance-de-creatinina`, `superficie-corporal`, `informations/sinais-vitais-normais`, `ketodex`, `ketofol`. (telas de protocolo/calculadora/tabela, não listas de droga).
**Com sub-modos:** `crise-asma` (`/grave`, `/leve-moderada`), `drogas-vasoativas` (`/vazao`, `/volume`), `custom-solutions` (`/oral`, `/flow-rate`, `/volume`).

**FLAG (Saccharomyces boulardii):** aparece dentro da tela Antidiarreicos como acordeão (Floratil®), coerente com a nota de memória de que Saccharomyces é "órfão" sem rota própria — confirmado: não tem rota, é seção de tela única.

---

## Flags consolidadas (validar com produto/visual)
1. Não há `isPediatraMode` persistido — "modo" = rota `/pediatra/*` + flag `fromPediatra` por item. Home pediátrica é tela separada (rota `aRQ`), não toggle visual da home adulta.
2. Ordem dos 11 blocos da home: alta confiança (cluster i18n + route-tree); a alocação categoria→bloco (Sintomáticos vs Urgências) é por agrupamento de código, validar visualmente.
3. `GS(a,b)` usa categoria como string-id; o ramo `a==="1"` (conversores+corticoides livres no free) — semântica do id `"1"` não 100% explícita no bundle.
4. Busca: "O que você precisa hoje?" é o placeholder da home; não há placeholder distinto para busca dentro de categoria (reuso provável).
5. Favoritos: local-only no namespace `"favorites"`/`"favorites-category"`, compartilhado adulto+pediátrico; sem evidência de sync server.
6. Antidiarreicos e Antihistamínicos = tela única multi-droga (acordeão); demais sintomáticos = lista com rota por-droga. Confirmado por route-tree + código.
