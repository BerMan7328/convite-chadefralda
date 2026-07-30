/* ══════════════════════════════════════════════════════════════
   E AÍ, QUAL É??? — Chá Revelação · script
   Baseado na engine do convite-aniversario (Grand Line).
══════════════════════════════════════════════════════════════ */

/* ┌──────────────────────────────────────────────────────────┐
   │  CONFIG — MEXA SÓ AQUI.                                   │
   │  Tudo que é informação do evento vive neste bloco.        │
   │  O site inteiro (textos, .ics, Maps, Waze, Calendar,      │
   │  WhatsApp, contagem regressiva) é gerado a partir daqui.  │
   └──────────────────────────────────────────────────────────┘ */
const CONFIG = {
  // ── Quem ──────────────────────────────────────────────────
  casal:      'Rodrigo & Clara',
  assinatura: 'Rodrigo, Clara & Maitê',

  // ── A REVELAÇÃO ───────────────────────────────────────────
  // ⚠️ SPOILER: isto é o segredo do convite.
  // A animação de revelação só roda DEPOIS que a pessoa envia o
  // formulário com o voto dela. Antes disso, nada no site entrega.
  revelacao: {
    ativa: true,
    sexo:  'Menina',              // 'Menina' | 'Menino'
    nomeMenina: 'Anna Laura',     // o nome que É
    nomeMenino: 'Jorge Rodrigo',  // o nome que teria sido — usado nas fintas
    // quantas "quase-decisões" a animação dá antes de cravar
    fintas: 3,
  },

  // ── Quando ────────────────────────────────────────────────
  // Formato: ano, mês (1-12), dia, hora, minuto
  dataInicio: { ano: 2026, mes: 10, dia: 10, hora: 17, minuto: 0 },
  dataFim:    { ano: 2026, mes: 10, dia: 10, hora: 23, minuto: 0 },
  rsvpPrazo:  '03/10/2026',

  // ── Onde ──  ⚠️ PENDENTE: preencher antes de divulgar ──────
  local:    'A definir',
  endereco: 'Endereço a confirmar',
  // Cole aqui o link curto do Google Maps (ex.: https://share.google/xxxx)
  mapsUrl:  '',

  // ── Links ─────────────────────────────────────────────────
  whatsappGrupo:  'https://chat.whatsapp.com/JQxmM7Y5TO29ZbTUDhOxM0?s=cl&p=i&ilr=4&amv=0',
  // Salve o print do QR do grupo como assets/qr-grupo.png.
  // Se o arquivo não existir, o bloco de QR some sozinho e só o botão fica.
  qrGrupo:        'assets/qr-grupo.png',
  whatsappNumero: '',             // só dígitos, ex.: '5531999999999' — usado nos fallbacks e na rifa

  // ── Galeria da última página ──────────────────────────────
  // Aceita 'foto', 'gif' e 'video'. Coloque os arquivos em assets/galeria/
  // e descreva aqui. Enquanto a lista estiver vazia, o capítulo mostra
  // um estado "em breve" em vez de quebrar.
  galeria: [
    // { tipo: 'foto',  src: 'assets/galeria/ultrassom.jpeg', titulo: 'O primeiro retrato',
    //   comentario: 'A primeira vez que a gente viu esse rostinho.' },
    // { tipo: 'gif',   src: 'assets/galeria/maite.gif',      titulo: 'A irmã mais velha',
    //   comentario: 'Reação da Maitê ao descobrir que ia ter companhia.' },
    // { tipo: 'video', src: 'assets/galeria/chute.mp4',      titulo: 'O primeiro chute',
    //   comentario: 'Som ligado. Vale a pena.', poster: 'assets/galeria/chute-capa.jpeg' },
  ],

  // ── Ação entre amigos (rifa) ──────────────────────────────
  rifa: {
    ativa:     true,
    premio:    "Kit Jack Daniel's (garrafa + copo)",
    valor:     20,                // R$ por número
    total:     100,               // quantidade de números
    pixChave:  'chave-pix-a-definir',
    vendidos:  [],                // ex.: [3, 17, 42] — números já pagos
  },

  // ── Áudio (opcional) ──────────────────────────────────────
  // Coloque os arquivos em assets/sons/ e preencha os nomes.
  // Deixe em null para esconder o botão de som.
  audio: {
    jornada:     null,            // ex.: 'assets/sons/trilha.mp3'
    celebracao:  null,            // ex.: 'assets/sons/festa.mp3'
    refraoInicio: 0,
    refraoFim:    0,
  },

  // ── Backend (Google Apps Script) ──────────────────────────
  // Ver SHEETS_SETUP.md. Deixe vazio para rodar só com localStorage.
  sheetsEndpoint: '',
};

/* ── Derivados do CONFIG (não precisa mexer) ───────────────── */
const MESES = ['janeiro','fevereiro','março','abril','maio','junho',
               'julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS_SEMANA = ['domingo','segunda-feira','terça-feira','quarta-feira',
                     'quinta-feira','sexta-feira','sábado'];

function dtEvento(d = CONFIG.dataInicio) {
  return new Date(d.ano, d.mes - 1, d.dia, d.hora, d.minuto, 0);
}
function pad2(n) { return String(n).padStart(2, '0'); }

const D = CONFIG.dataInicio;
const DERIVADO = {
  dataNumerica:   `${pad2(D.dia)}/${pad2(D.mes)}/${D.ano}`,
  dataPontos:     `${pad2(D.dia)} · ${pad2(D.mes)} · ${D.ano}`,
  dataCurta:      `${D.dia} de ${MESES[D.mes - 1]} · ${D.ano}`,
  dataLongaCurta: `${D.dia} de ${MESES[D.mes - 1]} · ${D.ano} · ${DIAS_SEMANA[dtEvento().getDay()]} · ${D.hora}h`,
  horaExtra:      `${DIAS_SEMANA[dtEvento().getDay()]}, a partir das ${D.hora}h`,
  tituloEvento:   `Chá Revelação — ${CONFIG.casal}`,
  rifaValor:      `R$ ${CONFIG.rifa.valor}`,
  rifaTotal:      `${CONFIG.rifa.total} números`,
};

function icsStamp(d) {
  return `${d.ano}${pad2(d.mes)}${pad2(d.dia)}T${pad2(d.hora)}${pad2(d.minuto)}00`;
}

function buildGcalUrl() {
  const params = new URLSearchParams({
    action:  'TEMPLATE',
    text:    DERIVADO.tituloEvento,
    dates:   `${icsStamp(CONFIG.dataInicio)}/${icsStamp(CONFIG.dataFim)}`,
    details: 'Feijoada no capricho, petiscos da roça e chopp gelado. Menino ou menina? Vem descobrir.',
    location: [CONFIG.local, CONFIG.endereco].filter(v => v && v !== 'A definir').join(' — '),
  });
  return `https://www.google.com/calendar/render?${params}`;
}

function buildWazeUrl() {
  const alvo = [CONFIG.local, CONFIG.endereco].filter(v => v && v !== 'A definir').join(', ');
  if (!alvo) return '';
  return `https://waze.com/ul?q=${encodeURIComponent(alvo)}&navigate=yes`;
}

/* Preenche todo [data-cfg] e [data-cfg-href] do HTML a partir do CONFIG */
function applyConfig() {
  const fonte = { ...CONFIG, ...DERIVADO, pixChave: CONFIG.rifa.pixChave };

  document.querySelectorAll('[data-cfg]').forEach(el => {
    const chave = el.dataset.cfg;
    const valor = fonte[chave];
    if (valor !== undefined && valor !== null && valor !== '') el.textContent = valor;
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
      el.classList.remove('link-desativado');
    } else {
      // sem URL configurada: desativa o link em vez de levar a lugar nenhum
      el.href = '#';
      el.classList.add('link-desativado');
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', e => {
        e.preventDefault();
        showToast('Esse link ainda não foi configurado.');
      });
    }
  });

  // avisa no console o que falta preencher
  const pendentes = [];
  if (!CONFIG.mapsUrl) pendentes.push('CONFIG.mapsUrl');
  if (!CONFIG.whatsappGrupo) pendentes.push('CONFIG.whatsappGrupo');
  if (!CONFIG.whatsappNumero) pendentes.push('CONFIG.whatsappNumero');
  if (CONFIG.local === 'A definir') pendentes.push('CONFIG.local / CONFIG.endereco');
  if (!CONFIG.sheetsEndpoint) pendentes.push('CONFIG.sheetsEndpoint');
  if (CONFIG.rifa.pixChave === 'chave-pix-a-definir') pendentes.push('CONFIG.rifa.pixChave');
  if (pendentes.length) {
    console.warn('[CONFIG] ainda pendente de preencher:\n  - ' + pendentes.join('\n  - '));
  }
}

/* ════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════ */
const STATE = {
  current: 1,
  total: 16,
  visited: new Set([1]),
  skippedStory: false,
  palpite: null,           // 'Menino' | 'Menina'
  quizScore: null,
  quizTags: '',
  quizSuggestionSkipped: false,
  soundOn: false,
  audioMode: 'journey',
  rifaNumero: null,
};

/* ════════════════════════════════════════════════════════════
   TRILHA — posições dos capítulos no SVG (viewBox 1000x1400)
════════════════════════════════════════════════════════════ */
const WORLD_ISLANDS = [
  { i: 1,  x: 200, y: 120,  label: 'Era uma vez, dois' },
  { i: 2,  x: 460, y: 175,  label: 'A pequena Maitê' },
  { i: 3,  x: 710, y: 285,  label: 'O pai do coração' },
  { i: 4,  x: 730, y: 465,  label: 'A Notícia' },
  { i: 5,  x: 490, y: 545,  label: 'Do susto à certeza' },
  { i: 6,  x: 245, y: 640,  label: 'A Bênção' },
  { i: 7,  x: 320, y: 815,  label: 'Irmã mais velha' },
  { i: 8,  x: 580, y: 800,  label: 'Envelope Lacrado' },
  { i: 9,  x: 790, y: 880,  label: 'Time Azul' },
  { i: 10, x: 755, y: 1015, label: 'Time Rosa' },
  { i: 11, x: 520, y: 1065, label: 'O Grande Palpite' },
  { i: 12, x: 300, y: 1085, label: 'A Festa' },
  { i: 13, x: 285, y: 1235, label: 'O Enxoval' },
  { i: 14, x: 520, y: 1300, label: 'Ação entre Amigos' },
  { i: 15, x: 760, y: 1245, label: 'Confirmar' },
  { i: 16, x: 870, y: 1105, label: 'O Álbum' },
];

/* Qual "time" pinta cada marcador da trilha */
const TRILHA_TONE = {
  2: 'rosa', 7: 'rosa', 10: 'rosa',
  9: 'azul', 14: 'azul',
  16: 'rosa',
};

/* ════════════════════════════════════════════════════════════
   MODAIS DE APOIO — "por que menino / por que menina"
════════════════════════════════════════════════════════════ */
const CONFIRA = {
  9: {
    title: 'Time Azul — os argumentos',
    tone: 'azul',
    itens: [
      'Barriga mais baixa e pontuda, dizem as tias.',
      'Desejo por salgado o tempo todo — feijoada e petisco explicam muita coisa.',
      'A casa já tem uma princesa. Agora precisa de um parceiro de bagunça pra ela.',
      'O Rodrigo já andou olhando chuteira tamanho 16.',
    ],
    fecho: 'Se você é do Azul, guarda o palpite: ele vale chopp no dia.',
  },
  10: {
    title: 'Time Rosa — os argumentos',
    tone: 'rosa',
    itens: [
      'Barriga mais alta e arredondada — o outro lado da mesma sabedoria das tias.',
      'Vontade de doce a qualquer hora do dia.',
      'A Maitê pediu uma irmã. E o que a Maitê pede, a Maitê costuma conseguir.',
      'Dupla de irmãs é o tipo de caos que compensa.',
    ],
    fecho: 'Se você é do Rosa, guarda o palpite: ele vale chopp no dia.',
  },
};

/* ════════════════════════════════════════════════════════════
   INTRO
════════════════════════════════════════════════════════════ */
function initIntro() {
  const titleEl = document.getElementById('intro-title-text');
  const fullTitle = 'E aí, qual é???';

  titleEl.textContent = '';
  let i = 0;
  const iv = setInterval(() => {
    if (i < fullTitle.length) {
      titleEl.textContent += fullTitle[i++];
    } else {
      clearInterval(iv);
      titleEl.classList.add('title-done');
    }
  }, 85);

  initGlitter('intro-glitter',      ['#ff8fb8', '#ffd6e4', '#ffffff', '#f0c987']);
  initGlitter('intro-glitter-azul', ['#7fc4f2', '#cfe8fb', '#ffffff', '#f0c987']);

  document.getElementById('zarpar-btn').addEventListener('click', () => {
    setSoundOn(true);
    const intro = document.getElementById('intro-screen');
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.classList.add('hidden');
      showWelcome();
    }, 800);
  });
}

function initGlitter(containerId, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'glitter-particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--gd', (2.5 + Math.random() * 3) + 's');
    p.style.setProperty('--gdelay', (Math.random() * 5) + 's');
    p.style.width = p.style.height = (3 + Math.random() * 5) + 'px';
    container.appendChild(p);
  }
}

/* ════════════════════════════════════════════════════════════
   CONTAGEM REGRESSIVA
════════════════════════════════════════════════════════════ */
function initCountdown() {
  const alvo = dtEvento().getTime();
  const el = document.getElementById('countdown');
  if (!el) return;

  function tick() {
    const diff = alvo - Date.now();
    if (diff <= 0) {
      el.innerHTML = '<div class="countdown-label countdown-hoje">É hoje! 🎉</div>';
      clearInterval(iv);
      return;
    }
    const seg  = Math.floor(diff / 1000);
    const dias = Math.floor(seg / 86400);
    const hrs  = Math.floor((seg % 86400) / 3600);
    const min  = Math.floor((seg % 3600) / 60);
    const s    = seg % 60;
    const set = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = pad2(v);
    };
    set('cd-dias', dias); set('cd-horas', hrs); set('cd-min', min); set('cd-seg', s);
  }

  tick();
  const iv = setInterval(tick, 1000);
}

/* ════════════════════════════════════════════════════════════
   WELCOME
════════════════════════════════════════════════════════════ */
function showWelcome() {
  const w = document.getElementById('welcome-screen');
  w.classList.remove('hidden');

  document.getElementById('welcome-embark').addEventListener('click', () => {
    w.classList.add('fade-out');
    setTimeout(() => { w.classList.add('hidden'); enterMap(); }, 600);
  }, { once: true });

  const skipBtn = document.getElementById('welcome-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      STATE.skippedStory = true;
      w.classList.add('fade-out');
      setTimeout(() => { w.classList.add('hidden'); enterMap(STATE.total); }, 600);
    }, { once: true });
  }
}

function enterMap(targetIsland = 1) {
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('map-wrapper').classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => navigateTo(targetIsland, false));
  });
  setTimeout(showQuizNudge, 1200);
}

function showQuizNudge() {
  if (STATE.quizScore !== null) return;
  if (STATE.quizNudgeDismissedThisSession) return;
  const nudge = document.getElementById('quiz-nudge');
  const btn = document.getElementById('open-quiz');
  if (!nudge || !btn) return;
  nudge.classList.remove('hidden');
  positionQuizNudge();
  window.addEventListener('resize', positionQuizNudge);
  clearTimeout(STATE._nudgeTimeout);
  STATE._nudgeTimeout = setTimeout(hideQuizNudge, 12000);
}

function positionQuizNudge() {
  const nudge = document.getElementById('quiz-nudge');
  const btn = document.getElementById('open-quiz');
  const arrow = nudge && nudge.querySelector('.quiz-nudge-arrow');
  if (!nudge || !btn || !arrow) return;
  const btnRect = btn.getBoundingClientRect();
  const arrowStyle = getComputedStyle(arrow);
  const arrowW = arrow.offsetWidth || parseFloat(arrowStyle.width) || 26;
  const arrowMR = parseFloat(arrowStyle.marginRight) || 0;
  const arrowCenterFromContainerRight = arrowMR + arrowW / 2;
  const quizCenterX = btnRect.left + btnRect.width / 2;
  const rightPx = window.innerWidth - quizCenterX - arrowCenterFromContainerRight;
  nudge.style.right = Math.max(8, rightPx) + 'px';
}

function hideQuizNudge(permanent = false) {
  const nudge = document.getElementById('quiz-nudge');
  if (!nudge || nudge.classList.contains('hidden')) return;
  nudge.classList.add('fade-out');
  window.removeEventListener('resize', positionQuizNudge);
  setTimeout(() => {
    nudge.classList.add('hidden');
    nudge.classList.remove('fade-out');
  }, 400);
  if (permanent) {
    STATE.quizNudgeDismissedThisSession = true;
    const btn = document.getElementById('open-quiz');
    if (btn) btn.classList.add('calmed');
  }
}

/* ════════════════════════════════════════════════════════════
   NAVEGAÇÃO
════════════════════════════════════════════════════════════ */
function getIslands() {
  return Array.from(document.querySelectorAll('.island[data-index]'));
}

function navigateTo(index, smooth = true) {
  const islands = getIslands();
  if (index < 1 || index > islands.length) return;
  STATE.current = index;
  STATE.visited.add(index);

  const target = islands[index - 1];
  const map = document.getElementById('map');
  const offset = target.offsetLeft;

  map.style.transition = smooth
    ? 'transform 0.75s var(--easing-page, cubic-bezier(0.22, 0.61, 0.36, 1))'
    : 'none';
  map.style.transform = `translateX(-${offset}px)`;

  document.getElementById('current-island-name').textContent =
    target.dataset.name || `Capítulo ${index}`;
  document.getElementById('hud-current').textContent = index;
  document.getElementById('hud-total').textContent = islands.length;

  updateProgressDots(index);

  document.getElementById('nav-left').disabled = index <= 1;
  document.getElementById('nav-right').disabled = index >= islands.length;

  const innerPage = target.querySelector('.island-page');
  if (innerPage) innerPage.scrollTop = 0;

  updateWorldMapMarkers();
}

/* ════════════════════════════════════════════════════════════
   PALPITE — a votação do capítulo XI
════════════════════════════════════════════════════════════ */
const PALPITE_KEY = 'cha-revelacao-palpite';

function initPalpite() {
  const arena = document.getElementById('palpite-arena');
  if (!arena) return;

  // restaura palpite salvo
  try {
    const salvo = localStorage.getItem(PALPITE_KEY);
    if (salvo === 'Menino' || salvo === 'Menina') aplicarPalpite(salvo, false);
  } catch (e) { /* localStorage indisponível */ }

  arena.querySelectorAll('.palpite-card').forEach(card => {
    card.addEventListener('click', () => aplicarPalpite(card.dataset.palpite, true));
  });
}

function aplicarPalpite(valor, comFeedback) {
  STATE.palpite = valor;
  try { localStorage.setItem(PALPITE_KEY, valor); } catch (e) {}

  document.querySelectorAll('.palpite-card').forEach(c => {
    c.classList.toggle('is-selected', c.dataset.palpite === valor);
  });

  // espelha no formulário de RSVP
  const radio = document.querySelector(`input[name="palpite"][value="${valor}"]`);
  if (radio) radio.checked = true;

  const fb = document.getElementById('palpite-feedback');
  const fbText = document.getElementById('palpite-feedback-text');
  if (fb && fbText) {
    fbText.innerHTML = valor === 'Menino'
      ? 'Palpite registrado: <strong class="txt-azul">Time Azul</strong>. Anotado! 💙'
      : 'Palpite registrado: <strong class="txt-rosa">Time Rosa</strong>. Anotado! 💗';
    fb.classList.remove('hidden');
  }

  if (comFeedback) {
    showToast(valor === 'Menino' ? 'Time Azul! Palpite guardado 💙' : 'Time Rosa! Palpite guardado 💗');
    soltarConfete(valor === 'Menino' ? 'azul' : 'rosa', 18);
    // registra o voto por si só: assim a apuração existe mesmo para
    // quem votou e não chegou a preencher a confirmação de presença
    registrarEvento('voto', { palpite: valor });
  }
}

/* ════════════════════════════════════════════════════════════
   AÇÃO ENTRE AMIGOS (rifa)
════════════════════════════════════════════════════════════ */
function initRifa() {
  const grade = document.getElementById('rifa-grade');
  if (!grade) return;

  if (!CONFIG.rifa.ativa) {
    const ilha = document.querySelector('.island[data-index="14"]');
    if (ilha) ilha.remove();
    return;
  }

  const vendidos = new Set(CONFIG.rifa.vendidos.map(Number));

  for (let n = 1; n <= CONFIG.rifa.total; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rifa-num';
    b.textContent = pad2(n);
    b.dataset.num = n;
    if (vendidos.has(n)) {
      b.classList.add('is-vendido');
      b.disabled = true;
      b.title = 'Número já reservado';
    }
    grade.appendChild(b);
  }

  grade.addEventListener('click', e => {
    const b = e.target.closest('.rifa-num');
    if (!b || b.disabled) return;
    selecionarNumeroRifa(parseInt(b.dataset.num, 10));
  });

  // copiar chave PIX
  const pixBtn = document.getElementById('rifa-pix-key');
  if (pixBtn) {
    pixBtn.addEventListener('click', async () => {
      const chave = CONFIG.rifa.pixChave;
      try {
        await navigator.clipboard.writeText(chave);
        showToast('Chave PIX copiada!');
      } catch (err) {
        // fallback pra navegador sem clipboard API / http
        const ta = document.createElement('textarea');
        ta.value = chave;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Chave PIX copiada!'); }
        catch (e2) { showToast('Copie manualmente: ' + chave); }
        document.body.removeChild(ta);
      }
    });
  }

  buscarNumerosVendidos();
}

function selecionarNumeroRifa(n) {
  STATE.rifaNumero = n;

  document.querySelectorAll('.rifa-num').forEach(b => {
    b.classList.toggle('is-selecionado', parseInt(b.dataset.num, 10) === n);
  });

  const box = document.getElementById('rifa-selecao');
  const numEl = document.getElementById('rifa-selecao-num');
  if (numEl) numEl.textContent = pad2(n);
  if (box) box.classList.remove('hidden');

  const link = document.getElementById('rifa-whatsapp');
  if (link) {
    const msg = [
      `Oi! Quero reservar o número *${pad2(n)}* da ação entre amigos do chá revelação.`,
      ``,
      `Prêmio: ${CONFIG.rifa.premio}`,
      `Valor: R$ ${CONFIG.rifa.valor}`,
      `Vou fazer o PIX pra chave: ${CONFIG.rifa.pixChave}`,
    ].join('\n');

    if (CONFIG.whatsappNumero) {
      link.href = `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(msg)}`;
      link.classList.remove('link-desativado');
    } else {
      // sem número configurado: manda pro seletor de contato do WhatsApp
      link.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }
  }

  registrarReservaRifa(n);

  if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* Avisa a planilha que alguém demonstrou interesse no número.
   Não bloqueia nada: o número só é marcado como vendido depois do PIX. */
function registrarReservaRifa(n) {
  if (!CONFIG.sheetsEndpoint) return;
  sendToSheets({ tipo: 'rifa-interesse', numero: n, premio: CONFIG.rifa.premio });
}

/* Tenta ler os números já vendidos da planilha; se falhar, usa CONFIG.rifa.vendidos */
async function buscarNumerosVendidos() {
  if (!CONFIG.sheetsEndpoint) return;
  try {
    const res = await fetch(`${CONFIG.sheetsEndpoint}?tipo=rifa-vendidos`, { method: 'GET' });
    if (!res.ok) return;
    const dados = await res.json();
    if (!Array.isArray(dados.vendidos)) return;
    dados.vendidos.map(Number).forEach(n => {
      const b = document.querySelector(`.rifa-num[data-num="${n}"]`);
      if (b) {
        b.classList.add('is-vendido');
        b.classList.remove('is-selecionado');
        b.disabled = true;
        b.title = 'Número já reservado';
      }
    });
  } catch (err) {
    console.info('[rifa] não foi possível ler os vendidos da planilha; usando a lista local.', err);
  }
}

/* ════════════════════════════════════════════════════════════
   QUIZ DO PALPITEIRO
════════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: 'Qual é a data do chá revelação?',
    options: ['10/10/2026', '01/10/2026', '10/11/2026', '20/10/2026'],
    correct: 0,
    explanation: 'Dia 10/10/2026, sábado. Fácil de decorar: dez, dez.',
  },
  {
    q: 'A partir de que horas começa?',
    options: ['12h', '15h', '17h', '19h'],
    correct: 2,
    explanation: 'A partir das 17h. Chegue com fome.',
  },
  {
    q: 'Qual é o prato principal?',
    options: ['Churrasco', 'Feijoada no capricho', 'Macarronada', 'Estrogonofe'],
    correct: 1,
    explanation: 'Feijoada no capricho, com petiscos da roça de apoio.',
  },
  {
    q: 'O que vai estar gelado esperando você?',
    options: ['Chopp', 'Vinho', 'Caipirinha', 'Suco'],
    correct: 0,
    explanation: 'Chopp gelado. Sem discussão.',
  },
  {
    q: 'Como se chama a filha mais velha da Clara?',
    options: ['Manuela', 'Maitê', 'Marina', 'Melissa'],
    correct: 1,
    explanation: 'Maitê — que agora foi promovida a irmã mais velha.',
  },
  {
    q: 'Quantos aninhos a Maitê tinha quando essa história começou?',
    options: ['1 ano', '2 anos', '3 anos', '6 meses'],
    correct: 0,
    explanation: 'Tinha 1 aninho quando o Rodrigo entrou na história.',
  },
  {
    q: 'Qual presente é PRIORIDADE pros pais?',
    options: ['Brinquedos', 'Fraldas P e M', 'Roupinhas de 1 ano', 'Berço'],
    correct: 1,
    explanation: 'Fraldas tamanho P e M, kits de perfumaria bebê e lenços umedecidos.',
  },
  {
    q: 'Roupinhas, se você for dar, devem ser de que tamanho?',
    options: ['Até 6 meses', 'Até 1 ano', 'Até 2 anos', 'Qualquer um'],
    correct: 0,
    explanation: 'Até 6 meses — e de preferência em tom neutro, porque ninguém sabe ainda.',
  },
  {
    q: 'Qual é o prêmio da ação entre amigos?',
    options: ['Uma cesta de café', 'Kit Jack Daniel\'s', 'Vale-compras', 'Um jantar'],
    correct: 1,
    explanation: "Kit Jack Daniel's: garrafa + copo. Sorteio ao vivo no dia.",
  },
  {
    q: 'Quem já sabe se é menino ou menina?',
    options: ['Os pais', 'Só a Maitê', 'Ninguém dos presentes — está lacrado', 'O grupo do WhatsApp'],
    correct: 2,
    explanation: 'Está tudo lacrado num envelope. Nem os pais abriram. A revelação é ao vivo.',
  },
];

let quizState = null;

function openQuizModal() {
  quizState = { index: 0, score: 0, hits: [] };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizState.index >= QUIZ.length) return finishQuiz();
  const q = QUIZ[quizState.index];
  const opts = q.options.map((opt, i) =>
    `<button type="button" class="quiz-option" data-quiz-i="${i}">${opt}</button>`
  ).join('');
  openModal(`
    <h3>Quiz do Palpiteiro</h3>
    <div class="quiz-progress">Pergunta ${quizState.index + 1} de ${QUIZ.length} · ${quizState.score} acertos</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">${opts}</div>
  `);
}

function answerQuiz(i) {
  const q = QUIZ[quizState.index];
  const correct = i === q.correct;
  if (correct) {
    quizState.score++;
    quizState.hits.push(quizState.index + 1);
  }

  document.querySelectorAll('.quiz-option').forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.correct) btn.classList.add('correct');
    else if (idx === i) btn.classList.add('wrong');
  });

  const body = document.getElementById('modal-body');
  const exp = document.createElement('div');
  exp.className = 'quiz-explanation ' + (correct ? 'is-correct' : 'is-wrong');
  exp.innerHTML = `
    <span class="quiz-exp-icon">${correct ? '✓' : '✗'}</span>
    <span class="quiz-exp-text">${q.explanation}</span>
    <button type="button" class="quiz-next">${quizState.index === QUIZ.length - 1 ? 'Ver resultado' : 'Próxima'} →</button>`;
  body.appendChild(exp);
}

function finishQuiz() {
  const score = quizState.score;
  const pct = Math.round((score / QUIZ.length) * 100);

  // inteiro (0–10), nunca "9/10" — o Sheets interpretaria como data
  STATE.quizScore = score;
  STATE.quizTags  = quizState.hits.join(',');

  let title, msg;
  if (pct === 100)    { title = 'Palpiteiro profissional!'; msg = 'Você leu o convite inteiro. Merece o primeiro prato de feijoada.'; }
  else if (pct >= 80) { title = 'Quase perfeito!'; msg = 'Você tá afiado. Só faltou um detalhezinho.'; }
  else if (pct >= 60) { title = 'Nada mal!'; msg = 'Você pegou o essencial. Data, hora e feijoada é o que importa.'; }
  else if (pct >= 40) { title = 'Passou raspando'; msg = 'Dá uma relida na história antes do dia 10, vai por mim.'; }
  else                { title = 'Você veio pela feijoada'; msg = 'Sem julgamento nenhum. A feijoada realmente é o ponto alto.'; }

  openModal(`
    <h3>${title}</h3>
    <div class="quiz-result">
      <div class="quiz-score">${score}<span>/${QUIZ.length}</span></div>
      <div class="quiz-pct">${pct}%</div>
    </div>
    <p class="quiz-result-msg">${msg}</p>
    <button type="button" class="link-btn quiz-retry" id="quiz-retry">Tentar de novo</button>
  `);
}

function showQuizSuggestion() {
  openModal(`
    <h3>Antes de confirmar...</h3>
    <p class="quiz-suggest-intro">
      Que tal testar se você <strong>prestou atenção no convite</strong>?<br>
      São <strong>10 perguntas rápidas</strong>.
    </p>
    <p class="quiz-suggest-hint">o seu resultado vai junto com a sua confirmação</p>
    <div class="quiz-suggest-actions">
      <button type="button" class="quiz-suggest-go-btn" id="quiz-suggest-go">Fazer o quiz primeiro</button>
      <button type="button" class="quiz-suggest-skip" id="quiz-suggest-skip">Não, enviar minha confirmação</button>
    </div>
  `);
  document.getElementById('quiz-suggest-go').addEventListener('click', () => {
    closeModal();
    setTimeout(openQuizModal, 250);
  });
  document.getElementById('quiz-suggest-skip').addEventListener('click', () => {
    STATE.quizSuggestionSkipped = true;
    closeModal();
    const form = document.getElementById('rsvp-form');
    if (form) form.requestSubmit();
  });
}

function initQuiz() {
  const btn = document.getElementById('open-quiz');
  if (btn) btn.addEventListener('click', () => {
    hideQuizNudge(true);
    openQuizModal();
  });

  const closeBtn = document.getElementById('quiz-nudge-close');
  if (closeBtn) closeBtn.addEventListener('click', () => hideQuizNudge(true));

  const body = document.getElementById('modal-body');
  if (!body) return;
  body.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-option');
    if (opt && !opt.disabled && quizState) {
      e.stopPropagation();
      answerQuiz(parseInt(opt.dataset.quizI));
      return;
    }
    const next = e.target.closest('.quiz-next');
    if (next && quizState) {
      e.stopPropagation();
      quizState.index++;
      renderQuizQuestion();
      return;
    }
    const retry = e.target.closest('#quiz-retry');
    if (retry) {
      e.stopPropagation();
      openQuizModal();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   TRILHA — visão geral
════════════════════════════════════════════════════════════ */
function initWorldMap() {
  const container = document.getElementById('world-islands');
  if (!container) return;

  const routePath = document.getElementById('route-path');
  if (routePath) {
    let d = `M ${WORLD_ISLANDS[0].x} ${WORLD_ISLANDS[0].y}`;
    for (let i = 1; i < WORLD_ISLANDS.length; i++) {
      const prev = WORLD_ISLANDS[i - 1];
      const cur = WORLD_ISLANDS[i];
      const cx = (prev.x + cur.x) / 2 + ((i % 2 === 0) ? 30 : -30);
      const cy = (prev.y + cur.y) / 2;
      d += ` Q ${cx} ${cy} ${cur.x} ${cur.y}`;
    }
    routePath.setAttribute('d', d);
  }

  WORLD_ISLANDS.forEach(island => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'world-island tone-' + (TRILHA_TONE[island.i] || 'duo'));
    g.setAttribute('data-i', island.i);
    g.setAttribute('transform', `translate(${island.x}, ${island.y})`);

    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    inner.setAttribute('class', 'world-island-inner');
    inner.innerHTML = `
      <circle class="island-marker" cx="0" cy="0" r="28"/>
      <text class="island-num" x="0" y="7">${island.i}</text>
      <text class="island-label" x="0" y="56">${island.label}</text>
    `;
    g.appendChild(inner);

    g.addEventListener('click', () => {
      navigateTo(island.i);
      closeWorldMap();
    });

    container.appendChild(g);
  });

  document.getElementById('open-world-map').addEventListener('click', openWorldMap);
  document.getElementById('close-world-map').addEventListener('click', closeWorldMap);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('world-map').classList.contains('hidden')) {
      closeWorldMap();
    }
  });
}

function openWorldMap() {
  const wm = document.getElementById('world-map');
  wm.classList.remove('hidden', 'fade-out');
  updateWorldMapMarkers();
}

function closeWorldMap() {
  const wm = document.getElementById('world-map');
  wm.classList.add('fade-out');
  setTimeout(() => {
    wm.classList.add('hidden');
    wm.classList.remove('fade-out');
  }, 400);
}

function updateWorldMapMarkers() {
  document.querySelectorAll('.world-island').forEach(g => {
    const i = parseInt(g.dataset.i);
    g.classList.remove('visited', 'current');
    if (i === STATE.current) g.classList.add('current');
    else if (STATE.visited.has(i) || i < STATE.current) g.classList.add('visited');
  });
}

function initProgressDots() {
  const container = document.getElementById('island-progress');
  if (!container) return;
  const islands = getIslands();
  islands.forEach((island, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i === islands.length - 1) dot.classList.add('dot-rsvp');
    dot.title = island.dataset.name || `Capítulo ${i + 1}`;
    dot.addEventListener('click', () => navigateTo(i + 1));
    container.appendChild(dot);
  });
  updateProgressDots(1);
}

function updateProgressDots(index) {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'visited');
    if (i + 1 === index) dot.classList.add('active');
    else if (i + 1 < index) dot.classList.add('visited');
  });
}

function initNavigation() {
  document.getElementById('nav-left').addEventListener('click', () => navigateTo(STATE.current - 1));
  document.getElementById('nav-right').addEventListener('click', () => navigateTo(STATE.current + 1));

  document.addEventListener('keydown', e => {
    if (!document.getElementById('modal').classList.contains('hidden')) return;
    // não sequestra as setas enquanto o usuário digita no formulário
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigateTo(STATE.current - 1);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateTo(STATE.current + 1);
  });

  let touchStartX = 0, touchStartY = 0;
  const wrapper = document.getElementById('map-wrapper');
  wrapper.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    // não navega se o gesto começou dentro da cartela da rifa ou de um form
    if (e.target.closest('.rifa-grade, .rsvp-form, .palpite-arena')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      navigateTo(STATE.current + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════════
   MODAIS "por que menino / menina"
════════════════════════════════════════════════════════════ */
function initConfira() {
  document.querySelectorAll('.confira-btn').forEach(btn => {
    btn.addEventListener('click', () => openConfira(btn.dataset.confira));
  });
}

function openConfira(id) {
  const data = CONFIRA[id];
  if (!data) return;
  const itens = (data.itens || []).map(t => `<li>${t}</li>`).join('');
  openModal(`
    <h3 class="modal-title-${data.tone || 'duo'}">${data.title}</h3>
    <ul class="argumentos-lista argumentos-${data.tone || 'duo'}">${itens}</ul>
    ${data.fecho ? `<p class="modal-caption">${data.fecho}</p>` : ''}
    <button type="button" class="link-btn" data-palpite-modal="${data.tone === 'azul' ? 'Menino' : 'Menina'}">
      Quero votar nesse time
    </button>
  `);

  const votar = document.querySelector('#modal-body [data-palpite-modal]');
  if (votar) {
    votar.addEventListener('click', () => {
      aplicarPalpite(votar.dataset.palpiteModal, true);
      closeModal();
      navigateTo(11);
    });
  }
}

/* ════════════════════════════════════════════════════════════
   MODAL — infra
════════════════════════════════════════════════════════════ */
function openModal(html) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-body').innerHTML = html;
  modal.classList.remove('hidden');
  document.getElementById('modal-close').focus();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal').classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   RSVP
════════════════════════════════════════════════════════════ */
const RSVP_STORAGE_KEY = 'cha-revelacao-rsvp';

function saveRsvpLocally(data) {
  try {
    const all = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || '[]');
    all.push({ ...data, savedAt: new Date().toISOString() });
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('localStorage indisponível', e);
  }
}

function buildWhatsappMessage(data) {
  const lines = [
    `🍼 *Confirmação — Chá Revelação ${CONFIG.casal}*`,
    '',
    `*Nome:* ${data.nome || '-'}`,
    `*WhatsApp:* ${data.whatsapp || '-'}`,
    `*Vai?* ${data.vai || '-'}`,
    `*Quantas pessoas:* ${data.quantos || '1'}`,
    `*Palpite:* ${data.palpite || '-'}`,
  ];
  if (data.presente) lines.push(`*Presente:* ${data.presente}`);
  if (data.acertos_quiz !== '' && data.acertos_quiz != null) {
    lines.push(`*Quiz:* ${data.acertos_quiz} acertos`);
  }
  if (data.recado && data.recado.trim()) lines.push('', `*Recado:* ${data.recado}`);
  return encodeURIComponent(lines.join('\n'));
}

async function sendToSheets(dataObj) {
  if (!CONFIG.sheetsEndpoint) return false;
  try {
    await fetch(CONFIG.sheetsEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ ...dataObj, ts: new Date().toISOString() }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    // no-cors devolve resposta opaca: não dá pra checar status, confiamos no envio
    return true;
  } catch (err) {
    console.warn('Sheets falhou', err);
    return false;
  }
}

function formatBrPhone(raw) {
  const digits = (raw || '').toString().replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2)  return `(${digits}`;
  if (digits.length <= 3)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3,7)}-${digits.slice(7)}`;
}

function initWhatsappMask() {
  const inp = document.getElementById('rsvp-whatsapp');
  if (!inp || inp.dataset.maskWired === '1') return;
  inp.dataset.maskWired = '1';
  const apply = el => {
    const formatted = formatBrPhone(el.value);
    if (formatted !== el.value) el.value = formatted;
  };
  inp.addEventListener('input', e => apply(e.target));
  inp.addEventListener('blur',  e => apply(e.target));
  inp.addEventListener('paste', e => setTimeout(() => apply(e.target), 0));
}

function initRSVP() {
  initWhatsappMask();
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  // mantém STATE.palpite em sincronia se o usuário marcar direto no form
  form.querySelectorAll('input[name="palpite"]').forEach(r => {
    r.addEventListener('change', () => {
      if (r.checked) aplicarPalpite(r.value, false);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // validação nativa (o form é novalidate pra podermos interceptar antes)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (STATE.quizScore === null && !STATE.quizSuggestionSkipped) {
      showQuizSuggestion();
      return;
    }

    const btn = form.querySelector('.submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const dataObj = Object.fromEntries(new FormData(form).entries());
    dataObj.tipo = 'rsvp';

    const qtd = parseInt(dataObj.quantos || '1', 10);
    if (isNaN(qtd) || qtd < 1) {
      dataObj.quantos = '1';
    } else if (qtd > 5) {
      dataObj.quantos = '5';
      showToast('Máximo 5 pessoas por confirmação. Ajustado para 5.');
    }

    dataObj.apressado         = STATE.skippedStory ? 'Sim' : 'Não';
    dataObj.acertos_quiz      = STATE.quizScore ?? '';
    dataObj.tags_acertos_quiz = STATE.quizTags || '';
    dataObj.rifa_numero       = STATE.rifaNumero ?? '';
    dataObj.entrou_no_grupo   = dataObj.grupo ? 'Sim' : 'Não';
    delete dataObj.grupo;

    STATE.nomeConhecido = dataObj.nome || '';

    saveRsvpLocally(dataObj);
    const sheetsOk = await sendToSheets(dataObj);
    showConfirmation(dataObj, sheetsOk);

    showToast(sheetsOk
      ? 'Presença confirmada!'
      : 'Confirmação salva neste aparelho. Mande também pelo WhatsApp.');

    switchToCelebration();

    btn.textContent = originalText;
    btn.disabled = false;

    // ✨ o convite guardou o segredo até aqui
    if (CONFIG.revelacao && CONFIG.revelacao.ativa) {
      setTimeout(() => rodarRevelacao(dataObj.nome, dataObj.palpite), 700);
    } else {
      soltarConfete('duo', 90);
    }
  });

  const btnIcs = document.getElementById('btn-ics-final');
  if (btnIcs) btnIcs.addEventListener('click', downloadICS);
}

function showConfirmation(data, sheetsOk) {
  document.getElementById('rsvp-form-wrap').classList.add('hidden');
  document.getElementById('rsvp-confirmed').classList.remove('hidden');

  const reg = document.getElementById('palpite-registrado');
  if (reg && data.palpite) {
    const azul = data.palpite === 'Menino';
    reg.className = 'palpite-registrado ' + (azul ? 'is-azul' : 'is-rosa');
    reg.innerHTML = `
      <span class="palpite-registrado-label">Seu palpite</span>
      <span class="palpite-registrado-valor">${azul ? '💙 Menino' : '💗 Menina'}</span>
      <span class="palpite-registrado-sub">Guardado. No dia a gente confere quem acertou.</span>`;
  }

  if (data && !sheetsOk) {
    const fallbackEl = document.getElementById('rsvp-fallback-wa');
    if (fallbackEl) {
      const msg = buildWhatsappMessage(data);
      const alvo = CONFIG.whatsappNumero ? `https://wa.me/${CONFIG.whatsappNumero}` : 'https://wa.me/';
      fallbackEl.querySelector('.fallback-wa-link').href = `${alvo}?text=${msg}`;
      fallbackEl.classList.remove('hidden');
    }
  }
}

function downloadICS() {
  const local = [CONFIG.local, CONFIG.endereco]
    .filter(v => v && v !== 'A definir' && v !== 'Endereço a confirmar')
    .join(', ')
    .replace(/,/g, '\\,');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cha Revelacao//PT-BR',
    'BEGIN:VEVENT',
    `DTSTART:${icsStamp(CONFIG.dataInicio)}`,
    `DTEND:${icsStamp(CONFIG.dataFim)}`,
    `SUMMARY:${DERIVADO.tituloEvento}`,
    'DESCRIPTION:Feijoada no capricho, petiscos da roça e chopp gelado. Menino ou menina?',
    local ? `LOCATION:${local}` : 'LOCATION:A definir',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cha-revelacao.ics';
  a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════════════
   REVELAÇÃO — a sequência animada que roda depois do formulário

   Ordem: abertura → suspense → oscilação com fintas → estouro
          → nome → veredito. Pode ser pulada a qualquer momento.
════════════════════════════════════════════════════════════ */
const REVELADO_KEY = 'cha-revelacao-revelado';

function jaRevelou() {
  try { return localStorage.getItem(REVELADO_KEY) === '1'; } catch (e) { return false; }
}

function marcarRevelado() {
  STATE.revelado = true;
  try { localStorage.setItem(REVELADO_KEY, '1'); } catch (e) {}
  destravarGaleria();
}

const espera = ms => new Promise(r => setTimeout(r, ms));

function reduzirMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

async function rodarRevelacao(nome, palpite) {
  const R = CONFIG.revelacao;
  if (!R || !R.ativa) return;

  const ov    = document.getElementById('revelacao');
  const palco = document.getElementById('revelacao-palco');
  if (!ov || !palco) return;

  const rapido = reduzirMovimento();
  const t = ms => rapido ? Math.min(ms, 400) : ms;

  let pulado = false;
  const btnPular = document.getElementById('revelacao-pular');
  const pular = () => { pulado = true; };
  if (btnPular) btnPular.addEventListener('click', pular, { once: true });

  ov.classList.remove('hidden');
  ov.classList.add('is-open');
  document.body.classList.add('revelacao-aberta');

  const eMenina = R.sexo === 'Menina';
  const corFinal = eMenina ? 'rosa' : 'azul';
  const palpitouCerto = palpite === R.sexo;
  const nomeFinal = eMenina ? R.nomeMenina : R.nomeMenino;

  const setPalco = html => { palco.innerHTML = html; };

  // ── 1. abertura ──────────────────────────────────────────
  const primeiroNome = (nome || '').trim().split(/\s+/)[0] || 'você';
  setPalco(`
    <div class="rev-bloco rev-abertura">
      <p class="rev-linha-1">Obrigado, ${primeiroNome}!</p>
      <p class="rev-linha-2">Seu palpite foi</p>
      <p class="rev-palpite rev-palpite-${palpite === 'Menino' ? 'azul' : 'rosa'}">${palpite || '—'}</p>
    </div>`);
  if (!pulado) await espera(t(2200));

  // ── 2. suspense ──────────────────────────────────────────
  if (!pulado) {
    setPalco(`
      <div class="rev-bloco rev-suspense">
        <p class="rev-linha-2">Agora só falta uma coisa...</p>
        <p class="rev-linha-1">abrir o envelope.</p>
        <svg class="rev-envelope" viewBox="0 0 120 120" aria-hidden="true"><use href="#motif-envelope"></use></svg>
      </div>`);
    await espera(t(2400));
  }

  // ── 3. oscilação com fintas ──────────────────────────────
  if (!pulado) {
    setPalco(`
      <div class="rev-bloco rev-oscila">
        <p class="rev-linha-2">É...</p>
        <div class="rev-medidor" id="rev-medidor">
          <span class="rev-medidor-texto" id="rev-medidor-texto">?</span>
          <span class="rev-medidor-nome" id="rev-medidor-nome">&nbsp;</span>
        </div>
        <p class="rev-dica" id="rev-dica">&nbsp;</p>
      </div>`);

    const medidor = document.getElementById('rev-medidor');
    const texto   = document.getElementById('rev-medidor-texto');
    const nomeEl  = document.getElementById('rev-medidor-nome');
    const dica    = document.getElementById('rev-dica');

    const pintar = azul => {
      texto.textContent  = azul ? 'MENINO' : 'MENINA';
      nomeEl.textContent = azul ? R.nomeMenino : R.nomeMenina;
    };

    const piscar = async (n, intervalo) => {
      for (let i = 0; i < n && !pulado; i++) {
        const azul = i % 2 === 0;
        medidor.className = 'rev-medidor ' + (azul ? 'is-azul' : 'is-rosa');
        pintar(azul);
        await espera(intervalo);
      }
    };

    const fintas = rapido ? 1 : (R.fintas || 3);
    const falas = ['quase...', 'calma aí...', 'agora é sério...'];

    // acelera, para no time errado, hesita, volta a girar — repete
    await piscar(12, t(90));
    for (let f = 0; f < fintas && !pulado; f++) {
      const fintaAzul = f % 2 === 0 ? eMenina : !eMenina;
      medidor.className = 'rev-medidor is-' + (fintaAzul ? 'azul' : 'rosa') + ' is-parado';
      pintar(fintaAzul);
      if (dica) dica.textContent = '';
      await espera(t(750));
      medidor.classList.add('is-hesitando');
      if (dica) dica.textContent = falas[f % falas.length];
      await espera(t(700));
      medidor.classList.remove('is-parado', 'is-hesitando');
      await piscar(8 + f * 4, t(70));
    }
    if (dica) dica.textContent = '';
  }

  // ── 4. estouro ───────────────────────────────────────────
  setPalco(`
    <div class="rev-bloco rev-estouro rev-${corFinal}">
      <span class="rev-eyebrow">é</span>
      <h2 class="rev-veredito">${eMenina ? 'MENINA!' : 'MENINO!'}</h2>
    </div>`);
  ov.classList.add('rev-fundo-' + corFinal);
  soltarConfete(corFinal, rapido ? 30 : 140);
  soltarBaloes(corFinal, rapido ? 6 : 16);
  if (!pulado) await espera(t(2600));

  // ── 5. o nome ────────────────────────────────────────────
  setPalco(`
    <div class="rev-bloco rev-nome-bloco rev-${corFinal}">
      <p class="rev-linha-2">e o nome dela é</p>
      <h2 class="rev-nome" id="rev-nome"></h2>
    </div>`);

  const alvoNome = document.getElementById('rev-nome');
  if (alvoNome) {
    if (rapido || pulado) {
      alvoNome.textContent = nomeFinal;
    } else {
      for (const ch of nomeFinal) {
        alvoNome.textContent += ch;
        await espera(85);
      }
    }
    alvoNome.classList.add('is-completo');
  }
  soltarConfete(corFinal, rapido ? 20 : 80);
  if (!pulado) await espera(t(2400));

  // ── 6. veredito ──────────────────────────────────────────
  setPalco(`
    <div class="rev-bloco rev-final rev-${corFinal}">
      <h2 class="rev-nome is-completo">${nomeFinal}</h2>
      <p class="rev-julgamento ${palpitouCerto ? 'is-certo' : 'is-errado'}">
        ${palpitouCerto
          ? 'E você <strong>acertou</strong> em cheio! 🎉'
          : 'Você chutou no outro time — mas a gente ama você do mesmo jeito. 💗'}
      </p>
      <p class="rev-fecho">
        Te esperamos dia <strong>${DERIVADO.dataNumerica}</strong> pra celebrar
        a chegada da <strong>${nomeFinal}</strong>.
      </p>
      <div class="rev-acoes">
        <button type="button" class="primary-btn" id="rev-ver-galeria">Ver a galeria</button>
        <button type="button" class="link-btn" id="rev-fechar">Voltar ao convite</button>
      </div>
    </div>`);

  if (btnPular) btnPular.classList.add('hidden');
  marcarRevelado();
  registrarEvento('revelacao-vista', { palpite, acertou: palpitouCerto ? 'Sim' : 'Não' });

  const fechar = () => {
    ov.classList.remove('is-open');
    document.body.classList.remove('revelacao-aberta');
    setTimeout(() => ov.classList.add('hidden'), 500);
  };

  const btnGaleria = document.getElementById('rev-ver-galeria');
  if (btnGaleria) btnGaleria.addEventListener('click', () => {
    fechar();
    const ilha = document.querySelector('.island-galeria');
    if (ilha) navigateTo(parseInt(ilha.dataset.index, 10));
  });
  const btnFechar = document.getElementById('rev-fechar');
  if (btnFechar) btnFechar.addEventListener('click', fechar);
}

/* balões subindo no estouro */
function soltarBaloes(tipo, quantidade) {
  const box = document.getElementById('confete');
  if (!box) return;
  const motivo = tipo === 'azul' ? '#motif-balao-azul' : '#motif-balao-rosa';
  for (let i = 0; i < quantidade; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 120 120');
    s.setAttribute('class', 'balao-sobe');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<use href="${motivo}"></use>`;
    s.style.left = (Math.random() * 92) + '%';
    s.style.width = (40 + Math.random() * 45) + 'px';
    s.style.setProperty('--bdur', (3.2 + Math.random() * 2.4) + 's');
    s.style.setProperty('--bdelay', (Math.random() * 1.2) + 's');
    box.appendChild(s);
    setTimeout(() => s.remove(), 7000);
  }
}

/* ════════════════════════════════════════════════════════════
   GALERIA — última página, liberada após a revelação
════════════════════════════════════════════════════════════ */
function initGaleria() {
  const grade = document.getElementById('galeria-grade');
  if (!grade) return;

  const irRsvp = document.getElementById('galeria-ir-rsvp');
  if (irRsvp) {
    irRsvp.addEventListener('click', () => {
      const ilha = document.querySelector('.island-rsvp');
      if (ilha) navigateTo(parseInt(ilha.dataset.index, 10));
    });
  }

  const itens = CONFIG.galeria || [];

  if (!itens.length) {
    grade.innerHTML = `
      <div class="galeria-vazia">
        <svg viewBox="0 0 120 120" aria-hidden="true"><use href="#motif-coracao"></use></svg>
        <p class="galeria-vazia-titulo">Álbum em construção</p>
        <p class="galeria-vazia-sub">
          As fotos, os gifs e os vídeos da <strong>${CONFIG.revelacao.nomeMenina}</strong>
          vão aparecer aqui. Volta depois. 💗
        </p>
      </div>`;
  } else {
    // inclinações fixas por posição: dá cara de mural sem virar bagunça
    const ROTACOES = [-2.4, 1.8, -1.2, 2.6, -3, 1.1, -1.9, 2.2];
    const FITAS    = ['fita-rosa', 'fita-azul', 'fita-dourada'];

    grade.innerHTML = itens.map((m, i) => {
      const capa = m.tipo === 'video'
        ? (m.poster
            ? `<img src="${m.poster}" alt="${m.titulo || ''}" loading="lazy">`
            : `<video src="${m.src}" muted playsinline preload="metadata"></video>`)
        : `<img src="${m.src}" alt="${m.titulo || ''}" loading="lazy">`;

      return `
        <figure class="foto-polaroid" style="--rot: ${ROTACOES[i % ROTACOES.length]}deg; --entra: ${(i % 8) * 0.07}s">
          <button type="button" class="foto-botao" data-galeria-i="${i}"
                  aria-label="Abrir ${m.titulo || 'mídia ' + (i + 1)}">
            <span class="foto-fita ${FITAS[i % FITAS.length]}"></span>
            <span class="foto-janela">
              ${capa}
              ${m.tipo !== 'foto'
                ? `<span class="foto-badge foto-badge-${m.tipo}">${m.tipo === 'video' ? '▶' : 'GIF'}</span>`
                : ''}
            </span>
            ${m.titulo ? `<figcaption class="foto-legenda">${m.titulo}</figcaption>` : ''}
          </button>
          ${m.comentario ? `<p class="foto-comentario">${m.comentario}</p>` : ''}
        </figure>`;
    }).join('');

    grade.addEventListener('click', e => {
      const b = e.target.closest('.foto-botao');
      if (!b) return;
      abrirMidia(parseInt(b.dataset.galeriaI, 10));
    });
  }

  if (jaRevelou()) destravarGaleria();
}

function destravarGaleria() {
  const ilha = document.querySelector('.island-galeria');
  if (!ilha) return;
  ilha.classList.add('is-destravada');
  const trava = ilha.querySelector('.galeria-trava');
  if (trava) trava.classList.add('hidden');
  const conteudo = ilha.querySelector('.galeria-conteudo');
  if (conteudo) conteudo.classList.remove('hidden');
}

function abrirMidia(i) {
  const m = (CONFIG.galeria || [])[i];
  if (!m) return;

  let midia;
  if (m.tipo === 'video') {
    midia = `<video class="midia-player" src="${m.src}" controls playsinline
                    ${m.poster ? `poster="${m.poster}"` : ''}></video>`;
  } else {
    midia = `<img class="midia-player" src="${m.src}" alt="${m.titulo || ''}">`;
  }

  openModal(`
    ${m.titulo ? `<h3>${m.titulo}</h3>` : ''}
    <div class="midia-wrap">${midia}</div>
    ${m.comentario ? `<p class="modal-caption midia-comentario">${m.comentario}</p>` : ''}
    <div class="midia-nav">
      <button type="button" class="link-btn" data-midia-nav="${i - 1}" ${i === 0 ? 'disabled' : ''}>← Anterior</button>
      <span class="midia-contador">${i + 1} / ${CONFIG.galeria.length}</span>
      <button type="button" class="link-btn" data-midia-nav="${i + 1}"
              ${i >= CONFIG.galeria.length - 1 ? 'disabled' : ''}>Próxima →</button>
    </div>
  `);

  document.querySelectorAll('#modal-body [data-midia-nav]').forEach(b => {
    b.addEventListener('click', () => {
      if (b.disabled) return;
      abrirMidia(parseInt(b.dataset.midiaNav, 10));
    });
  });
}

/* ════════════════════════════════════════════════════════════
   REGISTROS AVULSOS — voto, clique no grupo, recado no mural
════════════════════════════════════════════════════════════ */
function registrarEvento(tipo, extra = {}) {
  const payload = {
    tipo,
    nome: STATE.nomeConhecido || '',
    ...extra,
  };
  sendToSheets(payload);
}

function initGrupoTracking() {
  document.querySelectorAll('[data-cfg-href="whatsappGrupo"]').forEach(el => {
    el.addEventListener('click', () => {
      registrarEvento('grupo-clique', { origem: el.dataset.origem || 'link' });
      try { localStorage.setItem('cha-revelacao-grupo', '1'); } catch (e) {}
      const check = document.getElementById('rsvp-grupo');
      if (check) check.checked = true;
    });
  });

  // se já clicou numa visita anterior, marca o checkbox do formulário
  try {
    if (localStorage.getItem('cha-revelacao-grupo') === '1') {
      const check = document.getElementById('rsvp-grupo');
      if (check) check.checked = true;
    }
  } catch (e) {}
}

function initQrGrupo() {
  const bloco = document.getElementById('qr-grupo-bloco');
  const img   = document.getElementById('qr-grupo-img');
  if (!bloco || !img) return;
  if (!CONFIG.qrGrupo) { bloco.remove(); return; }
  img.src = CONFIG.qrGrupo;
  // se o arquivo não existir ainda, o bloco some em vez de mostrar imagem quebrada
  img.addEventListener('error', () => bloco.remove());
  img.addEventListener('load', () => bloco.classList.remove('hidden'));
}

/* ── Mural de recados ── */
function initMural() {
  const lista = document.getElementById('mural-lista');
  if (!lista) return;

  if (!CONFIG.sheetsEndpoint) {
    lista.innerHTML = `<p class="mural-vazio">O mural aparece aqui assim que a planilha estiver conectada.</p>`;
    return;
  }
  carregarMural();

  const form = document.getElementById('mural-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const nome  = document.getElementById('mural-nome').value.trim();
      const texto = document.getElementById('mural-texto').value.trim();
      if (!nome || !texto) {
        showToast('Preencha nome e recado.');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      await sendToSheets({ tipo: 'recado', nome, recado: texto });

      form.reset();
      btn.disabled = false;
      btn.textContent = 'Deixar recado';
      showToast('Recado enviado! Obrigado 💗');

      // otimista: mostra na hora, sem esperar a planilha
      adicionarRecadoNaLista({ nome, recado: texto }, true);
    });
  }
}

async function carregarMural() {
  const lista = document.getElementById('mural-lista');
  if (!lista) return;
  try {
    const res = await fetch(`${CONFIG.sheetsEndpoint}?tipo=recados`);
    if (!res.ok) throw new Error('resposta ' + res.status);
    const dados = await res.json();
    const recados = Array.isArray(dados.recados) ? dados.recados : [];
    if (!recados.length) {
      lista.innerHTML = `<p class="mural-vazio">Ninguém deixou recado ainda. Seja o primeiro!</p>`;
      return;
    }
    lista.innerHTML = '';
    recados.slice(-40).reverse().forEach(r => adicionarRecadoNaLista(r, false));
  } catch (err) {
    console.info('[mural] não foi possível carregar os recados.', err);
    lista.innerHTML = `<p class="mural-vazio">Não deu pra carregar os recados agora. O seu ainda assim será registrado.</p>`;
  }
}

function adicionarRecadoNaLista(r, noTopo) {
  const lista = document.getElementById('mural-lista');
  if (!lista) return;
  const vazio = lista.querySelector('.mural-vazio');
  if (vazio) vazio.remove();

  const card = document.createElement('article');
  card.className = 'mural-card';
  card.innerHTML = `
    <p class="mural-texto"></p>
    <p class="mural-autor"></p>`;
  // textContent evita que um recado com HTML quebre (ou injete) a página
  card.querySelector('.mural-texto').textContent = '“' + (r.recado || '') + '”';
  card.querySelector('.mural-autor').textContent = '— ' + (r.nome || 'anônimo');

  noTopo ? lista.prepend(card) : lista.appendChild(card);
}

/* ════════════════════════════════════════════════════════════
   CONFETE
════════════════════════════════════════════════════════════ */
function soltarConfete(tipo = 'duo', quantidade = 60) {
  const box = document.getElementById('confete');
  if (!box) return;

  const paletas = {
    azul: ['#7fc4f2', '#4a94c9', '#cfe8fb', '#ffffff'],
    rosa: ['#ff8fb8', '#e0578f', '#ffd6e4', '#ffffff'],
    duo:  ['#7fc4f2', '#ff8fb8', '#f0c987', '#ffffff', '#4a94c9', '#e0578f'],
  };
  const cores = paletas[tipo] || paletas.duo;

  for (let i = 0; i < quantidade; i++) {
    const p = document.createElement('span');
    p.className = 'confete-particula';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = cores[i % cores.length];
    p.style.setProperty('--cdur', (2.2 + Math.random() * 2.2) + 's');
    p.style.setProperty('--cdelay', (Math.random() * 0.7) + 's');
    p.style.setProperty('--crot', (Math.random() * 720 - 360) + 'deg');
    p.style.width  = (5 + Math.random() * 6) + 'px';
    p.style.height = (8 + Math.random() * 8) + 'px';
    box.appendChild(p);
    setTimeout(() => p.remove(), 5200);
  }
}

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), duration);
}

/* ════════════════════════════════════════════════════════════
   ÁUDIO — opcional, ligado pelo CONFIG.audio
════════════════════════════════════════════════════════════ */
function audioAtivo() {
  return !!(CONFIG.audio && CONFIG.audio.jornada);
}

function getAudio(mode) {
  return document.getElementById(mode === 'celebration' ? 'audio-celebration' : 'audio-journey');
}

function fadeAudio(audio, from, to, ms, onDone) {
  if (!audio) { onDone && onDone(); return; }
  const steps = 18;
  let i = 0;
  audio.volume = Math.max(0, Math.min(1, from));
  const iv = setInterval(() => {
    i++;
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
    if (i >= steps) { clearInterval(iv); onDone && onDone(); }
  }, ms / steps);
}

function startJourneyMusic() {
  if (!STATE.soundOn || !audioAtivo()) return;
  const a = getAudio('journey');
  if (!a || !a.src) return;
  STATE.audioMode = 'journey';
  if (!a.paused) return;
  a.volume = 0;
  const p = a.play();
  if (p && p.catch) p.then(() => fadeAudio(a, 0, 0.55, 900)).catch(() => {});
}

function stopJourneyMusic(cb) {
  const a = getAudio('journey');
  if (!a || a.paused) { cb && cb(); return; }
  fadeAudio(a, a.volume, 0, 600, () => { a.pause(); a.currentTime = 0; cb && cb(); });
}

function startCelebrationMusic() {
  const a = getAudio('celebration');
  if (!a || !a.src) return;
  STATE.audioMode = 'celebration';
  if (!STATE.soundOn) return;
  if (CONFIG.audio.refraoInicio) a.currentTime = CONFIG.audio.refraoInicio;
  a.volume = 0;
  const p = a.play();
  if (p && p.catch) p.then(() => fadeAudio(a, 0, 0.7, 900)).catch(() => {});
}

function setSoundOn(on) {
  if (!audioAtivo()) return;
  STATE.soundOn = !!on;
  const btn = document.getElementById('toggle-sound');
  if (btn) {
    btn.setAttribute('aria-pressed', String(STATE.soundOn));
    btn.classList.toggle('is-on', STATE.soundOn);
  }
  if (STATE.soundOn) {
    STATE.audioMode === 'celebration' ? startCelebrationMusic() : startJourneyMusic();
  } else {
    ['journey', 'celebration'].forEach(m => {
      const a = getAudio(m);
      if (a && !a.paused) fadeAudio(a, a.volume, 0, 400, () => a.pause());
    });
  }
  try { localStorage.setItem('cha-revelacao-sound', STATE.soundOn ? '1' : '0'); } catch (e) {}
}

function initSound() {
  const btn = document.getElementById('toggle-sound');

  if (!audioAtivo()) return;   // sem trilha configurada: botão fica escondido

  const j = getAudio('journey');
  const c = getAudio('celebration');
  if (j && CONFIG.audio.jornada)    j.src = CONFIG.audio.jornada;
  if (c && CONFIG.audio.celebracao) c.src = CONFIG.audio.celebracao;

  if (btn) {
    btn.classList.remove('hidden');
    btn.addEventListener('click', () => setSoundOn(!STATE.soundOn));
  }

  if (c && CONFIG.audio.refraoFim) {
    c.addEventListener('timeupdate', () => {
      if (c.currentTime >= CONFIG.audio.refraoFim ||
          c.currentTime < CONFIG.audio.refraoInicio - 0.2) {
        c.currentTime = CONFIG.audio.refraoInicio;
      }
    });
  }

  try {
    if (localStorage.getItem('cha-revelacao-sound') === '1') STATE.soundOn = true;
  } catch (e) {}
}

function switchToCelebration() {
  if (!audioAtivo() || !CONFIG.audio.celebracao) return;
  STATE.audioMode = 'celebration';
  stopJourneyMusic(() => { if (STATE.soundOn) startCelebrationMusic(); });
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initIntro();
  initCountdown();
  initNavigation();
  initProgressDots();
  initConfira();
  initModal();
  initPalpite();
  initRifa();
  initRSVP();
  initWorldMap();
  initQuiz();
  initSound();
  initGaleria();
  initGrupoTracking();
  initQrGrupo();
  initMural();
});

window.addEventListener('resize', () => {
  if (!document.getElementById('map-wrapper').classList.contains('hidden')) {
    navigateTo(STATE.current, false);
  }
});
