// ══════════════════════════════════════════════════════════════════════
//  BOT DE WHATSAPP — Mis Manos Hablarán · Accesibilidad en Medios
//  Stack: Node.js + Express + Meta Cloud API + Firebase Admin
//  Deploy: Railway.app (gratis)
// ══════════════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const admin   = require('firebase-admin');

const app  = express();
app.use(express.json());

// ── Firebase Admin ────────────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert({
    projectId:    process.env.FIREBASE_PROJECT_ID,
    clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:   process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});
const db = admin.firestore();

// ── Constantes Meta API ───────────────────────────────────────────────
const TOKEN          = (process.env.WHATSAPP_TOKEN || '').trim();  // Tu token de acceso de Meta
const PHONE_ID       = process.env.PHONE_NUMBER_ID;       // ID del número en Meta
const VERIFY_TOKEN   = process.env.WEBHOOK_VERIFY_TOKEN;  // Token secreto para verificar webhook
const API_URL        = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

// ── Estado conversacional por usuario (en memoria) ────────────────────
// Formato: { "521234567890": { paso: "nombre", datos: { nombre, empresa, email, servicio } } }
const sesiones = {};

// ── Servicios disponibles (deben coincidir con usuariointerno.html) ───
const SERVICIOS = [
  { id: 'interpretacion_evento',   label: 'Interpretación en evento' },
  { id: 'capacitacion_empresa',    label: 'Capacitación a empresa'   },
  { id: 'subtitulacion_video',     label: 'Subtitulación de video'   },
  { id: 'taller_sensibilizacion',  label: 'Taller de sensibilización'},
  { id: 'consultoria_accesibilidad', label: 'Consultoría de accesibilidad' },
  { id: 'otro',                    label: 'Otro / No sé aún'         }
];

// ══════════════════════════════════════════════════════════════════════
//  FUNCIONES DE ENVÍO
// ══════════════════════════════════════════════════════════════════════

async function enviarMensaje(to, body) {
  try {
    await axios.post(API_URL, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body, preview_url: false }
    }, { headers: { Authorization: `Bearer ${TOKEN}` } });
  } catch (err) {
    console.error('Error Meta API (texto):', JSON.stringify(err.response?.data || err.message));
    throw err;
  }
}

// Menú de texto numerado (compatible con apps en modo desarrollo)
async function enviarBotones(to, bodyText, botones) {
  const opciones = botones.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
  await enviarMensaje(to, `${bodyText}\n\n${opciones}\n\nResponde con el número de tu opción.`);
}

async function enviarLista(to, bodyText, titulo, filas) {
  const opciones = filas.map((f, i) => `${i + 1}. ${f.title}`).join('\n');
  await enviarMensaje(to, `${bodyText}\n\n${opciones}\n\nResponde con el número de tu opción.`);
}

// ══════════════════════════════════════════════════════════════════════
//  FLUJO CONVERSACIONAL
// ══════════════════════════════════════════════════════════════════════

async function manejarMensaje(telefono, texto, idBoton) {
  const entrada = (idBoton || texto || '').trim().toLowerCase();

  // Obtener o crear sesión
  if (!sesiones[telefono]) {
    sesiones[telefono] = { paso: 'inicio', datos: {} };
  }
  const s = sesiones[telefono];

  // ── REINICIO en cualquier momento ──────────────────────────────────
  if (entrada === 'menu' || entrada === 'inicio' || entrada === 'hola' ||
      entrada === 'hi' || entrada === 'hello' || entrada === 'buenas' ||
      entrada === 'buenos dias' || entrada === 'buenas tardes' ||
      s.paso === 'inicio') {
    sesiones[telefono] = { paso: 'menu', datos: {} };
    await enviarBotones(
      telefono,
      '👋 Hola! Soy el asistente de *Mis Manos Hablarán*.\n\n' +
      '🤟 Somos especialistas en servicios de *Lengua de Señas Mexicana* para empresas, medios e instituciones.\n\n' +
      '¿En qué te puedo ayudar hoy?',
      [
        { id: 'btn_cotizar',  title: 'Quiero cotizar'   },
        { id: 'btn_info',     title: 'Mas informacion'  },
        { id: 'btn_contacto', title: 'Hablar con alguien'}
      ]
    );
    return;
  }

  // ── MENÚ PRINCIPAL ─────────────────────────────────────────────────
  if (s.paso === 'menu') {

    if (entrada === 'btn_cotizar' || entrada === '1' || entrada === 'cotizar') {
      s.paso = 'nombre';
      await enviarMensaje(telefono,
        '¡Perfecto! Vamos a preparar tu cotización. 📋\n\n' +
        'Primero, ¿cuál es tu *nombre completo*?'
      );

    } else if (entrada === 'btn_info' || entrada === '2') {
      await enviarMensaje(telefono,
        '📚 *Nuestros servicios incluyen:*\n\n' +
        '• 🎤 Interpretación LSM en eventos y conferencias\n' +
        '• 🎓 Capacitaciones para empresas\n' +
        '• 🎥 Subtitulación y traducción de videos\n' +
        '• 🏢 Talleres de sensibilización\n' +
        '• 📋 Consultoría en accesibilidad\n\n' +
        '📞 Teléfono: (222) 862-2800\n' +
        '📧 Email: lenguajeDeSeñasMx@gmail.com\n\n' +
        'Escribe *menu* para volver al inicio o *cotizar* para solicitar un presupuesto.'
      );

    } else if (entrada === 'btn_contacto' || entrada === '3') {
      s.paso = 'esperando_contacto';
      await enviarMensaje(telefono,
        '👤 En breve un asesor te contactará.\n\n' +
        'Mientras tanto, puedes llamarnos al *(222) 862-2800* o escribirnos a *lenguajeDeSeñasMx@gmail.com*.\n\n' +
        'También puedes escribir *cotizar* si prefieres recibir una cotización automática.'
      );
      // Notificar al coordinador vía Firestore
      await db.collection('solicitudes_contacto').add({
        nombre:          'Desconocido',
        empresa:         '',
        email:           '',
        telefono:        telefono,
        servicio_interes:'Solicitud de contacto directo',
        mensaje:         'El usuario solicitó hablar con un asesor desde WhatsApp',
        estado:          'nueva',
        fuente:          'whatsapp_bot',
        created_at:      admin.firestore.FieldValue.serverTimestamp()
      });

    } else {
      // No reconoció la opción, mostrar menú de nuevo
      await enviarBotones(
        telefono,
        'Por favor elige una de las opciones:',
        [
          { id: 'btn_cotizar',  title: 'Quiero cotizar'    },
          { id: 'btn_info',     title: 'Mas informacion'   },
          { id: 'btn_contacto', title: 'Hablar con alguien'}
        ]
      );
    }
    return;
  }

  // ── FLUJO DE COTIZACIÓN ─────────────────────────────────────────────

  if (s.paso === 'nombre') {
    if (texto.length < 2) {
      await enviarMensaje(telefono, 'Por favor ingresa tu nombre completo.');
      return;
    }
    s.datos.nombre = texto;
    s.paso = 'empresa';
    await enviarMensaje(telefono,
      `Gracias, *${s.datos.nombre}*! 😊\n\n¿A qué *empresa o institución* representas?\n_(Si eres freelance o independiente, escribe "Independiente")_`
    );
    return;
  }

  if (s.paso === 'empresa') {
    s.datos.empresa = texto;
    s.paso = 'email';
    await enviarMensaje(telefono,
      `¿Cuál es tu *correo electrónico* de contacto?`
    );
    return;
  }

  if (s.paso === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(texto)) {
      await enviarMensaje(telefono, '❌ Ese correo no parece válido. Por favor escríbelo de nuevo (ej: nombre@empresa.com)');
      return;
    }
    s.datos.email = texto;
    s.paso = 'servicio';
    await enviarLista(
      telefono,
      '¿Qué tipo de servicio necesitas?',
      'Servicios disponibles',
      SERVICIOS.map(sv => ({ id: sv.id, title: sv.label }))
    );
    return;
  }

  if (s.paso === 'servicio') {
    // Puede llegar como idBoton (lista) o texto
    const servicioId = idBoton || entrada;
    const numIndex = parseInt(entrada) - 1;
    const servicio = SERVICIOS.find(sv => sv.id === servicioId) ||
                     SERVICIOS.find(sv => sv.label.toLowerCase() === entrada) ||
                     (numIndex >= 0 && numIndex < SERVICIOS.length ? SERVICIOS[numIndex] : null);

    if (!servicio) {
      await enviarLista(
        telefono,
        'Por favor selecciona una opción de la lista:',
        'Servicios disponibles',
        SERVICIOS.map(sv => ({ id: sv.id, title: sv.label }))
      );
      return;
    }

    s.datos.servicio = servicio.label;
    s.datos.servicioId = servicio.id;
    s.paso = 'confirmacion';

    await enviarBotones(
      telefono,
      `📋 *Resumen de tu solicitud:*\n\n` +
      `👤 Nombre: ${s.datos.nombre}\n` +
      `🏢 Empresa: ${s.datos.empresa}\n` +
      `📧 Email: ${s.datos.email}\n` +
      `📞 WhatsApp: ${telefono}\n` +
      `🤟 Servicio: ${s.datos.servicio}\n\n` +
      `¿Los datos son correctos?`,
      [
        { id: 'btn_confirmar', title: 'Confirmar'    },
        { id: 'btn_cancelar',  title: 'Corregir'    }
      ]
    );
    return;
  }

  if (s.paso === 'confirmacion') {
    if (entrada === 'btn_confirmar' || entrada === '1' || entrada === 'confirmar' || entrada === 'si' || entrada === 'sí') {
      // Guardar en Firestore
      try {
        await db.collection('solicitudes_contacto').add({
          nombre:          s.datos.nombre,
          empresa:         s.datos.empresa,
          email:           s.datos.email,
          telefono:        telefono,
          servicio_interes: s.datos.servicio,
          mensaje:         `Solicitud generada desde WhatsApp Bot. Servicio: ${s.datos.servicio}`,
          estado:          'nueva',
          fuente:          'whatsapp_bot',
          created_at:      admin.firestore.FieldValue.serverTimestamp()
        });

        sesiones[telefono] = { paso: 'inicio', datos: {} };

        await enviarMensaje(telefono,
          '✅ *¡Solicitud enviada con éxito!*\n\n' +
          `Hola *${s.datos.nombre}*, hemos registrado tu solicitud para el servicio de *${s.datos.servicio}*.\n\n` +
          '📬 Un coordinador revisará tu solicitud y te contactará en *menos de 24 horas* para confirmar tu cotización.\n\n' +
          '📞 Si necesitas atención urgente: *(222) 862-2800*\n' +
          '📧 Email: lenguajeDeSeñasMx@gmail.com\n\n' +
          'Escribe *menu* si necesitas algo más. ¡Gracias! 🤟'
        );

      } catch (err) {
        console.error('Error guardando en Firestore:', err);
        await enviarMensaje(telefono,
          '❌ Hubo un error al guardar tu solicitud. Por favor contáctanos directamente:\n\n' +
          '📞 (222) 862-2800\n📧 lenguajeDeSeñasMx@gmail.com'
        );
      }

    } else if (entrada === 'btn_cancelar' || entrada === '2' || entrada === 'corregir' || entrada === 'no') {
      sesiones[telefono] = { paso: 'nombre', datos: {} };
      await enviarMensaje(telefono, 'Sin problema, empecemos de nuevo.\n\n¿Cuál es tu *nombre completo*?');

    } else {
      await enviarBotones(
        telefono,
        '¿Confirmas los datos?',
        [
          { id: 'btn_confirmar', title: '✅ Confirmar' },
          { id: 'btn_cancelar',  title: '✏️ Corregir'  }
        ]
      );
    }
    return;
  }

  // ── Paso desconocido → reiniciar ──────────────────────────────────
  sesiones[telefono] = { paso: 'inicio', datos: {} };
  await manejarMensaje(telefono, 'hola', null);
}

// ══════════════════════════════════════════════════════════════════════
//  WEBHOOK — Verificación (GET)
// ══════════════════════════════════════════════════════════════════════

app.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado por Meta.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ══════════════════════════════════════════════════════════════════════
//  WEBHOOK — Recepción de mensajes (POST)
// ══════════════════════════════════════════════════════════════════════

app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Responder siempre 200 rápido a Meta

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry    = body.entry?.[0];
    const changes  = entry?.changes?.[0];
    const value    = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg      = messages[0];
    const telefono = msg.from; // número del usuario (ej: 521234567890)
    let texto   = null;
    let idBoton = null;

    if (msg.type === 'text') {
      texto = msg.text.body;

    } else if (msg.type === 'interactive') {
      const interactive = msg.interactive;
      if (interactive.type === 'button_reply') {
        idBoton = interactive.button_reply.id;
        texto   = interactive.button_reply.title;
      } else if (interactive.type === 'list_reply') {
        idBoton = interactive.list_reply.id;
        texto   = interactive.list_reply.title;
      }
    }

    if (!texto && !idBoton) return;

    console.log(`📩 Mensaje de ${telefono}: ${idBoton || texto}`);
    await manejarMensaje(telefono, texto, idBoton);

  } catch (err) {
    console.error('Error procesando webhook:', err);
  }
});

// ══════════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Bot WhatsApp Mis Manos Hablarán' });
});

// ── Diagnóstico: verifica token y número ──────────────────────────────
app.get('/debug', async (req, res) => {
  try {
    // 1. Verificar token
    const tokenCheck = await axios.get(
      `https://graph.facebook.com/v22.0/me?access_token=${TOKEN}`
    );
    // 2. Verificar phone number ID
    const phoneCheck = await axios.get(
      `https://graph.facebook.com/v22.0/${PHONE_ID}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    res.json({
      token_ok: true,
      token_info: tokenCheck.data,
      phone_info: phoneCheck.data
    });
  } catch (err) {
    res.json({
      token_ok: false,
      error: err.response?.data || err.message
    });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  INICIO DEL SERVIDOR
// ══════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot corriendo en puerto ${PORT}`);
  console.log(`📡 Webhook URL: https://TU_URL_RAILWAY/webhook`);
});
