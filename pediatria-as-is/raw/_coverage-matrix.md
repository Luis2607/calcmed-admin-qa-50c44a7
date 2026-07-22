# Pediatria As-Is — Matriz de Cobertura (FINAL)

> **Crítico de Completude FINAL — auditoria 2026-06-20 (reescrita).** Cruzamento das **101 rotas** (`_route-tree.txt`) contra TODOS os docs `.md` de conteúdo em `raw/`.
> Docs auditados: `00b-estrutura-navegacao.md` (nav/arquitetura/padrões), `01-sintomaticos.md` (índice de sintomáticos), `01a` (antitérmicos/AINE/antieméticos), `01b` (antihistamínicos/antiespasmódico/antidiarreicos), `01c` (broncodilatadores), `01d` (laxativos/corticóides), `02a` (antibióticos A–C), `02b` (antibióticos G–V = D–Z), `02c` (antibióticos órfãos built-but-unwired), `03a` (diarreia/asma/convulsiva), `03b` (anafilaxia/hipo/brady/taqui), `03c` (PCR/intubação/VM), `04` (diluições e doses), `05` (calculadoras/conversores/informações/doses-pediátricas).

## Legenda de status
- **CONTEÚDO** — tela documentada com conteúdo clínico/UI dedicado (verbatim, droga-a-droga ou tela-a-tela), incluindo apresentação/dose/prescrição/cuidados/inputs/templates de cálculo.
- **CONTEÚDO (flag)** — documentada, mas com uma lacuna sinalizada (ex.: tabela embutida em imagem JPG).
- **FALTA** — rota sem conteúdo clínico dedicado em nenhum doc.

## Resumo
- **Total de rotas:** 101 (94 `/pediatra/*` + 7 conversores `/equation/*`).
- **CONTEÚDO dedicado:** **101/101**.
- **FALTA:** **0**.
- **Cobertura real de CONTEÚDO:** **101/101 = 100%**.
- Telas órfãs (built-but-unwired) **também** documentadas, embora não façam parte das 101 rotas navegáveis: Diclofenaco (01a), Saccharomyces boulardii/Floratil + Zinco (01b, acordeão de `/pediatra/antidiarreicos`), e o módulo adulto "Diluições e Doses" de antibióticos hospitalares (02c, 38 telas órfãs).

---

## Matriz rota → arquivo → status

| Rota | Arquivo | Status |
|---|---|---|
| /pediatra/aine | 01a (Anti-inflamatórios, lista) | CONTEÚDO |
| /pediatra/aine/cetoprofeno | 01a (Cetoprofeno) | CONTEÚDO |
| /pediatra/aine/nimesulida | 01a (Nimesulida) | CONTEÚDO |
| /pediatra/anafilaxia | 03b (Anafilaxia) | CONTEÚDO |
| /pediatra/antibioticos | 02a (lista A–C) + 02b (G–V) | CONTEÚDO |
| /pediatra/antibioticos/acetilcefuroxima | 02a | CONTEÚDO |
| /pediatra/antibioticos/albendazol | 02a | CONTEÚDO |
| /pediatra/antibioticos/amicacina | 02a | CONTEÚDO |
| /pediatra/antibioticos/amoxicilina | 02a | CONTEÚDO |
| /pediatra/antibioticos/amoxicilina-clavulanato | 02a | CONTEÚDO |
| /pediatra/antibioticos/amoxicilina-sulbactam | 02a | CONTEÚDO |
| /pediatra/antibioticos/ampicilina | 02a | CONTEÚDO |
| /pediatra/antibioticos/ampicilina-sulbactam | 02a | CONTEÚDO |
| /pediatra/antibioticos/azitromicina | 02a | CONTEÚDO |
| /pediatra/antibioticos/cefalexina | 02a | CONTEÚDO |
| /pediatra/antibioticos/cefepima | 02a | CONTEÚDO |
| /pediatra/antibioticos/ceftriaxone | 02a | CONTEÚDO |
| /pediatra/antibioticos/cefuroxima | 02a | CONTEÚDO |
| /pediatra/antibioticos/claritromicina | 02a | CONTEÚDO |
| /pediatra/antibioticos/gentamicina | 02b (Gentamicina) | CONTEÚDO |
| /pediatra/antibioticos/mebendazol | 02b (Mebendazol) | CONTEÚDO |
| /pediatra/antibioticos/meropenem | 02b (Meropenem) | CONTEÚDO |
| /pediatra/antibioticos/metronidazol | 02b (Metronidazol) | CONTEÚDO |
| /pediatra/antibioticos/penicilina-g-benzatina | 02b (Penicilina G Benzatina) | CONTEÚDO |
| /pediatra/antibioticos/penicilina-g-cristalina | 02b (Penicilina G Cristalina) | CONTEÚDO |
| /pediatra/antibioticos/penicilina-procaina | 02b (Penicilina Procaina) | CONTEÚDO |
| /pediatra/antibioticos/secnidazol | 02b (Secnidazol) | CONTEÚDO |
| /pediatra/antibioticos/vancomicina | 02b (Vancomicina) | CONTEÚDO |
| /pediatra/antidiarreicos | 01b (tela única; Floratil + Zinco em acordeão) | CONTEÚDO |
| /pediatra/antiemetico | 01a (Antieméticos, lista) | CONTEÚDO |
| /pediatra/antiemetico/bromoprida | 01a (Bromoprida) | CONTEÚDO |
| /pediatra/antiemetico/dimenidrato | 01a (Dimenidrato) | CONTEÚDO |
| /pediatra/antiemetico/metoclopramida | 01a (Metoclopramida — só aviso) | CONTEÚDO |
| /pediatra/antiemetico/ondansetrona | 01a (Ondansetrona) | CONTEÚDO |
| /pediatra/antiespasmodico | 01b (Antiespasmódico, lista) | CONTEÚDO |
| /pediatra/antiespasmodico/colidis | 01b (Colidis®) | CONTEÚDO |
| /pediatra/antiespasmodico/escopolamina | 01b (Escopolamina/Buscopan®) | CONTEÚDO |
| /pediatra/antiespasmodico/simeticona | 01b (Simeticona) | CONTEÚDO |
| /pediatra/antihistaminicos | 01b (tela única, 7 drogas em acordeão) | CONTEÚDO |
| /pediatra/antitermicos-analgesicos | 01a / 01 (lista) | CONTEÚDO |
| /pediatra/antitermicos-analgesicos/dipirona | 01a (Dipirona) | CONTEÚDO |
| /pediatra/antitermicos-analgesicos/ibuprofeno | 01a (Ibuprofeno, compartilhado c/ AINE) | CONTEÚDO |
| /pediatra/antitermicos-analgesicos/paracetamol | 01a (Paracetamol) | CONTEÚDO |
| /pediatra/bradicardia | 03b (Bradicardia) | CONTEÚDO |
| /pediatra/broncodilatadores | 01c (lista) | CONTEÚDO |
| /pediatra/broncodilatadores/abrilar | 01c (Abrilar®) | CONTEÚDO |
| /pediatra/broncodilatadores/acebrofilina | 01c (Acebrofilina) | CONTEÚDO |
| /pediatra/broncodilatadores/brometo-ipratropio | 01c (Brometo de Ipratrópio) | CONTEÚDO |
| /pediatra/broncodilatadores/fenoterol | 01c (Fenoterol) | CONTEÚDO |
| /pediatra/broncodilatadores/montelucaste | 01c (Montelucaste) | CONTEÚDO |
| /pediatra/broncodilatadores/salbutamol | 01c (Salbutamol) | CONTEÚDO |
| /pediatra/broncodilatadores/sulfato-magnesio | 01c (Sulfato de Magnésio) | CONTEÚDO |
| /pediatra/broncodilatadores/terbutalina | 01c (Terbutalina) | CONTEÚDO |
| /pediatra/clearance-de-creatinina | 05 (Clearance — Schwartz + Cockroft-Gault) | CONTEÚDO |
| /pediatra/conversor/mLh-mcgKgMin | 05 §1 (Conversor mL/h → mcg/kg/min) | CONTEÚDO |
| /pediatra/corticoides | 01d (Corticóides, lista) | CONTEÚDO |
| /pediatra/corticoides/budesonida | 01d (Budesonida) | CONTEÚDO |
| /pediatra/corticoides/dexametasona | 01d (Dexametasona + Koide D, FLAG dispatcher) | CONTEÚDO |
| /pediatra/corticoides/fluticasona | 01d (Fluticasona/Avamys®) | CONTEÚDO |
| /pediatra/corticoides/hidrocortisona | 01d (Hidrocortisona) | CONTEÚDO |
| /pediatra/corticoides/metilprednisolona | 01d (Metilprednisolona/Solu-Medrol®) | CONTEÚDO |
| /pediatra/corticoides/prednisolona | 01d (Prednisolona) | CONTEÚDO |
| /pediatra/corticoides/prednisona | 01d (Prednisona/Kóide®) | CONTEÚDO |
| /pediatra/crise-asma | 03a (Exacerbação de Asma — classificação) | CONTEÚDO |
| /pediatra/crise-asma/grave | 03a (Asma — Grave) | CONTEÚDO |
| /pediatra/crise-asma/leve-moderada | 03a (Asma — Leve a Moderada) | CONTEÚDO |
| /pediatra/crise-convulsiva | 03a (Crise Convulsiva — 6 drogas) | CONTEÚDO |
| /pediatra/custom-solutions/ | 04 (Soluções Personalizadas — lista) | CONTEÚDO |
| /pediatra/custom-solutions/flow-rate | 04 (Cálculo por Vazão) | CONTEÚDO |
| /pediatra/custom-solutions/flow-rate/ | 04 (Cálculo por Vazão — item salvo) | CONTEÚDO |
| /pediatra/custom-solutions/oral/ | 04 (Solução Oral) | CONTEÚDO |
| /pediatra/custom-solutions/oral/new | 04 (Solução Oral — criação) | CONTEÚDO |
| /pediatra/custom-solutions/volume | 04 (Cálculo por Volume) | CONTEÚDO |
| /pediatra/custom-solutions/volume/ | 04 (Cálculo por Volume — item salvo) | CONTEÚDO |
| /pediatra/diarreia-na-crianca | 03a (Diarreia na Criança — Planos A/B/C + ATB + antidiarreicos) | CONTEÚDO |
| /pediatra/doses-pediatricas/new | 05 (Doses Pediátricas — formulário Novo) | CONTEÚDO |
| /pediatra/doses-pediatricas/view/ | 05 (Doses Pediátricas — visualização/edição) | CONTEÚDO |
| /pediatra/drogas-vasoativas | 04 (Drogas Vasoativas — 8 drogas, 2 modos) | CONTEÚDO |
| /pediatra/drogas-vasoativas/vazao | 04 (Por Vazão) | CONTEÚDO |
| /pediatra/drogas-vasoativas/volume | 04 (Por Volume) | CONTEÚDO |
| /pediatra/hidratacao-manutencao | 04 (Hidratação — Manutenção, Holliday-Segar) | CONTEÚDO |
| /pediatra/hipoglicemia | 03b (Hipoglicemia) | CONTEÚDO |
| /pediatra/informations/sinais-vitais-normais | 05 (Sinais Vitais Normais) | CONTEÚDO (flag: tabela embutida em `fluxograma_sinais_vitais.jpg`, exige OCR) |
| /pediatra/intubacao | 03c (Intubação — Steps 1–5) | CONTEÚDO |
| /pediatra/ketodex | 04 (Ketodex — 2 variantes etárias) | CONTEÚDO |
| /pediatra/ketofol | 04 (Ketofol) | CONTEÚDO |
| /pediatra/laxativos | 01d (Laxativos, lista) | CONTEÚDO |
| /pediatra/laxativos/glicerina | 01d (Glicerina) | CONTEÚDO |
| /pediatra/laxativos/hidroxido-magnesio | 01d (Hidróxido de magnésio) | CONTEÚDO |
| /pediatra/laxativos/lactulose | 01d (Lactulose) | CONTEÚDO |
| /pediatra/laxativos/macrogol-3350 | 01d (Macrogol 3350) | CONTEÚDO |
| /pediatra/laxativos/oleo-mineral | 01d (Óleo mineral) | CONTEÚDO |
| /pediatra/pcr | 03c (PCR — calculadora Cargas e Doses, 5 abas) | CONTEÚDO |
| /pediatra/pcr/adrenalina | 03c (Adrenalina) | CONTEÚDO |
| /pediatra/pcr/amiodarona | 03c (Amiodarona) | CONTEÚDO |
| /pediatra/pcr/carga-choque | 03c (Carga do choque para desfibrilação) | CONTEÚDO |
| /pediatra/pcr/lidocaina | 03c (Lidocaína) | CONTEÚDO |
| /pediatra/pcr/sulfato-magnesio | 03c (Sulfato de Magnésio) | CONTEÚDO |
| /pediatra/superficie-corporal | 05 (Superfície Corporal — Mosteller/Costeff) | CONTEÚDO |
| /pediatra/taquicardia | 03b (Taquicardia) | CONTEÚDO |
| /pediatra/ventilacao-mecanica | 03c (Ventilação Mecânica) | CONTEÚDO |
| /equation/category/conversor-corticoides | 05 §7 (Conversor de Corticóides) | CONTEÚDO |
| /equation/category/conversor-mcg-mlh | 05 §2 (mcg/kg/min → mL/h) | CONTEÚDO |
| /equation/category/conversor-mcgmin-mlh | 05 §6 (mcg/min → mL/h) | CONTEÚDO |
| /equation/category/conversor-mlh-gtsmin | 05 §3 (mL/h <-> gts/min) | CONTEÚDO |
| /equation/category/conversor-mlh-mcg | 05 §1 (mL/h → mcg/kg/min) | CONTEÚDO |
| /equation/category/conversor-mlh-mcgmin | 05 §5 (mL/h → mcg/min) | CONTEÚDO |
| /equation/category/conversor-porcentagem-mgml | 05 §4 (% → mg/mL) | CONTEÚDO |

---

## Telas órfãs (built-but-unwired) — documentadas, fora das 101 rotas

| Item órfão | Onde vive hoje | Doc | Status |
|---|---|---|---|
| Diclofenaco (Cataflam®) | Widget `EquationDiclofenacoPediatra` no bundle, **sem entrada** na lista `/pediatra/aine` (que só lista Cetoprofeno, Ibuprofeno, Nimesulida). Não navegável. | 01a §"ÓRFÃO — Diclofenaco" | DOCUMENTADO (verbatim: inputs, apresentação, dose usual, prescrição, contraindicação, cuidados) |
| Saccharomyces boulardii (Floratil®) | Acordeão da tela única `/pediatra/antidiarreicos` (sub-item sem rota própria, URL = null) | 01b §Antidiarreicos | DOCUMENTADO (apresentação + prescrição + cuidados) |
| Zinco | Acordeão da tela única `/pediatra/antidiarreicos` (sub-item sem rota própria, URL = null) | 01b §Antidiarreicos | DOCUMENTADO (prescrição; FLAG: widget sem seções Apresentação/Cuidados) |
| Antibióticos hospitalares adulto (38 telas: aciclovir, anfotericina B, caspofungina, ceftazidima, ciprofloxacin, clindamicina, daptomicina, doxiciclina, fluconazol, ganciclovir, imipenem, levofloxacin, linezolida, micafungina, oxacilina, piperacilina-tazobactam, polimixina B, sulfametoxazol-trimetoprima, teicoplanina, etc.) | Módulo "Diluições e Doses" (sistema de rotas 2, prefixo `/<slug>`, calculadora de dose renal adulto), **desconectado** do menu pediátrico | 02c (lista + mapeamento + modal de aviso) | DOCUMENTADO como órfão adulto-orientado; NÃO faz parte da pediatria navegável |

---

## Telas órfãs documentadas (lista, conforme solicitado pela task)
- Diclofenaco (01a)
- Saccharomyces boulardii / Floratil (01b)
- Zinco (01b)
- Módulo antibióticos órfãos adulto — 02c (38 telas built-but-unwired)

---

## Conclusão
A auditoria **as-is de conteúdo** (extração verbatim droga-a-droga / tela-a-tela) cobre **100% (101/101)** das rotas navegáveis da pediatria. Não há rota sem conteúdo clínico dedicado. A única ressalva (não-bloqueante) é a tela **Sinais Vitais Normais**, cuja tabela FC/FR/PA por faixa etária está embutida em imagem JPG (`fluxograma_sinais_vitais.jpg`) e exigiria OCR para transcrição textual — a rota, inputs e arquitetura estão documentados, mas os números da tabela vivem na imagem. As telas órfãs (Diclofenaco, Floratil/Zinco, módulo antibióticos adulto) estão todas documentadas por fidelidade, embora não componham as 101 rotas do menu.

> Auditoria anterior (3 docs, ~17,8%) substituída por esta versão FINAL após conclusão dos docs 01a–01d, 02a–02c, 03a–03c, 04 e 05.
