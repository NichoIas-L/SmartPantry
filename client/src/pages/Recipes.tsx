import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

interface Recipe {
  id: number;
  title: string;
  image: string;
  calories: number;
  cookTime: string;
  ingredients: string[];
  isFavorite: boolean;
}

export default function Recipes() {
  const [, navigate] = useLocation();
  
  // Sample recommended recipes
  const recommendedRecipes: Recipe[] = [
    {
      id: 1,
      title: "Healthy Taco Salad with fresh vegetables",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
      calories: 120,
      cookTime: "25 Min",
      ingredients: ["Ground beef", "Lettuce", "Tomatoes", "Cheese", "Taco shells"],
      isFavorite: false
    },
    {
      id: 2,
      title: "Japanese-style Pancakes Recipe",
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
      calories: 64,
      cookTime: "12 Min",
      ingredients: ["Flour", "Eggs", "Milk", "Sugar", "Baking powder"],
      isFavorite: true
    },
    {
      id: 3,
      title: "Garden Fresh Pasta with Tomato Sauce",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
      calories: 320,
      cookTime: "30 Min",
      ingredients: ["Pasta", "Tomatoes", "Basil", "Garlic", "Olive oil"],
      isFavorite: false
    },
    {
      id: 4,
      title: "Homemade Granola with Nuts and Berries",
      image: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=800&q=80",
      calories: 220,
      cookTime: "45 Min",
      ingredients: ["Oats", "Nuts", "Honey", "Dried fruits", "Coconut oil"],
      isFavorite: false
    }
  ];

  const [recipes, setRecipes] = useState(recommendedRecipes);

  const toggleFavorite = (id: number) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id 
        ? { ...recipe, isFavorite: !recipe.isFavorite } 
        : recipe
    ));
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-16 bg-gray-50">
        {/* Header */}
        <header className="px-5 pt-5 pb-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Recipes</h1>
        </header>

        {/* Recipes based on your inventory */}
        <section className="px-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Recommended for You</h2>
          <p className="text-gray-500 text-sm mb-4">
            Based on your current inventory items
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 bg-white rounded-full h-8 w-8 p-1.5 ${
                      recipe.isFavorite ? 'text-red-500' : 'text-gray-400'
                    }`}
                    onClick={() => toggleFavorite(recipe.id)}
                  >
                    <Heart className="h-full w-full" fill={recipe.isFavorite ? "currentColor" : "none"} />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{recipe.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <div>{recipe.calories} Kcal</div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{recipe.cookTime}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Navigation activePage="recipes" />
    </>
  );
}