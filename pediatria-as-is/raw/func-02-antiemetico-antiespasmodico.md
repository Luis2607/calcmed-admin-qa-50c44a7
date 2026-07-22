# Lógica de cálculo — Antieméticos + Antiespasmódico (Pediatria) — FUNC

> Foco: a COMPUTAÇÃO de dose (motor + schema JSON), não a prosa. Prosa em `raw/01a` (antieméticos) e `raw/01b` (antiespasmódico).
> Fonte de verdade: `_source/main.decoded.js`. Fórmulas transcritas VERBATIM dos getters / templates do bundle.
> Datado: 2026-06-21.
>
> **Convenção do bundle (vale p/ todas):**
> - `this.b` / `j.d` = **peso (kg)**. `this.a` = valor da idade. `this.c.b` = unidade da idade selecionada no dropdown: **`1` = Anos, `2` = Meses**.
> - `B.e.t(expr, n)` = formata `expr` arredondado com `n` casas decimais. `A.b(expr)` = número cru (sem arredondar).
> - Em telas com Idade, há regra global: idade em Meses limitada a 12 → converte p/ Anos (`if(age>12){ select="12"; sbo(12) }`).
> - `isDataValid` (`gim`): exige TODOS os inputs não-nulos antes de renderizar a prescrição; senão mostra empty state `u.y` = `Informe todos os dados para obter o resultado.`

---

## ANTIEMÉTICOS — `/pediatra/antiemetico`

### Bromoprida — `hibrido` (peso-computado COM gating por idade)
Classe: `EquationBromopridaPediatra` / base `_EquationBromopridaPediatraControllerBase` (getters em `A.uX.prototype`, ~L177953-178035; render `A.du0` ~L178062).

- **Inputs:** Peso (kg, placeholder "0.0", aceita vírgula) · Idade (valor) + dropdown unidade (Meses/Anos).
- **Apresentações:**
  - Solução gotas pediátricas 4 mg/mL: Digesan®, Movinau®
  - Solução oral (xarope) 1 mg/mL: Movinau®
  - Solução injetável 5 mg/mL: Digesan®, Plamet®
- **Gate de idade (renderiza prescrição só se `isAgeOver1Year`):**
  - `isAgeOver1Year` (`gax4`): `(unit==Anos && age>=12) || (unit==Meses && age>=1)`  ⚠️ note: limiar em Anos é `>=12` no código (idiossincrasia do bundle — meses>12 já viram Anos).
  - `isAgeLess1Year` (`gawX`): `(unit==Anos && age<12) || (unit==Meses && age<1)` → exibe **"Contraindicado Bromoprida"**.
- **Fórmulas por apresentação (getters, peso=`this.b`):**
  | Getter | Fórmula literal | Teto | Casas | Uso |
  |---|---|---|---|---|
  | `weightLimit58` (`gaCk`) | `peso` | `if(peso>=58) →58` | 0 | gotas mínimo |
  | `calculateGotas` (`gasP`) | `peso*2` | `if(s>=58) →58` | 0 | gotas máximo |
  | `calculateXarope6` (`gasU`) | `peso/6` | `if(s>=10) →10` | 1 | xarope mL mínimo |
  | `calculateXarope3` (`gasT`) | `peso/3` | `if(s>=10) →10` | 1 | xarope mL máximo |
  | `calculate01` (`gasN`) | `peso*0.1` | `if(s>=2) →2` | 1 | injetável mL mínimo |
  | `calculate02` (`gasO`) | `peso*0.2` | `if(s>=2) →2` | 1 | injetável mL máximo |
- **Output (templates):**
  - `Bromoprida gotas (4 mg/mL) - {weightLimit58} a {calculateGotas} gotas VO a cada 8 horas.`
  - `Bromoprida xarope (1 mg/mL) - {calculateXarope6} a {calculateXarope3} mL VO cada 8 horas.`
  - `Bromoprida (5 mg/mL) – Fazer {calculate01} a {calculate02} mL via IM/EV por dia.` (+ nota EV diluir SG/SF)
- **Dose máxima (texto da "Dose usual", não computada):** gotas 58/dose · xarope 10 mL/dose · injetável 10 mg/dose.
- **Contraindicação por idade:** < 1 ano.

### Metoclopramida — `so-aviso`
Widget `A.HM`/`b9B`/`dy_`. **SEM inputs, SEM cálculo, SEM Apresentação/Dose.** Renderiza só "Cuidados" (evite em crianças; risco de Discinesia Tardia irreversível). Nada a computar.

### Ondansetrona — `hibrido` (peso-computado COM gating por idade)
Classe: `EquationOndansetronaPediatra` / base `_EquationOndansetronaPediatraControllerBase` (getters em `A.Bz.prototype`, ~L178636-178700).

- **Inputs:** Peso (kg) · Idade + dropdown (Meses/Anos).
- **Apresentações:**
  - Solução oral 4 mg/5 mL: Ondset®
  - Solução injetável 2 mg/mL: Nausedron®, Ansentron®, Ontrax®
  - Filme orodispersível 4 mg ou 8 mg: Ondif®
- **Gates de idade:**
  - `isAgeOver1Month` (`gax3`): `(unit==Anos && age>=1) || (unit==Meses && age===1)` → renderiza bloco INJETÁVEL.
  - `isAgeOver2Years` (`gax5`): `(unit==Meses && age>=2)` → renderiza bloco ORAL + FILME + INJETÁVEL. ⚠️ literal: checa só `unit==Meses && age>=2` (idiossincrasia do bundle).
  - `isAgeLess1Month` (`gawW`): `(unit==Anos && age<1) || (unit==Meses && age<1)` → exibe **"Posologia para náuseas e vômitos pós-operatórios a partir de 1 mês de idade."**
- **Fórmulas (peso=`this.b`):**
  | Getter | Fórmula literal | Teto | Casas |
  |---|---|---|---|
  | `calculate005` (`gLf`) | `peso*0.075` | `if(s>=2) →2` | 2 (no template) |
  | `calculate20005` (`gaaL`) | `20 - calculate005` (usa o valor JÁ TETADO em 2) | — | — |
- **Output:**
  - Injetável IM: `Ondansetrona {calculate005} mL IM a cada 8 horas.`
  - Injetável EV diluído: `Ondansetrona {calculate005} mL + {calculate20005} mL de SF 0,9% EV em 2 minutos, a cada 8 horas.`
  - Oral (só se ≥2a): `Ondansetrona solução oral – Dar 5 mL VO a cada 8 horas.` (fixo)
  - Filme (só se ≥2a): `Ondansetrona - Filme orodispersível 4 mg - aplicar na língua para que dissolva.` (fixo)
- **Dose máxima (texto):** injetável 4 mg/dose.

### Dimenidrato — `hibrido` (peso-computado COM gating por idade)
Classe: `EquationDimenidratoPediatra` / base `_EquationDimenidratoPediatraControllerBase` (getters em `A.wy.prototype`, ~L178322-178414).

- **Inputs:** Peso (kg) · Idade + dropdown (Meses/Anos).
- **Apresentações:**
  - Solução oral 2,5 mg/mL: Dramin®
  - Solução oral gotas 25 mg/mL: Dramin B6® (com piridoxina)
  - Solução injetável 3 mg/mL: Dramin B6 DL® (com piridoxina)
  - Solução injetável 50 mg/mL: Nausicalm B6® (com piridoxina)
- **Gates de idade (literais — note os limiares idiossincráticos):**
  - `isAgeLess2Years` (`gawY`): `(unit==Anos && age<=12) || (unit==Meses && age<2)` → exibe **"Contraindicado em menores de 2 anos"**.
  - `isAgeOver2YearsLess6` (`gax6`): `(unit==Meses && age>=2 && age<6)` → bloco faixa 2-6 anos.
  - `isAgeOver6Years` (`gax7`): `(unit==Meses && age>=6)` → bloco faixa 6+ anos.
    > ⚠️ As três condições leem `c.b` (unidade) de formas inconsistentes: <2a usa Anos OU Meses; as faixas de prescrição (`gax6`/`gax7`) só disparam com `unit==Meses`. Transcrito verbatim — possível bug no bundle.
- **Fórmulas (peso=`this.b`):**
  | Getter | Fórmula literal | Teto | Casas |
  |---|---|---|---|
  | `weightLimit20` (`gaCi`) | `peso` | `if(peso>=20) →20` | 0 |
  | `weightLimit40` (`gaCj`) | `peso` | `if(peso>=40) →40` | 0 |
  | `calculateWeight125` (`gaaO`) | `peso*1.25/3` | `if(s>=100) →100` | 1 |
  | `calculateWeight12550` (`gaaP`) | `peso*1.25/50` | `if(s>=6) →6` | 1 |
- **Output — faixa 2 a 6 anos:**
  - `Dimenidrato xarope - Dar 5 a 10 mL VO a cada 6 a 8 horas.` (fixo)
  - `Dramin B6 gotas® - Dar {weightLimit20} gotas VO a cada 6 a 8 horas.`
  - `Dramin B6 DL® – Fazer {calculateWeight125} mL + 10 mL SF 0,9% EV em 2 minutos a cada 6 horas.`
  - `Nausicalm B6® – Fazer {calculateWeight12550} mL IM a cada 6 horas.`
- **Output — faixa 6 anos+:**
  - `Dimenidrato xarope - Dar 10 a 20 mL VO a cada 6 a 8 horas.` (fixo)
  - `Dramin B6 gotas® - Dar {weightLimit40} gotas VO a cada 6 a 8 horas.`
  - `Dramin B6 DL® – Fazer {calculateWeight125} mL 10 mL SF 0,9% EV...` (verbatim: SEM "+" nesta faixa)
  - `Nausicalm B6® – Fazer {calculateWeight12550} mL IM a cada 6 horas.`
- **Dose máxima (texto):** xarope 30/60 mL/dia · gotas 60/120/dia · injetável 300 mg/dia.
- **Contraindicação por idade:** < 2 anos.

---

## ANTIESPASMÓDICO — `/pediatra/antiespasmodico`

### Escopolamina (Buscopan®) — `peso-computado` (fórmulas inline, ramos por idade são RÓTULOS, não gating)
Rota `/pediatra/antiespasmodico/escopolamina`. Widget `A.Hx` → render `A.dwb` (~L178968-178982). **Não tem classe Equation com getters** — as fórmulas estão inline no template, com `j.d` = peso. **SEM cap/teto em nenhuma.**

- **Inputs:** APENAS Peso (kg, placeholder "0.0", vírgula). NÃO tem idade. Empty state quando `j.d===0`.
- **Apresentações:**
  - Solução oral 10 mg/mL: Buscopan®
  - Solução injetável 20 mg/mL: Buscopan®
- **Fórmulas inline (peso=`j.d`) — TODOS os ramos são exibidos simultaneamente (faixa etária é só rótulo de texto):**
  | Faixa (rótulo) | Fórmula literal | Casas |
  |---|---|---|
  | `< 3 meses` | `peso*3` gotas | 0 |
  | `3 a 11 meses` | `peso*1.4` gotas | 0 |
  | `1 a 6 anos` | `peso*0.6` a `peso` gotas (sic "gostas") | 0 |
  | `> 6 anos` | `20 a 40 gotas` (FIXO, não computa) | — |
  | EV/IM/SC `< 12 anos` | `peso*0.015` a `peso*0.03` mL | 1 |
  | EV/IM/SC `< 12 anos` — máx diária | `peso*0.075` mL | CRU (`A.b`, sem arredondar) |
  | EV/IM/SC `> 12 anos` | `1 a 2 mL` (FIXO); máx 5 mL/dia | — |
- **Notas de fidelidade (verbatim no bundle):** o item `< 3 meses` sai com "gotas" duplicado (`" "+peso*3+" gotas"` + suffix `" gotas (1,5 mg/kg)..."`). O item `1 a 6 anos` grafa **"gostas"** (typo).
- **Vias:** VO, EV, IM, SC. **Intervalo:** 8/8h (VO lactentes); 3-5x/dia (>6a VO).
- **Cuidado por idade:** "Uso com cautela em menores de 6 anos" (cautela, não contraindicação dura).

### Simeticona — `faixa-etaria-lookup` (sem cálculo)
Rota `/pediatra/antiespasmodico/simeticona`. Widget `A.IH` (render ~L179016). **Sem input, sem fórmula.** Doses fixas por faixa.

- **Inputs:** nenhum.
- **Apresentação:** Solução gotas (75 mg/mL/30 gotas).
- **Faixas (valores fixos):**
  | Faixa | Dose | Frequência | Máx/dia |
  |---|---|---|---|
  | Lactentes | 4 a 8 gotas (10 a 20 mg) | 1 a 4 x/dia | 240 mg/dia |
  | Até 12 anos | 8 a 16 gotas (20 a 40 mg) | 1 a 4 x/dia | 480 mg/dia |
- **Cuidado:** 1 mL = 25 a 30 gotas (conforme fabricante).

### Colidis® — `fixo` (independe de peso e idade)
Rota `/pediatra/antiespasmodico/colidis`. Widget `A.Hs` (render ~L178962). **Sem input, sem fórmula, dose única literal.**

- **Inputs:** nenhum.
- **Apresentação:** Solução gotas.
- **Dose (fixa):** `Dar 5 gotas via oral uma vez ao dia.`
- **Cuidado (verbatim):** "Dose independe do peso e da idade." (probiótico, Limosilactobacillus reuteri).

---

## Resumo da classificação

| Droga | dosing_type | Inputs | Cap/teto chave |
|---|---|---|---|
| Bromoprida | hibrido | Peso + Idade | gotas≤58, xarope≤10mL, inj≤2mL |
| Metoclopramida | so-aviso | — | — |
| Ondansetrona | hibrido | Peso + Idade | calc005≤2; diluição = 20−calc005 |
| Dimenidrato | hibrido | Peso + Idade | wl20≤20, wl40≤40, w125≤100, w12550≤6 |
| Escopolamina | peso-computado | Peso (sem idade) | nenhum teto; ramos por idade = rótulos |
| Simeticona | faixa-etaria-lookup | — | doses fixas por faixa |
| Colidis | fixo | — | 5 gotas 1x/dia |

> ⚠️ Flags de incerteza para revisão clínica/dev:
> 1. Gates de idade de Ondansetrona/Dimenidrato leem `c.b` (unidade) de forma inconsistente entre as condições — possível bug do bundle (transcrito verbatim, não corrigido).
> 2. Escopolamina não tem gating por idade: TODOS os ramos etários aparecem ao mesmo tempo (faixa é texto). Máx diária EV/IM/SC sai sem arredondamento (`A.b(peso*0.075)`).
> 3. Bromoprida `isAgeOver1Year` usa limiar `>=12` quando unidade=Anos (não `>=1`) — depende da conversão meses→anos a 12.
