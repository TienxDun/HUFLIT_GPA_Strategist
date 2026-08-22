import { roundGPA, findGradeInfo } from "./calculators";
import { Semester } from "./types";

export interface GraduationTargetOption {
  key: "EXCELLENT" | "GOOD" | "FAIR" | "AVERAGE";
  label: string;
  minGPA: number;
  badgeColor: string;
  description: string;
}

export const HUFLIT_CREDIT_PRESETS = [130, 135, 140] as const;
export const DEFAULT_HUFLIT_CREDITS = 135;

export const GRADUATION_TARGETS: Record<string, GraduationTargetOption> = {
  EXCELLENT: {
    key: "EXCELLENT",
    label: "Xuất sắc",
    minGPA: 3.6,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Tốt nghiệp loại Xuất sắc (GPA ≥ 3.60)",
  },
  GOOD: {
    key: "GOOD",
    label: "Giỏi",
    minGPA: 3.2,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Tốt nghiệp loại Giỏi (GPA ≥ 3.20)",
  },
  FAIR: {
    key: "FAIR",
    label: "Khá",
    minGPA: 2.5,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Tốt nghiệp loại Khá (GPA ≥ 2.50)",
  },
  AVERAGE: {
    key: "AVERAGE",
    label: "T.Bình",
    minGPA: 2.0,
    badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
    description: "Tốt nghiệp loại Trung bình / Chuẩn ra trường (GPA ≥ 2.00)",
  },
};

export interface GraduationAnalysis {
  totalCredits: number;
  completedCredits: number;
  remainingCredits: number;
  progressPercent: number;
  approxCoursesRemaining: number;
  targetGPA: number;
  targetRankLabel: string;
  targetKey: string;
  requiredFutureGPA: number;
  status: "FRESHMAN" | "ACHIEVABLE" | "EASY_MAINTAIN" | "NEEDS_RETAKES" | "ALREADY_ACHIEVED";
  gradeBadgeText: string;
  gradeSuggestionText: string;
  pointsGap: number;
  approxRetakeCreditsNeeded: number;
  approxRetakeCourses: number;
  improvableCourses: { name: string; credits: number; grade: string; gpa: number }[];
}

/**
 * Phân tích và gợi ý mục tiêu tốt nghiệp thân thiện cho sinh viên (kể cả tân sinh viên)
 */
export function calculateGraduationAnalysis(
  currentGPA: number = 0,
  currentCredits: number = 0,
  targetGPA: number = 3.2,
  totalGraduationCredits: number = DEFAULT_HUFLIT_CREDITS,
  semesters: Semester[] = []
): GraduationAnalysis {
  const totalCreds = Math.max(1, totalGraduationCredits || DEFAULT_HUFLIT_CREDITS);
  const completedCreds = Math.min(totalCreds, Math.max(0, currentCredits || 0));
  const remainingCreds = Math.max(0, totalCreds - completedCreds);
  const progressPercent = Math.min(100, Math.round((completedCreds / totalCreds) * 100));
  const approxCoursesRemaining = Math.ceil(remainingCreds / 3);

  // Tìm thông tin mục tiêu
  let targetRankLabel = "Tùy chỉnh";
  let targetKey = "CUSTOM";
  for (const t of Object.values(GRADUATION_TARGETS)) {
    if (Math.abs(t.minGPA - targetGPA) < 0.01) {
      targetRankLabel = t.label;
      targetKey = t.key;
      break;
    }
  }

  // Thu thập các môn có thể cải thiện (D, D+, C, C+)
  const improvableCoursesMap = new Map<string, { name: string; credits: number; grade: string; gpa: number }>();
  semesters.forEach((sem) => {
    sem.courses?.forEach((c) => {
      if (c.grade && c.grade !== "") {
        const gInfo = findGradeInfo(c.grade);
        if (gInfo && gInfo.gpa < 3.0) {
          const key = c.equivalentName || c.name || "Môn học";
          improvableCoursesMap.set(key, {
            name: key,
            credits: c.credits || 3,
            grade: c.grade,
            gpa: gInfo.gpa,
          });
        }
      }
    });
  });
  const improvableCourses = Array.from(improvableCoursesMap.values()).sort((a, b) => a.gpa - b.gpa);

  // Tính GPA tương lai cần đạt
  const currentTotalPoints = currentGPA * completedCreds;
  const targetTotalPoints = targetGPA * totalCreds;
  const requiredPoints = targetTotalPoints - currentTotalPoints;

  let requiredFutureGPA = 0;
  if (remainingCreds > 0) {
    requiredFutureGPA = roundGPA(requiredPoints / remainingCreds);
  } else {
    requiredFutureGPA = currentGPA >= targetGPA ? 0 : 999;
  }

  // Xác định trạng thái & thông điệp
  let status: GraduationAnalysis["status"] = "ACHIEVABLE";
  let gradeBadgeText = "";
  let gradeSuggestionText = "";
  let pointsGap = 0;
  let approxRetakeCreditsNeeded = 0;
  let approxRetakeCourses = 0;

  if (completedCreds === 0) {
    status = "FRESHMAN";
    if (targetGPA >= 3.6) {
      gradeBadgeText = "Chủ yếu A / B+";
      gradeSuggestionText = "Duy trì đa số điểm A (4.0) và B+ (3.5).";
    } else if (targetGPA >= 3.2) {
      gradeBadgeText = "Điểm B+ & B";
      gradeSuggestionText = "Duy trì đều đặn điểm B+ (3.5) và B (3.0).";
    } else if (targetGPA >= 2.5) {
      gradeBadgeText = "Điểm C+ trở lên";
      gradeSuggestionText = "Đạt điểm trung bình từ C+ (2.5) trở lên.";
    } else {
      gradeBadgeText = "Điểm C (≥ 2.0)";
      gradeSuggestionText = "Duy trì điểm trung bình từ C (2.0) trở lên.";
    }
  } else if (completedCreds >= totalCreds && currentGPA >= targetGPA) {
    status = "ALREADY_ACHIEVED";
    gradeBadgeText = "Đã đạt mục tiêu";
    gradeSuggestionText = `Chúc mừng! Đã đủ điều kiện tốt nghiệp loại ${targetRankLabel}.`;
  } else if (requiredFutureGPA > 4.0) {
    status = "NEEDS_RETAKES";
    const maxPossibleFuturePoints = currentTotalPoints + 4.0 * remainingCreds;
    pointsGap = roundGPA(targetTotalPoints - maxPossibleFuturePoints);
    approxRetakeCreditsNeeded = Math.max(1, Math.ceil(pointsGap / 2.0));
    approxRetakeCourses = Math.ceil(approxRetakeCreditsNeeded / 3);

    gradeBadgeText = `Cần cải thiện ~${approxRetakeCourses} môn`;
    gradeSuggestionText = `Cần học lại ~${approxRetakeCourses} môn (${approxRetakeCreditsNeeded} TC) điểm D/C để kéo GPA đạt ${targetRankLabel}.`;
  } else if (requiredFutureGPA <= 0) {
    status = "EASY_MAINTAIN";
    gradeBadgeText = "Chỉ cần qua môn (≥ 1.0)";
    gradeSuggestionText = "GPA tích lũy hiện rất an toàn, chỉ cần không rớt môn.";
  } else {
    status = "ACHIEVABLE";
    if (requiredFutureGPA >= 3.6) {
      gradeBadgeText = "Chủ yếu điểm A (4.0)";
      gradeSuggestionText = "Cần đạt đa số điểm A và một vài B+.";
    } else if (requiredFutureGPA >= 3.2) {
      gradeBadgeText = "Điểm B+ & B";
      gradeSuggestionText = "Cần đạt nhiều điểm B+ và B, tránh điểm C.";
    } else if (requiredFutureGPA >= 2.5) {
      gradeBadgeText = "Điểm B & C+";
      gradeSuggestionText = "Duy trì trung bình từ điểm B và C+.";
    } else if (requiredFutureGPA >= 2.0) {
      gradeBadgeText = "Điểm C (≥ 2.0)";
      gradeSuggestionText = "Duy trì trung bình từ điểm C trở lên.";
    } else {
      gradeBadgeText = "Điểm D+ / C (≥ 1.5)";
      gradeSuggestionText = "Duy trì điểm trung bình từ D+ và C.";
    }
  }

  return {
    totalCredits: totalCreds,
    completedCredits: completedCreds,
    remainingCredits: remainingCreds,
    progressPercent,
    approxCoursesRemaining,
    targetGPA,
    targetRankLabel,
    targetKey,
    requiredFutureGPA: Math.max(0, requiredFutureGPA),
    status,
    gradeBadgeText,
    gradeSuggestionText,
    pointsGap,
    approxRetakeCreditsNeeded,
    approxRetakeCourses,
    improvableCourses,
  };
}

/**
 * Đề xuất mục tiêu tốt nghiệp tối ưu tiếp theo căn cứ trên GPA hiện tại
 */
export function getRecommendedGraduationTarget(currentGPA: number = 0): number {
  if (currentGPA >= 3.4) return 3.6; // Xuất sắc
  if (currentGPA >= 2.8) return 3.2; // Giỏi
  if (currentGPA >= 2.2) return 2.5; // Khá
  return 2.0; // Trung bình / Chuẩn ra trường
}
