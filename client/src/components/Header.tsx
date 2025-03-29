import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
