import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Recipe } from "../types";
import { ArrowRight } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="group block relative overflow-hidden bg-white">
      <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          src={recipe.heroImage}
          alt={recipe.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="mt-6 space-y-3 px-1">
        <div className="flex justify-between items-baseline">
          <span className="font-mono text-[10px] tracking-widest uppercase opacity-40">{recipe.difficulty} — {recipe.prepTime}</span>
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
        
        <h3 className="font-sans font-bold text-4xl tracking-tighter uppercase leading-none group-hover:italic transition-all">
          {recipe.title}
        </h3>
        
        <p className="font-sans text-sm text-neutral-500 leading-relaxed max-w-sm">
          {recipe.description}
        </p>

        <div className="pt-4">
          <div className="h-[1px] w-full bg-black/10 group-hover:bg-black transition-colors" />
        </div>
      </div>
    </Link>
  );
}
