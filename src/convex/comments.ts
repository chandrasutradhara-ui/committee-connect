import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const add = mutation({
  args: { itemId: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.content.trim()) throw new Error("Comment cannot be empty");

    const doc = await ctx.db.get(args.itemId as any);
    if (!doc) throw new Error("Item not found");

    return await ctx.db.insert("comments", {
      itemId: args.itemId,
      authorId: userId as string,
      content: args.content.trim(),
      createdAt: Date.now(),
    });
  },
});

export const getByItem = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .order("asc")
      .collect();

    const results = [];
    for (const comment of comments) {
      const authorDoc = await ctx.db.get(comment.authorId as any);
      const author = authorDoc as Doc<"users"> | null;
      results.push({
        ...comment,
        authorName: author?.name || "Anonymous",
        authorImage: author?.image,
      });
    }
    return results;
  },
});

export const remove = mutation({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.commentId as any);
    if (!doc) throw new Error("Comment not found");
    const comment = doc as Doc<"comments">;
    if (comment.authorId !== (userId as string)) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.commentId as any);
  },
});
