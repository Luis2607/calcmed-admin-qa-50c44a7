# Varredura de Órfãos — âncora "Apresentação" (cobertura 100%)

> **Objetivo:** garantir 100% de cobertura encontrando telas de droga/conteúdo no bundle que NÃO foram documentadas (built-but-unwired, como Diclofenaco e os antibióticos órfãos).
> **Método:** `grep -a -b "Apresentação"` no bundle `_source/main.decoded.js` (acentos resolvidos). Cada offset foi aberto com `dd` (janela ±120–700 bytes) para identificar a droga/tela pelo template literal ao redor, depois cruzado contra `_route-tree.txt` e os `.md` em `raw/`.
> **Data:** 2026-06-20.
> **Total de âncoras "Apresentação"/"Apresentacao" no bundle:** 76 ocorrências (`grep -c`).

---

## ⚠️ Achado-chave: o bundle contém DOIS apps (pediátrico + adulto)

A âncora "Apresentação" aparece em **três regiões de byte distintas**, que correspondem a contextos diferentes:

| Região de byte | Natureza | Classes widget | Documentado? |
|---|---|---|---|
| **~3.37M – 3.92M** | **App ADULTO** ("Diluições e Doses" / arritmias / overdose) + módulo de antibióticos órfão + drogas vasoativas | `A.aHB`, `A.aHz`, `A.aHE`, `A.b8n…bbI`, `A.b8o` | Parcial (vasoativos SIM; adulto puro = fora de escopo) |
| **~4.89M – 5.50M** | **App PEDIÁTRICO** (sintomáticos, broncodilatadores, corticoides, laxativos, anti-histamínicos, antieméticos, custom-solutions, vasoativos) | `A.dFC`, `A.du_`, `A.dvF`, `A.dBh`, `A.dwG`… | SIM (docs 01a–01d + 04) |
| **~10.31M** | App PEDIÁTRICO — ventilação mecânica / sedação contínua | strings inline (Atracúrio, Pancurônio, Precedex, Quetamina, Rocurônio) | SIM (doc 03c) |

A confusão histórica do dev (Diclofenaco "sem rota", antibióticos órfãos) vem exatamente daqui: o bundle Flutter empacota o app adulto junto, e várias telas adultas usam a mesma âncora "Apresentação".

---

## 1. Órfãos PEDIÁTRICOS — já documentados (confirmação, NÃO são novos)

| Droga / tela | Offset | Status | Onde está documentado |
|---|---|---|---|
| **Diclofenaco (Cataflam®)** — "Suspensão gotas 15 mg/mL" | 4944415 | ÓRFÃO pediátrico (conteúdo no bundle, sem rota em `/pediatra/aine`) | **`01a` §"⚠️ ÓRFÃO — Diclofenaco (Cataflam®)"** (linha 260). Resolve o GAP que a `_coverage-matrix.md` listava como "NÃO encontrado". |
| Antibióticos órfãos adulto-orientados (Aciclovir, Anfotericina B Desox./Lipos., Caspofungina, Cefazolina, Cefepime, Ceftarolina, Ceftazidima, Ciprofloxacin, Clindamicina) | 3416797 (anfotericina) + faixa `A.H7…A.Hr`/`A.IN` | ÓRFÃOS built-but-unwired | **`02c-antibioticos-orfaos.md`** (10 telas, completo) |
| Saccharomyces boulardii (Floratil®) | 4891240 ("Pó oral 250 mg: Floratil®") | Acordeão sem rota própria | `01b`/`00b §8` (vive na tela única Antidiarreicos) |

## 2. Telas PEDIÁTRICAS com âncora "Apresentação" — todas cobertas

Cruzamento dos offsets 4.89M–5.50M e 10.31M contra os docs. Identificação por marca/concentração no template:

- **Sintomáticos / antieméticos / anti-histamínicos / antiespasmódicos** (Ondansetrona "Ondse…", Buscopan®, Esalerg®/Leg®, Histamin®, Ebastel®, Allegra®, Claritin®/Clar…, Hixizine®, Bromifen®) → docs **01a / 01b**.
- **Broncodilatadores** (Hedera helix/Abrilar, Brondilat®, Montelair®, fenoterol, salbutamol, sulfato de magnésio nebulização) → doc **01c**.
- **Laxativos** (Enema Glicerinado, Lactulona®, Nujol®, macrogol) + **Corticoides** (Prednisolona, dexclorfeniramina+betametasona, Avamys®/fluticasona spray nasal) → doc **01d**.
- **Antitérmicos/Analgésicos** (Tylenol®/paracetamol gotas, Novalgina®/dipirona, Scaflam®) → doc **01a / 01**.
- **Drogas vasoativas** (Noradrenalina, Vasopressina 20 U/mL, Adrenalina 1 mg/mL, Dobutamina 250 mg/20 mL, Nitroprussiato 50 mg/2 mL, Dopamina 5 mg/mL, Milrinona 1 mg/mL) — batches `A.b8n…bbI` (offsets 3.83M–3.86M) **e** `A.bbz…bbm` (offsets 5.24M–5.27M, variantes Vazão/Volume) → doc **04** §Drogas Vasoativas. As duas regiões são as variantes vazão vs volume da MESMA lista de 8 drogas.
- **Soluções personalizadas / custom-solutions** ("Apresentação da droga:", "Apresentação da ampola") offsets 5018773 / 5117999 / 5121551 → doc **04** §Soluções Personalizadas.
- **Crise convulsiva** (Diazepam/Midazolam "Primeira linha – 10 minutos iniciais", offset 3622186) → doc **03a** §Crise Convulsiva.
- **Taquicardia** (Adenosina 3 mg/mL) → doc **03b**.
- **VM / sedação contínua** (Atracúrio, Pancurônio, Precedex®/Dexmedetomidina, Quetamina, Rocurônio — offsets ~10.31M) → doc **03c**.

## 3. Telas ADULTAS (fora de escopo pediátrico) — flag, NÃO documentar como pediatria

Estas usam a âncora "Apresentação" mas pertencem ao **app adulto** empacotado no mesmo bundle. NÃO são órfãos pediátricos; são features de outro produto. Documentadas aqui só para fechar a varredura.

| Droga / tela | Offset | Evidência de que é ADULTO |
|---|---|---|
| **Tartarato de metoprolol** — "Apresentação: ampola 1 mg/mL - 5 mL", "Arritmias cardíacas", "Metoprolol 5 mg EV…", "dose total de 10-15 mg" | 3377435 | Classe `A.aHB`; logo após vem `_EquationAciclovirControllerBase` (módulo adulto). Dose adulta fixa (mg), sem mg/kg. Sem rota `/pediatra/*`. |
| **Flumazenil** — "Flumazenil 1 ampola + 5 mL SF 0,9%… Fazer 4 mL (0,2 mg) EV", "0,1 mg/mL (ampola com 5 mL)" | 3650630 | Classe `A.aHz`. Reversão de benzodiazepínico, dose fixa adulta. Região adulta (3.65M). |
| **Naloxone / Overdose de opioides** — "0,4 mg/mL (ampola com 1 mL)", "Overdose de opioides:" | 3652294 | Classe `A.aHE`. Tela de reversão de opioide, dose fixa adulta. |
| **Albumina humana 20%** — "Quantos litros retirados na paracentese", "Albumina humana 20% (pura)", "20% (0,2 g/mL – Frasco Ampola com 10, 50 e 100 mL)" | 3677045 | Classe `A.b8o`. **Paracentese** = procedimento adulto (cirrose/ascite). Sem rota `/pediatra/*`. |

> Outras âncoras na faixa 3.4M–3.9M (concentrações 250 mg/20 mL, 5 mg/mL, etc.) caem nos widgets de **drogas vasoativas** (cobertos em doc 04) ou no **módulo de antibióticos adulto órfão** (coberto em 02c).

---

## Conclusão

- **Órfãos PEDIÁTRICOS novos encontrados nesta varredura: ZERO.** Tudo que é pediátrico e tem âncora "Apresentação" já está documentado nos docs 01a–01d, 02c, 03a, 03b, 03c e 04.
- O **único órfão pediátrico real** (Diclofenaco) já tinha sido capturado e documentado em `01a` — esta varredura confirma e fecha o GAP que a `_coverage-matrix.md` deixava em aberto.
- Os antibióticos órfãos adulto-orientados estão integralmente em `02c`.
- **4 telas adultas** (Metoprolol, Flumazenil, Naloxone/overdose-opioides, Albumina/paracentese) foram encontradas no bundle mas são do **app adulto** — flagueadas acima, **não** entram na documentação pediátrica.
- **Recomendação:** a `_coverage-matrix.md` (linha 142) pode ser atualizada — Diclofenaco deixou de ser "NÃO tratado / NÃO encontrado" e passou a "DOCUMENTADO em 01a".
