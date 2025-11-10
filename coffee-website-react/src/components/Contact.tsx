import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

type TabType = 'info' | 'form' | 'location'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export function Contact() {
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage('Thank you for your message! We will get back to you soon.')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage('Failed to send message. Please try again later.')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus('error')
      setSubmitMessage('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'info'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-grey-700 hover:bg-grey-100'
            }`}
          >
            Contact Info
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'form'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-grey-700 hover:bg-grey-100'
            }`}
          >
            Send Message
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'location'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-grey-700 hover:bg-grey-100'
            }`}
          >
            Location
          </button>
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
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1">Email</h3>
                      <p className="text-text">hello@stockbridgecoffee.com</p>
                      <p className="text-text">support@stockbridgecoffee.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1">Phone</h3>
                      <p className="text-text">+44 (0) 131 555 0123</p>
                      <p className="text-text text-sm text-grey-600">Mon-Fri, 8am-6pm GMT</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1">Address</h3>
                      <p className="text-text">123 High Street</p>
                      <p className="text-text">Stockbridge, Edinburgh</p>
                      <p className="text-text">EH3 6SS, Scotland</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-heading mb-1">Business Hours</h3>
                      <p className="text-text">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-text">Saturday: 9:00 AM - 5:00 PM</p>
                      <p className="text-text">Sunday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div className="bg-white rounded-2xl shadow-large p-8 md:p-12">
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg ${
                    submitStatus === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {submitMessage}
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-heading mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-heading mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-heading mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-heading mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-grey-300 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-cta text-white font-semibold rounded-lg hover:bg-gradient-cta-hover transition-all duration-200 shadow-medium hover:shadow-large disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
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
