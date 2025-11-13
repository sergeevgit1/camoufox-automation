import PocketBase from "pocketbase";

/**
 * PocketBase client for authentication and data storage
 * Connects to PocketBase instance running in Docker container
 */
export const pb = new PocketBase(
  process.env.POCKETBASE_URL || "http://pocketbase:8090"
);

// Disable auto cancellation to allow multiple concurrent requests
pb.autoCancellation(false);

/**
 * PocketBase collections interface
 * Extends the default User type with our custom fields
 */
export interface PBUser {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  role: "user" | "admin";
  created: string;
  updated: string;
}

/**
 * Browser profile stored in PocketBase
 */
export interface PBProfile {
  id: string;
  userId: string;
  name: string;
  tags?: string;
  fingerprint?: string;
  cookies?: string;
  localStorage?: string;
  sessionStorage?: string;
  proxy?: string;
  userAgent?: string;
  viewport?: string;
  timezone?: string;
  locale?: string;
  geolocation?: string;
  notes?: string;
  created: string;
  updated: string;
  lastUsed?: string;
}

/**
 * Browser automation session stored in PocketBase
 */
export interface PBSession {
  id: string;
  userId: string;
  profileId?: string;
  name: string;
  status: "active" | "stopped" | "error";
  browserConfig?: string;
  created: string;
  updated: string;
}

/**
 * Automation task stored in PocketBase
 */
export interface PBTask {
  id: string;
  sessionId: string;
  userId: string;
  action: string;
  parameters?: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
  error?: string;
  created: string;
  completed?: string;
}

/**
 * API key stored in PocketBase
 */
export interface PBApiKey {
  id: string;
  userId: string;
  key: string;
  name: string;
  lastUsed?: string;
  created: string;
}

/**
 * Initialize PocketBase admin authentication
 * This is called on server startup to authenticate as admin
 */
export async function initPocketBaseAdmin() {
  try {
    // Admin credentials are stored in PocketBase itself
    // On first run, create admin via PocketBase UI at http://localhost:8090/_/
    const adminEmail = process.env.PB_ADMIN_EMAIL || "admin@localhost";
    const adminPassword = process.env.PB_ADMIN_PASSWORD || "admin1234567890";

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log("[PocketBase] Admin authenticated successfully");
  } catch (error) {
    console.warn(
      "[PocketBase] Admin auth failed - will use public API only:",
      error
    );
  }
}

/**
 * Verify user authentication token
 * @param token - JWT token from cookie or Authorization header
 * @returns User record if valid, null otherwise
 */
export async function verifyUserToken(
  token: string
): Promise<PBUser | null> {
  try {
    pb.authStore.save(token);
    
    // Refresh to verify token is valid
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
      return pb.authStore.record as PBUser;
    }
    
    return null;
  } catch (error) {
    console.warn("[PocketBase] Token verification failed:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<PBUser | null> {
  try {
    const user = await pb.collection("users").getOne<PBUser>(userId);
    return user;
  } catch (error) {
    console.error("[PocketBase] Failed to get user:", error);
    return null;
  }
}

/**
 * Create or update user
 */
export async function upsertUser(data: {
  email: string;
  name?: string;
  password?: string;
  role?: "user" | "admin";
}): Promise<PBUser | null> {
  try {
    // Try to find existing user by email
    const existingUsers = await pb
      .collection("users")
      .getFullList<PBUser>({ filter: `email = "${data.email}"` });

    if (existingUsers.length > 0) {
      // Update existing user
      const user = await pb
        .collection("users")
        .update<PBUser>(existingUsers[0].id, {
          name: data.name,
          role: data.role,
        });
      return user;
    } else {
      // Create new user
      const user = await pb.collection("users").create<PBUser>({
        email: data.email,
        name: data.name || data.email.split("@")[0],
        password: data.password || generateRandomPassword(),
        passwordConfirm: data.password || generateRandomPassword(),
        role: data.role || "user",
        emailVisibility: true,
      });
      return user;
    }
  } catch (error) {
    console.error("[PocketBase] Failed to upsert user:", error);
    return null;
  }
}

function generateRandomPassword(): string {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}

export default pb;
