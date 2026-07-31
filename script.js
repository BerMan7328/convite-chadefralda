/* ══════════════════════════════════════════════════════════════
   E AÍ, QUAL É??? — chá de fralda · script
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
  whatsappNumero: '',             // só dígitos, ex.: '5531999999999'

  // ── Ação entre amigos ─────────────────────────────────────
  // Não tem cartela: quem confirma presença ganha um número.
  sorteio: {
    ativo:  true,
    premio: "Kit Jack Daniel's (garrafa + copo)",
    // faixa dos números gerados
    de:  1000,
    ate: 9999,
  },

  // ── Galeria do último slide ───────────────────────────────
  // Aceita 'foto', 'gif' e 'video'. Arquivos em assets/galeria/.
  galeria: [
    // { tipo: 'foto',  src: 'assets/galeria/ultrassom.jpeg', titulo: 'O primeiro retrato',
    //   comentario: 'A primeira vez que a gente viu esse rostinho.' },
    // { tipo: 'video', src: 'assets/galeria/chute.mp4', poster: 'assets/galeria/capa.jpeg',
    //   titulo: 'O primeiro chute', comentario: 'Som ligado. Vale a pena.' },
  ],

  // ── Backend (Google Apps Script) — ver SHEETS_SETUP.md ─────
  sheetsEndpoint: '',
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
  numeroSorte: null,
  revelado: false,
};

const CHAVES = {
  palpite:  'cdf-palpite',
  revelado: 'cdf-revelado',
  numero:   'cdf-numero',
  grupo:    'cdf-grupo',
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
  }, { root: deck, threshold: 0.5 });
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

function gerarNumeroSorte() {
  const salvo = ls.get(CHAVES.numero);
  if (salvo) return parseInt(salvo, 10);
  const { de, ate } = CONFIG.sorteio;
  const n = Math.floor(Math.random() * (ate - de + 1)) + de;
  ls.set(CHAVES.numero, String(n));
  return n;
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

    if (CONFIG.sorteio.ativo) {
      STATE.numeroSorte = gerarNumeroSorte();
      dados.numero_sorte = STATE.numeroSorte;
    }

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

  const sorte = document.getElementById('sorte');
  if (sorte && CONFIG.sorteio.ativo && STATE.numeroSorte) {
    sorte.innerHTML = `
      <span class="sorte-rot">seu número da sorte</span>
      <span class="sorte-num">${STATE.numeroSorte}</span>
      <span class="sorte-sub">Concorre ao ${CONFIG.sorteio.premio}, sorteado ao vivo no dia da festa.</span>`;
  } else if (sorte) {
    sorte.classList.add('hidden');
  }

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
      if (STATE.numeroSorte) linhas.push(`*Número da sorte:* ${STATE.numeroSorte}`);
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

  // 2 · suspense
  if (!pulado) {
    põe(`<div class="rev-bloco">
           <p class="rev-p">Agora só falta uma coisa...</p>
           <p class="rev-forte">abrir o envelope.</p>
         </div>`);
    await espera(t(2200));
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
      ? `<video class="lb-midia" src="${m.src}" controls playsinline ${m.poster ? `poster="${m.poster}"` : ''}></video>`
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

  lb.classList.remove('hidden');
  document.body.classList.add('travado');
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  const fechar = () => {
    lb.classList.add('hidden');
    document.body.classList.remove('travado');
    document.getElementById('lightbox-conteudo').innerHTML = '';
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
  initFormulario();
  initAlbum();
  initLightbox();
  initRecados();
  initGrupo();

  const ics = document.getElementById('btn-ics');
  if (ics) ics.addEventListener('click', baixarIcs);
});
