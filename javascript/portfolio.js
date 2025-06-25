// ========================================
// PORTFOLIO JAVASCRIPT - VERSÃO COMPLETA COM BACK TO TOP INTELIGENTE
// ========================================

console.log('🚀 Portfolio JS inicializado - Nova versão com Back to Top');

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
    
    console.log('📱 Elementos encontrados:', {
        hamburgerBtn: !!elements.hamburgerBtn,
        hamburgerIcon: !!elements.hamburgerIcon,
        mobileNav: !!elements.mobileNav,
        mobileControls: !!elements.mobileControls,
        searchOverlay: !!elements.searchOverlay,
        searchTriggers: elements.searchTriggers.length,
        projectCards: elements.projectCards.length,
        backToTopBtn: !!elements.backToTopBtn,
        introSection: !!elements.introSection
    });
    
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
            // Fechar menus ao mudar para desktop
            if (!state.isMobile) {
                mobileMenu.close();
                searchOverlay.close();
            }
            
            // Forçar visibilidade correta
            hamburgerManager.forceVisibility();
            navigationManager.updateVisibility();
            
            // Reconfigurar funcionalidades baseadas no viewport
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
    // BACK TO TOP CONTROLLER - NOVO
    // ====================================
    const backToTopController = {
        // Configurações
        config: {
            // Homepage: threshold baseado na altura da intro section
            homepageThreshold: () => {
                if (elements.introSection) {
                    return elements.introSection.offsetHeight - 100;
                }
                return 600; // fallback
            },
            
            // Outras páginas: threshold pequeno para aparecer logo
            otherPagesThreshold: 50,
            
            // Threshold para detectar final da página
            bottomThreshold: 100,
            
            // Debounce delay para performance
            debounceDelay: 10
        },

        // Inicializar
        init() {
            if (!elements.backToTopBtn) {
                console.warn('⚠️ Back to top button não encontrado');
                return;
            }

            // Adicionar atributo de tooltip
            elements.backToTopBtn.setAttribute('data-tooltip', 'Back to top');
            elements.backToTopBtn.setAttribute('aria-label', 'Voltar ao topo da página');
            
            // Verificação inicial
            this.handleScroll();
            
            utils.log('Back to Top inicializado', 
                state.isHomepage ? 'Modo Homepage' : 'Modo Outras Páginas');
        },

        // Handler principal de scroll
        handleScroll() {
            // Atualizar posição atual
            state.currentScrollY = window.pageYOffset;
            
            // Calcular estados
            this.updateScrollStates();
            
            // Aplicar classes CSS baseadas no estado
            this.updateBodyClasses();
        },

        // Atualizar estados baseados na posição do scroll
        updateScrollStates() {
            const { currentScrollY } = state;
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;

            // Detectar se está no topo
            state.isAtTop = currentScrollY <= 10;

            // Detectar se está no final
            state.isAtBottom = (currentScrollY + windowHeight) >= 
                             (documentHeight - this.config.bottomThreshold);

            if (state.isHomepage) {
                // Homepage: verificar se passou da intro section
                const threshold = this.config.homepageThreshold();
                state.hasPassedIntro = currentScrollY > threshold;
            } else {
                // Outras páginas: verificar se começou a rolar
                state.hasScrolled = currentScrollY > this.config.otherPagesThreshold;
            }
        },

        // Atualizar classes CSS no body
        updateBodyClasses() {
            const { isAtTop, isAtBottom, hasPassedIntro, hasScrolled, isHomepage } = state;

            // Classes de estado geral
            elements.body.classList.toggle('at-top', isAtTop);
            elements.body.classList.toggle('at-bottom', isAtBottom);

            if (isHomepage) {
                // Homepage: classe para quando passou da intro
                elements.body.classList.toggle('scrolled-past-intro', hasPassedIntro);
            } else {
                // Outras páginas: classe para quando começou a rolar
                elements.body.classList.toggle('scrolled', hasScrolled);
            }
        },

        // Scroll suave para o topo
        scrollToTop() {
            // Scroll suave para o topo
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Focus no primeiro elemento focável da página após o scroll
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
            
            // Sempre recriar os spans para garantir
            elements.hamburgerIcon.innerHTML = '<span></span><span></span><span></span>';
            
            // Aplicar estilos diretamente com máxima força
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
            
            // Forçar mobile controls
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
            
            // Forçar hamburger button
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
            
            // Forçar hamburger icon
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
            
            // Garantir spans
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
                // Mobile: esconder desktop nav, mostrar mobile controls
                if (elements.navLeft) elements.navLeft.style.display = 'none';
                if (elements.navRight) elements.navRight.style.display = 'none';
                
                hamburgerManager.forceVisibility();
            } else {
                // Desktop: mostrar desktop nav, esconder mobile controls
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
                
                // Melhorar links individuais
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
                    
                    // Hover effects
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
            
            // Fechar search se estiver aberto
            searchOverlay.close();
            
            // Abrir menu
            elements.mobileNav.classList.add('active');
            hamburgerManager.updateState(true);
            utils.lockScroll();
            state.mobileMenuOpen = true;
            
            // Melhorar layout após abrir
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
            
            // Fechar menu mobile se estiver aberto
            mobileMenu.close();
            
            // Abrir search
            elements.searchOverlay.classList.add('active');
            utils.lockScroll();
            state.searchOverlayOpen = true;
            
            // Reset para "all categories"
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
            
            // Atualizar categoria ativa
            elements.categoryItems.forEach(item => {
                const isActive = item.dataset.category === category;
                item.classList.toggle('active', isActive);
            });
            
            // Filtrar projetos
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
    // EFEITOS HOVER
    // ====================================
    const hoverEffects = {
        setup() {
            if (!elements.introText || window.innerWidth < 769) return;
            
            let text = elements.introText.innerHTML;
            
            // Substituir palavras específicas por spans com hover
            const words = {
                'Ellen': { emoji: '🐢', class: 'ellen' },
                'Brazilian': { emoji: '🧉', class: 'brazil' },
                'Lisbon': { emoji: '🇵🇹', class: 'portugal' },
                'UX': { emoji: '👩🏻‍💻', class: 'ux' }
            };
            
            Object.entries(words).forEach(([word, config]) => {
                const regex = new RegExp(`\\b${word}\\b`, 'g');
                text = text.replace(regex, 
                    `<span class="hover-word ${config.class}" data-emoji="${config.emoji}">${word}</span>`
                );
            });
            
            elements.introText.innerHTML = text;
            utils.log('Hover words configuradas');
        }
    };
    
    // ====================================
    // CURSOR CUSTOMIZADO
    // ====================================
    const customCursor = {
        cursor: null,
        
        setup() {
            // Só aplicar em desktop/tablet (769px+)
            if (window.innerWidth < 769) {
                this.destroy();
                return;
            }
            
            this.create();
            this.bindEvents();
            utils.log('Cursor customizado configurado');
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
        },
        
        bindEvents() {
            if (!this.cursor) return;
            
            const emojiMap = {
                'ellen': '🐢',
                'brazil': '🧉',
                'portugal': '🇵🇹',
                'ux': '👩🏻‍💻'
            };
            
            document.querySelectorAll('.hover-word').forEach(word => {
                const className = Array.from(word.classList).find(cls => emojiMap[cls]);
                if (!className) return;
                
                word.addEventListener('mouseenter', () => {
                    this.cursor.textContent = emojiMap[className];
                    this.cursor.style.opacity = '1';
                    word.style.cursor = 'none';
                });
                
                word.addEventListener('mouseleave', () => {
                    this.cursor.style.opacity = '0';
                    word.style.cursor = 'default';
                });
                
                word.addEventListener('mousemove', (e) => {
                    this.cursor.style.left = e.clientX + 'px';
                    this.cursor.style.top = e.clientY + 'px';
                });
            });
        },
        
        destroy() {
            if (this.cursor) {
                this.cursor.remove();
                this.cursor = null;
            }
        }
    };
    
    // ====================================
    // SCROLL HANDLER - ATUALIZADO COM BACK TO TOP
    // ====================================
    const scrollHandler = {
        setup() {
            // Inicializar o back to top controller
            backToTopController.init();

            // Scroll handler combinado com debounce
            const debouncedScroll = utils.debounce(() => {
                // Back to top handling
                backToTopController.handleScroll();
                
                // Outras funcionalidades de scroll podem ser adicionadas aqui
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
            // Hamburger menu
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
            
            // Mobile nav close
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
            // Search triggers
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
            
            // Search close
            if (elements.searchCloseBtn) {
                elements.searchCloseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    searchOverlay.close();
                });
            }
            
            // Category items
            elements.categoryItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const category = this.dataset.category;
                    
                    if (category) {
                        searchOverlay.setCategory(category);
                        
                        // Se for mobile category, fechar menu e abrir search
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
            // Project cards navigation
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
            // Back to top click
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
                
                // Back to top com teclado (Home key)
                if (e.key === 'Home' && e.ctrlKey) {
                    e.preventDefault();
                    backToTopController.scrollToTop();
                }
            });
        },
        
        setupWindowEvents() {
            // Resize handler
            const debouncedResize = utils.debounce(() => {
                utils.checkMobile();
                // Recalcular thresholds do back to top após resize
                if (backToTopController && elements.backToTopBtn) {
                    backToTopController.handleScroll();
                }
            }, 150);
            
            window.addEventListener('resize', debouncedResize, { passive: true });
            
            // Orientation change
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    utils.checkMobile();
                    if (backToTopController && elements.backToTopBtn) {
                        backToTopController.handleScroll();
                    }
                }, 500);
            });
        },
        
        setupClickOutside() {
            document.addEventListener('click', function(e) {
                // Fechar search se clicar fora
                if (state.searchOverlayOpen && elements.searchOverlay && 
                    e.target === elements.searchOverlay) {
                    searchOverlay.close();
                }
                
                // Fechar mobile menu se clicar fora
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
            console.log('Largura da tela:', window.innerWidth);
            console.log('É mobile:', state.isMobile);
            console.log('É homepage:', state.isHomepage);
            
            if (elements.hamburgerBtn) {
                const style = window.getComputedStyle(elements.hamburgerBtn);
                console.log('📊 Status do hamburger:', {
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    pointerEvents: style.pointerEvents,
                    zIndex: style.zIndex
                });
            }
            
            if (elements.backToTopBtn) {
                const style = window.getComputedStyle(elements.backToTopBtn);
                console.log('📊 Status do back to top:', {
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    transform: style.transform
                });
            }
            
            console.log('========================');
        },
        
        testMobileMenu() {
            console.log('🧪 Testando menu mobile...');
            if (elements.hamburgerBtn) {
                console.log('✅ Simulando click no hamburger...');
                elements.hamburgerBtn.click();
            } else {
                console.error('❌ Hamburger não encontrado para teste');
            }
        },
        
        testBackToTop() {
            console.log('🧪 Testando back to top...');
            console.log('Estado atual:', {
                isHomepage: state.isHomepage,
                currentScrollY: state.currentScrollY,
                hasPassedIntro: state.hasPassedIntro,
                hasScrolled: state.hasScrolled,
                isAtTop: state.isAtTop,
                isAtBottom: state.isAtBottom
            });
            console.log('Configuração:', backToTopController.config);
        },
        
        simulateHomepageScroll() {
            console.log('🧪 Simulando scroll na homepage...');
            const threshold = backToTopController.config.homepageThreshold();
            window.scrollTo({ top: threshold + 100, behavior: 'smooth' });
            setTimeout(() => {
                console.log('✅ Scroll simulado - verificar se botão apareceu');
                this.testBackToTop();
            }, 1000);
        },
        
        simulateOtherPageScroll() {
            console.log('🧪 Simulando scroll em outras páginas...');
            window.scrollTo({ top: backToTopController.config.otherPagesThreshold + 100, behavior: 'smooth' });
            setTimeout(() => {
                console.log('✅ Scroll simulado - verificar se botão apareceu');
                this.testBackToTop();
            }, 1000);
        },
        
        forceCorrections() {
            console.log('🔧 Forçando todas as correções...');
            hamburgerManager.forceVisibility();
            hamburgerManager.ensureSpans();
            navigationManager.updateVisibility();
            navigationManager.improveMobileLayout();
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
            
            // Configurar efeitos visuais
            hoverEffects.setup();
            customCursor.setup();
            
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
        if (backToTopController && elements.backToTopBtn) {
            backToTopController.handleScroll();
        }
    }, 500);
    
    setTimeout(() => {
        console.log('🔄 Terceira verificação (1000ms)...');
        hamburgerManager.forceVisibility();
        hamburgerManager.ensureSpans();
        navigationManager.improveMobileLayout();
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
        debug,
        utils,
        
        // Funções principais para debug
        testMenu: debug.testMobileMenu,
        testElements: debug.testElements,
        forceCorrections: debug.forceCorrections,
        testBackToTop: debug.testBackToTop,
        simulateHomepageScroll: debug.simulateHomepageScroll,
        simulateOtherPageScroll: debug.simulateOtherPageScroll,
        
        // Funções específicas para hamburger (mantidas por compatibilidade)
        testHamburgerClick: function() {
            console.log('🧪 Testando click direto no hamburger...');
            if (elements.hamburgerBtn) {
                console.log('✅ Elemento encontrado, simulando click...');
                elements.hamburgerBtn.click();
            } else {
                console.error('❌ Hamburger não encontrado');
            }
        },
        
        checkHamburgerStatus: function() {
            if (elements.hamburgerBtn) {
                const style = window.getComputedStyle(elements.hamburgerBtn);
                console.log('📊 Status completo do hamburger:', {
                    element: elements.hamburgerBtn,
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    pointerEvents: style.pointerEvents,
                    zIndex: style.zIndex,
                    position: style.position,
                    cursor: style.cursor,
                    width: style.width,
                    height: style.height
                });
                
                const rect = elements.hamburgerBtn.getBoundingClientRect();
                console.log('📐 Posição e tamanho:', {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    visible: rect.width > 0 && rect.height > 0
                });
            } else {
                console.error('❌ Hamburger button não encontrado');
            }
        },
        
        forceHamburgerExtreme: function() {
            console.log('🚨 Aplicando correção EXTREMA no hamburger...');
            
            if (elements.hamburgerBtn) {
                // Remover todas as classes que podem interferir
                elements.hamburgerBtn.className = 'hamburger-menu';
                
                // Aplicar estilos extremos
                elements.hamburgerBtn.style.setProperty('display', 'flex', 'important');
                elements.hamburgerBtn.style.setProperty('visibility', 'visible', 'important');
                elements.hamburgerBtn.style.setProperty('opacity', '1', 'important');
                elements.hamburgerBtn.style.setProperty('pointer-events', 'auto', 'important');
                elements.hamburgerBtn.style.setProperty('position', 'relative', 'important');
                elements.hamburgerBtn.style.setProperty('z-index', '9999', 'important');
                elements.hamburgerBtn.style.setProperty('background', 'red', 'important'); // Para debug
                elements.hamburgerBtn.style.setProperty('min-width', '50px', 'important');
                elements.hamburgerBtn.style.setProperty('min-height', '50px', 'important');
                elements.hamburgerBtn.style.setProperty('cursor', 'pointer', 'important');
                
                console.log('✅ Correção extrema aplicada (com fundo vermelho para debug)');
                
                // Verificar novamente
                this.checkHamburgerStatus();
            }
        },
        
        // Novas funções específicas para Back to Top
        testBackToTopClick: function() {
            console.log('🧪 Testando click do back to top...');
            if (elements.backToTopBtn) {
                elements.backToTopBtn.click();
            } else {
                console.error('❌ Back to top button não encontrado');
            }
        },
        
        checkBackToTopStatus: function() {
            if (elements.backToTopBtn) {
                const style = window.getComputedStyle(elements.backToTopBtn);
                console.log('📊 Status completo do back to top:', {
                    element: elements.backToTopBtn,
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    transform: style.transform,
                    pointerEvents: style.pointerEvents
                });
                
                console.log('📊 Estado interno:', {
                    isHomepage: state.isHomepage,
                    currentScrollY: state.currentScrollY,
                    hasPassedIntro: state.hasPassedIntro,
                    hasScrolled: state.hasScrolled,
                    isAtTop: state.isAtTop,
                    isAtBottom: state.isAtBottom
                });
                
                console.log('📊 Classes do body:', Array.from(elements.body.classList));
            } else {
                console.error('❌ Back to top button não encontrado');
            }
        }
    };
    
    console.log('🔧 Para debug, use:');
    console.log('- window.portfolioDebug.testBackToTop() - Ver estado do back to top');
    console.log('- window.portfolioDebug.simulateHomepageScroll() - Testar na homepage');
    console.log('- window.portfolioDebug.simulateOtherPageScroll() - Testar em outras páginas');
    console.log('- window.portfolioDebug.testHamburgerClick() - Testar click do hamburger');
    console.log('- window.portfolioDebug.checkHamburgerStatus() - Verificar status do hamburger');
    console.log('- window.portfolioDebug.checkBackToTopStatus() - Verificar status do back to top');
    console.log('- window.portfolioDebug.testElements() - Ver todos elementos');
    console.log('- window.portfolioDebug.forceCorrections() - Forçar correções');
});

// ====================================
// VERIFICAÇÕES FINAIS E FALLBACKS
// ====================================

// Fallback para elementos tardios
setTimeout(() => {
    if (typeof window.portfolioDebug !== 'undefined') {
        console.log('🔄 Executando verificação tardia...');
        
        window.portfolioDebug.debug.testElements();
        
        // Forçar visibilidade novamente se necessário
        if (window.innerWidth <= 1023) {
            console.log('📱 Dispositivo mobile detectado, forçando correções...');
            window.portfolioDebug.hamburgerManager.forceVisibility();
            window.portfolioDebug.hamburgerManager.ensureSpans();
            window.portfolioDebug.navigationManager.improveMobileLayout();
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
                
                // Correção mais agressiva possível
                hamburger.style.setProperty('display', 'flex', 'important');
                hamburger.style.setProperty('visibility', 'visible', 'important');
                hamburger.style.setProperty('opacity', '1', 'important');
                hamburger.style.setProperty('pointer-events', 'auto', 'important');
                hamburger.style.setProperty('position', 'relative', 'important');
                hamburger.style.setProperty('z-index', '9999', 'important');
                hamburger.style.setProperty('background', 'rgba(255, 0, 0, 0.3)', 'important'); // Debug
                hamburger.style.setProperty('min-width', '50px', 'important');
                hamburger.style.setProperty('min-height', '50px', 'important');
                hamburger.style.setProperty('cursor', 'pointer', 'important');
                hamburger.style.setProperty('border', '2px solid red', 'important'); // Debug
                
                // Forçar o container pai também
                const mobileControls = hamburger.closest('.mobile-controls');
                if (mobileControls) {
                    mobileControls.style.setProperty('display', 'flex', 'important');
                    mobileControls.style.setProperty('visibility', 'visible', 'important');
                    mobileControls.style.setProperty('opacity', '1', 'important');
                    mobileControls.style.setProperty('pointer-events', 'auto', 'important');
                }
                
                console.log('✅ Correção EXTREMA aplicada com indicadores visuais!');
            } else {
                console.log('✅ Hamburger está visível!');
            }
        }
        
        // Verificação do back to top
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            console.log('🔍 Verificação final do back to top...');
            window.portfolioDebug.checkBackToTopStatus();
        }
        
        // Verificar se o event listener está funcionando
        if (hamburger) {
            console.log('🧪 Testando event listener do hamburger...');
            
            // Adicionar event listener extra como backup
            hamburger.addEventListener('click', function(e) {
                console.log('🎯 BACKUP EVENT LISTENER ATIVADO!');
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle manual do menu
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

// Verificação após load completo
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔄 Verificação final após load completo...');
        
        if (window.innerWidth <= 1023 && window.portfolioDebug) {
            window.portfolioDebug.forceCorrections();
            
            // Teste automático do hamburger
            console.log('🤖 Executando teste automático do hamburger...');
            window.portfolioDebug.checkHamburgerStatus();
            
            // Se ainda não estiver funcionando, aplicar correção extrema
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
                const style = window.getComputedStyle(hamburger);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    console.warn('🚨 Aplicando última tentativa...');
                    window.portfolioDebug.forceHamburgerExtreme();
                }
            }
        }
        
        // Configurar efeitos visuais após load completo
        if (window.portfolioDebug) {
            const hoverEffects = {
                setup() {
                    const introText = document.querySelector('.intro-text');
                    if (!introText || window.innerWidth < 769) return;
                    
                    let text = introText.innerHTML;
                    
                    const words = {
                        'Ellen': { emoji: '🐢', class: 'ellen' },
                        'Brazilian': { emoji: '🧉', class: 'brazil' },
                        'Lisbon': { emoji: '🇵🇹', class: 'portugal' },
                        'UX': { emoji: '👩🏻‍💻', class: 'ux' }
                    };
                    
                    Object.entries(words).forEach(([word, config]) => {
                        const regex = new RegExp(`\\b${word}\\b`, 'g');
                        text = text.replace(regex, 
                            `<span class="hover-word ${config.class}" data-emoji="${config.emoji}">${word}</span>`
                        );
                    });
                    
                    introText.innerHTML = text;
                    console.log('✅ Hover effects configurados após load');
                }
            };
            
            hoverEffects.setup();
        }
        
        // Teste final do back to top
        if (window.portfolioDebug && window.portfolioDebug.backToTopController) {
            console.log('🔝 Executando teste final do back to top...');
            window.portfolioDebug.checkBackToTopStatus();
        }
        
        console.log('🎉 Verificação final concluída!');
    }, 1000);
});

console.log('🎉 JavaScript Portfolio carregado com sucesso!');