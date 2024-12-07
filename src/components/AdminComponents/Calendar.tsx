"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import trLocale from "@fullcalendar/core/locales/tr";
import { Event, eventService } from "../../services/api";
import EventDialog from "./EventDialog";
import { useSnackbar } from "notistack";

export default function Calendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { enqueueSnackbar } = useSnackbar();

  const getEventColorsByType = (eventType: number) => {
    switch (eventType) {
      case 0: // Düğün
        return {
          bg: "#DC2626",
          text: "white",
          border: "#B91C1C",
        };
      case 1: // Nişan
        return {
          bg: "#7C3AED",
          text: "white",
          border: "#6D28D9",
        };
      case 2: // Kına
        return {
          bg: "#2563EB",
          text: "white",
          border: "#1D4ED8",
        };
      default:
        return {
          bg: "#4F46E5",
          text: "white",
          border: "#4338CA",
        };
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();

      console.log("Fetch - Raw events from API:", data);

      const coloredEvents = data.map((event) => {
        const colorScheme = getEventColorsByType(event.eventType);
        console.log("Fetch - Processing event:", {
          id: event.id,
          title: event.title,
          eventType: event.eventType,
          colors: colorScheme,
        });

        return {
          ...event,
          backgroundColor: colorScheme.bg,
          textColor: colorScheme.text,
          borderColor: colorScheme.border,
        };
      });

      console.log("Fetch - Final colored events:", coloredEvents);
      setEvents(coloredEvents);
    } catch (err) {
      setError("Eventler yüklenirken bir hata oluştu");
      enqueueSnackbar("Eventler yüklenirken bir hata oluştu", {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (eventData: Partial<Event>) => {
    try {
      const eventType =
        typeof eventData.eventType === "number" ? eventData.eventType : 0;
      const colorScheme = getEventColorsByType(eventType);

      const newEvent: Partial<Event> = {
        brideName: eventData.brideName,
        brideSurname: eventData.brideSurname,
        groomName: eventData.groomName,
        groomSurname: eventData.groomSurname,
        eventTimeStart: eventData.eventTimeStart,
        eventTimeFinish: eventData.eventTimeFinish,
        title: eventData.title,
        eventType: eventType,
        hostedNameSurname: eventData.hostedNameSurname,
        phone: eventData.phone,
        numberOfGuests: eventData.numberOfGuests,
        description: eventData.description,
        eventDate: eventData.eventDate,
      };

      console.log("Add - Final event data:", newEvent);
      await eventService.createEvent(newEvent as Omit<Event, "id">);
      setIsAddModalOpen(false);
      await fetchEvents();
      enqueueSnackbar("Event başarıyla eklendi", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      });
    } catch (error: any) {
      const _error: Array<{ key: string; value: Array<string> }> = error;
      let message = "";

      for (const item of _error) {
        item.value.forEach((_item) => {
          message += `${_item}\n`;
        });
      }
      enqueueSnackbar(message.trim(), {
        variant: "error",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      });
    }
  };

  const handleUpdateEvent = async (eventData: Partial<Event>) => {
    if (selectedEvent) {
      try {
        const eventType =
          typeof eventData.eventType === "number"
            ? eventData.eventType
            : selectedEvent.eventType;
        const colorScheme = getEventColorsByType(eventType);

        const updateData = {
          id: selectedEvent.id,
          brideName: eventData.brideName || selectedEvent.brideName,
          brideSurname: eventData.brideSurname || selectedEvent.brideSurname,
          groomName: eventData.groomName || selectedEvent.groomName,
          groomSurname: eventData.groomSurname || selectedEvent.groomSurname,
          eventTimeStart:
            eventData.eventTimeStart || selectedEvent.eventTimeStart,
          eventTimeFinish:
            eventData.eventTimeFinish || selectedEvent.eventTimeFinish,
          title: eventData.title || selectedEvent.title,
          eventType: eventType,
          hostedNameSurname:
            eventData.hostedNameSurname || selectedEvent.hostedNameSurname,
          phone: eventData.phone || selectedEvent.phone,
          numberOfGuests:
            eventData.numberOfGuests ?? selectedEvent.numberOfGuests,
          description: eventData.description || selectedEvent.description,
          eventDate: eventData.eventDate || selectedEvent.eventDate,
        };

        console.log("Update - Final event data:", updateData);
        await eventService.updateEvent(selectedEvent.id, updateData);
        setIsAddModalOpen(false);
        setSelectedEvent(null);
        await fetchEvents();
        enqueueSnackbar("Event başarıyla güncellendi", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        });
      } catch (error: any) {
        console.log("Update Event Error:", error);
        if (error.errors) {
          let message = "";
          for (const [key, messages] of Object.entries(error.errors)) {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                message += `${msg}\n`;
              });
            }
          }
          enqueueSnackbar(message.trim(), {
            variant: "error",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          });
        } else {
          enqueueSnackbar(
            "Event güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
            {
              variant: "error",
              autoHideDuration: 3000,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            }
          );
        }
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await eventService.deleteEvent(selectedEvent.id);
        setSelectedEvent(null);
        setIsAddModalOpen(false);
        await fetchEvents();
        enqueueSnackbar("Event başarıyla silindi", {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        });
      } catch (error: any) {
        console.log("Delete Event Error:", error);
        if (error.errors) {
          let message = "";
          for (const [key, messages] of Object.entries(error.errors)) {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                message += `${msg}\n`;
              });
            }
          }
          enqueueSnackbar(message.trim(), {
            variant: "error",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          });
        } else {
          enqueueSnackbar(
            "Event silinirken bir hata oluştu. Lütfen tekrar deneyin.",
            {
              variant: "error",
              autoHideDuration: 3000,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            }
          );
        }
      }
    }
  };

  const handleDateClick = (arg: DateClickArg) => {
    if (!arg.dayEl.classList.contains("fc-day-other")) {
      setSelectedDate(arg.dateStr);
      setSelectedEvent(null);
      setIsAddModalOpen(true);
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const eventId = arg.event.id;
    const event = events.find((e) => e.id === eventId);

    if (event) {
      setSelectedEvent(event);
      setIsAddModalOpen(true);
    }
  };

  const handleDatesSet = (arg: any) => {
    setCurrentYear(arg.view.currentStart.getFullYear());
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const addMoreEventsClickHandler = () => {
      const moreLinks = document.querySelectorAll(".fc-more-link");
      moreLinks.forEach((link) => {
        link.addEventListener("click", () => {
          setTimeout(() => {
            const popoverEvents = document.querySelectorAll(
              ".fc-popover .fc-event"
            );
            popoverEvents.forEach((eventEl) => {
              eventEl.addEventListener("click", (e) => {
                e.preventDefault();
                const eventId = (eventEl as HTMLElement).getAttribute(
                  "data-event-id"
                );
                if (eventId) {
                  const event = events.find((e) => e.id === eventId);
                  if (event) {
                    const popover = document.querySelector(".fc-popover");
                    if (popover) {
                      const closeButton =
                        popover.querySelector(".fc-popover-close");
                      if (closeButton instanceof HTMLElement) {
                        closeButton.click();
                      }
                    }
                    setTimeout(() => {
                      setSelectedEvent(event);
                      setIsAddModalOpen(true);
                    }, 50);
                  }
                }
              });
            });
          }, 100);
        });
      });
    };

    addMoreEventsClickHandler();
  }, [events]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.setOption("dayMaxEvents", mobile ? true : false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="w-full h-[calc(100vh-12rem)] bg-white dark:bg-dark rounded-lg shadow-md text-dark-4 dark:text-dark-6">
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dayMaxEvents={isMobile}
        headerToolbar={{
          left: "addEventButton",
          center: "title",
          right: "prevYear,prev,next,nextYear today",
        }}
        customButtons={{
          addEventButton: {
            text: "+",
            click: () => {
              setSelectedDate(new Date().toISOString().split("T")[0]);
              setSelectedEvent(null);
              setIsAddModalOpen(true);
            },
          },
        }}
        buttonText={{
          prevYear: `${currentYear - 1}`,
          nextYear: `${currentYear + 1}`,
          today: "Bugün",
        }}
        datesSet={handleDatesSet}
        height="100%"
        firstDay={1}
        locale={trLocale}
        events={events.map((event) => ({
          id: event.id,
          title: `${event.hostedNameSurname}\n${event.eventTimeStart} - ${event.eventTimeFinish}`,
          date: event.eventDate,
          backgroundColor: getEventColorsByType(event.eventType).bg,
          textColor: getEventColorsByType(event.eventType).text,
          borderColor: getEventColorsByType(event.eventType).border,
          allDay: true,
          extendedProps: { eventData: event },
        }))}
        eventContent={(eventInfo) => {
          const titleParts = eventInfo.event.title.split("\n");
          return (
            <div className="flex flex-col items-center justify-center h-full text-center py-0.5">
              <div className="event-title-name leading-tight">
                {titleParts[0]}
              </div>
              <div className="event-title-time leading-tight">
                {titleParts[1]}
              </div>
            </div>
          );
        }}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        moreLinkContent={({ num }) => (isMobile ? `+${num} daha` : false)}
        editable={false}
        selectable={false}
      />

      <EventDialog
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={selectedEvent ? handleUpdateEvent : handleAddEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
        event={selectedEvent || undefined}
      />
    </div>
  );
}
