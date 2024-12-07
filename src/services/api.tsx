import React from "react";
import http from "./http-client";

export interface Event {
  id: string;
  brideName: string;
  brideSurname: string;
  groomName: string;
  groomSurname: string;
  eventTimeStart: string;
  eventTimeFinish: string;
  title: string;
  eventType: number;
  hostedNameSurname: string;
  phone: string;
  numberOfGuests: number;
  description: string;
  eventDate: string;
  customerId?: string;
  createdDate?: Date;
  updatedDate?: Date;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  allDay?: boolean;
}

export interface ValidationFailure {
  propertyName: string;
  errorMessage: string;
}

export interface ValidationResponse {
  errors: ValidationFailure[];
}

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    try {
      const response = await http.get<Event[]>("/events");
      return response;
    } catch (error) {
      console.error("Events getirilemedi:", error);
      throw error;
    }
  },

  getEvent: async (id: string): Promise<Event> => {
    try {
      const response = await http.get<Event>(`/events/${id}`);
      return response;
    } catch (error) {
      console.error(`Event (ID: ${id}) getirilemedi:`, error);
      throw error;
    }
  },

  createEvent: async (event: Omit<Event, "id">): Promise<Event> => {
    try {
      const response = await http.post<Event>("/events", event);
      return response;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
    try {
      const response = await http.put<Event>("/events", event);
      return response;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      await http.delete(`/events/${id}`);
    } catch (error) {
      console.error(`Event (ID: ${id}) silinemedi:`, error);
      throw error;
    }
  },
};
