import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/Header";
import InventoryFilter from "@/components/InventoryFilter";
import InventoryItem from "@/components/InventoryItem";
import FloatingActionButton from "@/components/FloatingActionButton";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch inventory items with optional location filter
  const { data: inventoryItems = [], isLoading, isError, refetch } = useQuery({
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
      
      // Refetch inventory items
      refetch();
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
      <Header title="FridgeScan" />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Food Inventory</h2>
            <p className="text-gray-600">Track items in your fridge and cabinets</p>
          </div>

          <InventoryFilter 
            activeFilter={filterLocation}
            onFilterChange={handleFilterChange}
          />

          {isLoading ? (
            <div className="flex flex-col gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : isError ? (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex mb-4 gap-2">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <h3 className="text-lg font-bold text-gray-900">Error Loading Inventory</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  There was an error loading your inventory. Please try again.
                </p>
                <Button onClick={() => refetch()}>Retry</Button>
              </CardContent>
            </Card>
          ) : inventoryItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Your inventory is empty</h3>
              <p className="text-gray-600 mb-6">Take a photo of your fridge or cabinet to get started</p>
              <Button 
                onClick={() => navigate('/camera')}
                className="bg-primary hover:bg-blue-600"
              >
                Scan Items Now
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {inventoryItems.map((item: any) => (
                <InventoryItem 
                  key={item.id}
                  item={item}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingActionButton onClick={() => navigate('/camera')} />
      <Navigation activePage="home" />
    </>
  );
}
