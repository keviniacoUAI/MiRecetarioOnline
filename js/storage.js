// Manejo de localStorage y sessionStorage
// Última sección visitada
document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
        sessionStorage.setItem('ultimaSeccion', a.getAttribute('href'));
    });
});

// Saludo personalizado
const saludo = document.getElementById('v2-saludo');
const nombreGuardado = localStorage.getItem('nombreUsuario');
if (nombreGuardado) {
    saludo.textContent = 'Hola ' + nombreGuardado + ' 👋 ¡bienvenido de nuevo!';
}

document.getElementById('v2-contacto').addEventListener('submit', () => {
    const n = document.getElementById('c-nombre').value.trim();
    if (n) localStorage.setItem('nombreUsuario', n);
});