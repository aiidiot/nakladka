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

// Funkcje obsługi szablonów
function getCurrentSettings() {
    return {
        shape: overlayContainer.classList.contains('circle') ? 'circle' : 'square',
        overlaySize: overlayContainer.style.width.replace('px', ''),
        borderWidth: overlayContainer.style.borderWidth.replace('px', ''),
        borderColor: overlayContainer.style.borderColor,
        position: {
            left: overlayContainer.style.left.replace('px', ''),
            top: overlayContainer.style.top.replace('px', '')
        }
    };
}



    // Ustawienie kształtu
    if (settings.shape === 'circle') {
        overlayContainer.classList.add('circle');
        overlayContainer.classList.remove('square');
        shadow.style.borderRadius = '50%';
        document.querySelector('[data-shape="circle"]').classList.add('active');
        document.querySelector('[data-shape="square"]').classList.remove('active');
    } else {
        overlayContainer.classList.add('square');
        overlayContainer.classList.remove('circle');
        shadow.style.borderRadius = '0';
        document.querySelector('[data-shape="square"]').classList.add('active');
        document.querySelector('[data-shape="circle"]').classList.remove('active');
    }

    // Ustawienie rozmiaru
    updateOverlaySize(settings.overlaySize);
    document.getElementById('overlaySize').value = settings.overlaySize;
    document.getElementById('overlaySizeInput').value = settings.overlaySize;

    // Ustawienie grubości ramki
    const borderWidth = document.getElementById('borderWidth');
    if (borderWidth) {
        borderWidth.value = settings.borderWidth;
        overlayContainer.style.borderWidth = settings.borderWidth + 'px';
    }

    // Ustawienie koloru
    const borderColor = document.getElementById('borderColor');
    if (borderColor) {
        borderColor.value = settings.borderColor;
        overlayContainer.style.borderColor = settings.borderColor;
    }

    // Ustawienie pozycji
    overlayContainer.style.left = settings.position.left + 'px';
    overlayContainer.style.top = settings.position.top + 'px';

    updateShadow();
}

// Zapisz jako...
document.getElementById('saveAsBtn').addEventListener('click', function() {
    const editorContainer = document.getElementById('editorContainer');
    
    domtoimage.toPng(editorContainer, {
        quality: 1,
        bgcolor: '#fff',
    })
    .then(function(dataUrl) {
        const date = new Date();
        const timestamp = date.getFullYear() + 
                         ('0' + (date.getMonth()+1)).slice(-2) + 
                         ('0' + date.getDate()).slice(-2) + '_' +
                         ('0' + date.getHours()).slice(-2) + 
                         ('0' + date.getMinutes()).slice(-2);
        const filename = 'Sklejka_' + timestamp + '.png';
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    })
    .catch(function(error) {
        console.error('Błąd podczas zapisywania:', error);
        alert('Wystąpił błąd podczas zapisywania zdjęcia.');
    });
});

// Kopiuj do schowka
document.getElementById('copyToClipboardBtn').addEventListener('click', function() {
    const editorContainer = document.getElementById('editorContainer');
    
    domtoimage.toBlob(editorContainer, {
        quality: 1,
        bgcolor: '#fff',
    })
    .then(async function(blob) {
        try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Skopiowano do schowka! Możesz teraz wkleić obraz w dowolnym programie graficznym.');
        } catch(err) {
            console.error('Błąd kopiowania do schowka:', err);
            alert('Nie udało się skopiować do schowka. Spróbuj użyć przycisku "Zapisz jako..."');
        }
    })
    .catch(function(error) {
        console.error('Błąd podczas tworzenia obrazu:', error);
        alert('Wystąpił błąd podczas kopiowania do schowka.');
    });
});

// Wczytywanie szablonu
document.getElementById('loadTemplateBtn').addEventListener('click', function() {
    const templateName = document.getElementById('templateSelect').value;
    const template = localStorage.getItem('template_' + templateName);
    if (template) {
        applySettings(JSON.parse(template));
    } else {
        alert('Nie znaleziono szablonu');
    }
});

// Zapisywanie szablonu
document.getElementById('saveTemplateBtn').addEventListener('click', function() {
    const newTemplateName = document.getElementById('newTemplateName').value.trim();
    if (!newTemplateName) {
        alert('Wprowadź nazwę szablonu');
        return;
    }

    const settings = getCurrentSettings();
    localStorage.setItem('template_' + newTemplateName, JSON.stringify(settings));

    // Dodawanie nowej opcji do selecta
    const select = document.getElementById('templateSelect');
    let exists = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text === newTemplateName) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        const option = new Option(newTemplateName, newTemplateName);
        select.add(option);
    }
    
    document.getElementById('newTemplateName').value = '';
    alert('Szablon został zapisany');
});

// Usuwanie szablonu
document.getElementById('deleteTemplateBtn').addEventListener('click', function() {
    const select = document.getElementById('templateSelect');
    if (select.selectedIndex === -1) {
        alert('Wybierz szablon do usunięcia');
        return;
    }
    
    const templateName = select.value;
    if (confirm(`Czy na pewno chcesz usunąć szablon "${select.options[select.selectedIndex].text}"?`)) {
        localStorage.removeItem('template_' + templateName);
        select.remove(select.selectedIndex);
        alert('Szablon został usunięty');
    }
});

// Przy starcie strony
window.addEventListener('DOMContentLoaded', function() {
    // Załaduj zapisane szablony do selecta
    loadSavedTemplates();
    // Włącz cień domyślnie
    const shadowToggle = document.getElementById('shadowToggle');
    shadowToggle.checked = true;
    shadow.style.display = 'block';
    updateShadow();
});
