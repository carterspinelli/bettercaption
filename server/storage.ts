import { InsertUser, User, Image, InsertImage, InstagramPost, InsertInstagramPost } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createImage(image: InsertImage): Promise<Image>;
  getImages(userId: number): Promise<Image[]>;
  getImage(id: number): Promise<Image | undefined>;

  // Instagram related methods
  connectInstagramAccount(userId: number, instagramId: string, instagramUsername: string, 
                         instagramToken: string, expiresAt: Date): Promise<User>;
  disconnectInstagramAccount(userId: number): Promise<User>;
  saveInstagramPost(post: InsertInstagramPost): Promise<InstagramPost>;
  getInstagramPosts(userId: number): Promise<InstagramPost[]>;
  getInstagramPostById(id: string): Promise<InstagramPost | undefined>;

  // Manual style profile methods
  saveManualStyleProfile(userId: number, styleProfile: any): Promise<void>;
  getManualStyleProfile(userId: number): Promise<any | undefined>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  private instagramPosts: Map<number, InstagramPost>;
  private manualStyleProfiles: Map<number, any>;
  private currentUserId: number;
  private currentImageId: number;
  private currentInstagramPostId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.instagramPosts = new Map();
    this.manualStyleProfiles = new Map();
    this.currentUserId = 1;
    this.currentImageId = 1;
    this.currentInstagramPostId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      instagramId: null, 
      instagramUsername: null, 
      instagramToken: null,
      instagramConnected: false,
      instagramTokenExpiresAt: null 
    };
    this.users.set(id, user);
    return user;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const now = new Date();
    const image: Image = { 
      ...insertImage, 
      id, 
      createdAt: now,
      userId: insertImage.userId || 0 
    };
    this.images.set(id, image);
    return image;
  }

  async getImages(userId: number): Promise<Image[]> {
    return Array.from(this.images.values())
      .filter((image) => image.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  // Instagram related methods
  async connectInstagramAccount(
    userId: number, 
    instagramId: string, 
    instagramUsername: string, 
    instagramToken: string,
    expiresAt: Date
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      instagramId,
      instagramUsername,
      instagramToken,
      instagramConnected: true,
      instagramTokenExpiresAt: expiresAt
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async disconnectInstagramAccount(userId: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      instagramId: null,
      instagramUsername: null,
      instagramToken: null,
      instagramConnected: false,
      instagramTokenExpiresAt: null
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async saveInstagramPost(insertPost: InsertInstagramPost): Promise<InstagramPost> {
    const id = this.currentInstagramPostId++;
    const now = new Date();
    const post: InstagramPost = { 
      ...insertPost, 
      id,
      createdAt: now 
    };
    this.instagramPosts.set(id, post);
    return post;
  }

  async getInstagramPosts(userId: number): Promise<InstagramPost[]> {
    return Array.from(this.instagramPosts.values())
      .filter((post) => post.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getInstagramPostById(instagramId: string): Promise<InstagramPost | undefined> {
    return Array.from(this.instagramPosts.values()).find(
      (post) => post.instagramId === instagramId
    );
  }

  // Manual style profile methods
  async saveManualStyleProfile(userId: number, styleProfile: any): Promise<void> {
    this.manualStyleProfiles.set(userId, styleProfile);
  }

  async getManualStyleProfile(userId: number): Promise<any | undefined> {
    return this.manualStyleProfiles.get(userId);
  }
}

export const storage = new MemStorage();