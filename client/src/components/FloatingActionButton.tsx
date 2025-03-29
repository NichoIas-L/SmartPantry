import { Camera as CameraIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-24 right-6">
      <Button
        onClick={onClick}
        size="roundedIcon"
        className="bg-primary hover:bg-blue-600 shadow-lg w-14 h-14"
        aria-label="Take a photo"
      >
        <CameraIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}
