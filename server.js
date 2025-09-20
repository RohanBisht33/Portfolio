const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your_secure_admin_password_2024!';

// Middleware to check admin authentication
const checkAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication required. Only the site administrator can perform this action.'
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Simple token validation (you can enhance this with JWT later)
    if (token !== ADMIN_PASSWORD) {
        return res.status(401).json({
            error: 'Invalid credentials. Only the site administrator can perform this action.'
        });
    }

    next();
};

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1000, height: 600, crop: 'limit', quality: 'auto' }
        ]
    }
});

// Configure multer with Cloudinary storage
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
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
        type: String, // This will now store Cloudinary URLs
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
        trim: true
    },
    liveUrl: {
        type: String,
        trim: true
    },
    image: {
        type: String, // This will now store Cloudinary URLs
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

// Helper function
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Authentication route
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({
            success: true,
            token: ADMIN_PASSWORD,
            message: 'Authentication successful'
        });
    } else {
        res.status(401).json({
            error: 'Invalid password'
        });
    }
});

// Blog Routes (READ access for everyone)
app.get('/api/blogs', asyncHandler(async (req, res) => {
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
    res.status(200).json(blogs);
}));

app.get('/api/blogs/:id', asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json(blog);
}));

// Blog CREATE route (ADMIN ONLY)
app.post('/api/blogs', checkAdminAuth, upload.single('image'), asyncHandler(async (req, res) => {
    console.log('Creating new blog (admin authenticated)');
    console.log('File uploaded:', req.file ? 'Yes' : 'No');

    const blogData = {
        title: req.body.title,
        content: req.body.content,
        featured: req.body.featured === 'true',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    // If image was uploaded, Cloudinary URL is in req.file.path
    if (req.file) {
        blogData.image = req.file.path;
        console.log('Image URL:', req.file.path);
    }

    const newBlog = new Blog(blogData);
    const savedBlog = await newBlog.save();

    console.log('Blog created successfully:', savedBlog._id);
    res.status(201).json(savedBlog);
}));

// Blog interaction routes (PUBLIC access for likes and comments)
app.put('/api/blogs/:id/like', asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true }
    );

    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }

    res.status(200).json(blog);
}));

app.post('/api/blogs/:id/comment', asyncHandler(async (req, res) => {
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
    res.status(200).json(savedBlog);
}));

// Project Routes (READ access for everyone)
app.get('/api/projects', asyncHandler(async (req, res) => {
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
    res.status(200).json(projects);
}));

app.get('/api/projects/:id', asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
}));

// Project CREATE route (ADMIN ONLY)
app.post('/api/projects', checkAdminAuth, upload.single('image'), asyncHandler(async (req, res) => {
    console.log('Creating new project (admin authenticated)');
    console.log('File uploaded:', req.file ? 'Yes' : 'No');

    if (!req.file) {
        return res.status(400).json({ error: 'Project image is required' });
    }

    const projectData = {
        title: req.body.title,
        description: req.body.description,
        technologies: req.body.technologies ? req.body.technologies.split(',').map(tech => tech.trim()).filter(tech => tech) : [],
        githubUrl: req.body.githubUrl || '',
        liveUrl: req.body.liveUrl || '',
        image: req.file.path, // Cloudinary URL
        featured: req.body.featured === 'true',
        status: req.body.status || 'completed'
    };

    console.log('Project image URL:', req.file.path);

    const newProject = new Project(projectData);
    const savedProject = await newProject.save();

    console.log('Project created successfully:', savedProject._id);
    res.status(201).json(savedProject);
}));

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});

app.get('/write-blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'write-blog.html'));
});

app.get('/add-project', (req, res) => {
    res.sendFile(path.join(__dirname, 'add-project.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Error handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    }

    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
    }

    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log('📸 Cloudinary configured for image uploads');
            console.log('🔐 Admin authentication enabled');
            console.log(`🔑 Admin password: ${ADMIN_PASSWORD}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();