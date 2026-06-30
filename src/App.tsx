import { BrowserRouter as Router, Routes, Route, ScrollRestoration, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import Navbar from "./components/Navbar";
import HandCursor from "./components/hand-cursor/HandCursor";
import HandOnboarding from "./components/hand-onboarding/HandOnboarding";
import { HandModeProvider } from "./context/HandModeContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HandModeProvider>
      <Router>
        <ScrollToTop />
        <HandCursor />
        <HandOnboarding />
        <div className="selection:bg-black selection:text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          </Routes>
        </div>
      </Router>
    </HandModeProvider>
  );
}
