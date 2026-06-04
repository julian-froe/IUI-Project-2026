import { Link, useNavigate, useLocation } from "react-router-dom";
import { Flame, Hand } from "lucide-react";
import { useHandMode } from "../context/HandModeContext";

export default function Navbar() {
  const { isHandModeEnabled, setIsHandModeEnabled } = useHandMode();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToRecipes = () => {
    if (location.pathname !== "/") {
      // 1. Navigate via React Router (prevents page reload)
      navigate("/");
      
      // 2. Wait slightly for the new page to render, then scroll smoothly
      setTimeout(() => {
        document.getElementById("recipes-grid")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("recipes-grid")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
          <Flame className="text-white w-6 h-6" />
        </div>
        <span className="font-sans font-black text-2xl tracking-tighter uppercase">Onyx & Ash</span>
      </Link>
      
      <div className="flex gap-4 md:gap-8 items-center font-sans font-medium text-xs tracking-widest uppercase">
        <button 
          onClick={() => setIsHandModeEnabled(!isHandModeEnabled)}
          className={`flex items-center gap-2 px-3 py-2 border transition-all ${
            isHandModeEnabled 
              ? "bg-black text-white border-black" 
              : "bg-white text-black border-black/10 hover:border-black"
          }`}
        >
          <Hand className={`w-4 h-4 ${isHandModeEnabled ? "animate-bounce" : ""}`} />
          <span className="hidden sm:inline">{isHandModeEnabled ? "Hand Mode ON" : "Enable Hand Mode"}</span>
        </button>

        <div className="hidden md:flex gap-8 items-center">
          <button onClick={scrollToRecipes} className="hover:line-through uppercase tracking-widest font-sans font-medium text-xs">
            Recipes
          </button>
        </div>
      </div>
    </nav>
  );
}