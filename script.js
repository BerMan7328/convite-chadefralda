/* ══════════════════════════════════════════════════════════════
   FALTA POUCO — chá de fralda · script
══════════════════════════════════════════════════════════════ */

/* ┌──────────────────────────────────────────────────────────┐
   │  CONFIG — MEXA SÓ AQUI.                                   │
   │  O site inteiro (textos, contagem regressiva, .ics, Maps, │
   │  Waze, Calendar, WhatsApp) é gerado a partir deste bloco. │
   └──────────────────────────────────────────────────────────┘ */
const CONFIG = {
  // ── Quem ──────────────────────────────────────────────────
  casal:      'Rodrigo & Clara',
  assinatura: 'Rodrigo, Clara & Maitê',

  // ── A REVELAÇÃO ───────────────────────────────────────────
  // ⚠️ SPOILER. A animação só roda depois que a pessoa envia o
  // formulário com o voto. Antes disso, nada no site entrega.
  revelacao: {
    ativa: true,
    sexo:  'Menina',              // 'Menina' | 'Menino'
    nomeMenina: 'Anna Laura',     // o nome que é
    nomeMenino: 'Jorge Rodrigo',  // o nome que teria sido — usado nas fintas
    fintas: 3,                    // quantas quase-decisões antes de cravar
  },

  // ── Quando ────────────────────────────────────────────────
  dataInicio: { ano: 2026, mes: 10, dia: 10, hora: 17, minuto: 0 },
  dataFim:    { ano: 2026, mes: 10, dia: 10, hora: 23, minuto: 0 },
  rsvpPrazo:  '03/10/2026',

  // ── Onde ──  ⚠️ PENDENTE: preencher antes de divulgar ──────
  local:    'A definir',
  endereco: 'Endereço a confirmar',
  mapsUrl:  '',                   // link curto do Google Maps

  // ── Links ─────────────────────────────────────────────────
  whatsappGrupo:  'https://chat.whatsapp.com/JQxmM7Y5TO29ZbTUDhOxM0?s=cl&p=i&ilr=4&amv=0',
  qrGrupo:        'assets/qr-grupo.png',  // some sozinho se o arquivo não existir
  whatsappNumero: '5531982985951',   // 55 + DDD + número, só dígitos

  // ── Rifa solidária ────────────────────────────────────────
  sorteio: {
    ativo:  true,
    premio: "Kit Jack Daniel's (garrafa + copo)",
    total:  100,        // números na cartela
    valor:  20,         // R$ por número

    // ⚠️ PENDENTE — dados do PIX. Os três primeiros são obrigatórios
    // para gerar o "copia e cola"; sem eles só a chave é exibida.
    pix: {
      // Escreva a chave do jeito que ela está cadastrada no banco.
      // O tipo é detectado sozinho e o formato do BR Code é ajustado:
      //   celular  '31983790303'          -> +5531983790303
      //   CPF      '12345678909'          -> 12345678909
      //   CNPJ     '12345678000199'       -> 12345678000199
      //   e-mail   'nome@email.com'       -> como está
      //   aleatória (UUID)                -> como está
      chave:  '31983790302',
      nome:   'Rodrigo Lino Malta',   // como está no banco (máx. 25)
      cidade: 'Belo Horizonte',       // (máx. 15)
    },

    // números já ocupados na mão. O site também lê os da planilha.
    ocupados: [],
  },

  // ── Galeria do último slide ───────────────────────────────
  // Aceita 'foto', 'gif' e 'video'. Arquivos em assets/galeria/.
  galeria: [
    { tipo: 'foto', src: 'assets/galeria/01-os-dois.jpeg',
      titulo: 'Os dois',
      comentario: 'Antes de virar história de bebê, era só história de amor.' },

    { tipo: 'foto', src: 'assets/galeria/02-na-rua.jpeg',
      titulo: 'Sem pose',
      comentario: 'A cara de quem não sabe posar pra foto — e nem quer aprender.' },

    { tipo: 'foto', src: 'assets/galeria/03-preguica.jpeg',
      titulo: 'Domingo',
      comentario: 'Existe felicidade em não ter nada pra fazer.' },

    { tipo: 'video', src: 'assets/galeria/04-festa.mp4',
      poster: 'assets/galeria/04-festa-capa.jpg',
      titulo: 'Arrumadinhos',
      comentario: 'Quando a gente resolve caprichar, o resultado é esse.' },

    { tipo: 'video', src: 'assets/galeria/05-festa-mesa.mp4',
      poster: 'assets/galeria/05-festa-mesa-capa.jpg',
      titulo: 'Na festa',
      comentario: 'Dançar não é o forte, mas a gente compensa na animação.' },

    { tipo: 'video', src: 'assets/galeria/06-espelho.mp4',
      poster: 'assets/galeria/06-espelho-capa.jpg',
      titulo: 'De terno',
      comentario: 'O papai ensaiando a pose de foto de maternidade.' },

    { tipo: 'foto', src: 'assets/galeria/07-maite.jpeg',
      titulo: 'A irmã mais velha',
      comentario: 'A Maitê dormindo no colo — o lugar preferido dela no mundo.' },

    { tipo: 'video', src: 'assets/galeria/08-ultrassom.mp4',
      poster: 'assets/galeria/08-ultrassom-capa.jpg',
      titulo: 'O primeiro retrato',
      comentario: 'A primeira vez que a gente viu esse rostinho na tela. Difícil descrever.' },

    { tipo: 'video', src: 'assets/galeria/09-laudo.mp4',
      poster: 'assets/galeria/09-laudo-capa.jpg',
      titulo: 'O laudo',
      comentario: 'Lido e relido no carro, no mesmo dia, uma porção de vezes.' },

    { tipo: 'video', src: 'assets/galeria/10-barriga.mp4',
      poster: 'assets/galeria/10-barriga-capa.jpg',
      titulo: 'Amor de pai',
      comentario: 'O primeiro beijo, dado antes mesmo de conhecer.' },

    { tipo: 'foto', src: 'assets/galeria/11-familia.jpeg',
      titulo: 'Comemorando',
      comentario: 'Notícia boa é assim: chega em casa e vira flor, cesta e abraço.' },
  ],

  // ── Trilha sonora (opcional) ──────────────────────────────
  // Coloque o arquivo em assets/sons/ e escreva o caminho aqui.
  // Com `arquivo: null`, o controle de som some da tela.
  audio: {
    arquivo: 'assets/sons/trilha.mp3',
    volume:  0.3,           // volume inicial, de 0 a 1
  },

  // ── Backend (Google Apps Script) — ver SHEETS_SETUP.md ─────
  sheetsEndpoint: 'https://script.google.com/macros/s/AKfycbzEgcbhcPaHrqDlv7FfshnRubXRykSE9FyoqIAdPhArxRT02zBmQ2N-1lTvIQj_kyp7/exec',
};

/* ══════════════════════════════════════════════════════════════
   DERIVADOS
══════════════════════════════════════════════════════════════ */
const MESES = ['janeiro','fevereiro','março','abril','maio','junho',
               'julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS = ['domingo','segunda-feira','terça-feira','quarta-feira',
              'quinta-feira','sexta-feira','sábado'];

const pad2 = n => String(n).padStart(2, '0');
const dtEvento = (d = CONFIG.dataInicio) =>
  new Date(d.ano, d.mes - 1, d.dia, d.hora, d.minuto, 0);

const D = CONFIG.dataInicio;
const DERIVADO = {
  dataNumerica: `${pad2(D.dia)}/${pad2(D.mes)}/${D.ano}`,
  dataCurta:    `${D.dia} de ${MESES[D.mes - 1]}`,
  dataLonga:    `${D.dia} de ${MESES[D.mes - 1]} de ${D.ano}`,
  horaExtra:    `${DIAS[dtEvento().getDay()]}, a partir das ${D.hora}h`,
  tituloEvento: `Chá de Fralda — ${CONFIG.casal}`,
};

const icsStamp = d => `${d.ano}${pad2(d.mes)}${pad2(d.dia)}T${pad2(d.hora)}${pad2(d.minuto)}00`;
const localCompleto = () =>
  [CONFIG.local, CONFIG.endereco]
    .filter(v => v && v !== 'A definir' && v !== 'Endereço a confirmar')
    .join(', ');

function buildGcalUrl() {
  return 'https://www.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE',
    text:   DERIVADO.tituloEvento,
    dates:  `${icsStamp(CONFIG.dataInicio)}/${icsStamp(CONFIG.dataFim)}`,
    details: 'Feijoada no capricho, petiscos da roça e chopp gelado.',
    location: localCompleto(),
  });
}

function buildWazeUrl() {
  const alvo = localCompleto();
  return alvo ? `https://waze.com/ul?q=${encodeURIComponent(alvo)}&navigate=yes` : '';
}

function applyConfig() {
  const vn = document.getElementById('valor-numero');
  if (vn) vn.textContent = `R$ ${CONFIG.sorteio.valor}`;

  const fonte = { ...CONFIG, ...DERIVADO };
  document.querySelectorAll('[data-cfg]').forEach(el => {
    const v = fonte[el.dataset.cfg];
    if (v) el.textContent = v;
  });

  const hrefs = {
    mapsUrl:       CONFIG.mapsUrl,
    whatsappGrupo: CONFIG.whatsappGrupo,
    gcalUrl:       buildGcalUrl(),
    wazeUrl:       buildWazeUrl(),
  };
  document.querySelectorAll('[data-cfg-href]').forEach(el => {
    const url = hrefs[el.dataset.cfgHref];
    if (url) {
      el.href = url;
    } else {
      // sem URL configurada: desativa em vez de levar a lugar nenhum
      el.href = '#';
      el.classList.add('desativado');
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', e => {
        e.preventDefault();
        toast('Esse link ainda não foi configurado.');
      });
    }
  });

  const pendentes = [];
  if (!CONFIG.mapsUrl)               pendentes.push('CONFIG.mapsUrl');
  if (!CONFIG.whatsappNumero)        pendentes.push('CONFIG.whatsappNumero');
  if (CONFIG.local === 'A definir')  pendentes.push('CONFIG.local / CONFIG.endereco');
  if (!CONFIG.sheetsEndpoint)        pendentes.push('CONFIG.sheetsEndpoint');
  if (pendentes.length) {
    console.warn('[CONFIG] ainda pendente:\n  - ' + pendentes.join('\n  - '));
  }
}

/* ══════════════════════════════════════════════════════════════
   ESTADO
══════════════════════════════════════════════════════════════ */
const STATE = {
  palpite: null,
  nome: '',
  revelado: false,
  codigoRifa: null,
  rifaReservada: null,
};

const CHAVES = {
  palpite:  'cdf-palpite',
  revelado: 'cdf-revelado',
  grupo:    'cdf-grupo',
  volume:   'cdf-volume',
  mudo:     'cdf-mudo',
  rsvp:     'cdf-rsvp',
};

const ls = {
  get(k)    { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};

/* ══════════════════════════════════════════════════════════════
   NAVEGAÇÃO — scroll-snap + trilho + entrada por seção
══════════════════════════════════════════════════════════════ */
let SLIDES = [];

function initNavegacao() {
  const deck = document.getElementById('deck');
  const rail = document.getElementById('rail');
  SLIDES = Array.from(document.querySelectorAll('.slide'));

  // trilho lateral
  SLIDES.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-item';
    b.setAttribute('aria-label', s.dataset.slide || `Seção ${i + 1}`);
    b.innerHTML = `<span class="rail-nome">${s.dataset.slide || ''}</span>`;
    b.addEventListener('click', () => irPara(i));
    rail.appendChild(b);
  });

  // marca a seção visível e dispara as animações de entrada
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visivel');
      const i = SLIDES.indexOf(e.target);
      document.querySelectorAll('.rail-item').forEach((r, k) =>
        r.classList.toggle('ativo', k === i));
    });
    /* Uma faixa fina no meio da tela, em vez de "50% da área do slide".
       Slides mais altos que a tela nunca alcançam 50% — no celular a rifa
       e o "Confirmar" ficavam abaixo do limite e nunca recebiam .visivel,
       então o conteúdo .reveal continuava em opacity 0 e a seção parecia
       uma página em branco. A faixa funciona em qualquer altura. */
  }, { root: deck, rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  SLIDES.forEach(s => obs.observe(s));

  // botões [data-ir="n"]
  document.querySelectorAll('[data-ir]').forEach(b => {
    b.addEventListener('click', () => irPara(parseInt(b.dataset.ir, 10)));
  });

  // teclado
  document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('hidden')) return;
    if (document.body.classList.contains('travado')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;

    const atual = SLIDES.findIndex(s => s.classList.contains('visivel') &&
      Math.abs(s.getBoundingClientRect().top) < window.innerHeight / 2);
    if (e.key === 'ArrowDown' || e.key === 'PageDown') irPara(atual + 1);
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   irPara(atual - 1);
  });

  // a primeira seção já entra animada
  requestAnimationFrame(() => SLIDES[0] && SLIDES[0].classList.add('visivel'));
}

function irPara(i) {
  const alvo = SLIDES[i];
  if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════════════════════════
   CONTAGEM REGRESSIVA
══════════════════════════════════════════════════════════════ */
function initContador() {
  const box = document.getElementById('contador');
  if (!box) return;
  const alvo = dtEvento().getTime();

  const tick = () => {
    const diff = alvo - Date.now();
    if (diff <= 0) {
      box.innerHTML = '<div class="cd"><b>É hoje!</b></div>';
      clearInterval(iv);
      return;
    }
    const s = Math.floor(diff / 1000);
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = pad2(v);
    };
    set('cd-dias',  Math.floor(s / 86400));
    set('cd-horas', Math.floor((s % 86400) / 3600));
    set('cd-min',   Math.floor((s % 3600) / 60));
    set('cd-seg',   s % 60);
  };

  tick();
  const iv = setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════════════════
   PALPITE
══════════════════════════════════════════════════════════════ */
function initPalpite() {
  const times = document.getElementById('times');
  if (!times) return;

  const salvo = ls.get(CHAVES.palpite);
  if (salvo === 'Menino' || salvo === 'Menina') aplicarPalpite(salvo, false);

  times.querySelectorAll('.time').forEach(t => {
    t.addEventListener('click', () => aplicarPalpite(t.dataset.palpite, true));
  });

  // se marcar direto no formulário, mantém tudo em sincronia
  document.querySelectorAll('input[name="palpite"]').forEach(r => {
    r.addEventListener('change', () => { if (r.checked) aplicarPalpite(r.value, false); });
  });
}

function aplicarPalpite(valor, interativo) {
  STATE.palpite = valor;
  ls.set(CHAVES.palpite, valor);

  document.querySelectorAll('.time').forEach(t =>
    t.classList.toggle('escolhido', t.dataset.palpite === valor));

  const radio = document.querySelector(`input[name="palpite"][value="${valor}"]`);
  if (radio) radio.checked = true;

  const eco = document.getElementById('palpite-eco');
  if (eco) {
    eco.textContent = valor === 'Menino'
      ? 'Anotado: você é do Time Azul 💙'
      : 'Anotado: você é do Time Rosa 💗';
    eco.classList.remove('hidden');
  }

  if (interativo) {
    confete(valor === 'Menino' ? 'azul' : 'rosa', 20);
    // registra o voto sozinho: assim a apuração existe mesmo
    // para quem votou e não chegou a confirmar presença
    enviar({ tipo: 'voto', palpite: valor });
  }
}

/* ══════════════════════════════════════════════════════════════
   FORMULÁRIO
══════════════════════════════════════════════════════════════ */
function mascaraTelefone(bruto) {
  const d = (bruto || '').replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,3)} ${d.slice(3,7)}-${d.slice(7)}`;
}


/* ══════════════════════════════════════════════════════════════
   PIX COPIA E COLA — BR Code (padrão EMV do Banco Central)

   Monta a string que a pessoa cola no app do banco. Cada número da
   rifa vira um identificador próprio (RIFA042), que aparece no
   extrato — é assim que você sabe de quem é cada pagamento.
══════════════════════════════════════════════════════════════ */
function tlv(id, valor) {
  return id + String(valor.length).padStart(2, '0') + valor;
}

/* CRC16-CCITT (polinômio 0x1021, inicial 0xFFFF) — exigido pelo padrão */
function crc16(texto) {
  let crc = 0xFFFF;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/* o padrão só aceita ASCII maiúsculo em nome e cidade */
function limpar(txt, max) {
  return (txt || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase().trim().slice(0, max);
}

/* CPF e celular têm os mesmos 11 dígitos: só os dígitos verificadores
   distinguem. Sem essa checagem, um CPF viraria '+55' + CPF e o banco
   devolveria "chave inválida". */
function cpfValido(c) {
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (const n of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(c[i]) * (n + 1 - i);
    let d = (soma * 10) % 11;
    if (d === 10) d = 0;
    if (d !== Number(c[n])) return false;
  }
  return true;
}

function normalizarChavePix(bruta) {
  const chave = (bruta || '').trim();
  if (!chave) return '';

  if (chave.includes('@')) return chave;                       // e-mail
  if (chave.startsWith('+')) return chave;                     // já formatada
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(chave)) return chave;  // aleatória (UUID)

  const digitos = chave.replace(/\D/g, '');
  if (digitos.length === 14) return digitos;                   // CNPJ
  if (digitos.length === 11) {
    if (cpfValido(digitos)) return digitos;                    // CPF
    return '+55' + digitos;                                    // celular
  }
  if (digitos.length === 13 && digitos.startsWith('55')) return '+' + digitos;

  return chave;
}

function pixCopiaECola() {
  const { nome, cidade } = CONFIG.sorteio.pix;
  const chave = normalizarChavePix(CONFIG.sorteio.pix.chave);
  if (!chave || !nome || !cidade) return '';

  // '***' significa "sem identificador". Um txid personalizado é
  // permitido pela especificação, mas vários bancos recusam o código
  // estático quando ele não é '***' — e um código recusado é pior do
  // que perder a identificação automática no extrato.
  const txid = '***';
  const valorTotal = (MEUS.size || 1) * CONFIG.sorteio.valor;
  const conta = tlv('00', 'br.gov.bcb.pix') + tlv('01', chave);

  let carga =
    tlv('00', '01') +
    tlv('26', conta) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', valorTotal.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', limpar(nome, 25)) +
    tlv('60', limpar(cidade, 15)) +
    tlv('62', tlv('05', txid));

  carga += '6304';
  return carga + crc16(carga);
}

async function copiar(texto, msgOk) {
  try {
    await navigator.clipboard.writeText(texto);
    toast(msgOk);
    return true;
  } catch (err) {
    // navegador sem clipboard API ou página fora de https
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    toast(ok ? msgOk : 'Não consegui copiar. Selecione e copie na mão.');
    return ok;
  }
}

/* ══════════════════════════════════════════════════════════════
   CARTELA — a tela dos 100 números
══════════════════════════════════════════════════════════════ */
/* Números que não estão mais livres: n -> 'reservado' | 'pago' */
const STATUS_NUM = new Map();
/* Os números que ESTA pessoa escolheu agora */
const MEUS = new Set();

function initCartela() {
  const grade = document.getElementById('cartela');
  if (!grade) return;

  if (!CONFIG.sorteio.ativo) {
    const sec = grade.closest('.slide');
    if (sec) sec.remove();
    return;
  }

  (CONFIG.sorteio.ocupados || []).forEach(n => STATUS_NUM.set(Number(n), 'pago'));

  const frag = document.createDocumentFragment();
  for (let n = 1; n <= CONFIG.sorteio.total; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'num';
    b.textContent = pad2(n);
    b.dataset.n = n;
    frag.appendChild(b);
  }
  grade.appendChild(frag);

  grade.addEventListener('click', e => {
    const b = e.target.closest('.num');
    if (b && !b.disabled) alternarNumero(Number(b.dataset.n));
  });

  // Enquanto não soubermos o que já foi levado, ninguém clica. Sem isso
  // alguém escolheria um número de outra pessoa só porque a resposta da
  // planilha ainda não tinha chegado.
  const espera = document.getElementById('cartela-espera');
  if (CONFIG.sheetsEndpoint) {
    grade.classList.add('verificando');
    // o esqueleto brilhando não diz o que está havendo, e a consulta ao
    // Apps Script leva uns 2s (bem mais na primeira do dia). Sem um texto,
    // quem toca nesse intervalo acha que a cartela travou.
    espera?.classList.remove('hidden');
  }

  pintarCartela();

  buscarNumerosOcupados().finally(() => {
    grade.classList.remove('verificando');
    espera?.classList.add('hidden');
    pintarCartela();
  });

  const tel = document.getElementById('rifa-whatsapp');
  if (tel) {
    const aplica = () => {
      const f = mascaraTelefone(tel.value);
      if (f !== tel.value) tel.value = f;
    };
    tel.addEventListener('input', aplica);
    tel.addEventListener('blur', aplica);
  }

  const btnReservar = document.getElementById('rifa-reservar');
  if (btnReservar) btnReservar.addEventListener('click', reservar);

  const btnLimpar = document.getElementById('rifa-limpar');
  if (btnLimpar) btnLimpar.addEventListener('click', () => {
    MEUS.clear();
    pintarCartela();
    atualizarCarrinho();
  });
}

function pintarCartela() {
  const travada = document.getElementById('cartela')?.classList.contains('verificando');
  /* Depois de reservar, a escolha está gravada na planilha e o código da
     reserva já foi entregue: mexer na cartela aqui só criaria divergência
     entre o que a pessoa vê e o que está registrado. */
  const jaReservou = !!STATE.rifaReservada;

  document.querySelectorAll('.num').forEach(b => {
    const n = Number(b.dataset.n);
    const status = STATUS_NUM.get(n);
    const meu = MEUS.has(n);

    b.classList.toggle('meu', meu);
    b.classList.toggle('pago', status === 'pago' && !meu);
    b.classList.toggle('reservado', status === 'reservado' && !meu);
    b.disabled = travada || jaReservou || (!!status && !meu);
    b.title = jaReservou && meu ? 'Reserva confirmada'
            : status === 'pago' ? 'Número já pago'
            : status === 'reservado' ? 'Número reservado, aguardando pagamento'
            : '';
  });
}

function alternarNumero(n) {
  if (STATE.rifaReservada) return;   // reserva fechada, não se mexe mais
  MEUS.has(n) ? MEUS.delete(n) : MEUS.add(n);
  pintarCartela();
  atualizarCarrinho();
}

/* A rifa é opcional, mas quem passa por ela já digitou nome e WhatsApp.
   Reaproveita no formulário de presença — sem sobrescrever nada que a
   pessoa já tenha digitado lá por conta própria. */
function herdarContato(nome, tel) {
  if (nome) STATE.nome = nome;
  const form = document.getElementById('form');
  if (!form) return;
  const campoNome = form.querySelector('input[name="nome"]');
  const campoTel  = form.querySelector('input[name="whatsapp"]');
  if (campoNome && !campoNome.value.trim() && nome) campoNome.value = nome;
  if (campoTel  && !campoTel.value.trim()  && tel)  campoTel.value  = tel;
}

function numerosOrdenados() {
  return [...MEUS].sort((a, b) => a - b);
}

function totalCarrinho() {
  return MEUS.size * CONFIG.sorteio.valor;
}

function atualizarCarrinho() {
  const box = document.getElementById('carrinho');
  if (!box) return;

  if (!MEUS.size) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');

  const nums = numerosOrdenados();
  const chips = document.getElementById('carrinho-nums');
  if (chips) {
    chips.innerHTML = nums
      .map(n => `<button type="button" class="chip-num" data-tira="${n}"
                   aria-label="Tirar o número ${pad2(n)}">${pad2(n)} <i>×</i></button>`)
      .join('');
    chips.querySelectorAll('[data-tira]').forEach(b =>
      b.addEventListener('click', () => alternarNumero(Number(b.dataset.tira))));
  }

  const conta = document.getElementById('carrinho-conta');
  if (conta) {
    conta.innerHTML = `${MEUS.size} ${MEUS.size === 1 ? 'número' : 'números'}
      · contribuição de <b>R$ ${totalCarrinho()}</b>`;
  }

  const btn = document.getElementById('rifa-reservar');
  if (btn) btn.textContent = `Reservar ${MEUS.size} ${MEUS.size === 1 ? 'número' : 'números'}`;
}

/* Código curto que agrupa a reserva e aparece no seu extrato do PIX */
function codigoReserva() {
  if (!STATE.codigoRifa) {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c = '';
    for (let i = 0; i < 4; i++) c += letras[Math.floor(Math.random() * letras.length)];
    STATE.codigoRifa = c;
  }
  return STATE.codigoRifa;
}

async function reservar() {
  const nome = (document.getElementById('rifa-nome')?.value || '').trim();
  const tel  = (document.getElementById('rifa-whatsapp')?.value || '').trim();

  if (!MEUS.size)    { toast('Escolha pelo menos um número.'); return; }
  if (!nome || !tel) { toast('Preencha seu nome e WhatsApp.'); return; }

  const btn = document.getElementById('rifa-reservar');
  const txt = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Reservando...';

  // reconfere: algum número pode ter sido levado enquanto a pessoa escolhia
  await buscarNumerosOcupados();
  const perdidos = numerosOrdenados().filter(n => STATUS_NUM.has(n));
  perdidos.forEach(n => MEUS.delete(n));

  if (perdidos.length) {
    pintarCartela();
    atualizarCarrinho();
    btn.disabled = false;
    btn.textContent = txt;
    toast(`Levaram o ${perdidos.map(pad2).join(', ')}. Confere os que sobraram.`, 4500);
    return;
  }

  const nums = numerosOrdenados();
  const codigo = codigoReserva();

  await enviar({
    tipo: 'rifa',
    nome, whatsapp: tel,
    numeros: nums.join(', '),
    quantidade: nums.length,
    total: totalCarrinho(),
    codigo,
    status: 'reservado',
  });

  nums.forEach(n => STATUS_NUM.set(n, 'reservado'));
  STATE.rifaReservada = { nums, nome, tel, codigo };
  herdarContato(nome, tel);
  pintarCartela();   // a partir daqui a cartela fica fechada

  btn.disabled = false;
  btn.textContent = txt;
  mostrarPagamento();
}

function mostrarPagamento() {
  const { nums, codigo } = STATE.rifaReservada;
  const painel = document.getElementById('rifa-pagamento');
  const form = document.getElementById('rifa-form');
  if (!painel) return;

  if (form) form.classList.add('hidden');
  document.getElementById('carrinho')?.classList.add('hidden');
  painel.classList.remove('hidden');

  const codigoPix = pixCopiaECola();
  const temCopiaCola = !!codigoPix;

  painel.innerHTML = `
    <p class="pag-titulo">Obrigado de coração 💛</p>
    <p class="pag-nums">Seus números: <b>${nums.map(pad2).join(' · ')}</b></p>
    <p class="pag-total">Contribuição: <b>R$ ${nums.length * CONFIG.sorteio.valor}</b></p>

    ${temCopiaCola ? `
      <button type="button" class="btn btn-primario btn-largo" id="pag-copia">
        Copiar o PIX
      </button>
      <p class="pag-dica">É só colar no app do banco — o valor já vai preenchido.</p>
    ` : `
      <p class="pag-dica">Chave PIX</p>
      <button type="button" class="pag-chave" id="pag-chave">${CONFIG.sorteio.pix.chave || 'a definir'}</button>
      <p class="pag-dica">Se o app deixar, escreva <b>RIFA ${codigo}</b> na descrição.</p>
    `}

    <p class="pag-codigo">
      Seu código: <b>${codigo}</b><br>
      <small>Mande junto com o comprovante — é assim que a gente acha
      a sua reserva.</small>
    </p>

    <a class="btn btn-suave btn-largo" id="pag-wpp" href="#" target="_blank" rel="noopener">
      Enviar comprovante no WhatsApp
    </a>
    <p class="pag-nota">
      Seus números já ficam guardados no seu nome. Quando der, é só mandar
      o comprovante — e obrigado mesmo por essa força. 💗
    </p>`;

  const copia = document.getElementById('pag-copia');
  if (copia) copia.addEventListener('click', () =>
    copiar(codigoPix, 'PIX copiado! Cole no app do banco.'));

  const chave = document.getElementById('pag-chave');
  if (chave) chave.addEventListener('click', () =>
    copiar(CONFIG.sorteio.pix.chave, 'Chave PIX copiada!'));

  const wpp = document.getElementById('pag-wpp');
  if (wpp) {
    const msg = [
      `🎟️ *Rifa solidária — código ${codigo}*`, '',
      `*Nome:* ${STATE.rifaReservada.nome}`,
      `*Números:* ${nums.map(pad2).join(', ')}`,
      `*Contribuição:* R$ ${nums.length * CONFIG.sorteio.valor}`,
      '', 'Segue o comprovante 👇',
    ].join('\n');
    const base = CONFIG.whatsappNumero ? `https://wa.me/${CONFIG.whatsappNumero}` : 'https://wa.me/';
    wpp.href = `${base}?text=${encodeURIComponent(msg)}`;
  }

  confete('duo', 40);
  painel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* Lê da planilha os números reservados e pagos */
async function buscarNumerosOcupados() {
  if (!CONFIG.sheetsEndpoint) return;
  try {
    const res = await fetch(`${CONFIG.sheetsEndpoint}?tipo=rifa-ocupados`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { ocupados } = await res.json();
    if (!Array.isArray(ocupados)) return;
    ocupados.forEach(o => {
      const n = Number(o.numero);
      if (!isNaN(n)) STATUS_NUM.set(n, o.status === 'pago' ? 'pago' : 'reservado');
    });
    pintarCartela();
  } catch (err) {
    // a cartela destrava assim mesmo: melhor escolher às cegas do que
    // travar todo mundo porque a planilha não respondeu
    console.info('[rifa] não deu pra ler os números ocupados.', err);
  }
}

function initFormulario() {
  const form = document.getElementById('form');
  if (!form) return;

  const tel = document.getElementById('in-whatsapp');
  if (tel) {
    const aplica = () => {
      const f = mascaraTelefone(tel.value);
      if (f !== tel.value) tel.value = f;
    };
    tel.addEventListener('input', aplica);
    tel.addEventListener('blur', aplica);
  }

  if (ls.get(CHAVES.grupo) === '1') {
    const c = document.getElementById('in-grupo');
    if (c) c.checked = true;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const btn = form.querySelector('button[type="submit"]');
    const txt = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const dados = Object.fromEntries(new FormData(form).entries());
    dados.tipo = 'rsvp';

    const qtd = parseInt(dados.quantos || '1', 10);
    if (isNaN(qtd) || qtd < 1) dados.quantos = '1';
    else if (qtd > 5) { dados.quantos = '5'; toast('Máximo 5 pessoas. Ajustado para 5.'); }

    dados.entrou_no_grupo = dados.grupo ? 'Sim' : 'Não';
    delete dados.grupo;

    STATE.nome = dados.nome || '';
    STATE.palpite = dados.palpite || STATE.palpite;

    salvarLocal(dados);
    const ok = await enviar(dados);

    mostrarConfirmado(dados, ok);
    toast(ok ? 'Presença confirmada!' : 'Confirmação salva neste aparelho.');

    btn.textContent = txt;
    btn.disabled = false;

    if (CONFIG.revelacao.ativa) {
      setTimeout(() => revelar(dados.nome, dados.palpite), 650);
    } else {
      confete('duo', 90);
    }
  });
}

function salvarLocal(dados) {
  try {
    const todos = JSON.parse(ls.get(CHAVES.rsvp) || '[]');
    todos.push({ ...dados, em: new Date().toISOString() });
    ls.set(CHAVES.rsvp, JSON.stringify(todos));
  } catch (e) { /* localStorage indisponível */ }
}

function mostrarConfirmado(dados, ok) {
  document.getElementById('form-area').classList.add('hidden');
  document.getElementById('confirmado').classList.remove('hidden');

  const eco = document.getElementById('eco-palpite');
  if (eco && dados.palpite) {
    const azul = dados.palpite === 'Menino';
    eco.className = 'eco-palpite ' + (azul ? 'azul' : 'rosa');
    eco.innerHTML = `
      <span class="eco-rot">seu palpite</span>
      <span class="eco-val">${azul ? '💙 Menino' : '💗 Menina'}</span>`;
  }

  if (!ok) {
    const falha = document.getElementById('falha');
    const link = document.getElementById('falha-link');
    if (falha && link) {
      const linhas = [
        `🍼 *Confirmação — Chá de Fralda ${CONFIG.casal}*`, '',
        `*Nome:* ${dados.nome || '-'}`,
        `*WhatsApp:* ${dados.whatsapp || '-'}`,
        `*Vai?* ${dados.vai || '-'}`,
        `*Quantas pessoas:* ${dados.quantos || '1'}`,
        `*Palpite:* ${dados.palpite || '-'}`,
        `*Lado:* ${dados.lado || '-'}`,
      ];
      if (dados.recado) linhas.push('', `*Recado:* ${dados.recado}`);
      const base = CONFIG.whatsappNumero ? `https://wa.me/${CONFIG.whatsappNumero}` : 'https://wa.me/';
      link.href = `${base}?text=${encodeURIComponent(linhas.join('\n'))}`;
      falha.classList.remove('hidden');
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   ENVIO PARA A PLANILHA
══════════════════════════════════════════════════════════════ */
async function enviar(dados) {
  if (!CONFIG.sheetsEndpoint) return false;
  try {
    await fetch(CONFIG.sheetsEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...dados, ts: new Date().toISOString() }),
    });
    // no-cors devolve resposta opaca: não dá pra checar status
    return true;
  } catch (err) {
    console.warn('[sheets] falhou', err);
    return false;
  }
}

/* ══════════════════════════════════════════════════════════════
   REVELAÇÃO
══════════════════════════════════════════════════════════════ */
const espera = ms => new Promise(r => setTimeout(r, ms));
const semMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* O envelope é a única pausa da revelação que depende da pessoa: a cena
   só avança quando ela toca. Resolve no toque — ou na hora, se ela
   apertou "pular" com o envelope na tela, senão a animação ficaria
   presa esperando um toque que não vem mais. */
function esperarToqueNoEnvelope(foiPulado, rapido) {
  return new Promise(resolve => {
    const env = document.getElementById('rev-envelope');
    if (!env || foiPulado()) { resolve(); return; }

    let encerrado = false;

    const vigia = setInterval(() => {
      if (encerrado || !foiPulado()) return;
      encerrado = true;
      clearInterval(vigia);
      resolve();
    }, 120);

    env.addEventListener('click', async () => {
      if (encerrado) return;
      encerrado = true;
      clearInterval(vigia);
      env.disabled = true;
      env.classList.add('abrindo');
      // deixa a aba virar e a carta subir antes de trocar de cena
      await espera(rapido ? 380 : 1150);
      resolve();
    });
  });
}

async function revelar(nome, palpite) {
  const R = CONFIG.revelacao;
  const ov = document.getElementById('revelacao');
  const palco = document.getElementById('rev-palco');
  if (!ov || !palco) return;

  const rapido = semMovimento();
  const t = ms => rapido ? Math.min(ms, 380) : ms;

  let pulado = false;
  const btnPular = document.getElementById('rev-pular');
  const aoPular = () => { pulado = true; };
  if (btnPular) {
    btnPular.classList.remove('hidden');
    btnPular.addEventListener('click', aoPular, { once: true });
  }

  ov.classList.remove('hidden');
  requestAnimationFrame(() => ov.classList.add('aberta'));
  document.body.classList.add('travado');
  document.dispatchEvent(new CustomEvent('revelacao:inicio'));

  const menina = R.sexo === 'Menina';
  const cor = menina ? 'rosa' : 'azul';
  const nomeFinal = menina ? R.nomeMenina : R.nomeMenino;
  const acertou = palpite === R.sexo;
  const põe = html => { palco.innerHTML = html; };

  // 1 · abertura
  const primeiro = (nome || '').trim().split(/\s+/)[0] || 'você';
  põe(`<div class="rev-bloco">
         <p class="rev-forte">Obrigado, ${primeiro}!</p>
         <p class="rev-p">Seu palpite foi</p>
         <p class="rev-palpite ${palpite === 'Menino' ? 'azul' : 'rosa'}">${palpite || '—'}</p>
       </div>`);
  if (!pulado) await espera(t(2100));

  // 2 · o envelope — só abre quando a pessoa toca
  if (!pulado) {
    põe(`<div class="rev-bloco">
           <p class="rev-p">Agora só falta uma coisa.</p>
           <button type="button" class="rev-envelope" id="rev-envelope"
                   aria-label="Abrir o envelope">
             <span class="env-corpo">
               <span class="env-carta"></span>
               <span class="env-aba"></span>
               <span class="env-selo">A</span>
             </span>
             <span class="env-dica">toque para abrir</span>
           </button>
         </div>`);

    await esperarToqueNoEnvelope(() => pulado, rapido);
  }

  // 3 · o medidor com as fintas
  if (!pulado) {
    põe(`<div class="rev-bloco">
           <p class="rev-p">É...</p>
           <div class="rev-caixa" id="rev-caixa">
             <span class="rev-caixa-sexo" id="rev-sexo">?</span>
             <span class="rev-caixa-nome" id="rev-nome-tmp">&nbsp;</span>
           </div>
           <p class="rev-dica" id="rev-dica">&nbsp;</p>
         </div>`);

    const caixa = document.getElementById('rev-caixa');
    const sexoEl = document.getElementById('rev-sexo');
    const nomeEl = document.getElementById('rev-nome-tmp');
    const dica = document.getElementById('rev-dica');

    const pinta = azul => {
      sexoEl.textContent = azul ? 'MENINO' : 'MENINA';
      nomeEl.textContent = azul ? R.nomeMenino : R.nomeMenina;
    };
    const piscar = async (n, ms) => {
      for (let i = 0; i < n && !pulado; i++) {
        const azul = i % 2 === 0;
        caixa.className = 'rev-caixa ' + (azul ? 'azul' : 'rosa');
        pinta(azul);
        await espera(ms);
      }
    };

    const falas = ['quase...', 'calma aí...', 'agora é sério...'];
    const fintas = rapido ? 1 : (R.fintas || 3);

    await piscar(12, t(90));
    for (let f = 0; f < fintas && !pulado; f++) {
      // alterna: primeiro para no time errado, depois no certo, e volta a girar
      const fintaAzul = f % 2 === 0 ? menina : !menina;
      caixa.className = 'rev-caixa ' + (fintaAzul ? 'azul' : 'rosa') + ' parada';
      pinta(fintaAzul);
      dica.textContent = '';
      await espera(t(760));
      caixa.classList.add('hesita');
      dica.textContent = falas[f % falas.length];
      await espera(t(700));
      caixa.classList.remove('parada', 'hesita');
      await piscar(8 + f * 4, t(70));
    }
    dica.textContent = '';
  }

  // 4 · estouro
  põe(`<div class="rev-bloco">
         <p class="rev-p">é</p>
         <h2 class="rev-veredito">${menina ? 'MENINA!' : 'MENINO!'}</h2>
       </div>`);
  ov.classList.add('fim-' + cor);
  confete(cor, rapido ? 30 : 150);
  baloes(cor, rapido ? 0 : 16);
  if (!pulado) await espera(t(2500));

  // 5 · o nome
  põe(`<div class="rev-bloco">
         <p class="rev-p">e o nome dela é</p>
         <h2 class="rev-nome" id="rev-nome"></h2>
       </div>`);
  const alvo = document.getElementById('rev-nome');
  if (alvo) {
    if (rapido || pulado) {
      alvo.textContent = nomeFinal;
    } else {
      for (const ch of nomeFinal) { alvo.textContent += ch; await espera(90); }
    }
    alvo.classList.add('pronto');
  }
  confete(cor, rapido ? 20 : 80);
  if (!pulado) await espera(t(2300));

  // 6 · veredito
  põe(`<div class="rev-bloco">
         <h2 class="rev-nome pronto">${nomeFinal}</h2>
         <p class="rev-julga">${acertou
            ? 'E você <strong>acertou</strong> em cheio! 🎉'
            : 'Você chutou no outro time — mas a gente ama você do mesmo jeito. 💗'}</p>
         <p class="rev-fecho">Te esperamos dia <strong>${DERIVADO.dataNumerica}</strong>
            pra celebrar a chegada da <strong>${nomeFinal}</strong>.</p>
         <div class="rev-acoes">
           <button type="button" class="btn btn-primario" id="rev-album">Ver o álbum</button>
           <button type="button" class="btn btn-suave" id="rev-voltar">Voltar ao convite</button>
         </div>
       </div>`);

  if (btnPular) btnPular.classList.add('hidden');
  marcarRevelado();
  enviar({ tipo: 'revelacao-vista', nome: STATE.nome, palpite, acertou: acertou ? 'Sim' : 'Não' });

  const fechar = () => {
    ov.classList.remove('aberta');
    document.body.classList.remove('travado');
    document.dispatchEvent(new CustomEvent('revelacao:fim'));
    setTimeout(() => ov.classList.add('hidden'), 500);
  };
  document.getElementById('rev-voltar').addEventListener('click', fechar);
  document.getElementById('rev-album').addEventListener('click', () => {
    fechar();
    setTimeout(() => irPara(SLIDES.length - 1), 250);
  });
}

function marcarRevelado() {
  STATE.revelado = true;
  ls.set(CHAVES.revelado, '1');
  const trava = document.getElementById('trava');
  const album = document.getElementById('album');
  if (trava) trava.classList.add('hidden');
  if (album) album.classList.remove('hidden');
}

/* ══════════════════════════════════════════════════════════════
   ÁLBUM
══════════════════════════════════════════════════════════════ */
function initAlbum() {
  const mural = document.getElementById('mural');
  if (!mural) return;

  const itens = CONFIG.galeria || [];

  if (!itens.length) {
    mural.innerHTML = `
      <div class="vazio">
        <p class="vazio-titulo">Álbum em construção</p>
        <p>As fotos, os gifs e os vídeos vão aparecer aqui. Volta depois. 💗</p>
      </div>`;
  } else {
    const ROT = [-2.2, 1.7, -1.1, 2.4, -2.8, 1.2];
    mural.innerHTML = itens.map((m, i) => {
      const capa = m.tipo === 'video'
        ? (m.poster
            ? `<img src="${m.poster}" alt="${m.titulo || ''}" loading="lazy">`
            : `<video src="${m.src}" muted playsinline preload="metadata"></video>`)
        : `<img src="${m.src}" alt="${m.titulo || ''}" loading="lazy">`;
      const selo = m.tipo === 'video' ? '▶' : (m.tipo === 'gif' ? 'GIF' : '');

      return `
        <figure class="foto" style="--rot:${ROT[i % ROT.length]}deg; --atraso:${(i % 6) * 0.07}s">
          <button type="button" class="foto-btn" data-i="${i}"
                  aria-label="Abrir ${m.titulo || 'mídia ' + (i + 1)}">
            <span class="foto-janela">
              ${capa}${selo ? `<span class="foto-badge">${selo}</span>` : ''}
            </span>
            ${m.titulo ? `<figcaption class="foto-legenda">${m.titulo}</figcaption>` : ''}
          </button>
          ${m.comentario ? `<p class="foto-comentario">${m.comentario}</p>` : ''}
        </figure>`;
    }).join('');

    mural.addEventListener('click', e => {
      const b = e.target.closest('.foto-btn');
      if (b) abrirMidia(parseInt(b.dataset.i, 10));
    });
  }

  if (ls.get(CHAVES.revelado) === '1') marcarRevelado();
}

function abrirMidia(i) {
  const m = (CONFIG.galeria || [])[i];
  if (!m) return;

  const lb = document.getElementById('lightbox');
  const box = document.getElementById('lightbox-conteudo');

  box.innerHTML = `
    ${m.titulo ? `<h3 class="lb-titulo">${m.titulo}</h3>` : ''}
    ${m.tipo === 'video'
      ? `<video class="lb-midia" src="${m.src}" controls playsinline muted
                ${m.poster ? `poster="${m.poster}"` : ''}></video>`
      : `<img class="lb-midia" src="${m.src}" alt="${m.titulo || ''}">`}
    ${m.comentario ? `<p class="lb-comentario">${m.comentario}</p>` : ''}
    <div class="lb-nav">
      <button type="button" class="btn btn-suave" data-nav="${i - 1}" ${i === 0 ? 'disabled' : ''}>← Anterior</button>
      <span class="lb-contador">${i + 1} / ${CONFIG.galeria.length}</span>
      <button type="button" class="btn btn-suave" data-nav="${i + 1}"
              ${i >= CONFIG.galeria.length - 1 ? 'disabled' : ''}>Próxima →</button>
    </div>`;

  box.querySelectorAll('[data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      if (!b.disabled) abrirMidia(parseInt(b.dataset.nav, 10));
    });
  });

  const video = box.querySelector('video');
  if (video) {
    // começa mudo; se a pessoa ligar o som, a trilha de fundo abaixa
    video.muted = true;
    video.addEventListener('volumechange', () => {
      document.dispatchEvent(new CustomEvent(
        video.muted ? 'revelacao:fim' : 'revelacao:inicio'));
    });
  }

  lb.classList.remove('hidden');
  document.body.classList.add('travado');
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  const fechar = () => {
    lb.classList.add('hidden');
    document.body.classList.remove('travado');
    document.getElementById('lightbox-conteudo').innerHTML = '';
    document.dispatchEvent(new CustomEvent('revelacao:fim'));
  };
  document.getElementById('lightbox-fechar').addEventListener('click', fechar);
  lb.addEventListener('click', e => { if (e.target === lb) fechar(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lb.classList.contains('hidden')) fechar();
  });
}

/* ══════════════════════════════════════════════════════════════
   RECADOS
══════════════════════════════════════════════════════════════ */
function initRecados() {
  const lista = document.getElementById('recados-lista');
  const form = document.getElementById('form-recado');
  if (!lista || !form) return;

  if (!CONFIG.sheetsEndpoint) {
    lista.innerHTML = '<p class="recados-vazio">O mural aparece assim que a planilha estiver conectada.</p>';
  } else {
    carregarRecados();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('rec-nome').value.trim();
    const texto = document.getElementById('rec-texto').value.trim();
    if (!nome || !texto) { toast('Preencha nome e recado.'); return; }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    await enviar({ tipo: 'recado', nome, recado: texto });

    form.reset();
    btn.disabled = false;
    btn.textContent = 'Deixar recado';
    toast('Recado enviado! Obrigado 💗');
    addRecado({ nome, recado: texto }, true);
  });
}

async function carregarRecados() {
  const lista = document.getElementById('recados-lista');
  try {
    const res = await fetch(`${CONFIG.sheetsEndpoint}?tipo=recados`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { recados } = await res.json();
    if (!Array.isArray(recados) || !recados.length) {
      lista.innerHTML = '<p class="recados-vazio">Ninguém deixou recado ainda. Seja o primeiro!</p>';
      return;
    }
    lista.innerHTML = '';
    recados.slice(-40).reverse().forEach(r => addRecado(r, false));
  } catch (err) {
    console.info('[recados] não foi possível carregar.', err);
    lista.innerHTML = '<p class="recados-vazio">Não deu pra carregar os recados agora. O seu ainda será registrado.</p>';
  }
}

function addRecado(r, noTopo) {
  const lista = document.getElementById('recados-lista');
  const vazio = lista.querySelector('.recados-vazio');
  if (vazio) vazio.remove();

  const el = document.createElement('article');
  el.className = 'recado';
  el.innerHTML = '<p class="recado-txt"></p><p class="recado-autor"></p>';
  // textContent: um recado com HTML não pode quebrar nem injetar nada na página
  el.querySelector('.recado-txt').textContent = '“' + (r.recado || '') + '”';
  el.querySelector('.recado-autor').textContent = '— ' + (r.nome || 'anônimo');

  noTopo ? lista.prepend(el) : lista.appendChild(el);
}

/* ══════════════════════════════════════════════════════════════
   GRUPO DO WHATSAPP + QR
══════════════════════════════════════════════════════════════ */
function initGrupo() {
  document.querySelectorAll('[data-cfg-href="whatsappGrupo"]').forEach(el => {
    el.addEventListener('click', () => {
      ls.set(CHAVES.grupo, '1');
      const c = document.getElementById('in-grupo');
      if (c) c.checked = true;
      enviar({ tipo: 'grupo-clique', nome: STATE.nome, origem: el.dataset.origem || 'link' });
    });
  });

  const bloco = document.getElementById('qr-bloco');
  const img = document.getElementById('qr-img');
  if (!bloco || !img) return;
  if (!CONFIG.qrGrupo) { bloco.remove(); return; }
  img.src = CONFIG.qrGrupo;
  img.addEventListener('error', () => bloco.remove());
  img.addEventListener('load', () => bloco.classList.remove('hidden'));
}

/* ══════════════════════════════════════════════════════════════
   .ICS
══════════════════════════════════════════════════════════════ */
function baixarIcs() {
  const local = localCompleto().replace(/,/g, '\\,');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cha de Fralda//PT-BR',
    'BEGIN:VEVENT',
    `DTSTART:${icsStamp(CONFIG.dataInicio)}`,
    `DTEND:${icsStamp(CONFIG.dataFim)}`,
    `SUMMARY:${DERIVADO.tituloEvento}`,
    'DESCRIPTION:Feijoada no capricho, petiscos da roça e chopp gelado.',
    `LOCATION:${local || 'A definir'}`,
    'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cha-de-fralda.ics';
  a.click();
  URL.revokeObjectURL(url);
}


/* ══════════════════════════════════════════════════════════════
   TRILHA SONORA

   Navegador nenhum deixa tocar áudio antes de a pessoa interagir
   com a página, então a trilha só começa no primeiro clique/toque.
══════════════════════════════════════════════════════════════ */
function initAudio() {
  const bloco = document.getElementById('som');
  if (!bloco) return;

  if (!CONFIG.audio || !CONFIG.audio.arquivo) { bloco.remove(); return; }

  const audio = document.getElementById('trilha');
  const botao = document.getElementById('som-botao');
  const faixa = document.getElementById('som-volume');

  audio.src = CONFIG.audio.arquivo;
  audio.loop = true;

  // se o arquivo não existir, o controle some em vez de ficar quebrado
  audio.addEventListener('error', () => bloco.remove());

  const volSalvo = parseFloat(ls.get(CHAVES.volume) ?? '');
  const mudoSalvo = ls.get(CHAVES.mudo) === '1';

  let volume = isNaN(volSalvo) ? CONFIG.audio.volume : volSalvo;
  let mudo = mudoSalvo;

  /* No iOS, audio.volume é somente-leitura: o WebKit aceita a atribuição
     e a ignora, porque a Apple reserva o volume aos botões do aparelho.
     O slider andava e o som não mudava. A saída é passar a trilha por um
     GainNode do Web Audio, cujo ganho o iOS respeita. O AudioContext só
     pode nascer depois de um gesto da pessoa, então isso acontece no
     primeiro toque; até lá, e onde o Web Audio não existir, seguimos no
     audio.volume, que funciona no desktop e no Android. */
  let ganho = null;
  let atenuacao = 1;   // a revelação abaixa a trilha por um tempo

  function aplicarVolume() {
    const v = (mudo ? 0 : volume) * atenuacao;
    if (ganho) ganho.gain.value = v;
    else audio.volume = v;
  }

  function ligarGanho() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (ganho || !Ctx) return;
    try {
      const ctx = new Ctx();
      const fonte = ctx.createMediaElementSource(audio);
      ganho = ctx.createGain();
      fonte.connect(ganho);
      ganho.connect(ctx.destination);
      audio.volume = 1;               // daqui pra frente quem manda é o ganho
      if (ctx.state === 'suspended') ctx.resume();
      aplicarVolume();
    } catch (err) {
      ganho = null;                   // sem Web Audio, continua no audio.volume
    }
  }

  aplicarVolume();
  faixa.value = String(Math.round(volume * 100));
  bloco.classList.remove('hidden');

  function pintar() {
    botao.classList.toggle('mudo', mudo || volume === 0);
    botao.setAttribute('aria-pressed', String(!mudo));
    botao.setAttribute('aria-label', mudo ? 'Ativar som' : 'Desativar som');
    faixa.style.setProperty('--preenchido', (volume * 100) + '%');
  }

  function tocar() {
    if (mudo) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => { /* ainda bloqueado: espera outro toque */ });
  }

  // primeira interação destrava o autoplay
  const destravar = () => { ligarGanho(); tocar(); };
  ['click', 'touchstart', 'keydown'].forEach(ev =>
    document.addEventListener(ev, destravar, { once: true, passive: true }));

  botao.addEventListener('click', e => {
    e.stopPropagation();
    // no toque não existe hover: o clique é que abre o slider
    bloco.classList.add('aberto');
    mudo = !mudo;
    ls.set(CHAVES.mudo, mudo ? '1' : '0');
    if (mudo) {
      audio.pause();
    } else {
      if (volume === 0) { volume = 0.35; faixa.value = '35'; }
      aplicarVolume();
      tocar();
    }
    pintar();
  });

  ['input', 'change'].forEach(ev => faixa.addEventListener(ev, () => {
    volume = Number(faixa.value) / 100;
    ls.set(CHAVES.volume, String(volume));
    if (volume > 0 && mudo) {
      mudo = false;
      ls.set(CHAVES.mudo, '0');
      tocar();
    }
    aplicarVolume();
    pintar();
  }));

  // Abre no hover, mas NÃO fecha enquanto a pessoa está arrastando —
  // senão o ponteiro sai da caixa no meio do gesto, o slider colapsa
  // (width 0 / pointer-events none) e o arraste morre.
  let arrastando = false;
  bloco.addEventListener('mouseenter', () => bloco.classList.add('aberto'));
  bloco.addEventListener('mouseleave', () => {
    if (!arrastando) bloco.classList.remove('aberto');
  });

  faixa.addEventListener('pointerdown', () => { arrastando = true; });
  document.addEventListener('pointerup', () => {
    if (!arrastando) return;
    arrastando = false;
    if (!bloco.matches(':hover')) bloco.classList.remove('aberto');
  });

  // fora do ícone e do slider, fecha
  document.addEventListener('click', e => {
    if (!bloco.contains(e.target)) bloco.classList.remove('aberto');
  });

  // durante a revelação a trilha abaixa, pra não competir com o momento
  document.addEventListener('revelacao:inicio', () => {
    atenuacao = 0.35;
    aplicarVolume();
  });
  document.addEventListener('revelacao:fim', () => {
    atenuacao = 1;
    aplicarVolume();
  });

  pintar();
}

/* ══════════════════════════════════════════════════════════════
   CONFETE, BALÕES, TOAST
══════════════════════════════════════════════════════════════ */
const PALETAS = {
  azul: ['#7fb6f0', '#3f7fc4', '#cfe6fb', '#ffffff'],
  rosa: ['#f79fc0', '#d9628f', '#fdd9e7', '#ffffff'],
  duo:  ['#7fb6f0', '#f79fc0', '#c9b8f0', '#ffffff', '#3f7fc4', '#d9628f'],
};

function confete(tipo = 'duo', qtd = 60) {
  const box = document.getElementById('confete');
  if (!box) return;
  const cores = PALETAS[tipo] || PALETAS.duo;

  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('span');
    p.className = 'papel';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = cores[i % cores.length];
    p.style.setProperty('--dur', (2.2 + Math.random() * 2.2) + 's');
    p.style.setProperty('--atraso', (Math.random() * 0.7) + 's');
    p.style.setProperty('--giro', (Math.random() * 720 - 360) + 'deg');
    p.style.width = (5 + Math.random() * 6) + 'px';
    p.style.height = (8 + Math.random() * 8) + 'px';
    box.appendChild(p);
    setTimeout(() => p.remove(), 5200);
  }
}

function baloes(tipo, qtd) {
  const box = document.getElementById('confete');
  if (!box || !qtd) return;
  const cores = PALETAS[tipo] || PALETAS.duo;

  for (let i = 0; i < qtd; i++) {
    const b = document.createElement('span');
    b.className = 'balao';
    b.style.left = (Math.random() * 92) + '%';
    b.style.background = cores[i % cores.length];
    b.style.width = (34 + Math.random() * 38) + 'px';
    b.style.setProperty('--dur', (3.4 + Math.random() * 2.4) + 's');
    b.style.setProperty('--atraso', (Math.random() * 1.2) + 's');
    box.appendChild(b);
    setTimeout(() => b.remove(), 7200);
  }
}

function toast(msg, ms = 2800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('aberto');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('aberto'), ms);
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initNavegacao();
  initContador();
  initPalpite();
  initCartela();
  initFormulario();
  initAlbum();
  initLightbox();
  initRecados();
  initGrupo();
  initAudio();

  const ics = document.getElementById('btn-ics');
  if (ics) ics.addEventListener('click', baixarIcs);
});
