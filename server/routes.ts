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
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post(
    "/api/images",
    upload.single("image"),
    async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (!req.file) return res.status(400).send("No image uploaded");

      try {
        const enhanced = await enhanceImage(req.file.buffer);
        const analysis = await analyzeImage(req.file.buffer);

        // In a real app, we would upload these to S3/CloudFlare/etc
        // For this demo, we'll use base64 strings
        const image = await storage.createImage({
          userId: req.user!.id,
          originalUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          enhancedUrl: `data:${req.file.mimetype};base64,${enhanced.toString('base64')}`,
          caption: analysis.suggestedCaption,
          analysis,
        });

        res.status(201).json(image);
      } catch (error: any) {
        res.status(500).send(error.message);
      }
    },
  );

  app.get("/api/images", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const images = await storage.getImages(req.user!.id);
    res.json(images);
  });

  const httpServer = createServer(app);
  return httpServer;
}
