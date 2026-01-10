import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* Books table - core listing system */
export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  description: text("description"),
  condition: mysqlEnum("condition", ["like_new", "good", "fair", "poor"]).notNull(),
  genre: varchar("genre", { length: 100 }),
  isbn: varchar("isbn", { length: 20 }),
  imageUrl: text("imageUrl"),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  pointValue: int("pointValue").default(10).notNull(),
  status: mysqlEnum("status", ["available", "requested", "exchanged", "unavailable"]).default("available").notNull(),
  qrCode: varchar("qrCode", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Book history - tracks reading journey across owners */
export const bookHistory = mysqlTable("bookHistory", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id),
  readerId: int("readerId").notNull().references(() => users.id),
  city: varchar("city", { length: 100 }),
  readingDuration: int("readingDuration"), /* in days */
  notes: text("notes"),
  rating: int("rating"), /* 1-5 stars */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* Exchange requests */
export const exchangeRequests = mysqlTable("exchangeRequests", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id),
  requesterId: int("requesterId").notNull().references(() => users.id),
  offeredBookId: int("offeredBookId").references(() => books.id),
  pointsOffered: int("pointsOffered"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "completed", "disputed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* User points and transactions */
export const userPoints = mysqlTable("userPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  balance: int("balance").default(0).notNull(),
  totalEarned: int("totalEarned").default(0).notNull(),
  totalSpent: int("totalSpent").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Point transactions log */
export const pointTransactions = mysqlTable("pointTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["earned", "spent", "purchased", "refunded"]).notNull(),
  description: varchar("description", { length: 255 }),
  exchangeRequestId: int("exchangeRequestId").references(() => exchangeRequests.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* Wishlist */
export const wishlist = mysqlTable("wishlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  bookId: int("bookId").notNull().references(() => books.id),
  notifyOnAvailable: int("notifyOnAvailable").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* Forums */
export const forums = mysqlTable("forums", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* Forum threads */
export const forumThreads = mysqlTable("forumThreads", {
  id: int("id").autoincrement().primaryKey(),
  forumId: int("forumId").notNull().references(() => forums.id),
  authorId: int("authorId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  threadType: mysqlEnum("threadType", ["discussion", "chapter_debate", "interpretation", "guidance"]).default("discussion").notNull(),
  chapterNumber: int("chapterNumber"),
  isAnonymous: int("isAnonymous").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Forum posts/replies */
export const forumPosts = mysqlTable("forumPosts", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull().references(() => forumThreads.id),
  authorId: int("authorId").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAnonymous: int("isAnonymous").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Messages */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull().references(() => users.id),
  recipientId: int("recipientId").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* Exchange points (physical locations) */
export const exchangePoints = mysqlTable("exchangePoints", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: varchar("address", { length: 255 }).notNull(),
  latitude: varchar("latitude", { length: 50 }).notNull(),
  longitude: varchar("longitude", { length: 50 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  operatingHours: varchar("operatingHours", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Payment transactions */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  stripeTransactionId: varchar("stripeTransactionId", { length: 255 }).unique(),
  amount: int("amount").notNull(), /* in cents */
  pointsPurchased: int("pointsPurchased").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Disputes */
export const disputes = mysqlTable("disputes", {
  id: int("id").autoincrement().primaryKey(),
  exchangeRequestId: int("exchangeRequestId").notNull().references(() => exchangeRequests.id),
  reporterId: int("reporterId").notNull().references(() => users.id),
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "in_review", "resolved", "closed"]).default("open").notNull(),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* Type exports */
export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

export type BookHistory = typeof bookHistory.$inferSelect;
export type InsertBookHistory = typeof bookHistory.$inferInsert;

export type ExchangeRequest = typeof exchangeRequests.$inferSelect;
export type InsertExchangeRequest = typeof exchangeRequests.$inferInsert;

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

export type Forum = typeof forums.$inferSelect;
export type InsertForum = typeof forums.$inferInsert;

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = typeof forumThreads.$inferInsert;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type ExchangePoint = typeof exchangePoints.$inferSelect;
export type InsertExchangePoint = typeof exchangePoints.$inferInsert;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;