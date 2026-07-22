# Lógica de Cálculo — Broncodilatadores (Pediatria) — FUNC

> Foco: a **computação** de dose (motor + schema JSON), não a prosa (prosa em `raw/01c`).
> Fonte: `_source/main.decoded.js`. Fórmulas transcritas **verbatim** dos getters/controllers. Padrão de formatação: `B.e.t(<expr>, <casas>)` arredonda; `A.b(x)` = número cru. Peso = `this.a` / state.
> Categoria slug: `broncodilatadores` · rota `/pediatra/broncodilatadores`.

## Tabela-resumo de classificação

| Droga | dosing_type | Input de cálculo |
|---|---|---|
| Acebrofilina | hibrido | Peso (só faixa 2–3 anos computa) |
| Abrilar | faixa-etaria-lookup | nenhum |
| Fenoterol | faixa-etaria-lookup | nenhum |
| Brometo de Ipratrópio | faixa-etaria-lookup | nenhum |
| Montelucaste | faixa-etaria-lookup | nenhum |
| Salbutamol | fixo | nenhum (regime fixo, não por idade/peso) |
| Sulfato de Magnésio | peso-computado | Peso |
| Terbutalina | infusao-bic | Peso + Dose desejada + Vazão desejada |

---

## 1. Acebrofilina — `hibrido` (peso só na faixa 2–3 anos)

- **Widget** `H6` · state `b8l` · controller de input `drV` (computa state `r.d`, `r.e`).
- **Input:** Peso (mL/kg decimal `bz(2,!1,!0)`).
- **Apresentação:** Xarope pediátrico 5 mg/mL (Brondilat®).

**Controller `drV.$1` (verbatim):**
```
if(a.length===0) r.e = r.d = 0
else {
  r.e = parse(peso)            // mg exibido = peso cru
  r.d = parse(peso) * 0.2      // mL para faixa 2–3 anos
}
```

**Faixas etárias (template `p`):**
- **2 a 3 anos:** `Dar [d] mL ([e] mg) a cada 12 horas` → mL = `peso*0.2` (cru, `A.b`), mg = `peso` arredondado 0 casas (`B.e.t(e,0)`). **← único ramo que computa por peso.**
- **3 a 6 anos:** fixo `5 mL (25 mg)` 12/12h.
- **6 a 12 anos:** fixo `10 mL (50 mg)` 12/12h.

- **Empty state:** `i.d === 0` → aviso `u.y`.
- **Contraindicação por idade:** "a partir de 2 anos".
- **Intervalo:** 12/12h.

---

## 2. Abrilar (Hedera helix) — `faixa-etaria-lookup`

- **Widget** `H5` · builder `drT`. **Sem input** (tela estática).
- **Apresentação:** Xarope 7 mg/mL (Abrilar®).
- **Faixas:**
  - **Até 7 anos (lactentes e crianças):** 2,5 mL 3x/dia.
  - **Acima de 7 anos:** 5 mL 3x/dia.
- Sem peso, sem cálculo. Via oral.

---

## 3. Fenoterol — `faixa-etaria-lookup`

- **Widget** `Hy` · builder `dwc`. **Sem input.**
- **Apresentação:** Solução gotas 5 mg/mL (Bromifen®, Fenteudini®).
- **Faixas — Uso Oral (gotas, range fixo, NÃO computa peso):**
  - **Até 1 ano:** 3 a 7 gotas, 2–3x/dia.
  - **1 a 6 anos:** 5 a 10 gotas, 3x/dia.
  - **6 a 12 anos:** 10 gotas, 3x/dia.
- **Faixas — Uso Inalatório:**
  - **Até 6 anos (< 22 kg):** 2 gotas + 3–4 mL SF 0,9%, neb até 3x/dia.
  - **6 a 12 anos:** 2 a 6 gotas + 3–4 mL SF 0,9%, neb até 3x/dia.
- **Contraindicação por idade:** até 12 anos. Via inalatória preferida.
- **Nota:** faixa "até 6 anos" tem gating por peso (< 22 kg) só como rótulo, não como cálculo.

---

## 4. Brometo de Ipratrópio — `faixa-etaria-lookup`

- **Widget** `Hf` · builder `dtU`. **Sem input.** Apresentações em `u.ec`.
- **Apresentação:** Aerossol 20 mcg/mL (Atrovent® N); Solução gotas 0,25 mg/mL (Atrovent®).
- **Faixas/regimes (range fixo de gotas):**
  - **Aerossol — acima de 6 anos:** manutenção 2 puffs 6/6h.
  - **Inalatório até 6 anos:** crise 8–20 gotas + 3–4 mL SF, neb 20/20 min por 1h; manut. 8–20 gotas 3–4x/dia.
  - **Inalatório 6 a 12 anos:** crise 20 gotas + 3–4 mL SF, neb 20/20 min por 1h; manut. 20 gotas 3–4x/dia.
- Sem peso, sem cálculo.

---

## 5. Montelucaste — `faixa-etaria-lookup`

- **Widget** `HP` · builder `dyp`. **Sem input.**
- **Apresentação:** Granulado 4 mg (Montelair®); Comprimidos mastigáveis 4 e 5 mg (Montelair®, Singulair®, Piemonte®).
- **Faixas:**
  - **Granulado — acima de 6 meses:** 1 sachê VO 1x/dia à noite.
  - **Comprimido 2 a 5 anos:** 1 comp (4 mg)/dia.
  - **Comprimido 6 a 14 anos:** 1 comp (5 mg)/dia.
- **Contraindicação por idade:** a partir de 6 meses.

---

## 6. Salbutamol — `fixo`

- **Widget** `IG` · builder `dFD`. **Sem input.** Apresentações em `u.kJ`.
- **Apresentação:** Solução nebulização 5 mg/mL (Aerolin®); Spray 100 mcg/dose (Aerolin®, Aerodini®).
- **Regimes (FIXOS, independem de peso e idade):**
  - **Nebulização crise:** 0,5 mL + 2,5 mL SF 0,9%, 20/20 min por 1h.
  - **Nebulização manutenção:** 0,5 mL + 2,5 mL SF 0,9% até 4x/dia.
  - **Spray crise:** 2 a 4 puffs 20/20 min por 1h.
  - **Spray manutenção:** 1 a 2 puffs até 4x/dia.
- Sem faixas etárias. Remete ao algoritmo de crise asmática.

---

## 7. Sulfato de Magnésio — `peso-computado`

- **Widget** `IJ` · builder `dG4` · controller de input `dG3` (computa `e.d, e.e, e.f, e.r`). Apresentações em `u.jj`.
- **Input:** Peso (decimal `bz(2,!1,!0)`).
- **Apresentação:** Sulfato de magnésio 10%; Sulfato de magnésio 50%.
- **Dose usual:** 50 mg/kg/dose.

**Controller `dG3.$1` (verbatim):**
```
if(a.length===0) r.r = r.f = r.e = r.d = 0
else {
  r.d = peso * 0.5;  if (r.d > 20) r.d = 20      // mL 10%, TETO 20 mL
  r.r = peso * 0.1;  if (r.r > 4)  r.r = 4        // mL 50%, TETO 4 mL
  r.e = 50 - r.d                                  // mL SF para a apresentação 10%
  r.f = 2 * r.d                                   // concentração final 10% (mg/mL)
}
```

**Templates de prescrição (arredondam 1 casa):**
- **10%:** `Sulfato de magnésio 10% - [d] mL + [e] mL SF 0,9% ([f] mg/mL) - EV em 20 a 60 minutos.`
  - `d = min(peso*0.5, 20)` mL · `e = 50 - d` mL SF · `f = 2*d` mg/mL.
- **50%:** `Sulfato de magnésio 50% - [r] mL + [50-r] mL SF 0,9% ([10*r] mg/mL) - EV em 20 a 60 minutos.`
  - `r = min(peso*0.1, 4)` mL · SF = `50 - r` mL · conc = `10*r` mg/mL.

- **Empty state:** `e.d === 0` → aviso `u.y`.
- **Dose máxima / tetos:** dose máx 2 g; concentração máx **60 mg/dL** (string Cuidados) vs **mg/mL** no corpo da prescrição — **FLAG: inconsistência de unidade no bundle**. Tetos numéricos no código: 10% ≤ 20 mL, 50% ≤ 4 mL.
- **Via:** EV em 20–60 min. Monitorização obrigatória.

---

## 8. Terbutalina — `infusao-bic` (mcg/kg/min ↔ mL/h)

- **Widget** `IL` · builder `dGh` · controllers de input `dGe` (peso→`sap`), `dGf` (dose desejada→`sS_`), `dGg` (vazão desejada→`sbr_`). Equação = classe `BB` (`_EquationTerbutalinaPediatraControllerBase`).
- **Inputs:**
  - **Peso** (decimal `bz(2,!1,!0)`) → `a` na equação.
  - **Dose desejada** (`mcg/kg/min`, `B.L`) → `b` na equação (`p.b`).
  - **Vazão desejada** (`mL/h`, `B.L`, valor inicial = `c` atual) → `c` na equação.
- **Apresentação:** Solução injetável 0,5 mg/mL (Terbutil®).

**Getters da equação `BB.prototype` (verbatim):**
```
gNb  (volume 24h)        = b * a * 1440 / 500        // b=vazão(gaor), a=peso(gPY); NaN→0
gDy  (concentração mcg/mL) = gNb * 500 / (24 * c)     // c=vazão desejada(ga65); NaN→0
gE2                       = gNb * 500 / gDy(0)
gaw1 (vol SG complementar)= gE2 - gNb
gaeA (limite superior mL) = peso * 0.08
gEm  (limite inferior mL) = peso * 0.04
reset q: sap(0); sbr_(0); sbr_(2)
```

**Blocos de prescrição:**
- **Dose inicial:** `Terbutalina (0,5 mg/mL) - [gEm] mL a [gaeA] mL + SG 5% 20 mL EV em 5 a 10 minutos (4 a 10 mcg/kg)`
  - faixa inferior = `peso*0.04` (`gEm`), superior = `peso*0.08` (`gaeA`), 2 casas.
- **Infusão contínua — dose usual:** 0,25 – 0,5 mcg/kg/min.
- **Volume em 24 horas:** `[gNb] mL` (1 casa).
- **Sugestão BIC (24h):** `Terbutalina (0,5 mg/mL) - [gNb] mL + SG 5% [gaw1] mL – ([gDy] mcg/mL) - EV em BIC a [c] mL/h ([p.b] mcg/kg/min)`
  - vol terbutalina = `gNb`; SG = `gaw1`; conc = `gDy(0)` (2 casas); vazão = `c` (1 casa); dose = `p.b` mcg/kg/min (2 casas).
- **Sugestão alternativa (preset fixo):** `Terbutalina 1 mL + 100 mL SG 5% (5 mcg/mL) - Fazer [gEm] mL/minuto a [gaeA] mL/minuto EV em BI contínua – 0,2 a 0,4 mcg/kg/min. Titular de 0,02 a 0,04 mL/kg/min (0,1 a 0,2 mcg/kg/min) a cada 30 min.`

- **Empty state:** `peso < 1` → aviso `u.y`.
- **Dose máxima / tetos:** dose máx **5 mcg/kg/min**; concentração máx da solução **1.000 mcg/mL**. "Dados limitados na literatura."
- **Via:** EV (dose inicial 5–10 min; manutenção BIC). Monitorização.
