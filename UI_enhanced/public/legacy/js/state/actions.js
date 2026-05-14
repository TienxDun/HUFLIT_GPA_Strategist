/**
 * State Actions
 * Centralized state mutation functions following Flux pattern
 */

import {
  getTargetState,
  setTargetState,
  getManualState,
  setManualState,
  addManualSemester as addSemesterToStore,
  removeManualSemester as removeSemesterFromStore,
  updateManualCourse as updateCourseInStore,
  addManualCourse as addCourseToStore,
  removeManualCourse as removeCourseFromStore
} from './store.js';

import { validateGPA, validateCredits, validateCourseName, validateGrade } from '../core/validators.js';
import { CREDIT_MODES } from '../core/app-constants.js';

// ==========================================
// Target GPA Actions
// ==========================================

/**
 * Actions for Target GPA tab state
 */
export const TargetActions = {
  /**
   * Set current GPA
   * @param {string|number} gpa - GPA value
   * @returns {boolean} Success status
   */
  setCurrentGPA(gpa) {
    const validation = validateGPA(gpa);
    if (validation.valid) {
      setTargetState({ currentGpa: gpa });
      return true;
    }
    return false;
  },

  /**
   * Set current credits
   * @param {string|number} credits - Credits value
   * @returns {boolean} Success status
   */
  setCurrentCredits(credits) {
    const validation = validateCredits(credits);
    if (validation.valid) {
      setTargetState({ currentCredits: credits });
      return true;
    }
    return false;
  },

  /**
   * Set target GPA
   * @param {string|number} gpa - Target GPA value
   * @returns {boolean} Success status
   */
  setTargetGPA(gpa) {
    const validation = validateGPA(gpa);
    if (validation.valid) {
      setTargetState({ targetGpa: gpa });
      return true;
    }
    return false;
  },

  /**
   * Set new credits (remaining)
   * @param {string|number} credits - Credits value
   * @returns {boolean} Success status
   */
  setNewCredits(credits) {
    const validation = validateCredits(credits);
    if (validation.valid) {
      setTargetState({ newCredits: credits });
      return true;
    }
    return false;
  },

  /**
   * Set total credits
   * @param {string|number} credits - Total credits value
   * @returns {boolean} Success status
   */
  setTotalCredits(credits) {
    const validation = validateCredits(credits);
    if (validation.valid) {
      setTargetState({ totalCredits: credits });
      return true;
    }
    return false;
  },

  /**
   * Set credit mode
   * @param {string} mode - 'new' or 'total'
   * @returns {boolean} Success status
   */
  setCreditMode(mode) {
    if (Object.values(CREDIT_MODES).includes(mode)) {
      setTargetState({ creditMode: mode });
      return true;
    }
    return false;
  },

  /**
   * Toggle retake mode
   * @param {boolean} enabled - Whether retake mode is enabled
   * @returns {boolean} Success status
   */
  toggleRetakeMode(enabled) {
    setTargetState({ isRetake: Boolean(enabled) });
    return true;
  },

  /**
   * Add a retake item
   * @param {Object} retake - Retake data
   * @param {number} retake.oldGrade - Old grade GPA value
   * @param {number} retake.credits - Credits
   * @returns {boolean} Success status
   */
  addRetake(retake) {
    const state = getTargetState();
    const retakes = [...state.retakes, retake];
    setTargetState({ retakes });
    return true;
  },

  /**
   * Remove a retake item by index
   * @param {number} index - Index to remove
   * @returns {boolean} Success status
   */
  removeRetake(index) {
    const state = getTargetState();
    const retakes = state.retakes.filter((_, i) => i !== index);
    setTargetState({ retakes });
    return true;
  },

  /**
   * Update a retake item
   * @param {number} index - Index to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  updateRetake(index, updates) {
    const state = getTargetState();
    if (index < 0 || index >= state.retakes.length) return false;
    
    const retakes = state.retakes.map((r, i) => 
      i === index ? { ...r, ...updates } : r
    );
    setTargetState({ retakes });
    return true;
  },

  /**
   * Reset target state to defaults
   * @returns {boolean} Success status
   */
  reset() {
    setTargetState({
      currentGpa: 0,
      currentCredits: 0,
      targetGpa: 0,
      newCredits: 0,
      totalCredits: 0,
      creditMode: CREDIT_MODES.NEW,
      isRetake: false,
      retakes: []
    });
    return true;
  }
};

// ==========================================
// Manual Calc Actions
// ==========================================

/**
 * Actions for Manual Calculation tab state
 */
export const ManualActions = {
  /**
   * Add a new semester
   * @param {Object} semester - Semester data
   * @param {string} semester.name - Semester name
   * @param {Array} [semester.courses=[]] - Initial courses
   * @returns {boolean} Success status
   */
  addSemester(semester) {
    const validation = validateCourseName(semester.name);
    if (!validation.valid) return false;

    const newSemester = {
      id: Date.now().toString(),
      name: validation.value,
      courses: semester.courses || []
    };

    addSemesterToStore(newSemester);
    return true;
  },

  /**
   * Remove a semester by ID
   * @param {string} semesterId - Semester ID
   * @returns {boolean} Success status
   */
  removeSemester(semesterId) {
    removeSemesterFromStore(semesterId);
    return true;
  },

  /**
   * Update semester name
   * @param {string} semesterId - Semester ID
   * @param {string} name - New name
   * @returns {boolean} Success status
   */
  updateSemesterName(semesterId, name) {
    const validation = validateCourseName(name);
    if (!validation.valid) return false;

    const { semesters } = getManualState();
    const semester = semesters.find(s => String(s.id) === String(semesterId));
    if (!semester) return false;

    semester.name = validation.value;
    setManualState({ semesters });
    return true;
  },

  /**
   * Add a course to a semester
   * @param {string} semesterId - Semester ID
   * @param {Object} course - Course data
   * @returns {boolean} Success status
   */
  addCourse(semesterId, course) {
    const nameValidation = validateCourseName(course.name);
    const gradeValidation = validateGrade(course.grade);

    if (!nameValidation.valid || !gradeValidation.valid) return false;

    const newCourse = {
      id: Date.now().toString(),
      name: nameValidation.value,
      credits: parseFloat(course.credits) || 3,
      grade: gradeValidation.value,
      isRetake: Boolean(course.isRetake),
      oldGrade: course.oldGrade || 'D'
    };

    addCourseToStore(semesterId, newCourse);
    return true;
  },

  /**
   * Update a course field
   * @param {string} semesterId - Semester ID
   * @param {string} courseId - Course ID
   * @param {string} field - Field to update
   * @param {*} value - New value
   * @returns {boolean} Success status
   */
  updateCourse(semesterId, courseId, field, value) {
    // Validate based on field
    if (field === 'name') {
      const validation = validateCourseName(value);
      if (!validation.valid) return false;
      value = validation.value;
    } else if (field === 'grade') {
      const validation = validateGrade(value);
      if (!validation.valid) return false;
      value = validation.value;
    } else if (field === 'credits') {
      value = parseFloat(value) || 0;
    }

    updateCourseInStore(semesterId, courseId, field, value);
    return true;
  },

  /**
   * Remove a course
   * @param {string} semesterId - Semester ID
   * @param {string} courseId - Course ID
   * @returns {boolean} Success status
   */
  removeCourse(semesterId, courseId) {
    removeCourseFromStore(semesterId, courseId);
    return true;
  },

  /**
   * Set initial GPA (before recorded semesters)
   * @param {string|number} gpa - Initial GPA
   * @returns {boolean} Success status
   */
  setInitialGPA(gpa) {
    const validation = validateGPA(gpa);
    if (validation.valid) {
      setManualState({ initialGpa: gpa });
      return true;
    }
    return false;
  },

  /**
   * Set initial credits (before recorded semesters)
   * @param {string|number} credits - Initial credits
   * @returns {boolean} Success status
   */
  setInitialCredits(credits) {
    const validation = validateCredits(credits);
    if (validation.valid) {
      setManualState({ initialCredits: credits });
      return true;
    }
    return false;
  },

  /**
   * Import semesters from portal data
   * @param {Array} semesters - Parsed semester data
   * @returns {boolean} Success status
   */
  importFromPortal(semesters) {
    if (!Array.isArray(semesters)) return false;

    // Clear existing data
    setManualState({
      semesters: [],
      initialGpa: '',
      initialCredits: ''
    });

    // Use timestamp + counter to ensure unique IDs
    const baseId = Date.now().toString(36);
    let counter = 0;

    // Add imported semesters
    for (let i = 0; i < semesters.length; i++) {
      const sem = semesters[i];
      if (sem.courses?.length > 0) {
        const newSemId = `${baseId}_sem_${i}`;
        const courses = sem.courses.map((c, j) => ({
          id: `${baseId}_course_${counter++}_${j}`,
          name: c.name,
          credits: parseFloat(c.credits) || 0,
          grade: c.grade,
          isRetake: c.isRetake || false,
          oldGrade: c.oldGrade || 'D'
        }));

        addSemesterToStore({
          id: newSemId,
          name: sem.name,
          courses
        });
      }
    }

    return true;
  },

  /**
   * Reset manual state
   * @returns {boolean} Success status
   */
  reset() {
    setManualState({
      semesters: [],
      initialGpa: '',
      initialCredits: ''
    });
    return true;
  }
};

// ==========================================
// Course Grade Actions
// ==========================================

/**
 * Actions for Course Grade tab state
 */
export const CourseGradeActions = {
  /**
   * Save course grade state
   * @param {Object} state - State to save
   * @param {string} state.ratio - Selected ratio
   * @param {number} state.processScore - Process score
   * @returns {boolean} Success status
   */
  saveState(state) {
    try {
      localStorage.setItem('courseGradeState', JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Failed to save course grade state:', e);
      return false;
    }
  },

  /**
   * Load course grade state
   * @returns {Object|null} Saved state or null
   */
  loadState() {
    try {
      const saved = localStorage.getItem('courseGradeState');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load course grade state:', e);
      return null;
    }
  }
};

// ==========================================
// Theme Actions
// ==========================================

/**
 * Actions for theme state
 */
export const ThemeActions = {
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark'
  },

  /**
   * Set theme
   * @param {string} theme - 'light' or 'dark'
   * @returns {boolean} Success status
   */
  setTheme(theme) {
    if (Object.values(this.THEMES).includes(theme)) {
      document.documentElement.setAttribute('data-bs-theme', theme);
      localStorage.setItem('theme', theme);
      return true;
    }
    return false;
  },

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getTheme() {
    return localStorage.getItem('theme') || this.THEMES.LIGHT;
  },

  /**
   * Toggle theme
   * @returns {string} New theme
   */
  toggle() {
    const current = this.getTheme();
    const newTheme = current === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
    this.setTheme(newTheme);
    return newTheme;
  }
};

// ==========================================
// User Guide Actions
// ==========================================

export const UserGuideActions = {
  /**
   * Mark user guide as seen
   * @returns {boolean} Success status
   */
  markAsSeen() {
    localStorage.setItem('hasSeenGuide', 'true');
    return true;
  },

  /**
   * Check if user has seen guide
   * @returns {boolean}
   */
  hasSeen() {
    return localStorage.getItem('hasSeenGuide') === 'true';
  },

  /**
   * Reset guide seen status
   * @returns {boolean} Success status
   */
  reset() {
    localStorage.removeItem('hasSeenGuide');
    return true;
  }
};

// ==========================================
// Combined Export
// ==========================================

export const Actions = {
  target: TargetActions,
  manual: ManualActions,
  courseGrade: CourseGradeActions,
  theme: ThemeActions,
  userGuide: UserGuideActions
};

export default Actions;
