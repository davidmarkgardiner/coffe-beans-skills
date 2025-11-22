import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

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
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/5 transition-all duration-300 cursor-pointer group hover-lift"
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

                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/5 transition-all duration-300 cursor-pointer group hover-lift"
                    whileHover={{ x: 4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent group-hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Phone className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1 group-hover:text-accent transition-colors duration-300">Phone</h3>
                      <p className="text-text">+44 (0) 131 555 0123</p>
                      <p className="text-text text-sm text-grey-600">Mon-Fri, 8am-6pm GMT</p>
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/5 transition-all duration-300 cursor-pointer group hover-lift"
                    whileHover={{ x: 4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent group-hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <MapPin className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1 group-hover:text-accent transition-colors duration-300">Address</h3>
                      <p className="text-text">123 High Street</p>
                      <p className="text-text">Stockbridge, Edinburgh</p>
                      <p className="text-text">EH3 6SS, Scotland</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/5 transition-all duration-300 cursor-pointer group hover-lift"
                    whileHover={{ x: 4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent group-hover:shadow-md transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Clock className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1 group-hover:text-accent transition-colors duration-300">Business Hours</h3>
                      <p className="text-text">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-text">Saturday: 9:00 AM - 5:00 PM</p>
                      <p className="text-text">Sunday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </motion.div>
                </div>
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
            <div className="bg-white rounded-2xl shadow-large overflow-hidden">
              <div className="aspect-video bg-grey-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-accent mx-auto mb-3" />
                    <p className="text-heading font-semibold">Map View</p>
                    <p className="text-text text-sm">123 High Street, Stockbridge, Edinburgh</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-heading mb-4">Visit Our Shop</h3>
                <p className="text-text mb-4">
                  Located in the heart of Stockbridge, Edinburgh, our cozy coffee shop welcomes visitors daily.
                  Stop by to browse our selection of premium beans, enjoy a freshly brewed cup, or chat with
                  our expert baristas about the perfect roast for your taste.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <h4 className="font-semibold text-heading mb-1">Parking</h4>
                    <p className="text-text text-sm">Street parking available nearby</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-heading mb-1">Public Transport</h4>
                    <p className="text-text text-sm">Bus routes 24, 29, 42 nearby</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
