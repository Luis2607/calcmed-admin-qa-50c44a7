---
tipo: audit
atualizado: 2026-06-21
fontes:
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - admin-spec/01-sistema-de-tipos.md
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - raw/func-01-antiterm-aine.md
  - raw/func-02-antiemetico-antiespasmodico.md
  - raw/func-03-antihistaminicos.md
  - raw/func-04-broncodilatadores.md
  - raw/func-05-laxativos.md
  - raw/func-06-corticoides.md
  - raw/func-07-antibioticos-A-C.md
  - raw/func-08-antibioticos-G-V.md
  - raw/01a-sintomaticos-antiterm-aine-antiemet.md
  - raw/01b-sintomaticos-antihist-antiespasm-antidiar.md
  - raw/01c-sintomaticos-broncodilatadores.md
  - raw/01d-sintomaticos-laxativos-corticoides.md
  - raw/02b-antibioticos-G-V.md
  - raw/02c-antibioticos-orfaos.md
  - raw/04-diluicoes-doses.md
  - raw/appwide-01-protocolos-adultos.md
  - raw/appwide-02-disturbios.md
  - raw/appwide-03-calculadoras-escores.md
  - raw/appwide-04-cardio-vaso-solucoes.md
  - raw/appwide-05-antibioticos-hosp-1.md
  - raw/appwide-06-antibioticos-hosp-2.md
  - raw/appwide-07-modelo-dados-e-shell.md
  - raw/_copy-inventory.md
  - raw/_coverage-matrix.md
  - raw/_orphan-sweep.md
relacionado:
  - admin-spec/01-sistema-de-tipos.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
  - PLANO-ADMIN-DATA-ARCH.md
status: vigente
peso: core
---

# Auditoria de consistência cross-content (CalcMed AS-IS)

> Lente: **consistência**. Cruza TODO o conteúdo extraído (pediátrico + adulto + escores +
> shell) procurando: (a) contradições — a mesma droga/feature com dados divergentes entre
> telas; (b) unidades inconsistentes; (c) naming drift; (d) campos mortos / dead getters; (e)
> órfãos. Cada achado traz evidência rastreável (arquivo + linha/byte/template verbatim). Cético
> por padrão: onde a divergência pode ser leitura de ofuscação, está marcado COMO TAL. Nada
> inventado. Esta é base de QA clínico (Gustavo) e de contrato do admin (Gui), não de redesign.

## 0. Sumário executivo (achados por gravidade)

| # | Achado | Classe | Gravidade | Onde |
|---|---|---|---|---|
| C-01 | Drogas duplicadas em DOIS apps (pediátrico mg/kg vs adulto renal) com a MESMA marca, lógicas opostas | Contradição estrutural | **Crítico** (clínico) | §1.1 |
| C-02 | `biggerThen`: "maior que" vs "maior ou igual" — semântica do limiar diverge entre docs | Contradição de regra | **Crítico** (escore) | §1.2 |
| C-03 | Diclofenaco: gate `isAgeOver12Months` lê `age>12` em Meses mas `>=1` em Anos | Contradição de lógica | Alto | §1.3 |
| C-04 | KDIGO 3: "TFG < 35" (adulto IRA) vs estágios DRC GV "<15" (Clearance) — limiares de TFG não casam | Contradição aparente (escopos diferentes) | Médio (flag) | §1.4 |
| C-05 | Vasoativas: concentração-base interna vs concentração máxima exibida divergem por droga | Contradição numérica aparente | Médio (flag) | §1.5 |
| C-06 | Cockcroft-Gault: 1 fórmula, ≥16 cópias hardcoded; rótulo "mL/min/1,73m²" para fórmula que NÃO normaliza | Drift + rótulo errado | Alto | §1.6, §2.1 |
| U-01 | Sulfato de Magnésio: Cuidados "60 mg/dL" vs prescrição "mg/mL" | Unidade inconsistente | Alto (clínico) | §2.2 |
| U-02 | `c.b` (Meses/Anos): func-01/func-02 pareciam divergir (F-09) | **RESOLVIDO contra bundle: NÃO há inversão** — Meses=1/Anos=2 uniforme; era ruído de extração (enum `eDt` 0/1). F-06/F-07 (leitura por faixa) ficam abertos. | ~~Crítico~~ → resolvido | §2.3 |
| U-03 | Clamp vs texto: ~14 tetos clampam, o resto é só copy; mesma palavra "Máx" para os dois | Unidade de comportamento | Alto (clínico) | §2.4 |
| N-01 | "Cockroft" (sic) vs "Cockcroft"; `Levofloaxacin`, `framigham`, `Admnistrar`, `coroporal`, `gostas`, `ocupation` | Naming drift / typos load-bearing | Médio (contrato) | §3.1 |
| N-02 | `aditionalTexts` / `biggerThen` — typos que SÃO o contrato | Naming drift contratual | Médio | §3.2 |
| N-03 | Cefepima vs Cefepime; Penicilina G grafias; Koide/Kóide/Koide D | Naming drift de marca | Baixo | §3.3 |
| N-04 | `presetTemplate` legados (padrao-a..d, crcl) vs canônicos | Naming drift resolvido | Baixo (ok) | §3.4 |
| D-01 | `doseTipo` morto dentro de posologia (proibido no schema, tolerado no topo) | Campo morto | Baixo (ok) | §4.1 |
| D-02 | Fluconazol: getters `pesoX4`/`pesoX6` carregados mas não consumidos | Dead getter | Médio (flag) | §4.2 |
| D-03 | Clearance: CKD-EPI 2021 completo no controller mas NÃO renderizado (ped + alguns adultos) | Dead code | Médio | §4.3 |
| D-04 | Penicilina Procaina reusa a chave de prescrição da Cristalina | Acoplamento frágil | Médio (flag) | §4.4 |
| D-05 | `toJson` emite menos campos que `fromJson` lê (`route`/`icon`) | Campo "morto" no emit | Baixo | §4.5 |
| O-01 | Diclofenaco pediátrico — built-but-unwired (sem rota em `/aine`) | Órfão | Alto (produto) | §5.1 |
| O-02 | 38 antibióticos adultos "Diluições e Doses" — desconectados do menu | Órfão (módulo) | Médio | §5.2 |
| O-03 | Saccharomyces boulardii (Floratil) + Zinco — acordeão sem rota própria | Órfão | Médio | §5.3 |
| O-04 | 4 telas adultas (Metoprolol/Flumazenil/Naloxona/Albumina) no bundle ped | Contaminação de bundle | Baixo (não-ped) | §5.4 |
| O-05 | Gating premium: NÃO existe por-conteúdo (só assinatura global) | Campo ausente | Médio (produto) | §5.5 |

---

## 1. CONTRADIÇÕES — mesma droga/feature, dados divergentes

### C-01. A MESMA droga existe em dois apps com eixos de dose OPOSTOS (crítico)

O bundle empacota **dois apps** (pediátrico + adulto), e ~13 antibióticos aparecem nos DOIS com a
mesma marca mas **lógica de dose incompatível**: pediátrico = `mg/kg × peso` (sem ajuste renal);
adulto = dose fixa por **faixa de clearance** (sem peso, ou peso só no Cockcroft).

| Droga | Pediátrico (raw/02a-02b, func-07-08) | Adulto hospitalar (appwide-05/06) | Adulto órfão (02c) |
|---|---|---|---|
| Cefepima/Cefepime | `dose=50×peso`, vol=`dose×11,4/conc`, diluente 50 mL (peso-computado) | 2G→500MG por faixa de clearance | calc renal adulto (`A.Hj`) |
| Amicacina | mg=fator×peso por IG/idade neonatal (hibrido) | `pesoX5`–`pesoX12,5` mg + faixa renal + diálise | — |
| Gentamicina | (mg/kg×peso)/conc, ramos IG/idade (peso-computado) | dose única vs múltiplas + faixa renal + diálise (`regime`) | — |
| Meropenem | aspirar=mg/50, ramos IG/idade/SNC (peso-computado) | 500MG-2G por faixa, BIC 3h (renal-dialise) | — |
| Metronidazol | VO ÷40, EV ÷5, por indicação (peso-computado) | 500MG 8/8h fixo, TFG informativa (simples) | — |
| Vancomicina | aspirar=mg/50, ramos IG/idade (peso-computado) | ataque/manut. mg/kg + tempo+intervalo derivados | — |
| Azitromicina | VO mL=mg/40, EV (hibrido) | 500MG fixo (simples) | — |
| Claritromicina | 25/50 mg/mL ×peso, EV só aviso <18a (hibrido) | 500MG por faixa (renal) | calc renal adulto (`A.Hp`) |
| Ceftriaxone | EV peso×0,5–1,0 mL (peso-computado) | Ataque 2G + Manut. 2G 24/24h (simples) | — |
| Amox+Clavulanato | min(peso×0,33,20) etc. (hibrido) | 1G por faixa de clearance (renal) | — |
| Ampicilina+Sulbactam | expansão por apresentação (hibrido) | 1,5G-3G por faixa (renal) | — |
| Penicilina G Cristalina | UI/kg×peso, ramos idade (peso-computado) | (não no recorte adulto) | — |

- **Evidência:** raw/_orphan-sweep.md L10-21 ("o bundle contém DOIS apps"); raw/02c L250
  (Cefepime "Controller renal adulto vs `A.Yb` pediátrico mg/kg"); MODELO-DOSE §3 (linhas 52, 56,
  58, 59, 64) vs MODELO-ANTIBIOTICOS §2.1 (linhas 11, 16, 25, 29).
- **Por que é contradição (não só duplicação):** o `fromPediatra` (appwide-07 §1.3) é o ÚNICO
  discriminador adulto-vs-pediatria no item. Se o admin unificar conteúdo num só registro por
  nome de droga (chave natural = "Cefepima"), **as duas lógicas colidem**. A unicidade contextual
  do admin já tenta mitigar (`nome + publico + via` → warning, NÃO bloqueia — antibioticosModel.js
  L274-279, schema x-validacoes "Unicidade contextual"), mas warning não impede o erro: dois
  registros "Cefepima" com `publico` diferente convivem sem trava.
- **Risco:** cadastrar a dose adulta numa tela que o app pediátrico serve por `mg/kg` (ou
  vice-versa) = erro de dose por ordem de grandeza. **Decisão de produto obrigatória:** a chave de
  unicidade do conteúdo clínico DEVE incluir `publico`, e a UI tem que deixar explícito qual app
  consome cada registro. Flag P1 para Gustavo/Gui.

### C-02. `biggerThen`: "maior que" vs "maior ou igual" — limiar do escore diverge entre docs

A regra de resolução de faixa do motor de escores está documentada de **duas formas
contraditórias**:

- **appwide-07 L132 (modelo de dados):** "`biggerThen`... a variação se aplica quando a soma dos
  pontos é **maior que** esse valor" (estritamente `>`).
- **appwide-03 L257 (lógica de resolução):** "seleciona a `ResultVariation` cujo `biggerThen` é o
  maior limiar **`≤` total** (padrão 'maior ou igual ao threshold')" — e L258 admite: "o
  comparador exato (`>=` vs `>`)... não foi isolado num único getter literal".
- **admin-spec/01 L93:** "soma → seleciona a `ResultVariation` cujo `biggerThen` é o maior limiar
  **≤ total**".

- **Por que importa:** num escore com faixa `biggerThen: 2` e total = 2, `>` exclui a faixa e `>=`
  inclui. Em SOFA/qSOFA isso muda a classificação de gravidade no limiar. **É contradição não
  resolvida**, herdada da ofuscação (o próprio appwide-03 marca como incerteza). Resolver antes de
  o admin gerar JSON de escore com `biggerThen` — o Admin de Escores já entregue precisa ter um
  comparador único e documentado. Flag P1 clínico.
- **Evidência:** appwide-07 L132 vs appwide-03 L257-258 vs admin-spec/01 L93.

### C-03. Diclofenaco: gate `isAgeOver12Months` é assimétrico Meses vs Anos

O gate de idade do Diclofenaco órfão usa o getter `isAgeOver12Months` (`gax0`):
`(Meses && age>12) || (Anos && age>=1)`.

- **Contradição interna:** o nome diz "Over 12 Months", mas a perna "Meses" exige **estritamente
  `>12`** (13 meses+), enquanto a perna "Anos" aceita **`>=1`** (12 meses). Logo uma criança de
  **exatamente 12 meses** é "Contraindicado Diclofenaco" se a idade foi digitada em Meses, mas
  liberada se digitada em "1 ano". Mesma idade, dois resultados.
- **Evidência:** func-01 L136 ("`(Meses && age>12) || (Anos && age>=1)`... Se falso →
  'Contraindicado Diclofenaco'"); raw/01a L287.
- **Relacionado:** é o mesmo padrão do F-07 (Bromoprida, `isAgeOver1Year`: `(Anos && age>=12) ||
  (Meses && age>=1)` — MODELO-DOSE F-07) e do F-06 (Dimenidrato/Ondansetrona leem `c.b` de forma
  inconsistente entre condições). **Família inteira de gates de idade tem fronteiras inconsistentes
  no limiar de 12 meses/1 ano.** Isto é C-03/F-06/F-07 (leitura por faixa) — NÃO é a inversão global
  F-09, que foi RESOLVIDA (sem inversão, Meses=1/Anos=2; ver §U-02 / `02-audit-meses-anos.md`). Resolver
  normalizando idade para meses internamente; o `>=12` do ramo Meses da Bromoprida = 1 ano (coerente),
  não "12 anos".

### C-04. KDIGO 3 "TFG < 35" vs estadiamento DRC GV "< 15" — limiares de TFG não casam

- **IRA KDIGO 3** (appwide-01 L158): "... ou TFG < **35** mL/min/1,73m² em menores de 18 anos".
- **Estadiamento DRC** (appwide-03 L185-192 e 05-calculadoras L77): GIV 15–<30; **GV < 15**.
- **Por que parece contradição e provavelmente NÃO é:** são escopos clínicos diferentes (KDIGO de
  IRA pediátrica usa o corte 35 só para menores de 18; o estadiamento DRC é a escala G1-G5
  padrão). Não há erro óbvio, mas como o app exibe AMBOS num mesmo fluxo (IRA KDIGO inclui sub-calc
  Cockcroft que produz uma TFG, e a calc Clearance produz outra com estadiamento diferente), o
  **usuário vê dois cortes de TFG distintos sem explicação**. Flag de revisão clínica (não erro de
  transcrição). Evidência cruzada appwide-01 L158 vs appwide-03 L185.

### C-05. Vasoativas pediátricas: concentração-base interna ≠ concentração máxima exibida

A tela pediátrica de Drogas Vasoativas (raw/04) traz, por droga, DUAS grandezas que não batem
entre si nem com a tela adulta:

| Droga | Conc. base interna `a<Droga>` (raw/04 L135) | Conc. máx exibida (raw/04 L127-132) | Adulto (appwide-04 diluições) |
|---|---|---|---|
| Dobutamina | 12500 | "5.000 mcg/mL" | até 4.000 mcg/mL (4amp+170mL) |
| Dopamina | 5000 | "3.200 mcg/mL" | 1.000 mcg/mL (5amp+200mL) |
| Noradrenalina | 1000 | "16 mcg/mL" | 64/100/128 mcg/mL |
| Nitroprussiato | 25000 | "400 mcg/mL" | 200/400 mcg/mL |
| Vasopressina | 20000 | "1000 mU/mL" | 0,2/0,4 U/mL = 200/400 mU/mL |

- **Cético:** as três colunas medem coisas diferentes (concentração total da ampola em mcg vs teto
  de segurança da solução pronta vs exemplos de diluição). Não é necessariamente bug — mas a
  Vasopressina mistura `mU/kg/min`, `mU/mL` e `U/mL` na mesma droga (raw/04 L117, L132), e a
  Noradrenalina exibe teto "16 mcg/mL" enquanto o adulto dilui rotineiramente a 64-128 mcg/mL
  (appwide-04 L91). **Os tetos pediátricos e adultos da mesma droga divergem por fator ~8.** Flag
  clínica: confirmar se os tetos pediátricos são reais ou herdados de outra tela. Evidência raw/04
  L127-135 vs appwide-04 L91-97.

### C-06. Cockcroft-Gault: 1 fórmula, ≥16 cópias, rótulo errado (ver também §2.1, §1.6)

A fórmula `TFGe = (140-idade)×peso/(CrSérica×72)` (×0,85 mulher) aparece **idêntica e copiada** em:
- 14+ controllers de antibióticos adultos (appwide-05 L29, appwide-06 L13 "literal idêntica em
  todos", L282 "copiada em 14+ controllers");
- os 10 antibióticos órfãos (02c L83);
- a calc Clearance adulto (appwide-03 L178) e a pediátrica (05-calculadoras L73);
- a sub-calc do IRA KDIGO (appwide-01 L153).

- **Contradição de rótulo (presente no PRODUTO):** a saída é rotulada `mL/min/1,73m²` em TODAS,
  mas a fórmula Cockcroft-Gault clássica entrega **mL/min NÃO normalizado** por superfície
  corporal (appwide-06 L23, raw/05 L285). O app rotula uma unidade que não calcula.
- **Recomendação já registrada** (MODELO-ANTIBIOTICOS §4, brief 2026-06-20): extrair `useCockcroft`
  único. Hoje é o pior caso de drift de fórmula do app. Evidência appwide-06 L282-293.

---

## 2. UNIDADES INCONSISTENTES

### U-01. Cockcroft (ver C-06): rótulo `mL/min/1,73m²` para fórmula em mL/min

Listado como C-06 por ser também drift. Unidade exibida diverge da unidade calculada em TODA tela
com Cockcroft. Evidência appwide-06 L23.

### U-02. Sulfato de Magnésio: "60 mg/dL" (Cuidados) vs "mg/mL" (prescrição) — clínico

- **Cuidados:** "Concentração máxima: **60 mg/dL**" (raw/01c L237).
- **Prescrição:** usa "**mg/mL**" (raw/01c L240, FLAG explícita; MODELO-DOSE F-14).
- `mg/dL` e `mg/mL` diferem por fator 100. Numa concentração-teto de droga EV pediátrica isso é
  erro clínico potencial. Transcrito verbatim do bundle — é inconsistência **do produto**, não da
  extração. Flag P1 Gustavo. Evidência raw/01c L237 vs L240.

### U-03. `c.b` (idade): Meses vs Anos (F-09) — RESOLVIDO contra bundle (2026-06-21), NÃO há inversão

- **VEREDITO ground-truth:** `Meses=1, Anos=2` codificado de forma uniforme no binário
  (`aR("Meses",1)` / `aR("Anos",2)`; 0 definições inversas) e lido coerentemente pelos getters
  (Ibuprofeno `A.a7D`, Bromoprida-base `A.uX`). A "inversão func-01 vs func-02" era **ruído de
  extração** — os arquivos raw transcreveram com sinais trocados; a fonte mais profunda (o byte do
  bundle) refuta a inversão. Confusão com o 2º enum `eDt` (ordinal 0=Meses/1=Anos) que só renderiza
  rótulo de UI e NÃO alimenta gate de dose. Ver `02-audit-meses-anos.md` + `qa/round1-ground-truth.md`.
- **NÃO é mais pré-requisito P0 / bloqueador.** Rebaixado de "inversão crítica" para "ruído de
  extração resolvido; enum canônico Meses=1/Anos=2".
- **Permanece ABERTO e SEPARADO (não confundir com inversão global):** F-06/F-07 — leitura
  inconsistente de `c.b` POR FAIXA dentro da mesma droga (faixa que só dispara em Meses e nunca
  renderiza se a idade vier em Anos). Regra de modelagem: normalizar idade para meses internamente
  antes de qualquer gate; declarar se o gate opera antes/depois da conversão 12m→1a.

### U-04. Clamp vs texto: a mesma palavra "Máx" significa duas coisas

- ~14 tetos são **clamp real** (`if(x>T)x=T`): Paracetamol 35 gotas, Ibuprofeno, Nimesulida,
  Diclofenaco, Hidroxizina, Bromoprida, Ondansetrona, Dimenidrato, Sulfato Mg, Albendazol,
  Amoxicilinas, Metronidazol, Secnidazol (MODELO-DOSE §6.A).
- O resto é **texto** (copy exibida, NÃO aplicada): Dexametasona 16 mg, Hidrocortisona choque
  100 mg, Terbutalina, Penicilinas, Meropenem, Vancomicina, Cefepima, Cefuroxima, Ampicilina,
  antihistamínicos, laxativos (MODELO-DOSE §6.B).
- **Inconsistência de comportamento sob a mesma palavra "Máx".** O admin precisa de
  `tipo ∈ {clamp, texto}` por teto (admin-spec/01 §6). Clampar um teto-texto = comportamento
  clínico NOVO (F-16). É a decisão de produto mais crítica do eixo pediátrico. Evidência
  MODELO-DOSE §6 + F-16.

---

## 3. NAMING DRIFT

### N-01. Typos load-bearing no app (grafias erradas que estão em produção)

Transcritos verbatim, NÃO corrigir sem camada de compat (quebram leitura legada):

| Grafia no app | Correto | Onde |
|---|---|---|
| `Cockroft-Gault` | Cockcroft | raw/05 L42/L285; appwide-06 L13/L293; 02c (todas) |
| `_EquationLevofloaxacinControllerBase` | Levofloxacin | appwide-06 L133/L293 |
| `framigham` | Framingham | appwide-03 L147 |
| `Admnistrar` | Administrar | appwide-06 L120/L293 |
| `coroporal` ("Peso coroporal ≥ 30 kg") | corporal | raw/01b L147-148; MODELO-DOSE F-11 (Loratadina) |
| `gostas` ("a [..] gostas") | gotas | raw/01b L193-194; MODELO-DOSE F-08 (Escopolamina) |
| `ocupation` | occupation/ocupação | appwide-07 L159 (modelo User) |
| "infecção por gram negativo: :" (`::`) | (dois-pontos duplicado) | appwide-06 L293 (Gentamicina) |
| "Volume a ser infudido" | infundido | raw/05 L285 |
| "Item obrigatorio" (sem acento) | obrigatório | raw/05 L285 |

- **Risco:** o admin / backend do Gui que reusar essas chaves tem que preservá-las OU mapear via
  alias. O `_copy-inventory.md` é a fonte para varredura de copy antes de qualquer correção.

### N-02. `aditionalTexts` / `biggerThen` — typos que SÃO o contrato JSON

Não são erro a corrigir: são as **chaves reais** que o app legado lê (appwide-07 L108, L132;
appwide-03 L248-253). O CONTEXT.md do admin (apps/web) já as fixa como grafia obrigatória. O
appwide-07 §1.9 propõe migração `aditionalTexts→additionalTexts` e `biggerThen→minPoints`
**só com camada de compat** (L220). Drift contratual deliberado — registrar, não "consertar".

### N-03. Drift de marca / grafia entre telas

- **Cefepima** (pediátrico, MODELO-DOSE L52/§3) vs **Cefepime** (adulto, MODELO-ANTIBIOTICOS L64;
  02c L353). Mesma droga, duas grafias — agrava C-01.
- **Koide D® / Kóide® / Koide D** (MODELO-DOSE L34 "Prednisona (Kóide®)" vs L41 "Koide D®" vs
  raw/01d L266) — Kóide (Prednisona) e Koide D (corticoide pediátrico) são produtos DIFERENTES com
  grafias colidentes. Risco de confusão de cadastro. Flag.
- **Penicilina G Benzatina/Cristalina/Procaina** — Procaina sem cedilha/acento; "Penicilina G"
  consistente, mas ver D-04.
- **"Ondansentrona"** (appwide-01 L119) vs **Ondansetrona** (MODELO-DOSE L9/L162) — droga adulta
  (enxaqueca) grafada com "n" extra. Drift entre app adulto e pediátrico.
- **"Zolmitripatano"** (appwide-01 L119, typo) vs Zolmitriptano (mesma linha, L121).

### N-04. `presetTemplate` legados — drift JÁ resolvido pelo normalize (ok)

`padrao-a→peso`, `padrao-b→renal`, `padrao-c→simples`, `padrao-d→calculada`, `crcl→renal`
(antibioticosModel.js L49-55, PRESET_LEGACY). Valor desconhecido passa cru; enum do schema fixa os
7 canônicos. Não é problema aberto — é drift controlado. Registrado para o Gui não reintroduzir os
nomes legados.

---

## 4. CAMPOS MORTOS / DEAD GETTERS

### D-01. `doseTipo` — campo morto dentro de posologia (controlado, ok)

`doseTipo` "morreu do modelo": `defaultPosologia` o deleta (antibioticosModel.js L160), o schema o
PROÍBE dentro de posologia (`"doseTipo": false`, antibioticos.schema.json L196), mas TOLERA no topo
do item via spread (schema x-validacoes L29). Estado consistente e documentado — não é bug, é
legado tolerado. Listado por completude.

### D-02. Fluconazol: `pesoX4`/`pesoX6` carregados mas não consumidos (dead getter)

"Fluconazol: controller carrega `pesoX4`/`pesoX6` que o build não consome (dead getters)"
(MODELO-ANTIBIOTICOS §7 L388). Sugere que o Fluconazol já teve lógica por peso e virou dose fixa,
deixando getters órfãos. Flag: confirmar se a dose por peso era a intenção clínica (hoje a tela é
`renal` simples). Evidência MODELO-ANTIBIOTICOS §7.

### D-03. CKD-EPI 2021 completo no controller, NÃO renderizado

- Clearance pediátrico: "o controller também tem CKD-EPI 2021 completo (não exibido nesta tela)"
  (raw/05 L77, L284); a tela mostra só Schwartz + Cockcroft.
- Clearance adulto: a tela renderiza CKD-EPI 2021 + 2009 + Cockcroft (appwide-03 §2.2), então lá NÃO
  é morto — mas no pediátrico É código carregado e não exposto.
- **Dead code clínico:** uma implementação de fórmula renal completa que o usuário nunca vê.
  Decisão de produto: expor ou remover. Evidência raw/05 L77.

### D-04. Penicilina Procaina reusa a chave de prescrição da Cristalina

"Penicilina Procaina... reusa a chave `penicilina.g.cristalina.prescription` (copy/paste; não
afeta texto exibido, mas é acoplamento frágil)" — MODELO-DOSE F-27. Se a string da Cristalina
mudar, a Procaina muda junto silenciosamente. Acoplamento morto a vigiar. Evidência MODELO-DOSE
§7 F-27.

### D-05. `toJson` emite menos campos que `fromJson` lê (Category)

`co` (toJson) emite `name/id/equations/subcategories` (4); `fromJson` lê também `route`/`icon`
(6) — appwide-07 L43-55, §PADRÕES L266 ("confiar no superset do fromJson, não no toJson"). `route`
e `icon` são "mortos no emit": existem na leitura mas não na escrita do próprio app. O backend do
Gui deve modelar pelo superset, ou perde `route`/`icon` no round-trip. Evidência appwide-07 §1.2.

> Outros campos transversais que o schema do admin NÃO consome mas existem no AS-IS: `regraCalculo`
> (proposto, NOVO, opcional — MODELO-ANTIBIOTICOS §6.3) e os campos pediátricos futuros
> (`pediatria{dosePorKgDia,...}`) — não são "mortos", são gaps de schema (admin-spec/01 §3 gap 3).

---

## 5. ÓRFÃOS

### O-01. Diclofenaco (Cataflam®) — built-but-unwired (pediátrico)

Widget `EquationDiclofenacoPediatra` (`adL`/`a7B`) totalmente funcional no bundle, **ausente da
lista `/pediatra/aine`** (que só lista Cetoprofeno, Ibuprofeno, Nimesulida). Não navegável. Apr.
"Suspensão gotas 15 mg/mL". Evidência func-01 L128-136, raw/01a L260-287/L492, _orphan-sweep §1,
_coverage-matrix L139. Resolve o GAP que a matriz listava como "NÃO encontrado".
- **Cético:** o adulto usa "Diclofenaco **75 mg IM**" na enxaqueca (appwide-01 L113) — apresentação
  e via totalmente diferentes da gota pediátrica 15 mg/mL. Não é a mesma tela; não há contradição,
  mas confirma que Diclofenaco vive em 2 contextos. Decisão: religar no menu ped ou arquivar.

### O-02. 38 antibióticos adultos "Diluições e Doses" — módulo órfão

Sistema de rotas 2 (prefixo `/<slug>`), calculadora renal adulto, **desconectado do menu
pediátrico** (02c, _coverage-matrix L142). São a base dos 38 do admin de antibióticos
(MODELO-ANTIBIOTICOS §2). Órfãos no app B2C, mas é exatamente o conteúdo-alvo do admin. Evidência
02c L47 ("por isso o módulo nunca foi religado").

### O-03. Saccharomyces boulardii (Floratil®) + Zinco — acordeão sem rota própria

Sub-itens da tela única `/pediatra/antidiarreicos`, URL = null (_coverage-matrix L140-141,
_orphan-sweep §1). Zinco tem FLAG adicional: widget sem seções Apresentação/Cuidados
(_coverage-matrix L141). Boulardii é "ÓRFÃO de produto" (gap aberto, citado na MEMORY como
`project_zinco_antidiarreicos_migracao`). Decisão de produto pendente (migração IA pediátrica).

### O-04. 4 telas adultas no bundle pediátrico (contaminação, não órfão pediátrico)

Metoprolol (3377435), Flumazenil (3650630), Naloxona/overdose (3652294), Albumina/paracentese
(3677045) usam a âncora "Apresentação" mas são do **app adulto** (_orphan-sweep §3). NÃO documentar
como pediatria. Risco: extração futura pode reclassificá-las erroneamente como ped — flag para a
matriz. Nota: Flumazenil/Naloxona também vivem em `antidotos` adulto (appwide-04 §E) e Albumina em
`cirrose` (appwide-01 §A4) — mesmas telas, dois pontos de entrada.

### O-05. Gating premium NÃO existe por conteúdo (campo ausente)

O paywall é **global na assinatura** (`A.zl {premium, expirationDate}`, appwide-07 §1.7); NÃO há
flag premium por calculadora/droga. Múltiplos docs flagam "premium indeterminado" por feature
(appwide-02 L181, appwide-04 L211, appwide-01 L16, MODELO-ANTIBIOTICOS §7 "Premium por-droga: sem
flag"). **Implicação:** se o produto quiser calc premium individual, o schema precisa de campo novo
(`access.level`/`isPremium`) que hoje não existe (appwide-07 §1.9 nota 3). Não é bug — é capacidade
ausente, consistente em todo o app. Listado porque vários agentes o marcaram como incerteza.

---

## 6. CONSISTÊNCIAS CONFIRMADAS (controle negativo — o que NÃO diverge)

Cético também sobre falsos positivos. Estas baterias casaram entre fontes:

- **Holliday-Segar** (hidratação ped): 100/1000+(peso-10)/1500+(peso-20) consistente (raw/04
  L28-30); a fórmula adulta de manutenção não existe (eixo só pediátrico) — sem conflito.
- **Adrogué-Madias / ACT por sexo-idade** (Na): único ponto de verdade (appwide-02 §5); não
  duplicado.
- **Cockcroft-Gault fórmula** (não o rótulo): o NUMERADOR/DENOMINADOR é idêntico em todas as ~16
  cópias (appwide-06 L13 "literal idêntica"); a divergência é só rótulo (C-06) e duplicação (drift),
  não valor.
- **`biggerThen` como inteiro default 0** e estrutura `Score/Question/Option/ResultVariation`:
  idêntica entre appwide-03 §4.2, appwide-07 §1.5 e o Admin de Escores. Só o COMPARADOR diverge
  (C-02), não o modelo.
- **Nota de diálise** "Nos dias de diálise, administre após o término da diálise" — string única
  `u.E` reusada (appwide-06 L29), consistente por design (não é copy-paste acidental).
- **Vasoativas — lista de 8 drogas** idêntica nos modos Volume/Vazão (raw/04 L89-97) e coerente com
  a ordem adulta (appwide-04 §B, que tem 10 — ped tem 8, sem Levosimendan/Azul de Metileno; é
  subconjunto, não conflito; raw/04 L169 já flagou).

---

## 7. Ações recomendadas (priorizadas)

| Prioridade | Ação | Dono | Achado |
|---|---|---|---|
| ~~P0~~ resolvido | `c.b` Meses/Anos (F-09): RESOLVIDO contra bundle — Meses=1/Anos=2 uniforme, sem inversão. Não bloqueia. | (fechado 2026-06-21) | U-03 |
| P0 | Comparador de `biggerThen` (`>` vs `>=`): NÃO isolado no bundle; intenção do admin React = `>=`. Ratificar com Gustavo + teste de borda `total==biggerThen` | Gustavo + Gui | C-02 |
| P0 | Chave de unicidade do conteúdo clínico DEVE incluir `publico` (ped vs adulto) | Gui (schema) | C-01 |
| P1 | `tipo ∈ {clamp, texto}` por teto; lista dos ~14 clamps reais | Gustavo (clínico) | U-04 |
| P1 | Sulfato Mg: corrigir mg/dL vs mg/mL | Gustavo | U-02 |
| P1 | `useCockcroft` único + decidir rótulo mL/min vs mL/min/1,73m² | Gui | C-06 |
| P1 | Gates de idade no limiar 12m/1a (Diclofenaco/Bromoprida/Dimenidrato/Ondansetrona) | Gustavo + Gui | C-03, F-06, F-07 |
| P2 | Decidir destino dos órfãos: Diclofenaco (religar/arquivar), Zinco/Boulardii (migração), 38 ATB (admin) | Luis/produto | O-01..O-03 |
| P2 | Confirmar tetos vasoativos ped vs adulto (fator ~8) | Gustavo | C-05 |
| P2 | Dead getters: Fluconazol pesoX4/6, CKD-EPI 2021 ped — expor ou remover | Gui | D-02, D-03 |
| P3 | Camada de compat para typos de contrato (`aditionalTexts`/`biggerThen`) na migração backend | Gui | N-02 |
| P3 | Vigiar acoplamento Procaina↔Cristalina (chave de prescrição compartilhada) | Gui | D-04 |

> Nota de método: contradições de LÓGICA (C-02, C-03, F-06/07/09) têm prioridade sobre drift de
> NOME porque mudam o resultado clínico exibido. Drift de nome (N-*) é contrato/migração: registrar
> e preservar, não "consertar" sem alias. Onde a divergência pode ser artefato de ofuscação
> (C-04, C-05, D-03), está marcado como FLAG de revisão, não como bug confirmado.
