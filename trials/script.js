// Global variables
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

// Main initialization function
function init() {
    initializePortfolio();
    initializeBlog();
    setupScrollAnimations();
    setupSmoothScrolling();
    setupEventListeners();
    updateGreeting();
    createParticles();
    addMorphingShapes();
}

// Initial site load event listener
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loadingScreen');

    // Hide the loading screen after a delay to allow the animations to complete.
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Call the main initialization function after the loading screen is hidden
            init();
        }, 1000); // Matches the CSS transition duration
    }, 2500); // Matches the loading screen's initial animation delay
});

function setupEventListeners() {
    // Blog filter buttons
    const allPostsBtn = document.getElementById('allPostsBtn');
    if (allPostsBtn) allPostsBtn.addEventListener('click', showAllPosts);

    const featuredPostsBtn = document.getElementById('featuredPostsBtn');
    if (featuredPostsBtn) featuredPostsBtn.addEventListener('click', showFeaturedPosts);

    const latestPostsBtn = document.getElementById('latestPostsBtn');
    if (latestPostsBtn) latestPostsBtn.addEventListener('click', showLatestPosts);

    const newPostBtn = document.getElementById('newPostBtn');
    if (newPostBtn) newPostBtn.addEventListener('click', openCreatePostModal);

    // Modal buttons
    const closeCreatePostModalBtn = document.getElementById('closeCreatePostModalBtn');
    if (closeCreatePostModalBtn) closeCreatePostModalBtn.addEventListener('click', closeCreatePostModal);

    const closeViewPostModalBtn = document.getElementById('closeViewPostModalBtn');
    if (closeViewPostModalBtn) closeViewPostModalBtn.addEventListener('click', closeViewPostModal);

    // Form submissions
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) createPostForm.addEventListener('submit', handleCreatePost);

    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);

    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) addCommentBtn.addEventListener('click', addComment);

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
}

function initializePortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
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

function initializeBlog() {
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

function renderBlogPosts(posts = blogPosts) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;
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
                    <button class="blog-btn read-more-btn" data-post-id="${post.id}">Read More</button>
                </div>
            </div>
        `;
        blogGrid.appendChild(blogPost);
    });

    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const postId = event.target.dataset.postId;
            openPost(parseInt(postId));
        });
    });

    setupScrollAnimations();
}

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

function openCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    if (modal) modal.style.display = 'block';
}

function closeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('createPostForm');
    if (form) form.reset();
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
    const modal = document.getElementById('viewPostModal');
    if (modal) modal.style.display = 'none';
    currentPost = null;
}

function handleCreatePost(e) {
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
}

function toggleLike() {
    if (!currentPost) return;

    currentPost.likes++;
    document.getElementById('viewPostLikes').textContent = currentPost.likes;

    renderBlogPosts();
}

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

    document.getElementById('commentAuthor').value = '';
    document.getElementById('commentText').value = '';

    renderBlogPosts();
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

    document.querySelectorAll('.skill-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });
}

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

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        heroTitle.innerHTML = `${greeting},<br>I'm Your Name`;
    }
}

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