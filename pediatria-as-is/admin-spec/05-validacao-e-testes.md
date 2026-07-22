---
tipo: concept
atualizado: 2026-06-21
fontes:
  - admin-spec/00-HANDOFF-GUI.md
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/03-backend-json.md
  - admin-spec/03-admin-ux.md
  - admin-spec/02-audit-failure-modes.md
  - admin-spec/qa/QA-round-1-relatorio.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
relacionado:
  - admin-spec/03-backend-json.md
  - admin-spec/01-sistema-de-tipos.md
  - MODELO-DOSE-PEDIATRICA.md
status: vigente
peso: core
---

# Validação em duas camadas + golden-set + mapas (admin CalcMed unificado)

> Fecha os itens 4, 7, 8 e os contract-tests do veredito da `qa/QA-round-1-relatorio.md`:
> (1) algoritmo da validação em 2 camadas (estrutural + clínica/contextual); (2) estrutura do
> golden-set de contract-tests por sub-tipo, com os edge-cases reais (F-flags do MODELO-DOSE);
> (3) o mapa `dosing_type → regraCalculo.tipo`; (4) resolução das 3 divergências de redação do R1
> (`required` de `schemaVersion`, `via` vs `viaInline`, 10 vs 13 slots).
>
> Princípio raiz [REAL, Q7]: **avisar no rascunho, bloquear na publicação.** Rascunho incompleto é
> legítimo. O que JÁ roda em produção (camada 1) está [REAL]; a camada 2 (clínica) e o engine
> `evalRegra` são [PROPOSTA] — não há prova de que o app B2C leia o JSON hoje (FLAG-A, dose
> hardcoded no binário Flutter). Decisões humanas (runtime do engine, ratificação de `biggerThen`
> `>` vs `>=`, clamp-vs-texto por droga) NÃO se fecham aqui: são opções + recomendação no log.

---

## 0. Contrato do validador

```
validate(item, items) -> { errors[], warnings[], medicalReviewRequired, clinicalDeltas[] }
```

- `errors[]` bloqueiam **salvar** (subconjunto duro: `nome` vazio) ou **publicar** (o resto).
- `warnings[]` nunca bloqueiam; sinalizam risco para o editor e para a revisão clínica.
- `medicalReviewRequired` é **DERIVADO**, nunca persistido: `revisaoMedicaStatus !== "aprovado"` [REAL].
- `clinicalDeltas[]` [PROPOSTA] = mudanças de COMPORTAMENTO clínico detectadas (ex.: teto virou
  `clamp` onde a fonte AS-IS era `texto` — F-16) que **rebaixam** `revisaoMedicaStatus` para
  `pendente` (mecânica review-dirty já [REAL] no `antibioticosModel.js`).
- `items` (a lista inteira) é argumento porque a unicidade contextual e a colisão de homônimos
  adulto/ped (C-01) são regras **inter-item**, não intra-item.

A função roda **as duas camadas em sequência**, sempre as duas, e funde os arrays. A camada 1
sozinha já existe; a camada 2 é o que falta para publicar conteúdo com `regraCalculo`/`corpo`
estruturado (a auditoria de cobertura provou que C2 hoje é cego ao cálculo).

```
function validate(item, items):
    out = { errors: [], warnings: [], clinicalDeltas: [] }
    layer1_structural(item, items, out)        # JSON Schema + envelope (existe hoje)
    if out.errors has SAVE-blocking: return out  # nome vazio para o ciclo
    layer2_clinical(item, items, out)          # domínio/clínica (proposta)
    out.medicalReviewRequired = item.revisaoMedicaStatus != "aprovado"
    return out
```

> Gate de severidade por contexto: a MESMA regra pode emitir `warning` em rascunho e `error` ao
> publicar. O validador recebe o contexto implícito por `item.statusEditorial`: quando a transição
> alvo é `publicado`, as regras marcadas "warning rascunho / erro publicar" promovem a `error`.

---

## 1. Camada 1 — estrutural / envelope (existe hoje [REAL])

Valida FORMA, não clínica. Tudo aqui rastreia ao `antibioticos.schema.json` x-validacoes [REAL] +
o envelope unificado [PROPOSTA marcado]. Ordem: (1.a) JSON Schema do envelope; (1.b) JSON Schema do
`corpo` discriminado por `tipo`; (1.c) regras contextuais de campo.

### 1.a Envelope (JSON Schema, draft 2020-12)

- valida `item` contra `#/schemas/admin/conteudo/v1` (§1 do `03-backend-json.md`);
- `tipo` ∈ enum T1..T9 → erro se fora;
- `publico` ∈ {adulto, pediatrico, ambos} → erro se fora [REAL];
- `statusEditorial`, `revisaoMedicaStatus` ∈ seus enums → erro se fora;
- `slots` presente com os 10 booleanos required (ver §4 divergência C);
- `observacoes` aceita as 3 formas toleradas (string / array de strings / array de objetos) —
  **não** normalizar agressivamente (quebraria imports) [REAL, inconsistência conhecida do spread].

### 1.b Sub-schema do `corpo` (discriminado por `tipo`) [PROPOSTA]

`tipo` é o discriminador: o backend valida `corpo` contra o sub-schema do molde
(`if tipo=="droga-dose" then corpo matches $defs/dosagem`; idem T2..T9, §2 do `03-backend-json.md`).
Dentro de `droga-dose`, `corpo.dosagem.regraCalculo` valida pelo `oneOf` dos 7 `regra_*` (§3).

> **PENDÊNCIA DE BUILD (B-02, herdada do R1):** o JSON Schema FORMAL dos 7 `regra_*` (com `expr`/
> `teto_expr` declarados em `regra_porPeso`, `ramos_substituicao[]` em `regra_lookup`, `ramos_neonatais[]`
> em `regra_hibrido`) ainda é só exemplo. A camada 1.b não roda completa até ele existir. A gramática
> formal do DSL (B-03, §3.4 do backend) idem. Itens marcados ABERTOS no log.

### 1.c Regras contextuais de campo [REAL, do x-validacoes]

| # | Regra | Rascunho | Publicar | Origem |
|---|---|---|---|---|
| L1 | `nome` vazio | **erro (bloqueia salvar)** | erro | x-val 1 |
| L2 | `publico` fora do enum | erro | erro | x-val 2 |
| L3 | `via` fora de VIA_OPTIONS (em droga-dose) | erro | erro | x-val 3 |
| L4 | `posologias` vazio (droga-dose) | erro | erro | x-val 4 |
| L5 | nenhuma posologia com `dose` preenchida | erro | erro | x-val 5 |
| L6 | dose preenchida sem `unidade` | warning | **erro** | x-val 6 |
| L7 | `droga` da posologia não casa com `nome` | warning | warning | x-val 7 |
| L8 | slot `referencias` ON + `referencias` vazio | warning | **erro** | x-val 8 |
| L9 | unicidade contextual (`nome`+`publico`+`via` em outro id) | warning | warning | x-val 9 |
| L10 | publicar sem `revisaoMedicaStatus == aprovado` | — | **erro** | x-val 10 |
| L11 | gate V2: `publico != adulto` ao publicar | — | **erro** | x-val 11 |
| L12 | gate fase 2: slot `definirDose` ON ao publicar | — | **erro** | x-val 12 |
| L13 | `posologias[0].alternativa != false` | erro | erro | invariante estrutural (prefixItems) |
| L14 | `doseTipo` dentro de posologia | erro | erro | campo morto, normalize remove |

> C-01 (homônimos adulto/ped com eixos opostos): a chave de unicidade L9 inclui `publico` e
> **deve continuar incluindo** (NÃO relaxar para só `nome`). Recomendação aberta (D-D): elevar L9
> de warning para erro-ao-publicar quando os dois homônimos forem ambos `publicado` com
> `regraCalculo.tipo` divergente. Decisão Gui+Gustavo, não fechável aqui.

---

## 2. Camada 2 — domínio / clínica ([PROPOSTA] — buraco da cobertura)

Só corre quando há `regraCalculo` ou `corpo` estruturado. Valida a CONTA, não só o campo-vazio.
Algoritmo: para cada bloco estruturado do item, rodar o conjunto de checagens abaixo; acumular em
`errors`/`warnings`/`clinicalDeltas` conforme a tabela. Toda regra de COBERTURA opera sobre o
**eixo normalizado** (idade → meses internos; clearance → mL/min; ver F-09/F-06/F-07).

### 2.1 Cobertura de faixa (sem buraco / sem sobreposição) — o núcleo do item C-05

Aplica a `lookup` (D2), `faixaClearance` (D5), `regime` (D6), `hibrido.ramos`+`ramos_neonatais` (D4),
`faixas_classificacao` (T2), `regras_estagio` (T4).

**Algoritmo `cobreDominioSemBuraco(faixas, dominio, inclusividade)`:**

```
1. NORMALIZAR cada faixa para um intervalo numérico [lo, hi) no eixo canônico:
   - idade: converter min/max em {Meses|Anos} para MESES (Anos*12). Faixa só-min => hi = +INF.
   - clearance: mL/min, [min, max). max ausente => +INF; min ausente => 0 (ou 1, ver dominio).
   - peso (Dipirona): kg.
2. APLICAR a inclusividade declarada por extremo (min-inclusivo/exclusivo, max-incl/excl).
   Converter tudo para a convenção canônica [lo, hi) (semi-aberto à direita) ANTES de comparar.
3. ORDENAR por lo.
4. BURACO: para i em 1..n-1, se faixa[i].lo > faixa[i-1].hi  => ERRO "buraco em [hi_{i-1}, lo_i)".
   Cobertura do domínio: faixa[0].lo deve tocar dominio.inf; faixa[n-1].hi deve tocar dominio.sup.
5. SOBREPOSIÇÃO: se faixa[i].lo < faixa[i-1].hi => ERRO "sobreposição em [lo_i, hi_{i-1})".
6. EMPATE de borda (faixa[i].lo == faixa[i-1].hi): OK em [lo,hi); seria duplo-disparo se ambos
   inclusivos no mesmo ponto => ERRO se a inclusividade gerar dois ramos no limiar.
```

- Domínios canônicos: idade pediátrica `[0m, +INF)`; clearance `[1, +INF)` (Cockcroft entrega
  `mL/min`, NÃO `mL/min/1,73m²` — FLAG C-06 de rótulo, não de cobertura); peso `[0, +INF)`.
- **Buraco intencional vira contraindicação explícita**, não lacuna: a Dipirona NÃO tem faixa
  `<5 kg` porque há um `ramos_substituicao` "Contraindicado" (ver 2.4); o validador trata o ramo de
  substituição como cobertura do extremo. Sem ele, `<5 kg` é buraco = erro.
- Severidade: buraco/sobreposição = **erro ao publicar** (warning em rascunho).

### 2.2 `porPeso` (D3) — fator, teto, clamp-vs-texto

- `fator` OU (`fator_min` + `fator_max`) presente → erro se nenhum.
- cada `saida.teto` tem `tipo ∈ {clamp, texto}` declarado → erro se ausente.
- se `saida` usa `expr`/`teto_expr` (Ibuprofeno): o DSL parseia (2.6) → erro se não.
- **clamp-vs-texto (F-16) = `clinicalDelta`, não erro:** se a fonte AS-IS marca o teto como `texto`
  e o item agora declara `clamp`, isso é **comportamento clínico NOVO** (passa a limitar a dose).
  O validador EMITE `clinicalDelta` "teto X virou clamp" → rebaixa revisão para `pendente`. Nunca
  bloqueia por si; força reaprovação médica. Idem o inverso (clamp→texto solta o teto).
- **clamp entrada vs saída (B-05) = `warning` estrutural:** distinguir `min(peso, T)` (clamp na
  ENTRADA, depois multiplica) de `min(fator×peso, T)` (clamp na SAÍDA). Quando `fator != 1` os
  resultados divergem e a ordem é load-bearing. O `saida` deve declarar QUAL (campo `clampEm ∈
  {entrada, saida}`); ausente com `fator != 1` e `teto.tipo==clamp` → warning "ordem do clamp
  ambígua, confirmar".

### 2.3 `hibrido` (D4) — gate + ramos + neonatos

- `gate_idade.se_falso` definido → erro se gate presente sem ramo-falso.
- todo ramo de `ramos[]` ou computa (`porPeso` aninhado válido) OU tem `texto` → erro se ramo vazio.
- `ramos[].por` ∈ {apresentacao, indicacao, idade, faixa_gestacional} coerente com os `inputs`/`apresentacoes`.
- `ramos_neonatais[]`: cada ramo tem IG (semanas) + dias-de-vida coerentes e SEM lacuna no eixo
  IG×dias (2.1 aplicado ao plano neonatal) → erro de cobertura se houver buraco entre faixas de IG.
- gate opera sobre idade **normalizada para meses** (F-09/F-06/F-07): o `gate_idade` declara se
  compara ANTES ou DEPOIS da conversão 12m→1a; bordas no limiar 12m/1a resolvidas por
  `inclusividade` explícita por faixa (C-03 Diclofenaco) → warning se a inclusividade no 12m/1a
  não estiver declarada.

### 2.4 `lookup` (D2) — tabela + ramos de substituição

- `cobreDominioSemBuraco(tabela, dominio_por_indexar_por)` (2.1).
- `ramos_substituicao[{condicao(expr), texto}]` (GAP M2 Dipirona): avaliados ANTES da tabela;
  condicao parseia no DSL; cada ramo cobre um extremo (`<3 meses OU peso<5 → contra`;
  `peso>=53 → adulto`). Erro se a condicao não parseia; warning se um extremo do domínio fica sem
  ramo nem faixa.
- `inclusividade` por-extremo-por-faixa (B-06): a fonte mistura `>=`/`<`/`>` na MESMA droga; um
  único campo de inclusividade por regra NÃO captura bordas mistas → o schema precisa de
  inclusividade por extremo de cada faixa; validador exige que cada borda compartilhada entre
  faixas adjacentes seja inclusiva de exatamente um lado (não-zero, não-duplo).

### 2.5 `faixaClearance` (D5) / `regime` (D6)

- as `faixas[]` cobrem `[1, +INF)` sem buraco/sobreposição (2.1).
- `posologiaRef` aponta para uma `posologia` existente no item → erro de ref órfã.
- `diaramo.ativo` → `prescricaoRef` (ou prescrição fixa) presente; FLAG de rótulo C-06 (Cockcroft
  entrega mL/min não normalizado) = warning clínico, não bloqueio.
- D6: cada `modo` (única/múltiplas) valida como um `faixaClearance` independente.

### 2.6 DSL `expr` (T2 formulas, T7 formula, `teto_expr`, getters BIC, T4/T6 condicao)

- parseia sem erro pela gramática FECHADA (§3.4 backend);
- só usa identificadores declarados em `inputs`/`apresentacoes`/getters já calculados → erro se
  token órfão (**caso real M3: Terbutalina `vol_SG_complementar = gE2 - volume_24h`, `gE2` não
  declarado em `inputs` nem nos outros getters** → não parseia como está);
- só funções da whitelist `{min, max, floor, ceil, round, abs, ?:}` → erro se chamada fora;
- PROIBIDO acesso a propriedade / loop / atribuição / side-effect → erro.

### 2.7 `infusaoBic` (D7) — DAG de getters

- nomes de getter casam 1:1 (o exemplo §3.6 do backend usa `volume_24h` referenciando a chave
  `volume_24h_mL` — **erro de nome**, o parser resolve por nome) → erro se referência não-resolvida.
- grafo de dependência entre getters é um DAG (sem ciclo) → erro de ciclo.
- **decisão de implementação aberta (M3/B-08, NÃO fechável aqui):** quem ordena topologicamente o
  DAG — o engine resolve em runtime, ou o JSON já vem ordenado? E o tratamento de ciclo. Opções +
  recomendação no §6.
- vasoativas adulto têm passo "montar solução" (Nº ampolas + mL soro → concentração) que NÃO está
  nos `inputs` deste schema → estender `inputs` antes de cobrir vasoativas (warning de cobertura).

### 2.8 T4 `regras_estagio` / T6 árvore — terminação

- T4: `regras_estagio` avaliadas EM ORDEM; primeira `condicao` verdadeira define o estágio. O
  conjunto deve cobrir o domínio (sem caso sem estágio) e cada `condicao` parseia (2.6).
- T6: todo caminho termina em folha (`conduta_texto` preenchido, `sim`/`nao` nulos); sem ciclo;
  sem `id` órfão (ramo apontando para nó inexistente) → erro.

### 2.9 T2 `validacao` de input + unidades

- `validacao.min < validacao.max`; `msg` presente quando há faixa → erro/warning.
- **lint de unidade** (U-02/U-04): sinalizar incoerências conhecidas — Sulfato de Mg "mg/dL" vs
  "mg/mL" (F-14); clamp-vs-texto sob a mesma palavra "Máx" (U-04). Idealmente um lint por droga →
  warning clínico.

### 2.10 Governança de flags (não bloqueia)

`flags[]` por item carrega os IDs F-01..F-29 que tocam a droga, para a revisão clínica não perder
nenhum. Campo de governança: o validador NÃO bloqueia por flag, mas exige que itens com flags ALTA
de dose-errada (F-02) não publiquem sem `revisaoMedicaStatus == aprovado` posterior à última edição
(já coberto por L10 + review-dirty).

---

## 3. Mapa `dosing_type → regraCalculo.tipo` (item 8 do R1, K-05)

Tabela explícita pedida no R1 — antes só implícita, com nomes divergentes (D1..D8 ≠ os 7 `regra_*`
do `oneOf`). **8 sub-tipos `dosing_type` → 7 valores de `regraCalculo.tipo`** (D1 e D8 não têm
regra; D5/D6 mapeiam para os dois renais; `definirDose` é regra sem `dosing_type` próprio):

| `dosing_type` (sub-tipo D1..D8, `corpo.dosagem.tipo`) | `regraCalculo.tipo` | Inputs lidos | Conta do engine |
|---|---|---|---|
| **D1 fixo** | **(ausente)** | nenhum | exibe `posologias` como texto; sem aritmética |
| **D2 lookup** | **`lookup`** | idade OU peso | seleciona linha de `tabela[]` por faixa; exibe `dose` (string) |
| **D3 peso-computado** | **`porPeso`** | peso (+apresentação) | `saida = round(fator × peso, casas)`; teto clamp/texto |
| **D4 hibrido** | **`hibrido`** | peso + idade (+apr./indic./IG) | gate de idade; ramo computa (`porPeso` aninhado) ou texto |
| **D5 renal** | **`faixaClearance`** | clearance (ou Cockcroft) | faixa de clearance → posologiaRef; ramo diálise |
| **D6 regime** | **`regime`** | modo (única/múltiplas) + clearance | sub-árvore por modo, depois faixaClearance |
| **D7 infusao-bic** | **`infusaoBic`** | peso + dose alvo + vazão | getters em DAG → mL/h, vol 24h, concentração |
| **D8 so-aviso** | **(ausente)** | nenhum | exibe só `corpo.dosagem.aviso`; `tem_dose=false` |
| — (slot `definirDose`, sub-tipo de D3/D5) | **`definirDose`** | dose definida pelo usuário | derivados dentro de `faixaPermitida`; **BLOQUEADO publicar até fase 2** |

Notas de não-1:1 (load-bearing):
- **D1 e D8 não têm `regraCalculo`** (regra OPCIONAL no schema; o admin só liga slots + digita texto,
  como hoje [REAL]). Por isso 8 `dosing_type` → 7 `regra_*`, e dois deles sem regra.
- **`definirDose` é regra SEM `dosing_type` próprio:** é o slot `definirDose` ligado dentro de um
  D3/D5; mapeia `calculada` (preset adulto) → `regraCalculo.tipo: definirDose`. Por isso o `oneOf`
  tem 7 ramos (`porPeso, lookup, hibrido, faixaClearance, regime, infusaoBic, definirDose`) e não 6.
- **`ataque-manutencao` NÃO é sub-tipo nem regra:** é o campo `papel ∈ {ataque, manutencao}` nas
  linhas de posologia (já [REAL] no schema). 7 arquétipos PED + 7 presets adultos = 8 sub-tipos.
- **Colapso de presets adultos → `dosing_type`** (migração, §7 backend): `simples`→`fixo` (ou
  `lookup` se há faixas-texto); `peso`→`peso-computado`; `renal`→`renal`; `renal-dialise`→`renal`
  com `diaramo.ativo`; `regime`→`regime`; `calculada`→`peso-computado`/`renal` + `definirDose`
  (bloqueado); `completo`→não vira sub-tipo (preset de UI, mapeia pelos slots ligados).

---

## 4. Resolução das 3 divergências de redação do R1

As três foram apontadas como ABERTAS (recomendação) em K-06/K-07/K-13 — não eram erros de fato, e
sim listas `required` que divergiam entre handoff / backend / schema-real. Resolução abaixo; onde o
envelope unificado ALTERA o contrato persistido real, está sinalizado (NÃO altero o contrato real
aqui — é decisão de design do Gui).

### A. `required` de `schemaVersion`

- **[REAL]** `antibioticos.schema.json`: **NÃO tem `schemaVersion`**. O versionamento real do FORMATO
  é a chave de storage `cm_admin_antibioticos_v3` (o "v3" no nome da chave), não um campo no item.
- **Divergência:** o handoff (envelope, linha 91) põe `schemaVersion` em `required`; o backend §1
  (linha 78) **NÃO** o põe em `required`, só o define como `{ "const": 1 }` (opcional).
- **Resolução:** `schemaVersion` é campo NOVO do envelope unificado [PROPOSTA], **não existe no
  contrato real**. No item unificado ele **deve ser `required` + `const: 1`** — é o que guarda a
  idempotência da migração one-shot (`migrarV3ParaConteudo` pula item já em v1, §7 backend). Alinhar
  o backend §1 ao handoff: **`schemaVersion` entra no `required`** do envelope unificado.
- **Sinalização de alteração do contrato real:** o item de antibiótico real NÃO carrega
  `schemaVersion` hoje; a migração v3→unificado é exatamente quem o INTRODUZ. Não é regressão: a
  versão de formato real estava codificada no nome da chave; o unificado a promove a campo explícito.

### B. `via` (tela) vs `viaInline` (linha)

- **[REAL]** `antibioticos.schema.json`: `via` é **`required`** no item (enum EV/Oral/EV+Oral/IM);
  `viaInline` é **`required`** DENTRO de cada `posologia` (enum EV/Oral/IM, sem a combinada).
- **Divergência:** o envelope unificado (handoff linhas 89-91 + backend §1 linhas 75-79)
  **OMITE `via` do `required`** do topo, definindo-a como propriedade com descrição "só obrigatória
  em droga-dose".
- **Resolução (semântica correta, sem ambiguidade):**
  - `via` = via da TELA (agregada; `EV+Oral` só existe aqui). É **conditionally required**: no
    envelope unificado, `via` é `required` **quando `tipo == "droga-dose"`**, e OPCIONAL para os
    outros 8 tipos (uma calculadora/escore não tem via). Implementar via `if/then` do JSON Schema
    (`if tipo==droga-dose then required:[via]`), não no `required` incondicional do topo.
  - `viaInline` = via ATÔMICA da linha de posologia; permanece `required` dentro de `posologia`
    (sem mudança). NÃO confundir: `via` agrega, `viaInline` é por linha.
  - A regra L3 (camada 1.c) checa pertencimento ao enum **só quando o tipo exige `via`**.
- **Sinalização de alteração do contrato real:** o schema real torna `via` **incondicionalmente**
  required (porque só modela antibióticos = droga-dose). O unificado RELAXA para conditional — é
  correto (T2..T9 não têm via) e NÃO quebra a migração (todo antibiótico v3 vira `droga-dose`, logo
  continua exigindo `via`).

### C. 10 vs 13 slots

- **[REAL]** `antibioticos.schema.json`: `slots` tem **exatamente 10** booleanos no `required`
  (`peso, definirDose, dialise, regime, clearance, cockcroft, observacoes, referencias,
  copiarCompartilhar, ferramentasSimilares`).
- **Divergência:** "13 slots" aparece em redação solta. Tanto o handoff quanto o backend mantêm
  `slots.required` = **10** (os reais) e ADICIONAM **3 propriedades NOVAS** (`idade`, `apresentacao`,
  `doseMaxima`) como **opcionais** (necessárias para pediatria, `01-sistema-de-tipos.md` §4.3).
- **Resolução:** são **10 required (REAL) + 3 opcionais (NOVO)**. "13" é a contagem total de
  propriedades, não de obrigatórios. Redação canônica daqui em diante: **"10 slots obrigatórios
  (contrato real) + 3 slots opcionais novos para pediatria"**. Os 3 novos NÃO entram no `required`
  (um antibiótico adulto migrado não os tem; só pediatria liga `idade`/`apresentacao`/`doseMaxima`).
- **Defaults [REAL]:** extras (`observacoes/referencias/copiarCompartilhar/ferramentasSimilares`)
  ON; clínicos (`peso/definirDose/dialise/regime/clearance/cockcroft`) OFF. Os 3 novos nascem OFF.
- **Sinalização:** nenhuma alteração do contrato real — os 10 obrigatórios são idênticos; os 3 novos
  são aditivos e opcionais (não quebram itens existentes).

---

## 5. Golden-set de contract-tests por sub-tipo

Estrutura do golden-set: **um arquivo de fixtures por sub-tipo** (`golden/<dosing_type>.json`), cada
fixture = `{ id, item (JSON do molde), inputs, expected }`. O harness roda `evalRegra(regra, inputs)`
e compara com `expected`; e roda `validate(item)` e compara `expected.errors/warnings/clinicalDeltas`.
Estes testes são a **rede de segurança do engine** (peça nova nuclear): provam round-trip
(JSON → engine → mesma saída do AS-IS) e que a camada 2 pega os edge-cases reais. **OBRIGATÓRIOS no
veredito do R1: F-02, F-10, B-05, B-03, C-02** + os abaixo.

### 5.1 D3 `porPeso` — clamp real, casas:null, faixa min-max

| Fixture | Droga (fonte) | Input | `expected` | Edge-case coberto |
|---|---|---|---|---|
| `porPeso/paracetamol-teto35` | Paracetamol gotas (§3 #2) | peso=40 | gotas = **35** (clamp), NÃO 40 | **teto-clamp real 35** (F-01: getter chama-se `weightLimitedTo30` mas o teto é 35; não herdar "30" do nome) |
| `porPeso/paracetamol-abaixo-teto` | Paracetamol | peso=20 | gotas = 20 | clamp não dispara |
| `porPeso/hidroxizina-raw` | Hidroxizina (§3 #18) | peso=10,3 | mL = **3.605** (cru, `casas:null`), NÃO 3,6 | **F-10 rounding raw** — paridade exige NÃO arredondar |
| `porPeso/hidroxizina-clamp` | Hidroxizina | peso=50 | mL = **14** (clamp), mg = **28** (clamp) | duplo teto-clamp |
| `porPeso/glicerina-minmax` | Glicerina (§3 #29) | peso=8 | "80 mL a 160 mL" (`fator_min:10`,`fator_max:20`), **sem teto** | faixa min-max sem clamp |
| `porPeso/acebrofilina-casas-mistas` | Acebrofilina (§3 #21) | peso=12 | mL = `peso*0.2` **cru**; mg = round(peso,0) | **F-13** — casas por-saída na MESMA linha |

### 5.2 D2 `lookup` — string por faixa, ramos de substituição, faixa nunca-renderiza

| Fixture | Droga | Input | `expected` | Edge-case |
|---|---|---|---|---|
| `lookup/desloratadina-meses` | Desloratadina (§8.2) | idade=8 meses | "1 mg = 2 mL ou 16 gotas" | faixa em MESES |
| `lookup/desloratadina-anos` | Desloratadina | idade=3 anos | "1,25 mg = 2,5 mL ou 20 gotas" | faixa em ANOS (idade normalizada a meses internamente) |
| `lookup/dipirona-contra-baixo` | Dipirona (§3 #1) | idade=2 meses OU peso=4 | "Contraindicado Dipirona" (ramo_substituicao ANTES da tabela) | **GAP M2** — ramo de substituição por gate cruzado idade×peso |
| `lookup/dipirona-overflow` | Dipirona | peso=55 | "Avalie dose para adultos" | ramo de overflow (≥53 kg) |
| `lookup/dipirona-borda-mista` | Dipirona | peso=9 | linha `>=5 && <9` NÃO; linha `>=9` SIM | **B-06 inclusividade mista** (`>=`/`<` na mesma droga) |
| `lookup/cobertura-buraco` | (sintético) | — | `validate` → ERRO "buraco em faixa" | camada 2.1 pega lacuna |

### 5.3 D4 `hibrido` — gate duro, `expr`, max condicional, neonato

| Fixture | Droga | Input | `expected` | Edge-case |
|---|---|---|---|---|
| `hibrido/ibuprofeno-gate-falso` | Ibuprofeno (§8.3) | idade=3 meses | "Contraindicado Ibuprofeno" (gate `<6m && <1a`) | **gate DURO substitui dose** |
| `hibrido/ibuprofeno-50-max-cond` | Ibuprofeno 50 mg/mL | peso=50 | min=`min(50,40)`=40; max=**20** (`peso>=40?20:peso*2`) | **F-02 max condicional via `expr`** — não achatar em clamp |
| `hibrido/ibuprofeno-50-abaixo` | Ibuprofeno 50 mg/mL | peso=10 | min=10; max=`10*2`=20 | ramo do ternário oposto |
| `hibrido/ibuprofeno-200-floor` | Ibuprofeno 200 mg/mL | peso=30 | min=`floor(30/4)`=**7** (não 7,5); max=`30/2`=10 (clamp 10) | **`floor` no DSL** + teto |
| `hibrido/amicacina-neonato-ig` | Amicacina (§3 #44) | IG=28 sem, dias=5 | esquema neonatal `<30 sem ≤7d` | **ramos_neonatais IG×dias** (input numérico, não rótulo) |
| `hibrido/neonato-buraco-ig` | (sintético) | — | `validate` → ERRO lacuna IG | cobertura do plano neonatal (2.3) |

### 5.4 D5/D6 `faixaClearance` / `regime`

| Fixture | Droga | Input | `expected` | Edge-case |
|---|---|---|---|---|
| `faixaClearance/cockcroft` | (ATB renal) | idade=70, peso=60, CrS=1,2, sexo=M | TFGe = `(140-70)*60/(1,2*72)` = 48,6 mL/min → faixa 25-50 | fórmula Cockcroft [REAL] |
| `faixaClearance/mulher` | idem | sexo=F | TFGe ×0,85 | fator sexo |
| `faixaClearance/borda-faixa` | idem | clearance=50 | faixa `min:50` (min-inclusivo-max-exclusivo) | **borda de faixa** (inclusividade declarada) |
| `faixaClearance/dialise` | idem | toggle diálise ON | prescrição fixa + "Administre após a diálise" | ramo diálise |
| `regime/gentamicina` | Gentamicina (D6) | modo=única, clearance=85 | sub-árvore única → faixa | seletor de modo |
| `faixaClearance/cobertura` | (sintético) | — | `validate` → ERRO se faixas não cobrem [1,+INF) | camada 2.5 |

### 5.5 D7 `infusaoBic` — getters DAG, token órfão

| Fixture | Droga | Input | `expected` | Edge-case |
|---|---|---|---|---|
| `infusaoBic/terbutalina-getters` | Terbutalina (§8.5) | peso=20, vazão=2 | volume_24h = `2*20*1440/500` = 115,2; limite_inf=`20*0.04`=0,8; limite_sup=`20*0.08`=1,6 | getters encadeados [REAL] |
| `infusaoBic/terbutalina-orfao` | Terbutalina | — | `validate` → ERRO "`gE2` não declarado" | **M3 token órfão** — `vol_SG_complementar = gE2 - volume_24h` não parseia |
| `infusaoBic/empty-peso` | Terbutalina | peso<1 | empty state global | guard de entrada |
| `infusaoBic/ciclo-dag` | (sintético) | — | `validate` → ERRO ciclo no DAG | terminação 2.7 |

### 5.6 D1 `fixo` / D8 `so-aviso` — sem aritmética

| Fixture | Droga | `expected` |
|---|---|---|
| `fixo/colidis` | Colidis (§8.4) | exibe "Dar 5 gotas via oral uma vez ao dia."; `regraCalculo` ausente; sem input |
| `fixo/salbutamol-regimes` | Salbutamol | `regimes[]` (neb crise / spray manutenção); sem faixa etária |
| `so-aviso/metoclopramida` | Metoclopramida (§8.7) | só `aviso`; `tem_dose=false`; nenhum input |

### 5.7 Camada-2 / governança — clinicalDelta, biggerThen, B-05

| Fixture | Cenário | `expected` |
|---|---|---|
| `delta/teto-texto-para-clamp` | item com teto AS-IS `texto` editado para `clamp` | `clinicalDeltas` não-vazio; `revisaoMedicaStatus` rebaixado a `pendente` (**F-16**) |
| `delta/clamp-entrada-vs-saida` | `porPeso` fator≠1, teto clamp, `clampEm` ausente | warning "ordem do clamp ambígua" (**B-05** `min(peso,T)` ≠ `min(fator×peso,T)`) |
| `escore/biggerThen-borda` | T3, `total == biggerThen` | **C-02:** com `>=` ratificado → classifica no limiar; com `>` → não. Teste de borda OBRIGATÓRIO `total==biggerThen` (muda SOFA). **NÃO modelar JSON de escore no limiar antes do Gustavo decidir** |
| `dsl/whitelist-violada` | `expr` com chamada fora da whitelist | `validate` → ERRO de parse (**B-03** gramática fechada) |
| `unicidade/homonimo-eixo-oposto` | mesmo `nome`, `publico` adulto vs ped, `regraCalculo.tipo` divergente, ambos publicados | warning (proposta: erro-ao-publicar, **C-01/D-D** a ratificar) |

> Os fixtures sintéticos (cobertura/buraco/ciclo) testam a CAMADA 2, não o engine. Os fixtures de
> droga real testam round-trip do ENGINE contra o AS-IS. Todo fixture de droga real cita o byte/§
> da fonte no campo `source` para rastreabilidade clínica.

---

## 6. Decisões humanas (opções + recomendação — NÃO fechar aqui)

Estas não se decidem por edição de doc; são runtime/clínica/produto. Formalizadas para o log:

1. **Runtime do engine `evalRegra` (E-01, decorre de FLAG-A).** App B2C é hardcode Flutter (0
   `fromFirestore`); "fórmula como dado" é construção NOVA. Opções: (a) engine portado para Dart
   embarcado no app (lê JSON publicado); (b) engine no backend, app consome resultado pré-calculado.
   **Recomendação:** (a) — dose precisa funcionar offline em emergência; portar o `evalRegra` +
   DSL para Dart com os contract-tests como spec de paridade. Decisão Gui.
2. **`biggerThen` `>` vs `>=` (C-02).** Comparador NÃO isolado no bundle; intenção do admin React =
   `>=` (inclusivo); appwide-07 diz `>`. Muda classificação no limiar (SOFA). **Recomendação:**
   fixar `>=` + teste de borda `total==biggerThen` obrigatório. Ratificar com Gustavo antes de
   modelar qualquer escore no limiar.
3. **clamp vs texto por droga (F-16).** ~14 tetos ped são clamp real; o resto é texto. Clampar um
   teto-texto = comportamento clínico NOVO. **Recomendação:** declarar `tipo ∈ {clamp,texto}` em
   CADA teto, default = o que o AS-IS faz; qualquer troca emite `clinicalDelta` + reaprovação.
   Decisão droga-a-droga do Gustavo.
4. **Ordenação topológica do DAG de getters (M3/B-08).** Engine ordena em runtime, ou JSON vem
   ordenado? **Recomendação:** engine ordena (topo-sort) + detecta ciclo na validação; JSON não
   precisa vir ordenado. Decisão Gui.
5. **C-01 unicidade homônimos (D-D).** Manter `publico` na chave (proposta firme); elevar warning a
   erro-ao-publicar quando homônimos com `regraCalculo.tipo` divergente forem ambos publicados.
   Decisão Gui+Gustavo.
6. **`definirDose` / faixa min/max estruturada.** Bloqueado até fase 2; é o que a pediatria mais
   precisa. Desbloquear = trabalho de fase 2. Decisão de escopo.
7. **Versionamento de conteúdo publicado (snapshot/auditoria, D-K).** `schemaVersion` (formato) ≠
   revisão clínica. Snapshot "qual dose estava no ar em DD/MM" é PROPOSTA; provavelmente fase 2+.
   Decisão Gui.

---

## 7. Resumo

- **Validação em 2 camadas:** camada 1 [REAL] = JSON Schema do envelope + sub-schema do `corpo` por
  `tipo` + 14 regras contextuais de campo (L1-L14), com o gate "avisar no rascunho / bloquear ao
  publicar". Camada 2 [PROPOSTA] = clínica/domínio: cobertura de faixa sem buraco/sobreposição
  (algoritmo `cobreDominioSemBuraco` no eixo normalizado), clamp-vs-texto como `clinicalDelta` que
  força reaprovação, DSL fechado (só whitelist + identificadores declarados), terminação de árvore/
  DAG, lint de unidade. `validate` retorna `{errors, warnings, medicalReviewRequired (derivado),
  clinicalDeltas}`.
- **Golden-set:** um arquivo de fixtures por sub-tipo (`golden/<dosing_type>.json`), cada um prova
  round-trip do engine contra o AS-IS + os edge-cases reais — teto-clamp 35 (Paracetamol F-01),
  rounding raw (Hidroxizina F-10), max condicional via `expr` (Ibuprofeno F-02), `floor` (Ibuprofeno
  200), ramos de substituição (Dipirona M2), inclusividade mista (B-06), ramos_neonatais IG×dias,
  token órfão `gE2` (Terbutalina M3), clamp entrada-vs-saída (B-05), `biggerThen` borda (C-02),
  faixas que nunca renderizam. Obrigatórios: F-02, F-10, B-05, B-03, C-02.
- **Divergências R1 resolvidas:** (A) `schemaVersion` = NOVO do unificado, **entra no `required`** +
  `const:1` (alinhar backend §1 ao handoff); não existe no contrato real (estava no nome da chave).
  (B) `via` = via da tela, **conditionally required** (só `droga-dose`, via `if/then`); `viaInline` =
  via atômica da linha, `required` dentro de posologia. (C) **10 slots obrigatórios (REAL) + 3
  opcionais novos** (`idade`/`apresentacao`/`doseMaxima`); "13" é total de propriedades, não de
  obrigatórios; os 3 novos NÃO entram no `required` e nascem OFF.

### Mapa `dosing_type → regraCalculo.tipo`

| `dosing_type` | `regraCalculo.tipo` |
|---|---|
| D1 fixo | (ausente) |
| D2 lookup | `lookup` |
| D3 peso-computado | `porPeso` |
| D4 hibrido | `hibrido` |
| D5 renal | `faixaClearance` |
| D6 regime | `regime` |
| D7 infusao-bic | `infusaoBic` |
| D8 so-aviso | (ausente) |
| (slot definirDose em D3/D5) | `definirDose` (BLOQUEADO publicar até fase 2) |

8 sub-tipos → 7 `regra_*` no `oneOf` (D1/D8 sem regra; `definirDose` = regra sem `dosing_type`
próprio; `ataque-manutencao` = `papel` na posologia, não sub-tipo).
