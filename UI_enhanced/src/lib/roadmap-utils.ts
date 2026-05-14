export type ResultStatus =
  | "no-credits"
  | "impossible"
  | "very-hard"
  | "hard"
  | "achievable"
  | "achieved";

export function getResultStatus(
  requiredGPA: number,
  totalEffortCredits: number,
  currentGPA: number,
  targetGPA: number
): ResultStatus {
  // 1. Target already met (including improvements from locked retakes)
  if (requiredGPA <= 0) return "achieved";
  
  // 2. Impossible to reach even with 4.0 in all future credits
  if (requiredGPA > 4.0) return "impossible";
  
  // 3. No credits left to work with, but target not yet met
  if (totalEffortCredits === 0 && requiredGPA > 0) return "no-credits";

  // 4. Feasibility levels
  if (requiredGPA > 3.7) return "very-hard";
  if (requiredGPA > 3.2) return "hard";
  return "achievable";
}

export function getStatusTextColor(status: ResultStatus): string {
  const map: Record<ResultStatus, string> = {
    "no-credits": "text-rose-500",
    "impossible": "text-orange-600",
    "very-hard": "text-amber-500",
    "hard": "text-blue-500",
    "achievable": "text-emerald-500",
    "achieved": "text-emerald-500",
  };
  return map[status];
}

export function getStatusBorderColor(status: ResultStatus): string {
  const map: Record<ResultStatus, string> = {
    "no-credits": "border-rose-100",
    "impossible": "border-orange-100",
    "very-hard": "border-amber-100",
    "hard": "border-blue-100",
    "achievable": "border-emerald-100",
    "achieved": "border-emerald-100",
  };
  return map[status];
}

export function isStatusNegative(status: ResultStatus): boolean {
  return status === "no-credits" || status === "impossible";
}

export function getStatusLabel(status: ResultStatus, maxPossibleGPA: number): string {
  switch (status) {
    case "no-credits":  return "Cần thêm môn học lại";
    case "impossible":  return `Cần học cải thiện • GPA tối đa hiện tại: ${maxPossibleGPA.toFixed(2)}`;
    case "very-hard":   return "Cần nỗ lực cực kỳ lớn";
    case "hard":        return "Đòi hỏi tập trung cao";
    case "achieved":    return "Đã đạt mục tiêu đề ra";
    case "achievable":  return "Khá khả thi, hãy duy trì";
    default: return "";
  }
}

export function getDisplayGPA(status: ResultStatus, requiredGPA: number): string {
  if (status === "no-credits") return "CẦN THÊM";
  if (status === "achieved") return "ĐẠT";
  if (status === "impossible" || requiredGPA === Infinity || requiredGPA > 4.0) return "CẦN CẢI THIỆN";
  return requiredGPA.toFixed(2);
}

export function getDisplayLabel(status: ResultStatus): string {
  return status === "no-credits" ? "Yêu cầu hành động" : "GPA Cần đạt trung bình";
}
