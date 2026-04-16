// diccionario.js

// 1. ESTRUCTURA DE DATOS COMBINADA DE TODOS LOS NIVELES
const diccionarioData = {
    // 🛑 Nivel 1: Abecedario (usando la estructura de tu nivel1.js)
    1: {
        title: "Nivel 1: El Abecedario 🧠",
        color: "text-blue-700",
        items: [
            { nombre: "A", descripcion: "Con la mano cerrada, se muestran las uñas y se estira el dedo pulgar hacia un lado. La palma mira al frente.", imagen: "Letras/Letra A.png" },
            { nombre: "B", descripcion: "Los dedos índice, medio, anular y meñique se estiran bien unidos y el pulgar se dobla hacia la palma, la cual mira al frente.", imagen: "Letras/Letra B.png" },
            { nombre: "C", descripcion: "Los dedos índice, medio, anular y meñique se mantienen bien unidos y en posición cóncava; el pulgar también se pone en esa posición. La palma mira a un lado.", imagen: "Letras/Letra C.png" },
            { nombre: "D", descripcion: "Los dedos medio, anular, meñique y pulgar se unen por las puntas y el dedo índice se estira. La palma mira al frente.", imagen: "Letras/Letra D.png" },
            { nombre: "E", descripcion: "Se doblan los dedos completamente, y se muestran las uñas. La palma mira al frente.", imagen: "Letras/Letra E.png" },
            { nombre: "F", descripcion: "Con la mano abierta y los dedos bien unidos, se dobla el índice hasta que su parte lateral toque la yema del pulgar. La palma mira a un lado.", imagen: "Letras/Letra F.png" },
            { nombre: "G", descripcion: "Se cierra la mano y los dedos índice y pulgar se estiran. La palma mira hacia usted.", imagen: "Letras/Letra G.png" },
            { nombre: "H", descripcion: "Con la mano cerrada y los dedos índice y medio bien estirados y unidos, se extiende el dedo pulgar señalando hacia arriba. La palma mira hacia usted.", imagen: "Letras/Letra H.png" },
            { nombre: "I", descripcion: "Con la mano cerrada, el dedo meñique se estira señalando hacia arriba. La palma se pone de lado.", imagen: "Letras/Letra I.png" },
            { nombre: "J", descripcion: "Con la mano cerrada, el dedo meñique bien estirado señalando hacia arriba y la palma a un lado dibuja una j en el aire.", imagen: "Letras/Letra J.png" },
            { nombre: "K", descripcion: "Se cierra la mano con los dedos índice, medio y pulgar estirados. La yema del pulgar se pone entre el índice y el medio. Se mueve la muñeca hacia arriba.", imagen: "Letras/Letra K.png" },
            { nombre: "L", descripcion: "Con la mano cerrada y los dedos índice y pulgar estirados, se forma una l. La palma mira al frente.", imagen: "Letras/Letra L.png" },
            { nombre: "M", descripcion: "Con la mano cerrada, se ponen los dedos índice, medio y anular sobre el pulgar", imagen: "Letras/Letra M.png" },
            { nombre: "N", descripcion: "Con la mano cerrada, se ponen los dedos índice y medio sobre el pulgar.", imagen: "Letras/Letra N.png" },
            { nombre: "Ñ", descripcion: "Con la mano cerrada, se ponen los dedos índice y medio sobre el pulgar. Se mueve la muñeca a los lados.", imagen: "Letras/Letra Ñ.png" },
            { nombre: "O", descripcion: "Con la mano se forma una letra o. Todos los dedos se tocan por las puntas.", imagen: "Letras/Letra O.png" },
            { nombre: "P", descripcion: "Con la mano cerrada y los dedos índice, medio y pulgar estirados, se pone la yema del pulgar entre el índice y el medio.", imagen: "Letras/Letra P.png" },
            { nombre: "Q", descripcion: "Con la mano cerrada, se ponen los dedos índice y pulgar en posición de garra. La palma mira hacia abajo, y se mueve la muñeca hacia los lados.", imagen: "Letras/Letra Q.png" },
            { nombre: "R", descripcion: "Con la mano cerrada, se estiran y entrelazan los dedos índice y medio. La palma mira al frente.", imagen: "Letras/Letra R.png" },
            { nombre: "S", descripcion: "Con la mano cerrada, se pone el pulgar sobre los otros dedos. La palma mira al frente.", imagen: "Letras/Letra S.png" },
            { nombre: "T", descripcion: "Con la mano cerrada, el pulgar se pone entre el índice y el medio. La palma mira al frente", imagen: "Letras/Letra T.png" },
            { nombre: "U", descripcion: "Con la mano cerrada, se estiran los dedos índice y medio unidos. La palma mira al frente.", imagen: "Letras/Letra U.png" },
            { nombre: "V", descripcion: "Con la mano cerrada, se estiran los dedos índice y medio separados. La palma mira al frente.", imagen: "Letras/Letra V.png" },
            { nombre: "W", descripcion: "Con la mano cerrada, se estiran los dedos índice, medio y anular separados. La palma mira al frente.", imagen: "Letras/Letra W.png" },
            { nombre: "X", descripcion: "Con la mano cerrada, el índice y el pulgar en posición de garra y la palma dirigida a un lado, se realiza un movimiento al frente y de regreso.", imagen: "Letras/Letra X.png" },
            { nombre: "Y", descripcion: "Con la mano cerrada, se estira el meñique y el pulgar. La palma mira hacia usted.", imagen: "Letras/Letra Y.png" },
            { nombre: "Z", descripcion: "Con la mano cerrada, el dedo índice estirado y la palma al frente, se dibuja una letra z en el aire.", imagen: "Letras/Letra Z.png" }
        ]
    },

    // 🛑 Nivel 2: Primeras Palabras (usando la estructura de tu nivel2.js)
    2: {
        title: "Nivel 2: Primeras Palabras 💬",
        color: "text-yellow-700",
        items: [
            // Saludos (7)
            { nombre: "Hola", descripcion: "Levanta la mano abierta a la altura de tu frente.", video: "videos/Hola.mp4" },
            { nombre: "Adiós", descripcion: "Mano abierta desde el frente hacia afuera, como despedida.", video: "videos/Adios.mp4" },
            { nombre: "Buenos días", descripcion: "Mano desde el mentón hacia adelante y luego gesto de sol saliendo.", video: "videos/BuenosDias.mp4" },
            { nombre: "Buenas tardes", descripcion: "Mano desde el mentón hacia adelante y luego gesto del sol bajando.", video: "videos/BuenasTardes.mp4" },
            { nombre: "Buenas noches", descripcion: "Haz 'buenas' y luego gesto de noche: una mano horizonte y otra curva sobre ella.", video: "videos/BuenasNoches.mp4" },
            { nombre: "¿Cómo estás?", descripcion: "Ambas manos con dedos curvados hacia abajo y girarlas frente al pecho.", video: "videos/ComoEstas.mp4" },
            { nombre: "Gracias", descripcion: "Toca los labios y aleja la mano hacia adelante.", video: "videos/Gracias.mp4" },

            // Familia (8)
            { nombre: "Familia", descripcion: "Forma F con una mano y pasa el otro brazo recto de arriba hacia abajo.", video: "videos/Familia.mp4" },
            { nombre: "Madre", descripcion: "Mano abierta sobre la barbilla, toca ligeramente una o dos veces.", video: "videos/Madre.mp4" },
            { nombre: "Padre", descripcion: "Forma P y toca la barbilla con pequeños toques.", video: "videos/Padre.mp4" },
            { nombre: "Hermano", descripcion: "Frota los dedos índice entre sí.", video: "videos/Hermano.mp4" },
            { nombre: "Hermana", descripcion: "Frota los dedos índice horizontalmente y toca la mejilla.", video: "videos/Hermana.mp4" },
            { nombre: "Abuelo", descripcion: "Forma A, coloca cerca de la frente y mueve ligeramente hacia adelante o arriba.", video: "videos/Abuelo.mp4" },
            { nombre: "Abuela", descripcion: "Forma A, coloca cerca de la mejilla y mueve ligeramente hacia adelante o arriba.", video: "videos/Abuela.mp4" },
            { nombre: "Tío", descripcion: "Mano en T chocando entre sí.", video: "videos/Tio.mp4" },

            // Comida (7)
            { nombre: "Agua", descripcion: "Extiende el índice y haz un movimiento vertical de arriba a abajo.", video: "videos/Agua.mp4" },
            { nombre: "Tortilla", descripcion: "Extiende ambas manos abiertas frente al cuerpo, palmas hacia abajo.", video: "videos/Tortilla.mp4" },
            { nombre: "Leche", descripcion: "Gesto de ordeñar con ambas manos.", video: "videos/Leche.mp4" },
            { nombre: "Cereal", descripcion: "Extiende la mano dominante en forma de C.", video: "videos/Cerial.mp4" },
            { nombre: "Manzana", descripcion: "Extiende la mano abierta sobre la mejilla y frota ligeramente.", video: "videos/Manzana.mp4" },
            { nombre: "Plátano", descripcion: "Simula pelar un plátano con la mano dominante.", video: "videos/Platano.mp4" },
            { nombre: "Jugo de Naranja", descripcion: "Simula beber con una mano y frota la otra sobre la mejilla.", video: "videos/JugoNaranja.mp4" },
        ]
    },
    // 🛑 Nivel 3: Días y Tiempos
    3: {
        title: "Nivel 3: Calendario y Tiempos 📅",
        color: "text-purple-700",
        items: [
            // Días de la Semana (7)
            { nombre: "Lunes", descripcion: "Se hace una letra l, y se mueve en círculo", imagen: "Semana/Lunes.png", categoria: "Días" },
            { nombre: "Martes", descripcion: "Se hace una letra l con el dedo medio estirado, y se mueve en círculo.", imagen: "Semana/Martes.png", categoria: "Días" },
            { nombre: "Miércoles", descripcion: "Se hace una letra l con los dedos medio, anular y meñique estirados, y se mueve en círculo.", imagen: "Semana/Miercoles.png", categoria: "Días" },
            { nombre: "Jueves", descripcion: "Se hace una letra j, y se mueve en círculo.", imagen: "Semana/Jueves.png", categoria: "Días" },
            { nombre: "Viernes", descripcion: "Letra 'V' de la mano dominante, moviéndola en círculo.", imagen: "Semana/Viernes.png", categoria: "Días" },
            { nombre: "Sábado", descripcion: "Letra 'S' de la mano dominante, moviéndola en círculo.", imagen: "Semana/Sabado.png", categoria: "Días" },
            { nombre: "Domingo", descripcion: "Se hace una letra d, y se mueve en círculo.", imagen: "Semana/Domingo.png", categoria: "Días" },

            // Tiempos (Hoy, Ayer, Mañana) (3)
            { nombre: "Hoy", descripcion: "Se hace una letra a, y se hace un movimiento en medio círculo hacia un lado.", imagen: "Semana/HOY.png", categoria: "Tiempos" },
            { nombre: "Ayer", descripcion: "Se coloca una letra a a un lado de la boca y se recorre hasta alcanzar la oreja. ", imagen: "Semana/AYER.png", categoria: "Tiempos" },
            { nombre: "Mañana", descripcion: "Se coloca una letra l al lado de la frente, y se mueve al frente sin separarla.", imagen: "Semana/MAÑANA.png", categoria: "Tiempos" },


        ]
    },
    // 🛑 Nivel 4: Meses y Estaciones
    4: {
        title: "Nivel 4: Meses y Estaciones 🗓️",
        color: "text-indigo-700",
        items: [
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
        ]
    }
    // ... Puedes añadir Nivel 5 aquí ...
};

// 2. REFERENCIAS DEL DOM
const dictionaryModal = document.getElementById('dictionary-modal');
const closeModalButton = document.getElementById('close-dictionary-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const levelCards = document.querySelectorAll('.level-card');

// 3. MANEJO DEL MODAL
function closeModal() {
    dictionaryModal.classList.add('hidden');
    modalContent.innerHTML = '';
}

closeModalButton.addEventListener('click', closeModal);

// Cerrar modal al hacer clic fuera
dictionaryModal.addEventListener('click', (e) => {
    if (e.target.id === 'dictionary-modal') {
        closeModal();
    }
});


// 4. FUNCIÓN PRINCIPAL PARA MOSTRAR EL CONTENIDO
// diccionario.js

// 4. FUNCIÓN PRINCIPAL PARA MOSTRAR EL CONTENIDO
function showLevelContent(levelNumber) {
    const levelData = diccionarioData[levelNumber];

    if (!levelData) {
        modalTitle.textContent = "Error de Carga";
        modalContent.innerHTML = "<p class='text-red-500'>Datos del nivel no encontrados.</p>";
        dictionaryModal.classList.remove('hidden');
        return;
    }

    // ✅ CORRECCIÓN TÍTULO: Sobrescribir el título y aplicar la clase inmediatamente
    modalTitle.textContent = levelData.title;
    // Asegúrate de que levelData.color sea una clase de Tailwind válida (ej: 'text-blue-700')
    modalTitle.className = `text-3xl font-bold mb-6 border-b pb-2 ${levelData.color}`;

    let contentHTML = '';

    levelData.items.forEach(item => {
        const itemTitle = item.nombre;
        const itemSource = item.imagen || item.video;

        if (!itemSource) return; // Salta si no hay imagen ni video

        // Determinar qué etiqueta usar (video si termina en .mp4, img si no)
        const isVideo = itemSource.toLowerCase().endsWith('.mp4');

        const mediaTag = isVideo ?
            // Si es video, usamos la etiqueta <video> (sin controles para que parezca miniatura)
            `<video src="${itemSource}" muted autoplay loop playsinline class="w-16 h-16 object-cover rounded-md border border-gray-200"></video>` :
            // Si es imagen, usamos <img>
            `<img src="${itemSource}" alt="${itemTitle}" class="w-16 h-16 object-cover rounded-md border border-gray-200">`;

        // Atributos de clic para el modal de ampliación (funciona tanto para video como imagen)
        const clickAttributes = `
            data-img-src="${itemSource}"
            data-img-title="${itemTitle}"
            class="image-clickable cursor-pointer"
        `;

        contentHTML += `
            <div class="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm">
                <div class="mr-4 flex-shrink-0">
                    <div ${clickAttributes}> 
                        ${mediaTag}
                    </div>
                </div>
                <div>
                    <h5 class="text-xl font-semibold text-gray-900">${itemTitle}</h5>
                    <p class="text-gray-600 text-sm">${item.descripcion}</p>
                </div>
            </div>
        `;
    });

    // 🛑 CORRECCIÓN FINAL: Inyectar el HTML generado y mostrar el modal
    modalContent.innerHTML = contentHTML;
    dictionaryModal.classList.remove('hidden');
}

// 5. FUNCIÓN PARA MOSTRAR IMAGEN GRANDE (Modal de Ampliación)
function showImageModal(imageUrl, itemTitle) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]';

    const largeImage = document.createElement('img');
    largeImage.src = imageUrl;
    largeImage.alt = itemTitle;
    largeImage.className = 'max-w-[90%] max-h-[90%] rounded-lg shadow-2xl cursor-pointer';

    overlay.appendChild(largeImage);

    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
}

// 6. ESCUCHAR CLICS GLOBALES

// Escuchar clics en las tarjetas del índice (para abrir el modal)
levelCards.forEach(card => {
    card.addEventListener('click', (e) => {
        const level = e.currentTarget.getAttribute('data-level');
        showLevelContent(parseInt(level));
    });
});

// 🛑 CORRECCIÓN: Escuchar clics en las imágenes (Para la ampliación)
document.addEventListener('click', (e) => {
    if (e.target.closest('.image-clickable')) { // Usar closest para asegurar que capturamos el div padre
        const clickableDiv = e.target.closest('.image-clickable');
        const imgSrc = clickableDiv.getAttribute('data-img-src');
        const imgTitle = clickableDiv.getAttribute('data-img-title');
        showImageModal(imgSrc, imgTitle);
    }
});