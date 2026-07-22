---
tipo: concept
atualizado: 2026-06-21
fontes:
  - admin-spec/01-sistema-de-tipos.md
  - admin-spec/02-audit-consistencia.md
  - admin-spec/02-audit-cobertura.md
  - apps/web/src/admin/modules/antibioticos/antibioticosModel.js
  - apps/web/src/admin/contracts/antibioticos.schema.json
  - apps/web/docs/admin/prd-admin-antibioticos.md
  - apps/web/CLAUDE.md
  -.claude/rules/apps-web.md
  - MODELO-DOSE-PEDIATRICA.md
  - MODELO-ANTIBIOTICOS-ADULTOS.md
relacionado:
  - admin-spec/01-sistema-de-tipos.md
  - PLANO-ADMIN-DATA-ARCH.md
status: vigente
peso: core
---

# Admin UX — como o operador cadastra cada molde sem errar

> Especificação de UX do construtor de conteúdo clínico do CalcMed admin. Cobre os 9 tipos
> canônicos do `01-sistema-de-tipos.md` mapeados em layout de formulário, com o padrão de wizard +
> preview ao vivo que JÁ existe e roda para Antibióticos (T1 adulto). Persona-alvo é o Gustavo
> (médico dono, não técnico): o cadastro tem que parecer "montar a tela", nunca "preencher um JSON".
> Tudo em React, fora do Figma (regra `feedback_figma_so_app_admin_so_codigo`). Nada inventado:
> cada decisão de UX ataca um achado concreto da auditoria (C-01..C-06, U-02..U-04, gaps do §3 do
> tipo). Incertezas marcadas FLAG.

## 1. Princípios de UX (herdados do admin de antibióticos, generalizados)

Os 5 princípios do PRD de antibióticos (§3) viram o contrato de TODOS os moldes:

1. **A tela primeiro, o dado depois.** O operador escolhe um **arquétipo** (preset visual com
   droga-exemplo: "como Aciclovir"), não um `dosing_type`. O preset liga os blocos certos; os
   campos persistidos são a verdade.
2. **Erro onde o olho está.** Validação inline por campo (após blur ou tentativa de salvar),
   `role="alert"`, ponto de pendência no stepper, pendências clicáveis na revisão. Salvar nunca
   fica mudo.
3. **Governança no fim.** Status editorial + revisão médica moram no último passo, depois de
   conferir, nunca no meio do builder.
4. **Segurança editorial antes de velocidade.** Dose sem unidade, sem revisão, sem referência:
   bloqueia ao publicar. Rascunho incompleto é legítimo.
5. **Mesma língua do DS.** Composição sobre `ClinicalResourceModule` + componentes existentes;
   overlay único `DesktopModal` (vira bottom sheet a ≤768px). Zero linguagem visual paralela.

**Norte transversal de produto (vem da auditoria):** o admin atual é um editor de texto de
posologia, não um motor de cálculo (audit-cobertura achado 1). Os tipos T1-D3..D8, T2, T4, T6, T7
exigem editores de campo que o engine NÃO tem hoje (fórmula, faixa numérica, árvore, dose
computada). Esta spec desenha esses editores como **extensões aditivas** do mesmo motor, jamais um
admin paralelo (D-12 do PRD: extensões sempre retrocompatíveis).

---

## 2. Anatomia única do editor (vale para os 9 moldes)

Todo cadastro abre no **mesmo shell**: `DesktopModal size="wide"` (form à esquerda, preview ao vivo
à direita), wizard de passos no topo, 3 abas internas **Formulário / JSON / Validação**.

```
┌─ DesktopModal (wide) ─────────────────────────────────────────────┐
│  [Nome do item]                                              [X]   │
│  Stepper:  ① Identificação · ② Comportamento · ③ Conteúdo ·        │
│            ④ Observações · ⑤ Revisão        (• = pendência)        │
│  Abas:  [Formulário]  [JSON]  [Validação]                         │
│ ┌─ Formulário (rola) ───────────┐ ┌─ Preview ao vivo ──────────┐ │
│ │  campos do passo atual         │ │  a TELA REAL do app        │ │
│ │  (variam por molde)            │ │  (componentes do DS)       │ │
│ │                                │ │  [Light | Dark]            │ │
│ │                                │ │  grip de reorder por bloco │ │
│ └────────────────────────────────┘ └────────────────────────────┘ │
│  Footer:  [Voltar]   "N pendências marcadas"   [Avançar/Salvar]   │
└────────────────────────────────────────────────────────────────────┘
```

**Os 5 passos canônicos** (renomeados de neutro pra servir todos os tipos; antibiótico já usa
quase isso):

| Passo | Conteúdo | Constante em todos os moldes? |
|---|---|---|
| ① **Identificação** | arquétipo/tipo + nome, classe/categoria, público, via | SIM (envelope §4.1 do tipo) |
| ② **Comportamento** | liga/desliga blocos da tela (slots); para droga = eixo de cálculo | SIM, varia o miolo |
| ③ **Conteúdo** | o miolo do molde (posologias / fórmulas / questions / nós / linhas) | varia 100% por molde |
| ④ **Observações** | repeater nível (Nota/Atenção/Crítico) + contraindicações-gate | SIM (envelope) |
| ⑤ **Revisão** | referências, tags de risco, ferramentas similares, revisão médica, status | SIM (governança) |

> No mobile (≤768px) o DesktopModal vira bottom sheet full-width e **o preview some** (edge case
> crítico do PRD, B-04). Consequência de produto: a reordenação de blocos e qualquer edição que só
> existia no preview PRECISA ter um controle-espelho no formulário (lista com setas cima/baixo, como
> o `RepeaterField`). Isso é gate de release e vale para TODO molde que tenha `ordemBlocos`.

### 2.1 Tipos de campo disponíveis (o que o engine já dá vs o que falta)

Do `ClinicalResourceModule` (audit-cobertura): hoje existem `text / textarea / number / select /
radio / toggle / checkbox / tags / repeater` + `renderPreview` custom por módulo. **Faltam** (e esta
spec especifica como cada um se parece):

| Campo novo | Para que molde | Forma proposta |
|---|---|---|
| **FormulaField** | T1-D3/D7, T2 | input de expressão com tokens de variável validados (peso, idade, FiO₂...), preview do resultado com valores de teste |
| **FaixaRepeater** | T1-D2/D5/D6, T8, T2-classificação | repeater de linhas `{ de, até, valor }` com guarda de cobertura (sem buraco/sobreposição) |
| **TetoField** | T1-D3/D4 | dupla: valor + unidade + segmented `clamp | texto` (a decisão clínica crítica, §6 do tipo) |
| **GateField** | T1-D4, contraindicações | regra booleana montada por dropdowns (variável + operador + valor + unidade) → ação se-falso |
| **ArvoreEditor** | T6 | editor de nós SIM/NÃO encadeados (lista indentada, não canvas) |
| **AbasRepeater** | T5 | repeater de abas, cada aba referencia outro molde (recursivo, raso) |
| **RamosNeonatais** | T1-D4 ped | repeater de `{ IG_min, IG_max, dias_vida_min, dias_vida_max, fórmula|texto }` |

Todos são composições do que já existe (repeater + number + select + segmented). Nenhum vira
componente solto; entram como variantes de campo da `definition` do módulo.

---

## 3. Mapa molde → layout de formulário

Um por tipo. Para T1 (droga-dose) detalho os 8 sub-tipos, porque é ~110 dos ~170 itens e é onde
mora o buraco da pediatria.

### T1. droga-dose — o editor mestre, 8 sub-tipos

**Passo ① Identificação** (igual ao antibiótico de hoje, estendido para pediatria):
- **Arquétipo (RadioGroup com exemplo):** os 7 presets de hoje + os ramos pediátricos. Rótulo na
  língua do médico, `dosing_type` é derivado:
  - "Posologia simples (sem ajuste) · como Azitromicina" → D1/D2
  - "Dose por peso · como Amicacina" → D3
  - "Dose por peso e idade · como Ibuprofeno" → **D4** (NOVO, pediátrico)
  - "Ajuste renal (CrCl + Cockcroft) · como Fluconazol" → D5
  - "Ajuste renal + diálise · como Aciclovir" → D5+diálise
  - "Regime único vs múltiplas doses · como Gentamicina" → D6
  - "Infusão contínua em bomba · como Terbutalina" → **D7**
  - "Só aviso clínico (sem dose) · como Metoclopramida" → **D8** (NOVO)
- **Identificação:** nome, classe (texto livre), **público** (Adulto/Pediátrico/Ambos — `select`),
  **via** (`select` do enum, NÃO texto livre: fecha B-15).
- **FLAG C-01 (CRÍTICO):** a chave de unicidade tem que incluir `publico`. UX: ao digitar um nome
  que já existe com OUTRO público (ex.: "Cefepima" adulto-renal vs ped-peso), mostrar **warning não
  bloqueante** "Já existe Cefepima (Pediátrico). Esta é a versão Adulto?" — nunca fundir as duas
  lógicas num item só (colisão de dose por ordem de grandeza).

**Passo ② Comportamento** (liga blocos + define o eixo de cálculo):
- Toggles de slot (peso, definir dose, diálise, regime, clearance, cockcroft + extras). O preset já
  liga os certos; o operador ajusta. Preview reage na hora.
- **Novos slots pediátricos** (gap §3 do tipo): `idade` (+ unidade Meses/Anos), `apresentacao`,
  `ramosNeonatais`, `doseMaxima`.
- **F-09 RESOLVIDO contra bundle (2026-06-21) — NÃO bloquear o toggle de idade.** Não há inversão:
  `Meses=1, Anos=2` uniforme no binário (ver `02-audit-meses-anos.md` + `qa/round1-ground-truth.md`).
  O campo de unidade de idade fica HABILITADO normalmente. A "inversão func-01 vs func-02" era ruído
  de extração. **Permanece (separado da inversão):** o construtor deve normalizar idade para meses
  internamente e a validação de faixa deve operar sobre idade normalizada, nunca sobre `unit` cru
  (F-06/F-07) — gates de borda 12m/1a precisam declarar se operam antes/depois da conversão.

**Passo ③ Conteúdo — varia por sub-tipo:**

| Sub-tipo | Layout do passo ③ |
|---|---|
| **D1 fixo** | um `textarea` "Dose fixa" + (opcional) repeater de regimes (Salbutamol: nebulização/spray). Sem input numérico. |
| **D2 lookup** | `select` "Indexar por: Idade \| Peso \| Clearance" + **FaixaRepeater**: cada linha `{ de, até, unidade, dose_texto, frequência, máx_texto }`. Guarda de cobertura avisa buraco/sobreposição (audit-cobertura achado 6: faixa com buraco passa hoje). FLAG C-03/Diclofenaco: a fronteira 12 meses / 1 ano é o erro de limiar — a guarda tem que sinalizar inclusividade (≥ vs >) explícita em cada extremo. |
| **D3 peso-computado** | **FormulaField** "dose = fator × peso" (fator único OU fator_min/fator_max), `select` casas decimais (incl. "cru/sem arredondar"), seletor de **apresentação** (repeater `{ label, concentração mg/mL, forma }`) que troca o fator, e **TetoField** (valor + unidade + `clamp\|texto`). |
| **D4 híbrido (peso × idade)** | **GateField** de idade no topo ("se idade < X → Contraindicado <droga>"), depois **ramos**: repeater onde cada ramo seleciona por idade/apresentação/indicação e cada um tem sua FormulaField OU texto fixo. **+ RamosNeonatais** quando ligado. ESTE é o buraco central da pediatria (§3 gap 3 do tipo): slots booleanos não modelam duas variáveis combinadas; o GateField + ramos são a resposta de UX. |
| **D5 renal** | FaixaRepeater por clearance `{ CrCl de, até, posologia }` + toggle Cockcroft (calc embutida) + sub-bloco diálise `{ ativo, prescrição fixa, nota }`. Guarda de cobertura nas faixas de clearance (audit: faixa de clearance com buraco é risco). |
| **D6 regime** | Segmented "Dose única \| Múltiplas doses"; cada modo abre sua própria FaixaRepeater. Preview mostra o seletor que o app vai exibir. |
| **D7 infusão-bic** | 3 inputs declarados (peso, dose-alvo mcg/kg/min, vazão mL/h) + campos de diluição (concentração, volume 24h, complementar) + `concentracao_maxima`. **FLAG C-05:** tetos de vasoativa ped vs adulto divergem ~8×; mostrar o teto como aviso clínico explícito, não silencioso. |
| **D8 só-aviso** | um `textarea` "Aviso clínico" + toggle `tem_dose=false`. Esconde posologias inteiras no preview. |

- **Transversal a todos:** repeater de **posologias** (núcleo enxuto sempre visível: droga, dose,
  unidade, via, intervalo; Detalhes colapsado: papel, cenário, diluente, tempo, esquema). `papel ∈
  {direta, cenário, ataque, manutenção, indicação}` resolve o `ataque-manutencao` sem virar
  sub-tipo (§3 do tipo). Dose alternativa "ou" da 2ª linha em diante; 1ª nunca alternativa.
- **FLAG U-02 (CRÍTICO clínico):** unidade de dose vs unidade de cuidado podem divergir (Sulfato de
  Mg: "60 mg/dL" no cuidado vs "mg/mL" na prescrição, fator 100). UX: a unidade da posologia é
  `select` fechado (g/mg/mg/kg/mL/UI/...); cuidado é texto livre — e o preview mostra os dois lado a
  lado pra o revisor pegar a divergência.

**Passo ④ Observações:** repeater `{ nível ∈ Nota/Atenção/Crítico, texto }` (visível só com slot
observações ligado) + **contraindicações** com toggle `gate` (contraindicação dura que esconde a
dose vs nota textual — MODELO-DOSE §6).

**Passo ⑤ Revisão:** referências (rastreável, exigida ao publicar se slot ligado), tags de risco,
ferramentas similares, **revisão médica** (Pendente/Aprovado/Reprovado), **status editorial**.
Lista as pendências clicáveis. Gates de publicação ativos: revisão aprovada + (V2) só adulto +
"Definir dose" bloqueado (fase 2).

### T2. calculadora-formula

- ① tipo "Calculadora" + nome/categoria.
- ② declara **inputs**: repeater `{ id, label, unidade, validação min/max/msg }` (a guarda de
  validade clínica: LDL esconde se TG≥400, Peso Ideal exige altura 123-213). Toggle "inputs
  mutuamente exclusivos" (QTc: FC⟷RR).
- ③ **fórmulas**: FormulaField em repeater (multi-fórmula = N métodos lado a lado: QTc
  Bazett/Fridericia/Framingham/Hodges; Clearance CKD-EPI/Cockcroft). Cada fórmula valida que só usa
  tokens de input declarados. **FLAG C-06:** Cockcroft-Gault rotulado `mL/min/1,73m²` para fórmula
  que entrega mL/min não normalizado — o label da saída é campo editável, revisor confere.
- ③b (opcional) **faixas de classificação**: FaixaRepeater `{ condição, rótulo, texto }` (IMC 6
  faixas, SDRA 4 faixas).
- ④/⑤ iguais.

### T3. escore-por-pontos

- **Já entregue** (Admin de Escores, motor separado). Não re-desenhar; só alinhar a navegação para
  que apareça no mesmo catálogo de conteúdo.
- Layout de referência: ② sem slots de droga; ③ = repeater de **questions** `{ title, options[{
  label, pontos }] }` (pontos pode ser negativo) + repeater de **resultados** `{ title, meaning,
  biggerThen }`. **Typos load-bearing `aditionalTexts` / `biggerThen` NÃO se corrigem** (contrato do
  banco, RNF-09).
- **FLAG C-02 (CRÍTICO):** `biggerThen` está documentado como `>` E como `>=` em fontes diferentes —
  muda a classificação no limiar (SOFA). UX: o helper do campo tem que declarar a semântica exata
  ("resultado vale quando total **maior ou igual** a este limiar") e o preview mostra o caso de
  borda. Não modelar JSON antes de a flag fechar.

### T4. escore-por-criterios

- ② declara **eixos** (creatinina, débito urinário / deambulação, atividade, autocuidado da PPS).
- ③ **regras de estágio**: repeater `{ estágio, condição booleana (GateField), texto }`, ordem
  importa (primeira regra que casa vence). Sub-calc embutida opcional (Cockcroft dentro do IRA).
  Imagem de apoio (PPS usa JPG da tabela — **FLAG: arte fechada**, sobe como asset, não dado).
- Preview mostra o badge de estágio resultante variando os eixos.

### T5. protocolo-multi-step

- ③ **AbasRepeater**: cada aba `{ título, conteúdo }` onde conteúdo referencia outro molde (texto,
  T1 dose-por-peso, T6 árvore). Recursivo, mas raso (não aninhar aba dentro de aba).
- `input_global` declarado uma vez (peso compartilhado entre abas da Trombólise).
- `cross_links` (CAD aba 7 → Ânion Gap).
- **FLAG:** T5/T6 hoje são hardcode no binário Flutter (audit + tipo §6). Trazer pro admin é fase
  2+; esta spec desenha o alvo, não promete o agora.

### T6. conduta-arvore-decisao

- ③ **ArvoreEditor**: lista indentada de nós `{ pergunta, ramo SIM →, ramo NÃO →, conduta_texto }`,
  não um canvas (mantém no DesktopModal). Validação: todo ramo termina em conduta OU em outro nó
  (sem nó órfão — espelha a guarda de cobertura).
- `mnemonico_header` opcional (MOVE), `link_final` (termina apontando outra ferramenta).

### T7. conversor

- ② declara inputs + dropdowns de fator.
- ③ **dropdowns**: repeater `{ opção, fator_b }` + FormulaField (multiplica/divide pelos fatores) +
  `nota_fixa` ("1 mL = 20 gotas"). Input mutuamente exclusivo igual T2 (QTc FC⟷RR).

### T8. tabela-referencia

- ② `select` "Indexar por: cenário \| faixa etária \| ClCr".
- ③ **linhas**: repeater `{ chave, apresentação, dose usual, prescrição, cuidados }` + `eixo_decisao`
  opcional (Anticoagulantes por ClCr). Sem cálculo. Fronteira editorial com T1-D2 (card de
  referência vs prescrição de droga) é decisão caso a caso (§6 do tipo).

### T9. ferramenta-utilitaria

- **Fora do escopo de cadastro clínico** (CRUD do usuário: Soluções Personalizadas, Passômetro).
  Não cadastrável pelo admin de conteúdo; listado por completude. Sem layout de form aqui.

---

## 4. Estados do item (máquina de estado editorial)

Dois eixos ortogonais que JÁ existem no schema, desenhados como UI explícita:

**Eixo editorial** (`statusEditorial`): `rascunho → em-revisão → publicado → arquivado`.
**Eixo clínico** (`revisaoMedicaStatus`): `pendente → aprovado / reprovado`.

```
                 ┌───────────┐  enviar p/ revisão   ┌─────────────┐
   novo / dup ──▶│ rascunho  │─────────────────────▶│ em-revisão  │
                 └───────────┘                       └─────────────┘
                       ▲                              aprovar │ │ reprovar
                       │ despublicar / rebaixar              ▼ ▼
                       │                              ┌─────────────┐
                       └──────────────────────────────│  publicado  │
                                                       └─────────────┘
                       arquivar (qualquer estado) ───▶ [ arquivado ]
```

Regras de UX por estado (cada uma ataca um achado de segurança clínica):
- **Rascunho:** tudo editável, incompleto é legítimo. Erros viram warnings (não bloqueiam salvar).
- **Em-revisão:** editável; publicar exige passar pelo aprovado primeiro.
- **Publicado:** editar **campo clínico** (`CAMPOS_CLINICOS`: nome, classe, público, via, slots,
  posologias, observacoes, ordemBlocos) abre o **atestado review-dirty** (diff legível) e rebaixa a
  revisão para pendente. Campo não-clínico salva direto.
- **Arquivado:** read-only; some das listas ativas; reativar volta pra rascunho.
- **Gate de publicação (chokepoint único, vale editor + bulk + import):** revisão aprovada +
  referência (se slot) + dose com unidade + (V2) só adulto + não-"Definir dose". Conteúdo legado da
  migração v2→v3 entra como em-revisão com revisão zerada (nunca publicado direto).

**Sinalização na lista (fecha B-17):** a linha da tabela mostra Tag de status + Tag de revisão; a
métrica do topo conta pendências. Para o eixo clínico crítico (revisão pendente em item que tenta
publicar) a linha ganha `tone="atencao"` na Tag, não um componente novo.

---

## 5. Reuso: duplicar, templates, arquétipos

A maior alavanca de escala (PRD §2) e a resposta direta à pergunta "como cadastrar ~170 itens sem
morrer":

- **Duplicar** (ação de linha e no repeater de doses): nasce cópia com novo id, nome "(cópia)",
  **status rascunho + revisão pendente** (a alavanca de escala NÃO herda a aprovação clínica —
  D-08), `duplicadoDe` preenchido, abre o editor na cópia com banner de origem. É como o Gustavo
  cadastra os 38 ATB / 64 ped: cada droga nova nasce de uma parecida.
- **Arquétipo = template vivo:** trocar de arquétipo aplica `presetSlots` por **diff-merge**
  (preserva overrides manuais; re-selecionar o mesmo arquétipo = reset deliberado — D-05). É o jeito
  do médico dizer "esta é como a Amicacina" sem reconfigurar 10 toggles.
- **Import JSON** (chokepoint validado): publicado-com-pendência é rebaixado; erro estrutural
  rejeita só aquele item. Caminho de migração em lote (seed dos 38 stubs, B-08 — pendente de fonte
  rastreável + regra de dedup).
- **Bulk** (publicar/despublicar/exportar/excluir, todos com desfazer): bulk publicar passa cada
  item pelo MESMO validate; pendência barra com motivo.

---

## 6. Mobile (bottom sheet) vs desktop (modal)

Mesma família, layout adaptado (CLAUDE.md regra 3, RNF-04). Não inventar terceiro padrão.

| Aspecto | Desktop (≥768px) | Mobile (≤768px) |
|---|---|---|
| Overlay | `DesktopModal` central, cresce p/ `wide` com preview ao lado | bottom sheet full-width, ancorado embaixo, topo arredondado, footer empilhado |
| Preview ao vivo | painel direito sempre visível | **some** (sem espaço) |
| Reorder de blocos | grip por bloco no preview (arrasto + teclado) | controle-espelho no **formulário** (lista com setas cima/baixo) — **gate de release**, é a única forma no mobile |
| Validação inline | igual | igual |
| Stepper | horizontal | colapsa, mesma máquina aria-live |

A11y comum aos dois (RNF-05): focus-trap, ESC fecha, devolução de foco, scroll-lock, `aria-live` no
stepper, `role="alert"` no erro, `aria-current="step"`, label em todo campo, contraste AA, touch
target ≥44px (grip ≥24px). **Edge a corrigir (B-03):** campos do preview são decorativos mas
focáveis — envolver em `inert` para sair do Tab/focus-trap/leitor de tela.

---

## 7. Validação por molde (o que o validate precisa checar, além do envelope)

O envelope (nome, público, via-enum, ao menos 1 posologia com dose, dose-com-unidade, referência ao
publicar, revisão aprovada) já existe em `validateAntibiotico`. Por molde, **falta** (audit-cobertura
achado 6 — validate hoje é cego ao cálculo):

| Molde | Validação específica a adicionar |
|---|---|
| T1-D2/D5/D6, T8 | **cobertura de faixa:** sem buraco, sem sobreposição; inclusividade (≥/>) explícita em cada extremo (ataca C-03 Diclofenaco 12m/1a) |
| T1-D3/D7, T2 | **fórmula:** só usa tokens de variável declarados; sem divisão por zero; unidade de saída coerente |
| T1-D4 | gate de idade tem ação se-falso; cada ramo computa OU tem texto; ramos neonatais não se sobrepõem |
| T1 (teto) | se `tipo=clamp`, valor numérico obrigatório; se `texto`, só exibe (não clampa) — a decisão crítica §6 do tipo |
| T3 | `biggerThen` cobre o range de pontos possível; semântica de limiar declarada (C-02) |
| T4 | regras de estágio exaustivas; primeira-que-casa documentada |
| T6 | todo nó termina em conduta ou outro nó (sem órfão) |

**Princípio:** validar campo-vazio/enum/unidade é o que existe; validar **exaustividade e coerência
do cálculo** é o que falta e é onde mora o risco clínico (faixa com buraco passa no validate hoje).

---

## 8. FLAGs de produto que a UX expõe mas NÃO resolve

Estas precisam de decisão humana (Gustavo/Gui/Luis) antes de cadastrar; a UX as torna visíveis em
vez de escondê-las:

- **F-09 / U-03 — RESOLVIDO contra bundle (2026-06-21), NÃO é mais bloqueador:** `Meses=1, Anos=2`
  uniforme, sem inversão (ruído de extração). Não bloquear publicação por isso. Aberto SEPARADO:
  F-06/F-07 (leitura inconsistente por faixa) — normalizar idade para meses internamente.
- **C-01:** chave de unicidade DEVE incluir `publico` (senão dose ped e adulto colidem por ordem de
  grandeza). Warning, não fusão.
- **C-02 / `biggerThen`:** `>` vs `>=` no limiar de escore. Declarar semântica no helper.
- **U-02:** unidade de cuidado vs unidade de dose (Sulfato Mg, fator 100). Preview lado a lado pro
  revisor.
- **clamp vs texto** em cada teto (~14 são clamp real, resto texto): decisão de produto mais crítica
  (§6 do tipo). Clampar um texto = comportamento clínico NOVO. TetoField com segmented explícito.
- **FLAG-A (alta, audit-cobertura achado 5):** sem prova no código de que o app B2C lê o JSON do
  admin — o app provavelmente ainda é hardcode Flutter, e o preview é réplica React. Confirmar com
  Gui antes de prometer "data-driven". Toda esta UX assume que o JSON do admin alimenta o app; se
  não alimentar, o admin é um gerador de spec, não a fonte viva.
- **definirDose / dose calculada** bloqueado até fase 2 (faixa min/max estruturada) — é exatamente o
  que a pediatria mais precisa.
- **Imagens como dado** (PPS, Sinais Vitais, Hiperglicemia): arte fechada, sobem como asset.
