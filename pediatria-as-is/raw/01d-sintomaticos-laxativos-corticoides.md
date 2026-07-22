# Pediatria AS-IS — Sintomáticos: Laxativos + Corticóides

> Fonte de verdade: bundle Flutter web do app CalcMed (`main.decoded.js`), decodificado.
> Conteúdo clínico transcrito **verbatim**. Valores que dependem de Peso/idade aparecem como `[valor calculado]` com o template literal documentado ao lado.
> Categorias-mãe: **Laxativos** (`/pediatra/laxativos`) e **Corticóides** (`/pediatra/corticoides`), ambas dentro de Sintomáticos / Pediatra.

---

## Laxativos

**Rota da categoria:** `/pediatra/laxativos`
**Telas (ordem da listagem da categoria + rotas registradas):**

| # | Nome na lista | Rota |
|---|---|---|
| 0 | Lactulose | `/pediatra/laxativos/lactulose` |
| 1 | Macrogol 3350 | `/pediatra/laxativos/macrogol-3350` |
| 2 | Hidróxido de magnésio | `/pediatra/laxativos/hidroxido-magnesio` |
| 3 | Óleo mineral | `/pediatra/laxativos/oleo-mineral` |
| 4 | Glicerina | `/pediatra/laxativos/glicerina` |

> Observações estruturais comuns aos laxativos:
> - Cabeçalho da tela (AppBar): **"Laxativos"**.
> - Layout em blocos: `Apresentação` → `Prescrição:` → `Cuidados`.
> - **Somente a tela de Glicerina tem campo de input (Peso, kg)**; as demais (Lactulose, Macrogol 3350, Hidróxido de magnésio, Óleo mineral) são **estáticas** (texto fixo, sem cálculo por peso).
> - Termos de busca (aliases) capturados no bundle:
>   - Lactulose: `lactulose, lactulona, normolax, inlact, constipação, laxativos, laxantes`
>   - Macrogol: `macrogol, constipação, laxativos, laxantes`
>   - Óleo mineral: `óleo mineral, nujol, constipação, laxativos, laxantes`
>   - Genéricos da categoria: `constipação, lactulose, peg, laxantes, laxativos, macrogol, hidróxido de magnésio, óleo mineral, glicerina, glicerol, soro glicosado`

---

### Lactulose

- **Rota:** `/pediatra/laxativos/lactulose`
- **Inputs:** nenhum (tela estática, sem campo de peso/idade).
- **Empty state:** não se aplica (sem cálculo).

**Apresentação**
> Xarope 667 mg/mL: Lactulona®, Normolax®, Inlact®

**Prescrição:** (bloco rotulado **"Lactentes:"** seguido das faixas etárias)
> **Lactentes:** 5 mL/dia
> **Crianças de 1 a 5 anos:** 5 a 10 mL/dia
> **Crianças de 6 a 12 anos:** 10 a 15 mL/dia
> **Acima de 12 anos:** 15 a 30 mL/dia
>
> Administrado preferencialmente em uma única tomada pela manhã ou à noite, sozinho ou com alimentos.
>
> Posologia pode ser ajustada para que se obtenha 2 ou 3 evacuações ao dia.

**Cuidados**
> - Contraindicado em casos de intolerância à lactose, galactose ou frutose.
> - Para mais detalhes acesse a bula.

---

### Macrogol 3350

- **Rota:** `/pediatra/laxativos/macrogol-3350`
- **Inputs:** nenhum (tela estática). Não há bloco "Apresentação" nesta tela; começa direto na prescrição/dose usual.
- **Empty state:** não se aplica.

**Prescrição:** (bloco rotulado **"Constipação"**; doses em g/kg, com "Dose usual" destacado)
> **Constipação**
> Dose inicial:
> **Dose usual** 0,4-0,8 g/kg ao dia, via oral.
> Manutenção:
> **Dose usual** 0,2-1,5 g/kg ao dia, via oral. (Dose máxima: 17 g/dia).
>
> **Desimpactação fecal**
> Dose inicial:
> **Dose usual** 1-1,5 g/kg ao dia, via oral, por 3 a 6 dias. (Dose máxima: 100 g/dia)
> Manutenção:
> **Dose usual** 0,4-1 g/kg ao dia, via oral. Manter por pelo menos 2 meses e então reduzir gradualmente.

**Cuidados**
> - Contraindicado em menores de 2 anos de idade.
> - Para mais detalhes acesse a bula.

---

### Hidróxido de magnésio

- **Rota:** `/pediatra/laxativos/hidroxido-magnesio`
- **Inputs:** nenhum (tela estática).
- **Empty state:** não se aplica.

**Apresentação**
> Solução oral 1282,50 mg/15 mL: Leite de Magnésia de Phillips Original®
> Solução oral 1214,25 mg/15 mL: Leite de Magnésia de Phillips Hortelã®

**Prescrição:** (bloco rotulado **"Crianças de 2 a 5 anos:"** seguido das demais faixas)
> **Crianças de 2 a 5 anos:** 5 a 15 mL via oral uma vez ao dia.
> **Crianças de 6 a 12 anos:** 15 a 30 mL via oral uma vez ao dia.
> **Acima de 12 anos:** 30 a 60 mL via oral uma vez ao dia.

**Cuidados**
> - Contraindicado em menores de 2 anos de idade.
> - Período máximo de uso é de 3 dias consecutivos.
> - Para mais detalhes acesse a bula.

---

### Óleo mineral

- **Rota:** `/pediatra/laxativos/oleo-mineral`
- **Inputs:** nenhum (tela estática).
- **Empty state:** não se aplica.

**Apresentação**
> Frasco: Nujol®

**Prescrição:** (bloco rotulado **"Constipação ocasional: / Crianças de 6 a 11 anos:"**)
> **Constipação ocasional:**
> **Crianças de 6 a 11 anos:** 5 a 15 mL via oral à noite.
> **Acima de 12 anos:** 15 a 45 mL via oral à noite.
>
> **Constipação crônica:**
> **Crianças e adolescentes:** 1 a 3 mL/kg/dia. (Dose máxima: 90 mL/dia).
>
> **Desimpactação fecal:**
> Outros agentes laxativos orais são preferíveis, como macrogol 3350.

**Cuidados**
> - Contraindicado via oral em neuropatas e menores de 6 anos de idade, pelo risco de aspiração.
> - Para mais detalhes acesse a bula.

---

### Glicerina

- **Rota:** `/pediatra/laxativos/glicerina`
- **Inputs:** **Peso (kg)** — campo numérico (label "Peso", sem unidade exibida no sufixo; decimal). É a única tela de laxativo com cálculo por peso.
- **Empty state:** quando Peso = 0/vazio, abaixo da prescrição aparece o texto:
  > **Informe todos os dados para obter o resultado.**

**Apresentação**
> Enema Glicerinado 120 mg/mL: Glicerina 12 %®, Clisterol®
> Supositório pediátrico: Pfizer Supositório de Glicerina®

**Prescrição:** (template com valor calculado)
> Solução Glicerinada 12% - Fazer **[valor calculado: peso × 10] mL a [valor calculado: peso × 20] mL** (10 a 20 mL/kg) via retal uma vez ao dia.
>
> Supositório pediátrico – 1 supositório via retal uma vez ao dia.

- Template literal no código: `"Solução Glicerinada 12% - Fazer " + [peso*10 arred. 0 casas] + " mL a " + [peso*20 arred. 0 casas] + " mL " + "(10 a 20 mL/kg) via retal uma vez ao dia.\n\nSupositório pediátrico – 1 supositório via retal uma vez ao dia."`
- Lógica de cálculo: ao digitar o peso `p`, define `d = p*10` e `e = p*20` (limites inferior e superior em mL).

**Cuidados**
> - Contraindicado em caso de obstrução intestinal.
> - Para mais detalhes acesse a bula.

---

## Corticóides

**Rota da categoria:** `/pediatra/corticoides`

> **DIVERGÊNCIA IMPORTANTE NA LISTAGEM — FLAG:** existem **duas listagens diferentes** no bundle para esta categoria:
>
> **(A) Listagem exibida na página da categoria** (objeto `cr "Corticóides"`, 5 itens):
>
> | # | Nome | Rota |
> |---|---|---|
> | 0 | Prednisona | `/pediatra/corticoides` *(item da grade)* |
> | 1 | Dexametasona | — |
> | 2 | Hidrocortisona | — |
> | 3 | Metilprednisolona | — |
> | 4 | Budesonida | — |
>
> **(B) Índice de busca** (`searchableItems`, 8 entradas — é o que mapeia rotas reais):
>
> | # | Label de busca | Rota |
> |---|---|---|
> | 0 | **Kóide®** | `/pediatra/corticoides/prednisona` |
> | 1 | **Kóide D®** | `/pediatra/corticoides/dexametasona` *(ver flag abaixo)* |
> | 2 | Budesonida | `/pediatra/corticoides/budesonida` |
> | 3 | Dexametasona | `/pediatra/corticoides/dexametasona` |
> | 4 | Fluticasona | `/pediatra/corticoides/fluticasona` |
> | 5 | Hidrocortisona | `/pediatra/corticoides/hidrocortisona` |
> | 6 | Metilprednisolona | `/pediatra/corticoides/metilprednisolona` |
> | 7 | Prednisolona | `/pediatra/corticoides/prednisolona` |
>
> **(C) Rotas efetivamente registradas no router (`A.aG`):** `prednisona`, `dexametasona`, `hidrocortisona`, `metilprednisolona`, `prednisolona`, `budesonida`, `fluticasona` — **7 telas distintas**.
>
> **(D) Dispatcher de tela por índice `"0".."7"` (`aHw.u`):**
> `case "0"→It` (Prednisona/Kóide®), `case "1"→Iz` (**Kóide D®** = dexclorfeniramina+betametasona), `case "2"→Iv` (Budesonida Spray Nasal), `case "3"→Iw` (**Dexametasona**), `case "4"→Ix` (Fluticasona/Avamys), `case "5"→Iy` (Hidrocortisona), `case "6"→IA` (Metilprednisolona), `case "7"→IB` (Prednisolona).
>
> **FLAGS:**
> 1. **Kóide®** (índice 0) e **Kóide D®** (índice 1) são telas separadas embora ambas estejam sob "corticóides". Kóide® → tela It (Prednisona, elixir 0,1 mg/mL). Kóide D® → tela Iz (xarope **dexclorfeniramina + betametasona**), apesar de a rota de busca apontar para `.../dexametasona`. A tela de **Dexametasona "pura"** é a Iw (índice 3).
> 2. **Prednisolona** existe como tela própria (IB, índice 7) mas **não aparece na listagem (A)** da categoria — só no índice de busca e no dispatcher. (`Predsim®/Prelone®` é a marca da Prednisolona, citada também no protocolo de Asma.)
> 3. A listagem (A) cita "Metilprednisolona (Solu-Medrol)" implicitamente via marca — confirmado abaixo.
>
> Documentadas abaixo TODAS as telas-alvo: Prednisona, Prednisolona, Dexametasona, Hidrocortisona, Metilprednisolona, Budesonida, Fluticasona, Koide D.

> **Estrutura comum dos corticóides:** AppBar **"Corticóides"**. Telas com cálculo têm campo **Peso (kg)** (placeholder "Informe o peso da criança") e, quando há mais de uma formulação, um seletor **"Selecione a apresentação:"** (chips de rádio 1-de-N). A prescrição só aparece após preencher peso **e** escolher apresentação; antes disso o bloco de prescrição fica vazio (sem texto de resultado).

---

### Prednisona (Kóide®)

- **Rota:** `/pediatra/corticoides/prednisona` — label de busca **"Kóide®"** (tela `It`).
- **Inputs:** **Peso (kg)** (placeholder "Informe o peso da criança"). Sem seletor de apresentação (formulação única).
- **Empty state:** se Peso = 0 (ou vazio) o bloco "Uso oral" **não é renderizado** (nenhuma prescrição aparece até informar o peso).

**Apresentação**
> Elixir: 0,1 mg/mL — Kóide®

**Prescrição** (template com valor calculado; cabeçalho do bloco "Uso oral", dose usual destacada)
> **Uso oral**
> Dose usual: 0,017 a 0,25 mg/kg/d
> Dar **[valor calculado: peso × 0,17] mL a [valor calculado: peso × 2,5] mL** VO ao dia, dividido em 3 a 4 doses.

- Template literal: `"Dar " + [peso*0.17 arred. 1 casa] + " mL a " + [peso*2.5 arred. 1 casa] + " mL" + " VO ao dia, dividido em 3 a 4 doses."` (texto fixo: "Dose usual: 0,017 a 0,25 mg/kg/d").

**Cuidados**
> - Para mais detalhes acesse a bula.

---

### Prednisolona

- **Rota:** `/pediatra/corticoides/prednisolona` (tela `IB`).
- **Inputs:** **Peso (kg)** (placeholder "Informe o peso da criança") + **seletor "Selecione a apresentação:"** com 3 opções (chips de rádio).
- **Empty state:** prescrição vazia até preencher peso (>0) e selecionar apresentação. (No código: `if a<=0` → sem prescrição.)

**Apresentações (3 opções do seletor):**
1. **Solução oral: 1 mg/mL** (enum `solucao1mgml`)
2. **Solução oral: 3 mg/mL** (enum `solucao3mgml`)
3. **Solução oral - gotas: 11 mg/mL** (enum `gotas11mgml`)

**Prescrição** (bloco "Dose anti-inflamatória:", template com valor calculado — varia por apresentação):

- **Solução oral 1 mg/mL** (classe `aSO`):
  > **Dose anti-inflamatória:**
  > - Dar **[valor calculado: peso × 0,1] a [peso × 2] mL**, Via Oral, ao dia.
  - Template: `"- Dar " + [peso*0.1 arred. 2] + " a " + [peso*2 arred. 2] + " mL, Via Oral, ao dia."`

- **Solução oral 3 mg/mL** (classe `aSP`):
  > **Dose anti-inflamatória:**
  > - Dar **[valor calculado: peso × 0,03] a [peso × 0,67] mL**, Via Oral, ao dia.
  - Template: `"- Dar " + [peso*0.03 arred. 2] + " a " + [peso*0.67 arred. 2] + " mL, Via Oral, ao dia."`

- **Solução oral - gotas 11 mg/mL** (classe `aSN`):
  > **Dose anti-inflamatória:**
  > - Dar **[valor calculado: arred(peso × 0,2)] a [arred(peso × 3,6)] gotas**, Via Oral, ao dia.
  - Template: `"- Dar " + [round(peso*0.2)] + " a " + [round(peso*3.6)] + " gotas, Via Oral, ao dia."`

> **Cuidados:** não há bloco "Cuidados" textual nesta tela além das prescrições por apresentação (não capturado bloco de contraindicação separado). FLAG: verificar em runtime se há rodapé "Para mais detalhes acesse a bula." (não presente no trecho de código desta tela).

---

### Dexametasona

- **Rota:** `/pediatra/corticoides/dexametasona` (tela `Iw`). (Atenção à divergência de label de busca — ver FLAG da categoria; "Kóide D®" no índice 1 aponta para esta mesma rota mas renderiza a tela Iz/Koide D.)
- **Inputs:** **Peso (kg)** (placeholder "Informe o peso da criança") + **seletor "Selecione a apresentação:"** com **6 opções**.
- **Empty state:** prescrição vazia até informar peso e selecionar apresentação.

**Apresentações (6 opções; labels exibidos via `cij`):**
1. **Solução injetável 2 mg/mL** (`solucao2mgml`)
2. **Solução injetável 4 mg/mL** (`solucao4mgml`)
3. **Elixir 0,1 mg/mL** (`elixir010mgml`)
4. **Comprimido 0,5 mg** (`comprimido05mg`)
5. **Comprimido 0,75 mg** (`comprimido075mg`)
6. **Comprimido 4 mg** (`comprimido4mg`)

**Mapeamento apresentação → prescrição** (`eXY`): opção 0 → template `aGo`; opção 1 → `aGp`; opção 2 → `aGn`; opções 3, 4 e 5 → `aGm`.

Cada prescrição mostra 4 blocos de indicação (Dose Anti-inflamatória, Dose Exacerbação Asma, Dose Crupe, Dose Meningite Bacteriana).

**Textos fixos reutilizados (resolvidos do bundle):**
- `u.pX` = "IM ou EV: 0,02 a 0,3 mg/kg/dia, fracionado a cada 6 ou 12 horas."
- `u.bz` = "diluído em SF 0,9%, EV (ou sem diluição IM), a cada 6 ou 12 horas."
- `u.aS` = "IM ou EV: 0,6 mg/kg dose única ou 1 vez ao dia por 2 dias. (Máx.: 16 mg/dose)"
- `u.oP` = "diluído em SF 0,9%, EV (ou sem diluição IM), dose única."
- `u.r8` = "IM ou EV: 0,6 mg/kg dose única. (Máx.: 16 mg/dose)"
- `u.fp` = "EV: 0,15 mg/kg/dose de 6/6 horas por 2 a 4 dias. (Máx.: 10 mg/dose)"
- `u.Bn` = "Infundir 10 a 20 minutos antes do antibiótico ou no início deste."
- `u.kR` = "diluído em SF 0,9%, EV (ou sem diluição IM), 6/6 horas."
- `u.zG` = "Oral: 0,02 a 0,3 mg/kg/dia, fracionado a cada 6 ou 12 horas."
- `u.ai` = "A administração endovenosa é a via mais adequada."

**`aGo` — Solução injetável 2 mg/mL** (templates com valor calculado):
> **Dose Anti-inflamatória:** [u.pX] Fazer **[peso × 0,01] mL a [peso × 0,15] mL** [u.bz]
> **Dose Exacerbação Asma:** [u.aS] Fazer **[peso × 0,3] mL** [u.oP]
> **Dose Crupe:** [u.r8] Fazer **[peso × 0,3] mL** [u.oP]
> **Dose Meningite Bacteriana:** [u.fp] [u.Bn] Fazer **[peso × 0,075] mL** [u.kR]

**`aGp` — Solução injetável 4 mg/mL:**
> **Dose Anti-inflamatória:** [u.pX] Fazer **[peso × 0,005] mL** [u.bz]
> **Dose Exacerbação Asma:** [u.aS] Fazer **[peso × 0,15] mL** [u.oP]
> **Dose Crupe:** [u.r8] Fazer **[peso × 0,15] mL** [u.oP]
> **Dose Meningite Bacteriana:** [u.fp] [u.Bn] Fazer **[peso × 0,0375] mL** [u.kR]

**`aGn` — Elixir 0,1 mg/mL** (uso oral):
> **Dose Anti-inflamatória:** [u.zG] Fazer **[peso × 0,2] mL a [peso × 3] mL** no dia, fracionado a cada 6 ou 12 horas, via oral.
> **Dose Exacerbação Asma:** "Oral: 0,6 mg/kg dose única ou 1 vez ao dia por 2 dias. (Máx.: 160 mL/dose)" Fazer **[peso × 6] mL** via oral, dose única.
> **Dose Crupe:** "Oral: 0,6 mg/kg dose única. (Máx.: 160 mL/dose)" Fazer **[peso × 6] mL** via oral, dose única.
> **Dose Meningite Bacteriana:** [u.ai]

**`aGm` — Comprimidos 0,5 / 0,75 / 4 mg** (dose em mg, não em mL):
> **Dose Anti-inflamatória:** [u.zG] Dar **[peso × 0,02] mg a [peso × 0,3] mg** por dia, fracionado a cada 6 ou 12 horas, via oral.
> **Dose Exacerbação Asma:** "Oral: 0,6 mg/kg dose única ou 1 vez ao dia por 2 dias. (Máx.: 16 mg/dose)." Dar **[peso × 0,6] mg** via oral, dose única.
> **Dose Crupe:** "Oral: 0,6 mg/kg dose única. (Máx.: 16 mg/dose.)" Dar **[peso × 0,6] mg** via oral, dose única.
> **Dose Meningite Bacteriana:** [u.ai]

---

### Hidrocortisona

- **Rota:** `/pediatra/corticoides/hidrocortisona` (tela `Iy`).
- **Inputs:** **Peso (kg)** (placeholder "Informe o peso da criança") + **seletor "Selecione a apresentação:"** com 2 opções.
- **Empty state:** prescrição vazia até peso (>0) + apresentação selecionada.

**Apresentações (2 opções):**
1. **Pó para solução injetável: 100 mg** (enum `frasco100mg`)
2. **Pó para solução injetável: 500 mg** (enum `frasco500mg`)

**Prescrição (frasco 100 mg — classe `aKT`):**
> **Dose anti-inflamatória inicial:**
> - 0,56 a 8 mg/kg/dia, EV/IM – dividido em 3 ou 4 doses
> - Reconstituir cada frasco de 100 mg em 2 mL de AD.
> - Fracionar **[peso × 0,0112] mL a [peso × 0,16] mL** em 3 ou 4 doses e fazer IM.
> OU
> - Fracionar **[peso × 0,0112] mL a [peso × 0,16] mL** em 3 ou 4 doses, diluir em 20 mL de SF 0,9% e fazer EV em 1 a 2 minutos.
> - Doses > 100 mg até 500 mg: Diluir em 50 mL de SF 0,9% e infundir em 15-30 minutos.
>
> **Choque Séptico:**
> - Dose única: 2 mg/kg EV.
> - Reconstituir cada frasco de 100 mg em 2 mL de AD.
> - Aspirar **[peso × 0,04] mL (máx. 100 mg)**, diluir em 20–50 mL de SF 0,9% e administrar em 1 a 2 minutos.

**Prescrição (frasco 500 mg — classe `aKU`):**
> **Dose anti-inflamatória inicial:**
> - 0,56 a 8 mg/kg/dia, EV/IM – dividido em 3 ou 4 doses
> - Reconstituir cada frasco de 500 mg em 4 mL de AD.
> - Fracionar **[peso × 0,0048] mL a [peso × 0,064] mL** em 3 ou 4 doses e fazer IM.
> OU
> - Fracionar **[peso × 0,0048] mL a [peso × 0,064] mL** em 3 ou 4 doses, diluir em 20 mL de SF 0,9% e fazer EV em 1 a 2 minutos.
> - Doses > 100 mg até 500 mg: Diluir em 50 mL de SF 0,9% e infundir em 15-30 minutos.
>
> **Choque Séptico:**
> - Dose única: 2 mg/kg EV.
> - Reconstituir cada frasco de 500 mg em 4 mL de AD.
> - Aspirar **[peso × 0,016] mL (máx. 100 mg)**, diluir em 20–50 mL de SF 0,9% e administrar em 1 a 2 minutos.

> Texto fixo compartilhado: `u.rK` = " mL em 3 ou 4 doses, diluir em 20 mL de SF 0,9% e fazer EV em 1 a 2 minutos."; `u.rP` = " mL (máx. 100 mg), diluir em 20–50 mL de SF 0,9% e administrar em 1 a 2 minutos."

---

### Metilprednisolona (Solu-Medrol®)

- **Rota:** `/pediatra/corticoides/metilprednisolona` (tela `IA`).
- **Inputs:** **Peso (kg)** (placeholder "Informe o peso da criança") + **seletor "Selecione a apresentação:"** com 3 opções.
- **Empty state:** prescrição vazia até peso (>0) + apresentação selecionada.

**Apresentações (3 opções):**
1. **Pó para solução injetável: 40 mg** (enum `frasco40mg`)
2. **Pó para solução injetável: 125 mg** (enum `frasco125mg`)
3. **Pó para solução injetável: 500 mg** (enum `frasco500mg`)

**Textos fixos compartilhados:**
- `u.P` = "- 0,11 a 1,6 mg/kg/dia, EV – dividido em 3 ou 4 doses"
- `u.p` = " mL em 3 ou 4 doses, diluir em SF 0,9% e fazer EV."
- `u.c` = "- Doses < 250 mg: Diluir em 50 a 100 mL de SF 0,9% e infundir em pelo menos 5 minutos."
- `u.mS` = "- Doses > 250 mg: Diluir em 250 mL de SF 0,9% e infundir em pelo menos 30 minutos."

**Prescrição (frasco 40 mg — classe `aPC`):**
> **Dose anti-inflamatória:**
> [u.P]
> - Reconstituir cada ampola em 1 mL de diluente.
> - Fracionar **[peso × 0,00275] a [peso × 0,04] mL** em 3 ou 4 doses, diluir em SF 0,9% e fazer EV.
> [u.c]
> [u.mS]

**Prescrição (frasco 125 mg — classe `aPB`):**
> **Dose anti-inflamatória:**
> [u.P]
> - Reconstituir cada ampola em 2 mL de diluente.
> - Fracionar **[peso × 0,00176] a [peso × 0,0256] mL** em 3 ou 4 doses, diluir em SF 0,9% e fazer EV.
> [u.c]
> [u.mS]

**Prescrição (frasco 500 mg — classe `aPD`):**
> **Dose anti-inflamatória:**
> [u.P]
> - Reconstituir cada ampola em 8 mL de diluente.
> - Fracionar **[peso × 0,00176] a [peso × 0,0256] mL** em 3 ou 4 doses, diluir em SF 0,9% e fazer EV.
> [u.c]
> [u.mS]

> Marca confirmada no bundle (protocolo de Asma): "Metilprednisolona (EV) – pó + diluente (40 mg/mL): Solu-Medrol®".

---

### Budesonida

- **Rota:** `/pediatra/corticoides/budesonida` (telas `Iv` builder + `Iu` controller).
- **Título da seção:** **"Spray Nasal"**.
- **Inputs:** **seletor "Selecione a apresentação:"** com 2 opções de rádio. **Sem campo de peso** (doses fixas por mcg/jato; o controller mantém `weight: 0` fixo).
- **Empty state:** prescrição vazia até selecionar a apresentação.

**Apresentações (2 opções):**
1. **Suspensão spray 32 mcg/dose ou 64 mcg/dose: Busonid, Noex** (enum `mcg32ou64`)
2. **Suspensão spray 50 mcg/dose ou 100 mcg/dose: Busonid, Noex** (enum `mcg50ou100`)

**Prescrição (opção 32/64 mcg — classe `aRU`):**
> **Dose usual para rinite:**
> Até 256 mcg/dia (a dose de 256 mcg, pode ser feita 1 ou 2 vezes ao dia)
> **Crianças ≥ 6 anos**
> - Aplicar 4 doses de 32 mcg em cada narina 1 a 2 vezes ao dia.
> OU
> - Aplicar 2 doses de 64 mcg em cada narina 1 a 2 vezes ao dia.

**Prescrição (opção 50/100 mcg — classe `aRV`):**
> **Dose usual para rinite:**
> Até 400 mcg/dia (a dose de 256 mcg, pode ser feita 1 ou 2 vezes ao dia)
> **Crianças ≥ 6 anos**
> - Aplicar 2 doses de 50 mcg em cada narina 2 vezes ao dia ou 4 doses em cada narina, 1 vez ao dia, pela manhã.
> OU
> - Aplicar 1 dose de 100 mcg em cada narina 2 vezes ao dia ou 2 doses em cada narina, 1 vez ao dia, pela manhã

> FLAG (verbatim do bundle): no texto da opção 50/100 mcg, o limite citado é "Até 400 mcg/dia" mas a frase entre parênteses repete "(a dose de 256 mcg...)" — possível inconsistência de copy no app original. Transcrito como está.

---

### Fluticasona (Avamys®)

- **Rota:** `/pediatra/corticoides/fluticasona` (tela `Ix`).
- **Inputs:** nenhum (tela estática, sem peso e sem seletor).
- **Empty state:** não se aplica.

**Apresentação**
> Suspensão spray nasal: 27,5 mcg/dose — Avamys®

**Prescrição**
> **Crianças ≥ 2 anos**
> **Dose usual para rinite:**
> Aplicar 1 jato (27,5 mcg) em cada narina uma vez ao dia.
> - A dose pode ser aumentada para 2 jatos em cada narina uma vez ao dia, até controle dos sintomas.
> - Após controle dos sintomas, recomenda-se a redução da dose para 1 jato em cada narina uma vez ao dia.
>
> **Crianças ≥ 12 anos**
> **Dose usual para rinite:**
> Aplicar 2 jatos (27,5 mcg/jato) em cada narina uma vez ao dia.

**Cuidados**
> Contraindicado em menores de 2 anos
> Para mais detalhes acesse a bula.

> Nota verbatim: no app o texto aparece como "até controle dossintomas" (sem espaço) — corrigido aqui para legibilidade como "dos sintomas"; original com erro de espaçamento.

---

### Koide D (Kóide D®) — dexclorfeniramina + betametasona

- **Rota:** índice de busca aponta "Kóide D®" → `/pediatra/corticoides/dexametasona`; **dispatcher renderiza a tela `Iz`** (associação betametasona + anti-histamínico). Ver FLAG da categoria.
- **Inputs:** nenhum (tela estática, sem peso e sem seletor).
- **Empty state:** não se aplica.

**Apresentação**
> Xarope: dexclorfeniramina 2 mg/5 mL + betametasona 0,25 mg/5 mL (Kóide D®)

**Prescrição** (faixas etárias com volumes fixos)
> **Crianças de 2 a 6 anos:** 1,25 a 2,5 mL
> **Crianças de 6 a 12 anos:** 2,5 mL
> **Crianças > 12 anos:** 5 a 10 mL

> FLAG: o bundle traz os volumes por faixa mas **não** explicita a frequência/posologia (ex.: quantas vezes ao dia) no trecho capturado — apenas o volume por faixa etária. Verificar em runtime se há sufixo de frequência.

**Cuidados**
> Contraindicado em menores de 2 anos
> Para mais detalhes acesse a bula.

---

## Notas de fidelidade / FLAGS consolidadas

1. **Listagem da categoria Corticóides ≠ rotas reais.** A grade visível mostra 5 itens (Prednisona, Dexametasona, Hidrocortisona, Metilprednisolona, Budesonida); o roteamento real tem 7 rotas + 2 labels de marca (Kóide®, Kóide D®). Prednisolona e Fluticasona NÃO aparecem na grade mas têm tela própria.
2. **Kóide®** = tela de Prednisona (elixir 0,1 mg/mL). **Kóide D®** = tela própria (dexclorfeniramina + betametasona), apesar de a rota de busca apontar para `/dexametasona`. **Dexametasona pura** = tela Iw (6 apresentações).
3. **Glicerina** é o único laxativo com cálculo por peso; os outros 4 laxativos são estáticos. **Budesonida e Fluticasona** (corticóides) não usam peso. **Koide D** não usa peso.
4. Todos os `[valor calculado]` derivam do Peso (kg) informado, com os fatores e arredondamentos documentados em cada template. Valores não calculados aqui (são exibidos como lacuna no bundle minificado).
5. Macrogol 3350 não exibe bloco "Apresentação" (vai direto a doses por g/kg).
