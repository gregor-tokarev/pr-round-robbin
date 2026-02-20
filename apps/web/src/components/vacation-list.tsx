import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type { Id } from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CalendarDays, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function VacationList({ memberId }: { memberId: Id<"members"> }) {
  const vacations = useQuery(api.vacations.listByMember, { memberId });
  const removeVacation = useMutation(api.vacations.remove);

  if (!vacations || vacations.length === 0) return null;

  const handleRemove = async (id: Id<"vacations">) => {
    try {
      await removeVacation({ id });
      toast.success("Vacation removed");
    } catch {
      toast.error("Failed to remove vacation");
    }
  };

  return (
    <div className="grid gap-1">
      {vacations.map((v) => (
        <div
          key={v._id}
          className="flex items-center justify-between rounded-none border px-2 py-1"
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3" />
            {v.startDate} &mdash; {v.endDate}
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => handleRemove(v._id)}
          >
            <X />
          </Button>
        </div>
      ))}
    </div>
  );
}
