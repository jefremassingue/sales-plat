import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Circle, Dot } from 'lucide-react';
import { HeroSlider as HeroSliderType } from '@/types';

interface HeroSliderProps {
  slides: HeroSliderType[];
  autoplayInterval?: number;
}

const HeroSlider = ({ slides = [], autoplayInterval = 5000 }: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (autoplayInterval && !isPaused && slides.length > 1) {
      const timer = setInterval(nextSlide, autoplayInterval);
      return () => clearInterval(timer);
    }
  }, [nextSlide, autoplayInterval, isPaused, slides.length]);

  if (!slides || slides.length === 0) {
    return <div className="text-center py-10">Sem slides para exibir.</div>;
  }

  const getTextAlignment = (position: string) => {
    switch (position) {
      case 'left': return 'items-start text-left';
      case 'right': return 'items-end text-right';
      case 'center':
      default: return 'items-center text-center';
    }
  };

  return (
    <div
      className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[500px] lg:rounded-2xl overflow-hidden rounded-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <img
              src={slide.image_url || ''}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {slide.overlay_color && slide.overlay_color !== 'none' && (
              <div className={`absolute inset-0 ${slide.overlay_color}`}></div>
            )}

            <div className={`absolute inset-0 flex flex-col justify-center p-4 sm:p-8 md:p-16 lg:p-24 ${getTextAlignment(slide.text_position)} ${slide.text_color}`}>
              {slide.supertitle && (
                <p className="text-xs sm:text-sm md:text-base font-semibold tracking-wider uppercase mb-1 md:mb-2 opacity-80">
                  {slide.supertitle}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-md sm:max-w-lg md:max-w-xl mb-4 sm:mb-6 md:mb-8 opacity-90">
                  {slide.subtitle}
                </p>
              )}
              {slide.cta_text && slide.cta_link && (
                <a
                  href={slide.cta_link}
                  className={`py-2 px-4 sm:px-5 md:py-3 md:px-7 text-xs sm:text-sm md:text-base font-semibold bg-orange-600 rounded-md transition-transform duration-300 ease-out hover:scale-105 ${slide.text_color === 'text-white' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                  {slide.cta_text}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 sm:left-3 md:left-5 transform -translate-y-1/2 z-20 p-1 sm:p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Slide Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 sm:right-3 md:right-5 transform -translate-y-1/2 z-20 p-1 sm:p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Próximo Slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Ir para o slide ${index + 1}`}
              className={`p-1 transition-all duration-300 rounded-full ${index === currentSlide ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}>
              {index === currentSlide ? (
                 <Dot size={12} className="text-white bg-orange-600 rounded-full" />
              ) : (
                <Circle size={8} className="text-white/70" fill="currentColor" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;