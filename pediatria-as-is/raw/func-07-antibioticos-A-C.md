# Func — Lógica de Cálculo — Antibióticos (A a C)

> Extração da LÓGICA DE CÁLCULO (não da prosa) dos controllers minificados do bundle Flutter (`_source/main.decoded.js`), para alimentar motor de dose + schema JSON. Conteúdo clínico em prosa: ver `raw/02a-antibioticos-A-C.md`.
>
> **Convenções desta seção:**
> - `peso` = peso em kg (input do usuário; `this.a` no código).
> - mg/mL das apresentações são literais; quando a fórmula é `mg/kg ÷ concentração` o app já dá o fator multiplicativo direto sobre o peso (ex.: 10 mg/kg ÷ 50 mg/mL = `peso×0.2`).
> - "regra observada" = inferida do template/named-equation quando o getter aritmético não foi 100% desdobrado; flag de incerteza explícito.
> - Empty state global: `Informe todos os dados para obter o resultado.`
> - Arredondamento: getters formatam via `B.e.t(expr, casas)`; casas anotadas por droga onde conhecidas.

---

## 1. Acetilcefuroxima — `peso-computado` (multi-indicação)

- **inputs:** Peso (kg). Sem idade, sem select.
- **apresentação:** Pó p/ suspensão oral 250 mg/5 mL = **50 mg/mL**.
- **VERIFICADO no bundle** (`gauA`/`gauB`):
  - Indicação 1 (Amigdalite/faringite, 10 mg/kg): `mL = 10*peso/50` = **peso×0.2**. Máx 500 mg/dia.
  - Indicação 2 (Otite/sinusite/pneumonia/ITU/pele, 15 mg/kg): `mL = 15*peso/50` = **peso×0.3**. Máx 1.000 mg/dia.
- **intervalo:** ambas 12/12 h, VO.
- **contraindicação idade:** "Doses indicadas para crianças > 3 meses".

## 2. Albendazol — `faixa-etaria-lookup` + 1 ramo `peso-computado` (Cisticercose)

- **inputs:** Peso (kg, placeholder `0.0`, 2 casas). Idade NÃO é input numérico — as faixas `≥ 2 anos` / `< 2 anos` aparecem como rótulos de dose fixa (o usuário lê e escolhe).
- **apresentação:** Solução oral 40 mg/mL.
- **regra:** dose FIXA por indicação/faixa, NÃO computa por peso, EXCETO Cisticercose:
  - Ascaridíase / Ancilostomíase: `≥2a → 10 mL`, `<2a → 5 mL` (dose única).
  - Tricuríase: 10 mL 1x/dia 3-7 dias. Enterobíase: 10 mL DU (repetir 2 sem). Toxocaríase: 10 mL 2x/dia 5 dias. Giardíase: 10 mL 2x/dia 5 dias.
  - **Cisticercose (único computado):** `mL = peso×0.1875` (1 casa), **teto 15 mL/dose**, 2x/dia 2-4 semanas. (0.1875 = 7.5 mg/kg/dose ÷ 40 mg/mL.)
- **flag:** Cisticercose é híbrido visual (texto fixo "10 mL" + alternativa calculada).

## 3. Amicacina — `hibrido` (peso-computado × select de concentração × faixa neonatal/idade)

- **inputs:** Peso (kg, 1 casa); **Select de concentração** 3 opções: 50 / 125 / 250 mg/mL (ampola 2 mL).
- **dosing_type:** peso-computado por linha, mas as LINHAS são gated por faixa etária/IG (neonato) → híbrido.
- **mg/kg/dose por cenário (strings fixas, iguais nas 3 concentrações):** 15, 17.5, 7.5, 10, 30, 5, 6.7.
- **mg exibido = fator × peso:** `15*peso`, `17.5*peso`, `7.5*peso`, `10*peso`, `30*peso`, `5*peso`, `6.7*peso`.
- **mL = mg/concentração → fatores por concentração (verbatim doc, derivados named-equation):**
  - **50 mg/mL:** 15→`0.3*peso`, 17.5→`0.35*peso`, 7.5→`0.15*peso`, 10→`0.2*peso`, 30→`0.6*peso`, 5→`0.1*peso`, 6.7→`0.13*peso`. Diluente proporcional p/ ≤5 mg/mL (ex.: `2.7*peso`, `1.8*peso`, `1.35*peso`).
  - **125 mg/mL:** 15→`0.12*peso`, 17.5→`0.14*peso`, 7.5→`0.06*peso`, 10→`0.08*peso`, 30→`0.24*peso`, 5→`0.04*peso`, 6.7→`0.054*peso`.
  - **250 mg/mL:** 15→`0.06*peso`, 17.5→`0.07*peso`, 7.5→`0.03*peso`, 10→`0.04*peso`, 30→`0.12*peso`, 5→`0.02*peso`, 6.7→`0.0268*peso`.
- **faixas etárias / gating (neonato, exceto SNC):**
  - IG <30 sem: ≤14d → 15 mg/kg 48/48h; >14d → 15 mg/kg 24/24h.
  - IG 30-34 sem: ≤10d → 15 mg/kg 24/24 ou 36/36h; 11-60d → 15 mg/kg 24/24h.
  - IG ≥35 sem: ≤7d → 15 mg/kg 24/24h; 8-60d → 17.5 mg/kg 24/24h.
  - SNC neonato (≥2 kg): ≤7d → 7.5-10 mg/kg 12/12h; >7d → 10 mg/kg 8/8h.
  - Crianças/lactentes (exceto SNC): Esq1 15-30 mg/kg 24/24h; Esq2 5-7.5 mg/kg 8/8h.
  - SNC: 6.7-10 mg/kg 8/8h. Intra-abdominal: 5-7.5 mg/kg 8/8h.
- **regra de diluição:** SF 0,9%/SG 5% até ≤5 mg/mL; IM não dilui.
- **flag:** tabela extensa (3 conc × ~8 cenários × IM/EV/diluente); fatores acima cobrem todos os cenários; volumes individuais por linha = aplicar fator.

## 4. Amoxicilina — `peso-computado` (ranges min-max, multi-apresentação)

- **inputs:** Peso (kg, `0.0`, 2 casas). Sem select (todas as apresentações exibidas juntas).
- **contraindicação idade:** posologia p/ crianças ≥ 3 meses.
- **Regime padrão (40-50 mg/kg/d, máx 500 mg/dose):**
  - 250 mg/5 mL: `peso×0.267` a `peso×0.33` mL, 8/8h, **teto 10 mL/dose**.
  - 400 mg/5 mL: `peso×0.25` a `peso×0.3125` mL, 12/12h, **teto 6,25 mL/dose**.
  - 500 mg/5 mL: `peso×0.133` a `peso×0.1667` mL, 8/8h, **teto 5 mL/dose**.
- **Regime dose alta (80-90 mg/kg/d, máx 4000 mg/dia):**
  - 250 mg/5 mL: `peso×0.8` a `peso×0.9` mL, 12/12h, **teto 40 mL/dose**.
  - 400 mg/5 mL: `peso×0.5` a `peso×0.5625` mL, 12/12h, **teto 25 mL/dose**.
  - 500 mg/5 mL: `peso×0.4` a `peso×0.45` mL, 12/12h, **teto 20 mL/dose**.

## 5. Amoxicilina + Clavulanato — `hibrido` (peso-computado × select de apresentação × ramo por idade na opção 3)

- **inputs:** Peso (kg, `0.0`, 2 casas); **Select** 4 opções (id 0/1/2/3).
- **contraindicação idade:** VO ≥ 2 meses.
- **Opção 0 — Susp 125+31,25 mg/5 mL** (8/8h, **teto 20 mL/dose**):
  - leve-moderada (25/3,6 mg/kg/dia): `mL = min(peso×0.33, 20)`.
  - grave (45/6,4 mg/kg/dia): `mL = min(peso×0.6, 20)`.
- **Opção 1 — Susp 250+62,5 mg/5 mL** (8/8h, **teto 10 mL/dose**):
  - leve-mod: `min(peso×0.16, 20)`; grave: `min(peso×0.3, 20)`. (cap interno 20, mas doc exibe máx 10/dose — flag.)
- **Opção 2 — Susp 400+57 mg/5 mL** (12/12h, **teto 10 mL/dose**):
  - leve-mod: `min(peso×0.15625, 10)`; grave: `min(peso×0.28125, 10)`.
- **Opção 3 — Pó injetável 1.000+200 mg** (gating por idade):
  - ≤28 dias: 1 frasco + SF 100 mL (10 mg/mL); `mL = min(peso×2.5, 100)` EV 30-40 min 12/12h.
  - >28d a 12 anos: `mL = min(peso×2.5, 100)` (regra observada, mesmo fator) EV 8/8h, **teto 100 mL/dose**.
  - ≥12 anos: FIXO 100 mL EV 8/8h (1.000+200 mg).

## 6. Amoxicilina + Sulbactam — `hibrido` (select × peso × faixa idade)

- **inputs:** Peso (kg, 1 casa); **Select** opções 0/1/2/default.
- **named-equations VERIFICADAS no bundle:** `weightX01`=`peso×0.1`, `weightX025`=`peso×0.25`, `weightX0175`=`peso×0.175` (gatilhos `gaCo/gaCr/gaCq`). Demais gatilhos (`gCb,gUB,gpV,gaCx,gagc,gaCu,gagd,gaCv,gage,gaCm,gaCn,gaCz`) não 100% desdobrados.
- **Opção 0 — Susp Oral 200+50 mg/mL** (12/12h, **teto 5 mL/dose**): 40-100 mg/kg/dia amox; range `v1` a `v2` via `gaCo`/`gaCr` (≈ `peso×0.1` a `peso×0.25`, **regra observada** das named-equations — CONFIRMAR clinicamente).
- **Opção 1 — Comprimido 875+125 mg:** FIXO 1 comp 12/12h, crianças > 12 anos.
- **Opção 2 — Pó injetável 500+250 mg** (>12 anos): reconstituir em 3,5 mL; IM/EV 12/12 e 8/8h; range aspirado `[v] mL ([mg] mg)`; bloco final fixo "diluir 2 frascos p/ 50 mL".
- **Opção default — Pó injetável 1000+500 mg:** reconstituir 3,5 mL; IM/EV 12/12 e 8/8h (40-50 mg/kg/dia); ramo ≥12 anos com diluição fixa.
- **flag:** fatores numéricos exatos das opções injetáveis não desdobrados; doses mg/kg/dia, diluições e frequências verbatim em 02a.

## 7. Ampicilina — `hibrido` (select × peso; injetável usa expansão 3→3,4 mL)

- **inputs:** Peso (kg, `0.0`, 2 casas); **Select** id 0/1/2.
- **contraindicação idade:** doses NÃO indicadas p/ período neonatal. Máx EV 12 g/dia.
- **Opção 0 — 50 mg/mL VO** (50-100 mg/kg/dia, 6/6h, **teto 10 mL/dose**): `mL = peso×0.25` a `peso×0.5`.
- **Opção 1 — 500 mg injetável** (reconstituir 3 mL → 3,4 mL):
  - **mg de referência:** `12.5*peso` (mín), `50*peso`, `75*peso`, `100*peso`.
  - **VERIFICADO:** fórmula base de volume = `mg×3.4/500`, i.e. `gbPt = 50*peso*3.4/500` (= `peso×0.34`). Gatilhos `gceh/gceg/gbPt/gbPr/gbPw/gbPs/gbPx`.
  - diluente EV = `mg/30` mL (concentração-alvo 30 mg/mL). IM/EV 6/6h por indicação (vias respiratórias 50-200; osteomielite 200; endocardite 200-300; meningite 300-400 mg/kg/dia).
- **Opção 2 — 1.000 mg injetável** (reconstituir 3 mL → 3,4 mL): fórmula base `mg×3.4/1000`; gatilhos `gbPo/gbPm/gbPq/gbPn/gbPu/gbPp/gbPv`. Mesmas indicações.

## 8. Ampicilina + Sulbactam — `hibrido` (select × peso × faixa idade; expansão por apresentação)

- **inputs:** Peso (kg, 1 casa); **Select** id 0/default.
- **Opção 0 — Pó injetável 1.000+500 mg/mL:** reconstituir 3,2 mL → **4,1 mL** (expansão). Faixas:
  - RN prematuro: 50 mg/kg/dia ÷2 (IM/EV 12/12h).
  - RN a termo: 100 mg/kg/dia ÷3-4 (EV 6/6 ou 8/8h).
  - Lactentes/crianças/adolescentes: 100-200 mg/kg/dia ÷4 (EV 6/6h).
  - Endocardite 200-300; intra-abdominal/tecidos moles 200; rinossinusite grave 200-400; meningite 400 mg/kg/dia (EV 6/6 e 4/4h).
- **Opção default — Pó injetável 2.000+1.000 mg/mL:** reconstituir 6,4 mL → **8,4 mL**; mesma lista de faixas.
- **flag:** volumes/mg por linha vêm de gatilhos `gUx,gpV,gUC,ga2G,gIA,gagf,gNh,gy5,gUD,gaCs,gagg,gUG,gaga,gUz,gUA,gag8,gUE,gUF,gUy,gCb,gNi,gaCt,gagb,gag9`; fatores numéricos NÃO desdobrados. Diluição: conc. final ≤45 mg/mL com SF 0,9%.

## 9. Azitromicina — `hibrido` (select VO/EV × peso × multi-indicação)

- **inputs:** Peso (kg, 1 casa); **Select via** 2 opções: VO (40 mg/mL) `B.Ef` / EV (500 mg) `B.Eg`. `l`=peso.
- **VIA ORAL (`bfq`) — fatores VERIFICADOS no template (mL = mg/40):**
  - 10 mg/kg/dia: `mL = 0.25*peso`, mg = `10*peso`, 24/24h, **teto 12,5 mL/dose (500 mg)**.
  - Chlamydia trachomatis (>45 kg): FIXO 25 mL = 1 g, DU.
  - Pneumonia congênita Chlamydia (lactente) 20 mg/kg/dia ×3d: `mL = 0.5*peso`, mg = `20*peso`.
  - Coqueluche 1-6 m: 10 mg/kg/dia ×5d → `0.25*peso`. ≥6 m: Dia1 `0.25*peso` (10 mg/kg, teto 12,5 mL); Dia2-5 `0.125*peso` (5 mg/kg, teto 6,3 mL/250 mg).
  - Amigdalite EGA 12 mg/kg/dia ×5d: `mL = 0.3*peso`, mg = `12*peso`, teto 12,5 mL.
  - Fibrose cística (≥3 m) 10 mg/kg 3x/sem: `0.25*peso`, teto 12,5 mL.
- **USO EV (`b8h`)** — reconstituir 1 amp em 5 mL AD → diluir p/ ≥1 mg/mL em SF; infusão mín 1h (pref 3h):
  - 10 mg/kg/dia: aspirar `0.1*peso` mL (100 mg/mL) + diluir em `10*peso` mL SF (1 mg/mL), EV 3h 24/24h.
  - Pneumonia Chlamydia 20 mg/kg/dia ×3d: aspirar `0.2*peso` + diluir `20*peso` mL.
  - Coqueluche 1-6m: aspirar `0.1*peso` + `10*peso` mL. ≥6m: Dia1 `0.1*peso`/`10*peso` (teto 500 mg); Dia2-5 `0.05*peso`/`5*peso` (teto 250 mg).
- **flag:** bloco Cuidados (`B.bDB`) não desdobrado.

## 10. Cefalexina — `hibrido` (select apresentação × peso, ranges por gravidade/frequência)

- **inputs:** Peso (kg, `0.0`, 2 casas); **Select** id 0 (250 mg/5 mL) / id 1 (500 mg/5 mL).
- **Opção 0 (250 mg/5 mL):**
  - não graves (25-50 mg/kg/dia): 6/6h `peso×0.125` a `peso×0.25` (teto 10 mL); ou 12/12h `peso×0.25` a `peso×0.5` (teto 10 mL).
  - graves (75-100 mg/kg/dia): 6/6h `peso×0.375` a `peso×0.5` (teto 20 mL); ou 8/8h `peso×0.5` a `peso×0.66` (teto 26 mL).
- **Opção 1 (500 mg/5 mL):**
  - não graves: 6/6h `peso×0.0625` a `peso×0.125` (teto 5 mL); ou 8/8h `peso×0.125` a `peso×0.25` (teto 20 mL).
  - graves: 6/6h `peso×0.1875` a `peso×0.25` (teto 10 mL); ou 8/8h `peso×0.25` a `peso×0.33` (teto 13 mL).
- **flag:** opção 1 exibe resíduo `(45/6,4 mg/kg/dia)` herdado de amox-clav — bug de conteúdo, transcrito verbatim.

## 11. Cefepima — `peso-computado` (select apresentação; expansão 10→11,4 mL) — VERIFICADO

- **inputs:** Peso (kg, 1 casa); **Select** id 0 (1.000 mg) / default (2.000 mg).
- **VERIFICADO no bundle:** dose `gHc = 50*peso` (50 mg/kg/dose); `vol1000 = dose*11.4/1000`; `vol2000 = dose*11.4/2000`; diluente FIXO `gRP = 50` mL.
- **prescrição:** reconstituir frasco em 10 mL → expande p/ 11,4 mL; aspirar `[mL]` + diluir em 50 mL SF, EV 30 min.
  - não-Pseudomonas/ITU/pneumonia: 50 mg/kg/dose 12/12h.
  - Pseudomonas/FC/neutropenia febril/meningite: 50 mg/kg/dose 8/8h.
- **teto:** máx EV 2 g/dose. **contraindicação idade:** NÃO neonatal.

## 12. Ceftriaxone — `peso-computado` (range 50-100 mg/kg, EV e IM) — VERIFICADO

- **inputs:** Peso (kg, `0.0`, 2 casas). Sem select.
- **Dose usual:** 50-100 mg/kg/dia EV/IM, 1x/dia.
- **EV:** aspirar `peso×0.5` mL (50 mg/kg) a `peso×1.0` mL (100 mg/kg); diluir em 30 mL SF; EV 30 min (60 min se RN), 24/24h. (500 mg → 5 mL AD; 1000 mg → 10 mL AD.)
- **IM:** `peso×0.2` mL (50 mg/kg) a `peso×0.4` mL (100 mg/kg), 24/24h. (500 mg → 2 mL dil; 1000 mg → 3,5 mL dil.)
- **intervalo:** pode fracionar 12-24h.

## 13. Cefuroxima — `peso-computado` (range por indicação, IM e EV; expansão por via) — VERIFICADO

- **inputs:** Peso (kg, 1 casa). Sem select. Apresentação: pó injetável 750 mg.
- **VERIFICADO (controller `mS`, `a`=peso):**
  - **mg/dose:** `33.33*peso` (100 mg/kg/dia÷3), `50*peso` (150), `35*peso` (105), `66.67*peso` (200).
  - **IM:** reconstituir 3 mL → 3,5 mL; `mL = mg*3.5/750`.
  - **EV:** reconstituir 8 mL → 8,6 mL; diluir em 50 mL SF, EV 30 min; `mL = mg*8.6/750`.
- **indicações (ranges):** geral 100-150 mg/kg/dia 8/8h; pneumonia 105-150 8/8h; intra-abdominal/osteoarticular (≥3 m) 150-200 mg/kg/dia 6/6 ou 8/8h.
- **teto:** máx EV 6 g/dia. **contraindicação idade:** NÃO neonatal.

## 14. Claritromicina — `hibrido` (select apresentação × peso; EV contraindicado <18a)

- **inputs:** Peso (kg, 1 casa); **Select** 3 opções: 500 mg injetável `B.Eh` / 25 mg/mL `B.Ei` / 50 mg/mL `B.Ej`. `i`=peso.
- **Opção `B.Eh` (500 mg EV):** SÓ AVISO — "Uso EV não indicado para menores de 18 anos." (sem cálculo). → contraindicação idade.
- **Opções 25 e 50 mg/mL — fatores VERIFICADOS no template (mL = mg/conc):**
  - **25 mg/mL:** `mL = 0.3*peso` (7,5 mg/kg); H. pylori `0.3*peso` a `0.4*peso`; profilaxia 15 mg/kg `0.6*peso`.
  - **50 mg/mL:** `mL = 0.15*peso` (7,5 mg/kg); H. pylori `0.15*peso` a `0.2*peso`; profilaxia `0.3*peso`. Teto exibido `5 mL/dose (250 mg)`.
  - mg = `7.5*peso` (geral), `10*peso` (H. pylori superior), `15*peso` (profilaxia/MAC superior).
- **indicações (todas 7,5 mg/kg 12/12h salvo nota):** EGA (≥6m) 10d; otite média (≥6m) 10d; coqueluche 7d; pneumonia atípica (>3m) 10d; Lyme 2ª linha 14-21d; H. pylori 7,5-10 mg/kg 14d; profilaxia pré-procedimento 15 mg/kg 30-60 min antes; MAC profilaxia 7,5 mg/kg, tratamento combinado 7,5-15 mg/kg.
- **teto geral:** máx 500 mg/dose. **flag:** bloco Cuidados (`B.bHM`) não desdobrado.

---

## FLAGS de incerteza (revisão clínica)

1. **Amox+Sulbactam / Ampi+Sulbactam injetáveis:** doses mg/kg/dia, frequências, diluições e expansões VERBATIM; fatores numéricos multiplicativos por gatilho NÃO 100% desdobrados. Para amox+sulbactam VO opção 0, a regra observada (`peso×0.1` a `peso×0.25`) vem das named-equations `weightX01`/`weightX025` — CONFIRMAR.
2. **Amicacina:** tabela 3 conc × ~8 cenários; todos os fatores listados, mas conferir os fatores de diluente proporcionais por linha.
3. **Cefalexina opção 500 mg/5 mL:** resíduo `(45/6,4 mg/kg/dia)` é bug de conteúdo herdado de amox-clav — não é cálculo.
4. **Cuidados de Azitromicina (`B.bDB`) e Claritromicina (`B.bHM`):** texto não desdobrado nesta passagem (não afeta cálculo).
5. **Amox+Clavulanato opção 1:** doc exibe "Máx 10 mL/dose" mas cap interno do código é 20 — divergência; usar o menor (10) por segurança e CONFIRMAR.

## VERIFICADO direto no bundle (alta confiança)
Acetilcefuroxima (`gauA=10*peso/50`, `gauB=15*peso/50`), Cefepima (`gHc=50*peso`, `×11.4/1000`, `×11.4/2000`, diluente 50), Ampicilina (`mg×3.4/500` e `mg×3.4/1000`), Cefuroxima (`mg×3.5/750` IM, `mg×8.6/750` EV), Amox+Sulbactam named-equations (`weightX01/025/0175`).
