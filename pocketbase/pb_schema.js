/**
 * PocketBase Schema Definition
 * This file defines the collections and their fields for PocketBase
 * 
 * To apply this schema:
 * 1. Start PocketBase: ./pocketbase serve
 * 2. Open admin UI: http://localhost:8090/_/
 * 3. Create collections manually or import this schema via Settings > Import collections
 * 
 * Or use PocketBase migrations in Go to automate this process
 */

// Users collection (extends PocketBase auth collection)
// PocketBase has built-in "users" auth collection, we just need to add custom fields:
// - role: user | admin (default: user)

// Profiles collection
const profilesCollection = {
  name: "profiles",
  type: "base",
  schema: [
    {
      name: "userId",
      type: "relation",
      required: true,
      options: {
        collectionId: "users",
        cascadeDelete: true,
        maxSelect: 1,
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "tags",
      type: "text",
      required: false,
    },
    {
      name: "fingerprint",
      type: "json",
      required: false,
    },
    {
      name: "cookies",
      type: "json",
      required: false,
    },
    {
      name: "localStorage",
      type: "json",
      required: false,
    },
    {
      name: "sessionStorage",
      type: "json",
      required: false,
    },
    {
      name: "proxy",
      type: "json",
      required: false,
    },
    {
      name: "userAgent",
      type: "text",
      required: false,
    },
    {
      name: "viewport",
      type: "text",
      required: false,
    },
    {
      name: "timezone",
      type: "text",
      required: false,
    },
    {
      name: "locale",
      type: "text",
      required: false,
    },
    {
      name: "geolocation",
      type: "text",
      required: false,
    },
    {
      name: "notes",
      type: "text",
      required: false,
    },
    {
      name: "lastUsed",
      type: "date",
      required: false,
    },
  ],
  indexes: ["CREATE INDEX idx_profiles_userId ON profiles (userId)"],
  listRule: "@request.auth.id != '' && userId = @request.auth.id",
  viewRule: "@request.auth.id != '' && userId = @request.auth.id",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != '' && userId = @request.auth.id",
  deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
};

// Sessions collection
const sessionsCollection = {
  name: "sessions",
  type: "base",
  schema: [
    {
      name: "userId",
      type: "relation",
      required: true,
      options: {
        collectionId: "users",
        cascadeDelete: true,
        maxSelect: 1,
      },
    },
    {
      name: "profileId",
      type: "relation",
      required: false,
      options: {
        collectionId: "profiles",
        cascadeDelete: false,
        maxSelect: 1,
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: {
        values: ["active", "stopped", "error"],
      },
    },
    {
      name: "browserConfig",
      type: "json",
      required: false,
    },
  ],
  indexes: ["CREATE INDEX idx_sessions_userId ON sessions (userId)"],
  listRule: "@request.auth.id != '' && userId = @request.auth.id",
  viewRule: "@request.auth.id != '' && userId = @request.auth.id",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != '' && userId = @request.auth.id",
  deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
};

// Tasks collection
const tasksCollection = {
  name: "tasks",
  type: "base",
  schema: [
    {
      name: "sessionId",
      type: "relation",
      required: true,
      options: {
        collectionId: "sessions",
        cascadeDelete: true,
        maxSelect: 1,
      },
    },
    {
      name: "userId",
      type: "relation",
      required: true,
      options: {
        collectionId: "users",
        cascadeDelete: true,
        maxSelect: 1,
      },
    },
    {
      name: "action",
      type: "text",
      required: true,
    },
    {
      name: "parameters",
      type: "json",
      required: false,
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: {
        values: ["pending", "running", "completed", "failed"],
      },
    },
    {
      name: "result",
      type: "json",
      required: false,
    },
    {
      name: "error",
      type: "text",
      required: false,
    },
    {
      name: "completed",
      type: "date",
      required: false,
    },
  ],
  indexes: [
    "CREATE INDEX idx_tasks_sessionId ON tasks (sessionId)",
    "CREATE INDEX idx_tasks_userId ON tasks (userId)",
  ],
  listRule: "@request.auth.id != '' && userId = @request.auth.id",
  viewRule: "@request.auth.id != '' && userId = @request.auth.id",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != '' && userId = @request.auth.id",
  deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
};

// API Keys collection
const apiKeysCollection = {
  name: "apiKeys",
  type: "base",
  schema: [
    {
      name: "userId",
      type: "relation",
      required: true,
      options: {
        collectionId: "users",
        cascadeDelete: true,
        maxSelect: 1,
      },
    },
    {
      name: "key",
      type: "text",
      required: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "lastUsed",
      type: "date",
      required: false,
    },
  ],
  indexes: [
    "CREATE UNIQUE INDEX idx_apiKeys_key ON apiKeys (key)",
    "CREATE INDEX idx_apiKeys_userId ON apiKeys (userId)",
  ],
  listRule: "@request.auth.id != '' && userId = @request.auth.id",
  viewRule: "@request.auth.id != '' && userId = @request.auth.id",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != '' && userId = @request.auth.id",
  deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
};

// Export collections for reference
module.exports = {
  collections: [
    profilesCollection,
    sessionsCollection,
    tasksCollection,
    apiKeysCollection,
  ],
};
