# Rohan Bisht Portfolio & Blog

A full-stack portfolio website with integrated blog and project management system built with Node.js, Express, and MongoDB.

## Features

- **Portfolio Website**: Showcase your skills, projects, and experience
- **Dynamic Blog System**: Write, publish, and manage blog posts with images
- **Project Management**: Upload and display your projects with live demos
- **Responsive Design**: Works perfectly on all devices
- **Image Upload**: Support for project and blog images
- **Comments System**: Interactive comments on blog posts
- **Search & Filter**: Find content easily with search and filtering
- **Admin Features**: Manage your content with ease

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for handling images
- **Styling**: Custom CSS with modern design

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)
- [Git](https://git-scm.com/) (optional, for version control)

## Installation & Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone <https://github.com/RohanBisht33/My_Portfolio.git>
cd rohan-bisht-portfolio

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose 
- cors
- multer
- nodemon (for development)

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**macOS/Linux:**
```bash
# Start MongoDB
sudo systemctl start mongod
# or
brew services start mongodb/brew/mongodb-community
```

### 4. Start the Application

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The application will start on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to:
- **Homepage**: `http://localhost:3000/`
- **Blog**: `http://localhost:3000/blog`
- **Projects**: `http://localhost:3000/projects`
- **Write Blog**: `http://localhost:3000/write-blog`
- **Add Project**: `http://localhost:3000/add-project`

## Project Structure

```
portfolio/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── uploads/               # Directory for uploaded images
├── index.html            # Homepage
├── blog.html             # Blog listing page
├── projects.html         # Projects listing page
├── write-blog.html       # Blog creation form
├── add-project.html      # Project creation form
├── styles.css            # Main stylesheet
├── script.js             # Homepage JavaScript
├── blog.js               # Blog page JavaScript
├── projects.js           # Projects page JavaScript
├── write-blog.js         # Blog form JavaScript
├── add-project.js        # Project form JavaScript
└── README.md             # This file
```

## API Endpoints

### Blog Endpoints
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get specific blog
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id/like` - Like a blog
- `POST /api/blogs/:id/comment` - Add comment to blog
- `DELETE /api/blogs/:id` - Delete blog

### Project Endpoints
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `DELETE /api/projects/:id` - Delete project

## Usage Guide

### Writing Your First Blog Post

1. Navigate to `http://localhost:3000/write-blog`
2. Fill in the blog title and content
3. Optionally add an image and tags
4. Use the preview feature to see how it looks
5. Click "Publish Blog" to save

### Adding Your First Project

1. Navigate to `http://localhost:3000/add-project`
2. Enter project title and description
3. Upload a project image (required)
4. Add technologies used
5. Include GitHub and live demo URLs
6. Set project status and featured flag
7. Click "Add Project" to save

### Customization

#### Updating Personal Information

1. **Name & Title**: Update in `index.html`, navigation, and page headers
2. **Contact Information**: Modify links in `index.html` contact section
3. **Skills**: Update the skills section in `script.js`
4. **Colors**: Modify CSS variables in `styles.css` `:root` section

#### Adding New Sections

1. Add HTML structure to `index.html`
2. Add corresponding styles in `styles.css`
3. Add JavaScript functionality in `script.js`

## Database Schema

### Blog Schema
```javascript
{
  title: String (required),
  content: String (required),
  author: String (default: 'Rohan Bisht'),
  featured: Boolean (default: false),
  tags: [String],
  image: String,
  likes: Number (default: 0),
  views: Number (default: 0),
  comments: [{
    author: String,
    content: String,
    date: Date
  }],
  date: Date (default: now)
}
```

### Project Schema
```javascript
{
  title: String (required),
  description: String (required),
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  image: String (required),
  featured: Boolean (default: false),
  status: String (enum: completed|in-progress|planning),
  date: Date (default: now)
}
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: MongoDB connection error
```
**Solution**: Ensure MongoDB is running and accessible on `localhost:27017`

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Change port in `server.js` or kill the process using port 3000

**3. File Upload Issues**
```
Error: Multer error
```
**Solution**: Ensure the `uploads/` directory exists and has write permissions

**4. CSS Not Loading**
**Solution**: Clear browser cache and ensure `styles.css` is in the root directory

### Development Tips

1. **Hot Reloading**: Use `npm run dev` for automatic server restart on changes
2. **Database Viewer**: Use MongoDB Compass to view your database
3. **Browser DevTools**: Use F12 to debug JavaScript and network issues
4. **Log Debugging**: Check console logs for server and client-side errors

## Deployment

### Local Network Access

To access from other devices on your network:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Update server.js to listen on all interfaces:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
       console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```

3. Access from other devices using `http://YOUR-LOCAL-IP:3000`

### Production Deployment

For production deployment, consider:
- Using environment variables for configuration
- Setting up a reverse proxy (nginx)
- Using PM2 for process management
- Implementing proper error handling
- Adding security middleware
- Using a cloud MongoDB service

## Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues:

1. Check this README for troubleshooting tips
2. Ensure all prerequisites are installed correctly
3. Check the browser console for client-side errors
4. Check the terminal for server-side errors
5. Verify MongoDB is running and accessible

## Future Enhancements

- User authentication system
- Rich text editor for blog posts
- Email notifications for comments
- SEO optimization
- Analytics dashboard
- Content management admin panel
- Social media integration
- Newsletter subscription