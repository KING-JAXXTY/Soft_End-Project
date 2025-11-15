# TulongAral+ Scholarship Management System

A comprehensive full-stack scholarship platform designed for Filipino students, connecting them with educational opportunities across the Philippines. The system features three distinct user roles with dedicated dashboards and functionality.

## Live Demo
Deployed on Vercel: [TulongAral+ Platform](https://your-vercel-url.vercel.app)

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)

---

## Overview

TulongAral+ is a scholarship management platform that facilitates the entire scholarship lifecycle - from posting opportunities to application submission and review. The system incorporates AI-powered features for enhanced user experience and administrative efficiency.

### Key Highlights
- **Multi-region Support**: Covers 17 Philippine regions with region-specific scholarships
- **AI Integration**: Gemini AI for grammar checking, content moderation, and report analysis
- **Real-time Communication**: Built-in messaging system between students and sponsors
- **Community Forum**: Moderated discussion platform for scholarship-related topics
- **Digital Certificates**: Automated certificate generation for approved applications
- **Comprehensive Admin Tools**: User management, content moderation, and system monitoring

---

## Features

### For Students
- **Scholarship Discovery**
  - Browse scholarships by region, institution, and type
  - Advanced filtering (academic, merit-based, need-based, sports, etc.)
  - AI-powered scholarship recommendations
  - Scholarship details with requirements and deadlines

- **Application Management**
  - Apply for scholarships with cover letters
  - Google Drive integration for document submission
  - Track application status in real-time
  - View application history and feedback

- **Communication**
  - Direct messaging with scholarship sponsors
  - Forum participation for community support
  - Report system for inappropriate content

- **Certificates**
  - Download digital certificates for approved scholarships
  - PNG and PDF format options

### For Sponsors (Organizations/Individuals)
- **Scholarship Management**
  - Create and publish scholarship opportunities
  - Set eligibility criteria and requirements
  - Define application deadlines and available slots
  - Edit or close scholarships

- **Application Review**
  - View and evaluate student applications
  - Access Google Drive documents
  - Approve or reject applications with feedback
  - Track application statistics

- **Communication**
  - Message applicants directly
  - Respond to inquiries
  - Report system access

- **Dashboard Analytics**
  - View application metrics
  - Monitor scholarship performance
  - Track deadlines

### For Administrators
- **User Management**
  - View all users (students, sponsors, admins)
  - Issue warnings to users
  - Suspend users (temporary or permanent)
  - Delete user accounts
  - View user reports and history

- **Scholarship Oversight**
  - Monitor all scholarships
  - Delete inappropriate scholarships
  - View scholarship statistics

- **Report Management**
  - Review user-submitted reports
  - AI-powered report analysis
  - Update report status
  - Take action on reported content

- **System Monitoring**
  - View system activity logs
  - Track user statistics
  - Monitor application trends

---

## System Architecture

### Frontend Architecture
```
Pages (HTML)
├── Authentication
│   ├── login.html - User authentication
│   ├── register.html - New user registration
│   └── forgot-password.html - Password recovery
├── Dashboards
│   ├── student-dashboard.html - Student portal
│   ├── sponsor-dashboard.html - Sponsor portal
│   └── admin-dashboard.html - Admin panel
├── Features
│   ├── scholarship-detail.html - Scholarship information
│   ├── apply-scholarship.html - Application form
│   ├── messages.html - Messaging interface
│   ├── forum.html - Community forum
│   ├── profile.html - User profile management
│   └── certificate.html - Certificate viewer
└── Landing
    └── index.html - Public homepage
```

### Backend Architecture
```
Server (Node.js/Express)
├── Routes
│   ├── auth.js - Authentication & authorization
│   ├── users.js - User management
│   ├── scholarships.js - Scholarship CRUD operations
│   ├── applications.js - Application handling
│   ├── messages.js - Messaging system
│   ├── forum.js - Forum operations
│   ├── profile.js - Profile management
│   ├── reports.js - Report system
│   ├── gemini.js - AI integration proxy
│   └── activity.js - System activity tracking
├── Models (Mongoose)
│   ├── User.js - User schema
│   ├── Scholarship.js - Scholarship schema
│   ├── Application.js - Application schema
│   ├── Message.js - Message schema
│   ├── Conversation.js - Conversation schema
│   ├── ForumPost.js - Forum post schema
│   ├── Profile.js - User profile schema
│   └── Report.js - Report schema
├── Middleware
│   └── auth.js - JWT authentication
└── Config
    └── database.js - MongoDB connection
```

### Database Schema

**Users Collection**
- Authentication credentials (email, password)
- Profile information (name, role, region)
- Account status (warnings, suspension)
- Unique ID system (TA-XXXXXXXX format)

**Scholarships Collection**
- Scholarship details (title, description, requirements)
- Eligibility criteria (region, institution, type)
- Application parameters (deadline, slots)
- Sponsor reference

**Applications Collection**
- Student and scholarship references
- Cover letter and documents link
- Status tracking (pending, approved, rejected)
- Timestamps

**Messages & Conversations Collections**
- User-to-user messaging
- Conversation threads
- Message status tracking

**Forum Posts Collection**
- Community discussions
- User engagement (views, comments)
- Content moderation

**Reports Collection**
- User-submitted reports
- Report status and admin notes
- Related user/content references

---

## Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **SVG Icons**: Custom icon system

### Backend
- **Node.js** (v14+): Server runtime
- **Express.js**: Web framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **Multer**: File upload handling
- **node-fetch**: HTTP requests

### Third-Party APIs
- **Google Gemini AI**: Grammar checking and content analysis
  - Model: gemini-2.0-flash
  - Features: Text generation, content moderation
  - Round-robin API key rotation for rate limit management

### Development Tools
- **Git**: Version control
- **dotenv**: Environment variable management
- **Nodemon**: Development server

### Deployment
- **Vercel**: Serverless deployment platform
- **MongoDB Atlas**: Production database

---

## User Roles

### Student
- Browse and search scholarships
- Submit applications
- Message sponsors
- Participate in forums
- Download certificates
- Cannot delete own account while having pending applications

### Sponsor
- Create scholarships
- Review applications
- Message applicants
- Manage scholarship listings
- Can delete account (scholarships will be removed)

### Administrator
- Full system access
- User management (warn, suspend, delete)
- Content moderation
- Report resolution
- System monitoring
- Cannot delete own admin account (security measure)

---

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git
- Code editor (VS Code recommended)

### Local Development Setup

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/tulongaral-scholarship-system.git
cd tulongaral-scholarship-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tulongaral?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRE=7d

# File Upload Settings
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Gemini AI API Keys (for round-robin load distribution)
GEMINI_API_KEY=your_first_gemini_api_key
GEMINI_API_KEY_2=your_second_gemini_api_key
```

4. **Create Upload Directories**
```bash
mkdir -p uploads/profiles uploads/scholarships uploads/applications uploads/messages
```

5. **Start Development Server**
```bash
npm start
```

6. **Access the Application**
- Open browser to `http://localhost:5000`
- Register an account
- Login and explore features

### Database Setup

1. **MongoDB Atlas Configuration**
   - Create a cluster on MongoDB Atlas
   - Create database user with read/write permissions
   - Get connection string
   - Whitelist your IP address (or 0.0.0.0/0 for development)

2. **Collections** (Auto-created by Mongoose)
   - users
   - scholarships
   - applications
   - messages
   - conversations
   - forumposts
   - profiles
   - reports

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRE` | JWT token expiration | No | 7d |
| `MAX_FILE_SIZE` | Maximum upload file size (bytes) | No | 5242880 (5MB) |
| `UPLOAD_PATH` | File upload directory | No | ./uploads |
| `GEMINI_API_KEY` | Primary Gemini AI API key | Yes | - |
| `GEMINI_API_KEY_2` | Secondary Gemini AI API key | Yes | - |

---

## Deployment

### Vercel Deployment

1. **Prepare for Deployment**
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Login: `vercel login`
   - Deploy: `vercel --prod`

3. **Configure Environment Variables**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all variables from `.env`

4. **Important Notes**
   - File uploads are stored temporarily (serverless limitations)
   - For production, consider using cloud storage (AWS S3, Cloudinary)
   - MongoDB Atlas must allow Vercel IP ranges

### Traditional Server Deployment

For traditional hosting:
```bash
# Set environment to production
NODE_ENV=production

# Use process manager
npm install -g pm2
pm2 start server.js --name tulongaral
pm2 save
pm2 startup
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - User login
POST   /api/auth/verify-account - Verify user account
POST   /api/auth/reset-password - Reset forgotten password
```

### Users
```
GET    /api/users/me           - Get current user profile
GET    /api/users              - Get all users (admin)
GET    /api/users/:id          - Get user by ID (admin)
DELETE /api/users/:id          - Delete user (admin)
PUT    /api/users/:id/suspend  - Suspend user (admin)
POST   /api/users/:id/warn     - Issue warning (admin)
DELETE /api/users/:id/warnings - Remove all warnings (admin)
```

### Scholarships
```
GET    /api/scholarships       - List all scholarships
GET    /api/scholarships/:id   - Get scholarship details
POST   /api/scholarships       - Create scholarship (sponsor)
PUT    /api/scholarships/:id   - Update scholarship (sponsor)
DELETE /api/scholarships/:id   - Delete scholarship (sponsor/admin)
GET    /api/scholarships/sponsor/my - Get sponsor's scholarships
```

### Applications
```
GET    /api/applications       - List all applications
GET    /api/applications/:id   - Get application details
POST   /api/applications       - Submit application (student)
PUT    /api/applications/:id/status - Update application status (sponsor)
GET    /api/applications/student/my - Get student's applications
GET    /api/applications/scholarship/:id - Get scholarship applications
```

### Messages
```
GET    /api/messages/conversations - Get user's conversations
GET    /api/messages/conversation/:userId - Get conversation with user
POST   /api/messages           - Send message
PUT    /api/messages/:id/read  - Mark message as read
```

### Forum
```
GET    /api/forum/posts        - List forum posts
GET    /api/forum/posts/:id    - Get post details
POST   /api/forum/posts        - Create post
PUT    /api/forum/posts/:id    - Update post
DELETE /api/forum/posts/:id    - Delete post
POST   /api/forum/posts/:id/comments - Add comment
```

### Reports
```
GET    /api/reports            - List all reports (admin)
GET    /api/reports/:id        - Get report details (admin)
POST   /api/reports            - Submit report
PUT    /api/reports/:id        - Update report status (admin)
GET    /api/reports/user/:id   - Get reports for user (admin)
```

### Gemini AI
```
POST   /api/gemini/generate    - Generate AI response (proxied)
```

---

## Contributing

This is a capstone/thesis project. For inquiries or suggestions, please contact the development team.

---

## License

This project is developed as an academic requirement. All rights reserved.

---

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

## Acknowledgments

- **Google Gemini AI** for AI capabilities
- **MongoDB Atlas** for database hosting
- **Vercel** for deployment platform
- Filipino students and educational institutions for inspiration

---

**TulongAral+** - Empowering Filipino Students Through Technology
