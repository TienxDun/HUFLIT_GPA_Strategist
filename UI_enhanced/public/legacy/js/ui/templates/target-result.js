/**
 * Target Result Templates
 * HTML templates for target GPA calculation results
 */

import { raw } from '../components/template-utils.js';

/**
 * Get status info based on required GPA
 * @param {number} requiredGPA - Required GPA
 * @param {number} creditsToStudy - Credits to study
 * @param {number} requiredPoints - Points needed
 * @param {number} maxAchievableGPA - Maximum achievable GPA (when required > 4.0)
 * @returns {Object} Status info
 */
export function getStatusInfo(requiredGPA, creditsToStudy, requiredPoints, maxAchievableGPA = null) {
  if (requiredGPA > 4.0) {
    return {
      icon: 'bi-x-circle-fill',
      color: 'danger',
      message: 'Không khả thi! Vượt quá giới hạn 4.0',
      badgeClass: 'bg-danger-subtle text-danger-emphasis border-danger-subtle'
    };
  }

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

  if (requiredGPA > 3.6) {
    return {
      icon: 'bi-exclamation-circle-fill',
      color: 'warning',
      message: 'Khó! Cần nỗ lực rất lớn.',
      badgeClass: 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
    };
  }

  return {
    icon: 'bi-check-circle-fill',
    color: 'success',
    message: 'Khả thi! Bạn hoàn toàn có thể đạt được.',
    badgeClass: 'bg-success-subtle text-success-emphasis border-success-subtle'
  };
}

/**
 * Render scenario HTML
 * @param {Object} combination - Grade combination
 * @returns {string} HTML string
 */
export function renderScenario(scenarioText) {
  return `
    <div class="alert alert-primary border-0 shadow-sm rounded-3 mb-4 py-3 ani-fade-in-up">
      <div class="d-flex align-items-center">
        <div class="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;">
          <i class="bi bi-lightbulb-fill"></i>
        </div>
        <div>
          <h6 class="fw-bold mb-1">Kịch bản gợi ý</h6>
          <p class="mb-0 small">${scenarioText}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a single grade combination card
 * @param {Object} c - Combination data
 * @returns {string} HTML string
 */
function renderCombinationCard(c) {
  return `
    <div class="bg-light rounded-3 p-2 p-md-3 border transition-all">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="badge bg-white text-dark border-0 shadow-sm text-uppercase small px-2">Kết hợp ${c.g1.grade} &amp; ${c.g2.grade}</span>
        <div class="text-success fw-bold small">
          <i class="bi bi-record-fill me-1"></i>${c.totalPoints.toFixed(2)}đ
        </div>
      </div>
      <div class="row g-2 align-items-stretch">
        <div class="col-5 col-sm-5">
          <div class="p-2 rounded border bg-white position-relative overflow-hidden h-100">
            <div class="position-absolute top-0 start-0 bottom-0 bg-${c.g1.color}" style="width: 3px; opacity: 0.8;"></div>
            <div class="d-flex justify-content-between align-items-center ps-1">
              <span class="fw-bold fs-5 text-${c.g1.color}">${c.g1.grade}</span>
              <span class="badge bg-light text-secondary border-0 p-1 small" style="font-size: 0.6rem !important;">${c.c1} TC</span>
            </div>
          </div>
        </div>
        <div class="col-2 col-sm-2 d-flex align-items-center justify-content-center text-muted small">
          <i class="bi bi-plus-lg"></i>
        </div>
        <div class="col-5 col-sm-5">
          <div class="p-2 rounded border bg-white position-relative overflow-hidden h-100">
            <div class="position-absolute top-0 start-0 bottom-0 bg-${c.g2.color}" style="width: 3px; opacity: 0.8;"></div>
            <div class="d-flex justify-content-between align-items-center ps-1">
              <span class="fw-bold fs-5 text-${c.g2.color}">${c.g2.grade}</span>
              <span class="badge bg-light text-secondary border-0 p-1 small" style="font-size: 0.6rem !important;">${c.c2} TC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render combinations section
 * @param {Array} combinations - Grade combinations
 * @returns {string} HTML string
 */
export function renderCombinations(combinations) {
  if (combinations.length === 0) {
    return '<div class="text-center text-muted small py-3">Không tìm thấy tổ hợp phù hợp.</div>';
  }

  const displayedCount = Math.min(combinations.length, 10);
  const topCombinations = combinations.slice(0, 10);

  return `
    <div class="px-2 px-md-3 pb-3 border-top mt-2">
      <div class="pt-3 mb-3 d-flex align-items-center justify-content-between">
        <p class="small fw-bold text-secondary text-uppercase mb-0 d-flex align-items-center">
          <i class="bi bi-layers me-2"></i>Các phương án khả thi
        </p>
        <span class="badge bg-light text-secondary rounded-pill border">${displayedCount} tổ hợp</span>
      </div>
      <div class="d-flex flex-column gap-2 gap-md-3 overflow-auto pe-1 custom-scrollbar" style="max-height: 500px;">
        ${topCombinations.map(renderCombinationCard).join('')}
      </div>
      <div class="mt-2 small text-muted text-center fst-italic">Danh sách sắp xếp theo mức độ đạt được từ dễ - khó</div>
    </div>
  `;
}

/**
 * Render algorithm details section
 * @param {Object} params - Calculation parameters
 * @returns {string} HTML string
 */
export function renderAlgorithmDetails({ targetGPA, currentCredits, result }) {
  return `
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
              <span class="fw-bold text-white small">3</span>
            </div>
            <div class="card flex-grow-1 bg-primary text-white border-0 shadow">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div class="small text-white text-uppercase fw-bold opacity-75">Điểm cần tích lũy thêm</div>
                    <div class="h4 font-monospace fw-bold mb-0">${result.requiredPoints.toFixed(2)}</div>
                  </div>
                  <div class="text-end">
                    <div class="small text-white opacity-75">Tổng tín chỉ học</div>
                    <div class="fw-bold">${result.newCredits} TC</div>
                  </div>
                </div>
                <div class="border-top border-white-50 pt-3 d-flex justify-content-between align-items-center">
                  <span class="small fw-medium text-white opacity-75">GPA Trung bình cần đạt</span>
                  <span class="badge bg-white bg-opacity-25 px-2 py-1 rounded font-monospace">${result.requiredPoints.toFixed(2)} / ${result.newCredits} = ${result.requiredGPA.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render retake suggestions section
 * @param {number} deficitPoints - Points deficit
 * @param {Array} suggestions - Retake suggestions
 * @returns {string} HTML string
 */
export function renderRetakeSuggestions(deficitPoints, suggestions) {
  if (suggestions.length === 0) return '';

  return `
    <div class="mt-4 border-top pt-3">
      <div class="alert alert-warning border-warning-subtle bg-warning-subtle text-dark mb-3">
        <div class="d-flex">
          <i class="bi bi-exclamation-triangle-fill text-warning-emphasis me-2 fs-5"></i>
          <div>
            <strong>Mục tiêu hiện tại quá cao!</strong>
            <div class="small mt-1">Ngay cả khi bạn đạt 4.0 cho tất cả các môn còn lại, bạn vẫn thiếu khoảng <strong>${deficitPoints.toFixed(2)}</strong> điểm tích lũy.</div>
            <div class="small mt-1">Dưới đây là các phương án <strong>học cải thiện</strong> các môn điểm thấp trong quá khứ để bù đắp số điểm còn thiếu:</div>
          </div>
        </div>
      </div>

      <h6 class="text-danger fw-bold mb-3"><i class="bi bi-lightbulb-fill me-2"></i>Gợi ý môn học lại tối ưu:</h6>
      <div class="list-group">
        ${suggestions.map((s, index) => `
          <div class="list-group-item list-group-item-action border-danger-subtle bg-white mb-2 rounded shadow-sm">
            <div class="d-flex w-100 justify-content-between align-items-center mb-2">
              <span class="badge bg-danger text-white rounded-pill">Phương án ${index + 1}</span>
              <span class="text-success fw-bold small"><i class="bi bi-graph-up-arrow me-1"></i>Tăng thêm ${s.totalGain.toFixed(2)} điểm</span>
            </div>
            
            ${s.courses.map(c => `
              <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2 last-no-border">
                <div>
                  <div class="fw-bold text-dark">${c.name}</div>
                  <div class="small text-muted">${c.semName} • ${c.credits} TC</div>
                </div>
                <div class="d-flex align-items-center bg-light rounded px-2 py-1">
                  <span class="fw-bold text-secondary">${c.grade}</span>
                  <i class="bi bi-arrow-right-short mx-1 text-muted"></i>
                  <span class="fw-bold text-success">A (4.0)</span>
                </div>
              </div>
            `).join('')}
            
            <div class="small text-muted fst-italic mt-1">
              <i class="bi bi-info-circle me-1"></i>Tổng tín chỉ học lại: <strong>${s.totalCredits} TC</strong>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render max achievable GPA info box
 * @param {number} maxAchievableGPA - Maximum achievable GPA
 * @returns {string} HTML string
 */
function renderMaxGpaInfo(maxAchievableGPA) {
  return `
    <div class="mt-3">
      <div class="bg-light rounded-3 p-3 border">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-secondary small fw-medium">
            <i class="bi bi-arrow-up-circle-fill text-success me-2"></i>GPA tối đa có thể đạt
          </span>
          <span class="fw-bold text-success fs-5">${maxAchievableGPA.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render main result container
 * @param {Object} params - All parameters needed for rendering
 * @returns {string} Complete HTML string
 */
export function renderMainResult({ result, status, creditsToStudy, scenarioText, combinations, showCombinations, maxAchievableGPA }) {
  const isImpossible = result.requiredGPA > 4.0;
  const maxGpaDisplay = isImpossible && maxAchievableGPA !== null 
    ? renderMaxGpaInfo(maxAchievableGPA)
    : '';
  
  return `
    <div class="text-center mb-4 w-100">
      <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-${status.color} text-white shadow-sm mb-3" style="width: 60px; height: 60px;">
        <i class="bi ${status.icon} fs-2"></i>
      </div>
      <h6 class="text-uppercase text-secondary fw-bold small letter-spacing-1 mb-2">GPA Trung bình cần đạt</h6>
      <div class="display-1 fw-bold text-${status.color}-emphasis mb-2" id="animated-required-gpa" style="letter-spacing: -2px;">
        0.00
      </div>
      <p class="text-muted fw-medium mb-0">cho <span class="fw-bold text-dark">${creditsToStudy}</span> tín chỉ tiếp theo</p>
      ${maxGpaDisplay}
      <div class="mt-3">
        <span class="badge rounded-pill ${status.badgeClass} px-3 py-2 border">
          ${status.message}
        </span>
      </div>
    </div>

    ${scenarioText ? renderScenario(scenarioText) : ''}
    ${showCombinations ? renderCombinations(combinations) : ''}
  `;
}
