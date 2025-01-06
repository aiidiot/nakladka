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

// Funkcje do obsługi ciasteczek
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Funkcja ładująca szablony do selecta
function loadSavedTemplates() {
    const select = document.getElementById('templateSelect');
    
    // Wyczyść select
    select.innerHTML = '';
    
    // Przeszukaj ciasteczka i dodaj wszystkie znalezione szablony
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key.startsWith('template_')) {
            const templateName = key.replace('template_', '');
            const option = new Option(templateName, templateName);
            select.add(option);
        }
    });
}

// Obsługa przycisków kolorów  
document.querySelectorAll('.color-btn').forEach(btn => {  
   btn.addEventListener('click', function() {  
      const color = this.dataset.color;  
      overlayContainer.style.borderColor = color;  
      document.getElementById('borderColor').value = color;  
   });  
});  

// Reszta kodu (bez zmian od Twojej wersji)

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

// Zapisywanie szablonu
document.getElementById('saveTemplateBtn').addEventListener('click', function() {
    const newTemplateName = document.getElementById('newTemplateName').value.trim();
    if (!newTemplateName) {
        alert('Wprowadź nazwę szablonu');
        return;
    }

    const settings = getCurrentSettings();
    setCookie('template_' + newTemplateName, JSON.stringify(settings), 365);

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
        deleteCookie('template_' + templateName);
        select.remove(select.selectedIndex);
        alert('Szablon został usunięty');
    }
});

// Wczytywanie szablonu
document.getElementById('loadTemplateBtn').addEventListener('click', function() {
    const templateName = document.getElementById('templateSelect').value;
    const template = getCookie('template_' + templateName);
    if (template) {
        applySettings(JSON.parse(template));
    } else {
        alert('Nie znaleziono szablonu');
    }
});

/// Przy starcie strony
window.addEventListener('DOMContentLoaded', function() {
    // Załaduj zapisane szablony do selecta
    loadSavedTemplates();
});
