import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { capitalizeWords } from '@/lib/utils';

export default function RecipePrompt() {
  const [, navigate] = useLocation();
  const inventory = useInventory();
  const inventoryItems = Array.isArray(inventory.inventoryItems) ? inventory.inventoryItems : [];
  const isLoading = inventory.isLoading;
  const [searchTerm, setSearchTerm] = useState('');
  const [chosenIngredient, setChosenIngredient] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Filter inventory items based on search term
  const filteredItems = Array.isArray(inventoryItems) 
    ? inventoryItems.filter((item: any) => 
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Handle ingredient selection
  const handleSelectIngredient = (ingredient: string) => {
    setChosenIngredient(ingredient);
    
    // Navigate to the auto-recipes page with the chosen ingredient
    navigate(`/auto-recipes?ingredient=${encodeURIComponent(ingredient)}`);
    
    toast({
      title: `Focusing on ${capitalizeWords(ingredient)}`,
      description: "Generating recipes that include this ingredient",
      duration: 3000,
    });
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
            <h1 className="text-xl font-bold">Choose an Ingredient</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Select an ingredient you'd like to use in your recipes
          </p>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search your inventory..."
              className="pl-9 pr-4 py-2 bg-white rounded-xl border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>
        
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
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
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
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-500">No matching ingredients found</p>
            </div>
          </div>
        )}
        
        {/* Inventory items list */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="px-5">
            <h2 className="text-lg font-semibold mb-3">Your Ingredients</h2>
            <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
              {filteredItems.map((item: any) => (
                <div 
                  key={item.id}
                  className="p-4 flex items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectIngredient(item.name.toLowerCase())}
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{capitalizeWords(item.name)}</h3>
                    <div className="flex text-xs text-gray-500 mt-1">
                      <span className="mr-3">Location: {item.location}</span>
                      {item.quantity && (
                        <span>Quantity: {item.quantity} {item.unit || ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 text-teal-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Skip option - use all ingredients */}
        <div className="px-5 mt-6">
          <Button
            variant="outline"
            className="w-full border-dashed border-teal-300 text-teal-600"
            onClick={() => navigate('/auto-recipes')}
          >
            Skip – Find recipes using all ingredients
          </Button>
        </div>
      </div>
      
      <Navigation activePage="recipes" />
    </>
  );
}