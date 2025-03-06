import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
// import { faker } from "@faker-js/faker";

async function seedData() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db: PostgresJsDatabase<typeof schema> = drizzle(client);

  // try {
  //   // Seed users
  //   let userId;
  //   for (let index = 0; index < 5; index++) {
  //     const user = await db
  //       .insert(schema.users)
  //       .values({
  //         name: faker.person.fullName(),
  //         username: faker.person.fullName(),
  //       })
  //       .returning();

  //     userId = user[0].id;

  //     // Seed preference
  //     await db.insert(schema.preferences).values({
  //       user: userId,
  //       bufferBefore: 10 + index,
  //       bufferAfter: 10 + index,
  //       maxMeetingsPerDay: index + 2,
  //     });

  //     // Seed availabilities for each user
  //     for (let index = 0; index < 2; index++) {
  //       await db.insert(schema.availabilities).values({
  //         dayOfWeek: null,
  //         startTime: `0${index}:05:06 PST`,
  //         endTime: `0${index + 1}:05:06 PST`,
  //         user: userId,
  //         date: new Date(),
  //       });
  //     }
  //   }

  //   // Seed meetings
  //   let currentDate = new Date();
  //   const participants: any = [2];

  //   for (let index = 0; index < 5; index++) {
  //     if (index === 1) {
  //       continue;
  //     }

  //     const participant = [participants[0], index + 1];

  //     const meeting = await db
  //       .insert(schema.meetings)
  //       .values({
  //         organizerId: index + 1,
  //         startTime: `0${index}:05:06 PST`,
  //         endTime: `0${index}:15:06 PST`,
  //         date: new Date(currentDate.getTime() + index * 24 * 60 * 60 * 1000),
  //       })
  //       .returning({ meetingId: schema.meetings.id });

  //     // Insert into junction table for each user
  //     const promises = participant.map((participant: any) =>
  //       db.insert(schema.usersToMeetings).values({
  //         userId: participant,
  //         meetingId: meeting[0].meetingId,
  //       })
  //     );

  //     await Promise.all(promises);

  //     participants.pop;
  //   }

  //   console.log("Seed data inserted successfully!");
  // } catch (err) {
  //   console.error("Error seeding data:", err);
  // }
}

seedData();


// import { relations } from "drizzle-orm";
// import {
//   pgTable,
//   varchar,
//   integer,
//   serial,
//   text,
//   timestamp,
//   boolean,
//   primaryKey,
// } from "drizzle-orm/pg-core";

// // Users table
// const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 60 }).notNull(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Conversations table (represents a full chat history)
// const conversations = pgTable("conversations", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id")
//     .references(() => users.id, { onDelete: "cascade" })
//     .notNull(),
//   title: varchar("title", { length: 255 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });

// // Messages table (all types of messages in the conversation)
// const messages = pgTable("messages", {
//   id: serial("id").primaryKey(),
//   conversationId: integer("conversation_id")
//     .references(() => conversations.id, { onDelete: "cascade" })
//     .notNull(),
//   type: varchar("type", { length: 20 }).notNull(), // 'user_question', 'llm_response', 'suggested_question'
//   content: text("content").notNull(),
//   parentId: integer("parent_id"), // Will be set up as a self-reference in relations
//   selected: boolean("selected").default(false), // If this is a suggested question that was selected
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   displayOrder: integer("display_order").notNull(), // Order in the conversation flow
// });

// // Suggested Question Groups table (to group the 3 suggested questions that belong to a response)
// const suggestedQuestionGroups = pgTable("suggested_question_groups", {
//   id: serial("id").primaryKey(),
//   responseId: integer("response_id")
//     .references(() => messages.id, { onDelete: "cascade" })
//     .notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Tags for conversations (for categorization and search)
// const tags = pgTable("tags", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 50 }).notNull().unique(),
// });

// // Junction table for many-to-many relationship between conversations and tags
// const conversationsToTags = pgTable(
//   "conversations_to_tags",
//   {
//     conversationId: integer("conversation_id")
//       .notNull()
//       .references(() => conversations.id, { onDelete: "cascade" }),
//     tagId: integer("tag_id")
//       .notNull()
//       .references(() => tags.id, { onDelete: "cascade" }),
//   },
//   (table) => [
//     primaryKey({ columns: [table.conversationId, table.tagId] }),
//   ]
// );

// // User saved searches/topics of interest
// const savedTopics = pgTable("saved_topics", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id")
//     .references(() => users.id, { onDelete: "cascade" })
//     .notNull(),
//   topic: varchar("topic", { length: 255 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // RELATIONS SECTION - Defined after all tables to avoid circular references

// // User relations
// const usersRelations = relations(users, ({ many }) => ({
//   conversations: many(conversations),
//   savedTopics: many(savedTopics),
// }));

// // Conversation relations
// const conversationsRelations = relations(conversations, ({ one, many }) => ({
//   user: one(users, {
//     fields: [conversations.userId],
//     references: [users.id],
//   }),
//   messages: many(messages),
//   conversationTags: many(conversationsToTags),
// }));

// // Message relations - now with proper self-referencing
// const messagesRelations = relations(messages, ({ one, many }) => ({
//   conversation: one(conversations, {
//     fields: [messages.conversationId],
//     references: [conversations.id],
//   }),
//   // Self-reference for parent-child relationship
//   parent: one(messages, {
//     fields: [messages.parentId],
//     references: [messages.id],
//     relationName: "parent_child",
//   }),
//   children: many(messages, {
//     relationName: "parent_child",
//   }),
//   // Relationship with suggested question groups
//   suggestedQuestionGroup: many(suggestedQuestionGroups),
// }));

// // Suggested Question Groups relations
// const suggestedQuestionGroupsRelations = relations(suggestedQuestionGroups, ({ one }) => ({
//   response: one(messages, {
//     fields: [suggestedQuestionGroups.responseId],
//     references: [messages.id],
//   }),
// }));

// // Tags relations
// const tagsRelations = relations(tags, ({ many }) => ({
//   conversationTags: many(conversationsToTags),
// }));

// // Junction table relations
// const conversationsToTagsRelations = relations(conversationsToTags, ({ one }) => ({
//   conversation: one(conversations, {
//     fields: [conversationsToTags.conversationId],
//     references: [conversations.id],
//   }),
//   tag: one(tags, {
//     fields: [conversationsToTags.tagId],
//     references: [tags.id],
//   }),
// }));

// // Saved topics relations
// const savedTopicsRelations = relations(savedTopics, ({ one }) => ({
//   user: one(users, {
//     fields: [savedTopics.userId],
//     references: [users.id],
//   }),
// }));

// // Types
// type User = typeof users.$inferSelect;
// type NewUser = typeof users.$inferInsert;
// type Conversation = typeof conversations.$inferSelect;
// type NewConversation = typeof conversations.$inferInsert;
// type Message = typeof messages.$inferSelect;
// type NewMessage = typeof messages.$inferInsert;
// type SuggestedQuestionGroup = typeof suggestedQuestionGroups.$inferSelect;
// type NewSuggestedQuestionGroup = typeof suggestedQuestionGroups.$inferInsert;
// type Tag = typeof tags.$inferSelect;
// type NewTag = typeof tags.$inferInsert;
// type SavedTopic = typeof savedTopics.$inferSelect;
// type NewSavedTopic = typeof savedTopics.$inferInsert;

// export {
//   users,
//   conversations,
//   messages,
//   suggestedQuestionGroups,
//   tags,
//   conversationsToTags,
//   savedTopics,
//   usersRelations,
//   conversationsRelations,
//   messagesRelations,
//   suggestedQuestionGroupsRelations,
//   tagsRelations,
//   conversationsToTagsRelations,
//   savedTopicsRelations,
// };

// export type {
//   User,
//   NewUser,
//   Conversation,
//   NewConversation,
//   Message,
//   NewMessage,
//   SuggestedQuestionGroup,
//   NewSuggestedQuestionGroup,
//   Tag,
//   NewTag,
//   SavedTopic,
//   NewSavedTopic,
// };
