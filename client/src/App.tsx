import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Camera from "@/pages/Camera";
import Processing from "@/pages/Processing";
import Results from "@/pages/Results";
import Recipes from "@/pages/Recipes";
import RecipeSuggestions from "@/pages/RecipeSuggestions";
import AutoRecipes from "@/pages/AutoRecipes";
import { useState } from "react";

function Router() {
  // State for recognized items and selected location to pass between pages
  const [recognizedItems, setRecognizedItems] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("Fridge");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [sessionItems, setSessionItems] = useState<any[]>([]);
  
  // Handle a new image capture
  const handleImageCapture = (imageData: string) => {
    setCapturedImages(prev => [...prev, imageData]);
  };
  
  // Handle recognition results from one image
  const handleRecognitionComplete = (items: any[]) => {
    // Add newly recognized items to session items
    setSessionItems(prev => {
      // Create a combined list, avoiding duplicates by name
      const names = new Set(prev.map(item => item.name.toLowerCase()));
      const newItems = items.filter(item => !names.has(item.name.toLowerCase()));
      return [...prev, ...newItems];
    });
    
    // Update recognized items with all items from the session
    setRecognizedItems(prev => {
      // Add new items from this image to the total recognized items
      const existingNames = new Set(prev.map(item => item.name.toLowerCase()));
      const uniqueNewItems = items.filter(item => !existingNames.has(item.name.toLowerCase()));
      return [...prev, ...uniqueNewItems];
    });
  };
  
  // Handle taking a new photo after processing the current one
  const handleTakeMorePhotos = () => {
    setCurrentImageIndex(capturedImages.length);
  };
  
  // Reset the session for a new scan session
  const resetSession = () => {
    setCapturedImages([]);
    setRecognizedItems([]);
    setSessionItems([]);
    setCurrentImageIndex(0);
  };
  
  return (
    <Switch>
      <Route path="/">
        <Home onStartNewSession={resetSession} />
      </Route>
      <Route path="/camera">
        <Camera 
          onImageCaptured={handleImageCapture}
          captureCount={capturedImages.length}
        />
      </Route>
      <Route path="/processing">
        <Processing 
          imageData={capturedImages[currentImageIndex] || null}
          onRecognitionComplete={handleRecognitionComplete}
          imageIndex={currentImageIndex}
          totalImages={capturedImages.length}
        />
      </Route>
      <Route path="/results">
        <Results 
          recognizedItems={recognizedItems}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          onTakeMorePhotos={handleTakeMorePhotos}
          capturedImagesCount={capturedImages.length}
        />
      </Route>
      <Route path="/recipes">
        <Recipes />
      </Route>
      <Route path="/recipe-suggestions">
        <RecipeSuggestions />
      </Route>
      <Route path="/auto-recipes">
        <AutoRecipes />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative h-screen flex flex-col bg-gray-100">
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
