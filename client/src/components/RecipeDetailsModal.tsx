import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Flame, Share2, ChefHat, ArrowRight, Check } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";

interface RecipeDetailsModalProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    usedInventoryItems: string[];
    cookTime: string;
    calories: number;
    image: string;
    isFavorite: boolean;
    // Additional nutritional info fields
    nutrition?: {
      protein?: number;
      fat?: number;
      carbs?: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
    };
    // Preparation steps
    steps?: string[];
  };
  focusIngredient?: string | null;
  // Control for external open/close (optional)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function RecipeDetailsModal({ 
  recipe, 
  focusIngredient,
  open,
  onOpenChange
}: RecipeDetailsModalProps) {
  // Use external state if provided, otherwise use internal state
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
  
  // Extract nutrition info with defaults
  const nutrition = recipe.nutrition || {
    protein: Math.round(recipe.calories * 0.2 / 4),  // Estimate: 20% of calories from protein
    fat: Math.round(recipe.calories * 0.3 / 9),      // Estimate: 30% of calories from fat
    carbs: Math.round(recipe.calories * 0.5 / 4),    // Estimate: 50% of calories from carbs
    fiber: Math.round(recipe.calories * 0.05 / 2),   // Rough estimate for fiber
    sugar: Math.round(recipe.calories * 0.1 / 4),    // Rough estimate for sugar
    sodium: Math.round(recipe.calories * 0.5)        // Rough estimate for sodium (mg)
  };

  // Generate placeholder steps if none provided
  const steps = recipe.steps || [
    `Prepare all ingredients for ${recipe.title}.`,
    "Combine main ingredients in a large bowl.",
    "Cook according to preference, ensuring proper temperatures.",
    "Plate and serve with garnish if desired."
  ];

  // Handle favorite toggling
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here we'd typically update the server data
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Show Dialog trigger only for internal use case, not when externally controlled */}
      {open === undefined && (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full bg-white hover:bg-gray-50 shadow-sm border text-gray-800"
          >
            View Full Recipe
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white">
        <DialogHeader className="p-0">
          <div className="relative w-full h-48 sm:h-64 overflow-hidden">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <DialogTitle className="text-2xl font-bold mb-1">
                  {recipe.title}
                </DialogTitle>
                <DialogDescription className="text-white/90 text-sm">
                  {recipe.description}
                </DialogDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              className="absolute top-4 right-4 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="p-6 max-h-[calc(90vh-16rem)]">
          {/* Recipe metrics */}
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Flame className="h-4 w-4 text-rose-500" />
              <span>{recipe.calories} calories</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <ChefHat className="h-4 w-4 text-gray-500" />
              <span>Easy</span>
            </div>
          </div>
          
          {/* Nutritional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Nutritional Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{nutrition.protein}g</div>
                <div className="text-xs text-gray-500">Protein</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{nutrition.fat}g</div>
                <div className="text-xs text-gray-500">Fat</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{nutrition.carbs}g</div>
                <div className="text-xs text-gray-500">Carbs</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{nutrition.fiber}g</div>
                <div className="text-xs text-gray-500">Fiber</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{nutrition.sugar}g</div>
                <div className="text-xs text-gray-500">Sugar</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{nutrition.sodium}mg</div>
                <div className="text-xs text-gray-500">Sodium</div>
              </div>
            </div>
          </div>
          
          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, i) => {
                // Check if this is a focused ingredient
                const isFocusedIngredient = focusIngredient && 
                  focusIngredient.split(',').some(focusItem => 
                    ingredient.toLowerCase().includes(focusItem.trim().toLowerCase())
                  );
                
                // Check if this is a standard inventory item  
                const isInventoryItem = recipe.usedInventoryItems.some(item => 
                  ingredient.toLowerCase().includes(item.toLowerCase())
                );
                
                return (
                  <div 
                    key={i}
                    className={`p-3 rounded-lg flex items-center ${
                      isFocusedIngredient
                        ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <Check className="h-4 w-4 mr-2 flex-shrink-0 text-teal-500" />
                    <span>{ingredient}</span>
                    {isFocusedIngredient && (
                      <Badge variant="outline" className="ml-auto text-[10px] bg-teal-50">
                        Featured
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Preparation Steps */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Preparation</h3>
            <ol className="space-y-4 ml-5">
              {steps.map((step, index) => (
                <li key={index} className="list-decimal">
                  <div className="font-medium mb-1">Step {index + 1}</div>
                  <p className="text-gray-600">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </ScrollArea>
        
        <DialogFooter className="bg-gray-50 p-4">
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
              Start Cooking <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}