// --- 1. IMPORTACIÓN Y CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// --- 2. CREDENCIALES DE FIREBASE ---
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- VARIABLES GLOBALES Y CONSTANTES ---
const AVAILABLE_PROFILE_IMAGES = [
    'usuarios/usuario_1.png',  'usuarios/usuario_2.png',  'usuarios/usuario_3.png',
    'usuarios/usuario_4.png',  'usuarios/usuario_5.png',  'usuarios/usuario_6.png',
    'usuarios/usuario_7.png',  'usuarios/usuario_8.png',  'usuarios/usuario_9.png',
    'usuarios/usuario_10.jpg', 'usuarios/usuario_11.jpg', 'usuarios/usuario_12.jpg',
    'usuarios/usuario_13.jpg',
];

let areAllLevelsComplete = false;
let currentUserId = null;
const TOTAL_LETTERS       = 26;
const TOTAL_WORDS_LEVEL_2 = 22;
const TOTAL_DAYS          = 10;
const TOTAL_MONTHS        = 16;

// --- 3. ELEMENTOS DEL DOM ---
const userIdDisplay               = document.getElementById('profile-username');
const profileImage                = document.getElementById('profile-picture');
const loadingMessage              = document.getElementById('loading-message');
const photoStatus                 = document.getElementById('photo-status');
const profileModal                = document.getElementById('profile-modal');
const showProfileButton           = document.getElementById('show-profile-button');
const closeProfileModal           = document.getElementById('close-profile-modal');
const logoutButtonSidebar         = document.getElementById('logout-button-sidebar');
const showDictionaryButton        = document.getElementById('show-dictionary-button');
const showInfoButton              = document.getElementById('show-info-button');
const changeProfilePictureButton  = document.getElementById('change-profile-picture-button');
const selectProfileImageModal     = document.getElementById('select-profile-image-modal');
const closeSelectImageModalButton = document.getElementById('close-select-image-modal');
const profileImageOptions         = document.getElementById('profile-image-options');
const infoModal                   = document.getElementById('info-modal');
const closeInfoModalButton        = document.getElementById('close-info-modal');

// Botones panel interno (escritorio y móvil)
const showPanelButtonDesktop = document.getElementById('show-panel-button');
const showPanelButtonMobile  = document.getElementById('show-panel-button-mobile');

// Barras de progreso
const progressLettersBar            = document.getElementById('progress-letters-bar');
const progressLettersPercentage     = document.getElementById('progress-letters-percentage');
const progressLettersCount          = document.getElementById('progress-letters-count');
const progressWordsBar              = document.getElementById('progress-words-bar');
const progressWordsPercentage       = document.getElementById('progress-words-percentage');
const progressWordsCount            = document.getElementById('progress-words-count');
const progressDaysBar               = document.getElementById('progress-days-bar');
const progressDaysPercentageText    = document.getElementById('progress-days-percentage-text');
const progressDaysCount             = document.getElementById('progress-days-count');
const progressMonthsBar             = document.getElementById('progress-months-bar');
const progressMonthsPercentageText  = document.getElementById('progress-months-percentage-text');
const progressMonthsCount           = document.getElementById('progress-months-count');

// Móvil
const showProfileButtonMobile    = document.getElementById('show-profile-button-mobile');
const showInfoButtonMobile       = document.getElementById('show-info-button-mobile');
const showDictionaryButtonMobile = document.getElementById('show-dictionary-button-mobile');
const logoutButtonMobile         = document.getElementById('logout-button-mobile');


// ============================================================
//  FUNCIÓN CLAVE: ¿Es usuario interno?
//  Lee el localStorage que app.js guarda al hacer login
// ============================================================
function esUsuarioInterno() {
    const role = localStorage.getItem('MMH_role');
    const uid  = localStorage.getItem('MMH_uid');
    return role === 'empleado' || uid === 'JesusRUTP';
}

// ============================================================
//  Mostrar u ocultar botón de sección interna
// ============================================================
function actualizarBotonInterno() {
    const mostrar = esUsuarioInterno();
    console.log('[Panel interno] esUsuarioInterno:', mostrar,
                '| role:', localStorage.getItem('MMH_role'),
                '| uid:', localStorage.getItem('MMH_uid'));

    if (showPanelButtonDesktop) {
        showPanelButtonDesktop.classList.toggle('hidden', !mostrar);
    }
    if (showPanelButtonMobile) {
        showPanelButtonMobile.classList.toggle('hidden', !mostrar);
        if (mostrar) showPanelButtonMobile.style.display = 'flex';
    }
}

// Clic en botones del panel interno → ir a usuariointerno.html
[showPanelButtonDesktop, showPanelButtonMobile].forEach(btn => {
    btn?.addEventListener('click', () => {
        window.location.href = 'usuariointerno.html';
    });
});

// Ejecutar inmediatamente (sin esperar Firebase, para evitar parpadeo)
actualizarBotonInterno();


// ============================================================
//  4. MODALES Y EVENT LISTENERS
// ============================================================

// Perfil (escritorio y móvil)
[showProfileButton, showProfileButtonMobile].forEach(button => {
    if (button) {
        button.addEventListener('click', () => profileModal.classList.remove('hidden'));
    }
});
if (closeProfileModal) {
    closeProfileModal.addEventListener('click', () => profileModal.classList.add('hidden'));
}
if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        if (e.target.id === 'profile-modal') profileModal.classList.add('hidden');
    });
}

// Selección de imagen
if (changeProfilePictureButton) {
    changeProfilePictureButton.addEventListener('click', () => {
        profileModal.classList.add('hidden');
        selectProfileImageModal.classList.remove('hidden');
        loadProfileImageOptions();
    });
}
if (closeSelectImageModalButton) {
    closeSelectImageModalButton.addEventListener('click', () => {
        selectProfileImageModal.classList.add('hidden');
        profileModal.classList.remove('hidden');
    });
}
if (selectProfileImageModal) {
    selectProfileImageModal.addEventListener('click', (e) => {
        if (e.target.id === 'select-profile-image-modal') closeSelectImageModalButton.click();
    });
}

// Información (escritorio y móvil)
[showInfoButton, showInfoButtonMobile].forEach(button => {
    if (button) {
        button.addEventListener('click', () => infoModal.classList.remove('hidden'));
    }
});
if (closeInfoModalButton) {
    closeInfoModalButton.addEventListener('click', () => infoModal.classList.add('hidden'));
}
if (infoModal) {
    infoModal.addEventListener('click', (e) => {
        if (e.target.id === 'info-modal') infoModal.classList.add('hidden');
    });
}


// ============================================================
//  5. AUTENTICACIÓN
// ============================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario normal con Firebase Auth
        currentUserId = user.uid;
        loadUserData(currentUserId);
    } else {
        // Sin sesión Firebase — verificar si es el usuario interno
        if (esUsuarioInterno()) {
            currentUserId = localStorage.getItem('MMH_uid') || 'JesusRUTP';
            loadUserData(currentUserId);
        } else {
            console.log('Sin sesión activa. Redirigiendo al login.');
            window.location.href = 'index.html';
        }
    }
});


// ============================================================
//  6. CARGAR PERFIL Y PROGRESO DESDE FIRESTORE
// ============================================================
async function loadUserData(userId) {
    console.log('[DEBUG] loadUserData para userId:', userId);
    if (loadingMessage) loadingMessage.textContent = 'Cargando tu perfil y progreso...';

    try {
        const profileRef  = doc(db, "perfiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            let data = profileSnap.data();
            let updateNeeded = false;
            let updateObject = {};

            // Inicialización perezosa de campos faltantes
            if (data.nivel3_completado === undefined) {
                updateObject.nivel3_completado         = false;
                updateObject.progreso_dias_completados = 0;
                updateNeeded = true;
            }
            if (data.nivel4_completado === undefined) {
                updateObject.nivel4_completado          = false;
                updateObject.progreso_meses_completados = 0;
                updateNeeded = true;
            }
            if (data.photoURL === undefined || data.photoURL === null) {
                updateObject.photoURL = "https://placehold.co/120x120/d1d5db/4b5563?text=👤";
                updateNeeded = true;
            }

            // Modal de bienvenida solo la primera vez
            if (!data.hasSeenWelcomeModal) {
                infoModal?.classList.remove('hidden');
                updateObject.hasSeenWelcomeModal = true;
                updateNeeded = true;
            }

            if (updateNeeded) {
                await updateDoc(profileRef, updateObject);
                data = { ...data, ...updateObject };
            }

            // Mostrar datos en UI
            if (userIdDisplay) userIdDisplay.textContent = data.username || 'Usuario';
            if (profileImage)  profileImage.src = data.photoURL || "https://placehold.co/120x120/d1d5db/4b5563?text=👤";

            // Refrescar botón interno
            actualizarBotonInterno();

            // Calcular progreso
            const lettersCompleted  = data.nivel1_completado ? TOTAL_LETTERS       : 0;
            const wordsCompleted    = data.nivel2_completado ? TOTAL_WORDS_LEVEL_2 : 0;
            const nivel3OK          = data.nivel3_completado === true;
            const nivel4OK          = data.nivel4_completado === true;
            const daysCompleted     = nivel3OK ? TOTAL_DAYS   : (data.progreso_dias_completados   || 0);
            const monthsCompleted   = nivel4OK ? TOTAL_MONTHS : (data.progreso_meses_completados  || 0);

            displayProgressLevels(lettersCompleted, wordsCompleted, daysCompleted, monthsCompleted);

            // Desbloquear niveles según progreso
            if (lettersCompleted === TOTAL_LETTERS)       unlockLevel(2);
            if (wordsCompleted   === TOTAL_WORDS_LEVEL_2) unlockLevel(3);
            if (nivel3OK)                                  unlockLevel(4);

            // Estado del diccionario
            areAllLevelsComplete = !!(
                data.nivel1_completado && data.nivel2_completado &&
                data.nivel3_completado && data.nivel4_completado
            );

        } else {
            console.error("No se encontró el perfil en Firestore para:", userId);
        }
    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
    } finally {
        if (loadingMessage) loadingMessage.classList.add('hidden');
    }
}

// Botón Muro Comunidad
const muroBtn = document.getElementById('btn-muro');
if (muroBtn) muroBtn.addEventListener('click', () => { window.location.href = 'muro_comunidad.html'; });


// ============================================================
//  7. BARRAS DE PROGRESO
// ============================================================
function displayProgressLevels(lettersCompleted, wordsCompleted, daysCompleted, monthsCompleted) {
    const letPct = Math.round((lettersCompleted / TOTAL_LETTERS)       * 100);
    const wrdPct = Math.round((wordsCompleted   / TOTAL_WORDS_LEVEL_2) * 100);
    const dayPct = Math.round((daysCompleted    / TOTAL_DAYS)          * 100);
    const mthPct = Math.round((monthsCompleted  / TOTAL_MONTHS)        * 100);

    if (progressLettersPercentage)    progressLettersPercentage.textContent    = `${letPct}%`;
    if (progressLettersBar)           progressLettersBar.style.width           = `${letPct}%`;
    if (progressLettersCount)         progressLettersCount.textContent         = `[${lettersCompleted}/${TOTAL_LETTERS} Letras completadas]`;

    if (progressWordsPercentage)      progressWordsPercentage.textContent      = `${wrdPct}%`;
    if (progressWordsBar)             progressWordsBar.style.width             = `${wrdPct}%`;
    if (progressWordsCount)           progressWordsCount.textContent           = `[${wordsCompleted}/${TOTAL_WORDS_LEVEL_2} Palabras completadas]`;

    if (progressDaysPercentageText)   progressDaysPercentageText.textContent   = `${dayPct}%`;
    if (progressDaysBar)              progressDaysBar.style.width              = `${dayPct}%`;
    if (progressDaysCount)            progressDaysCount.textContent            = `[${daysCompleted}/${TOTAL_DAYS} Palabras completadas]`;

    if (progressMonthsPercentageText) progressMonthsPercentageText.textContent = `${mthPct}%`;
    if (progressMonthsBar)            progressMonthsBar.style.width            = `${mthPct}%`;
    if (progressMonthsCount)          progressMonthsCount.textContent          = `[${monthsCompleted}/${TOTAL_MONTHS} Temas completados]`;
}


// ============================================================
//  8. DESBLOQUEO DE NIVELES
// ============================================================
function unlockLevel(levelNumber) {
    const levelCard = document.getElementById(`level-${levelNumber}`);
    if (!levelCard) return;

    levelCard.classList.remove('opacity-60', 'pointer-events-none', 'border-gray-400');
    levelCard.classList.add('hover:shadow-2xl', 'cursor-pointer', 'border-green-500');

    const button = levelCard.querySelector('button');
    if (button) {
        button.classList.remove('bg-gray-400');
        button.classList.add('bg-green-500', 'hover:bg-green-600');
        button.textContent = '¡Empezar ahora!';
    }
    const lockIcon = levelCard.querySelector('i');
    if (lockIcon) lockIcon.classList.add('hidden');

    const routes = { 2: 'niveles_2.html', 3: 'niveles_3.html', 4: 'niveles_4.html' };
    levelCard.onclick = () => { if (routes[levelNumber]) window.location.href = routes[levelNumber]; };
}


// ============================================================
//  9. SELECCIÓN DE IMAGEN DE PERFIL
// ============================================================
function loadProfileImageOptions() {
    if (!profileImageOptions) return;
    profileImageOptions.innerHTML = '';
    AVAILABLE_PROFILE_IMAGES.forEach(imagePath => {
        const imgElement     = document.createElement('img');
        imgElement.src       = imagePath;
        imgElement.alt       = `Foto de Perfil ${imagePath.split('/').pop().split('.')[0]}`;
        imgElement.className = 'w-24 h-24 object-cover rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition duration-200';
        imgElement.addEventListener('click', () => selectProfileImage(imagePath));
        profileImageOptions.appendChild(imgElement);
    });
}

async function selectProfileImage(imagePath) {
    if (!currentUserId) {
        console.error("No hay usuario autenticado.");
        return;
    }
    try {
        await updateDoc(doc(db, "perfiles", currentUserId), { photoURL: imagePath });
        if (profileImage) profileImage.src = imagePath;
        alert('Foto de perfil actualizada con éxito!');
        selectProfileImageModal.classList.add('hidden');
        profileModal.classList.remove('hidden');
    } catch (error) {
        console.error("Error al guardar la foto de perfil:", error);
    }
}


// ============================================================
//  10. LOGOUT (ESCRITORIO Y MÓVIL)
// ============================================================
[logoutButtonSidebar, logoutButtonMobile].forEach(button => {
    if (button) {
        button.addEventListener('click', async () => {
            // Limpiar sesión interna primero
            localStorage.removeItem('MMH_role');
            localStorage.removeItem('MMH_uid');
            try {
                await signOut(auth);
            } catch (e) {
                // Usuario interno no tiene sesión Firebase, ignorar error
                console.log('signOut ignorado (usuario interno):', e.message);
            }
            window.location.href = 'index.html';
        });
    }
});


// ============================================================
//  11. EVENTOS DE NIVELES
// ============================================================
document.getElementById('level-1')?.addEventListener('click', () => {
    window.location.href = 'niveles_1.html';
});

[2, 3, 4].forEach(n => {
    document.getElementById(`level-${n}`)?.addEventListener('click', () => {
        const card = document.getElementById(`level-${n}`);
        if (!card.classList.contains('pointer-events-none')) {
            window.location.href = `niveles_${n}.html`;
        } else {
            alert(`Nivel Bloqueado. Debes completar el Nivel ${n - 1} primero.`);
        }
    });
});


// ============================================================
//  12. DICCIONARIO (ESCRITORIO Y MÓVIL)
// ============================================================
[showDictionaryButton, showDictionaryButtonMobile].forEach(button => {
    if (button) {
        button.addEventListener('click', () => {
            if (areAllLevelsComplete) {
                window.location.href = 'diccionario.html';
            } else {
                alert('¡Acceso Bloqueado! Debes completar todos los niveles (Nivel 1 al 4) para acceder al Diccionario de Señas completo.');
            }
        });
    }
});


// ============================================================
//  13. EDITAR NOMBRE DE USUARIO
// ============================================================
const editBtn       = document.getElementById("edit-username-btn");
const usernameInput = document.getElementById("username-input");

if (editBtn && usernameInput && userIdDisplay) {

    editBtn.addEventListener("click", () => {
        usernameInput.classList.remove("hidden");
        usernameInput.value = userIdDisplay.textContent;
        userIdDisplay.classList.add("hidden");
    });

    const saveUsername = async () => {
        const newName = usernameInput.value.trim();

        if (newName === "") {
            alert("El nombre no puede estar vacío");
            return;
        }
        if (!currentUserId) return;

        try {
            await updateDoc(doc(db, "perfiles", currentUserId), { username: newName });
            userIdDisplay.textContent = newName;
        } catch (error) {
            console.error("Error al actualizar nombre:", error);
        }

        usernameInput.classList.add("hidden");
        userIdDisplay.classList.remove("hidden");
    };

    usernameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveUsername();
    });
    usernameInput.addEventListener("blur", saveUsername);
}


// ============================================================
//  14. ELIMINAR CUENTA
// ============================================================
const deleteAccountBtn = document.getElementById('delete-account-btn');

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {

        const primeraConfirmacion = confirm("⚠️ ¿Estás totalmente seguro? Esta acción borrará permanentemente tu progreso y tus datos de perfil.");

        if (primeraConfirmacion) {
            const confirmacionPalabra = prompt("Para proceder, escribe la palabra ELIMINAR en mayúsculas:");

            if (confirmacionPalabra === "ELIMINAR") {
                const user = auth.currentUser;

                if (user) {
                    try {
                        await deleteDoc(doc(db, "perfiles", user.uid));
                        console.log("Documento de Firestore eliminado con éxito.");

                        await deleteUser(user);
                        console.log("Usuario de autenticación eliminado.");

                        alert("Tu cuenta ha sido eliminada exitosamente.");
                        window.location.href = "introduccion_usuario.html";

                    } catch (error) {
                        console.error("Error al eliminar la cuenta:", error);
                        if (error.code === 'auth/requires-recent-login') {
                            alert("Por razones de seguridad, debes haber iniciado sesión recientemente para eliminar tu cuenta. Por favor, sal de la cuenta e inicia sesión de nuevo antes de reintentar.");
                        } else {
                            alert("Ocurrió un error al intentar eliminar la cuenta. Revisa la consola.");
                        }
                    }
                } else {
                    alert("No se encontró una sesión activa.");
                }
            } else {
                alert("La palabra no coincide. Acción cancelada.");
            }
        }
    });
}
