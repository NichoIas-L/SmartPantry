import { Home, Search, Bell, User, ChefHat } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activePage: 'home' | 'search' | 'notifications' | 'profile' | 'recipes';
}

export default function Navigation({ activePage }: NavigationProps) {
  const [, navigate] = useLocation();

  // Helper for active link style
  const getNavItemClasses = (page: string) => {
    return activePage === page 
      ? "text-teal-500" 
      : "text-gray-400";
  };

  return (
    <nav className="bg-white rounded-t-[32px] fixed bottom-0 left-0 right-0 z-10 shadow-lg">
      <div className="max-w-md mx-auto px-8 relative">
        {/* Middle elevated button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-8">
          <div className="relative group">
            <Button
              onClick={() => navigate('/auto-recipes')}
              className="rounded-full h-16 w-16 bg-gray-900 hover:bg-gray-800 shadow-lg flex items-center justify-center"
              aria-label="Cook with my ingredients only"
            >
              <ChefHat className="h-7 w-7 text-white" />
            </Button>
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-800 text-white text-sm rounded px-2 py-1 pointer-events-none">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              Cook with MY ingredients ONLY
            </div>
          </div>
        </div>
        
        <div className="flex justify-between py-5">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center justify-center w-10 h-10 ${getNavItemClasses('home')}`}
          >
            <Home strokeWidth={1.5} className="h-7 w-7" />
          </button>
          
          <button 
            className={`flex items-center justify-center w-10 h-10 ${getNavItemClasses('search')}`}
          >
            <Search strokeWidth={1.5} className="h-7 w-7" />
          </button>
          
          {/* Empty space for the middle button */}
          <div className="w-16"></div>
          
          <button 
            className={`flex items-center justify-center w-10 h-10 ${getNavItemClasses('notifications')}`}
          >
            <Bell strokeWidth={1.5} className="h-7 w-7" />
          </button>
          
          <button 
            className={`flex items-center justify-center w-10 h-10 ${getNavItemClasses('profile')}`}
          >
            <User strokeWidth={1.5} className="h-7 w-7" />
          </button>
        </div>
      </div>
    </nav>
  );
}
