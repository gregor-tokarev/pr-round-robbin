import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type { Id } from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddMemberForm({ teamId }: { teamId: Id<"teams"> }) {
  const [name, setName] = useState("");
  const addMember = useMutation(api.members.add);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await addMember({ teamId, name: trimmed });
      toast.success("Member added");
      setName("");
    } catch {
      toast.error("Failed to add member");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Member name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit" size="sm" disabled={!name.trim()}>
        <Plus data-icon="inline-start" />
        Add
      </Button>
    </form>
  );
}
