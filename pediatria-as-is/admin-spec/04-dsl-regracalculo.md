---
tipo: concept
atualizado: 2026-06-21
fontes:
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/03-backend-json.md
  - admin-spec/00-HANDOFF-GUI.md
  - admin-spec/qa/QA-round-1-relatorio.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - raw/func-01-antiterm-aine.md
  - raw/func-04-broncodilatadores.md
  - raw/appwide-03-calculadoras-escores.md
relacionado:
  - 03-backend-json.md
  - 01-sistema-de-tipos.md
  - MODELO-DOSE-PEDIATRICA.md
status: vigente
peso: core
---

# DSL do `regraCalculo` — gramática formal (EBNF) e semântica

> Fecha o item 1+2 da lista "O que RESTA" do QA round 1 (`qa/QA-round-1-relatorio.md`):
> **gramática formal do DSL** portável p/ Dart + **schema formal dos 7 `regra_*`**. O `03-backend-json.md`
> definiu o DSL em prosa (§4) e deu exemplos de `regraCalculo`; este doc dá a GRAMÁTICA fechada (EBNF),
> a WHITELIST de funções, a semântica de avaliação e um exemplo de `regraCalculo` por sub-tipo de dose
> (D1..D8) modelando uma droga real auditada.
>
> Princípio raiz (`03-backend-json.md` §0): a dose é DADO, nunca expressão livre. Uma planilha de
> expressões arbitrárias editável por não-engenheiro é risco de dose por ordem de grandeza em app
> clínico. O DSL é **fechado e whitelisted**: o médico-admin escolhe o sub-tipo e preenche
> fatores/tetos/faixas; o pouco de expressão que existe (`expr`, `teto_expr`, getters, `condicao`) passa
> por um parser próprio sem `eval`, restrito a esta gramática.
>
> Marcação: `[REAL]` = comportamento provado contra o bundle/AS-IS auditado. `[PROPOSTA]` = design de
> backend a confirmar com Gui (backend) + Gustavo (clínico). Decisões humanas (runtime do engine,
> ratificação `>=` do `biggerThen`, ordenação do DAG) NÃO são fechadas aqui — ver §9.

---

## 1. Onde o DSL aparece

`expr` (uma string na gramática deste doc) é o único ponto de "cálculo livre controlado" do sistema.
Aparece em:

| Local | Campo | Molde | O que avalia |
|---|---|---|---|
| `regra_porPeso` (D3) | `saida.expr`, `saida.teto_expr` | T1 | valor da saída / teto condicional (Ibuprofeno `floor(peso/4)`, `peso>=40 ? 20 : null`) |
| `regra_hibrido` (D4) | `ramo.saida.expr`, `gate_idade` (forma estruturada) | T1 | ramo computado; o gate usa forma estruturada (§6.3), não `expr` crua |
| `regra_infusaoBic` (D7) | `getters.<nome>` | T1 | cada getter é uma `expr` sobre inputs + getters anteriores (DAG) |
| `regra_definirDose` | `derivados.expr` | T1 | derivado da dose definida pelo usuário |
| T2 `calculadora-formula` | `formulas.expr` | T2 | fórmula fechada (IMC, QTc, Clearance) |
| T7 `conversor` | `formula` | T7 | multiplica/divide pelos `fator_b` dos dropdowns |
| T4 `escore-por-criterios` | `regras_estagio.condicao` | T4 | expr **booleana** (estágio) |
| T6 `conduta-arvore-decisao` | (gates de nó, se houver) | T6 | expr booleana |

`lookup` (D2), `faixaClearance` (D5) e `regime` (D6) **não usam `expr`** no caso geral: selecionam linha
por faixa e devolvem string/ref. As bordas de faixa são declaradas por `inclusividade`, não por `expr`.
A exceção é o `ramos_substituicao[].condicao` da Dipirona (D2), que é uma `expr` booleana avaliada ANTES
da tabela (§6.2).

---

## 2. Gramática formal (EBNF)

Notação EBNF (ISO/IEC 14977): `=` define, `,` concatena, `|` alterna, `{ }` repete 0+, `[ ]` opcional,
`` agrupa, `" "` terminal literal. Insensível a espaço entre tokens; espaço não é significativo exceto
para separar identificadores de palavras.

```ebnf
(* ===== topo ===== *)
expr            = ternary ;

(* ===== ternário (menor precedência, associa à direita) ===== *)
ternary         = logic_or , [ "?" , ternary , ":" , ternary ] ;

(* ===== booleanos ===== *)
logic_or        = logic_and , { "||" , logic_and } ;
logic_and       = equality , { "&&" , equality } ;

(* ===== comparação / igualdade (não associativas: no máximo 1 por nível) ===== *)
equality        = comparison , [ ( "==" | "!=" ) , comparison ] ;
comparison      = additive  , [ ( "<=" | ">=" | "<" | ">" ) , additive ] ;

(* ===== aritmética (associam à esquerda) ===== *)
additive        = multiplicative , { ( "+" | "-" ) , multiplicative } ;
multiplicative  = unary , { ( "*" | "/" ) , unary } ;

(* ===== unário ===== *)
unary           = [ "!" | "-" ] , primary ;

(* ===== primário ===== *)
primary         = number
                | identifier
                | call
                | "(" , expr , ")" ;

(* ===== chamada de função (apenas nomes da whitelist, §3) ===== *)
call            = func_name , "(" , [ arg_list ] , ")" ;
arg_list        = expr , { "," , expr } ;
func_name       = "min" | "max" | "floor" | "ceil" | "round" | "abs" | "clamp" ;

(* ===== léxico ===== *)
identifier      = letter , { letter | digit | "_" } ;
number          = digit , { digit } , [ "." , digit , { digit } ] ;
letter          = "a".."z" | "A".."Z" ;
digit           = "0".."9" ;
```

Notas de gramática:

- **Precedência** (menor → maior): ternário < `||` < `&&` < igualdade < comparação < `+ -` < `* /` <
  unário < primário/chamada/parênteses. Cobre tudo que o AS-IS faz (`fator × peso`, `min(peso,40)`,
  `peso>=40 ? 20 : peso*2`, `floor(peso/4)`, `b*a*1440/500`).
- **Comparação e igualdade são não-associativas** (`[... ]`, no máximo um operador por nível): proíbe
  `a < b < c`, que em app clínico é ambíguo. Encadeamento se faz com `&&`.
- **Sem notação de potência, sem `%`, sem bitwise, sem vírgula decimal** no literal (a vírgula decimal do
  INPUT do usuário é normalizada para ponto ANTES de chegar à `expr` — §4 guards). Literais usam ponto.
- **`identifier` só referencia tokens declarados** (inputs do molde + getters/saídas anteriores); a
  validação (§7) rejeita identificador não declarado. NÃO existe acesso a propriedade (`a.b`), índice
  (`a[i]`), atribuição (`=`), nem `;`. A ausência dessas regras na gramática é o guard-rail.
- **`-` é binário (subtração) e unário (negação)**; `!` é unário booleano. `- -x` e `!!x` são válidos
  léxico/sintaticamente; a semântica de tipo (§5) define o resultado.

---

## 3. WHITELIST de funções permitidas

Sete funções. Nada fora desta lista parseia (o `func_name` da EBNF é fechado). Sem funções variádicas
além das listadas, sem funções definidas pelo usuário, sem callbacks.

| Função | Aridade | Semântica | Origem AS-IS |
|---|---|---|---|
| `min(a, b)` | 2 | menor de `a`, `b`. Núcleo dos tetos-clamp (`min(peso,40)`, `min(fator×peso,teto)`). | [REAL] func-01 (Ibuprofeno/Nimesulida/Diclofenaco), func-07 (Amox família) |
| `max(a, b)` | 2 | maior de `a`, `b`. | [REAL] (raro; pareia com `min` em faixas) |
| `floor(x)` | 1 | maior inteiro ≤ `x`. | [REAL] func-01 Ibuprofeno 200 mg/mL `floor(peso/4)` |
| `ceil(x)` | 1 | menor inteiro ≥ `x`. | [PROPOSTA] (completude; não observado, mas simétrico a `floor`) |
| `round(x, n)` | 2 | arredonda `x` a `n` casas decimais (`n` inteiro ≥ 0). `round(x,0)` = inteiro. | [REAL] `B.e.t(expr, n)` do bundle |
| `abs(x)` | 1 | valor absoluto. | [PROPOSTA] (Na corrigido / deltas; defensivo) |
| `clamp(x, lo, hi)` | 3 | `min(max(x, lo), hi)`. Açúcar p/ teto bilateral (Terbutalina limite_inferior/superior). | [PROPOSTA] açúcar de `min`+`max`; reduz erro de aninhamento |

> `round` é a única com aridade 2 onde o 2º arg é semântico (casas). A validação (§7) exige `n` literal
> inteiro ≥ 0 em `round(x, n)` (não pode ser `expr` variável) — paridade com `B.e.t(_, n)` do bundle.
> `clamp` é açúcar: o engine pode desugar para `min(max(...))`; existe na whitelist só pela legibilidade
> clínica do teto bilateral. Se Gui preferir não tê-lo, é removível sem perda (todos os usos viram
> `min(max(...))`).

**PROIBIDO** (não está na gramática, logo não parseia): acesso a propriedade/método, indexação, chamada
fora da whitelist, loop, atribuição, comprehension, lambda, `eval`/`Function`, qualquer side-effect,
literais de string dentro de `expr` (strings são dado de `tabela`/`posologia`, nunca operandos de cálculo).

---

## 4. Guards universais do avaliador

Aplicados pelo engine, NÃO declarados por item ([REAL] no AS-IS, §4 do `03-backend-json.md`):

1. **Vírgula → ponto** no input do usuário antes de parsear (`"3,5"` → `3.5`).
2. **`NaN` / `+Inf` / `-Inf` → `0`** no resultado de qualquer `expr`/getter (guard do AS-IS).
3. **Divisão por zero → `0`** (consequência de #2; explicitado por segurança).
4. **Input required ausente → empty state global** (`"Informe todos os dados para obter o resultado."`),
   a `expr` nem chega a avaliar.
5. **Sem exceção em runtime:** o avaliador nunca lança; toda condição de erro cai num dos guards acima.
   (A validação de PARSE acontece no admin/build, §7; em runtime a `expr` já é garantida sintática.)

> Os guards são por que `expr` arbitrária seria perigosa SEM eles: o resultado é sempre um número finito
> ou cai no empty state, nunca um `NaN` exibido como dose.

---

## 5. Semântica de avaliação

- **Tipos:** dois domínios — `Number` (real, dupla precisão) e `Bool`. Aritmética e funções operam em
  `Number`; comparação/igualdade produzem `Bool`; `&& || !` operam em `Bool`; ternário `cond ? a : b`
  exige `cond: Bool` e devolve o ramo escolhido (ambos os ramos do mesmo tipo).
- **Coerção:** NÃO há coerção implícita Number↔Bool. `peso ? a : b` é erro de validação (o `cond` precisa
  ser comparação/booleano explícito: `peso > 0 ? a : b`). Isto evita o "truthiness" silencioso.
- **`null` como sinal de "sem teto":** em `teto_expr`, o ramo que devolve `null` significa "não aplicar
  teto" (Ibuprofeno: `peso>=40 ? 20 : null` = clampa a 20 só acima de 40 kg). `null` NÃO é um valor da
  gramática `expr` pura; é permitido APENAS como ramo terminal literal de um ternário em `teto_expr`
  (regra de validação §7), e o engine o interpreta como "pular o clamp". [PROPOSTA — formaliza o
  `peso>=40 ? 20 : peso*2` da fonte sem inventar um teto fantasma].
- **Ordem de avaliação:** estritamente determinística pela precedência/associatividade da §2. Sem
  curto-circuito observável além do efeito normal de `&&`/`||`/`?:` (irrelevante: sem side-effects).
- **DAG de getters (D7):** cada getter é uma `expr` que pode referenciar inputs e getters DECLARADOS
  ANTES dele. O conjunto forma um grafo acíclico de dependências; o engine avalia em ordem topológica.
  **DECISÃO ABERTA (§9, M3/B-08):** quem ordena (engine resolve topologicamente em runtime, ou o JSON já
  vem em ordem de dependência) e o que fazer com ciclo. Recomendação: **o JSON vem ordenado + o validador
  detecta ciclo no build** (mais simples e portável p/ Dart; runtime não precisa de sort).

---

## 6. Semântica por sub-tipo de dose (D1..D8) — como a `regraCalculo` é interpretada

Mapa `dosing_type` (sub-tipo, `01-sistema-de-tipos.md` §3) → `regraCalculo.tipo` (este DSL). Fecha o item
8 do "RESTA" (K-05):

| Sub-tipo | `dosing_type` | `regraCalculo.tipo` | Usa `expr`? |
|---|---|---|---|
| D1 fixo | `fixo` | **(ausente)** — sem regra; exibe posologias | não |
| D2 lookup | `lookup` | `lookup` (+ `ramos_substituicao`) | só nos `ramos_substituicao.condicao` |
| D3 peso-computado | `peso-computado` | `porPeso` | em `saida.expr`/`teto_expr` quando não-linear |
| D4 hibrido | `hibrido` | `hibrido` | em `ramo.saida.expr`; gate é estruturado |
| D5 renal | `renal` | `faixaClearance` | não (faixas + Cockcroft fixo) |
| D6 regime | `regime` | `regime` | não (modos + faixas) |
| D7 infusao-bic | `infusao-bic` | `infusaoBic` | sim, em cada getter |
| D8 so-aviso | `so-aviso` | **(ausente)** — `corpo.dosagem.aviso` | não |

> D1 e D8 NÃO têm `regraCalculo` (o admin só liga slots e digita texto, como hoje [REAL]). `definirDose`
> (calculada) não é um D próprio: é `regraCalculo.tipo: definirDose` dentro de D3/D5, **bloqueado p/
> publicação até a fase 2** [REAL gate].

### 6.1 Faixas e inclusividade (D2/D5/D6)

Toda faixa (`{min, max}` em idade-meses, peso-kg, ou clearance) carrega inclusividade explícita, porque a
fonte mistura `>=`/`<`/`>` na MESMA droga (B-06, F-06/F-07). Modelo:

```json
{ "min": 5, "max": 9, "inclusividade": "min-inclusivo-max-exclusivo" }
```

`inclusividade ∈ {min-inclusivo-max-exclusivo, min-inclusivo-max-inclusivo, min-exclusivo-max-inclusivo,
min-exclusivo-max-exclusivo}`. Regra de modelagem [PROPOSTA, herdada de `03-backend-json.md` §3.8]: **toda
faixa etária opera sobre idade JÁ normalizada para meses internamente** (12 meses → 1 ano), nunca sobre a
unidade crua; o molde declara se o gate roda ANTES ou DEPOIS da conversão.

---

## 7. Validação do DSL (build/admin, não runtime)

Camada 2 do `validate` (`03-backend-json.md` §5.2). Para publicar item com `regraCalculo`/`expr`:

- **Parse:** a `expr` parseia sem erro contra a EBNF (§2).
- **Identificadores declarados:** toda `identifier` da `expr` existe em `inputs` do molde OU é getter/saída
  anterior no DAG. Identificador órfão = erro (pega o `gE2` órfão da Terbutalina, M3).
- **Whitelist:** toda `call` usa `func_name` da whitelist (§3); aridade correta; `round(x,n)` com `n`
  literal inteiro ≥ 0.
- **`null` só em `teto_expr`:** `null` como ramo de ternário só é válido em `teto_expr`; em qualquer outra
  `expr` é erro.
- **Tipo do `cond` do ternário:** `cond` é comparação/booleano explícito (sem truthiness numérico).
- **Cobertura de faixa (D2/D5/D6):** as faixas cobrem o domínio sem BURACO e sem SOBREPOSIÇÃO; `posologiaRef`
  aponta para posologia existente.
- **`hibrido`:** `gate_idade.se_falso` definido; todo ramo computa OU tem texto; `ramos_neonatais` com
  IG/dias coerentes.
- **clamp vs texto:** trocar um teto de `texto`→`clamp` é comportamento clínico NOVO (F-16) → o validate
  SINALIZA e exige reaprovação médica. Distinguir `min(peso,T)` (clamp na ENTRADA) de `min(fator×peso,T)`
  (clamp na SAÍDA) — quando `fator≠1` diferem e a ordem é load-bearing (B-05).

---

## 8. Cobertura dos 8 sub-tipos — um `regraCalculo` por D, droga real

Cada exemplo modela uma droga AUDITADA (verbatim de `MODELO-DOSE-PEDIATRICA.md` / func-*). `flags[]` aponta
os IDs F-01..F-29 que tocam a droga.

### D1 — fixo · Colidis® (func-02)

Sem `regraCalculo`. Dose literal única, independe de peso e idade.

```json
{
  "tipo": "droga-dose",
  "nome": "Colidis",
  "publico": "pediatrico",
  "corpo": {
    "dosagem": {
      "tipo": "fixo",
      "apresentacoes": [{ "id": "gotas", "label": "Solucao gotas", "forma": "gotas" }],
      "posologias": [
        { "id": "p1", "papel": "direta", "cenario": "", "droga": "Colidis",
          "dose": "5 gotas", "unidade": "gotas", "diluente": "", "viaInline": "Oral",
          "tempo": "", "intervalo": "1x/dia", "esquema": "", "alternativa": false }
      ]
    }
  },
  "observacoes": [{ "id": "o1", "nivel": "footnote", "texto": "Dose independe do peso e da idade." }]
}
```

### D2 — lookup + substituição · Dipirona (func-01)

Lookup por faixa de PESO (6 faixas, strings fixas) com `ramos_substituicao[]` avaliados ANTES da tabela
(o gap M2 do QA: contraindicação e overflow que SUBSTITUEM a tabela). Idade só gateia a contraindicação.

```json
{
  "tipo": "droga-dose",
  "nome": "Dipirona",
  "publico": "pediatrico",
  "corpo": {
    "dosagem": {
      "tipo": "lookup",
      "regraCalculo": {
        "tipo": "lookup",
        "indexar_por": "peso",
        "ramos_substituicao": [
          { "condicao": "idade_meses < 3 || peso < 5", "texto": "Contraindicado Dipirona" },
          { "condicao": "peso >= 53", "texto": "Avalie dose para adultos" }
        ],
        "tabela": [
          { "faixa": { "min_kg": 5,  "max_kg": 9,  "inclusividade": "min-inclusivo-max-exclusivo" },
            "dose": "2 a 5 gotas / 1,25 a 2,5 mL / 0,1 a 0,2 mL injetavel", "frequencia": "6/6h" },
          { "faixa": { "min_kg": 46, "max_kg": 53, "inclusividade": "min-inclusivo-max-exclusivo" },
            "dose": "15 a 35 gotas / 8,75 a 17,5 mL / 0,8 a 1,8 mL", "frequencia": "6/6h" }
        ]
      }
    }
  },
  "flags": ["F-06: leitura de c.b por faixa", "M2: ramos_substituicao"]
}
```

> Semântica: o engine avalia `ramos_substituicao` em ORDEM; a primeira `condicao` verdadeira devolve
> `texto` e PULA a tabela. Se nenhuma, seleciona a linha cuja faixa de peso contém o valor (inclusividade
> declarada). `idade_meses` é a idade já normalizada para meses (§6.1). [PROPOSTA — fecha M2/B-06].

### D3 — peso-computado · Hidroxizina (func-03)

Duas saídas lineares `fator × peso` com teto-clamp; saída crua (`casas: null`, paridade F-10).
`fator = mg_por_kg ÷ concentracao_mg_ml`.

```json
{
  "tipo": "droga-dose",
  "nome": "Hidroxizina",
  "publico": "pediatrico",
  "corpo": {
    "dosagem": {
      "tipo": "peso-computado",
      "apresentacoes": [{ "id": "xarope-2mgml", "label": "Solucao oral 2 mg/mL",
                          "concentracao_mg_ml": 2, "forma": "suspensao" }],
      "regraCalculo": {
        "tipo": "porPeso",
        "saidas": [
          { "id": "mL", "expr": "peso * 0.35", "casas": null, "teto": { "valor": 14, "tipo": "clamp" } },
          { "id": "mg", "expr": "peso * 0.70", "casas": null, "teto": { "valor": 28, "tipo": "clamp" } }
        ]
      },
      "doseMaxima": { "valor": 28, "unidade": "mg", "tipo": "clamp" }
    }
  },
  "flags": ["F-10: saida sem arredondamento (casas:null)"]
}
```

> `expr` aqui é o `fator × peso` simples; poderia ser `{"fator": 0.35}` (açúcar equivalente a
> `peso * fator`). O schema aceita os DOIS (`fator` OU `expr`); `expr` é exigido quando a saída é
> não-linear (ver D4 Ibuprofeno). `teto.tipo: clamp` → `min(saida, 14)` na SAÍDA (B-05). Glicerina/Prednisona
> (faixa min–max) usariam duas saídas `expr: "peso * 10"` e `expr: "peso * 20"`.

### D4 — hibrido · Ibuprofeno (func-01)

Gate de idade DURO (estruturado, não `expr` crua), 3 apresentações, `max` condicional via `expr`, `floor`
na 200 mg/mL. Round-trip exato do AS-IS (instância corrigida no C1 do QA).

```json
{
  "tipo": "droga-dose",
  "nome": "Ibuprofeno",
  "publico": "pediatrico",
  "corpo": {
    "dosagem": {
      "tipo": "hibrido",
      "regraCalculo": {
        "tipo": "hibrido",
        "gate_idade": {
          "regra": { "op": "OU", "termos": [
            { "unidade": "Meses", "campo": "idade", "cmp": ">=", "valor": 6 },
            { "unidade": "Anos",  "campo": "idade", "cmp": ">=", "valor": 1 }
          ] },
          "se_falso": { "tipo": "contraindicado", "texto": "Contraindicado Ibuprofeno" }
        },
        "ramos": [
          { "por": "apresentacao", "quando": "50mgml",
            "saidas": [
              { "id": "min", "expr": "peso",        "casas": 0, "teto": { "valor": 40, "tipo": "clamp" } },
              { "id": "max", "expr": "peso >= 40 ? 20 : peso * 2", "casas": 0 }
            ] },
          { "por": "apresentacao", "quando": "100mgml",
            "saidas": [ { "id": "valor", "expr": "peso", "casas": 0, "teto": { "valor": 20, "tipo": "clamp" } } ] },
          { "por": "apresentacao", "quando": "200mgml",
            "saidas": [
              { "id": "min", "expr": "peso / 4 >= 10 ? 10 : floor(peso / 4)", "casas": 0 },
              { "id": "max", "expr": "peso / 2 >= 10 ? 10 : peso / 2",        "casas": 0 }
            ] }
        ],
        "ramos_neonatais": []
      }
    }
  },
  "flags": ["F-02: teto do max = 20 (assimetria min/max)", "C1: round-trip 3 apresentacoes"]
}
```

> Semântica: avalia `gate_idade` (forma estruturada, §6.3 — não `expr` crua, porque o gate lê `unidade` +
> `campo`); se falso, render = `se_falso` (substitui a dose). Se verdadeiro, escolhe o ramo por
> `apresentacao` e avalia cada `saida.expr`. O `max` da 50 mg/mL e ambas as saídas da 200 mg/mL são
> não-lineares → exigem `expr` (não cabem em `fator`+`teto`, B-01/B-02).

### D5 — renal · Cefepima adulto (MODELO-ANTIBIOTICOS-ADULTOS, ajuste por clearance)

Faixas de clearance (Cockcroft-Gault) → posologia referenciada; ramo diálise. Sem `expr` no caso geral.

```json
{
  "tipo": "droga-dose",
  "nome": "Cefepima",
  "publico": "adulto",
  "corpo": {
    "dosagem": {
      "tipo": "renal",
      "regraCalculo": {
        "tipo": "faixaClearance",
        "variavel": "clearance",
        "cockcroft": true,
        "faixas": [
          { "min": 60, "max": null, "posologiaRef": "p_2g_8h",  "inclusividade": "min-inclusivo-max-exclusivo" },
          { "min": 30, "max": 60,   "posologiaRef": "p_2g_12h", "inclusividade": "min-inclusivo-max-exclusivo" },
          { "min": 11, "max": 30,   "posologiaRef": "p_2g_24h", "inclusividade": "min-inclusivo-max-exclusivo" },
          { "min": 1,  "max": 11,   "posologiaRef": "p_1g_24h", "inclusividade": "min-inclusivo-max-exclusivo" }
        ],
        "diaramo": { "ativo": true, "prescricaoRef": "p_dialise", "nota": "Administre apos a dialise." }
      }
    }
  },
  "flags": ["C-06: rotulo mL/min/1,73m2 vs Cockcroft entrega mL/min nao normalizado"]
}
```

> Semântica: `cockcroft` ON → `TFGe = (140 - idade) * peso / (CrS * 72)`, `* 0.85` se mulher [REAL,
> idêntico em todas as drogas]. Seleciona a faixa que contém o valor (inclusividade declarada) → exibe a
> posologia. `diaramo.ativo` + toggle diálise ON → prescrição fixa + nota. As faixas DEVEM cobrir 1..∞ sem
> buraco (validação §7).

### D6 — regime · Gentamicina adulto (MODELO-ANTIBIOTICOS-ADULTOS)

Seletor de modo (dose única/dia vs múltiplas); cada modo tem sua sub-árvore de faixas de clearance.

```json
{
  "tipo": "droga-dose",
  "nome": "Gentamicina",
  "publico": "adulto",
  "corpo": {
    "dosagem": {
      "tipo": "regime",
      "regraCalculo": {
        "tipo": "regime",
        "modos": {
          "unica": {
            "faixas": [
              { "min": 60, "max": null, "posologiaRef": "u_5_7mgkg_24h", "inclusividade": "min-inclusivo-max-exclusivo" },
              { "min": 40, "max": 60,   "posologiaRef": "u_dose_36h",    "inclusividade": "min-inclusivo-max-exclusivo" }
            ]
          },
          "multiplas": {
            "faixas": [
              { "min": 60, "max": null, "posologiaRef": "m_1mgkg_8h",  "inclusividade": "min-inclusivo-max-exclusivo" },
              { "min": 40, "max": 60,   "posologiaRef": "m_1mgkg_12h", "inclusividade": "min-inclusivo-max-exclusivo" }
            ]
          }
        }
      }
    }
  }
}
```

> Semântica: o seletor de modo escolhe a sub-árvore; dentro, mesma lógica de `faixaClearance`. Cada modo
> valida cobertura de faixa independentemente (§7).

### D7 — infusaoBic · Terbutalina (func-04, MODELO-DOSE §2.5/§8.5)

Getters encadeados (DAG). `a` = peso, `b` = vazão (mL/h), `c`/`vazao_desejada` = vazão desejada. Inclui o
5º getter `vol_SG_complementar` e resolve o token órfão `gE2` declarando-o como input de volume-alvo (M3).

```json
{
  "tipo": "droga-dose",
  "nome": "Terbutalina",
  "publico": "pediatrico",
  "corpo": {
    "dosagem": {
      "tipo": "infusao-bic",
      "apresentacao": { "id": "inj-0.5mgml", "label": "Solucao injetavel 0,5 mg/mL", "forma": "ampola" },
      "regraCalculo": {
        "tipo": "infusaoBic",
        "inputs": ["peso", "vazao_ml_h", "vazao_desejada_ml_h", "volume_alvo_mL"],
        "getters": {
          "volume_24h_mL":       "vazao_ml_h * peso * 1440 / 500",
          "concentracao_mcg_mL": "volume_24h_mL * 500 / (24 * vazao_desejada_ml_h)",
          "vol_SG_complementar_mL": "volume_alvo_mL - volume_24h_mL",
          "limite_inferior_mL":  "peso * 0.04",
          "limite_superior_mL":  "peso * 0.08"
        },
        "concentracao_maxima_mcg_ml": 1000,
        "dose_maxima": { "valor": 5, "unidade": "mcg/kg/min", "tipo": "texto" }
      }
    }
  },
  "flags": [
    "M3: gE2 era token orfao -> declarado como input volume_alvo_mL (CONFIRMAR origem com Gustavo)",
    "M3: nomes de getter casam 1:1 (volume_24h_mL, nao volume_24h)",
    "DAG: JSON vem ordenado; validador detecta ciclo (decisao §9)"
  ]
}
```

> Semântica: os getters formam um DAG (`concentracao_mcg_mL` depende de `volume_24h_mL`;
> `vol_SG_complementar_mL` depende de `volume_alvo_mL` + `volume_24h_mL`). O engine avalia em ordem de
> dependência. `gE2` do bundle (token órfão na MODELO-DOSE) é modelado como o input `volume_alvo_mL`
> (volume-alvo da solução) — **CONFIRMAR com Gustavo** se é isso mesmo. Tetos (`dose_maxima.tipo: texto`,
> `concentracao_maxima`) são copy, NÃO clampam (F-16). Vasoativas adultas reusam `infusaoBic` mas precisam
> do bloco "montar solução" (Nº ampolas + mL soro → concentração MONTÁVEL) ainda não nos `inputs` — M4,
> aberto (§9).

### D8 — so-aviso · Metoclopramida (func-02)

Sem `regraCalculo`, sem dose. Só o aviso clínico.

```json
{
  "tipo": "droga-dose",
  "nome": "Metoclopramida",
  "publico": "pediatrico",
  "corpo": {
    "dosagem": {
      "tipo": "so-aviso",
      "aviso": "Evite em criancas; risco de Discinesia Tardia irreversivel.",
      "tem_dose": false
    }
  }
}
```

### 6.3 — Nota sobre `gate_idade` estruturado vs `expr`

O gate de idade do `hibrido` (D4) NÃO é uma `expr` crua, e sim a forma ESTRUTURADA
`{ op, termos:[{unidade, campo, cmp, valor}] }` (D4 acima). Razão: o gate precisa ler a UNIDADE (Meses/Anos)
junto do valor, e a regra de normalização (idade → meses internamente, §6.1) é aplicada pelo engine por
termo. Modelar o gate como `expr` crua (`idade_meses >= 6`) também é possível e equivalente após
normalização, mas a forma estruturada é a recomendada [PROPOSTA] porque deixa o admin editar
unidade+limiar sem digitar expressão e o validador checar a coerência Meses/Anos por termo (F-06/F-07).
Os DOIS reduzem à mesma gramática booleana da §2.

---

## 9. Decisões abertas (não fechar aqui — log para Gui + Gustavo)

Decorrem do QA round 1; este doc fecha a GRAMÁTICA, não as decisões humanas/arquiteturais:

1. **`clamp` na whitelist?** Açúcar de `min(max(...))`. Recomendação: manter pela legibilidade do teto
   bilateral (Terbutalina); removível sem perda. — Gui.
2. **DAG dos getters (D7):** JSON vem ordenado (recomendado) vs engine ordena topologicamente; tratamento
   de ciclo. — Gui (decisão de implementação).
3. **`gE2` da Terbutalina = `volume_alvo_mL`?** Token órfão modelado como input de volume-alvo; confirmar a
   origem clínica. — Gustavo.
4. **`gate_idade` estruturado vs `expr` crua:** recomendado estruturado (§6.3); ratificar. — Gui.
5. **`null` como ramo de `teto_expr`:** formaliza "sem teto" do Ibuprofeno; ratificar a semântica. — Gui.
6. **`biggerThen` `>` vs `>=` (T3):** fora do DSL de dose, mas usa comparação; comparador não isolado no
   bundle. Ratificar `>=` + teste de borda `total == biggerThen`. — Gustavo (herda C-02/D-C).
7. **Runtime do engine** (Flutter app vs backend) — E-01, decorre de D-A (app é hardcode). O DSL foi
   desenhado portável p/ Dart (sem `eval`, gramática fechada), mas QUEM avalia é decisão arquitetural. — Gui.
8. **`ramos_neonatais` (IG + dias-de-vida):** nomeado em D4, schema formal ainda ABERTO (B-09) — fica para
   a próxima rodada (não é gramática de `expr`, é estrutura de ramo).

---

## 10. Resumo

- **Gramática:** EBNF fechada (§2) — ternário, booleanos, comparação não-associativa, aritmética, unário,
  parênteses, chamada whitelisted, identificadores declarados, literais numéricos com ponto. Sem acesso a
  propriedade, índice, atribuição, loop, `eval`.
- **Whitelist (7 funções):** `min`, `max`, `floor`, `ceil`, `round`, `abs`, `clamp` (§3). `floor`/`min`/
  `round` são [REAL] do bundle; `ceil`/`abs`/`clamp` são [PROPOSTA] de completude.
- **Guards (5):** vírgula→ponto, NaN/±Inf→0, ÷0→0, input ausente→empty state, sem exceção em runtime (§4).
- **Cobertura D1..D8 (§8):** D1 Colidis (sem regra), D2 Dipirona (lookup + `ramos_substituicao`), D3
  Hidroxizina (`porPeso` linear + clamp), D4 Ibuprofeno (`hibrido` gate + `expr` não-linear + `floor`), D5
  Cefepima (`faixaClearance` + Cockcroft + diálise), D6 Gentamicina (`regime` única/múltiplas), D7
  Terbutalina (`infusaoBic` DAG, `gE2`→`volume_alvo_mL`), D8 Metoclopramida (`so-aviso`).
- **Veredito de fase:** a gramática e a semântica estão fechadas e portáveis; restam decisões humanas (§9)
  e o schema de `ramos_neonatais` (B-09, próxima rodada). Não inventa fórmula: cada exemplo rastreia a uma
  droga auditada.
