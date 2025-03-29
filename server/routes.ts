import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import axios from "axios";
import Anthropic from '@anthropic-ai/sdk';

// Anthropic API setup for Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  // Image recognition API endpoint using Claude
  app.post("/api/recognize", async (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      console.log("Processing image recognition request with Claude AI");
      
      // Create prompt for Claude with the image
      const message = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1000,
        system: "You are a food recognition system. You will receive an image of a fridge or cabinet contents. Identify individual food items in the image and estimate their quantities when possible. Return ONLY a JSON array of objects with format [{name: string, confidence: number, quantity: string, unit: string}]. Confidence should be 1-100 based on how certain you are. Quantity should be a number as string. Unit should be the appropriate measurement unit or empty if not applicable. Do not include any explanation or notes.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
                }
              },
              {
                type: "text",
                text: "Identify all visible food items in this image, including quantities where possible. For example: 6 eggs, 1 gallon of milk, 2 lbs of apples. Return ONLY a JSON array of objects with name, confidence, quantity, and unit fields."
              }
            ]
          }
        ]
      });
      
      console.log("Claude AI response received");
      
      try {
        // Parse the JSON from Claude's response
        const responseBlock = message.content[0];
        
        // Type assertion to handle the response properly
        const responseText = (responseBlock as any).text as string;
        
        // Extract JSON array from the response (Claude might include some text)
        // Using a regex that works with ES2015
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (!jsonMatch) {
          console.error("No valid JSON found in Claude response:", responseText);
          throw new Error("Failed to parse response from Claude");
        }
        
        const recognizedItems = JSON.parse(jsonMatch[0]);
        
        // Ensure names are lowercase for consistency and add default quantity/unit if missing
        const processedItems = recognizedItems.map((item: any) => ({
          ...item,
          name: item.name.toLowerCase(),
          quantity: item.quantity || "1",
          unit: item.unit || ""
        }));
        
        console.log(`Claude recognized ${processedItems.length} items`);
        
        res.json({ items: processedItems });
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);
        
        // Fallback to a default response if parsing fails
        const fallbackItems = [
          {
            name: "unidentified item",
            confidence: 50,
            quantity: "1",
            unit: ""
          }
        ];
        
        console.log("Using fallback items due to parsing error");
        res.json({ items: fallbackItems });
      }
    } catch (err) {
      console.error("Error recognizing image with Claude:", err);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // Recipe suggestion endpoint using Claude
  app.post("/api/recipe-suggestions", async (req: Request, res: Response) => {
    try {
      const { ingredients } = req.body;
      
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "Ingredients list is required" });
      }

      // Get all inventory items for additional context
      const allInventoryItems = await storage.getInventoryItems();
      
      // Create a detailed inventory list with quantities
      const detailedInventory = allInventoryItems.map(item => {
        const quantityStr = item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : '1';
        return `${item.name.toLowerCase()} (${quantityStr})`;
      });
      
      console.log("Processing recipe suggestion request with Claude AI");
      
      // Generate recipe suggestions based on selected ingredients
      const message = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 4000,
        system: "You are a cooking assistant that specializes in creating recipes from available ingredients ONLY. You need to respect ingredient quantities when suggesting recipes. Never suggest ingredients that aren't in the user's inventory, and never suggest using more of an ingredient than the user has available.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `I have ONLY these ingredients in my inventory (with quantities): ${detailedInventory.join(", ")}.
                
                Please suggest 3 recipes I could make using ONLY these ingredients and respecting the quantities I have available. Do not suggest any ingredients that aren't in my inventory list above, and do not suggest using more of an ingredient than I have. Keep recipes simple and practical.
                
                Return your response as a valid JSON array of recipe objects with these properties:
                - id: a unique string (use uuid-like format)
                - title: recipe name
                - description: brief description (1-2 sentences)
                - ingredients: array of ingredient amounts needed (include specific quantities, but ONLY using items from my inventory and respecting my available amounts)
                - usedInventoryItems: array of ingredient names that match my inventory items
                - cookTime: cooking time as a string (e.g. "30 min")
                - calories: approximate calories as a number
                - image: a URL to a representative image (use urls from unsplash.com)
                - isFavorite: set to false
                
                Return complete, valid JSON without any explanation text.`
              }
            ]
          }
        ]
      });
      
      console.log("Claude AI recipe suggestions received");
      
      try {
        // Parse the JSON from Claude's response
        const responseBlock = message.content[0];
        
        // Type assertion to handle the response properly
        const responseText = (responseBlock as any).text as string;
        
        // Extract JSON array from the response
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (!jsonMatch) {
          console.error("No valid JSON found in Claude response:", responseText);
          throw new Error("Failed to parse response from Claude");
        }
        
        const suggestedRecipes = JSON.parse(jsonMatch[0]);
        console.log(`Claude suggested ${suggestedRecipes.length} recipes`);
        
        res.json(suggestedRecipes);
      } catch (parseError) {
        console.error("Error parsing Claude recipe suggestions:", parseError);
        res.status(500).json({ message: "Failed to generate recipe suggestions" });
      }
    } catch (err) {
      console.error("Error generating recipe suggestions:", err);
      res.status(500).json({ message: "Failed to generate recipe suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
