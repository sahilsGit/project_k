// import { relations } from "drizzle-orm";
// import {
//   pgTable,
//   varchar,
//   integer,
//   serial,
//   text,
//   timestamp,
//   uuid,
//   boolean,
//   primaryKey,
//   unique,
// } from "drizzle-orm/pg-core";

// // Enum for message types
// const messageTypeEnum = [
//   "root_question",     // Initial question that starts the conversation
//   "user_question",     // Follow-up questions from user
//   "llm_response",      // AI responses
//   "suggested_question", // AI generated follow-up questions
//   "selected_suggestion" // Track if this was an AI suggestion that user selected
// ] as const;

// // Users Table
// const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   name: varchar("name", { length: 100 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Conversations Table
// const conversations = pgTable("conversations", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   userId: integer("user_id")
//     .references(() => users.id, { onDelete: "cascade" })
//     .notNull(),
//   title: varchar("title", { length: 255 }),
//   rootNodeId: uuid("root_node_id"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });

// // Conversation Nodes Table
// const conversationNodes = pgTable("conversation_nodes", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   conversationId: integer("conversation_id")
//     .references(() => conversations.id, { onDelete: "cascade" })
//     .notNull(),
  
//   content: text("content").notNull(),
//   type: varchar("type", { 
//     length: 50, 
//     enum: messageTypeEnum 
//   }).notNull(),
  
//   // Metadata
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   isSelected: boolean("is_selected").default(false),
  
//   // Optional additional context
//   context: text("context"),
//   metadata: text("metadata"),

//   // Add these fields
//   suggestionsGenerated: boolean("suggestions_generated").default(false),
//   responseGenerationTime: integer("response_generation_time"),
//   embeddingVector: text("embedding_vector"), // For semantic search
  
//   // Optional fields for tracking engagement
//   viewCount: integer("view_count").default(0),
//   userRating: integer("user_rating"), // Optional rating of response quality
// });

// // Node Children (Junction Table)
// const nodeChildren = pgTable("node_children", {
//   parentNodeId: uuid("parent_node_id")
//     .references(() => conversationNodes.id, { onDelete: "cascade" })
//     .notNull(),
//   childNodeId: uuid("child_node_id")
//     .references(() => conversationNodes.id, { onDelete: "cascade" })
//     .notNull(),
  
//   // Ordering within siblings
//   orderIndex: integer("order_index").notNull(),
// }, (table) => ([
//   unique().on(table.parentNodeId, table.childNodeId),
//   primaryKey({ columns: [table.parentNodeId, table.childNodeId] }),
// ]));

// // Saved Topics Table
// const savedTopics = pgTable("saved_topics", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id")
//     .references(() => users.id, { onDelete: "cascade" })
//     .notNull(),
//   topic: varchar("topic", { length: 255 }).notNull(),
//   conversationId: integer("conversation_id")
//     .references(() => conversations.id, { onDelete: "set null" }),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Tags Table
// const tags = pgTable("tags", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 50 }).notNull().unique(),
// });

// // Conversation Tags (Junction Table)
// const conversationTags = pgTable("conversation_tags", {
//   conversationId: integer("conversation_id")
//     .references(() => conversations.id, { onDelete: "cascade" })
//     .notNull(),
//   tagId: integer("tag_id")
//     .references(() => tags.id, { onDelete: "cascade" })
//     .notNull(),
// }, (table) => ([
//   primaryKey({ columns: [table.conversationId, table.tagId] }),
// ]));

// // New table for managing suggested questions
// const suggestedQuestions = pgTable("suggested_questions", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   nodeId: uuid("node_id")
//     .references(() => conversationNodes.id, { onDelete: "cascade" })
//     .notNull(),
//   suggestedContent: text("suggested_content").notNull(),
//   wasSelected: boolean("was_selected").default(false),
//   suggestedOrder: integer("suggested_order").notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Relation Definitions
// const usersRelations = relations(users, ({ many }) => ({
//   conversations: many(conversations),
//   savedTopics: many(savedTopics),
// }));

// const conversationsRelations = relations(conversations, ({ one, many }) => ({
//   user: one(users, {
//     fields: [conversations.userId],
//     references: [users.id],
//   }),
//   nodes: many(conversationNodes),
//   savedTopics: many(savedTopics),
//   conversationTags: many(conversationTags),
// }));

// const conversationNodesRelations = relations(conversationNodes, ({ one, many }) => ({
//   conversation: one(conversations, {
//     fields: [conversationNodes.conversationId],
//     references: [conversations.id],
//   }),
//   parentRelations: many(nodeChildren, {
//     relationName: "child_nodes",
//   }),
//   childRelations: many(nodeChildren, {
//     relationName: "parent_nodes",
//   }),
//   suggestedQuestions: many(suggestedQuestions),
// }));

// const nodeChildrenRelations = relations(nodeChildren, ({ one }) => ({
//   parentNode: one(conversationNodes, {
//     fields: [nodeChildren.parentNodeId],
//     references: [conversationNodes.id],
//     relationName: "child_nodes",
//   }),
//   childNode: one(conversationNodes, {
//     fields: [nodeChildren.childNodeId],
//     references: [conversationNodes.id],
//     relationName: "parent_nodes",
//   }),
// }));

// const savedTopicsRelations = relations(savedTopics, ({ one }) => ({
//   user: one(users, {
//     fields: [savedTopics.userId],
//     references: [users.id],
//   }),
//   conversation: one(conversations, {
//     fields: [savedTopics.conversationId],
//     references: [conversations.id],
//   }),
// }));

// const conversationTagsRelations = relations(conversationTags, ({ one }) => ({
//   conversation: one(conversations, {
//     fields: [conversationTags.conversationId],
//     references: [conversations.id],
//   }),
//   tag: one(tags, {
//     fields: [conversationTags.tagId],
//     references: [tags.id],
//   }),
// }));

// const suggestedQuestionsRelations = relations(suggestedQuestions, ({ one }) => ({
//   parentNode: one(conversationNodes, {
//     fields: [suggestedQuestions.nodeId],
//     references: [conversationNodes.id],
//   }),
// }));

// // Type Exports
// type User = typeof users.$inferSelect;
// type NewUser = typeof users.$inferInsert;
// type Conversation = typeof conversations.$inferSelect;
// type NewConversation = typeof conversations.$inferInsert;
// type ConversationNode = typeof conversationNodes.$inferSelect;
// type NewConversationNode = typeof conversationNodes.$inferInsert;
// type NodeChild = typeof nodeChildren.$inferSelect;
// type NewNodeChild = typeof nodeChildren.$inferInsert;
// type SavedTopic = typeof savedTopics.$inferSelect;
// type NewSavedTopic = typeof savedTopics.$inferInsert;
// type Tag = typeof tags.$inferSelect;
// type NewTag = typeof tags.$inferInsert;
// type SuggestedQuestion = typeof suggestedQuestions.$inferSelect;
// type NewSuggestedQuestion = typeof suggestedQuestions.$inferInsert;

// export {
//   users,
//   conversations,
//   conversationNodes,
//   nodeChildren,
//   savedTopics,
//   tags,
//   conversationTags,
//   suggestedQuestions,
//   usersRelations,
//   conversationsRelations,
//   conversationNodesRelations,
//   nodeChildrenRelations,
//   savedTopicsRelations,
//   conversationTagsRelations,
//   suggestedQuestionsRelations,
// };

// export type {
//   User,
//   NewUser,
//   Conversation,
//   NewConversation,
//   ConversationNode,
//   NewConversationNode,
//   NodeChild,
//   NewNodeChild,
//   SavedTopic,
//   NewSavedTopic,
//   Tag,
//   NewTag,
//   SuggestedQuestion,
//   NewSuggestedQuestion,
// };