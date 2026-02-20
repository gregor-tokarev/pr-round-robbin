import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { CreateTeamDialog } from "@/components/create-team-dialog";
import { TeamCard } from "@/components/team-card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const teams = useQuery(api.teams.list);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Teams</h1>
        <CreateTeamDialog />
      </div>

      {teams === undefined ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No teams yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
