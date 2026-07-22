# Pediatria — Urgências: Anafilaxia, Hipoglicemia, Bradicardia, Taquicardia (AS-IS)

> Fonte de verdade: bundle Flutter `_source/main.decoded.js`. Transcrição **verbatim** de doses/concentrações/marcas/templates. Valores derivados do peso/idade são calculados em runtime e aparecem como `[valor calculado]`, com o **template literal** ao redor documentado.
>
> Estas quatro telas pertencem à categoria **"Urgências"** do **menu Pediatria** (controllers `_CategoryPediatra*`). Existem telas homônimas no app adulto (Anafilaxia adulto, Hipoglicemia adulto `/category/hipoglicemia`, Bradiarritmias/Taquiarritmias/Cardioversão adulto) — **não** são estas. As rotas pediátricas confirmadas no bundle são:
> - `/pediatra/anafilaxia` (id `pediatric_nafilaxia`, label "Anafilaxia", ícone `anafilaxia.svg`)
> - `/pediatra/hipoglicemia` (id `pediatric_hipoglicemia`, label "Hipoglicemia ", ícone `hipoglicemia.svg`)
> - `/pediatra/bradicardia` (id `bradiarritmias`, label "Bradicardia", ícone `bradicardia.svg`)
> - `/pediatra/taquicardia` (id `taquiarritmias`, label "Taquicardia", ícone `taquiaritmia.svg`)
>
> Todas têm header (AppBar) com título **"Urgências"** (não o nome da tela). Todas as telas com cálculo usam o empty-state padrão `u.y = "Informe todos os dados para obter o resultado."` quando o campo numérico ainda não foi preenchido (os blocos de prescrição só aparecem com peso > 0).

---

## Anafilaxia

### Anafilaxia — Pediatria
**Rota:** `/pediatra/anafilaxia` · **Controller:** `_CategoryPediatraAnafilaxiaControllerBase` · **Header:** "Urgências"

**Inputs**
- Campo único **"Peso"** (placeholder `"0.0"`, sufixo `kg`, máscara decimal 2 casas). Sem dropdown, sem idade.
- A tela exibe um **fluxograma fixo** (passos 1 a 8) independente do peso; os valores de droga (passo 3, bolus, infusão e adjuvantes) recalculam a partir do peso.

**Conteúdo fixo (fluxograma — texto verbatim, na ordem)**

```
1) Remover fator desencadeante;
2) Pedir ajuda;
```

**Passo 3 — Epinefrina IM (template literal):**
- Label rico: `"3) "` + `"Epinefrina "` + `"(1 mg/mL) "` + `" [valor calculado] mL "` + `"(0,01 mg/kg) IM no vasto lateral da coxa;"`
- Onde `[valor calculado]` = `B.e.t(gayG, 2)` (2 casas). Cálculo (`peso001`): `peso × 0.01`, **limitado a 0,5** (`s>0.5?0.5:s`).

```
4) O2 suplementar;
5) 2 acessos venosos calibrosos (IO se falha de acesso venoso);
```

**Passo 6 — Bolus SF 0,9% (template literal):**
- `"6) Bolus de "` + `"SF 0,9% "` + `" [valor calculado] mL "` + `"mL (20 mL/kg) EV em 5 a 10 minutos.\nRepita, se necessário. Monitore o débito urinário.\n7) Se resposta inadequada com Epinefrina IM e bolus de SF 0,9%, inicie"` + `" Epinefrina 0,1 a 1 mcg/kg/min:"`
- `[valor calculado]` = `B.e.t(gazm, 2)`; cálculo (`peso20`): `peso × 20`.

**Infusão de Epinefrina (prescrição — bloco `az`):**
- `"Epinefrina (1 mg/mL) - 1 ampola + 99 mL SG 5% (10 mcg/mL) - Iniciar a "` + `[valor calculado] mL ` + `"ml/h (0,1 mcg/kg/min) EV em BI. Titular conforme efeito."`
- `[valor calculado]` = `B.e.t(gaze, 2)`; cálculo (`peso06`): `peso × 0.6`.

**Link:** `"Para mais detalhes da prescrição acesse:"` + `" Drogas vasoativas"` (navega para `/pediatra/drogas-vasoativas`).

**Terapia adjuvante (título):** `"Terapia adjuvante:\n\n- Considere anti-histamínico\nEx.: Difenidramina 1 mg/kg:"`

**Difenidramina EV (prescrição `az`):**
- `"Difenidramina (50 mg/mL) - 1 ampola + 50 mL SF 0,9%. Fazer "` + `[valor calculado] mL ` + `"EV em 5 minutos."`
- `[valor calculado]` = `B.e.t(gazC, 1)`; cálculo (`pesoLimeted50`): `peso` (se `peso>50` → 50).

**Difenidramina IM (prescrição `az`):**
- `"Difenidramina (50 mg/mL) - "` + `[valor calculado] mL ` + `"IM.\n-- Contraindicado em menores de 2 anos.\n-- Dose máxima 50 mg/dose."`
- `[valor calculado]` = `B.e.t(gazu, 1)`; cálculo (`peso50`): `peso / 50`, limitado a 1 (`s>1?1:s`).

**Corticóide (título):** `"- Considere corticóide\nEx.: Metilprednisolona 1 mg/kg:"`

**Metilprednisolona EV (prescrição `az`):**
- `"Metilprednisolona (Pó 40 mg + diluente 1 mL) - 1 mL + 40 mL SF 0,9%. Fazer "` + `[valor calculado] mL ` + `"EV em pelo menos 30 minutos."`
- `[valor calculado]` = `B.e.t(gazB, 1)`; cálculo (`pesoLimeted125`): `peso` (se `peso>125` → 125).

**Metilprednisolona IM (prescrição `az`):**
- `"Metilprednisolona (Pó 40 mg + diluente 1 mL) - "` + `[valor calculado] mL ` + `"IM.\n-- Dose máxima 125 mg/dose."`
- `[valor calculado]` = `B.e.t(gazr, 1)`; cálculo (`peso40`): `peso / 40`, limitado a 3,1 (`s>3.1?3.1:s`).

**Passo 8 / CIATOX (texto fixo):**
```
8) Ligar no CIATOX (Centro de Intoxicações), contato 0800 646 4350 e se informar se existe terapia específica adicional.
```

**Cuidados (título + item fixo):**
```
Cuidados
- Mantenha o paciente monitorizado.
```

---

## Hipoglicemia

### Hipoglicemia — Pediatria
**Rota:** `/pediatra/hipoglicemia` · **Controller:** `_CategoryPediatraHipoglicemiaControllerBase` · **Header:** "Urgências"

**Estrutura:** TabBar com 2 abas: **"NEONATAL"** (index 0) e **"CRIANÇAS"** (index 1).

**Inputs (comuns às duas abas):**
- Campo **"Peso"** / **"Peso do paciente"** (placeholder `"Informe o valor"`, sufixo `kg`, máscara decimal).
- Dropdown **"Escolha:"** de Glicose Hipertônica (`selectGh`) com opções (lista `selectGhList`, valores `c`=código):
  - `"Glicose Hipertônica 10% - "` (código `"0"`)
  - `"Glicose Hipertônica 25%"` (código `"1"`)
  - `"Glicose Hipertônica 50%"` (código `"2"`)
- Os blocos de prescrição (`ahy/ahz/ahA` na aba CRIANÇAS, `ahB/ahC/ahD` na aba NEONATAL) só aparecem **após** selecionar a GH (condicional pelo código `"0"/"1"/"2"`).

#### Aba NEONATAL — conteúdo fixo
- Critério (texto): `"Glicemia capilar\n\n< 48h de vida: < 50 mg/dL\n> 48h de vida: < 60 mg/dL\n> 1 semana de vida: < 70 mg/dL"`
- Subtítulo: `"Neonato consciente"`
  - `"Amamentação em livre demanda\n\nObter acesso venoso"`
- Subtítulo: `"Neonato com alteração do nível de consciência"` → entra Peso + dropdown Escolha.

**Bloco de prescrição NEONATAL (widget `ahB`, GH 10% — código "0"):**
- **"Bolus inicial:"**
  - `guN` (= nome da GH selecionada, ex. "Glicose Hipertônica 10% - ") + `"Dextrose 0,2 g/kg\n\n"` (prefixo) + `[valor calculado] mL` + `" EV em 2 minutos.\nRepetir em 15 a 20 minutos se necessário.\n"`
  - `[valor calculado]` = `B.e.t(gy_,...)`; cálculo (`result2XPeso`): `peso × 2`.
- **"Manutenção:"**
  - prefixo `"Dose inicial: dextrose 5 a 6 mg/kg/min"` + `\n\n` + `guN` + `[valor calculado] mL` (`gI8` = `result4Z` = `resultZ × 4` = `peso×3×4`) + `" EV em BI de"` + `" [w0] a [I9] mL/h.\n"` + `u.xw`
  - `u.xw` = `"Ajustar 0,5-1 mg/kg/min a cada 15 a 20 minutos."`
  - `w0` (`resultZ`) = `peso × 3`; `I9` (`resultY`) = `peso × 3.6`.

**Widgets `ahC` (GH 25% — código "1") e `ahD` (GH 50% — código "2"):** mesma estrutura, mas o bolus dilui com **" Água Destilada "**:
- `ahC` (25%): `guN` + `" - [result04] mL +"` + `" Água Destilada "` + `[result06] mL - Fazer ` + `[gy_] mL` + `u.wh` ; depois Manutenção idêntica.
  - `result04` (`gTX`) = `result2XPeso × 0.4`; `result06` (`gTY`) = `result2XPeso × 0.6`.
- `ahD` (50%): usa `result02`(`gTW`= `result2XPeso × 0.2`) e `result08`(`gTZ`= `result2XPeso × 0.8`).
- `u.wh` = `" EV em 2 minutos.\nRepetir em 15 a 20 minutos se necessário.\n\n"`

**Observações (rodapé NEONATAL, após selecionar GH):**
```
Observações:
- Monitorar glicemia a cada 15 a 20 minutos até normalizar.
- Se persistente admita em terapia intensiva.
```

#### Aba CRIANÇAS — conteúdo fixo
- Critério: `"Glicemia capilar < 70 mg/dL"`
- Subtítulo: `"Criança consciente"` → `"Administre carboidrato de rápida absorção"`
- Subtítulo: `"Criança com alteração do nível de consciência"` → Peso do paciente + dropdown Escolha.

**Bloco de prescrição CRIANÇAS (widget `ahy`, GH 10% — código "0"):** (formato em linha única, sem títulos "Bolus inicial/Manutenção")
- Prefixo `u.aH` + `guN` + `" [result25] a [resultPesoX5] mL"` + `u.W` + `u.e` + `\n\n` + `guN` + `[I8] mL` + `" EV em BI de"` + `" [w0] a [I9] mL/h.\n"` + `u.Fw`
- `u.aH` = `"Bolus inicial:\nDextrose 0,25 a 0,5 g/kg (Máximo 25 g/dose)\n"`
- `u.W` = `" EV em 2 minutos.\nRepetir em 15 a 20 minutos se necessário."`
- `u.e` = `"\n\nManutenção:\nDose inicial: dextrose 5 a 6 mg/kg/min (metade para crianças maiores)"`
- `u.Fw` = `"Ajustar 0,5-1 mg/kg/min a cada 15 a 20 minutos.\n\nGlucagon 0,5 a 1 mg IM/SC pode ser considerado quando não for possível obter acesso EV."`
- `result25` (`gaAV`) = `peso × 2.5`; `resultPesoX5` (`gaB1`) = `peso × 5`.

**Widgets `ahz` (GH 25% — código "1") e `ahA` (GH 50% — código "2"):** bolus diluído em **" Água Destilada "**, usando `result04/result06` (`ahz`) e `result02/result08` (`ahA`), seguido da mesma manutenção (`u.Fw`). Template `ahz` (25%):
- `guN` + `" [result04] mL +"` + `" Água Destilada "` + `[result06] - ` + `"Fazer"` + `" [gy_] mL"` + `u.W` + `u.e` + `\n\n` + `guN` + `" [result04] mL +"` + `" Água Destilada "` + `[result06] - [I8] mL` + `" EV em BI de"` + `" [w0] a [I9] mL/h.\n"` + `u.Fw`.

**Observações (rodapé CRIANÇAS):** mesmo bloco `b0` do NEONATAL ("Monitorar glicemia a cada 15 a 20 minutos...").

**Cálculos (controller, getters → fórmulas):**
| Getter | Campo interno | Fórmula |
|---|---|---|
| `gw0` | resultZ | `peso × 3` |
| `gI9` | resultY | `peso × 3.6` |
| `gaB1` | resultPesoX5 | `peso × 5` |
| `gy_` | result2XPeso | `peso × 2` |
| `gI8` | result4Z | `resultZ × 4` (= peso×12) |
| `gTW` | result02 | `result2XPeso × 0.2` |
| `gaAV` | result25 | `peso × 2.5` |
| `gTX` | result04 | `result2XPeso × 0.4` |
| `gTY` | result06 | `result2XPeso × 0.6` |
| `gTZ` | result08 | `result2XPeso × 0.8` |
| `guN` | resultGHName | string da GH selecionada (10%/25%/50%) |

> **Nota / FLAG:** existe um terceiro getter `gbq7` (`result025` = `result2XPeso × 0.25`) e `gbq8`... não usados nos widgets de prescrição transcritos (possível resto morto). Não impacta o output visível.

---

## Bradicardia

### Bradicardia — Pediatria
**Rota:** `/pediatra/bradicardia` · **Controller:** `_CategoryPediatraBradicardiaControllerBase` · **Header:** "Urgências"

**Estrutura:** TabBar com 2 abas:
- **"Adrenalina"** (id de aba `bradicardia_0`)
- **"Atropina"** (id de aba `1`)

**Inputs (comuns):** campo **"Peso"** (sufixo `kg`, máscara decimal). Sem idade, sem dropdown. (O peso fica num card destacado; as abas mostram a droga calculada.)

> Não há texto de algoritmo/RCP nesta tela além das prescrições das duas drogas — a tela é puramente um conversor de dose pediátrica de Adrenalina e Atropina para bradicardia. (O algoritmo/RCP completo pediátrico fica na tela **PCR** `/pediatra/pcr`, fora desta seção.)

#### Aba Adrenalina (widget `ae6`/`bal`)
- Título: `"Adrenalina: 0,01 mg/kg"`
- Prescrição (`a9`): prefixo `u.b4` + `[valor calculado] mL` + `" EV/IO.\nRepetir a cada 3 a 5 minutos\n\n- Realizar bolus, seguido de flush com 1-5 mL SF 0,9%."`
  - `u.b4` = `"Adrenalina (1 mg/mL) 1 mL + 9 mL SF 0,9% - Fazer "`
  - `[valor calculado]` = `B.e.t(gHQ, 1)`; cálculo (`peso01Limited1`): `peso × 0.1`, limitado a 1 (`s>1?1:s`).

#### Aba Atropina (widget `ae7`/`bam`)
- Título: `"Atropina: 0,02 mg/kg"`
- Prescrição 1 (`a9`): `"Atropina (0,25 mg/mL) – Fazer "` + `[valor calculado] mL` + `" EV/IO."`
  - `[valor calculado]` = `B.e.t(gayO, 2)`; cálculo (`peso008Limited2`): `peso × 0.08`, limitado a 2 (`s>2?2:s`).
- Prescrição 2 (`a9`): `"Atropina (0,50 mg/mL) – Fazer "` + `[valor calculado] mL` + `" EV/IO.\n\nPode ser repetido uma vez.\nDose mínima: 0,1 mg.\nDose máxima: 0,5 mg.\n\n- Realizar bolus, seguido de flush com 1-5 mL SF 0,9%."`
  - `[valor calculado]` = `B.e.t(gayK, 1)`; cálculo (`peso004Limeted1`): `peso × 0.04`, limitado a 1 (`s>1?1:s`).

---

## Taquicardia

### Taquicardia — Pediatria
**Rota:** `/pediatra/taquicardia` · **Controller:** `_CategoryPediatraTaquicardiaControllerBase` · **Header:** "Urgências"

**Estrutura:** TabBar com 2 abas:
- **"Adenosina"** (id de aba `0`)
- **"Carga do choque para cardioversão sincronizada"** (id de aba `1`)

**Inputs (comuns):** campo **"Peso"** (sufixo `kg`, máscara decimal). Sem idade, sem dropdown.

> Como na bradicardia, esta tela é um conversor de doses (não traz o algoritmo estável/instável, QRS estreito/largo). O fluxograma QRS estreito/largo + Joules existe na **tela adulta de Cardioversão Elétrica** (`/equation/category/cardioversao-eletrica`), não na pediátrica.

#### Aba Adenosina (widget `aeX`/`bbk`)
- **Primeira dose** — título: `"Primeira dose: 0,1 mg/kg"`
  - Prescrição (`a9`): `"Adenosina (3 mg/mL) - Fazer "` + `[valor calculado] mL` + `" EV/IO.\n\n- Realizar bolus, seguido de flush com 5-10 mL SF 0,9%.\nDose máxima primeira dose 6 mg"`
  - `[valor calculado]` = `B.e.t(gayI, 1)`; cálculo (`peso0033Limited2`): `peso × 0.033`, limitado a 2 (`s>2?2:s`).
- **Segunda dose** — título: `"Segunda dose: 0,2 mg/kg (se necessário)"`
  - Prescrição (`a9`): `"Adenosina (3 mg/mL) - Fazer "` + `[valor calculado] mL` + `" EV/IO.\n\n- Realizar bolus, seguido de flush com 5-10 mL SF 0,9%.\nDose máxima segunda dose 12 mg"`
  - `[valor calculado]` = `B.e.t(gayN, 1)`; cálculo (`peso0066Limited4`): `peso × 0.066`, limitado a 4 (`s>4?4:s`).

#### Aba Cardioversão sincronizada (widget `aeY`/`bbl`)
- **Primeiro choque** (`a9`): `"Primeiro choque: 0,5 a 1 J/kg - "` + `[v1] a [v2]` + `" J"`
  - `[v1]` = `B.e.t(gazd, 0)` (`peso05Limited200`): `peso × 0.5`, limitado a 200 (`s>200?200:s`).
  - `[v2]` = `peso` (com clamp: se `peso>200` usa 200). Ou seja, 0,5 J/kg a 1 J/kg.
- **Segundo choque e subsequentes** (`a9`): `"Segundo choque e subsequentes:\n2 J/kg - "` + `[v3]` + `" J\n(Máximo de 10 J/kg ou carga para adulto)"`
  - `[v3]` = `B.e.t(gazn, 0)` (`peso2Limited200`): `peso × 2`, limitado a 200 (`s>200?200:s`).

**Cálculos (controller):**
| Getter | Campo | Fórmula | Limite |
|---|---|---|---|
| `gayI` | peso0033Limited2 | `peso × 0.033` | ≤ 2 |
| `gayN` | peso0066Limited4 | `peso × 0.066` | ≤ 4 |
| `gazd` | peso05Limited200 | `peso × 0.5` | ≤ 200 |
| `gazn` | peso2Limited200 | `peso × 2` | ≤ 200 |

---

## Notas de fidelidade / FLAGS

- **Espaço extra preservado:** label da categoria Hipoglicemia no menu = `"Hipoglicemia "` (com espaço final) e Intubação = `"Intubação "`. Transcrito como está.
- **Empty state:** todas as telas com cálculo mostram `"Informe todos os dados para obter o resultado."` (`u.y`) enquanto o peso não é informado; os cards de droga aparecem só com peso > 0. Não localizei um empty-state textual diferente por tela.
- **Bradicardia/Taquicardia pediátricas NÃO contêm algoritmo/decisão** (QRS, estável/instável, RCP) — são conversores de dose. O algoritmo de RCP/ritmos chocáveis pediátrico está em `/pediatra/pcr` e o fluxograma de cardioversão por Joules está na tela **adulta** de Cardioversão Elétrica. FLAG: se o objetivo do redesign for "algoritmo completo", esse conteúdo hoje vive em telas separadas.
- **Adrenalina IM adulto:** o bundle também tem texto adulto de anafilaxia (`"Adrenalina (1 mg/mL) – Fazer 0,3 a 0,5 mg IM..."` e `"... 0,01 mg/kg IM..."`) numa tela distinta da pediátrica — não incluído aqui por ser fora de escopo (rota não-pediátrica).
- **Getters não utilizados (FLAG):** controller de Hipoglicemia expõe `result025` (`gbq7`) que não aparece nos widgets de prescrição transcritos; provavelmente código morto. Sem efeito no output visível.
- **Cardioversão "Primeiro choque" — limite do v2:** o limite de 200 é aplicado ao valor de `peso` cru (variável `q` no widget) antes de formatar; a faixa exibida é `[peso×0.5] a [peso (≤200)]` J, refletindo 0,5–1 J/kg.
