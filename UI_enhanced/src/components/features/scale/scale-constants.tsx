import React from "react";
import { Sun, Sunset, Moon } from "lucide-react";

export const SESSION_CONFIG: Record<string, { bg: string; text: string; border: string; iconBg: string; iconColor: string }> = {
  "Sáng": { 
    bg: "bg-amber-50/30", 
    text: "text-amber-700", 
    border: "border-amber-100/50", 
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600"
  },
  "Chiều": { 
    bg: "bg-sky-50/30", 
    text: "text-sky-700", 
    border: "border-sky-100/50", 
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600"
  },
  "Tối": { 
    bg: "bg-indigo-50/30", 
    text: "text-indigo-700", 
    border: "border-indigo-100/50", 
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600"
  }
};

export const SCHEDULE = [
  {
    session: "Sáng",
    icon: <Sun className="h-4 w-4" strokeWidth={2} />,
    items: [
      { period: "1", start: "06:45", end: "07:35" },
      { period: "2", start: "07:35", end: "08:25" },
      { period: "3", start: "08:25", end: "09:15" },
      { break: "Giải lao 15 phút", time: "09:15 - 09:30" },
      { period: "4", start: "09:30", end: "10:20" },
      { period: "5", start: "10:20", end: "11:10" },
      { period: "6", start: "11:10", end: "12:00" },
    ]
  },
  {
    session: "Chiều",
    icon: <Sunset className="h-4 w-4" strokeWidth={2} />,
    items: [
      { period: "7", start: "12:45", end: "13:35" },
      { period: "8", start: "13:35", end: "14:25" },
      { period: "9", start: "14:25", end: "15:15" },
      { break: "Giải lao 15 phút", time: "15:15 - 15:30" },
      { period: "10", start: "15:30", end: "16:20" },
      { period: "11", start: "16:20", end: "17:10" },
      { period: "12", start: "17:10", end: "18:00" },
    ]
  },
  {
    session: "Tối",
    icon: <Moon className="h-4 w-4" strokeWidth={2} />,
    items: [
      { period: "13", start: "18:15", end: "19:05" },
      { period: "14", start: "19:05", end: "19:55" },
      { period: "15", start: "19:55", end: "20:45" },
    ]
  }
];

export interface RoomCodeItem {
  code: string;
  campus: string;
  district: string;
  address: string;
  note?: string;
  mapUrl: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    indicator: string;
  };
}

export const ROOM_CODES: RoomCodeItem[] = [
  {
    code: "A - B - PM",
    campus: "CS Sư Vạn Hạnh",
    district: "Quận 10",
    address: "828 Sư Vạn Hạnh, P.12, Q.10",
    note: "Khu A, B & Phòng máy",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=HUFLIT+828+S%C6%B0+V%E1%BA%A1n+H%E1%BA%A1nh+Qu%E1%BA%ADn+10",
    colorScheme: {
      bg: "bg-blue-50/30 hover:bg-blue-50/60",
      text: "text-blue-900",
      border: "border-blue-100",
      badgeBg: "bg-blue-100/90",
      badgeText: "text-blue-800",
      badgeBorder: "border-blue-200/80",
      indicator: "bg-blue-500"
    }
  },
  {
    code: "HA - HB",
    campus: "CS Hóc Môn",
    district: "Hóc Môn",
    address: "Tân Hiệp, Huyện Hóc Môn",
    note: "Khu Hóc Môn A & B",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=HUFLIT+C%C6%A1+s%E1%BB%9F+H%C3%B3c+M%C3%B4n",
    colorScheme: {
      bg: "bg-emerald-50/30 hover:bg-emerald-50/60",
      text: "text-emerald-900",
      border: "border-emerald-100",
      badgeBg: "bg-emerald-100/90",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-200/80",
      indicator: "bg-emerald-500"
    }
  },
  {
    code: "K",
    campus: "CS Trường Sơn",
    district: "Tân Bình",
    address: "140/30 Trường Sơn, P.2, Q. Tân Bình",
    note: "Khu giảng đường K",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=HUFLIT+140%2F30+Tr%C6%B0%E1%BB%9Dng+S%C6%A1n+T%C3%A2n+B%C3%ACnh",
    colorScheme: {
      bg: "bg-amber-50/30 hover:bg-amber-50/60",
      text: "text-amber-900",
      border: "border-amber-100",
      badgeBg: "bg-amber-100/90",
      badgeText: "text-amber-800",
      badgeBorder: "border-amber-200/80",
      indicator: "bg-amber-500"
    }
  },
  {
    code: "G",
    campus: "CS Ba Gia",
    district: "Tân Bình",
    address: "Đường Ba Gia, P.7, Q. Tân Bình",
    note: "Khu giảng đường G",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=HUFLIT+Ba+Gia+T%C3%A2n+B%C3%ACnh",
    colorScheme: {
      bg: "bg-purple-50/30 hover:bg-purple-50/60",
      text: "text-purple-900",
      border: "border-purple-100",
      badgeBg: "bg-purple-100/90",
      badgeText: "text-purple-800",
      badgeBorder: "border-purple-200/80",
      indicator: "bg-purple-500"
    }
  }
];
