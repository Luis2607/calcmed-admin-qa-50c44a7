# App-wide AS-IS — Antibióticos hospitalares adultos (parte 2)

> Fonte: `_source/main.decoded.js` (bundle Flutter/dart2js decodificado, 11 MB). Offsets de byte citados.
> Domínio: 18 fármacos sob `/category/<slug>`. Categoria-pai = "Antibióticos" (AppBar fixo em todas).
> Auditoria pediátrica (raw/01-05) NÃO repetida aqui. Este é o lado adulto/hospitalar.
>
> **Como foi extraído:** registro de rotas em `~3421835` (`A.aG(a,"/<slug>",...)`), mapeamento rota→widget em `~3425569` (`/category/<slug>`), e o build method de cada tela (`A.<Classe>.prototype` / closure `$1(a)`) lido por byte-slice. Controllers de cálculo (`_Equation<Nome>ControllerBase`) contêm as fórmulas literais.

---

## Achado transversal nº1 — a "fórmula" compartilhada é Cockcroft-Gault (não CKD-EPI)

Quase todas as telas-calculadora têm um toggle **"Cockroft-Gault"** (sic, com erro de grafia no app) que, quando ligado, pede Idade + Peso + sexo + Creatinina Sérica e calcula a TFGe pela fórmula **literal idêntica em todos os controllers**:

```
// Homem (manOrWoman === 1):
TFGe = (140 - idade) * peso / (creatininaSerica * 72)

// Mulher (manOrWoman === 2):
TFGe = (140 - idade) * peso / (creatininaSerica * 72) * 0.85
```

(guarda contra NaN/Infinito → 0). Rótulo de saída no app: `"... mL/min/1,73m²"` — observação de fidelidade: a fórmula é o Cockcroft-Gault clássico (resultado em mL/min, **não** normalizado por 1,73m²), mas o app rotula como "mL/min/1,73m²". Discrepância de rótulo presente no produto, transcrita como está.

Quando o toggle está **desligado**, o usuário digita diretamente o "Clearance de Creatinina" (`creatinina`, campo `f`). O valor usado para estratificar a dose é sempre o campo `creatinina` (clearance informado), e a TFGe calculada apenas o preenche.

## Achado transversal nº2 — todas têm toggle DIÁLISE (SIM/NÃO)

`A.du("SIM",..., "NÃO",...)` no topo. Ramo "SIM" mostra prescrição fixa + a nota compartilhada **`u.E` = "• Nos dias de diálise, administre após o término da diálise."** (string única em `9236253`, reusada por gentamicina/imipenem/meropenem/metronidazol/piperacilina/teicoplanina/etc.). Ramo "NÃO" abre os campos de clearance/Cockcroft e estratifica a dose por faixa de TFGe.

## Achado transversal nº3 — não há paywall observável

Nenhuma string de gate, `premium`, `isPro`, `subscription` ou modal de bloqueio nas telas deste domínio. Todas livres. (Inferência por ausência — flag de incerteza.)

---

## TIPO A — Tabela-referência estática (sem inputs, sem cálculo)

### doxiciclina · `/category/doxiciclina` · `Hw`/`b99` @3480305
- **Tipo:** tabela-referência (texto puro).
- **Inputs:** nenhum.
- **Ajuste renal:** "Não há ajuste."
- **Output/Prescrição:** `Prescrição habitual:\nDOXICICLINA 100 mg - 1 CP VO 12/12 HORAS.`
- **Via:** "Uso Via Oral".

### micafungina · `/category/micafungina` · `HO`/`b9E` @3537908
- **Tipo:** tabela-referência (texto puro).
- **Inputs:** nenhum.
- **Ajuste renal:** "Não há ajuste."
- **Output (dose depende da indicação):**
  - Aspergilose invasiva: `MICAFUNGINA 100 A 150MG + 100 mL SF 0,9% EV UMA VEZ AO DIA`
  - Terapia empírica antifúngica — Neutropenia febril: `MICAFUNGINA 100MG + 100 mL SF 0,9% EV UMA VEZ AO DIA`

### linezolida · `/category/linezolida` · `HJ`/`b9w` @3524797
- **Tipo:** tabela-referência (texto puro; sem controller).
- **Inputs:** nenhum.
- **Ajuste renal:** "Não há ajuste."
- **Output:** `LINEZOLIDA 600MG + 100 mL SF 0,9% EV 12/12 HORAS`
- **Notas:** "• Se TFGe < 30 ou em diálise, alguns especialistas sugerem reduzir a dose para 300mg, 2x/dia após 72 horas do início da antibioticoterapia." · "• Em pacientes dialíticos, nos dias de diálise, administre após o término desta."

### fosfomicina · `/category/fosfomicina` · `HA`/`b9f` @3485474
- **Tipo:** tabela-referência (texto puro).
- **Inputs:** nenhum.
- **Ajuste renal:** "Não há ajuste. Porém monitorar possíveis efeitos adversos, principalmente em terapia prolongada."
- **Output (ITU):** `FOSFOMICINA 3G (PÓ) + 50 A 75 mL DE ÁGUA - VO, DOSE ÚNICA.`
- **Via:** "Uso Via Oral".

---

## TIPO B — Calculadora simples: peso → dose-mg, sem estratificação renal

### polimixina_b · `/category/polimixina_b` · `IE`/`bbq` @3559014 · controller `_EquationPolimixinaControllerBase` (`RR`/`Yd`)
- **Tipo:** calculadora (peso × fator de UI). **Sem** Cockcroft, **sem** estratificação por TFGe.
- **Inputs:** Peso (kg); toggle DIÁLISE (SIM/NÃO).
- **Lógica (multiplicadores literais):**
  - `pesoX20000 = peso * 20000`
  - `pesoX25000 = peso * 25000`
  - `pesoX12500 = peso * 12500`
  - `pesoX15000 = peso * 15000`
- **Ajuste renal:** "Não há ajuste." (mesma prescrição independe de diálise; só exibe ao escolher qualquer opção).
- **Output:**
  - Dose de Ataque: `POLIMIXINA B [peso×20000] UNIDADES A [peso×25000] UNIDADES + 500 mL SG 5% EV`
  - Dose de Manutenção: `POLIMIXINA B [peso×12500] UNIDADES A [peso×15000] UNIDADES + 500 mL SG 5% EV 12/12 HORAS`
- **Via:** "Uso Endovenoso". (Saída formatada com separador de milhar via `A.kB`.)

### teicoplanina · `/category/teicoplanina` · `IK`/`bbF` @3575087 · controller `_EquationTeicoplaninaControllerBase` (`RU`/`a7F`)
- **Tipo:** calculadora peso-baseada (1 fator) + estratificação renal por faixa.
- **Inputs:** Peso; DIÁLISE; (ramo não-diálise) Clearance OU Cockcroft (Idade/Peso/sexo/CrS).
- **Lógica:** `pesoX6 = peso * 6` (dose única, mg). TFGe = Cockcroft padrão.
- **Diálise = SIM:** Ataque `TEICOPLANINA [peso×6] mg + 100 mL SF 0,9% EV EM 30 MINUTOS A CADA 12 HORAS. FAZER 3 DOSES.` · Manutenção `[peso×6] mg... A CADA 72 HORAS` · + nota `u.E`.
- **Diálise = NÃO — estratificação por clearance (`f`):**
  - `≥ 80`: "Não há ajuste" — Ataque `[peso×6] mg... A CADA 12 HORAS. FAZER 3 DOSES` + Manutenção `[peso×6] mg... A CADA 24 HORAS`.
  - `30 – <80`: Ataque `... A CADA 12 HORAS. FAZER 3 DOSES` + Manutenção `... A CADA 48 HORAS`.
  - `1 – <30`: Ataque `... A CADA 12 HORAS. FAZER 3 DOSES` + Manutenção `... A CADA 72 HORAS`.

---

## TIPO C — Calculadora-conduta: estratificação por faixa de TFGe (dose fixa por faixa)

> Padrão dominante. Peso só entra no Cockcroft. As doses são **fixas em mg/g por faixa de clearance**, não calculadas a partir do peso.

### fluconazol · `/category/fluconazol` · `Hz`/`b9e` @3482977 · controller `_EquationFluconazolControllerBase` (`Ro`)
- **Inputs:** Clearance OU Cockcroft (Idade/Peso/sexo/CrS). **Sem toggle diálise explícito** (usa só clearance).
- **Texto fixo topo:** "Dose habitual: 200 a 400 mg 1x ao dia. / Dose depende da indicação. / Não há ajuste se TFGe > 50."
- **Regra:** "Reduzir dose em 50% se TFGe ≤ 50."
- **Nota diálise:** "• Se paciente em diálise: fazer prescrição habitual 3x/semana após hemodiálise."
- **Via:** "Uso Endovenoso e Via Oral".
- **Obs:** controller expõe getters `pesoX4`/`pesoX6` mas o build não os usa (texto é qualitativo). Multiplicadores mortos.

### imipenem_cilastatina · `/category/imipenem_cilastatina` · `HG`/`b9p` @3512012 · controller `_EquationImipenemCilastatinaControllerBase` (`Rs`/`asv`)
- **Inputs:** DIÁLISE; Clearance OU Cockcroft (Idade + **Peso** + sexo + CrS).
- **Diálise = SIM:** `IMIPENEM + CILASTATINA 250 A 500 mg + 100 mL SF 0,9% EV EM 30 MINUTOS A CADA 12 HORAS.` + `u.E`.
- **Diálise = NÃO — faixas de clearance (`f`):**
  - `≥ 60`: "Não há ajuste". Três cenários conforme dose-alvo:
    - se usual 500mg-6/6h → `500 mg + 100 mL... DE 6/6 HORAS`
    - se usual 1g-8/8h → `1G + 250 mL... DE 8/8 HORAS`
    - se usual 1g-6/6h → `1G + 250 mL... DE 6/6 HORAS`
  - `30 – <60`: `500 mg... 8/8h` (500-6/6h) · `500 mg... 8/8h` (1g-8/8h) · `500 mg... 6/6h` (1g-6/6h).
  - `15 – <30`: `500 mg... 12/12h` (500-6/6h) · `500 mg... 12/12h` (1g-8/8h) · `250 mg... 6/6h` (1g-6/6h).
  - `1 – <15`: "Admnistrar Imipenem + Cilastatina apenas se a hemodiálise for instituída dentro de 48 horas. Escolha diálise no início." (sic "Admnistrar").
- **Rodapé:** "As doses são baseadas no componente Imipenem".

### meropenem · `/category/meropenem` · `HL`/`b9A` @3528993 · controller `_EquationMeropenemControllerBase` (`Ru`/`asx`)
- **Inputs:** DIÁLISE; Clearance OU Cockcroft (Idade + Peso + sexo + CrS).
- **Diálise = SIM:** `MEROPENEM 500MG` (se usual 1g-8/8h) e `1G` (se usual 2g-8/8h), ambos `+ 100 mL SF 0,9% EV EM BIC EM 3 HORAS DE 24/24 HORAS` + `u.E`.
- **Diálise = NÃO — faixas (`f`):**
  - `> 50`: "Não há ajuste". `1G... DE 8/8 HORAS` (1g-8/8h) · `2G... DE 8/8 HORAS` (2g-8/8h).
  - `>25 e ≤50`: `1G... DE 12/12 HORAS` · `2G... DE 12/12 HORAS`.
  - `≥10 e ≤25`: `500MG... DE 12/12 HORAS` · `1G... DE 12/12 HORAS`.
  - `≥1 e <10`: `500MG... DE 24/24 HORAS` · `1G... DE 24/24 HORAS`.
  - (todas BIC EM 3 HORAS.)

### levofloxacin · `/category/levofloxacin` · `HI`/`b9u` @3519358 · controller `_EquationLevofloaxacinControllerBase` (sic "Levofloaxacin") (`Rt`/`asw`)
- **Inputs:** DIÁLISE; Clearance OU Cockcroft (Idade + Peso + sexo + CrS).
- **Diálise = SIM (dose usual 500mg 24/24h):** Ataque `500MG EV` + Manutenção `250MG EV 48/48 HORAS`. (e bloco análogo para 750mg: Ataque 750MG, Manutenção 500MG 48/48). + `u.E`.
- **Diálise = NÃO — faixas (`f`):**
  - `≥ 50`: "Não há ajuste". `500MG EV 24/24 HORAS` (usual 500-24/24) · `750MG EV 24/24 HORAS` (usual 750-24/24).
  - `≥20 e <50`: 500-base → Ataque 500MG, Manutenção 250MG **24/24h**; 750-base → Ataque 750MG, Manutenção 750MG **48/48h**.
  - `≥1 e <20`: 500-base → Ataque 500MG, Manutenção 250MG **48/48h**; 750-base → Ataque 750MG, Manutenção 500MG **48/48h**.
- **Via:** "Uso Endovenoso".

### norfloxacin · `/category/norfloxacin` · `HR`/`b9N` @3541867 · controller `_EquationNorfloxacinControllerBase` (`Rx`/`asy`)
- **Inputs:** DIÁLISE; Clearance OU Cockcroft.
- **Diálise = SIM:** `NORFLOXACIN 400MG VO 24/24 HORAS`.
- **Diálise = NÃO — faixas (`f`):**
  - `≥ 30`: `NORFLOXACIN 400MG VO 12/12 HORAS`.
  - `≥1 e <30`: `NORFLOXACIN 400MG VO 24/24 HORAS`.
- **Via:** "Uso Via Oral".

### oxacilina · `/category/oxacilina` · `HU`/`b9R` @3547696 · controller `_EquationOxacilinaControllerBase` (`Rz`/`asz`)
- **Inputs:** DIÁLISE; Clearance OU Cockcroft.
- **Aviso recorrente:** "Não há ajuste. Mas, recomenda-se doses menores (até 8g/dia) em infecções não graves pelo risco de neurotoxicidade."
- **Diálise = SIM:** `OXACILINA 2G + 100 mL SF 0,9% EV 4/4 HORAS` (prescrição habitual).
- **Diálise = NÃO — faixas (`f`):**
  - `≥ 10`: "Não há ajuste". `OXACILINA 2G + 100 mL SF 0,9% EV 4/4 HORAS`.
  - `≥1 e <10`: aviso de neurotoxicidade + `OXACILINA 2G + 100 mL SF 0,9% EV 4/4 HORAS`.

### piperacilina_tazobactan · `/category/piperacilina_tazobactan` · `ID`/`bbp` @3553999 · controller `_EquationPiperacilinaTazobactamControllerBase` (`RQ`/`asK`)
- **Inputs:** DIÁLISE; Clearance OU Cockcroft.
- **Diálise = SIM:** `PIPERACILINA + TAZOBACTAM 4,5 g + 100 mL SF 0,9% EV 12/12 HORAS` e `2,25 g +... 8/8 HORAS` + `u.E`.
- **Diálise = NÃO — faixas (`f`):**
  - `≥ 100`: `4,5 g... 6/6 HORAS`.
  - `≥40 e <100`: `4,5 g... 6/6 HORAS` (mesma string — observação: ramos ≥100 e 40-100 idênticos no bundle).
  - `≥20 e <40`: `4,5 g... 8/8 HORAS`.
  - `≥1 e <20`: `4,5 g... 12/12 HORAS` e `2,25 g... 6/6 HORAS`.

---

## TIPO D — Conduta com dose mg/kg (peso entra na dose) + estratificação renal

### metronidazol · `/category/metronidazol` · `HN`/`b9D` @3535509 · controller `_EquationMetronidazolControllerBase` (`Rv`/`b9C`)
- **Inputs:** DIÁLISE; ramo não-diálise abre Cockcroft (Idade/Peso/sexo/CrS) — **sem campo de clearance direto** (peculiaridade: este NÃO tem o toggle Cockroft/clearance, abre o cálculo direto quando `c` true).
- **Diálise = SIM:** `METRONIDAZOL 500MG EV A CADA 8 A 12 HORAS.` + `u.E`.
- **Diálise = NÃO:** "Não há ajuste. Porém monitorar possíveis efeitos adversos, principalmente em terapia prolongada. / Prescrição habitual: / METRONIDAZOL 500MG EV 8/8 HORAS".
- **Via:** "Uso Endovenoso e Via Oral".
- **Obs:** dose é fixa (500MG); a TFGe calculada é apenas informativa.

### gentamicina · `/category/gentamicina` · `HC`/`b9h` @3502215 · controller `_EquationGentamicinaControllerBase` (`Rq`/`tp`)
- **Tipo:** o mais rico — dose mg/kg + escolha **DOSE ÚNICA/DIA vs MÚLTIPLAS DOSES/DIA** (`typeOfDose`, campo `f`) + estratificação renal.
- **Inputs:** Peso; DIÁLISE; Clearance OU Cockcroft; toggle DOSE ÚNICA / MÚLTIPLAS.
- **Multiplicadores literais (mg):** `pesoX1=peso`, `pesoX15=peso*1.5`, `pesoX17=peso*1.7`, `pesoX2=peso*2`, `pesoX25=peso*2.5`, `pesoX3=peso*3`, `pesoX35=peso*3.5`, `pesoX4=peso*4`, `pesoX51=peso*5.1`.
- **Diálise = SIM:**
  - Ataque: `GENTAMICINA [peso×2] a [peso×3] mg + 100 mL SF 0,9% EV EM 30 A 60 MINUTOS`.
  - Manutenção (sinergismo gram+): `[peso×1] mg... 3X/SEMANA`.
  - ITU: `[peso×1] a [peso×1.5] mg... 3X/SEMANA`.
  - Infecção sistêmica gram-negativo: `[peso×2] a [peso×3] mg... 3X/SEMANA` + notas (nos dias de diálise após término; ajustar por níveis séricos).
- **Diálise = NÃO + DOSE ÚNICA/DIA** (`ag1`/`bcC`, dispatcher `dJT`) — faixas de clearance (`r`):
  - `≥80`: "Não há ajuste. Prescrição habitual: GENTAMICINA [peso×5.1] mg + 100 mL SF 0,9% EV EM 30 A 60 MINUTOS A CADA 24 HORAS".
  - `60–<80`: `[peso×4] mg... 24 HORAS`.
  - `40–<60`: `[peso×3.5] mg... 24 HORAS`.
  - `30–<40`: `[peso×2.5] mg... 24 HORAS`.
  - `20–<30`: `[peso×4] mg... 48 HORAS`.
  - `10–<20`: `[peso×3] mg... 48 HORAS`.
  - `1–<10`: `[peso×2] mg... 72 HORAS` + nota diálise.
- **Diálise = NÃO + MÚLTIPLAS DOSES/DIA** (`ag0`/`bcB`, dispatcher `dJS`) — faixas (`r`):
  - `≥90`: Ataque `[peso×2] mg... 30 MINUTOS`; Manutenção `[peso×1.7] a [peso×2] mg... A CADA 8 HORAS`.
  - `50–<90`: `[peso×1.7] a [peso×2] mg... A CADA 8 HORAS`.
  - `10–<50`: `[peso×1.7] a [peso×2] mg... A CADA 12 A 24 HORAS`.
  - `1–<10`: `[peso×1.7] a [peso×2] mg... A CADA 48 HORAS`.
- **Notas finais:** "* Monitorar níveis séricos de gentamicina é recomendado..." · "* Considere ajustar dose conforme agente infeccioso."

### ganciclovir · `/category/ganciclovir` · `HB`/`b9g` @3490679 · controller `_EquationGanciclovirControllerBase` (`Rp`/`Fj`)
- **Tipo:** dose mg/kg (indução/manutenção) + estratificação renal.
- **Inputs:** Peso; DIÁLISE; Clearance OU Cockcroft.
- **Multiplicadores (mg):** `pesoX125=peso*1.25`, `pesoX0625=peso*0.625`, `pesoX5=peso*5`, `pesoX25=peso*2.5`.
- **Diálise = SIM:** Indução `GANCICLOVIR [peso×1.25] mg + 100 mL SF 0,9% EV EM 1 HORA – 3X/SEMANA`; Manutenção `[peso×0.625] mg... 3X/SEMANA` + `u.E`.
- **Diálise = NÃO — faixas de clearance (`f`):**
  - `≥70`: "Não há ajuste." indução `[peso×5] mg... 12/12 HORAS`; manutenção `[peso×5] mg... 24/24 HORAS`. (literal: "Se dose de indução usual recomendada é 5mg/kg de 12/12 horas" / "Se dose de manutenção usual recomendada é 5mg/kg de 24/24 horas").
  - `50–<70`: indução `[peso×2.5] mg... 12/12 HORAS`; manutenção `[peso×2.5] mg... 24/24 HORAS`.
  - `25–<50`: indução `[peso×2.5] mg... 24/24 HORAS`; manutenção `[peso×1.25] mg... 24/24 HORAS`.
  - `10–<25`: indução `[peso×1.25] mg... 24/24 HORAS`; manutenção `[peso×0.625] mg... 24/24 HORAS`.
  - `1–<10`: indução `[peso×1.25] mg... 3X/SEMANA`; manutenção `[peso×0.625] mg... 3X/SEMANA`.

### sulfametoxazol_trimetoprima · `/category/sulfametoxazol_trimetoprima` · `II`/`bbC` @3567996 · controller `_EquationSulfametoxazolControllerBase` (`RT`/`nv`)
- **Tipo:** dose baseada no **componente Trimetoprima** (mg), faixa-renal. Maior tabela de multiplicadores do domínio.
- **Inputs:** Peso; DIÁLISE; Clearance OU Cockcroft.
- **Multiplicadores literais (mg, sobre peso):** `pesoX2=peso*2`, `X25=peso*2.5`, `X3=peso*3`, `X4=peso*4`, `X5=peso*5`, `X75=peso*7.5`, `X8=peso*8`, `X10=peso*10`, `X12=peso*12`, `X15=peso*15`, `X20=peso*20`; e combinados: `pesoX805 = 8*peso*0.5`, `pesoX20025 = 20*peso*0.25`, `pesoX2005 = 20*peso*0.5`.
- **Diálise = SIM:** `SULFAMETOXAZOL + TRIMETOPRIM [8·peso·0.5] mg A [20·peso·0.25] mg - 24/24 HORAS. EVITAR O USO. Usar apenas quando benefícios superarem os riscos. • Nos dias de diálise, administre após o término da diálise.`
- **Diálise = NÃO — faixas de clearance (`f`):**
  - `> 30`: `[peso×8] mg A [peso×20] mg NO DIA DIVIDIDO EM (componente trimetoprima) 2 A 4 DOSES`.
  - `15 – ≤30`: `[8·peso·0.5] mg A [20·peso·0.5] mg... 2 A 4 DOSES`.
  - `1 – <15`: `[8·peso·0.5] mg A [20·peso·0.25] mg - 24/24 HORAS. EVITAR O USO...`.
- **Diluição/admin (rodapé):** "Dose baseada no componente Trimetoprima. A cada uma ampola (400/80mg) diluir em 125mL de SF 0,9% ou SG 5%. Fazer endovenoso em 60 a 90 minutos."

### vancomicina · `/category/vancomicina` · `IM`/`bbH` @3586391 · controller `_EquationVancomicinaControllerBase` (`RW`/`r9`)
- **Tipo:** o mais complexo — dose mg/kg (ataque + manutenção em faixa), **tempo de infusão calculado**, e **intervalo de manutenção derivado da função renal**.
- **Inputs:** Peso; DIÁLISE; Clearance OU Cockcroft.
- **Multiplicadores de dose (mg):** `pesoX30=peso*30`, `pesoX25=peso*25`, `pesoX20=peso*20`, `pesoX15=peso*15`, `pesoX10=peso*10`.
- **Tempo de infusão (literal, em horas):** `calculateTimeN = (peso * N) / 600`, arredondado a 1 casa, ex.: `calculateTime25 = peso*25/600`. Resultado exibido como `"[x.x] HORAS [intervalo]"`.
- **Intervalo de manutenção (`R3`, literal):**
  ```
  se diálise (b===1): "a cada 48 a 72 horas."
  senão, com s = creatinina (ou creatininaSerica se f===0):
    s >= 50         -> "a cada 12 horas."
    20 <= s < 50    -> "a cada 24 horas."
    s < 20          -> "a cada 48 horas."
  ```
- **Diálise = SIM:** Ataque `VANCOMICINA [peso×25] mg + 250 mL SF 0,9% EV EM [tempo×25]` ; Manutenção `[peso×10] mg + 250 mL... EV EM [tempo×10] a cada 48 a 72 horas`.
- **Diálise = NÃO — faixas de clearance (`f`):**
  - `≥ 50`: Ataque `[peso×20] a [peso×30] mg`; Manutenção `[peso×15] a [peso×20] mg` (intervalo via R3 → 12h).
  - `20 – <50`: Ataque `[peso×20] a [peso×30] mg`; Manutenção `[peso×15] a [peso×20] mg` (intervalo → 24h).
  - `1 – <20`: Ataque `[peso×20] a [peso×30] mg`; Manutenção `[peso×15] a [peso×20] mg` (intervalo → 48h).
- **Notas clínicas (literal):** "• Dose de ataque é recomendada em pacientes graves com suspeita ou confirmação de infecção por MRSA. Doses de até 35mg/kg podem ser consideradas em paciente com Sepse. • Dose de ataque máxima: 3g • Nos dias de diálise, administre após o término da diálise. • Sempre que possível avaliar a Vancocinemia. • Não administrar mais rápido que 10mg/minuto."

---

## Tabela-resumo

| Fármaco | Rota | Tipo | Inputs principais | Output |
|---|---|---|---|---|
| doxiciclina | /category/doxiciclina | tabela-ref | — | 100 mg VO 12/12h |
| fluconazol | /category/fluconazol | calc-conduta | clearance/Cockcroft | 200-400 mg 1x/d; reduz 50% se TFGe ≤50 |
| fosfomicina | /category/fosfomicina | tabela-ref | — | 3 g pó dose única (ITU) |
| ganciclovir | /category/ganciclovir | conduta mg/kg | peso, diálise, clearance | indução/manutenção × faixa TFGe |
| gentamicina | /category/gentamicina | conduta mg/kg | peso, diálise, clearance, único/múltiplo | dose-única vs múltiplas, × faixa |
| imipenem_cilastatina | /category/imipenem_cilastatina | calc-conduta | diálise, clearance | 250mg–1G por faixa |
| levofloxacin | /category/levofloxacin | calc-conduta | diálise, clearance | 250-750MG por faixa |
| linezolida | /category/linezolida | tabela-ref | — | 600MG 12/12h, sem ajuste |
| meropenem | /category/meropenem | calc-conduta | diálise, clearance | 500MG-2G BIC 3h por faixa |
| metronidazol | /category/metronidazol | conduta | diálise, Cockcroft | 500MG 8/8h, sem ajuste |
| micafungina | /category/micafungina | tabela-ref | — | 100-150MG 1x/d por indicação |
| norfloxacin | /category/norfloxacin | calc-conduta | diálise, clearance | 400MG VO 12/12 ou 24/24h |
| oxacilina | /category/oxacilina | calc-conduta | diálise, clearance | 2G 4/4h; alerta neurotoxicidade |
| piperacilina_tazobactan | /category/piperacilina_tazobactan | calc-conduta | diálise, clearance | 2,25-4,5g por faixa |
| polimixina_b | /category/polimixina_b | calc-peso (UI) | peso, diálise | peso×12500-25000 UI ataque/manut |
| sulfametoxazol_trimetoprima | /category/sulfametoxazol_trimetoprima | conduta mg/kg | peso, diálise, clearance | dose por trimetoprima × faixa |
| teicoplanina | /category/teicoplanina | calc-peso + faixa | peso, diálise, clearance | peso×6 mg, intervalo por faixa |
| vancomicina | /category/vancomicina | conduta mg/kg + tempo | peso, diálise, clearance | ataque/manut + tempo infusão + intervalo |

---

## PADRÕES (arquétipos de UI/lógica observados neste domínio)

1. **tabela-referência-estática** — sem inputs, sem controller; só strings (Apresentação? / Não há ajuste / Prescrição habitual / Via). Ex.: doxiciclina, micafungina, linezolida, fosfomicina. UI = coluna de `A.h`/`A.a9`.

2. **calculadora-multiplicador-peso** — controller com getters `pesoXN = peso * N` (lazy via `A.G`). A dose é peso × fator. Ex.: polimixina_b (× UI grandes), gentamicina/sulfa/vanco (mg). Formatação de milhar via `A.kB`.

3. **conduta-estratificada-por-TFGe** — `if (clearance >= X)` / `else if (>=Y && <X)` encadeados, cada faixa emite uma prescrição literal diferente (dose e/ou intervalo). É o esqueleto de quase todo antibiótico EV. Faixas variam por droga.

4. **toggle-diálise-bifurca-tela** — `DIÁLISE? SIM/NÃO`. SIM → prescrição fixa + nota compartilhada `u.E`. NÃO → abre cálculo renal. Universal no domínio.

5. **clearance-direto-ou-Cockcroft** — toggle "Cockroft-Gault"; OFF = digita clearance; ON = Idade+Peso+sexo+CrS → `(140-idade)*peso/(CrS*72)[*0.85 se mulher]`. Fórmula idêntica copiada em 14+ controllers (mesma function `gam`), com rótulo de saída "mL/min/1,73m²" (discrepância: a fórmula é Cockcroft em mL/min, não normalizada).

6. **dose-com-cenários-por-prescrição-alvo** — alguns (imipenem, meropenem, levofloxacin) ramificam *também* pela "dose usual recomendada" (ex.: 500mg-6/6h vs 1g-8/8h), mostrando 2-3 prescrições paralelas por faixa.

7. **sub-widget-por-modo** — gentamicina injeta widget filho diferente (`ag1` dose-única vs `ag0` múltiplas-doses) conforme `typeOfDose`, cada um com sua própria árvore de faixas.

8. **tempo-de-infusão-derivado + intervalo-derivado** — exclusivo da vancomicina: `tempo = peso*N/600` e intervalo textual (`R3`) função da creatinina/diálise; ataque + manutenção compostos.

## Notas de fidelidade / incertezas

- **`A.a9(suffix, prefix, bold, value, "", false, false)`**: layout de argumentos inferido pela leitura — `prefix` = rótulo descritivo (ex.: "Prescrição habitual:\n..."), `value` = dose em negrito, `suffix` = continuação (intervalo/diluição). Render concatena prefix+value+suffix. Alta confiança pelo padrão repetido; não confirmado contra o componente `A.a9` em si.
- **Typos load-bearing presentes no app (transcritos literais):** "Cockroft-Gault" (deveria Cockcroft), "_EquationLevofloaxacinControllerBase", "Admnistrar" (imipenem), "infecção por gram negativo: :" (gentamicina, dois pontos duplicados).
- **piperacilina:** faixas `≥100` e `40–<100` emitem string idêntica (`4,5 g 6/6h`) no bundle — possivelmente intencional ou copy-paste; reportado como observado.
- **fluconazol:** controller carrega `pesoX4`/`pesoX6` que o build não consome (dead getters).
- **premium:** nenhuma evidência de gate; inferência de "livre" por ausência.
- Strings com `u.E` resolvidas via definição em offset 9236253.
