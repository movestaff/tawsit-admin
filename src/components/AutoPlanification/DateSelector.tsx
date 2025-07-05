// src/components/DateSelector.tsx

import React from 'react';
import Card from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type DateSelectorProps = {
  dateReference: string;
  onChange: (date: string) => void;
};

export default function DateSelector({
  dateReference,
  onChange,
}: DateSelectorProps) {
  return (
    <Card className="space-y-4">
      <div className="border-b pb-2 text-lg font-semibold">
        3️⃣ Date de référence
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dateReference" className="text-sm text-gray-700">
          Choisir la date :
        </label>
        <Input
          id="dateReference"
          type="date"
          value={dateReference}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-xs"
        />
      </div>
    </Card>
  );
}
