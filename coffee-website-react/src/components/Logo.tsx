import React from 'react';
import stockbridgeLogoTeal from '../assets/logo-variants/logo-stockbridge-teal.png';
import stockbridgeLogoGolden from '../assets/logo-variants/logo-stockbridge-golden.png';
import stockbridgeLogoGrey from '../assets/logo-variants/logo-stockbridge-grey.png';

/**
 * Logo component for Stockbridge Coffee
 *
 * Supports multiple color variants that adapt to different backgrounds and contexts:
 * - 'teal': Blue-teal variant (default) for light backgrounds
 * - 'golden': Golden variant for premium/warm contexts (currently uses teal as fallback)
 * - 'grey': Grey variant for dark or subtle backgrounds (currently uses teal as fallback)
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
        return isDark ? stockbridgeLogoGrey : stockbridgeLogoTeal;
      }
      return stockbridgeLogoTeal;
    }

    const variantMap = {
      teal: stockbridgeLogoTeal,
      golden: stockbridgeLogoGolden,
      grey: stockbridgeLogoGrey,
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
      // @ts-ignore - fetchpriority is valid but not in types yet
      fetchpriority={priority ? 'high' : undefined}
      onClick={onClick}
    />
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
