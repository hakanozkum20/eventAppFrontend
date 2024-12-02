import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
}

export default function DeleteEventDialog({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
}: DeleteEventDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Etkinliği Sil</DialogTitle>
      <DialogContent>
        <Typography>
          "{eventTitle}" etkinliğini silmek istediğinize emin misiniz?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={onConfirm} color="error">
          Sil
        </Button>
      </DialogActions>
    </Dialog>
  );
}
