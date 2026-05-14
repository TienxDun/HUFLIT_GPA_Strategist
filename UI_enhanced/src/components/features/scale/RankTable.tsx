import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RankItem {
  rank: string;
  range: string;
  color: string;
}

interface RankTableProps {
  title: string;
  data: RankItem[];
  labelColumnName?: string;
  valueColumnName?: string;
}

export const RankTable = memo(({
  title,
  data,
  labelColumnName = "Phân loại",
  valueColumnName = "Khoảng GPA"
}: RankTableProps) => {
  
  const renderRange = (range: string) => {
    // Nếu dải điểm có dấu gạch ngang, tách ra để căn chỉnh
    if (range.includes(" - ")) {
      const parts = range.split(" - ");
      return (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center font-mono tabular-nums text-xs min-w-[90px] ml-auto">
          <span className="text-right text-slate-700">{parts[0]}</span>
          <span className="text-slate-300 font-bold">-</span>
          <span className="text-left text-slate-700">{parts[1]}</span>
        </div>
      );
    }
    
    // Trường hợp không có dấu gạch ngang (ví dụ: < 1.0)
    return (
      <div className="font-mono tabular-nums text-xs text-right text-slate-700 w-full pr-1">
        {range}
      </div>
    );
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white gap-0 py-0">
      <CardHeader className="pt-4 pb-2.5 px-4 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-[12px] text-slate-800 font-black uppercase tracking-widest">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-3">
        <Table>
          <TableHeader className="bg-slate-50/30">
            <TableRow className="hover:bg-transparent border-b-slate-100">
              <TableHead className="h-8 text-[11px] font-bold uppercase text-slate-400 pl-4">
                {labelColumnName}
              </TableHead>
              <TableHead className="h-8 pr-4">
                <div className="text-[11px] font-bold uppercase text-slate-400 text-center min-w-[90px] ml-auto">
                  {valueColumnName}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.rank} className="hover:bg-slate-50/50 border-b-slate-50 transition-colors">
                <TableCell className="py-1 pl-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                    {item.rank}
                  </span>
                </TableCell>
                <TableCell className="py-1 pr-4">
                  {renderRange(item.range)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

RankTable.displayName = "RankTable";
