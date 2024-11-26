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
const allNotesCounter = document.querySelector('.sidebar .element.alle .counter');
const importantNotesCounter = document.querySelector('.sidebar .element.wichtig .counter');
const todayNotesCounter = document.querySelector('.sidebar .element.heute .counter');
const tomorrowNotesCounter = document.querySelector('.sidebar .element.morgen .counter');
const weekNotesCounter = document.querySelector('.sidebar .element.woche .counter');

const Sidebar = document.querySelector('.sidebar');
const sidebarElements = document.querySelectorAll('.sidebar .element');
const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
const mobileSidebarToggleIcon = document.querySelector('.mobile-sidebar-toggle i');
const darkmodeToggleButton = document.querySelector('.darkmode-toggle');
const darkmodeToggleButtonCircle = document.querySelector('.darkmode-toggle .slide .circle');

const newNoteButton = document.querySelector('#new-note-button');
const addNoteModal = document.querySelector('.add-note-modal');
const closeModalButton = document.querySelector('#close-modal-button');
const newNoteInput = document.querySelector('#new-note-input');
const addNoteButton = document.querySelector('#add-note-button');
const blurrer = document.querySelector('.blurrer');

let modalFavoriteStar = document.querySelector('#modalFavoriteStar');
let modalDateInput = document.querySelector('#modalDateInput');
let PageModeState = "lightmode";
let SidebarState = "closed";

// Beim Laden der Seite die Notizen rendern
window.onload = renderNotes;

// Page preloader
window.addEventListener('load', function() {
    setTimeout(function() {
        preloader.classList.add('hidden');
    }, 2000);
});

// Dark-Mode und PageModeState basierend auf Local Storage oder den Systemeinstellungen festlegen
window.addEventListener('load', () => {
    const savedMode = localStorage.getItem('PageModeState');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (savedMode) {
        // Falls der Modus im Local Storage gespeichert ist, diesen anwenden
        PageModeState = savedMode;
        body.classList.add(savedMode);
    } else if (prefersDarkScheme.matches) {
        PageModeState = "darkmode";
        body.classList.add('darkmode');
    } else {
        PageModeState = "lightmode";
        body.classList.add('lightmode');
    }
});
// Dark-Mode umschalten und Zustand im Local Storage speichern
darkmodeToggleButton.addEventListener('click', () => {
    if (PageModeState === "lightmode") {
        PageModeState = "darkmode";
        body.classList.remove('lightmode');
        body.classList.add('darkmode');
        localStorage.setItem('PageModeState', 'darkmode'); // Zustand speichern
    } else {
        PageModeState = "lightmode";
        body.classList.remove('darkmode');
        body.classList.add('lightmode');
        localStorage.setItem('PageModeState', 'lightmode'); // Zustand speichern
    }
});

// Mobile Sidebar Toggle
mobileSidebarToggle.addEventListener('click', () => {
    if (SidebarState === "closed") {
        Sidebar.classList.add('open');
        mobileSidebarToggleIcon.style.transform = 'rotate(-180deg)';
        SidebarState = "open";
        if (window.innerWidth < 500) {
            mobileSidebarToggle.classList.add("shift");
        }
    } else {
        Sidebar.classList.remove('open');
        mobileSidebarToggleIcon.style.transform = 'rotate(0deg)';
        SidebarState = "closed";
        if (window.innerWidth < 500) {
            mobileSidebarToggle.classList.remove("shift");
        }
    }
});

// ToDo Liste filtern bei Klick auf Sidebar-Element
sidebarElements.forEach((element, index) => {
    element.addEventListener('click', () => {
        Sidebar.classList.remove('open');
        SidebarState = "closed";
        mobileSidebarToggleIcon.style.transform = 'rotate(0deg)';
        if (window.innerWidth < 500) {
            mobileSidebarToggle.classList.remove("shift");
        }
        toDoListSections.forEach((section, sectionIndex) => {
            if (index === sectionIndex) {
                section.classList.add('show');
            } else {
                section.classList.remove('show');
            }
        });
    });
});

// Aktives Sidebar-Element markieren
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

// Modal öffnen und Seite blurren
newNoteButton.addEventListener('click', () => {
    addNoteModal.classList.add('show');
    blurrer.classList.add("active");
    newNoteInput.focus();

    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

     // Setze das min-Attribut auf das heutige Datum
     modalDateInput.setAttribute('min', getTodayDateString());
});

// Modal schließen und Blur-Effekt entfernen
closeModalButton.addEventListener('click', () => {
    addNoteModal.classList.remove('show');
    newNoteInput.value = '';
    modalFavoriteStar.classList.remove('active');
    modalFavoriteStar.classList.remove('animate');
    modalDateInput.value = '';
    blurrer.classList.remove("active");
});

// Modal Star Icon
modalFavoriteStar.addEventListener('click', () => {
    modalFavoriteStar.classList.toggle('active');
    modalFavoriteStar.classList.toggle('animate');
});

// Neue Notiz hinzufügen
addNoteButton.addEventListener('click', () => {
    const newNoteText = newNoteInput.value.trim(); // Leerzeichen am Anfang und Ende entfernen
    if (!newNoteText) {
        newNoteInput.style.border = '2px solid red'; // Zeigt dem Benutzer das Problem
        setTimeout(() => newNoteInput.style.border = '', 2000); // Setzt den Zustand nach 2 Sekunden zurück
        return;
    }

    let isNoteImpartant = modalFavoriteStar.classList.contains('active');

    // Neue Notiz erstellen
    const notes = loadNotesFromLocalStorage();
    notes.push({ text: newNoteText, wichtig: isNoteImpartant, datum: modalDateInput.value});
    saveNotesToLocalStorage(notes);

    renderNotes(); // Notiz hinzufügen und neu rendern

    newNoteInput.value = '';
    modalFavoriteStar.classList.remove('active');
    modalFavoriteStar.classList.remove('animate');
    modalDateInput.value = '';
    addNoteModal.classList.remove('show');
    blurrer.classList.remove("active");
});
addNoteModal.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNoteButton.click();
    }
});


// Event-Delegation für das Klicken auf Stern- und Papierkorb-Icons
toDoListSectionAlle.addEventListener('click', handleNoteClick);
toDoListSectionWichtig.addEventListener('click', handleNoteClick);
toDoListSectionToday.addEventListener('click', handleNoteClick);
toDoListSectionTomorrow.addEventListener('click', handleNoteClick);
toDoListSectionWeek.addEventListener('click', handleNoteClick);

function handleNoteClick(e) {
    const notes = loadNotesFromLocalStorage();
    const index = e.target.getAttribute('data-index'); // Index des Elements

    // Papierkorb-Button wurde geklickt
    if (e.target.classList.contains('fa-trash')) {
        notes.splice(index, 1); // Entfernt die Aufgabe aus dem Array
        saveNotesToLocalStorage(notes); // Speichern
        renderNotes(); // Notizen neu rendern
        return; // Beenden, da die Aufgabe gelöscht wurde
    }

    // Stern-Button wurde geklickt
    if (e.target.classList.contains('fa-star')) {
        const note = notes[index];
        const wasWichtig = note.wichtig; // Speichert den aktuellen Zustand
        note.wichtig = !note.wichtig; // Wichtig-Status umschalten
        saveNotesToLocalStorage(notes); // Speichern

        // Stern-Status in Sektionen aktualisieren
        updateStarIcon(index, note.wichtig);

        // Nur die Animation auslösen, wenn der Stern "wichtig" wird
        if (!wasWichtig && note.wichtig) {
            e.target.classList.add('animate');
            setTimeout(() => {
                e.target.classList.remove('animate'); // Animation nach kurzer Zeit entfernen
            }, 500); // Dauer der Animation (0.5 Sekunden)
        }
        // Aufgabe in der "Wichtig"-Sektion hinzufügen oder entfernen
        if (note.wichtig) {
            addNoteToWichtigSection(note, index);
        } else {
            removeNoteFromWichtigSection(index);
        }
    }
}

// Aufgabe zur "Wichtig"-Sektion hinzufügen
function addNoteToWichtigSection(note, index) {
    // Überprüfen, ob die Aufgabe bereits in der "Wichtig"-Sektion ist
    const existingNote = toDoListSectionWichtig.querySelector(`.fa-trash[data-index="${index}"]`);
    if (existingNote) return;

    const newNoteElement = document.createElement('div');
    newNoteElement.classList.add('item');
    newNoteElement.innerHTML = `
        <i class="fa-solid fa-star active" data-index="${index}"></i>
        <span>${note.text}</span>
        <i class="fa-solid fa-trash" data-index="${index}"></i>
        <input type="date" value="${note.datum}" data-index="${index}" required>
    `;
    toDoListSectionWichtig.appendChild(newNoteElement); // Aufgabe in der "Wichtig"-Sektion hinzufügen

    // Zähler für "Wichtig" aktualisieren
    updateCounters();
}

// Aufgabe aus der "Wichtig"-Sektion entfernen
function removeNoteFromWichtigSection(index) {
    const noteElement = toDoListSectionWichtig.querySelector(`.fa-trash[data-index="${index}"]`);
    if (noteElement) {
        noteElement.parentElement.remove(); // Entfernt das Element
    }

    // Zähler für "Wichtig" aktualisieren
    updateCounters();
}


// Event-Delegation für Änderungen am Datumfeld
toDoListSectionAlle.addEventListener('change', handleDateChange);
toDoListSectionWichtig.addEventListener('change', handleDateChange);
toDoListSectionToday.addEventListener('change', handleDateChange);
toDoListSectionTomorrow.addEventListener('change', handleDateChange);
toDoListSectionWeek.addEventListener('change', handleDateChange);

function handleDateChange(e) {
    if (e.target.tagName === "INPUT" && e.target.type === "date") {
        const notes = loadNotesFromLocalStorage();
        const index = e.target.getAttribute('data-index');
        const note = notes[index];
        note.datum = e.target.value;
        saveNotesToLocalStorage(notes);
        renderNotes();
    }

    updateCounters();
}

// Funktion, um eine Notiz in der "Heute"-Sektion hinzuzufügen
function addNoteToTodaySection(note, index) {
    const newNoteElement = document.createElement('div');
    newNoteElement.classList.add('item');
    newNoteElement.innerHTML = `
        <i class="fa-solid fa-star ${note.wichtig ? 'active' : ''}" data-index="${index}"></i>
        <span>${note.text}</span>
        <i class="fa-solid fa-trash" data-index="${index}"></i>
        <input type="date" value="${note.datum}" data-index="${index}" required>
    `;
    toDoListSectionToday.appendChild(newNoteElement);
}

// Funktion, um eine Notiz in der "Morgen"-Sektion hinzuzufügen
function addNoteToTomorrowSection(note, index) {
    const newNoteElement = document.createElement('div');
    newNoteElement.classList.add('item');
    newNoteElement.innerHTML = `
        <i class="fa-solid fa-star ${note.wichtig ? 'active' : ''}" data-index="${index}"></i>
        <span>${note.text}</span>
        <i class="fa-solid fa-trash" data-index="${index}"></i>
        <input type="date" value="${note.datum}" data-index="${index}" required>
    `;
    toDoListSectionTomorrow.appendChild(newNoteElement);
}

// Funktion, um eine Notiz in der "Woche"-Sektion hinzuzufügen
function addNoteToWeekSection(note, index) {
    const newNoteElement = document.createElement('div');
    newNoteElement.classList.add('item');
    newNoteElement.innerHTML = `
        <i class="fa-solid fa-star ${note.wichtig ? 'active' : ''}" data-index="${index}"></i>
        <span>${note.text}</span>
        <i class="fa-solid fa-trash" data-index="${index}"></i>
        <input type="date" value="${note.datum}" data-index="${index}" required>
    `;
    toDoListSectionWeek.appendChild(newNoteElement);
}




// Funktion zur Synchronisierung des Stern-Icons in allen Sektionen
function updateStarIcon(index, status) {
    const allSectionStars = toDoListSectionAlle.querySelectorAll(`.fa-star[data-index="${index}"]`);
    const importantSectionStars = toDoListSectionWichtig.querySelectorAll(`.fa-star[data-index="${index}"]`);
    const todaySectionStars = toDoListSectionToday.querySelectorAll(`.fa-star[data-index="${index}"]`);
    const tomorrowSectionStars = toDoListSectionTomorrow.querySelectorAll(`.fa-star[data-index="${index}"]`);
    const weekSectionStars = toDoListSectionWeek.querySelectorAll(`.fa-star[data-index="${index}"]`);
    
    // Stern-Status in der "Alle"-Sektion aktualisieren
    allSectionStars.forEach(star => {
        if (status) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    // Stern-Status in der "Wichtig"-Sektion aktualisieren
    importantSectionStars.forEach(star => {
        if (status) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    // Stern-Status in der "Heute"-Sektion aktualisieren
    todaySectionStars.forEach(star => {
        if (status) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    // Stern-Status in der "Morgen"-Sektion aktualisieren
    tomorrowSectionStars.forEach(star => {
        if (status) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    // Stern-Status in der "Woche"-Sektion aktualisieren
    weekSectionStars.forEach(star => {
        if (status) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
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

// Notizen aus dem Local Storage laden und rendern
function renderNotes() {
    const notes = loadNotesFromLocalStorage();
    
    // Alle Sektionen leeren, um doppelte Einträge zu vermeiden
    toDoListSectionAlle.innerHTML = '';
    toDoListSectionWichtig.innerHTML = '';
    toDoListSectionToday.innerHTML = '';
    toDoListSectionTomorrow.innerHTML = '';
    toDoListSectionWeek.innerHTML = '';
    
    // Referenzdaten für Datumsspezifische Sektionen
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const weekLater = new Date();
    weekLater.setDate(today.getDate() + 7);
    
    notes.forEach((note, index) => {
        // Notiz in der "Alle"-Sektion hinzufügen
        const newNoteElement = document.createElement('div');
        newNoteElement.classList.add('item');
        newNoteElement.innerHTML = `
            <i class="fa-solid fa-star ${note.wichtig ? 'active' : ''}" data-index="${index}"></i>
            <span>${note.text}</span>
            <i class="fa-solid fa-trash" data-index="${index}"></i>
            <input type="date" value="${note.datum}" data-index="${index}" required>
        `;
        toDoListSectionAlle.appendChild(newNoteElement);

        // Falls die Notiz als wichtig markiert ist, auch in der "Wichtig"-Sektion hinzufügen
        if (note.wichtig) {
            addNoteToWichtigSection(note, index);
        }

        // Notiz anhand der Fälligkeit in die entsprechende Sektion hinzufügen
        const noteDate = new Date(note.datum);

        if (isSameDay(noteDate, today)) {
            addNoteToTodaySection(note, index);
        } else if (isSameDay(noteDate, tomorrow)) {
            addNoteToTomorrowSection(note, index);
        } else if (noteDate > today && noteDate <= weekLater) {
            addNoteToWeekSection(note, index);
        }
    });

    // Nach dem Rendern der Notizen die Zähler aktualisieren
    updateCounters();
}

// Hilfsfunktion zum Vergleich, ob zwei Daten am selben Tag liegen
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Funktion, um die Anzahl der Notizen in beiden Sektionen zu zählen
function updateCounters() {
    const allItemsCount = toDoListSectionAlle.querySelectorAll(".item").length;
    const importantItemsCount = toDoListSectionWichtig.querySelectorAll(".item").length;
    const todayItemsCount = toDoListSectionToday.querySelectorAll(".item").length;
    const tomorrowItemsCount = toDoListSectionTomorrow.querySelectorAll(".item").length;
    const weekItemsCount = toDoListSectionWeek.querySelectorAll(".item").length;

    allNotesCounter.innerText = allItemsCount;  // Zähler für "Alle" aktualisieren
    importantNotesCounter.innerText = importantItemsCount;  // Zähler für "Wichtig" aktualisieren
    todayNotesCounter.innerText = todayItemsCount;  // Zähler für "Heute" aktualisieren
    tomorrowNotesCounter.innerText = tomorrowItemsCount;  // Zähler für "Morgen" aktualisieren
    weekNotesCounter.innerText = weekItemsCount;  // Zähler für "Woche" aktualisieren
}

