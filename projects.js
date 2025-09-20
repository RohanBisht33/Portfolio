let allProjects = [];
let currentProject = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

async function loadProjects(filter = 'all') {
    showLoading(true);
    try {
        let url = '/api/projects';
        if (filter === 'featured') {
            url += '?featured=true';
        } else if (filter !== 'all') {
            url += `?status=${filter}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }

        allProjects = await response.json();
        displayProjects(allProjects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Failed to load projects. Please try again later.');
    } finally {
        showLoading(false);
    }
}

function displayProjects(projects) {
    const projectsFeed = document.getElementById('projectsFeed');
    const noProjectsMessage = document.getElementById('noProjectsMessage');

    if (projects.length === 0) {
        projectsFeed.innerHTML = '';
        noProjectsMessage.style.display = 'block';
        return;
    }

    noProjectsMessage.style.display = 'none';
    projectsFeed.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsFeed.appendChild(projectCard);
    });

    // Animate project cards
    animateProjectCards();
}

function createProjectCard(project, index) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card animate-on-scroll';
    projectCard.style.animationDelay = `${index * 0.1}s`;

    const truncatedDescription = project.description.length > 120
        ? project.description.substring(0, 120) + '...'
        : project.description;

    const technologiesHtml = project.technologies && project.technologies.length > 0
        ? `<div class="project-technologies">${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}</div>`
        : '';

    const statusClass = getStatusClass(project.status);

    projectCard.innerHTML = `
        <div class="project-image">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
            <div class="project-overlay">
                <div class="project-links">
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link" onclick="event.stopPropagation()"><i class="fab fa-github"></i></a>` : ''}
                    ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="project-link" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    <button class="project-link" onclick="openProjectModal('${project._id}')"><i class="fas fa-eye"></i></button>
                </div>
            </div>
            ${project.featured ? '<span class="featured-badge">Featured</span>' : ''}
            <span class="status-badge ${statusClass}">${formatStatus(project.status)}</span>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${truncatedDescription}</p>
            ${technologiesHtml}
            <div class="project-actions">
                <button class="view-project-btn" onclick="openProjectModal('${project._id}')">
                    View Details <i class="fas fa-arrow-right"></i>
                </button>
                <div class="project-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(project.date)}</span>
                </div>
            </div>
        </div>
    `;

    return projectCard;
}

async function openProjectModal(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to load project');
        }

        currentProject = await response.json();
        displayProjectModal(currentProject);
    } catch (error) {
        console.error('Error loading project:', error);
        showError('Failed to load project details');
    }
}

function displayProjectModal(project) {
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDate').textContent = formatDate(project.date);
    document.getElementById('modalDescription').innerHTML = project.description.replace(/\n/g, '<br>');

    // Status badge
    const statusElement = document.getElementById('modalStatus');
    statusElement.textContent = formatStatus(project.status);
    statusElement.className = `status-badge ${getStatusClass(project.status)}`;

    // Display image
    const modalImage = document.getElementById('modalImage');
    modalImage.innerHTML = `<img src="${project.image}" alt="${project.title}">`;

    // Display technologies
    const modalTechnologies = document.getElementById('modalTechnologies');
    if (project.technologies && project.technologies.length > 0) {
        modalTechnologies.innerHTML = `
            <h4>Technologies Used:</h4>
            <div class="tech-list">
                ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
            </div>
        `;
    } else {
        modalTechnologies.innerHTML = '';
    }

    // Display links
    const githubLink = document.getElementById('modalGithub');
    const liveLink = document.getElementById('modalLive');

    if (project.githubUrl) {
        githubLink.href = project.githubUrl;
        githubLink.style.display = 'inline-flex';
    } else {
        githubLink.style.display = 'none';
    }

    if (project.liveUrl) {
        liveLink.href = project.liveUrl;
        liveLink.style.display = 'inline-flex';
    } else {
        liveLink.style.display = 'none';
    }

    // Show modal
    document.getElementById('projectModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentProject = null;
}

function filterProjects(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-buttons .blog-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadProjects(filter);
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading(show) {
    const loading = document.getElementById('projectsLoading');
    loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
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

function animateProjectCards() {
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
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeProjectModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProjectModal();
    }
});