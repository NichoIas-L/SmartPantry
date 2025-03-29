import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2 } from 'lucide-react';
import { capitalizeWords } from '@/lib/utils';

interface IdentifiedItemProps {
  item: {
    name: string;
    confidence: number;
    quantity?: string;
    unit?: string;
    imageUrl?: string;
  };
  onRemove: () => void;
  onEdit: (newItem: { name: string, quantity: string, unit: string }) => void;
}

export default function IdentifiedItem({ item, onRemove, onEdit }: IdentifiedItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity || "1");
  const [editedUnit, setEditedUnit] = useState(item.unit || "");

  const handleSaveEdit = () => {
    if (editedName.trim() !== '') {
      onEdit({
        name: editedName,
        quantity: editedQuantity,
        unit: editedUnit
      });
      setIsEditing(false);
    }
  };

  // Format the quantity display for UI
  const displayQuantity = item.quantity && item.unit 
    ? `${item.quantity} ${item.unit}` 
    : item.quantity 
      ? item.quantity 
      : "1";

  return (
    <div className="p-3 flex justify-between items-center">
      <div className="flex items-center">
        <div>
          <h4 className="font-medium">{capitalizeWords(item.name)}</h4>
          <div className="flex items-center">
            <span className="text-xs text-gray-700 font-medium mr-2">{displayQuantity}</span>
            <span className="text-xs text-gray-500">Confidence: {item.confidence}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-gray-600" 
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-red-500" 
          onClick={onRemove}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Adjust the name, quantity, and unit of measurement
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="text"
                  inputMode="decimal"
                  value={editedQuantity}
                  onChange={(e) => setEditedQuantity(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="e.g., lbs, oz, pieces"
                  value={editedUnit}
                  onChange={(e) => setEditedUnit(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditedName(item.name);
                setEditedQuantity(item.quantity || "1");
                setEditedUnit(item.unit || "");
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={!editedName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
