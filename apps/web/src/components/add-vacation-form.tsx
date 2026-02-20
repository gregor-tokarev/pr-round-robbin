import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type { Id } from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddVacationForm({ memberId }: { memberId: Id<"members"> }) {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const addVacation = useMutation(api.vacations.add);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await addVacation({ memberId, startDate, endDate });
      toast.success("Vacation added");
    } catch {
      toast.error("Failed to add vacation");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="grid gap-1">
        <Label htmlFor={`start-${memberId}`}>Start</Label>
        <Input
          id={`start-${memberId}`}
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`end-${memberId}`}>End</Label>
        <Input
          id={`end-${memberId}`}
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={!startDate || !endDate}>
        <Plus data-icon="inline-start" />
        Add
      </Button>
    </form>
  );
}
