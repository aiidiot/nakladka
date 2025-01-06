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
const editorContainer = document.getElementById('editorContainer');

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

// Obsługa cienia
document.getElementById('shadowToggle').addEventListener('change', function(e) {
    if (this.checked) {
        overlayContainer.classList.add('shadow');
    } else {
        overlayContainer.classList.remove('shadow');
    }
});

// Funkcja do renderowania z cieniem
async function renderWithShadow() {
    // Tworzymy tymczasowy canvas o rozmiarach edytora
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = editorContainer.offsetWidth;
    tempCanvas.height = editorContainer.offsetHeight;

    // Rysujemy główne zdjęcie
    await html2canvas(document.getElementById('mainImageContainer'), {
        canvas: tempCanvas,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
    });

    // Jeśli włączony jest cień, rysujemy go
    if (document.getElementById('shadowToggle').checked) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 2.6)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;

        // Pozycja nakładki
        const overlayRect = overlayContainer.getBoundingClientRect();
        const editorRect = editorContainer.getBoundingClientRect();
        const x = overlayRect.left - editorRect.left;
        const y = overlayRect.top - editorRect.top;

        // Rysujemy kształt cienia
        if (overlayContainer.classList.contains('circle')) {
            ctx.beginPath();
            ctx.arc(
                x + overlayRect.width/2,
                y + overlayRect.height/2,
                overlayRect.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else {
            ctx.fillRect(x, y, overlayRect.width, overlayRect.height);
        }
        ctx.restore();
    }

    // Rysujemy nakładkę
    await html2canvas(overlayContainer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
    }).then(overlayCanvas => {
        const overlayRect = overlayContainer.getBoundingClientRect();
        const editorRect = editorContainer.getBoundingClientRect();
        ctx.drawImage(
            overlayCanvas,
            overlayRect.left - editorRect.left,
            overlayRect.top - editorRect.top
        );
    });

    return tempCanvas;
}

// Obsługa zapisu
document.getElementById('saveAsBtn').addEventListener('click', async function() {
    const canvas = await renderWithShadow();
    
    // Pobranie nazwy pliku
    const mainImageName = document.getElementById('mainImageInput').files[0]?.name || 'image';
    const baseName = mainImageName.replace(/\.[^/.]+$/, "");
    let lastNumber = parseInt(localStorage.getItem('lastFileNumber') || '0');
    lastNumber++;
    localStorage.setItem('lastFileNumber', lastNumber);
    const fileName = `${baseName}_${String(lastNumber).padStart(3, '0')}.jpg`;

    // Zapis pliku
    canvas.toBlob(function(blob) {
        saveAs(blob, fileName);
    }, 'image/jpeg', 0.95);
});

// Obsługa kopiowania do schowka
document.getElementById('copyToClipboardBtn').addEventListener('click', async function() {
    const canvas = await renderWithShadow();
    
    canvas.toBlob(async function(blob) {
        try {
            const clipboardItem = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([clipboardItem]);
            alert('Skopiowano do schowka! Możesz teraz wkleić obraz w dowolnym programie graficznym.');
        } catch(e) {
            alert('Nie udało się skopiować do schowka. Spróbuj użyć przycisku "Zapisz jako..."');
            console.error('Błąd kopiowania do schowka:', e);
        }
    }, 'image/png');
});

// Obsługa wczytywania zdjęć
function handleImageUpload(input, imgElement) {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgElement.src = e.target.result;
