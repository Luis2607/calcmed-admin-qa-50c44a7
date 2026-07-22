---
tipo: concept
atualizado: 2026-06-21
fontes:
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/03-backend-json.md
  - admin-spec/00-HANDOFF-GUI.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - MODELO-DOSE-PEDIATRICA.md
relacionado:
  - admin-spec/03-backend-json.md
  - admin-spec/00-HANDOFF-GUI.md
status: vigente
peso: core
---

# JSON Schemas formais (admin CalcMed unificado) — draft 2020-12

Conjunto de JSON Schema executaveis (draft 2020-12) que formalizam o sistema de tipos
de conteudo do admin unificado (`01-sistema-de-tipos.md`) e o contrato de backend
(`03-backend-json.md`). Sao a versao MAQUINA dos schemas que viviam como blocos de codigo
no handoff: aqui validam de verdade (ajv 2020).

Status: o envelope e o sub-tipo D1-fixo derivam do contrato persistido REAL
(`antibioticos.schema.json`, `x-status: provisorio-aguardando-gui`). Tudo abaixo
(discriminador `tipo`, `corpo`, `regraCalculo`, sub-tipos D2-D8, moldes T2-T9) e
**[PROPOSTA]** da fase 2, a confirmar com o Gui (backend) e o Gustavo (clinico). Cada
schema carrega `x-status` marcando [REAL] vs [PROPOSTA].

## Arquivos

| Arquivo | Molde | Papel |
|---|---|---|
| `envelope.schema.json` | todos T1..T9 | Envelope comum: `id`, `tipo` (discriminador), `nome`, `classe`, `publico`, `via`, `statusEditorial`, `revisaoMedicaStatus`, `slots` (10 reais + 3 novos), `observacoes`, `referencias`, `contraindicacoes`, `tagsRisco`, `ferramentasSimilares`, `ordemBlocos`, `corpo`, `schemaVersion`. REUSA os campos reais de `antibioticos.schema.json`. |
| `corpo-droga-dose.schema.json` | T1 | `corpo` de droga-dose. `oneOf`/discriminado por sub-tipo D1..D8 + `regraCalculo` (`$defs` dos 7 tipos do engine). O coracao. |
| `corpo-calculadora.schema.json` | T2 | `inputs[]` + `formulas[]` (DSL) + `faixas_classificacao[]` + `inputs_mutuamente_exclusivos[]` + `notas[]`. |
| `corpo-escore.schema.json` | T3 | `questions[]` (opcoes com `pontos`) + `resultados[]` (`biggerThen`) + `aditionalTexts[]`. Typos load-bearing preservados. [REAL] |
| `corpo-escore-criterios.schema.json` | T4 | `eixos[]` + `regras_estagio[]` (booleanas, em ordem) + `sub_calc` + `imagem_apoio`. |
| `corpo-protocolo.schema.json` | T5 | `abas[]` com `conteudo` recursivo (referencia outro molde) + `input_global` + `cross_links[]`. |
| `corpo-conduta.schema.json` | T6 | `no_raiz` + `nos[]` (SIM/NAO) + `mnemonico_header` + `link_final`. |
| `corpo-conversor.schema.json` | T7 | `inputs[]` + `dropdowns[]` (`fator_b`) + `formula` (DSL) + `nota_fixa`. |
| `corpo-tabela-referencia.schema.json` | T8 | `indexar_por` + `linhas[]` + `eixo_decisao`. |
| `instancias-exemplo/ibuprofeno.json` | T1 / D4 hibrido | Instancia REAL valida (envelope + corpo-droga-dose). |
| `instancias-exemplo/imc.json` | T2 | Instancia REAL valida (envelope + corpo-calculadora). |

> T9 (ferramenta-utilitaria) e schema minimo e esta FORA do escopo do cadastro clinico
> (`03-backend-json.md` §2.9) — nao recebeu arquivo proprio; o envelope aceita `tipo:
> "ferramenta-utilitaria"` com `corpo` aberto.

## Como o discriminador funciona

JSON Schema puro nao cruza ARQUIVOS por discriminador. A amarracao `tipo -> corpo` vive
em duas camadas:

1. **Envelope** valida tudo MENOS a forma interna de `corpo` (que e um `object` aberto).
2. **O validate do backend** (Gui) escolhe o schema de `corpo` pelo `tipo` e valida
   `item.corpo` contra ele. O harness de validacao deste diretorio faz exatamente isso
   (envelope + corpo escolhido por `tipo`).

Dentro de `corpo-droga-dose.schema.json` o discriminador de SUB-tipo (D1..D8) E feito em
schema, via `allOf` + `if/then` sobre `corpo.tipo`: cada sub-tipo casa o `regraCalculo`
correto (ex.: `tipo: "hibrido"` exige `regraCalculo` que satisfaca `regra_hibrido`).

## Validacao

Validado com `ajv` (draft 2020-12) ja presente em `apps/web/node_modules`. Os 9 schemas
COMPILAM; as 2 instancias validam contra envelope + corpo; e 8 testes negativos/invariantes
passam (tipo desconhecido rejeitado, slot required ausente rejeitado, `doseTipo` proibido
na posologia, `posologias[0].alternativa==true` rejeitado, `posologias` vazio rejeitado,
roteamento D4 rejeita `regraCalculo` de outro sub-tipo, `so-aviso` exige `aviso`).

Reproduzir (a partir de `apps/web`, onde o ajv resolve):

```js
const Ajv = require('ajv/dist/2020');
const ajv = new Ajv({ allErrors: true, strict: false });
// addSchema(envelope), addSchema(corpo-*), depois validar item vs envelope e item.corpo vs corpo-<tipo>
```

## Como cada sub-tipo D1-D8 foi modelado (em `corpo-droga-dose.schema.json`)

Os 14 arquetipos de dose (7 ped + 7 preset adulto) colapsam em 8 sub-tipos no discriminador
`corpo.tipo`. O calculo, quando existe, vive em `regraCalculo` (um dos 7 `$defs/regra_*`).

- **D1 `fixo`** — dose literal. SEM `regraCalculo`. O engine exibe `posologias` como texto.
  Nenhum `if/then` extra (cai no caso geral: `posologias` minItems 1). PED `fixo` (Colidis,
  Salbutamol) == ADULTO `simples`.
- **D2 `lookup`** — `regraCalculo` = `$defs/regra_lookup`: `indexar_por` (`idade`|`peso`) +
  `tabela[]` de `{ faixa, dose(string), frequencia }`. `faixa` usa `min_meses/max_meses`,
  `min_anos/max_anos` ou `min_kg/max_kg` (Dipirona). Sem aritmetica. Inclui o campo
  `ramos_substituicao[]` (GAP M2: condicionais que substituem a tabela ANTES dela —
  Dipirona "<3m OU peso<5 -> Contraindicado"; "peso>=53 -> avalie adulto") e `inclusividade`
  (GAP B-06, bordas mistas).
- **D3 `peso-computado`** — `regraCalculo` = `$defs/regra_porPeso`: `saidas[]` onde cada
  saida usa `fator` (=`mg_por_kg / concentracao_mg_ml`) OU `fator_min`+`fator_max` (faixa,
  Glicerina/Prednisona) OU `expr` (DSL). `casas:null` = saida crua (paridade
  Hidroxizina/Escopolamina, F-10/F-13). `teto:{valor,tipo:clamp|texto}` ou `teto_expr` (DSL).
  `clamp` = `min` no engine; `texto` = so copy (trocar = comportamento NOVO, F-16).
- **D4 `hibrido`** — `regraCalculo` = `$defs/regra_hibrido`: `gate_idade` (`regra` booleana
  estruturada `{op:E|OU|NAO, termos:[{unidade:Meses|Anos, campo, cmp, valor}]}` + `se_falso`
  contraindicado, gate DURO) + `ramos[]` (`{por: apresentacao|indicacao|idade|ig, quando,
  saidas[]|texto}`; cada saida computa via `porPeso`/`expr` ou e texto fixo) +
  `ramos_neonatais[]` (NOVO: IG em semanas + dias-de-vida + corte de peso SNC). E o motor
  mais rico e o buraco central da pediatria (dose por duas variaveis). A instancia
  `ibuprofeno.json` exercita as 3 formas de saida: `porPeso` linear com teto-clamp,
  `expr` ternario (`peso>=40 ? 20 : peso*2`) e `expr` com `floor` (`floor(peso/4)`).
- **D5 `renal`** — `regraCalculo` = `$defs/regra_faixaClearance`: `variavel:"clearance"`,
  `cockcroft:bool` (ON -> `TFGe=(140-idade)*peso/(CrS*72)`, *0,85 mulher [REAL]),
  `faixas[]` de `{min,max,posologiaRef}`, `inclusividade`, `diaramo{ativo,prescricaoRef,nota}`.
  So-adulto (GAP: nao existe no pediatrico).
- **D6 `regime`** — `regraCalculo` = `$defs/regra_regime`: `modos.unica.faixas[]` e
  `modos.multiplas.faixas[]`, cada uma com a mesma estrutura de faixa de clearance.
  Gentamicina.
- **D7 `infusao-bic`** — `regraCalculo` = `$defs/regra_infusaoBic`: `inputs[]` (peso + dose
  alvo + vazao) + `getters{}` (mapa nome->expr DSL, avaliado como DAG) +
  `concentracao_maxima_mcg_ml` + `dose_maxima`. Terbutalina (ped) e vasoativas (adulto).
  FLAG M3/B-08 anotada no schema: token orfao `gE2`, getter `vol_SG_complementar` omitido,
  e o passo "montar solucao" das vasoativas adultas ainda nao cabe em `inputs`.
- **D8 `so-aviso`** — SEM `regraCalculo`. `if tipo==so-aviso` exige `aviso` (string) e fixa
  `tem_dose:false`. Metoclopramida.

> `ataque-manutencao` (arquetipo PED reservado, 0 drogas; padrao de prescricao no adulto)
> **NAO e sub-tipo**: e o valor `papel ∈ {ataque, manutencao}` em `posologias[]`. Por isso
> 7+7 arquetipos = 8 sub-tipos, nao 9.
>
> `calculada`/`definirDose` **NAO e sub-tipo de calculo**: e `regraCalculo.tipo:"definirDose"`
> (`$defs/regra_definirDose`) dentro de D3/D5. BLOQUEADO ate fase 2 (gate REAL). E o que a
> pediatria mais precisa (faixa min/max por kg com teto).

## Pendencias de fechamento (do handoff, antes do build)

- `expr`/`teto_expr` em `saida` (M1/B-02): JA formalizados aqui (sem eles o Ibuprofeno-ancora
  nao serializa). DSL fechado especificado em `03-backend-json.md` §4 (sem `eval`; whitelist
  `min/max/floor/ceil/round/abs/ternario`).
- `lookup.ramos_substituicao[]` + `inclusividade` por faixa (M2/B-06): JA incluidos.
- `infusaoBic`: resolver `gE2` e o "montar solucao" das vasoativas (M3/M4) — schema deixa
  `inputs`/`getters` abertos o suficiente, mas a semantica precisa do Gui.
- Comparador de limiar do escore (`>` vs `>=`, C-02): ratificar `>=` com Gustavo. O schema
  so persiste `biggerThen`; o comparador e runtime.
- clamp vs texto em cada teto (F-16): decisao de produto mais critica; o campo `tipo` ja
  distingue, a TROCA e que e mudanca clinica.
