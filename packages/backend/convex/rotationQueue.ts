import { v } from "convex/values";

import { query } from "./_generated/server";
import { isMemberOnVacation } from "./onCall";

export const getQueue = query({
  args: {
    teamId: v.id("teams"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("by_team_and_order", (q) => q.eq("teamId", args.teamId))
      .collect();

    if (members.length === 0) return { currentOnCall: null, queue: [] };

    const today = new Date().toISOString().split("T")[0];

    // Find the current on-call member
    const currentOnCall = team.currentOnCallMemberId
      ? (await ctx.db.get(team.currentOnCallMemberId)) ?? null
      : null;

    // Build rotation queue starting from the member after current on-call
    const currentIndex = members.findIndex(
      (m) => m._id === team.currentOnCallMemberId,
    );
    const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;

    const queue: (typeof members)[number][] = [];
    for (let i = 0; i < members.length && queue.length < limit; i++) {
      const candidate = members[(startIndex + i) % members.length];
      // Skip the current on-call person
      if (candidate._id === team.currentOnCallMemberId) continue;
      const onVacation = await isMemberOnVacation(ctx, candidate._id, today);
      if (!onVacation) {
        queue.push(candidate);
      }
    }

    return { currentOnCall, queue };
  },
});
