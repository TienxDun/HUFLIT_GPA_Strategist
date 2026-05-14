import { initCourseGradeTab, initTargetGPATab, initManualCalcTab, initContactButton, initThemeToggle, fetchVisitCount, initFeedbackForm, initNewsTab, initGradeScaleSort } from './ui/events.js';
import { initGradeScaleTab } from './ui/renderers.js';
import { decodeState } from './core/share.js';
import { setTargetState, subscribe } from './state/store.js';

// Polyfill for requestIdleCallback (Safari doesn't support it)
const requestIdleCallback = window.requestIdleCallback || function (cb) {
    const start = Date.now();
    return setTimeout(() => {
        cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
        });
    }, 1);
};

console.log("HUFLIT GPA Strategist loaded (Modular).");

document.addEventListener('DOMContentLoaded', () => {
    // Xử lý dữ liệu chia sẻ từ URL (Tham số 's' cho bản ngắn gọn)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('s') || urlParams.get('share');
    if (sharedData) {
        const decodedState = decodeState(sharedData);
        if (decodedState) {
            setTargetState(decodedState);
        }
    }

    // Lazy initialization tracking
    const initializedTabs = new Set(['#pills-target']); // Target tab is active by default

    // CRITICAL: Essential initializations (must run immediately)
    initTargetGPATab();
    initThemeToggle();

    // NON-CRITICAL: Defer to idle time for better performance
    requestIdleCallback(() => {
        initContactButton();
    }, { timeout: 2000 });

    requestIdleCallback(() => {
        fetchVisitCount();
        initFeedbackForm();
    }, { timeout: 3000 });

    // Re-render scale tab when state changes (only if already initialized to save performance)
    subscribe(() => {
        if (initializedTabs.has('#pills-scale')) {
            initGradeScaleTab();
        }
    });

    // Auto-calculate if shared data is present
    if (sharedData) {
        setTimeout(() => {
            const calcBtn = document.getElementById('calc-target-btn');
            if (calcBtn) calcBtn.click();

            // Xóa tham số share trên URL để tránh nạp lại khi refresh (tùy chọn)
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 500);
    }

    // Sync Desktop and Mobile Tabs + Lazy Load
    const allNavLinks = document.querySelectorAll('.nav-link[data-bs-toggle="pill"]');
    allNavLinks.forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target');

            // Lazy load tab-specific logic
            if (!initializedTabs.has(targetId)) {
                if (targetId === '#pills-manual') initManualCalcTab();
                if (targetId === '#pills-course') initCourseGradeTab();
                if (targetId === '#pills-scale') {
                    initGradeScaleTab();
                    initGradeScaleSort();
                }
                if (targetId === '#pills-news') initNewsTab();
                initializedTabs.add(targetId);
            }

            const correspondingLinks = document.querySelectorAll(`.nav-link[data-bs-toggle="pill"][data-bs-target="${targetId}"]`);

            correspondingLinks.forEach(other => {
                if (other !== e.target) {
                    other.classList.add('active');
                    other.setAttribute('aria-selected', 'true');

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

            // Cuộn lên đầu trang khi chuyển tab
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
});
