# Sintomáticos — Antihistamínicos + Antiespasmódico + Antidiarreicos (Pediatria) — AS-IS

> Fonte de verdade: bundle `main.decoded.js` do app CalcMed (Flutter web). Conteúdo transcrito **verbatim** do bundle. Doses/concentrações/marcas exatas como no código.
> Datado da extração: 2026-06-20.

## Visão geral estrutural (3 telas, 3 arquiteturas diferentes)

| Categoria | Rota da categoria | Arquitetura | Itens |
|---|---|---|---|
| **Antihistamínicos** | `/pediatra/antihistaminicos` | **TELA ÚNICA** com acordeão multi-droga (sub-itens SEM rota própria — URL = `null`) | Cetirizina, Dexclorfeniramina, Desloratadina, Fexofenadina, Hidroxizina, Loratadina, Ebastina |
| **Antiespasmódico** | `/pediatra/antiespasmodico` | Lista com **rota por-droga** (cada droga é tela separada) | Escopolamina (Buscopan®), Simeticona, Colidis® |
| **Antidiarreicos** | `/pediatra/antidiarreicos` | **TELA ÚNICA** com acordeão (sub-itens SEM rota própria — URL = `null`) | Saccharomyces boulardii (Floratil®), Zinco |

Notas de arquitetura confirmadas no bundle:
- **Antihistamínicos**: a categoria registra os 7 itens com `url = q` (null). O builder de tela (`A.b4n`) renderiza um header `Sintomáticos` + sub-título `Antihistamínicos` e um acordeão (`A.qD`), com um `switch` por índice ("0".."6") que constrói cada widget de droga. **Não há rota `/pediatra/antihistaminicos/<droga>`.**
- **Antiespasmódico**: a categoria registra os 3 itens COM url própria (`/pediatra/antiespasmodico/escopolamina`, `/simeticona`, `/colidis`). Cada uma navega para uma tela dedicada (header `Antiespasmódico`).
- **Antidiarreicos**: a categoria registra os 2 itens com `url = q` (null). O builder (`A.b4j`) renderiza header `Sintomáticos` + acordeão (`A.qD`) com `switch` por índice ("0","1"). **Não há rota por-droga.**

Padrão de output de cada bloco de droga (ordem das seções no widget):
`Apresentação` → (`Prescrição:` com itens) → `Cuidados` → texto de cuidados. Algumas telas têm input de **Peso** no topo; quando peso = 0 mostram a mensagem de empty state.

**Empty state literal (peso não informado)** — string `u.y` do bundle:
> `Informe todos os dados para obter o resultado.`

(usada nas telas com input de peso: Escopolamina/Buscopan e Hidroxizina.)

---

## Antihistamínicos

**Rota:** `/pediatra/antihistaminicos` — tela única, acordeão de 7 drogas, sub-itens sem rota própria.
**Inputs:** a maioria das drogas NÃO tem input (doses fixas por faixa etária). Exceção: **Hidroxizina** tem input de **Peso (kg)** (campo "Peso", placeholder `0.0`, aceita vírgula decimal).

### Cetirizina

- **Inputs:** nenhum (doses fixas por faixa etária).
- **Apresentação (verbatim):**
  ```
  Solução oral 1 mg/mL
  Solução oral (gotas) 10 mg/mL: Cetrizin®
  ```
- **Prescrição (verbatim, dois grupos):**

  Grupo 1 — Solução oral 1 mg/mL:
  - `Solução oral 1 mg/mL` / `Crianças de 6 a 12 meses:` Dar **2,5 mL (2,5 mg)** VO de 24/24 horas.
  - `Crianças de 1 a 2 anos:` Dar **2,5 mL (2,5 mg)** VO de 24/24 horas. A dose pode ser aumentada para 2,5 mL 12/12 horas.
  - `Crianças de 2 a 6 anos de idade:` Dar **2,5 mL (2,5 mg)** VO de 12/12 horas.
  - `Crianças de 6 a 12 anos de idade:` Dar **5 mL (5 mg)** VO de 12/12 horas ou 10 mL (10 mg) uma vez ao dia.

  Grupo 2 — Solução oral (gotas) 10 mg/mL:
  - `Crianças de 2 a 6 anos de idade:` Dar **5 gotas (2,5 mg)** VO de 12/12 horas.
  - `Crianças de 6 a 12 anos de idade:` Dar **10 gotas (5 mg)** VO de 12/12 horas.
- **Cuidados (verbatim):**
  ```
  - Em bula posologia para crianças a partir de 2 anos de idade.
  - Segunda geração. Não causa sedação.
  - Para mais detalhes acesse a bula.
  ```

### Dexclorfeniramina

- **Inputs:** nenhum.
- **Apresentação (verbatim):**
  ```
  Xarope 2 mg/5 mL: Histamin®
  Solução gotas 2,8 mg/mL: Polaramine®
  ```
- **Prescrição (verbatim):** (header do grupo: `Xarope 2 mg/5 mL`)
  - `Crianças de 2 a 6 anos de idade:` `0,5 mg/dose` Dar **1,25 mL (xarope) ou 5 gotas (ou 1 gota/2 kg)** VO de 8/8 horas. Dose máxima: 7,5 mL/dia ou 30 gotas/dia
  - `Crianças de 6 a 12 anos de idade:` `1 mg/dose` Dar **2,5 mL (xarope) ou 10 gotas (ou 1 gota/2 kg)** VO de 8/8 horas. Dose máxima: 15 mL/dia ou 60 gotas/dia
  - `Crianças ≥ 12 anos de idade:` `2 mg/dose` Dar **5 mL (xarope) ou 20 gotas** VO 3 a 4 x ao dia. Dose máxima: 30 mL/dia ou 120 gotas/dia
- **Cuidados (verbatim):**
  ```
  - Posologia para crianças a partir de 2 anos de idade.
  - Risco de sedação e hipotensão.
  - Para mais detalhes acesse a bula.
  ```

### Desloratadina

- **Inputs:** nenhum.
- **Apresentação (verbatim):**
  ```
  Xarope 0,5 mg/mL: Esalerg®, Leg®
  Solução gotas 1,25 mg/mL: Esalerg®
  ```
- **Prescrição (verbatim):**
  - `Crianças de 6 a 11 meses: 1 mg` Dar **2 mL ou 16 gotas** VO uma vez ao dia.
  - `Crianças de 1 a 5 anos de idade: 1,25 mg` Dar **2,5 mL ou 20 gotas** VO uma vez ao dia.
  - `Crianças de 6 a 11 anos de idade: 2,5 mg` Dar **5 mL ou 40 gotas** VO uma vez ao dia.
  - `Crianças maiores que 12 anos de idade: 5 mg` Dar **10 mL ou 80 gotas** VO uma vez ao dia.
- **Cuidados (verbatim):**
  ```
  - Posologia para crianças a partir de 6 meses de idade.
  - Segunda geração. Não causa sedação.
  - Para mais detalhes acesse a bula.
  ```

### Fexofenadina

- **Inputs:** nenhum (doses por faixa etária; cuidado nota o peso 10,5 kg como switch clínico, mas SEM campo de input).
- **Apresentação (verbatim):**
  ```
  Suspensão oral 6 mg/mL: Allegra pediátrico®
  ```
- **Prescrição (verbatim):**
  - `Crianças de 6 meses a 2 anos de idade:` Dar **2,5 mL (15 mg)** VO de 12/12 horas.
  - `Crianças de 2 a 11 anos de idade:` Dar **5 mL (30 mg)** VO de 12/12 horas.
- **Cuidados (verbatim):**
  ```
  - Posologia para crianças a partir de 6 meses de idade.
  - Se a criança pesar menos que 10,5 kg, dar 2,5 mL 2x ao dia (independente da idade).
  - Se a criança pesar mais que 10,5 kg, dar 5 mL 2x ao dia (independente da idade).
  - Segunda geração. Não causa sedação. 
  - Para mais detalhes acesse a bula.
  ```

### Hidroxizina

- **Inputs:** **Peso (kg)** — campo "Peso", placeholder `0.0`, aceita decimal com vírgula. Empty state (peso=0): `Informe todos os dados para obter o resultado.`
- **Apresentação (verbatim):**
  ```
  Solução oral (xarope) 2 mg/mL: Hixizine®
  ```
- **Prescrição (verbatim, dose calculada por peso):**
  - `Dar` **[valor calculado] mL ([valor calculado] mg)** VO de 8/8 horas.
  - **Template literal do cálculo (do bundle):**
    - mL = `peso × 0.35` (com teto: `if (mL > 14) mL = 14`)
    - mg = `peso × 0.7` (com teto: `if (mg > 28) mg = 28`)
    - Ou seja: 0,35 mL/kg (≈0,7 mg/kg) por dose, máx 14 mL / 28 mg por dose.
- **Cuidados (verbatim):**
  ```
  - Posologia para crianças a partir de 6 meses de idade.
  - Risco de sedação e hipotensão.
  - Para mais detalhes acesse a bula.
  ```

### Loratadina

- **Inputs:** nenhum (dose por faixa de peso, mas SEM campo de input — faixas fixas).
- **Apresentação (verbatim):**
  ```
  Solução oral (xarope) 1 mg/mL: Claritin®, Histadin®, Loratamed®
  ```
- **Prescrição (verbatim):**
  - `Peso corporal < 30 kg:` Dar **5 mL (5 mg)** VO uma vez ao dia.
  - `Peso coroporal ≥ 30 kg:` Dar **10 mL (10 mg)** VO uma vez ao dia.
    > NOTA DE FIDELIDADE: o bundle grafa literalmente `Peso coroporal ≥ 30 kg:` (typo "coroporal" no segundo item). Transcrito como está.
- **Cuidados (verbatim — string compartilhada `u.xq`):**
  ```
  - Posologia para crianças a partir de 2 anos de idade.
  - Segunda geração. Não causa sedação.
  - Para mais detalhes acesse a bula.
  ```

### Ebastina

- **Inputs:** nenhum.
- **Apresentação (verbatim):**
  ```
  Xarope 1 mg/mL: Ebastel®
  ```
- **Prescrição (verbatim):**
  - `Crianças de 2 a 5 anos de idade:` Dar **2,5 mL (2,5 mg)** VO uma vez ao dia.
  - `Crianças de 6 a 11 anos de idade:` Dar **5 mL (5 mg)** VO uma vez ao dia.
  - `Crianças acima de 12 anos de idade:` Dar **10 mL (10 mg)** VO uma vez ao dia.
- **Cuidados (verbatim — string compartilhada `u.xq`, idêntica à Loratadina):**
  ```
  - Posologia para crianças a partir de 2 anos de idade.
  - Segunda geração. Não causa sedação.
  - Para mais detalhes acesse a bula.
  ```

---

## Antiespasmódico

**Rota da categoria:** `/pediatra/antiespasmodico`. Diferente das outras: cada droga tem **tela/rota própria** (header `Antiespasmódico`).

### Escopolamina (Buscopan®)

- **Rota:** `/pediatra/antiespasmodico/escopolamina` (widget `A.Hx`).
- **Inputs:** **Peso (kg)** — campo "Peso", placeholder `0.0`, decimal com vírgula. Empty state (peso=0): `Informe todos os dados para obter o resultado.`
- **Apresentação (verbatim):**
  ```
  Solução oral 10 mg/mL: Buscopan®
  Solução injetável 20 mg/mL: Buscopan®
  ```
- **Prescrição (verbatim; doses calculadas por peso — templates literais do bundle):**
  - `Solução oral 10 mg/mL:` / `< 3 meses:` **[peso × 3, 0 casas] gotas** gotas (1,5 mg/kg) via oral de 8/8 horas.
    > (output literal: `" "+B.e.t(j.d*3,0)+" gotas"` seguido de `" gotas (1,5 mg/kg) via oral de 8/8 horas."` — note a repetição "gotas gotas" como está no bundle.)
  - `3 a 11 meses:` **[peso × 1,4, 0 casas] gotas** (0,7 mg/kg) via oral de 8/8 horas ou 10 gotas via oral de 8/8 horas.
  - `1 a 6 anos:` **[peso × 0,6, 0 casas] a [peso × 1, 0 casas] gostas** (0,3 a 0,5 mg/kg) via oral de 8/8 horas ou 10-20 gotas via oral de 8/8 horas.
    > NOTA DE FIDELIDADE: o bundle grafa `gostas` (typo de "gotas") neste item. Transcrito verbatim.
  - `> 6 anos:` **20 a 40 gotas** via oral, 3 a 5 vezes ao dia.
  - `Uso endovenso, intramuscular ou subcutâneo` / `Lactentes e menores de 12 anos:` **[peso × 0,015, 1 casa] a [peso × 0,03, 1 casa] mL** (0,3 a 0,6 mg/kg), EV/IM/SC. (Dose máxima diária: **[peso × 0,075] mL**)
  - `> 12 anos:` **1 a 2 mL** (20-40 mg), EV/IM/SC. (Dose máxima diária: 5 mL/dia)
  - **Templates de cálculo (literais):**
    - gotas <3m = `peso × 3` (0 casas)
    - gotas 3–11m = `peso × 1.4` (0 casas)
    - gotas 1–6a = `peso × 0.6` a `peso × 1` (0 casas)
    - mL EV/IM/SC <12a = `peso × 0.015` a `peso × 0.03` (1 casa); máx diária = `peso × 0.075` mL
- **Vias:** VO, EV, IM, SC.
- **Cuidados (verbatim):**
  ```
  - Uso com cautela em menores de 6 anos.
  - Solução injetável pode ser administrada várias vezes ao dia, desde que não exceda dose máxima diária.
  - Para mais detalhes acesse a bula.
  ```

### Simeticona

- **Rota:** `/pediatra/antiespasmodico/simeticona` (widget `A.IH`).
- **Inputs:** nenhum (doses fixas por faixa, sem campo de peso).
- **Apresentação (verbatim):**
  ```
  Solução gotas (75 mg/mL/30 gotas)
  ```
- **Prescrição (verbatim):**
  - `Lactentes:` **4 a 8 gotas (10 a 20 mg)**, 1 a 4 vezes ao dia. (Máx: 240 mg/dia)
  - `Até 12 anos:` **8 a 16 gotas (20 a 40 mg)**, 1 a 4 vezes ao dia. (Máx: 480 mg/dia)
- **Cuidados (verbatim):**
  ```
  - Conforme o fabricante, 1 mL pode variar de 25 a 30 gotas.
  - Simeticona é indicado como antifisético, ou seja, para pacientes com excesso de gases no aparelho digestivo.
  - Para mais detalhes acesse a bula.
  ```

### Colidis®

- **Rota:** `/pediatra/antiespasmodico/colidis` (widget `A.Hs`).
- **Inputs:** nenhum (dose independe de peso e idade).
- **Apresentação (verbatim):**
  ```
  Solução gotas
  ```
- **Prescrição (verbatim):**
  - `Dar` **5 gotas** via oral uma vez ao dia.
- **Cuidados (verbatim):**
  ```
  - Colidis é um probiótico e possui em sua composição o Limosilactobacillus reuteri.
  - Dose independe do peso e da idade.
  - Para mais detalhes acesse a bula.
  ```

---

## Antidiarreicos

**Rota:** `/pediatra/antidiarreicos` — tela única, acordeão de 2 drogas, sub-itens sem rota própria (widget builder `A.b4j`, header `Sintomáticos`).
**Inputs:** nenhum em nenhuma das duas drogas.

### Saccharomyces boulardii (Floratil®)

- **Inputs:** nenhum.
- **Apresentação (verbatim):**
  ```
  Pó oral 250 mg: Floratil® AT
  ```
- **Prescrição (verbatim):**
  - `Administrar o pó contido no envelope diretamente na boca ou adicionado a mamadeiras e a pequenas quantidades de líquidos ou alimentos sólidos.` Fazer **1 a 2 envelopes**, duas vezes ao dia, por 2 a 3 dias.
- **Cuidados (verbatim):**
  ```
  - Para mais detalhes acesse a bula.
  ```

### Zinco

- **Inputs:** nenhum.
- **Apresentação:** **AUSENTE no bundle.** ⚠️ FLAG — o widget de Zinco (`A.dGQ`) NÃO renderiza uma seção `Apresentação` nem `Cuidados`; só renderiza a seção `Prescrição:`. As apresentações estão embutidas no próprio texto da prescrição (Sulfato de Zinco comprimido e solução). Não há marca(R) comercial citada.
- **Prescrição (verbatim — montada das strings `u.Cn`, `u.n9`, `u.dc`, `u.uh` + valores fixos):**
  - `Menor que 6 meses:`
    - `a. Sulfato de Zinco (54,89 mg / 20 mg - Zinco elementar)` - Dissolver **meio comprimido** em água ou SRO e dar uma vez ao dia por 10 a 14 dias.
    - `OU`
    - `b. Sulfato de Zinco (17,60) mg/mL)` - Dar **2,5 mL (10 mg - Zinco elementar)** uma vez ao dia por 10 a 14 dias.
  - `Maior que 6 meses:`
    - `a. Sulfato de Zinco (54,89 mg / 20 mg - Zinco elementar)` - Dissolver **um comprimido** em água ou SRO e dar uma vez ao dia por 10 a 14 dias. Crianças maiores podem mastigar ou engolir os comprimidos.
    - `OU`
    - `b.Sulfato de Zinco (17,60) mg/mL)` - Dar **5 mL (20 mg - Zinco elementar)** uma vez ao dia por 10 a 14 dias.
    > NOTAS DE FIDELIDADE (transcritas verbatim do bundle):
    > - `Sulfato de Zinco (17,60) mg/mL)` — parêntese desbalanceado / posicionamento de unidade estranho, como está no bundle (string `u.n9` e `u.uh`).
    > - String `u.uh` grafa `b.Sulfato` (sem espaço após "b.") enquanto `u.n9`/`u.Cn` usam "a. " com espaço.
    > - Frequências e vias: VO (oral), uma vez ao dia, por 10 a 14 dias.
- **Cuidados:** **AUSENTE** (sem seção Cuidados neste widget).

> Cross-ref de cérebro: a confusão histórica do dev sobre "[Pediatria] Tela de Zinco" e o gap de produto do Saccharomyces boulardii estão registrados em `project_zinco_antidiarreicos_migracao.md`. Este AS-IS confirma: hoje ambos vivem na tela única `/pediatra/antidiarreicos` em acordeão, sem rota por-droga.

---

## Strings de tabela resolvidas (referência de auditoria)

| Ref | Valor literal |
|---|---|
| `u.y` | `Informe todos os dados para obter o resultado.` |
| `u.xq` | `- Posologia para crianças a partir de 2 anos de idade.\n- Segunda geração. Não causa sedação.\n- Para mais detalhes acesse a bula.` (cuidados de Loratadina e Ebastina) |
| `u.Cn` | `Menor que 6 meses:\n    a. Sulfato de Zinco (54,89 mg / 20 mg - Zinco elementar) - Dissolver ` |
| `u.xt` | `em água ou SRO e dar uma vez ao dia por 10 a 14 dias.` |
| `u.n9` | `   \nOU\n\n    b. Sulfato de Zinco (17,60) mg/mL) - Dar ` |
| `u.dc` | `\nMaior que 6 meses:\n    a. Sulfato de Zinco (54,89 mg / 20 mg - Zinco elementar) - Dissolver ` |
| `u.mf` | ` em água ou SRO e dar uma vez ao dia por 10 a 14 dias.\n  \n  Crianças maiores podem mastigar ou engolir os comprimidos.` |
| `u.uh` | `\nOU\n\n   b.Sulfato de Zinco (17,60) mg/mL) - Dar` |
