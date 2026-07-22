# Pediatria — As-Is — Antibióticos (A a C)

> Auditoria as-is extraída do bundle Flutter compilado (`main.decoded.js`). Conteúdo clínico transcrito verbatim. Valores calculados a partir do peso (e às vezes idade/seleção) aparecem como `[valor calculado]`, com o template literal ao redor preservado.
>
> **Categoria:** Antibióticos — rota base `/pediatra/antibioticos/...`
>
> **Empty state (global de todas as telas com input):** antes do cálculo o app exibe, em vermelho, `Informe todos os dados para obter o resultado.`

## Rotas desta seção (A a C)

| # | Rota | Título exibido | Tipo de tela |
|---|---|---|---|
| 1 | `/pediatra/antibioticos/acetilcefuroxima` | Acetilcefuroxima | Peso + prescrição calculada |
| 2 | `/pediatra/antibioticos/albendazol` | Albendazol | Peso + tabelas por indicação |
| 3 | `/pediatra/antibioticos/amicacina` | Amicacina | Peso + Select de concentração |
| 4 | `/pediatra/antibioticos/amoxicilina` | Amoxicilina | Peso + prescrição calculada |
| 5 | `/pediatra/antibioticos/amoxicilina-clavulanato` | Amoxicilina + Clavulanato | Peso + Select de apresentação |
| 6 | `/pediatra/antibioticos/amoxicilina-sulbactam` | Amoxicilina + Sulbactam | Peso + Select de apresentação |
| 7 | `/pediatra/antibioticos/ampicilina` | Ampicilina | Peso + Select de apresentação |
| 8 | `/pediatra/antibioticos/ampicilina-sulbactam` | Ampicilina + Sulbactam | Peso + Select de apresentação |
| 9 | `/pediatra/antibioticos/azitromicina` | Azitromicina | Peso + Select (VO / EV) |
| 10 | `/pediatra/antibioticos/cefalexina` | Cefalexina | Peso + Select de apresentação |
| 11 | `/pediatra/antibioticos/cefepima` | Cefepima | Peso + Select de apresentação |
| 12 | `/pediatra/antibioticos/ceftriaxone` | Ceftriaxone | Peso + prescrição calculada |
| 13 | `/pediatra/antibioticos/cefuroxima` | Cefuroxima | Peso + prescrição calculada |
| 14 | `/pediatra/antibioticos/claritromicina` | Claritromicina | Peso + Select de apresentação |

> NOTA DE FIDELIDADE: cada tela tem o campo **Peso** com placeholder. Telas que usam `B.L` (formatador inteiro) mostram placeholder `Informe o valor` e sufixo `kg`, casa decimal 1. Telas que usam `new A.bz(2,...)` mostram placeholder `0.0`, 2 casas decimais, sem sufixo. Esses detalhes estão anotados por droga.

---

## H2. Acetilcefuroxima

### H3. Acetilcefuroxima — `/pediatra/antibioticos/acetilcefuroxima`

- **Input do usuário:** campo único **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (formato inteiro `B.L`). Sem campo de idade, sem dropdown.
- **Apresentação (exibida acima da prescrição):** `Pó para suspensão oral: 250 mg/5 mL (50 mg/mL)`
- **Bloco Prescrição** (duas indicações fixas):
  - Indicação 1 — `Amigdalite e faringite`
    - Texto: `Dose usual 10 mg/kg duas vezes ao dia (Máx.: 500 mg/dia)`
    - Template: `Acetilcefuroxima (250 mg/5 mL) - [valor calculado] mL VO de 12/12 horas.`
    - (volume calculado = peso × 0,2 → arredondado a 0 casas; gatilho interno `gauA`)
  - Indicação 2 — `Otite média, sinusite, pneumonia, infecção do trato urinário, infecções de pele`
    - Texto: `Dose usual 15 mg/kg duas vezes ao dia (Máx.: 1.000 mg/dia)`
    - Template: `Acetilcefuroxima (250 mg/5 mL) - [valor calculado] mL VO de 12/12 horas.`
    - (volume calculado = peso × 0,3 → 0 casas; gatilho interno `gauB`)
- **Cuidados:**
  - `- Doses indicadas para crianças maiores que 3 meses`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Albendazol

### H3. Albendazol — `/pediatra/antibioticos/albendazol`

- **Input do usuário:** campo único **Peso** — placeholder `0.0`, 2 casas decimais (`new A.bz(2,!1,!0)`), sem sufixo. Sem idade, sem dropdown. (Observação: a maioria das condutas usa dose fixa `10 mL` ou `5 mL`, independente do peso; só a Cisticercose tem um valor calculado.)
- **Apresentação:** `Solução oral: 40 mg/mL`
- **Blocos Prescrição (por indicação):**
  - **Ascaridíase**
    - `≥ 2 anos\nAlbendazol (40 mg/mL) - 10 mL VO, dose única.`
    - `< 2 anos\nAlbendazol (40 mg/mL) - 5 mL VO, dose única.`
  - **Tricuríase**
    - `Albendazol (40 mg/mL) - 10 mL VO 1x/dia por 3-7 dias.`
  - **Ancilostomíase**
    - `≥ 2 anos\nAlbendazol (40 mg/mL) - 10 mL VO, dose única.`
    - `< 2 anos\nAlbendazol (40 mg/mL) - 5 mL VO, dose única.`
  - **Enterobíase**
    - `Albendazol (40 mg/mL) - 10 mL VO, dose única. Repetir em 2 semanas.`
  - **Toxocaríase**
    - `Albendazol (40 mg/mL) - 10 mL VO, 2x/dia por 5 dias.`
  - **Cisticercose**
    - `Albendazol (40 mg/mL) - 10 mL VO, 2x/dia por 2 a 4 semanas.\n\nOu\n`
    - `Albendazol (40 mg/mL) - [valor calculado] mL VO, 2x/dia por 2 a 4 semanas. (Máx.: 15 mL/dose)` (valor calculado = peso × 0,1875, 1 casa)
  - **Giardíase**
    - `Albendazol (40 mg/mL) - 10 mL VO, 2x/dia por 5 dias.`
- **Cuidados:** *(não há bloco "Cuidados" separado nesta tela — somente os blocos por indicação acima.)*

---

## H2. Amicacina

### H3. Amicacina — `/pediatra/antibioticos/amicacina`

- **Input do usuário:**
  - Campo **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`).
  - **Select de concentração** (radio em sheet, 3 opções; rótulo de cada opção = a apresentação):
    - `Solução injetável: 50 mg/mL (ampola com 2 mL)` (id interno `B.Ec`)
    - `Solução injetável: 125 mg/mL (ampola com 2 mL)` (id `B.Ed`)
    - `Solução injetável: 250 mg/mL (ampola com 2 mL)` (id `B.Ee`)
- **Prescrição:** exibida só após selecionar concentração + peso. A prescrição é uma tabela longa, organizada por faixa etária/IG e por indicação. As linhas de dose (mg/kg/dose) são **iguais nas três concentrações**; só muda o volume (mL) calculado. Estrutura completa abaixo (os mg/kg/dose vêm de strings fixas; os volumes são calculados).

**Cabeçalhos de dose (mesmos para 50/125/250 mg/mL):**

- **Neonatos — Infecções suscetíveis (exceto SNC):**
  - IG < 30 semanas: `≤ 14 dias de vida: 15 mg/kg/dose EV/IM de 48/48 horas` | `> 14 dias de vida: 15 mg/kg/dose EV/IM de 24/24 horas`
  - IG 30-34 semanas: `≤ 10 dias de vida: 15 mg/kg/dose EV/IM de 24/24 ou 36/36 horas` | `11 a 60 dias de vida: 15 mg/kg/dose EV/IM de 24/24 horas`
  - IG ≥ 35 semanas: `≤ 7 dias de vida: 15 mg/kg/dose EV/IM de 24/24 horas` | `8 a 60 dias de vida: 17,5 mg/kg/dose EV/IM de 24/24 horas`
- **Infecções do SNC (neonatos ≥ 2 kg):**
  - `≤ 7 dias de vida: 7,5 a 10 mg/kg/dose EV/IM de 12/12 horas` | `> 7 dias de vida: 10 mg/kg/dose EV/IM de 8/8 horas`
- **Crianças e Lactentes — Infecções suscetíveis (exceto SNC):**
  - `Esquema 1: 15 a 30 mg/kg/dose EV/IM de 24/24 horas`
  - `Esquema 2: 5 a 7,5 mg/kg/dose EV/IM de 8/8 horas`
- **Infecções do SNC:** `Dose usual: 6,7 a 10 mg/kg/dose EV/IM de 8/8 horas`
- **Infecções intrabdominais:** `Dose usual: 5 a 7,5 mg/kg/dose EV de 8/8 horas`

**Padrão de cada linha de prescrição (template literal):**
`Fazer [vol] mL ([mg] mg) [via/frequência] OU Amicacina <CONC> mg/mL – [vol] mL ([mg] mg) + [vol diluente] mL de SF 0,9% ou SG 5% (5 mg/mL). <rodapé de infusão>`

Rodapés de infusão (strings fixas, reutilizadas):
- `Fazer EV em 30–60 minutos, de 48/48 horas.`
- `Fazer EV em 30–60 minutos, de 24/24 ou 36/36 horas.`
- `Fazer EV em 30–60 minutos, de 24/24 horas.`
- `Fazer EV em 30–60 minutos, de 12/12 horas.`
- `Fazer EV em 30–60 minutos, de 8/8 horas.`
- `Fazer EV em 60 minutos, de 8/8 horas.`
- `Fazer EV em 60 minutos, de 24/24 horas.`
- IM: `IM de 48/48 horas.` / `IM de 24/24 ou 36/36horas.` / `IM de 24/24 horas.` / `IM de 12/12 horas.` / `IM de 8/8 horas.`

**Fatores de cálculo de volume por concentração (verbatim do código — `b` = peso em kg):**
- Concentração **50 mg/mL** (`ajL`): mL = `0.3*b` (dose 15 mg/kg), `0.35*b` (17,5 mg/kg), `0.15*b` (7,5 mg/kg), `0.2*b` (10 mg/kg), `0.6*b` (30 mg/kg), `0.1*b` (5 mg/kg), `0.13*b` (SNC 6,7 mg/kg); volume de diluente proporcional (`2.7*b`, `1.8*b`, `1.35*b`, etc.).
- Concentração **125 mg/mL** (`ajJ`): mL = `0.12*b` (15 mg/kg), `0.14*b` (17,5), `0.06*b` (7,5), `0.08*b` (10), `0.24*b` (30), `0.04*b` (5), `0.054*b` (SNC 6,7).
- Concentração **250 mg/mL** (`ajK`): mL = `0.06*b` (15 mg/kg), `0.07*b` (17,5), `0.03*b` (7,5), `0.04*b` (10), `0.12*b` (30), `0.02*b` (5), `0.0268*b` (SNC 6,7).
- (mg exibidos: `15*b`, `17.5*b`, `7.5*b`, `10*b`, `30*b`, `5*b`, `6.7*b`.)
- **FLAG:** a tabela completa de amicacina é extensa (3 concentrações × ~8 cenários × IM/EV/diluente). Acima estão todos os cabeçalhos verbatim e todos os fatores; os volumes individuais são `[valor calculado]` por linha conforme os fatores listados.

- **Cuidados (bloco `Cuidados`):**
  - `Diluir a dose desejada em SF 0,9% ou SG 5% para concentração final ≤ 5 mg/mL`
  - `Infundir por 30 a 60 minutos. Em lactentes infundir em 1 a 2 horas.`
  - `Não precisa diluir para administrar IM.`
  - `Atenção para ajuste da dose conforme a função renal.`
  - `Para mais detalhes acesse a bula.`

---

## H2. Amoxicilina

### H3. Amoxicilina — `/pediatra/antibioticos/amoxicilina`

- **Input do usuário:** campo único **Peso** — placeholder `0.0`, 2 casas decimais (`new A.bz(2,!1,!0)`). Sem idade, sem dropdown. (Observação: o app só exibe as instruções a partir de `crianças ≥ 3 meses` — ver Cuidados.)
- **Bloco Prescrição:** (rótulo `Prescrição:`)
  - **Regime padrão:**
    - `Suspensão: (250 mg/5 mL) - [v1] a [v2] mL VO de 8/8 horas (máx.: 10 mL/dose)` (v1 = peso×0,267; v2 = peso×0,33)
    - `Suspensão: (400 mg/5 mL) - [v] a [v] mL VO de 12/12 horas (máx.: 6,25 mL/dose)` (peso×0,25 a peso×0,3125)
    - `Suspensão: (500 mg/5 mL) - [v] a [v] mL VO de 8/8 horas (máx.: 5 mL/dose)` (peso×0,133 a peso×0,1667)
  - **Regime dose alta:**
    - `Suspensão: (250 mg/5 mL) - [v] a [v] mL VO de 12/12 horas (máx.: 40 mL/dose)` (peso×0,8 a peso×0,9)
    - `Suspensão: (400 mg/5 mL) - [v] a [v] mL VO de 12/12 horas (máx.: 25 mL/dose)` (peso×0,5 a peso×0,5625)
    - `Suspensão: (500 mg/5 mL) - [v] a [v] mL VO de 12/12 horas (máx.: 20 mL/dose)` (peso×0,4 a peso×0,45)
- **Bloco Dose usual** (texto fixo):
  - `Regime padrão: 40 a 50 mg/kg/d fracionada 2 a 3 vezes ao dia. Máx.: 500 mg/dose.`
  - `Regime dose alta: 80-90 mg/kg/d fracionada a cada 12 horas. Máx.: 4000 mg/dia.`
- **Cuidados:**
  - `- Posologia para crianças ≥ 3 meses`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Amoxicilina + Clavulanato

### H3. Amoxicilina + Clavulanato — `/pediatra/antibioticos/amoxicilina-clavulanato`

- **Input do usuário:**
  - Campo **Peso** — placeholder `0.0`, 2 casas decimais.
  - **Select de apresentação** (dropdown `A.hO`, 4 opções id `0`/`1`/`2`/`3`).
- **Prescrição (por opção selecionada):**
  - **Opção `0` — Suspensão (125 + 31,25 mg/5 mL):** `Crianças maiores de 2 meses`
    - `Para infecções leves a moderadas:` → `Suspensão: (125 + 31,25 mg/5 mL) - [v] mL VO de 8/8 horas (25/3,6 mg/kg/dia) (Máx.: 20 mL/dose)` (v = peso×0,33, limitado a 20)
    - `Para infecções mais graves:` → `Suspensão: (125 + 31,25 mg/5 mL) - [v] mL VO de 8/8 horas (45/6,4 mg/kg/dia) (Máx.: 20 mL/dose)` (v = peso×0,6, limitado a 20)
  - **Opção `1` — Suspensão (250 + 62,5 mg/5 mL):** `Crianças maiores de 2 meses`
    - leves a moderadas → `[v] mL VO de 8/8 horas (25/3,6 mg/kg/dia) (Máx.: 10 mL/dose)` (v = peso×0,16, limitado a 20)
    - mais graves → `[v] mL VO de 8/8 horas (45/6,4 mg/kg/dia) (Máx.: 10 mL/dose)` (v = peso×0,3, limitado a 20)
  - **Opção `2` — Suspensão (400 + 57 mg/5 mL):** `Crianças maiores de 2 meses`
    - leves a moderadas → `[v] mL VO de 12/12 horas (25/3,6 mg/kg/dia). (Máx.: 10 mL/dose)` (v = peso×0,15625, limitado a 10)
    - mais graves → `[v] mL VO de 12/12 horas (45/6,4 mg/kg/dia) (Máx.: 10 mL/dose)` (v = peso×0,28125, limitado a 10)
  - **Opção `3` — Pó para solução injetável (1.000 + 200 mg):**
    - `Crianças até 28 dias` → `1 Frasco-ampola + SF 0,9% 100 mL (10 mg/mL) – Fazer [v] mL EV em 30-40 minutos de 12/12 horas (25/5 mg/kg/dia)` (v = peso×2,5, limitado a 100)
    - `Crianças >28 dias a 12 anos` → `Fazer [v] mL EV em 30-40 minutos de 8/8 horas (25/5 mg/kg/dia) (Máx.: 100 mL/dose)\n\nNota: Em infecções mais graves, deve-se diminuir o intervalo para 6 horas, em maiores de 3 meses.`
    - `Crianças ≥12 anos` → `Fazer 100 mL EV em 30-40 minutos de 8/8 horas (1.000 + 200 mg).\n\nNota: Em infecções mais graves, deve-se diminuir o intervalo para 6 horas, em maiores de 3 meses.`
- **Cuidados:**
  - `- Posologia VO para crianças ≥ 2 meses.`
  - `- A depender da literatura o regime de dose alta VO pode chegar a 90 mg/kg/dia de amoxicilina.`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Amoxicilina + Sulbactam

### H3. Amoxicilina + Sulbactam — `/pediatra/antibioticos/amoxicilina-sulbactam`

- **Input do usuário:**
  - Campo **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`).
  - **Select de apresentação/regime** (`Escolha:`, dropdown `j_`, opções id `0`/`1`/`2`/(default)).
- **Prescrição (por opção):**
  - **Opção `0` — Pó para Suspensão Oral (200 + 50 mg/mL):**
    - Texto: `Dose usual entre 40 e 100 mg/kg/dia de amoxicilina conforme gravidade:`
    - `Pó para Suspensão Oral: (200 + 50 mg/mL) - [v1] a [v2] mL VO de 12/12 horas. (Máx.: 5 mL/dose).` (v1/v2 via `gaCo`/`gaCr`)
  - **Opção `1` — Comprimido (875 + 125 mg):**
    - Texto: `Crianças maiores de 12 anos`
    - `Comprimido: (875 + 125 mg) - 1 comprimido VO de 12/12 horas.`
  - **Opção `2` — Pó para solução injetável (500 + 250 mg) [crianças maiores de 12 anos]:**
    - Cabeçalho: `Crianças maiores de 12 anos\nDose usual: 1.000 + 500 mg EV/IM a cada 8 horas`
    - IM: `Cada frasco-ampola deverá ser reconstituído em 3,5 mL de diluente.\n\nPó para solução injetável: (500 + 250 mg) - Aspirar [v] mL ([mg] mg) a [v] mL ([mg] mg) e fazer IM de 12/12 horas.`
    - EV 12/12: `Pó para solução injetável: (500 + 250 mg) - Diluir cada frasco-ampola para 20mL de SF 0,9% (37,5 mg/mL - 25 mg/mL de amoxicilina) - Fazer [v] mL ([mg] mg) a [v] mL ([mg] mg) EV de 12/12 horas.`
    - EV 8/8: `Pó para solução injetável: (500 + 250 mg) - Diluir cada frasco-ampola para 20 mL de SF 0,9% (37,5 mg/mL - 25 mg/mL de amoxicilina) - Fazer [v] mL ([mg] mg) a [v] mL ([mg] mg) EV de 8/8 horas.`
    - Bloco final fixo: `Crianças maiores de 12 anos` → `Cada frasco-ampola deverá ser reconstituído em 3,5 mL de diluente.\n\nPó para solução injetável: (500 + 250 mg) - Diluir os 2 frascos-ampola para 50 mL de SF 0,9% (30 mg/mL) - Fazer EV de 8/8 horas.`
  - **Opção default (sem id 0/1/2) — Pó para solução injetável (1000 + 500 mg):**
    - IM: `Cada frasco-ampola deverá ser reconstituído em 3,5 mL de diluente.\n\nPó para solução injetável: (1000 + 500 mg) - [v] mL ([mg] mg) a [v] mL ([mg] mg) IM de 12/12 horas. (40 a 50 mg/kg/dia).`
    - EV 12/12: `Pó para solução injetável: (1.000 + 500 mg) - Diluir cada frasco-ampola para 50 mL de SF 0,9% (30 mg/mL - 20 mg/mL de amoxicilina) - Fazer [v] mL ([mg] mg) a [v] mL ([mg] mg) EV de 12/12 horas. (40 a 50 mg/kg/dia).`
    - EV 8/8: `... Fazer [v] mL ([mg] mg) a [v] mL ([mg] mg) EV de 8/8 horas. (40 a 50 mg/kg/dia).`
    - `Crianças maiores de 12 anos` → `Cada frasco-ampola deverá ser reconstituído em 3,5 mL de diluente.\n\nPó para solução injetável: (1.000 + 500 mg) - Diluir 1 frasco-ampola para 50 mL de SF 0,9% (30 mg/mL) - Fazer EV de 8/8 horas.`
- **Cuidados (somente para opção EV):**
  - `- A concentração máxima de amoxicilina-sulbactam para administração EV varia conforme o solvente. Com SF 0.9% a concentração máxima é de 45 mg/mL.`
  - `- Para mais detalhes acesse a bula.`
- **FLAG:** os rótulos curtos exatos exibidos no dropdown (sheet) não são strings independentes — o app deriva da apresentação. Os valores `[v]`/`[mg]` vêm de gatilhos `gaCo, gaCr, gCb, gUB, gaCq, gpV, gaCx, gagc, gaCu, gagd, gaCv, gage, gaCm, gaCn, gaCz` (fatores não totalmente desdobrados aqui — todas as frequências, diluições e concentrações estão verbatim acima).

---

## H2. Ampicilina

### H3. Ampicilina — `/pediatra/antibioticos/ampicilina`

- **Input do usuário:**
  - Campo **Peso** — placeholder `0.0`, 2 casas decimais (`new A.bz(2,!1,!0)`).
  - **Select de apresentação** (`Escolha:`, dropdown `j_`, opções id `0`/`1`/`2`):
    - id `0` = Ampicilina 50 mg/mL (suspensão VO)
    - id `1` = Ampicilina 500 mg (pó injetável)
    - id `2` = Ampicilina 1.000 mg (pó injetável)
- **Prescrição (por opção):**
  - **Opção `0` — Ampicilina (50 mg/mL) — VO:**
    - `Para infecções não graves:\nDose usual: 50 a 100 mg/kg/dia - fracionado a cada 6 horas`
    - `Ampicilina (50 mg/mL) - [v1] a [v2] mL VO de 6/6 horas. (Máx.: 10 mL/dose)` (v1 = peso×0,25; v2 = peso×0,5)
  - **Opção `1` — Ampicilina (500 mg) — IM/EV:** (reconstituir em 3 mL de diluente → 3,4 mL)
    - Indicação `Infecções de vias respiratórias, intestinais e urinárias.\nDose usual 50 a 200 mg/kg/dia dividida a cada 4 a 6 horas`
    - IM: `Ampicilina (500 mg) - Reconstituir cada frasco-ampola em 3 mL de diluente. Após expansão a solução terá 3,4 mL\n\nAspirar [v] mL ([mg] mg) a [v] mL ([mg] mg) e fazer IM - 6/6 horas.`
    - EV: `Aspirar [v] mL ([mg] mg) a [v] mL ([mg] mg) e diluir em pelo menos [v] de SF 0,9%, e fazer EV - 6/6 horas.`
    - Indicação `Osteomielite\nDose usual 200 mg/kg/dia dividida a cada 4 a 6 horas` (IM + EV, mesmos templates)
    - Indicação `Endocardite\nDose usual 200 a 300 mg/kg/dia dividida a cada 4 a 6 horas` (IM + EV)
    - Indicação `Meningite\nDose usual 300 a 400 mg/kg/dia dividida a cada 4 a 6 horas` (IM + EV)
    - Cálculos de referência (opção `1`): mg = `12.5*peso`(dose mín) / `50*peso` / `75*peso` / `100*peso`; volumes via `gceh/gceg/gbPt/gbPr/gbPw/gbPs/gbPx` (fórmula base `X*peso*3.4/500`); diluente EV = `mg/30` mL.
  - **Opção `2` — Ampicilina (1.000 mg) — IM/EV:** (reconstituir em 3 mL → 3,4 mL) — mesma estrutura de indicações que a opção `1`, com `Ampicilina (1.000 mg) - Reconstituir cada frasco-ampola em 3 mL de diluente. Após expansão a solução terá 3,4 mL`; volumes via `gbPo/gbPm/gbPq/gbPn/gbPu/gbPp/gbPv` (fórmula base `X*peso*3.4/1000`).
- **Cuidados:**
  - `- Dose máxima EV:12 g/dia`
  - `- Diluir em SF 0,9% e manter uma concentração final de 2 a 30 mg/mL.`
  - `- Doses não indicadas para período neonatal.`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Ampicilina + Sulbactam

### H3. Ampicilina + Sulbactam — `/pediatra/antibioticos/ampicilina-sulbactam`

- **Input do usuário:**
  - Campo **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`).
  - **Select de apresentação** (`Escolha:`, dropdown `j_`, opções id `0`/(default)):
    - id `0` = Pó para solução injetável (1.000 + 500 mg/mL) — reconstituir em 3,2 mL → 4,1 mL
    - default = Pó para solução injetável (2.000 + 1.000 mg/mL) — reconstituir em 6,4 mL → 8,4 mL
- **Prescrição — Opção `0` (1.000 + 500 mg/mL):** (faixas por idade/indicação, IM e EV)
  - `Recém-Nascidos prematuros\nDose usual: 50 mg/kg/dia de ampicilina dividida em 2 doses`
    - IM: `Pó para solução injetável: (1.000 + 500 mg/mL)\nCada frasco-ampola deverá ser reconstituído em 3,2 mL de diluente. Após expansão a solução terá 4,1 mL.\n\nFazer [v] mL ([mg] mg) IM de 12/12 horas.`
    - EV: `Aspirar [v] mL ([mg] mg) e diluir em pelo menos [v] mL de SF 0,9%, e fazer EV em 15 a 30 minutos, de 12/12 horas.`
  - `Recém-Nascidos a termo\nDose usual: 100 mg/kg/dia de ampicilina dividida em 3 ou 4 doses.`
    - EV 6/6: `... de SF 0,9%, e fazer EV em 15 a 30 minutos, de 6/6 horas.`
    - EV 8/8: `... de SF 0,9%, e fazer EV em 15 a 30 minutos, de 8/8 horas.`
  - `Lactentes, crianças e adolescentes\nDose usual: 100 a 200 mg/kg/dia de ampicilina dividida em 4 doses.` (EV 6/6)
  - `Endocardite\nDose usual: 200 a 300 mg/kg/dia dividida a cada 4 ou 6 horas.` (EV 6/6 + EV 4/4)
  - `Infecção intra-abdominal ou de tecidos moles\nDose usual: 200 mg/kg/dia dividida a cada 6 horas.` (EV 6/6)
  - `Rinossinusite grave\nDose usual: 200 a 400 mg/kg/dia dividida a cada 4 ou 6 horas.` (EV 6/6 + EV 4/4)
  - `Meningite\nDose usual: 400 mg/kg/dia dividida a cada 4 ou 6 horas.` (EV 6/6 + EV 4/4)
- **Prescrição — Opção default (2.000 + 1.000 mg/mL):** mesma lista de faixas/indicações com `Pó para solução injetável: (2.000 + 1.000 mg/mL)\nCada frasco-ampola deverá ser reconstituído em 6,4 mL de diluente. Após expansão a solução terá 8,4 mL.` (a indicação "Rinosinusite grave" aparece grafada `Rinosinusite` nesta variante — verbatim no bundle).
- **Cuidados:**
  - `- A concentração máxima de ampicilina-sulbactam para administração EV varia conforme o solvente. Com SF 0.9% a concentração máxima é de 45 mg/mL.`
  - `- Após reconstituição a droga sofre expansão. 1500 mg + 3,2 mL de diluente, terá um volume de 4,1 mL. Enquanto 3.000 mg + 6,4 mL de diluente, terá um volume de 8,4 mL.`
  - `- Para mais detalhes acesse a bula.`
- **FLAG:** os volumes `[v]`/`[mg]` por linha vêm de gatilhos `gUx, gpV, gUC, ga2G, gIA, gagf, gNh, gy5, gUD, gaCs, gagg, gUG, gaga, gUz, gUA, gag8, gUE, gUF, gUy, gCb, gNi, gaCt, gagb, gag9` — todas as frequências, diluições e doses mg/kg/dia estão verbatim acima; os fatores numéricos exatos por gatilho não foram totalmente desdobrados.

---

## H2. Azitromicina

### H3. Azitromicina — `/pediatra/antibioticos/azitromicina`

- **Input do usuário:**
  - Campo **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`).
  - **Select de via** (radio em sheet, 2 opções; rótulo = apresentação):
    - `Pó para suspensão oral (40 mg/mL): 600 mg/9 mL (15 mL de suspensão)\nou 900 mg/12 mL (22,5 mL de suspensão)\nou 1.500 mg/22 mL (37,5 mL de suspensão)` (id `B.Ef` — VIA ORAL)
    - `Pó para solução injetável: 500 mg` (id `B.Eg` — USO ENDOVENOSO)
- **Prescrição — VIA ORAL (`bfq`):** (cada item: cabeçalho + dose + template; `l` = peso em kg)
  - `Dose usual: 10 mg/kg/dia` → `Azitromicina – [0.25*l] mL [10*l] mg , via oral, de 24/24 horas (Máx.: 12,5 mL/dose – 500 mg).`
  - `Infecção por Chlamydia trachomatis` / `Dose usual: 1 g em dose única – crianças acima de 45 kg` → `Azitromicina – 25 mL 1 g , via oral, dose única.`
  - `Pneumonia congênita por Chlamydia trachomatis em lactentes:` / `Dose usual: 20 mg/kg/dia, por 3 dias` → `Azitromicina – [0.5*l] mL [20*l] mg , via oral, uma vez ao dia, por 3 dias.`
  - `Coqueluche` / `Dose usual: 1 a 6 meses: 10 mg/kg/dia, por 5 dias`:
    - `Azitromicina – [0.25*l] mL [10*l] mg , via oral, de 24/24 horas, por 5 dias.`
    - `Dose usual: ≥ 6 meses: Dia 1: 10 mg/kg/dia; Dia 2-5: 5 mg/kg` → `Dia 1: Azitromicina – [0.25*l] mL [10*l] mg , via oral. (Máx.: 12,5 mL/dose – 500 mg). Dia 2-5: Azitromicina – [0.125*l] mL [5*l] mg , via oral, de 24/24 horas. (Máx.: 6,3 mL/dose – 250 mg).`
  - `Amigdalite por estreptococo do grupo A` / `Dose usual: 12 mg/kg/dia, por 5 dias` → `Azitromicina – [0.3*l] mL [12*l] mg , via oral, de 24/24 horas, por 5 dias. (Máx.: 12,5 mL/dose – 500 mg).`
  - `Fibrose cística` / `Crianças ≥ 3 meses` / `Dose usual: 10 mg/kg/dia – 3 x/semana` → `Azitromicina – [0.25*l] mL [10*l] mg , via oral, 3 vezes na semana. (Máx.: 12,5 mL/dose – 500 mg).`
- **Prescrição — USO ENDOVENOSO (`b8h`):**
  - Bloco fixo: `Reconstituir 1 ampola em 5 mL de AD → diluir para mínimo 1 mg/mL em SF 0,9%` · `Tempo de infusão: mínimo 1h (preferencialmente 3h)`
  - `Dose usual: 10 mg/kg/dia` → `Aspirar [0.1*l] mL da ampola reconstituída (100 mg/mL) e diluir em [10*l] mL de SF 0,9% (1 mg/mL) – Fazer EV em 3 horas de 24/24 horas.`
  - `Pneumonia por Chlamydia trachomatis` / `Dose usual: 20 mg/kg/dia, por 3 dias` → `Aspirar [0.2*l] mL da ampola reconstituída (100 mg/mL) e diluir em [20*l] mL de SF 0,9% (1 mg/mL) – Fazer EV em 3 horas de 24/24 horas, por 3 dias.`
  - `Coqueluche` / `Dose usual: 1 a 6 meses: 10 mg/kg/dia, por 5 dias`:
    - `Aspirar [0.1*l] mL... e diluir em [10*l] mL de SF 0,9% (1 mg/mL) – Fazer EV em 3 horas de 24/24 horas.`
    - `Dose usual: ≥ 6 meses: Dia 1: 10 mg/kg/dia; Dia 2-5: 5 mg/kg` → `Dia 1: Aspirar [0.1*l] mL... diluir em [10*l] ml... (Máx.: 500 mg/dose). Dia 2-5: Aspirar [0.05*l] mL... diluir em [5*l] mL... (Máx.: 250 mg/dose).`
- **Cuidados:** *(bloco `Cuidados` referenciado como `B.bDB` — conteúdo não desdobrado nesta janela; FLAG para extração futura se necessário.)*

---

## H2. Cefalexina

### H3. Cefalexina — `/pediatra/antibioticos/cefalexina`

- **Input do usuário:**
  - Campo **Peso** — placeholder `0.0`, 2 casas decimais (`new A.bz(2,!1,!0)`).
  - **Select de apresentação** (dropdown `A.hO`, opções id `0`/`1`):
    - id `0` = Cefalexina 250 mg/5 mL
    - id `1` = Cefalexina 500 mg/5 mL
- **Prescrição (rótulo `Prescrição:`):**
  - **Opção `0` (250 mg/5 mL):**
    - `Para infecções não graves:\nDose usual: 25 a 50 mg/kg/dia – fracionado a cada 6 ou 12 horas`
      - `Cefalexina (250 mg/5 mL) - [v] a [v] mL VO de 6/6 horas. (Máx.: 10 mL/dose)\n\nou\n` (peso×0,125 a peso×0,25)
      - `Cefalexina (250 mg/5 mL) - [v] a [v] mL VO de 12/12 horas (Máx.: 10 mL/dose)\n\n` (peso×0,25 a peso×0,5)
    - `Para infecções graves:\nDose usual: 75 a 100 mg/kg/dia – fracionado a cada 6 ou 8 horas`
      - `Cefalexina (250 mg/5 mL) - [v] a [v] mL VO de 6/6 horas. (Máx.: 20 mL/dose)\n\nou\n` (peso×0,375 a peso×0,5)
      - `Cefalexina (250 mg/5 mL) - [v] a [v] mL VO de 8/8 horas. (Máx.: 26 mL/dose)` (peso×0,5 a peso×0,66)
  - **Opção `1` (500 mg/5 mL):**
    - `Para infecções não graves:\nDose usual: 25 a 50 mg/kg/dia – fracionado a cada 6 ou 12 horas`
      - `Cefalexina (500 mg/5 mL) - [v] a [v] mL VO de 6/6 horas. (Máx.: 5 mL/dose)\n\nou\n` (peso×0,0625 a peso×0,125)
      - `Cefalexina (500 mg/5 mL) - [v] a [v] mL VO de 8/8 horas (45/6,4 mg/kg/dia) (Máx.: 20 mL/dose)\n\n` (peso×0,125 a peso×0,25)
    - `Para infecções graves:\nDose usual: 75 a 100 mg/kg/dia – fracionado a cada 6 ou 8 horas`
      - `Cefalexina (500 mg/5 mL) - [v] a [v] mL VO de 6/6 horas. (Máx.: 10 mL/dose)\n\nou\n` (peso×0,1875 a peso×0,25)
      - `Cefalexina (500 mg/5 mL) - [v] a [v] mL VO de 8/8 horas. (Máx.: 13 mL/dose)` (peso×0,25 a peso×0,33)
- **Cuidados:**
  - `- Para mais detalhes acesse a bula.`
- **FLAG:** na opção `1`, o texto da 2ª faixa traz `(45/6,4 mg/kg/dia)` (parece resíduo copiado de amoxicilina-clavulanato) — transcrito verbatim, possível inconsistência de conteúdo no app.

---

## H2. Cefepima

### H3. Cefepima — `/pediatra/antibioticos/cefepima`

- **Input do usuário:**
  - Campo **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`).
  - **Select de apresentação** (`Escolha:`, dropdown `j_`, opções id `0`/(default)):
    - id `0` = Cefepima 1.000 mg (reconstituir em 10 mL → 11,4 mL)
    - default = Cefepima 2.000 mg (reconstituir em 10 mL → 11,4 mL)
- **Cálculos:** dose mg = `50*peso` (50 mg/kg/dose); volume 1000 mg = `dose*11.4/1000` mL; volume 2000 mg = `dose*11.4/2000` mL; diluente fixo = `50` mL.
- **Prescrição (por opção):**
  - **Opção `0` (1.000 mg):**
    - `Infecções não causadas por Pseudomonas; infecções do trato urinário e pneumonia (exceto se causada por Pseudomonas).\n\nDose usual 50 mg/kg/dose dividida a cada 12 horas`
      - `Cefepima (1.000 mg) - Reconstituir cada frasco-ampola em 10 mL de diluente. Após expansão a solução terá 11,4 mL.\n\nAspirar [v] mL ([mg] mg) e diluir em 50 mL de SF 0,9%, e fazer EV em 30 minutos, de 12/12 horas.`
    - `Infecções causadas por Pseudomonas; exacerbação aguda de fibrose cística; neutropenia febril; meningite\n\nDose usual 50 mg/kg/dose dividida a cada 8 horas`
      - `Cefepima (1.000 mg) - Reconstituir cada frasco-ampola em 10 mL de diluente. Após expansão a solução terá 11,4 mL\n\nAspirar [v] mL ([mg] mg) e diluir em 50 mL de SF 0,9%, e fazer EV em 30 minutos, de 8/8 horas.`
  - **Opção default (2.000 mg):** mesmas duas indicações, com `Cefepima (2.000 mg) - Reconstituir cada frasco-ampola em 10 mL de diluente. Após expansão a solução terá 11,4 mL\n\nAspirar [v] mL ([mg] mg) e diluir em 50 mL...` (12/12 e 8/8 horas).
- **Cuidados:**
  - `- Dose máxima EV: 2 g/dose`
  - `- Doses não indicadas para período neonatal.`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Ceftriaxone

### H3. Ceftriaxone — `/pediatra/antibioticos/ceftriaxone`

- **Input do usuário:** campo único **Peso** — placeholder `0.0`, 2 casas decimais (`new A.bz(2,!1,!0)`). Sem dropdown.
- **Bloco Dose usual:** `50 a 100 mg/kg/dia - EV/IM`
- **Bloco Endovenoso:**
  - `Ceftriaxona: 50 a 100 mg/kg, EV, 1 vez ao dia, por 3 a 5 dias.\n\nCeftriaxona (pó – 500 mg ou 1000 mg).\nCada ampola de 500mg deve ser reconstituída em 5 mL de Água para injetáveis.\nCada ampola de 1000 mg deve ser reconstituída em 10 mL de Água para injetáveis.\n\nAspirar [v] mL (50 mg/kg) a [v] mL ([peso] mg... ) mL (100 mg/kg) e diluir em 30 mL SF 0,9%. Infundir EV em 30 minutos, 24/24h. \nFazer em 60 minutos se RN.`
    - (v EV = peso×0,5 a peso×1,0; template literal: `Aspirar ` + `[peso*0.5] mL (50 mg/kg) a [peso] mL` + ` mL (100 mg/kg) e diluir em 30 mL SF 0,9%` + `. Infundir EV em 30 minutos, 24/24h. \nFazer em 60 minutos se RN.`)
- **Bloco Intramuscular:**
  - `Ceftriaxona (pó – 500 mg ou 1000 mg).\nCada ampola de 500 mg deve ser reconstituída em 2 mL de diluente. \nCada ampola de 1000 mg deve ser reconstituída em 3,5 mL de diluente.\n\nFazer [v] mL (50 mg/kg) a [v] mL (100 mg/kg) IM (via alternativa até hospitalização), 24/24h.`
    - (v IM = peso×0,2 a peso×0,4)
- **Cuidados:**
  - `- A dose pode ser fracionada a cada 12 a 24 horas.`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Cefuroxima

### H3. Cefuroxima — `/pediatra/antibioticos/cefuroxima`

- **Input do usuário:** campo único **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`). Sem dropdown.
- **Apresentação:** `Pó para solução injetável: 750 mg`
- **Bloco Prescrição** (3 indicações, cada uma com Uso intramuscular + Uso endovenoso):
  - `Dose usual 100 a 150 mg/kg/dia dividido em doses a cada 8 horas`
    - `Uso intramuscular` → `Cefuroxima (750 mg) - Reconstituir cada frasco-ampola em 3 mL de diluente. Após expansão a solução terá 3,5 mL\n\nAspirar [v] mL ([mg] mg) a [v] mL ([mg] mg) e fazer IM - 8/8 horas.`
    - `Uso endovenoso` → `Cefuroxima (750 mg) - Reconstituir cada frasco-ampola em 8 mL de diluente. Após expansão a solução terá 8,6 mL\n\nAspirar [v] mL ([mg] mg) a [v] mL ([mg] mg) e diluir em 50 mL de SF 0,9%, e fazer EV em 30 minutos, de 8/8 horas.`
  - `Pneumonia bacteriana\n105 a 150 mg/kg/dia dividido em doses a cada 8 horas` (IM + EV, mesmos templates de reconstituição)
  - `Infecções intra-abdominais ou osteoarticular em ≥ 3 meses\n150 a 200 mg/kg/dia dividido em doses a cada 6 ou 8 horas` (IM + EV)
- **Cálculos (controller `mS`, `a` = peso):**
  - IM: mg = `33.33*peso` (100 mg/kg/dia ÷ 3), `50*peso` (150), `35*peso` (105), `66.67*peso` (200); mL = `mg*3.5/750`.
  - EV: mesmos mg; mL = `mg*8.6/750`.
- **Cuidados:**
  - `- Dose máxima EV: 6 g/dia`
  - `- Doses não indicadas para período neonatal.`
  - `- Para mais detalhes acesse a bula.`

---

## H2. Claritromicina

### H3. Claritromicina — `/pediatra/antibioticos/claritromicina`

- **Input do usuário:**
  - Campo **Peso** — placeholder `Informe o valor`, sufixo `kg`, 1 casa decimal (`B.L`).
  - **Select de apresentação** (radio em sheet, 3 opções; rótulo = apresentação):
    - `Pó para solução injetável: 500 mg` (id `B.Eh` — uso EV)
    - `Granulado para suspensão oral: 25 mg/mL` (id `B.Ei`)
    - `Granulado para suspensão oral: 50 mg/mL` (id `B.Ej`)
- **Prescrição — Opção `B.Eh` (500 mg injetável):**
  - `Uso EV não indicado para menores de 18 anos.`
- **Prescrição — Opção `B.Ei` (25 mg/mL) e `B.Ej` (50 mg/mL):** mesma lista de indicações; só muda o fator de volume (25 mg/mL: 0,3*peso; 50 mg/mL: 0,15*peso). `i` = peso.
  - `Dose usual: 7,5 mg/kg de 12/12 horas` → `(Máx.: 500 mg/dose).`
  - `Estreptococos do Grupo A (≥ 6 meses de idade)` / `Dose usual ≥ 6 meses: 7,5 mg/kg de 12/12 horas, por 10 dias` → `Claritromicina – [v] mL [7.5*i] mg , via oral, de 12/12 horas, por 10 dias.` (25 mg/mL: v=0,3*i; 50 mg/mL: v=0,15*i, com `(Máx.: 5 mL/dose – 250 mg).` na opção 50 mg/mL)
  - `Otite Média (≥ 6 meses de idade)` / `Dose usual: 7,5 mg/kg de 12/12 horas, por 10 dias` → `... , via oral, de 12/12 horas, por 10 dias.`
  - `Coqueluche` / `Dose usual: 7,5 mg/kg de 12/12 horas, por 7 dias` → `Claritromicina – [v] mL [7.5*i] mg , via oral, de 12/12 horas, por 7 dias.`
  - `Pneumonia Atípica (> 3 meses de idade)` / `Dose usual: 7,5 mg/kg de 12/12 horas, por 10 dias` → 10 dias.
  - `Doença de Lyme (2ª linha)` / `Dose usual: 7,5 mg/kg de 12/12 horas, por 14 a 21 dias` → `... , via oral, de 12/12 horas, por 14 a 21 dias.`
  - `H. Pylori` / `Dose usual: 7,5-10 mg/kg de 12/12 horas, por 14 dias` → `Claritromicina – [7.5mg/kg vol] mL [7.5*i] mg a [10mg/kg vol] mL [10*i] mg , via oral, de 12/12 horas, por 14 dias.` (25 mg/mL: 0,3*i a 0,4*i; 50 mg/mL: 0,15*i a 0,2*i)
  - `Profilaxia Pré-Procedimento (endocardite/peritonite)` / `Dose usual: 15 mg/kg 30-60 minutos antes do procedimento` → `Claritromicina – [v] mL [15*i] mg , via oral, 30 a 60 minutos antes do procedimento.` (25 mg/mL: v=0,6*i; 50 mg/mL: v=0,3*i)
  - `Infecção por Mycobacterium avium Complex (MAC)`:
    - `Profilaxia primária e secundária` · `Dose usual: 7,5 mg/kg de 12/12 horas` → `Claritromicina – [v] mL [7.5*i] mg , via oral, de 12/12 horas.`
    - `Tratamento combinado (mínimo 12 meses)` · `Dose usual: 7,5-15 mg/kg de 12/12 horas` → `Claritromicina – [v] mL [7.5*i] mg a [v] mL [15*i] mg , via oral, de 12/12 horas, por 14 dias.`
- **Cuidados:** *(bloco `Cuidados` referenciado como `B.bHM` — conteúdo não desdobrado nesta janela; FLAG para extração futura.)*

---

## Notas gerais de extração / FLAGS

- **Origem:** todos os textos acima foram transcritos verbatim do bundle `main.decoded.js` (Flutter compilado). Doses, concentrações, marcas e frequências estão exatamente como no app.
- **Sem marcas (R) nesta seção:** nenhuma das 14 telas A-C usa nome comercial/marca registrada — todas usam o princípio ativo genérico.
- **`[valor calculado]`** representa números que o app calcula a partir do Peso (e, em algumas telas, da seleção de apresentação/concentração). Os fatores numéricos (ex.: peso×0,267) foram extraídos dos getters do controller e estão anotados onde disponíveis.
- **Telas com Select:** Amicacina, Amoxicilina+Clavulanato, Amoxicilina+Sulbactam, Ampicilina, Ampicilina+Sulbactam, Azitromicina, Cefalexina, Cefepima, Claritromicina. As demais (Acetilcefuroxima, Albendazol, Amoxicilina, Ceftriaxone, Cefuroxima) têm só o campo Peso.
- **FLAG — rótulos de dropdown:** os rótulos curtos exibidos nas opções dos Selects derivam das strings de apresentação; não há um conjunto separado de "labels" no bundle. Documentei cada opção pela sua apresentação/semântica e pelo id interno (`0/1/2` ou `B.Ec/Ed/Ee` etc.).
- **FLAG — Cuidados de Azitromicina (`B.bDB`) e Claritromicina (`B.bHM`):** referenciados por constante; o texto completo está em outra região do bundle e não foi desdobrado nesta passagem. Recomenda-se extração dedicada se o conteúdo de "Cuidados" dessas duas telas for necessário.
- **FLAG — inconsistência Cefalexina opção 500 mg/5 mL:** o app exibe `(45/6,4 mg/kg/dia)` numa linha de cefalexina, texto aparentemente herdado de amoxicilina-clavulanato. Transcrito verbatim.
- **FLAG — Amicacina / Ampicilina+Sulbactam:** as tabelas de prescrição são muito extensas; todos os cabeçalhos de dose, frequências, diluições e concentrações estão verbatim, mas alguns volumes/mg individuais por gatilho permanecem como `[valor calculado]` (fatores não 100% desdobrados por linha).
