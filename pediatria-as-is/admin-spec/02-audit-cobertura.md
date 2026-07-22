---
tipo: audit
atualizado: 2026-06-21
fontes:
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/src/admin/modules/_shared/ClinicalResourceModule.jsx
  - apps/web/docs/admin/prd-admin-antibioticos.md
  - admin-spec/01-sistema-de-tipos.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
relacionado:
  - admin-spec/01-sistema-de-tipos.md
  - PLANO-ADMIN-DATA-ARCH.md
status: vigente
peso: core
---

# Auditoria de cobertura do admin — moldes x capacidades

> Lente: cruzar os 9 tipos canônicos (admin-spec/01) com as capacidades reais do admin de hoje,
> usando o módulo de antibióticos + o motor compartilhado `ClinicalResourceModule` como referência
> do que existe. Cético e exaustivo: o que parece coberto mas não é, e o que falta por completo.
> Cada "não cobre" rastreia para uma linha de código ou um campo ausente do schema. Incertezas = FLAG.

## 0. O que o admin REALMENTE é hoje (verdade de código, não de PRD)

O motor `ClinicalResourceModule.jsx` (1440 linhas, 5 módulos clínicos: antibióticos, condutas,
checklists, protocolos, quiz) é um **CRUD definition-driven de formulário plano**. A capacidade
total de input é fechada e pequena. Os tipos de campo que o engine sabe renderizar (grep
`field.type ===`):

`text` (default) · `textarea` · `number` (via InputField) · `select` · `radio` · `toggle` ·
`checkbox` · `tags` · `repeater` (lista de sub-campos, cada um de novo só dos tipos acima).

Tudo além disso é **`renderPreview(draft)` custom por módulo** — um React arbitrário que desenha a
tela, mas que NÃO é editor: lê o draft e pinta. O único editor estruturado fora do form plano é o
`repeater` (posologias, observações). Não há:

- nenhum editor de **fórmula** (expressão matemática) — T2 inteiro;
- nenhum editor de **árvore de decisão** (nós sim/não) — T6 inteiro;
- nenhum editor de **faixas por limiar numérico** com aritmética (clearance, KDIGO) — D5/D6/T4;
- nenhum editor de **steps/abas aninhadas** que contenham outro molde — T5 inteiro;
- nenhum editor de **dose computada** (`fator × peso`, teto clamp/texto) — D3/D4/D7, o coração da pediatria.

> **Conclusão antecipada:** o admin atual cobre de verdade **1 tipo e meio**: T1 só no sub-tipo
> `simples`/`peso` reduzido a posologia-texto (D1/D2 e um D3 sem aritmética), e T3 (escores) por um
> motor IRMÃO separado (Admin de Escores), não por este engine. Os 7 tipos restantes e 6 dos 8
> sub-tipos de dose **não têm editor**. O que o PRD chama de "construtor das telas" é, hoje, um
> editor de **texto de posologia + toggles de bloco** — não um motor de cálculo.

---

## 1. Capacidades do admin (as colunas da matriz)

Definição operacional de cada capacidade, ancorada no código:

| Capacidade | O que significa (verificável no código) | Onde vive |
|---|---|---|
| **C1 Cadastra** | Existe campo/editor no engine que captura TODOS os dados do molde sem cair na aba JSON crua | `definition.fields`, `repeater`, `renderPreview` |
| **C2 Valida** | `validate` bloqueia/avisa por regra de domínio do molde (não só "campo vazio") | `validateAntibiotico` / `definition.validate` |
| **C3 Preview** | Mostra a tela real do app reagindo ao draft | `definition.renderPreview` |
| **C4 Gate de revisão** | Workflow `statusEditorial` + `revisaoMedicaStatus` + review-dirty (rebaixa aprovado ao mexer no clínico) | engine linhas ~1033, `CAMPOS_CLINICOS` |
| **C5 Publica** | Chokepoint único (editor + bulk + import) com travas de publicação | `bulkSetStatus`/`importJson`, gate no validate |
| **C6 Data-driven** | O conteúdo é DADO (JSON persistido), não código Flutter/React hardcoded | store + schema |

A capacidade transversal **C5 (workflow editorial + chokepoint)** e **C4 (review-dirty)** são o ouro
do engine: bem construídas, agnósticas de tipo, e **reutilizáveis por qualquer molde futuro** sem
reescrita. O buraco não é o workflow — é o **editor de conteúdo** (C1) e a **validação de domínio**
(C2) de cada tipo.

---

## 2. MATRIZ DE COBERTURA (9 tipos x 6 capacidades)

Legenda: **SIM** = coberto de verdade · **PARC** = parcial/com buraco · **NÃO** = inexistente ·
**N/A** = não se aplica. Referência = módulo de antibióticos.

| Tipo | C1 Cadastra | C2 Valida (domínio) | C3 Preview | C4 Gate revisão | C5 Publica | C6 Data-driven |
|---|---|---|---|---|---|---|
| **T1 droga-dose** (D1 fixo) | PARC | PARC | SIM | SIM | SIM | SIM |
| **T1** (D2 lookup faixa) | NÃO | NÃO | PARC | SIM | SIM | PARC |
| **T1** (D3 peso-computado) | NÃO | NÃO | PARC | SIM | SIM | NÃO |
| **T1** (D4 híbrido peso×idade) | NÃO | NÃO | NÃO | SIM | NÃO (gate) | NÃO |
| **T1** (D5 renal/clearance) | NÃO | NÃO | PARC | SIM | SIM* | NÃO |
| **T1** (D6 regime) | NÃO | NÃO | PARC | SIM | SIM* | NÃO |
| **T1** (D7 infusão BIC) | NÃO | NÃO | NÃO | SIM | NÃO | NÃO |
| **T1** (D8 só-aviso) | PARC | NÃO | PARC | SIM | SIM | PARC |
| **T2 calculadora-formula** | NÃO | NÃO | NÃO | N/A** | N/A** | NÃO |
| **T3 escore-por-pontos** | SIM*** | SIM*** | PARC | PARC | PARC | SIM*** |
| **T4 escore-por-criterios** | NÃO | NÃO | NÃO | N/A** | N/A** | NÃO |
| **T5 protocolo-multi-step** | NÃO | NÃO | NÃO | N/A** | N/A** | NÃO |
| **T6 conduta-arvore-decisao** | NÃO | NÃO | NÃO | PARC**** | PARC**** | PARC**** |
| **T7 conversor** | NÃO | NÃO | NÃO | N/A** | N/A** | NÃO |
| **T8 tabela-referencia** | NÃO | NÃO | NÃO | N/A** | N/A** | NÃO |
| **T9 ferramenta-utilitaria** | N/A | N/A | N/A | N/A | N/A | N/A |

Notas das células:
- `*` D5/D6 "publica SIM" no sentido frágil: o engine deixa publicar porque NÃO valida a faixa de
  clearance nem o regime (não existe editor disso). Os slots `clearance`/`cockcroft`/`dialise`/`regime`
  ligam blocos de UI no preview, mas **a aritmética da faixa é texto de posologia digitado à mão**, não
  dado estruturado. Publica conteúdo que o app não consegue calcular — só exibir como texto.
- `**` N/A em C4/C5 porque o tipo nem existe no engine; não há item a publicar.
- `***` T3 é coberto por um **motor separado** (Admin de Escores, `project_admin_escores`), NÃO por
  `ClinicalResourceModule`. Herda os typos load-bearing (`aditionalTexts`, `biggerThen`). O gate de
  revisão/publicação desse motor é mais raso que o de antibióticos (PARC).
- `****` T6 (condutas) existe como MÓDULO no engine (`condutas/`), mas como **form plano de texto**, não
  como editor de árvore sim/não. Cadastra texto de conduta, não os nós ramificados. Logo PARC: tem
  workflow, não tem a estrutura do tipo.

---

## 3. T1 em detalhe — onde o "construtor de antibióticos" para de cobrir

O módulo de antibióticos é o mais maduro, mas mesmo nele a cobertura de cálculo é uma **ilusão de
preview**: o preview desenha blocos (peso, clearance, diálise), mas o admin **não captura nenhuma
fórmula**. A posologia é texto livre (`dose: string`, ex.: "2", "5 a 10"). Validação só checa que
existe dose e que tem unidade.

| Sub-tipo | Existe no schema? | Editor captura o cálculo? | Buraco concreto |
|---|---|---|---|
| **D1 fixo** | sim (posologia texto) | parcial | OK pra "Azitromicina 500 mg"; mas regimes múltiplos (Salbutamol) só por repeater manual, sem semântica |
| **D2 lookup** | não | **não** | sem `tabela[{faixa, dose}]` indexada por idade/peso. Hoje vira N posologias soltas, app não sabe qual faixa exibir |
| **D3 peso-computado** | não | **não** | sem `fator`, sem `concentração`, sem `casas`, sem teto. `dose: "fator × peso"` é só string — o app não calcula |
| **D4 híbrido** | não | **não** | sem `gate_idade`, sem ramos por apresentação/indicação, sem `regraCalculo`. **Buraco central da pediatria** (brief P5) |
| **D5 renal** | parcial (slots) | **não** | slots `clearance/cockcroft/dialise` ligam UI, mas não há `faixas[{min,max,clClvariavel,posologiaRef}]`. A faixa de clearance é texto |
| **D6 regime** | parcial (slot) | **não** | slot `regime` liga o seletor visual, mas não há `modos{unica,multiplas}` com suas faixas |
| **D7 infusão BIC** | não | **não** | sem `inputs[peso,dose,vazao]`, sem getters de concentração/mL-h. Vasoativas e Terbutalina sem editor |
| **D8 só-aviso** | parcial | parcial | dá pra cadastrar como item com observação só; mas não há flag `tem_dose:false` — validate EXIGE ≥1 posologia com dose (bloqueia o caso legítimo "só cuidado") |

**Gate explícito de produto que reduz a cobertura efetiva de T1:**
- `validateAntibiotico` linha 327: **público pediátrico/ambos NÃO publica** na V2. Logo todo o eixo
  pediátrico (D2/D3/D4 ped) fica preso em rascunho mesmo se cadastrado.
- `validateAntibiotico` linha 330: slot **`definirDose` bloqueia publicação** (gate interino fase 2).
  É exatamente o `calculada` (faixa min/max), que é o que a pediatria mais precisa. Não cobre.
- `validateAntibiotico` linha 292: **exige ≥1 posologia com dose** — bloqueia D8 (só-aviso) e qualquer
  tela de tabela/referência sem dose numérica.

---

## 4. O que o admin atual NÃO cobre (lista exaustiva, por categoria)

### 4.1 Editores de tipo inexistentes (faltam por completo)
1. **Editor de fórmula (T2)** — nenhuma forma de capturar `expr` matemática, `inputs[{validacao}]`,
   `faixas_classificacao`, `inputs_mutuamente_exclusivos`. ~20 calculadoras (IMC, PAM, QTc multi-método,
   Clearance, Holliday-Segar) são 100% hardcode. O engine não tem nem campo de expressão.
2. **Editor de árvore de decisão (T6)** — condutas existe como módulo mas só edita texto plano; não há
   editor de `nos[{pergunta, sim→, nao→}]`. ~6 condutas (Hipoglicemia, Bradicardia, Anafilaxia) sem estrutura.
3. **Editor de protocolo multi-step (T5)** — nenhum container de `abas[]`/`steps[]` que aninhe outro
   molde. CAD (8 abas), PCR (5), Intubação, Diarreia A/B/C: hardcode no binário. O engine é flat, não aninha.
4. **Editor de escore-por-critérios (T4)** — sem `regras_estagio[{condicao_booleana}]`. IRA KDIGO, PPS
   (cascata de selects → %) não cabem em T3 (não é soma) nem no form plano.
5. **Editor de conversor (T7)** — sem `dropdowns[{opcoes[{fator_b}]}]` + fórmula. 7 conversores de
   infusão + corticóides hardcode.
6. **Editor de tabela-referência (T8)** — sem `linhas[{apresentacao,dose,prescricao,cuidados}]` indexadas
   por cenário/ClCr. Antiarrítmicos, Antídotos, Soluções, Parâmetros VM hardcode (alguns como IMAGEM JPG).
7. **Editor de dose computada (D3/D4/D5/D6/D7)** — o `regraCalculo` estruturado não existe em lugar
   nenhum do schema. Toda dose é `string`. **Este é o buraco que impede trazer a pediatria ao admin.**

### 4.2 Campos/slots ausentes para a pediatria (mesmo dentro de T1)
- Slot/input **`idade`** com unidade Meses/Anos (F-09 RESOLVIDO contra bundle 2026-06-21: `Meses=1,
  Anos=2` uniforme, sem inversão — a divergência func-01/func-02 era ruído de extração; ver
  `02-audit-meses-anos.md`). Não existe no admin atual; criar normalizando idade para meses internamente
  (F-06/F-07 abertos, separados da inversão). Não existe.
- Slot **`apresentacao`** com `concentracao_mg_ml` que troca o fator. Não existe (só texto de diluente).
- **`ramos_neonatais[]`** (idade gestacional + dias de vida) — hoje é rótulo de texto, não input. Não existe.
- **`dose_maxima { valor, unidade, tipo ∈ clamp/texto }`** — o teto de segurança. Não existe campo
  estruturado; teto vira texto na posologia. **Sem distinção clamp-vs-texto** (a decisão de produto mais
  crítica do brief — clampar um teto-texto = comportamento clínico novo).
- **`contraindicacao_idade { texto, gate:bool }`** — gate duro ("Contraindicado <droga>") vs aviso de
  bula. Não há campo de gate; vira observação `critical`, que não bloqueia o cálculo.
- **Dose por DUAS variáveis combinadas** (peso × idade/apresentação) — slots booleanos independentes
  não modelam combinação. Confirmado gap central (admin-spec/01 §3 gap 3).

### 4.3 Validação de domínio ausente (C2 é raso)
O `validateAntibiotico` só sabe: nome vazio, público no enum, via no enum, ≥1 posologia, dose com
unidade, referência ao publicar, revisão aprovada, gates de público/definirDose. **Não valida nenhuma
semântica de cálculo:** não checa se uma fórmula é válida, se as faixas de clearance cobrem todo o
domínio sem buraco/sobreposição, se o teto é coerente com a dose, se os ramos de idade são exaustivos,
se a árvore de decisão tem nó terminal. Para conteúdo de cálculo, o validate é cego.

### 4.4 Preview enganoso / a11y (correctness, já flagado no PRD §11–12)
- **B-02**: preview fixa `domain="sepse"` para qualquer droga — pinta acento clínico errado (antiviral
  vira sepse). Erro grave por Q7. Não cobre "preview fiel".
- **B-01**: `observacoes` em string de import é **descartada silenciosamente** (round-trip quebrado) —
  o normalize reaplica o cru pelo `...item` depois da normalização. Cadastro perde dado.
- **B-03/B-04**: preview com campos focáveis fantasma (poluem leitor de tela); reorder de blocos **some
  no mobile** sem alternativa acessível (veto de release). C1/C3 furam no mobile.

### 4.5 Persistência e escala (C6 é só localStorage)
- **Data-driven só na metade:** persiste em `localStorage cm_admin_antibioticos_v3`. Firestore está
  **escrito mas não testado** (B-10, sem chaves do cliente, `x-status: provisorio-aguardando-gui`).
  Enquanto não ligar, "data-driven" não chega ao app de produção — o app B2C lê do binário, não do admin.
- **Sem ponte admin→app:** mesmo cadastrado, não há evidência no código auditado de que a tela do app
  B2C CONSOME o JSON do admin. O preview é uma RÉPLICA React dentro do admin, não a tela real servida.
  FLAG: confirmar com o Gui se o app de produção lê esse JSON (provavelmente NÃO ainda — é hardcode Flutter).
- **Escala real = 2 seeds, não 38:** o store tem `Ceftriaxona` + `Aciclovir`. Os 38 ATB (B-08) e a
  classificação adulto-vs-pediátrico deles (B-16) são trabalho de produto pendente.

### 4.6 Capacidades transversais que faltam (todos os tipos)
- **Telemetria**: zero eventos instrumentados (B-12).
- **Segundo revisor**: Gustavo é o próprio revisor (risco de rubber-stamping, B-13). C4 mitiga com
  atestado de diff, mas não há separação de papéis no RBAC.
- **Estado de carregando**: `store.getStatus` existe, ninguém consome (B-11).

---

## 5. Achados-chave (síntese)

1. **O admin de hoje é um editor de TEXTO de posologia + toggles de bloco, não um motor de cálculo.**
   Cobre T1 só no grau "dose como string" (D1, e D2/D3/D5/D6 só como ilusão de preview). 6 dos 8
   sub-tipos de dose e 7 dos 9 tipos canônicos **não têm editor**.

2. **A capacidade forte e reutilizável é o WORKFLOW (C4 gate de revisão + C5 chokepoint de publicação),
   não o conteúdo.** Review-dirty, validate compartilhado por editor/bulk/import, migração v2→v3 que
   rebaixa publicado: tudo agnóstico de tipo, pronto pra reuso por qualquer molde novo. O buraco é C1+C2.

3. **O buraco central pra trazer a pediatria ao admin é o `regraCalculo` estruturado** (dose computada
   por peso × idade × apresentação com teto clamp/texto). Não existe nenhum campo disso. Slots booleanos
   independentes não modelam combinação de variáveis (confirma admin-spec/01 §3 gap 3 e brief P5).

4. **Dois gates de produto zeram a cobertura efetiva mesmo do que cadastra:** pediátrico/ambos não
   publica (V2 adulto-only) e `definirDose` (faixa min/max = `calculada`) bloqueia publicação até fase 2.
   O que a pediatria mais precisa é exatamente o que está travado.

5. **"Data-driven" é parcial e possivelmente desconectado do app.** Persiste em localStorage; Firestore
   não testado; e **não há prova no código de que o app B2C lê esse JSON** (FLAG forte — confirmar com Gui).
   Risco: o admin é hoje uma ferramenta de autoria que ainda não alimenta produção.

6. **A validação de domínio (C2) é cega para cálculo.** Nenhuma checagem de fórmula, faixa exaustiva,
   coerência de teto, exaustividade de ramos de idade, ou nó terminal de árvore. Para conteúdo clínico
   calculado, isso é risco de segurança (uma faixa de clearance com buraco passa no validate).

7. **Defeitos de correctness já catalogados ainda abertos:** preview `domain="sepse"` (B-02), perda de
   `observacoes` string no round-trip (B-01), reorder inacessível no mobile (B-04, veto de release).

8. **Tipos que são HARDCODE no binário hoje (alvo, não capacidade):** T2 (fórmulas), T4 (KDIGO/PPS),
   T5 (CAD/PCR/protocolos multi-step), T6 (árvores de conduta), T7 (conversores), T8 (tabelas/imagens).
   Movê-los pro admin é engine novo dirigido por JSON (PLANO §4), fase 2+, não evolução do form plano atual.

### FLAGs de incerteza
- **FLAG-A (alta):** o app B2C de produção consome o JSON do admin? Código auditado não prova consumo;
  preview é réplica React no admin. Provável que o app ainda seja hardcode Flutter. Confirmar com Gui.
- **FLAG-B:** schema `x-status: provisorio-aguardando-gui` — nome de coleção, formato de doc e round-trip
  de `observacoes` no Firestore real não confirmados.
- **FLAG-C:** condutas/checklists/protocolos/quiz compartilham o engine mas não foram auditados em
  profundidade aqui (lente foi antibióticos como referência). Assumido form plano pelo mesmo motor; o
  grau de cobertura de T5/T6 nesses módulos pode ser >0 mas estruturalmente é o mesmo form plano.
