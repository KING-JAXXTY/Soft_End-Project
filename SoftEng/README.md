
# TulongAral+ - Scholarship Management System

A comprehensive web-based platform connecting Filipino students with scholarship opportunities through an intelligent matching system, real-time messaging, and AI-powered assistance.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Digital Certificate System](#digital-certificate-system)
4. [Tech Stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Environment Setup](#environment-setup)
8. [Running the Application](#running-the-application)
9. [User Roles](#user-roles)
10. [API Documentation](#api-documentation)
11. [File Structure](#file-structure)
12. [Mobile Responsive](#mobile-responsive)
13. [Database Schema](#database-schema)
14. [Security Features](#security-features)
15. [Contributing](#contributing)
16. [Troubleshooting](#troubleshooting)
17. [MongoDB Data Management](#mongodb-data-management)
18. [License](#license)
19. [Acknowledgments](#acknowledgments)
20. [Support](#support)
21. [Production Deployment](#production-deployment)

---
## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [File Structure](#-file-structure)
- [Mobile Responsive](#-mobile-responsive)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---
## Overview


TulongAral+ is a production-ready scholarship management platform designed specifically for the Filipino education ecosystem. The system bridges the gap between students seeking financial aid and sponsors/institutions offering scholarships through:

- **Intelligent Matching**: Location-based and criteria-based scholarship recommendations
- **Real-time Communication**: Direct messaging between students and sponsors
- **AI Assistant**: Gemini-powered chatbot for scholarship guidance
- **Community Forum**: Discussion platform for students and sponsors
- **Application Tracking**: Complete lifecycle management of scholarship applications

**Why TulongAral+?**
- Centralized scholarship discovery
- AI-powered personalized recommendations
- Direct sponsor-student communication
- Fully responsive mobile design
- Enterprise-grade security
- Geographic scholarship mapping

---

## Digital Certificate System

TulongAral+ automatically generates a professional digital certificate for every approved scholarship application. Students can view, download (PDF/JPG), print, and share their certificate directly from their dashboard.

**Key Features:**
- Auto-generated certificate upon sponsor approval
- Includes student name, scholarship details, sponsor, amount, and approval date
- Unique certificate ID for verification (format: CERT-{timestamp}-{appId-last6})
- Download as PDF or JPG (print-ready)
- Share and print options
- Always accessible from student dashboard
- Fully responsive and mobile-friendly

**How it Works:**
1. Student applies for a scholarship
2. Sponsor reviews and approves the application
3. Student receives a popup notification and can view/download their certificate
4. Certificate is always available via the "View Certificate" button on approved applications

**Technical Details:**
- Certificate data is stored in the Application model (`certificateId`, `certificateGenerated`, `certificateGeneratedAt`)
- Certificate is rendered using `js/certificate.js` and can be exported as PDF (html2pdf.js) or JPG (html2canvas)
- Verification is possible using the unique certificate ID
- Only approved applications generate certificates; access is restricted to the student, sponsor, and admins

For full technical documentation, see `CERTIFICATE_SYSTEM.md`.

---

## Features

### For Students

- **Scholarship Discovery**
  - Browse all available scholarships with advanced filtering
  - Interactive map showing scholarship locations
  - Search by region, type, amount, and deadline
  - Personalized recommendations based on profile

- **Application Management**
  - Apply to multiple scholarships
  - Upload required documents (PDF, DOC, images)
  - Track application status in real-time
  - Receive notifications on application updates

- **Profile System**
  - Complete student profile with academic information
  - Location-based matching with institutions
  - Avatar upload and customization
  - Application history and statistics

- **Communication**
  - Direct messaging with scholarship sponsors
  - AI assistant for scholarship queries
  - Community forum participation
  - Real-time notifications

### For Sponsors

- **Scholarship Management**
  - Create and publish scholarships
  - Set eligibility criteria and requirements
  - Upload supporting documents and guidelines
  - Manage application slots and deadlines

- **Application Review**
  - Review incoming applications
  - Download student documents
  - Accept or reject applications
  - Direct communication with applicants

- **Dashboard Analytics**
  - View scholarship statistics
  - Track application metrics
  - Monitor active scholarships
  - Manage approved students

- **Profile & Branding**
  - Organization profile with description
  - Logo/avatar upload
  - Contact information management

### For Administrators

- **User Management**
  - View all users (students, sponsors)
  - User role management
  - Account verification and moderation
  - Activity monitoring

- **Content Moderation**
  - Forum post management
  - Scholarship approval workflow
  - Report handling
  - System-wide announcements

- **System Overview**
  - Platform statistics dashboard
  - User activity analytics
  - Scholarship trends
  - Application metrics

### Platform-Wide Features

 - **Digital Certificates** NEW!
  - Auto-generated certificates for approved scholarships
  - Professional PDF-ready design
  - Downloadable and printable
  - Unique certificate ID for verification
  - Share functionality
  - Automatic popup notification when approved

- **Community Forum**
  - Create discussion threads
  - Comment and engage with posts
  - Topic categorization
  - User reputation system

- **Messaging System**
  - One-on-one conversations
  - File sharing in messages
  - Message history
  - Read receipts

- **AI Assistant (Gemini)**
  - Natural language scholarship queries
  - Personalized recommendations
  - Application guidance
  - Eligibility checking

- **Notifications**
  - Real-time application updates
  - Message alerts
  - Scholarship deadlines
  - Approval certificates
  - System announcements

- **Responsive Design**
  - Mobile-first approach
  - Tablet optimization
  - Desktop full features
  - Touch-friendly interface

---

## Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud NoSQL)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **File Upload**: Multer
- **Environment**: dotenv

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom responsive design, Flexbox, Grid
- **JavaScript**: ES6+ (Async/await, Fetch API, Modules)
- **Maps**: Leaflet.js with OpenStreetMap
- **Icons**: Emoji-based icons

### AI Integration
- **Gemini API**: Google's Generative AI for chatbot functionality

### Security
- **Password Hashing**: bcrypt (10 rounds)
- **JWT Tokens**: Secure authentication
- **Input Validation**: Server-side validation
- **File Type Checking**: MIME type validation
- **CORS**: Controlled cross-origin requests

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Process Manager**: nodemon (development)

---

## Prerequisites

Before installation, ensure you have:

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **MongoDB Atlas Account** (Free Tier)
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string

4. **Google Gemini API Key** (Free)
   - Get from [ai.google.dev](https://ai.google.dev/)
   - Enable Generative Language API

### System Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/tulongaral-plus.git
cd tulongaral-plus/SoftEng
```

### Step 2: Install Dependencies

```powershell
npm install
```

This will install all required packages:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- multer
- dotenv
- cors
- @google/generative-ai

### Step 3: Create Environment File

Create a `.env` file in the `SoftEng` directory:

```powershell
New-Item -Path ".env" -ItemType File
```

---

## Environment Setup

Edit the `.env` file with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tulongaral?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# File Upload Settings (Optional)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Generate Secure JWT Secret

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` in `.env`

### Gemini API Setup

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new project
4. Copy your API key to `.env`

---

## Running the Application

### Development Mode (with auto-restart)

```powershell
npm run dev
```

### Production Mode

```powershell
npm start
```

### System Check

Verify all connections before starting:

```powershell
node system-check.js
```

This checks:
- ✅ MongoDB connection
- ✅ Gemini API connectivity
- ✅ Environment variables
- ✅ File upload directories

### Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

**Default Login Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tulongaral.com | admin123 |
| Sponsor | sponsor@company.com | sponsor123 |
| Student | student@email.com | student123 |

**Change these passwords after first login!**

---

## User Roles

### 1. Student
**Access**: Browse scholarships, apply, message sponsors, forum

**Capabilities**:
- Search and filter scholarships
- Submit applications with documents
- Track application status
- Direct messaging with sponsors
- Create forum posts
- Update profile and academic info
- View scholarship map

**Dashboard Features**:
- Application statistics
- Recent applications
- Recommended scholarships
- Notification center

### 2. Sponsor
**Access**: Manage scholarships, review applications, message students

**Capabilities**:
- Create and edit scholarships
- Upload scholarship documents
- Review student applications
- Accept/reject applications
- Download applicant documents
- Direct messaging with students
- Forum participation

**Dashboard Features**:
- Scholarship overview
- Application metrics
- Recent applicants
- Active scholarships

### 3. Administrator
**Access**: Full system control, user management, content moderation

**Capabilities**:
- View all users and activity
- Manage user accounts
- Moderate forum posts
- System analytics
- Content approval
- Report management

**Dashboard Features**:
- Platform statistics
- User management table
- System health monitoring
- Activity logs

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ...user_data }
}
```

### Scholarship Endpoints

#### Get All Scholarships
```http
GET /api/scholarships
Authorization: Bearer <token>
```

#### Get Single Scholarship
```http
GET /api/scholarships/:id
Authorization: Bearer <token>
```

#### Create Scholarship (Sponsor only)
```http
POST /api/scholarships
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Merit Scholarship 2025",
  "description": "Full tuition scholarship",
  "amount": 50000,
  "deadline": "2025-12-31",
  ...
}
```

### Application Endpoints

#### Submit Application
```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "scholarshipId": "scholarship_id",
  "documents": [files]
}
```

#### Get My Applications
```http
GET /api/applications/my-applications
Authorization: Bearer <token>
```

#### Update Application Status (Sponsor)
```http
PUT /api/applications/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

### User Endpoints

#### Get All Users (Admin)
```http
GET /api/users
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Messaging Endpoints

#### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "content": "Hello!"
}
```

### Forum Endpoints

#### Get All Posts
```http
GET /api/forum/posts
```

#### Create Post
```http
POST /api/forum/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Question about scholarships",
  "content": "Post content here"
}
```

---

## File Structure

```
SoftEng/
│
├── config/
│   └── database.js              # MongoDB connection configuration
│
├── middleware/
│   └── auth.js                  # JWT authentication middleware
│
├── models/                      # Mongoose schemas
│   ├── Application.js           # Scholarship applications
│   ├── Conversation.js          # Message conversations
│   ├── ForumPost.js            # Forum posts and comments
│   ├── Message.js              # Direct messages
│   ├── Profile.js              # User profiles
│   ├── Scholarship.js          # Scholarship listings
│   └── User.js                 # User accounts
│
├── routes/                      # Express route handlers
│   ├── applications.js         # Application CRUD operations
│   ├── auth.js                 # Authentication routes
│   ├── forum.js                # Forum operations
│   ├── messages.js             # Messaging system
│   ├── profile.js              # Profile management
│   ├── scholarships.js         # Scholarship CRUD
│   └── users.js                # User management
│
├── uploads/                     # File storage
│   ├── applications/           # Application documents
│   ├── messages/               # Message attachments
│   ├── profiles/               # User avatars
│   └── scholarships/           # Scholarship documents
│
├── css/
│   └── styles.css              # Main stylesheet (4600+ lines)
│
├── js/                          # Frontend JavaScript
│   ├── add-scholarship.js      # Scholarship creation
│   ├── admin.js                # Admin dashboard
│   ├── api.js                  # API utility functions
│   ├── auth.js                 # Frontend authentication
│   ├── avatars.js              # Avatar utilities
│   ├── forum.js                # Forum functionality
│   ├── gemini-api.js           # AI chatbot integration
│   ├── institution-coordinates.js # Map coordinates
│   ├── main.js                 # Global scripts
│   ├── messages.js             # Messaging interface
│   ├── notifications.js        # Notification system
│   ├── profile.js              # Profile management
│   ├── sponsor.js              # Sponsor dashboard
│   ├── student-dashboard.js   # Student dashboard
│   └── student.js              # Student home page
│
├── HTML Pages/                  # Frontend views
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── student-home.html       # Student scholarship browse
│   ├── student-dashboard.html  # Student dashboard
│   ├── sponsor-dashboard.html  # Sponsor dashboard
│   ├── admin-dashboard.html    # Admin panel
│   ├── add-scholarship.html    # Create scholarship
│   ├── messages.html           # Messaging interface
│   ├── forum.html              # Community forum
│   └── profile.html            # User profile
│
├── server.js                    # Express server entry point
├── system-check.js             # System diagnostics
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (create this)
└── README.md                   # This file
```

---

## Mobile Responsive

TulongAral+ is fully optimized for mobile devices with:

### Responsive Breakpoints

| Device | Width | Optimizations |
|--------|-------|---------------|
| **Desktop** | >1200px | Full 2-column layouts, expanded sidebars |
| **Laptop** | 992px-1200px | Compact layouts, responsive grids |
| **Tablet** | 768px-992px | Single column, horizontal navigation |
| **Mobile** | 480px-768px | Stacked layouts, mobile-first UI |
| **Small Mobile** | <480px | Ultra-compact, touch-optimized |

### Mobile Features

- **Messenger-Style Messages**
- Conversations list OR chat window (not stacked)
- Back button navigation
- Touch-friendly interface

- **Responsive Navigation**
- Horizontal 2-column mobile nav
- Collapsible menu items
- Touch-optimized buttons

- **Optimized Text Display**
- All text wraps properly (no vertical letters)
- Readable font sizes (14px-16px)
- Proper line spacing

- **Reduced Margins**
- 50-70% smaller padding on mobile
- Efficient use of screen space
- Scroll-friendly layouts

- **Touch Interactions**
- Large tap targets (44px minimum)
- Swipe gestures support
- Haptic feedback

- **Performance**
- Lazy loading images
- Optimized CSS delivery
- Minimal JavaScript overhead

### Testing Mobile Responsiveness

```javascript
// Chrome DevTools
F12 → Toggle Device Toolbar (Ctrl+Shift+M)

// Test on actual devices
- iPhone 12/13/14 (390x844)
- Samsung Galaxy S21 (360x800)
- iPad Air (820x1180)
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: ['student', 'sponsor', 'admin']),
  avatar: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Profiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  bio: String,
  phone: String,
  location: {
    city: String,
    region: String,
    coordinates: [longitude, latitude]
  },
  // Student fields
  university: String,
  course: String,
  yearLevel: String,
  gpa: Number,
  // Sponsor fields
  organization: String,
  website: String,
  contactEmail: String
}
```

### Scholarships Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  amount: Number,
  scholarshipType: String,
  type: String (enum: ['merit-based', 'need-based', 'athletic', ...]),
  deadline: Date,
  eligibility: String,
  documentsRequired: String,
  availableSlots: Number,
  region: String,
  affiliatedInstitution: String,
  sponsor: ObjectId (ref: 'User'),
  status: String (enum: ['active', 'closed', 'pending']),
  documents: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  scholarshipId: ObjectId (ref: 'Scholarship'),
  studentId: ObjectId (ref: 'User'),
  status: String (enum: ['pending', 'accepted', 'rejected']),
  documents: [String],
  submittedAt: Date,
  reviewedAt: Date,
  notes: String
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: 'Conversation'),
  senderId: ObjectId (ref: 'User'),
  content: String,
  attachments: [String],
  read: Boolean,
  createdAt: Date
}
```

### ForumPosts Collection
```javascript
{
  _id: ObjectId,
  authorId: ObjectId (ref: 'User'),
  title: String,
  content: String,
  category: String,
  comments: [{
    userId: ObjectId (ref: 'User'),
    content: String,
    createdAt: Date
  }],
  likes: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 24-hour expiry
- **Password Hashing**: bcrypt with 10 salt rounds
- **Role-Based Access**: Protected routes per user role
- **Token Validation**: Middleware on all protected endpoints

### Data Protection
- **Input Sanitization**: MongoDB injection prevention
- **XSS Protection**: Content Security Policy headers
- **CORS Configuration**: Controlled cross-origin requests
- **File Type Validation**: MIME type checking on uploads
- **File Size Limits**: 10MB maximum upload size

### Best Practices
- **Environment Variables**: Sensitive data in `.env`
- **HTTPS Ready**: SSL/TLS support for production
- **Rate Limiting**: Prevent brute force attacks
- **Error Handling**: No sensitive data in error messages
- **Audit Logging**: Track critical operations

### Production Checklist
- [ ] Change default admin password
- [ ] Generate new JWT secret
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure MongoDB IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Set up backup strategy
- [ ] Configure monitoring (e.g., PM2)

---

## Contributing

We welcome contributions! To contribute:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/tulongaral-plus.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit with clear messages**
   ```bash
   git commit -m "Add: Scholarship filtering by region"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Include screenshots if UI changes

### Code Style Guidelines

- **JavaScript**: ES6+, async/await, clear variable names
- **HTML**: Semantic tags, accessibility attributes
- **CSS**: BEM methodology, mobile-first approach
- **Comments**: Explain "why", not "what"

### Testing

Before submitting:
```bash
# Check MongoDB connection
node system-check.js

# Test API endpoints
# Start server and test in browser

# Check for errors in console
# Verify mobile responsiveness
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongooseError: connect ECONNREFUSED`

**Solutions**:
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Or use MongoDB Atlas (recommended)
# Update MONGODB_URI in .env
```

#### 2. Port 5000 Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```powershell
# Find and kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Or use different port in .env
PORT=3000
```

#### 3. Gemini API Not Working

**Error**: `API key not valid`

**Solutions**:
- Verify API key in `.env`
- Check API key has Generative Language API enabled
- Ensure no extra spaces in `.env` file
- Get new key from [ai.google.dev](https://ai.google.dev/)

#### 4. File Upload Fails

**Error**: `Multer: Unexpected field`

**Solutions**:
```powershell
# Check upload directories exist
Test-Path ./uploads/profiles
Test-Path ./uploads/scholarships
Test-Path ./uploads/applications
Test-Path ./uploads/messages

# Create if missing
mkdir uploads\profiles, uploads\scholarships, uploads\applications, uploads\messages
```

#### 5. JWT Token Expired

**Error**: `jwt expired`

**Solution**:
- Logout and login again
- Token expires after 24 hours
- Change expiry in `routes/auth.js` if needed

#### 6. Cannot Access Admin Panel

**Issue**: Redirected when accessing `/admin-dashboard.html`

**Solution**:
```javascript
// Must login with admin account
// Default: admin@tulongaral.com / admin123

// Or create admin user in MongoDB:
use tulongaral
db.users.updateOne(
  {email: "your@email.com"},
  {$set: {role: "admin"}}
)
```

### Database Issues

#### Reset Database
```javascript
// Connect to MongoDB
use tulongaral

// Drop all collections
db.dropDatabase()

// Restart server to recreate indexes
```

#### View Database Data
```javascript
// MongoDB Shell
use tulongaral
db.users.find().pretty()
db.scholarships.find().pretty()
db.applications.find().pretty()
```

#### Backup Database
```powershell
# MongoDB Atlas has automatic backups

# Manual backup (local MongoDB)
mongodump --db tulongaral --out ./backup
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/tulongaral-plus/issues)
- **Documentation**: Check this README and system-check.js
- **Logs**: Check server console for detailed errors

---

## MongoDB Data Management

### Viewing Your Data

The system stores all data in MongoDB Atlas. To view and manage:

1. **Access MongoDB Atlas Dashboard**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com/)
   - Sign in to your account
   - Select your cluster

2. **Browse Collections**
   - Click "Collections" tab
   - View: `users`, `profiles`, `scholarships`, `applications`, `messages`, `forumposts`

3. **Query Data**
   ```javascript
   // Click "Shell" in Atlas interface
   
   // View all users
   db.users.find()
   
   // View scholarships
   db.scholarships.find()
   
   // Count applications
   db.applications.countDocuments()
   ```

### Backup Your Data

```powershell
# Export all data (requires MongoDB tools)
mongodump --uri="your_mongodb_uri" --out=./backup

# Restore data
mongorestore --uri="your_mongodb_uri" ./backup
```

### Database Statistics

```javascript
// In MongoDB Shell
use tulongaral

// Get database stats
db.stats()

// Collection counts
db.users.countDocuments()
db.scholarships.countDocuments()
db.applications.countDocuments()
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Filipino Students**: The inspiration behind this project
- **Scholarship Providers**: For supporting education
- **Google Gemini**: AI-powered assistance
- **MongoDB Atlas**: Cloud database hosting
- **Open Source Community**: For amazing tools and libraries

---

## Support

For questions or support:

- **Email**: support@tulongaral.com
- **GitHub**: [Issues](https://github.com/yourusername/tulongaral-plus/issues)
- **Documentation**: See `system-check.js` for diagnostics

---

## Production Deployment

### Recommended Hosting

- **Backend**: Heroku, Railway, Render
- **Database**: MongoDB Atlas (Free tier available)
- **Files**: AWS S3, Cloudinary

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long_random_string>
GEMINI_API_KEY=<your_key>
FRONTEND_URL=https://yourdomain.com
```

### Deployment Steps

1. Push code to GitHub
2. Connect hosting service to repository
3. Set environment variables in hosting dashboard
4. Configure build command: `npm install`
5. Configure start command: `npm start`
6. Enable automatic deployments

---

### Certificate 

TulongAral+ automatically generates a professional digital certificate for every approved scholarship application. Students can view, download (PDF/JPG), print, and share their certificate directly from their dashboard.

**Key Features:**
- Auto-generated certificate upon sponsor approval
- Includes student name, scholarship details, sponsor, amount, and approval date
- Unique certificate ID for verification (format: CERT-{timestamp}-{appId-last6})
- Download as PDF or JPG (print-ready)
- Share and print options
- Always accessible from student dashboard
- Fully responsive and mobile-friendly

**How it Works:**
1. Student applies for a scholarship
2. Sponsor reviews and approves the application
3. Student receives a popup notification and can view/download their certificate
4. Certificate is always available via the "View Certificate" button on approved applications

**Technical Details:**
- Certificate data is stored in the Application model (`certificateId`, `certificateGenerated`, `certificateGeneratedAt`)
- Certificate is rendered using `js/certificate.js` and can be exported as PDF (html2pdf.js) or JPG (html2canvas)
- Verification is possible using the unique certificate ID
- Only approved applications generate certificates; access is restricted to the student, sponsor, and admins

For full technical documentation, see `CERTIFICATE_SYSTEM.md`.


**Made with love for Filipino Students**

*Last Updated: November 12, 2025*
### 📜 Digital Certificate System
