import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeImage, enhanceImage } from "./openai";

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
    // Authentication middleware
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
    // File upload middleware
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
        const analysis = await analyzeImage(req.file.buffer);
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

  app.get("/api/images/:id", async (req, res) => {
    const image = await storage.getImage(parseInt(req.params.id));
    if (!image) return res.status(404).send("Image not found");

    //Improved response for better client-side handling of "Save to Photos"
    res.setHeader('Content-Type', image.originalUrl.split(';')[0]); //Set correct content type
    res.setHeader('Content-Disposition', `attachment; filename="${image.caption}.jpg"`); //Use caption for filename
    res.send(Buffer.from(image.originalUrl.split(',')[1], 'base64'));
  });

  const httpServer = createServer(app);
  return httpServer;
}