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
                <td><span class="badge ${badgeColor} rounded-pill fs-6" style="min-width: 50px;">${item.grade}</span></td>
                <td>${item.min.toFixed(1)} - ${item.max.toFixed(1)}</td>
                <td class="fw-bold">${item.gpa.toFixed(1)}</td>
                <td>${rank}</td>
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
    manualSemesterList.addEventListener('click', (e) => {
        const target = e.target;
        
        // Delete Semester
        if (target.closest('.delete-semester-btn')) {
            const semId = parseInt(target.closest('.delete-semester-btn').dataset.id);
            deleteManualSemester(semId);
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
    if(confirm('Xóa học kỳ này?')) {
        manualSemesters = manualSemesters.filter(s => s.id !== id);
        saveManualState();
        renderManualSemesters();
        calculateManualGPA();
    }
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

function updateManualCourse(semId, courseId, field, value) {
    const semester = manualSemesters.find(s => s.id === semId);
    if (semester) {
        const course = semester.courses.find(c => c.id === courseId);
        if (course) {
            course[field] = value;
            // If credits changed, ensure it's a number
            if (field === 'credits') {
                course.credits = parseFloat(value) || 0;
                
                // Update UI for total credits immediately without re-rendering
                const totalBadge = document.querySelector(`.semester-total-credits[data-sem-id="${semId}"]`);
                if (totalBadge) {
                    const newTotal = semester.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
                    totalBadge.textContent = `${newTotal} TC`;
                }
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

            // Add current course
            totalPoints += gpa * credits;
            totalCredits += credits;

            // Handle Retake Logic
            if (course.isRetake) {
                const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
                const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;
                
                // Subtract old course effect
                // Note: This assumes the old course WAS included in the Initial Data or previous semesters.
                // If totalCredits becomes negative (impossible in reality but possible if user inputs wrong data), we clamp it?
                // No, let's just do the math.
                
                totalPoints -= oldGpa * credits;
                totalCredits -= credits;
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

function renderManualSemesters() {
    manualSemesterList.innerHTML = manualSemesters.map(sem => {
        const semTotalCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        return `
        <div class="card shadow-sm mb-3">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">${sem.name}</span>
                    <span class="badge bg-light text-secondary border semester-total-credits" data-sem-id="${sem.id}">${semTotalCredits} TC</span>
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
                        <thead class="text-muted small border-bottom">
                            <tr>
                                <th style="width: 35%">Môn học</th>
                                <th style="width: 15%">TC</th>
                                <th style="width: 20%">Điểm</th>
                                <th style="width: 25%">Học lại?</th>
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
                                        <input type="number" class="form-control form-control-sm manual-input" 
                                            value="${course.credits}" min="0"
                                            data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="credits">
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
    item.className = 'input-group mb-2';
    
    const defaultGrade = savedData ? savedData.oldGrade : (GRADE_SCALE[0] ? GRADE_SCALE[0].gpa : 0);
    const defaultCredits = savedData ? savedData.credits : 3;

    item.innerHTML = `
        <span class="input-group-text bg-light">Điểm cũ</span>
        <select class="form-select retake-old-grade" aria-label="Old Grade">
            ${GRADE_SCALE.map(g => `<option value="${g.gpa}" ${Math.abs(g.gpa - defaultGrade) < 0.01 ? 'selected' : ''}>${g.grade} (${g.gpa})</option>`).join('')}
        </select>
        <span class="input-group-text bg-light">TC</span>
        <input type="number" class="form-control retake-credits" placeholder="3" value="${defaultCredits}" min="1" max="10">
        <button class="btn btn-outline-danger delete-retake-btn" type="button"><i class="bi bi-trash"></i></button>
    `;

    // Listeners for inner elements
    const select = item.querySelector('.retake-old-grade');
    const input = item.querySelector('.retake-credits');
    
    select.addEventListener('change', saveTargetState);
    input.addEventListener('input', saveTargetState);

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
        const retakeItems = retakeList.querySelectorAll('.input-group');
        retakeItems.forEach(item => {
            const oldGrade = parseFloat(item.querySelector('.retake-old-grade').value);
            const credits = parseFloat(item.querySelector('.retake-credits').value);
            retakes.push({ oldGrade, credits });
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
        const retakeItems = retakeList.querySelectorAll('.input-group');
        retakeItems.forEach(item => {
            const oldGrade = parseFloat(item.querySelector('.retake-old-grade').value);
            const credits = parseFloat(item.querySelector('.retake-credits').value);
            
            if (!isNaN(oldGrade) && !isNaN(credits)) {
                removedPoints += oldGrade * credits;
                retakeCreditsTotal += credits;
                
                if (oldGrade === 0) {
                    retakeCreditsFromF += credits;
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
    if (creditsToEarn > 0) {
        requiredGPA = pointsNeeded / creditsToEarn;
    } else {
        // No new credits and no retakes?
        // If Current GPA == Target GPA, then 0 needed? No, this case is weird.
        // Let's assume required is 0 if pointsNeeded <= 0, else infinite.
        requiredGPA = pointsNeeded <= 0 ? 0 : 999;
    }

    // 4. Render Results
    renderTargetResult(requiredGPA, creditsToEarn);
}

function renderTargetResult(requiredGPA, creditsToEarn) {
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
        <div class="card border-0 ${bgClass} mb-4 w-100">
            <div class="card-body p-4">
                <h6 class="card-subtitle mb-2 text-muted text-uppercase">GPA Trung bình cần đạt cho ${creditsToEarn} tín chỉ tới</h6>
                <div class="display-1 fw-bold ${textClass} my-3">${requiredGPA.toFixed(2)}</div>
                <div class="d-flex align-items-center justify-content-center gap-2 ${textClass}">
                    <i class="bi ${icon} fs-4"></i>
                    <span class="fw-medium">${message}</span>
                </div>
            </div>
        </div>
    `;

    // Advanced Scenarios
    if (requiredGPA <= 4.0 && requiredGPA > 0) {
        const suggestions = generateGradeSuggestions(requiredGPA);
        
        html += `
            <div class="w-100 text-start mt-4">
                <div class="d-flex align-items-center mb-3">
                    <div class="bg-primary bg-opacity-10 p-2 rounded-circle me-2 text-primary">
                        <i class="bi bi-stars"></i>
                    </div>
                    <h6 class="fw-bold mb-0">Gợi ý chiến lược phân bổ</h6>
                </div>
                
                <div class="row row-cols-1 g-3">
                    ${suggestions.map((s, index) => `
                        <div class="col">
                            <div class="card border-0 shadow-sm h-100" style="background-color: #f8f9fa;">
                                <div class="card-body position-relative overflow-hidden">
                                    <!-- Decorative background number -->
                                    <div class="position-absolute top-0 end-0 me-2 mt-0" 
                                         style="font-size: 5rem; font-weight: 900; color: #dee2e6; line-height: 1; opacity: 0.3; z-index: 0;">
                                        ${index + 1}
                                    </div>
                                    
                                    <div class="position-relative" style="z-index: 1;">
                                        <h6 class="fw-bold text-dark mb-3">${s.title}</h6>
                                        
                                        <div class="d-flex flex-column gap-2">
                                            ${s.parts.map(p => {
                                                const partCredits = (p.percent / 100) * creditsToEarn;
                                                return `
                                                <div class="d-flex align-items-center bg-white rounded-3 border p-2 shadow-sm">
                                                    <div class="d-flex align-items-center justify-content-center rounded-circle ${p.color} text-white fw-bold me-3" 
                                                         style="width: 40px; height: 40px; font-size: 1.2rem;">
                                                        ${p.grade}
                                                    </div>
                                                    <div class="flex-grow-1">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <span class="fw-bold text-dark">~${partCredits.toFixed(1)} Tín chỉ</span>
                                                            <span class="badge bg-light text-secondary border">${p.percent.toFixed(0)}%</span>
                                                        </div>
                                                        <div class="progress mt-1" style="height: 4px;">
                                                            <div class="progress-bar ${p.color}" role="progressbar" style="width: ${p.percent}%"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            `}).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="d-flex align-items-start mt-3 text-muted small">
                    <i class="bi bi-info-circle-fill me-2 mt-1 text-primary"></i>
                    <div>
                        Áp dụng cho <strong>${creditsToEarn}</strong> tín chỉ tiếp theo. 
                        Bạn có thể phối hợp các môn học theo tỷ lệ trên để đạt mục tiêu.
                    </div>
                </div>
            </div>
        `;
    }

    targetResultContainer.innerHTML = html;
    targetResultContainer.classList.remove('justify-content-center', 'align-items-center', 'text-center');
}

function generateGradeSuggestions(target) {
    const suggestions = [];
    
    // 1. Find bracketing grades
    // Sort grades descending
    const sortedGrades = [...GRADE_SCALE].sort((a, b) => b.gpa - a.gpa);
    
    let upper = null;
    let lower = null;
    
    for (let i = 0; i < sortedGrades.length - 1; i++) {
        if (sortedGrades[i].gpa >= target && sortedGrades[i+1].gpa <= target) {
            upper = sortedGrades[i];
            lower = sortedGrades[i+1];
            break;
        }
    }
    
    if (!upper || !lower) {
        // Edge case: target is higher than max or lower than min (already handled by caller mostly)
        // If target is exactly 4.0, upper is A, lower is A?
        if (target >= 4.0) return [{ title: "Hoàn hảo", gpa: 4.0, parts: [{ grade: 'A', percent: 100, color: 'bg-success', badge: 'bg-success' }] }];
        // If target is very low
        return [];
    }

    // Strategy 1: Minimum Effort (Mix of Upper and Lower)
    // x * upper + (1-x) * lower = target
    // x(upper - lower) = target - lower
    // x = (target - lower) / (upper - lower)
    const ratio = (target - lower.gpa) / (upper.gpa - lower.gpa);
    const upperPercent = ratio * 100;
    const lowerPercent = 100 - upperPercent;
    
    suggestions.push({
        title: "Phương án Tối thiểu",
        gpa: target,
        parts: [
            { grade: upper.grade, percent: upperPercent, color: getGradeColor(upper.grade), badge: getGradeBadge(upper.grade) },
            { grade: lower.grade, percent: lowerPercent, color: getGradeColor(lower.grade), badge: getGradeBadge(lower.grade) }
        ]
    });

    // Strategy 2: Safe Bet (Mix of A and something lower)
    // If upper is not A, we can try mixing A with lower (or even lower than lower)
    if (upper.grade !== 'A') {
        const gradeA = sortedGrades[0]; // A (4.0)
        // Mix A and Lower
        // x * 4.0 + (1-x) * lower = target
        const ratioA = (target - lower.gpa) / (gradeA.gpa - lower.gpa);
        const percentA = ratioA * 100;
        
        suggestions.push({
            title: "Phương án An toàn (Dùng điểm A)",
            gpa: target,
            parts: [
                { grade: 'A', percent: percentA, color: 'bg-success', badge: 'bg-success' },
                { grade: lower.grade, percent: 100 - percentA, color: getGradeColor(lower.grade), badge: getGradeBadge(lower.grade) }
            ]
        });
    } else {
        // If upper is A, maybe mix A and C+ (skip B) to see if we can slack off on some subjects?
        // Find a grade 2 steps below lower
        const lowerIndex = sortedGrades.indexOf(lower);
        if (lowerIndex + 1 < sortedGrades.length) {
            const evenLower = sortedGrades[lowerIndex + 1];
             // Mix A and EvenLower
             // x * 4.0 + (1-x) * evenLower = target
             const ratioA2 = (target - evenLower.gpa) / (4.0 - evenLower.gpa);
             if (ratioA2 > 0 && ratioA2 < 1) {
                 const percentA2 = ratioA2 * 100;
                 suggestions.push({
                    title: `Phương án Linh hoạt (A & ${evenLower.grade})`,
                    gpa: target,
                    parts: [
                        { grade: 'A', percent: percentA2, color: 'bg-success', badge: 'bg-success' },
                        { grade: evenLower.grade, percent: 100 - percentA2, color: getGradeColor(evenLower.grade), badge: getGradeBadge(evenLower.grade) }
                    ]
                });
             }
        }
    }

    return suggestions;
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
                message = `<span class="text-danger fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Rớt</span>`;
                statusClass = 'list-group-item-danger';
                progressColor = 'bg-danger';
            } else {
                message = `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Đã đạt!</span>`;
                statusClass = 'list-group-item-success'; // Light green background
                progressColor = 'bg-success';
            }
            progressPercent = 100;
        } else if (requiredFinal > 10) {
            // Impossible
            message = `<span class="text-muted small">Không thể đạt (Cần > 10)</span>`;
            statusClass = 'list-group-item-light opacity-75'; // Grayed out
            progressColor = 'bg-secondary';
            progressPercent = 0;
        } else {
            // Possible
            message = `Cần thi: <strong class="fs-5">${requiredFinal.toFixed(2)}</strong>`;
            statusClass = '';
            
            // Color logic based on difficulty (Required Score)
            // < 5: Easy (Green)
            // 5 - 7: Medium (Blue/Info)
            // 7 - 8.5: Hard (Warning/Orange)
            // > 8.5: Very Hard (Red)
            if (requiredFinal < 5) {
                progressColor = 'bg-success';
            } else if (requiredFinal < 7) {
                progressColor = 'bg-info';
            } else if (requiredFinal < 8.5) {
                progressColor = 'bg-warning';
            } else {
                progressColor = 'bg-danger';
            }
            
            // Progress bar visualization:
            // Let's show the required score as a percentage of 10.
            // e.g. Need 5/10 -> 50% filled.
            progressPercent = (requiredFinal / 10) * 100;
        }

        return `
            <div class="list-group-item ${statusClass}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center">
                        <span class="badge ${badgeColor} rounded-pill me-3" style="width: 45px; font-size: 1rem;">${grade.grade}</span>
                        <div class="d-flex flex-column">
                            <span class="fw-medium">GPA: ${grade.gpa}</span>
                            <span class="small text-muted">Thang điểm: ${grade.min} - ${grade.max}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        ${message}
                    </div>
                </div>
                ${requiredFinal <= 10 && requiredFinal > 0 ? `
                <div class="progress" style="height: 8px; background-color: #e9ecef;">
                    <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${progressPercent}%" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <small class="text-muted" style="font-size: 0.7rem;">0</small>
                    <small class="text-muted" style="font-size: 0.7rem;">10</small>
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
