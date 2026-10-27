# Capa3D — tienda de impresión 3D (MVP)

Sitio estático (GitHub Pages) con Firebase: inicio de sesión con correo o Google, catálogo y pedidos en Firestore.

## Configurar Firebase (una vez)

1. En https://console.firebase.google.com crea un proyecto y agrega una **app web**. Copia su configuración en `firebase-config.js`.
2. **Authentication › Método de acceso**: activa **Correo electrónico/contraseña** y **Google**.
3. **Authentication › Configuración › Dominios autorizados**: agrega `molyosky.github.io` (y `localhost` para probar).
4. **Firestore Database**: créala en modo producción. En la pestaña **Reglas**, pega `firestore.rules`.
5. En las reglas pegadas en la consola, cambia `TU-CORREO@gmail.com` por tu correo de administrador (el archivo del repo queda con el marcador para no publicar tu correo).
6. Inicia sesión en el sitio con ese correo, abre `sembrar.html` y pulsa **Subir productos**.

Sin configurar Firebase, el catálogo funciona con la lista local de `productos.js`, pero no se puede iniciar sesión ni comprar.

## Datos

| Colección | Contenido |
|---|---|
| `productos` | 30 productos (10 por categoría: Figuras, Macetas, Soporte) |
| `usuarios/{uid}` | correo, nombre, último acceso |
| `pedidos` | ítems, datos de entrega, pago, totales, `estado` (lo cambia el administrador desde la consola) |

## Probar en local

Los módulos ES no cargan desde `file://`; usa un servidor:

```
npx serve .
```
