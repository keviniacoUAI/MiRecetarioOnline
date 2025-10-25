// Función para obtener las recetas de la página actual
function obtenerRecetasDePagina() {
    const recetas = [];
    const filas = document.querySelectorAll('table tr[data-mins]');
    
    // Determinar la página actual basado en la URL
    const paginaActual = window.location.pathname;
    
    filas.forEach(tr => {
        const celdas = tr.querySelectorAll('td');
        if (celdas.length >= 3) {
            const receta = {
                nombre: celdas[0].textContent.trim(),
                ingredientes: celdas[1].textContent.trim(),
                pasos: celdas[2].textContent.trim(),
                minutos: parseInt(tr.getAttribute('data-mins'), 10),
                vegetariana: tr.getAttribute('data-veg') === 'true',
                pagina: paginaActual
            };
            recetas.push(receta);
        }
    });
    
    return recetas;
}

// Función para sincronizar las recetas con localStorage
function sincronizarRecetas() {
    // Obtener recetas actuales
    const recetasActuales = obtenerRecetasDePagina();
    
    // Obtener todas las recetas guardadas
    let todasLasRecetas = [];
    try {
        const recetasGuardadas = localStorage.getItem('todasLasRecetas');
        if (recetasGuardadas) {
            todasLasRecetas = JSON.parse(recetasGuardadas);
        }
    } catch (e) {
        console.error('Error al cargar recetas guardadas:', e);
    }
    
    // Si estamos en una página de recetas
    if (recetasActuales.length > 0) {
        // Filtrar recetas de otras páginas (mantener las que no son de la página actual)
        todasLasRecetas = todasLasRecetas.filter(r => r.pagina !== window.location.pathname);
        // Agregar las recetas de la página actual
        todasLasRecetas.push(...recetasActuales);
        // Guardar todo en localStorage
        localStorage.setItem('todasLasRecetas', JSON.stringify(todasLasRecetas));
    }
    
    return todasLasRecetas;
}

// Sincronizar recetas al cargar cada página
let todasLasRecetas = sincronizarRecetas();

// Función para buscar en todas las recetas
document.getElementById('v2-filtro')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Recargar las recetas para asegurarnos de tener la lista más actualizada
    todasLasRecetas = JSON.parse(localStorage.getItem('todasLasRecetas') || '[]');
    
    const maxMins = parseInt(document.getElementById('mins').value || '999', 10);
    const soloVeg = document.getElementById('veg').checked;
    const kw = (document.getElementById('kw').value || '').trim().toLowerCase();

    // Buscar todas las coincidencias en el array de recetas
    const matches = todasLasRecetas.filter(receta => {
        if (receta.minutos > maxMins) return false;
        if (soloVeg && !receta.vegetariana) return false;
        
        // Buscar palabra clave en todos los campos
        if (kw) {
            const texto = `${receta.nombre} ${receta.ingredientes} ${receta.pasos}`.toLowerCase();
            if (!texto.includes(kw)) return false;
        }
        
        return true;
    });
    
    // Ordenar por tiempo de preparación (más rápidas primero)
    matches.sort((a, b) => a.minutos - b.minutos);

    if (matches.length > 0) {
        // Guardar todas las coincidencias y criterios en sessionStorage
        sessionStorage.setItem('filtro', JSON.stringify({
            coincidencias: matches,
            criterios: {
                minutos: maxMins,
                vegetariana: soloVeg,
                keyword: kw
            },
            indiceActual: 0
        }));
        
        // Redireccionar a la página de la primera coincidencia
        window.location.href = matches[0].pagina;
    } else {
        alert('No encontré recetas con esos filtros 😕');
    }
});

// Código para resaltar la receta y mostrar navegación si venimos del filtro
window.addEventListener('load', () => {
    // Primero sincronizamos las recetas de esta página
    sincronizarRecetas();
    
    const filtroGuardado = sessionStorage.getItem('filtro');
    if (filtroGuardado) {
        try {
            const filtro = JSON.parse(filtroGuardado);
            const coincidenciaActual = filtro.coincidencias[filtro.indiceActual];
            
            // Solo procesar si estamos en la página correcta
            if (coincidenciaActual.pagina === window.location.pathname) {
                // Buscar y resaltar la receta en la tabla actual
                const filas = document.querySelectorAll('table tr');
                filas.forEach(tr => {
                    const nombreCelda = tr.querySelector('td:first-child');
                    if (nombreCelda && nombreCelda.textContent === coincidenciaActual.nombre) {
                        tr.classList.add('highlight');
                        tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Agregar contador y navegación si hay más de una coincidencia
                        if (filtro.coincidencias.length > 1) {
                            const nav = document.createElement('div');
                            nav.style.position = 'fixed';
                            nav.style.top = '10px';
                            nav.style.right = '10px';
                            nav.style.background = '#fff';
                            nav.style.padding = '10px';
                            nav.style.border = '1px solid #ccc';
                            nav.style.borderRadius = '5px';
                            nav.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                            
                            nav.innerHTML = `
                                <div style="margin-bottom:5px">
                                    Receta ${filtro.indiceActual + 1} de ${filtro.coincidencias.length}
                                </div>
                                <div>
                                    ${filtro.indiceActual > 0 ? 
                                        `<button onclick="navegarReceta('anterior')">← Anterior</button>` : 
                                        ''}
                                    ${filtro.indiceActual < filtro.coincidencias.length - 1 ? 
                                        `<button onclick="navegarReceta('siguiente')">Siguiente →</button>` : 
                                        ''}
                                    <button onclick="limpiarFiltro()">Limpiar filtro</button>
                                </div>
                            `;
                            document.body.appendChild(nav);
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Error al procesar el filtro guardado:', e);
            sessionStorage.removeItem('filtro');
        }
    }
});

// Funciones de navegación entre resultados
function navegarReceta(direccion) {
    const filtro = JSON.parse(sessionStorage.getItem('filtro'));
    const nuevoIndice = direccion === 'siguiente' ? 
        filtro.indiceActual + 1 : 
        filtro.indiceActual - 1;
    
    if (nuevoIndice >= 0 && nuevoIndice < filtro.coincidencias.length) {
        filtro.indiceActual = nuevoIndice;
        sessionStorage.setItem('filtro', JSON.stringify(filtro));
        window.location.href = filtro.coincidencias[nuevoIndice].pagina;
    }
}

function limpiarFiltro() {
    sessionStorage.removeItem('filtro');
    document.querySelectorAll('tr.highlight').forEach(tr => tr.classList.remove('highlight'));
    // Remover la navegación
    document.querySelector('div[style*="position: fixed"]')?.remove();
}