const body = document.querySelector('body');
const main = document.querySelector('main');
const header = document.querySelector('header');

const preloader = document.getElementById('preloader');

const toDoListSections = document.querySelectorAll('.todo-list .section');
const toDoListSectionAlle = document.querySelector('.todo-list .section.alle');
const toDoListSectionWichtig = document.querySelector('.todo-list .section.wichtig');
const toDoListSectionToday = document.querySelector('.todo-list .section.heute');
const toDoListSectionTomorrow = document.querySelector('.todo-list .section.morgen');
const toDoListSectionWeek = document.querySelector('.todo-list .section.woche');

const sidebarElements = document.querySelectorAll('.sidebar .element');
const mobileSidebarElements = document.querySelectorAll('.mobile-sidebar .element');
const allNotesCounters = document.querySelectorAll('.element.alle .counter');
const importantNotesCounters = document.querySelectorAll('.element.wichtig .counter');
const todayNotesCounters = document.querySelectorAll('.element.heute .counter');
const tomorrowNotesCounters = document.querySelectorAll('.element.morgen .counter');
const weekNotesCounters = document.querySelectorAll('.element.woche .counter');
const darkmodeToggleButtons = document.querySelectorAll('.darkmode-toggle');
const mobileSettingsButton = document.querySelector('.mobile-settings .fa-gear');
const mobileSettingsModal = document.querySelector('.mobile-settings .modal');

const newNoteButton = document.querySelector('#new-note-button');
const addNoteModal = document.querySelector('.add-note-modal');
const closeModalButton = document.querySelector('#close-modal-button');
const newNoteInput = document.querySelector('#new-note-input');
const addNoteButton = document.querySelector('#add-note-button');
const modalFavoriteStar = document.querySelector('#modalFavoriteStar');
const modalDateInput = document.querySelector('#modalDateInput');
const blurrer = document.querySelector('.blurrer');

let PageModeState = localStorage.getItem('PageModeState');
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

// Darkmode-Funktionen
function applyPageModeState(mode) {
    body.classList.remove('darkmode', 'lightmode');
    body.classList.add(mode);
}

function savePageModeState(mode) {
    localStorage.setItem('PageModeState', mode);
}

function initializeDarkMode() {
    if (PageModeState) {
        applyPageModeState(PageModeState);
    } else if (prefersDarkScheme.matches) {
        PageModeState = 'darkmode';
        applyPageModeState('darkmode');
    } else {
        PageModeState = 'lightmode';
        applyPageModeState('lightmode');
    }
}

prefersDarkScheme.addEventListener('change', (event) => {
    if (!localStorage.getItem('PageModeState')) {
        const mode = event.matches ? 'darkmode' : 'lightmode';
        applyPageModeState(mode);
    }
});

darkmodeToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const newMode = PageModeState === 'lightmode' ? 'darkmode' : 'lightmode';
        applyPageModeState(newMode);
        savePageModeState(newMode);
        PageModeState = newMode;
    });
});

// Funktion zur Initialisierung von Flatpickr mit deutscher Lokalisierung
function initializeFlatpickr(input) {
    // Überprüfen, ob das Eingabefeld bereits initialisiert wurde
    if (input._flatpickr) return;

    flatpickr(input, {
        locale: 'de', // Deutsche Lokalisierung
        dateFormat: 'd.m.Y', // Deutsches Datumsformat: TT.MM.JJJJ
        minDate: "today",
        disableMobile: true, // Deaktiviert den mobilen nativen Picker
        allowInput: false, // Verhindert die manuelle Eingabe
        onChange: function(selectedDates, dateStr, instance) {
            // Füge die Klasse 'selected' hinzu, wenn ein Datum ausgewählt wurde
            if (selectedDates.length > 0) {
                input.classList.add('selected');
            } else {
                input.classList.remove('selected');
            }
            // Trigger change event für Aktualisierungen
            input.dispatchEvent(new Event('change'));
        }
    });
}

// Funktion, um die Notizen in LocalStorage zu speichern
function saveNotesToLocalStorage(notes) {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Funktion, um die Notizen aus LocalStorage zu laden
function loadNotesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('notes')) || [];
}

// Funktion zum Erstellen eines neuen Notiz-Elements
function createNoteElement(note, index) {
    const noteElement = document.createElement('div');
    noteElement.classList.add('item');
    noteElement.innerHTML = `
        <i class="fa-solid fa-star ${note.wichtig ? 'active' : ''}" data-index="${index}"></i>
        <span class="note-text">${note.text}</span>
        <i class="fa-solid fa-trash" data-index="${index}"></i>
        <input type="text" class="datepicker" id="datepicker-${index}"  value="${note.datum ? note.datum : ''}" data-index="${index}" required placeholder="TT.MM.JJJJ" readonly>
        <label class="date-label" for="datepicker-${index}">Datum:</label>
    `;
    
    // Flatpickr für das Datumfeld anwenden
    const dateInput = noteElement.querySelector('.datepicker');
    initializeFlatpickr(dateInput);
    
    return noteElement;
}

// Funktion, um eine Notiz zu den entsprechenden Sektionen hinzuzufügen
function addNoteToSections(note, index) {
    // Hinzufügen zur "Alle"-Sektion
    const alleNote = createNoteElement(note, index);
    toDoListSectionAlle.appendChild(alleNote);
    
    // Hinzufügen zur "Wichtig"-Sektion, falls markiert
    if (note.wichtig) {
        const wichtigNote = createNoteElement(note, index);
        toDoListSectionWichtig.appendChild(wichtigNote);
    }
    
    // Nur hinzufügen zu den Datumsektionen, wenn ein Datum vorhanden ist
    if (note.datum) {
        const noteDate = parseDate(note.datum);
        const today = new Date();
        today.setHours(0,0,0,0); // Zeit auf Mitternacht setzen für genaue Vergleiche
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);
        
        if (isSameDay(noteDate, today)) {
            const heuteNote = createNoteElement(note, index);
            toDoListSectionToday.appendChild(heuteNote);
        }
        
        if (isSameDay(noteDate, tomorrow)) {
            const morgenNote = createNoteElement(note, index);
            toDoListSectionTomorrow.appendChild(morgenNote);
        }
        
        if (noteDate > today && noteDate <= weekLater) {
            const wocheNote = createNoteElement(note, index);
            toDoListSectionWeek.appendChild(wocheNote);
        }
    }
}

// Hilfsfunktion zum Vergleich, ob zwei Daten am selben Tag liegen
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Aufgabe zur "Wichtig"-Sektion hinzufügen
function addNoteToWichtigSection(note, index) {
    // Überprüfen, ob die Aufgabe bereits in der "Wichtig"-Sektion ist
    const existingNote = toDoListSectionWichtig.querySelector(`.fa-trash[data-index="${index}"]`);
    if (existingNote) return;

    // Aufgabe zur "Wichtig"-Sektion hinzufügen
    const wichtigNote = createNoteElement(note, index);
    toDoListSectionWichtig.appendChild(wichtigNote);

    // Zähler aktualisieren
    updateCounters();
}

// Aufgabe aus der "Wichtig"-Sektion entfernen
function removeNoteFromWichtigSection(index) {
    const noteElement = toDoListSectionWichtig.querySelector(`.fa-trash[data-index="${index}"]`);

    if (noteElement) {
        noteElement.parentElement.remove(); // Entfernt das Element
    }

    // Zähler aktualisieren
    updateCounters();
}

// Zähler für die Sektionen aktualisieren
function updateCounters() {
    const allItemsCount = toDoListSectionAlle.querySelectorAll(".item").length;
    const importantItemsCount = toDoListSectionWichtig.querySelectorAll(".item").length;
    const todayItemsCount = toDoListSectionToday.querySelectorAll(".item").length;
    const tomorrowItemsCount = toDoListSectionTomorrow.querySelectorAll(".item").length;
    const weekItemsCount = toDoListSectionWeek.querySelectorAll(".item").length;

    allNotesCounters.forEach(counter => counter.innerText = allItemsCount);
    importantNotesCounters.forEach(counter => counter.innerText = importantItemsCount);
    todayNotesCounters.forEach(counter => counter.innerText = todayItemsCount);
    tomorrowNotesCounters.forEach(counter => counter.innerText = tomorrowItemsCount);
    weekNotesCounters.forEach(counter => counter.innerText = weekItemsCount);
}

// Funktion zum Rendern der Notizen
function renderNotes() {
    const notes = loadNotesFromLocalStorage();
    
    // Alle Sektionen leeren, um doppelte Einträge zu vermeiden
    toDoListSectionAlle.innerHTML = '';
    toDoListSectionWichtig.innerHTML = '';
    toDoListSectionToday.innerHTML = '';
    toDoListSectionTomorrow.innerHTML = '';
    toDoListSectionWeek.innerHTML = '';
    
    // Funktion, um ein Notiz-Element zu einer Sektion hinzuzufügen
    notes.forEach((note, index) => {
        addNoteToSections(note, index);
    });

    // Zähler aktualisieren
    updateCounters();
}

// Funktion zum Parsen des Datums aus dem Format TT.MM.JJJJ
function parseDate(dateString) {
    const parts = dateString.split('.');
    if (parts.length !== 3) return null; // Ungültiges Format, null zurückgeben

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Monate sind 0-basiert
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (isNaN(date)) return null; // Ungültiges Datum

    return date;
}

// Funktion zur Formatierung des Datums für die Anzeige
function formatDateForDisplay(dateString) {
    return dateString || '';
}

// Funktion zur Formatierung des Datums für die Speicherung
function formatDateForStorage(dateString) {
    // Flatpickr stellt sicher, dass das Datum im Format 'd.m.Y' ist
    // Falls das Feld leer ist, geben wir eine leere Zeichenkette zurück
    return dateString ? dateString : '';
}

// Event-Listener für das Laden der Seite
window.addEventListener('load', () => {
    // Hinweis anzeigen, wenn das Gerät zu klein ist
    if (window.innerWidth < 350) {
        alert("Dieses Gerät entspricht nicht der Mindestgröße für diese Webseite. Bitte verwenden Sie ein Gerät mit einer Breite von mindestens 350px.");
    }
    // Notizen rendern
    renderNotes();

    // Page preloader ausblenden
    setTimeout(function() {
        preloader.classList.add('hidden');
    }, 2000);

    /// Dark-Mode Zustand laden
    initializeDarkMode();

    // Flatpickr initialisieren für alle vorhandenen Datumseingaben
    const dateInputs = document.querySelectorAll('.datepicker');
    dateInputs.forEach(function(input) {
        initializeFlatpickr(input);
    });
});

// Zwischen den Sektionen wechseln
sidebarElements.forEach((element, index) => {
    element.addEventListener('click', () => {
        toDoListSections.forEach((section, sectionIndex) => {
            if (index === sectionIndex) {
                section.classList.add('show');
            } else {
                section.classList.remove('show');
            }
        });
    });
});
mobileSidebarElements.forEach((element, index) => {
   element.addEventListener('click', () => {
        toDoListSections.forEach((section, sectionIndex) => {
            if (index === sectionIndex) {
            section.classList.add('show');
            } else {
            section.classList.remove('show');
            }
        });
   });
});

// Aktive Sektion in der Sidebar markieren
sidebarElements.forEach((element, index) => {
    element.addEventListener('click', () => {
        sidebarElements.forEach((el, elIndex) => {
            if (index === elIndex) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    });
});
mobileSidebarElements.forEach((element, index) => {
    element.addEventListener('click', () => {
        mobileSidebarElements.forEach((el, elIndex) => {
            if (index === elIndex) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    });
});

// Mobile Einstellungen öffnen und schließen
mobileSettingsButton.addEventListener('click', () => {
    mobileSettingsModal.classList.toggle('show');
    body.addEventListener('click', closeMobileSettingsModal);
});
function closeMobileSettingsModal(e) {
    if (!e.target.closest('.mobile-settings')) {
        mobileSettingsModal.classList.remove('show');
        body.removeEventListener('click', closeMobileSettingsModal);
    }
}

// Modal öffnen und Seite blurren
newNoteButton.addEventListener('click', () => {
    addNoteModal.classList.add('show');
    blurrer.classList.add("active");
    newNoteInput.focus();
});

// Modal schließen und Blur-Effekt entfernen
closeModalButton.addEventListener('click', () => {
    addNoteModal.classList.remove('show');
    newNoteInput.value = '';
    modalFavoriteStar.classList.remove('active');
    modalFavoriteStar.classList.remove('animate');
    modalDateInput.value = '';
    modalDateInput.classList.remove('selected'); // Entferne 'selected' Klasse
    blurrer.classList.remove("active");
});

// Favoriten-Stern im Modal umschalten
modalFavoriteStar.addEventListener('click', () => {
    modalFavoriteStar.classList.toggle('active');
    modalFavoriteStar.classList.toggle('animate');
});

// Neue Notiz erstellen und im Local Storage speichern
addNoteButton.addEventListener('click', () => {
    const newNoteText = newNoteInput.value.trim(); // Leerzeichen vom Wert des Inputs entfernen

    // Überprüfen, ob der Text leer ist
    if (!newNoteText) {
        newNoteInput.style.border = '2px solid red'; // Zeigt dem Benutzer das Problem
        setTimeout(() => newNoteInput.style.border = '', 2000); // Setzt den Zustand nach 2 Sekunden zurück
        return;
    }

    // Überprüfen, ob die Notiz als wichtig markiert ist
    let isNoteImportant = modalFavoriteStar.classList.contains('active'); // Korrigiert von 'isNoteImpartant' zu 'isNoteImportant'

    // Notiz in Local Storage speichern
    const notes = loadNotesFromLocalStorage();

    // Sicherstellen, dass das Datum im 'TT.MM.JJJJ' Format vorliegt
    const formattedDate = formatDateForStorage(modalDateInput.value);

    notes.push({ text: newNoteText, wichtig: isNoteImportant, datum: formattedDate });
    saveNotesToLocalStorage(notes);

    // Notizen neu rendern
    renderNotes();

    // Eingabefelder zurücksetzen und Modal schließen
    newNoteInput.value = ''; 
    modalDateInput.value = '';
    modalDateInput.classList.remove('selected'); // Entferne 'selected' Klasse
    modalFavoriteStar.classList.remove('active');
    modalFavoriteStar.classList.remove('animate');
    addNoteModal.classList.remove('show');
    blurrer.classList.remove("active");
});


// Enter-Taste zum Hinzufügen einer Notiz im Modal
addNoteModal.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNoteButton.click();
    }
});

// Event-Delegation für das Klicken auf Stern- und Papierkorb-Icons
toDoListSections.forEach(section => {
    section.addEventListener('click', handleNoteClick);
});

function handleNoteClick(e) {
    const notes = loadNotesFromLocalStorage();
    const index = e.target.getAttribute('data-index'); // Index des Elements

    // Papierkorb-Button wurde geklickt
    if (e.target.classList.contains('fa-trash')) {
        notes.splice(index, 1); // Entfernt die Aufgabe aus dem Local Storage Array
        saveNotesToLocalStorage(notes); // Speichert das aktualisierte Array
        renderNotes(); // Notizen neu rendern
        return;
    }

    // Stern-Button wurde geklickt
    if (e.target.classList.contains('fa-star')) {
        const note = notes[index]; // Notiz anhand des Index erhalten
        const wasWichtig = note.wichtig; // Speichert den aktuellen Zustand
        note.wichtig = !note.wichtig; // Wichtig-Status umschalten
        saveNotesToLocalStorage(notes); // Speichert die aktualisierte Aufgabe

        // Stern-Status aktualisieren
        updateStarIcon(index, note.wichtig);

        // Aufgabe in der "Wichtig"-Sektion hinzufügen oder entfernen
        if (note.wichtig) {
            addNoteToWichtigSection(note, index);
            e.target.classList.add('animate'); // Fügt die Animation hinzu
        } else {
            removeNoteFromWichtigSection(index);
            e.target.classList.remove('animate'); // Entfernt die Animation
        }
    }
}

// Funktion zur Aktualisierung des Stern-Icons in allen Sektionen
function updateStarIcon(index, status) {
    const sections = [toDoListSectionAlle, toDoListSectionWichtig, toDoListSectionToday, toDoListSectionTomorrow, toDoListSectionWeek];
    sections.forEach(section => {
        const stars = section.querySelectorAll(`.fa-star[data-index="${index}"]`);
        stars.forEach(star => {
            if (status) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    });
}

// Event-Delegation für Änderungen am Datumfeld
toDoListSections.forEach(section => {
    section.addEventListener('change', handleDateChange);
});

function handleDateChange(e) {
    if (e.target.tagName === "INPUT" && e.target.classList.contains('datepicker')) {
        const notes = loadNotesFromLocalStorage(); // Notizen aus dem Local Storage laden
        const index = e.target.getAttribute('data-index'); // Index der geänderten Notiz
        const note = notes[index]; // Notiz anhand des Index erhalten
        note.datum = formatDateForStorage(e.target.value); // Datum aktualisieren
        saveNotesToLocalStorage(notes); // Notizen speichern
        renderNotes(); // Notizen neu rendern
    }

    updateCounters(); // Zähler aktualisieren
}