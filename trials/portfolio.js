// Portfolio page specific JavaScript

let portfolioItems = [
    {
        id: 1,
        title: "E-commerce Website",
        description: "A full-stack e-commerce solution built with modern web technologies. Features include user authentication, product catalog, shopping cart, payment integration with Stripe, order management, and responsive design. The backend uses Node.js and Express with MongoDB for data storage.",
        shortDescription: "Full-stack e-commerce solution with payment integration",
        image: "https://via.placeholder.com/600x400/667eea/ffffff?text=E-commerce+Website",
        tech: ["React", "Node.js", "MongoDB", "Stripe API", "Express", "JWT"],
        category: "web",
        featured: true,
        links: {
            live: "https://example-ecommerce.com",
            github: "https://github.com/yourusername/ecommerce-project"
        }
    },
    {
        id: 2,
        title: "Task Management App",
        description: "A responsive task management application with drag-and-drop functionality, real-time updates, and collaborative features. Built using React with Redux for state management, featuring task categories, due dates, priority levels, and team collaboration tools.",
        shortDescription: "Responsive task manager with drag-and-drop functionality",
        image: "https://via.placeholder.com/600x400/764ba2/ffffff?text=Task+Management+App",
        tech: ["React", "Redux", "CSS Grid", "Drag & Drop API", "Local Storage"],
        category: "web",
        featured: true,
        links: {
            live: "https://example-taskmanager.com",
            github: "https://github.com/yourusername/task-manager"
        }
    },
    {
        id: 3,
        title: "Weather Dashboard",
        description: "A comprehensive weather dashboard that provides real-time weather information, 7-day forecasts, weather maps, and location-based services. Integrates with multiple weather APIs and features beautiful data visualizations using Chart.js.",
        shortDescription: "Real-time weather app with location-based forecasts",
        image: "https://via.placeholder.com/600x400/f093fb/ffffff?text=Weather+Dashboard",
        tech: ["JavaScript", "Weather API", "Chart.js", "Geolocation API", "CSS3"],
        category: "web",
        featured: false,
        links: {
            live: "https://example-weather.com",
            github: "https://github.com/yourusername/weather-dashboard"
        }
    },
    {
        id: 4,
        title: "Mobile Banking App UI",
        description: "A modern mobile banking application interface designed with user experience as the top priority. Features include account overview, transaction history, fund transfers, bill payments, and biometric authentication. Designed using Figma with a focus on accessibility and usability.",
        shortDescription: "Modern mobile banking interface with focus on UX",
        image: "https://via.placeholder.com/600x400/667eea/ffffff?text=Banking+App+UI",
        tech: ["Figma", "UI/UX Design", "Prototyping", "User Research"],
        category: "mobile",
        featured: true,
        links: {
            figma: "https://figma.com/banking-app-design"
        }
    },
    {
        id: 5,
        title: "Fitness Tracker App",
        description: "A comprehensive fitness tracking application that monitors workouts, nutrition, and health metrics. Features include workout planning, progress tracking, social challenges, and integration with wearable devices. Built with React Native for cross-platform compatibility.",
        shortDescription: "Cross-platform fitness tracking with social features",
        image: "https://via.placeholder.com/600x400/764ba2/ffffff?text=Fitness+Tracker",
        tech: ["React Native", "Firebase", "Health APIs", "Push Notifications"],
        category: "mobile",
        featured: false,
        links: {
            live: "https://fitness-tracker-app.com",
            github: "https://github.com/yourusername/fitness-tracker"
        }
    },
    {
        id: 6,
        title: "Brand Identity Package",
        description: "Complete brand identity design for a sustainable fashion startup. Includes logo design, color palette, typography system, business cards, letterheads, social media templates, and brand guidelines. The design reflects the company's commitment to environmental sustainability.",
        shortDescription: "Complete brand identity for sustainable fashion startup",
        image: "https://via.placeholder.com/600x400/f093fb/ffffff?text=Brand+Identity",
        tech: ["Adobe Illustrator", "Adobe Photoshop", "Brand Strategy", "Print Design"],
        category: "design",
        featured: true,
        links: {
            behance: "https://behance.net/brand-identity-project"
        }
    }
];

let currentFilter = 'all';

// Initialize portfolio page
document.addEventListener('DOMContentLoaded', function () {
    renderPortfolioItems();
    setupPortfolioFilters();
});

// Render portfolio items
function renderPortfolioItems(items = portfolioItems) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';

    items.forEach((item, index) => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item animate-on-scroll';
        portfolioItem.style.animationDelay = `${index * 0.1}s`;
        portfolioItem.dataset.category = item.category;

        portfolioItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="portfolio-content">
                <h3>${item.title}</h3>
                <p>${item.shortDescription}</p>
                <div class="portfolio-tech" style="margin: 1rem 0;">
                    ${item.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                ${item.featured ? '<span class="featured-badge">Featured</span>' : ''}
                <div class="portfolio-actions" style="margin-top: 1rem;">
                    <button class="blog-btn" onclick="openProjectModal(${item.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${item.links.live ? `<a href="${item.links.live}" target="_blank" class="blog-btn" style="margin-left: 0.5rem;"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                </div>
            </div>
        `;
        portfolioGrid.appendChild(portfolioItem);
    });

    // Re-trigger animations
    setupScrollAnimations();
}

// Setup portfolio filter buttons
function setupPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.portfolio-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
        });
    });
}

// Filter projects by category
function filterProjects(category) {
    currentFilter = category;

    if (category === 'all') {
        renderPortfolioItems();
    } else {
        const filtered = portfolioItems.filter(item => item.category === category);
        renderPortfolioItems(filtered);
    }

    // Add loading animation
    const portfolioGrid = document.getElementById('portfolioGrid');
    portfolioGrid.style.opacity = '0.5';
    setTimeout(() => {
        portfolioGrid.style.opacity = '1';
    }, 300);
}

// Open project modal
function openProjectModal(projectId) {
    const project = portfolioItems.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    if (!modal) return;

    // Populate modal content
    document.getElementById('projectTitle').textContent = project.title;
    document.getElementById('projectImage').src = project.image;
    document.getElementById('projectImage').alt = project.title;
    document.getElementById('projectDescription').innerHTML = project.description.replace(/\n/g, '<br>');

    // Populate technologies
    const techContainer = document.getElementById('projectTechnologies');
    techContainer.innerHTML = `
        <h3>Technologies Used:</h3>
        <div class="tech-grid">
            ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
    `;

    // Populate project links
    const linksContainer = document.getElementById('projectLinks');
    linksContainer.innerHTML = '';

    if (project.links.live) {
        linksContainer.innerHTML += `
            <a href="${project.links.live}" target="_blank" class="blog-btn">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
        `;
    }

    if (project.links.github) {
        linksContainer.innerHTML += `
            <a href="${project.links.github}" target="_blank" class="blog-btn">
                <i class="fab fa-github"></i> Source Code
            </a>
        `;
    }

    if (project.links.figma) {
        linksContainer.innerHTML += `
            <a href="${project.links.figma}" target="_blank" class="blog-btn">
                <i class="fab fa-figma"></i> View Design
            </a>
        `;
    }

    if (project.links.behance) {
        linksContainer.innerHTML += `
            <a href="${project.links.behance}" target="_blank" class="blog-btn">
                <i class="fab fa-behance"></i> View on Behance
            </a>
        `;
    }

    modal.style.display = 'block';
}

// Close project modal
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeProjectModal();
    }
});

// Add keyboard navigation for modal
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeProjectModal();
    }
});

// Portfolio item hover effects
document.addEventListener('DOMContentLoaded', function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe portfolio items for scroll animations
    setTimeout(() => {
        document.querySelectorAll('.portfolio-item').forEach(item => {
            observer.observe(item);
        });
    }, 100);
});