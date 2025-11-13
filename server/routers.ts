import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { executeCamoufoxTask } from "./camoufoxExecutor";
import { updateTaskStatus } from "./db";
import type { InsertSession } from "../drizzle/schema";

// Async task executor
async function executeTaskAsync(
  taskId: number,
  sessionId: number,
  action: string,
  parameters: any,
  browserConfigJson: string | null
) {
  try {
    await updateTaskStatus(taskId, 'running', undefined, undefined);
    
    // Merge session browser config with task parameters
    const browserConfig = browserConfigJson ? JSON.parse(browserConfigJson) : {};
    const taskData = {
      action,
      parameters: { ...browserConfig, ...parameters },
    };
    
    const result = await executeCamoufoxTask(taskData as any);
    
    if (result.success) {
      await updateTaskStatus(taskId, 'completed', JSON.stringify(result.result), undefined);
    } else {
      await updateTaskStatus(taskId, 'failed', undefined, result.error);
    }
  } catch (error) {
    await updateTaskStatus(
      taskId,
      'failed',
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Session management
  sessions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSessions } = await import('./db');
      return await getUserSessions(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        profileId: z.number().optional(),
        browserConfig: z.object({
          headless: z.boolean().optional(),
          humanize: z.boolean().optional(),
          os: z.enum(["windows", "macos", "linux"]).optional(),
          block_images: z.boolean().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSession, updateProfileLastUsed } = await import('./db');
        const sessionData: InsertSession = {
          userId: ctx.user.id,
          name: input.name,
          profileId: input.profileId || null,
          status: "stopped",
          browserConfig: input.browserConfig ? JSON.stringify(input.browserConfig) : null,
        };
        const result = await createSession(sessionData);
        
        // Update profile last used timestamp
        if (input.profileId) {
          await updateProfileLastUsed(input.profileId);
        }
        
        return { success: true, id: Number((result as any).insertId) };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getSessionById, deleteSession } = await import('./db');
        const session = await getSessionById(input.id);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error('Session not found');
        }
        await deleteSession(input.id);
        return { success: true };
      }),
  }),
  
  // Task execution
  tasks: router({
    list: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSessionById, getSessionTasks } = await import('./db');
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error('Session not found');
        }
        return await getSessionTasks(input.sessionId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        action: z.enum(['navigate', 'screenshot', 'get_content', 'click', 'fill', 'evaluate']),
        parameters: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getSessionById, createTask } = await import('./db');
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error('Session not found');
        }
        
        const result = await createTask({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          action: input.action,
          parameters: JSON.stringify(input.parameters),
          status: 'pending',
        });
        
        // Get the inserted task ID from the result
        const taskId = Number((result as any)[0]?.insertId || 0);
        
        // Execute task asynchronously
        executeTaskAsync(taskId, input.sessionId, input.action, input.parameters, session.browserConfig);
        
        return { success: true, taskId };
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getTaskById } = await import('./db');
        const task = await getTaskById(input.id);
        if (!task || task.userId !== ctx.user.id) {
          throw new Error('Task not found');
        }
        return task;
      }),
  }),
  
  // API key management
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserApiKeys } = await import('./db');
      return await getUserApiKeys(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const { createApiKey } = await import('./db');
        const crypto = await import('crypto');
        const key = crypto.randomBytes(32).toString('hex');
        
        await createApiKey({
          userId: ctx.user.id,
          key,
          name: input.name,
        });
        
        return { success: true, key };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteApiKey } = await import('./db');
        await deleteApiKey(input.id);
        return { success: true };
      }),
  }),

  // Profile management for multi-accounting
  profiles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserProfiles } = await import('./db');
      return await getUserProfiles(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getProfileById } = await import('./db');
        return await getProfileById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        tags: z.string().optional(),
        fingerprint: z.record(z.string(), z.any()).optional(),
        proxy: z.object({
          server: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
        }).optional(),
        userAgent: z.string().optional(),
        viewport: z.string().optional(),
        timezone: z.string().optional(),
        locale: z.string().optional(),
        geolocation: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createProfile } = await import('./db');
        const profileData: any = {
          userId: ctx.user.id,
          name: input.name,
          tags: input.tags || null,
          fingerprint: input.fingerprint ? JSON.stringify(input.fingerprint) : null,
          proxy: input.proxy ? JSON.stringify(input.proxy) : null,
          userAgent: input.userAgent || null,
          viewport: input.viewport || null,
          timezone: input.timezone || null,
          locale: input.locale || null,
          geolocation: input.geolocation || null,
          notes: input.notes || null,
        };
        const result = await createProfile(profileData);
        return { success: true, id: Number((result as any).insertId) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        tags: z.string().optional(),
        fingerprint: z.record(z.string(), z.any()).optional(),
        proxy: z.object({
          server: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
        }).optional(),
        userAgent: z.string().optional(),
        viewport: z.string().optional(),
        timezone: z.string().optional(),
        locale: z.string().optional(),
        geolocation: z.string().optional(),
        notes: z.string().optional(),
        cookies: z.string().optional(),
        localStorage: z.string().optional(),
        sessionStorage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateProfile } = await import('./db');
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.tags !== undefined) updateData.tags = data.tags;
        if (data.fingerprint) updateData.fingerprint = JSON.stringify(data.fingerprint);
        if (data.proxy) updateData.proxy = JSON.stringify(data.proxy);
        if (data.userAgent !== undefined) updateData.userAgent = data.userAgent;
        if (data.viewport !== undefined) updateData.viewport = data.viewport;
        if (data.timezone !== undefined) updateData.timezone = data.timezone;
        if (data.locale !== undefined) updateData.locale = data.locale;
        if (data.geolocation !== undefined) updateData.geolocation = data.geolocation;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.cookies !== undefined) updateData.cookies = data.cookies;
        if (data.localStorage !== undefined) updateData.localStorage = data.localStorage;
        if (data.sessionStorage !== undefined) updateData.sessionStorage = data.sessionStorage;
        await updateProfile(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteProfile } = await import('./db');
        await deleteProfile(input.id);
        return { success: true };
      }),

    clone: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const { getProfileById, createProfile } = await import('./db');
        const original = await getProfileById(input.id);
        if (!original) throw new Error('Profile not found');
        
        const clonedData: any = {
          userId: ctx.user.id,
          name: input.name,
          tags: original.tags,
          fingerprint: original.fingerprint,
          proxy: original.proxy,
          userAgent: original.userAgent,
          viewport: original.viewport,
          timezone: original.timezone,
          locale: original.locale,
          geolocation: original.geolocation,
          notes: original.notes,
          // Don't clone cookies, localStorage, sessionStorage
        };
        const result = await createProfile(clonedData);
        return { success: true, id: Number((result as any).insertId) };
      }),
  }),
});

export type AppRouter = typeof appRouter;
