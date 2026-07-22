---
tipo: audit
atualizado: 2026-06-21
fontes:
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - apps/web/docs/admin/prd-admin-antibioticos.md
  - admin-spec/01-sistema-de-tipos.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
relacionado:
  - admin-spec/01-sistema-de-tipos.md
  - PLANO-ADMIN-DATA-ARCH.md
status: vigente
peso: core
---

# Audit — gap do schema atual vs sistema de tipos canônico

> Lente: schema-gap. Confronta o `antibioticos.schema.json` REAL (o único contrato persistido
> que o admin tem hoje) contra os 9 moldes canônicos (`01-sistema-de-tipos.md`). Para cada molde,
> o delta = o que o schema atual NÃO consegue representar como dado. Cético e exaustivo: separo o
> que o schema *modela* do que ele apenas *tolera por `additionalProperties` livre* (campo cru que
> sobrevive ao spread mas não tem semântica, validação nem UI).

## 0. O que o schema atual REALMENTE é (linha de base)

O `antibioticos.schema.json` (`$id.../antibioticos/v1`, `x-status: provisorio-aguardando-gui`)
modela **um item de antibiótico adulto na forma persistida**, não um item clínico genérico. Suas
capacidades reais:

- **Envelope editorial:** `id`, `nome`, `classe` (texto livre), `publico` (enum adulto/pediatrico/ambos),
  `via` (enum EV/Oral/EV+Oral/IM), `statusEditorial`, `revisaoMedicaStatus`, `referencias` (string),
  `tagsRisco[]`, `ferramentasSimilares[]`, `observacoes` (array `{id,nivel,texto}`).
- **`presetTemplate`** (enum dos 7 arquétipos adulto) — atalho de configuração, NÃO dado de cálculo.
- **`slots`** — 10 booleanos fixos (`peso`, `definirDose`, `dialise`, `regime`, `clearance`,
  `cockcroft`, `observacoes`, `referencias`, `copiarCompartilhar`, `ferramentasSimilares`).
- **`posologias[]`** — linhas de **texto livre**: `papel` (enum), `cenario`, `droga`, `dose` (string),
  `unidade` (string), `diluente`, `viaInline`, `tempo`, `intervalo`, `esquema`, `alternativa`.

**Tese da auditoria (confirmada no código):** o schema é "um painel de interruptores, não uma
planilha de fórmulas" (brief 2026-06-20; `MODELO-ANTIBIOTICOS-ADULTOS.md §3`). Toda dose é
**string digitada por humano**; a conta clínica continua hardcoded no binário Flutter, fora do admin.
O schema modela QUAIS BLOCOS a tela exibe (`slots`) e QUE TEXTO cada bloco mostra (`posologias`,
`observacoes`), mas **não modela NENHUMA aritmética, faixa, fator, fórmula, critério ou árvore**.

> Por isso o gap dominante, repetido em quase todos os moldes abaixo, é o mesmo:
> **não existe um campo `regraCalculo` estruturado.** O `slot.definirDose` é o único aceno a "cálculo",
> e ele é (a) booleano, (b) explicitamente bloqueado de publicar até a fase 2 (`validate`), e
> (c) não carrega NENHUM dado de faixa min/max. Cobre só T1 adulto; tudo mais é gap.

---

## 1. Delta por molde

### T1 — droga-dose (o molde central; 8 sub-tipos D1–D8)

Único molde que o schema cobre PARCIALMENTE. Cobre D1/D2 simples e a *fachada* (slots) de D5/D6.
Não cobre o cálculo de nenhum sub-tipo. Delta por sub-tipo:

| Sub-tipo | Schema atual cobre? | O que FALTA (delta) |
|---|---|---|
| **D1 fixo** | Sim (texto) | `dose_fixa` é só `posologias[].dose` em texto. Salbutamol (multi-`regimes[]`) não tem campo: vira N posologias soltas sem agrupamento de regime. |
| **D2 lookup** | Não (estrutural) | **Faltam faixas etárias/peso estruturadas.** Não há `tabela[]` nem `indexar_por ∈ {idade,peso}`. Hoje 17 drogas viram texto em `posologias`/`cenario` — o app não consegue selecionar a linha por idade/peso porque a faixa não é dado (`{min_meses,max_meses,min_anos,min_kg}`). |
| **D3 peso-computado** | Não | **Faltam `formulas[{saida,fator|fator_min/fator_max,casas,teto,tipo_teto}]` e `apresentacoes[{concentracao_mg_ml,forma}]`.** O schema tem `slot.peso` (bool) mas nenhum `fator`, nenhuma `concentracao`, nenhum `casas`. Impossível computar `dose = fator × peso`. |
| **D4 hibrido** | Não (gap central) | **Faltam `gate_idade{regra,se_falso}` + ramos por apresentação/indicação/IG.** É o buraco P5: dose por **duas variáveis combinadas** (peso × idade/apresentação) NÃO cabe em slots booleanos independentes. Nenhum campo de gate, ramo ou contraindicação-dura. |
| **D5 renal** | Fachada só (slots) | `slot.clearance`/`slot.cockcroft`/`slot.dialise` ligam os BLOCOS, mas **falta `regraCalculo{tipo:faixaClearance, faixas[{min,max,posologiaRef}], inclusividade, diaramo}`**. Hoje cada faixa de clearance é texto em `cenario`/`posologias`; o app não escolhe a faixa, o hardcode Flutter escolhe. |
| **D6 regime** | Fachada só | `slot.regime` (bool) liga o seletor, mas **falta `regraCalculo{tipo:regime, modos{unica{faixas[]}, multiplas{faixas[]}}}`**. As duas árvores (Gentamicina única vs múltiplas) não têm estrutura. |
| **D7 infusao-bic** | Não | **Faltam `inputs[]`, `getters{volume_24h,concentracao,...}`, `concentracao_maxima`.** Nenhum slot sequer existe para BIC/infusão. Terbutalina (ped) e vasoativas (adulto) sem molde. |
| **D8 so-aviso** | Tolerado | Pode ser modelado com `posologias:[]` + `observacoes`, mas **falta `tem_dose:false`** explícito; `validate` exige ≥1 posologia com dose, então um item só-aviso NÃO PASSA na validação atual (bug de cobertura). |

**Transversal a T1 (faltam em TODOS os sub-tipos):**
- **`dose_maxima` como DADO** com `{valor, unidade, tipo ∈ clamp/texto}`. Hoje o teto é só texto dentro
  de `posologias[].dose`/`observacoes`. A distinção **clamp vs texto** (decisão de produto mais crítica,
  ~14 tetos ped são clamp real) é **inexpressável** no schema atual.
- **`apresentacoes[{id,label,concentracao_mg_ml,forma}]`** — o seletor de frasco que troca o fator/concentração.
  Não existe. `via` é da tela inteira; não há eixo de apresentação.
- **`papel: ataque|manutencao`** — JÁ EXISTE no enum `papel` (não é gap). É a única peça do cruzamento
  já modelada.

### T2 — calculadora-formula

**Cobertura: zero.** Nenhuma droga; é um tipo inteiro ausente do schema.

Delta (tudo falta):
- **`inputs[{id,label,unidade,validacao{min,max,msg}}]`** — não há conceito de input numérico nem guard
  de validade clínica (LDL esconde se TG≥400, Peso Ideal exige altura 123–213).
- **`formulas[{id,label,expr,casas}]`** — não há campo de expressão/fórmula. Multi-fórmula (QTc Bazett/
  Fridericia/Framingham/Hodges lado a lado) impossível.
- **`faixas_classificacao[{condicao,rotulo,texto}]`** — não há faixas de classificação (IMC 6 faixas,
  SDRA 4 faixas).
- **`inputs_mutuamente_exclusivos[]`** (QTc FC⟷RR) — sem conceito.
- ~20 itens (IMC, PAM, LDL, PaO₂, P/F, Peso Ideal, Clearance, Na corrigido, SC, Holliday-Segar) sem molde.

### T3 — escore-por-pontos

**Cobertura: zero NESTE schema.** Já está entregue, porém num schema SEPARADO (Admin de Escores,
engine `Score`/`Question`/`ResultVariation`). O `antibioticos.schema.json` não o representa.

Delta (relativo a unificar tudo num envelope comum):
- **`questions[{id,title,options[{label,pontos}]}]`** — ausente.
- **`resultados[{id,title,meaning,biggerThen}]`** — ausente. Resolução por limiar `biggerThen` (typo
  load-bearing) não existe aqui.
- **`aditionalTexts[{meaningTitle,variations[]}]`** — ausente (typo load-bearing, é contrato).
- Nota: o gap aqui é de **unificação de envelope**, não de capacidade — o T3 já funciona em outro lugar.

### T4 — escore-por-criterios

**Cobertura: zero.** ~3 itens (IRA KDIGO, PPS, Berlim/SDRA) sem molde.

Delta:
- **`eixos[]`** (creatinina, débito urinário; deambulação/atividade/autocuidado da PPS) — sem conceito.
- **`regras_estagio[{estagio,condicao_booleana,texto}]`** — **não há regras booleanas estruturadas.**
  Estadiamento por regra (não soma de pontos) é inexpressável. Difere de T3 (somatório) e do schema atual
  (que não tem nem somatório nem regra).
- **`sub_calc`** embutido (Cockcroft dentro do IRA) — sem aninhamento de cálculo.
- **`imagem_apoio`** (PPS usa JPG da tabela) — não há campo de imagem de apoio (FLAG: arte fechada).

### T5 — protocolo-multi-step

**Cobertura: zero.** Hoje hardcoded no binário (CAD, Trombólise, Intubação, PCR, Diarreia A/B/C…). ~10 itens.

Delta:
- **`abas[]`/`steps[{id,titulo,conteudo}]`** onde `conteudo` referencia OUTRO molde — **não há composição/
  aninhamento de molde.** O schema é um item plano; não consegue conter um sub-item T1/T6 dentro de uma aba.
- **`input_global`** (peso compartilhado entre abas) — sem conceito de input cross-aba.
- **`cross_links[]`** (CAD aba 7 → Ânion Gap) — `ferramentasSimilares[]` é só lista de nomes (string), não
  link estrutural navegável nem ancorado a uma aba específica.

### T6 — conduta-arvore-decisao

**Cobertura: zero.** ~6 itens (Hipoglicemia, Bradicardia, Taquiarritmia, Cardioversão, aba 3 CAD, Anafilaxia).

Delta:
- **`arvore{no_raiz, nos[{id,pergunta,sim→,nao→,conduta_texto}]}`** — **não há grafo/árvore de decisão.**
  Nós SIM/NÃO encadeados com estado booleano por nó são totalmente inexpressáveis.
- **`mnemonico_header`** (MOVE) — sem campo.
- **`link_final`** — termina apontando para outra ferramenta; sem link estrutural de saída.

### T7 — conversor

**Cobertura: zero.** ~8 itens (7 conversores de infusão + Conversor de Corticóides).

Delta:
- **`dropdowns[{id,opcoes[{label,fator_b}]}]`** — não há dropdown com fator multiplicativo (`.b`).
- **`formula`** (multiplica/divide pelos fatores) — sem expressão.
- **`nota_fixa`** ("1 mL = 20 gotas") — pode cair em `observacoes`, mas sem semântica de conversor.

### T8 — tabela-referencia

**Cobertura: parcial-acidental.** O schema consegue *imitar* uma tabela enfileirando `posologias[]`,
mas sem o eixo de indexação que define o molde.

Delta:
- **`indexar_por ∈ {cenario,faixa_etaria,clcr}`** — sem eixo de seleção estruturado.
- **`linhas[{chave,apresentacao,dose_usual,prescricao,cuidados}]`** — `posologias[]` tem `cenario`+`dose`+
  `diluente`, mas **falta a chave de eixo** (ClCr para Anticoagulantes, faixa etária para Parâmetros VM).
  Sem isso é lista de texto, não tabela indexada.
- **`eixo_decisao`** (Anticoagulantes por ClCr) — ausente.
- **`imagem`** (Sinais Vitais Normais é JPG) — sem campo de imagem.

### T9 — ferramenta-utilitaria

**Cobertura: zero — e fora de escopo clínico.** ~4 itens (Soluções Personalizadas, Passômetro, Dividir
Descanso). CRUD offline do usuário. Delta listado por completude: `entidade{campos[]}`, `operacoes[CRUD]`,
`persistencia:offline`, `empty_state` — nenhum existe. Não é prioridade do cadastro de conteúdo clínico.

---

## 2. Gaps transversais (cortam vários moldes)

1. **`regraCalculo` estruturado NÃO EXISTE.** É o gap-mãe. Sem ele: D3/D4/D5/D6/D7 (T1), T2, T4, T7 não
   computam. O `slot.definirDose` é um stub booleano bloqueado até a fase 2 e não carrega faixa min/max.
   Trazer pediatria ao admin é exatamente preencher este buraco (brief P5).
2. **`tipo` de molde (T1..T9) não existe.** O schema é T1-only por construção (`$id.../antibioticos`).
   Um admin unificado precisa do discriminador `tipo` no envelope para rotear o renderer/validador.
3. **Faixas estruturadas (idade/peso/clearance) são texto, não dado.** Atravessa D2/D4/D5/T4/T8. Nenhum
   `{min,max,unidade}` em lugar nenhum; a seleção de linha por faixa é feita pelo hardcode Flutter, não pelo
   conteúdo cadastrado.
4. **`dose_maxima{valor,unidade,tipo:clamp/texto}` ausente.** Teto só vive como copy. Clamp vs texto
   inexpressável — e é a decisão de produto mais crítica do projeto.
5. **`apresentacoes[]` (concentração/forma) ausente.** O eixo "seletor de frasco que troca o fator" não
   existe; `via` é da tela toda.
6. **Composição/aninhamento de moldes ausente.** T5 (abas que contêm T1/T6) e T4 (`sub_calc`) precisam que
   um item contenha outro. O schema é estritamente plano.
7. **Grafo de decisão ausente.** T6 (nós sim/não) não tem nenhuma primitiva de árvore.
8. **`inputs[]` numéricos + `validacao` ausentes.** T2/T7/D7 precisam de inputs declarados com guard
   (min/max/msg). O schema só conhece `slot.peso`/`slot.clearance` como booleanos, sem validação de range.
9. **Ramos neonatais (IG + dias-de-vida) ausentes.** Só-pediátrico; hoje rótulo de texto. Precisa
   `ramos_neonatais[]` com input numérico de IG — molde novo (gap §3.2 do tipos-canônico).
10. **Imagem de apoio ausente.** PPS, Sinais Vitais, tabela de Hiperglicemia vivem como JPG (arte fechada);
    nenhum campo de imagem estruturado.
11. **`flags[]` (F-01..F-29) sem lugar.** O modelo de dose pediátrica carrega 29 flags clínicas que a revisão
    do Gustavo precisa rastrear por droga; o schema não tem onde anexá-las (caem em `observacoes` sem tipo).

---

## 3. O que o schema atual ACERTA (não é gap — preservar)

Para não jogar fora o que funciona:
- **Envelope editorial completo** (status × revisão médica, gates de publicação) — reaproveitável por TODOS
  os moldes. É a melhor parte.
- **`papel ∈ {ataque,manutencao,...}`** já resolve o arquétipo `ataque-manutencao` sem sub-tipo novo.
- **`observacoes[{nivel}]`** com severidade (footnote/warning/critical) — bom canal para cuidados clínicos.
- **`slots[]` + `ordemBlocos`** — bom modelo de "quais blocos e em que ordem" para a tela; falta só ligá-los
  a dados de cálculo.
- **Tolerância a rascunho incompleto + review-dirty** (rebaixa revisão ao mexer em campo clínico) — política
  Q7 sólida, deve valer no schema unificado.

> Nota cética sobre `additionalProperties` livre: o schema "aceita" campos crus extras no topo (ex.:
> `doseAdulto` legado sobrevive ao spread). Isso NÃO é cobertura — é tolerância sem semântica, validação
> nem UI. Um `regraCalculo` jogado cru sobreviveria ao persist, mas nada o leria, validaria ou renderizaria.
> Cobertura real = campo modelado + validado + com UI. Por essa régua, T2–T9 são gap total.
