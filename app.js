var events = [];
var nextId = 1;
function deleteEvent(id) {
    events = events.filter(function (event) { return event.id !== id; });
    renderEvents();
}
function renderEvents() {
    var eventTableBody = document.getElementById('eventTableBody');
    eventTableBody.innerHTML = '';
    events.forEach(function (event) {
        var row = document.createElement('tr');
        row.dataset.id = event.id.toString();
        row.innerHTML = "\n            <td><input type=\"text\" class=\"form-control\" value=\"".concat(event.name, "\" disabled></td>\n            <td><input type=\"date\" class=\"form-control\" value=\"").concat(event.date, "\" disabled></td>\n            <td><input type=\"time\" class=\"form-control\" value=\"").concat(event.time, "\" disabled></td>\n            <td>\n                <button class=\"btn btn-warning btn-sm\" onclick=\"toggleEditMode(").concat(event.id, ")\">Edit</button>\n                <button class=\"btn btn-danger btn-sm\" onclick=\"deleteEvent(").concat(event.id, ")\">Delete</button>\n                <button class=\"btn btn-success btn-sm\" onclick=\"saveEvent(").concat(event.id, ")\" style=\"display:none;\">Save</button>\n                <button class=\"btn btn-secondary btn-sm\" onclick=\"cancelEdit(").concat(event.id, ")\" style=\"display:none;\">Cancel</button>\n            </td>\n        ");
        eventTableBody.appendChild(row);
    });
}
function scheduleNotification(event) {
    var eventTime = new Date("".concat(event.date, "T").concat(event.time));
    var notificationTime = new Date(eventTime.getTime() - 5 * 60 * 1000);
    var timeUntilNotification = notificationTime.getTime() - new Date().getTime();
    if (timeUntilNotification > 0) {
        setTimeout(function () {
            alert("Reminder: Event \"".concat(event.name, "\" is starting in 5 minutes."));
            var notificationSound = document.getElementById('notificationSound');
            notificationSound.play();
        }, timeUntilNotification);
    }
}
function checkUpcomingEvents() {
    var now = new Date();
    var upcomingEvents = events.filter(function (event) {
        var eventTime = new Date("".concat(event.date, "T").concat(event.time));
        var timeDiff = eventTime.getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 5 * 60 * 1000; // Within next 5 minutes
    });
    var notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = '';
    upcomingEvents.forEach(function (event) {
        var listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = "".concat(event.name, " - ").concat(event.date, " ").concat(event.time);
        notificationList.appendChild(listItem);
    });
    if (upcomingEvents.length > 0) {
        var notificationSound = document.getElementById('notificationSound');
        notificationSound.play();
    }
}
function toggleEditMode(id) {
    var row = document.querySelector("tr[data-id=\"".concat(id, "\"]"));
    var inputs = row.querySelectorAll('input');
    inputs.forEach(function (input) { return input.disabled = !input.disabled; });
    var editButton = row.querySelector('button.btn-warning');
    var deleteButton = row.querySelector('button.btn-danger');
    var saveButton = row.querySelector('button.btn-success');
    var cancelButton = row.querySelector('button.btn-secondary');
    editButton.style.display = editButton.style.display === 'none' ? '' : 'none';
    deleteButton.style.display = deleteButton.style.display === 'none' ? '' : 'none';
    saveButton.style.display = saveButton.style.display === 'none' ? '' : 'none';
    cancelButton.style.display = cancelButton.style.display === 'none' ? '' : 'none';
}
function saveEvent(id) {
    var row = document.querySelector("tr[data-id=\"".concat(id, "\"]"));
    var inputs = row.querySelectorAll('input');
    var updatedEvent = {
        id: id,
        name: inputs[0].value,
        date: inputs[1].value,
        time: inputs[2].value
    };
    var eventIndex = events.findIndex(function (event) { return event.id === id; });
    events[eventIndex] = updatedEvent;
    renderEvents();
}
function cancelEdit(id) {
    renderEvents();
}
document.addEventListener('DOMContentLoaded', function () {
    var eventForm = document.getElementById('eventForm');
    eventForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addEvent();
    });
    function addEvent() {
        var eventNameInput = document.getElementById('eventName');
        var eventDateInput = document.getElementById('eventDate');
        var eventTimeInput = document.getElementById('eventTime');
        var newEvent = {
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
    window.deleteEvent = deleteEvent;
    window.toggleEditMode = toggleEditMode;
    window.saveEvent = saveEvent;
    window.cancelEdit = cancelEdit;
});
