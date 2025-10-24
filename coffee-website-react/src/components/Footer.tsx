export function Footer() {
  return (
    <footer className="bg-heading text-contrast/80 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1 */}
          <div>
            <h4 className="font-display text-xl font-bold text-contrast mb-4">Stockbridge Coffee</h4>
            <p className="text-sm leading-relaxed text-contrast/80">
              Bringing you the world's finest coffee beans, roasted to perfection.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold text-contrast mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-sm hover:text-accent transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-sm hover:text-accent transition-colors duration-200">
                  Products
                </a>
              </li>
              <li>
                <a href="#blog" className="text-sm hover:text-accent transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm hover:text-accent transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm hover:text-accent transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-semibold text-contrast mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-contrast/80">
              <li>Email: hello@stockbridgecoffee.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Fri 8am-6pm</li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-semibold text-contrast mb-4">Newsletter</h4>
            <p className="text-sm mb-4 text-contrast/80">Subscribe for updates and special offers.</p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-lg bg-heading/40 border border-contrast/20 text-contrast placeholder-contrast/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-cta text-heading font-semibold text-sm tracking-wide uppercase shadow-medium transition-all duration-200 hover:bg-gradient-cta-hover hover:shadow-large focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/60"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-contrast/15 text-center">
          <p className="text-sm text-contrast/70">&copy; 2025 Stockbridge Coffee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
