/**
 * UI Event Handlers
 * Handles user interactions and coordinates between UI, state, and calculations
 */
import { GRADE_SCALE } from "../core/constants.js";
import { API_CONFIG } from "../core/config.js";
import { debounce, throttle, isMobileDevice } from "../core/helpers.js";
import { validateFeedbackContent } from "../core/validators.js";
import {
  getManualState,
  setManualState,
  addManualSemester,
  removeManualSemester,
  updateManualCourse,
  addManualCourse,
  removeManualCourse,
  loadManualStateFromStorage,
  getTargetState,
  setTargetState,
  loadTargetStateFromStorage,
  subscribe,
} from "../state/store.js";
import {
  calculateManualGPA,
  calculateTargetResult,
  generateRetakeSuggestions,
  generateGradeCombinations,
  generateScenarioText,
} from "../core/calculator.js";
import { ManualActions } from "../state/actions.js";
import { renderManualSemesters } from "./renderers.js";
import { animateValue, triggerHapticFeedback, showToast } from "./effects.js";
import { parsePortalText } from "../core/utils.js";
import { generateShareUrl } from "../core/share.js";
import {
  getStatusInfo,
  renderMainResult,
  renderAlgorithmDetails,
  renderRetakeSuggestions,
} from "./templates/target-result.js";
// ==========================================
// Performance Utilities
// ==========================================
const isMobile = isMobileDevice();
const RENDER_DEBOUNCE_MS = isMobile ? 200 : 50;
const throttledHaptic = throttle(
  (duration) => triggerHapticFeedback(duration),
  300,
);
// ==========================================
// Tab: Manual GPA Calculation
// ==========================================
export function initManualCalcTab() {
  const elements = {
    addSemesterBtn: document.getElementById("add-semester-btn"),
    manualSemesterList: document.getElementById("manual-semester-list"),
    resetManualBtn: document.getElementById("reset-manual-btn"),
    manualInitialGpaInput: document.getElementById("manual-initial-gpa"),
    manualInitialCreditsInput: document.getElementById(
      "manual-initial-credits",
    ),
    processImportBtn: document.getElementById("process-import-btn"),
    applyBtn: document.getElementById("apply-manual-to-target-btn"),
  };
  if (!elements.addSemesterBtn) return;
  setupManualCalcEventListeners(elements);
  setupImportHandler(elements.processImportBtn);
  setupApplyToTargetHandler(elements.applyBtn);
  // Subscribe to state changes
  subscribe(
    debounce(() => {
      renderManualSemesters();
      updateManualCalculationDisplay();
    }, RENDER_DEBOUNCE_MS),
  );
  // Initial load
  loadManualStateFromStorage();
}
function setupManualCalcEventListeners(elements) {
  // Add semester
  elements.addSemesterBtn.addEventListener("click", handleAddSemester);
  // Reset
  elements.resetManualBtn.addEventListener("click", handleResetManual);
  // Initial data inputs
  elements.manualInitialGpaInput.addEventListener("input", (e) => {
    setManualState({ initialGpa: e.target.value });
  });
  elements.manualInitialCreditsInput.addEventListener("input", (e) => {
    setManualState({ initialCredits: e.target.value });
  });
  // Event delegation for dynamic elements
  setupSemesterListDelegation(elements.manualSemesterList);
}
function handleAddSemester() {
  const { semesters } = getManualState();
  const nextNum = semesters.length + 1;
  const nextName = generateNextSemesterName(semesters, nextNum);
  addManualSemester({
    id: Date.now(),
    name: nextName,
    courses: [],
  });
  throttledHaptic(20);
}
function generateNextSemesterName(semesters, nextNum) {
  if (semesters.length === 0) return `Học kỳ ${nextNum}`;
  const lastSem = semesters[semesters.length - 1];
  const match = lastSem.name.match(/HK(\d+)\s*\((\d{4})-(\d{4})\)/);
  if (!match) return `Học kỳ ${nextNum}`;
  let hk = parseInt(match[1]);
  let y1 = parseInt(match[2]);
  let y2 = parseInt(match[3]);
  hk++;
  if (hk > 3) {
    hk = 1;
    y1++;
    y2++;
  }
  return `HK0${hk} (${y1}-${y2})`;
}
function handleResetManual() {
  if (!confirm("Bạn có chắc muốn xóa toàn bộ dữ liệu tính thủ công?")) return;
  setManualState({
    semesters: [],
    initialGpa: "",
    initialCredits: "",
  });
  const gpaInput = document.getElementById("manual-initial-gpa");
  const creditsInput = document.getElementById("manual-initial-credits");
  if (gpaInput) gpaInput.value = "";
  if (creditsInput) creditsInput.value = "";
}
function setupSemesterListDelegation(list) {
  let deleteTimeout = null;
  list.addEventListener("click", (e) => {
    const target = e.target;
    // Adjust credit
    const adjustBtn = target.closest(".adjust-credit-btn");
    if (adjustBtn) {
      handleAdjustCredit(adjustBtn);
      return;
    }
    // Delete semester (request confirmation)
    const deleteBtn = target.closest(".delete-semester-btn");
    if (deleteBtn) {
      handleDeleteRequest(deleteBtn, deleteTimeout);
      return;
    }
    // Confirm delete semester
    const confirmBtn = target.closest(".confirm-delete-semester-btn");
    if (confirmBtn) {
      handleConfirmDelete(confirmBtn, deleteTimeout);
      return;
    }
    // Add course
    if (target.closest(".add-course-btn")) {
      const semId = target.closest(".add-course-btn").dataset.id;
      addManualCourse(semId, {
        id: Date.now(),
        name: "",
        credits: 3,
        grade: "",
        isRetake: false,
        oldGrade: "",
      });
      throttledHaptic();
      return;
    }
    // Delete course
    if (target.closest(".delete-course-btn")) {
      const btn = target.closest(".delete-course-btn");
      removeManualCourse(btn.dataset.semId, btn.dataset.courseId);
      throttledHaptic(15);
    }
  });
  list.addEventListener("change", (e) => {
    const target = e.target;
    if (target.classList.contains("manual-input")) {
      const { semId, courseId, field } = target.dataset;
      const value = target.type === "checkbox" ? target.checked : target.value;
      updateManualCourse(semId, courseId, field, value);
      throttledHaptic();
    }
  });
  list.addEventListener("input", (e) => {
    const target = e.target;
    if (
      target.classList.contains("manual-input") &&
      target.dataset.field === "credits"
    ) {
      const { semId, courseId } = target.dataset;
      updateManualCourse(semId, courseId, "credits", target.value);
    }
  });
}
function handleAdjustCredit(btn) {
  const { semId, courseId, action } = btn.dataset;
  const delta = action === "increase" ? 1 : -1;
  const { semesters } = getManualState();
  const semester = semesters.find((s) => String(s.id) === String(semId));
  if (!semester) return;
  const course = semester.courses.find(
    (c) => String(c.id) === String(courseId),
  );
  if (!course) return;
  let val = parseFloat(course.credits) || 0;
  val += delta;
  if (val < 0) val = 0;
  updateManualCourse(semId, courseId, "credits", val);
  throttledHaptic();
}
function handleDeleteRequest(deleteBtn, deleteTimeout) {
  if (deleteTimeout) clearTimeout(deleteTimeout);
  deleteBtn.classList.remove("delete-semester-btn", "text-danger", "btn-link");
  deleteBtn.classList.add(
    "confirm-delete-semester-btn",
    "btn-danger",
    "text-white",
  );
  deleteBtn.innerHTML = "Xóa?";
  setTimeout(() => {
    if (
      deleteBtn &&
      document.body.contains(deleteBtn) &&
      deleteBtn.classList.contains("confirm-delete-semester-btn")
    ) {
      deleteBtn.classList.add("delete-semester-btn", "text-danger", "btn-link");
      deleteBtn.classList.remove(
        "confirm-delete-semester-btn",
        "btn-danger",
        "text-white",
      );
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    }
  }, 2000);
}
function handleConfirmDelete(confirmBtn, deleteTimeout) {
  if (deleteTimeout) clearTimeout(deleteTimeout);
  removeManualSemester(confirmBtn.dataset.id);
  throttledHaptic(25);
}
function setupApplyToTargetHandler(applyBtn) {
  if (!applyBtn) return;
  applyBtn.addEventListener("click", () => {
    const manualGpaDisplay = document.getElementById("manual-gpa");
    const manualCreditsDisplay = document.getElementById("manual-credits");
    const gpa = manualGpaDisplay?.textContent || "0";
    const credits = manualCreditsDisplay?.textContent || "0";
    const targetGpaInput = document.getElementById("current-gpa");
    const targetCreditsInput = document.getElementById("current-credits");
    const goalGpaInput = document.getElementById("target-gpa");
    const newCreditsInput = document.getElementById("new-credits");
    if (!targetGpaInput || !targetCreditsInput) return;
    const remainingCredits = calculateRemainingCredits();
    targetGpaInput.value = gpa;
    targetCreditsInput.value = credits;
    targetGpaInput.dispatchEvent(new Event("input"));
    targetCreditsInput.dispatchEvent(new Event("input"));
    if (newCreditsInput) {
      newCreditsInput.value = remainingCredits > 0 ? remainingCredits : "";
      newCreditsInput.dispatchEvent(new Event("input"));
      if (remainingCredits > 0) {
        const newCreditsGroup = document.getElementById("new-credits-group");
        const totalCreditsGroup = document.getElementById(
          "total-credits-group",
        );
        if (newCreditsGroup && totalCreditsGroup) {
          newCreditsGroup.classList.remove("d-none");
          totalCreditsGroup.classList.add("d-none");
        }
        newCreditsInput.classList.add("is-valid");
        setTimeout(() => newCreditsInput.classList.remove("is-valid"), 2000);
      }
    }
    suggestTargetGPA(goalGpaInput, parseFloat(gpa));
    switchToTargetTab();
    highlightInputs([targetGpaInput, targetCreditsInput]);
    focusCreditsInput(newCreditsInput);
  });
}
function calculateRemainingCredits() {
  const { semesters } = getManualState();
  let remainingCredits = 0;
  semesters.forEach((sem) => {
    sem.courses?.forEach((course) => {
      const hasValidGrade =
        course.grade && GRADE_SCALE.some((g) => g.grade === course.grade);
      if (!hasValidGrade) {
        remainingCredits += parseFloat(course.credits) || 0;
      }
    });
  });
  return remainingCredits;
}
function suggestTargetGPA(goalGpaInput, currentGpaVal) {
  if (!goalGpaInput) return;
  let suggestedTarget = "4.0";
  if (currentGpaVal < 2.0) suggestedTarget = "2.0";
  else if (currentGpaVal < 2.5) suggestedTarget = "2.5";
  else if (currentGpaVal < 3.2) suggestedTarget = "3.2";
  else if (currentGpaVal < 3.6) suggestedTarget = "3.6";
  goalGpaInput.value = suggestedTarget;
  goalGpaInput.dispatchEvent(new Event("input"));
  goalGpaInput.classList.add("is-valid");
  setTimeout(() => goalGpaInput.classList.remove("is-valid"), 2000);
}
function switchToTargetTab() {
  const targetTabBtn = document.querySelector(
    'button[data-bs-target="#pills-target"]',
  );
  if (targetTabBtn) {
    const tab = bootstrap.Tab.getOrCreateInstance(targetTabBtn);
    tab.show();
  }
}
function highlightInputs(inputs) {
  inputs.forEach((input) => {
    if (input) {
      input.classList.add("is-valid");
      setTimeout(() => input.classList.remove("is-valid"), 2000);
    }
  });
}
function focusCreditsInput(newCreditsInput) {
  const totalCreditsInput = document.getElementById("total-credits");
  if (newCreditsInput && newCreditsInput.offsetParent !== null) {
    newCreditsInput.focus();
    newCreditsInput.select();
  } else if (totalCreditsInput) {
    totalCreditsInput.focus();
    totalCreditsInput.select();
  }
}
function setupImportHandler(processImportBtn) {
  if (!processImportBtn) return;
  processImportBtn.addEventListener("click", () => {
    const text = document.getElementById("import-text-area")?.value || "";
    if (!text.trim()) {
      showToast("Vui lòng dán nội dung bảng điểm vào ô trống.", "warning");
      return;
    }
    const importedSemesters = parsePortalText(text);
    if (importedSemesters.length === 0) {
      showToast(
        "Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại định dạng copy.",
        "error",
      );
      return;
    }
    // Clear input fields
    const manualInitialGpaInput = document.getElementById("manual-initial-gpa");
    const manualInitialCreditsInput = document.getElementById(
      "manual-initial-credits",
    );
    if (manualInitialGpaInput) manualInitialGpaInput.value = "";
    if (manualInitialCreditsInput) manualInitialCreditsInput.value = "";
    const success = ManualActions.importFromPortal(importedSemesters);
    if (!success) {
      showToast("Có lỗi xảy ra khi nhập dữ liệu. Vui lòng thử lại.", "error");
      return;
    }
    const addedCount = importedSemesters.reduce(
      (sum, sem) => sum + (sem.courses?.length || 0),
      0,
    );
    processImportBtn.blur();
    const modalEl = document.getElementById("importModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    const textArea = document.getElementById("import-text-area");
    if (textArea) textArea.value = "";
    setTimeout(() => {
      showToast(
        `Đã nhập thành công ${importedSemesters.length} học kỳ với ${addedCount} môn học.`,
        "success",
      );
    }, 150);
  });
}
function updateManualCalculationDisplay() {
  const { semesters, initialGpa, initialCredits } = getManualState();
  const { gpa, totalCredits, rank } = calculateManualGPA(
    semesters,
    parseFloat(initialGpa) || 0,
    parseFloat(initialCredits) || 0,
  );
  const manualGpaDisplay = document.getElementById("manual-gpa");
  const manualCreditsDisplay = document.getElementById("manual-credits");
  const manualRankDisplay = document.getElementById("manual-rank");
  if (manualGpaDisplay) {
    const currentVal = parseFloat(manualGpaDisplay.textContent) || 0;
    animateValue(manualGpaDisplay, currentVal, gpa, 800, 2);
    manualGpaDisplay.className = `display-1 fw-bold mb-2 ${gpa >= 3.2 ? "text-success" : gpa >= 2.5 ? "text-primary" : "text-danger"}`;
  }
  if (manualCreditsDisplay) manualCreditsDisplay.textContent = totalCredits;
  if (manualRankDisplay) manualRankDisplay.textContent = rank;
}
// ==========================================
// Tab: Target GPA
// ==========================================
export function initTargetGPATab() {
  const elements = getTargetElements();
  if (!elements.calcTargetBtn) return;
  loadTargetStateFromStorage();
  restoreUIState(elements);
  setupTargetEventListeners(elements);
  subscribe(() => {
    // Update UI based on state if needed
  });
}
function getTargetElements() {
  return {
    calcTargetBtn: document.getElementById("calc-target-btn"),
    currentGpaInput: document.getElementById("current-gpa"),
    currentCreditsInput: document.getElementById("current-credits"),
    targetGpaInput: document.getElementById("target-gpa"),
    newCreditsInput: document.getElementById("new-credits"),
    totalCreditsInput: document.getElementById("total-credits"),
    retakeToggle: document.getElementById("retake-toggle"),
    retakeArea: document.getElementById("retake-area"),
    retakeList: document.getElementById("retake-list"),
    addRetakeBtn: document.getElementById("add-retake-btn"),
    btnSwitchToTotal: document.getElementById("btn-switch-to-total"),
    btnSwitchToNew: document.getElementById("btn-switch-to-new"),
    newCreditsGroup: document.getElementById("new-credits-group"),
    totalCreditsGroup: document.getElementById("total-credits-group"),
    shareTargetBtn: document.getElementById("share-target-btn"),
  };
}
function restoreUIState(elements) {
  const initialState = getTargetState();
  if (elements.currentGpaInput)
    elements.currentGpaInput.value = initialState.currentGpa || "";
  if (elements.currentCreditsInput)
    elements.currentCreditsInput.value = initialState.currentCredits || "";
  if (elements.targetGpaInput)
    elements.targetGpaInput.value = initialState.targetGpa || "";
  if (elements.newCreditsInput)
    elements.newCreditsInput.value = initialState.newCredits || "";
  if (elements.totalCreditsInput)
    elements.totalCreditsInput.value = initialState.totalCredits || "";
  if (initialState.creditMode === "total") {
    elements.newCreditsGroup?.classList.add("d-none");
    elements.totalCreditsGroup?.classList.remove("d-none");
  } else {
    elements.totalCreditsGroup?.classList.add("d-none");
    elements.newCreditsGroup?.classList.remove("d-none");
  }
  if (elements.retakeToggle) {
    elements.retakeToggle.checked = initialState.isRetake || false;
    if (initialState.isRetake) {
      elements.retakeArea?.classList.remove("d-none");
      elements.retakeList.innerHTML = "";
      initialState.retakes.forEach((r) => addRetakeItemUI(r));
    } else {
      elements.retakeArea?.classList.add("d-none");
    }
  }
}
function setupTargetEventListeners(elements) {
  // Input listeners
  const inputs = [
    elements.currentGpaInput,
    elements.currentCreditsInput,
    elements.targetGpaInput,
    elements.newCreditsInput,
    elements.totalCreditsInput,
  ].filter(Boolean);
  inputs.forEach((input) => {
    input.addEventListener("input", () => saveStateFromInputs(elements));
  });
  // Credit mode switches
  setupCreditModeSwitches(elements);
  // Retake toggle
  elements.retakeToggle?.addEventListener("change", (e) => {
    if (e.target.checked) {
      elements.retakeArea?.classList.remove("d-none");
      if (elements.retakeList.children.length === 0) addRetakeItemUI();
    } else {
      elements.retakeArea?.classList.add("d-none");
      elements.retakeList.innerHTML = "";
    }
    saveStateFromInputs(elements);
  });
  // Add retake button
  elements.addRetakeBtn?.addEventListener("click", () => {
    addRetakeItemUI();
    saveStateFromInputs(elements);
  });
  // Calculate button
  elements.calcTargetBtn?.addEventListener("click", () =>
    handleCalculateTarget(elements),
  );
  // Share button
  elements.shareTargetBtn?.addEventListener("click", handleShareTarget);
}
function setupCreditModeSwitches(elements) {
  elements.btnSwitchToTotal?.addEventListener("click", () => {
    setTargetState({ creditMode: "total" });
    elements.newCreditsGroup?.classList.add("d-none");
    elements.totalCreditsGroup?.classList.remove("d-none");
    const current = parseFloat(elements.currentCreditsInput?.value) || 0;
    const newCred = parseFloat(elements.newCreditsInput?.value) || 0;
    if (!elements.totalCreditsInput?.value)
      elements.totalCreditsInput.value = current + newCred;
    saveStateFromInputs(elements);
  });
  elements.btnSwitchToNew?.addEventListener("click", () => {
    setTargetState({ creditMode: "new" });
    elements.totalCreditsGroup?.classList.add("d-none");
    elements.newCreditsGroup?.classList.remove("d-none");
    const current = parseFloat(elements.currentCreditsInput?.value) || 0;
    const total = parseFloat(elements.totalCreditsInput?.value) || 0;
    if (!elements.newCreditsInput?.value)
      elements.newCreditsInput.value = Math.max(0, total - current);
    saveStateFromInputs(elements);
  });
  // Sync logic
  elements.totalCreditsInput?.addEventListener("input", () => {
    const total = parseFloat(elements.totalCreditsInput.value) || 0;
    const current = parseFloat(elements.currentCreditsInput?.value) || 0;
    if (elements.newCreditsInput)
      elements.newCreditsInput.value = Math.max(0, total - current);
    saveStateFromInputs(elements);
  });
  elements.newCreditsInput?.addEventListener("input", () => {
    const newCred = parseFloat(elements.newCreditsInput?.value) || 0;
    const current = parseFloat(elements.currentCreditsInput?.value) || 0;
    if (elements.totalCreditsInput)
      elements.totalCreditsInput.value = current + newCred;
    saveStateFromInputs(elements);
  });
  elements.currentCreditsInput?.addEventListener("input", () => {
    const current = parseFloat(elements.currentCreditsInput.value) || 0;
    const { creditMode } = getTargetState();
    if (creditMode === "total") {
      const total = parseFloat(elements.totalCreditsInput?.value) || 0;
      if (elements.newCreditsInput)
        elements.newCreditsInput.value = Math.max(0, total - current);
    } else {
      const newCred = parseFloat(elements.newCreditsInput?.value) || 0;
      if (elements.totalCreditsInput)
        elements.totalCreditsInput.value = current + newCred;
    }
    saveStateFromInputs(elements);
  });
}
function saveStateFromInputs(elements) {
  const retakes = [];
  if (elements.retakeToggle?.checked) {
    Array.from(elements.retakeList?.children || []).forEach((item) => {
      const oldGradeSelect = item.querySelector(".retake-old-grade");
      const creditsInput = item.querySelector(".retake-credits");
      if (oldGradeSelect && creditsInput) {
        retakes.push({
          oldGrade: parseFloat(oldGradeSelect.value),
          credits: parseFloat(creditsInput.value),
        });
      }
    });
  }
  setTargetState({
    currentGpa: elements.currentGpaInput?.value || "",
    currentCredits: elements.currentCreditsInput?.value || "",
    targetGpa: elements.targetGpaInput?.value || "",
    newCredits: elements.newCreditsInput?.value || "",
    totalCredits: elements.totalCreditsInput?.value || "",
    isRetake: elements.retakeToggle?.checked || false,
    retakes,
  });
}
function handleCalculateTarget(elements) {
  triggerHapticFeedback(30);
  const state = getTargetState();
  const currentGPA = parseFloat(state.currentGpa) || 0;
  const currentCredits = parseFloat(state.currentCredits) || 0;
  const targetGPA = parseFloat(state.targetGpa) || 0;
  let newCredits = parseFloat(state.newCredits) || 0;
  if (state.creditMode === "total") {
    const total = parseFloat(state.totalCredits) || 0;
    newCredits = Math.max(0, total - currentCredits);
  }
  const result = calculateTargetResult(
    currentGPA,
    currentCredits,
    targetGPA,
    newCredits,
    state.retakes,
  );
  const creditsToStudy = result.totalEffortCredits ?? result.newCredits;
  // Show action buttons
  elements.shareTargetBtn?.classList.remove("d-none");
  elements.exportPdfBtn?.classList.remove("d-none");
  renderTargetResult(result, creditsToStudy, currentCredits, targetGPA);
}
function renderTargetResult(result, creditsToStudy, currentCredits, targetGPA) {
  const container = document.getElementById("target-result-container");
  if (!container) return;
  // Calculate maximum achievable GPA when required > 4.0
  let maxAchievableGPA = null;
  if (result.requiredGPA > 4.0) {
    const maxPossiblePoints =
      result.effectiveCurrentPoints + 4.0 * creditsToStudy;
    maxAchievableGPA = maxPossiblePoints / result.totalFutureCredits;
  }
  const status = getStatusInfo(
    result.requiredGPA,
    creditsToStudy,
    result.requiredPoints,
    maxAchievableGPA,
  );
  // Generate combinations if applicable
  let combinations = [];
  let scenarioText = "";
  const showCombinations =
    result.requiredGPA > 0 && result.requiredGPA <= 4.0 && creditsToStudy > 0;
  if (showCombinations) {
    combinations = generateGradeCombinations(
      creditsToStudy,
      result.requiredPoints,
    );
    if (combinations.length > 0) {
      scenarioText = generateScenarioText(combinations[0]);
    }
  }
  // Build HTML
  container.className = "card-body d-flex flex-column p-3 p-md-4";
  let html = renderMainResult({
    result,
    status,
    creditsToStudy,
    scenarioText,
    combinations,
    showCombinations,
    maxAchievableGPA,
  });
  html += renderAlgorithmDetails({ targetGPA, currentCredits, result });
  // Add retake suggestions if impossible
  if (result.requiredGPA > 4.0) {
    const deficitPoints = result.requiredPoints - 4.0 * result.newCredits;
    const { semesters } = getManualState();
    const suggestions = generateRetakeSuggestions(
      deficitPoints,
      targetGPA,
      semesters,
    );
    html += renderRetakeSuggestions(deficitPoints, suggestions);
  }
  container.innerHTML = html;
  // Animate GPA value - always show required GPA (even if > 4.0)
  animateGPAResult(
    result.requiredGPA,
    result.requiredPoints,
    result.requiredGPA > 4.0,
  );
}
function animateGPAResult(displayGPA, requiredPoints, isImpossible = false) {
  const gpaTargetEl = document.getElementById("animated-required-gpa");
  if (!gpaTargetEl) return;
  if (displayGPA > 0) {
    // Show required GPA (even if > 4.0 for impossible case)
    animateValue(gpaTargetEl, 0, displayGPA, 1200, 2);
  } else if (displayGPA <= 0 && requiredPoints <= 0.01) {
    gpaTargetEl.innerHTML = "Đạt";
  } else {
    gpaTargetEl.innerHTML = "---";
  }
}
function handleShareTarget() {
  const state = getTargetState();
  const shareUrl = generateShareUrl(state);
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      const btn = document.getElementById("share-target-btn");
      const originalText = btn?.innerHTML;
      if (btn) {
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Đã chép!';
        btn.classList.replace("btn-outline-primary", "btn-success");
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.replace("btn-success", "btn-outline-primary");
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showToast(
        "Không thể sao chép liên kết. Bạn có thể chép thủ công từ thanh địa chỉ.",
        "error",
      );
    });
}
function addRetakeItemUI(savedData = null) {
  const retakeList = document.getElementById("retake-list");
  if (!retakeList) return;
  const item = document.createElement("tr");

  const dGrade = GRADE_SCALE.find((g) => g.grade === "D");
  const defaultD_GPA = dGrade ? dGrade.gpa : 1.0;
  const defaultGrade = savedData ? savedData.oldGrade : defaultD_GPA;
  const defaultCredits = savedData ? savedData.credits : 3;

  item.innerHTML = `
    <td>
      <select class="form-select form-select-sm retake-old-grade" aria-label="Old Grade">
        ${GRADE_SCALE.filter((g) => !["A+", "A", "B+", "B"].includes(g.grade))
      .map(
        (g) =>
          `<option value="${g.gpa}" ${Math.abs(g.gpa - defaultGrade) < 0.01 ? "selected" : ""}>${g.grade} (${g.gpa})</option>`,
      )
      .join("")}
      </select>
    </td>
    <td>
      <div class="input-group input-group-sm flex-nowrap" style="min-width: 80px;">
        <button class="btn btn-outline-secondary px-1 btn-decrement" type="button">-</button>
        <input type="number" class="form-control form-control-sm retake-credits text-center px-0" value="${defaultCredits}" min="1" max="10" readonly>
        <button class="btn btn-outline-secondary px-1 btn-increment" type="button">+</button>
      </div>
    </td>
    <td class="text-end">
      <button class="btn btn-sm text-danger delete-retake-btn" type="button"><i class="bi bi-trash"></i></button>
    </td>
`;

  const select = item.querySelector(".retake-old-grade");
  const input = item.querySelector(".retake-credits");
  const btnDec = item.querySelector(".btn-decrement");
  const btnInc = item.querySelector(".btn-increment");

  const triggerSave = () => {
    const currentGpaInput = document.getElementById("current-gpa");
    if (currentGpaInput) currentGpaInput.dispatchEvent(new Event("input"));
  };

  select.addEventListener("change", triggerSave);

  btnDec.addEventListener("click", () => {
    let val = parseFloat(input.value) || 0;
    if (val > 1) {
      input.value = val - 1;
      triggerSave();
    }
  });

  btnInc.addEventListener("click", () => {
    let val = parseFloat(input.value) || 0;
    if (val < 10) {
      input.value = val + 1;
      triggerSave();
    }
  });

  item.querySelector(".delete-retake-btn").addEventListener("click", () => {
    item.remove();
    triggerSave();
  });

  retakeList.appendChild(item);
}
// ==========================================
// Tab: Course Grade
// ==========================================
export function initCourseGradeTab() {
  const elements = {
    processScoreInput: document.getElementById("process-score-input"),
    processScoreRange: document.getElementById("process-score-range"),
    accumulatedScoreDisplay: document.getElementById("accumulated-score"),
    scoreToPassDisplay: document.getElementById("score-to-pass"),
    courseGradeResults: document.getElementById("course-grade-results"),
  };
  if (!elements.processScoreInput) return;
  loadCourseGradeState(elements);
  calculateAndRenderCourseGrade(elements);
  setupCourseGradeListeners(elements);
}
function loadCourseGradeState(elements) {
  const saved = localStorage.getItem("courseGradeState");
  if (saved) {
    try {
      const state = JSON.parse(saved);
      if (state.ratio) {
        const radio = document.querySelector(
          `input[name="btnradio"][value="${state.ratio}"]`,
        );
        if (radio) radio.checked = true;
      }
      if (state.processScore !== undefined) {
        elements.processScoreInput.value = state.processScore;
        elements.processScoreRange.value = state.processScore;
      }
    } catch (e) {
      console.error("Failed to load course grade state:", e);
    }
  } else {
    elements.processScoreInput.value = 7.0;
    elements.processScoreRange.value = 7.0;
  }
}
function setupCourseGradeListeners(elements) {
  const radioButtons = document.querySelectorAll('input[name="btnradio"]');
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      calculateAndRenderCourseGrade(elements);
      saveCourseGradeState(elements);
    });
  });
  elements.processScoreRange.addEventListener("input", (e) => {
    elements.processScoreInput.value = e.target.value;
    calculateAndRenderCourseGrade(elements);
    saveCourseGradeState(elements);
  });
  elements.processScoreInput.addEventListener("input", (e) => {
    let val = parseFloat(e.target.value);
    if (val > 10) val = 10;
    if (val < 0) val = 0;
    if (!isNaN(val)) {
      elements.processScoreRange.value = val;
      calculateAndRenderCourseGrade(elements);
      saveCourseGradeState(elements);
    }
  });
}
function calculateAndRenderCourseGrade(elements) {
  const selectedRadio = document.querySelector(
    'input[name="btnradio"]:checked',
  );
  const processWeight = parseFloat(selectedRadio?.value) || 0.4;
  const finalWeight = 1 - processWeight;
  let processScore = parseFloat(elements.processScoreInput.value) || 0;
  const accumulated = processScore * processWeight;
  elements.accumulatedScoreDisplay.textContent = accumulated.toFixed(2);
  const passGrade = GRADE_SCALE.find((g) => g.grade === "D");
  const passTarget = passGrade ? passGrade.min : 4.0;
  let requiredPass = (passTarget - accumulated) / finalWeight;
  if (requiredPass <= 0) {
    elements.scoreToPassDisplay.textContent = "Đã qua";
  } else if (requiredPass > 10) {
    elements.scoreToPassDisplay.textContent = "Không thể";
  } else {
    elements.scoreToPassDisplay.textContent = requiredPass.toFixed(2);
  }
  elements.courseGradeResults.innerHTML = GRADE_SCALE.map((grade) =>
    renderGradeCard(grade, accumulated, finalWeight),
  ).join("");
}
function renderGradeCard(grade, accumulated, finalWeight) {
  const targetScore = grade.min;
  let requiredFinal = (targetScore - accumulated) / finalWeight;
  const badgeColor = getBadgeColor(grade.grade);
  const { statusClass, progressColor, message, progressPercent } =
    getGradeStatus(requiredFinal, grade.gpa);
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
${requiredFinal <= 10 && requiredFinal > 0
      ? `
<div class="progress mt-2" style="height: 4px;">
<div class="progress-bar ${progressColor}" role="progressbar" style="width: ${progressPercent}%" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
</div>
`
      : ""
    }
</div>
`;
}
function getBadgeColor(grade) {
  if (grade.startsWith("A")) return "bg-success";
  if (grade.startsWith("B")) return "bg-primary";
  if (grade.startsWith("C")) return "bg-info text-dark";
  if (grade.startsWith("D")) return "bg-warning text-dark";
  return "bg-danger";
}
function getGradeStatus(requiredFinal, gpa) {
  if (requiredFinal <= 0) {
    if (gpa === 0) {
      return {
        message: `<span class="text-danger fw-bold small"><i class="bi bi-x-circle-fill me-1"></i>Rot</span>`,
        statusClass: "bg-danger-subtle border-danger-subtle",
        progressColor: "bg-danger",
        progressPercent: 100,
      };
    }
    return {
      message: `<span class="text-success fw-bold small"><i class="bi bi-check-circle-fill me-1"></i>Đạt</span>`,
      statusClass: "bg-success-subtle border-success-subtle",
      progressColor: "bg-success",
      progressPercent: 100,
    };
  }
  if (requiredFinal > 10) {
    return {
      message: `<span class="text-muted small">Không thể (>10)</span>`,
      statusClass: "bg-light opacity-75 border-light",
      progressColor: "bg-secondary",
      progressPercent: 0,
    };
  }
  let progressColor = "bg-success";
  if (requiredFinal >= 5) progressColor = "bg-info";
  if (requiredFinal >= 7) progressColor = "bg-warning";
  if (requiredFinal >= 8.5) progressColor = "bg-danger";
  return {
    message: `<div class="d-flex align-items-baseline"><span class="text-muted small me-2">Can:</span><strong class="fs-5 text-dark">${requiredFinal.toFixed(2)}</strong></div>`,
    statusClass: "bg-white border-light-subtle shadow-sm",
    progressColor,
    progressPercent: (requiredFinal / 10) * 100,
  };
}
function saveCourseGradeState(elements) {
  const state = {
    ratio: document.querySelector('input[name="btnradio"]:checked')?.value,
    processScore: elements.processScoreInput.value,
  };
  localStorage.setItem("courseGradeState", JSON.stringify(state));
}
// ==========================================
// Other Event Handlers
// ==========================================
export function initContactButton() {
  const wrapper = document.getElementById("contact-floating-wrapper");
  const closeBtn = document.getElementById("close-contact-btn");
  if (!wrapper || !closeBtn) return;
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    wrapper.classList.add("d-none");
    wrapper.style.setProperty("display", "none", "important");
  });
  const contactModal = document.getElementById("contactModal");
  if (contactModal) {
    contactModal.addEventListener("shown.bs.modal", () => {
      fetchVisitCount();
    });
  }
}
export function fetchVisitCount() {
  const containers = document.querySelectorAll(".visit-count-container");
  const countSpans = document.querySelectorAll(".visit-count-value");
  countSpans.forEach((span) => (span.textContent = "..."));
  const url = `${API_CONFIG.GOAT_COUNTER_URL}?rnd=${Math.random()}`;
  fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data?.count) {
        countSpans.forEach((span) => (span.textContent = data.count));
        containers.forEach((container) =>
          container.style.removeProperty("display"),
        );
      }
    })
    .catch((error) => {
      console.warn("Failed to fetch visit count:", error);
      containers.forEach((container) => (container.style.display = "none"));
    });
}
export function initThemeToggle() {
  const toggleBtns = document.querySelectorAll(
    "#theme-toggle-mobile, #theme-toggle-desktop, #theme-toggle",
  );
  const navbar = document.querySelector(".navbar");
  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }
    return "light";
  };
  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
    toggleBtns.forEach((btn) => {
      const icon = btn.querySelector("i");
      if (theme === "dark") {
        icon?.classList.remove("bi-moon-stars-fill");
        icon?.classList.add("bi-sun-fill");
        btn.classList.replace("btn-light", "btn-dark");
        btn.classList.replace("border", "border-secondary");
      } else {
        icon?.classList.remove("bi-sun-fill");
        icon?.classList.add("bi-moon-stars-fill");
        btn.classList.replace("btn-dark", "btn-light");
        btn.classList.replace("border-secondary", "border");
      }
    });
    if (navbar) {
      if (theme === "dark") {
        navbar.classList.remove("navbar-light", "bg-white");
        navbar.classList.add("navbar-dark", "bg-dark");
      } else {
        navbar.classList.remove("navbar-dark", "bg-dark");
        navbar.classList.add("navbar-light", "bg-white");
      }
    }
  };
  setTheme(getPreferredTheme());
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-bs-theme");
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  });
}

// ==========================================
// Feedback Form
// ==========================================
export function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const submitBtn = document.getElementById("submit-feedback-btn");
  const listTabBtn = document.getElementById("feedback-list-tab");
  const refreshBtn = document.getElementById("refresh-feedback-btn");
  setupFormSubmission(form, submitBtn, listTabBtn);
  setupFeedbackList(listTabBtn, refreshBtn);
}
function setupFormSubmission(form, submitBtn, listTabBtn) {
  if (!form || !submitBtn) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("feedback-name")?.value || "";
    const type = document.getElementById("feedback-type")?.value || "";
    const content = document.getElementById("feedback-content")?.value || "";
    
    // Validate content
    const contentValidation = validateFeedbackContent(content);
    if (!contentValidation.valid) {
      showToast(contentValidation.error, "error");
      return;
    }
    
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...';
    
    if (API_CONFIG.GOOGLE_SCRIPT_URL.includes("PLACEHOLDER")) {
      showToast(
        "Tính năng đang được bảo trì (Chưa cấu hình Server). Vui lòng liên hệ qua Facebook.",
        "warning",
      );
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      return;
    }
    try {
      // Submit feedback
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang gửi góp ý...';
      await submitFeedback({ name, type, content: contentValidation.value, imageUrl: "" });
      
      // Success
      showToast(
        "Cảm ơn bạn đã đóng góp ý kiến! Chúng tôi sẽ xem xét sớm nhất.",
        "success",
      );
      
      // Reset form
      form.reset();
      
      // Switch to feedback list tab
      if (listTabBtn) {
        const tab = new bootstrap.Tab(listTabBtn);
        tab.show();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.message !== "User cancelled due to upload failure") {
        showToast(
          "Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại sau.",
          "error",
        );
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}
async function submitFeedback({ name, type, content, imageUrl }) {
  await fetch(API_CONFIG.GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      name: name || "An danh",
      type,
      content,
      image: imageUrl,
      timestamp: new Date().toLocaleString("vi-VN"),
    }),
  });
}
function setupFeedbackList(listTabBtn, refreshBtn) {
  const loadFeedbacks = async () => {
    const container = document.getElementById("feedback-list-container");
    if (!container) return;
    container.innerHTML = `
<div class="text-center py-5 text-muted">
<div class="spinner-border text-primary mb-2" role="status"></div>
<p class="small mb-0">Đang tải dữ liệu...</p>
</div>
`;
    try {
      const response = await fetch(API_CONFIG.GOOGLE_SCRIPT_URL);
      const data = await response.json();
      renderFeedbackList(container, data);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      container.innerHTML = `
<div class="text-center py-5 text-danger">
<i class="bi bi-exclamation-circle fs-1 mb-2"></i>
<p class="small mb-0">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
</div>
`;
    }
  };
  listTabBtn?.addEventListener("shown.bs.tab", loadFeedbacks);
  refreshBtn?.addEventListener("click", loadFeedbacks);
}
function renderFeedbackList(container, data) {
  container.innerHTML = "";
  if (!data || data.length === 0) {
    container.innerHTML = `
<div class="text-center py-5 text-muted">
<i class="bi bi-chat-square-dots fs-1 mb-2"></i>
<p class="small mb-0">Chua co gop y nao duoc hien thi.</p>
</div>
`;
    return;
  }
  data.forEach((item) => {
    const card = createFeedbackCard(item);
    container.appendChild(card);
  });
}
function createFeedbackCard(item) {
  const typeBadge = getFeedbackTypeBadge(item.type);
  const card = document.createElement("div");
  card.className = "feedback-item-card";
  const imageHtml = item.image
    ? `
<div class="mt-3">
<a href="${item.image}" target="_blank">
<img src="${item.image}" alt="Minh họa" class="img-fluid rounded-4 border shadow-sm" style="max-height: 250px; width: 100%; object-fit: cover;">
</a>
</div>
`
    : "";
  card.innerHTML = `
<div class="d-flex justify-content-between align-items-start mb-3">
<div class="d-flex align-items-center">
<div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 40px; height: 40px; background: rgba(13, 110, 253, 0.1);">
<i class="bi bi-person-fill text-primary"></i>
</div>
<div>
<h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">${escapeHtml(item.name)}</h6>
<small class="text-muted d-flex align-items-center gap-1" style="font-size: 0.75rem;">
  <i class="bi bi-clock-history"></i> ${item.timestamp}
</small>
</div>
</div>
${typeBadge}
</div>
<div class="feedback-content-box p-3 rounded-4">
  <p class="card-text text-secondary small mb-0" style="white-space: pre-line; line-height: 1.6;">${escapeHtml(item.content)}</p>
  ${imageHtml}
</div>
`;
  return card;
}

function getFeedbackTypeBadge(type) {
  const badges = {
    feature_request:
      '<span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Tính năng mới</span>',
    bug_report:
      '<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">Báo lỗi</span>',
    improvement:
      '<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Cải tiến</span>',
  };
  return (
    badges[type] ||
    '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill">Khác</span>'
  );
}
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
// ==========================================
// Tab: News
// ==========================================
export function initNewsTab() {
  setupNewsFilters();
  setupHandbookLazyLoad();
  setupImageViewer();
  initNewsSort();
}
function setupNewsFilters() {
  const filterBtns = document.querySelectorAll(".news-filters .filter-btn");
  const newsCards = document.querySelectorAll(".news-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        b.classList.replace("btn-primary", "btn-outline-secondary");
        b.classList.remove("active");
      });
      btn.classList.replace("btn-outline-secondary", "btn-primary");
      btn.classList.add("active");
      newsCards.forEach((card) => {
        const category = card.dataset.category;
        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          card.style.animation = "none";
          card.offsetHeight;
          card.style.animation = null;
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}
function setupHandbookLazyLoad() {
  const loadHandbookBtn = document.getElementById("load-handbook-btn");
  const handbookPlaceholder = document.getElementById("handbook-placeholder");
  const handbookIframe = document.getElementById("handbook-iframe");
  if (!loadHandbookBtn || !handbookPlaceholder || !handbookIframe) return;
  loadHandbookBtn.addEventListener("click", () => {
    const src = handbookIframe.getAttribute("data-src");
    if (src) handbookIframe.src = src;
    handbookPlaceholder.style.transition = "opacity 0.3s ease";
    handbookPlaceholder.style.opacity = "0";
    handbookPlaceholder.style.pointerEvents = "none";
    setTimeout(() => handbookPlaceholder.remove(), 300);
  });
}
function setupImageViewer() {
  const imageViewerModal = document.getElementById("imageViewerModal");
  if (!imageViewerModal) return;
  imageViewerModal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;
    if (!button) return;
    const src = button.getAttribute("data-bs-src");
    const modalImage = imageViewerModal.querySelector("#imageViewerSrc");
    if (modalImage && src) modalImage.src = src;
  });
}

// ==========================================
// News Sort
// ==========================================
export function initNewsSort() {
  const toggleSortBtn = document.getElementById("toggle-sort-news-btn");
  const newsContainer = document.getElementById("news-list-container");
  const ORDER_KEY = "HUFLIT_NEWS_ORDER";

  // Use the existing generic loadSavedOrder function (defined below)
  loadSavedOrder(newsContainer, ORDER_KEY);

  setupNewsSortModeToggle(toggleSortBtn, newsContainer);
  setupNewsMoveHandlers(newsContainer, ORDER_KEY);
}

function setupNewsSortModeToggle(toggleSortBtn, container) {
  if (!toggleSortBtn || !container) return;
  toggleSortBtn.addEventListener("click", () => {
    container.classList.toggle("news-sort-mode");
    toggleSortBtn.classList.toggle("active");

    if (container.classList.contains("news-sort-mode")) {
      toggleSortBtn.classList.remove("btn-outline-primary");
      toggleSortBtn.classList.add("btn-primary");
    } else {
      toggleSortBtn.classList.add("btn-outline-primary");
      toggleSortBtn.classList.remove("btn-primary");
    }
  });
}

function setupNewsMoveHandlers(container, ORDER_KEY) {
  if (!container) return;
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = btn.closest(".news-card");
    if (!card) return;

    if (btn.classList.contains("btn-move-up")) {
      const prev = card.previousElementSibling;
      if (prev) {
        container.insertBefore(card, prev);
        saveOrder(container, ORDER_KEY);
      }
    } else if (btn.classList.contains("btn-move-down")) {
      const next = card.nextElementSibling;
      if (next) {
        // insertBefore next means insert before the one AFTER next?
        // No, to swap down:
        // [card] [next]
        // We want: [next] [card]
        // insertBefore(card, next.nextSibling) ? 
        // Or simpler: insertBefore(next, card) puts next BEFORE card. Correct.
        container.insertBefore(next, card);
        saveOrder(container, ORDER_KEY);
      }
    }
  });
}
// ==========================================
// Grade Scale Sort
// ==========================================
export function initGradeScaleSort() {
  const toggleSortBtn = document.getElementById("toggle-sort-scale-btn");
  const scaleContainer = document.getElementById("scale-list-container");
  const ORDER_KEY = "HUFLIT_SCALE_ORDER";
  loadSavedOrder(scaleContainer, ORDER_KEY);
  setupSortModeToggle(toggleSortBtn, scaleContainer, ORDER_KEY);
  setupMoveHandlers(scaleContainer, ORDER_KEY);
}
function loadSavedOrder(scaleContainer, ORDER_KEY) {
  const savedOrder = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
  if (savedOrder.length === 0 || !scaleContainer) return;
  const currentItems = Array.from(scaleContainer.children);
  const itemMap = new Map(currentItems.map((item) => [item.id, item]));
  scaleContainer.innerHTML = "";
  savedOrder.forEach((id) => {
    const item = itemMap.get(id);
    if (item) {
      scaleContainer.appendChild(item);
      itemMap.delete(id);
    }
  });
  itemMap.forEach((item) => scaleContainer.appendChild(item));
}
function setupSortModeToggle(toggleSortBtn, scaleContainer, ORDER_KEY) {
  if (!toggleSortBtn || !scaleContainer) return;
  toggleSortBtn.addEventListener("click", () => {
    scaleContainer.classList.toggle("scale-sort-mode");
    toggleSortBtn.classList.toggle("active");
    if (scaleContainer.classList.contains("scale-sort-mode")) {
      toggleSortBtn.classList.remove("btn-outline-primary");
      toggleSortBtn.classList.add("btn-primary");
    } else {
      toggleSortBtn.classList.add("btn-outline-primary");
      toggleSortBtn.classList.remove("btn-primary");
    }
  });
}
function setupMoveHandlers(scaleContainer, ORDER_KEY) {
  if (!scaleContainer) return;
  scaleContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const card = btn.closest(".scale-card");
    if (!card) return;
    if (btn.classList.contains("btn-move-up")) {
      const prev = card.previousElementSibling;
      if (prev) {
        scaleContainer.insertBefore(card, prev);
        saveOrder(scaleContainer, ORDER_KEY);
      }
    } else if (btn.classList.contains("btn-move-down")) {
      const next = card.nextElementSibling;
      if (next) {
        scaleContainer.insertBefore(next, card);
        saveOrder(scaleContainer, ORDER_KEY);
      }
    }
  });
}
function saveOrder(scaleContainer, ORDER_KEY) {
  if (!scaleContainer) return;
  const newOrder = Array.from(scaleContainer.children).map((item) => item.id);
  localStorage.setItem(ORDER_KEY, JSON.stringify(newOrder));
}
