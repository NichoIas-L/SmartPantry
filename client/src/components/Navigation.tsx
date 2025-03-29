import { Home, Calendar, User, ChefHat } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activePage: 'home' | 'expiring' | 'profile' | 'recipes';
}

export default function Navigation({ activePage }: NavigationProps) {
  const [, navigate] = useLocation();

  // Helper for active link style
  const getNavItemClasses = (page: string) => {
    return activePage === page 
      ? "text-primary" 
      : "text-gray-600";
  };

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="max-w-md mx-auto px-4 relative">
        {/* Middle elevated button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
          <Button
            onClick={() => navigate('/recipes')}
            className={`rounded-full h-14 w-14 bg-gray-800 hover:bg-gray-700 shadow-md flex items-center justify-center ${activePage === 'recipes' ? 'bg-gray-700' : ''}`}
          >
            <ChefHat className="h-6 w-6 text-white" />
          </Button>
        </div>
        
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center py-3 px-4 ${getNavItemClasses('home')}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            className={`flex flex-col items-center py-3 px-4 ${getNavItemClasses('expiring')}`}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Expiring</span>
          </button>
          
          {/* Empty space for the middle button */}
          <div className="w-16 opacity-0 flex flex-col items-center py-3 px-4">
            <ChefHat className="h-6 w-6" />
            <span className="text-xs mt-1">Recipes</span>
          </div>
          
          <button 
            className={`flex flex-col items-center py-3 px-4 ${getNavItemClasses('profile')}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
