import { recipes } from "../data";
import RecipeCard from "../components/RecipeCard";
import { motion } from "motion/react";

export default function HomePage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <header className="mb-20 space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans font-black text-[12vw] md:text-[10vw] leading-[0.85] tracking-tighter uppercase"
        >
          Taste in <br /> <span className="italic">Monochrome.</span>
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="font-mono text-[10px] tracking-[0.4em] uppercase"
        >
          [ Use Hand to Navigate & Pinch to Select ]
        </motion.div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <p className="max-w-md font-sans text-lg text-neutral-600 leading-tight">
            Minimalist recipes for the maximalist palate. Curated dishes stripped of color, defined by texture and depth.
          </p>
          
          <div className="flex gap-4">
            <button className="px-8 py-4 border border-black hover:bg-black hover:text-white transition-all uppercase font-sans font-bold text-sm tracking-widest">
              Most Popular
            </button>
            <button className="px-8 py-4 bg-black text-white hover:bg-neutral-800 transition-all uppercase font-sans font-bold text-sm tracking-widest">
              All Recipes
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
          >
            <RecipeCard recipe={recipe} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
