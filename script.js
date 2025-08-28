// Enhanced Portfolio JavaScript with Interactive Features
// Optimized for performance and accessibility

// Performance optimization - requestAnimationFrame helpers
let rafId = null;
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for resize events
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = function() {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== SMOOTH SCROLLING NAVIGATION ==========
    const navLinks = document.querySelectorAll('.nav-link, .nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('nav, header')?.offsetHeight || 80;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                // Enhanced smooth scrolling with custom easing
                smoothScrollTo(targetPosition, 800);
                
                // Update URL without jumping
                history.pushState(null, null, `#${targetId}`);
                
                // Announce navigation for screen readers
                announceNavigation(targetSection);
            }
        });
    });
    
    // Custom smooth scroll function with easing
    function smoothScrollTo(target, duration = 800) {
        const start = window.pageYOffset;
        const distance = target - start;
        let startTime = null;
        
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, start, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        requestAnimationFrame(animation);
    }
    
    // ========== ANIMATED SKILL BARS ==========
    function initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar, .progress-bar');
        const skillItems = document.querySelectorAll('.skill-item, .skill');
        
        // Create skill bars if they don't exist
        if (skillBars.length === 0 && skillItems.length > 0) {
            createSkillBars();
        }
        
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -10% 0px'
        };
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBar(entry.target);
                    skillObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all skill bars
        document.querySelectorAll('.skill-bar, .progress-bar').forEach(bar => {
            skillObserver.observe(bar);
        });
    }
    
    function createSkillBars() {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return;
        
        // Sample skills data - can be customized
        const skills = [
            { name: 'Laser Precision', level: 95 },
            { name: 'Space Navigation', level: 90 },
            { name: 'Toy Protection', level: 100 },
            { name: 'Friendship Building', level: 85 },
            { name: 'Mission Planning', level: 92 },
            { name: 'Karate Action', level: 88 }
        ];
        
        const skillsContainer = skillsSection.querySelector('.skills-container') || 
                               skillsSection.querySelector('.container') || 
                               skillsSection;
        
        const skillsHTML = skills.map(skill => `
            <div class="skill-item" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="${skill.name} skill level">
                <div class="skill-info">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-percentage" aria-live="polite">0%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" data-level="${skill.level}"></div>
                </div>
            </div>
        `).join('');
        
        const skillsWrapper = document.createElement('div');
        skillsWrapper.className = 'skills-grid';
        skillsWrapper.innerHTML = skillsHTML;
        skillsContainer.appendChild(skillsWrapper);
    }
    
    function animateSkillBar(skillItem) {
        const progressBar = skillItem.querySelector('.skill-progress');
        const percentageEl = skillItem.querySelector('.skill-percentage');
        const progressBarAlt = skillItem.querySelector('.progress-bar');
        
        if (!progressBar && !progressBarAlt) return;
        
        const targetLevel = parseInt(progressBar?.dataset.level || progressBarAlt?.dataset.level || 80);
        const duration = 2000;
        let startTime = null;
        let currentLevel = 0;
        
        function updateProgress(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Eased animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            currentLevel = Math.floor(easedProgress * targetLevel);
            
            // Update visual progress
            if (progressBar) {
                progressBar.style.width = `${currentLevel}%`;
                progressBar.style.transform = `scaleX(${currentLevel / 100})`;
                progressBar.style.transformOrigin = 'left';
            }
            
            if (progressBarAlt) {
                progressBarAlt.style.width = `${currentLevel}%`;
            }
            
            // Update percentage text
            if (percentageEl) {
                percentageEl.textContent = `${currentLevel}%`;
            }
            
            // Update ARIA attribute
            skillItem.setAttribute('aria-valuenow', currentLevel);
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        }
        
        requestAnimationFrame(updateProgress);
    }
    
    // ========== ENHANCED SECTION REVEAL EFFECTS ==========
    function initSectionRevealEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -5% 0px'
        };
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealElement(entry.target);
                }
            });
        }, observerOptions);
        
        // Elements to animate
        const elementsToReveal = document.querySelectorAll(`
            .hero-content,
            .about-content,
            .project-card,
            .stat,
            .contact-form,
            .section-title,
            .hero-image,
            .hero-text,
            .about-text,
            .about-stats
        `);
        
        elementsToReveal.forEach((element, index) => {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s, 
                                       transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
            
            // Add reveal class for CSS targeting
            element.classList.add('reveal-element');
            
            revealObserver.observe(element);
        });
    }
    
    function revealElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        element.classList.add('revealed');
        
        // Add special effects for different element types
        if (element.classList.contains('hero-content')) {
            element.style.transform = 'translateY(0) scale(1)';
        }
        
        if (element.classList.contains('project-card')) {
            element.style.transform = 'translateY(0) rotateX(0)';
        }
    }
    
    // ========== HEADER SCROLL BEHAVIOR ==========
    const header = document.querySelector('nav, header');
    let lastScrollTop = 0;
    let isScrolling = false;
    
    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        
        if (header) {
            if (scrollTop > 100) {
                if (scrollDirection === 'down') {
                    header.style.transform = 'translateY(-100%)';
                    header.setAttribute('aria-hidden', 'true');
                } else {
                    header.style.transform = 'translateY(0)';
                    header.removeAttribute('aria-hidden');
                }
                header.classList.add('scrolled');
            } else {
                header.style.transform = 'translateY(0)';
                header.classList.remove('scrolled');
                header.removeAttribute('aria-hidden');
            }
        }
        
        lastScrollTop = scrollTop;
    }, 16);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // ========== CTA BUTTON FUNCTIONALITY ==========
    const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary, .hero-buttons .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = header?.offsetHeight || 80;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    smoothScrollTo(targetPosition, 1000);
                }
            }
        });
    });
    
    // ========== ENHANCED CONTACT FORM ==========
    function initContactForm() {
        const contactForm = document.querySelector('.contact-form, form');
        if (!contactForm) return;
        
        // Add live validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', debounce(clearError, 300));
        });
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"], input[name="name"]')?.value.trim();
            const email = this.querySelector('input[type="email"], input[name="email"]')?.value.trim();
            const message = this.querySelector('textarea, input[name="message"]')?.value.trim();
            
            // Comprehensive validation
            let isValid = true;
            
            if (!name) {
                showFieldError('name', 'Name is required');
                isValid = false;
            }
            
            if (!email) {
                showFieldError('email', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showFieldError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!message) {
                showFieldError('message', 'Message is required');
                isValid = false;
            }
            
            if (isValid) {
                submitForm(this, { name, email, message });
            }
        });
    }
    
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const fieldName = field.name || field.type;
        
        clearFieldError(field);
        
        if (field.hasAttribute('required') && !value) {
            showFieldError(fieldName, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
            return false;
        }
        
        if (field.type === 'email' && value && !isValidEmail(value)) {
            showFieldError(fieldName, 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"], input[type="${fieldName}"]`);
        if (!field) return;
        
        clearFieldError(field);
        
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        
        field.parentNode.appendChild(errorElement);
    }
    
    function clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    function clearError(e) {
        clearFieldError(e.target);
    }
    
    function submitForm(form, data) {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        const originalText = submitButton?.textContent || 'Send Message';
        
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.setAttribute('aria-busy', 'true');
        }
        
        // Simulate form submission (replace with actual submission logic)
        setTimeout(() => {
            // Success feedback
            showSuccessMessage('Thank you for your message! I will get back to you soon.');
            form.reset();
            
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                submitButton.removeAttribute('aria-busy');
            }
        }, 1500);
    }
    
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.setAttribute('role', 'alert');
        successDiv.setAttribute('aria-live', 'polite');
        
        const form = document.querySelector('.contact-form, form');
        if (form) {
            form.appendChild(successDiv);
            
            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        }
    }
    
    // ========== MOBILE MENU ENHANCEMENT ==========
    function initMobileMenu() {
        const nav = document.querySelector('nav');
        const navMenu = document.querySelector('.nav-menu, .nav-links');
        
        if (!nav || !navMenu) return;
        
        // Create mobile menu button if it doesn't exist
        let mobileMenuBtn = nav.querySelector('.mobile-menu-btn');
        if (!mobileMenuBtn) {
            mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn';
            mobileMenuBtn.innerHTML = '<span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span>';
            mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.setAttribute('aria-controls', 'nav-menu');
            
            nav.appendChild(mobileMenuBtn);
        }
        
        navMenu.setAttribute('id', 'nav-menu');
        
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('mobile-active');
            
            navMenu.classList.toggle('mobile-active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', !isOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });
        
        // Close menu when clicking on a link
        navMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // Handle screen resize
        const handleResize = debounce(() => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }, 250);
        
        window.addEventListener('resize', handleResize);
    }
    
    // ========== TYPING EFFECT ENHANCEMENT ==========
    function initTypingEffect() {
        const heroSubtitle = document.querySelector('.hero-subtitle, .hero-content h2');
        if (!heroSubtitle) return;
        
        const originalText = heroSubtitle.textContent;
        const words = originalText.split(' • ');
        let currentWordIndex = 0;
        
        function typeWriter(element, text, speed = 80) {
            return new Promise((resolve) => {
                let i = 0;
                element.textContent = '';
                
                function type() {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                        setTimeout(type, speed);
                    } else {
                        resolve();
                    }
                }
                
                type();
            });
        }
        
        async function animateWords() {
            for (let word of words) {
                await typeWriter(heroSubtitle, word, 100);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (word !== words[words.length - 1]) {
                    heroSubtitle.textContent += ' • ';
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }
        
        // Start typing effect after a delay
        setTimeout(animateWords, 1000);
    }
    
    // ========== ACCESSIBILITY HELPERS ==========
    function announceNavigation(section) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigated to ${section.querySelector('h1, h2, h3')?.textContent || section.id} section`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }
    
    // ========== PERFORMANCE MONITORING ==========
    function initPerformanceOptimizations() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Reduce motion for users who prefer it
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        }
    }
    
    // ========== INITIALIZE ALL FEATURES ==========
    initSkillBars();
    initSectionRevealEffects();
    initContactForm();
    initMobileMenu();
    initTypingEffect();
    initPerformanceOptimizations();
    
    // Add dynamic styles for enhanced animations
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        /* Enhanced Navigation */
        nav, header {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                       background-color 0.3s ease,
                       box-shadow 0.3s ease;
        }
        
        nav.scrolled, header.scrolled {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Mobile Menu Enhancements */
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            flex-direction: column;
            justify-content: space-between;
            width: 30px;
            height: 25px;
            z-index: 1001;
        }
        
        .hamburger-line {
            width: 100%;
            height: 3px;
            background-color: #333;
            transition: all 0.3s ease;
            transform-origin: center;
        }
        
        .mobile-menu-btn.active .hamburger-line:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
        }
        
        .mobile-menu-btn.active .hamburger-line:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active .hamburger-line:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }
        
        .nav-menu.mobile-active {
            display: flex !important;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: 80px 2rem 2rem;
            z-index: 1000;
            animation: slideInFromTop 0.3s ease-out;
        }
        
        @keyframes slideInFromTop {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* Skill Bars */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .skill-item {
            margin-bottom: 1.5rem;
        }
        
        .skill-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .skill-bar {
            width: 100%;
            height: 8px;
            background-color: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        
        .skill-progress {
            height: 100%;
            background: linear-gradient(45deg, #4A90E2, #357ABD);
            border-radius: 4px;
            width: 0%;
            transition: width 0.3s ease;
            position: relative;
        }
        
        .skill-progress::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            background-image: linear-gradient(
                -45deg,
                rgba(255, 255, 255, 0.2) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.2) 75%,
                transparent 75%,
                transparent
            );
            background-size: 50px 50px;
            animation: moveStripes 2s linear infinite;
        }
        
        @keyframes moveStripes {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
        }
        
        /* Enhanced Reveal Effects */
        .reveal-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                       transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .reveal-element.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        .project-card.reveal-element {
            transform: translateY(30px) rotateX(10deg);
            perspective: 1000px;
        }
        
        .project-card.revealed {
            transform: translateY(0) rotateX(0deg);
        }
        
        /* Form Enhancements */
        .field-error {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        }
        
        .error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
        }
        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            border: 1px solid #c3e6cb;
        }
        
        /* Accessibility */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Focus indicators */
        .nav-link:focus,
        .btn:focus,
        button:focus,
        input:focus,
        textarea:focus {
            outline: 2px solid #4A90E2;
            outline-offset: 2px;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex;
            }
            
            .nav-menu {
                display: none;
            }
            
            .skills-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }
    `;
    
    document.head.appendChild(enhancedStyles);
    
    console.log('Enhanced portfolio features initialized successfully!');
});

// ========== UTILITY FUNCTIONS ==========

// Intersection Observer polyfill fallback
if (!window.IntersectionObserver) {
    // Simple fallback for older browsers
    window.IntersectionObserver = function(callback) {
        return {
            observe: function(element) {
                // Trigger animation immediately for older browsers
                setTimeout(() => callback([{ isIntersecting: true, target: element }]), 100);
            },
            unobserve: function() {}
        };
    };
}

// RequestAnimationFrame polyfill
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 16);
    };
}

// Export functions for potential external use
window.PortfolioEnhancements = {
    smoothScrollTo: (target, duration) => smoothScrollTo(target, duration),
    announceNavigation: (section) => announceNavigation(section),
    initSkillBars: () => initSkillBars(),
    initSectionRevealEffects: () => initSectionRevealEffects()
};
