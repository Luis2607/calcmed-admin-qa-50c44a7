---
tipo: audit
atualizado: 2026-06-21
fontes:
  - _source/main.decoded.js (bundle Flutter/dart2js descompilado do app de produção)
  - admin-spec/01-sistema-de-tipos.md (flag F-09 levantada)
  - MODELO-DOSE-PEDIATRICA.md (arquetipos de dose / flags)
relacionado:
  - "[[01-sistema-de-tipos]]"
  - "[[MODELO-DOSE-PEDIATRICA]]"
status: resolvido
---

# Audit F-09 — Semantica Meses vs Anos nos gates de idade pediatrica

## Veredito

**RUIDO DE EXTRACAO, NAO BUG DO APP.** A unidade de idade esta codificada de forma
**consistente e correta** em todos os controllers pediatricos inspecionados:

- **valor `1` = Meses**
- **valor `2` = Anos**

Os gates de idade leem o campo `value` da opcao selecionada do dropdown (`s.c.b`), e
esse campo vale 1 para Meses e 2 para Anos — exatamente como o dropdown e definido. Os
limiares numericos por unidade batem com a clinica. **A flag F-09 surgiu de um segundo
enum (`eDt`, ordinal 0=Meses/1=Anos) que existe no bundle mas NAO alimenta os gates de
dose** — e usado so para renderizar rotulo em um card de UI nao relacionado. Confundir os
dois enums e a origem da suspeita de inversao.

Nao ha inversao. Nenhuma correcao de codigo e necessaria do lado do app. Para o admin, a
regra a propagar e: **a unidade de idade e um enum de 2 opcoes com value Meses=1, Anos=2**
(nao 0/1).

## Evidencia verbatim

### 1. Definicao do dropdown de unidade (a fonte de verdade)

Classe `A.aR(a,b,c)` com `this.a=a` (label/description), `this.b=b` (value), `this.c=c` (id):

```
aR:function aR(a,b,c){this.a=a
this.b=b
this.c=c},
```

```
A.aR.prototype={
co{return A.D(["description",this.a,"value",this.b],t.N,t.z)},
...
l(a){return"SelectValueModal( id: "+this.c+",  description: "+th...
```

As opcoes do dropdown de idade aparecem assim (multiplos controllers, identico):

```
new A.aR("Meses",1,"Meses"),new A.aR("Anos",2,"2")
```

```
eZc{var s=null,r="Meses"
return new A.Ra(...,new A.aR(r,1,"meses1"),
  A.a([new A.aR(r,1,r),new A.aR("Anos",2,"2")],...
```

Logo: **`b` (value) = 1 para Meses, 2 para Anos**, e o **default selecionado e "Anos",2**
(`new A.aR("Anos",2,"2")` passado antes da lista de opcoes em `K1`).

### 2. Gates de idade (classe `A.By`, controller Cetoprofeno pediatra)

`s.a` = valor numerico digitado. `s.c` = opcao de unidade selecionada (instancia de `aR`),
logo `s.c.b` = value (1=Meses, 2=Anos). Nomes semanticos vem das debug-strings embutidas
(`_EquationCetoprofenoPediatraControllerBase.isAgeLess12Months` etc).

```
gax_{...                       // isAgeLess6months
  if(s.c.b===1){... r=r<6}       // Meses: idade < 6
... if(s.c.b===2){... r=r<1}}  // Anos:  idade < 1
gady{...                       // isAgeLess12Months
  if(s.c.b===1){... r=r<12}      // Meses: idade < 12
... if(s.c.b===2){... r=r<1}}  // Anos:  idade < 1   (12 meses == 1 ano: CORRETO)
gax2{...                       // isAgeOver1Less7Years
  if(r.c.b===1){... q=q>=12}     // Meses: >=12
... if(r.c.b===2){... s>=1... q=q<7}}  // Anos: >=1 e <7
gax8{...                       // isAgeOver7Less12Years
  if(r.c.b===2){... s>=7... q=q<12}}     // SO Anos: >=7 e <12
gax1{...                       // isAgeOver12Years
  if(s.c.b===2){... r=r>=12}}    // SO Anos: >=12
```

Leitura: **unidade 1 sempre carrega limiar em MESES (3/6/12), unidade 2 sempre carrega
limiar em ANOS (1/7/12).** Coerente com Meses=1, Anos=2.

### 3. Confirmacao cruzada em outros 2 controllers

Dipirona (`A.wz.prototype`), `isAgeLess3Months`:

```
gawZ{... if(s.c.b===1){... r=r<3}      // Meses: idade < 3
  else r=!1
  if(!r){... r=s.b... r=r<5}}           // fallback por PESO (s.b<5), nao por Anos
```

Ibuprofeno (`A.a7D.prototype`), `isAgeOver6Months`:

```
gadA{... if(s.c.b===1){... r=r>=6}     // Meses: >=6
... if(s.c.b===2){... r=r>=1}}         // Anos:  >=1  (>=1 ano implica >6 meses: CORRETO)
```

Os tres controllers concordam: `1`=Meses, `2`=Anos.

### 4. O enum que gerou a confusao (`eDt`) — NAO e o gate

```
eDt(a){switch(a.a){case 0:return"Meses"
case 1:return"Anos"}},
```

Este e um **segundo enum, ordinal 0/1**, que mapeia indice -> rotulo. Callers:

```
a3=a3==null?null:A.eDt(a3)   // dentro de builder de CARD de UI, ao lado de
                             // "Dispositivos","Impressao diagnostica","ATB / DVA","Exames"
```

E codigo de **apresentacao** (formata um valor salvo para exibir em um card), nao toca a
logica de dose. Os gates de dose nunca chamam `eDt` nem leem o ordinal `.a` da unidade —
leem `.c.b` (o value do `aR`). Os dois enums coexistem com codificacoes diferentes (0/1 vs
1/2) porque servem a coisas diferentes.

## Censo de seguranca

`grep "c.b===N"` no bundle inteiro:

```
   3  c.b===0
  22  c.b===1
  16  c.b===2
```

Os **3 `c.b===0` NAO sao gates de idade** (verificado um a um):
- `ey7(...)` helper de paint/stroke (`c.b` = flag de borda)
- controller com `gON/gFR/chV/chW` (selecao binaria de outro campo, nao Meses/Anos)
- codigo de buffer/fonte de baixo nivel (`if(c.b===0||c.c===0)return`)

Nenhum gate de unidade de idade le o valor 0. So existem 1 (Meses) e 2 (Anos), batendo
com o dropdown. **Sem inversao em lugar nenhum.**

## Achados-chave para o JSON de faixa etaria (pre-requisito F-09)

1. Unidade de idade = enum de 2 opcoes; no admin/schema use **value Meses=1, Anos=2**
   (nunca 0/1). Default de produto observado = **Anos**.
2. Os limiares ja vivem em DUAS escalas dependendo da unidade selecionada — o app NAO
   normaliza idade para uma unica unidade interna; ele ramifica por unidade e compara o
   numero cru contra o limiar naquela unidade (ex.: Meses ramo usa 3/6/12; Anos ramo usa
   1/7/12). Qualquer modelo de faixa etaria no admin precisa carregar **(unidade, limiar)**
   como par, nao um numero solto.
3. Cobertura assimetrica e intencional, nao bug: faixas finas (3/6 meses) so existem no
   ramo Meses; faixas largas (7-12 anos, >12 anos) so existem no ramo Anos. Um valor
   "8" digitado em Meses simplesmente nao cai em `isAgeOver7Less12Years` (que so testa
   Anos) — comportamento esperado do app, mas e uma **pegadinha de UX** a registrar (nada
   impede o usuario de digitar 18 com unidade Meses).
4. Inconsistencia menor a sinalizar (nao bloqueia F-09): em `gax_` (isAgeLess6months) o
   ramo Anos testa `idade < 1` (=12 meses), nao `< 6 meses`. "Menos de 6 meses" e "menos
   de 1 ano" nao sao equivalentes. Provavel atalho do dev (quem escolhe Anos so consegue
   digitar inteiros >=1, entao "menos de 6 meses" via Anos e impossivel e o ramo so serve
   pra nao quebrar). Confirmar com clinica antes de replicar essa regra no admin.

## Limitacoes desta auditoria

- Inspecao em 3 controllers pediatricos (Cetoprofeno, Dipirona, Ibuprofeno). Os 22+16
  `c.b===1/2` sugerem o mesmo padrao em todos os antipireticos/analgesicos pediatricos,
  mas nao abri os 38 individualmente. Confianca alta de que o padrao e uniforme (mesma
  classe-base de controller, mesmo dropdown), mas nao 100% exaustivo.
- Bundle e dart2js minificado-descompilado; nomes como `gady`/`gax_` sao do minificador,
  a semantica vem das debug-strings preservadas (`isAgeLess12Months`), que sao confiaveis.
