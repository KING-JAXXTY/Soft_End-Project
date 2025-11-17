# TulongAral+ Scholarship Management System

A comprehensive full-stack scholarship platform designed for Filipino students, connecting them with educational opportunities across the Philippines. The system features three distinct user roles with dedicated dashboards, AI-powered features, and real-time communication capabilities.

## 🌟 Live Demo
**Production:** https://soft-end-project-ten.vercel.app/  
**Status:** Fully Operational

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
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)

---

## Overview

TulongAral+ is an enterprise-grade scholarship management platform that streamlines the entire scholarship lifecycle - from posting opportunities to application submission, review, and certificate generation. Built with modern web technologies and powered by AI, the platform serves students, sponsors, and administrators with role-specific functionality.

### Key Highlights
- **Multi-region Support**: Complete coverage of all 17 Philippine regions with region-specific scholarships
- **AI Integration**: Powered by Google Gemini AI for grammar checking, content moderation, scholarship recommendations, duplicate scholarship detection, and intelligent report analysis
- **Smart Slot Management**: Automatic scholarship slot tracking with real-time availability updates and validation
- **Deadline Management**: Advanced deadline filtering with visual countdown indicators (Today, Tomorrow, X days remaining)
- **Duplicate Detection**: AI-powered duplicate scholarship detection system with 80% similarity threshold to prevent redundant postings
- **Real-time Communication**: Built-in messaging system with AI assistant for student-sponsor interactions
- **Community Forum**: Moderated discussion platform for scholarship-related topics with AI content moderation
- **Digital Certificates**: Automated certificate generation with downloadable PDF/image formats for approved applications
- **Comprehensive Admin Tools**: Advanced user management, content moderation, suspension system, and detailed analytics with override capabilities
- **Customizable Avatars**: 22 unique avatar options with dynamic loading for user personalization
- **Modern Profile Views**: Professional scholarship-themed profile interface with gradient headers and card-based layouts
- **Secure Authentication**: JWT-based authentication with "Remember Me" functionality and session management
- **Responsive Design**: Mobile-first design approach ensuring optimal experience across all devices

---

## Features

### For Students
- **Scholarship Discovery**
  - Browse scholarships by region, institution, type, and amount
  - Advanced filtering (academic, merit-based, need-based, sports, arts, leadership, etc.)
  - AI-powered personalized scholarship recommendations based on profile
  - Interactive scholarship cards with detailed requirements and deadlines
  - Real-time available slots display on all scholarship listings
  - Automatic filtering of expired scholarships from browse page
  - Visual deadline indicators (Today, Tomorrow, X days remaining)
  - Favorites system for bookmarking scholarships
  - Map integration showing scholarship institution locations

- **Application Management**
  - Streamlined application process with cover letter support
  - Google Drive integration for secure document submission
  - Real-time application status tracking (pending, approved, rejected)
  - Automatic validation preventing applications to expired scholarships
  - Automatic validation preventing applications to full scholarships (0 slots)
  - Comprehensive application history with sponsor feedback
  - Application deadline countdown and reminders

- **Communication**
  - Direct messaging with scholarship sponsors
  - AI assistant in messaging for scholarship-related queries
  - Forum participation for community support and networking
  - Report system for inappropriate content or user behavior
  - Real-time notifications for messages and application updates

- **Digital Certificates**
  - Auto-generated digital certificates for approved scholarships
  - Download certificates in PNG and PDF formats with high resolution
  - Shareable certificates for portfolio building
  - Permanent certificate archive in dashboard

- **Profile & Personalization**
  - Customizable profile with 22 unique avatar options
  - Region and institution information management
  - Educational background tracking
  - Application history and statistics
  - Streamlined profile editing without unnecessary navigation elements
  - Auto-populated form fields for easy updates

### For Sponsors (Organizations/Individuals)
- **Scholarship Management**
  - Create and publish scholarship opportunities with detailed information
  - AI-powered duplicate scholarship detection before posting (80% similarity threshold)
  - Set comprehensive eligibility criteria and requirements
  - Define application deadlines, award amounts, and available slots
  - Real-time slot tracking with automatic decrements on approval
  - Edit active scholarships or mark them as closed
  - AI grammar assistance for scholarship descriptions
  - Track scholarship view counts and application rates
  - Dashboard refresh button for real-time data updates

- **Application Review**
  - Comprehensive application review dashboard
  - View and evaluate student applications with all submitted information
  - Direct access to applicants' Google Drive documents
  - Approve or reject applications with detailed feedback notes
  - Automatic slot management (decrease on approve, increase on reject/pending)
  - Validation preventing approval when slots are full
  - Track application statistics and trends
  - Filter applications by status (pending, approved, rejected)

- **Communication**
  - Direct messaging with applicants for clarifications
  - Bulk messaging capabilities for announcement
  - Respond to student inquiries efficiently
  - Access to report system for inappropriate behavior

- **Analytics Dashboard**
  - Real-time application metrics and statistics
  - Monitor scholarship performance and reach
  - Track application deadlines and slots
  - View sponsor activity history
  - Export data for reporting

### For Administrators
- **User Management**
  - View comprehensive list of all users (students, sponsors, admins)
  - Issue formal warnings to users with detailed reasoning
  - Suspend user accounts (temporary or permanent with duration)
  - Delete user accounts with cascade data cleanup
  - View user reports, warnings history, and activity logs
  - View professional user profiles with modern interface
  - Unsuspend users and clear warnings (reclaim action)
  - Advanced user search and filtering

- **Content Moderation**
  - Monitor all scholarships for policy compliance
  - Delete inappropriate or fraudulent scholarships
  - Override deletion restrictions (can delete scholarships with pending applications)
  - Automatic cascade deletion of applications when scholarship is removed
  - Review forum posts and comments
  - Remove policy-violating content
  - View detailed scholarship statistics including available slots

- **Report Management**
  - Review user-submitted reports with complete context
  - AI-powered report analysis for severity assessment
  - Update report status (pending, reviewing, resolved)
  - Take appropriate action on reported content or users
  - Track report trends and common issues
  - View comprehensive report history

- **System Monitoring**
  - Real-time system activity dashboard
  - Track user registration and engagement statistics
  - Monitor application submission trends
  - View scholarship creation patterns
  - Generate system health reports
  - Access audit logs for security compliance

---

## System Architecture

### Frontend Architecture
```
Pages (HTML)
├── Authentication
│   ├── login.html - User login with Remember Me
│   ├── register.html - Registration with avatar selection
│   └── forgot-password.html - Password recovery
├── Dashboards
│   ├── student-dashboard.html - Student portal with AI recommendations
│   ├── sponsor-dashboard.html - Sponsor management portal
│   └── admin-dashboard.html - Admin control panel
├── Core Features
│   ├── student-home.html - Scholarship browsing with filters
│   ├── scholarship-detail.html - Detailed scholarship view with map
│   ├── apply-scholarship.html - Application form with AI assistance
│   ├── messages.html - Messaging with AI assistant
│   ├── forum.html - Community discussions with moderation
│   ├── profile.html - Profile management with avatar editor
│   ├── view-profile.html - Public profile viewer
│   ├── certificate.html - Certificate viewer and downloader
│   └── add-scholarship.html - Scholarship creation form
└── Landing
    └── index.html - Public homepage with features overview
```

### Backend Architecture
```
Server (Node.js/Express)
├── Routes (/api)
│   ├── auth.js - JWT authentication & registration
│   ├── users.js - User CRUD & management
│   ├── scholarships.js - Scholarship operations & favorites
│   ├── applications.js - Application lifecycle management
│   ├── profile.js - User profile operations
│   ├── messages.js - Messaging system
│   ├── forum.js - Forum posts & comments
│   ├── gemini.js - AI proxy for Gemini API
│   ├── reports.js - Report management
│   └── activity.js - System activity tracking
├── Models (Mongoose)
│   ├── User.js - User authentication & profile
│   ├── Scholarship.js - Scholarship data
│   ├── Application.js - Application tracking
│   ├── Message.js - Message data
│   ├── Conversation.js - Conversation threads
│   ├── ForumPost.js - Forum discussions
│   ├── Profile.js - Extended user data
│   └── Report.js - Report submissions
├── Middleware
│   └── auth.js - JWT verification & role-based access
├── Config
│   └── database.js - MongoDB connection with retry logic
└── Utilities
    ├── avatar-migration.js - Avatar system migration script
    └── institution-coordinates.js - Map data for institutions
```

### Database Schema

**Users Collection**
- Authentication credentials (bcrypt hashed passwords)
- Profile information (name, role, avatar, region)
- Account status (warnings count, suspension state, suspension duration)
- Unique ID system (TA-XXXXXXXX format for privacy)
- Timestamps for registration and updates

**Scholarships Collection**
- Scholarship details (title, description, requirements, guidelines)
- Eligibility criteria (region, institution, scholarship type, academic level)
- Application parameters (deadline, award amount, available slots)
- Sponsor reference with population
- Status tracking (active, closed, archived)
- View count and applicant tracking

**Applications Collection**
- Student and scholarship references with cascade deletion
- Cover letter and Google Drive documents link
- Status tracking (pending, approved, rejected)
- Review notes from sponsors
- Certificate information for approved applications
- Timestamps for submission and review

**Messages & Conversations Collections**
- User-to-user messaging system
- Conversation threads with participant tracking
- Message status and read receipts
- Last message tracking for sorting
- Timestamp-based ordering

**Forum Posts Collection**
- Community discussions with title and content
- Author reference with avatar support
- Comments array with nested replies
- View count and engagement metrics
- Moderation flags and timestamps

**Profiles Collection**
- Extended user information
- Contact details (phone, region, province, municipality)
- Student-specific data (GWA, year level, course)
- Sponsor-specific data (organization name)
- Bio and additional information

**Reports Collection**
- User-submitted reports with category
- Report type (user, scholarship, forum post)
- Detailed reasoning and evidence
- Status tracking (pending, reviewing, resolved)
- Admin review notes and actions taken
- AI analysis results

---

## Tech Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom styling with CSS variables, flexbox, and grid
- **Vanilla JavaScript**: Pure ES6+ with no frameworks (modular architecture)
- **SVG Icons**: Custom icon system for performance
- **Leaflet.js**: Interactive maps for scholarship locations
- **html2canvas & html2pdf**: Certificate generation and download

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
POST   /api/gemini/check-duplicate - Check for duplicate scholarships
```

---

## Recent Updates

### Slot Management System
- Automatic slot tracking for all scholarships
- Real-time slot decrements when applications are approved
- Slot increments when changing from approved to pending/rejected
- Validation preventing approvals when slots reach zero
- Display of available slots on all scholarship views

### Deadline Management
- Automatic filtering of expired scholarships from student browse page
- Visual deadline indicators (Today, Tomorrow, X days remaining)
- Backend and frontend validation preventing applications to expired scholarships
- Countdown display on scholarship detail pages

### AI Duplicate Detection
- Pre-submission scholarship duplicate checking using Gemini AI
- 80% similarity threshold for duplicate detection
- Compares title, type, description, eligibility, benefits, requirements, region, institution, and amount
- Round-robin API key usage for rate limit management
- Warning system with option to proceed or cancel

### Admin Enhancements
- Override capability to delete scholarships with pending applications
- Cascade deletion of applications when admin removes scholarship
- Improved error messages with detailed feedback
- Enhanced scholarship list display with slot information

### Profile Improvements
- Removed redundant back button from profile page
- Auto-populated form fields showing current user data
- Improved profile data loading with error handling
- Streamlined editing experience with Cancel button only

### Modern Profile Views
- Professional gradient header with scholarship theme colors
- Card-based information layout with hover effects
- Icon-based section headers for better visual hierarchy
- Improved text visibility with white text on blue backgrounds
- Mobile-responsive design with proper breakpoints
- Enhanced badge visibility for role indicators

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
- Contact: ANDREWCADITAN616@GMAIL.COM

---

## Acknowledgments

- Google Gemini AI for AI capabilities
- MongoDB Atlas for database hosting
- Vercel for deployment platform
- Filipino students and educational institutions for inspiration

---

TulongAral+ - Empowering Filipino Students Through Technology
