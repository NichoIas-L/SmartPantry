import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import IdentifiedItem from '@/components/IdentifiedItem';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addItemsToInventory } from '@/lib/imageRecognition';
import { Plus, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/queryClient';
import { capitalizeWords } from '@/lib/utils';

interface ResultsProps {
  recognizedItems: any[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  onTakeMorePhotos?: () => void;
  capturedImagesCount?: number;
}

export default function Results({ 
  recognizedItems = [], 
  selectedLocation, 
  onLocationChange,
  onTakeMorePhotos,
  capturedImagesCount = 1
}: ResultsProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>(recognizedItems);
  const [isAddingManually, setIsAddingManually] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number, updatedItem: { name: string, quantity: string, unit: string }) => {
    setItems(items.map((item, i) => (
      i === index ? { ...item, ...updatedItem } : item
    )));
  };

  const handleAddManually = () => {
    if (!newItemName.trim()) return;
    
    // Create a new item with quantity and unit
    const newItem = {
      name: newItemName.toLowerCase(),
      confidence: 100,
      quantity: newItemQuantity,
      unit: newItemUnit
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('');
    setIsAddingManually(false);
  };

  const handleAddToInventory = async () => {
    if (items.length === 0) {
      toast({
        title: "No items to add",
        description: "Please add at least one item to continue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addItemsToInventory(items, selectedLocation);
      
      // Show success toast
      toast({
        title: "Success!",
        description: `${items.length} items added to your inventory`,
        variant: "default",
      });
      
      // Invalidate inventory query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Identified Items" />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Identified Items</h2>
              <p className="text-gray-600">Review and confirm the items detected by Claude AI</p>
            </div>
            {capturedImagesCount > 1 && (
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {capturedImagesCount} photos scanned
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">{items.length} items found</h3>
              <div>
                <Select value={selectedLocation} onValueChange={onLocationChange}>
                  <SelectTrigger className="text-sm border-gray-300 rounded w-40">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fridge">Location: Fridge</SelectItem>
                    <SelectItem value="Cabinet">Location: Cabinet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <IdentifiedItem 
                  key={`${item.name}-${index}`}
                  item={item}
                  onRemove={() => handleRemoveItem(index)}
                  onEdit={(updatedItem) => handleEditItem(index, updatedItem)}
                />
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <Button 
                variant="ghost" 
                className="w-full text-primary font-medium"
                onClick={() => setIsAddingManually(true)}
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Item Manually
              </Button>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {onTakeMorePhotos && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (onTakeMorePhotos) {
                    onTakeMorePhotos();
                    navigate('/camera');
                  }
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take More Photos
              </Button>
            )}
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/camera')}
              >
                Retake
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={handleAddToInventory}
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "Adding..." : "Add to Inventory"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Manual add item dialog */}
      <Dialog open={isAddingManually} onOpenChange={setIsAddingManually}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item Manually</DialogTitle>
            <DialogDescription>
              Enter item name, quantity, and optional unit of measurement
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-item-name">Item Name</Label>
              <Input
                id="new-item-name"
                placeholder="e.g. Milk, Apples, Rice"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-quantity">Quantity</Label>
                <Input
                  id="new-quantity"
                  type="text"
                  inputMode="decimal"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-unit">Unit</Label>
                <Input
                  id="new-unit"
                  placeholder="e.g., lbs, oz, pieces"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewItemName('');
                setNewItemQuantity('1');
                setNewItemUnit('');
                setIsAddingManually(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddManually}
              disabled={!newItemName.trim()}
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
