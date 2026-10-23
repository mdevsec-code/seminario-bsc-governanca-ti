// ─────────────────────────────────────────────────────────────────────────────
// COLE AQUI A CONFIGURACAO DO SEU PROJETO FIREBASE.
// Como obter (leva cerca de 3 minutos, e gratuito):
//   1. console.firebase.google.com  ->  Criar projeto  (pode desativar o Analytics)
//   2. No menu Criacao -> Realtime Database -> Criar banco de dados
//      Escolha a regiao e comece em "modo de teste".
//   3. Engrenagem (Configuracoes do projeto) -> seus apps -> icone </> (Web)
//      Registre o app e copie o objeto firebaseConfig que aparecer.
//   4. Cole esse objeto abaixo, substituindo este aqui.
//
// IMPORTANTE: databaseURL precisa estar presente. Se o Firebase nao incluir,
// copie da tela do Realtime Database (termina em firebasedatabase.app).
// ─────────────────────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: 'COLE_AQUI',
  authDomain: 'COLE_AQUI.firebaseapp.com',
  databaseURL: 'https://COLE_AQUI-default-rtdb.firebaseio.com',
  projectId: 'COLE_AQUI',
  storageBucket: 'COLE_AQUI.appspot.com',
  messagingSenderId: 'COLE_AQUI',
  appId: 'COLE_AQUI'
};

// Deixe true para usar o quiz ao vivo. Em false, o site roda o quiz
// no modo offline (clicar na alternativa revela a resposta), sem ranking.
export const AO_VIVO = true;
