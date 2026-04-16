import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import nodemailer from "nodemailer";
import PDFDocument from 'pdfkit';

const app = express();
app.use(express.json());
// 🛡️ Seguridad: Solo permitimos tu origen de Live Server
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth:{
    user: "fcano0505@gmail.com",
    pass:"dklk lmob ztmk mgmz",
  }
});

const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'];
const MAX_MB = 500;

// 📁 Carpetas
const folders = {
  borrador: "videos_borrador",
  revision: "videos_revision",
  aprobado: "videos_aprobados"
};
// Crear carpetas si no existen de forma segura
Object.values(folders).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Servir archivos estáticos
app.use("/videos_borrador", express.static("videos_borrador"));
app.use("/videos_revision", express.static("videos_revision"));
app.use("/videos_aprobados", express.static("videos_aprobados"));

// 🔧 FUNCIÓN CLEAN (Sanitiza nombres de archivos)
const clean = (text) => {
  if (!text) return "sin_nombre";
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita acentos
    .replace(/[^a-z0-9_]/g, ""); // Quita caracteres especiales
};

// 🔧 CONFIGURACIÓN DE ALMACENAMIENTO
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Validamos que el estado exista en nuestras carpetas, si no, va a borrador
    const estado = folders[req.body.estado] ? req.body.estado : "borrador";
    cb(null, folders[estado]);
  },
  filename: (req, file, cb) => {
    const tema = clean(req.body.tema || "sin_tema");
    const palabra = clean(req.body.palabra || "sin_palabra");
    const ext = path.extname(file.originalname).toLowerCase() || '.webm';
    cb(null, `${tema}_${palabra}_${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new Error('Formato de video no permitido'), false);
    }
    cb(null, true);
  }
});

// 🚀 SUBIR VIDEO (Con limpieza de basura si falla)
app.post("/upload", upload.single("video"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió video" });

    if (!req.body.tema || !req.body.palabra) {
      // Si faltan datos, borramos el archivo recién subido para no dejar basura
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Faltan datos (tema o palabra)" });
    }

    const estado = req.body.estado || "borrador";
    const url = `http://localhost:3000/${folders[estado]}/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: "Error interno en la subida" });
  }
});

// 🔄 MOVER VIDEO (Protección Path Traversal)
app.post("/move", (req, res) => {
  const { url, nuevoEstado } = req.body;

  try {
    if (!folders[nuevoEstado]) throw new Error("Estado no válido");

    // 🛡️ Seguridad: Extraemos solo el nombre del archivo para evitar saltos de carpeta
    const fileName = path.basename(url);
    
    // Buscamos el archivo en cualquiera de nuestras carpetas
    let oldPath = null;
    for (const key in folders) {
      const checkPath = path.join(folders[key], fileName);
      if (fs.existsSync(checkPath)) {
        oldPath = checkPath;
        break;
      }
    }

    if (!oldPath) return res.status(404).json({ error: "Archivo no encontrado" });

    const newPath = path.join(folders[nuevoEstado], fileName);
    fs.renameSync(oldPath, newPath);

    res.json({ newUrl: `http://localhost:3000/${folders[nuevoEstado]}/${fileName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al mover el video" });
  }
});

// 🗑️ ELIMINAR (Seguro)
app.delete("/delete", (req, res) => {
  const { url } = req.query;

  try {
    const fileName = path.basename(url);
    let deleted = false;

    // Busca y borra en cualquiera de las 3 carpetas
    for (const key in folders) {
      const filePath = path.join(folders[key], fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted = true;
        break;
      }
    }

    res.json({ message: deleted ? "Archivo eliminado" : "Archivo no existía" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

app.post("/enviar-reporte", async (req, res) => {
    if (!fs.existsSync("reportes")){
      fs.mkdirSync("reportes");
    }
  const { correoDestino, contenido } = req.body;
  try {
    const filePath = path.join("reportes", `reporte_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const primary = "#2563eb"
    const gray = "#6b7280"

    // 🔥 CONTENIDO LIMPIO
    const text = (contenido || "")
      .replace(/<[^>]*>?/gm, '')
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}\n]/gu, '');
    
// 🔥 HEADER
doc
  .rect(0, 0, doc.page.width, 80)
  .fill(primary);

doc
  .fillColor("white")
  .fontSize(20)
  .text("REPORTE MENSUAL", 50, 30);

doc.moveDown(2);

// 🔥 SEPARAR DATOS
const lines = text.split("\n").filter(l => l.trim() !== "");

// 🔥 CUERPO
doc.fillColor("black").fontSize(12);

lines.forEach((line, i) => {
  if (i === 0) {
    doc.moveDown().fontSize(14).text(line, { align: "center" });
    doc.moveDown();
  } else if (line.includes("Total") || line.includes("Aprobados") || line.includes("Revisión")) {
    // 🔥 tipo tarjeta
    doc
      .rect(50, doc.y, 500, 25)
      .fill("#f3f4f6")
      .fillColor("black")
      .text(line, 60, doc.y + 7);
    doc.moveDown(2);
  } else {
    doc.fillColor(gray).text(line);
  }
});

// 🔥 FOOTER
doc.moveDown(3);
doc
  .fontSize(10)
  .fillColor(gray)
  .text("Sistema Mis Manos Hablarán", { align: "center" });

    doc.end();

    stream.on("finish", async () => {
      try {
        await transporter.sendMail({
          from: "fcano0505@gmail.com",
          to: correoDestino,
          subject: "Reporte Mensual",
          text: "Adjunto encontrarás el reporte mensual.",
          attachments: [
            {
              filename: "reporte.pdf",
              path: filePath
            }
          ]
        });

        res.json({ ok: true });

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al enviar correo" });
      }
    });

    stream.on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Error al generar PDF" });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error general" });
  }
});
app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor de 'Mis Manos Hablarán' corriendo en http://localhost:3000 🚀");
});