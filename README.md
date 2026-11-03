# Capa3D — tienda de impresión 3D (MVP)

Sitio estático (GitHub Pages) con Firebase: inicio de sesión con correo o Google, catálogo y pedidos en Firestore.

## Datos

| Colección | Contenido |
|---|---|
| `productos` | 30 productos (10 por categoría: Figuras, Macetas, Soporte) |
| `usuarios/{uid}` | correo, nombre, último acceso |
| `pedidos` | ítems, datos de entrega, pago, totales, `estado` (lo cambia el administrador desde la consola) |



```
npx serve .
```
