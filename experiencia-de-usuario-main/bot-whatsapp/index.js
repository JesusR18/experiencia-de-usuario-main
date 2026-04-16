// ══════════════════════════════════════════════════════════════════════
//  Servidor estático — Mis Manos Hablarán
//  Sirve la carpeta Proyecto/ como sitio web
// ══════════════════════════════════════════════════════════════════════

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Carpeta de páginas (sube un nivel desde bot-whatsapp/ hasta Proyecto/)
const STATIC_DIR = path.join(__dirname, '../Proyecto');

// Servir todos los archivos estáticos (HTML, CSS, JS, imágenes, etc.)
app.use(express.static(STATIC_DIR));

// Cualquier ruta no encontrada devuelve index.html (página de acceso)
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Mis Manos Hablarán corriendo en puerto ${PORT}`);
});
