// Backend API Connection
const API_URL = 'http://127.0.0.1:5000';

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

// Start the typewriter effect
typeWriter();

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

        courseCard.innerHTML = `
            <div class="course-icon">${course.icon}</div>
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <div class="course-tags">
                <span class="tag ${course.tagClass}">${course.tag}</span>
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
        <div class="course-icon">➕</div>
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
            window.location.href = `course.html?id=${courseId}`;
        });
    });

    // Submit idea button
    const submitBtn = document.querySelector('.btn-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent card click if inside a card (though here it's separate)
            const idea = prompt('What technology would you like to learn?');
            if (idea && idea.trim() !== '') {
                alert('Thank you! We\'ve noted your request for: ' + idea + '\n\nWe\'ll consider adding this to our course offerings!');
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
    let activeAIFetch = null; // To track and abort ongoing fetches

    const askAI = async (query) => {
        // Abort previous fetch if still running
        if (activeAIFetch) {
            activeAIFetch.abort();
        }
        activeAIFetch = new AbortController();
        const signal = activeAIFetch.signal;

        resultsPanel.style.display = 'flex';
        resultsPanel.innerHTML = `
            <div class="ai-loading" style="padding: 20px; text-align: center; color: #a5b4fc;">
                <span style="display:inline-block; animation: pulse 1.5s infinite;">✨ AI is thinking about "${query}"...</span>
            </div>
        `;
        
        try {
            const res = await fetch(`${API_URL}/api/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query }),
                signal
            });
            
            const data = await res.json();
            
            if (res.ok && data.answer) {
                const formattedAnswer = data.answer
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                resultsPanel.innerHTML = `
                    <div class="ai-answer-box" style="padding: 15px; margin: 10px; background: rgba(100, 244, 172, 0.1); border: 1px solid rgba(100, 244, 172, 0.3); border-radius: 10px; color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; max-height: 300px; overflow-y: auto;">
                        <span style="display:block; margin-bottom: 8px; font-weight: bold; color: white;">🤖 AI Answer:</span>
                        ${formattedAnswer}
                    </div>
                `;
            } else {
                resultsPanel.innerHTML = `<div class="no-results" style="padding: 15px; color: #ef4444;">❌ AI could not answer right now: ${data.error || 'Unknown error'}</div>`;
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('AI request aborted');
            } else {
                console.error(err);
                resultsPanel.innerHTML = '<div class="no-results" style="padding: 15px; color: #ef4444;">❌ Connection error. Backend might be down.</div>';
            }
        } finally {
            if (activeAIFetch && activeAIFetch.signal === signal) {
                activeAIFetch = null;
            }
        }
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
            if (activeAIFetch) activeAIFetch.abort();
            return;
        }

        const courses = Object.values(coursesData);
        const filtered = courses.filter(course => {
            return course.name.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.tag.toLowerCase().includes(query);
        });

        if (filtered.length > 0) {
            if (activeAIFetch) activeAIFetch.abort();
            renderSearchResults(filtered, query);
        } else {
            // No courses found, display a loading/thinking hint and auto-trigger AI after delay
            resultsPanel.innerHTML = '';
            const autoAIHint = document.createElement('div');
            autoAIHint.className = 'result-item';
            autoAIHint.style.background = 'rgba(100, 244, 172, 0.1)';
            autoAIHint.style.padding = '12px 15px';
            autoAIHint.innerHTML = `
                <span class="result-icon">✨</span>
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
            <span class="result-icon">✨</span>
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
                    window.location.href = `course.html?id=${course.id}`;
                });
                resultsPanel.appendChild(item);
            });
        }

        resultsPanel.style.display = 'flex';
    }
}

// Initial setup on load
console.log('➜ Setting up listeners...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('➜ DOMContentLoaded fired');
    // Only load all courses if we are on a page with the grid (index.html)
    if (document.querySelector('.courses-grid')) {
        loadCourses();
    }
    initAISearch();
});

// Also call immediately in case DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (document.querySelector('.courses-grid')) {
        console.log('➜ DOM already ready, calling loadCourses()');
        loadCourses();
    }
}

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
