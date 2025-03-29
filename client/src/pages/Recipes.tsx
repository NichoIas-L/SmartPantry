import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Heart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";

interface Recipe {
  id: number;
  title: string;
  image: string;
  calories: number;
  cookTime: string;
  ingredients: string[];
  isFavorite: boolean;
  category?: string;
}

export default function Recipes() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample recommended recipes
  const allRecipes: Recipe[] = [
    {
      id: 1,
      title: "Healthy Taco Salad with fresh vegetables",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
      calories: 120,
      cookTime: "25 Min",
      ingredients: ["Ground beef", "Lettuce", "Tomatoes", "Cheese", "Taco shells"],
      isFavorite: false,
      category: "Lunch"
    },
    {
      id: 2,
      title: "Japanese-style Pancakes Recipe",
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
      calories: 64,
      cookTime: "12 Min",
      ingredients: ["Flour", "Eggs", "Milk", "Sugar", "Baking powder"],
      isFavorite: true,
      category: "Breakfast"
    },
    {
      id: 3,
      title: "Garden Fresh Pasta with Tomato Sauce",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
      calories: 320,
      cookTime: "30 Min",
      ingredients: ["Pasta", "Tomatoes", "Basil", "Garlic", "Olive oil"],
      isFavorite: false,
      category: "Dinner"
    },
    {
      id: 4,
      title: "Homemade Granola with Nuts and Berries",
      image: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=800&q=80",
      calories: 220,
      cookTime: "45 Min",
      ingredients: ["Oats", "Nuts", "Honey", "Dried fruits", "Coconut oil"],
      isFavorite: false,
      category: "Breakfast"
    }
  ];

  const [recipes, setRecipes] = useState(allRecipes);

  const filteredRecipes = recipes.filter(recipe => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = activeCategory === null || recipe.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: number) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id 
        ? { ...recipe, isFavorite: !recipe.isFavorite } 
        : recipe
    ));
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
        {/* Header */}
        <header className="px-5 pt-5 pb-3">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 -ml-2" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Recipes</h1>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search recipes or ingredients"
              className="pl-10 pr-10 py-2 bg-white rounded-xl border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            <Button 
              onClick={() => setActiveCategory(null)} 
              className={`rounded-full px-4 py-1 text-sm flex-shrink-0 ${
                activeCategory === null 
                  ? 'bg-teal-400 hover:bg-teal-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All
            </Button>
            <Button 
              onClick={() => setActiveCategory('Breakfast')} 
              className={`rounded-full px-4 py-1 text-sm flex-shrink-0 ${
                activeCategory === 'Breakfast' 
                  ? 'bg-teal-400 hover:bg-teal-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Breakfast
            </Button>
            <Button 
              onClick={() => setActiveCategory('Lunch')} 
              className={`rounded-full px-4 py-1 text-sm flex-shrink-0 ${
                activeCategory === 'Lunch' 
                  ? 'bg-teal-400 hover:bg-teal-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Lunch
            </Button>
            <Button 
              onClick={() => setActiveCategory('Dinner')} 
              className={`rounded-full px-4 py-1 text-sm flex-shrink-0 ${
                activeCategory === 'Dinner' 
                  ? 'bg-teal-400 hover:bg-teal-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Dinner
            </Button>
          </div>
        </header>

        {/* Recommended Recipes */}
        <section className="px-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {activeCategory ? `${activeCategory} Recipes` : "Recommended for You"}
          </h2>
          
          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-500">No recipes match your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="aspect-square bg-gray-200 relative">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1470&auto=format&fit=crop`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 drop-shadow-sm">{recipe.title}</h3>
                      <div className="flex items-center text-xs text-white/90">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{recipe.cookTime}</span>
                        <div className="mx-2">•</div>
                        <span>{recipe.calories} Kcal</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full h-8 w-8 p-1.5 ${
                        recipe.isFavorite ? 'text-red-500' : 'text-gray-500'
                      }`}
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart className="h-full w-full" fill={recipe.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  {/* Added padding for category badge if needed */}
                  {recipe.category && (
                    <div className="p-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {recipe.category}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Navigation activePage="recipes" />
    </>
  );
}