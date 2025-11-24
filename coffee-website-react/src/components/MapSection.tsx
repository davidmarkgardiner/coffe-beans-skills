import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Phone, AlertCircle } from 'lucide-react'
import { LocationMap } from './LocationMap'

export function MapSection() {
  const [mapError, setMapError] = useState<Error | null>(null)

  const businessInfo = {
    address: 'Top 8, EH4 2DP, Edinburgh, UK',
    hours: 'Mon-Sat: 7:30 AM - 6:00 PM\nSun: 8:00 AM - 5:00 PM',
    phone: '+44 131 XXX XXXX',
  }

  const handleMapError = (error: Error) => {
    setMapError(error)
  }

  return (
    <section
      id="location"
      className="relative py-32 bg-background dark:bg-grey-900 overflow-hidden transition-colors duration-300"
      aria-label="Coffee shop location and contact information"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(33, 47, 31, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-white/60 dark:bg-grey-800/60 border border-heading/10 dark:border-grey-700/30 rounded-full text-xs font-sans font-medium text-accent-dark dark:text-accent-light tracking-[0.25em] uppercase mb-6 shadow-sm"
          >
            Visit Us
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl font-bold text-heading dark:text-grey-100 mb-6 leading-[1.1]"
          >
            Find Our{' '}
            <span className="text-accent-dark dark:text-accent-light">
              Coffee Shop
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-text/70 dark:text-grey-300 max-w-2xl mx-auto leading-relaxed"
          >
            Stop by our cozy shop in the heart of Edinburgh's Stockbridge
            neighborhood for a freshly brewed cup of our finest beans.
          </motion.p>
        </motion.div>

        {/* Map and Info Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Map Container - Takes 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 w-full"
          >
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-heading/10 dark:border-grey-700/30">
              {mapError ? (
                // Error fallback
                <div className="w-full h-full flex items-center justify-center bg-surface dark:bg-grey-800 p-8">
                  <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold text-heading dark:text-grey-100 mb-2">
                      Map Unavailable
                    </h3>
                    <p className="text-text/70 dark:text-grey-300 mb-6">
                      {mapError.message === 'Google Maps API key is missing'
                        ? 'The map cannot be displayed at this time. Please use the address below to find us.'
                        : 'Unable to load the map. Please check your internet connection or use the address below.'}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        businessInfo.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 font-medium"
                    >
                      <MapPin className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <LocationMap onLoadError={handleMapError} />
              )}
            </div>
          </motion.div>

          {/* Business Info Cards - Takes 1 column on large screens */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="space-y-6"
          >
            {/* Address Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-grey-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-medium border border-heading/10 dark:border-grey-700/30 hover:shadow-large transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded-xl">
                  <MapPin className="w-6 h-6 text-accent-dark dark:text-accent-light" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-heading dark:text-grey-100 mb-2">
                    Address
                  </h3>
                  <p className="text-text/80 dark:text-grey-300 leading-relaxed">
                    {businessInfo.address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      businessInfo.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-accent-dark dark:text-accent-light hover:underline"
                  >
                    Get Directions
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-grey-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-medium border border-heading/10 dark:border-grey-700/30 hover:shadow-large transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded-xl">
                  <Clock className="w-6 h-6 text-accent-dark dark:text-accent-light" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-heading dark:text-grey-100 mb-2">
                    Opening Hours
                  </h3>
                  <div className="text-text/80 dark:text-grey-300 leading-relaxed space-y-1">
                    <p>Mon-Sat: 7:30 AM - 6:00 PM</p>
                    <p>Sun: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-grey-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-medium border border-heading/10 dark:border-grey-700/30 hover:shadow-large transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded-xl">
                  <Phone className="w-6 h-6 text-accent-dark dark:text-accent-light" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-heading dark:text-grey-100 mb-2">
                    Phone
                  </h3>
                  <a
                    href={`tel:${businessInfo.phone.replace(/\s/g, '')}`}
                    className="text-text/80 dark:text-grey-300 hover:text-accent-dark dark:hover:text-accent-light transition-colors duration-200"
                  >
                    {businessInfo.phone}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-br from-accent-dark to-accent dark:from-accent to-accent-light rounded-2xl p-6 text-white shadow-xl"
            >
              <h3 className="font-serif text-xl font-bold mb-2">
                We'd Love to See You!
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Drop by for a cup of our freshly roasted coffee. Our baristas
                are ready to craft your perfect brew.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
