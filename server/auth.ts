import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as InstagramStrategy } from "passport-instagram";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { fetchInstagramUserProfile, fetchInstagramMedia, saveInstagramPosts } from "./instagram";

declare global {
  namespace Express {
    interface User extends SelectUser {}
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
  console.log('Current session secret:', process.env.SESSION_SECRET);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || process.env.REPL_ID || 'steve-jobs-was-cool-7-+',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: 'sessionId',
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: app.get("env") === "development" ? 'lax' : 'none',  // Use 'lax' for local development
      path: '/',
    }
  };

  // Update the production settings
  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    if (sessionSettings.cookie) {
      sessionSettings.cookie.secure = true;  // Only use secure in production
      sessionSettings.cookie.sameSite = 'none';  // Use none in production for cross-origin
    }
  }

  // Move CORS configuration before any middleware
  app.use((req, res, next) => {
    // Allow the mobile origin
    const origin = req.headers.origin || '';
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cookie, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Instagram authentication strategy
  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    // Use the exact redirect URI that was configured in Facebook Developer Console
    const callbackUrl = "https://bettercaption-carterspinelli.replit.app/dashboard";

    console.log('Instagram callback URL:', callbackUrl);

    passport.use(
      new InstagramStrategy(
        {
          clientID: process.env.INSTAGRAM_CLIENT_ID,
          clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
          callbackURL: callbackUrl,
          scope: ['user_profile', 'user_media'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            if (!profile.id) {
              return done(new Error('No profile ID returned from Instagram'));
            }

            // User must be logged in to connect Instagram
            // This is handled in the route middleware
            return done(null, { 
              instagramId: profile.id, 
              instagramUsername: profile.username || profile.displayName || profile.id,
              accessToken 
            });
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  } else {
    console.warn('Instagram OAuth is not configured. Missing INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET');
  }

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log('User not found during deserialization:', id);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Set explicit session cookie
        if (req.session) {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
        }
        return res.status(200).json(user);
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
    console.log('User check:', {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      user: req.user?.id || 'no-user',
    });

    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Create a route to handle the initial redirect to Instagram login
  app.get('/api/auth/instagram', (req, res, next) => {
    // Instagram authentication requires user to be logged in first
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to connect Instagram" });
    }

    passport.authenticate('instagram')(req, res, next);
  });

  // Create a separate route to handle the callback from dashboard
  app.get('/dashboard', async (req, res, next) => {
    // This route handles both normal dashboard requests and Instagram OAuth redirects
    // If there's a code parameter, it's from Instagram OAuth
    if (req.query.code) {
      if (!req.isAuthenticated()) {
        return res.redirect('/auth?error=instagram-auth-failed');
      }

      try {
        // Exchange the code for a token
        const response = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.INSTAGRAM_CLIENT_ID || '',
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET || '',
            grant_type: 'authorization_code',
            redirect_uri: 'https://bettercaption-carterspinelli.replit.app/dashboard',
            code: req.query.code as string
          })
        });

        if (!response.ok) {
          throw new Error(`Instagram token exchange failed: ${response.statusText}`);
        }

        const data = await response.json();
        const accessToken = data.access_token;
        const instagramId = data.user_id;

        // Get additional profile info
        const profile = await fetchInstagramUserProfile(accessToken);

        const userId = req.user!.id;
        const expires = new Date();
        expires.setDate(expires.getDate() + 60); // Instagram tokens typically valid for 60 days

        // Connect Instagram account to user
        const updatedUser = await storage.connectInstagramAccount(
          userId,
          profile.id,
          profile.username,
          accessToken,
          expires
        );

        // Fetch and store Instagram media
        const mediaData = await fetchInstagramMedia(accessToken);
        await saveInstagramPosts(updatedUser, mediaData);

        // Redirect to dashboard with success parameter
        return res.redirect('/dashboard?instagram=connected');
      } catch (error) {
        console.error('Error connecting Instagram account:', error);
        return res.redirect('/dashboard?error=instagram-connection-failed');
      }
    } else {
      // If no code parameter, just handle as normal dashboard request
      // We'll let the client-side routing handle this
      return res.sendFile('index.html', { root: './client/dist' });
    }
  });

  app.post('/api/instagram/disconnect', async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to disconnect Instagram" });
    }

    try {
      const updatedUser = await storage.disconnectInstagramAccount(req.user!.id);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/instagram/posts', async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view Instagram posts" });
    }

    try {
      const posts = await storage.getInstagramPosts(req.user!.id);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });
}