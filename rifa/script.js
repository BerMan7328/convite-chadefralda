/* ══════════════════════════════════════════════════════════════
   RIFA — Anna Laura · página independente do convite

   Os números, o valor, o prêmio e o PIX vêm de RifaCore.sorteio
   (rifa-core.js) — a mesma fonte que o convite principal usa, então um
   número reservado aqui aparece reservado lá (e vice-versa).

   Este arquivo só tem: o endereço da planilha e o WhatsApp de contato
   (os mesmos do convite — mude nos dois lugares se um dia trocar), e os
   efeitos visuais (toast, confete) que só esta página usa.
══════════════════════════════════════════════════════════════ */
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzEgcbhcPaHrqDlv7FfshnRubXRykSE9FyoqIAdPhArxRT02zBmQ2N-1lTvIQj_kyp7/exec';
const WHATSAPP_NUMERO = '5531982985951';

const PALETAS_CONFETE = ['#7fb6f0', '#f79fc0', '#c9b8f0', '#ffffff', '#3f7fc4', '#d9628f'];

function confete(qtd = 40) {
  const box = document.getElementById('confete');
  if (!box) return;
  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('span');
    p.className = 'papel';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = PALETAS_CONFETE[i % PALETAS_CONFETE.length];
    p.style.setProperty('--dur', (2.2 + Math.random() * 2.2) + 's');
    p.style.setProperty('--atraso', (Math.random() * 0.7) + 's');
    p.style.setProperty('--giro', (Math.random() * 720 - 360) + 'deg');
    p.style.width = (5 + Math.random() * 6) + 'px';
    p.style.height = (8 + Math.random() * 8) + 'px';
    box.appendChild(p);
    setTimeout(() => p.remove(), 5200);
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

document.addEventListener('DOMContentLoaded', () => {
  const vn = document.getElementById('valor-numero');
  if (vn) vn.textContent = RifaCore.sorteio.valor;

  RifaCore.init({
    sheetsEndpoint: SHEETS_ENDPOINT,
    whatsappNumero: WHATSAPP_NUMERO,
    // Nesta página o status vendido aparece escrito por cima do número —
    // "vendido" é a palavra que o cartaz de referência usa.
    rotulos: { pago: 'vendido' },
    ids: {
      cartela: 'cartela',
      cartelaEspera: 'cartela-espera',
      carrinho: 'carrinho',
      carrinhoNums: 'carrinho-nums',
      carrinhoConta: 'carrinho-conta',
      rifaForm: 'rifa-form',
      rifaNome: 'rifa-nome',
      rifaWhatsapp: 'rifa-whatsapp',
      rifaReservar: 'rifa-reservar',
      rifaLimpar: 'rifa-limpar',
      rifaPagamento: 'rifa-pagamento',
    },
    on: {
      toast,
      confete: () => confete(40),
      desativado: grade => grade.closest('.rifa-secao')?.remove(),
    },
  });

  RifaCore.restaurarRifa();
});
