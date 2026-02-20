import { api } from "@pr-round-robbin/backend/convex/_generated/api";
import type { Doc } from "@pr-round-robbin/backend/convex/_generated/dataModel";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Monitor, UserCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { selectTeamId } from "@/lib/use-selected-team";

export function TeamCard({ team }: { team: Doc<"teams"> }) {
  const onCallMember = useQuery(api.onCall.getForTeam, { teamId: team._id });
  const members = useQuery(api.members.listByTeam, { teamId: team._id });
  const navigate = useNavigate();

  return (
    <Link to="/teams/$teamId" params={{ teamId: team._id }}>
      <Card className="group transition-colors hover:bg-muted/50 cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              {team.name}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectTeamId(team._id);
                  navigate({
                    to: "/display/$teamId",
                    params: { teamId: team._id },
                  });
                }}
              >
                <Monitor />
              </Button>
              {members !== undefined && (
                <Badge variant="secondary">
                  {members.length}{" "}
                  {members.length === 1 ? "member" : "members"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <UserCircle className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">On call:</span>
            {onCallMember === undefined && members === undefined ? (
              <Skeleton className="h-4 w-24" />
            ) : onCallMember ? (
              <span className="text-xs font-medium">{onCallMember.name}</span>
            ) : members && members.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">
                No members yet
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                No one available
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
