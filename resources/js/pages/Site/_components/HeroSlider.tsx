// src/components/HeroSlider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Circle, Dot } from 'lucide-react'; // Usaremos Dot para o indicador ativo

// Defina heroSlidesData aqui ou importe de outro arquivo
const heroSlidesDataEPI = [
    {
      id: 1,
      imageUrl: '/images/capacete.jpg',
      altText: 'Capacete de segurança em ambiente industrial',
      supertitle: 'SEGURANÇA EM PRIMEIRO LUGAR',
      title: 'Capacetes de Alta Resistência',
      subtitle: 'Proteção certificada para sua cabeça em qualquer ambiente de trabalho.',
      ctaText: 'Ver Capacetes',
      ctaLink: '/products',
      textPosition: 'right',
      textColor: 'text-white',
      overlayColor: 'bg-black/40'
    },
    {
      id: 2,
      imageUrl: '/images/luvas.svg',
      altText: 'Variedade de luvas de proteção industrial',
      supertitle: 'PROTEÇÃO PARA SUAS MÃOS',
      title: 'Luvas para Todas as Necessidades',
      subtitle: 'Desde proteção contra cortes até manuseio de químicos, temos a luva ideal.',
      ctaText: 'Explorar Luvas',
      ctaLink: '/products',
      textPosition: 'center',
      textColor: 'text-white',
      overlayColor: 'bg-gradient-to-t from-slate-800/70 via-slate-800/50 to-transparent'
    },
    {
      id: 3,
      imageUrl: '/images/oculos.jpg',
      altText: 'Óculos de segurança transparentes',
      supertitle: 'VISÃO SEGURA, TRABALHO PRECISO',
      title: 'Óculos de Proteção Avançados',
      subtitle: 'Lentes anti-embaçantes e resistentes a impacto para máxima clareza e segurança.',
      ctaText: 'Ver Óculos',
      ctaLink: '/products',
      textPosition: 'right',
      textColor: 'text-white', // Mudei para branco para melhor contraste com overlay escuro
      overlayColor: 'bg-sky-800/40' // Overlay com cor para contraste
    },
    {
      id: 4,
      imageUrl: '/images/mascara.jpg',
      altText: 'Respirador de proteção facial',
      supertitle: 'RESPIRE COM SEGURANÇA',
      title: 'Proteção Respiratória Eficaz',
      subtitle: 'Máscaras e respiradores contra poeira, gases e vapores.',
      ctaText: 'Linha Respiratória',
      ctaLink: '/products',
      textPosition: 'left',
      textColor: 'text-white',
      overlayColor: 'bg-neutral-900/50'
    }
  ];
  
  // No seu componente HeroSlider, use:
  // <HeroSlider slides={heroSlidesDataEPI_Placeholder} />
  
  // Você usaria esta variável no seu componente HeroSlider:
  // <HeroSlider slides={heroSlidesDataEPI} />


const HeroSlider = ({ slides = heroSlidesDataEPI, autoplayInterval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (autoplayInterval && !isPaused) {
      const timer = setInterval(nextSlide, autoplayInterval);
      return () => clearInterval(timer); // Limpa o timer ao desmontar ou quando isPaused/autoplayInterval mudar
    }
  }, [nextSlide, autoplayInterval, isPaused]);

  if (!slides || slides.length === 0) {
    return <div className="text-center py-10">Sem slides para exibir.</div>;
  }

  const activeSlide = slides[currentSlide];

  const getTextAlignment = (position) => {
    switch (position) {
      case 'left': return 'items-start text-left';
      case 'right': return 'items-end text-right';
      case 'center':
      default: return 'items-center text-center';
    }
  };

  return (
    <div
      className="relative w-full h-[80vh] lg:rounded-4xl container mx-auto  lg:h-[500px] md:max-h-[500px] overflow-hidden group" // group para hover nos botões
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.altText}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            {slide.overlayColor && slide.overlayColor !== 'none' && (
              <div className={`absolute inset-0 ${slide.overlayColor}`}></div>
            )}

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col justify-center p-8 md:p-16 lg:p-24 ${getTextAlignment(slide.textPosition)} ${slide.textColor}`}>
              {slide.supertitle && (
                <p className="text-sm md:text-base font-semibold tracking-wider uppercase mb-1 md:mb-2 opacity-80">
                  {slide.supertitle}
                </p>
              )}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-base md:text-lg lg:text-xl max-w-xl mb-6 md:mb-8 opacity-90">
                  {slide.subtitle}
                </p>
              )}
              {slide.ctaText && slide.ctaLink && (
                <a
                  href={slide.ctaLink}
                  className={`py-2 px-5 md:py-3 md:px-7 text-sm md:text-base font-semibold !bg-orange-600 rounded-md transition-transform duration-300 ease-out hover:scale-105
                    ${slide.textColor === 'text-white' ? 'bg-primary text-white hover:bg-orange-700' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  {slide.ctaText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-3 md:left-5 transform -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Slide Anterior"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-3 md:right-5 transform -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Próximo Slide"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Ir para o slide ${index + 1}`}
              className={`p-1 transition-all duration-300 rounded-full ${
                index === currentSlide ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
            >
              {index === currentSlide ? (
                 <Dot size={14} className="text-white bg-primary rounded-full" /> // Ícone ativo maior ou com cor diferente
              ) : (
                <Circle size={10} className="text-white/70" fill="currentColor" /> // Ícone inativo preenchido
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;