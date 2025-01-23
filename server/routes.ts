import type { Express } from "express";
import { createServer, type Server } from "http";
import toolsRouter from "./routes/tools";

export function registerRoutes(app: Express): Server {
  // Register tools routes
  app.use("/api/tools", toolsRouter);

  const httpServer = createServer(app);
  return httpServer;
}
