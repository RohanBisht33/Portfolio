document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/projects')
        .then(res => res.json())
        .then(projects => {
            const container = document.getElementById('projectsFeed');
            projects.forEach(project => {
                const div = document.createElement('div');
                div.className = 'project-item';
                div.innerHTML = `<h3>${project.title}</h3>
                         <p>${project.description}</p>
                         <a href="${project.url}" target="_blank">View</a>`;
                container.appendChild(div);
            });
        });
});
