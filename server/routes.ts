import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import axios from "axios";

// Google Cloud Vision API endpoint
const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";
const VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || "";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for inventory management
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const location = req.query.location as string | undefined;
      
      let items;
      if (location) {
        items = await storage.getInventoryItemsByLocation(location);
      } else {
        items = await storage.getInventoryItems();
      }
      
      res.json(items);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItemById(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (err) {
      console.error("Error fetching inventory item:", err);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const validationResult = insertInventoryItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const item = await storage.createInventoryItem(validationResult.data);
      res.status(201).json(item);
    } catch (err) {
      console.error("Error creating inventory item:", err);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validationResult = insertInventoryItemSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedItem = await storage.updateInventoryItem(id, validationResult.data);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(updatedItem);
    } catch (err) {
      console.error("Error updating inventory item:", err);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Image recognition API endpoint
  app.post("/api/recognize", async (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Mock implementation for development
      // In a production environment, you would use a real image recognition API
      // like Google Cloud Vision API, Amazon Rekognition, or similar
      
      console.log("Processing image recognition request");
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock recognized items
      const mockItems = [
        {
          name: "Milk",
          confidence: 92,
          imageUrl: "https://source.unsplash.com/100x100/?milk"
        },
        {
          name: "Apples",
          confidence: 88,
          imageUrl: "https://source.unsplash.com/100x100/?apples"
        },
        {
          name: "Cheese",
          confidence: 86,
          imageUrl: "https://source.unsplash.com/100x100/?cheese"
        },
        {
          name: "Eggs",
          confidence: 95,
          imageUrl: "https://source.unsplash.com/100x100/?eggs"
        },
        {
          name: "Bread",
          confidence: 91,
          imageUrl: "https://source.unsplash.com/100x100/?bread"
        }
      ];
      
      // Randomly select 3-5 items from the mock list to simulate variation
      const numItems = Math.floor(Math.random() * 3) + 3; // 3 to 5 items
      const selectedItems = [...mockItems]
        .sort(() => 0.5 - Math.random())
        .slice(0, numItems);
      
      console.log(`Recognized ${selectedItems.length} items`);
      
      res.json({ items: selectedItems });
    } catch (err) {
      console.error("Error recognizing image:", err);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
