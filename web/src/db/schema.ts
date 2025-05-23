import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  integer,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// Enum for message types
const messageTypeEnum = [
  "root_query",
  "user_query",
  "suggested_query",
] as const;

/**
 * DO NOT EXPORT
 *
 */
type PrivateNonEmptyString = string & { __nonEmptyStringBrand: unknown };

export function toNonEmptyString(value: string): PrivateNonEmptyString {
  if (!value || value.trim() === "") {
    throw new Error("String cannot be empty");
  }
  return value as PrivateNonEmptyString;
}

const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
}));

const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  rootNodeId: uuid("root_node_id"),
  isInitialized: boolean("is_initialized").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  rootNode: one(conversationNodes, {
    fields: [conversations.rootNodeId],
    references: [conversationNodes.id],
  }),
  nodes: many(conversationNodes),
}));

const conversationNodes = pgTable("conversation_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  parentNodeId: uuid("parent_node_id"),
  query: varchar("query", { length: 255 }).$type<PrivateNonEmptyString>(),
  summary: varchar("summary", { length: 255 }),
  contentId: uuid("content_id"),
  type: varchar("type", {
    length: 50,
    enum: messageTypeEnum,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  responseGenerationTime: integer("response_generation_time"),
  isUserQuery: boolean("is_user_query").default(false),
  flaggedByAi: boolean("flagged_by_ai").default(false),
  flaggedByUser: boolean("flagged_by_user").default(false),
});

const conversationContents = pgTable("conversation_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  nodeId: uuid("node_id")
    .references(() => conversationNodes.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const conversationNodesRelations = relations(
  conversationNodes,
  ({ one, many }) => ({
    conversation: one(conversations, {
      fields: [conversationNodes.conversationId],
      references: [conversations.id],
    }),
    parent: one(conversationNodes, {
      fields: [conversationNodes.id],
      references: [conversationNodes.id],
      relationName: "parentChild",
    }),
    children: many(conversationNodes, {
      relationName: "parentChild",
    }),
    rootFor: one(conversations, {
      fields: [conversationNodes.id],
      references: [conversations.rootNodeId],
    }),
    content: one(conversationContents, {
      fields: [conversationNodes.id],
      references: [conversationContents.nodeId],
    }),
  })
);

const conversationContentRelations = relations(
  conversationContents,
  ({ one, many }) => ({
    node: one(conversationNodes, {
      fields: [conversationContents.nodeId],
      references: [conversationNodes.id],
    }),
    references: many(references),
  })
);

const references = pgTable("references", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentId: uuid("content_id")
    .references(() => conversationContents.id, { onDelete: "cascade" })
    .notNull(),
  source: text("source").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: varchar("title", { length: 255 }).notNull(),
  relevanceScore: integer("relevance_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const referencesRelations = relations(references, ({ one }) => ({
  content: one(conversationContents, {
    fields: [references.contentId],
    references: [conversationContents.id],
  }),
}));

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type Conversation = typeof conversations.$inferSelect;
type NewConversation = typeof conversations.$inferInsert;
type ConversationNode = typeof conversationNodes.$inferSelect;
type NewConversationNode = typeof conversationNodes.$inferInsert;
type ConversationContent = typeof conversationContents.$inferSelect;
type NewConversationContent = typeof conversationContents.$inferInsert;
type Reference = typeof references.$inferSelect;
type NewReference = typeof references.$inferInsert;

export {
  users,
  conversations,
  conversationNodes,
  usersRelations,
  conversationsRelations,
  conversationNodesRelations,
  references,
  referencesRelations,
  conversationContents,
  conversationContentRelations,
};

export type {
  User,
  NewUser,
  Conversation,
  NewConversation,
  ConversationNode,
  NewConversationNode,
  Reference,
  NewReference,
  ConversationContent,
  NewConversationContent,
};
