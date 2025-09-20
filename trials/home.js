// Home page specific JavaScript

// Initialize home page features
document.addEventListener('DOMContentLoaded', function () {
    loadHomeBlogPosts();
});

// Load blog posts for home page preview
function loadHomeBlogPosts() {
    const homeBlogContainer = document.getElementById('homeBlogPosts');
    if (!homeBlogContainer || !blogPosts.length) return;

    // Get latest 2 posts for home preview
    const latestPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);

    homeBlogContainer.innerHTML = '';

    latestPosts.forEach((post, index) => {
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
                    <a href="blog.html" class="blog-btn">Read on Blog Page</a>
                </div>
            </div>
        `;
        homeBlogContainer.appendChild(blogPost);
    });

    // Re-trigger animations
    setupScrollAnimations();
}