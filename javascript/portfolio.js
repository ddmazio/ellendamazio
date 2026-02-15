// ============================================
// PROJECT NAVIGATION FUNCTIONALITY
// ============================================

// Define the order of projects
const projects = [
    { name: 'Ting', url: 'ting.html' },
    { name: 'A to B', url: 'atob.html' },
    { name: 'Maisedu', url: 'maisedu.html' },
    { name: 'All in a Chain', url: 'chain.html' },
    { name: 'Alice in Wonderland', url: 'alice.html' },
    { name: 'Azucrinação', url: 'azucrinacao.html' }
];

// Get current project from URL
function getCurrentProjectIndex() {
    const currentPage = window.location.pathname.split('/').pop();
    return projects.findIndex(project => project.url === currentPage);
}

// Get previous project (with loop)
function getPreviousProject() {
    const currentIndex = getCurrentProjectIndex();
    if (currentIndex === -1) return null;
    
    // If at first project, go to last project
    if (currentIndex === 0) {
        return projects[projects.length - 1];
    }
    
    return projects[currentIndex - 1];
}

// Get next project (with loop)
function getNextProject() {
    const currentIndex = getCurrentProjectIndex();
    if (currentIndex === -1) return null;
    
    // If at last project, go to first project
    if (currentIndex === projects.length - 1) {
        return projects[0];
    }
    
    return projects[currentIndex + 1];
}

// Update navigation buttons
function updateProjectNavigation() {
    const prevButton = document.querySelector('.nav-button.previous');
    const nextButton = document.querySelector('.nav-button.next');
    
    const prevProject = getPreviousProject();
    const nextProject = getNextProject();
    
    if (prevButton && prevProject) {
        prevButton.href = prevProject.url;
        prevButton.style.display = 'inline-flex';
    } else if (prevButton) {
        prevButton.style.display = 'none';
    }
    
    if (nextButton && nextProject) {
        nextButton.href = nextProject.url;
        nextButton.style.display = 'inline-flex';
    } else if (nextButton) {
        nextButton.style.display = 'none';
    }
}

// Initialize navigation on page load
if (document.querySelector('.project-navigation')) {
    updateProjectNavigation();
}


// ============================================
// THEME TOGGLE FUNCTIONALITY
// ============================================

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle?.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🐝' : '🦉';
    }
}


// ============================================
// HOVER EMOJI FUNCTIONALITY
// ============================================

const hoverElements = document.querySelectorAll('[data-emoji]');

hoverElements.forEach(element => {
    const emoji = element.getAttribute('data-emoji');
    const originalText = element.textContent;
    
    element.addEventListener('mouseenter', () => {
        element.textContent = originalText + ' ' + emoji;
    });
    
    element.addEventListener('mouseleave', () => {
        element.textContent = originalText;
    });
});


// ============================================
// FILTER FUNCTIONALITY
// ============================================

const filterLinks = document.querySelectorAll('.filter-link');
const projectCards = document.querySelectorAll('.project-card');

filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        filterLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Get filter value
        const filterValue = link.getAttribute('data-filter');
        
        // Filter projects
        projectCards.forEach(card => {
            if (filterValue === 'all') {
                card.classList.remove('hidden');
            } else {
                const categories = card.getAttribute('data-category').split(' ');
                if (categories.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    });
});


// ============================================
// SMOOTH SCROLL BEHAVIOR
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// ============================================
// IMAGE LOADING ANIMATION
// ============================================

projectCards.forEach(card => {
    const img = card.querySelector('.project-image');
    if (img) {
        img.addEventListener('load', () => {
            card.style.opacity = '1';
        });
    }
});

// Initialize cards opacity
projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.5s ease, transform 0.3s ease, box-shadow 0.3s ease';
});

// Trigger load event for cached images
window.addEventListener('load', () => {
    projectCards.forEach(card => {
        const img = card.querySelector('.project-image');
        if (img && img.complete) {
            card.style.opacity = '1';
        }
    });
});


// ============================================
// CUSTOM CURSOR FUNCTIONALITY
// ============================================

// Create custom cursor element
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.innerHTML = '<div class="custom-cursor-inner">view project</div>';
document.body.appendChild(cursor);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Update mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor follow animation
function animateCursor() {
    const speed = 0.15;
    
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Handle project card hover (only on index page)
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const projectCardsForCursor = document.querySelectorAll('.project-card');
    
    projectCardsForCursor.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cursor.classList.add('hover-project');
        });
        
        card.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-project');
        });
    });
}

// Handle link hover (all pages)
const links = document.querySelectorAll('a, button, .nav-link, .filter-link');

links.forEach(link => {
    // Skip project cards as they have special hover
    if (link.classList.contains('project-card')) return;
    
    link.addEventListener('mouseenter', () => {
        cursor.classList.add('hover-link');
    });
    
    link.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover-link');
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});