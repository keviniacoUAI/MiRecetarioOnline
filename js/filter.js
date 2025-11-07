const filtroFeedback = document.getElementById('filtro-feedback');
const FILTER_SESSION_KEY = 'filtro';
let panelResultados = null;
let escapeListenerRegistrado = false;

function obtenerRecetasDePagina() {
    const recetas = [];
    const filas = document.querySelectorAll('table tr[data-mins]');
    const paginaActual = window.location.pathname;

    filas.forEach((tr) => {
        const celdas = tr.querySelectorAll('td');
        if (celdas.length >= 3) {
            recetas.push({
                nombre: celdas[0].textContent.trim(),
                ingredientes: celdas[1].textContent.trim(),
                pasos: celdas[2].textContent.trim(),
                minutos: parseInt(tr.getAttribute('data-mins'), 10),
                vegetariana: tr.getAttribute('data-veg') === 'true',
                pagina: paginaActual
            });
        }
    });

    return recetas;
}

function sincronizarRecetas() {
    const recetasActuales = obtenerRecetasDePagina();
    let todasLasRecetas = [];

    try {
        const recetasGuardadas = localStorage.getItem('todasLasRecetas');
        if (recetasGuardadas) {
            todasLasRecetas = JSON.parse(recetasGuardadas);
        }
    } catch (error) {
        console.error('Error al cargar recetas guardadas:', error);
    }

    if (recetasActuales.length > 0) {
        todasLasRecetas = todasLasRecetas.filter((receta) => receta.pagina !== window.location.pathname);
        todasLasRecetas.push(...recetasActuales);
        localStorage.setItem('todasLasRecetas', JSON.stringify(todasLasRecetas));
    }

    return todasLasRecetas;
}

function guardarFiltroEstado(coincidencias, criterios) {
    const estado = {
        coincidencias,
        criterios,
        indiceActual: 0
    };
    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(estado));
    return estado;
}

function obtenerFiltroGuardado() {
    const raw = sessionStorage.getItem(FILTER_SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('No pude leer el estado del filtro:', error);
        return null;
    }
}

function mostrarPanelResultados(matches) {
    if (!matches.length) return;
    panelResultados = panelResultados || crearPanelResultados();

    const list = panelResultados.querySelector('.filtro-panel__list');
    list.innerHTML = '';
    matches.forEach((match, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'filtro-panel__item';
        const descripcion = document.createElement('div');
        descripcion.innerHTML = `<strong>${match.nombre}</strong>
            <span class="filtro-panel__meta">${obtenerNombreCategoria(match.pagina)} · ${match.minutos} min${match.vegetariana ? ' · Veg' : ''}</span>`;
        item.appendChild(descripcion);
        item.addEventListener('click', () => irAResultado(index));
        list.appendChild(item);
    });

    const contador = panelResultados.querySelector('[data-result-count]');
    const total = matches.length;
    contador.textContent = `${total} coincidencia${total !== 1 ? 's' : ''}`;

    panelResultados.classList.add('is-visible');
    document.body.classList.add('dialog-open');
    panelResultados.querySelector('.filtro-panel__content').focus();

    if (!escapeListenerRegistrado) {
        document.addEventListener('keydown', manejarEscapePanel, true);
        escapeListenerRegistrado = true;
    }
}

function cerrarPanelResultados() {
    if (!panelResultados) return;
    panelResultados.classList.remove('is-visible');
    document.body.classList.remove('dialog-open');
    if (escapeListenerRegistrado) {
        document.removeEventListener('keydown', manejarEscapePanel, true);
        escapeListenerRegistrado = false;
    }
}

function manejarEscapePanel(event) {
    if (event.key === 'Escape') {
        event.stopPropagation();
        cerrarPanelResultados();
    }
}

function crearPanelResultados() {
    const overlay = document.createElement('div');
    overlay.id = 'filtro-panel';
    overlay.className = 'filtro-panel';
    overlay.innerHTML = `
        <div class="filtro-panel__content" role="dialog" aria-modal="true" aria-labelledby="filtro-panel-title" tabindex="-1">
            <div class="filtro-panel__header">
                <div>
                    <h3 id="filtro-panel-title">Coincidencias encontradas</h3>
                    <p class="filtro-panel__meta" data-result-count></p>
                </div>
                <button type="button" class="filtro-panel__close" data-close aria-label="Cerrar panel">&times;</button>
            </div>
            <div class="filtro-panel__body">
                <div class="filtro-panel__list" role="list"></div>
                <div class="filtro-panel__actions">
                    <button type="button" data-action="go-first">Ver primera coincidencia</button>
                    <button type="button" data-action="limpiar">Limpiar filtro</button>
                </div>
            </div>
        </div>
    `;

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            cerrarPanelResultados();
        }
    });
    overlay.querySelector('[data-close]').addEventListener('click', cerrarPanelResultados);
    overlay.querySelector('[data-action="go-first"]').addEventListener('click', () => irAResultado(0));
    overlay.querySelector('[data-action="limpiar"]').addEventListener('click', limpiarFiltro);

    document.body.appendChild(overlay);
    return overlay;
}

function obtenerNombreCategoria(pathname) {
    if (!pathname) return 'Inicio';
    if (pathname.includes('saladas')) return 'Recetas saladas';
    if (pathname.includes('postres')) return 'Postres';
    if (pathname.includes('bebidas')) return 'Bebidas';
    if (pathname.includes('contact')) return 'Contacto';
    if (pathname.includes('share')) return 'Compartí tu receta';
    return 'Inicio';
}

function irAResultado(indice) {
    const filtro = obtenerFiltroGuardado();
    if (!filtro) return;
    if (indice < 0 || indice >= filtro.coincidencias.length) return;

    filtro.indiceActual = indice;
    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(filtro));
    cerrarPanelResultados();
    window.location.href = filtro.coincidencias[indice].pagina;
}

let todasLasRecetas = sincronizarRecetas();
const filtroForm = document.getElementById('v2-filtro');

if (filtroForm) {
    filtroForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (filtroFeedback) {
            filtroFeedback.textContent = 'Buscando recetas que cumplan los filtros...';
        }

        todasLasRecetas = JSON.parse(localStorage.getItem('todasLasRecetas') || '[]');

        const maxMins = parseInt(document.getElementById('mins').value || '999', 10);
        const soloVeg = document.getElementById('veg').checked;
        const kw = (document.getElementById('kw').value || '').trim().toLowerCase();

        const matches = todasLasRecetas.filter((receta) => {
            if (receta.minutos > maxMins) return false;
            if (soloVeg && !receta.vegetariana) return false;

            if (kw) {
                const texto = `${receta.nombre} ${receta.ingredientes} ${receta.pasos}`.toLowerCase();
                if (!texto.includes(kw)) return false;
            }

            return true;
        });

        matches.sort((a, b) => a.minutos - b.minutos);

        if (matches.length > 0) {
            guardarFiltroEstado(matches, {
                minutos: maxMins,
                vegetariana: soloVeg,
                keyword: kw
            });

            if (filtroFeedback) {
                filtroFeedback.textContent = `Encontramos ${matches.length} recetas. Elegí una coincidencia en la lista para navegar.`;
            }

            mostrarPanelResultados(matches);
        } else if (filtroFeedback) {
            filtroFeedback.textContent = 'No encontramos recetas con esos filtros. Probá ampliando los criterios.';
        }
    });
}

window.addEventListener('load', () => {
    sincronizarRecetas();

    const filtro = obtenerFiltroGuardado();
    if (!filtro) return;

    const coincidenciaActual = filtro.coincidencias[filtro.indiceActual];
    if (coincidenciaActual.pagina !== window.location.pathname) return;

    const filas = document.querySelectorAll('table tr');
    filas.forEach((tr) => {
        const nombreCelda = tr.querySelector('td:first-child');
        if (nombreCelda && nombreCelda.textContent.trim() === coincidenciaActual.nombre) {
            tr.classList.add('highlight');
            tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (filtroFeedback) {
                filtroFeedback.textContent = `Mostrando resultados filtrados (${filtro.indiceActual + 1} de ${filtro.coincidencias.length}).`;
            }

            if (filtro.coincidencias.length > 1) {
                crearNavegacionFiltro(filtro);
            }
        }
    });
});

function crearNavegacionFiltro(filtro) {
    let nav = document.getElementById('filtro-navegacion');
    if (!nav) {
        nav = document.createElement('div');
        nav.id = 'filtro-navegacion';
        nav.className = 'filtro-floating';
        nav.innerHTML = `
            <p class="filtro-floating__count"></p>
            <div class="filtro-floating__actions">
                <button type="button" data-dir="anterior">Anterior</button>
                <button type="button" data-dir="siguiente">Siguiente</button>
                <button type="button" data-close>Limpiar</button>
            </div>
        `;
        document.body.appendChild(nav);

        nav.querySelectorAll('[data-dir]').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                navegarReceta(event.currentTarget.dataset.dir);
            });
        });
        nav.querySelector('[data-close]').addEventListener('click', limpiarFiltro);
    }

    nav.querySelector('.filtro-floating__count').textContent = `Receta ${filtro.indiceActual + 1} de ${filtro.coincidencias.length}`;
    nav.querySelector('[data-dir="anterior"]').disabled = filtro.indiceActual === 0;
    nav.querySelector('[data-dir="siguiente"]').disabled = filtro.indiceActual === filtro.coincidencias.length - 1;
}

function navegarReceta(direccion) {
    const filtro = obtenerFiltroGuardado();
    if (!filtro) return;
    const nuevoIndice = direccion === 'siguiente' ? filtro.indiceActual + 1 : filtro.indiceActual - 1;

    if (nuevoIndice >= 0 && nuevoIndice < filtro.coincidencias.length) {
        filtro.indiceActual = nuevoIndice;
        sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(filtro));
        window.location.href = filtro.coincidencias[nuevoIndice].pagina;
    }
}

function limpiarFiltro() {
    sessionStorage.removeItem(FILTER_SESSION_KEY);
    document.querySelectorAll('tr.highlight').forEach((tr) => tr.classList.remove('highlight'));
    document.getElementById('filtro-navegacion')?.remove();
    cerrarPanelResultados();
    if (filtroFeedback) {
        filtroFeedback.textContent = 'Se limpió el filtro. Mostramos todas las recetas disponibles.';
    }
}
