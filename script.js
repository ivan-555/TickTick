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

const newNoteButton = document.querySelector('#new-note-button');
const addNoteModal = document.querySelector('.add-note-modal');
const closeModalButton = document.querySelector('#close-modal-button');
const newNoteInput = document.querySelector('#new-note-input');
const addNoteButton = document.querySelector('#add-note-button');
const modalFavoriteStar = document.querySelector('#modalFavoriteStar');
const modalDateInput = document.querySelector('#modalDateInput');
const blurrer = document.querySelector('.blurrer');

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
    
    // Alle Sektionen leeren
    toDoListSectionAlle.innerHTML = '';
    toDoListSectionWichtig.innerHTML = '';
    toDoListSectionToday.innerHTML = '';
    toDoListSectionTomorrow.innerHTML = '';
    toDoListSectionWeek.innerHTML = '';
    
    notes.forEach((note, index) => {
        addNoteToSections(note, index);
    });

    // Zähler aktualisieren
    updateCounters();
}

// Funktion zum Parsen des Datums aus dem Format TT.MM.JJJJ
function parseDate(dateString) {
    const parts = dateString.split('.');
    if (parts.length !== 3) return null; // Ungültiges Format

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Monate sind 0-basiert
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (isNaN(date)) return null; // Ungültiges Datum

    return date;
}

// Funktion zur Formatierung des Datums für die Speicherung
function formatDateForStorage(dateString) {
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

    // Flatpickr initialisieren für alle vorhandenen Datumseingaben
    const dateInputs = document.querySelectorAll('.datepicker');
    dateInputs.forEach(function(input) {
        initializeFlatpickr(input);
    });
});

// Zwischen den Sektionen wechseln (Sidebar & Mobile)
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
    modalDateInput.classList.remove('selected');
    blurrer.classList.remove("active");
});

// Favoriten-Stern im Modal umschalten
modalFavoriteStar.addEventListener('click', () => {
    modalFavoriteStar.classList.toggle('active');
    modalFavoriteStar.classList.toggle('animate');
});

// Neue Notiz erstellen
addNoteButton.addEventListener('click', () => {
    const newNoteText = newNoteInput.value.trim();
    if (!newNoteText) {
        newNoteInput.style.border = '2px solid red';
        setTimeout(() => newNoteInput.style.border = '', 2000);
        return;
    }

    const isNoteImportant = modalFavoriteStar.classList.contains('active');

    const notes = loadNotesFromLocalStorage();
    const formattedDate = formatDateForStorage(modalDateInput.value);

    notes.push({ text: newNoteText, wichtig: isNoteImportant, datum: formattedDate });
    saveNotesToLocalStorage(notes);

    renderNotes();

    newNoteInput.value = '';
    modalDateInput.value = '';
    modalDateInput.classList.remove('selected');
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

// Event-Delegation für Stern/Papierkorb in den einzelnen Sektionen
toDoListSections.forEach(section => {
    section.addEventListener('click', handleNoteClick);
});

function handleNoteClick(e) {
    const notes = loadNotesFromLocalStorage();
    const index = e.target.getAttribute('data-index');

    // Papierkorb
    if (e.target.classList.contains('fa-trash')) {
        notes.splice(index, 1);
        saveNotesToLocalStorage(notes);
        renderNotes();
        return;
    }

    // Stern
    if (e.target.classList.contains('fa-star')) {
        const note = notes[index];
        note.wichtig = !note.wichtig;
        saveNotesToLocalStorage(notes);

        updateStarIcon(index, note.wichtig);

        if (note.wichtig) {
            addNoteToWichtigSection(note, index);
            e.target.classList.add('animate');
        } else {
            removeNoteFromWichtigSection(index);
            e.target.classList.remove('animate');
        }
    }
}

// Stern-Icon in allen Sektionen aktualisieren
function updateStarIcon(index, status) {
    const sections = [
        toDoListSectionAlle,
        toDoListSectionWichtig,
        toDoListSectionToday,
        toDoListSectionTomorrow,
        toDoListSectionWeek
    ];
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

// Datum ändern
toDoListSections.forEach(section => {
    section.addEventListener('change', handleDateChange);
});

function handleDateChange(e) {
    if (e.target.tagName === "INPUT" && e.target.classList.contains('datepicker')) {
        const notes = loadNotesFromLocalStorage();
        const index = e.target.getAttribute('data-index');
        const note = notes[index];
        note.datum = formatDateForStorage(e.target.value);
        saveNotesToLocalStorage(notes);
        renderNotes();
    }
    updateCounters();
}
