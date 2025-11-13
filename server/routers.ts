import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { executeCamoufoxTask } from "./camoufoxExecutor";
import { updateTaskStatus } from "./db";

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
        browserConfig: z.object({
          headless: z.boolean().optional(),
          humanize: z.union([z.boolean(), z.number()]).optional(),
          os: z.enum(['windows', 'macos', 'linux']).optional(),
          geoip: z.union([z.string(), z.boolean()]).optional(),
          locale: z.string().optional(),
          block_images: z.boolean().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSession } = await import('./db');
        await createSession({
          userId: ctx.user.id,
          name: input.name,
          browserConfig: input.browserConfig ? JSON.stringify(input.browserConfig) : null,
          status: 'stopped',
        });
        return { success: true };
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
});

export type AppRouter = typeof appRouter;
