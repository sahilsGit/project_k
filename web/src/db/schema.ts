import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  integer,
  serial,
  text,
  timestamp,
  uuid,
  boolean,
  primaryKey,
  unique,
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
  if (!value || value.trim() === '') {
    throw new Error('String cannot be empty');
  }
  return value as PrivateNonEmptyString;
}

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  rootNodeId: uuid("root_node_id"), 
  isInitialized: boolean("is_initialized").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

const conversationNodes = pgTable("conversation_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
  query: text("query").notNull().$type<PrivateNonEmptyString>(),
  content: text("content"),
  type: varchar("type", { 
    length: 50, 
    enum: messageTypeEnum 
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  responseGenerationTime: integer("response_generation_time"),
  isUserQuery: boolean("is_user_query").default(false),
  flaggedByAi: boolean("flagged_by_ai").default(false),
  flaggedByUser: boolean("flagged_by_user").default(false),
})

// junction table
const nodeChildren = pgTable("node_children", {
  parentNodeId: uuid("parent_node_id")
    .references(() => conversationNodes.id, { onDelete: "cascade" })
    .notNull(),
  childNodeId: uuid("child_node_id")
    .references(() => conversationNodes.id, { onDelete: "cascade" })
    .notNull(),
  orderIndex: integer("order_index").notNull(),
}, (table) => ([
  unique().on(table.parentNodeId, table.childNodeId),
  primaryKey({ columns: [table.parentNodeId, table.childNodeId] }),
]))

const references = pgTable("references", {
  id: uuid("id").primaryKey().defaultRandom(),
  nodeId: uuid("node_id")
    .references(() => conversationNodes.id, { onDelete: "cascade" })
    .notNull(),
  source: text("source").notNull(), // Source of the reference (e.g., URL, book, etc.)
  title: varchar("title", { length: 255 }), // Title of the reference
  content: text("content"), // Content snippet from the reference
  relevanceScore: integer("relevance_score"), // Optional score for how relevant this reference is
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relation Definitions
const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
}));

const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  nodes: many(conversationNodes),
}));

const conversationNodesRelations = relations(conversationNodes, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [conversationNodes.conversationId],
    references: [conversations.id],
  }),
  parent: one(nodeChildren, {
    fields: [conversationNodes.id],
    references: [nodeChildren.childNodeId]
  }),
  children: many(nodeChildren),
  references: many(references),
}));

const nodeChildrenRelations = relations(nodeChildren, ({ one }) => ({
  parent: one(conversationNodes, {
    fields: [nodeChildren.parentNodeId],
    references: [conversationNodes.id],
  }),
  child: one(conversationNodes, {
    fields: [nodeChildren.childNodeId],
    references: [conversationNodes.id],
  }),
}));

const referencesRelations = relations(references, ({ one }) => ({
  node: one(conversationNodes, {
    fields: [references.nodeId],
    references: [conversationNodes.id],
  }),
}));

// Type Exports
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type Conversation = typeof conversations.$inferSelect;
type NewConversation = typeof conversations.$inferInsert;
type ConversationNode = typeof conversationNodes.$inferSelect;
type NewConversationNode = typeof conversationNodes.$inferInsert;
type NodeChild = typeof nodeChildren.$inferSelect;
type NewNodeChild = typeof nodeChildren.$inferInsert;
type Reference = typeof references.$inferSelect
type NewReference = typeof references.$inferInsert

export {
  users,
  conversations,
  conversationNodes,
  nodeChildren,
  usersRelations,
  conversationsRelations,
  conversationNodesRelations,
  nodeChildrenRelations,
  references,
  referencesRelations
};

export type {
  User,
  NewUser,
  Conversation,
  NewConversation,
  ConversationNode,
  NewConversationNode,
  NodeChild,
  NewNodeChild,
  Reference,
  NewReference
};