// Zmienne globalne
let isDraggingOverlay = false;
let overlayStartX, overlayStartY;
let mainImageOffset = { x: 0, y: 0 };
let mainImageScale = 1;
let overlayImageScale = 1;

// Elementy DOM
const overlayContainer = document.getElementById('overlayContainer');
const mainImage = document.getElementById('mainImage');
const overlayImage = document.getElementById('overlayImage');

// Obsługa przycisków kolorów
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const color = this.dataset.color;
        overlayContainer.style.borderColor = color;
        document.getElementById('borderColor').value = color;
    });
});

// Obsługa przeciągania nakładki
overlayContainer.addEventListener('mousedown', function(e) {
    isDraggingOverlay = true;
    overlayStartX = e.clientX - overlayContainer.offsetLeft;
    overlayStartY = e.clientY - overlayContainer.offsetTop;
});

document.addEventListener('mousemove', function(e) {
    if (isDraggingOverlay) {
        let newX = e.clientX - overlayStartX;
        let newY = e.clientY - overlayStartY;
        
        const maxX = editorContainer.offsetWidth - overlayContainer.offsetWidth;
        const maxY = editorContainer.offsetHeight - overlayContainer.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        overlayContainer.style.left = newX + 'px';
        overlayContainer.style.top = newY + 'px';
    }
});

document.addEventListener('mouseup', function() {
    isDraggingOverlay = false;
});

// Obsługa strzałek dla głównego zdjęcia
const MOVE_STEP = 20;
document.querySelectorAll('#mainImageNav .arrow').forEach(arrow => {
    arrow.addEventListener('click', function() {
        const direction = this.classList[1];
        switch(direction) {
            case 'up': mainImageOffset.y += MOVE_STEP; break;
            case 'down': mainImageOffset.y -= MOVE_STEP; break;
            case 'left': mainImageOffset.x += MOVE_STEP; break;
            case 'right': mainImageOffset.x -= MOVE_STEP; break;
        }
        updateMainImagePosition();
    });
});

// Obsługa strzałek dla nakładki
document.querySelectorAll('#overlayImageNav .arrow').forEach(arrow => {
    arrow.addEventListener('click', function() {
        const overlayImage = document.getElementById('overlayImage');
        const direction = this.classList[1];
        const transform = window.getComputedStyle(overlayImage).transform;
        const matrix = new DOMMatrix(transform);
        const step = 20;
        
        let x = matrix.m41 || 0;
        let y = matrix.m42 || 0;
        
        switch(direction) {
            case 'up': y -= step; break;
            case 'down': y += step; break;
            case 'left': x -= step; break;
            case 'right': x += step; break;
        }
        
        overlayImage.style.transform = `translate(${x}px, ${y}px) scale(${overlayImageScale})`;
    });
});

function updateMainImagePosition() {
    mainImage.style.transform = `translate(calc(-50% + ${mainImageOffset.x}px), calc(-50% + ${mainImageOffset.y}px)) scale(${mainImageScale})`;
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

// Obsługa wielkości nakładki
function updateOverlaySize(value) {
    document.getElementById('overlaySize').value = value;
    document.getElementById('overlaySizeInput').value = value;
    overlayContainer.style.width = value + 'px';
    overlayContainer.style.height = value + 'px';
}

document.getElementById('overlaySize').addEventListener('input', e => updateOverlaySize(e.target.value));
document.getElementById('overlaySizeInput').addEventListener('input', e => updateOverlaySize(e.target.value));

// Obsługa wczytywania zdjęć
function handleImageUpload(input, imgElement, placeholder) {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgElement.src = e.target.result;
                imgElement.style.display = 'block';
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Inicjalizacja wczytywania zdjęć
handleImageUpload(
    document.getElementById('mainImageInput'), 
    document.getElementById('mainImage'),
    document.getElementById('mainImagePlaceholder')
);

handleImageUpload(
    document.getElementById('overlayImageInput'), 
    document.getElementById('overlayImage'),
    document.getElementById('overlayImagePlaceholder')
);

// Obsługa cienia
document.getElementById('shadowToggle').addEventListener('change', function(e) {
    if (this.checked) {
        overlayContainer.classList.add('shadow');
    } else {
        overlayContainer.classList.remove('shadow');
    }
});

// Obsługa zapisu
document.getElementById('saveAsBtn').addEventListener('click', async function() {
    const canvas = await html2canvas(document.getElementById('editorContainer'), {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        onrendered: function(canvas) {
            // Dodajemy cień jeśli jest włączony
            if (document.getElementById('shadowToggle').checked) {
                const ctx = canvas.getContext('2d');
                const overlayRect = overlayContainer.getBoundingClientRect();
                const editorRect = editorContainer.getBoundingClientRect();
                
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 16;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 8;
                
                if (overlayContainer.classList.contains('circle')) {
                    ctx.beginPath();
                    ctx.arc(
                        overlayRect.left - editorRect.left + overlayRect.width/2,
                        overlayRect.top - editorRect.top + overlayRect.height/2,
                        overlayRect.width/2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    });

    // Pobranie nazwy pliku głównego zdjęcia
    const mainImageName = document.getElementById('mainImageInput').files[0]?.name || 'image';
    const baseName = mainImageName.replace(/\.[^/.]+$/, "");
    
    // Pobranie ostatniego numeru
    let lastNumber = parseInt(localStorage.getItem('lastFileNumber') || '0');
    lastNumber++;
    localStorage.setItem('lastFileNumber', lastNumber);
    
    // Utworzenie nazwy pliku
    const paddedNumber = String(lastNumber).padStart(3, '0');
    const fileName = `${baseName}_${paddedNumber}.jpg`;

    // Konwersja canvas do Blob i zapis
    canvas.toBlob(function(blob) {
        saveAs(blob, fileName);
    }, 'image/jpeg', 0.95);
});
