import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';

interface IdentifiedItemProps {
  item: {
    name: string;
    confidence: number;
    imageUrl?: string;
  };
  onRemove: () => void;
  onEdit: (newName: string) => void;
}

export default function IdentifiedItem({ item, onRemove, onEdit }: IdentifiedItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);

  const handleSaveEdit = () => {
    if (editedName.trim() !== '') {
      onEdit(editedName);
      setIsEditing(false);
    }
  };

  return (
    <div className="p-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="h-12 w-12 rounded bg-gray-200 mr-3 flex-shrink-0">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="h-full w-full object-cover rounded"
              onError={(e) => {
                // If image fails to load, replace with fallback
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Food';
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400 rounded">
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-xs text-gray-500">Confidence: {item.confidence}%</p>
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
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditedName(item.name);
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
