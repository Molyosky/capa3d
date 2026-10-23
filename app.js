// Carrito y datos de compra compartidos entre páginas (se guardan en localStorage del navegador)
(() => {
  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const dinero = n => '$ ' + n.toFixed(2).replace('.', ',');
  const numero = txt => parseFloat(txt.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const pagina = location.pathname.split('/').pop() || 'index.html';

  let carrito = leer('c3d-carrito', []);
  const totales = () => {
    const unidades = carrito.reduce((s, i) => s + i.cant, 0);
    const subtotal = carrito.reduce((s, i) => s + i.cant * i.precio, 0);
    const envio = subtotal === 0 || subtotal >= 30 ? 0 : 3.5; // envío gratis desde $30
    return { unidades, subtotal, envio, total: subtotal + envio };
  };
  const pintarResumen = () => {
    const t = totales();
    $$('.count').forEach(el => el.textContent = t.unidades);
    // Solo el resumen del carrito y del checkout (no el del pedido ya hecho en seguimiento)
    $$('#res + dl dt, #ped + dl dt').forEach(dt => {
      const v = { 'Subtotal': t.subtotal, 'Envío': t.envio, 'Total': t.total }[dt.textContent];
      if (v !== undefined) dt.nextElementSibling.textContent = dinero(v);
    });
    const monto = $('#banco .strong dd'); if (monto) monto.textContent = dinero(t.total);
  };
  const guardarCarrito = () => { guardar('c3d-carrito', carrito); pintarResumen(); };
  const MAX = 10, avisoMax = `Llegaste al máximo de ${MAX} unidades por producto.`;

  // ---------- Cuenta con Google o correo (prototipo: solo se guarda el correo, nunca la contraseña) ----------
  const cuenta = leer('c3d-cuenta', null);
  const puedeComprar = () => !!cuenta;
  if (cuenta) $$('.nav a[href="login.html"]').forEach(a => a.textContent = 'Mi cuenta');
  if (pagina === 'login.html') {
    const sig = new URLSearchParams(location.search).get('next');
    const destino = sig && /^[\w-]+\.html$/.test(sig) ? sig : 'index.html'; // solo páginas propias
    const entrar = datos => { guardar('c3d-cuenta', datos); location.href = destino; };
    $('#para-comprar').hidden = !sig;
    if (cuenta) {
      $('#entrar').hidden = true; $('#sesion').hidden = false;
      $('#titulo').textContent = 'Mi cuenta'; $('#quien').textContent = cuenta.correo;
    }
    $('#form-correo').addEventListener('submit', e => { e.preventDefault(); entrar({ correo: $('#correo').value.trim() }); });
    // shortcut: Google simulado (prototipo sin servidor); con backend se usaría Google Identity Services
    $('#btn-google').onclick = () => aviso({
      titulo: 'Inicio con Google (prototipo)', // título verde, igual que en Figma (OV4)
      texto: 'Esto es un prototipo: no se conecta con Google de verdad. Al continuar, se simula que iniciaste sesión.',
      botones: [['Cancelar', 'btn-dashed'], ['Continuar', 'btn-primary', () => entrar({ correo: 'Cuenta de Google' })]],
    });
    $('#salir').onclick = () => { localStorage.removeItem('c3d-cuenta'); location.reload(); };
  }

  // Aviso (toast) o diálogo modal hecho con <dialog>
  function aviso({ titulo, texto, botones, modal }) {
    const d = document.createElement('dialog');
    d.className = 'toast' + (modal ? ' modal' : '');
    if (modal) { d.setAttribute('role', 'alertdialog'); d.setAttribute('aria-labelledby', 'dlg-t'); }
    d.innerHTML = (titulo ? `<p class="title ${modal ? '' : 'ok'}" id="dlg-t">${titulo}</p>` : '') + '<p></p><div class="actions"></div>';
    d.querySelector('p:not(.title)').textContent = texto;
    botones.forEach(([txt, clase, accion]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ' + clase; b.textContent = txt;
      b.onclick = () => { d.close(); accion && accion(); };
      d.querySelector('.actions').append(b);
    });
    d.addEventListener('close', () => d.remove());
    $$('dialog.toast').forEach(o => o.close());
    document.body.append(d);
    d.showModal(); // siempre en el centro, sobre un fondo oscuro
    d.querySelector('.btn-primary')?.focus();
    return d;
  }

  // ---------- Catálogo: ordenar ----------
  const orden = $('#orden');
  if (orden) {
    const grid = $('#grid'), original = $$('.product-card');
    orden.addEventListener('change', () => {
      const precio = el => numero(el.querySelector('.price').textContent);
      const lista = [...original];
      if (orden.value === 'Menor precio') lista.sort((a, b) => precio(a) - precio(b));
      if (orden.value === 'Mayor precio') lista.sort((a, b) => precio(b) - precio(a));
      grid.append(...lista);
    });
  }

  // ---------- Detalle: agregar al carrito ----------
  const opciones = $('form.options');
  if (opciones) {
    // Máximo 10: el aviso sale apenas se llega a 10 y el + se desactiva
    const ayuda = $('#cant-ayuda'), textoAyuda = ayuda.textContent;
    $('.options .qty').addEventListener('click', () => {
      const lleno = +$('#cant').textContent >= MAX;
      ayuda.textContent = lleno ? avisoMax : textoAyuda;
      ayuda.classList.toggle('error', lleno);
      $('#mas').setAttribute('aria-disabled', lleno);
    });
  }
  if (opciones) opciones.addEventListener('submit', e => {
    e.preventDefault();
    const elegidas = $$('form.options input[type=radio]:checked').map(r => r.value);
    // "(+$2, …)" o "(−$3)" en el texto de la opción cambia el precio
    const extra = elegidas.reduce((s, v) => { const m = v.match(/([+−-])\$(\d+)/); return m ? s + (m[1] === '+' ? 1 : -1) * +m[2] : s; }, 0);
    const item = {
      nombre: $('.options h1').textContent,
      img: $('.thumb')?.dataset.src || '',
      opciones: elegidas.map(v => v.replace(/\s*\(.*\)$/, '')).join(' · '),
      precio: numero($('.options .price').textContent) + extra,
      cant: +$('#cant').textContent,
    };
    const igual = carrito.find(i => i.nombre === item.nombre && i.opciones === item.opciones);
    const tope = igual && igual.cant + item.cant > MAX;
    if (igual) igual.cant = Math.min(MAX, igual.cant + item.cant); else carrito.push(item);
    guardarCarrito();
    aviso({
      titulo: '✓ Agregado al carrito',
      texto: `${item.cant} × ${item.nombre} (${item.opciones}) — ${dinero(item.precio * item.cant)}` +
        (tope ? `. Ya tenías este producto: quedaron ${MAX} en el carrito, que es el máximo.` : ''),
      // Los dos "Seguir viendo" llevan al mismo lugar: el catálogo con todos los productos
      botones: [['Seguir viendo', 'btn-dashed', () => location.href = $('#seguir').href], ['Ver carrito', 'btn-primary', () => location.href = 'carrito.html']],
    });
  });

  // ---------- Carrito ----------
  if (pagina === 'carrito.html') {
    const lista = $('.main-col'), vacio = lista.innerHTML, seguir = $('.side-col .btn');
    // Antes del envío hay que iniciar sesión (Google o correo)
    seguir.onclick = () => location.href = puedeComprar() ? 'checkout-1-envio.html' : 'login.html?next=checkout-1-envio.html';
    const pintar = () => {
      seguir.disabled = !carrito.length;
      if (!carrito.length) { lista.innerHTML = vacio; return; }
      lista.innerHTML = '';
      carrito.forEach((i, n) => {
        const fila = document.createElement('article');
        fila.className = 'cart-item';
        fila.innerHTML = `<img alt=""><div class="info"><h3></h3><p class="muted"></p><p class="price"></p></div>
          <div class="cant"><div class="qty" role="group"><button type="button" class="btn" aria-label="Quitar una unidad">−</button><output aria-live="polite"></output><button type="button" class="btn" aria-label="Agregar una unidad">+</button></div>
          <p class="muted cant-ayuda" aria-live="polite">Entre 1 y ${MAX} unidades.</p></div>
          <button type="button" class="btn btn-dashed">Eliminar</button>`;
        fila.querySelector('img').src = i.img;
        fila.querySelector('h3').textContent = i.nombre;
        fila.querySelector('.muted').textContent = i.opciones + ' · ' + dinero(i.precio) + ' c/u';
        fila.querySelector('.price').textContent = dinero(i.precio * i.cant);
        fila.querySelector('output').textContent = i.cant;
        fila.querySelector('.qty').setAttribute('aria-label', 'Cantidad de ' + i.nombre);
        const [menos, mas, quitar] = fila.querySelectorAll('button');
        quitar.setAttribute('aria-label', 'Eliminar ' + i.nombre);
        menos.onclick = () => { i.cant = Math.max(1, i.cant - 1); guardarCarrito(); pintar(); };
        // Máximo 10: el aviso sale apenas se llega a 10 y el + se desactiva
        if (i.cant >= MAX) {
          const ayuda = fila.querySelector('.cant-ayuda'); ayuda.textContent = avisoMax; ayuda.classList.add('error');
          mas.setAttribute('aria-disabled', 'true');
        }
        mas.onclick = () => { if (i.cant < MAX) { i.cant++; guardarCarrito(); pintar(); } };
        quitar.onclick = () => {
          carrito.splice(n, 1); guardarCarrito(); pintar();
          aviso({ texto: `Eliminaste ${i.nombre} del carrito.`, botones: [['Cerrar', 'btn-dashed'], ['Deshacer', 'btn-primary', () => { carrito.splice(n, 0, i); guardarCarrito(); pintar(); }]] });
        };
        lista.append(fila);
      });
    };
    pintar();
  }

  // ---------- Checkout ----------
  if (pagina.startsWith('checkout-') && !carrito.length) location.replace('carrito.html');
  else if (pagina.startsWith('checkout-') && !puedeComprar()) location.replace('login.html?next=' + pagina);
  const envio = leer('c3d-envio', {}), pago = leer('c3d-pago', { metodo: 'transferencia', comp: '' });
  const campos = ['nombre', 'cel', 'ciudad', 'dir'];

  if (pagina === 'checkout-1-envio.html') {
    campos.forEach(id => { if (envio[id]) $('#' + id).value = envio[id]; });
    $('form.main-col').addEventListener('submit', () => {
      guardar('c3d-envio', Object.fromEntries(campos.map(id => [id, $('#' + id).value.trim()])));
    });
  }

  if (pagina === 'checkout-2-pago.html') {
    const radios = $$('input[name=pago]'), comp = $('#comp'), banco = $('#banco');
    const contra = radios.find(r => r.value === 'contra-entrega');
    if (envio.ciudad && envio.ciudad !== 'Quito') { contra.disabled = true; if (pago.metodo === 'contra-entrega') pago.metodo = 'transferencia'; }
    radios.forEach(r => r.checked = r.value === pago.metodo);
    comp.value = pago.comp;
    const actualizar = () => { const t = $('input[name=pago]:checked').value === 'transferencia'; banco.hidden = !t; comp.required = t; };
    radios.forEach(r => r.addEventListener('change', actualizar));
    actualizar();
    $('form.main-col').addEventListener('submit', () => {
      const metodo = $('input[name=pago]:checked').value;
      guardar('c3d-pago', { metodo, comp: metodo === 'transferencia' ? comp.value.trim() : '' });
    });
  }

  const nombrePago = m => m === 'contra-entrega' ? 'Pago contra entrega' : 'Transferencia bancaria';
  if (pagina === 'checkout-3-revision.html') {
    const t = totales();
    const datos = { 'Recibe': envio.nombre, 'Celular': envio.cel, 'Ciudad': envio.ciudad, 'Dirección': envio.dir,
      'Pago': nombrePago(pago.metodo), 'Comprobante': pago.comp, 'Unidades': t.unidades, 'Total': dinero(t.total) };
    $$('.main-col dt').forEach(dt => { if (dt.textContent in datos) dt.nextElementSibling.textContent = datos[dt.textContent] || '—'; });
    $('.main-col .btn-primary').addEventListener('click', e => {
      e.preventDefault();
      aviso({
        modal: true, titulo: '¿Confirmar el pago?',
        texto: `Se registrará tu pedido por ${dinero(t.total)} con ${nombrePago(pago.metodo).toLowerCase()}. Podrás cancelarlo mientras no empiece la impresión.`,
        botones: [['Revisar de nuevo', 'btn-dashed'], ['Sí, confirmar', 'btn-primary', () => {
          guardar('c3d-pedido', { numero: 'C3D-' + String(Date.now() % 10000).padStart(4, '0'), fecha: Date.now(), ...t });
          carrito = []; guardarCarrito();
          location.href = 'confirmacion.html';
        }]],
      });
    });
  }

  // ---------- Confirmación y seguimiento: último pedido ----------
  const pedido = leer('c3d-pedido', null);
  if (pedido && (pagina === 'confirmacion.html' || pagina === 'seguimiento.html')) {
    $$('strong, h1').forEach(el => el.textContent = el.textContent.replace('C3D-0142', pedido.numero));
    const vals = { 'Subtotal': pedido.subtotal, 'Envío': pedido.envio, 'Total': pedido.total };
    $$('#det + dl dt').forEach(dt => { if (dt.textContent in vals) dt.nextElementSibling.textContent = dinero(vals[dt.textContent]); });
    const f = new Date(pedido.fecha), when = $('.timeline .when');
    if (when) when.textContent = f.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + f.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }

  pintarResumen();
})();
