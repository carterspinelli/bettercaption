import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Instagram integration fields
  instagramId: text("instagram_id"),
  instagramUsername: text("instagram_username"),
  instagramToken: text("instagram_token"),
  instagramConnected: boolean("instagram_connected").default(false),
  instagramTokenExpiresAt: timestamp("instagram_token_expires_at"),
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  originalUrl: text("original_url").notNull(),
  enhancedUrl: text("enhanced_url").notNull(),
  caption: text("caption").notNull(),
  analysis: jsonb("analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Instagram posts for analysis
export const instagramPosts = pgTable("instagram_posts", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  instagramId: text("instagram_id").notNull(),
  caption: text("caption"),
  mediaUrl: text("media_url"),
  permalink: text("permalink"),
  likeCount: integer("like_count"),
  commentCount: integer("comment_count"),
  mediaType: text("media_type"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});

export const insertInstagramPostSchema = createInsertSchema(instagramPosts).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type InstagramPost = typeof instagramPosts.$inferSelect;
export type InsertInstagramPost = z.infer<typeof insertInstagramPostSchema>;