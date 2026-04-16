// nivel2.js

import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

// Config de Firebase (usa la tuya si es distinta)
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a",
    measurementId: "G-5E2QC1Z09F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null;
onAuthStateChanged(auth, user => {
    if (user) userId = user.uid;
    // else window.location.href = "index.html"; // Redireccionar si no hay usuario
});

// Lista completa de lecciones
const lecciones = [
    // Saludos (7)
    { palabra: "Hola", descripcion: "Levanta la mano abierta a la altura de tu frente.", video: "videos/Hola.mp4" },
    { palabra: "Adiós", descripcion: "Mano abierta desde el frente hacia afuera, como despedida.", video: "videos/Adios.mp4" },
    { palabra: "Buenos días", descripcion: "Mano desde el mentón hacia adelante y luego gesto de sol saliendo.", video: "videos/BuenosDias.mp4" },
    { palabra: "Buenas tardes", descripcion: "Mano desde el mentón hacia adelante y luego gesto del sol bajando.", video: "videos/BuenasTardes.mp4" },
    { palabra: "Buenas noches", descripcion: "Haz 'buenas' y luego gesto de noche: una mano horizonte y otra curva sobre ella.", video: "videos/BuenasNoches.mp4" },
    { palabra: "¿Cómo estás?", descripcion: "Ambas manos con dedos curvados hacia abajo y girarlas frente al pecho.", video: "videos/ComoEstas.mp4" },
    { palabra: "Gracias", descripcion: "Toca los labios y aleja la mano hacia adelante.", video: "videos/Gracias.mp4" },

    // Familia (8)
    { palabra: "Familia", descripcion: "Forma F con una mano y pasa el otro brazo recto de arriba hacia abajo.", video: "videos/Familia.mp4" },
    { palabra: "Madre", descripcion: "Mano abierta sobre la barbilla, toca ligeramente una o dos veces.", video: "videos/Madre.mp4" },
    { palabra: "Padre", descripcion: "Forma P y toca la barbilla con pequeños toques.", video: "videos/Padre.mp4" },
    { palabra: "Hermano", descripcion: "Frota los dedos índice entre sí.", video: "videos/Hermano.mp4" },
    { palabra: "Hermana", descripcion: "Frota los dedos índice horizontalmente y toca la mejilla.", video: "videos/Hermana.mp4" },
    { palabra: "Abuelo", descripcion: "Forma A, coloca cerca de la frente y mueve ligeramente hacia adelante o arriba.", video: "videos/Abuelo.mp4" },
    { palabra: "Abuela", descripcion: "Forma A, coloca cerca de la mejilla y mueve ligeramente hacia adelante o arriba.", video: "videos/Abuela.mp4" },
    { palabra: "Tío", descripcion: "Mano en T chocando entre sí.", video: "videos/Tio.mp4" },

    // Comida (7)
    { palabra: "Agua", descripcion: "Extiende el índice y haz un movimiento vertical de arriba a abajo.", video: "videos/Agua.mp4" },
    { palabra: "Tortilla", descripcion: "Extiende ambas manos abiertas frente al cuerpo, palmas hacia abajo.", video: "videos/Tortilla.mp4" },
    { palabra: "Leche", descripcion: "Gesto de ordeñar con ambas manos.", video: "videos/Leche.mp4" },
    { palabra: "Cereal", descripcion: "Extiende la mano dominante en forma de C.", video: "videos/Cerial.mp4" },
    { palabra: "Manzana", descripcion: "Extiende la mano abierta sobre la mejilla y frota ligeramente.", video: "videos/Manzana.mp4" },
    { palabra: "Plátano", descripcion: "Simula pelar un plátano con la mano dominante.", video: "videos/Platano.mp4" },
    { palabra: "Jugo de Naranja", descripcion: "Simula beber con una mano y frota la otra sobre la mejilla.", video: "videos/JugoNaranja.mp4" },
];

let index = 0;
// >>> MODIFICACIONES PARA MÚLTIPLES QUIZZES
let quizzesCompletados = 0;
const TOTAL_QUIZZES = 4; // Definimos el total de quizzes
// <<< FIN MODIFICACIONES QUIZ

const leccionDiv = document.getElementById("leccion");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnRegresar = document.getElementById("btnRegresar");
const quizDiv = document.getElementById("quiz");
const resultadoDiv = document.getElementById("resultado");
const btnContinuar = document.getElementById("btnContinuar");

// REFERENCIAS PARA LA BARRA CIRCULAR DE PROGRESO
const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");
const TOTAL_LECCIONES = lecciones.length; // 22 lecciones

function actualizarProgreso(palabra, esQuiz = false) {
    let porcentaje, color, texto;

    if (esQuiz) {
        porcentaje = Math.round((quizzesCompletados / TOTAL_QUIZZES) * 100);
        color = '#09f'; // Azul para Quiz
        texto = `Quiz ${quizzesCompletados}/${TOTAL_QUIZZES}`;
    } else {
        porcentaje = Math.round(((index + 1) / TOTAL_LECCIONES) * 100);

        if (index < 7) {
            color = '#ef4444'; // Rojo (Saludos)
        } else if (index < 15) {
            color = '#3b82f6'; // Azul (Familia)
        } else {
            color = '#10b981'; // Verde (Comida)
        }
        texto = `${index + 1}/${TOTAL_LECCIONES}`;
    }

    // Aplica los cambios al CSS
    progressCircle.style.setProperty('--progress-value', porcentaje);
    progressCircle.style.setProperty('--progress-color', color);
    progressText.textContent = texto;
}

function mostrarLeccion(i) {
    const leccion = lecciones[i];
    leccionDiv.querySelector("h2").textContent = `Aprende la palabra: "${leccion.palabra}"`;

    const video = leccionDiv.querySelector("#videoLeccion");
    video.src = leccion.video;
    video.load();

    leccionDiv.querySelector("p").textContent = leccion.descripcion;

    // Lógica para mostrar/ocultar el botón Regresar
    if (i > 0) {
        btnRegresar.style.display = "inline-block";
    } else {
        btnRegresar.style.display = "none";
    }

    // Lógica para el botón Siguiente
    if (i === TOTAL_LECCIONES - 1) {
        btnSiguiente.textContent = "Hacer Quiz →";
    } else {
        btnSiguiente.textContent = "Siguiente →";
    }

    actualizarProgreso(leccion.palabra); // Actualiza la barra circular
}

// Event Listener para Regresar
btnRegresar.addEventListener("click", () => {
    if (index > 0) {
        index--;
        mostrarLeccion(index);
    }
});

// Avanzar lecciones
btnSiguiente.addEventListener("click", async() => {
    // Guardar progreso de la lección actual
    if (userId) {
        const docRef = doc(db, "perfiles", userId);
        updateDoc(docRef, {
                [`progreso_palabras.${lecciones[index].palabra}`]: true
            })
            .catch(error => console.error("Error al guardar progreso:", error));
    }

    index++;
    if (index < lecciones.length) {
        mostrarLeccion(index);
    } else {
        leccionDiv.style.display = "none";
        // Al terminar las lecciones, inicia el primer quiz
        iniciarQuiz();
    }
});

// >>> NUEVA FUNCIÓN PARA INICIAR O REINICIAR UN QUIZ
function iniciarQuiz() {
    quizDiv.style.display = "block";
    resultadoDiv.textContent = ""; // Limpiar mensaje de resultado anterior

    // Si ya completó todos los quizzes, no se llama (aunque esto debe ser manejado por verificarRespuestaQuiz)
    if (quizzesCompletados >= TOTAL_QUIZZES) return;

    // Actualizar progreso a "Quiz X/4"
    actualizarProgreso(null, true);

    quizDiv.innerHTML = `<h2 class="text-2xl font-semibold text-yellow-700 mb-4">Quiz ${quizzesCompletados + 1} de ${TOTAL_QUIZZES}</h2>
        <p class="text-gray-700 mb-4">Selecciona la seña correcta:</p>
        <div class="grid grid-cols-2 gap-4" id="quiz-opciones"></div>
    `;

    const opcionesDiv = document.getElementById("quiz-opciones");
    const opcionesLecciones = lecciones.sort(() => 0.5 - Math.random()).slice(0, 4);
    const palabraCorrecta = opcionesLecciones[0]; // primera es correcta

    // Muestra la palabra a adivinar en el quiz
    quizDiv.querySelector("h2").textContent = `Quiz ${quizzesCompletados + 1}/${TOTAL_QUIZZES}: ¿Cuál es la seña de "${palabraCorrecta.palabra}"?`;


    opcionesLecciones.sort(() => 0.5 - Math.random()).forEach(op => {
        const video = document.createElement("video");
        video.src = op.video;
        video.width = 150;
        video.height = 150;
        video.controls = true;
        video.className = "cursor-pointer border-4 rounded-xl shadow-lg hover:border-yellow-500 transition duration-200";
        // Llama a la nueva función de verificación
        video.onclick = () => verificarRespuestaQuiz(op === palabraCorrecta, opcionesDiv, video);
        opcionesDiv.appendChild(video);
    });
}
// <<< FIN FUNCIÓN INICIAR QUIZ

// >>> NUEVA FUNCIÓN PARA VERIFICAR RESPUESTA Y AVANZAR/FINALIZAR QUIZ
async function verificarRespuestaQuiz(esCorrecta, opcionesDiv, videoElemento) {
    if (esCorrecta) {
        quizzesCompletados++;
        resultadoDiv.textContent = `¡Correcto! ✅ Haz completado el Quiz ${quizzesCompletados}.`;
        resultadoDiv.style.color = "green";

        // Deshabilitar clics en todas las opciones para esta pregunta
        Array.from(opcionesDiv.children).forEach(child => child.onclick = null);

        actualizarProgreso(null, true); // Actualiza la barra de progreso

        if (quizzesCompletados < TOTAL_QUIZZES) {
            // Pasar al siguiente quiz después de un breve retraso
            setTimeout(() => iniciarQuiz(), 2000);
        } else {
            // Finalizar Nivel
            resultadoDiv.textContent = "🎉 ¡Nivel 2 completado! 🎉";
            resultadoDiv.style.color = "green";
            btnContinuar.style.display = "block";
            quizDiv.style.display = "none";

            // Guardar que nivel completado
            if (userId) {
                const docRef = doc(db, "perfiles", userId);
                await updateDoc(docRef, { nivel2_completado: true });
            }
        }
    } else {
        resultadoDiv.textContent = "Intenta de nuevo ❌";
        resultadoDiv.style.color = "red";
        // Añadir un borde visual de error a la opción incorrecta
        videoElemento.className = "cursor-pointer border-4 rounded-xl shadow-lg border-red-500";
    }
}
// <<< FIN FUNCIÓN VERIFICAR RESPUESTA

// Continuar a la página principal
btnContinuar.addEventListener("click", () => {
    window.location.href = "pagina_inicio.html";
});

// Inicializa primera lección
mostrarLeccion(index);