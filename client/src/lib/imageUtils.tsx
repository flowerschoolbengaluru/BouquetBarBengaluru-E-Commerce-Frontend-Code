/**
 * Image utility functions for handling image paths and lazy loading
 * Replaces Base64 image handling with file path-based approach
 */

import React from "react";

export interface ImageOptions {
  fallback?: string;
  width?: number;
  height?: number;
}

/**
 * Get image URL from path or Base64
 * @param imagePath - Path to image (e.g., "uploads/products/uuid.jpg") or Base64 string
 * @param options - Options for image rendering
 * @returns - URL to use in img src attribute
 */
export function getImageUrl(imagePath: string | undefined, options: ImageOptions = {}): string {
  const fallback = options.fallback || "/placeholder-image.jpg";

  if (!imagePath) {
    return fallback;
  }

  // If it's a path (starts with uploads/ or /), return as-is or with API prefix
  if (imagePath.startsWith("uploads/") || imagePath.startsWith("/uploads/")) {
    // Return API endpoint to serve from disk
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
    return `/api/images?path=${encodeURIComponent(cleanPath)}`;
  }

  // If it's already a data URL (Base64), return as-is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // If it's a URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Otherwise treat as path
  return `/api/images?path=${encodeURIComponent(imagePath)}`;
}

/**
 * Hook for lazy loading images with Intersection Observer
 * Usage: const ref = useLazyImage(imageUrl);
 */
export function useLazyImage(imageUrl: string) {
  const ref: React.RefObject<HTMLImageElement> = React.createRef();

  React.useEffect(() => {
    const currentImg = ref.current;
    if (!currentImg) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentImg.src = imageUrl;
            observer.unobserve(currentImg);
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(currentImg);

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [imageUrl, ref]);

  return ref;
}

/**
 * Simple lazy loading wrapper component
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}> = ({ src, alt, className = "", width, height }) => {
  const [imageSrc, setImageSrc] = React.useState<string>("/placeholder-image.jpg");

  React.useEffect(() => {
    setImageSrc(getImageUrl(src));
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

/**
 * Extract image URL from product object
 * Handles both old Base64 and new path-based storage
 */
export function getProductImageUrl(product: any, imageIndex: number = 0): string {
  const imageFields = [
    { path: "imagePath", base64: "image" },
    { path: "imageFirstPath", base64: "imagefirst" },
    { path: "imageSecondPath", base64: "imagesecond" },
    { path: "imageThirdPath", base64: "imagethirder" },
    { path: "imageFourthPath", base64: "imagefoure" },
    { path: "imageFifthPath", base64: "imagefive" },
  ];

  if (imageIndex < 0 || imageIndex >= imageFields.length) {
    return "/placeholder-image.jpg";
  }

  const field = imageFields[imageIndex];
  const pathValue = product[field.path];
  const base64Value = product[field.base64];

  // Prefer path over Base64
  if (pathValue) {
    return getImageUrl(pathValue);
  }

  if (base64Value) {
    return base64Value.startsWith("data:") ? base64Value : getImageUrl(base64Value);
  }

  return "/placeholder-image.jpg";
}

/**
 * Get all images for a product
 */
export function getProductImages(product: any): Array<{ url: string; field: string }> {
  const imageFields = [
    { path: "imagePath", base64: "image", field: "Primary" },
    { path: "imageFirstPath", base64: "imagefirst", field: "First" },
    { path: "imageSecondPath", base64: "imagesecond", field: "Second" },
    { path: "imageThirdPath", base64: "imagethirder", field: "Third" },
    { path: "imageFourthPath", base64: "imagefoure", field: "Fourth" },
    { path: "imageFifthPath", base64: "imagefive", field: "Fifth" },
  ];

  return imageFields
    .map((field) => {
      const pathValue = product[field.path];
      const base64Value = product[field.base64];

      if (pathValue) {
        return { url: getImageUrl(pathValue), field: field.field };
      }
      if (base64Value) {
        return {
          url: base64Value.startsWith("data:") ? base64Value : getImageUrl(base64Value),
          field: field.field,
        };
      }
      return null;
    })
    .filter((img): img is { url: string; field: string } => img !== null && img.url !== "/placeholder-image.jpg");
}
