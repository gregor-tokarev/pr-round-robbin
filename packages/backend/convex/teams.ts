import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("teams").collect();
  },
});

export const getById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teams", { name: args.name });
  },
});

export const remove = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .withIndex("by_team", (q) => q.eq("teamId", args.id))
      .collect();

    for (const member of members) {
      const vacations = await ctx.db
        .query("vacations")
        .withIndex("by_member", (q) => q.eq("memberId", member._id))
        .collect();
      for (const vacation of vacations) {
        await ctx.db.delete(vacation._id);
      }
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.id);
  },
});
