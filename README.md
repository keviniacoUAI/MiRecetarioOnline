# Mi Recetario Online

Sitio estático con recetas caseras simples (saladas, dulces y bebidas), filtros inteligentes y formularios accesibles para compartir contenido con la comunidad.

## Estructura

- `index.html`: portada con filtros, atajos y galería.
- `pages/recetas/*.html`: tablas semánticas para cada categoría.
- `pages/share.html`: formulario para subir recetas de la comunidad.
- `pages/map.html`: mapa embebido con geolocalización.
- `pages/contact.html`: formulario con persistencia local.
- `css/`: estilos base, componentes y formularios.
- `js/`: lógica para filtros, almacenamiento, share y mapa.
- `assets/icons`: favicon PNG centralizado (usado por HTML y manifest) + `manifest.webmanifest`.
- `assets/images`: hero SVG optimizado y portada social (`og-cover.png`).

## Tecnologías utilizadas

- **HTML5 semántico**: estructura clara con secciones accesibles, tablas con `<thead>/<tbody>` y formularios enriquecidos con `aria-live` y etiquetas asociadas.
- **CSS3 (Flexbox + Grid + Media Queries)**: diseño responsivo para la barra principal, secciones de recetas y tarjetas del módulo “Compartí tu receta”, incluyendo estilos específicos para el panel/modal del buscador.
- **JavaScript moderno (ES6+)**: módulos dedicados (`storage.js`, `share.js`, `filter.js`, `map.js`) que emplean `const/let`, funciones flecha, template literals y APIs como `FileReader`, `Geolocation`, `localStorage` y `sessionStorage`.
- **PWA-ready assets**: `manifest.webmanifest` más íconos multi-resolución para integrar con instalables o “Agregar a la pantalla de inicio”, y `theme-color` para browsers móviles.
- **Accesibilidad y UX**: skip link inicial, focos visibles, mensajes de estado con `aria-live`, panel modal con bloqueo de scroll y navegación flotante para recorrer resultados filtrados con teclado.

## Configuración mínima de uso

1. **Requisitos**: navegador moderno (Chrome, Edge, Firefox o Safari) con soporte para Storage APIs y FileReader. No se necesita Node.js ni backend.
2. **Instalación**: cloná el repositorio o descargá el ZIP y descomprimilo. Toda la app vive dentro de `MiRecetarioOnline/`.
3. **Ejecución local**:
   - Abrí `index.html` directamente en el navegador, o
   - Levantá un servidor estático opcional (`npx serve`, `python -m http.server`, “Live Server” en VS Code) apuntando a `MiRecetarioOnline/`.
4. **Permisos**: el módulo de mapa solicita geolocalización; aceptá el permiso para ver restaurantes cercanos. Para restablecer datos almacenados, vaciá `localStorage`/`sessionStorage` desde las DevTools.
5. **Despliegue**: subí todo el contenido de `MiRecetarioOnline/` (incluidos `assets/` y `manifest.webmanifest`) a tu hosting estático. Sustituí el valor de `google-site-verification` por el token real que provea Search Console.
