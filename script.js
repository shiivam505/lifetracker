document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Date
    const currentDateElement = document.getElementById('current-date');
    const updateDate = () => {
        const now = new Date();
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            weekday: 'short'
        };
        const formattedDate = now.toLocaleDateString('en-GB', options).replace(/\//g, '/').toUpperCase();
        currentDateElement.textContent = formattedDate;
    };
    updateDate();

    // 2. Habit Buttons Functionality
    const habitButtons = document.querySelectorAll('.habit-button');
    habitButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const habitName = button.dataset.habit;
            if (button.classList.contains('active')) {
                console.log(`${habitName} marked as complete for today.`);
            } else {
                console.log(`${habitName} marked as incomplete for today.`);
            }
        });
    });

    // 3. Floating Action Button (FAB) and Toolkits
    const mainFab = document.getElementById('main-fab');
    const fabToolkits = document.querySelector('.fab-toolkits');

    mainFab.addEventListener('click', () => {
        fabToolkits.classList.toggle('hidden');
        const fabIcon = mainFab.querySelector('i');
        if (fabToolkits.classList.contains('hidden')) {
            fabIcon.classList.remove('fa-times');
            fabIcon.classList.add('fa-plus');
        } else {
            fabIcon.classList.remove('fa-plus');
            fabIcon.classList.add('fa-times');
        }
    });

    const toolkitItems = document.querySelectorAll('.toolkit-item');
    toolkitItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            console.log(`Toolkit action clicked: ${action}`);
            alert(`You clicked the ${action} toolkit item!`);
            fabToolkits.classList.add('hidden');
            mainFab.querySelector('i').classList.remove('fa-times');
            mainFab.querySelector('i').classList.add('fa-plus');
        });
    });

    document.addEventListener('click', (event) => {
        if (!mainFab.contains(event.target) && !fabToolkits.contains(event.target) && !fabToolkits.classList.contains('hidden')) {
            fabToolkits.classList.add('hidden');
            mainFab.querySelector('i').classList.remove('fa-times');
            mainFab.querySelector('i').classList.add('fa-plus');
        }
    });


    // --- Notes Functionality ---
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteList = document.getElementById('note-list');

    const createNoteElement = (text = '', isChecked = false) => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;

        const noteTextSpan = document.createElement('span');
        noteTextSpan.classList.add('note-text');
        noteTextSpan.contentEditable = 'true';
        noteTextSpan.textContent = text;

        if (text === '') {
            noteTextSpan.setAttribute('data-placeholder', 'Type your note here...');
            noteTextSpan.classList.add('placeholder');
            noteTextSpan.textContent = noteTextSpan.dataset.placeholder;
        }

        noteTextSpan.addEventListener('focus', () => {
            if (noteTextSpan.classList.contains('placeholder')) {
                noteTextSpan.textContent = '';
                noteTextSpan.classList.remove('placeholder');
            }
        });
        noteTextSpan.addEventListener('blur', () => {
            if (noteTextSpan.textContent.trim() === '') {
                noteTextSpan.textContent = noteTextSpan.dataset.placeholder;
                noteTextSpan.classList.add('placeholder');
            }
        });


        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note-btn');
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';

        deleteButton.addEventListener('click', () => {
            noteItem.remove();
        });

        noteItem.append(checkbox, noteTextSpan, deleteButton);
        return noteItem;
    };

    const initialNotesData = [
        { text: 'adsd,bcsjkdfvbasfv', checked: false },
        { text: 'adsd,bcsjkdfvbasfv', checked: false },
        { text: 'Learn new CSS tricks', checked: false }
    ];

    noteList.innerHTML = '';
    initialNotesData.forEach(note => {
        noteList.append(createNoteElement(note.text, note.checked));
    });

    addNoteBtn.addEventListener('click', () => {
        const newNote = createNoteElement('');
        noteList.append(newNote);
        newNote.querySelector('.note-text').focus();
    });

    // --- Events Functionality ---
    const addEventBtn = document.getElementById('add-event-btn');
    const eventList = document.getElementById('event-list');

    // Helper to get the current date/time
    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Helper to format a date/time string for display
    const formatDisplayDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'No Date/Time Set';
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Invalid Date';

        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    // Function to create a new event item HTML structure
    const createEventElement = (eventName = '', eventDateTime = '') => {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        if (!eventName) {
            eventName = 'New Event';
        }
        // This is where the current date/time is set as default
        if (!eventDateTime) {
            eventDateTime = getCurrentDateTime();
        }

        const mainContent = document.createElement('div');
        mainContent.classList.add('event-main-content');

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('event-name');
        nameSpan.contentEditable = 'true';
        nameSpan.textContent = eventName;
        nameSpan.setAttribute('data-placeholder', 'Click to edit event name...');

        if (eventName === 'New Event') {
            nameSpan.classList.add('placeholder');
        }

        nameSpan.addEventListener('focus', () => {
            if (nameSpan.classList.contains('placeholder')) {
                nameSpan.textContent = '';
                nameSpan.classList.remove('placeholder');
            }
        });
        nameSpan.addEventListener('blur', () => {
            if (nameSpan.textContent.trim() === '') {
                nameSpan.textContent = nameSpan.dataset.placeholder;
                nameSpan.classList.add('placeholder');
            }
        });


        const eventActions = document.createElement('div');
        eventActions.classList.add('event-actions');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-event-btn');
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';

        const expandToggleButton = document.createElement('button');
        expandToggleButton.classList.add('expand-toggle-btn');
        expandToggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>';

        eventActions.append(deleteButton, expandToggleButton);

        mainContent.append(nameSpan, eventActions);

        const displayDateTimeSpan = document.createElement('span');
        displayDateTimeSpan.classList.add('event-date-time');
        displayDateTimeSpan.textContent = formatDisplayDateTime(eventDateTime);


        const expandedDetails = document.createElement('div');
        expandedDetails.classList.add('event-expanded-details');

        const dateTimeInput = document.createElement('input');
        dateTimeInput.type = 'datetime-local';
        dateTimeInput.value = eventDateTime;

        dateTimeInput.addEventListener('change', () => {
            displayDateTimeSpan.textContent = formatDisplayDateTime(dateTimeInput.value);
        });

        expandedDetails.append(dateTimeInput);


        expandToggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            eventItem.classList.toggle('expanded');
        });

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this event?')) {
                eventItem.remove();
            }
        });

        eventItem.append(mainContent, displayDateTimeSpan, expandedDetails);
        return eventItem;
    };


    // Initial Event Data (now uses current date/time for defaults)
    const randomEventNames = [
        "Team Meeting", "Doctor's Appointment", "Grocery Shopping",
        "Call with John", "Project Deadline", "Gym Session",
        "Read Book Chapter", "Pay Bills", "Birthday Party"
    ];

    const initialEventsData = [];
    for (let i = 0; i < 3; i++) { // Generating 3 initial events
        const randomName = randomEventNames[Math.floor(Math.random() * randomEventNames.length)];
        initialEventsData.push({
            name: randomName,
            dateTime: getCurrentDateTime() // This ensures initial events use current date/time
        });
    }

    eventList.innerHTML = '';
    initialEventsData.forEach(event => {
        eventList.append(createEventElement(event.name, event.dateTime));
    });

    // Event listener for the "Add Event" button
    addEventBtn.addEventListener('click', () => {
        // createEventElement() will now use getCurrentDateTime() by default
        const newEvent = createEventElement('');
        eventList.prepend(newEvent);
        newEvent.querySelector('.event-name').focus();
        newEvent.classList.add('expanded');
    });
});