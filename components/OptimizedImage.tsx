import Image from 'next/image';
import { ImagePipeline } from '@/lib/image-pipeline';

interface OptimizedImageProps {
  mediaRecord: any;
  size?: 'hero' | 'card' | 'thumb';
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  mediaRecord,
  size = 'card',
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const imageUrl = ImagePipeline.getImageUrl(mediaRecord, size);
  
  // Get dimensions from metadata or use defaults
  const dimensions = mediaRecord.meta?.sizes?.[size] || { width: 800, height: 450 };
  const finalWidth = width || dimensions.width;
  const finalHeight = height || dimensions.height;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      className={className}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
