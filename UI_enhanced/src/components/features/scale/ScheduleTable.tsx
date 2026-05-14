import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coffee } from "lucide-react";
import { SCHEDULE, SESSION_CONFIG } from "./scale-constants";

export const ScheduleTable = memo(() => {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white gap-0 py-0">
      <CardHeader className="pt-4 pb-2 px-4 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-1 rounded-lg">
              <Coffee className="h-3.5 w-3.5 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="text-[12px] text-slate-800 font-bold uppercase tracking-wider">
                Thời gian biểu Tiết học
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="h-7 w-[100px] text-center text-[10px] font-bold uppercase text-slate-400 tracking-wider border-r border-slate-100/50">
                  Buổi
                </TableHead>
                <TableHead className="h-7 w-[80px] text-center text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Tiết
                </TableHead>
                <TableHead className="h-7 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-center">
                  Thời gian chi tiết
                </TableHead>
                <TableHead className="h-7 w-[100px] text-[10px] font-bold uppercase text-slate-400 tracking-wider text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCHEDULE.map((session) => (
                <React.Fragment key={session.session}>
                  {session.items.map((item, idx) => {
                    const config = SESSION_CONFIG[session.session];
                    return (
                      <TableRow
                        key={idx}
                        className={`group border-b-slate-100/50 ${item.break ? "bg-white/50" : `${config.bg} hover:bg-white/80 transition-all duration-300`
                          }`}
                      >
                        {idx === 0 && (
                          <TableCell rowSpan={session.items.length} className={`border-r ${config.border} ${config.bg} relative`}>
                            <div className="flex flex-col items-center justify-center gap-2 py-0.5">
                              <div className={`p-1.5 rounded-xl ${config.iconBg} shadow-sm border ${config.border}`}>
                                {React.cloneElement(session.icon as React.ReactElement<{ className?: string }>, {
                                  className: `h-3.5 w-3.5 ${config.iconColor}`
                                })}
                              </div>
                              <span className={`font-black text-[10px] uppercase tracking-[0.2em] vertical-text ${config.text}`}>
                                {session.session}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {item.break ? (
                          <TableCell colSpan={3} className="py-2.5">
                            <div className="flex items-center justify-center gap-3 px-4">
                              <div className={`h-[1.5px] flex-1 ${config.bg} opacity-50 rounded-full`}></div>
                              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${config.text}`}>
                                <div className={`p-1 rounded-lg ${config.iconBg} shadow-inner`}>
                                  <Coffee className="h-3 w-3" strokeWidth={3} />
                                </div>
                                {item.break}
                                <span className="opacity-60 font-mono text-[11px] font-medium">({item.time})</span>
                              </div>
                              <div className={`h-[1.5px] flex-1 ${config.bg} opacity-50 rounded-full`}></div>
                            </div>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="text-center py-1.5">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl ${config.iconBg} ${config.text} font-black text-[12px] border ${config.border} shadow-sm group-hover:scale-110 transition-all duration-300`}>
                                {item.period}
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5">
                              <div className="flex items-center justify-center gap-2.5">
                                <span className={`font-mono text-[12px] ${config.text} font-black tabular-nums bg-white px-2 py-0.5 rounded-lg border ${config.border} shadow-sm`}>{item.start}</span>
                                <span className={`${config.text} opacity-30 text-[10px] font-black`}>→</span>
                                <span className={`font-mono text-[12px] ${config.text} font-black tabular-nums bg-white px-2 py-0.5 rounded-lg border ${config.border} shadow-sm`}>{item.end}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 text-center">
                              <div className={`inline-block w-2 h-2 rounded-full ${config.iconBg} border ${config.border} group-hover:scale-125 transition-all duration-300 shadow-sm`}></div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

ScheduleTable.displayName = "ScheduleTable";
