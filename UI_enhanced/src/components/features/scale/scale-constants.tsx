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
