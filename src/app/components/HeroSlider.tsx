import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void;
};

type Slide = {
  id: "super" | "boats" | "yachts" | "villas" | "palaces" | "chalets" | "cars";
  /** null = Super Luxury hub (all verticals) */
  category: string | null;
  image: string;
};

const SLIDES: Slide[] = [
  {
    id: "super",
    category: null,
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=2000&q=85",
  },
  {
    id: "boats",
    category: "boats",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2000&q=85",
  },
  {
    id: "yachts",
    category: "yachts",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=2000&q=85",
  },
  {
    id: "villas",
    category: "villas",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=2000&q=85",
  },
  {
    id: "palaces",
    category: "palaces",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=85",
  },
  {
    id: "chalets",
    category: "chalets",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=2000&q=85",
  },
  {
    id: "cars",
    category: "cars",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=85",
  },
];

const AUTO_MS = 6500;

export function HeroSlider({ onNavigate }: Props) {
  const { t } = useTranslation();
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(true);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback(
    (next: number) => {
      const len = SLIDES.length;
      const i = ((next % len) + len) % len;
      if (!reduceMotion.current) {
        setEntered(false);
        requestAnimationFrame(() => {
          setIndex(i);
          requestAnimationFrame(() => setEntered(true));
        });
      } else {
        setIndex(i);
      }
    },
    [],
  );

  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  useEffect(() => {
    if (paused || reduceMotion.current) return;
    const id = window.setInterval(() => go(index + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [index, paused, go]);

  const slide = SLIDES[index];
  const title = t(`heroSlider.slides.${slide.id}.title`);
  const sub = t(`heroSlider.slides.${slide.id}.sub`);
  const ctaLabel = slide.category
    ? t("heroSlider.cta", { category: t(`super.vertical.${slide.id}`) })
    : t("heroSlider.ctaSuper");

  const openSlide = () => {
    if (slide.category) {
      onNavigate("browse", { category: slide.category });
    } else {
      onNavigate("search");
    }
  };

  return (
    <section
      className="relative w-full min-h-[min(72dvh,640px)] h-[min(72dvh,640px)] sm:min-h-[min(82dvh,720px)] sm:h-[min(82dvh,720px)] lg:min-h-[min(88vh,760px)] lg:h-[min(88vh,760px)] overflow-hidden bg-[#0c1220] text-white"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <h2 id={labelId} className="sr-only">
        {t("heroSlider.ariaLabel")}
      </h2>

      {/* Full-bleed slides */}
      {SLIDES.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              active ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!active}
          >
            <ImageWithFallback
              src={s.image}
              alt=""
              className={`size-full object-cover will-change-transform ${
                active && entered && !reduceMotion.current
                  ? "animate-[hero-kenburns_8s_ease-out_forwards]"
                  : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c1220]/55 via-[#0c1220]/35 to-[#0c1220]/80" />
            <div className="absolute inset-0 bg-gradient-to-e from-[#0c1220]/50 via-transparent to-transparent" />
          </div>
        );
      })}

      {/* Content — one composition */}
      <div className="relative z-[2] flex h-full flex-col justify-end px-4 pb-14 pt-20 sm:px-10 sm:pb-20 lg:px-16">
        <div
          className={`max-w-3xl transition-all duration-500 ease-out ${
            entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="font-display text-[clamp(2rem,7vw,4.25rem)] font-semibold leading-[0.95] tracking-tight text-white drop-shadow-sm">
            {t("brand")}
          </p>
          <h1 className="mt-3 sm:mt-4 text-[clamp(1.2rem,3.5vw,2.25rem)] font-semibold leading-snug tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2.5 sm:mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-white/80 sm:text-base">
            {sub}
          </p>

          <div className="mt-5 sm:mt-7 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={openSlide}
              className="group inline-flex min-h-11 items-center justify-center gap-2 bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              {ctaLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("browse")}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/35 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/95 backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              {t("heroSlider.browseAll")}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-[3] flex items-center justify-between gap-3 px-4 pb-5 sm:px-8 lg:px-14">
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label={t("heroSlider.indicators")}
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t("heroSlider.goTo", {
                name: t(`super.vertical.${s.id}`),
              })}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                i === index
                  ? "w-8 bg-amber-500"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label={t("heroSlider.prev")}
            className="flex size-10 items-center justify-center border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("heroSlider.next")}
            className="flex size-10 items-center justify-center border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:border-white/55 hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight className="size-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes hero-kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
      `}</style>
    </section>
  );
}
