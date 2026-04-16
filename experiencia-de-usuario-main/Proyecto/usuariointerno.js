// ══════════════════════════════════════════════════════════════
//  GUARD — Firebase Auth + localStorage
// ══════════════════════════════════════════════════════════════
const mmhRole = localStorage.getItem('MMH_role');
const mmhUid  = localStorage.getItem('MMH_uid');
// Bloqueo inmediato si localStorage no tiene la sesión de empleado
if (mmhRole !== 'empleado' || !mmhUid) {
  window.location.href = 'index.html';
}

// ══════════════════════════════════════════════════════════════
//  FIREBASE
// ══════════════════════════════════════════════════════════════
firebase.initializeApp({
  apiKey:            "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
  authDomain:        "mis-manos-hablaran-44e17.firebaseapp.com",
  projectId:         "mis-manos-hablaran-44e17",
  storageBucket:     "mis-manos-hablaran-44e17.firebasestorage.app",
  messagingSenderId: "637462888639",
  appId:             "1:637462888639:web:c4070137237c211dbd460a"
});
const db   = firebase.firestore();
const auth = firebase.auth();

// ── Colecciones en Firestore ──────────────────────────────────
const COL_CLIENTES     = 'clientes_accesibilidad';      // Directorio de clientes
const COL_COTIZACIONES = 'cotizaciones_accesibilidad';  // Cotizaciones generadas

// ── Verificar sesión Firebase Auth ───────────────────────────
// Si Firebase Auth tiene sesión activa, perfecto.
// Si no (bypass sin auth), igual continuamos — las reglas de Firestore
// deben permitir acceso autenticado o con reglas abiertas para estas colecciones.
auth.onAuthStateChanged(user => {
  if (user) {
    // Actualizar nombre en sidebar con datos reales
    const nombre = user.displayName || user.email?.split('@')[0] || 'Usuario';
    const el = document.getElementById('sidebar-nombre');
    if (el) el.textContent = nombre;
  }
  // Si no hay sesión Firebase Auth pero sí hay localStorage de empleado,
  // igual cargamos el dashboard (el acceso a Firestore depende de las reglas).
  cargarDashboard();
  iniciarListenerSolicitudes();
});

// ══════════════════════════════════════════════════════════════
//  CATÁLOGO DE SERVICIOS (precio base en MXN)
// ══════════════════════════════════════════════════════════════
const SERVICIOS = {
  interpretacion_vivo: {
    nombre:    'Interpretación en Vivo (Noticias / TV)',
    desc:      'Intérprete LSM en transmisiones en vivo, noticieros y actos oficiales',
    unidad:    'hora',
    precio:    800,
    icono:     '📺',
    categoria: 'Interpretación'
  },
  interpretacion_conferencia: {
    nombre:    'Interpretación en Conferencias y Eventos',
    desc:      'Conferencias de prensa, eventos gubernamentales y culturales',
    unidad:    'hora',
    precio:    650,
    icono:     '🎤',
    categoria: 'Interpretación'
  },
  interpretacion_online: {
    nombre:    'Interpretación Remota / Streaming',
    desc:      'Interpretación simultánea en videollamadas, webinars y transmisiones online',
    unidad:    'hora',
    precio:    500,
    icono:     '💻',
    categoria: 'Interpretación'
  },
  capacitacion_basica: {
    nombre:    'Capacitación LSM Básica',
    desc:      'Taller de 8 horas: alfabeto dactilológico, saludos y vocabulario esencial',
    unidad:    'persona',
    precio:    250,
    icono:     '🤟',
    categoria: 'Capacitación'
  },
  capacitacion_intermedia: {
    nombre:    'Capacitación LSM Intermedia',
    desc:      'Programa de 16 horas: conversación, familia, tiempo y expresiones cotidianas',
    unidad:    'persona',
    precio:    400,
    icono:     '📚',
    categoria: 'Capacitación'
  },
  capacitacion_avanzada: {
    nombre:    'Certificación LSM Avanzada',
    desc:      'Programa de 32 horas con certificado: dominio conversacional completo',
    unidad:    'persona',
    precio:    600,
    icono:     '🏆',
    categoria: 'Capacitación'
  },
  taller_sensibilizacion: {
    nombre:    'Taller de Sensibilización e Inclusión',
    desc:      'Jornada de 4 horas sobre inclusión y comunicación con la comunidad sorda (hasta 20 personas)',
    unidad:    'grupo',
    precio:    3500,
    icono:     '💡',
    categoria: 'Talleres'
  },
  taller_atencion_cliente: {
    nombre:    'Taller LSM para Atención al Cliente',
    desc:      'Capacitación orientada a personal de mostrador, recepción y servicio al público',
    unidad:    'persona',
    precio:    350,
    icono:     '🧑‍💼',
    categoria: 'Talleres'
  },
  consultoria_accesibilidad: {
    nombre:    'Consultoría de Accesibilidad Institucional',
    desc:      'Auditoría y asesoría para adaptar protocolos, señalética y comunicaciones',
    unidad:    'hora',
    precio:    1200,
    icono:     '🔍',
    categoria: 'Consultoría'
  },
  manual_protocolos: {
    nombre:    'Manual de Protocolos Inclusivos',
    desc:      'Elaboración de manual de comunicación accesible e inclusiva para la institución',
    unidad:    'documento',
    precio:    8000,
    icono:     '📋',
    categoria: 'Consultoría'
  },
  subtitulacion: {
    nombre:    'Subtitulación y Transcripción',
    desc:      'Subtitulado de contenido audiovisual, videos y material institucional',
    unidad:    'minuto de contenido',
    precio:    150,
    icono:     '📝',
    categoria: 'Postproducción'
  },
  lsm_app_escolar: {
    nombre:    'Licencia Plataforma LSM Escolar',
    desc:      'Acceso a Mis Manos Hablarán para grupos escolares con seguimiento de progreso',
    unidad:    'alumno / mes',
    precio:    85,
    icono:     '🎓',
    categoria: 'Digital'
  }
};

// ══════════════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ══════════════════════════════════════════════════════════════
let todosClientes     = [];   // caché del directorio
let todasCotizaciones = [];   // caché de cotizaciones
let confirmCallback   = null; // para el modal de confirmación

// ══════════════════════════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════════════════════════
function showSection(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  if (el) el.classList.add('active');
  if (id === 'dashboard')    cargarDashboard();
  if (id === 'directorio')   cargarDirectorio();
  if (id === 'cotizador')    iniciarCotizador();
  if (id === 'cotizaciones') cargarCotizaciones();
}

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ══════════════════════════════════════════════════════════════
//  MODALES
// ══════════════════════════════════════════════════════════════
function abrirModal(id)  { document.getElementById(id).classList.add('active'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('active'); }

// Cerrar al clic en overlay
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('active');
  });
});

function confirmar(titulo, msg, callback) {
  document.getElementById('confirm-titulo').textContent = titulo;
  document.getElementById('confirm-msg').textContent    = msg;
  confirmCallback = callback;
  abrirModal('modal-confirmar');
}
document.getElementById('confirm-ok-btn').addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  cerrarModal('modal-confirmar');
  confirmCallback = null;
});

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════
const fmt = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n || 0);

function fmtFecha(f) {
  if (!f) return '—';
  const d = f.toDate ? f.toDate() : new Date(f);
  return isNaN(d) ? '—' : d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});
}

const TIPO_LABELS = {
  empresa:'Empresa', medio:'Medio de Comunicación', gobierno:'Gobierno',
  escuela:'Escuela', comunidad:'Comunidad/ONG', evento:'Evento'
};
const ESTADO_CLIENTE_LABELS = {
  prospecto:'Prospecto', activo:'Activo', negociacion:'En negociación', inactivo:'Inactivo'
};
const ESTADO_COT_LABELS = {
  borrador:'Borrador', enviada:'Enviada', aceptada:'Aceptada',
  rechazada:'Rechazada', cancelada:'Cancelada'
};
const MODALIDAD_LABELS = { presencial:'Presencial', remoto:'Remoto', hibrido:'Híbrido' };

function badgeCliente(tipo) {
  return `<span class="badge badge-${tipo}">${TIPO_LABELS[tipo] || tipo}</span>`;
}
function badgeEstadoCliente(e) {
  return `<span class="badge badge-${e}">${ESTADO_CLIENTE_LABELS[e] || e}</span>`;
}
function badgeEstadoCot(e) {
  return `<span class="badge badge-${e}">${ESTADO_COT_LABELS[e] || e}</span>`;
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════
async function cargarDashboard() {
  try {
    const [snapCl, snapCot] = await Promise.all([
      db.collection(COL_CLIENTES).get(),
      db.collection(COL_COTIZACIONES).get()
    ]);

    const clientes = snapCl.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.created_at?.toDate?.() || 0) - (a.created_at?.toDate?.() || 0));
    const cots = snapCot.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.created_at?.toDate?.() || 0) - (a.created_at?.toDate?.() || 0));

    const aceptadas = cots.filter(c => c.estado === 'aceptada');
    const valorTotal = aceptadas.reduce((s, c) => s + (c.total || 0), 0);

    document.getElementById('ds-clientes').textContent  = clientes.length;
    document.getElementById('ds-enviadas').textContent  = cots.filter(c => c.estado === 'enviada').length;
    document.getElementById('ds-aceptadas').textContent = aceptadas.length;
    document.getElementById('ds-valor').textContent     = fmt(valorTotal);

    // Badge sidebar cotizaciones en borrador
    const borradores = cots.filter(c => c.estado === 'borrador').length;
    const badgeCots = document.getElementById('badge-cots');
    badgeCots.textContent = borradores > 0 ? borradores : '';
    badgeCots.classList.toggle('hidden', borradores === 0);

    // Badge sidebar clientes
    const badgeCl = document.getElementById('badge-clientes');
    badgeCl.textContent = clientes.length > 0 ? clientes.length : '';
    badgeCl.classList.toggle('hidden', clientes.length === 0);

    // Últimos 4 clientes
    const listCl = document.getElementById('ds-lista-clientes');
    if (clientes.length === 0) {
      listCl.innerHTML = `<div class="empty-state py-6"><p class="text-sm">Sin clientes aún</p></div>`;
    } else {
      listCl.innerHTML = clientes.slice(0, 4).map(c => `
        <div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center
            text-indigo-600 font-bold text-xs flex-shrink-0">
            ${(c.nombre || '?').slice(0,2).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm truncate">${c.nombre}</p>
            <p class="text-xs text-gray-400">${c.contacto_nombre || ''}</p>
          </div>
          ${badgeEstadoCliente(c.estado || 'prospecto')}
        </div>`).join('');
    }

    // Últimas 4 cotizaciones
    const listCot = document.getElementById('ds-lista-cotizaciones');
    if (cots.length === 0) {
      listCot.innerHTML = `<div class="empty-state py-6"><p class="text-sm">Sin cotizaciones aún</p></div>`;
    } else {
      listCot.innerHTML = cots.slice(0, 4).map(c => `
        <div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm truncate">${c.cliente_nombre || '—'}</p>
            <p class="text-xs text-gray-400">${fmtFecha(c.created_at)} · ${fmt(c.total)}</p>
          </div>
          ${badgeEstadoCot(c.estado || 'borrador')}
        </div>`).join('');
    }

  } catch (err) {
    console.error('Error dashboard:', err);
  }
}

// ══════════════════════════════════════════════════════════════
//  DIRECTORIO DE CLIENTES
// ══════════════════════════════════════════════════════════════
async function cargarDirectorio() {
  document.getElementById('tabla-clientes').innerHTML =
    `<tr><td colspan="6" class="text-center py-8 text-gray-400">Cargando...</td></tr>`;
  try {
    const snap = await db.collection(COL_CLIENTES)
      .orderBy('created_at', 'desc').get();
    todosClientes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTablaClientes(todosClientes);
  } catch (err) {
    console.error('Error directorio:', err);
    document.getElementById('tabla-clientes').innerHTML =
      `<tr><td colspan="6" class="text-center py-8 text-red-400">Error al cargar datos.</td></tr>`;
  }
}

function renderTablaClientes(list) {
  const tbody = document.getElementById('tabla-clientes');
  if (list.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <i class="ph-buildings text-4xl block mb-2 opacity-20"></i>
          <p class="font-semibold text-gray-500">Sin resultados</p>
        </div>
      </td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(c => `
    <tr>
      <td>
        <div class="font-semibold text-gray-800">${c.nombre}</div>
        ${c.ciudad ? `<div class="text-xs text-gray-400">${c.ciudad}</div>` : ''}
      </td>
      <td>${badgeCliente(c.tipo || 'empresa')}</td>
      <td>
        <div class="font-medium text-gray-700 text-sm">${c.contacto_nombre || '—'}</div>
        ${c.telefono ? `<div class="text-xs text-gray-400">${c.telefono}</div>` : ''}
      </td>
      <td class="text-sm text-gray-600">
        <a href="mailto:${c.email}" class="text-blue-500 hover:underline">${c.email || '—'}</a>
      </td>
      <td>${badgeEstadoCliente(c.estado || 'prospecto')}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn-edit" onclick="editarCliente('${c.id}')">
            <i class="ph-pencil-simple-fill"></i> Editar
          </button>
          <button class="btn-danger" onclick="eliminarCliente('${c.id}','${c.nombre.replace(/'/g,"\\'")}')">
            <i class="ph-trash-fill"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function filtrarDirectorio() {
  const q    = document.getElementById('search-clientes').value.toLowerCase();
  const tipo = document.getElementById('filter-tipo').value;
  const filt = todosClientes.filter(c => {
    const matchQ = !q || [c.nombre, c.contacto_nombre, c.email, c.ciudad]
      .some(v => (v || '').toLowerCase().includes(q));
    const matchT = !tipo || c.tipo === tipo;
    return matchQ && matchT;
  });
  renderTablaClientes(filt);
}

// Modal Agregar / Editar
function abrirModalCliente(datos = null) {
  document.getElementById('form-cliente').reset();
  document.getElementById('cliente-id').value = '';
  document.getElementById('modal-cliente-titulo').textContent =
    datos ? 'Editar Cliente' : 'Agregar Cliente';

  if (datos) {
    document.getElementById('cliente-id').value   = datos.id;
    document.getElementById('cl-nombre').value    = datos.nombre      || '';
    document.getElementById('cl-tipo').value      = datos.tipo        || '';
    document.getElementById('cl-sector').value    = datos.sector      || '';
    document.getElementById('cl-contacto').value  = datos.contacto_nombre || '';
    document.getElementById('cl-email').value     = datos.email       || '';
    document.getElementById('cl-telefono').value  = datos.telefono    || '';
    document.getElementById('cl-ciudad').value    = datos.ciudad      || '';
    document.getElementById('cl-estado').value    = datos.estado      || 'prospecto';
    document.getElementById('cl-notas').value     = datos.notas       || '';
  }
  abrirModal('modal-cliente');
}

function editarCliente(id) {
  const c = todosClientes.find(x => x.id === id);
  if (c) abrirModalCliente(c);
}

async function guardarCliente(e) {
  e.preventDefault();
  const id = document.getElementById('cliente-id').value;
  const data = {
    nombre:          document.getElementById('cl-nombre').value.trim(),
    tipo:            document.getElementById('cl-tipo').value,
    sector:          document.getElementById('cl-sector').value.trim(),
    contacto_nombre: document.getElementById('cl-contacto').value.trim(),
    email:           document.getElementById('cl-email').value.trim(),
    telefono:        document.getElementById('cl-telefono').value.trim(),
    ciudad:          document.getElementById('cl-ciudad').value.trim(),
    estado:          document.getElementById('cl-estado').value,
    notas:           document.getElementById('cl-notas').value.trim()
  };

  try {
    if (id) {
      await db.collection(COL_CLIENTES).doc(id).update(data);
      showToast('Cliente actualizado correctamente.');
    } else {
      data.created_at = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection(COL_CLIENTES).add(data);
      showToast('Cliente agregado al directorio.');
    }
    cerrarModal('modal-cliente');
    cargarDirectorio();
    cargarDashboard();
  } catch (err) {
    console.error(err);
    showToast('Error al guardar cliente.', 'error');
  }
}

function eliminarCliente(id, nombre) {
  confirmar(
    '¿Eliminar cliente?',
    `"${nombre}" será eliminado del directorio permanentemente.`,
    async () => {
      await db.collection(COL_CLIENTES).doc(id).delete();
      showToast('Cliente eliminado.');
      cargarDirectorio();
      cargarDashboard();
    }
  );
}

// ══════════════════════════════════════════════════════════════
//  COTIZADOR
// ══════════════════════════════════════════════════════════════
async function iniciarCotizador() {
  // Poblar dropdown de clientes
  try {
    const snap = await db.collection(COL_CLIENTES).orderBy('nombre').get();
    const sel  = document.getElementById('cot-cliente');
    sel.innerHTML = '<option value="">Selecciona un cliente...</option>';
    snap.docs.forEach(d => {
      const c = d.data();
      sel.innerHTML += `<option value="${d.id}" data-nombre="${c.nombre}">${c.nombre}</option>`;
    });
  } catch (err) { console.error(err); }

  // Renderizar catálogo de servicios
  renderCatalogo();
  calcularTotal();
}

function renderCatalogo() {
  const categorias = [...new Set(Object.values(SERVICIOS).map(s => s.categoria))];
  let html = '';
  categorias.forEach(cat => {
    html += `<p class="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 mt-4">${cat}</p>`;
    Object.entries(SERVICIOS).filter(([,s]) => s.categoria === cat).forEach(([key, s]) => {
      html += `
        <div class="service-row" id="row-${key}" onclick="toggleServicio('${key}')">
          <input type="checkbox" id="chk-${key}" class="flex-shrink-0"
            onclick="event.stopPropagation(); calcularTotal()">
          <span class="text-xl flex-shrink-0">${s.icono}</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm">${s.nombre}</p>
            <p class="text-xs text-gray-400 leading-tight mt-0.5">${s.desc}</p>
            <p class="text-xs text-indigo-600 font-bold mt-1">${fmt(s.precio)} / ${s.unidad}</p>
          </div>
          <div class="flex-shrink-0 flex flex-col items-center gap-1">
            <label class="text-xs text-gray-400">Cantidad</label>
            <input type="number" id="qty-${key}" min="1" value="1"
              class="text-center" style="width:75px"
              onclick="event.stopPropagation()"
              oninput="calcularTotal()">
          </div>
        </div>`;
    });
  });
  document.getElementById('catalogo-servicios').innerHTML = html;
}

function toggleServicio(key) {
  const chk = document.getElementById('chk-' + key);
  const row = document.getElementById('row-' + key);
  chk.checked = !chk.checked;
  row.classList.toggle('selected', chk.checked);
  calcularTotal();
}

function calcularTotal() {
  let total = 0;
  const lineas = [];
  Object.entries(SERVICIOS).forEach(([key, s]) => {
    const chk = document.getElementById('chk-' + key);
    const qty = document.getElementById('qty-' + key);
    if (!chk || !qty) return;
    const row = document.getElementById('row-' + key);
    row.classList.toggle('selected', chk.checked);
    if (chk.checked) {
      const cantidad  = parseFloat(qty.value) || 1;
      const subtotal  = s.precio * cantidad;
      total += subtotal;
      lineas.push({ nombre: s.nombre, cantidad, unidad: s.unidad, subtotal });
    }
  });

  document.getElementById('total-display').textContent = fmt(total);

  const resumen = document.getElementById('resumen-servicios');
  if (lineas.length === 0) {
    resumen.innerHTML = `<p class="text-indigo-300 text-xs">Selecciona servicios para ver el desglose.</p>`;
  } else {
    resumen.innerHTML = lineas.map(l => `
      <div class="flex justify-between items-start gap-2">
        <div>
          <p class="text-white text-xs font-semibold leading-tight">${l.nombre}</p>
          <p class="text-indigo-300 text-xs">${l.cantidad} ${l.unidad}</p>
        </div>
        <p class="text-white text-xs font-bold flex-shrink-0">${fmt(l.subtotal)}</p>
      </div>`).join('<hr class="border-indigo-400 border-opacity-20 my-2">');
  }
}

function onClienteChange() {
  // Podrías cargar historial del cliente aquí si se desea
}

function resetCotizador() {
  Object.keys(SERVICIOS).forEach(key => {
    const chk = document.getElementById('chk-' + key);
    const qty = document.getElementById('qty-' + key);
    const row = document.getElementById('row-' + key);
    if (chk) { chk.checked = false; }
    if (qty) qty.value = 1;
    if (row) row.classList.remove('selected');
  });
  calcularTotal();
}

async function guardarCotizacion(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');

  const serviciosSeleccionados = [];
  let totalCalc = 0;
  Object.entries(SERVICIOS).forEach(([key, s]) => {
    const chk = document.getElementById('chk-' + key);
    const qty = document.getElementById('qty-' + key);
    if (chk?.checked) {
      const cantidad = parseFloat(qty?.value) || 1;
      const subtotal = s.precio * cantidad;
      totalCalc += subtotal;
      serviciosSeleccionados.push({
        servicio_id:     key,
        nombre:          s.nombre,
        unidad:          s.unidad,
        precio_unitario: s.precio,
        cantidad,
        subtotal
      });
    }
  });

  if (serviciosSeleccionados.length === 0) {
    showToast('Selecciona al menos un servicio.', 'error');
    return;
  }

  const clienteEl  = document.getElementById('cot-cliente');
  const clienteId  = clienteEl.value;
  const clienteNom = clienteEl.selectedOptions[0]?.dataset.nombre || '';

  // Tarea 20 — validar cliente seleccionado
  if (!clienteId) {
    showToast('Selecciona un cliente antes de guardar.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Guardando...';

  // Tarea 15 — número automático de cotización
  const snapNum = await db.collection(COL_COTIZACIONES).get();
  const numero  = 'COT-' + String(snapNum.size + 1).padStart(4, '0');

  const data = {
    numero,
    cliente_id:    clienteId,
    cliente_nombre: clienteNom,
    modalidad:     document.getElementById('cot-modalidad').value,
    fecha_servicio: document.getElementById('cot-fecha').value,
    duracion:      document.getElementById('cot-duracion').value.trim(),
    notas:         document.getElementById('cot-notas').value.trim(),
    servicios:     serviciosSeleccionados,
    total:         totalCalc,
    estado:        'borrador',
    creado_por:    mmhUid || 'JesusRUTP',
    created_at:    firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection(COL_COTIZACIONES).add(data);
    showToast('Cotización guardada como borrador.');
    e.target.reset();
    resetCotizador();
    cargarDashboard();
  } catch (err) {
    console.error(err);
    showToast('Error al guardar la cotización.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ph-paper-plane-tilt-fill"></i> Guardar Cotización';
  }
}

// ══════════════════════════════════════════════════════════════
//  COTIZACIONES — historial y gestión
// ══════════════════════════════════════════════════════════════
async function cargarCotizaciones() {
  document.getElementById('lista-cotizaciones').innerHTML = `
    <div class="empty-state"><p class="font-semibold text-gray-400">Cargando...</p></div>`;
  try {
    const snap = await db.collection(COL_COTIZACIONES)
      .orderBy('created_at', 'desc').get();
    todasCotizaciones = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCotizaciones(todasCotizaciones);
  } catch (err) {
    console.error('Error cotizaciones:', err);
    document.getElementById('lista-cotizaciones').innerHTML =
      `<div class="empty-state"><p class="text-red-400">Error al cargar datos.</p></div>`;
  }
}

function renderCotizaciones(list) {
  const cont = document.getElementById('lista-cotizaciones');
  if (list.length === 0) {
    cont.innerHTML = `
      <div class="empty-state">
        <i class="ph-file-text text-5xl block mb-3 opacity-20"></i>
        <p class="font-semibold text-gray-500">Sin cotizaciones en esta categoría</p>
      </div>`;
    return;
  }

  cont.innerHTML = list.map(c => {
    const serviciosTexto = (c.servicios || [])
      .map(s => `${s.nombre} (×${s.cantidad})`).join(', ');
    return `
      <div class="card-panel mb-4 border-l-4 ${borderEstado(c.estado)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              ${c.numero ? `<span class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">${c.numero}</span>` : ''}
              <p class="font-bold text-gray-800 text-base">${c.cliente_nombre || '—'}</p>
              ${badgeEstadoCot(c.estado || 'borrador')}
              ${c.modalidad ? `<span class="badge badge-negociacion">${MODALIDAD_LABELS[c.modalidad] || c.modalidad}</span>` : ''}
            </div>
            <p class="text-xs text-gray-400">
              Creada: ${fmtFecha(c.created_at)}
              ${c.fecha_servicio ? ' · Servicio: ' + c.fecha_servicio : ''}
            </p>
            <p class="text-sm text-gray-500 mt-2 line-clamp-1">${serviciosTexto}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xl font-black text-gray-800">${fmt(c.total)}</p>
            <p class="text-xs text-gray-400">Total estimado</p>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-4 flex-wrap">
          <button class="btn-edit" onclick="verDetalleCot('${c.id}')">
            <i class="ph-eye-fill"></i> Ver detalle
          </button>
          <button class="btn-edit" onclick="enviarCotizacionEmail('${c.id}')"
            style="background:#eff6ff;color:#1d4ed8;">
            ✉️ Enviar por correo
          </button>
          <button class="btn-edit" onclick="imprimirCotizacion('${c.id}')"
            style="background:#f5f3ff;color:#7c3aed;">
            🖨️ Imprimir
          </button>
          ${c.estado === 'borrador' ? `
            <button class="btn-success" onclick="cambiarEstadoCot('${c.id}','enviada')">
              📤 Marcar como enviada
            </button>` : ''}
          ${c.estado === 'enviada' ? `
            <button class="btn-success" onclick="cambiarEstadoCot('${c.id}','aceptada')">
              ✅ Aceptada
            </button>
            <button class="btn-danger" onclick="cambiarEstadoCot('${c.id}','rechazada')">
              ❌ Rechazada
            </button>` : ''}
          ${['borrador','rechazada','cancelada'].includes(c.estado) ? `
            <button class="btn-danger" onclick="eliminarCot('${c.id}')">
              <i class="ph-trash-fill"></i>
            </button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function borderEstado(e) {
  return { borrador:'border-gray-300', enviada:'border-blue-400',
    aceptada:'border-green-400', rechazada:'border-red-400',
    cancelada:'border-yellow-400' }[e] || 'border-gray-300';
}

// filtrarCots y aplicarFiltrosCots definidos arriba (Tarea 16)

async function cambiarEstadoCot(id, nuevoEstado) {
  try {
    await db.collection(COL_COTIZACIONES).doc(id).update({ estado: nuevoEstado });
    showToast(`Cotización marcada como ${ESTADO_COT_LABELS[nuevoEstado]}.`);
    cargarCotizaciones();
    cargarDashboard();
  } catch (err) {
    showToast('Error al actualizar estado.', 'error');
  }
}

function eliminarCot(id) {
  confirmar(
    '¿Eliminar cotización?',
    'Se eliminará permanentemente y no podrá recuperarse.',
    async () => {
      await db.collection(COL_COTIZACIONES).doc(id).delete();
      showToast('Cotización eliminada.');
      cargarCotizaciones();
      cargarDashboard();
    }
  );
}

function verDetalleCot(id) {
  const c = todasCotizaciones.find(x => x.id === id);
  if (!c) return;

  const serviciosHTML = (c.servicios || []).map(s => `
    <tr>
      <td class="py-2 text-sm text-gray-700">${s.nombre}</td>
      <td class="py-2 text-sm text-center text-gray-600">${s.cantidad} ${s.unidad}</td>
      <td class="py-2 text-sm text-right text-gray-600">${fmt(s.precio_unitario)}</td>
      <td class="py-2 text-sm text-right font-bold text-gray-800">${fmt(s.subtotal)}</td>
    </tr>`).join('');

  document.getElementById('cot-detalle-contenido').innerHTML = `
    <div class="grid-2 mb-6">
      <div>
        <p class="label-field">Cliente</p>
        <p class="font-bold text-gray-800">${c.cliente_nombre || '—'}</p>
      </div>
      <div>
        <p class="label-field">Estado</p>
        ${badgeEstadoCot(c.estado || 'borrador')}
      </div>
      <div>
        <p class="label-field">Modalidad</p>
        <p class="text-gray-700">${MODALIDAD_LABELS[c.modalidad] || c.modalidad || '—'}</p>
      </div>
      <div>
        <p class="label-field">Fecha de servicio</p>
        <p class="text-gray-700">${c.fecha_servicio || '—'}</p>
      </div>
      ${c.duracion ? `<div>
        <p class="label-field">Duración</p>
        <p class="text-gray-700">${c.duracion}</p>
      </div>` : ''}
      <div>
        <p class="label-field">Fecha de creación</p>
        <p class="text-gray-700">${fmtFecha(c.created_at)}</p>
      </div>
    </div>

    ${c.notas ? `<div class="bg-gray-50 rounded-lg p-3 mb-5">
      <p class="label-field">Notas</p>
      <p class="text-sm text-gray-600">${c.notas}</p>
    </div>` : ''}

    <h3 class="font-bold text-gray-700 mb-3">Servicios cotizados</h3>
    <div class="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Servicio</th><th class="text-center">Cantidad</th>
            <th class="text-right">Precio unitario</th><th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${serviciosHTML}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-right font-bold text-gray-700 pt-3">Total estimado:</td>
            <td class="text-right font-black text-xl text-indigo-600 pt-3">${fmt(c.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="text-xs text-gray-400 mt-3">* Precios en MXN · IVA no incluido</p>
    <div class="flex gap-3 mt-5">
      <button onclick="imprimirCotizacion('${c.id}')"
        class="btn-primary flex items-center gap-2" style="background:#7c3aed;">
        🖨️ Imprimir cotización
      </button>
      <button onclick="enviarCotizacionEmail('${c.id}')"
        class="btn-primary flex items-center gap-2">
        ✉️ Enviar por correo
      </button>
    </div>`;

  abrirModal('modal-cot-detalle');
}

// ══════════════════════════════════════════════════════════════
//  SOLICITUDES WEB (tiempo real con onSnapshot)
// ══════════════════════════════════════════════════════════════
const COL_SOLS = 'solicitudes_contacto';
let todasSolicitudes  = [];
let unsubscribeSols   = null;   // para desuscribir el listener si se necesita

const SERVICIO_LABELS = {
  interpretacion_vivo:        'Interpretación en vivo (TV/Noticias)',
  interpretacion_conferencia: 'Interpretación en eventos/conferencias',
  interpretacion_online:      'Interpretación remota/online',
  capacitacion:               'Capacitación LSM para equipos',
  taller_sensibilizacion:     'Taller de sensibilización',
  consultoria:                'Consultoría de accesibilidad',
  subtitulacion:              'Subtitulación y transcripción',
  otro:                       'Otro / No está seguro'
};

/** Inicia el listener en tiempo real de Firestore */
function iniciarListenerSolicitudes() {
  if (unsubscribeSols) return; // ya activo
  unsubscribeSols = db.collection(COL_SOLS)
    .orderBy('created_at', 'desc')
    .onSnapshot(snap => {
      todasSolicitudes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      actualizarBadgeSols();

      // Si la sección está visible, re-renderizar
      const sec = document.getElementById('sec-solicitudes');
      if (sec && sec.classList.contains('active')) {
        renderSolicitudes(todasSolicitudes);
      }
    }, err => {
      console.error('Error listener solicitudes:', err);
    });
}

function actualizarBadgeSols() {
  const nuevas = todasSolicitudes.filter(s => s.estado === 'nueva').length;
  const badge  = document.getElementById('badge-sols');
  const dot    = document.getElementById('sols-live-dot');
  if (badge) {
    badge.textContent = nuevas > 0 ? nuevas : '';
    badge.classList.toggle('hidden', nuevas === 0);
  }
  if (dot) dot.classList.toggle('hidden', nuevas === 0);
}

function renderSolicitudes(list) {
  const cont = document.getElementById('lista-solicitudes');
  if (!cont) return;

  if (list.length === 0) {
    cont.innerHTML = `
      <div class="empty-state">
        <i class="ph-bell text-5xl block mb-3 opacity-20"></i>
        <p class="font-semibold text-gray-500">Sin solicitudes en esta categoría</p>
      </div>`;
    return;
  }

  const ESTADO_SOL = {
    nueva:    '🔔 Nueva',
    revisada: '👁️ Revisada',
    aceptada: '✅ Aceptada',
    rechazada:'❌ Rechazada'
  };

  cont.innerHTML = list.map(s => {
    const servLabel = SERVICIO_LABELS[s.servicio_interes] || s.servicio_interes || '—';
    const fechaStr  = fmtFecha(s.created_at);
    const estadoClass = s.estado || 'nueva';

    return `
      <div class="solicitud-card ${estadoClass}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <p class="font-bold text-gray-800 text-base">${s.nombre || '—'}</p>
              <span class="badge badge-${estadoClass}">${ESTADO_SOL[estadoClass] || estadoClass}</span>
              ${estadoClass === 'nueva' ? '<span class="notif-dot"></span>' : ''}
            </div>
            ${s.empresa ? `<p class="text-xs text-indigo-600 font-semibold mb-1">🏢 ${s.empresa}</p>` : ''}
            <p class="text-xs text-gray-400 mb-2">
              Recibida: ${fechaStr}
              ${s.fuente === 'formulario_web' ? ' · vía formulario web' : ''}
            </p>
            <div class="grid grid-cols-1 gap-1 text-sm text-gray-600">
              ${s.email    ? `<span>✉️ <a href="mailto:${s.email}" class="text-blue-500 hover:underline">${s.email}</a></span>` : ''}
              ${s.telefono ? `<span>📞 ${s.telefono}</span>` : ''}
              <span>📋 Servicio: <strong>${servLabel}</strong></span>
            </div>
            ${s.mensaje ? `
              <div class="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-1">Mensaje</p>
                <p class="text-sm text-gray-700">${s.mensaje}</p>
              </div>` : ''}
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-2 mt-4 flex-wrap">
          ${s.estado !== 'aceptada' ? `
            <button class="btn-success" onclick="cambiarEstadoSol('${s.id}','aceptada')">
              ✅ Aceptar solicitud
            </button>` : ''}
          ${s.estado !== 'rechazada' ? `
            <button class="btn-danger" onclick="cambiarEstadoSol('${s.id}','rechazada')">
              ❌ Rechazar
            </button>` : ''}
          ${s.estado === 'nueva' ? `
            <button class="btn-edit" onclick="cambiarEstadoSol('${s.id}','revisada')">
              👁️ Marcar revisada
            </button>` : ''}
          ${s.email ? `
            <a href="mailto:${s.email}?subject=${encodeURIComponent('Re: Tu solicitud - Mis Manos Hablarán')}&body=${encodeURIComponent('Hola ' + (s.nombre||'') + ',\n\nRecibimos tu solicitud sobre: ' + servLabel + '.\n\nNos pondremos en contacto contigo a la brevedad para coordinar los detalles.\n\nSaludos,\nMis Manos Hablarán')}"
              class="btn-edit" style="background:#eff6ff;color:#2563eb;">
              ✉️ Responder por correo
            </a>` : ''}
          ${(s.estado === 'nueva' || s.estado === 'revisada') ? `
            <button class="btn-edit" style="background:#f0fdf4;color:#15803d;"
              onclick="convertirEnCliente('${s.id}')">
              🏢 Convertir en cliente
            </button>` : ''}
          ${(s.estado === 'aceptada' || s.estado === 'rechazada') ? `
            <button class="btn-danger" onclick="eliminarSolicitud('${s.id}')">
              <i class="ph-trash-fill"></i> Eliminar
            </button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function filtrarSols(estado, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.className = 'tab-btn inactive text-xs');
  btn.className = 'tab-btn active text-xs';
  const filt = estado === 'todas'
    ? todasSolicitudes
    : todasSolicitudes.filter(s => s.estado === estado);
  renderSolicitudes(filt);
}

function convertirEnCliente(solId) {
  const s = todasSolicitudes.find(x => x.id === solId);
  if (!s) return;

  // Pre-llenar el modal de cliente con los datos de la solicitud
  document.getElementById('form-cliente').reset();
  document.getElementById('cliente-id').value    = '';
  document.getElementById('modal-cliente-titulo').textContent = 'Nuevo Cliente (desde solicitud)';
  document.getElementById('cl-nombre').value     = s.empresa  || s.nombre || '';
  document.getElementById('cl-contacto').value   = s.nombre   || '';
  document.getElementById('cl-email').value      = s.email    || '';
  document.getElementById('cl-telefono').value   = s.telefono || '';
  document.getElementById('cl-estado').value     = 'prospecto';
  document.getElementById('cl-notas').value      =
    `Solicitud web: ${s.servicio_interes || ''}\n${s.mensaje || ''}`.trim();

  abrirModal('modal-cliente');
  showToast('Datos pre-cargados desde la solicitud. Completa el formulario.');
}

async function cambiarEstadoSol(id, nuevoEstado) {
  try {
    const sol = todasSolicitudes.find(x => x.id === id);
    await db.collection(COL_SOLS).doc(id).update({ estado: nuevoEstado });

    if (nuevoEstado === 'aceptada' && sol) {
      // Verificar si ya existe un cliente con ese email para no duplicar
      const emailCliente = sol.email || '';
      let yaExiste = false;
      if (emailCliente) {
        const snap = await db.collection(COL_CLIENTES)
          .where('email', '==', emailCliente).limit(1).get();
        yaExiste = !snap.empty;
      }

      if (!yaExiste) {
        const nuevoCliente = {
          nombre:          sol.empresa || sol.nombre || 'Sin nombre',
          tipo:            'empresa',
          sector:          '',
          contacto_nombre: sol.nombre  || '',
          email:           emailCliente,
          telefono:        sol.telefono || '',
          ciudad:          '',
          estado:          'prospecto',
          notas:           ('Solicitud web: ' + (sol.servicio_interes || '') +
                           (sol.mensaje ? '\n' + sol.mensaje : '')).trim(),
          created_at:      firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection(COL_CLIENTES).add(nuevoCliente);
        showToast('Solicitud aceptada y cliente creado en el directorio.');
      } else {
        showToast('Solicitud aceptada. El cliente ya existía en el directorio.');
      }
      cargarDashboard();
    } else {
      showToast(nuevoEstado === 'rechazada' ? 'Solicitud rechazada.' : 'Estado actualizado.');
    }
  } catch (err) {
    console.error(err);
    showToast('Error al actualizar.', 'error');
  }
}

// ══════════════════════════════════════════════════════════════
//  TAREA 16 — BUSCAR + FILTRAR COTIZACIONES
// ══════════════════════════════════════════════════════════════
let estadoFiltroActual = 'todas';

function filtrarCots(estado, btn) {
  estadoFiltroActual = estado;
  document.querySelectorAll('.tab-btn').forEach(b => b.className = 'tab-btn inactive');
  btn.className = 'tab-btn active';
  aplicarFiltrosCots();
}

function aplicarFiltrosCots() {
  const q = (document.getElementById('search-cots')?.value || '').toLowerCase().trim();
  let filt = estadoFiltroActual === 'todas'
    ? todasCotizaciones
    : todasCotizaciones.filter(c => c.estado === estadoFiltroActual);
  if (q) filt = filt.filter(c => (c.cliente_nombre || '').toLowerCase().includes(q));
  renderCotizaciones(filt);
}

// ══════════════════════════════════════════════════════════════
//  TAREA 17 — ENVIAR COTIZACIÓN POR CORREO
// ══════════════════════════════════════════════════════════════
function enviarCotizacionEmail(id) {
  const c = todasCotizaciones.find(x => x.id === id);
  if (!c) return;

  const serviciosTexto = (c.servicios || [])
    .map(s => `  • ${s.nombre}: ${s.cantidad} ${s.unidad} — ${fmt(s.subtotal)}`)
    .join('\n');

  const cuerpo =
`Estimado/a equipo de ${c.cliente_nombre || 'cliente'},

Adjuntamos la cotización ${c.numero || ''} de servicios LSM de Mis Manos Hablarán.

DETALLE DE SERVICIOS:
${serviciosTexto}

TOTAL ESTIMADO: ${fmt(c.total)} MXN (IVA no incluido)

Modalidad: ${c.modalidad || '—'}
Fecha de servicio: ${c.fecha_servicio || '—'}
${c.duracion ? 'Duración: ' + c.duracion : ''}
${c.notas ? '\nNotas: ' + c.notas : ''}

Quedamos a sus órdenes para cualquier aclaración.

Atentamente,
Mis Manos Hablarán
lenguajedeseniasmx29@gmail.com`;

  const asunto = encodeURIComponent(`Cotización ${c.numero || ''} — Mis Manos Hablarán`);
  const body   = encodeURIComponent(cuerpo);
  window.open(`mailto:?subject=${asunto}&body=${body}`);
}

// ══════════════════════════════════════════════════════════════
//  TAREA 18 — IMPRIMIR COTIZACIÓN
// ══════════════════════════════════════════════════════════════
function imprimirCotizacion(id) {
  const c = todasCotizaciones.find(x => x.id === id);
  if (!c) return;

  // Construir filas con concatenación para evitar conflictos con template literals anidados
  let filas = '';
  (c.servicios || []).forEach(function(s) {
    filas += '<tr>' +
      '<td>' + s.nombre + '</td>' +
      '<td style="text-align:center">' + s.cantidad + ' ' + s.unidad + '</td>' +
      '<td style="text-align:right">' + fmt(s.precio_unitario) + '</td>' +
      '<td style="text-align:right"><strong>' + fmt(s.subtotal) + '</strong></td>' +
      '</tr>';
  });

  const duracionHtml = c.duracion
    ? '<div class="field"><label>Duración</label><span>' + c.duracion + '</span></div>' : '';
  const notasHtml = c.notas
    ? '<div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:24px;">' +
      '<label style="font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Notas</label>' +
      '<p style="font-size:13px;margin-top:4px;color:#475569;">' + c.notas + '</p></div>' : '';

  const html =
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<title>Cotizacion ' + (c.numero || '') + '</title>' +
    '<style>' +
    'body{font-family:Segoe UI,sans-serif;color:#1e293b;margin:40px}' +
    'h1{color:#4f46e5;font-size:22px;margin-bottom:4px}' +
    '.sub{color:#64748b;font-size:13px;margin-bottom:28px}' +
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}' +
    '.field label{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;display:block;margin-bottom:2px}' +
    '.field span{font-size:14px;font-weight:600;color:#1e293b}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:16px}' +
    'th{background:#f1f5f9;padding:10px 14px;font-size:11px;text-transform:uppercase;text-align:left}' +
    'td{padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px}' +
    '.total-row td{font-size:16px;font-weight:800;color:#4f46e5;border-top:2px solid #e2e8f0}' +
    '.footer{margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:14px}' +
    '@media print{body{margin:20px}}' +
    '</style></head><body>' +
    '<h1>Mis Manos Hablaran</h1>' +
    '<p class="sub">Servicios de Lengua de Senas Mexicana - lenguajedeseniasmx29@gmail.com</p>' +
    '<div class="grid">' +
    '<div class="field"><label>Numero de cotizacion</label><span>' + (c.numero || '—') + '</span></div>' +
    '<div class="field"><label>Cliente</label><span>' + (c.cliente_nombre || '—') + '</span></div>' +
    '<div class="field"><label>Modalidad</label><span>' + (c.modalidad || '—') + '</span></div>' +
    '<div class="field"><label>Fecha de servicio</label><span>' + (c.fecha_servicio || '—') + '</span></div>' +
    duracionHtml +
    '<div class="field"><label>Estado</label><span>' + (c.estado || 'borrador') + '</span></div>' +
    '</div>' +
    notasHtml +
    '<h2 style="font-size:15px;font-weight:700;margin-bottom:12px;">Servicios cotizados</h2>' +
    '<table><thead><tr>' +
    '<th>Servicio</th><th style="text-align:center">Cantidad</th>' +
    '<th style="text-align:right">Precio unitario</th><th style="text-align:right">Subtotal</th>' +
    '</tr></thead><tbody>' + filas + '</tbody>' +
    '<tfoot><tr class="total-row">' +
    '<td colspan="3" style="text-align:right">Total estimado:</td>' +
    '<td style="text-align:right">' + fmt(c.total) + '</td>' +
    '</tr></tfoot></table>' +
    '<p style="font-size:11px;color:#94a3b8;">* Precios en MXN - IVA no incluido</p>' +
    '<div class="footer">Mis Manos Hablaran - lenguajedeseniasmx29@gmail.com - (222) 862-2800</div>' +
    '</body></html>';

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ══════════════════════════════════════════════════════════════
//  TAREA 19 — ELIMINAR SOLICITUD
// ══════════════════════════════════════════════════════════════
function eliminarSolicitud(id) {
  confirmar(
    '¿Eliminar solicitud?',
    'Se eliminará permanentemente del registro.',
    async () => {
      await db.collection(COL_SOLS).doc(id).delete();
      showToast('Solicitud eliminada.');
    }
  );
}

// ── Actualizar showSection para iniciar el listener ──────────
const _showSectionOriginal = showSection;
showSection = function(id, el) {
  _showSectionOriginal(id, el);
  if (id === 'solicitudes') {
    iniciarListenerSolicitudes();
    renderSolicitudes(todasSolicitudes);
  }
};

// (Inicio gestionado por auth.onAuthStateChanged arriba)

// ══════════════════════════════════════════════════════════════