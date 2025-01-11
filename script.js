// Zmienne globalne
let isDraggingOverlay = false;
let overlayStartX, overlayStartY;
let mainImageOffset = { x: 0, y: 0 };
let mainImageScale = 1;
let overlayImageScale = 1;
let overlayRotation = 0;

// Elementy DOM
const overlayContainer = document.getElementById('overlayContainer');
const mainImage = document.getElementById('mainImage');
const overlayImage = document.getElementById('overlayImage');
const shadow = document.getElementById('shadow');
const editorContainer = document.getElementById('editorContainer');

if (!overlayContainer || !mainImage || !overlayImage || !shadow || !editorContainer) {
    console.error('Niektóre elementy DOM nie zostały znalezione.');
}

// Funkcja aktualizacji cienia
function updateShadow() {
    if (!shadow || !overlayContainer) return;
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = overlayContainer;
    shadow.style.left = offsetLeft + 'px';
    shadow.style.top = offsetTop + 'px';
    shadow.style.width = offsetWidth + 'px';
    shadow.style.height = offsetHeight + 'px';
    shadow.style.transform = `rotate(${overlayRotation}deg)`;
}

// Funkcja aktualizacji pozycji głównego zdjęcia
function updateMainImagePosition() {
    if (!mainImage) return;
    mainImage.style.transform = `translate(calc(-50% + ${mainImageOffset.x}px), calc(-50% + ${mainImageOffset.y}px)) scale(${mainImageScale})`;
}

// Ustawienie rozmiaru
function updateOverlaySize(value) {
    document.getElementById('overlaySize').value = value;
    document.getElementById('overlaySizeInput').value = value;
    overlayContainer.style.width = value + 'px';
    overlayContainer.style.height = value + 'px';
    updateShadow();
}

// Ustawienie grubości ramki
const borderWidth = document.getElementById('borderWidth');
if (borderWidth) {
    borderWidth.value = settings.borderWidth;
    overlayContainer.style.borderWidth = settings.borderWidth + 'px';
}

// Obsługa przycisków kolorów
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (!overlayContainer) return;
        const color = this.dataset.color;
        overlayContainer.style.borderColor = color;
        const borderColorInput = document.getElementById('borderColor');
        if (borderColorInput) borderColorInput.value = color;
    });
});

// Obsługa obrotu nakładki
const rotationAngle = document.getElementById('rotationAngle');
const rotationAngleInput = document.getElementById('rotationAngleInput');
if (rotationAngle && rotationAngleInput) {
    rotationAngle.addEventListener('input', function(e) {
        overlayRotation = parseInt(e.target.value);
        rotationAngleInput.value = overlayRotation;
        overlayContainer.style.transform = `rotate(${overlayRotation}deg)`;
        updateShadow();
    });

    rotationAngleInput.addEventListener('input', function(e) {
        overlayRotation = parseInt(e.target.value);
        rotationAngle.value = overlayRotation;
        overlayContainer.style.transform = `rotate(${overlayRotation}deg)`;
        updateShadow();
    });
}

// Obsługa przeciągania nakładki
if (overlayContainer) {
    overlayContainer.addEventListener('mousedown', function(e) {
        isDraggingOverlay = true;
        overlayStartX = e.clientX - overlayContainer.offsetLeft;
        overlayStartY = e.clientY - overlayContainer.offsetTop;
    });

    document.addEventListener('mousemove', function(e) {
        if (isDraggingOverlay && editorContainer) {
            let newX = e.clientX - overlayStartX;
            let newY = e.clientY - overlayStartY;

            const maxX = editorContainer.offsetWidth - overlayContainer.offsetWidth;
            const maxY = editorContainer.offsetHeight - overlayContainer.offsetHeight;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            overlayContainer.style.left = newX + 'px';
            overlayContainer.style.top = newY + 'px';
            updateShadow();
        }
    });

    document.addEventListener('mouseup', function() {
        isDraggingOverlay = false;
    });
}

// Obsługa skalowania
document.getElementById('mainImageScale').addEventListener('input', function(e) {
    mainImageScale = e.target.value / 100;
    this.nextElementSibling.textContent = e.target.value + '%';
    updateMainImagePosition();
});

document.getElementById('overlayImageScale').addEventListener('input', function(e) {
    overlayImageScale = e.target.value / 100;
    this.nextElementSibling.textContent = e.target.value + '%';
    overlayImage.style.transform = `scale(${overlayImageScale})`;
});

// Obsługa zdjęć
document.getElementById('mainImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && mainImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            mainImage.src = e.target.result;
            mainImage.style.display = 'block';
            mainImage.onload = function() {
                mainImageOffset = { x: 0, y: 0 };
                mainImageScale = 1;
                if (mainImageScaleInput) mainImageScaleInput.value = 100;
                mainImage.style.width = '100%';
                mainImage.style.height = '100%';
                mainImage.style.objectFit = 'cover';
                updateMainImagePosition();
            };
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('overlayImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && overlayImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            overlayImage.src = e.target.result;
            overlayImage.style.display = 'block';
            overlayImage.style.width = '100%';
            overlayImage.style.height = '100%';
            overlayImage.style.objectFit = 'cover';
        };
        reader.readAsDataURL(file);
    }
});

// Obsługa funkcji "sklejka"
document.querySelectorAll('[data-shape]').forEach(btn => {
    btn.addEventListener('click', function() {
        // Usuń active ze wszystkich przycisków
        document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const shape = this.dataset.shape;
        overlayContainer.classList.remove('circle', 'square', 'sklejka');
        shadow.style.borderRadius = '0';

        if (shape === 'circle') {
            overlayContainer.classList.add('circle');
            shadow.style.borderRadius = '50%';
        } else if (shape === 'sklejka') {
            overlayContainer.classList.add('sklejka');
            overlayContainer.style.width = '50%';
            overlayContainer.style.height = '100%';
            overlayContainer.style.left = '0';
            overlayContainer.style.top = '0';
            overlayContainer.style.transform = `rotate(${overlayRotation}deg)`;
        } else {
            overlayContainer.classList.add('square');
        }
        updateShadow();
    });
});

// Inicjalizacja przy starcie
window.addEventListener('DOMContentLoaded', function() {
    loadSavedTemplates();
    const shadowToggle = document.getElementById('shadowToggle');
    if (shadowToggle) {
        shadowToggle.checked = true;
        shadow.style.display = 'block';
        updateShadow();
    }
});
