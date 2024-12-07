import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import "alertifyjs/build/css/themes/bootstrap.css";

// Alertify konfigürasyonu
alertify.defaults.transition = "slide";
alertify.defaults.theme = {
  ok: "btn btn-primary",
  cancel: "btn btn-danger",
  input: "form-control",
};
alertify.defaults.notifier.position = "top-right";
alertify.defaults.notifier.delay = 5;
alertify.defaults.notifier.closeButton = true;

export const alertifyService = {
  success: (message: string) => {
    alertify.success(message);
  },
  error: (message: string) => {
    alertify.error(message);
  },
  warning: (message: string) => {
    alertify.warning(message);
  },
  message: (message: string) => {
    alertify.message(message);
  },
  confirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      alertify.confirm(
        "Onay",
        message,
        () => resolve(true),
        () => resolve(false)
      );
    });
  },
};
