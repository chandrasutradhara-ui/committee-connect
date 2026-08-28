import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const initiate = mutation({
  args: { calleeId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const callerId = userId as string;
    if (callerId === args.calleeId) {
      throw new Error("Cannot call yourself");
    }

    // Check if caller already has an active call
    const existingCalls = await ctx.db
      .query("calls")
      .withIndex("by_caller", (q) => q.eq("callerId", callerId))
      .filter((q) => q.neq(q.field("status"), "ended"))
      .collect();

    if (existingCalls.length > 0) {
      throw new Error("You already have an active call");
    }

    const callId = await ctx.db.insert("calls", {
      callerId,
      calleeId: args.calleeId,
      status: "offering",
      callerCandidates: [],
      calleeCandidates: [],
      startedAt: Date.now(),
    });

    await ctx.db.insert("messages", {
      senderId: callerId,
      receiverId: args.calleeId,
      content: "Video call started",
      type: "call_initiated",
      callId,
      timestamp: Date.now(),
    });

    return callId;
  },
});

export const answer = mutation({
  args: { callId: v.string(), sdp: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.callId as any);
    if (!doc) throw new Error("Call not found");
    const call = doc as Doc<"calls">;
    if (call.calleeId !== (userId as string)) {
      throw new Error("Not authorized to answer this call");
    }
    if (call.status !== "offering") {
      throw new Error("Call is not in offering status");
    }

    await ctx.db.patch(args.callId as any, {
      calleeSDP: args.sdp,
      status: "connected",
    });
  },
});

export const end = mutation({
  args: { callId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.callId as any);
    if (!doc) throw new Error("Call not found");
    const call = doc as Doc<"calls">;

    if (call.callerId !== (userId as string) && call.calleeId !== (userId as string)) {
      throw new Error("Not authorized to end this call");
    }

    await ctx.db.patch(args.callId as any, {
      status: "ended",
      endedAt: Date.now(),
    });

    const otherUserId =
      call.callerId === (userId as string) ? call.calleeId : call.callerId;
    await ctx.db.insert("messages", {
      senderId: userId as string,
      receiverId: otherUserId,
      content: "Video call ended",
      type: "call_ended",
      callId: args.callId,
      timestamp: Date.now(),
    });
  },
});

export const getActiveCall = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const callerCalls = await ctx.db
      .query("calls")
      .withIndex("by_caller", (q) => q.eq("callerId", userId as string))
      .filter((q) => q.neq(q.field("status"), "ended"))
      .collect();

    if (callerCalls.length > 0) return callerCalls[0];

    const calleeCalls = await ctx.db
      .query("calls")
      .withIndex("by_callee", (q) => q.eq("calleeId", userId as string))
      .filter((q) => q.neq(q.field("status"), "ended"))
      .collect();

    return calleeCalls.length > 0 ? calleeCalls[0] : null;
  },
});

export const getIncomingOffer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_callee", (q) => q.eq("calleeId", userId as string))
      .filter((q) => q.eq(q.field("status"), "offering"))
      .collect();

    return calls.length > 0 ? calls[0] : null;
  },
});

export const getOutgoingOffer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_caller", (q) => q.eq("callerId", userId as string))
      .filter((q) => q.eq(q.field("status"), "offering"))
      .collect();

    return calls.length > 0 ? calls[0] : null;
  },
});
