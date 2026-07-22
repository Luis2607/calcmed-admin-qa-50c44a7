# Contratos JSON do Admin CalcMed — modelo cristalino de tudo

> Fonte única do "como o dado é guardado" em cada ferramenta do admin, na nuvem (Supabase) e no localStorage. Complementa `template-contract.md` (como construir uma ferramenta) — aqui é **o shape do dado**. Atualizado 2026-06-22.

## 1. Princípio (vale pra TODA ferramenta)

Cada item de qualquer ferramenta é **uma linha** numa tabela `calcmed_<ferramenta>`. O item NORMALIZADO completo vive numa coluna **`data jsonb`** = **fonte única da verdade**. As demais colunas são **promovidas** (derivadas do `data` pelo trigger) só pro que RLS / consulta / realtime precisam. Isso deixa o schema do item evoluir sem `ALTER TABLE`.

### Tabela genérica (idêntica em todas)
```
id               text primary key      -- = item.id
categoria        text                  -- dominio/tipo da ferramenta (filtro)
status_editorial text  ('rascunho'|'em-revisao'|'publicado')   -- derivado de data.statusEditorial
revisao_status   text  ('pendente'|'em-analise'|'aprovado'|'reprovado') -- derivado de data.revisaoMedicaStatus
data             jsonb NOT NULL        -- o item normalizado inteiro (verdade)
updated_by       text
updated_at       timestamptz
```
Tabelas vivas: `calcmed_antibioticos`, `calcmed_condutas`, `calcmed_checklists`, `calcmed_banners`, `calcmed_atendimento` (chamados/suporte, provisório), `calcmed_portal_tasks` (hub Escopo&Tasks). Migrations versionadas em `apps/web/supabase/migrations/`.

### Gate clínico no servidor (trigger, ferramentas clínicas)
Ao gravar com `status_editorial='publicado'`, o trigger barra (raise → o cliente recebe erro):
- **C1:** exige `revisao_status='aprovado'` (conteúdo clínico só publica revisado).
- **N2:** exige ao menos 1 sub-item com conteúdo (ex.: posologia com dose+unidade, ou conduta com corpo/checklist, ou checklist com itens) — ou `so-aviso`.
- **GATE-04:** coage `status`/`revisao` (trim+lowercase) ao enum.
- **N1 (unique index parcial):** sem duas linhas publicadas com mesmo `(nome, categoria, via)`.
Banners NÃO tem gate clínico (marketing) — só RLS + sync de colunas.

### Contrato do store/adapter (vale pra todas)
- `list` SEMPRE devolve itens **normalizados** (busca por sinônimo/marca confiável).
- Escrita **granular** na nuvem (`saveItem`/`removeItem`, 1 linha por edição) com **rollback + writeError** se o servidor recusar.
- **Auto-seed:** 1ª carga em PROD com tabela vazia semeia o catálogo (seeds normalizados).
- Backend só liga em `import.meta.env.PROD`; dev/teste = localStorage (zero rede).

---

## 2. Shape do `data` por ferramenta

> O schema formal (ajv) de cada uma, quando existe, está em `apps/web/src/admin/contracts/<tool>.schema.json` (source of truth executável + teste de contrato). Abaixo o resumo.

### Antibióticos (`calcmed_antibioticos`) — schema: `antibioticos.schema.json`
```jsonc
{
  "id": "string", "nome": "string", "classe": "string",
  "publico": "adulto|pediatrico",            // categoria promovida deriva disso
  "vias": ["EV","Oral","IM"],                 // multi-via; `via` = derivada (1ª)
  "tagsBusca": ["string"], "nomesComerciais": ["string"],
  "apresentacao": "string",
  "ordemBlocos": ["string"],                  // ordem dos blocos na tela (drag)
  "statusEditorial": "rascunho|em-revisao|publicado",
  "revisaoMedicaStatus": "pendente|em-analise|aprovado|reprovado",
  "posologias": [{
    "id","papel","tituloCustom?",
    "tipoCalculo": "fixo|por-peso|faixa-etaria-lookup|faixa-clearance|ataque-manutencao|infusao-bic|hibrido|so-aviso",
    "dose","unidade","viaInline","intervalo","diluente","tempo","esquema","cenario","droga",  // STRINGS (coagidas)
    "doseMaxima": { "valor":"", "unidade":"", "tipo":"clamp|texto" } | null,  // Q7: valor vem do Gustavo
    "regraCalculo": {... } | undefined        // fase 2: estrutura do cálculo (gate C2 exige pra publicar arquétipos de conta)
  }],
  "observacoes": [{ "id","nivel":"footnote|...","titulo?","texto" }],
  "rangesSeguranca": [{ "campo","min","max","unidade","mensagem" }],  // Q7: min/max do Gustavo
  "referencias": "string"
}
```
**Q7 (inviolável):** o sistema NUNCA inventa número clínico. `doseMaxima.valor`, `rangesSeguranca.min/max`, e a `regraCalculo` nascem vazios/ausentes e vêm verbatim do as-is/Gustavo. O admin guarda o **tipo** de cálculo, nunca computa o resultado.

### Condutas (`calcmed_condutas`) — clínico, gate ON
`{ id, nome, categoria, statusEditorial, revisaoMedicaStatus, corpo (texto/blocos), checklist?, receita?, encaminhamento?, referencias }`. N2 = exige `corpo` OU `checklist`. (Receita robusta com paciente/assinatura = versão futura.)

### Checklists (`calcmed_checklists`) — clínico, gate ON
`{ id, nome, categoria, statusEditorial, revisaoMedicaStatus, itens: [{ id, texto,... }] }`. N2 = exige `itens` preenchido.

### Banners (`calcmed_banners`) — marketing, SEM gate clínico
`{ id, titulo, formato: "imagem|texto", publico: ["gratuito","premium-mensal","premium-anual"], local: ["home-adulto","pediatria","todos","menu"], ativo, inicioEm, fimEm, imagemUrl?/imagemWebUrl? }`. `publico` e `local` são **multi-select** (decisão Gustavo 20/06; leitura back-compat de strings legadas). FLAG: imagem hoje vira data-URL no jsonb (futuro = Supabase Storage só com a URL).

### Chamados / Atendimento (`calcmed_atendimento`) — suporte, SEM gate clínico — schema: `atendimento.schema.json`
`{ id, usuario, especialidade, data (ISO), assunto, status: "aberto|resolvido", canal, historicoIA: [{remetente:"usuario|ia", texto, data}], mensagensSuporte: [{remetente:"usuario|agente", texto, data}] }`. Sem `normalize`/`validate` de store (igual banners): o jsonb guarda o item cru, só o `id` é garantido. `categoria` promovida = o **status** (aberto|resolvido), derivada pelo trigger 0007 de `data->>'status'`. `mensagensSuporte` **sempre array** (a UI lê sem guarda). **PROVISÓRIO:** o suporte real deve migrar pra ferramenta externa de tickets (Microsoft/Trello); a tabela mantém a aba funcional/persistente enquanto a decisão não fecha.

### Portal Tasks (`calcmed_portal_tasks`) — hub Escopo&Tasks (não-clínico)
`{ item_id, status: "todo|doing|done|blocked", responsavel, updated_by, updated_at }`.

---

## 3. Ferramentas que NÃO seguem este molde (shape diferente, fora do template jsonb-por-item)
- **Equipe:** máquina de comandos (`teamAccessStore`, estado composto `{members,invites,roles,audit,version,revision}`) + Auth/RBAC. Backend próprio (tabelas members/invites/roles/audit ou estado versionado por revision). Fase Auth.
- **Métricas/Feedback (avaliações):** dado vindo do APP (joinha+comentário), não autoria do admin. Precisa de ingestão write-side pelo B2C + RLS distinta (app insere, admin só lê/exporta). Não é replicar CRUD.

## 4. Adicionar uma ferramenta nova
Ver `template-contract.md`. Resumo: defina o `normalize`/`validate`/`definition`, crie `calcmed_<tool>` (migration espelhando o padrão acima), e ligue o store com `resolveAdapter` PROD-gated + `seedRaw` normalizado. O motor (`createModuleStore`/`ClinicalResourceModule`) já é genérico.
