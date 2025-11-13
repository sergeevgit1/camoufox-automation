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

// Browser automation sessions
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: int("profileId").references(() => profiles.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "stopped", "error"]).default("stopped").notNull(),
  browserConfig: text("browserConfig"), // JSON string for Camoufox config
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// Automation tasks
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(), // navigate, click, screenshot, etc.
  parameters: text("parameters"), // JSON string for action parameters
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  result: text("result"), // JSON string for task result
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// API keys for n8n integration
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// Browser profiles for multi-accounting (like Dolphin/GoLogin)
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  tags: text("tags"), // Comma-separated tags for grouping
  fingerprint: text("fingerprint"), // JSON string for browser fingerprint config
  cookies: text("cookies"), // JSON string for stored cookies
  localStorage: text("localStorage"), // JSON string for localStorage data
  sessionStorage: text("sessionStorage"), // JSON string for sessionStorage data
  proxy: text("proxy"), // JSON string for proxy config
  userAgent: text("userAgent"),
  viewport: varchar("viewport", { length: 50 }), // e.g., "1920x1080"
  timezone: varchar("timezone", { length: 100 }),
  locale: varchar("locale", { length: 20 }),
  geolocation: varchar("geolocation", { length: 100 }), // e.g., "55.7558,37.6173" (lat,lon)
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;