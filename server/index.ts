import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port 5000 on Replit, 3000 for local development
  const isReplit = process.env.REPL_ID || process.env.REPLIT_CLUSTER;
  const PRIMARY_PORT = isReplit ? 5000 : 3000;
  const FALLBACK_PORT = isReplit ? 5001 : 3001;
  
  server.listen(PRIMARY_PORT, "0.0.0.0", () => {
    log(`serving on port ${PRIMARY_PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${PRIMARY_PORT} is already in use, trying fallback port ${FALLBACK_PORT}`);
      server.listen(FALLBACK_PORT, "0.0.0.0", () => {
        log(`serving on fallback port ${FALLBACK_PORT}`);
      });
    } else {
      throw err;
    }
  });
})();