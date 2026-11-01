// Backend API Connection
// Automatically use port 5000 when running locally, or relative URLs when deployed
const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:')
    ? 'http://localhost:5000'
    : '';

function onDOMReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

// Give same-site page navigation a short directional transition.
let pageNavigationStarted = false;
function navigateWithTransition(destination) {
    const nextUrl = new URL(destination, window.location.href);
    if (nextUrl.origin !== window.location.origin || nextUrl.href === window.location.href) {
        window.location.href = nextUrl.href;
        return;
    }
    if (pageNavigationStarted) return;
    pageNavigationStarted = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !document.body) {
        window.location.href = nextUrl.href;
        return;
    }
    sessionStorage.setItem('page-transition-destination', `${nextUrl.pathname}${nextUrl.search}`);
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-exiting');
    window.setTimeout(() => { window.location.href = nextUrl.href; }, 260);
}

function initPageTransitions() {
    const destination = sessionStorage.getItem('page-transition-destination');
    const currentPage = `${window.location.pathname}${window.location.search}`;
    if (destination === currentPage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('page-entering');
        window.setTimeout(() => document.body.classList.remove('page-entering'), 500);
    }
    sessionStorage.removeItem('page-transition-destination');

    document.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href]');
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const nextUrl = new URL(link.href, window.location.href);
        if (nextUrl.origin !== window.location.origin || nextUrl.protocol === 'javascript:') return;
        if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) return;
        event.preventDefault();
        navigateWithTransition(nextUrl.href);
    });
}

onDOMReady(initPageTransitions);

// Theme Initialization
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
} else {
    document.documentElement.setAttribute('data-theme', 'dark');
}

onDOMReady(() => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        // Set initial icon
        themeToggleBtn.innerHTML = document.documentElement.getAttribute('data-theme') === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = 'dark';
            
            if (currentTheme !== 'light') {
                newTheme = 'light';
            }
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            themeToggleBtn.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    // Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});


// Typewriter effect - letters type out and delete one by one
const phrases = [
    'LEARN PROGRAMMING',
    'MASTER NEW SKILLS',
    'SHAPE YOUR FUTURE',
    'EMPOWER EDUCATION',
    'UNLOCK POTENTIAL'
];

let phraseIndex = 0;
let charIndex = 0;
const animatedText = document.getElementById('animatedText');
let isDeleting = false;
let typingSpeed = 80;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        // Delete character by character
        charIndex--;
        if (charIndex < 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            charIndex = 0;
            typingSpeed = 80;
            setTimeout(typeWriter, 500);
            return;
        }
        typingSpeed = 40;
    } else {
        // Type character by character
        charIndex++;
        if (charIndex > currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 80;
            setTimeout(typeWriter, 1500);
            return;
        }
        typingSpeed = 80;
    }

    if (animatedText) {
        // Use non-breaking space when empty to prevent total height loss
        animatedText.textContent = currentPhrase.substring(0, charIndex) || '\u00A0';
    }

    setTimeout(typeWriter, typingSpeed);
}

// Keep the typewriter effect only on pages that still provide its target.
if (animatedText) typeWriter();

// Smooth scrolling for navigation links
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

// Add scroll effect to navbar with throttling
let lastKnownScrollPosition = 0;
let ticking = false;

window.addEventListener('scroll', () => {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (lastKnownScrollPosition > 50) {
                    navbar.classList.add('navbar-scrolled');
                } else {
                    navbar.classList.remove('navbar-scrolled');
                }
            }
            ticking = false;
        });

        ticking = true;
    }
});

// Global variable to store course data
let coursesData = {};

// Load Courses - Initialize with hardcoded data as fallback
function initializeCoursesData() {
    // Hardcoded courses from courses.json
    const coursesArray = [
        {
            id: 1,
            name: "Java",
            icon: "☕",
            tag: "Java Masterclass",
            tagClass: "oops",
            description: "The most comprehensive Java course ever. 20+ sections with nested sub-topics, deep dives, and GFG-level detail."
        },
        {
            id: 2,
            name: "Python",
            icon: "🐍",
            tag: "Scripting",
            tagClass: "script",
            description: "Learn the syntax that powers AI. Simplicity, readability, and powerful standard libraries."
        },
        {
            id: 4,
            name: "C Language",
            icon: "⌨️",
            tag: "Foundation",
            tagClass: "foundation",
            description: "The mother of all languages. Master memory management, pointers, and data structures."
        },
        {
            id: 6,
            name: "Logical Thinking",
            icon: "🧠",
            tag: "Soft Skill",
            tagClass: "foundation",
            description: "Understand the art of reasoning. Learn how to break down complex problems into solvable steps."
        },
        {
            id: 7,
            name: "C++ Programming",
            icon: "🚀",
            tag: "Advanced OOP",
            tagClass: "oops",
            description: "Master Object-Oriented Programming and high-performance applications with C++."
        }
    ];
    
    // Convert to object format
    coursesData = coursesArray.reduce((acc, course) => {
        acc[course.id] = course;
        return acc;
    }, {});
    
    console.log('✓ Courses data initialized:', Object.keys(coursesData).length, 'courses');
    return coursesArray;
}

// Initialize courses data immediately
initializeCoursesData();

// Load Courses from Backend API
async function loadCourses() {
    console.log('➜ Starting loadCourses()...');
    try {
        console.log('➜ Fetching from: courses.json');
        const response = await fetch('./courses.json');
        console.log('➜ Response status:', response.status);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('➜ Data received:', data);

        const courses = Array.isArray(data) ? data : data.courses;
        console.log('➜ Courses to render:', courses ? courses.length : 0);

        // Convert array to object for easy lookup by ID
        coursesData = courses.reduce((acc, course) => {
            acc[course.id] = course;
            return acc;
        }, {});

        console.log('➜ coursesData populated:', Object.keys(coursesData).length, 'courses');
        renderCourses(courses);
    } catch (error) {
        console.error('✗ Error in loadCourses:', error);
        console.log('Using fallback courses data...');
        const courses = Object.values(coursesData);
        renderCourses(courses);
    }
}

// Render Courses to DOM
function renderCourses(courses) {
    const coursesGrid = document.querySelector('.courses-grid');
    if (!coursesGrid) return;

    // Clear existing content
    coursesGrid.innerHTML = '';

    // Generate HTML for each course
    courses.forEach((course, index) => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card clickable-course scroll-reveal';
        // Add a slight stagger delay based on index
        courseCard.style.animationDelay = `${index * 0.15}s`;
        courseCard.dataset.courseId = course.id;

        const bgImg = course.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        courseCard.innerHTML = `
            <div class="course-card-bg" style="background-image: url('${bgImg}');"></div>
            <div class="course-card-content">
                <div class="course-card-top"><span class="course-label">LEARNING PATH</span><span class="course-card-icon">${course.icon || '<i class="fas fa-code"></i>'}</span></div>
                <div class="course-card-copy"><span class="course-tag">${course.tag || 'Start learning'}</span><h3>${course.name}</h3>
                <p>${course.description}</p></div>
                <div class="course-card-footer"><span class="course-open-label">Explore course</span><button class="btn-read" aria-label="Explore ${course.name}"><i class="fas fa-arrow-right"></i></button></div>
            </div>
        `;

        coursesGrid.appendChild(courseCard);

        // Add observer for animation if it exists
        if (typeof observer !== 'undefined') {
            observer.observe(courseCard);
        }
    });

    // Append the "Request a Track" card
    const requestCard = document.createElement('div');
    requestCard.className = 'course-card request-card scroll-reveal';
    requestCard.style.animationDelay = `${courses.length * 0.15}s`;
    requestCard.innerHTML = `
        <div class="course-icon"><i class="fas fa-plus"></i></div>
        <h3>Request a Track</h3>
        <p>Don't see your technology? Tell us what you want to learn next.</p>
        <button class="btn-submit">Submit Idea</button>
    `;
    coursesGrid.appendChild(requestCard);

    if (typeof observer !== 'undefined') {
        observer.observe(requestCard);
    }

    // Re-attach event listeners for new elements
    attachCourseEventListeners();
}

// Attach Event Listeners
function attachCourseEventListeners() {
    // Clickable course cards
    document.querySelectorAll('.clickable-course').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            const courseId = this.dataset.courseId;
            console.log('Clicked course:', courseId);
            // Redirect to new page instead of modal
            navigateWithTransition(`course.html?id=${courseId}`);
        });
    });

    // Submit idea button
    const submitBtn = document.querySelector('.btn-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent card click if inside a card
            const modal = document.getElementById('idea-modal');
            const responseMsg = document.getElementById('idea-response-msg');
            const ideaForm = document.getElementById('idea-form');
            if (modal) {
                modal.style.display = 'block';
                if (responseMsg) responseMsg.style.display = 'none';
                if (ideaForm) ideaForm.reset();
            }
        });
    }
}

// AI Smart Search Logic
function initAISearch() {
    const searchInput = document.getElementById('ai-search');
    const resultsPanel = document.getElementById('search-results');

    if (!searchInput || !resultsPanel) return;

    let debounceTimer;

    const askAI = (query) => {
        navigateWithTransition(`ai-search.html?q=${encodeURIComponent(query)}`);
    };

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query.length >= 2) {
                clearTimeout(debounceTimer);
                askAI(query);
            }
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        clearTimeout(debounceTimer);

        if (query.length < 2) {
            resultsPanel.style.display = 'none';
            return;
        }

        const courses = Object.values(coursesData);
        const filtered = courses.filter(course => {
            return course.name.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.tag.toLowerCase().includes(query);
        });

        if (filtered.length > 0) {
            renderSearchResults(filtered, query);
        } else {
            // No courses found, display a loading/thinking hint and auto-trigger AI after delay
            resultsPanel.innerHTML = '';
            const autoAIHint = document.createElement('div');
            autoAIHint.className = 'result-item';
            autoAIHint.style.background = 'rgba(100, 244, 172, 0.1)';
            autoAIHint.style.padding = '12px 15px';
            autoAIHint.innerHTML = `
                <span class="result-icon"><i class="fas fa-wand-magic-sparkles" style="color: #64f4ac;"></i></span>
                <div class="result-info" style="display:flex; flex-direction:column;">
                    <span class="result-name" style="color:#64f4ac; font-weight:600; font-size:0.9rem;">No courses found for "${query}"</span>
                    <span class="result-desc" style="font-size:0.75rem; color:#94a3b8;">Asking AI automatically...</span>
                </div>
            `;
            resultsPanel.appendChild(autoAIHint);
            resultsPanel.style.display = 'flex';

            debounceTimer = setTimeout(() => {
                askAI(query);
            }, 1000); // 1-second delay before asking AI
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsPanel.contains(e.target)) {
            resultsPanel.style.display = 'none';
        }
    });

    // Prevent clicking inside results panel from closing it
    resultsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    function renderSearchResults(results, currentQuery) {
        resultsPanel.innerHTML = '';

        // Add "Press Enter" hint item at the top
        const enterHint = document.createElement('div');
        enterHint.className = 'result-item';
        enterHint.style.background = 'rgba(100, 244, 172, 0.1)';
        enterHint.style.borderBottom = '1px solid rgba(100, 244, 172, 0.2)';
        enterHint.style.padding = '12px 15px';
        enterHint.style.cursor = 'pointer';
        enterHint.innerHTML = `
            <span class="result-icon"><i class="fas fa-wand-magic-sparkles" style="color: #64f4ac;"></i></span>
            <div class="result-info" style="display:flex; flex-direction:column;">
                <span class="result-name" style="color:#64f4ac; font-weight:600; font-size:0.9rem;">Ask AI about "${currentQuery}"</span>
                <span class="result-desc" style="font-size:0.75rem; color:#94a3b8;">Press <strong>Enter</strong> or click here</span>
            </div>
        `;
        enterHint.addEventListener('click', () => {
             clearTimeout(debounceTimer);
             askAI(currentQuery);
        });
        resultsPanel.appendChild(enterHint);

        if (results.length > 0) {
            results.forEach(course => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.style.padding = '12px 15px';
                item.style.cursor = 'pointer';
                item.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                item.innerHTML = `
                    <span class="result-icon">${course.icon}</span>
                    <div class="result-info" style="display:flex; flex-direction:column;">
                        <span class="result-name" style="color:white; font-weight:600; font-size:0.9rem;">${course.name}</span>
                        <span class="result-desc" style="font-size:0.75rem; color:#94a3b8;">${course.tag} • ${course.description.substring(0, 40)}...</span>
                    </div>
                `;
                item.addEventListener('click', () => {
                    navigateWithTransition(`course.html?id=${course.id}`);
                });
                resultsPanel.appendChild(item);
            });
        }

        resultsPanel.style.display = 'flex';
    }
}

// Initial setup on load
console.log('➜ Setting up listeners...');
onDOMReady(() => {
    console.log('➜ DOM ready (or already ready) fired');
    // Only load all courses if we are on a page with the grid (index.html)
    if (document.querySelector('.courses-grid')) {
        loadCourses();
    }
    initAISearch();
});

// Explore Clubs button
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function () {
        if (this.textContent.includes('Explore')) {
            document.getElementById('clubs').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.replace('scroll-reveal', 'fade-in-up');
            // Wait, if it didn't have scroll-reveal but we want to add fade-in-up
            if (!entry.target.classList.contains('fade-in-up')) {
                entry.target.classList.add('fade-in-up');
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply observer to HTML elements that have scroll-reveal class manually
document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// Replay each home-page panel's reveal every time it enters the viewport.
const pagePanels = document.querySelectorAll('.home-page .scroll-panel');
if ('IntersectionObserver' in window) {
    const pagePanelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    pagePanels.forEach(panel => pagePanelObserver.observe(panel));
} else {
    pagePanels.forEach(panel => panel.classList.add('is-visible'));
}

// Animations are now handled in CSS (.fade-in-up class)

// Function to fetch users from backend
async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Users from backend:', data);
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return null;
    }
}

// Function to add new user
async function addUser(name, email) {
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });
        const data = await response.json();
        console.log('New user added:', data);
        return data;
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

// Function to get user by ID
async function getUserById(id) {
    try {
        const response = await fetch(`${API_URL}/api/users/${id}`);
        const data = await response.json();
        console.log('User by ID:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

console.log('Website loaded successfully!');

// Hamburger Menu Logic
onDOMReady(() => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            navMenu.classList.remove('active');
        }));
    }
});

// Submit Idea Modal Logic
onDOMReady(() => {
    const modal = document.getElementById('idea-modal');
    const submitBtns = document.querySelectorAll('.submit-idea-btn'); 
    const closeBtn = document.querySelector('.close-idea-modal');
    const ideaForm = document.getElementById('idea-form');
    const responseMsg = document.getElementById('idea-response-msg');

    if (!modal) return;

    // Open modal
    submitBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            if (responseMsg) responseMsg.style.display = 'none';
            if (ideaForm) ideaForm.reset();
        });
    });

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close when clicking outside of modal content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission
    if (ideaForm) {
        ideaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('idea-submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const name = document.getElementById('idea-name').value;
            const email = document.getElementById('idea-email').value;
            const idea = document.getElementById('idea-desc').value;

            try {
                const response = await fetch(`${API_URL}/api/submit-idea`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, idea })
                });

                const result = await response.json();
                responseMsg.style.display = 'block';

                if (response.ok) {
                    responseMsg.textContent = result.message || 'Idea submitted successfully!';
                    responseMsg.className = 'success';
                    ideaForm.reset();
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 3000);
                } else {
                    responseMsg.textContent = result.error || 'Failed to submit idea.';
                    responseMsg.className = 'error';
                }
            } catch (err) {
                console.error('Error submitting idea:', err);
                responseMsg.style.display = 'block';
                responseMsg.textContent = 'An error occurred. Please try again later.';
                responseMsg.className = 'error';
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Particle Background Animation (Antigravity Style)
function initParticles() {
    let canvas = document.getElementById('particle-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Antigravity vibrant colors
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8AB4F8', '#F28B82', '#FDE293', '#81C995', '#A142F4', '#24C1E0'];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            // Random angle for radiating outward
            this.angle = Math.random() * Math.PI * 2;
            
            if (initial) {
                // Distribute randomly across the screen initially
                const distance = Math.random() * (Math.max(width, height) / 1.5);
                this.x = width / 2 + Math.cos(this.angle) * distance;
                this.y = height / 2 + Math.sin(this.angle) * distance;
            } else {
                // Spawn near center when resetting
                const distance = Math.random() * 50;
                this.x = width / 2 + Math.cos(this.angle) * distance;
                this.y = height / 2 + Math.sin(this.angle) * distance;
            }
            
            // Speed of outward movement (slow drift)
            this.speed = Math.random() * 0.4 + 0.1;
            
            // Dimensions of the dash
            this.length = Math.random() * 8 + 4;
            this.thickness = Math.random() * 2 + 1;
            
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            
            // If it goes off screen, reset it near the center
            if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
                this.reset(false);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            // Draw a dash pointing outward along its trajectory
            ctx.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.thickness;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        
        // Number of particles relative to screen size
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 7000); 
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    init();
}

onDOMReady(() => {
    initParticles();

    // Hero preview carousel: auto-advance, with dot and swipe controls.
    const preview = document.querySelector('.code-window');
    if (preview) {
        const track = preview.querySelector('.code-track');
        const slides = Array.from(preview.querySelectorAll('.code-slide'));
        const dots = Array.from(preview.querySelectorAll('.code-dot'));
        const fileName = preview.querySelector('.window-file');
        const slideCount = preview.querySelector('.code-slide-count');
        const names = ['your-next-idea.py', 'make-it-real.js', 'your-learning-path.ai'];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let activeSlide = 0;
        let carouselTimer;
        let touchStartX = null;

        const showSlide = (index) => {
            activeSlide = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${activeSlide * 100}%)`;
            dots.forEach((dot, dotIndex) => {
                const isActive = dotIndex === activeSlide;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-pressed', String(isActive));
            });
            if (fileName) fileName.textContent = names[activeSlide];
            if (slideCount) slideCount.innerHTML = `0${activeSlide + 1} <i>/</i> 0${slides.length}`;
            slides.forEach((slide, slideIndex) => {
                slide.setAttribute('aria-hidden', String(slideIndex !== activeSlide));
            });
        };

        const stopCarousel = () => window.clearInterval(carouselTimer);
        const startCarousel = () => {
            stopCarousel();
            if (!reducedMotion && !document.hidden) {
                carouselTimer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
            }
        };

        dots.forEach((dot, index) => dot.addEventListener('click', () => {
            showSlide(index);
            startCarousel();
        }));
        // Keep the preview moving automatically; manual controls remain available.
        preview.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].clientX;
            stopCarousel();
        }, { passive: true });
        preview.addEventListener('touchend', (event) => {
            if (touchStartX !== null) {
                const swipeDistance = event.changedTouches[0].clientX - touchStartX;
                if (Math.abs(swipeDistance) > 45) showSlide(activeSlide + (swipeDistance < 0 ? 1 : -1));
            }
            touchStartX = null;
            startCarousel();
        }, { passive: true });
        document.addEventListener('visibilitychange', startCarousel);
        showSlide(0);
        startCarousel();
    }

    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Prepare Custom AI Course Modal Handler
    const customModal = document.getElementById('custom-course-modal');
    const closeBtn = document.querySelector('.close-custom-course-modal');
    const form = document.getElementById('custom-course-form');
    const input = document.getElementById('custom-course-input');
    const statusBox = document.getElementById('custom-course-status');
    const statusText = document.getElementById('custom-course-status-text');
    const submitBtn = document.getElementById('custom-course-submit-btn');

    document.querySelectorAll('.open-custom-course-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (customModal) {
                customModal.style.display = 'block';
                if (input) input.focus();
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (customModal) customModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === customModal) {
            customModal.style.display = 'none';
        }
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const topicPrompt = input.value.trim();
            if (!topicPrompt) return;

            const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            const safePrompt = escapeHtml(topicPrompt);

            if (statusBox) statusBox.style.display = 'block';
            if (statusText) statusText.innerHTML = `<i class="fas fa-robot fa-spin" style="margin-right: 8px;"></i> AI is designing your curriculum for "${safePrompt}"...`;
            if (submitBtn) submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/api/generate-course`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: topicPrompt })
                });

                if (!response.ok) {
                    throw new Error(`Server status ${response.status}`);
                }

                const data = await response.json();
                if (data.course && data.course.id) {
                    localStorage.setItem(`custom_course_${data.course.id}`, JSON.stringify(data.course));
                    if (statusText) statusText.innerHTML = `✨ Course created successfully! Redirecting...`;
                    setTimeout(() => {
                        navigateWithTransition(`course.html?id=${data.course.id}`);
                    }, 500);
                } else {
                    throw new Error('Invalid course format returned');
                }
            } catch (err) {
                console.error('Course generation failed:', err);
                if (statusText) statusText.innerHTML = `<span style="color: #f87171;">⚠️ Failed to generate course. Please try again.</span>`;
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
