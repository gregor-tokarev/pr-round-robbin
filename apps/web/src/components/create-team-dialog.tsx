import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createTeam = useMutation(api.teams.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await createTeam({ name: trimmed });
      toast.success("Team created");
      setName("");
      setOpen(false);
    } catch {
      toast.error("Failed to create team");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus data-icon="inline-start" />
            New Team
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Add a new team to the on-call rotation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              className="mt-1.5"
              placeholder="e.g. Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
