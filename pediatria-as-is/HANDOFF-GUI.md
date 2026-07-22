---
tipo: handoff
atualizado: 2026-06-21
fontes:
  - admin-spec/00-HANDOFF-GUI.md
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/03-backend-json.md
  - admin-spec/03-admin-ux.md
  - admin-spec/04-dsl-regracalculo.md
  - admin-spec/05-validacao-e-testes.md
  - admin-spec/schemas/README.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - PLANO-ADMIN-DATA-ARCH.md
relacionado:
  - 00_HUB.md
  - admin-spec/00-HANDOFF-GUI.md
  - admin-spec/schemas/README.md
  - admin-spec/04-dsl-regracalculo.md
  - admin-spec/05-validacao-e-testes.md
status: handoff-aguardando-gui
peso: core
---

# HANDOFF-GUI — porta tecnica unica (backend / modelo de dados)

> Front-door tecnico do pacote `pediatria-as-is/`. Audiencia: **Gui (backend)**. Reune, em um lugar,
> o modelo de dados unificado, o engine de formula-como-dado, a validacao, os JSON Schemas formais e
> o log de decisoes abertas. Nao reescreve as fontes: **resume e linka**. Para a forma maquina, abrir
> os `.json` em `admin-spec/schemas/`; para o detalhe extenso, os arquivos numerados em `admin-spec/`.
>
> Convencao de marcacao (das fontes): `[REAL]` = existe em producao/codigo hoje · `[PROPOSTA]` =
> proposta de fase 2 a confirmar · `FLAG` / `D-x` = decisao humana pendente (Gui/Gustavo/Luis).
> Status do schema persistido real: `x-status: provisorio-aguardando-gui`.
>
> **Em caso de divergencia, a fonte vence este resumo**, nesta ordem: arquivo `.json` de
> `schemas/` > `admin-spec/00-HANDOFF-GUI.md` (handoff detalhado) > este front-door.

---

## 0. Mapa de leitura (por onde o Gui entra)

| Quero... | Abrir |
|---|---|
| O panorama em 5 minutos | este doc, secoes 1-2 |
| O contrato de dados completo, com instancias reais | [`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) |
| Os schemas que VALIDAM (ajv 2020-12) | [`admin-spec/schemas/`](admin-spec/schemas/) (`README.md` + 9 `.json`) |
| A gramatica do DSL de formula | [`admin-spec/04-dsl-regracalculo.md`](admin-spec/04-dsl-regracalculo.md) |
| Como validar antes de publicar | [`admin-spec/05-validacao-e-testes.md`](admin-spec/05-validacao-e-testes.md) |
| De onde sai a dose pediatrica | [`MODELO-DOSE-PEDIATRICA.md`](MODELO-DOSE-PEDIATRICA.md) |
| De onde saem os antibioticos adultos | [`MODELO-ANTIBIOTICOS-ADULTOS.md`](MODELO-ANTIBIOTICOS-ADULTOS.md) |
| As decisoes que travam o backend | secao 7 deste doc |

> O `admin-spec/00-HANDOFF-GUI.md` e o handoff **detalhado** (instancias JSON completas, contrato
> de comportamento tabela a tabela, migracao v3, 14 decisoes). Este front-door e a **camada de cima**:
> orienta, resume e aponta. Quando precisar do bloco de codigo exato de um molde, va para la.

---

## 1. O modelo em uma pagina

O app tem **dois sistemas de calculo paralelos** hoje hardcoded no binario Flutter (pediatrico =
`peso x idade x apresentacao` com teto; adulto = `funcao renal -> faixa -> dose`) mais um terceiro
balde de conteudo nao-droga (calculadoras, escores, protocolos, arvores, conversores, tabelas).

A sintese e **poucos moldes + JSON Schema + um engine dirigido por dado**:

1. **9 tipos de conteudo canonicos (T1..T9)** cobrem 100% do conteudo clinico **da Pediatria**
   (101 rotas, `raw/_coverage-matrix.md`). O lado ADULTO ainda nao foi cruzado contra os moldes e
   tem arquetipos sem molde limpo (ver secao 8). Os **7 arquetipos de calculo pediatricos** + o eixo
   renal/regime adulto **colapsam em UM tipo `droga-dose` com 8 sub-tipos** (`dosing_type` D1..D8).
2. **Um envelope JSON comum** a todos os moldes + um sub-objeto `corpo` discriminado pelo campo `tipo`.
   O envelope ja existe `[REAL]` (deriva de `antibioticos.schema.json`); o discriminador `tipo` e o
   `corpo` por molde sao `[PROPOSTA]`.
3. **Formula como DADO, nao codigo** (`regraCalculo`): um avaliador generico (`evalRegra`) interpreta
   um conjunto FECHADO de operadores (DSL whitelist, sem `eval`). Mudar dose = editar JSON + revisar +
   publicar, sem rebuild.
4. **Verdade de hoje:** o admin atual e um editor de texto de posologia + toggles de bloco, nao um
   motor de calculo. Cobre de verdade so T1-D1 (dose como string) e T3 (escores, motor irmao). 6 dos 8
   sub-tipos de dose e 7 dos 9 tipos **nao tem editor** ainda.
5. **O que e forte e reutilizavel** e o WORKFLOW editorial (status + revisao medica + review-dirty +
   chokepoint unico de publicacao), agnostico de tipo `[REAL]`. O buraco e o **editor de conteudo** e a
   **validacao de dominio** de cada molde.
6. **O buraco central da pediatria** e o `regraCalculo` estruturado (dose por duas variaveis combinadas
   peso x idade x apresentacao com teto clamp/texto). Slots booleanos independentes nao modelam isso.

**Pre-requisito que destrava (ou nao) toda a fase 2 — D-A, RESOLVIDO contra bundle (2026-06-21):**
o app B2C de producao **NAO le o JSON do admin**. A dose esta **hardcoded no binario Flutter** (107
controllers de equacao + catalogo de drogas literal; `fromFirestore`/`snapshots(`/`withConverter` = 0
ocorrencias). O pipeline admin->app **nao existe** — "data-driven" e construcao NOVA (engine `evalRegra`
portavel para Dart no app), nao integracao. Enquanto a ponte de leitura nao existir, o admin e gerador
de spec. Detalhe em [`admin-spec/qa/round1-ground-truth.md`](admin-spec/qa/round1-ground-truth.md) (D-A).

**Escala:** ~170 itens cadastraveis (excl. utilitarios), ~110 sao T1 (64 ped + 38 ATB adulto +
~8 vasoativas). R1 realista = subconjunto adulto simples (~24 dos 38 ATB); o eixo pediatrico inteiro e
T2/T4/T5/T6/T7/T8 sao fase 2+. (24/38 e orientativo, nao reconciliado com o mapa por preset — ver
[`admin-spec/qa/QA-round-1-relatorio.md`](admin-spec/qa/QA-round-1-relatorio.md) K-12.)

---

## 2. Os 9 tipos canonicos (T1..T9)

| Tipo | `tipo` (enum) | `corpo` | Engine faz | Schema formal |
|---|---|---|---|---|
| **T1** | `droga-dose` | `corpo.dosagem` | depende do sub-tipo D1..D8 (ver secao 3) | `corpo-droga-dose.schema.json` |
| **T2** | `calculadora-formula` | `corpo.calculo` | avalia `formula.expr` (DSL) + classifica em `faixas_classificacao` | `corpo-calculadora.schema.json` |
| **T3** | `escore-por-pontos` | `corpo.escore` | `total = Σ pontos` -> maior `biggerThen` <= total | `corpo-escore.schema.json` `[REAL]` |
| **T4** | `escore-por-criterios` | `corpo.estadiamento` | 1a `regra_estagio` verdadeira (em ordem; NAO soma) | `corpo-escore-criterios.schema.json` |
| **T5** | `protocolo-multi-step` | `corpo.protocolo` | renderiza abas; cada aba delega a outro molde (recursivo raso) | `corpo-protocolo.schema.json` |
| **T6** | `conduta-arvore-decisao` | `corpo.arvore` | navega `sim`/`nao` ate folha | `corpo-conduta.schema.json` |
| **T7** | `conversor` | `corpo.conversor` | `fator_b` do dropdown entra na formula | `corpo-conversor.schema.json` |
| **T8** | `tabela-referencia` | `corpo.tabela` | seleciona linha por `indexar_por` (sem calculo) | `corpo-tabela-referencia.schema.json` |
| **T9** | `ferramenta-utilitaria` | `corpo` aberto | CRUD offline (Solucoes Personalizadas, Passometro) | envelope so (fora do cadastro clinico) |

Contrato de comportamento tabela-a-tabela (inputs lidos, o que renderiza) em
[`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) secao 3. Esquema de cada `corpo` em
[`admin-spec/03-backend-json.md`](admin-spec/03-backend-json.md) secoes 2.4-2.9.

### 2.1 Envelope comum (todos os moldes) `[REAL envelope + PROPOSTA discriminador]`

Campos required do envelope: `id, tipo, nome, classe, publico, statusEditorial, revisaoMedicaStatus,
slots, observacoes, referencias, tagsRisco, ferramentasSimilares, schemaVersion`. Opcionais relevantes:
`via, contraindicacoes, ordemBlocos, corpo`.

- `tipo` e o **discriminador** (escolhe contra qual sub-schema validar `corpo`).
- `slots` continua sendo "a verdade do que a tela exibe" `[REAL]`; os 3 slots NOVOS para pediatria sao
  `idade`, `apresentacao`, `doseMaxima`. Defaults: extras ON, clinicos OFF `[REAL defaultSlots]`.
- `observacoes` mantem **3 formas toleradas** (string, array de string, array de objeto) — normalizar
  agressivamente quebra imports (B-01).
- `statusEditorial ∈ {rascunho, em-revisao, publicado, arquivado}`; `revisaoMedicaStatus ∈ {pendente,
  aprovado, reprovado}`. `medicalReviewRequired` e DERIVADO, nunca persistido.

Schema executavel: [`admin-spec/schemas/envelope.schema.json`](admin-spec/schemas/envelope.schema.json).
Bloco de leitura comentado em [`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) secao 2.1.

---

## 3. T1 `droga-dose` — os 8 sub-tipos de dose (o coracao)

Os 14 arquetipos de dose (7 pediatricos do `MODELO-DOSE` + 7 `presetTemplate` adultos do admin)
**colapsam em 8 sub-tipos** no discriminador `corpo.tipo`. O calculo, quando existe, vive em
`regraCalculo` (um dos 7 `$defs/regra_*`).

| Sub | `corpo.tipo` | `regraCalculo` | O que faz | Droga-ancora |
|---|---|---|---|---|
| **D1** | `fixo` | — | dose literal, exibida como texto | Colidis, Salbutamol / ATB `simples` |
| **D2** | `lookup` | `regra_lookup` | seleciona linha de `tabela[]` por faixa de idade OU peso; sem aritmetica | Dipirona |
| **D3** | `peso-computado` | `regra_porPeso` | `saida = round(fator x peso, casas)`; teto clamp/texto | Paracetamol |
| **D4** | `hibrido` | `regra_hibrido` | `gate_idade` + `ramos[]` por apresentacao/indicacao/idade + `ramos_neonatais[]` | **Ibuprofeno** |
| **D5** | `renal` | `regra_faixaClearance` | faixa de clearance -> posologiaRef; Cockcroft + diaramo | Aciclovir (so adulto) |
| **D6** | `regime` | `regra_regime` | `modos.unica` / `modos.multiplas`, cada um com faixas | Gentamicina |
| **D7** | `infusao-bic` | `regra_infusaoBic` | `getters{}` (DAG de `expr`) sobre peso + dose alvo + vazao | Terbutalina / vasoativas |
| **D8** | `so-aviso` | — | sem dose (`tem_dose:false`), so o aviso clinico | Metoclopramida |

**Cuidados de modelagem (das fontes, load-bearing):**
- `ataque-manutencao` **NAO e sub-tipo** — e o valor `papel ∈ {ataque, manutencao}` em `posologias[]`.
  Por isso 7+7 arquetipos = **8 sub-tipos, nao 9/14**. (Os "7 presetTemplate" sao categorias de UI do
  admin, nao arquetipos de calculo: `completo` e `calculada` o proprio doc admite nao serem arquetipos —
  nao somar 7+7=14. Ver `admin-spec/qa/QA-round-1-relatorio.md` K-02.)
- `calculada`/`definirDose` **NAO e sub-tipo de calculo** — e `regraCalculo.tipo: "definirDose"` dentro
  de D3/D5. **BLOQUEADO ate fase 2** (gate `[REAL]`). E o que a pediatria mais precisa (faixa min/max
  por kg com teto). Ver D-F.
- `posologia` required `[REAL]`: `id, papel, cenario, droga, dose, unidade, diluente, viaInline, tempo,
  intervalo, esquema, alternativa`. Invariantes: `posologias[0].alternativa == false`; `doseTipo`
  PROIBIDO dentro de posologia (campo morto, normalize remove — D-01).
- `doseMaxima.tipo ∈ {clamp, texto}` por teto: `clamp` aplica `min` no engine; `texto` so exibe.
  Trocar um do outro = **comportamento clinico NOVO** (F-16) -> rebaixa revisao. Ver D-E.

Detalhe sub-a-sub (com a forma exata de cada `regra_*`) em
[`admin-spec/schemas/README.md`](admin-spec/schemas/README.md) ("Como cada sub-tipo D1-D8 foi modelado")
e instancia real **Ibuprofeno D4** (3 apresentacoes, `expr` ternario + `floor`) em
[`admin-spec/schemas/instancias-exemplo/ibuprofeno.json`](admin-spec/schemas/instancias-exemplo/ibuprofeno.json).

---

## 4. Engine de formula como dado — DSL `regraCalculo`

A dose e DADO, nunca expressao livre. Uma planilha de expressoes arbitrarias editavel por
nao-engenheiro = risco de dose por ordem de grandeza em app clinico. O DSL e **fechado e
whitelisted**: o medico-admin escolhe o sub-tipo e preenche fatores/tetos/faixas; o pouco de expressao
que existe (`expr`, `teto_expr`, getters de BIC, `condicao` de T4/T6) passa por um parser proprio
**sem `eval`**.

Gramatica fechada (resumo — EBNF completa em
[`admin-spec/04-dsl-regracalculo.md`](admin-spec/04-dsl-regracalculo.md)):
- operandos: inputs declarados, literais, getters em DAG;
- aritmetica `+ - * /` + parenteses; comparacao `> >= < <= == !=`; booleanos `&& || !`
  (ou `E`/`OU`/`NAO` na forma de gate estruturado);
- whitelist de 7 funcoes: `min max floor ceil round abs` + ternario `cond ? a : b`;
- **proibido:** acesso a propriedade, funcao fora da whitelist, loop, atribuicao, side-effect;
- guards universais: virgula->ponto, `NaN`/`±Inf`->0, divisao por zero->0, input required ausente ->
  empty state global.

Onde o DSL aparece: `regra_porPeso.saida.expr`/`teto_expr` (D3), `regra_hibrido.ramo.saida.expr` (D4),
`regra_infusaoBic.getters` (D7), `regra_definirDose.derivados.expr`, `T2 formulas.expr`,
`T7 conversor.formula`, condicoes de T4/T6. Decisao **D-J** (ratificar DSL whitelist) na secao 7.

---

## 5. Validacao em 2 camadas

Contrato do validador: `validate(item, items) -> { errors[], warnings[], medicalReviewRequired,
clinicalDeltas[] }`. Principio raiz `[REAL, Q7]`: **avisar no rascunho, bloquear na publicacao.**

- **Camada 1 — estrutural/envelope `[REAL]`:** ja roda em producao (`validateAntibiotico`). Campo vazio,
  enum, unidade, invariantes. **Reusar agnostico de tipo — NAO reescrever.**
- **Camada 2 — dominio/calculo `[PROPOSTA]`:** o que falta. Cobertura de faixa (sem buraco/sobreposicao
  + inclusividade explicita), parse do DSL, exaustividade de ramos/arvore, coerencia de teto, gate de
  idade com `se_falso`, arvore sem no orfao. **E onde mora o risco clinico** (uma faixa de clearance com
  buraco passa hoje). Ver D-I.
- `clinicalDeltas[]` rebaixa `revisaoMedicaStatus` para `pendente` quando detecta mudanca de
  comportamento (ex.: teto virou `clamp` onde a fonte era `texto`, F-16) — mecanica review-dirty ja
  `[REAL]`.

Algoritmo completo + golden-set de contract-tests por sub-tipo (com os edge-cases reais F-flags) em
[`admin-spec/05-validacao-e-testes.md`](admin-spec/05-validacao-e-testes.md).

---

## 6. JSON Schemas formais (executaveis) e migracao

**Schemas (`admin-spec/schemas/`):** 9 arquivos draft 2020-12, validados com `ajv` —
`envelope.schema.json` + 8 `corpo-*.schema.json` (T1..T8; T9 fica com `corpo` aberto). O coracao e
`corpo-droga-dose.schema.json` (sub-tipos D1..D8 via `allOf`/`if-then` sobre `corpo.tipo`, mais os 7
`$defs/regra_*` do `oneOf`). Provados no QA round 2: 9 schemas compilam, as 2 instancias reais
(`ibuprofeno.json` D4, `imc.json` T2) validam e fazem round-trip da dose AS-IS, e 8 testes negativos
passam. Ver [`admin-spec/schemas/README.md`](admin-spec/schemas/README.md) +
[`admin-spec/qa/QA-round-2-relatorio.md`](admin-spec/qa/QA-round-2-relatorio.md).

> Como o discriminador funciona (JSON Schema puro nao cruza arquivos): o envelope valida tudo MENOS a
> forma interna de `corpo`; o validate do backend escolhe o schema de `corpo` pelo `tipo` e valida
> `item.corpo` contra ele.

**Migracao `migrarV3ParaConteudo` (antibioticos v3 -> unificado) `[PROPOSTA]`** — regras nucleares
(passo a passo em [`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) secao 4):
1. Todo antibiotico v3 vira `tipo: "droga-dose"`; copia envelope 1:1; adiciona `schemaVersion: 1`.
2. `presetTemplate -> corpo.dosagem.tipo` por mapa de colapso (`simples->fixo`, `peso->peso-computado`,
   `renal->renal`, `renal-dialise->renal`+diaramo, `regime->regime`, `calculada->definirDose` bloqueado,
   `completo->` pelos slots ligados).
3. `posologias` copiadas 1:1 (texto; invariante `[0].alternativa == false`).
4. **`regraCalculo` NAO e fabricada na migracao** — nasce `null`/ausente; o admin preenche droga a droga
   sob revisao clinica na fase 2. Inventar formula automaticamente seria inseguro.
5. Pediatria (64 drogas) entra como cadastro NOVO (nao existe em v3), cada uma `rascunho` + `pendente` +
   `publico: pediatrico`.
6. **Idempotente:** guardada por `schemaVersion`; chave v3 preservada como backup; conteudo nunca nasce
   publicado. Regra raiz `[REAL]`: **nunca apagar dado em migracao.**

---

## 7. LOG DE DECISOES ABERTAS (Gui + Gustavo)

Espelho do log canonico do handoff detalhado
([`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) secao 5). Em caso de divergencia, **o
detalhado vence**. Mantido aqui porque e a entrega central desta porta.

| # | Decisao | Veredito / proposta | Dono | Bloqueia |
|---|---|---|---|---|
| **D-A** | App B2C le o JSON do admin? | **RESOLVIDO (2026-06-21): NAO le — dose 100% hardcoded no binario Flutter** (107 controllers; 0 `fromFirestore`). O pipeline admin->app precisa ser construido do zero. Pre-requisito de toda a fase 2. | Gui | "formula como dado" inteiro |
| **D-B** | F-09 / idade Meses vs Anos | **RESOLVIDO (2026-06-21): NAO ha inversao.** Dropdown codifica `Meses=1, Anos=2` uniforme no binario; a "inversao func-01 vs func-02" era **ruido de extracao**. Nao desabilitar o campo de idade. JSON SEMPRE carrega unidade explicita (`{unidade:"Meses"\|"Anos"}`) por robustez. (rebaixado de P0) | Gui | (resolvido) |
| **D-C** | `biggerThen` `>` vs `>=` (T3) | Documentado das DUAS formas; comparador-runtime NAO isolado no bundle (INCONCLUSIVO). Proposta a ratificar: fixar `>=` (maior-limiar-<=-total) + teste de borda `total == biggerThen`. | Gustavo + Gui | JSON de escore com limiar |
| **D-D** | C-01 / chave de unicidade | ~13 ATB existem ped E adulto com a mesma marca, eixos OPOSTOS. Proposta: manter `publico` na chave; considerar erro-ao-publicar para homonimos com `regraCalculo.tipo` divergente. | Gui + Gustavo | unificacao de conteudo |
| **D-E** | clamp vs texto em cada teto | ~14 tetos clampam de verdade; o resto e so copy, sob a mesma palavra "Max" (U-04). Clampar um teto-texto = comportamento clinico NOVO (F-16). Proposta: `doseMaxima.tipo`; validate sinaliza a troca como mudanca clinica. **Decisao de produto mais critica do eixo pediatrico.** | Gustavo (clinico) | publicacao de dose com teto |
| **D-F** | `definirDose` / dose calculada (faixa min/max) | Gate interino `[REAL]` bloqueia publicacao ate a faixa min/max estruturada existir (fase 2). E o que a pediatria mais precisa. | Gui | publicacao de `calculada`/ped avancada |
| **D-G** | Pediatrico/ambos fora do R1 | `validateAntibiotico` L327: publico ped/ambos NAO publica na V2 (adulto-only). Todo o eixo ped fica em rascunho mesmo cadastrado. Confirmar escopo R1. | Luis/produto | release pediatria |
| **D-H** | Typos load-bearing | `aditionalTexts`, `biggerThen`, `Cockroft` (sic), `coroporal`, `gostas` sao CONTRATO persistido. **Nao corrigir sem camada de compat/alias** (quebra leitura legada). | Gui (migracao) | round-trip backend |
| **D-I** | Validacao de dominio (C2) cega ao calculo | Hoje valida so campo-vazio/enum/unidade. Proposta: camada 2 (cobertura de faixa, parse do DSL, exaustividade, coerencia de teto). **Onde mora o risco clinico.** | Gui | seguranca clinica de qualquer calculo |
| **D-J** | DSL fechado vs expressao livre | Proposta: ratificar o DSL whitelist (sem `eval`, conjunto fechado) por seguranca clinica + portabilidade Flutter. | Gui | engine de formula |
| **D-K** | Versionamento de conteudo publicado (snapshot) | `schemaVersion` (formato) != revisao clinica. Snapshot do item publicado ("qual dose estava no ar em DD/MM") e PROPOSTA. Confirmar se entra no R1 (provavel fase 2+). | Gui | auditoria clinica |
| **D-L** | C-06 / rotulo Cockcroft | Saida rotulada `mL/min/1,73m²` mas a formula entrega `mL/min` nao normalizado, em ~16 copias. Proposta: extrair `useCockcroft` unico + decidir rotulo. | Gui + Gustavo | calc renal adulto |
| **D-M** | Imagens como dado | PPS, Sinais Vitais, Hiperglicemia (tabela de correcao) vivem como JPG (arte fechada). Sobem como ASSET, nao dado estruturado. | Luis/produto | T4/T8 dessas telas |
| **D-N** | F-06/F-07 — leitura inconsistente de `c.b` POR FAIXA (separado de F-09) | ABERTO. Dentro da MESMA droga, faixas podem disparar so com `unit==Meses` e nunca renderizar em Anos (Dimenidrato/Ondansetrona). Regra de modelagem: TODA faixa etaria opera sobre idade JA normalizada para meses; o JSON declara se opera ANTES ou DEPOIS da conversao. | Gui + Gustavo | gates de borda 12m/1a (D2/D4) |
| **E-01** | Runtime do engine `evalRegra` | ABERTO (decorre de D-A). Em qual runtime o engine vive: Flutter app (Dart) vs backend? Decisao arquitetural #1. | Gui | onde a ponte admin->app e construida |

---

## 8. Lacunas de cobertura app-wide ADULTO (a fechar antes de reafirmar "100%")

"9 tipos cobrem 100%" esta comprovado SO para a Pediatria (101 rotas). O lado adulto (`raw/appwide-01..04`)
nunca foi cruzado contra os moldes. Estes arquetipos clinicos NAO encaixam limpo em nenhum T/D atual —
sao **recomendacoes de escopo**, nao erros de fato:

- **Calculadora-com-prescricao** (deficit/correcao -> string de receita): Sodio (Adrogue-Madias),
  Bicarbonato. Novo tipo ou sub-tipo de T2 que distingue saida-numero de saida-prescricao.
- **Conduta por FAIXA DE VALOR** (1 input numerico -> blocos literais): Potassio, Magnesio, Hipocalcemia.
  Estender T6 (hoje so sim/nao) para ramificacao por faixa numerica, ou tipo proprio.
- **Ferramenta-interpretadora** (motor de regras -> classificacao multi-resultado): Disturbios
  Acido-Base (Winter, delta-delta — maior risco clinico). Tipo `interpretador`, ou hardcode-permanente
  justificado.
- **"Monte sua solucao"** (ampolas + soro -> concentracao -> vazao): vasoativas adultas. Estender D7.
- **Guard inter-input** que esconde TODA a saida por condicao entre inputs: LDL com TG>=400.
- **PPS** classificado por cascata de selects dependentes (nao `regras_estagio` em ordem de T4).

Tabela completa com recomendacao por gap em
[`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) secao 7 (achados do QA round 1 —
completeness). Antes de reafirmar "100%", rodar a matriz de cobertura adulto.

---

## 9. Recomendacoes de implementacao (ordem)

1. **Engine data-driven primeiro, conteudo depois.** `evalRegra(regra, inputs) -> resultado` (DSL
   fechado) e a peca nova nuclear. A ponte de leitura precisa ser CONSTRUIDA no app Flutter (`evalRegra`
   portavel para Dart) — nao e integracao (D-A). Decisao #1 em aberto: runtime do engine (E-01).
2. **Contract tests por molde e por sub-tipo de dose.** Casos `(regra, inputs) -> resultado esperado`
   derivados das drogas reais auditadas. Bordas obrigatorias: assimetria de teto (F-02, `max = peso>=40 ?
   20 : peso*2` prova o ternario), cru vs `round(.,0)` (F-10/F-13), ordem do clamp (B-05), divergencia
   runtime React vs Flutter da mesma `expr` (B-03), borda `total == biggerThen` (C-02). F-09 ja nao e
   borda critica (resolvido); manter teste 12m/1a so para F-06/F-07 (D-N).
3. **Validacao em 2 camadas** (secao 5): camada 1 ja existe `[REAL]`, reusar; camada 2 e nova. Chokepoint
   unico de publicacao + review-dirty ja sao fortes `[REAL]` — NAO reescrever.
4. **Faseamento:** R1 = adulto simples (~24/38 ATB) com `regraCalculo` estruturado + T3 (ja entregue);
   fase 2 = pediatria + D4 hibrido + `definirDose` + slots ped; fase 2+ = nao-droga estruturado
   (T2/T4/T5/T6/T7/T8). Detalhe em [`faseamento-release.md`](faseamento-release.md).
5. **Migracao segura e idempotente** (secao 6): `regraCalculo` nunca fabricada automaticamente.
6. **Modelar pelo superset do `fromJson`** (D-05): `toJson` emite menos campos que `fromJson` le
   (`route`/`icon`) — modelar pelo superset ou perder campos no round-trip.

---

## Detalhe & Fontes (ZERO PERDA)

Este front-door **resume e linka**; nenhuma informacao foi removida das fontes. Para o detalhe completo:

**Handoff detalhado e sistema de tipos (admin-spec/):**
- [`admin-spec/00-HANDOFF-GUI.md`](admin-spec/00-HANDOFF-GUI.md) — handoff backend-ready completo:
  instancias JSON, contrato de comportamento tabela-a-tabela, migracao v3, 14 decisoes. **Fonte canonica
  deste front-door.**
- [`admin-spec/01-sistema-de-tipos.md`](admin-spec/01-sistema-de-tipos.md) — derivacao dos 9 tipos + 8
  sub-tipos, mapa de colapso dos arquetipos.
- [`admin-spec/03-admin-ux.md`](admin-spec/03-admin-ux.md) — UX do construtor (form por molde, preview,
  gate de revisao, state machine).
- [`admin-spec/03-backend-json.md`](admin-spec/03-backend-json.md) — engine + schemas de cada `corpo`
  (secoes 2.4-2.9) + migracao.
- [`admin-spec/04-dsl-regracalculo.md`](admin-spec/04-dsl-regracalculo.md) — gramatica EBNF do DSL +
  whitelist + semantica por sub-tipo D1..D8.
- [`admin-spec/05-validacao-e-testes.md`](admin-spec/05-validacao-e-testes.md) — algoritmo da validacao
  2 camadas + golden-set de contract-tests.

**Schemas formais executaveis (admin-spec/schemas/):**
- [`admin-spec/schemas/README.md`](admin-spec/schemas/README.md) — indice dos 9 schemas + como o
  discriminador funciona + modelagem D1-D8.
- [`admin-spec/schemas/`](admin-spec/schemas/) — `envelope.schema.json` + 8 `corpo-*.schema.json` +
  `instancias-exemplo/` (`ibuprofeno.json` D4, `imc.json` T2).

**Modelos de dose (insumo clinico):**
- [`MODELO-DOSE-PEDIATRICA.md`](MODELO-DOSE-PEDIATRICA.md) — 64 drogas pediatricas -> 7 arquetipos,
  formulas verbatim, F-flags. Logica verbatim em `raw/func-01..08`.
- [`MODELO-ANTIBIOTICOS-ADULTOS.md`](MODELO-ANTIBIOTICOS-ADULTOS.md) — 38 antibioticos adultos + 7
  presetTemplates do admin + decisoes do Gustavo. Bruto em `raw/appwide-05/06`.
- [`PLANO-ADMIN-DATA-ARCH.md`](PLANO-ADMIN-DATA-ARCH.md) — blueprint (molde + JSON schema + engine).
  Metodo ja EXECUTADO (resultado neste handoff + `admin-spec/qa/`).

**QA / auditorias (rastreabilidade):**
- [`admin-spec/qa/`](admin-spec/qa/) — round 1 (completeness/consistency/correctness/ground-truth/
  implementability) + relatorios R1/R2 + `CONSOLIDACAO-plano.md`.
- [`admin-spec/02-audit-cobertura.md`](admin-spec/02-audit-cobertura.md),
  [`admin-spec/02-audit-consistencia.md`](admin-spec/02-audit-consistencia.md),
  [`admin-spec/02-audit-failure-modes.md`](admin-spec/02-audit-failure-modes.md),
  [`admin-spec/02-audit-meses-anos.md`](admin-spec/02-audit-meses-anos.md),
  [`admin-spec/02-audit-schema-gap.md`](admin-spec/02-audit-schema-gap.md) — as 5 lentes de auditoria.

> Nota de reconciliacao (drift conhecido entre docs-filho): a contagem de arquetipos pediatricos e
> **7** (= 8 sub-tipos com o colapso `ataque-manutencao`->`papel`); numeros como 18/17/16 ou 20/19/21
> dentro do `MODELO-DOSE` sao contagens por cluster, nao a canonica. F-09 esta **RESOLVIDO** (ruido de
> extracao, D-B) — onde o `MODELO-DOSE` ainda diz "INVERTIDA/precisa ser resolvida antes de modelar"
> (secao 1/8), prevalece o veredito D-B deste handoff.
