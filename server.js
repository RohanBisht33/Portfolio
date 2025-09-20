const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

mongoose.connect('mongodb://localhost:27017/portfolio', { useNewUrlParser: true, useUnifiedTopology: true });

const Blog = mongoose.model('Blog', {
    title: String, content: String, date: Date
});
const Project = mongoose.model('Project', {
    title: String, description: String, url: String
});

app.use(cors());
app.use(bodyParser.json());

app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
});
app.post('/api/blogs', async (req, res) => {
    const newBlog = new Blog({ ...req.body, date: new Date() });
    await newBlog.save();
    res.json(newBlog);
});
app.get('/api/projects', async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});
app.post('/api/projects', async (req, res) => {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
});

app.listen(3000, () => console.log('API running on port 3000'));
