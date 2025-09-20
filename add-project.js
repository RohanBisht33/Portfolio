let isSubmitting = false;
let adminToken = localStorage.getItem('adminToken');

// Authentication check
function checkAuthAndRedirect() {
    if (!adminToken) {
        const password = prompt('This page is restricted to the site administrator. Please enter the admin password:');
        if (!password) {
            window.location.href = '/';
            return false;
        }

        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    adminToken = data.token;
                    localStorage.setItem('adminToken', adminToken);
                    location.reload();
                } else {
                    alert('Invalid password. Access denied.');
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Authentication error:', error);
                alert('Authentication failed. Access denied.');
                window.location.href = '/';
            });

        return false;
    }
    return true;
}

// Authenticated fetch function
function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${adminToken}`
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuthAndRedirect()) {
        return;
    }
    initializeForm();
});

function initializeForm() {
    const descriptionTextarea = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    const imageInput = document.getElementById('image');

    // Character counter
    descriptionTextarea.addEventListener('input', () => {
        const count = descriptionTextarea.value.length;
        charCount.textContent = count;
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
    document.getElementById('projectForm').addEventListener('submit', handleFormSubmit);

    // URL validation
    document.getElementById('githubUrl').addEventListener('blur', validateGitHubUrl);
    document.getElementById('liveUrl').addEventListener('blur', validateUrl);
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

function validateGitHubUrl() {
    const githubUrl = document.getElementById('githubUrl').value;
    if (githubUrl && !githubUrl.includes('github.com')) {
        showError('Please enter a valid GitHub URL');
        document.getElementById('githubUrl').focus();
        return false;
    }
    return true;
}

function validateUrl() {
    const liveUrl = document.getElementById('liveUrl').value;
    if (liveUrl) {
        try {
            new URL(liveUrl);
        } catch {
            showError('Please enter a valid URL');
            document.getElementById('liveUrl').focus();
            return false;
        }
    }
    return true;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const technologies = document.getElementById('technologies').value.trim();
    const status = document.getElementById('status').value;
    const githubUrl = document.getElementById('githubUrl').value.trim();
    const liveUrl = document.getElementById('liveUrl').value.trim();
    const featured = document.getElementById('featured').checked;
    const imageFile = document.getElementById('image').files[0];

    // Validation
    if (!title) {
        showError('Please enter a project title');
        document.getElementById('title').focus();
        return;
    }

    if (!description) {
        showError('Please enter a project description');
        document.getElementById('description').focus();
        return;
    }

    if (description.length < 50) {
        showError('Project description should be at least 50 characters long');
        document.getElementById('description').focus();
        return;
    }

    if (!imageFile) {
        showError('Please upload a project image');
        document.getElementById('image').focus();
        return;
    }

    if (!validateGitHubUrl() || !validateUrl()) {
        return;
    }

    // Prepare form data
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('featured', featured);
    formData.append('image', imageFile);

    if (technologies) {
        formData.append('technologies', technologies);
    }

    if (githubUrl) {
        formData.append('githubUrl', githubUrl);
    }

    if (liveUrl) {
        formData.append('liveUrl', liveUrl);
    }

    await submitProject(formData);
}

async function submitProject(formData) {
    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Project...';
    submitBtn.disabled = true;

    try {
        const response = await authenticatedFetch('/api/projects', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('Project added successfully!');

            // Reset form
            document.getElementById('projectForm').reset();
            removeImage();
            document.getElementById('charCount').textContent = '0';

            // Redirect to projects page after a short delay
            setTimeout(() => {
                window.location.href = '/projects';
            }, 2000);
        } else {
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                alert('Session expired. Please re-authenticate.');
                window.location.reload();
                return;
            }
            throw new Error(result.error || 'Failed to add project');
        }
    } catch (error) {
        console.error('Error adding project:', error);
        showError(error.message || 'Failed to add project. Please try again.');
    } finally {
        isSubmitting = false;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function previewProject() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const technologies = document.getElementById('technologies').value.trim();
    const status = document.getElementById('status').value;
    const githubUrl = document.getElementById('githubUrl').value.trim();
    const liveUrl = document.getElementById('liveUrl').value.trim();
    const featured = document.getElementById('featured').checked;
    const imageFile = document.getElementById('image').files[0];

    if (!title || !description) {
        showError('Please enter both title and description to preview');
        return;
    }

    if (!imageFile) {
        showError('Please upload an image to preview');
        return;
    }

    const statusClass = getStatusClass(status);

    let previewHTML = `
        <div class="project-preview-card">
            <div class="project-image">
                <img id="previewProjectImg" src="" alt="${title}">
                <div class="project-overlay">
                    <div class="project-links">
                        ${githubUrl ? `<a href="${githubUrl}" target="_blank" class="project-link"><i class="fab fa-github"></i></a>` : ''}
                        ${liveUrl ? `<a href="${liveUrl}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    </div>
                </div>
                ${featured ? '<span class="featured-badge">Featured</span>' : ''}
                <span class="status-badge ${statusClass}">${formatStatus(status)}</span>
            </div>
            <div class="project-content">
                <h3 class="project-title">${title}</h3>
                <p class="project-description">${description}</p>
                ${technologies ? `<div class="project-technologies">${technologies.split(',').map(tech => `<span class="tech-badge">${tech.trim()}</span>`).join('')}</div>` : ''}
                <div class="project-meta">
                    <span><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('previewContent').innerHTML = previewHTML;

    // Load image for preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewProjectImg').src = e.target.result;
    };
    reader.readAsDataURL(imageFile);

    document.getElementById('previewModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function submitFromPreview() {
    closePreview();
    document.getElementById('projectForm').dispatchEvent(new Event('submit'));
}

function formatStatus(status) {
    switch (status) {
        case 'completed':
            return 'Completed';
        case 'in-progress':
            return 'In Progress';
        case 'planning':
            return 'Planning';
        default:
            return 'Unknown';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'completed':
            return 'status-completed';
        case 'in-progress':
            return 'status-in-progress';
        case 'planning':
            return 'status-planning';
        default:
            return 'status-unknown';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');

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

    messageContainer.appendChild(messageDiv);

    // Auto remove after 5 seconds for errors, 3 seconds for success
    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, timeout);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreview();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePreview();
    }
});

// Warn user about unsaved changes
window.addEventListener('beforeunload', (event) => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    if ((title || description) && !isSubmitting) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
    }
});