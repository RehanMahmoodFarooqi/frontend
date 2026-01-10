import { eq, and, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  books,
  bookHistory,
  exchangeRequests,
  userPoints,
  pointTransactions,
  wishlist,
  forums,
  forumThreads,
  forumPosts,
  messages,
  exchangePoints,
  paymentTransactions,
  disputes,
  Book,
  ExchangeRequest,
  UserPoints,
  Forum,
  ForumThread,
  Message,
  ExchangePoint,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Books
export async function createBook(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(books).values(data);
  return result;
}

export async function getBookById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableBooks(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(books)
    .where(eq(books.status, "available"))
    .orderBy(desc(books.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function searchBooks(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(books)
    .where(
      and(
        eq(books.status, "available"),
        like(books.title, `%${query}%`)
      )
    )
    .limit(limit);
}

export async function getUserBooks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(books).where(eq(books.ownerId, userId));
}

// Points
export async function getUserPoints(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeUserPoints(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userPoints).values({
    userId,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
}

export async function addPointTransaction(
  userId: number,
  amount: number,
  type: "earned" | "spent" | "purchased" | "refunded",
  description?: string,
  exchangeRequestId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pointTransactions).values({
    userId,
    amount,
    type,
    description,
    exchangeRequestId,
  });

  // Update user points balance
  const currentPoints = await getUserPoints(userId);
  if (currentPoints) {
    const newBalance =
      type === "earned" || type === "purchased"
        ? currentPoints.balance + amount
        : currentPoints.balance - amount;

    const newEarned =
      type === "earned" || type === "purchased"
        ? currentPoints.totalEarned + amount
        : currentPoints.totalEarned;

    const newSpent =
      type === "spent"
        ? currentPoints.totalSpent + amount
        : currentPoints.totalSpent;

    await db
      .update(userPoints)
      .set({
        balance: newBalance,
        totalEarned: newEarned,
        totalSpent: newSpent,
      })
      .where(eq(userPoints.userId, userId));
  }
}

// Exchange Requests
export async function createExchangeRequest(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(exchangeRequests).values(data);
  return result;
}

export async function getExchangeRequest(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(exchangeRequests)
    .where(eq(exchangeRequests.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserExchangeRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(exchangeRequests)
    .where(eq(exchangeRequests.requesterId, userId))
    .orderBy(desc(exchangeRequests.createdAt));
}

// Book History
export async function addBookHistory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(bookHistory).values(data);
}

export async function getBookHistory(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookHistory)
    .where(eq(bookHistory.bookId, bookId))
    .orderBy(asc(bookHistory.createdAt));
}

// Wishlist
export async function addToWishlist(userId: number, bookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(wishlist).values({ userId, bookId });
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wishlist).where(eq(wishlist.userId, userId));
}

export async function removeFromWishlist(userId: number, bookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)));
}

// Forums
export async function getForumsByBook(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(forums).where(eq(forums.bookId, bookId));
}

export async function createForum(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(forums).values(data);
  return result;
}

export async function getForumThreads(forumId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(forumThreads)
    .where(eq(forumThreads.forumId, forumId))
    .orderBy(desc(forumThreads.createdAt));
}

export async function createForumThread(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(forumThreads).values(data);
  return result;
}

export async function getForumPosts(threadId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(forumPosts)
    .where(eq(forumPosts.threadId, threadId))
    .orderBy(asc(forumPosts.createdAt));
}

export async function createForumPost(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(forumPosts).values(data);
}

// Messages
export async function sendMessage(
  senderId: number,
  recipientId: number,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(messages).values({
    senderId,
    recipientId,
    content,
  });
}

export async function getUserMessages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(messages)
    .where(eq(messages.recipientId, userId))
    .orderBy(desc(messages.createdAt));
}

export async function getConversation(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(messages)
    .where(
      or(
        and(
          eq(messages.senderId, userId1),
          eq(messages.recipientId, userId2)
        ),
        and(
          eq(messages.senderId, userId2),
          eq(messages.recipientId, userId1)
        )
      )
    )
    .orderBy(asc(messages.createdAt));
}

// Exchange Points
export async function createExchangePoint(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(exchangePoints).values(data);
  return result;
}

export async function getAllExchangePoints() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(exchangePoints);
}

export async function getUserExchangePoints(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(exchangePoints)
    .where(eq(exchangePoints.ownerId, userId));
}

// Payment Transactions
export async function createPaymentTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentTransactions).values(data);
  return result;
}

export async function getPaymentTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.userId, userId))
    .orderBy(desc(paymentTransactions.createdAt));
}

// Disputes
export async function createDispute(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(disputes).values(data);
  return result;
}

export async function getDispute(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(disputes)
    .where(eq(disputes.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Helper for OR conditions
import { or } from "drizzle-orm";
