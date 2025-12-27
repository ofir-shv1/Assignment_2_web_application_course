# Assignment 2 - Web Application Course

A RESTful API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** featuring JWT authentication and comprehensive Swagger documentation.

## 👥 Authors
- Anael Ben Shabat
- Ofir Shviro

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Testing](#testing)

## ✨ Features

- **JWT Authentication** - Secure authentication with access tokens (1 hour) and refresh tokens (7 days)
- **Password Encryption** - Bcrypt hashing with 10 salt rounds
- **RESTful API** - Full CRUD operations for Users, Posts, and Comments
- **Swagger Documentation** - Interactive API documentation with JSDoc annotations
- **TypeScript** - Type-safe codebase with strict typing
- **MongoDB** - NoSQL database with Mongoose ODM
- **Protected Routes** - JWT middleware for secure endpoints
- **Token Refresh** - Automatic token renewal system
- **Database Persistence** - Refresh tokens stored in MongoDB

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.x** - Web framework
- **TypeScript 5.x** - Type-safe JavaScript

### Database
- **MongoDB** - NoSQL database
- **Mongoose 9.x** - MongoDB object modeling

### Authentication
- **jsonwebtoken 9.x** - JWT token generation and verification
- **bcrypt 6.x** - Password hashing

### Documentation
- **swagger-jsdoc 6.x** - Generate Swagger spec from JSDoc comments
- **swagger-ui-express 5.x** - Serve interactive API documentation

### Testing
- **Jest 30.x** - Testing framework
- **Supertest 7.x** - HTTP assertions
- **mongodb-memory-server 11.x** - In-memory MongoDB for testing

### Development
- **ts-node-dev** - Development server with auto-reload
- **nodemon** - Monitor for file changes

## 📁 Project Structure

```
Assignment_2_web_application_course/
├── src/
│   ├── controllers/
│   │   ├── authController.ts       # Authentication logic (register, login, logout, refresh)
│   │   ├── commentController.ts    # Comment CRUD operations
│   │   ├── postController.ts       # Post CRUD operations
│   │   └── userController.ts       # User CRUD operations
│   ├── models/
│   │   ├── commentModel.ts         # Comment schema
│   │   ├── postModel.ts            # Post schema
│   │   ├── userModel.ts            # User schema
│   │   ├── refreshTokenModel.ts    # Refresh token schema
│   │   └── modelTypes.ts           # TypeScript interfaces
│   ├── routes/
│   │   ├── authRoutes.ts           # Authentication endpoints with Swagger docs
│   │   ├── commentRoute.ts         # Comment endpoints with Swagger docs
│   │   ├── postRoutes.ts           # Post endpoints with Swagger docs
│   │   └── userRoute.ts            # User endpoints with Swagger docs
│   ├── middleware/
│   │   └── authMiddleware.ts       # JWT verification middleware
│   ├── tests/
│   │   ├── auth.test.ts            # Authentication tests
│   │   ├── comments.test.ts        # Comment tests
│   │   ├── posts.test.ts           # Post tests
│   │   └── users.test.ts           # User tests
│   ├── swagger.ts                  # Swagger configuration with OpenAPI 3.0
│   ├── index.ts                    # Express app configuration
│   └── server.ts                   # Server initialization
├── dist/                           # Compiled JavaScript (generated)
├── .env                            # Environment variables
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest testing configuration
└── README.md                       # This file
```

## 📦 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas connection string

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ofir-shv1/Assignment_2_web_application_course.git
   cd Assignment_2_web_application_course
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment files**
   ```bash
   # Create .env file in the root directory
   touch .env
   
   # Create .env.test file for testing environment
   touch .env.test
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_URI=mongodb://localhost:27017/web_assignment2

# JWT Configuration
JWT_SECRET=your_access_token_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
JWT_ACCESS_EXPIRATION=3600        # 1 hour (in seconds)
JWT_REFRESH_EXPIRATION=604800     # 7 days (in seconds)
```

### Generate Secure JWT Secrets

For production, generate secure random secrets:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use the provided example secrets (for development only):
```env
JWT_SECRET=7f9a2b8c4e6d1f3a5b7c9d2e4f6a8b0c1d3e5f7a9b2c4d6e8f0a1b3c5d7e9f2a4b6
JWT_REFRESH_SECRET=3e5a7c9b1d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6a8b0d2e4f6a8c0e2b4d6f8a
```

### Testing Environment Configuration

Create a `.env.test` file for the testing environment with the following variables:

```env
# Database Configuration for Tests
DB_URI=mongodb://localhost:27017/web_assignment2_test

# JWT Configuration for Tests (shorter expiration for testing)
JWT_SECRET=test_access_token_secret_key
JWT_REFRESH_SECRET=test_refresh_token_secret_key
JWT_ACCESS_EXPIRATION=3         # 3 seconds (for testing token expiration)
JWT_REFRESH_EXPIRATION=3600     # 1 hour
```

> **Note**: The test environment uses shorter token expiration times to test token refresh functionality.

## 🏃 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```
Server will start on `http://localhost:3000` with automatic restart on file changes.

### Production Mode

1. **Build TypeScript to JavaScript**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

### Verify Server is Running

You should see:
```
Connected to MongoDB
Server running on port 3000
📚 Swagger UI available at: http://localhost:3000/api-docs
📥 Download Swagger JSON at: http://localhost:3000/api-docs.json
```

## 📚 API Documentation

### Swagger UI
Once the server is running, access interactive API documentation at:

**🔗 http://localhost:3000/api-docs**

The Swagger UI provides:
- Complete API endpoint list
- Request/response schemas
- Try-it-out functionality
- Authentication support
- Example requests and responses

### Download OpenAPI Specification
Get the complete API specification in JSON format:

**🔗 http://localhost:3000/api-docs.json**

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication with a dual-token system:

### Access Token
- **Expiration**: 1 hour
- **Purpose**: Authorize API requests
- **Storage**: Client-side (memory/localStorage)
- **Header**: `Authorization: Bearer <access_token>`

### Refresh Token
- **Expiration**: 7 days
- **Purpose**: Generate new access tokens
- **Storage**: Database (MongoDB) + Client-side
- **Security**: Stored in database for validation

### Authentication Flow

1. **Register/Login** → Receive both tokens
2. **Make API Requests** → Use access token in header
3. **Token Expires** → Use refresh token to get new access token
4. **Logout** → Delete refresh token from database

### Using Authentication

1. **Register a new user**
   ```bash
   POST http://localhost:3000/auth/register
   Content-Type: application/json

   {
     "username": "john_doe",
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```

2. **Login**
   ```bash
   POST http://localhost:3000/auth/login
   Content-Type: application/json

   {
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```

   **Response:**
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "userId": "507f1f77bcf86cd799439011"
   }
   ```

3. **Use the access token in protected routes**
   ```bash
   GET http://localhost:3000/posts
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Refresh the access token when expired**
   ```bash
   POST http://localhost:3000/auth/refresh
   Content-Type: application/json

   {
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

5. **Logout**
   ```bash
   POST http://localhost:3000/auth/logout
   Content-Type: application/json

   {
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

## 🛣️ API Endpoints

### Authentication Routes (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/logout` | Logout user | ❌ |
| POST | `/auth/refresh` | Refresh access token | ❌ |

### User Routes (`/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| POST | `/users` | Create new user | ✅ |
| PUT | `/users/:id` | Update user | ✅ |
| DELETE | `/users/:id` | Delete user | ✅ |

### Post Routes (`/posts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/posts` | Get all posts (filter by `?sender=username`) | ✅ |
| GET | `/posts/:id` | Get post by ID | ✅ |
| POST | `/posts` | Create new post | ✅ |
| PUT | `/posts/:id` | Update post | ✅ |

### Comment Routes (`/comments`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/comments` | Get all comments (filter by `?postId=id`) | ✅ |
| GET | `/comments/:id` | Get comment by ID | ✅ |
| POST | `/comments/:id` | Create comment on post | ✅ |
| PUT | `/comments/:id` | Update comment | ✅ |
| DELETE | `/comments/:id` | Delete comment | ✅ |

### Documentation Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api-docs` | Swagger UI interface |
| GET | `/api-docs.json` | OpenAPI 3.0 JSON specification |

## 🧪 Testing

The project includes comprehensive test suites using Jest and Supertest.

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Suites
```bash
# Authentication tests
npm run testAuth

# Post tests
npm run testPosts

# Comment tests
npm run testComment

# User tests
npm run testUsers
```

### Test Features
- **In-memory MongoDB** - Tests run against mongodb-memory-server
- **Isolated Tests** - Each test suite runs independently
- **API Testing** - Supertest for HTTP endpoint testing
- **Coverage Reports** - Jest coverage reporting

## 📝 Example Usage

### Create a Post (with authentication)

1. **Login first**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"securePassword123"}'
   ```

2. **Create a post using the access token**
   ```bash
   curl -X POST http://localhost:3000/posts \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "title": "My First Post",
       "content": "This is the content of my first post"
     }'
   ```

   > **Note**: The `sender` is automatically extracted from the JWT token, so you don't need to include it in the request body.

### Get All Posts (with filter)
```bash
curl -X GET "http://localhost:3000/posts?sender=john_doe" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Add a Comment to a Post
```bash
curl -X POST http://localhost:3000/comments/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "content": "Great post!"
  }'
```

> **Note**: The `sender` is automatically extracted from the JWT token, so you don't need to include it in the request body.

## 🔧 Development Notes

### TypeScript Compilation
The project uses TypeScript with strict type checking. Compiled JavaScript files are output to the `dist/` directory.

### Code Structure
- **Controllers** - Business logic and request handling
- **Models** - MongoDB schemas and TypeScript interfaces
- **Routes** - Endpoint definitions with Swagger documentation
- **Middleware** - JWT verification and request processing
- **Tests** - Comprehensive test coverage for all endpoints

### Swagger Documentation
Each route file includes JSDoc comments that are automatically parsed by `swagger-jsdoc` to generate the OpenAPI specification. The configuration is in `src/swagger.ts`.

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Make sure MongoDB is running
mongod --version

# Or use MongoDB Atlas connection string
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### JWT Token Errors
- Make sure JWT_SECRET and JWT_REFRESH_SECRET are set in `.env`
- Check token expiration times
- Verify Authorization header format: `Bearer <token>`

### Build Errors
```bash
# Clear dist folder and rebuild
rm -rf dist
npm run build
```

## 📄 License

ISC

## 🔗 Repository

[GitHub Repository](https://github.com/ofir-shv1/Assignment_2_web_application_course)

---

**Made with ❤️ by Anael Ben Shabat and Ofir Shviro**
