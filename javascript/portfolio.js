// ============================================
// STICKY HEADER
// ============================================

const siteHeader = document.querySelector('header');

function updateHeader() {
    if (window.scrollY > 10) {
        siteHeader?.classList.add('scrolled');
    } else {
        siteHeader?.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();


// ============================================
// HAMBURGER MENU
// ============================================

const hamburger = document.getElementById('hamburger');
const navOverlay = document.getElementById('nav-overlay');

if (hamburger && navOverlay) {
    const navClose = document.getElementById('nav-overlay-close');

    function closeMenu() {
        navOverlay.classList.remove('open');
        document.body.style.overflow = '';
        if (typeof updateBttPosition === 'function') updateBttPosition();
    }

    hamburger.addEventListener('click', () => {
        navOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        bttBtn.classList.remove('visible');
    });

    navClose?.addEventListener('click', closeMenu);

    navOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}


// ============================================
// PROJECT NAVIGATION
// ============================================

const projects = [
    { name: 'Ting', url: 'ting.html' },
    { name: 'Alice in Wonderland', url: 'alice.html' },
    { name: 'Azucrinacao', url: 'azucrinacao.html' },
    { name: 'Maisedu', url: 'maisedu.html' },
    { name: 'A to B', url: 'atob.html' },
    { name: 'All in a Chain', url: 'chain.html' }
];

function getCurrentProjectIndex() {
    const currentPage = window.location.pathname.split('/').pop();
    return projects.findIndex(p => p.url === currentPage);
}

function updateProjectNavigation() {
    const prevButton = document.querySelector('.nav-button.previous');
    const nextButton = document.querySelector('.nav-button.next');
    const currentIndex = getCurrentProjectIndex();
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

const themeToggle = document.getElementById('theme-toggle');
const themeToggleMobile = document.getElementById('theme-toggle-mobile');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
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
    const current = htmlElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    spinFast(btn);
}

themeToggle?.addEventListener('click', () => toggleTheme(themeToggle));
themeToggleMobile?.addEventListener('click', () => toggleTheme(themeToggleMobile));


// ============================================
// FILTER FUNCTIONALITY
// ============================================

const filterLinks = document.querySelectorAll('.filter-link');
const projectCards = document.querySelectorAll('.project-card');
const projectsGrid = document.getElementById('projects-grid');

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
                if (categories.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
    });
});


// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


// ============================================
// IMAGE LOADING ANIMATION
// ============================================

projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.5s ease';
    const img = card.querySelector('.project-image');
    if (img) {
        img.addEventListener('load', () => { card.style.opacity = '1'; });
    }
});

window.addEventListener('load', () => {
    projectCards.forEach(card => {
        const img = card.querySelector('.project-image');
        if (img && img.complete) card.style.opacity = '1';
    });
});


// ============================================
// PHOTO STRIP NAVIGATION (about page)
// ============================================

const photoStrip = document.getElementById('photo-strip');
const stripPrev  = document.getElementById('strip-prev');
const stripNext  = document.getElementById('strip-next');

if (photoStrip && stripPrev && stripNext) {
    // Scroll by the width of one item
    function getScrollAmount() {
        const firstItem = photoStrip.querySelector('.photo-strip-item');
        return firstItem ? firstItem.offsetWidth : photoStrip.offsetWidth * 0.72;
    }

    stripPrev.addEventListener('click', () => {
        photoStrip.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    stripNext.addEventListener('click', () => {
        photoStrip.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    // Show/hide arrows based on scroll position
    function updateArrowVisibility() {
        const atStart = photoStrip.scrollLeft <= 4;
        const atEnd   = photoStrip.scrollLeft + photoStrip.offsetWidth >= photoStrip.scrollWidth - 4;
        stripPrev.style.opacity = atStart ? '0.25' : '0.85';
        stripNext.style.opacity = atEnd   ? '0.25' : '0.85';
    }

    photoStrip.addEventListener('scroll', updateArrowVisibility, { passive: true });
    // Run once on load
    updateArrowVisibility();
}


// ============================================
// BACK TO TOP
// ============================================

const bttBtn = document.createElement('button');
bttBtn.className = 'back-to-top';
bttBtn.setAttribute('aria-label', 'Back to top');
bttBtn.innerHTML = '<span class="btt-arrow">↑</span><span>back to top</span>';
document.body.appendChild(bttBtn);

const bttFooter = document.querySelector('footer');
const BTT_DEFAULT_BOTTOM = 36;
const BTT_GAP = 16;

function updateBttPosition() {
    if (window.scrollY > 400) {
        bttBtn.classList.add('visible');
    } else {
        bttBtn.classList.remove('visible');
    }

    if (bttFooter) {
        const footerTop = bttFooter.getBoundingClientRect().top;
        const viewportH  = window.innerHeight;
        const overlap    = viewportH - footerTop;

        if (overlap > 0) {
            bttBtn.style.bottom = (overlap + BTT_GAP) + 'px';
        } else {
            bttBtn.style.bottom = BTT_DEFAULT_BOTTOM + 'px';
        }
    }
}

window.addEventListener('scroll', updateBttPosition, { passive: true });
window.addEventListener('resize', updateBttPosition, { passive: true });
updateBttPosition();

bttBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ============================================
// CUSTOM CURSOR
// ============================================

const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.innerHTML = '<div class="custom-cursor-inner">view project</div>';
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
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Project card hover
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const cursorInner = cursor.querySelector('.custom-cursor-inner');

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (card.classList.contains('coming-soon-card')) {
                cursorInner.textContent = 'coming soon';
                cursor.classList.add('hover-coming-soon');
            } else {
                cursorInner.textContent = 'view project';
                cursor.classList.add('hover-project');
            }
        });
        card.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-project', 'hover-coming-soon');
        });
    });
}

// Link hover
document.querySelectorAll('a, button').forEach(el => {
    if (el.classList.contains('project-card')) return;
    el.addEventListener('mouseenter', () => cursor.classList.add('hover-link'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover-link'));
});

document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });