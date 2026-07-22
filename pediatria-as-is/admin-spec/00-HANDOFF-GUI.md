---
tipo: handoff
atualizado: 2026-06-21
fontes:
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/02-audit-consistencia.md
  - admin-spec/02-audit-cobertura.md
  - admin-spec/03-admin-ux.md
  - admin-spec/03-backend-json.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - apps/web/docs/admin/prd-admin-antibioticos.md
  - PLANO-ADMIN-DATA-ARCH.md
relacionado:
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/03-backend-json.md
  - admin-spec/03-admin-ux.md
  - admin-spec/02-audit-consistencia.md
  - admin-spec/02-audit-cobertura.md
status: handoff-aguardando-gui
peso: core
---

# Handoff backend-ready — modelo de conteúdo unificado do CalcMed (para o Gui)

> Documento mestre para o Gui definir os JSONs. Sintetiza o sistema de tipos, as duas
> auditorias (consistência + cobertura), a UX do admin e o contrato de backend já escritos em
> `admin-spec/`. Nada aqui é inventado: cada afirmação rastreia a uma fonte. `[REAL]` = existe em
> produção/código hoje; `[PROPOSTA]` = proposta de fase 2 a confirmar; `FLAG` = decisão humana
> pendente (Gui/Gustavo/Luis). Status do schema persistido real: `x-status: provisorio-aguardando-gui`.

---

## 1. Resumo executivo — o modelo

O app tem **dois sistemas de cálculo paralelos** que hoje vivem hardcoded no binário Flutter
(pediátrico = `peso × idade × apresentação` com teto; adulto = `função renal → faixa → dose`) e
um terço de conteúdo não-droga (calculadoras, escores, protocolos, árvores, conversores, tabelas).

A síntese é **poucos moldes + JSON Schema + um engine de dados**:

1. **9 tipos de conteúdo canônicos (T1..T9)** cobrem 100% do conteúdo clínico **da Pediatria**
   (101 rotas, `_coverage-matrix.md`). O lado ADULTO (appwide-01..04) NÃO foi cruzado contra os moldes
   e tem arquétipos sem molde limpo (calculadora-com-prescrição, conduta-por-faixa-de-valor,
   ferramenta-interpretadora) — ver QA round 1 (completeness C1/C2/C3 + M1) e §7. Os **7 arquétipos de
   cálculo pediátricos** (MODELO-DOSE §1) + o eixo renal/regime adulto **colapsam em UM tipo `droga-dose`
   com 8 sub-tipos** (`dosing_type` D1..D8). (Os "7 presetTemplate adultos" são categorias de UI do admin,
   NÃO arquétipos de cálculo — `completo` e `calculada` o próprio doc admite não serem arquétipos; não
   somar 7+7=14. Ver K-02.) Os outros 8 tipos são o conteúdo não-droga.
2. **Um envelope JSON comum** a todos os moldes + um sub-objeto `corpo` discriminado pelo campo
   `tipo`. O envelope já existe `[REAL]` (deriva do `antibioticos.schema.json`); o discriminador
   `tipo` e o `corpo` por molde são `[PROPOSTA]`.
3. **Fórmula como DADO, não código** (`regraCalculo`): um avaliador genérico (`evalRegra`)
   interpreta um conjunto FECHADO de operadores. Mudar uma dose = editar JSON + revisar + publicar,
   sem rebuild. O engine NÃO é planilha de expressão livre (risco clínico): é um DSL whitelist.
4. **Verdade de hoje (auditoria de cobertura):** o admin atual é um **editor de texto de posologia
   + toggles de bloco**, não um motor de cálculo. Cobre de verdade só T1-D1 (dose como string) e T3
   (escores, motor irmão separado). 6 dos 8 sub-tipos de dose e 7 dos 9 tipos **não têm editor**.
5. **O que é forte e reutilizável** é o WORKFLOW editorial (status + revisão médica + review-dirty +
   chokepoint único de publicação), agnóstico de tipo. O buraco é o **editor de conteúdo** e a
   **validação de domínio** de cada molde.
6. **O buraco central da pediatria** é o `regraCalculo` estruturado (dose por duas variáveis
   combinadas peso × idade × apresentação com teto clamp/texto). Slots booleanos independentes não
   modelam isso.
7. **FLAG-A (alta, pré-requisito de tudo) — RESOLVIDA contra bundle (2026-06-21):** o app B2C de
   produção NÃO lê o JSON do admin. A dose é **hardcoded no binário Flutter** (107 controllers de
   equação + catálogo de drogas literal; `fromFirestore`/`snapshots(`/`withConverter` = 0). O pipeline
   admin→app não existe — "data-driven" é construção NOVA (engine `evalRegra` portável para Dart no app),
   não integração. Enquanto a ponte de leitura não existir, o admin é gerador de spec. Ver
   `qa/round1-ground-truth.md` D-A.

Escala: ~170 itens cadastráveis (excl. utilitários), ~110 são T1 (64 ped + 38 ATB adulto + ~8
vasoativas). R1 realista = subconjunto adulto simples (~24 dos 38 ATB); o eixo pediátrico inteiro e
T2/T4/T5/T6/T7/T8 são fase 2+.

---

## 2. JSON Schemas canônicos por molde (com instância real)

> **SCHEMAS FORMAIS EXECUTÁVEIS (round 2):** os blocos JSON Schema abaixo são a versão de leitura.
> A versão MÁQUINA (draft 2020-12, valida com ajv) vive em `schemas/` — 9 arquivos: `envelope.schema.json`
> + `corpo-*.schema.json` (T1..T8; T9 fica com `corpo` aberto). O coração é
> `schemas/corpo-droga-dose.schema.json` (sub-tipos D1..D8 via `allOf`/`if-then` sobre `corpo.tipo`, mais
> os 7 `$defs/regra_*` do `oneOf`). A gramática fechada do DSL `expr`/`teto_expr`/getters está em
> `04-dsl-regracalculo.md`; a validação em 2 camadas + golden-set por sub-tipo em `05-validacao-e-testes.md`.
> Provados no QA round 2 (`qa/QA-round-2-relatorio.md`): 9 schemas compilam, as 2 instâncias reais
> (`ibuprofeno.json` D4, `imc.json` T2) validam e fazem round-trip da dose AS-IS, e 8 testes negativos
> passam. Em caso de divergência entre o bloco-de-leitura e o arquivo `.json`, o arquivo `.json` vence.

### 2.1 Envelope comum (todos os moldes) `[REAL envelope + PROPOSTA discriminador]`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://calcmed.app/schemas/admin/conteudo/v1",
  "type": "object",
  "required": ["id","tipo","nome","classe","publico","statusEditorial",
               "revisaoMedicaStatus","slots","observacoes","referencias",
               "tagsRisco","ferramentasSimilares","schemaVersion"],
  "properties": {
    "id":   { "type": "string", "minLength": 1 },
    "tipo": { "enum": ["droga-dose","calculadora-formula","escore-por-pontos",
                       "escore-por-criterios","protocolo-multi-step","conduta-arvore-decisao",
                       "conversor","tabela-referencia","ferramenta-utilitaria"] },
    "nome":    { "type": "string" },
    "classe":  { "type": "string" },
    "publico": { "enum": ["adulto","pediatrico","ambos"] },
    "via":     { "enum": ["EV","Oral","EV+Oral","IM"] },
    "statusEditorial":     { "enum": ["rascunho","em-revisao","publicado","arquivado"] },
    "revisaoMedicaStatus": { "enum": ["pendente","aprovado","reprovado"] },
    "observacoes": { "$ref": "#/$defs/observacoes" },
    "referencias": { "type": "string" },
    "contraindicacoes": { "anyOf": [
      { "type": "string" },
      { "type": "object", "required": ["texto","gate"],
        "properties": { "texto": {"type":"string"}, "gate": {"type":"boolean"} } } ] },
    "tagsRisco":            { "type": "array", "items": { "type": "string" } },
    "ferramentasSimilares": { "type": "array", "items": { "type": "string" } },
    "slots":       { "$ref": "#/$defs/slots" },
    "ordemBlocos": { "type": "array", "items": { "type": "string" } },
    "corpo":       { "type": "object", "description": "Sub-schema escolhido por `tipo`." },
    "schemaVersion": { "type": "integer", "const": 1 }
  },
  "$defs": {
    "slots": {
      "type": "object",
      "required": ["peso","definirDose","dialise","regime","clearance","cockcroft",
                   "observacoes","referencias","copiarCompartilhar","ferramentasSimilares"],
      "properties": {
        "peso": {"type":"boolean"}, "definirDose": {"type":"boolean"}, "dialise": {"type":"boolean"},
        "regime": {"type":"boolean"}, "clearance": {"type":"boolean"}, "cockcroft": {"type":"boolean"},
        "observacoes": {"type":"boolean"}, "referencias": {"type":"boolean"},
        "copiarCompartilhar": {"type":"boolean"}, "ferramentasSimilares": {"type":"boolean"},
        "idade": {"type":"boolean"}, "apresentacao": {"type":"boolean"}, "doseMaxima": {"type":"boolean"}
      }
    },
    "observacoes": { "anyOf": [
      { "type": "string" },
      { "type": "array", "items": { "anyOf": [ {"type":"string"}, {"$ref":"#/$defs/observacao"} ] } } ] },
    "observacao": { "type": "object",
      "properties": { "id": {"type":"string"},
        "nivel": {"enum":["footnote","warning","critical"]}, "texto": {"type":"string"} } }
  }
}
```

Notas: `tipo` é o discriminador (valida `corpo` contra o sub-schema). `slots` continua sendo "a
verdade do que a tela exibe" `[REAL]`; os 3 slots NOVOS (`idade`, `apresentacao`, `doseMaxima`) são
o que falta para pediatria. `observacoes` mantém as 3 formas toleradas — normalizar agressivamente
quebra imports (B-01). Defaults: extras ON, clínicos OFF `[REAL defaultSlots]`.

### 2.2 T1 droga-dose (`corpo.dosagem`) — o coração

```json
{
  "type": "object",
  "required": ["tipo","posologias"],
  "properties": {
    "tipo": { "enum": ["fixo","lookup","peso-computado","hibrido","renal","regime","infusao-bic","so-aviso"] },
    "apresentacoes": { "type": "array", "items": {
      "type": "object", "required": ["id","label"],
      "properties": { "id":{"type":"string"}, "label":{"type":"string"},
        "concentracao_mg_ml": {"type":["number","null"]},
        "forma": {"enum":["suspensao","gotas","comprimido","ampola","frasco","spray","outro"]} } } },
    "posologias": { "type":"array", "minItems":1, "items": { "$ref": "#/$defs/posologia" } },
    "regraCalculo": { "$ref": "#/$defs/regraCalculo" },
    "doseMaxima": { "type":"object", "required":["tipo"],
      "properties": { "valor":{"type":["number","null"]}, "unidade":{"type":"string"},
        "tipo": {"enum":["clamp","texto"]} } }
  }
}
```

`posologia` `[REAL]` required: `id, papel, cenario, droga, dose, unidade, diluente, viaInline, tempo,
intervalo, esquema, alternativa`. `papel ∈ {direta, cenario, ataque, manutencao, indicacao}`
(`ataque-manutencao` NÃO é sub-tipo — é o `papel`). `posologias[0].alternativa == false` é invariante
estrutural. `doseTipo` PROIBIDO dentro de posologia (campo morto, normalize remove — D-01).

**Instância real (Ibuprofeno pediátrico, D4 híbrido — droga real do MODELO-DOSE):**

```json
{
  "id": "ibuprofeno-ped",
  "tipo": "droga-dose",
  "nome": "Ibuprofeno",
  "classe": "AINE",
  "publico": "pediatrico",
  "via": "Oral",
  "statusEditorial": "rascunho",
  "revisaoMedicaStatus": "pendente",
  "observacoes": [{ "id":"o1", "nivel":"warning", "texto":"Contraindicado < 6 meses." }],
  "referencias": "Bulario / protocolo institucional",
  "contraindicacoes": { "texto":"Contraindicado em < 6 meses (Meses) / < 1 ano (Anos).", "gate": true },
  "tagsRisco": ["aine","pediatria"],
  "ferramentasSimilares": ["paracetamol-ped","dipirona-ped"],
  "slots": { "peso":true, "idade":true, "apresentacao":true, "doseMaxima":true,
             "definirDose":false, "dialise":false, "regime":false, "clearance":false, "cockcroft":false,
             "observacoes":true, "referencias":true, "copiarCompartilhar":true, "ferramentasSimilares":true },
  "ordemBlocos": ["idade","peso","apresentacao","posologias","observacoes","referencias"],
  "schemaVersion": 1,
  "corpo": {
    "tipo": "hibrido",
    "apresentacoes": [
      { "id":"gotas50",  "label":"Gotas 50 mg/mL",  "concentracao_mg_ml":50,  "forma":"gotas" },
      { "id":"gotas100", "label":"Gotas 100 mg/mL", "concentracao_mg_ml":100, "forma":"gotas" },
      { "id":"gotas200", "label":"Gotas 200 mg/mL", "concentracao_mg_ml":200, "forma":"gotas" }
    ],
    "posologias": [
      { "id":"p1","papel":"direta","cenario":"","droga":"Ibuprofeno","dose":"5 a 10","unidade":"mg/kg",
        "diluente":"","viaInline":"Oral","tempo":"","intervalo":"6/6h a 8/8h","esquema":"","alternativa":false }
    ],
    "regraCalculo": {
      "tipo": "hibrido",
      "gate_idade": {
        "regra": { "op":"OU", "termos": [
          { "unidade":"Meses", "campo":"idade", "cmp":">=", "valor":6 },
          { "unidade":"Anos",  "campo":"idade", "cmp":">=", "valor":1 } ] },
        "se_falso": { "tipo":"contraindicado", "texto":"Contraindicado Ibuprofeno" }
      },
      "ramos": [
        { "por":"apresentacao", "quando":"gotas50",
          "saidas": [ { "id":"min","porPeso":{ "fator":1, "casas":0, "teto":{ "valor":40, "tipo":"clamp" } } },
                      { "id":"max","expr":"peso>=40 ? 20 : peso*2", "casas":0 } ] },
        { "por":"apresentacao", "quando":"gotas100",
          "saidas": [ { "id":"unica","porPeso":{ "fator":1, "casas":0, "teto":{ "valor":20, "tipo":"clamp" } } } ] },
        { "por":"apresentacao", "quando":"gotas200",
          "saidas": [ { "id":"min","expr":"(peso/4 >= 10) ? 10 : floor(peso/4)", "casas":0 },
                      { "id":"max","expr":"(peso/2 >= 10) ? 10 : peso/2", "casas":0 } ] }
      ],
      "ramos_neonatais": []
    },
    "doseMaxima": { "valor":null, "unidade":"gotas", "tipo":"clamp" }
  }
}
```

> **Estrutura fiel à fonte (func-01 L67-73), não números ilustrativos.** As 3 apresentações reais
> (50/100/200 mg/mL em GOTAS), o `max` condicional da 50 mg/mL (`peso>=40 ? 20 : peso*2` — não um
> `porPeso` linear), e o `floor(peso/4)` da 200 mg/mL estão verbatim. Esta instância substituiu uma
> versão anterior que omitia a 200 mg/mL e achatava o `max` num teto-clamp (QA round 1 — correctness
> C1/C2). É idêntica em forma à instância de `03-backend-json.md` §3.3 (fonte única da instância).
>
> **DEPENDÊNCIA DE SCHEMA (M1/B-02) — RESOLVIDA no round 2:** as saídas `max`/200mg-mL acima usam um
> campo `"expr"` (DSL) por saída. O JSON Schema formal de `saida` agora declara `expr` + `teto_expr`
> (string DSL) e a forma aninhada `porPeso`, em `schemas/corpo-droga-dose.schema.json` (`$defs/saida`).
> A instância-âncora real `schemas/instancias-exemplo/ibuprofeno.json` valida contra envelope + corpo
> (ajv 2020) e faz round-trip exato do AS-IS func-01 (3 apresentações, ternário do `max`, `floor` na
> 200 mg/mL) — provado no QA round 2 (`qa/QA-round-2-relatorio.md`). A gramática fechada do DSL está
> em `04-dsl-regracalculo.md` (EBNF + whitelist de 7 funções). Os números clínicos finais vêm do
> Gustavo + da leitura do bundle. A migração NÃO fabrica `regraCalculo` — o admin a preenche droga a
> droga sob revisão clínica.

### 2.3 `regraCalculo` — os 7 tipos do engine `[PROPOSTA]`

```json
{ "$defs": { "regraCalculo": { "type":"object", "required":["tipo"], "oneOf": [
  { "$ref":"#/$defs/regra_porPeso" }, { "$ref":"#/$defs/regra_lookup" },
  { "$ref":"#/$defs/regra_hibrido" }, { "$ref":"#/$defs/regra_faixaClearance" },
  { "$ref":"#/$defs/regra_regime" }, { "$ref":"#/$defs/regra_infusaoBic" },
  { "$ref":"#/$defs/regra_definirDose" } ] } } }
```

- **`porPeso` (D3):** `{ "tipo":"porPeso", "saidas":[{ "id", "fator"|("fator_min"+"fator_max")|"expr",
  "casas":null, "teto":{ "valor","tipo":"clamp"|"texto" }|"teto_expr":"<DSL>" }] }`.
  `saida = round(fator × peso, casas)`; `casas:null` = cru (paridade Hidroxizina/Escopolamina, F-10/F-13).
  `fator = mg_por_kg ÷ concentracao_mg_ml`. **NOVO (M1/B-02):** uma saída pode usar `expr` (string DSL,
  ex. `floor(peso/4)`, `peso>=40 ? 20 : peso*2`) em vez de `fator`, e `teto_expr` (string DSL) em vez de
  `teto:{valor,tipo}`, para os casos condicionais/com-`floor` (Ibuprofeno 200 mg/mL, max da 50 mg/mL).
  Sem isso, o ramo `floor`/ternário NÃO é modelável. Schema formal dos 7 `regra_*` (com `expr`/`teto_expr`
  em `saida`) é PENDÊNCIA de fechamento antes do build — hoje só há exemplos de instância.
- **`lookup` (D2):** `{ "tipo":"lookup", "indexar_por":"idade"|"peso", "tabela":[{ "faixa":{min_meses,max_meses
  |min_anos,max_anos|min_kg,max_kg}, "dose":"<string>", "frequencia" }] }`. Sem aritmética; seleciona linha.
- **`hibrido` (D4):** `gate_idade{regra,se_falso}` + `ramos[{por,quando,saidas[porPeso|texto]}]` +
  `ramos_neonatais[]` (IG semanas + dias-de-vida, NOVO). É o buraco central da pediatria.
- **`faixaClearance` (D5):** `{ "variavel":"clearance", "cockcroft":bool, "faixas":[{min,max,posologiaRef}],
  "inclusividade":"min-inclusivo-max-exclusivo", "diaramo":{ativo,prescricaoRef,nota} }`. Cockcroft ON →
  `TFGe=(140-idade)×peso/(CrS×72)`, ×0,85 se mulher `[REAL idêntico em ~16 cópias]`.
- **`regime` (D6):** `{ "modos":{ "unica":{faixas[]}, "multiplas":{faixas[]} } }`. Gentamicina.
- **`infusaoBic` (D7):** `{ "inputs":["peso","dose_desejada_mcg_kg_min","vazao_desejada_ml_h"],
  "getters":{...expr DSL...}, "concentracao_maxima_mcg_ml", "dose_maxima" }`. Getters em DAG.
- **`definirDose` (calculada):** `{ "faixaPermitida":{min,max,unidade}, "derivados":[{expr,cap,rotulo}] }`.
  **BLOQUEADO até fase 2** `[REAL gate]` — é o que a pediatria mais precisa.

### 2.4 T2 calculadora-formula (`corpo.calculo`) `[PROPOSTA]`

```json
{ "type":"object", "required":["inputs","formulas"], "properties": {
  "inputs": { "type":"array", "items": { "type":"object", "required":["id","label"],
    "properties": { "id":{"type":"string"}, "label":{"type":"string"}, "unidade":{"type":"string"},
      "validacao": { "type":"object", "properties": { "min":{"type":"number"}, "max":{"type":"number"}, "msg":{"type":"string"} } } } } },
  "formulas": { "type":"array", "minItems":1, "items": { "type":"object", "required":["id","label","expr"],
    "properties": { "id":{"type":"string"}, "label":{"type":"string"}, "expr":{"type":"string"}, "casas":{"type":["integer","null"]} } } },
  "faixas_classificacao": { "type":"array", "items": { "type":"object",
    "properties": { "condicao":{"type":"string"}, "rotulo":{"type":"string"}, "texto":{"type":"string"} } } },
  "inputs_mutuamente_exclusivos": { "type":"array", "items": { "type":"array", "items":{"type":"string"} } },
  "notas": { "type":"array", "items": {"type":"string"} } } }
```

**Instância real (IMC) — fórmula e unidade verbatim do bundle (appwide-03 L36):** inputs `peso` (kg)
+ `altura` **(cm)**; formula `{ "id":"imc","label":"IMC","expr":"peso * 10000 / (altura * altura)","casas":1 }`
(altura em **cm**, fator 1e4 — NÃO a fórmula "de livro" `peso/(altura_m)²`). `faixas_classificacao`
6 faixas com as bordas reais do AS-IS: `<18.5` Baixo Peso · `>=18.5 && <24.9` Eutrófico ·
**`>=24.9 && <30` Sobrepeso** (borda 24.9, não 25 — m2) · `>=30 && <35` Obesidade Grau I ·
`>=35 && <40` Grau II · `>=40` Grau III. Multi-fórmula = N entradas em `formulas` (QTc
Bazett/Fridericia/Framingham/Hodges lado a lado).

> Correção QA round 1 (correctness C3/m2): a versão anterior usava altura em metros e
> `expr:"peso / (altura*altura)"` com `validacao 0.3-2.5`, divergindo do binário. Se o produto
> decidir migrar para a convenção em metros, marcar como REDESENHO explícito — não "instância real".

### 2.5 T3 escore-por-pontos (`corpo.escore`) `[REAL — Admin de Escores já entregue]`

```json
{ "type":"object", "required":["questions","resultados"], "properties": {
  "questions": { "type":"array", "items": { "type":"object", "required":["id","title","options"],
    "properties": { "id":{"type":"string"}, "title":{"type":"string"},
      "options": { "type":"array", "items": { "type":"object", "required":["label","pontos"],
        "properties": { "label":{"type":"string"}, "pontos":{"type":"integer"} } } } } } },
  "resultados": { "type":"array", "items": { "type":"object", "required":["id","title","biggerThen"],
    "properties": { "id":{"type":"string"}, "title":{"type":"string"}, "meaning":{"type":"string"}, "biggerThen":{"type":"integer"} } } },
  "aditionalTexts": { "type":"array", "items": { "type":"object",
    "properties": { "meaningTitle":{"type":"string"}, "variations":{"type":"array","items":{"type":"string"}} } } } } }
```

`total = Σ option.pontos`. **Typos load-bearing `aditionalTexts` / `biggerThen` NÃO se corrigem**
(contrato persistido `[REAL]` — N-02). A SELEÇÃO por limiar (`maior biggerThen ≤ total`, = `>=`) é
PROPOSTA, **não `[REAL]` verificado**: o comparador `>` vs `>=` não foi isolado no bundle (D-C
INCONCLUSIVO); appwide-07 diz `>`, admin React diz `>=`. FLAG C-02 (D-C) — ratificar com Gustavo +
teste de borda `total == biggerThen`.

### 2.6 T4..T8 (`corpo` por molde) `[PROPOSTA]`

Schemas formais completos em `03-backend-json.md` §2.4–§2.8. Resumo dos `corpo`:

- **T4 escore-por-criterios** (`corpo.estadiamento`): `{ eixos[], regras_estagio[{estagio,condicao(expr),texto}],
  sub_calc, imagem_apoio }`. Avalia regras EM ORDEM; primeira verdadeira define o estágio (NÃO soma). IRA KDIGO, PPS.
- **T5 protocolo-multi-step** (`corpo.protocolo`): `{ abas[{id,titulo,conteudo{tipo,ref|corpo}}], input_global, cross_links }`.
  Composição RECURSIVA rasa (uma aba referencia outro molde). CAD/PCR/Intubação/Diarreia. Hoje hardcode.
- **T6 conduta-arvore-decisao** (`corpo.arvore`): `{ no_raiz, nos[{id,pergunta,sim,nao,conduta_texto}], mnemonico_header, link_final }`.
  Navega sim/nao até folha. Hipoglicemia, Bradicardia, Anafilaxia.
- **T7 conversor** (`corpo.conversor`): `{ inputs[], dropdowns[{opcoes[{label,fator_b}]}], formula(expr), nota_fixa }`.
  `fator_b` da opção escolhida entra na fórmula. 7 conversores de infusão + corticóides.
- **T8 tabela-referencia** (`corpo.tabela`): `{ indexar_por∈{cenario,faixa_etaria,clcr}, linhas[{chave,apresentacao,dose_usual,prescricao,cuidados}], eixo_decisao }`.
  SEM cálculo. Antiarrítmicos, Antídotos, Soluções, Parâmetros VM.
- **T9 ferramenta-utilitaria**: CRUD offline (Soluções Personalizadas, Passômetro). Fora do escopo de cadastro clínico.

---

## 3. Contrato de comportamento por molde (JSON → tela/cálculo)

| Molde | Inputs lidos | O que o engine faz | Render |
|---|---|---|---|
| **T1-D1 fixo** | nenhum | nada | exibe `posologias` como texto |
| **T1-D2 lookup** | idade OU peso | seleciona linha de `tabela[]` cuja faixa contém o valor | exibe `linha.dose` (string) |
| **T1-D3 peso-computado** | peso (+apresentação) | `saida = round(fator × peso, casas)`; teto clamp aplica `min`, teto texto só exibe | dose calculada por saída |
| **T1-D4 híbrido** | peso + idade (+apres/indicação) | avalia `gate_idade`; se falso → `se_falso` substitui dose; senão escolhe ramo e computa/exibe texto | dose ou "Contraindicado X" |
| **T1-D5 renal** | clearance ou Cockcroft | seleciona faixa de clearance → posologiaRef; diálise ON → prescrição fixa + nota | posologia referenciada |
| **T1-D6 regime** | modo + clearance | escolhe sub-árvore por modo, depois faixa de clearance | posologia do modo |
| **T1-D7 infusão-bic** | peso + dose alvo + vazão | avalia getters em ordem de dependência (DAG) | mL/h, volume 24h, concentração |
| **T1-D8 só-aviso** | nenhum | nada (`tem_dose:false`) | exibe só o aviso clínico |
| **T2 calculadora** | inputs declarados | avalia cada `formula.expr` pelo DSL; `faixas_classificacao` classifica a saída | N saídas + faixa |
| **T3 escore** | respostas | `Σ pontos` → maior `biggerThen ≤ total` | título + meaning + aditionalTexts |
| **T4 critérios** | eixos | primeira `regra_estagio` verdadeira (em ordem) | badge de estágio |
| **T5 protocolo** | input_global + por aba | renderiza abas; cada aba delega ao molde referenciado | abas/steps |
| **T6 árvore** | respostas sim/não | navega `sim`/`nao` até folha (`conduta_texto`) | conduta condicional |
| **T7 conversor** | inputs + dropdown | `fator_b` escolhido entra na fórmula | valor convertido |
| **T8 tabela** | seletor de cenário | seleciona linha por `indexar_por` | colunas como texto |

**DSL de expressão `expr` (fechado, sem `eval`)** — usado em T2/T7 fórmulas, `teto_expr`, getters BIC,
T4/T6 condições: operandos (inputs declarados, literais, getters em DAG); aritmética `+ - * /` +
parênteses; comparação `> >= < <= == !=`; booleanos `&& || !` (ou `E`/`OU`/`NAO` na forma de gate);
whitelist de funções `min max floor ceil round abs` + ternário `cond ? a : b`. **Proibido:** acesso a
propriedade, função fora da whitelist, loop, atribuição, side-effect. Guards universais do avaliador:
vírgula→ponto, `NaN`/`±Inf`→0, divisão por zero→0, input ausente required → empty state global.

---

## 4. Migração schema atual (antibióticos v3) → unificado

**Hoje `[REAL]`:** `migrarAntibioticoV2(itemV2)` roda one-shot na carga (v2→v3): exige nome, rebaixa
`publicado`→`em-revisao`, zera revisão→`pendente`, mantém chave legada como backup. Chave de
persistência `cm_admin_antibioticos_v3` (localStorage). Firestore escrito mas não testado (B-10).

**Proposta `migrarV3ParaConteudo` (v3 → conteúdo unificado) `[PROPOSTA]`:**

1. **Envelope:** todo antibiótico v3 vira `tipo: "droga-dose"`. Copia `id, nome, classe, publico, via,
   statusEditorial, revisaoMedicaStatus, slots, observacoes, referencias, tagsRisco,
   ferramentasSimilares, ordemBlocos` 1:1. Adiciona `schemaVersion: 1`.
2. **`presetTemplate` → `corpo.dosagem.tipo`** (mapa de colapso, sistema-de-tipos §3):
   - `simples` → `fixo` (ou `lookup` se há faixas de texto nas posologias)
   - `peso` → `peso-computado`
   - `renal` → `renal` (`regraCalculo.tipo: faixaClearance`)
   - `renal-dialise` → `renal` com `diaramo.ativo: true`
   - `regime` → `regime`
   - `calculada` → `peso-computado`/`renal` com `regraCalculo.tipo: definirDose` (permanece BLOQUEADO p/ publicação)
   - `completo` → não vira sub-tipo; mapear pelos slots realmente ligados
   - Presets legados (`padrao-a..d`, `crcl`) → já mapeados pelo `PRESET_LEGACY` antes `[REAL]`
3. **`posologias`** copiadas 1:1 (texto; invariante `posologias[0].alternativa == false`; `papel`
   incl. `ataque`/`manutencao` mantido).
4. **`regraCalculo` NÃO é fabricada na migração** (a conta segue no app). Nasce `null`/ausente; o admin
   preenche manualmente na fase 2, droga a droga, sob revisão. Migração NÃO inventa fórmula — seria inseguro.
5. **Pediatria (64 drogas)** não migra de v3 (não existe lá); entra como cadastro NOVO usando os
   templates de `regraCalculo`, cada uma `rascunho` + `pendente` + `publico: pediatrico` (logo não
   publica na V2). Importável via seed JSON.
6. **Idempotência:** migração guardada por `schemaVersion` (item já em v1 é pulado); chave v3 preservada
   como backup; unificado grava em chave nova (ex.: `cm_admin_conteudo_v1`); conteúdo nunca nasce publicado.

Regra raiz `[REAL]`: **nunca apagar dado em migração** (chave legada fica como backup; `additionalProperties`
livre tolera campos legados; o normalize tolera as 3 formas de `observacoes`).

> A migração NÃO resolve C-01 automaticamente — ela PRESERVA `publico` na identidade, mantendo os dois
> itens homônimos (ped vs adulto) separados (correto). Reconciliação editorial é decisão do Gustavo.

---

## 5. LOG DE DECISÕES ABERTAS (Gui + Gustavo)

| # | Decisão | Veredito da auditoria / proposta | Dono | Bloqueia |
|---|---|---|---|---|
| D-A | **FLAG-A:** o app B2C de produção LÊ o JSON do admin? | **RESOLVIDO contra bundle (2026-06-21): NÃO lê — dose 100% HARDCODED no binário Flutter** (107 controllers de equação + catálogo de drogas literal; `fromFirestore`/`snapshots(`/`withConverter` = 0 ocorrências). O pipeline admin→app NÃO existe e precisa ser construído do zero. Enquanto a ponte de leitura não existir no app Flutter, o admin é gerador de spec, não fonte viva. Ver `qa/round1-ground-truth.md` D-A. **Pré-requisito de toda a fase 2.** | Gui | "fórmula como dado" inteiro |
| D-B | **F-09 / idade Meses vs Anos** | **RESOLVIDO contra bundle (2026-06-21): NÃO há inversão.** O dropdown codifica `Meses=1, Anos=2` de forma uniforme em todo o binário (`aR("Meses",1)` / `aR("Anos",2)`; 0 definições inversas), e os getters lêem `s.c.b` coerentemente (Ibuprofeno `A.a7D`, Bromoprida-base `A.uX`). A "inversão func-01 vs func-02" era **ruído de extração** (confusão com um 2º enum `eDt` ordinal 0/1 que só renderiza rótulo de UI, não alimenta gate de dose). Ver `02-audit-meses-anos.md` + `qa/round1-ground-truth.md` F-09. **Não desabilitar o campo de idade.** A recomendação de JSON SEMPRE carregar unidade explícita (`{unidade:"Meses"\|"Anos"}`) é MANTIDA — por robustez/legibilidade, não por inversão. Aberto SEPARADAMENTE: F-06/F-07 (leitura inconsistente de `c.b` POR FAIXA dentro da mesma droga) — ver D-N. | Gui | (rebaixado de P0) |
| D-C | **C-02 / `biggerThen` `>` vs `>=`** | Documentado das DUAS formas (appwide-07 "maior que" = `>` vs appwide-03/admin-spec "maior limiar ≤ total" = `>=`). Muda classificação SOFA no limiar. **O comparador-runtime NÃO foi isolado no bundle** (só o storage do campo; `qa/round1-ground-truth.md` D-C/INCONCLUSIVO). A intenção documentada do admin React (`escores.schema.json` L205) é `>=`. **Proposta (a ratificar, NÃO confirmada no código):** fixar `>=` (maior-limiar-≤-total, inclusivo) + teste de borda `total == biggerThen` obrigatório. | Gustavo + Gui | JSON de escore com limiar |
| D-D | **C-01 / chave de unicidade** | ~13 ATB existem ped (mg/kg×peso) E adulto (dose fixa por clearance) com a MESMA marca, eixos OPOSTOS. **Proposta:** manter `publico` na chave (NÃO relaxar p/ só `nome`); considerar elevar de warning para erro-ao-publicar quando homônimos com `regraCalculo.tipo` divergente forem ambos publicados. | Gui (schema) + Gustavo | unificação de conteúdo |
| D-E | **clamp vs texto em cada teto** | ~14 tetos clampam de verdade; o resto é só copy exibida — sob a MESMA palavra "Máx" (U-04). Clampar um teto-texto = **comportamento clínico NOVO** (F-16). **Proposta:** `doseMaxima.tipo ∈ {clamp,texto}` por teto; validate sinaliza troca clamp↔texto como mudança clínica que exige reaprovação. Decisão de produto mais crítica do eixo pediátrico. | Gustavo (clínico) | publicação de dose com teto |
| D-F | **`definirDose` / dose-calculada (faixa min/max)** | Gate interino `[REAL]` bloqueia publicação até a faixa min/max estruturada existir (fase 2). É exatamente o que a pediatria mais precisa (faixa min/max por kg com teto). | Gui | publicação de `calculada`/pediatria avançada |
| D-G | **Pediátrico/ambos fora do R1** | `validateAntibiotico` L327: público pediátrico/ambos NÃO publica na V2 (adulto-only). Todo o eixo pediátrico fica em rascunho mesmo cadastrado. Confirmar escopo R1. | Luis/produto | release pediatria |
| D-H | **Typos load-bearing** | `aditionalTexts`, `biggerThen` (T3), `Cockroft` (sic), `coroporal`, `gostas`, etc. são CONTRATO persistido. **Não corrigir sem camada de compat/alias** (quebra leitura legada). appwide-07 propõe `aditionalTexts→additionalTexts` / `biggerThen→minPoints` só com compat. | Gui (migração) | round-trip backend |
| D-I | **Validação de domínio (C2) cega ao cálculo** | Hoje valida só campo-vazio/enum/unidade. **Proposta:** camada 2 — cobertura de faixa (sem buraco/sobreposição + inclusividade explícita), fórmula só com tokens declarados, gate de idade com `se_falso`, árvore sem nó órfão. Onde mora o risco clínico (faixa de clearance com buraco passa hoje). | Gui | segurança clínica de qualquer cálculo |
| D-J | **DSL fechado vs expressão livre** | **Proposta:** ratificar o DSL whitelist (sem `eval`, conjunto fechado de operadores) por segurança clínica e portabilidade Flutter. Expressão arbitrária editável por não-engenheiro = risco de dose por ordem de grandeza. | Gui | engine de fórmula |
| D-K | **Versionamento de conteúdo publicado (snapshot/auditoria)** | `schemaVersion` (formato) ≠ revisão clínica. Snapshot do item publicado ("qual dose estava no ar em DD/MM") é PROPOSTA. Confirmar se entra no R1 (provavelmente fase 2+). | Gui | auditoria clínica |
| D-L | **C-06 / rótulo Cockcroft** | Saída rotulada `mL/min/1,73m²` mas a fórmula Cockcroft-Gault entrega `mL/min` NÃO normalizado, em ~16 cópias. **Proposta:** extrair `useCockcroft` único + decidir rótulo. | Gui + Gustavo | calc renal adulto |
| D-M | **Imagens como dado** | PPS, Sinais Vitais, Hiperglicemia tabela de correção vivem como JPG (arte fechada). Sobem como ASSET, não dado estruturado. | Luis/produto | T4/T8 dessas telas |
| D-N | **F-06/F-07 — leitura inconsistente de `c.b` POR FAIXA** (separado de F-09) | ABERTO. Distinto da "inversão global" (que foi refutada, D-B). Dentro da MESMA droga, faixas de prescrição podem disparar só com `unit==Meses` e nunca renderizar se a idade vier em Anos (Dimenidrato/Ondansetrona, F-06); Bromoprida `isAgeOver1Year` testa `>=12` no ramo MESES (= 1 ano, coerente — não "12 anos"; ver `qa/round1-ground-truth.md` corolário F-07). **Regra de modelagem:** TODA faixa etária opera sobre idade JÁ normalizada para meses internamente, nunca sobre `unit` cru. O `gate_idade`/`lookup` no JSON precisa declarar se opera ANTES ou DEPOIS da conversão. | Gui + Gustavo | gates de borda 12m/1a (D2/D4) |

---

## 6. Recomendações de implementação

1. **Engine data-driven primeiro, conteúdo depois.** O `evalRegra(regra, inputs) → resultado` (DSL
   fechado §3) é a peça nova nuclear. **CONFIRMADO contra bundle (D-A): o app B2C de produção NÃO lê o
   JSON — a dose é hardcoded no binário Flutter** (107 controllers + catálogo literal; 0 `fromFirestore`).
   Logo a ponte de leitura precisa ser CONSTRUÍDA no app Flutter (`evalRegra` portável para Dart) — não é
   integração, é peça nova. Decisão arquitetural #1 em aberto (E-01): em qual runtime o engine vive
   (Flutter app vs backend)? Enquanto a ponte não existir, o admin é gerador de spec, não fonte viva.
2. **Contract tests por molde e por sub-tipo de dose.** Para cada um dos 7 `regraCalculo`, um conjunto
   de casos `(regra, inputs) → resultado esperado` derivado das drogas reais auditadas (Ibuprofeno D4,
   Gentamicina D6, Terbutalina D7, Aciclovir D5+diálise...). Os contract tests viram a rede de segurança
   que substitui a revisão manual de cada controller Dart. **Casos de borda OBRIGATÓRIOS** (dos achados
   da própria auditoria): (a) assimetria de teto F-02 — `max = peso>=40 ? 20 : peso*2` prova que o engine
   faz o ternário, não um clamp; (b) cru vs `round(.,0)` F-10/F-13 — Hidroxizina 10,3 kg → 3,605 mL sem
   arredondar; (c) `min(peso,T)` vs `min(fator×peso,T)` (B-05) — ordem do clamp; (d) divergência runtime
   React vs Flutter da MESMA `expr` (B-03 — exige gramática/precedência formal); (e) `biggerThen` borda
   `total == biggerThen` (C-02, comparador NÃO isolado no bundle — ratificar com Gustavo). **F-09 NÃO é
   mais caso de borda crítico** (resolvido — Meses=1/Anos=2 uniforme); manter teste de 12m/1a só para
   F-06/F-07 (D-N), e o validador deve normalizar idade para meses internamente.
3. **Validação em 2 camadas.** Camada 1 (estrutural/envelope) já existe `[REAL]` em `validateAntibiotico`
   — reusar agnóstico de tipo. Camada 2 (domínio/cálculo) é nova `[PROPOSTA]`: cobertura de faixa,
   parse do DSL, exaustividade de ramos/árvore, coerência de teto. **É onde mora o risco clínico** —
   "avisar no rascunho, bloquear na publicação" (Q7). O chokepoint único de publicação (editor + bulk +
   import) e o review-dirty já são fortes e reutilizáveis `[REAL]` — NÃO reescrever.
4. **Faseamento:**
   - **R1 (adulto, evolução do form plano):** envelope unificado + T1-D1/D2/D3/D5/D6 adulto com
     `regraCalculo` estruturado, T3 (já entregue, só integrar ao catálogo). D-A e D-B já RESOLVIDOS
     contra bundle; restam D-C (comparador `biggerThen`) e D-D (chave de unicidade) antes de qualquer
     JSON de cálculo, mais a decisão de runtime do engine (E-01). ~24 dos 38 ATB são simples e cabem aqui
     (número orientativo, não reconciliado com o mapa por preset — ver `qa/QA-round-1-relatorio.md` K-12).
   - **Fase 2 (pediatria + cálculo rico):** D4 híbrido (`gate_idade` + ramos + `ramos_neonatais`),
     `definirDose` (faixa min/max), `doseMaxima` clamp/texto, slots `idade`/`apresentacao`. Desbloquear
     D-F, D-G. É o buraco central — exige o engine de dados maduro + revisão clínica droga a droga.
   - **Fase 2+ (não-droga estruturado):** T2 (fórmulas), T4 (KDIGO/PPS), T5 (CAD/PCR multi-step), T6
     (árvores), T7 (conversores), T8 (tabelas). Hoje hardcode no binário; mover é engine novo por JSON.
5. **Migração segura e idempotente** (§4): one-shot guardada por `schemaVersion`, chave legada como
   backup, conteúdo nunca nasce publicado, `regraCalculo` nunca fabricada automaticamente.
6. **Modelar pelo superset do `fromJson`** (D-05): `toJson` emite menos campos que `fromJson` lê
   (`route`/`icon`) — o backend deve modelar pelo superset ou perde campos no round-trip.

> Fontes detalhadas: tipos e moldes em `01-sistema-de-tipos.md`; achados clínicos/contrato em
> `02-audit-consistencia.md`; o que existe vs falta em `02-audit-cobertura.md`; UX do construtor em
> `03-admin-ux.md`; engine + migração em `03-backend-json.md`. **Schemas formais executáveis** (ajv 2020)
> em `schemas/` (`README.md` + 9 `.json`); **gramática do DSL** (EBNF + whitelist + semântica D1..D8) em
> `04-dsl-regracalculo.md`; **validação 2 camadas + golden-set** em `05-validacao-e-testes.md`; verificação
> de round-trip/cobertura/consistência em `qa/QA-round-2-relatorio.md`.

---

## 7. Lacunas de cobertura app-wide ADULTO (QA round 1 — completeness)

> A afirmação "9 tipos cobrem 100%" está comprovada SÓ para a Pediatria (101 rotas,
> `_coverage-matrix.md`). O lado adulto (appwide-01..04) NUNCA foi cruzado contra os moldes; estes
> arquétipos clínicos NÃO encaixam limpo em nenhum T/D atual. São RECOMENDAÇÕES de escopo (decisões de
> design abertas), não erros de fato. Antes de reafirmar "100%", rodar a matriz de cobertura adulto.

| Gap | Arquétipo sem molde | Onde mora | Recomendação |
|---|---|---|---|
| C-CL1 | **Calculadora-com-prescrição** (déficit/correção → string de receita com solução/soro/tempo por faixa) | Distúrbio de Sódio (Adrogué-Madias), Bicarbonato; mini-calcs de CAD/Cirrose dentro de T5 | Novo tipo `calculadora-com-prescricao` (ou sub-tipo de T2 que distingue saída-número de saída-prescrição). T2 só produz número classificado, não receita. |
| C-CL2 | **Conduta por FAIXA DE VALOR** (1 input numérico → blocos de conduta literais) | Potássio, Magnésio, Hipocalcemia | Estender T6 (hoje só sim/não) para ramificação por faixa numérica, OU tipo próprio. Não é T6 (booleano) nem T4 (badge) nem T2 (sem número). |
| C-CL3 | **Ferramenta-interpretadora** (motor de regras → classificação textual multi-resultado) | Distúrbios Ácido-Base (Winter, delta-delta, BICE — dezenas de combinações; maior risco clínico) | Tipo `interpretador`/`classificador`, OU marcar hardcode-permanente-fora-de-escopo com justificativa. T2/T4 não cobrem multi-distúrbio simultâneo. |
| M-CV | **"Monte sua solução"** (ampolas + soro → concentração → vazão) | Vasoativas adultas | Estender `infusaoBic` (D7) com bloco "montar solução" nos `inputs` (hoje assume concentração fixa, Terbutalina). Ver §3.6 backend. |
| M-G | **Guard inter-input** que esconde TODA a saída por condição entre inputs | LDL com TG≥400 | Estender `validacao` de T2 (hoje só `{min,max,msg}` por campo) para guard que oculta a saída por condição sobre OUTRO input. |
| M-PPS | **PPS classificado contraditoriamente** (T4 vs cascata-de-selects-dependentes) | PPS | Re-especificar T4 para cobrir cascata de selects encadeados que resolve %/categoria, OU molde próprio. Hoje T4 = `regras_estagio` avaliadas em ordem, não seleção dependente. |
| M-08 | **appwide-08 não-clínico** (Escala/Plantões CRUD, Quiz admin-driven, Vantagens, Referral, Onboarding) omitido do catálogo | T9 declarado "~4 itens" | Listar explicitamente em T9 como out-of-scope (como já faz com os 4); decidir o Quiz, que é admin-driven (overlapa T3) e merece nota. |

> Observações menores (sem ação de bloqueio): "categoria-índice / tela de navegação" não é tipo, então
> a frase "cada tela navegável mapeia em um tipo" (§1) é frágil; telas multi-tipo (Cardioversão T2+T6,
> IRA-KDIGO, CAD) quebram o 1:1; "hub de abas" (Ventilação Mecânica) é forçado em T5 (que é multi-step
> sequencial). Tabela-em-imagem (PPS/Sinais Vitais) é decisão explícita de asset (D-M), não gap.
