/* ============================================================
   CONFIG — preencher quando o Vitor passar os dados
   ============================================================ */
const CONFIG = {
  whatsapp: '',            // só números com DDI+DDD, ex.: '5573999999999'. Vazio = usa o Direct do Instagram
  instagram: 'morenopersonal___',
  cref: ''                 // ex.: 'CREF 012345-G/BA'. Vazio = selo não aparece
};

/* ---------- link de contato (WhatsApp ou Direct) ---------- */
const hasWA = () => CONFIG.whatsapp.replace(/\D/g, '').length >= 12;
function contactURL(msg) {
  if (hasWA()) return 'https://wa.me/' + CONFIG.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg);
  return 'https://ig.me/m/' + CONFIG.instagram;
}
const toastEl = document.getElementById('toast');
let toastT;
function toast(t) {
  toastEl.textContent = t; toastEl.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => toastEl.hidden = true, 5200);
}
function openContact(msg) {
  if (hasWA()) { window.open(contactURL(msg), '_blank', 'noopener'); return; }
  // sem WhatsApp configurado: copia a mensagem e abre o Direct
  const done = () => toast('Mensagem copiada. Cole no Direct do Instagram pra me chamar.');
  if (navigator.clipboard) navigator.clipboard.writeText(msg).then(done, done); else done();
  window.open(contactURL(msg), '_blank', 'noopener');
}

/* botões [data-cta] (menos os que só rolam a página) */
document.querySelectorAll('[data-cta]').forEach(el => {
  el.addEventListener('click', e => {
    if (el.closest('#contato')) return;   // dentro do formulário não intercepta
    e.preventDefault();
    openContact(el.dataset.msg || 'Olá, Vitor!');
  });
});

/* CREF */
if (CONFIG.cref) { const c = document.querySelector('[data-cref]'); c.textContent = CONFIG.cref; c.hidden = false; }

/* ---------- header / menu ---------- */
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('solid', window.scrollY > 30);
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
const burger = document.getElementById('burger'), nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

/* ---------- reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });

/* ---------- lightbox ---------- */
const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img');
document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
  lbImg.src = b.dataset.zoom; lbImg.alt = b.querySelector('img').alt; lb.hidden = false; document.body.style.overflow = 'hidden';
}));
const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

/* ---------- quiz ---------- */
const steps = [
  { q: 'Qual é o seu objetivo?', k: 'objetivo', o: ['Perder gordura e definir', 'Ganhar massa e força', 'Correr (5 km, 10 km ou prova)', 'CrossFit / Hyrox', 'Começar ou voltar a treinar', 'Aprender a treinar sozinho'] },
  { q: 'Como você prefere treinar?', k: 'formato', o: ['Online, no meu ritmo', 'Presencial, com o Vitor do lado', 'Ainda não sei'] },
  { q: 'Qual horário encaixa melhor?', k: 'rotina', o: ['Manhã', 'Tarde', 'Noite', 'Varia durante a semana'] }
];
const ans = {}; let cur = 0;
const stepEl = document.getElementById('quizStep'), bar = document.getElementById('quizBar'), back = document.getElementById('quizBack');
function renderQuiz() {
  if (cur >= steps.length) return renderResult();
  const s = steps[cur];
  bar.style.width = (cur / steps.length * 100) + '%';
  back.hidden = cur === 0;
  stepEl.innerHTML = '<h3 class="quiz-q"><small>PERGUNTA ' + (cur + 1) + ' DE ' + steps.length + '</small>' + s.q + '</h3><div class="opts">' +
    s.o.map(x => '<button class="opt" type="button">' + x + '</button>').join('') + '</div>';
  stepEl.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => { ans[s.k] = b.textContent; cur++; renderQuiz(); }));
}
function renderResult() {
  bar.style.width = '100%'; back.hidden = true;
  const msg = 'Olá, Vitor! Meu objetivo é: ' + ans.objetivo.toLowerCase() + '. Prefiro treinar: ' + ans.formato.toLowerCase() + '. Melhor horário: ' + ans.rotina.toLowerCase() + '. Pode me indicar o melhor caminho?';
  stepEl.innerHTML = '<div class="quiz-result"><h3 class="quiz-q"><small>PRONTO</small>Sua mensagem está pronta.</h3><p>É isso que vai pra mim:</p><div class="quiz-msg">' + msg + '</div>' +
    '<button class="btn btn-gold" id="quizSend" type="button"><span>' + (hasWA() ? 'Mandar no WhatsApp' : 'Mandar no Instagram') + '</span></button><button class="redo" id="quizRedo" type="button">refazer</button></div>';
  document.getElementById('quizSend').onclick = () => openContact(msg);
  document.getElementById('quizRedo').onclick = () => { cur = 0; renderQuiz(); };
}
back.addEventListener('click', () => { if (cur > 0) { cur--; renderQuiz(); } });
renderQuiz();

/* ---------- formulário ---------- */
document.getElementById('formBtnLabel').textContent = hasWA() ? 'Chamar no WhatsApp' : 'Chamar no Instagram';
document.getElementById('leadForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  let msg = 'Olá, Vitor! Me chamo ' + f.get('nome') + '. Meu objetivo: ' + f.get('objetivo').toLowerCase() + '. Formato: ' + f.get('formato').toLowerCase() + '.';
  if ((f.get('obs') || '').trim()) msg += ' ' + f.get('obs').trim();
  openContact(msg);
});
