import { describe, it, expect } from "vitest";
import {
  calculateGraduationAnalysis,
  getRecommendedGraduationTarget,
  DEFAULT_HUFLIT_CREDITS,
} from "../../../lib/gpa/graduation-calculator";

describe("calculateGraduationAnalysis", () => {
  it("should accurately reflect completedCredits when credits exceed totalGraduationCredits (e.g. 141 / 135 TC)", () => {
    const analysis = calculateGraduationAnalysis(3.71, 141, 3.6, 135, []);
    expect(analysis.completedCredits).toBe(141);
    expect(analysis.totalCredits).toBe(135);
    expect(analysis.remainingCredits).toBe(0);
    expect(analysis.progressPercent).toBe(100);
    expect(analysis.status).toBe("ALREADY_ACHIEVED");
  });

  it("should calculate correctly for freshman with 0 credits", () => {
    const analysis = calculateGraduationAnalysis(0, 0, 3.2, 135, []);
    expect(analysis.completedCredits).toBe(0);
    expect(analysis.totalCredits).toBe(135);
    expect(analysis.remainingCredits).toBe(135);
    expect(analysis.progressPercent).toBe(0);
    expect(analysis.status).toBe("FRESHMAN");
  });

  it("should calculate remaining credits for regular student", () => {
    const analysis = calculateGraduationAnalysis(3.0, 60, 3.2, 135, []);
    expect(analysis.completedCredits).toBe(60);
    expect(analysis.totalCredits).toBe(135);
    expect(analysis.remainingCredits).toBe(75);
    expect(analysis.progressPercent).toBe(44);
    expect(analysis.status).toBe("ACHIEVABLE");
    expect(analysis.requiredFutureGPA).toBeGreaterThan(3.0);
  });
});

describe("getRecommendedGraduationTarget", () => {
  it("should recommend appropriate graduation target based on current GPA", () => {
    expect(getRecommendedGraduationTarget(3.71)).toBe(3.6);
    expect(getRecommendedGraduationTarget(3.25)).toBe(3.2);
    expect(getRecommendedGraduationTarget(2.6)).toBe(2.5);
    expect(getRecommendedGraduationTarget(1.8)).toBe(2.0);
  });
});
