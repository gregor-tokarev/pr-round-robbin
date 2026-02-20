import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { advanceTeamRotation } from "./onCall";

export const listByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vacations")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

export const add = mutation({
  args: {
    memberId: v.id("members"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const vacationId = await ctx.db.insert("vacations", {
      memberId: args.memberId,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    const member = await ctx.db.get(args.memberId);
    if (!member) return vacationId;

    const team = await ctx.db.get(member.teamId);
    if (!team) return vacationId;

    if (team.currentOnCallMemberId === args.memberId) {
      const today = new Date().toISOString().split("T")[0];
      if (args.startDate <= today && today <= args.endDate) {
        await advanceTeamRotation(ctx, member.teamId);
      }
    }

    return vacationId;
  },
});

export const remove = mutation({
  args: { id: v.id("vacations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
