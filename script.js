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
// Autodopasowanie zdjęcia
document.getElementById('autoFitBtn').addEventListener('click', function() {
    mainImageOffset = { x: 0, y: 0 };
    mainImageScale = 1;
    document.getElementById('mainImageScale').value = 100;
    mainImage.style.width = '100%';
    mainImage.style.height = '100%';
    mainImage.style.objectFit = 'contain';
    updateMainImagePosition();
});
// A w JavaScript dodaj:
document.getElementById('saveAsBtn').addEventListener('click', function() {
    html2canvas(document.getElementById('editorContainer')).then(canvas => {
        // Próba 1: Standardowy download
        const link = document.createElement('a');
        link.download = 'edytowane_zdjecie.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Próba 2: Wymuszone okno "Zapisz jako"
        try {
            canvas.toBlob(function(blob) {
                const file = new File([blob], 'edytowane_zdjecie.jpg', {type: 'image/jpeg'});
                const saveAs = window.saveAs || (function(blob, name) {
                    const a = document.createElement('a');
                    a.download = name;
                    a.rel = 'noopener';
                    a.href = URL.createObjectURL(blob);
                    setTimeout(function() { URL.revokeObjectURL(a.href); }, 40); // Clean up
                    setTimeout(function() { a.click(); }, 0);
                });
                saveAs(file, 'edytowane_zdjecie.jpg');
            }, 'image/jpeg', 0.95);
        } catch(e) {
            console.log('Próba 2 nie zadziałała:', e);
        }
    });
});
document.getElementById('saveAsBtn').addEventListener('click', async function() {
    try {
        const canvas = await html2canvas(document.getElementById('editorContainer'));
        canvas.toBlob(async function(blob) {
            try {
                // Próba kopiowania do schowka
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                alert('Obraz skopiowany do schowka! Możesz go wkleić w Paincie lub innym programie graficznym.');
            } catch(e) {
                console.log('Nie udało się skopiować do schowka:', e);
                // Fallback do zwykłego pobierania
                const link = document.createElement('a');
                link.download = 'edytowane_zdjecie.jpg';
                link.href = URL.createObjectURL(blob);
                link.click();
            }
        }, 'image/png');
    } catch(e) {
        console.error('Błąd podczas tworzenia obrazu:', e);
    }
});
document.getElementById('copyToClipboardBtn').addEventListener('click', async function() {
    const canvas = await html2canvas(document.getElementById('editorContainer'));
    canvas.toBlob(async blob => {
        try {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            alert('Skopiowano do schowka! Możesz teraz wkleić obraz w dowolnym programie graficznym.');
        } catch(e) {
            alert('Nie udało się skopiować do schowka. Spróbuj użyć przycisku "Zapisz jako..."');
        }
    });
});
document.getElementById('saveAsBtn').addEventListener('click', async function() {
    const canvas = await html2canvas(document.getElementById('editorContainer'));
    canvas.toBlob(function(blob) {
        saveAs(blob, 'edytowane_zdjecie.jpg');
    });
});