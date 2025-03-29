import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";

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

      const itemData = validationResult.data;

      // Check if an item with the same name already exists
      const existingItem = await storage.getInventoryItemByName(itemData.name);

      if (existingItem && existingItem.location === itemData.location) {
        // If item exists, update quantity instead of creating a new one
        let newQuantity = parseFloat(existingItem.quantity || "0");
        const additionalQuantity = parseFloat(itemData.quantity || "1");

        // Add the quantities
        newQuantity += additionalQuantity;

        // Update the existing item with the new quantity
        const updatedItem = await storage.updateInventoryItem(existingItem.id, {
          ...itemData,
          quantity: newQuantity.toString(),
        });

        if (updatedItem) {
          return res.status(200).json({
            ...updatedItem,
            quantityUpdated: true,
            previousQuantity: existingItem.quantity,
          });
        }
      }

      // If no existing item or update failed, create a new item
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (err) {
      console.error("Error creating inventory item:", err);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validationResult = insertInventoryItemSchema
        .partial()
        .safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      const updatedItem = await storage.updateInventoryItem(
        id,
        validationResult.data,
      );

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
      let { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Ensure we have a properly formatted base64 image string
      // The Anthropic API expects the base64 data without the data URL prefix
      let imageData: string;

      try {
        // If the incoming data has a data URL prefix, remove it
        if (
          typeof imageBase64 === "string" &&
          imageBase64.includes("base64,")
        ) {
          imageData = imageBase64.split("base64,")[1];
        } else {
          // If it's already just base64 data, use it as is
          imageData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        }

        // Quick validation check for base64 format
        if (!/^[A-Za-z0-9+/=]+$/.test(imageData)) {
          console.warn("Image data doesn't appear to be valid base64");
          return res.status(400).json({ message: "Invalid image data format" });
        }
      } catch (err) {
        console.error("Error processing image data:", err);
        return res.status(400).json({ message: "Invalid image data format" });
      }

      console.log("Processing image recognition request with Claude AI");

      // Create prompt for Claude with the image
      const message = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1000,
        system:
          "You are a food recognition system. You will receive an image of a fridge or cabinet contents. Identify individual food items in the image and estimate their quantities when possible. Return ONLY a JSON array of objects with format [{name: string, confidence: number, quantity: string, unit: string}]. Confidence should be 1-100 based on how certain you are. Quantity should be a number as string. Unit should be the appropriate measurement unit or empty if not applicable. Do not include any explanation or notes.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageData,
                },
              },
              {
                type: "text",
                text: "Identify all visible food items in this image, including quantities where possible. For example: 6 eggs, 1 gallon of milk, 2 lbs of apples. Return ONLY a JSON array of objects with name, confidence, quantity, and unit fields.",
              },
            ],
          },
        ],
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
          console.error(
            "No valid JSON found in Claude response:",
            responseText,
          );
          throw new Error("Failed to parse response from Claude");
        }

        const recognizedItems = JSON.parse(jsonMatch[0]);

        // Ensure names are lowercase for consistency and add default quantity/unit if missing
        const processedItems = recognizedItems.map((item: any) => ({
          ...item,
          name: item.name.toLowerCase(),
          quantity: item.quantity || "1",
          unit: item.unit || "",
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
            unit: "",
          },
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
      const { ingredients, focusIngredient, filters = {} } = req.body;
      
      // Extract filter options
      const { 
        simplicity = null, 
        budget = null,
        maxCalories = null,
        maxSugar = null,
        minProtein = null,
        maxCarbs = null
      } = filters;

      if (
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Ingredients list is required" });
      }

      // Get all inventory items for additional context
      const allInventoryItems = await storage.getInventoryItems();

      // Create a detailed inventory list with quantities
      const detailedInventory = allInventoryItems.map((item) => {
        const quantityStr = item.quantity
          ? `${item.quantity} ${item.unit || ""}`.trim()
          : "1";
        return `${item.name.toLowerCase()} (${quantityStr})`;
      });

      console.log("Processing recipe suggestion request with Claude AI");

      // Build prompt text based on whether we have focused ingredients
      let promptText = `I have ONLY these ingredients in my inventory (with quantities): ${detailedInventory.join(", ")}.`;

      // If there's a focused ingredient(s), add a request to include it/them
      if (focusIngredient) {
        // Check if we have multiple ingredients (comma-separated)
        const focusIngredients = focusIngredient.split(",");

        if (focusIngredients.length > 1) {
          // Multiple focus ingredients
          const formattedIngredients = focusIngredients
            .map((ing: string) => `"${ing.trim()}"`)
            .join(", ");
          promptText += `\n\nPlease suggest 3 recipes that FEATURE these ingredients: ${formattedIngredients}. Each recipe should use at least one of these focus ingredients, using ONLY the ingredients from my inventory list and respecting the quantities I have available.`;
        } else {
          // Single focus ingredient
          promptText += `\n\nPlease suggest 3 recipes that FEATURE "${focusIngredient}" as a main ingredient, using ONLY the ingredients from my inventory list and respecting the quantities I have available.`;
        }
      } else {
        promptText += `\n\nPlease suggest 3 recipes I could make using ONLY these ingredients and respecting the quantities I have available.`;
      }
      
      // Add filter criteria to the prompt
      if (simplicity !== null || budget !== null || maxCalories !== null || 
          maxSugar !== null || minProtein !== null || maxCarbs !== null) {
        
        promptText += "\n\nPlease follow these additional recipe preferences:";
        
        if (simplicity !== null) {
          const complexityLevel = simplicity <= 3 ? "very simple" : 
                                simplicity <= 6 ? "moderately complex" : "complex";
          promptText += `\n- Complexity: Create ${complexityLevel} recipes (${simplicity}/10 complexity level)`;
        }
        
        if (budget !== null) {
          const budgetLevel = budget === 1 ? "extremely budget-friendly" :
                             budget === 2 ? "inexpensive" :
                             budget === 3 ? "moderately priced" :
                             budget === 4 ? "somewhat premium" : "luxury";
          promptText += `\n- Budget: ${budgetLevel} recipes (${budget}/5 budget level)`;
        }
        
        if (maxCalories !== null) {
          promptText += `\n- Calories: Maximum ${maxCalories} calories per serving`;
        }
        
        if (maxSugar !== null) {
          promptText += `\n- Sugar: Maximum ${maxSugar}g of sugar per serving`;
        }
        
        if (minProtein !== null) {
          promptText += `\n- Protein: Minimum ${minProtein}g of protein per serving`;
        }
        
        if (maxCarbs !== null) {
          promptText += `\n- Carbs: Maximum ${maxCarbs}g of carbohydrates per serving`;
        }
      }

      promptText += ` Do not suggest any ingredients that aren't in my inventory list above, and do not suggest using more of an ingredient than I have. Keep recipes simple and practical.
                
                Return your response as a valid JSON array of recipe objects with these properties:
                - id: a unique string (use uuid-like format)
                - title: recipe name
                - description: brief description (1-2 sentences)
                - ingredients: array of ingredient amounts needed (include specific quantities, but ONLY using items from my inventory and respecting my available amounts)
                - usedInventoryItems: array of ingredient names that match my inventory items
                - cookTime: cooking time as a string (e.g. "30 min")
                - calories: approximate calories as a number
                - image: a URL to a high-quality, appetizing image of the EXACT dish from unsplash.com. Make sure the image URL looks like "https://images.unsplash.com/photo-[ID]?..." and is a real, valid URL to a food image that matches this exact recipe (not a generic food image). The images should be professional food photography that would make someone want to eat this dish.
                - youtubeVideoId: a string containing a YouTube video ID for a good instructional video that shows how to make this recipe or something very similar. This should be just the ID portion (e.g., "dQw4w9WgXcQ"), not the full URL. Make sure this is a real, valid YouTube video ID that would work when embedded.
                - isFavorite: set to false
                
                Return complete, valid JSON without any explanation text.`;

      // Generate recipe suggestions based on selected ingredients
      const message = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 4000,
        system:
          "You are a cooking assistant that specializes in creating recipes from available ingredients ONLY. You need to respect ingredient quantities when suggesting recipes. Never suggest ingredients that aren't in the user's inventory, and never suggest using more of an ingredient than the user has available. For each recipe, provide a valid YouTube video ID for an instructional cooking video that closely matches the recipe. The video ID should be the unique identifier from a YouTube URL (e.g., 'dQw4w9WgXcQ' from https://www.youtube.com/watch?v=dQw4w9WgXcQ). Make sure to suggest real, existing YouTube videos that show how to prepare the same or very similar recipes.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
            ],
          },
        ],
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
          console.error(
            "No valid JSON found in Claude response:",
            responseText,
          );
          throw new Error("Failed to parse response from Claude");
        }

        const suggestedRecipes = JSON.parse(jsonMatch[0]);
        console.log(`Claude suggested ${suggestedRecipes.length} recipes`);

        res.json(suggestedRecipes);
      } catch (parseError) {
        console.error("Error parsing Claude recipe suggestions:", parseError);
        res
          .status(500)
          .json({ message: "Failed to generate recipe suggestions" });
      }
    } catch (err) {
      console.error("Error generating recipe suggestions:", err);
      res
        .status(500)
        .json({ message: "Failed to generate recipe suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
