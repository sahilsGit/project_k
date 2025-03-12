import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { 
  User, 
  NewUser, 
  Conversation, 
  NewConversation, 
  ConversationNode, 
  NewConversationNode, 
  NewReference,
  toNonEmptyString,
} from "./schema";

async function seedData() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db: PostgresJsDatabase<typeof schema> = drizzle(client);

  try {
    // Create sample users
    const users: User[] = await Promise.all(
      Array(3).fill(0).map(async () => {
        const userData: NewUser = {
          email: faker.internet.email(),
          name: faker.person.fullName(),
        };
        
        return (await db
          .insert(schema.users)
          .values(userData)
          .returning())[0];
      })
    );

    // Create conversations and nodes for each user
    for (const user of users) {
      // Create 2-3 conversations per user
      const conversationCount = faker.number.int({ min: 2, max: 3 });
      
      for (let i = 0; i < conversationCount; i++) {
        
        // Create conversation with the root node ID
        const conversationData: NewConversation = {
          userId: user.id,
          title: faker.lorem.sentence(),
        };

        const conversation: Conversation = (await db
          .insert(schema.conversations)
          .values(conversationData)
          .returning())[0];

        const rootNodeData: NewConversationNode = {
          conversationId: conversation.id,
          query: toNonEmptyString(faker.lorem.sentence()),
          content: faker.lorem.sentence(),
          type: "root_query",
          isUserQuery: true,
          flaggedByAi: false,
          flaggedByUser: false,
        };

        const rootNode: ConversationNode = (await db
          .insert(schema.conversationNodes)
          .values(rootNodeData)
          .returning())[0];
        
        // Update conversation with root node ID after creating the root node
        await db
          .update(schema.conversations)
          .set({ rootNodeId: rootNode.id, isInitialized: true })
          .where(eq(schema.conversations.id, conversation.id));
        
        // Update the root node with the correct conversation ID
        await db
          .update(schema.conversationNodes)
          .set({ conversationId: conversation.id })
          .where(eq(schema.conversationNodes.id, rootNode.id));
          
        // Create AI response to root query (could be with or without content)
        const isExplored = faker.datatype.boolean(0.8); // 80% chance of being explored
        
        const aiResponseData: NewConversationNode = {
          conversationId: conversation.id,
          query: toNonEmptyString(faker.lorem.sentence()),
          content: isExplored ? faker.lorem.paragraphs() : null,
          type: "user_query", // Using user_query for AI responses since there's no AI response type
          isUserQuery: false,
          responseGenerationTime: isExplored ? faker.number.int({ min: 1000, max: 5000 }) : null,
          flaggedByAi: faker.datatype.boolean(0.05),
          flaggedByUser: faker.datatype.boolean(0.05),
        };

        const aiResponse: ConversationNode = (await db
          .insert(schema.conversationNodes)
          .values(aiResponseData)
          .returning())[0];

        // Link AI response to root question
        await db
          .insert(schema.nodeChildren)
          .values({
            parentNodeId: rootNode.id,
            childNodeId: aiResponse.id,
            orderIndex: 0,
          });

        // Add references for all AI response nodes
        const referenceCount = faker.number.int({ min: 1, max: 5 });
        
        for (let r = 0; r < referenceCount; r++) {
          const referenceData: NewReference = {
            nodeId: aiResponse.id,
            source: faker.internet.url(),
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            relevanceScore: faker.number.int({ min: 50, max: 100 }),
          };
          
          await db
            .insert(schema.references)
            .values(referenceData);
        }

        // Only create follow-ups for explored nodes
        if (isExplored) {
          // Create suggested follow-up questions
          const suggestedQuestionCount = faker.number.int({ min: 2, max: 4 });
          
          for (let j = 0; j < suggestedQuestionCount; j++) {
            const suggestedContent = toNonEmptyString(faker.lorem.sentence() + "?")
            
            const suggestionNodeData: NewConversationNode = {
              conversationId: conversation.id,
              query: suggestedContent,
              content: suggestedContent,
              type: "suggested_query",
              isUserQuery: false,
            };
            
            const suggestionNode: ConversationNode = (await db
              .insert(schema.conversationNodes)
              .values(suggestionNodeData)
              .returning())[0];
              
            // Link suggestion to AI response
            await db
              .insert(schema.nodeChildren)
              .values({
                parentNodeId: aiResponse.id,
                childNodeId: suggestionNode.id,
                orderIndex: j,
              });
          }

          // Sometimes create a follow-up conversation path
          if (faker.datatype.boolean(0.7)) { // 70% chance
            const isSelectedSuggestion = faker.datatype.boolean(); // 50% chance it's a suggestion selection
            
            const followUpData: NewConversationNode = {
              conversationId: conversation.id,
              query: toNonEmptyString(faker.lorem.sentence() + "?"),
              content: faker.lorem.sentence() + "?",
              type: isSelectedSuggestion ? "suggested_query" : "user_query",
              isUserQuery: true,
            };
            
            const followUpQuestion: ConversationNode = (await db
              .insert(schema.conversationNodes)
              .values(followUpData)
              .returning())[0];

            // Link it to the AI response
            await db
              .insert(schema.nodeChildren)
              .values({
                parentNodeId: aiResponse.id,
                childNodeId: followUpQuestion.id,
                orderIndex: suggestedQuestionCount, // After the suggestions
              });
            
            // Decide if follow-up response is explored or unexplored
            const isFollowUpExplored = faker.datatype.boolean(0.8); // 80% chance
            
            // Create AI response to the follow-up
            const followUpResponseData: NewConversationNode = {
              conversationId: conversation.id,
              query: toNonEmptyString(faker.lorem.sentence() + "?"),
              content: isFollowUpExplored ? faker.lorem.paragraphs() : null,
              type: "user_query", // Using user_query for AI responses
              isUserQuery: false,
              responseGenerationTime: isFollowUpExplored ? faker.number.int({ min: 1000, max: 5000 }) : null,
            };
            
            const followUpResponse: ConversationNode = (await db
              .insert(schema.conversationNodes)
              .values(followUpResponseData)
              .returning())[0];
            
            // Link follow-up response to follow-up question
            await db
              .insert(schema.nodeChildren)
              .values({
                parentNodeId: followUpQuestion.id,
                childNodeId: followUpResponse.id,
                orderIndex: 0,
              });
            
            // Add references for the follow-up response
            const followUpRefCount = faker.number.int({ min: 1, max: 4 });
            
            for (let r = 0; r < followUpRefCount; r++) {
              const followUpRefData: NewReference = {
                nodeId: followUpResponse.id,
                source: faker.internet.url(),
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
                relevanceScore: faker.number.int({ min: 50, max: 100 }),
              };
              
              await db
                .insert(schema.references)
                .values(followUpRefData);
            }
          }
        }
      }
    }

    console.log("Seed data inserted successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    await client.end();
  }
}

// seedData();