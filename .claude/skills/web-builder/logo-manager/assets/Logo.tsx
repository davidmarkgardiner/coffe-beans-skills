import React from 'react';

/**
 * Logo component for Stockbridge Coffee
 *
 * Supports multiple color variants that adapt to different backgrounds and contexts:
 * - 'teal': Blue-teal variant (default) for light backgrounds
 * - 'golden': Golden variant for premium/warm contexts
 * - 'grey': Grey variant for dark or subtle backgrounds
 * - 'auto': Automatically switches based on theme (teal for light, grey for dark)
 *
 * @example
 * // Basic usage
 * <Logo />
 *
 * @example
 * // With specific variant
 * <Logo variant="golden" size={64} />
 *
 * @example
 * // Auto-switching based on theme
 * <Logo variant="auto" />
 *
 * @example
 * // With custom className for positioning
 * <Logo className="absolute top-4 left-4" />
 */

export interface LogoProps {
  /** Color variant of the logo */
  variant?: 'teal' | 'golden' | 'grey' | 'auto';
  /** Height of the logo in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Whether to prioritize loading (for above-fold logos) */
  priority?: boolean;
  /** Optional click handler for linked logos */
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'teal',
  size = 56,
  className = '',
  alt = 'Stockbridge Coffee',
  priority = false,
  onClick,
}) => {
  // Determine which logo variant to use
  const getLogoSrc = () => {
    if (variant === 'auto') {
      // Check for dark mode preference
      if (typeof window !== 'undefined') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark
          ? '/images/logo-stockbridge-grey.png'
          : '/images/logo-stockbridge-teal.png';
      }
      return '/images/logo-stockbridge-teal.png';
    }

    const variantMap = {
      teal: '/images/logo-stockbridge-teal.png',
      golden: '/images/logo-stockbridge-golden.png',
      grey: '/images/logo-stockbridge-grey.png',
    };

    return variantMap[variant];
  };

  const logoSrc = getLogoSrc();

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      style={{ height: `${size}px`, width: 'auto' }}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      onClick={onClick}
    />
  );
};

/**
 * Logo component with <picture> element for optimal format delivery
 * Automatically serves WebP when supported, falls back to PNG
 * Includes dark mode switching via media queries
 */
export const LogoPicture: React.FC<Omit<LogoProps, 'variant'>> = ({
  size = 56,
  className = '',
  alt = 'Stockbridge Coffee',
  priority = false,
  onClick,
}) => {
  return (
    <picture onClick={onClick} className={className}>
      {/* Dark mode WebP */}
      <source
        srcSet="/images/logo-stockbridge-grey.webp"
        media="(prefers-color-scheme: dark)"
        type="image/webp"
      />
      {/* Light mode WebP */}
      <source srcSet="/images/logo-stockbridge-teal.webp" type="image/webp" />
      {/* Dark mode PNG fallback */}
      <source
        srcSet="/images/logo-stockbridge-grey.png"
        media="(prefers-color-scheme: dark)"
      />
      {/* Default light mode PNG */}
      <img
        src="/images/logo-stockbridge-teal.png"
        alt={alt}
        style={{ height: `${size}px`, width: 'auto' }}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
      />
    </picture>
  );
};

/**
 * Logo overlay component for use on top of images
 * Includes drop shadow for better visibility
 */
export const LogoOverlay: React.FC<LogoProps & {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}> = ({
  variant = 'auto',
  size = 48,
  position = 'bottom-left',
  className = '',
  alt = 'Stockbridge Coffee',
}) => {
  const positionClasses = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <Logo
      variant={variant}
      size={size}
      className={`absolute ${positionClasses[position]} drop-shadow-lg ${className}`}
      alt={alt}
      priority
    />
  );
};

export default Logo;
