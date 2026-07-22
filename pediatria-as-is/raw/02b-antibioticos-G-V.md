# Antibióticos (LIVE) — G a V

> **Fonte:** bundle `main.decoded.js` do app CalcMed (Flutter web). Conteúdo clínico transcrito **verbatim**.
> **Seção:** Antibióticos do menu pediátrico, itens de Gentamicina a Vancomicina.
> **Rota-mãe da listagem:** `/pediatra/antibioticos/...` (cada item abre uma tela própria de droga).
>
> **Convenções de transcrição:**
> - `[valor calculado]` = número derivado do peso digitado; o **template literal** (multiplicador + unidade) está documentado ao lado.
> - Templates de número como `B.e.t(x,1)` = valor formatado com **1 casa decimal**.
> - `A.a0(valor, "unidade")` = par "número + unidade" exibido inline na prescrição.
> - Empty state padrão de telas com calculadora: enquanto o peso não é informado, a prescrição não aparece (campo "Peso" com placeholder `"Informe o valor"` ou `"0.0"`).
>
> **FLAGS GERAIS no topo** — ver seção "Flags / incertezas" ao final.

---

## Índice (ordem do menu)

| # (id interno) | Nome | Rota |
|---|---|---|
| 19 | Gentamicina | `/pediatra/antibioticos/gentamicina` |
| 7 | Mebendazol | `/pediatra/antibioticos/mebendazol` |
| 21 | Meropenem | `/pediatra/antibioticos/meropenem` |
| 8 | Metronidazol | `/pediatra/antibioticos/metronidazol` |
| 17 | Penicilina G Benzatina | `/pediatra/antibioticos/penicilina-g-benzatina` |
| 17 | Penicilina G Cristalina | `/pediatra/antibioticos/penicilina-g-cristalina` |
| 18 | Penicilina Procaina | `/pediatra/antibioticos/penicilina-procaina` |
| 9 | Secnidazol | `/pediatra/antibioticos/secnidazol` |
| 22 | Vancomicina | `/pediatra/antibioticos/vancomicina` |

> Nota: "Penicilina G Benzatina" e "Penicilina G Cristalina" compartilham o mesmo id interno `17` no bundle (provável typo de origem). Documentado verbatim.

---

## Gentamicina

**Rota:** `/pediatra/antibioticos/gentamicina`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosGentamicinaController`)

### Inputs
- **Peso** — campo numérico, placeholder `"Informe o valor"`, sufixo `"kg"`, 1 casa decimal.
- **Apresentação** — seleção (radio `i9`) entre 4 opções. A prescrição muda conforme a apresentação escolhida:
  1. `Solução injetável: 10 mg/mL – ampola com 1 mL`  (chave `B.Ek`)
  2. `Solução injetável: 20 mg/mL – ampola com 1 mL`  (chave `B.El`)
  3. `Solução injetável: 40 mg/mL – ampola com 1 mL`  (chave `B.Em`)
  4. `Solução injetável: 80 mg/2 mL – ampola com 2 mL`  (chave `B.En`)

> **Mapeamento de prescrição (lógica do controller):**
> - Apresentação 1 (10 mg/mL) → bloco `ajS`
> - Apresentação 2 (20 mg/mL) → bloco `ajT`
> - Apresentações 3 (40 mg/mL) **e** 4 (80 mg/2 mL) → bloco `ajU` (mesma prescrição para ambas; a 80 mg/2 mL equivale a 40 mg/mL)

### Apresentações (texto completo verbatim)
- `Solução injetável: 10 mg/mL – ampola com 1 mL`
- `Solução injetável: 20 mg/mL – ampola com 1 mL`
- `Solução injetável: 40 mg/mL – ampola com 1 mL`
- `Solução injetável: 80 mg/2 mL – ampola com 2 mL`

### Prescrição — Apresentação 1: Gentamicina 10 mg/mL

A prescrição é uma lista de cards (estrutura `k2`), agrupados por faixa. `e` = peso digitado.

**Grupo: Neonatos**

- **Idade gestacional < 30 semanas** — dose: `≤ 14 dias de vida: 5 mg/kg/dose EV/IM de 48/48 horas`
  - Fazer `[0.5*peso]` mL (`[5*peso]` mg) IM de 48/48 horas.
  - OU
  - Gentamicina 10 mg/mL - `[0.5*peso]` mL (`[5*peso]` mg) + `[4.5*peso]` mL de S 0,9% ou SG 5% (1 mg/mL). Fazer EV em 30 minutos de 48/48 horas.
  - `> 14 dias de vida: 5 mg/kg/dose EV/IM de 36/36 horas` (chave `u.A`)
  - Fazer `[0.5*peso]` mL (`[5*peso]` mg) IM de 36/36 horas.
  - OU
  - Gentamicina 10 mg/mL - `[0.5*peso]` mL (`[5*peso]` mg) + `[4.5*peso]` mL de S 0,9% ou SG 5% (1 mg/mL). Fazer EV em 30 minutos de 36/36 horas.

- **Idade gestacional 30-34 semanas** — dose: `≤10 dias de vida: 5 mg/kg/dose EV/IM de 36/36 horas`
  - Fazer `[0.5*peso]` mL (`[5*peso]` mg) IM de 36/36 horas.
  - OU
  - Gentamicina 10 mg/mL - `[0.5*peso]` mL (`[5*peso]` mg) + `[4.5*peso]` mL de S 0,9% ou SG 5% (1 mg/mL). Fazer EV em 30 minutos de 36/36 horas.
  - `> 10 dias de vida: 5 mg/kg/dose EV/IM de 24/24 horas` (chave `u.kr`)
  - Fazer `[0.5*peso]` mL (`[5*peso]` mg) IM de 24/24 horas.
  - OU
  - Gentamicina 10 mg/mL - `[0.5*peso]` mL (`[5*peso]` mg) + `[4.5*peso]` mL de S 0,9% ou SG 5% (1 mg/mL). Fazer EV em 30 minutos de 24/24 horas.

- **Idade gestacional ≥ 35 semanas** — dose: `≤ 7 dias de vida: 4 mg/kg/dose IM de 24/24 horas` (chave `u.zT`)
  - Fazer `[0.4*peso]` mL (`[4*peso]` mg) IM de 24/24 horas.
  - OU
  - Gentamicina 10 mg/mL - `[0.4*peso]` mL (`[4*peso]` mg) + `[3.6*peso]` mL de SF 0,9% ou SG 5% (concentração final de 1 mg/mL). Fazer EV em 30 minutos, de 24/24 horas.
  - `7 dias de vida: 5 mg/kg/dose EV/IM de 24/24 horas` (chave `u.d` — **FLAG: literal sem ">" no início; provável "> 7 dias"**)
  - Fazer `[0.5*peso]` mL (`[5*peso]` mg) IM de 24/24 horas.
  - OU
  - Gentamicina 10 mg/mL - `[0.5*peso]` mL (`[5*peso]` mg) + `[4.5*peso]` mL de S 0,9% ou SG 5% (1 mg/mL). Fazer EV em 30 minutos de 24/24 horas.

**Grupo: Após período neonatal**

- **Dose usual: 2-2,5 mg/kg/dose, EV/IM de 8/8 horas.** (chave `u.s`)
  - Fazer `[0.2*peso]` mL (`[2*peso]` mg) a `[0.25*peso]` mL (`[2.5*peso]` mg) IM de 8/8 horas.
  - OU
  - Gentamicina 10 mg/mL – `[0.2*peso]` mL (`[2*peso]` mg) a `[0.25*peso]` mL (`[2.5*peso]` mg) + `[2.25*peso]` mL de SF 0,9% ou SG 5%. Fazer EV em 30 minutos, de 8/8 horas.

- **Dose de intervalo estendido: 5-7,5 mg/kg/dia, EV/IM de 24/24 horas.** (chave `u.wC`)
  - Fazer `[0.5*peso]` mL (`[5*peso]` mg) a `[0.75*peso]` mL (`[7.5*peso]` mg) IM de 24/24 horas.
  - OU
  - Gentamicina 10 mg/mL – `[0.5*peso]` mL (`[5*peso]` mg) a `[0.75*peso]` mL (`[7.5*peso]` mg) + `[6.75*peso]` mL de SF 0,9% ou SG 5%. Fazer EV de 24/24 horas.

### Prescrição — Apresentação 2: Gentamicina 20 mg/mL
Mesma estrutura de faixas/doses-alvo da Apresentação 1; mudam os volumes (concentração 20 mg/mL).

**Grupo: Neonatos**
- **IG < 30 semanas** (`≤ 14 dias:...48/48h` / `> 14 dias:...36/36h`):
  - 48/48h: Fazer `[0.25*peso]` mL (`[5*peso]` mg) IM de 48/48 horas. OU Gentamicina 20 mg/mL - `[0.25*peso]` mL (`[5*peso]` mg) + `[0.25*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 48/48 horas.
  - 36/36h: Fazer `[0.25*peso]` mL (`[5*peso]` mg) IM de 36/36 horas. OU Gentamicina 20 mg/mL - `[0.25*peso]` mL (`[5*peso]` mg) + `[0.25*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 36/36 horas.
- **IG 30-34 semanas** (`≤10 dias:...36/36h` / `> 10 dias:...24/24h`):
  - 36/36h: Fazer `[0.25*peso]` mL (`[5*peso]` mg) IM de 36/36 horas. OU Gentamicina 20 mg/mL - `[0.25*peso]` mL (`[5*peso]` mg) + `[0.25*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 36/36 horas.
  - 24/24h: Fazer `[0.25*peso]` mL (`[5*peso]` mg) IM de 24/24 horas. OU Gentamicina 20 mg/mL - `[0.25*peso]` mL (`[5*peso]` mg) + `[0.25*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 24/24 horas.
- **IG ≥ 35 semanas** (`≤ 7 dias: 4 mg/kg IM 24/24h` / `7 dias: 5 mg/kg 24/24h`):
  - 24/24h (4 mg/kg): Fazer `[0.2*peso]` mL (`[4*peso]` mg) IM de 24/24 horas. OU Gentamicina 20 mg/mL - `[0.2*peso]` mL (`[4*peso]` mg) + `[0.2*peso]` mL de SF 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos, de 24/24 horas.
  - 24/24h (5 mg/kg): Fazer `[0.25*peso]` mL (`[5*peso]` mg) IM de 24/24 horas. OU Gentamicina 10 mg/mL - `[0.25*peso]` mL (`[5*peso]` mg) + `[0.25*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 24/24 horas. **(FLAG: o texto da diluição usa "Gentamicina 10 mg/mL" e "(10 mg/mL)" dentro da apresentação 20 mg/mL — provável inconsistência de origem)**

**Grupo: Após período neonatal**
- **Dose usual: 2-2,5 mg/kg/dose, 8/8h:** Fazer `[0.1*peso]` mL (`[2*peso]` mg) a `[0.125*peso]` mL (`[2.5*peso]` mg) IM de 8/8 horas. OU Gentamicina 10 mg/mL – `[0.1*peso]` mL (`[2*peso]` mg) a `[0.125*peso]` mL (`[2.5*peso]` mg) + `[0.375*peso]` mL de SF 0,9% ou SG 5%. Fazer EV em 30 minutos, de 8/8 horas.
- **Dose intervalo estendido: 5-7,5 mg/kg/dia, 24/24h:** Fazer `[0.25*peso]` mL (`[5*peso]` mg) a `[0.375*peso]` mL (`[7.5*peso]` mg) IM de 24/24 horas. OU Gentamicina 10 mg/mL – `[0.25*peso]` mL (`[5*peso]` mg) a `[0.375*peso]` mL (`[7.5*peso]` mg) + `[1.125*peso]` mL de SF 0,9% ou SG 5%. Fazer EV de 24/24 horas.

### Prescrição — Apresentação 3 e 4: Gentamicina 40 mg/mL (e 80 mg/2 mL)
Mesma estrutura; concentração 40 mg/mL.

**Grupo: Neonatos**
- **IG < 30 semanas:**
  - 48/48h: Fazer `[0.125*peso]` mL (`[5*peso]` mg) IM de 48/48 horas. OU Gentamicina 40 mg/mL - `[0.125*peso]` mL (`[5*peso]` mg) + `[0.375*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 48/48 horas.
  - 36/36h: Fazer `[0.125*peso]` mL (`[5*peso]` mg) IM de 36/36 horas. OU Gentamicina 40 mg/mL - `[0.125*peso]` mL (`[5*peso]` mg) + `[0.375*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 36/36 horas.
- **IG 30-34 semanas:**
  - 36/36h: Fazer `[0.125*peso]` mL (`[5*peso]` mg) IM de 36/36 horas. OU Gentamicina 40 mg/mL - `[0.125*peso]` mL (`[5*peso]` mg) + `[0.375*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 36/36 horas.
  - 24/24h: Fazer `[0.125*peso]` mL (`[5*peso]` mg) IM de 24/24 horas. OU Gentamicina 40 mg/mL - `[0.125*peso]` mL (`[5*peso]` mg) + `[0.375*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 24/24 horas.
- **IG ≥ 35 semanas:**
  - 24/24h (4 mg/kg): Fazer `[0.1*peso]` mL (`[4*peso]` mg) IM de 24/24 horas. OU Gentamicina 20 mg/mL - `[0.1*peso]` mL (`[4*peso]` mg) + `[0.3*peso]` mL de SF 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos, de 24/24 horas. **(FLAG: diluição usa "Gentamicina 20 mg/mL" dentro da apresentação 40 mg/mL)**
  - 24/24h (5 mg/kg): Fazer `[0.125*peso]` mL (`[5*peso]` mg) IM de 24/24 horas. OU Gentamicina 40 mg/mL - `[0.125*peso]` mL (`[5*peso]` mg) + `[0.375*peso]` mL de S 0,9% ou SG 5% (10 mg/mL). Fazer EV em 30 minutos de 24/24 horas.
- **Grupo "Após período neonatal":** presente na estrutura (bloco `ajU`), com volumes na concentração 40 mg/mL. (Doses-alvo idênticas às demais apresentações: 2-2,5 mg/kg/dose 8/8h e 5-7,5 mg/kg/dia 24/24h.)

### Cuidados (Gentamicina)
- Diluir a dose desejada em SF 0,9% ou SG 5% para concentração final entre 1 a 10 mg/mL
- Infundir em bomba por 30 a 60 minutos
- Não precisa diluir para administrar IM.
- Para mais detalhes acesse a bula.

### Contraindicações
- Nenhuma seção de contraindicação explícita nesta tela.

---

## Mebendazol

**Rota:** `/pediatra/antibioticos/mebendazol`
**Título da tela (AppBar):** "Antibióticos"
(Widget `bab` — tela **estática**, sem campo de peso.)

### Inputs
- **Nenhum input.** Tela puramente informativa (sem cálculo por peso). Doses fixas em mL.

### Apresentação
- `Solução oral: 20 mg/mL`

### Doses por indicação (prescrição)
Padrão de cada item: marca/concentração + volume + via/posologia. Apresentação base usada em todas: `Mebendazol (20 mg/mL) -`.

- **Ascaridíase** — `Mebendazol (20 mg/mL) - 5 mL VO, 2x/dia por 3 dias. Repetir em 3 semanas se não houver cura com o tratamento inicial.`
- **Tricuríase** — `Mebendazol (20 mg/mL) - 5 mL VO, 2x/dia por 3 dias. Repetir em 3 semanas se não houver cura com o tratamento inicial.`
- **Ancilostomíase** — `Mebendazol (20 mg/mL) - 5 mL VO, 2x/dia por 3 dias. Repetir em 3 semanas se não houver cura com o tratamento inicial.`
- **Enterobíase** — `Mebendazol (20 mg/mL) - 5 mL VO, dose única. Repetir em 2 semanas.`
- **Toxocaríase** — `Mebendazol (20 mg/mL) - 5 a 10 mL VO, 2x/dia por 5 dias. O tratamento pode ser prolongado. O tempo ideal de tratamento é desconhecido.`

### Cuidados / Observações
- `- Não indicado para crianças menores de 2 anos.`
- `- Para mais detalhes acesse a bula.`

### Contraindicações
- Implícita: não indicado para crianças < 2 anos (ver Cuidados).

---

## Meropenem

**Rota:** `/pediatra/antibioticos/meropenem`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosMeropenemController`)

### Inputs
- **Peso** — campo numérico, placeholder `"Informe o valor"`, sufixo `"kg"`, 1 casa decimal.
- **Apresentação** — seleção (radio `i9`) entre 3 opções (a prescrição é a mesma estrutura; mudam os textos de reconstituição):
  1. `Pó para solução injetável: 500 mg`  (chave `B.ajp`, case 0)
  2. `Pó para solução injetável: 1.000 mg`  (chave `B.ajq`, case 1)
  3. `Pó para solução injetável: 2.000 mg`  (chave `B.ajr`, case 2)

### Texto de reconstituição por apresentação (variável `s` na prescrição)
- 500 mg → `Meropenem 500 mg – Reconstituir em 10 mL de AD (50 mg/mL)`
- 1.000 mg → `Meropenem 1.000 mg - Reconstituir em 20 mL de AD (50 mg/mL)`
- 2.000 mg → `Meropenem 2.000 mg – Reconstituir em 40 mL de AD (50 mg/mL)`

### Prescrição (estrutura `t1`, agrupada). `q` = peso digitado.

**Grupo: Neonatos — Infecções suscetíveis (exceto SNC)**

- **< 32 semanas de idade gestacional**
  - `≤ 14 dias de vida: 20 mg/kg/dose EV de 12/12 horas`
    - [reconstituição da apresentação]
    - Aspirar: `[0.4*peso]` mL (`[20*peso]` mg)
    - Diluir em: `[0.6*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL)
    - Administrar EV em 15 a 30 minutos, de 12/12 horas.
  - `> 14 dias de vida: 20 mg/kg/dose EV de 8/8 horas`
    - [reconstituição]
    - Aspirar: `[0.4*peso]` mL (`[20*peso]` mg)
    - Diluir em: `[0.6*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL)
    - Administrar EV em 15 a 30 minutos, de 8/8 horas.

- **≥ 32 semanas de idade gestacional**
  - `≤ 14 dias de vida: 20 mg/kg/dose EV de 8/8 horas`
    - [reconstituição]
    - Aspirar: `[0.4*peso]` mL (`[20*peso]` mg)
    - Diluir em: `[0.6*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL)
    - Administrar EV em 15 a 30 minutos, de 8/8 horas.
  - `> 14 dias de vida: 30 mg/kg/dose EV de 8/8 horas`
    - [reconstituição]
    - Aspirar: `[0.6*peso]` mL (`[20*peso]` mg) **(FLAG: aspirar usa multiplicador 0.6*peso mas exibe `[20*peso]` mg — possível inconsistência de origem, dose declarada 30 mg/kg)**
    - Diluir em: `[0.9*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL)
    - Administrar EV em 15 a 30 minutos, de 8/8 horas.

**Grupo: Neonatos — Infecções do SNC** (condicional por peso ≤ 2 kg)

- **≤ 2 kg** (mostrado quando peso ≤ 2):
  - `≤ 14 dias de vida: 40 mg/kg/dose EV de 12/12 horas`
    - [reconstituição] · Aspirar: `[0.8*peso]` mL (`[40*peso]` mg) · Diluir em: `[1.2*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL) · Administrar EV em 15 a 30 minutos, de 12/12 horas.
  - `> 14 dias de vida: 40 mg/kg/dose EV de 8/8 horas`
    - [reconstituição] · Aspirar: `[0.8*peso]` mL (`[40*peso]` mg) · Diluir em: `[1.2*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL) · Administrar EV em 15 a 30 minutos, de 8/8 horas.
- **> 2kg** (mostrado quando peso > 2):
  - `40 mg/kg/dose EV de 8/8 horas`
    - [reconstituição] · Aspirar: `[0.8*peso]` mL (`[40*peso]` mg) · Diluir em: `[1.2*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL) · Administrar EV em 15 a 30 minutos, de 8/8 horas.

**Grupo: Lactentes ≥ 3 meses, Crianças e Adolescentes — Infecções suscetíveis (exceto SNC)**

- **Dose usual: 20 mg/kg/dose EV de 8/8 horas**
  - [reconstituição] · Aspirar: `[0.4*peso]` mL (`[20*peso]` mg) · Diluir em: `[0.6*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL) · Administrar EV em 15 a 30 minutos, de 8/8 horas.
  - **Máx.: 1 g/dose**
- **Meningite — Dose usual: 40 mg/kg/dose EV de 8/8 horas**
  - [reconstituição] · Aspirar: `[0.8*peso]` mL (`[40*peso]` mg) · Diluir em: `[1.2*peso]` mL de SF 0,9% ou SG 5% (20 mg/mL) · Administrar EV em 15 a 30 minutos, de 8/8 horas.
  - **Máx.: 2 g/dose**

### Cuidados (Meropenem)
- Diluir a dose desejada em SF 0,9% ou SG 5% para concentração final 1 a 20 mg/mL.
- Infundir por 15 a 30 minutos.
- Para mais detalhes acesse a bula.

### Contraindicações
- Nenhuma seção explícita.

---

## Metronidazol

**Rota:** `/pediatra/antibioticos/metronidazol`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosMetronidazolControllerBase`)

### Inputs
- **Peso** — campo numérico, placeholder `"0.0"`, 2 casas decimais (`bz(2,...)`), sem sufixo "kg" no campo.

### Apresentações (duas, exibidas como cabeçalhos)
- `Suspensão oral: 40 mg/mL`  (usada nas indicações VO; também referida como `Metronidazol (40 mg/mL)`)
- `Solução injetável: 500 mg/ 100 mL`  (usada nas indicações EV; referida como `Metronidazol (500 mg/100 mL)` e `Metronidazol (500 mg/ 100 mL)`)

### Doses por indicação (prescrição). `peso` = valor digitado.

**Via oral (Suspensão 40 mg/mL):**

- **Giardíase** — `Dose usual: 5 mg/kg/dose` · `Metronidazol (40 mg/mL) - [peso*0.125] mL VO, de 8/8 horas por 5 a 7 dias. (Máx.: 6,25 mL/dose)`
  - (volume `[B.e.t(peso0125,1)]` mL onde peso0125 = peso*0.125)
- **Amebíase** — `Dose usual: 35 a 50 mg/dia` · `Metronidazol (40 mg/mL) - [peso35120] a [peso512] mL VO, de 8/8 horas por 7 a 10 dias. (Máx.: 18,75 mL/dose)`
  - peso35120 = peso*0.2916666666666667 ; peso512 = peso*0.4166666666666667 (ambos 1 casa decimal)
  - **FLAG: label diz "35 a 50 mg/dia" no texto-fonte ("Dose usual: 35 a 50 mg/kg/dia"); verbatim = `Dose usual: 35 a 50 mg/kg/dia`**
- **Tricomoníase**:
  - `Crianças < 45 kg` — `Dose usual: 45 mg/kg/d` · `Metronidazol (40 mg/mL) - [peso0375] mL VO, de 8/8 horas por 7 dias. (Máx.: 16,6 mL/dose)`  (peso0375 = peso*0.375)
  - `Crianças ≥ 45 kg`:
    - `Meninas: Dose usual: 500 mg 2x/d` · `Metronidazol 250 mg – 2 comprimidos VO, de 12/12 horas por 7 dias.`
    - `Meninos: Dose usual: 2.000 mg dose única.` · `Metronidazol 250 mg – 8 comprimidos VO, dose única.`

**Via EV (Solução 500 mg/100 mL):**

- **Apendicite** — `Metronidazol (500 mg/100 mL) - [peso2] mL (10 mg/kg/dose) EV, de 8/8 horas. Correr em 30 a 60 minutos. (Máx.: 100 mL/dose)`  (peso2 = peso*2)
- **Infecção por Clostridium difficile — Infecção leve a moderada** — `Metronidazol (500 mg/100 mL) - [peso15] mL (7,5 mg/kg/dose) EV, de 6/6 horas por 10 dias. Correr em 30 a 60 minutos. (Máx.: 100 mL/dose)`  (peso15 = peso*1.5)
- **Infecção por Clostridium difficile — Infecção grave** — `Metronidazol (500 mg/100 mL) - [peso2] mL (10 mg/kg/dose) EV, de 8/8 horas por 10 dias. Correr em 30 a 60 minutos. (Máx.: 100 mL/dose)` + `- Associar a vancomicina oral/retal`  (peso2 = peso*2)

### Cuidados / Observações (chave `u.fY`)
- `- Doses não indicadas para período neonatal.`
- `- Para mais detalhes acesse a bula.`

### Contraindicações
- Implícita: doses não indicadas para período neonatal (ver Cuidados).

---

## Penicilina G Benzatina

**Rota:** `/pediatra/antibioticos/penicilina-g-benzatina`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosPenicilinaGBenzatinaController`)

### Inputs
- **Peso** — campo numérico, placeholder `"Informe o valor"`, sufixo `"kg"`, 1 casa decimal.

### Apresentação
- `Pó para suspensão injetável: 600.000 UI ou 1.200.000 U`
- `Suspensão injetável: 300.000 UI/mL (frasco-ampola com 4 mL)`

### Prescrição (estrutura `y3`). `peso` = valor digitado; dose calculada `[k]` = 50.000 × peso.

- **Infecções estreptocócicas do trato respiratório superior ou pele – Grupo A**
  - `Crianças até 27 kg:` `600.000 Unidades IM, dose única.`
  - `Crianças > 27 kg:` `1.200.000 Unidades IM, dose única.`
- **Profilaxia Febre Reumática e Glomerulonefrite**
  - `Crianças até 27 kg:` `600.000 Unidades IM, a cada 3 a 4 semanas.`
  - `Crianças > 27 kg:` `1.200.000 Unidades IM, a cada 3 a 4 semanas.`
- **Sífilis congênita (< 2 anos), primária, secundária ou latente recente:** — dose: `Dose usual: 50.000 Unidades/kg`
  - `Penicilina Benzatina - [50.000*peso] Unidades IM, dose única.` `(Máx.: 2.400.000 Unidades/dose).`
- **Sífilis latente tardia ou de "tempo não definidido":** — dose: `Dose usual: 50.000 Unidades/kg`  **(FLAG: typo verbatim "não definidido")**
  - `Penicilina Benzatina - [50.000*peso] Unidades IM, 1 vez por semana, por 3 semanas.` `(Máx.: 2.400.000 Unidades/dose).`

### Cuidados (chave `B.bCV`)
- Volume máximo por dose: 8 mL (2.400.000 UI)
- Administração deve ser exclusivamente via IM profunda
- Se necessário, dividir volume > 2 mL em duas nádegas

### Contraindicações
- Nenhuma seção explícita.

---

## Penicilina G Cristalina

**Rota:** `/pediatra/antibioticos/penicilina-g-cristalina`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosPenicilinaGCristalinaController`)

### Inputs
- **Peso** — campo numérico, placeholder `"Informe o valor"`, sufixo `"kg"`, 1 casa decimal.

### Apresentação
- `Pó para solução injetável: 1.000.000 Unidades`
- `Pó para solução injetável: 5.000.000 Unidades`
- `Reconstituir 1 ampola em AD – em volume conforme fabricante.`
- `Tempo de infusão: 30 a 60 minutos.`

### Prescrição (estrutura `lF`). `peso` = valor digitado.
Variáveis: a1 = 50.000×peso ; a2 = 100.000×peso ; a3 = 300.000×peso ; a4 = 33.333×peso. Texto base: `Penicilina G Cristalina – Reconstituir conforme orientação do fabricante.`

**Grupo: Neonatos**

- **Sífilis Congênita ou Sepse por Streptococcus do grupo B**
  - `≤ 7 dias: 50.000 Unidades/kg/dose EV de 12/12 horas, por 10 dias.`
    - [reconstituir] · Aspirar: `[50.000*peso]` Unidades · Diluir em: `[peso]` mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 12/12 horas, por 10 dias.
  - `> 7 dias: 50.000 Unidades/kg/dose EV de 8/8 horas, por 10 dias.`
    - [reconstituir] · Aspirar: `[50.000*peso]` Unidades · Diluir em: `[peso]` mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 8/8 horas, por 10 dias.
- **Meningite**
  - `≤ 7 dias: 150.000 Unidades/kg/dose EV de 8/8 horas`
    - Aspirar: `[150.000*peso]` Unidades · Diluir em: `[3*peso]` mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 8/8 horas
  - `> 7 dias: 125.000 Unidades/kg/dose EV de 6/6 horas`
    - Aspirar: `[125.000*peso]` Unidades · Diluir em: `[2.5*peso]` mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 6/6 horas

**Grupo: Lactentes, crianças e adolescentes**

- **Dose usual (exceto SNC): 100.000 a 300.000 Unidades/kg/dia EV, dividido de 4/4 ou 6/6 horas**
  - Aspirar: `[100.000*peso]` a `[300.000*peso]` Unidades/dia · Diluir cada dose em: (Dose em UI / 50.000) mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 4/4 ou 6/6 horas. · (Máx.: 24.000.000 Unidades/dia).
- **Sífilis Congênita** — `Dose usual: 50.000 Unidades/kg/dose EV de 4/4 ou 6/6 horas, por 10 dias`
  - Aspirar: `[50.000*peso]` Unidades · Diluir em: `[peso]` mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 4/4 ou 6/6 horas, por 10 dias.
- **Neurossífilis em crianças** — `Dose usual: 50.000 Unidades/kg/dose EV de 4/4 ou 6/6 horas, por 10 a 14 dias`
  - Aspirar: `[50.000*peso]` Unidades · Diluir em: `[peso]` mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30 minutos, de 4/4 ou 6/6 horas, por 10 a 14 dias. · (Máx.: 24.000.000 Unidades/dia).
- **Neurossífilis em adolescentes** — `Dose usual: 3.000.000 - 4.000.000 Unidades/dose EV de 4/4 horas, por 10 a 14 dias`
  - Aspirar: `[3.000.000*peso]` – `[4.000.000*peso]` Unidades · Diluir em: (Dose em UI / 50.000) mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30-60 minutos, de 4/4 horas, por 10 a 14 dias. · (Máx.: 24.000.000 Unidades/dia).
- **Tétano** — `Dose usual: 25.000 Unidades/kg/dose EV de 6/6 horas, por 7 a 10 dias`
  - Aspirar: `[25.000*peso]` Unidades · Diluir em: (Dose em UI / 50.000) mL de SF 0,9% (concentração final de 50.000 UI/mL) · Administrar EV em 30-60 minutos, de 6/6 horas, por 7 a 10 dias. · (Máx.: 20.000.000 Unidades/dia).
- **Difteria** — `Dose usual: 37.500 a 62.500 Unidades/kg/dose EV de 6/6 horas, por 7 a 14 dias`
  - Aspirar: `[37.500*peso]` a `[62.500*peso]` Unidades · Diluir em: (Dose em UI / 50.000) mL... · Administrar EV em 30-60 minutos, de 6/6 horas, por 7 a 14 dias.
- **Endocardite** — `Dose usual: 33.333 a 50.000 Unidades/kg/dose EV de 4/4 horas`
  - Aspirar: `[33.333*peso]` a `[50.000*peso]` Unidades · Diluir em: (Dose em UI / 50.000) mL... · Administrar EV em 30-60 minutos, de 4/4 horas. · (Máx.: 20.000.000 Unidades/dia).
- **Doença de Lyme** — `Dose usual: 33.333 a 66.666 Unidades/kg/dose EV de 4/4 horas`
  - Aspirar: `[33.333*peso]` a `[50.000*peso]` Unidades **(FLAG: dose declarada "33.333 a 66.666" mas multiplicador superior = 50.000*peso (a1), não 66.666*peso — possível inconsistência de origem)** · Diluir em: (Dose em UI / 50.000) mL... · Administrar EV em 30-60 minutos, de 4/4 horas. · (Máx.: 24.000.000 Unidades/dia).
- **Meningite ou Doença meningocócica** — `Dose usual: 300.000 a 400.000 Unidades/kg/dia EV de 4/4 ou 6/6 horas`
  - Aspirar: `[300.000*peso]` a `[400.000*peso]` Unidades/dia · Dividir em 4 a 6 administrações (conforme intervalo escolhido) · Diluir cada dose em: (Dose em UI / 50.000) mL... · Administrar EV em 30 minutos, de 4/4 ou 6/6 horas. · (Máx.: 24.000.000 Unidades/dia).
- **Pneumonia comunitária (> 3 meses)** — `Dose usual: 200.000 a 250.000 Unidades/kg/dia EV, dividido de 4/4 ou 6/6 horas`
  - Aspirar: `[200.000*peso]` a `[250.000*peso]` Unidades · Dividir em 4 a 6 administrações · Diluir cada dose em: (Dose em UI / 50.000) mL... · Administrar EV em 30 minutos, de 4/4 ou 6/6 horas. · (Máx.: 24.000.000 Unidades/dia).
- **Infecções Necrotizantes por Clostridium** — `Dose usual: 60.000 a 100.000 Unidades/kg/dose EV de 6/6 horas`
  - Aspirar: `[60.000*peso]` a `[100.000*peso]` Unidades · Diluir em: (Dose em UI / 50.000) mL... · Administrar EV em 30-60 minutos, de 6/6 horas.

### Cuidados (chave `B.bFo`)
- Infusão em 30–60 minutos
- Pode ser feito via IM na mesma dose, exceto em meningite
- Máximo diário EV: 480 mL/dia (24.000.000 UI/dia)
- Para mais detalhes acesse a bula.

### Contraindicações
- Nenhuma seção explícita.

---

## Penicilina Procaina

**Rota:** `/pediatra/antibioticos/penicilina-procaina`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosPenicilinaProcainaController`)

> **FLAG:** o componente de prescrição reusa a chave de `da("penicilina.g.cristalina.prescription",...)` — provável copy/paste de origem; não afeta o conteúdo exibido.

### Inputs
- **Peso** — campo numérico, placeholder `"Informe o valor"`, sufixo `"kg"`, 1 casa decimal.

### Apresentação
- `Penicilina Procaína 400.000 UI`
- `Pó para solução injetável: Benzilpenicilina Procaína (300.000 UI) + Benzilpenicilina Potássica (100.000 UI)`
- `Cada frasco deverá ser reconstituído em 2 mL de diluente.`
- `Concentração final: 200.000 unidades/mL`

### Prescrição (estrutura `y4`). `peso` = valor digitado. Variáveis: m = 0.25×peso ; l = 50.000×peso.

- **Dose usual: 50.000 unidades/kg/dia IM dividida em 12/12h ou 24/24h**
  - `Fazer [0.25*peso] mL ([50.000*peso] UI) IM 1x/dia ou fracionado de 12/12 horas.` `(Máx.: 1.200.000 Unidades/dia).`
- **Sífilis Congênita** — `Dose usual: 50.000 unidades/kg, IM 1x/dia por 10 dias`
  - `Fazer [0.25*peso] mL ([50.000*peso] UI) IM 1x/dia, por 10 dias.` `(Máx.: 2.400.000 Unidades/dia).`
- **Antraz Inalatório (profilaxia pós-exposição)** — `Dose usual: 25.000 unidades/kg/dose IM de 12/12 horas`
  - `Fazer [0.0625*peso] mL ([25.000*peso] UI) IM de 12/12 horas.` `(Máx.: 1.200.000 Unidades/dose).`
- **Difteria** — `Dose usual:`
  - `Crianças ≤ 10 kg: 300.000 UI IM de 12/12h por 14 dias` → `Fazer 1.5 mL (300.000 UI) IM de 12/12 horas por 14 dias.`
  - `Crianças > 10 kg: 600.000 UI IM de 12/12h por 14 dias` → `Fazer 3 mL (600.000 UI) IM de 12/12 horas por 14 dias.`

### Cuidados (chave `B.a5m`)
- Para mais detalhes acesse a bula.

### Contraindicações
- Nenhuma seção explícita.

---

## Secnidazol

**Rota:** `/pediatra/antibioticos/secnidazol`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosSecnidazolControllerBase`)

### Inputs
- **Peso** — campo numérico, placeholder `"0.0"`, 2 casas decimais (`bz(2,...)`), sem sufixo "kg" no campo.

### Apresentação
- `Suspensão oral: 30 mg/mL`  (referida na prescrição como `Secnidazol (30 mg/mL)`)

### Doses por indicação. `peso` = valor digitado. Volume base = `[peso]` (multiplicador ×1; "Dose usual: 30 mg/kg/dia" / Secnidazol 30 mg/mL → 1 mL/kg). Volume exibido com 1 casa decimal.

- **Amebíase intestinal e Giardíase** — `Dose usual: 30 mg/kg/dia` · `Secnidazol (30 mg/mL) - [peso] mL VO em dose única. (Máx.: 66 mL/dose)`
- **Amebíase hepática** — `Dose usual: 30 mg/kg/dia` · `Secnidazol (30 mg/mL) - [peso] mL VO uma vez ao dia por 5 a 7 dias. (Máx.: 66 mL/dose)`

### Cuidados / Observações (chave `u.fY` — compartilhada com Metronidazol)
- `- Doses não indicadas para período neonatal.`
- `- Para mais detalhes acesse a bula.`

### Contraindicações
- Implícita: doses não indicadas para período neonatal (ver Cuidados).

---

## Vancomicina

**Rota:** `/pediatra/antibioticos/vancomicina`
**Título da tela (AppBar):** "Antibióticos"
(Controller: `_EquationPediatraAntibioticosVancomicinaController`)

### Inputs
- **Peso** — campo numérico, placeholder `"Informe o valor"`, sufixo `"kg"`, 1 casa decimal.
- **Apresentação** — seleção (radio `i9`) entre 2 opções (mesma estrutura de prescrição; muda o texto de reconstituição):
  1. `Pó para solução injetável: 500 mg`  (chave `B.Eo`)
  2. `Pó para solução injetável: 1.000 mg`  (chave `B.Ep`)

### Texto de reconstituição por apresentação (variável `r`)
- 500 mg → `Vancomicina 500 mg – Reconstituir em 10 mL de AD (50 mg/mL)`
- 1.000 mg → `Vancomicina 1.000 mg – Reconstituir em 20 mL de AD (50 mg/mL)`

### Prescrição (estrutura `j5`). `peso` = valor digitado.
Variáveis: d=0.3×peso ; c=15×peso ; b=2.7×peso ; a=0.4×peso ; a0=20×peso ; a1=0.6×peso ; a2=30×peso ; a3=0.9×peso ; a4=45×peso ; a5=1.2×peso ; a6=60×peso.

**Grupo: Neonatos — (Apr. 1.000 mg: "Infecções suscetíveis") — Dose usual**

- `≤ 29 semanas: 15 mg/kg/dose EV de 24/24 horas` (`u.u6`)
  - [reconstituir] · Aspirar: `[0.3*peso]` mL (`[15*peso]` mg) · Diluir em: `[2.7*peso]` mL de SF 0,9% ou SG 5% (5 mg/mL) · Administrar EV em 60 minutos, de 24/24 horas. (`u.m8`)
- `29 a 35 semanas: 15 mg/kg/dose EV de 12/12 horas` (`u.CG`)
  - [reconstituir] · Aspirar: `[0.3*peso]` mL (`[15*peso]` mg) · Diluir em: `[2.7*peso]` mL de SF 0,9% ou SG 5% (5 mg/mL) · Administrar EV em 60 minutos, de 12/12 horas. (`u.pE`)
- `> 35 semanas: 15 mg/kg/dose EV de 8/8 horas` (`u.FF`)
  - [reconstituir] · Aspirar: `[0.3*peso]` mL (`[15*peso]` mg) · Diluir em: `[2.7*peso]` mL de SF 0,9% ou SG 5% (5 mg/mL) · Administrar EV em 60 minutos, de 8/8 horas. (`u.pi`)

**Grupo: Meningite — Neonatos ≥ 2kg**

- `≤ 7 dias: 20 a 30 mg/kg/dia EV, dividido de 8/8 ou 12/12 horas` (`u.uJ`)
  - [reconstituir] · Aspirar: `[0.4*peso]` mL (`[20*peso]` mg) a `[0.6*peso]` mL (`[30*peso]` mg) · Dividir em 2 a 3 administrações (conforme intervalo escolhido) (`u.aF`) · Diluir cada dose em: (Dose em mg / 500) mL de SF 0,9% ou SG 5% (5 mg/mL) (`u.y7`) · Administrar EV em 60 minutos, de 8/8 ou 12/12 horas. (`u.yD`)
- `> 7 dias: 30 a 45 mg/kg/dia EV, dividido de 6/6 ou 8/8 horas` (`u.jO`)
  - [reconstituir] · Aspirar: `[0.6*peso]` mL (`[30*peso]` mg) a `[0.9*peso]` mL (`[45*peso]` mg) · Dividir em 3 a 4 administrações (conforme intervalo escolhido) (`u.je`) · Diluir cada dose em: (Dose em mg / 500) mL... (`u.y7`) · Administrar EV em 60 minutos, de 6/6 ou 8/8 horas. (`u.uj`)

**Grupo: Lactentes, Crianças e Adolescentes**

- `Infecções suscetíveis: 45 a 60 mg/kg/dia EV, dividido de 6/6 ou 8/8 horas` (`u.y4`)
  - [reconstituir] · Aspirar: `[0.9*peso]` mL (`[45*peso]` mg) a `[1.2*peso]` mL (`[60*peso]` mg) · Dividir em 3 a 4 administrações · Diluir cada dose em: (Dose em mg / 500) mL... · Administrar EV em 60 minutos, de 6/6 ou 8/8 horas.
- `Endocardite – Empírico: 15 mg/kg/dose EV de 6/6 horas` (`u.ys`)
  - [reconstituir] · Aspirar: `[0.3*peso]` mL (`[15*peso]` mg) · Diluir em: `[2.7*peso]` mL de SF 0,9% ou SG 5% (5 mg/mL) · Administrar EV em 60 minutos, de 6/6 horas. (`u.t_`) · Máx.: 2 g/dia
- `Meningite: 15 mg/kg/dose EV de 6/6 horas`
  - [reconstituir] · Aspirar: `[0.3*peso]` mL (`[15*peso]` mg) · Diluir em: `[2.7*peso]` mL de SF 0,9% ou SG 5% (5 mg/mL) · Administrar EV em 60 minutos, de 6/6 horas.

**Grupo: Infecções graves por MRSA**

- `3 meses a 12 anos: 60 a 80 mg/kg/dia EV, dividido de 6/6 horas` (`u.nH`)
  - [reconstituir] · Aspirar: `[0.3*peso]` mL (`[15*peso]` mg) a `[0.4*peso]` mL (`[20*peso]` mg) · Diluir em: `[3.6*peso]` mL de SF 0,9% ou SG 5% · Administrar EV em 60 minutos, de 6/6 horas. (`u.t_`) · Máx.: 3,6 g/dia
  - **FLAG: dose-alvo declarada "60 a 80 mg/kg/dia" mas os multiplicadores de aspiração (15→20 mg/kg/dose) refletem a divisão 6/6h; valores calculados são por dose, não por dia.**
- `≥ 12 anos: 60 a 70 mg/kg/dia EV, dividido de 6/6 ou 8/8 horas` (`u.El`)
  - [reconstituir] · Aspirar: `[1.2*peso]` mL (`[60*peso]` mg) a `[1.4*peso]` mL (`[70*peso]` mg) · Dividir em 3 a 4 administrações · Diluir cada dose em: (Dose em mg / 500) mL... · Administrar EV em 60 minutos, de 6/6 ou 8/8 horas. · Máx.: 3,6 g/dia

> Nota: as duas apresentações (500 mg e 1.000 mg) usam exatamente os mesmos blocos de dose/diluição; só muda o texto de reconstituição (10 mL vs 20 mL de AD). Pequena diferença de cabeçalho de grupo entre apresentações: na Apr.1.000 mg o grupo Neonatos exibe sub-rótulo "Infecções suscetíveis"; na Apr.500 mg não.

### Cuidados (chave `B.bCB`)
- Diluir a dose desejada em SF 0,9% ou SG 5% para concentração máxima de 5 mg/mL.
- Infundir em 1 hora.
- Para mais detalhes acesse a bula.

### Contraindicações
- Nenhuma seção explícita.

---

## Flags / incertezas (resumo)

1. **Gentamicina — `u.d`**: literal `"7 dias de vida: 5 mg/kg/dose EV/IM de 24/24 horas"` sem ">" inicial; pelo contexto (faixa IG ≥ 35 semanas) provavelmente deveria ser "> 7 dias". Transcrito verbatim.
2. **Gentamicina — Apr. 20 mg/mL e 40 mg/mL**: alguns textos de diluição na linha "IG ≥ 35 semanas / 7 dias" referenciam "Gentamicina 10 mg/mL" / "(10 mg/mL)" e "Gentamicina 20 mg/mL" dentro de apresentações de 20/40 mg/mL — possível inconsistência de origem (não alterado).
3. **Meropenem — Neonatos ≥ 32 sem / > 14 dias (30 mg/kg)**: o "Aspirar" usa multiplicador `0.6*peso` mas exibe `[20*peso]` mg como rótulo de mg; dose declarada é 30 mg/kg. Possível mismatch de origem.
4. **Metronidazol — Amebíase**: label-fonte verbatim = "Dose usual: 35 a 50 mg/kg/dia".
5. **Penicilina G Benzatina**: typo verbatim "tempo não definidido".
6. **Penicilina G Cristalina — Doença de Lyme**: dose declarada "33.333 a 66.666 Unidades/kg/dose" mas o multiplicador superior calculado = `50.000*peso` (variável a1), não 66.666×peso. Possível inconsistência de origem.
7. **Penicilina Procaina**: componente de prescrição reusa a chave `"penicilina.g.cristalina.prescription"` (copy/paste de origem; não afeta texto exibido).
8. **Vancomicina — MRSA 3m-12a**: dose-alvo é "/dia" mas os volumes/mg calculados são por dose (divisão 6/6h). Documentado.
9. **Pen. G Benzatina vs Cristalina**: mesmo id interno `17` no menu (provável typo de origem).
10. **Diferença Gentamicina clearance vs pediátrica**: existe também um controller `_EquationGentamicinaControllerBase` (cálculo de TFG/clearance baseado em creatinina/idade/sexo) em outra parte do bundle — **NÃO** é a tela pediátrica de dose documentada aqui. A tela pediátrica é `_EquationPediatraAntibioticosGentamicinaController`.
