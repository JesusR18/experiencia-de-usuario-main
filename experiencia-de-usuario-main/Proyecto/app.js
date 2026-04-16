// --- 1. IMPORTACIÓN DE LIBRERÍAS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// 🚨 2. TUS CREDENCIALES REALES 🚨
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a",
    measurementId: "G-5E2QC1Z09F"
};

// 3. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LÓGICA DE VISTAS (LOGIN / REGISTRO) ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

// --- FUNCIONES DE AUTENTICACIÓN ---

async function resolveInputToEmail(input) {
    if (input.includes('@')) return input;
    try {
        const q = query(collection(db, "perfiles"), where("username", "==", input));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty ? querySnapshot.docs[0].data().email : null;
    } catch (error) {
        return null;
    }
}

async function handleSignIn(input, password) {
    const normal = input.trim().toLowerCase();
    const isInternal = (normal === 'jesusempleado' && password === '12345678')
        || (normal === 'jesusrutp' && password === 'jesusutp')
        || (normal === 'jjrockg@hotmail.com' && password === 'jesusutp')
        || (normal === '2321082989@alumno.utpuebla.edu.mx' && password === 'jesusutp');

    // Soporte especial para usuarios internos de prueba
    if (isInternal) {
        try {
            console.log('[DEBUG] Iniciando login especial interno', input);
            const userId = 'JesusRUTP';
            const profileRef = doc(db, 'perfiles', userId);
            await setDoc(profileRef, {
                username: 'JesusRUTP',
                email: 'jjrockg@hotmail.com',
                rol: 'empleado',
                nivel_actual: 4,
                nivel1_completado: true,
                nivel2_completado: true,
                nivel3_completado: true,
                nivel4_completado: true,
                progreso_dias_completados: 10,
                progreso_meses_completados: 12,
                photoURL: 'https://placehold.co/120x120/d1d5db/4b5563?text=👤',
                hasSeenWelcomeModal: true,
                created_at: new Date()
            }, { merge: true });
            localStorage.setItem('MMH_role', 'empleado');
            localStorage.setItem('MMH_uid', userId);
            window.location.href = 'pagina_inicio.html';
            return { success: true, message: 'Redirigiendo al menú principal (usuario interno especial).' };
        } catch (err) {
            console.error('Error acceso interno fijo', err);
            return { success: false, message: 'No se pudo iniciar sesión interna.' };
        }
    }

    const email = await resolveInputToEmail(input);
    if (!email) return { success: false, message: 'Usuario no encontrado.' };

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "perfiles", user.uid));

        if (!userDoc.exists()) {
            window.location.href = 'pagina_inicio.html';
            return { success: true };
        }

        const userData = userDoc.data();

        // Registrar log de acceso
        await addDoc(collection(db, 'logs_acceso'), {
            nombre: userData.username || 'Usuario',
            email: user.email,
            rol: userData.rol || 'estudiante',
            fecha: serverTimestamp()
        });

        // Verificación de correo para usuarios normales
        if (userData.rol === "usuario" && !user.emailVerified) {
            await sendEmailVerification(user);
            await signOut(auth);
            return { success: false, message: "Debes verificar tu correo 📩" };
        }

        // Redirección según rol
        if (userData.rol === "admin") {
            localStorage.setItem('MMH_role', 'admin');
            localStorage.setItem('MMH_uid', user.uid);
            window.location.href = 'admin-dashboard.html';
        } else if (userData.rol === 'creador') {
            localStorage.setItem('MMH_role', 'creador');
            localStorage.setItem('MMH_uid', user.uid);
            window.location.href = 'Dashboard_Creador.html';
        } else {
            localStorage.setItem('MMH_role', userData.rol || 'usuario');
            localStorage.setItem('MMH_uid', user.uid);
            window.location.href = 'pagina_inicio.html';
        }

        return { success: true, message: 'Redirigiendo...' };

    } catch (error) {
        console.error('Error login regular:', error);
        return { success: false, message: 'Credenciales incorrectas.' };
    }
}

async function handleSignUp(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Enviar correo de verificación
        await sendEmailVerification(user);

        // Guardar datos en Firestore
        await setDoc(doc(db, "perfiles", user.uid), {
            username: username,
            email: email,
            rol: "usuario",
            nivel_actual: 1,
            created_at: new Date()
        });

        return {
            success: true,
            message: "✅ Registro exitoso. Revisa tu correo para verificar tu cuenta (también en SPAM)."
        };

    } catch (error) {
        console.error("Error detallado:", error.code, error.message);

        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'Este correo ya está registrado.' };
        }

        if (error.code === 'auth/weak-password') {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        return { success: false, message: 'Error interno: ' + error.code };
    }
}

// --- FUNCIÓN: OLVIDÉ MI CONTRASEÑA ---
async function handlePasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: '✅ Correo enviado. Revisa tu bandeja de entrada, si no encuentras el correo, revisa tu correo de SPAM' };
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return { success: false, message: 'No existe una cuenta con ese correo.' };
        }
        if (error.code === 'auth/invalid-email') {
            return { success: false, message: 'El correo ingresado no es válido.' };
        }
        return { success: false, message: 'Error al enviar el correo. Intenta de nuevo.' };
    }
}

// --- EVENTOS DE FORMULARIO ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const messageEl = document.getElementById('login-message');

        messageEl.textContent = 'Verificando credenciales...';
        const result = await handleSignIn(input, password);

        if (!result.success) {
            messageEl.textContent = result.message;
            messageEl.style.color = 'red';
        }
    });
}

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const username = document.getElementById('register-username').value;
        const messageEl = document.getElementById('register-message');

        // Validación de contraseña segura
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

        if (!regex.test(password)) {
            messageEl.textContent = "La contraseña debe tener mínimo 8 caracteres, incluir letra, número y símbolo.";
            messageEl.style.color = "red";
            return;
        }

        const result = await handleSignUp(email, password, username);
        messageEl.textContent = result.message;
        messageEl.style.color = result.success ? 'green' : 'red';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const btnNiveles = document.getElementById('btn-niveles');
    const btnLoginNav = document.getElementById('btn-login-nav');

    onAuthStateChanged(auth, (user) => {
        if (btnNiveles && btnLoginNav) {
            if (user) {
                btnNiveles.classList.remove('hidden');
                btnLoginNav.classList.add('hidden');
            } else {
                btnNiveles.classList.add('hidden');
                btnLoginNav.classList.remove('hidden');
            }
        }
    });
});

const resendBtn = document.getElementById('resend-verification');

if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
        const user = auth.currentUser;

        if (user) {
            await sendEmailVerification(user);
            alert("📩 Correo reenviado. Revisa tu bandeja.");
        } else {
            alert("Inicia sesión primero.");
        }
    });
}

// --- EVENTO: ENVIAR CORREO DE RECUPERACIÓN ---
document.getElementById('send-reset-btn').addEventListener('click', async () => {
    const email = document.getElementById('forgot-email').value.trim();
    const messageEl = document.getElementById('forgot-message');

    if (!email) {
        messageEl.textContent = 'Por favor ingresa tu correo.';
        messageEl.style.color = 'red';
        return;
    }

    messageEl.textContent = 'Enviando...';
    messageEl.style.color = '#4b5563';

    const result = await handlePasswordReset(email);
    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';
});
