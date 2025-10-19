// ===========================
// Initialize AOS (Animate On Scroll)
// ===========================

AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  offset: 100
});

// ===========================
// Navbar Scroll Effect
// ===========================

const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  // Add scrolled class when page is scrolled
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  lastScroll = currentScroll;
});

// ===========================
// Smooth Scroll for Navigation Links
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));

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

// ===========================
// Shopping Cart Functionality (Basic)
// ===========================

let cartCount = 0;
const cartBadge = document.querySelector('.cart-badge');
const productButtons = document.querySelectorAll('.product-button');

productButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();

    // Add to cart animation
    button.textContent = 'Added!';
    button.style.background = '#6B4423';

    // Update cart count
    cartCount++;
    cartBadge.textContent = cartCount;

    // Animate cart badge
    cartBadge.style.transform = 'scale(1.3)';
    setTimeout(() => {
      cartBadge.style.transform = 'scale(1)';
    }, 200);

    // Reset button after 2 seconds
    setTimeout(() => {
      button.textContent = 'Add to Cart';
      button.style.background = '';
    }, 2000);
  });
});

// ===========================
// Image Lazy Loading Effect
// ===========================

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.classList.add('loaded');
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '50px'
});

document.querySelectorAll('.product-image img').forEach(img => {
  imageObserver.observe(img);
});

// ===========================
// Parallax Effect for Hero Section
// ===========================

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');

  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
  }
});

// ===========================
// Custom Cursor (Desktop Only)
// ===========================

if (window.innerWidth > 768) {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor follow
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Scale cursor on hover over interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .product-card');

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(1.5)';
    });

    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
    });
  });
}

// ===========================
// Performance: Reduce Animations on Mobile
// ===========================

if (window.innerWidth < 768) {
  // Disable parallax on mobile
  window.removeEventListener('scroll', () => {});

  // Simplify AOS animations on mobile
  AOS.init({
    duration: 400,
    once: true,
    disable: 'mobile'
  });
}

// ===========================
// Console Welcome Message
// ===========================

console.log(
  '%c Premium Coffee Website ',
  'background: #2C2C2C; color: #FFFFFF; font-size: 16px; padding: 10px 20px; border-radius: 5px;'
);
console.log('Built with premium design principles and attention to detail.');
