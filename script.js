// Global variables

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0); // Force always starts at top


let blogPosts = [];
let currentPost = null;
let portfolioItems = [
    {
        title: "E-commerce Website",
        description: "Full-stack e-commerce solution with payment integration",
        image: "https://via.placeholder.com/400x200/667eea/ffffff?text=E-commerce+Site",
        tech: ["HTML", "CSS", "JavaScript", "Node.js"]
    },
    {
        title: "Task Management App",
        description: "Responsive task manager with drag-and-drop functionality",
        image: "https://via.placeholder.com/400x200/764ba2/ffffff?text=Task+Manager",
        tech: ["JavaScript", "Local Storage", "CSS Grid"]
    },
    {
        title: "Weather Dashboard",
        description: "Real-time weather app with location-based forecasts",
        image: "https://via.placeholder.com/400x200/f093fb/ffffff?text=Weather+App",
        tech: ["API Integration", "JavaScript", "Responsive Design"]
    }
];

// Initialize the website
window.addEventListener('load', function () {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
    }, 2500);

    initializePortfolio();
    initializeBlog();
    setupScrollAnimations();
    setupSmoothScrolling();
});

// Initialize Portfolio
function initializePortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    portfolioItems.forEach((item, index) => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item animate-on-scroll';
        portfolioItem.style.animationDelay = `${index * 0.2}s`;

        portfolioItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <div class="portfolio-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <div style="margin-top: 1rem;">
                            ${item.tech.map(tech => `<span style="background: var(--gradient); color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; margin-right: 0.5rem; display: inline-block; margin-bottom: 0.5rem;">${tech}</span>`).join('')}
                        </div>
                    </div>
                `;
        portfolioGrid.appendChild(portfolioItem);
    });
}

// Initialize Blog
function initializeBlog() {
    // Sample blog posts
    blogPosts = [
        {
            id: 1,
            title: "Getting Started with Modern JavaScript",
            content: "JavaScript has evolved tremendously over the years. In this post, I'll cover the essential ES6+ features that every developer should know...",
            date: new Date().toLocaleDateString(),
            featured: true,
            likes: 15,
            comments: []
        },
        {
            id: 2,
            title: "Building Responsive Web Applications",
            content: "Creating responsive designs is crucial in today's multi-device world. Here are the best practices I've learned...",
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            featured: false,
            likes: 8,
            comments: []
        },
        {
            id: 3,
            title: "The Future of Web Development",
            content: "Web development is constantly evolving. Let's explore the trends that will shape our industry in the coming years...",
            date: new Date(Date.now() - 172800000).toLocaleDateString(),
            featured: true,
            likes: 23,
            comments: []
        }
    ];
    renderBlogPosts();
}

// Render blog posts
function renderBlogPosts(posts = blogPosts) {
    const blogGrid = document.getElementById('blogGrid');
    blogGrid.innerHTML = '';

    posts.forEach((post, index) => {
        const blogPost = document.createElement('div');
        blogPost.className = 'blog-post animate-on-scroll';
        blogPost.style.animationDelay = `${index * 0.1}s`;

        blogPost.innerHTML = `
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span>${post.date}</span>
                            <div class="blog-stats">
                                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                                <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
                            </div>
                        </div>
                        <h3>${post.title}</h3>
                        <p>${post.content.substring(0, 150)}...</p>
                        ${post.featured ? '<span style="background: var(--gradient-accent); color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">Featured</span>' : ''}
                        <div style="margin-top: 1rem;">
                            <button class="blog-btn" onclick="openPost(${post.id})">Read More</button>
                        </div>
                    </div>
                `;
        blogGrid.appendChild(blogPost);
    });

    // Re-trigger animations
    setupScrollAnimations();
}

// Blog filter functions
function showAllPosts() {
    renderBlogPosts();
}

function showFeaturedPosts() {
    const featured = blogPosts.filter(post => post.featured);
    renderBlogPosts(featured);
}

function showLatestPosts() {
    const latest = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    renderBlogPosts(latest);
}

// Modal functions
function openCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'block';
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'none';
    document.getElementById('createPostForm').reset();
}

function openPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    currentPost = post;
    document.getElementById('viewPostTitle').textContent = post.title;
    document.getElementById('viewPostDate').textContent = post.date;
    document.getElementById('viewPostLikes').textContent = post.likes;
    document.getElementById('viewPostComments').textContent = post.comments.length;
    document.getElementById('viewPostContent').innerHTML = post.content.replace(/\n/g, '<br>');

    renderComments(post.comments);
    document.getElementById('viewPostModal').style.display = 'block';
}

function closeViewPostModal() {
    document.getElementById('viewPostModal').style.display = 'none';
    currentPost = null;
}

// Create new post
document.getElementById('createPostForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const featured = document.getElementById('postFeatured').checked;

    const newPost = {
        id: blogPosts.length + 1,
        title,
        content,
        date: new Date().toLocaleDateString(),
        featured,
        likes: 0,
        comments: []
    };

    blogPosts.unshift(newPost);
    renderBlogPosts();
    closeCreatePostModal();
});

// Like functionality
function toggleLike() {
    if (!currentPost) return;

    currentPost.likes++;
    document.getElementById('viewPostLikes').textContent = currentPost.likes;

    // Update the blog grid
    renderBlogPosts();
}

// Comment functionality
function addComment() {
    if (!currentPost) return;

    const author = document.getElementById('commentAuthor').value;
    const text = document.getElementById('commentText').value;

    if (!author || !text) return;

    const comment = {
        author,
        text,
        date: new Date().toLocaleDateString()
    };

    currentPost.comments.push(comment);
    renderComments(currentPost.comments);
    document.getElementById('viewPostComments').textContent = currentPost.comments.length;

    // Clear form
    document.getElementById('commentAuthor').value = '';
    document.getElementById('commentText').value = '';

    // Update the blog grid
    renderBlogPosts();
}

function renderComments(comments) {
    const container = document.getElementById('commentsContainer');
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
document.querySelectorAll('.cta-button, .blog-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
        this.style.animation = 'float 2s ease-in-out infinite';
    });

    btn.addEventListener('mouseleave', function () {
        this.style.animation = '';
    });
});

// Add custom cursor effect
document.addEventListener('mousemove', function (e) {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
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

// Add search functionality for blog posts
function searchPosts(query) {
    const filtered = blogPosts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
    );
    renderBlogPosts(filtered);
}

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
// Create floating particles
function createParticles() {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particles.appendChild(particle);
    }
}

// Initialize particles after loading
setTimeout(createParticles, 3000);

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

setTimeout(addMorphingShapes, 4000);