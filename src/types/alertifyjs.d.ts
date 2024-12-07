declare module "alertifyjs" {
  interface AlertifyStatic {
    defaults: {
      transition: string;
      theme: {
        ok: string;
        cancel: string;
        input: string;
      };
      notifier: {
        position: string;
        delay: number;
        closeButton: boolean;
      };
    };

    success(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    message(message: string): void;
    confirm(
      title: string,
      message: string,
      onok: () => void,
      oncancel: () => void
    ): void;
  }

  const alertify: AlertifyStatic;
  export default alertify;
}

declare module "alertifyjs/build/css/alertify.css";
