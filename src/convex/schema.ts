import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
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
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      online: v.optional(v.boolean()),
      lastSeen: v.optional(v.number()),
    })
      .index("email", ["email"])
      .index("by_online", ["online"]),

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
