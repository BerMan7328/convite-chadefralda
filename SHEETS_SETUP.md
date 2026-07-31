# Ligar o convite numa planilha do Google

Uma planilha só, cinco abas. Sem isso o site funciona, mas tudo fica no
`localStorage` do aparelho de quem preencheu — ou seja, você não vê nada.
Leva ~5 minutos.

## O que é registrado

| Aba | O que cai lá | Quando |
|---|---|---|
| `RSVP` | Lista de confirmados: nome, WhatsApp, quantos, **palpite**, **de qual lado veio**, presente, recado, se clicou no grupo e o **número da sorte** | ao enviar o formulário |
| `Votos` | Cada voto menino/menina isolado | ao votar na seção do palpite, mesmo sem confirmar presença |
| `Grupo` | Quem clicou pra entrar no grupo do WhatsApp | ao clicar no botão do grupo |
| `Recados` | Mural de recados | ao enviar no mural (seção do álbum) |
| `Rifa` | Reservas da rifa entre amigos: nome, WhatsApp, números, contribuição, código e status | ao reservar números |


> **Sobre a coluna "Clicou no grupo":** o site não tem como saber se a pessoa
> realmente entrou no WhatsApp — só que ela clicou no link. A coluna se chama
> assim de propósito. O checkbox "já entrei no grupo" do formulário é a
> declaração da própria pessoa; use as duas juntas.

---

## 1. Crie a planilha

Nova planilha no Google Sheets, com **cinco abas**:
`RSVP`, `Votos`, `Grupo`, `Recados` e `Rifa`.

## 2. Extensões → Apps Script

Apague o conteúdo e cole:

```js
const CABECALHOS = {
  RSVP: ['Quando', 'Nome', 'WhatsApp', 'Vai?', 'Quantos', 'Palpite', 'Lado',
         'Presente', 'Recado', 'Clicou no grupo', 'Número da sorte'],
  Votos:   ['Quando', 'Palpite'],
  Grupo:   ['Quando', 'Nome', 'Origem'],
  Recados: ['Quando', 'Nome', 'Recado'],
  Rifa:    ['Quando', 'Nome', 'WhatsApp', 'Números', 'Quantidade',
            'Contribuição', 'Código', 'Status'],
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

  } else if (d.tipo === 'rifa') {
    aba('Rifa').appendRow([
      quando, d.nome || '', d.whatsapp || '', String(d.numeros || ''),
      d.quantidade || '', d.total || '', d.codigo || '', d.status || 'reservado',
    ]);

  } else if (d.tipo === 'revelacao-vista') {
    // opcional: descomente se quiser medir quem chegou até a revelação
    // aba('Votos').appendRow([quando, 'viu a revelação · ' + (d.palpite || '')]);

  } else {
    aba('RSVP').appendRow([
      quando,
      d.nome || '', d.whatsapp || '', d.vai || '', d.quantos || '',
      d.palpite || '', d.lado || '', d.presente || '', d.recado || '',
      d.entrou_no_grupo || '', d.numero_sorte || '',
    ]);
  }

  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  const tipo = e.parameter.tipo;

  // Números já tomados — a cartela lê isto antes de deixar alguém clicar.
  // Uma linha pode ter vários números ("7, 42, 88"), então expande.
  if (tipo === 'rifa-ocupados') {
    const ocupados = [];
    aba('Rifa').getDataRange().getValues().slice(1).forEach(l => {
      const status = String(l[7] || 'reservado').toLowerCase();
      String(l[3] || '').split(',').forEach(pedaco => {
        const n = Number(String(pedaco).trim());
        if (n && !isNaN(n)) ocupados.push({ numero: n, status: status });
      });
    });
    return json({ ocupados });
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

## Como funciona a rifa

A planilha é a fonte da verdade dos números:

1. a página desenha os 100 números **travados**, num estado de carregamento;
2. chama `?tipo=rifa-ocupados` e marca cada número como `reservado` (amarelo) ou
   `pago` (cinza, riscado);
3. destrava a cartela e só então aceita cliques;
4. na hora de reservar, **reconfere** — se alguém tiver levado um dos números
   nesse meio-tempo, ele sai da seleção e a pessoa é avisada.

Se a planilha não responder, a cartela destrava assim mesmo: melhor escolher às
cegas do que travar todo mundo. Nesse caso vale a lista manual
`CONFIG.sorteio.ocupados`.

**Sobra uma corrida possível:** dois convidados clicando no mesmo número no mesmo
instante só descobrem o conflito ao reservar, e o segundo é avisado. Eliminar
isso exigiria um servidor com trava — para uma festa, avisar resolve.

## Confirmar o PIX

Nenhum site estático consegue verificar um PIX sozinho: isso exige um provedor
(Mercado Pago, Asaas, Efí) com webhook e servidor. O que o convite faz, e que na
prática dá conta:

- Gera o **PIX copia e cola** já com o valor total e um identificador único da
  reserva (`RIFA` + código de 4 letras, ex.: `RIFA7RBC`). Esse identificador
  **aparece no seu extrato**, então dá pra casar cada PIX com a linha da planilha
  pela coluna *Código*.
- Oferece um botão que abre o WhatsApp com nome, números e valor prontos, pra
  pessoa mandar o comprovante.
- A reserva entra como `reservado`. **Você troca para `pago`** na coluna *Status*
  quando o dinheiro cair. O site relê e o número muda de amarelo para cinza.

Se quiser algo mais automático sem sair do estático, dá pra usar um link de
cobrança do Mercado Pago por número — mas aí você perde o copia e cola com valor
dinâmico e a experiência fica pior. Recomendo o fluxo acima.

**Os dados do PIX ficam visíveis no código-fonte** (`CONFIG.sorteio.pix`). Isso é
inevitável num site estático e não é um risco: chave PIX, nome e cidade são
exatamente o que você entregaria a quem vai te pagar. Só não coloque ali nada
além disso.

**O mural é público.** Qualquer pessoa com o link escreve. O site exibe os
recados como texto puro (nunca como HTML), então ninguém consegue injetar nada
na página — mas se quiser moderar, apague a linha na aba `Recados`.
