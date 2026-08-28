import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: { receiverId: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.content.trim()) throw new Error("Message cannot be empty");

    const messageId = await ctx.db.insert("messages", {
      senderId: userId as string,
      receiverId: args.receiverId,
      content: args.content.trim(),
      type: "text",
      timestamp: Date.now(),
    });

    return messageId;
  },
});

export const getConversation = query({
  args: { otherUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const uid = userId as string;

    // Get messages sent from current user to other user
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) =>
        q.eq("senderId", uid).eq("receiverId", args.otherUserId)
      )
      .collect();

    // Get messages sent from other user to current user
    const received = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) =>
        q.eq("receiverId", uid).eq("senderId", args.otherUserId)
      )
      .collect();

    // Combine and sort by timestamp
    const all = [...sent, ...received].sort((a, b) => a.timestamp - b.timestamp);

    return all;
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const uid = userId as string;

    // Get all messages involving the current user
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", uid))
      .collect();

    const received = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", uid))
      .collect();

    const all = [...sent, ...received];

    // Group by conversation partner and get the latest message
    const convMap = new Map<
      string,
      { lastMessage: string; lastTimestamp: number; type: string; unread: number }
    >();

    for (const msg of all) {
      const partnerId =
        msg.senderId === uid ? msg.receiverId : msg.senderId;
      const existing = convMap.get(partnerId);

      if (!existing || msg.timestamp > existing.lastTimestamp) {
        convMap.set(partnerId, {
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp,
          type: msg.type,
          unread: 0,
        });
      }

      // Count unread messages from this partner
      if (msg.senderId !== uid && msg.type === "text") {
        const entry = convMap.get(partnerId)!;
        entry.unread++;
      }
    }

    // Convert to array and sort by last message time
    const conversations = Array.from(convMap.entries()).map(
      ([partnerId, data]) => ({
        partnerId,
        ...data,
      })
    );

    conversations.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

    return conversations;
  },
});
