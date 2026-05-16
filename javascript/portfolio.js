// ============================================
// BACK TO TOP — declared first, referenced throughout
// ============================================

const bttBtn = document.createElement('button');
bttBtn.className = 'back-to-top';
bttBtn.setAttribute('aria-label', 'Back to top');
bttBtn.innerHTML = '<span class="btt-arrow">↑</span><span>back to top</span>';
document.body.appendChild(bttBtn);

bttBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ============================================
// ACTIVE NAV LINK + PAGE DETECTION
// (declared early — used by scroll handler and cursor)
// ============================================

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const projectPages = [
    'ting.html', 'fluid.html', 'blindspot.html', 'alice.html',
    'azucrinacao.html', 'maisedu.html', 'chain.html'
];

const isHome        = currentPage === 'index.html' || currentPage === '';
const isProjectPage = projectPages.includes(currentPage);

if (isHome || isProjectPage) {
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === 'index.html' || href === 'index.html#projects-grid') {
            link.classList.add('active');
        }
    });
}


// ============================================
// READING PROGRESS BAR (project pages only)
// ============================================

let progressBar = null;

if (isProjectPage) {
    progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
}


// ============================================
// COMBINED SCROLL + RESIZE HANDLER
// ============================================

const siteHeader = document.querySelector('header');
const bttFooter  = document.querySelector('footer');
const BTT_DEFAULT_BOTTOM = 36;
const BTT_GAP = 16;

function onScroll() {
    // Sticky header
    if (siteHeader) {
        siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    }

    // Back to top visibility
    bttBtn.classList.toggle('visible', window.scrollY > 400);

    // Back to top — avoid overlapping footer
    if (bttFooter) {
        const footerTop = bttFooter.getBoundingClientRect().top;
        const overlap   = window.innerHeight - footerTop;
        bttBtn.style.bottom = overlap > 0
            ? (overlap + BTT_GAP) + 'px'
            : BTT_DEFAULT_BOTTOM + 'px';
    }

    // Reading progress bar
    if (progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct       = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(pct, 100) + '%';
    }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll,  { passive: true });
onScroll();


// ============================================
// HAMBURGER MENU
// ============================================

const hamburger  = document.getElementById('hamburger');
const navOverlay = document.getElementById('nav-overlay');

if (hamburger && navOverlay) {
    const navClose = document.getElementById('nav-overlay-close');

    function closeMenu() {
        navOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        navOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        bttBtn.classList.remove('visible');
    });

    navClose?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeMenu();
    });

    navOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}


// ============================================
// PROJECT NAVIGATION
// ============================================

const projects = [
    { name: 'Ting',                url: 'ting.html' },
    { name: 'FLUID.ai',            url: 'fluid.html' },
    { name: 'Blind Spot',          url: 'blindspot.html' },
    { name: 'Alice in Wonderland', url: 'alice.html' },
    { name: 'Azucrinação',         url: 'azucrinacao.html' },
    { name: 'Maisedu',             url: 'maisedu.html' },
    { name: 'All in a Chain',      url: 'chain.html' }
];

function updateProjectNavigation() {
    const prevButton   = document.querySelector('.nav-button.previous');
    const nextButton   = document.querySelector('.nav-button.next');
    const currentIndex = projects.findIndex(p => p.url === currentPage);
    if (currentIndex === -1) return;

    const prevProject = projects[currentIndex === 0 ? projects.length - 1 : currentIndex - 1];
    const nextProject = projects[currentIndex === projects.length - 1 ? 0 : currentIndex + 1];

    if (prevButton && prevProject) prevButton.href = prevProject.url;
    if (nextButton && nextProject) nextButton.href = nextProject.url;
}

if (document.querySelector('.project-navigation')) {
    updateProjectNavigation();
}


// ============================================
// THEME TOGGLE
// ============================================

const themeToggle       = document.getElementById('theme-toggle');
const themeToggleMobile = document.getElementById('theme-toggle-mobile');
const htmlElement       = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';   // ← default: light
htmlElement.setAttribute('data-theme', savedTheme);

function spinFast(btn) {
    if (!btn) return;
    const img = btn.querySelector('.theme-icon-img');
    if (!img) return;
    img.classList.add('spinning-fast');
    img.addEventListener('animationend', () => {
        img.classList.remove('spinning-fast');
    }, { once: true });
}

function toggleTheme(btn) {
    const current  = htmlElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    spinFast(btn);
}

themeToggle?.addEventListener('click',       () => toggleTheme(themeToggle));
themeToggleMobile?.addEventListener('click', () => toggleTheme(themeToggleMobile));


// ============================================
// FILTER FUNCTIONALITY
// ============================================

const filterLinks  = document.querySelectorAll('.filter-link');
const projectCards = document.querySelectorAll('.project-card');
const projectsGrid = document.getElementById('projects-grid');

if (projectsGrid) {
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const filterValue = link.getAttribute('data-filter');

            if (filterValue === 'all') {
                projectsGrid.classList.remove('is-filtered');
                projectCards.forEach(card => card.classList.remove('hidden'));
            } else {
                projectsGrid.classList.add('is-filtered');
                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category').split(' ');
                    card.classList.toggle('hidden', !categories.includes(filterValue));
                });
            }
        });
    });
}


// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ============================================
// IMAGE LOADING ANIMATION
// ============================================

projectCards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transition = 'opacity 0.5s ease';
    const img = card.querySelector('.project-image');
    if (img) img.addEventListener('load', () => { card.style.opacity = '1'; });
});

window.addEventListener('load', () => {
    projectCards.forEach(card => {
        const img = card.querySelector('.project-image');
        if (img && img.complete) card.style.opacity = '1';
    });
});


// ============================================
// ABOUT PAGE — PHOTO SCROLL
// Wheel (vertical) → snaps to next/prev slide.
// Drag also supported on desktop.
// ============================================

const aboutPhotosCol = document.getElementById('about-photos-col');

if (aboutPhotosCol) {

    function getSlideWidth() {
        const slide = aboutPhotosCol.querySelector('.about-photo-slide');
        // slide width + its right margin (8px)
        return slide ? slide.offsetWidth + 8 : aboutPhotosCol.clientWidth;
    }

    function totalSlides() {
        return aboutPhotosCol.querySelectorAll('.about-photo-slide').length;
    }

    let currentSlide = 0;
    let isAnimating  = false;

    function goToSlide(index) {
        if (isAnimating) return;
        currentSlide = Math.max(0, Math.min(totalSlides() - 1, index));
        isAnimating  = true;
        aboutPhotosCol.scrollTo({
            left:     currentSlide * getSlideWidth(),
            behavior: 'smooth'
        });
        setTimeout(() => { isAnimating = false; }, 550);
    }

    // Wheel anywhere on page → advance slides
    let wheelAcc     = 0;
    let wheelTimeout = null;

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        wheelAcc += e.deltaY;

        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (Math.abs(wheelAcc) > 20) {
                goToSlide(currentSlide + (wheelAcc > 0 ? 1 : -1));
            }
            wheelAcc = 0;
        }, 60);
    }, { passive: false });

    // Mouse drag on the photo column
    let isDragging  = false;
    let dragStartX  = 0;
    let dragScrollL = 0;

    aboutPhotosCol.addEventListener('mousedown', (e) => {
        isDragging  = true;
        dragStartX  = e.clientX;
        dragScrollL = aboutPhotosCol.scrollLeft;
        aboutPhotosCol.classList.add('is-dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        aboutPhotosCol.scrollLeft = dragScrollL + (dragStartX - e.clientX);
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        aboutPhotosCol.classList.remove('is-dragging');
        // Snap to nearest slide after drag
        const nearest = Math.round(aboutPhotosCol.scrollLeft / getSlideWidth());
        goToSlide(nearest);
    });

    aboutPhotosCol.addEventListener('dragstart', (e) => e.preventDefault());
}


// ============================================
// CUSTOM CURSOR — desktop / pointer devices only
// ============================================

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="custom-cursor-inner"></div>';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Project card hover → cursor expands into pill with label
    if (isHome) {
        const cursorInner = cursor.querySelector('.custom-cursor-inner');

        document.querySelectorAll('.project-card:not(.coming-soon-card)').forEach(card => {
            card.addEventListener('mouseenter', () => {
                cursor.classList.add('hover-project');
                if (cursorInner) cursorInner.textContent = 'view project';
            });
            card.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover-project');
                if (cursorInner) cursorInner.textContent = '';
            });
        });

        document.querySelectorAll('.coming-soon-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                cursor.classList.add('hover-coming-soon');
                if (cursorInner) cursorInner.textContent = 'coming soon';
            });
            card.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover-coming-soon');
                if (cursorInner) cursorInner.textContent = '';
            });
        });
    }

    document.querySelectorAll('a, button').forEach(el => {
        if (el.classList.contains('project-card')) return;
        el.addEventListener('mouseenter', () => cursor.classList.add('hover-link'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover-link'));
    });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}



// ============================================
// SCROLL SPY — sidebar nav active state
// ============================================

function initScrollSpy() {
    const navLinks = document.querySelectorAll('.project-nav-link');
    if (!navLinks.length) return;

    const sections = [...navLinks]
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (!sections.length) return;

    navLinks[0].classList.add('is-active');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle(
                    'is-active',
                    link.getAttribute('href') === `#${id}`
                );
            });
        });
    }, { rootMargin: '-15% 0px -70% 0px' });

    sections.forEach(section => observer.observe(section));
}

initScrollSpy();