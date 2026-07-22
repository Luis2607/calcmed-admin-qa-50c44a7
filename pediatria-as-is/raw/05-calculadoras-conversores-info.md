# Pediatria AS-IS — Calculadoras, Conversores, Informações e Doses Pediátricas

> Fonte de verdade: bundle Flutter web decodificado (`_source/main.decoded.js`).
> Conteúdo médico transcrito **verbatim**. Valores que o app calcula a partir de peso/idade aparecem como `[valor calculado]` com o template literal documentado.
> `[valor calculado]` = número renderizado em runtime a partir de inputs do usuário (não literal no bundle).

---

## Visão geral / roteamento

Estas telas aparecem no hub **Calculadoras** da Pediatria. Cards (i18n verbatim):
"Clearance de Creatinina", "Taxa de Infusão", "Superfície Corporal", "Sinais Vitais Normais", "Novo", "Acessar".

Rotas confirmadas (handlers de rota no bundle):
- `/pediatra/clearance-de-creatinina` → widget `Ob` (route handler `cB_`)
- `/pediatra/superficie-corporal` → widget `PL`/`PK` (route handler `cAt`)
- `/equation/category/taxa-infusao` → widget `PP` (Taxa de Infusão — tela compartilhada adulto/pediatra)
- `/pediatra/informations/sinais-vitais-normais` (registrada como `/sinais-vitais-normais`, handler `cj7` → widget `Pp`)
- `/pediatra/doses-pediatricas` (handler `aCl`), com sub-rotas `/` (lista), `/new`, `/view/:id`
- Conversores (cada um sob `/equation/category/...`):
  - `/equation/category/conversor-mlh-mcg` — "Conversor mL/h -> mcg/kg/min"
  - `/equation/category/conversor-mcg-mlh` — "Conversor mcg/kg/min -> mL/h"
  - `/equation/category/conversor-mlh-gtsmin` — "Conversor mL/h <-> gts/min"
  - `/equation/category/conversor-porcentagem-mgml` (alias `/category/conversor-porcentagem-mgml`) — "Conversor % -> mg/mL"
  - `/equation/category/conversor-mlh-mcgmin` — "Conversor mL/h -> mcg/min"
  - `/equation/category/conversor-mcgmin-mlh` — "Conversor mcg/min -> mL/h"
  - `/equation/category/conversor-corticoides` — "Conversor de Corticóides"

Empty state global das calculadoras (verbatim, i18n PT): **"Informe todos os dados para obter o resultado."**

---

## Calculadoras

### Clearance de Creatinina (pediátrica)

**Rota:** `/pediatra/clearance-de-creatinina` (handler `cB_` → widget `Ob`/`b4w`).
**Título da tela:** "Calculadoras Médicas" (AppBar) — card "Clearance de Creatinina".

Tela com **abas (TabBar de 2 abas)**:
- Aba 1: **"Schwartz"**
- Aba 2: **"Cockroft-Gault"** (rótulo escrito assim no bundle, "Cockroft" com erro de grafia)

#### Aba "Schwartz" — inputs
- **Idade** (sufixo "anos") — campo numérico
- **Altura** (sufixo "cm")
- **Prematuro** — toggle/botões "Sim" / "Não" (label de seção: "Prematuro")
- **Sexo** — botões "Homem" / "Mulher" (label de seção: "Sexo")
- **Creatinina Sérica** (sufixo "mg/dL")

**Saída (verbatim do template):** `"ClCr " + [valor calculado] + " mL/min/1,73m²"`
(o valor sai inteiro: `B.l.t(B.e.hi(e.gat8),0)`)

**Fórmula Schwartz (extraída do controller `gat8`):**
`ClCr = k × altura(cm) / creatinina sérica(mg/dL)`, com fator **k**:
- **0,33** se prematuro
- **0,45** se idade < 2 anos
- **0,55** se idade ≥ 2 anos **e** sexo = Mulher (a < 2 / criança)
- **0,70** se sexo = Homem

> FLAG: a lógica de seleção do k tem ramos sobrepostos no código minificado (prematuro → 0,33; <2 → 0,45; ≥2 & mulher → 0,55; homem → 0,7). Transcrita conforme o fluxo do bundle; revisar com fonte clínica se for usar como referência.

#### Aba "Cockroft-Gault" — inputs
- **Idade** (sufixo "anos")
- **Peso do paciente** (placeholder "Informe o valor", sufixo "kg")
- Toggle **"Homem" / "Mulher"**
- **Creatinina Sérica** (sufixo "mg/dL")

**Saídas (verbatim):**
- `"TFGe " + [valor calculado] + " mL/min/1,73m²."` (valor inteiro: `B.e.t(e.gam,0)`)
- `"Estágio " + " " + [estágio] + " "` (estágios: "GI", "GII", "GIII a", "GIII b", "GIV", "GV")

**Fórmula da aba 2 (controller `gam` — Cockroft-Gault):**
- Homem: `(140 - idade) × peso / (creatinina × 72)`
- Mulher: `(140 - idade) × peso / (creatinina × 72) × 0,85`

> NOTA: o controller também contém uma implementação completa de CKD-EPI 2021 race-free (`gph`/`gnb`, fatores 142/0,9/0,7/-0,302/-0,241/Math.pow(0,9938, idade) etc.), porém na TELA renderizada o resultado mostrado é o `gam` (Cockroft-Gault) e o Schwartz (`gat8`). Estagiamento (`gLR`/`gHh`): GI ≥90; GII 60–<90; GIII a 45–<60; GIII b 30–<45; GIV 15–<30; GV <15.

---

### Superfície Corporal

**Rota:** `/pediatra/superficie-corporal` (handler `cAt` → widget `PL`/`PK`/`Y0`).
**Título da tela:** "Calculadoras Médicas".

**Inputs:**
- **Peso do paciente** (sufixo "kg")
- **Altura** (sufixo "cm")

**Comportamento:** os resultados só aparecem (seção "Resultados") quando peso > 1 **e** altura > 1.

**Saídas renderizadas (cards `VZ` — rótulo + valor):**
- **"Mosteller"** → `[valor calculado] + " m²"` (3 casas: `B.e.t(...,3)`)
- **"Costeff (depende apenas do peso)"** → `[valor calculado] + " m²"` (3 casas)

> FLAG: O controller calcula **3 fórmulas** (Boyd, Mosteller, Costeff), mas a TELA só monta os cards **Mosteller** e **Costeff**. O resultado **Boyd** é calculado (`gbq8`) mas **não é exibido** na UI (nenhum push do card Boyd no build da tela).

**Fórmulas (controller `Y0`):**
- **Boyd** (`gbq8`, calculado, não exibido):
  `SC = 0,0003207 × altura^0,3 × peso^(0,7285 − 0,0188 × ln(peso))`
  (altura em cm, peso em **gramas** — `Math.pow(p.b,0.3)` onde `p.b` = altura; FLAG: revisar unidade do peso nesta fórmula)
- **Mosteller** (`gaB0`, exibido):
  `SC = √(peso × altura / 3600)`
- **Costeff** (`gaAW`, exibido; "depende apenas do peso"):
  - idade < 10: `(4 × peso + 9) / 100`
  - 10 ≤ idade < 20: `(4 × peso + 7) / (90 + peso)`
  - idade ≥ 20: `(peso × 2 + 40) / 100`

> NOTA: o controller de Superfície Corporal só armazena `weight` e `height` (sem idade explícita); o ramo "Costeff" usa `q.a` (peso) como variável da condição idade — FLAG de possível confusão peso/idade no código minificado.

---

### Taxa de Infusão

**Rota:** `/equation/category/taxa-infusao` (handler → widget `PP`/`b5A`). Tela **compartilhada** entre Adulto e Pediatra (card "Taxa de Infusão" / i18n "infusion_rate" / ES "Tasa de Infusión ml/h o gts/min").
**Título da tela:** "Calculadoras Médicas".

**Inputs:**
- **"Volume a ser infudido"** (sufixo "mL") — *grafia verbatim do bundle: "infudido"*
- **"Tempo de infusão"** (campo numérico) + **dropdown de unidade de tempo**:
  - "Horas" (fator 1)
  - "Minutos" (fator 60)

**Dropdown de unidade de saída** (no card de resultado):
- "mL/h" (fator 1)
- "gotas/min" (fator 0.3333333333333333)
- "microgts/min" (fator 1)

**Saída (verbatim):** `"Fazer " + [valor calculado] + " " + [unidade selecionada]`
acompanhado da nota fixa: **"1mL = 20 gotas"**
(quando unidade = gotas/min ("2") o valor sai arredondado inteiro; senão 0 casas)

**Fórmula (controller `b5z`/`PO` — `gn5`):**
`resultado = volume / (tempo / fatorTempo) × fatorUnidade`
(ou seja: vazão = volume ÷ tempo-em-horas, depois multiplicado pelo fator da unidade escolhida)

---

## Conversores (7)

Todos têm AppBar "Conversores". O subtítulo da AppBar é o nome do conversor.
Padrão dos conversores de droga (mcg/kg/min, mcg/min): possuem um bloco **"Concentração da solução"** com opção **"Não sei (Quero calcular)"** (checkbox) que abre um sub-fluxo **"Drogas padrões"** (dropdown) + **"Monte sua solução"** com 4 campos:
- "Concentração da ampola" (mg/mL)
- "Quantos mL tem 1 ampola" (mL)
- "Qual a quantidade de ampolas"
- "Qual a quantidade de soro" (mL)
→ saída intermediária: `"A concentração da sua solução é " + [valor calculado] + " mcg/mL"`.

### 1. Conversor mL/h → mcg/kg/min
**Subtítulo AppBar:** "mL/h ->\nmcg/kg/min". **Rota:** `/equation/category/conversor-mlh-mcg`.
**Inputs:**
- **"Velocidade de infusão"** (sufixo "mL/h")
- **"Peso do paciente"** (sufixo "kg")
- **"Concentração da solução"** (campo com sufixo, ou checkbox "Não sei (Quero calcular)" → "Drogas padrões" + monte sua solução, 4 campos acima)
**Saída (verbatim):** `"A infusão é de " + [valor calculado] + " mcg/kg/min"` (2 casas).

### 2. Conversor mcg/kg/min → mL/h
**Subtítulo AppBar:** "mcg/kg/min ->\nmL/h". **Rota:** `/equation/category/conversor-mcg-mlh`.
**Inputs:**
- **"Vazão"** (sufixo "mcg/kg/min")
- **"Peso do paciente"** (sufixo "kg")
- **"Concentração da solução"** (idem checkbox "Não sei (Quero calcular)" + Drogas padrões + monte sua solução)
**Rodapé com link:** "Para converter mL/h <-> gts/min, acesse:" → link "Conversor mL/h <-> gts/min".
**Saída (verbatim):** `"A infusão é de " + [valor calculado] + " mL/hora"` (2 casas).

> NOTA fórmula (controllers `ar1`/`ar2` compartilhados por estes conversores):
> concentração (mcg/mL) = (conc. ampola × qt ampola × mL ampola × 1000) / (qt soro + mL ampola × qt ampola);
> conversão entre vazão (mcg) e mL/h via `60 × peso × vazão / concentração` etc.

### 3. Conversor mL/h <-> gts/min
**Subtítulo AppBar:** "mL/h <-> gts/min". **Rota:** `/equation/category/conversor-mlh-gtsmin`.
**Inputs (bidirecional, dois campos):**
- **"Vazão em mL/h"**
- **"Vazão em gotas/minuto"**
**Texto fixo (verbatim):**
- "1 mL = 20 gotas\n1 mL = 60 microgotas"
- "Nota:\n- 1 gota/min = 3 microgotas/min"

### 4. Conversor % → mg/mL
**Subtítulo AppBar:** "% -> mg/mL". **Rota:** `/equation/category/conversor-porcentagem-mgml`.
**Input:**
- **"Solução a"** (placeholder "0", sufixo "%")
**Saída (verbatim):** `"Equivale a: " + [valor calculado] + " mg/mL"` (0 casas).
**Fórmula (controller `b4E`):** `mg/mL = (% × 10)` (`s*10`).

### 5. Conversor mL/h → mcg/min
**Subtítulo AppBar:** "mL/h -> mcg/min". **Rota:** `/equation/category/conversor-mlh-mcgmin`.
**Inputs:**
- **"Vazão"** (sufixo "mL/h")
- **"Concentração da solução"** (campo, ou checkbox "Não sei (Quero calcular)" → "Drogas padrões" + monte sua solução: Concentração da ampola mg/mL, Quantos mL tem 1 ampola, Qual a quantidade de ampolas, Qual a quantidade de soro mL)
**Saída (verbatim):** `"A infusão é de " + [valor calculado] + " mcg/min"` (2 casas).

### 6. Conversor mcg/min → mL/h
**Subtítulo AppBar:** "mcg/min -> mL/h". **Rota:** `/equation/category/conversor-mcgmin-mlh`.
**Inputs:**
- **"Vazão"** (placeholder "Vazão", sufixo "mcg/min")
- **"Concentração da solução"** (checkbox "Não sei (Quero calcular)" → "Drogas padrões" + monte sua solução, 4 campos)
**Saída (verbatim):** `"A infusão é de " + [valor calculado] + " mL/hora"` (2 casas).

### 7. Conversor de Corticóides (equivalência)
**Subtítulo AppBar:** "Conversor de Corticóides". **Rota:** `/equation/category/conversor-corticoides`.
**Inputs:**
- Dropdown **"De:"** (corticóide de origem)
- Campo **"Valor"** (sufixo "mg")
- Dropdown **"Para:"** (corticóide de destino)
**Saída (verbatim):** `"Resultado: " + [valor calculado] + " mg"` (2 casas).
**Fórmula (controller `b4x`):** `resultado = valor × fatorDestino / fatorOrigem`.

**Tabela de equivalência (verbatim, dropdown — droga : fator):**
| Corticóide | Fator (mg, dose equivalente) |
|---|---|
| Betametasona | 0,75 |
| Cortisona | 25 |
| Dexametasona | 0,75 |
| Hidrocortisona | 20 |
| Metilprednisolona | 4 |
| Prednisolona | 5 |
| Prednisona | 5 |
| Triancinolona | 4 |

---

## Informações

### Sinais Vitais Normais

**Rota:** `/pediatra/informations/sinais-vitais-normais` (registrada como `/sinais-vitais-normais`, handler `cj7` → widget `Pp`/`b5h`).
**Título da AppBar:** "Informações".

> ⚠️ **FLAG IMPORTANTE — A TABELA NÃO É TEXTO.**
> A tela **inteira** renderiza apenas **uma imagem**:
> `A.h6("assets/images/fluxograma_sinais_vitais.jpg",...)`
> Não há nenhuma tabela textual de faixas etárias × FC/FR/PA no bundle. Os valores numéricos de sinais vitais normais estão **embutidos na imagem JPG** (`assets/images/fluxograma_sinais_vitais.jpg`) e **não podem ser transcritos a partir do bundle JS**.
> Para documentar a tabela completa (FC, FR, PA por faixa etária) é necessário **abrir/OCR a imagem** `fluxograma_sinais_vitais.jpg` — fora do escopo do bundle decodificado.

---

## Doses Pediátricas (Soluções salvas / "Soluções Personalizadas")

**Rota:** `/pediatra/doses-pediatricas` (handler `aCl`), sub-rotas:
- `/` → lista (`OZ`)
- `/new` → formulário de criação (`zG`/`b51`)
- `/view/:id` → visualização/edição (`zG`/`b51`)

Controller: `_CategoryPediatricDosesControllerBase` (`PE`). A feature é o construtor de **soluções personalizadas** (reusa o componente "Soluções Personalizadas" / "minhas-solucoes"). A lista exibe os itens salvos (`Gv`), com **tocar = abrir** (`/view/:id`) e **deslizar/ação = excluir** (confirmação modal "Voltar").

**Empty state (lista vazia, verbatim):**
- Título: **"Vamos começar do zero?"**
- Texto: **"Salve agora suas principais soluções orais e tenha sempre à mão o que mais usa nos plantões."**
- Botão para criar nova (abre `/pediatra/doses-pediatricas/new`).

### Formulário "Novo" / edição (campos verbatim)
AppBar: "Soluções Personalizadas".
1. **"Nome da solução"** (campo de texto, **obrigatório** — validação "Item obrigatorio" [grafia verbatim, sem acento]). Aparece só ao criar (quando `w == null`).
2. **"Drogas padrões"** (dropdown de drogas pré-definidas — preenche os campos automaticamente).
3. **"Concentração da ampola"** (sufixo "mg/mL").
4. **"Quantos mL tem 1 ampola"** (sufixo "mL").
5. **"Qual a quantidade de ampolas"** (sem sufixo).
6. **"Qual a quantidade de soro"** (sufixo "mL").

**Saídas calculadas (cards, verbatim):**
- `"Volume final da solução: " + [valor calculado] + " mL"` (0 casas)
- `"A concentração da sua solução é " + [valor calculado] + " mcg/mL"` (0 casas)

**Bloco "Calcule a dose" (label verbatim "Calcule a dose:"):**
- **"Peso do paciente"** (sufixo "kg")
- **"Velocidade de infusão"** (sufixo "mL/h")
- **"Velocidade de infusão"** (segundo campo, com dropdown de unidade) — par de campos para taxa.

**Botões:**
- **"Salvar"** (persiste a solução)
- **"Cancelar"**

**Rodapé (link, verbatim):** "Para converter mL/h <-> gts/min, acesse:" → "Conversor mL/h <-> gts/min".

> NOTA: salvar grava no backend (`pacemeter`/coleção de soluções custom); o fluxo de salvar/excluir usa o controller `PE` (métodos `aim`, `zp`, `rL`). Persistência por usuário (não é conteúdo clínico fixo).

---

## Flags / pendências de fidelidade

1. **Sinais Vitais Normais = imagem.** Tabela (FC/FR/PA × faixa etária) está embutida em `assets/images/fluxograma_sinais_vitais.jpg`, não em texto. Transcrição da tabela exige OCR da imagem (fora do bundle).
2. **Superfície Corporal:** Boyd é calculado mas **não exibido** na tela (só Mosteller e Costeff aparecem). Possível confusão peso/idade/unidade no ramo Boyd/Costeff do código minificado.
3. **Clearance pediátrico:** a tela mostra Schwartz + Cockroft-Gault; o controller também tem CKD-EPI 2021 completo (não exibido nesta tela). Ramos de seleção do fator k do Schwartz têm sobreposição no minificado — revisar com fonte clínica.
4. **Grafias verbatim do bundle:** "Volume a ser infudido" (sic), "Cockroft-Gault" (sic), "Item obrigatorio" (sem acento, sic), "Conversor de Corticóides" (com acento), "microgts/min".
5. **Taxa de Infusão** é tela compartilhada Adulto/Pediatra (mesma rota `/equation/category/taxa-infusao`).
