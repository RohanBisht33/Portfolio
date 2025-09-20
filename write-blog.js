document.getElementById('blogForm').addEventListener('submit', function (e) {
    e.preventDefault();
    fetch('http://localhost:3000/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById('title').value,
            content: document.getElementById('content').value
        })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('message').textContent = 'Blog posted!';
            document.getElementById('blogForm').reset();
        })
        .catch(() => document.getElementById('message').textContent = 'Error posting blog.');
});
