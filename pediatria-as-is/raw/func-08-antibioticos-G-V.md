# Lógica de cálculo — Antibióticos pediátricos G a V

> **Fonte:** bundle `main.decoded.js` (Flutter web CalcMed). Conteúdo em prosa já documentado em `raw/02b-antibioticos-G-V.md`. Este doc isola APENAS a **computação** (fatores, concentrações, tetos, faixas) para alimentar motor de dose + schema JSON.
> **Validação bundle:** os 9 controllers `_EquationPediatraAntibioticos{Gentamicina,Meropenem,Metronidazol,PenicilinaGBenzatina,PenicilinaGCristalina,PenicilinaProcaina,Secnidazol,Vancomicina}Controller(Base)` confirmados via grep. Fatores distintivos verificados no bundle (0.2916666666666667, 0.4166666666666667 Metronidazol; 0.0625 Procaina; 33333/37500/62500 Pen. G Cristalina; 2.7/0.9/1.2/1.4 Vancomicina).
> **MÉDICO — vida ou morte:** fatores transcritos exatamente. Onde a dose declarada diverge do multiplicador computado, marcado `FLAG`.
> **Convenção:** `P` = peso digitado (kg). `B.e.t(x, n)` = formata `x` com `n` casas. Volume = mg-alvo ÷ concentração.

---

## Gentamicina — `peso-computado` (com ramos por idade gestacional/idade)

**Inputs:** Peso (kg, 1 casa) · Apresentação (select, 4 opções).

**Apresentações (concentração):**
1. 10 mg/mL (ampola 1 mL) → bloco `ajS`
2. 20 mg/mL (ampola 1 mL) → bloco `ajT`
3. 40 mg/mL (ampola 1 mL) → bloco `ajU`
4. 80 mg/2 mL (= 40 mg/mL, ampola 2 mL) → bloco `ajU` (mesma prescrição da #3)

**Computação central:** volume_mL = (dose_mg/kg × P) ÷ concentração. mg = dose_mg/kg × P. Diluente para concentração final 1 mg/mL: diluente_mL = mg − volume_mL (na apr. 10 mg/mL é o que dá `4.5*P` p/ dose 5 mg/kg).

**Faixas (dose_mg/kg/dose + intervalo) — independem da apresentação, só muda concentração:**

Grupo Neonatos:
- IG < 30 sem: ≤14 dias → 5 mg/kg 48/48h; >14 dias → 5 mg/kg 36/36h
- IG 30–34 sem: ≤10 dias → 5 mg/kg 36/36h; >10 dias → 5 mg/kg 24/24h
- IG ≥ 35 sem: ≤7 dias → 4 mg/kg 24/24h; `7 dias` → 5 mg/kg 24/24h **(FLAG: literal sem ">", provável ">7 dias")**

Grupo Após período neonatal:
- Dose usual: 2–2,5 mg/kg/dose 8/8h
- Intervalo estendido: 5–7,5 mg/kg/dia 24/24h

**Fatores literais por apresentação (volume mL = mg ÷ conc):**
| dose mg/kg | 10 mg/mL | 20 mg/mL | 40 mg/mL |
|---|---|---|---|
| 4 | 0.4·P | 0.2·P | 0.1·P |
| 5 | 0.5·P | 0.25·P | 0.125·P |
| 2 | 0.2·P | 0.1·P | — |
| 2,5 | 0.25·P | 0.125·P | — |
| 7,5 | 0.75·P | 0.375·P | — |

Teto/máximo: nenhum teto numérico explícito.
**FLAGS:** textos de diluição na apr. 20 e 40 mg/mL referenciam "Gentamicina 10/20 mg/mL" (inconsistência de origem). NÃO confundir com `_EquationGentamicinaControllerBase` (TFG/clearance por creatinina — outra tela).

---

## Mebendazol — `faixa-etaria-lookup` (na prática: dose fixa por indicação, sem peso)

**Inputs:** NENHUM (tela estática `bab`, sem campo de peso).
**Apresentação:** Solução oral 20 mg/mL.
**Doses fixas (mL) por indicação:**
- Ascaridíase / Tricuríase / Ancilostomíase: 5 mL VO 2x/dia × 3 dias (repetir em 3 sem)
- Enterobíase: 5 mL VO dose única (repetir em 2 sem)
- Toxocaríase: 5–10 mL VO 2x/dia × 5 dias
**Contraindicação por idade:** não indicado para < 2 anos.

---

## Meropenem — `peso-computado` (ramos por IG/idade/peso + indicação)

**Inputs:** Peso (kg, 1 casa) · Apresentação (select, 3 opções — só muda texto de reconstituição).

**Apresentações (reconstituição, todas → 50 mg/mL):**
- 500 mg → reconstituir em 10 mL AD
- 1.000 mg → 20 mL AD
- 2.000 mg → 40 mL AD

**Computação:** após reconstituir (50 mg/mL): Aspirar_mL = mg ÷ 50; mg = dose_mg/kg × P. Diluir para 20 mg/mL: diluente_mL = (mg ÷ 20) − Aspirar_mL. Para 20 mg/kg → aspirar 0.4·P, diluir 0.6·P. Para 40 mg/kg → aspirar 0.8·P, diluir 1.2·P.

**Faixas:**
Neonatos (exceto SNC):
- < 32 sem IG: ≤14d → 20 mg/kg 12/12h; >14d → 20 mg/kg 8/8h
- ≥ 32 sem IG: ≤14d → 20 mg/kg 8/8h; >14d → 30 mg/kg 8/8h **(FLAG: aspira 0.6·P mas exibe rótulo `20*P` mg; dose declarada 30 mg/kg)**
Neonatos SNC (gating por peso):
- ≤ 2 kg: ≤14d → 40 mg/kg 12/12h; >14d → 40 mg/kg 8/8h
- > 2 kg: 40 mg/kg 8/8h
Lactentes ≥3m / Crianças / Adolescentes:
- exceto SNC: 20 mg/kg/dose 8/8h — **Máx. 1 g/dose**
- Meningite: 40 mg/kg/dose 8/8h — **Máx. 2 g/dose**

---

## Metronidazol — `peso-computado` (com lookup por peso na Tricomoníase)

**Inputs:** Peso (kg, placeholder "0.0", 2 casas).
**Apresentações:** Suspensão oral 40 mg/mL (VO) · Solução injetável 500 mg/100 mL (EV).

**Computação VO (40 mg/mL → 1 mL = 40 mg):**
- Giardíase: 5 mg/kg/dose → vol = `P × 0.125` mL, 8/8h × 5–7d. **Máx. 6,25 mL/dose.**
- Amebíase: 35–50 mg/kg/dia → vol = `P × 0.2916666666666667` a `P × 0.4166666666666667` mL, 8/8h × 7–10d. **Máx. 18,75 mL/dose.** (35/120 e 50/120, dividido em 3 doses)
- Tricomoníase (lookup por peso):
  - < 45 kg: 45 mg/kg/d → vol = `P × 0.375` mL, 8/8h × 7d. **Máx. 16,6 mL/dose.**
  - ≥ 45 kg: comprimido fixo. Meninas: Metronidazol 250 mg, 2 comp 12/12h × 7d. Meninos: 8 comp dose única (2.000 mg).

**Computação EV (500 mg/100 mL → 1 mL = 5 mg):**
- Apendicite: 10 mg/kg/dose → vol = `P × 2` mL, 8/8h. **Máx. 100 mL/dose.**
- C. difficile leve-moderada: 7,5 mg/kg/dose → vol = `P × 1.5` mL, 6/6h × 10d. **Máx. 100 mL/dose.**
- C. difficile grave: 10 mg/kg/dose → vol = `P × 2` mL, 8/8h × 10d. **Máx. 100 mL/dose.** + associar vancomicina oral/retal.

**Contraindicação por idade:** doses não indicadas para período neonatal.

---

## Penicilina G Benzatina — `faixa-etaria-lookup` (peso) + `peso-computado` (sífilis)

**Inputs:** Peso (kg, 1 casa).
**Apresentações:** Pó susp. inj. 600.000/1.200.000 UI · Susp. inj. 300.000 UI/mL (frasco 4 mL).

**Lookup por peso (dose UI fixa, NÃO computa):**
- Infecções estreptocócicas (Grupo A): ≤27 kg → 600.000 UI IM dose única; >27 kg → 1.200.000 UI IM dose única.
- Profilaxia FR/GNDA: ≤27 kg → 600.000 UI a cada 3–4 sem; >27 kg → 1.200.000 UI a cada 3–4 sem.

**Computado (sífilis): dose UI = `50.000 × P`:**
- Sífilis congênita (<2a), primária/secundária/latente recente: `50.000·P` UI IM dose única. **Máx. 2.400.000 UI/dose.**
- Sífilis latente tardia / tempo não definido: `50.000·P` UI IM 1x/sem × 3 sem. **Máx. 2.400.000 UI/dose.**

**Cuidados-teto:** vol máx 8 mL/dose (2.400.000 UI). Apenas IM profunda; dividir vol > 2 mL em duas nádegas.

---

## Penicilina G Cristalina — `peso-computado` (UI/kg, ramos por idade/indicação)

**Inputs:** Peso (kg, 1 casa).
**Apresentações:** Pó sol. inj. 1.000.000 / 5.000.000 UI. Reconstituir conforme fabricante; infusão 30–60 min.

**Computação:** Aspirar_UI = fator × P. Diluir cada dose em (UI ÷ 50.000) mL de SF 0,9% → concentração final 50.000 UI/mL.
Variáveis-fator no controller: a1 = 50.000·P; a2 = 100.000·P; a3 = 300.000·P; a4 = 33.333·P.

**Faixas:**
Neonatos:
- Sífilis congênita / Sepse SGB: ≤7d → 50.000 UI/kg 12/12h; >7d → 50.000 UI/kg 8/8h (aspirar `50.000·P`, diluir `P` mL)
- Meningite: ≤7d → 150.000 UI/kg 8/8h (aspirar `150.000·P`, diluir `3·P` mL); >7d → 125.000 UI/kg 6/6h (aspirar `125.000·P`, diluir `2.5·P` mL)
Lactentes/Crianças/Adolescentes:
- Dose usual (exceto SNC): 100.000–300.000 UI/kg/dia, 4/4 ou 6/6h (aspirar `100.000·P`–`300.000·P`/dia). **Máx. 24.000.000 UI/dia.**
- Sífilis congênita: 50.000 UI/kg/dose 4/4 ou 6/6h × 10d
- Neurossífilis crianças: 50.000 UI/kg/dose 4/4 ou 6/6h × 10–14d. **Máx. 24.000.000 UI/dia.**
- Neurossífilis adolescentes: 3.000.000–4.000.000 UI/dose 4/4h × 10–14d (aspirar `3.000.000·P`–`4.000.000·P`). **Máx. 24.000.000 UI/dia.**
- Tétano: 25.000 UI/kg/dose 6/6h × 7–10d. **Máx. 20.000.000 UI/dia.**
- Difteria: 37.500–62.500 UI/kg/dose 6/6h × 7–14d (aspirar `37.500·P`–`62.500·P`)
- Endocardite: 33.333–50.000 UI/kg/dose 4/4h (aspirar `33.333·P`–`50.000·P`). **Máx. 20.000.000 UI/dia.**
- Doença de Lyme: declarada 33.333–66.666 UI/kg/dose 4/4h, mas aspira `33.333·P`–`50.000·P` **(FLAG: limite superior usa a1=50.000·P, não 66.666·P)**. **Máx. 24.000.000 UI/dia.**
- Meningite/Doença meningocócica: 300.000–400.000 UI/kg/dia 4/4 ou 6/6h (aspirar `300.000·P`–`400.000·P`/dia). **Máx. 24.000.000 UI/dia.**
- Pneumonia comunitária (>3m): 200.000–250.000 UI/kg/dia 4/4 ou 6/6h. **Máx. 24.000.000 UI/dia.**
- Infecções necrotizantes por Clostridium: 60.000–100.000 UI/kg/dose 6/6h.

**Cuidados-teto:** máx EV 480 mL/dia (24.000.000 UI/dia). IM mesma dose, exceto meningite.

---

## Penicilina Procaina — `hibrido` (peso-computado UI/kg + lookup por peso na Difteria)

**Inputs:** Peso (kg, 1 casa).
**Apresentação:** Procaína 400.000 UI (Procaína 300.000 + Potássica 100.000). Reconstituir em 2 mL → **200.000 UI/mL.**
> FLAG: prescrição reusa chave `penicilina.g.cristalina.prescription` (copy/paste; não afeta texto).

**Computação:** vol_mL = UI ÷ 200.000. Variáveis: m = 0.25·P; l = 50.000·P.
- Dose usual: 50.000 UI/kg/dia → `0.25·P` mL (`50.000·P` UI) IM 1x/dia ou 12/12h. **Máx. 1.200.000 UI/dia.**
- Sífilis congênita: 50.000 UI/kg → `0.25·P` mL (`50.000·P` UI) IM 1x/dia × 10d. **Máx. 2.400.000 UI/dia.**
- Antraz inalatório (profilaxia): 25.000 UI/kg/dose → `0.0625·P` mL (`25.000·P` UI) IM 12/12h. **Máx. 1.200.000 UI/dose.**
- Difteria (lookup por peso, dose UI fixa):
  - ≤ 10 kg: 300.000 UI → 1.5 mL IM 12/12h × 14d
  - > 10 kg: 600.000 UI → 3 mL IM 12/12h × 14d

---

## Secnidazol — `peso-computado` (1 mL/kg, fator ×1)

**Inputs:** Peso (kg, placeholder "0.0", 2 casas).
**Apresentação:** Suspensão oral 30 mg/mL.
**Computação:** Dose 30 mg/kg/dia ÷ 30 mg/mL = **1 mL/kg** → vol = `P × 1` mL (fator 1, exibido 1 casa). **Máx. 66 mL/dose.**
- Amebíase intestinal / Giardíase: `P` mL VO dose única
- Amebíase hepática: `P` mL VO 1x/dia × 5–7d

**Contraindicação por idade:** doses não indicadas para período neonatal.

---

## Vancomicina — `peso-computado` (mg/kg, ramos por IG/idade/indicação)

**Inputs:** Peso (kg, 1 casa) · Apresentação (select, 2 opções — só muda reconstituição). As 2 apresentações usam os MESMOS blocos de dose.

**Apresentações (reconstituição, → 50 mg/mL):** 500 mg → 10 mL AD; 1.000 mg → 20 mL AD.

**Computação:** após reconstituir (50 mg/mL): Aspirar_mL = mg ÷ 50; mg = dose_mg/kg × P. Diluir para 5 mg/mL: dose única → diluente `(mg/5) − aspirar` (p/ 15 mg/kg = `2.7·P`); doses divididas → "(Dose em mg ÷ 500) mL" por administração.
Variáveis-fator: d=0.3·P; c=15·P; b=2.7·P; a=0.4·P; a0=20·P; a1=0.6·P; a2=30·P; a3=0.9·P; a4=45·P; a5=1.2·P; a6=60·P.

**Faixas:**
Neonatos (infecções suscetíveis), 15 mg/kg/dose, aspirar `0.3·P` mL (`15·P` mg) + `2.7·P` mL:
- ≤ 29 sem: 24/24h
- 29–35 sem: 12/12h
- > 35 sem: 8/8h
Meningite neonatos ≥ 2 kg (doses divididas):
- ≤ 7d: 20–30 mg/kg/dia 8/8 ou 12/12h → aspirar `0.4·P`–`0.6·P` mL (`20·P`–`30·P` mg)
- > 7d: 30–45 mg/kg/dia 6/6 ou 8/8h → aspirar `0.6·P`–`0.9·P` mL (`30·P`–`45·P` mg)
Lactentes/Crianças/Adolescentes:
- Infecções suscetíveis: 45–60 mg/kg/dia 6/6 ou 8/8h → `0.9·P`–`1.2·P` mL (`45·P`–`60·P` mg)
- Endocardite empírico: 15 mg/kg/dose 6/6h → `0.3·P` mL (`15·P` mg) + `2.7·P` mL. **Máx. 2 g/dia.**
- Meningite: 15 mg/kg/dose 6/6h → `0.3·P` mL + `2.7·P` mL.
MRSA grave:
- 3 m–12 a: 60–80 mg/kg/dia 6/6h → aspirar `0.3·P`–`0.4·P` mL (`15·P`–`20·P` mg) + `3.6·P` mL. **Máx. 3,6 g/dia.** **(FLAG: dose-alvo "/dia" mas valores calculados são por dose, divisão 6/6h)**
- ≥ 12 a: 60–70 mg/kg/dia 6/6 ou 8/8h → aspirar `1.2·P`–`1.4·P` mL (`60·P`–`70·P` mg). **Máx. 3,6 g/dia.**

**Cuidados-teto:** concentração máxima 5 mg/mL. Infundir em 1 hora.

---

## Resumo de classificação (dosing_type)

| Droga | dosing_type | Núcleo da computação |
|---|---|---|
| Gentamicina | peso-computado | (mg/kg × P) ÷ conc; ramos IG/idade |
| Mebendazol | faixa-etaria-lookup | mL fixos por indicação; sem peso; CI <2a |
| Meropenem | peso-computado | mg/kg × P; aspirar ÷50, diluir 20 mg/mL; tetos 1–2 g |
| Metronidazol | peso-computado | VO ÷40 mg/mL, EV ÷5 mg/mL; tetos por indicação; CI neonatal |
| Penicilina G Benzatina | hibrido | lookup UI por peso (≤27kg) + sífilis `50.000·P` |
| Penicilina G Cristalina | peso-computado | UI/kg × P; diluir UI÷50.000; tetos 20–24M UI/dia |
| Penicilina Procaina | hibrido | UI/kg ÷200.000 mL + Difteria lookup por peso |
| Secnidazol | peso-computado | 1 mL/kg (fator ×1); teto 66 mL; CI neonatal |
| Vancomicina | peso-computado | mg/kg × P; aspirar ÷50, diluir 5 mg/mL; tetos 2–3,6 g/dia |
