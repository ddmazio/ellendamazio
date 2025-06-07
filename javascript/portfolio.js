/* ========================================
   ELLEN DAMAZIO PORTFOLIO - MASTER JAVASCRIPT
   Version: 4.0 - COMPLETO E REORGANIZADO
   ======================================== */

   (function() {
    'use strict';

    /* ========================================
       1. CONSTANTS & CONFIGURATION
       ======================================== */
    const CONFIG = {
        transitions: {
            duration: 300,
            easing: 'ease-in-out'
        },
        breakpoints: {
            mobile: 600,
            tablet: 768,
            desktop: 1024
        },
        debounce: {
            scroll: 10,
            resize: 150
        },
        animations: {
            fadeIn: 'opacity 0.6s ease, transform 0.6s ease',
            slideUp: 'opacity 0.8s ease, transform 0.8s ease'
        }
    };

    /* ========================================
       2. STATE MANAGEMENT
       ======================================== */
    const state = {
        mobileMenuOpen: false,
        searchOverlayOpen: false,
        currentCategory: 'all',
        scrollPosition: 0,
        isScrolling: false,
        isInitialized: false
    };

    /* ========================================
       3. DOM ELEMENTS CACHE
       ======================================== */
    const elements = {
        // Header & Navigation
        header: null,
        hamburgerMenu: null,
        searchTrigger: null,
        mobileSearchBtn: null,
        
        // Overlays
        mobileNav: null,
        searchOverlay: null,
        searchCloseBtn: null,
        closeBtn: null,
        
        // Search & Projects
        searchCategories: null,
        searchProjects: null,
        projectCards: null,
        
        // About Page - Photo Gallery
        photoGallery: null,
        photoCards: null,
        photoStack: null,
        shuffleBtn: null,
        resetBtn: null,
        
        // Global
        backToTop: null,
        body: document.body
    };

    /* ========================================
       4. UTILITY FUNCTIONS
       ======================================== */
    const utils = {
        // Performance optimizations
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Device detection
        isMobile() {
            return window.innerWidth <= CONFIG.breakpoints.tablet;
        },

        isTouch() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        // Scroll utilities
        scrollToElement(element, offset = 0) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth'
            });
        },

        // Body scroll control
        lockScroll() {
            elements.body.classList.add('no-scroll');
        },

        unlockScroll() {
            elements.body.classList.remove('no-scroll');
        },

        // Animation helpers
        fadeIn(element, delay = 0) {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        },

        // Page detection
        getCurrentPage() {
            if (document.querySelector('.homepage')) return 'home';
            if (document.querySelector('.about-page')) return 'about';
            if (document.querySelector('.project-page')) return 'project';
            return 'other';
        }
    };

    /* ========================================
       5. MOBILE MENU CONTROLLER
       ======================================== */
    const mobileMenu = {
        toggle() {
            if (state.mobileMenuOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        open() {
            if (!elements.mobileNav || !elements.hamburgerMenu) return;
            
            // Close search if open
            searchOverlay.close();
            
            // Open mobile menu with animation
            elements.mobileNav.classList.add('active');
            elements.hamburgerMenu.classList.add('active');
            utils.lockScroll();
            state.mobileMenuOpen = true;

            // Analytics/logging (optional)
            console.log('Mobile menu opened');
        },

        close() {
            if (!elements.mobileNav || !elements.hamburgerMenu) return;
            
            elements.mobileNav.classList.remove('active');
            elements.hamburgerMenu.classList.remove('active');
            utils.unlockScroll();
            state.mobileMenuOpen = false;

            console.log('Mobile menu closed');
        }
    };

    /* ========================================
       6. SEARCH OVERLAY CONTROLLER
       ======================================== */
    const searchOverlay = {
        toggle() {
            if (state.searchOverlayOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        open() {
            if (!elements.searchOverlay) return;
            
            // Close mobile menu if open
            mobileMenu.close();
            
            // Open search overlay
            elements.searchOverlay.classList.add('active');
            utils.lockScroll();
            state.searchOverlayOpen = true;
            
            // Reset to all categories
            this.setCategory('all');

            console.log('Search overlay opened');
        },

        close() {
            if (!elements.searchOverlay) return;
            
            elements.searchOverlay.classList.remove('active');
            utils.unlockScroll();
            state.searchOverlayOpen = false;

            console.log('Search overlay closed');
        },

        setCategory(category) {
            state.currentCategory = category;
            
            // Update active state
            if (elements.searchCategories) {
                elements.searchCategories.forEach(item => {
                    item.classList.toggle('active', item.dataset.category === category);
                });
            }
            
            // Filter projects
            this.filterProjects(category);
            
            console.log(`Category set to: ${category}`);
        },

        filterProjects(category) {
            if (!elements.searchProjects) return;
            
            let visibleCount = 0;
            elements.searchProjects.forEach(project => {
                const projectCategories = project.dataset.category || '';
                const hasCategory = category === 'all' || 
                    projectCategories.split(' ').includes(category);
                
                project.classList.toggle('hidden', !hasCategory);
                if (hasCategory) visibleCount++;
            });

            console.log(`Filtered projects: ${visibleCount} visible`);
        }
    };

    /* ========================================
       7. SCROLL CONTROLLER
       ======================================== */
    const scroll = {
        handleScroll() {
            state.scrollPosition = window.pageYOffset;
            
            // Header shadow effect
            if (elements.header) {
                const shouldHaveShadow = state.scrollPosition > 0;
                elements.header.style.boxShadow = 
                    shouldHaveShadow ? 'var(--shadow-light)' : 'none';
            }
            
            // Back to top button visibility
            if (elements.backToTop) {
                const threshold = 300;
                const isVisible = state.scrollPosition > threshold;
                elements.backToTop.style.opacity = isVisible ? '1' : '0.3';
                elements.backToTop.style.pointerEvents = isVisible ? 'auto' : 'none';
            }
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            console.log('Scrolled to top');
        }
    };

    /* ========================================
       8. PROJECT FEATURES CONTROLLER
       ======================================== */
    const projects = {
        handleProjectClick(e) {
            const project = e.currentTarget;
            const href = project.dataset.href;
            
            if (href && href !== '#') {
                // Add click animation
                project.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 150);

                console.log(`Navigating to project: ${href}`);
            }
        },

        setupIntersectionObserver() {
            // Only run on homepage
            if (utils.getCurrentPage() !== 'home') return;
            
            const options = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        utils.fadeIn(entry.target);
                    }
                });
            }, options);
            
            // Observe all project cards
            document.querySelectorAll('.project-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = CONFIG.animations.fadeIn;
                observer.observe(card);
            });

            console.log('Project intersection observer setup complete');
        },

        setupVideoPlayers() {
            const videoContainers = document.querySelectorAll('.video-container');
            videoContainers.forEach(container => {
                const iframe = container.querySelector('.video-iframe');
                const placeholder = container.querySelector('.video-placeholder');
                
                if (iframe && placeholder) {
                    iframe.onload = () => {
                        placeholder.style.display = 'none';
                    };
                }
            });

            console.log(`Setup ${videoContainers.length} video players`);
        },

        setupImageLightbox() {
            const images = document.querySelectorAll('.mockup-item img, .gallery-section img');
            images.forEach(img => {
                img.addEventListener('click', (e) => {
                    this.createLightbox(img);
                });
            });

            console.log(`Setup lightbox for ${images.length} images`);
        },

        createLightbox(img) {
            const overlay = document.createElement('div');
            overlay.className = 'image-lightbox-overlay';
            overlay.innerHTML = `
                <div class="lightbox-content">
                    <img src="${img.src}" alt="${img.alt || ''}" />
                    <button class="lightbox-close">&times;</button>
                </div>
            `;
            
            // Apply styles
            Object.assign(overlay.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.9)',
                zIndex: '10000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            });
            
            const content = overlay.querySelector('.lightbox-content');
            Object.assign(content.style, {
                maxWidth: '90%',
                maxHeight: '90%',
                position: 'relative'
            });
            
            const lightboxImg = overlay.querySelector('img');
            Object.assign(lightboxImg.style, {
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
            });
            
            const closeBtn = overlay.querySelector('.lightbox-close');
            Object.assign(closeBtn.style, {
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                cursor: 'pointer',
                padding: '0.5rem'
            });
            
            document.body.appendChild(overlay);
            utils.lockScroll();
            
            // Close handlers
            const closeLightbox = () => {
                document.body.removeChild(overlay);
                utils.unlockScroll();
            };
            
            overlay.addEventListener('click', closeLightbox);
            closeBtn.addEventListener('click', closeLightbox);
            lightboxImg.addEventListener('click', (e) => e.stopPropagation());

            console.log('Lightbox created for image:', img.src);
        },

        setupPrototypeLinks() {
            const prototypeLinks = document.querySelectorAll('.prototype-link, .prototype-demo a');
            prototypeLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    link.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        link.style.transform = '';
                    }, 150);
                });
            });

            console.log(`Setup ${prototypeLinks.length} prototype links`);
        },

        init() {
            this.setupVideoPlayers();
            this.setupImageLightbox();
            this.setupPrototypeLinks();
            this.setupIntersectionObserver();
        }
    };

    /* ========================================
       9. PHOTO GALLERY CONTROLLER (ABOUT PAGE)
       ======================================== */
    const photoGallery = {
        isDragging: false,
        currentCard: null,
        initialPositions: [],

        init() {
            // Only run on about page
            if (utils.getCurrentPage() !== 'about' || !elements.photoGallery) return;
            
            this.saveInitialPositions();
            this.setupEventListeners();
            
            console.log('Photo gallery initialized');
        },

        saveInitialPositions() {
            if (!elements.photoCards) return;
            
            elements.photoCards.forEach((card, index) => {
                const computedStyle = window.getComputedStyle(card);
                this.initialPositions[index] = {
                    transform: computedStyle.transform,
                    zIndex: computedStyle.zIndex
                };
            });

            console.log(`Saved ${this.initialPositions.length} initial positions`);
        },

        setupEventListeners() {
            if (!elements.photoCards) return;

            // Touch and Mouse Events for Dragging
            elements.photoCards.forEach(card => {
                // Mouse Events
                card.addEventListener('mousedown', (e) => this.startDrag(e, card));
                document.addEventListener('mousemove', (e) => this.drag(e));
                document.addEventListener('mouseup', () => this.endDrag());

                // Touch Events
                card.addEventListener('touchstart', (e) => this.startDrag(e, card), { passive: false });
                document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
                document.addEventListener('touchend', () => this.endDrag());

                // Click to bring to front
                card.addEventListener('click', (e) => {
                    if (!this.isDragging) {
                        this.bringToFront(card);
                    }
                });
            });

            // Button Events
            if (elements.shuffleBtn) {
                elements.shuffleBtn.addEventListener('click', () => this.shuffleCards());
            }
            if (elements.resetBtn) {
                elements.resetBtn.addEventListener('click', () => this.resetCards());
            }
        },

        startDrag(e, card) {
            e.preventDefault();
            this.isDragging = true;
            this.currentCard = card;
            
            card.classList.add('dragging');
            this.bringToFront(card);

            const rect = card.getBoundingClientRect();
            const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
            
            this.offsetX = clientX - rect.left;
            this.offsetY = clientY - rect.top;

            console.log('Started dragging card:', card.dataset.story);
        },

        drag(e) {
            if (!this.isDragging || !this.currentCard) return;
            
            e.preventDefault();
            
            const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            
            const containerRect = elements.photoStack.getBoundingClientRect();
            const x = clientX - containerRect.left - this.offsetX;
            const y = clientY - containerRect.top - this.offsetY;
            
            // Add 3D rotation based on position
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.currentCard.style.transform = `
                translate(${x}px, ${y}px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
                scale(1.05)
            `;
        },

        endDrag() {
            if (!this.isDragging || !this.currentCard) return;
            
            this.isDragging = false;
            this.currentCard.classList.remove('dragging');
            
            // Add physics-like behavior
            this.currentCard.style.transition = 'transform 0.3s ease-out';
            
            setTimeout(() => {
                if (this.currentCard) {
                    this.currentCard.style.transition = '';
                }
            }, 300);
            
            console.log('Ended dragging card');
            this.currentCard = null;
        },

        bringToFront(card) {
            const maxZ = Math.max(...Array.from(elements.photoCards).map(c => 
                parseInt(window.getComputedStyle(c).zIndex) || 0
            ));
            card.style.zIndex = maxZ + 1;
        },

        shuffleCards() {
            if (!elements.photoCards) return;

            elements.photoCards.forEach((card, index) => {
                const randomX = (Math.random() - 0.5) * 100;
                const randomY = (Math.random() - 0.5) * 60;
                const randomRotate = (Math.random() - 0.5) * 20;
                const randomZ = Math.floor(Math.random() * elements.photoCards.length) + 1;
                
                card.style.transition = 'transform 0.6s ease, z-index 0.3s ease';
                card.style.transform = `
                    translate(${randomX}px, ${randomY}px) 
                    rotate(${randomRotate}deg)
                `;
                card.style.zIndex = randomZ;
                
                setTimeout(() => {
                    card.style.transition = '';
                }, 600);
            });

            console.log('Cards shuffled');
        },

        resetCards() {
            if (!elements.photoCards) return;

            elements.photoCards.forEach((card, index) => {
                card.style.transition = 'transform 0.6s ease, z-index 0.3s ease';
                card.style.transform = this.initialPositions[index].transform;
                card.style.zIndex = this.initialPositions[index].zIndex;
                
                setTimeout(() => {
                    card.style.transition = '';
                }, 600);
            });

            console.log('Cards reset to initial positions');
        }
    };

    /* ========================================
       10. ABOUT PAGE CONTROLLER
       ======================================== */
    const aboutPage = {
        init() {
            // Only run on about page
            if (utils.getCurrentPage() !== 'about') return;
            
            this.setupScrollAnimations();
            this.setupContactForm();
            photoGallery.init();
            
            console.log('About page initialized');
        },

        setupScrollAnimations() {
            const sections = document.querySelectorAll('.content-section, .content-section2');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        utils.fadeIn(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            sections.forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                section.style.transition = CONFIG.animations.slideUp;
                observer.observe(section);
            });

            console.log(`Setup scroll animations for ${sections.length} sections`);
        },

        setupContactForm() {
            const contactLinks = document.querySelectorAll('a[href^="mailto:"]');
            contactLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    link.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        link.style.transform = '';
                    }, 150);
                });
            });

            console.log(`Setup ${contactLinks.length} contact links`);
        }
    };

    /* ========================================
       11. EVENT LISTENERS SETUP
       ======================================== */
    const eventListeners = {
        init() {
            this.setupHeaderEvents();
            this.setupSearchEvents();
            this.setupMobileEvents();
            this.setupProjectEvents();
            this.setupGlobalEvents();
            this.setupScrollEvents();
            
            console.log('All event listeners initialized');
        },

        setupHeaderEvents() {
            // Search triggers
            if (elements.searchTrigger) {
                elements.searchTrigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    searchOverlay.toggle();
                });
            }

            if (elements.mobileSearchBtn) {
                elements.mobileSearchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    searchOverlay.toggle();
                });
            }
        },

        setupSearchEvents() {
            // Search close button
            if (elements.searchCloseBtn) {
                elements.searchCloseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    searchOverlay.close();
                });
            }

            // Category items
            if (elements.searchCategories) {
                elements.searchCategories.forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        searchOverlay.setCategory(item.dataset.category);
                    });
                });
            }

            // Project items
            if (elements.searchProjects) {
                elements.searchProjects.forEach(item => {
                    item.addEventListener('click', (e) => {
                        projects.handleProjectClick(e);
                    });
                });
            }
        },

        setupMobileEvents() {
            // Hamburger menu
            if (elements.hamburgerMenu) {
                elements.hamburgerMenu.addEventListener('click', (e) => {
                    e.preventDefault();
                    mobileMenu.toggle();
                });
            }

            // Mobile close button
            if (elements.closeBtn) {
                elements.closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    mobileMenu.close();
                });
            }

            // Mobile category items
            document.querySelectorAll('.mobile-category-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = item.dataset.category;
                    
                    mobileMenu.close();
                    setTimeout(() => {
                        searchOverlay.open();
                        searchOverlay.setCategory(category);
                    }, 300);
                });
            });
        },

        setupProjectEvents() {
            // Main project cards
            if (elements.projectCards) {
                elements.projectCards.forEach(card => {
                    card.addEventListener('click', (e) => {
                        projects.handleProjectClick(e);
                    });
                });
            }
        },

        setupGlobalEvents() {
            // Escape key handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchOverlay.close();
                    mobileMenu.close();
                    
                    // Close lightbox if open
                    const lightbox = document.querySelector('.image-lightbox-overlay');
                    if (lightbox) {
                        document.body.removeChild(lightbox);
                        utils.unlockScroll();
                    }
                }
            });

            // Outside clicks
            document.addEventListener('click', (e) => {
                if (state.mobileMenuOpen && elements.mobileNav && 
                    !elements.mobileNav.contains(e.target) && 
                    !elements.hamburgerMenu.contains(e.target)) {
                    mobileMenu.close();
                }
            });

            // Window resize
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > CONFIG.breakpoints.desktop) {
                    mobileMenu.close();
                }
            }, CONFIG.debounce.resize));
        },

        setupScrollEvents() {
            // Scroll handler
            window.addEventListener('scroll', utils.throttle(() => {
                scroll.handleScroll();
            }, CONFIG.debounce.scroll));

            // Back to top
            if (elements.backToTop) {
                elements.backToTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    scroll.scrollToTop();
                });
            }

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href !== '#') {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            utils.scrollToElement(target, 80);
                        }
                    }
                });
            });
        }
    };

    /* ========================================
       12. INITIALIZATION CONTROLLER
       ======================================== */
    const init = {
        cacheDOMElements() {
            // Header elements
            elements.header = document.querySelector('header');
            elements.hamburgerMenu = document.querySelector('.hamburger-menu');
            elements.searchTrigger = document.querySelector('.search-trigger');
            elements.mobileSearchBtn = document.querySelector('.mobile-search-btn');
            
            // Overlay elements
            elements.mobileNav = document.querySelector('.mobile-nav');
            elements.searchOverlay = document.querySelector('.search-overlay');
            elements.searchCloseBtn = document.querySelector('.search-close-btn');
            elements.closeBtn = document.querySelector('.close-btn');
            
            // Search elements
            elements.searchCategories = document.querySelectorAll('.search-category-item');
            elements.searchProjects = document.querySelectorAll('.search-project-item');
            
            // Project elements
            elements.projectCards = document.querySelectorAll('.project-card');
            
            // Photo Gallery elements (About page)
            elements.photoGallery = document.querySelector('.photo-gallery');
            elements.photoCards = document.querySelectorAll('.photo-card');
            elements.photoStack = document.querySelector('.photo-stack');
            elements.shuffleBtn = document.getElementById('shuffleBtn');
            elements.resetBtn = document.getElementById('resetBtn');
            
            // Navigation elements
            elements.backToTop = document.querySelector('.back-to-top');

            console.log('DOM elements cached successfully');
        },

        setupInitialStates() {
            // Set initial scroll position
            scroll.handleScroll();
            
            // Setup page-specific features
            const currentPage = utils.getCurrentPage();
            console.log(`Current page detected: ${currentPage}`);
            
            // Setup intersection observer for animations
            if ('IntersectionObserver' in window) {
                projects.setupIntersectionObserver();
            }
            
            // Initialize page-specific controllers
            projects.init();
            aboutPage.init();
        },

        start() {
            if (state.isInitialized) {
                console.warn('Portfolio already initialized');
                return;
            }

            // Cache DOM elements
            this.cacheDOMElements();
            
            // Setup event listeners
            eventListeners.init();
            
            // Setup initial states
            this.setupInitialStates();
            
            // Mark as initialized
            state.isInitialized = true;
            
            console.log('🚀 Portfolio initialized successfully!');
            console.log('Page:', utils.getCurrentPage());
            console.log('Touch device:', utils.isTouch());
            console.log('Mobile view:', utils.isMobile());
        }
    };

    /* ========================================
       13. PUBLIC API (for debugging & testing)
       ======================================== */
    window.portfolio = {
        // State
        state,
        CONFIG,
        
        // Controllers
        mobileMenu,
        searchOverlay,
        scroll,
        projects,
        photoGallery,
        aboutPage,
        
        // Utils
        utils,
        
        // Reinitialize (for development)
        reinit: () => {
            state.isInitialized = false;
            init.start();
        }
    };

    /* ========================================
       14. APPLICATION STARTUP
       ======================================== */
    const startup = () => {
        try {
            init.start();
        } catch (error) {
            console.error('Portfolio initialization failed:', error);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startup);
    } else {
        // DOM is already loaded
        startup();
    }

})();