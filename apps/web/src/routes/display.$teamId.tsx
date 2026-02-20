import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type { Id } from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clearSelectedTeamId } from "@/lib/use-selected-team";

export const Route = createFileRoute("/display/$teamId")({
  component: DisplayPage,
});

function DisplayPage() {
  const { teamId } = Route.useParams();
  const navigate = useNavigate();
  const data = useQuery(api.rotationQueue.getQueue, {
    teamId: teamId as Id<"teams">,
  });
  const team = useQuery(api.teams.getById, {
    id: teamId as Id<"teams">,
  });

  const handleBack = () => {
    clearSelectedTeamId();
    navigate({ to: "/" });
  };

  // Loading state
  if (data === undefined) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-20 w-96 mb-12" />
        <Skeleton className="h-6 w-64" />
      </div>
    );
  }

  // Team not found
  if (data === null) {
    clearSelectedTeamId();
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Team not found.</p>
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft data-icon="inline-start" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft data-icon="inline-start" />
          Back to Dashboard
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Team name */}
        {team && (
          <p className="text-2xl uppercase tracking-widest text-muted-foreground mb-6">
            {team.name}
          </p>
        )}

        {/* Current on-call — hero */}
        {data.currentOnCall ? (
          <h1 className="text-6xl sm:text-8xl font-bold text-center mb-12">
            {data.currentOnCall.name}
          </h1>
        ) : (
          <h1 className="text-4xl sm:text-6xl font-bold text-center text-muted-foreground mb-12">
            No one on call
          </h1>
        )}

        {/* Rotation queue */}
        {data.queue.length > 0 && (
          <div className="w-full max-w-md">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center">
              Up Next
            </h2>
            <ol className="space-y-1">
              {data.queue.map((member, i) => (
                <li
                  key={member._id}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-6 text-right tabular-nums">{i + 1}.</span>
                  <span>{member.name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
