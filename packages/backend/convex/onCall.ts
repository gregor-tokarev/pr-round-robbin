import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, query } from "./_generated/server";

async function isMemberOnVacation(
  ctx: { db: MutationCtx["db"] },
  memberId: Id<"members">,
  date: string,
) {
  const vacations = await ctx.db
    .query("vacations")
    .withIndex("by_member", (q) => q.eq("memberId", memberId))
    .collect();
  return vacations.some((v) => v.startDate <= date && date <= v.endDate);
}

export async function advanceTeamRotation(
  ctx: MutationCtx,
  teamId: Id<"teams">,
) {
  const team = await ctx.db.get(teamId);
  if (!team) return;

  const members = await ctx.db
    .query("members")
    .withIndex("by_team_and_order", (q) => q.eq("teamId", teamId))
    .collect();

  if (members.length === 0) {
    await ctx.db.patch(teamId, { currentOnCallMemberId: undefined });
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const currentIndex = members.findIndex(
    (m) => m._id === team.currentOnCallMemberId,
  );

  // Start searching from the next member after current
  const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;

  for (let i = 0; i < members.length; i++) {
    const candidate = members[(startIndex + i) % members.length];
    const onVacation = await isMemberOnVacation(ctx, candidate._id, today);
    if (!onVacation) {
      await ctx.db.patch(teamId, {
        currentOnCallMemberId: candidate._id,
        lastRotationDate: today,
      });
      return;
    }
  }

  // All members on vacation
  await ctx.db.patch(teamId, {
    currentOnCallMemberId: undefined,
    lastRotationDate: today,
  });
}

export const getForTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || !team.currentOnCallMemberId) return null;
    return await ctx.db.get(team.currentOnCallMemberId);
  },
});

export const advanceAllTeams = internalMutation({
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    for (const team of teams) {
      await advanceTeamRotation(ctx, team._id);
    }
  },
});
