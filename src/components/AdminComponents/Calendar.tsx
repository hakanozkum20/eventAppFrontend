"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import EventDialog from "./EventDialog";
import DeleteEventDialog from "./DeleteEventDialog";
import "@/css/calendar.css";
import trLocale from "@fullcalendar/core/locales/tr";
import React from "react";
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  allDay?: boolean;
}

const eventColors = [
  { bg: "#4F46E5", border: "#4338CA", text: "white" }, // Indigo
  { bg: "#059669", border: "#047857", text: "white" }, // Emerald
  { bg: "#DC2626", border: "#B91C1C", text: "white" }, // Red
  { bg: "#D97706", border: "#B45309", text: "white" }, // Amber
  { bg: "#7C3AED", border: "#6D28D9", text: "white" }, // Violet
];

export default function Calendar() {
  const [dayHeaderFormat, setDayHeaderFormat] = useState<{
    weekday: "long" | "short" | "narrow";
  }>({
    weekday: "long",
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDayHeaderFormat({ weekday: "short" });
      } else {
        setDayHeaderFormat({ weekday: "long" });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleDateClick = (arg: DateClickArg) => {
    if (!arg.dayEl.classList.contains("fc-day-other")) {
      setSelectedDate(arg.dateStr);
      setIsAddModalOpen(true);
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const dayEl = arg.el.closest(".fc-daygrid-day");
    if (dayEl && !dayEl.classList.contains("fc-day-other")) {
      const event = events.find((e) => e.id === arg.event.id);
      if (event) {
        setSelectedEvent(event);
        setIsDeleteModalOpen(true);
      }
    }
  };

  const handleDatesSet = (arg: any) => {
    setCurrentYear(arg.view.currentStart.getFullYear());
  };

  const handleAddEvent = (title: string) => {
    const colorScheme =
      eventColors[Math.floor(Math.random() * eventColors.length)];

    const newEvent: CalendarEvent = {
      id: new Date().getTime().toString(),
      title,
      date: selectedDate,
      backgroundColor: colorScheme.bg,
      textColor: colorScheme.text,
      borderColor: colorScheme.border,
      allDay: true,
    };
    setEvents([...events, newEvent]);
    setIsAddModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="w-full h-[900px] bg-white dark:bg-dark rounded-lg shadow-md text-dark-4 dark:text-dark-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={trLocale}
        dayMaxEvents={true}
        headerToolbar={{
          left: "title",
          right: "prevYear,prev,next,nextYear today",
          center: "dayGridDay,dayGridWeek,dayGridMonth",
        }}
        buttonText={{
          prevYear: `${currentYear - 1}`,
          nextYear: `${currentYear + 1}`,
        }}
        datesSet={handleDatesSet}
        height="100%"
        dayHeaderFormat={dayHeaderFormat}
        firstDay={1}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={true}
        selectable={true}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        }}
      />

      <EventDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEvent}
        selectedDate={selectedDate}
      />

      <DeleteEventDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEvent}
        eventTitle={selectedEvent?.title || ""}
      />
    </div>
  );
}
