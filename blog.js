let allBlogs = [];
let currentBlog = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();
});

async function loadBlogs(filter = 'all') {
    showLoading(true);
    try {
        let url = '/api/blogs';
        if (filter === 'featured') {
            url += '?featured=true';
        } else if (filter === 'latest') {
            url += '?limit=5';
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load blogs');
        }

        allBlogs = await response.json();
        displayBlogs(allBlogs);
    } catch (error) {
        console.error('Error loading blogs:', error);
        showError('Failed to load blogs. Please try again later.');
    } finally {
        showLoading(false);
    }
}

function displayBlogs(blogs) {
    const blogFeed = document.getElementById('blogFeed');
    const noBlogsMessage = document.getElementById('noBlogsMessage');

    if (blogs.length === 0) {
        blogFeed.innerHTML = '';
        noBlogsMessage.style.display = 'block';
        return;
    }

    noBlogsMessage.style.display = 'none';
    blogFeed.innerHTML = '';

    blogs.forEach((blog, index) => {
        const blogCard = createBlogCard(blog, index);
        blogFeed.appendChild(blogCard);
    });

    // Animate blog cards
    animateBlogCards();
}

function createBlogCard(blog, index) {
    const blogPost = document.createElement('div');
    blogPost.className = 'blog-card animate-on-scroll';
    blogPost.style.animationDelay = `${index * 0.1}s`;

    const truncatedContent = blog.content.length > 150
        ? blog.content.substring(0, 150) + '...'
        : blog.content;

    const tagsHtml = blog.tags && blog.tags.length > 0
        ? `<div class="blog-tags">${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

    const imageHtml = blog.image
        ? `<div class="blog-image"><img src="${blog.image}" alt="${blog.title}" loading="lazy"></div>`
        : '';

    blogPost.innerHTML = `
        ${imageHtml}
        <div class="blog-content">
            <div class="blog-meta">
                <div class="blog-info">
                    <span><i class="fas fa-calendar"></i> ${formatDate(blog.date)}</span>
                    <span><i class="fas fa-eye"></i> ${blog.views || 0}</span>
                    <span><i class="fas fa-heart"></i> ${blog.likes || 0}</span>
                    <span><i class="fas fa-comment"></i> ${blog.comments ? blog.comments.length : 0}</span>
                </div>
                ${blog.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <h3 class="blog-title">${blog.title}</h3>
            <p class="blog-excerpt">${truncatedContent}</p>
            ${tagsHtml}
            <div class="blog-actions">
                <button class="read-more-btn" onclick="openBlogModal('${blog._id}')">
                    Read More <i class="fas fa-arrow-right"></i>
                </button>
                <div class="blog-stats">
                    <button class="stat-btn" onclick="quickLike('${blog._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="stat-btn" onclick="openBlogModal('${blog._id}')">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    return blogPost;
}

async function openBlogModal(blogId) {
    try {
        const response = await fetch(`/api/blogs/${blogId}`);
        if (!response.ok) {
            throw new Error('Failed to load blog');
        }

        currentBlog = await response.json();
        displayBlogModal(currentBlog);
    } catch (error) {
        console.error('Error loading blog:', error);
        showError('Failed to load blog post');
    }
}

function displayBlogModal(blog) {
    document.getElementById('modalTitle').textContent = blog.title;
    document.getElementById('modalDate').textContent = formatDate(blog.date);
    document.getElementById('modalViews').textContent = blog.views || 0;
    document.getElementById('modalLikes').textContent = blog.likes || 0;
    document.getElementById('modalContent').innerHTML = blog.content.replace(/\n/g, '<br>');

    // Display image if exists
    const modalImage = document.getElementById('modalImage');
    if (blog.image) {
        modalImage.innerHTML = `<img src="${blog.image}" alt="${blog.title}">`;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }

    // Display tags
    const modalTags = document.getElementById('modalTags');
    if (blog.tags && blog.tags.length > 0) {
        modalTags.innerHTML = blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    } else {
        modalTags.innerHTML = '';
    }

    // Display comments
    displayComments(blog.comments || []);

    // Show modal
    document.getElementById('blogModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    document.getElementById('blogModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentBlog = null;
}

function displayComments(comments) {
    const commentsContainer = document.getElementById('commentsContainer');

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        return;
    }

    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <strong>${comment.author}</strong>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <p class="comment-content">${comment.content}</p>
        </div>
    `).join('');
}

async function likeBlog() {
    if (!currentBlog) return;

    try {
        const response = await fetch(`/api/blogs/${currentBlog._id}/like`, {
            method: 'PUT'
        });

        if (response.ok) {
            const updatedBlog = await response.json();
            currentBlog.likes = updatedBlog.likes;
            document.getElementById('modalLikes').textContent = updatedBlog.likes;

            // Update the blog card as well
            loadBlogs(currentFilter);
        }
    } catch (error) {
        console.error('Error liking blog:', error);
        showError('Failed to like blog');
    }
}

async function quickLike(blogId) {
    try {
        const response = await fetch(`/api/blogs/${blogId}/like`, {
            method: 'PUT'
        });

        if (response.ok) {
            loadBlogs(currentFilter);
        }
    } catch (error) {
        console.error('Error liking blog:', error);
    }
}

async function addComment() {
    if (!currentBlog) return;

    const author = document.getElementById('commentAuthor').value.trim();
    const content = document.getElementById('commentContent').value.trim();

    if (!author || !content) {
        showError('Please fill in both name and comment fields');
        return;
    }

    try {
        const response = await fetch(`/api/blogs/${currentBlog._id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ author, content })
        });

        if (response.ok) {
            const updatedBlog = await response.json();
            currentBlog = updatedBlog;

            // Clear form
            document.getElementById('commentAuthor').value = '';
            document.getElementById('commentContent').value = '';

            // Refresh comments
            displayComments(updatedBlog.comments);

            showSuccess('Comment added successfully!');
        } else {
            throw new Error('Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showError('Failed to add comment');
    }
}

function filterBlogs(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-buttons .blog-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadBlogs(filter);
}

function searchBlogs() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (searchTerm === '') {
        displayBlogs(allBlogs);
        return;
    }

    const filteredBlogs = allBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.tags && blog.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    displayBlogs(filteredBlogs);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading(show) {
    const loading = document.getElementById('blogLoading');
    loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        document.querySelector('.container').appendChild(errorDiv);
    }

    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    let successDiv = document.getElementById('successMessage');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'successMessage';
        successDiv.className = 'success-message';
        document.querySelector('.container').appendChild(successDiv);
    }

    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 3000);
}

function animateBlogCards() {
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
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('blogModal');
    if (event.target === modal) {
        closeBlogModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeBlogModal();
    }
});