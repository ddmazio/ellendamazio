// ========================================
// PORTFOLIO JAVASCRIPT - VERSÃO CORRIGIDA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    console.log('🚀 Portfolio JS inicializado');
    
    // ====================================
    // ELEMENTOS DOM
    // ====================================
    const elements = {
        hamburgerBtn: document.querySelector('.hamburger-menu'),
        mobileNav: document.querySelector('.mobile-nav'),
        mobileNavClose: document.querySelector('.mobile-nav .close-btn'),
        
        searchTriggers: document.querySelectorAll('.search-trigger, .mobile-search-btn'),
        searchOverlay: document.querySelector('.search-overlay'),
        searchCloseBtn: document.querySelector('.search-close-btn'),
        
        categoryItems: document.querySelectorAll('.search-category-item, .mobile-category-item'),
        projectItems: document.querySelectorAll('.search-project-item'),
        projectCards: document.querySelectorAll('.project-card, .search-project-item'),
        
        backToTopBtn: document.querySelector('.back-to-top'),
        body: document.body,
        
        // Elementos de navegação desktop/mobile
        navLeft: document.querySelector('.nav-left'),
        navRight: document.querySelector('.nav-right'),
        mobileControls: document.querySelector('.mobile-controls')
    };
    
    // ====================================
    // ESTADO DA APLICAÇÃO
    // ====================================
    const state = {
        mobileMenuOpen: false,
        searchOverlayOpen: false,
        isMobile: window.innerWidth <= 1023
    };
    
    // ====================================
    // UTILITÁRIOS
    // ====================================
    const utils = {
        lockScroll() {
            elements.body.classList.add('no-scroll');
        },
        
        unlockScroll() {
            elements.body.classList.remove('no-scroll');
        },
        
        log(action, details = '') {
            console.log(`📱 ${action}${details ? ': ' + details : ''}`);
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
                // Se mudou para desktop, fechar menus mobile
                mobileMenu.close();
                searchOverlay.close();
            }
            
            // Forçar atualização da visibilidade
            this.forceNavigationVisibility();
            
            // Reconfigurar hover words baseado no tamanho
            setupHoverWords();
            setupCustomCursor();
        },
        
        forceNavigationVisibility() {
            // Forçar visibilidade correta baseada no viewport
            if (state.isMobile) {
                // Modo mobile: esconder desktop, mostrar mobile
                if (elements.navLeft) {
                    elements.navLeft.style.display = 'none';
                    elements.navLeft.style.visibility = 'hidden';
                }
                if (elements.navRight) {
                    elements.navRight.style.display = 'none';
                    elements.navRight.style.visibility = 'hidden';
                }
                
                if (elements.mobileControls) {
                    elements.mobileControls.style.display = 'flex';
                    elements.mobileControls.style.visibility = 'visible';
                    elements.mobileControls.style.opacity = '1';
                }
                
                if (elements.hamburgerBtn) {
                    elements.hamburgerBtn.style.display = 'flex';
                    elements.hamburgerBtn.style.visibility = 'visible';
                    elements.hamburgerBtn.style.opacity = '1';
                }
            } else {
                // Modo desktop: mostrar desktop, esconder mobile
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
            elements.hamburgerBtn.classList.add('active');
            utils.lockScroll();
            state.mobileMenuOpen = true;
            
            utils.log('Menu mobile aberto');
        },
        
        close() {
            if (!elements.hamburgerBtn || !elements.mobileNav) return;
            
            elements.mobileNav.classList.remove('active');
            elements.hamburgerBtn.classList.remove('active');
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
            // Atualizar categoria ativa
            elements.categoryItems.forEach(item => {
                item.classList.toggle('active', item.dataset.category === category);
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
            
            utils.log('Projetos filtrados', `${visibleCount} visíveis`);
        }
    };
    
    // ====================================
    // EVENT LISTENERS
    // ====================================
    const setupEventListeners = () => {
        // HAMBURGER MENU
        if (elements.hamburgerBtn) {
            elements.hamburgerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                utils.log('Hamburger clicado');
                mobileMenu.toggle();
            });
            utils.log('Hamburger listener adicionado');
        } else {
            utils.log('Erro', 'Hamburger menu não encontrado');
        }
        
        // MOBILE NAV CLOSE
        if (elements.mobileNavClose) {
            elements.mobileNavClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                mobileMenu.close();
            });
        }
        
        // SEARCH TRIGGERS
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
        utils.log('Search triggers configurados', elements.searchTriggers.length);
        
        // SEARCH CLOSE
        if (elements.searchCloseBtn) {
            elements.searchCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                searchOverlay.close();
            });
        }
        
        // CATEGORY ITEMS
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
        
        // PROJECT CARDS
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
        
        // BACK TO TOP
        if (elements.backToTopBtn) {
            elements.backToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // KEYBOARD ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchOverlay.close();
                mobileMenu.close();
            }
        });
        
        // CLICK OUTSIDE
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
        
        // RESIZE HANDLER
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                utils.checkMobile();
            }, 150);
        });
        
        // ORIENTATIONCHANGE (para mobile)
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                utils.checkMobile();
            }, 500);
        });
        
        utils.log('Todos os event listeners configurados');
    };
    
    // ====================================
    // GARANTIR SPANS DO HAMBURGER - VERSÃO SIMPLES
    // ====================================
    const ensureHamburgerSpans = () => {
        const hamburgerIcon = document.querySelector('.hamburger-icon');
        if (!hamburgerIcon) return false;
        
        // Sempre recriar os spans para garantir
        hamburgerIcon.innerHTML = '<span></span><span></span><span></span>';
        
        // Aplicar estilos diretamente
        const spans = hamburgerIcon.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.setAttribute('style', `
                display: block !important;
                position: absolute !important;
                height: 2px !important;
                width: 100% !important;
                background: rgb(252, 77, 22) !important;
                background-color: rgb(252, 77, 22) !important;
                border-radius: 2px !important;
                left: 0 !important;
                visibility: visible !important;
                opacity: 1 !important;
                top: ${index * 8}px !important;
                transition: all 0.3s ease !important;
                z-index: 1 !important;
            `);
        });
        
        utils.log('Spans recriados e forçados', spans.length);
        return true;
    };
    
    // ====================================
    // FORÇAR ELEMENTOS MOBILE VISÍVEIS - VERSÃO SIMPLES
    // ====================================
    const forceMobileElements = () => {
        if (utils.checkMobile()) {
            utils.log('Forçando elementos mobile visíveis');
            
            // Forçar mobile controls
            if (elements.mobileControls) {
                elements.mobileControls.setAttribute('style', `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                    align-items: center !important;
                    gap: 0.5rem !important;
                    z-index: 1001 !important;
                `);
            }
            
            // Forçar hamburger button
            if (elements.hamburgerBtn) {
                elements.hamburgerBtn.setAttribute('style', `
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
                `);
            }
            
            // Forçar hamburger icon
            const hamburgerIcon = document.querySelector('.hamburger-icon');
            if (hamburgerIcon) {
                hamburgerIcon.setAttribute('style', `
                    width: 24px !important;
                    height: 18px !important;
                    position: relative !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `);
            }
            
            // Garantir spans
            ensureHamburgerSpans();
            
            // Esconder navegação desktop
            if (elements.navLeft) {
                elements.navLeft.style.display = 'none';
            }
            if (elements.navRight) {
                elements.navRight.style.display = 'none';
            }
        }
    };
    
    // ====================================
    // DEBUG E TESTE
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
            console.log('Category Items:', elements.categoryItems.length);
            
            if (elements.hamburgerBtn) {
                const style = window.getComputedStyle(elements.hamburgerBtn);
                console.log('Hamburger display:', style.display);
                console.log('Hamburger visibility:', style.visibility);
                console.log('Hamburger opacity:', style.opacity);
                console.log('Hamburger position:', style.position);
                console.log('Hamburger z-index:', style.zIndex);
            }
            
            console.log('Largura da tela:', window.innerWidth);
            console.log('É mobile:', state.isMobile);
            console.log('========================');
        },
        
        testMobileMenu() {
            console.log('🧪 Testando menu mobile...');
            if (elements.hamburgerBtn) {
                elements.hamburgerBtn.click();
            } else {
                console.error('❌ Hamburger não encontrado para teste');
            }
        },
        
        showAllElements() {
            console.log('=== TODOS OS ELEMENTOS ===');
            Object.keys(elements).forEach(key => {
                const element = elements[key];
                if (element && element.nodeType) {
                    console.log(`${key}:`, element);
                } else if (element && element.length !== undefined) {
                    console.log(`${key}:`, element.length, 'elementos');
                } else {
                    console.log(`${key}:`, element);
                }
            });
            console.log('=============================');
        }
    };
    
    // ====================================
    // SCROLL HANDLER
    // ====================================
    const setupScrollHandler = () => {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset > 100;
            if (elements.backToTopBtn) {
                elements.backToTopBtn.style.opacity = scrolled ? '1' : '0.3';
            }
        });
    };
    
    // ====================================
    // CURSOR CUSTOMIZADO COM EMOJIS
    // ====================================
    const setupCustomCursor = () => {
        // Só aplicar em desktop e tablet (769px+)
        if (window.innerWidth < 769) return;
        
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            font-size: 32px;
            transform: translate(-50%, -50%);
            transition: opacity 0.2s ease;
            opacity: 0;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        `;
        document.body.appendChild(cursor);
        
        // Mapear palavras para emojis
        const emojiMap = {
            'ellen': '🐢',
            'brazil': '🧉',
            'portugal': '🇵🇹',
            'ux': '👩🏻‍💻'
        };
        
        // Event listeners para hover words
        document.querySelectorAll('.hover-word').forEach(word => {
            const className = Array.from(word.classList).find(cls => emojiMap[cls]);
            if (!className) return;
            
            word.addEventListener('mouseenter', () => {
                cursor.textContent = emojiMap[className];
                cursor.style.opacity = '1';
                word.style.cursor = 'none';
            });
            
            word.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                word.style.cursor = 'default';
            });
            
            word.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        });
        
        utils.log('Cursor customizado configurado');
    };
    
    // ====================================
    // HOVER WORDS COM EMOJIS
    // ====================================
    const setupHoverWords = () => {
        const introText = document.querySelector('.intro-text');
        if (!introText) return;
        
        // Só aplicar em desktop e tablet (769px+)
        if (window.innerWidth >= 769) {
            let text = introText.innerHTML;
            
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
            
            introText.innerHTML = text;
            utils.log('Hover words configuradas');
        }
    };
    
    // ====================================
    // INICIALIZAÇÃO IMEDIATA
    // ====================================
    const initImmediate = () => {
        // Executar imediatamente se for mobile
        if (window.innerWidth <= 1023) {
            utils.log('Inicialização imediata para mobile');
            
            // Forçar elementos mobile
            forceMobileElements();
            
            // Executar novamente após pequenos delays
            setTimeout(() => {
                forceMobileElements();
                ensureHamburgerSpans();
            }, 100);
            
            setTimeout(() => {
                forceMobileElements();
                ensureHamburgerSpans();
            }, 500);
        }
    };
    
    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    const init = () => {
        try {
            // Verificar se é mobile e forçar elementos
            utils.checkMobile();
            forceMobileElements();
            
            // Configurar event listeners
            setupEventListeners();
            
            // Configurar scroll handler
            setupScrollHandler();
            
            // Configurar hover words
            setupHoverWords();
            
            // Configurar cursor customizado
            setupCustomCursor();
            
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
    
    // ====================================
    // API GLOBAL PARA DEBUG
    // ====================================
    window.portfolioDebug = {
        elements,
        state,
        mobileMenu,
        searchOverlay,
        debug,
        utils,
        testMenu: debug.testMobileMenu,
        showElements: debug.showAllElements,
        forceVisible: forceMobileElements,
        ensureSpans: ensureHamburgerSpans,
        setupWords: setupHoverWords,
        setupCursor: setupCustomCursor
    };
    
    console.log('🔧 Para debug, use:');
    console.log('- window.portfolioDebug.testMenu() - Testar menu');
    console.log('- window.portfolioDebug.showElements() - Ver elementos');
    console.log('- window.portfolioDebug.forceVisible() - Forçar visibilidade');
});

// ====================================
// FALLBACK PARA ELEMENTOS TARDIOS
// ====================================
setTimeout(() => {
    if (typeof window.portfolioDebug !== 'undefined') {
        console.log('🔄 Executando verificação tardia...');
        
        window.portfolioDebug.debug.testElements();
        
        // Forçar visibilidade novamente se necessário
        if (window.innerWidth <= 1023) {
            window.portfolioDebug.forceVisible();
            window.portfolioDebug.ensureSpans();
        }
        
        // Verificação final do hamburger
        const hamburger = document.querySelector('.hamburger-menu');
        const hamburgerIcon = document.querySelector('.hamburger-icon');
        
        if (hamburger && window.innerWidth <= 1023) {
            const style = window.getComputedStyle(hamburger);
            if (style.display === 'none' || style.visibility === 'hidden') {
                console.warn('🚨 Hamburger ainda invisível! Aplicando correção final...');
                
                // Correção definitiva
                hamburger.style.setProperty('display', 'flex', 'important');
                hamburger.style.setProperty('visibility', 'visible', 'important');
                hamburger.style.setProperty('opacity', '1', 'important');
                hamburger.style.setProperty('pointer-events', 'auto', 'important');
                
                console.log('✅ Correção aplicada!');
            }
            
            // Verificar e corrigir os spans do hamburger
            if (hamburgerIcon) {
                let spans = hamburgerIcon.querySelectorAll('span');
                
                // Se não há spans, criar
                if (spans.length < 3) {
                    console.log('🔧 Recriando spans do hamburger no fallback...');
                    hamburgerIcon.innerHTML = '<span></span><span></span><span></span>';
                    spans = hamburgerIcon.querySelectorAll('span');
                }
                
                // Forçar estilos nos spans
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
                        visibility: visible !important;
                        opacity: 1 !important;
                        top: ${index * 8}px !important;
                        transform: translateY(0) !important;
                        content: '' !important;
                        z-index: 1 !important;
                    `;
                });
                
                console.log(`✅ ${spans.length} spans verificados/criados no fallback`);
            }
        }
    }
}, 1000);

// ====================================
// VERIFICAÇÃO ADICIONAL NO LOAD
// ====================================
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.innerWidth <= 1023 && window.portfolioDebug) {
            console.log('🔄 Verificação final após load...');
            window.portfolioDebug.forceVisible();
            window.portfolioDebug.ensureSpans();
            window.portfolioDebug.debug.testElements();
        }
        
        // Configurar hover words após load completo
        if (window.portfolioDebug) {
            window.portfolioDebug.setupWords();
            window.portfolioDebug.setupCursor();
        }
    }, 500);
});