import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type {
  Doc,
  Id,
} from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AddVacationForm } from "@/components/add-vacation-form";
import { VacationList } from "@/components/vacation-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberList({ teamId }: { teamId: Id<"teams"> }) {
  const members = useQuery(api.members.listByTeam, { teamId });
  const team = useQuery(api.teams.getById, { id: teamId });
  const reorder = useMutation(api.members.reorder);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (members === undefined) {
    return (
      <div className="grid gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-4">
        No members yet. Add one above.
      </p>
    );
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const reordered = [...members];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);

    setDragIndex(null);
    setOverIndex(null);

    try {
      await reorder({
        teamId,
        memberIds: reordered.map((m) => m._id),
      });
    } catch {
      toast.error("Failed to reorder members");
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="grid gap-1">
      {members.map((member, index) => (
        <MemberRow
          key={member._id}
          member={member}
          isOnCall={team?.currentOnCallMemberId === member._id}
          index={index}
          isDragging={dragIndex === index}
          isOver={overIndex === index}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}

function MemberRow({
  member,
  isOnCall,
  index,
  isDragging,
  isOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  member: Doc<"members">;
  isOnCall: boolean;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const removeMember = useMutation(api.members.remove);

  const handleRemove = async () => {
    try {
      await removeMember({ id: member._id });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`border rounded-none transition-opacity ${
        isDragging ? "opacity-40" : ""
      } ${isOver ? "border-t-2 border-t-primary" : ""}`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <GripVertical className="size-3.5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
          <span className="text-xs font-medium">{member.name}</span>
          {isOnCall && <Badge variant="default">On Call</Badge>}
        </div>
        <Button variant="ghost" size="icon-xs" onClick={handleRemove}>
          <Trash2 />
        </Button>
      </div>
      {expanded && (
        <div className="border-t px-3 py-2 grid gap-2">
          <p className="text-xs text-muted-foreground font-medium">Vacations</p>
          <VacationList memberId={member._id} />
          <AddVacationForm memberId={member._id} />
        </div>
      )}
    </div>
  );
}
