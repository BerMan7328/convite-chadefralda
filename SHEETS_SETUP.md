# Ligar o convite numa planilha do Google

Uma planilha só, cinco abas. Sem isso o site funciona, mas tudo fica no
`localStorage` do aparelho de quem preencheu — ou seja, você não vê nada.
Leva ~5 minutos.

## O que é registrado

| Aba | O que cai lá | Quando |
|---|---|---|
| `RSVP` | Lista de confirmados: nome, WhatsApp, quantos, **palpite**, **de qual lado veio**, presente, recado, se entrou no grupo, acertos do quiz, nº da rifa | ao enviar o formulário |
| `Votos` | Cada voto menino/menina isolado | ao votar no capítulo XI, mesmo sem confirmar presença |
| `Grupo` | Quem clicou pra entrar no grupo do WhatsApp | ao clicar no botão do grupo |
| `Recados` | Mural de recados | ao enviar no mural (capítulo XVI) |
| `Rifa` | Interesse nos números da ação entre amigos | ao clicar num número |

> **Sobre a coluna "Clicou no grupo":** o site não tem como saber se a pessoa
> realmente entrou no WhatsApp — só que ela clicou no link. A coluna se chama
> assim de propósito. O checkbox "já entrei no grupo" do formulário é a
> declaração da própria pessoa; use as duas juntas.

---

## 1. Crie a planilha

Nova planilha no Google Sheets, com **cinco abas**:
`RSVP`, `Votos`, `Grupo`, `Recados`, `Rifa`.

## 2. Extensões → Apps Script

Apague o conteúdo e cole:

```js
const CABECALHOS = {
  RSVP: ['Quando', 'Nome', 'WhatsApp', 'Vai?', 'Quantos', 'Palpite', 'Lado',
         'Presente', 'Recado', 'Clicou no grupo', 'Pulou a história?',
         'Acertos no quiz', 'Quais acertou', 'Número da rifa'],
  Votos:   ['Quando', 'Palpite'],
  Grupo:   ['Quando', 'Nome', 'Origem'],
  Recados: ['Quando', 'Nome', 'Recado'],
  Rifa:    ['Quando', 'Número', 'Prêmio', 'Status'],
};

function aba(nome) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let a = planilha.getSheetByName(nome);
  if (!a) a = planilha.insertSheet(nome);
  if (a.getLastRow() === 0) a.appendRow(CABECALHOS[nome]);
  return a;
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const quando = d.ts || new Date();

  if (d.tipo === 'voto') {
    aba('Votos').appendRow([quando, d.palpite || '']);

  } else if (d.tipo === 'grupo-clique') {
    aba('Grupo').appendRow([quando, d.nome || '', d.origem || '']);

  } else if (d.tipo === 'recado') {
    aba('Recados').appendRow([quando, d.nome || '', d.recado || '']);

  } else if (d.tipo === 'rifa-interesse') {
    aba('Rifa').appendRow([quando, d.numero, d.premio || '', 'interesse']);

  } else if (d.tipo === 'revelacao-vista') {
    // opcional: descomente se quiser medir quem chegou até a revelação
    // aba('Votos').appendRow([quando, 'viu a revelação · ' + (d.palpite || '')]);

  } else {
    aba('RSVP').appendRow([
      quando,
      d.nome || '', d.whatsapp || '', d.vai || '', d.quantos || '',
      d.palpite || '', d.lado || '', d.presente || '', d.recado || '',
      d.entrou_no_grupo || '', d.apressado || '',
      d.acertos_quiz === '' ? '' : Number(d.acertos_quiz),
      d.tags_acertos_quiz || '', d.rifa_numero || '',
    ]);
  }

  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  const tipo = e.parameter.tipo;

  if (tipo === 'rifa-vendidos') {
    // marque 'pago' na coluna Status conforme os PIX chegarem
    const vendidos = aba('Rifa').getDataRange().getValues().slice(1)
      .filter(l => String(l[3]).toLowerCase() === 'pago')
      .map(l => Number(l[1]))
      .filter(n => !isNaN(n));
    return json({ vendidos });
  }

  if (tipo === 'recados') {
    const recados = aba('Recados').getDataRange().getValues().slice(1)
      .map(l => ({ nome: l[1], recado: l[2] }))
      .filter(r => r.recado);
    return json({ recados });
  }

  return ContentService.createTextOutput('ok');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Publique

**Implantar → Nova implantação → Tipo: App da Web**

- Executar como: **Eu**
- Quem pode acessar: **Qualquer pessoa**

Copie a URL (`https://script.google.com/macros/s/.../exec`).

## 4. Cole no `script.js`

```js
sheetsEndpoint: 'https://script.google.com/macros/s/SUA_URL_AQUI/exec',
```

Republique a cada alteração do Apps Script (**Implantar → Gerenciar implantações
→ editar → Nova versão**), senão a mudança não vale.

---

## Detalhes que importam

**Por que `mode: 'no-cors'` no envio?**
O Apps Script não responde ao preflight de CORS com `Content-Type` custom. O site
envia como `text/plain` e o Apps Script faz o parse. Efeito colateral: a resposta
é opaca, então o site não consegue confirmar o status — ele assume sucesso e
**sempre** guarda um backup no `localStorage`.

**Acertos do quiz vão como número inteiro (0–10), nunca `"9/10"`.**
O Sheets interpreta `9/10` como data e corrompe a coluna inteira.

**A rifa registra "interesse", não "pago".**
Quando alguém clica num número, cai uma linha com status `interesse`. Você troca
para `pago` quando o PIX cair — aí o `doGet` passa a devolver esse número e ele
some da cartela para todo mundo. Se preferir não depender disso, liste os números
na mão em `CONFIG.rifa.vendidos`.

**O mural é público.** Qualquer pessoa com o link escreve. O site exibe os
recados como texto puro (nunca como HTML), então ninguém consegue injetar nada
na página — mas se quiser moderar, apague a linha na aba `Recados`.
