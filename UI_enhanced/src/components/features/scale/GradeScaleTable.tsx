import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GRADE_SCALE } from "@/lib/gpa-engine";
import { getGradeColorClass } from "@/lib/utils/grade-utils";

export const GradeScaleTable = memo(() => {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white gap-0 py-0">
      <CardHeader className="pt-4 pb-2.5 px-4 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-[12px] text-slate-800 font-black uppercase tracking-widest">
          Thang điểm HUFLIT
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-3">
        <Table>
          <TableHeader className="bg-slate-50/30">
            <TableRow className="hover:bg-transparent border-b-slate-100">
              <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-center w-16">
                Chữ
              </TableHead>
              <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-center">
                Hệ 10
              </TableHead>
              <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 text-center w-16">
                GPA
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GRADE_SCALE.map((scale) => (
              <TableRow key={scale.grade} className="hover:bg-slate-50/50 border-b-slate-50 transition-colors">
                <TableCell className="py-1 text-center">
                  <span className={`inline-flex items-center pl-2.5 w-9 h-5 rounded-md text-[11px] font-bold font-mono ${getGradeColorClass(scale.grade)}`}>
                    {scale.grade}
                  </span>
                </TableCell>
                <TableCell className="py-1 flex justify-center">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center font-mono tabular-nums text-xs min-w-[70px]">
                    <span className="text-right text-slate-600 font-bold">{scale.min.toFixed(1)}</span>
                    <span className="text-slate-300 font-bold">-</span>
                    <span className="text-left text-slate-600 font-bold">{scale.max.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell className="py-1 text-xs font-bold text-slate-800 text-center font-mono tabular-nums">
                  {scale.gpa.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

GradeScaleTable.displayName = "GradeScaleTable";
