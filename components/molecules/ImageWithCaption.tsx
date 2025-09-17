import Image from 'next/image';

interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageWithCaption({
  src,
  alt,
  caption,
  width = 800,
  height = 600,
  className = '',
}: ImageWithCaptionProps) {
  return (
    <figure className={`max-w-full ${className}`}>
      <div className="relative" style={{ width, height }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}