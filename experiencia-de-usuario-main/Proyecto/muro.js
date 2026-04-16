import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Solo consultamos Firestore para saber QUÉ archivos mostrar
const q = query(collection(db, "solicitudes_multimedia"), where("estado", "==", "aceptado"));

onSnapshot(q, (snapshot) => {
    const contenedor = document.getElementById('contenedor-muro');
    contenedor.innerHTML = '';

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const post = document.createElement('div');
        post.className = "post-card bg-white rounded-xl shadow-md border mb-6 overflow-hidden";

        // LA MAGIA: Usamos la ruta local de tu carpeta de VS Code
        const rutaLocal = "video_grabados/" + data.nombreArchivo;

        post.innerHTML = `
                <div class="p-4 border-b">
                    <p class="font-bold text-blue-600">${data.profesorNombre}</p>
                </div>
                <div class="bg-black">
                    <video src="${rutaLocal}" controls class="w-full h-auto"></video>
                </div>
                <div class="p-4">
                    <p class="font-medium text-gray-800">${data.nombreArchivo}</p>
                    <span class="text-xs text-green-600 font-bold">✓ Contenido Local Verificado</span>
                </div>
            `;
        contenedor.appendChild(post);
    });
});