// Camada de quiz ao vivo sobre o deck. Observa qual slide esta ativo e
// controla a sala no Realtime Database. Se o Firebase nao estiver configurado,
// o deck continua funcionando no modo offline (clicar revela a resposta).
import { QUESTOES, LIMITE_MS, pontos } from './quiz-data.js';
import { conectar, configurado, novoCodigo, urlDoAluno } from './sala.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slides = [...document.querySelectorAll('.slide')];
const quizSlides = slides.filter((s) => s.querySelector('.quiz'));
const slideEntrada = slides.find((s) => s.dataset.label === 'Entre no Kahoot');
const slidePodio = slides.find((s) => s.dataset.label === 'Pódio');

if (!configurado()) {
  if (slideEntrada) {
    const alvo = slideEntrada.querySelector('.pinbox');
    if (alvo) alvo.textContent = 'quiz offline';
  }
} else {
  iniciar().catch((e) => console.error('[quiz ao vivo]', e));
}

async function iniciar() {
  const fb = await conectar();
  let sala = new URLSearchParams(location.search).get('sala');
  try { sala = sala || localStorage.getItem('bsc_sala'); } catch (e) {}
  if (!sala) { sala = novoCodigo(); }
  try { localStorage.setItem('bsc_sala', sala); } catch (e) {}

  const raiz = `salas/${sala}`;
  let jogadores = {}, respostas = {}, qAtual = -1, revelado = new Set();

  await fb.update(fb.ref(fb.db, raiz + '/estado'), { fase: 'lobby', q: -1 });

  fb.onValue(fb.ref(fb.db, raiz + '/jogadores'), (s) => { jogadores = s.val() || {}; pintarEntrada(); pintarContador(); });
  fb.onValue(fb.ref(fb.db, raiz + '/respostas'), (s) => { respostas = s.val() || {}; pintarContador(); });

  montarEntrada();
  montarQuiz();
  observar();

  // ─── slide de entrada: codigo + QR ───────────────────────────────────────
  function montarEntrada() {
    if (!slideEntrada) return;
    const grade = slideEntrada.querySelector('.grid.g3');
    if (!grade) return;
    const url = urlDoAluno(sala);
    grade.innerHTML = `
      <div class="card green" data-a="pop"><span class="tag">Passo 01</span>
        <h4>Abra este endereço</h4>
        <p class="qrlink" style="font-family:var(--mono);font-size:14px;word-break:break-all;color:var(--navy)">${esc(url.replace(/^https?:\/\//, ''))}</p>
        <p>Funciona no celular, sem instalar nada e sem criar conta.</p></div>
      <div class="card green" data-a="pop"><span class="tag">Passo 02</span>
        <h4>Ou aponte a câmera</h4>
        <canvas id="qr" width="150" height="150" style="width:150px;height:150px;justify-self:center;border-radius:10px"></canvas></div>
      <div class="card green" data-a="pop"><span class="tag">Passo 03</span>
        <h4>Código da sala</h4>
        <p class="pinbox" id="cod">${esc(sala)}</p>
        <p><b id="nj">0 participantes</b> na sala.</p></div>`;
    if (window.QRious) {
      try { new window.QRious({ element: document.getElementById('qr'), value: url, size: 300, background: '#fff', foreground: '#123A68', level: 'M' }); }
      catch (e) { console.warn('QR indisponivel', e); }
    }
    const plano = slideEntrada.querySelector('.grid.g2');
    if (plano) {
      const c = plano.querySelectorAll('.card')[1];
      if (c) { const h = c.querySelector('h4'), p = c.querySelector('p:last-of-type');
        if (h) h.textContent = 'Rodamos pelos slides';
        if (p) p.textContent = 'Se a internet cair, as mesmas cinco questões funcionam no próprio deck, com contagem no quadro.'; }
    }
  }

  function pintarEntrada() {
    const n = Object.keys(jogadores).length;
    const el = document.getElementById('nj');
    if (el) el.textContent = n === 1 ? '1 participante' : n + ' participantes';
  }

  // ─── slides de questao: contador + botao de revelar ──────────────────────
  function montarQuiz() {
    quizSlides.forEach((s, i) => {
      const quiz = s.querySelector('.quiz');
      const opts = quiz.querySelector('.opts');
      const barra = document.createElement('div');
      barra.className = 'aovivo';
      barra.innerHTML = `<span class="cnt" data-q="${i}">0 de 0 responderam</span>
        <button class="revelar" data-q="${i}">Encerrar e revelar &nbsp;<kbd>R</kbd></button>`;
      opts.before(barra);
      const lista = document.createElement('div');
      lista.className = 'top5'; lista.dataset.q = String(i);
      quiz.append(lista);
      barra.querySelector('.revelar').onclick = () => revelar(i);
      // no modo ao vivo o clique do apresentador nao revela a resposta
      quiz.querySelectorAll('.opt').forEach((o) => { o.style.cursor = 'default'; o.dataset.live = '1'; });
    });
  }

  function pintarContador() {
    quizSlides.forEach((s, i) => {
      const c = s.querySelector('.cnt');
      if (!c) return;
      const r = respostas[i] || {};
      const n = Object.keys(r).length, t = Object.keys(jogadores).length;
      c.textContent = `${n} de ${t} ${n === 1 ? 'respondeu' : 'responderam'}`;
      c.classList.toggle('cheio', t > 0 && n >= t);
    });
  }

  async function abrir(i) {
    if (qAtual === i) return;
    qAtual = i;
    const s = quizSlides[i];
    s.querySelector('.quiz').dataset.done = '';
    s.querySelectorAll('.opt').forEach((o) => o.classList.remove('right', 'wrong', 'dim', 'locked'));
    s.querySelector('.why').classList.remove('show');
    s.querySelector('.top5').innerHTML = '';
    s.querySelector('.aovivo').classList.remove('fim');
    if (revelado.has(i)) { pintarRevelado(i); return; }
    await fb.remove(fb.ref(fb.db, `${raiz}/respostas/${i}`));
    await fb.set(fb.ref(fb.db, raiz + '/estado'), { fase: 'pergunta', q: i, abertaEm: Date.now() });
  }

  async function revelar(i) {
    if (revelado.has(i)) return pintarRevelado(i);
    const q = QUESTOES[i];
    const r = respostas[i] || {};
    // Congela a base ANTES de escrever: o listener de jogadores ja vai refletir
    // o valor novo, e somar outra vez contaria o ganho em dobro.
    const finais = {};
    Object.entries(jogadores).forEach(([pid, v]) => { finais[pid] = v.pontos || 0; });
    Object.entries(r).forEach(([pid, v]) => {
      const pts = pontos(v.op === q.c, v.ms);
      finais[pid] = (finais[pid] || 0) + pts;
      fb.update(fb.ref(fb.db, `${raiz}/jogadores/${pid}`), { pontos: finais[pid] });
    });
    await fb.set(fb.ref(fb.db, raiz + '/estado'), { fase: 'revelar', q: i, minhas: r });
    revelado.add(i);
    pintarRevelado(i, finais);
  }

  function pintarRevelado(i, finais) {
    const q = QUESTOES[i];
    const s = quizSlides[i];
    s.querySelectorAll('.opt').forEach((o, k) => {
      o.classList.add('locked');
      if (k === q.c) o.classList.add('right'); else o.classList.add('dim');
    });
    s.querySelector('.why').classList.add('show');
    s.querySelector('.aovivo').classList.add('fim');

    const arr = Object.entries(jogadores)
      .map(([pid, v]) => ({ nome: v.nome || '—', pontos: finais && pid in finais ? finais[pid] : (v.pontos || 0) }))
      .sort((a, b) => b.pontos - a.pontos).slice(0, 5);
    s.querySelector('.top5').innerHTML = arr.length
      ? `<span class="rot">Ranking parcial</span>` + arr.map((x, k) =>
          `<span class="l"><b>${k + 1}º</b> ${esc(x.nome)} <i>${x.pontos}</i></span>`).join('')
      : '';
  }

  async function fechar() {
    qAtual = -1;
    await fb.update(fb.ref(fb.db, raiz + '/estado'), { fase: 'fim' });
    if (!slidePodio) return;
    const arr = Object.entries(jogadores)
      .map(([, v]) => ({ nome: v.nome || '—', pontos: v.pontos || 0 }))
      .sort((a, b) => b.pontos - a.pontos);
    slidePodio.querySelectorAll('.pline').forEach((l, k) => {
      const nm = l.querySelector('.nm');
      if (!nm) return;
      if (arr[k]) { nm.textContent = `${arr[k].nome} · ${arr[k].pontos} pts`; nm.style.color = 'var(--ink)'; }
      else nm.textContent = 'sem participante';
    });
  }

  // ─── observa qual slide esta ativo ───────────────────────────────────────
  function observar() {
    const atualiza = () => {
      const on = document.querySelector('.slide.on');
      if (!on) return;
      const i = quizSlides.indexOf(on);
      if (i >= 0) abrir(i);
      else if (on === slidePodio) fechar();
      else if (qAtual !== -1 && !revelado.has(qAtual)) { /* saiu sem revelar: mantem aberto */ }
    };
    new MutationObserver(atualiza).observe(document.querySelector('.stage'), {
      attributes: true, attributeFilter: ['class'], subtree: true
    });
    atualiza();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'r' && e.key !== 'R') return;
    const on = document.querySelector('.slide.on');
    const i = quizSlides.indexOf(on);
    if (i >= 0) revelar(i);
  });

  window.__sala = sala;
}
