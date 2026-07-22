---
tipo: concept
atualizado: 2026-06-21
fontes:
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - apps/web/docs/admin/prd-admin-antibioticos.md
  - raw/appwide-01-protocolos-adultos.md
  - raw/appwide-03-calculadoras-escores.md
  - raw/appwide-04-cardio-vaso-solucoes.md
  - raw/appwide-07-modelo-dados-e-shell.md
  - raw/_coverage-matrix.md
relacionado:
  - PLANO-ADMIN-DATA-ARCH.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
status: vigente
peso: core
---

# Sistema de tipos de conteúdo canônico (CalcMed admin) — os moldes

> Fase Unify do aprofundado (PLANO-ADMIN-DATA-ARCH §6.1). Deriva o conjunto MÍNIMO de
> moldes que um admin precisaria suportar para cadastrar 100% do conteúdo clínico do
> app (adulto + pediátrico), cruzando os 7 arquétipos de dose pediátrica com os 7
> presetTemplate do admin de antibióticos. Nada inventado: cada molde rastreia para
> conteúdo de produção real auditado. Incertezas marcadas como FLAG.

## 1. Resumo

O app tem **dois sistemas de cálculo paralelos** que hoje vivem em código (hardcode Flutter)
e precisam virar **dado dirigido por molde** no admin:

- **Pediátrico:** eixo de dose = `peso × idade × apresentação × fórmula`, com teto de
  segurança. 64 drogas → 7 arquétipos de dose.
- **Adulto:** eixo de dose = `função renal (clearance / Cockcroft-Gault) → faixa → dose`,
  com toggle de diálise. 38 antibióticos → 7 presetTemplate do admin.

Além das drogas, o app tem conteúdo **não-droga**: calculadoras de fórmula, escores por
pontos, escores por critérios/estágio, protocolos multi-step, árvores de decisão,
conversores e tabelas de referência.

A síntese central: **9 TIPOS DE CONTEÚDO canônicos** cobrem tudo. Os 14 arquétipos de
dose (7 ped + 7 adulto) **colapsam em UM tipo `droga-dose` com 8 sub-tipos** (engine de
dose unificado). Os outros 8 tipos são o conteúdo não-droga. Cada tela navegável do app
mapeia em exatamente um tipo + (se droga) um sub-tipo.

| # | Tipo de conteúdo canônico | O que é | Itens de produção (estimativa) |
|---|---|---|---|
| T1 | **droga-dose** | prescrição de uma droga (dose + apresentação + via + cuidados); 8 sub-tipos de cálculo | ~110 telas (64 ped + 38 ATB adulto + ~8 vasoativas) |
| T2 | **calculadora-formula** | 1-N inputs → fórmula fechada → 1+ saídas; opcional faixas de classificação | ~20 |
| T3 | **escore-por-pontos** | soma de pontos de opções → faixa de resultado por limiar (`biggerThen`) | ~10-40 (data-driven, ilimitado) |
| T4 | **escore-por-criterios** | estadiamento por regras booleanas (não soma); badge de estágio | ~3 |
| T5 | **protocolo-multi-step** | abas/steps sequenciais, mistura texto + mini-calc por peso | ~10 |
| T6 | **conduta-arvore-decisao** | nós SIM/NÃO encadeados revelam conduta condicional | ~6 |
| T7 | **conversor** | conversão de unidade via fatores de dropdown | ~8 |
| T8 | **tabela-referencia** | cards/linhas estáticos por cenário; sem cálculo | ~15 |
| T9 | **ferramenta-utilitaria** | CRUD/utilidade do usuário (não-clínico nuclear) | ~4 |

> Limite de escopo: a maioria do conteúdo adulto de protocolo (CAD, Trombólise, Enxaqueca,
> Cirrose, Anticonvulsivantes, etc.) está HARDCODED no binário e não passa pelo admin hoje.
> Estes tipos (T5/T6) entram como ALVO do admin unificado, não como capacidade atual. O
> admin atual só cobre T1 (antibióticos adulto) e T3 (escores, via Admin de Escores já entregue).

---

## 2. Os tipos de conteúdo (catálogo)

### T1. droga-dose

Prescrição de uma droga: nome, apresentações, vias, dose (calculada ou fixa ou lookup),
contraindicações, cuidados, referências. **É o tipo dominante** e o coração do problema:
14 arquétipos de dose colapsam em 8 sub-tipos (ver §3). Inclui as drogas vasoativas (cálculo
de infusão BIC), os antibióticos adulto (ajuste renal) e as 64 drogas pediátricas.

### T2. calculadora-formula

Inputs numéricos → fórmula matemática fechada → saída(s). Guard NaN/±Inf→0 universal,
vírgula→ponto. Variantes: (a) fórmula simples (IMC, PAM, LDL, PaO₂, Relação P/F, Peso Ideal,
Na corrigido, Superfície Corporal, Holliday-Segar/hidratação); (b) multi-fórmula = N métodos
sobre os mesmos inputs lado a lado (QTc com Bazett/Fridericia/Framingham/Hodges; Clearance com
CKD-EPI 2021 + 2009 + Cockcroft); (c) com classificação por faixas (IMC 6 faixas, Relação P/F
4 faixas SDRA); (d) guard de validade clínica (LDL esconde se TG≥400; Peso Ideal exige altura
123-213; Relação P/F exige FiO₂ 21-100).

### T3. escore-por-pontos

Engine genérico data-driven (`Score`/`Question`/`ResultVariation`), **mesmo motor do Admin de
Escores já entregue**. Cada `Question` tem opções com pontos; soma → seleciona a `ResultVariation`
cujo `biggerThen` é o maior limiar ≤ total. Exibe título + significado + `aditionalTexts`. Os
escores reais (SOFA, etc.) são DADO, não código. **Ilimitado** em quantidade.

### T4. escore-por-criterios

Estadiamento por regras booleanas, NÃO por soma de pontos. Exibe um badge de estágio derivado
de comparações. Ex.: IRA KDIGO (estágios 1/2/3 por creatinina-vs-basal e débito urinário); PPS
(Palliative Performance, cascata de selects que converge num percentual). Difere de T3 porque a
resolução é uma árvore/regra, não um somatório.

### T5. protocolo-multi-step

Abas ou steps sequenciais, cada aba um sub-conteúdo independente (pode ser texto puro, mini-calc
por peso, ou sub-árvore). Ex.: CAD (8 abas), Trombólise (3), Enxaqueca (2), Cirrose (2),
Anticonvulsivantes/Status (1ª/2ª/3ª linha), Intubação (steps 1-5), PCR (5 abas), Diarreia
(Planos A/B/C). Embute frequentemente T1 (dose por peso) e T6 (decisão) dentro das abas.

### T6. conduta-arvore-decisao

Nós SIM/NÃO encadeados que revelam conduta condicional. Ex.: Hipoglicemia (consciente? → resolveu?),
Bradicardia/Taquiarritmia (sinais? → resolvido? mnemônico MOVE), Cardioversão aba Cargas (tem pulso?
→ QRS? → ritmo?), aba 3 da CAD (Na<135? → pH<7.0?). Estado booleano por nó; sem peso na maioria;
termina em conduta textual + link para outra ferramenta.

### T7. conversor

Conversão de unidade onde o cálculo multiplica/divide por fatores `.b` de itens de dropdown. Ex.:
Taxa de Infusão, os 7 conversores de infusão (mL/h↔mcg/kg/min, mL/h↔gts/min, %→mg/mL, Conversor de
Corticóides). Pode ter input mutuamente exclusivo (QTc: FC⟷RR). Sem clínica nuclear.

### T8. tabela-referencia

Cards ou linhas estáticos selecionados por cenário/faixa, **sem cálculo**. Ex.: Antiarrítmicos,
Antídotos (Flumazenil/Naloxona), Soluções Padronizadas, Anticoagulantes (eixo de decisão por ClCr),
Parâmetros Iniciais de VM (por faixa etária), Sinais Vitais Normais (hoje imagem JPG). Sobrepõe-se a
`faixa-etaria-lookup` de T1 quando o "conteúdo" é dose pura sem aritmética; a distinção é editorial
(T8 = card de referência clínica; T1 lookup = prescrição de uma droga específica).

### T9. ferramenta-utilitaria

CRUD ou utilidade do usuário, sem dose clínica nuclear. Ex.: Soluções Personalizadas (CRUD de
diluições), Passômetro/Pacemeter (handoff de pacientes), Dividir Descanso (divisor de plantão).
Persistência offline. Provavelmente gated por conta. **Fora do escopo do cadastro de conteúdo
clínico** — listado por completude.

---

## 3. droga-dose: os 8 sub-tipos (cruzamento dos 14 arquétipos)

O entregável central. Os **7 arquétipos de dose pediátrica** + os **7 presetTemplate do admin
adulto** colapsam em **8 sub-tipos canônicos** (`dosing_type`). Mapa de equivalência:

| Sub-tipo canônico (`dosing_type`) | Arquétipo PED (de onde vem) | Preset ADULTO (de onde vem) | Eixo de cálculo |
|---|---|---|---|
| **D1 fixo** | `fixo` (Colidis, Salbutamol) | `simples` (Azitromicina, Ceftriaxone) | dose literal, sem input |
| **D2 lookup** | `faixa-etaria-lookup` (17 drogas) | — (parte de `simples` quando há faixas de texto) | seleciona string por faixa (idade OU peso); sem aritmética |
| **D3 peso-computado** | `peso-computado` (20 drogas) | `peso` (Daptomicina, Polimixina B) | `dose = fator × peso` (+ teto opcional) |
| **D4 hibrido** | `hibrido` (21 drogas) | — (mistura de peso + faixa) | `fator × peso` gateado/ramificado por idade/apresentação/indicação |
| **D5 renal** | — (não há eixo renal em ped) | `renal` + `renal-dialise` | dose por faixa de clearance (Cockcroft-Gault); toggle diálise |
| **D6 regime** | — | `regime` (Gentamicina) | seletor dose-única vs múltiplas, cada um com sua árvore |
| **D7 infusao-bic** | `infusao-bic` (Terbutalina) | (vasoativas adulto) | peso + dose alvo (mcg/kg/min) + vazão → mL/h em BIC |
| **D8 so-aviso** | `so-aviso` (Metoclopramida) | — | sem dose; só cuidado clínico |

> Nota de colapso: o arquétipo PED `ataque-manutencao` NÃO tem ocorrência em sintomáticos+ATB
> pediátricos (0 drogas), mas EXISTE no adulto como padrão de prescrição (Caspofungina, Ceftriaxone,
> Vancomicina ataque+manut., Levofloxacin). No modelo unificado ele NÃO é um sub-tipo separado: vira
> o campo `papel ∈ {ataque, manutencao}` nas linhas de posologia (já existe no schema do admin). Por
> isso 7+7 arquétipos = 8 sub-tipos, não 9.

### Mapa de equivalência detalhado (PED ↔ ADULTO)

- **`fixo` (PED) ≡ `simples` (ADULTO) ≡ D1/D2:** ambos são "tela de texto, sem cálculo". A diferença
  é só se há faixas (lookup → D2) ou dose única (D1). O preset `simples` adulto é o caso D1/D2 sem peso.
- **`peso-computado` (PED) ≡ `peso` (ADULTO) ≡ D3:** idênticos no eixo (`fator × peso`). O preset
  `peso` adulto liga só o slot `peso`; o PED adiciona seletor de apresentação e teto-clamp.
- **`hibrido` (PED) → D4:** não tem par adulto direto; o adulto resolve ramos por faixa de clearance
  (D5), não por idade. D4 é o motor pediátrico mais rico (gate de idade + apresentação + indicação).
- **`renal`/`renal-dialise` (ADULTO) → D5:** **GAP** — não existe no pediátrico. É o eixo adulto que o
  PED não tem. O slot `dialise` colapsa em D5 (ramo de diálise dentro do mesmo sub-tipo).
- **`regime` (ADULTO) → D6:** Gentamicina única vs múltiplas. **GAP** no pediátrico (ped resolve por
  IG/dias-de-vida via ramos de D4, não por seletor de regime).
- **`infusao-bic`:** existe nos DOIS lados (Terbutalina PED, vasoativas adulto) → D7 unificado.
- **`calculada` (ADULTO):** NÃO é um sub-tipo de cálculo — é o slot `definirDose` (usuário define a
  dose mg/kg dentro de uma faixa permitida). Mapeia em D3/D5 com `regraCalculo.tipo = definirDose`.
  **Bloqueado até fase 2** (faixa min/max estruturada não existe). É exatamente o que o pediátrico
  mais precisa (faixa min/max por kg com teto).
- **`completo` (ADULTO):** não é arquétipo, é o "kit com todos os slots ligados" para esculpir. No
  modelo unificado não vira sub-tipo; é um preset de UI.

### Gaps do cruzamento

1. **Eixo renal (D5/D6) é só-adulto.** O molde de slot booleano atual cobre.
2. **Eixo idade-gestacional/dias-de-vida (ramos neonatais de D3/D4) é só-pediátrico** e hoje é exposto
   como rótulo de texto, não input numérico de IG. O admin precisa de um molde de `ramos_neonatais[]`.
3. **Dose por DUAS variáveis combinadas** (peso E idade/apresentação com teto) — o que D4 faz — **NÃO é
   coberto** pelo modelo de slots booleanos independentes do admin atual (brief 2026-06-20 P5). É o
   buraco central para trazer pediatria ao admin: precisa de `regraCalculo` estruturado, não só slots.
4. **`ataque-manutencao`** existe no adulto como padrão de prescrição mas não é sub-tipo: resolve via
   `papel` nas posologias.
5. **Clamp vs texto:** quase todos os tetos pediátricos exibidos são TEXTO; só ~14 são clamp real. O
   adulto idem. Distinguir `tipo ∈ {clamp, texto}` em cada teto é a decisão de produto mais crítica
   (clampar um teto-texto = comportamento clínico NOVO).

---

## 4. Campos por molde (comuns + variante)

### 4.1 Campos COMUNS a todos os moldes (envelope)

Derivados do `antibioticos.schema.json` (contrato persistido real) + estrutura observada no AS-IS:

| Campo | Tipo | Papel | Origem |
|---|---|---|---|
| `id` | string | identificador (uid) | schema |
| `nome` | string | nome do conteúdo (medicamento/calculadora/escore) | schema |
| `tipo` | enum T1..T9 | tipo de conteúdo canônico | NOVO (unify) |
| `classe` / `categoria` | string | classe farmacológica ou categoria de menu | schema (texto livre) |
| `publico` | enum `adulto`/`pediatrico`/`ambos` | público alvo (gate V2 só publica adulto) | schema |
| `via` | enum `EV`/`Oral`/`EV+Oral`/`IM` | via da tela (a via atômica é por linha em `viaInline`) | schema |
| `statusEditorial` | enum `rascunho`/`em-revisao`/`publicado`/`arquivado` | workflow editorial | schema |
| `revisaoMedicaStatus` | enum `pendente`/`aprovado`/`reprovado` | gate clínico: publicar exige `aprovado` | schema |
| `observacoes` | array `{id, nivel, texto}` (nivel ∈ `footnote`/`warning`/`critical`) | cuidados/alertas clínicos | schema |
| `referencias` | string | referência rastreável (exigida ao publicar se slot ligado) | schema |
| `contraindicacoes` | texto / `{texto, gate:bool}` | contraindicação (gate duro vs texto) | MODELO-DOSE §6 |
| `tagsRisco` | array string | tags de risco | schema |
| `ferramentasSimilares` | array string | cross-links sugeridos | schema |
| `slots` | object 10 booleanos | blocos da tela ligados/desligados | schema (antibióticos) |
| `ordemBlocos` | array string | ordem dos blocos na tela (arrastável) | model |

Apresentações (comum a T1, parcial a T2/T8): array de `{ id, label, concentracao_mg_ml, forma }`
onde `forma ∈ suspensão/gotas/comprimido/ampola/...`. Seletor troca o fator/concentração.

### 4.2 Campos VARIANTE por molde

**T1 droga-dose** (varia por sub-tipo D1..D8):
- D1 fixo: `dose_fixa` (string) ou `regimes[]` (Salbutamol).
- D2 lookup: `indexar_por ∈ {idade, peso}`, `tabela[{ faixa{min_meses/max_meses/min_anos/min_kg...}, dose, frequencia, max_texto }]`.
- D3 peso-computado: `formulas[{ saida (mL/mg), fator | fator_min/fator_max, casas (null=cru), teto, tipo_teto ∈ clamp/texto }]`, `apresentacoes[{concentracao}]`.
- D4 hibrido: `gate_idade { regra, se_falso{tipo:contraindicado, texto} }` + ramos por `apresentacao`/`indicacao`/`faixa_gestacional`/`idade_dias`; cada ramo computa (`formula`) ou é texto fixo. `ramos_neonatais[]` para IG + dias-de-vida.
- D5 renal: `regraCalculo{ tipo:faixaClearance, variavel:clearance, cockcroft:bool, faixas[{min,max,posologiaRef}], inclusividade, diaramo{ativo, prescricaoFixa, nota} }`.
- D6 regime: `regraCalculo{ tipo:regime, modos{ unica{faixas[]}, multiplas{faixas[]} } }`.
- D7 infusao-bic: `inputs[peso, dose_desejada_mcg_kg_min, vazao_desejada_ml_h]`, `getters{ volume_24h, concentracao, vol_complementar, limite_inferior, limite_superior }`, `concentracao_maxima`.
- D8 so-aviso: `aviso` (string), `tem_dose:false`.
- Transversal T1: `dose_maxima { valor, unidade, tipo ∈ clamp/texto }`, `intervalo`, `posologias[]` (papel ∈ direta/cenario/ataque/manutencao/indicacao).

**T2 calculadora-formula:**
- `inputs[{ id, label, unidade, validacao{min,max,msg} }]` (guard de validade clínica).
- `formulas[{ id, label, expr, casas }]` (multi-fórmula = N entradas).
- `faixas_classificacao[{ condicao, rotulo, texto }]` (opcional; IMC/SDRA/estágio DRC).
- `inputs_mutuamente_exclusivos[]` (QTc FC⟷RR).
- `notas[]` (texto fixo de referência).

**T3 escore-por-pontos:**
- `questions[{ id, title, options[{ label, pontos }] }]`.
- `resultados[{ id, title, meaning, biggerThen (int) }]` (resolução por limiar).
- `aditionalTexts[{ meaningTitle, variations[] }]` (typo load-bearing `aditionalTexts`/`biggerThen`).

**T4 escore-por-criterios:**
- `eixos[]` (ex.: creatinina, débito urinário; deambulação/atividade/autocuidado da PPS).
- `regras_estagio[{ estagio, condicao_booleana, texto }]`.
- `sub_calc` (opcional embutido, ex.: Cockcroft dentro do IRA).
- `imagem_apoio` (PPS usa JPG da tabela — FLAG: arte fechada).

**T5 protocolo-multi-step:**
- `steps[]` ou `abas[{ id, titulo, conteudo }]` onde `conteudo` referencia outro molde (texto, T1 dose por peso, T6 árvore).
- `input_global` (ex.: peso compartilhado entre abas da Trombólise).
- `cross_links[]` (CAD aba 7 → Ânion Gap).

**T6 conduta-arvore-decisao:**
- `arvore{ no_raiz, nos[{ id, pergunta, sim→, nao→, conduta_texto }] }`.
- `mnemonico_header` (MOVE, opcional).
- `link_final` (termina apontando para outra ferramenta).

**T7 conversor:**
- `inputs[]`, `dropdowns[{ id, opcoes[{ label, fator_b }] }]`, `formula` (multiplica/divide pelos fatores).
- `nota_fixa` (ex.: "1mL = 20 gotas").

**T8 tabela-referencia:**
- `indexar_por ∈ {cenario, faixa_etaria, clcr}`.
- `linhas[{ chave, apresentacao, dose_usual, prescricao, cuidados }]`.
- `eixo_decisao` (opcional, Anticoagulantes por ClCr).

**T9 ferramenta-utilitaria:**
- `entidade{ campos[] }`, `operacoes[CRUD]`, `persistencia: offline`, `empty_state`.

### 4.3 Os 10 slots (blocos de tela) — molde transversal de UI

Do `antibioticos.schema.json`. Defaults: extras ligados, clínicos desligados. Aplicáveis
principalmente a T1, parcialmente aos demais:

`peso` · `definirDose` · `dialise` · `regime` · `clearance` · `cockcroft` (clínicos, default OFF)
· `observacoes` · `referencias` · `copiarCompartilhar` · `ferramentasSimilares` (extras, default ON).

> Para trazer pediatria ao admin, faltam slots: `idade` (+ unidade Meses/Anos), `apresentacao`,
> `faixaEtaria`/`ramosNeonatais`, `doseMaxima` (clamp vs texto). O modelo de slot booleano atual
> NÃO cobre dose por duas variáveis combinadas (ver §3 gap 3).

---

## 5. Estimativa de telas/itens por molde

Baseado na matriz de cobertura (101 rotas pediátricas navegáveis + 38 ATB adulto órfãos + app-wide adulto).

| Molde | Itens estimados | Composição |
|---|---|---|
| **T1 droga-dose** | **~110** | 64 ped (D1:2, D2:19, D3:20, D4:21, D7:1, D8:1) + 38 ATB adulto (D5:~21, D6:1, simples/D1-D2:~10, peso/D3:2, calculada:2) + ~10 vasoativas adulto (D7) |
| **T2 calculadora-formula** | **~20** | IMC, PAM, LDL, PaO₂, Relação P/F, Peso Ideal/VC, QTc, Clearance (adulto/ped Schwartz), Na corrigido, Superfície Corporal, Holliday-Segar, Taxa de Infusão, + ped equivalentes |
| **T3 escore-por-pontos** | **~10-40** | data-driven, ilimitado; SOFA + escores cadastrados no Admin de Escores (já entregue) |
| **T4 escore-por-criterios** | **~3** | IRA KDIGO, PPS, + Berlim/SDRA se modelado fora de T2 |
| **T5 protocolo-multi-step** | **~10** | CAD, Trombólise, Enxaqueca, Cirrose, Anticonvulsivantes, Intubação, PCR, Diarreia (A/B/C), Asma, Ventilação Mecânica (hub de abas) |
| **T6 conduta-arvore-decisao** | **~6** | Hipoglicemia, Bradicardia, Taquiarritmia, Cardioversão (Cargas), aba 3 CAD, Anafilaxia |
| **T7 conversor** | **~8** | 7 conversores de infusão + Conversor de Corticóides (+ ped tem 1 conversor próprio) |
| **T8 tabela-referencia** | **~15** | Antiarrítmicos, Antídotos, Soluções Padronizadas, Anticoagulantes (~7 cenários), Parâmetros Iniciais VM, Sinais Vitais Normais |
| **T9 ferramenta-utilitaria** | **~4** | Soluções Personalizadas, Passômetro, Dividir Descanso, Doses Pediátricas (CRUD) |

> Total de conteúdo cadastrável (excluindo T9 utilitários): **~170 itens**. O grosso é T1 (~110).
> Realista R1 (do brief antibióticos): ~24 dos 38 ATB são simples/cobertos; o eixo pediátrico inteiro
> (T1 sub-tipos D2/D3/D4) é escopo adicional (gate D-J01 + classificação + conteúdo + revisão ped).
> T3 já está entregue (Admin de Escores). T5/T6 são hoje hardcode no binário (alvo, não atual).

---

## 6. Flags / decisões abertas

- **clamp vs texto** em cada teto: decisão de produto mais crítica. ~14 tetos ped são clamp real; o
  resto é texto. Clampar texto = comportamento clínico novo (F-16). Replicar em `tipo ∈ {clamp,texto}`.
- **F-09 (semântica de `c.b`, Meses vs Anos): RESOLVIDO contra bundle (2026-06-21) — NÃO há inversão.**
  `Meses=1, Anos=2` uniforme no binário; a "inversão func-01 vs func-02" era ruído de extração (2º enum
  `eDt` ordinal 0/1 que só renderiza rótulo). Ver `02-audit-meses-anos.md` + `qa/round1-ground-truth.md`.
  NÃO é mais pré-requisito P0. Aberto SEPARADAMENTE: F-06/F-07 (leitura inconsistente de `c.b` POR FAIXA
  na mesma droga) — regra: normalizar idade para meses internamente antes de qualquer gate.
- **Dose por duas variáveis combinadas** (D4 peso×idade): slots booleanos não cobrem (brief P5). Precisa
  `regraCalculo` estruturado. É o buraco central para pediatria no admin.
- **Ramos neonatais (IG + dias-de-vida):** hoje rótulo de texto, não input numérico. Molde novo.
- **`calculada`/`definirDose` bloqueado até fase 2** (faixa min/max). É o que o ped mais precisa.
- **Typos load-bearing:** `aditionalTexts`, `biggerThen` (T3), `Cockroft` (sic, app). São contrato; não corrigir.
- **T8 vs T1-lookup (D2):** fronteira editorial (card de referência vs prescrição de droga). Decidir caso a caso.
- **Conteúdo hardcoded (T5/T6 adulto):** hoje no binário, mudança exige build. Mover pro admin é trabalho
  de fase 2+ (engine dirigido por JSON, PLANO §4).
- **Hiperglicemia tabela de correção e Sinais Vitais:** vivem como IMAGEM (arte fechada), não dado. FLAG.
