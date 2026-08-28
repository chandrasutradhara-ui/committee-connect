import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const touchPresence = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);
    if (!user) return;

    // Only update if at least 10 seconds have passed to reduce writes
    if (user.lastSeen && Date.now() - user.lastSeen < 10000) {
      return;
    }

    await ctx.db.patch(userId, {
      online: true,
      lastSeen: Date.now(),
    });
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const thirtySecondsAgo = Date.now() - 30000;

    const allUsers = await ctx.db.query("users").collect();

    return allUsers
      .filter(
        (u) =>
          u._id !== userId &&
          u.online === true &&
          u.lastSeen !== undefined &&
          u.lastSeen > thirtySecondsAgo
      )
      .map((u) => ({
        _id: u._id,
        name: u.name || (u.isAnonymous ? "Anonymous User" : "User"),
        image: u.image,
        online: true,
        lastSeen: u.lastSeen,
      }));
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allUsers = await ctx.db.query("users").collect();

    return allUsers
      .filter((u) => u._id !== userId)
      .map((u) => ({
        _id: u._id,
        name: u.name || (u.isAnonymous ? "Anonymous User" : "User"),
        image: u.image,
        online: u.online === true,
        lastSeen: u.lastSeen,
      }));
  },
});
