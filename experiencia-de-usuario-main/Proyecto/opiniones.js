// 🔥 IMPORTACIONES CORRECTAS
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 🔥 CONFIG FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a"
};

// 🔥 INICIALIZAR
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 ELEMENTOS DOM
const contenedor = document.getElementById("lista-opiniones");
const form = document.getElementById("form-opinion");

// 🔥 FORMATEAR FECHA
function formatearFecha(timestamp) {
    if (!timestamp) return "Fecha no disponible";

    const fecha = timestamp.toDate();

    return fecha.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

// 🔥 ESCUCHAR OPINIONES EN TIEMPO REAL
const q = query(collection(db, "opiniones"), orderBy("fecha", "desc"));

onSnapshot(q, (snapshot) => {
    contenedor.innerHTML = "";

    snapshot.forEach((doc) => {
        const data = doc.data();

        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded-xl shadow-md border-l-4";

        // 🎨 COLOR SEGÚN TIPO
        if (data.tipo === "opinion") {
            card.classList.add("border-blue-500");
        } else {
            card.classList.add("border-green-500");
        }

        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <p class="font-bold text-gray-800">
                    ${data.nombre || "Anónimo"}
                </p>
                <span class="text-xs px-2 py-1 rounded bg-gray-200 capitalize">
                    ${data.tipo}
                </span>
            </div>

            <p class="text-gray-700">${data.mensaje}</p>

            <p class="text-xs text-gray-400 mt-2">
                ${formatearFecha(data.fecha)}
            </p>
        `;

        contenedor.appendChild(card);
    });
});

// 🔥 ENVIAR FORMULARIO
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!nombre || !mensaje || !tipo) {
        alert("Completa todos los campos");
        return;
    }

    try {
        await addDoc(collection(db, "opiniones"), {
            nombre,
            mensaje,
            tipo,
            fecha: serverTimestamp() // 🔥 hora automática de Firebase
        });

        alert(" Guardado correctamente");
        form.reset();

    } catch (error) {
        console.error("Error:", error);
        alert(" Error al guardar");
    }
});