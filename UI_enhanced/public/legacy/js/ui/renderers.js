/**
 * UI Renderers
 * DOM manipulation and HTML generation for the application
 */

import { GRADE_SCALE } from '../core/constants.js';
import {
  calculateYearlyStats,
  getYearInfo,
  calculateManualGPA,
  getGradeColor,
  classifyGPA
} from '../core/calculator.js';
import { getManualState, getTargetState } from '../state/store.js';
import { GPA_RANKS, CSS_CLASSES } from '../core/app-constants.js';
import { html, raw, classNames, formatGPA } from './components/template-utils.js';

// ==========================================
// State
// ==========================================

let gpaChart = null;
let chartJsLoaded = false;
let lastRenderedHash = '';

// ==========================================
// Chart Utilities
// ==========================================

/**
 * Ensure Chart.js is loaded
 * @returns {Promise<boolean>}
 */
async function ensureChartJsLoaded() {
  if (chartJsLoaded || typeof Chart !== 'undefined') {
    chartJsLoaded = true;
    return true;
  }

  return new Promise((resolve) => {
    const checkChart = () => {
      if (typeof Chart !== 'undefined') {
        chartJsLoaded = true;
        resolve(true);
      } else {
        setTimeout(checkChart, 50);
      }
    };
    checkChart();
  });
}

// ==========================================
// Hash Utilities
// ==========================================

/**
 * Generate hash from state for change detection
 * @param {Array} semesters - Semesters data
 * @param {number} initialGpa - Initial GPA
 * @param {number} initialCredits - Initial credits
 * @returns {string} State hash
 */
function generateStateHash(semesters, initialGpa, initialCredits) {
  const stateString = JSON.stringify({
    sems: semesters.map(s => ({
      id: s.id,
      name: s.name,
      courses: s.courses.map(c => ({
        id: c.id,
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        isRetake: c.isRetake,
        oldGrade: c.oldGrade
      }))
    })),
    gpa: initialGpa,
    credits: initialCredits
  });

  let hash = 0;
  for (let i = 0; i < stateString.length; i++) {
    const char = stateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// ==========================================
// Grade Scale Tab
// ==========================================

/**
 * Initialize grade scale tab
 */
export function initGradeScaleTab() {
  renderClassificationTable();
  renderGradeScaleTable();
}

/**
 * Render classification table
 */
function renderClassificationTable() {
  const classificationBody = document.getElementById('classification-table-body');
  if (!classificationBody) return;

  const currentGPA = getCurrentGPAForDisplay();
  const hasData = currentGPA !== null;

  const rows = Object.values(GPA_RANKS).map(rank => {
    const isActive = hasData && currentGPA >= rank.min && currentGPA <= (rank.max + 0.001);
    const rowClass = isActive ? `table-${rank.color} animate-pulse shadow-sm` : '';
    const badge = isActive
      ? `<span class="badge bg-white text-${rank.color} ms-2 px-2 py-1 border border-${rank.color} shadow-sm" style="font-size: 0.7rem; font-weight: 800;">BẠN ĐANG Ở ĐÂY <i class="bi bi-geo-alt-fill"></i></span>`
      : '';

    let textColorClass = `text-${rank.color}`;
    if (rank.color === 'info' || rank.color === 'warning') {
      textColorClass += '-emphasis';
    }

    return html`
      <tr class="transition-all ${rowClass}">
        <td class="ps-4 py-3 fw-bold ${textColorClass}">${rank.label}${raw(badge)}</td>
        <td class="text-end pe-4 small text-secondary fw-medium">${rank.min.toFixed(2)} - ${rank.max.toFixed(2)}</td>
      </tr>
    `;
  });

  classificationBody.innerHTML = rows.join('');
}

/**
 * Render grade scale table
 */
function renderGradeScaleTable() {
  const tableBody = document.getElementById('grade-scale-table-body');
  if (!tableBody) return;

  const currentGPA = getCurrentGPAForDisplay();
  const hasData = currentGPA !== null;

  // Get current rank to determine which grade to highlight
  const currentRank = hasData ? classifyGPA(currentGPA) : null;

  const scaleData = [
    { grade: 'A+', h10: '9.0 - 10', gpa: 4.0, color: 'success', rank: 'Xuất sắc' },
    { grade: 'A', h10: '8.5 - 8.9', gpa: 4.0, color: 'success', rank: 'Xuất sắc' },
    { grade: 'B+', h10: '8.0 - 8.4', gpa: 3.5, color: 'primary', rank: 'Giỏi' },
    { grade: 'B', h10: '7.0 - 7.9', gpa: 3.0, color: 'primary', rank: 'Khá' },
    { grade: 'C+', h10: '6.0 - 6.9', gpa: 2.5, color: 'info', rank: 'Trung bình' },
    { grade: 'C', h10: '5.5 - 5.9', gpa: 2.0, color: 'info', rank: 'Trung bình' },
    { grade: 'D+', h10: '5.0 - 5.4', gpa: 1.5, color: 'warning', rank: 'Yếu' },
    { grade: 'D', h10: '4.0 - 4.9', gpa: 1.0, color: 'warning', rank: 'Yếu' },
    { grade: 'F', h10: '< 4.0', gpa: 0, color: 'danger', rank: 'Kém' }
  ];

  const rows = scaleData.map((item) => {
    // Highlight based on academic rank matching
    const isActive = hasData && item.rank === currentRank;
    const activeClass = isActive ? 'table-active' : '';

    return html`
      <tr class="align-middle transition-all ${activeClass}">
        <td class="ps-4 py-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold text-${item.color}">${item.grade}</span>
          </div>
        </td>
        <td class="text-center small text-secondary fw-medium">${item.h10}</td>
        <td class="text-end pe-4 fw-bold text-primary">${item.gpa.toFixed(1)}</td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows.join('');
}

/**
 * Get current GPA for display in grade scale tables
 * @returns {number|null} Current GPA or null
 */
function getCurrentGPAForDisplay() {
  const { semesters, initialGpa, initialCredits } = getManualState();
  const { gpa: manualCalcGpa } = calculateManualGPA(
    semesters,
    parseFloat(initialGpa) || 0,
    parseFloat(initialCredits) || 0
  );

  const targetState = getTargetState();
  const targetTabGpa = parseFloat(targetState.currentGpa) || 0;

  const totalManualCredits = semesters.reduce((sum, sem) =>
    sum + sem.courses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0), 0
  ) + (parseFloat(initialCredits) || 0);

  if (totalManualCredits > 0) {
    return parseFloat(manualCalcGpa.toFixed(2));
  } else if (targetTabGpa > 0) {
    return parseFloat(targetTabGpa.toFixed(2));
  }

  return null;
}

// ==========================================
// Manual Semester Rendering
// ==========================================

/**
 * Render manual semester list
 */
export function renderManualSemesters() {
  const manualSemesterList = document.getElementById('manual-semester-list');
  if (!manualSemesterList) return;

  const { semesters: manualSemesters, initialGpa, initialCredits } = getManualState();

  // Skip render if unchanged
  const currentHash = generateStateHash(manualSemesters, initialGpa, initialCredits);
  if (currentHash === lastRenderedHash) {
    return;
  }
  lastRenderedHash = currentHash;

  // Calculate cumulative GPAs
  const semesterCumulativeGPAs = calculateSemesterCumulativeGPAs(
    manualSemesters,
    parseFloat(initialGpa) || 0,
    parseFloat(initialCredits) || 0
  );

  // Calculate yearly stats
  const yearStats = calculateYearlyStats(manualSemesters);

  // Render semesters
  const html_output = manualSemesters.map((sem, index) => {
    const yearSummaryHtml = renderYearSummary(manualSemesters, index, yearStats);
    return renderSemesterCard(sem, index, semesterCumulativeGPAs[index]) + yearSummaryHtml;
  }).join('');

  manualSemesterList.innerHTML = html_output;

  // Update chart
  renderGPAChart(manualSemesters, initialGpa, initialCredits);
}

/**
 * Calculate cumulative GPA for each semester
 * @param {Array} semesters - Semesters
 * @param {number} initialGpa - Initial GPA
 * @param {number} initialCredits - Initial credits
 * @returns {string[]} Array of cumulative GPAs
 */
function calculateSemesterCumulativeGPAs(semesters, initialGpa, initialCredits) {
  let runningTotalPoints = initialGpa * initialCredits;
  let runningTotalCredits = initialCredits;

  return semesters.map(sem => {
    sem.courses.forEach(course => {
      const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
      const gpa = gradeInfo ? gradeInfo.gpa : 0;
      const credits = parseFloat(course.credits) || 0;

      if (course.isRetake) {
        const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
        const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;

        if (gpa > oldGpa) {
          runningTotalPoints += (gpa - oldGpa) * credits;
          if (oldGpa === 0 && gpa > 0) {
            runningTotalCredits += credits;
          }
        }
      } else {
        runningTotalPoints += gpa * credits;
        if (gpa > 0) {
          runningTotalCredits += credits;
        }
      }
    });

    return runningTotalCredits > 0
      ? (runningTotalPoints / runningTotalCredits).toFixed(2)
      : '0.00';
  });
}

/**
 * Render a semester card
 * @param {Object} sem - Semester data
 * @param {number} index - Semester index
 * @param {string} cumGPA - Cumulative GPA
 * @returns {string} HTML string
 */
function renderSemesterCard(sem, index, cumGPA) {
  const semTotalCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
  const semGPA = calculateSemesterGPA(sem);

  const header = renderSemesterHeader(sem, semTotalCredits, semGPA, cumGPA);
  const table = renderCourseTable(sem);
  const button = renderAddCourseButton(sem.id);

  return html`
    <div class="card shadow-sm mb-3 ani-fade-in-up hover-translate-y" 
         style="animation-delay: ${index * 0.1}s">
      ${raw(header)}
      ${raw(table)}
      ${raw(button)}
    </div>
  `;
}

/**
 * Render semester header
 * @param {Object} sem - Semester data
 * @param {number} totalCredits - Total credits
 * @param {string} semGPA - Semester GPA
 * @param {string} cumGPA - Cumulative GPA
 * @returns {string} HTML string
 */
function renderSemesterHeader(sem, totalCredits, semGPA, cumGPA) {
  return html`
    <div class="card-header d-flex justify-content-between align-items-start align-items-md-center py-2 px-3">
      <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-1 gap-md-2" 
           style="min-width: 0; flex: 1;">
        <span class="fw-bold text-primary text-truncate">${sem.name}</span>
        <div class="d-flex gap-1 flex-wrap semester-header-badges">
          <span class="badge bg-light text-secondary border">${totalCredits} TC</span>
          <span class="badge bg-primary text-white border">GPA ${semGPA}</span>
          <span class="badge bg-success text-white border" title="GPA Tích lũy">
            <span class="d-none d-sm-inline">GPA </span>tích lũy ${cumGPA}
          </span>
        </div>
      </div>
      <div class="ms-2 flex-shrink-0">
        <button class="btn btn-sm btn-link text-danger delete-semester-btn p-1" 
                data-id="${sem.id}" title="Xóa học kỳ">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * Calculate semester GPA
 * @param {Object} sem - Semester data
 * @returns {string} GPA string
 */
function calculateSemesterGPA(sem) {
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

  return semGpaCredits > 0 ? (semGpaPoints / semGpaCredits).toFixed(2) : '0.00';
}

/**
 * Render course table
 * @param {Object} sem - Semester data
 * @returns {string} HTML string
 */
function renderCourseTable(sem) {
  return html`
    <div class="card-body p-2">
      <div class="table-responsive">
        <table class="table table-borderless align-middle mb-0">
          <thead class="text-muted small border-bottom text-nowrap">
            <tr>
              <th style="width: 35%">Môn học</th>
              <th style="width: 20%; min-width: 70px;">Tín chỉ</th>
              <th style="width: 20%; min-width: 75px;">Điểm</th>
              <th style="width: 20%; min-width: 50px;">Học cải thiện?</th>
              <th style="width: 5%"></th>
            </tr>
          </thead>
          <tbody>
            ${raw(sem.courses.map(course => renderCourseRow(sem.id, course)).join(''))}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Render a course row
 * @param {string} semId - Semester ID
 * @param {Object} course - Course data
 * @returns {string} HTML string
 */
function renderCourseRow(semId, course) {
  const gradeClass = course.grade === '' ? 'border-warning bg-warning-subtle' : '';

  return html`
    <tr>
      <td>
        <input type="text" class="form-control form-control-sm manual-input" 
               placeholder="Tên môn" value="${course.name}" 
               data-sem-id="${semId}" data-course-id="${course.id}" data-field="name">
      </td>
      <td>
        <div class="input-group input-group-sm flex-nowrap" style="min-width: 80px;">
          <button class="btn btn-outline-secondary px-1 adjust-credit-btn" type="button" 
                  data-action="decrease" data-sem-id="${semId}" data-course-id="${course.id}">-</button>
          <input type="number" class="form-control form-control-sm manual-input text-center px-0" 
                 value="${course.credits}" min="0" readonly
                 data-sem-id="${semId}" data-course-id="${course.id}" data-field="credits">
          <button class="btn btn-outline-secondary px-1 adjust-credit-btn" type="button" 
                  data-action="increase" data-sem-id="${semId}" data-course-id="${course.id}">+</button>
        </div>
      </td>
      <td>
        <select class="form-select form-select-sm manual-input ${gradeClass}"
                data-sem-id="${semId}" data-course-id="${course.id}" data-field="grade">
          <option value="" ${course.grade === '' ? 'selected' : ''}>--</option>
          ${raw(GRADE_SCALE.map(g =>
    html`<option value="${g.grade}" ${course.grade === g.grade ? 'selected' : ''}>${g.grade}</option>`
  ).join(''))}
        </select>
      </td>
      <td>
        <div class="d-flex flex-column gap-1">
          <div class="form-check form-switch">
            <input class="form-check-input manual-input" type="checkbox" 
                   ${course.isRetake ? 'checked' : ''}
                   data-sem-id="${semId}" data-course-id="${course.id}" data-field="isRetake">
          </div>
          ${course.isRetake ? raw(renderRetakeSelect(semId, course)) : ''}
        </div>
      </td>
      <td>
        <button class="btn btn-sm text-muted delete-course-btn" 
                data-sem-id="${semId}" data-course-id="${course.id}">
          <i class="bi bi-x-lg"></i>
        </button>
      </td>
    </tr>
  `;
}

/**
 * Render retake grade select
 * @param {string} semId - Semester ID
 * @param {Object} course - Course data
 * @returns {string} HTML string
 */
function renderRetakeSelect(semId, course) {
  const improvableGrades = GRADE_SCALE.filter(g =>
    !['A+', 'A', 'B+', 'B'].includes(g.grade)
  );

  return html`
    <select class="form-select form-select-xs manual-input" style="font-size: 0.75rem; padding: 2px;"
            data-sem-id="${semId}" data-course-id="${course.id}" data-field="oldGrade">
      <option value="" disabled ${!course.oldGrade ? 'selected' : ''}>Điểm cũ</option>
      ${raw(improvableGrades.map(g =>
    html`<option value="${g.grade}" ${course.oldGrade === g.grade ? 'selected' : ''}>${g.grade}</option>`
  ).join(''))}
    </select>
  `;
}

/**
 * Render add course button
 * @param {string} semId - Semester ID
 * @returns {string} HTML string
 */
function renderAddCourseButton(semId) {
  return html`
    <button class="btn btn-sm btn-light w-100 mt-2 text-muted add-course-btn" data-id="${semId}">
      <i class="bi bi-plus"></i> Thêm môn học
    </button>
  `;
}

/**
 * Render year summary if applicable
 * @param {Array} semesters - All semesters
 * @param {number} index - Current semester index
 * @param {Object} yearStats - Year statistics
 * @returns {string} HTML string
 */
function renderYearSummary(semesters, index, yearStats) {
  const sem = semesters[index];
  const currentYear = getYearInfo(sem.name);
  const nextSem = semesters[index + 1];
  const nextYear = nextSem ? getYearInfo(nextSem.name) : null;

  // Only show at end of year group
  if (nextYear && nextYear.id === currentYear.id) return '';

  const stat = yearStats[currentYear.id];
  if (!stat || stat.credits <= 0) return '';

  const yearGPA = (stat.points / stat.credits).toFixed(2);

  return html`
    <div class="alert alert-info d-flex justify-content-between align-items-center mb-3 shadow-sm border-info-subtle bg-info-subtle text-info-emphasis py-2 px-3">
      <div class="d-flex align-items-center overflow-hidden">
        <i class="bi bi-mortarboard-fill me-2 text-info opacity-75 d-none d-sm-inline-block"></i>
        <span class="fw-bold small text-truncate">GPA trung bình ${stat.label}</span>
      </div>
      <span class="badge bg-info text-dark border border-info-subtle ms-2" 
            style="font-size: 0.85rem; font-weight: 700;">GPA ${yearGPA}</span>
    </div>
  `;
}

// ==========================================
// Chart Rendering
// ==========================================

/**
 * Render GPA progress chart
 * @param {Array} semesters - Semesters data
 * @param {number} initialGpa - Initial GPA
 * @param {number} initialCredits - Initial credits
 */
export async function renderGPAChart(semesters, initialGpa, initialCredits) {
  const ctx = document.getElementById('gpa-chart');
  if (!ctx) return;

  if (!semesters || semesters.length === 0) {
    if (gpaChart) {
      gpaChart.destroy();
      gpaChart = null;
    }
    return;
  }

  await ensureChartJsLoaded();

  const dataPoints = [];
  const labels = [];

  calculateChartData(semesters, initialGpa, initialCredits, dataPoints, labels);

  if (gpaChart) {
    gpaChart.data.labels = labels;
    gpaChart.data.datasets[0].data = dataPoints;
    gpaChart.update();
  } else {
    gpaChart = createChart(ctx, labels, dataPoints);
  }
}

/**
 * Calculate data points for chart
 * @param {Array} semesters - Semesters
 * @param {number} initialGpa - Initial GPA
 * @param {number} initialCredits - Initial credits
 * @param {Array} dataPoints - Output data points
 * @param {Array} labels - Output labels
 */
function calculateChartData(semesters, initialGpa, initialCredits, dataPoints, labels) {
  let runningTotalPoints = (parseFloat(initialGpa) || 0) * (parseFloat(initialCredits) || 0);
  let runningTotalCredits = parseFloat(initialCredits) || 0;

  for (const sem of semesters) {
    for (const course of sem.courses) {
      const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
      const gpa = gradeInfo ? gradeInfo.gpa : 0;
      const credits = parseFloat(course.credits) || 0;

      if (course.isRetake) {
        const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
        const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;
        if (gpa > oldGpa) {
          runningTotalPoints += (gpa - oldGpa) * credits;
          if (oldGpa === 0 && gpa > 0) runningTotalCredits += credits;
        }
      } else {
        runningTotalPoints += gpa * credits;
        if (gpa > 0) runningTotalCredits += credits;
      }
    }

    const cumGPA = runningTotalCredits > 0
      ? (runningTotalPoints / runningTotalCredits).toFixed(2)
      : '0.00';

    dataPoints.push(parseFloat(cumGPA));
    labels.push(sem.name.replace('Năm học: ', '').replace(' - Học kỳ: ', ' '));
  }
}

/**
 * Create a new chart instance
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string[]} labels - Chart labels
 * @param {number[]} dataPoints - Data points
 * @returns {Chart} Chart instance
 */
function createChart(ctx, labels, dataPoints) {
  const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const textColor = isDarkMode ? '#adb5bd' : '#6c757d';
  const brandRed = '#d32f2f';

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'GPA Tích lũy',
        data: dataPoints,
        borderColor: brandRed,
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: brandRed,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => `GPA: ${context.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 4.0,
          ticks: {
            stepSize: 1,
            color: textColor,
            callback: function(value) {
              return value === 0 ? '0' : value.toFixed(1);
            }
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            color: textColor,
            font: { size: 10 }
          },
          grid: { display: false }
        }
      }
    }
  });
}

// ==========================================
// Target Result Rendering
// ==========================================

/**
 * Get status info based on required GPA
 * @param {number} requiredGPA - Required GPA
 * @param {number} creditsToStudy - Credits to study
 * @param {number} requiredPoints - Points needed
 * @param {number} maxAchievableGPA - Maximum achievable GPA (when required > 4.0)
 * @returns {Object} Status info
 */
export function getTargetStatusInfo(requiredGPA, creditsToStudy, requiredPoints, maxAchievableGPA = null) {
  // Impossible
  if (requiredGPA > 4.0) {
    const maxGpaText = maxAchievableGPA !== null ? maxAchievableGPA.toFixed(2) : '4.00';
    return {
      icon: 'bi-x-circle-fill',
      color: 'danger',
      message: `Không khả thi! GPA tối đa có thể đạt: ${maxGpaText}`,
      badgeClass: 'bg-danger-subtle text-danger-emphasis border-danger-subtle'
    };
  }

  // Already achieved or no credits needed
  if (requiredGPA <= 0) {
    if (creditsToStudy === 0 && requiredPoints > 0.01) {
      return {
        icon: 'bi-exclamation-triangle-fill',
        color: 'danger',
        message: 'Không thể đạt được! Hết tín chỉ để cải thiện.',
        badgeClass: 'bg-danger-subtle text-danger-emphasis border-danger-subtle'
      };
    }

    return {
      icon: 'bi-trophy-fill',
      color: 'primary',
      message: 'Đã đạt mục tiêu! Hãy duy trì phong độ.',
      badgeClass: 'bg-primary-subtle text-primary-emphasis border-primary-subtle'
    };
  }

  // Very difficult
  if (requiredGPA > 3.6) {
    return {
      icon: 'bi-exclamation-circle-fill',
      color: 'warning',
      message: 'Khó! Cần nỗ lực rất lớn.',
      badgeClass: 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
    };
  }

  // Achievable
  return {
    icon: 'bi-check-circle-fill',
    color: 'success',
    message: 'Khả thi! Bạn hoàn toàn có thể đạt được.',
    badgeClass: 'bg-success-subtle text-success-emphasis border-success-subtle'
  };
}

// ==========================================
// Exports
// ==========================================

export {
  gpaChart,
  ensureChartJsLoaded
};
