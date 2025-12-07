import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

export function setupAuth(app: Express) {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

    // Use PostgreSQL session store in production, memory store for development/testing
    let sessionStore: session.Store;

    if (process.env.DATABASE_URL) {
        const pgStore = connectPg(session);
        sessionStore = new pgStore({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
            ttl: sessionTtl / 1000,
            tableName: "sessions",
        });
        console.log("📦 Using PostgreSQL session store");
    } else {
        const MemStore = MemoryStore(session);
        sessionStore = new MemStore({
            checkPeriod: 86400000, // 24 hours
        });
        console.log("⚠️ Using in-memory session store (development only)");
    }

    app.set("trust proxy", 1);
    if (!process.env.SESSION_SECRET) {
        throw new Error("SESSION_SECRET environment variable is required");
    }

    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                secure: app.get("env") === "production",
                httpOnly: true,
                sameSite: "strict",
                maxAge: sessionTtl,
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user) {
                    return done(null, false, { message: "Incorrect username." });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Incorrect password." });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Auth Routes

    /**
     * @swagger
     * /api/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       201:
     *         description: User created successfully
     *       400:
     *         description: Username already exists or missing fields
     *       403:
     *         description: Registration disabled
     */
    app.post("/api/register", async (req, res, next) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).send("Username and password are required");
            }

            // Security Check: Only allow registration if no users exist (First Run)
            // OR if the requester is an authenticated admin (Future proofing)
            const userCount = await storage.getUserCount();
            if (userCount > 0 && !req.isAuthenticated()) {
                return res.status(403).json({ message: "Registration is disabled. Please contact the administrator." });
            }

            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // First user is Admin
            const isAdmin = userCount === 0;

            const user = await storage.upsertUser({
                username,
                password: hashedPassword,
                isAdmin,
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (err) {
            next(err);
        }
    });

    /**
     * @swagger
     * /api/login:
     *   post:
     *     summary: Login a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     *       400:
     *         description: Invalid credentials
     */
    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: Express.User, info: any) => {
            if (err) return next(err);
            if (!user) {
                return res.status(400).send(info.message || "Login failed");
            }
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        })(req, res, next);
    });

    /**
     * @swagger
     * /api/logout:
     *   post:
     *     summary: Logout the current user
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Logout successful
     */
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    /**
     * @swagger
     * /api/user:
     *   get:
     *     summary: Get current user profile
     *     tags: [Auth]
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Current user profile
     *       401:
     *         description: Not authenticated
     */
    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) {
            return res.sendStatus(401);
        }
        res.json(req.user);
    });
}
