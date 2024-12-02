import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  selectedDate: string;
}

export default function EventDialog({
  isOpen,
  onClose,
  onSave,
  selectedDate,
}: EventDialogProps) {
  const [title, setTitle] = React.useState("");

  const handleSave = () => {
    if (title.trim()) {
      onSave(title);
      setTitle("");
    }
  };

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      slotProps={{
        backdrop: {
          timeout: 500,
          style: {
            backdropFilter: "blur(1px)",
          },
        },
      }}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Etkinlik Başlığı"
          type="text"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSave();
            }
          }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Tarih: {selectedDate}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
}
