import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { cronService } from "./services/cronService";
import { telemetryService } from "./services/telemetryService";
// import { healthGuardianService } from "./services/healthGuardianService"; // REMOVED - unnecessary complexity
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for now to avoid breaking Vite/React scripts
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true, // Default to reflecting origin if not set
  credentials: true,
}));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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
  const server = await registerRoutes(app);

  // 404 handler for unmatched routes (must be before error handler)
  app.use(notFoundHandler);

  // Centralized error handler (must be last)
  app.use(errorHandler);


  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    // reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);

    // Start the automated content generation cron service
    if (process.env.ENABLE_CRON !== 'false') {
      await cronService.start();
      log('⏰ Content generation scheduler started');
    } else {
      log('🔒 Cron service disabled via ENABLE_CRON=false (multi-instance safety)');
    }

    // Start telemetry
    telemetryService.start();
  });
})();
