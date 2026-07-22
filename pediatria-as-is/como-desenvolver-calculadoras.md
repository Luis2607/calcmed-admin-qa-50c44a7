# Como desenvolver as calculadoras

> Guia de trabalho pra quem vai construir as calculadoras e ferramentas de dose. Junta num lugar só os specs, os contratos e o conteúdo de origem. Atualizado em 22/06/2026.

Esta página não é mais um documento pra ler do começo ao fim. É um índice de trabalho: o que abrir, em que ordem, e quais regras valem sempre. Os documentos completos estão aqui no portal, nos lugares indicados em cada seção.

---

## A regra que não se quebra (Q7)

O sistema nunca inventa número clínico. Dose, faixa, teto, fórmula: tudo vem verbatim do conteúdo de origem (o as-is) ou do Gustavo. O admin guarda o **tipo** de cálculo, nunca o resultado, que é calculado na hora.

Junto com isso: os bugs do as-is são preservados como estão na primeira passagem. Se uma dose parece errada, ela não se corrige no código sozinha. Corrigir exige revisão clínica do Gustavo. Migrar conteúdo "consertado" no escuro é proibido.

---

## Por onde começar

A ordem recomendada, do mais simples pro mais complexo:

1. **Leia o conteúdo de origem da ferramenta que vai construir.** Está em Explorar → Conteúdo do app. Cada droga e cada tela tem o texto exato do app de hoje. É a fonte da verdade do que a tela mostra.
2. **Veja qual arquétipo de dose ela usa** (a lista abaixo). Isso decide o motor de cálculo.
3. **Confira o contrato JSON** de como o dado é guardado (em Construir → Contratos JSON). É o shape que o admin grava e o app lê.
4. **Olhe o template-base** se for uma ferramenta nova de cadastro (em Construir → Handoff & specs). O motor genérico já faz tabela, busca, filtro, repeaters, import/export. Você só fornece a camada de domínio.

A primeira leva de telas é de propósito a mais fácil: itens livres no plano gratuito, de tela única ou molde simples, sem dependência entre telas (Anafilaxia, Hipoglicemia, os conversores, os corticóides). Servem pra validar o pipeline antes de encarar o que é mais complexo.

---

## Os 7 arquétipos de dose

Quase toda calculadora de dose cai num destes 7 padrões. Cada um vira um motor de cálculo. Identificar o arquétipo certo é o primeiro passo de cada tela.

1. **Peso computado.** Aritmética de peso vezes fator, com tetos. Ex.: Paracetamol, Sulfato de Magnésio, Glicerina.
2. **Faixa etária (lookup).** Tabela por faixa de peso ou idade, sem conta. Ex.: Dipirona, Simeticona, vários antibióticos.
3. **Híbrido.** Lookup mais um ramo aritmético. Ex.: Ibuprofeno, Penicilina G Benzatina, muitos antibióticos.
4. **Dose fixa.** Independe de peso e idade. Ex.: Colidis, Salbutamol.
5. **Só aviso.** Sem cálculo, só o bloco de Cuidados. Ex.: Metoclopramida.
6. **Dispatcher por apresentação.** O template troca conforme a indicação (anti-inflamatório, asma, crupe, meningite). Ex.: Dexametasona.
7. **Montagem (CRUD).** O usuário monta a própria solução. Ex.: vasoativas, soluções personalizadas.

O detalhamento de cada arquétipo, com as drogas mapeadas e os tetos, está no **Modelo de Dose Pediátrica** (Construir → Handoff & specs) e no **Manifesto de Build da Pediatria** (Construir → Handoff & specs), que traz o catálogo de todas as telas pediátricas com a fonte verbatim de cada uma.

---

## Os 3 moldes que carregam quase tudo

Antes de criar componente novo, esgote o reuso. Cerca de 90 telas pediátricas saem de 3 moldes mais o Design System que já existe:

- **Tela de droga por peso.** O caso mais comum: entra o peso, sai a dose, com os blocos de apresentação, cuidados e observações.
- **Lista de categoria.** Uma categoria que abre a lista de drogas dela.
- **Conversor.** Entrada e saída de conversão.

A tela da Terbutalina, no conteúdo de origem, é a referência de "pronto": ela tem todos os estados (vazio, preenchido, erro de peso, dose excedida). Use como padrão do que uma tela completa precisa cobrir.

---

## Como o dado é guardado (resumo)

O detalhe completo está em **Contratos JSON do Admin** (Construir → Contratos JSON). O essencial:

- Cada item de qualquer ferramenta é uma linha numa tabela `calcmed_<ferramenta>`. O item inteiro, normalizado, vive num campo `data` em JSON, que é a fonte da verdade. As outras colunas são derivadas dele, só pro que a consulta precisa.
- Conteúdo clínico tem um gate no servidor: pra publicar, o item precisa estar com a revisão aprovada e ter ao menos um sub-item com conteúdo de verdade. Banner não tem esse gate (é marketing).
- O admin guarda o tipo de cálculo. Valores que o sistema não pode inventar (dose máxima, mínimos e máximos de faixa de segurança, a regra de cálculo em si) nascem vazios e vêm do Gustavo.

---

## O que está combinado pra depois

Pra não travar agora no que ficou pra uma fase seguinte:

- **O motor de cálculo estruturado** (dose como intervalo com dois campos, faixa etária estruturada, idade gestacional) é fase 2. No primeiro corte, a dose entra como texto.
- **A ponte do admin pro app** (o app ler o conteúdo do admin em tempo real) é construção nova, decidida na planning. Até existir, o conteúdo roda pelo seed embarcado.
- **Publicação de dose pediátrica** depende de decisão de produto e da revisão do Gustavo. Hoje a publicação é só de conteúdo adulto.

---

## Checklist rápido antes de marcar uma calculadora como pronta

- A dose, os tetos e as faixas vieram verbatim do conteúdo de origem?
- O arquétipo de cálculo está certo?
- Os estados estão cobertos (vazio, preenchido, erro de peso, dose excedida, contraindicado quando se aplica)?
- O contrato JSON bate com o que o admin grava?
- Funciona no claro e no escuro, no celular e no desktop?
- Nenhum número foi inventado nem nenhum bug do as-is foi "consertado" sem revisão clínica?
