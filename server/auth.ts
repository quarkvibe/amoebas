import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
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
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl / 1000,
        tableName: "sessions",
    });

    app.set("trust proxy", 1);
    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super_secret_session_key",
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                secure: app.get("env") === "production",
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

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) {
            return res.sendStatus(401);
        }
        res.json(req.user);
    });
}
