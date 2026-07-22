# Lógica de Cálculo — Antihistamínicos (Pediatria) — AS-IS

> **Foco:** computação, não prosa. Conteúdo em prosa já documentado em `raw/01b`.
> **Fonte de verdade:** `_source/main.decoded.js` (bundle Flutter decodificado). Fatores/tetos/faixas transcritos verbatim, verificados por byte-slice.
> **Datado:** 2026-06-21.

## Resumo de classificação

| Droga | dosing_type | Tem input de peso? | Computa por peso? |
|---|---|---|---|
| Cetirizina | faixa-etaria-lookup | Não | Não — strings fixas por faixa etária |
| Dexclorfeniramina | faixa-etaria-lookup | Não | Não — strings fixas (nota "1 gota/2 kg" é texto) |
| Desloratadina | faixa-etaria-lookup | Não | Não — strings fixas por faixa etária |
| Fexofenadina | faixa-etaria-lookup | Não | Não — gate de peso 10,5 kg é só TEXTO em Cuidados |
| **Hidroxizina** | **peso-computado** | **Sim (Peso kg)** | **Sim — mL = peso×0.35 (teto 14), mg = peso×0.7 (teto 28)** |
| Loratadina | faixa-etaria-lookup | Não | Não — branches por peso 30 kg são strings FIXAS, sem input |
| Ebastina | faixa-etaria-lookup | Não | Não — strings fixas por faixa etária |

**Arquitetura:** tela única `/pediatra/antihistaminicos`, acordeão de 7 drogas (sub-itens com `url=null`, sem rota própria). 6 das 7 são listas de strings estáticas (`new A.az(prefixo, dose, sufixo)` dentro de `A.a([...])`). Só **Hidroxizina** lê `j.d` (peso) e computa.

---

## Cetirizina — faixa-etaria-lookup

- **Inputs:** nenhum.
- **Apresentações:**
  - Solução oral 1 mg/mL
  - Solução oral (gotas) 10 mg/mL: Cetrizin®
- **Regra (faixas fixas, 2 grupos por apresentação):**

  Grupo 1 — Solução oral 1 mg/mL:
  | Faixa etária | Dose |
  |---|---|
  | 6 a 12 meses | 2,5 mL (2,5 mg) VO 24/24h |
  | 1 a 2 anos | 2,5 mL (2,5 mg) VO 24/24h (pode ↑ para 2,5 mL 12/12h) |
  | 2 a 6 anos | 2,5 mL (2,5 mg) VO 12/12h |
  | 6 a 12 anos | 5 mL (5 mg) VO 12/12h OU 10 mL (10 mg) 1x/dia |

  Grupo 2 — Solução oral (gotas) 10 mg/mL:
  | Faixa etária | Dose |
  |---|---|
  | 2 a 6 anos | 5 gotas (2,5 mg) VO 12/12h |
  | 6 a 12 anos | 10 gotas (5 mg) VO 12/12h |
- **Contraindicação/idade:** bula a partir de 2 anos (nota). Sem teto computado. 2ª geração (não seda).
- **Via:** VO.

## Dexclorfeniramina — faixa-etaria-lookup

- **Inputs:** nenhum. ("1 gota/2 kg" é menção em texto, NÃO há campo de peso nem cálculo.)
- **Apresentações:**
  - Xarope 2 mg/5 mL: Histamin®
  - Solução gotas 2,8 mg/mL: Polaramine®
- **Regra (faixas fixas, xarope 2 mg/5 mL):**
  | Faixa etária | Dose/dose | Dose | Máx |
  |---|---|---|---|
  | 2 a 6 anos | 0,5 mg | 1,25 mL ou 5 gotas (ou 1 gota/2 kg) VO 8/8h | 7,5 mL/dia ou 30 gotas/dia |
  | 6 a 12 anos | 1 mg | 2,5 mL ou 10 gotas (ou 1 gota/2 kg) VO 8/8h | 15 mL/dia ou 60 gotas/dia |
  | ≥ 12 anos | 2 mg | 5 mL ou 20 gotas VO 3-4x/dia | 30 mL/dia ou 120 gotas/dia |
- **Contraindicação/idade:** bula a partir de 2 anos. Risco de sedação e hipotensão.
- **Via:** VO.

## Desloratadina — faixa-etaria-lookup

- **Inputs:** nenhum.
- **Apresentações:**
  - Xarope 0,5 mg/mL: Esalerg®, Leg®
  - Solução gotas 1,25 mg/mL: Esalerg®
- **Regra (faixas fixas):**
  | Faixa etária | Dose mg | Dose |
  |---|---|---|
  | 6 a 11 meses | 1 mg | 2 mL ou 16 gotas VO 1x/dia |
  | 1 a 5 anos | 1,25 mg | 2,5 mL ou 20 gotas VO 1x/dia |
  | 6 a 11 anos | 2,5 mg | 5 mL ou 40 gotas VO 1x/dia |
  | > 12 anos | 5 mg | 10 mL ou 80 gotas VO 1x/dia |
- **Contraindicação/idade:** bula a partir de 6 meses. 2ª geração (não seda).
- **Via:** VO.

## Fexofenadina — faixa-etaria-lookup

- **Inputs:** nenhum. ⚠️ **Verificado no bundle:** widget NÃO lê `j.d`; doses são strings fixas. O gate de 10,5 kg é TEXTO em Cuidados, NÃO há cálculo nem campo de peso.
- **Apresentação:** Suspensão oral 6 mg/mL: Allegra pediátrico®
- **Regra (faixas fixas):**
  | Faixa etária | Dose |
  |---|---|
  | 6 meses a 2 anos | 2,5 mL (15 mg) VO 12/12h |
  | 2 a 11 anos | 5 mL (30 mg) VO 12/12h |
- **Condicional (TEXTO em Cuidados, não computado):**
  - Se peso < 10,5 kg → 2,5 mL 2x/dia (independente da idade).
  - Se peso > 10,5 kg → 5 mL 2x/dia (independente da idade).
- **Contraindicação/idade:** bula a partir de 6 meses. 2ª geração (não seda).
- **Via:** VO.
- **FLAG:** o gate clínico de 10,5 kg sugere que num motor de dose seria útil computar por peso, mas o AS-IS NÃO faz — só exibe texto. Implementar como peso-computado seria mudança de comportamento.

## Hidroxizina — **peso-computado** (ÚNICA droga que calcula)

- **Inputs:** **Peso (kg)** — campo "Peso", placeholder `0.0`, decimal com vírgula.
- **Empty state (peso = 0):** `Informe todos os dados para obter o resultado.` (string `u.y`).
- **Apresentação:** Solução oral (xarope) 2 mg/mL: Hixizine®
- **Fórmula (verbatim do bundle, byte 4937533):**
  ```js
  p = j.d            // peso (kg)
  o = p * 0.35
  if (o > 14) o = 14   // teto mL = 14
  p *= 0.7
  if (p > 28) p = 28   // teto mg = 28
  // output: "Dar " + o + " mL (" + p + " mg) VO de 8/8 horas."
  ```
  - **mL/dose = peso × 0.35**, teto **14 mL**.
  - **mg/dose = peso × 0.7**, teto **28 mg**.
  - Equivale a ~0,7 mg/kg/dose (0,35 mL/kg/dose).
  - ⚠️ **Nota de fidelidade:** output usa `A.b(o)` / `A.b(p)` (valor BRUTO, SEM arredondamento `B.e.t`). Ex.: peso 10,3 kg → 3.605 mL (10,3×0.35) exibido sem casas fixas. Replicar sem rounding para paridade exata, ou flag para corrigir.
- **Saturação:** teto de mL (14) atinge em peso = 40 kg; teto de mg (28) atinge em peso = 40 kg (consistente).
- **Contraindicação/idade:** bula a partir de 6 meses (texto). Risco de sedação e hipotensão.
- **Via:** VO. **Intervalo:** 8/8 horas.

## Loratadina — faixa-etaria-lookup (por faixa de PESO, mas SEM input)

- **Inputs:** nenhum. ⚠️ **Verificado:** branches por peso são strings FIXAS (`new A.az(...)`), widget NÃO lê peso. É lookup por faixa de peso textual, não cálculo.
- **Apresentação:** Solução oral (xarope) 1 mg/mL: Claritin®, Histadin®, Loratamed®
- **Regra (faixas fixas de peso):**
  | Faixa de peso | Dose |
  |---|---|
  | < 30 kg | 5 mL (5 mg) VO 1x/dia |
  | ≥ 30 kg | 10 mL (10 mg) VO 1x/dia |
  > Fidelidade: bundle grafa `Peso coroporal ≥ 30 kg` (typo "coroporal") no 2º item. Transcrito verbatim.
- **Contraindicação/idade:** bula a partir de 2 anos. 2ª geração (não seda). (Cuidados = string compartilhada `u.xq` com Ebastina.)
- **Via:** VO.

## Ebastina — faixa-etaria-lookup

- **Inputs:** nenhum.
- **Apresentação:** Xarope 1 mg/mL: Ebastel®
- **Regra (faixas fixas):**
  | Faixa etária | Dose |
  |---|---|
  | 2 a 5 anos | 2,5 mL (2,5 mg) VO 1x/dia |
  | 6 a 11 anos | 5 mL (5 mg) VO 1x/dia |
  | acima de 12 anos | 10 mL (10 mg) VO 1x/dia |
- **Contraindicação/idade:** bula a partir de 2 anos. 2ª geração (não seda). (Cuidados = string `u.xq`, idêntica à Loratadina.)
- **Via:** VO.

---

## Notas para o motor de dose

1. **6 de 7 drogas são lookup puro** — nenhum cálculo, só selecionar a linha por faixa (etária ou de peso textual). Modelar como tabela `{faixa, dose, intervalo, max}`.
2. **Hidroxizina é a única `peso-computado`**: 2 fórmulas lineares com teto. Inputs = peso. Atenção ao rounding (AS-IS não arredonda).
3. **Fexofenadina:** decidir produto — manter lookup (AS-IS) ou promover a peso-computado usando o gate de 10,5 kg (mudaria comportamento; flag para Gustavo).
4. **Loratadina:** o "switch" de 30 kg é textual; se o app vier a pedir peso, dá para automatizar a seleção, mas hoje não pede.
5. Cetirizina/Dexclorfeniramina têm 2 apresentações cada (mL + gotas) → motor precisa de select de apresentação ou exibir ambas.
