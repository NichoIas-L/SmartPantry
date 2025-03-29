import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { recognizeImage, addItemsToInventory } from '@/lib/imageRecognition';
import { queryClient } from '@/lib/queryClient';

interface ProcessingProps {
  imageData: string | null;
  onRecognitionComplete: (items: any[]) => void;
  imageIndex?: number;
  totalImages?: number;
  selectedLocation?: string;
}

export default function Processing({ 
  imageData, 
  onRecognitionComplete,
  imageIndex = 0,
  totalImages = 1,
  selectedLocation = "Fridge"
}: ProcessingProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // If no image data is provided, go back to camera
    if (!imageData) {
      toast({
        title: "Error",
        description: "No image data found. Please take a photo first.",
        variant: "destructive",
      });
      navigate('/camera');
      return;
    }

    // Process image recognition with retry logic
    const processImage = async (retries = 1) => {
      try {
        console.log(`Processing image recognition (attempt ${retries})`);
        
        // Verify the image data format before sending
        if (!imageData.startsWith('data:image/')) {
          throw new Error('Invalid image data format');
        }
        
        // Call API to recognize items in image
        const recognizedItems = await recognizeImage(imageData);
        
        if (recognizedItems.length === 0) {
          // If no items detected but we have retries left, try again
          if (retries < 2) {
            console.log('No items detected, retrying...');
            setTimeout(() => processImage(retries + 1), 1000);
            return;
          }
          
          toast({
            title: "No items detected",
            description: "We couldn't detect any food items in your image. Please try again with better lighting or a clearer view.",
            variant: "destructive",
          });
          
          // If this is part of a multi-image session, continue to results with current items
          if (imageIndex > 0) {
            navigate('/results');
          } else {
            navigate('/camera');
          }
          return;
        }
        
        console.log(`Successfully recognized ${recognizedItems.length} items`);
        
        // Pass recognized items to parent component
        onRecognitionComplete(recognizedItems);
        
        // Automatically add items to inventory
        try {
          const result = await addItemsToInventory(recognizedItems, selectedLocation);
          
          // Invalidate inventory queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
          
          // Check if we have detailed results with updated vs. new items
          if (result && typeof result === 'object' && 'updatedItems' in result) {
            const { newItems, updatedItems } = result as { 
              newItems: any[], 
              updatedItems: any[] 
            };
            
            console.log(
              `Added ${newItems.length} new items and updated quantities for ${updatedItems.length} existing items in ${selectedLocation}`
            );
            
            // Show detailed success toast
            if (updatedItems.length > 0) {
              toast({
                title: "Items Recognized & Inventory Updated",
                description: `Added ${newItems.length} new items and updated quantities for ${updatedItems.length} existing items in your ${selectedLocation.toLowerCase()}.`,
                duration: 4000,
              });
            } else {
              toast({
                title: "Items Recognized & Added",
                description: `Successfully identified and added ${newItems.length} new items to your ${selectedLocation.toLowerCase()}.`,
                duration: 3000,
              });
            }
          } else {
            // Fallback to original message if detailed results not available
            console.log(`Added ${recognizedItems.length} items to ${selectedLocation}`);
            
            toast({
              title: "Items Recognized & Added",
              description: `Successfully identified and added ${recognizedItems.length} items to your ${selectedLocation.toLowerCase()}.`,
              duration: 3000,
            });
          }
        } catch (error) {
          console.error("Failed to add items to inventory:", error);
          
          // Still show recognition success, but note the inventory issue
          toast({
            title: "Items Recognized",
            description: `Identified ${recognizedItems.length} items, but couldn't add to inventory automatically. You can add them manually on the next screen.`,
            duration: 5000,
          });
        }
        
        // If we have processed all images, go to results
        // Otherwise, go back to camera to take more pictures
        if (imageIndex >= totalImages - 1) {
          navigate('/results');
        } else {
          navigate('/camera');
        }
      } catch (error) {
        console.error('Image recognition error:', error);
        
        // Retry if we have attempts left
        if (retries < 2) {
          console.log(`Recognition failed, retrying... (${retries}/2)`);
          setTimeout(() => processImage(retries + 1), 1000);
          return;
        }
        
        toast({
          title: "Recognition Failed",
          description: "We couldn't process your image. Please try again with a clearer image.",
          variant: "destructive",
        });
        
        // If this is part of a multi-image session, continue to results with current items
        if (imageIndex > 0) {
          navigate('/results');
        } else {
          navigate('/camera');
        }
      }
    };

    // Start processing after a short delay to show the animation
    const timer = setTimeout(() => {
      processImage();
    }, 1000);

    return () => clearTimeout(timer);
  }, [imageData, navigate, onRecognitionComplete, toast, imageIndex, totalImages, selectedLocation]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center py-12 max-w-md mx-auto px-4">
        <div className="mx-auto w-20 h-20 relative mb-6">
          <svg className="animate-spin h-full w-full text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mt-6">Recognizing Items</h3>
        <p className="text-gray-600 max-w-xs mx-auto mt-2">
          Our advanced Claude AI is analyzing your photo to identify all the food items. This may take a moment.
        </p>
        
        {totalImages > 1 && (
          <div className="mt-6">
            <div className="bg-gray-100 h-2 rounded-full overflow-hidden w-48 mx-auto">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${((imageIndex + 1) / totalImages) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Processing image {imageIndex + 1} of {totalImages}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
