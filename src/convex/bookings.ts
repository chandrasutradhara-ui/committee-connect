import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const create = mutation({
  args: {
    itemId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.itemId as any);
    if (!doc) throw new Error("Item not found");
    const item = doc as Doc<"items">;

    if (item.ownerId === (userId as string)) {
      throw new Error("Cannot book your own item");
    }

    if (args.startTime >= args.endTime) {
      throw new Error("End time must be after start time");
    }

    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "cancelled"),
          q.lt(q.field("startTime"), args.endTime),
          q.gt(q.field("endTime"), args.startTime)
        )
      )
      .collect();

    if (existing.length > 0) {
      throw new Error("This time slot is already booked");
    }

    return await ctx.db.insert("bookings", {
      itemId: args.itemId,
      bookerId: userId as string,
      ownerId: item.ownerId,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "pending",
      paymentStatus: "unpaid",
      amount: item.price,
      createdAt: Date.now(),
    });
  },
});

export const confirm = mutation({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.bookingId as any);
    if (!doc) throw new Error("Booking not found");
    const booking = doc as Doc<"bookings">;
    if (booking.ownerId !== (userId as string)) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.bookingId as any, { status: "confirmed" });
  },
});

export const cancel = mutation({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.bookingId as any);
    if (!doc) throw new Error("Booking not found");
    const booking = doc as Doc<"bookings">;
    if (
      booking.ownerId !== (userId as string) &&
      booking.bookerId !== (userId as string)
    ) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.bookingId as any, { status: "cancelled" });
  },
});

export const markPaid = mutation({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.bookingId as any);
    if (!doc) throw new Error("Booking not found");
    const booking = doc as Doc<"bookings">;

    await ctx.db.patch(args.bookingId as any, {
      paymentStatus: "paid",
      status: booking.status === "pending" ? "confirmed" : booking.status,
    });
  },
});

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("bookings")
      .withIndex("by_booker", (q) => q.eq("bookerId", userId as string))
      .order("desc")
      .collect();
  },
});

export const getBookingsForMyItems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("bookings")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId as string))
      .order("desc")
      .collect();
  },
});

export const getBookingsForItem = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .order("asc")
      .collect();

    return bookings.filter((b) => b.status !== "cancelled");
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

    return await ctx.db.query("bookings").order("desc").collect();
  },
});
