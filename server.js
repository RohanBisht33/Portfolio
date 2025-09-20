const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from root directory
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// MongoDB connection with better error handling
async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/portfolio', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB successfully');
        console.log('📍 Database: portfolio');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('💡 Make sure MongoDB is running on localhost:27017');
        console.error('💡 You can start MongoDB with: sudo systemctl start mongod');
        process.exit(1);
    }
}

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required'],
        minlength: [10, 'Content must be at least 10 characters long']
    },
    author: {
        type: String,
        default: 'Rohan Bisht'
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    image: {
        type: String,
        default: null
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    comments: [{
        author: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

// Project Schema
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        minlength: [10, 'Description must be at least 10 characters long']
    },
    technologies: [{
        type: String,
        trim: true
    }],
    githubUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || v.includes('github.com');
            },
            message: 'Please provide a valid GitHub URL'
        }
    },
    liveUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return true;
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Please provide a valid URL'
        }
    },
    image: {
        type: String,
        required: [true, 'Project image is required']
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: {
            values: ['completed', 'in-progress', 'planning'],
            message: 'Status must be one of: completed, in-progress, planning'
        },
        default: 'completed'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Blog = mongoose.model('Blog', blogSchema);
const Project = mongoose.model('Project', projectSchema);

// Helper function to handle async routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Blog Routes
app.get('/api/blogs', asyncHandler(async (req, res) => {
    console.log('📖 GET /api/blogs - Fetching blogs');

    try {
        const { featured, limit, search } = req.query;
        let query = {};

        if (featured === 'true') {
            query.featured = true;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        let blogsQuery = Blog.find(query).sort({ date: -1 });

        if (limit) {
            blogsQuery = blogsQuery.limit(parseInt(limit));
        }

        const blogs = await blogsQuery;
        console.log(`✅ Found ${blogs.length} blogs`);

        res.status(200).json(blogs);
    } catch (error) {
        console.error('❌ Error fetching blogs:', error);
        res.status(500).json({
            error: 'Failed to fetch blogs',
            message: error.message
        });
    }
}));

app.get('/api/blogs/:id', asyncHandler(async (req, res) => {
    console.log(`📖 GET /api/blogs/${req.params.id} - Fetching specific blog`);

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            console.log('❌ Blog not found');
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        console.log('✅ Blog found and view count updated');
        res.status(200).json(blog);
    } catch (error) {
        console.error('❌ Error fetching blog:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }
        res.status(500).json({
            error: 'Failed to fetch blog',
            message: error.message
        });
    }
}));

app.post('/api/blogs', upload.single('image'), asyncHandler(async (req, res) => {
    console.log('📝 POST /api/blogs - Creating new blog');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file ? req.file.filename : 'No file');

    try {
        const blogData = {
            title: req.body.title,
            content: req.body.content,
            featured: req.body.featured === 'true',
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };

        if (req.file) {
            blogData.image = `/uploads/${req.file.filename}`;
        }

        console.log('Creating blog with data:', blogData);
        const newBlog = new Blog(blogData);
        const savedBlog = await newBlog.save();

        console.log('✅ Blog created successfully:', savedBlog._id);
        res.status(201).json(savedBlog);
    } catch (error) {
        console.error('❌ Error creating blog:', error);

        // Delete uploaded file if blog creation fails
        if (req.file) {
            fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                messages: validationErrors
            });
        }

        res.status(500).json({
            error: 'Failed to create blog',
            message: error.message
        });
    }
}));

app.put('/api/blogs/:id/like', asyncHandler(async (req, res) => {
    console.log(`👍 PUT /api/blogs/${req.params.id}/like - Liking blog`);

    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        console.log('✅ Blog liked successfully');
        res.status(200).json(blog);
    } catch (error) {
        console.error('❌ Error liking blog:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }
        res.status(500).json({
            error: 'Failed to like blog',
            message: error.message
        });
    }
}));

app.post('/api/blogs/:id/comment', asyncHandler(async (req, res) => {
    console.log(`💬 POST /api/blogs/${req.params.id}/comment - Adding comment`);

    try {
        const { author, content } = req.body;

        if (!author || !content) {
            return res.status(400).json({
                error: 'Author and content are required for comments'
            });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        blog.comments.push({
            author: author.trim(),
            content: content.trim()
        });

        const savedBlog = await blog.save();
        console.log('✅ Comment added successfully');
        res.status(200).json(savedBlog);
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }
        res.status(500).json({
            error: 'Failed to add comment',
            message: error.message
        });
    }
}));

// Project Routes
app.get('/api/projects', asyncHandler(async (req, res) => {
    console.log('🚀 GET /api/projects - Fetching projects');

    try {
        const { featured, limit, status } = req.query;
        let query = {};

        if (featured === 'true') {
            query.featured = true;
        }

        if (status) {
            query.status = status;
        }

        let projectsQuery = Project.find(query).sort({ date: -1 });

        if (limit) {
            projectsQuery = projectsQuery.limit(parseInt(limit));
        }

        const projects = await projectsQuery;
        console.log(`✅ Found ${projects.length} projects`);

        res.status(200).json(projects);
    } catch (error) {
        console.error('❌ Error fetching projects:', error);
        res.status(500).json({
            error: 'Failed to fetch projects',
            message: error.message
        });
    }
}));

app.get('/api/projects/:id', asyncHandler(async (req, res) => {
    console.log(`🚀 GET /api/projects/${req.params.id} - Fetching specific project`);

    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            console.log('❌ Project not found');
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log('✅ Project found');
        res.status(200).json(project);
    } catch (error) {
        console.error('❌ Error fetching project:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        res.status(500).json({
            error: 'Failed to fetch project',
            message: error.message
        });
    }
}));

app.post('/api/projects', upload.single('image'), asyncHandler(async (req, res) => {
    console.log('🚀 POST /api/projects - Creating new project');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file ? req.file.filename : 'No file');

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Project image is required' });
        }

        const projectData = {
            title: req.body.title,
            description: req.body.description,
            technologies: req.body.technologies ? req.body.technologies.split(',').map(tech => tech.trim()).filter(tech => tech) : [],
            githubUrl: req.body.githubUrl || '',
            liveUrl: req.body.liveUrl || '',
            image: `/uploads/${req.file.filename}`,
            featured: req.body.featured === 'true',
            status: req.body.status || 'completed'
        };

        console.log('Creating project with data:', projectData);
        const newProject = new Project(projectData);
        const savedProject = await newProject.save();

        console.log('✅ Project created successfully:', savedProject._id);
        res.status(201).json(savedProject);
    } catch (error) {
        console.error('❌ Error creating project:', error);

        // Delete uploaded file if project creation fails
        if (req.file) {
            fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                messages: validationErrors
            });
        }

        res.status(500).json({
            error: 'Failed to create project',
            message: error.message
        });
    }
}));

// Delete routes
app.delete('/api/blogs/:id', asyncHandler(async (req, res) => {
    console.log(`🗑️ DELETE /api/blogs/${req.params.id} - Deleting blog`);

    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Delete associated image if exists
        if (blog.image && fs.existsSync(path.join(__dirname, blog.image))) {
            fs.unlinkSync(path.join(__dirname, blog.image));
            console.log('✅ Associated image deleted');
        }

        console.log('✅ Blog deleted successfully');
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting blog:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }
        res.status(500).json({
            error: 'Failed to delete blog',
            message: error.message
        });
    }
}));

app.delete('/api/projects/:id', asyncHandler(async (req, res) => {
    console.log(`🗑️ DELETE /api/projects/${req.params.id} - Deleting project`);

    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete associated image if exists
        if (project.image && fs.existsSync(path.join(__dirname, project.image))) {
            fs.unlinkSync(path.join(__dirname, project.image));
            console.log('✅ Associated image deleted');
        }

        console.log('✅ Project deleted successfully');
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting project:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        res.status(500).json({
            error: 'Failed to delete project',
            message: error.message
        });
    }
}));

// Serve HTML pages
app.get('/', (req, res) => {
    console.log('🏠 GET / - Serving homepage');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/blog', (req, res) => {
    console.log('📖 GET /blog - Serving blog page');
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/projects', (req, res) => {
    console.log('🚀 GET /projects - Serving projects page');
    res.sendFile(path.join(__dirname, 'projects.html'));
});

app.get('/write-blog', (req, res) => {
    console.log('📝 GET /write-blog - Serving write blog page');
    res.sendFile(path.join(__dirname, 'write-blog.html'));
});

app.get('/add-project', (req, res) => {
    console.log('🚀 GET /add-project - Serving add project page');
    res.sendFile(path.join(__dirname, 'add-project.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Multer error handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('❌ Multer error:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    }

    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
    }

    next(err);
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
    try {
        await connectToMongoDB();

        app.listen(PORT, () => {
            console.log('🌟 =====================================');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('🌟 =====================================');
            console.log('📱 Available routes:');
            console.log(`   🏠 Homepage: http://localhost:${PORT}/`);
            console.log(`   📖 Blog: http://localhost:${PORT}/blog`);
            console.log(`   🚀 Projects: http://localhost:${PORT}/projects`);
            console.log(`   📝 Write Blog: http://localhost:${PORT}/write-blog`);
            console.log(`   ➕ Add Project: http://localhost:${PORT}/add-project`);
            console.log('🌟 =====================================');
            console.log('📊 API endpoints:');
            console.log(`   ✅ Health: http://localhost:${PORT}/api/health`);
            console.log(`   📖 Blogs: http://localhost:${PORT}/api/blogs`);
            console.log(`   🚀 Projects: http://localhost:${PORT}/api/projects`);
            console.log('🌟 =====================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});

startServer();