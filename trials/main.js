// Global variables and shared functions
let blogPosts = [];
let currentPost = null;

// Initialize the website
window.addEventListener('load', function () {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
    }, 2500);

    setupScrollAnimations();
    setupSmoothScrolling();
    initializeBlog();

    // Create particles after loading
    setTimeout(createParticles, 3000);
    setTimeout(addMorphingShapes, 4000);
});

// Initialize Blog Data
function initializeBlog() {
    // Sample blog posts
    blogPosts = [
        {
            id: 1,
            title: "Getting Started with Modern JavaScript",
            content: "JavaScript has evolved tremendously over the years. In this post, I'll cover the essential ES6+ features that every developer should know, including arrow functions, destructuring, async/await, and more. These features make JavaScript code more readable, maintainable, and powerful.\n\nLet's start with arrow functions - they provide a more concise way to write functions and automatically bind the 'this' context. This is particularly useful in event handlers and callback functions.\n\nNext, we'll explore destructuring assignment, which allows you to extract values from arrays or objects into distinct variables. This feature greatly simplifies variable assignment and makes code more readable.\n\nAsync/await is another game-changer, making asynchronous code look and behave more like synchronous code. It's built on top of promises and provides a cleaner alternative to promise chains.",
            date: new Date().toLocaleDateString(),
            featured: true,
            likes: 15,
            comments: [
                {
                    author: "Sarah Chen",
                    text: "Great explanation of modern JavaScript features! Really helped me understand async/await better.",
                    date: new Date().toLocaleDateString()
                },
                {
                    author: "Mike Johnson",
                    text: "The arrow function examples were particularly helpful. Thanks for sharing!",
                    date: new Date().toLocaleDateString()
                }
            ]
        },
        {
            id: 2,
            title: "Building Responsive Web Applications",
            content: "Creating responsive designs is crucial in today's multi-device world. Here are the best practices I've learned over the years of web development.\n\nFirst, always start with a mobile-first approach. This means designing for the smallest screen first, then progressively enhancing for larger screens. This approach ensures better performance and user experience across all devices.\n\nCSS Grid and Flexbox are your best friends for creating flexible layouts. Grid is excellent for two-dimensional layouts, while Flexbox excels at one-dimensional arrangements. Understanding when to use each is key to efficient responsive design.\n\nDon't forget about responsive images! Use the srcset attribute and picture element to serve appropriate image sizes for different devices. This can significantly improve page load times, especially on mobile devices.",
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            featured: false,
            likes: 8,
            comments: []
        },
        {
            id: 3,
            title: "The Future of Web Development",
            content: "Web development is constantly evolving. Let's explore the trends that will shape our industry in the coming years.\n\nWebAssembly (WASM) is gaining traction, allowing developers to run high-performance applications in the browser using languages like C++, Rust, and Go. This opens up new possibilities for web applications that were previously limited to native apps.\n\nProgressive Web Apps (PWAs) continue to blur the line between web and native applications. With features like offline functionality, push notifications, and app-like interfaces, PWAs offer native app experiences through web technologies.\n\nAI and machine learning are becoming more accessible to web developers through APIs and JavaScript libraries. This trend will likely accelerate, bringing intelligent features to more web applications.",
            date: new Date(Date.now() - 172800000).toLocaleDateString(),
            featured: true,
            likes: 23,
            comments: [
                {
                    author: "Alex Rodriguez",
                    text: "Excited about WebAssembly! Can't wait to see more use cases.",
                    date: new Date().toLocaleDateString()
                }
            ]
        }
    ];
}

// Scroll animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Animate skill items with delay
    document.querySelectorAll('.skill-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });

    // Animate portfolio items with delay
    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });
}

// Smooth scrolling for navigation
function setupSmoothScrolling() {
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
}

// Create floating particles
function createParticles() {
    const particles = document.getElementById('particles');
    if (!particles) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particles.appendChild(particle);
    }
}

// Add morphing shapes to sections
function addMorphingShapes() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        for (let i = 0; i < 2; i++) {
            const shape = document.createElement('div');
            shape.className = 'morph-shape';
            shape.style.left = Math.random() * 80 + '%';
            shape.style.top = Math.random() * 80 + '%';
            shape.style.animationDelay = i * 2 + 's';
            section.style.position = 'relative';
            section.appendChild(shape);
        }
    });
}

// Modal functions
function openCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('createPostForm');
        if (form) form.reset();
    }
}

function openPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    currentPost = post;
    const modal = document.getElementById('viewPostModal');
    if (!modal) return;

    document.getElementById('viewPostTitle').textContent = post.title;
    document.getElementById('viewPostDate').textContent = post.date;
    document.getElementById('viewPostLikes').textContent = post.likes;
    document.getElementById('viewPostComments').textContent = post.comments.length;
    document.getElementById('viewPostContent').innerHTML = post.content.replace(/\n/g, '<br>');

    renderComments(post.comments);
    modal.style.display = 'block';
}

function closeViewPostModal() {
    const modal = document.getElementById('viewPostModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentPost = null;
}

// Like functionality
function toggleLike() {
    if (!currentPost) return;

    currentPost.likes++;
    const likesElement = document.getElementById('viewPostLikes');
    if (likesElement) {
        likesElement.textContent = currentPost.likes;
    }
}

// Comment functionality
function addComment() {
    if (!currentPost) return;

    const authorInput = document.getElementById('commentAuthor');
    const textInput = document.getElementById('commentText');

    if (!authorInput || !textInput) return;

    const author = authorInput.value;
    const text = textInput.value;

    if (!author || !text) return;

    const comment = {
        author,
        text,
        date: new Date().toLocaleDateString()
    };

    currentPost.comments.push(comment);
    renderComments(currentPost.comments);

    const commentsCountElement = document.getElementById('viewPostComments');
    if (commentsCountElement) {
        commentsCountElement.textContent = currentPost.comments.length;
    }

    // Clear form
    authorInput.value = '';
    textInput.value = '';
}

function renderComments(comments) {
    const container = document.getElementById('commentsContainer');
    if (!container) return;

    container.innerHTML = '';

    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-author">
                ${comment.author}
                <span class="comment-date">${comment.date}</span>
            </div>
            <p>${comment.text}</p>
        `;
        container.appendChild(commentDiv);
    });
}

// Blog filter functions
function showAllPosts() {
    if (typeof renderBlogPosts === 'function') {
        renderBlogPosts();
    }
}

function showFeaturedPosts() {
    const featured = blogPosts.filter(post => post.featured);
    if (typeof renderBlogPosts === 'function') {
        renderBlogPosts(featured);
    }
}

function showLatestPosts() {
    const latest = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    if (typeof renderBlogPosts === 'function') {
        renderBlogPosts(latest);
    }
}

// Close modals when clicking outside
window.addEventListener('click', function (event) {
    const createModal = document.getElementById('createPostModal');
    const viewModal = document.getElementById('viewPostModal');

    if (event.target === createModal) {
        closeCreatePostModal();
    }
    if (event.target === viewModal) {
        closeViewPostModal();
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add floating animation to CTA buttons
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cta-button, .blog-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.style.animation = 'float 2s ease-in-out infinite';
        });

        btn.addEventListener('mouseleave', function () {
            this.style.animation = '';
        });
    });
});

// Typewriter effect for hero subtitle
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typewriter effect after loading
setTimeout(() => {
    const heroSubtitle = document.querySelector('.hero-content p');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        typeWriter(heroSubtitle, originalText, 100);
    }
}, 4000);

// Add dynamic greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle && !heroTitle.textContent.includes('Your Name')) {
        heroTitle.innerHTML = `${greeting},<br>I'm Your Name`;
    }
}

setTimeout(updateGreeting, 5000);