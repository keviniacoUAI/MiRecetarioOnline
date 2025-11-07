const drop = document.getElementById('v2-drop');
const preview = document.getElementById('v2-preview');
const lista = document.getElementById('v2-recetas-nuevas');
const compartirFeedback = document.getElementById('compartir-feedback');
const formularioCompartir = document.getElementById('v2-compartir');
let v2FotoDataURL = null;

function mostrarFeedback(mensaje, tipo = 'info') {
    if (!compartirFeedback) return;
    compartirFeedback.textContent = mensaje;
    compartirFeedback.classList.remove('is-error', 'is-success');
    if (tipo === 'error') {
        compartirFeedback.classList.add('is-error');
    } else if (tipo === 'success') {
        compartirFeedback.classList.add('is-success');
    }
}

if (drop) {
    drop.addEventListener('dragover', (event) => {
        event.preventDefault();
        drop.classList.add('activa');
    });

    drop.addEventListener('dragleave', () => {
        drop.classList.remove('activa');
    });

    drop.addEventListener('drop', (event) => {
        event.preventDefault();
        drop.classList.remove('activa');

        const archivo = event.dataTransfer.files && event.dataTransfer.files[0];
        if (!archivo) {
            mostrarFeedback('Soltá una imagen JPG o PNG.', 'error');
            return;
        }
        const ok = /\.(jpg|jpeg|png)$/i.test(archivo.name);
        if (!ok) {
            mostrarFeedback('Solo aceptamos imágenes JPG o PNG.', 'error');
            return;
        }

        const lector = new FileReader();
        lector.onload = function() {
            v2FotoDataURL = lector.result;
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = v2FotoDataURL;
            img.alt = 'Foto cargada';
            img.style.maxWidth = '240px';
            img.style.marginTop = '8px';
            preview.appendChild(img);
            mostrarFeedback('Imagen lista. Ahora completá los datos de la receta.');
        };
        lector.readAsDataURL(archivo);
    });
}

const STORAGE_KEY = 'recetasComunidad';

function cargarRecetasGuardadas() {
    if (!lista) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const arr = JSON.parse(raw);
        arr.forEach((receta) => renderReceta(receta));
    } catch (error) {
        console.error('No pude recuperar recetas previas', error);
    }
}

function guardarReceta(receta) {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(receta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function renderReceta(receta) {
    if (!lista) return;
    const li = document.createElement('li');
    li.innerHTML = `<b>${escapar(receta.nombre)}</b> - ${escapar(receta.ingred)} - ${escapar(receta.pasos)} - ${escapar(receta.mins)} min - Veg: ${escapar(receta.veg)}`;
    lista.appendChild(li);
    if (receta.foto) {
        const img = document.createElement('img');
        img.src = receta.foto;
        img.alt = `Foto de ${receta.nombre}`;
        img.style.maxWidth = '240px';
        img.style.display = 'block';
        img.style.margin = '6px 0';
        li.appendChild(img);
    }
}

if (formularioCompartir) {
    formularioCompartir.addEventListener('submit', (event) => {
        event.preventDefault();
        const nuevaReceta = {
            nombre: document.getElementById('cr-nombre').value.trim(),
            ingred: document.getElementById('cr-ingred').value.trim(),
            pasos: document.getElementById('cr-pasos').value.trim(),
            mins: document.getElementById('cr-mins').value.trim(),
            veg: document.getElementById('cr-veg').checked ? 'true' : 'false',
            foto: v2FotoDataURL
        };

        if (!nuevaReceta.nombre || !nuevaReceta.ingred || !nuevaReceta.pasos || !nuevaReceta.mins) {
            mostrarFeedback('Completá todos los campos antes de publicar.', 'error');
            return;
        }

        renderReceta(nuevaReceta);
        guardarReceta(nuevaReceta);

        formularioCompartir.reset();
        v2FotoDataURL = null;
        preview.innerHTML = '';
        mostrarFeedback('¡Gracias! Publicamos tu receta en la lista.', 'success');
    });
}

function escapar(texto) {
    return (texto || '').toString().replace(/[&<>"']/g, (match) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]
    ));
}

window.addEventListener('load', cargarRecetasGuardadas);
