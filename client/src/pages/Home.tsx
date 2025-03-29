import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, Clock, ChevronRight, ShoppingCart, ChefHat } from "lucide-react";

import InventoryItem from "@/components/InventoryItem";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { capitalizeWords } from "@/lib/utils";

interface Recipe {
  id: number;
  title: string;
  chef: string;
  chefImage: string;
  duration: string;
  image?: string;
  calories?: number;
  cookTime?: string;
}

interface HomeProps {
  onStartNewSession?: () => void;
}

export default function Home({ onStartNewSession }: HomeProps) {
  const [, navigate] = useLocation();
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const { toast } = useToast();
  
  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Sample featured recipes
  const featuredRecipes: Recipe[] = [
    {
      id: 1,
      title: "Asian white noodle with extra seafood",
      chef: "James Spader",
      chefImage: "https://randomuser.me/api/portraits/men/32.jpg",
      duration: "20 Min"
    },
    {
      id: 2,
      title: "Healthy salad with fresh vegetables",
      chef: "Olivia Chen",
      chefImage: "https://randomuser.me/api/portraits/women/44.jpg",
      duration: "15 Min"
    }
  ];

  // Sample past recipes (empty initially)
  const pastRecipes: Recipe[] = [];

  // Fetch inventory items with optional location filter
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ['/api/inventory', filterLocation],
    queryFn: async ({ queryKey }) => {
      const location = queryKey[1];
      const url = location ? `/api/inventory?location=${location}` : '/api/inventory';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch inventory items');
      return response.json();
    }
  });

  // Handle filter change
  const handleFilterChange = (location: string | null) => {
    setFilterLocation(location);
    setShowInventoryDialog(true);
  };

  // Handle delete item
  const handleDeleteItem = async (id: number) => {
    try {
      await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your inventory",
        variant: "default",
      });
      
      // Invalidate inventory query to refresh data
      const queryClient = (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.getClientState();
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['/api/inventory', filterLocation] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from inventory",
        variant: "destructive",
      });
    }
  };
  
  // Handle edit item
  const handleEditItem = async (id: number, updates: { quantity?: string, unit?: string }) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      toast({
        title: "Item updated",
        description: "The item has been updated in your inventory",
        variant: "default",
      });
      
      // Invalidate inventory query to refresh data
      const queryClient = (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.getClientState();
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['/api/inventory', filterLocation] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
        {/* Header section */}
        <header className="px-5 pt-5 pb-3">
          <div className="flex items-center text-gray-400 mb-1.5">
            <span className="mr-2">☀️</span>
            <span>{getGreeting()}</span>
            <div className="ml-auto">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Alena Sabyan</h1>
        </header>

        {/* Featured section */}
        <section className="px-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Featured</h2>
            <Button 
              variant="link" 
              className="text-teal-500 font-medium text-sm px-0 hover:no-underline"
              onClick={() => navigate('/recipes')}
            >
              See All
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {featuredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="flex-shrink-0 w-64 h-36 bg-teal-400 rounded-xl relative overflow-hidden shadow-sm"
                onClick={() => navigate('/recipes')}
                style={{ cursor: 'pointer' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:10px_10px]"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h3 className="font-medium text-sm leading-tight mb-2">{recipe.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden mr-1.5">
                        <img src={recipe.chefImage} alt={recipe.chef} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs">{recipe.chef}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      <span>{recipe.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category section */}
        <section className="px-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Category</h2>
            <Button 
              variant="link" 
              className="text-teal-500 font-medium text-sm px-0 hover:no-underline"
            >
              See All
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div 
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm"
              onClick={() => handleFilterChange(null)}
              style={{ cursor: 'pointer' }}
            >
              <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                <ShoppingCart className="h-6 w-6 text-teal-500" />
              </div>
              <span className="text-sm font-medium">All Items</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm"
              onClick={() => handleFilterChange("Fridge")}
              style={{ cursor: 'pointer' }}
            >
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="4" y1="10" x2="20" y2="10" />
                </svg>
              </div>
              <span className="text-sm font-medium">Fridge</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm"
              onClick={() => handleFilterChange("Cabinet")}
              style={{ cursor: 'pointer' }}
            >
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="9" x2="9" y2="21" />
                  <line x1="15" y1="9" x2="15" y2="21" />
                </svg>
              </div>
              <span className="text-sm font-medium">Cabinet</span>
            </div>
          </div>
        </section>

        {/* Cook with My Ingredients section */}
        <section className="px-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Cook with My Ingredients</h2>
            <Button 
              variant="link" 
              className="text-teal-500 font-medium text-sm px-0 hover:no-underline"
              onClick={() => navigate('/recipe-prompt')}
            >
              See All
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-5 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30" />
            <div className="flex items-start">
              <div className="mr-4 bg-white/20 backdrop-blur-sm rounded-full p-3">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">Smart Recipe Generator</h3>
                <p className="text-white/90 text-sm mb-3">
                  Get recipes made <span className="font-bold underline">exclusively</span> from ingredients in your inventory.
                </p>
                <Button 
                  className="bg-white text-teal-600 hover:bg-white/90"
                  onClick={() => navigate('/recipe-prompt')}
                >
                  Generate Recipes
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Past Recipes section */}
        <section className="px-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Past Recipes</h2>
            <Button 
              variant="link" 
              className="text-teal-500 font-medium text-sm px-0 hover:no-underline"
              onClick={() => navigate('/recipes')}
            >
              See All
            </Button>
          </div>
          
          {pastRecipes.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">You haven't saved any recipes yet</p>
              <Button 
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => navigate('/recipes')}
              >
                Explore Recipes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {pastRecipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                  onClick={() => navigate('/recipes')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="aspect-square bg-gray-200 relative">
                    {recipe.image && (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5">
                      <Heart className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{recipe.title}</h3>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      {recipe.calories && (
                        <div className="flex items-center">
                          <span>{recipe.calories} Kcal</span>
                        </div>
                      )}
                      {recipe.cookTime && (
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>{recipe.cookTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Primary Action Button */}
      <div className="fixed bottom-24 right-5 z-20">
        <Button
          className="rounded-full h-14 w-14 bg-teal-500 hover:bg-teal-600 shadow-lg flex items-center justify-center"
          onClick={() => {
            if (onStartNewSession) {
              onStartNewSession();
            }
            navigate('/camera');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </Button>
      </div>

      {/* Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="max-w-md" aria-labelledby="dialog-title">
          <div className="text-xl font-semibold mb-4" id="dialog-title">
            {filterLocation ? `${filterLocation} Items` : 'All Items'}
          </div>
          
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : inventoryItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No items found</p>
              <Button 
                onClick={() => {
                  if (onStartNewSession) {
                    onStartNewSession();
                  }
                  navigate('/camera');
                  setShowInventoryDialog(false);
                }}
              >
                Scan Items Now
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {inventoryItems.map((item: any) => (
                <InventoryItem 
                  key={item.id}
                  item={item}
                  onDelete={() => handleDeleteItem(item.id)}
                  onEdit={(id, updates) => handleEditItem(id, updates)}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Navigation activePage="home" />
    </>
  );
}
