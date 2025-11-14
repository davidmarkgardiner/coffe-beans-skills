import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
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
import { OrderHistory } from './pages/OrderHistory'
import { OrderDetail } from './pages/OrderDetail'
import { useCart } from './hooks/useCart'
import { useProductImages } from './hooks/useProductImages'
import type { Product } from './types/product'

const baseProducts: Omit<Product, 'image'>[] = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    description: 'Bright citrus notes with floral undertones and a smooth finish.',
    price: 19.99,
    weight: '250g',
    category: 'Single Origin',
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'Colombian Supremo',
    description: 'Rich and balanced with caramel sweetness and nutty complexity.',
    price: 18.49,
    weight: '250g',
    category: 'Single Origin',
    badge: 'New',
  },
  {
    id: '3',
    name: 'House Blend',
    description: 'Our signature blend with chocolate notes and a velvety body.',
    price: 15.99,
    weight: '250g',
    category: 'Signature Blend',
  },
  {
    id: '4',
    name: 'Espresso Forte',
    description: 'Bold and intense with dark chocolate and smoky undertones.',
    price: 21.49,
    weight: '250g',
    category: 'Espresso',
  },
  {
    id: '5',
    name: 'Kenya AA',
    description: 'Bright acidity with berry notes and wine-like complexity.',
    price: 22.49,
    weight: '250g',
    category: 'Single Origin',
  },
  {
    id: '6',
    name: 'Decaf Swiss Water',
    description: 'Full flavor without the caffeine, processed naturally.',
    price: 19.49,
    weight: '250g',
    category: 'Decaffeinated',
  },
]

// Component to handle hash-based navigation scrolling
interface HomePageProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onGiftCardClick: () => void
}

function HomePage({ products, onAddToCart, onGiftCardClick }: HomePageProps) {
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
      <ProductGrid products={products} onAddToCart={onAddToCart} />
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

  // Get rotating product images from AI-generated content
  const { productImages } = useProductImages(baseProducts.length)

  // Combine base products with rotating images
  const products = useMemo(() => {
    return baseProducts.map((product, index) => ({
      ...product,
      image: productImages[index],
    }))
  }, [productImages])

  return (
    <>
      <CustomCursor />
      <Navigation
        itemCount={itemCount}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      <Routes>
        {/* Blog detail page */}
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Order History pages */}
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />

        {/* Home page */}
        <Route path="/" element={
          <HomePage
            products={products}
            onAddToCart={addToCart}
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
