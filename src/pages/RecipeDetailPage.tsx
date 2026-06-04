import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { recipes } from "../data";
import { ArrowLeft, Clock, BarChart, ChevronDown, MoveDown, Share2 } from "lucide-react";
import { useHandMode } from "../context/HandModeContext";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipeIndex = recipes.findIndex((r) => r.id === id);
  const recipe = recipes[recipeIndex];
  const containerRef = useRef<HTMLDivElement>(null);
  const { isHandModeEnabled } = useHandMode();
  const [copied, setCopied] = useState(false);

  const nextRecipe = recipes[(recipeIndex + 1) % recipes.length];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [id]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black uppercase mb-4 text-black">Recipe not found</h1>
        <Link to="/" className="underline uppercase tracking-widest font-bold text-black">Back to sanctuary</Link>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: `Onyx & Ash: ${recipe.title}`,
      text: recipe.description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      ref={containerRef} 
      data-scrollable="true"
      className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-white text-black font-sans selection:bg-black selection:text-white no-scrollbar"
    >
      <section className="relative h-screen w-full snap-start shrink-0 flex flex-col overflow-hidden">
        <div className="absolute inset-0 scale-105">
          <img 
            src={recipe.heroImage} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
        </div>

        <div className="relative z-10 mt-auto p-6 md:p-12 mb-10 max-w-7xl w-full mx-auto">
          <Link to="/" className={`inline-flex items-center gap-2 mb-12 hover:line-through uppercase font-bold tracking-widest transition-all shadow-xl ${isHandModeEnabled ? "text-lg px-8 py-4 bg-white text-black" : "text-xs px-4 py-2 bg-white/80 backdrop-blur-md text-black"}`}>
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex gap-4 mb-4 flex-wrap">
              <span className={`bg-white text-black uppercase font-bold tracking-widest flex items-center gap-2 ${isHandModeEnabled ? "px-6 py-3 text-sm" : "px-3 py-1 text-[10px]"}`}>
                <Clock className="w-3 h-3" /> {recipe.prepTime}
              </span>
              <span className={`border border-white/50 text-white bg-black/50 backdrop-blur-sm uppercase font-bold tracking-widest flex items-center gap-2 ${isHandModeEnabled ? "px-6 py-3 text-sm" : "px-3 py-1 text-[10px]"}`}>
                <BarChart className="w-3 h-3" /> {recipe.difficulty}
              </span>
            </div>
            
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.8] font-black uppercase tracking-tighter mb-8 max-w-4xl text-white drop-shadow-lg">
              {recipe.title}
            </h1>
          </motion.div>
        </div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-60 text-white"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      <section className="min-h-screen w-full snap-start shrink-0 flex flex-col justify-center py-20 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
              The Story <div className="h-[1px] flex-1 bg-black/10" />
            </h2>
            <p className="text-2xl md:text-3xl leading-snug font-medium text-neutral-800">
              {recipe.description} Onyx & Ash focuses on the essence of flavor where every ingredient reflects the absolute of its origin. Strip away the visual noise, focus on the soul of the dish.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
              The Essentials <div className="h-[1px] flex-1 bg-black/10" />
            </h2>
            <ul className="space-y-6">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className={`flex justify-between items-end border-b border-black/5 group hover:border-black transition-colors ${isHandModeEnabled ? "pb-8" : "pb-4"}`}>
                  <span className={`font-bold uppercase transition-all group-hover:italic ${isHandModeEnabled ? "text-3xl" : "text-xl"}`}>{ing.item}</span>
                  <span className={`font-mono opacity-40 ${isHandModeEnabled ? "text-lg" : "text-sm"}`}>{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="h-screen w-full snap-start shrink-0 flex flex-col items-center justify-center bg-black text-white relative">
         <h2 className="text-xl md:text-3xl font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-6">
           <div className="w-8 md:w-16 h-[1px] bg-white" />
           The Ritual 
           <div className="w-8 md:w-16 h-[1px] bg-white" />
         </h2>
         <div className="flex items-center gap-3 opacity-50 font-mono text-sm uppercase tracking-widest mt-8 animate-bounce">
            <MoveDown className="w-5 h-5" /> Scroll to begin
         </div>
      </section>

      {recipe.steps.map((step) => (
        <section key={step.id} className="h-screen w-full snap-start shrink-0 flex flex-col md:flex-row relative bg-black">
          <div className="w-full h-[40vh] md:w-[50vw] md:h-full relative overflow-hidden shrink-0">
            <img 
              src={step.image} 
              alt={`Step ${step.id}`} 
              className="w-full h-full object-cover scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent md:hidden" />
          </div>
          
          <div className="w-full flex-1 md:w-[50vw] md:h-full flex flex-col justify-center px-8 py-8 md:px-24 bg-white text-black relative z-10 no-scrollbar">
            <span className="text-[12vw] md:text-[8vw] font-black tracking-tighter opacity-10 leading-none mb-8">
              {step.id < 10 ? `0${step.id}` : step.id}
            </span>
            <ul className="space-y-6">
              {step.description.map((point, idx) => (
                <li key={idx} className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed flex items-start gap-4">
                  <span className="w-2.5 h-2.5 bg-black rounded-full mt-2.5 md:mt-3 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <footer className="h-screen w-full snap-start shrink-0 flex flex-col items-center justify-center bg-black text-white relative z-20 px-6 text-center">
        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12">
          Mastered <br /> The Craft?
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button 
            onClick={handleShare}
            className={`bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex justify-center items-center gap-3 ${isHandModeEnabled ? "px-24 py-12 text-2xl" : "px-12 py-6 text-lg"}`}
          >
            <Share2 className={isHandModeEnabled ? "w-8 h-8" : "w-5 h-5"} />
            {copied ? "Link Copied" : "Share Recipe"}
          </button>
          <button 
            onClick={() => navigate(`/recipe/${nextRecipe.id}`)}
            className={`border border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all ${isHandModeEnabled ? "px-24 py-12 text-2xl" : "px-12 py-6 text-lg"}`}
          >
            Next Recipe
          </button>
        </div>
        <p className="absolute bottom-12 opacity-30 font-mono text-xs tracking-widest uppercase">
          &copy; 2026 Onyx & Ash — Monochrome Aesthetics
        </p>
      </footer>
    </div>
  );
}