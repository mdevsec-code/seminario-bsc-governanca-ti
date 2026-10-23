// Conexao com o Realtime Database e helpers de sala, usados pelas duas telas.
import { firebaseConfig, AO_VIVO } from './config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
let db = null, api = null;

export function configurado() {
  return AO_VIVO && firebaseConfig && !String(firebaseConfig.databaseURL || '').includes('COLE_AQUI');
}

export async function conectar() {
  if (db) return { db, ...api };
  if (!configurado()) throw new Error('Firebase nao configurado em config.js');
  const [{ initializeApp }, rt] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-database.js')
  ]);
  const app = initializeApp(firebaseConfig);
  db = rt.getDatabase(app);
  api = { ref: rt.ref, set: rt.set, get: rt.get, update: rt.update, onValue: rt.onValue, remove: rt.remove, serverTimestamp: rt.serverTimestamp };
  return { db, ...api };
}

export function novoCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += letras[Math.floor(Math.random() * letras.length)];
  return s;
}

export function meuId() {
  let id = null;
  try { id = localStorage.getItem('bsc_jogador'); } catch (e) {}
  if (!id) {
    id = 'p' + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem('bsc_jogador', id); } catch (e) {}
  }
  return id;
}

export function urlDoAluno(codigo) {
  const u = new URL('jogar.html', location.href);
  u.searchParams.set('sala', codigo);
  return u.toString();
}
