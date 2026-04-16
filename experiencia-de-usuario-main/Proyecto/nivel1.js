// nivel1.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Configuración Firebase
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

// Lista de letras
const letras = [
    { letra: "A", descripcion: "Con la mano cerrada, se muestran las uñas y se estira el dedo pulgar hacia un lado. La palma mira al frente." },
    { letra: "B", descripcion: "Los dedos índice, medio, anular y meñique se estiran bien unidos y el pulgar se dobla hacia la palma, la cual mira al frente." },
    { letra: "C", descripcion: "Los dedos índice, medio, anular y meñique se mantienen bien unidos y en posición cóncava; el pulgar también se pone en esa posición. La palma mira a un lado." },
    { letra: "D", descripcion: "Los dedos medio, anular, meñique y pulgar se unen por las puntas y el dedo índice se estira. La palma mira al frente." },
    { letra: "E", descripcion: "Se doblan los dedos completamente, y se muestran las uñas. La palma mira al frente." },
    { letra: "F", descripcion: "Con la mano abierta y los dedos bien unidos, se dobla el índice hasta que su parte lateral toque la yema del pulgar. La palma mira a un lado." },
    { letra: "G", descripcion: "Se cierra la mano y los dedos índice y pulgar se estiran. La palma mira hacia usted." },
    { letra: "H", descripcion: "Con la mano cerrada y los dedos índice y medio bien estirados y unidos, se extiende el dedo pulgar señalando hacia arriba. La palma mira hacia usted." },
    { letra: "I", descripcion: "Con la mano cerrada, el dedo meñique se estira señalando hacia arriba. La palma se pone de lado." },
    { letra: "J", descripcion: "Con la mano cerrada, el dedo meñique bien estirado señalando hacia arriba y la palma a un lado dibuja una j en el aire." },
    { letra: "K", descripcion: "Se cierra la mano con los dedos índice, medio y pulgar estirados. La yema del pulgar se pone entre el índice y el medio. Se mueve la muñeca hacia arriba." },
    { letra: "L", descripcion: "Con la mano cerrada y los dedos índice y pulgar estirados, se forma una l. La palma mira al frente." },
    { letra: "M", descripcion: "Con la mano cerrada, se ponen los dedos índice, medio y anular sobre el pulgar" },
    { letra: "N", descripcion: "Con la mano cerrada, se ponen los dedos índice y medio sobre el pulgar." },
    { letra: "Ñ", descripcion: "Con la mano cerrada, se ponen los dedos índice y medio sobre el pulgar. Se mueve la muñeca a los lados." },
    { letra: "O", descripcion: "Con la mano se forma una letra o. Todos los dedos se tocan por las puntas." },
    { letra: "P", descripcion: "Con la mano cerrada y los dedos índice, medio y pulgar estirados, se pone la yema del pulgar entre el índice y el medio." },
    { letra: "Q", descripcion: "Con la mano cerrada, se ponen los dedos índice y pulgar en posición de garra. La palma mira hacia abajo, y se mueve la muñeca hacia los lados." },
    { letra: "R", descripcion: "Con la mano cerrada, se estiran y entrelazan los dedos índice y medio. La palma mira al frente." },
    { letra: "S", descripcion: "Con la mano cerrada, se pone el pulgar sobre los otros dedos. La palma mira al frente." },
    { letra: "T", descripcion: "Con la mano cerrada, el pulgar se pone entre el índice y el medio. La palma mira al frente" },
    { letra: "U", descripcion: "Con la mano cerrada, se estiran los dedos índice y medio unidos. La palma mira al frente." },
    { letra: "V", descripcion: "Con la mano cerrada, se estiran los dedos índice y medio separados. La palma mira al frente." },
    { letra: "W", descripcion: "Con la mano cerrada, se estiran los dedos índice, medio y anular separados. La palma mira al frente." },
    { letra: "X", descripcion: "Con la mano cerrada, el índice y el pulgar en posición de garra y la palma dirigida a un lado, se realiza un movimiento al frente y de regreso." },
    { letra: "Y", descripcion: "Con la mano cerrada, se estira el meñique y el pulgar. La palma mira hacia usted." },
    { letra: "Z", descripcion: "Con la mano cerrada, el dedo índice estirado y la palma al frente, se dibuja una letra z en el aire." }
];

let index = 0;
// NUEVAS VARIABLES para la lógica de Múltiples Quizzes
let quizzesCompletados = 0;
const TOTAL_QUIZZES = 4; // Definición de la cantidad de quizzes

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
const TOTAL_LETRAS = letras.length;

function mostrarLetra() {
    const letraObj = letras[index];
    leccionDiv.querySelector("h2").textContent = `Letra ${letraObj.letra}`;
    leccionDiv.querySelector("img").src = `Letras/Letra ${letraObj.letra}.png`;
    leccionDiv.querySelector("p").innerHTML = `Para hacer la letra <strong>${letraObj.letra}</strong>, ${letraObj.descripcion}`;

    // LÓGICA DE ACTUALIZACIÓN DEL PROGRESO CIRCULAR
    const porcentaje = Math.round(((index + 1) / TOTAL_LETRAS) * 100);
    let color = '';

    if (index + 1 <= 10) { // Letras 1-10
        color = '#ef4444'; // Tailwind red-500
    } else if (index + 1 <= 19) { // Letras 11-19
        color = '#f97316'; // Tailwind orange-600
    } else { // Letras 20-27
        color = '#10b981'; // Tailwind emerald-500
    }

    // Aplica los cambios al CSS
    progressCircle.style.setProperty('--progress-value', porcentaje);
    progressCircle.style.setProperty('--progress-color', color);

    // Muestra la letra actual en el centro del círculo
    progressText.textContent = letraObj.letra;
    progressCircle.style.display = 'flex';

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

    // Deshabilitar/Habilitar botón SIGUIENTE (solo si es la última letra)
    if (index === letras.length - 1) {
        btnSiguiente.textContent = "Hacer Quiz →"; // Cambia el texto
    } else {
        btnSiguiente.textContent = "Siguiente →"; // Vuelve al texto normal
    }
}


// Event Listener para el botón Regresar
btnAnterior.addEventListener("click", () => {
    if (index > 0) {
        index--;
        mostrarLetra();
    }
});

// 🎯 CORRECCIÓN DEL EVENT LISTENER DE SIGUIENTE
btnSiguiente.addEventListener("click", () => {
    // Evita que el botón funcione si ya estamos en el quiz
    if (leccionDiv.style.display === "none") {
        console.warn("Botón Siguiente ignorado. El quiz ya está activo.");
        return;
    }

    if (index < letras.length - 1) {
        index++;
        mostrarLetra();
    } else {
        // Al llegar a la última letra, proceder al Quiz
        leccionDiv.style.display = "none";
        quizDiv.style.display = "block";
        quizzesCompletados = 0; // REINICIAMOS EL CONTADOR DE QUIZZES
        iniciarQuiz();
    }
});

// Inicia mini quiz
function iniciarQuiz() {
    const quizProgress = Math.round((quizzesCompletados / TOTAL_QUIZZES) * 100);

    // Muestra el círculo de nuevo y actualiza el progreso del Quiz
    progressCircle.style.display = 'flex';
    progressCircle.style.setProperty('--progress-value', quizProgress);
    progressCircle.style.setProperty('--progress-color', '#3b82f6'); // Tailwind blue-500
    progressText.textContent = `${quizzesCompletados + 1}/${TOTAL_QUIZZES}`; // Ej: 1/4

    // Limpia el mensaje de resultado anterior
    resultadoDiv.textContent = "";

    const letraCorrecta = letras[Math.floor(Math.random() * letras.length)];
    quizImg.src = `Letras/Letra ${letraCorrecta.letra}.png`;
    quizOpciones.innerHTML = "";

    const opciones = [letraCorrecta.letra];
    while (opciones.length < 4) {
        const letraRandom = letras[Math.floor(Math.random() * letras.length)].letra;
        if (!opciones.includes(letraRandom)) opciones.push(letraRandom);
    }

    opciones.sort(() => 0.5 - Math.random());

    opciones.forEach(op => {
        const btn = document.createElement("button");
        btn.textContent = op;
        btn.className = "bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition duration-200";
        btn.onclick = () => verificarRespuesta(op === letraCorrecta.letra);
        quizOpciones.appendChild(btn);
    });
}

// 🎯 CORRECCIÓN DE LA LÓGICA DE VERIFICACIÓN Y FINALIZACIÓN DEL QUIZ
async function verificarRespuesta(correcto) {
    // Deshabilitar opciones temporalmente para evitar doble clic
    quizOpciones.querySelectorAll('button').forEach(btn => btn.disabled = true);

    if (correcto) {
        quizzesCompletados++; // Incrementa el contador de quizzes

        if (quizzesCompletados < TOTAL_QUIZZES) {
            // Si quedan quizzes por hacer, pasa al siguiente
            resultadoDiv.textContent = `¡Correcto! Quiz ${quizzesCompletados}/${TOTAL_QUIZZES} completado ✅`;
            resultadoDiv.style.color = "#22c55e"; // color verde

            // Pausa breve y reinicia el quiz con una nueva pregunta
            setTimeout(() => {
                resultadoDiv.textContent = "";
                iniciarQuiz();
            }, 1500);

        } else {
            // ⭐️ LÓGICA DE FINALIZACIÓN DEL NIVEL ⭐️

            // 1. Mensaje de resultado final
            resultadoDiv.textContent = `🎉 ¡Felicidades! Nivel 1 Completado. 🎉`;
            resultadoDiv.style.color = "#22c55e"; // color verde

            // 2. Oculta el quiz y muestra el botón de continuar
            quizDiv.style.display = "none";
            btnContinuar.style.display = "block";

            // 3. Mostrar mensaje de nivel completado (el cuadro flotante)
            const mensaje = document.createElement("div");
            mensaje.textContent = "🎉 Nivel 1 completado ✅";
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

            // 4. Guardar progreso en Firestore
            if (userId) {
                try {
                    const docRef = doc(db, "perfiles", userId);
                    await updateDoc(docRef, { nivel1_completado: true });
                } catch (error) {
                    console.error("Error guardando progreso:", error);
                }
            }

            // 5. Redirigir después de 2 segundos
            setTimeout(() => window.location.href = "pagina_inicio.html", 2000);
        }
    } else {
        // Respuesta incorrecta
        resultadoDiv.textContent = "Intenta de nuevo ❌";
        resultadoDiv.style.color = "red";
        // Reactivar opciones inmediatamente en caso de error para permitir reintento
        quizOpciones.querySelectorAll('button').forEach(btn => btn.disabled = false);
    }
}

// Event listener para el botón "Continuar al siguiente nivel"
btnContinuar.addEventListener("click", () => {
    // Redirección explícita si el usuario hace clic en el botón antes de la redirección automática
    window.location.href = "pagina_inicio.html";
});


// Mostrar la primera letra al cargar
mostrarLetra();