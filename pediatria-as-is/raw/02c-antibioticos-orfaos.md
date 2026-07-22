# 02c — Antibióticos / Antifúngicos / Antivirais ÓRFÃOS (built-but-unwired)

> **Seção:** Antibióticos/Antifúngicos/Antivirais órfãos — conteúdo presente no bundle, SEM entrada no menu da pediatria.
> **Fonte de verdade:** `pediatria-as-is/_source/main.decoded.js` (bundle Flutter web decodificado, acentos resolvidos).
> **Data da extração:** 2026-06-20.
> **Fidelidade:** doses/concentrações/diluições transcritas **verbatim** do bundle. Valores derivados de peso/idade aparecem no código como expressões → documentados como `[valor calculado]` com o template literal ao redor.

---

## ⚠️ FLAG GLOBAL — Por que estes itens são ÓRFÃOS

Existem **DOIS sistemas de rotas distintos e independentes** no bundle, e os itens desta seção pertencem ao sistema ANTIGO/não-pediátrico.

### Sistema 1 — LIVE / wired (pediatria atual)
Prefixo de rota: **`/antibioticos/<slug>`** (slugs em **português, com hífen**). Registrado em `A.cAu..A.cB0` (byte ~4693900). Lista canônica (estes SÃO navegáveis pelo menu pediátrico):

```
/antibioticos/acetilcefuroxima, /albendazol, /amicacina, /amoxicilina,
/amoxicilina-clavulanato, /amoxicilina-sulbactam, /ampicilina,
/ampicilina-sulbactam, /azitromicina, /cefalexina, /cefepima,
/ceftriaxone, /cefuroxima, /claritromicina, /gentamicina, /mebendazol,
/meropenem, /metronidazol, /penicilina-g-benzatina, /penicilina-g-cristalina,
/penicilina-procaina, /secnidazol, /vancomicina
```

### Sistema 2 — ÓRFÃO / built-but-unwired (esta seção)
Prefixo de rota: **`/<slug>`** na raiz (slugs com **underscore / nomes em inglês**), e a tela-lista pai aponta para a categoria **`/category/antibioticos/`**. Registrado em `A.buN..A.bvi` no método `jW(a)` (byte ~3421016).

```
/aciclovir, /amicacina, /amoxicilina_clavulanato, /ampicilina,
/ampicilina_sulbactam, /anfotericina_b_desoxicolato, /anfotericina_b_lipossomal,
/azitromicina, /caspofungina, /cefazolina, /cefepime, /ceftarolina,
/ceftazidima, /ceftazidima_avibactam, /ceftriaxone, /cefuroxima,
/ciprofloxacin, /claritromicina, /clindamicina, /daptomicina, /doxiciclina,
/fluconazol, /fosfomicina, /ganciclovir, /gentamicina, /imipenem_cilastatina,
/levofloxacin, /linezolida, /meropenem, /metronidazol, /micafungina,
/norfloxacin, /oxacilina, /piperacilina_tazobactan, /polimixina_b,
/sulfametoxazol_trimetoprima, /teicoplanina, /vancomicina
```

**Natureza do módulo órfão:** é uma feature **adulto-orientada** de "Diluições e Doses" de antibióticos hospitalares. A tela-lista pai (`A.NQ` / `A.b4f`, byte ~3431900) tem título **"Diluições e Doses"** (subtítulo "Antibióticos") e dispara um modal de aviso na entrada (chave de preferência `notShowAntibioticosAlert`):

> **Título do modal:** "Atenção!"
> **Texto:** "As doses desta seção são sugestões conforme diretrizes internacionais e podem ser alteradas conforme a SCIH do seu serviço."
> **Botões:** "Não mostrar novamente" / "Entendi"

A maioria das telas órfãs usa um **calculador de dose renal adulto** (Peso, Diálise?, Clearance de Creatinina, toggle Cockroft-Gault com Idade + Homem/Mulher + Creatinina Sérica → TFGe), com doses fixas em gramas escalonadas por faixa de clearance — **NÃO** o padrão pediátrico mg/kg. Por isso o módulo nunca foi religado ao menu da pediatria.

**Mapeamento das telas órfãs (switch `eG(a)` da tela-lista, byte ~3430700):**

| case ID | classe widget | droga |
|---|---|---|
| "1" | `A.H7` | Aciclovir |
| "5" | `A.Hc` | Anfotericina B – Desoxicolato |
| "6" | `A.Hd` | Anfotericina B – Lipossomal |
| "8" | `A.Hh` | Caspofungina |
| "9" | `A.Hi` | Cefazolina |
| "10" | `A.Hj` | Cefepime |
| "39" | `A.IN` | Ceftarolina |
| "11" | `A.Hl` | Ceftazidima |
| "15" | `A.Hp` | Ciprofloxacin |
| "17" | `A.Hr` | Clindamicina |

> Todas as telas-detalhe órfãs têm o **AppBar título = "Antibióticos"** (não o nome da droga). O nome da droga vem do parâmetro de rota e é renderizado como título grande dentro do corpo (`this.a.c.b`).

> **Constante de texto compartilhada `u.E`** (byte ~9176007): `u.E = "Administrar EV em 60 minutos, de 12/12 horas."` — usada como sufixo/prefixo em vários branches abaixo (sinalizado onde aparece).

---

## Aciclovir (ÓRFÃO — antiviral)

- **FLAG:** órfã / não-navegável. Rota literal: `/aciclovir` (sistema órfão) → `/category/aciclovir`. **NÃO existe** rota `/antibioticos/aciclovir` no sistema wired. Sem entrada no menu pediátrico.
- **Classe:** `A.H7` / state `A.b8m`; controller `_EquationAciclovirControllerBase` (`A.R3`/`A.Bx`).
- **AppBar:** "Antibióticos".
- **Tipo:** calculador de dose renal **adulto** (TFGe / Cockroft-Gault). NÃO é tela pediátrica mg/kg.

### Inputs
- **Peso do paciente** — placeholder "Informe o valor", unidade "kg", 2 casas.
- **DIÁLISE?** — toggle SIM / NÃO.
- **Se DIÁLISE = NÃO (branch clearance):**
  - **Clearance de Creatinina** — unidade "mL/min/1,73m²", 2 casas.
  - Toggle **Cockroft-Gault** (calcula a TFGe): **Idade** (anos), **Homem/Mulher**, **Creatinina Sérica** (mg/dL). Saída inline: `TFGe [valor calculado] mL/min/1,73m².`
  - Fórmula TFGe (Cockcroft-Gault, do controller): `(140 - idade) * peso / (creatininaSerica * 72)`; multiplicar por `0.85` se mulher.

### Apresentação
- Não há bloco "Apresentação:" explícito (telas órfãs renais não usam a âncora padrão).

### Dose usual / Prescrição (output condicional)
Rótulo de via no rodapé: **"Uso Endovenoso"**.

- **Se DIÁLISE = SIM** (`p.b===1`):
  Prescrição: `ACICLOVIR [pesoX2.5] mg A [pesoX5] mg + [resultX] mL SF 0,9% EV EM 1 HORA - 24/24 HORAS`
  (template literal: `"ACICLOVIR "` + `B.e.t(pesoX2.5,0)+" mg A "+B.e.t(pesoX5,0)+" mg"` + `" + "+B.l.t(resultX,1)+" mL SF 0,9% EV EM 1 HORA - 24/24 HORAS"`).
  Observação: `"• Use o peso ideal em paciente obeso para evitar superdosagem."`
  - `pesoX2.5 = peso * 2.5`, `pesoX5 = peso * 5`, `pesoX10 = peso * 10`.
  - `resultX` (volume) = `100` se `peso*5 < 500`, senão `240`.

- **Se DIÁLISE = NÃO**, doses escalonadas por clearance (`p.f` = clearance):
  - `clearance > 50`: `ACICLOVIR [pesoX5] mg A [pesoX10] mg + [resultXClarance] mL SF 0,9% EV EM 1 HORA - 8/8 HORAS.`
  - `25 ≤ clearance ≤ 50`: `ACICLOVIR [pesoX5] mg A [pesoX10] mg + [resultXClarance] mL SF 0,9% EV EM 1 HORA - 12/12 HORAS.`
  - `10 ≤ clearance < 25`: `ACICLOVIR [pesoX5] mg A [pesoX10] mg + [resultXClarance] mL SF 0,9% EV EM 1 HORA - 24/24 HORAS.`
  - `1 ≤ clearance < 10`: `ACICLOVIR [pesoX2.5] mg A [pesoX5] mg + [resultXClarance] mL SF 0,9% EV EM 1 HORA - 24/24 HORAS.`
  - `resultXClarance` = 100 ou 240 (mesma regra <500→100, senão 240, sobre a dose da faixa).

### Empty state
- Não há string "Informe todos os dados para obter o resultado." nesta tela; os outputs só aparecem quando peso e o ramo (diálise/clearance) estão preenchidos.

---

## Anfotericina B – Desoxicolato (ÓRFÃO — antifúngico)

- **FLAG:** órfã / não-navegável. Rota: `/anfotericina_b_desoxicolato` → `/category/anfotericina_b_desoxicolato`. Sem rota `/antibioticos/...` wired, sem menu pediátrico.
- **Classe:** `A.Hc` / state `A.b8u`; controller `_EquationAnfotericinaDesoxicolatoControllerBase` (`A.R8`/`A.asr`).
- **AppBar:** "Antibióticos".
- **Tipo:** tela com **Apresentação + Dose por mg/kg** (input "Defina a dose").

### Inputs
- **Peso do paciente** — placeholder "Informe o valor", "kg", 2 casas.
- **Defina a dose** — placeholder "Informe o valor", unidade "mg/kg", 2 casas.

### Apresentação (verbatim)
> "Apresentação: frasco-ampola: 50 mg (pó) + diluente (10 mL)
>
> Dose habitual de 0,7 a 1,0 mg/kg/d
>
> Não há ajuste."

### Prescrição (output)
Template: `ANFOTERICINA B – DESOXICOLATO 50 mg (PÓ) - RECONSTITUIR EM 10 mL DO DILUENTE. ASPIRAR [pesoX02] mL + [pesoX0250] mL SG 5% EV EM 2 A 6 HORAS – 24/24 HORAS.`
- `pesoX02` (mL a aspirar) = `peso * dose * 0.2`, **limitado a 10** (`if (>=10) return 10`).
- `pesoX0250` (mL de SG 5%) = `peso * dose * 0.2 * 50`, **limitado a 500** (`if (>=500) return 500`).

### Cuidados / observações (verbatim)
> "Alto risco de nefrotoxicidade.
>
> Usar apenas quando benefícios superarem os riscos.
>
> Atenção: dose máxima diária: 50 mg
>
> A dose usual pode variar conforme a patologia."

---

## Anfotericina B – Lipossomal (ÓRFÃO — antifúngico)

- **FLAG:** órfã / não-navegável. Rota: `/anfotericina_b_lipossomal` → `/category/anfotericina_b_lipossomal`. Sem rota wired, sem menu pediátrico.
- **Classe:** `A.Hd` / state `A.b8w`; controller `_EquationAnfotericinaLipossomalControllerBase` (`A.R9`/`A.b8v`).
- **AppBar:** "Antibióticos".

### Inputs
- **Peso do paciente** — "Informe o valor", "kg", 2 casas.
- **Defina a dose** — "Informe o valor", "mg/kg", 2 casas.

### Apresentação / Dose habitual (verbatim)
> "Dose habitual de 3 a 6 mg/kg/d
>
> Não há ajuste."

### Prescrição (output)
Template: `ANFOTERICINA B - LIPOSSOMAL - [pesoXdose] mg + [pesoXdose] mL SG 5% EV EM 1 HORA – 24/24 HORAS.`
- `pesoXdose = peso * dose` (usado tanto para mg quanto para mL no template literal).
- Observação (verbatim): "• Concentração da solução pode variar de 0,2 a 2mg/mL"

> **FLAG de conteúdo:** o template usa `[pesoXdose]` para mg E para mL (mesma variável), o que sugere que o "mL" reaproveita o número de mg — possível imprecisão no bundle. Transcrito como está, sem correção.

---

## Caspofungina (ÓRFÃO — antifúngico)

- **FLAG:** órfã / não-navegável. Rota: `/caspofungina` → `/category/caspofungina`. Sem rota wired, sem menu pediátrico.
- **Classe:** `A.Hh` / state `A.b8J`. **Sem controller de cálculo** (doses fixas).
- **AppBar:** "Antibióticos".

### Inputs
- Nenhum input (tela estática de doses fixas).

### Dose / Prescrição (verbatim)
> "Não há ajuste.
>
> Posologia habitual:"
>
> **Dose de Ataque**: `CASPOFUNGINA 70MG + 250 mL SF 0,9% EV.`
> **Dose de Manutenção**: `CASPOFUNGINA 50MG + 250 mL SF 0,9% EV 24/24 HORAS.`

---

## Cefazolina (ÓRFÃO — antibiótico)

- **FLAG:** órfã / não-navegável. Rota: `/cefazolina` → `/category/cefazolina`. Sem rota `/antibioticos/cefazolina` wired, sem menu pediátrico.
- **Classe:** `A.Hi` / state `A.b8K`; controller `_EquationCefazolinaControllerBase` (`A.Rb`).
- **AppBar:** "Antibióticos".
- **Tipo:** calculador de dose renal **adulto** (Diálise / Clearance / Cockroft-Gault). Doses fixas em mg/g por faixa de clearance.

### Inputs
- **DIÁLISE?** — toggle SIM / NÃO.
- **Se NÃO:** **Clearance de Creatinina** ("mL/min/1,73m²"); toggle **Cockroft-Gault** (→ Idade anos, Peso do paciente kg, Homem/Mulher, Creatinina Sérica mg/dL → `TFGe [valor calculado] mL/min/1,73m².`).

### Prescrição (output condicional)
- **DIÁLISE = SIM** (`q.b===1`):
  - `CEFAZOLINA 500MG A 1G + 100 mL SF 0,9% EV 24/24 HORAS`
  - `CEFAZOLINA 2G + 100 mL SF 0,9% EV 3X/SEMANA – APÓS DIÁLISE`
  - Observações: "• Se diálise peritoneal: 500MG 12/12 horas ou 1G 24/24 horas." / "• Nos dias de diálise, administre após o término da diálise."
- **DIÁLISE = NÃO**, por clearance (`q.f`):
  - `clearance ≥ 50`: "Não há ajuste:" → `CEFAZOLINA 1 A 2G + 100 mL SF 0,9% EV 8/8 HORAS`
  - `30 ≤ clearance < 50`: `CEFAZOLINA 1 A 2G + 100 mL SF 0,9% EV A CADA 8 A 12 HORAS`
  - `10 < clearance < 30`: `CEFAZOLINA 500MG A 1G + 100 mL SF 0,9% EV 12/12 HORAS`
  - `1 ≤ clearance ≤ 10`: `CEFAZOLINA 500MG A 1G + 100 mL SF 0,9% EV 24/24 HORAS`

---

## Cefepime (ÓRFÃO — antibiótico) ⚠️ ver investigação cefepime vs cefepima abaixo

- **FLAG:** órfã / não-navegável. Rota: `/cefepime` (**inglês, com -e**) → `/category/cefepime`. Sem entrada no menu pediátrico.
- **Classe:** `A.Hj` / state `A.b8L`; controller com `gXX/ga7w/ga7x/gG8/gam` (Diálise/Clearance/Cockroft/TFGe).
- **AppBar:** "Antibióticos".
- **Tipo:** calculador de dose renal **adulto**. Doses fixas em g por faixa de clearance. **NÃO usa mg/kg.**

### Inputs
- **DIÁLISE?** — toggle SIM / NÃO.
- **Se NÃO:** Clearance de Creatinina; toggle Cockroft-Gault (Idade, Peso do paciente, Homem/Mulher, Creatinina Sérica → `TFGe [valor calculado] mL/min/1,73m².`).

### Prescrição (output condicional)
- **DIÁLISE = SIM** (`q.b===1`), cabeçalho "Se a dose usual recomendada é 2 g – 8/8h:":
  - **Dose de Ataque:** `CEFEPIME 1 g + 100 mL SF 0,9% EV.`
  - **Dose de Manutenção:** `CEFEPIME 500 mg + 100 mL SF 0,9% EV 24/24 HORAS.`
  - Observações: "• Se diálise peritoneal: 1 g 24/24 horas." / "• Nos dias de diálise, administre após o término da diálise."
- **DIÁLISE = NÃO**, por clearance (`q.f`), cada faixa apresenta DUAS prescrições (para dose usual 2g–12/12h e 2g–8/8h):
  - `clearance > 60`: "Não há ajuste:" →
    - (2g–12/12h) `CEFEPIME 2G + 100 mL SF 0,9% EV 12/12 HORAS`
    - (2g–8/8h) `CEFEPIME 2G + 100 mL SF 0,9% EV 8/8 HORAS`
  - `30 ≤ clearance ≤ 60`:
    - (2g–12/12h) `CEFEPIME 1G + 100 mL SF 0,9% EV 12/12 HORAS`
    - (2g–8/8h) `CEFEPIME 2G + 100 mL SF 0,9% EV 12/12 HORAS`
  - `11 ≤ clearance < 30`:
    - (2g–12/12h) `CEFEPIME 1G + 100 mL SF 0,9% EV 24/24 HORAS`
    - (2g–8/8h) `CEFEPIME 2G + 100 mL SF 0,9% EV 24/24 HORAS`
  - `1 ≤ clearance < 11`:
    - (2g–12/12h) `CEFEPIME 500MG + 100 mL SF 0,9% EV 24/24 HORAS`
    - (2g–8/8h) `CEFEPIME 1G + 100 mL SF 0,9% EV 24/24 HORAS`

### ⚠️ INVESTIGAÇÃO: `cefepime` (inglês) vs `cefepima` (já documentado em 02a)

**Veredito: são DUAS telas distintas, NÃO é alias nem duplicata.** Evidência:

| | `cefepime` (ÓRFÃO) | `cefepima` (WIRED, doc 02a) |
|---|---|---|
| Rota | `/cefepime` (raiz, sistema órfão) | `/antibioticos/cefepima` (sistema wired, byte ~4694641) |
| Grafia | inglês, termina em **-e** | português, termina em **-a** |
| Classe widget | `A.Hj` (byte ~3443320) | `A.Ib` / state `A.ba8` (byte ~4817000+) |
| Controller | renal adulto (clearance/diálise/Cockroft) | `A.Yb` — **pediátrico mg/kg** (`gHc` doseMg, `gag4`/`gag5` volume 1000/2000, `gRP` diluente) |
| Lógica de dose | g fixos por faixa de clearance | **50 mg/kg/dose** dividida a cada 8h ou 12h, reconstituição peso-dependente |
| Indicações no corpo | nenhuma (só ajuste renal) | "Infecções causadas por Pseudomonas; exacerbação aguda de fibrose cística; neutropenia febril; meningite" |
| Apresentação | nenhuma | "Cefepima (1.000 mg)" e "Cefepima (2.000 mg)" — reconstituir em 10 mL, solução final 11,4 mL |

Conclusão: o `cefepime` órfão é uma sobra do módulo **adulto de diluições/doses renais**; o `cefepima` da pediatria (02a) é o calculador pediátrico mg/kg vivo e navegável. Não consolidar — são features diferentes.

---

## Ceftarolina (ÓRFÃO — antibiótico)

- **FLAG:** órfã / não-navegável. Rota: `/ceftarolina` → `/category/ceftarolina`. Caso "39" da lista. Registrada num roteador separado (`A.aAv` / `A.bvp` → `/category/...`). Sem rota wired, sem menu pediátrico.
- **Classe:** `A.IN` / state `A.bbP`; controller com `gvf/gAB/gG6/gnn/gam` (Diálise/Clearance/Cockroft/TFGe).
- **AppBar:** "Antibióticos".
- **Tipo:** calculador de dose renal **adulto**. Doses fixas em mg por faixa de clearance.

### Inputs
- **DIÁLISE?** — toggle SIM / NÃO.
- **Se NÃO:** Clearance de Creatinina; toggle Cockroft-Gault (Idade, Peso do paciente, Homem/Mulher, Creatinina Sérica → `TFGe [valor calculado] mL/min/1,73m².`).

### Prescrição (output condicional) — duas linhas por faixa (dose usual 600mg–12/12h e 600mg–8/8h)
- **DIÁLISE = SIM** (`q.b===1`):
  - (600mg–12/12h) `CEFTAROLINA 200MG + 250 mL SF 0,9% EV 12/12 HORAS`
  - (600mg–8/8h) `CEFTAROLINA 200MG + 250 mL SF 0,9% EV 8/8 HORAS` + `u.E` ("Administrar EV em 60 minutos, de 12/12 horas.")
- **DIÁLISE = NÃO**, por clearance (`q.f`):
  - `clearance > 50`: "Não há ajuste:" → `CEFTAROLINA 600MG + 250 mL SF 0,9% EV 12/12 HORAS` / `CEFTAROLINA 600MG + 250 mL SF 0,9% EV 8/8 HORAS`
  - `30 < clearance ≤ 50`: `CEFTAROLINA 400MG + 250 mL SF 0,9% EV 12/12 HORAS` / `CEFTAROLINA 400MG + 250 mL SF 0,9% EV 8/8 HORAS`
  - `15 ≤ clearance ≤ 30`: `CEFTAROLINA 300MG + 250 mL SF 0,9% EV 12/12 HORAS` / `CEFTAROLINA 300MG + 250 mL SF 0,9% EV 8/8 HORAS`
  - `1 ≤ clearance < 15`: `CEFTAROLINA 200MG + 250 mL SF 0,9% EV 12/12 HORAS` / `CEFTAROLINA 200MG + 250 mL SF 0,9% EV 8/8 HORAS`

---

## Ceftazidima (ÓRFÃO — antibiótico)

- **FLAG:** órfã / não-navegável. Rota: `/ceftazidima` → `/category/ceftazidima`. Sem rota `/antibioticos/ceftazidima` wired, sem menu pediátrico.
- **Classe:** `A.Hl` / state `A.b8O`; controller `_EquationCeftazidima...` (`A.Rd` família) — Diálise/Clearance/Cockroft/TFGe (`gvf/gAB/gG6/gnn/gam`).
- **AppBar:** "Antibióticos".
- **Tipo:** calculador de dose renal **adulto**. Doses fixas em g/mg por faixa de clearance.

### Inputs
- **DIÁLISE?** — toggle SIM / NÃO.
- **Se NÃO:** Clearance de Creatinina; toggle Cockroft-Gault (Idade, Peso do paciente, Homem/Mulher, Creatinina Sérica → `TFGe [valor calculado] mL/min/1,73m².`).

### Prescrição (output condicional)
- **DIÁLISE = SIM** (`q.b===1`): `CEFTAZIDIMA 500MG A 1G + 100 mL SF 0,9% EV 24/24 HORAS` + `u.E` ("Administrar EV em 60 minutos, de 12/12 horas.")
- **DIÁLISE = NÃO**, por clearance (`q.f`), duas linhas por faixa (dose usual 1g–8/8h e 2g–8/8h):
  - `clearance ≥ 50`: "Não há ajuste:" → `CEFTAZIDIMA 1G + 100 mL SF 0,9% EV 8/8 HORAS` / `CEFTAZIDIMA 2G + 100 mL SF 0,9% EV 8/8 HORAS`
  - `30 < clearance < 50`: `CEFTAZIDIMA 1G + 100 mL SF 0,9% EV 12/12 HORAS` / `CEFTAZIDIMA 2G + 100 mL SF 0,9% EV 12/12 HORAS`
  - `15 < clearance ≤ 30`: `CEFTAZIDIMA 1G + 100 mL SF 0,9% EV 24/24 HORAS` / `CEFTAZIDIMA 2G + 100 mL SF 0,9% EV 24/24 HORAS`
  - `1 ≤ clearance ≤ 15`: `CEFTAZIDIMA 500MG + 100 mL SF 0,9% EV 24/24 HORAS` / `CEFTAZIDIMA 1G + 100 mL SF 0,9% EV 24/24 HORAS`

---

## Ciprofloxacin (ÓRFÃO — antibiótico)

- **FLAG:** órfã / não-navegável. Rota: `/ciprofloxacin` (inglês) → `/category/ciprofloxacin`. Sem rota wired, sem menu pediátrico.
- **Classe:** `A.Hp` / state `A.b8V`; controller `_EquationClaritromicina...`-vizinho (`A.Ri` família, `gqf/gvg/gAC/gp_/gam`) — Diálise/Clearance/Cockroft/TFGe.
- **AppBar:** "Antibióticos". Rodapé via: **"Uso Endovenoso"**.
- **Tipo:** calculador de dose renal **adulto**. Doses fixas em mg por faixa de clearance.

### Inputs
- **DIÁLISE?** — toggle SIM / NÃO.
- **Se NÃO:** Clearance de Creatinina; toggle Cockroft-Gault (Idade, Peso do paciente, Homem/Mulher, Creatinina Sérica → `TFGe [valor calculado] mL/min/1,73m².`).

### Prescrição (output condicional)
- **DIÁLISE = SIM** (`q.b===1`): `CIPROFLOXACIN 200 A 400 mg EV 24/24 HORAS` + `u.E` ("Administrar EV em 60 minutos, de 12/12 horas.")
- **DIÁLISE = NÃO**, por clearance (`q.f`):
  - `clearance ≥ 30`: "Não há ajuste:" → `CIPROFLOXACIN 400 mg EV A CADA 8 A 12 HORAS`
  - `1 ≤ clearance < 30`: `CIPROFLOXACIN 200 A 400 mg EV A CADA 12 A 24 HORAS`

---

## Clindamicina (ÓRFÃO — antibiótico)

- **FLAG:** órfã / não-navegável. Rota: `/clindamicina` → `/category/clindamicina`. Sem rota `/antibioticos/clindamicina` wired, sem menu pediátrico.
- **Classe:** `A.Hr` / state `A.b8Z`. **Sem controller de cálculo / sem inputs** (tela estática de doses).
- **AppBar:** "Antibióticos". Rodapé via: **"Uso Endovenoso e Via Oral"**.

### Inputs
- Nenhum input.

### Dose / Prescrição (verbatim)
> "Não há ajuste."
>
> "Oral: 600 a 2400mg/dia dividido em 2 a 4 doses;
>
> EV: 600 a 4800mg/dia dividido em 2 a 4 doses;
>
> Diluir em 100 mL SF 0,9% ou SG 5%."
>
> **Prescrição habitual:** `CLINDAMICINA 600MG + 100 mL SF 0,9% EV 8/8 HORAS`

---

## Resumo de cobertura

| Droga | Classe | Rota órfã | Tipo de tela | Inputs |
|---|---|---|---|---|
| Aciclovir | `A.H7` | `/aciclovir` | calc renal adulto | Peso, Diálise, Clearance, Cockroft (Idade/Sexo/CrSérica) |
| Anfotericina B Desoxicolato | `A.Hc` | `/anfotericina_b_desoxicolato` | Apresentação + mg/kg | Peso, Defina a dose |
| Anfotericina B Lipossomal | `A.Hd` | `/anfotericina_b_lipossomal` | Dose habitual + mg/kg | Peso, Defina a dose |
| Caspofungina | `A.Hh` | `/caspofungina` | estática (doses fixas) | nenhum |
| Cefazolina | `A.Hi` | `/cefazolina` | calc renal adulto | Diálise, Clearance, Cockroft |
| Cefepime | `A.Hj` | `/cefepime` | calc renal adulto | Diálise, Clearance, Cockroft |
| Ceftarolina | `A.IN` | `/ceftarolina` | calc renal adulto | Diálise, Clearance, Cockroft |
| Ceftazidima | `A.Hl` | `/ceftazidima` | calc renal adulto | Diálise, Clearance, Cockroft |
| Ciprofloxacin | `A.Hp` | `/ciprofloxacin` | calc renal adulto | Diálise, Clearance, Cockroft |
| Clindamicina | `A.Hr` | `/clindamicina` | estática (doses fixas) | nenhum |

**Padrões observados:**
1. Todas têm AppBar "Antibióticos" e pertencem ao módulo "Diluições e Doses" (adulto) com disclaimer SCIH na entrada da lista.
2. Nenhuma das 10 telas aparece no sistema de rotas wired `/antibioticos/<slug>` da pediatria → confirmadas órfãs.
3. `cefepime` (órfão) ≠ `cefepima` (wired pediátrico de 02a): telas, controllers e lógicas de dose completamente distintos.
