# E aí, qual é??? — Chá de fralda da Anna Laura

Convite interativo com revelação no fim. Site estático (HTML + CSS + JS,
sem build, sem dependência) publicado no GitHub Pages.

Derivado do [`convite-aniversario`](https://github.com/BerMan7328/convite-aniversario),
reaproveitando a engine de navegação, modais, quiz, trilha e RSVP.

## Como o convite funciona

O convite finge ser um **chá revelação**: 16 capítulos, Time Azul × Time Rosa,
envelope lacrado. O convidado vota em menino ou menina e preenche a confirmação.

**Só então** roda a animação de revelação: o medidor oscila entre
`MENINO — Jorge Rodrigo` e `MENINA — Anna Laura`, dá três quase-decisões
(para, hesita, volta a girar) e finalmente crava **MENINA**, com confete,
balões subindo e o nome **Anna Laura** aparecendo letra a letra.

Depois disso destrava o capítulo bônus: o mural de fotos e o livro de recados.

### 🚨 Cuidado com spoiler

O grupo do WhatsApp se chama *"Convite chá de fralda Anna Laura"* — o nome
entrega a revelação. Por isso o link e o QR do grupo **só aparecem depois da
confirmação**, nunca na tela inicial. Se mover esse link para o começo, o
convite se estraga sozinho.

Pelo mesmo motivo, o `<title>`, a descrição de Open Graph e os textos dos
capítulos não citam o nome em lugar nenhum.

---

## ⚠️ Antes de divulgar: preencha o CONFIG

Tudo que é informação do evento está em **um bloco só**, no topo do `script.js`.
Não existe texto de data/local espalhado pelo HTML — o site inteiro (títulos,
contagem regressiva, `.ics`, Google Calendar, Waze, WhatsApp) é gerado a partir dali.

```js
const CONFIG = {
  local:    'A definir',            // ← PENDENTE
  endereco: 'Endereço a confirmar', // ← PENDENTE
  mapsUrl:  '',                     // ← PENDENTE
  whatsappNumero: '',               // ← PENDENTE (só dígitos: 5531999999999)
  rifa: { pixChave: 'chave-pix-a-definir' },  // ← PENDENTE
  sheetsEndpoint: '',               // ← PENDENTE, ver SHEETS_SETUP.md

  whatsappGrupo: '...',             // ✔ já preenchido
  revelacao: { sexo: 'Menina', nomeMenina: 'Anna Laura',
               nomeMenino: 'Jorge Rodrigo' },  // ✔ o segredo
};
```

### QR code do grupo

Salve o print do QR do grupo como **`assets/qr-grupo.png`**. Ele aparece no
bloco final, embaixo do botão do WhatsApp. Se o arquivo não existir, o bloco
some sozinho e só o botão fica — nada quebra.

### Galeria do capítulo bônus

Liste as mídias em `CONFIG.galeria`. Aceita `foto`, `gif` e `video`:

```js
galeria: [
  { tipo: 'foto', src: 'assets/galeria/ultrassom.jpeg',
    titulo: 'O primeiro retrato',
    comentario: 'A primeira vez que a gente viu esse rostinho.' },
  { tipo: 'video', src: 'assets/galeria/chute.mp4',
    poster: 'assets/galeria/chute-capa.jpeg',
    titulo: 'O primeiro chute', comentario: 'Som ligado. Vale a pena.' },
],
```

Cada item vira uma **polaroid** com fita adesiva, inclinação própria, entrada
escalonada, `titulo` escrito à mão na margem branca e `comentario` como um
bilhete colado embaixo. Clicar abre o visualizador com navegação.

Com a lista vazia, o capítulo mostra um estado "álbum em construção" em vez
de quebrar.

Abra o site e olhe o **console do navegador**: ele lista o que ainda falta.
O workflow do GitHub Actions também avisa (como *warning*, sem bloquear o deploy).

Enquanto um link não estiver preenchido, o botão correspondente fica desativado
em vez de levar a lugar nenhum.

---

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Os 15 capítulos + o sprite SVG de ilustrações |
| `script.js` | `CONFIG` no topo, depois a engine (navegação, palpite, rifa, quiz, RSVP) |
| `style.css` | Engine herdada + bloco `TEMA CHÁ REVELAÇÃO` no fim |
| `.github/workflows/pages.yml` | Valida e publica no Pages |
| `SHEETS_SETUP.md` | Como ligar o RSVP e a rifa numa planilha do Google |

### Sobre os nomes `--op-*` e `--dr-*` no CSS

O template original era One Piece (`op`) × De Repente 30 (`dr`). Essas duas
famílias de tokens foram **remapeadas**, não renomeadas:

- `--op-*` → **Time Azul** + base creme
- `--dr-*` → **Time Rosa**

O mesmo vale para `data-tone` nos capítulos:
`op` = azul · `dr` = rosa · `hybrid` = os dois.

Renomear 355 usos não traria ganho nenhum e só aumentaria a chance de quebrar algo.

---

## Rodar local

```bash
docker run --rm -p 8080:80 -v "$PWD":/usr/share/nginx/html:ro nginx:alpine
# http://localhost:8080
```

Sem Docker: `python3 -m http.server 8080`.

> Abrir o `index.html` direto pelo `file://` funciona parcialmente,
> mas a cópia da chave PIX e o `fetch` da planilha exigem `http://`.

---

## Publicar

Push na `main` → o workflow valida e publica. O job de validação quebra o build se:

- algum `src`/`href` local apontar para arquivo inexistente;
- algum `<use href="#motif-x">` não tiver `<symbol>` correspondente;
- o `script.js` procurar um `getElementById` que não existe no HTML.

---

## Trocar as ilustrações por fotos

As cenas hoje são SVG inline (`<symbol id="motif-...">` no topo do `index.html`),
então o site fica completo sem nenhuma foto. Para usar fotos reais num capítulo,
troque o bloco:

```html
<div class="island-scene scene-motif scene-motif-duo">
  <svg class="scene-motif-svg" viewBox="0 0 120 120"><use href="#motif-casal"></use></svg>
```

por:

```html
<div class="island-scene scene-illustrated">
  <img class="scene-image" src="assets/fotos/nome-do-arquivo.jpeg" alt="...">
```

A classe `.scene-illustrated` já existe na engine, com moldura e overlay de avatares.

## Trilha sonora (opcional)

Coloque os arquivos em `assets/sons/` e preencha `CONFIG.audio`. Enquanto
`CONFIG.audio.jornada` for `null`, o botão de som fica escondido.

---

## Ação entre amigos (rifa)

Configurada em `CONFIG.rifa`. A cartela de números é gerada por JS.

- `vendidos: [3, 17, 42]` — números já pagos ficam apagados e desabilitados.
- Se `sheetsEndpoint` estiver configurado, o site também tenta ler os vendidos
  da planilha (`?tipo=rifa-vendidos`) e mescla com a lista local.
- O clique só **abre o WhatsApp com a mensagem pronta**; a reserva de fato
  acontece quando você confirmar o PIX e adicionar o número em `vendidos`.

Formato de "ação entre amigos" restrita a convidados — sorteio ao vivo no dia,
junto com a revelação.
