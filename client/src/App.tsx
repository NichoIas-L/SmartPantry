import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Camera from "@/pages/Camera";
import Processing from "@/pages/Processing";
import Results from "@/pages/Results";
import { useState } from "react";

function Router() {
  // State for recognized items and selected location to pass between pages
  const [recognizedItems, setRecognizedItems] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("Fridge");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/camera">
        <Camera 
          onImageCaptured={(imageData) => {
            setCapturedImage(imageData);
          }}
        />
      </Route>
      <Route path="/processing">
        <Processing 
          imageData={capturedImage}
          onRecognitionComplete={(items) => {
            setRecognizedItems(items);
          }}
        />
      </Route>
      <Route path="/results">
        <Results 
          recognizedItems={recognizedItems}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
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
