const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');
const addWorkoutBtn = document.getElementById('add-workout-btn');
const saveWorkoutBtn = document.getElementById('save-workout-btn');
const workoutForm = document.getElementById('workout-form');

let currentWorkout = [];

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
    this.reset(); // reset form
});

saveWorkoutBtn.addEventListener('click', function() {
    if (currentWorkout.length === 0) {
        alert('Must have at least one exercise in the workout session.');
        return;
    }

    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.push({
        date: new Date().toLocaleDateString(),
        exercises: currentWorkout
    })

    localStorage.setItem('workouts', JSON.stringify(workouts)); // save back to localStorage
    currentWorkout = [];
    loadWorkoutSummary();
    loadHistory();
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

    workouts.forEach((workout, index) => {
        historyList.innerHTML += `
            <button onclick="loadWorkoutDetail(${index})">
                <strong>${workout.date}</strong>
            </button>
        `;
    });
}

function loadWorkoutDetail(index) {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workout = workouts[index];

    let detailHtml = `<h2>Workout on ${workout.date}</h2>`;
    
    workout.exercises.forEach(ex => {
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



window.onload = loadHistory;