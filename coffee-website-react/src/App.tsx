import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { ProductShowcase } from './components/ProductShowcase'
import { About } from './components/About'
import { Testimonials } from './components/Testimonials'
import { Newsletter } from './components/Newsletter'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { BlogHighlights } from './components/BlogHighlights'
import { CustomCursor } from './components/CustomCursor'
import { LoginModal } from './components/LoginModal'
import { GiftCardSection } from './components/GiftCardSection'
import { GiftCardPurchase } from './components/GiftCardPurchase'
import CartDrawer from './components/CartDrawer'
import CoffeeCopilot from './components/CoffeeCopilot'
import { BlogPost } from './pages/BlogPost'
import { AdminDashboard } from './pages/AdminDashboard'
import { useCart } from './hooks/useCart'

// Component to handle hash-based navigation scrolling
interface HomePageProps {
  onAddToCart: (item: {
    format: 'whole' | 'ground'
    size: '250g' | '1kg'
    quantity: number
    price: number
  }) => void
  onGiftCardClick: () => void
}

function HomePage({ onAddToCart, onGiftCardClick }: HomePageProps) {
  const location = useLocation()

  useEffect(() => {
    // Handle hash-based navigation (e.g., /#blog)
    if (location.hash) {
      const id = location.hash.replace('#', '')
      // Wait for components to render
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      // Scroll to top when navigating to home without hash
      window.scrollTo(0, 0)
    }
  }, [location.hash])

  return (
    <>
      <Hero />
      <About />
      <ProductShowcase onAddToCart={onAddToCart} />
      <GiftCardSection onPurchaseClick={onGiftCardClick} />
      <Testimonials />
      <BlogHighlights />
      <Newsletter />
      <Contact />
    </>
  )
}

function App() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyDiscount,
    removeDiscount,
    appliedDiscount,
    subtotal,
    total,
    itemCount
  } = useCart()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [giftCardModalOpen, setGiftCardModalOpen] = useState(false)

  // Handle adding coffee to cart (new format for single product with options)
  const handleAddCoffeeToCart = (item: {
    format: 'whole' | 'ground'
    size: '250g' | '1kg'
    quantity: number
    price: number
  }) => {
    // Convert to Product type for cart
    const product = {
      id: 'stockbridge-signature',
      name: `Stockbridge Signature - ${item.format === 'whole' ? 'Whole Bean' : 'Ground'}`,
      description: 'Ethiopian Yirgacheffe',
      price: item.price / item.quantity, // Unit price
      weight: item.size,
      category: 'Single Origin',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    }

    // Add to cart with quantity
    for (let i = 0; i < item.quantity; i++) {
      addToCart(product)
    }
  }

  return (
    <>
      <CustomCursor />
      <Navigation
        itemCount={itemCount}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      <Routes>
        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Blog detail page */}
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Home page */}
        <Route path="/" element={
          <HomePage
            onAddToCart={handleAddCoffeeToCart}
            onGiftCardClick={() => setGiftCardModalOpen(true)}
          />
        } />
      </Routes>

      <Footer />

      {/* Login Modal at App level - covers entire page */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        subtotal={subtotal}
        total={total}
        appliedDiscount={appliedDiscount}
        applyDiscount={applyDiscount}
        removeDiscount={removeDiscount}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      {/* Gift Card Purchase Modal */}
      <GiftCardPurchase
        isOpen={giftCardModalOpen}
        onClose={() => setGiftCardModalOpen(false)}
      />

      {/* Coffee Copilot - AI Assistant */}
      <CoffeeCopilot />
    </>
  )
}

export default App
