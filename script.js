// Main application logic
// import { GoogleGenerativeAI } from "@google/genai";

console.log("HUFLIT GPA Strategist loaded.");

// Access global constant
const GRADE_SCALE = window.HUFLIT_GRADE_SCALE || [];

document.addEventListener('DOMContentLoaded', () => {
    initCourseGradeTab();
    initTargetGPATab();
    initManualCalcTab();
    initGradeScaleTab();

    // Sync Desktop and Mobile Tabs
    const allNavLinks = document.querySelectorAll('.nav-link[data-bs-toggle="pill"]');
    allNavLinks.forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target');
            // Find all links that point to the same target
            const correspondingLinks = document.querySelectorAll(`.nav-link[data-bs-toggle="pill"][data-bs-target="${targetId}"]`);
            
            correspondingLinks.forEach(other => {
                if (other !== e.target) {
                    // Activate the corresponding link
                    other.classList.add('active');
                    other.setAttribute('aria-selected', 'true');
                    
                    // Deactivate siblings in the same container
                    const container = other.closest('.nav');
                    if (container) {
                        container.querySelectorAll('.nav-link').forEach(sib => {
                            if (sib !== other) {
                                sib.classList.remove('active');
                                sib.setAttribute('aria-selected', 'false');
                            }
                        });
                    }
                }
            });
        });
    });
});

// ==========================================
// TAB: THANG ĐIỂM (GRADE SCALE)
// ==========================================

function initGradeScaleTab() {
    const tableBody = document.getElementById('grade-scale-table-body');
    if (!tableBody) return;

    const html = GRADE_SCALE.map(item => {
        let badgeColor = 'bg-secondary';
        let rank = 'Kém';

        if (item.grade.startsWith('A')) { badgeColor = 'bg-success'; rank = 'Xuất sắc'; }
        else if (item.grade.startsWith('B')) { badgeColor = 'bg-primary'; rank = 'Giỏi'; }
        else if (item.grade.startsWith('C')) { badgeColor = 'bg-info text-dark'; rank = 'Khá'; }
        else if (item.grade.startsWith('D')) { badgeColor = 'bg-warning text-dark'; rank = 'Trung bình'; }
        else { badgeColor = 'bg-danger'; rank = 'Kém'; }

        return `
            <tr>
                <td class="ps-4">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm ${badgeColor}" 
                             style="width: 40px; height: 40px; font-size: 1.1rem;">
                            ${item.grade}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex flex-column">
                        <span class="fw-medium text-dark">${item.min.toFixed(1)} - ${item.max.toFixed(1)}</span>
                    </div>
                </td>
                <td>
                    <span class="fw-bold text-primary fs-5">${item.gpa.toFixed(1)}</span>
                </td>
                <td class="pe-4 text-end">
                    <span class="badge bg-light text-dark border fw-normal px-3 py-2 rounded-pill">${rank}</span>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = html;
}

// ==========================================
// TAB: TÍNH GPA THỦ CÔNG (MANUAL CALC)
// ==========================================

let manualSemesters = [];
const manualSemesterList = document.getElementById('manual-semester-list');
const addSemesterBtn = document.getElementById('add-semester-btn');
const manualGpaDisplay = document.getElementById('manual-gpa');
const manualCreditsDisplay = document.getElementById('manual-credits');
const manualRankDisplay = document.getElementById('manual-rank');
const resetManualBtn = document.getElementById('reset-manual-btn');
const manualInitialGpaInput = document.getElementById('manual-initial-gpa');
const manualInitialCreditsInput = document.getElementById('manual-initial-credits');

function initManualCalcTab() {
    if (!addSemesterBtn) return;

    loadManualState();
    renderManualSemesters();
    calculateManualGPA();

    addSemesterBtn.addEventListener('click', () => {
        addManualSemester();
    });

    resetManualBtn.addEventListener('click', () => {
        if(confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu tính thủ công?')) {
            manualSemesters = [];
            manualInitialGpaInput.value = '';
            manualInitialCreditsInput.value = '';
            saveManualState();
            renderManualSemesters();
            calculateManualGPA();
        }
    });

    // Initial Data Inputs
    manualInitialGpaInput.addEventListener('input', () => {
        saveManualState();
        calculateManualGPA();
    });
    manualInitialCreditsInput.addEventListener('input', () => {
        saveManualState();
        calculateManualGPA();
    });

    // Event Delegation for dynamic elements
    let deleteTimeout = null;
    
    manualSemesterList.addEventListener('click', (e) => {
        const target = e.target;
        
        // Delete Semester (Request Confirmation)
        const deleteBtn = target.closest('.delete-semester-btn');
        if (deleteBtn) {
            // Clear any existing timeout
            if (deleteTimeout) {
                clearTimeout(deleteTimeout);
            }
            
            // Change to confirm state
            deleteBtn.classList.remove('delete-semester-btn', 'text-danger', 'btn-link');
            deleteBtn.classList.add('confirm-delete-semester-btn', 'btn-danger', 'text-white');
            deleteBtn.innerHTML = 'Xóa?';
            
            // Auto revert after 2 seconds (reduced from 3)
            deleteTimeout = setTimeout(() => {
                // Check if button still exists and hasn't been clicked
                if (deleteBtn && document.body.contains(deleteBtn) && deleteBtn.classList.contains('confirm-delete-semester-btn')) {
                    deleteBtn.classList.add('delete-semester-btn', 'text-danger', 'btn-link');
                    deleteBtn.classList.remove('confirm-delete-semester-btn', 'btn-danger', 'text-white');
                    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                }
                deleteTimeout = null;
            }, 2000);
            return;
        }

        // Confirm Delete Semester
        const confirmBtn = target.closest('.confirm-delete-semester-btn');
        if (confirmBtn) {
            // Clear timeout since user confirmed
            if (deleteTimeout) {
                clearTimeout(deleteTimeout);
                deleteTimeout = null;
            }
            
            const semId = parseInt(confirmBtn.dataset.id);
            deleteManualSemester(semId);
            return;
        }

        // Add Course
        if (target.closest('.add-course-btn')) {
            const semId = parseInt(target.closest('.add-course-btn').dataset.id);
            addManualCourse(semId);
        }

        // Delete Course
        if (target.closest('.delete-course-btn')) {
            const semId = parseInt(target.closest('.delete-course-btn').dataset.semId);
            const courseId = parseInt(target.closest('.delete-course-btn').dataset.courseId);
            deleteManualCourse(semId, courseId);
        }
    });

    manualSemesterList.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('manual-input')) {
            const semId = parseInt(target.dataset.semId);
            const courseId = parseInt(target.dataset.courseId);
            const field = target.dataset.field;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            
            updateManualCourse(semId, courseId, field, value);
        }
    });

    // Add input event listener for real-time updates
    manualSemesterList.addEventListener('input', (e) => {
        const target = e.target;
        if (target.classList.contains('manual-input') && target.dataset.field === 'credits') {
            const semId = parseInt(target.dataset.semId);
            const courseId = parseInt(target.dataset.courseId);
            const value = target.value;
            
            // Update credits and GPA in real-time
            const semester = manualSemesters.find(s => s.id === semId);
            if (semester) {
                const course = semester.courses.find(c => c.id === courseId);
                if (course) {
                    course.credits = parseFloat(value) || 0;
                    updateSemesterStats(semId);
                }
            }
        }
    });
}

function addManualSemester() {
    const id = Date.now();
    manualSemesters.push({
        id: id,
        name: `Học kỳ ${manualSemesters.length + 1}`,
        courses: []
    });
    saveManualState();
    renderManualSemesters();
    // Add one empty course by default
    addManualCourse(id);
}

function deleteManualSemester(id) {
    // Removed blocking confirm() to fix violation
    manualSemesters = manualSemesters.filter(s => s.id !== id);
    
    // Re-index semester names to ensure sequential order
    manualSemesters.forEach((sem, index) => {
        sem.name = `Học kỳ ${index + 1}`;
    });

    saveManualState();
    renderManualSemesters();
    calculateManualGPA();
}

function addManualCourse(semId) {
    const semester = manualSemesters.find(s => s.id === semId);
    if (semester) {
        semester.courses.push({
            id: Date.now(),
            name: '',
            credits: 3,
            grade: 'A',
            isRetake: false,
            oldGrade: 'F'
        });
        saveManualState();
        renderManualSemesters();
        calculateManualGPA();
    }
}

function deleteManualCourse(semId, courseId) {
    const semester = manualSemesters.find(s => s.id === semId);
    if (semester) {
        semester.courses = semester.courses.filter(c => c.id !== courseId);
        saveManualState();
        renderManualSemesters();
        calculateManualGPA();
    }
}

function updateSemesterStats(semId) {
    const semester = manualSemesters.find(s => s.id === semId);
    if (semester) {
        const semTotalCredits = semester.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        const semTotalPoints = semester.courses.reduce((sum, c) => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            return sum + (gpa * (parseFloat(c.credits) || 0));
        }, 0);
        const semGPA = semTotalCredits > 0 ? (semTotalPoints / semTotalCredits).toFixed(2) : '0.00';
        
        // Update credits badge
        const creditsBadge = document.querySelector(`.semester-total-credits[data-sem-id="${semId}"]`);
        if (creditsBadge) {
            creditsBadge.textContent = `${semTotalCredits} TC`;
        }
        
        // Update GPA badge
        const gpaBadge = document.querySelector(`.semester-gpa[data-sem-id="${semId}"]`);
        if (gpaBadge) {
            gpaBadge.textContent = `GPA ${semGPA}`;
        }
    }
}

function updateSemesterGPA(semId) {
    const semester = manualSemesters.find(s => s.id === semId);
    if (semester) {
        const semTotalCredits = semester.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        const semTotalPoints = semester.courses.reduce((sum, c) => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            return sum + (gpa * (parseFloat(c.credits) || 0));
        }, 0);
        const semGPA = semTotalCredits > 0 ? (semTotalPoints / semTotalCredits).toFixed(2) : '0.00';
        
        // Update GPA badge
        const gpaBadge = document.querySelector(`.semester-gpa[data-sem-id="${semId}"]`);
        if (gpaBadge) {
            gpaBadge.textContent = `GPA ${semGPA}`;
        }
    }
}

function updateManualCourse(semId, courseId, field, value) {
    const semester = manualSemesters.find(s => s.id === semId);
    if (semester) {
        const course = semester.courses.find(c => c.id === courseId);
        if (course) {
            course[field] = value;
            // If credits changed, ensure it's a number
            if (field === 'credits') {
                course.credits = parseFloat(value) || 0;
                
                // Update UI for total credits and GPA immediately without re-rendering
                updateSemesterStats(semId);
            }
            
            // If grade changed, update GPA
            if (field === 'grade') {
                updateSemesterGPA(semId);
            }
            
            saveManualState();
            // Only re-render if toggling retake (to show/hide old grade)
            if (field === 'isRetake') {
                renderManualSemesters();
            }
            calculateManualGPA();
        }
    }
}

function calculateManualGPA() {
    // 1. Start with Initial Data
    let initialGPA = parseFloat(manualInitialGpaInput.value) || 0;
    let initialCredits = parseFloat(manualInitialCreditsInput.value) || 0;
    
    let totalPoints = initialGPA * initialCredits;
    let totalCredits = initialCredits;

    // 2. Iterate Semesters
    manualSemesters.forEach(sem => {
        sem.courses.forEach(course => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(course.credits) || 0;

            // Add current course - F grades don't count towards total credits
            totalPoints += gpa * credits;
            if (gpa > 0) {
                totalCredits += credits;
            }

            // Handle Retake Logic
            if (course.isRetake) {
                const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
                const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;
                
                // Subtract old course effect - only if old grade was passing
                totalPoints -= oldGpa * credits;
                if (oldGpa > 0) {
                    totalCredits -= credits;
                }
            }
        });
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    
    // Update UI
    manualGpaDisplay.textContent = gpa.toFixed(2);
    manualCreditsDisplay.textContent = totalCredits;
    
    // Rank
    let rank = 'Yếu';
    if (gpa >= 3.6) rank = 'Xuất sắc';
    else if (gpa >= 3.2) rank = 'Giỏi';
    else if (gpa >= 2.5) rank = 'Khá';
    else if (gpa >= 2.0) rank = 'Trung bình';
    
    manualRankDisplay.textContent = rank;
    
    // Colorize GPA
    manualGpaDisplay.className = `display-1 fw-bold mb-2 ${gpa >= 3.2 ? 'text-success' : (gpa >= 2.5 ? 'text-primary' : 'text-danger')}`;
}

window.adjustManualCredit = function(semId, courseId, delta) {
    const input = document.querySelector(`input.manual-input[data-sem-id="${semId}"][data-course-id="${courseId}"][data-field="credits"]`);
    if (input) {
        let val = parseFloat(input.value) || 0;
        val += delta;
        if (val < 0) val = 0;
        input.value = val;
        updateManualCourse(semId, courseId, 'credits', val);
    }
};

function renderManualSemesters() {
    manualSemesterList.innerHTML = manualSemesters.map(sem => {
        const semTotalCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        const semTotalPoints = sem.courses.reduce((sum, c) => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            return sum + (gpa * (parseFloat(c.credits) || 0));
        }, 0);
        const semGPA = semTotalCredits > 0 ? (semTotalPoints / semTotalCredits).toFixed(2) : '0.00';
        
        return `
        <div class="card shadow-sm mb-3">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">${sem.name}</span>
                    <span class="badge bg-light text-secondary border semester-total-credits" data-sem-id="${sem.id}">${semTotalCredits} TC</span>
                    <span class="badge bg-primary text-white border semester-gpa" data-sem-id="${sem.id}">GPA ${semGPA}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-link text-danger delete-semester-btn" data-id="${sem.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body p-2">
                <div class="table-responsive">
                    <table class="table table-borderless align-middle mb-0">
                        <thead class="text-muted small border-bottom text-nowrap">
                            <tr>
                                <th style="width: 30%; min-width: 90px;">Môn học</th>
                                <th style="width: 20%; min-width: 85px;">TC</th>
                                <th style="width: 25%; min-width: 85px;">Điểm</th>
                                <th style="width: 20%; min-width: 65px;">Học lại?</th>
                                <th style="width: 5%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sem.courses.map(course => `
                                <tr>
                                    <td>
                                        <input type="text" class="form-control form-control-sm manual-input" 
                                            placeholder="Tên môn" value="${course.name}" 
                                            data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="name">
                                    </td>
                                    <td>
                                        <div class="input-group input-group-sm flex-nowrap" style="min-width: 80px;">
                                            <button class="btn btn-outline-secondary px-1" type="button" onclick="adjustManualCredit(${sem.id}, ${course.id}, -1)">-</button>
                                            <input type="number" class="form-control form-control-sm manual-input text-center px-0" 
                                                value="${course.credits}" min="0" readonly
                                                data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="credits">
                                            <button class="btn btn-outline-secondary px-1" type="button" onclick="adjustManualCredit(${sem.id}, ${course.id}, 1)">+</button>
                                        </div>
                                    </td>
                                    <td>
                                        <select class="form-select form-select-sm manual-input"
                                            data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="grade">
                                            ${GRADE_SCALE.map(g => `<option value="${g.grade}" ${course.grade === g.grade ? 'selected' : ''}>${g.grade}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td>
                                        <div class="d-flex flex-column gap-1">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input manual-input" type="checkbox" 
                                                    ${course.isRetake ? 'checked' : ''}
                                                    data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="isRetake">
                                            </div>
                                            ${course.isRetake ? `
                                                <select class="form-select form-select-xs manual-input" style="font-size: 0.75rem; padding: 2px;"
                                                    data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="oldGrade">
                                                    <option value="" disabled>Điểm cũ</option>
                                                    ${GRADE_SCALE.map(g => `<option value="${g.grade}" ${course.oldGrade === g.grade ? 'selected' : ''}>${g.grade}</option>`).join('')}
                                                </select>
                                            ` : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm text-muted delete-course-btn" 
                                            data-sem-id="${sem.id}" data-course-id="${course.id}">
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button class="btn btn-sm btn-light w-100 mt-2 text-muted add-course-btn" data-id="${sem.id}">
                    <i class="bi bi-plus"></i> Thêm môn học
                </button>
            </div>
        </div>
    `;}).join('');
}

function saveManualState() {
    const state = {
        semesters: manualSemesters,
        initialGpa: manualInitialGpaInput.value,
        initialCredits: manualInitialCreditsInput.value
    };
    localStorage.setItem('manualState', JSON.stringify(state));
}

function loadManualState() {
    const saved = localStorage.getItem('manualState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            // Check if it's the old format (array) or new format (object)
            if (Array.isArray(state)) {
                manualSemesters = state;
            } else {
                manualSemesters = state.semesters || [];
                manualInitialGpaInput.value = state.initialGpa || '';
                manualInitialCreditsInput.value = state.initialCredits || '';
            }
        } catch (e) {
            console.error("Error loading manual state", e);
        }
    }
}

// ==========================================
// TAB: LỘ TRÌNH GPA (TARGET GPA)
// ==========================================

const currentGpaInput = document.getElementById('current-gpa');
const currentCreditsInput = document.getElementById('current-credits');
const targetGpaInput = document.getElementById('target-gpa');
const newCreditsInput = document.getElementById('new-credits');
const retakeToggle = document.getElementById('retake-toggle');
const retakeArea = document.getElementById('retake-area');
const retakeList = document.getElementById('retake-list');
const addRetakeBtn = document.getElementById('add-retake-btn');
const calcTargetBtn = document.getElementById('calc-target-btn');
const targetResultContainer = document.getElementById('target-result-container');

function initTargetGPATab() {
    if (!calcTargetBtn) return;

    loadTargetState();

    // Input Listeners for Auto-Save
    [currentGpaInput, currentCreditsInput, targetGpaInput, newCreditsInput].forEach(input => {
        input.addEventListener('input', saveTargetState);
    });

    // Toggle Retake Area
    retakeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            retakeArea.classList.remove('d-none');
        } else {
            retakeArea.classList.add('d-none');
            retakeList.innerHTML = ''; // Clear list when hidden
        }
        saveTargetState();
    });

    // Add Retake Subject
    addRetakeBtn.addEventListener('click', () => {
        addRetakeItem();
        saveTargetState();
    });

    // Calculate Button
    calcTargetBtn.addEventListener('click', () => {
        calculateTargetGPA();
    });
}

function addRetakeItem(savedData = null) {
    const id = Date.now();
    const item = document.createElement('div');
    item.className = 'd-flex gap-2 mb-2 align-items-center flex-nowrap';
    
    const defaultGrade = savedData ? savedData.oldGrade : (GRADE_SCALE[0] ? GRADE_SCALE[0].gpa : 0);
    const defaultCredits = savedData ? savedData.credits : 3;

    item.innerHTML = `
        <div class="input-group flex-grow-1" style="min-width: 0;">
            <span class="input-group-text bg-light text-muted small px-2">Điểm cũ</span>
            <select class="form-select retake-old-grade" aria-label="Old Grade" style="text-overflow: ellipsis;">
                ${GRADE_SCALE.map(g => `<option value="${g.gpa}" ${Math.abs(g.gpa - defaultGrade) < 0.01 ? 'selected' : ''}>${g.grade} (${g.gpa})</option>`).join('')}
            </select>
        </div>
        <div class="input-group flex-nowrap" style="width: 90px; flex-shrink: 0;">
            <button class="btn btn-light border text-muted small px-2 btn-decrement" type="button">-</button>
            <input type="number" class="form-control retake-credits text-center px-0 border-start-0 border-end-0" placeholder="3" value="${defaultCredits}" min="1" max="10" readonly>
            <button class="btn btn-light border text-muted small px-2 btn-increment" type="button">+</button>
        </div>
        <button class="btn btn-light text-danger border-0 delete-retake-btn p-2 flex-shrink-0" type="button"><i class="bi bi-trash"></i></button>
    `;

    // Listeners for inner elements
    const select = item.querySelector('.retake-old-grade');
    const input = item.querySelector('.retake-credits');
    const btnDec = item.querySelector('.btn-decrement');
    const btnInc = item.querySelector('.btn-increment');
    
    select.addEventListener('change', saveTargetState);
    
    btnDec.addEventListener('click', () => {
        let val = parseFloat(input.value) || 0;
        if (val > 1) {
            input.value = val - 1;
            saveTargetState();
        }
    });

    btnInc.addEventListener('click', () => {
        let val = parseFloat(input.value) || 0;
        if (val < 10) {
            input.value = val + 1;
            saveTargetState();
        }
    });

    // Delete Event
    item.querySelector('.delete-retake-btn').addEventListener('click', () => {
        item.remove();
        saveTargetState();
    });

    retakeList.appendChild(item);
}

function saveTargetState() {
    const retakes = [];
    if (retakeToggle.checked) {
        Array.from(retakeList.children).forEach(item => {
            const oldGradeSelect = item.querySelector('.retake-old-grade');
            const creditsInput = item.querySelector('.retake-credits');
            if (oldGradeSelect && creditsInput) {
                retakes.push({ 
                    oldGrade: parseFloat(oldGradeSelect.value), 
                    credits: parseFloat(creditsInput.value) 
                });
            }
        });
    }

    const state = {
        currentGpa: currentGpaInput.value,
        currentCredits: currentCreditsInput.value,
        targetGpa: targetGpaInput.value,
        newCredits: newCreditsInput.value,
        isRetake: retakeToggle.checked,
        retakes: retakes
    };
    localStorage.setItem('targetState', JSON.stringify(state));
}

function loadTargetState() {
    const saved = localStorage.getItem('targetState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            currentGpaInput.value = state.currentGpa || '';
            currentCreditsInput.value = state.currentCredits || '';
            targetGpaInput.value = state.targetGpa || '';
            newCreditsInput.value = state.newCredits || '';
            
            retakeToggle.checked = state.isRetake || false;
            if (state.isRetake) {
                retakeArea.classList.remove('d-none');
                retakeList.innerHTML = '';
                if (state.retakes && Array.isArray(state.retakes)) {
                    state.retakes.forEach(r => addRetakeItem(r));
                }
            } else {
                retakeArea.classList.add('d-none');
            }
        } catch (e) {
            console.error("Error loading target state", e);
        }
    }
}

function calculateTargetGPA() {
    // 1. Get Inputs
    const currentGPA = parseFloat(currentGpaInput.value) || 0;
    const currentCredits = parseFloat(currentCreditsInput.value) || 0;
    const targetGPA = parseFloat(targetGpaInput.value) || 0;
    const newCredits = parseFloat(newCreditsInput.value) || 0;

    // 2. Handle Retakes
    let removedPoints = 0;
    let retakeCreditsTotal = 0;
    let retakeCreditsFromF = 0; // Credits from F grade courses (not in accumulated credits)
    
    if (retakeToggle.checked) {
        Array.from(retakeList.children).forEach(item => {
            const oldGradeSelect = item.querySelector('.retake-old-grade');
            const creditsInput = item.querySelector('.retake-credits');
            
            if (oldGradeSelect && creditsInput) {
                const oldGrade = parseFloat(oldGradeSelect.value);
                const credits = parseFloat(creditsInput.value);
                
                if (!isNaN(oldGrade) && !isNaN(credits)) {
                    removedPoints += oldGrade * credits;
                    retakeCreditsTotal += credits;
                    
                    if (oldGrade === 0) {
                        retakeCreditsFromF += credits;
                    }
                }
            }
        });
    }

    // 3. Logic Calculation
    // Current Total Points
    const currentTotalPoints = currentGPA * currentCredits;
    
    // Effective Current Points (after removing old grades)
    // Note: If oldGrade was F (0), removedPoints adds 0, so it doesn't change points. Correct.
    const effectiveCurrentPoints = currentTotalPoints - removedPoints;
    
    // Total Future Credits
    // If retaking a passed course (D, C...), it's already in currentCredits.
    // If retaking a failed course (F), it is NOT in currentCredits, so we must add it.
    const totalFutureCredits = currentCredits + newCredits + retakeCreditsFromF;
    
    // Target Total Points
    const targetTotalPoints = targetGPA * totalFutureCredits;
    
    // Points Needed from (New Subjects + Retake Subjects)
    const pointsNeeded = targetTotalPoints - effectiveCurrentPoints;
    
    // Credits available to earn these points
    const creditsToEarn = newCredits + retakeCreditsTotal;

    // Required Average GPA for the new/retake block
    let requiredGPA = 0;
    let deficitPoints = 0;

    if (creditsToEarn > 0) {
        requiredGPA = pointsNeeded / creditsToEarn;
        
        // Calculate deficit if impossible
        if (requiredGPA > 4.0) {
            deficitPoints = pointsNeeded - (4.0 * creditsToEarn);
        }
    } else {
        // No new credits and no retakes?
        // If Current GPA == Target GPA, then 0 needed? No, this case is weird.
        // Let's assume required is 0 if pointsNeeded <= 0, else infinite.
        requiredGPA = pointsNeeded <= 0 ? 0 : 999;
    }

    // 4. Render Results
    const details = {
        targetGPA,
        totalFutureCredits,
        targetTotalPoints,
        effectiveCurrentPoints,
        pointsNeeded,
        creditsToEarn,
        requiredGPA,
        currentTotalPoints,
        removedPoints,
        currentCredits,
        retakeCreditsTotal
    };
    renderTargetResult(requiredGPA, creditsToEarn, deficitPoints, details);
}

function renderTargetResult(requiredGPA, creditsToEarn, deficitPoints = 0, details = null) {
    let html = '';
    let bgClass = '';
    let textClass = '';
    let icon = '';
    let message = '';

    if (requiredGPA <= 4.0 && requiredGPA >= 0) {
        // Feasible
        bgClass = 'bg-success-subtle';
        textClass = 'text-success-emphasis';
        icon = 'bi-check-circle-fill';
        message = 'Khả thi! Bạn hoàn toàn có thể đạt được.';
    } else if (requiredGPA > 4.0) {
        // Impossible
        bgClass = 'bg-danger-subtle';
        textClass = 'text-danger-emphasis';
        icon = 'bi-exclamation-triangle-fill';
        message = 'Rất khó! Mục tiêu vượt quá khả năng tối đa (4.0).';
    } else {
        // Already achieved (Required < 0)
        bgClass = 'bg-info-subtle';
        textClass = 'text-info-emphasis';
        icon = 'bi-trophy-fill';
        message = 'Bạn đã đạt hoặc vượt qua mục tiêu này rồi!';
        requiredGPA = 0; // Clamp for display
    }

    html = `
        <div class="text-center mb-4 w-100">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle ${bgClass.replace('-subtle', '')} text-white shadow-sm mb-3" style="width: 60px; height: 60px;">
                <i class="bi ${icon} fs-2"></i>
            </div>
            <h6 class="text-uppercase text-secondary fw-bold small letter-spacing-1 mb-2">GPA Trung bình cần đạt</h6>
            <div class="display-1 fw-bold ${textClass} mb-2" style="letter-spacing: -2px;">${requiredGPA.toFixed(2)}</div>
            <p class="text-muted fw-medium mb-0">cho <span class="fw-bold text-dark">${creditsToEarn}</span> tín chỉ tiếp theo</p>
            <div class="mt-3">
                <span class="badge rounded-pill ${bgClass} ${textClass} px-3 py-2 border border-${textClass.replace('text-', '')}-subtle">
                    ${message}
                </span>
            </div>
            
            ${(requiredGPA > 4.0 && deficitPoints > 0) ? `
            <div class="alert alert-light mt-4 border-0 shadow-sm text-start">
                <h6 class="alert-heading fw-bold text-dark"><i class="bi bi-lightbulb-fill me-2 text-warning"></i>Gợi ý cải thiện:</h6>
                <p class="mb-2 small text-muted">Để đạt mục tiêu, ngoài việc đạt 4.0 cho ${creditsToEarn} tín chỉ sắp tới, bạn cần học cải thiện thêm:</p>
                <ul class="list-group list-group-flush bg-transparent">
                        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-2 border-bottom border-light-subtle">
                            <div class="d-flex align-items-center text-nowrap">
                                <span class="text-secondary small me-2">Cải thiện môn</span>
                                <span class="badge bg-danger rounded-pill">F (0.0)</span>
                            </div>
                            <span class="fw-bold text-dark text-nowrap">~${Math.ceil(deficitPoints / 4.0)} tín chỉ</span>
                        </li>
                        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-2 border-bottom border-light-subtle">
                            <div class="d-flex align-items-center text-nowrap">
                                <span class="text-secondary small me-2">Cải thiện môn</span>
                                <span class="badge bg-warning text-dark rounded-pill">D (1.0)</span>
                            </div>
                            <span class="fw-bold text-dark text-nowrap">~${Math.ceil(deficitPoints / 3.0)} tín chỉ</span>
                        </li>
                        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-2 border-bottom-0">
                            <div class="d-flex align-items-center text-nowrap">
                                <span class="text-secondary small me-2">Cải thiện môn</span>
                                <span class="badge bg-info text-dark rounded-pill">C (2.0)</span>
                            </div>
                            <span class="fw-bold text-dark text-nowrap">~${Math.ceil(deficitPoints / 2.0)} tín chỉ</span>
                        </li>
                    </ul>
                    <p class="mb-0 mt-2 small text-muted fst-italic">*Giả định bạn đạt 4.0 ở các môn học lại này.</p>
                </div>
                ` : ''}
        </div>
    `;

    // Advanced Scenarios
    if (requiredGPA <= 4.0 && requiredGPA > 0) {
        const suggestions = generateCombinationSuggestions(requiredGPA, creditsToEarn);
        
        html += `
            <div class="px-3 pb-3 bg-white border-top mt-4">
                <div class="pt-3 mb-3 d-flex align-items-center justify-content-between">
                    <p class="small fw-bold text-secondary text-uppercase mb-0 d-flex align-items-center">
                        <i class="bi bi-layers me-2"></i>Các phương án khả thi
                    </p>
                    <span class="badge bg-light text-secondary rounded-pill border">${suggestions.length} tổ hợp</span>
                </div>
                <div class="d-flex flex-column gap-3 overflow-auto pe-1 custom-scrollbar" style="max-height: 400px;">
                    ${suggestions.map(s => `
                        <div class="bg-light rounded-3 p-3 border transition-all">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-white text-dark border shadow-sm text-uppercase">Kết hợp ${s.g1.grade} & ${s.g2.grade}</span>
                            </div>
                            <div class="d-flex gap-2 align-items-stretch">
                                <div class="flex-fill p-2 rounded border bg-white position-relative overflow-hidden">
                                    <div class="position-absolute top-0 start-0 bottom-0 ${getGradeBgSubtle(s.g1.grade)}" style="width: 4px;"></div>
                                    <div class="d-flex justify-content-between align-items-baseline ps-2">
                                        <span class="fw-bold ${getGradeTextColor(s.g1.grade)}">${s.g1.grade}</span>
                                        <span class="small fw-medium text-secondary">${s.c1} TC</span>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center text-muted">
                                    <i class="bi bi-plus-lg small"></i>
                                </div>
                                <div class="flex-fill p-2 rounded border bg-white position-relative overflow-hidden">
                                    <div class="position-absolute top-0 start-0 bottom-0 ${getGradeBgSubtle(s.g2.grade)}" style="width: 4px;"></div>
                                    <div class="d-flex justify-content-between align-items-baseline ps-2">
                                        <span class="fw-bold ${getGradeTextColor(s.g2.grade)}">${s.g2.grade}</span>
                                        <span class="small fw-medium text-secondary">${s.c2} TC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-2 small text-muted text-center fst-italic">Danh sách sắp xếp theo độ ổn định (khoảng cách điểm nhỏ nhất)</div>
            </div>
        `;
    }

    // Add Detailed Algorithm Section
    if (details) {
        html += `
            <div class="mt-4 border-top pt-3">
                <button class="btn btn-light w-100 d-flex align-items-center justify-content-between text-secondary mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#algoDetails" aria-expanded="false" aria-controls="algoDetails">
                    <span class="d-flex align-items-center gap-2">
                        <div class="bg-light text-secondary p-1 rounded transition-colors">
                            <i class="bi bi-calculator"></i>
                        </div>
                        Chi tiết thuật toán tính điểm
                    </span>
                    <i class="bi bi-chevron-down"></i>
                </button>
                <div class="collapse" id="algoDetails">
                    <div class="position-relative ps-3">
                        <div class="position-absolute start-0 top-0 bottom-0 border-start border-2 ms-3" style="z-index: 0;"></div>
                        
                        <!-- Step 1: Target Total Points -->
                        <div class="d-flex gap-3 mb-3 position-relative" style="z-index: 1;">
                            <div class="rounded-circle bg-white border d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 32px; height: 32px;">
                                <span class="small fw-bold text-secondary">1</span>
                            </div>
                            <div class="card flex-grow-1 border shadow-sm">
                                <div class="card-body p-2">
                                    <div class="small text-muted fw-medium mb-1">Tổng điểm hệ 4 cần đạt</div>
                                    <div class="d-flex justify-content-between align-items-end">
                                        <span class="small text-muted">(${details.targetGPA} GPA × ${details.totalFutureCredits} TC)</span>
                                        <span class="fw-bold font-monospace text-dark">${details.targetTotalPoints.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Current Accumulated Points -->
                        <div class="d-flex gap-3 mb-3 position-relative" style="z-index: 1;">
                            <div class="rounded-circle bg-white border d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 32px; height: 32px;">
                                <span class="small fw-bold text-secondary">2</span>
                            </div>
                            <div class="card flex-grow-1 border shadow-sm">
                                <div class="card-body p-2">
                                    <div class="small text-muted fw-medium mb-1">Điểm tích lũy hiện có</div>
                                    <div class="d-flex justify-content-between align-items-end">
                                        <span class="small text-muted">(${details.currentCredits} TC)</span>
                                        <span class="fw-bold font-monospace text-dark">${details.currentTotalPoints.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Retake Deduction (Only if retakes exist) -->
                        ${details.removedPoints > 0 ? `
                        <div class="d-flex gap-3 mb-3 position-relative" style="z-index: 1;">
                            <div class="rounded-circle bg-warning-subtle border border-warning-subtle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 32px; height: 32px;">
                                <span class="small fw-bold text-warning-emphasis">3</span>
                            </div>
                            <div class="flex-grow-1">
                                <div class="card border-warning-subtle bg-warning-subtle mb-2 shadow-sm position-relative overflow-hidden">
                                    <div class="position-absolute top-0 end-0 p-1 bg-warning-subtle rounded-bottom-start">
                                        <i class="bi bi-trash text-warning-emphasis small"></i>
                                    </div>
                                    <div class="card-body p-2">
                                        <div class="small text-warning-emphasis fw-bold mb-1">Trừ điểm các môn học lại</div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="small text-warning-emphasis opacity-75">(${details.retakeCreditsTotal} TC cũ)</span>
                                            <span class="fw-bold font-monospace text-warning-emphasis">- ${details.removedPoints.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card border shadow-sm bg-light">
                                    <div class="card-body p-2">
                                        <div class="small text-secondary fw-medium mb-1">Điểm sàn sau khi trừ</div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="small text-muted">Còn lại</span>
                                            <span class="fw-bold font-monospace text-dark">${details.effectiveCurrentPoints.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Step 4: Final Calculation -->
                        <div class="d-flex gap-3 position-relative" style="z-index: 1;">
                            <div class="rounded-circle bg-primary border-4 border-primary-subtle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 32px; height: 32px;">
                                <span class="small fw-bold text-white">${details.removedPoints > 0 ? '4' : '3'}</span>
                            </div>
                            <div class="card flex-grow-1 bg-primary text-white border-0 shadow">
                                <div class="card-body p-3">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <div class="small text-white-50 text-uppercase fw-bold opacity-75">Điểm cần tích lũy thêm</div>
                                            <div class="h4 font-monospace fw-bold mb-0">${details.pointsNeeded.toFixed(2)}</div>
                                        </div>
                                        <div class="text-end">
                                            <div class="small text-white-50">Tổng tín chỉ học</div>
                                            <div class="fw-bold">${details.creditsToEarn} TC</div>
                                        </div>
                                    </div>
                                    <div class="border-top border-white-50 pt-3 d-flex justify-content-between align-items-center">
                                        <span class="small fw-medium text-white-50">GPA Trung bình cần đạt</span>
                                        <span class="badge bg-white bg-opacity-25 px-2 py-1 rounded font-monospace">${details.pointsNeeded.toFixed(2)} / ${details.creditsToEarn} = ${details.requiredGPA.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    targetResultContainer.innerHTML = html;
    targetResultContainer.classList.remove('justify-content-center', 'align-items-center', 'text-center');
}

function generateCombinationSuggestions(target, totalCredits) {
    const suggestions = [];
    // Filter out F (0.0) and D (1.0) grades, keep only D+ (1.5) and above if desired, 
    // or strictly remove F and D. Based on request "Bỏ các tổ hợp với điểm F và D".
    // Assuming D+ is acceptable? Or just remove grades < 1.5?
    // Let's remove grades with GPA <= 1.0 (F=0, D=1). D+ is 1.5.
    const grades = [...GRADE_SCALE]
        .filter(g => g.gpa > 1.0) 
        .sort((a, b) => b.gpa - a.gpa); // Descending GPA

    // Iterate all pairs (G1, G2) with G1 > G2 (Strictly distinct grades)
    for (let i = 0; i < grades.length; i++) {
        for (let j = i + 1; j < grades.length; j++) {
            const g1 = grades[i];
            const g2 = grades[j];

            // Case 2: g1.gpa != g2.gpa
            // We want x * g1 + (C - x) * g2 >= target * C
            // x * (g1 - g2) >= C * (target - g2)
            const numerator = totalCredits * (target - g2.gpa);
            const denominator = g1.gpa - g2.gpa;
            
            let minX = Math.ceil(numerator / denominator);
            
            // Clamp minX
            if (minX < 0) minX = 0;
            
            // If minX > totalCredits, this pair cannot achieve the target
            if (minX > totalCredits) continue;

            // If minX is valid, we have a solution: x = minX, y = totalCredits - minX
            const x = minX;
            const y = totalCredits - x;
            const avg = (x * g1.gpa + y * g2.gpa) / totalCredits;

            suggestions.push({
                g1: g1,
                c1: x,
                g2: g2,
                c2: y,
                avg: avg,
                gap: Math.abs(g1.gpa - g2.gpa)
            });
        }
    }

    // Filter duplicates and normalize
    const uniqueSuggestions = [];
    const seen = new Set();

    suggestions.forEach(s => {
        let key = '';
        if (s.c1 === totalCredits) {
            key = `${s.g1.grade}:${s.c1}`;
        } else if (s.c2 === totalCredits) {
            key = `${s.g2.grade}:${s.c2}`;
        } else {
            key = `${s.g1.grade}:${s.c1}|${s.g2.grade}:${s.c2}`;
        }

        if (!seen.has(key)) {
            seen.add(key);
            uniqueSuggestions.push(s);
        }
    });

    // Sort by gap (stability) ascending
    uniqueSuggestions.sort((a, b) => a.gap - b.gap);

    return uniqueSuggestions;
}

function getGradeColor(grade) {
    if (grade.startsWith('A')) return 'bg-success';
    if (grade.startsWith('B')) return 'bg-primary';
    if (grade.startsWith('C')) return 'bg-info';
    if (grade.startsWith('D')) return 'bg-warning';
    return 'bg-danger';
}

function getGradeBadge(grade) {
    if (grade.startsWith('A')) return 'bg-success';
    if (grade.startsWith('B')) return 'bg-primary';
    if (grade.startsWith('C')) return 'bg-info text-dark';
    if (grade.startsWith('D')) return 'bg-warning text-dark';
    return 'bg-danger';
}

function getGradeTextColor(grade) {
    if (grade.startsWith('A')) return 'text-success';
    if (grade.startsWith('B')) return 'text-primary';
    if (grade.startsWith('C')) return 'text-info';
    if (grade.startsWith('D')) return 'text-warning';
    return 'text-danger';
}

function getGradeBgSubtle(grade) {
    if (grade.startsWith('A')) return 'bg-success-subtle';
    if (grade.startsWith('B')) return 'bg-primary-subtle';
    if (grade.startsWith('C')) return 'bg-info-subtle';
    if (grade.startsWith('D')) return 'bg-warning-subtle';
    return 'bg-danger-subtle';
}

// ==========================================
// TAB: TÍNH ĐIỂM MÔN HỌC (COURSE GRADE)
// ==========================================

const courseRatioGroup = document.getElementById('course-ratio-group');
const processScoreRange = document.getElementById('process-score-range');
const processScoreInput = document.getElementById('process-score-input');
const accumulatedScoreDisplay = document.getElementById('accumulated-score');
const courseGradeResults = document.getElementById('course-grade-results');

function initCourseGradeTab() {
    if (!processScoreInput) return; // Guard clause if elements missing
    
    loadCourseState();
    setupCourseEventListeners();
    calculateAndRenderCourseGrade();
}

function setupCourseEventListeners() {
    // Ratio buttons
    const radioButtons = document.querySelectorAll('input[name="btnradio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            calculateAndRenderCourseGrade();
            saveCourseState();
        });
    });

    // Range and Number sync
    processScoreRange.addEventListener('input', (e) => {
        processScoreInput.value = e.target.value;
        calculateAndRenderCourseGrade();
        saveCourseState();
    });

    processScoreInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        // Clamp value between 0 and 10
        if (val > 10) val = 10;
        if (val < 0) val = 0;
        
        // Only update range if valid number
        if (!isNaN(val)) {
            processScoreRange.value = val;
            calculateAndRenderCourseGrade();
            saveCourseState();
        }
    });
}

function calculateAndRenderCourseGrade() {
    // 1. Get Ratio
    const selectedRadio = document.querySelector('input[name="btnradio"]:checked');
    const processWeight = parseFloat(selectedRadio ? selectedRadio.value : 0.4);
    const finalWeight = 1 - processWeight;

    // 2. Get Process Score
    let processScore = parseFloat(processScoreInput.value);
    if (isNaN(processScore)) processScore = 0;

    // 3. Calculate Accumulated Score
    const accumulated = processScore * processWeight;
    accumulatedScoreDisplay.textContent = accumulated.toFixed(2);

    // 4. Calculate Requirements for each Grade
    const resultsHTML = GRADE_SCALE.map(grade => {
        // Formula: Final = (Target - Process*Weight) / FinalWeight
        // Target is grade.min
        const targetScore = grade.min;
        let requiredFinal = (targetScore - accumulated) / finalWeight;
        
        // Formatting Logic
        let statusClass = '';
        let progressColor = '';
        let message = '';
        let progressPercent = 0;
        let badgeColor = 'bg-secondary';

        // Determine Badge Color based on Grade
        if (grade.grade.startsWith('A')) badgeColor = 'bg-success';
        else if (grade.grade.startsWith('B')) badgeColor = 'bg-primary';
        else if (grade.grade.startsWith('C')) badgeColor = 'bg-info text-dark';
        else if (grade.grade.startsWith('D')) badgeColor = 'bg-warning text-dark';
        else badgeColor = 'bg-danger';

        if (requiredFinal <= 0) {
            // Already achieved
            requiredFinal = 0;
            if (grade.gpa === 0) {
                message = `<span class="text-danger fw-bold small"><i class="bi bi-x-circle-fill me-1"></i>Rớt</span>`;
                statusClass = 'bg-danger-subtle border-danger-subtle';
                progressColor = 'bg-danger';
            } else {
                message = `<span class="text-success fw-bold small"><i class="bi bi-check-circle-fill me-1"></i>Đạt</span>`;
                statusClass = 'bg-success-subtle border-success-subtle'; // Light green background
                progressColor = 'bg-success';
            }
            progressPercent = 100;
        } else if (requiredFinal > 10) {
            // Impossible
            message = `<span class="text-muted small">Không thể (>10)</span>`;
            statusClass = 'bg-light opacity-75 border-light'; // Grayed out
            progressColor = 'bg-secondary';
            progressPercent = 0;
        } else {
            // Possible
            message = `<div class="d-flex align-items-baseline"><span class="text-muted small me-2">Cần:</span><strong class="fs-5 text-dark">${requiredFinal.toFixed(2)}</strong></div>`;
            statusClass = 'bg-white border-light-subtle shadow-sm';
            
            // Color logic based on difficulty (Required Score)
            if (requiredFinal < 5) {
                progressColor = 'bg-success';
            } else if (requiredFinal < 7) {
                progressColor = 'bg-info';
            } else if (requiredFinal < 8.5) {
                progressColor = 'bg-warning';
            } else {
                progressColor = 'bg-danger';
            }
            
            progressPercent = (requiredFinal / 10) * 100;
        }

        return `
            <div class="p-3 rounded-3 border ${statusClass} mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm ${badgeColor} me-3" 
                             style="width: 40px; height: 40px; font-size: 1rem;">
                            ${grade.grade}
                        </div>
                        <div class="d-flex flex-column">
                            <span class="fw-bold text-dark small">GPA ${grade.gpa}</span>
                            <span class="text-muted" style="font-size: 0.7rem;">${grade.min} - ${grade.max}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        ${message}
                    </div>
                </div>
                ${requiredFinal <= 10 && requiredFinal > 0 ? `
                <div class="progress mt-2" style="height: 4px; background-color: #f0f0f0;">
                    <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${progressPercent}%" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');

    courseGradeResults.innerHTML = resultsHTML;
}

function saveCourseState() {
    const state = {
        ratio: document.querySelector('input[name="btnradio"]:checked')?.value,
        processScore: processScoreInput.value
    };
    localStorage.setItem('courseGradeState', JSON.stringify(state));
}

function loadCourseState() {
    const saved = localStorage.getItem('courseGradeState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            if (state.ratio) {
                const radio = document.querySelector(`input[name="btnradio"][value="${state.ratio}"]`);
                if (radio) radio.checked = true;
            }
            if (state.processScore !== undefined) {
                processScoreInput.value = state.processScore;
                processScoreRange.value = state.processScore;
            }
        } catch (e) {
            console.error("Error loading state", e);
        }
    } else {
        // Defaults
        processScoreInput.value = 7.0;
        processScoreRange.value = 7.0;
    }
}