let isPublishing = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    loadDraft();
});

function initializeEditor() {
    const contentTextarea = document.getElementById('content');
    const charCount = document.getElementById('charCount');
    const imageInput = document.getElementById('image');

    // Character counter
    contentTextarea.addEventListener('input', () => {
        const count = contentTextarea.value.length;
        charCount.textContent = count;

        // Auto-save draft
        saveDraftSilently();
    });

    // Image upload handling
    imageInput.addEventListener('change', handleImageUpload);

    // Drag and drop for images
    const uploadArea = document.querySelector('.file-upload-display');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            handleImageUpload();
        }
    });

    // Form submission
    document.getElementById('blogForm').addEventListener('submit', handleFormSubmit);

    // Auto-save every 30 seconds
    setInterval(saveDraftSilently, 30000);
}

function handleImageUpload() {
    const imageInput = document.getElementById('image');
    const file = imageInput.files[0];

    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        imageInput.value = '';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        imageInput.value = '';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('uploadPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    document.getElementById('image').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'flex';
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (isPublishing) return;

    const formData = new FormData();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const featured = document.getElementById('featured').checked;
    const imageFile = document.getElementById('image').files[0];

    // Validation
    if (!title) {
        showError('Please enter a blog title');
        document.getElementById('title').focus();
        return;
    }

    if (!content) {
        showError('Please enter blog content');
        document.getElementById('content').focus();
        return;
    }

    if (content.length < 100) {
        showError('Blog content should be at least 100 characters long');
        document.getElementById('content').focus();
        return;
    }

    // Prepare form data
    formData.append('title', title);
    formData.append('content', content);
    formData.append('featured', featured);

    if (tags) {
        formData.append('tags', tags);
    }

    if (imageFile) {
        formData.append('image', imageFile);
    }

    await publishBlog(formData);
}

async function publishBlog(formData) {
    isPublishing = true;
    const publishBtn = document.getElementById('publishBtn');
    const originalText = publishBtn.innerHTML;

    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    publishBtn.disabled = true;

    try {
        const response = await fetch('/api/blogs', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('Blog post published successfully!');
            clearDraft();

            // Reset form
            document.getElementById('blogForm').reset();
            removeImage();
            document.getElementById('charCount').textContent = '0';

            // Redirect to blog page after a short delay
            setTimeout(() => {
                window.location.href = '/blog';
            }, 2000);
        } else {
            throw new Error(result.error || 'Failed to publish blog');
        }
    } catch (error) {
        console.error('Error publishing blog:', error);
        showError(error.message || 'Failed to publish blog. Please try again.');
    } finally {
        isPublishing = false;
        publishBtn.innerHTML = originalText;
        publishBtn.disabled = false;
    }
}

function previewBlog() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const featured = document.getElementById('featured').checked;
    const imageFile = document.getElementById('image').files[0];

    if (!title || !content) {
        showError('Please enter both title and content to preview');
        return;
    }

    let previewHTML = `
        <div class="blog-preview-header">
            <h1>${title}</h1>
            <div class="blog-meta">
                <span><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString()}</span>
                <span><i class="fas fa-user"></i> Rohan Bisht</span>
                ${featured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
        </div>
    `;

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewHTML += `<div class="blog-image"><img src="${e.target.result}" alt="${title}"></div>`;
            completePreview();
        };
        reader.readAsDataURL(imageFile);
    } else {
        completePreview();
    }

    function completePreview() {
        previewHTML += `
            <div class="blog-content">
                ${formatContent(content)}
            </div>
        `;

        if (tags) {
            previewHTML += `
                <div class="blog-tags">
                    ${tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                </div>
            `;
        }

        document.getElementById('previewContent').innerHTML = previewHTML;
        document.getElementById('previewModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function publishFromPreview() {
    closePreview();
    document.getElementById('blogForm').dispatchEvent(new Event('submit'));
}

function formatContent(content) {
    // Simple markdown-like formatting
    return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .split('</p><p>').map(p => `<p>${p}</p>`).join('');
}

function saveDraft() {
    const draft = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        tags: document.getElementById('tags').value,
        featured: document.getElementById('featured').checked,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem('blogDraft', JSON.stringify(draft));
        showSuccess('Draft saved successfully!');
    } catch (error) {
        showError('Failed to save draft');
    }
}

function saveDraftSilently() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (title || content) {
        const draft = {
            title,
            content,
            tags: document.getElementById('tags').value,
            featured: document.getElementById('featured').checked,
            timestamp: Date.now