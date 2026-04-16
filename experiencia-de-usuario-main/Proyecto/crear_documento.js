import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// 1. Tus credenciales de Firebase (Cópialas de tu consola de Firebase)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "ID_SENDER",
  appId: "TU_APP_ID"
};

// 2. Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Función para crear el documento específico
async function crearDocumentoUsuario() {
  const uid = "CodJLhModAbuv77N6HMaHB4AaKS2";
  
  // Referencia: db, nombre de colección, ID del documento
  const userRef = doc(db, "users", uid);

  try {
    await setDoc(userRef, {
      email: "leochavezro17@gmail.com",
      hasSeenWelcomeModal: true,
      nivel3_completado: false,
      nivel4_completado: false,
      nivel_actual: 1,
      photoURL: "https://placehold.co/120x120/d1d5db/4b5563?text=👤",
      progreso_dias_completados: 0,
      progreso_meses_completados: 0,
      rol: "admin"
    });
    
    console.log("✅ Usuario creado correctamente en Firestore");
  } catch (error) {
    console.error("❌ Error al crear el usuario:", error);
  }
}

// Llamar a la función donde la necesites
crearDocumentoUsuario();