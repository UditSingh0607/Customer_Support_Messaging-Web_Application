# Branch Customer Support Messaging Web Application

A scalable, real-time customer support messaging system built for financial services companies. This application enables customers to send messages, automatically prioritizes them by urgency, and allows support agents to efficiently manage, search, and respond to customer inquiries in real-time.

## 🎯 Project Overview

This is a production-ready customer support messaging platform that demonstrates:
- **Intelligent urgency detection** using weighted rule-based scoring
- **Real-time synchronization** across multiple agent sessions using WebSocket
- **Full-text search** with PostgreSQL GIN indexes
- **Scalable architecture** with Docker containerization
- **Modern UI/UX** with React and Tailwind CSS

## 🏗️ System Architecture

```
Customer UI / Simulator
        |
        | POST /api/messages
        v
Node.js Backend (Express + Socket.IO)
        |
        | SQL Queries
        v
PostgreSQL Database
        |
        | WebSocket Events
        v
Agent Portal (React UI)
```

### Components

1. **Backend (Node.js + Express + Socket.IO)**
   - RESTful API for message management
   - Real-time WebSocket communication
   - Urgency scoring engine
   - PostgreSQL integration

2. **Frontend (React + Vite + Tailwind CSS)**
   - Agent dashboard with filtering and search
   - Message detail view with customer history
   - Customer simulator for testing
   - Real-time updates via Socket.IO

3. **Database (PostgreSQL)**
   - Messages, customers, and canned responses
   - Full-text search with GIN indexes
   - Optimized for read-heavy workloads

## ✨ Features

### Core Features
- ✅ **Message Creation**: Customers can send support messages
- ✅ **Automatic Urgency Detection**: 5-dimensional weighted scoring system
- ✅ **Agent Dashboard**: View, filter, and search all messages
- ✅ **Message Details**: View customer info and conversation history
- ✅ **Claim Messages**: Agents can claim messages to work on them
- ✅ **Respond to Messages**: Send responses with canned or custom text
- ✅ **Real-Time Updates**: All agents see updates instantly via WebSocket
- ✅ **Search**: Full-text search on message content and customer ID
- ✅ **Canned Responses**: Pre-written responses for common scenarios
- ✅ **Customer Simulator**: Test the system by simulating customer messages

### Message Lifecycle
```
UNREAD → IN_PROGRESS → RESOLVED
```

## 🧮 Urgency Scoring Logic

The system calculates urgency scores based on **5 weighted dimensions**:

### 1. Content Keywords (0-40 points)
- **CRITICAL (+40)**: loan disbursed, money not received, fraud, unauthorized, hacked
- **HIGH (+25)**: account locked, cannot access, payment failed, overdue
- **MEDIUM (+15)**: dispute, incorrect, update information
- **STANDARD (+5)**: default

### 2. Time Sensitivity (0-15 points)
- **URGENT (+15)**: immediately, urgent, asap, today
- **SOON (+10)**: soon, quickly
- **NORMAL (+5)**: when possible

### 3. Message Frequency (0-10 points)
- **3+ messages in last hour**: +10
- **2+ messages in last 24 hours**: +7

### 4. Financial Amount (0-25 points)
- **≥ ₹10,000**: +25
- **₹1,000-9,999**: +15
- **₹100-999**: +10
- **< ₹100**: +5

### 5. Customer Tier (5 points)
- **Default**: +5 (all customers)

### Urgency Level Mapping
```
Score ≥ 80  → CRITICAL
50-79       → HIGH
25-49       → MEDIUM
< 25        → LOW
```

## 🔍 Search Functionality

The application uses **PostgreSQL full-text search** with GIN indexes for fast, accurate searching:

- Search by message content (natural language)
- Search by customer ID (numeric)
- Ranked results by relevance
- Optimized with `to_tsvector` and `plainto_tsquery`

## 🚀 Quick Start (Docker - ONE COMMAND)

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Run the Application

```bash
# Clone the repository
git clone <repository-url>
cd Assignment_BI

# Start all services
docker-compose up

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
```

That's it! The database will be automatically initialized with the schema and seed data.

### Stopping the Application

```bash
docker-compose down

# To remove volumes (database data):
docker-compose down -v
```

## 💻 Local Development Setup (Manual)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Initialize database
psql -U postgres -d branch_support -f init.sql

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env to point to your backend URL

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Messages
- `POST /api/messages` - Create a new message
- `GET /api/messages` - Get all messages (with filters)
- `GET /api/messages/:id` - Get message details
- `PUT /api/messages/:id/claim` - Claim a message
- `POST /api/messages/:id/respond` - Respond to a message
- `GET /api/messages/search?q=` - Search messages

### Customers
- `GET /api/customers/:id/messages` - Get customer message history

### Canned Responses
- `GET /api/canned-responses` - Get all canned responses

## 🔌 WebSocket Events

### Emitted by Backend
- `new_message` - New message created
- `message_updated` - Message status/assignment changed
- `message_responded` - Agent responded to message

### Listened by Frontend
- Real-time message list updates
- Toast notifications
- Status synchronization across agents

## 📊 CSV Import

To import the Branch sample messages from the provided CSV file:

```bash
cd backend
npm run import-csv ../GeneralistRails_Project_MessageData.csv
```

CSV format (Branch data):
```csv
User ID,Timestamp (UTC),Message Body
895,2017-02-17 19:25:31,"So it seems it was an activation fee..."
902,2017-02-17 19:25:31,"So. the status of account was still available..."
```

The import script will:
- Read all messages from the CSV
- Calculate urgency scores for each message
- Use the provided timestamps for message creation times
- Create customer records automatically

## 🎨 Tech Stack

### Backend
- **Node.js 18** - Runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **PostgreSQL** - Database
- **pg** - PostgreSQL client

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **socket.io-client** - WebSocket client

### DevOps
- **Docker** - Containerization
- **docker-compose** - Multi-container orchestration
- **nginx** - Frontend web server

## 📁 Project Structure

```
Assignment_BI/
├── backend/
│   ├── src/
│   │   ├── db/              # Database connection
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── socket/          # WebSocket handlers
│   │   ├── scripts/         # Utility scripts
│   │   └── server.js        # Entry point
│   ├── init.sql             # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and Socket services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── GeneralistRails_Project_MessageData.csv  # Branch sample data
```

## 🧪 Testing the Application

### Using the Customer Simulator

1. Navigate to `http://localhost:3000`
2. Click "Customer Simulator" button
3. Enter a customer ID (e.g., 1001)
4. Type or select an example message
5. Click "Send Message"
6. View the message in the Agent Portal
7. See the urgency score and level

### Testing Real-Time Updates

1. Open the Agent Portal in two browser windows
2. In one window, claim a message
3. In the other window, see the update instantly
4. Respond to the message in one window
5. See the response appear in both windows

### Testing Search

1. Go to the Agent Portal
2. Use the search bar to search for keywords (e.g., "loan")
3. Search by customer ID (e.g., "1001")
4. Results appear instantly

## 🌐 Deployment (Render.com)

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variable: `DATABASE_URL` (from Render PostgreSQL)

### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`

### Database Deployment

1. Create a PostgreSQL database on Render
2. Run the `init.sql` script manually
3. Copy the connection string to backend environment

## 🔮 Future Enhancements

- **Machine Learning**: Replace rule-based urgency with ML models (NLP, sentiment analysis)
- **Authentication**: Add agent login and role-based access control
- **Notifications**: Email/SMS alerts for critical messages
- **Analytics Dashboard**: Message volume, response times, agent performance
- **File Attachments**: Allow customers to upload documents
- **Multi-language Support**: Internationalization
- **Advanced Search**: Elasticsearch integration
- **Message Templates**: Rich text editor for responses
- **SLA Tracking**: Monitor and enforce response time SLAs

## 📝 License

This project is created for educational and demonstration purposes.


---

**Note**: This is a demo application. For production use, add authentication, authorization, rate limiting, input validation, and comprehensive error handling.
