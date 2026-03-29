"use client";

import { useState, useEffect, useCallback } from "react";

interface Slide {
  title: string;
  description: string;
  icon: string;
}

interface CRTScreenProps {
  slides: Slide[];
  autoPlayMs?: number;
  className?: string;
}

export default function CRTScreen({ slides, autoPlayMs = 4000, className = "" }: CRTScreenProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 150);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, autoPlayMs);
    return () => clearInterval(timer);
  }, [next, autoPlayMs]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const slide = slides[current];

  return (
    <div className={`max-w-2xl mx-auto px-4 ${className}`}>
      {/* CRT Cabinet */}
      <div
        className="rounded-[20px] p-5 md:p-7 screen-glow"
        style={{
          background: "linear-gradient(160deg, #722E21 0%, #5C2419 40%, #3D1810 100%)",
          boxShadow: "0 0 40px rgba(139,58,42,0.3), 0 0 80px rgba(139,58,42,0.12), inset 0 1px 0 rgba(181,96,74,0.3)",
        }}
      >
        {/* Screen bezel — inset rim */}
        <div
          className="rounded-[12px] p-[5px]"
          style={{
            background: "linear-gradient(145deg, #2a1209 0%, #3D1810 50%, #2a1209 100%)",
            boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(181,96,74,0.1)",
          }}
        >
          {/* Screen surface */}
          <div
            className="relative rounded-[8px] overflow-hidden"
            style={{
              boxShadow: "inset 0 0 60px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2)",
              background: "#1a0a06",
            }}
          >
            <div className="crt-scanlines crt-vignette min-h-[280px] md:min-h-[320px] flex items-center justify-center p-8 md:p-12">
              {/* Slide content */}
              <div className={`text-center transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}>
                <div className="text-5xl mb-5">{slide.icon}</div>
                <h3
                  className="font-heading text-[11px] md:text-[13px] text-stamp-200 tracking-[0.15em] mb-4 leading-relaxed"
                  style={{ textShadow: "0 0 12px rgba(229,174,159,0.4)" }}
                >
                  {slide.title}
                </h3>
                <p className="text-stamp-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {slide.description}
                </p>
                {/* Slide counter */}
                <p className="font-mono text-[9px] text-stamp-700 mt-6 tracking-[0.2em]">
                  {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls strip */}
        <div className="flex items-center justify-between mt-5 px-1">
          <button
            onClick={prev}
            className="font-mono text-[10px] text-stamp-500 hover:text-stamp-200 tracking-[0.15em] uppercase transition-colors px-2 py-1 rounded hover:bg-stamp-800/50 active:translate-y-[1px]"
          >
            &#9664; PREV
          </button>

          {/* Dots + power LED */}
          <div className="flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-200 rounded-sm ${
                  i === current
                    ? "w-4 h-2 bg-stamp-300"
                    : "w-2 h-2 bg-stamp-700 hover:bg-stamp-500"
                }`}
              />
            ))}
            {/* Power LED */}
            <div
              className="w-2 h-2 rounded-full bg-ledger-green ml-2 animate-pulse"
              style={{ boxShadow: "0 0 6px rgba(61,107,79,0.8), 0 0 12px rgba(61,107,79,0.4)" }}
            />
          </div>

          <button
            onClick={next}
            className="font-mono text-[10px] text-stamp-500 hover:text-stamp-200 tracking-[0.15em] uppercase transition-colors px-2 py-1 rounded hover:bg-stamp-800/50 active:translate-y-[1px]"
          >
            NEXT &#9654;
          </button>
        </div>
      </div>
    </div>
  );
}
