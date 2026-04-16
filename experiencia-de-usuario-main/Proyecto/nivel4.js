// nivel4.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Configuración Firebase (IDÉNTICA)
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
    else window.location.href = "index.html";
});

// 🎯 CAMBIO: Lista de Meses con ruta de imagen explícita
const meses = [
    { nombre: "Enero", descripcion: "Se hace una letra e, y se rota la muñeca a los lados.", imagen: "Meses/Enero1.png" },
    { nombre: "Febrero", descripcion: "Se hace una letra f, y se rota la muñeca a los lados.", imagen: "Meses/Febrero1.png" },
    { nombre: "Marzo", descripcion: "Se hace una letra m, y se mueve en círculo alrededor de la oreja.", imagen: "Meses/Marzo1.png" },
    { nombre: "Abril", descripcion: "Se hace una letra a, y se mueve en círculo alrededor de la oreja.", imagen: "Meses/Abril1.png" },
    { nombre: "Mayo", descripcion: "Se hace una letra m, y se rota la muñeca a los lados.", imagen: "Meses/Mayo1.png" },
    { nombre: "Junio", descripcion: "Se hace una letra i, y se rota la muñeca a los lados.", imagen: "Meses/Junio1.png" },
    { nombre: "Julio", descripcion: "Se hace una letra i con el pulgar y el índice estirados, y se rota la muñeca a los lados.", imagen: "Meses/Julio1.png" },
    { nombre: "Agosto", descripcion: "Se hace una letra a, y se rota la muñeca a los lados.", imagen: "Meses/Agosto1.png" },
    { nombre: "Septiembre", descripcion: "Se hace una letra s, y se rota la muñeca a los lados.", imagen: "Meses/Septiembre1.png" },
    { nombre: "Octubre", descripcion: "Se hace una letra o, y se rota la muñeca a los lados.", imagen: "Meses/Octubre1.png" },
    { nombre: "Noviembre", descripcion: "Se hace una letra u, y se rota la muñeca a los lados.", imagen: "Meses/Noviembre1.png" },
    { nombre: "Diciembre", descripcion: "Se hace una letra d, y se rota la muñeca a los lados.", imagen: "Meses/Diciembre1.png" }
];

let index = 0;
// NUEVAS VARIABLES para la lógica de Múltiples Quizzes
let quizzesCompletados = 0;
const TOTAL_QUIZZES = 3;
const TOTAL_MESES = meses.length;

const leccionDiv = document.getElementById("leccion");
const btnSiguiente = document.getElementById("btnSiguiente");
const quizDiv = document.getElementById("quiz");
const quizImg = document.getElementById("quiz-img");
const quizOpciones = document.getElementById("quiz-opciones");
const resultadoDiv = document.getElementById("resultado");
const btnContinuar = document.getElementById("btnContinuar");
const btnAnterior = document.getElementById("btnAnterior");
const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");

function mostrarMes() {
    const mesObj = meses[index];
    leccionDiv.querySelector("h2").textContent = mesObj.nombre;

    // 🎯 CAMBIO: Usar la ruta 'imagen' directamente
    leccionDiv.querySelector("img").src = mesObj.imagen;

    leccionDiv.querySelector("p").innerHTML = mesObj.descripcion;

    // LÓGICA DE ACTUALIZACIÓN DEL PROGRESO CIRCULAR
    const porcentaje = Math.round(((index + 1) / TOTAL_MESES) * 100);
    let color = '#4a90e2';

    progressCircle.style.setProperty('--progress-value', porcentaje);
    progressCircle.style.setProperty('--progress-color', color);
    progressText.textContent = `${index + 1}/${TOTAL_MESES}`;

    actualizarBotones();
}

function actualizarBotones() {
    // Deshabilitar/Habilitar botón ANTERIOR
    if (index === 0) {
        btnAnterior.disabled = true;
        btnAnterior.classList.add("opacity-50", "cursor-not-allowed");
    } else {
        btnAnterior.disabled = false;
        btnAnterior.classList.remove("opacity-50", "cursor-not-allowed");
    }

    // Deshabilitar/Habilitar botón SIGUIENTE (solo si es el último mes)
    if (index === meses.length - 1) {
        btnSiguiente.textContent = "Hacer Quiz →"; // Cambia el texto
    } else {
        btnSiguiente.textContent = "Siguiente →"; // Vuelve al texto normal
    }
}

// Event Listener para el botón Regresar
btnAnterior.addEventListener("click", () => {
    if (index > 0) {
        index--;
        mostrarMes();
    }
});

btnSiguiente.addEventListener("click", () => {
    if (index < meses.length - 1) {
        index++;
        mostrarMes();
    } else {
        // Al llegar al último mes, proceder al Quiz
        leccionDiv.style.display = "none";
        quizDiv.style.display = "block";
        iniciarQuiz();
    }
});

// Inicia mini quiz
function iniciarQuiz() {
    const quizProgress = Math.round((quizzesCompletados / TOTAL_QUIZZES) * 100);

    // Muestra el círculo de nuevo y actualiza el texto/color
    progressCircle.style.setProperty('--progress-value', quizProgress);
    progressCircle.style.setProperty('--progress-color', 'purple'); // Color fijo para el Quiz
    progressText.textContent = `${quizzesCompletados + 1}/${TOTAL_QUIZZES}`;

    resultadoDiv.textContent = "";

    const mesCorrecto = meses[Math.floor(Math.random() * meses.length)];

    // 🎯 CAMBIO: Usar la ruta 'imagen' directamente
    quizImg.src = mesCorrecto.imagen;

    quizOpciones.innerHTML = "";

    const opciones = [mesCorrecto.nombre];
    while (opciones.length < 4) {
        const mesRandom = meses[Math.floor(Math.random() * meses.length)].nombre;
        if (!opciones.includes(mesRandom)) opciones.push(mesRandom);
    }

    opciones.sort(() => 0.5 - Math.random());

    opciones.forEach(op => {
        const btn = document.createElement("button");
        btn.textContent = op;
        btn.className = "bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition duration-200";
        btn.onclick = () => verificarRespuesta(op === mesCorrecto.nombre);
        quizOpciones.appendChild(btn);
    });
}

// Verifica respuesta del quiz (LÓGICA MODIFICADA)
async function verificarRespuesta(correcto) {
    if (correcto) {
        quizzesCompletados++; // Incrementa el contador de quizzes

        if (quizzesCompletados < TOTAL_QUIZZES) {
            // Si quedan quizzes por hacer, pasa al siguiente
            resultadoDiv.textContent = `¡Correcto! Quiz ${quizzesCompletados}/${TOTAL_QUIZZES} completado ✅`;
            resultadoDiv.style.color = "#22c55e"; // color verde

            // Pausa breve y reinicia el quiz con una nueva pregunta
            setTimeout(() => iniciarQuiz(), 1500);

        } else {
            // SI TODOS LOS QUIZZES ESTÁN COMPLETADOS

            quizDiv.style.display = "none";
            btnContinuar.style.display = "block";

            // Mostrar mensaje de nivel completado
            const mensaje = document.createElement("div");
            mensaje.textContent = "🎉 Nivel 4 completado ✅";
            Object.assign(mensaje.style, {
                position: "fixed",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#22c55e",
                color: "#fff",
                fontSize: "2rem",
                padding: "1.5rem 2rem",
                borderRadius: "1rem",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                zIndex: "9999",
                textAlign: "center"
            });
            document.body.appendChild(mensaje);

            // Guardar progreso en Firestore 
            if (userId) {
                try {
                    const docRef = doc(db, "perfiles", userId);
                    // 🔄 CAMBIO: Actualizar nivel4_completado
                    await updateDoc(docRef, { nivel4_completado: true });
                } catch (error) {
                    console.error("Error guardando progreso:", error);
                }
            }

            // Redirigir después de 2 segundos
            setTimeout(() => window.location.href = "pagina_inicio.html", 2000);
        }
    } else {
        // Respuesta incorrecta
        resultadoDiv.textContent = "Intenta de nuevo ❌";
        resultadoDiv.style.color = "red";
    }
}

// Event listener para el botón "Continuar al siguiente nivel"
btnContinuar.addEventListener("click", () => {
    window.location.href = "pagina_inicio.html";
});


// Mostrar el primer mes al cargar
mostrarMes();