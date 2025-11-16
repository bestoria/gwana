import React from 'react';
import { Utensils, Clock, Users, CheckSquare } from 'lucide-react';
import type { RecipeContent } from '@/src/lib/types';

interface RecipeDisplayProps {
  recipe: RecipeContent;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
    if (!recipe) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-2 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <Utensils size={18} /> {recipe.title.toUpperCase()}
            </h3>
            <p className="text-sm text-gray-300 mb-4 italic">{recipe.description}</p>
            
            <div className="flex items-center gap-4 text-gray-400 mb-4 border-y border-gray-700 py-2">
                <div className="flex items-center gap-1.5">
                    <Clock size={16} /> Prep: <span className="text-white">{recipe.prepTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={16} /> Cook: <span className="text-white">{recipe.cookTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={16} /> Serves: <span className="text-white">{recipe.servings}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Ingredients</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        {recipe.ingredients.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <CheckSquare size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Instructions</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                        {recipe.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default RecipeDisplay;