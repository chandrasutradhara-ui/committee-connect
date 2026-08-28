import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const sendOffer = mutation({
  args: { callId: v.string(), sdp: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.callId as any);
    if (!doc) throw new Error("Call not found");
    const call = doc as Doc<"calls">;
    if (call.callerId !== (userId as string)) {
      throw new Error("Only the caller can send an offer");
    }

    await ctx.db.patch(args.callId as any, { callerSDP: args.sdp });

    await ctx.db.insert("signals", {
      callId: args.callId,
      senderId: userId as string,
      type: "offer",
      data: args.sdp,
      timestamp: Date.now(),
    });
  },
});

export const sendAnswer = mutation({
  args: { callId: v.string(), sdp: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.callId as any);
    if (!doc) throw new Error("Call not found");
    const call = doc as Doc<"calls">;
    if (call.calleeId !== (userId as string)) {
      throw new Error("Only the callee can send an answer");
    }

    await ctx.db.patch(args.callId as any, { calleeSDP: args.sdp });

    await ctx.db.insert("signals", {
      callId: args.callId,
      senderId: userId as string,
      type: "answer",
      data: args.sdp,
      timestamp: Date.now(),
    });
  },
});

export const sendIceCandidate = mutation({
  args: { callId: v.string(), candidate: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.callId as any);
    if (!doc) throw new Error("Call not found");
    const call = doc as Doc<"calls">;

    if (call.callerId === (userId as string)) {
      await ctx.db.patch(args.callId as any, {
        callerCandidates: [...call.callerCandidates, args.candidate],
      });
    } else if (call.calleeId === (userId as string)) {
      await ctx.db.patch(args.callId as any, {
        calleeCandidates: [...call.calleeCandidates, args.candidate],
      });
    }

    await ctx.db.insert("signals", {
      callId: args.callId,
      senderId: userId as string,
      type: "ice",
      data: args.candidate,
      timestamp: Date.now(),
    });
  },
});

export const getSignalsForCall = query({
  args: { callId: v.string(), senderId: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_call", (q) =>
        q
          .eq("callId", args.callId)
          .eq("senderId", args.senderId)
          .eq("type", args.type as "offer" | "answer" | "ice")
      )
      .collect();

    return signals;
  },
});

export const getLatestAnswer = query({
  args: { callId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doc = await ctx.db.get(args.callId as any);
    if (!doc) return null;
    const call = doc as Doc<"calls">;

    if (call.callerId !== (userId as string)) return null;
    if (!call.calleeSDP) return null;

    return { sdp: call.calleeSDP };
  },
});

export const getIceCandidates = query({
  args: { callId: v.string(), fromUser: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.callId as any);
    if (!doc) return [];
    const call = doc as Doc<"calls">;

    if (args.fromUser === call.callerId) {
      return call.callerCandidates;
    } else if (args.fromUser === call.calleeId) {
      return call.calleeCandidates;
    }

    return [];
  },
});
