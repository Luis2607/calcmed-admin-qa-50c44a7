---
tipo: arquitetura-da-informacao (fluxos)
produto: CalcMed — Pediatria (B2C)
status: as-is 2026-06-20 · base = bundle de produção
companion_visual: mapa-fluxos-pediatria.html
companion_catalogo: mapa-ia-pediatria.html
detalhe_clinico: raw/<seção>.md
---

# Pediatria — Fluxos & Arquitetura da Informação (AS-IS)

> **Como ler:** este doc organiza a pediatria *por como ela funciona* (fluxos), não por lista de conteúdo. Para o catálogo "o que existe", veja `mapa-ia-pediatria.html`. Para o mapa visual destes fluxos, `mapa-fluxos-pediatria.html`.

## Princípio: 3 camadas + 6 arquétipos

A pediatria inteira é um **hub-and-spoke**:

```
SHELL persistente  →  HUB (Home /pediatra)  →  ~90 destinos
                                                  └ todos construídos a partir de 6 ARQUÉTIPOS DE FLUXO
```

Entender 3 camadas + 6 arquétipos = entender 100% da navegação. Tudo o mais é conteúdo dentro desses moldes.

---

## CAMADA 0 — Shell persistente (envolve toda tela)

| Elemento | Comportamento |
|---|---|
| **Sidebar global** | Sempre presente (Início, Favoritos, Quiz, Assinatura, Loja, Configurações, Sair…). Item **"Pediatria"** = porta de entrada. |
| **Header** | "Olá, {nome}" + avatar · busca **"Pesquisar"** (global) / **"O que você precisa hoje?"** (dentro da pediatria). |
| **Back / Breadcrumb** | Toda tela interna: chevron voltar (mobile) · breadcrumb "Pediatria › Categoria › Item" (web). |
| **Estrela favoritar** | Por item e por categoria (local-storage, namespace compartilhado com adulto). |
| **Premium gate** | Overlay transversal: item gated ganha chip "Premium" + cadeado; tap chama paywall em vez de navegar. |

---

## CAMADA 1 — Entrada

```
Sidebar ▸ "Pediatria"  ──►  rota /pediatra  ──►  Home pediátrica
```
- **Não é um toggle de estado** — é uma rota própria (`/pediatra`, builder `aRQ`). Home pediátrica é tela separada da adulta.
- O app **não inicializa em rota profunda** (precisa bootar pela Home e navegar por clique).

---

## CAMADA 2 — Hub: Home pediátrica (11 blocos)

A Home é um despachante. Cada bloco leva a um destino que cai em 1 dos 6 arquétipos:

| # | Bloco da Home | Leva a | Arquétipo | Free? |
|---|---|---|---|---|
| 1 | Carrossel/Banners | Quiz / URL externa | — | — |
| 2 | Passômetro | Ferramenta de plantão | (externo à pediatria) | — |
| 3 | Busca | Filtra/abre qualquer item | — | — |
| 4 | **Sintomáticos** (9 cat) | Lista de drogas → calc | **A — Catálogo de Dose** | 🔒 (corticóides 🔓) |
| 5 | **Antibióticos** (23) | Lista de drogas → calc | **A — Catálogo de Dose** | 🔒 |
| 6 | **Urgências** (10) | Protocolo/fluxo | **B — Protocolo** | 🔒 (anafilaxia+hipo 🔓) |
| 7 | **Diluições e Doses** (5) | Diluição/solução | **C — Monte sua Solução** | 🔒 |
| 8 | **Calculadoras Médicas** (3) | Calculadora | **E — Calculadora Simples** | 🔒 |
| 9 | **Conversores** (7) | Conversor | **D — Conversor** | 🔓 |
| 10 | **Informações** (1) | Tabela | **F — Referência** | 🔓 |
| 11 | **Plantão** | Dividir Descanso / Eletro / Anotações | (externo) | — |

---

## CAMADA 3 — Os 6 arquétipos de fluxo

### ▸ Fluxo A — Catálogo de Dose  *(Categoria → Droga → Cálculo)*
**Usado por:** Sintomáticos (9 categorias · 39 drogas) · Antibióticos (23 drogas). É o fluxo mais comum do app.

```
Home ▸ [bloco] ──► LISTA DA CATEGORIA ──► CALCULADORA DE DOSE
                   • busca "O que você      • inputs: Peso (kg) [+ Idade valor+Meses/Anos]
                     precisa hoje?"          • Apresentação (formulações + marcas®)
                   • linhas favoritáveis     • Dose usual (mg/kg, máximas)
                     (estrela + nome + ›)     • Prescrição:  [empty → computado]
                                              • Cuidados / Contraindicações
```
**Estados da calculadora:** `vazio` → texto vermelho *"Informe todos os dados para obter o resultado."* → `computado` (volumes em verde, ao preencher Peso[+Idade]).

**Variantes (importante para o redesign):**
- **A2 — Tela única / acordeão** (sem rota por-droga): **Antihistamínicos** (7 drogas) e **Antidiarreicos** (Floratil, Zinco) — todas as drogas viram acordeões numa só tela.
- **A3 — Item-aviso** (sem cálculo): **Metoclopramida** — só renderiza bloco de Cuidados. Diverge do padrão.
- **Órfão:** **Diclofenaco** — a calculadora existe e funciona, mas **não há entrada na lista** (`/pediatra/aine`). Inacessível ao usuário.

---

### ▸ Fluxo B — Protocolo de Urgência
**Usado por:** as 10 urgências. Conteúdo em **acordeões de conduta** com doses calculadas por peso. 4 sub-formatos:

| Sub-tipo | Telas | Forma |
|---|---|---|
| **B1 — Linear** | Anafilaxia 🔓 · Hipoglicemia 🔓 · Bradicardia · Taquicardia · Diarreia | Entrada → acordeões de conduta (sem ramificação). |
| **B2 — Ramificado por gravidade** | Exacerbação de Asma | Entrada → escolhe **Leve-moderada** ou **Grave** → conduta específica. |
| **B3 — Abas / calculadora** | **PCR** | Calculadora "Cargas e Doses" com 5 abas: Adrenalina · Amiodarona · Lidocaína · Sulfato Mg · Carga do choque (J/kg). |
| **B4 — Sequência de steps** | Intubação (steps 1–5) · Ventilação Mecânica (parâmetros + sedação contínua) | Passo a passo + cálculos por peso. |

---

### ▸ Fluxo C — "Monte sua Solução"  *(diluição/infusão)*
**Usado por:** Drogas Vasoativas (8 drogas, modos **Vazão**/**Volume**) · Soluções Personalizadas.

```
Escolhe droga/solução ──► [ PRESET "Solução padrão"  |  "Monte sua solução:" ]
                                                          Nº de ampolas + mL de soro
                                                          → Concentração (mg/mL)
                                                          → Defina a dose (mcg/kg/min…)
                                                          → resultado: vazão (mL/h) / volume
```
**Soluções Personalizadas = CRUD próprio:**
```
empty ("Personalize e salve…") ──► "Escolha:" [ Solução Oral | Cálculo por Vazão | Cálculo por Volume ]
                                  ──► criar ──► salvar ──► editar / excluir (itens salvos reabrem)
```

---

### ▸ Fluxo D — Conversor   🔓 *(livre no free)*
**Usado por:** 7 conversores.
```
De: (unidade)  →  Valor  →  Para: (unidade)  →  "Resultado: [x]"   [recalcula a cada mudança]
```
Itens: mL/h↔mcg/kg/min · mcg/kg/min→mL/h · mL/h↔gts/min · %→mg/mL · mL/h→mcg/min · mcg/min→mL/h · Corticóides.

---

### ▸ Fluxo E — Calculadora Simples
**Usado por:** Clearance de Creatinina (Schwartz/Cockroft-Gault) · Superfície Corporal (Mosteller/Costeff) · Taxa de Infusão *(tela compartilhada com o app adulto, rota `/equation/category/taxa-infusao`)*.
```
inputs ──► resultado
```

---

### ▸ Fluxo F — Referência
**Usado por:** Sinais Vitais Normais. Tabela FC/FR/PA por faixa etária — hoje é **uma imagem JPG** (não estruturada). Valores transcritos em `raw/05b`.

---

### ▸ Feature transversal — Doses Pediátricas (CRUD)
`/doses-pediatricas/new` + `/view` — o usuário cria/salva/visualiza doses personalizadas. Não é um arquétipo de cálculo clínico; é uma ferramenta pessoal de registro.

---

## Modelo de estados (transversal a A–F)

`loading` (mostra "Premium" até resolver assinatura) → `vazio` → `preenchido` → `computado`. Sobreposto: `premium-locked` (chip + cadeado → paywall) · `favoritado` (estrela).

## Overlay Premium sobre os fluxos
- **Livre no free:** Fluxo D (Conversores), Fluxo B1 Anafilaxia + Hipoglicemia, Fluxo A Corticóides pediátricos.
- **Gated:** todo o resto (sintomáticos, antibióticos, demais urgências, diluições, calculadoras).
- ⚠️ O premium é definido no app —

---

## Leitura para a Nova Home V2 (o que a IA atual revela)

1. **O hub mistura naturezas diferentes** num só nível: catálogos de droga (A), protocolos (B), ferramentas de cálculo (C/D/E), referência (F) e ferramentas de plantão (Passômetro). Pesos/urgências muito diferentes lado a lado.
2. **Findability depende da busca** — com ~90 destinos, a lista de 11 blocos é longa de varrer; a busca "O que você precisa hoje?" é o atalho real.
3. **Inconsistências de molde** a resolver: Metoclopramida (item sem calc), Diclofenaco (órfão), Sinais Vitais (imagem), Antihistamínicos/Antidiarreicos (tela única vs por-droga).
4. **Oportunidade de reorganização por tarefa/urgência:** separar "na emergência agora" (Fluxo B, PCR) de "prescrever sintomático/ATB" (Fluxo A) de "ferramentas de cálculo" (C/D/E) — em vez do agrupamento atual por classe farmacológica + tipo de tela misturados.
5. **Free como isca:** os pontos livres (conversores, anafilaxia, hipoglicemia, corticóides) são a porta de entrada freemium — peso estratégico na Home V2.

---

*Conteúdo clínico exato de cada destino: `raw/<seção>.md`. Inventário completo rota-a-rota: `raw/_coverage-matrix.md`.*
