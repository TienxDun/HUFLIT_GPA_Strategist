import { GRADE_SCALE } from '../core/constants.js';
import { calculateYearlyStats, getYearInfo } from '../core/calculator.js';
import { getManualState } from '../state/store.js';

export function initGradeScaleTab() {
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

export function renderManualSemesters() {
    const manualSemesterList = document.getElementById('manual-semester-list');
    if (!manualSemesterList) return;

    const { semesters: manualSemesters, initialGpa, initialCredits } = getManualState();
    
    // Pre-calculate cumulative GPA for each semester
    let runningTotalPoints = (parseFloat(initialGpa) || 0) * (parseFloat(initialCredits) || 0);
    let runningTotalCredits = parseFloat(initialCredits) || 0;

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

    // Calculate Yearly Stats
    const yearStats = calculateYearlyStats(manualSemesters);

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
        
        // Check if we should show year summary
        let yearSummaryHtml = '';
        const currentYear = getYearInfo(sem.name);
        const nextSem = manualSemesters[index + 1];
        const nextYear = nextSem ? getYearInfo(nextSem.name) : null;
        
        if (!nextYear || nextYear.id !== currentYear.id) {
            // End of year group
            const stat = yearStats[currentYear.id];
            if (stat && stat.credits > 0) {
                const yearGPA = (stat.points / stat.credits).toFixed(2);
                yearSummaryHtml = `
                    <div class="alert alert-info d-flex justify-content-between align-items-center mb-3 shadow-sm border-info-subtle bg-info-subtle text-info-emphasis">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-mortarboard-fill me-2 fs-5"></i>
                            <span class="fw-bold">GPA Trung bình ${stat.label}</span>
                        </div>
                        <span class="badge bg-info text-dark fs-6 border border-info-subtle year-gpa-badge" data-year-id="${currentYear.id}">GPA ${yearGPA}</span>
                    </div>
                `;
            }
        }
        
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
                                            <button class="btn btn-outline-secondary px-1" type="button" onclick="window.adjustManualCredit('${sem.id}', '${course.id}', -1)">-</button>
                                            <input type="number" class="form-control form-control-sm manual-input text-center px-0" 
                                                value="${course.credits}" min="0" readonly
                                                data-sem-id="${sem.id}" data-course-id="${course.id}" data-field="credits">
                                            <button class="btn btn-outline-secondary px-1" type="button" onclick="window.adjustManualCredit('${sem.id}', '${course.id}', 1)">+</button>
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
        ${yearSummaryHtml}
    `;}).join('');
}
