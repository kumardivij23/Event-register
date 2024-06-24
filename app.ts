interface EventItem {
    id: number;
    name: string;
    date: string;
    time: string;
}

let events: EventItem[] = [];
let nextId = 1;

function deleteEvent(id: number) {
    events = events.filter(event => event.id !== id);
    renderEvents();
}

function renderEvents() {
    const eventTableBody = document.getElementById('eventTableBody') as HTMLTableSectionElement;
    eventTableBody.innerHTML = '';
    events.forEach(event => {
        const row = document.createElement('tr');
        row.dataset.id = event.id.toString();

        row.innerHTML = `
            <td><input type="text" class="form-control" value="${event.name}" disabled></td>
            <td><input type="date" class="form-control" value="${event.date}" disabled></td>
            <td><input type="time" class="form-control" value="${event.time}" disabled></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="toggleEditMode(${event.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})">Delete</button>
                <button class="btn btn-success btn-sm" onclick="saveEvent(${event.id})" style="display:none;">Save</button>
                <button class="btn btn-secondary btn-sm" onclick="cancelEdit(${event.id})" style="display:none;">Cancel</button>
            </td>
        `;

        eventTableBody.appendChild(row);
    });
}

function scheduleNotification(event: EventItem) {
    const eventTime = new Date(`${event.date}T${event.time}`);
    const notificationTime = new Date(eventTime.getTime() - 5 * 60 * 1000);
    const timeUntilNotification = notificationTime.getTime() - new Date().getTime();

    if (timeUntilNotification > 0) {
        setTimeout(() => {
            alert(`Reminder: Event "${event.name}" is starting in 5 minutes.`);
            const notificationSound = document.getElementById('notificationSound') as HTMLAudioElement;
            notificationSound.play();
        }, timeUntilNotification);
    }
}

function checkUpcomingEvents() {
    const now = new Date();
    const upcomingEvents = events.filter(event => {
        const eventTime = new Date(`${event.date}T${event.time}`);
        const timeDiff = eventTime.getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 5 * 60 * 1000; // Within next 5 minutes
    });

    const notificationList = document.getElementById('notificationList') as HTMLUListElement;
    notificationList.innerHTML = '';

    upcomingEvents.forEach(event => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = `${event.name} - ${event.date} ${event.time}`;
        notificationList.appendChild(listItem);
    });

    if (upcomingEvents.length > 0) {
        const notificationSound = document.getElementById('notificationSound') as HTMLAudioElement;
        notificationSound.play();
    }
}

function toggleEditMode(id: number) {
    const row = document.querySelector(`tr[data-id="${id}"]`) as HTMLTableRowElement;
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => input.disabled = !input.disabled);

    const editButton = row.querySelector('button.btn-warning') as HTMLButtonElement;
    const deleteButton = row.querySelector('button.btn-danger') as HTMLButtonElement;
    const saveButton = row.querySelector('button.btn-success') as HTMLButtonElement;
    const cancelButton = row.querySelector('button.btn-secondary') as HTMLButtonElement;

    editButton.style.display = editButton.style.display === 'none' ? '' : 'none';
    deleteButton.style.display = deleteButton.style.display === 'none' ? '' : 'none';
    saveButton.style.display = saveButton.style.display === 'none' ? '' : 'none';
    cancelButton.style.display = cancelButton.style.display === 'none' ? '' : 'none';
}

function saveEvent(id: number) {
    const row = document.querySelector(`tr[data-id="${id}"]`) as HTMLTableRowElement;
    const inputs = row.querySelectorAll('input');

    const updatedEvent: EventItem = {
        id: id,
        name: (inputs[0] as HTMLInputElement).value,
        date: (inputs[1] as HTMLInputElement).value,
        time: (inputs[2] as HTMLInputElement).value
    };

    const eventIndex = events.findIndex(event => event.id === id);
    events[eventIndex] = updatedEvent;

    renderEvents();
}

function cancelEdit(id: number) {
    renderEvents();
}

document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm') as HTMLFormElement;

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addEvent();
    });

    function addEvent() {
        const eventNameInput = document.getElementById('eventName') as HTMLInputElement;
        const eventDateInput = document.getElementById('eventDate') as HTMLInputElement;
        const eventTimeInput = document.getElementById('eventTime') as HTMLInputElement;

        const newEvent: EventItem = {
            id: nextId++,
            name: eventNameInput.value,
            date: eventDateInput.value,
            time: eventTimeInput.value
        };

        events.push(newEvent);
        renderEvents();
        scheduleNotification(newEvent);
        eventForm.reset();
    }

    setInterval(checkUpcomingEvents, 1000 * 60); // Check every minute for upcoming events

    // Expose the functions to the global scope
    (window as any).deleteEvent = deleteEvent;
    (window as any).toggleEditMode = toggleEditMode;
    (window as any).saveEvent = saveEvent;
    (window as any).cancelEdit = cancelEdit;
});
