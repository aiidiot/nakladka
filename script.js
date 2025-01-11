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

// Funkcja aktualizacji cienia  
function updateShadow() {  
   const overlay = document.getElementById('overlayContainer');  
   const shadow = document.getElementById('shadow');  
   const borderWidth = parseInt(getComputedStyle(overlay).borderWidth);  
    
   shadow.style.width = (overlay.offsetWidth + borderWidth * 2) + 'px';  
   shadow.style.height = (overlay.offsetHeight + borderWidth * 2) + 'px';  
   shadow.style.left = (overlay.offsetLeft - borderWidth) + 'px';  
   shadow.style.top = (overlay.offsetTop - borderWidth) + 'px';
   shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.66)';
   shadow.style.filter = 'blur(10px)';
   
   if (overlayContainer.classList.contains('sklejka')) {
       shadow.classList.add('sklejka');
   } else {
       shadow.classList.remove('sklejka');
   }
}

// Funkcja aktualizacji pozycji głównego zdjęcia
function updateMainImagePosition() {  
   mainImage.style.transform = `translate(calc(-50% + ${mainImageOffset.x}px), calc(-50% + ${mainImageOffset.y}px)) scale(${mainImageScale})`;  
}

// Funkcja aktualizacji wielkości nakładki
function updateOverlaySize(value) {  
   document.getElementById('overlaySize').value = value;  
   document.getElementById('overlaySizeInput').value = value;  
   if (!overlayContainer.classList.contains('sklejka')) {
       overlayContainer.style.width = value + 'px';  
       overlayContainer.style.height = value + 'px';  
   }
   updateShadow();  
}
// Obsługa przycisków kolorów  
document.querySelectorAll('.color-btn').forEach(btn => {  
   btn.addEventListener('click', function() {  
      const color = this.dataset.color;  
      overlayContainer.style.borderColor = color;  
      document.getElementById('borderColor').value = color;  
   });  
});  

// Obsługa obrotu nakładki
document.getElementById('rotationAngle').addEventListener('input', function(e) {
    overlayRotation = parseInt(e.target.value);
    document.getElementById('rotationAngleInput').value = overlayRotation;
    overlayContainer.style.transform = `rotate(${overlayRotation}deg)`;
    updateShadow();
});

document.getElementById('rotationAngleInput').addEventListener('input', function(e) {
    overlayRotation = parseInt(e.target.value);
    document.getElementById('rotationAngle').value = overlayRotation;
    overlayContainer.style.transform = `rotate(${overlayRotation}deg)`;
    updateShadow();
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
// Obsługa strzałek dla głównego zdjęcia  
const MOVE_STEP = 10;  
document.querySelectorAll('#mainImageNav .arrow').forEach(arrow => {  
   arrow.addEventListener('click', function() {  
      const direction = this.classList[1];  
      switch(direction) {  
        case 'up': mainImageOffset.y -= MOVE_STEP; break;  
        case 'down': mainImageOffset.y += MOVE_STEP; break;  
        case 'left': mainImageOffset.x -= MOVE_STEP; break;  
        case 'right': mainImageOffset.x += MOVE_STEP; break;  
      }  
      updateMainImagePosition();  
   });  
});  
  
// Obsługa strzałek dla nakładki  
document.querySelectorAll('#overlayImageNav .arrow').forEach(arrow => {  
   arrow.addEventListener('click', function() {  
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

// Obsługa wielkości nakładki  
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

// Obsługa kształtu nakładki  
document.querySelectorAll('[data-shape]').forEach(btn => {  
   btn.addEventListener('click', function() {
      // Usuń active ze wszystkich przycisków
      document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const shape = this.dataset.shape;  
      overlayContainer.classList.remove('circle', 'square', 'sklejka');
      
      if (shape === 'circle') {  
        overlayContainer.classList.add('circle');  
        shadow.style.borderRadius = '50%';
      } else if (shape === 'square') {  
        overlayContainer.classList.add('square');  
        shadow.style.borderRadius = '0';
      } else if (shape === 'sklejka') {
        overlayContainer.classList.add('sklejka');
        shadow.style.borderRadius = '0';
        overlayContainer.style.width = '50%';
        overlayContainer.style.height = '100%';
        overlayContainer.style.top = '0';
        overlayContainer.style.left = '0';
        overlayContainer.style.transform = 'none';
      }
      updateShadow();
   });  
});
Część 4 - Obsługa wczytywania zdjęć, szablonów i zapisu:

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
        // Automatyczne dopasowanie po załadowaniu
        mainImage.onload = function() {
            mainImageOffset = { x: 0, y: 0 };  
            mainImageScale = 1;  
            document.getElementById('mainImageScale').value = 100;  
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
   if (file) {  
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

// Funkcje obsługi szablonów
function loadSavedTemplates() {
    const select = document.getElementById('templateSelect');
    select.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('template_')) {
            const templateName = key.replace('template_', '');
            const option = new Option(templateName, templateName);
            select.add(option);
        }
    }
}

function getCurrentSettings() {
    return {
        shape: overlayContainer.classList.contains('circle') ? 'circle' : 
               overlayContainer.classList.contains('sklejka') ? 'sklejka' : 'square',
        overlaySize: overlayContainer.style.width.replace('px', ''),
        borderWidth: overlayContainer.style.borderWidth.replace('px', ''),
        borderColor: overlayContainer.style.borderColor,
        rotation: overlayRotation,
        position: {
            left: overlayContainer.style.left.replace('px', ''),
            top: overlayContainer.style.top.replace('px', '')
        }
    };
}

function applySettings(settings) {
    // Symuluj kliknięcie odpowiedniego przycisku kształtu
    const shapeButton = document.querySelector(`[data-shape="${settings.shape}"]`);
    if (shapeButton) shapeButton.click();

    // Ustaw rozmiar jeśli nie jest to sklejka
    if (settings.shape !== 'sklejka') {
        updateOverlaySize(settings.overlaySize);
    }

    // Ustaw pozostałe parametry
    document.getElementById('borderWidth').value = settings.borderWidth;
    overlayContainer.style.borderWidth = settings.borderWidth + 'px';
    document.getElementById('borderColor').value = settings.borderColor;
    overlayContainer.style.borderColor = settings.borderColor;
    
    if (settings.shape !== 'sklejka') {
        overlayContainer.style.left = settings.position.left + 'px';
        overlayContainer.style.top = settings.position.top + 'px';
    }

    // Ustaw rotację
    if (settings.rotation !== undefined) {
        overlayRotation = settings.rotation;
        document.getElementById('rotationAngle').value = overlayRotation;
        document.getElementById('rotationAngleInput').value = overlayRotation;
        overlayContainer.style.transform = `rotate(${overlayRotation}deg)`;
    }

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

// Obsługa szablonów
document.getElementById('loadTemplateBtn').addEventListener('click', function() {
    const templateName = document.getElementById('templateSelect').value;
    const template = localStorage.getItem('template_' + templateName);
    if (template) {
        applySettings(JSON.parse(template));
    } else {
        alert('Nie znaleziono szablonu');
    }
});

document.getElementById('saveTemplateBtn').addEventListener('click', function() {
    const newTemplateName = document.getElementById('newTemplateName').value.trim();
    if (!newTemplateName) {
        alert('Wprowadź nazwę szablonu');
        return;
    }

    const settings = getCurrentSettings();
    localStorage.setItem('template_' + newTemplateName, JSON.stringify(settings));

    // Dodaj do selecta
    const select = document.getElementById('templateSelect');
    if (!Array.from(select.options).some(opt => opt.value === newTemplateName)) {
        select.add(new Option(newTemplateName, newTemplateName));
    }
    
    document.getElementById('newTemplateName').value = '';
    alert('Szablon został zapisany');
});

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

// Inicjalizacja przy starcie
window.addEventListener('DOMContentLoaded', function() {
    loadSavedTemplates();
    const shadowToggle = document.getElementById('shadowToggle');
    shadowToggle.checked = true;
    shadow.style.display = 'block';
    updateShadow();
});

 
