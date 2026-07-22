# App-wide AS-IS — Protocolos / condutas adultas

> Fonte: `_source/main.decoded.js` (bundle Flutter `main.dart.js` decodificado).
> Método: `scout.js` (rotas + marcadores) → `grep -boa` por âncora clínica → `slice.js <start> <end>` por offset.
> Escopo deste arquivo: **cetoacidose-diabetica, hiperglicemia, hipoglicemia, enxaqueca, trombolise, cirrose, injuria-renal-aguda** (+ a correção de sódio pela glicemia, irmã da CAD).
> FIDELIDADE: doses/fórmulas/critérios transcritos **literalmente** do bundle. Quebras de linha originais marcadas. Onde a regra está em código (não em string), descrevo a lógica + cito a evidência.

---

## Arquitetura observada (como esses protocolos são montados)

1. **Registro de categoria** (offset ~365K): cada feature é um `new A.cr("Nome", …, "/equation/category/<slug>", "<icone>.svg", …, fontSize, b1,b2,b3,b4)`. Os 4 booleans no fim são flags de UI (a maioria `!1,!1,!1,!1`; alguns como Enxaqueca/Crise Convulsiva/Ácido-Básicos/Ventilação Mecânica têm `!0` na 2ª posição = flag visual, **não** premium).
2. **Roteamento** (offset ~3.30M): `A.aG(a,"/category/<slug>", new A.cXX(a), s)` mapeia cada slug a uma **classe widget** (ex.: `cetoacidose-diabetica → A.PT`, `trombolise → A.PR`, `enxaqueca → A.OI`, `cirrose → A.O9`, `injuria-renal-aguda → A.OS`, `hipoglicemia → A.OP`, `hiperglicemia → A.OL`, `sodio-hiperglicemia → A.Or`).
3. **Menu/abas** (offset ~10.72M, função `fsv`): cada protocolo declara suas sub-abas com `A.ax(...,"<titulo>")`. Ex.: CAD tem 8 abas; Trombólise 3; Enxaqueca 2; Cirrose 2.
4. **Conteúdo clínico**: na esmagadora maioria está **HARDCODED no app** (strings literais nos `u` builders / `A.h(...)`, `A.mC(...)`, `A.a9(...)`). NÃO vem do Supabase para estes protocolos adultos. (O backend dinâmico `gad.c` é passado, mas o texto de dose está no binário.)
5. **Premium/gating**: os flags `isFree`/`isPremium`/`maxInteractions` encontrados pertencem ao **Chat IA** (`A.PV _ChatIAControllerBase`) e à assinatura, **não** a estas calculadoras. Conclusão: protocolos adultos = **LIVRES** (sem evidência de paywall por protocolo). `[inferência — flag de premium não aparece ligada a estas rotas]`

---

## CLUSTER A — Protocolo multi-step navegável (abas)

### A1. Cetoacidose Diabética (CAD) — `/equation/category/cetoacidose-diabetica`
- **Tipo:** protocolo-conduta multi-step (8 abas) com mini-calculadoras embutidas.
- **Header:** "Urgências" / título. Widget `A.PT`; abas montadas em `eVO` (offset ~567K) e builders `aDz/aNa/aaw/aat/aau/alx/aDw/aav`.
- **8 abas (ids 1–8):** "Critérios Diagnóstico", "Manejo Inicial", "Após o Diagnóstico", "Antes da Insulina", "Após avaliar o Potássio", "Reavaliação da CAD", "Correção da CAD", "Após correção da CAD".

**Aba 1 — Critérios Diagnóstico** (`aDz`, texto literal):
- "• Glicemia ≥ 200 ou histórico de diabetes"
- "• Acidose metabólica (pH venoso < 7,3 ou HCO₃ < 15 mEq/L)"
- "• Presença de cetose (cetonuria ≥ 2+ e/ou cetonemia ≥ 3 mmol/L)"

**Aba 2 — Manejo Inicial** (`aNa`, literal):
- "1ª hora:"
- "• Se HGT > 250 -> Iniciar 15 a 20 mL/kg de SF 0,9% - EV (1 a 1,5 L/hora)"
- "• Se HGT < 250 -> Iniciar 1 L de SG 5% + 40 mL de NaCl 20% - EV"
- "• Exames: Hemograma, glicemia, urina tipo I, gasometria arterial ou venosa, lactato, ureia, creatinina, sódio, potássio, cloro, magnésio, fosfato, amilase, lipase, cetona sérica (beta-hidroxibutirato, acetona e acetoacetato), eletrocardiograma, RX de tórax."

**Aba 3 — Após o Diagnóstico** (`aaw`, mini-calc Sódio corrigido + bicarbonato):
- Inputs: "Sódio medido" (mEq/L), "Glicose" (mg/dL).
- **Fórmula (código):** `gbtk{return this.d+0.016*(this.e-100)}` → **Na corrigido = Na medido + 0,016 × (Glicose − 100)**.
- Pergunta condicional "Sódio Corrigido < 135?" → SIM/NÃO:
  - **SIM** → mostra bloco + "pH < 7.0?":
    - se pH<7.0: "• Repor bicarbonato: NaHCO₃ 8,4% - 100 mL + AD - 400 mL EV em 2h / • Repetir a cada 2h até pH > 7.0"
    - se pH≥7.0: "• Não repor bicarbonato."
  - **NÃO** → oferece solução "SF 0,45%" (modal: "Água Destilada 490 mL + Cloreto de Sódio (NaCl) 20% - 10 mL - Fazer EV em BIC") + mesma lógica pH<7.0.
  - Auto-trigger: `bz9{ if(gB4 && gbtk<135) f=true }` (abre ramo SIM quando Na corrigido < 135).

**Aba 4 — Antes da Insulina** (`aat`, sub-abas por potássio — "Medir K⁺ antes de iniciar insulina"):
- **K⁺ < 3,5** (`bgJ`): "Não inicie a insulina! / Administre em 1 hora, 1 ampola de KCl 19,1% (ou 1 ampola de KCl 15% ou 2 ampolas de KCl 10%) na solução que está sendo administrada. / • Repita se necessário, até K⁺ > 3,5. / • Dose o K⁺ sérico a cada 2 horas."
- **K⁺ 3,5 a 5** (`bgK`): "Administre 1 ampola de KCl 19,1% (ou 1 ampola de KCl 15% ou 2 ampolas de KCl 10%) a cada litro da solução que está sendo administrada. / • Mantenha K⁺ entre 4 e 5 / • Dose o K⁺ sérico a cada 2 horas / • Pode iniciar insulina"
- **K⁺ > 5** (`bgI`): "• Não administre K⁺ / • Dose o K⁺ sérico a cada 2 horas / • Pode iniciar insulina"

**Aba 5 — Após avaliar o Potássio** (`aau`, mini-calc insulina por peso):
- Aviso: "Só iniciar se K⁺ > 3,5". Input "Peso" (kg). Toggle HGT atual: "<250" vs "≥250".
- **HGT < 250** (literal, com `peso*0.05`):
  "Insulina Regular em BIC (0,05 UI/Kg/h) / Solução: 100 mL de SF 0,9% + 1 mL (100 UI) de Insulina Regular (1 UI/mL) / Iniciar: {peso×0.05} mL/h EV em BIC / Associado a: 1 L de SG 5% + 20 mL de NaCl 20% - EV - 150 a 250 mL/h / HGT 1/1 hora."
- **HGT ≥ 250** (literal, com `peso*0.1`):
  "Insulina Regular em BIC (0,1 UI/Kg/h) / Solução: 100 mL de SF 0,9% + 1 mL (100 UI) de Insulina Regular (1 UI/mL) / Iniciar: {peso×0.1} mL/h EV em BIC / Opcional: Bolus: {peso} × 0,1 = {peso×0.1} mL EV antes da infusão em BIC / HGT 1/1 hora."

**Aba 6 — Reavaliação da CAD** (`alx`, lógica de titulação por variação de HGT — `gaba`):
- Inputs: "HGT atual", "HGT 1 hora antes", "Velocidade atual da insulina" (mL/h). Mostra "Variação: {atual−anterior}".
- Lógica literal (`l`=HGT atual, `r.f`=velocidade):
  - HGT≥200 **e** (atual−anterior)≥70 → "Reduzir a velocidade de infusão em 50%: {f/2} mL/h\n- Novo HGT em 1 hora"
  - HGT≥200 **e** variação 50–69 → "Manter a velocidade de infusão: {f} mL/h..."
  - HGT≥200 **e** variação <50 → "Aumentar a velocidade de infusão em 50%: {f*1.5} mL/h..."
  - HGT 100–199 → "Reduzir a velocidade de infusão em 50%: {f/2} mL/h\n\n- Mantenha Glicemia entre 150 e 200 mg/mL até resolução da CAD.\n- Mantenha: 1 L de SG 5% + 20 mL de NaCl 20% - EV - 150 a 250 mL/h\n- Novo HGT em 1 hora"
  - HGT <100 → "- Interromper a insulina por 15 minutos;\n- Realizar 20 mL de GH 50% EV a cada 15 minutos, até HGT > 140;\n- Novo HGT em 15 minutos;\n- Reiniciar insulina quando HGT > 140, em velocidade 50% menor: {f/2} mL/h"

**Aba 7 — Correção da CAD** (`aDw`, critérios de resolução):
- "1) HGT < 200" / "2) HCO₃⁻ ≥ 15 ou pH ≥ 7.3" / "3) Ânion Gap ≤ 12" (o termo "Ânion Gap" é link clicável → navega para `/equation/category/anion-gap`).

**Aba 8 — Após correção da CAD** (`aav`, sub-abas):
- "Usava insulina antes da CAD:" (`bm6`): "• Reiniciar esquema SC anterior de insulinoterapia. / • Interrompa insulina EV e demais soluções 2 horas após iniciar insulina SC. / • Encaminhar à endocrinologia."
- "Primeira descompensação:" (`bgL`): "Iniciar insulina SC: / • Insulina NPH (basal): 40-60% da dose total. Fracionar em 2/3 pela manhã e 1/3 à noite. / • Insulina regular (bolus): Fracionar o restante da dose em 3 refeições, administrando 30 minutos antes de cada refeição. / • Interrompa insulina EV e demais soluções 2 horas após iniciar insulina SC. / • Encaminhar à endocrinologia."
- Rodapé "Cuidados:": "• Glicemia capilar = HGT = Dextro / • Os eletrólitos devem ser verificados pelo menos uma vez a cada hora (para monitorar os níveis de potássio), e ureia, pH venoso, creatinina e glicose devem ser verificados a cada 2-4 horas até a resolução da CAD."

---

### A2. Trombólise — `/equation/category/trombolise`
- **Tipo:** protocolo-conduta multi-step (3 abas) com calculadora de dose por peso. Widget `A.PR`, builders `adv` (AVEi), `adS` (IAM), `af7` (TEP).
- **Input global:** "Peso em kg". 3 abas: "AVE Isquêmico", "IAM com supra de ST", "TEP (Tromboembolismo Pulmonar) instável".

**Aba 1 — AVE Isquêmico** (`adv`): seletor de agente (Alteplase | Tenecteplase):
- **Alteplase** "(1 mg/mL - pó + diluente)": "Dose usual: 0,9 mg/kg - sendo 10% em bolus de 1 minuto e os demais 90% infundidos em 1 hora. / Dose máxima: 90 mg". Prescrição calculada: "Alteplase {10%} mL em bolus de 1 minuto. Seguido de {90%} mL em bomba de infusão a {90%} mL/h durante uma hora."
- **Tenecteplase**: "Apresentações: 40 mg/8 mL ou 50 mg/10 mL / Dose usual: 0,25 mg/kg / Dose máxima: 25 mg". Cálculo: dose = 0,05 × peso, capped em 5 (`if(0.05*peso>5) m=5`) → "{m} mL EV em bolus de 5 a 10 segundos."
- Ao final: checklist "Contraindicações à trombólise no AVEi:" com 2 grupos: "Contraindicações absolutas" / "Contraindicações relativas".

**Aba 2 — IAM com supra de ST** (`adS`): seletor 4 agentes:
- **Alteplase** (id 0): "Dose usual: bolus 15 mg em 1 a 2 min. Seguido de 0,75 mg/kg (max 50 mg) por 30 min. E então 0,5 mg/kg (max 35mg) nos próximos 60 minutos." Prescrição: "Alteplase 15 mL em bolus de 1 a 2 minutos seguido de {x} mL em bomba a {y} mL/h durante 30 minutos. / Ao término infundir {z} mL na bomba a {z} mL/h durante uma hora."
- **Tenecteplase** (id 1): "Dose usual: 0,25 mg/kg / Dose máxima: 50 mg" → "{aCG} mL EV em bolus de 5 a 10 segundos" + "• É recomendado reduzir a dose pela metade se ≥ 75 anos".
- **Estreptoquinase** (id 2): "1.500.000 UI - Reconstituir em 5 mL SF 0,9% e então diluir em 100 mL SF 0,9% EV em 30 a 60 minutos / Apresentações (pó) de 250.000UI; 750.000Ul e 1.500.000Ul / A dose independe do peso."
- **Reteplase** (id 3): "10 Unidades EV em 2 minutos. Repetir a dose após 30 minutos. / A dose independe do peso."
- Checklist "Contraindicações à trombólise no IAM:" (absolutas/relativas).

**Aba 3 — TEP** (`af7`): dose fixa, sem peso:
- **Alteplase** "(1 mg/mL)": "100 mg (2 frascos) + 100 mL SF 0,9% EV em BIC em 2 horas. / A dose independe do peso."
- Checklist "Contraindicações à trombólise no TEP:" (absolutas/relativas).

---

### A3. Enxaqueca — `/equation/category/enxaqueca`
- **Tipo:** protocolo-conduta (2 abas), conduta escalonada. Widget `A.OI` (builder `b4Q`); abas `aHx` (<72h) e `aHy` (>72h). Header "Urgências / Enxaqueca".
- Abas: "Enxaqueca (Migrânea) < 72 horas" e "Enxaqueca > 72 horas (Estado Migranoso)".

**Aba 1 — Migrânea < 72h** (`aHx`):
- "Crise leve a moderada":
  - "1) Dipirona 1.000 mg + 8 mL de AD – EV (ou 1.000 mg VO)"
  - "2) Paracetamol 750 mg VO ou 1.000 mg - EV em 15 minutos"
- "Crise moderada a intensa":
  - "Dipirona 1.000 mg + 8 mL de AD – EV"
  - "3) Cetorolaco 30 mg + 50 mL de SF 0,9% - EV" (ou)
  - "Cetoprofeno 100 mg + 100 mL de SF 0,9% - EV em 20 minutos (ou 100 mg IM)" (ou)
  - "Diclofenaco 75 mg IM" (ou)
  - "Paracetamol 750 mg VO ou 1.000 mg - EV em 15 minutos"
  - "Se falha após 1 hora, adicionar:"
  - "4) Sumatriptano 6 mg - SC" (ou) "Zolmitripatano 5 mg intranasal"
  - "5) Dexametasona 10 mg + 10 mL de AD – EV (para prevenir recorrência)"
  - "Se náuseas ou vômitos:"
  - "6) Metoclopramida (5 mg/mL) - 10 mg + 18 mL de AD – EV em pelo menos 3 minutos" (ou) "Dimenidrato 30 mg + 10 mL de AD – EV" (ou) "Ondansentrona 4-8 mg + 50 mL de SF 0,9% - EV"
  - "Se nova falha:"
  - "7) Clorpromazina (25 mg/5 mL) - 0,1-0,25 mg/kg – IM (se em 1 hora mantiver dor, repetir até 3 vezes)\n\n* Uso EV é off-label - UpToDate, 2024 / Clorpromazina (25 mg/5 mL) - 0,1 mg/kg ou 12,5 mg + 500 mL de SF 0,9% - EV lento (máximo 1 mg/minuto)"
- "Cuidados": "- Evitar opioides. / - Difenidramina 12,5-25 mg EV/IM pode evitar acatisia."

**Aba 2 — Estado Migranoso > 72h** (`aHy`): mesma lista de medicações da crise moderada-intensa em diante (começa direto em Cetorolaco/Cetoprofeno/Diclofenaco/Sumatriptano/Zolmitriptano/Dexametasona/antieméticos/Clorpromazina) + mesmos "Cuidados".

---

### A4. Cirrose — `/equation/category/cirrose`
- **Tipo:** protocolo-conduta + calculadora por peso/volume (2 abas). Widget `A.O9`. Abas: "Albumina humana" (`adx`/`b8o`) e "Octreotida" (`aHF`).

**Aba 1 — Albumina humana 20%** (calc por peso/litros):
- Apresentação: "20% (0,2 g/mL – Frasco Ampola com 10, 50 e 100 mL)".
- **Cenário "Paracentese de ascite de grande volume (>5 Litros)":** input "Quantos litros retirados na paracentese (L)". Se >5 L: "Albumina humana 20% (pura) {6×L×5} mL a {8×L×5} mL EV na velocidade de 35 a 70 gotas/minuto / • Repor 6 a 8g para cada litro removido durante ou logo após a paracentese. / • Pode ser administrada diluída 1:4 em SF 0,9% ou SG 5% na velocidade de 125 gotas/minuto." Se ≤5 L: "Não é necessário repor albumina em paracentese com retirada menor que 5 litros de líquido ascítico."
- **Cenário "Profilaxia de Síndrome Hepatorrenal no tratamento de PBE":** input "Peso do paciente (kg)". "Albumina humana 20% (pura) {1.5×peso×5} mL EV na velocidade de 35 a 70 gotas/minuto nas primeiras 6 horas. / Seguido de {peso×5} mL EV no 3° dia na velocidade de 35 a 70 gotas/minuto. / • Não exceder 100 g (500 mL)/dia / • Sempre associar a terapia antimicrobiana adequada / • Pode ser administrada diluída 1:4 em SF 0,9% ou SG 5% na velocidade de 125 gotas/minuto."
- **Cenário "Síndrome Hepatorrenal tipo 1 ou Lesão Renal Aguda":** input "Peso (kg)". "Albumina humana 20% (pura) {peso×5} mL EV na velocidade de 35 a 70 gotas/minuto uma vez ao dia por 2 dias. / Seguido de 100 mL (20g) a 250 mL (50g) ao dia, EV até que a meta de volume intravascular seja alcançado. / • Não exceder 100 g (500 mL)/dia / • Sempre associar a terapia vasoconstritora sistêmica (Terlipressina, noradrenalina ou midodrina + octreotide) / • Pode ser administrada diluída 1:4 em SF 0,9% ou SG 5% na velocidade de 125 gotas/minuto."

**Aba 2 — Octreotida** (`aHF`, dose fixa):
- "Apresentações: Solução injetável: 500 mcg/mL, 1000 mcg/mL e 5000 mcg/mL"
- "Hemorragia varicosa gastroesofágica aguda"
- "Dose ataque usual: 25 a 50 mcg EV em bolus\n\nSeguido de 50 mcg/h EV em BIC por 2 a 5 dias."
- Sugestão de prescrição: "Octreotida (500 mcg/mL) 1 mL + 99 mL SF 0,9% - Fazer 5 a 10 mL EV em bolus. Seguido de 10 mL/h em BIC por 2 a 5 dias."
- "• Bolus de 10 mL pode ser repetido na primeira hora se a hemorragia não estiver controlada.\n\n• Pode ser diluído em SG 5%"

---

## CLUSTER B — Calculadora com lógica de estágio/decisão (single screen)

### B1. Injúria Renal Aguda (KDIGO) — `/equation/category/injuria-renal-aguda`
- **Tipo:** calculadora + escore-por-estágio (KDIGO 1/2/3). Widget `A.OS` (builder `dcT`). Header "Calculadoras Médicas / Injúria Renal Aguda (KDIGO)". 2 abas: **Creatinina Sérica** e **Débito Urinário**.

**Aba Creatinina Sérica:**
- Inputs: "Creatinina sérica atual" (mg/dL), "Creatinina sérica basal" (mg/dL); pergunta "Início de Terapia de Substituição Renal (ex: diálise)?" SIM/NÃO; "Idade < 18 anos" SIM/NÃO.
- Se Idade<18 = SIM: abre sub-calc **Cockroft-Gault** (inputs Peso, Idade, sexo Homem/Mulher) → "TFGe {x} mL/min/1,73m²".
- **Estadiamento (literal, via getters gSU/gHD/gzI):**
  - Ausência de IRA: "Ausência de IRA conforme Creatinina Sérica"
  - **KDIGO 1**: "Creatinina sérica 1,5 a 1,9 vezes a basal ou aumento ≥ 0.3 mg/dL em 48 horas."
  - **KDIGO 2**: "Creatinina sérica 2 a 2,9 vezes a basal."
  - **KDIGO 3**: "Creatinina sérica  ≥ 3 vezes a basal ou ≥ 4,0 mg/dL ou início de TSR ou TFG < 35mL/min/1,73m² em menores de 18 anos de idade."

**Aba Débito Urinário:**
- Pergunta "Anúria por ≥ 12 horas" SIM/NÃO. Se SIM → KDIGO 3 direto. Se NÃO → inputs Peso, Volume urinário (mL), Período (horas) → "Débito urinário: {x} mL/kg/h".
- **Estadiamento por DU (literal):**
  - "Ausência de IRA conforme Débito Urinário"
  - **KDIGO 1**: "Débito urinário < 0,5 mL/kg/h por 6-12 horas."
  - **KDIGO 2**: "Débito urinário < 0,5 mL/kg/h por ≥ 12 horas."
  - **KDIGO 3**: "Débito urinário < 0,3 mL/kg/h por ≥ 24 horas ou anúria (< 50mL) por ≥ 12 horas."
- **Nota (rodapé, literal):** "Nota: IRA (KDIGO) é definida como: * Aumento da Creatinina sérica ≥ 0.3 mg/dL em 48 horas; ou * Aumento da Creatinina sérica ≥ 1,5 vezes o valor basal em 7 dias; ou * Débito urinário < 0,5 mL/kg/h por 6 horas"

---

### B2. Hipoglicemia — `/equation/category/hipoglicemia`
- **Tipo:** protocolo-conduta interativo (árvore de decisão, single screen). Widget `A.OP` (builder `dcB`). Header "Urgências / Hipoglicemia".
- Pergunta raiz: "Paciente consciente e apto a engolir com segurança:" → SIM/NÃO.
  - **SIM** → "Administre carboidrato de rápida absorção. Ex: / • Uma colher de chá de mel ou de açúcar; / • Um copo de suco de frutas; e / • Refrigerante não diet." → segue pergunta "Resolveu?" SIM/NÃO:
    - SIM → "Vigilância glicêmica"
    - NÃO → (texto EV abaixo)
  - **NÃO** → "Administre bolus EV de 25 a 50 mL de Glicose Hipertônica 50%.\n\nReavaliar glicemia capilar em 10 a 15 minutos.\n\nRealize novos bolus EV de 25 a 50 mL de Glicose Hipertônica 50% conforme necessidade para manter glicemia > 80 mg/dL."
- Nota rodapé: "Nota: Glucagon 1 mg IM ou SC, é uma alternativa quando não é possível administrar Glicose VO ou EV."

---

### B3. Hiperglicemia (no menu: "Hyperglicemias") — `/equation/category/hiperglicemia`
- **Tipo:** calculadora de insulina + conduta. Widget `A.OL`. Critério de entrada: "2 episódios de Glicemia > 180 mg/dL". Input "Peso" (kg). Seletor "Selecione o tipo de avaliação:" com 2 modos (B.IT e B.IU).
- **Modo 1 (`aWy`):** com peso, calcula e exibe:
  - "1) Insulina Basal" → mostra valores `{chZ}`/`{ci4}` ("ou").
  - "2) Insulina Bolus (Se paciente se alimenta via oral)" → `{ch9}`.
  - "3) Glicemia Capilar" → "• Pré-refeições (café, almoço, jantar) / • A cada 4h em caso de jejum ou dieta enteral".
  - "4) Esquema de Correção" → imagem `assets/images/hiperglicemia_cronograma.png` (tabela de correção = arte fechada).
  - Sem peso: "Digite o peso acima para ver os cálculos".
- **Modo 2 (`aD5`):** "• Solicitar Hemoglobina Glicada / • Se < 7%: Manter doses de insulina prévia / • Se ≥ 7%: Ajustar doses (individualizar) / • Monitoramento / • Glicemia Capilar pré-refeições (café, almoço, jantar) / • No caso de jejum ou dieta enteral, a cada 4h".
- "Meta de Glicemia": "• Glicemia entre 100 e 140 mg/dL em jejum."
- `[incerteza]` Os coeficientes exatos de Insulina Basal/Bolus (getters `chZ/ci4/ch9` no controller `aWy`) não foram desofuscados neste slice; rótulos e estrutura confirmados, valores numéricos da fórmula ficam para um segundo passe se necessário.

---

## CLUSTER C — Calculadora-fórmula simples (irmã da CAD, em scope adjacente)

### C1. Correção de Sódio pela Glicemia — `/equation/category/sodio-hiperglicemia`
- **Tipo:** conversor/fórmula simples. Widget `A.Or` (builder `db8`); controller `Oq` `_CategoryCorrecaoSodioHiperglicemiaControllerBase`. Header "Distúrbios Hidroeletrolíticos".
- Inputs: "Sódio medido" (mEq/L), "Glicose" (mg/dL).
- **Fórmula (código literal):** `gxK{return q+0.016*(this.b-100)}` → **Na corrigido = Na medido + 0,016 × (Glicose − 100)**. (Idêntica à usada na aba 3 da CAD.)
- Output: "O Sódio corrigido é de {valor} mEq/L".

---

## PADRÕES (arquétipos observados)

1. **Protocolo multi-step com abas + mini-calc embutida** — CAD (8 abas), Trombólise (3), Enxaqueca (2), Cirrose (2). Cada aba é um widget independente; algumas só texto (`A.h`/`A.mC`), outras com input de peso e dose calculada (`A.a9` formata "Prescrição: … {valor} mL"). Navegação por chips/tabs (`A.ax` no menu, `pK(...)` no render).
2. **Calculadora-fórmula simples** — Correção de Sódio pela Glicemia (1 fórmula, 2 inputs, 1 output). Mesmo molde de outros conversores do app.
3. **Escore/estadiamento por critérios** — IRA KDIGO (estágios 1/2/3 derivados por comparação creatinina-vs-basal e débito urinário; getters booleanos `gSU/gHD/gzI` decidem o badge). Inclui sub-calc Cockroft-Gault.
4. **Árvore de decisão interativa (conduta condicional)** — Hipoglicemia (SIM/NÃO encadeados que revelam conduta), aba 3 da CAD (Na<135? → pH<7.0? → repor ou não bicarbonato), IRA (TSR? Idade<18? Anúria?). Toggle/`du("SIM",…,"NÃO")` + `kq`/radio.
5. **Dose calculada por peso (regra-de-três embutida)** — Trombolise (0,9 mg/kg AVEi com cap 90 mg; 0,25 mg/kg Tenecteplase cap 25/50 mg), CAD insulina (0,05 ou 0,1 UI/kg/h), Cirrose albumina (6–8 g/L; 1,5×peso×5 mL). Cap/max codados em `if`.
6. **Titulação por variação temporal** — CAD aba 6: decide ↑/↓/manter velocidade da insulina a partir da diferença entre HGT atual e de 1h antes (thresholds 50/70 mg/dL).
7. **Conteúdo clínico HARDCODED no binário** — diferente do Admin (Antibióticos/Banners/Escores) que é Supabase-driven. Estes protocolos adultos têm dose/critério como string literal no app → mudança exige novo build/release. (Tabela de correção da Hiperglicemia é literalmente uma **imagem** `hiperglicemia_cronograma.png` = arte fechada, não editável por dados.)
8. **Cross-link entre features** — CAD aba 7 ("Ânion Gap") navega para `/equation/category/anion-gap`; protocolos compartilham o header `A.bf(...)` com breadcrumb "Urgências" / "Calculadoras Médicas" / "Distúrbios Hidroeletrolíticos".

## Flags / peculiaridades transversais
- **Sem paywall por protocolo:** gating (`isFree`, `maxInteractions`) só aparece no Chat IA e assinatura; estas calculadoras são livres `[inferência]`.
- **Telemetria:** alguns builders chamam `A.fz("<slug>","calculator")` no `initState` (ex.: clearance, ventilacao-mecanica) — analytics de uso por categoria.
- **i18n parcial:** títulos de menu em PT, mas chaves de evento em EN ("emergency_cetoacidose", "acute_kidney_injury", "hyperglicemias"). O slug visível é PT-BR.
- **Off-label sinalizado:** Enxaqueca marca explicitamente "* Uso EV é off-label - UpToDate, 2024" para Clorpromazina EV.
