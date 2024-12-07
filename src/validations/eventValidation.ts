import { Event } from "../services/api";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEvent = (formData: Partial<Event>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Gelin bilgileri validasyonu
  if (!formData.brideName?.trim()) {
    errors.push({ field: "brideName", message: "Gelin adı zorunludur" });
  }
  if (!formData.brideSurname?.trim()) {
    errors.push({ field: "brideSurname", message: "Gelin soyadı zorunludur" });
  }

  // Damat bilgileri validasyonu
  if (!formData.groomName?.trim()) {
    errors.push({ field: "groomName", message: "Damat adı zorunludur" });
  }
  if (!formData.groomSurname?.trim()) {
    errors.push({ field: "groomSurname", message: "Damat soyadı zorunludur" });
  }

  // Sözleşme sahibi validasyonu
  if (!formData.hostedNameSurname?.trim()) {
    errors.push({
      field: "hostedNameSurname",
      message: "Sözleşme sahibi adı soyadı zorunludur",
    });
  }

  // Tarih ve saat validasyonu
  if (!formData.eventDate) {
    errors.push({ field: "eventDate", message: "Etkinlik tarihi zorunludur" });
  }
  if (!formData.eventTimeStart) {
    errors.push({
      field: "eventTimeStart",
      message: "Başlangıç saati zorunludur",
    });
  }
  if (!formData.eventTimeFinish) {
    errors.push({
      field: "eventTimeFinish",
      message: "Bitiş saati zorunludur",
    });
  }

  // Telefon validasyonu
  if (!formData.phone?.trim()) {
    errors.push({ field: "phone", message: "Telefon numarası zorunludur" });
  } else if (!/^\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/.test(formData.phone)) {
    errors.push({
      field: "phone",
      message: "Geçerli bir telefon numarası giriniz",
    });
  }

  // Misafir sayısı validasyonu
  if (formData.numberOfGuests === undefined || formData.numberOfGuests < 0) {
    errors.push({
      field: "numberOfGuests",
      message: "Geçerli bir misafir sayısı giriniz",
    });
  }

  return errors;
};
