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
- `assets/icons`: favicons (`svg`, `32px`, `192px`, `512px`) y archivo PWA `manifest.webmanifest`.
- `assets/images`: hero SVG optimizado y portada social (`og-cover.png`).

## Desarrollo

1. Abrí `index.html` en tu navegador o servilo con cualquier servidor estático.
2. Los formularios usan `localStorage`/`sessionStorage`, así que probalos en el mismo navegador para conservar datos.
3. Editá los archivos dentro de `css/` y `js/` para ajustar estilos o lógica.
4. Al desplegar, incluí también `manifest.webmanifest`, `assets/icons` y `assets/images`.
5. Ejecutá un validador HTML/CSS (W3C) y Lighthouse para revisar accesibilidad y performance antes de publicar.

## Checklist cubierta

- Metadatos SEO/social completos en todas las páginas.
- Navegación con `header/nav/main/footer`, skip link y foco visible.
- Tablas responsivas con `<thead>/<tbody>` y `data-label` para móviles.
- Formularios con mensajes accesibles (`aria-live`) y almacenamiento local.
- Hoja de estilos externa + fuentes de Google y media queries para móviles.
- JS modular con `defer`, `addEventListener`, `localStorage` y feedback no intrusivo.
- Íconos multi-resolución + `manifest.webmanifest` listo para pruebas PWA.

## Pruebas y validaciones

- [ ] Validar HTML y CSS en https://validator.w3.org/ y https://jigsaw.w3.org/css-validator/.
- [ ] Ejecutar Lighthouse (Chrome DevTools) en modo móvil y desktop.
- [ ] Navegar el sitio en Chrome/Edge/Firefox verificando filtros, formularios y geolocalización del mapa.
- [ ] Sustituir `google-site-verification` por el token real de Search Console una vez desplegado.

## Próximos pasos sugeridos

1. Optimizar o sustituir imágenes por versiones WebP ligeras y actualizar `srcset`.
2. Añadir pruebas manuales/documentadas en distintos navegadores y dispositivos reales.
3. Publicar el sitio y completar la verificación con Google Search Console/Lighthouse.
