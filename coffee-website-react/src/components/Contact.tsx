import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin } from 'lucide-react'
import { LocationMap } from './LocationMap'

type TabType = 'info' | 'form' | 'location'

export function Contact() {
  const [activeTab, setActiveTab] = useState<TabType>('info')

  return (
    <section id="contact" className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-4">
            Get In Touch
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-heading mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-text max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-4">
          <motion.button
            onClick={() => setActiveTab('info')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover-lift ${
              activeTab === 'info'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-grey-700 hover:bg-accent/10 hover:text-accent hover:shadow-md'
            }`}
          >
            Contact Info
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('form')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover-lift ${
              activeTab === 'form'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-grey-700 hover:bg-accent/10 hover:text-accent hover:shadow-md'
            }`}
          >
            Send Message
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('location')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover-lift ${
              activeTab === 'location'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-grey-700 hover:bg-accent/10 hover:text-accent hover:shadow-md'
            }`}
          >
            Location
          </motion.button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {activeTab === 'info' && (
            <div className="bg-white rounded-2xl shadow-large p-8 md:p-12">
              <div className="flex justify-center">
                <motion.div
                  className="flex items-start gap-4 p-6 rounded-xl hover:bg-accent/5 transition-all duration-300 cursor-pointer group hover-lift max-w-md"
                  whileHover={{ x: 4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent group-hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Mail className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-300" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-heading mb-1 group-hover:text-accent transition-colors duration-300">Email</h3>
                    <p className="text-text">hello@stockbridgecoffee.com</p>
                    <p className="text-text">support@stockbridgecoffee.com</p>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div className="bg-white rounded-2xl shadow-large p-8 md:p-12">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="name" className="block text-sm font-semibold text-heading mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/50 transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="email" className="block text-sm font-semibold text-heading mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/50 transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <label htmlFor="subject" className="block text-sm font-semibold text-heading mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/50 transition-all duration-200"
                    placeholder="How can we help?"
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <label htmlFor="message" className="block text-sm font-semibold text-heading mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/50 transition-all duration-200 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-cta text-white font-semibold rounded-lg hover:bg-gradient-cta-hover transition-all duration-300 shadow-medium hover:shadow-large hover-lift relative overflow-hidden group"
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative">Send Message</span>
                </motion.button>
              </form>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-large overflow-hidden">
              {/* Google Maps Component */}
              <div className="aspect-video bg-grey-200 dark:bg-grey-800 relative">
                <LocationMap />
              </div>

              {/* Location Details */}
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-heading mb-4">Our Location</h3>
                <p className="text-text mb-6">
                  We're an online coffee bean shop based in Stockbridge, Edinburgh. While we don't have a physical storefront, we're proud to serve customers across the UK with premium beans delivered straight to your door.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <motion.div
                    className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-heading mb-1">Based In</h4>
                      <p className="text-text text-sm">Stockbridge, Edinburgh</p>
                      <p className="text-text text-sm">Scotland, UK</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-heading mb-1">Delivery</h4>
                      <p className="text-text text-sm">UK-wide delivery available</p>
                      <p className="text-text text-sm">Order online anytime</p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-grey-200 dark:border-grey-700">
                  <div className="flex-1">
                    <p className="text-text text-sm leading-relaxed">
                      <span className="font-semibold text-heading">Looking for our beans?</span><br />
                      Browse our selection of premium single-origin and specialty blends in our online shop. We roast to order and deliver fresh beans directly to you.
                    </p>
                  </div>
                </div>

                {/* Shop Beans Button */}
                <motion.a
                  href="#products"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Shop Beans
                </motion.a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
