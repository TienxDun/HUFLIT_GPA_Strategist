import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, Info, Compass, ExternalLink } from "lucide-react";
import { ROOM_CODES } from "./scale-constants";

export const RoomCodeTable = memo(() => {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white gap-0 py-0">
      {/* Header */}
      <CardHeader className="pt-3.5 pb-2.5 px-3 sm:px-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-blue-500/10 p-1 rounded-lg flex-shrink-0">
              <Building2 className="h-3.5 w-3.5 text-blue-600" strokeWidth={2} />
            </div>
            <CardTitle className="text-[11px] sm:text-[12px] text-slate-800 font-bold uppercase tracking-wider truncate">
              Ký hiệu Phòng học & Cơ sở
            </CardTitle>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1 flex-shrink-0">
            <Compass className="h-3 w-3 text-slate-400" />
            <span>4 cơ sở</span>
            <span className="hidden sm:inline">HUFLIT</span>
          </span>
        </div>
      </CardHeader>

      {/* Danh sách cơ sở dạng List chuẩn cột cân xứng & responsive mobile */}
      <CardContent className="p-2.5 sm:p-4">
        <div className="space-y-2">
          {ROOM_CODES.map((item) => (
            <div
              key={item.code}
              className={`p-2.5 sm:p-3 rounded-xl border ${item.colorScheme.border} ${item.colorScheme.bg} transition-all duration-200 hover:shadow-xs group flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-3`}
            >
              {/* MOBILE: Hàng trên gom Badge + Tên cơ sở + Chip Quận | DESKTOP: Bung vào Grid */}
              <div className="flex items-center justify-between sm:contents">
                {/* Cột 1 (Desktop): Badge Ký hiệu mã phòng */}
                <div className="sm:col-span-3 lg:col-span-2 flex items-center justify-start sm:justify-center flex-shrink-0">
                  <span
                    className={`inline-flex items-center justify-center w-[82px] sm:w-[92px] py-1.5 px-1.5 rounded-lg font-mono font-bold text-[11px] sm:text-[12px] tracking-wide border shadow-2xs text-center select-all ${item.colorScheme.badgeBg} ${item.colorScheme.badgeText} ${item.colorScheme.badgeBorder} group-hover:scale-105 transition-transform duration-200`}
                  >
                    {item.code}
                  </span>
                </div>

                {/* Cột 2 (Desktop): Tên cơ sở & Phân khu */}
                <div className="sm:col-span-4 lg:col-span-4 min-w-0 ml-2.5 sm:ml-0 flex-1">
                  <h4 className="font-bold text-[12.5px] sm:text-[13px] text-slate-800 tracking-tight leading-tight">
                    {item.campus}
                  </h4>
                  {item.note && (
                    <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.colorScheme.indicator}`}></span>
                      <span className="truncate">{item.note}</span>
                    </div>
                  )}
                </div>

                {/* Chip Quận trên Mobile: Nằm gọn ở góc phải hàng trên */}
                <span className="sm:hidden text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 text-slate-600 flex-shrink-0 shadow-2xs">
                  {item.district}
                </span>
              </div>

              {/* MOBILE: Hàng dưới dành trọn 100% cho Địa chỉ & Link Google Maps | DESKTOP: Cột 3 */}
              <div className="sm:col-span-5 lg:col-span-6 flex items-center justify-between gap-2 pt-1.5 sm:pt-0 border-t border-slate-200/50 sm:border-t-0">
                <a
                  href={item.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Mở Google Maps chỉ đường đến ${item.campus}`}
                  className="group/map flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-600 hover:text-blue-600 transition-colors py-0.5 rounded min-w-0 flex-1"
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover/map:text-blue-600 group-hover/map:scale-110 transition-all flex-shrink-0" />
                  <span className="leading-snug group-hover/map:underline decoration-blue-400 underline-offset-2 break-words sm:truncate">
                    {item.address}
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 opacity-60 group-hover/map:opacity-100 group-hover/map:text-blue-600 transition-all flex-shrink-0 ml-auto sm:ml-0" />
                </a>

                {/* Chip Quận trên Desktop */}
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 text-slate-600 flex-shrink-0 shadow-2xs">
                  {item.district}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tip thông minh phía dưới */}
        <div className="mt-3 p-2.5 px-3.5 bg-slate-50 border border-slate-100 rounded-lg flex items-start sm:items-center gap-2.5 text-[11px] text-slate-500">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            <strong className="text-slate-700 font-semibold">Ghi nhớ nhanh:</strong> Chữ cái đầu của mã phòng trên TKB là ký hiệu cơ sở (ví dụ: phòng <code className="px-1 py-0.5 bg-white rounded border border-slate-200 text-emerald-600 font-mono font-bold text-[10px]">HA1006</code> tại CS Hóc Môn). Bạn có thể bấm vào địa chỉ để mở Google Maps dẫn đường.
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

RoomCodeTable.displayName = "RoomCodeTable";
