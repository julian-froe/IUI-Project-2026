import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useInView } from "motion/react";
import { recipes } from "../data";
import { CookingStep } from "../types";
import { ArrowLeft, Clock, BarChart, ChevronDown } from "lucide-react";
import { useHandMode } from "../context/HandModeContext";

interface StepContentProps {
  step: CookingStep;
}

const StepContent: React.FC<StepContentProps> = ({ step }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isInView) {
      window.dispatchEvent(new CustomEvent('stepChange', { detail: step.id }));
    }
  }, [isInView, step.id]);

  return (
    <div ref={ref} className={`transition-opacity duration-500 pb-20 ${isInView ? 'opacity-100' : 'opacity-20'}`}>
      <div className="flex items-start gap-8">
        <span className="text-8xl font-black tracking-tighter opacity-10 leading-none">
          {step.id < 10 ? `0${step.id}` : step.id}
        </span>
        <div className="pt-4">
          <p className="text-3xl md:text-5xl font-bold leading-tight uppercase transition-all">
            {step.description}
          </p>
        </div>
      </div>
      <div className="lg:hidden mt-12 grayscale shadow-2xl">
        <img src={step.image} alt={`Step ${step.id}`} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
      </div>
    </div>
  );
};

interface StepImageProps {
  step: CookingStep;
  activeStep: number;
}

const StepImage: React.FC<StepImageProps> = ({ step, activeStep }) => {
  const isActive = activeStep === step.id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="absolute inset-0"
    >
      <img 
        src={step.image} 
        alt={`Step ${step.id}`} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/20" />
    </motion.div>
  );
};

export default function RecipeDetailPage() {
  const { id } = useParams();
  const recipe = recipes.find((r) => r.id === id);
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const { isHandModeEnabled } = useHandMode();

  useEffect(() => {
    const handler = ((e: CustomEvent) => setActiveStep(e.detail)) as EventListener;
    window.addEventListener('stepChange', handler);
    return () => window.removeEventListener('stepChange', handler);
  }, []);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black uppercase mb-4 text-black">Recipe not found</h1>
        <Link to="/" className="underline uppercase tracking-widest font-bold text-black">Back to sanctuary</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 grayscale scale-110">
          <img 
            src={recipe.heroImage} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
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
              <span className={`bg-black text-white uppercase font-bold tracking-widest flex items-center gap-2 ${isHandModeEnabled ? "px-6 py-3 text-sm" : "px-3 py-1 text-[10px]"}`}>
                <Clock className="w-3 h-3" /> {recipe.prepTime}
              </span>
              <span className={`border border-black bg-white/50 backdrop-blur-sm uppercase font-bold tracking-widest flex items-center gap-2 ${isHandModeEnabled ? "px-6 py-3 text-sm" : "px-3 py-1 text-[10px]"}`}>
                <BarChart className="w-3 h-3" /> {recipe.difficulty}
              </span>
            </div>
            
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.8] font-black uppercase tracking-tighter mb-8 max-w-4xl text-black drop-shadow-sm">
              {recipe.title}
            </h1>
          </motion.div>
        </div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Info & Ingredients */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
            The Story <div className="h-[1px] flex-1 bg-black/10" />
          </h2>
          <p className="text-2xl md:text-3xl leading-snug font-medium text-neutral-800">
            {recipe.description} Noir cuisine is about the essence of flavor where every ingredient reflects the absolute of its origin. Strip away the visual noise, focus on the soul of the dish.
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
      </section>

      {/* Cooking Steps - Sticky Scroll */}
      <section className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 relative">
          
          {/* Scroll Area */}
          <div className={`space-y-[40vh] ${isHandModeEnabled ? "snap-y snap-mandatory" : ""}`}>
             <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-20 sticky top-32 z-10 bg-neutral-50/80 backdrop-blur py-4 flex items-center gap-4">
               The Ritual <div className="h-[1px] flex-1 bg-black" />
             </h2>
             
             {recipe.steps.map((step) => (
               <div key={step.id} className="snap-center pt-20">
                 <StepContent step={step} />
               </div>
             ))}
             <div className="h-[40vh]" />
          </div>

          {/* Sticky Image Area */}
          <div className="hidden lg:block sticky top-0 h-screen py-32">
            <div className="h-full relative rounded-sm overflow-hidden grayscale ring-1 ring-black/5">
              {recipe.steps.map((step) => (
                <StepImage key={step.id} step={step} activeStep={activeStep} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <footer className="py-40 px-6 text-center bg-black text-white">
        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12">
          Mastered <br /> The Craft?
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button className={`bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 transition-all ${isHandModeEnabled ? "px-24 py-12 text-2xl" : "px-12 py-6 text-lg"}`}>
            Share Your Noir
          </button>
          <Link to="/" className={`border border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all ${isHandModeEnabled ? "px-24 py-12 text-2xl" : "px-12 py-6 text-lg"}`}>
            Next Recipe
          </Link>
        </div>
        <p className="mt-20 opacity-30 font-mono text-xs tracking-widest uppercase">
          &copy; 2026 Noir Cuisine — Monochrome Aesthetics
        </p>
      </footer>
    </div>
  );
}
