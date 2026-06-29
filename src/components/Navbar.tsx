import { Link, useNavigate, useLocation } from "react-router-dom";
import { Flame } from "lucide-react";
import shakaIconUrl from "../../assets/HandGestureIcons/shaka_sign.svg";
import { useHandMode } from "../context/HandModeContext";

export default function Navbar() {
  const { isHandModeEnabled, isTrackingPaused, setIsHandModeEnabled } = useHandMode();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToRecipes = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("recipes-grid")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("recipes-grid")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handButtonLabel = !isHandModeEnabled
    ? "Enable Hand Mode"
    : isTrackingPaused
      ? "Hand Paused"
      : "Hand Active";

  const handButtonTitle = isHandModeEnabled
    ? "Hold shaka for 2 seconds to pause or resume hand control"
    : "Enable camera hand tracking";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
          <Flame className="text-white w-6 h-6" />
        </div>
        <span className="font-sans font-black text-2xl tracking-tighter uppercase">Noir Cuisine</span>
      </Link>
      
      <div className="flex gap-4 md:gap-8 items-center font-sans font-medium text-xs tracking-widest uppercase">
        <button 
          type="button"
          onClick={() => setIsHandModeEnabled(!isHandModeEnabled)}
          title={handButtonTitle}
          className={`flex items-center gap-2 px-3 py-2 border transition-all ${
            !isHandModeEnabled
              ? "bg-white text-black border-black/10 hover:border-black"
              : isTrackingPaused
                ? "bg-white text-black/50 border-black/30"
                : "bg-black text-white border-black"
          }`}
        >
          <img
            src={shakaIconUrl}
            alt=""
            aria-hidden="true"
            className={`w-4 h-4 object-contain ${isHandModeEnabled && !isTrackingPaused ? "invert" : ""}`}
            draggable={false}
          />
          <span className="hidden sm:inline">{handButtonLabel}</span>
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
