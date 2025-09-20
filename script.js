// Global variables
let blogPosts = [];
let portfolioProjects = [];
let currentPost = null;
let hasLoadedBefore = false;

// Check if user has visited before
if (sessionStorage.getItem('hasVisited')) {
    hasLoadedBefore = true;
}

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Initialize the website
window.addEventListener('load', function () {
    // Only show loading animation for first-time visitors
    if (!hasLoadedBefore) {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                sessionStorage.setItem('hasVisited', 'true');
            }, 1000);
        }, 2500);
    } else {
        // Hide loading screen immediately for returning users
        document.getElementById('loadingScreen').style.display = 'none';
    }

    initializePortfolio();
    initializeBlog();
    setupScrollAnimations();
    setupSmoothScrolling();
});

// Initialize Portfolio with real projects from API
async function initializePortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');

    try {
        // Fetch featured projects for homepage
        const response = await fetch('/api/projects?featured=true&limit=6');
        if (response.ok) {
            portfolioProjects = await response.json();
        } else {
            console.error('Failed to load projects');
            portfolioProjects = [];
        }

        // If no featured projects, get the latest ones
        if (portfolioProjects.length === 0) {
            const latestResponse = await fetch('/api/projects?limit=6');
            if (latestResponse.ok) {
                portfolioProjects = await latestResponse.json();
            }
        }

        // Display projects or show message if none exist
        if (portfolioProjects.length === 0) {
            portfolioGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
                    <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <h3>No projects yet</h3>
                    <p>Projects will appear here once they are added to the portfolio.</p>
                </div>
            `;
            return;
        }

        portfolioProjects.forEach((project, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item animate-on-scroll';
            portfolioItem.style.animationDelay = `${index * 0.2}s`;

            const truncatedDescription = project.description.length > 100
                ? project.description.substring(0, 100) + '...'
                : project.description;

            portfolioItem.innerHTML = `
                <img src="${project.image}" alt="${project.title}">
                <div class="portfolio-content">
                    <h3>${project.title}</h3>
                    <p>${truncatedDescription}</p>
                    <div style="margin-top: 1rem;">
                        ${project.technologies.slice(0, 4).map(tech =>
                `<span style="background: var(--gradient); color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; margin-right: 0.5rem; display: inline-block; margin-bottom: 0.5rem;">${tech}</span>`
            ).join('')}
                        ${project.technologies.length > 4 ? `<span style="color: #64748b; font-size: 0.8rem;">+${project.technologies.length - 4} more</span>` : ''}
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
                        ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fab fa-github"></i> Code</a>` : ''}
                        ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                        <button onclick="viewProjectDetails('${project._id}')" style="background: var(--gradient); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 15px; cursor: pointer; font-size: 0.8rem;">View Details</button>
                    </div>
                </div>
            `;
            portfolioGrid.appendChild(portfolioItem);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        portfolioGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Error loading projects</h3>
                <p>There was an error loading the projects. Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Initialize Blog with real posts from API
async function initializeBlog() {
    try {
        // Fetch featured blog posts for homepage
        const response = await fetch('/api/blogs?featured=true&limit=6');
        if (response.ok) {
            blogPosts = await response.json();
        } else {
            console.error('Failed to load blog posts');
            blogPosts = [];
        }

        // If no featured posts, get the latest ones
        if (blogPosts.length === 0) {
            const latestResponse = await fetch('/api/blogs?limit=6');
            if (latestResponse.ok) {
                blogPosts = await latestResponse.json();
            }
        }

        renderBlogPosts();
    } catch (error) {
        console.error('Error loading blog posts:', error);
        const blogGrid = document.getElementById('blogGrid');
        blogGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>Error loading blog posts</h3>
                <p>There was an error loading the blog posts. Please try refreshing the page.</p>
            </div>
        `;
    }
}

// View project details function
async function viewProjectDetails(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
            const project = await response.json();

            // Create a simple modal or redirect to projects page
            alert(`${project.title}\n\n${project.description}\n\nTechnologies: ${project.technologies.join(', ')}\n\nStatus: ${project.status}`);
        }
    } catch (error) {
        console.error('Error loading project details:', error);
        alert('Error loading project details. Please try again.');
    }
}

// Render blog posts
function renderBlogPosts(posts = blogPosts) {
    const blogGrid = document.getElementById('blogGrid');

    if (posts.length === 0) {
        blogGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
                <i class="fas fa-blog" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>No blog posts yet</h3>
                <p>Blog posts will appear here once they are published.</p>
            </div>
        `;
        return;
    }

    blogGrid.innerHTML = '';

    posts.forEach((post, index) => {
        const blogPost = document.createElement('div');
        blogPost.className = 'blog-post animate-on-scroll';
        blogPost.style.animationDelay = `${index * 0.1}s`;

        const truncatedContent = post.content && post.content.length > 150
            ? post.content.substring(0, 150) + '...'
            : post.content || 'No content available';

        const formattedDate = post.date ? new Date(post.date).toLocaleDateString() : 'Date not available';

        blogPost.innerHTML = `
            <div class="blog-content">
                <div class="blog-meta">
                    <span>${formattedDate}</span>
                    <div class="blog-stats">
                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments ? post.comments.length : 0}</span>
                    </div>
                </div>
                <h3>${post.title || 'Untitled'}</h3>
                <p>${truncatedContent}</p>
                ${post.featured ? '<span style="background: var(--gradient-accent); color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">Featured</span>' : ''}
                <div style="margin-top: 1rem;">
                    <button class="blog-btn" onclick="viewBlogPost('${post._id}')">Read More</button>
                </div>
            </div>
        `;
        blogGrid.appendChild(blogPost);
    });

    // Re-trigger animations
    setupScrollAnimations();
}

// View blog post function
async function viewBlogPost(postId) {
    try {
        const response = await fetch(`/api/blogs/${postId}`);
        if (response.ok) {
            const post = await response.json();

            // Simple alert for now - you can enhance this with a proper modal
            const content = post.content.length > 300
                ? post.content.substring(0, 300) + '...\n\n[Read full post on blog page]'
                : post.content;

            alert(`${post.title}\n\nBy: ${post.author || 'Rohan Bisht'}\nDate: ${new Date(post.date).toLocaleDateString()}\nLikes: ${post.likes || 0}\n\n${content}`);
        }
    } catch (error) {
        console.error('Error loading blog post:', error);
        alert('Error loading blog post. Please try again.');
    }
}

// Blog filter functions (updated to work with API)
async function showAllPosts() {
    try {
        const response = await fetch('/api/blogs?limit=6');
        if (response.ok) {
            const posts = await response.json();
            renderBlogPosts(posts);
        }
    } catch (error) {
        console.error('Error loading all posts:', error);
    }
}

async function showFeaturedPosts() {
    try {
        const response = await fetch('/api/blogs?featured=true&limit=6');
        if (response.ok) {
            const posts = await response.json();
            renderBlogPosts(posts);
        }
    } catch (error) {
        console.error('Error loading featured posts:', error);
    }
}

async function showLatestPosts() {
    try {
        const response = await fetch('/api/blogs?limit=3');
        if (response.ok) {
            const posts = await response.json();
            renderBlogPosts(posts);
        }
    } catch (error) {
        console.error('Error loading latest posts:', error);
    }
}

// Keep existing modal and animation functions
function openCreatePostModal() {
    alert('Only the site administrator can create posts. Please visit the Write Blog page if you are the admin.');
}

function closeCreatePostModal() {
    // Not needed for read-only access
}

function openPost(postId) {
    viewBlogPost(postId);
}

function closeViewPostModal() {
    // Not needed for simplified view
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

// Keep existing visual effects
window.addEventListener('click', function (event) {
    // Modal handling removed for read-only access
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

// Initialize typewriter effect after loading (only for first-time visitors)
if (!hasLoadedBefore) {
    setTimeout(() => {
        const heroSubtitle = document.querySelector('.hero-content p');
        if (heroSubtitle) {
            const originalText = heroSubtitle.textContent;
            typeWriter(heroSubtitle, originalText, 100);
        }
    }, 4000);
}

// Add dynamic greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle && !heroTitle.textContent.includes('Rohan Bisht')) {
        heroTitle.innerHTML = `${greeting},<br>I'm Rohan Bisht`;
    }
}

if (!hasLoadedBefore) {
    setTimeout(updateGreeting, 5000);
}

// Create floating particles (only for first-time visitors)
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

// Initialize particles after loading (only for first-time visitors)
if (!hasLoadedBefore) {
    setTimeout(createParticles, 3000);
}

// Add morphing shapes to sections (only for first-time visitors)
function addMorphingShapes() {
    if (hasLoadedBefore) return;

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

if (!hasLoadedBefore) {
    setTimeout(addMorphingShapes, 4000);
}