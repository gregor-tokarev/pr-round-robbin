import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { advanceTeamRotation, isMemberOnVacation } from "./onCall";

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_team_and_order", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const add = mutation({
  args: { teamId: v.id("teams"), name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("members")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), -1);

    const memberId = await ctx.db.insert("members", {
      name: args.name,
      teamId: args.teamId,
      order: maxOrder + 1,
    });

    if (existing.length === 0) {
      await ctx.db.patch(args.teamId, { currentOnCallMemberId: memberId });
    }

    return memberId;
  },
});

export const reorder = mutation({
  args: {
    teamId: v.id("teams"),
    memberIds: v.array(v.id("members")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.memberIds.length; i++) {
      await ctx.db.patch(args.memberIds[i], { order: i });
    }

    // Set the first non-vacationing member as on-call
    const today = new Date().toISOString().split("T")[0];
    for (const memberId of args.memberIds) {
      const onVacation = await isMemberOnVacation(ctx, memberId, today);
      if (!onVacation) {
        await ctx.db.patch(args.teamId, {
          currentOnCallMemberId: memberId,
          lastRotationDate: today,
        });
        return;
      }
    }

    // All on vacation
    await ctx.db.patch(args.teamId, {
      currentOnCallMemberId: undefined,
      lastRotationDate: today,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) return;

    const vacations = await ctx.db
      .query("vacations")
      .withIndex("by_member", (q) => q.eq("memberId", args.id))
      .collect();
    for (const vacation of vacations) {
      await ctx.db.delete(vacation._id);
    }

    const team = await ctx.db.get(member.teamId);
    const wasOnCall =
      team?.currentOnCallMemberId !== undefined &&
      team.currentOnCallMemberId === args.id;

    await ctx.db.delete(args.id);

    if (wasOnCall) {
      await advanceTeamRotation(ctx, member.teamId);
    }
  },
});
