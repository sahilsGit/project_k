import { db } from "@/db/index";
import {
  ConversationNode,
  conversationNodes,
  conversations,
  NewConversation,
  NewConversationNode,
  NewUser,
  users,
} from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const createUser = async (user: NewUser) => {
  const createdUser = await db
    .insert(users)
    .values({
      name: user.name,
      email: user.email,
    })
    .returning({
      id: users.id
    });

  if (createdUser.length) return createdUser[0];
};

const getUserById = async (id: number) => {
  return db.query.users.findFirst({
    where: (users, {eq}) => eq(users.id, id),
    columns: {
      createdAt: false
    }
  })
}

/**
 * This only creates conversations with rootNoteID as null,
 * it must be initialized after root note is created.
 */
const createConversation = async (conversation: NewConversation) => {
  const createdConversation = await db
    .insert(conversations)
    .values(conversation)
    .returning({
      id: conversations.id
    });

  if (createdConversation.length) return createdConversation[0];
}

const createNode = async (node: NewConversationNode) => {
  const createdNode = await db
    .insert(conversationNodes)
    .values(node)
    .returning({
      id: conversationNodes.id
    })

  if (createdNode.length) return createdNode[0];
}

const initializeConversation = async (rootNoteId: string) => {

}