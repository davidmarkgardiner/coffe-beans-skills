import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { About } from './components/About'
import { Testimonials } from './components/Testimonials'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { BlogHighlights } from './components/BlogHighlights'
import { CustomCursor } from './components/CustomCursor'
import { LoginModal } from './components/LoginModal'
import CartDrawer from './components/CartDrawer'
import CoffeeCopilot from './components/CoffeeCopilot'
import { useCart } from './hooks/useCart'
import type { Product } from './types/product'

const products: Product[] = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    description: 'Bright citrus notes with floral undertones and a smooth finish.',
    price: 24.99,
    weight: '250g',
    category: 'Single Origin',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'Colombian Supremo',
    description: 'Rich and balanced with caramel sweetness and nutty complexity.',
    price: 22.99,
    weight: '250g',
    category: 'Single Origin',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    badge: 'New',
  },
  {
    id: '3',
    name: 'House Blend',
    description: 'Our signature blend with chocolate notes and a velvety body.',
    price: 19.99,
    weight: '250g',
    category: 'Signature Blend',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
  },
  {
    id: '4',
    name: 'Espresso Forte',
    description: 'Bold and intense with dark chocolate and smoky undertones.',
    price: 26.99,
    weight: '250g',
    category: 'Espresso',
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
  },
  {
    id: '5',
    name: 'Kenya AA',
    description: 'Bright acidity with berry notes and wine-like complexity.',
    price: 27.99,
    weight: '250g',
    category: 'Single Origin',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
  },
  {
    id: '6',
    name: 'Decaf Swiss Water',
    description: 'Full flavor without the caffeine, processed naturally.',
    price: 23.99,
    weight: '250g',
    category: 'Decaffeinated',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  },
]

function App() {
  const { cart, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCart()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  return (
    <>
      <CustomCursor />
      <Navigation
        itemCount={itemCount}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />
      <Hero />
      <About />
      <ProductGrid products={products} onAddToCart={addToCart} />
      <Testimonials />
      <BlogHighlights />
      <Newsletter />
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
        total={total}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      {/* Coffee Copilot - AI Assistant */}
      <CoffeeCopilot />
    </>
  )
}

export default App
