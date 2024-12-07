import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Event, ValidationFailure } from "../../services/api";
import { IMaskInput } from "react-imask";
import { forwardRef } from "react";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import {
  validateEvent,
  ValidationError,
} from "../../validations/eventValidation";
import { useSnackbar } from "notistack";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => void;
  onDelete?: () => void;
  selectedDate?: string;
  event?: Event | null;
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

export default function EventDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  event,
}: EventDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<Partial<Event>>({
    brideName: "",
    brideSurname: "",
    groomName: "",
    groomSurname: "",
    eventTimeStart: "",
    eventTimeFinish: "",
    title: "",
    eventType: null as unknown as number,
    hostedNameSurname: "",
    phone: "",
    numberOfGuests: 0,
    description: "",
    eventDate: selectedDate || "",
    createdDate: new Date(),
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [apiValidationErrors, setApiValidationErrors] = useState<
    ValidationFailure[]
  >([]);

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        eventDate: event.eventDate || selectedDate || "",
        eventType: Number(event.eventType),
        numberOfGuests: Number(event.numberOfGuests),
      });
    } else {
      setFormData({
        brideName: "",
        brideSurname: "",
        groomName: "",
        groomSurname: "",
        eventTimeStart: "",
        eventTimeFinish: "",
        title: "",
        eventType: null as unknown as number,
        hostedNameSurname: "",
        phone: "",
        numberOfGuests: 0,
        description: "",
        eventDate: selectedDate || "",
        createdDate: new Date(),
      });
    }
    setApiValidationErrors([]);
    setValidationErrors([]);
  }, [event, selectedDate]);

  useEffect(() => {
    if (
      formData.hostedNameSurname ||
      formData.eventTimeStart ||
      formData.eventTimeFinish
    ) {
      let newTitle = "";

      const namePart = formData.hostedNameSurname || "";

      const timePart =
        formData.eventTimeStart && formData.eventTimeFinish
          ? `${formData.eventTimeStart} - ${formData.eventTimeFinish}`
          : "";

      if (window.innerWidth >= 768) {
        newTitle = `${namePart}\n${timePart}`;
      } else {
        const shortName = formData.hostedNameSurname
          ? formData.hostedNameSurname.split(" ")[0]
          : "";
        newTitle = `${shortName}\n${timePart}`;
      }

      setFormData((prev) => ({
        ...prev,
        title: newTitle.trim(),
      }));
    }
  }, [
    formData.hostedNameSurname,
    formData.eventTimeStart,
    formData.eventTimeFinish,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiValidationErrors([]);
    setValidationErrors([]);

    try {
      await onSave(formData);
    } catch (error: any) {
      console.log("API Error:", error);
      if (error.errors) {
        // API'den gelen validation hatalarını göster
        const apiErrors: ValidationFailure[] = [];

        // API'den gelen hataları işle
        if (typeof error.errors === "object") {
          Object.entries(error.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((message) => {
                apiErrors.push({
                  propertyName: field,
                  errorMessage: message,
                });
                // Her hata mesajı için bildirim göster
                enqueueSnackbar(message, {
                  variant: "error",
                  autoHideDuration: 3000,
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                  },
                });
              });
            }
          });
        } else if (Array.isArray(error.errors)) {
          // Eğer error.errors bir array ise
          error.errors.forEach((err: any) => {
            if (err.value && Array.isArray(err.value)) {
              err.value.forEach((message: string) => {
                enqueueSnackbar(message, {
                  variant: "error",
                  autoHideDuration: 3000,
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                  },
                });
              });
            }
          });
        }

        setApiValidationErrors(apiErrors);
      } else {
        // Genel hata durumu
        enqueueSnackbar("Bir hata oluştu. Lütfen tekrar deneyin.", {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        });
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const apiError = apiValidationErrors.find(
      (error) => error.propertyName.toLowerCase() === fieldName.toLowerCase()
    )?.errorMessage;

    if (apiError) return apiError;

    return validationErrors.find((error) => error.field === fieldName)?.message;
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {event ? "Etkinliği Düzenle" : "Yeni Etkinlik Ekle"}
          {event?.updatedDate && (
            <Typography variant="caption" className="block mt-1 text-gray-500">
              Son Güncelleme:{" "}
              {new Date(event.updatedDate).toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          )}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Sol Sütun */}
              <div className="space-y-4">
                <TextField
                  label="Gelin Adı"
                  value={formData.brideName}
                  onChange={(e) =>
                    setFormData({ ...formData, brideName: e.target.value })
                  }
                  error={!!getFieldError("brideName")}
                  helperText={getFieldError("brideName")}
                  fullWidth
                />
                <TextField
                  label="Gelin Soyadı"
                  value={formData.brideSurname}
                  onChange={(e) =>
                    setFormData({ ...formData, brideSurname: e.target.value })
                  }
                  error={!!getFieldError("brideSurname")}
                  helperText={getFieldError("brideSurname")}
                  fullWidth
                />
                <TextField
                  label="Damat Adı"
                  value={formData.groomName}
                  onChange={(e) =>
                    setFormData({ ...formData, groomName: e.target.value })
                  }
                  error={!!getFieldError("groomName")}
                  helperText={getFieldError("groomName")}
                  fullWidth
                />
                <TextField
                  label="Damat Soyadı"
                  value={formData.groomSurname}
                  onChange={(e) =>
                    setFormData({ ...formData, groomSurname: e.target.value })
                  }
                  error={!!getFieldError("groomSurname")}
                  helperText={getFieldError("groomSurname")}
                  fullWidth
                />
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="tr"
                >
                  <DatePicker
                    label="Etkinlik Tarihi"
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

                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <TimePicker
                        label="Başlangıç Saati"
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
                      <Typography className="mt-1 text-sm text-gray-600 lg:hidden">
                        {formData.eventTimeStart
                          ? `Başlangıç: ${formData.eventTimeStart}`
                          : "Başlangıç saati seçilmedi"}
                      </Typography>
                    </div>

                    <div className="flex-1">
                      <TimePicker
                        label="Bitiş Saati"
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
                      <Typography className="mt-1 text-sm text-gray-600 lg:hidden">
                        {formData.eventTimeFinish
                          ? `Bitiş: ${formData.eventTimeFinish}`
                          : "Bitiş saati seçilmedi"}
                      </Typography>
                    </div>
                  </div>
                </LocalizationProvider>
                <TextField
                  label="Sözleşme Sahibi Ad Soyad"
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
              </div>

              {/* Sağ Sütun */}
              <div className="space-y-4">
                <FormControl fullWidth error={!!getFieldError("eventType")}>
                  <InputLabel>Etkinlik Tipi</InputLabel>
                  <Select
                    value={
                      formData.eventType === null ? "" : formData.eventType
                    }
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
                    <FormHelperText>
                      {getFieldError("eventType")}
                    </FormHelperText>
                  )}
                </FormControl>

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

                <TextField
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  multiline
                  rows={10}
                  error={!!getFieldError("description")}
                  helperText={getFieldError("description")}
                  fullWidth
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ padding: 2 }}>
            {event && (
              <Button
                onClick={handleDelete}
                color="error"
                sx={{ marginRight: "auto" }}
              >
                Sil
              </Button>
            )}
            <Button onClick={onClose}>İptal</Button>
            <Button type="submit" color="primary">
              {event ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Silme Onay Modalı */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Etkinliği Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu etkinliği silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button onClick={() => setShowDeleteConfirm(false)}>İptal</Button>
          <Button onClick={confirmDelete} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
