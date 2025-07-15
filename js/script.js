// ===== ARTIST WEBSITE INTERACTIVE FUNCTIONALITY =====
// Modern vanilla JavaScript with ES6+ features

document.addEventListener('DOMContentLoaded', function() {
    // ===== INITIALIZATION =====
    initNavigation();
    initScrollAnimations();
    initScrollToTop();
    initSmoothScrolling();
    initLoadAnimations();
    initContactForm();
});

// ===== MOBILE NAVIGATION =====
function initNavigation() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');
    
    if (!mobileToggle || !navLinks) return;
    
    // Toggle mobile menu
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking nav links
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Update active navigation link based on scroll position
    updateActiveNavLink();
    window.addEventListener('scroll', debounce(updateActiveNavLink, 100));
}

// ===== SCROLL ANIMATIONS WITH INTERSECTION OBSERVER =====
function initScrollAnimations() {
    // Select ALL animation elements
    const animationElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    
    if (!animationElements.length) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animationElements.forEach(element => {
        // Check if element is already in viewport and make it visible immediately
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                           rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
                           rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        
        if (isInViewport) {
            element.classList.add('visible');
        } else {
            observer.observe(element);
        }
    });
}

// ===== SCROLL TO TOP FUNCTIONALITY =====
function initScrollToTop() {
    // Create scroll to top button if it doesn't exist
    let scrollToTopBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollToTopBtn) {
        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '↑';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollToTopBtn);
    }
    
    // Show/hide scroll to top button
    function toggleScrollToTop() {
        const scrolled = window.pageYOffset;
        const coords = document.documentElement.clientHeight;
        
        if (scrolled > coords) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
    
    // Smooth scroll to top
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', debounce(toggleScrollToTop, 100));
}

// ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== PAGE LOAD ANIMATIONS =====
function initLoadAnimations() {
    // Add entrance animations to hero elements
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButton = document.querySelector('.hero .btn');
    
    if (heroTitle) heroTitle.style.animationDelay = '0.5s';
    if (heroSubtitle) heroSubtitle.style.animationDelay = '0.8s';
    if (heroButton) {
        heroButton.style.opacity = '0';
        heroButton.style.transform = 'translateY(30px)';
        heroButton.style.transition = 'all 0.6s ease-out';
        setTimeout(() => {
            heroButton.style.opacity = '1';
            heroButton.style.transform = 'translateY(0)';
        }, 1100);
    }
}

// ===== UPDATE ACTIVE NAVIGATION LINK =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id], .hero[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollPosition = window.pageYOffset + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}` || 
            (current === 'hero' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        }
    });
}

// ===== CONTACT FORM HANDLING =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Create mailto link
        const mailto = `mailto:contact@azhang.eu.org?subject=${encodeURIComponent(subject || 'Contact from Website')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        // Open email client
        window.location.href = mailto;
        
        // Show success message
        showFormStatus('Message prepared! Your email client should open now.', 'success');
        
        // Reset form after short delay
        setTimeout(() => {
            contactForm.reset();
        }, 1000);
    });
}

function showFormStatus(message, type) {
    const statusDiv = document.getElementById('form-status') || createStatusDiv();
    statusDiv.textContent = message;
    statusDiv.className = `form-status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function createStatusDiv() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'form-status';
    statusDiv.style.marginTop = '1rem';
    statusDiv.style.padding = '1rem';
    statusDiv.style.borderRadius = '0.5rem';
    statusDiv.style.display = 'none';
    
    const form = document.getElementById('contactForm');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(statusDiv, form.nextSibling);
    }
    
    return statusDiv;
}

// ===== UTILITY FUNCTIONS =====

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== ENHANCED CARD INTERACTIONS =====
function initCardEnhancements() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        // Add enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = 60;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(0, 128, 128, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// ===== MUSIC PLAYER PLACEHOLDER FUNCTIONALITY =====
function initMusicPlayerPlaceholders() {
    const musicPlaceholders = document.querySelectorAll('.music-embed-placeholder');
    
    musicPlaceholders.forEach(placeholder => {
        const playButton = placeholder.querySelector('.play-button');
        if (playButton) {
            playButton.addEventListener('click', function() {
                // This is a placeholder - in real implementation, 
                // this would trigger the actual embedded player
                this.textContent = this.textContent === '▶️' ? '⏸️' : '▶️';
                placeholder.classList.toggle('playing');
            });
        }
    });
}

// ===== FORM ENHANCEMENTS =====
function initFormEnhancements() {
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    
    formInputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Add real-time validation feedback
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.remove('invalid');
                this.classList.add('valid');
            } else {
                this.classList.remove('valid');
                this.classList.add('invalid');
            }
        });
    });
    
    // Handle form submission
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            if (name && email && message) {
                // Show success message (placeholder)
                showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
                this.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        ${type === 'success' ? 'background: #10B981;' : ''}
        ${type === 'error' ? 'background: #EF4444;' : ''}
        ${type === 'info' ? 'background: #3B82F6;' : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===== INITIALIZE ADDITIONAL FEATURES =====
window.addEventListener('load', () => {
    initCardEnhancements();
    initMusicPlayerPlaceholders();
    initFormEnhancements();
});

// ===== CSS ANIMATION KEYFRAMES (INJECTED VIA JS) =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }
    
    .form-input.valid,
    .form-textarea.valid {
        border-color: #10B981;
    }
    
    .form-input.invalid,
    .form-textarea.invalid {
        border-color: #EF4444;
    }
    
    .music-embed-placeholder.playing {
        background: rgba(0, 128, 128, 0.1);
    }
`;

document.head.appendChild(style); 