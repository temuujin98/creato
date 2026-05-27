import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { showcaseItems, type ShowcaseItem } from "../../data/showcase";
import { useLanguage } from "../../hooks/useLanguage";
import { Lightbox } from "../ui/Lightbox";

gsap.registerPlugin(ScrollTrigger);

export function FeaturedProductsParallax() {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;

    if (!section || !content || !leftColumn || !rightColumn) {
      return undefined;
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: content,
        pinSpacing: false,
      });

      gsap.to(leftColumn, {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(rightColumn, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => context.revert();
  }, []);

  const leftItems = showcaseItems.filter((_, index) => index % 2 === 0);
  const rightItems = showcaseItems.filter((_, index) => index % 2 === 1);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative min-h-[300vh] overflow-hidden border-y border-white/10 bg-black"
    >
      <div
        ref={contentRef}
        className="relative z-10 flex h-screen items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase text-white/54">
            {t.parallax.eyebrow}
          </p>
          <h2 className="mt-4 text-5xl font-semibold tracking-normal text-white sm:text-7xl">
            {t.parallax.heading.replace(t.parallax.emphasized, "")}
            <span className="italic text-white/74">{t.parallax.emphasized}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/62">
            {t.parallax.subtext}
          </p>
          <a
            href="https://dribbble.com/"
            className="mt-9 inline-flex rounded-full border border-white/14 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/28 hover:bg-white hover:text-black"
          >
            {t.parallax.button}
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto grid max-w-[1400px] grid-cols-2 gap-12 px-4 py-[18vh] md:gap-40 lg:px-8">
        <div ref={leftColumnRef} className="flex flex-col items-start gap-28 pt-24">
          {leftItems.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              language={language}
              onOpen={setSelectedItem}
            />
          ))}
        </div>
        <div ref={rightColumnRef} className="flex flex-col items-end gap-28 pt-[42vh]">
          {rightItems.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              language={language}
              onOpen={setSelectedItem}
            />
          ))}
        </div>
      </div>

      <Lightbox
        alt={selectedItem?.alt[language] ?? ""}
        closeLabel={t.parallax.lightboxClose}
        image={selectedItem?.image ?? ""}
        isOpen={selectedItem !== null}
        title={selectedItem?.title[language] ?? ""}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}

function GalleryCard({
  item,
  language,
  onOpen,
}: {
  item: ShowcaseItem;
  language: "mn" | "en";
  onOpen: (item: ShowcaseItem) => void;
}) {
  return (
    <button
      type="button"
      className={`pointer-events-auto group aspect-square w-full max-w-[320px] overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-2 shadow-glow transition duration-300 hover:scale-[1.025] ${item.rotation}`}
      onClick={() => onOpen(item)}
    >
      <img
        src={item.image}
        alt={item.alt[language]}
        className="h-full w-full rounded-[1.35rem] object-cover"
      />
      <span className="sr-only">{item.title[language]}</span>
    </button>
  );
}
