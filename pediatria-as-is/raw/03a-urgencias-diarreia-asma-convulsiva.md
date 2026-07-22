# Pediatria AS-IS — Urgências: Diarreia + Asma + Crise Convulsiva

> Fonte de verdade: bundle `_source/main.decoded.js` (app CalcMed Flutter web). Conteúdo transcrito verbatim do bundle decodificado.
> Categoria do app: **Urgências** (Pediatria). As três telas abaixo são protocolos/fluxos multi-step com listas expansíveis (accordion) por conduta/droga.
> Convenções de transcrição:
> - `[valor calculado]` = lacuna preenchida em runtime a partir do peso (kg) / idade selecionada. O template literal ao redor é transcrito.
> - Doses, concentrações, apresentações, marcas (®), faixas etárias/peso = verbatim.
> - **FLAG** = ambiguidade/inconsistência encontrada no bundle (não suposição).
> - Empty state padrão dos cards de droga que dependem de peso: o texto exibido enquanto o peso é 0/vazio é **"Informe todos os dados para obter o resultado."** (constante `u.y`). Cada card de conduta abre fechado (accordion) e exige o peso digitado no topo da tela para calcular.

---

## Diarreia na Criança

### Rota e estrutura
- Rota: `/pediatra/diarreia-na-crianca` (registrada em `jW` → handler `czR` → tela `Pd` / state `b5b`).
- Título do AppBar: **"Urgências"**.
- Categoria registrada (menu): label **"Diarreia na Criança"**, ícone `assets/icons/categories/serum.svg`, slug `diarreianacrianca`.
- A tela é uma **lista de condutas expansíveis (accordion)**. Itens definidos em `eOR` (`fwF`), keys "0"–"4":
  - "0" → **Plano A – Prevenir desidratação** (widget `ael` / `baE`)
  - "1" → **Plano B – Tratar desidratação - via enteral** (widget `aem` / `baF`)
  - "2" → **Plano C – Tratar desidratação grave - endovenoso** (widget `aen` / `baG`)
  - "3" → **Antibióticos** (widget `aej` / `baC`)
  - "4" → **Antidiarreicos** (widget `aek` / `baD`)
- Mapeamento de keys → widgets no `eG` da tela: case "0"→`ael`, "1"→`aem`, "2"→`aen`, "3"→`aej`, "4"→`aek`.

> **FLAG (rótulo vs widget):** o item key "4" tem título **"Antidiarreicos"** na lista (`eOR`), e o widget correspondente (`baD`) exibe apenas o texto **"Não devem ser usados."**. (Conteúdo verbatim — é uma seção de orientação, não um cálculo.)

> Observação: o título e os textos de cada bloco têm cor/realce; os blocos "Plano A/B/C" têm um input de **Peso do paciente (kg)** próprio, pois calculam volumes a partir do peso. O bloco Antibióticos também tem input de Peso.

---

### Plano A – Prevenir desidratação (`ael` / `baE`)
Conteúdo (texto fixo, sem input de peso neste bloco específico — não há cálculo dependente de peso, apenas faixas por idade):

**1) Ingerir/Oferecer mais líquido que o habitual para prevenir desidratação:**

a. Líquidos ou sais de reidratação oral (SRO) após cada episódio de vômito ou evacuação diarreica.

Para cada evacuação diarreica oferecer/dar:
- Menores de 1 ano: 50 a 100 mL
- De 1 a 10 anos: 100 a 200 mL
- Maiores de 10 anos: quantidade que o paciente aceitar

**2) Alimentação habitual**

**3) Reavaliar criança se não houver melhora em 2 dias ou sinais de alarme:**

a. Piora da diarreia
b. Vômitos repetidos
c. Sangue nas fezes
d. Diminuição da diurese
e. Muita sede
f. Recusa alimentar

**4) Zinco:**
(lista de prescrição, por faixa — strings em `bq`/`az`):
- "meio comprimido" →... (texto `u.Cn` + complemento)
- "2,5 mL (10 mg - Zinco elementar)" — uma vez ao dia por 10 a 14 dias.
- "um comprimido" →...
- "5 mL (20 mg - Zinco elementar)" — uma vez ao dia por 10 a 14 dias.

> Estrutura literal dos itens de Zinco (rótulo dose única "uma vez ao dia por 10 a 14 dias."): meio comprimido / 2,5 mL (10 mg - Zinco elementar) / um comprimido / 5 mL (20 mg - Zinco elementar).

**Notas:**
- Sempre orientar a reconhecer sinais de desidratação e de alarme;
- Oriente o preparo e administração da SRO;
- Oriente medidas de higiene.

---

### Plano B – Tratar desidratação (via enteral) (`aem` / `baF`)
Input: **Peso do paciente (kg)** (campo "Peso do paciente", sufixo "kg", decimal).

**1) Administrar solução de reidratação oral (SRO):**

a. 50 a 100 mL/kg em 4-6 horas como orientação inicial:
SRO: Dar **`[peso × 50]` a `[peso × 100]` mL** VO em 4 a 6 horas.
- Template literal: `B.e.t(this.d*50,0)+" a "+B.e.t(this.d*100,0)+" mL"` → "VO em 4 a 6 horas."

b. O volume de solução ingerida dependerá da sede do paciente.

c. A SRO deve ser feita continuamente até que desapareçam os sinais de desidratação.

**2) Se persistir desidrato, indique Sonda Nasogástrica (gastróclise) para adequada hidratação.**

Se melhora da desidratação, seguir ao Plano A.

Se evoluir para desidratação grave, seguir ao Plano C.

**Notas:**
- Plano B deve ser realizado em estabelecimento de saúde;
- Os pacientes deverão permanecer na unidade de saúde até reidratação completa e reinício da alimentação;
- Se após 6 horas de tratamento, não houver melhora da desidratação, encaminhe o paciente ao hospital de referência para internação;
- Sempre orientar a reconhecer sinais de desidratação e de alarme;
- Oriente o preparo e administração da SRO;
- Oriente medidas de higiene.

---

### Plano C – Tratar desidratação grave (endovenoso) (`aen` / `baG`)
Inputs:
- **Peso do paciente (kg)** (campo "Peso do paciente", sufixo "kg").
- **Idade** — dropdown/select (label "Idade"). Opções implícitas: **"Menores de 1 ano"** (key `menor`) e **"Maiores de 1 ano"** (key `maior`). O conteúdo só aparece após selecionar a idade.

Cálculos do controller `_EquationPediatraDiarreiaPlanoCControllerBase` (a partir do peso):
- peso30 = peso × 30
- peso70 = peso × 70
- peso10 = peso × 10
- peso25 = peso × 25
- valueX (manutenção, parte 1) e valueY (parte 2): regra escalonada por peso:
  - se peso < 10: X = peso×100×0,8 ; Y = peso×100×0,2
  - se 10 ≤ peso < 20: X = (1000 + (peso−10)×50)×0,8 ; Y = (1000 + (peso−10)×50)×0,2
  - se peso ≥ 20: X = (1500 + (peso−20)×20)×0,8 ; Y = (1500 + (peso−20)×20)×0,2
  - Limites: X máx = 1600 ; Y máx = 400
- valueJ = floor((X+Y)/100) ; valueZ = J×2 ; valueW = (X+Y+Z)/24 ; valueW2 = (X+Y+Z)/72
- peso5024 = peso×50/24 ; peso5072 = peso×50/72

#### Fase de Expansão – Menores de 1 ano (quando idade = "menor")
- **`[peso × 30]` mL (30 mL/kg)** EV em 1 hora.
- **`[peso × 70]` mL (70 mL/kg)** EV em 5 horas.
- Observação: Se RN ou cardiopata grave, começar com **`[peso × 10]` mL (10 mL/kg)**.

#### Fase de Expansão – Maiores de 1 ano (quando idade = "maior")
- **`[peso × 30]` mL (30 mL/kg)** EV em 30 minutos.
- **`[peso × 70]` mL (70 mL/kg)** EV em 2 horas e 30 minutos.
- Observação: Se menores de 5 anos com cardiopatia grave, começar com **`[peso × 10]` mL (10 mL/kg)**.

#### Fase de Manutenção e Reposição (aparece após selecionar idade)
**3) Manutenção: SG 5% + SF 0,9% (proporção 4:1) + KCl 10% (2 mL para cada 100 mL de solução):**
- Soro Glicosado 5% **`[valueX]` mL**
- + Soro fisiológico 0,9% **`[valueY]` mL**
- + Cloreto de Potássio 10% **`[valueZ]` mL**
- – EV em 24 horas ( **`[valueW]` ** mL/h – **`[valueW2]` ** gotas/min).
- Template literal de cada componente: `valueX → " mL"`, `valueY → " mL"`, `valueZ (gaC_/ga2B) → " mL"`, vazão `valueW (gaC0)`, `valueW2 (gaC1)`.

**4) Reposição: SG 5% + SF 0,9% (proporção 1:1):**
- Soro Glicosado 5% **`[peso25]` mL**
- + Soro fisiológico 0,9% **`[peso25]` mL**
- – EV em 24 horas ( **`[peso5024]` ** mL/h – **`[peso5072]` ** gotas/min).

Reavaliar volume conforme as perdas do paciente.

**Notas:**
- Plano C deve ser realizado em estabelecimento de saúde/hospital;
- Iniciar reidratação via oral com SRO, quando paciente puder beber;
- Interromper reidratação endovenosa apenas quando o paciente puder ingerir SRO em quantidade adequada para manter-se hidratado;
- Manter paciente em observação por pelo menos 6 horas;
- Sempre orientar a reconhecer sinais de desidratação e de alarme;
- Oriente o preparo e administração da SRO;
- Oriente medidas de higiene.

---

### Antibióticos (na Diarreia) (`aej` / `baC`)
Input: **Peso do paciente (kg)** (campo "Peso do paciente", sufixo "kg").

Texto de cabeçalho: **"Apenas para casos de diarreia com sangue (disenteria) e comprometimento do estado geral ou em caso de cólera grave."**

Cálculos (controller `_EquationPediatraDiarreiaAntibioticosControllerBase`): peso05 = peso×0,5; peso02 = peso×0,2; peso04 = peso×0,4; peso025 = peso×0,25; peso035 = peso×0,35; peso0125 = peso×0,125; peso0175 = peso×0,175; peso30 = peso×30.

**a) Menores de 3 meses ou criança com imunodeficiência:**

**Endovenoso**
- **`[peso05]` mL (50 mg/kg) a `[peso]` mL** (template: `B.e.t(k.gtM,1)+" mL (50 mg/kg) a "+B.e.t(k.a,1)+" mL..."`)

**Intramuscular**
- **`[peso02]` a `[peso04]` mL (100 mg/kg)** (template: `" "+B.e.t(k.gEn,1)+" mL (50 mg/kg) a "+B.e.t(k.gHU,1)+" mL (100 mg/kg)"`)

**b) Crianças até 30 kg (até 10 anos):**

**Via oral**
- Azitromicina: 10 mg/kg/dia, via oral, no primeiro dia e 5 mg/kg/dia por mais 4 dias.
  Azitromicina (40 mg/mL) – Dar **`[peso025]` mL** VO, no primeiro dia e **`[peso0125]` mL** por mais 4 dias.
  (template: `" "+B.e.t(k.gqx,1)+" mL VO, no primeiro dia e "+B.e.t(k.gtL,1)+" mL..."`)

**Intramuscular**
- Ceftriaxona: 50 mg/kg, IM, 1 vez ao dia, por 3 a 5 dias (alternativa).
  Ceftriaxona (pó – 500 mg ou 1000 mg).
  Cada ampola de 500 mg deve ser reconstituída em 2 mL de diluente.
  Cada ampola de 1000 mg deve ser reconstituída em 3,5 mL de diluente.
  Fazer **`[peso02]` mL (50 mg/kg)** IM, 24/24h.

**c) Crianças com mais de 30 kg (mais de 10 anos):**

**Via oral**
- Ciprofloxacin: **1 comprimido de 500 mg** de 12/12 horas, via oral, por 3 dias.

**Intramuscular**
- Ceftriaxona: 50 a 100 mg/kg, IM, 1 vez ao dia, por 3 a 5 dias (alternativa).
  Ceftriaxona (pó – 500 mg ou 1000 mg).
  Cada ampola de 500 mg deve ser reconstituída em 2 mL de diluente.
  Cada ampola de 1000 mg deve ser reconstituída em 3,5 mL de diluente.
  Fazer **`[peso0175]` mL (50 mg/kg) a `[peso035]` mL (100 mg/kg)** IM, 24/24h.

---

### Antidiarreicos (na Diarreia) (`aek` / `baD`)
Conteúdo integral (texto único):
> **"Não devem ser usados."**

---

## Exacerbação de Asma

### Rota e estrutura
- Categoria registrada (menu): label **"Exacerbação de Asma"**, slug `crisedeasma`, rota base `/pediatra/crise-asma`.
- Rotas (router `aCh` / `jW`):
  - `/pediatra/crise-asma` → handler `bIH` → tela `Pa` / state `b59` (tela de **classificação de gravidade**).
  - `/pediatra/crise-asma/leve-moderada` → handler `bII` → tela `P9` / state `b58` (condutas Leve a Moderada).
  - `/pediatra/crise-asma/grave` → handler `bIJ` → tela `P8` / state `b57` (condutas Grave).

### Tela inicial / Classificação de gravidade (`Pa` / `b59`)
- Título do AppBar: **"Urgências"**.
- Mostra duas categorias (cards de navegação) — `staticCategories` definidas em `eVo`:
  1. **"Leve a Moderada"** (slug `crise-asma-leve-moderada`) → navega para `/pediatra/crise-asma/leve-moderada`.
  2. **"Grave"** (slug `crise-asma-grave`) → navega para `/pediatra/crise-asma/grave`.
- Cada categoria leva a uma tela com input de **Peso (kg)** + lista expansível de condutas.

> **FLAG:** No bundle decodificado a tela inicial de asma (`Pa`/`b59`) renderiza apenas os dois cards de navegação (`Dy(staticCategories)`). NÃO foi encontrado, nesta tela, um quadro textual com os critérios clínicos detalhados de "leve / moderada / grave" (FR, SatO₂, sibilância, etc.) — a "classificação" é a escolha entre os dois cards. Os subnós (`bH`) de cada categoria são as drogas/condutas, listadas abaixo.

---

### Asma — Leve a Moderada (`P9` / `b58`)
- Título do AppBar: **"Exacerbação de Asma"**.
- Input no topo: **Peso (kg)** (campo "Peso", sufixo "kg", decimal).
- Lista de condutas (subnós `bH` em `eVo`), keys:
  - `salbutamol_leve_moderada` → **Salbutamol** (widget `aeb`/`bat`)
  - `corticoide_vo_leve_moderada` → **Corticóide VO** (widget `ae8`/`bap` — Prednisolona)
  - `brometo_ipratropio_leve_moderada` → **Brometo de Ipratrópio** (widget `a0X`/`bao`)
  - `oxigenio_leve_moderada` → **Oxigênio** (widget `a0Y`/`bas`)
- Mapa `eG`: `salbutamol_leve_moderada`→`aeb`, `corticoide_vo_leve_moderada`→`ae8`, `brometo_ipratropio_leve_moderada`→`a0X`, `oxigenio_leve_moderada`→`a0Y`.

Cálculos compartilhados do controller `_CategoryPediatraCriseAsmaControllerBase` (a partir do peso `p`):
- peso003Limited1 = min(p×0,03 ; 1) ; peso003Limited2 = min(p×0,03 ; 2) ; fiveMinusPeso003 = 5 − 0,03×p
- peso006Limited2 = min(p×0,06 ; 2)
- pesoDividedBy3Limited133 = min(p/3 ; 13,3) ; twoTimesPesoDividedBy3Limited133 = min(2p/3 ; 13,3)
- twoTimesPesoLimited125 = min(2p ; 125)
- x = 0,5p ; c = 2x ; xLimited20 = min(0,5p ; 20) ; fiftyMinusX = 50 − x
- x2 = 0,1p ; x2Limited4 = min(0,1p ; 4) ; fiftyMinusX2 = 50 − x2 ; c2 = 10×x2

#### Salbutamol (Leve a Moderada) (`aeb`)
- Título: **Beta-2 agonista de curta duração**
- **Apresentação:** Solução para nebulização 5 mg/mL: Aerolin®; Spray 100 mcg/dose: Aerolin®, Aerodini®
- **Prescrição:**
  - **≤ 5 anos:**
    - Spray: Crise aguda: Aspirar **2 puffs** (com espaçador) de 20/20 minutos, por 1 hora.
    - "Após a primeira hora, se sintomas recorrerem dentro de 3-4 horas, dar **2-3 puffs** extra/hora."
  - **≥ 6 anos:**
    - Spray: Crise aguda: Aspirar **4 a 10 puffs** (com espaçador) de 20/20 minutos, por 1 hora.
    - "Após a primeira hora: Aspirar **4 a 10 puffs** (com espaçador) a cada 1 a 2 horas."
- **Cuidados:** "- O número de inalações baseia-se na gravidade, idade e peso do paciente.\n- Para mais detalhes acesse a bula."

#### Corticóide VO (Leve a Moderada) — Prednisolona (`ae8`)
- Título: **Prednisolona**
- **Apresentação:** Solução oral 3 mg/mL: Predsim®, Prelone®
- **Prescrição:**
  - Solução oral 3 mg/mL: Prednisolona (3 mg/mL) - **`[pesoDividedBy3Limited133]` (1 mg/kg) a `[twoTimesPesoDividedBy3Limited133]` mL** (2 mg/kg) VO, uma vez ao dia por 3 a 5 dias.
- **Cuidados:**
  - "- Dose máxima até 2 anos = 20 mg/d.\n- Dose máxima 3 a 5 anos = 30 mg/d.\n- Dose máxima ≥ 6 anos = 40 mg/d.\n- Para mais detalhes acesse a bula."

#### Brometo de Ipratrópio (Leve a Moderada) (`a0X`)
- Título: **Anticolinérgico**
- **Apresentação:** Solução aerossol 20 mcg/mL: Atrovent® N; Solução para inalação (gotas) 0,25 mg/mL: Atrovent®
- **Prescrição:**
  - **≤ 5 anos:** Aerossol: Ipratrópio (20 mcg/mL) – Inalar **1 a 2 puffs** (com espaçador), conforme necessário, por até 3 horas.
    - (condicional por peso) Se **peso < 20 kg**: "Uso Inalatório\nCrianças < 20 kg: 250 mcg/dose\nIpratrópio (0,25 mg/mL) - Diluir **20 gotas** em 4 mL SF 0,9% para nebulização de 20/20 minutos, por 1 hora. Seguir conforme necessidade."
    - (condicional por peso) Se **peso ≥ 20 kg**: "Uso Inalatório\nCrianças ≥ 20 kg: 500 mcg/dose\nIpratrópio (0,25 mg/mL) - Diluir **40 gotas** em 3 mL SF 0,9% para nebulização de 20/20 minutos, por 1 hora. Seguir conforme necessidade."
  - **6 a 11 anos:** Aerossol: Ipratrópio (20 mcg/mL) – Inalar **4 a 8 puffs** (com espaçador), conforme necessário, por até 3 horas.
    - (mesmas condicionais por peso < 20 / ≥ 20 acima)
- **Cuidados:** "- Considere Brometo de ipratrópio em crises leve a moderada.\n- Para mais detalhes acesse a bula."

#### Oxigênio (Leve a Moderada) (`a0Y`)
- Texto único: **"Se necessário, administre O2 suplementar via cateter nasal ou mascára, para manter saturação periférica entre 94 – 98%."**

---

### Asma — Grave (`P8` / `b57`)
- Título do AppBar: **"Exacerbação de Asma"**.
- Input no topo: **Peso (kg)**.
- Lista de condutas (subnós `bH` em `eVo`), keys:
  - `salbutamol_grave` → **Salbutamol** (widget `aea`/`bar`)
  - `brometo_ipratropio_grave` → **Brometo de Ipratrópio** (widget `a0X`/`bao` — mesmo widget da leve/moderada)
  - `corticoide_vo_ev_grave` → **Corticóide VO ou EV** (widget `ae9`/`baq`)
  - `oxigenio_grave` → **Oxigênio** (widget `a0Y`/`bas` — mesmo widget da leve/moderada)
  - `sulfato_magnesio_grave` → **Sulfato de Magnésio** (widget `aec`/`bau`)
- Mapa `eG`: `salbutamol_grave`→`aea`, `corticoide_vo_ev_grave`→`ae9`, `brometo_ipratropio_grave`→`a0X`, `oxigenio_grave`→`a0Y`, `sulfato_magnesio_grave`→`aec`.

#### Salbutamol (Grave) (`aea`)
- Título: **Beta-2 agonista de curta duração**
- **Apresentação:** Solução para nebulização 5 mg/mL: Aerolin®; Spray 100 mcg/dose: Aerolin®, Aerodini®
- **Prescrição:**
  - **≤ 5 anos:** Spray: Crise aguda: Aspirar **6 puffs** (com espaçador) de 20/20 minutos, por 1 hora.
  - **≥ 6 anos:** Spray: Crise aguda: Aspirar **4 a 10 puffs** (com espaçador) de 20/20 minutos, por 1 hora.
- **Cuidados:** "- O número de inalações baseia-se na gravidade, idade e peso do paciente.\n- Para mais detalhes acesse a bula."

#### Corticóide VO ou EV (Grave) — Prednisolona / Metilprednisolona (`ae9`)
- **Apresentação:** Prednisolona (VO) - Solução oral (3 mg/mL): Predsim®, Prelone®; Metilprednisolona (EV) – pó + diluente (40 mg/mL): Solu-Medrol®
- **Prescrição:**
  - **Uso Oral**: Prednisolona (3 mg/mL) - **`[pesoDividedBy3Limited133]` (1 mg/kg) a `[twoTimesPesoDividedBy3Limited133]` mL (2 mg/kg)** VO, uma vez ao dia por 3 a 5 dias.
    - "- Dose máxima até 2 anos = 20 mg/d.\n- Dose máxima 3 a 5 anos = 30 mg/d.\n- Dose máxima ≥ 6 anos = 40 mg/d."
  - **Uso Endovenoso**: Metilprednisolona (Pó 40 mg + diluente 1 mL) – 1 mL + 40 mL SF 0,9%. Fazer **`[peso]` (1 mg/kg) a `[twoTimesPesoLimited125]` mL (2 mg/kg)** EV em pelo menos 30 minutos.
    - "- Dose máxima = 125 mg/d."
- **Cuidados:** "- Para mais detalhes acesse a bula."

#### Brometo de Ipratrópio (Grave) (`a0X`)
- Mesmo widget e conteúdo da seção Leve a Moderada (ver acima): apresentação Atrovent® N / Atrovent®, dosagem por faixa etária (≤ 5 anos: 1 a 2 puffs; 6 a 11 anos: 4 a 8 puffs) + condicionais por peso (< 20 kg → 20 gotas em 4 mL; ≥ 20 kg → 40 gotas em 3 mL). Cuidados: "Considere Brometo de ipratrópio em crises leve a moderada."

#### Oxigênio (Grave) (`a0Y`)
- Mesmo widget/conteúdo da Leve a Moderada: **"Se necessário, administre O2 suplementar via cateter nasal ou mascára, para manter saturação periférica entre 94 – 98%."**

#### Sulfato de Magnésio (Grave) (`aec`)
- **Apresentação:** Sulfato de magnésio 10% / Sulfato de magnésio 50%
- **Dose usual:** 50 mg/kg/dose
- **Prescrição:**
  - Sulfato de magnésio 10% - **`[xLimited20]` mL + SF 0,9% `[fiftyMinusX]` mL** ( **`[c]` mg/mL** ) - EV em 20 a 60 minutos.
    - template: `B.e.t(l.gaCH,1)+" mL + SF 0,9% "+B.e.t(l.gavs,1)+" mL" → " ("+B.e.t(l.gDy(0),1)+" mg/mL) - EV em 20 a 60 minutos."` (xLimited20 = min(0,5p ; 20); fiftyMinusX = 50 − 0,5p; c = 2·(0,5p) = p)

    ou

  - Sulfato de magnésio 50% - **`[x2Limited4]` mL + SF 0,9% `[fiftyMinusX2]` mL** ( **`[c2]` mg/mL** ) - EV em 20 a 60 minutos.
    - (x2Limited4 = min(0,1p ; 4); fiftyMinusX2 = 50 − 0,1p; c2 = 10·(0,1p) = p)
- **Cuidados:** "- Dose máxima: 2g.\n- Considere Sulfato de Magnésio em crises graves.\n- Concentração máxima: 60 mg/mL.\n- Para mais detalhes acesse a bula."

> Nota técnica de drogas: existe também a categoria separada de **Broncodilatadores** (`/pediatra/broncodilatadores`) com telas de droga independentes (Salbutamol `IG`, Brometo de Ipratrópio `Hf`, Sulfato de Magnésio `IJ`, Terbutalina `IL`, Fenoterol `Hy`, Montelucaste `HP`, Acebrofilina `H6`, etc.). Essas telas detalham a posologia completa por via/idade e cálculo por peso, e são referenciadas pelo algoritmo da crise ("- Para detalhes da crise, acesse o algoritmo específico."). Documentadas na seção de Broncodilatadores; aqui ficam fora do escopo da tela de exacerbação.

---

## Crise Convulsiva

> **IMPORTANTE — duas implementações no bundle:** existem DOIS conjuntos de telas de crise convulsiva no bundle decodificado:
>
> 1. **Tela ATIVA / roteada (`/pediatra/crise-convulsiva`)** — handler `czY` → tela `Pc` / state `b5a`, controller `_CategoryPediatraCriseConvulsivaControllerBase` (classe `Pb`). Lista de drogas com keys "0"–"5", correspondente à lista `eOQ` (`fwE`): **Diazepam, Midazolam, Fenitoína, Fenobarbital, Midazolam – infusão contínua, Tiopental – infusão contínua**. É a documentada em detalhe abaixo.
> 2. **Tela alternativa/legada (`NV` / state `b4i`, controller `_CategoryAnticonvulsivantesControllerBase` classe `NU`)** — um fluxo "Status epilepticus" com seções inline ("Exames", "Se hipoglicemia", "1) Fenitoína", "2) Fenobarbital", "1) Midazolam", "2) Propofol") e drogas Diazepam/Midazolam de primeira linha. **FLAG:** não encontrei rota direta apontando para `NV`/`b4i` no router principal (`jW`); a rota `/pediatra/crise-convulsiva` aponta para `Pc`. Documento o conteúdo dela em apêndice por conter o protocolo de status epilepticus por etapas (texto clínico relevante), mas marco como possivelmente legada/não roteada.

### Rota e estrutura (tela ativa `Pc`)
- Rota: `/pediatra/crise-convulsiva` (handler `czY` → tela `Pc` / state `b5a`).
- Categoria registrada (menu): label **"Crise Convulsiva"**, slug `criseconvulsiva`.
- Layout: lista de drogas expansíveis (`df1` itera os itens do controller). Cada card tem input de **Peso (kg)** ao final/topo (campo "Peso", sufixo "kg", decimal). Empty state quando peso ausente: "Informe todos os dados para obter o resultado." (`u.y`).
- Itens (lista `eOQ`, keys "0"–"5") e mapa `eG`:
  - "0" → **Diazepam** (widget `aed`/`bav`)
  - "1" → **Midazolam** (widget `aeg`/`bay`)
  - "2" → **Fenitoína** (widget `aee`/`baw`)
  - "3" → **Fenobarbital** (widget `aef`/`bax`)
  - "4" → **Midazolam – infusão contínua** (widget `aeh`/`baz`)
  - "5" → **Tiopental – infusão contínua** (widget `aei`/`baA`)

> **FLAG (mapeamento eG vs lista):** o `eG` da tela `Pc` mapeia: case "0"→`aed`(Diazepam), "1"→`aeg`(Midazolam), "2"→`aee`(Fenitoína), "3"→`aef`(Fenobarbital), "4"→`aeh`(Midazolam infusão contínua), "5"→`aei`(Tiopental infusão contínua). Isto bate com a lista `eOQ`. (Confirmado consistente.)

Cálculos do controller `Pb`/`ig` (a partir do peso `p`, e dose/ vazão definidas pelo usuário):
- peso02 = 0,2p ; peso004 = 0,04p ; peso3 = 3p ; peso4 = 4p ; peso5 = 5p ; peso8 = 8p
- peso4Limited300 = min(4p ; 300) ; peso8Limited300 = min(8p ; 300)
- peso01Limited1 = min(0,1p ; 2) **[FLAG: nome diz "Limited1" mas o teto no código é 2]**
- peso003Limited2 = min(0,03p ; 2) ; peso006Limited2 = min(0,06p ; 2) ; peso004Limited2 = min(0,04p ; 2)
- peso015Limited10 = min(0,15p ; 10) ; peso03Limited10 = min(0,3p ; 10) ; peso02Limited10 = min(0,2p ; 10)
- peso04Limited20 = min(0,4p ; 20) ; peso012Limited20 = min(0,12p ; 20) ; peso02Limited20 = min(0,2p ; 20)
- peso8Limited400 = min(8p ; 400) ; peso10Limited500 = min(10p ; 500)
- peso008Limited6 = min(0,08p ; 6) ; peso016Limited6 = min(0,16p ; 6) ; peso32Limited120 = min(3,2p ; 120)
- Midazolam infusão contínua (resultados z/w/h): zMidazolanInfusao = p×dose×1,44 ; z2 = p×dose×1440/5000 ; w = z·5/24 ; etc. (dose em mcg/kg/min digitada)
- tiopentalResult = p×dose/25 (dose em mg/kg/h digitada)

---

### Diazepam (`aed` / `bav`) — key "0"
- **Apresentação:** Solução injetável 5 mg/mL
- **Dose usual:** 0,2 a 0,3 mg/kg/dose EV; 0,2 a 0,5 mg/kg/dose via Retal; Dose máxima: 10 mg/dose
- **Prescrição:**
  - Diazepam **`[peso004Limited2]` a `[peso006Limited2]` mL** EV

    ou

  - Diazepam **`[peso004Limited2]` a `[peso01Limited1]` mL** + 3 mL SF 0,9% via Retal.
    - (template: `B.e.t(l.ga1L,2)+" a "+B.e.t(l.gHP,2)+" mL"` (EV); `B.e.t(l.ga1L,2)+" a "+B.e.t(l.gHQ,2)+" mL"` (Retal). ga1L=peso004Limited2; gHP=peso006Limited2; gHQ=peso01Limited1.)
- **Cuidados:** "- Repetir a cada 5 a 10 minutos até 2 doses se ineficaz.\n- Para mais detalhes acesse a bula.\n- Não se aplica ao período neonatal.\n- Não tem indicação por via intramuscular"

### Midazolam (`aeg` / `bay`) — key "1"
- Tem um **seletor de apresentação** (lista de rádios `S(a.f,...)`), opções com `.c` "0" e outra; cada opção muda os cálculos. (Apresentações no select — uma com `.c==="0"`.)
- **Dose usual:** 0,15 a 0,3 mg/kg/dose EV; 0,2 mg/kg/dose IM / Intranasal; Dose máxima: 10 mg/dose
- **Prescrição (condicional ao item selecionado):**
  - Se apresentação selecionada `.c==="0"`:
    - Midazolam **`[peso015Limited10]` mL (20 mg/kg) + `[peso03Limited10]` mL** EV

      ou

    - Midazolam **`[peso02Limited10]` mL** IM / Intranasal
    - (template `"0"`: `B.e.t(a.gayU,2)+" mL (20 mg/kg) + "+B.e.t(a.gaz6,2)+" mL"` EV; `B.e.t(a.gaeD,2)+" mL"` IM/Intranasal — gayU=peso015Limited10, gaz6=peso03Limited10, gaeD=peso02Limited10)

    > **FLAG:** o rótulo "(20 mg/kg)" no ramo Midazolam parece inconsistente com Midazolam (que é dosado em mg/kg pequenos, não 20 mg/kg). Transcrito verbatim do bundle; possível erro de copy/paste do template de outra droga. Marcar para validação clínica.
  - Caso contrário (outra apresentação):
    - Midazolam **`[peso003Limited2]` a `[peso006Limited2]` mL** EV

      ou

    - Midazolam **`[peso004Limited2]` mL** IM / Intranasal
    - (template padrão: `B.e.t(a.gME,2)+" a "+B.e.t(a.gHP,2)+" mL"` EV; `B.e.t(a.ga1L,2)+" mL"` IM/Intranasal)
- **Cuidados:** "- Repetir a cada 5 a 10 minutos até 2 doses se ineficaz\n- Para mais detalhes acesse a bula.\n- Não se aplica ao período neonatal."

### Fenitoína (`aee` / `baw`) — key "2"
- **Apresentação:** Solução injetável 50 mg/mL – ampola com 5 mL; Comprimido 100 mg
- **Dose usual:**
  - Dose de ataque: 15 a 20 mg/kg EV
  - Dose máxima inicial: 1.000 mg
  - Pode ser repetida dose adicional de 5 a 10 mg/kg 10 minutos após dose de ataque.
  - Dose de manutenção: 12 horas após ataque, iniciar 4 a 8 mg/kg/dia dividido em 1 ou 2 doses EV/VO. Dose máxima: 300 mg/d.
- **Prescrição:**
  - Dose de ataque: Fenitoína **`[peso04Limited20]` mL (20 mg/kg) + `[peso8Limited400]` mL** de SF 0,9% EV em 20 minutos.
  - Dose de manutenção: Fenitoína **`[peso008Limited6]` a `[peso016Limited6]` mL + `[peso32Limited120]` mL** de SF 0,9% EV no dia, dividido em 1 ou 2 doses.
  - ou Fenitoína **`[peso4Limited300]` a `[peso8Limited300]` mg** VO no dia, dividido em 1 ou 2 doses.
  - (templates: `gaza`=peso04Limited20, `gazz`=peso8Limited400, `gayP`=peso008Limited6, `gayX`=peso016Limited6, `gazp`=peso32Limited120, `gazs`=peso4Limited300, `gazy`=peso8Limited300; texto de ligação `u.t0` = " de SF 0,9% EV em 20 minutos.\n\nDose de manutenção:\n")
- **Cuidados:** "- Manter paciente monitorizado.\n- Taxa de infusão não deve ser superior a 50 mg/min ou 1 mg/kg/min.\n- Não diluir em soro glicosado.\n- Pacientes em uso crônico de fenitoína devem receber 5 mg/kg.\n- Para mais detalhes acesse a bula.\n- Não se aplica ao período neonatal."

### Fenobarbital (`aef` / `bax`) — key "3"
- **Apresentação:** Solução injetável 100 mg/mL – ampola com 2 mL; Comprimidos 50 e 100 mg; Solução gotas 40 mg/mL (1 gota = 1 mg)
- **Dose usual:**
  - Dose de ataque: 15 a 20 mg/kg EV
  - Dose máxima: 1.000 mg/dose
  - Pode ser repetida dose adicional de 5 a 10 mg/kg 10 minutos após dose de ataque.
  - Dose de manutenção: 12 a 24 horas após ataque, fazer 3-5 mg/kg/dia via oral em dose única ou fracionada.
- **Prescrição:**
  - Dose de ataque: Fenobarbital **`[peso02Limited10]` mL (20 mg/kg) + `[peso10Limited500]` mL** de SF 0,9% EV em 20 minutos.

    > **FLAG:** rótulo "(20 mg/kg)" no Fenobarbital usa `gaeD` (=peso02Limited10 = 0,2·peso), mas o cálculo de mL para uma concentração de 100 mg/mL com 20 mg/kg seria 0,2·peso mL — consistente. (sem erro aparente; nota informativa.)
  - Fenobarbital **`[peso3]` a `[peso5]` mg** VO em dose única ou fracionada.
  - (templates: `gaeD`=peso02Limited10, `gazk`=peso10Limited500, `gazo`=peso3 (3p), `gazt`=peso5 (5p); texto ligação `u.t0`.)
- **Cuidados:** "- Manter paciente monitorizado.\n- Taxa de infusão não deve ser superior a 100 mg/min ou 2 mg/kg/min.\n- Pacientes em uso crônico de fenobarbital devem receber 5-10 mg/kg.\n- Para mais detalhes acesse a bula.\n- Não se aplica ao período neonatal."

### Midazolam – infusão contínua (`aeh` / `baz`) — key "4"
- **Seletor de apresentação** (lista de rádios, opção `.c==="0"` = Midazolam 5 mg/5 mL).
- Campo de input: **Defina a dose** (sufixo "mcg/kg/min", decimal).
- **Dose usual:** "Bolus inicial: 0,2 mg/kg\nDose usual: 0,83 a 33,3 mcg/kg/min (0,05 a 2 mg/kg/h)"
- **Prescrição (condicional à apresentação):**
  - Se apresentação `.c==="0"` (Midazolam 5 mg/5 mL):
    - Bolus inicial: Midazolam (5 mg/5 mL) **`[peso02]` mL** EV
    - Midazolam (5 mg/5 mL) – **`[wMidazolanInfusao]` mL + `[z125MidazolanInfusao]` mL SF 0,9% EV EM BI a `[dose]` mL/h** ( **`[dose mcg/kg/min]` mcg/kg/min** )
    - (templates: bolus `gEn`=peso02; `ga2N`=zMidazolanInfusao, `gaC7`=wMidazolanInfusao, `gaCI`=z125MidazolanInfusao; vazão da BIC = valor calculado em `gWl`; "(...mcg/kg/min)" = `B.e.t(c.b,2)`)
  - Caso contrário (outra apresentação `.a` = nome):
    - Bolus inicial: Midazolam ("`[nome apresentação]`") **`[peso004]` mL** EV
    - Midazolam ("`[nome]`") – **`[z2MidazolanInfusao]` mL + `[w2MidazolanInfusao]` mL SF 0,9% EV EM BI a `[hMidazolanInfusao]` mL/h** ( **`[dose] mcg/kg/min** )
    - (templates: bolus `gEm`=peso004; `gUJ`=z2, `gaC6`=w2, `gaw_`=h)
- **Cuidados (`u.Dy`):** "- Garantir via aérea avançada.\n- Titular conforme EEG contínuo em UTI.\n- Para mais detalhes acesse a bula.\n- Não se aplica ao período neonatal."

### Tiopental – infusão contínua (`aei` / `baA`) — key "5"
- **Apresentação:** Pó para solução injetável – frasco-ampola 0,5 g e 1 g
- Campo de input: **Defina a dose** (sufixo "mg/kg/h", decimal).
- **Dose usual:** "Dose de ataque: 3 a 5 mg/kg/dose EV (Dose máxima: 500 mg/dose)\nDose usual inicial: 3 a 5 mg/kg/h"
- **Prescrição:**
  - Bolus inicial: Tiopental 1 g + 40 mL SF 0,9% - Fazer **`[peso012Limited20]` mL a `[peso02Limited20]` mL** EV em bolus de 20 segundos.
  - Seguido de: Tiopental 1 g + 40 mL SF 0,9% EV em BI à **`[tiopentalResult]` mL/h**
  - (templates: `gayR`=peso012Limited20, `gaz2`=peso02Limited20, `gaBp`=tiopentalResult = peso·dose/25)
- **Cuidados (`u.Dy`):** "- Garantir via aérea avançada.\n- Titular conforme EEG contínuo em UTI.\n- Para mais detalhes acesse a bula.\n- Não se aplica ao período neonatal."

---

### Apêndice — Fluxo "Status Epilepticus" (tela `NV` / `b4i`, possivelmente legada/não roteada)
Controller `_CategoryAnticonvulsivantesControllerBase` (classe `NU`/`kC`). Título do AppBar: **"Urgências"**. Input: **Peso (kg)** (campo "Peso", sufixo "kg"). Estrutura por etapas com seções expansíveis inline (`Va` com keys "0"–"5").

**Definição (cabeçalho da tela):**
- **Status epilepticus**
- Crise convulsiva contínua ≥ 5 minutos
- Duas ou mais crises convulsivas sem recuperação da consciência entre as crises

**Medidas iniciais:**
- • A, B, C
- • Suporte de via aérea e ventilação
- • Monitorização
- • Acesso Venoso (duas vias)
- • Glicemia capilar

**Seção "Exames:" (key "0", widget `adz`/`dtb`):**
- "Hemograma, sódio, potássio, cálcio, magnésio, glicemia, enzimas hepáticas, gasometria arterial, toxicológico, níveis séricos de antiepilépticos de uso habitual, troponina."

**Seção "Se hipoglicemia, fazer:" (key "1", widget `adC`/`dte`):**
- "1) Tiamina 100 mg EV\n2) Glicose Hipertônica 50% - 50 mL EV"

**Primeira linha – 10 minutos iniciais:**
- Diazepam (5 mg/mL) - **`[peso×0,03 limitado a 2]` mL** EV em 2 minutos (0,15 mg/kg – máx: 10 mg/dose). Repetir 1x, se crises após 5 minutos.
  - (template: `B.e.t(g.gaCa,2)` ; gaCa = min(0,03·peso ; 2))
- Se falha acesso venoso: **Midazolam**
  - Apresentação (lista de rádios de apresentações de Midazolam)
  - Midazolam – **`[resultMidazolam]` mL** IM (0,2 mg/kg – máx: 10 mg/dose). (gaAZ = se apresentação `.c==="0"` → peso02Limited10 ; senão peso004Limited2)
- Diazepam (5 mg/mL) – **`[peso×0,4 limitado a 4]` mL** Via Retal (0,2 mg/kg – máx: 20 mg/dose). (gaCg = min(0,4·peso ; 4))

> **FLAG:** o rótulo do Diazepam Via Retal diz "(0,2 mg/kg...)" mas usa `gaCg` (=min(0,4·peso;4)). Transcrito verbatim; possível inconsistência rótulo/cálculo. Validação clínica.

**Segunda linha – 10 a 30 minutos:**
- 1) **Fenitoína** (seção expansível key "2", widget `adA`/`dtc`)
  - **Apresentação:** Solução injetável 50 mg/mL – ampola com 5 mL
  - **Dose usual:** "Dose de ataque: 20 mg/kg EV. Algumas referências recomendam 10 a 15 mg/kg. Pode ser repetida dose adicional de 5 a 10 mg/kg 10 minutos após dose de ataque. Dose de manutenção: 8 a 12 horas após ataque, iniciar 100 mg a cada 6 ou 8 ou 12 horas."
  - **Prescrição — Dose de ataque:** Fenitoína (50 mg/mL) - **`[peso×0,4 lim 40]` mL (20 mg/kg) + 250 - 500 mL** de SF 0,9% EV em 30 minutos.
    - Pode ser repetida dose adicional de 10 mg/kg 10 minutos após dose de ataque: Fenitoína (50 mg/mL) - **`[peso×0,2 lim 40]` mL (10 mg/kg) + 250 mL** de SF 0,9% EV em 30 minutos.
    - (gaCh = min(0,4·peso ; 40) ; gaCf = min(0,2·peso ; 40))
  - **Dose de manutenção:** Fenitoína - **100 mg VO ou 2 mL (100 mg) + 100 mL de SF 0,9% em 20 minutos a cada 8 horas.**
  - **Dose Máxima:** 2g EV
  - **Cuidados:** "- Manter paciente monitorizado.\n- Taxa de infusão não deve ser superior a 50 mg/min ou 1 mg/kg/min.\n- Não diluir em soro glicosado.\n- Para mais detalhes acesse a bula."
- 2) **Fenobarbital** (seção expansível key "3", widget `adB`/`dtd`)
  - **Apresentação:** Solução injetável 100 mg/mL – ampola com 2 mL
  - **Dose usual:** "Dose de ataque: 15 a 20 mg/kg EV. Pode ser repetida dose adicional de 5 a 10 mg/kg 10 minutos após dose de ataque. Dose de manutenção: 24 horas após ataque, fazer 50 a 100 mg VO a cada 12 horas."
  - **Prescrição — Dose de ataque:** Fenobarbital (100 mg/mL) - **`[peso×0,15]` mL (15 mg/kg) a `[peso×0,2]` mL (20 mg/kg) + 250 mL** de SF 0,9% EV em **`[peso×0,25 arred]`** minutos.
    - Pode ser repetida dose adicional de 5 a 10 mg/kg 10 minutos após dose de ataque: Fenobarbital (100 mg/mL) - **`[peso×0,05]` mL (5 mg/kg) a `[peso×0,1]` mL (10 mg/kg) + 250 mL** de SF 0,9% EV em **`[peso×0,2 arred]`** minutos.
    - (gaCc = 0,15·peso ; gIz = 0,2·peso ; gaCd = 0,25·peso ; gag7 = 0,05·peso ; ga2F = 0,1·peso)
  - **Dose de manutenção:** Fenobarbital - **50 a 100 mg VO a cada 12 horas.**
  - **Cuidados:** "- Manter paciente monitorizado.\n- Taxa de infusão não deve ser superior a 100 mg/min ou 2 mg/kg/min.\n- Para mais detalhes acesse a bula."

**Terceira linha (Status epilepticus refratário):**
- • Proceder a Intubação Orotraqueal (se não realizada);
- • Solicitar vaga em UTI;
- • Monitorizar com EEG;
- 1) **Midazolam** (seção expansível key "4", widget `adD`/`dtm`) — Soluções padrões + "Monte sua solução":
  - Inputs: **Nº de ampolas**, **mL de soro**, **Defina a dose** (mcg/kg/min).
  - Dose de ataque: 0,2 mg/kg ; Infusão: 0,1 a 3 mg/kg/h
  - Concentração **`[concentração calculada]` mg/mL**
  - Dose de ataque: Midazolam (`[apresentação]`) **`[resultMidazolamSelect]` mL** EV
  - Midazolam (`[apresentação]`) **`[nº ampolas]` Ampola(s) com `[mL ampolas]` mL + `[mL soro]` mL SF 0,9% EV em BIC a `[vazão calculada]` mL/h**
  - "Se crises persistirem após 45-60 minutos, mudar para propofol."
- 2) **Propofol** (seção expansível key "5", widget `adE`/`dtp`):
  - "Faça puro"
  - Dose de ataque: 1 a 2 mg/kg em 5 minutos ; Infusão: 20 a 200 mcg/kg/min
  - Input: **Defina a dose** (mcg/kg/min)
  - Dose de ataque: Propofol (`[apresentação]`) **`[resultPropofolFirstSelect]` a `[resultPropofolSeccondSelect]` mL** EV em 5 minutos. Pode ser repetido 0,5-2 mg/kg até convulsões interromperem.
  - Propofol (`[apresentação]`) puro EV em BIC a **`[vazão calculada]` mL/h**
  - "Se crises persistirem após 45-60 minutos, mudar para midazolam."

**Encerramento (notas finais do fluxo refratário):**
- • Neuroimagem após controle das convulsões
- • Monitorização hemodinâmica em UTI
- • Providenciar acesso venoso central
- • Ressuscitação volêmica: estabelecer euvolemia
- • Iniciar vasopressor se PAM < 70mmHg ou PA sistólica < 90mmHg
- • Monitorização com eletroencefalograma contínuo (EEGc)
- • Considerar coleta de líquor (LCR) ou uso de ATB se suspeita clínica de infecção

> **Sobre cronômetro/tempos:** as três telas (Diarreia, Asma, Convulsiva) NÃO possuem cronômetro/contador embutido no bundle (nenhum `Timer`/`stopwatch` associado). Os "tempos" são textuais nas prescrições (ex.: "EV em 2 minutos", "10 minutos iniciais", "10 a 30 minutos", "20/20 minutos por 1 hora", "EV em 30 minutos"). Compatível com a regra do app de que cronômetros são manuais e exclusivos de protocolos específicos (PCR/CAD/SCA/Sepse) — não há cronômetro nestas três telas.
