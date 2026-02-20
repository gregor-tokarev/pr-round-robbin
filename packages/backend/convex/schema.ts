import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  teams: defineTable({
    name: v.string(),
    currentOnCallMemberId: v.optional(v.id("members")),
    lastRotationDate: v.optional(v.string()),
  }),

  members: defineTable({
    name: v.string(),
    teamId: v.id("teams"),
    order: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_order", ["teamId", "order"]),

  vacations: defineTable({
    memberId: v.id("members"),
    startDate: v.string(),
    endDate: v.string(),
  }).index("by_member", ["memberId"]),
});
