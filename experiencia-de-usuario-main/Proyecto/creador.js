// ══════════════════════════════════════════════════════════════════
// creador.js  —  Solo Firebase AUTH. Todo el contenido en localStorage
// ══════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Keys de localStorage ─────────────────────────────────────────
const VIDEOS_KEY    = 'creador_videos';
const SOLICITUDES_KEY = 'solicitudes_muro';

// ── Estado global ────────────────────────────────────────────────
let currentUser    = null;
let videos         = [];
let selectedFile   = null;
let previewURL     = null;
let pendingToSend  = [];
let mediaRecorder, recordedChunks = [], stream, recInterval, recSeconds = 0;

// ════════════════════════════════════════════════════════════════
// FIREBASE AUTH — solo para verificar sesión del creador
// ════════════════════════════════════════════════════════════════
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = {
            uid:      user.uid,
            name:     user.displayName || user.email.split('@')[0] || 'Creador',
            email:    user.email,
            initials: (user.displayName || user.email || 'C')[0].toUpperCase()
        };
        // Guardar nombre en localStorage para que el muro lo pueda leer
        localStorage.setItem('profesorNombre', currentUser.name);
        localStorage.setItem('profesorUid',    currentUser.uid);

        // Actualizar UI de usuario en sidebar
        const nameEl  = document.getElementById('user-display-name');
        const emailEl = document.getElementById('user-display-email');
        const initEl  = document.getElementById('user-initials');
        if (nameEl)  nameEl.textContent  = currentUser.name;
        if (emailEl) emailEl.textContent = currentUser.email;
        if (initEl)  initEl.textContent  = currentUser.initials;

        initApp();
    } else {
        window.location.href = 'introduccion_usuario.html';
    }
});

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
function initApp() {
    loadVideosFromStorage();
    updateStats();
    renderEditList();
    renderStatusList();
    renderSendList();
}

// ════════════════════════════════════════════════════════════════
// localStorage HELPERS
// ════════════════════════════════════════════════════════════════
function loadVideosFromStorage() {
    try {
        const all = JSON.parse(localStorage.getItem(VIDEOS_KEY) || '[]');
        // Filtrar solo los videos del creador actual
        videos = all.filter(v => v.uid === currentUser.uid);
    } catch (e) {
        videos = [];
    }
}

function saveVideosToStorage() {
    try {
        // Leer todos los videos (de otros creadores también)
        const all = JSON.parse(localStorage.getItem(VIDEOS_KEY) || '[]');
        // Quitar los del usuario actual y reemplazarlos con los nuevos
        const otros = all.filter(v => v.uid !== currentUser.uid);
        localStorage.setItem(VIDEOS_KEY, JSON.stringify([...otros, ...videos]));
    } catch (e) {
        console.error('Error guardando videos:', e);
    }
}

function getSolicitudes() {
    try { return JSON.parse(localStorage.getItem(SOLICITUDES_KEY) || '[]'); }
    catch (e) { return []; }
}

function saveSolicitudes(arr) {
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(arr));
}

// ════════════════════════════════════════════════════════════════
// NAVEGACIÓN
// ════════════════════════════════════════════════════════════════
const sectionMeta = {
    grabar:          ['🎬 Grabar Video',          'Graba una nueva señal en Lengua de Señas Mexicana'],
    subir:           ['⬆️ Subir Video',            'Selecciona y sube un archivo de video desde tu dispositivo'],
    editar:          ['✏️ Editar Contenido',       'Modifica título y descripción de tus videos'],
    enviar:          ['📤 Enviar a Revisión',      'Envía tus videos al administrador para revisión'],
    estado:          ['🔍 Estado de Videos',       'Consulta el estado de tus videos enviados'],
    'subir-youtube': ['▶️ YouTube',                'Comparte videos externos de YouTube en el muro']
};

window.goTo = function(name, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const sec = document.getElementById('sec-' + name);
    if (sec) sec.classList.add('active');
    if (el) el.classList.add('active');
    else {
        document.querySelectorAll('.nav-item').forEach(n => {
            const oc = n.getAttribute('onclick');
            if (oc && oc.includes("'" + name + "'")) n.classList.add('active');
        });
    }
    if (sectionMeta[name]) {
        document.getElementById('page-title').textContent = sectionMeta[name][0];
        document.getElementById('page-sub').textContent   = sectionMeta[name][1];
    }
    if (name === 'enviar') renderSendList();
    if (name === 'estado') renderStatusList();
};

window.goToSend = function() { window.goTo('enviar', null); };

// ════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════
function updateStats() {
    document.getElementById('stat-total').textContent = videos.length;
    document.getElementById('stat-pend').textContent  = videos.filter(v => v.estado === 'revision').length;
    document.getElementById('stat-aprov').textContent = videos.filter(v => v.estado === 'aprobado').length;
    document.getElementById('stat-rech').textContent  = videos.filter(v => v.estado === 'rechazado').length;
}

// ════════════════════════════════════════════════════════════════
// CÁMARA Y GRABACIÓN
// ════════════════════════════════════════════════════════════════
window.startCamera = async function() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const preview = document.getElementById('camera-preview');
        preview.srcObject = stream;
        preview.style.display = 'block';
        document.getElementById('cam-placeholder').style.display = 'none';
        document.getElementById('btn-rec').disabled = false;
        document.getElementById('btn-cam').textContent = '📷 Cámara activa';
        showToast('Cámara activada ✅', 'success');
    } catch (err) {
        showToast('No se pudo acceder a la cámara. Revisa permisos.', 'error');
    }
};

window.toggleRecord = function() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') startRecord();
    else stopRecord();
};

function startRecord() {
    if (!stream) { showToast('Activa la cámara primero.', 'error'); return; }
    const tema   = document.getElementById('rec-tema').value;
    const palabra = document.getElementById('rec-palabra').value.trim();
    if (!tema || !palabra) { showToast('Selecciona un tema y escribe la señal primero.', 'error'); return; }

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.start();

    document.getElementById('btn-rec').style.display  = 'none';
    document.getElementById('btn-stop').style.display = 'inline-flex';
    document.getElementById('rec-indicator').style.display = 'block';
    document.getElementById('rec-timer').style.display     = 'block';

    recSeconds = 0;
    recInterval = setInterval(() => {
        recSeconds++;
        const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
        const s = String(recSeconds % 60).padStart(2, '0');
        document.getElementById('rec-timer').textContent = `${m}:${s}`;
    }, 1000);
}

window.stopRecord = function() {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    clearInterval(recInterval);
    document.getElementById('btn-stop').style.display        = 'none';
    document.getElementById('rec-indicator').style.display   = 'none';
    document.getElementById('rec-timer').style.display       = 'none';
    document.getElementById('btn-preview-rec').style.display = 'inline-flex';
    document.getElementById('btn-save-rec').style.display    = 'inline-flex';
    document.getElementById('btn-rec').style.display         = 'inline-flex';
    showToast('¡Grabación terminada! Puedes previsualizar o guardar.', 'success');
};

window.previewRecording = function() {
    if (!recordedChunks || recordedChunks.length === 0) {
        showToast('No hay ninguna grabación para mostrar.', 'error'); return;
    }
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = URL.createObjectURL(blob);
    const videoPreview = document.getElementById('saved-video');
    const container    = document.getElementById('saved-recording');
    videoPreview.src   = previewURL;
    container.style.display = 'block';
    videoPreview.load();
    videoPreview.play().catch(() => {});
    showToast('Vista previa lista 🎥', 'info');
};

// ── Guardar grabación como borrador en localStorage ──────────────
window.saveRecording = function() {
    if (!recordedChunks.length) return;
    const blob   = new Blob(recordedChunks, { type: 'video/webm' });
    const tema   = document.getElementById('rec-tema').value;
    const palabra = document.getElementById('rec-palabra').value.trim();

    if (!tema || !palabra) { showToast('Falta tema o palabra.', 'error'); return; }

    // Convertir blob a base64 para guardarlo en localStorage
    const reader = new FileReader();
    reader.onloadend = () => {
        const nuevoVideo = {
            id:           'vid_' + Date.now(),
            titulo:       `Señal — ${palabra}`,
            tema,
            palabra,
            descripcion:  'Grabado en la plataforma',
            estado:       'borrador',
            tipo:         'video/webm',
            dataURL:      reader.result,     // base64 del video
            nombreArchivo: `${palabra}_${Date.now()}.webm`,
            fecha:        new Date().toLocaleDateString('es-MX'),
            uid:          currentUser.uid,
            profesorNombre: currentUser.name,
            profesorEmail:  currentUser.email
        };
        videos.push(nuevoVideo);
        saveVideosToStorage();
        updateStats();
        renderEditList();
        renderStatusList();
        showToast('Grabación guardada como borrador ✅', 'success');
        document.getElementById('saved-recording').style.display = 'none';
    };
    reader.readAsDataURL(blob);
};

window.updateThemeTag = function() {
    const val  = document.getElementById('rec-tema').value;
    const wrap = document.getElementById('theme-tag-wrap');
    if (val) {
        wrap.style.display = 'block';
        document.getElementById('theme-tag').textContent = '🏷️ ' + val;
    } else {
        wrap.style.display = 'none';
    }
};

// ════════════════════════════════════════════════════════════════
// SUBIR VIDEO (archivo del dispositivo)
// ════════════════════════════════════════════════════════════════
const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'];
const MAX_MB  = 200; // límite reducido por localStorage (~5 MB real limit)

window.handleFileSelect = function(input) {
    if (input.files.length) handleFile(input.files[0]);
};

window.handleDrop = function(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
};

function handleFile(file) {
    selectedFile = file;
    const preview = document.getElementById('file-preview');
    preview.classList.add('show');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';

    const valid = document.getElementById('file-valid');
    if (!ALLOWED.includes(file.type)) {
        valid.innerHTML = '<span style="color:var(--red);font-size:12px;font-weight:600;">❌ Formato no permitido. Usa MP4, WEBM, MOV o AVI.</span>';
        document.getElementById('upload-form-card').style.display = 'none';
        setStep(2, false); return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        valid.innerHTML = `<span style="color:var(--red);font-size:12px;font-weight:600;">❌ El archivo supera los ${MAX_MB} MB. Para archivos grandes usa la opción de YouTube.</span>`;
        document.getElementById('upload-form-card').style.display = 'none';
        setStep(2, false); return;
    }
    valid.innerHTML = '<span style="color:var(--green);font-size:12px;font-weight:600;">✅ Formato válido — listo para subir</span>';
    document.getElementById('upload-form-card').style.display = 'block';
    setStep(2, true); setStep(3, true);
    showToast('Archivo validado ✅', 'success');
}

window.removeFile = function() {
    document.getElementById('file-preview').classList.remove('show');
    document.getElementById('file-input').value = '';
    document.getElementById('upload-form-card').style.display = 'none';
    setStep(2, false); setStep(3, false); setStep(4, false);
    selectedFile = null;
};

function setStep(n, done) {
    const el = document.getElementById('step' + n);
    if (!el) return;
    el.classList.toggle('done', done);
    el.classList.toggle('active', !done);
}

// ── Guardar video subido como borrador ───────────────────────────
window.uploadVideo = function() {
    const titulo      = document.getElementById('vid-titulo').value.trim();
    const tema        = document.getElementById('vid-tema').value;
    const palabra     = document.getElementById('vid-palabra').value.trim();
    const nivel       = document.getElementById('vid-nivel').value;
    const descripcion = document.getElementById('vid-desc').value.trim();

    if (!tema || !titulo) { showToast('Completa al menos título y tema ❌', 'error'); return; }
    if (!selectedFile)    { showToast('Selecciona un archivo primero ❌', 'error'); return; }

    // Mostrar barra de progreso simulada
    const progWrap = document.getElementById('upload-progress');
    const fill     = document.getElementById('progress-fill');
    const pct      = document.getElementById('progress-pct');
    progWrap.classList.add('show');

    const reader = new FileReader();
    reader.onprogress = (e) => {
        if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            fill.style.width = p + '%';
            pct.textContent  = p + '%';
        }
    };
    reader.onloadend = () => {
        const nuevoVideo = {
            id:           'vid_' + Date.now(),
            titulo:       titulo || `Señal — ${palabra}`,
            tema,
            palabra,
            nivel,
            descripcion,
            estado:       'borrador',
            tipo:         selectedFile.type,
            dataURL:      reader.result,
            nombreArchivo: selectedFile.name,
            fecha:        new Date().toLocaleDateString('es-MX'),
            uid:          currentUser.uid,
            profesorNombre: currentUser.name,
            profesorEmail:  currentUser.email
        };
        videos.push(nuevoVideo);
        saveVideosToStorage();
        updateStats();
        renderEditList();
        renderStatusList();
        progWrap.classList.remove('show');
        fill.style.width = '0%';
        selectedFile = null;
        document.getElementById('file-input').value = '';
        document.getElementById('file-preview').classList.remove('show');
        document.getElementById('upload-form-card').style.display = 'none';
        clearUploadForm();
        showToast('Video guardado como borrador ✅ Ahora puedes enviarlo a revisión.', 'success');
        setStep(4, true);
    };
    reader.readAsDataURL(selectedFile);
};

window.clearUploadForm = function() {
    ['vid-titulo','vid-palabra','vid-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['vid-tema','vid-nivel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });
};

// ════════════════════════════════════════════════════════════════
// EDITAR VIDEOS
// ════════════════════════════════════════════════════════════════
function renderEditList() {
    const tb = document.getElementById('edit-list');
    if (!tb) return;
    tb.innerHTML = '';
    if (!videos.length) {
        tb.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">🎥</div><div class="empty-title">Aún no tienes videos</div></div></td></tr>`;
        return;
    }
    videos.forEach(v => {
        const canEdit = ['borrador','rechazado'].includes(v.estado);
        const tipoIcon = v.tipo === 'video/youtube' ? '▶️' : '🎥';
        tb.innerHTML += `
        <tr>
          <td>
            <div class="vid-cell">
              <div class="vid-thumb">${tipoIcon}</div>
              <div>
                <div class="vid-title">${v.titulo}</div>
                <div class="vid-meta">${v.fecha || ''}</div>
              </div>
            </div>
          </td>
          <td><span class="theme-tag" style="font-size:11px;">${v.tema}</span></td>
          <td style="font-size:12px;color:var(--slate);">${v.nivel ? 'Nivel ' + v.nivel : v.tipo === 'video/youtube' ? 'YouTube' : '—'}</td>
          <td>${statusBadge(v.estado)}</td>
          <td>
            <div style="display:flex;gap:6px;">
              ${canEdit ? `<button class="btn btn-edit" onclick="openEditModal('${v.id}')">✏️ Editar</button>` : '<span style="font-size:12px;color:var(--slate);">Solo lectura</span>'}
              ${canEdit ? `<button class="btn btn-danger" onclick="deleteVideo('${v.id}')">🗑️</button>` : ''}
            </div>
          </td>
        </tr>`;
    });
}

window.openEditModal = function(id) {
    const v = videos.find(v => v.id === id);
    if (!v) return;
    document.getElementById('edit-vid-id').value   = id;
    document.getElementById('edit-titulo').value   = v.titulo;
    document.getElementById('edit-desc').value     = v.descripcion || '';
    document.getElementById('edit-tema').value     = v.tema;
    document.getElementById('edit-modal').classList.add('active');
};

window.saveEdit = function() {
    const id          = document.getElementById('edit-vid-id').value;
    const titulo      = document.getElementById('edit-titulo').value.trim();
    const descripcion = document.getElementById('edit-desc').value.trim();
    const tema        = document.getElementById('edit-tema').value;
    const v = videos.find(v => v.id === id);
    if (!v) return;
    v.titulo      = titulo;
    v.descripcion = descripcion;
    v.tema        = tema;
    // Si estaba rechazado, al editar vuelve a borrador
    if (v.estado === 'rechazado') v.estado = 'borrador';
    saveVideosToStorage();
    renderEditList();
    renderStatusList();
    renderSendList();
    closeModal('edit-modal');
    showToast('Cambios guardados ✅', 'success');
};

window.deleteVideo = function(id) {
    if (!confirm('¿Eliminar este video?')) return;
    videos = videos.filter(v => v.id !== id);
    saveVideosToStorage();
    updateStats();
    renderEditList();
    renderStatusList();
    renderSendList();
    showToast('Video eliminado 🗑️', 'success');
};

// ════════════════════════════════════════════════════════════════
// ENVIAR A REVISIÓN
// ════════════════════════════════════════════════════════════════
function renderSendList() {
    const wrap  = document.getElementById('send-list-wrap');
    if (!wrap) return;
    const ready = videos.filter(v => ['borrador','rechazado'].includes(v.estado));
    if (!ready.length) {
        wrap.innerHTML = `<div class="empty"><div class="empty-icon">✅</div><div class="empty-title">¡Todo al día!</div><div class="empty-sub">No tienes videos pendientes de enviar</div></div>`;
        return;
    }
    const tipoIcon = (v) => v.tipo === 'video/youtube' ? '▶️' : '🎥';
    wrap.innerHTML = ready.map(v => `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">
          <input type="checkbox" class="send-check" value="${v.id}" checked style="width:17px;height:17px;accent-color:var(--teal);cursor:pointer;">
          <div class="vid-thumb">${tipoIcon(v)}</div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:14px;">${v.titulo}</div>
            <div style="font-size:12px;color:var(--slate);">${v.tema}${v.nivel ? ' · Nivel ' + v.nivel : ''}</div>
          </div>
          ${statusBadge(v.estado)}
        </div>`).join('');
}

window.sendAllToReview = function() {
    const checked = [...document.querySelectorAll('.send-check:checked')].map(c => c.value);
    if (!checked.length) { showToast('Selecciona al menos un video.', 'error'); return; }
    const vids = checked.map(id => videos.find(v => v.id === id)).filter(Boolean);
    document.getElementById('confirm-send-list').innerHTML =
        vids.map(v => `<div style="padding:4px 0;">${v.tipo === 'video/youtube' ? '▶️' : '📹'} ${v.titulo}</div>`).join('');
    pendingToSend = checked;
    document.getElementById('confirm-send-modal').classList.add('active');
};

window.confirmSend = function() {
    const solicitudes = getSolicitudes();

    for (const id of pendingToSend) {
        const v = videos.find(v => v.id === id);
        if (!v) continue;

        // Cambiar estado a revisión
        v.estado     = 'revision';
        v.fechaEnvio = new Date().toISOString();

        // Crear solicitud para el admin
        const solicitud = {
            id:             'sol_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
            videoId:        v.id,
            profesorNombre: currentUser.name,
            profesorEmail:  currentUser.email,
            profesorUid:    currentUser.uid,
            titulo:         v.titulo,
            texto:          v.descripcion || v.titulo,
            tema:           v.tema,
            nivel:          v.nivel || '—',
            tipo:           v.tipo || 'video/webm',
            nombreArchivo:  v.nombreArchivo || v.titulo,
            // Para YouTube guardamos la URL; para videos locales el dataURL
            archivoURL:     v.tipo === 'video/youtube' ? v.url : (v.dataURL || ''),
            urlEmbed:       v.tipo === 'video/youtube' ? v.urlEmbed || '' : '',
            estado:         'pendiente',
            fecha:          new Date().toISOString(),
            comentarioAdmin: ''
        };
        solicitudes.push(solicitud);
    }

    saveSolicitudes(solicitudes);
    saveVideosToStorage();
    pendingToSend = [];
    closeModal('confirm-send-modal');
    updateStats();
    renderEditList();
    renderStatusList();
    renderSendList();
    showToast('✅ Videos enviados al admin. El admin los revisará y aprobará pronto.', 'success');
};

window.quickSend = function(id) {
    pendingToSend = [id];
    window.confirmSend();
};

// ════════════════════════════════════════════════════════════════
// ESTADO DE VIDEOS
// ════════════════════════════════════════════════════════════════
let activeFilter = 'all';

function renderStatusList(filter) {
    if (filter) activeFilter = filter;
    const tb   = document.getElementById('status-list');
    if (!tb) return;

    // Sincronizar estados desde solicitudes (el admin puede haber aprobado/rechazado)
    syncEstadosDesdeAdmin();

    const list = activeFilter === 'all' ? videos : videos.filter(v => v.estado === activeFilter);
    tb.innerHTML = '';
    list.forEach(v => {
        tb.innerHTML += `
        <tr>
          <td>
            <div class="vid-cell">
              <div class="vid-thumb">${v.tipo === 'video/youtube' ? '▶️' : '🎥'}</div>
              <div>
                <div class="vid-title">${v.titulo}</div>
                <div class="vid-meta">${v.palabra || ''}</div>
              </div>
            </div>
          </td>
          <td style="font-size:12px;">${v.tema}</td>
          <td style="font-size:12px;color:var(--slate);">${v.fecha || ''}</td>
          <td>${statusBadge(v.estado)}</td>
          <td style="font-size:12px;color:var(--slate);max-width:180px;">
            ${v.comentarioAdmin || '<span style="color:var(--slate-l);">Sin comentario</span>'}
          </td>
          <td>
            ${v.estado === 'rechazado' ?
                `<button class="btn btn-edit" onclick="openEditModal('${v.id}')">🔄 Corregir y reenviar</button>` :
              v.estado === 'borrador' ?
                `<button class="btn btn-outline" onclick="quickSend('${v.id}')">📤 Enviar</button>` :
                `<span style="font-size:12px;color:var(--slate-l);">—</span>`
            }
          </td>
        </tr>`;
    });
    if (!list.length) tb.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Sin resultados</div></div></td></tr>`;
}

// Sincronizar los estados que el admin haya cambiado en localStorage
function syncEstadosDesdeAdmin() {
    const solicitudes = getSolicitudes();
    let changed = false;
    videos.forEach(v => {
        const sol = solicitudes.find(s => s.videoId === v.id);
        if (sol) {
            const nuevoEstado = sol.estado === 'aceptado' ? 'aprobado' :
                                sol.estado === 'rechazado' ? 'rechazado' : v.estado;
            if (nuevoEstado !== v.estado) {
                v.estado = nuevoEstado;
                v.comentarioAdmin = sol.comentarioAdmin || '';
                changed = true;
            }
        }
    });
    if (changed) {
        saveVideosToStorage();
        updateStats();
    }
}

window.filterByStatus = function(f) {
    activeFilter = f;
    renderStatusList(f);
    document.querySelectorAll('[id^="flt-"]').forEach(b => b.classList.remove('btn-primary'));
    const btn = document.getElementById('flt-' + f);
    if (btn) btn.classList.add('btn-primary');
};

// ════════════════════════════════════════════════════════════════
// YOUTUBE — guardar link en localStorage
// ════════════════════════════════════════════════════════════════
window.openYoutubeModal = function() {
    document.getElementById('yt-url').value   = '';
    document.getElementById('yt-titulo').value = '';
    document.getElementById('youtube-modal').classList.add('active');
};

window.saveYoutubeLink = function() {
    const url    = document.getElementById('yt-url').value.trim();
    const titulo = document.getElementById('yt-titulo').value.trim();

    if (!url || !titulo) { showToast('Completa todos los campos ⚠️', 'error'); return; }
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        showToast('Ingresa un enlace válido de YouTube ⚠️', 'error'); return;
    }

    // Generar URL embed
    let embedUrl = url;
    if (url.includes('watch?v=')) {
        const videoId = url.split('watch?v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/shorts/')) {
        const videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const nuevoVideo = {
        id:             'yt_' + Date.now(),
        titulo:         titulo,
        tema:           'YouTube',
        palabra:        'Externo',
        descripcion:    'Video compartido de YouTube',
        estado:         'borrador',
        tipo:           'video/youtube',
        url:            url,       // URL original
        urlEmbed:       embedUrl,  // URL embed
        nombreArchivo:  titulo,
        fecha:          new Date().toLocaleDateString('es-MX'),
        uid:            currentUser.uid,
        profesorNombre: currentUser.name,
        profesorEmail:  currentUser.email
    };

    videos.push(nuevoVideo);
    saveVideosToStorage();
    updateStats();
    renderEditList();
    renderStatusList();
    renderSendList();
    closeModal('youtube-modal');
    showToast('Enlace de YouTube guardado como borrador ✅ Ahora puedes enviarlo al admin.', 'success');
};

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
function statusBadge(estado) {
    const map = {
        borrador:  ['badge-draft',    '📁 Borrador'],
        revision:  ['badge-review',   '⏳ En revisión'],
        aprobado:  ['badge-approved', '✅ Aprobado'],
        rechazado: ['badge-rejected', '❌ Rechazado'],
    };
    const [cls, txt] = map[estado] || ['badge-draft','—'];
    return `<span class="badge ${cls}">${txt}</span>`;
}

window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
};

function showToast(msg, type = 'info') {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️') + ' ' + msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

window.handleLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'introduccion_usuario.html';
    } catch (error) {
        showToast('Error al cerrar sesión ❌', 'error');
    }
};

// Cerrar modales al hacer clic fuera
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-overlay').forEach(o => {
        o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
    });
});

// Refrescar estado periódicamente (cada 30s) para ver respuestas del admin
setInterval(() => {
    syncEstadosDesdeAdmin();
    renderStatusList();
    updateStats();
}, 30000);