import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as InstagramStrategy } from "passport-instagram";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { users, type User } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { generateMagicLink, sendMagicLinkEmail } from "./email";

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || process.env.REPL_ID || 'your-jwt-secret';

const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "porygon-supremacy",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const isMatch = await crypto.compare(password, user.password!);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.googleId, profile.id))
          .limit(1);

        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              username: profile.displayName,
              email: profile.emails?.[0]?.value,
              googleId: profile.id,
              emailVerified: true
            })
            .returning();
          user = newUser;
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }));
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.facebookId, profile.id))
          .limit(1);

        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              username: profile.displayName,
              email: profile.emails?.[0]?.value,
              facebookId: profile.id,
              emailVerified: true
            })
            .returning();
          user = newUser;
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }));
  }

  // Instagram Strategy
  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: "/auth/instagram/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.instagramId, profile.id))
          .limit(1);

        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              username: profile.displayName,
              instagramId: profile.id
            })
            .returning();
          user = newUser;
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }));
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Magic Link Authentication
  app.post("/api/auth/magic-link", async (req, res) => {
    try {
      const { email } = req.body;

      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // Create new user if doesn't exist
        const [newUser] = await db
          .insert(users)
          .values({
            username: email.split('@')[0],
            email,
          })
          .returning();
        user = newUser;
      }

      const magicLink = await generateMagicLink(email);
      await sendMagicLinkEmail(email, magicLink);

      res.json({ message: "Magic link sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send magic link" });
    }
  });

  app.get("/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      const decoded = jwt.verify(token as string, JWT_SECRET) as { email: string };

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, decoded.email))
        .limit(1);

      if (!user) {
        return res.status(400).send("Invalid token");
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).send("Login failed");
        }
        res.redirect('/');
      });
    } catch (error) {
      res.status(400).send("Invalid or expired token");
    }
  });

  // OAuth routes
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), 
    (req, res) => res.redirect('/'));

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), 
    (req, res) => res.redirect('/'));

  app.get('/auth/instagram', passport.authenticate('instagram'));
  app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), 
    (req, res) => res.redirect('/'));

  // Existing routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { username, password } = result.data;

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Hash the password
      const hashedPassword = await crypto.hash(password);

      // Create the new user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      // Log the user in after registration
      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: "Registration successful",
          user: { id: newUser.id, username: newUser.username },
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
    }

    const cb = (err: any, user: Express.User | false, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Login failed");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username },
        });
      });
    };
    passport.authenticate("local", cb)(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }

      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }

    res.status(401).send("Not logged in");
  });
}