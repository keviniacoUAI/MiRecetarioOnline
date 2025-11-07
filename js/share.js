const drop = document.getElementById('v2-drop');
const preview = document.getElementById('v2-preview');
const grid = document.getElementById('v2-recetas-nuevas');
const mensajeVacio = document.getElementById('recetas-empty');
const compartirFeedback = document.getElementById('compartir-feedback');
const formularioCompartir = document.getElementById('v2-compartir');
let v2FotoDataURL = null;

const STORAGE_KEY = 'recetasComunidad';

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

function actualizarEstadoLista() {
    if (!mensajeVacio) return;
    const hayRecetas = grid && grid.childElementCount > 0;
    mensajeVacio.hidden = hayRecetas;
}

function obtenerListaIngredientes(texto) {
    return (texto || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8);
}

function formatearFecha(fechaISO) {
    try {
        return new Date(fechaISO).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (_) {
        return fechaISO;
    }
}

function normalizarReceta(data) {
    return {
        id: data.id ?? Date.now(),
        nombre: data.nombre,
        ingred: data.ingred,
        pasos: data.pasos,
        mins: Number(data.mins) || 0,
        veg: data.veg === true || data.veg === 'true',
        foto: data.foto || null,
        fecha: data.fecha || new Date().toISOString()
    };
}

function renderReceta(receta, { prepend = false } = {}) {
    if (!grid) return;
    const datos = normalizarReceta(receta);

    const card = document.createElement('article');
    card.className = 'receta-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = datos.id;

    if (datos.foto) {
        const media = document.createElement('div');
        media.className = 'receta-card__media';
        const img = document.createElement('img');
        img.src = datos.foto;
        img.alt = `Foto de ${datos.nombre}`;
        media.appendChild(img);
        card.appendChild(media);
    }

    const body = document.createElement('div');
    body.className = 'receta-card__body';

    const title = document.createElement('h5');
    title.className = 'receta-card__title';
    title.textContent = datos.nombre;
    body.appendChild(title);

    const tags = document.createElement('div');
    tags.className = 'receta-card__tags';
    const tiempoTag = document.createElement('span');
    tiempoTag.className = 'receta-card__tag';
    tiempoTag.textContent = `${datos.mins || 0} min`;
    tags.appendChild(tiempoTag);

    if (datos.veg) {
        const vegTag = document.createElement('span');
        vegTag.className = 'receta-card__tag receta-card__tag--veg';
        vegTag.textContent = 'Veg';
        tags.appendChild(vegTag);
    }
    body.appendChild(tags);

    const ingredientes = obtenerListaIngredientes(datos.ingred);
    if (ingredientes.length) {
        const listaIngredientes = document.createElement('ul');
        listaIngredientes.className = 'receta-card__ingredientes';
        ingredientes.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            listaIngredientes.appendChild(li);
        });
        body.appendChild(listaIngredientes);
    }

    if (datos.pasos) {
        const pasos = document.createElement('p');
        pasos.className = 'receta-card__pasos';
        pasos.textContent = datos.pasos;
        body.appendChild(pasos);
    }

    const footer = document.createElement('p');
    footer.className = 'receta-card__footer';
    footer.textContent = `Publicada el ${formatearFecha(datos.fecha)}`;
    body.appendChild(footer);

    card.appendChild(body);

    if (prepend && grid.firstChild) {
        grid.prepend(card);
    } else if (prepend) {
        grid.appendChild(card);
    } else {
        grid.appendChild(card);
    }

    actualizarEstadoLista();
}

function cargarRecetasGuardadas() {
    if (!grid) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        actualizarEstadoLista();
        return;
    }

    try {
        const arr = JSON.parse(raw)
            .map(normalizarReceta)
            .sort((a, b) => b.id - a.id);
        arr.forEach((receta) => renderReceta(receta));
    } catch (error) {
        console.error('No pude recuperar recetas previas', error);
    } finally {
        actualizarEstadoLista();
    }
}

function guardarReceta(receta) {
    const nuevaReceta = normalizarReceta(receta);
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(nuevaReceta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    return nuevaReceta;
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

if (formularioCompartir) {
    formularioCompartir.addEventListener('submit', (event) => {
        event.preventDefault();
        const nuevaReceta = {
            nombre: document.getElementById('cr-nombre').value.trim(),
            ingred: document.getElementById('cr-ingred').value.trim(),
            pasos: document.getElementById('cr-pasos').value.trim(),
            mins: document.getElementById('cr-mins').value.trim(),
            veg: document.getElementById('cr-veg').checked,
            foto: v2FotoDataURL
        };

        if (!nuevaReceta.nombre || !nuevaReceta.ingred || !nuevaReceta.pasos || !nuevaReceta.mins) {
            mostrarFeedback('Completá todos los campos antes de publicar.', 'error');
            return;
        }

        const recetaGuardada = guardarReceta(nuevaReceta);
        renderReceta(recetaGuardada, { prepend: true });

        formularioCompartir.reset();
        v2FotoDataURL = null;
        preview.innerHTML = '';
        mostrarFeedback('¡Gracias! Publicamos tu receta en la lista.', 'success');
        document.getElementById('cr-nombre').focus();
    });
}

window.addEventListener('load', cargarRecetasGuardadas);
