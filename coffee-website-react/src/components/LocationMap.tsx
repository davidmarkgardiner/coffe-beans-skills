import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useTheme } from '../contexts/ThemeContext'
import { MapPin } from 'lucide-react'

interface LocationMapProps {
  onLoadError?: (error: Error) => void
}

// Dark mode map styles
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B8975A' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B8975A' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B8975A' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
]

// Light mode map styles (subtle, clean)
const lightMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
]

export function LocationMap({ onLoadError }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { theme } = useTheme()

  // Use intersection observer to lazy load the map
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // General Stockbridge area location (not a physical shop)
  const location = {
    address: 'Stockbridge, Edinburgh',
    lat: 55.9645, // Stockbridge, Edinburgh center
    lng: -3.2086,
    name: 'Stockbridge Coffee',
    description: 'Online Bean Shop',
  }

  // Combine refs for the map container
  const setRefs = (element: HTMLDivElement | null) => {
    inViewRef(element)
    if (element) {
      mapRef.current = element
    }
  }

  // Load Google Maps API
  useEffect(() => {
    if (!inView || apiLoaded) return

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      const error = new Error('Google Maps API key is missing')
      console.error(error)
      setHasError(true)
      onLoadError?.(error)
      return
    }

    // Check if API is already loaded
    if (window.google?.maps) {
      setApiLoaded(true)
      return
    }

    // Listen for Google Maps API errors
    const handleGoogleMapsError = () => {
      console.error('Google Maps API error - check console for details')
      setHasError(true)
      const error = new Error('Google Maps API failed to initialize')
      onLoadError?.(error)
    }

    // Set up error handler before loading script
    window.gm_authFailure = handleGoogleMapsError

    // Create script element
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      // Check if Google Maps loaded successfully
      if (window.google?.maps) {
        setApiLoaded(true)
      } else {
        handleGoogleMapsError()
      }
    }

    script.onerror = () => {
      const error = new Error('Failed to load Google Maps API script')
      console.error(error)
      setHasError(true)
      onLoadError?.(error)
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup is tricky with Google Maps, so we don't remove the script
      // as it might be used by other components
    }
  }, [inView, apiLoaded, onLoadError])

  // Initialize map when API is loaded
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || mapInstanceRef.current) return

    try {
      // Create map
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 16,
        styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
      })

      mapInstanceRef.current = map

      // Create custom marker icon (coffee cup SVG)
      const markerIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, 8)">
              <!-- Coffee cup body -->
              <path d="M8 12 L8 28 Q8 32 12 32 L28 32 Q32 32 32 28 L32 12 Z"
                fill="#212f1f" stroke="#B8975A" stroke-width="2"/>
              <!-- Coffee handle -->
              <path d="M32 18 Q36 18 36 22 Q36 26 32 26"
                fill="none" stroke="#212f1f" stroke-width="2.5" stroke-linecap="round"/>
              <!-- Steam lines -->
              <path d="M14 8 Q14 4 16 4 Q16 6 16 8"
                stroke="#B8975A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              <path d="M20 6 Q20 2 22 2 Q22 4 22 6"
                stroke="#B8975A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              <path d="M26 8 Q26 4 28 4 Q28 6 28 8"
                stroke="#B8975A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </g>
            <!-- Pointer -->
            <circle cx="20" cy="45" r="3" fill="#212f1f"/>
            <path d="M20 42 L20 38" stroke="#212f1f" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(40, 50),
        anchor: new google.maps.Point(20, 50),
      }

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
      })

      markerRef.current = marker

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: Inter, sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #212f1f;">
              ${location.name}
            </h3>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #5a6c57; line-height: 1.4;">
              ${location.description}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #7a8c77; line-height: 1.5;">
              We're an online coffee bean shop based in ${location.address}. Order premium beans for delivery across the UK.
            </p>
            <a href="#products"
               style="display: inline-block; padding: 8px 16px; background: #B8975A; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
              Shop Beans
            </a>
          </div>
        `,
      })

      infoWindowRef.current = infoWindow

      // Add click listener to marker
      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      // Auto-open info window after a short delay
      setTimeout(() => {
        infoWindow.open(map, marker)
      }, 500)

      setMapLoaded(true)
    } catch (error) {
      console.error('Error initializing map:', error)
      onLoadError?.(error as Error)
    }
  }, [apiLoaded, theme, onLoadError])

  // Update map styles when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapInstanceRef.current.setOptions({
      styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
    })
  }, [theme])

  // Show error fallback if API key is missing or load failed
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-grey-100 dark:bg-grey-800 rounded-2xl">
        <div className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-accent" />
          <h3 className="text-lg font-semibold text-heading mb-2">
            Stockbridge, Edinburgh
          </h3>
          <p className="text-text text-sm mb-3">
            We're based in Stockbridge, Edinburgh, Scotland
          </p>
          <details className="text-left mt-4">
            <summary className="text-xs text-text/60 cursor-pointer hover:text-accent">
              Why isn't the map loading?
            </summary>
            <div className="text-xs text-text/70 mt-2 space-y-2">
              <p>The Google Maps API requires:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>A valid API key</li>
                <li>Maps JavaScript API enabled in Google Cloud Console</li>
                <li>Billing enabled on the Google Cloud project</li>
                <li>Domain restrictions configured to allow localhost</li>
              </ul>
              <p className="mt-2">See README_GOOGLE_MAPS.md for setup instructions.</p>
            </div>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl relative">
      {/* Map container - always present */}
      <div
        ref={setRefs}
        className="w-full h-full"
        role="application"
        aria-label="Google Maps showing Stockbridge Coffee location"
      />

      {/* Loading overlay - shown until map loads */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface dark:bg-grey-800 animate-pulse">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text/60 dark:text-grey-400 font-medium">
              Loading map...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
