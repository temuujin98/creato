import { useLanguage } from "../../hooks/useLanguage";
import { BackgroundVideo } from "../layout/BackgroundVideo";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="theme-cinematic relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 pb-20 pt-28 sm:px-6 lg:px-8"
    >
      <BackgroundVideo className="z-0" />
      <div className="absolute inset-0 z-[1] bg-black/24" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-b from-transparent via-black/45 to-black md:h-64" />

      <div className="relative z-10 mx-auto max-w-[980px] text-center">
        <h1
          className="text-balance text-[clamp(3.5rem,10vw,9rem)] font-semibold leading-[0.95] tracking-normal text-white"
          style={{ textShadow: "0 4px 34px rgba(0,0,0,0.58)" }}
        >
          {t.hero.headline}
        </h1>
        <p
          className="mx-auto mt-7 max-w-3xl text-base leading-8 text-white/76 sm:text-lg lg:text-xl"
          style={{ textShadow: "0 2px 22px rgba(0,0,0,0.72)" }}
        >
          {t.hero.subheadline}
        </p>
      </div>
    </section>
  );
}
