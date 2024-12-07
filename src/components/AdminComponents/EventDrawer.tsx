"use client";

import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  FormHelperText,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import CloseIcon from "@mui/icons-material/Close";
import { Event, eventService } from "@/services/api";
import { IMaskInput } from "react-imask";
import { forwardRef } from "react";

interface ValidationError {
  field: string;
  message: string;
}

interface EventDrawerProps {
  open: boolean;
  onClose: () => void;
  onEventAdded?: () => void;
}

const PhoneMaskCustom = forwardRef((props: any, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(500) 000 00 00"
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value: any) =>
        onChange({ target: { name: props.name, value } })
      }
      overwrite
    />
  );
});

export default function EventDrawer({
  open,
  onClose,
  onEventAdded,
}: EventDrawerProps) {
  const [formData, setFormData] = useState<Partial<Event & { menu: string }>>({
    brideName: "",
    brideSurname: "",
    groomName: "",
    groomSurname: "",
    title: "",
    eventType: null as unknown as number,
    hostedNameSurname: "",
    phone: "",
    numberOfGuests: 0,
    description: "",
    eventDate: "",
    menu: "",
    eventTimeStart: "",
    eventTimeFinish: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find((error) => error.field === fieldName)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const errors: ValidationError[] = [];

    if (!formData.brideName?.trim()) {
      errors.push({ field: "brideName", message: "Gelin adı zorunludur" });
    }
    if (!formData.brideSurname?.trim()) {
      errors.push({
        field: "brideSurname",
        message: "Gelin soyadı zorunludur",
      });
    }
    if (!formData.groomName?.trim()) {
      errors.push({ field: "groomName", message: "Damat adı zorunludur" });
    }
    if (!formData.groomSurname?.trim()) {
      errors.push({
        field: "groomSurname",
        message: "Damat soyadı zorunludur",
      });
    }
    if (!formData.eventDate) {
      errors.push({
        field: "eventDate",
        message: "Etkinlik tarihi zorunludur",
      });
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
    if (!formData.hostedNameSurname?.trim()) {
      errors.push({
        field: "hostedNameSurname",
        message: "Organizasyon yetkilisi zorunludur",
      });
    }
    if (!formData.phone?.trim()) {
      errors.push({ field: "phone", message: "Telefon numarası zorunludur" });
    }
    if (formData.eventType === null) {
      errors.push({ field: "eventType", message: "Etkinlik tipi zorunludur" });
    }
    if (formData.numberOfGuests === undefined || formData.numberOfGuests < 0) {
      errors.push({
        field: "numberOfGuests",
        message: "Geçerli bir misafir sayısı giriniz",
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const eventData: Omit<Event, "id"> = {
        ...formData,
        title: `${formData.hostedNameSurname}\n${formData.eventTimeStart} - ${formData.eventTimeFinish}`,
      } as Omit<Event, "id">;

      await eventService.createEvent(eventData);
      onEventAdded?.();
      onClose();
    } catch (error: any) {
      if (error.errors) {
        const apiErrors = Object.entries(error.errors).map(
          ([field, messages]) => ({
            field,
            message: Array.isArray(messages) ? messages[0] : messages,
          })
        );
        setValidationErrors(apiErrors as ValidationError[]);
      } else {
        console.error("Event eklenirken hata oluştu:", error);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: "500px" },
        }}
      >
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-end mb-6">
            <IconButton onClick={onClose} className="!text-gray-600">
              <CloseIcon />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Gelin Bilgileri</h3>
                  <div className="space-y-2">
                    <TextField
                      label="Ad"
                      value={formData.brideName}
                      onChange={(e) =>
                        setFormData({ ...formData, brideName: e.target.value })
                      }
                      error={!!getFieldError("brideName")}
                      helperText={getFieldError("brideName")}
                      fullWidth
                    />
                    <TextField
                      label="Soyad"
                      value={formData.brideSurname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brideSurname: e.target.value,
                        })
                      }
                      error={!!getFieldError("brideSurname")}
                      helperText={getFieldError("brideSurname")}
                      fullWidth
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Damat Bilgileri</h3>
                  <div className="space-y-2">
                    <TextField
                      label="Ad"
                      value={formData.groomName}
                      onChange={(e) =>
                        setFormData({ ...formData, groomName: e.target.value })
                      }
                      error={!!getFieldError("groomName")}
                      helperText={getFieldError("groomName")}
                      fullWidth
                    />
                    <TextField
                      label="Soyad"
                      value={formData.groomSurname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groomSurname: e.target.value,
                        })
                      }
                      error={!!getFieldError("groomSurname")}
                      helperText={getFieldError("groomSurname")}
                      fullWidth
                    />
                  </div>
                </div>
              </div>

              <FormControl fullWidth error={!!getFieldError("eventType")}>
                <InputLabel>Etkinlik Tipi</InputLabel>
                <Select
                  value={formData.eventType === null ? "" : formData.eventType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      eventType:
                        value === ""
                          ? (null as unknown as number)
                          : Number(value),
                    });
                  }}
                  label="Etkinlik Tipi"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value={0}>Düğün</MenuItem>
                  <MenuItem value={1}>Nişan</MenuItem>
                  <MenuItem value={2}>Kına</MenuItem>
                </Select>
                {getFieldError("eventType") && (
                  <FormHelperText>{getFieldError("eventType")}</FormHelperText>
                )}
              </FormControl>

              <div>
                <h3 className="font-medium mb-2">Etkinlik Tarihi ve Saati</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <DatePicker
                      label="Tarih"
                      value={dayjs(formData.eventDate)}
                      onChange={(newValue) =>
                        setFormData({
                          ...formData,
                          eventDate: newValue?.format("YYYY-MM-DD") || "",
                        })
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!getFieldError("eventDate"),
                          helperText: getFieldError("eventDate"),
                        },
                      }}
                    />
                  </div>
                  <div>
                    <TimePicker
                      label="Başlangıç"
                      value={
                        formData.eventTimeStart
                          ? dayjs(formData.eventTimeStart, "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFormData({
                          ...formData,
                          eventTimeStart: newValue
                            ? newValue.format("HH:mm")
                            : "",
                        })
                      }
                      ampm={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!getFieldError("eventTimeStart"),
                          helperText: getFieldError("eventTimeStart"),
                        },
                      }}
                      format="HH:mm"
                    />
                  </div>
                  <div>
                    <TimePicker
                      label="Bitiş"
                      value={
                        formData.eventTimeFinish
                          ? dayjs(formData.eventTimeFinish, "HH:mm")
                          : null
                      }
                      onChange={(newValue) =>
                        setFormData({
                          ...formData,
                          eventTimeFinish: newValue
                            ? newValue.format("HH:mm")
                            : "",
                        })
                      }
                      ampm={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!getFieldError("eventTimeFinish"),
                          helperText: getFieldError("eventTimeFinish"),
                        },
                      }}
                      format="HH:mm"
                    />
                  </div>
                </div>
              </div>

              <TextField
                label="Organizasyon Yetkilisi"
                value={formData.hostedNameSurname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hostedNameSurname: e.target.value,
                  })
                }
                error={!!getFieldError("hostedNameSurname")}
                helperText={getFieldError("hostedNameSurname")}
                fullWidth
              />

              <TextField
                label="Telefon"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                InputProps={{
                  inputComponent: PhoneMaskCustom as any,
                }}
                error={!!getFieldError("phone")}
                helperText={getFieldError("phone")}
                fullWidth
              />

              <TextField
                label="Misafir Sayısı"
                type="number"
                value={formData.numberOfGuests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfGuests: Number(e.target.value),
                  })
                }
                error={!!getFieldError("numberOfGuests")}
                helperText={getFieldError("numberOfGuests")}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Menü Seçimi</InputLabel>
                <Select
                  value={formData.menu}
                  onChange={(e) =>
                    setFormData({ ...formData, menu: e.target.value as string })
                  }
                  label="Menü Seçimi"
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="menu1">Menü 1 - Standart</MenuItem>
                  <MenuItem value="menu2">Menü 2 - Premium</MenuItem>
                  <MenuItem value="menu3">Menü 3 - VIP</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Açıklama"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={4}
                error={!!getFieldError("description")}
                helperText={getFieldError("description")}
                fullWidth
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={onClose}>İptal</Button>
              <Button type="submit" variant="contained" color="primary">
                Kaydet
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </LocalizationProvider>
  );
}
