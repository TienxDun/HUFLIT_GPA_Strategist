/**
 * Returns Tailwind CSS classes for color-coding grades based on the HUFLIT scale.
 * @param grade - The letter grade (e.g., 'A+', 'B', 'F')
 */
export function getGradeColorClass(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-100 text-emerald-700 font-semibold";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700 font-semibold";
  if (grade.startsWith("C")) return "bg-amber-100 text-amber-700 font-semibold";
  if (grade.startsWith("D")) return "bg-orange-100 text-orange-700 font-semibold";
  if (grade === "F") return "bg-red-100 text-red-700 font-semibold";
  return "bg-slate-100 text-slate-700";
}
