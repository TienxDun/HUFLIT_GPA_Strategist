import { describe, it, expect } from "vitest";
import { getDeadlineStatus } from "../../../components/study/StudyTasksWidget";

describe("StudyTasksWidget Deadline Logic", () => {
  it("should return null when no dueDate is provided", () => {
    expect(getDeadlineStatus(undefined)).toBeNull();
    expect(getDeadlineStatus("")).toBeNull();
  });

  it("should recognize today as due today", () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const status = getDeadlineStatus(todayStr);
    expect(status).not.toBeNull();
    expect(status?.status).toBe("today");
    expect(status?.isToday).toBe(true);
    expect(status?.shortLabel).toBe("Hôm nay");
  });

  it("should recognize tomorrow as due tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const d = String(tomorrow.getDate()).padStart(2, "0");
    const tomorrowStr = `${y}-${m}-${d}`;

    const status = getDeadlineStatus(tomorrowStr);
    expect(status).not.toBeNull();
    expect(status?.status).toBe("tomorrow");
    expect(status?.isTomorrow).toBe(true);
  });

  it("should recognize past dates as overdue", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const y = past.getFullYear();
    const m = String(past.getMonth() + 1).padStart(2, "0");
    const d = String(past.getDate()).padStart(2, "0");
    const pastStr = `${y}-${m}-${d}`;

    const status = getDeadlineStatus(pastStr);
    expect(status).not.toBeNull();
    expect(status?.status).toBe("overdue");
    expect(status?.isOverdue).toBe(true);
    expect(status?.label).toContain("Quá hạn");
  });

  it("should recognize future dates as future", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const y = future.getFullYear();
    const m = String(future.getMonth() + 1).padStart(2, "0");
    const d = String(future.getDate()).padStart(2, "0");
    const futureStr = `${y}-${m}-${d}`;

    const status = getDeadlineStatus(futureStr);
    expect(status).not.toBeNull();
    expect(status?.status).toBe("future");
    expect(status?.label).toContain("Hạn");
  });
});
