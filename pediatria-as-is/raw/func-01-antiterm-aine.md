# Lógica de cálculo — Antitérmicos/Analgésicos + Anti-inflamatórios (Pediatria AS-IS)

> Foco: a **computação** (fórmula, fatores, concentrações, tetos, faixas, gates), não a prosa. Prosa em `raw/01a`.
> Fonte verificada: `_source/main.decoded.js` (Flutter dart2js). Todas as fórmulas abaixo foram lidas direto dos getters/render. `B.e.t(expr, n)` = formata número com `n` casas (arredonda). `B.l.t(B.e.ae(x), 0)` = floor (truncar p/ baixo). Peso = `this.b` no controller; idade = `this.a`; unidade `selectAge` = `c.b` onde **`b===1` ⇒ Meses, `b===2` ⇒ Anos**.

## Convenção de inputs comum
- **Peso** (kg): numérico, placeholder `"0.0"`, vírgula→ponto, 2 casas. Parser zera vazio.
- **Idade** + **dropdown Meses/Anos** (`selectAge`): quando unidade=Meses e idade>12, app força idade=12 e troca p/ Anos.
- Empty state: `"Informe todos os dados para obter o resultado."` (quando `isDataValid` falso = peso ou idade nulos).
- Paracetamol é exceção: **só peso** (sem idade, sem gate).

---

## Dipirona — `faixa-etaria-lookup` (na verdade faixa de PESO; idade só gate/contra)

**Controller:** `_EquationDipironaPediatraControllerBase` (`A.Rn`/`A.wz`). Linhas ~179500–179737.

**Inputs:** Peso + Idade(+unidade).

**Apresentações:** Solução gotas 500 mg/mL (Novalgina®, Dorflex Uno®); Solução oral 50 mg/mL (idem); Solução injetável 500 mg/mL (idem).

**NÃO computa por peso** — seleciona **strings fixas por faixa de peso** (`isWeightOverEqual…`). Cada faixa devolve 3 linhas (gotas VO / solução oral VO / injetável EV-IM), todas 6/6h:

| Faixa peso (kg) | Gotas (VO) | Sol. oral (VO) | Injetável | Obs. via injetável |
|---|---|---|---|---|
| `>=5 && <9` (`gaxo`) | 2 a 5 gotas | 1,25 a 2,5 mL | 0,1 a 0,2 mL | `"IM em até 6/6 horas.\n\nContraindicado via Endovenosa em menores que 1 ano."` |
| `>=9 && <16` (`gaxp`) | 3 a 10 gotas | 2,5 a 5 mL | 0,2 a 0,5 mL | EV/IM 6/6h |
| `>=16 && <24` (`gaxk`) | 5 a 15 gotas | 3,75 a 7,5 mL | 0,3 a 0,8 mL | EV/IM 6/6h |
| `>=24 && <31` (`gaxl`) | 8 a 20 gotas | 5 a 10 mL | 0,4 a 1,0 mL | EV/IM 6/6h |
| `>=31 && <46` (`gaxm`) | 10 a 30 gotas | 7,5 a 15 mL | 0,5 a 1,5 mL | EV/IM 6/6h |
| `>=46 && <53` (`gaxn`) | 15 a 35 gotas | 8,75 a 17,5 mL | 0,8 a 1,8 mL | EV/IM 6/6h |

**Condicionais (substituem prescrição):**
- `isAgeLess3Months` (`gawZ`): idade < 3 (se unidade=Meses) OU peso < 5 → **"Contraindicado Dipirona"**. (Código: `c.b===1 && age<3` OU `weight<5`.)
- peso `>= 53` → **"Avalie dose para adultos"**.
- peso `< 5` (e não cai em nenhuma faixa) → sem prescrição.

**Cuidados:** a partir de 3 meses e > 5 kg; ver bula.

---

## Paracetamol — `peso-computado` (SÓ peso)

**Controller:** `_EquationParacetamolPediatraControllerBase` (`A.M0`). Getters em ~180226–180253; render `A.dzR` ~180314.

**Inputs:** **APENAS Peso** (sem idade). `isDataValid` = peso != null.

**Apresentações:** Suspensão gotas 200 mg/mL (Tylenol Gotas®); Suspensão oral 32 mg/mL (Tylenol Criança®); Suspensão oral 100 mg/mL (Tylenol Bebê®).

**Fórmulas (todas a cada 4 a 6 horas):**
- **Gotas (`gaCl` = weightLimitedTo30):** `dose = min(peso, 35)` → `B.e.t(.,0)` (0 casas). ⚠️ nome interno "LimitedTo30" mas teto real é **35** (`if(r>35)r=35`).
- **Xarope 32 mg/mL (`gaCA` = weightX13):** `peso * 13 / 32` → 1 casa.
- **Xarope 100 mg/mL (`gaCp` = weightX013):** `peso * 0.13` → 1 casa.

**Dose máxima:** texto "1 gota/kg, máx 35 gotas/dose"; cuidado "50–75 mg/kg/24h".

---

## Ibuprofeno — `hibrido` (peso-computado COM gate de idade)

**Controller:** `_EquationIbuprofenoPediatraControllerBase` (`A.Rr`/`A.a7D`). Render `A.dxg` ~179892–179989.

**Inputs:** Peso + Idade(+unidade). Compartilhado entre menu Antitérmicos e AINE.

**Apresentações:** Suspensão gotas 50 mg/mL (Alivium®, Ibuprotrat®, Advil®); 100 mg/mL (Alivium®, Advil®); 200 mg/mL (Alivium® GC).

**Gate `isAgeOver6Months` (`gadA`):** `(Meses && age>=6) || (Anos && age>=1)`. Se falso → **"Contraindicado Ibuprofeno"**.

**Fórmulas (sufixo "gotas VO a cada 6 ou 8 horas"):**
- **50 mg/mL:** min = `min(peso,40)` 0 casas; max = `peso>=40 ? 20 : peso*2` 0 casas. → `" min a max "`.
  - (nota: o teto do max usa o mesmo gate `peso>=40` mas devolve **20**, não `40*2`.)
- **100 mg/mL:** `min(peso, 20)` 0 casas (linha única).
- **200 mg/mL:** min = `(peso/4 >= 10) ? 10 : floor(peso/4)` 0 casas (floor via `B.l.t(B.e.ae(.),0)`); max = `(peso/2 >= 10) ? 10 : peso/2` 0 casas. → `" min a max "`.

**Cuidados:** a partir de 6 meses; risco dispepsia.

---

## Cetoprofeno — `hibrido` (xarope peso-computado + gotas por faixa etária)

**Controller:** `_EquationCetoprofenoPediatraControllerBase` (`A.By`). Getters ~196893–196996; render `A.duO` ~197087–197136.

**Inputs:** Peso + Idade(+unidade). Subtítulo "Cetoprofeno VO".

**Apresentações:** Solução oral 20 mg/mL (Profenid®, Cetofenid®); Xarope 1 mg/mL (Profenid®).

**Gates de idade:**
- `gax_` (isAgeLess6months): `(Meses && age<6) || (Anos && age<1)`.
- `gady` (isAgeLess12Months): `(Meses && age<12) || (Anos && age<1)`.
- `gax2` (isAgeOver1Less7Years): `(Meses && age>=12) || (Anos && age>=1 && age<7)`.
- `gax8` (isAgeOver7Less12Years): `(Anos && age>=7 && age<12)`.
- `gax1` (isAgeOver12Years): `(Anos && age>=12)`.

**Prescrição (2 linhas: "Cetoprofeno 20 mg/mL -" gotas; "Cetoprofeno 1 mg/mL -" xarope mL). XAROPE É SEMPRE `peso*0.5` (1 casa) em toda faixa válida.**

| Faixa (ordem de avaliação) | 20 mg/mL (gotas) | 1 mg/mL (xarope) |
|---|---|---|
| `gady` (< 12 meses / < 1 ano) | " contraindicado." | `peso*0,5` mL 6–8h |
| `gax2` (>1 ano e <7 anos) | `floor/round(peso)` (0 casas) gotas 6–8h | `peso*0,5` mL 6–8h |
| `gax8` (7–11 anos) | "25 gotas" 6–8h | `peso*0,5` mL 6–8h |
| `gax1` (>=12 anos) | "50 gotas" 6–8h | `peso*0,5` mL 6–8h |
| nenhuma | (vazio) | — |

> Cálculo gotas (faixa `gax2`): `B.e.t(peso, 0)` → peso arredondado 0 casas. Xarope: `B.e.t(peso*0.5, 1)`.

**Mensagem condicional:** se `gax_` (idade<6m) OU `gady` (idade<12m/<1a) → **"Contraindicado Cetoprofeno"** (mesmo que a linha do xarope ainda calcule).

**Cuidados:** contraindicado < 1 ano; risco dispepsia.

---

## Nimesulida — `hibrido` (peso-computado COM gate de idade)

**Controller:** `_EquationNimesulidaPediatraControllerBase` (`A.Rw`/`A.a7E`). Render `A.dyK` ~180144–180161.

**Inputs:** Peso + Idade(+unidade).

**Apresentações:** Suspensão gotas 50 mg/mL (Scaflam®).

**Gate `isAgeOver12years` (`gadz`):** `(Meses && age>12) || (Anos && age>=12)`. Se falso → **"Contraindicado Nimesulida"**.

**Fórmula:** `dose = min(peso, 40)` → `B.e.t(.,0)` (0 casas). 1 linha: "Nimesulida gotas (50 mg/mL) - X gotas VO de 12/12 horas." Teto efetivo **40** (`if(peso>40)peso=40`).

**Cuidados:** a partir de 12 anos; não exceder 40 gotas/dose.

---

## Diclofenaco (Cataflam®) — `hibrido` ⚠️ ÓRFÃO (sem rota no menu)

**Controller:** `_EquationDiclofenacoPediatraControllerBase` (`A.adL`/`A.a7B`). Render `A.dvz` ~179429–179450. Widget funcional mas **não listado** em `aine` — não navegável no app atual.

**Inputs:** Peso + Idade(+unidade).

**Apresentações:** Suspensão gotas 15 mg/mL (Cataflam® — Diclofenaco resinato).

**Gate `isAgeOver12Months` (`gax0`):** `(Meses && age>12) || (Anos && age>=1)`. Se falso → **"Contraindicado Diclofenaco"**.

**Fórmula (dose/dia, dividir em 2–3 tomadas):** min = `B.e.t(peso, 0)` (0 casas); max = `(peso*4 >= 300) ? 300 : peso*4` → 0 casas. Teto **300** gotas/dia. 1 linha: "Diclofenaco gotas (15 mg/mL) - min a max gotas VO no dia. Dividir em 2 a 3 tomadas no dia."

**Cuidados:** não < 14 anos (exceto artrite juvenil); a partir de 1 ano; máx 300 gotas/dia.

---

## Resumo de classificação

| Droga | dosing_type | Núcleo da computação |
|---|---|---|
| Dipirona | faixa-etaria-lookup (por PESO) | 6 faixas de peso → strings fixas; gates idade<3m/peso<5 e peso>=53 |
| Paracetamol | peso-computado | gotas min(peso,35); x32 peso*13/32; x100 peso*0.13 (só peso) |
| Ibuprofeno | hibrido | gate idade>=6m; 3 conc. com tetos 40/20/10 |
| Cetoprofeno | hibrido | xarope peso*0.5 sempre; gotas por faixa etária (peso / 25 / 50) |
| Nimesulida | hibrido | gate idade>=12a; min(peso,40) |
| Diclofenaco | hibrido (ÓRFÃO) | gate idade>=1a; min=peso, max=min(peso*4,300) |
