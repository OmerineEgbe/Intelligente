'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversations, messages, studentProfiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createConversation(title: string, studentType?: string) {
  const userId = await getUserId()

  const conversationId = uuidv4()
  await db.insert(conversations).values({
    id: conversationId,
    userid: userId,
    title: title || 'New Guidance Journey',
    studentType,
    status: 'active',
  })

  revalidatePath('/')
  return conversationId
}

export async function getConversations() {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userid, userId))
    .orderBy(conversations.createdat)

  return result
}

export async function getConversation(conversationId: string) {
  const userId = await getUserId()
  const conv = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, conversationId), eq(conversations.userid, userId))
    )
    .limit(1)

  if (!conv.length) throw new Error('Conversation not found')
  return conv[0]
}

export async function getConversationMessages(conversationId: string) {
  const userId = await getUserId()

  // Verify conversation belongs to user
  const conv = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, conversationId), eq(conversations.userid, userId))
    )
    .limit(1)

  if (!conv.length) throw new Error('Conversation not found')

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationid, conversationId))
    .orderBy(messages.createdat)

  return msgs
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const userId = await getUserId()

  // Verify conversation belongs to user
  const conv = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, conversationId), eq(conversations.userid, userId))
    )
    .limit(1)

  if (!conv.length) throw new Error('Conversation not found')

  const messageId = uuidv4()
  await db.insert(messages).values({
    id: messageId,
    conversationid: conversationId,
    userid: userId,
    role,
    content,
  })

  revalidatePath('/')
  return messageId
}

export async function deleteConversation(conversationId: string) {
  const userId = await getUserId()

  const result = await db
    .delete(conversations)
    .where(
      and(eq(conversations.id, conversationId), eq(conversations.userid, userId))
    )

  revalidatePath('/')
  return result
}

export async function updateStudentProfile(
  studentType: string,
  interests?: string,
  aptitudes?: string,
  careerGoal?: string
) {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userid, userId))
    .limit(1)

  if (existing.length) {
    await db
      .update(studentProfiles)
      .set({
        studentType,
        interests,
        aptitudes,
        careerGoal,
        classificationCompleted: true,
      })
      .where(eq(studentProfiles.userid, userId))
  } else {
    await db.insert(studentProfiles).values({
      id: uuidv4(),
      userid: userId,
      studentType,
      interests,
      aptitudes,
      careerGoal,
      classificationCompleted: true,
    })
  }

  revalidatePath('/')
}

export async function getStudentProfile() {
  const userId = await getUserId()
  const profile = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userid, userId))
    .limit(1)

  return profile.length ? profile[0] : null
}
