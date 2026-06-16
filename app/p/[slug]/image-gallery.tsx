'use client';

import { useState } from 'react';

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface ImageGalleryProps {
  images: ProductImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
  const [activeUrl, setActiveUrl] = useState<string | null>(primary?.url ?? null);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
        <span className="text-sm">No images available</span>
      </div>
    );
  }

  const activeImage = images.find((img) => img.url === activeUrl) ?? images[0];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="w-full aspect-video bg-slate-100 rounded-xl overflow-hidden">
        <img
          src={activeImage.url}
          alt={activeImage.alt ?? 'Product image'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails — only shown when there are multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img) => {
            const isActive = img.url === activeUrl;
            return (
              <button
                key={img.id}
                onClick={() => setActiveUrl(img.url)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                  isActive ? 'border-slate-800' : 'border-transparent hover:border-slate-400'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? 'Product thumbnail'}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
