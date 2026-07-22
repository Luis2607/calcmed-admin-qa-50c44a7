---
tipo: concept
atualizado: 2026-06-21
fontes:
  - "CalcMed Urgencia/pediatria-as-is/raw/appwide-05-antibioticos-hosp-1.md (produção, parte 1: A-D)"
  - "CalcMed Urgencia/pediatria-as-is/raw/appwide-06-antibioticos-hosp-2.md (produção, parte 2: D-V)"
  - "apps/web/src/admin/contracts/antibioticos.schema.json (contrato persistido, provisorio-aguardando-gui)"
  - "apps/web/src/admin/modules/antibioticos/antibioticosModel.js (normalize, defaults, presets)"
  - "apps/web/docs/admin/prd-admin-antibioticos.md (PRD do construtor)"
  - "CalcMed Urgencia/P.O/atas/2026-06-19-call-escopo-admin-antibioticos.md"
  - "CalcMed Urgencia/P.O/atas/2026-06-20-brief-antibioticos-r1.md"
relacionado:
  - "MODELO-DOSE-PEDIATRICA.md"
  - "gap-figma-vs-asis.md"
  - "apps/web/docs/admin/prd-admin-antibioticos.md"
status: vigente
---

# Modelo completo de antibióticos adultos (CalcMed)

> **Escopo: este doc é ADULTO (hospitalar).** Os 38 antibióticos/antifúngicos/antivirais aqui são do app adulto, eixo de cálculo = função renal (clearance / Cockcroft-Gault). Para a pediatria (peso × idade × apresentação), ver [MODELO-DOSE-PEDIATRICA.md](MODELO-DOSE-PEDIATRICA.md).

> Síntese de três fontes que já existem: o conteúdo de produção des-ofuscado do app atual (Flutter),
> o modelo do admin que o Gui vai modelar em JSON, e as decisões recentes do Gustavo nas atas.
> Não foi extraído do bundle do zero. Documento de unificação para a call do Gui e para o seed dos 38.

## 1. Resumo

São **38 antibióticos/antifúngicos/antivirais hospitalares adultos** no app de produção, todos sob a
categoria `/equation/category/antibioticos` (AppBar fixo "Antibióticos"). A produção atual codifica a
**conta clínica em hardcode revisado** (fórmulas Dart literais), e a maioria das telas é uma
**calculadora de ajuste renal por faixa de clearance** com Cockcroft-Gault embutido e toggle de diálise.

O **admin** (construtor React, módulo `antibioticos`) não recria fórmula nenhuma: ele monta a tela
escolhendo **1 de 7 `presetTemplate`** (arquétipos), ligando/desligando **10 slots** (blocos da tela) e
digitando **só texto** (posologias + observações + referências). A conta continua fixa no código do app;
o admin é "um painel de interruptores, não uma planilha de fórmulas" (brief 2026-06-20). O **Gui** vai
confirmar e travar o JSON real (o schema está marcado `x-status: provisorio-aguardando-gui`).

A ideia em uma frase: **o app já sabe fazer as contas; o admin escolhe um modelo de tela, liga/desliga
blocos prontos e digita a posologia.** Realista para o R1: ~24 dos 38 são casos simples cobertos pelo
modelo; os de dose calculada (slot `definirDose`) ficam bloqueados por gate até a fase 2.

---

## 2. Catálogo de produção (38 antibióticos adultos)

> Fonte: `appwide-05` (20 fármacos A-D) + `appwide-06` (18 fármacos D-V). Doses, faixas e diluentes
> transcritos verbatim do bundle. `f`/`creatinina` = clearance informado (mL/min); `pesoXN` = `peso × N`.
> Cockcroft-Gault idêntico em todos: `TFGe = (140 - idade) × peso / (CrSérica × 72)`, × 0,85 se mulher.

### 2.1 Tabela-resumo (nome · classe · arquétipo · doses/regime · ajuste renal · diluição · via · preset admin)

| # | Fármaco | Classe (inferida) | Arquétipo produção | Dose / regime (verbatim) | Ajuste renal por clearance | Diluição | Via | Preset admin |
|---|---|---|---|---|---|---|---|---|
| 1 | Aciclovir | Antiviral | peso×mg/kg + renal + diálise | `pesoX5` a `pesoX10` mg; diálise: `pesoX2.5`–`pesoX5` 24/24h | >50 → 8/8h · 25-50 → 12/12h · 10-25 → 24/24h · 1-10 → 24/24h (dose menor) | <500mg→100mL; senão 240mL SF 0,9%, EV em 1h | EV | renal-dialise |
| 2 | Amicacina | Aminoglicosídeo | peso×mg/kg + renal + diálise | `pesoX5`–`pesoX12.5` mg; diálise: 3x/semana | ≥60 → 8/8h · 40-60 → 12/12h · 20-40 → 24/24h · 1-20 → uma vez | 100mL SF 0,9% | EV | renal-dialise (ou peso) |
| 3 | Amoxicilina + Clavulanato | Penicilina + inib. β-lactamase | dose-fixa banded | 1G (≥30); 1G/500MG 12/12h (10-30); 1G/500MG 12-24h (1-10) | ≥30 → 8/8h · 10-30 → 12/12h · 1-10 → 12-24h | 100mL SF 0,9% | EV | renal |
| 4 | Ampicilina | Penicilina | dose-fixa banded (2 regimes-alvo) | 2G ou 1-2g; intervalo por faixa | ≥50 → 4/4h(2g) ou 6/6h · 30-50 → 6/6h · 15-30 → 8/8h · <15 → 12/12h | 100mL | EV | renal |
| 5 | Ampicilina + Sulbactam | Penicilina + inib. β-lactamase | dose-fixa banded | 1.5G a 3G | ≥30 → 6/6h · 15-30 → 12/12h · 1-15 → 24/24h | 100mL SF 0,9% | EV | renal |
| 6 | Anfotericina B Desoxicolato | Antifúngico poliênico | dose-escolhida (sem ajuste) | dose 0,7-1,0 mg/kg/d; aspirar `dose×peso×0,2` mL (cap 10mL / 500mg) | "Não há ajuste" | reconstituir 50mg em 10mL + SG 5%, EV 2-6h, 24/24h | EV | calculada |
| 7 | Anfotericina B Lipossomal | Antifúngico poliênico | dose-escolhida (sem ajuste) | dose 3-6 mg/kg/d; total = `peso×dose` mg | "Não há ajuste" | + SG | EV | calculada |
| 8 | Azitromicina | Macrolídeo | texto-estático | 500MG | "Não há ajuste" | 250mL SF 0,9%, EV em 1h | EV | simples |
| 9 | Caspofungina | Equinocandina | texto-estático (ataque+manut.) | Ataque 70MG · Manut. 50MG 24/24h | "Não há ajuste" | 250mL SF 0,9% | EV | simples |
| 10 | Cefazolina | Cefalosporina 1ª ger. | dose-fixa banded + diálise | 1 a 2G; base 500MG-1G; diálise 2G 3x/sem após diálise | ≥50 → 8/8h · 30-50 → 8-12h · 10-30 → 12/12h · 1-10 → 24/24h | 100mL | EV | renal-dialise |
| 11 | Cefepime | Cefalosporina 4ª ger. | dose-fixa banded (2 alvos) | 2G→500MG por faixa | >60 → 12/12h(ou 8/8) · 30-60 → 1G 12/12h · 11-30 → 1G 24/24h · 1-11 → 500MG 24/24h | 100mL | EV | renal |
| 12 | Ceftarolina | Cefalosporina anti-MRSA | dose-fixa banded (2 alvos) | 600→200MG por faixa | >50 → 12/12h(ou 8/8) · 30-50 → 400MG · 15-30 → 300MG · 1-15 → 200MG | 250mL SF 0,9% | EV | renal |
| 13 | Ceftazidima | Cefalosporina 3ª ger. | dose-fixa banded (2 alvos) | 1G→500MG; base 500MG-1G | ≥50 → 8/8h · 30-50 → 12/12h · 15-30 → 24/24h · 1-15 → 500MG 24/24h | 100mL | EV | renal |
| 14 | Ceftazidima + Avibactam | Cefalosporina + inib. β-lactamase | dose-fixa banded | 2G/500MG → 750MG/187,5MG por faixa | >50 → 8/8h · 30-50 → 1G/250MG 8/8h · 15-30 → 12/12h · 5-15 → 24/24h · 1-5 → estendida | 100mL | EV | renal |
| 15 | Ceftriaxone | Cefalosporina 3ª ger. | texto-estático (ataque+manut.) | Ataque 2G (var. 1G) · Manut. 2G 24/24h | "Não há ajuste" | 100mL SF 0,9% | EV | simples |
| 16 | Cefuroxima | Cefalosporina 2ª ger. | dose-fixa banded | 750MG a 1,5G | ≥30 → 8/8h · 10-30 → 12/12h · 1-10 → 24/24h | 100mL SF 0,9% | EV | renal |
| 17 | Ciprofloxacin | Fluoroquinolona | dose-fixa banded | 200 a 400 mg | ≥30 → 400mg 8-12h · 1-30 → 200-400mg 12-24h | (sem diluente fixo na string) | EV | renal |
| 18 | Claritromicina | Macrolídeo | dose-fixa banded | 500MG | ≥30 → 12/12h · 1-30 → 24/24h | 250mL SF 0,9%, EV em 1h | EV | renal |
| 19 | Clindamicina | Lincosamida | tabela-referência (EV+VO) | EV 600-4800 mg/dia (2-4 doses); VO 600-2400 mg/dia; habitual 600MG | "Não há ajuste" | 100mL SF 0,9% ou SG 5% | EV (+ Oral documentada) | simples |
| 20 | Daptomicina | Lipopeptídeo | peso×mg/kg + renal | `pesoX4`–`pesoX6` mg (4-6 mg/kg) | ≥30 → 24/24h · 1-30 → 48/48h | 50mL SF 0,9%, EV 30min | EV | peso (renal) |
| 21 | Doxiciclina | Tetraciclina | tabela-referência | 100 mg, 1 CP 12/12h | "Não há ajuste" | — | Oral | simples |
| 22 | Fluconazol | Azólico (antifúngico) | calc-conduta renal (sem diálise) | 200-400 mg 1x/d; reduzir 50% se TFGe ≤50; diálise 3x/sem após HD | Não há ajuste >50; reduz 50% ≤50 | — | EV + Oral | renal |
| 23 | Fosfomicina | Fosfônico | tabela-referência | 3G (pó) + 50-75mL água, dose única (ITU) | "Não há ajuste" (monitorar terapia prolongada) | 50-75mL água | Oral | simples |
| 24 | Ganciclovir | Antiviral | conduta mg/kg + renal + diálise | indução `pesoX5`/manut. `pesoX5`; reduz por faixa; diálise `pesoX1.25`/`pesoX0.625` 3x/sem | ≥70 → ind.12/12h·manut.24/24h · 50-70 → ×2,5 · 25-50 · 10-25 · 1-10 → 3x/sem | 100mL SF 0,9%, EV 1h | EV | renal-dialise (regime ind/manut) |
| 25 | Gentamicina | Aminoglicosídeo | conduta mg/kg + regime (único/múltiplo) + renal + diálise | dose única/dia (`pesoX5.1`→`pesoX2` por faixa) vs múltiplas (`pesoX1.7`–`pesoX2` 8/8h); diálise 3x/sem | dose-única: ≥80→24h … 1-10→72h · múltiplas: ≥90→8h … 1-10→48h | 100mL SF 0,9%, EV 30-60min | EV | regime (peso+renal+diálise) |
| 26 | Imipenem + Cilastatina | Carbapenêmico | calc-conduta renal (3 cenários-alvo) + diálise | 250mg-1G por faixa; diálise 250-500mg 12/12h | ≥60 → s/ajuste · 30-60 → 500mg 8/8h · 15-30 → 12/12h · 1-15 → só se HD em 48h | 100/250mL SF 0,9%, EV 30min | EV | renal-dialise |
| 27 | Levofloxacin | Fluoroquinolona | calc-conduta renal (2 alvos) + diálise | 250-750MG por faixa (ataque/manut.); diálise ataque 500/750 + manut. 250/500 48/48h | ≥50 → s/ajuste · 20-50 → manut. 24-48h · 1-20 → 48/48h | — | EV | renal-dialise |
| 28 | Linezolida | Oxazolidinona | tabela-referência | 600MG 12/12h | "Não há ajuste" (TFGe<30/HD: alguns reduzem 300mg 2x/d após 72h) | 100mL SF 0,9% | EV | simples |
| 29 | Meropenem | Carbapenêmico | calc-conduta renal (2 alvos) + diálise (BIC 3h) | 500MG-2G por faixa; diálise 500MG/1G 24/24h | >50 → 8/8h · 25-50 → 12/12h · 10-25 → 12/12h · 1-10 → 24/24h | 100mL SF 0,9%, BIC em 3h | EV | renal-dialise |
| 30 | Metronidazol | Nitroimidazol | conduta + diálise (dose fixa, TFG informativa) | 500MG 8/8h (habitual); diálise 500MG 8-12h | "Não há ajuste" | — | EV + Oral | simples (renal/diálise informativa) |
| 31 | Micafungina | Equinocandina | tabela-referência (por indicação) | Aspergilose 100-150MG 1x/d · Neutropenia febril 100MG 1x/d | "Não há ajuste" | 100mL SF 0,9% | EV | simples |
| 32 | Norfloxacin | Fluoroquinolona | calc-conduta renal + diálise | 400MG VO; diálise 24/24h | ≥30 → 12/12h · 1-30 → 24/24h | — | Oral | renal |
| 33 | Oxacilina | Penicilina antiestafilo. | calc-conduta renal + diálise | 2G 4/4h (alerta neurotoxicidade ≤8g/d em infecções não graves) | ≥10 → s/ajuste 2G 4/4h · 1-10 → alerta + 2G 4/4h | 100mL SF 0,9% | EV | renal-dialise |
| 34 | Piperacilina + Tazobactam | Penicilina + inib. β-lactamase | calc-conduta renal + diálise | 4,5g / 2,25g por faixa; diálise 4,5g 12/12h e 2,25g 8/8h | ≥100 → 6/6h · 40-100 → 6/6h (str. idêntica, flag) · 20-40 → 8/8h · 1-20 → 12/12h | 100mL SF 0,9% | EV | renal-dialise |
| 35 | Polimixina B | Polimixina | calc-peso (UI), sem estratificação | Ataque `peso×20000`–`peso×25000` UI · Manut. `peso×12500`–`peso×15000` UI 12/12h | "Não há ajuste" (mesma prescrição indep. diálise) | 500mL SG 5% | EV | peso |
| 36 | Sulfametoxazol + Trimetoprima | Sulfonamida + diaminopirimidina | conduta mg/kg (base trimetoprima) + renal + diálise | `peso×8`–`peso×20` mg/dia (2-4 doses) por faixa; diálise "EVITAR O USO" | >30 → 8-20mg/kg · 15-30 → reduzido · 1-15 → EVITAR | ampola 400/80mg em 125mL SF/SG, EV 60-90min | EV | renal-dialise (peso) |
| 37 | Teicoplanina | Glicopeptídeo | calc-peso (`pesoX6`) + renal + diálise | `peso×6` mg; ataque 12/12h "FAZER 3 DOSES" + manut. por faixa | ≥80 → manut.24h · 30-80 → 48h · 1-30 → 72h; diálise 72h | 100mL SF 0,9%, EV 30min | EV | renal-dialise (peso) |
| 38 | Vancomicina | Glicopeptídeo | conduta mg/kg + tempo de infusão + intervalo derivados | Ataque `peso×20`–`peso×30` mg; Manut. `peso×15`–`peso×20` mg; tempo = `peso×N/600` h; máx ataque 3g | intervalo R3: ≥50→12h · 20-50→24h · <20→48h; diálise 48-72h | 250mL SF 0,9%, ≤10mg/min | EV | renal-dialise (peso+regime) |

> Classe farmacológica acima é **inferida** (o bundle não a expõe por droga; o campo `classe` do admin é
> texto livre). Os números e regimes em `verbatim` saem direto das fontes 1.

### 2.2 Arquétipos de produção (como o app realmente funciona)

A produção tem 8 padrões observados (consolidados das duas partes):

1. **calculadora-ajuste-renal-por-clearance** (dominante, ~15-21 drogas): controller `_EquationXxxControllerBase`
   com 7 campos (peso, dialise, howToCalculate, age, manOrWoman, creatinina[=clearance], creatininaSerica).
   Saída = string de prescrição escolhida por faixas de clearance `f`.
2. **dose-fixa-banded** (1G/2G/500MG por faixa): penicilinas, cefalosporinas, quinolona, macrolídeo EV.
3. **peso×mg/kg-banded** (`pesoXN = peso × N`): Aciclovir, Amicacina, Daptomicina.
4. **calculadora-multiplicador-peso** (peso × fator, sem estratificação ou com faixa): Polimixina B (UI), Teicoplanina, e os mg/kg de Gentamicina/Sulfa/Vanco.
5. **calculadora-diluição-por-dose-escolhida** (Anfotericinas): usuário entra mg/kg; volume/mg derivados com **caps de segurança** (desoxicolato: 10mL/50mg/500mg). "Não há ajuste".
6. **tabela-referência / dose-fixa-estática**: Azitromicina, Caspofungina, Ceftriaxone, Clindamicina, Doxiciclina, Fosfomicina, Linezolida, Micafungina. Só posologia habitual, "Não há ajuste"; padrão Ataque+Manutenção em alguns.
7. **dose-com-cenários-por-prescrição-alvo** (Imipenem, Meropenem, Levofloxacin): ramifica também pela "dose usual recomendada" (ex.: 500mg-6/6h vs 1g-8/8h), 2-3 prescrições paralelas por faixa.
8. **sub-widget-por-modo** (Gentamicina): widget filho diferente conforme dose única vs múltiplas; e **tempo+intervalo derivados** (exclusivo Vancomicina).

Transversal a quase todos: **toggle DIÁLISE (SIM/NÃO)** — SIM → prescrição fixa + nota compartilhada
"Nos dias de diálise, administre após o término da diálise."; NÃO → abre cálculo renal. E o toggle
**Cockroft-Gault** (sic, com typo no app): OFF digita clearance, ON calcula TFGe pela fórmula.

---

## 3. Modelo do ADMIN (cadastro)

> Construtor React `antibioticos` (definition-driven, motor `ClinicalResourceModule`). O admin **não recria
> fórmula**: escolhe arquétipo, liga blocos, digita texto. Persiste em `cm_admin_antibioticos_v3` (localStorage
> hoje; Firestore pendente). Schema `provisorio-aguardando-gui`.

### 3.1 Os 7 `presetTemplate` (arquétipos de tela)

Cada preset é um atalho que liga os slots certos. Nomeado pela droga-exemplo real (o médico pensa "igual ao
Aciclovir", não "ajuste renal + diálise"). Após persistir, **os slots são a verdade**; o preset é só ponto
de partida (decisão D-03). Mapeamento `presetSlots` literal do `antibioticosModel.js`:

| presetTemplate | Label (UI) | Exemplo | Slots ligados (além dos extras default) | O que a tela faz |
|---|---|---|---|---|
| `simples` | Posologia simples (sem ajuste) | como Azitromicina | nenhum extra (só posologia) | Tela de texto puro: dose habitual, sem cálculo nem ajuste renal. |
| `peso` | Dose por peso | como Amicacina | `peso` | Pede peso do paciente; dose pode ser por kg. |
| `renal` | Ajuste renal (CrCl + Cockcroft) | como Fluconazol | `clearance`, `cockcroft` | Estratifica dose por faixa de clearance; calcula TFGe sozinho. Sem diálise. |
| `renal-dialise` | Ajuste renal + diálise | como Aciclovir | `peso`, `clearance`, `cockcroft`, `dialise` | O arquétipo completo de antibiótico EV: peso + função renal + ramo de diálise. |
| `calculada` | Dose calculada (definir faixa) | como Anfotericina | `peso`, `definirDose` | Usuário define a dose; **bloqueado para publicar até a fase 2** (faixa min/max estruturada não existe). |
| `regime` | Regime único vs múltiplas doses | como Gentamicina | `regime`, `clearance`, `cockcroft` | Seletor dose-única/dia vs múltiplas, cada um com sua árvore de faixas. |
| `completo` | Completo (base do mestre) | tela T0 | `peso`, `definirDose`, `dialise`, `regime`, `clearance`, `cockcroft` | Todos os blocos ligados; base para esculpir desligando o que não usa. |

Presets legados mapeados pelo normalize (`PRESET_LEGACY`): `padrao-a`→`peso`, `padrao-b`→`renal`,
`padrao-c`→`simples`, `padrao-d`→`calculada`, `crcl`→`renal`. Valor desconhecido passa cru; o enum do
schema fixa os 7 canônicos.

### 3.2 Os 10 slots (blocos da tela)

`defaultSlots`: extras ligados por padrão, clínicos desligados. Persistidos em `slots{}` (10 booleanos):

| Slot | Default | O que liga na tela |
|---|---|---|
| `peso` | false | Campo de peso do paciente (kg). |
| `definirDose` | false | Bloco "Defina a dose". **Publicação bloqueada até fase 2** (gate interino). |
| `dialise` | false | Ramo de ajuste para diálise (SIM/NÃO bifurca a tela). |
| `regime` | false | Seletor regime único vs múltiplas doses. |
| `clearance` | false | Campo de clearance de creatinina (CrCl). |
| `cockcroft` | false | Calculadora Cockcroft-Gault embutida (calcula TFGe). |
| `observacoes` | **true** | Seção de observações/alertas. |
| `referencias` | **true** | Seção de referências (exigida ao publicar se ligada). |
| `copiarCompartilhar` | **true** | Ações copiar/compartilhar. |
| `ferramentasSimilares` | **true** | Seção de ferramentas similares. |

A ordem dos blocos na tela persiste em `ordemBlocos` (array de strings, Gustavo arrasta no preview;
`BLOCOS_TELA` inclui também `posologias` = "Prescreva assim", fixo). Portável 1:1 pro Flutter.

### 3.3 Modelo de posologia (a linha de dose)

`defaultPosologia` — 11 campos por linha (`doseTipo` morreu do modelo, removido dentro de posologia):

| Campo | Enum / tipo | Papel |
|---|---|---|
| `papel` | `direta` (Posologia habitual) · `cenario` (Cenário condicional) · `ataque` (Dose de ataque) · `manutencao` (Dose de manutenção) · `indicacao` (Indicação) | Papel clínico da linha (`PAPEL_OPTIONS`). |
| `cenario` | string | Condição, quando `papel = cenario`. |
| `droga` | string | Normalmente = nome do item; divergência gera **warning** (detector de "duplicou e esqueceu de trocar"). |
| `dose` | string | Texto livre ("2", "5 a 10"). |
| `unidade` | string | g, mg, mg/kg... **Dose sem unidade bloqueia publicar** (warning no rascunho). |
| `diluente` | string | "100 mL SF 0,9%". |
| `viaInline` | `EV` · `Oral` · `IM` | Via atômica da linha (a combinada `EV+Oral` é só da tela). |
| `tempo` | string | Tempo de infusão ("em 1 hora"). |
| `intervalo` | string | "8/8h". |
| `esquema` | string | Esquema posológico em texto livre. |
| `alternativa` | boolean | Linha "ou" em relação à anterior. **`posologias[0].alternativa` é sempre false** (invariante estrutural; o "ou" exige uma dose anterior). |

Observações (`observacao`): forma canônica array de `{ id, nivel, texto }`, com `nivel` ∈ `footnote`
(Nota) · `warning` (Atenção) · `critical` (Crítico). Toleradas string e array de strings por
inconsistência conhecida do normalize.

### 3.4 Gates (travas de publicação)

Filosofia Q7: **bloqueia na publicação, avisa no rascunho** (rascunho incompleto é legítimo). Erros de
`validateAntibiotico` ao publicar:

- **Revisão médica obrigatória:** publicar exige `revisaoMedicaStatus === 'aprovado'`.
- **Pediátrico bloqueado na V2:** `publico ≠ adulto` (pediátrico/ambos) não publica (gate D-J01). Rascunho/em-revisão livres.
- **`definirDose` bloqueado até fase 2:** slot ligado bloqueia publicar enquanto a faixa min/max estruturada não existe (gate interino, B-09).
- **Dose sem unidade:** warning no rascunho, **erro** ao publicar.
- **Referência rastreável:** slot `referencias` ligado com campo vazio → warning no rascunho, **erro** ao publicar ("Publicar exige referência clínica rastreável.").
- **Via fora do enum** (`EV`/`Oral`/`EV+Oral`/`IM`): erro (B-15 corrigiu a checagem só-por-presença).
- **Nome vazio / sem posologia / nenhuma posologia com dose:** erro sempre.

Derivados e governança:
- `medicalReviewRequired` = `revisaoMedicaStatus !== 'aprovado'` (não persistido).
- **Review-dirty:** mexer em campo clínico (`nome, classe, publico, via, slots, posologias, observacoes, ordemBlocos`) de item aprovado abre **atestado de diff** e rebaixa a revisão a pendente.
- **Migração v2→v3:** publicado → em-revisão; revisão sempre zerada para pendente; chave legada vira backup.

### 3.5 Mapa: cada antibiótico de produção → preset do admin

A coluna "Preset admin" da tabela §2.1 é o encaixe sugerido. Consolidado por preset:

- **`simples`** (~8-10): Azitromicina, Caspofungina, Ceftriaxone, Clindamicina, Doxiciclina, Fosfomicina, Linezolida, Micafungina, Metronidazol (dose fixa, TFG só informativa).
- **`renal`** (~9): Amoxicilina+Clavulanato, Ampicilina, Ampicilina+Sulbactam, Cefepime, Ceftarolina, Ceftazidima, Ceftazidima+Avibactam, Cefuroxima, Ciprofloxacin, Claritromicina, Fluconazol, Norfloxacin.
- **`renal-dialise`** (~9): Aciclovir, Amicacina, Cefazolina, Ganciclovir, Imipenem+Cilastatina, Levofloxacin, Meropenem, Oxacilina, Piperacilina+Tazobactam, Sulfametoxazol+Trimetoprima, Teicoplanina, Vancomicina.
- **`peso`** (~2): Daptomicina, Polimixina B.
- **`regime`** (1): Gentamicina (único vs múltiplas + renal + diálise; o mais rico).
- **`calculada`** (~2, **fase 2**): Anfotericina B Desoxicolato, Anfotericina B Lipossomal.

> O encaixe é orientativo: o admin não reproduz a lógica de faixas (isso é hardcode no app). Várias drogas
> "renal-dialise" da produção podem ser cadastradas como `renal` + slot `dialise` ligado à mão (diff-merge
> preserva). Vanco/Genta/Teico/Sulfa têm componente peso → ligar também o slot `peso`.

---

## 4. Direção do Gustavo (atas)

> Destilado só o que é de antibióticos/admin das duas atas.

### Ata 2026-06-19 — Call Escopo + Admin + Antibióticos

Decisões:
- **D5 — Antibióticos seguem o modelo dos scores.** O Gui passa o modelo do doc + variações; cria-se tela de criação com pré-visualização (monta perguntas + JSON → preview de como fica no app). Reaproveita o que funcionou no admin de escores. *(Decisor: Luis + Gui.)*
- **D3 — Fluxo de status + cargos/permissões + publicação após revisão** (transversal a TODO o admin, inclui antibióticos): quem cadastra pode não ter permissão de publicar; item fica em rascunho/revisão até alguém acima (Gustavo) revisar → "publicado" → vai pro app. Canônico → wiki `2026-06-19-admin-status-cargos-publicacao`.
- **D4 — Listagens do admin padronizadas:** filtros + status + "números relevantes" no topo, mesmo padrão em todos os módulos.
- **D1 — Antibióticos da pediatria: Luis separa HOJE (19/06)** pra liberar o Gui; resto da pediatria reorganiza por categorias na próxima sprint (faseado).

Pendências (de antibióticos):
- **P4 — Antibióticos com regras condicionais** (marca X → abre Y de perguntas): a tela muda conforme o antibiótico; fechar o "caso" de cada um num doc único. Complexidade alta. *(Gui doc + Luis tela, antes do dev do cadastro.)*
- **P5 — Criação visual de ferramentas no admin** (não-dev edita sem colar JSON): confirmada pra R1, mas não na 1ª abordagem (prazo). A 1ª abordagem mantém o fluxo de colar JSON → gerar tela.

### Ata 2026-06-20 — Brief Antibióticos R1 (insumo de call com Gustavo, não-canônico até validar)

Mensagem central: o que falta **não é código do Gui** — é conteúdo, classificação e gates de release que
dependem do Gustavo. 6 perguntas com default recomendado:
1. **Dose calculada mg/kg/dia — R1 ou fase 2?** `definirDose` bloqueia publicar (B-09). *Default: fase 2* (publicar faixa sem teto validado é risco). Anfotericinas afetadas (provavelmente <5).
2. **Pediátrico — Luis quer NO R1 (2026-06-20), é escopo a mais.** Código trava não-adulto (D-J01); classificação dos 38 não existe (B-16). *Recomendação: dimensionar como escopo adicional na call, não "já incluso".*
3. **Quem cadastra os 38 e com quais referências?** (maior risco oculto). Referência obrigatória + revisor único (Gustavo revisa o que ele mesmo cadastra). *Default: Gustavo cadastra+referencia; Luis+Gui pré-carregam os ~17 já replicados no Figma.*
4. **B-01 e B-04 bloqueiam release?** *Default: nenhum* (cadastro é desktop; B-01 só morde import legado).
5. **Caso clínico que os slots NÃO cobrem** (dose por duas variáveis combinadas, não só exibir blocos). *Default: exceção fora do modelo → tela manual/fase 2.*
6. **Pagamentos web-first** (frente separada; não bloqueia o cadastro dos antibióticos).

Direção pro Gui (fim de semana): nenhuma calculadora nova, nenhum componente novo (composição de DS:
`InputField`, `RadioGroup`, `Segmented`, `ClinicalCard`, `AlertCard`, `ResultDisplay`).
**Recomendação central: extrair o Cockcroft-Gault para um único util reusável** (`useCockcroft`) — hoje a
fórmula só vive no preview do admin, mas o B2C precisa dela em 3 lugares (tela de antibiótico, calc
standalone Clearance/Cockcroft na Home, qualquer central com ajuste renal). 1 fórmula, 1 fonte de verdade.

---

## 5. Delta adulto × pediátrico

O admin/schema atual é **adulto-cêntrico** e o gate D-J01 só publica adulto na V2. O eixo de cálculo da
produção adulta é **função renal** (clearance → faixa → dose). O pediátrico tem um eixo totalmente
diferente. O que muda (referência ao [MODELO-DOSE-PEDIATRICA.md](MODELO-DOSE-PEDIATRICA.md), irmão desta síntese; os estados pediátricos de tela vêm do molde Figma em `gap-figma-vs-asis.md`):

| Eixo | Adulto (hoje) | Pediátrico (precisa) |
|---|---|---|
| Variável-chave da dose | Função renal (clearance / Cockcroft-Gault) | **Peso × idade × apresentação × fórmula** |
| Conta | dose fixa por faixa de clearance, ou `peso × mg/kg` | dose por kg/dia com **dose máxima (teto)** e arredondamento por apresentação |
| Slots relevantes | `clearance`, `cockcroft`, `dialise`, `regime` | peso + idade + apresentação (suspensão/comprimido/ampola) + concentração |
| Estados de tela | Vazio · Preenchido · Dark · "Não há ajuste" | + **Erro Peso** · **Dose Excedida** · **Contraindicado** · faixas etárias (molde Figma maduro) |
| Gate | publica | **bloqueado** na V2 (D-J01); classificação dos 38 inexistente (B-16) |
| `definirDose` | bloqueado até fase 2 (faixa min/max) | é exatamente o que o pediátrico mais precisa (faixa min/max por kg com teto) |

Implicação: o modelo de slot atual (booleanos independentes) **não cobre** o cálculo pediátrico — onde a
dose depende de duas variáveis combinadas (peso E idade/apresentação) e exige teto de segurança ("Dose
Excedida"). Isso casa com a pergunta 5 do brief 2026-06-20 ("caso que os slots não cobrem") e com a fase 2
do `definirDose`. Ped antibióticos no R1 = escopo adicional (gate + classificação + conteúdo + revisão ped),
não "de graça".

---

## 6. Proposta de JSON (pro Gui)

Esboço de schema estruturado unificado que atende **produção + admin**, por arquétipo. Insumo direto pra
call. Mantém o item persistido do admin (`antibioticos.schema.json`) e adiciona a camada de **regra de
cálculo** que hoje é hardcode no app, de forma que o backend possa um dia mover a lógica do Flutter pro
dado — sem quebrar o contrato atual.

### 6.1 Envelope (compatível com o schema atual)

```json
{
  "id": "aciclovir",
  "nome": "Aciclovir",
  "classe": "Antiviral",
  "publico": "adulto",
  "via": "EV",
  "presetTemplate": "renal-dialise",
  "statusEditorial": "rascunho",
  "revisaoMedicaStatus": "pendente",
  "slots": {
    "peso": true, "definirDose": false, "dialise": true, "regime": false,
    "clearance": true, "cockcroft": true,
    "observacoes": true, "referencias": true,
    "copiarCompartilhar": true, "ferramentasSimilares": true
  },
  "ordemBlocos": ["peso", "dialise", "clearance", "cockcroft", "posologias", "observacoes", "referencias"],
  "posologias": [ /* ver 6.2 */ ],
  "observacoes": [{ "id": "o1", "nivel": "footnote", "texto": "Use o peso ideal em paciente obeso." }],
  "referencias": "UpToDate / bula institucional",
  "tagsRisco": ["ajuste renal"],
  "ferramentasSimilares": [],
  "regraCalculo": { /* NOVO, opcional — ver 6.3 */ }
}
```

### 6.2 Posologia (linha de dose) — já existe no contrato

```json
{
  "id": "p1",
  "papel": "cenario",
  "cenario": "Clearance > 50, sem diálise",
  "droga": "Aciclovir",
  "dose": "5 a 10",
  "unidade": "mg/kg",
  "diluente": "100 mL SF 0,9%",
  "viaInline": "EV",
  "tempo": "em 1 hora",
  "intervalo": "8/8h",
  "esquema": "",
  "alternativa": false
}
```

### 6.3 `regraCalculo` (NOVO — opcional, modela a lógica que hoje é hardcode)

Capta os 8 arquétipos de produção (§2.2). Quatro tipos discriminados por `tipo`. **Opcional**: drogas
`simples` não têm; o admin continua só ligando slots e digitando texto. Insumo pra discutir com o Gui se
vale mover a lógica do Flutter pro dado, ou manter hardcode no app e usar isto só como documentação.

```json
// (a) Estratificação renal por faixa (dose-fixa-banded / calc-conduta)
"regraCalculo": {
  "tipo": "faixaClearance",
  "variavel": "clearance",          // mL/min; OFF=input direto, ON=Cockcroft
  "cockcroft": true,                // (140-idade)*peso/(CrS*72), *0.85 se mulher
  "diaramo": { "ativo": true, "prescricaoFixa": "...", "nota": "Nos dias de diálise, administre após o término." },
  "faixas": [
    { "min": 50, "max": null, "posologiaRef": "p_alta" },
    { "min": 25, "max": 50,   "posologiaRef": "p_media" },
    { "min": 10, "max": 25,   "posologiaRef": "p_baixa" },
    { "min": 1,  "max": 10,   "posologiaRef": "p_minima" }
  ],
  "inclusividade": "min-inclusivo"  // FLAG: produção mistura > e >= entre drogas
}

// (b) Dose por peso (peso×mg/kg ou peso×fator UI)
"regraCalculo": {
  "tipo": "porPeso",
  "fatores": { "min": 4, "max": 6, "unidade": "mg/kg" },   // Daptomicina
  "milhar": false                                          // true p/ Polimixina (UI)
}

// (c) Dose definida pelo usuário com teto (calculada — fase 2)
"regraCalculo": {
  "tipo": "definirDose",
  "faixaPermitida": { "min": 0.7, "max": 1.0, "unidade": "mg/kg/d" },  // FALTA no schema (B-09)
  "derivados": [ { "expr": "dose*peso*0.2", "cap": 10, "rotulo": "mL a aspirar" } ]
}

// (d) Regime único vs múltiplas (sub-árvores por modo)
"regraCalculo": {
  "tipo": "regime",
  "modos": {
    "unica":     { "faixas": [ /*... */ ] },
    "multiplas": { "faixas": [ /*... */ ] }
  }
}
```

Campos pediátricos futuros (fora do schema atual, casam com §5 e fase 2): `pediatria: { dosePorKgDia, doseMaxima, apresentacoes[{forma, concentracao}], faixasEtarias[] }`.

---

## 7. Flags / pendências

**Bugs de conteúdo na produção (transcritos, não inventados):**
- **Cefalexina "45/6,4":** o prompt cita esse caso herdado de amox-clav. **Não apareceu** nas fontes 1 (não há rota `/cefalexina` no app adulto; o controller de AmoxClav reusa o nome interno `Amoxicilina`). Flag para conferir se existe em outra fonte/pediatria.
- **Piperacilina+Tazobactam:** faixas `≥100` e `40-100` emitem string **idêntica** (`4,5g 6/6h`) no bundle. Possível copy-paste; reportado como observado.
- **Fluconazol:** controller carrega `pesoX4`/`pesoX6` que o build não consome (dead getters).
- **Rótulo Cockcroft:** a fórmula é Cockcroft-Gault clássico (mL/min), mas o app rotula "mL/min/1,73m²" (discrepância de rótulo presente no produto).
- **Typos load-bearing no app:** "Cockroft-Gault" (deveria Cockcroft), `_EquationLevofloaxacinControllerBase`, "Admnistrar" (imipenem), "infecção por gram negativo: :" (gentamicina). Transcritos como estão.
- **Inclusividade de faixa inconsistente** entre drogas (`>` vs `>=`, ex.: Cefazolina `>10` vs Cefepime `>60`). Não é erro de leitura; transcrito verbatim.
- **Premium por-droga:** sem flag no bundle; gating é app-wide (assinatura). Indeterminado.

**Itens faltando / inexistentes no momento desta síntese:**
- **[MODELO-DOSE-PEDIATRICA.md](MODELO-DOSE-PEDIATRICA.md)** existe neste mesmo pacote (`pediatria-as-is/`): 64 drogas pediátricas → 7 arquétipos de cálculo, com flags F-01..F-29. Referenciado no frontmatter como `relacionado`; a §5 (delta) usa também o molde de estados de tela do `gap-figma-vs-asis.md` como fonte do desenho.
- **Classe farmacológica por droga** não vem do bundle (inferida na §2.1; o campo `classe` do admin é texto livre).
- **`doseFaixa` estruturada (min/max)** não existe no schema (B-09, fase 2); é o que o `regraCalculo.tipo=definirDose` (§6.3) e o pediátrico (§5) mais precisam.

**Decisões em aberto (do Gustavo / produto):**
- Quais dos 38 entram no R1 (realista: ~24 simples) e quais ficam (dose calculada / sem classificação adulto). Brief 2026-06-20 P1.
- **Pediátrico no R1?** Luis quer (2026-06-20); é escopo adicional (gate D-J01 + classificação B-16 + conteúdo + revisão ped). Não tratar como incluso.
- **Quem cadastra os 38 e com quais referências** + revisor único (Gustavo revisa o que cadastra) = risco clínico aberto (B-13, segundo revisor é P1).
- **Antibióticos com regras condicionais** (marca X → abre Y de perguntas): fechar o "caso" de cada um num doc (ata 2026-06-19, P4).
- **Schema confirmado com o Gui?** `x-status: provisorio-aguardando-gui`; Firestore "escrito mas não testado" (B-10, sem chaves do cliente).
