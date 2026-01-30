interface StockbridgeLogoProps {
  light?: boolean
  className?: string
}

export function StockbridgeLogo({ light = true, className = '' }: StockbridgeLogoProps) {
  const primaryColor = light ? '#ffffff' : '#c8956c'
  const accentColor = light ? 'rgba(255,255,255,0.6)' : 'rgba(200,149,108,0.6)'

  return (
    <svg
      viewBox="0 0 280 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-10 md:h-12 w-auto ${className}`}
      aria-label="Stockbridge Coffee"
      role="img"
    >
      {/* STOCKBRIDGE */}
      <text
        x="140"
        y="24"
        textAnchor="middle"
        fontFamily="'Playfair Display', 'Georgia', serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="4"
        fill={primaryColor}
      >
        STOCKBRIDGE
      </text>
      {/* Decorative line left */}
      <line x1="18" y1="34" x2="95" y2="34" stroke={accentColor} strokeWidth="0.75" />
      {/* COFFEE */}
      <text
        x="140"
        y="44"
        textAnchor="middle"
        fontFamily="'Playfair Display', 'Georgia', serif"
        fontSize="11"
        fontWeight="400"
        letterSpacing="6"
        fill={accentColor}
      >
        COFFEE
      </text>
      {/* Decorative line right */}
      <line x1="185" y1="34" x2="262" y2="34" stroke={accentColor} strokeWidth="0.75" />
    </svg>
  )
}
