import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { FaqSection } from "../components/home/FaqSection";
import { FeaturedCategories } from "../components/home/FeaturedCategories";
import { FeaturedProductsParallax } from "../components/home/FeaturedProductsParallax";
import { HeroSection } from "../components/home/HeroSection";
import { HowItWorks } from "../components/home/HowItWorks";
import { ShowcaseSection } from "../components/home/ShowcaseSection";
import { ValueSection } from "../components/home/ValueSection";
import { WhyCreato } from "../components/home/WhyCreato";

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.querySelector(location.hash);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="relative overflow-hidden bg-ink">
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <ValueSection />
          <FeaturedCategories />
          <HowItWorks />
          <FeaturedProductsParallax />
          <WhyCreato />
          <ShowcaseSection />
          <FaqSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
