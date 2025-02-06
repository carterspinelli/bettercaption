import { InsertUser, User, Image, InsertImage } from "@shared/schema";
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
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  private currentUserId: number;
  private currentImageId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.currentUserId = 1;
    this.currentImageId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const now = new Date();
    const image: Image = { ...insertImage, id, createdAt: now };
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
}

export const storage = new MemStorage();
