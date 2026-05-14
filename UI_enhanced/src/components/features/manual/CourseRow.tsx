"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Course, GRADE_SCALE } from "@/lib/gpa-engine";

interface CourseRowProps {
  course: Course;
  sIdx: number;
  cIdx: number;
  onUpdate: (sIdx: number, cIdx: number, field: keyof Course, value: any) => void;
  onRemove: (sIdx: number, cIdx: number) => void;
}

const CourseRow = memo(({
  course,
  sIdx,
  cIdx,
  onUpdate,
  onRemove,
}: CourseRowProps) => {
  return (
    <TableRow className="hover:bg-slate-50/80 group transition-colors border-b border-slate-200 last:border-0">
      <TableCell className="ps-2 sm:ps-5 py-1.5">
          <Input
            placeholder="Tên môn học..."
            value={course.name}
            onChange={(e) => onUpdate(sIdx, cIdx, "name", e.target.value)}
            className="bg-white border-slate-300 h-8 text-[10px] md:text-[13px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            aria-label="Tên môn học"
          />
      </TableCell>
      <TableCell className="text-center py-1.5">
          <Input
            type="number"
            min="1"
            value={course.credits}
            onChange={(e) => onUpdate(sIdx, cIdx, "credits", parseInt(e.target.value) || 0)}
            className="bg-white border-slate-300 h-8 text-sm text-center font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            aria-label="Số tín chỉ"
          />
      </TableCell>
      <TableCell className="text-center py-1.5 px-1">
        <Select
          value={course.grade || ""}
          onValueChange={(val) => onUpdate(sIdx, cIdx, "grade", val)}
        >
          <SelectTrigger 
            className="bg-white border-slate-300 h-8 w-14 sm:w-20 text-sm font-bold text-blue-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm mx-auto cursor-pointer px-1"
            aria-label="Chọn điểm chữ"
          >
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {GRADE_SCALE.map(g => (
              <SelectItem key={g.grade} value={g.grade} className="font-semibold">{g.grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center py-1.5 px-1">
        <div className="flex flex-col items-center gap-1">
          <Switch
            checked={course.isRetake ?? false}
            onCheckedChange={(val) => onUpdate(sIdx, cIdx, "isRetake", val)}
            className="scale-[0.7] sm:scale-75 data-[state=checked]:bg-blue-600"
            aria-label="Đánh dấu học lại"
          />
          {course.isRetake && (
            <Select
              value={course.oldGrade || ""}
              onValueChange={(val) => onUpdate(sIdx, cIdx, "oldGrade", val)}
            >
              <SelectTrigger 
                className="h-6 w-12 sm:h-7 sm:w-16 text-[9px] sm:text-[10px] font-bold bg-slate-50 border-slate-200 cursor-pointer px-1"
                aria-label="Chọn điểm cũ"
              >
                <SelectValue placeholder="Cũ" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_SCALE.filter(g => g.gpa < 2.5).map(g => (
                  <SelectItem key={g.grade} value={g.grade} className="text-[10px] font-bold">{g.grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right pe-1 sm:pe-5 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(sIdx, cIdx)}
          className="h-7 w-7 sm:h-8 sm:w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`Xóa môn học ${course.name || (cIdx + 1)}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

CourseRow.displayName = "CourseRow";

export default CourseRow;
