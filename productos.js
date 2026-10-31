// Catálogo base: 10 productos por categoría. sembrar.html lo sube a Firestore (colección "productos");
// si Firestore no responde o está vacío, el sitio usa esta misma lista.
const MATERIALES = ['PLA (estándar)', 'PETG (+$2, más resistente)'];
const TAMANOS = ['Pequeño 10 cm (−$3)', 'Mediano 20 cm', 'Grande 30 cm (+$6)'];
const p = (id, nombre, cat, precio, dias, desc, colores, fotos = [], extra = {}) =>
  ({ id, nombre, cat, precio, dias, desc, colores, fotos: fotos.length ? fotos : [`img/${id}.jpg`], materiales: MATERIALES, tamanos: TAMANOS, ...extra });
const vistas = base => [1, 2, 3, 4].map(n => `img/${base}-${n}.png`);

window.C3D_PRODUCTOS = [
  // Figuras
  p('dragon-articulado', 'Dragón articulado', 'Figuras', 12, 2, 'Figura con piezas móviles impresa en una sola pieza. Ideal para escritorio o regalo.', ['Gris', 'Negro', 'Blanco', 'Rojo'], vistas('dragon')),
  p('busto-decorativo', 'Busto decorativo', 'Figuras', 18, 3, 'Busto de estilo clásico con acabado lijado, ideal para estanterías.', ['Gris', 'Negro', 'Blanco', 'Rojo'], vistas('busto')),
  p('pulpo-flexible', 'Pulpo flexible', 'Figuras', 7, 1, 'Pulpo con tentáculos articulados, antiestrés y apto para niños mayores de 6 años.', ['Morado', 'Turquesa', 'Rosa', 'Naranja']),
  p('astronauta-sentado', 'Astronauta sentado', 'Figuras', 10, 2, 'Astronauta que se sienta al borde de repisas y monitores.', ['Blanco', 'Gris', 'Negro']),
  p('gato-geometrico', 'Gato geométrico', 'Figuras', 9, 1, 'Gato de estilo low-poly con caras planas. Decoración minimalista.', ['Blanco', 'Negro', 'Gris', 'Turquesa']),
  p('caballero-ajedrez', 'Set caballeros de ajedrez', 'Figuras', 15, 3, 'Dos caballos de ajedrez a escala grande, uno claro y uno oscuro.', ['Blanco y negro', 'Gris y rojo']),
  p('calavera-mexicana', 'Calavera decorativa', 'Figuras', 11, 2, 'Calavera con relieves florales, pensada para pintar a mano.', ['Blanco', 'Gris', 'Negro']),
  p('robot-retro', 'Robot retro', 'Figuras', 13, 2, 'Robot de juguete estilo años 50 con brazos que giran.', ['Gris', 'Rojo', 'Turquesa']),
  p('buho-lector', 'Búho lector', 'Figuras', 8, 1, 'Búho con libro abierto, sujetalibros o figura de escritorio.', ['Gris', 'Blanco', 'Negro']),
  p('dinosaurio-rex', 'Dinosaurio T-Rex', 'Figuras', 14, 2, 'T-Rex con mandíbula móvil y base estable.', ['Verde', 'Gris', 'Naranja', 'Negro']),
  // Macetas
  p('maceta-geometrica', 'Maceta geométrica', 'Macetas', 8, 1, 'Maceta decorativa de caras triangulares con orificio de drenaje.', ['Blanco', 'Negro', 'Gris', 'Rojo'], vistas('maceta').filter(f => !f.endsWith('-2.png'))),
  p('maceta-autorriego', 'Maceta con autorriego', 'Macetas', 12, 2, 'Dos piezas con depósito de agua y mecha; riega sola hasta por una semana.', ['Blanco', 'Turquesa', 'Gris']),
  p('maceta-cara', 'Maceta cara serena', 'Macetas', 10, 1, 'Rostro de ojos cerrados; las plantas hacen de cabello.', ['Blanco', 'Gris', 'Rosa']),
  p('maceta-colgante', 'Maceta colgante', 'Macetas', 9, 1, 'Maceta con tres puntos de anclaje para colgar con cuerda.', ['Blanco', 'Negro', 'Verde']),
  p('maceta-espiral', 'Maceta espiral', 'Macetas', 9, 1, 'Paredes con giro en espiral; modo jarrón, muy liviana.', ['Blanco', 'Turquesa', 'Naranja', 'Gris']),
  p('mini-macetas-suculentas', 'Set 3 mini macetas', 'Macetas', 7, 1, 'Tres macetas pequeñas para suculentas y cactus.', ['Blanco', 'Gris', 'Rosa', 'Verde']),
  p('maceta-gato', 'Maceta gato', 'Macetas', 11, 2, 'Maceta con forma de gato sentado y orejas puntiagudas.', ['Blanco', 'Negro', 'Gris']),
  p('maceta-hexagonal', 'Maceta hexagonal de pared', 'Macetas', 8, 1, 'Se monta en la pared con un tornillo y se combina en panal.', ['Blanco', 'Negro', 'Naranja']),
  p('maceta-ondas', 'Maceta ondas', 'Macetas', 10, 1, 'Textura ondulada vertical con plato incluido.', ['Blanco', 'Gris', 'Turquesa']),
  p('maceta-escritorio', 'Maceta organizador', 'Macetas', 13, 2, 'Maceta pequeña con compartimientos para lápices y clips.', ['Blanco', 'Negro', 'Verde']),
  // Soporte
  p('soporte-celular', 'Soporte para celular', 'Soporte', 6, 1, 'Soporte inclinado a 60° para celulares de hasta 7 pulgadas.', ['Turquesa', 'Negro', 'Blanco', 'Rojo'], vistas('celular')),
  p('mini-soporte-laptop', 'Mini soporte de laptop', 'Soporte', 18, 1, 'Soporte plegable impreso en PETG-CF (PETG con fibra de carbono): rígido, liviano y resistente al calor. Eleva tu laptop de 10,5 pulgadas hasta 18 pulgadas.', ['Negro'], vistas('laptop'), { materiales: ['PETG-CF (PETG con fibra de carbono)'], tamanos: [] }),
  p('soporte-audifonos', 'Soporte para audífonos', 'Soporte', 10, 1, 'Base pesada con gancho curvo para audífonos de diadema.', ['Negro', 'Blanco', 'Gris']),
  p('soporte-tablet', 'Soporte para tablet', 'Soporte', 9, 1, 'Dos ángulos de lectura para tablets de hasta 13 pulgadas.', ['Negro', 'Blanco', 'Turquesa']),
  p('soporte-control', 'Soporte para control de consola', 'Soporte', 7, 1, 'Sostiene dos controles de forma vertical.', ['Negro', 'Blanco', 'Rojo']),
  p('soporte-monitor', 'Elevador de monitor', 'Soporte', 20, 3, 'Patas modulares que se unen a una tabla para elevar el monitor 10 cm.', ['Negro', 'Gris'], [], { tamanos: [] }),
  p('soporte-cables', 'Organizador de cables', 'Soporte', 5, 1, 'Clip adhesivo de cinco ranuras para el borde del escritorio.', ['Negro', 'Blanco', 'Gris']),
  p('soporte-reloj', 'Base para reloj inteligente', 'Soporte', 6, 1, 'Base con canal para el cable de carga del reloj.', ['Negro', 'Blanco']),
  p('soporte-libro', 'Atril para libros', 'Soporte', 11, 2, 'Atril plegable con pestañas que sujetan las páginas.', ['Blanco', 'Negro', 'Turquesa']),
  p('soporte-gafas', 'Soporte para gafas', 'Soporte', 6, 1, 'Nariz estilizada que sostiene un par de gafas.', ['Negro', 'Blanco', 'Rojo']),
];

// Imagen de relleno (SVG) para productos sin fotos todavía
window.C3D_FOTO = (prod, n = 0) => prod.fotos?.[n] || 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e8ecea"/>` +
  `<path d="M170 110l30-18 30 18v36l-30 18-30-18z" fill="none" stroke="#7a8a84" stroke-width="4"/>` +
  `<text x="200" y="215" font-family="Inter,sans-serif" font-size="20" text-anchor="middle" fill="#4a5a54">${prod.nombre.replace(/[<&]/g, '')}</text></svg>`);
