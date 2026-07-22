# Contrato do template-base do Admin (`ClinicalResourceModule`)

> **Status:** VIVO · **Origem:** Onda 2 do refino do módulo Antibióticos (relatório `CalcMed Urgencia/P.O/audits/2026-06-21-antibioticos-omega-qa.md`, achados A7/B12/M14/A6). **Fonte de verdade = código** em `apps/web/src/admin/modules/_shared/`.

O motor `_shared` é o **template-base** de todas as ferramentas CRUD-clínicas do Admin (antibióticos, condutas, escores, checklists, CID, referências). Cada ferramenta nova provê uma **`definition` declarativa**; o motor faz o resto (tabela, busca, filtros, wizard, repeaters arrastáveis, review-dirty, import/export, bulk, métricas, estados de robustez).

**Fronteira do template = a `definition`.** O motor opera sobre os **nomes de campo dados pela config**, nunca sobre literais. Quem copia o template fornece a camada de domínio (`normalize` + `validate` + `renderPreview`); o motor não sabe de antibiótico nem de escore.

As duas peças do contrato:
- **`createModuleStore({ storageKey, seed, normalize })`** — a persistência + a invariante de normalização.
- **`ClinicalResourceModule({ mod, store, useStore, definition })`** — a UI data-driven.

---

## 1. Invariante de normalização — `list` = normalizado (A1)

**Regra de ouro:** `store.list` / `getSnapshot` **SEMPRE** devolvem itens normalizados, nunca crus.

`createModuleStore` roda `definition.normalize` em **toda fronteira de entrada do estado**:
- carga síncrona (`load` do localStorage **e** do seed);
- hidratação assíncrona do backend remoto (`applyItems` — Firestore);
- toda **escrita** (`upsert`, incluindo bulk/import/duplicate/undo).

Consequências load-bearing:
- o App B2C, a busca por sinônimo/marca e qualquer template que copie o motor **podem confiar** que a forma está pronta;
- `normalize(item, raw)` recebe o item e o **cru** como 2º argumento (distinguir item novo de import);
- `normalize` **nunca lança**: um item que explode degrada pro cru-com-id (não derruba o boot);
- **sem `normalize`** (stores legados como `scores`): comportamento histórico intacto (item com id passa por referência).

Gate de conformidade: **TESTE-01** (`antibioticos.contract.test.js`) valida `store.list` direto contra o JSON Schema, **sem re-normalizar**.

---

## 2. Vocabulário editorial parametrizável (A7)

`statusEditorial` / `'publicado'` / `'rascunho'` / `revisaoMedicaStatus` **não são mais literais** no motor. A `definition` pode declarar `statusVocabulary`; quando **não** declara, os defaults reproduzem 1:1 o vocabulário atual do Admin (back-compat total).

```js
definition.statusVocabulary = {
  statusField: 'statusEditorial',   // qual campo guarda o status
  publishValue: 'publicado',        // valor "publicado"
  draftValue: 'rascunho',           // valor "rascunho"/oculto
  reviewValue: 'em-revisao',        // alvo do rebaixamento no import
  publishLabel: 'Publicar',         // rótulo da ação em massa
  unpublishLabel: 'Despublicar',
  publishedNoun: ['item publicado', 'itens publicados'],     // toast (pluraliza)
  unpublishedNoun: ['item despublicado', 'itens despublicados'],
};
```

Uma ferramenta de **Escore** que não tenha publicação/revisão médica passa o vocabulário dela (ex.: `ativo`/`oculto`, `Ativar`/`Ocultar`) e o motor para de herdar botões/métricas sem sentido.

**Métricas** seguem o mesmo princípio: `definition.metricBuilder(items, ctx)` → `[{ label, value, icon, tone?, hint? }]`. Sem ele, cai no `defaultMetricBuilder` (Total / Publicados / Rascunhos / Revisão médica), parametrizado pelo vocabulário. `ctx = { definition, vocab, attentionCount }`.

Gate de conformidade: `ClinicalResourceModule.template.test.js` (A7 + `defaultMetricBuilder` + chokepoint COBERTURA-01).

---

## 3. Drag-reorder genérico nos repeaters (A6 / M12)

Todo `RepeaterField` (posologias, observações, ranges, e qualquer repeater de qualquer módulo) é **arrastável por padrão** quando há 2+ itens:
- **grip** por item inicia o drag (`Reorder` + `useDragControls`, `motion/react`);
- **setas** (teclado no grip + botões up/down) como fallback de a11y;
- `aria-live="polite"` anuncia a nova posição; `aria-describedby` no grip dá a instrução.
- **No FORM** (não só no preview) — crítico porque o preview some em ≤760px (mobile).

Para desligar (repeater de ordem fixa): `field.reorderable = false`.

Primitivas de preview compartilhadas (M14), em `_shared/preview/`:
- **`PreviewFrame`** — shell de 390px + toggle claro/escuro + barra de dica. Props: `header`, `children` (node ou `(dark) => node`), `dica`, `showThemeToggle`.
- **`ReorderableBlocks`** — Reorder + grip + teclado + a11y sobre uma lista de ids. Props: `blocos`, `renderBloco(id)`, `labelDoBloco(id)`, `editavel`, `onReorder`, `onMover`.

O domínio **compõe** essas primitivas e troca só o conteúdo do bloco (ver `AntibioticoTelaPreview` como referência).

---

## 4. Shape mínimo da `definition`

### Obrigatórios

| Campo | Tipo | Papel |
|---|---|---|
| `slug` | string | id curto (nomes de arquivo de export, chaves). |
| `icon` | string (Icon atom) | ícone do módulo + EmptyState + métrica Total. |
| `itemNoun` | string | "antibiotico" — usado em títulos ("Adicionar {itemNoun}"). |
| `itemLabel` | string | "Antibiotico" — usado em toasts ("{itemLabel} adicionado"). |
| `addLabel` | string | rótulo do botão primário de criar. |
| `nameKey` | string | campo que é o "nome" do item (coluna/duplicata/busca). |
| `searchKeys` | string[] | campos varridos pela busca (paths permitidos). |
| `defaultItem` | ` => item` | item zero (normalmente ` => normalize({})`). |
| `normalize` | `(item, raw) => item` | **a camada de domínio**: forma canônica. Ver §1. |
| `validate` | `(item, items) => { errors, warnings, medicalReviewRequired }` | erros/avisos. Erros podem ser string (global) ou `{ field, msg }` (inline). |
| `filters` | `[{ key, label, options }]` | filtros do toolbar. |
| `columns` | `[{ key, label, align?, render? }]` | colunas da tabela. |
| `fields` | `[FieldSpec]` | campos do editor. Ver §5. |

### Opcionais (hooks)

| Campo | Papel |
|---|---|
| `statusVocabulary` | vocabulário editorial (§2). Ausente = default do Admin. |
| `metricBuilder(items, ctx)` | métricas custom (§2). Ausente = `defaultMetricBuilder`. |
| `renderPreview(draft, ctx)` | preview ao vivo. `ctx.setDraft` habilita preview interativo (drag de blocos). Ausente = dump JSON. |
| `clinicalFields` | campos cuja mudança em item **aprovado** rebaixa a revisão (review-dirty). |
| `diffClinico(campo, antes, depois)` | tradução humana do diff de um campo estruturado (pro atestado de revisão). |
| `editorSteps` / `sectionMeta` | wizard (passos + metadados de seção). Ausente = editor de aba única. |
| `editorTabs` / `editorDescription` | customização do cabeçalho do editor. |
| `emptyHint` / `emptyZeroHint` | textos dos dois EmptyState (filtro-vazio vs zero-itens). |

### Campo da camada de domínio a **reescrever**, nunca copiar

`normalize` + `validate` + `renderPreview` são **da ferramenta**. **Não** copiar `normalizeAntibiotico` as-is pra um escore (carrega clearance/via/posologia que não se aplicam).

---

## 5. `FieldSpec` (resumo)

`type`: `text` (default) · `textarea` · `select` · `radio` · `checkbox` · `toggle` · `checkbox-group` (N-de-N) · `tags` · `repeater`.

Regras de seleção (memory `feedback_sectionlabel_e_select_campos`): **1-de-N usa `select`** (CategoryDropdown), **N-de-N usa `checkbox-group`**, nunca botão faux-select. `SectionLabel` separa grupos, **nunca** é label de campo.

Repeater: `itemFields` (cada um pode ter `core: true` pra ficar no núcleo, resto vai em "Detalhes"), `defaultItem(draft)`, `itemLabel`, `itemPreview`, `alternativeKey`, `addLabel`/`addFirstLabel`/`emptyText`, `reorderable` (default true).

Comum: `key` (path com pontos), `label`, `section`, `tab` (`manual`/`behavior`), `wide`, `hint`, `showWhen(draft)`, `apply(draft, value)` (override de escrita).

---

## 6. Robustez (M11) — já no contrato do motor

- **loading**: `store.getStatus === 'hydrating'` → skeleton (backend remoto). Local é sempre `ready`.
- **error**: `store.getError != null` → banner "exibindo o catálogo base" (a carga degradou pro seed). Nunca tela branca.
- **empty-zero** (nada cadastrado) ≠ **empty-filtro** (busca não bateu) — dois EmptyState distintos.
- toda escrita normaliza; remoção/edição com undo via toast.

---

## 7. Checklist de conformidade — criar uma ferramenta nova

1. [ ] `createModuleStore({ storageKey, seed, normalize })` com `normalize` da ferramenta (chave `cm_admin_<modulo>_vN`).
2. [ ] `normalize(item, raw)` é **total** (preenche defaults, sanitiza forma, **não inventa dado clínico** — Q7) e **idempotente** (`normalize(normalize(x)) === normalize(x)`).
3. [ ] `validate` bloqueia na **publicação**, avisa no rascunho. Gates clínicos (se houver) impedem publicar conteúdo não estruturado.
4. [ ] `definition` declara os obrigatórios (§4). Se o vocabulário difere do Admin, declarar `statusVocabulary` (§2).
5. [ ] Campos de seleção respeitam 1-de-N vs N-de-N (§5).
6. [ ] Se tem preview, `renderPreview` **compõe** `PreviewFrame`/`ReorderableBlocks` (§3), não reescreve o shell.
7. [ ] JSON Schema em `src/admin/contracts/<modulo>.schema.json` + teste de contrato `seed → store.list → schema` (espelha **TESTE-01**).
8. [ ] Teste de round-trip / matriz de fogo (espelha **TESTE-03**): `normalize → validate → upsert → reload → reopen` é idempotente.
9. [ ] Tokens DS (`--ds-*`, `--esp-*`), zero hardcode. `DesktopModal` é o overlay único.
10. [ ] Estados loading/error/empty-zero/empty-filtro cobertos (§6).

> **Pré-requisito declarado (relatório §5):** itens 1, 2 (normalização), o vocabulário (A7) e o contrato documentado **antes de copiar** o template pra condutas/escores. Sem isso, todo módulo copiado herda os bugs de raiz.

---

## 8. Gates de conformidade (testes que provam o contrato)

| Teste | Arquivo | Prova |
|---|---|---|
| **TESTE-01** | `contracts/antibioticos.contract.test.js` | `store.list` vem normalizado e conforma ao schema (A1). |
| **TESTE-02** | mesmo arquivo | ajv runtime sobre o seed normalizado. |
| **TESTE-03** | `antibioticos*.test.js` (matriz de fogo) | `normalize` idempotente: 8 `tipoCalculo` × {adulto, ped} × {1 via, multi-via}. |
| **A1** | `data/createModuleStore.test.js` | normalize roda em load + hidratação + escrita; degrada se lançar. |
| **A7 / COBERTURA-01** | `modules/_shared/ClinicalResourceModule.template.test.js` | vocabulário parametrizável + métrica + chokepoint de publicação. |
| **BORDA-01..04** | `modules/antibioticos/antibioticosStore.test.js` | ordemBlocos adversária, `parseLimite('0')`≠vazio, vias round-trip, duplicata acento/espaço. |
