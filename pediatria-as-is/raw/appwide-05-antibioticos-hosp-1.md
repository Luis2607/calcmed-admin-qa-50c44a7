# App-wide AS-IS — Antibióticos hospitalares adultos (parte 1)

> Fonte: `_source/main.decoded.js` (Flutter/Dart compilado, des-ofuscado parcial).
> Domínio: 20 fármacos da letra A–D sob a categoria **`/equation/category/antibioticos`**.
> Roteamento: cada fármaco é uma rota própria registrada em bloco único (offset ~3.421.000):
> `A.aG(a,"/aciclovir",…)`, `/amicacina`, `/amoxicilina_clavulanato`, `/ampicilina`, `/ampicilina_sulbactam`,
> `/anfotericina_b_desoxicolato`, `/anfotericina_b_lipossomal`, `/azitromicina`, `/caspofungina`, `/cefazolina`,
> `/cefepime`, `/ceftarolina`, `/ceftazidima`, `/ceftazidima_avibactam`, `/ceftriaxone`, `/cefuroxima`,
> `/ciprofloxacin`, `/claritromicina`, `/clindamicina`, `/daptomicina`. (A lista continua com doxiciclina…vancomicina = parte 2/3, fora do escopo.)
> Cabeçalho de tela comum: AppBar **"Antibióticos"**, rodapé **"Uso Endovenoso"** (na maioria).
> **Premium:** não há flag por-droga no bundle. Existe assinatura/premium app-wide (`assinatura` 91x, `premium` 41x, `"All Pediatrics unlocked"`), mas o gating é de navegação/categoria, não codificado por antibiótico. → marcado como **indeterminado** em cada item.

---

## ARQUÉTIPO MESTRE — "calculadora de ajuste renal por clearance"

Quase todos os fármacos compartilham o mesmo controller Dart `_EquationXxxControllerBase` com os **mesmos 7 campos**:

| campo interno | papel | UI |
|---|---|---|
| `peso` (`a`) | peso do paciente (kg) | TextField "Peso do paciente" (kg), placeholder "Informe o valor" |
| `dialise` (`b`) | 1=SIM / 2=NÃO | toggle "DIÁLISE?" SIM/NÃO |
| `howToCalculate` (`c`) | bool: clearance manual vs Cockroft-Gault | switch `j1` ao lado do campo de clearance |
| `age` (`d`) | idade (anos) | TextField "Idade" (anos) — só no modo Cockroft |
| `manOrWoman` (`e`) | 1=Homem / 2=Mulher | toggle "Homem/Mulher" — só no modo Cockroft |
| `creatinina` (`f`) | **valor de clearance usado nas faixas** (mL/min/1,73m²) | TextField "Clearance de Creatinina" |
| `creatininaSerica` (`r`) | creatinina sérica (mg/dL) | TextField "Creatinina Sérica" — só no modo Cockroft |

**Fórmula de TFGe (Cockcroft-Gault), literal e idêntica em todos:**
```
TFGe = (140 - age) * peso / (creatininaSerica * 72)
se Mulher: × 0,85
```
(no código: `q=(140-o)*s/(p.r*72)`, e `*0.85` no `case 2`). Guard: NaN/±Inf → 0.

**Lógica de saída:** a prescrição renderizada é escolhida por faixas de `f` (clearance), tipicamente
`≥X → 8/8h`, `faixa intermediária → 12/12h`, `baixa → 24/24h`, `muito baixa → dose única / após diálise`.
Doses peso-dependentes vêm de getters `pesoXN` (= `peso × N`, N = mg/kg). Saída em string de prescrição
"FÁRMACO {dose} + {diluente} EV {intervalo}". `dialise=SIM` troca para regime intermitente (ex.: 3x/semana, após diálise).

Variações do arquétipo:
- **Dose-fixa-banded** (Amox+Clav, Ampicilina, AmpSulbactam, Cefazolina, Cefepime, Ceftarolina, Ceftazidima, Ceftaz+Avibactam, Cefuroxima, Cipro, Claritro): sem `pesoXN`, doses fixas (1G, 2G, 500MG…) escolhidas por faixa de clearance.
- **Peso×mg/kg-banded** (Aciclovir, Amicacina, Daptomicina): dose = peso × multiplicador, e faixa de clearance muda intervalo.
- **Dose-única-input** (Anfotericina desoxicolato/lipossomal): usuário escolhe mg/kg (`dose`), sem ajuste renal.
- **Texto-estático / sem ajuste** (Azitromicina, Caspofungina, Ceftriaxone, Clindamicina): posologia habitual fixa, "Não há ajuste".

---

## CALCULADORAS PESO × mg/kg (com banda de clearance)

### Aciclovir — `/aciclovir`
- **Tipo:** calculadora (peso×mg/kg + ajuste renal).
- **Inputs:** peso, diálise, clearance (manual ou Cockroft: idade/sexo/Cr sérica).
- **Getters:** `pesoX2.5` (`a*2.5`), `pesoX5` (`a*5`), `pesoX10` (`a*10`). Volume de diluente `resultX/resultXClarance`: **<500 mg → 100 mL; senão 240 mL** de SF 0,9%.
- **Lógica/dose:**
  - **Diálise SIM:** `pesoX2.5 mg a pesoX5 mg + {100|240} mL SF 0,9% EV EM 1 HORA - 24/24 HORAS`. Nota: *"Use o peso ideal em paciente obeso para evitar superdosagem."*
  - **Diálise NÃO**, por clearance `f`:
    - `f > 50`: `pesoX5 mg a pesoX10 mg + … EV EM 1 HORA - 8/8 HORAS`
    - `25–50`: `pesoX5 a pesoX10 mg + … - 12/12 HORAS`
    - `10–25`: `pesoX5 a pesoX10 mg + … - 24/24 HORAS`
    - `1–10`: `pesoX2.5 a pesoX5 mg + … - 24/24 HORAS`
- **Output:** prescrição EV (texto). Uso Endovenoso.

### Amicacina — `/amicacina`
- **Tipo:** calculadora (peso×mg/kg + ajuste renal). Classe widget `H8`.
- **Getters:** `pesoX12.5` (`a*12.5`), `pesoX5` (`a*5`), `pesoX7.5` (`a*7.5`).
- **Lógica/dose** (diluente fixo 100 mL SF 0,9%):
  - **Diálise SIM:** `pesoX5 mg a pesoX12.5 mg + 100 mL SF 0,9% EV 3X/SEMANA`. Nota: *"Idealmente ajustar a dose conforme níveis séricos de amicacina."*
  - **NÃO**, por clearance `f`:
    - `≥60`: `+ 100 mL SF 0,9% EV 8/8 HORAS`
    - `40–60`: `… 12/12 HORAS`
    - `20–40`: `… 24/24 HORAS`
    - `1–20`: `… UMA VEZ` (dose única; "Doses subsequentes devem ser consideradas conforme níveis séricos")
- **Peculiaridade:** repete o lembrete de monitorar nível sérico em todas as faixas.

### Daptomicina — `/daptomicina`
- **Tipo:** calculadora (peso×mg/kg + ajuste renal).
- **Getters:** `pesoX4` (`a*4`), `pesoX6` (`a*6`). *"Dose habitual de 4 a 6 mg/kg."*
- **Lógica/dose** (diluente 50 mL SF 0,9%, infusão 30 min):
  - `f ≥ 30`: `pesoX4 mg a pesoX6 mg + 50 mL SF 0,9% EV EM 30 MINUTOS - 24/24 HORAS`
  - `1–30`: `… - 48/48 HORAS`. Nota: *"Se em hemodiálise, nos dias de diálise, administre após seu término."*

---

## CALCULADORAS DE DILUIÇÃO POR DOSE ESCOLHIDA (sem ajuste renal)

### Anfotericina B Desoxicolato — `/anfotericina_b_desoxicolato`
- **Tipo:** calculadora (volume a aspirar). Classe widget `Hc`.
- **Inputs:** `peso`, `dose` (mg/kg escolhida; *"Dose habitual de 0,7 a 1,0 mg/kg/d"*). **"Não há ajuste."**
- **Apresentação:** *"frasco-ampola: 50 mg (pó) + diluente (10 mL)"* → 5 mg/mL.
- **Fórmula literal:**
  - `gazE` (volume mL a aspirar) = `dose * peso * 0,2`, **cap em 10 mL** (`if(r>=10)return 10`).
  - `gazF` (mg totais) = `dose * peso * 0,2 * 50`, **cap em 500 mg** (`if(r>=500)return 500`).
- **Output:** `ANFOTERICINA B – DESOXICOLATO 50 mg (PÓ) - RECONSTITUIR EM 10 mL DO DILUENTE. ASPIRAR {gazE} mL + {…} SG 5% EV EM 2 A 6 HORAS – 24/24 HORAS.`

### Anfotericina B Lipossomal — `/anfotericina_b_lipossomal`
- **Tipo:** calculadora (dose total mg).
- **Inputs:** `peso`, `dose` (*"Dose habitual de 3 a 6 mg/kg/d"*). **"Não há ajuste."**
- **Fórmula literal:** `pesoXdose = peso * dose` (`return q*r.b`).
- **Output:** `ANFOTERICINA B - LIPOSSOMAL - {pesoXdose} mg + … SG …` EV.

---

## DOSE-FIXA COM BANDA DE CLEARANCE (ajuste renal por faixa, dose não-peso)

### Amoxicilina + Clavulanato — `/amoxicilina_clavulanato`
- **Tipo:** calculadora de ajuste renal (controller nomeado `Amoxicilina`; widget `H9`). Diluente 100 mL SF 0,9%.
- **Lógica/dose** por clearance `f`:
  - `≥30`: `AMOXICILINA + CLAVULANATO 1G + 100 mL SF 0,9% EV 8/8 HORAS`
  - `10–30`: `1G + … EV A CADA 12 HORAS` **e** `500MG + … A CADA 12 HORAS` (linha dupla)
  - `1–10`: `1G …` **e** `500MG + … EV A CADA 12 A 24 HORAS`

### Ampicilina — `/ampicilina`
- **Tipo:** calculadora de ajuste renal (widget `Ha`; getter só `calculateTfge`, dose fixa). Diluente 100 mL.
- **Lógica/dose** por `f` (mostra dois regimes-alvo "se dose usual = 2g–4/4h" e "2g–6/6h"):
  - `≥50`: sem ajuste → `AMPICILINA 2G + … EV 4/4 HORAS` / `AMPICILINA 1 A 2 g + … 6/6 HORAS`
  - `30–50`: `2 g … 6/6 HORAS` / `1 A 2 g … 8/8 HORAS`
  - `15–30`: `2 g … 8/8 HORAS` / `1 A 2 g … 12/12 HORAS`
  - `<15`: `2 g … 12/12 HORAS` / `1 A 2 g … 24/24 HORAS`

### Ampicilina + Sulbactam — `/ampicilina_sulbactam`
- **Tipo:** calculadora de ajuste renal (widget `Hb`). Dose **1.5G a 3G** + 100 mL SF 0,9%.
- **Lógica/dose** por `f`:
  - `≥30`: *"Não há ajuste"* → `AMPICILINA + SULBACTAM 1.5G A 3G + 100 mL SF 0,9% EV 6/6 HORAS`
  - `15–30`: `… 12/12 HORAS`
  - `1–15`: `… 24/24 HORAS`

### Cefazolina — `/cefazolina`
- **Tipo:** calculadora de ajuste renal. Diluente 100 mL.
- **Lógica/dose** por `f`:
  - **Diálise:** `CEFAZOLINA 2G + 100 mL SF 0,9% EV 3X/SEMANA – APÓS DIÁLISE`
  - `≥50`: `1 A 2G + … 8/8 HORAS`
  - `30–50`: `1 A 2G + … A CADA 8 A 12 HORAS`
  - `10–30`: `… 12/12 HORAS`
  - `1–10`: `… 24/24 HORAS`
  - (base "500MG A 1G + … 24/24 HORAS" como dose mais baixa)

### Cefepime — `/cefepime`
- **Tipo:** calculadora de ajuste renal. Diluente 100 mL. Mostra regimes-alvo "2g–8/8h" e "2g–12/12h".
- **Lógica/dose** por `f`:
  - `>60`: *"Não há ajuste"* → `CEFEPIME 2G + … 12/12 HORAS` (e 8/8 conforme alvo)
  - `30–60`: `CEFEPIME 1G + … 12/12 HORAS` (alvo 2g 12/12 → 1G 24/24)
  - `11–30`: `1G + … 24/24 HORAS` / `1G 12/12`
  - `1–11`: `CEFEPIME 500MG + … 24/24 HORAS` / `1 g uma vez`

### Ceftarolina — `/ceftarolina`
- **Tipo:** calculadora de ajuste renal (reusa controller compartilhado; sem `_EquationCeftarolina`). Diluente **250 mL** SF 0,9%. Mostra alvos "600mg–8/8h" e "600mg–12/12h".
- **Lógica/dose** por `f`:
  - `>50`: *"Não há ajuste"* → `CEFTAROLINA 600MG + 250 mL SF 0,9% EV 12/12 HORAS` (ou 8/8)
  - `30–50`: `CEFTAROLINA 400MG + … 12/12 HORAS`
  - `15–30`: `CEFTAROLINA 300MG + … 12/12 HORAS`
  - `1–15`: `CEFTAROLINA 200MG + … 12/12 HORAS` (e variantes 8/8 conforme alvo)

### Ceftazidima — `/ceftazidima`
- **Tipo:** calculadora de ajuste renal. Diluente 100 mL. Alvos "2g–8/8h" e "1g–8/8h".
- **Lógica/dose** por `f`:
  - `≥50`: *"Não há ajuste"* → `CEFTAZIDIMA 1G + … 8/8 HORAS`
  - `30–50`: `CEFTAZIDIMA 1G + … 12/12 HORAS`
  - `15–30`: `1G + … 24/24 HORAS`
  - `1–15`: `CEFTAZIDIMA 500MG + … 24/24 HORAS` (base "500MG A 1G + … 24/24")

### Ceftazidima + Avibactam — `/ceftazidima_avibactam`
- **Tipo:** calculadora de ajuste renal (controller completo `_EquationCeftazidimaAvibactam`). Diluente 100 mL.
- **Lógica/dose** por `f`:
  - `>50`: `CEFTAZIDIMA + AVIBACTAM 2G/500MG + 100 mL SF 0,9% EV 8/8 HORAS`
  - `30–50`: `1G/250MG + … 8/8 HORAS`
  - `15–30`: `1G/250MG + … 12/12 HORAS`
  - `5–15`: `750MG/187,5MG + … 24/24 HORAS`
  - `1–5`: dose reduzida (`750MG/187,5MG …`, frequência estendida)

### Cefuroxima — `/cefuroxima`
- **Tipo:** calculadora de ajuste renal. Dose **750MG a 1,5G** + 100 mL SF 0,9%.
- **Lógica/dose** por `f`:
  - `≥30`: `CEFUROXIMA 750MG A 1,5G + … EV 8/8 HORAS`
  - `10–30`: `… 12/12 HORAS`
  - `1–10`: `… 24/24 HORAS`

### Ciprofloxacin — `/ciprofloxacin`
- **Tipo:** calculadora de ajuste renal. Dose **200 a 400 mg** EV (sem diluente fixo explícito na string).
- **Lógica/dose** por `f`:
  - `≥30`: `CIPROFLOXACIN 400 mg EV A CADA 8 A 12 HORAS`
  - `1–30`: `CIPROFLOXACIN 200 A 400 mg EV A CADA 12 A 24 HORAS`
  - (base `CIPROFLOXACIN 200 A 400 mg EV 24/24 HORAS`)

### Claritromicina — `/claritromicina`
- **Tipo:** calculadora de ajuste renal. Dose **500MG** + 250 mL SF 0,9%, infusão 1 hora.
- **Lógica/dose** por `f`:
  - `≥30`: `CLARITROMICINA 500MG + 250 mL SF 0,9% EV EM 1 HORA – 12/12 HORAS`
  - `1–30`: `… EV EM 1 HORA – 24/24 HORAS`

---

## TEXTO-ESTÁTICO / POSOLOGIA FIXA ("Não há ajuste")

### Azitromicina — `/azitromicina`
- **Tipo:** tabela-referência / dose fixa. *"Não há ajuste. Posologia habitual:"*
- **Output:** `AZITROMICINA 500MG + 250 mL SF 0,9% EV EM 1 HORA.`

### Caspofungina — `/caspofungina`
- **Tipo:** dose fixa (ataque + manutenção). *"Não há ajuste. Posologia habitual:"*
- **Output:** Dose de Ataque `CASPOFUNGINA 70MG + 250 mL SF 0,9% EV.` | Dose de Manutenção `50MG + 250 mL SF 0,9% EV 24/24 HORAS.`

### Ceftriaxone — `/ceftriaxone`
- **Tipo:** dose fixa (ataque + manutenção). *"Não há ajuste. Posologia habitual:"*
- **Output:** Dose de Ataque `CEFTRIAXONE 2G + 100 mL SF 0,9% EV` (variante 1G) | Dose de Manutenção `2G + 100 mL SF 0,9% EV 24/24H`.

### Clindamicina — `/clindamicina`
- **Tipo:** tabela-referência (faixas de dose diária) + prescrição-exemplo.
- **Conteúdo literal:**
  - `EV: 600 a 4800 mg/dia dividido em 2 a 4 doses; Diluir em 100 mL SF 0,9% ou SG 5%.`
  - `Oral: 600 a 2400 mg/dia dividido em 2 a 4 doses;`
  - Prescrição habitual: `CLINDAMICINA 600MG + 100 mL …`
- **Peculiaridade:** único da lista que documenta via oral além da EV.

---

## PADRÕES (arquétipos observados)

1. **calculadora-ajuste-renal-por-clearance** (dominante, ~15/20): controller `_EquationXxxControllerBase`
   com 7 campos (peso/dialise/howToCalculate/age/manOrWoman/creatinina[=clearance]/creatininaSerica).
   Saída = string de prescrição escolhida por faixas de clearance `f`. Sub-tipos:
   - **dose-fixa-banded** (1G/2G/500MG por faixa) — penicilinas/cefalosporinas/quinolona/macrolídeo EV.
   - **peso×mg/kg-banded** (`pesoXN = peso*N`) — Aciclovir, Amicacina, Daptomicina.
2. **Cockcroft-Gault embutido (idêntico em todos):** `TFGe=(140-idade)*peso/(CrSérica*72)`, `×0,85` mulher;
   alternável com clearance manual via switch `howToCalculate`.
3. **toggle DIÁLISE → regime intermitente:** SIM muda para "3X/SEMANA" / "APÓS DIÁLISE" / "UMA VEZ".
4. **calculadora-diluição-por-dose-escolhida** (Anfotericinas): usuário entra mg/kg; volume/mg derivados
   com **caps de segurança** (desoxicolato: 10 mL/50 mg, 500 mg). "Não há ajuste".
5. **tabela-referência / dose-fixa-estática** (Azitromicina, Caspofungina, Ceftriaxone, Clindamicina):
   só posologia habitual, sem cálculo, "Não há ajuste"; padrão Ataque+Manutenção em alguns.
6. **string-de-prescrição como output universal:** formato `"FÁRMACO {dose} + {diluente} EV {intervalo}"`,
   diluentes recorrentes 100 mL (penicilinas/cefalo), 250 mL (ceftarolina/macrolídeos/equinocandinas),
   50 mL (daptomicina); guard NaN/Inf→0 em todos os getters.

### Lacunas / incertezas (flag)
- **Premium por-droga:** não há flag no bundle; gating é app-wide (assinatura). → indeterminado.
- **Faixas-fronteira:** alguns operadores misturam `>`/`>=` (ex.: Cefazolina `>10` vs Cefepime `>60`); transcritos
  exatamente como no código, mas há leve inconsistência de inclusividade entre fármacos (não é erro de leitura).
- **Doses-alvo condicionais (Cefepime/Ceftazidima/Ceftarolina/Ampicilina):** o app exibe DOIS regimes-alvo
  ("se dose usual é Xg–8/8h" vs "12/12h") e ajusta cada um; as duas linhas convivem na mesma faixa.
- **AmoxClav:** controller reaproveita o nome `Amoxicilina`; não há fármaco "amoxicilina" isolado nas rotas.
