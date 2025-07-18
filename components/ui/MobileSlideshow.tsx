"use client"

import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"

interface Slide {
  image: string
  alt: string
}

interface MobileSlideshowProps {
  slides: Slide[]
  autoPlayInterval?: number
  imageClassName?: string
}

export default function MobileSlideshow({ slides, autoPlayInterval = 3000, imageClassName }: MobileSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const slideRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Autoplay logic
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, autoPlayInterval)
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlaying, slides.length, autoPlayInterval])

  // Swipe logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current
      if (diff > 50) nextSlide()
      else if (diff < -50) prevSlide()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }
  const toggleAutoPlay = () => setIsAutoPlaying((prev) => !prev)

  return (
    <div className="relative">
      <div
        ref={slideRef}
        className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <div className="relative h-full">
          <Image
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].alt}
            fill
            className={imageClassName ? `${imageClassName} transition-all duration-700 ease-in-out` : "object-cover transition-all duration-700 ease-in-out"}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Mobile-friendly Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </button>

        {/* Auto-play toggle for mobile */}
        <button
          onClick={toggleAutoPlay}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 md:hidden"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <Pause className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
          ) : (
            <Play className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
          )}
        </button>

        {/* Mobile-optimized Slide Indicators */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-white w-6 sm:w-8" : "bg-white/60 w-1.5 sm:w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Swipe indicator for mobile */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-xs sm:text-sm md:hidden">
          Swipe to navigate
        </div>
      </div>

      {/* Mobile-optimized Thumbnail Strip - Hidden on very small screens */}
      <div className="hidden sm:flex space-x-2 p-2 mt-3 md:mt-4 overflow-x-auto pb-2 scrollbar-hide">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative flex-shrink-0 w-12 h-9 sm:w-16 sm:h-12 rounded-md lg:rounded-lg overflow-hidden transition-all duration-200 ${
              index === currentSlide ? "ring-2 ring-blue-600 scale-105" : "opacity-60 hover:opacity-100"
            }`}
            aria-label={`View slide ${index + 1}`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  )
} 