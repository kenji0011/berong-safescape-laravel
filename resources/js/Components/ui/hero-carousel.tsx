import { useEffect, useState } from 'react';
import { HeroCarouselClient } from './hero-carousel-client';
import { HeroCarouselSkeleton } from '@/Components/dashboard-skeletons';

type CarouselImage = {
  id: number;
  title: string;
  altText: string | null;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export function HeroCarousel({ initialImages }: { initialImages?: CarouselImage[] }) {
  const [images, setImages] = useState<CarouselImage[]>(initialImages || []);
  const [loading, setLoading] = useState(!initialImages);

  useEffect(() => {
    if (initialImages) return;

    fetch('/api/content/carousel')
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <HeroCarouselSkeleton />;
  }

  if (images.length === 0) {
    return <div className="w-full h-96 bg-gray-200 flex items-center justify-center">No Carousel Images Available</div>;
  }

  return <HeroCarouselClient images={images} />;
}
