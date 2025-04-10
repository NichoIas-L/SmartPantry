import { useRef, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera as CameraIcon, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraProps {
  onImageCaptured: (imageData: string) => void;
  captureCount?: number;
}

export default function Camera({ onImageCaptured, captureCount = 0 }: CameraProps) {
  const [, navigate] = useLocation();
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  // Handle camera initialization
  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setCameraError(null);
    
    // Set a timer to ensure the camera is fully initialized before allowing capture
    // This prevents the first-click issue
    setTimeout(() => {
      setHasInitialized(true);
      console.log("Camera fully initialized and ready for capture");
    }, 1000);
  }, []);

  // Handle camera errors
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    setCameraError(
      error instanceof DOMException 
        ? error.message 
        : 'Failed to access camera. Please check permissions.'
    );
    setIsCameraReady(false);
    setHasInitialized(false);
  }, []);

  // Capture image from webcam with delay to ensure camera is fully initialized
  const captureImage = useCallback(() => {
    // First check if the camera has been fully initialized
    if (!webcamRef.current || isCapturing) return;
    
    // If camera hasn't completed its initialization process, show a toast and don't proceed
    if (!hasInitialized) {
      toast({
        title: "Camera Initializing",
        description: "Please wait a moment for the camera to fully initialize.",
        duration: 3000,
      });
      return;
    }
    
    setIsCapturing(true);
    
    try {
      // Get the screenshot directly since we know camera is ready
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        toast({
          title: "Error",
          description: "Failed to capture image. Please try again.",
          variant: "destructive",
        });
        setIsCapturing(false);
        return;
      }
      
      console.log("Image captured successfully");
      
      // Pass image data to parent component
      onImageCaptured(imageSrc);
      
      // Navigate to processing page
      navigate('/processing');
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Capture Failed",
        description: "There was a problem capturing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  }, [webcamRef, navigate, onImageCaptured, toast, isCapturing, hasInitialized]);
  
  // Continue to processing with the current camera view (without capturing a new image)
  const handleContinue = useCallback(() => {
    // Only proceed if camera is ready and fully initialized
    if (!isCameraReady || isCapturing) return;
    
    // If the camera hasn't finished initializing and we need to take a picture, show a message
    if (!hasInitialized && captureCount === 0) {
      toast({
        title: "Camera Initializing",
        description: "Please wait a moment for the camera to fully initialize.",
        duration: 3000,
      });
      return;
    }
    
    // If we already have images captured, just go to results
    if (captureCount > 0) {
      navigate('/results');
    } else {
      // Otherwise, capture an image first
      captureImage();
    }
  }, [isCameraReady, isCapturing, captureCount, navigate, captureImage, hasInitialized, toast]);

  // Configure webcam
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  return (
    <>
      <Header title="Scan Items" />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Scan Your Items</h2>
              <p className="text-gray-600">Point camera at your fridge or cabinet contents</p>
            </div>
            {captureCount > 0 && (
              <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {captureCount} {captureCount === 1 ? 'photo' : 'photos'} taken
              </div>
            )}
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '4/3' }}>
            {!cameraError ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                  mirrored={false}
                />
                
                {isCameraReady && (
                  <>
                    {/* Camera guides */}
                    <div className="absolute inset-0 border-2 border-dashed border-white/40 m-6 rounded-lg pointer-events-none"></div>
                    
                    {/* Scanline animation */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-[scan_2s_infinite]"></div>
                    
                    {/* Camera initialization status */}
                    {!hasInitialized && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center">
                          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-white text-sm font-medium">Initializing camera...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Camera button */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <Button 
                        onClick={captureImage}
                        size="roundedIcon" 
                        className={`bg-white text-primary shadow-lg p-0 ${!hasInitialized ? 'opacity-50' : ''}`}
                        disabled={!hasInitialized}
                      >
                        <div className="bg-primary rounded-full w-12 h-12"></div>
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Camera Error</h3>
                <p className="text-gray-300 text-sm">{cameraError}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">Tips for better results</h4>
              <ul className="text-sm text-blue-700 mt-1 list-disc pl-4">
                <li>Ensure good lighting</li>
                <li>Capture multiple items in one shot</li>
                <li>Keep cabinet/fridge door fully open</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContinue}
              className={`flex-1 ${!hasInitialized && captureCount === 0 ? 'opacity-80' : ''}`}
              disabled={!isCameraReady || (!hasInitialized && captureCount === 0)}
            >
              {!isCameraReady 
                ? "Waiting for camera..." 
                : !hasInitialized && captureCount === 0
                  ? "Initializing..." 
                  : captureCount > 0 
                    ? "Continue to Results" 
                    : "Continue"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
