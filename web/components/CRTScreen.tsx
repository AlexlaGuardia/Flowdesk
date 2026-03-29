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
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* CRT Cabinet */}
      <div className="bg-gradient-to-b from-stamp-700 via-stamp-600 to-stamp-800 p-6 md:p-8 rounded-[16px] screen-glow">
        {/* Screen */}
        <div className="relative bg-stamp-900 rounded-crt overflow-hidden" style={{ boxShadow: "inset 0 0 50px rgba(0,0,0,0.3)" }}>
          {/* Scanlines overlay */}
          <div className="crt-scanlines crt-vignette min-h-[280px] md:min-h-[320px] flex items-center justify-center p-8">
            {/* Slide content */}
            <div className={`text-center transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}>
              <div className="text-4xl mb-4">{slide.icon}</div>
              <h3 className="font-heading text-stamp-200 text-sm md:text-base tracking-wider mb-3">
                {slide.title}
              </h3>
              <p className="text-stamp-400 text-sm max-w-sm mx-auto">
                {slide.description}
              </p>
              <p className="text-stamp-500 font-mono text-xs mt-6">
                {current + 1}/{slides.length}
              </p>
            </div>
          </div>
        </div>

        {/* Controls strip */}
        <div className="flex items-center justify-between mt-4 px-2">
          <button onClick={prev} className="text-stamp-400 hover:text-stamp-200 font-mono text-sm tracking-wider transition-colors">
            &#9664; PREV
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? "bg-stamp-300" : "bg-stamp-600 hover:bg-stamp-500"
                }`}
              />
            ))}
            {/* Power LED */}
            <div className="w-2 h-2 rounded-full bg-ledger-green ml-3 animate-pulse" />
          </div>

          <button onClick={next} className="text-stamp-400 hover:text-stamp-200 font-mono text-sm tracking-wider transition-colors">
            NEXT &#9654;
          </button>
        </div>
      </div>
    </div>
  );
}
