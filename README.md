OpenBank Backend API
OpenBank Backend Node.js Express.js MongoDB JWT

A robust, secure, and scalable banking backend API built with Node.js, Express, and MongoDB. This project represents Week 2 of the development lifecycle, focusing on backend architecture, database design, API development, and secure authentication.

🏦 Features
🔐 Authentication & Security
JWT-Based Authentication: Secure token-based authentication with 30-day expiry
Password Security: bcrypt hashing with salt rounds for secure password storage
Protected Routes: Middleware for securing sensitive endpoints
Input Validation: Comprehensive validation for all user inputs
CORS Protection: Configured for secure frontend-backend communication
🛡️ API Features
RESTful Architecture: Clean, predictable API endpoints
Error Handling: Comprehensive error responses with proper HTTP codes
Rate Limiting: Protection against brute force attacks
Request Logging: Detailed logging for debugging and monitoring
Health Checks: API status monitoring endpoints
🏗️ Tech Stack
Core Technologies
Runtime: Node.js (v18+)
Framework: Express.js (v4.x)
Database: MongoDB with Mongoose ODM
Authentication: JSON Web Tokens + bcryptjs
Development Tools
Environment Management: dotenv
HTTP Client: Postman for API testing
Process Manager: PM2 for production
Containerization: Docker (optional)
Security
CORS: cors middleware
Validation: Built-in Mongoose validation
Encryption: bcrypt for password hashing
Token Security: JWT with configurable secrets and expiry
📂 Project Structure
openbank-backend/
├── config/                 # Configuration files
│   └── db.js              # Database connection setup
├── controllers/           # Business logic
│   ├── authController.js  # Authentication logic
│   └── transactionController.js # Transaction processing
├── middleware/            # Express middleware
│   └── authMiddleware.js  # JWT authentication
├── models/               # MongoDB schemas
│   ├── User.js           # User model with validation
│   └── Transaction.js    # Transaction model
├── routes/               # API routes
│   ├── authRoutes.js     # Authentication endpoints
│   ├── userRoutes.js     # User profile endpoints
│   └── transactionRoutes.js # Transaction endpoints
├── tests/                # Test files
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json         # Dependencies
├── package-lock.json    # Lock file
├── server.js           # Application entry point
└── README.md           # This file
🚀 Quick Start
Prerequisites
Node.js (v18 or higher)
MongoDB (local installation or MongoDB Atlas account)
npm or yarn
Postman (for API testing)
Installation
Clone the repository:
git clone https://github.com/yourusername/openbank-backend.git
cd openbank-backend
Install dependencies:
npm install
Configure environment variables:
cp .env.example .env
Edit .env file with your configuration:

NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/openbank
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
Start MongoDB:
# For macOS
brew services start mongodb-community

# For Ubuntu/Debian
sudo systemctl start mongodb

# For Windows (Run as Administrator)
net start MongoDB
Start the development server:
npm run dev
Verify the server is running: Visit http://localhost:5000/api/health in your browser or use curl:
curl http://localhost:5000/api/health
📡 API Documentation
Base URL
http://localhost:5000/api
Authentication Endpoints
Register a New User
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "saIdNumber": "8001015009087",
  "email": "john.doe@example.com",
  "phoneNumber": "0821234567",
  "password": "password123"
}
User Login
POST /api/auth/login
Content-Type: application/json

{
  "saIdNumber": "8001015009087",
  "password": "password123"
}
User Profile Endpoints
Get User Profile (Protected)
GET /api/user/profile
Authorization: Bearer <your_jwt_token>
Update User Profile (Protected)
PUT /api/user/profile
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "email": "new.email@example.com",
  "phoneNumber": "0829876543",
  "twoFactorEnabled": true
}
Transaction Endpoints
Get Transaction History (Protected)
GET /api/transactions
Authorization: Bearer <your_jwt_token>
Create Deposit (Protected)
POST /api/transactions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "deposit",
  "amount": "500.00",
  "title": "Salary Deposit",
  "accountType": "checking",
  "description": "Monthly salary"
}
Create Withdrawal (Protected)
POST /api/transactions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "withdrawal",
  "amount": "250.00",
  "title": "ATM Withdrawal",
  "accountType": "checking",
  "description": "Grocery shopping"
}
Create Transfer (Protected)
POST /api/transactions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "transfer",
  "amount": "1000.00",
  "title": "Savings Transfer",
  "accountType": "checking",
  "toAccountType": "savings",
  "description": "Monthly savings"
}
Health Check
GET /api/health
🧪 Testing the API
Using Postman
Import the provided postman_collection.json file
Set up environment variables:
base_url: http://localhost:5000
Test endpoints in this order:
/api/health - Verify server is running
/api/auth/register - Create a test user
/api/auth/login - Get JWT token
Set token in environment variable
Test protected endpoints
🗄️ Database Setup
Option 1: Local MongoDB
# Install MongoDB (if not installed)
# For macOS:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# For Ubuntu/Debian:
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
Option 2: MongoDB Atlas (Cloud)
Sign up at MongoDB Atlas
Create a free cluster
Get connection string:
mongodb+srv://username:password@cluster.mongodb.net/openbank?retryWrites=true&w=majority
Update MONGO_URI in .env file
Option 3: Docker (Recommended for Development)
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name openbank-mongo mongo:latest

# Or use Docker Compose
docker-compose up -d
Initialize Sample Data
# Connect to MongoDB shell
mongosh

# Create database
use openbank

# Insert sample user
db.users.insertOne({
  "firstName": "John",
  "lastName": "Doe",
  "saIdNumber": "8001015009087",
  "email": "john.doe@example.com",
  "phoneNumber": "0821234567",
  "password": "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1iyVFK",
  "accountNumber": "1234567890",
  "cardNumber": "4532 7612 9088 3456",
  "balances": {
    "savings": 1700.00,
    "checking": 3050.00,
    "business": 10200.00,
    "investment": 14000.00
  },
  "twoFactorEnabled": false,
  "createdAt": new Date()
});
🚢 Deployment
Production Environment Variables
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/openbank?retryWrites=true&w=majority
JWT_SECRET=your_strong_production_secret_here
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-app.com
Using PM2 (Recommended)
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "openbank-api"

# Save process list
pm2 save

# Setup startup script
pm2 startup

# Monitor application
pm2 monit
🧩 Integration with Frontend
Update your frontend App.tsx to use the real API:

// Update API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Example API call for login
const login = async (saIdNumber: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saIdNumber, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
  }
  return data;
};
📊 Testing
Unit Tests
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
API Testing
# Install test dependencies
npm install --save-dev jest supertest mongodb-memory-server

# Run API tests
npm run test:api
🔧 Troubleshooting
Common Issues
MongoDB Connection Failed

Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Ensure MongoDB is running: sudo systemctl status mongodb

JWT Token Not Working

Error: Not authorized, token failed
Solution: Check JWT_SECRET in .env matches and token hasn't expired

CORS Errors

Access-Control-Allow-Origin error
Solution: Update FRONTEND_URL in .env file

Duplicate Key Error

E11000 duplicate key error
Solution: The email or SA ID number already exists

Debug Mode
# Enable debug logging
export DEBUG=express:*
export NODE_ENV=development
npm run dev
📈 Performance Monitoring
Enable Monitoring
# Install monitoring tools
npm install --save express-status-monitor morgan

# Access monitoring dashboard at:
# http://localhost:5000/status
Logging
# View logs
pm2 logs openbank-api

# Or with Docker
docker logs -f openbank-api
🤝 Contributing
Fork the repository
Create a feature branch: git checkout -b feature/amazing-feature
Commit changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open a Pull Request
Development Guidelines
Follow JavaScript Standard Style
Write meaningful commit messages
Add tests for new features
Update documentation
Use meaningful variable names
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Express.js team for the amazing framework
MongoDB for the database
JWT for authentication
All contributors and testers
