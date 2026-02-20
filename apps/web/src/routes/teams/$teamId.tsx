import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type { Id } from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Trash2, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { AddMemberForm } from "@/components/add-member-form";
import { MemberList } from "@/components/member-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/teams/$teamId")({
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const navigate = useNavigate();
  const team = useQuery(api.teams.getById, {
    id: teamId as Id<"teams">,
  });
  const onCallMember = useQuery(api.onCall.getForTeam, {
    teamId: teamId as Id<"teams">,
  });
  const members = useQuery(api.members.listByTeam, {
    teamId: teamId as Id<"teams">,
  });
  const removeTeam = useMutation(api.teams.remove);

  const handleDelete = async () => {
    try {
      await removeTeam({ id: teamId as Id<"teams"> });
      toast.success("Team deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete team");
    }
  };

  if (team === undefined) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-20 w-full mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (team === null) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-medium">{team.name}</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 data-icon="inline-start" />
          Delete Team
        </Button>
      </div>

      <div className="border rounded-none p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <UserCircle className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Currently on call</span>
        </div>
        {onCallMember === undefined && members === undefined ? (
          <Skeleton className="h-5 w-32 mt-1" />
        ) : onCallMember ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium">{onCallMember.name}</span>
            <Badge>On Call</Badge>
          </div>
        ) : members && members.length === 0 ? (
          <p className="text-xs text-muted-foreground italic mt-1">
            No members yet
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic mt-1">
            No one available
          </p>
        )}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Members</h2>
        </div>
        <AddMemberForm teamId={teamId as Id<"teams">} />
        <MemberList teamId={teamId as Id<"teams">} />
      </div>
    </div>
  );
}
