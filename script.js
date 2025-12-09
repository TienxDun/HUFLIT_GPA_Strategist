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
    initContactButton();
    initThemeToggle();
    initUserGuide();
    fetchVisitCount();

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
        let rowClass = '';

        if (item.grade.startsWith('A')) { badgeColor = 'bg-success'; rank = 'Xuất sắc'; rowClass = 'table-success'; }
        else if (item.grade.startsWith('B')) { badgeColor = 'bg-primary'; rank = 'Giỏi'; }
        else if (item.grade.startsWith('C')) { badgeColor = 'bg-info text-dark'; rank = 'Khá'; }
        else if (item.grade.startsWith('D')) { badgeColor = 'bg-warning text-dark'; rank = 'Trung bình'; }
        else { badgeColor = 'bg-danger'; rank = 'Kém'; rowClass = 'table-danger'; }

        // Modern, minimal row design
        return `
            <tr class="align-middle">
                <td class="ps-3 py-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-4 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm ${badgeColor}" 
                             style="width: 40px; height: 40px; font-size: 1.1rem;">
                            ${item.grade}
                        </div>
                        <div class="d-flex flex-column">
                            <span class="small text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">Thang 10</span>
                            <span class="fw-bold text-dark">${item.min.toFixed(1)} - ${item.max.toFixed(1)}</span>
                        </div>
                    </div>
                </td>
                <td class="text-end pe-3">
                    <div class="d-flex flex-column align-items-end">
                        <span class="small text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">GPA (Hệ 4)</span>
                        <span class="fw-bold text-primary fs-5">${item.gpa.toFixed(1)}</span>
                    </div>
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

    // Apply Manual Data to Target Tab
    const applyBtn = document.getElementById('apply-manual-to-target-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const gpa = manualGpaDisplay.textContent;
            const credits = manualCreditsDisplay.textContent;

            const targetGpaInput = document.getElementById('current-gpa');
            const targetCreditsInput = document.getElementById('current-credits');
            const goalGpaInput = document.getElementById('target-gpa');

            if (targetGpaInput && targetCreditsInput) {
                targetGpaInput.value = gpa;
                targetCreditsInput.value = credits;

                // Auto-suggest Target GPA
                if (goalGpaInput) {
                    const currentGpaVal = parseFloat(gpa);
                    let suggestedTarget = '';
                    
                    if (currentGpaVal < 2.0) suggestedTarget = '2.0';
                    else if (currentGpaVal < 2.5) suggestedTarget = '2.5';
                    else if (currentGpaVal < 3.2) suggestedTarget = '3.2';
                    else if (currentGpaVal < 3.6) suggestedTarget = '3.6';
                    else suggestedTarget = '4.0';

                    goalGpaInput.value = suggestedTarget;
                    goalGpaInput.classList.add('is-valid');
                    setTimeout(() => goalGpaInput.classList.remove('is-valid'), 2000);
                }

                // Switch to Tab 1
                const targetTabBtn = document.querySelector('button[data-bs-target="#pills-target"]');
                if (targetTabBtn) {
                    const tab = bootstrap.Tab.getOrCreateInstance(targetTabBtn);
                    tab.show();
                }
                
                // Highlight inputs
                targetGpaInput.classList.add('is-valid');
                targetCreditsInput.classList.add('is-valid');
                
                // Focus on New Credits Input (or Total Credits if active)
                const newCreditsInput = document.getElementById('new-credits');
                const totalCreditsInput = document.getElementById('total-credits');
                
                // Check which mode is active (New Credits is default visible)
                if (newCreditsInput && newCreditsInput.offsetParent !== null) {
                    newCreditsInput.focus();
                    newCreditsInput.select(); // Select content if any
                } else if (totalCreditsInput) {
                    totalCreditsInput.focus();
                    totalCreditsInput.select();
                }

                setTimeout(() => {
                    targetGpaInput.classList.remove('is-valid');
                    targetCreditsInput.classList.remove('is-valid');
                }, 2000);
            }
        });
    }

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
            
            const semId = confirmBtn.dataset.id;
            deleteManualSemester(semId);
            return;
        }

        // Add Course
        if (target.closest('.add-course-btn')) {
            const semId = target.closest('.add-course-btn').dataset.id;
            addManualCourse(semId);
        }

        // Delete Course
        if (target.closest('.delete-course-btn')) {
            const semId = target.closest('.delete-course-btn').dataset.semId;
            const courseId = target.closest('.delete-course-btn').dataset.courseId;
            deleteManualCourse(semId, courseId);
        }
    });

    manualSemesterList.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('manual-input')) {
            const semId = target.dataset.semId;
            const courseId = target.dataset.courseId;
            const field = target.dataset.field;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            
            // Visual feedback for grade
            if (field === 'grade') {
                if (value === '') {
                    target.classList.add('border-warning', 'bg-warning-subtle');
                } else {
                    target.classList.remove('border-warning', 'bg-warning-subtle');
                }
            }

            updateManualCourse(semId, courseId, field, value);
        }
    });

    // Add input event listener for real-time updates
    manualSemesterList.addEventListener('input', (e) => {
        const target = e.target;
        if (target.classList.contains('manual-input') && target.dataset.field === 'credits') {
            const semId = target.dataset.semId;
            const courseId = target.dataset.courseId;
            const value = target.value;
            
            // Update credits and GPA in real-time
            const semester = manualSemesters.find(s => String(s.id) === String(semId));
            if (semester) {
                const course = semester.courses.find(c => String(c.id) === String(courseId));
                if (course) {
                    course.credits = parseFloat(value) || 0;
                    updateSemesterStats(semId);
                }
            }
        }
    });
}

function addManualSemester() {
    const id = Date.now().toString();
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
    manualSemesters = manualSemesters.filter(s => String(s.id) !== String(id));
    
    // Re-index semester names to ensure sequential order
    manualSemesters.forEach((sem, index) => {
        // Only rename if it matches default pattern "Học kỳ X"
        if (sem.name.startsWith('Học kỳ ')) {
            sem.name = `Học kỳ ${index + 1}`;
        }
    });

    saveManualState();
    renderManualSemesters();
    calculateManualGPA();
}

function addManualCourse(semId) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        semester.courses.push({
            id: Date.now().toString(),
            name: '',
            credits: 3,
            grade: 'A',
            isRetake: false,
            oldGrade: 'D'
        });
        saveManualState();
        renderManualSemesters();
        calculateManualGPA();
    }
}

function deleteManualCourse(semId, courseId) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        semester.courses = semester.courses.filter(c => String(c.id) !== String(courseId));
        saveManualState();
        renderManualSemesters();
        calculateManualGPA();
    }
}

function updateSemesterStats(semId) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        const semTotalCredits = semester.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        
        let semGpaPoints = 0;
        let semGpaCredits = 0;
        
        semester.courses.forEach(c => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            if (gradeInfo) {
                const gpa = gradeInfo.gpa;
                const credits = parseFloat(c.credits) || 0;
                semGpaPoints += gpa * credits;
                semGpaCredits += credits;
            }
        });

        const semGPA = semGpaCredits > 0 ? (semGpaPoints / semGpaCredits).toFixed(2) : '0.00';
        
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
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        let semGpaPoints = 0;
        let semGpaCredits = 0;
        
        semester.courses.forEach(c => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            if (gradeInfo) {
                const gpa = gradeInfo.gpa;
                const credits = parseFloat(c.credits) || 0;
                semGpaPoints += gpa * credits;
                semGpaCredits += credits;
            }
        });

        const semGPA = semGpaCredits > 0 ? (semGpaPoints / semGpaCredits).toFixed(2) : '0.00';
        
        // Update GPA badge
        const gpaBadge = document.querySelector(`.semester-gpa[data-sem-id="${semId}"]`);
        if (gpaBadge) {
            gpaBadge.textContent = `GPA ${semGPA}`;
        }
    }
}

function updateManualCourse(semId, courseId, field, value) {
    const semester = manualSemesters.find(s => String(s.id) === String(semId));
    if (semester) {
        const course = semester.courses.find(c => String(c.id) === String(courseId));
        if (course) {
            course[field] = value;
            
            // If toggling Retake ON, ensure oldGrade is set to D if it's missing or empty
            if (field === 'isRetake' && value === true) {
                if (!course.oldGrade) {
                    course.oldGrade = 'D';
                }
            }

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
            
            // Re-render if toggling retake to show/hide old grade select
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
    
    console.log("--- Manual GPA Calculation ---");
    console.log("Initial State:", { initialGPA, initialCredits });
    console.log("Semesters:", manualSemesters.length);
    console.log("Result:", { totalPoints, totalCredits, gpa });

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
    // Pre-calculate cumulative GPA for each semester
    let runningTotalPoints = (parseFloat(manualInitialGpaInput.value) || 0) * (parseFloat(manualInitialCreditsInput.value) || 0);
    let runningTotalCredits = parseFloat(manualInitialCreditsInput.value) || 0;

    const semesterCumulativeGPAs = manualSemesters.map(sem => {
        sem.courses.forEach(course => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(course.credits) || 0;

            // Add current course
            runningTotalPoints += gpa * credits;
            if (gpa > 0) {
                runningTotalCredits += credits;
            }

            // Handle Retake Logic
            if (course.isRetake) {
                const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
                const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;
                
                // Subtract old course effect
                runningTotalPoints -= oldGpa * credits;
                if (oldGpa > 0) {
                    runningTotalCredits -= credits;
                }
            }
        });

        const cumGPA = runningTotalCredits > 0 ? (runningTotalPoints / runningTotalCredits).toFixed(2) : '0.00';
        return cumGPA;
    });

    manualSemesterList.innerHTML = manualSemesters.map((sem, index) => {
        const semTotalCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        
        // Calculate Semester GPA (excluding ungraded and F grades to match Global GPA logic)
        let semGpaPoints = 0;
        let semGpaCredits = 0;
        
        sem.courses.forEach(c => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(c.credits) || 0;
            
            if (gradeInfo) {
                semGpaPoints += gpa * credits;
                semGpaCredits += credits;
            }
        });
        
        const semGPA = semGpaCredits > 0 ? (semGpaPoints / semGpaCredits).toFixed(2) : '0.00';
        const cumGPA = semesterCumulativeGPAs[index];
        
        return `
        <div class="card shadow-sm mb-3">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
                    <span class="fw-bold">${sem.name}</span>
                    <div class="d-flex gap-2 flex-wrap">
                        <span class="badge bg-light text-secondary border semester-total-credits" data-sem-id="${sem.id}">${semTotalCredits} TC</span>
                        <span class="badge bg-primary text-white border semester-gpa" data-sem-id="${sem.id}">GPA ${semGPA}</span>
                        <span class="badge bg-success text-white border semester-cum-gpa" data-sem-id="${sem.id}" title="GPA Tích lũy">GPA tích lũy ${cumGPA}</span>
                    </div>
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
                                            <button class="btn btn-outline-secondary px-1" type="button" onclick="adjustManualCredit('${sem.id}', '${course.id}', -1)">-</button>
                                            <input type="number" class="form-control form-control-sm manual-input text-center px-0" 
                                                value="${course.credits}" min="0" readonly
                                                data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="credits">
                                            <button class="btn btn-outline-secondary px-1" type="button" onclick="adjustManualCredit('${sem.id}', '${course.id}', 1)">+</button>
                                        </div>
                                    </td>
                                    <td>
                                        <select class="form-select form-select-sm manual-input ${course.grade === '' ? 'border-warning bg-warning-subtle' : ''}"
                                            data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="grade">
                                            <option value="" ${course.grade === '' ? 'selected' : ''}>--</option>
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
const totalCreditsInput = document.getElementById('total-credits'); // New
const newCreditsGroup = document.getElementById('new-credits-group'); // New
const totalCreditsGroup = document.getElementById('total-credits-group'); // New
const btnSwitchToTotal = document.getElementById('btn-switch-to-total'); // New
const btnSwitchToNew = document.getElementById('btn-switch-to-new'); // New

const retakeToggle = document.getElementById('retake-toggle');
const retakeArea = document.getElementById('retake-area');
const retakeList = document.getElementById('retake-list');
const addRetakeBtn = document.getElementById('add-retake-btn');
const calcTargetBtn = document.getElementById('calc-target-btn');
const targetResultContainer = document.getElementById('target-result-container');

let creditMode = 'new'; // 'new' or 'total'

function initTargetGPATab() {
    if (!calcTargetBtn) return;

    loadTargetState();

    // Input Listeners for Auto-Save
    [currentGpaInput, currentCreditsInput, targetGpaInput, newCreditsInput, totalCreditsInput].forEach(input => {
        if(input) input.addEventListener('input', saveTargetState);
    });

    // Sync Logic
    if (totalCreditsInput && newCreditsInput && currentCreditsInput) {
        // When Total Credits changes -> Update New Credits
        totalCreditsInput.addEventListener('input', () => {
            const total = parseFloat(totalCreditsInput.value) || 0;
            const current = parseFloat(currentCreditsInput.value) || 0;
            newCreditsInput.value = Math.max(0, total - current);
        });

        // When New Credits changes -> Update Total Credits
        newCreditsInput.addEventListener('input', () => {
            const newCred = parseFloat(newCreditsInput.value) || 0;
            const current = parseFloat(currentCreditsInput.value) || 0;
            totalCreditsInput.value = current + newCred;
        });

        // When Current Credits changes -> Update dependent field based on mode
        currentCreditsInput.addEventListener('input', () => {
            const current = parseFloat(currentCreditsInput.value) || 0;
            if (creditMode === 'total') {
                // If in Total mode, Total is fixed, New changes
                const total = parseFloat(totalCreditsInput.value) || 0;
                newCreditsInput.value = Math.max(0, total - current);
            } else {
                // If in New mode, New is fixed, Total changes
                const newCred = parseFloat(newCreditsInput.value) || 0;
                totalCreditsInput.value = current + newCred;
            }
        });
    }

    // Toggle Mode
    if (btnSwitchToTotal) {
        btnSwitchToTotal.addEventListener('click', () => setCreditMode('total'));
    }
    if (btnSwitchToNew) {
        btnSwitchToNew.addEventListener('click', () => setCreditMode('new'));
    }

    // Toggle Retake Area
    retakeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            retakeArea.classList.remove('d-none');
            // Add default item if list is empty
            if (retakeList.children.length === 0) {
                addRetakeItem();
            }
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
    
    // Default to Grade D (1.0) if not saved data
    const dGrade = GRADE_SCALE.find(g => g.grade === 'D');
    const defaultD_GPA = dGrade ? dGrade.gpa : 1.0;
    const defaultGrade = savedData ? savedData.oldGrade : defaultD_GPA;
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

function setCreditMode(mode) {
    creditMode = mode;
    if (mode === 'total') {
        newCreditsGroup.classList.add('d-none');
        totalCreditsGroup.classList.remove('d-none');
        // Sync value just in case
        const current = parseFloat(currentCreditsInput.value) || 0;
        const newCred = parseFloat(newCreditsInput.value) || 0;
        if (!totalCreditsInput.value) totalCreditsInput.value = current + newCred;
    } else {
        totalCreditsGroup.classList.add('d-none');
        newCreditsGroup.classList.remove('d-none');
        // Sync value just in case
        const current = parseFloat(currentCreditsInput.value) || 0;
        const total = parseFloat(totalCreditsInput.value) || 0;
        if (!newCreditsInput.value) newCreditsInput.value = Math.max(0, total - current);
    }
    saveTargetState();
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
        totalCredits: totalCreditsInput ? totalCreditsInput.value : '',
        creditMode: creditMode,
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
            if (currentGpaInput) currentGpaInput.value = state.currentGpa || '';
            if (currentCreditsInput) currentCreditsInput.value = state.currentCredits || '';
            if (targetGpaInput) targetGpaInput.value = state.targetGpa || '';
            if (newCreditsInput) newCreditsInput.value = state.newCredits || '';
            if (totalCreditsInput) totalCreditsInput.value = state.totalCredits || '';
            
            // Restore Mode
            if (state.creditMode) {
                setCreditMode(state.creditMode);
            } else {
                setCreditMode('new'); // Default
            }

            if (retakeToggle) {
                retakeToggle.checked = state.isRetake || false;
                if (state.isRetake) {
                    if (retakeArea) retakeArea.classList.remove('d-none');
                    if (retakeList) {
                        retakeList.innerHTML = '';
                        if (state.retakes && Array.isArray(state.retakes)) {
                            state.retakes.forEach(r => addRetakeItem(r));
                        }
                    }
                } else {
                    if (retakeArea) retakeArea.classList.add('d-none');
                }
            }
        } catch (e) {
            console.error("Error loading target state", e);
        }
    }
}

function generateRetakeSuggestions(deficitPoints, targetGPA) {
    // 1. Gather all valid candidates from manualSemesters
    const candidates = [];
    
    // Get IDs of courses currently in the Retake List to exclude them
    const existingRetakeIds = new Set();
    if (retakeList) {
        Array.from(retakeList.children).forEach(item => {
            // Try to find if this item corresponds to a real course
            // The current UI doesn't strictly link them, but let's assume we want to suggest *new* things.
            // If the user manually added a retake, we might not know which course it is.
            // But we can try to match by name if possible, or just ignore for now.
            // A better approach: The user sees the suggestion and adds it.
        });
    }

    manualSemesters.forEach(sem => {
        sem.courses.forEach(course => {
            // Skip if grade is A or A+ (GPA 4.0)
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            if (!gradeInfo || gradeInfo.gpa >= 4.0) return;
            
            // Skip if ignored (name contains *)
            if (course.name && course.name.includes('*')) return;

            const currentGPA = gradeInfo.gpa;
            const credits = parseFloat(course.credits) || 0;
            
            // Skip if credits < 2 (Minimum credits requirement)
            // Use strict comparison and ensure it's a number
            if (credits < 2.0) return;

            // Calculate Potential Gain
            // If Passed (GPA > 0): Gain = (4.0 - CurrentGPA) * Credits
            // If Failed (GPA == 0): Gain = (4.0 - TargetGPA) * Credits
            
            let gain = 0;
            if (currentGPA > 0) {
                gain = (4.0 - currentGPA) * credits;
            } else {
                gain = (4.0 - targetGPA) * credits;
            }
            
            candidates.push({
                ...course,
                semName: sem.name,
                currentGPA,
                gain
            });
        });
    });

    // 2. Find Combinations
    const suggestions = [];
    
    // Filter candidates again to be absolutely sure we don't include < 2 credits
    // Double check parsing and value
    const validCandidates = candidates.filter(c => {
        const creds = parseFloat(c.credits);
        return !isNaN(creds) && creds >= 2.0;
    });

    // Sort by gain descending to optimize search
    validCandidates.sort((a, b) => b.gain - a.gain);
    
    // A. Single Courses
    for (const c of validCandidates) {
        if (c.gain >= deficitPoints) {
            suggestions.push({
                courses: [c],
                totalGain: c.gain,
                totalCredits: parseFloat(c.credits)
            });
        }
    }
    
    // B. Pairs (Limit to top 50 candidates)
    const topCandidates = validCandidates.slice(0, 50);
    for (let i = 0; i < topCandidates.length; i++) {
        for (let j = i + 1; j < topCandidates.length; j++) {
            const c1 = topCandidates[i];
            const c2 = topCandidates[j];
            
            // Avoid suggesting same course twice (shouldn't happen as IDs are unique, but good to be safe)
            if (c1.id === c2.id) continue;

            // Double check credits again just to be paranoid
            if (parseFloat(c1.credits) < 2.0 || parseFloat(c2.credits) < 2.0) continue;

            const pairGain = c1.gain + c2.gain;
            
            if (pairGain >= deficitPoints) {
                suggestions.push({
                    courses: [c1, c2],
                    totalGain: pairGain,
                    totalCredits: parseFloat(c1.credits) + parseFloat(c2.credits)
                });
            }
        }
    }
    
    // 3. Sort and Filter Suggestions
    // Sort by: 
    // 1. Number of courses (asc)
    // 2. Total credits (asc)
    // 3. Total Gain (desc)
    
    suggestions.sort((a, b) => {
        if (a.courses.length !== b.courses.length) return a.courses.length - b.courses.length;
        if (a.totalCredits !== b.totalCredits) return a.totalCredits - b.totalCredits;
        return b.totalGain - a.totalGain;
    });
    
    // Return top 5 unique suggestions
    return suggestions.slice(0, 5);
}

function calculateTargetGPA() {
    // 1. Get Inputs
    // Ensure we parse values correctly, handling potential empty strings from restored state
    const currentGPA = parseFloat(currentGpaInput.value) || 0;
    const currentCredits = parseFloat(currentCreditsInput.value) || 0;
    const targetGPA = parseFloat(targetGpaInput.value) || 0;
    
    // Handle New Credits based on mode
    let newCredits = 0;
    if (creditMode === 'total') {
        const total = parseFloat(totalCreditsInput.value) || 0;
        newCredits = Math.max(0, total - currentCredits);
        // Update the hidden input for consistency
        if (newCreditsInput) newCreditsInput.value = newCredits;
    } else {
        newCredits = parseFloat(newCreditsInput.value) || 0;
    }

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
    // Note: According to user, F grade is not recorded in the previous cumulative GPA.
    // So we treat it as if it wasn't there.
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
    let suggestions = [];
    if (requiredGPA > 4.0 && deficitPoints > 0) {
        suggestions = generateRetakeSuggestions(deficitPoints, targetGPA);
    }

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
        retakeCreditsTotal,
        suggestions
    };

    console.log("--- Target GPA Calculation ---");
    console.log("Inputs:", { currentGPA, currentCredits, targetGPA, newCredits, creditMode });
    console.log("Retakes:", { removedPoints, retakeCreditsTotal, retakeCreditsFromF });
    console.log("Calculation:", { 
        currentTotalPoints, 
        effectiveCurrentPoints, 
        totalFutureCredits, 
        targetTotalPoints, 
        pointsNeeded, 
        creditsToEarn, 
        requiredGPA 
    });

    renderTargetResult(requiredGPA, creditsToEarn, deficitPoints, details);
}

function renderTargetResult(requiredGPA, creditsToEarn, deficitPoints = 0, details = null) {
    let html = '';
    let bgClass = '';
    let textClass = '';
    let icon = '';
    let message = '';

    // Handle case where calculation is impossible due to 0 credits
    if (requiredGPA >= 999 && creditsToEarn <= 0) {
        html = `
            <div class="text-center mb-4 w-100">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger text-white shadow-sm mb-3" style="width: 60px; height: 60px;">
                    <i class="bi bi-x-lg fs-2"></i>
                </div>
                <h6 class="text-uppercase text-secondary fw-bold small letter-spacing-1 mb-2">Không thể tính toán</h6>
                <div class="fs-5 fw-bold text-danger mb-2">Cần thêm tín chỉ</div>
                <p class="text-muted fw-medium mb-0 px-3">Bạn cần nhập thêm <b>tín chỉ mới</b> hoặc chọn <b>học cải thiện</b> để có thể thay đổi GPA.</p>
                <div class="mt-3">
                    <span class="badge rounded-pill bg-danger-subtle text-danger-emphasis px-3 py-2 border border-danger-subtle">
                        Không có tín chỉ để tính điểm
                    </span>
                </div>
            </div>`;
        
        if (targetResultContainer) {
            targetResultContainer.innerHTML = html;
            targetResultContainer.classList.remove('d-none');
        }
        return;
    }

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
                
                ${(details && details.suggestions && details.suggestions.length > 0) ? `
                    <div class="d-flex flex-column gap-2 mt-3">
                        ${details.suggestions.map((s, idx) => `
                            <div class="bg-white rounded p-2 border shadow-sm">
                                <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                                    <span class="badge bg-light text-dark border">Phương án ${idx + 1}</span>
                                    <span class="small fw-bold text-success">+${s.totalGain.toFixed(2)} điểm</span>
                                </div>
                                ${s.courses.map(c => {
                                    let badgeClass = 'bg-secondary';
                                    if (c.grade.startsWith('F')) badgeClass = 'bg-danger';
                                    else if (c.grade.startsWith('D')) badgeClass = 'bg-warning text-dark';
                                    else if (c.grade.startsWith('C')) badgeClass = 'bg-info text-dark';
                                    else if (c.grade.startsWith('B')) badgeClass = 'bg-primary';
                                    
                                    return `
                                    <div class="d-flex justify-content-between align-items-center small text-muted py-1">
                                        <div class="d-flex flex-column">
                                            <span class="fw-medium text-dark text-truncate" style="max-width: 180px;">${c.name || 'Môn học'}</span>
                                            <span class="text-secondary" style="font-size: 0.85em;">${c.credits} TC</span>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge ${badgeClass} rounded-pill" style="min-width: 40px;">${c.grade}</span>
                                            <i class="bi bi-arrow-right text-secondary" style="font-size: 0.8em;"></i>
                                            <span class="badge bg-success rounded-pill" style="min-width: 40px;">A</span>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                    <p class="mb-0 mt-2 small text-muted fst-italic text-center">Chọn một trong các phương án trên để học cải thiện.</p>
                ` : `
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
                `}
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
                    ${suggestions.map(s => {
                        const totalPoints = (s.c1 * s.g1.gpa + s.c2 * s.g2.gpa).toFixed(2);
                        const needed = details ? details.pointsNeeded.toFixed(2) : '0.00';
                        
                        return `
                        <div class="bg-light rounded-3 p-3 border transition-all">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-white text-dark border shadow-sm text-uppercase">Kết hợp ${s.g1.grade} & ${s.g2.grade}</span>
                                <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle" title="Tổng điểm đạt được / Điểm cần thiết">
                                    ${totalPoints} / ${needed} điểm
                                </span>
                            </div>
                            <div class="d-flex gap-2 align-items-stretch">
                                <div class="flex-grow-1 p-2 rounded border bg-white position-relative overflow-hidden" style="flex-basis: 0;">
                                    <div class="position-absolute top-0 start-0 bottom-0 ${getGradeBgSubtle(s.g1.grade)}" style="width: 4px;"></div>
                                    <div class="d-flex justify-content-between align-items-baseline ps-2">
                                        <span class="fw-bold ${getGradeTextColor(s.g1.grade)}">${s.g1.grade}</span>
                                        <span class="small fw-medium text-secondary">${s.c1} TC</span>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center text-muted">
                                    <i class="bi bi-plus-lg small"></i>
                                </div>
                                <div class="flex-grow-1 p-2 rounded border bg-white position-relative overflow-hidden" style="flex-basis: 0;">
                                    <div class="position-absolute top-0 start-0 bottom-0 ${getGradeBgSubtle(s.g2.grade)}" style="width: 4px;"></div>
                                    <div class="d-flex justify-content-between align-items-baseline ps-2">
                                        <span class="fw-bold ${getGradeTextColor(s.g2.grade)}">${s.g2.grade}</span>
                                        <span class="small fw-medium text-secondary">${s.c2} TC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
                <div class="mt-2 small text-muted text-center fst-italic">Danh sách sắp xếp theo độ sát với mục tiêu (từ thấp đến cao)</div>
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
                    <div class="position-relative">
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

            // Filter out solutions where any component has < 2 credits (unless it's 0)
            if ((x > 0 && x < 2) || (y > 0 && y < 2)) continue;

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

    // Sort by closeness to target (avg - target) ascending, then by gap (stability) ascending
    uniqueSuggestions.sort((a, b) => {
        const diffA = a.avg - target;
        const diffB = b.avg - target;
        
        // Use a small epsilon for float comparison if needed, but simple subtraction works for sorting
        if (Math.abs(diffA - diffB) > 0.0001) {
            return diffA - diffB;
        }
        return a.gap - b.gap;
    });

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
                <div class="progress mt-2" style="height: 4px;">
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

// ==========================================
// IMPORT PORTAL DATA
// ==========================================

// Use event delegation or ensure element exists before adding listener
// Moving this inside initManualCalcTab or checking existence is safer
const processImportBtn = document.getElementById('process-import-btn');
if (processImportBtn) {
    processImportBtn.addEventListener('click', () => {
        const text = document.getElementById('import-text-area').value;
        if (!text.trim()) {
            alert('Vui lòng dán nội dung bảng điểm vào ô trống.');
            return;
        }

        const importedSemesters = parsePortalText(text);
        
        if (importedSemesters.length === 0) {
            alert('Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại định dạng copy.');
            return;
        }

        // Clear existing data before importing
        manualSemesters = [];
        if (manualInitialGpaInput) manualInitialGpaInput.value = '';
        if (manualInitialCreditsInput) manualInitialCreditsInput.value = '';

        // Add imported semesters to manualSemesters
        let addedCount = 0;
        importedSemesters.forEach(sem => {
            if (sem.courses.length > 0) {
                // Use string ID for consistency
                const newSemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                
                // Map courses to internal format
                const courses = sem.courses.map(c => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: c.name,
                    credits: parseFloat(c.credits) || 0, // Ensure credits is a number
                    grade: c.grade,
                    isRetake: c.isRetake || false,
                    oldGrade: c.oldGrade || 'D'
                }));

                manualSemesters.push({
                    id: newSemId,
                    name: sem.name,
                    courses: courses
                });
                addedCount += courses.length;
            }
        });

        saveManualState();
        renderManualSemesters();
        calculateManualGPA();

        // Remove focus from button to prevent ARIA error
        processImportBtn.blur();

        // Close modal
        const modalEl = document.getElementById('importModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        // Clear textarea
        document.getElementById('import-text-area').value = '';

        // Show alert after a short delay to allow modal to close properly
        setTimeout(() => {
            alert(`Đã nhập thành công ${importedSemesters.length} học kỳ với ${addedCount} môn học.`);
        }, 150);
    });
}

function parsePortalText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const semesters = [];
    let currentSemester = null;

    for (const line of lines) {
        // Check for Semester Header
        // "Năm học: 2023-2024 - Học kỳ: HK01"
        const semMatch = line.match(/Năm học:\s*(\d{4}-\d{4})\s*-\s*Học kỳ:\s*(HK\d+)/i);
        if (semMatch) {
            currentSemester = {
                name: `${semMatch[2]} (${semMatch[1]})`, // HK01 (2023-2024)
                courses: []
            };
            semesters.push(currentSemester);
            continue;
        }

        // Check for Course Line (Graded)
        // Regex to find: Credits (float), Grade10 (float), Grade4 (float), GradeChar (Letters+opt +)
        // Matches: 3.0 7.0 3.00 B
        // Updated regex to correctly handle '+' grades by using lookahead (?=\s|$) instead of \b
        const courseMatch = line.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+([A-Z]\+?)(?=\s|$)/);
        
        // Check for Course Line (Ungraded)
        // Matches: Credits (float) followed by "Chưa nhập điểm" or "Chưa khảo sát"
        const ungradedMatch = line.match(/(\d+(?:\.\d+)?)\s+(?=Chưa nhập điểm|Chưa khảo sát)/);

        if (courseMatch && currentSemester) {
            // Extract parts
            const matchIndex = courseMatch.index;
            const prefix = line.substring(0, matchIndex).trim();
            
            // Try to extract name from prefix "STT Code Name"
            // Remove STT (digits) and Code (alphanumeric)
            // Example: "1 1010443 Triết học Mác - Lênin"
            let courseName = prefix;
            
            // Regex to remove STT and Code: ^\d+\s+\w+\s+
            const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
            if (nameMatch) {
                courseName = nameMatch[1].trim();
            }

            // Skip courses with '*' in the name (e.g. "Giáo dục quốc phòng *")
            if (courseName.includes('*')) {
                continue;
            }

            const credits = parseFloat(courseMatch[1]);
            let gradeChar = courseMatch[4];

            // Map A+ to A (since A+ is not in standard scale but appears in portal)
            if (gradeChar === 'A+') {
                gradeChar = 'A';
            }

            // Validate grade char against GRADE_SCALE
            const isValidGrade = GRADE_SCALE.some(g => g.grade === gradeChar);

            // Additional check: Credits should be reasonable (e.g. < 20) to avoid matching course codes
            if (isValidGrade && credits < 20) {
                currentSemester.courses.push({
                    name: courseName,
                    credits: credits,
                    grade: gradeChar,
                    isRetake: false,
                    oldGrade: 'D'
                });
            }
        } else if (ungradedMatch && currentSemester) {
            // Handle Ungraded Course
            const credits = parseFloat(ungradedMatch[1]);
            const matchIndex = ungradedMatch.index;
            const prefix = line.substring(0, matchIndex).trim();
            
            let courseName = prefix;
            const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
            if (nameMatch) {
                courseName = nameMatch[1].trim();
            }
            
            // Skip courses with '*' in the name
            if (courseName.includes('*')) {
                continue;
            }
            
            if (credits < 20) {
                currentSemester.courses.push({
                    name: courseName,
                    credits: credits,
                    grade: "", // Empty grade
                    isRetake: false,
                    oldGrade: ""
                });
            }
        }
    }

    // Post-processing: Detect Retakes based on Chronological Order
    // 1. Flatten courses with metadata
    const allCourses = [];
    semesters.forEach((sem, semIdx) => {
        // Parse semester value for sorting: "HK01 (2023-2024)"
        let semValue = 0;
        const match = sem.name.match(/HK(\d+)\s*\((\d{4})-(\d{4})\)/);
        if (match) {
            const hk = parseInt(match[1]);
            const year = parseInt(match[2]);
            semValue = year * 10 + hk;
        } else {
            // Fallback: use index if format doesn't match
            semValue = semIdx; 
        }

        sem.courses.forEach(course => {
            allCourses.push({
                course: course,
                semValue: semValue,
                semIdx: semIdx
            });
        });
    });

    // 2. Sort by Semester Value (Oldest First)
    allCourses.sort((a, b) => a.semValue - b.semValue);

    // 3. Detect Retakes
    const courseHistory = new Map(); // Name -> Grade

    allCourses.forEach(item => {
        const name = item.course.name;
        if (courseHistory.has(name)) {
            // Found a previous instance
            item.course.isRetake = true;
            item.course.oldGrade = courseHistory.get(name);
        }
        // Update history with current grade
        courseHistory.set(name, item.course.grade);
    });

    return semesters;
}
// ==========================================
// CONTACT BUTTON LOGIC
// ==========================================
function initContactButton() {
    const wrapper = document.getElementById('contact-floating-wrapper');
    const closeBtn = document.getElementById('close-contact-btn');

    if (!wrapper || !closeBtn) return;

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering modal
        wrapper.style.display = 'none';
    });

    // Fetch Visit Count when modal is opened
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.addEventListener('shown.bs.modal', () => {
            fetchVisitCount();
        });
    }
}

function fetchVisitCount() {
    const containers = document.querySelectorAll('.visit-count-container');
    const countSpans = document.querySelectorAll('.visit-count-value');
    
    // Reset nội dung và hiển thị loading (nếu cần)
    countSpans.forEach(span => span.textContent = '...');
    
    // URL endpoint lấy dữ liệu JSON
    // Lưu ý: Cần bật "Allow adding visitor counts on your website" trong cài đặt GoatCounter để tránh lỗi CORS
    const url = `https://tienxdun.goatcounter.com/counter/TOTAL.json?rnd=${Math.random()}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.count) {
                countSpans.forEach(span => span.textContent = data.count);
                // Remove inline display: none to let Bootstrap classes handle visibility
                containers.forEach(container => container.style.removeProperty('display'));
            }
        })
        .catch(error => {
            console.warn('Không thể lấy lượt truy cập (Lỗi CORS hoặc Mạng):', error);
            console.warn('Vui lòng kiểm tra cài đặt "Allow adding visitor counts" trên GoatCounter.');
            // Ẩn container nếu lỗi
            containers.forEach(container => container.style.display = 'none');
        });
}

// ==========================================
// THEME TOGGLE (DARK MODE)
// ==========================================

function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('#theme-toggle-mobile, #theme-toggle-desktop, #theme-toggle');
    const navbar = document.querySelector('.navbar');
    
    // Check local storage or system preference
    const getPreferredTheme = () => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }
        // Default to light mode
        return 'light';
    };

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Icons for all buttons
        toggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (theme === 'dark') {
                icon.classList.remove('bi-moon-stars-fill');
                icon.classList.add('bi-sun-fill');
                btn.classList.replace('btn-light', 'btn-dark');
                btn.classList.replace('border', 'border-secondary');
            } else {
                icon.classList.remove('bi-sun-fill');
                icon.classList.add('bi-moon-stars-fill');
                btn.classList.replace('btn-dark', 'btn-light');
                btn.classList.replace('border-secondary', 'border');
            }
        });

        // Update Navbar classes
        if (navbar) {
            if (theme === 'dark') {
                navbar.classList.remove('navbar-light', 'bg-white');
                navbar.classList.add('navbar-dark', 'bg-dark');
            } else {
                navbar.classList.remove('navbar-dark', 'bg-dark');
                navbar.classList.add('navbar-light', 'bg-white');
            }
        }
    };

    // Initialize
    setTheme(getPreferredTheme());

    // Event Listeners
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    });
}

// ==========================================
// USER GUIDE AUTO-SHOW
// ==========================================

function initUserGuide() {
    const modalEl = document.getElementById('userGuideModal');
    if (!modalEl) return;

    const headerCloseBtn = document.getElementById('guideHeaderCloseBtn');
    const checkContainer = document.getElementById('guideCheckContainer');
    const checkbox = document.getElementById('guideUnderstandCheck');
    const confirmBtn = document.getElementById('guideConfirmBtn');

    // Logic for Checkbox
    if (checkbox && confirmBtn) {
        checkbox.addEventListener('change', () => {
            confirmBtn.disabled = !checkbox.checked;
        });
    }

    modalEl.addEventListener('show.bs.modal', (event) => {
        // If relatedTarget is null, it's triggered by JS (Auto-show)
        // If relatedTarget is defined, it's triggered by a button click (Manual)
        const isManual = !!event.relatedTarget;

        if (isManual) {
            // Manual mode: Allow closing easily
            if (headerCloseBtn) headerCloseBtn.style.display = 'block';
            if (checkContainer) checkContainer.style.display = 'none';
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Đóng';
                confirmBtn.classList.remove('btn-primary');
                confirmBtn.classList.add('btn-secondary');
            }
        } else {
            // Auto mode: Force check
            if (headerCloseBtn) headerCloseBtn.style.display = 'none';
            if (checkContainer) checkContainer.style.display = 'block';
            if (checkbox) checkbox.checked = false;
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Bắt đầu sử dụng';
                confirmBtn.classList.remove('btn-secondary');
                confirmBtn.classList.add('btn-primary');
            }
        }
    });

    // Mark as seen when closed (only matters if it wasn't seen before)
    modalEl.addEventListener('hidden.bs.modal', () => {
        if (!localStorage.getItem('hasSeenGuide')) {
            localStorage.setItem('hasSeenGuide', 'true');
        }
    });

    // Auto show logic
    if (!localStorage.getItem('hasSeenGuide')) {
        // Use a small timeout to ensure Bootstrap is fully ready and for better UX
        setTimeout(() => {
            const guideModal = new bootstrap.Modal(modalEl);
            guideModal.show();
        }, 1000);
    }
}
