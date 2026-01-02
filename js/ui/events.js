import { GRADE_SCALE } from '../core/constants.js';
import { getManualState, setManualState, addManualSemester, removeManualSemester, updateManualCourse, addManualCourse, removeManualCourse, loadManualStateFromStorage, getTargetState, setTargetState, loadTargetStateFromStorage, subscribe } from '../state/store.js';
import { calculateManualGPA, calculateTargetResult, generateRetakeSuggestions, generateGradeCombinations } from '../core/calculator.js';
import { renderManualSemesters } from './renderers.js';
import { parsePortalText } from '../core/utils.js';

// ==========================================
// GLOBAL HELPERS
// ==========================================
window.adjustManualCredit = function(semId, courseId, delta) {
    const { semesters } = getManualState();
    const semester = semesters.find(s => String(s.id) === String(semId));
    if (semester) {
        const course = semester.courses.find(c => String(c.id) === String(courseId));
        if (course) {
            let val = parseFloat(course.credits) || 0;
            val += delta;
            if (val < 0) val = 0;
            updateManualCourse(semId, courseId, 'credits', val);
        }
    }
};

// ==========================================
// TAB: TÍNH GPA THỦ CÔNG (MANUAL CALC)
// ==========================================

export function initManualCalcTab() {
    const addSemesterBtn = document.getElementById('add-semester-btn');
    const manualSemesterList = document.getElementById('manual-semester-list');
    const resetManualBtn = document.getElementById('reset-manual-btn');
    const manualInitialGpaInput = document.getElementById('manual-initial-gpa');
    const manualInitialCreditsInput = document.getElementById('manual-initial-credits');
    const processImportBtn = document.getElementById('process-import-btn');

    if (!addSemesterBtn) return;

    // Subscribe to store changes
    subscribe(() => {
        renderManualSemesters();
        updateManualCalculationDisplay();
    });

    // Initial Load
    loadManualStateFromStorage();

    // Apply Manual Data to Target Tab
    const applyBtn = document.getElementById('apply-manual-to-target-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const manualGpaDisplay = document.getElementById('manual-gpa');
            const manualCreditsDisplay = document.getElementById('manual-credits');
            
            const gpa = manualGpaDisplay.textContent;
            const credits = manualCreditsDisplay.textContent;

            const targetGpaInput = document.getElementById('current-gpa');
            const targetCreditsInput = document.getElementById('current-credits');
            const goalGpaInput = document.getElementById('target-gpa');

            if (targetGpaInput && targetCreditsInput) {
                targetGpaInput.value = gpa;
                targetCreditsInput.value = credits;
                
                // Trigger input event to save state
                targetGpaInput.dispatchEvent(new Event('input'));
                targetCreditsInput.dispatchEvent(new Event('input'));

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
                    goalGpaInput.dispatchEvent(new Event('input'));
                    
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
                
                if (newCreditsInput && newCreditsInput.offsetParent !== null) {
                    newCreditsInput.focus();
                    newCreditsInput.select();
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

    addSemesterBtn.addEventListener('click', () => {
        const newSemId = Date.now();
        const { semesters } = getManualState();
        const nextNum = semesters.length + 1;
        
        // Guess next semester name
        let nextName = `Học kỳ ${nextNum}`;
        if (semesters.length > 0) {
            const lastSem = semesters[semesters.length - 1];
            const match = lastSem.name.match(/HK(\d+)\s*\((\d{4})-(\d{4})\)/);
            if (match) {
                let hk = parseInt(match[1]);
                let y1 = parseInt(match[2]);
                let y2 = parseInt(match[3]);
                
                hk++;
                if (hk > 3) {
                    hk = 1;
                    y1++;
                    y2++;
                }
                nextName = `HK0${hk} (${y1}-${y2})`;
            }
        }

        addManualSemester({
            id: newSemId,
            name: nextName,
            courses: []
        });
    });

    resetManualBtn.addEventListener('click', () => {
        if(confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu tính thủ công?')) {
            setManualState({
                semesters: [],
                initialGpa: '',
                initialCredits: ''
            });
            manualInitialGpaInput.value = '';
            manualInitialCreditsInput.value = '';
        }
    });

    // Initial Data Inputs
    manualInitialGpaInput.addEventListener('input', (e) => {
        setManualState({ initialGpa: e.target.value });
    });
    manualInitialCreditsInput.addEventListener('input', (e) => {
        setManualState({ initialCredits: e.target.value });
    });

    // Event Delegation for dynamic elements
    let deleteTimeout = null;
    
    manualSemesterList.addEventListener('click', (e) => {
        const target = e.target;
        
        // Delete Semester (Request Confirmation)
        const deleteBtn = target.closest('.delete-semester-btn');
        if (deleteBtn) {
            if (deleteTimeout) clearTimeout(deleteTimeout);
            
            deleteBtn.classList.remove('delete-semester-btn', 'text-danger', 'btn-link');
            deleteBtn.classList.add('confirm-delete-semester-btn', 'btn-danger', 'text-white');
            deleteBtn.innerHTML = 'Xóa?';
            
            deleteTimeout = setTimeout(() => {
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
            if (deleteTimeout) {
                clearTimeout(deleteTimeout);
                deleteTimeout = null;
            }
            const semId = confirmBtn.dataset.id;
            removeManualSemester(semId);
            return;
        }

        // Add Course
        if (target.closest('.add-course-btn')) {
            const semId = target.closest('.add-course-btn').dataset.id;
            addManualCourse(semId, {
                id: Date.now(),
                name: '',
                credits: 3,
                grade: '',
                isRetake: false,
                oldGrade: 'D'
            });
        }

        // Delete Course
        if (target.closest('.delete-course-btn')) {
            const semId = target.closest('.delete-course-btn').dataset.semId;
            const courseId = target.closest('.delete-course-btn').dataset.courseId;
            removeManualCourse(semId, courseId);
        }
    });

    manualSemesterList.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('manual-input')) {
            const semId = target.dataset.semId;
            const courseId = target.dataset.courseId;
            const field = target.dataset.field;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            
            updateManualCourse(semId, courseId, field, value);
        }
    });

    manualSemesterList.addEventListener('input', (e) => {
        const target = e.target;
        if (target.classList.contains('manual-input') && target.dataset.field === 'credits') {
            const semId = target.dataset.semId;
            const courseId = target.dataset.courseId;
            const value = target.value;
            updateManualCourse(semId, courseId, 'credits', value);
        }
    });

    // Import Logic
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

            // Clear existing data
            setManualState({
                semesters: [],
                initialGpa: '',
                initialCredits: ''
            });
            manualInitialGpaInput.value = '';
            manualInitialCreditsInput.value = '';

            // Add imported semesters
            let addedCount = 0;
            importedSemesters.forEach(sem => {
                if (sem.courses.length > 0) {
                    const newSemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                    const courses = sem.courses.map(c => ({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        name: c.name,
                        credits: parseFloat(c.credits) || 0,
                        grade: c.grade,
                        isRetake: c.isRetake || false,
                        oldGrade: c.oldGrade || 'D'
                    }));

                    addManualSemester({
                        id: newSemId,
                        name: sem.name,
                        courses: courses
                    });
                    addedCount += courses.length;
                }
            });

            processImportBtn.blur();
            const modalEl = document.getElementById('importModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            document.getElementById('import-text-area').value = '';

            setTimeout(() => {
                alert(`Đã nhập thành công ${importedSemesters.length} học kỳ với ${addedCount} môn học.`);
            }, 150);
        });
    }
}

function updateManualCalculationDisplay() {
    const { semesters, initialGpa, initialCredits } = getManualState();
    const { gpa, totalCredits, rank } = calculateManualGPA(semesters, parseFloat(initialGpa) || 0, parseFloat(initialCredits) || 0);

    const manualGpaDisplay = document.getElementById('manual-gpa');
    const manualCreditsDisplay = document.getElementById('manual-credits');
    const manualRankDisplay = document.getElementById('manual-rank');

    if (manualGpaDisplay) {
        manualGpaDisplay.textContent = gpa.toFixed(2);
        manualGpaDisplay.className = `display-1 fw-bold mb-2 ${gpa >= 3.2 ? 'text-success' : (gpa >= 2.5 ? 'text-primary' : 'text-danger')}`;
    }
    if (manualCreditsDisplay) manualCreditsDisplay.textContent = totalCredits;
    if (manualRankDisplay) manualRankDisplay.textContent = rank;
}

// ==========================================
// TAB: LỘ TRÌNH GPA (TARGET GPA)
// ==========================================

export function initTargetGPATab() {
    const calcTargetBtn = document.getElementById('calc-target-btn');
    if (!calcTargetBtn) return;

    const currentGpaInput = document.getElementById('current-gpa');
    const currentCreditsInput = document.getElementById('current-credits');
    const targetGpaInput = document.getElementById('target-gpa');
    const newCreditsInput = document.getElementById('new-credits');
    const totalCreditsInput = document.getElementById('total-credits');
    const retakeToggle = document.getElementById('retake-toggle');
    const retakeArea = document.getElementById('retake-area');
    const retakeList = document.getElementById('retake-list');
    const addRetakeBtn = document.getElementById('add-retake-btn');
    const btnSwitchToTotal = document.getElementById('btn-switch-to-total');
    const btnSwitchToNew = document.getElementById('btn-switch-to-new');
    const newCreditsGroup = document.getElementById('new-credits-group');
    const totalCreditsGroup = document.getElementById('total-credits-group');

    // Subscribe to store changes
    subscribe(() => {
        // Update UI based on state if needed (e.g. retake list)
        // For inputs, we generally trust the input value unless we are reloading state
    });

    loadTargetStateFromStorage();
    const initialState = getTargetState();
    
    // Restore UI from state
    if (currentGpaInput) currentGpaInput.value = initialState.currentGpa || '';
    if (currentCreditsInput) currentCreditsInput.value = initialState.currentCredits || '';
    if (targetGpaInput) targetGpaInput.value = initialState.targetGpa || '';
    if (newCreditsInput) newCreditsInput.value = initialState.newCredits || '';
    if (totalCreditsInput) totalCreditsInput.value = initialState.totalCredits || '';
    
    if (initialState.creditMode === 'total') {
        newCreditsGroup.classList.add('d-none');
        totalCreditsGroup.classList.remove('d-none');
    } else {
        totalCreditsGroup.classList.add('d-none');
        newCreditsGroup.classList.remove('d-none');
    }

    if (retakeToggle) {
        retakeToggle.checked = initialState.isRetake || false;
        if (initialState.isRetake) {
            retakeArea.classList.remove('d-none');
            retakeList.innerHTML = '';
            initialState.retakes.forEach(r => addRetakeItemUI(r));
        } else {
            retakeArea.classList.add('d-none');
        }
    }

    // Input Listeners
    const saveStateFromInputs = () => {
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

        setTargetState({
            currentGpa: currentGpaInput.value,
            currentCredits: currentCreditsInput.value,
            targetGpa: targetGpaInput.value,
            newCredits: newCreditsInput.value,
            totalCredits: totalCreditsInput.value,
            isRetake: retakeToggle.checked,
            retakes: retakes
        });
    };

    [currentGpaInput, currentCreditsInput, targetGpaInput, newCreditsInput, totalCreditsInput].forEach(input => {
        if(input) input.addEventListener('input', saveStateFromInputs);
    });

    // Sync Logic
    if (totalCreditsInput && newCreditsInput && currentCreditsInput) {
        totalCreditsInput.addEventListener('input', () => {
            const total = parseFloat(totalCreditsInput.value) || 0;
            const current = parseFloat(currentCreditsInput.value) || 0;
            newCreditsInput.value = Math.max(0, total - current);
            saveStateFromInputs();
        });

        newCreditsInput.addEventListener('input', () => {
            const newCred = parseFloat(newCreditsInput.value) || 0;
            const current = parseFloat(currentCreditsInput.value) || 0;
            totalCreditsInput.value = current + newCred;
            saveStateFromInputs();
        });

        currentCreditsInput.addEventListener('input', () => {
            const current = parseFloat(currentCreditsInput.value) || 0;
            const { creditMode } = getTargetState();
            if (creditMode === 'total') {
                const total = parseFloat(totalCreditsInput.value) || 0;
                newCreditsInput.value = Math.max(0, total - current);
            } else {
                const newCred = parseFloat(newCreditsInput.value) || 0;
                totalCreditsInput.value = current + newCred;
            }
            saveStateFromInputs();
        });
    }

    if (btnSwitchToTotal) {
        btnSwitchToTotal.addEventListener('click', () => {
            setTargetState({ creditMode: 'total' });
            newCreditsGroup.classList.add('d-none');
            totalCreditsGroup.classList.remove('d-none');
            // Sync
            const current = parseFloat(currentCreditsInput.value) || 0;
            const newCred = parseFloat(newCreditsInput.value) || 0;
            if (!totalCreditsInput.value) totalCreditsInput.value = current + newCred;
            saveStateFromInputs();
        });
    }
    if (btnSwitchToNew) {
        btnSwitchToNew.addEventListener('click', () => {
            setTargetState({ creditMode: 'new' });
            totalCreditsGroup.classList.add('d-none');
            newCreditsGroup.classList.remove('d-none');
            // Sync
            const current = parseFloat(currentCreditsInput.value) || 0;
            const total = parseFloat(totalCreditsInput.value) || 0;
            if (!newCreditsInput.value) newCreditsInput.value = Math.max(0, total - current);
            saveStateFromInputs();
        });
    }

    retakeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            retakeArea.classList.remove('d-none');
            if (retakeList.children.length === 0) {
                addRetakeItemUI();
            }
        } else {
            retakeArea.classList.add('d-none');
            retakeList.innerHTML = '';
        }
        saveStateFromInputs();
    });

    addRetakeBtn.addEventListener('click', () => {
        addRetakeItemUI();
        saveStateFromInputs();
    });

    calcTargetBtn.addEventListener('click', () => {
        const state = getTargetState();
        const currentGPA = parseFloat(state.currentGpa) || 0;
        const currentCredits = parseFloat(state.currentCredits) || 0;
        const targetGPA = parseFloat(state.targetGpa) || 0;
        let newCredits = parseFloat(state.newCredits) || 0;
        
        if (state.creditMode === 'total') {
            const total = parseFloat(state.totalCredits) || 0;
            newCredits = Math.max(0, total - currentCredits);
        }

        const result = calculateTargetResult(currentGPA, currentCredits, targetGPA, newCredits, state.retakes);
        
        // Render Result
        const targetResultContainer = document.getElementById('target-result-container');
        if (targetResultContainer) {
            targetResultContainer.className = 'card-body d-flex flex-column p-4';
            
            // 1. Determine Status
            let statusIcon = 'bi-check-circle-fill';
            let statusColor = 'success';
            let statusMessage = 'Khả thi! Bạn hoàn toàn có thể đạt được.';
            let statusBadgeClass = 'bg-success-subtle text-success-emphasis border-success-subtle';
            
            if (result.requiredGPA > 4.0) {
                statusIcon = 'bi-x-circle-fill';
                statusColor = 'danger';
                statusMessage = 'Không khả thi! GPA yêu cầu vượt quá 4.0.';
                statusBadgeClass = 'bg-danger-subtle text-danger-emphasis border-danger-subtle';
            } else if (result.requiredGPA <= 0) {
                if (result.newCredits === 0 && result.requiredPoints > 0.01) {
                    statusIcon = 'bi-exclamation-triangle-fill';
                    statusColor = 'danger';
                    statusMessage = 'Không thể đạt được! Hết tín chỉ để cải thiện.';
                    statusBadgeClass = 'bg-danger-subtle text-danger-emphasis border-danger-subtle';
                } else {
                    statusIcon = 'bi-trophy-fill';
                    statusColor = 'primary';
                    statusMessage = 'Đã đạt mục tiêu! Hãy duy trì phong độ.';
                    statusBadgeClass = 'bg-primary-subtle text-primary-emphasis border-primary-subtle';
                }
            } else if (result.requiredGPA > 3.6) {
                statusIcon = 'bi-exclamation-circle-fill';
                statusColor = 'warning';
                statusMessage = 'Khó! Cần nỗ lực rất lớn.';
                statusBadgeClass = 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
            }

            // 2. Generate Combinations
            let combinationsHTML = '';
            let combinationsCount = 0;
            
            if (result.requiredGPA > 0 && result.requiredGPA <= 4.0 && result.newCredits > 0) {
                const combinations = generateGradeCombinations(result.newCredits, result.requiredPoints);
                combinationsCount = combinations.length;
                
                if (combinations.length > 0) {
                    combinationsHTML = combinations.slice(0, 10).map(c => `
                        <div class="bg-light rounded-3 p-3 border transition-all">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-white text-dark border shadow-sm text-uppercase">Kết hợp ${c.g1.grade} &amp; ${c.g2.grade}</span>
                                <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle" title="Tổng điểm đạt được / Điểm cần thiết">
                                    ${c.totalPoints.toFixed(2)} / ${result.requiredPoints.toFixed(2)} điểm
                                </span>
                            </div>
                            <div class="d-flex gap-2 align-items-stretch">
                                <div class="flex-grow-1 p-2 rounded border bg-white position-relative overflow-hidden" style="flex-basis: 0;">
                                    <div class="position-absolute top-0 start-0 bottom-0 bg-${c.g1.color}-subtle" style="width: 4px;"></div>
                                    <div class="d-flex justify-content-between align-items-baseline ps-2">
                                        <span class="fw-bold text-${c.g1.color}">${c.g1.grade}</span>
                                        <span class="small fw-medium text-secondary">${c.c1} TC</span>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center text-muted">
                                    <i class="bi bi-plus-lg small"></i>
                                </div>
                                <div class="flex-grow-1 p-2 rounded border bg-white position-relative overflow-hidden" style="flex-basis: 0;">
                                    <div class="position-absolute top-0 start-0 bottom-0 bg-${c.g2.color}-subtle" style="width: 4px;"></div>
                                    <div class="d-flex justify-content-between align-items-baseline ps-2">
                                        <span class="fw-bold text-${c.g2.color}">${c.g2.grade}</span>
                                        <span class="small fw-medium text-secondary">${c.c2} TC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    combinationsHTML = '<div class="text-center text-muted small py-3">Không tìm thấy tổ hợp phù hợp.</div>';
                }
            }

            // 3. Render Main Content
            targetResultContainer.innerHTML = `
                <div class="text-center mb-4 w-100">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-${statusColor} text-white shadow-sm mb-3" style="width: 60px; height: 60px;">
                        <i class="bi ${statusIcon} fs-2"></i>
                    </div>
                    <h6 class="text-uppercase text-secondary fw-bold small letter-spacing-1 mb-2">GPA Trung bình cần đạt</h6>
                    <div class="display-1 fw-bold text-${statusColor}-emphasis mb-2" style="letter-spacing: -2px;">
                        ${result.requiredGPA > 0 ? result.requiredGPA.toFixed(2) : (result.requiredGPA <= 0 && result.requiredPoints <= 0.01 ? 'Đạt' : '---')}
                    </div>
                    <p class="text-muted fw-medium mb-0">cho <span class="fw-bold text-dark">${result.newCredits}</span> tín chỉ tiếp theo</p>
                    <div class="mt-3">
                        <span class="badge rounded-pill ${statusBadgeClass} px-3 py-2 border">
                            ${statusMessage}
                        </span>
                    </div>
                </div>

                ${result.requiredGPA > 0 && result.requiredGPA <= 4.0 ? `
                <div class="px-3 pb-3 bg-white border-top mt-4">
                    <div class="pt-3 mb-3 d-flex align-items-center justify-content-between">
                        <p class="small fw-bold text-secondary text-uppercase mb-0 d-flex align-items-center">
                            <i class="bi bi-layers me-2"></i>Các phương án khả thi
                        </p>
                        <span class="badge bg-light text-secondary rounded-pill border">${combinationsCount} tổ hợp</span>
                    </div>
                    <div class="d-flex flex-column gap-3 overflow-auto pe-1 custom-scrollbar" style="max-height: 400px;">
                        ${combinationsHTML}
                    </div>
                    <div class="mt-2 small text-muted text-center fst-italic">Danh sách sắp xếp theo mức độ đạt được từ dễ - khó</div>
                </div>
                ` : ''}

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
                                            <span class="small text-muted">(${targetGPA} GPA × ${result.totalFutureCredits} TC)</span>
                                            <span class="fw-bold font-monospace text-dark">${result.targetTotalPoints.toFixed(2)}</span>
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
                                            <span class="small text-muted">(${currentCredits} TC)</span>
                                            <span class="fw-bold font-monospace text-dark">${result.effectiveCurrentPoints.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3: Final Calculation -->
                            <div class="d-flex gap-3 position-relative" style="z-index: 1;">
                                <div class="rounded-circle bg-primary border-4 border-primary-subtle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 32px; height: 32px;">
                                    <span class="small fw-bold text-white">3</span>
                                </div>
                                <div class="card flex-grow-1 bg-primary text-white border-0 shadow">
                                    <div class="card-body p-3">
                                        <div class="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <div class="small text-white-50 text-uppercase fw-bold opacity-75">Điểm cần tích lũy thêm</div>
                                                <div class="h4 font-monospace fw-bold mb-0">${result.requiredPoints.toFixed(2)}</div>
                                            </div>
                                            <div class="text-end">
                                                <div class="small text-white-50">Tổng tín chỉ học</div>
                                                <div class="fw-bold">${result.newCredits} TC</div>
                                            </div>
                                        </div>
                                        <div class="border-top border-white-50 pt-3 d-flex justify-content-between align-items-center">
                                            <span class="small fw-medium text-white-50">GPA Trung bình cần đạt</span>
                                            <span class="badge bg-white bg-opacity-25 px-2 py-1 rounded font-monospace">${result.requiredPoints.toFixed(2)} / ${result.newCredits} = ${result.requiredGPA.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Suggestions for Retake (if impossible)
            if (result.requiredGPA > 4.0) {
                const deficitPoints = result.requiredPoints - (4.0 * result.newCredits);
                const { semesters } = getManualState();
                const suggestions = generateRetakeSuggestions(deficitPoints, targetGPA, semesters);
                
                if (suggestions.length > 0) {
                    targetResultContainer.innerHTML += `
                        <div class="mt-4 border-top pt-3">
                            <h6 class="text-danger fw-bold mb-3"><i class="bi bi-lightbulb-fill me-2"></i>Gợi ý học cải thiện để đạt mục tiêu:</h6>
                            <div class="list-group">
                                ${suggestions.map(s => `
                                    <div class="list-group-item list-group-item-action border-danger-subtle bg-danger-subtle">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1 text-danger fw-bold">Học lại ${s.courses.length} môn</h6>
                                            <small class="text-danger fw-bold">+${s.totalGain.toFixed(2)} điểm</small>
                                        </div>
                                        <p class="mb-1 small text-dark">${s.courses.map(c => `${c.name} (${c.grade} -> 4.0)`).join(', ')}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            }
        }
    });
}

function addRetakeItemUI(savedData = null) {
    const retakeList = document.getElementById('retake-list');
    const item = document.createElement('div');
    item.className = 'd-flex gap-2 mb-2 align-items-center flex-nowrap';
    
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

    const select = item.querySelector('.retake-old-grade');
    const input = item.querySelector('.retake-credits');
    const btnDec = item.querySelector('.btn-decrement');
    const btnInc = item.querySelector('.btn-increment');
    
    const triggerSave = () => {
        const currentGpaInput = document.getElementById('current-gpa');
        if (currentGpaInput) currentGpaInput.dispatchEvent(new Event('input'));
    };

    select.addEventListener('change', triggerSave);
    
    btnDec.addEventListener('click', () => {
        let val = parseFloat(input.value) || 0;
        if (val > 1) {
            input.value = val - 1;
            triggerSave();
        }
    });

    btnInc.addEventListener('click', () => {
        let val = parseFloat(input.value) || 0;
        if (val < 10) {
            input.value = val + 1;
            triggerSave();
        }
    });

    item.querySelector('.delete-retake-btn').addEventListener('click', () => {
        item.remove();
        triggerSave();
    });

    retakeList.appendChild(item);
}

// ==========================================
// TAB: TÍNH ĐIỂM MÔN HỌC (COURSE GRADE)
// ==========================================

export function initCourseGradeTab() {
    const processScoreInput = document.getElementById('process-score-input');
    const processScoreRange = document.getElementById('process-score-range');
    const accumulatedScoreDisplay = document.getElementById('accumulated-score');
    const scoreToPassDisplay = document.getElementById('score-to-pass');
    const courseGradeResults = document.getElementById('course-grade-results');

    if (!processScoreInput) return;
    
    function calculateAndRender() {
        const selectedRadio = document.querySelector('input[name="btnradio"]:checked');
        const processWeight = parseFloat(selectedRadio ? selectedRadio.value : 0.4);
        const finalWeight = 1 - processWeight;

        let processScore = parseFloat(processScoreInput.value);
        if (isNaN(processScore)) processScore = 0;

        const accumulated = processScore * processWeight;
        accumulatedScoreDisplay.textContent = accumulated.toFixed(2);

        const passGrade = GRADE_SCALE.find(g => g.grade === 'D');
        const passTarget = passGrade ? passGrade.min : 4.0;
        let requiredPass = (passTarget - accumulated) / finalWeight;
        
        if (requiredPass <= 0) {
            scoreToPassDisplay.textContent = "Đã qua";
        } else if (requiredPass > 10) {
            scoreToPassDisplay.textContent = "Không thể";
        } else {
            scoreToPassDisplay.textContent = requiredPass.toFixed(2);
        }

        const resultsHTML = GRADE_SCALE.map(grade => {
            const targetScore = grade.min;
            let requiredFinal = (targetScore - accumulated) / finalWeight;
            
            let statusClass = '';
            let progressColor = '';
            let message = '';
            let progressPercent = 0;
            let badgeColor = 'bg-secondary';

            if (grade.grade.startsWith('A')) badgeColor = 'bg-success';
            else if (grade.grade.startsWith('B')) badgeColor = 'bg-primary';
            else if (grade.grade.startsWith('C')) badgeColor = 'bg-info text-dark';
            else if (grade.grade.startsWith('D')) badgeColor = 'bg-warning text-dark';
            else badgeColor = 'bg-danger';

            if (requiredFinal <= 0) {
                requiredFinal = 0;
                if (grade.gpa === 0) {
                    message = `<span class="text-danger fw-bold small"><i class="bi bi-x-circle-fill me-1"></i>Rớt</span>`;
                    statusClass = 'bg-danger-subtle border-danger-subtle';
                    progressColor = 'bg-danger';
                } else {
                    message = `<span class="text-success fw-bold small"><i class="bi bi-check-circle-fill me-1"></i>Đạt</span>`;
                    statusClass = 'bg-success-subtle border-success-subtle';
                    progressColor = 'bg-success';
                }
                progressPercent = 100;
            } else if (requiredFinal > 10) {
                message = `<span class="text-muted small">Không thể (>10)</span>`;
                statusClass = 'bg-light opacity-75 border-light';
                progressColor = 'bg-secondary';
                progressPercent = 0;
            } else {
                message = `<div class="d-flex align-items-baseline"><span class="text-muted small me-2">Cần:</span><strong class="fs-5 text-dark">${requiredFinal.toFixed(2)}</strong></div>`;
                statusClass = 'bg-white border-light-subtle shadow-sm';
                
                if (requiredFinal < 5) progressColor = 'bg-success';
                else if (requiredFinal < 7) progressColor = 'bg-info';
                else if (requiredFinal < 8.5) progressColor = 'bg-warning';
                else progressColor = 'bg-danger';
                
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

    function saveState() {
        const state = {
            ratio: document.querySelector('input[name="btnradio"]:checked')?.value,
            processScore: processScoreInput.value
        };
        localStorage.setItem('courseGradeState', JSON.stringify(state));
    }

    function loadState() {
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
            } catch (e) { console.error(e); }
        } else {
            processScoreInput.value = 7.0;
            processScoreRange.value = 7.0;
        }
    }

    loadState();
    calculateAndRender();

    const radioButtons = document.querySelectorAll('input[name="btnradio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            calculateAndRender();
            saveState();
        });
    });

    processScoreRange.addEventListener('input', (e) => {
        processScoreInput.value = e.target.value;
        calculateAndRender();
        saveState();
    });

    processScoreInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (val > 10) val = 10;
        if (val < 0) val = 0;
        
        if (!isNaN(val)) {
            processScoreRange.value = val;
            calculateAndRender();
            saveState();
        }
    });
}

// ==========================================
// OTHER EVENTS
// ==========================================

export function initContactButton() {
    const wrapper = document.getElementById('contact-floating-wrapper');
    const closeBtn = document.getElementById('close-contact-btn');

    if (!wrapper || !closeBtn) return;

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.style.display = 'none';
    });

    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.addEventListener('shown.bs.modal', () => {
            fetchVisitCount();
        });
    }
}

export function fetchVisitCount() {
    const containers = document.querySelectorAll('.visit-count-container');
    const countSpans = document.querySelectorAll('.visit-count-value');
    
    countSpans.forEach(span => span.textContent = '...');
    
    const url = `https://tienxdun.goatcounter.com/counter/TOTAL.json?rnd=${Math.random()}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data && data.count) {
                countSpans.forEach(span => span.textContent = data.count);
                containers.forEach(container => container.style.removeProperty('display'));
            }
        })
        .catch(error => {
            console.warn('Không thể lấy lượt truy cập:', error);
            containers.forEach(container => container.style.display = 'none');
        });
}

export function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('#theme-toggle-mobile, #theme-toggle-desktop, #theme-toggle');
    const navbar = document.querySelector('.navbar');
    
    const getPreferredTheme = () => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme;
        return 'light';
    };

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
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

    setTheme(getPreferredTheme());

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    });
}

export function initUserGuide() {
    const modalEl = document.getElementById('userGuideModal');
    if (!modalEl) return;

    const headerCloseBtn = document.getElementById('guideHeaderCloseBtn');
    const checkContainer = document.getElementById('guideCheckContainer');
    const checkbox = document.getElementById('guideUnderstandCheck');
    const confirmBtn = document.getElementById('guideConfirmBtn');

    if (checkbox && confirmBtn) {
        checkbox.addEventListener('change', () => {
            confirmBtn.disabled = !checkbox.checked;
        });
    }

    modalEl.addEventListener('show.bs.modal', (event) => {
        const isManual = !!event.relatedTarget;

        if (isManual) {
            if (headerCloseBtn) headerCloseBtn.style.display = 'block';
            if (checkContainer) checkContainer.style.display = 'none';
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Đóng';
                confirmBtn.classList.remove('btn-primary');
                confirmBtn.classList.add('btn-secondary');
            }
        } else {
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

    modalEl.addEventListener('hidden.bs.modal', () => {
        if (!localStorage.getItem('hasSeenGuide')) {
            localStorage.setItem('hasSeenGuide', 'true');
        }
    });

    if (!localStorage.getItem('hasSeenGuide')) {
        setTimeout(() => {
            const guideModal = new bootstrap.Modal(modalEl);
            guideModal.show();
        }, 1000);
    }
}
