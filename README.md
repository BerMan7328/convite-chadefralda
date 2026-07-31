# E aí, qual é??? — Chá de fralda da Anna Laura

Convite interativo em página única. Site estático (HTML + CSS + JS, sem build,
sem dependência) publicado no GitHub Pages.

## Como o convite funciona

São **8 seções** em rolagem vertical com *scroll-snap*, cada uma ocupando a tela
inteira, com trilho de progresso na lateral e animação de entrada por seção:

1. **Capa** — o gancho, a data e a contagem regressiva
2. **A história** — Rodrigo, Clara e a Maitê
3. **A notícia** — a surpresa que virou bênção
4. **A festa** — data, local, cardápio e botões de agenda/mapa
5. **O enxoval** — prioridade (fraldas P e M) e "se for do coração"
6. **O palpite** — Time Azul × Time Rosa
7. **Confirmação** — o formulário
8. **O álbum** — mural de fotos e livro de recados (travado)

É um chá de fralda: todo mundo sabe. Mas o convite propõe uma brincadeira — o
convidado chuta menino ou menina e confirma presença. **Só então** roda a
animação: um medidor oscila entre `MENINO — Jorge Rodrigo` e
`MENINA — Anna Laura`, dá três quase-decisões (para, hesita, volta a girar) e
finalmente crava **MENINA**, com confete, balões e o nome **Anna Laura**
aparecendo letra a letra. Aí destrava a seção 8.

### 🚨 Cuidado com spoiler

O grupo do WhatsApp se chama *"Convite chá de fralda Anna Laura"* — o nome
entrega a brincadeira. Por isso o link e o QR do grupo **só aparecem depois da
confirmação**. O `<title>`, o Open Graph e os textos das seções também não citam
o nome em lugar nenhum.

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
};
```

Abra o site e olhe o **console do navegador**: ele lista o que falta. O workflow
do Actions também avisa, como *warning*, sem bloquear o deploy. Enquanto um link
não estiver preenchido, o botão fica desativado em vez de levar a lugar nenhum.

### QR code do grupo

Salve o print do QR como **`assets/qr-grupo.png`**. Ele aparece embaixo do botão
do WhatsApp, depois da confirmação. Se o arquivo não existir, o bloco some
sozinho — nada quebra.

### Ação entre amigos

Não tem cartela de números. **Quem confirma presença ganha um número da sorte**,
gerado na hora e mostrado na tela de confirmação, junto do prêmio
(kit Jack Daniel's). Ninguém paga nada. Configurado em `CONFIG.sorteio`.

O número é sorteado no navegador de quem confirma, então dois convidados podem
tirar o mesmo. Na hora do sorteio, use a coluna *Número da sorte* da planilha
como fonte da verdade — detalhes em `SHEETS_SETUP.md`.

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

Escrito do zero, sem herdar nada de outro convite. A linguagem é branco e ar,
formas orgânicas desfocadas ao fundo, cards flutuantes de canto muito
arredondado, e azul↔rosa apenas nos acentos.

- Display: **Fraunces**. Texto: **Outfit**. Manuscrito: **Caveat**.
- Todas as cores e raios são variáveis CSS no `:root`.
- Respeita `prefers-reduced-motion`: desliga blobs, balões e entradas.

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
