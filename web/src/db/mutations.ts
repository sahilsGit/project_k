"use server";
import { db } from "@/db/index";
import {
  conversationNodes,
  conversations,
  NewConversation,
  NewConversationNode,
  NewUser,
  users,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const createUser = (user: NewUser) =>
  db.insert(users).values({
    name: user.name,
    email: user.email,
  });

export const createAndInitializeConversation = (
  conversation: NewConversation,
  rootNode: Omit<NewConversationNode, "conversationId">
) =>
  db.transaction(async (tx) => {
    const [createdConversation] = await tx
      .insert(conversations)
      .values(conversation)
      .returning();
    const [createdNode] = await tx
      .insert(conversationNodes)
      .values({
        ...rootNode,
        conversationId: createdConversation.id,
      })
      .returning();
    await tx
      .update(conversations)
      .set({ rootNodeId: createdNode.id, isInitialized: true })
      .where(eq(conversations.id, createdConversation.id));

    return { conversation: createdConversation, rootNode: createdNode };
  });

export const updateConversation = (
  id: string,
  data: Partial<NewConversation>
) => db.update(conversations).set(data).where(eq(conversations.id, id));

export const updateNode = (id: string, data: Partial<NewConversationNode>) =>
  db.update(conversationNodes).set(data).where(eq(conversationNodes.id, id));

export const deleteConversationAndRelatedNodes = async (
  id: string
): Promise<{
  success: boolean;
}> => {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(conversationNodes)
        .where(eq(conversationNodes.conversationId, id));
      await tx.delete(conversations).where(eq(conversations.id, id));
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
