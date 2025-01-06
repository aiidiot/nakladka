// Zmienne globalne
let isDragging = false;
let isResizing = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 50;
let yOffset = 50;
let mainImageScale = 1;
let overlayImageScale = 1;

// Elementy DOM
const overlayContainer = document.getElementById('overlayContainer');
const mainImage = document.getElementById('mainImage');
const overlayImage = document.getElementById('overlayImage');
const shadowSvg = overlayContainer.querySelector('.shadow-svg');
const shadowCircle = shadowSvg.querySelector('circle');
const shadowRect = shadowSvg.querySelector('rect');

// Obsługa wczytywania zdjęć
function handleImageUpload(input, imgElement) {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgElement.src = e.target.result;
                imgElement.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

handleImageUpload(document.getElementById('mainImageInput'), mainImage);
handleImageUpload(document.getElementById('overlayImageInput'), overlayImage);

// Obsługa przeciągania nakładki
overlayContainer.addEventListener('mousedown', function(e) {
    if (e.target === overlayContainer || e.target === overlayImage) {
        isDragging = true;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        const maxX = editorContainer.offsetWidth - overlayContainer.offsetWidth;
        const maxY = editorContainer.offsetHeight - overlayContainer.offsetHeight;
        
        xOffset = Math.min(Math.max(0, currentX), maxX);
        yOffset = Math.min(Math.max(0, currentY), maxY);
        
        overlayContainer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

// Obsługa cienia
document.getElementById('shadowToggle').addEventListener('change', function(e) {
    shadowSvg.style.display = e.target.checked ? 'block' : 'none';
    if (overlayContainer.classList.contains('circle')) {
        shadowCircle.style.display = 'block';
        shadowRect.style.display = 'none';
    } else {
        shadowCircle.style.display = 'none';
        shadowRect.style.display = 'block';
    }
});

// Obsługa kształtów
document.querySelectorAll('[data-shape]').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('[data-shape]').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        overlayContainer.className = this.dataset.shape;
        
        // Aktualizacja kształtu cienia
        if (document.getElementById('shadowToggle').checked) {
            if (this.dataset.shape === 'circle') {
                shadowCircle.style.display = 'block';
                shadowRect.style.display = 'none';
            } else {
                shadowCircle.style.display = 'none';
                shadowRect.style.display = 'block';
            }
        }
    });
});

// Obsługa kolorów
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const color = this.dataset.color;
        overlayContainer.style.borderColor = color;
        document.getElementById('borderColor').value = color;
    });
});

document.getElementById('borderColor').addEventListener('input', function(e) {
    overlayContainer.style.borderColor = e.target.value;
});

// Obsługa grubości ramki
