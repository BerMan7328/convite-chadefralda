# Falta pouco — Chá de fralda da Anna Laura

Convite interativo em página única. Site estático (HTML + CSS + JS, sem build,
sem dependência) publicado no GitHub Pages.

## Como o convite funciona

São **9 seções** em rolagem vertical com *scroll-snap*, cada uma ocupando a tela
inteira, com trilho de progresso na lateral e animação de entrada por seção:

1. **Capa** — "Falta pouco", a data e a contagem regressiva
2. **A história** — Rodrigo, Clara e a Maitê
3. **A notícia** — a surpresa que virou bênção
4. **A festa** — data, local, cardápio e botões de agenda/mapa
5. **O enxoval** — prioridade (fraldas P e M) e "se for do coração"
6. **O palpite** — Time Azul × Time Rosa
7. **Rifa entre amigos** — cartela de 100 números e PIX
8. **Confirmação** — o formulário
9. **O álbum** — mural de fotos e livro de recados (travado)

É um chá de fralda: todo mundo sabe. Mas o convite propõe uma brincadeira — o
convidado chuta menino ou menina e confirma presença. **Só então** roda a
animação: um medidor oscila entre `MENINO — Jorge Rodrigo` e
`MENINA — Anna Laura`, dá três quase-decisões (para, hesita, volta a girar) e
finalmente crava **MENINA**, com confete, balões e o nome **Anna Laura**
aparecendo letra a letra. Aí destrava a seção 8.

### Cuidado com spoiler

O `<title>`, o Open Graph e os textos das seções não citam o nome do bebê em
lugar nenhum — ele só aparece na animação, depois da confirmação.

O link do grupo do WhatsApp vive **só no bloco pós-confirmação**, junto com o
QR code: igual ao álbum, ele só se abre depois que a pessoa confirma presença e
vê a revelação. Fora o spoiler que o nome do grupo pode entregar, é o que faz o
convidado percorrer o convite inteiro antes de entrar no grupo. **Não recoloque
o atalho na capa.**

---

## ⚠️ Antes de divulgar: preencha o CONFIG

Tudo que é informação do evento está em **um bloco só**, no topo do `script.js`.
Não existe data nem endereço escrito no HTML — o site inteiro (textos, contagem
regressiva, `.ics`, Google Calendar, Waze) é gerado dali.

```js
const CONFIG = {
  local:    'A definir',            // ← PENDENTE
  endereco: 'Endereço a confirmar', // ← PENDENTE
  mapsUrl:  '',                     // ← PENDENTE
  whatsappNumero: '',               // ← PENDENTE (só dígitos: 5531999999999)
  sheetsEndpoint: '',               // ← PENDENTE, ver SHEETS_SETUP.md
  sorteio: { pix: { chave: '', nome: '', cidade: '' } },  // ← PENDENTE
};
```

Abra o site e olhe o **console do navegador**: ele lista o que falta. O workflow
do Actions também avisa, como *warning*, sem bloquear o deploy. Enquanto um link
não estiver preenchido, o botão fica desativado em vez de levar a lugar nenhum.

### QR code do grupo

Salve o print do QR como **`assets/qr-grupo.png`**. Ele aparece embaixo do botão
do WhatsApp, depois da confirmação. Se o arquivo não existir, o bloco some
sozinho — nada quebra.

### O card do WhatsApp

O convite anda colado em conversa, e é o `og:image` que decide se o link chega
como um card com arte ou como três linhas de texto. A arte é **`assets/og.jpg`**
(1200×630), gerada a partir de `tools/og.html` — o comando está comentado lá
dentro. Repete a capa e **não cita o nome do bebê**.

A URL no `<meta>` é absoluta porque o WhatsApp ignora caminho relativo. Se o
endereço do site mudar, os `og:url` e `og:image` do `index.html` mudam junto.
O WhatsApp guarda o preview em cache por semanas: se trocar a arte depois de já
ter divulgado, o card antigo continua aparecendo por um tempo.

### Rifa entre amigos

Cartela de 100 números, seção própria. A pessoa escolhe **quantos quiser**, a
contribuição é calculada (`nº × CONFIG.sorteio.valor`) e a reserva vai pra
planilha com um código curto de 4 letras.

O site gera o **PIX copia e cola** (BR Code do Bacen, montado em `pixCopiaECola()`)
já com o valor total e o identificador `RIFA` + código — que aparece no seu
extrato, permitindo casar cada PIX com a linha da planilha.

Preencha `CONFIG.sorteio.pix` com chave, nome do titular e cidade. Sem os três,
o copia e cola não é gerado e o site mostra só a chave.

⚠️ **Nenhum site estático confirma PIX sozinho** — isso exige um provedor com
webhook e servidor. O fluxo aqui é: reserva entra como `reservado`, você marca
`pago` na planilha quando o dinheiro cair, e o número muda de amarelo pra cinza.

### Quem volta ao convite

O convite lembra a visita anterior, **por aparelho** (`localStorage`), e remonta
duas telas no boot:

- **`cdf-rsvp`** → quem já confirmou volta direto no bloco de confirmação, com o
  álbum aberto. Sem isso o formulário aparecia em branco de novo, e o caminho
  natural era confirmar outra vez — duplicando a linha na planilha que decide a
  feijoada.
- **`cdf-rifa`** → quem já reservou volta com os números, o código e o PIX na
  tela. O valor do copia e cola sai da quantidade de números restaurados, não
  de um total salvo.

Dois botões discretos saem daí: **rever a revelação** (para quem fechou a página
no meio da animação) e **corrigir minha resposta**, que devolve o formulário
preenchido — serve também pra segunda pessoa do mesmo celular confirmar a dela.

Duas coisas que isso **não** faz, de propósito: não reacende o palpite na seção
da aposta (a escolha tem que ser um ato, toda vez) e não impede a linha extra na
planilha quando alguém corrige — vale a **última resposta do mesmo nome**.

### Trilha sonora

`assets/sons/trilha.mp3`, apontado em `CONFIG.audio.arquivo`. O controle de som
(mudo + volume) fica no canto inferior esquerdo; com `arquivo: null` ele some.

A trilha só começa depois da primeira interação — política de autoplay dos
navegadores — e abaixa sozinha durante a revelação e quando alguém tira o mudo
de um vídeo do álbum.

O arquivo foi recodificado de 320 kbps (11 MB) para 96 kbps (3,4 MB): é trilha
ambiente tocando baixo, então a taxa alta só custava dados de quem abre o
convite pelo celular.

### Álbum

Liste as mídias em `CONFIG.galeria`. Aceita `foto`, `gif` e `video`:

```js
galeria: [
  { tipo: 'foto', src: 'assets/galeria/ultrassom.jpeg',
    titulo: 'O primeiro retrato',
    comentario: 'A primeira vez que a gente viu esse rostinho.' },
  { tipo: 'video', src: 'assets/galeria/chute.mp4',
    poster: 'assets/galeria/capa.jpeg',
    titulo: 'O primeiro chute', comentario: 'Som ligado. Vale a pena.' },
],
```

Cada item vira uma polaroid inclinada com entrada escalonada: `titulo` escrito à
mão na margem branca, `comentario` como bilhete embaixo. Clicar abre o
visualizador com navegação. Com a lista vazia, mostra "álbum em construção".

---

## Design

Direção tirada da referência de decoração do evento: **verde-sálvia, creme e
dourado**.

- **Painéis em arco** (`--arco`) nos cartões principais, com fio de ouro interno
- **Textura ripada** nas colunas do enxoval, imitando os pedestais
- **Guirlanda de balões** e **ramos botânicos** em SVG, no `<defs>` do HTML
- **Letreiro dourado com halo** no título da capa
- Cortinas de sálvia nas laterais e luzinhas piscando ao fundo

Fontes: **Cormorant Garamond** (display), **Great Vibes** (script),
**Outfit** (interface).

A paleta é neutra de propósito. Além de casar com a decoração, ela evita o
problema da versão anterior: azul e rosa dominando a página inteira davam cara
de chá revelação e entregavam a brincadeira. Agora essas duas cores aparecem
**só dentro dos cartões do palpite**.

Todas as cores e raios são variáveis no `:root`. Respeita
`prefers-reduced-motion`.

---

## Rodar local

```bash
docker run --rm -p 8080:80 -v "$PWD":/usr/share/nginx/html:ro nginx:alpine
# http://localhost:8080
```

Sem Docker: `python3 -m http.server 8080`.

> Pelo `file://` funciona parcialmente, mas o `fetch` da planilha exige `http://`.

---

## Publicar

Push na `main` → o workflow valida e publica. A validação quebra o build se
algum `src`/`href` local apontar para arquivo inexistente, ou se o `script.js`
procurar um `getElementById` que não existe.
