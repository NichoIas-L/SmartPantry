import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define food item storage locations
export enum Location {
  Fridge = "Fridge",
  Cabinet = "Cabinet",
}

// Define the inventory item table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location", { enum: ["Fridge", "Cabinet"] }).notNull(),
  imageUrl: text("image_url"),
  confidence: integer("confidence"), // confidence level from vision API (0-100)
  addedDate: timestamp("added_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"),
});

// Create insert schema for validation
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  addedDate: true,
});

// Export types
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Users table (from template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
