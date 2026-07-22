# App-wide AS-IS — Cluster 03: Calculadoras + Escores (adulto/transversal)

> Fonte: `_source/main.decoded.js` (bundle Flutter web decodificado, 11.1 MB). Domínio: calculadoras de fórmula e o motor de escores. Pediatria NÃO incluída (já auditada em raw/01-05).
> Método: roteamento extraído do router (`A.aG(a,"/category/<slug>", new A.cXX(a))` ~offset 3297000) e do índice de categorias (`A.cr(...)` ~offset 364000). Cada controller `*ControllerBase` carrega a fórmula literal (getters `g*`). Transcrição fiel; ofuscação descrita onde aplicável.
> FIDELIDADE: as fórmulas abaixo são a transcrição literal do JS minificado (variáveis renomeadas para clareza, operadores preservados).

---

## Mapa de rotas (este cluster)

| Feature | Rota | Widget | Controller | Categoria-pai no índice |
|---|---|---|---|---|
| IMC | `/equation/category/imc` | `OQ` | `_CategoryImc...` (inline) | "Saúde Geral" |
| PAM | `/equation/category/pam` | `PF` | inline | "Saúde Geral" |
| LDL (Friedewald) | `/equation/category/ldl` | `OX` | inline | "Saúde Geral" |
| Escala PPS | `/equation/category/escala-PPS` | `OK` | `_CategoryEscalaPPSControllerBase` (`LR`) | "Saúde Geral" |
| Intervalo QTc | `/equation/category/intervalo-qtc` | `OU` | `_CategoryIntervaloQTCControllerBase` (`Bu`) | top-level |
| Clearance de Creatinina | `/equation/category/crearance-creatinina` | `Oa` | `_CategoryClearanceCreatininaControllerBase` (`Oc`) | top-level |
| Taxa de Infusão | `/equation/category/taxa-infusao` | `PP` | `_CategoryTaxaInfusaoControllerBase` (`PO`/`b5z`) | top-level |
| Peso Ideal + Volume Corrente | `/equation/category/peso-ideal-volume-corrente` | `IC` | `_EquationPesoIdealVolumeCorrenteControllerBase` (`Yc`) | sub de Ventilação Mecânica |
| PaO₂ ideal p/ idade | `/equation/category/pao2` | `HV` | `_EquationPaO2ControllerBase` (`b9S`) | sub de Ventilação Mecânica |
| Relação P/F (PaO₂/FiO₂) | `/equation/category/relacao-pf` | `IF` | `_EquationRelacaoPFControllerBase` (`bbu`) | sub de Ventilação Mecânica |
| **Escores (motor genérico)** | `/equation/score-categories/` + subrotas | `PG`/`Wc`/`S1` | `_NewScoreControllerBase` (`bf6`) etc. | top-level "Escores" |

> Observação de escopo: Ventilação Mecânica (`/category/ventilacao-mecanica`, widget `PS`) é uma **tela hub** com 4 abas (`eG`): `"0"`→Parâmetros Iniciais (`HX`), `"1"`→Peso Ideal/VC (`IC`), `"2"`→PaO₂ (`HV`), `"3"`→Relação P/F (`IF`). As 3 últimas são calculadoras puras e estão neste cluster.

---

# 1. Calculadoras de fórmula simples (1-2 inputs → 1 saída)

## 1.1 IMC — `/equation/category/imc`
- **TIPO:** calculadora-formula-simples + classificação por faixas.
- **Inputs:** `Peso` (kg), `Altura` (cm). Ambos texto numérico (vírgula→ponto).
- **Lógica (literal):**
  ```
  IMC = peso * 1e4 / (altura * altura)      // altura em cm → fator 10000
  // se NaN/±Inf → 0
  ```
- **Output:** `IMC: X,X kg/m²` + bloco "Classificação em adultos" com a faixa destacada:
  | Faixa (kg/m²) | Rótulo |
  |---|---|
  | `< 18,5` | Baixo Peso |
  | `18,5 a 24,9` (`>=18.5 && <24.9`) | Eutrófico |
  | `25 a 29,9` (`>=24.9 && <30`) | Sobrepeso |
  | `30 a 34,9` (`>=30 && <35`) | Obesidade Grau I |
  | `35 a 39,9` (`>=35 && <40`) | Obesidade Grau II |
  | `≥ 40` | Obesidade Grau III |
- **Premium:** livre (sem gate observado).
- **Peculiaridade:** bloco de resultado só aparece quando altura ≠ "" e ≠ "0" e peso ≠ "" e ≠ "0".

## 1.2 PAM — `/equation/category/pam`
- **TIPO:** calculadora-formula-simples.
- **Inputs:** `Pressão sistólica` (mmHg), `Pressão diastólica` (mmHg).
- **Lógica (literal):**
  ```
  PAM = (PAS + 2*PAD) / 3
  ```
- **Output:** `Pressão Arterial Média (PAM): X,X mmHg` + nota "Equação usada: PAM = (PAS + 2*PAD)/3".
- **Premium:** livre.

## 1.3 LDL (Friedewald) — `/equation/category/ldl`
- **TIPO:** calculadora-formula-simples + guard de validade.
- **Inputs:** `Colesterol total` (mg/dL), `HDL` (mg/dL), `Triglicerídeos` (mg/dL).
- **Lógica (literal):**
  ```
  LDL = ColesterolTotal - (Triglicerideos/5) - HDL
  ```
- **Output:** `LDL: X mg/dL` (inteiro) + texto "Equação usada: LDL = Colesterol total - (Triglicerídeos/ 5) – HDL".
- **Guard:** se `Triglicerídeos >= 400` mg/dL → esconde resultado e mostra alerta: *"Este cálculo não é válido quando níveis de Triglicerídeos ≥400 mg/dL."*
- **Premium:** livre.

## 1.4 PaO₂ ideal para a idade — `/equation/category/pao2`
- **TIPO:** calculadora-formula-simples.
- **Inputs:** `Idade` (anos).
- **Lógica (literal):**
  ```
  PaO2_ideal = 109 - 0.43 * idade
  ```
- **Output:** `PaO₂ ideal para a idade: X mmHg` (inteiro). Só aparece se idade ≠ 0.
- **Premium:** livre. Vive como aba de Ventilação Mecânica.

## 1.5 Relação P/F (PaO₂/FiO₂) — `/equation/category/relacao-pf`
- **TIPO:** calculadora-formula-simples + classificação por faixas (Berlim/SDRA).
- **Inputs:** `PaO₂` (mmHg), `FiO₂` (%). FiO₂ validado: *"Deve ser entre 21 e 100 %"*.
- **Lógica (literal):**
  ```
  PF = pao2 * 100 / fio2          // se fio2==0 → 0
  ```
- **Output:** `Relação P/F (PaO₂/FiO₂) X mmHg` + faixas SDRA (cada uma marca presença/ausência):
  | Condição | Rótulo | Texto faixa |
  |---|---|---|
  | `PF > 300` | SDRA Ausente | > 300 |
  | `200 < PF ≤ 300` | SDRA Leve | > 200 e ≤ 300 |
  | `100 < PF ≤ 200` | SDRA Moderada | 100 e ≤ 200 |
  | `PF ≤ 100` | SDRA Grave | ≤100 |
  + rodapé: "* SDRA - Síndrome do Desconforto Respiratório Agudo".
- **Premium:** livre. Resultado só com pao2≠0 E fio2≠0.

## 1.6 Peso Ideal + Volume Corrente — `/equation/category/peso-ideal-volume-corrente`
- **TIPO:** calculadora-formula-simples (Devine) → deriva VC.
- **Inputs:** `Altura` (cm), `Sexo` (toggle Masculino=1 / Feminino=2).
- **Lógica (literal — fórmula de Devine):**
  ```
  // Masculino (c===1):
  pesoIdeal = 50   + 0.91*(altura - 152.4)
  // Feminino (c===2):
  pesoIdeal = 45.5 + 0.91*(altura - 152.4)
  // VC por kg de peso predito:
  corrente6 = 6*pesoIdeal ; corrente7 = 7*pesoIdeal ; corrente8 = 8*pesoIdeal
  ```
- **Output:** `Peso ideal X,X kg` + "Volume Corrente para ventilação mecânica:" com linhas 6/7/8 mL/kg em mL.
- **Guard:** altura válida apenas `123–213 cm`; fora disso → alerta *"Altura deve ser entre 123 e 213 cm"* e nenhum resultado.
- **Premium:** livre.

## 1.7 Taxa de Infusão — `/equation/category/taxa-infusao`
- **TIPO:** conversor/calculadora de velocidade de infusão.
- **Inputs:** `valorASerInfundido` (mL), `tempoInfusao` (numérico), `selectResult` (unidade de saída — dropdown c/ fator `.b`), `selectTime` (unidade de tempo — dropdown c/ fator `.b`).
- **Lógica (literal):**
  ```
  result = valorASerInfundido / (tempoInfusao / unidadeTempo.b) * unidadeResultado.b
  // se NaN/±Inf → 0
  ```
  Onde `unidadeTempo.b` e `unidadeResultado.b` são fatores de conversão dos dropdowns.
- **Output:** "Fazer <result> <unidade>" + nota fixa "1mL = 20 gotas" (suporta saída em gotas/min via fator 20).
- **Premium:** livre. Ícone usa `calcmed_eletro.svg`.

---

# 2. Multi-fórmula (vários métodos sobre os mesmos inputs)

## 2.1 Intervalo QTc — `/equation/category/intervalo-qtc`
- **TIPO:** calculadora-multi-formula (4 fórmulas de correção) + faixas de referência.
- **Inputs:**
  - `Intervalo QT` (com toggle de unidade `selectMsQ`: ms **ou** "quadradinhos"/▢ — fator `.b`).
  - `Frequência cardíaca` (bpm) **OU** `Intervalo RR` (ms) — mutuamente exclusivos (preencher um zera o outro).
  - O RR pode também vir em ▢ (`selectMsQRR`).
- **Lógica (literal — getters):**
  ```
  getIntervaloQT      = QT_input * selectMsQ.b           // converte ▢→ms se preciso
  getIntervaloRR      = (se FC informada e em "2") = FC.b / b ; senão RR direto ;
                        se r≠0 → 60000/r  (RR derivado de FC: 60000/FC)
  getFrequenciaCardiaca = (deriva FC a partir de RR): 60000/(RR*selectMsQRR.b)

  // Fórmulas de QTc (todas retornam 0 se QT==0; NaN/±Inf → 0):
  Bazett     = QT / (RR/1000)^0.5
  Fridericia = QT / (RR/1000)^(1/3)        // Math.pow(s/1000, 0.3333333333333333)
  Framingham = QT + 0.154*(1000 - RR)      // "framigham" no código (typo)
  Hodges     = QT + 1.75*(FC - 60)
  ```
- **Output:** card "Resultados" com 4 linhas (`Er`), QTc em ms (arredondado): Fridericia, Framingham, Hodges, Bazett.
- **Valores de referência (texto fixo):**
  - Mulheres até 450 ms · Crianças até 460 ms · Homens até 470 ms · QTc curto: < 340 ms.
  - Nota 1: Bazett tem limitação em FC < 60 e > 90 bpm.
  - Nota 2: RR irregular (FA) → média de ≥5 QT em D2 (preferir Fridericia) + média de ≥10 RR.
  - Nota 3: BRE/marcapasso → usar QT modificado por Bogossian: `QTm = QT - (QRS/2)`.
- **Premium:** livre.

## 2.2 Clearance de Creatinina — `/equation/category/crearance-creatinina`
- **TIPO:** calculadora-multi-formula (CKD-EPI 2021, CKD-EPI 2009 raça, Cockcroft-Gault) + estadiamento DRC.
- **Inputs:** `homemMulher` (sexo, 1/2), `blackWhite` (raça — usada no CKD-EPI 2009 e p/ habilitar 2021), `idade`/`age` (anos), `serumCreatinine`/`weight` (creatinina mg/dL, peso kg). (Há dois conjuntos de campos: `tfg`/`gfr` e o Cockcroft `gam`/`gfrCockroft`.)
- **Lógica (literal):**
  - **CKD-EPI 2021 (sem raça) — `tfg`:**
    ```
    // s = ponto de corte por sexo (0.7 mulher / 0.9 homem) ; r = expoente baixo ;
    // q = fator sexo (1.012 se mulher)
    tfg = 142 * min(scr/s, 1)^kappa * max(scr/s, 1)^(-1.2) * 0.9938^idade * q
    ```
    (forma canônica CKD-EPI 2021: 142 · min(Scr/κ,1)^α · max(Scr/κ,1)^−1.200 · 0.9938^idade · [×1.012 se mulher]).
  - **CKD-EPI 2009 (com raça) — `gfr`:** cascata de 8 ramos por (raça×sexo×corte de creatinina). Coeficientes literais observados:
    ```
    mulher, scr<=0.7 : 166 * (scr/0.7)^-0.329 * 0.993^idade
    mulher, scr>0.7  : 166 * (scr/0.7)^-1.209 * 0.993^idade
    homem,  scr<=0.9 : 163 * (scr/0.9)^-0.411 * 0.993^idade
    homem,  scr>0.9  : 163 * (scr/0.9)^-1.209 * 0.993^idade
    // (os ramos 144/141 são o conjunto "branco/não-preto", mesma estrutura)
    ```
    > NOTA DE INCERTEZA: os blocos 166/163 vs 144/141 dependem da flag `blackWhite` (b===1 vs b===2). O código não expõe legendas claras de qual flag = "negro"; estrutura matemática transcrita fielmente, rotulagem de raça é inferência.
  - **Cockcroft-Gault — `gam` (`calculateTfge`):**
    ```
    homem  (r===1): (140-idade)*peso / (scr*72)
    mulher (r===2): (140-idade)*peso / (scr*72) * 0.85
    // NaN/±Inf → 0
    ```
- **Output / Estadiamento (`estagio`/`estagioCockroft`) por TFG:**
  | TFG (mL/min/1,73m²) | Estágio |
  |---|---|
  | `≥ 90` | GI |
  | `60–<90` | GII |
  | `45–<60` | GIII a |
  | `30–<45` | GIII b |
  | `15–<30` | GIV |
  | `< 15` | GV |
- **Premium:** livre.
- **Peculiaridade:** duas fórmulas paralelas (CKD-EPI e Cockcroft) com inputs separados; mesmo critério de estadiamento aplicado a ambas.

---

# 3. Escore com decisão em árvore (PPS)

## 3.1 Escala PPS (Palliative Performance Scale) — `/equation/category/escala-PPS`
- **TIPO:** escore-por-árvore-de-decisão (não soma de pontos — é cascata de selects que converge num percentual).
- **Inputs (selects encadeados):**
  1. **Deambulação** (`deambulacaoValueSelected`, valores "0".."5").
  2. **Atividade / Evidência de doença** — duas variantes (`...Completa` quando deambulação="0"; `...Reduzida` quando deambulação="1").
  3. **Autocuidado** (`acamadoAutocuidado`) quando deambulação="3".
  4. **Ingestão** (`acamadoIngestao`) e **Nível de consciência** nos ramos acamado.
- **Lógica (literal — exemplos dos getters de score):**
  ```
  score100 = deambulacao=="0" && atividadeCompleta=="0"
  score90  = deambulacao=="0" && atividadeCompleta=="1"
  score80  = deambulacao=="0" && atividadeCompleta=="2"
  score70  = deambulacao=="1" && atividadeReduzida=="0"
  score60  = deambulacao=="1" && atividadeReduzida=="1"
  // ramos 50/40/30/20/10/0 vêm de deambulacao=="2".."5" + autocuidado + ingestão + consciência
  ```
- **Tabela PPS reconstruída (eixos do código):**
  | % | Deambulação | Atividade / Evidência de doença | Autocuidado | Ingestão | Nível de consciência |
  |---|---|---|---|---|---|
  | 100 | Completa | Atividade normal, sem evidência | Completo | Normal | Completo |
  | 90 | Completa | Atividade normal, alguma evidência | Completo | Normal | Completo |
  | 80 | Completa | Atividade normal com esforço, alguma evidência | Completo | Normal | Completo |
  | 70 | Reduzida | Incapaz p/ trabalho normal, doença significativa | Completo | Normal ou reduzida | Completo |
  | 60 | Reduzida | Incapaz p/ hobbies/trabalho doméstico | Assistência ocasional | Normal ou reduzida | Completo ou com períodos de confusão |
  | 50 | Maior parte sentado/deitado | Incapacitado p/ qualquer trabalho, doença extensa | Assistência ocasional | Normal ou reduzida | Completo ou com períodos de confusão |
  | 40 | Acamado | Idem | Assistência considerável | Normal ou reduzida | Completo ou com confusão |
  | 30 | Totalmente acamado | Idem | Dependência total | Reduzida | Completo ou em coma |
  | 20 | Totalmente acamado | Idem | Dependência total | Mínima | Completo ou em coma |
  | 10 | Totalmente acamado | Idem | Dependência total | Cuidados orais | Confuso ou em coma |
  | 0 | Morte | — | — | — | — |
  > Rótulos literais capturados: "Completo", "Normal", "Assistência ocasional", "Normal ou reduzida", "Completo ou com períodos de confusão", "Incapacitado para qualquer trabalho, doença extensa", "Confuso ou em coma". Imagem de apoio: `assets/images/pps.jpg`. Algumas células acima são a leitura padrão da PPS onde o código mostra só a imagem (flag de incerteza: o app exibe a linha+imagem, não texto célula-a-célula em todos os níveis).
- **Output:** card com a pontuação (`rC` → "Pontuação X%") + recorte da imagem da tabela PPS destacando a linha.
- **Premium:** livre.

---

# 4. Motor de Escores (data-driven) — `/equation/score-categories/`

## 4.1 Visão geral
- **TIPO:** ferramenta genérica / escore-por-pontos configurável (mesmo engine do **Admin de Escores**).
- **Rotas:**
  - `/score-categories/` → lista de categorias (`PG`).
  - `/score-categories/:idCategory/` → escores da categoria (`Wc`).
  - `/score-categories/:idCategory/score/:idScore` → tela de execução do escore (`S1`).
  - `/score-categories/:idCategory/score`, `.../score/new/question`, `/score-categories/new` → CRUD (criação/edição de escore, `W8`/`W9`/`W7`).
- **Premium:** acesso via área de Escores (gating de plano não confirmado no bundle — flag de incerteza).

## 4.2 Modelo de dados (literal)
- `Score` (`j6`): `{ name, category, id, aditionalTexts[], result, questions[] }`. (chave de banco `aditionalTexts` — typo load-bearing, igual ao Admin.)
- `Question`: lista de opções; cada opção carrega pontos.
- `ResultVariation` (`nW`): `{ id, title, meaning, biggerThen }` — limiar `biggerThen` define a faixa.
- `AditionalText` (`amM`): `{ meaningTitle, variations[] }`.
- `pF`: `{ id, title, description }` (texto auxiliar/critério).
- Parsing: `biggerThen` lido como inteiro (`A.aj(... "biggerThen")`, default 0).

## 4.3 Lógica de resolução
- **Escore por pontos:** soma os pontos das opções selecionadas em cada `Question`.
- **Resolução de faixa:** seleciona a `ResultVariation` cujo `biggerThen` é o maior limiar `≤` total (padrão "maior ou igual ao threshold"). Exibe `title` + `meaning` + `aditionalTexts`.
  > NOTA DE INCERTEZA: o somatório/comparador exato (`>=` vs `>`) está distribuído na tela `S1` e não foi isolado num único getter literal neste cluster; a semântica (limiar `biggerThen` por faixa) é inequívoca pelo modelo. Conteúdo clínico de cada escore vem do backend/Admin, não hardcoded.
- **Conteúdo:** os escores reais (SOFA, etc.) são dados, não código — populados via Admin de Escores (ver `project_admin_escores.md`).

---

# PADRÕES (arquétipos observados neste cluster)

1. **calculadora-formula-simples** — 1-2 inputs numéricos, 1 fórmula fechada, output direto. Guard NaN/±Inf→0 universal. Vírgula→ponto (`A.X(a,",",".")`). Ex.: IMC, PAM, LDL, PaO₂, Relação P/F, Peso Ideal/VC.
2. **calculadora-com-classificacao-por-faixas** — fórmula + tabela de faixas onde a linha correspondente é destacada (cada faixa é um booleano `valor>=a && valor<b`). Ex.: IMC (6 faixas), Relação P/F (4 faixas SDRA), Clearance (6 estágios DRC).
3. **calculadora-multi-formula** — mesmos inputs → N métodos exibidos lado a lado (sem escolher "o certo"). Ex.: QTc (Bazett/Fridericia/Framingham/Hodges), Clearance (CKD-EPI 2021 + CKD-EPI 2009 + Cockcroft).
4. **conversor-com-fatores-de-dropdown** — o cálculo multiplica/divide por `.b` de itens de dropdown (fatores de unidade). Ex.: Taxa de Infusão, e os QT/RR em "quadradinhos".
5. **input-mutuamente-exclusivo** — preencher campo A zera campo B (e vice-versa). Ex.: QTc (FC ⟷ RR).
6. **escore-por-arvore-de-decisao** — selects encadeados convergem num resultado categórico; sem soma. Ex.: PPS.
7. **escore-por-pontos data-driven** — engine genérico (`j6`/`nW`) que soma pontos de opções e resolve faixa por `biggerThen`; conteúdo vinde do Admin. Ex.: toda a seção "Escores".
8. **guard-de-validade-clinica** — esconde resultado + mostra alerta fora de domínio válido. Ex.: LDL (TG≥400), Peso Ideal (altura 123-213), Relação P/F (FiO₂ 21-100).
9. **hub-de-abas (sub-calculadoras)** — uma categoria-tela agrupa várias calculadoras como abas. Ex.: Ventilação Mecânica = Parâmetros Iniciais + Peso Ideal/VC + PaO₂ + Relação P/F.
