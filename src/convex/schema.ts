import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      online: v.optional(v.boolean()),
      lastSeen: v.optional(v.number()),
    })
      .index("email", ["email"])
      .index("by_online", ["online"]),

    // Catalog items
    items: defineTable({
      ownerId: v.string(),
      title: v.string(),
      description: v.string(),
      category: v.string(),
      price: v.number(),
      imageUrl: v.optional(v.string()),
      tags: v.array(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("archived"),
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_owner", ["ownerId", "status"])
      .index("by_category", ["category", "status"])
      .index("by_status", ["status", "createdAt"]),

    // Bookings / scheduled sessions
    bookings: defineTable({
      itemId: v.string(),
      bookerId: v.string(),
      ownerId: v.string(),
      startTime: v.number(),
      endTime: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("completed"),
      ),
      paymentStatus: v.union(
        v.literal("unpaid"),
        v.literal("paid"),
        v.literal("refunded"),
      ),
      amount: v.number(),
      createdAt: v.number(),
    })
      .index("by_item", ["itemId", "status"])
      .index("by_booker", ["bookerId", "status"])
      .index("by_owner", ["ownerId", "status"]),

    // Comments on items
    comments: defineTable({
      itemId: v.string(),
      authorId: v.string(),
      content: v.string(),
      createdAt: v.number(),
    }).index("by_item", ["itemId", "createdAt"]),

    calls: defineTable({
      callerId: v.string(),
      calleeId: v.string(),
      status: v.union(
        v.literal("offering"),
        v.literal("connected"),
        v.literal("ended"),
      ),
      callerSDP: v.optional(v.string()),
      calleeSDP: v.optional(v.string()),
      callerCandidates: v.array(v.string()),
      calleeCandidates: v.array(v.string()),
      startedAt: v.number(),
      endedAt: v.optional(v.number()),
    })
      .index("by_caller", ["callerId", "status"])
      .index("by_callee", ["calleeId", "status"]),

    signals: defineTable({
      callId: v.string(),
      senderId: v.string(),
      type: v.union(v.literal("offer"), v.literal("answer"), v.literal("ice")),
      data: v.string(),
      timestamp: v.number(),
    }).index("by_call", ["callId", "senderId", "type"]),

    messages: defineTable({
      senderId: v.string(),
      receiverId: v.string(),
      content: v.string(),
      type: v.union(v.literal("text"), v.literal("call_initiated"), v.literal("call_ended")),
      callId: v.optional(v.string()),
      timestamp: v.number(),
    })
      .index("by_sender", ["senderId", "receiverId", "timestamp"])
      .index("by_receiver", ["receiverId", "senderId", "timestamp"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
