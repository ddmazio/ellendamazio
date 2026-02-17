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
    }

    hamburger.addEventListener('click', () => {
        navOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
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
const themeIcon = document.querySelector('.theme-icon');
const themeIconMobile = document.querySelector('.theme-icon-mobile');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function toggleTheme() {
    const current = htmlElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

themeToggle?.addEventListener('click', toggleTheme);
themeToggleMobile?.addEventListener('click', toggleTheme);

function updateThemeIcon(theme) {
    const emoji = theme === 'light' ? '🦉' : '🐝';
    if (themeIcon) themeIcon.textContent = emoji;
    if (themeIconMobile) themeIconMobile.textContent = emoji;
}


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