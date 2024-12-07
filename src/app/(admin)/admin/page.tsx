"use client";

import React, { useState } from "react";
import Calendar from "@/components/AdminComponents/Calendar";
import EventDrawer from "@/components/AdminComponents/EventDrawer";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function AdminPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <IconButton
          onClick={() => setDrawerOpen(true)}
          className="!bg-primary hover:!bg-primary-hover !text-white"
        >
          <AddIcon />
        </IconButton>
      </div>

      <Calendar key={refreshKey} />

      <EventDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEventAdded={handleEventAdded}
      />
    </div>
  );
}
