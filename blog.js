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

        console.log('Fetching blogs from:', url);
        const response = await fetch(url);

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Response text length:', responseText.length);

        if (!responseText.trim()) {
            console.log('Empty response received');
            allBlogs = [];
            displayBlogs([]);
            return;
        }

        try {
            allBlogs = JSON.parse(responseText);
            console.log('Parsed blogs:', allBlogs.length, 'blogs found');
            displayBlogs(allBlogs);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response text was:', responseText);
            throw new Error('Invalid JSON response from server');
        }

    } catch (error) {
        console.error('Error loading blogs:', error);
        showError('Failed to load blogs: ' + error.message);
        allBlogs = [];
        displayBlogs([]);
    } finally {
        showLoading(false);
    }
}

function displayBlogs(blogs) {
    const blogFeed = document.getElementById('blogFeed');
    const noBlogsMessage = document.getElementById('noBlogsMessage');

    if (!blogs || blogs.length === 0) {
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

    const truncatedContent = blog.content && blog.content.length > 150
        ? blog.content.substring(0, 150) + '...'
        : blog.content || '';

    const tagsHtml = blog.tags && blog.tags.length > 0
        ? `<div class="blog-tags">${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

    const imageHtml = blog.image
        ? `<div class="blog-image"><img src="${blog.image}" alt="${blog.title || 'Blog post'}" loading="lazy" onerror="this.style.display='none'"></div>`
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
            <h3 class="blog-title">${blog.title || 'Untitled'}</h3>
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
        console.log('Opening blog modal for ID:', blogId);
        const response = await fetch(`/api/blogs/${blogId}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to load blog: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        if (!responseText.trim()) {
            throw new Error('Empty response received');
        }

        currentBlog = JSON.parse(responseText);
        console.log('Loaded blog:', currentBlog.title);
        displayBlogModal(currentBlog);
    } catch (error) {
        console.error('Error loading blog:', error);
        showError('Failed to load blog post: ' + error.message);
    }
}

function displayBlogModal(blog) {
    if (!blog) {
        showError('Blog data is missing');
        return;
    }

    document.getElementById('modalTitle').textContent = blog.title || 'Untitled';
    document.getElementById('modalDate').textContent = formatDate(blog.date);
    document.getElementById('modalViews').textContent = blog.views || 0;
    document.getElementById('modalLikes').textContent = blog.likes || 0;
    document.getElementById('modalContent').innerHTML = (blog.content || '').replace(/\n/g, '<br>');

    // Display image if exists
    const modalImage = document.getElementById('modalImage');
    if (blog.image) {
        modalImage.innerHTML = `<img src="${blog.image}" alt="${blog.title}" onerror="this.style.display='none'">`;
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
            showSuccess('Thank you for liking this post!');
        } else {
            throw new Error('Failed to like blog');
        }
    } catch (error) {
        console.error('Error liking blog:', error);
        showError('Failed to like blog. Please try again.');
    }
}

async function quickLike(blogId) {
    try {
        const response = await fetch(`/api/blogs/${blogId}/like`, {
            method: 'PUT'
        });

        if (response.ok) {
            loadBlogs(currentFilter);
        } else {
            throw new Error('Failed to like blog');
        }
    } catch (error) {
        console.error('Error liking blog:', error);
        showError('Failed to like blog. Please try again.');
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

    if (content.length < 5) {
        showError('Comment must be at least 5 characters long');
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
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showError('Failed to add comment: ' + error.message);
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
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    if (searchTerm === '') {
        displayBlogs(allBlogs);
        return;
    }

    const filteredBlogs = allBlogs.filter(blog => {
        const titleMatch = blog.title && blog.title.toLowerCase().includes(searchTerm);
        const contentMatch = blog.content && blog.content.toLowerCase().includes(searchTerm);
        const tagsMatch = blog.tags && blog.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm)
        );

        return titleMatch || contentMatch || tagsMatch;
    });

    displayBlogs(filteredBlogs);
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

function showLoading(show) {
    const loading = document.getElementById('blogLoading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

    messageDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to the page
    const container = document.querySelector('.container') || document.body;
    container.appendChild(messageDiv);

    // Auto remove after timeout
    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, timeout);
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

// Handle form submission for comment form
document.addEventListener('DOMContentLoaded', function () {
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        // Prevent form submission if enter is pressed in textarea
        document.getElementById('commentContent')?.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addComment();
            }
        });
    }
});

// Export functions for global access
window.filterBlogs = filterBlogs;
window.searchBlogs = searchBlogs;
window.openBlogModal = openBlogModal;
window.closeBlogModal = closeBlogModal;
window.likeBlog = likeBlog;
window.quickLike = quickLike;
window.addComment = addComment;