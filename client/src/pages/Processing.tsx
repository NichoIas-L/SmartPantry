import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { recognizeImage } from '@/lib/imageRecognition';

interface ProcessingProps {
  imageData: string | null;
  onRecognitionComplete: (items: any[]) => void;
}

export default function Processing({ imageData, onRecognitionComplete }: ProcessingProps) {
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

    // Process image recognition
    const processImage = async () => {
      try {
        // Call API to recognize items in image
        const recognizedItems = await recognizeImage(imageData);
        
        if (recognizedItems.length === 0) {
          toast({
            title: "No items detected",
            description: "We couldn't detect any food items in your image. Please try again with better lighting or a clearer view.",
            variant: "destructive",
          });
          navigate('/camera');
          return;
        }
        
        // Pass recognized items to parent component
        onRecognitionComplete(recognizedItems);
        
        // Navigate to results page
        navigate('/results');
      } catch (error) {
        console.error('Image recognition error:', error);
        toast({
          title: "Recognition Failed",
          description: "We couldn't process your image. Please try again.",
          variant: "destructive",
        });
        navigate('/camera');
      }
    };

    // Start processing after a short delay to show the animation
    const timer = setTimeout(() => {
      processImage();
    }, 1500);

    return () => clearTimeout(timer);
  }, [imageData, navigate, onRecognitionComplete, toast]);

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
          Our AI is identifying food items in your image. This may take a moment.
        </p>
      </div>
    </main>
  );
}
