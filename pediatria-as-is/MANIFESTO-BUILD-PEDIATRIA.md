---
tipo: manifesto-de-build
produto: CalcMed — Urgência e Emergência (B2C)
modo: Pediatria
data: 2026-06-22
autor: sintetizador (4 lentes consolidadas)
status: ATIVO — pronto para fan-out
fontes-de-verdade:
  - as-is verbatim → CalcMed Urgencia/pediatria-as-is/raw/ (01a..05b)
  - mapa as-is → CalcMed Urgencia/pediatria-as-is/00_ARQUITETURA_INFORMACAO.md (101/101 rotas)
  - arquétipos de dose → CalcMed Urgencia/pediatria-as-is/MODELO-DOSE-PEDIATRICA.md
  - gap visual → CalcMed Urgencia/pediatria-as-is/gap-figma-vs-asis.md
  - escopo/backend → CalcMed Urgencia/pediatria-as-is/PRODUTO-RELEASE.md + escopo-congelado-release-2.0.md
  - molde de tela → apps/web/src/admin/modules/antibioticos/AntibioticoTelaPreview.jsx
  - DS React → apps/web/src/shared/components/
  - padrão-ouro de qualidade → as 5 centrais React (cad/sca/sepse/pcr/avc)
regra-Q7: cada tela clínica aponta o arquivo raw/ VERBATIM. Zero invenção de dose/escore.
---

# Manifesto de Build — Pediatria CalcMed (React, App B2C)

> **Tese.** A pediatria é uma **rota top-level** (`/pediatra/*`), ~90 telas de conteúdo, montadas sobre **3 moldes reusáveis** (tela de droga por peso · lista categoria→drogas · conversor) + **DS React já existente**. O conteúdo clínico é **VERBATIM do as-is** (`raw/`), **nunca inventado**. O build começa pelos itens **P0 livres no free** (Anafilaxia, Hipoglicemia, Conversores, Corticóides) que validam o pipeline **sem paywall e sem depender da ponte admin→app**.
>
> **Norte de craft:** as 5 centrais React são o padrão-ouro. **Não tocar nelas.** A pediatria só ADICIONA branches/arquivos novos (ver `GUARD — Isolamento das 5 centrais`).

---

## Sumário executivo (o que ler primeiro)

1. **Marco 0 (BLOQUEANTE):** decidir o runtime da dose — data-driven (lê admin) vs hardcoded. Recomendação: **renderer data-driven único** consumindo `seed.pediatricos.js`/`seed.sintomaticos.js` como fixture até a ponte E-01 existir. Decisão na planning 22/06.
2. **Primeira leva (fan-out agora):** Anafilaxia → Hipoglicemia → 7 Conversores → 7 Corticóides. Tudo **livre no free**, **single-screen ou molde simples**, **zero dep entre telas**.
3. **3 moldes carregam ~90 telas:** `PediatriaDrugScreen` (dose por peso), `PediatriaCategoryList` (categoria→lista), `ConverterScreen` (conversor). Esgotar reuso ANTES de criar qualquer componente novo (regra absoluta).
4. **Backend:** a peça central é a **ponte admin→app (E-01)** — hoje o app NÃO lê o admin em runtime. Até existir, **fallback = seed embarcado** (mesmo conteúdo). Gate de publicação de dose ped é **adulto-only hoje** → decisão de produto + revisão médica do Gustavo antes de publicar.

---

## SEÇÃO 1 — Catálogo de TODAS as telas pediátricas

Convenção: **estado** = `so-as-is` (só conteúdo as-is) · `existe-prototipo` (Figma desenhado / React preview) · `so-figma` (Figma ✅, sem React) · `gap-anotado` (decisão/gap aberto) · `componente` (molde/infra). Coluna **fonte** = arquivo raw/ verbatim (Q7) + Figma quando há. 🪣1 = replicar molde existente · 🪣2 = bespoke (nunca desenhado).

### 1.0 Chassi (home + navegação + busca)

| Tela | Tipo | Fonte verbatim (as-is) | Figma | Componentes | Gap | Prio |
|---|---|---|---|---|---|---|
| Home Pediátrica (11 blocos) | home | `00_ARQUITETURA §2` + `raw/00b §nav` | DS V2 `3673:2` | Home.jsx (deriva), SectionLabel, FeatureCard | Braço ped da Home V2 não renderiza conteúdo ped; trocar catálogo p/ 11 blocos quando `isPediatricMode=true` | **P0** |
| Navegação / Roteamento ped | outro | `00_ARQUITETURA §1` + `raw/_route-tree.txt` (101 rotas) | — | App.jsx switch | `/pediatra/*` é rota top-level (não toggle). Mapear 94 `/pediatra/*` + 7 `/equation/*` em registro tabular | **P0** |
| Busca Pediátrica | outro | `raw/00b §6` ("O que você precisa hoje?") | search-input `354:111785` | InputField, índice unificado | Ponto de entrada mais forte (~90 destinos); tela de resultados não existe | **P0** |
| Tab bar inferior (Início/Busca/Escala/IA/Menu) | componente | `Home.jsx NAV` | nav/tab-bar `90:574` | TabBar | Já existe; ligar Escala→Passômetro e Menu→sidebar real | P2 |

### 1.1 Sintomáticos — Antitérmicos / AINE / Antieméticos (raw/01a)

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Antitérmicos e Analgésicos — Lista | lista | `raw/01a` + `00_ARQ §3` | — | Dipirona·Paracetamol·Ibuprofeno (padrão tela 1) | **P0** |
| Paracetamol | sintomatico | `raw/01a` + `func-01` (peso-computado, teto efetivo 35) | section Paracetamol (Vazio/Preench +Dark) | Replicar 1:1. **Bug as-is `weightLimitedTo30`/teto 35 → preservar verbatim** | **P0** |
| Ibuprofeno | sintomatico | `raw/01a` + `func-01` (gate `isAgeOver6Months`, 3 apresent. 50/100/200) | section Ibuprofeno (Vazio/Preench +Dark) | Aparece em 2 rotas (Antitérmicos E AINE) = **mesmo widget**; estado Contraindicado (gate idade) | **P0** |
| Dipirona | sintomatico | `raw/01a` + `func-01` + `MODELO-DOSE §2.2` (lookup por PESO, 6 faixas; <3m ou <5kg → Contraindicado; ≥53kg → "Avalie dose adultos") | falta (🪣1) | Lookup por faixa de peso, não aritmética | P1 |
| Anti-inflamatórios (AINE) — Lista | lista | `raw/01a` | — | Cetoprofeno·Nimesulida·Ibuprofeno(compart.); Diclofenaco=órfão | P1 |
| Cetoprofeno | sintomatico | `raw/01a` + `func-01` (híbrido) | falta (🪣1) | — | P1 |
| Nimesulida | sintomatico | `raw/01a` + `func-01` (híbrido) | falta (🪣1) | — | P1 |
| Diclofenaco (Cataflam®) — **ÓRFÃO** | sintomatico | `raw/01a §ÓRFÃO` + `MODELO-DOSE §2.3` | — | Widget completo no bundle, SEM entrada na lista AINE. **DECISÃO: ligar ou remover** | P2 |
| Antieméticos — Lista | lista | `raw/01a` | — | Bromoprida·Metoclopramida·Ondansetrona·Dimenidrato | P1 |
| Dimenidrato | sintomatico | `raw/01a` + `func-02` (híbrido) | section Dimenidrato (Vazio/Preench/Contraind +Dark) | **Bug as-is: texto "6 anos+" sem "+" → preservar** | **P0** |
| Bromoprida | sintomatico | `raw/01a` + `func-02` (híbrido) | falta (🪣1) | — | P1 |
| Ondansetrona | sintomatico | `raw/01a` + `func-02` (híbrido) | falta (🪣1) | — | P1 |
| Metoclopramida — **SÓ AVISO** | sintomatico | `raw/01a §Metoclopramida` + `MODELO-DOSE §so-aviso` (Discinesia Tardia) | — | Item de menu SEM calc: renderiza só bloco Cuidados. **DECISÃO: aviso ou virar calc** | P2 |

### 1.2 Sintomáticos — Antihistamínicos / Antiespasmódico / Antidiarreicos (raw/01b)

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Antihistamínicos — **tela única (acordeão 7 drogas)** | sintomatico | `raw/01b §Antihist` + `func-03` (lookup; Hidroxizina=peso-computado) | falta inteira (🪣1) | Sub-itens SEM rota: Cetirizina·Dexclorfeniramina·Desloratadina·Fexofenadina·Hidroxizina(input peso)·Loratadina·Ebastina. Usar DisclosureCard | P1 |
| Antiespasmódico — Lista | lista | `raw/01b §Antiespasm` | — | Escopolamina·Simeticona·Colidis (rota por-droga) | P1 |
| Escopolamina (Buscopan®) | sintomatico | `raw/01b` + `func-02` (peso-computado) | falta (🪣1) | — | P1 |
| Simeticona | sintomatico | `raw/01b` + `func-02` (lookup) | falta (🪣1) | — | P1 |
| Colidis® | sintomatico | `raw/01b` + `MODELO-DOSE §2.4` (fixo: "5 gotas VO 1x/dia") | falta (🪣1) | Dose fixa | P1 |
| Antidiarreicos — tela única (acordeão) | conduta | `raw/01b §Antidiarreicos` | — | **DECISÃO** (`project_zinco_antidiarreicos`): categoria→conduta da Diarreia | P2 |
| Zinco | sintomatico | `raw/01b §Zinco` (FLAG: sem Apresentação/Cuidados) | section Zinco (4 frames `4:246295`) | Migração texto→calc individual; replicar em React | P1 |
| Saccharomyces boulardii (Floratil®) — **ÓRFÃO** | sintomatico | `raw/01b §Saccharomyces` | — | Órfão de produto; acordeão sem rota. NÃO bloqueia Zinco | P2 |

### 1.3 Sintomáticos — Broncodilatadores (raw/01c)

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Broncodilatadores — Lista | lista | `raw/01c` | — | 8 drogas | P1 |
| Sulfato de Magnésio (broncodilatador) | sintomatico | `raw/01c` + `func-04` (peso-computado, tetos 10%/50%) | section Sulfato de Magnesio (+Dark) | Replicar | **P0** |
| Terbutalina | sintomatico | `raw/01c` + `func-04` | section Terbutalina (Vazio/Preench/Erro Peso/Dose Excedida/Radio 24h +Dark) = **MOLDE COMPLETO de estados** | Referência de Definition of Done; template dos demais | **P0** |
| Acebrofilina | sintomatico | `raw/01c` + `func-04` (híbrido) | falta (🪣1) | — | P1 |
| Abrilar® | sintomatico | `raw/01c` + `func-04` (lookup) | falta (🪣1) | — | P1 |
| Fenoterol | sintomatico | `raw/01c` + `func-04` (lookup) | falta (🪣1) | — | P1 |
| Brometo de Ipratrópio | sintomatico | `raw/01c` + `func-04` (lookup) | falta (🪣1) | — | P1 |
| Montelucaste | sintomatico | `raw/01c` + `func-04` (lookup) | falta (🪣1) | — | P1 |
| Salbutamol | sintomatico | `raw/01c` + `MODELO-DOSE §2.4` (fixo: neb/spray) | falta (🪣1) | Dose fixa | P1 |

### 1.4 Sintomáticos — Laxativos / Corticóides (raw/01d) · Corticóides = FREE

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Laxativos — Lista | lista | `raw/01d` | — | 5 drogas | P1 |
| Macrogol 3350 | sintomatico | `raw/01d` + `func-05` (lookup) | section Macrogol 3350 (+Dark) | Replicar | **P0** |
| Lactulose | sintomatico | `raw/01d` + `func-05` (lookup) | falta (🪣1) | — | P1 |
| Hidróxido de magnésio | sintomatico | `raw/01d` + `func-05` (lookup) | falta (🪣1) | — | P1 |
| Óleo mineral | sintomatico | `raw/01d` + `func-05` (lookup) | falta (🪣1) | — | P1 |
| Glicerina | sintomatico | `raw/01d` + `func-05` (peso×10 a peso×20 mL, sem teto) | falta (🪣1) | — | P1 |
| **Corticóides — Lista** | lista | `raw/01d` | — | 7 drogas. **FREE** | **P0** |
| Dexametasona | sintomatico | `raw/01d` + `func-06` (apresentação troca template; Koide D dispatcher) | section Dexametasona (Contraind/2-6a/6-12a/>12a +Dark) = **MOLDE FAIXAS ETÁRIAS** | Replicar. **FREE** | **P0** |
| Prednisona (Kóide®) | sintomatico | `raw/01d` + `func-06` (peso-computado) | falta (🪣1) | **FREE** | P1 |
| Prednisolona | sintomatico | `raw/01d` + `func-06` (peso-computado) | falta (🪣1) | **FREE** | P1 |
| Hidrocortisona | sintomatico | `raw/01d` + `func-06` (peso-computado) | falta (🪣1) | **FREE** | P1 |
| Metilprednisolona (Solu-Medrol®) | sintomatico | `raw/01d` + `func-06` (peso-computado) | falta (🪣1) | **FREE** | P1 |
| Budesonida | sintomatico | `raw/01d` + `func-06` (lookup) | falta (🪣1) | **FREE** | P1 |
| Fluticasona (Avamys®) | sintomatico | `raw/01d` + `func-06` (lookup) | falta (🪣1) | **FREE** | P1 |

### 1.5 Antibióticos pediátricos — 23 drogas (raw/02a + raw/02b) · via molde/admin

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Antibióticos Pediatria — Lista (23) | lista | `raw/02a` + `raw/02b` | page Pediatria-Antibioticos `4732:83` | **DECISÃO: ATB vão pro ADMIN data-driven** (1 molde + cadastro); lista navegável fica no app | P1 |
| Template de Antibiótico (molde mestre + modal clearance) | componente | Figma `3019:34104` (T1-T5 + molde + modal); conteúdo `02a`+`02b`; admin `src/admin/modules` | sim | 1 molde React parametrizado por JSON do admin alimenta as 23 telas. Modal clearance renal | P1 |
| Acetilcefuroxima | antibiotico | `raw/02a` + `func-07` (peso-computado) | — | via molde/admin | P1 |
| Albendazol | antibiotico | `raw/02a` + `func-07` (híbrido) | representante | desenhado | P1 |
| Amicacina | antibiotico | `raw/02a` + `func-07` (híbrido) | representante | desenhado (4 níveis aninhados — complexa) | P1 |
| Amoxicilina | antibiotico | `raw/02a` + `func-07` (peso-computado) | representante | desenhado | P1 |
| Amoxicilina-Clavulanato | antibiotico | `raw/02a` + `func-07` (híbrido) | — | via molde/admin | P1 |
| Amoxicilina-Sulbactam | antibiotico | `raw/02a` + `func-07` (híbrido) | — | via molde/admin | P1 |
| Ampicilina | antibiotico | `raw/02a` + `func-07` (híbrido) | representante | desenhado (reconstituição + dual IM/EV) | P1 |
| Ampicilina-Sulbactam | antibiotico | `raw/02a` + `func-07` (híbrido) | — | via molde/admin | P1 |
| Azitromicina | antibiotico | `raw/02a` + `func-07` (híbrido) | — | via molde/admin | P1 |
| Cefalexina | antibiotico | `raw/02a` + `func-07` (híbrido) | — | **Bug as-is: texto "(45/6,4 mg/kg/dia)" herdado de amox-clav → preservar** | P1 |
| Cefepima | antibiotico | `raw/02a` + `func-07` (diluente fixo 50mL) | — | via molde/admin | P1 |
| Ceftriaxone | antibiotico | `raw/02a` + `func-07` (peso-computado) | — | via molde/admin | P1 |
| Cefuroxima | antibiotico | `raw/02a` + `func-07` (peso-computado) | — | via molde/admin | P1 |
| Claritromicina | antibiotico | `raw/02a` + `func-07` (híbrido) | — | via molde/admin | P1 |
| Gentamicina | antibiotico | `raw/02b` + `func-08` (peso-computado c/ ramos idade) | — | via molde/admin | P1 |
| Mebendazol | antibiotico | `raw/02b` + `func-08` (lookup) | — | via molde/admin | P1 |
| Meropenem | antibiotico | `raw/02b` + `func-08` (peso-computado c/ ramos) | — | via molde/admin | P1 |
| Metronidazol | antibiotico | `raw/02b` + `func-08` (peso-computado c/ ramos) | — | via molde/admin | P1 |
| Penicilina G Benzatina | antibiotico | `raw/02b` + `func-08` (lookup + ramo sífilis 50.000×peso teto 2.400.000) | — | via molde/admin | P1 |
| Penicilina G Cristalina | antibiotico | `raw/02b` + `func-08` (peso-computado c/ ramos) | representante | desenhado (11 indicações — complexa) | P1 |
| Penicilina Procaína | antibiotico | `raw/02b` + `func-08` (híbrido) | — | via molde/admin | P1 |
| Secnidazol | antibiotico | `raw/02b` + `func-08` (peso×1 mL, teto 66) | — | via molde/admin | P1 |
| Vancomicina | antibiotico | `raw/02b` + `func-08` (peso-computado c/ ramos) | representante | desenhado | P1 |

### 1.6 Urgências — 10 protocolos (raw/03a..03c)

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| **Anafilaxia** | urgencia | `raw/03b §Anafilaxia` (adrenalina IM dose/kg) | **NÃO existe (🪣2 bespoke)** | **FREE + emergência = buraco crítico. Design dedicado** | **P0** |
| **Hipoglicemia** | urgencia | `raw/03b §Hipoglicemia` | ✅ desenhado | **FREE**. Replicar | **P0** |
| Diarreia na Criança | conduta | `raw/03a §Diarreia` (Planos A/B/C + ATB + antidiarreicos) | section Diarreia (Plano A/B/C +Dark) | Conduta multi-step. Replicar (WIP: só Plano A + ATB preench.) | P1 |
| Exacerbação de Asma — Classificação | urgencia | `raw/03a §Asma` | section Asma (≤5/≥6 × leve-mod/grave) | → /leve-moderada · /grave | P1 |
| Asma — Leve a Moderada | urgencia | `raw/03a §Asma Leve-Mod` | variante section Asma | doses por peso por faixa | P1 |
| Asma — Grave | urgencia | `raw/03a §Asma Grave` | variante section Asma | doses por peso por faixa | P1 |
| Crise Convulsiva | urgencia | `raw/03a §Convulsiva` (6 drogas: Diazepam/Midazolam 1ª linha, Fenitoína, Fenobarbital, Midazolam infusão, Tiopental) | ✅ (verificar nodeId — não saiu no dump) | Multi-step | P1 |
| Bradicardia | urgencia | `raw/03b §Bradicardia` (Adrenalina, Atropina) | ✅ | Protocolo + doses/peso | P1 |
| Taquicardia | urgencia | `raw/03b §Taquicardia` (Adenosina 3mg/mL, Cardioversão) | ✅ | Protocolo + doses/peso + cardioversão J/kg | P1 |
| Intubação (Sequência Rápida) | urgencia | `raw/03c §Intubação` (steps 1-5 doc; Figma 1-14 mobile+web) | ✅ | Reusar padrão intubação adulto (`project_intubacao_screens`) | P1 |
| Ventilação Mecânica | urgencia | `raw/03c §VM` (VCV >12a, PCV pré-termo, sedação contínua) | ✅ | Parâmetros + sedação | P1 |
| PCR Pediátrico — Cargas e Doses | urgencia | `raw/03c §PCR` (5 abas: adrenalina/amiodarona/lidocaína/sulfato-mg/carga-choque) | _arquivo (WIP descartado) | **DECISÃO Luis 2026-06-21: PCR SAI da pediatria → Central de Urgência. NÃO duplicar**. Conteúdo verbatim preservado p/ Central | P2 |
| PCR — entrada contextual da Pediatria | outro | `gap-figma-vs-asis §Ressalva PCR` + `raw/03c` | — | Atalho/card que entra na Central JÁ em contexto ped (PALS, doses/kg, J/kg, carregando peso). Não deixar usuário órfão | P2 |

### 1.7 Diluições e Doses (raw/04)

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Hidratação - Manutenção | calculadora | `raw/04 §Hidratação` (Holliday-Segar; Neonatal + Criança + Monte a Solução) | ✅ | Replicar | P1 |
| Drogas Vasoativas — Por Vazão | calculadora | `raw/04 §DVA` (8 drogas, modo vazão) | 🟠 PARCIAL (só Noradrenalina/vazão) | 🪣1: replicar molde p/ ~7 (Adrenalina, Dopamina, Dobutamina, Nitroprussiato, Milrinona, Vasopressina…) | P1 |
| Drogas Vasoativas — Por Volume | calculadora | `raw/04 §DVA modo volume` | — | 🪣2 bespoke: Nº ampolas·mL soro·Concentração·Dose | P2 |
| Drogas Vasoativas — Hub/seletor | calculadora | `raw/04 §DVA raiz` | — | Escolha droga + modo | P1 |
| Ketofol | calculadora | `raw/04 §Ketofol` | ✅ | Replicar | P1 |
| Ketodex | calculadora | `raw/04 §Ketodex` (2 variantes etárias) | ✅ | Replicar | P1 |
| Soluções Personalizadas — Lista (CRUD) | calculadora | `raw/04 §Soluções Pers.` (Oral/Vazão/Volume; criar/salvar/editar/excluir) | — | 🪣2 bespoke: CRUD nunca desenhado | P2 |
| Solução Personalizada — Oral (criar) | calculadora | `raw/04 §Oral` | — | 🪣2: form criação | P2 |
| Solução Personalizada — Por Vazão | calculadora | `raw/04 §Vazão` | — | 🪣2 | P2 |
| Solução Personalizada — Por Volume | calculadora | `raw/04 §Volume` | — | 🪣2 | P2 |

### 1.8 Calculadoras / Conversores / Informações / Doses (raw/05 + raw/05b) · Conversores = FREE

| Tela | Tipo | Fonte verbatim | Figma | Gap | Prio |
|---|---|---|---|---|---|
| Clearance de Creatinina | calculadora | `raw/05 §Clearance` (Schwartz + Cockroft-Gault) | ✅ page Calculadoras `3:640` | Replicar | P1 |
| Taxa de Infusão | calculadora | `raw/05 §Taxa Infusão` | ✅ page Calculadoras | Compartilhada c/ adulto | P1 |
| Superfície Corporal | calculadora | `raw/05 §Superfície` (Mosteller/Costeff) | — | 🪣2 bespoke | P2 |
| Conversor — mL/h ↔ mcg/kg/min (com peso) | conversor | `raw/05 §1+§2` | ✅ page Conversores `3:643` | **FREE** | **P0** |
| Conversor — mcg/kg/min → mL/h | conversor | `raw/05 §2` | ✅ | **FREE** | **P0** |
| Conversor — mL/h ↔ gts/min | conversor | `raw/05 §3` | ✅ | **FREE** | **P0** |
| Conversor — % → mg/mL | conversor | `raw/05 §4` | ✅ | **FREE** | **P0** |
| Conversor — mL/h → mcg/min | conversor | `raw/05 §5` | ✅ | **FREE** | **P0** |
| Conversor — mcg/min → mL/h | conversor | `raw/05 §6` | ✅ | **FREE** | **P0** |
| Conversor — Corticóides | conversor | `raw/05 §7` | ✅ | **FREE** | **P0** |
| Sinais Vitais Normais | outro | `raw/05b` (transcrição FC/FR/PA por faixa do JPG) | — | **AS-IS = imagem JPG**. Construir tabela NATIVA (organism Table) a partir de 05b | P2 |
| Doses Pediátricas — Novo (CRUD) | calculadora | `raw/05 §Doses Ped` (/new + /view) | — | Form criação dose personalizada | P2 |
| Doses Pediátricas — Visualizar/Editar | calculadora | `raw/05 §Doses Ped /view` | — | Visualização/edição | P2 |

### 1.9 Gaps de produto (sem fonte as-is — NÃO inventar)

| Tela | Tipo | Fonte | Gap | Prio |
|---|---|---|---|---|
| PPS — FALTA | escore | `memory project_calc_missing` | Sem fonte as-is → definição clínica nova (Gustavo). NÃO inventar | P2 |
| Hiperglicemias — FALTA | conduta | `memory project_calc_missing` | Sem fonte as-is → conteúdo clínico novo (Gustavo). NÃO inventar | P2 |

---

## SEÇÃO 2 — Inventário de componentes (reuso DS React + moldes a criar)

> **Regra absoluta** (`feedback_evitar_redundancia_absoluto` + `feedback_inspect_existing_before_building`): esgotar reuso/variante ANTES de criar. Extensão de shared component = **aditiva** (nova prop com default), nunca alterar comportamento. Raiz: `apps/web/src/shared/components/`.

### 2.1 Componentes NOVOS a criar (escopo mínimo, code-first)

| Componente | Onde criar | Compor de | Cobre | Prio |
|---|---|---|---|---|
| **CalcHeaderPed** | `organisms/CalcHeaderPed` | InputField + Select + SelectSheet | Peso (num, "0.0", 2 dec) + Idade(valor) + dropdown Meses/Anos (**Meses>12 força 12 Anos**) + Apresentação. **Paracetamol=exceção só-Peso; Metoclopramida=sem inputs**. Figma `web/calc-header` é DEBT aberto | **P0** |
| **DrugListRow** | `molecules/DrugListRow` | portar `card/protocolo 4025:21` (molde canônico) | Linha de droga: estrela favoritar + nome + › + badge Premium/cadeado/Em breve/Novo. Padrão tela 1 (32+ telas de lista). DisclosureCard não tem estrela/badge | **P0** |
| **PediatriaDrugScreen** (renderer data-driven) | promover `admin/.../AntibioticoTelaPreview.jsx` p/ consumer | CalcHeaderPed + ClinicalCard + AlertCard + DoseDisplay + DetailRow | **TODAS as drogas** Sintomáticos+Antibióticos com 1 componente. Arquétipo (b) dose por peso | **P0** |
| **PediatriaCategoryList** | `features/pediatria/` | CalcHeaderPed(busca) + DrugListRow | Categoria→lista (Home→Lista→Drug). Padrão (a) | **P0** |
| **ConverterScreen** | `features/pediatria/` | Select + InputField + ResultDisplay | 1 molde + 7 configs p/ os 7 conversores. Padrão (d) | **P0** |
| FeatureCard → shared / ActionTile | `features/home/Home.jsx` → shared | — | Home atual define FeatureCard LOCAL não-reusável. Extrair OU usar DrugListRow/ActionTile. Não duplicar inline | P1 |

### 2.2 Componentes EXISTENTES a reusar (sem criar nada)

**Templates / shells**
| Componente | Path | Uso ped |
|---|---|---|
| ProtocolShell | `templates/ProtocolShell` | Casca canônica das Urgências multi-step (Diarreia/Asma/Convulsiva/Anafilaxia/Hipo/Bradi/Taqui/Intubação/VM). NÃO reinventar. **Aditivo, sem tocar nas 5 centrais** |
| HistoryScreen | `templates/HistoryScreen` | Aba Histórico (protocolos que salvam caso) |
| TheoryScreen | `templates/TheoryScreen` | Aba Teoria/Consulta rápida |

**Organisms — veículos de conteúdo clínico (P0)**
| Componente | Path | Uso ped |
|---|---|---|
| **ClinicalCard** | `organisms/ClinicalCard` | VEÍCULO PRINCIPAL das seções (Apresentação/Dose usual/Cuidados/contraind). `variant='plain'`; children = conteúdo verbatim raw/ |
| **AlertCard** | `organisms/AlertCard` | (1) empty-state `level='critical'` "Informe todos os dados para obter o resultado."; (2) resultado Prescrição `level='result'` (verde); `valueInput` recalcula peso dentro do card; avisos (Metoclopramida, contraind.) |
| **Table** | `organisms/Table` | Sinais Vitais Normais (raw/05b, substitui JPG), faixas peso/dose ATB. **Nunca `<table>` ad-hoc** |
| Score* (Criterion/CriterionGroup/Result/RangeTable/Actions) | `organisms/Score*` | Gravidade Asma; Diarreia Planos A/B/C |
| ChecklistBlock + SheetChecklistItem | `organisms/ChecklistBlock` | Checklists Intubação/VM. **Categorias vêm do ADMIN com limite** |
| TimerCard | `organisms/TimerCard` | Cronômetros sob demanda. **NÃO auto-iniciam exceto PCR** |
| Timeline / EventList / EventItem | `organisms/Timeline` | Registro de eventos/doses |
| ProtocolHeader | `organisms/ProtocolHeader` | Header dos protocolos (via ProtocolShell) |
| ActionFooter | `organisms/ActionFooter` | Footer aba Executar |
| PatientDetail | `organisms/PatientDetail` | Detalhe de caso salvo |

**Molecules**
| Componente | Path | Uso ped |
|---|---|---|
| **InputField** | `molecules/InputField` | Peso/Idade/valores. Entra no CalcHeaderPed |
| **Select + SelectSheet** | `molecules/Select` + `overlays/patterns/SelectSheet` | **REGRA INVIOLÁVEL: seleção 1-de-N usa Select+SelectSheet, nunca Button faux-select**. Unidade Meses/Anos, Apresentação, De/Para conversores |
| DoseDisplay | `molecules/DoseDisplay` | valor+unidade+via (VO/EV/IM) |
| DetailRow | `molecules/DetailRow` | linhas de prescrição/dose dentro de ClinicalCard |
| ResultDisplay | `molecules/ResultDisplay` | Resultado calculadoras (Clearance/Superfície/Taxa) + Conversores |
| StatGrid | `molecules/StatGrid` | Resultados em grade |
| Segmented | `molecules/Segmented` | DVA vazão/volume; Asma leve-mod/grave; Custom oral/vazão/volume |
| Stepper | `molecules/Stepper` | Nº ampolas / mL soro (Monte sua solução) |
| RadioGroup/Radio + CheckboxGroup/Checkbox | `molecules/RadioGroup` + `atoms/Radio` | Seleções em protocolos/escores |
| OptionCard | `molecules/OptionCard` | Plano A/B/C; ramo de gravidade |
| DisclosureCard | `molecules/DisclosureCard` | Acordeão Antihistamínicos(7) + Antidiarreicos; cards Teoria |
| Tag / Chip / RangeChip | `molecules/Tag` + `molecules/Chip` | Badges Premium/Novo/Em breve; chips peso/idade; RangeChip faixas |
| TabBar | `molecules/TabBar` | 3 abas protocolo + nav inferior |
| Textarea / SheetTextarea | `molecules/Textarea` | Anotações ao encerrar (dados mínimos no início) |
| EmptyState | `molecules/EmptyState` | Listas/históricos vazios (≠ empty-state clínico = AlertCard) |

**Atoms / overlays / AI**
| Componente | Path | Uso ped |
|---|---|---|
| Icon | `atoms/Icon` | **Lucide stroke-only: cor via stroke, nunca fill** |
| Button / IconButton / FAB | `atoms/Button` + `atoms/FAB` | Ações primárias/secundárias |
| SectionLabel | `atoms/SectionLabel` | Separar grupos na Home. **NUNCA label de campo** |
| BottomSheet + sheet/* | `overlays/BottomSheet` + `molecules/sheet/*` | Shell de todos os sheets |
| InfoSheet / DetailSheet / ActionSheet | `overlays/patterns/` | Teoria (onInfo) / detalhe / menus ação |
| SavePatientSheet | `overlays/patterns/SavePatientSheet` | Salvar caso; base p/ Doses Ped + Custom Solutions |
| AI: AIResponseRenderer/DoseBlock/ProtocolStep/InterpretationBlock/CopyableBlock | `shared/components/ai` | Só se Home V2 ped integrar IA. Opcional na 1ª leva |

---

## SEÇÃO 3 — Spec da Home Pediátrica + pontos de backend

### 3.1 Chassi
A Home V2 já tem toggle Adulto/Pediatria, mas o braço Pediatria **não renderiza conteúdo ped** (CATEGORIES/PLANTAO/RECENTES/URGENCIA_GRID são arrays hardcoded adulto). Build: quando `isPediatricMode=true`, trocar o catálogo de blocos para os 11 blocos ped. Recomendação: **condicional dentro de `showHome`** (espelha o as-is onde `/pediatra` é tela separada, mas o toggle do protótipo já existe). Header **"Pediatria"** (não "Pediatra" — flag PRD). Persistir em `localStorage` (`pediatric_mode` já existe). Fonte: `Home.jsx` + `App.jsx` (`isPediatricMode` via `usePersistedState`); Figma DS `🏠 Nova Home V2` `3673:2`.

### 3.2 Os 11 blocos (data-flow por bloco)

| # | Bloco | Data-flow | Fonte | Build | Prio |
|---|---|---|---|---|---|
| 1 | Carrossel/Banners | **CLOUD** Supabase `calcmed_banners`, filtrar superfície='Pediatria'\|\|'Todos' + público do plano | `00_ARQ §2 b1`; `bannersStore.js`; Figma `357:283338` | Leitor read-only de banners no B2C (hoje só no admin). Bloqueado por ponte E-01 | P1 |
| 2 | Passômetro | Estático (link nav), sem backend clínico | `00_ARQ §2 b2` | Card atalho (reusar FeatureCard) | P2 |
| 3 | **Busca unificada** | **MISTO**: cloud (ATB+sintomáticos, tagsBusca/marcas/sinônimos normalizados) + estático (urgências/calcs/conversores/sinais vitais) | `00b §6`; Figma `354:111785` | Índice unificado + busca por palavras relacionadas. Tela de resultados não existe | **P0** |
| 4 | **Sintomáticos** (9 cat) | **100% CLOUD** `calcmed_antibioticos` (publico='pediatrico', categoria sintomático) | `00_ARQ §2 b4` + `raw/01a–01d`; `seed.sintomaticos.js` (43 itens verbatim) | Leitor read-only filtra publicado+revisado. Bloqueio E-01 + gate ped. Fallback = seed embarcado | **P0** |
| 5 | **Antibióticos** (23) | **100% CLOUD** mesma tabela (publico='pediatrico', cat ATB) | `00_ARQ §2 b5` + `raw/02a,02b`; `seed.pediatricos.js` (23 verbatim) | Módulo TEMPLATE-base do admin. ATB é adulto OU ped (nunca ambos); ped não usa clearance. Fallback seed | **P0** |
| 6 | **Urgências** (10) | **ESTÁTICO-VERBATIM** (não no admin nesta release) | `00_ARQ §2 b6` + `raw/03a–03c`; centrais em `data/protocols.js` (não quebrar) | Cada urgência = tela protocolo. **PCR/Intubação ped são fluxos PED distintos (doses/peso) — NÃO reusar central adulto direto**. Anafilaxia+Hipo = LIVRES | **P0** |
| 7 | Diluições e Doses (5) | **MISTO**: conteúdo estático + Custom Solutions = CRUD do usuário (local) | `00_ARQ §2 b7` + `raw/04` | Vasoativas = arquétipo C "Monte sua solução". Não no admin | P1 |
| 8 | Calculadoras (3) | **ESTÁTICO/fórmula em código** (admin nunca guarda resultado) | `00_ARQ §2 b8` + `raw/05` | Taxa Infusão = compartilhada adulto. Referências saem do hardcode → admin (pós-ponte) | P1 |
| 9 | Conversores (7) | **ESTÁTICO/fórmula**, LIVRE no free (isca freemium) | `00_ARQ §2 b9` + `raw/05` | Reusa `/equation/category/conversor-*`. Arquétipo D | P1 |
| 10 | Informações / Sinais Vitais | **ESTÁTICO, des-imagem** | `00_ARQ §2 b10` + `raw/05b` (valores verbatim) | Tabela ESTRUTURADA (arquétipo F) substitui JPG. Q7: valores de 05b | P1 |
| 11 | Plantão (Descanso/Eletro/Anotações) | Estático/navegação | `00_ARQ §2 b11` | Atalhos externos. Anotações entra dev 22/06 | P2 |

### 3.3 Pontos de backend (a peça central da release)

| Item | Estado | O que construir | Fonte | Prio |
|---|---|---|---|---|
| **Ponte admin→app (E-01)** | gap | **PEÇA CENTRAL.** Hoje a dose vive fixa no app; o app ainda não lê o conteúdo do admin em tempo real. A ponte (leitura do que está publicado e revisado) é construção nova. Decisão de runtime fica pra planning de 22/06. Enquanto a ponte não existe, os blocos 4/5 usam o seed embarcado. **Não inventar dado — só exibir o que foi publicado** | `escopo nota #1` | **P0** |
| **Gate de publicação de dose ped** | gap | Hoje a publicação é **só adulto** (todo item pediátrico nasce rascunho/pendente). A revisão médica é obrigatória antes de qualquer dose ir ao ar. Precisa: (a) decisão de produto pra liberar conteúdo pediátrico; (b) **Gustavo revisar e assinar as doses** antes de publicar (bugs do as-is não migram crus). Q7: doses verbatim, revisão clínica antes do ar | `escopo nota #3` | **P0** |
| Índice de busca unificado | gap | UM índice: (1) cloud (store já normaliza tagsBusca/marcas/sinônimos) + (2) estático as-is (urgências/calcs/conversores/sinais vitais). Merge + palavras relacionadas (hipernatremia→distúrbio do sódio). Indexar itens granulares (Zinco hoje não é buscável isolado) | `00b §6`; `antibioticosStore.js`; escopo | P1 |
| Catálogo estático ped embarcado | so-as-is | Blocos 6/7/8/9/10 não entram no admin: o conteúdo vira um módulo de dados transcrito VERBATIM de `raw/03a–05b`, espelhando o shape de `data/protocols.js`. Q7: cada dose/fórmula aponta o raw exato. Revisão médica antes de exibir (bugs sinalizados) | `pediatria-as-is/raw/` | P1 |
| Favoritos + Recentes + Custom Solutions | so-as-is | Estado pessoal (não clínico): local-storage hoje (`favorites` compart. adulto+ped). Decidir V2 local vs sync por usuário (as-is não sincroniza). Reusar `usePersistedState`. Não bloqueia clínico | `00b §5`; `Home.jsx RECENTES`; `raw/04` | P2 |
| Overlay Premium/paywall | gap | O que entra livre no free: Conversores, Anafilaxia, Hipoglicemia, Corticóides ped. O premium é definido no app. Paywall = próxima sprint. Home mostra chip Premium + cadeado | `00b §4`; escopo | P1 |

---

## SEÇÃO 4 — Ordem de build + linkagem

### Marcos (infra, antes das levas)

| Marco | O que | Fonte | Prio |
|---|---|---|---|
| **MARCO 0** | **DECISÃO BLOQUEANTE de runtime da dose**: data-driven (lê admin) vs hardcoded por droga. Recomendação: **renderer data-driven único** (`AntibioticoTelaPreview` é o molde), consumindo `seed.pediatricos.js` como fixture até a ponte. Sem isso, Levas 2 ficam ambíguas | `escopo item E-01`; `seed.pediatricos.js` | **P0** |
| **MARCO 1** | **Router pediátrico**: prefixo `ped/<categoria>/<slug>` OU registro tabular `PED_ROUTES` (análogo a PROTOCOLS) p/ não inflar o switch com ~90 ifs. `<PediatriaRouter>` despacha. **Aditivo**: `if (visibleRoute.startsWith('ped'))`, ZERO mudança nas 5 centrais | `App.jsx`; `data/protocols.js` | **P0** |
| **MARCO 2** | **Home Pediátrica** (entry-point): 11 blocos verbatim; toggle já existe (só troca CSS hoje). Cada bloco-categoria → `onNavigate('ped/<categoria>')`. **HUB de linkagem: todas as folhas penduram aqui** | `raw/00b §2`; `Home.jsx` | **P0** |
| **MARCO 3** | **Renderer data-driven de tela de droga** (`PediatriaDrugScreen`): extrair `AntibioticoTelaPreview` p/ consumer reusável. Cobre TODAS as drogas com 1 componente. **Esgotar reuso ANTES de criar** | `AntibioticoTelaPreview.jsx`; seeds | **P0** |
| **MARCO 4** | **Tela Categoria→Lista** (`PediatriaCategoryList`): breadcrumb + busca + DrugListRow → onNavigate(droga). Liga Home→Lista→Drug | `raw/00b §3a` + `raw/01–02` | **P0** |

### Levas (ordem de fan-out)

| Leva | Telas | Por quê nesta ordem | Prio |
|---|---|---|---|
| **1.1** | Anafilaxia | Single-screen, livre, alto valor (isca), **independente** | **P0** |
| **1.2** | Hipoglicemia | Single-screen, livre. Ref `project_pediatria_wip` (2,2kg, GH 25%) | **P0** |
| **1.3** | 7 Conversores | 1 molde + 7 configs, sem peso, baixíssimo risco, livres | **P0** |
| **1.4** | 7 Corticóides | Valida pipeline data-driven (MARCO 3+4) com conteúdo LIVRE (sem paywall). Bom canário | **P0** |
| **2.1** | 23 Antibióticos | MAIOR reuso (seed verbatim + preview prontos). Complexas: Amicacina (4 níveis), Penicilina G (11 indic.), Ampicilina (dual IM/EV). Gated | P1 |
| **2.2** | Sintomáticos rota por-droga (Antitérmicos/AINE/Antieméticos/Broncodilatadores/Laxativos) | Renderer MARCO 3. Ibuprofeno em 2 rotas (mesmo widget); Metoclopramida foge do padrão | P1 |
| **2.3** | Antihistamínicos + Antidiarreicos (acordeão) | Padrão DIFERENTE: tela única multi-droga (DisclosureCard). Saccharomyces=órfão. Antiespasmódico tem rota por-droga (vai na 2.2) | P1 |
| **3.1** | Calculadoras (Clearance/Superfície/Taxa Infusão) | Folhas independentes, InputField+ResultDisplay. Calc pura | P1 |
| **3.2** | Diluições (Hidratação/Vasoativas/Custom Solutions/Ketofol/Ketodex) | Padrão (d) Monte sua solução. CRUD Custom Solutions = maior complexidade (estado persistido) | P1 |
| **4.1** | Urgências multi-step simples (Bradi/Taqui/Convulsiva) | Seleção droga→resultado/kg. RadioGroup+AlertCard. Pode usar ProtocolShell (sem tocar centrais) | P1 |
| **4.2** | Urgências sub-modos (Diarreia/Asma) | Padrão (c) sub-rotas por gravidade. Maior complexidade de fluxo fora do PCR | P1 |
| **4.3** | Urgências avançadas (Intubação/VM/PCR ped) | Máxima complexidade + risco clínico. **PCR ped segue sub-cérebro Modo PCR (override); defib ped já foi achado crítico**. POR ÚLTIMO | P2 |
| **5.1** | Sinais Vitais Normais (tabela) | Des-imagem JPG → Table organism. Valores verbatim 05b. Baixa complexidade | P2 |
| **5.2** | Limpeza dívidas + linkagem final | Decisões: Diclofenaco órfão (ligar/remover), Metoclopramida (aviso/calc), Ibuprofeno duplicado (dedup?), Saccharomyces, bugs as-is (NÃO migrar dose sem revisão). **Fechar malha: folha→Home, categoria linkada, busca cobre catálogo** | P2 |

### Guard-rails (sempre ativos)

| Guard | Regra | Prio |
|---|---|---|
| **Isolamento das 5 centrais** | Pediatria só ADICIONA branches no switch + arquivos NOVOS em `features/pediatria/`. **PROIBIDO editar `features/{cad,sca,sepse,pcr,avc}/`**. Extensão de shared = aditiva (prop com default). **Rodar suíte (312) + smoke das 5 centrais ANTES de cada merge.** CSS modo-ped já escopado por class no viewport (App.jsx) = isolamento natural | **P0** |
| **Fonte visual** | **NÃO assumir frames Figma prontos no file B2C.** Os 63 frames documentados estão no DS LEGADO, não no file canônico. Verdade visual p/ build = 5 centrais React (padrão-ouro) + `AntibioticoTelaPreview` + 6 padrões do `raw/00b`. Paridade Figma = tarefa separada, não bloqueia React | P1 |

### Grafo de linkagem

```
App.jsx switch
  └─ if visibleRoute.startsWith('ped') → <PediatriaRouter>   [MARCO 1]
        └─ Home Pediátrica (11 blocos)                       [MARCO 2 — HUB]
              ├─ bloco categoria → PediatriaCategoryList      [MARCO 4]
              │     └─ DrugListRow → PediatriaDrugScreen      [MARCO 3]  (Sintomáticos+ATB)
              ├─ bloco Urgências  → ProtocolShell (folhas)               (reuso, sem tocar centrais)
              ├─ bloco Conversores → ConverterScreen (7)
              ├─ bloco Calculadoras → ResultDisplay (folhas)
              ├─ bloco Diluições  → Stepper/Segmented (Monte sua solução)
              └─ bloco Busca → índice unificado (cloud + estático)
  └─ camada de dados: ponte E-01 (read-only Supabase)  ||  fallback seed embarcado
```

---

## SEÇÃO 5 — A PRIMEIRA LEVA (fan-out começa agora)

**Critério:** P0 · independente · baixo risco · livre no free (sem paywall, sem ponte E-01). Cada item abaixo é um pacote auto-contido para um agente.

> **Pré-requisito mínimo para 1.1/1.2 (single-screen):** nenhum marco — são telas-folha que só usam DS existente (InputField, AlertCard, ClinicalCard). Para 1.3/1.4 é preciso MARCO 0 decidido + MARCO 3/4 (renderer + lista) construídos primeiro.

### Pacote A — Anafilaxia (LEVA 1.1) · independente, sem deps
- **Rota:** `ped/anafilaxia`
- **Fonte VERBATIM:** `CalcMed Urgencia/pediatria-as-is/raw/03b-urgencias-anafilaxia-hipo-brady-taqui.md` (§Anafilaxia, adrenalina IM dose/kg)
- **Tela:** single-screen. CalcHeaderPed(só Peso) → resultado adrenalina IM por kg
- **Componentes:** InputField(peso) + AlertCard(empty-state crítico → result verde) + ClinicalCard(Cuidados)
- **Por quê primeiro:** FREE + emergência (buraco crítico, 🪣2 bespoke sem Figma), zero dep de outras telas
- **Q7:** doses só de raw/03b, não inventar

### Pacote B — Hipoglicemia (LEVA 1.2) · independente
- **Rota:** `ped/hipoglicemia`
- **Fonte VERBATIM:** `raw/03b-urgencias-anafilaxia-hipo-brady-taqui.md` (§Hipoglicemia)
- **Tela:** single-screen. Bolus GH + manutenção + glucagon por kg/concentração
- **Componentes:** CalcHeaderPed(peso) + RadioGroup(concentração) + AlertCard(resultado). Ref de cenário: `project_pediatria_wip` (2,2kg, GH 25%). Figma ✅ existe
- **Por quê:** FREE, single-screen, baixo risco

### Pacote C — 7 Conversores (LEVA 1.3) · 1 molde + 7 configs
- **Rotas:** `/equation/category/conversor-*` + `ped/conversor/<tipo>`
- **Fonte VERBATIM:** `raw/05-calculadoras-conversores-info.md` (§1–§7) + `raw/00b §3(e)`
- **Tipos:** mL/h↔mcg/kg/min · mcg/kg/min→mL/h · mL/h↔gts/min · %→mg/mL · mL/h→mcg/min · mcg/min→mL/h · Corticóides
- **Componente NOVO:** `ConverterScreen` (Select De/Para + InputField Valor + ResultDisplay) — 1 molde, 7 configs
- **Por quê:** FREE, sem peso, quase idênticos, baixíssimo risco. Figma ✅

### Pacote D — 7 Corticóides (LEVA 1.4) · valida pipeline data-driven
- **Rotas:** `ped/corticoides` + `ped/corticoides/<slug>`
- **Fonte VERBATIM:** `raw/01d-sintomaticos-laxativos-corticoides.md`
- **Drogas:** Prednisona · Prednisolona · Dexametasona · Hidrocortisona · Metilprednisolona · Budesonida · Fluticasona
- **Usa:** MARCO 3 (PediatriaDrugScreen) + MARCO 4 (PediatriaCategoryList). Dexametasona tem MOLDE de faixas etárias no Figma
- **Por quê:** valida o pipeline data-driven com conteúdo LIVRE antes de escalar p/ ATB gated. Bom canário

### Ordem de execução da primeira leva
1. (paralelo) **Pacote A** + **Pacote B** — single-screen, zero infra, começam imediatamente
2. **MARCO 0** decidido (planning 22/06) → desbloqueia data-driven
3. **MARCO 1 + 2 + 3 + 4** (infra: router, home, renderer, lista)
4. **Pacote C** (ConverterScreen) — independente do renderer de droga, pode ir em paralelo a 3
5. **Pacote D** (Corticóides) — canário do renderer; valida MARCO 3/4 com conteúdo livre
6. Smoke das 5 centrais + suíte 312 verde a cada merge (GUARD)

---

## Anexo — Arquétipos de dose (MODELO-DOSE-PEDIATRICA) → motores de cálculo

Os 7 `dosing_type` viram 7 motores no `PediatriaDrugScreen`:
1. **peso-computado** (aritmética peso×fator + tetos) — Paracetamol, Sulfato Mg, Glicerina, Secnidazol…
2. **faixa-etária-lookup** (tabela por faixa de peso/idade) — Dipirona, Simeticona, vários ATB
3. **híbrido** (lookup + ramo aritmético) — Ibuprofeno, Penicilina G Benzatina, muitos ATB
4. **dose-fixa** (independe peso/idade) — Colidis, Salbutamol
5. **só-aviso** (sem cálculo, só Cuidados) — Metoclopramida
6. **dispatcher por apresentação** (template troca: anti-inflam/asma/crupe/meningite) — Dexametasona (Koide D)
7. **CRUD/montagem** (Monte sua solução) — Vasoativas, Custom Solutions

> Q7 reforçado: cada motor lê valores do `raw/` correspondente. **Bugs as-is preservados verbatim** (Paracetamol `weightLimitedTo30`/teto 35; Dimenidrato "6 anos" sem "+"; Cefalexina texto herdado de amox-clav) — correção exige revisão clínica do Gustavo, não acontece no build cego.
