# Pediatria AS-IS — Diluições e Doses

> Fonte de verdade: bundle Flutter web decodificado (`_source/main.decoded.js`). Todo conteúdo clínico transcrito **verbatim**. Valores derivados de peso/idade aparecem como template literal com `[valor calculado]`. Itens incertos vêm com **FLAG**.

Esta seção cobre quatro telas/grupos:
1. Hidratação - Manutenção (`/pediatra/hidratacao-manutencao`)
2. Drogas Vasoativas (`/pediatra/drogas-vasoativas` + `/volume` + `/vazao`)
3. Soluções Personalizadas (`/pediatra/custom-solutions` + `/flow-rate` + `/volume` + `/oral` + `/new`)
4. Ketofol (`/pediatra/ketofol`) e Ketodex (`/pediatra/ketodex`)

Observação geral sobre empty state: a maioria das telas pediátricas de cálculo NÃO usa o banner global "Informe todos os dados para obter o resultado." Em vez disso usam placeholders inline nos campos: **"Informe o valor"**, **"Informe a quantidade"**, **"Informe aqui"**, **"Informe o peso"**. O banner global existe no app mas não é o padrão destas telas. (FLAG: validar visualmente qual aparece em cada tela.)

---

## Hidratação - Manutenção

**Rota:** `/pediatra/hidratacao-manutencao`
**Título da tela:** "Hidratação - Manutenção"
**Tem 2 sub-modos (cards de seleção):**
- id `0` — **Hidratação Venosa Neonatal**
- id `1` — **Hidratação Venosa na Criança**

> Controllers no bundle: `HidratacaoVenosaControllerBase` (neonatal) e `HidratacaoControllerBase` (criança). A fórmula de manutenção da criança usa o esquema de Holliday-Segar (ver constantes abaixo).

### Sub-modo: Hidratação Venosa na Criança (id 1)

**Fórmula de volume (Holliday-Segar) — constantes literais do bundle:**
- Peso ≤ 10 kg → `100` mL (× peso) → na prática `100 mL/kg/dia` para os primeiros 10 kg
- Peso 10–20 kg → `1000 + (peso - 10) ×...` (template literal: `return 1000+(s.a-10)`) → 1000 mL + 50 mL/kg para cada kg acima de 10
- Peso > 20 kg → `1500 + (peso - 20) ×...` (template literal: `return 1500+(s.a-20)`) → 1500 mL + 20 mL/kg para cada kg acima de 20

> FLAG: as constantes 100 / 1000+(peso-10) / 1500+(peso-20) confirmam Holliday-Segar (100/50/20 mL/kg/dia). O multiplicador por kg (50 e 20) está embutido no código adjacente não totalmente isolado; transcrito o que o bundle expõe literalmente.

**Inputs (editáveis pelo usuário):**
- "Volume/kg em 24h" — campo numérico, hint **"(inicial: 60 a 80 mL/kg/dia)"**
- "Taxa de Infusão de Glicose (TIG)" — hint **"(inicial: 5 a 8 mg/kg/min)"**
- Sódio (NaCl) — hint **"(inicial: 1 mEq/kg/dia)"** / **"(usual: 1 mEq/kg/dia)"**
- Potássio (KCl) — hint **"(inicial: 0,5 mEq/kg/dia)"**
- "Concentração de glicose da solução:" — observação **"(Máx. em veia periférica: 12%)."**
- Dropdowns "Monte a solução:" / "Solução padrão:":
  - "Escolha o Soro Glicosado:"
  - "Escolha o Cloreto de Sódio:"
  - "Escolha o Cloreto de Potássio:"
- Campo "Peso do paciente"
- "Gluconato de Cálcio 10% - [valor calculado]" (com texto "e faça EV em 24 horas: [valor calculado]")

**Output / Prescrição (criança) — templates literais:**
- "Monte a solução:"
- "Faça EV em 24 horas: [valor calculado] ([valor calculado] gotas/min) para 24 horas."
- "O volume pode ser fracionado em etapas conforme a disponibilidade das soluções:"
- Exemplo embutido (verbatim):
  - "Exemplo em paciente com 10 kg:"
  - "GH 5% 952 mL + NaCl 20% 40 mL + KCl 19,1% 8 mL EV em 24 horas – 14 gotas/min."
  - "Equivale a prescrever:"
  - "GH 5% 476 mL + NaCl 20% 20 mL + KCl 19,1% 4 mL EV 12/12 horas – 14 gotas/min."
- Bloco de composição (verbatim):
  - "Esta solução é isotônica e segue as diretrizes atuais, com:"
  - "- Glicose: 5 a 10%;"
  - "- Cloreto de Sódio: 136 mEq/L"
  - "- Cloreto de Potássio: 2 mEq/100 kcal/dia"

### Sub-modo: Hidratação Venosa Neonatal (id 0)

**Inputs:** Peso do paciente; "Volume/kg em 24h" hint **"(inicial: 60 a 80 mL/kg/dia)"**; TIG; Sódio; Potássio; Concentração de glicose.

**Cuidados / observações (neonatal) — verbatim:**
- "- Ofertas estimadas para RN a termo."
- "- Sódio: inicia-se no 2° dia de vida. Dose alvo 3 mEq/kg/d a partir do 4° dia."
- "- Potássio: inicia-se no 2° dia de via após a diurese. Dose alvo 2 mEq/kg/d a partir do 3° dia." (typo "via" no bundle, transcrito verbatim)
- "- Concentração de glicose em acesso venoso periférico deve ser < 12%."
- "- Concentração de glicose em acesso venoso central deve ser < 20%."
- "- Aumentar volume de líquido em 10 ml/kg/dia (máximo 150 ml/kg/d)."
- "- Considere condições que afetam as demandas."

**Empty state:** placeholder inline "Informe o valor".

> NOTA DE CONTAMINAÇÃO: durante a extração, textos de "Glicemia capilar", "Neonato consciente / Amamentação em livre demanda", "Criança consciente / Administre carboidrato de rápida absorção", "Bolus inicial / Dextrose 0,2 g/kg / Dose inicial: dextrose 5 a 6 mg/kg/min" aparecem em bytes adjacentes — esses pertencem à tela de **Hipoglicemia pediátrica**, NÃO à Hidratação. Documentar na seção de Hipoglicemia, não aqui.

---

## Drogas Vasoativas (Pediatria)

**Rota raiz:** `/pediatra/drogas-vasoativas`
**Título:** "Drogas Vasoativas"
**Tem 2 modos (cards):**
- "Por Volume" → `/pediatra/drogas-vasoativas/volume`
- "Por Vazão" → `/pediatra/drogas-vasoativas/vazao`

**Lista de drogas (8, mesma ordem nos 2 modos):**
1. Noradrenalina
2. Vasopressina
3. Adrenalina
4. Dobutamina
5. Nitroprussiato de Sódio (Nipride®)
6. Nitroglicerina (Tridil®)
7. Dopamina
8. Milrinona

> Controllers: `_CategoryPediatraDrogasVasoativasVolumeControllerBase` e o controller de Vazão. Cada droga tem widget próprio (`pediatric_<droga>_volume` / `pediatric_<droga>_vazao`).

### Apresentações / Concentrações (verbatim por droga)

| Droga | Apresentação (label do bundle) |
|---|---|
| Noradrenalina | "Noradrenalina (4 mg/4 mL)" — ampola |
| Vasopressina | "Vasopressina (20 U/mL)" — "Ampola 20 U/mL" |
| Adrenalina | "Adrenalina (1 mg/mL)" — "1 mg/mL (Ampola com 1 mL)" |
| Dobutamina | "Dobutamina (250 mg/20 mL)" |
| Nitroprussiato de Sódio | "Nitroprussiato de Sódio (50 mg/2 mL)" |
| Nitroglicerina | "Nitroglicerina (5 mg/mL)" |
| Dopamina | "Dopamina (5 mg/mL)" — "5 mg/mL - Ampola com 10 mL" |
| Milrinona | "Milrinona (1 mg/mL)" — "1 mg/mL (ampola com 10 mL)" / "Milrinone 1 mg/mL" |

### Doses usuais (verbatim por droga)

- **Noradrenalina:** "Dose usual: 0,05 – 2 mcg/kg/min" (também aparece "Dose usual: 0,05 - 2 mcg/kg/min")
- **Vasopressina:** "Dose usual: 0,17 – 8 mU/kg/min" (também "Dose usual: 0,17-8 mU/kg/min")
- **Adrenalina:** "Dose usual: 0,1 – 1 mcg/kg/min"; bloco bradicardia/hipotensão: "Hipotensão ou choque – dose usual: 0,1 a 1 mcg/kg/min"
- **Dobutamina:** "Dose usual: 2 – 20 mcg/kg/min" / "Dose inicial: 0,5 a 1 mcg/kg/min" / "Dose usual: 2 a 20 mcg/kg/min"
- **Dopamina:** "Dose usual: 2 a 20 mcg/kg/min\nDoses menores predominam efeito inotrópico\nDoses maiores predominam efeito vasoconstritor"
- **Milrinona:** "Dose manutenção: 0,25 – 0,75 mcg/kg/min"; bloco de ataque: "Dose de ataque: 50 mcg/kg em 10 a 60 minutos\nDose usual: 0,25 a 0,75 mcg/kg/min"
- **Nitroglicerina:** "Dose usual: 0,25 – 0,5 mcg/kg/min" / "Dose inicial: 0,25 a 0,5 mcg/kg/min\nDose usual: 1 a 5 mcg/kg/min\nDose máxima: 10 mcg/kg/min"
- **Nitroprussiato de Sódio:** "Dose usual: 0,3 – 0,5 mcg/kg/min" / "Dose inicial: 0,3 a 0,5 mcg/kg/min\nDose máxima: 10 mcg/kg/min"

### Concentração máxima da solução (verbatim por droga)

- Adrenalina: "Concentração máxima da solução: 100 mcg/mL"
- Dobutamina: "Concentração máxima da solução: 5.000 mcg/mL"
- Dopamina: "Concentração máxima da solução: 3.200 mcg/mL"
- Nitroprussiato: "Concentração máxima da solução: 400 mcg/mL"
- Noradrenalina: "Concentração máxima da solução: 16 mcg/mL"
- Vasopressina: "Concentração máxima da solução: 1000 mU/mL"
- (Nitroglicerina/Milrinona: campo "Concentração máxima da solução" presente; valor calculado conforme padrão.)

**Concentrações-base internas (constantes `a<Droga>`, em mcg/U totais por ampola, usadas no cálculo):** aNoradrenalina 1000, aAdrenalina 1000, aVasopressina 20000, aDobutamina 12500, aMilrinone 1000, aNitroprussiato 25000, aNitroglicerina 5000, aDopamina 5000.

### Modo "Por Vazão" — campos e output

**Inputs:**
- "Peso"
- "Dose desejada:"
- "Vazão desejada:"

**Output:**
- "Volume em 24 horas:" [valor calculado]
- "Sugestões:" com dois templates por droga:
  - "Para 24 horas: <Apresentação> - [valor calculado] mL + SG 5% [valor calculado] mL – ( [valor calculado] mcg/mL) [valor calculado] mL/h ( [valor calculado] mcg/kg/min)"
  - "Para 48 horas: <Apresentação> -..." (mesmo formato)
  - Exemplo de template literal (Adrenalina): `"Para 24 horas: Adrenalina (1 mg/mL) -"," "+p+" mL"," + SG 5% "+o+" mL – ( "+n+e+m+" mL/h ( "+l+" mcg/kg/min)\n"`
  - Exemplo (Noradrenalina): `"Para 24 horas: Noradrenalina (4 mg/4 mL) -"," "+p+" mL"," + SG 5% "+o+" mL – ("+n+e+m+" mL/h ( "+l+" mcg/kg/min)\n"`
- "Atenção:" + "Concentração máxima da solução:..." (ver tabela acima)
- Milrinona (com ataque): trecho "[valor] mL/h em 60 minutos. Seguido de [valor] mL/h" (template: `" mL/h em 60 minutos. Seguido de "`)

**Empty state:** placeholder inline "Informe o valor" / "Informe a quantidade".

### Modo "Por Volume" — campos e output

**Inputs (montar a solução):**
- "Monte sua solução:"
- "Nº de ampolas"
- "mL de soro"
- "Peso"
- Dropdown "Solução padrão" / "Solução padrão:"
**Output:**
- "Concentração [valor calculado]"
- Templates "[N] ampolas + [valor] mL de soro" → "[valor] ampola +..." conforme arredondamento
- Velocidade de infusão derivada (mcg/kg/min ↔ mL/h)

> FLAG: parte das strings adultas de Drogas Vasoativas (Azul de Metileno, Levosimedan, etc.) coexistem no bundle mas NÃO estão na lista pediátrica (8 drogas acima). A lista pediátrica é a canônica desta seção.

---

## Soluções Personalizadas

**Rota raiz / lista:** `/pediatra/custom-solutions` (também `/pediatra/custom-solutions/`)
**Título:** "Diluições e Doses" (cabeçalho) / "Soluções Personalizadas"
**Controllers:** `_CategoryPediatricCustomSolutionsVolumeControllerBase` (campos: `name`, `peso`, `doseDesejada`, `apresentacao`, `concentracao`, `selectedDose`, `selectDoseList`, `selectedApresentacao`, `selectApresentacaoList`).

**Tela de lista:**
- Botão primário: **"Criar Nova Solução"** (`/pediatra/custom-solutions/new` quando aciona o fluxo de criação)
- Cada item salvo navega para `/pediatra/custom-solutions/flow-rate/<id>` ou `/pediatra/custom-solutions/volume/<id>`
- Ação de excluir: erros "Erro ao deletar solução personalizada" / "Não foi possível deletar a solução personalizada. Tente novamente mais tarde."
- Erros de criação: "Erro ao criar solução personalizada" / "Não foi possível criar a solução personalizada. Tente novamente mais tarde."

**Modos de criação (cards):**
- "Por Vazão" (id `0` no menu: "Cálculo pela vazão") → `/pediatra/custom-solutions/flow-rate`
- "Por Volume" (id `1` no menu: "Cálculo pelo volume") → `/pediatra/custom-solutions/volume`
- "Solução Oral" → `/pediatra/custom-solutions/oral/new` (e `/oral/<id>`)

### Campos do formulário (verbatim)

Cabeçalhos de modo:
- "Cálculo por Vazão"
- "Cálculo por Volume"

Campos comuns:
- "Nome da solução:" — placeholder "Informe aqui"
- "Apresentação da droga:" — placeholder "Informe aqui"
- "Volume da droga:" (modo vazão)
- "Volume de soro:" (modo vazão)
- "Dose desejada:"
- "Vazão desejada:" (modo vazão)
- "Concentração desejada da solução:" (modo volume)
- "Peso"
- Botão "Calcule a dose"
- "Concentração:" (resultado)
- Output de composição: "[valor] mL + Soro [valor] mL"
- Botão de persistência: **"Salvar Solução"**

**Campos internos (chaves do payload):** `desiredDose`, `desiredDoseUnit`, `drugVolume`, `diluentVolume`, `targetConcentrationSolution`.

> FLAG: o empty state da lista de soluções personalizadas (quando vazia) não foi encontrado como string hardcoded isolada — a tela renderiza a lista + botão "Criar Nova Solução". Validar visualmente se há mensagem de vazio.

---

## Ketofol

**Rota:** `/pediatra/ketofol`
**Título:** "Ketofol" (cabeçalho "Diluições e Doses")
**Layout em blocos (labels fixos):** Efeitos · Principais usos · Como preparar · Dose usual · Prescrição · Início de ação · Cuidados

**Conteúdo verbatim:**
- **Efeitos:** "Hipnótico\nAnalgésico"
- **Principais usos:** "Cardioversão Elétrica, Ecocardiograma Transesofágico, desbridamentos, suturas em pediatria, endoscopia, drenagem de tórax, redução de fraturas/luxações." (constante `u.l3`)
- **Como preparar:**
  > "1 seringa 20 mL
  >   • 2 mL Cetamina (50 mg/mL)
  >   • 10 mL Propofol 1% (10 mg/mL)
  >   • 8 mL AD / SF 0,9%
  > Total 20 mL: 5 mg/mL de Cetamina + 5 mg/mL de Propofol = 10 mg/mL de Ketofol"
- **Dose usual:** "0,5 a 1 mg/kg\nFazer 0,5 a 1 mL para cada 10 kg de peso EV em bolus lento"
- **Prescrição:**
  - Input: campo "Peso:" (unidade "kg")
  - Template de saída: "[peso×0,05, 2 casas] a [peso×0,1, 2 casas] mL EV em bolus lento." (template literal: `B.e.t(this.d*0.05,2)+" a "+B.e.t(this.d*0.1,2)+" mL"` + " EV em bolus lento.")
- **Início de ação:** "10 segundos"
- **Cuidados:** "Despertar prolongado (evitar em procedimentos ambulatoriais)" (constante `u.n`)

---

## Ketodex

**Rota:** `/pediatra/ketodex`
**Título:** "Ketodex"
**Composição base:** Cetamina + Precedex® (Dexmedetomidina)
**Layout em blocos:** Efeitos · Principais usos · Como preparar · Dose usual · Prescrição · Início de ação · Cuidados

A tela tem **duas variantes por faixa etária** (também listadas em Soluções Padronizadas: "Ketodex (> 7 anos)" e "Ketodex (0 a 7 anos)"). O menu pediátrico `/pediatra/ketodex` expõe o card "Ketodex (> 7 anos)" (id 0).

**Conteúdo comum (verbatim):**
- **Efeitos:** "Hipnótico\nAnalgésico"
- **Principais usos:** "Suturas em crianças, punções venosas profundas, tomografia em paciente agitado.\nAnalgésico > hipnótico" (constante `u.nR`)
- **Início de ação:** "10 segundos"
- **Cuidados:** "Despertar prolongado (evitar em procedimentos ambulatoriais)" (constante `u.n`)

### Variante > 7 anos (seringa de insulina)

- **Como preparar:**
  > "1 seringa de insulina + 1 seringa de 10 mL
  >   • 2 UI/kg Cetamina (50 mg/mL)
  >   • 1 UI/kg Precedex ® (Dexmedetomidina) (100 mcg/mL)
  >   • 10 mL AD / SF 0,9%"
- **Dose usual:** "1 mcg/kg Precedex ® + 1 mg/kg de Cetamina\nFazer 1 mL EV em bolus lento\nRepetir dose se necessário"
- **Prescrição:**
  - Input: "Peso:" (kg)
  - Template: "Cetamina - [peso×2, 0 casas] UI (seringa de insulina) + Precedex ® - [peso, 0 casas] UI (seringa de insulina) + AD – 10 mL. Fazer desta solução 1 mL EV em bolus lento." (template literal: `"Cetamina - "+B.e.t(this.d*2,0)+" UI (seringa de insulina) + Precedex ® - "+B.e.t(this.d,0)+" UI (seringa de insulina) + AD – 10 mL. Fazer desta solução"," 1 mL"," EV em bolus lento."`)

### Variante 0 a 7 anos (seringa de 20 mL)

- **Como preparar:**
  > "1 seringa de 20 mL
  >         • 2 mL Cetamina (50 mg/mL)
  >         • 1 mL Precedex ® (Dexmedetomidina) (100 mcg/mL)
  >         • 17 mL AD / SF 0,9%
  >       Total 20 mL: 5 mcg/mL de Precedex ® + 5 mg/mL de Cetamina"
- **Dose usual:** "0,5 a 1 mcg/kg de Precedex ® + 0,5 a 1 mg/kg de Cetamina EV\n      Fazer 1 a 2 mL da solução a cada 5 kg EV em bolus lento\n      Repetir dose se necessário"
- **Prescrição:**
  - Input: "Peso" (kg)
  - Texto de composição fixo: "Cetamina - 2 mL + Precedex ® - 1 mL + AD – 17 mL. Fazer desta solução [valor calculado]"

> FLAG: a "Como preparar" da variante 0–7 anos aparece com indentação extra no bundle (espaços antes das bullets) — transcrita verbatim. A correspondência exata variante→faixa-etária (qual widget renderiza em qual card) foi inferida da composição (UI/kg vs mL/peso) e da lista de Soluções Padronizadas; validar visualmente.

---

## Notas de cobertura

- **Hidratação:** 2 sub-modos documentados (Neonatal + Criança), fórmula Holliday-Segar confirmada por constantes, inputs e cuidados verbatim. Templates de prescrição com `[valor calculado]`.
- **Drogas Vasoativas:** 8 drogas, apresentações + doses usuais + concentrações máximas verbatim, 2 modos (Volume/Vazão), templates de sugestão 24h/48h documentados.
- **Soluções Personalizadas:** lista + 3 fluxos (Vazão/Volume/Oral), todos os campos do formulário verbatim, mensagens de erro.
- **Ketofol + Ketodex:** blocos completos verbatim, ambas as variantes etárias do Ketodex.
- Contaminações de bytes adjacentes (Hipoglicemia, Diarreia/SRO, Antibióticos pediátricos, Intubação) foram identificadas e NÃO incluídas — pertencem a outras seções.
