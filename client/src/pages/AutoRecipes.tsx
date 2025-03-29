import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Heart, RefreshCw } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { capitalizeWords } from '@/lib/utils';

interface SuggestedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  usedInventoryItems: string[];
  cookTime: string;
  calories: number;
  image: string;
  isFavorite: boolean;
}

export default function AutoRecipes() {
  const [, navigate] = useLocation();
  const inventory = useInventory();
  const inventoryItems = Array.isArray(inventory.inventoryItems) ? inventory.inventoryItems : [];
  const isLoading = inventory.isLoading;
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const { toast } = useToast();

  // Generate recipes when the page loads or inventory changes
  useEffect(() => {
    if (!isLoading && inventoryItems.length > 0) {
      generateRecipes();
    }
  }, [isLoading]);

  // Generate recipe suggestions using ONLY inventory items
  const generateRecipes = async () => {
    if (inventoryItems.length === 0) {
      toast({
        title: "No ingredients available",
        description: "Your inventory is empty. Add some items first!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Extract all ingredient names from inventory items
      const ingredients = inventoryItems.map((item: any) => item.name.toLowerCase());
      
      toast({
        title: "Finding recipes",
        description: "Generating recipes using ONLY ingredients from your inventory",
        duration: 4000,
      });
      
      // Call the backend API
      const response = await fetch('/api/recipe-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe suggestions');
      }

      const result = await response.json();
      setSuggestedRecipes(result);
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast({
        title: "Error generating recipes",
        description: "Couldn't generate recipes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle favorite status of a recipe
  const toggleFavorite = (recipeId: string) => {
    setSuggestedRecipes(recipes => 
      recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite } 
          : recipe
      )
    );
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
        {/* Header */}
        <header className="px-5 pt-5 pb-3">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 -ml-2" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Cook With My Ingredients</h1>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={generateRecipes}
                disabled={isGenerating || inventoryItems.length === 0}
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            <span className="text-teal-600">✓</span> Recipes use <span className="underline">exclusively</span> what's in your inventory
          </p>
        </header>

        {/* Inventory summary */}
        <section className="px-5 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-base font-medium mb-2">Your Ingredients</h2>
            <div className="flex flex-wrap gap-1.5">
              {isLoading ? (
                <div className="w-full h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : inventoryItems.length === 0 ? (
                <p className="text-sm text-gray-500">No items in your inventory</p>
              ) : (
                inventoryItems.slice(0, 8).map((item: any, index: number) => (
                  <span 
                    key={item.id}
                    className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-800"
                  >
                    {capitalizeWords(item.name)}
                  </span>
                ))
              )}
              {inventoryItems.length > 8 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  +{inventoryItems.length - 8} more
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Loading state */}
        {isGenerating && (
          <section className="px-5 mb-6">
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-10 w-10 text-teal-500 animate-spin mb-4" />
                <h2 className="text-lg font-medium mb-2">Cooking up ideas...</h2>
                <p className="text-gray-500">Finding recipes using <span className="font-medium">only</span> your available ingredients</p>
              </div>
            </div>
          </section>
        )}

        {/* Empty inventory state */}
        {!isGenerating && inventoryItems.length === 0 && (
          <section className="px-5 mb-6">
            <div className="bg-white rounded-xl p-8 text-center">
              <h2 className="text-lg font-medium mb-2">No ingredients found</h2>
              <p className="text-gray-500 mb-4">Add some ingredients to your inventory first</p>
              <Button 
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => navigate('/camera')}
              >
                Scan Items Now
              </Button>
            </div>
          </section>
        )}

        {/* Suggested recipes section */}
        {!isGenerating && suggestedRecipes.length > 0 && (
          <section className="px-5 mb-6">
            <h2 className="text-lg font-semibold mb-3">Recipe Suggestions</h2>
            
            {/* Inventory-only constraint banner */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4 flex items-start">
              <div className="bg-teal-500 text-white p-1 rounded-full mr-3 mt-0.5">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-teal-800">Inventory-Only Recipes</h3>
                <p className="text-xs text-teal-700">These recipes use <span className="font-semibold">exclusively</span> ingredients from your inventory, respecting available quantities.</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {suggestedRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="aspect-video bg-gray-200 relative">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1470&auto=format&fit=crop`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-semibold text-lg text-white mb-1 drop-shadow-sm">{recipe.title}</h3>
                      <div className="flex items-center text-xs text-white/90">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{recipe.cookTime}</span>
                        <div className="mx-2">•</div>
                        <span>{recipe.calories} Kcal</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full h-9 w-9 p-1.5 ${
                        recipe.isFavorite ? 'text-red-500' : 'text-gray-500'
                      }`}
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart className="h-full w-full" fill={recipe.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Ingredients:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.ingredients.map((ingredient, i) => (
                          <span 
                            key={i} 
                            className={`text-xs px-2 py-1 rounded-full ${
                              recipe.usedInventoryItems.some(item => 
                                ingredient.toLowerCase().includes(item.toLowerCase()))
                                ? 'bg-teal-100 text-teal-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-teal-500 hover:bg-teal-600 shadow-sm"
                    >
                      View Full Recipe
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Navigation activePage="recipes" />
    </>
  );
}