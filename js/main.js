import { initCourseGradeTab, initTargetGPATab, initManualCalcTab, initContactButton, initThemeToggle, initUserGuide, fetchVisitCount } from './ui/events.js';
import { initGradeScaleTab } from './ui/renderers.js';
import { initSnowEffect, initChristmasTreeInteraction } from './ui/effects.js';

console.log("HUFLIT GPA Strategist loaded (Modular).");

document.addEventListener('DOMContentLoaded', () => {
    initCourseGradeTab();
    initTargetGPATab();
    initManualCalcTab();
    initGradeScaleTab();
    initContactButton();
    initThemeToggle();
    initUserGuide();
    fetchVisitCount();
    // initSnowEffect();
    // initChristmasTreeInteraction();

    // Sync Desktop and Mobile Tabs
    const allNavLinks = document.querySelectorAll('.nav-link[data-bs-toggle="pill"]');
    allNavLinks.forEach(link => {
        link.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target');
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
        });
    });
});
