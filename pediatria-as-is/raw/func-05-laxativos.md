# Pediatria AS-IS — LÓGICA DE CÁLCULO — Laxativos

> Foco: a COMPUTAÇÃO de dose (não a prosa). Prosa clínica completa em `raw/01d-sintomaticos-laxativos-corticoides.md`.
> Fonte: `_source/main.decoded.js` (bundle Flutter web decodificado).
> Convenção do bundle: `B.e.t(expr, casas)` = formata número com N casas decimais (arredonda). `A.X(a,",",".")` = troca vírgula→ponto. `A.aj(...)` = parseDouble. Peso digitado vira `s`; getters de dose guardados em `r.d`, `r.e`.
> Categoria: `/pediatra/laxativos`. AppBar "Laxativos". Layout: Apresentação → Prescrição: → Cuidados.

## Resumo de classificação

| Droga | dosing_type | Input peso? | Computa? |
|---|---|---|---|
| Lactulose | faixa-etaria-lookup | não | não — texto fixo por faixa |
| Macrogol 3350 | faixa-etaria-lookup | não | não — ranges fixos em g/kg (texto) |
| Hidróxido de magnésio | faixa-etaria-lookup | não | não — texto fixo por faixa |
| Óleo mineral | faixa-etaria-lookup | não | não — texto fixo por faixa |
| Glicerina | peso-computado | **SIM (Peso kg)** | **SIM — peso×10 a peso×20 mL** |

> Achado central: **apenas Glicerina tem cálculo por peso.** Os outros 4 são telas estáticas (somente spans de texto `A.N`, sem `TextField`/peso, sem `B.e.t`). Doses em g/kg do Macrogol e mL/kg do Óleo mineral aparecem como **texto literal**, NÃO são computadas pelo app.

---

## 1. Glicerina — `peso-computado` ✅ ÚNICA COM CÁLCULO

- **Classe builder:** `A.dwF` (tela) · **Handler de input:** `A.dwE` (onChanged).
- **Inputs:** Peso (kg). Campo `A.ad(..., "0.0",..., "Peso", new A.dwE(j), 2,...)` → label "Peso", placeholder "0.0", 2 casas decimais.
- **Apresentações:** Enema Glicerinado 120 mg/mL (Glicerina 12%®, Clisterol®) · Supositório pediátrico (Pfizer Supositório de Glicerina®). NÃO há seletor de apresentação — apresentação não altera o cálculo.

**Lógica observada (verbatim do handler `A.dwE`):**
```js
$1(a){
  var s,r=this.a;
  if(a.length===0) r.e = r.d = 0;          // empty state
  else {
    s = A.aj(A.X(a,",","."));  r.d = (s==null?0:s)*10;   // limite inferior
    s = A.aj(A.X(a,",","."));  r.e = (s==null?0:s)*20;   // limite superior
  }
  r.I(new A.dwD);
}
```

**Template de prescrição (verbatim):**
```js
"Solução Glicerinada 12% - Fazer " + B.e.t(j.d,0) + " mL a " + B.e.t(j.e,0) + " mL "
+ "(10 a 20 mL/kg) via retal uma vez ao dia.\n\nSupositório pediátrico – 1 supositório via retal uma vez ao dia."
```

- **Fórmula:** `dose_min = round(peso × 10, 0 casas)` mL · `dose_max = round(peso × 20, 0 casas)` mL. (= 10 a 20 mL/kg.)
- **Concentração:** Enema Glicerinado 12% (120 mg/mL) — não entra na conta (a faixa 10–20 mL/kg é volumétrica, independe da concentração).
- **Teto / dose máxima:** NENHUM (sem clamp no código).
- **Empty state:** `peso=0/vazio` → `d=e=0`; exibe texto `u.y` = "Informe todos os dados para obter o resultado." (`j.d===0 ? A.h(u.y,...) : null`).
- **Arredondamento:** 0 casas decimais (inteiro) em ambos os limites.
- **Via / intervalo:** Retal, uma vez ao dia. Supositório = 1 unidade via retal 1×/dia (fixo, sem cálculo).
- **Contraindicação:** obstrução intestinal (texto fixo, não gating de idade).

---

## 2. Lactulose — `faixa-etaria-lookup` (SEM cálculo)

- **Inputs:** nenhum. Tela estática (spans `A.N`).
- **Apresentação:** Xarope 667 mg/mL (Lactulona®, Normolax®, Inlact®).
- **Regra observada (lookup por faixa etária, valores fixos em mL/dia, NÃO computa):**

| Faixa etária | Dose (texto fixo) |
|---|---|
| Lactentes | 5 mL/dia |
| 1 a 5 anos | 5 a 10 mL/dia |
| 6 a 12 anos | 10 a 15 mL/dia |
| > 12 anos | 15 a 30 mL/dia |

- **Via/intervalo:** oral, dose única preferencial (manhã ou noite); ajustável p/ 2–3 evacuações/dia.
- **Contraindicação:** intolerância a lactose/galactose/frutose.

---

## 3. Macrogol 3350 — `faixa-etaria-lookup` / dose-em-g/kg-texto (SEM cálculo)

- **Classe:** `A.dxQ`. **Inputs:** nenhum (só spans `A.N`). Sem bloco "Apresentação".
- **Regra observada:** doses em **g/kg como texto literal**, NÃO computadas por peso (não há TextField nem `B.e.t`). "Dose usual" destacada.

| Indicação | Fase | Dose (texto, g/kg/dia VO) | Teto |
|---|---|---|---|
| Constipação | Dose inicial | 0,4–0,8 g/kg | — |
| Constipação | Manutenção | 0,2–1,5 g/kg | **17 g/dia** |
| Desimpactação fecal | Dose inicial | 1–1,5 g/kg (3–6 dias) | **100 g/dia** |
| Desimpactação fecal | Manutenção | 0,4–1 g/kg (≥2 meses, reduzir gradual) | — |

- **Via:** oral.
- **Contraindicação por idade:** **menores de 2 anos** (`contraindication_age` = "< 2 anos").

---

## 4. Hidróxido de magnésio — `faixa-etaria-lookup` (SEM cálculo)

- **Classe:** `A.dwG`. **Inputs:** nenhum (spans `A.N`).
- **Apresentações:** Solução oral 1282,50 mg/15 mL (Leite de Magnésia de Phillips Original®) · Solução oral 1214,25 mg/15 mL (Leite de Magnésia de Phillips Hortelã®).
- **Regra observada (lookup por faixa, mL fixos, NÃO computa):**

| Faixa etária | Dose (texto fixo) |
|---|---|
| 2 a 5 anos | 5 a 15 mL VO 1×/dia |
| 6 a 12 anos | 15 a 30 mL VO 1×/dia |
| > 12 anos | 30 a 60 mL VO 1×/dia |

- **Via/intervalo:** oral, 1×/dia.
- **Contraindicação por idade:** **menores de 2 anos**. Período máximo de uso: 3 dias consecutivos (condicional textual).

---

## 5. Óleo mineral — `faixa-etaria-lookup` / 1 ramo mL/kg-texto (SEM cálculo)

- **Classe:** `A.dzq`. **Inputs:** nenhum (spans `A.N`).
- **Apresentação:** Frasco — Nujol®.
- **Regra observada (faixas fixas + um range mL/kg como texto, NÃO computa):**

| Indicação | Faixa/Grupo | Dose (texto fixo) | Teto |
|---|---|---|---|
| Constipação ocasional | 6 a 11 anos | 5 a 15 mL VO à noite | — |
| Constipação ocasional | > 12 anos | 15 a 45 mL VO à noite | — |
| Constipação crônica | Crianças e adolescentes | 1 a 3 mL/kg/dia (texto, não computa) | **90 mL/dia** |
| Desimpactação fecal | — | "preferir macrogol 3350" (sem dose) | — |

- **Via/intervalo:** oral à noite.
- **Contraindicação por idade/condição:** **menores de 6 anos** e neuropatas, via oral (risco de aspiração).

---

## Notas de fidelidade / FLAGS

1. **Só Glicerina computa.** Fórmula exata e verificada no código: `peso×10` (min) e `peso×20` (max), arredondados a 0 casas, sem teto. Concentração do enema (120 mg/mL / 12%) NÃO entra na conta.
2. Macrogol (g/kg) e Óleo mineral crônico (mL/kg) **têm coeficientes por peso na PROSA, mas o app NÃO os computa** — exibe o range textual. Se o motor novo quiser computar, precisa de decisão de produto (não há fórmula no AS-IS).
3. Tetos (Macrogol 17/100 g/dia; Óleo mineral 90 mL/dia) são **texto**, não clamps de cálculo no AS-IS.
4. Contraindicações por idade são **texto fixo** em Macrogol (<2a), Hidróxido (<2a), Óleo mineral (<6a). Lactulose e Glicerina não têm gating por idade (Lactulose contraindica por intolerância; Glicerina por obstrução intestinal).
