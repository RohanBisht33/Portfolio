document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/blogs')
        .then(res => res.json())
        .then(blogs => {
            const container = document.getElementById('blogFeed');
            blogs.forEach(blog => {
                const div = document.createElement('div');
                div.className = 'blog-post';
                div.innerHTML = `<h2>${blog.title}</h2>
                         <p>${blog.content}</p>
                         <small>${new Date(blog.date).toLocaleString()}</small>`;
                container.appendChild(div);
            });
        });
});
