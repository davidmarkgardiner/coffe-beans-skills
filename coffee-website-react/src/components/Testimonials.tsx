import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Coffee Enthusiast',
    content: 'The Ethiopian Yirgacheffe is absolutely divine. The citrus notes are perfectly balanced, and the quality is unmatched.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Cafe Owner',
    content: "We've been sourcing from Stockbridge for two years. Their consistency and customer service are exceptional.",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Home Barista',
    content: 'The House Blend has become my daily ritual. Rich, smooth, and perfectly roasted every single time.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-grey-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-coffee-700 mb-4">
            Testimonials
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-grey-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-grey-600 max-w-2xl mx-auto">
            Join thousands of satisfied coffee lovers who trust Stockbridge for their daily brew
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-medium hover:shadow-large transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-grey-900">{testimonial.name}</h4>
                  <p className="text-sm text-grey-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-grey-700 leading-relaxed italic">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
