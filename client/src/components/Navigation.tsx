import { Home, Calendar, ClipboardList, User, ChefHat } from 'lucide-react';
import { useLocation } from 'wouter';

interface NavigationProps {
  activePage: 'home' | 'expiring' | 'lists' | 'profile' | 'recipes';
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
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
      <div className="max-w-md mx-auto px-4">
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
          
          <div className="w-16"></div> {/* Spacer for FAB */}
          
          <button 
            onClick={() => navigate('/recipes')}
            className={`flex flex-col items-center py-3 px-4 ${getNavItemClasses('recipes')}`}
          >
            <ChefHat className="h-6 w-6" />
            <span className="text-xs mt-1">Recipes</span>
          </button>
          
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
