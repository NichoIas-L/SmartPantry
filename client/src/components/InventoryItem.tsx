import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { capitalizeWords } from '@/lib/utils';

interface InventoryItemProps {
  item: {
    id: number;
    name: string;
    location: string;
    imageUrl?: string;
    addedDate: string;
    expiryDate?: string;
  };
  onDelete: () => void;
}

export default function InventoryItem({ item, onDelete }: InventoryItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const addedDate = new Date(item.addedDate);
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  
  // Calculate days left until expiry
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  
  // Determine expiry badge color
  const getExpiryBadgeColor = () => {
    if (!daysLeft) return "bg-gray-100 text-gray-800";
    if (daysLeft < 0) return "bg-red-100 text-red-800";
    if (daysLeft <= 3) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };
  
  // Format expiry message
  const getExpiryText = () => {
    if (!daysLeft) return "No expiry date";
    if (daysLeft < 0) return "Expired";
    if (daysLeft === 0) return "Expires today";
    if (daysLeft === 1) return "1 day left";
    if (daysLeft < 30) return `${daysLeft} days left`;
    if (daysLeft < 60) return "1 month left";
    return `${Math.floor(daysLeft / 30)} months left`;
  };

  return (
    <div className="py-3 px-1">
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{capitalizeWords(item.name)}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${
              item.location === "Fridge" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-amber-100 text-amber-800"
            }`}>
              {item.location}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Added: {format(addedDate, 'MMM d, yyyy')}
          </p>
          <div className="flex items-center mt-1">
            {expiryDate && (
              <>
                <span className="text-xs text-gray-500 mr-4">
                  Exp: {format(expiryDate, 'MMM d, yyyy')}
                </span>
                <span className={`text-xs ${getExpiryBadgeColor()} px-1.5 py-0.5 rounded-sm`}>
                  {getExpiryText()}
                </span>
              </>
            )}
            
            {/* Delete button */}
            <button 
              className="ml-auto text-gray-400 hover:text-red-500 p-1"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to remove {capitalizeWords(item.name)} from your inventory?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              onDelete();
              setConfirmDelete(false);
            }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
