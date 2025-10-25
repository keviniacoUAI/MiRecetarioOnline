// Funcionalidad de compartir recetas
const drop = document.getElementById('v2-drop');
const preview = document.getElementById('v2-preview');
const lista = document.getElementById('v2-recetas-nuevas');
let v2FotoDataURL = null;

// Manejo de drag & drop
drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('activa');
});

drop.addEventListener('dragleave', () => {
    drop.classList.remove('activa');
});

drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('activa');

    const archivo = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!archivo) { alert('Soltá una imagen JPG/PNG'); return; }
    const ok = /(\.jpg|\.jpeg|\.png)$/i.test(archivo.name);
    if (!ok) { alert('Solo imágenes JPG/PNG'); return; }

    const lector = new FileReader();
    lector.onload = function() {
        v2FotoDataURL = lector.result;
        // preview
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = v2FotoDataURL;
        img.alt = 'Foto cargada';
        img.style.maxWidth = '240px';
        img.style.marginTop = '8px';
        preview.appendChild(img);
    };
    lector.readAsDataURL(archivo);
});

// Persistencia de recetas
const STORAGE_KEY = 'recetasComunidad';

function cargarRecetasGuardadas() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const arr = JSON.parse(raw);
        arr.forEach(r => renderReceta(r));
    } catch (_) { }
}

function guardarReceta(r) {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function renderReceta(r) {
    const li = document.createElement('li');
    li.innerHTML = '<b>' + escapar(r.nombre) + '</b> — ' + escapar(r.ingred) +
        ' — ' + escapar(r.pasos) + ' — ' + escapar(r.mins) + ' min — Veg: ' + escapar(r.veg);
    lista.appendChild(li);
    if (r.foto) {
        const img = document.createElement('img');
        img.src = r.foto;
        img.alt = 'Foto de ' + r.nombre;
        img.style.maxWidth = '240px';
        img.style.display = 'block';
        img.style.margin = '6px 0';
        li.appendChild(img);
    }
}

// Manejo del formulario
document.getElementById('v2-compartir').addEventListener('submit', (e) => {
    e.preventDefault();
    const r = {
        nombre: document.getElementById('cr-nombre').value.trim(),
        ingred: document.getElementById('cr-ingred').value.trim(),
        pasos: document.getElementById('cr-pasos').value.trim(),
        mins: document.getElementById('cr-mins').value.trim(),
        veg: document.getElementById('cr-veg').checked ? 'true' : 'false',
        foto: v2FotoDataURL
    };
    if (!r.nombre || !r.ingred || !r.pasos || !r.mins) {
        alert('Completá todos los campos.');
        return;
    }
    renderReceta(r);
    guardarReceta(r);

    // limpiar form y preview
    e.target.reset();
    v2FotoDataURL = null;
    preview.innerHTML = '';

    alert('¡Gracias por compartir tu receta!');
});

function escapar(s) { 
    return (s || '').toString().replace(/[&<>"']/g, m => 
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    ); 
}

// Cargar recetas guardadas al iniciar
window.addEventListener('load', cargarRecetasGuardadas);