const sidebarElements = document.querySelectorAll('.sidebar .element');
const toDoListSections = document.querySelectorAll('.todo-list .section');
const newNoteButton = document.querySelector('#new-note-button');
const addNoteModal = document.querySelector('.add-note-modal');
const closeModalButton = document.querySelector('#close-modal-button');
const newNoteInput = document.querySelector('#new-note-input');
const addNoteButton = document.querySelector('#add-note-button');
const main = document.querySelector('main');
const header = document.querySelector('header');
const toDoListSectionAlle = document.querySelector('.todo-list .section.alle');
const toDoListSectionWichtig = document.querySelector('.todo-list .section.wichtig');
const darkmodeToggleButton = document.querySelector('.darkmode-toggle');
const body = document.querySelector('body');
const darkmodeToggleButtonCircle = document.querySelector('.darkmode-toggle .slide .circle');
let PageModeState = "lightmode";
const AllNotesCounter = document.querySelector('.sidebar .element.alle .counter');
const ImportantNotesCounter = document.querySelector('.sidebar .element.wichtig .counter');
const MobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
const Sidebar = document.querySelector('.sidebar');
const SidebarToggleIcon = document.querySelector('.mobile-sidebar-toggle i');
let SidebarState = "closed";
const blurrer = document.querySelector('.blurrer');


// Mobile Sidebar Toggle
MobileSidebarToggle.addEventListener('click', () => {
    if (SidebarState === "closed") {
        Sidebar.classList.add('open');
        SidebarToggleIcon.style.transform = 'rotate(-180deg)';
        SidebarState = "open";
        if (window.innerWidth < 500) {
            MobileSidebarToggle.classList.add("shift");
        }
    } else {
        Sidebar.classList.remove('open');
        SidebarToggleIcon.style.transform = 'rotate(0deg)';
        SidebarState = "closed";
        if (window.innerWidth < 500) {
            MobileSidebarToggle.classList.remove("shift");
        }
    }
});

// Page preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    // wait min x seconds before hiding the preloader
    setTimeout(function() {
        preloader.classList.add('hidden');
    }, 2000);
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



// ToDo Liste filtern bei Klick auf Sidebar-Element
sidebarElements.forEach((element, index) => {
    element.addEventListener('click', () => {
        Sidebar.classList.remove('open');
        SidebarToggleIcon.style.transform = 'rotate(0deg)';
        SidebarState = "closed";
        if (window.innerWidth < 500) {
            MobileSidebarToggle.classList.remove("shift");
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
    console.log(element, index);
    element.addEventListener('click', () => {
        sidebarElements.forEach((el, elIndex) => {
            console.log(el, elIndex);
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
    newNoteInput.focus(); // Automatisch das Eingabefeld fokussieren
});

// Modal schließen und Blur-Effekt entfernen
closeModalButton.addEventListener('click', () => {
    addNoteModal.classList.remove('show');
    newNoteInput.value = ''; // Eingabefeld zurücksetzen
    blurrer.classList.remove("active");
});

// Neue Notiz hinzufügen
addNoteButton.addEventListener('click', () => {
    const newNoteText = newNoteInput.value.trim(); // Leerzeichen am Anfang und Ende entfernen
    if (!newNoteText) {
        newNoteInput.style.border = '2px solid red'; // Zeigt dem Benutzer das Problem
        setTimeout(() => newNoteInput.style.border = '', 2000); // Setzt den Zustand nach 2 Sekunden zurück
        return;
    }

    // Neue Notiz erstellen
    const notes = loadNotesFromLocalStorage();
    notes.push({ text: newNoteText, wichtig: false });
    saveNotesToLocalStorage(notes);

    // Notiz hinzufügen und neu rendern
    renderNotes();
    newNoteInput.value = ''; // Eingabefeld zurücksetzen
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

        // Stern-Status in beiden Sektionen aktualisieren
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
    if (existingNote) return; // Falls sie schon existiert, abbrechen

    const newNoteElement = document.createElement('div');
    newNoteElement.classList.add('item');
    newNoteElement.innerHTML = `
        <i class="fa-solid fa-star active" data-index="${index}"></i>
        <span>${note.text}</span>
        <i class="fa-solid fa-trash" data-index="${index}"></i>
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

// Funktion zur Synchronisierung des Stern-Icons in beiden Sektionen
function updateStarIcon(index, status) {
    const allSectionStars = toDoListSectionAlle.querySelectorAll(`.fa-star[data-index="${index}"]`);
    const importantSectionStars = toDoListSectionWichtig.querySelectorAll(`.fa-star[data-index="${index}"]`);
    
    // Stern-Status in der "Alle"-Sektion aktualisieren
    allSectionStars.forEach(star => {
        if (status) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    // Stern-Status in der "Wichtig"-Sektion aktualisieren (falls erforderlich)
    importantSectionStars.forEach(star => {
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
    toDoListSectionAlle.innerHTML = ''; // Lösche den alten Inhalt der "Alle"-Sektion
    toDoListSectionWichtig.innerHTML = ''; // Lösche den alten Inhalt der "Wichtig"-Sektion

    notes.forEach((note, index) => {
        // Notiz in der "Alle"-Sektion hinzufügen
        const newNoteElement = document.createElement('div');
        newNoteElement.classList.add('item');
        newNoteElement.innerHTML = `
            <i class="fa-solid fa-star ${note.wichtig ? 'active' : ''}" data-index="${index}"></i>
            <span>${note.text}</span>
            <i class="fa-solid fa-trash" data-index="${index}"></i>
        `;
        toDoListSectionAlle.appendChild(newNoteElement); // Notiz hinzufügen

        // Falls die Notiz als wichtig markiert ist, auch in der "Wichtig"-Sektion hinzufügen
        if (note.wichtig) {
            addNoteToWichtigSection(note, index);
        }
    });

    // Nach dem Rendern der Notizen die Zähler aktualisieren
    updateCounters();
}

// Funktion, um die Anzahl der Notizen in beiden Sektionen zu zählen
function updateCounters() {
    const allItemsCount = toDoListSectionAlle.querySelectorAll(".item").length;
    const importantItemsCount = toDoListSectionWichtig.querySelectorAll(".item").length;

    AllNotesCounter.innerText = allItemsCount;  // Zähler für "Alle" aktualisieren
    ImportantNotesCounter.innerText = importantItemsCount;  // Zähler für "Wichtig" aktualisieren
}

// Beim Laden der Seite die Notizen rendern
window.onload = renderNotes;