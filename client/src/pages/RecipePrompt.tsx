import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Check, ChefHat, ShoppingBasket } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { capitalizeWords } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function RecipePrompt() {
  const [, navigate] = useLocation();
  const inventory = useInventory();
  const inventoryItems = Array.isArray(inventory.inventoryItems) ? inventory.inventoryItems : [];
  const isLoading = inventory.isLoading;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Filter inventory items based on search term
  const filteredItems = Array.isArray(inventoryItems) 
    ? inventoryItems.filter((item: any) => 
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Handle ingredient toggle selection
  const toggleIngredientSelection = (ingredient: string) => {
    setSelectedIngredients(prev => {
      // If ingredient is already selected, remove it
      if (prev.includes(ingredient)) {
        return prev.filter(item => item !== ingredient);
      }
      // Otherwise, add it to the selected list
      return [...prev, ingredient];
    });
  };
  
  // Navigate to recipe generation with selected ingredients
  const handleGenerateRecipes = () => {
    if (selectedIngredients.length === 0) {
      // No ingredients selected, just go to standard recipe page
      navigate('/auto-recipes');
      return;
    }
    
    // Encode multiple ingredients in the URL
    const queryString = selectedIngredients
      .map(ingredient => `ingredient=${encodeURIComponent(ingredient)}`)
      .join('&');
    
    // Navigate to the auto-recipes page with the chosen ingredients
    navigate(`/auto-recipes?${queryString}`);
    
    const ingredientText = selectedIngredients.length === 1 
      ? capitalizeWords(selectedIngredients[0])
      : `${selectedIngredients.length} ingredients`;
    
    toast({
      title: `Focusing on ${ingredientText}`,
      description: "Generating recipes that feature your selected ingredients",
      duration: 3000,
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedIngredients([]);
  };
  
  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28 bg-gradient-to-b from-teal-50 to-white">
        {/* Fixed Header with gradient background */}
        <header className="sticky top-0 z-10 px-5 pt-5 pb-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-b-xl shadow-sm mb-5">
          <div className="flex items-center mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 -ml-2 text-white hover:bg-white/20" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Create Your Recipe</h1>
          </div>
          <p className="text-white/90 text-sm mb-4">
            Select the ingredients you'd like to feature in your recipes
          </p>
          
          {/* Search with enhanced styling */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search your inventory..."
              className="pl-9 pr-4 py-2 bg-white rounded-xl border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>
        
        {/* Selected ingredients badges */}
        {selectedIngredients.length > 0 && (
          <div className="px-5 mb-4 sticky top-[105px] z-10 bg-gradient-to-b from-teal-50 to-teal-50/90 pt-2 pb-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-gray-700">Selected Ingredients ({selectedIngredients.length})</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-gray-500 hover:text-gray-700"
                onClick={clearSelections}
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline"
                  className="px-3 py-1 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 cursor-pointer"
                  onClick={() => toggleIngredientSelection(ingredient)}
                >
                  {capitalizeWords(ingredient)}
                  <span className="ml-1.5 text-teal-500">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="px-5">
            <div className="flex flex-col gap-3">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty inventory state */}
        {!isLoading && (!inventoryItems || inventoryItems.length === 0) && (
          <div className="px-5 py-8">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <ShoppingBasket className="h-8 w-8 text-teal-500" />
              </div>
              <h2 className="text-lg font-medium mb-2">Your inventory is empty</h2>
              <p className="text-gray-500 mb-4">Add some items to your inventory first</p>
              <Button 
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => navigate('/camera')}
              >
                Scan Items Now
              </Button>
            </div>
          </div>
        )}
        
        {/* No search results */}
        {!isLoading && inventoryItems && inventoryItems.length > 0 && filteredItems.length === 0 && (
          <div className="px-5 py-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <p className="text-gray-500">No matching ingredients found</p>
            </div>
          </div>
        )}
        
        {/* Inventory items grid with cards - better organized by location */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="px-5">
            {/* Group items by location */}
            {(() => {
              // Get unique locations from filtered items
              const locationSet = new Set<string>();
              filteredItems.forEach(item => locationSet.add(item.location));
              const locations = Array.from(locationSet);
              
              return locations.map(location => {
                const locationItems = filteredItems.filter(item => item.location === location);
                return (
                  <div key={location} className="mb-6">
                    <div className="flex items-center mb-3">
                      <h2 className="text-base font-semibold text-gray-800">
                        {location === "Fridge" ? "Refrigerated Items" : "Pantry Items"}
                      </h2>
                      <span className="ml-2 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full">
                        {locationItems.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {locationItems.map((item: any) => {
                        const isSelected = selectedIngredients.includes(item.name.toLowerCase());
                        return (
                          <div 
                            key={item.id}
                            className={`bg-white p-3 rounded-xl shadow-sm border transition-all ${
                              isSelected ? 'border-teal-500 bg-teal-50/60' : 'border-gray-100 hover:border-gray-200'
                            } cursor-pointer`}
                            onClick={() => toggleIngredientSelection(item.name.toLowerCase())}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-sm line-clamp-1">{capitalizeWords(item.name)}</h3>
                              {isSelected && (
                                <div className="h-5 w-5 rounded-full flex-shrink-0 bg-teal-500 flex items-center justify-center text-white">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="text-teal-600 opacity-70 line-clamp-1">
                                {item.quantity && `${item.quantity} ${item.unit || ''}`}
                              </span>
                              <span className="ml-auto text-[10px] text-gray-400">
                                {location}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
        
        {/* Generate recipes button (fixed at bottom) */}
        <div className="fixed bottom-20 inset-x-0 px-5 py-3 bg-gradient-to-t from-white via-white to-transparent">
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 shadow-md py-6 flex items-center justify-center gap-2"
            onClick={handleGenerateRecipes}
          >
            <ChefHat className="h-5 w-5" />
            {selectedIngredients.length > 0 
              ? `Create Recipes with ${selectedIngredients.length} Selected Ingredients` 
              : "Create Recipes with Any Ingredients"}
          </Button>
        </div>
      </div>
      
      <Navigation activePage="recipes" />
    </>
  );
}