/**
 * Premium Coffee Website - Interactive Functionality
 * Handles animations, parallax, cart, and form submissions
 */

// ===================================
// Initialize AOS (Animate On Scroll)
// ===================================
AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true,
    offset: 100
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ===================================
// Navbar Scroll Effect
// ===================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for styling
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===================================
// Hero Parallax Effect
// ===================================
const heroBackground = document.querySelector('.hero-background');
const heroContent = document.querySelector('.hero-content');

function handleHeroParallax() {
    if (!heroBackground && !heroContent) {
        return;
    }

    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (!hero) {
        return;
    }
    const heroHeight = hero.offsetHeight;

    if (scrolled < heroHeight) {
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        if (heroContent) {
            const opacity = 1 - (scrolled / heroHeight) * 1.5;
            heroContent.style.opacity = Math.max(0, opacity);
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }
}

if (!prefersReducedMotion.matches) {
    window.addEventListener('scroll', handleHeroParallax, { passive: true });
}

handleHeroParallax();

// Experience section parallax
const parallaxSections = document.querySelectorAll('[data-parallax]');

function handleSectionParallax() {
    if (prefersReducedMotion.matches || parallaxSections.length === 0) {
        return;
    }

    const viewportHeight = window.innerHeight;

    parallaxSections.forEach(section => {
        const speed = parseFloat(section.getAttribute('data-parallax-speed')) || 0.3;
        const rect = section.getBoundingClientRect();
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const translate = Math.min(Math.max(progress, 0), 1) * speed * 100;
        section.style.setProperty('--parallax-shift', `${translate}px`);
    });
}

if (!prefersReducedMotion.matches) {
    window.addEventListener('scroll', handleSectionParallax, { passive: true });
    handleSectionParallax();
}

// ===================================
// Shopping Cart Functionality
// ===================================
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('premiumCoffeeCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('premiumCoffeeCart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(productName, price) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    showCartNotification(productName);
}

// Update cart count display
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Show cart notification
function showCartNotification(productName) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span><strong>${productName}</strong> added to cart</span>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .cart-notification {
            position: fixed;
            top: 100px;
            right: 24px;
            background: var(--color-coffee-brown);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-out 2.7s;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remove notification after animation
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Cart icon click handler
document.getElementById('cartIcon')?.addEventListener('click', (e) => {
    e.preventDefault();
    showCartModal();
});

// Show cart modal
function showCartModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.cart-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-overlay" onclick="closeCartModal()"></div>
        <div class="cart-modal-content">
            <div class="cart-modal-header">
                <h2>Shopping Cart</h2>
                <button class="cart-close" onclick="closeCartModal()">&times;</button>
            </div>
            <div class="cart-modal-body">
                ${cart.length === 0 ?
                    '<p class="cart-empty">Your cart is empty</p>' :
                    cart.map((item, index) => `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</p>
                            </div>
                            <div class="cart-item-actions">
                                <button onclick="updateCartQuantity(${index}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateCartQuantity(${index}, 1)">+</button>
                                <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
            ${cart.length > 0 ? `
                <div class="cart-modal-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="cart-total-amount">$${total.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary" onclick="checkout()">Proceed to Checkout</button>
                </div>
            ` : ''}
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .cart-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cart-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
        }

        .cart-modal-content {
            position: relative;
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
            animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .cart-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid var(--color-medium-grey);
        }

        .cart-modal-header h2 {
            font-size: 24px;
            margin: 0;
        }

        .cart-close {
            background: none;
            border: none;
            font-size: 32px;
            cursor: pointer;
            color: var(--color-dark-grey);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s;
        }

        .cart-close:hover {
            background: var(--color-light-grey);
        }

        .cart-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .cart-empty {
            text-align: center;
            color: var(--color-warm-grey);
            padding: 48px 24px;
        }

        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid var(--color-light-grey);
        }

        .cart-item:last-child {
            border-bottom: none;
        }

        .cart-item-info h4 {
            font-size: 16px;
            margin-bottom: 4px;
        }

        .cart-item-price {
            font-size: 14px;
            color: var(--color-warm-grey);
        }

        .cart-item-actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .cart-item-actions button {
            padding: 4px 12px;
            border: 1px solid var(--color-medium-grey);
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .cart-item-actions button:hover {
            background: var(--color-light-grey);
        }

        .cart-item-remove {
            color: #dc3545;
            border-color: #dc3545 !important;
        }

        .cart-item-remove:hover {
            background: #dc3545 !important;
            color: white !important;
        }

        .cart-modal-footer {
            padding: 24px;
            border-top: 1px solid var(--color-medium-grey);
        }

        .cart-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            font-size: 18px;
            font-weight: 600;
        }

        .cart-total-amount {
            color: var(--color-coffee-brown);
            font-size: 24px;
            font-family: var(--font-serif);
        }

        .cart-modal-footer .btn {
            width: 100%;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Close cart modal
function closeCartModal() {
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
}

// Update cart quantity
function updateCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    showCartModal(); // Refresh modal
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    showCartModal(); // Refresh modal
}

// Checkout
function checkout() {
    alert('Checkout functionality would be implemented here.\n\nThis would integrate with a payment processor like Stripe or PayPal.');
    closeCartModal();
}

// ===================================
// Contact Form Submission
// ===================================
function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // In a real application, you would send this to a server
    console.log('Form submitted:', Object.fromEntries(formData));

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
    successMessage.style.cssText = `
        background: #28a745;
        color: white;
        padding: 16px;
        border-radius: 8px;
        margin-top: 16px;
        text-align: center;
        animation: fadeIn 0.3s ease-out;
    `;

    form.appendChild(successMessage);
    form.reset();

    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

// ===================================
// Newsletter Form Submission
// ===================================
function handleNewsletter(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;

    // In a real application, you would send this to a server
    console.log('Newsletter signup:', email);

    alert('Thank you for subscribing to our newsletter!');
    form.reset();
}

// ===================================
// Smooth Scroll for Navigation Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip cart icon and empty hrefs
        if (href === '#' || this.id === 'cartIcon') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Image Lazy Loading Enhancement
// ===================================
function initRevealAnimations() {
    const revealTargets = document.querySelectorAll('.reveal-on-scroll, .reveal-image');

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('visible'));
        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    revealTargets.forEach(el => revealObserver.observe(el));
}

function initLazyImages() {
    if (!('IntersectionObserver' in window)) {
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('.product-image img, .about-image img, .gallery-item img').forEach(img => {
        imageObserver.observe(img);
    });
}

function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) {
        return;
    }

    const isFinePointer = window.matchMedia('(pointer: fine)');
    const enableCustomCursor = () => {
        document.body.classList.add('custom-cursor-enabled');
        cursor.classList.remove('cursor-hover');
    };
    const disableCustomCursor = () => {
        document.body.classList.remove('custom-cursor-enabled');
        cursor.classList.remove('active', 'cursor-hover');
    };

    if (!isFinePointer.matches) {
        disableCustomCursor();
        cursor.style.display = 'none';
        return;
    }

    cursor.style.display = 'block';
    enableCustomCursor();
    isFinePointer.addEventListener('change', (event) => {
        if (!event.matches) {
            disableCustomCursor();
            cursor.style.display = 'none';
        } else {
            cursor.style.display = 'block';
            enableCustomCursor();
        }
    });

    const moveCursor = (event) => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    };

    const handleMouseEnter = () => {
        cursor.classList.add('active');
    };

    const handleMouseLeave = () => {
        cursor.classList.remove('active');
        cursor.classList.remove('cursor-hover');
    };

    const interactiveSelector = 'a, button, .btn, .card-link, .product-card, input, textarea';

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    document.addEventListener('mouseover', (event) => {
        if (event.target.closest(interactiveSelector)) {
            cursor.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (event) => {
        if (event.target.closest(interactiveSelector)) {
            const related = event.relatedTarget;
            if (!related || !related.closest(interactiveSelector)) {
                cursor.classList.remove('cursor-hover');
            }
        }
    });
}

// ===================================
// Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    document.body.classList.add('is-loaded');

    initLazyImages();
    initRevealAnimations();

    initCustomCursor();

    // Add fade-in class to images when loaded
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    });
});

window.addEventListener('beforeunload', () => {
    document.body.classList.add('is-exiting');
});

// ===================================
// Handle Page Visibility
// ===================================
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Refresh cart count when page becomes visible
        updateCartCount();
    }
});
