// Funcionalidad del mapa
document.getElementById('v2-btn-mapa').addEventListener('click', () => {
    const iframe = document.getElementById('v2-iframe-mapa');
    if (!navigator.geolocation) {
        alert('Tu navegador no soporta geolocalización.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lng = pos.coords.longitude.toFixed(6);
            const url = 'https://www.google.com/maps?q=' + lat + ',' + lng + '&z=14&output=embed';
            iframe.src = url;
        },
        (err) => {
            alert('No pude obtener tu ubicación (permiso denegado o error).');
        }
    );
});