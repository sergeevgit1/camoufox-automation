import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { pb, verifyUserToken, type PBUser } from "./pocketbase";
import { getSessionCookieOptions } from "./cookies";

/**
 * Parse cookies from request headers
 */
function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  const parsed = parseCookieHeader(cookieHeader);
  return new Map(Object.entries(parsed));
}

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Authenticate with PocketBase
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      if (!authData.token) {
        res.status(401).json({ error: "Authentication failed" });
        return;
      }

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, authData.token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        user: {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name,
          role: authData.record.role,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Login failed:", error);
      res.status(401).json({
        error: error.message || "Invalid email or password",
      });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      if (password.length < 8) {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
        return;
      }

      // Create user in PocketBase
      const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name: name || email.split("@")[0],
        role: "user",
        emailVisibility: true,
      });

      // Auto-login after registration
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, authData.token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Registration failed:", error);
      res.status(400).json({
        error: error.message || "Registration failed",
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    pb.authStore.clear();
    res.json({ success: true });
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sessionCookie = cookies.get(COOKIE_NAME);

      if (!sessionCookie) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const user = await verifyUserToken(sessionCookie);

      if (!user) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      });
    } catch (error) {
      console.error("[Auth] Get user failed:", error);
      res.status(401).json({ error: "Authentication failed" });
    }
  });

  // OAuth2 providers (Google, GitHub, etc.) - handled by PocketBase UI
  // Users can login via PocketBase dashboard OAuth2 flow
  app.get("/api/auth/oauth2/:provider", (req: Request, res: Response) => {
    const provider = req.params.provider;
    const pocketbaseUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    
    // Redirect to PocketBase OAuth2 flow
    res.redirect(
      `${pocketbaseUrl}/api/oauth2-redirect?provider=${provider}`
    );
  });
}

/**
 * Authenticate request and return user
 * Used in tRPC context and middleware
 */
export async function authenticateRequest(req: Request): Promise<PBUser> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);

  if (!sessionCookie) {
    throw ForbiddenError("Not authenticated");
  }

  const user = await verifyUserToken(sessionCookie);

  if (!user) {
    throw ForbiddenError("Invalid session");
  }

  return user;
}

/**
 * Authenticate API key for n8n integration
 */
export async function authenticateApiKey(apiKey: string): Promise<PBUser> {
  try {
    // Find API key in PocketBase
    const keys = await pb
      .collection("apiKeys")
      .getFullList({
        filter: `key = "${apiKey}"`,
        expand: "userId",
      });

    if (keys.length === 0) {
      throw ForbiddenError("Invalid API key");
    }

    const keyRecord = keys[0];

    // Update last used timestamp
    await pb.collection("apiKeys").update(keyRecord.id, {
      lastUsed: new Date().toISOString(),
    });

    // Get user
    const user = await pb
      .collection("users")
      .getOne<PBUser>(keyRecord.userId);

    return user;
  } catch (error) {
    console.error("[Auth] API key authentication failed:", error);
    throw ForbiddenError("Invalid API key");
  }
}
