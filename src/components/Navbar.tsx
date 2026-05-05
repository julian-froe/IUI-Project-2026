import { Link } from "react-router-dom";
import { ChefHat } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
          <ChefHat className="text-white w-6 h-6" />
        </div>
        <span className="font-sans font-black text-2xl tracking-tighter uppercase">Noir Cuisine</span>
      </Link>
      
      <div className="hidden md:flex gap-8 items-center font-sans font-medium text-xs tracking-widest uppercase">
        <Link to="/" className="hover:line-through">Recipes</Link>
        <button className="hover:line-through">About</button>
        <button className="px-5 py-2 bg-black text-white rounded-none hover:bg-neutral-800 transition-colors">
          Newsletter
        </button>
      </div>
    </nav>
  );
}
