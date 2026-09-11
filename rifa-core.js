/* ══════════════════════════════════════════════════════════════
   RIFA-CORE — motor da rifa solidária

   Compartilhado entre o convite principal (index.html, seção "Rifa entre
   amigos") e a página independente /rifa/. As duas leem e escrevem na
   mesma planilha (mesmo CONFIG.sorteio.sheetsEndpoint) e no mesmo
   localStorage ('cdf-rifa', mesma origem), então reservar um número em
   uma página já aparece reservado na outra.

   Cada página chama RifaCore.init({...}) passando a config da rifa, os
   ids do próprio DOM e alguns callbacks (toast, confete, contato) — o
   resto (PIX copia-e-cola, consulta à planilha, estado dos números) é
   idêntico nas duas.
══════════════════════════════════════════════════════════════ */
const RifaCore = (() => {
  const pad2 = n => String(n).padStart(2, '0');

  /* ── Fonte única dos dados da rifa ──────────────────────────────────────
     Tanto o convite (script.js) quanto a página /rifa/ leem daqui — mexer
     no valor do número, no total de números ou nos dados do PIX só precisa
     acontecer neste arquivo. */
  const SORTEIO = {
    ativo:  true,
    premio: "1º Kit Jack Daniel's (garrafa + copo) · 2º Kit de perfumaria O Boticário",
    total:  100,        // números na cartela
    valor:  20,         // R$ por número
    pix: {
      chave:  'rodrigolino102013@gmail.com',
      nome:   'Rodrigo Lino Malta',   // como está no banco (máx. 25)
      cidade: 'Belo Horizonte',       // (máx. 15)
    },
    // números já ocupados na mão. As duas páginas também leem os da planilha.
    ocupados: [],
  };

  const CHAVE_LOCAL = 'cdf-rifa';
  const ls = {
    get(k)    { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* Números que não estão mais livres: n -> 'reservado' | 'pago' */
  const STATUS_NUM = new Map();
  /* Quando a lista de ocupados foi atualizada pela última vez. Serve pra não
     repetir a consulta de ~2,3s no momento em que a pessoa aperta Reservar. */
  let ULTIMA_CONSULTA = 0;
  const VALIDADE_CONSULTA = 10000;

  /* Os números que ESTA pessoa escolheu agora */
  const MEUS = new Set();

  const STATE = { codigoRifa: null, rifaReservada: null };

  /* Preenchida pelo init() de cada página: sorteio (CONFIG.sorteio),
     sheetsEndpoint, whatsappNumero, ids do DOM e callbacks opcionais. */
  let cfg = null;

  function mascaraTelefone(bruto) {
    const d = (bruto || '').replace(/\D/g, '').slice(0, 11);
    if (!d) return '';
    if (d.length <= 2)  return `(${d}`;
    if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,3)} ${d.slice(3,7)}-${d.slice(7)}`;
  }

  /* ── PIX COPIA E COLA — BR Code (padrão EMV do Banco Central) ──────────
     Monta a string que a pessoa cola no app do banco. Cada número da rifa
     vira um identificador próprio (RIFA042), que aparece no extrato — é
     assim que você sabe de quem é cada pagamento. */
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
    const { nome, cidade } = cfg.sorteio.pix;
    const chave = normalizarChavePix(cfg.sorteio.pix.chave);
    if (!chave || !nome || !cidade) return '';

    // '***' significa "sem identificador". Um txid personalizado é
    // permitido pela especificação, mas vários bancos recusam o código
    // estático quando ele não é '***' — e um código recusado é pior do
    // que perder a identificação automática no extrato.
    const txid = '***';
    const valorTotal = (MEUS.size || 1) * cfg.sorteio.valor;
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
      cfg.on.toast?.(msgOk);
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
      cfg.on.toast?.(ok ? msgOk : 'Não consegui copiar. Selecione e copie na mão.');
      return ok;
    }
  }

  function elId(chave) {
    const id = cfg.ids[chave];
    return id ? document.getElementById(id) : null;
  }

  function init(options) {
    cfg = {
      on: {},
      ids: {},
      ...options,
      sorteio: SORTEIO,
    };

    const grade = elId('cartela');
    if (!grade) return;

    if (!cfg.sorteio.ativo) {
      cfg.on.desativado?.(grade);
      return;
    }

    (cfg.sorteio.ocupados || []).forEach(n => STATUS_NUM.set(Number(n), 'pago'));

    const frag = document.createDocumentFragment();
    for (let n = 1; n <= cfg.sorteio.total; n++) {
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

    // Enquanto não soubermos o que já foi levado, ninguém clica.
    const espera = elId('cartelaEspera');
    if (cfg.sheetsEndpoint) {
      grade.classList.add('verificando');
      espera?.classList.remove('hidden');
    }

    pintarCartela();

    buscarNumerosOcupados().finally(() => {
      grade.classList.remove('verificando');
      espera?.classList.add('hidden');
      pintarCartela();
    });

    const tel = elId('rifaWhatsapp');
    if (tel) {
      const aplica = () => {
        const f = mascaraTelefone(tel.value);
        if (f !== tel.value) tel.value = f;
      };
      tel.addEventListener('input', aplica);
      tel.addEventListener('blur', aplica);
    }

    const btnReservar = elId('rifaReservar');
    if (btnReservar) btnReservar.addEventListener('click', reservar);

    const btnLimpar = elId('rifaLimpar');
    if (btnLimpar) btnLimpar.addEventListener('click', () => {
      MEUS.clear();
      pintarCartela();
      atualizarCarrinho();
    });
  }

  function pintarCartela() {
    const travada = elId('cartela')?.classList.contains('verificando');
    const jaReservou = !!STATE.rifaReservada;

    document.querySelectorAll('.num').forEach(b => {
      const n = Number(b.dataset.n);
      const status = STATUS_NUM.get(n);
      const meu = MEUS.has(n);

      b.classList.toggle('meu', meu);
      b.classList.toggle('pago', status === 'pago' && !meu);
      b.classList.toggle('reservado', status === 'reservado' && !meu);
      b.disabled = travada || jaReservou || (!!status && !meu);

      const rotulo = meu ? '' : status === 'pago' ? cfg.rotulos?.pago || 'pago'
                   : status === 'reservado' ? cfg.rotulos?.reservado || 'reservado' : '';
      if (rotulo) b.dataset.status = rotulo; else delete b.dataset.status;

      b.title = jaReservou && meu ? 'Reserva confirmada'
              : status === 'pago' ? `Número já ${cfg.rotulos?.pago || 'pago'}`
              : status === 'reservado' ? 'Número reservado, aguardando pagamento'
              : '';
    });
  }

  function alternarNumero(n) {
    if (STATE.rifaReservada) return;   // reserva fechada, não se mexe mais
    const primeiro = MEUS.size === 0;
    MEUS.has(n) ? MEUS.delete(n) : MEUS.add(n);
    pintarCartela();
    atualizarCarrinho();

    if (primeiro && Date.now() - ULTIMA_CONSULTA > VALIDADE_CONSULTA) {
      buscarNumerosOcupados();
    }
  }

  function numerosOrdenados() {
    return [...MEUS].sort((a, b) => a - b);
  }

  function totalCarrinho() {
    return MEUS.size * cfg.sorteio.valor;
  }

  function atualizarCarrinho() {
    const box = elId('carrinho');
    if (!box) return;

    if (!MEUS.size) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');

    const nums = numerosOrdenados();
    const chips = elId('carrinhoNums');
    if (chips) {
      chips.innerHTML = nums
        .map(n => `<button type="button" class="chip-num" data-tira="${n}"
                     aria-label="Tirar o número ${pad2(n)}">${pad2(n)} <i>×</i></button>`)
        .join('');
      chips.querySelectorAll('[data-tira]').forEach(b =>
        b.addEventListener('click', () => alternarNumero(Number(b.dataset.tira))));
    }

    const conta = elId('carrinhoConta');
    if (conta) {
      conta.innerHTML = `${MEUS.size} ${MEUS.size === 1 ? 'número' : 'números'}
        · contribuição de <b>R$ ${totalCarrinho()}</b>`;
    }

    const btn = elId('rifaReservar');
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
    const nome = (elId('rifaNome')?.value || '').trim();
    const tel  = (elId('rifaWhatsapp')?.value || '').trim();

    if (!MEUS.size)    { cfg.on.toast?.('Escolha pelo menos um número.'); return; }
    if (!nome || !tel) { cfg.on.toast?.('Preencha seu nome e WhatsApp.'); return; }

    const btn = elId('rifaReservar');
    const txt = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Reservando...';

    if (Date.now() - ULTIMA_CONSULTA > VALIDADE_CONSULTA) {
      await buscarNumerosOcupados();
    }
    const perdidos = numerosOrdenados().filter(n => STATUS_NUM.has(n));
    perdidos.forEach(n => MEUS.delete(n));

    if (perdidos.length) {
      pintarCartela();
      atualizarCarrinho();
      btn.disabled = false;
      btn.textContent = txt;
      cfg.on.toast?.(`Levaram o ${perdidos.map(pad2).join(', ')}. Confere os que sobraram.`, 4500);
      return;
    }

    const nums = numerosOrdenados();
    const codigo = codigoReserva();

    await enviarPlanilha({
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
    salvarRifaLocal();
    cfg.on.contato?.(nome, tel);
    pintarCartela();   // a partir daqui a cartela fica fechada

    btn.disabled = false;
    btn.textContent = txt;
    mostrarPagamento();
  }

  /* A reserva vale dinheiro: o código é o que liga o comprovante ao número na
     planilha. Sem persistir, quem fechava a página depois de reservar voltava
     sem código e sem o copia-e-cola, e ainda via os próprios números como
     "reservado" de outra pessoa. */
  function salvarRifaLocal() {
    ls.set(CHAVE_LOCAL, JSON.stringify(STATE.rifaReservada));
  }

  function restaurarRifa() {
    if (!cfg.sorteio.ativo) return;

    let r = null;
    try { r = JSON.parse(ls.get(CHAVE_LOCAL) || 'null'); } catch (e) {}
    if (!r || !Array.isArray(r.nums) || !r.nums.length) return;

    STATE.rifaReservada = r;
    STATE.codigoRifa = r.codigo;

    r.nums.forEach(n => { MEUS.add(Number(n)); STATUS_NUM.set(Number(n), 'reservado'); });

    pintarCartela();
    mostrarPagamento(false);
  }

  /* `festejar` é falso quando a tela está sendo remontada numa nova visita. */
  function mostrarPagamento(festejar = true) {
    const { nums, codigo } = STATE.rifaReservada;
    const painel = elId('rifaPagamento');
    const form = elId('rifaForm');
    if (!painel) return;

    if (form) form.classList.add('hidden');
    elId('carrinho')?.classList.add('hidden');
    painel.classList.remove('hidden');

    const codigoPix = pixCopiaECola();
    const temCopiaCola = !!codigoPix;

    painel.innerHTML = `
      <p class="pag-titulo">Obrigado de coração 💛</p>
      <p class="pag-nums">Seus números: <b>${nums.map(pad2).join(' · ')}</b></p>
      <p class="pag-total">Contribuição: <b>R$ ${nums.length * cfg.sorteio.valor}</b></p>

      <p class="pag-aviso">
        <b>Isto é um ticket de reserva, ainda não é a confirmação.</b>
        Os números acima ficam guardados no seu nome, mas só são
        <b>reservados e confirmados de fato</b> quando você enviar o
        comprovante do pagamento.
      </p>

      ${temCopiaCola ? `
        <button type="button" class="btn btn-primario btn-largo" id="${cfg.ids.pagCopia || 'pag-copia'}">
          Copiar o PIX
        </button>
        <p class="pag-dica">É só colar no app do banco — o valor já vai preenchido.</p>
      ` : `
        <p class="pag-dica">Chave PIX</p>
        <button type="button" class="pag-chave" id="${cfg.ids.pagChave || 'pag-chave'}">${cfg.sorteio.pix.chave || 'a definir'}</button>
        <p class="pag-dica">Se o app deixar, escreva <b>RIFA ${codigo}</b> na descrição.</p>
      `}

      <p class="pag-codigo">
        Seu código: <b>${codigo}</b><br>
        <small>Mande junto com o comprovante — é assim que a gente acha
        a sua reserva.</small>
      </p>

      <a class="btn btn-suave btn-largo" id="${cfg.ids.pagWpp || 'pag-wpp'}" href="#" target="_blank" rel="noopener">
        Enviar comprovante no WhatsApp
      </a>
      <p class="pag-nota">
        Enquanto o comprovante não chega, seus números aparecem para os outros
        como <i>reservados</i> — e é o envio dele que fecha a reserva.
        Obrigado mesmo por essa força. 💗
      </p>`;

    const copia = document.getElementById(cfg.ids.pagCopia || 'pag-copia');
    if (copia) copia.addEventListener('click', () =>
      copiar(codigoPix, 'PIX copiado! Cole no app do banco.'));

    const chave = document.getElementById(cfg.ids.pagChave || 'pag-chave');
    if (chave) chave.addEventListener('click', () =>
      copiar(cfg.sorteio.pix.chave, 'Chave PIX copiada!'));

    const wpp = document.getElementById(cfg.ids.pagWpp || 'pag-wpp');
    if (wpp) {
      const msg = [
        `🎟️ *Rifa solidária — código ${codigo}*`, '',
        `*Nome:* ${STATE.rifaReservada.nome}`,
        `*Números:* ${nums.map(pad2).join(', ')}`,
        `*Contribuição:* R$ ${nums.length * cfg.sorteio.valor}`,
        '', 'Segue o comprovante 👇',
      ].join('\n');
      const base = cfg.whatsappNumero ? `https://wa.me/${cfg.whatsappNumero}` : 'https://wa.me/';
      wpp.href = `${base}?text=${encodeURIComponent(msg)}`;
    }

    if (festejar) {
      cfg.on.confete?.();
      painel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* Lê da planilha os números reservados e pagos */
  async function buscarNumerosOcupados() {
    if (!cfg.sheetsEndpoint) return;
    try {
      const res = await fetch(`${cfg.sheetsEndpoint}?tipo=rifa-ocupados`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const { ocupados } = await res.json();
      if (!Array.isArray(ocupados)) return;
      ocupados.forEach(o => {
        const n = Number(o.numero);
        if (!isNaN(n)) STATUS_NUM.set(n, o.status === 'pago' ? 'pago' : 'reservado');
      });
      ULTIMA_CONSULTA = Date.now();
      pintarCartela();
    } catch (err) {
      // a cartela destrava assim mesmo: melhor escolher às cegas do que
      // travar todo mundo porque a planilha não respondeu
      console.info('[rifa] não deu pra ler os números ocupados.', err);
    }
  }

  /* Não espera a resposta, de propósito — ver a explicação em script.js
     junto de enviar(). Duplicada aqui porque é o único jeito de manter
     rifa-core.js sem depender do restante do convite. */
  function enviarPlanilha(dados) {
    if (!cfg.sheetsEndpoint) return false;
    const corpo = JSON.stringify({ ...dados, ts: new Date().toISOString() });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([corpo], { type: 'text/plain;charset=utf-8' });
        if (navigator.sendBeacon(cfg.sheetsEndpoint, blob)) return true;
      }
    } catch (err) {}

    try {
      fetch(cfg.sheetsEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: corpo,
      }).catch(err => console.warn('[sheets] falhou', err));
      return true;
    } catch (err) {
      console.warn('[sheets] falhou', err);
      return false;
    }
  }

  return {
    init, restaurarRifa, pintarCartela,
    sorteio: SORTEIO,
    get reservado() { return STATE.rifaReservada; },
  };
})();
