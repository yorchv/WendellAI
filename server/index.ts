import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import routes from "./routes/index";
import { setupAuth } from "./middleware/auth";
import { setupVite, serveStatic, log } from "./vite";
import { loggerMiddleware } from "./middleware/logger";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  statusCode: 429,
  validate: {
    xForwardedForHeader: false,
  },
});

// Setup auth first
setupAuth(app);

// Logger middleware
app.use(loggerMiddleware);

// API usage tracking middleware
const trackApiUsage = (req: Request, res: Response, next: NextFunction) => {
  console.log(`API request to ${req.path}`); // Basic tracking - log the request path
  next();
};
app.use("/api", trackApiUsage);


// Rate limiter removed from here as per instruction

(async () => {
  app.use("/api", routes);
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error but don't expose internal details to client
    console.error(err);

    res.status(status).json({
      status,
      message: status === 500 ? "Internal Server Error" : message,
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();