// Manejo de localStorage y sessionStorage
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        sessionStorage.setItem('ultimaSeccion', link.getAttribute('href'));
    });
});

const nombreGuardado = localStorage.getItem('nombreUsuario');
const presentacionTitulo = document.getElementById('presentacion-titulo');

if (presentacionTitulo && nombreGuardado) {
    presentacionTitulo.textContent = `Hola ${nombreGuardado}, ¡bienvenido de nuevo!`;
    presentacionTitulo.classList.add('presentacion__titulo--personalizado');
}

const CONTACTO_STORAGE_KEY = 'contactoMensajes';

function obtenerMensajesContacto() {
    try {
        const datos = localStorage.getItem(CONTACTO_STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error('No pude leer los mensajes de contacto guardados:', error);
        return [];
    }
}

function guardarMensajesContacto(mensajes) {
    localStorage.setItem(CONTACTO_STORAGE_KEY, JSON.stringify(mensajes));
}

function renderizarMensajesContacto(listaElemento, historialSeccion, mensajes) {
    if (!listaElemento || !historialSeccion) return;

    listaElemento.innerHTML = '';

    if (!mensajes.length) {
        historialSeccion.hidden = true;
        return;
    }

    historialSeccion.hidden = false;

    mensajes.forEach((mensaje) => {
        const item = document.createElement('li');

        const titulo = document.createElement('strong');
        titulo.textContent = `${mensaje.nombre} (${mensaje.email})`;

        const fecha = document.createElement('small');
        try {
            fecha.textContent = new Date(mensaje.fecha).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });
        } catch (error) {
            fecha.textContent = mensaje.fecha;
        }

        const detalle = document.createElement('p');
        detalle.textContent = mensaje.descripcion;

        item.appendChild(titulo);
        item.appendChild(fecha);
        item.appendChild(detalle);
        listaElemento.appendChild(item);
    });
}

const contactoForm = document.getElementById('v2-contacto');
if (contactoForm) {
    const feedback = document.getElementById('contacto-feedback');
    const listaMensajes = document.getElementById('contacto-lista');
    const historialSeccion = document.getElementById('contacto-historial');

    let mensajes = obtenerMensajesContacto();
    renderizarMensajesContacto(listaMensajes, historialSeccion, mensajes);

    contactoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nombre = document.getElementById('c-nombre').value.trim();
        const email = document.getElementById('c-email').value.trim();
        const descripcion = document.getElementById('c-desc').value.trim();

        if (!nombre || !email || !descripcion) {
            if (feedback) {
                feedback.textContent = 'Por favor completá todos los campos antes de enviar.';
                feedback.style.color = '#cc5c3b';
            }
            return;
        }

        const nuevoMensaje = {
            id: Date.now(),
            nombre,
            email,
            descripcion,
            fecha: new Date().toISOString()
        };

        mensajes.unshift(nuevoMensaje);
        guardarMensajesContacto(mensajes);
        renderizarMensajesContacto(listaMensajes, historialSeccion, mensajes);

        localStorage.setItem('nombreUsuario', nombre);

        contactoForm.reset();
        document.getElementById('c-nombre').focus();

        if (feedback) {
            feedback.textContent = '¡Gracias! Recibimos tu mensaje.';
            feedback.style.color = '#2f7a3d';
        }
    });
}
