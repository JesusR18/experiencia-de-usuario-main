const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Proyecto', 'landing_accesibilidad.html'));
});

app.use(express.static(path.join(__dirname, 'Proyecto')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Proyecto', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mis Manos Hablarán corriendo en puerto ${PORT}`);
});
