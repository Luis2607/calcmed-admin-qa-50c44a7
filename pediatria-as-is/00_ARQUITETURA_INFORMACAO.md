---
tipo: auditoria-as-is
produto: CalcMed — Urgência e Emergência (B2C)
modo: Pediatria
fonte: app de produção https://app.calcmed.com.br (Flutter web), bundle main.dart.js v.2026-06-07
usuario_teste: Larissa (conta com assinatura)
capturado_em: 2026-06-20
status: COMPLETO — cobertura 101/101 rotas navegáveis = 100% (verificado adversarialmente)
objetivo: Documentar 100% da Pediatria as-is do app HOJE — cada tela, campo, interação, dose — e a arquitetura da informação real. Insumo para a Nova Home V2 e gap analysis.
metodo: O conteúdo clínico é COMPILADO no bundle Flutter (não há API de dados). Bundle baixado, decodificado (escapes \xNN→UTF-8) e extraído verbatim por fan-out de agentes Opus + verificação adversarial droga-a-droga + crítico de completude. Camada visual/interação validada no app real (Chrome).
---

# Pediatria CalcMed — Arquitetura da Informação (AS-IS, 2026-06-20)

> **Índice mestre navegável.** Este arquivo é o mapa. O conteúdo clínico detalhado (cada droga, dose, prescrição, protocolo — verbatim) vive em `raw/<seção>.md`. O mapa visual interativo está em `mapa-ia-pediatria.html`.

## 0. Como ler este pacote

| Arquivo | O que tem |
|---|---|
| **`00_ARQUITETURA_INFORMACAO.md`** (este) | Mapa mestre: acesso, home, inventário 101 rotas, padrões, premium, achados, cobertura |
| **`01_FLUXOS_IA.md`** ⭐ | IA organizada por **fluxos** (3 camadas + 6 arquétipos) — "como o app funciona" + leitura p/ Nova Home V2 |
| **`mapa-fluxos-pediatria.html`** ⭐ | Mapa visual dos **fluxos** (arquétipos A–F, passos, estados, ramificações) |
| **`mapa-ia-pediatria.html`** | Mapa visual do **catálogo** (abrir no navegador) — "onde cada coisa está" |
| `raw/00b-estrutura-navegacao.md` | Backbone de navegação/IA: toggle, blocos da home, 6 padrões de tela, premium, favoritar, busca, sidebar |
| `raw/01a` … `raw/01d` | **Sintomáticos** (9 categorias): antitérmicos/AINE/antieméticos · antihistamínicos/antiespasmódico/antidiarreicos · broncodilatadores · laxativos/corticóides |
| `raw/02a` `raw/02b` | **Antibióticos** navegáveis (23 drogas): A–C e G–V |
| `raw/02c` | Antibióticos **órfãos** (módulo adulto empacotado no bundle — NÃO pediátrico) |
| `raw/03a` `raw/03b` `raw/03c` | **Urgências** (10 protocolos): diarreia/asma/convulsão · anafilaxia/hipo/bradi/taqui · PCR/intubação/VM |
| `raw/04` | **Diluições e Doses**: hidratação, vasoativas, soluções personalizadas, ketofol, ketodex |
| `raw/05` + `raw/05b` | **Calculadoras + Conversores + Informações + Doses Pediátricas** (05b = tabela de sinais vitais transcrita do JPG) |
| `raw/_route-tree.txt` | As 101 rotas (94 `/pediatra/*` + 7 conversores) |
| `raw/_coverage-matrix.md` | Matriz rota→arquivo→status (101/101 = 100%) |
| `raw/_orphan-sweep.md` | Varredura de telas órfãs / o bundle contém DOIS apps (ped + adulto) |
| `_source/main.dart.js` + `main.decoded.js` | A fonte (dataset clínico completo, local, reusável) |
| `_source/assets/sinais_vitais.jpg` | A arte da tela Sinais Vitais |

---

## 1. Como a Pediatria é acessada

- **Não é um toggle de estado**: "Pediatria" é uma **rota top-level própria** (`/pediatra`, builder `aRQ`), irmã de `/home`, `/equation`, `/store`. O acesso é o item **"Pediatria"** na sidebar global. A home pediátrica é uma tela inteira separada, não uma variação visual da home adulta. (Não há `isPediatraMode` persistido — o "modo" é derivado da rota `/pediatra/*` + flag `fromPediatra` por item.)
- **Rotas são addressáveis por hash**: `https://app.calcmed.com.br/#/pediatra/<slug>` — porém o app **não inicializa direto numa rota profunda** (tela branca): precisa bootar pela home e navegar por clique.
- **Header da home**: avatar + "Olá, {nome}" · toggle/visual "Pediatria" (ícone bebê) · busca **"Pesquisar"** (global) / **"O que você precisa hoje?"** (home pediátrica).
- **Sidebar global** (não muda com o modo): Início, Mensagens ao suporte, Favoritos, Quiz, Assinatura, Blog, Fale Conosco, Sugestões, Loja, Parcerias, Presenteie um Amigo, Referências, Configurações, Sair.

---

## 2. Mapa da Home Pediátrica — 11 blocos (ordem vertical real)

| # | Bloco | Tipo | Conteúdo |
|---|---|---|---|
| 1 | **Carrossel / Banners** | Banners rotativos (Supabase) | "Participe do Quiz da CalcMed" · "Quando cada segundo importa… Algo novo está chegando. AGUARDE" |
| 2 | **Passômetro** | Card ferramenta | Escala de plantões (compartilhado c/ app adulto) |
| 3 | **Busca** | Campo | "O que você precisa hoje?" |
| 4 | **Sintomáticos** | 9 categorias → listas de drogas | Antitérmicos e Analgésicos · Anti-inflamatórios · Antieméticos · Antihistamínicos · Broncodilatadores · Antiespasmódico · Antidiarreicos · Laxativos · Corticóides |
| 5 | **Antibióticos** | Categoria → lista (23 drogas) | Antibióticos Pediatria |
| 6 | **Urgências** | 10 protocolos / fluxos | Diarreia na Criança · Exacerbação de Asma · Crise Convulsiva · Anafilaxia · Hipoglicemia · Bradicardia · Taquicardia · PCR · Intubação · Ventilação Mecânica |
| 7 | **Diluições e Doses** | Calculadoras de diluição | Hidratação-Manutenção · Drogas Vasoativas · Soluções Personalizadas · Ketofol · Ketodex |
| 8 | **Calculadoras Médicas** | Calculadoras | Clearance de Creatinina · Taxa de Infusão · Superfície Corporal |
| 9 | **Conversores** | Conversores de unidade | mL/h↔mcg/kg/min · mcg/kg/min→mL/h · mL/h↔gts/min · %→mg/mL · mL/h→mcg/min · mcg/min→mL/h · Corticóides |
| 10 | **Informações** | Tabela de referência | Sinais Vitais Normais (imagem JPG) |
| 11 | **Plantão** | Ferramentas | Dividir Descanso · CalcMed Eletro · Minhas Anotações |

> **Badges nos cards**: "Premium" + cadeado (sem acesso no plano free) · "Em breve" (categoria sem itens) · "Novo". Em loading transiente, os cards aparecem com badge "Premium" até a assinatura resolver.

---

## 3. Inventário completo — 101 rotas (100% documentadas)

> Legenda: 🔓 livre no plano free · 🔒 gated (Premium) · 📄 tela única (acordeão, sem rota por-droga) · 🧮 calculadora · 🩺 protocolo

### Sintomáticos (9 categorias → `raw/01a–01d`)
- **Antitérmicos e Analgésicos** 🔒 — Dipirona · Paracetamol · Ibuprofeno *(`01a`)*
- **Anti-inflamatórios (aine)** 🔒 — Cetoprofeno · Nimesulida · Ibuprofeno *(compartilhado)* · **Diclofenaco = ÓRFÃO** (no bundle, sem rota) *(`01a`)*
- **Antieméticos** 🔒 — Bromoprida · Metoclopramida *(só tela de aviso, sem calculadora)* · Ondansetrona · Dimenidrato *(`01a`)*
- **Antihistamínicos** 🔒 📄 — Cetirizina · Dexclorfeniramina · Desloratadina · Fexofenadina · Hidroxizina · Loratadina · Ebastina *(7 em acordeão, tela única)* *(`01b`)*
- **Antiespasmódico** 🔒 — Escopolamina (Buscopan®) · Simeticona · Colidis® *(`01b`)*
- **Antidiarreicos** 🔒 📄 — Saccharomyces boulardii (Floratil®) · Zinco *(acordeão, tela única; ambos sem rota própria)* *(`01b`)*
- **Broncodilatadores** 🔒 — Acebrofilina · Abrilar® · Fenoterol · Brometo de Ipratrópio · Montelucaste · Salbutamol · Sulfato de Magnésio · Terbutalina *(8)* *(`01c`)*
- **Laxativos** 🔒 — Lactulose · Macrogol 3350 · Hidróxido de magnésio · Óleo mineral · Glicerina *(5)* *(`01d`)*
- **Corticóides** 🔒/🔓 — Prednisona · Prednisolona · Dexametasona · Hidrocortisona · Metilprednisolona · Budesonida · Fluticasona *(7; corticóides pediátricos são livres no free)* *(`01d`)*

### Antibióticos (23 drogas navegáveis → `raw/02a`, `raw/02b`) 🔒
acetilcefuroxima · albendazol · amicacina · amoxicilina · amoxicilina-clavulanato · amoxicilina-sulbactam · ampicilina · ampicilina-sulbactam · azitromicina · cefalexina · cefepima · ceftriaxone · cefuroxima · claritromicina *(02a)* · gentamicina · mebendazol · meropenem · metronidazol · penicilina-g-benzatina · penicilina-g-cristalina · penicilina-procaina · secnidazol · vancomicina *(02b)*

### Urgências (10 protocolos → `raw/03a–03c`) 🩺
- **Diarreia na Criança** 🔒 — Planos A/B/C + ATB + antidiarreicos *(03a)*
- **Exacerbação de Asma** 🔒 — classificação → `/leve-moderada` · `/grave` *(03a)*
- **Crise Convulsiva** 🔒 — 6 drogas (Diazepam/Midazolam 1ª linha, Fenitoína, Fenobarbital, Tiopental…) *(03a)*
- **Anafilaxia** 🔓 *(livre no free)* — adrenalina IM dose/kg *(03b)*
- **Hipoglicemia** 🔓 *(livre no free)* *(03b)*
- **Bradicardia** 🔒 · **Taquicardia** 🔒 (adenosina 3 mg/mL, cardioversão) *(03b)*
- **PCR** 🔒 — calculadora Cargas e Doses, 5 abas: `/adrenalina` `/amiodarona` `/lidocaina` `/sulfato-magnesio` `/carga-choque` *(03c)*
- **Intubação** 🔒 — sequência rápida, steps 1–5 *(03c)*
- **Ventilação Mecânica** 🔒 — parâmetros + sedação contínua *(03c)*

### Diluições e Doses (→ `raw/04`) 🔒
- **Hidratação-Manutenção** 🧮 (Holliday-Segar)
- **Drogas Vasoativas** 🧮 — 8 drogas, modos `/vazao` e `/volume` ("Monte sua solução")
- **Soluções Personalizadas** (`/custom-solutions`) — 3 sub-tipos: Oral (`/oral/new`), Por Vazão (`/flow-rate`), Por Volume (`/volume`); criar/salvar/editar/excluir
- **Ketofol** · **Ketodex** (2 variantes etárias)

### Calculadoras + Conversores + Informações (→ `raw/05`, `raw/05b`)
- **Clearance de Creatinina** 🧮 (Schwartz + Cockroft-Gault) · **Superfície Corporal** 🧮 (Mosteller/Costeff) · **Taxa de Infusão**
- **Conversores** 🔓 *(livres no free)* — 7: mL/h↔mcg/kg/min · mcg/kg/min→mL/h · mL/h↔gts/min · %→mg/mL · mL/h→mcg/min · mcg/min→mL/h · Corticóides
- **Sinais Vitais Normais** — tabela FC/FR/PA por faixa etária *(em imagem JPG — valores transcritos em `05b`)*
- **Doses Pediátricas** (`/doses-pediatricas/new` + `/view`) — feature de criar/salvar/ver doses personalizadas

---

## 4. Padrões de tela (6) — anatomia em `raw/00b`

1. **Categoria → Lista de drogas** — breadcrumb · título · busca "O que você precisa hoje?" · estrela favoritar · linhas de droga (estrela + nome + ›). *(Sintomáticos, Antibióticos)*
2. **Calculadora de dose por peso** — input **Peso (kg)** [+ **Idade** valor+dropdown Meses/Anos quando aplicável] · **Apresentação** (formulações+marcas®) · **Dose usual** (mg/kg, máximas) · **Prescrição:** (volume calculado, números em verde; antes do preenchimento: empty state vermelho *"Informe todos os dados para obter o resultado."*) · **Cuidados** · contraindicações.
3. **Protocolo / fluxo multi-step** — acordeões, sub-rotas por gravidade/ritmo, doses calculadas por peso. *(Urgências)*
4. **Calculadora de diluição "Monte sua solução"** — Nº de ampolas · mL de soro · Concentração [calc] · Defina a dose. *(Vasoativas, Custom Solutions)*
5. **Conversor** — De: (dropdown) · Valor · Para: (dropdown) · "Resultado: [calc]".
6. **Tabela de referência** — acordeões por faixa etária/indicação. *(Sinais Vitais, tabelas de ATB)*

---

## 5. Modelo Premium / Assinatura (detalhe verbatim em `raw/00b` §4)

- Função de acesso `GS(categoria, sub)`. **Premium libera tudo.** No **plano FREE** só liberam: **Conversores, Anafilaxia, Hipoglicemia, Corticóides pediátricos** (+ Enxaqueca, Dividir Descanso — não exclusivos da pediatria). Copy verbatim do plano free: *"Acesso a conversores, dividir descanso, anafilaxia, hipoglicemia, enxaqueca e corticoides pediátricos"*.
- **Praticamente toda a pediatria de doses/diluições/antibióticos/sintomáticos é gated.** Upsell: *"✔ Toda a Pediatria desbloqueada"*.
- ⚠️ **O premium é definido no app**.

---

## 6. Achados-chave (as-is) — flags para produto

1. **O bundle empacota DOIS apps** (pediátrico + adulto). Telas adultas (Metoprolol, Flumazenil, Naloxone/overdose, Albumina/paracentese) e um **módulo adulto "Diluições e Doses" de ~38 antibióticos hospitalares** (aciclovir, anfotericina, ceftazidima, vancomicina hospitalar, piperacilina-tazo…) vivem no mesmo bundle, **desconectados** do menu pediátrico. → origem da confusão histórica de "antibióticos órfãos". Detalhe em `raw/02c` + `raw/_orphan-sweep.md`.
2. **Diclofenaco (Cataflam®)** — único órfão **pediátrico** real: tela completa e funcional no bundle, mas **sem entrada** no menu `/pediatra/aine`. Não navegável. *(`01a`)*
3. **Metoclopramida** — item de menu **sem calculadora**: renderiza só um bloco de Cuidados/aviso (Discinesia Tardia). Diverge do padrão das demais drogas. *(`01a`)*
4. **Ibuprofeno** aparece em 2 rotas (Antitérmicos **e** Anti-inflamatórios) apontando para o mesmo widget.
5. **Antihistamínicos e Antidiarreicos** = tela única multi-droga (acordeão), sem rota por-droga. Saccharomyces (Floratil) e Zinco são acordeões de Antidiarreicos.
6. **Sinais Vitais Normais** = conteúdo **em imagem JPG**, não estruturado (não pesquisável, sem dark, sem leitor de tela, não reusável). Valores transcritos em `05b`.
7. **Corticóides = 7** (inclui Fluticasona e Prednisolona) — mais do que o esperado.
8. Pequenos bugs de conteúdo verbatim sinalizados nos docs (ex.: Cefalexina com "(45/6,4 mg/kg/dia)" herdado de amox-clavulanato; Dimenidrato 6 anos+ texto sem "+"; Paracetamol var `weightLimitedTo30` com teto efetivo 35).

---

## 7. Cobertura & método

- **101/101 rotas navegáveis = 100%** documentadas com conteúdo clínico verbatim (94 `/pediatra/*` + 7 conversores `/equation/*`). Matriz completa em `raw/_coverage-matrix.md`.
- **Verificação adversarial** por seção (9 `complete`, 3 `minor-gaps`, 0 `major-gaps`); spot-checks de doses bateram VERBATIM no bundle, zero fabricação.
- **Varredura de órfãos** (76 âncoras "Apresentação"): zero órfãos pediátricos novos.
- **Cross-check visual** no app real: Dipirona (lista → calc empty → calc computada) bateu 1:1 com o bundle.
- Único débito não-bloqueante já resolvido: tabela de Sinais Vitais (era imagem) → transcrita em `05b`.

---

## 8. Implicações para a Nova Home V2 / gap analysis (semente)

- **Catálogo real** = ~90 telas de conteúdo clínico em 6 padrões → a Home V2 precisa de navegação/busca que escale para esse volume (a busca atual é o ponto de entrada mais forte).
- **Gating no app** é risco de IP e bloqueia "freemium" real — decisão de arquitetura a discutir (ver doc de segurança).
- **Dívidas as-is** a herdar ou limpar na V2: Diclofenaco órfão (ligar ou remover), Metoclopramida sem calc, Sinais Vitais em imagem, app adulto empacotado junto (peso de bundle), bugs de conteúdo sinalizados.
- **Conteúdo livre no free** (conversores, anafilaxia, hipoglicemia, corticóides) é o "isca" atual — input para a estratégia de aquisição da Home V2.

---

*Pacote gerado por extração do bundle + fan-out Opus + verificação adversarial. Camada visual validada no app de produção. Para o conteúdo clínico exato de cada item, abrir o `raw/<seção>.md` correspondente.*
