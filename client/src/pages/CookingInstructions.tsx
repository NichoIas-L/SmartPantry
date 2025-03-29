import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Bookmark, ChefHat, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface CookingInstructionsProps {
  location?: {
    recipe?: {
      id: string;
      title: string;
      image: string;
      description: string;
      youtubeVideoId?: string;
      steps?: string[];
    }
  }
}

export default function CookingInstructions() {
  const [, navigate] = useLocation();
  const [instructionType, setInstructionType] = useState<'video' | 'guide' | null>(null);
  
  // In a real implementation, we would get this data from location state or a query parameter
  // This is mocked for the demo
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('recipeId');
  const recipeTitle = urlParams.get('title') || "Delicious Recipe";
  const recipeImage = urlParams.get('image') || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  const recipeDescription = urlParams.get('description') || "A delicious recipe made with your available ingredients.";
  const youtubeVideoId = urlParams.get('videoId') || "";
  
  // Decode steps from URL or use default steps
  let steps: string[] = [];
  try {
    const encodedSteps = urlParams.get('steps');
    if (encodedSteps) {
      steps = JSON.parse(decodeURIComponent(encodedSteps));
    }
  } catch (error) {
    console.error("Error parsing steps:", error);
    steps = [
      "Prepare all ingredients by washing and chopping as needed.",
      "Heat oil in a large pan over medium heat.",
      "Add ingredients according to recipe requirements and cook until done.",
      "Serve hot and enjoy your delicious meal!"
    ];
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-20 bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-5 py-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 -ml-2" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Cooking Instructions</h1>
          </div>
        </header>

        {/* Recipe Hero */}
        <div className="relative w-full h-48 overflow-hidden">
          <img 
            src={recipeImage} 
            alt={recipeTitle}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {recipeTitle}
              </h2>
              <p className="text-white/90 text-sm">
                {recipeDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Selection Options */}
        {!instructionType && (
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-4">How would you like to cook?</h3>
            
            <div className="grid gap-4">
              {/* YouTube Video Option */}
              <div 
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setInstructionType('video')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">Watch Video Tutorial</h4>
                    <p className="text-gray-500 text-sm">Learn by watching a professional cook prepare this recipe step by step</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Guided Instructions Option */}
              <div 
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setInstructionType('guide')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChefHat className="h-6 w-6 text-teal-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">Step-by-Step Guide</h4>
                    <p className="text-gray-500 text-sm">Follow our detailed instructions at your own pace</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Video */}
        {instructionType === 'video' && youtubeVideoId && (
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-4">Video Tutorial</h3>
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm mb-6">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`${recipeTitle} Video Tutorial`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setInstructionType(null)}
            >
              Back to Options
            </Button>
          </div>
        )}

        {/* Step by Step Guide */}
        {instructionType === 'guide' && (
          <div className="p-5">
            <h3 className="text-lg font-semibold mb-4">Step-by-Step Guide</h3>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${index < steps.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Step {index + 1}</h4>
                      <p className="text-gray-600">{step}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setInstructionType(null)}
            >
              Back to Options
            </Button>
          </div>
        )}

        {/* Save Recipe Button */}
        <div className="fixed bottom-20 inset-x-0 px-5 py-3 bg-gradient-to-t from-white via-white to-transparent">
          <Button
            variant="outline"
            className="w-full border-teal-200 flex items-center justify-center gap-2"
            onClick={() => {
              // In a real app, this would save the recipe to favorites
              alert("Recipe saved to favorites!");
            }}
          >
            <Bookmark className="h-5 w-5" />
            Save This Recipe
          </Button>
        </div>
      </div>
      
      <Navigation activePage="recipes" />
    </>
  );
}