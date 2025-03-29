import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Heart, RefreshCw } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import RecipeDetailsModal from '@/components/RecipeDetailsModal';
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
  youtubeVideoId?: string;
}

export default function AutoRecipes() {
  const [location, navigate] = useLocation();
  const inventory = useInventory();
  const inventoryItems = Array.isArray(inventory.inventoryItems) ? inventory.inventoryItems : [];
  const isLoading = inventory.isLoading;
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const [focusIngredient, setFocusIngredient] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SuggestedRecipe | null>(null);
  
  // Recipe filter states
  const [simplicity, setSimplicity] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [maxCalories, setMaxCalories] = useState<number | null>(null);
  const [maxSugar, setMaxSugar] = useState<number | null>(null);
  const [minProtein, setMinProtein] = useState<number | null>(null);
  const [maxCarbs, setMaxCarbs] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();
  
  // Extract chosen ingredient(s) from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const ingredients = params.getAll('ingredient');
    
    if (ingredients && ingredients.length > 0) {
      // If we have multiple ingredients, join them with commas
      if (ingredients.length > 1) {
        setFocusIngredient(ingredients.join(','));
      } else {
        // Just a single ingredient
        setFocusIngredient(ingredients[0]);
      }
    } else {
      setFocusIngredient(null);
    }
  }, [location]);

  // Generate recipes when the page loads, inventory changes, or focus ingredient changes
  useEffect(() => {
    if (!isLoading && inventoryItems.length > 0) {
      generateRecipes();
    }
  }, [isLoading, focusIngredient]);

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
      
      // Create toast message based on focus ingredient
      const toastMessage = focusIngredient 
        ? `Finding recipes featuring ${capitalizeWords(focusIngredient)}`
        : "Generating recipes using ONLY ingredients from your inventory";
        
      toast({
        title: "Finding recipes",
        description: toastMessage,
        duration: 4000,
      });
      
      // Call the backend API with filter options
      const response = await fetch('/api/recipe-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ingredients,
          focusIngredient,
          filters: {
            simplicity,
            budget,
            maxCalories,
            maxSugar,
            minProtein,
            maxCarbs
          }
        }),
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
            <h1 className="text-xl font-bold">
              {focusIngredient 
                ? `Recipes with ${capitalizeWords(focusIngredient)}` 
                : "Cook With My Ingredients"}
            </h1>
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
          {/* Removing the text about recipes using exclusively inventory items as requested */}
        </header>

        {/* Inventory summary - improved scrollable design */}
        <section className="px-5 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium">Recipe Filters</h2>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                {inventoryItems.length} items
              </span>
            </div>
            
            {isLoading ? (
              <div className="w-full h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : inventoryItems.length === 0 ? (
              <p className="text-sm text-gray-500">No items in your inventory</p>
            ) : (
              <div className="w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mb-3 flex items-center justify-between"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span>Recipe Preferences {showFilters ? '(hide)' : '(show)'}</span>
                  {showFilters ? (
                    <ArrowLeft className="h-4 w-4 rotate-90" />
                  ) : (
                    <ArrowLeft className="h-4 w-4 -rotate-90" />
                  )}
                </Button>

                {showFilters && (
                  <div className="space-y-4 mt-4">
                    {/* Simplicity slider (1-10 scale) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">Simplicity</label>
                        <span className="text-xs text-gray-500">{simplicity || 'Any'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Simple</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={simplicity || 5}
                          onChange={(e) => setSimplicity(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">Complex</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-xs rounded-full"
                          onClick={() => setSimplicity(null)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    {/* Budget slider (1-5 scale) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">Budget</label>
                        <span className="text-xs text-gray-500">{budget || 'Any'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">$</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={budget || 3}
                          onChange={(e) => setBudget(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">$$$$$</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-xs rounded-full"
                          onClick={() => setBudget(null)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    {/* Nutritional preferences */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Max Calories */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Max Calories</label>
                        <div className="flex">
                          <input 
                            type="number" 
                            placeholder="Any"
                            value={maxCalories || ''}
                            onChange={(e) => setMaxCalories(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1"
                          />
                          {maxCalories && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-7 w-7 p-0 text-xs"
                              onClick={() => setMaxCalories(null)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Max Sugar */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Max Sugar (g)</label>
                        <div className="flex">
                          <input 
                            type="number" 
                            placeholder="Any"
                            value={maxSugar || ''}
                            onChange={(e) => setMaxSugar(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1"
                          />
                          {maxSugar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-7 w-7 p-0 text-xs"
                              onClick={() => setMaxSugar(null)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Min Protein */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Min Protein (g)</label>
                        <div className="flex">
                          <input 
                            type="number" 
                            placeholder="Any"
                            value={minProtein || ''}
                            onChange={(e) => setMinProtein(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1"
                          />
                          {minProtein && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-7 w-7 p-0 text-xs"
                              onClick={() => setMinProtein(null)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Max Carbs */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Max Carbs (g)</label>
                        <div className="flex">
                          <input 
                            type="number" 
                            placeholder="Any"
                            value={maxCarbs || ''}
                            onChange={(e) => setMaxCarbs(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1"
                          />
                          {maxCarbs && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-7 w-7 p-0 text-xs"
                              onClick={() => setMaxCarbs(null)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Apply filters button */}
                    <Button
                      className="w-full bg-teal-500 hover:bg-teal-600"
                      onClick={generateRecipes}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating Recipes...' : 'Generate Recipes'}
                    </Button>
                  </div>
                )}

                {/* Display focused ingredients if any */}
                {focusIngredient && (
                  <div className="mt-2">
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Featured Ingredients:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {focusIngredient.split(',').map((focusedItem, idx) => {
                        return (
                          <span 
                            key={`focus-${idx}`}
                            className="text-xs px-2.5 py-1.5 rounded-full whitespace-nowrap bg-teal-500 text-white font-medium"
                          >
                            {capitalizeWords(focusedItem.trim())}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                <h3 className="text-sm font-medium text-teal-800">
                  {focusIngredient 
                    ? (() => {
                        const ingredients = focusIngredient.split(',');
                        if (ingredients.length > 1) {
                          return `Featuring Selected Ingredients`;
                        } else {
                          return `Featuring ${capitalizeWords(focusIngredient)}`;
                        }
                      })()
                    : "Inventory-Only Recipes"}
                </h3>
                <p className="text-xs text-teal-700">
                  {focusIngredient 
                    ? (() => {
                        const ingredients = focusIngredient.split(',');
                        if (ingredients.length > 1) {
                          // Format multiple ingredients nicely
                          const formattedIngredients = ingredients.map(ing => 
                            capitalizeWords(ing.trim())
                          );
                          
                          // Join all but the last ingredient with commas
                          const firstPart = formattedIngredients.slice(0, -1).join(', ');
                          // Add the last ingredient with "and"
                          const lastPart = formattedIngredients[formattedIngredients.length - 1];
                          
                          const ingredientsList = formattedIngredients.length > 2 
                            ? `${firstPart}, and ${lastPart}`
                            : `${firstPart} and ${lastPart}`;
                            
                          return `These recipes feature ${ingredientsList} and use exclusively ingredients from your inventory.`;
                        } else {
                          return `These recipes feature ${capitalizeWords(focusIngredient)} and use exclusively ingredients from your inventory.`;
                        }
                      })()
                    : "These recipes use exclusively ingredients from your inventory, respecting available quantities."}
                </p>
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
                      <div className="flex flex-col gap-1.5">
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
                              className={`text-xs px-3 py-2 rounded-lg flex items-center ${
                                isFocusedIngredient
                                  ? 'bg-teal-500 text-white' 
                                  : isInventoryItem
                                    ? 'bg-teal-100 text-teal-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full mr-2 bg-current opacity-70"></div>
                              {ingredient}
                              {isFocusedIngredient && (
                                <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-teal-500 hover:bg-teal-600 shadow-sm"
                      onClick={() => setSelectedRecipe(recipe)}
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
      
      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <RecipeDetailsModal
          recipe={{
            id: selectedRecipe.id,
            title: selectedRecipe.title,
            description: selectedRecipe.description,
            ingredients: selectedRecipe.ingredients,
            usedInventoryItems: selectedRecipe.usedInventoryItems,
            cookTime: selectedRecipe.cookTime,
            calories: selectedRecipe.calories,
            image: selectedRecipe.image,
            isFavorite: selectedRecipe.isFavorite,
            // Use YouTube video ID from API response or fallback to undefined
            youtubeVideoId: selectedRecipe.youtubeVideoId,
            // Adding additional fields that RecipeDetailsModal expects
            nutrition: {
              protein: 25,
              fat: 15,
              carbs: 35,
              fiber: 4,
              sugar: 6,
              sodium: 400
            },
            steps: [
              "Prepare all ingredients by washing and chopping as needed.",
              "Heat oil in a large pan over medium heat.",
              "Add ingredients according to recipe requirements and cook until done.",
              "Serve hot and enjoy your delicious meal!"
            ]
          }}
          focusIngredient={focusIngredient}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedRecipe(null);
          }}
        />
      )}
    </>
  );
}