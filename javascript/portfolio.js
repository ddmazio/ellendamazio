document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    console.log('✅ DOM carregado');
    
    // ====================================
    // ELEMENTOS DOM
    // ====================================
    const elements = {
        // Menu Mobile
        hamburgerBtn: document.querySelector('.hamburger-menu'),
        hamburgerIcon: document.querySelector('.hamburger-icon'),
        mobileNav: document.querySelector('.mobile-nav'),
        mobileNavClose: document.querySelector('.mobile-nav .close-btn'),
        mobileControls: document.querySelector('.mobile-controls'),
        
        // Search Overlay
        searchTriggers: document.querySelectorAll('.search-trigger, .mobile-search-btn'),
        searchOverlay: document.querySelector('.search-overlay'),
        searchCloseBtn: document.querySelector('.search-close-btn'),
        
        // Navigation
        navLeft: document.querySelector('.nav-left'),
        navRight: document.querySelector('.nav-right'),
        mobileNavLinks: document.querySelector('.mobile-nav-links'),
        
        // Projects and Categories
        categoryItems: document.querySelectorAll('.search-category-item, .mobile-category-item'),
        projectItems: document.querySelectorAll('.search-project-item'),
        projectCards: document.querySelectorAll('.project-card, .search-project-item'),
        
        // UI Elements
        backToTopBtn: document.querySelector('.back-to-top'),
        introText: document.querySelector('.intro-text'),
        introSection: document.querySelector('.intro-section'),
        body: document.body,
        header: document.querySelector('header')
    };
    
    // ====================================
    // ESTADO DA APLICAÇÃO
    // ====================================
    const state = {
        mobileMenuOpen: false,
        searchOverlayOpen: false,
        isMobile: window.innerWidth <= 1023,
        currentCategory: 'all',
        scrollLocked: false,
        
        // Estados do Back to Top
        isHomepage: document.body.classList.contains('homepage'),
        currentScrollY: 0,
        isAtTop: true,
        isAtBottom: false,
        hasPassedIntro: false,
        hasScrolled: false
    };
    
    // ====================================
    // UTILITÁRIOS
    // ====================================
    const utils = {
        log(action, details = '') {
            console.log(`📱 ${action}${details ? ': ' + details : ''}`);
        },
        
        lockScroll() {
            if (!state.scrollLocked) {
                elements.body.classList.add('no-scroll');
                state.scrollLocked = true;
                this.log('Scroll bloqueado');
            }
        },
        
        unlockScroll() {
            if (state.scrollLocked) {
                elements.body.classList.remove('no-scroll');
                state.scrollLocked = false;
                this.log('Scroll desbloqueado');
            }
        },
        
        checkMobile() {
            const wasMobile = state.isMobile;
            state.isMobile = window.innerWidth <= 1023;
            
            if (wasMobile !== state.isMobile) {
                this.log('Mudança de viewport', state.isMobile ? 'Mobile' : 'Desktop');
                this.handleViewportChange();
            }
            
            return state.isMobile;
        },
        
        handleViewportChange() {
            if (!state.isMobile) {
                mobileMenu.close();
                searchOverlay.close();
            }
            
            hamburgerManager.forceVisibility();
            navigationManager.updateVisibility();
            
            // Reconfigurar hover effects e cursor
            hoverEffects.setup();
            customCursor.setup();
        },
        
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
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };
    
    // ====================================
    // BACK TO TOP CONTROLLER
    // ====================================
    const backToTopController = {
        config: {
            homepageThreshold: () => {
                if (elements.introSection) {
                    return elements.introSection.offsetHeight - 100;
                }
                return 600;
            },
            otherPagesThreshold: 50,
            bottomThreshold: 100,
            debounceDelay: 10
        },

        init() {
            if (!elements.backToTopBtn) {
                console.warn('⚠️ Back to top button não encontrado');
                return;
            }

            elements.backToTopBtn.setAttribute('data-tooltip', 'Back to top');
            elements.backToTopBtn.setAttribute('aria-label', 'Voltar ao topo da página');
            
            this.handleScroll();
            
            utils.log('Back to Top inicializado', 
                state.isHomepage ? 'Modo Homepage' : 'Modo Outras Páginas');
        },

        handleScroll() {
            state.currentScrollY = window.pageYOffset;
            this.updateScrollStates();
            this.updateBodyClasses();
        },

        updateScrollStates() {
            const { currentScrollY } = state;
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;

            state.isAtTop = currentScrollY <= 10;
            state.isAtBottom = (currentScrollY + windowHeight) >= 
                             (documentHeight - this.config.bottomThreshold);

            if (state.isHomepage) {
                const threshold = this.config.homepageThreshold();
                state.hasPassedIntro = currentScrollY > threshold;
            } else {
                state.hasScrolled = currentScrollY > this.config.otherPagesThreshold;
            }
        },

        updateBodyClasses() {
            const { isAtTop, isAtBottom, hasPassedIntro, hasScrolled, isHomepage } = state;

            elements.body.classList.toggle('at-top', isAtTop);
            elements.body.classList.toggle('at-bottom', isAtBottom);

            if (isHomepage) {
                elements.body.classList.toggle('scrolled-past-intro', hasPassedIntro);
            } else {
                elements.body.classList.toggle('scrolled', hasScrolled);
            }
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            setTimeout(() => {
                const firstFocusable = document.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 500);

            utils.log('Scroll to top executado');
        }
    };
    
    // ====================================
    // GERENCIADOR DO HAMBURGER
    // ====================================
    const hamburgerManager = {
        ensureSpans() {
            if (!elements.hamburgerIcon) {
                console.error('❌ Hamburger icon não encontrado');
                return false;
            }
            
            elements.hamburgerIcon.innerHTML = '<span></span><span></span><span></span>';
            
            const spans = elements.hamburgerIcon.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.cssText = `
                    display: block !important;
                    position: absolute !important;
                    height: 2px !important;
                    width: 100% !important;
                    background: rgb(252, 77, 22) !important;
                    background-color: rgb(252, 77, 22) !important;
                    border-radius: 2px !important;
                    left: 0 !important;
                    right: 0 !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    top: ${index * 8}px !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    z-index: 1 !important;
                    transform: translateY(0) !important;
                `;
            });
            
            utils.log('Spans do hamburger criados', spans.length);
            return true;
        },
        
        forceVisibility() {
            if (!state.isMobile) return;
            
            console.log('🔧 Forçando visibilidade do hamburger...');
            
            if (elements.mobileControls) {
                elements.mobileControls.style.cssText = `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                    align-items: center !important;
                    gap: 0.5rem !important;
                    z-index: 1001 !important;
                    position: relative !important;
                `;
            }
            
            if (elements.hamburgerBtn) {
                elements.hamburgerBtn.style.cssText = `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                    align-items: center !important;
                    justify-content: center !important;
                    min-width: 44px !important;
                    min-height: 44px !important;
                    padding: 0.75rem !important;
                    background: transparent !important;
                    border: none !important;
                    cursor: pointer !important;
                    z-index: 1002 !important;
                    border-radius: 12px !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    position: relative !important;
                `;
            }
            
            if (elements.hamburgerIcon) {
                elements.hamburgerIcon.style.cssText = `
                    width: 24px !important;
                    height: 18px !important;
                    position: relative !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;
            }
            
            this.ensureSpans();
            
            utils.log('Hamburger forçado a ser visível');
        },
        
        updateState(isActive) {
            if (elements.hamburgerBtn) {
                elements.hamburgerBtn.classList.toggle('active', isActive);
            }
        }
    };
    
    // ====================================
    // GERENCIADOR DE NAVEGAÇÃO
    // ====================================
    const navigationManager = {
        updateVisibility() {
            if (state.isMobile) {
                if (elements.navLeft) elements.navLeft.style.display = 'none';
                if (elements.navRight) elements.navRight.style.display = 'none';
                
                hamburgerManager.forceVisibility();
            } else {
                if (elements.navLeft) {
                    elements.navLeft.style.display = 'flex';
                    elements.navLeft.style.visibility = 'visible';
                }
                if (elements.navRight) {
                    elements.navRight.style.display = 'flex';
                    elements.navRight.style.visibility = 'visible';
                }
                
                if (elements.mobileControls) {
                    elements.mobileControls.style.display = 'none';
                    elements.mobileControls.style.visibility = 'hidden';
                }
            }
        },
        
        improveMobileLayout() {
            const mobileNavContent = document.querySelector('.mobile-nav-content');
            const mobileNavLinks = document.querySelector('.mobile-nav-links');
            
            if (mobileNavContent) {
                mobileNavContent.style.cssText = `
                    padding: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    height: calc(100vh - 80px) !important;
                    justify-content: center !important;
                    align-items: center !important;
                    overflow-y: auto !important;
                    text-align: center !important;
                `;
            }
            
            if (mobileNavLinks) {
                mobileNavLinks.style.cssText = `
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 2rem !important;
                    margin: 0 !important;
                    padding: 2rem !important;
                    flex: 1 !important;
                    width: 100% !important;
                `;
                
                const navLinks = mobileNavLinks.querySelectorAll('.mobile-nav-link');
                navLinks.forEach(link => {
                    link.style.cssText = `
                        font-size: 3rem !important;
                        font-family: var(--font-bold) !important;
                        font-weight: var(--font-weight-bold) !important;
                        padding: 1rem 2rem !important;
                        border: none !important;
                        border-bottom: none !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        text-transform: uppercase !important;
                        letter-spacing: 2px !important;
                        color: var(--color-primary) !important;
                        text-align: center !important;
                        width: auto !important;
                        display: block !important;
                    `;
                    
                    link.addEventListener('mouseenter', function() {
                        this.style.color = 'var(--color-hover)';
                        this.style.transform = 'scale(1.05)';
                    });
                    
                    link.addEventListener('mouseleave', function() {
                        this.style.color = 'var(--color-primary)';
                        this.style.transform = 'scale(1)';
                    });
                });
            }
            
            utils.log('Layout do menu mobile melhorado');
        }
    };
    
    // ====================================
    // MENU MOBILE
    // ====================================
    const mobileMenu = {
        toggle() {
            if (state.mobileMenuOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        
        open() {
            if (!elements.hamburgerBtn || !elements.mobileNav) {
                utils.log('Erro', 'Elementos do menu mobile não encontrados');
                return;
            }
            
            searchOverlay.close();
            
            elements.mobileNav.classList.add('active');
            hamburgerManager.updateState(true);
            utils.lockScroll();
            state.mobileMenuOpen = true;
            
            setTimeout(() => {
                navigationManager.improveMobileLayout();
            }, 50);
            
            utils.log('Menu mobile aberto');
        },
        
        close() {
            if (!elements.hamburgerBtn || !elements.mobileNav) return;
            
            elements.mobileNav.classList.remove('active');
            hamburgerManager.updateState(false);
            utils.unlockScroll();
            state.mobileMenuOpen = false;
            
            utils.log('Menu mobile fechado');
        }
    };
    
    // ====================================
    // SEARCH OVERLAY
    // ====================================
    const searchOverlay = {
        toggle() {
            if (state.searchOverlayOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        
        open() {
            if (!elements.searchOverlay) {
                utils.log('Erro', 'Search overlay não encontrado');
                return;
            }
            
            mobileMenu.close();
            
            elements.searchOverlay.classList.add('active');
            utils.lockScroll();
            state.searchOverlayOpen = true;
            
            this.setCategory('all');
            
            utils.log('Search overlay aberto');
        },
        
        close() {
            if (!elements.searchOverlay) return;
            
            elements.searchOverlay.classList.remove('active');
            utils.unlockScroll();
            state.searchOverlayOpen = false;
            
            utils.log('Search overlay fechado');
        },
        
        setCategory(category) {
            state.currentCategory = category;
            
            elements.categoryItems.forEach(item => {
                const isActive = item.dataset.category === category;
                item.classList.toggle('active', isActive);
            });
            
            this.filterProjects(category);
            
            utils.log('Categoria selecionada', category);
        },
        
        filterProjects(category) {
            let visibleCount = 0;
            
            elements.projectItems.forEach(project => {
                const projectCategories = project.dataset.category || '';
                const shouldShow = category === 'all' || projectCategories.includes(category);
                
                project.classList.toggle('hidden', !shouldShow);
                project.style.display = shouldShow ? 'block' : 'none';
                
                if (shouldShow) visibleCount++;
            });
            
            utils.log('Projetos filtrados', `${visibleCount} visíveis de ${elements.projectItems.length}`);
        }
    };
    
    // ====================================
    // EFEITOS HOVER - CORRIGIDO
    // ====================================
    const hoverEffects = {
        setup() {
            // Só aplicar em desktop e se estiver na homepage
            if (!elements.introText || window.innerWidth < 769 || !state.isHomepage) {
                utils.log('Hover effects não aplicados', 'Mobile ou não homepage');
                return;
            }
            
            // Aguardar um pouco para garantir que o DOM está pronto
            setTimeout(() => {
                this.applyHoverWords();
            }, 100);
        },
        
        applyHoverWords() {
            if (!elements.introText) return;
            
            let text = elements.introText.innerHTML;
            
            // Verificar se já foi aplicado
            if (text.includes('hover-word')) {
                utils.log('Hover words já aplicados');
                return;
            }
            
            const words = {
                'Ellen': { emoji: '🐢', class: 'ellen' },
                'Brazilian': { emoji: '🧉', class: 'brazil' },
                'Lisbon': { emoji: '🇵🇹', class: 'portugal' },
                'UX': { emoji: '👩🏻‍💻', class: 'ux' }
            };
            
            // Aplicar as substituições
            Object.entries(words).forEach(([word, config]) => {
                const regex = new RegExp(`\\b${word}\\b`, 'g');
                text = text.replace(regex, 
                    `<span class="hover-word ${config.class}" data-emoji="${config.emoji}">${word}</span>`
                );
            });
            
            elements.introText.innerHTML = text;
            
            // Configurar cursor customizado após aplicar as palavras
            setTimeout(() => {
                customCursor.setup();
                utils.log('Hover words aplicados e cursor configurado');
            }, 50);
        }
    };
    
    // ====================================
    // CURSOR CUSTOMIZADO - CORRIGIDO
    // ====================================
    const customCursor = {
        cursor: null,
        
        setup() {
            // Só aplicar em desktop/tablet (769px+) e se estiver na homepage
            if (window.innerWidth < 769 || !state.isHomepage) {
                this.destroy();
                return;
            }
            
            // Aguardar um pouco para garantir que as hover words foram aplicadas
            setTimeout(() => {
                this.create();
                this.bindEvents();
            }, 200);
        },
        
        create() {
            if (this.cursor) this.destroy();
            
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            this.cursor.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                font-size: 32px;
                transform: translate(-50%, -50%);
                transition: opacity 0.2s ease;
                opacity: 0;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            `;
            document.body.appendChild(this.cursor);
            
            utils.log('Cursor customizado criado');
        },
        
        bindEvents() {
            if (!this.cursor) return;
            
            const emojiMap = {
                'ellen': '🐢',
                'brazil': '🧉',
                'portugal': '🇵🇹',
                'ux': '👩🏻‍💻'
            };
            
            // Buscar as palavras com hover depois que foram aplicadas
            const hoverWords = document.querySelectorAll('.hover-word');
            
            if (hoverWords.length === 0) {
                utils.log('Nenhuma hover word encontrada');
                return;
            }
            
            hoverWords.forEach(word => {
                const className = Array.from(word.classList).find(cls => emojiMap[cls]);
                if (!className) return;
                
                word.addEventListener('mouseenter', (e) => {
                    this.cursor.textContent = emojiMap[className];
                    this.cursor.style.opacity = '1';
                    word.style.cursor = 'none';
                    word.style.fontWeight = '800';
                    
                    // Posicionar cursor na posição atual do mouse
                    this.cursor.style.left = e.clientX + 'px';
                    this.cursor.style.top = e.clientY + 'px';
                });
                
                word.addEventListener('mouseleave', () => {
                    this.cursor.style.opacity = '0';
                    word.style.cursor = 'default';
                    word.style.fontWeight = 'var(--font-weight-bold)';
                });
                
                word.addEventListener('mousemove', (e) => {
                    if (this.cursor.style.opacity === '1') {
                        this.cursor.style.left = e.clientX + 'px';
                        this.cursor.style.top = e.clientY + 'px';
                    }
                });
            });
            
            utils.log('Event listeners do cursor configurados', `${hoverWords.length} palavras`);
        },
        
        destroy() {
            if (this.cursor) {
                this.cursor.remove();
                this.cursor = null;
                utils.log('Cursor customizado removido');
            }
        }
    };
    
    // ====================================
    // SCROLL HANDLER
    // ====================================
    const scrollHandler = {
        setup() {
            backToTopController.init();

            const debouncedScroll = utils.debounce(() => {
                backToTopController.handleScroll();
            }, backToTopController.config.debounceDelay);
            
            window.addEventListener('scroll', debouncedScroll, { passive: true });
            
            utils.log('Scroll handler configurado com Back to Top');
        }
    };
    
    // ====================================
    // EVENT LISTENERS
    // ====================================
    const eventListeners = {
        setup() {
            this.setupMenuEvents();
            this.setupSearchEvents();
            this.setupProjectEvents();
            this.setupKeyboardEvents();
            this.setupWindowEvents();
            this.setupClickOutside();
            this.setupBackToTopEvents();
            
            utils.log('Todos os event listeners configurados');
        },
        
        setupMenuEvents() {
            if (elements.hamburgerBtn) {
                elements.hamburgerBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ HAMBURGER CLICADO!');
                    mobileMenu.toggle();
                });
                console.log('✅ Event listener do hamburger adicionado');
            } else {
                console.error('❌ HAMBURGER BUTTON NÃO ENCONTRADO!');
            }
            
            if (elements.mobileNavClose) {
                elements.mobileNavClose.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ Close button clicado');
                    mobileMenu.close();
                });
                console.log('✅ Event listener do close adicionado');
            }
        },
        
        setupSearchEvents() {
            elements.searchTriggers.forEach((trigger, index) => {
                if (trigger) {
                    trigger.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        utils.log('Search trigger clicado', `índice ${index}`);
                        searchOverlay.toggle();
                    });
                }
            });
            console.log('✅ Search triggers configurados:', elements.searchTriggers.length);
            
            if (elements.searchCloseBtn) {
                elements.searchCloseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    searchOverlay.close();
                });
            }
            
            elements.categoryItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const category = this.dataset.category;
                    
                    if (category) {
                        searchOverlay.setCategory(category);
                        
                        if (this.classList.contains('mobile-category-item')) {
                            mobileMenu.close();
                            setTimeout(() => {
                                searchOverlay.open();
                            }, 300);
                        }
                    }
                });
            });
        },
        
        setupProjectEvents() {
            elements.projectCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    const href = this.dataset.href;
                    if (href && href !== '#') {
                        utils.log('Navegando para projeto', href);
                        window.location.href = href;
                    }
                });
            });
        },
        
        setupBackToTopEvents() {
            if (elements.backToTopBtn) {
                elements.backToTopBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    backToTopController.scrollToTop();
                });
                console.log('✅ Back to top event listener adicionado');
            }
        },
        
        setupKeyboardEvents() {
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    searchOverlay.close();
                    mobileMenu.close();
                }
                
                if (e.key === 'Home' && e.ctrlKey) {
                    e.preventDefault();
                    backToTopController.scrollToTop();
                }
            });
        },
        
        setupWindowEvents() {
            const debouncedResize = utils.debounce(() => {
                utils.checkMobile();
                if (backToTopController && elements.backToTopBtn) {
                    backToTopController.handleScroll();
                }
                
                // Reconfigurar hover effects no resize
                hoverEffects.setup();
                customCursor.setup();
            }, 150);
            
            window.addEventListener('resize', debouncedResize, { passive: true });
            
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    utils.checkMobile();
                    if (backToTopController && elements.backToTopBtn) {
                        backToTopController.handleScroll();
                    }
                    hoverEffects.setup();
                    customCursor.setup();
                }, 500);
            });
        },
        
        setupClickOutside() {
            document.addEventListener('click', function(e) {
                if (state.searchOverlayOpen && elements.searchOverlay && 
                    e.target === elements.searchOverlay) {
                    searchOverlay.close();
                }
                
                if (state.mobileMenuOpen && elements.mobileNav && 
                    e.target === elements.mobileNav) {
                    mobileMenu.close();
                }
            });
        }
    };
    
    // ====================================
    // DEBUG E TESTES
    // ====================================
    const debug = {
        testElements() {
            console.log('=== DEBUG ELEMENTOS ===');
            console.log('Hamburger encontrado:', !!elements.hamburgerBtn);
            console.log('Mobile Nav encontrado:', !!elements.mobileNav);
            console.log('Mobile Controls encontrado:', !!elements.mobileControls);
            console.log('Search Overlay encontrado:', !!elements.searchOverlay);
            console.log('Search Triggers:', elements.searchTriggers.length);
            console.log('Project Cards:', elements.projectCards.length);
            console.log('Back to Top encontrado:', !!elements.backToTopBtn);
            console.log('Intro Section encontrada:', !!elements.introSection);
            console.log('Intro Text encontrado:', !!elements.introText);
            console.log('Largura da tela:', window.innerWidth);
            console.log('É mobile:', state.isMobile);
            console.log('É homepage:', state.isHomepage);
            
            // Debug específico do hover
            const hoverWords = document.querySelectorAll('.hover-word');
            console.log('Hover words encontradas:', hoverWords.length);
            console.log('Cursor customizado existe:', !!customCursor.cursor);
            
            console.log('========================');
        },
        
        testHoverEffects() {
            console.log('🧪 Testando hover effects...');
            hoverEffects.setup();
            customCursor.setup();
            
            setTimeout(() => {
                const hoverWords = document.querySelectorAll('.hover-word');
                console.log('✅ Hover words após setup:', hoverWords.length);
                console.log('✅ Cursor após setup:', !!customCursor.cursor);
            }, 500);
        },
        
        forceCorrections() {
            console.log('🔧 Forçando todas as correções...');
            hamburgerManager.forceVisibility();
            hamburgerManager.ensureSpans();
            navigationManager.updateVisibility();
            navigationManager.improveMobileLayout();
            
            // Forçar hover effects
            if (state.isHomepage) {
                hoverEffects.setup();
                customCursor.setup();
            }
            
            if (backToTopController && elements.backToTopBtn) {
                backToTopController.handleScroll();
            }
            console.log('✅ Correções aplicadas!');
        }
    };
    
    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    const init = () => {
        try {
            utils.log('Iniciando aplicação');
            
            // Verificar e configurar viewport
            utils.checkMobile();
            
            // Configurar navegação e hamburger
            navigationManager.updateVisibility();
            hamburgerManager.forceVisibility();
            hamburgerManager.ensureSpans();
            navigationManager.improveMobileLayout();
            
            // Configurar event listeners
            eventListeners.setup();
            
            // Configurar scroll handler (inclui back to top)
            scrollHandler.setup();
            
            // Configurar efeitos visuais - AGUARDAR UM POUCO MAIS
            setTimeout(() => {
                if (state.isHomepage && window.innerWidth >= 769) {
                    hoverEffects.setup();
                }
            }, 300);
            
            // Debug inicial
            debug.testElements();
            
            console.log('✅ Portfolio inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    };
    
    // ====================================
    // EXECUTAR INICIALIZAÇÃO
    // ====================================
    init();
    
    // Executar correções adicionais com delays
    setTimeout(() => {
        console.log('🔄 Primeira verificação (100ms)...');
        hamburgerManager.forceVisibility();
        hamburgerManager.ensureSpans();
        navigationManager.improveMobileLayout();
        if (backToTopController && elements.backToTopBtn) {
            backToTopController.handleScroll();
        }
    }, 100);
    
    setTimeout(() => {
        console.log('🔄 Segunda verificação (500ms)...');
        hamburgerManager.forceVisibility();
        hamburgerManager.ensureSpans();
        navigationManager.improveMobileLayout();
        
        // Verificação específica dos hover effects
        if (state.isHomepage && window.innerWidth >= 769) {
            console.log('🎨 Configurando hover effects (500ms)...');
            hoverEffects.setup();
        }
        
        if (backToTopController && elements.backToTopBtn) {
            backToTopController.handleScroll();
        }
    }, 500);
    
    setTimeout(() => {
        console.log('🔄 Terceira verificação (1000ms)...');
        hamburgerManager.forceVisibility();
        hamburgerManager.ensureSpans();
        navigationManager.improveMobileLayout();
        
        // Verificação final dos hover effects
        if (state.isHomepage && window.innerWidth >= 769) {
            console.log('🎨 Verificação final dos hover effects...');
            const hoverWords = document.querySelectorAll('.hover-word');
            if (hoverWords.length === 0) {
                console.log('⚠️ Hover words não encontradas, reaplicando...');
                hoverEffects.setup();
            } else {
                console.log('✅ Hover words já aplicadas:', hoverWords.length);
                // Reconfigurar cursor se necessário
                if (!customCursor.cursor) {
                    customCursor.setup();
                }
            }
        }
        
        if (backToTopController && elements.backToTopBtn) {
            backToTopController.handleScroll();
        }
    }, 1000);
    
    // ====================================
    // API GLOBAL PARA DEBUG
    // ====================================
    window.portfolioDebug = {
        elements,
        state,
        mobileMenu,
        searchOverlay,
        hamburgerManager,
        navigationManager,
        backToTopController,
        hoverEffects,
        customCursor,
        debug,
        utils,
        
        // Funções principais para debug
        testMenu: debug.testMobileMenu,
        testElements: debug.testElements,
        forceCorrections: debug.forceCorrections,
        testBackToTop: debug.testBackToTop,
        testHoverEffects: debug.testHoverEffects,
        
        // Funções específicas para hover effects
        testHover: function() {
            console.log('🧪 Testando hover effects manualmente...');
            debug.testHoverEffects();
        },
        
        checkHoverWords: function() {
            const hoverWords = document.querySelectorAll('.hover-word');
            console.log('📊 Status dos hover words:', {
                encontradas: hoverWords.length,
                introText: !!elements.introText,
                isHomepage: state.isHomepage,
                windowWidth: window.innerWidth,
                cursorExists: !!customCursor.cursor
            });
            
            if (hoverWords.length > 0) {
                hoverWords.forEach((word, index) => {
                    console.log(`  ${index + 1}. ${word.textContent} (${word.className})`);
                });
            }
        },
        
        forceHoverEffects: function() {
            console.log('🔧 Forçando hover effects...');
            if (elements.introText) {
                // Limpar texto anterior
                const text = elements.introText.textContent;
                elements.introText.innerHTML = text;
                
                // Reaplicar
                hoverEffects.setup();
                
                setTimeout(() => {
                    this.checkHoverWords();
                }, 200);
            } else {
                console.error('❌ Intro text não encontrado');
            }
        }
    };
    
    console.log('🔧 Para debug dos hover effects, use:');
    console.log('- window.portfolioDebug.checkHoverWords() - Ver status dos hover words');
    console.log('- window.portfolioDebug.forceHoverEffects() - Forçar reaplicação');
    console.log('- window.portfolioDebug.testHoverEffects() - Testar configuração');
});

// ====================================
// VERIFICAÇÕES FINAIS - INCLUINDO HOVER EFFECTS
// ====================================

// Fallback para hover effects
setTimeout(() => {
    if (typeof window.portfolioDebug !== 'undefined') {
        console.log('🔄 Executando verificação tardia dos hover effects...');
        
        // Verificar se estamos na homepage
        const isHomepage = document.body.classList.contains('homepage');
        const introText = document.querySelector('.intro-text');
        
        if (isHomepage && introText && window.innerWidth >= 769) {
            const hoverWords = document.querySelectorAll('.hover-word');
            
            if (hoverWords.length === 0) {
                console.log('⚠️ Hover words não aplicadas, corrigindo...');
                window.portfolioDebug.forceHoverEffects();
            } else {
                console.log('✅ Hover words já aplicadas:', hoverWords.length);
                
                // Verificar se o cursor existe
                if (!window.portfolioDebug.customCursor.cursor) {
                    console.log('🔧 Cursor não existe, criando...');
                    window.portfolioDebug.customCursor.setup();
                }
            }
        }
        
        // Verificação final do hamburger com correção extrema
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (hamburger && window.innerWidth <= 1023) {
            const style = window.getComputedStyle(hamburger);
            console.log('🔍 Verificação final do hamburger:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity
            });
            
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                console.warn('🚨 Hamburger ainda invisível! Aplicando correção EXTREMA...');
                
                hamburger.style.setProperty('display', 'flex', 'important');
                hamburger.style.setProperty('visibility', 'visible', 'important');
                hamburger.style.setProperty('opacity', '1', 'important');
                hamburger.style.setProperty('pointer-events', 'auto', 'important');
                hamburger.style.setProperty('position', 'relative', 'important');
                hamburger.style.setProperty('z-index', '9999', 'important');
                hamburger.style.setProperty('min-width', '50px', 'important');
                hamburger.style.setProperty('min-height', '50px', 'important');
                hamburger.style.setProperty('cursor', 'pointer', 'important');
                
                const mobileControls = hamburger.closest('.mobile-controls');
                if (mobileControls) {
                    mobileControls.style.setProperty('display', 'flex', 'important');
                    mobileControls.style.setProperty('visibility', 'visible', 'important');
                    mobileControls.style.setProperty('opacity', '1', 'important');
                    mobileControls.style.setProperty('pointer-events', 'auto', 'important');
                }
                
                console.log('✅ Correção EXTREMA aplicada!');
            } else {
                console.log('✅ Hamburger está visível!');
            }
        }
        
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            console.log('🔍 Verificação final do back to top...');
            window.portfolioDebug.checkBackToTopStatus();
        }
        
        if (hamburger) {
            console.log('🧪 Testando event listener do hamburger...');
            
            hamburger.addEventListener('click', function(e) {
                console.log('🎯 BACKUP EVENT LISTENER ATIVADO!');
                e.preventDefault();
                e.stopPropagation();
                
                const mobileNav = document.querySelector('.mobile-nav');
                if (mobileNav) {
                    if (mobileNav.classList.contains('active')) {
                        mobileNav.classList.remove('active');
                        hamburger.classList.remove('active');
                        document.body.classList.remove('no-scroll');
                        console.log('✅ Menu fechado via backup');
                    } else {
                        mobileNav.classList.add('active');
                        hamburger.classList.add('active');
                        document.body.classList.add('no-scroll');
                        console.log('✅ Menu aberto via backup');
                    }
                }
            });
            
            console.log('✅ Event listener backup adicionado');
        }
    }
}, 2000);

// Verificação após load completo - INCLUINDO HOVER EFFECTS
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔄 Verificação final após load completo...');
        
        if (window.innerWidth <= 1023 && window.portfolioDebug) {
            window.portfolioDebug.forceCorrections();
            
            console.log('🤖 Executando teste automático do hamburger...');
            window.portfolioDebug.checkHamburgerStatus();
            
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
                const style = window.getComputedStyle(hamburger);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    console.warn('🚨 Aplicando última tentativa...');
                    window.portfolioDebug.forceHamburgerExtreme();
                }
            }
        }
        
        // Configurar hover effects após load completo - VERSÃO MELHORADA
        if (window.portfolioDebug) {
            const isHomepage = document.body.classList.contains('homepage');
            const introText = document.querySelector('.intro-text');
            
            if (isHomepage && introText && window.innerWidth >= 769) {
                console.log('🎨 Configurando hover effects após load completo...');
                
                // Aguardar mais um pouco para garantir que tudo carregou
                setTimeout(() => {
                    const hoverWords = document.querySelectorAll('.hover-word');
                    
                    if (hoverWords.length === 0) {
                        console.log('🔧 Aplicando hover effects após load...');
                        window.portfolioDebug.hoverEffects.setup();
                        
                        setTimeout(() => {
                            window.portfolioDebug.customCursor.setup();
                            window.portfolioDebug.checkHoverWords();
                        }, 300);
                    } else {
                        console.log('✅ Hover effects já configurados:', hoverWords.length);
                        
                        // Garantir que o cursor está funcionando
                        if (!window.portfolioDebug.customCursor.cursor) {
                            window.portfolioDebug.customCursor.setup();
                        }
                    }
                }, 500);
            }
        }
        
        if (window.portfolioDebug && window.portfolioDebug.backToTopController) {
            console.log('🔝 Executando teste final do back to top...');
            window.portfolioDebug.checkBackToTopStatus();
        }
        
        console.log('🎉 Verificação final concluída!');
    }, 1000);
});