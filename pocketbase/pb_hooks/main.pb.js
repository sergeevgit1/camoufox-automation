/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase Hooks
 * This file runs on PocketBase startup and handles automatic schema initialization
 * 
 * Documentation: https://pocketbase.io/docs/js-overview/
 */

// Add custom role field to users collection
onAfterBootstrap((e) => {
  const dao = $app.dao();

  try {
    // Get or create users collection
    let usersCollection = dao.findCollectionByNameOrId("users");

    if (!usersCollection) {
      console.log("[PocketBase] Users collection not found, will be created on first user signup");
      return;
    }

    // Check if role field exists
    const roleField = usersCollection.schema.getFieldByName("role");

    if (!roleField) {
      console.log("[PocketBase] Adding role field to users collection");

      // Add role field
      usersCollection.schema.addField(
        new SchemaField({
          name: "role",
          type: "select",
          required: true,
          options: {
            maxSelect: 1,
            values: ["user", "admin"],
          },
        })
      );

      dao.saveCollection(usersCollection);
      console.log("[PocketBase] Role field added successfully");
    }

    // Create collections if they don't exist
    createCollectionIfNotExists(dao, "profiles", createProfilesCollection);
    createCollectionIfNotExists(dao, "sessions", createSessionsCollection);
    createCollectionIfNotExists(dao, "tasks", createTasksCollection);
    createCollectionIfNotExists(dao, "apiKeys", createApiKeysCollection);

    console.log("[PocketBase] Schema initialization completed");
  } catch (error) {
    console.error("[PocketBase] Schema initialization error:", error);
  }
});

function createCollectionIfNotExists(dao, name, createFunc) {
  try {
    const collection = dao.findCollectionByNameOrId(name);
    if (!collection) {
      console.log(`[PocketBase] Creating ${name} collection`);
      createFunc(dao);
    }
  } catch (error) {
    console.error(`[PocketBase] Error creating ${name} collection:`, error);
  }
}

function createProfilesCollection(dao) {
  const collection = new Collection({
    name: "profiles",
    type: "base",
    listRule: "@request.auth.id != '' && userId = @request.auth.id",
    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
    deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
    schema: [
      new SchemaField({
        name: "userId",
        type: "relation",
        required: true,
        options: {
          collectionId: dao.findCollectionByNameOrId("users").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      }),
      new SchemaField({
        name: "name",
        type: "text",
        required: true,
      }),
      new SchemaField({
        name: "tags",
        type: "text",
      }),
      new SchemaField({
        name: "fingerprint",
        type: "json",
      }),
      new SchemaField({
        name: "cookies",
        type: "json",
      }),
      new SchemaField({
        name: "localStorage",
        type: "json",
      }),
      new SchemaField({
        name: "sessionStorage",
        type: "json",
      }),
      new SchemaField({
        name: "proxy",
        type: "json",
      }),
      new SchemaField({
        name: "userAgent",
        type: "text",
      }),
      new SchemaField({
        name: "viewport",
        type: "text",
      }),
      new SchemaField({
        name: "timezone",
        type: "text",
      }),
      new SchemaField({
        name: "locale",
        type: "text",
      }),
      new SchemaField({
        name: "geolocation",
        type: "text",
      }),
      new SchemaField({
        name: "notes",
        type: "text",
      }),
      new SchemaField({
        name: "lastUsed",
        type: "date",
      }),
    ],
  });

  dao.saveCollection(collection);
  console.log("[PocketBase] Profiles collection created");
}

function createSessionsCollection(dao) {
  const collection = new Collection({
    name: "sessions",
    type: "base",
    listRule: "@request.auth.id != '' && userId = @request.auth.id",
    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
    deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
    schema: [
      new SchemaField({
        name: "userId",
        type: "relation",
        required: true,
        options: {
          collectionId: dao.findCollectionByNameOrId("users").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      }),
      new SchemaField({
        name: "profileId",
        type: "relation",
        options: {
          collectionId: dao.findCollectionByNameOrId("profiles").id,
          cascadeDelete: false,
          maxSelect: 1,
        },
      }),
      new SchemaField({
        name: "name",
        type: "text",
        required: true,
      }),
      new SchemaField({
        name: "status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["active", "stopped", "error"],
        },
      }),
      new SchemaField({
        name: "browserConfig",
        type: "json",
      }),
    ],
  });

  dao.saveCollection(collection);
  console.log("[PocketBase] Sessions collection created");
}

function createTasksCollection(dao) {
  const collection = new Collection({
    name: "tasks",
    type: "base",
    listRule: "@request.auth.id != '' && userId = @request.auth.id",
    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
    deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
    schema: [
      new SchemaField({
        name: "sessionId",
        type: "relation",
        required: true,
        options: {
          collectionId: dao.findCollectionByNameOrId("sessions").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      }),
      new SchemaField({
        name: "userId",
        type: "relation",
        required: true,
        options: {
          collectionId: dao.findCollectionByNameOrId("users").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      }),
      new SchemaField({
        name: "action",
        type: "text",
        required: true,
      }),
      new SchemaField({
        name: "parameters",
        type: "json",
      }),
      new SchemaField({
        name: "status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["pending", "running", "completed", "failed"],
        },
      }),
      new SchemaField({
        name: "result",
        type: "json",
      }),
      new SchemaField({
        name: "error",
        type: "text",
      }),
      new SchemaField({
        name: "completed",
        type: "date",
      }),
    ],
  });

  dao.saveCollection(collection);
  console.log("[PocketBase] Tasks collection created");
}

function createApiKeysCollection(dao) {
  const collection = new Collection({
    name: "apiKeys",
    type: "base",
    listRule: "@request.auth.id != '' && userId = @request.auth.id",
    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
    deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
    schema: [
      new SchemaField({
        name: "userId",
        type: "relation",
        required: true,
        options: {
          collectionId: dao.findCollectionByNameOrId("users").id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      }),
      new SchemaField({
        name: "key",
        type: "text",
        required: true,
      }),
      new SchemaField({
        name: "name",
        type: "text",
        required: true,
      }),
      new SchemaField({
        name: "lastUsed",
        type: "date",
      }),
    ],
  });

  dao.saveCollection(collection);
  console.log("[PocketBase] API Keys collection created");
}

// Set default role for new users
onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== "users") {
    return;
  }

  const record = e.record;

  // Set default role if not specified
  if (!record.get("role")) {
    record.set("role", "user");
    $app.dao().saveRecord(record);
  }
});
