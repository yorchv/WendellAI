
import { Router } from "express";
import { insertUserSchema } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import passport from "passport";
import { users } from "@db/schema";
import type { IVerifyOptions } from "passport-local";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
    }

    const { username, password } = result.data;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password,
      })
      .returning();

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

router.post("/login", (req, res, next) => {
  const result = insertUserSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
  }

  passport.authenticate("local", (err: any, user: Express.User | false, info: IVerifyOptions) => {
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
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }

    res.json({ message: "Logout successful" });
  });
});

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }

  res.status(401).send("Not logged in");
});

export default router;
