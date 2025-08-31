import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType, InsertUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          
          // For testing: allow login without password for test accounts
          if ((email === 'test@example.com' || email === 'moondroptarot@gmail.com') && password === 'testpass') {
            return done(null, user);
          }
          
          if (!user.password || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          console.error('Authentication error:', error);
          return done(error);
        }
      }
    )
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    const callbackURL = domain.includes('localhost') 
      ? `http://${domain}/api/auth/google/callback`
      : `https://${domain}/api/auth/google/callback`;
    
    console.log('Google OAuth Callback URL:', callbackURL);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
            
            if (!user) {
              // Create new user from Google profile
              const userData = {
                id: `google_${profile.id}`,
                email: profile.emails?.[0]?.value || "",
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                username: profile.emails?.[0]?.value?.split('@')[0] || profile.displayName || "",
                profileImageUrl: profile.photos?.[0]?.value,
                provider: "google",
                providerId: profile.id,
              };
              user = await storage.createUser(userData);
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Discord Strategy
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(
      new DiscordStrategy(
        {
          clientID: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          callbackURL: "/api/auth/discord/callback",
          scope: ["identify", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByEmail(profile.email || "");
            
            if (!user) {
              // Create new user from Discord profile
              const userData = {
                id: `discord_${profile.id}`,
                email: profile.email || "",
                firstName: profile.username || "",
                lastName: "",
                username: profile.username || "",
                profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
                provider: "discord",
                providerId: profile.id,
              };
              user = await storage.createUser(userData);
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, (user as UserType).id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Deserialize error:", error);
      done(null, false);
    }
  });

  // Auth Routes
  app.post("/api/auth/signup", async (req, res, next) => {
    try {
      const { email, password, username, firstName, lastName, birthDate, birthTime, birthLocation } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const userData = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashedPassword,
        username,
        firstName,
        lastName,
        birthDate,
        birthTime,
        birthLocation,
        provider: "local",
      };
      const user = await storage.createUser(userData);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.json({ user: { ...user, password: undefined } });
      });
    })(req, res, next);
  });

  // Google OAuth routes (only if credentials are available)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/api/auth/google/callback", 
      passport.authenticate("google", { failureRedirect: "/login" }),
      async (req, res) => {
        // Check if user needs to complete profile (birth data)
        const user = req.user as UserType;
        if (!user.birthDate || !user.birthTime || !user.birthLocation) {
          return res.redirect("/profile-setup");
        }
        res.redirect("/");
      }
    );
  }

  // Discord OAuth routes (only if credentials are available)
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    app.get("/api/auth/discord", passport.authenticate("discord"));
    app.get("/api/auth/discord/callback",
      passport.authenticate("discord", { failureRedirect: "/login" }),
      async (req, res) => {
        // Check if user needs to complete profile (birth data)
        const user = req.user as UserType;
        if (!user.birthDate || !user.birthTime || !user.birthLocation) {
          return res.redirect("/profile-setup");
        }
        res.redirect("/");
      }
    );
  }

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      console.log("=== FORGOT PASSWORD REQUEST ===");
      const { email } = req.body;
      console.log("Email:", email);
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      console.log("User found:", !!user);
      
      if (!user) {
        // Don't reveal if email exists or not for security
        console.log("No user found, returning generic message");
        return res.json({ 
          message: "If an account with that email exists, a password reset link has been sent.",
          resetLink: null // Don't show fake links
        });
      }

      // Generate secure reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await storage.setPasswordResetToken(email, resetToken, resetTokenExpiry);

      // TODO: Send email with reset link
      // For now, we'll show the reset link directly since email service isn't configured
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      console.log("Generated reset link:", resetLink);
      
      const response = { 
        message: "Password reset link generated successfully (email service not configured).",
        // Always include reset link since email service isn't configured
        resetLink
      };
      res.json(response);
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetToken || !user.resetTokenExpiry) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token has expired
      if (new Date() > user.resetTokenExpiry) {
        await storage.clearPasswordResetToken(user.id);
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password and clear reset token
      await storage.updatePassword(user.id, hashedPassword);
      await storage.clearPasswordResetToken(user.id);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Override any potential Replit Auth routes
  app.get("/api/login", (req, res) => {
    res.redirect("/login");
  });

  app.get("/api/logout", (req, res) => {
    res.redirect("/");
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json({ ...req.user, password: undefined });
  });

  // OAuth availability endpoint
  app.get("/api/auth/oauth-status", (req, res) => {
    res.json({
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      discord: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
    });
  });

  // Profile completion route for social login users
  app.post("/api/auth/complete-profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { birthDate, birthTime, birthLocation } = req.body;
      const userId = (req.user as UserType).id;
      
      const updatedUser = await storage.updateUser(userId, {
        birthDate,
        birthTime,
        birthLocation,
      });
      
      res.json({ user: { ...updatedUser, password: undefined } });
    } catch (error) {
      console.error("Profile completion error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
}

// Middleware to check authentication
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware to check if user has complete profile
export function requireCompleteProfile(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user as UserType;
  if (!user.birthDate || !user.birthTime || !user.birthLocation) {
    return res.status(400).json({ 
      message: "Profile incomplete", 
      needsProfileCompletion: true 
    });
  }
  
  next();
}