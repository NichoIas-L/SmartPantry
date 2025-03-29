import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { capitalizeWords } from '@/lib/utils';
import Anthropic from '@anthropic-ai/sdk';

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

export default function RecipeSuggestions() {
  const [, navigate] = useLocation();
  const inventory = useInventory();
  const inventoryItems = inventory.inventoryItems || [];
  const isLoading = inventory.isLoading;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const { toast } = useToast();

  // Filter inventory items based on search term
  const filteredInventoryItems = Array.isArray(inventoryItems) 
    ? inventoryItems.filter((item: any) => 
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Toggle selection of an inventory item
  const toggleItemSelection = (itemName: string) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Generate recipe suggestions based on selected items
  const generateRecipeSuggestions = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item from your inventory.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // In a real app, we would call our backend API
      // But for demo purposes, we'll simulate a response
      const response = await fetch('/api/recipe-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: selectedItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe suggestions');
      }

      const result = await response.json();
      setSuggestedRecipes(result);
    } catch (error) {
      console.error('Error generating recipes:', error);
      // Fallback to generate recipes client-side using mock data
      // In a real app, this would be handled by the server
      simulateRecipeGeneration();
    } finally {
      setIsGenerating(false);
    }
  };

  // This is a fallback function for demo purposes
  // In a real app, recipe suggestions would come from the server
  const simulateRecipeGeneration = () => {
    // Generate some mock recipes based on selected items
    const mockRecipes: SuggestedRecipe[] = [
      {
        id: '1',
        title: 'Quick Veggie Stir Fry',
        description: 'A simple and delicious stir fry with vegetables and sauce.',
        ingredients: [...selectedItems, 'soy sauce', 'garlic', 'vegetable oil'],
        usedInventoryItems: selectedItems,
        cookTime: '15 min',
        calories: 320,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
        isFavorite: false
      },
      {
        id: '2',
        title: 'Simple Garden Salad',
        description: 'Fresh garden salad with a light vinaigrette dressing.',
        ingredients: [...selectedItems, 'olive oil', 'vinegar', 'salt', 'pepper'],
        usedInventoryItems: selectedItems,
        cookTime: '10 min',
        calories: 180,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2384&q=80',
        isFavorite: false
      }
    ];
    
    setSuggestedRecipes(mockRecipes);
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
              onClick={() => navigate('/recipes')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Recipe Suggestions</h1>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search inventory items"
              className="pl-4 pr-4 py-2 bg-white rounded-xl border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Selected items section */}
        <section className="px-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Selected Items ({selectedItems.length})</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-500 hover:text-teal-600 p-0"
              onClick={() => setSelectedItems([])}
            >
              Clear All
            </Button>
          </div>
          
          {selectedItems.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedItems.map(item => (
                <div 
                  key={item}
                  className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <span>{capitalizeWords(item)}</span>
                  <button 
                    className="ml-2 text-teal-600 hover:text-teal-800"
                    onClick={() => toggleItemSelection(item)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-3">Select ingredients from your inventory</p>
          )}
          
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600"
            onClick={generateRecipeSuggestions}
            disabled={selectedItems.length === 0 || isGenerating}
          >
            {isGenerating ? 'Generating Suggestions...' : 'Find Recipes'}
          </Button>
        </section>

        {/* Inventory items section */}
        <section className="px-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Your Inventory</h2>
          
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredInventoryItems.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-500">No items found in your inventory</p>
              <Button 
                className="mt-4 bg-teal-500 hover:bg-teal-600"
                onClick={() => navigate('/camera')}
              >
                Scan Items Now
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl divide-y divide-gray-100">
              {filteredInventoryItems.map((item: any) => (
                <div 
                  key={item.id}
                  className="flex items-center p-3"
                >
                  <Checkbox 
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.name.toLowerCase())}
                    onCheckedChange={() => toggleItemSelection(item.name.toLowerCase())}
                    className="mr-3"
                  />
                  <label 
                    htmlFor={`item-${item.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {capitalizeWords(item.name)}
                    <div className="text-xs text-gray-500">
                      Location: {item.location}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Suggested recipes section */}
        {suggestedRecipes.length > 0 && (
          <section className="px-5 mb-6">
            <h2 className="text-lg font-semibold mb-3">Suggested Recipes</h2>
            
            <div className="grid gap-4">
              {suggestedRecipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-video bg-gray-200 relative">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full h-8 w-8 p-1.5 ${
                        recipe.isFavorite ? 'text-red-500' : 'text-gray-500'
                      }`}
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart className="h-full w-full" fill={recipe.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-base mb-1">{recipe.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <div>{recipe.calories} Kcal</div>
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{recipe.cookTime}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Ingredients:</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.map((ingredient, i) => (
                          <span 
                            key={i} 
                            className={`text-xs px-2 py-1 rounded-full ${
                              recipe.usedInventoryItems.includes(ingredient.toLowerCase())
                                ? 'bg-teal-100 text-teal-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {capitalizeWords(ingredient)}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-teal-500 hover:bg-teal-600"
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