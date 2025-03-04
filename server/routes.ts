import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeImage, enhanceImage } from "./openai";
import { fetchInstagramUserProfile, fetchInstagramMedia, saveInstagramPosts } from "./instagram";
import { fetchPostsByUsername, analyzeUserStyle } from "./instaloader_service";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    console.log('Received file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    // Accept all image types including those from mobile devices
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed`));
    }
  }
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post(
    "/api/images",
    (req, res, next) => {
      console.log('Auth check:', {
        isAuthenticated: req.isAuthenticated(),
        session: req.session?.id || 'no-session',
        user: req.user?.id || 'no-user',
        cookies: req.headers.cookie
      });

      if (!req.isAuthenticated()) {
        console.error('Unauthorized upload attempt');
        return res.status(401).send("Unauthorized");
      }
      next();
    },
    upload.single("image"),
    async (req, res) => {
      console.log('Processing image upload request:', {
        body: req.body,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file received'
      });

      if (!req.file) {
        console.error('No file in request');
        return res.status(400).send("No image uploaded");
      }

      try {
        console.log('Starting image enhancement...');
        const enhanced = await enhanceImage(req.file.buffer);
        console.log('Image enhanced, starting analysis...');

        // Pass user ID to analyze image to incorporate Instagram style if available
        const analysis = await analyzeImage(req.file.buffer, req.user!.id);
        console.log('Analysis complete');

        // In a real app, we would upload these to S3/CloudFlare/etc
        // For this demo, we'll use base64 strings
        const image = await storage.createImage({
          userId: req.user!.id,
          originalUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          enhancedUrl: `data:${req.file.mimetype};base64,${enhanced.toString('base64')}`,
          caption: analysis.suggestedCaption,
          analysis,
        });

        console.log('Image saved successfully:', { imageId: image.id });
        res.status(201).json(image);
      } catch (error: any) {
        console.error('Error processing image:', {
          error: error.message,
          stack: error.stack
        });
        res.status(500).send(error.message || "Failed to process image");
      }
    },
  );

  app.get("/api/images", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const images = await storage.getImages(req.user!.id);
    res.json(images);
  });

  // Instagram posts API endpoint
  app.get("/api/instagram/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.instagramConnected) {
        return res.status(404).json({ connected: false, message: "Instagram account not connected" });
      }

      // Return minimal profile info
      res.json({
        connected: true,
        username: user.instagramUsername,
        expiresAt: user.instagramTokenExpiresAt
      });
    } catch (error: any) {
      console.error('Error fetching Instagram profile:', error);
      res.status(500).send(error.message || "Failed to fetch Instagram profile");
    }
  });

  // Create a dedicated endpoint to handle the Instagram OAuth callback
  app.get("/dashboard", async (req, res, next) => {
    // This route handles both normal dashboard requests and Instagram OAuth redirects
    // If there's a code parameter, it's from Instagram OAuth
    if (req.query.code) {
      console.log('Instagram OAuth callback received with code', req.query.code.substring(0, 5) + '...');

      if (!req.isAuthenticated()) {
        console.error('User not authenticated during Instagram callback');
        return res.redirect('/auth?error=instagram-auth-failed');
      }

      try {
        // Exchange the code for a token
        console.log('Exchanging code for token...');
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
          const errorText = await response.text();
          console.error('Instagram token exchange failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Instagram token exchange failed: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Token exchange successful, got user_id:', data.user_id);

        const accessToken = data.access_token;
        const instagramId = data.user_id;

        // Get additional profile info
        console.log('Fetching Instagram user profile...');
        const profile = await fetchInstagramUserProfile(accessToken);
        console.log('Got profile for user:', profile.username);

        const userId = req.user!.id;
        const expires = new Date();
        expires.setDate(expires.getDate() + 60); // Instagram tokens typically valid for 60 days

        // Connect Instagram account to user
        console.log('Connecting Instagram account to user...');
        const updatedUser = await storage.connectInstagramAccount(
          userId,
          profile.id,
          profile.username,
          accessToken,
          expires
        );

        // Fetch and store Instagram media
        console.log('Fetching Instagram media...');
        const mediaData = await fetchInstagramMedia(accessToken);
        await saveInstagramPosts(updatedUser, mediaData);
        console.log('Instagram connection successful!');

        // Redirect to dashboard with success parameter
        return res.redirect('/dashboard?instagram=connected');
      } catch (error: any) {
        console.error('Error connecting Instagram account:', error);
        return res.redirect('/dashboard?error=instagram-connection-failed&message=' + encodeURIComponent(error.message));
      }
    } else {
      // If no code parameter, just handle as normal dashboard request
      // We'll let the client-side routing handle this
      try {
        // Check if client/dist directory exists
        const fs = require('fs');
        const path = require('path');
        const distPath = './client/dist';
        const indexPath = path.join(distPath, 'index.html');

        if (!fs.existsSync(indexPath)) {
          console.warn('Client build not found. Returning simple response.');
          return res.send('Client build not found. Make sure to build the client first.');
        }

        // We'll let the client-side routing handle this
        return res.sendFile('index.html', { root: distPath });
      } catch (error) {
        console.error('Error serving client files:', error);
        return res.status(500).send('Server error');
      }
    }
  });

  app.post("/api/instagram/connect-by-username", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string') {
        return res.status(400).send("Instagram username is required");
      }

      // Update user with Instagram username
      const userId = req.user!.id;

      // Set Instagram connected to true but without token (since we're not using OAuth)
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(currentDate.getFullYear() + 1); // Set expiry to 1 year

      const updatedUser = await storage.connectInstagramAccount(
        userId,
        username,  // Using username as ID since we don't have the real Instagram ID
        username,
        '',        // No token needed
        expiryDate
      );

      // Fetch posts in background
      fetchPostsByUsername(username, userId)
        .catch(err => console.error(`Background fetch failed for ${username}:`, err));

      return res.status(200).json({
        success: true,
        message: "Successfully connected Instagram account via username",
        user: updatedUser
      });
    } catch (error: any) {
      console.error("Error connecting Instagram account by username:", error);
      return res.status(500).send(error.message || "An error occurred while connecting Instagram account");
    }
  });

  app.post("/api/instagram/refresh-posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      const user = await storage.getUser(req.user!.id);

      if (!user || !user.instagramConnected || !user.instagramUsername) {
        return res.status(400).send("Instagram account not connected");
      }

      await fetchPostsByUsername(user.instagramUsername, user.id);

      return res.status(200).json({
        success: true,
        message: "Successfully refreshed Instagram posts"
      });
    } catch (error: any) {
      console.error("Error refreshing Instagram posts:", error);
      return res.status(500).send(error.message || "An error occurred while refreshing Instagram posts");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}