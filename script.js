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

// Funkcja ładująca szablony do selecta
function loadSavedTemplates() {
    const select = document.getElementById('templateSelect');
    
    // Wyczyść select
    select.innerHTML = '';
    
    // Przeszukaj localStorage i dodaj wszystkie znalezione szablony
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('template_')) {
            const templateName = key.replace('template_', '');
            const option = new Option(templateName, templateName);
            select.add(option);
        }
    }
}

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
    
   shadow.style.width = (overlay.offsetWidth + borderWidth * 2) + 'px';  
   shadow.style.height = (overlay.offsetHeight + borderWidth * 2) + 'px';  
   shadow.style.left = (overlay.offsetLeft - borderWidth) + 'px';  
   shadow.style.top = (overlay.offsetTop - borderWidth) + 'px';
   shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.66)';
   shadow.style.filter = 'blur(10px)';
}  
  
// Obsługa kształtu nakładki  
document.querySelectorAll('[data-shape]').forEach(btn => {  
   btn.addEventListener('click', function() {
      // Usuń active ze wszystkich przycisków
      document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
      // Dodaj active do klikniętego przycisku
      this.classList.add('active');
      
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

function applySettings(settings) {
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

/// Przy starcie strony
window.addEventListener('DOMContentLoaded', function() {
    // Załaduj zapisane szablony do selecta
    loadSavedTemplates();
   // Włącz cień domyślnie
    const shadowToggle = document.getElementById('shadowToggle');
    shadowToggle.checked = true;
    shadow.style.display = 'block';
    updateShadow();
});
