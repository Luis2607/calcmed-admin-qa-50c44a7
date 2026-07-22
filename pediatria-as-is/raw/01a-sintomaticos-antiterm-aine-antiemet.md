# Sintomáticos — Antitérmicos/Analgésicos · Anti-inflamatórios · Antieméticos (Pediatria AS-IS)

> Fonte de verdade: app CalcMed (Flutter web), conteúdo compilado em `_source/main.decoded.js`. Transcrição **verbatim** dos textos clínicos. Valores que dependem de peso/idade aparecem como cálculos no código → marcados como `[valor calculado]` com o template literal documentado.

Estes três menus pertencem ao grupo **Sintomáticos** do módulo Pediatra. Estrutura do menu (do bundle):

| Categoria | slug | Rota | Itens (nesta ordem) |
|---|---|---|---|
| Antitérmicos e Analgésicos | `antitermicoseanalgesicos` | `/pediatra/antitermicos-analgesicos` | Dipirona, Paracetamol, Ibuprofeno |
| Anti-inflamatórios | `aine` | `/pediatra/aine` | Cetoprofeno, Ibuprofeno (compartilhado), Nimesulida |
| Antieméticos | `antiemetico` | `/pediatra/antiemetico` | Bromoprida, Metoclopramida, Ondansetrona, Dimenidrato |

> **Nota sobre Ibuprofeno:** o menu de Anti-inflamatórios lista os itens na ordem `Cetoprofeno, [Ibuprofeno], Nimesulida` (a segunda posição reaponta para a mesma tela de Ibuprofeno usada em Antitérmicos — é o mesmo widget `adT`/`AdtPediatra`). Documentado uma vez na seção de Antitérmicos.

> **Padrão de UI comum a quase todas as telas:**
> - Campo **Peso** (input numérico, placeholder `"0.0"`, label "Peso", 2 casas decimais).
> - Telas com lógica por idade têm também: campo **Idade** (input numérico, label "Idade") + **dropdown de unidade** (Meses/Anos — `selectAge`).
> - **Empty state** (quando dados insuficientes): `"Informe todos os dados para obter o resultado."`
> - Seções na ordem: Apresentação → Dose usual → Prescrição → (resultado calculado / contraindicação) → Cuidados.
> - Paracetamol é exceção: só pede **Peso** (sem idade).
> - Metoclopramida é exceção: tela **só de aviso** (sem inputs, sem cálculo).

---

## Antitérmicos e Analgésicos

**Rota:** `/pediatra/antitermicos-analgesicos` · Título da barra: "Antitérmicos e Analgésicos"

### Dipirona

**Rota:** `/pediatra/antitermicos-analgesicos` (item Dipirona) · Título: "Antitérmicos e Analgésicos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos). Regra: se unidade = Meses e idade > 12, força idade=12 e troca unidade para Anos (`selectAge` vira "12"/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Solução gotas 500 mg/mL: Novalgina®, Dorflex Uno®
Solução oral 50 mg/mL: Novalgina®, Dorflex Uno®
Solução injetável 500 mg/mL: Novalgina®, Dorflex Uno®
```

**Prescrição (dose por faixa de peso):** a prescrição é selecionada por faixas de peso. As três vias aparecem juntas em cada faixa:
- Dipirona (gotas) – Dar `[X gotas]` VO em até 6/6 horas.
- Dipirona (Solução oral) – Dar `[Y mL]` VO em até 6/6 horas.
- Dipirona (Injetável) – `[Z mL]` EV/IM em até 6/6 horas.

Tabela de faixas (verbatim, condicional por peso):

| Faixa de peso | Gotas (VO 6/6h) | Solução oral (VO 6/6h) | Injetável (EV/IM 6/6h) | Observação da via injetável |
|---|---|---|---|---|
| ≥ 5 e < 9 kg | 2 a 5 gotas | 1,25 a 2,5 mL | 0,1 a 0,2 mL | "IM em até 6/6 horas.\n\nContraindicado via Endovenosa em menores que 1 ano." |
| ≥ 9 e < 16 kg | 3 a 10 gotas | 2,5 a 5 mL | 0,2 a 0,5 mL | "EV/IM em até 6/6 horas." |
| ≥ 16 e < 24 kg | 5 a 15 gotas | 3,75 a 7,5 mL | 0,3 a 0,8 mL | "EV/IM em até 6/6 horas." |
| ≥ 24 e < 31 kg | 8 a 20 gotas | 5 a 10 mL | 0,4 a 1,0 mL | "EV/IM em até 6/6 horas." |
| ≥ 31 e < 46 kg | 10 a 30 gotas | 7,5 a 15 mL | 0,5 a 1,5 mL | "EV/IM em até 6/6 horas." |
| ≥ 46 e < 53 kg | 15 a 35 gotas | 8,75 a 17,5 mL | 0,8 a 1,8 mL | "EV/IM em até 6/6 horas." |

**Mensagens condicionais (em vez da prescrição):**
- Se idade < 3 meses → **"Contraindicado Dipirona"**.
- Se peso ≥ 53 kg → **"Avalie dose para adultos"**.
- (`isWeightOverEqual5Less9` etc. são os gates das faixas acima.)

**Cuidados:**
```
- Posologia para crianças a partir de 3 meses de idade e pesando acima de 5 kg.
- Para mais detalhes acesse a bula.
```

---

### Paracetamol

**Rota:** `/pediatra/antitermicos-analgesicos` (item Paracetamol) · Título: "Antitérmicos e Analgésicos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0". **NÃO pede idade** (controller só tem `weight`).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Suspensão gotas 200 mg/mL: Tylenol Gotas®
Suspensão oral 32 mg/mL: Tylenol Criança®
Suspensão oral 100 mg/mL: Tylenol Bebê®
```

**Dose usual** (texto, sob título "Abaixo de 12 anos:"):
```
Abaixo de 12 anos:
Suspensão gotas: 200 mg/mL
1 gota/kg a cada 4 a 6 horas (Dose máxima: 35 gotas/dose)

Suspensão oral 32 mg/mL:
10 a 15 mg/kg/dose a cada 4 a 6 horas.

Suspensão oral 100 mg/mL: Tylenol Bebê® 10 a 15 mg/kg/dose a cada 4 a 6 horas.
```

**Prescrição (calculada a partir do peso):**
- Paracetamol gotas – Dar `[valor calculado]` gotas VO a cada 4 a 6 horas.
  - Template: `"Paracetamol gotas – Dar " + [gotas] + " gotas VO a cada 4 a 6 horas.\n"`
  - Cálculo: `weightLimitedTo30` = peso (limitado a máx **35** — observação: nome interno diz "30" mas o teto efetivo no código é `if(r>35)r=35`), formatado com 0 casas.
- Paracetamol xarope (32 mg/mL) - Dar `[valor calculado]` mL VO a cada 4 a 6 horas.
  - Template: `"Paracetamol xarope (32 mg/mL) - Dar " + [mL] + " mL VO a cada 4 a 6 horas.\n"`
  - Cálculo: `weightX13` = `peso * 13 / 32`, 1 casa.
- Paracetamol xarope (100 mg/mL) - Dar `[valor calculado]` mL VO a cada 4 a 6 horas.
  - Template: `"Paracetamol xarope (100 mg/mL) - Dar " + [mL] + " mL VO a cada 4 a 6 horas."`
  - Cálculo: `weightX013` = `peso * 0.13`, 1 casa.

**Cuidados:**
```
- Dose diária máxima 50-75 mg/kg/24 horas.
- Para mais detalhes acesse a bula.
```

---

### Ibuprofeno

**Rota:** `/pediatra/antitermicos-analgesicos` (item Ibuprofeno) **e** `/pediatra/aine` (item compartilhado) · Título da barra: "Antitérmicos e Analgésicos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Suspensão gotas 50 mg/mL: Alivium®, Ibuprotrat®, Advil®
Suspensão gotas 100 mg/mL: Alivium®, Advil®
Suspensão gotas 200 mg/mL: Alivium® GC
```

**Dose usual** (três blocos, cada um com cabeçalho "Acima de 6 meses:"):
- **Suspensão gotas: 50 mg/mL** — Acima de 6 meses: ` 1 a 2 gotas/kg a cada 6 ou 8 horas. (Dose máxima: 40 gotas/dose)`
- **Suspensão gotas: 100 mg/mL** — Acima de 6 meses: ` 1 gota/kg a cada 6 ou 8 horas. (Dose máxima: 20 gotas/dose)`
- **Suspensão gotas: 200 mg/mL** — Acima de 6 meses: ` 1 gota/2 kg (febre ≥ 39 °C) ou 1 gota/4 kg (febre < 39°C) a cada 6 ou 8 horas. (Dose máxima: 10 gotas/dose)`

**Prescrição (calculada a partir do peso):** três linhas, sufixo comum "gotas VO a cada 6 ou 8 horas." (string `a8`):
- **Ibuprofeno (50 mg/mL) -** ` [min] a [max] ` gotas VO a cada 6 ou 8 horas.
  - min = peso (teto 40), 0 casas; max = `peso*2` (teto efetivo: se peso≥40 usa 20; senão `peso*2`), 0 casas. (Template: `" " + [min] + " a " + [max] + " "`.)
- **Ibuprofeno (100 mg/mL) -** ` [valor] ` gotas VO a cada 6 ou 8 horas.
  - valor = peso (teto 20), 0 casas.
- **Ibuprofeno (200 mg/mL) -** ` [min] a [max] ` gotas VO a cada 6 ou 8 horas.
  - min = `peso/4` (teto 10, arredondado p/ baixo), 0 casas; max = `peso/2` (teto 10), 0 casas.

**Mensagens condicionais:**
- Se não passou no gate de idade (`isAgeOver6Months` falso) → **"Contraindicado Ibuprofeno"**.
- (Regra `isAgeOver6Months`: idade ≥ 6 se unidade=Meses, ou idade ≥ 1 se unidade=Anos.)

**Cuidados:**
```
- Posologia para crianças a partir de 6 meses de idade.
- Risco de dispepsia.
- Para mais detalhes acesse a bula.
```

---

## Anti-inflamatórios

**Rota:** `/pediatra/aine` · Itens: Cetoprofeno, Ibuprofeno (ver acima, compartilhado), Nimesulida

### Cetoprofeno

**Rota:** `/pediatra/aine` (item Cetoprofeno) · Título da barra: "Anti-inflamatórios" · Subtítulo: "Cetoprofeno VO"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Solução oral 20 mg/mL: Profenid®, Cetofenid®
Xarope 1 mg/mL: Profenid®
```

**Dose usual:**
- **Solução oral:** (cabeçalho "Acima de 1 ano:")
  ```
  Acima de 1 ano: 1 gota/kg a cada 6 ou 8 horas
  7 a 11 anos: 25 gotas a cada 6 ou 8 horas
  ≥ 12 anos: 50 gotas a cada 6 ou 8 horas. (Dose máxima diária: 300 gotas)
  ```
- **Xarope:** (cabeçalho "≥ 1 ano:")
  ```
  ≥ 1 ano: 0,5 mg/kg/dose a cada 6 ou 8 horas. (Dose máxima: 2 mg/kg/dia)
  ```

**Prescrição (condicional por idade; duas vias por faixa):** rótulos "Cetoprofeno 20 mg/mL -" e "Cetoprofeno 1 mg/mL -".

| Faixa de idade | Cetoprofeno 20 mg/mL | Cetoprofeno 1 mg/mL |
|---|---|---|
| < 12 meses (`isAgeLess12Months`) | " contraindicado." | ` [peso*0,5] mL` VO a cada 6 ou 8 horas. |
| > 1 e ≤ 7 anos (`isAgeOver1Less7Years`) | ` [peso (0 casas)] gotas ` VO a cada 6 ou 8 horas. | ` [peso*0,5] mL` VO a cada 6 ou 8 horas. |
| > 7 e ≤ 12 anos (`isAgeOver7Less12Years`) | ` 25 gotas ` VO a cada 6 ou 8 horas. | ` [peso*0,5] mL` VO a cada 6 ou 8 horas. |
| ≥ 12 anos (`isAgeOver12Years`) | ` 50 gotas ` VO a cada 6 ou 8 horas. | ` [peso*0,5] mL` VO a cada 6 ou 8 horas. |

> Cálculo do mL (xarope 1 mg/mL): `peso * 0.5`, 1 casa decimal.

**Mensagens condicionais:**
- Se idade < 6 meses (`isAgeLess6months`) ou < 12 meses (`isAgeLess12Months`) → **"Contraindicado Cetoprofeno"**.

**Cuidados:**
```
- Solução oral e xarope contraindicados em menores de 1 ano de idade.
- Risco de dispepsia.
- Para mais detalhes acesse a bula.
```

---

### Nimesulida

**Rota:** `/pediatra/aine` (item Nimesulida) · Título da barra: "Sintomáticos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Suspensão gotas 50 mg/mL: Scaflam®
```

**Dose usual:**
```
Suspensão gotas: 50 mg/mL
Acima de 12 anos: 1 gota/kg a cada 12 horas. (Dose máxima diária: 40 gotas)
```

**Prescrição (calculada a partir do peso):**
- Nimesulida gotas (50 mg/mL) - ` [valor calculado]` gotas VO de 12/12 horas.
  - Template: `"Nimesulida gotas (50 mg/mL) -" + " " + [gotas] + " gotas VO de 12/12 horas."`
  - Cálculo: gotas = peso (teto **40**: `if(peso>40)peso=40`), 0 casas.

**Mensagens condicionais:**
- Se idade não ≥ 12 anos (`isAgeOver12years` falso) → **"Contraindicado Nimesulida"**.
  - (Regra: idade > 12 se unidade=Meses, ou idade ≥ 12 se unidade=Anos.)

**Cuidados:**
```
- Posologia para crianças a partir de 12 anos de idade.
- Não exceder um total de 40 gotas/dose.
- Risco de dispepsia.
- Para mais detalhes acesse a bula.
```

---

### ⚠️ ÓRFÃO — Diclofenaco (Cataflam®)

> **STATUS: CONTEÚDO PRESENTE NO BUNDLE, SEM ROTA NO MENU.** O widget de Diclofenaco (`adL`/`EquationDiclofenacoPediatra`) existe e é totalmente funcional no código, mas **não aparece na lista** de itens de Anti-inflamatórios (`aine` lista apenas Cetoprofeno, Ibuprofeno, Nimesulida). Não é navegável pelo usuário no estado atual. Documentado integralmente abaixo por fidelidade.

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Suspensão gotas 15 mg/mL: Cataflam® (Diclofenaco resinato)
```

**Dose usual:**
```
Suspensão gotas: 15 mg/mL
Acima de 1 ano: 1 a 4 gotas/kg/dia dividida 2 a 3 tomadas.
```

**Prescrição (calculada a partir do peso):**
- Diclofenaco gotas (15 mg/mL) - ` [min] a [max] ` gotas VO no dia. Dividir em 2 a 3 tomadas no dia.
  - Template: `"Diclofenaco gotas (15 mg/mL) -" + " " + [min] + " a " + [max] + " " + " gotas VO no dia. Dividir em 2 a 3 tomadas no dia."`
  - min = peso (0 casas); max = `peso*4` (teto **300**: `if(peso*4>=300)→300`), 0 casas.

**Mensagens condicionais:**
- Se idade não > 12 meses / ≥ 1 ano (`isAgeOver12Months` falso) → **"Contraindicado Diclofenaco"**.

**Cuidados:**
```
- Não é indicado para crianças abaixo de 14 anos, com exceção de casos de artrite juvenil crônica.
- Posologia para crianças a partir de 1 ano de idade.
- Não exceder um total de 300 gotas por dia.
- Risco de dispepsia.
- Para mais detalhes acesse a bula.
```

---

## Antieméticos

**Rota:** `/pediatra/antiemetico` · Itens: Bromoprida, Metoclopramida, Ondansetrona, Dimenidrato

### Bromoprida

**Rota:** `/pediatra/antiemetico` (item Bromoprida) · Título da barra: "Antieméticos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Solução gotas pediátricas 4 mg/mL: Digesan®, Movinau®
Solução oral (xarope) 1 mg/mL: Movinau®
Solução injetável 5 mg/mL: Digesan®, Plamet®
```

**Dose usual** (sob título "Solução gotas pediátricas: 4 mg/mL"):
```
Solução gotas pediátricas: 4 mg/mL
1 a 2 gotas/kg a cada 8 horas. (Dose máxima: 58 gotas/dose)

Solução oral (xarope): 1 mg/mL
0,5 a 1 mL/kg dividido em três tomadas/dia. (Dose máxima: 10 mL/dose)

[Solução injetável: 5 mg/mL]
0,5 a 1 mg/kg/dia via IM/EV. (Dose máxima: 10 mg/dose)
```

**Prescrição (calculada; só aparece se idade ≥ 1 ano — `isAgeOver1Year`):**
- Bromoprida gotas (4 mg/mL) - ` [min] a [max] gotas` VO a cada 8 horas.
  - min = `weightLimit58` = peso (teto 58), 0 casas; max = `calculateGotas` = `peso*2` (teto 58), 0 casas.
- Bromoprida xarope (1 mg/mL) - ` [min] a [max] mL` VO cada 8 horas.
  - min = `calculateXarope6` = `peso/6` (teto 10), 1 casa; max = `calculateXarope3` = `peso/3` (teto 10), 1 casa.
- Bromoprida (5 mg/mL) – Fazer ` [min] a [max] mL` via IM/EV por dia.
  - Sufixo literal: ` via IM/EV por dia.\n         - Quando realizado endovenoso (EV) pode ser diluído em SG ou SF 0,9%.`
  - min = `calculate01` = `peso*0.1` (teto 2), 1 casa; max = `calculate02` = `peso*0.2` (teto 2), 1 casa.

**Mensagens condicionais:**
- Se idade < 1 ano (`isAgeLess1Year`) → **"Contraindicado Bromoprida"**.

**Cuidados:**
```
- O antiemético de 1ª escolha para crianças é a ondansentrona.
- Posologia para crianças a partir de 1 ano de idade.
- Risco de reação extrapiramidal.
- Para mais detalhes acesse a bula.
```

---

### Metoclopramida

**Rota:** `/pediatra/antiemetico` (item Metoclopramida) · Título da barra: "Antieméticos"

> **TELA SÓ DE AVISO.** O widget de Metoclopramida (`HM`/`b9B`/`dy_`) **não tem inputs, não tem calculadora, não tem Apresentação/Dose usual/Prescrição**. Renderiza unicamente o bloco **"Cuidados"**.

**Inputs:** nenhum.

**Cuidados (único conteúdo da tela):**
```
- Evite em crianças para tratamento de náuseas e vômitos.
- Metoclopramida pode causar Discinesia Tardia, um grave distúrbio do movimento que geralmente é irreversível.
- Não há tratamento conhecido para Discinesia Tardia.
- Para mais detalhes acesse a bula.
```

---

### Ondansetrona

**Rota:** `/pediatra/antiemetico` (item Ondansetrona) · Título da barra: "Antieméticos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Solução oral 4 mg/5 mL: Ondset®
Solução injetável 2 mg/mL: Nausedron®, Ansentron®, Ontrax®
Filme orodispersível 4 mg ou 8 mg: Ondif®
```

**Dose usual** (sob título "Solução oral: 4 mg/5 mL"):
```
Solução oral: 4 mg/5 mL
De 2 a 11 anos: 5 mL VO a cada 8 horas.

Solução injetável: 2 mg/mL
0,15 mg/kg/dose via EV/IM. (Dose máxima: 4 mg/dose)

Filme orodispersível: 4 mg ou 8 mg
De 2 a 11 anos: 1 filme de 4 mg
≥ 12 anos: 1 a 2 filmes de 4 mg
```

**Prescrição (condicional por idade):**
- Se idade ≥ 1 mês (`isAgeOver1Month`) — apenas injetável:
  - Ondansetrona ` [peso*0,075 (teto 2), 2 casas] mL` IM a cada 8 horas.
  - Ondansetrona ` [peso*0,075] mL + [20 − (peso*0,075)] mL` de SF 0,9% EV em 2 minutos, a cada 8 horas.
- Se idade ≥ 2 anos (`isAgeOver2Years`) — oral + filme + injetável:
  - Ondansetrona solução oral – Dar `5 mL` VO a cada 8 horas.
  - Ondansetrona - Filme orodispersível `4 mg` - aplicar na língua para que dissolva.
  - Ondansetrona ` [peso*0,075] mL` IM a cada 8 horas.
  - Ondansetrona ` [peso*0,075] + [20 − (peso*0,075)] mL` de SF 0,9% EV em 2 minutos, a cada 8 horas.
  - Cálculos: `calculate005` = `peso*0.075` (teto 2); `calculate20005` = `20 - (peso*0.075)`.

**Mensagens condicionais:**
- Se idade < 1 mês (`isAgeLess1Month`) → **"Posologia para náuseas e vômitos pós-operatórios a partir de 1 mês de idade."**

**Cuidados:**
```
- Posologia oral para crianças a partir de 2 anos de idade.
- Posologia injetável para crianças a partir de 1 mês de idade.
- A dose pode ser definida conforme peso ou superfície corporal.
- Para mais detalhes acesse a bula.
```

---

### Dimenidrato

**Rota:** `/pediatra/antiemetico` (item Dimenidrato) · Título da barra: "Antieméticos"

**Inputs:**
- **Peso** (kg) — input numérico, placeholder "0.0".
- **Idade** (valor) + **dropdown de unidade** (Meses/Anos).

**Empty state:** "Informe todos os dados para obter o resultado."

**Apresentação:**
```
Solução oral 2,5 mg/mL: Dramin®
Solução oral gotas 25 mg/mL: Dramin B6® (com piridoxina)
Solução injetável 3 mg/mL: Dramin B6 DL® (com piridoxina)
Solução injetável 50 mg/mL: Nausicalm B6® (com piridoxina)
```

**Dose usual** (sob título "Solução oral: 2,5 mg/mL (Preferido)"):
```
Solução oral: 2,5 mg/mL (Preferido)
De 2 a 6 anos: 5 a 10 mL VO a cada 6 a 8 horas. (Dose máxima: 30 mL/dia)
De 6 a 12 anos: 10 a 20 mL VO a cada 6 a 8 horas. (Dose máxima: 60 mL/dia)

Solução oral gotas: 25 mg/mL
De 2 a 6 anos: 1 gota/kg VO a cada 6 a 8 horas. (Dose máxima: 60 gotas/dia)
De 6 a 12 anos: 1 gota/kg VO a cada 6 a 8 horas. (Dose máxima: 120 gotas/dia)

Solução injetável EV: 3 mg/mL
1,25 mg/kg/dose via EV. (Dose máxima: 300 mg/dia)

Solução injetável IM: 50 mg/mL
1,25 mg/kg/dose via IM. (Dose máxima: 300 mg/dia)
```

**Prescrição (condicional por idade):**

Se 2 a 6 anos (`isAgeOver2YearsLess6`):
- Dimenidrato xarope - Dar `5 a 10 mL` VO a cada 6 a 8 horas.
- Dramin B6 gotas® - Dar ` [weightLimit20] gotas` VO a cada 6 a 8 horas.
- Dramin B6 DL® – Fazer ` [calculateWeight125] mL` + 10 mL SF 0,9% EV em 2 minutos a cada 6 horas.
- Nausicalm B6® – Fazer ` [calculateWeight12550] mL` IM a cada 6 horas.

Se 6 anos+ (`isAgeOver6Years`):
- Dimenidrato xarope - Dar `10 a 20 mL` VO a cada 6 a 8 horas.
- Dramin B6 gotas® - Dar ` [weightLimit40] gotas` VO a cada 6 a 8 horas.
- Dramin B6 DL® – Fazer ` [calculateWeight125] mL` 10 mL SF 0,9% EV em 2 minutos a cada 6 horas. *(nota: nesta faixa o texto sai "Fazer X mL 10 mL SF..." — sem "+", verbatim do bundle)*
- Nausicalm B6® – Fazer ` [calculateWeight12550] mL` IM a cada 6 horas.

> Cálculos: `weightLimit20` = peso (teto 20), 0 casas; `weightLimit40` = peso (teto 40), 0 casas; `calculateWeight125` = `peso*1.25/3` (teto 100), 1 casa; `calculateWeight12550` = `peso*1.25/50` (teto 6), 1 casa.

**Mensagens condicionais:**
- Se idade ≤ 12 meses / < 2 anos (`isAgeLess2Years`) → **"Contraindicado em menores de 2 anos"**.

**Cuidados:**
```
- Posologia para crianças a partir de 2 até 12 anos de idade.
- Evitar dimenidrato injetável em crianças.
- Para mais detalhes acesse a bula.
```

---

## Flags / Notas de fidelidade

1. **Diclofenaco (Cataflam®) é ÓRFÃO** — conteúdo completo no bundle (`EquationDiclofenacoPediatra`), porém ausente da lista `/pediatra/aine`. Não navegável no app atual.
2. **Ibuprofeno é compartilhado** entre Antitérmicos e Anti-inflamatórios (mesmo widget).
3. **Metoclopramida** não tem calculadora — só tela de aviso ("Cuidados").
4. **Paracetamol `weightLimitedTo30`**: nome de variável sugere teto 30, mas o código aplica teto **35** (`if(r>35)r=35`). Mantido conforme bundle; sinalizado por divergência nome×lógica.
5. Faixas de peso da Dipirona são gates de peso (`isWeightOverEqual...`), independentes da idade exibida; idade < 3 meses sobrepõe tudo com "Contraindicado Dipirona".
6. Em todas as telas com Idade, há lógica que limita idade em meses a 12 e converte para Anos automaticamente.
