// Manejo de localStorage y sessionStorage
// Última sección visitada
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        sessionStorage.setItem('ultimaSeccion', link.getAttribute('href'));
    });
});

// Saludo personalizado en la portada
const nombreGuardado = localStorage.getItem('nombreUsuario');
const presentacionTitulo = document.getElementById('presentacion-titulo');

if (presentacionTitulo && nombreGuardado) {
    presentacionTitulo.textContent = 'Hola ' + nombreGuardado + ' 👋 ¡bienvenido de nuevo!';
    presentacionTitulo.classList.add('presentacion__titulo--personalizado');
}

// Guardar el nombre desde el formulario de contacto
const contactoForm = document.getElementById('v2-contacto');
if (contactoForm) {
    contactoForm.addEventListener('submit', () => {
        const nombre = document.getElementById('c-nombre').value.trim();
        if (nombre) {
            localStorage.setItem('nombreUsuario', nombre);
        }
    });
}
