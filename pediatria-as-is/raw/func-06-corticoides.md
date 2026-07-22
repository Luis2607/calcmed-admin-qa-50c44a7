# Pediatria AS-IS — LÓGICA DE CÁLCULO: Corticóides

> Foco: **computação** (motor de dose + schema JSON), não prosa. Conteúdo clínico/prosa vive em `raw/01d-sintomaticos-laxativos-corticoides.md`.
> Fonte de verdade: `_source/main.decoded.js` (bundle Flutter web decodificado). Cada fator/concentração/teto foi **conferido diretamente no controller minificado** (classes `guR`).
> Convenções do bundle: `B.e.t(expr, n)` = arredonda `expr` para `n` casas decimais; `B.e.T(expr)` = arredonda para inteiro; `B.l.l(x)` = converte int→string; `this.a` / `r` / `q` / `o` / `p` = **peso (kg)**.
> Categoria: `/pediatra/corticoides`. AppBar "Corticóides". 7 telas com rota própria + Kóide D (tela `Iz`).

---

## Resumo de classificação (dosing_type)

| Droga | Tela | dosing_type | Computa peso? |
|---|---|---|---|
| Prednisona (Kóide®) | `It` | peso-computado | sim (1 formulação) |
| Prednisolona | `IB` | peso-computado | sim (3 apresentações) |
| Dexametasona | `Iw` | hibrido | sim (6 apresentações × 4 indicações; tetos por indicação) |
| Hidrocortisona | `Iy` | peso-computado | sim (2 frascos × 2 indicações; teto choque) |
| Metilprednisolona | `IA` | peso-computado | sim (3 frascos) |
| Budesonida | `Iv`/`Iu` | faixa-etaria-lookup | **não** (controller fixa `weight:0`; doses fixas por jato) |
| Fluticasona (Avamys®) | `Ix` | faixa-etaria-lookup | **não** (tela estática) |
| Koide D® (dexclorfen.+betametasona) | `Iz` | faixa-etaria-lookup | **não** (volume fixo por faixa) |

> **Empty-state global das telas computadas:** prescrição só renderiza quando `peso > 0` (e, quando há seletor, apresentação escolhida). Prednisona gate explícito `if(o>0)`.

---

## Prednisona (Kóide®) — `peso-computado`

- **Inputs:** Peso (kg). Sem seletor (formulação única).
- **Apresentação:** Elixir 0,1 mg/mL (Kóide®).
- **Via/intervalo:** VO, dividido em 3 a 4 doses/dia. Dose usual texto fixo: "0,017 a 0,25 mg/kg/d".
- **Gate:** `if(o>0)` renderiza bloco "Uso oral".

**Fórmula (verbatim do controller `It`):**
```
"Dar " + B.e.t(peso*0.17, 1) + " mL a " + B.e.t(peso*2.5, 1) + " mL VO ao dia, dividido em 3 a 4 doses."
```
- Volume mínimo = `peso × 0.17` (round 1 casa) mL
- Volume máximo = `peso × 2.5` (round 1 casa) mL
- Sem teto numérico.

---

## Prednisolona — `peso-computado` (3 apresentações)

- **Inputs:** Peso (kg) + seletor "Selecione a apresentação:" (3 chips).
- **Bloco único:** "Dose anti-inflamatória:". Via Oral, ao dia.
- **Gate:** prescrição vazia se `peso <= 0`.

| Apresentação (enum) | Classe | Fórmula (verbatim) | Unidade |
|---|---|---|---|
| Solução oral 1 mg/mL (`solucao1mgml`) | `aSO` | `"- Dar "+B.e.t(peso*0.1,2)+" a "+B.e.t(peso*2,2)+" mL, Via Oral, ao dia."` | mL (2 casas) |
| Solução oral 3 mg/mL (`solucao3mgml`) | `aSP` | `"- Dar "+B.e.t(peso*0.03,2)+" a "+B.e.t(peso*0.67,2)+" mL, Via Oral, ao dia."` | mL (2 casas) |
| Solução oral gotas 11 mg/mL (`gotas11mgml`) | `aSN` | `"- Dar "+B.l.l(B.e.T(peso*0.2))+" a "+B.l.l(B.e.T(peso*3.6))+" gotas, Via Oral, ao dia."` | **gotas inteiras** (round) |

- Sem teto numérico em nenhuma apresentação.

---

## Dexametasona — `hibrido` (6 apresentações → 4 templates; 4 indicações cada)

- **Inputs:** Peso (kg) + seletor com 6 apresentações.
- **Mapeamento apresentação→template (`eXY`):** opção 0→`aGo`, 1→`aGp`, 2→`aGn`, opções 3/4/5→`aGm`.
- Cada template gera 4 blocos de indicação: **Anti-inflamatória / Exacerbação Asma / Crupe / Meningite Bacteriana**.
- **Tetos** vivem no texto fixo das indicações (não recalculados em runtime): Asma/Crupe injetável "Máx.: 16 mg/dose"; oral elixir "Máx.: 160 mL/dose"; oral comprimido "Máx.: 16 mg/dose"; Meningite "Máx.: 10 mg/dose". → flag para o motor: o app **não** clampa numericamente, só exibe o limite textual.

### `aGo` — Solução injetável 2 mg/mL (opção 0)
```
Anti-inflamatória:  Fazer B.e.t(peso*0.01,2) mL a B.e.t(peso*0.15,2) mL   (diluído SF 0,9% EV/IM, 6/6 ou 12/12h)
Exacerbação Asma:   Fazer B.e.t(peso*0.3,2) mL                            (dose única; Máx 16 mg/dose)
Crupe:              Fazer B.e.t(peso*0.3,2) mL                            (dose única; Máx 16 mg/dose)
Meningite:          Fazer B.e.t(peso*0.075,2) mL                          (6/6h por 2-4 dias; Máx 10 mg/dose)
```

### `aGp` — Solução injetável 4 mg/mL (opção 1)
```
Anti-inflamatória:  Fazer B.e.t(peso*0.005,2) mL
Exacerbação Asma:   Fazer B.e.t(peso*0.15,2) mL
Crupe:              Fazer B.e.t(peso*0.15,2) mL
Meningite:          Fazer B.e.t(peso*0.0375,2) mL
```

### `aGn` — Elixir 0,1 mg/mL (opção 2; via oral)
```
Anti-inflamatória:  Fazer B.e.t(peso*0.2,2) mL a B.e.t(peso*3,2) mL   (6/6 ou 12/12h, VO)
Exacerbação Asma:   Fazer B.e.t(peso*6,2) mL                          (dose única VO; Máx 160 mL/dose)
Crupe:              Fazer B.e.t(peso*6,2) mL                          (dose única VO; Máx 160 mL/dose)
Meningite:          texto fixo "A administração endovenosa é a via mais adequada." (sem cálculo)
```

### `aGm` — Comprimidos 0,5 / 0,75 / 4 mg (opções 3/4/5; dose em mg)
```
Anti-inflamatória:  Dar B.e.t(peso*0.02,2) mg a B.e.t(peso*0.3,2) mg   (6/6 ou 12/12h, VO)
Exacerbação Asma:   Dar B.e.t(peso*0.6,2) mg                           (dose única VO; Máx 16 mg/dose)
Crupe:              Dar B.e.t(peso*0.6,2) mg                           (dose única VO; Máx 16 mg/dose)
Meningite:          texto fixo (via EV mais adequada; sem cálculo)
```

> NOTA: os 3 comprimidos (0,5 / 0,75 / 4 mg) compartilham o **mesmo** template `aGm` que calcula em **mg** (não converte para nº de comprimidos). É a concentração que difere clinicamente, mas o cálculo é idêntico para as 3 — flag: provável simplificação do app original.

---

## Hidrocortisona — `peso-computado` (2 frascos × 2 indicações)

- **Inputs:** Peso (kg) + seletor com 2 frascos.
- **Indicações:** Dose anti-inflamatória inicial (range, 3-4 doses) + Choque Séptico (dose única 2 mg/kg, **com teto 100 mg**).

### Frasco 100 mg (`aKT`) — reconstituir em 2 mL AD
```
Anti-inflamatória: Fracionar B.e.t(peso*0.0112,2) mL a B.e.t(peso*0.16,2) mL em 3 ou 4 doses (IM ou EV diluído 20 mL SF)
Choque Séptico:    Aspirar  B.e.t(peso*0.04,2) mL  (máx. 100 mg), diluir 20-50 mL SF 0,9%
```

### Frasco 500 mg (`aKU`) — reconstituir em 4 mL AD
```
Anti-inflamatória: Fracionar B.e.t(peso*0.0048,2) mL a B.e.t(peso*0.064,2) mL em 3 ou 4 doses
Choque Séptico:    Aspirar  B.e.t(peso*0.016,2) mL  (máx. 100 mg), diluir 20-50 mL SF 0,9%
```

- Faixa clínica subjacente: 0,56 a 8 mg/kg/dia (anti-inflamatória); 2 mg/kg (choque).
- **Teto choque = 100 mg** exibido no texto (`u.rP`), não clampado numericamente no volume.

---

## Metilprednisolona (Solu-Medrol®) — `peso-computado` (3 frascos)

- **Inputs:** Peso (kg) + seletor com 3 frascos.
- **Indicação única:** Dose anti-inflamatória. Faixa fixa `u.P` = "0,11 a 1,6 mg/kg/dia, EV – dividido em 3 ou 4 doses". Diluir em SF 0,9% e fazer EV.

| Frasco (enum) | Classe | Reconstituição | Fórmula (verbatim) |
|---|---|---|---|
| 40 mg (`frasco40mg`) | `aPC` | 1 mL diluente | `"- Fracionar "+B.e.t(peso*0.00275,2)+" a "+B.e.t(peso*0.04,2)+" mL em 3 ou 4 doses..."` |
| 125 mg (`frasco125mg`) | `aPB` | 2 mL diluente | `"- Fracionar "+B.e.t(peso*0.00176,2)+" a "+B.e.t(peso*0.0256,2)+" mL..."` |
| 500 mg (`frasco500mg`) | `aPD` | 8 mL diluente | `"- Fracionar "+B.e.t(peso*0.00176,2)+" a "+B.e.t(peso*0.0256,2)+" mL..."` |

- **NOTA / flag:** frascos 125 mg e 500 mg usam os **mesmos fatores** (0.00176 / 0.0256). Coerente com concentração resultante igual (125/2 = 62,5 mg/mL ≠ 500/8 = 62,5 mg/mL — **de fato igual**, 62,5 mg/mL). 40 mg/1 mL = 40 mg/mL difere → fatores maiores. Conferido.
- Texto fixo de regras de infusão por dose total: `u.c` = "Doses < 250 mg: diluir 50-100 mL SF, infundir ≥5 min"; `u.mS` = "Doses > 250 mg: diluir 250 mL SF, infundir ≥30 min".

---

## Budesonida (Spray Nasal) — `faixa-etaria-lookup` (NÃO computa peso)

- **Inputs:** seletor com 2 apresentações. **Sem campo de peso** — controller `Iu` mantém `weight: 0` fixo.
- **Faixa única citada:** Crianças ≥ 6 anos.
- Doses **fixas por jato** (não há aritmética por peso):

| Apresentação (enum) | Classe | Regra (verbatim) |
|---|---|---|
| 32/64 mcg/dose (`mcg32ou64`) Busonid/Noex | `aRU` | "Até 256 mcg/dia (1 ou 2×/dia)" · ≥6 anos: 4 doses de 32 mcg/narina OU 2 doses de 64 mcg/narina, 1-2×/dia |
| 50/100 mcg/dose (`mcg50ou100`) Busonid/Noex | `aRV` | "Até 400 mcg/dia (...)" · ≥6 anos: 2 doses de 50 mcg/narina 2×/dia ou 4/narina 1×/dia OU 1 dose de 100 mcg/narina 2×/dia ou 2/narina 1×/dia |

> FLAG copy (verbatim): na opção 50/100 mcg o limite é "Até 400 mcg/dia" mas o parênteses repete "(a dose de 256 mcg, pode ser feita...)" — inconsistência de copy do app original.

---

## Fluticasona (Avamys®) — `faixa-etaria-lookup` (tela estática)

- **Inputs:** nenhum.
- **Apresentação:** Suspensão spray nasal 27,5 mcg/dose (Avamys®).
- **Contraindicação por idade:** < 2 anos.
- Doses fixas por faixa (jatos por narina, 1×/dia):

| Faixa etária | Regra |
|---|---|
| ≥ 2 anos | 1 jato (27,5 mcg)/narina 1×/dia (pode ↑ p/ 2 jatos até controle; depois reduzir p/ 1) |
| ≥ 12 anos | 2 jatos (27,5 mcg/jato)/narina 1×/dia |

---

## Koide D® (dexclorfeniramina + betametasona) — `faixa-etaria-lookup` (tela estática)

- **Inputs:** nenhum. Tela `Iz` (apesar de a rota de busca apontar `/dexametasona`).
- **Apresentação:** Xarope dexclorfeniramina 2 mg/5 mL + betametasona 0,25 mg/5 mL (Kóide D®).
- **Contraindicação por idade:** < 2 anos.
- Volumes fixos por faixa (frequência **não** capturada no trecho — flag runtime):

| Faixa etária | Volume |
|---|---|
| 2 a 6 anos | 1,25 a 2,5 mL |
| 6 a 12 anos | 2,5 mL |
| > 12 anos | 5 a 10 mL |

---

## FLAGS consolidadas (computação)

1. **Tetos textuais, não clampados.** Dexametasona (Máx 16 mg / 160 mL / 10 mg) e Hidrocortisona choque (Máx 100 mg) aparecem como **texto** nas indicações; o app **não** aplica `min` no volume calculado. Se o motor de dose for clampar, será comportamento NOVO (não AS-IS). Flag clínica.
2. **Comprimidos de Dexametasona (3 conc.) compartilham 1 template** (`aGm`) em mg — não converte para nº de comprimidos. Mesma fórmula para 0,5/0,75/4 mg.
3. **Metilprednisolona 125 mg e 500 mg** usam os mesmos fatores (concentração final 62,5 mg/mL em ambos). Conferido, não é bug.
4. **Budesonida** declara peso no controller mas fixa `weight:0` → tratar como lookup puro.
5. Todos os fatores acima conferidos byte-a-byte contra `main.decoded.js` (classes `aSO/aSP/aSN`, `aGo/aGp/aGn/aGm`, `aKT/aKU`, `aPC/aPB/aPD`, `It`, `aRU/aRV`). Fidelidade verificada.
