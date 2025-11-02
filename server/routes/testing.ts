import type { Express } from "express";
import { testingService } from "../services/testingService";
import { standardRateLimit, generousRateLimit } from "../middleware/rateLimiter";

/**
 * Testing Routes
 * Provides system testing and diagnostics endpoints
 * 
 * Following ARCHITECTURE.md:
 * - RIBOSOME layer (HTTP request handling)
 * - Calls GOLGI layer (testingService)
 * - No business logic here, just HTTP → service calls
 */

export function registerTestingRoutes(app: Express) {
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
  };

  /**
   * Run all system tests
   * POST /api/testing/run
   */
  app.post('/api/testing/run', isAuthenticated, standardRateLimit, async (req: any, res) => {
    try {
      const results = await testingService.runAllTests();
      
      res.json({
        success: true,
        ...results,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Run specific test suite
   * POST /api/testing/suite/:suiteName
   */
  app.post('/api/testing/suite/:suiteName', isAuthenticated, standardRateLimit, async (req: any, res) => {
    try {
      const { suiteName } = req.params;
      const results = await testingService.runTestSuite(suiteName);
      
      res.json({
        success: true,
        suite: suiteName,
        ...results,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Run specific test
   * POST /api/testing/test/:testId
   */
  app.post('/api/testing/test/:testId', isAuthenticated, standardRateLimit, async (req: any, res) => {
    try {
      const { testId } = req.params;
      const result = await testingService.runTest(testId);
      
      res.json({
        success: true,
        test: testId,
        result,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * List all available tests
   * GET /api/testing/suites
   */
  app.get('/api/testing/suites', isAuthenticated, generousRateLimit, async (req: any, res) => {
    try {
      const suites = testingService.getTestSuites();
      
      // Return summary (not full execute functions)
      const summary = suites.map(suite => ({
        id: suite.id,
        name: suite.name,
        description: suite.description,
        testCount: suite.tests.length,
        tests: suite.tests.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
        })),
      }));
      
      res.json({
        success: true,
        suites: summary,
        totalTests: summary.reduce((sum, s) => sum + s.testCount, 0),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Test specific service (quick check)
   * GET /api/testing/service/:serviceName
   */
  app.get('/api/testing/service/:serviceName', isAuthenticated, standardRateLimit, async (req: any, res) => {
    try {
      const { serviceName } = req.params;
      const result = await testingService.testService(serviceName);
      
      res.json({
        success: true,
        service: serviceName,
        result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Read system logs
   * GET /api/testing/logs?level=error&limit=100&since=2024-01-01
   */
  app.get('/api/testing/logs', isAuthenticated, generousRateLimit, async (req: any, res) => {
    try {
      const { level, limit, since, category } = req.query;
      
      const logs = await testingService.readLogs({
        level: level as any,
        limit: limit ? parseInt(limit as string) : 100,
        since: since ? new Date(since as string) : undefined,
        category: category as string,
      });
      
      res.json({
        success: true,
        logs,
        count: logs.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Read log file
   * GET /api/testing/logs/file
   */
  app.get('/api/testing/logs/file', isAuthenticated, standardRateLimit, async (req: any, res) => {
    try {
      const content = await testingService.readLogFile();
      
      res.json({
        success: true,
        content,
        lines: content.split('\n').length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Get system diagnostics
   * GET /api/testing/diagnostics
   */
  app.get('/api/testing/diagnostics', isAuthenticated, generousRateLimit, async (req: any, res) => {
    try {
      const diagnostics = await testingService.getDiagnostics();
      
      res.json({
        success: true,
        ...diagnostics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Health check (public, no auth)
   * GET /api/testing/health
   */
  app.get('/api/testing/health', generousRateLimit, async (req: any, res) => {
    try {
      // Quick health check - just verify server is responding
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
      });
    }
  });
}

