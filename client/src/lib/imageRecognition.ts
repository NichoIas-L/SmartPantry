import { apiRequest } from "@/lib/queryClient";

/**
 * Handles the image recognition process
 * Sends the base64 image data to the API for processing
 * 
 * @param imageBase64 - Base64 encoded image data
 * @returns The recognized items from the image
 */
export async function recognizeImage(imageBase64: string) {
  try {
    const response = await apiRequest(
      "POST",
      "/api/recognize",
      { imageBase64 }
    );
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Image recognition error:", error);
    throw new Error("Failed to recognize items in image");
  }
}

/**
 * Adds recognized items to the inventory
 * 
 * @param items - The items to add to inventory
 * @param location - The storage location (Fridge or Cabinet)
 */
export async function addItemsToInventory(items: any[], location: string) {
  try {
    const addPromises = items.map(item => 
      apiRequest(
        "POST",
        "/api/inventory",
        {
          name: item.name,
          location,
          imageUrl: item.imageUrl,
          confidence: item.confidence,
          // Set default expiry date for items (14 days for fridge, 180 days for cabinet)
          expiryDate: new Date(
            Date.now() + (location === "Fridge" ? 14 : 180) * 24 * 60 * 60 * 1000
          ).toISOString()
        }
      )
    );
    
    await Promise.all(addPromises);
    return true;
  } catch (error) {
    console.error("Error adding items to inventory:", error);
    throw new Error("Failed to add items to inventory");
  }
}
