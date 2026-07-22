# App-wide AS-IS — Distúrbios Hidroeletrolíticos + Ácido-Base (lado adulto/geral)

> Fonte: `_source/main.decoded.js` (bundle Flutter/dart2js decodificado). Offsets de byte citados para rastreabilidade.
> Escopo deste doc: `disturbio-sodio`, `disturbio-potassio`, `disturbio-magnesio`, `disturbio-bicarbonato`, `calcio-hipoabuminemia`, `hipocalcemia`, `disturbios-acido-base`, `osmolaridade-plasmatica`, `sodio-hiperglicemia`, `anion-gap` + a categoria-índice `disturbios-hidroeletroliticos`.
> NÃO cobre pediatria (já auditada em raw/01-05).

## Como o app organiza estas features

Há uma **categoria-índice** `disturbios-hidroeletroliticos` (rota `/equation/category/disturbios-hidroeletroliticos`, widget `A.OD`, controller `_CategoryDisturbiosHidroeletroliticosControllerBase`) que é só uma lista de cards. Os 7 filhos (offset ~10737166, getter `bs6`):

| Card (label exibido) | Rota destino | Ícone |
|---|---|---|
| Potássio | `/equation/category/disturbio-potassio` | `k.svg` |
| Sódio | `/equation/category/disturbio-sodio` | `na.svg` |
| Bicarbonato | `/equation/category/disturbio-bicarbonato` | `hco.svg` |
| Magnésio | `/equation/category/disturbio-magnesio` | `mg2.svg` |
| Correção de Sódio pela Glicemia | `/equation/category/sodio-hiperglicemia` | `molecula.svg` |
| Correção de Cálcio pela Albumina | `/equation/category/calcio-hipoabuminemia` | `ca2.svg` |
| Cálcio - Hipocalcemia | `/equation/category/hipocalcemia` | `ca2.svg` |

`anion-gap`, `osmolaridade-plasmatica` e `disturbios-acido-base` **NÃO** estão dentro deste índice — `anion-gap` e `osmolaridade-plasmatica` vivem em uma categoria de "calculadoras gerais" (getter `MH`, offset ~10256000), e `disturbios-acido-base` aparece na lista de Urgências (getter `Za`/`eN1`, label exibido "Distúrbios Ácido-Básicos", flag booleana `!0` no card — ver nota de premium).

Todos compartilham AppBar "Distúrbios Hidroeletrolíticos" (exceto ácido-base, que usa título i18n `urgencies`).

---

## TIPO: Calculadora fórmula-simples

### 1. Ânion Gap (`anion-gap`)
- **Rota:** `/equation/category/anion-gap` · widget `A.N8` (offset 3369404) · controller `_AnionGapControllerBase` (offset 3320898) · State com **2 tabs**.
- **Tab 1 — "Ânion Gap":** inputs Sódio, Cloro, Bicarbonato (todos mEq/L).
  - **Fórmula (literal `p-s-q.c`):** `AG = Sódio − Cloro − Bicarbonato`
  - Output: `"Ânion Gap = X.X mEq/L"` (1 casa). Só mostra com Na, Cl, HCO₃ > 0.
- **Tab 2 — "AG Corrigido":** adiciona input Albumina (g/dL).
  - **Fórmula (literal `s+2.5*(4-q.d)`):** `AG corrigido = AG + 2.5 × (4 − albumina)`
  - Alerta (`gVH`, `d>4`): "Valor de albumina deve ser menor ou igual a 4 g/dL" se albumina > 4.
  - Output: `"AG Corrigido = X.X mEq/L"` (1 casa). Exige os 4 campos > 0.
- **Premium:** não detectado gate (inferência: livre).

### 2. Osmolaridade Plasmática (`osmolaridade-plasmatica`)
- **Rota:** `/equation/category/osmolaridade-plasmatica` · widget `A.Ud` (offset 4135045) · controller `_OsmolaridadePlasmaticaControllerBase` (offset ~4133600).
- **Inputs:** Sódio sérico (mEq/L), Glicose sérica (mg/dL), Ureia sérica (mg/dL).
- **Fórmula (literal `2*p+s/18+q.c/6`):** `Osm = 2×Sódio + glicose/18 + ureia/6`
- **Output:** "A osmolaridade plasmática é de: X mOsm/L" (0 casas) + rodapé "* Valor de referência: 285-295 mOsm/L". Só mostra com os 3 campos ≠ 0.
- **Premium:** não detectado gate (inferência: livre).

### 3. Correção de Sódio pela Glicemia (`sodio-hiperglicemia`)
- **Rota:** `/equation/category/sodio-hiperglicemia` · widget `A.Or` (offset 3707973) · controller `_CategoryCorrecaoSodioHiperglicemiaControllerBase` (offset ~3708900).
- **Inputs:** Sódio medido (mEq/L), Glicose (mg/dL).
- **Fórmula (literal `q+0.016*(r.b-100)`):** `Na corrigido = Na medido + 0.016 × (glicose − 100)`
- **Output:** "O Sódio corrigido é de X.XX mEq/L" (2 casas). Exige os 2 campos ≠ 0.
- **Premium:** não detectado gate (inferência: livre).

### 4. Correção de Cálcio pela Albumina (`calcio-hipoabuminemia`)
- **Rota:** `/equation/category/calcio-hipoabuminemia` · widget `A.O5` (offset 3660043) · controller `_CategoryCalcioCorrigidoHipoalbuminemiaControllerBase` (offset ~3662000).
- **Inputs:** Cálcio sérico (mg/dL), Albumina do paciente (g/dL), + **rádio "Valor de referência da albumina"** = 4.0 g/dL **ou** 4.4 g/dL (exclusivos).
- **Fórmulas (literais):**
  - Ref 4.0 selecionado: `Ca corrigido = Ca + 0.8 × (4 − albumina)` (`q+0.8*(4-r.d)`)
  - Ref 4.4 selecionado: `Ca corrigido = Ca + 0.8 × (4.4 − albumina)` (`q+0.8*(4.4-r.d)`)
- **Validação:** albumina deve ser < ref escolhida ("O valor deve ser menor que 4 g/dL" / "...4.4 g/dL").
- **Output:** "Cálcio corrigido X.X mg/dL" (1 casa).
- **Premium:** não detectado gate (inferência: livre).

---

## TIPO: Calculadora de correção/déficit (com prescrição gerada)

### 5. Distúrbio de Sódio (`disturbio-sodio`) — correção de natremia (Adrogué–Madias)
- **Rota:** `/equation/category/disturbio-sodio` · widget `A.Oz` (offset 3710100) · controller `_CategoryDisturbioSodioControllerBase` (offset ~3351700).
- **Inputs:** Sódio sérico atual (mEq/L), Sódio alvo em 24h (mEq/L), Peso (kg), Sexo (Homem/Mulher), Idade (< 65 anos / ≥ 65 anos), Solução (rádio dependente do distúrbio).
- **Água corporal total (ACT, fração × peso) — literal:**
  - Homem < 65: 0.6 · Homem ≥ 65: 0.5 · Mulher < 65: 0.5 · Mulher ≥ 65: 0.45.
- **ΔNa por litro de solução (`gxK`, literal `(s - Na_sérico)/(ACT + 1)`)** onde Na da solução:
  - Hipernatremia (Na > 145): 77 (salina 0,45%) ou 0 (SG 5%).
  - Hiponatremia (Na ≤ 145): 153 (SF 0,9%) ou 513 (salina 3%).
- **Taxa de infusão mL/h (`gm5`, literal `|(Na_sérico − Na_alvo)/ΔNa × 1000 / 24|`).**
- **Prescrições geradas (literais):**
  - Hipo + Solução 1 (SF 0,9% 153mEq/L): "Soro fisiológico 0,9% EV em BIC a X mL/h durante 24 horas".
  - Hipo + Solução 2 (salina 3% 513mEq/L): "Soro fisiológico 0,9% 450 mL + NaCl 20% 50 mL EV em BIC a X mL/h durante 24 horas".
  - Hiper + Solução 1 (salina 0,45% 77mEq/L): "Água Destilada 490 mL + NaCl 20% 10 mL EV em BIC a X mL/h durante 24 horas".
  - Hiper + Solução 2 (SG 5% 0mEq/L): "Soro Glicosado 5% EV em BIC a X mL/h durante 24 horas".
  - Na 135–145: "Sódio sérico dentro dos limites da normalidade!".
- **Nota fixa (literal):** "Atenção! É indicada variação de sódio sérico de até 6-8 mEq/L em 24h. Evitando efeitos adversos como desmielinização pontina. São aceitas variações maiores em 24h em caso de Hiponatremia Aguda Sintomática, conforme literatura médica."
- **Premium:** não detectado gate (inferência: livre).

### 6. Distúrbio de Bicarbonato (`disturbio-bicarbonato`) — déficit de HCO₃
- **Rota:** `/equation/category/disturbio-bicarbonato` · widget `A.Ou` (offset 3740633) · controller `_CategoryDisturbioBicarbonatoControllerBase` (offset ~3743100).
- **Inputs:** Peso (kg), Bicarbonato Atual (mEq/L), Bicarbonato Alvo (mEq/L).
- **Déficit (`ga2e`/resultR, literal `|0.5 × peso × (alvo − atual)|`)** mEq. `resultZ = 1000 − resultR` (volume de SG p/ completar).
- **Lógica de conduta (por bicarbonato atual):**
  - atual < alvo: "Sem indicação de reposição de bicarbonato."
  - 22 ≤ atual < 28: "Níveis de Bicarbonato dentro da normalidade."
  - atual ≥ 28: "Sem indicação de reposição de bicarbonato."
  - atual < 22 (e campos preenchidos): prescreve **"Fazer X mL de Bicarbonato de Sódio 8,4% + Y mL de SG 5% EV em (2×peso) mL/h"** (X = déficit em mL, taxa fixa = 2×peso mL/h).
- **Indicação fixa (literal):** "Uso na acidose metabólica aguda grave com pH < 7,1 ou em paciente com lesão renal aguda e pH ≤ 7,2". Apresentação: "Bicarbonato de Sódio 8,4% (1 mEq/mL), Frasco com 250 mL".
- **Nota (literal):** "Em geral a variação de Bicarbonato é de 8 a 12 mEq/L."
- **Premium:** não detectado gate (inferência: livre).

---

## TIPO: Protocolo-conduta (conduta exibida conforme valor/estado)

### 7. Distúrbio de Potássio (`disturbio-potassio`)
- **Rota:** `/equation/category/disturbio-potassio` · widget `A.Ox` (offset 3754497).
- **Input:** "Valor do K⁺" (mEq/L). Estado `k.d` ramifica a conduta:
  - **K⁺ 3,0–3,4 (hipocalemia leve a moderada):** "Reposição via oral" (widget `aPQ`): "1) Cloreto de Potássio 600 mg/cp - 1 a 2 cp VO até 6/6h"; "2) Cloreto de Potássio xarope (60 mg/mL) - 10 a 20 mL VO até 6/6h"; "3) Citrato de Potássio (1 g/cp) - 1 cp VO 8/8h durante/após refeições". Caso VO impossibilitada → EV: "Cloreto de Potássio 10% 30 mL + 470 mL SF 0,9% EV em BIC, correr em 4 horas" / "...19,1% 15 mL + 485 mL SF...".
  - **K⁺ < 3 (hipocalemia grave):** "Reposição endovenosa" (widget `aMM`): veia periférica — "Cloreto de Potássio 10% 30 mL + 470 mL SF 0,9% EV em BIC, correr em 3 horas" / "...19,1% 15 mL + 485 mL..."; veia central — "...10% 20 mL + 230 mL SF, correr em 2 horas" / "...19,1% 10 mL + 240 mL...". Associar opções VO.
  - **K⁺ 3,5–5,5:** "Níveis de Potássio dentro da normalidade."
  - **K⁺ 5,5–6 (hipercalemia leve):** widgets `aiy` + `aiz`.
  - **K⁺ > 6:** "Hipercalemia moderada" (6–7) ou "Hipercalemia grave" (>7): widgets `aiy` + `aiz` + `aPR`.
- **Conduta hipercalemia (literais):**
  - `aiy`: "Suspender drogas que aumentam o K⁺ (IECA, BRA, espironolactona, betabloqueador, AINE)"; proteção cardíaca se alteração ECG — "Gluconato de Cálcio 10% 10 mL + 100 mL SG 5% EV em BIC, correr em 10 min (repetir 3x ou até normalizar ECG)"; nota "Alguns autores recomendam quando K⁺ > 6,5 independente de ECG".
  - `aiz` (espoliar): "1) Furosemida (20mg/2mL) 0,5–1mg/kg EV até 4/4h"; "2) Poliestirenossulfonato de Cálcio - Sorcal® (30 g/envelope) 15g + 100 mL água VO 6/6h".
  - `aPR` (translocar/refratário): "3) Hemodiálise se refratária"; "4) Glicoinsulina - Glicose Hipertônica 50% 100 mL + 10 U Insulina Regular EV em BIC em 1 hora"; "5) Salbutamol 40 gotas + 3 mL SF 0,9% inalatória".
- **Premium:** não detectado gate (inferência: livre).

### 8. Distúrbio de Magnésio (`disturbio-magnesio`)
- **Rota:** `/equation/category/disturbio-magnesio` · widget `A.Ow` (offset 3744835).
- **Fluxo ramificado (estado `a5`):**
  - **Torsade de Pointes? (Sim/Não):** Se SIM → escolher apresentação → "Sulfato de Magnésio (10%) 20 mL" ou "(50%) 4 mL" **+ SG 5% 100 mL EV em 2 a 15 min. Administrar novo bolus se a arritmia persistir."
  - Se NÃO → "Sintomas graves (tetania, arritmias ou convulsões) ou instabilidade hemodinâmica? (Sim/Não)":
    - SIM → Ataque + manutenção: "Sulfato de Magnésio (10%) 20 mL ou (50%) 4 mL + SG 5% (ou SF 0,9%) 100 mL EV em 5 a 60 min" seguido de "(10%) 40 mL/80 mL ou (50%) 8 mL/16 mL + SG 5%... EV em 12 a 24 horas".
    - NÃO → input "Valor do Mg²⁺" (mg/dL), classifica:
      - **< 1 — Hipomagnesemia Grave** (assintomático/sintomas mínimos): "(10%) 40 mL + SG 5% 460 mL" ou "(10%) 80 mL + SG 5% 920 mL" / equivalentes 50% — EV em 12 a 24 horas.
      - **1–1,5 — Hipomagnesemia Moderada:** "(10%)... + SG 5% 480 mL EV em 4 a 12 horas" / equivalentes 50%.
      - **1,5–1,9 — Hipomagnesemia Leve:** "(10%) 10 mL + SG 5% 230 mL EV em 2 horas" / "(50%) 2,5 mL + SG 5% 246 mL EV em 2 horas".
      - **1,9–2,5 — Níveis normais de magnésio.**
- **Premium:** não detectado gate (inferência: livre).

### 9. Hipocalcemia (`hipocalcemia`)
- **Rota:** `/equation/category/hipocalcemia` · widget `A.ON` (offset 3769437) · controller `_CategoryHipocalcemiaControllerBase` (offset ~3766000) · State com **2 tabs (Grave / Leve)**.
- **Inputs:** Cálcio total (mg/dL), Albumina (g/dL), Cálcio iônico (mg/dL), checkbox "tem sintomas graves".
- **Cálcio corrigido (literal `q+0.8*(4-r.b)`):** `Ca corrigido = Ca total + 0.8 × (4 − albumina)`.
- **Classificação (`gatb`, literal):** "Grave" se `temSintomasGraves` OU `Ca corrigido ≤ 7,5` OU `Ca iônico ≤ 3`; senão "Leve".
- **Conduta GRAVE (widget `aKW`, constante `u.k7`):** Critérios "Sintomas graves - convulsões, laringoespasmo, arritmias, aumento intervalo QT" / "Cálcio Corrigido ≤ 7,5 mg/dL" / "Cálcio iônico ≤ 3 mg/dL". Tratamento: **"Gluconato de Cálcio 10% - 10 a 20 mL + 50 mL de SG 5%/SF 0,9%, EV em 20 minutos"** (constante `u.p6`), repetir após 10–60 min se necessário; se persistente "Gluconato de Cálcio 10% - 110 mL + 890 mL de SG 5%/SF 0,9%, EV em BIC a 50 mL/h durante 24 horas".
- **Conduta LEVE (widget `aKX`, constante `u.mp`):** Critérios "Assintomático" / "Sintomas leves (parestesias)". Tratamento inicial: "Carbonato de Cálcio 500mg – 2 a 8 comprimidos/dia, fracionado em 3 a 4 doses"; se falha, EV (u.p6); se deficiência de vit. D: "Colecalciferol 50.000 UI VO 1x/semana por 6 a 12 semanas, depois 1.000 UI/dia (ou 7.000 UI/semana)".
- O card de Cálcio Corrigido tem **link cruzado** para `/equation/category/calcio-hipoabuminemia` (widget `bTO`).
- **Premium:** não detectado gate (inferência: livre).

---

## TIPO: Ferramenta interpretadora (analisador de gasometria)

### 10. Distúrbios Ácido-Base (`disturbios-acido-base`)
- **Rota:** `/equation/category/disturbios-acido-base` · widget `A.OB` (offset 3715374) · controller `_CategoryDisturbiosAcidoBaseControllerBase` (offset ~3722000). Label exibido na lista de Urgências: "Distúrbios Ácido-Básicos".
- **Inputs:** pH (a), PaCO₂ mmHg (b), HCO₃⁻ mEq/L (c) obrigatórios; **opcionais** Na⁺ (d), Cl⁻ (e), Albumina (f) — só aparecem quando `gO1` libera (ver Winter); toggle **Cronicidade AGUDO (r=1) / CRÔNICO (r=2)**.
- **Cálculos derivados (literais):**
  - `Ânion Gap (gqm) = Na − Cl − HCO₃`.
  - `AG Corrigido (gtm) = AG + 2.5 × (4 − albumina)`.
  - `DELTA AG / DELTA HCO₃ (gabR) = (AG[ou AGcorr se alb>0] − 10) / (24 − HCO₃)`.
  - `BICE (gaad)` = HCO₃ esperado por compensação respiratória:
    - Acidose resp. aguda (PaCO₂>45, AGUDO): `0.1 × (PaCO₂ − 40)`.
    - Acidose resp. crônica (PaCO₂>45, CRÔNICO): `0.4 × (PaCO₂ − 40)`.
    - Alcalose resp. aguda (PaCO₂<35, AGUDO): `0.2 × (40 − PaCO₂)`.
    - Alcalose resp. crônica (PaCO₂<35, CRÔNICO): `0.45 × (40 − PaCO₂)`.
  - `PCO₂E (gaae)` = PaCO₂ esperado (Winter / compensação metabólica): acidose metabólica → `1.5 × HCO₃ + 8`; alcalose metabólica → `HCO₃ + 15`.
  - `gO1` (libera Na/Cl/albumina): pH 7.35–7.45 com HCO₃ < `0.1×(PaCO₂−40)+22` → true; ou pH fora de 5–7.45.
- **Saída — interpretação textual (`gn5`)** cobre dezenas de combinações; faixa de normalidade pH 7,35–7,45, PaCO₂ 35–45, HCO₃ 21–27 → "Ausência de Distúrbio Ácido-Base". Exemplos literais retornados: "Acidose Respiratória Aguda Compensada", "Acidose Respiratória Aguda + Alcalose Metabólica", "Acidose Respiratória Aguda + Acidose Metabólica com Ânion Gap Normal", "Acidose Metabólica com Ânion Gap Aumentado Compensada + Alcalose Metabólica", "Alcalose Metabólica Primária + Acidose Respiratória Secundária", etc. (lógica: compara HCO₃ medido vs esperado ±2, e o delta-delta `m` decide distúrbio metabólico misto: m≥2 ou ≤0 → +alcalose metab.; 1–2 → puro; <1 → +acidose AG normal).
- **Notas fixas (literais):** "Sempre contextualizar com a clínica; Gasometria venosa pode ser usada (boa correlação com arterial, exceto a PaO₂)." Seção educacional "Causas Comuns dos Distúrbios Ácido-Base" com mnemônico **GOLDMARK** (acidose metab. AG aumentado), causas de AG normal/hiperclorêmica, acidose/alcalose respiratória e alcalose metabólica.
- **Premium:** **incerto/possível gate** — único card do meu domínio com a flag booleana `!0` na 8ª posição do builder `A.c7(...)` (offset ~10737000), enquanto os demais têm `!1`. O significado exato dessa flag (premium/bloqueado vs "expansível") não foi confirmado neste bundle; FLAG DE INCERTEZA.

---

## PADRÕES (arquétipos observados)

1. **Calculadora-fórmula-simples (output reativo):** N inputs numéricos → 1 fórmula fechada → 1 número formatado, mostrado só quando todos os campos estão preenchidos (`camposPreenchidos`/`gB4`). Ex.: Ânion Gap, Osmolaridade, Correção Na/glicemia, Correção Ca/albumina. Padrão de controller: getters memoizados (`A.G(...)`) sobre estado mutável; máscaras de vírgula→ponto (`A.X(a,",",".")`).

2. **Calculadora-de-correção/déficit-com-prescrição:** inputs incluem peso e alvo; calcula déficit/taxa e **gera string de prescrição** (volume + diluente + tempo de BIC). Ex.: Distúrbio de Sódio (Adrogué–Madias com ACT por sexo/idade), Distúrbio de Bicarbonato (`0.5 × peso × Δ`). Sempre acompanham uma "Nota" de segurança (limite de variação em 24h).

3. **Protocolo-conduta-por-faixa-de-valor:** 1 input (o eletrólito) → classifica em faixas (leve/moderada/grave/normal) → renderiza blocos de conduta literais (apresentações + diluições + tempo). Ex.: Potássio (faixas de K⁺), Magnésio (faixas de Mg²⁺ + ramos por Torsade/sintomas graves), Hipocalcemia (Grave vs Leve por Ca corrigido/iônico/sintomas, em tabs).

4. **Conduta-ramificada-por-decisão (sim/não):** árvore de perguntas booleanas antes de mostrar a conduta. Ex.: Magnésio (Torsade? → sintomas graves? → valor).

5. **Ferramenta-interpretadora (analisador):** muitos inputs (incl. opcionais condicionais) → motor de regras encadeadas (compensação esperada, Winter, delta-delta, AG corrigido) → **classificação textual** do distúrbio + conteúdo educacional. Caso único e mais complexo do domínio: Distúrbios Ácido-Base.

6. **Categoria-índice (lista de cards):** tela sem cálculo, só roteia para filhos. Ex.: `disturbios-hidroeletroliticos` (7 cards). Construída via factory `A.c7(...)` com itens filho `A.ax(...)`.

### Notas transversais
- Constantes de texto longo vivem num objeto `u` (offsets ~9198000–9214000): `u.hR`, `u.su`, `u.p6` (Gluconato 10–20 mL), `u.k7` (conduta grave hipocalcemia), `u.mp` (conduta leve), `u.r7`/`u.B`/`u.C` (rotas), etc.
- Formatação de número: `B.e.t(valor, casas)` (toStringAsFixed).
- Premium: **nenhum gate explícito** foi localizado por feature neste recorte (sem `isFree`/`premium` amarrado a estes slugs); o único sinal é a flag booleana `!0` em `disturbios-acido-base` — marcado como INCERTO. O controle de assinatura existe globalmente (`_ChatIAControllerBase.isFreeUser`, `exw`/`premium` no parse de assinatura, offset ~545474) mas não foi possível confirmar quais calculadoras deste domínio são gated.
