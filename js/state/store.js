let manualSemesters = [];
let manualInitialGpa = 0;
let manualInitialCredits = 0;

let targetState = {
    currentGpa: 0,
    currentCredits: 0,
    targetGpa: 0,
    newCredits: 0,
    totalCredits: 0,
    creditMode: 'new',
    isRetake: false,
    retakes: []
};

// Observers
const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
}

function notify() {
    listeners.forEach(listener => listener());
}

// Manual State Actions
export function getManualState() {
    return {
        semesters: manualSemesters,
        initialGpa: manualInitialGpa,
        initialCredits: manualInitialCredits
    };
}

export function setManualState(state) {
    if (state.semesters) manualSemesters = state.semesters;
    if (state.initialGpa !== undefined) manualInitialGpa = state.initialGpa;
    if (state.initialCredits !== undefined) manualInitialCredits = state.initialCredits;
    saveManualStateToStorage();
    notify();
}

export function addManualSemester(semester) {
    manualSemesters.push(semester);
    saveManualStateToStorage();
    notify();
}

export function removeManualSemester(id) {
    manualSemesters = manualSemesters.filter(s => String(s.id) !== String(id));
    saveManualStateToStorage();
    notify();
}

export function updateManualCourse(semId, courseId, field, value) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        const course = semester.courses.find(c => String(c.id) === String(courseId));
        if (course) {
            course[field] = value;
            saveManualStateToStorage();
            notify();
        }
    }
}

export function addManualCourse(semId, course) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        semester.courses.push(course);
        saveManualStateToStorage();
        notify();
    }
}

export function removeManualCourse(semId, courseId) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        semester.courses = semester.courses.filter(c => String(c.id) !== String(courseId));
        saveManualStateToStorage();
        notify();
    }
}

function saveManualStateToStorage() {
    const state = {
        semesters: manualSemesters,
        initialGpa: manualInitialGpa,
        initialCredits: manualInitialCredits
    };
    localStorage.setItem('manualState', JSON.stringify(state));
}

export function loadManualStateFromStorage() {
    const saved = localStorage.getItem('manualState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            if (Array.isArray(state)) {
                manualSemesters = state;
            } else {
                manualSemesters = state.semesters || [];
                manualInitialGpa = state.initialGpa || 0;
                manualInitialCredits = state.initialCredits || 0;
            }
            notify();
        } catch (e) {
            console.error("Error loading manual state", e);
        }
    }
}

// Target State Actions
export function getTargetState() {
    return targetState;
}

export function setTargetState(newState) {
    targetState = { ...targetState, ...newState };
    saveTargetStateToStorage();
    notify();
}

function saveTargetStateToStorage() {
    localStorage.setItem('targetState', JSON.stringify(targetState));
}

export function loadTargetStateFromStorage() {
    const saved = localStorage.getItem('targetState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            targetState = { ...targetState, ...state };
            notify();
        } catch (e) {
            console.error("Error loading target state", e);
        }
    }
}
