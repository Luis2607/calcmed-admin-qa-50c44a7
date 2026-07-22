# Pediatria AS-IS — Urgências: PCR + Intubação + Ventilação Mecânica

> **Fonte:** `_source/main.decoded.js` (bundle Flutter compilado, decodificado). Conteúdo clínico transcrito **verbatim**. Valores que dependem do peso/idade/altura aparecem como **[valor calculado]** com o template literal documentado. Quaisquer pontos ambíguos estão marcados com **⚠️ FLAG**.
>
> **Localização no bundle:**
> - Roteamento das telas pediátricas: linha 351863–351907 (offset ~10743970–10755753).
> - PCR (drogas + carga): offset ~5453000–5460000.
> - Intubação (sequência rápida, TET, manutenção): offset ~5343000–5358500.
> - Ventilação Mecânica: offset ~5516500–5525500.
> - Tabela de strings (i18n PT): offset ~10303158.

---

## Visão geral do roteamento

As três telas vivem dentro do **Modo Pediatria** (cérebro/categoria `pediatra`). Rotas canônicas:

| Tela | Rota | Builder | Ícone |
|---|---|---|---|
| PCR | `/pediatra/pcr` | `eOS` (`fwG`) | `assets/icons/categories/pcr.svg` |
| Intubação | `/pediatra/intubacao` (label interno "Intubação ", id `intubacao-pediatria`) | `eOF` (`fwt`) | `assets/icons/categories/medtool.svg` |
| Ventilação Mecânica | `/pediatra/ventilacao-mecanica` (label "Ventilação Mecânica ", id `ventilacaomecanica`) | `eOU` (`fwI`) | (ícone `B.wK`) |

> **⚠️ FLAG (PCR algoritmo/cronômetro):** O **algoritmo de PCR / ciclos / cronômetro / ritmos chocáveis** NÃO está embutido no bundle como conteúdo estático pediátrico. Os ritmos e o estado da sessão de PCR vêm de **API remota**:
> - `GET https://webservice-calcmed-blond.vercel.app/api/pcr/{param}` (busca de "pacientes"/procedimentos);
> - chave local `pcr_rhythms` (busca de ritmos), `pcr_session_state`, `pcr_session_timestamp`, `pcr_mode`.
> Esse é o **"Modo PCR"** (feature de cronômetros inteligentes / ciclos / 5H-5T / metrônomo), que é uma ferramenta separada e majoritariamente compartilhada com o adulto (ACLS|AHA). Os textos do Modo PCR aparecem na tabela de strings (transcritos na seção final deste doc). A tela `/pediatra/pcr` documentada abaixo é a **calculadora de Cargas e Doses pediátricas** (5 abas), não o cronômetro.

---

# PCR (Cargas e Doses Pediátricas)

**Rota:** `/pediatra/pcr`
**Sub-rotas (abas):**
- `/pediatra/pcr/adrenalina` (id `pcr_0`)
- `/pediatra/pcr/amiodarona` (id `pcr_1`)
- `/pediatra/pcr/lidocaina` (id `pcr_2`)
- `/pediatra/pcr/sulfato-magnesio` (id `pcr_3`)
- `/pediatra/pcr/carga-choque` — label "Carga do choque para desfibrilação" (id `pcr_4`)

### Estrutura da tela
- **Header (AppBar):** "Urgências".
- **Input único compartilhado por todas as abas:** campo numérico **"Peso"**, sufixo **"kg"**, 2 casas decimais, aceita vírgula (convertida para ponto). Controller: `_CategoryPediatraPCRControllerBase.peso`.
- **Navegação:** abas/tabs horizontais ("Adrenalina", "Amiodarona", "Lidocaína", "Sulfato de Magnésio", "Carga do choque para desfibrilação"). Cada aba renderiza um widget de resultado.
- **Empty state:** enquanto o peso não é informado (peso = 0), as doses em mL aparecem como `0.0`/`0` (os campos calculados retornam 0). Não há frase de empty state dedicada nesta tela — o cálculo simplesmente exibe 0 até o peso ser digitado.

### Mapeamento aba → widget (verbatim do builder)
```
case "pcr_0": Adrenalina        (widget aeR)
case "pcr_1": Amiodarona        (widget aeS)
case "pcr_2": Lidocaína         (widget aeU)
case "pcr_3": Sulfato de Magnésio (widget aeV)
case "pcr_4": Carga do choque   (widget aeT)
```

---

## Adrenalina

**Dose usual (texto exibido):**
> **Adrenalina: 0,01 mg/kg**

**Prescrição (template literal):**
> ` EV/IO.`
> `Repetir a cada 3 a 5 minutos`
> ``
> `- Realizar bolus, seguido de flush com 5-10 mL SF 0,9%.`
>
> Valor calculado em mL: **[valor calculado]** mL — `B.e.t(peso*0.1, 1) mL` (1 casa decimal).

**Fórmula do volume:** `peso * 0,1`, **limitado a 10 mL** (`peso010Limited10`: se `> 10 → 10`).

---

## Amiodarona

**Dose usual (texto exibido):**
> **Amiodarona: 5 mg/kg**

**Prescrição (template literal):**
> Linha de cabeçalho do cálculo: `Amiodarona (150 mg/3 mL) – Fazer ` **[valor calculado]** ` mL`
> ` EV/IO.`
> `Repetir até 2 vezes para FV/TV sem pulso refratária.`
> ``
> `- Realizar bolus, seguido de flush com 5-10 mL SF 0,9%.`

**Fórmula do volume:** `peso * 0,1`, **limitado a 6 mL** (`peso01Limited6`: se `> 6 → 6`); 1 casa decimal.

> **Apresentação:** Amiodarona **150 mg/3 mL** (= 50 mg/mL).

---

## Lidocaína

**Dose inicial (texto exibido):**
> **Dose inicial: 1 mg/kg**

**Prescrição da dose inicial (template literal):**
> `Lidocaína (20 mg/mL) – Fazer ` **[valor calculado]** ` mL`
> ` EV/IO.`
> `Repetir dose inicial se a manutenção for iniciada mais de 15 minutos após bolus inicial.`

**Fórmula dose inicial (mL):** `peso * 0,05` (`peso005`); 1 casa decimal.

**Dose de manutenção (texto exibido):**
> **Dose de manutenção: 20 a 50 mcg/kg/min**

**Prescrição da manutenção (template literal):**
> `Lidocaína (20 mg/mL) 10 mL + 40 mL SG 5% (4 mg/mL)- Infundir EV em BI de ` **[valor calculado]** ` mL/h (20 mcg/kg/min) a ` **[valor calculado]** ` mL/h (50 mcg/kg/min).`
> ``
> `- Realizar bolus, seguido de flush com 5-10 mL SF 0,9%.`

**Fórmulas da manutenção:**
- 20 mcg/kg/min → `peso * 0,3` mL/h (`peso003`), 1 casa.
- 50 mcg/kg/min → `peso * 0,75` mL/h (`peso075`), 1 casa.

> **Apresentação:** Lidocaína **20 mg/mL**.

---

## Sulfato de Magnésio

**Dose usual (texto exibido):**
> **Sulfato de Magnésio: 25 a 50 mg/kg**

**Prescrição (dois blocos, templates literais):**

Bloco 1:
> `Sulfato de Magnésio 10% (100 mg/mL) - Fazer ` **[valor calculado]** ` a ` **[valor calculado]** ` mL`
> ` EV/IO em bolus.`

Bloco 2:
> `Sulfato de Magnésio 50% - 10 mL + SG 5% 40 mL (100 mg/mL) - Fazer ` **[valor calculado]** ` a ` **[valor calculado]** ` mL`
> ` EV/IO em bolus.`
> ``
> ``
> `- Indicado para tratamento de Torsades de Pointes`
> ``
> `- Realizar em bolus de alguns minutos na PCR.`

**Fórmulas (faixa):**
- mínimo (25 mg/kg) → `peso * 0,25` mL, **limitado a 20 mL** (`peso025Limited20`), 1 casa.
- máximo (50 mg/kg) → `peso * 0,5` mL, **limitado a 20 mL** (`peso05Limited20`), 1 casa.

> **Apresentações citadas:** Sulfato de Magnésio **10% (100 mg/mL)** e **50%** (10 mL diluído em 40 mL SG 5% → 100 mg/mL).

---

## Carga do choque para desfibrilação

**Texto exibido (3 linhas, templates literais):**
> `Primeiro choque: 2 J/kg -> ` **[valor calculado]** ` J`
> `Segundo choque: 4 J/kg -> ` **[valor calculado]** ` J`
> `Choques subsequentes:`
> `≥ 4 J/kg -> ≥ ` **[valor calculado]** ` J`
> `(Máximo de 10 J/kg ou carga para adulto)`

**Fórmulas:**
- Primeiro choque → `peso * 2` J (`peso2`), 0 casas decimais.
- Segundo choque e subsequentes → `peso * 4` J (`peso4`), 0 casas decimais.

> ⚠️ Os valores em Joules são exibidos **sem cap explícito** no código de cálculo (o cap de "10 J/kg ou carga para adulto" é apenas texto informativo).

---

# Intubação (Pediátrica)

**Rota:** `/pediatra/intubacao`
**Builder:** `eOF` (`fwt`). 5 abas/steps:

| Step (id) | Título |
|---|---|
| `1` | **Sequência Rápida** |
| `2` | **Tamanho do Tubo Endotraqueal (TET)** |
| `5` | **Profundidade do TET** |
| `3` | **Manutenção - Por Volume** |
| `4` | **Manutenção - Por Vazão** |

> O step "Sequência Rápida" tem um campo de referência ("Informe o medicamento") com 2 opções de medicamento na lista de referência (códigos `u.Q`=50 e `u.lC`=20). Há também um campo **"Peso"** (kg) compartilhado para os cálculos de dose.

---

## Step 1 — Sequência Rápida

Estrutura em 3 grupos: **Pré-medicação**, **Sedação**, **Bloqueador Neuromuscular**. Vários itens são separados pelo conectivo **"OU"**.

### Pré-medicação

#### Atropina
- **Apresentações (dropdown / Select):**
  - "0,25 mg/mL" (`atropina025MgMl`)
  - "0,50 mg/mL" (`atropina050MgMl`)
- **Dose usual:** **Dose usual: 0,02 mg/kg**
- (Cálculo de mL depende da apresentação selecionada — `[valor calculado]`.)

**OU**

#### Lidocaína 2%
- **Dose usual:** **Dose usual: 1 a 1,5 mg/kg**
- **Prescrição (template literal):**
  > `5 mL de Lidocaína + 5 mL de SF 0,9% (10 mg/mL) -`
  > `Faça ` **[valor calculado]** ` mL a ` **[valor calculado]** ` mL ` ` EV em bolus.`
  > ``
  > `Nota:`
  > `-Pode ser usado em pacientes com suspeita de aumento da pressão intracraniana`
- **Apresentação:** "(20 mg/mL - Ampola 5 mL e 20 mL)".
- **Fórmulas:** `peso * 0,1` mL a `peso * 0,15` mL (1 casa).

**OU**

#### Fentanil
- **Dose usual:** **Dose usual: 1 mcg/kg/dose em 3-5 minutos.**
- **Prescrição (condicional por peso, templates literais):**
  - Se `peso <= 50`: `1 mL de Fentanil + 4 mL de SF 0,9% (ou SG 5%) (10 mcg/mL) –` `Faça ` **[valor calculado]** ` mL EV em bolus de 3 minutos.`
  - Se `peso > 50`: `2 mL de Fentanil + 8 mL de SF 0,9% (ou SG 5%) (10 mcg/mL) –` `Faça ` **[valor calculado]** ` mL EV em bolus de 3 minutos.`
- **Fórmula:** `peso * 0,1` (2 casas) em ambos os casos. (Diferença está só na diluição/concentração final.)

### Sedação

#### Midazolam
- **Dose usual:** **Dose usual 0,1 a 0,3 mg/kg**
- **Apresentações (dropdown):**
  - "5 mg/ 5 mL" (`controller_midazolam_5_mg_5_ml`)
  - "15 mg/ 3 mL" (`controller_midazolam_15_mg_3_ml`)
  - "25 mg/ 5 mL" (`controller_midazolam_25_mg_5_ml`)
  - "50 mg/ 10 mL" (`controller_midazolam_50_mg_10_ml`)
- **Faixa de cálculo:** `peso*0,1` a `peso*0,3`, em mL conforme a concentração selecionada — **[valor calculado]** ` mL a ` **[valor calculado]** ` mL`.

**OU**

#### Propofol
- **Dose usual:** **Dose usual: 1 a 1,5 mg/kg**
- **Apresentação:** "(10 mg/mL - Ampola com 20, 50 e 100 mL)".
- **Prescrição (template literal):**
  > `Propofol 10 mg/mL –`
  > `Faça ` **[valor calculado]** ` mL a ` **[valor calculado]** ` mL ` `EV em bolus lento.`
- **Fórmulas:** `peso*0,1` a `peso*0,15` mL.

**OU**

#### Etomidato
- **Dose usual:** **Dose usual 0,3 mg/kg**
- **Apresentação:** "Etomidato 2 mg/mL" "(Ampola com 10 mL)".
- **Prescrição:** `Faça ` **[valor calculado]** ` mL`.
- **Fórmula:** `peso * 0,3 / 2` mL, **limitado a 10 mL** (se `> 10 → 10`), 1 casa.

**OU**

#### Quetamina
- **Dose usual:** **Dose usual 1 a 2 mg/kg**
- **Apresentação:** "Quetamina 50 mg/mL" "(Ampola com 10 mL)".
- **Prescrição:** `Faça ` **[valor calculado]** ` mL a ` **[valor calculado]** ` mL ` `EV em bolus por pelo menos 1 minuto.`
- **Fórmulas:** `peso / 50` mL a `peso * 2 / 50` mL.

**OU**

#### Tiopental
- **Dose usual:** **Dose usual 3 a 5 mg/kg**
- **Apresentação:** "(0,5 g e 1 g - pó)".
- **Prescrição (template literal):**
  > `Faça Tiopental 1 g + 40 mL SF 0,9% - Fazer ` **[valor calculado]** ` (3 mg/kg) a ` **[valor calculado]** ` mL (5 mg/kg)` ` EV em bolus de 20 segundos.`
- **Fórmulas:** `peso * 0,12` mL (3 mg/kg) **limitado a 20 mL**; `peso * 0,2` mL (5 mg/kg) **limitado a 20 mL**; 1 casa.

### Bloqueador Neuromuscular

#### Succinilcolina (Suxametônio)
- **Apresentação/pó:** "Succinilcolina (Suxametônio 100 mg - pó)".
- **Dose usual:** **Dose usual 1 a 1,5 mg/kg** (label genérico "Dose usual:").
- **Apresentações por idade (dropdown):**
  - "≤ 2 anos: 2 mg/kg" (`succinilcolina2Anos`, fator 100)
  - "> 2 anos: 1 a 1,5 mg/kg" (`succinilcolinaMaior2Anos`, fator 500)
- **Prescrição (template literal, conforme apresentação):**
  > `Diluir cada frasco de succinilcolina ` **[valor]** ` mg em ` **[valor]** ` mL de AD/SF 0,9%.`
  > `Fazer ` **[valor calculado]** ` mL a ` **[valor calculado]** ` mL da solução em bolus`
  >
  > Variante (do bloco de pré-medicação): `Succinilcolina 100 mg + 10 mL AD/SF 0,9% (10 mg/mL) -` `Faça ` **[valor calculado]** ` mL a ` **[valor calculado]** ` mL EV em bolus.`
- **Fórmula (variante 10 mg/mL):** `peso*0,1` a `peso*0,15` mL.

**OU**

#### Rocurônio
- **Dose usual:** **Dose usual: 1 mg/kg**
- **Apresentação:** "(10 mg/mL – Ampola com 5 mL)".
- **Prescrição:** `Faça `/`Fazer ` **[valor calculado]** ` mL`.
- **Fórmula:** `peso * 0,1` mL (1 casa).

**OU**

#### Vecurônio
- **Dose usual:** **Dose usual:** (label) + faixa "0,1 a 0,2 mg/kg" (do texto de manutenção); apresentação por idade.
- **Apresentação/pó:** "(Frasco 4 mg e 10 mg – pó)".
- **Apresentações por idade (dropdown):**
  - "> 7 semanas e < 5 meses: 0,01 a 0,02 mg/kg até obter resposta" (`vecuronio7Semanas5Meses`, fator 100)
  - "≥ 5 meses: 0,08 a 0,1 mg/kg" (`vecuronioMaior5Meses`, fator 500)
- **Prescrição (template literal):**
  > `Reconstituir cada frasco de Vecurônio (` **[valor]** ` mg) em 1 mL de AD.`
  > `Diluir em ` **[valor]** ` mL de SF 0,9%. Fazer bolus de ` **[valor calculado]** ` mL a ` **[valor calculado]** ` mL EV.`
  > (Variante: "Aspirar 1 mL e reconstituir em 9 mL de AD/SF 0,9%.")

> **⚠️ FLAG:** Os textos de Succinilcolina e Vecurônio têm dois conjuntos de strings (um no bloco "Sequência Rápida" da intubação e outro reaproveitado em "manutenção"/sedação contínua). Os valores numéricos `[valor]`/`[valor calculado]` dependem da apresentação selecionada no dropdown e do peso. Documentados acima os templates literais; conferir no app os números exatos por seleção.

---

## Step 2 — Tamanho do Tubo Endotraqueal (TET)

- **Input:** campo **"Idade"**, sufixo **"anos"** (faixa indicada: "1 a 8 anos"), inteiro.
- **Resultado (exibido quando idade > 0):**
  > **Sem cuff: TOT n°** **[valor calculado]** ` mm`
  > **Com cuff: TOT n°** **[valor calculado]** ` mm`
  >
  > **< 1 ano**
  > `Se menor que 1 ano e maior que 3,5 kg: ` **TOT n° 3 com cuff ou 3,5 sem cuff**
  >
  > **Notas:**
  > `- A pressão habitual de insuflação do cuff deve ser < 20 a 25 cm H₂O`
  > `- Estima-se com:`
  > `TOT sem cuff = (idade em anos/4) + 4`
  > `TOT com cuff = (idade em anos/4) + 3,5`

- **Fórmulas (com arredondamento para 0,0 / 0,5 mm):**
  - Sem cuff: `idade/4 + 4` → arredonda para baixo até.0 ou.5.
  - Com cuff: `idade/4 + 3,5` → arredonda para baixo até.0 ou.5.

---

## Step 5 — Profundidade do TET

Três métodos (cada um com seu próprio input). Label de resultado: "Resultado: ".

### Fórmula pelo Tubo
- **Input:** "Diâmetro interno do tubo", sufixo **"mm"** (1 casa).
- **Resultado:** `diâmetro * 3` cm → **[valor calculado]** ` cm` (2 casas).

### Fórmula pela Altura
- **Input:** "Altura da criança", sufixo **"cm"** (2 casas).
- **Resultado:** `(altura / 10) + 5` cm → **[valor calculado]** ` cm`.

### Fórmula pelo Peso
- **Input:** "Peso da criança", sufixo **"kg"** (2 casas).
- **Resultado:** `peso + 6` cm → **[valor calculado]** ` cm` (0 casas).

---

## Step 3 / Step 4 — Manutenção (Por Volume / Por Vazão)

> Controllers: `_CategoryPediatraIntubacaoVazaoControllerBase.*` (peso + concentrações/vazões por droga). As telas de manutenção reusam o **mesmo conjunto de widgets de sedação/analgesia/BNM contínuos** (tabela de strings compartilhada). Grupos: **Analgesia**, **Sedação**, **Sedoanalgesia**, **Bloqueador neuromuscular**, "Soluções padrões".

Inputs/labels genéricos do montador de solução: "Defina a dose", "Informe o valor", "Informe a quantidade", "Nº de ampolas", "mL de soro", "Concentração", "Sugestões:", "Dose desejada:", "Vazão desejada:", "Volume em 24 horas:".

### Drogas de manutenção contínua (doses usuais — verbatim da tabela)
| Droga | Dose / observação |
|---|---|
| **Fentanil** | "Dose usual 0,7-10 mcg/kg/h" / "Dose usual: 1 – 3 mcg/kg/h" (analgesia) |
| **Midazolam** | "Dose usual: 0,01 a 0,1 mg/kg/h" |
| **Propofol** | "Dose usual: 1 a 4 mg/kg/h" |
| **Cetamina (Quetamina)** | "Dose de ataque: 0,5 – 2 mg/kg" / "Dose usual: 5 – 20 mcg/kg/min" |
| **Precedex® - Dexmedetomidina** | "Dose de ataque: 0,5 a 1 mcg/kg em 10 minutos" / "Dose usual: 0,2 a 2,5 mcg/kg/h" |
| **Morfina** | "Dose usual: 0,05 a 0,12 mg/kg/h" |
| **Rocurônio** | "Dose de ataque: 0,6 mg/kg" / "Dose inicial: 5 a 17 mcg/kg/min" |
| **Atracúrio** | "Dose de ataque: 0,3 a 0,6 mg/kg" / "Dose inicial: 5 a 12 mcg/kg/min" |

### Soluções padrões (verbatim — templates de diluição fixos)
- "Fentanil (50 mcg/mL) - 4 Ampolas + 210 mL SF 0,9% (Concentração: 8 mcg/mL)"
- "Fentanil (50 mcg/mL) - 4 Ampolas + 160 mL SF 0,9% (Concentração: 10 mcg/mL)"
- "Morfina (10 mg/mL) - 10 ampolas + 90 mL SG 5% (Concentração: 1 mg/mL)"
- "Precedex 100 mcg/mL - 2 Ampolas + 96 mL SF 0,9% (Concentração: 4 mcg/mL)"
- "Quetamina 50 mg/mL - 10 mL + 240 mL de SF 0,9% (Concentração: 2 mg/mL)"
- "Rocurônio 10 mg/mL - 5 ampolas com 5 mL + 225 mL SF 0,9% (Concentração: 1 mg/mL)"
- "Atracúrio 10 mg/mL - 2 ampolas com 5 mL + 90 mL SF 0,9% (Concentração: 1 mg/mL)"
- "Cisatracúrio 2 mg/mL - 5 Ampolas de 10 mL+ 150 mL de SF 0,9% (Concentração: 500 mcg/mL)"
- "Pancurônio 2 mg/mL - 10 Ampolas + 80 mL de SF 0,9% (Concentração: 400 mcg/mL)"
- "Vecurônio (10 mg) diluído em 1 mL de AD + 49 mL de SF 0,9% (Concentração: 200 mcg/mL)"

> **⚠️ FLAG:** As telas de Manutenção da intubação pediátrica compartilham largamente a base de strings com as Drogas Vasoativas/sedação contínua do adulto. As doses usuais acima são as strings encontradas no bloco compartilhado; tratá-las como conteúdo da manutenção pediátrica, mas confirmar quais drogas efetivamente aparecem nos steps 3/4 no app (a lista de tabs pediátrica de sedação é: Fentanil, Midazolam, Propofol, Cetamina, Precedex, Rocurônio — vide tabela de strings).

---

# Ventilação Mecânica (Pediátrica)

**Rota:** `/pediatra/ventilacao-mecanica`
**Builder:** `eOU`. Controller: `..VentilacaoMecanicaControllerBase`.

### Estrutura da tela
- **Header (AppBar):** "Urgências".
- **Input:** campo **"Peso"**, sufixo **"kg"**, 2 casas (aceita vírgula).
- **Dois toggles de modo** (expansíveis, mutuamente exclusivos):
  - **"Modo VCV - Volume Controlado"** (id `vcv`, modo interno `B.nt`)
  - **"Modo PCV - Pressão Controlada"** (id `pcv`, modo interno `B.aiy`)
- **Dropdown "Faixa Etária"** (precedido do label "Parametros Iniciais:") com 5 opções:
  1. **Neonatos Pré-termo** (`0`)
  2. **Neonatos a Termo** (`1`)
  3. **< 1 ano** (`2`)
  4. **1 a 12 anos** (`3`)
  5. **> 12 anos** (`4`)

### Empty state
> **"Preencha o peso acima e selecione a faixa etária para calcular os parâmetros"**

(Tela relacionada de peso predito/VC do adulto usa: "Preencha a altura acima para calcular o peso predito e volume corrente" — não é a pediátrica.)

### Resultados — VCV (Volume Controlado)
Título do bloco: **"Resultados da Ventilação VCV"**. Campos exibidos (label → valor):
- **Volume Corrente:** **[valor calculado]** ` a ` **[valor calculado]** ` mL` (ver fórmulas por faixa abaixo).
  - Para faixas pediátricas (< 1 ano / 1–12 / > 12) acrescenta:
    - `Pulmões saudáveis: 5 a 8 mL/kg = [5*peso] a [8*peso] mL`
    - `Ventilação protetora: 3 a 6 mL/kg = [3*peso] a [6*peso] mL`
- **Frequência Respiratória:** `X a Y irpm`
- **PEEP:** `X a Y cmH₂O`
- **Pressão de Suporte:** `Mínimo X a Y cmH₂O`
- **FiO₂:** (string por faixa, abaixo)
- **Tempo Inspiratório:** `X a Y s` (2 casas)
- **Relação I:E:** (string por faixa)

### Resultados — PCV (Pressão Controlada)
Título: **"Resultados da Ventilação PCV"**. Campos:
- **Pressão Inspiratória:** `X a Y cmH₂O`
- **Frequência Respiratória:** `X a Y irpm`
- **PEEP:** `X a Y cmH₂O`
- **Pressão de Suporte:** `Mínimo X a Y cmH₂O`
- **FiO₂:** (string por faixa)
- **Tempo Inspiratório:** `X a Y s`
- **Relação I:E:** (string por faixa)

---

### Tabela de parâmetros por Faixa Etária (TRANSCRIÇÃO EXATA)

Os parâmetros vêm do construtor `qN(VC_min, VC_max, FR_min, FR_max, PEEP_min, PEEP_max, PS_min, PS_max, FiO2, Tinsp_min, Tinsp_max, I:E, Pinsp_min, Pinsp_max)`. No modo **VCV** (`B.nt`), VC = `fator*peso` e Pressão Inspiratória não se aplica (null). No modo **PCV** (else), VC = null e Pressão Inspiratória = 20 a 25 cmH₂O (exceto neonatos, ver abaixo).

#### 1) Neonatos Pré-termo (`bzN`, case 0)
- **Volume Corrente (VCV):** `4 mL/kg a 6 mL/kg` (= `4*peso` a `6*peso` mL)
- **Frequência Respiratória:** **40 a 60 irpm**
- **PEEP:** **5 a 6 cmH₂O**
- **Pressão de Suporte:** Mínimo **6 a 10 cmH₂O**
- **FiO₂:** **"21–30%; ajustar conforme SO₂ alvo"**
- **Tempo Inspiratório:** **0,30 a 0,40 s**
- **Relação I:E:** **"1:2 a 1:3"**
- **Pressão Inspiratória (PCV):** **20 a 25 cmH₂O**

#### 2) Neonatos a Termo (`bzO`, case 1)
- **Volume Corrente (VCV):** `5 a 8 mL/kg`
- **Frequência Respiratória:** **30 a 50 irpm**
- **PEEP:** **5 a 6 cmH₂O**
- **Pressão de Suporte:** Mínimo **6 a 10 cmH₂O**
- **FiO₂:** **"21%; ajustar conforme SO₂ alvo"**
- **Tempo Inspiratório:** **0,35 a 0,40 s**
- **Relação I:E:** **"1:2 a 1:3"**
- **Pressão Inspiratória (PCV):** **20 a 25 cmH₂O**

#### 3) < 1 ano (`bzM`, case 2)
- **Volume Corrente (VCV):** `5 a 8 mL/kg`
- **Frequência Respiratória:** **20 a 30 irpm**
- **PEEP (VCV):** **3 a 8 cmH₂O** · **PEEP (PCV):** **3 a 7 cmH₂O**
- **Pressão de Suporte:** Mínimo **6 a 10 cmH₂O**
- **FiO₂:** **"Iniciar 100%, idealmente < 60%"**
- **Tempo Inspiratório:** **0,40 a 0,60 s**
- **Relação I:E:** **"1:2 a 1:3"**
- **Pressão Inspiratória (PCV):** **16 a 25 cmH₂O**

#### 4) 1 a 12 anos (`bzQ`, case 3)
- **Volume Corrente (VCV):** `5 a 8 mL/kg`
- **Frequência Respiratória:** **15 a 25 irpm**
- **PEEP (VCV):** **3 a 8 cmH₂O** · **PEEP (PCV):** **3 a 7 cmH₂O**
- **Pressão de Suporte:** Mínimo **6 a 10 cmH₂O**
- **FiO₂:** **"Iniciar 100%, idealmente < 60%"**
- **Tempo Inspiratório:** **0,70 a 0,90 s**
- **Relação I:E:** **"1:2 a 1:3"**
- **Pressão Inspiratória (PCV):** **16 a 25 cmH₂O**

#### 5) > 12 anos (`bzL`, case 4)
- **Volume Corrente (VCV):** `5 a 8 mL/kg`
- **Frequência Respiratória:** **12 a 20 irpm**
- **PEEP (VCV):** **3 a 8 cmH₂O** · **PEEP (PCV):** **3 a 7 cmH₂O**
- **Pressão de Suporte:** Mínimo **6 a 10 cmH₂O**
- **FiO₂:** **"Iniciar 100%, idealmente < 60%"**
- **Tempo Inspiratório:** **0,90 a 1,20 s**
- **Relação I:E:** **"1:2 a 1:3"**
- **Pressão Inspiratória (PCV):** **16 a 25 cmH₂O**

> **Nota sobre Volume Corrente / "Ventilação protetora":** as linhas "Pulmões saudáveis: 5 a 8 mL/kg" e "Ventilação protetora: 3 a 6 mL/kg" só são adicionadas para as faixas pediátricas (< 1 ano, 1–12, > 12 — constantes `B.Uz`/`B.UA`/`B.UB`), não para neonatos.

---

# APÊNDICE — Modo PCR (cronômetro/ACLS) — strings relacionadas a pediatria

> Estas strings pertencem ao **Modo PCR** (ferramenta de cronômetro/ciclos, em grande parte compartilhada com o adulto / ACLS|AHA). Incluídas aqui porque a aba "Cargas e Doses" / "Via Aérea" do Modo PCR referencia doses pediátricas. NÃO confundir com a calculadora `/pediatra/pcr` documentada acima.

**Abas do Modo PCR:** "PCR ACLS" · "Cargas e Doses" · "Via Aérea" · "Histórico PCR".
Sub-toggle de público: **"Adulto"** vs (pediátrico, com input "Peso" / "kg").

**Drogas listadas na aba Cargas e Doses (pediátrica):** "Adenosina", "Amiodarona", "Lidocaína", "Sulfato de Magnésio", "Desfibrilação".

**Mensagens de orientação do cronômetro (verbatim):**
- "Prepare o desfibrilador. Adulto: 200 J bifásico. Pediatria: consulte a carga."
- "Retome CPR imediatamente. NÃO cheque pulso agora."
- "Prepare Amiodarona 300mg para após o 3º choque. Pediatria: dose por peso."
- "Hora da Amiodarona. Adulto: 300 mg IV. Pediatria: dose por peso."
- "Nova dose de Amiodarona. Considere Sulfato de Magnésio se houver Torsades."
- "Investigue 5H/5T. Foco em Hipovolemia e Hipóxia."
- "Decúbito lateral. SatO2 90–98%. ECG urgente."

**Lidocaína (Modo PCR, doses por idade — verbatim):**
- "≤ 2 anos: 2 mg/kg"
- "> 2 anos: 1 a 1,5 mg/kg"
- Apresentações: "0,25 mg/mL" / "0,50 mg/mL"

**5H / 5T (verbatim):**
- 5H: "Hipóxia", "Hipovolemia", "Hidrogênio (Acidemia)", "Hipo/Hipercalemia", "Hipotermia"
- 5T: "Pneumotórax hipertensivo", "Tamponamento cardíaco", "Toxinas", "Trombose coronariana", "Trombose pulmonar"
- (Variante em outra string: "Tensão no Tórax (Pneumotórax)", "Tromboembolismo Pulmonar", "Trombose Coronariana (IAM)", "Tamponamento Cardíaco", "Toxinas"; "Hemorragia franca ou oculta (gastrointestinal, trauma recente), grande queimado, sepse, anafilaxia".)

---

# APÊNDICE — Cardioversão Sincronizada (Taquicardia Pediátrica) — fora do escopo PCR

> ⚠️ Não confundir com a "Carga do choque para desfibrilação" da PCR. Esta vive na categoria **Taquicardia** (`_CategoryPediatraTaquicardiaControllerBase`). Documentada aqui por completude.

### Adenosina (Taquicardia)
- **Primeira dose:** **0,1 mg/kg** — `Adenosina (3 mg/mL) - Fazer ` **[valor calculado]** ` mL` ` EV/IO.` · `Dose máxima primeira dose 6 mg`. Fórmula: `peso*0,033` mL, **limitado a 2 mL**.
- **Segunda dose:** **0,2 mg/kg (se necessário)** — mesmo template · `Dose máxima segunda dose 12 mg`. Fórmula: `peso*0,066` mL, **limitado a 4 mL**.
- Flush: "Realizar bolus, seguido de flush com 5-10 mL SF 0,9%."
- **Apresentação:** Adenosina **3 mg/mL**.

### Cargas para Cardioversão Sincronizada (Taquicardia)
- **Primeiro choque: 0,5 a 1 J/kg** — **[valor calculado]** ` a ` **[valor calculado]** ` J`. Fórmula: `peso*0,5` (limitado a 200) a `peso` (limitado a 200).
- **Segundo choque e subsequentes: 2 J/kg** — **[valor calculado]** ` J` `(Máximo de 10 J/kg ou carga para adulto)`. Fórmula: `peso*2`, limitado a 200.

---

## Notas de fidelidade / lacunas

1. **PCR algoritmo/cronômetro/ciclos:** servido por API remota (`/api/pcr/`) + storage local de ritmos/sessão — não é conteúdo estático pediátrico no bundle. A calculadora estática `/pediatra/pcr` cobre só Cargas e Doses (5 abas). **⚠️ FLAG.**
2. **Manutenção da intubação (steps 3/4):** strings em base compartilhada com sedação contínua/vasoativas — confirmar no app a lista exata de drogas das abas pediátricas.
3. Todos os valores em **mL/J/mm/cm** são derivados de peso/idade/altura e exibidos como `[valor calculado]`; fórmulas e fatores estão documentados verbatim.
4. Concentrações, apresentações, marcas (Precedex®) e faixas etárias transcritas exatamente como no bundle.
