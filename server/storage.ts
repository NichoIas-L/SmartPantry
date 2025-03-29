import { inventoryItems, type InventoryItem, type InsertInventoryItem, users, type User, type InsertUser } from "@shared/schema";

// Storage interface for inventory management
export interface IStorage {
  // User methods (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inventory methods
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItemById(id: number): Promise<InventoryItem | undefined>;
  getInventoryItemsByLocation(location: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventory: Map<number, InventoryItem>;
  userCurrentId: number;
  inventoryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.inventory = new Map();
    this.userCurrentId = 1;
    this.inventoryCurrentId = 1;
  }

  // User methods (from template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Inventory methods
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    return this.inventory.get(id);
  }

  async getInventoryItemsByLocation(location: string): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values()).filter(
      (item) => item.location === location,
    );
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryCurrentId++;
    const addedDate = new Date();
    const item: InventoryItem = { ...insertItem, id, addedDate };
    this.inventory.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updateItem: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventory.get(id);
    if (!existingItem) {
      return undefined;
    }
    
    const updatedItem: InventoryItem = { ...existingItem, ...updateItem };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventory.delete(id);
  }
}

// Export singleton instance of storage
export const storage = new MemStorage();
