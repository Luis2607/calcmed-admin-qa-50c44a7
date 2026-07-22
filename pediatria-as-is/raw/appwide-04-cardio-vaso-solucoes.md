# App-wide AS-IS — Domínio 04: Cardiovascular/Arritmias + Vasoativas + Soluções + Toxicologia

> Fonte: `_source/main.decoded.js` (bundle Flutter web decodificado, 11 MB). Lado ADULTO/transversal (pediatria já auditada em raw/01-05).
> Método: grep -b por slug/string clínica + leitura de slices por offset. Constructores Dart relevantes:
> - `A.cr(nome, slug, …, rota, icone, …)` = registro de categoria.
> - `A.bH(nome, …, id, …)` = item de lista expansível (sub-tela dentro de uma categoria).
> - `A.fO(nAmpolas, mLdiluente, mgPorAmpola, concMcgPorML, label)` e `A.mw(qtd, mLdiluente, conc, label)` = receitas de diluição padronizada.
> - `A.aR(label, valorMultiplicador, idx)` / `A.eb(nome, conc1, conc2, idx)` = opções de dropdown (apresentações).
> - `A.a9(sufixo, prefixo, …, valorCalculado, …)` = string clínica com número calculado embutido.
> Fidelidade: fórmulas/doses/critérios transcritos EXATAMENTE do bundle. Incertezas flagadas com ⚠️.

Mapa de rotas confirmado no registry (`A.aG`/`A.ib` em offset ~3.297M): cada feature vive em `/equation/category/<slug>` e mapeia para uma classe-widget (ex.: `cardioversao-eletrica`→`O7`, `taquiarritmia`→`PN`, `bradicardia`→`O2`, `antiarritmicos`→`NP`, `antidotos`→`NX`, `anticonvulsivantes`→`NV`, `anticoagulants`→`aAv`, `drogas-vasoativas`→`OH`, `solucoes-padronizadas`→`PJ`, `my-solutions`→`aQ1`, `pacemeter`→`aQW`, `parametros_iniciais`→`HX`, `dividir-descanso`→`c3M`).

> ⚠️ Nota: `drogas-vasoativas-vazao_volume`, `volume` ("Por Volume"/"Por Vazão") aparecem no menu mas pertencem aos CONVERSORES de fluxo; documentados como variantes do conversor mL/h↔mcg.

---

## A. CARDIOVASCULAR / ARRITMIAS (protocolos-conduta interativos)

### A.1 Bradicardia (adulto) — `/equation/category/bradicardia`
- **Tipo:** protocolo-conduta interativo (árvore de decisão SIM/NÃO). Controller `_CategoryBradicardiaControllerBase` (estados `b`,`c`).
- **Inputs:** botões binários (SIM/NÃO) — não pede peso.
- **Lógica/conteúdo (transcrição literal):**
  - Cabeçalho mnemônico **MOVE**: "**M**onitorização / **O**xigênio (Se Sat O₂<90%) / **V**eia (acesso venoso) / **E**letrocardiograma".
  - Pergunta gatilho: "Bradiarritmia persistente causando:" Dispneia · Síncope · Dor torácica anginosa · Hipotensão · "Rebaixamento do nível de consciência:" → toggle **SIM/NÃO**.
  - Se **SIM**: "Faça: **Atropina 1 mg EV em bolus.** -Repita a cada 3 a 5 min. -Dose máxima 3 mg (3 doses)."
  - Depois "Bradiarritmia resolvida?" SIM/NÃO:
    - **SIM** → "Considere avaliação de especialista."
    - **NÃO** → bloco: "**Marcapasso transcutâneo**" + 2 receitas BIC:
      - "**Dopamina** 5 ampolas + 200 mL SG 5% EV em BI (1.000 mcg/mL) — Dose usual: **5 a 20 mcg/kg/min**. Titule conforme resposta."
      - "**Adrenalina** 12 ampolas + 188 mL SG 5% EV em BI (60 mcg/mL) — Dose usual: **2 a 10 mcg/min**. Titule conforme resposta."
      - "Considere avaliação de um especialista. Considere marcapasso transvenoso." + link → `/equation/category/drogas-vasoativas`.
  - Se **NÃO** (sem sinais): "Monitore e observe."

### A.2 Taquiarritmia (adulto) — `/equation/category/taquiarritmia`
- **Tipo:** protocolo-conduta interativo. Controller `_CategoryTaquiarritmiaControllerBase` (estados: `persistentTachyarrhythmia` etc.).
- **Inputs:** toggles binários (estável/instável, QRS, etc.).
- **Lógica/conteúdo:** cabeçalho **MOVE** igual ao da bradicardia. Ramos:
  - Ramo "instável / cardioversão": "- Infusão de antiarrítmico (considere amiodarona). - Adenosina, somente se regular e monomórfico." + "Para auxílio com a prescrição, acesse:" → link Soluções Padronizadas/antiarrítmicos.
  - "- Tratar a causa subjacente. Considere **Cardioversão Elétrica Sincronizada**." + link → `/equation/category/cardioversao-eletrica`.
  - Ramo "estável QRS estreito": "- Manobra vagal / - Adenosina / - Betabloqueadores ou bloqueadores de canais de cálcio" + link.
  - Outro ramo: "- Betabloqueadores ou bloqueadores de canais de cálcio. - Considere avaliação de especialista." / "- Avaliação de especialista."

### A.3 Cardioversão Elétrica — `/equation/category/cardioversao-eletrica`
- **Tipo:** calculadora (peso→sedação) + tabela-decisão (cargas). 2 abas registradas: **"Analgesia e Sedação"** (id 0) e **"Cargas"** (id 1). Controller `_CategoryCardioversaoEletricaControllerBase` (estados `weight`, `hasApulse`, `qrsNarrow`, `qrsRegular`).
- **Aba "Analgesia e Sedação"** — input **Peso (kg)**, calcula mL EV (multiplicadores literais):
  - **Fentanil (50 mcg/mL)** — peso×0,01 a peso×0,02 mL EV.
  - **Propofol 2% (20 mg/mL)** — peso×0,025 a peso×0,05 mL EV.
  - **Fentanil (50 mcg/mL)** (2ª opção) — peso×0,01 a peso×0,02 mL EV.
  - **Etomidato (2 mg/mL)** — peso×0,05 a peso×0,1 mL EV.
- **Aba "Cargas"** — árvore: "Tem pulso?" → "QRS: Estreito/Largo" → "Ritmo: Regular/Irregular":
  - QRS estreito + irregular (Ex.: Fibrilação Atrial): **120 a 200 Joules - Bifásico**.
  - QRS estreito + regular (Ex.: Flutter Atrial e Taquicardia Supraventricular): **50 a 100 Joules - Bifásico**.
  - QRS largo + regular: Taquicardia Ventricular com pulso → **100 Joules - Bifásico**.
  - QRS largo + irregular, se TV polimórfica → **Desfibrilar – 200 Joules - Bifásico**.
  - Sem pulso (checar ritmo, TV sem pulso ou FV): **Desfibrilar 200 Joules (bifásico) / 360 Joules (monofásico)**.
  - Notas: "Nota 1: Titule cargas maiores de energia se forem necessários choques adicionais." / "Nota 3: Considere avaliação de especialista."

### A.4 Antiarrítmicos — `/equation/category/antiarritmicos`
- **Tipo:** tabela-referência de diluições/doses (lista expansível "Diluições e Doses", título "Antiarrítmicos"). 3 itens: **Adenosina (1)**, **Amiodarona (2)**, **Metoprolol (EV) (3)**.
- **Adenosina:** "Primeira dose: **6 mg EV em bolus.** Seguido de bolus com solução salina." → "Se necessário: Segunda dose: **12 mg EV.** Seguido de bolus com solução salina."
- **Amiodarona** (cardioversão química de FA / Taquiarritmia ventricular incessante):
  - "**Amiodarona (150 mg/3mL) 1 ampola + 100 mL SG 5% EV em 10 minutos.**"
  - Seguido de: "Amiodarona (150 mg/3mL) **6 ampolas + 482 mL SG 5% EV em BIC a 33.3 mL/h durante 6 horas**;"
  - "Nas **18 horas** seguintes, correr em BIC a **16,6 mL/h**."
  - Após 24h: "Amiodarona VO **400 a 1200 mg/dia** (dividido em 2 a 3 doses) até atingir a dose cumulativa de **6 a 10 g**. A partir de então mantenha **200 a 400 mg/dia**."
- **Metoprolol (EV) / Tartarato de metoprolol** (ampola 1 mg/mL - 5 mL): "Metoprolol **5 mg EV em 2 a 3 minutos. Faça a cada 5 minutos** até resposta satisfatória. Geralmente uma dose total de **10-15 mg** é suficiente."

---

## B. DROGAS VASOATIVAS (adulto) — `/equation/category/drogas-vasoativas`

- **Tipo:** calculadora-de-infusão (BIC) com 10 sub-telas (uma por droga). Widget `OH`; cada droga é um `A.bH`. Lista registrada (ordem): **Noradrenalina(1), Vasopressina(10), Adrenalina(2), Dobutamina(6), Nitroprussiato de Sódio (Nipride®)(3), Nitroglicerina (Tridil®)(4), Dopamina(5), Levosimendan(8), Milrinona(9), Azul de Metileno(11)**.
- **Padrão de cada sub-tela (inputs → output):** seleção de apresentação/ampola, "Nº de ampolas", "mL de soro" → calcula **Concentração (mcg/mL)**; "Peso (kg)"; "Defina a dose (mcg/kg/min)" → **output: vazão em BIC (mL/h)**. Também há diluições padronizadas pré-prontas (constructores `fO`/`mw`).
- **Doses usuais (transcrição literal):**

| Droga | Dose usual (texto do app) |
|---|---|
| Noradrenalina | ⚠️ texto via string calculada (não literal no bundle); diluições padrão abaixo |
| Adrenalina | (em protocolos) **2 a 10 mcg/min** titulável; infusão |
| Dopamina | **2-20 mcg/kg/min** (offset 3842153); em bradicardia **5 a 20 mcg/kg/min** |
| Dobutamina | ⚠️ via string calculada; diluições padrão abaixo |
| Nitroprussiato de Sódio | **0,25 a 0,5 mcg/kg/min** inicial; **Dose máxima: 10 mcg/kg/min** |
| Nitroglicerina (Tridil®) | **Dose usual inicial: 5 mcg/min** |
| Milrinona | **0,125 mcg/kg/min, titular até 0,75 mcg/kg/min** |
| Levosimendan | **0,05 - 3,3 mcg/kg/min** ⚠️ (e variante "0,05 a 0,2 mcg/kg/min" / ataque "6 a 12 mcg/kg em 10 min") |
| Vasopressina | **0,01-0,04 U/min** |
| Azul de Metileno | "Dose usual na vasoplegia associada a cirurgia cardíaca: Ataque **1 a 2 mg/kg durante 20 a 60 min**; Manutenção **0,5 a 1 mg/kg/h** (Requer validação com ensaios clínicos)" |

- **Diluições padronizadas embutidas (literal, `fO`/`mw`):**
  - Noradrenalina (4 mg/4 mL): 4amp+234mL SG5% (64 mcg/mL) · 5amp+180mL (100 mcg/mL) · 8amp+218mL (128 mcg/mL); variantes ½amp+248mL SG5% (8 mcg/mL) e 1amp+246mL (16 mcg/mL).
  - Adrenalina (1 mg/mL): 12amp+188mL SG5% (60 mcg/mL); 1amp+99mL (10 mcg/mL); 4amp+246mL (16 mcg/mL).
  - Vasopressina 20 U/mL: 1mL+99mL SF0,9% (0,2 U/mL); 2mL+98mL (0,4 U/mL); 1mL+199mL (100 mU/mL).
  - Dobutamina (250 mg/20 mL): 4amp+170mL (4.000 mcg/mL); 2amp+210mL (2.000 mcg/mL); 1amp+230mL SG5% (1.000 mcg/mL).
  - Milrinona (1 mg/mL): 2amp+80mL (200 mcg/mL); 4amp+210mL (160 mcg/mL).
  - Nitroprussiato de sódio (50 mg/2 mL): 1amp+248mL SG5% (200 mcg/mL); 2amp+246mL (400 mcg/mL); ½amp+249mL (100 mcg/mL).
  - Dopamina (5 mg/mL): 5amp+200mL (1.000 mcg/mL); 1amp+240mL SG5% (200 mcg/mL).
- **Premium:** ⚠️ não há flag de gating literal próximo; calculadoras parecem livres.

---

## C. CONVERSORES DE INFUSÃO (transversais, ferramenta)
Categoria "Conversores" (registro em ~365k). Cada um é uma calculadora-fórmula simples (sem clínica). Dropdown `eb(...)` de drogas com concentrações de referência: **Noradrenalina(1;4), Adrenalina(1;1), Dobutamina(12.5;20), Dopamina(5;10), Midazolam ampola 10mL(5;10), Fentanil ampola 10mL(0,05;10)**.

| Nome | Rota | Tipo |
|---|---|---|
| Conversor mL/h → mcg/kg/min | `conversor-mlh-mcg` | conversor |
| Conversor mcg/kg/min → mL/h | `conversor-mcg-mlh` | conversor |
| Conversor mL/h ↔ gts/min | `conversor-mlh-gtsmin` | conversor |
| Conversor % → mg/mL | `conversor-porcentagem-mgml` | conversor |
| Conversor mL/h → mcg/min | `conversor-mlh-mcgmin` | conversor |
| Conversor mcg/min → mL/h | `conversor-mcgmin-mlh` | conversor |
| Conversor de Corticóides | `conversor-corticoides` | conversor (dose-equivalência) |

> ⚠️ Conversor mL/h↔gts/min usa o fator macrogotas/3 visível em offsets ~33k (`/3`). Unidade "Por Volume"/"Por Vazão" do menu são modos do conversor de drogas vasoativas.

---

## D. SOLUÇÕES (ferramentas de diluição)

### D.1 Soluções Padronizadas — `/equation/category/solucoes-padronizadas`
- **Tipo:** tabela-referência de diluições ("Diluições e Doses"), widget `PJ`. Itens: 3,4,6,7,8,9,10. Inclui combos de sedação:
  - **Ketodex (a0R):** "Hipnótico/Analgésico". Preparo: "1 seringa de insulina + 1 seringa de 10 mL · 2 UI/kg Cetamina (50 mg/mL) · 1 UI/kg Precedex® (Dexmedetomidina) (100 mcg/mL) · 10 mL AD/SF 0,9%". Dose usual: "1 mcg/kg Precedex® + 1 mg/kg de Cetamina".
  - **Ketofol (a0S):** ⚠️ análogo (combo cetamina+propofol) — mesmo padrão de card.
  - Demais itens (3,4,6,7,10) = soluções padronizadas de drogas/medicações.

### D.2 Soluções Personalizadas / "minhas soluções" — `/equation/category/my-solutions`
- **Tipo:** FERRAMENTA (CRUD de soluções do usuário). Título "Soluções Personalizadas" / "custom_solutions". Widget `aQ1`/`beU`.
- **Funções:** listar soluções salvas; "Adicionar nova solução" (rota `/my-solutions/new`); excluir ("Deseja excluir essa solução?" → "Solução excluida com sucesso!"). Empty state: "Nenhuma solução encontrada. Ops...". Persistência offline.
- **Premium:** ⚠️ provável gated (feature de conta/salvar) — não confirmado por flag literal.

---

## E. TOXICOLOGIA / ANTÍDOTOS — `/equation/category/antidotos`
- **Tipo:** tabela-referência (lista expansível, título "Urgências"), widget `NX`. 2 itens: **Flumazenil (1)**, **Naloxona (2)**.
- **Flumazenil** (Apresentação 0,1 mg/mL ampola 5 mL):
  - Reversão sedativo pós-procedimento/anestesia: "**Flumazenil 1 ampola + 5 mL SF 0,9% (ou SG 5%) – Fazer 4 mL (0,2 mg) EV em 2 minutos.** Pode ser repetido a cada 1 minuto … até 4 vezes. **Dose máxima cumulativa: 1 mg**."
  - Superdosagem (uso rotineiro controverso): mesma dose inicial; se não atingir em 30s → "0,3 mg (6 mL) EV em 3 min"; depois "0,5 mg (10 mL) EV em 5 min, repetir em intervalos de 1 min. **Dose máxima cumulativa: 3 mg**."
- **Naloxona** (Apresentação 0,4 mg/mL ampola 1 mL):
  - Overdose de opioides: "**Naloxona 1 a 5 mL (0,4 mg a 2 mg) EV/IM/SC em bolus rápido.** Repetir a cada 2-3 min. **Dose máxima cumulativa: 10 mg**."
  - Reversão de depressão respiratória pós-dose terapêutica: "Naloxona 1 ampola + 9 mL SF 0,9% - Fazer **0,5 a 5 mL (0,02 mg a 0,2 mg) EV em bolus rápido.** Titule…"
  - Reversão de narcose pós-operatória: "Naloxona **0,1 a 0,2 mg EV em bolus rápido.** Repetir a cada 2-3 min."

> ⚠️ Glucagon e Azul de Metileno aparecem em outras seções (antídotos de superdose β-bloqueador / metahemoglobinemia) mas não dentro do screen `antidotos`; Azul de Metileno está em drogas-vasoativas.

---

## F. ANTICOAGULANTES — `/equation/category/anticoagulants` (widget `aAv`)
- **Tipo:** tabela-referência de prescrição por cenário clínico (abas), com ajuste por **ClCr** (função renal) e sub-tela **Varfarina** (reversão de sangramento). Telas (`aH*`):
  - **FA / anticoagulação (aHA):** Apixabana 5 mg VO 12/12h (→2,5 mg se 2 de: idade≥80 / peso≤60kg / Cr≥1,5; ou ClCr 15-30) · Rivaroxabana 20 mg/dia (ClCr 15-50→15 mg; <15 evitar) · Dabigatrana 150 mg 12/12h (ClCr 15-30→75 mg evitar; <15 contraindicado) · Edoxabana 60 mg/dia (≥65a+peso≤60kg ou P-gp→30 mg; ClCr>95 contraindicado; 50-95 sem ajuste; 15-50→30 mg; <15 contraindicado) · Varfarina dose individualizada, **INR 2-3**.
  - **Profilaxia TEV (aHG):** Enoxaparina 40 mg SC 1x/dia (moderado-alto risco TEV); Apixabana 2,5 mg 12/12h (artroplastia quadril/joelho, iniciar 12-24h pós-cx); Rivaroxabana 10 mg/dia (joelho 10-14 dias, quadril 30 dias).
  - **IAM com Supra ST (aHI):** Enoxaparina <75a: bolus 30 mg EV + 1 mg/kg SC 12/12h (máx 100 mg nas 2 primeiras doses); ≥75a: sem bolus, 0,75 mg/kg SC 12/12h (máx 75 mg).
  - **Angina instável/IAMSSST (aHJ):** Enoxaparina 1 mg/kg SC 12/12h.
  - **Tratamento de TEV (aHN):** Enoxaparina 1 mg/kg SC 2×/dia OU 1,5 mg/kg 1×/dia; Apixabana 10 mg 12/12h ×7 dias → 5 mg 12/12h (≥3 meses); Rivaroxabana 15 mg 12/12h c/ alimento ×21 dias → 20 mg/dia; Dabigatrana/Edoxabana após ≥5 dias de parenteral; com ajustes ClCr.
  - **Trombo VE pós-IAM (aHO):** Apixabana 5 mg 12/12h; Rivaroxabana 20 mg/dia no jantar; ≥3 meses.
  - **Reversão de Varfarina (sub-tela):** Sangramento menor → "1. Suspender varfarina temporariamente 2. Monitorar INR 3. Considerar vitamina K oral 2,5 a 5 mg … 4. Reavaliar INR em 24 horas". Sangramento maior/risco à vida → (bloco subsequente).

---

## G. ANTICONVULSIVANTES / CRISE CONVULSIVA (Status Epilepticus) — `/equation/category/anticonvulsivantes` (widget `NV`, controller `_CategoryAnticonvulsivantesControllerBase`)
- **Tipo:** protocolo multi-step **dirigido por peso** (input "Peso kg" → calcula mL de cada droga). Estrutura por tempo/linha:
  - **Exames:** "Hemograma, sódio, potássio, cálcio, magnésio, glicemia, enzimas hepáticas, gasometria arterial, toxicológico, níveis séricos de antiepilépticos de uso habitual, troponina."
  - "Se hipoglicemia, fazer:" (bloco).
  - **Primeira linha (10 min iniciais):** Diazepam (5 mg/mL) — peso→ mL EV em 2 min (**0,15 mg/kg – máx: 10 mg/dose**), repetir 1× se crises após 5 min. Se falha de acesso: **Midazolam IM** (**0,2 mg/kg – máx 10 mg/dose**) ou Diazepam Via Retal (**0,2 mg/kg – máx 20 mg/dose**).
  - **Segunda linha (10–30 min):** "1) Fenitoína" e "2) Fenobarbital":
    - **Fenitoína** (50 mg/mL, ampola 5 mL): ataque **20 mg/kg EV** (algumas refs 10-15 mg/kg) → mL + 250-500 mL SF0,9% EV em 30 min; dose adicional **10 mg/kg** 10 min após; manutenção 8-12h após ataque, **100 mg a cada 6/8/12h**; **Dose Máxima: 2g EV**; "Taxa não > 50 mg/min ou 1 mg/kg/min; não diluir em soro glicosado."
    - **Fenobarbital** (100 mg/mL, ampola 2 mL): ataque **15 a 20 mg/kg EV** → mL + 250 mL SF0,9%; adicional **5 a 10 mg/kg** 10 min após; manutenção 24h após, **50 a 100 mg VO 12/12h**; "Taxa não > 100 mg/min ou 2 mg/kg/min."
  - **Terceira linha (status refratário):** "Proceder a IOT; Solicitar vaga UTI; Monitorizar com EEG". "1) Midazolam", "2) Propofol" (Propofol: ataque **1 a 2 mg/kg em 5 min**, infusão **20 a 200 mcg/kg/min**, repetível 0,5-2 mg/kg; "Se crises persistirem após 45-60 min, mudar para midazolam"). + Cuidados pós (neuroimagem, EEGc, vasopressor se PAM<70 ou PAS<90, etc.).

---

## H. PARÂMETROS INICIAIS (Ventilação Mecânica) — `/equation/category/parametros_iniciais` (widget `HX`)
- **Tipo:** tabela-referência por faixa etária (cross-domínio: ventilação, não cardio — incluído porque estava no escopo).
- **Input:** dropdown **Faixa Etária**: "Neonatos Pré-termo / Neonatos a Termo / < 1 ano / 1 a 12 anos / > 12 anos".
- **Output:** "Resultados da Ventilação PCV/VCV" com faixas: Pressão Inspiratória (cmH₂O), Frequência Respiratória (irpm), PEEP, Pressão de Suporte (mínimo), FiO₂, Tempo Inspiratório (s), Relação I:E. Em VCV computa Volume Corrente por mL/kg (saudável 5-8 mL/kg; protetora 3-6 mL/kg, multiplicado pelo peso).

---

## I. FERRAMENTAS UTILITÁRIAS (não-clínicas)

### I.1 Dividir Descanso — `/equation/category/dividir-descanso` (widget `c3M`/`OE`/`LQ`)
- **Tipo:** ferramenta (divisor de plantão). Controller `_CategoryDividirDescansoControllerBase`.
- **Inputs:** horário de início, horário de fim, nº de plantonistas, nomes ("Plantonista N").
- **Lógica:** total = (fimH×60+fimM) − (iniH×60+iniM); se negativo +1440 (vira a meia-noite); tempo por turno = total/N (arredondado para baixo), formatado HH:MM; gera lista `plantonistasList`.
- **Output:** tempo total e tempo por plantonista + lista nomeada.

### I.2 Pacemeter / Passômetro — `/equation/category/pacemeter` (widget `aQW`, 102 ocorrências)
- **Tipo:** ferramenta de gestão de pacientes (passômetro/handoff), com **persistência offline + sync** (chaves `pacemeters_<id>`).
- **Inputs por paciente:** "ID" (ex.: "Leito 01"), "Iniciais do nome" (ex.: "J.B.C."), "Idade", Diagnóstico/Hipótese, Pendência, Evolução.
- **Funções:** "Novo Paciente", listar, editar, deletar (`tv`/`GC`), reordenar; estado offline. Retry com backoff (até 3×).
- **Premium:** ⚠️ provável gated (feature de conta) — não confirmado por flag literal.

---

## PADRÕES (arquétipos observados neste domínio)

1. **Protocolo-conduta interativo (árvore SIM/NÃO):** Bradicardia, Taquiarritmia, Cardioversão(aba Cargas). Estado booleano por nó (`b`,`c`,`qrsNarrow`…); UI revela blocos condicionalmente; cabeçalho mnemônico fixo (MOVE). Sem peso. Termina em conduta textual + link para outra calculadora.

2. **Calculadora-de-infusão (peso × dose × diluição → mL/h):** Drogas Vasoativas (10 telas), Cardioversão(aba Sedação). Inputs: apresentação + nº ampolas + mL soro → Concentração; Peso; Dose alvo → vazão BIC. "Dose usual" como referência. Diluições padrão embutidas via `fO`/`mw`.

3. **Tabela-referência de doses/prescrição (cards expansíveis, sem cálculo):** Antiarrítmicos, Antídotos, Soluções Padronizadas, Anticoagulantes. Lista de `bH` → card com "Apresentação / Dose usual / Prescrição / Cuidados". Anticoagulantes adiciona eixo de decisão por ClCr.

4. **Protocolo multi-step dirigido por peso (dose calculada em mL):** Anticonvulsivantes/Status epilepticus, Fenitoína/Fenobarbital. Peso → mL de cada droga por linha de tratamento (1ª/2ª/3ª linha), com tetos ("máx X mg/dose", "Dose Máxima 2g").

5. **Conversor-fórmula-simples:** os 7 conversores de infusão/corticóides. Sem clínica; dropdown de concentrações de referência; multiplicadores literais (ex.: gts = mL/h × 1/3).

6. **Tabela-referência por faixa-etária/segmento:** Parâmetros Iniciais de VM (faixa etária → ranges PCV/VCV).

7. **Ferramenta utilitária com persistência:** Dividir Descanso (cálculo de tempo), Pacemeter/Passômetro (CRUD offline), Soluções Personalizadas (CRUD de diluições do usuário). Provavelmente gated por conta.

> ⚠️ Pontos a confirmar: (a) gating premium não tem flag literal próxima nas calculadoras — inferência por tipo de feature (salvar/conta = provável gated); (b) Noradrenalina/Adrenalina/Dobutamina "Dose usual" usam strings calculadas `A.a9`, não literais — ranges acima vêm dos embeds nos protocolos; (c) Ketofol (item 8 `a0S`) lido por simetria com Ketodex (`a0R`), conteúdo exato do preparo não transcrito 1:1.
