/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  MACHINA DEVELOPMENT - Main JavaScript                                ║
 * ║  Vanilla JavaScript - No frameworks                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// THEME MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const ThemeManager = {
  init() {
    this.themeToggle = document.getElementById('themeToggle');
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    this.applyTheme(this.currentTheme);
    
    // Event listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  },

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════════════════════════════════════

const MobileMenu = {
  init() {
    this.menuToggle = document.getElementById('menuToggle');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.menuLinks = this.mobileMenu?.querySelectorAll('.navbar__mobile-link');
    this.isOpen = false;

    if (this.menuToggle && this.mobileMenu) {
      this.menuToggle.addEventListener('click', () => this.toggle());
      
      // Close menu when clicking links
      this.menuLinks?.forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && 
            !this.mobileMenu.contains(e.target) && 
            !this.menuToggle.contains(e.target)) {
          this.close();
        }
      });
    }
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  open() {
    this.mobileMenu.classList.add('navbar__mobile-menu--open');
    this.menuToggle.classList.add('navbar__toggle--open');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  },

  close() {
    this.mobileMenu.classList.remove('navbar__mobile-menu--open');
    this.menuToggle.classList.remove('navbar__toggle--open');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    this.isOpen = false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS
// ═══════════════════════════════════════════════════════════════════════════

const ScrollProgress = {
  init() {
    this.progressBar = document.querySelector('.scroll-progress');
    if (this.progressBar) {
      window.addEventListener('scroll', () => this.update(), { passive: true });
    }
  },

  update() {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    this.progressBar.style.width = `${scrolled}%`;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVBAR SCROLL BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════

const NavbarScroll = {
  init() {
    this.navbar = document.getElementById('navbar');
    this.lastScroll = 0;

    if (this.navbar) {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }
  },

  handleScroll() {
    const currentScroll = window.scrollY;

    // Add scrolled class when scrolled down
    if (currentScroll > 50) {
      this.navbar.classList.add('navbar--scrolled');
    } else {
      this.navbar.classList.remove('navbar--scrolled');
    }

    // Hide navbar on scroll down, show on scroll up
    if (currentScroll > this.lastScroll && currentScroll > 100) {
      this.navbar.classList.add('navbar--hidden');
    } else {
      this.navbar.classList.remove('navbar--hidden');
    }

    this.lastScroll = currentScroll;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const ScrollAnimations = {
  init() {
    this.elements = document.querySelectorAll('[data-animate]');
    
    if (this.elements.length === 0) return;

    // IntersectionObserver for performance
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.elements.forEach(el => this.observer.observe(el));
  },

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.animateDelay || 0;
        
        setTimeout(() => {
          entry.target.classList.add('animated');
        }, delay);

        // Unobserve after animation (performance)
        this.observer.unobserve(entry.target);
      }
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGGER ANIMATIONS (for grids)
// ═══════════════════════════════════════════════════════════════════════════

const StaggerAnimations = {
  init() {
    this.containers = document.querySelectorAll('.stagger-container');
    
    this.containers.forEach(container => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Add animated class to the container, not individual items
              container.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(container);
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const CounterAnimations = {
  init() {
    this.counters = document.querySelectorAll('.counter');
    
    if (this.counters.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.counters.forEach(counter => this.observer.observe(counter));
  },

  animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, duration / steps);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TEXT SCRAMBLE EFFECT (Hero Title)
// ═══════════════════════════════════════════════════════════════════════════

const TextScramble = {
  init() {
    this.heroTitle = document.querySelector('.hero__title-highlight');
    if (this.heroTitle) {
      this.originalText = this.heroTitle.textContent;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      
      // Start scramble after page load
      setTimeout(() => this.scramble(), 500);
    }
  },

  scramble() {
    let iteration = 0;
    const interval = setInterval(() => {
      this.heroTitle.textContent = this.originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return this.originalText[index];
          }
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        })
        .join('');

      if (iteration >= this.originalText.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════════════════════

const SmoothScroll = {
  init() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Skip if it's just "#" or empty
        if (!href || href === '#') return;
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - navbarHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SHOWCASE FILTERS
// ═══════════════════════════════════════════════════════════════════════════

const ShowcaseFilters = {
  init() {
    this.filters = document.querySelectorAll('.showcase__filter');
    this.grid = document.getElementById('showcaseGrid');
    this.items = this.grid?.querySelectorAll('.demo-card');

    if (!this.filters || !this.grid) return;

    this.filters.forEach(filter => {
      filter.addEventListener('click', (e) => this.handleFilter(e));
    });
  },

  handleFilter(e) {
    const filterBtn = e.target;
    const category = filterBtn.dataset.filter;

    // Update active filter
    this.filters.forEach(f => f.classList.remove('showcase__filter--active'));
    filterBtn.classList.add('showcase__filter--active');

    // Filter items
    this.items.forEach(item => {
      const itemCategory = item.dataset.category;
      
      if (category === 'all' || itemCategory === category) {
        item.style.display = '';
        // Re-trigger animation
        item.classList.remove('animated');
        setTimeout(() => item.classList.add('animated'), 10);
      } else {
        item.style.display = 'none';
      }
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LAZY LOADING (Images & Iframes)
// ═══════════════════════════════════════════════════════════════════════════

const LazyLoad = {
  init() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.iframes = document.querySelectorAll('.lazy-iframe');

    // Images are handled natively by loading="lazy"
    // But we need to handle iframes
    if (this.iframes.length > 0) {
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        { rootMargin: '200px' }
      );

      this.iframes.forEach(iframe => this.observer.observe(iframe));
    }
  },

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        const src = iframe.dataset.src;
        
        if (src) {
          iframe.src = src;
          iframe.removeAttribute('data-src');
        }
        
        this.observer.unobserve(iframe);
      }
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FORM VALIDATION (for future contact form)
// ═══════════════════════════════════════════════════════════════════════════

const FormValidation = {
  init() {
    this.forms = document.querySelectorAll('form[data-validate]');
    
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      
      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('form-input--error')) {
            this.validateField(input);
          }
        });
      });
    });
  },

  handleSubmit(e, form) {
    e.preventDefault();
    
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (isValid) {
      // Form is valid, proceed with AJAX submission
      console.log('Form is valid, submitting...');
      this.submitForm(form);
    }
  },

  validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');
    
    // Remove previous error
    this.clearError(input);

    // Required check
    if (required && !value) {
      this.showError(input, 'Este campo es obligatorio');
      return false;
    }

    // Email validation
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showError(input, 'Email inválido');
        return false;
      }
    }

    // URL validation
    if (type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        this.showError(input, 'URL inválida');
        return false;
      }
    }

    // Min length
    const minLength = input.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength)) {
      this.showError(input, `Mínimo ${minLength} caracteres`);
      return false;
    }

    return true;
  },

  async submitForm(form) {
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
      </svg>
      Enviando...
    `;

    try {
      // Enviar a Formspree vía AJAX
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success - Mostrar mensaje sin redirección
        this.showFormMessage(form, 'success', '¡Mensaje enviado! Te responderé pronto.');
        form.reset();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al enviar');
      }
    } catch (error) {
      // Error
      console.error('Form submission error:', error);
      this.showFormMessage(form, 'error', 'Error al enviar. Inténtalo de nuevo o escríbeme por WhatsApp.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  },

  showError(input, message) {
    input.classList.add('form-input--error');
    
    let errorMsg = input.parentElement.querySelector('.form-error');
    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.className = 'form-error';
      input.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
  },

  clearError(input) {
    input.classList.remove('form-input--error');
    const errorMsg = input.parentElement.querySelector('.form-error');
    if (errorMsg) {
      errorMsg.remove();
    }
  },

  showFormMessage(form, type, message) {
    let msgEl = form.querySelector('.form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'form-message';
      form.appendChild(msgEl);
    }
    
    msgEl.className = `form-message form-message--${type}`;
    msgEl.textContent = message;
    msgEl.style.display = 'block';

    setTimeout(() => {
      msgEl.style.display = 'none';
    }, 5000);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ACCORDIONS (for FAQ)
// ═══════════════════════════════════════════════════════════════════════════

const Accordions = {
  init() {
    this.accordions = document.querySelectorAll('.accordion');
    
    this.accordions.forEach(accordion => {
      const trigger = accordion.querySelector('.accordion__trigger');
      if (trigger) {
        trigger.addEventListener('click', () => this.toggle(accordion));
      }
    });
  },

  toggle(accordion) {
    const isOpen = accordion.classList.contains('accordion--open');
    
    // Close all others if single-open mode
    const container = accordion.closest('.accordion-group');
    if (container?.dataset.single === 'true') {
      container.querySelectorAll('.accordion--open').forEach(item => {
        if (item !== accordion) {
          item.classList.remove('accordion--open');
        }
      });
    }
    
    // Toggle current
    accordion.classList.toggle('accordion--open');
    
    // Update ARIA
    const trigger = accordion.querySelector('.accordion__trigger');
    trigger?.setAttribute('aria-expanded', !isOpen);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════════════

const Tabs = {
  init() {
    this.tabGroups = document.querySelectorAll('.tabs');
    
    this.tabGroups.forEach(group => {
      const triggers = group.querySelectorAll('.tabs__trigger');
      triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => this.activate(e, group));
      });
    });
  },

  activate(e, group) {
    const trigger = e.target.closest('.tabs__trigger');
    const targetId = trigger.dataset.tab;
    
    // Update triggers
    group.querySelectorAll('.tabs__trigger').forEach(t => {
      t.classList.remove('tabs__trigger--active');
      t.setAttribute('aria-selected', 'false');
    });
    trigger.classList.add('tabs__trigger--active');
    trigger.setAttribute('aria-selected', 'true');
    
    // Update panels
    group.querySelectorAll('.tabs__panel').forEach(panel => {
      panel.classList.remove('tabs__panel--active');
    });
    const targetPanel = group.querySelector(`#${targetId}`);
    if (targetPanel) {
      targetPanel.classList.add('tabs__panel--active');
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════

const Modals = {
  init() {
    this.triggers = document.querySelectorAll('[data-modal-open]');
    this.closeButtons = document.querySelectorAll('[data-modal-close]');
    
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modalOpen;
        this.open(modalId);
      });
    });
    
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
    
    // Close on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.close();
      }
    });
  },

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('modal--open');
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  },

  close() {
    const openModal = document.querySelector('.modal--open');
    if (openModal) {
      openModal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITOR (Debug only)
// ═══════════════════════════════════════════════════════════════════════════

const PerformanceMonitor = {
  init() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('🚀 Performance Metrics:');
        console.log(`  DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
        console.log(`  Page Load: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        console.log(`  Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
      });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE ALL
// ═══════════════════════════════════════════════════════════════════════════

const App = {
  init() {
    // Core functionality
    ThemeManager.init();
    MobileMenu.init();
    ScrollProgress.init();
    NavbarScroll.init();
    SmoothScroll.init();
    
    // Animations
    ScrollAnimations.init();
    StaggerAnimations.init();
    CounterAnimations.init();
    TextScramble.init();
    
    // Interactive features
    ShowcaseFilters.init();
    Accordions.init();
    LazyLoad.init();
    FormValidation.init();
    
    console.log('✨ Machina Development initialized');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Export for potential external use
window.MachinaDev = {
  theme: ThemeManager,
  menu: MobileMenu,
  modals: Modals
};
