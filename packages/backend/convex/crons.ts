import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "advance on-call rotation",
  "0 21 * * *", // 21:00 UTC = midnight Moscow (UTC+3)
  internal.onCall.advanceAllTeams,
);

export default crons;
