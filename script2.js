document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Date (Existing)
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

    // 2. Habit Buttons Functionality (Existing)
    const habitButtonsContainer = document.getElementById('habit-buttons-container'); // Changed to container
    const habitRecordsDisplay = document.getElementById('habit-records');
    const showHabitGraphBtn = document.getElementById('show-habit-graph-btn');
    const habitAnalysisGraphContainer = document.getElementById('habit-analysis-graph-container');
    const habitAnalysisGraphSvg = document.getElementById('habit-analysis-graph-svg');
    const SVG_NS = 'http://www.w3.org/2000/svg'; // SVG Namespace

    // New Habit Management Elements
    const addMoreHabitsBtn = document.getElementById('add-more-habits-btn');
    const addHabitModal = document.getElementById('add-habit-modal');
    const newHabitNameInput = document.getElementById('new-habit-name');
    const newHabitIconInput = document.getElementById('new-habit-icon');
    const confirmNewHabitBtn = document.getElementById('confirm-new-habit-btn');
    const cancelNewHabitBtn = document.getElementById('cancel-new-habit-btn');
    const showAllHabitsBtn = document.getElementById('show-all-habits-btn');
    const allHabitsModal = document.getElementById('all-habits-modal');
    const allHabitsList = document.getElementById('all-habits-list');
    const closeAllHabitsModalBtn = document.getElementById('close-all-habits-modal-btn');

    // Load habit data from localStorage
    let habitData = JSON.parse(localStorage.getItem('habitData')) || {};
    // { "YYYY-MM": { "habitName": count, ... }, ... }

    // Load custom habits from localStorage
    let customHabits = JSON.parse(localStorage.getItem('customHabits')) || [];
    // [{ name: "Read", icon: "fas fa-book" }, ...]

    // Load disabled default habits from localStorage
    let disabledDefaultHabits = JSON.parse(localStorage.getItem('disabledDefaultHabits')) || [];

    // Default habits (hardcoded)
    const defaultHabits = [
        { name: "workout", icon: "fas fa-dumbbell" },
        { name: "study", icon: "fas fa-book" },
        { name: "drinking", icon: "fas fa-tint" },
        { name: "code", icon: "fas fa-code" },
        { name: "sleep", icon: "fas fa-moon" },
        { name: "phone", icon: "fas fa-mobile-alt" }
    ];

    /**
     * Gets the current date in Букмекерлар-MM-DD format.
     * @returns {string} The current date string.
     */
    const getTodayDateString = () => {
        const now = new Date();
        return now.toISOString().split('T')[0]; // Букмекерлар-MM-DD
    };

    /**
     * Gets the current month in Букмекерлар-MM format.
     * @returns {string} The current month string.
     */
    const getCurrentMonthString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    /**
     * Saves the current habit data to localStorage.
     */
    const saveHabitData = () => {
        localStorage.setItem('habitData', JSON.stringify(habitData));
    };

    /**
     * Saves custom habits to localStorage.
     */
    const saveCustomHabits = () => {
        localStorage.setItem('customHabits', JSON.stringify(customHabits));
    };

    /**
     * Saves disabled default habits to localStorage.
     */
    const saveDisabledDefaultHabits = () => {
        localStorage.setItem('disabledDefaultHabits', JSON.stringify(disabledDefaultHabits));
    };

    /**
     * Renders all habit buttons (default and custom) in the UI.
     */
    const renderHabitButtons = () => {
        habitButtonsContainer.innerHTML = ''; // Clear existing buttons

        // Add default habits, filtering out disabled ones
        defaultHabits.forEach(habit => {
            if (!disabledDefaultHabits.includes(habit.name)) {
                createHabitButton(habit.name, habit.icon, false); // false indicates not a custom habit
            }
        });

        // Add custom habits
        customHabits.forEach(habit => {
            createHabitButton(habit.name, habit.icon, true); // true indicates a custom habit
        });

        // Re-attach event listeners after re-rendering
        attachHabitButtonListeners();
    };

    /**
     * Creates and appends a single habit button to the container.
     * @param {string} habitName - The name of the habit.
     * @param {string} iconClass - The Font Awesome icon class.
     * @param {boolean} isCustom - True if it's a custom habit, false for default.
     */
    const createHabitButton = (habitName, iconClass, isCustom) => {
        const button = document.createElement('div');
        button.classList.add('habit-button');
        button.dataset.habit = habitName;
        button.dataset.icon = iconClass; // Store icon class for re-rendering
        if (isCustom) {
            button.dataset.custom = 'true'; // Mark as custom
        }

        const icon = document.createElement('i');
        icon.classList.add(...iconClass.split(' ')); // Add all classes from the string

        const span = document.createElement('span');
        span.textContent = habitName;

        button.appendChild(icon);
        button.appendChild(span);
        habitButtonsContainer.appendChild(button);

        // Set initial state based on habitData
        const today = getTodayDateString();
        if (habitData[today] && habitData[today][habitName]) {
            button.classList.add('completed-today');
        }
    };

    /**
     * Attaches click listeners to all habit buttons.
     */
    const attachHabitButtonListeners = () => {
        document.querySelectorAll('.habit-button').forEach(button => {
            // Remove existing listener to prevent duplicates
            button.removeEventListener('click', handleHabitButtonClick);
            // Add new listener
            button.addEventListener('click', handleHabitButtonClick);
        });
    };

    /**
     * Handles the click event for habit buttons.
     * @param {Event} event - The click event.
     */
    const handleHabitButtonClick = (event) => {
        const button = event.currentTarget;
        const habitName = button.dataset.habit;
        const today = getTodayDateString();
        const currentMonth = getCurrentMonthString();

        // Update habit data
        if (!habitData[today]) {
            habitData[today] = {};
        }
        if (!habitData[currentMonth]) {
            habitData[currentMonth] = {};
        }

        if (button.classList.contains('completed-today')) {
            button.classList.remove('completed-today');
            delete habitData[today][habitName];
            if (habitData[currentMonth][habitName] > 0) {
                habitData[currentMonth][habitName]--;
            }
            console.log(`${habitName} marked as incomplete for today and removed from monthly count.`);
        } else {
            button.classList.add('completed-today');
            habitData[today][habitName] = true;
            habitData[currentMonth][habitName] = (habitData[currentMonth][habitName] || 0) + 1;
            console.log(`${habitName} marked as complete for today and added to monthly count.`);
        }

        saveHabitData();
        renderMonthlyHabitRecords();
        drawHabitGraph();
    };

    /**
     * Renders the monthly habit records in the display area.
     */
    const renderMonthlyHabitRecords = () => {
        habitRecordsDisplay.innerHTML = '';
        const currentMonth = getCurrentMonthString();

        if (habitData[currentMonth]) {
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('month-record');
            monthDiv.innerHTML = `<h3>${new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>`;

            const ul = document.createElement('ul');
            // Combine default and custom habits for display, filtering out disabled defaults
            const allActiveHabitNames = [
                ...defaultHabits.filter(h => !disabledDefaultHabits.includes(h.name)).map(h => h.name),
                ...customHabits.map(h => h.name)
            ];

            allActiveHabitNames.forEach(habit => {
                const count = habitData[currentMonth][habit] || 0;
                const li = document.createElement('li');
                li.textContent = `${habit}: ${count} days`;
                ul.appendChild(li);
            });
            monthDiv.appendChild(ul);
            habitRecordsDisplay.appendChild(monthDiv);
        } else {
            habitRecordsDisplay.textContent = 'No habit records for this month yet.';
        }
    };

    /**
     * Draws a bar graph for habit completion over the month.
     */
    const drawHabitGraph = () => {
        habitAnalysisGraphSvg.innerHTML = ''; // Clear previous graph
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); // Get total days in current month
        const currentMonth = getCurrentMonthString();
        const monthData = habitData[currentMonth] || {};

        const svgWidth = 300;
        const svgHeight = 200;
        const padding = 30;

        // Get all unique habit names (default + custom), filtering out disabled defaults
        const allActiveHabitNames = [
            ...defaultHabits.filter(h => !disabledDefaultHabits.includes(h.name)).map(h => h.name),
            ...customHabits.map(h => h.name)
        ];

        if (allActiveHabitNames.length === 0) {
            const noDataText = document.createElementNS(SVG_NS, 'text');
            noDataText.setAttribute('x', svgWidth / 2);
            noDataText.setAttribute('y', svgHeight / 2);
            noDataText.setAttribute('text-anchor', 'middle');
            noDataText.setAttribute('fill', '#555');
            noDataText.textContent = 'No habit data for this month.';
            habitAnalysisGraphSvg.appendChild(noDataText);
            return;
        }

        // Max count for Y-axis is now total days in month
        const maxCount = daysInMonth;
        const barWidth = (svgWidth - 2 * padding) / (allActiveHabitNames.length * 1.5); // Adjusted for spacing
        const gap = barWidth / 2;

        // Draw Axes
        const xAxis = document.createElementNS(SVG_NS, 'line');
        xAxis.setAttribute('x1', padding);
        xAxis.setAttribute('y1', svgHeight - padding);
        xAxis.setAttribute('x2', svgWidth - padding);
        xAxis.setAttribute('y2', svgHeight - padding);
        xAxis.classList.add('axis');
        habitAnalysisGraphSvg.appendChild(xAxis);

        const yAxis = document.createElementNS(SVG_NS, 'line');
        yAxis.setAttribute('x1', padding);
        yAxis.setAttribute('y1', padding);
        yAxis.setAttribute('x2', padding);
        yAxis.setAttribute('y2', svgHeight - padding);
        yAxis.classList.add('axis');
        habitAnalysisGraphSvg.appendChild(yAxis);

        // Draw Bars and X-axis labels
        allActiveHabitNames.forEach((habit, i) => {
            const count = monthData[habit] || 0; // Get count for this habit, default to 0
            const x = padding + i * (barWidth + gap);
            const barHeight = (count / maxCount) * (svgHeight - 2 * padding);
            const y = svgHeight - padding - barHeight;

            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.classList.add('bar');
            habitAnalysisGraphSvg.appendChild(rect);

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', svgHeight - padding + 15);
            text.setAttribute('text-anchor', 'middle');
            text.textContent = habit;
            habitAnalysisGraphSvg.appendChild(text);

            // Value label on top of the bar
            const valueText = document.createElementNS(SVG_NS, 'text');
            valueText.setAttribute('x', x + barWidth / 2);
            valueText.setAttribute('y', y - 5); // 5px above the bar
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('fill', '#333');
            valueText.textContent = count;
            habitAnalysisGraphSvg.appendChild(valueText);
        });

        // Draw Y-axis labels and grid lines
        const yTicks = 4;
        for (let i = 0; i <= yTicks; i++) {
            const value = Math.round((i / yTicks) * maxCount);
            const y = svgHeight - padding - (value / maxCount) * (svgHeight - 2 * padding);

            const amountLabel = document.createElementNS(SVG_NS, 'text');
            amountLabel.setAttribute('x', padding - 5);
            amountLabel.setAttribute('y', y + 3);
            amountLabel.setAttribute('text-anchor', 'end');
            amountLabel.textContent = value;
            habitAnalysisGraphSvg.appendChild(amountLabel);

            if (i > 0) {
                const gridLine = document.createElementNS(SVG_NS, 'line');
                gridLine.setAttribute('x1', padding);
                gridLine.setAttribute('y1', y);
                gridLine.setAttribute('x2', svgWidth - padding);
                gridLine.setAttribute('y2', y);
                gridLine.classList.add('grid-line');
                habitAnalysisGraphSvg.appendChild(gridLine);
            }
        }
    };

    // Event listener for "Show Habit Graph" button
    showHabitGraphBtn.addEventListener('click', () => {
        habitAnalysisGraphContainer.classList.toggle('hidden');
        if (!habitAnalysisGraphContainer.classList.contains('hidden')) {
            drawHabitGraph(); // Draw graph only when visible
        }
    });

    // --- New Habit Management Functions ---

    addMoreHabitsBtn.addEventListener('click', () => {
        addHabitModal.classList.remove('hidden');
        newHabitNameInput.value = '';
        newHabitIconInput.value = '';
        newHabitNameInput.focus();
    });

    cancelNewHabitBtn.addEventListener('click', () => {
        addHabitModal.classList.add('hidden');
    });

    confirmNewHabitBtn.addEventListener('click', () => {
        const name = newHabitNameInput.value.trim();
        const icon = newHabitIconInput.value.trim();

        if (name && icon) {
            // Check if habit already exists (case-insensitive)
            const exists = customHabits.some(h => h.name.toLowerCase() === name.toLowerCase()) ||
                           defaultHabits.some(h => h.name.toLowerCase() === name.toLowerCase());

            if (!exists) {
                customHabits.push({ name, icon });
                saveCustomHabits();
                renderHabitButtons(); // Re-render all buttons to include the new one
                addHabitModal.classList.add('hidden');
                drawHabitGraph(); // Update graph with new habit
            } else {
                console.log('Habit with this name already exists!'); // Replace with a user-friendly message
            }
        } else {
            console.log('Please enter both habit name and icon class.'); // Replace with a user-friendly message
        }
    });

    showAllHabitsBtn.addEventListener('click', () => {
        addHabitModal.classList.add('hidden'); // Hide add habit modal
        renderAllHabitsList();
        allHabitsModal.classList.remove('hidden');
    });

    closeAllHabitsModalBtn.addEventListener('click', () => {
        allHabitsModal.classList.add('hidden');
    });

    const renderAllHabitsList = () => {
        allHabitsList.innerHTML = '';

        // Combine default and custom habits for display in the list
        const allHabitsCombined = [
            ...defaultHabits.map(h => ({ ...h, isCustom: false, isDisabled: disabledDefaultHabits.includes(h.name) })),
            ...customHabits.map(h => ({ ...h, isCustom: true, isDisabled: false }))
        ];

        allHabitsCombined.forEach((habit) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <i class="${habit.icon}"></i>
                <span class="habit-name-display">${habit.name}</span>
                ${habit.isCustom ? // If it's a custom habit, always show delete
                    `<button class="delete-habit-item-btn" data-habit-name="${habit.name}" data-is-custom="true"><i class="fas fa-trash-alt"></i></button>`
                    : // If it's a default habit
                    (habit.isDisabled ? // If default and disabled, show add button
                        `<button class="add-habit-item-btn" data-habit-name="${habit.name}"><i class="fas fa-plus"></i> Add</button>`
                        : // If default and not disabled, show delete button (to disable it)
                        `<button class="delete-habit-item-btn" data-habit-name="${habit.name}" data-is-custom="false"><i class="fas fa-trash-alt"></i></button>`
                    )
                }
            `;
            allHabitsList.appendChild(li);
        });

        // Add event listeners for delete buttons (both custom and default-disable)
        allHabitsList.querySelectorAll('.delete-habit-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const habitNameToModify = event.currentTarget.dataset.habitName;
                const isCustom = event.currentTarget.dataset.isCustom === 'true';

                if (isCustom) {
                    // Delete custom habit
                    customHabits = customHabits.filter(h => h.name !== habitNameToModify);
                    saveCustomHabits();
                } else {
                    // "Delete" default habit by adding it to disabled list
                    if (!disabledDefaultHabits.includes(habitNameToModify)) {
                        disabledDefaultHabits.push(habitNameToModify);
                        saveDisabledDefaultHabits();
                    }
                }
                renderAllHabitsList(); // Re-render the list
                renderHabitButtons(); // Re-render main habit buttons
                renderMonthlyHabitRecords(); // Update records display
                drawHabitGraph(); // Update graph
            });
        });

        // Add event listeners for new add buttons
        allHabitsList.querySelectorAll('.add-habit-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const habitNameToAdd = event.currentTarget.dataset.habitName;
                disabledDefaultHabits = disabledDefaultHabits.filter(name => name !== habitNameToAdd);
                saveDisabledDefaultHabits();
                renderAllHabitsList(); // Re-render the list
                renderHabitButtons(); // Re-render main habit buttons
                renderMonthlyHabitRecords(); // Update records display
                drawHabitGraph(); // Update graph
            });
        });
    };


    // Initial render of habit buttons and records
    renderHabitButtons();
    renderMonthlyHabitRecords();


    // 3. Floating Action Button (FAB) and Toolkits (Existing)
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
            console.log(`You clicked the ${action} toolkit item!`); // Log instead of alert
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


    // --- Notes Functionality (Existing) ---
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
            saveNotes();
        });


        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note-btn');
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';

        deleteButton.addEventListener('click', () => {
            noteItem.remove();
            saveNotes(); // Save notes after deletion
        });

        noteItem.append(checkbox, noteTextSpan, deleteButton);
        return noteItem;
    };


    addNoteBtn.addEventListener('click', () => {
        const newNote = createNoteElement('');
        noteList.append(newNote);
        newNote.querySelector('.note-text').focus();
        saveNotes(); // Save new note
    });

function saveNotes() {
    const notes = [];
    noteList.querySelectorAll('.note-item').forEach(item => { // Iterate over note-item divs
        const textSpan = item.querySelector('.note-text');
        let text = textSpan.innerText;
        // Handle placeholder text when saving
        if (textSpan.classList.contains('placeholder') && text === textSpan.dataset.placeholder) {
            text = '';
        }

        notes.push({
            text: text,
            checked: item.querySelector('input[type="checkbox"]')?.checked || false
        });
    });
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const saved = JSON.parse(localStorage.getItem('notes') || '[]');
    noteList.innerHTML = ''; // Clear existing notes before loading
    saved.forEach(({ text, checked }) => {
        const noteEl = createNoteElement(text, checked);
        noteList.appendChild(noteEl);
    });
    // Add events after all notes are loaded
    noteList.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', saveNotes);
    });
}

loadNotes();

    // --- Events Functionality (Existing) ---
   // Get references to the HTML elements
const addEventBtn = document.getElementById('add-event-btn');
const eventList = document.getElementById('event-list');

/**
 * Generates the current date and time in a format suitable for datetime-local input.
 * @returns {string} Current date and time string (e.g., "YYYY-MM-DDTHH:MM").
 */
const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats a datetime string for display in a user-friendly way.
 * @param {string} dateTimeString - The datetime string (e.g., from datetime-local input).
 * @returns {string} Formatted date and time string (e.g., "Fri, May 24, 7:49 AM").
 */
const formatDisplayDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'No Date/Time Set'; // Fallback if no string is provided
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date strings
    return date.toLocaleString('en-US', {
        weekday: 'short', // e.g., "Fri"
        month: 'short',   // e.g., "May"
        day: 'numeric',   // e.g., "24"
        hour: '2-digit',  // e.g., "07"
        minute: '2-digit',// e.g., "49"
        hour12: true      // e.g., "AM/PM"
    });
};

/**
 * Manages the placeholder behavior for contentEditable elements.
 * Adds/removes a 'is-placeholder' class and sets/clears text based on content.
 * @param {HTMLElement} element - The contentEditable element.
 */
function updatePlaceholderState(element) {
    const placeholderText = element.getAttribute('data-placeholder');
    if (element.textContent.trim() === '') {
        element.classList.add('is-placeholder');
        element.textContent = placeholderText;
    } else {
        element.classList.remove('is-placeholder');
    }
}

/**
 * Saves all events currently displayed in the list to localStorage.
 */
function saveEvents() {
    const events = [];
    eventList.querySelectorAll('.event-item').forEach(item => {
        // Get event name from the span, handling placeholder text
        const nameSpan = item.querySelector('.event-name');
        let name = nameSpan?.textContent.trim() || '';
        if (nameSpan.classList.contains('is-placeholder') && name === nameSpan.getAttribute('data-placeholder')) {
            name = ''; // Don't save placeholder text as actual event name
        }

        // Get event date from the hidden input
        const date = item.querySelector('input[type="datetime-local"]')?.value || '';

        // Only save events that have a non-empty name (after placeholder removal)
        if (name !== '') {
            events.push({ name, date });
        }
    });
    localStorage.setItem('events', JSON.stringify(events));
}

/**
 * Loads saved events from localStorage and adds them to the event list.
 */
function loadEvents() {
    const saved = JSON.parse(localStorage.getItem('events') || '[]');
    eventList.innerHTML = ''; // Clear existing events before loading
    saved.forEach(({ name, date }) => {
        const eventEl = createEventElement(name, date);
        eventList.appendChild(eventEl);
    });
}

/**
 * Creates a new event item HTML element.
 * @param {string} [eventName=''] - The initial name for the event.
 * @param {string} [eventDateTime=''] - The initial datetime for the event.
 * @returns {HTMLElement} The created event item element.
 */
function createEventElement(eventName = '', eventDateTime = '') {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');

    const mainContent = document.createElement('div');
    mainContent.classList.add('event-main-content');

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('event-name');
    nameSpan.contentEditable = 'true';
    nameSpan.setAttribute('data-placeholder', 'Enter event name'); // Set placeholder text

    // Initialize placeholder state for new events or load existing name
    if (eventName) {
        nameSpan.textContent = eventName;
        nameSpan.classList.remove('is-placeholder'); // Ensure class is not present if name exists
    } else {
        updatePlaceholderState(nameSpan); // Apply placeholder if no name provided
    }

    // Event listeners for placeholder behavior
    nameSpan.addEventListener('focus', () => {
        if (nameSpan.classList.contains('is-placeholder')) {
            nameSpan.textContent = ''; // Clear placeholder text on focus
            nameSpan.classList.remove('is-placeholder');
        }
    });

    nameSpan.addEventListener('blur', () => {
        updatePlaceholderState(nameSpan); // Re-apply placeholder if empty on blur
        saveEvents(); // Save changes when focus leaves
    });

    nameSpan.addEventListener('input', () => {
        // This handles cases where user types, deletes, then types again
        if (nameSpan.textContent.trim() !== '') {
            nameSpan.classList.remove('is-placeholder');
        }
        saveEvents(); // Save on input to capture changes
    });

    const eventActions = document.createElement('div');
    eventActions.classList.add('event-actions');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-event-btn');
    deleteButton.innerHTML = '<i class="fas fa-times"></i>'; // Font Awesome icon

    const expandToggleButton = document.createElement('button');
    expandToggleButton.classList.add('expand-toggle-btn');
    expandToggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>'; // Font Awesome icon

    eventActions.append(deleteButton, expandToggleButton);
    mainContent.append(nameSpan, eventActions);

    const displayDateTimeSpan = document.createElement('span');
    displayDateTimeSpan.classList.add('event-date-time');
    // Set default display date/time to current if not provided
    displayDateTimeSpan.textContent = formatDisplayDateTime(eventDateTime || getCurrentDateTime());

    const expandedDetails = document.createElement('div');
    expandedDetails.classList.add('event-expanded-details');

    const dateTimeInput = document.createElement('input');
    dateTimeInput.type = 'datetime-local';
    // Initialize datetime input with provided value or current date/time
    dateTimeInput.value = eventDateTime || getCurrentDateTime();
    dateTimeInput.addEventListener('change', () => {
        displayDateTimeSpan.textContent = formatDisplayDateTime(dateTimeInput.value);
        saveEvents();
    });

    expandedDetails.append(dateTimeInput);

    // Toggle expanded state on button click
    expandToggleButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        eventItem.classList.toggle('expanded');
        // Change icon based on expanded state
        if (eventItem.classList.contains('expanded')) {
            expandToggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            expandToggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
    });

    // Delete event on button click
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        console.log('Delete confirmation needed for:', nameSpan.textContent); // Log instead of alert
        eventItem.remove();
        saveEvents();
    });

    eventItem.append(mainContent, displayDateTimeSpan, expandedDetails);
    return eventItem;
}

// Add new event on button click
addEventBtn.addEventListener('click', () => {
    const newEvent = createEventElement(); // Create with default current date/time
    eventList.prepend(newEvent); // Add to the top of the list
    newEvent.classList.add('expanded'); // Automatically expand new event
    newEvent.querySelector('.event-name').focus(); // Focus on the name input for immediate editing
    saveEvents(); // Save the new (empty) event to localStorage
});

// Load events when the page loads
loadEvents();

    // --- FINANCE FUNCTIONALITY ---

    // DOM Elements for Finance
    const currentBalanceSpan = document.getElementById('current-balance');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const spentTransactionBtn = document.getElementById('spent-transaction-btn');
    const transactionInputArea = document.getElementById('transaction-input-area');
    const transactionTitleInput = document.getElementById('transaction-title');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionDateInput = document.getElementById('transaction-date'); // New: Date input
    const confirmTransactionBtn = document.getElementById('confirm-transaction-btn');
    const cancelTransactionBtn = document.getElementById('cancel-transaction-btn');
    const historyList = document.getElementById('history-list');
    const accountSelectBtn = document.getElementById('account-select-btn');
    const showFinanceGraphBtn = document.getElementById('show-finance-graph-btn'); // New: Show/Hide Graph Button
    const expenditureGraphSection = document.getElementById('expenditure-graph-section'); // Reference to the graph section

    // Modals
    const accountSelectionModal = document.getElementById('account-selection-modal');
    const accountListModal = document.getElementById('account-list-modal');
    const closeAccountModalBtn = document.getElementById('close-account-modal-btn');
    const addNewAccountModalBtn = document.getElementById('add-new-account-modal-btn');

    const addAccountModal = document.getElementById('add-account-modal');
    const newAccountNameInput = document.getElementById('new-account-name');
    const newAccountBalanceInput = document.getElementById('new-account-balance');
    const confirmNewAccountBtn = document.getElementById('confirm-new-account-btn');
    const cancelNewAccountBtn = document.getElementById('cancel-new-account-btn');


    // Data Storage (using localStorage for persistence)
    let accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [{ id: 'default', name: 'Cash', balance: 0 }];
    let transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    let currentAccount = accounts[0]; // Default to the first account

    // Ensure default account has an ID if it's new
    if (!currentAccount.id) {
        currentAccount.id = 'default';
        accounts[0] = currentAccount;
        saveFinanceData(); // Save the new ID
    }


    let transactionType = ''; // 'add' or 'spent'

    // Save data to localStorage
    const saveFinanceData = () => {
        localStorage.setItem('financeAccounts', JSON.stringify(accounts));
        localStorage.setItem('financeTransactions', JSON.stringify(transactions));
    };

    // Update UI elements
    const updateBalanceDisplay = () => {
        currentBalanceSpan.textContent = currentAccount.balance.toLocaleString('en-IN'); // Indian Rupee format
    };

    const renderTransactionHistory = () => {
        historyList.innerHTML = '';
        // Sort transactions by date, most recent first
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedTransactions.forEach(trans => {
            if (trans.accountId === currentAccount.id) { // Only show transactions for current account
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item', trans.type);

                const titleSpan = document.createElement('span');
                titleSpan.classList.add('title');
                titleSpan.textContent = trans.title;

                const amountSpan = document.createElement('span');
                amountSpan.classList.add('amount');
                amountSpan.textContent = `₹${trans.amount.toLocaleString('en-IN')}`;

                const dateSpan = document.createElement('span');
                dateSpan.classList.add('date');
                // Format date for history: DD MMM, HH:MM (if time is available) or DD MMM Букмекерлар (if only date)
                const transDate = new Date(trans.date);
                // Check if the stored date includes time information
                const options = { day: '2-digit', month: 'short' };
                if (trans.date.includes('T')) { // Assuming ISO string with time
                     options.hour = '2-digit';
                     options.minute = '2-digit';
                     options.hour12 = true;
                } else { // Assuming Букмекерлар-MM-DD
                    options.year = 'numeric';
                }
                dateSpan.textContent = transDate.toLocaleString('en-US', options);

                historyItem.append(titleSpan, amountSpan, dateSpan);
                historyList.append(historyItem);
            }
        });
    };

    const showTransactionInput = (type) => {
        transactionType = type;
        transactionInputArea.classList.remove('hidden');
        transactionTitleInput.value = '';
        transactionAmountInput.value = '';
        transactionDateInput.value = getTodayDateString(); // Set default date to today
        transactionTitleInput.focus();
    };

    const hideTransactionInput = () => {
        transactionInputArea.classList.add('hidden');
        transactionTitleInput.value = '';
        transactionAmountInput.value = '';
        transactionDateInput.value = ''; // Clear date input
    };

    const recordTransaction = () => {
        const title = transactionTitleInput.value.trim();
        const amount = parseFloat(transactionAmountInput.value);
        const date = transactionDateInput.value; // Get selected date

        if (!title || isNaN(amount) || amount <= 0 || !date) {
            console.log('Please enter a valid title, a positive amount, and select a date.'); // Log instead of alert
            return;
        }

        const transaction = {
            id: Date.now(), // Simple unique ID
            accountId: currentAccount.id, // Associate with current account
            title: title,
            amount: amount,
            type: transactionType, // 'add' or 'spent'
            date: date // Store the selected date (YYYY-MM-DD)
        };

        if (transactionType === 'add') {
            currentAccount.balance += amount;
        } else { // 'spent'
            currentAccount.balance -= amount;
        }

        transactions.push(transaction);
        saveFinanceData();
        updateBalanceDisplay();
        renderTransactionHistory();
        hideTransactionInput();
        // Only draw graph if it's currently visible
        if (!expenditureGraphSection.classList.contains('hidden')) {
            drawExpenditureGraph();
        }
    };

    // Account Selection Modal Functions
    const openAccountSelectionModal = () => {
        renderAccountListModal();
        accountSelectionModal.classList.remove('hidden');
    };

    const closeAccountSelectionModal = () => {
        accountSelectionModal.classList.add('hidden');
    };

    const renderAccountListModal = () => {
        accountListModal.innerHTML = '';
        accounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.classList.add('account-item-modal');
            accountItem.dataset.accountId = account.id;

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('account-name');
            nameSpan.textContent = account.name;

            const balanceSpan = document.createElement('span');
            balanceSpan.classList.add('account-balance');
            balanceSpan.textContent = `₹${account.balance.toLocaleString('en-IN')}`;

            if (account.id === currentAccount.id) {
                accountItem.classList.add('selected');
            }

            accountItem.append(nameSpan, balanceSpan);
            accountListModal.append(accountItem);

            accountItem.addEventListener('click', () => {
                currentAccount = accounts.find(acc => acc.id === account.id);
                updateBalanceDisplay();
                renderTransactionHistory();
                closeAccountSelectionModal();
                // Only draw graph if it's currently visible
                if (!expenditureGraphSection.classList.contains('hidden')) {
                    drawExpenditureGraph();
                }
            });
        });
    };

    // Add New Account Modal Functions
    const openAddNewAccountModal = () => {
        accountSelectionModal.classList.add('hidden'); // Hide account selection modal first
        newAccountNameInput.value = '';
        newAccountBalanceInput.value = '0';
        addAccountModal.classList.remove('hidden');
        newAccountNameInput.focus();
    };

    const closeAddNewAccountModal = () => {
        addAccountModal.classList.add('hidden');
    };

    const addNewAccount = () => {
        const name = newAccountNameInput.value.trim();
        const balance = parseFloat(newAccountBalanceInput.value);

        if (!name || isNaN(balance)) {
            console.log('Please enter a valid account name and balance.'); // Log instead of alert
            return;
        }

        const newAccountId = `acc_${Date.now()}`; // Unique ID for new account
        const newAccount = { id: newAccountId, name: name, balance: balance };
        accounts.push(newAccount);
        currentAccount = newAccount; // Make the newly added account the current one
        saveFinanceData();
        updateBalanceDisplay();
        renderTransactionHistory(); // Refresh history for the new account
        closeAddNewAccountModal();
        // Only draw graph if it's currently visible
        if (!expenditureGraphSection.classList.contains('hidden')) {
            drawExpenditureGraph();
        }
    };


    // Event Listeners for Finance Section
    addTransactionBtn.addEventListener('click', () => showTransactionInput('add'));
    spentTransactionBtn.addEventListener('click', () => showTransactionInput('spent'));
    confirmTransactionBtn.addEventListener('click', recordTransaction);
    cancelTransactionBtn.addEventListener('click', hideTransactionInput);
    accountSelectBtn.addEventListener('click', openAccountSelectionModal);
    // New: Event listener for show/hide finance graph button
    showFinanceGraphBtn.addEventListener('click', () => {
        expenditureGraphSection.classList.toggle('hidden');
        if (!expenditureGraphSection.classList.contains('hidden')) {
            drawExpenditureGraph();
        }
    });

    // Event Listeners for Account Selection Modal
    closeAccountModalBtn.addEventListener('click', closeAccountSelectionModal);
    addNewAccountModalBtn.addEventListener('click', openAddNewAccountModal);

    // Event Listeners for Add New Account Modal
    confirmNewAccountBtn.addEventListener('click', addNewAccount);
    cancelNewAccountBtn.addEventListener('click', () => {
        closeAddNewAccountModal();
        openAccountSelectionModal(); // Go back to account selection after canceling add
    });

    // Initialize Finance Data on Load
    updateBalanceDisplay();
    renderTransactionHistory();


    // --- EXPENDITURE GRAPH FUNCTIONALITY ---

    const expenditureGraphSvg = document.getElementById('expenditure-graph-svg');
    const graphTooltip = document.getElementById('graph-tooltip');

    // Helper to format date as Букмекерлар-MM-DD
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toISOString().split('T')[0];
    };

    // Aggregate daily expenditure for the current account
    const getDailyExpenditure = () => {
        const dailyData = {};
        const now = new Date();
        const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Initialize all days of the current month with 0 expenditure
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), i);
            const formattedDate = formatDate(d);
            dailyData[formattedDate] = 0;
        }

        transactions.forEach(trans => {
            if (trans.accountId === currentAccount.id && trans.type === 'spent') {
                const transDate = new Date(trans.date);
                // Check if transaction date is within the current month
                if (transDate.getFullYear() === now.getFullYear() && transDate.getMonth() === now.getMonth()) {
                    const dateKey = formatDate(trans.date);
                    dailyData[dateKey] = (dailyData[dateKey] || 0) + trans.amount;
                }
            }
        });

        // Convert to an array of {date: "YYYY-MM-DD", amount: X} objects, sorted by date
        const sortedData = Object.keys(dailyData)
            .sort()
            .map(date => ({ date: date, amount: dailyData[date] }));

        return sortedData;
    };

    // Draw the expenditure graph (now a bar chart)
    const drawExpenditureGraph = () => {
        const data = getDailyExpenditure();
        const svgWidth = 300; // viewBox width
        const svgHeight = 200; // viewBox height
        const padding = 30; // Padding from SVG edges for axes and labels

        // Clear previous graph elements
        expenditureGraphSvg.innerHTML = '';

        // Calculate scales
        const maxExpenditure = Math.max(...data.map(d => d.amount), 100); // Ensure at least 100 for scale if no data
        const barWidth = (svgWidth - 2 * padding) / (data.length * 1.5); // Adjusted for spacing
        const gap = barWidth / 2;
        const yUnit = (svgHeight - 2 * padding) / maxExpenditure; // Define yUnit here

        // Create SVG group for graph elements
        const graphGroup = document.createElementNS(SVG_NS, 'g');
        expenditureGraphSvg.appendChild(graphGroup);

        // Draw Axes
        const xAxis = document.createElementNS(SVG_NS, 'line');
        xAxis.setAttribute('x1', padding);
        xAxis.setAttribute('y1', svgHeight - padding);
        xAxis.setAttribute('x2', svgWidth - padding);
        xAxis.setAttribute('y2', svgHeight - padding);
        xAxis.classList.add('axis');
        graphGroup.appendChild(xAxis);

        const yAxis = document.createElementNS(SVG_NS, 'line');
        yAxis.setAttribute('x1', padding);
        yAxis.setAttribute('y1', padding);
        yAxis.setAttribute('x2', padding);
        yAxis.setAttribute('y2', svgHeight - padding);
        yAxis.classList.add('axis');
        graphGroup.appendChild(yAxis);

        // Draw Bars and X-axis labels (days of the month)
        data.forEach((d, i) => {
            const x = padding + i * (barWidth + gap);
            const barHeight = (d.amount / maxExpenditure) * (svgHeight - 2 * padding);
            const y = svgHeight - padding - barHeight;

            // Draw bar
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.classList.add('bar');
            rect.dataset.date = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            rect.dataset.amount = d.amount.toLocaleString('en-IN');
            graphGroup.appendChild(rect);

            // Draw X-axis label (day number)
            const dateLabel = document.createElementNS(SVG_NS, 'text');
            dateLabel.setAttribute('x', x + barWidth / 2);
            dateLabel.setAttribute('y', svgHeight - padding + 15);
            dateLabel.setAttribute('text-anchor', 'middle');
            dateLabel.textContent = new Date(d.date).getDate(); // Just the day number
            graphGroup.appendChild(dateLabel);

            // Add grid line (optional, but good for bar charts)
            const gridLine = document.createElementNS(SVG_NS, 'line');
            gridLine.setAttribute('x1', x + barWidth / 2);
            gridLine.setAttribute('y1', padding);
            gridLine.setAttribute('x2', x + barWidth / 2);
            gridLine.setAttribute('y2', svgHeight - padding);
            gridLine.classList.add('grid-line');
            // Only add grid line if it's not the first bar and not too frequent
            if (i % 3 === 0 || i === data.length -1) { // Label every 3rd day or the last day
                graphGroup.appendChild(gridLine);
            }

            // Add tooltip functionality for bars
            rect.addEventListener('mouseenter', (event) => {
                const date = event.target.dataset.date;
                const amount = event.target.dataset.amount;
                graphTooltip.textContent = `${date}: ₹${amount}`;
                graphTooltip.classList.add('visible');

                // Position tooltip
                const svgRect = expenditureGraphSvg.getBoundingClientRect();
                const pointX = event.clientX;
                const pointY = event.clientY;

                graphTooltip.style.left = `${pointX + 10}px`; // 10px right of cursor
                graphTooltip.style.top = `${pointY - graphTooltip.offsetHeight - 10}px`; // 10px above cursor
            });
            rect.addEventListener('mouseleave', () => {
                graphTooltip.classList.remove('visible');
            });
        });

        // Draw Y-axis labels and grid lines (e.g., 4 labels)
        const yTicks = 4;
        for (let i = 0; i <= yTicks; i++) {
            const value = (i / yTicks) * maxExpenditure;
            const y = svgHeight - padding - (value * yUnit);

            const amountLabel = document.createElementNS(SVG_NS, 'text');
            amountLabel.setAttribute('x', padding - 5);
            amountLabel.setAttribute('y', y + 3);
            amountLabel.setAttribute('text-anchor', 'end');
            amountLabel.textContent = Math.round(value); // Round for display
            graphGroup.appendChild(amountLabel);

            // Add grid line
            if (i > 0) { // Don't draw grid line at X-axis
                const gridLine = document.createElementNS(SVG_NS, 'line');
                gridLine.setAttribute('x1', padding);
                gridLine.setAttribute('y1', y);
                gridLine.setAttribute('x2', svgWidth - padding);
                gridLine.setAttribute('y2', y);
                gridLine.classList.add('grid-line');
                graphGroup.appendChild(gridLine);
            }
        }
    };
});
