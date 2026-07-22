---
tipo: concept
atualizado: 2026-06-21
fontes:
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/02-audit-consistencia.md
  - admin-spec/02-audit-cobertura.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - PLANO-ADMIN-DATA-ARCH.md
relacionado:
  - admin-spec/01-sistema-de-tipos.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
status: vigente
peso: core
---

# Backend / comportamento dos JSONs (admin CalcMed unificado)

> Especifica COMO os JSONs funcionam, não como a UI desenha. Define, para os 9 moldes do
> sistema de tipos (`01-sistema-de-tipos.md`): (1) um JSON Schema formal por molde; (2) o
> contrato de comportamento (como cada campo dirige cálculo/render); (3) o modelo do engine
> (fórmula como DADO, não código); (4) validação; (5) workflow de revisão; (6) versionamento;
> (7) migração de `cm_admin_antibioticos_v3` para o item unificado.
>
> Princípio raiz (PLANO §4 + auditoria de cobertura): o admin atual (`ClinicalResourceModule`)
> é um editor de TEXTO + interruptores; a conta vive hardcoded no app Flutter. Este doc
> especifica o caminho para tornar a conta DADO. Nada é inventado: cada regra rastreia ao
> schema real, ao `antibioticosModel.js`, ou ao AS-IS auditado. Incertezas estão marcadas FLAG.
>
> ATENÇÃO DE STATUS: o schema persistido real está `x-status: provisorio-aguardando-gui`. Tudo
> abaixo do envelope (§1) e do molde D1-fixo é PROPOSTA de backend para a fase 2, a confirmar com
> o Gui (backend) e o Gustavo (clínico). O que JÁ existe em produção está marcado [REAL]; o que é
> proposta está marcado [PROPOSTA].

---

## 0. Decisão estrutural: por que "fórmula como dado"

A auditoria de cobertura (`02-audit-cobertura.md`) provou que o engine atual cobre só T1/D1 e
T3 (escores, motor separado). Os outros 7 tipos e 6 dos 8 sub-tipos de dose **não têm editor** —
a aritmética está no binário. Trazer a pediatria (e o ajuste renal adulto) ao admin exige um de
dois caminhos:

- **(A) Fórmula como código** (status quo): cada droga = um controller Dart. 64 + 38 lógicas
  ad-hoc. Mudar uma dose = recompilar e republicar o app. REJEITADO — é o problema.
- **(B) Fórmula como dado** (este doc): a regra de cálculo é um objeto JSON declarativo
  (`regraCalculo`) interpretado por um **avaliador genérico** no app. Mudar uma dose = editar
  JSON no admin, revisar, publicar. Sem build.

O caminho B é o alvo. Ele NÃO é uma planilha de expressões livres (perigoso em app clínico): é um
conjunto FECHADO de operadores e tipos de regra, um por arquétipo de dose. O médico-admin escolhe
o tipo e preenche fatores/tetos/faixas; nunca escreve código. Ver §3 (engine) e §4 (operadores).

> FLAG-A (alta, herdada da auditoria de cobertura): NÃO há prova no código de que o app B2C lê o
> JSON do admin hoje (o preview é réplica React; o app provavelmente ainda é hardcode Flutter).
> Todo este doc PRESSUPÕE que o backend (Gui) implemente o consumo do JSON pelo app. Confirmar.

---

## 1. Envelope comum (todos os 9 moldes) — JSON Schema

Todo item de conteúdo, qualquer molde, carrega o mesmo envelope. Deriva do
`antibioticos.schema.json` [REAL], generalizado com o campo discriminador `tipo` [PROPOSTA].

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://calcmed.app/schemas/admin/conteudo/v1",
  "title": "Conteudo clinico (envelope unificado)",
  "type": "object",
  "required": [
    "id", "tipo", "nome", "classe", "publico",
    "statusEditorial", "revisaoMedicaStatus",
    "slots", "observacoes", "referencias", "tagsRisco", "ferramentasSimilares"
  ],
  "properties": {
    "id":   { "type": "string", "minLength": 1 },
    "tipo": {
      "enum": ["droga-dose", "calculadora-formula", "escore-por-pontos",
               "escore-por-criterios", "protocolo-multi-step", "conduta-arvore-decisao",
               "conversor", "tabela-referencia", "ferramenta-utilitaria"],
      "description": "Molde canonico T1..T9. Discrimina qual sub-schema de `corpo` vale."
    },
    "nome":   { "type": "string" },
    "classe": { "type": "string", "description": "Classe farmacologica / categoria de menu (texto livre)." },
    "publico": { "enum": ["adulto", "pediatrico", "ambos"] },
    "via":     { "enum": ["EV", "Oral", "EV+Oral", "IM"], "description": "Via da TELA; a via de cada linha de dose e atomica em viaInline. So obrigatoria em droga-dose." },
    "statusEditorial":     { "enum": ["rascunho", "em-revisao", "publicado", "arquivado"] },
    "revisaoMedicaStatus": { "enum": ["pendente", "aprovado", "reprovado"] },
    "observacoes": { "$ref": "#/$defs/observacoes" },
    "referencias": { "type": "string" },
    "contraindicacoes": {
      "description": "Gate duro vs texto. String = aviso; objeto = gate booleano que pode bloquear render da dose.",
      "anyOf": [
        { "type": "string" },
        { "type": "object", "properties": { "texto": { "type": "string" }, "gate": { "type": "boolean" } }, "required": ["texto", "gate"] }
      ]
    },
    "tagsRisco":            { "type": "array", "items": { "type": "string" } },
    "ferramentasSimilares": { "type": "array", "items": { "type": "string" } },
    "slots":      { "$ref": "#/$defs/slots" },
    "ordemBlocos":{ "type": "array", "items": { "type": "string" } },
    "corpo":      { "description": "Sub-objeto especifico do molde. Schema escolhido por `tipo` (ver secoes 2.x).", "type": "object" },
    "schemaVersion": { "type": "integer", "const": 1, "description": "Versao do FORMATO do item (ver §6)." }
  },
  "$defs": {
    "slots": {
      "type": "object",
      "required": ["peso","definirDose","dialise","regime","clearance","cockcroft","observacoes","referencias","copiarCompartilhar","ferramentasSimilares"],
      "properties": {
        "peso": {"type":"boolean"}, "definirDose": {"type":"boolean"}, "dialise": {"type":"boolean"},
        "regime": {"type":"boolean"}, "clearance": {"type":"boolean"}, "cockcroft": {"type":"boolean"},
        "observacoes": {"type":"boolean"}, "referencias": {"type":"boolean"},
        "copiarCompartilhar": {"type":"boolean"}, "ferramentasSimilares": {"type":"boolean"},
        "idade": {"type":"boolean", "description": "NOVO p/ pediatria: campo idade + unidade Meses/Anos."},
        "apresentacao": {"type":"boolean", "description": "NOVO: seletor de apresentacao/concentracao."},
        "doseMaxima": {"type":"boolean", "description": "NOVO: exibe/aplica teto (clamp vs texto)."}
      }
    },
    "observacoes": {
      "description": "Canonica (UI) = array de {id,nivel,texto}. Toleradas (import/migracao): string ou array de strings. Inconsistencia conhecida do normalize (spread...item reaplica o cru).",
      "anyOf": [
        { "type": "string" },
        { "type": "array", "items": { "anyOf": [ { "type": "string" }, { "$ref": "#/$defs/observacao" } ] } }
      ]
    },
    "observacao": {
      "type": "object",
      "properties": { "id": {"type":"string"}, "nivel": {"enum":["footnote","warning","critical"]}, "texto": {"type":"string"} }
    }
  }
}
```

Contrato de comportamento do envelope:

- `tipo` é o DISCRIMINADOR. O backend valida `corpo` contra o sub-schema do molde correspondente
  (`if tipo == "droga-dose" then corpo matches $defs/dosagem`). [PROPOSTA]
- `slots` continua sendo "a verdade do que a tela exibe" [REAL]. `presetTemplate` (no item de
  antibiótico) é só atalho de configuração e não viaja para o envelope unificado como verdade —
  vira o tipo + sub-tipo + `corpo.dosagem.tipo`. Os 3 slots NOVOS (`idade`, `apresentacao`,
  `doseMaxima`) são o que falta para pediatria (`01-sistema-de-tipos.md` §4.3).
- `observacoes` mantém as 3 formas toleradas — não normalizar agressivamente quebraria imports.
- Defaults de `slots`: extras (`observacoes/referencias/copiarCompartilhar/ferramentasSimilares`)
  ON; clínicos OFF [REAL, `defaultSlots`].

---

## 2. JSON Schema + contrato por molde

Cada molde define `corpo`. Abaixo o schema essencial (campos, required, enums, computados) e o
contrato de comportamento. T1 é o coração e recebe a maior parte do detalhe.

### 2.1 T1 droga-dose (`corpo.dosagem`)

`dosagem` carrega o sub-tipo de cálculo (`tipo` ∈ D1..D8) + apresentações + posologias (texto) +
a `regraCalculo` estruturada que dirige a conta.

```json
{
  "$id": ".../conteudo/dosagem/v1",
  "type": "object",
  "required": ["tipo", "posologias"],
  "properties": {
    "tipo": {
      "enum": ["fixo","lookup","peso-computado","hibrido","renal","regime","infusao-bic","so-aviso"],
      "description": "Sub-tipo D1..D8 (sistema-de-tipos §3). Dirige qual regraCalculo vale."
    },
    "apresentacoes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id","label"],
        "properties": {
          "id": {"type":"string"}, "label": {"type":"string"},
          "concentracao_mg_ml": {"type":["number","null"]},
          "forma": {"enum":["suspensao","gotas","comprimido","ampola","frasco","spray","outro"]}
        }
      }
    },
    "posologias": { "$ref": ".../posologia[]" },
    "regraCalculo": { "$ref": "#/$defs/regraCalculo" },
    "doseMaxima": {
      "type": "object",
      "properties": {
        "valor": {"type":["number","null"]}, "unidade": {"type":"string"},
        "tipo": {"enum":["clamp","texto"], "description": "clamp = min aplicado no engine; texto = so copy exibida (NAO clampa)."}
      },
      "required": ["tipo"]
    }
  }
}
```

`posologia` [REAL, do schema atual] — linha de prescrição em TEXTO. Required:
`id, papel, cenario, droga, dose, unidade, diluente, viaInline, tempo, intervalo, esquema, alternativa`.
`papel ∈ {direta, cenario, ataque, manutencao, indicacao}`. `viaInline ∈ {EV, Oral, IM}`.
`alternativa` sempre `false` na primeira linha (invariante estrutural). `doseTipo` PROIBIDO dentro
da posologia (campo morto; normalize remove). `ataque-manutencao` NÃO é sub-tipo: é o `papel` aqui.

Contrato de comportamento por sub-tipo (`regraCalculo.tipo`):

| Sub-tipo | `regraCalculo.tipo` | Inputs lidos | Conta que o engine faz |
|---|---|---|---|
| D1 fixo | (ausente) | nenhum | exibe `posologias` como texto. Sem aritmética. |
| D2 lookup | `lookup` | idade OU peso | seleciona a linha de `tabela[]` cuja faixa contém o valor; exibe `linha.dose` (string). Sem aritmética. |
| D3 peso-computado | `porPeso` | peso (+apresentação) | `saida = fator × peso`, opcional teto. |
| D4 hibrido | `hibrido` | peso + idade (+apresentação/indicação) | gate de idade; ramo por idade/apresentação/indicação/IG; cada ramo computa (`porPeso`) ou é texto. |
| D5 renal | `faixaClearance` | clearance (ou Cockcroft) | seleciona faixa de clearance → posologia; ramo diálise. |
| D6 regime | `regime` | modo (única/múltiplas) + clearance | escolhe sub-árvore por modo, depois faixa de clearance. |
| D7 infusao-bic | `infusaoBic` | peso + dose alvo + vazão | getters encadeados → mL/h, volume 24h, concentração. |
| D8 so-aviso | (ausente, `corpo.dosagem.aviso`) | nenhum | exibe só o aviso clínico; `tem_dose=false`. |

`regraCalculo` é o objeto central da fase 2. Detalhe completo dos 7 tipos em §3/§4. **Opcional**:
drogas D1/D8 não têm `regraCalculo` (o admin só liga slots e digita texto, como hoje [REAL]).

### 2.2 T2 calculadora-formula (`corpo.calculo`)

```json
{
  "type": "object",
  "required": ["inputs", "formulas"],
  "properties": {
    "inputs": { "type": "array", "items": {
      "type": "object", "required": ["id","label"],
      "properties": {
        "id": {"type":"string"}, "label": {"type":"string"}, "unidade": {"type":"string"},
        "validacao": { "type":"object", "properties": { "min": {"type":"number"}, "max": {"type":"number"}, "msg": {"type":"string"} } }
      } } },
    "formulas": { "type": "array", "minItems": 1, "items": {
      "type": "object", "required": ["id","label","expr"],
      "properties": { "id": {"type":"string"}, "label": {"type":"string"},
                      "expr": {"type":"string","description":"expressao no DSL fechado (§4)"},
                      "casas": {"type":["integer","null"]} } } },
    "faixas_classificacao": { "type": "array", "items": {
      "type": "object", "properties": { "condicao": {"type":"string"}, "rotulo": {"type":"string"}, "texto": {"type":"string"} } } },
    "inputs_mutuamente_exclusivos": { "type": "array", "items": { "type": "array", "items": {"type":"string"} } },
    "notas": { "type": "array", "items": {"type":"string"} }
  }
}
```

Contrato: cada `formula.expr` é avaliada pelo DSL (§4). Multi-fórmula = N entradas em `formulas`
(QTc Bazett/Fridericia/Framingham/Hodges lado a lado). `faixas_classificacao[].condicao` é uma
expressão booleana sobre as saídas (IMC 6 faixas). `validacao` esconde/avisa fora do domínio
clínico (LDL some se TG≥400; Peso Ideal exige altura 123-213). `inputs_mutuamente_exclusivos`
declara pares onde preencher um zera/desabilita o outro (QTc FC⟷RR). Guard universal: NaN/±Inf→0,
vírgula→ponto (aplicado pelo engine, não declarado por item).

### 2.3 T3 escore-por-pontos (`corpo.escore`) [REAL — Admin de Escores já entregue]

```json
{
  "type": "object",
  "required": ["questions", "resultados"],
  "properties": {
    "questions": { "type":"array", "items": {
      "type":"object", "required":["id","title","options"],
      "properties": { "id":{"type":"string"}, "title":{"type":"string"},
        "options": { "type":"array", "items": {
          "type":"object", "required":["label","pontos"],
          "properties": { "label":{"type":"string"}, "pontos":{"type":"integer"} } } } } } },
    "resultados": { "type":"array", "items": {
      "type":"object", "required":["id","title","biggerThen"],
      "properties": { "id":{"type":"string"}, "title":{"type":"string"},
        "meaning":{"type":"string"}, "biggerThen":{"type":"integer"} } } },
    "aditionalTexts": { "type":"array", "items": {
      "type":"object", "properties": { "meaningTitle":{"type":"string"}, "variations":{"type":"array","items":{"type":"string"}} } } }
  }
}
```

Contrato: `total = Σ option.pontos das respostas`. **Typos load-bearing `[REAL]`, NÃO corrigir:**
`aditionalTexts`, `biggerThen` — são contrato persistido. **A SELEÇÃO por limiar NÃO é `[REAL]`
verificado** (K-04/C-02): o comparador-runtime `>` vs `>=` NÃO foi isolado no bundle (só o storage do
campo — `qa/round1-ground-truth.md` D-C/INCONCLUSIVO). A intenção documentada do admin React
(`escores.schema.json` L205) é `>=` ("maior limiar ≤ total", inclusivo); a fonte appwide-07 diz `>`
("maior que"). Muda classificação no limiar (ex. SOFA). **Proposta a RATIFICAR (não confirmada no
código):** fixar `>=` + teste de borda obrigatório `total == biggerThen`. Não modelar JSON de escore
no limiar antes de o Gustavo decidir.

### 2.4 T4 escore-por-criterios (`corpo.estadiamento`) [PROPOSTA]

```json
{
  "type": "object",
  "required": ["eixos", "regras_estagio"],
  "properties": {
    "eixos": { "type":"array", "items": {
      "type":"object", "properties": { "id":{"type":"string"}, "label":{"type":"string"}, "tipo":{"enum":["number","select"]} } } },
    "regras_estagio": { "type":"array", "items": {
      "type":"object", "required":["estagio","condicao"],
      "properties": { "estagio":{"type":"string"}, "condicao":{"type":"string","description":"expr booleana (§4)"}, "texto":{"type":"string"} } } },
    "sub_calc": { "type":["object","null"], "description": "calc embutida opcional (ex.: Cockcroft dentro do IRA)." },
    "imagem_apoio": { "type":["string","null"], "description": "FLAG: PPS usa JPG (arte fechada), nao dado." }
  }
}
```

Contrato: avalia `regras_estagio` EM ORDEM; primeira `condicao` verdadeira define o estágio (badge).
NÃO soma pontos (difere de T3). Validação obrigatória: as regras devem cobrir o domínio (sem buraco)
e ser mutuamente coerentes — ver §5 (C2 hoje é cego a isso).

### 2.5 T5 protocolo-multi-step (`corpo.protocolo`) [PROPOSTA]

```json
{
  "type": "object",
  "required": ["abas"],
  "properties": {
    "abas": { "type":"array", "minItems":1, "items": {
      "type":"object", "required":["id","titulo","conteudo"],
      "properties": { "id":{"type":"string"}, "titulo":{"type":"string"},
        "conteudo": { "type":"object", "description": "REFERENCIA a outro molde: { tipo, ref|corpo }. Composicao recursiva.",
          "properties": { "tipo": {"enum":["texto","droga-dose","conduta-arvore-decisao","calculadora-formula"]}, "ref":{"type":"string"}, "corpo":{"type":"object"} } } } } },
    "input_global": { "type":["object","null"], "description": "ex.: peso compartilhado entre abas (Trombolise)." },
    "cross_links": { "type":"array", "items": {"type":"string"} }
  }
}
```

Contrato: composição RECURSIVA — uma aba referencia outro molde (texto, T1 dose-por-peso, T6 árvore).
`input_global` é injetado em todas as abas que o consomem (peso da Trombólise). Migrar os protocolos
hardcoded (CAD 8 abas, Trombólise, Intubação, PCR, Diarreia A/B/C) é trabalho de fase 2+ (PLANO §4).

### 2.6 T6 conduta-arvore-decisao (`corpo.arvore`) [PROPOSTA]

```json
{
  "type": "object",
  "required": ["no_raiz", "nos"],
  "properties": {
    "no_raiz": { "type":"string" },
    "nos": { "type":"array", "items": {
      "type":"object", "required":["id"],
      "properties": { "id":{"type":"string"}, "pergunta":{"type":"string"},
        "sim":{"type":["string","null"],"description":"id do proximo no quando SIM"},
        "nao":{"type":["string","null"],"description":"id do proximo no quando NAO"},
        "conduta_texto":{"type":["string","null"],"description":"no terminal: conduta. sim/nao null = folha."} } } },
    "mnemonico_header": { "type":["string","null"] },
    "link_final": { "type":["string","null"] }
  }
}
```

Contrato: estado booleano por nó; navega `sim`/`nao` até um nó terminal (`conduta_texto` preenchido,
`sim`/`nao` nulos). Validação obrigatória: todo caminho termina em folha; sem ciclo; sem `id` órfão
(ramo apontando para nó inexistente). Ver §5.

### 2.7 T7 conversor (`corpo.conversor`) [PROPOSTA]

```json
{
  "type": "object",
  "required": ["inputs", "formula"],
  "properties": {
    "inputs": { "type":"array", "items": { "type":"object", "properties": { "id":{"type":"string"}, "label":{"type":"string"} } } },
    "dropdowns": { "type":"array", "items": {
      "type":"object", "properties": { "id":{"type":"string"},
        "opcoes": { "type":"array", "items": { "type":"object", "properties": { "label":{"type":"string"}, "fator_b":{"type":"number"} } } } } } },
    "formula": { "type":"string", "description":"expr DSL multiplicando/dividindo pelos fator_b" },
    "nota_fixa": { "type":["string","null"] }
  }
}
```

Contrato: o `fator_b` da opção escolhida no dropdown entra na `formula`. Sem clínica nuclear.

### 2.8 T8 tabela-referencia (`corpo.tabela`) [PROPOSTA]

```json
{
  "type": "object",
  "required": ["indexar_por", "linhas"],
  "properties": {
    "indexar_por": { "enum":["cenario","faixa_etaria","clcr"] },
    "linhas": { "type":"array", "items": {
      "type":"object", "properties": { "chave":{"type":"string"}, "apresentacao":{"type":"string"},
        "dose_usual":{"type":"string"}, "prescricao":{"type":"string"}, "cuidados":{"type":"string"} } } },
    "eixo_decisao": { "type":["object","null"], "description":"ex.: Anticoagulantes por ClCr." }
  }
}
```

Contrato: SEM cálculo. Seleciona `linha` por `indexar_por`; exibe colunas como texto. Fronteira
editorial com T1-lookup (D2): T8 = card de referência clínica; D2 = prescrição de uma droga.

### 2.9 T9 ferramenta-utilitaria (`corpo.ferramenta`) [PROPOSTA]

CRUD offline (Soluções Personalizadas, Passômetro). Fora do escopo do cadastro clínico; schema
mínimo (`entidade.campos[]`, `operacoes`, `persistencia: "offline"`, `empty_state`). Não detalhado.

---

## 3. Modelo do engine — fórmula como dado

O app embarca UM avaliador genérico (`evalRegra(regra, inputs) → resultado`) que interpreta os 7
tipos de `regraCalculo`. Nenhuma droga tem código próprio; a droga É o JSON. Schema do objeto:

> **SCHEMA FORMAL (round 2):** os 7 `regra_*` abaixo agora existem como `$defs` executáveis em
> `schemas/corpo-droga-dose.schema.json` (`oneOf` por discriminador interno `tipo`), com `saida`
> declarando `expr`/`teto_expr`/`porPeso` aninhado. A gramática fechada do DSL está em
> `04-dsl-regracalculo.md` (EBNF + whitelist + um `regraCalculo` por sub-tipo D1..D8 modelando droga
> real). Validação 2 camadas + golden-set em `05-validacao-e-testes.md`. Verificado em
> `qa/QA-round-2-relatorio.md`.

```json
{
  "$defs": {
    "regraCalculo": {
      "type": "object",
      "required": ["tipo"],
      "oneOf": [
        { "$ref": "#/$defs/regra_porPeso" },
        { "$ref": "#/$defs/regra_lookup" },
        { "$ref": "#/$defs/regra_hibrido" },
        { "$ref": "#/$defs/regra_faixaClearance" },
        { "$ref": "#/$defs/regra_regime" },
        { "$ref": "#/$defs/regra_infusaoBic" },
        { "$ref": "#/$defs/regra_definirDose" }
      ]
    }
  }
}
```

### 3.1 `porPeso` (D3) — `dose = fator × peso`, teto opcional

```json
{
  "tipo": "porPeso",
  "saidas": [
    { "id": "mL", "fator": 0.35, "casas": null, "teto": { "valor": 14, "tipo": "clamp" } },
    { "id": "mg", "fator": 0.70, "casas": null, "teto": { "valor": 28, "tipo": "clamp" } }
  ],
  "fator_min": null, "fator_max": null
}
```

Comportamento: `saida = round(fator × peso, casas)`; se `teto.tipo=="clamp"` aplica `min(saida, teto.valor)`;
se `teto.tipo=="texto"` exibe o teto como copy mas NÃO clampa. `casas:null` = saída crua (paridade
Hidroxizina/Escopolamina/Acebrofilina — F-10/F-13). Faixa min-max (Glicerina, Prednisona) usa
`fator_min`/`fator_max` em vez de `fator`. `fator = mg_por_kg ÷ concentracao_mg_ml`.

> **PENDÊNCIA DE SCHEMA (M1/B-02) — RESOLVIDA no round 2:** uma saída condicional / com `floor`
> (Ibuprofeno 200 mg/mL = `floor(peso/4)`; max da 50 mg/mL = `peso>=40 ? 20 : peso*2`) NÃO cabe só em
> `fator`+`teto`. O `$defs/saida` formal de `schemas/corpo-droga-dose.schema.json` já declara `expr`,
> `teto_expr` e a forma aninhada `porPeso`, e o `$defs/regra_porPeso` os referencia. A instância
> `schemas/instancias-exemplo/ibuprofeno.json` valida e faz round-trip exato (verificado no QA round 2).
> Resta distinguir `min(peso,T)` (clamp na ENTRADA) de `min(fator×peso,T)` (clamp na SAÍDA): quando
> `fator≠1` os resultados diferem e a ordem é clinicamente load-bearing (B-05) — tratado como `warning`
> da camada 2 + golden-set `delta/clamp-entrada-vs-saida` em `05-validacao-e-testes.md`.

### 3.2 `lookup` (D2) — string fixa por faixa

```json
{
  "tipo": "lookup",
  "indexar_por": "idade",
  "tabela": [
    { "faixa": { "min_meses": 6, "max_meses": 11 }, "dose": "1 mg = 2 mL ou 16 gotas", "frequencia": "1x/dia" },
    { "faixa": { "min_anos": 1, "max_anos": 5 },    "dose": "1,25 mg = 2,5 mL",        "frequencia": "1x/dia" }
  ]
}
```

Comportamento: seleciona a linha cuja faixa contém o input; exibe `dose` (string). Sem aritmética.
Dipirona: `indexar_por:"peso"`, `faixa:{min_kg, max_kg}`. As bordas de faixa seguem a regra de
inclusividade declarada (ver §3.8 e FLAG F-06/C-03).

> **GAP (M2, correctness):** a Dipirona tem condicionais que SUBSTITUEM a tabela (`<3 meses OU peso<5
> → "Contraindicado Dipirona"`; `peso>=53 → "Avalie dose para adultos"`). O schema `lookup` atual só
> tem `indexar_por` + `tabela[]`; não há slot para os ramos de contraindicação/overflow nem para o gate
> cruzado idade×peso. O `contraindicacoes{texto,gate}` do envelope é um gate ÚNICO de tela, não dois
> limiares distintos com saídas de texto diferentes. O exemplo (Desloratadina) esconde o gap. Adicionar
> `ramos_substituicao[{condicao(expr), texto}]` ao `lookup` (avaliados ANTES da tabela) antes de modelar
> Dipirona. Falta também `inclusividade` por-extremo-por-faixa no `lookup` (B-06): a fonte mistura
> `>=`/`<`/`>` na mesma droga; um único campo por regra não captura bordas mistas.

### 3.3 `hibrido` (D4) — gate + ramos

```json
{
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
      "saidas": [ { "id": "min", "porPeso": { "fator": 1, "teto": { "valor": 40, "tipo": "clamp" } } },
                  { "id": "max", "porPeso": { "fator": 2 }, "teto_expr": "peso>=40 ? 20 : null" } ] }
  ],
  "ramos_neonatais": []
}
```

Comportamento: avalia `gate_idade`; se falso, render = `se_falso` (substitui a dose por
"Contraindicado X" — gate DURO). Se verdadeiro, escolhe o ramo por `apresentacao`/`indicacao`/`idade`/IG
e computa (`porPeso` aninhado) ou exibe texto. `ramos_neonatais[]` carrega IG (semanas) + dias-de-vida
(NOVO — hoje é rótulo de texto, não input; `01-sistema-de-tipos.md` §3 gap 2). É o motor mais rico e
o **buraco central da pediatria** (dose por duas variáveis combinadas — gap 3).

### 3.4 `faixaClearance` (D5) — ajuste renal [REAL na produção, hardcode; PROPOSTA modelar]

```json
{
  "tipo": "faixaClearance",
  "variavel": "clearance",
  "cockcroft": true,
  "faixas": [
    { "min": 50, "max": null, "posologiaRef": "p_8_8h" },
    { "min": 25, "max": 50,   "posologiaRef": "p_12_12h" },
    { "min": 1,  "max": 25,   "posologiaRef": "p_24_24h" }
  ],
  "inclusividade": "min-inclusivo-max-exclusivo",
  "diaramo": { "ativo": true, "prescricaoRef": "p_dialise", "nota": "Administre apos a dialise." }
}
```

Comportamento: se `cockcroft` ON, calcula `TFGe = (140 - idade) × peso / (CrS × 72)`, ×0,85 se mulher
[REAL, idêntico em todas as drogas]; senão lê clearance direto. Seleciona a faixa que contém o valor
→ exibe a posologia referenciada. `diaramo.ativo` + toggle diálise ON → prescrição fixa + nota.
FLAG C-06 (auditoria): o app rotula o resultado como `mL/min/1,73m²` mas Cockcroft entrega `mL/min`
NÃO normalizado — flag clínica para o Gustavo. FLAG-validação: as faixas devem cobrir o domínio
1..∞ sem buraco (hoje C2 é cego a isso — §5).

### 3.5 `regime` (D6) — única vs múltiplas [REAL produção]

```json
{
  "tipo": "regime",
  "modos": {
    "unica":     { "faixas": [ { "min": 80, "posologiaRef": "u_24h" } ] },
    "multiplas": { "faixas": [ { "min": 90, "posologiaRef": "m_8h" } ] }
  }
}
```

Comportamento: seletor de modo (dose única/dia vs múltiplas) escolhe a sub-árvore; dentro, mesma
lógica de `faixaClearance`. Gentamicina.

### 3.6 `infusaoBic` (D7) — getters encadeados [REAL produção]

```json
{
  "tipo": "infusaoBic",
  "inputs": ["peso", "dose_desejada_mcg_kg_min", "vazao_desejada_ml_h"],
  "getters": {
    "volume_24h_mL":      "vazao * peso * 1440 / 500",
    "concentracao_mcg_mL":"volume_24h * 500 / (24 * vazao_desejada)",
    "limite_inferior_mL": "peso * 0.04",
    "limite_superior_mL": "peso * 0.08"
  },
  "concentracao_maxima_mcg_ml": 1000,
  "dose_maxima": { "valor": 5, "unidade": "mcg/kg/min", "tipo": "texto" }
}
```

Comportamento: avalia getters em ordem de dependência (DAG); cada um é uma expr do DSL (§4).
Terbutalina (ped) e vasoativas (adulto) compartilham este tipo.

> **FLAGS (M3/B-08, correctness):** (1) o exemplo acima usa `volume_24h` (sem `_mL`) referenciando a
> chave `volume_24h_mL` — nomes de getter devem casar 1:1 (o parser do DAG resolve por nome). (2) A
> Terbutalina real (MODELO-DOSE §2.5/§8.5) tem um 5º getter `vol_SG_complementar = gE2 - volume_24h`
> OMITIDO aqui; e `gE2` é um TOKEN ÓRFÃO (não está em `inputs` nem nos outros getters) — o DSL fechado
> (§4) exige identificadores declarados, então `vol_SG_complementar` não parseia como está. Resolver de
> onde vem `gE2` (input de volume-alvo?) antes de modelar Terbutalina. (3) O handoff não define QUEM faz
> a ordenação topológica do DAG (engine resolve, ou JSON já vem ordenado?) nem o tratamento de ciclo —
> decisão de implementação a tomar. (4) `infusao-bic` adulto (vasoativas) tem o passo "montar solução"
> (Nº ampolas + mL soro → concentração) que NÃO está nos `inputs` deste schema — concentração aqui é
> fixa (Terbutalina); vasoativas adultas têm concentração MONTÁVEL (M4/completeness). Estender `inputs`
> com o bloco "montar solução" antes de cobrir vasoativas.

### 3.7 `definirDose` (calculada) — BLOQUEADO até fase 2 [REAL gate]

```json
{
  "tipo": "definirDose",
  "faixaPermitida": { "min": 0.7, "max": 1.0, "unidade": "mg/kg/d" },
  "derivados": [ { "expr": "dose * peso * 0.2", "cap": 10, "rotulo": "mL a aspirar" } ]
}
```

Comportamento: usuário define a dose dentro de `faixaPermitida`; derivados calculados. **GATE
INTERINO [REAL]:** item com slot `definirDose` ligado NÃO publica até a faixa min/max estruturada
existir (fase 2). É exatamente o que a pediatria (faixa min/max por kg com teto) mais precisa.

### 3.8 Pré-requisito transversal: semântica de idade (F-09 RESOLVIDO; F-06/F-07 abertos)

`gate_idade` e `lookup indexar_por:idade` dependem da unidade Meses/Anos.

**F-09 RESOLVIDO contra bundle (2026-06-21): NÃO há inversão.** O binário codifica `Meses=1, Anos=2`
de forma uniforme (`aR("Meses",1)` / `aR("Anos",2)`; 0 definições inversas) e os getters lêem `s.c.b`
coerentemente (Ibuprofeno `A.a7D`, Bromoprida-base `A.uX`). A "inversão func-01 vs func-02" era ruído
de extração (confusão com o 2º enum `eDt` ordinal 0/1 que só renderiza rótulo de UI). Ver
`02-audit-meses-anos.md` + `qa/round1-ground-truth.md` F-09. NÃO desabilitar o campo de idade.

A proposta MANTIDA (por robustez/legibilidade, não por inversão): o JSON SEMPRE carrega a unidade
explícita (`{unidade:"Meses"|"Anos"}`), nunca índice numérico.

**Aberto SEPARADAMENTE (F-06/F-07, ver handoff D-N):** dentro da MESMA droga algumas faixas lêem `c.b`
de forma inconsistente (faixa que só dispara em Meses e nunca renderiza se a idade vier em Anos). Regra
de modelagem: TODA faixa etária opera sobre idade JÁ normalizada para meses internamente, nunca sobre
`unit` cru; o `gate_idade`/`lookup` declara se opera ANTES ou DEPOIS da conversão 12m→1a. Bordas no
limiar 12m/1a (C-03 Diclofenaco) resolvidas por `inclusividade` explícita por faixa.

---

## 4. DSL de expressão (fechado) — `expr`

`expr` (em T2 `formulas`, T7 `formula`, `teto_expr`, getters BIC, T4/T6 `condicao`) NÃO é JS
arbitrário. É uma gramática FECHADA, avaliada por um parser próprio (sem `eval`), por segurança
clínica e portabilidade Flutter.

> **GRAMÁTICA FORMAL (round 2):** a EBNF fechada, a whitelist completa (7 funções, com aridade e
> `[REAL]`/`[PROPOSTA]`), a semântica de avaliação (tipos Number/Bool, `null` como "sem teto", DAG dos
> getters) e os guards estão em `04-dsl-regracalculo.md`. O resumo abaixo é a versão de leitura.

- **Operandos:** identificadores de input (`peso`, `idade`, `clearance`, `vazao`...), literais
  numéricos, saídas já calculadas (getters em DAG).
- **Operadores aritméticos:** `+ - * /` e parênteses.
- **Operadores de comparação:** `> >= < <= == !=`.
- **Booleanos:** `&& || !` (ou `E`/`OU`/`NAO` na forma estruturada de gate, §3.3).
- **Funções permitidas (whitelist):** `min(a,b)`, `max(a,b)`, `floor(x)`, `ceil(x)`, `round(x,n)`,
  `abs(x)`, ternário `cond ? a : b`.
- **PROIBIDO:** acesso a propriedade, chamada de função fora da whitelist, loop, atribuição,
  qualquer side-effect.

Guards universais do avaliador (não declarados por item):
- vírgula decimal → ponto antes de parsear input.
- resultado `NaN`/`+Inf`/`-Inf` → `0` (guard do AS-IS).
- divisão por zero → `0`.
- input ausente quando required → empty state global ("Informe todos os dados...").

> Por que não expressão livre: em app clínico, uma fórmula arbitrária editável por não-engenheiro é
> risco de dose por ordem de grandeza. O DSL fechado + a validação de domínio (§5) são o guard-rail.

---

## 5. Validação (em duas camadas)

Filosofia [REAL, Q7]: **avisar no rascunho, bloquear na publicação.** Rascunho incompleto é legítimo.
`validate(item, items) → { errors, warnings, medicalReviewRequired }`. `medicalReviewRequired` é
DERIVADO (`revisaoMedicaStatus !== "aprovado"`), nunca persistido.

### 5.1 Camada 1 — estrutural/envelope (existe hoje [REAL])

- `nome` vazio → erro (bloqueia salvar, mesmo rascunho).
- `publico` fora de adulto/pediatrico/ambos → erro.
- `via` fora do enum VIA_OPTIONS (não só presença) → erro.
- `posologias` vazio (em droga-dose) → erro; ao menos uma com dose preenchida → erro se falhar.
- dose sem unidade → warning no rascunho, erro ao publicar.
- droga da posologia que não casa com o nome → warning (detector de "duplicou e esqueceu de trocar").
- slot `referencias` ON + `referencias` vazio → warning rascunho, erro ao publicar.
- unicidade contextual: mesmo `nome`(trim, case-insensitive) + `publico` + `via` → **warning**, não bloqueia.
- publicar exige `revisaoMedicaStatus == aprovado` → erro.
- gate V2: `publico != adulto` + publicando → erro (pediátrico/ambos não publica na V2).
- gate fase 2: slot `definirDose` ON + publicando → erro.

> CRÍTICO C-01 (auditoria de consistência): a chave de unicidade HOJE inclui `publico`, mas só gera
> WARNING. ~13 antibióticos existem em adulto E pediátrico com eixos de dose OPOSTOS (mg/kg×peso vs
> dose-fixa por clearance). Se o admin unificar por nome, as lógicas colidem (erro de ordem de
> grandeza). **Recomendação:** manter `publico` na chave de unicidade É correto; NÃO relaxar para só
> `nome`. Considerar elevar de warning para erro-ao-publicar quando os dois itens homônimos forem
> ambos publicados com `regraCalculo.tipo` divergente. Confirmar com Gui/Gustavo.

### 5.2 Camada 2 — domínio/clínica (NÃO existe hoje — [PROPOSTA], buraco da cobertura)

A auditoria de cobertura provou que C2 é cego ao cálculo (valida campo-vazio/enum, não fórmula).
Para publicar conteúdo com `regraCalculo` ou `corpo` estruturado, validar adicionalmente:

- **`faixaClearance`/`regime`/`lookup`:** as faixas cobrem o domínio sem BURACO (ex.: 1..∞ contínuo)
  e sem SOBREPOSIÇÃO; `posologiaRef` aponta para posologia existente.
- **`hibrido`:** `gate_idade.se_falso` definido; todo ramo computa OU tem texto; `ramos_neonatais`
  com IG/dias coerentes (sem lacuna).
- **`porPeso`:** `fator` ou (`fator_min`+`fator_max`) presente; `teto.tipo` declarado; se a fonte
  AS-IS marca o teto como texto, mudar para `clamp` é **comportamento clínico NOVO** → exige
  reaprovação médica (F-16). O validate deve SINALIZAR a troca clamp↔texto como mudança clínica.
- **DSL `expr`:** parseia sem erro; só usa identificadores declarados em `inputs`; só funções da
  whitelist (§4).
- **T4 `regras_estagio` / T6 árvore:** todo caminho termina em folha; sem ciclo; sem ref órfã.
- **T2 `validacao` de input:** `min < max`; `msg` presente quando há faixa.
- **Unidades:** sinalizar incoerências conhecidas (U-02 Sulfato de Mg "mg/dL" vs "mg/mL"; U-04
  clamp vs texto sob a mesma palavra "Máx"). Idealmente um lint de unidade por droga.

`flags[]` por item carrega os IDs F-01..F-29 que tocam a droga, para a revisão clínica não perder
nenhum (campo de governança, não bloqueia).

---

## 6. Versionamento

Dois eixos distintos — não confundir:

- **`schemaVersion` (FORMATO do item):** inteiro no envelope. Hoje `v3` no localStorage
  (`cm_admin_antibioticos_v3`) [REAL]; o item unificado nasce `schemaVersion: 1`. Sobe quando a
  ESTRUTURA muda (campo novo required, enum alterado). Cada bump tem migração one-shot (§7).
- **Revisão de CONTEÚDO (clínica):** `revisaoMedicaStatus` + `statusEditorial`. Versionar o
  conteúdo publicado (histórico de doses) é PROPOSTA: guardar `publicadoEm`, `publicadoPor`,
  `revisaoVersao` (inteiro que incrementa a cada aprovação) e, idealmente, um snapshot do item no
  momento da publicação (auditoria clínica: "qual dose estava no ar em DD/MM"). Confirmar escopo
  com Gui — fora do R1 provavelmente.

Compatibilidade: o normalize tolera campos legados extras no topo (additionalProperties livre) e
mapeia presets/observações legados [REAL]. Regra: **nunca apagar dado em migração** (chave legada
fica como backup [REAL]).

---

## 7. Migração `antibioticos v3` → conteúdo unificado

Hoje [REAL]: `migrarAntibioticoV2(itemV2)` roda one-shot na carga do store (v2→v3): exige nome,
rebaixa `publicado`→`em-revisao`, zera `revisaoMedicaStatus`→`pendente`, mantém chave legada como
backup. O item resultante é o "antibiótico v3".

Proposta de migração v3 → conteúdo unificado (`migrarV3ParaConteudo`) [PROPOSTA]:

1. **Envelope:** todo antibiótico v3 vira `tipo: "droga-dose"`. Copia `id, nome, classe, publico,
   via, statusEditorial, revisaoMedicaStatus, slots, observacoes, referencias, tagsRisco,
   ferramentasSimilares, ordemBlocos` 1:1. Adiciona `schemaVersion: 1`.
2. **`presetTemplate` → `corpo.dosagem.tipo`** (mapa de colapso, `01-sistema-de-tipos.md` §3):
   - `simples` → `fixo` (ou `lookup` se há faixas de texto nas posologias).
   - `peso` → `peso-computado`.
   - `renal` → `renal` (`regraCalculo.tipo: faixaClearance`).
   - `renal-dialise` → `renal` com `diaramo.ativo: true`.
   - `regime` → `regime`.
   - `calculada` → `peso-computado`/`renal` com `regraCalculo.tipo: definirDose` (permanece
     BLOQUEADO para publicação até fase 2).
   - `completo` → não vira sub-tipo; é preset de UI; mapear pelos slots realmente ligados.
   - Presets legados (`padrao-a..d`, `crcl`) → já mapeados pelo PRESET_LEGACY antes [REAL].
3. **`posologias`** copiadas 1:1 para `corpo.dosagem.posologias` (texto; invariante
   `posologias[0].alternativa == false` preservada). `papel` (incl. `ataque`/`manutencao`) mantido.
4. **`regraCalculo`** NÃO é fabricada na migração (a conta segue no app). Nasce `null`/ausente; o
   admin a preenche manualmente na fase 2, droga a droga, sob revisão clínica. Migração NÃO inventa
   fórmula — seria inseguro.
5. **Pediatria** (64 drogas, hoje só no AS-IS Flutter, fora do admin): NÃO migra de v3 (não existe lá).
   Entra como cadastro NOVO no admin unificado, usando os templates de §3 derivados do
   `MODELO-DOSE-PEDIATRICA.md` §8. Cada droga ped nasce `rascunho` + `revisaoMedicaStatus: pendente`
   + `publico: pediatrico` (logo, NÃO publica na V2 — gate). Importável via seed JSON.
6. **Idempotência + segurança:** migração one-shot, guardada por `schemaVersion`. Item já em
   `schemaVersion: 1` é pulado. Chave `cm_admin_antibioticos_v3` preservada como backup; o unificado
   grava em chave nova (ex.: `cm_admin_conteudo_v1`). Conteúdo nunca nasce publicado pela migração.

> FLAG: a migração NÃO resolve C-01 (homônimos adulto/ped com eixos opostos) automaticamente —
> ela PRESERVA `publico` na identidade, o que mantém os dois itens separados (correto). A
> reconciliação editorial (qual conteúdo é canônico por público) é decisão do Gustavo, não da migração.

---

## 8. Resumo das decisões abertas (para Gui + Gustavo)

1. **FLAG-A — RESOLVIDA contra bundle (2026-06-21):** o app B2C NÃO lê o JSON; dose hardcoded no binário
   Flutter (107 controllers + catálogo literal; 0 `fromFirestore`). "Fórmula como dado" é construção NOVA
   (engine `evalRegra` portável p/ Dart), não integração. Decidir runtime do engine (E-01). Pré-requisito
   de toda a fase 2.
2. **C-02 / `biggerThen`:** comparador NÃO isolado no bundle (intenção admin React = `>=`); ratificar `>=`
   com Gustavo + teste de borda `total==biggerThen`. Não é `[REAL]` verificado. Muda SOFA.
3. **C-01 / unicidade:** manter `publico` na chave (proposta) e considerar erro-ao-publicar para
   homônimos com `regraCalculo.tipo` divergente.
4. **F-09 / idade — RESOLVIDO contra bundle (2026-06-21), NÃO bloqueia:** `Meses=1/Anos=2` uniforme, sem
   inversão. Manter unidade SEMPRE explícita no JSON por robustez (não por inversão). Aberto: F-06/F-07
   (leitura por faixa) — normalizar idade para meses internamente.
5. **clamp vs texto:** declarar `tipo ∈ {clamp,texto}` em cada teto; trocar = mudança clínica que
   exige reaprovação (F-16). Decisão de produto mais crítica.
6. **`definirDose` / faixa min/max estruturada:** desbloquear na fase 2 (o que a pediatria mais precisa).
7. **DSL fechado vs expressão livre:** ratificar o DSL whitelist (proposta) por segurança clínica.
8. **Versionamento de conteúdo publicado (snapshot/auditoria):** escopo R1 ou fase 2+.

---

> **Artefatos formais (round 2) que materializam este doc:** JSON Schemas executáveis (ajv 2020) em
> `schemas/` (`README.md` + `envelope.schema.json` + `corpo-*.schema.json` T1..T8 + `instancias-exemplo/`
> `ibuprofeno.json`/`imc.json`); gramática do DSL (EBNF/whitelist/semântica D1..D8) em
> `04-dsl-regracalculo.md`; validação 2 camadas + golden-set por sub-tipo em `05-validacao-e-testes.md`;
> verificação de round-trip, cobertura e consistência em `qa/QA-round-2-relatorio.md`.
