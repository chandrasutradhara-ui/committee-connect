import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("items", {
      ownerId: userId as string,
      title: args.title,
      description: args.description,
      category: args.category,
      price: args.price,
      imageUrl: args.imageUrl,
      tags: args.tags,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    itemId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.itemId as any);
    if (!doc) throw new Error("Item not found");
    const item = doc as Doc<"items">;
    if (item.ownerId !== (userId as string)) {
      throw new Error("Not authorized");
    }

    const { itemId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(args.itemId as any, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.itemId as any);
    if (!doc) throw new Error("Item not found");
    const item = doc as Doc<"items">;
    if (item.ownerId !== (userId as string)) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.itemId as any, { status: "archived" });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    const results = [];
    for (const item of items) {
      const ownerDoc = await ctx.db.get(item.ownerId as any);
      const owner = ownerDoc as Doc<"users"> | null;
      results.push({
        ...item,
        ownerName: owner?.name || "Anonymous",
      });
    }
    return results;
  },
});

export const getById = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.itemId as any);
    if (!doc) return null;
    const item = doc as Doc<"items">;

    const ownerDoc = await ctx.db.get(item.ownerId as any);
    const owner = ownerDoc as Doc<"users"> | null;
    return {
      ...item,
      ownerName: owner?.name || "Anonymous",
      ownerImage: owner?.image,
    };
  },
});

export const getByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .collect();

    return items.filter((item) => item.status !== "archived");
  },
});

export const getMyItems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId as string))
      .order("desc")
      .collect();

    return items.filter((item) => item.status !== "archived");
  },
});

export const search = query({
  args: { searchTerm: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("items")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    if (args.category) {
      items = items.filter((item) => item.category === args.category);
    }

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    const results = [];
    for (const item of items) {
      const ownerDoc = await ctx.db.get(item.ownerId as any);
      const owner = ownerDoc as Doc<"users"> | null;
      results.push({
        ...item,
        ownerName: owner?.name || "Anonymous",
      });
    }
    return results;
  },
});

export const getAllAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userDoc = await ctx.db.get(userId);
    const user = userDoc as Doc<"users">;
    if (user?.role !== "admin") return [];

    const items = await ctx.db.query("items").order("desc").collect();
    const results = [];
    for (const item of items) {
      const ownerDoc = await ctx.db.get(item.ownerId as any);
      const owner = ownerDoc as Doc<"users"> | null;
      results.push({
        ...item,
        ownerName: owner?.name || "Anonymous",
      });
    }
    return results;
  },
});
