import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { advanceTeamRotation } from "./onCall";

export const listByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
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
