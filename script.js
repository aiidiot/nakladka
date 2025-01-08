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
const shadow = document.getElementById('shadow');  

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
        updateShadow();  
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
    updateShadow();  
}  

document.getElementById('overlaySize').addEventListener('input', e => updateOverlaySize(e.target.value));  
document.getElementById('overlaySizeInput').addEventListener('input', e => updateOverlaySize(e.target.value));  

// Obsługa grubości ramki  
document.getElementById('borderWidth').addEventListener('input', function(e) {  
    const value = e.target.value;  
    overlayContainer.style.border = `${value}px solid ${document.getElementById('borderColor').value}`;  
    updateShadow();  
});  

document.getElementById('borderWidthInput').addEventListener('input', function(e) {  
    const value = e.target.value;  
    overlayContainer.style.border = `${value}px solid ${document.getElementById('borderColor').value}`;  
    updateShadow();  
});  

// Obsługa cienia  
document.getElementById('shadowToggle').addEventListener('change', function(e) {  
    if (this.checked) {  
        shadow.style.display = 'block';  
        updateShadow();  
    } else {  
        shadow.style.display = 'none';  
    }  
});  

// Funkcja aktualizacji cienia  
function updateShadow() {  
    const overlay = document.getElementById('overlayContainer');  
    const shadow = document.getElementById('shadow');  
    const borderWidth = parseInt(getComputedStyle(overlay).borderWidth);  
    
    shadow.style.width = (overlay.offsetWidth + borderWidth * 1) + 'px';  
    shadow.style.height = (overlay.offsetHeight + borderWidth * 1) + 'px';  
    
    shadow.style.left = (overlay.offsetLeft - borderWidth + 3) + 'px';  
    shadow.style.top = (overlay.offsetTop - borderWidth + 2) + 'px';  
}

// Obsługa kształtu nakładki  
document.querySelectorAll('.btn').forEach(btn => {  
    btn.addEventListener('click', function() {  
        const shape = this.dataset.shape;  
        if (shape === 'circle') {  
            overlayContainer.classList.add('circle');  
            overlayContainer.classList.remove('square');  
            shadow.style.borderRadius = '50%';  
        } else if (shape === 'square') {  
            overlayContainer.classList.add('square');  
            overlayContainer.classList.remove('circle');  
            shadow.style.borderRadius = '0';  
        }  
    });  
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

// Wczytywanie zdjęć  
document.getElementById('mainImageInput').addEventListener('change', function(e) {  
    const file = e.target.files[0];  
    if (file) {  
        const reader = new FileReader();  
        reader.onload = function(e) {  
            mainImage.src = e.target.result;  
            mainImage.style.display = 'block';  
        };  
        reader.readAsDataURL(file);  
    }  
});  

document.getElementById('overlayImageInput').addEventListener('change', function(e) {  
    const file = e.target.files[0];  
    if (file) {  
        const reader = new FileReader();  
        reader.onload = function(e) {  
            overlayImage.src = e.target.result;  
            overlayImage.style.display = 'block';  
        };  
        reader.readAsDataURL(file);  
    }  
});  

// Uniwersalna funkcja do renderowania obrazu
async function renderImage() {
    const options = {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
        logging: true,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
            const overlayImage = clonedDoc.getElementById('overlayImage');
            if (overlayImage) {
                overlayImage.style.borderRadius = '100%';
            }
        }
    };

    try {
        const container = document.getElementById('editorContainer');
        const canvas = await html2canvas(container, options);
        return canvas;
    } catch (error) {
        console.error('Błąd podczas renderowania:', error);
        throw error;
    }
}

// Poprawiona funkcja zapisu
document.getElementById('saveAsBtn').addEventListener('click', async function() {
    try {
        const canvas = await renderImage();
        const quality = 1.0;

        canvas.toBlob(
            function(blob) {
                if (blob) {
                    try {
                        saveAs(blob, 'edytowane_zdjecie.png');
                    } catch (saveError) {
                        console.error('Błąd podczas zapisywania:', saveError);
                        const link = document.createElement('a');
                        link.download = 'edytowane_zdjecie.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    }
                } else {
                    throw new Error('Nie udało się utworzyć pliku obrazu');
                }
            },
            'image/png',
            quality
        );
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
    }
});

// Poprawiona funkcja kopiowania do schowka
document.getElementById('copyToClipboardBtn').addEventListener('click', async function() {
    try {
        const canvas = await renderImage();
        
        canvas.toBlob(async function(blob) {
            try {
                if (navigator.clipboard && navigator.clipboard.write) {
                    const clipboardItem = new ClipboardItem({
                        'image/png': blob
                    });
                    await navigator.clipboard.write([clipboardItem]);
                    alert('Skopiowano do schowka!');
                } else {
                    const dataUrl = canvas.toDataURL('image/png');
                    const img = document.createElement('img');
                    img.src = dataUrl;
                    
                    const div = document.createElement('div');
                    div.contentEditable = true;
                    div.appendChild(img);
                    document.body.appendChild(div);
                    
                    const range = document.createRange();
                    range.selectNodeContents(div);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    const success = document.execCommand('copy');
                    document.body.removeChild(div);
                    
                    if (success) {
                        alert('Obraz został skopiowany do schowka');
                    } else {
                        throw new Error('Nie udało się skopiować');
                    }
                }
            } catch (error) {
                console.error('Błąd kopiowania:', error);
                alert('Nie udało się skopiować obrazu. Spróbuj użyć przycisku "Zapisz jako..."');
            }
        }, 'image/png', 1.0);
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas kopiowania. Spróbuj użyć przycisku "Zapisz jako..."');
    }
});
