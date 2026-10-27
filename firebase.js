// Conexión con Firebase: cuenta (correo y Google), catálogo y pedidos en Firestore.
// app.js sigue leyendo la sesión desde localStorage ('c3d-cuenta'); aquí se mantiene sincronizada.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, getDocs, getDoc, doc, addDoc, setDoc, query, where, serverTimestamp, writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const configurado = !firebaseConfig.apiKey.startsWith('PEGA');
const app = configurado ? initializeApp(firebaseConfig) : null;
const auth = app && getAuth(app), db = app && getFirestore(app);
const $ = s => document.querySelector(s);
const pagina = location.pathname.split('/').pop() || 'index.html';
const sinConfig = () => { throw new Error('Firebase no está configurado: completa firebase-config.js.'); };

// ---------- Sesión ----------
let resolverSesion;
const sesionLista = new Promise(r => resolverSesion = r);
if (auth) onAuthStateChanged(auth, async u => {
  const antes = localStorage.getItem('c3d-cuenta');
  if (u) {
    localStorage.setItem('c3d-cuenta', JSON.stringify({ uid: u.uid, correo: u.email, nombre: u.displayName || '' }));
    // Perfil del cliente (colección "usuarios"), sin bloquear la página si falla
    setDoc(doc(db, 'usuarios', u.uid), { correo: u.email, nombre: u.displayName || '', ultimoAcceso: serverTimestamp() }, { merge: true }).catch(() => {});
  } else localStorage.removeItem('c3d-cuenta');
  document.querySelectorAll('.nav a[href="login.html"]').forEach(a => a.textContent = u ? 'Mi cuenta' : 'Iniciar sesión');
  resolverSesion(u);
  // La primera lectura de app.js usó el caché: si cambió (otra pestaña cerró sesión), recargar
  if (antes !== localStorage.getItem('c3d-cuenta') && pagina !== 'login.html') location.reload();
});
else resolverSesion(null);

// ---------- Catálogo ----------
async function cargarProductos() {
  if (!db) return window.C3D_PRODUCTOS;
  try {
    const snap = await getDocs(collection(db, 'productos'));
    return snap.empty ? window.C3D_PRODUCTOS : snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return window.C3D_PRODUCTOS; } // sin conexión: lista local
}
async function cargarProducto(id) {
  if (db) try { const d = await getDoc(doc(db, 'productos', id)); if (d.exists()) return { id: d.id, ...d.data() }; } catch {}
  return window.C3D_PRODUCTOS.find(p => p.id === id) || null;
}

// ---------- Pedidos ----------
async function guardarPedido(pedido) {
  if (!db) sinConfig();
  const u = await sesionLista;
  if (!u) throw new Error('Inicia sesión para confirmar el pedido.');
  const ref = await addDoc(collection(db, 'pedidos'), { ...pedido, uid: u.uid, correo: u.email, estado: 'Recibido', creado: serverTimestamp() });
  return ref.id;
}
async function misPedidos() {
  const u = await sesionLista;
  if (!db || !u) return [];
  const snap = await getDocs(query(collection(db, 'pedidos'), where('uid', '==', u.uid)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.fecha - a.fecha); // sin índice compuesto
}

// ---------- Carga del catálogo (sembrar.html) ----------
async function sembrar() {
  if (!db) sinConfig();
  const u = await sesionLista;
  if (!u) throw new Error('Inicia sesión con el correo de administrador.');
  // Quién es administrador lo deciden las reglas de Firestore (firestore.rules)
  const lote = writeBatch(db);
  window.C3D_PRODUCTOS.forEach(({ id, ...datos }) => lote.set(doc(db, 'productos', id), datos));
  try { await lote.commit(); } catch (e) { throw e.code === 'permission-denied' ? new Error('Tu correo no es administrador (revisa las reglas).') : e; }
  return window.C3D_PRODUCTOS.length;
}

window.C3D = { configurado, sesionLista, cargarProductos, cargarProducto, guardarPedido, misPedidos, sembrar };
window.dispatchEvent(new Event('c3d-listo'));

// ---------- Página de inicio de sesión ----------
if (pagina === 'login.html') {
  const sig = new URLSearchParams(location.search).get('next');
  const destino = sig && /^[\w-]+\.html$/.test(sig) ? sig : 'index.html'; // solo páginas propias
  const error = $('#login-error');
  const mostrar = msg => { error.textContent = msg; error.hidden = !msg; };
  const MENSAJES = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'No hay una cuenta con ese correo. Usa "Crear cuenta".',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'Revisa cómo escribiste el correo.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
    'auth/configuration-not-found': 'El inicio de sesión aún no está activado en Firebase (Authentication › Método de acceso).',
    'auth/operation-not-allowed': 'Ese método de inicio de sesión no está activado en Firebase.',
    'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  };
  const intentar = async fn => {
    mostrar('');
    try { if (!auth) sinConfig(); await fn(); location.href = destino; }
    catch (e) { mostrar(MENSAJES[e.code] || e.message); }
  };
  $('#para-comprar').hidden = !sig;
  const datos = () => [$('#correo').value.trim(), $('#clave').value];
  let creando = false;
  $('#modo').onclick = () => {
    creando = !creando;
    $('#btn-entrar').textContent = creando ? 'Crear cuenta' : 'Iniciar sesión';
    $('#modo').textContent = creando ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una';
    $('#clave').autocomplete = creando ? 'new-password' : 'current-password';
  };
  $('#form-correo').addEventListener('submit', e => {
    e.preventDefault();
    intentar(() => (creando ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, ...datos()));
  });
  $('#btn-google').onclick = () => intentar(() => signInWithPopup(auth, new GoogleAuthProvider()));
  $('#olvide').onclick = async () => {
    const correo = $('#correo').value.trim();
    if (!correo) return mostrar('Escribe tu correo y vuelve a pulsar "Olvidé mi contraseña".');
    try { if (!auth) sinConfig(); await sendPasswordResetEmail(auth, correo); mostrar('Te enviamos un correo para cambiar la contraseña.'); }
    catch (e) { mostrar(MENSAJES[e.code] || e.message); }
  };
  $('#salir').onclick = () => signOut(auth).then(() => location.reload());
  sesionLista.then(u => {
    if (!u) return;
    $('#entrar').hidden = true; $('#sesion').hidden = false;
    $('#titulo').textContent = 'Mi cuenta'; $('#quien').textContent = u.email;
  });
}
