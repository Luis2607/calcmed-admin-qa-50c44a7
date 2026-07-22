# Sintomáticos — Broncodilatadores (Pediatria) — AS-IS

> Fonte de verdade: app CalcMed (Flutter web), bundle `main.decoded.js`. Transcrição **verbatim** do conteúdo clínico. Valores derivados de peso/idade aparecem como `[valor calculado]` com o template literal documentado.

**Categoria:** Broncodilatadores
**Rota da categoria:** `/pediatra/broncodilatadores`
**Slug interno:** `broncodilatadores`
**Ícone:** `assets/icons/categories/capsule.svg`
**Título da AppBar das telas de droga:** "Broncodilatadores" (a tela-índice/listagem usa AppBar "Sintomáticos")
**Analytics:** `A.fz("pediatrics-broncodilatadores","calculator")`

**Itens da categoria (ordem e rotas — verbatim do bundle):**

| # | Nome exibido | Rota |
|---|---|---|
| 0 | Acebrofilina | `/pediatra/broncodilatadores/acebrofilina` |
| 1 | Abrilar® | `/pediatra/broncodilatadores/abrilar` |
| 2 | Fenoterol | `/pediatra/broncodilatadores/fenoterol` |
| 3 | Brometo de Ipratrópio | `/pediatra/broncodilatadores/brometo-ipratropio` |
| 4 | Montelucaste | `/pediatra/broncodilatadores/montelucaste` |
| 5 | Salbutamol | `/pediatra/broncodilatadores/salbutamol` |
| 6 | Sulfato de Magnésio | `/pediatra/broncodilatadores/sulfato-magnesio` |
| 7 | Terbutalina | `/pediatra/broncodilatadores/terbutalina` |

> **Nota de mapeamento (verificação interna):** o seletor de tela `eG` da categoria mapeia índices → widgets assim: `"0"→H6` (Acebrofilina), `"1"→H5` (Abrilar), `"2"→Hy` (Fenoterol), `"3"→Hf` (Brometo de Ipratrópio), `"4"→HP` (Montelucaste), `"5"→IG` (Salbutamol), `"6"→IJ` (Sulfato de Magnésio), `"7"→IL` (Terbutalina). A ordem de exibição na listagem segue a tabela acima.

> **Empty state global (telas que pedem Peso):** `"Informe todos os dados para obter o resultado."` (constante `u.y`). Renderizada enquanto `peso === 0`.

---

## Broncodilatadores

### Acebrofilina

- **Rota:** `/pediatra/broncodilatadores/acebrofilina`
- **AppBar:** "Broncodilatadores"
- **Widget:** `H6` / builder `drW` (controller `drV`)

**Inputs:**
- **Peso** — campo de texto numérico (label "Peso", placeholder/valor inicial "0.0", sufixo nenhum visível no campo; teclado decimal `bz(2,!1,!0)`).
  - Lógica do controller (`drV`): `e = peso`; `d = peso * 0.2`. (`d` = dose em mL para a faixa de 2–3 anos.)

**Apresentação:**
- Xarope pediátrico 5 mg/mL: Brondilat®

**Prescrição:**
- Crianças de 2 a 3 anos:
  Dar `[valor calculado]` mL (`[valor calculado]` mg) a cada 12 horas.
  - Template literal: `"Crianças de 2 a 3 anos:\nDar " + A.b(i.d)+" mL ("+B.e.t(i.e,0)+" mg)" + " a cada 12 horas.\n"`
  - Ou seja: mL = `peso * 0.2` (valor cru, sem arredondamento de casas no código), mg = `peso` arredondado a 0 casas.
- Crianças de 3 a 6 anos:
  Dar 5 mL (25 mg) a cada 12 horas.
- Crianças de 6 a 12 anos:
  Dar 10 mL (50 mg) a cada 12 horas.

**Cuidados:**
- Posologia para crianças a partir de 2 anos de idade.
- Para mais detalhes acesse a bula.

**Empty state:** quando `peso === 0`, exibe o aviso `u.y` ("Informe todos os dados para obter o resultado.") junto ao bloco de prescrição.

---

### Abrilar® (Hedera helix)

- **Rota:** `/pediatra/broncodilatadores/abrilar`
- **AppBar:** "Broncodilatadores"
- **Widget:** `H5` / builder `drT`

**Inputs:** nenhum (tela estática, sem campo de Peso).

**Apresentação:**
- Xarope pediátrico – Hedera helix L. - 7 mg/mL: Abrilar®

**Prescrição:**
- Lactentes e crianças até 7 anos:
  Dar 2,5 mL três vezes ao dia.
- Crianças acima de 7 anos:
  Dar 5 mL três vezes ao dia.

**Cuidados:**
- Hedera Helix L. possui efeito mucolítico e broncodilatador.
- Para mais detalhes acesse a bula.

---

### Fenoterol (Bromifen®, Fenteudini®)

- **Rota:** `/pediatra/broncodilatadores/fenoterol`
- **AppBar:** "Broncodilatadores"
- **Widget:** `Hy` / builder `dwc`

**Inputs:** nenhum (tela estática, sem campo de Peso).

**Apresentação:**
- Solução gotas 5 mg/mL: Bromifen®, Fenteudini®

**Prescrição:**
- Uso Oral
  - Crianças de até 1 ano:
    3 a 7 gotas, 2 a 3 vezes ao dia.
  - Crianças de 1 a 6 anos:
    5 a 10 gotas, 3 vezes ao dia.
  - Crianças de 6 a 12 anos:
    10 gotas, 3x ao dia.
- Uso Inalatório
  - Crianças de até 6 anos (< 22kg):
    2 gotas diluída em 3-4 mL SF 0,9% para nebulização até 3x ao dia.
  - Crianças de 6 a 12 anos:
    2 a 6 gotas diluída em 3-4 mL SF 0,9% para nebulização até 3x ao dia.

**Cuidados:**
- Posologia para crianças até 12 anos de idade.
- A via inalatória é preferida.
- Para mais detalhes acesse a bula.

---

### Brometo de Ipratrópio

- **Rota:** `/pediatra/broncodilatadores/brometo-ipratropio`
- **AppBar:** "Broncodilatadores"
- **Widget:** `Hf` / builder `dtU`

**Inputs:** nenhum (tela estática, sem campo de Peso).

**Apresentação:** (constante `u.ec`)
- Solução aerossol 20 mcg/mL: Atrovent® N
- Solução para inalação (gotas) 0,25 mg/mL: Atrovent®

**Prescrição:**
- Aerossol
  - Crianças acima de 6 anos:
    Manutenção: Aspirar 2 puffs 6/6 horas.
- Uso Inalatório
  - Crianças de até 6 anos:
    Crise aguda: Diluir 8 a 20 gotas em 3-4 mL SF 0,9% para nebulização de 20/20 minutos, por 1 hora.
    Manutenção: Diluir 8 a 20 gotas em 3-4 mL SF 0,9% para nebulização 3 a 4 x ao dia.
  - Crianças de 6 a 12 anos:
    Crise aguda: Diluir 20 gotas em 3-4 mL SF 0,9% para nebulização de 20/20 minutos, por 1 hora.
    Manutenção: Diluir 20 gotas em 3-4 mL SF 0,9% para nebulização 3 a 4 x ao dia.

**Cuidados:**
- Para mais detalhes acesse a bula.

---

### Montelucaste (Montelair®, Singulair®, Piemonte®)

- **Rota:** `/pediatra/broncodilatadores/montelucaste`
- **AppBar:** "Broncodilatadores"
- **Widget:** `HP` / builder `dyp`

**Inputs:** nenhum (tela estática, sem campo de Peso).

**Apresentação:**
- Granulado 4 mg: Montelair®
- Comprimidos mastigáveis 4 e 5 mg: Montelair®, Singulair®, Piemonte®

**Prescrição:**
- Granulado 4 mg:
  - Crianças acima de 6 meses:
    1 sachê VO 1 vez ao dia, à noite.
- Comprimidos mastigáveis:
  - Crianças de 2 a 5 anos:
    Dar 1 comprimido (4 mg) diariamente.
  - Crianças de 6 a 14 anos:
    Dar 1 comprimido (5 mg) diariamente.

**Cuidados:**
- Posologia para crianças a partir de 6 meses até 5 anos de idade.
- Pode ser administrado diretamente na boca ou dissolvido em uma colher de chá de fórmula para bebês.
- Para mais detalhes acesse a bula.

---

### Salbutamol (Aerolin®, Aerodini®)

- **Rota:** `/pediatra/broncodilatadores/salbutamol`
- **AppBar:** "Broncodilatadores"
- **Widget:** `IG` / builder `dFD`

**Inputs:** nenhum (tela estática, sem campo de Peso).

**Apresentação:** (constante `u.kJ`)
- Solução para nebulização 5 mg/mL: Aerolin®
- Spray 100 mcg/dose: Aerolin®, Aerodini®

**Prescrição:**
- Nebulização
  - Crise aguda: Nebulizar Salbutamol 0,5 mL + 2,5 mL SF 0,9% de 20/20 minutos, por 1 hora.
  - Manutenção: Nebulizar Salbutamol 0,5 mL + 2,5 mL SF 0,9% até 4 x ao dia.
- Spray
  - Crise aguda: Aspirar 2 a 4 puffs de 20/20 minutos, por 1 hora.
  - Manutenção: Aspirar 1 a 2 puffs até 4 x ao dia.

**Cuidados:**
- Para detalhes da crise, acesse o algoritmo específico.
- Para mais detalhes acesse a bula.

---

### Sulfato de Magnésio

- **Rota:** `/pediatra/broncodilatadores/sulfato-magnesio`
- **AppBar:** "Broncodilatadores"
- **Widget:** `IJ` / builder `dG4` (controller `dG3`)

**Inputs:**
- **Peso** — campo de texto numérico (label "Peso", placeholder/valor inicial "0.0", teclado decimal `bz(2,!1,!0)`).
  - Lógica do controller (`dG3`):
    - `d = peso * 0.5` (limitado a máx. 20) → volume (mL) do Sulfato de magnésio 10% na dose de 50 mg/kg.
    - `r = peso * 0.1` (limitado a máx. 4) → volume (mL) do Sulfato de magnésio 50%.
    - `e = 50 - d` → volume de SF 0,9% para a apresentação 10%.
    - `f = 2 * d` → (usado no texto da concentração/volume final 10%).
    - Concentração final 10% no texto: `10 * r` mg/dL? (ver template abaixo — valores entre parênteses calculados).

**Apresentação:** (constante `u.jj`)
- Sulfato de magnésio 10%
- Sulfato de magnésio 50%

**Dose usual:**
- 50 mg/kg/dose

**Prescrição:** (bloco calculado por peso; quando `peso === 0`, exibe `u.y`)
- Sulfato de magnésio 10% - `[valor calculado]` mL + `[valor calculado]` mL SF 0,9% (`[valor calculado]` mg/mL) - EV em 20 a 60 minutos.
  - Template literal (linha 10%): `"Sulfato de magnésio 10% - " + (B.e.t(e.d,1))+" mL + "+(B.e.t(e.e,1))+" mL" + " SF 0,9% ("+(B.e.t(e.f,1))+" mg/mL) - EV em 20 a 60 minutos."`
  - Mapeamento: `e.d = peso*0.5` (máx 20) mL; `e.e = 50 - e.d` mL SF; `e.f = 2*e.d` mg/mL.
- Sulfato de magnésio 50% - `[valor calculado]` mL + `[valor calculado]` mL SF 0,9% (`[valor calculado]` mg/mL) - EV em 20 a 60 minutos.
  - Template literal (linha 50%): `"Sulfato de magnésio 50% - " + (B.e.t(e.r,1))+" mL + "+(B.e.t(50-e.r,1))+" mL" + " SF 0,9% ("+(B.e.t(10*e.r,1))+" mg/mL) - EV em 20 a 60 minutos."`
  - Mapeamento: `e.r = peso*0.1` (máx 4) mL; SF = `50 - e.r` mL; concentração = `10*e.r` mg/mL.

**Cuidados:**
- Paciente deve estar monitorizado.
- Para detalhes da crise, acesse o algoritmo específico.
- Dose máxima: 2g.
- Concentração máxima: 60 mg/dL.
- Para mais detalhes acesse a bula.

> **FLAG (verificar revisão clínica):** a string de Cuidados diz "Concentração máxima: 60 mg/dL", enquanto o texto da prescrição usa "mg/mL". Transcrito verbatim — possível inconsistência de unidade no bundle original.

---

### Terbutalina (Terbutil®)

- **Rota:** `/pediatra/broncodilatadores/terbutalina`
- **AppBar:** "Broncodilatadores"
- **Widget:** `IL` / builder `dGh` (controllers `dGe`/`dGf`/`dGg`, equação `BB`/`RV`)

**Inputs:**
- **Peso** — campo de texto numérico (label "Peso", valor inicial "0.0", teclado decimal `bz(2,!1,!0)`). Controller `dGe` → `sap(peso)`.
- **Dose desejada:** — campo (label "Dose desejada:", sufixo "mcg/kg/min", teclado `B.L`). Controller `dGf` → `sS_`.
- **Vazão desejada:** — campo (label "Vazão desejada:", valor inicial = `c` atual, sufixo "mL/h", teclado `B.L`). Controller `dGg` → `sbr_`.

**Apresentação:**
- Solução injetável 0,5 mg/mL: Terbutil®

**Prescrição:**

**Dose inicial:**
- Dose inicial:
  Terbutalina (0,5 mg/mL) - `[valor calculado]` mL a `[valor calculado]` mL + SG 5% 20 mL EV em 5 a 10 minutos (4 a 10 mcg/kg).
  - Template literal: `"Dose inicial:\nTerbutalina (0,5 mg/mL) - " + (B.e.t(p.gaeA,2)+" mL a "+B.e.t(p.gEm,2)+" mL") + " + SG 5% 20 mL EV em 5 a 10 minutos (4 a 10 mcg/kg)."`
  - Mapeamento: `gaeA = peso*0.08` mL (limite superior), `gEm = peso*0.04` mL (limite inferior).
  - Quando `peso < 1`, exibe o aviso `u.y`.

**Infusão contínua:**
- Dose usual: 0,25 – 0,5 mcg/kg/min

- Volume em 24 horas: `[valor calculado]` mL
  - Template: `" "+B.e.t(p.gNb,1)+" "` + "mL", precedido de "Volume em 24 horas:".

- Sugestões:
  Para 24 horas: Terbutalina (0,5 mg/mL) - `[valor calculado]` mL + SG 5% `[valor calculado]` mL – ( `[valor calculado]` mcg/mL) - EV em BIC a `[valor calculado]` mL/h ( `[valor calculado]` mcg/kg/min)
  - Template literal: `"Sugestões:\nPara 24 horas: Terbutalina (0,5 mg/mL) -" + " "+c+" mL" + " + SG 5% "+b+" mL – ( "+a+" mcg/mL) - EV em BIC a "+a0+" mL/h ( "+B.e.t(p.b,2)+" mcg/kg/min)\n"`
  - Mapeamento: `c = B.e.t(p.gNb,1)` (volume 24h); `b = B.e.t(p.gaw1,1)`; `a = B.e.t(p.gDy(0),2)` (concentração mcg/mL); `a0 = B.e.t(p.c,1)` (vazão mL/h); `p.b` = dose mcg/kg/min.
  - ou
  - Terbutalina 1 mL + 100 mL SG 5% (5 mcg/mL) - Fazer `[valor calculado]` mL/minuto a `[valor calculado]` mL/minuto EV em BI contínua – 0,2 a 0,4 mcg/kg/min.
    - Template: `"...Fazer " + (B.e.t(p.gEm,2)+" mL/minuto a "+B.e.t(p.gaeA,2)+" mL/minuto") + " EV em BI contínua – 0,2 a 0,4 mcg/kg/min.\n- Titular de 0,02 a 0,04 mL/kg/min (0,1 a 0,2 mcg/kg/min) a cada 30 minutos conforme resposta clínica ou toxicidade."`
  - Quando `peso < 1`, exibe o aviso `u.y`.

**Cuidados:**
- Dose máxima de 5 mcg/kg/min.
- Concentração máxima da solução: 1.000 mcg/mL.
- Dados limitados na literatura.
- Para detalhes da crise, acesse o algoritmo específico.
- Para mais detalhes acesse a bula.

> **Fórmulas internas da equação Terbutalina (controller `BB`):**
> - `gNb` (volume 24h) = `b * a * 1440 / 500` onde `b` = vazão (mL/h, `gaor`), `a` = peso (`gPY`).
> - `gDy(0)` (concentração mcg/mL) = `gNb * 500 / (24 * c)` onde `c` = vazão desejada (`ga65`).
> - `gE2` = `gNb * 500 / gDy(0)`.
> - `gaw1` = `gE2 - gNb`.
> - `gaeA` = `peso * 0.08`; `gEm` = `peso * 0.04`.
> - Reset (`q`): `sap(0); sbr_(0); sbr_(2)`.
