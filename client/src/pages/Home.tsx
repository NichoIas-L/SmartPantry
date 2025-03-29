import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, Clock, ChevronRight, ShoppingCart, ChefHat } from "lucide-react";

import InventoryItem from "@/components/InventoryItem";
import Navigation from "@/components/Navigation";
import FloatingActionButton from "@/components/FloatingActionButton";
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from inventory",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-16 bg-gray-50">
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
                className="flex-shrink-0 w-64 h-36 bg-teal-400 rounded-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 pattern-dots-lg text-white/20"></div>
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
          <div className="flex gap-3">
            <Button 
              onClick={() => handleFilterChange(null)}
              className="flex-1 rounded-full bg-teal-400 hover:bg-teal-500 text-white"
            >
              All Items
            </Button>
            <Button 
              onClick={() => handleFilterChange("Fridge")}
              className="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Fridge
            </Button>
            <Button 
              onClick={() => handleFilterChange("Cabinet")}
              className="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cabinet
            </Button>
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
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
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
                <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="h-32 bg-gray-200 relative">
                    {recipe.image && (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button className="absolute top-2 right-2 bg-white rounded-full p-1.5">
                      <Heart className="h-4 w-4 text-gray-500" />
                    </button>
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-16 inset-x-0 flex justify-center z-20">
        <Button
          className="rounded-full h-14 w-14 bg-gray-900 hover:bg-gray-800 shadow-lg flex items-center justify-center"
          onClick={() => navigate('/recipes')}
        >
          <ChefHat className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      {/* Camera Button */}
      <FloatingActionButton
        onClick={() => {
          if (onStartNewSession) {
            onStartNewSession();
          }
          navigate('/camera');
        }}
      />

      {/* Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="max-w-md">
          <h2 className="text-xl font-semibold mb-4">
            {filterLocation ? `${filterLocation} Items` : 'All Items'}
          </h2>
          
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
