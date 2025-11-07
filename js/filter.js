const filtroFeedback = document.getElementById('filtro-feedback');

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
            if (filtroFeedback) {
                filtroFeedback.textContent = `Encontramos ${matches.length} recetas. Vamos a mostrarte la más rápida.`;
            }

            sessionStorage.setItem('filtro', JSON.stringify({
                coincidencias: matches,
                criterios: {
                    minutos: maxMins,
                    vegetariana: soloVeg,
                    keyword: kw
                },
                indiceActual: 0
            }));

            window.location.href = matches[0].pagina;
        } else if (filtroFeedback) {
            filtroFeedback.textContent = 'No encontramos recetas con esos filtros. Probá ampliando los criterios.';
        }
    });
}

window.addEventListener('load', () => {
    sincronizarRecetas();

    const filtroGuardado = sessionStorage.getItem('filtro');
    if (!filtroGuardado) return;

    try {
        const filtro = JSON.parse(filtroGuardado);
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

                if (filtro.coincidencias.length > 1 && !document.getElementById('filtro-navegacion')) {
                    crearNavegacionFiltro(filtro);
                }
            }
        });
    } catch (error) {
        console.error('Error al procesar el filtro guardado:', error);
        sessionStorage.removeItem('filtro');
    }
});

function crearNavegacionFiltro(filtro) {
    const nav = document.createElement('div');
    nav.id = 'filtro-navegacion';
    nav.style.position = 'fixed';
    nav.style.top = '10px';
    nav.style.right = '10px';
    nav.style.background = '#fff';
    nav.style.padding = '10px';
    nav.style.border = '1px solid #ccc';
    nav.style.borderRadius = '5px';
    nav.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    const contador = document.createElement('div');
    contador.textContent = `Receta ${filtro.indiceActual + 1} de ${filtro.coincidencias.length}`;
    contador.style.marginBottom = '5px';
    nav.appendChild(contador);

    const controles = document.createElement('div');

    if (filtro.indiceActual > 0) {
        const btnAnterior = document.createElement('button');
        btnAnterior.type = 'button';
        btnAnterior.textContent = 'Anterior';
        btnAnterior.addEventListener('click', () => navegarReceta('anterior'));
        controles.appendChild(btnAnterior);
    }

    if (filtro.indiceActual < filtro.coincidencias.length - 1) {
        const btnSiguiente = document.createElement('button');
        btnSiguiente.type = 'button';
        btnSiguiente.textContent = 'Siguiente';
        btnSiguiente.style.marginLeft = '8px';
        btnSiguiente.addEventListener('click', () => navegarReceta('siguiente'));
        controles.appendChild(btnSiguiente);
    }

    const btnLimpiar = document.createElement('button');
    btnLimpiar.type = 'button';
    btnLimpiar.textContent = 'Limpiar filtro';
    btnLimpiar.style.marginLeft = '8px';
    btnLimpiar.addEventListener('click', limpiarFiltro);
    controles.appendChild(btnLimpiar);

    nav.appendChild(controles);
    document.body.appendChild(nav);
}

function navegarReceta(direccion) {
    const filtro = JSON.parse(sessionStorage.getItem('filtro'));
    const nuevoIndice = direccion === 'siguiente' ? filtro.indiceActual + 1 : filtro.indiceActual - 1;

    if (nuevoIndice >= 0 && nuevoIndice < filtro.coincidencias.length) {
        filtro.indiceActual = nuevoIndice;
        sessionStorage.setItem('filtro', JSON.stringify(filtro));
        window.location.href = filtro.coincidencias[nuevoIndice].pagina;
    }
}

function limpiarFiltro() {
    sessionStorage.removeItem('filtro');
    document.querySelectorAll('tr.highlight').forEach((tr) => tr.classList.remove('highlight'));
    document.getElementById('filtro-navegacion')?.remove();
    if (filtroFeedback) {
        filtroFeedback.textContent = 'Se limpió el filtro. Mostramos todas las recetas disponibles.';
    }
}

