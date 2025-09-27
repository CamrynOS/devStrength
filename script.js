// navigation 
const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// adding and saving workouts
const addWorkoutBtn = document.getElementById('add-workout-btn');
const saveWorkoutBtn = document.getElementById('save-workout-btn');
const workoutForm = document.getElementById('workout-form');

// loading dashboard workouts
const lastWorkoutDiv = document.getElementById('last-workout');
const todaysWorkoutDiv = document.getElementById('todays-workout');

// loading table history
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-bar');
const sortOptions = document.getElementById('sort-options');
const historyTable = document.getElementById('history-table');

// editing schedule
const editScheduleBtn = document.getElementById('edit-schedule-btn');
const saveScheduleBtn = document.getElementById('save-schedule-btn');
const currentScheduleDiv = document.getElementById('current-schedule-div');
const currentScheduleContainer = document.getElementById('current-schedule');
const editScheduleDiv = document.getElementById('edit-schedule');
const scheduleInputs = document.getElementsByClassName('schedule-input');

// populating stats
const exerciseFilter = document.getElementById('exercise-filter');
const totalWorkoutsSpan = document.getElementById('total-workouts');
const totalSetsSpan = document.getElementById('total-sets');
const totalRepsSpan = document.getElementById('total-reps');
const totalVolumeSpan = document.getElementById('total-volume');
const avgRPESpan = document.getElementById('avg-rpe');
const maxWeightSpan = document.getElementById('max-weight');
const topExerciseSpan = document.getElementById('top-exercise');
const totalWorkoutsCard = document.getElementById('total-workouts-sets');
const totalVolumeCard = document.getElementById('total-volume');
const averageRPECard = document.getElementById('average-rpe');
const topExerciseCard = document.getElementById('top-exercise-weight');

// global variables
let currentWorkout = [];
let dayStreak = 0;
let numOfWorkouts = 0;
let statsChart;

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
    workoutForm.elements[0].readOnly = false;
    workoutForm.elements[0].value = ''; // clear date field
    workoutForm.elements[1].readOnly = false;
    workoutForm.elements[1].value = ''; // clear name field
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

   // workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

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

function loadTodaysWorkout() {
    const today = new Date();
    const dayOfWeekNumber = today.getDay();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[dayOfWeekNumber];
    
    const savedSchedule = JSON.parse(localStorage.getItem('schedule'));
    let detailHtml = `<p>No workout scheduled for today.</p>`;

    if (savedSchedule && savedSchedule[dayOfWeek]) {
        detailHtml = `<p>${dayOfWeek}: ${savedSchedule[dayOfWeek]}!</p>`;
    }
    
    todaysWorkoutDiv.innerHTML = detailHtml;
}

function sortHistory() {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const sortBy = sortOptions.value;

    if (sortBy === 'date-desc') {
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
        workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'exercises-desc') {
        workouts.sort((a, b) => b.routine.length - a.routine.length);
    } else if (sortBy === 'exercises-asc') {
        workouts.sort((a, b) => a.routine.length - b.routine.length);
    } else if (sortBy === 'name-asc') {
        workouts.sort((a, b) => a.routine[0].name.localeCompare(b.routine[0].name));
    } else if (sortBy === 'name-desc') {
        workouts.sort((a, b) => b.routine[0].name.localeCompare(a.routine[0].name));
    }

    localStorage.setItem('workouts', JSON.stringify(workouts));
    loadHistory();
    loadLastWorkout(); 
    numOfWorkouts = workouts.length;
}

function searchHistory() {
    const query = searchInput.value.toLowerCase();
    const rows = historyTable.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) { // start from 1 to skip header row
        const cells = rows[i].getElementsByTagName('td');
        let match = false;
        
        for (let j = 0; j < cells.length - 1; j++) { // exclude last cell with buttons
            if (cells[j].innerText.toLowerCase().includes(query)) {
                match = true;
                break;
            }
        }
        
        rows[i].style.display = match ? '' : 'none';
    }
}
searchInput.addEventListener('input', searchHistory);
sortOptions.addEventListener('change', sortHistory);

editScheduleBtn.addEventListener('click', function() {
    currentScheduleContainer.style.display = 'none';
    currentScheduleDiv.style.display = 'none';
    editScheduleDiv.style.display = 'block';
    editScheduleBtn.style.display = 'none';
});

saveScheduleBtn.addEventListener('click', function(event) {
    event.preventDefault();
    const currentSchedule = {
        Monday: scheduleInputs[0].value,
        Tuesday: scheduleInputs[1].value,
        Wednesday: scheduleInputs[2].value,
        Thursday: scheduleInputs[3].value,
        Friday: scheduleInputs[4].value,
        Saturday: scheduleInputs[5].value,
        Sunday: scheduleInputs[6].value
    };
    localStorage.setItem('schedule', JSON.stringify(currentSchedule));
    let scheduleHtml = '<h2>Current Schedule</h2><ul>';
    for (const [day, activity] of Object.entries(currentSchedule)) {
        scheduleHtml += `<li>${day}: ${activity}</li>`;
        scheduleInputs[Object.keys(currentSchedule).indexOf(day)].value = activity; // update input fields
    }
    scheduleHtml += '</ul>';
    
    currentScheduleDiv.innerHTML = scheduleHtml;
    currentScheduleContainer.style.display = 'block';
    currentScheduleDiv.style.display = 'block';
    editScheduleDiv.style.display = 'none';
    editScheduleBtn.style.display = 'inline-block';
    document.getElementById('edit-schedule-btn').addEventListener('click', function() {
        currentScheduleContainer.style.display = 'none';
        currentScheduleDiv.style.display = 'none';
        editScheduleDiv.style.display = 'block';
        editScheduleBtn.style.display = 'none';
    });
    loadTodaysWorkout();
});

function loadCurrentSchedule() {
    const savedSchedule = JSON.parse(localStorage.getItem('schedule'));
    if (savedSchedule) {
        let scheduleHtml = '<h2>Current Schedule</h2><ul>';
        for (const [day, activity] of Object.entries(savedSchedule)) {
            scheduleHtml += `<li>${day}: ${activity}</li>`;
            scheduleInputs[Object.keys(savedSchedule).indexOf(day)].value = activity; // populate input fields
        }
        scheduleHtml += '</ul>';
        currentScheduleDiv.innerHTML = scheduleHtml;
    }
}

function addStats() {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const query = exerciseFilter.value.toLowerCase();

    let filteredExercises = [];
    workouts.forEach(workout => {
        workout.routine.forEach(ex => {
            if (query.toLowerCase() === 'all' || ex.exercise.toLowerCase().includes(query)) {
                filteredExercises.push(ex);
            }
        });
    });

    const totalWorkouts = new Set(filteredExercises.map(ex => ex.date)).size;
    const totalSets = filteredExercises.reduce((sum, ex) => sum + parseInt(ex.sets), 0);
    const totalReps = filteredExercises.reduce((sum, ex) => sum + (parseInt(ex.sets) * parseInt(ex.reps)), 0);
    const totalVolume = filteredExercises.reduce((sum, ex) => sum + (parseInt(ex.sets) * parseInt(ex.reps) * parseInt(ex.weight)), 0);
    const avgRPE = filteredExercises.length > 0 ? (filteredExercises.reduce((sum, ex) => sum + parseFloat(ex.rpe), 0) / filteredExercises.length).toFixed(2) : 0;
    let maxWeight = Math.max(...filteredExercises.map(ex => parseInt(ex.weight)), 0);
    let topExercise = filteredExercises.find(ex => totalSets === Math.max(...filteredExercises.map(e => parseInt(e.sets))))?.exercise || 'N/A';
    
    if (query.toLowerCase() !== 'all' && !workouts.some(workout => workout.routine.some(ex => ex.exercise.toLowerCase().includes(query)))) {
        alert('No matching exercises found for the selected filter.');
    } else if (query.toLowerCase() === 'all') {
        totalWorkoutsCard.innerHTML = `<h4>Total Workouts</h4><p id="total-workouts">${totalWorkouts}</p>`;
        totalVolumeCard.innerHTML = `<h4>Total Volume</h4><p id="total-volume">${totalVolume} lbs</p>`;
        averageRPECard.innerHTML = `<h4>Average RPE</h4><p id="average-rpe">${avgRPE}</p>`;
        topExerciseCard.innerHTML = `<h4>Top Exercise</h4><p id="top-exercise">${topExercise}</p>`;
    } else if (query !== ''){
        totalWorkoutsCard.innerHTML = `<h4>Total Sets</h4><p id="total-sets">${totalSets} sets</p>`;
        totalVolumeCard.innerHTML = `<h4>Total Volume</h4><p id="total-volume">${totalVolume} lbs</p>`;
        averageRPECard.innerHTML = `<h4>Average RPE</h4><p id="average-rpe">${avgRPE}</p>`;
        topExerciseCard.innerHTML = `<h4>Max Weight</h4><p id="max-weight">${maxWeight} lbs</p>`;
    }
    return {filteredExercises, query};
}


function addGraph(filteredExercises, query) {
    const ctx = document.getElementById('stats-graph').getContext('2d');
    filteredExercises.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort by date
    if (statsChart) {
        statsChart.destroy(); // destroy previous chart instance if it exists
    }
    statsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredExercises.map(ex => ex.date),
            datasets: [{
                label: query || 'All Exercises',
                data: filteredExercises.map(ex => ex.weight),
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.3
            }]
        }
    });

}

function updateStats() {
    const {filteredExercises, query} = addStats();
    addGraph(filteredExercises, query);
}

exerciseFilter.addEventListener('change', updateStats);

onload = function() {
    showPage('dashboard');
    loadHistory();
    loadLastWorkout();
    loadCurrentSchedule();
    loadTodaysWorkout();
}