// navigation 
const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// adding and saving workouts
const addWorkoutBtn = document.getElementById('add-workout-btn');
const saveWorkoutBtn = document.getElementById('save-workout-btn');
const workoutForm = document.getElementById('workout-form');

// loading dashboard workouts
const lastWorkoutDiv = document.getElementById('last-workout');

// loading table history
const deleteBtn = document.getElementById('delete-btn');
const viewBtn = document.getElementById('view-btn');


let currentWorkout = [];
let numOfWorkouts = 0;

function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleBtn.classList.toggle('rotate');
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page'); // select all elements with page class
    pages.forEach(page => {
        page.style.display = 'none';
    }); // hide all pages
    document.getElementById(pageId).style.display = 'block'; // show the selected page

    const navLinks = document.querySelectorAll('#sidebar a'); // select all sidebar links
    navLinks.forEach(link => {
        link.parentElement.classList.remove('active'); // remove active class from all links
        if (link.getAttribute('onclick') === `showPage('${pageId}')`) { // check if the link corresponds to the current page
            link.parentElement.classList.add('active'); // add active class to the current link
        }
    });
}


workoutForm.addEventListener('submit', function(event) {
    event.preventDefault(); // stop page reload

    const currentExercise = {
        name: document.getElementById('name').value,
        date: document.getElementById('date').value,
        exercise: document.getElementById('exercise').value,
        weight: document.getElementById('weight').value,
        sets: document.getElementById('sets').value,
        reps: document.getElementById('reps').value,
        rpe: document.getElementById('rpe').value,
        notes: document.getElementById('notes').value
    };
    
    currentWorkout.push(currentExercise); // add current exercise to the workout array
    loadWorkoutSummary();
    workoutForm.elements[0].readOnly = true; // make date field read-only after first entry
    workoutForm.elements[1].readOnly = true; // make name field read-only after first entry
    for (let i = 2; i < workoutForm.elements.length; i++) {
        if (workoutForm.elements[i].type !== 'submit') {
            workoutForm.elements[i].value = ''; // clear the form fields
        }
    }
});

saveWorkoutBtn.addEventListener('click', function() {
    if (currentWorkout.length === 0) {
        alert('Must have at least one exercise in the workout session.');
        return;
    }

    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.push({
        date: currentWorkout[0].date,
        routine: currentWorkout
    })

    localStorage.setItem('workouts', JSON.stringify(workouts)); // save back to localStorage
    currentWorkout = [];
    workoutForm.elements[0].readOnly = false; // make date field editable for new session
    workoutForm.elements[1].readOnly = false; // make name field editable for new session
    loadWorkoutSummary();
    loadHistory();
    loadLastWorkout();
    numOfWorkouts++;
    alert('Workout session saved');
});

function loadWorkoutSummary() {

    const fullWorkout = document.getElementById('full-workout');
    fullWorkout.innerHTML = '';

    currentWorkout.forEach((workout, index) => {
        fullWorkout.innerHTML += `
            <div>
                <strong>${workout.exercise}</strong> - ${workout.sets}x${workout.reps} @ ${workout.weight}lbs (RPE: ${workout.rpe})<em>(${workout.date})</em>
                <p>${workout.notes}</p>
            </div>
        `;
    });
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];

    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    workouts.forEach((workout, index) => {
        historyList.innerHTML += `
            <tr class="detail-row">
                <td>${workout.date}</td>
                <td>${workout.routine[0].name}</td>
                <td>${workout.routine.length}</td>
                <td><button onclick="toggleDetails(${index})" class="table-btn" id="view-btn">View</button><button onclick="deleteWorkout(${index})" class="table-btn" id="delete-btn">Delete</button></td>
            </tr>
            <tr class="full-detail-row" id="detail-${index}" style="display: none;">
                <td colspan="4">
                    ${workout.routine.map(ex => `
                        <div>
                            <strong>${ex.exercise}</strong> - ${ex.sets}x${ex.reps} @ ${ex.weight}lbs (RPE: ${ex.rpe})<em>(${ex.date})</em>
                            <p>${ex.notes}</p>
                        </div>
                    `).join('')}
                </td>
            </tr>
        `;
    });
}

function deleteWorkout(index) {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    if (index < 0 || index >= workouts.length) {
        alert('Invalid workout index');
        return;
    }
    if (confirm(`Are you sure you want to delete the workout on ${workouts[index].date}?`)) {
        workouts.splice(index, 1); // remove the workout at the specified index
        localStorage.setItem('workouts', JSON.stringify(workouts)); // save back to localStorage
        loadHistory(); // refresh the history list
        loadLastWorkout(); // refresh the last workout display
        alert('Workout deleted');
    }
}

function toggleDetails(index) {
    const detailRow = document.getElementById(`detail-${index}`);
    if (detailRow.style.display === 'none') {
        detailRow.style.display = 'table-row';
    } else {
        detailRow.style.display = 'none';
    }
}


function loadWorkoutDetail(index) {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workout = workouts[index];

    let detailHtml = `<h2>Workout on ${workout.routine[0].date}</h2>`;
    
    workout.routine.forEach(ex => {
        detailHtml += `
            <div>
                <strong>${ex.exercise}</strong> - ${ex.sets}x${ex.reps} @ ${ex.weight}lbs (RPE: ${ex.rpe})<em>(${ex.date})</em><p>${ex.notes}</p>
            </div>
        `;
    });
    
    const modal = document.getElementById('workout-modal');
    const modalContent = document.getElementById('workout-modal-content');
    modalContent.innerHTML = detailHtml;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('workout-modal');
    modal.style.display = 'none';
}

function loadLastWorkout() {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    let lastWorkout;
    let detailHtml = `<p>No workouts logged yet.</p>`;
    if (workouts.length > 0) {
        workouts.forEach(workout => {
            if (new Date(workout.date) > new Date((lastWorkout && lastWorkout.date) || 0)) {
                lastWorkout = workout;
            }
        });
        detailHtml = `<h2>${lastWorkout.routine[0].name} on ${lastWorkout.routine[0].date}</h2>`;

        lastWorkout.routine.forEach(ex => {
            detailHtml += `
                    <strong>${ex.exercise}</strong> - ${ex.sets} sets x ${ex.reps} reps @ ${ex.weight}lbs (RPE: ${ex.rpe})<p>${ex.notes}</p>
            `;
        });
    }
    lastWorkoutDiv.innerHTML = detailHtml;
}

window.onload = loadLastWorkout();
window.onload = loadHistory();