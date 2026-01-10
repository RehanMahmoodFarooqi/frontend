import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createBook,
  getBookById,
  getAvailableBooks,
  searchBooks,
  getUserBooks,
  getUserPoints,
  initializeUserPoints,
  addPointTransaction,
  createExchangeRequest,
  getExchangeRequest,
  getUserExchangeRequests,
  addBookHistory,
  getBookHistory,
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  getForumsByBook,
  createForum,
  getForumThreads,
  createForumThread,
  getForumPosts,
  createForumPost,
  sendMessage,
  getUserMessages,
  getConversation,
  createExchangePoint,
  getAllExchangePoints,
  getUserExchangePoints,
  createPaymentTransaction,
  getPaymentTransactions,
  createDispute,
  getDispute,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Books
  books: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await getAvailableBooks(input.limit, input.offset);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchBooks(input.query);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBookById(input.id);
      }),

    myBooks: protectedProcedure.query(async ({ ctx }) => {
      return await getUserBooks(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          author: z.string(),
          condition: z.enum(["like_new", "good", "fair", "poor"]),
          genre: z.string().optional(),
          isbn: z.string().optional(),
          imageUrl: z.string().optional(),
          location: z.string(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const book = await createBook({
          ...input,
          ownerId: ctx.user.id,
          pointValue: 10,
          status: "available",
        });
        await addPointTransaction(ctx.user.id, 5, "earned", "Listed a book");
        return book;
      }),
  }),

  // Points
  points: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      let userPoints = await getUserPoints(ctx.user.id);
      if (!userPoints) {
        await initializeUserPoints(ctx.user.id);
        userPoints = await getUserPoints(ctx.user.id);
      }
      return userPoints;
    }),

    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      // This would need a getPointTransactions function
      return [];
    }),

    purchase: protectedProcedure
      .input(z.object({ amount: z.number(), points: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Create payment transaction
        const transaction = await createPaymentTransaction({
          userId: ctx.user.id,
          amount: input.amount,
          pointsPurchased: input.points,
          status: "pending",
        });

        // Add points transaction
        await addPointTransaction(
          ctx.user.id,
          input.points,
          "purchased",
          `Purchased ${input.points} points`
        );

        return transaction;
      }),
  }),

  // Exchange Requests
  exchanges: router({
    create: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          offeredBookId: z.number().optional(),
          pointsOffered: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const book = await getBookById(input.bookId);
        if (!book) throw new Error("Book not found");

        const userPoints = await getUserPoints(ctx.user.id);
        const pointsNeeded = book.pointValue;

        if (!userPoints || userPoints.balance < pointsNeeded) {
          throw new Error("Insufficient points");
        }

        const exchange = await createExchangeRequest({
          bookId: input.bookId,
          requesterId: ctx.user.id,
          offeredBookId: input.offeredBookId,
          pointsOffered: input.pointsOffered,
          status: "pending",
        });

        return exchange;
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getUserExchangeRequests(ctx.user.id);
    }),

    accept: protectedProcedure
      .input(z.object({ exchangeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const exchange = await getExchangeRequest(input.exchangeId);
        if (!exchange) throw new Error("Exchange not found");

        // Deduct points from requester
        const book = await getBookById(exchange.bookId);
        if (book) {
          await addPointTransaction(
            exchange.requesterId,
            book.pointValue,
            "spent",
            "Exchanged book",
            exchange.id
          );

          // Add points to book owner
          await addPointTransaction(
            ctx.user.id,
            book.pointValue,
            "earned",
            "Gave book in exchange",
            exchange.id
          );
        }

        return { success: true };
      }),
  }),

  // Book History
  bookHistory: router({
    get: publicProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return await getBookHistory(input.bookId);
      }),

    add: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          city: z.string().optional(),
          readingDuration: z.number().optional(),
          notes: z.string().optional(),
          rating: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await addBookHistory({
          bookId: input.bookId,
          readerId: ctx.user.id,
          city: input.city,
          readingDuration: input.readingDuration,
          notes: input.notes,
          rating: input.rating,
        });

        await addPointTransaction(ctx.user.id, 2, "earned", "Added book history entry");
        return { success: true };
      }),
  }),

  // Wishlist
  wishlist: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserWishlist(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await addToWishlist(ctx.user.id, input.bookId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await removeFromWishlist(ctx.user.id, input.bookId);
        return { success: true };
      }),
  }),

  // Forums
  forums: router({
    getByBook: publicProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return await getForumsByBook(input.bookId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createForum(input);
      }),

    getThreads: publicProcedure
      .input(z.object({ forumId: z.number() }))
      .query(async ({ input }) => {
        return await getForumThreads(input.forumId);
      }),

    createThread: protectedProcedure
      .input(
        z.object({
          forumId: z.number(),
          title: z.string(),
          content: z.string(),
          threadType: z.enum(["discussion", "chapter_debate", "interpretation", "guidance"]),
          chapterNumber: z.number().optional(),
          isAnonymous: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const thread = await createForumThread({
          ...input,
          authorId: ctx.user.id,
          isAnonymous: input.isAnonymous ? 1 : 0,
        });

        await addPointTransaction(ctx.user.id, 2, "earned", "Created forum thread");
        return thread;
      }),

    getPosts: publicProcedure
      .input(z.object({ threadId: z.number() }))
      .query(async ({ input }) => {
        return await getForumPosts(input.threadId);
      }),

    createPost: protectedProcedure
      .input(
        z.object({
          threadId: z.number(),
          content: z.string(),
          isAnonymous: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createForumPost({
          ...input,
          authorId: ctx.user.id,
          isAnonymous: input.isAnonymous ? 1 : 0,
        });

        await addPointTransaction(ctx.user.id, 1, "earned", "Posted in forum");
        return { success: true };
      }),
  }),

  // Messages
  messages: router({
    getInbox: protectedProcedure.query(async ({ ctx }) => {
      return await getUserMessages(ctx.user.id);
    }),

    getConversation: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await getConversation(ctx.user.id, input.userId);
      }),

    send: protectedProcedure
      .input(
        z.object({
          recipientId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await sendMessage(ctx.user.id, input.recipientId, input.content);
        return { success: true };
      }),
  }),

  // Exchange Points
  exchangePoints: router({
    list: publicProcedure.query(async () => {
      return await getAllExchangePoints();
    }),

    myPoints: protectedProcedure.query(async ({ ctx }) => {
      return await getUserExchangePoints(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          address: z.string(),
          latitude: z.string(),
          longitude: z.string(),
          contactPhone: z.string().optional(),
          contactEmail: z.string().optional(),
          operatingHours: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createExchangePoint({
          ...input,
          ownerId: ctx.user.id,
        });
      }),
  }),

  // Disputes
  disputes: router({
    create: protectedProcedure
      .input(
        z.object({
          exchangeRequestId: z.number(),
          reason: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createDispute({
          ...input,
          reporterId: ctx.user.id,
          status: "open",
        });
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDispute(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
