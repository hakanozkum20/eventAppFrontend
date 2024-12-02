"use client";

import React from "react";
import Calendar from "@/components/AdminComponents/Calendar";

export default function AdminPage() {
  return (
    <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md">
      <Calendar />
    </div>
  );
}
