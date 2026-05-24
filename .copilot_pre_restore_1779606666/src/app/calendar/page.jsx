"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function CalendarPage() {
  const { theme, t, language } = useApp();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];
    try {
      const res = await fetch(
        `/api/calendar?start_date=${firstDay}&end_date=${lastDay}`,
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  // Prev month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      currentMonth: false,
      date: new Date(year, month + 1, d),
    });
  }

  const eventsForDay = (day) => {
    if (!day.currentMonth) return [];
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
    return events.filter((e) => e.event_date?.startsWith(dayStr));
  };

  const today = new Date();
  const isToday = (day) =>
    day.currentMonth &&
    day.day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const selectedDayEvents = selectedDay
    ? eventsForDay({ day: selectedDay, currentMonth: true })
    : [];

  const getEventColor = (type) => {
    const map = { audit: "#2563EB", deadline: "#DC2626", meeting: "#7C3AED" };
    return map[type] || "#6B7280";
  };

  const weekdays = [
    "day.sun",
    "day.mon",
    "day.tue",
    "day.wed",
    "day.thu",
    "day.fri",
    "day.sat",
  ];

  const monthLabel = `${t(`month.${month + 1}`)} ${year}`;

  const topbarActions = (
    <button
      onClick={goToday}
      className="px-4 py-2 rounded-lg border text-sm font-medium"
      style={{ borderColor, color: textPrimary }}
    >
      {t("calendar.today")}
    </button>
  );

  return (
    <AppShell title={t("calendar.title")} actions={topbarActions}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar grid */}
          <div
            className="xl:col-span-3 rounded-xl border overflow-hidden"
            style={{ backgroundColor: bg, borderColor }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor }}
            >
              <h2
                className="text-lg font-semibold capitalize"
                style={{ color: textPrimary }}
              >
                {monthLabel}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg border"
                  style={{ borderColor, color: textPrimary }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg border"
                  style={{ borderColor, color: textPrimary }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b" style={{ borderColor }}>
              {weekdays.map((key) => (
                <div
                  key={key}
                  className="px-2 py-3 text-center text-xs font-semibold"
                  style={{ color: textMuted }}
                >
                  {t(key)}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((cell, idx) => {
                const dayEvents = eventsForDay(cell);
                const todayCell = isToday(cell);
                const selected = cell.currentMonth && cell.day === selectedDay;

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      cell.currentMonth &&
                      setSelectedDay(cell.day === selectedDay ? null : cell.day)
                    }
                    className="relative min-h-[90px] p-2 border-b border-r text-left transition-colors"
                    style={{
                      borderColor,
                      backgroundColor: selected
                        ? isDark
                          ? "#1E3A5F"
                          : "#EFF6FF"
                        : "transparent",
                    }}
                  >
                    <span
                      className="inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1"
                      style={{
                        backgroundColor: todayCell ? "#2563EB" : "transparent",
                        color: todayCell
                          ? "#FFFFFF"
                          : cell.currentMonth
                            ? textPrimary
                            : textMuted,
                        opacity: cell.currentMonth ? 1 : 0.35,
                      }}
                    >
                      {cell.day}
                    </span>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <div
                          key={i}
                          className="text-xs px-1.5 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: isDark ? "#1F2937" : "#F0F9FF",
                            color: getEventColor(ev.event_type),
                            borderLeft: `3px solid ${getEventColor(ev.event_type)}`,
                          }}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div
                          className="text-xs px-1.5"
                          style={{ color: textMuted }}
                        >
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Legend */}
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: bg, borderColor }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: textPrimary }}
              >
                {t("calendar.events")}
              </h3>
              <div className="space-y-2">
                {[
                  { type: "audit", label: t("calendar.type.audit") },
                  { type: "deadline", label: t("calendar.type.deadline") },
                  { type: "meeting", label: t("calendar.type.meeting") },
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getEventColor(type) }}
                    />
                    <span className="text-sm" style={{ color: textMuted }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected day events */}
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: bg, borderColor }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: textPrimary }}
              >
                {selectedDay
                  ? `${selectedDay} ${t(`month.${month + 1}`)}`
                  : t("calendar.today")}
              </h3>
              {(selectedDay
                ? selectedDayEvents
                : eventsForDay({ day: today.getDate(), currentMonth: true })
              ).length === 0 ? (
                <div className="text-center py-6">
                  <Calendar
                    size={28}
                    className="mx-auto mb-2 opacity-30"
                    style={{ color: textMuted }}
                  />
                  <p className="text-sm" style={{ color: textMuted }}>
                    {t("calendar.noEvents")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selectedDay
                    ? selectedDayEvents
                    : eventsForDay({ day: today.getDate(), currentMonth: true })
                  ).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg border"
                      style={{
                        borderColor,
                        borderLeft: `3px solid ${getEventColor(ev.event_type)}`,
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: textPrimary }}
                      >
                        {ev.title}
                      </p>
                      {ev.description && (
                        <p
                          className="text-xs mt-1 line-clamp-2"
                          style={{ color: textMuted }}
                        >
                          {ev.description}
                        </p>
                      )}
                      <span
                        className="inline-block text-xs mt-2 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                          color: getEventColor(ev.event_type),
                        }}
                      >
                        {t(`calendar.type.${ev.event_type}`)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
