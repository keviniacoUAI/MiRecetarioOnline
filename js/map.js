const mapButton = document.getElementById('v2-btn-mapa');
const mapaIframe = document.getElementById('v2-iframe-mapa');
const mapFeedback = document.getElementById('map-feedback');

function actualizarFeedback(mensaje, tipo = 'info') {
    if (!mapFeedback) return;
    mapFeedback.textContent = mensaje;
    mapFeedback.classList.remove('is-error', 'is-success');
    if (tipo === 'error') {
        mapFeedback.classList.add('is-error');
    } else if (tipo === 'success') {
        mapFeedback.classList.add('is-success');
    }
}

if (mapButton && mapaIframe) {
    mapButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            actualizarFeedback('Tu navegador no soporta geolocalización.', 'error');
            return;
        }

        actualizarFeedback('Buscando tu ubicación para mostrar restaurantes cercanos...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const query = encodeURIComponent(`restaurantes cerca de ${lat},${lng}`);
                const url = `https://www.google.com/maps?q=${query}&z=14&output=embed`;
                mapaIframe.src = url;
                actualizarFeedback('Listo. Mostramos resultados de tu zona.', 'success');
            },
            () => {
                actualizarFeedback('No pudimos obtener tu ubicación. Revisá los permisos del navegador.', 'error');
            }
        );
    });
}
