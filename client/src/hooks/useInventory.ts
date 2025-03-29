import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { InventoryItem, InsertInventoryItem } from '@shared/schema';

export function useInventory() {
  // Fetch all inventory items
  const { data: inventoryItems = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/inventory'],
  });

  // Fetch inventory items by location
  const getInventoryByLocation = (location: string) => {
    return useQuery({
      queryKey: ['/api/inventory', location],
      queryFn: async () => {
        const response = await fetch(`/api/inventory?location=${location}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch inventory by location');
        return response.json();
      }
    });
  };

  // Add a new inventory item
  const addInventoryItem = useMutation({
    mutationFn: async (newItem: InsertInventoryItem) => {
      const response = await apiRequest('POST', '/api/inventory', newItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    }
  });

  // Update an inventory item
  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertInventoryItem> }) => {
      const response = await apiRequest('PUT', `/api/inventory/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    }
  });

  // Delete an inventory item
  const deleteInventoryItem = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/inventory/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    }
  });

  return {
    inventoryItems,
    isLoading,
    isError,
    refetch,
    getInventoryByLocation,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  };
}
