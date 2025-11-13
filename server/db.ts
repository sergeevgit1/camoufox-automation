import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, InsertSession, tasks, InsertTask, apiKeys, InsertApiKey } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
      values.role = 'admin';
      updateSet.role = 'admin';
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Session management
export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(data);
  return result;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(sessions.createdAt);
}

export async function getSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSessionStatus(sessionId: number, status: "active" | "stopped" | "error") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions).set({ status, updatedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function deleteSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Task management
export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return result;
}

export async function getSessionTasks(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(eq(tasks.sessionId, sessionId)).orderBy(tasks.createdAt);
}

export async function getTaskById(taskId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTaskStatus(
  taskId: number,
  status: "pending" | "running" | "completed" | "failed",
  result?: string,
  error?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = { status };
  if (result !== undefined) updates.result = result;
  if (error !== undefined) updates.error = error;
  if (status === "completed" || status === "failed") {
    updates.completedAt = new Date();
  }
  await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
}

// API key management
export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(apiKeys).values(data);
  return result;
}

export async function getUserApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(apiKeys.createdAt);
}

export async function getApiKeyByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateApiKeyLastUsed(keyId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyId));
}

export async function deleteApiKey(keyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
}

// Profile management for multi-accounting
export async function getUserProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { profiles } = await import('../drizzle/schema');
  return await db.select().from(profiles).where(eq(profiles.userId, userId)).orderBy(profiles.createdAt);
}

export async function getProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { profiles } = await import('../drizzle/schema');
  const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProfile(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { profiles } = await import('../drizzle/schema');
  const result = await db.insert(profiles).values(data);
  return result;
}

export async function updateProfile(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { profiles } = await import('../drizzle/schema');
  await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.id, id));
}

export async function deleteProfile(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const { profiles } = await import('../drizzle/schema');
  await db.delete(profiles).where(eq(profiles.id, id));
}

export async function updateProfileLastUsed(id: number) {
  const db = await getDb();
  if (!db) return;
  const { profiles } = await import('../drizzle/schema');
  await db.update(profiles).set({ lastUsedAt: new Date() }).where(eq(profiles.id, id));
}
