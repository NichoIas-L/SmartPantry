import { apiRequest } from "@/lib/queryClient";

/**
 * Handles the image recognition process
 * Sends the base64 image data to the API for processing
 * 
 * @param imageBase64 - Base64 encoded image data
 * @returns The recognized items from the image
 */
export async function recognizeImage(imageBase64: string) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    console.error("Invalid image data provided to recognizeImage");
    throw new Error("Image data is missing or invalid");
  }

  try {
    // Ensure the image data is properly formatted
    let formattedImageData = imageBase64;
    
    // If it's missing the data URL prefix, add it
    if (!imageBase64.startsWith('data:image/')) {
      formattedImageData = `data:image/jpeg;base64,${imageBase64.replace(/^data:image\/\w+;base64,/, "")}`;
    }
    
    // Log the status (but not the actual image data for privacy)
    console.log("Sending image for recognition, data length:", formattedImageData.length);
    
    const response = await apiRequest(
      'POST',
      '/api/recognize',
      { imageBase64: formattedImageData }
    );
    
    if (!response.ok) {
      console.error("API returned error status:", response.status);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error("Invalid API response structure:", data);
      throw new Error("Invalid response from recognition API");
    }
    
    console.log(`Recognition successful, found ${data.items.length} items`);
    return data.items;
  } catch (error) {
    console.error("Image recognition error:", error);
    throw new Error("Failed to recognize items in image");
  }
}

/**
 * Adds recognized items to the inventory, updating quantities for existing items
 * 
 * @param items - The items to add to inventory
 * @param location - The storage location (Fridge or Cabinet)
 * @returns Object containing information about which items were added vs updated
 */
export async function addItemsToInventory(items: any[], location: string) {
  try {
    const newItems: any[] = [];
    const updatedItems: any[] = [];
    
    // Process each item sequentially so we can track updates vs. new items
    for (const item of items) {
      const response = await apiRequest(
        'POST',
        '/api/inventory',
        {
          name: item.name,
          location,
          quantity: item.quantity || '1',
          unit: item.unit || '',
          confidence: item.confidence,
          // Set default expiry date for items (14 days for fridge, 180 days for cabinet)
          expiryDate: new Date(
            Date.now() + (location === "Fridge" ? 14 : 180) * 24 * 60 * 60 * 1000
          ).toISOString(),
          addedDate: new Date().toISOString()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to add item: ${item.name}`);
      }
      
      const result = await response.json();
      
      // Check if this was an update to an existing item
      if (result.quantityUpdated) {
        updatedItems.push({
          ...result,
          previousQuantity: result.previousQuantity
        });
      } else {
        newItems.push(result);
      }
    }
    
    console.log(`Inventory update complete: ${newItems.length} new items, ${updatedItems.length} updated items`);
    
    return {
      success: true,
      newItems,
      updatedItems
    };
  } catch (error) {
    console.error("Error adding items to inventory:", error);
    throw new Error("Failed to add items to inventory");
  }
}
