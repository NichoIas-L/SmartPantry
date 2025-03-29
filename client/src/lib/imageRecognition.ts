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
 * Adds recognized items to the inventory
 * 
 * @param items - The items to add to inventory
 * @param location - The storage location (Fridge or Cabinet)
 */
export async function addItemsToInventory(items: any[], location: string) {
  try {
    const addPromises = items.map(item => 
      apiRequest(
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
      )
    );
    
    await Promise.all(addPromises);
    return true;
  } catch (error) {
    console.error("Error adding items to inventory:", error);
    throw new Error("Failed to add items to inventory");
  }
}
