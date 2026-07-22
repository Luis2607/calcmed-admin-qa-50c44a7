---
tipo: concept
atualizado: 2026-06-21
fontes:
  - raw/func-01-antiterm-aine.md
  - raw/func-02-antiemetico-antiespasmodico.md
  - raw/func-03-antihistaminicos.md
  - raw/func-04-broncodilatadores.md
  - raw/func-05-laxativos.md
  - raw/func-06-corticoides.md
  - raw/func-07-antibioticos-A-C.md
  - raw/func-08-antibioticos-G-V.md
  - _source/main.decoded.js
relacionado:
  - 00_ARQUITETURA_INFORMACAO.md
  - gap-figma-vs-asis.md
  - 01_FLUXOS_IA.md
  - raw/05b-sinais-vitais-normais-tabela.md
status: vigente
---

# Modelo de dose pediátrica (AS-IS) — os arquétipos de cálculo

> Síntese transversal dos 8 `func-*.md`. Foco na COMPUTAÇÃO: arquétipo, fórmula, fatores, concentrações, tetos, faixas etárias e inputs de cada droga do Modo Pediatria. Fórmulas transcritas verbatim do bundle Flutter (`_source/main.decoded.js`); onde os verificadores marcaram incerteza ou bug, a flag foi preservada. Insumo direto para a definição dos JSONs do backend/admin (Gui) e para a revisão clínica (Gustavo).

## 1. Resumo

O motor de dose pediátrico do CalcMed cobre **64 drogas** (6 antitérmicos/AINE, 7 antieméticos/antiespasmódicos, 7 antihistamínicos, 8 broncodilatadores, 5 laxativos, 8 corticóides, 14 antibióticos A–C, 9 antibióticos G–V). Todas essas 64 prescrições reduzem-se a **7 arquétipos de cálculo** (`dosing_type`):

`peso-computado` · `faixa-etaria-lookup` · `hibrido` · `fixo` · `infusao-bic` · `ataque-manutencao` · `so-aviso`.

A ideia central: **o motor não precisa de 64 lógicas — precisa de 7 motores de arquétipo.** A maioria esmagadora das telas é ou (a) uma fórmula linear `fator × peso` com teto opcional (`peso-computado`), ou (b) uma tabela de strings fixas selecionadas por faixa etária ou de peso, sem nenhuma aritmética (`faixa-etaria-lookup`). O terceiro mais comum, `hibrido`, é só a combinação dos dois: uma fórmula `fator × peso` gateada/ramificada por idade, indicação, gestação ou apresentação. Os outros quatro arquétipos são caudas raras (1–3 drogas cada).

Notas estruturais que valem para o motor inteiro:
- **Peso** é `this.a`/`this.b`/`j.d`/`P` no bundle; **idade** é `this.a` com unidade no dropdown `selectAge` (`c.b`). A leitura de `c.b` aparecia divergente entre arquivos de extração (func-01 documentou `1=Meses, 2=Anos`; func-02 documentou `1=Anos, 2=Meses`). **F-09 RESOLVIDA (QA R1, ver `admin-spec/qa/` / D-B):** era ruído de extração, não bug — no bundle a semântica `Meses=1 / Anos=2` é uniforme, sem inversão. Não bloqueia a modelagem dos JSONs (ver §8, F-09).
- Empty state global: `Informe todos os dados para obter o resultado.` (`u.y`), quando `isDataValid` é falso (peso e/ou idade nulos).
- `B.e.t(expr, n)` = arredonda para `n` casas. `B.l.t(B.e.ae(x), 0)` / `B.e.T` = floor/round-int. `A.b(x)` = número CRU (sem arredondar) — algumas telas exibem dose sem arredondamento (flag de paridade).
- Tetos: quase todos os tetos clínicos exibidos são **texto**, NÃO clamps numéricos no código. Onde há clamp real (`if(x>T)x=T`), está anotado droga a droga.

---

## 2. Os arquétipos de dosagem (clusters)

Ordenados do mais comum ao menos comum.

> **Nota de contagem (importante, evita confusão):** existem DUAS contagens por arquétipo, ambas somando 64, porque a classificação é uma dupla-classificação consciente:
> - **§2 (primária, didática):** agrega Dipirona em `faixa-etaria-lookup` e os antibióticos com ramos-de-idade em `peso-computado` → 18 / 17 / 16 (peso-computado / faixa-etaria-lookup / hibrido).
> - **§3 (canônica, por `dosing_type` da tabela mestre):** conta cada linha pelo seu `dosing_type` final → **20 / 19 / 21**.
>
> **A contagem CANÔNICA é a da tabela mestre §3: 64 drogas distribuídas em 7 arquétipos (20 · 19 · 21 · 2 · 1 · 1 · 0).** Os números 18/17/16 abaixo são a leitura agregada de §2; não são um total alternativo nem um erro.

### 2.1 `peso-computado` — 18 drogas na leitura agregada de §2 (20 no `dosing_type` canônico §3; o mais comum)

**Definição:** uma ou mais fórmulas lineares `dose = fator × peso`, opcionalmente com teto (`if(dose>T) dose=T`) e/ou seletor de apresentação que troca o fator/concentração. NÃO há gating por idade que altere o ramo (idade pode ser só rótulo de texto). Inputs sempre incluem Peso; às vezes só Peso.

**Estrutura-padrão:**
```
volume_mL = (dose_mg_por_kg × peso) ÷ concentracao_mg_por_mL   // = fator × peso
if (volume_mL > teto) volume_mL = teto
output = round(volume_mL, casas)
```

**Drogas:** Paracetamol, Escopolamina, Hidroxizina, Glicerina, Sulfato de Magnésio, Prednisona, Prednisolona, Hidrocortisona, Metilprednisolona, Acetilcefuroxima, Amoxicilina, Cefepima, Ceftriaxone, Cefuroxima, Gentamicina, Meropenem, Metronidazol, Secnidazol, Vancomicina, Penicilina G Cristalina.
> (Gentamicina/Meropenem/Metronidazol/Vancomicina/Pen. G Cristalina têm ramos por idade gestacional/idade, mas a aritmética é sempre `fator × peso`; os verificadores os classificaram como `peso-computado` com ramos, não `hibrido`.)

**Exemplos de fórmula literal (verbatim):**
- **Hidroxizina** (byte 4937533): `o = p*0.35; if(o>14)o=14; p*=0.7; if(p>28)p=28; → "Dar "+o+" mL ("+p+" mg) VO de 8/8 horas."` (mL = peso×0.35 teto 14; mg = peso×0.7 teto 28).
- **Glicerina** (handler `A.dwE`): `r.d = peso*10; r.e = peso*20; → "Solução Glicerinada 12% - Fazer "+B.e.t(j.d,0)+" mL a "+B.e.t(j.e,0)+" mL (10 a 20 mL/kg) via retal uma vez ao dia."` (sem teto).
- **Sulfato de Magnésio** (controller `dG3.$1`): `r.d = peso*0.5; if(r.d>20)r.d=20; r.r = peso*0.1; if(r.r>4)r.r=4; r.e = 50-r.d; r.f = 2*r.d` (10% ≤ 20 mL; 50% ≤ 4 mL).
- **Cefepima** (verificado): `gHc = 50*peso; vol1000 = dose*11.4/1000; vol2000 = dose*11.4/2000; diluente FIXO 50 mL`.
- **Secnidazol:** `vol = peso × 1` mL (30 mg/kg ÷ 30 mg/mL = fator 1), teto 66 mL/dose.

### 2.2 `faixa-etaria-lookup` — 17 drogas na leitura agregada de §2 (19 no `dosing_type` canônico §3)

**Definição:** NÃO há aritmética. O app seleciona uma **string de dose fixa** de uma tabela, indexada por faixa etária OU por faixa de peso textual. A maioria sequer tem campo de input — são telas estáticas (`new A.az(prefixo, dose, sufixo)` dentro de `A.a([...])`). Coeficientes mg/kg ou g/kg que aparecem são **texto literal**, não computados.

**Estrutura-padrão:**
```
tabela = [ {faixa, dose_texto, frequencia, max_texto},... ]
linha = selecionar por (faixa_etaria) ou (faixa_peso)   // NÃO computa
output = linha.dose_texto
```

**Drogas:** Cetirizina, Dexclorfeniramina, Desloratadina, Fexofenadina, Loratadina, Ebastina, Simeticona, Abrilar, Fenoterol, Brometo de Ipratrópio, Montelucaste, Lactulose, Macrogol 3350, Hidróxido de magnésio, Óleo mineral, Budesonida, Fluticasona, Koide D, Mebendazol. (Dipirona é lookup por PESO — ver nota.)
> ⚠️ **Dipirona** é `faixa-etaria-lookup` mas a indexação é por **faixa de PESO** (6 faixas), não idade — idade só gateia contraindicação. Mantida neste cluster por ser lookup de string fixa sem aritmética.

**Exemplos de tabela literal (verbatim):**
- **Desloratadina:** `6–11 meses → 1 mg = 2 mL ou 16 gotas VO 1x/dia` · `1–5 anos → 1,25 mg = 2,5 mL ou 20 gotas` · `6–11 anos → 2,5 mg = 5 mL ou 40 gotas` · `>12 anos → 5 mg = 10 mL ou 80 gotas`.
- **Dipirona** (por faixa de peso): `>=5 && <9 kg → 2 a 5 gotas / 1,25 a 2,5 mL / 0,1 a 0,2 mL injetável (6/6h)`; … `>=46 && <53 kg → 15 a 35 gotas / 8,75 a 17,5 mL / 0,8 a 1,8 mL`; `>=53 kg → "Avalie dose para adultos"`; `<3 meses OU peso<5 → "Contraindicado Dipirona"`.
- **Lactulose:** `Lactentes → 5 mL/dia` · `1–5 anos → 5 a 10 mL/dia` · `6–12 anos → 10 a 15 mL/dia` · `>12 anos → 15 a 30 mL/dia`.

### 2.3 `hibrido` — 16 drogas na leitura agregada de §2 (21 no `dosing_type` canônico §3)

**Definição:** combina `peso-computado` (fórmula `fator × peso`) COM `faixa-etaria-lookup` (gating/ramo). Tipicamente: um gate de idade que decide se calcula ou exibe "Contraindicado"; OU um seletor de apresentação que troca o fator; OU faixas (etária / gestacional / por indicação) onde só alguns ramos computam e outros são texto fixo.

**Estrutura-padrão:**
```
if (gate_idade falso) → "Contraindicado <droga>"
else:
  ramo = selecionar por (idade | apresentacao | indicacao | IG)
  if (ramo computa) volume = min(fator_do_ramo × peso, teto_do_ramo)
  else              output = ramo.texto_fixo
```

**Drogas:** Ibuprofeno, Cetoprofeno, Nimesulida, Diclofenaco (órfão), Bromoprida, Ondansetrona, Dimenidrato, Acebrofilina, Dexametasona, Albendazol, Amicacina, Amox+Clavulanato, Amox+Sulbactam, Ampicilina, Ampi+Sulbactam, Azitromicina, Cefalexina, Claritromicina, Penicilina G Benzatina, Penicilina Procaina.

**Exemplos de fórmula/ramo literal (verbatim):**
- **Ibuprofeno** (gate `isAgeOver6Months` `gadA` = `(Meses && age>=6) || (Anos && age>=1)`; senão "Contraindicado Ibuprofeno"): `50 mg/mL: min = min(peso,40), max = peso>=40 ? 20 : peso*2` (0 casas); `100 mg/mL: min(peso,20)`; `200 mg/mL: min = (peso/4>=10)?10:floor(peso/4), max = (peso/2>=10)?10:peso/2`.
- **Dexametasona** (`aGo` injetável 2 mg/mL): `Anti-inflamatória: peso*0.01 a peso*0.15 mL; Asma: peso*0.3 mL; Crupe: peso*0.3 mL; Meningite: peso*0.075 mL` (apresentação troca o template entre `aGo/aGp/aGn/aGm`).
- **Penicilina G Benzatina:** lookup por peso `≤27 kg → 600.000 UI DU; >27 kg → 1.200.000 UI DU` + ramo computado sífilis `dose UI = 50.000 × peso` (teto 2.400.000 UI/dose).

### 2.4 `fixo` — 2 drogas

**Definição:** dose única literal, independe de peso E idade. Sem input, sem cálculo, sem faixa.

**Drogas:** Colidis®, Salbutamol.

**Exemplos literais:**
- **Colidis®:** `Dar 5 gotas via oral uma vez ao dia.` (cuidado verbatim: "Dose independe do peso e da idade.").
- **Salbutamol:** regimes fixos — `Nebulização crise: 0,5 mL + 2,5 mL SF 0,9%, 20/20 min por 1h`; `Spray manutenção: 1 a 2 puffs até 4x/dia`. Sem faixas etárias.

### 2.5 `infusao-bic` — 1 droga

**Definição:** infusão contínua em bomba (BIC). Inputs múltiplos (peso + dose desejada mcg/kg/min + vazão desejada mL/h); converte mcg/kg/min ↔ mL/h via getters encadeados; calcula volume 24h, concentração, diluente complementar.

**Droga:** Terbutalina.

**Getters literais (verbatim, eq. `BB.prototype`):**
```
gNb  (volume 24h)         = b * a * 1440 / 500       // b=vazão, a=peso
gDy  (concentração mcg/mL)= gNb * 500 / (24 * c)     // c=vazão desejada
gaw1 (vol SG complementar)= gE2 - gNb
gaeA (limite superior mL) = peso * 0.08
gEm  (limite inferior mL) = peso * 0.04
```
Tetos: dose máx 5 mcg/kg/min; concentração máx 1.000 mcg/mL. Empty state `peso < 1`.

### 2.6 `ataque-manutencao` — 0 drogas (arquétipo reservado)

**Definição:** dose de ataque seguida de dose de manutenção distintas (padrão clássico de antiarrítmico/anticonvulsivante).

**Drogas:** **nenhuma** nas 8 categorias de Pediatria sintomáticos+antibióticos cobertas por estes `func-*.md`. O arquétipo existe no taxonomia geral do projeto, mas neste recorte (sintomáticos + antibióticos) não há ocorrência — os esquemas multi-fase que aparecem (ex.: Azitromicina Dia1 vs Dia2-5; Macrogol desimpactação→manutenção) são modelados como ramos de `hibrido`/`faixa-etaria-lookup`, não como ataque+manutenção formal. Provavelmente aparece nas Urgências (`raw/03*`) e Diluições/Vasoativas (`raw/04`), fora do escopo deste documento.

### 2.7 `so-aviso` — 1 droga

**Definição:** sem inputs, sem cálculo, sem dose. Renderiza apenas "Cuidados"/aviso clínico.

**Droga:** Metoclopramida.

**Conteúdo literal:** "Cuidados" — evite em crianças; risco de Discinesia Tardia irreversível. Nada a computar.

---

## 3. Tabela mestre — droga → dosing_type → fórmula → faixas → dose máxima → arquivo

> Fórmula "resumida"; íntegra verbatim no arquivo func indicado. `peso` em kg. "Texto" = teto/contra exibido como string, não clampado no código.

| # | Droga | dosing_type | Fórmula resumida | Faixas / gates | Dose máxima | Arquivo |
|---|---|---|---|---|---|---|
| 1 | Dipirona | faixa-etaria-lookup (por peso) | 6 faixas peso → strings fixas | <3m/peso<5 = contra; ≥53 = adulto | texto por faixa | func-01 |
| 2 | Paracetamol | peso-computado | gotas min(peso,35); x32 peso×13/32; x100 peso×0.13 | sem gate (só peso) | gotas 35/dose (clamp real) | func-01 |
| 3 | Ibuprofeno | hibrido | 50: min(peso,40)/max; 100: min(peso,20); 200: floor(peso/4)/(peso/2) | gate ≥6m/≥1a | tetos 40/20/10 (clamp) | func-01 |
| 4 | Cetoprofeno | hibrido | xarope sempre peso×0.5; gotas por faixa (peso/25/50) | <12m/<1a = contra | — | func-01 |
| 5 | Nimesulida | hibrido | min(peso,40) gotas 12/12h | gate ≥12a | 40 gotas/dose (clamp) | func-01 |
| 6 | Diclofenaco (órfão) | hibrido | min=peso; max=min(peso×4,300) | gate ≥1a | 300 gotas/dia (clamp) | func-01 |
| 7 | Bromoprida | hibrido | gotas peso..peso×2 (≤58); xarope peso/6..peso/3 (≤10); inj peso×0.1..×0.2 (≤2) | gate ≥1a; <1a = contra | gotas 58, xarope 10mL, inj 10mg (texto) | func-02 |
| 8 | Metoclopramida | so-aviso | — | — | — | func-02 |
| 9 | Ondansetrona | hibrido | inj peso×0.075 (≤2); diluição = 20−calc | ≥1m = inj; ≥2m(Meses) = oral+filme | inj 4 mg/dose (texto) | func-02 |
| 10 | Dimenidrato | hibrido | wl20≤20, wl40≤40, w125=peso×1.25/3 (≤100), w12550=peso×1.25/50 (≤6) | <2a contra; 2–6a; 6a+ | xarope 30/60mL, gotas 60/120, inj 300mg (texto) | func-02 |
| 11 | Escopolamina | peso-computado | <3m peso×3; 3–11m peso×1.4; 1–6a peso×0.6..peso; EV peso×0.015..0.03 | ramos por idade = rótulo, sem gate | nenhum clamp; máx EV cru peso×0.075 | func-02 |
| 12 | Simeticona | faixa-etaria-lookup | doses fixas por faixa | Lactentes; até 12a | 240 / 480 mg/dia (texto) | func-02 |
| 13 | Colidis® | fixo | 5 gotas VO 1x/dia | — | — | func-02 |
| 14 | Cetirizina | faixa-etaria-lookup | strings fixas por faixa (2 apresentações) | 6m–12a | sem teto | func-03 |
| 15 | Dexclorfeniramina | faixa-etaria-lookup | strings fixas; "1 gota/2kg" = texto | 2–6a, 6–12a, ≥12a | 7,5/15/30 mL/dia (texto) | func-03 |
| 16 | Desloratadina | faixa-etaria-lookup | strings fixas por faixa | 6m+ | — | func-03 |
| 17 | Fexofenadina | faixa-etaria-lookup | strings fixas; gate 10,5kg = só texto | 6m–2a, 2–11a | — | func-03 |
| 18 | Hidroxizina | peso-computado | mL=peso×0.35 (≤14); mg=peso×0.7 (≤28) | bula ≥6m (texto) | 14 mL / 28 mg (clamp) | func-03 |
| 19 | Loratadina | faixa-etaria-lookup (por peso, texto) | <30kg = 5mL; ≥30kg = 10mL (strings fixas) | bula ≥2a | — | func-03 |
| 20 | Ebastina | faixa-etaria-lookup | strings fixas por faixa | 2–5a, 6–11a, >12a | — | func-03 |
| 21 | Acebrofilina | hibrido | 2–3a: mL=peso×0.2 (cru), mg=peso; 3–6a/6–12a fixos | gate ≥2a | — | func-04 |
| 22 | Abrilar | faixa-etaria-lookup | até 7a: 2,5mL; >7a: 5mL 3x/dia | até/acima 7a | — | func-04 |
| 23 | Fenoterol | faixa-etaria-lookup | gotas range fixo VO + neb | até 1a/1–6a/6–12a; <22kg=rótulo | — | func-04 |
| 24 | Brometo de Ipratrópio | faixa-etaria-lookup | gotas range fixo por faixa/regime | até 6a/6–12a | — | func-04 |
| 25 | Montelucaste | faixa-etaria-lookup | sachê/comp fixos por faixa | ≥6m / 2–5a / 6–14a | — | func-04 |
| 26 | Salbutamol | fixo | regimes fixos (neb/spray) | — | — | func-04 |
| 27 | Sulfato de Magnésio | peso-computado | 10%: peso×0.5 (≤20)+SF(50−d); 50%: peso×0.1 (≤4) | — | 2 g; conc 60 mg/dL (texto, FLAG unidade) | func-04 |
| 28 | Terbutalina | infusao-bic | gNb=vazão×peso×1440/500; gEm=peso×0.04; gaeA=peso×0.08 | peso<1 = empty | 5 mcg/kg/min; conc 1.000 mcg/mL | func-04 |
| 29 | Glicerina | peso-computado | peso×10 a peso×20 mL (10–20 mL/kg) | sem gate idade | nenhum | func-05 |
| 30 | Lactulose | faixa-etaria-lookup | mL/dia fixos por faixa | Lactentes…>12a | — | func-05 |
| 31 | Macrogol 3350 | faixa-etaria-lookup | g/kg como texto, NÃO computa | <2a contra (texto) | 17 / 100 g/dia (texto) | func-05 |
| 32 | Hidróxido de magnésio | faixa-etaria-lookup | mL fixos por faixa | <2a contra; 2–5a…>12a | — | func-05 |
| 33 | Óleo mineral | faixa-etaria-lookup | mL fixos + 1–3 mL/kg texto | <6a contra; 6–11a; >12a | 90 mL/dia (texto) | func-05 |
| 34 | Prednisona (Kóide®) | peso-computado | peso×0.17 a peso×2.5 mL VO/dia | gate if(peso>0) | nenhum | func-06 |
| 35 | Prednisolona | peso-computado | 1mg/mL: peso×0.1..×2; 3mg/mL: peso×0.03..×0.67; gotas 11mg/mL: peso×0.2..×3.6 | seletor 3 apresentações | nenhum | func-06 |
| 36 | Dexametasona | hibrido | 4 templates × 4 indicações (ex. inj 2mg/mL: peso×0.01..0.15 / asma peso×0.3) | seletor 6 apresentações | 16mg/160mL/10mg (texto) | func-06 |
| 37 | Hidrocortisona | peso-computado | 100mg: peso×0.0112..0.16 / choque peso×0.04; 500mg: peso×0.0048..0.064 / peso×0.016 | seletor 2 frascos | choque 100 mg (texto) | func-06 |
| 38 | Metilprednisolona | peso-computado | 40mg: peso×0.00275..0.04; 125/500mg: peso×0.00176..0.0256 | seletor 3 frascos | nenhum | func-06 |
| 39 | Budesonida | faixa-etaria-lookup | doses fixas por jato (controller fixa weight:0) | ≥6 anos | 256 / 400 mcg/dia (texto) | func-06 |
| 40 | Fluticasona (Avamys®) | faixa-etaria-lookup | jatos fixos por faixa | <2a contra; ≥2a; ≥12a | — | func-06 |
| 41 | Koide D® | faixa-etaria-lookup | volume fixo por faixa | <2a contra; 2–6a; 6–12a; >12a | — | func-06 |
| 42 | Acetilcefuroxima | peso-computado | 10mg/kg: peso×0.2; 15mg/kg: peso×0.3 (50 mg/mL) | >3 meses (texto) | 500 / 1.000 mg/dia (texto) | func-07 |
| 43 | Albendazol | hibrido | fixo por indicação; Cisticercose computa peso×0.1875 (≤15mL) | ≥2a/<2a = rótulo | Cistic. 15 mL/dose (clamp) | func-07 |
| 44 | Amicacina | hibrido | mg=fator×peso; mL=mg/conc (50/125/250 mg/mL) | ramos IG/idade/SNC (neonato) | sem teto numérico | func-07 |
| 45 | Amoxicilina | peso-computado | padrão 250: peso×0.267..0.33; alta 250: peso×0.8..0.9 (etc.) | ≥3 meses (texto) | tetos mL/dose por apr. (texto) | func-07 |
| 46 | Amox+Clavulanato | hibrido | op0: min(peso×0.33,20); op3 inj: min(peso×2.5,100) gate idade | ≥2m; op3 ≤28d/>28d/≥12a | tetos por apr. (FLAG op1 10vs20) | func-07 |
| 47 | Amox+Sulbactam | hibrido | VO op0 ≈ peso×0.1..0.25; injetáveis não desdobrados | seletor + faixa idade | 5 mL/dose op0 (texto) | func-07 |
| 48 | Ampicilina | hibrido | VO peso×0.25..0.5; inj 500mg = mg×3.4/500; 1000mg = mg×3.4/1000 | NÃO neonatal | EV 12 g/dia; 10 mL/dose VO | func-07 |
| 49 | Ampi+Sulbactam | hibrido | expansão por apr. (1g+0,5g→4,1mL; 2g+1g→8,4mL); fatores não desdobrados | RN prematuro/termo/lactentes | conc ≤45 mg/mL | func-07 |
| 50 | Azitromicina | hibrido | VO mL=mg/40 (10mg/kg=peso×0.25); EV aspirar peso×0.1 + diluir peso×10 | seletor VO/EV × multi-indicação | 500 mg/dose VO (teto 12,5 mL) | func-07 |
| 51 | Cefalexina | hibrido | 250: peso×0.125..0.25 (6/6h); 500: peso×0.0625..0.125; por gravidade | seletor 250/500 mg/5mL | tetos mL/dose por linha (texto) | func-07 |
| 52 | Cefepima | peso-computado | dose=50×peso; vol=dose×11.4/conc; diluente 50 mL | NÃO neonatal | EV 2 g/dose (texto) | func-07 |
| 53 | Ceftriaxone | peso-computado | EV peso×0.5..1.0 mL; IM peso×0.2..0.4 mL (50–100 mg/kg) | RN: EV 60 min | — | func-07 |
| 54 | Cefuroxima | peso-computado | mg=33.33/50/35/66.67×peso; IM mg×3.5/750; EV mg×8.6/750 | NÃO neonatal | EV 6 g/dia (texto) | func-07 |
| 55 | Claritromicina | hibrido | 25mg/mL: peso×0.3; 50mg/mL: peso×0.15; EV = só aviso <18a | seletor 3 apr. | 500 mg/dose (texto) | func-07 |
| 56 | Gentamicina | peso-computado | (mg/kg×peso)÷conc (10/20/40 mg/mL); ramos IG/idade | seletor 4 apr.; neonato | sem teto numérico | func-08 |
| 57 | Mebendazol | faixa-etaria-lookup | mL fixos por indicação (sem peso) | <2a contra | — | func-08 |
| 58 | Meropenem | peso-computado | aspirar=mg/50; 20mg/kg=0.4×peso; 40mg/kg=0.8×peso | ramos IG/idade/peso/SNC | 1 g (geral) / 2 g (meningite) | func-08 |
| 59 | Metronidazol | peso-computado | VO ÷40 (Giard. peso×0.125); EV ÷5 (apendic. peso×2); Tricom. lookup peso | indicação; CI neonatal | 6,25–18,75 mL VO; 100 mL EV /dose | func-08 |
| 60 | Penicilina G Benzatina | hibrido | lookup UI por peso (≤27kg=600.000) + sífilis 50.000×peso | infecção / profilaxia / sífilis | 2.400.000 UI/dose; 8 mL/dose | func-08 |
| 61 | Penicilina G Cristalina | peso-computado | UI/kg×peso (a1=50.000P; a2=100.000P; a3=300.000P; a4=33.333P); diluir UI/50.000 | ramos idade/indicação | 20–24 M UI/dia; 480 mL/dia | func-08 |
| 62 | Penicilina Procaina | hibrido | UI/kg÷200.000 (usual 0.25×peso); Difteria lookup peso | usual/sífilis/antraz/difteria | 1.200.000–2.400.000 UI/dia | func-08 |
| 63 | Secnidazol | peso-computado | peso×1 mL (30 mg/kg ÷ 30 mg/mL) | CI neonatal | 66 mL/dose | func-08 |
| 64 | Vancomicina | peso-computado | aspirar=mg/50 (15mg/kg=0.3×peso)+diluente 2.7×peso; ramos | seletor 2 apr.; ramos IG/idade | 2–3,6 g/dia; conc 5 mg/mL | func-08 |

**Contagem por arquétipo (CANÔNICA — por `dosing_type` da tabela mestre):** `peso-computado` 20 · `faixa-etaria-lookup` 19 · `hibrido` 21 · `fixo` 2 · `infusao-bic` 1 · `so-aviso` 1 · `ataque-manutencao` 0. **Total = 64.** (A leitura agregada de §2 — 18 / 17 / 16 — agrega Dipirona em lookup e os antibióticos com ramos-de-idade em peso-computado, conforme os verificadores; é a mesma população de 64 drogas, só com fronteiras de cluster diferentes. Ver a "Nota de contagem" no topo da §2.)

---

## 4. Faixas etárias — dicionário

Todos os limiares de idade usados nos gates do bundle e o que cada um gateia. Unidade no dropdown `selectAge` (`c.b`) é uniforme `Meses=1 / Anos=2` (ver §1 e F-09, resolvida — não há inversão).

| Limiar / faixa | Getter (onde houver) | O que gateia | Drogas |
|---|---|---|---|
| < 3 meses | `isAgeLess3Months` (`gawZ`) | "Contraindicado Dipirona" (ou peso<5) | Dipirona |
| ≥ 3 meses | — (texto) | "doses para crianças > 3 meses" | Acetilcefuroxima, Amoxicilina, Pneumonia atípica (Claritro) |
| < 1 mês / ≥ 1 mês | `isAgeOver1Month` (`gax3`), `isAgeLess1Month` (`gawW`) | abre bloco injetável; senão aviso pós-operatório | Ondansetrona |
| ≥ 2 meses | — (texto) | VO ≥ 2 meses | Amox+Clavulanato |
| ≥ 6 meses | `isAgeOver6Months` (`gadA`) | calcula (senão "Contraindicado") | Ibuprofeno; bula: Desloratadina/Fexofenadina/Hidroxizina/Montelucaste granulado |
| < 6 meses | `gax_` (isAgeLess6months) | reforça contra Cetoprofeno | Cetoprofeno |
| < 1 ano / ≥ 1 ano | `isAgeOver1Year` (`gax4`), `isAgeLess1Year` (`gawX`), `gady`, `gax0` | calcula (senão "Contraindicado"); limiar Anos lido como `>=12` ⚠️ | Bromoprida, Cetoprofeno, Diclofenaco |
| < 2 anos / ≥ 2 anos | `isAgeLess2Years` (`gawY`), `isAgeOver2Years` (`gax5`) | contra <2a; abre oral/filme | Dimenidrato, Ondansetrona; CI texto: Macrogol/Hidróxido/Mebendazol/Fluticasona/Koide D; bula Cetirizina/Loratadina/Ebastina/Dexclorfeniramina |
| 2 a 6 anos | `isAgeOver2YearsLess6` (`gax6`) | bloco faixa 2–6a | Dimenidrato; lookup: Hidróxido, Koide D, Ebastina(2–5) |
| > 1 e < 7 anos | `gax2` (isAgeOver1Less7Years) | gotas Cetoprofeno = round(peso) | Cetoprofeno |
| ≥ 6 anos / 6–12 anos | `isAgeOver6Years` (`gax7`), `gax8` (7–11a) | bloco faixa 6a+; gotas Cetoprofeno fixas | Dimenidrato, Cetoprofeno; lookup: Budesonida ≥6a, Fenoterol/Ipratrópio 6–12a, Óleo mineral 6–11a |
| < 6 anos | — (texto/cautela) | CI Óleo mineral; cautela Escopolamina | Óleo mineral, Escopolamina |
| ≥ 12 anos / > 12 anos | `isAgeOver12years` (`gadz`), `gax1` | calcula (senão "Contraindicado"); gotas Cetoprofeno = 50 | Nimesulida (≥12a), Cetoprofeno; lookup ≥12a Dexclorfeniramina/Ebastina/Fluticasona/Koide D/Lactulose/Hidróxido |
| < 18 anos | — (texto) | "Uso EV não indicado <18 anos" (só aviso) | Claritromicina EV |
| **Neonato — idade gestacional (IG)** | — (faixas literais) | troca dose mg/kg e intervalo | Amicacina, Gentamicina, Meropenem, Pen. G Cristalina, Vancomicina |
| → IG < 30 sem / 30–34 / ≥35 sem | — | esquemas neonatais Amicacina/Gentamicina | Amicacina, Gentamicina |
| → IG < 32 sem / ≥ 32 sem | — | Meropenem neonato | Meropenem |
| → ≤ 29 sem / 29–35 / >35 sem | — | Vancomicina neonato | Vancomicina |
| → dias de vida ≤7 / >7 / ≤10 / ≤14 / >14 / 8–60d / 11–60d | — | sub-ramo dose/intervalo dentro da IG | Amicacina, Gentamicina, Meropenem, Pen. G Cristalina, Vancomicina |
| **Neonato SNC — gating por peso ≤2 kg / >2 kg** | — | troca dose meningite neonatal | Meropenem, Vancomicina |
| "período neonatal" (CI) | — (texto) | "doses não indicadas p/ período neonatal" | Ampicilina, Metronidazol, Secnidazol, Cefepima(NÃO neonatal), Cefuroxima |

**Cruzamento com Sinais Vitais (`raw/05b`):** a tabela de Sinais Vitais usa faixas **rotuladas, não numéricas alinhadas** aos gates de dose — `Neonatos / Bebê / 1ª Infância / Idade pré-escolar / Idade escolar / Adolescente` (FC, FR) e `Nascimento / Neonato 96h / Bebê 1–12m / 1ª Infância 1–2a / pré-escolar 3–5a / escolar 6–9a / pré-adolescente 10–12a / adolescente 12–15a` (PA). **Não há mapeamento 1:1** entre essas faixas nominais e os limiares de dose (que são em meses/anos/IG/dias-de-vida). Para a Nova Home V2, se quiser reusar os números de Sinais Vitais no mesmo motor de idade, será preciso uma tabela de conversão `faixa nominal → intervalo etário numérico` — hoje a tela de Sinais Vitais é uma imagem JPG (não estruturada), e os gates de dose não a consultam.

---

## 5. Padrões de inputs por arquétipo

| dosing_type | Inputs típicos | Observações |
|---|---|---|
| `peso-computado` | **Peso** (kg) sempre; **Apresentação** (select) quando há frascos/concentrações; **Idade** só quando há ramos neonatais (IG/dias de vida) | Paracetamol/Escopolamina/Hidroxizina/Glicerina/Secnidazol = **só Peso**. Antibióticos com select de frasco (Cefepima, Gentamicina, Meropenem, Vancomicina, Prednisolona, Hidrocortisona, Metilprednisolona, Dexametasona). Ramos neonatais (Amicacina, Gentamicina, Meropenem, Pen.G Cristalina, Vancomicina) pedem IG + dias de vida — **hoje o app expõe como rótulos de texto que o usuário lê e escolhe, não como input numérico de IG**. |
| `faixa-etaria-lookup` | Em geral **nenhum input** (tela estática); Dipirona é exceção (pede Peso + Idade) | A faixa é selecionada pelo usuário lendo a tabela, NÃO por input. Coeficientes mg/kg/g/kg exibidos são texto. |
| `hibrido` | **Peso** + **Idade(+unidade Meses/Anos)** (gate); OU **Peso** + **Apresentação** (select); frequentemente os três | Gate de idade decide calcular vs "Contraindicado". Select de apresentação troca o fator/concentração. Indicação às vezes é ramo implícito (todos exibidos). |
| `fixo` | **nenhum** | Dose literal única. |
| `infusao-bic` | **Peso** + **Dose desejada** (mcg/kg/min) + **Vazão desejada** (mL/h) | Único arquétipo com 3 inputs numéricos acoplados. |
| `so-aviso` | **nenhum** | Só texto de cuidado. |

Convenções de campo (verbatim do bundle): Peso → label "Peso", placeholder `0.0`, vírgula→ponto, 1–2 casas. Idade → valor numérico + dropdown `selectAge` (Meses/Anos), com regra global "idade em Meses > 12 → converte para Anos". Apresentação → chips/select ("Selecione a apresentação:").

---

## 6. Guard-rails / dose máxima — padrões de teto encontrados

Três padrões distintos. **Crítico para o backend:** distinguir teto-clamp (lógica) de teto-texto (copy).

**A. Teto-clamp real (o código aplica `if(x>T) x=T`):** estes DEVEM virar `min` no motor.
- Paracetamol gotas: `min(peso,35)`.
- Ibuprofeno: 50 mg/mL `min(peso,40)` e max teto 20; 100 mg/mL `min(peso,20)`; 200 mg/mL teto 10.
- Nimesulida: `min(peso,40)`.
- Diclofenaco: max `min(peso×4,300)`.
- Hidroxizina: mL `min(.,14)`, mg `min(.,28)`.
- Bromoprida: gotas ≤58, xarope ≤10, injetável ≤2.
- Ondansetrona: `calc005 ≤ 2`.
- Dimenidrato: wl20≤20, wl40≤40, w125≤100, w12550≤6.
- Sulfato de Magnésio: 10% ≤20 mL, 50% ≤4 mL.
- Albendazol Cisticercose: ≤15 mL.
- Amoxicilina / Amox+Clavulanato / Amox+Sulbactam: `min(fator×peso, teto)` por apresentação (10/6,25/5/40/25/20/100/5 mL conforme apr.).
- Metronidazol: Giardíase ≤6,25; Amebíase ≤18,75; Tricomoníase ≤16,6; EV ≤100 mL/dose.
- Secnidazol: ≤66 mL/dose.

**B. Teto-texto (string exibida, NÃO clampado):** o motor terá que decidir se passa a clampar (mudança de comportamento — **flag clínica**).
- Dexametasona: Máx 16 mg / 160 mL / 10 mg por indicação (texto).
- Hidrocortisona choque: Máx 100 mg (texto).
- Sulfato de Magnésio: 2 g; conc 60 mg/dL (texto, + bug de unidade).
- Terbutalina: 5 mcg/kg/min; 1.000 mcg/mL (texto).
- Penicilina G Cristalina: 20–24 M UI/dia, 480 mL/dia (texto). Benzatina: 2.400.000 UI/dose, 8 mL/dose (texto). Procaina: 1.200.000–2.400.000 UI/dia (texto).
- Meropenem: 1 g / 2 g por indicação (texto). Vancomicina: 2–3,6 g/dia (texto). Cefepima: EV 2 g/dose. Cefuroxima: EV 6 g/dia. Ampicilina: EV 12 g/dia.
- Antihistamínicos lookup: 7,5/15/30 mL/dia, 240/480 mcg/dia etc. (texto).
- Laxativos lookup: Macrogol 17/100 g/dia, Óleo mineral 90 mL/dia (texto).

**C. Sem teto:** Glicerina, Prednisona, Prednisolona, Metilprednisolona, Escopolamina (incl. máx diária sem arredondar), Ceftriaxone, Gentamicina (sem teto numérico).

**Padrão de contraindicação por idade:** dois formatos — (i) gate duro que substitui a prescrição por "Contraindicado <droga>" (Ibuprofeno, Cetoprofeno, Nimesulida, Diclofenaco, Bromoprida, Dimenidrato); (ii) texto de "Cuidados/bula a partir de X" sem bloqueio (maioria dos lookups e antibióticos).

---

## 7. Bugs / flags de fórmula (revisão clínica QA / Gustavo)

> Consolidação de TODAS as inconsistências sinalizadas pelos verificadores nos 8 arquivos. Cada uma: droga · o que está errado · evidência. Seção crítica para revisão clínica antes de modelar os JSONs.

| ID | Droga | Problema | Evidência (verbatim / byte) |
|---|---|---|---|
| F-01 | Paracetamol | Getter nomeado `weightLimitedTo30` (`gaCl`) mas o teto real é **35**, não 30 | `if(r>35)r=35`; texto "máx 35 gotas/dose" (func-01) |
| F-02 | Ibuprofeno 50 mg/mL | Teto do `max` usa gate `peso>=40` mas devolve **20** (não `40*2=80` nem 40) — assimetria min/max | `max = peso>=40 ? 20 : peso*2` (func-01) |
| F-03 | Cetoprofeno | Ambiguidade round vs floor nas gotas faixa `gax2`: doc diz `floor/round(peso)`; só `B.e.t(peso,0)` (round) confirmado | "`floor/round(peso)` (0 casas)"; "Cálculo gotas: `B.e.t(peso,0)`" (func-01) |
| F-04 | Cetoprofeno | Linha do xarope (`peso×0.5`) ainda calcula mesmo quando idade<1a dispara "Contraindicado Cetoprofeno" — prescrição contraditória | gates `gax_`/`gady` + xarope sempre presente (func-01) |
| F-05 | Dimenidrato | Faixa 6a+ grafa o template Dramin B6 DL® **SEM o "+"** entre volume e SF (`{w125} mL 10 mL SF` vs `{w125} mL + 10 mL SF` na faixa 2–6a) | "verbatim: SEM '+' nesta faixa" (func-02) |
| F-06 | Dimenidrato / Ondansetrona | Gates de idade leem `c.b` (unidade) de forma **inconsistente** entre condições: `<2a` aceita Anos OU Meses, mas faixas de prescrição (`gax6`/`gax7`/`gax5`) só disparam com `unit==Meses` → faixas podem nunca renderizar se idade vier em Anos | "as três condições leem `c.b` de formas inconsistentes… possível bug" (func-02) |
| F-07 | Bromoprida | `isAgeOver1Year` usa limiar **`>=12`** quando unidade=Anos (não `>=1`) — depende da conversão meses→anos a 12 para funcionar | `gax4`: `(Anos && age>=12) || (Meses && age>=1)` (func-02) |
| F-08 | Escopolamina | (a) Ramo `< 3 meses` sai com "gotas" **duplicado** (`peso*3+" gotas"` + sufixo `" gotas …"`); (b) ramo `1 a 6 anos` grafa **"gostas"** (typo); (c) máx diária EV/IM/SC sai **sem arredondamento** (`A.b(peso*0.075)`); (d) NENHUM gate de idade — todos os ramos etários aparecem simultaneamente | func-02, notas de fidelidade |
| F-09 | **Global (motor inteiro)** | **RESOLVIDA (QA R1, ver `admin-spec/qa/` / D-B):** era ruído de extração, não bug — no bundle a semântica `c.b` é uniforme `Meses=1 / Anos=2`, sem inversão. A divergência (func-01 `1=Meses,2=Anos` vs func-02 `1=Anos,2=Meses`) foi de transcrição, já reconciliada. **Não bloqueia.** Histórico preservado: func-01 L4 vs func-02 L8 | func-01 L4 vs func-02 L8 |
| F-10 | Hidroxizina | Output usa valor **bruto** (`A.b(o)`/`A.b(p)`) sem `B.e.t` → mL/mg exibidos sem casas fixas (ex.: 10,3 kg → 3.605 mL). Paridade exata exige replicar sem rounding (ou flag p/ corrigir) | byte 4937533 (func-03) |
| F-11 | Loratadina | Bundle grafa **"Peso coroporal ≥ 30 kg"** (typo "coroporal") no 2º item | func-03 |
| F-12 | Fexofenadina | Gate clínico de peso 10,5 kg existe só como **texto** em Cuidados; AS-IS NÃO computa por peso. Promover a `peso-computado` = mudança de comportamento (flag p/ Gustavo) | func-03 |
| F-13 | Acebrofilina | Faixa 2–3a exibe mL = `peso×0.2` **cru** (`A.b`, sem arredondar), enquanto mg = round(peso,0) — inconsistência de rounding na mesma linha | func-04 |
| F-14 | Sulfato de Magnésio | Inconsistência de **unidade**: Cuidados diz conc. máx "60 **mg/dL**" mas a prescrição usa "**mg/mL**" | func-04 |
| F-15 | Dexametasona | 3 comprimidos (0,5/0,75/4 mg) compartilham **1 template** (`aGm`) que calcula em mg — não converte para nº de comprimidos; mesma fórmula p/ as 3 concentrações | func-06 |
| F-16 | Dexametasona / Hidrocortisona | Tetos (16 mg/160 mL/10 mg; choque 100 mg) são **texto**, NÃO clampados — se o motor clampar, é comportamento NOVO | func-06 FLAG 1 |
| F-17 | Budesonida 50/100 mcg | Limite "Até 400 mcg/dia" mas o parêntese repete "(a dose de 256 mcg…)" — copy inconsistente herdado | func-06 FLAG copy |
| F-18 | Koide D® | Frequência por faixa **não capturada** no trecho do bundle (volumes presentes, frequência ausente) — flag runtime | func-06 |
| F-19 | Cefalexina opção 500 mg/5 mL | Exibe resíduo **`(45/6,4 mg/kg/dia)`** herdado de amox-clav — bug de conteúdo (não é cálculo) | func-07 FLAG 3 |
| F-20 | Amox+Clavulanato opção 1 (250+62,5) | Doc exibe "Máx 10 mL/dose" mas cap interno do código é **20** — divergência; usar o menor (10) por segurança e CONFIRMAR | func-07 FLAG 5 |
| F-21 | Amox+Sulbactam VO opção 0 | Fatores `peso×0.1 a peso×0.25` são **regra observada** das named-equations (`weightX01`/`weightX025`), não 100% desdobrados — CONFIRMAR clinicamente | func-07 FLAG 1 |
| F-22 | Amox+Sulbactam / Ampi+Sulbactam injetáveis | Fatores numéricos multiplicativos por gatilho **NÃO desdobrados** (só doses mg/kg/dia, diluições e expansões verbatim) | func-07 FLAG 1 |
| F-23 | Gentamicina | Faixa IG ≥35 sem grafa "`7 dias` → 5 mg/kg" **sem o ">"** — provável ">7 dias" | func-08 FLAG |
| F-24 | Gentamicina | Textos de diluição nas apr. 20 e 40 mg/mL referenciam "Gentamicina 10/20 mg/mL" (inconsistência de origem/copy) | func-08 FLAG |
| F-25 | Meropenem | Neonato ≥32 sem >14d: **aspira `0.6·P`** (= 30 mg/kg) mas exibe rótulo `20*P` mg; dose declarada 30 mg/kg — rótulo de mg destoa do volume | func-08 FLAG |
| F-26 | Penicilina G Cristalina | Doença de Lyme: declarada `33.333–66.666 UI/kg/dose` mas o código **aspira `33.333·P`–`50.000·P`** (limite superior usa a1=50.000, não 66.666) | func-08 FLAG |
| F-27 | Penicilina Procaina | Prescrição **reusa a chave** `penicilina.g.cristalina.prescription` (copy/paste; não afeta texto exibido, mas é acoplamento frágil) | func-08 FLAG |
| F-28 | Vancomicina MRSA grave 3m–12a | Dose-alvo declarada "/dia" mas os valores calculados são **por dose** (divisão 6/6h) — possível ambiguidade /dia vs /dose | func-08 FLAG |
| F-29 | Diclofenaco | Widget funcional mas **órfão**: não listado em `aine`, não navegável no app atual | func-01 |

---

## 8. Proposta de TEMPLATE JSON por arquétipo (para Gui / backend)

> Esboço de schema por `dosing_type`, derivado da estrutura observada no AS-IS. Objetivo: o admin/backend modelar dose com 7 formatos (um por arquétipo) em vez de 64 lógicas ad-hoc. Campos comuns a todos: `id`, `nome`, `dosing_type`, `apresentacoes[]`, `vias[]`, `intervalo`, `contraindicacao_idade`, `cuidados`.

### 8.1 `peso-computado`
```json
{
  "id": "hidroxizina",
  "dosing_type": "peso-computado",
  "inputs": ["peso"],
  "apresentacoes": [
    {
      "id": "xarope-2mgml", "label": "Solução oral (xarope) 2 mg/mL",
      "concentracao_mg_ml": 2,
      "formulas": [
        { "saida": "mL", "fator": 0.35, "casas": null, "teto": 14 },
        { "saida": "mg", "fator": 0.70, "casas": null, "teto": 28 }
      ],
      "intervalo": "8/8h", "via": "VO"
    }
  ],
  "dose_maxima": { "valor": 28, "unidade": "mg", "tipo": "clamp" },
  "contraindicacao_idade": { "texto": "bula a partir de 6 meses", "gate": false },
  "rounding_raw": true,
  "flags": ["F-10: saída sem arredondamento no AS-IS"]
}
```
> Notas: `formula.fator` = `mg_por_kg ÷ concentracao`. `teto` presente ⇒ `min`. `casas: null` = saída crua (paridade Hidroxizina/Escopolamina/Acebrofilina). Para faixa min–max (ex. Glicerina, Prednisona) usar `{ "fator_min": 10, "fator_max": 20 }`.

### 8.2 `faixa-etaria-lookup`
```json
{
  "id": "desloratadina",
  "dosing_type": "faixa-etaria-lookup",
  "inputs": [],
  "indexar_por": "idade",
  "apresentacoes": [
    { "id": "xarope-0.5mgml", "label": "Xarope 0,5 mg/mL" },
    { "id": "gotas-1.25mgml", "label": "Solução gotas 1,25 mg/mL" }
  ],
  "tabela": [
    { "faixa": { "min_meses": 6, "max_meses": 11 }, "dose": "1 mg = 2 mL ou 16 gotas", "frequencia": "1x/dia" },
    { "faixa": { "min_anos": 1, "max_anos": 5 },    "dose": "1,25 mg = 2,5 mL ou 20 gotas", "frequencia": "1x/dia" },
    { "faixa": { "min_anos": 6, "max_anos": 11 },   "dose": "2,5 mg = 5 mL ou 40 gotas", "frequencia": "1x/dia" },
    { "faixa": { "min_anos": 12 },                  "dose": "5 mg = 10 mL ou 80 gotas", "frequencia": "1x/dia" }
  ],
  "contraindicacao_idade": { "texto": "bula a partir de 6 meses", "gate": false },
  "vias": ["VO"]
}
```
> Para Dipirona, trocar `indexar_por: "peso"` e `faixa: { "min_kg": 5, "max_kg": 9 }`. `dose` permanece string (lookup puro).

### 8.3 `hibrido`
```json
{
  "id": "ibuprofeno",
  "dosing_type": "hibrido",
  "inputs": ["peso", "idade"],
  "gate_idade": {
    "regra": "(unidade=Meses E idade>=6) OU (unidade=Anos E idade>=1)",
    "se_falso": { "tipo": "contraindicado", "texto": "Contraindicado Ibuprofeno" }
  },
  "apresentacoes": [
    { "id": "50mgml", "label": "Suspensão gotas 50 mg/mL",
      "formula": { "min": { "fator": 1, "teto": 40 }, "max": { "expr": "peso>=40 ? 20 : peso*2" } },
      "intervalo": "6/8h", "via": "VO" },
    { "id": "100mgml", "label": "100 mg/mL",
      "formula": { "valor": { "fator": 1, "teto": 20 } } },
    { "id": "200mgml", "label": "200 mg/mL",
      "formula": { "min": { "expr": "peso/4>=10 ? 10 : floor(peso/4)" }, "max": { "expr": "peso/2>=10 ? 10 : peso/2" } } }
  ],
  "flags": ["F-02: teto do max = 20"]
}
```
> Variantes do `hibrido`: (a) ramo por `apresentacao` (Dexametasona — `apresentacao → template`); (b) ramo por `indicacao` (Metronidazol, Azitromicina — `indicacoes[]` cada uma com fator/teto/intervalo); (c) ramo por `faixa_gestacional`/`idade_dias` (antibióticos neonatais — array `ramos_neonatais[]`); (d) ramo misto lookup+computado (Albendazol, Pen. G Benzatina, Pen. Procaina — `tabela[]` + `formula_indicacao{}`).

### 8.4 `fixo`
```json
{
  "id": "colidis",
  "dosing_type": "fixo",
  "inputs": [],
  "dose_fixa": "Dar 5 gotas via oral uma vez ao dia.",
  "apresentacoes": [{ "id": "gotas", "label": "Solução gotas" }],
  "vias": ["VO"],
  "cuidados": "Dose independe do peso e da idade."
}
```
> Salbutamol = `fixo` com múltiplos `regimes[]` (crise/manutenção × neb/spray) em vez de string única.

### 8.5 `infusao-bic`
```json
{
  "id": "terbutalina",
  "dosing_type": "infusao-bic",
  "inputs": ["peso", "dose_desejada_mcg_kg_min", "vazao_desejada_ml_h"],
  "apresentacao": { "id": "inj-0.5mgml", "label": "Solução injetável 0,5 mg/mL" },
  "getters": {
    "volume_24h_mL":     "vazao * peso * 1440 / 500",
    "concentracao_mcg_mL":"volume_24h * 500 / (24 * vazao_desejada)",
    "vol_SG_complementar":"gE2 - volume_24h",
    "limite_inferior_mL": "peso * 0.04",
    "limite_superior_mL": "peso * 0.08"
  },
  "dose_maxima": { "valor": 5, "unidade": "mcg/kg/min", "tipo": "texto" },
  "concentracao_maxima_mcg_ml": 1000,
  "via": "EV BIC"
}
```

### 8.6 `ataque-manutencao` (reservado — sem ocorrência neste recorte)
```json
{
  "id": "<exemplo>",
  "dosing_type": "ataque-manutencao",
  "inputs": ["peso"],
  "ataque":     { "fator": 0, "teto": 0, "unidade": "mg", "via": "EV", "nota": "dose única" },
  "manutencao": { "fator": 0, "teto": 0, "unidade": "mg", "intervalo": "8/8h" }
}
```
> Não há droga `ataque-manutencao` em sintomáticos/antibióticos; provável uso em Urgências/Vasoativas (`raw/03*`, `raw/04`). Schema deixado como placeholder.

### 8.7 `so-aviso`
```json
{
  "id": "metoclopramida",
  "dosing_type": "so-aviso",
  "inputs": [],
  "aviso": "Evite em crianças; risco de Discinesia Tardia irreversível.",
  "tem_dose": false
}
```

---

> **Campos transversais recomendados para o JSON real** (todos os arquétipos): `concentracao_maxima` + flag `tipo` ∈ {`clamp`, `texto`} em CADA teto (ver §6 — distinguir clamp de copy é a decisão de produto mais importante); `gate` boolean em `contraindicacao_idade` (gate duro vs texto); `flags[]` apontando os IDs F-01…F-29 que tocam a droga, para a revisão clínica não perder nenhum. **F-09 (semântica de `c.b`) RESOLVIDA (QA R1, ver `admin-spec/qa/` / D-B): era ruído de extração, não bug — no bundle `Meses=1 / Anos=2` é uniforme, sem inversão. Não é mais pré-requisito.**
