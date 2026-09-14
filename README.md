# 🏏 CrickBoard

**CrickBoard** is a full-stack cricket scoring platform designed to manage teams, players, matches, innings, and ball-by-ball scoring.

The application provides authenticated match management for users and a public live-match view that allows a match to be accessed through a public match ID.

---

## 🚀 Overview

CrickBoard provides a complete workflow for managing and scoring cricket matches:

* User registration and login
* Player management
* Team management
* Match creation and setup
* Playing XI selection
* Toss management
* Innings management
* Ball-by-ball scoring
* Batter and bowler selection
* Wickets and extras tracking
* Match scorecards
* Public live-match viewing
* Protected application routes
* Light and dark theme support

The backend is built with **Node.js, Express.js, and MongoDB**, while the frontend uses **React.js and Vite**.

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* Authentication using access tokens
* HTTP-only cookie-based authentication
* Current-user authentication check
* Protected API routes
* Protected frontend routes
* Input validation using Joi

---

### 👤 Player Management

Authenticated users can:

* Create players
* View all players
* View a single player
* Update players
* Delete players
* Assign player roles

Supported player roles:

```text
BATTER
BOWLER
ALL_ROUNDER
WICKET_KEEPER
```

---

### 🏏 Team Management

Users can:

* Create teams
* View teams
* View a single team
* Update teams
* Delete teams
* Add players to teams
* Remove players from teams
* Store team logos

Teams support between **5 and 14 players**.

---

### 🏟️ Match Management

CrickBoard supports the complete match setup workflow:

* Create a match
* Select two teams
* Configure players per team
* Set total overs
* Select playing XI
* Perform toss
* Select batting/bowling decision
* Start the match
* Configure innings players
* View match details
* View match scorecard

Supported match states include:

```text
DRAFT
SCHEDULED
LIVE
COMPLETED
ABANDONED
CANCELLED
```

---

### 📊 Live Ball-by-Ball Scoring

CrickBoard supports detailed ball-level scoring.

For every delivery, the system can track:

* Batter
* Non-striker
* Bowler
* Runs scored
* Extras
* Wickets
* Player dismissed
* Wicket type
* Fielder
* Legal/illegal delivery
* Commentary
* Over number
* Ball number
* Delivery sequence

Supported extras include:

```text
WIDE
NO_BALL
BYE
LEG_BYE
```

Supported wicket types include:

```text
BOWLED
CAUGHT
LBW
RUN_OUT
STUMPED
HIT_WICKET
RETIRED_HURT
```

---

### 📋 Innings & Scorecards

The backend maintains innings-level information including:

* Batting team
* Bowling team
* Striker
* Non-striker
* Current bowler
* Total runs
* Total wickets
* Legal balls
* Total extras
* Delivery sequence
* Dismissed players
* Innings status

The application also provides match scorecards for completed/live match information.

---

### 🌐 Public Live Match

CrickBoard provides a public endpoint for accessing live match information without requiring normal authenticated application access.

```text
GET /api/v1/public/matches/:publicId/live
```

This allows a match to be shared through a public match identifier.

---

### 🌓 Theme Support

The frontend supports:

* Light mode
* Dark mode
* System preference detection
* Theme persistence using localStorage

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* React Router
* Axios
* Lucide React
* Tailwind CSS
* ESLint

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Joi
* bcrypt
* Helmet
* CORS
* Cookie Parser
* Axios

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 🏗️ Architecture

```text
CrickBoard
│
├── frontend/
│   │
│   └── React + Vite
│       │
│       ├── Authentication
│       ├── Dashboard
│       ├── Players
│       ├── Teams
│       ├── Matches
│       ├── Match Setup
│       ├── Live Match
│       ├── Scorecard
│       └── Public Match
│
└── backend/
    │
    └── Node.js + Express
        │
        ├── Authentication
        ├── Player APIs
        ├── Team APIs
        ├── Match APIs
        ├── Scoring APIs
        ├── Public Match API
        └── MongoDB
```

---

## 📂 Project Structure

```text
CrickBoard/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 📡 API Structure

The backend exposes versioned REST APIs under:

```text
/api/v1
```

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Players

```text
POST   /api/v1/players
GET    /api/v1/players
GET    /api/v1/players/:id
PATCH  /api/v1/players/:id
DELETE /api/v1/players/:id
```

### Teams

```text
POST   /api/v1/teams
GET    /api/v1/teams
GET    /api/v1/teams/:id
PATCH  /api/v1/teams/:id
DELETE /api/v1/teams/:id

POST   /api/v1/teams/:id/players
DELETE /api/v1/teams/:id/players/:playerId
```

### Matches

```text
POST  /api/v1/matches
GET   /api/v1/matches
GET   /api/v1/matches/:id
GET   /api/v1/matches/:id/scorecard

PUT   /api/v1/matches/:id/playing-xi
PATCH /api/v1/matches/:id/toss
POST  /api/v1/matches/:id/start
PATCH /api/v1/matches/:id/innings/players
```

### Scoring

```text
GET   /api/v1/matches/:matchId/innings
GET   /api/v1/matches/:matchId/balls
POST  /api/v1/matches/:matchId/balls

PATCH /api/v1/matches/:matchId/innings/batter
PATCH /api/v1/matches/:matchId/innings/bowler
```

### Public Match

```text
GET /api/v1/public/matches/:publicId/live
```

---

## 🔒 Backend Security

The backend includes several security and reliability measures:

* JWT-based authentication
* Cookie-based access token handling
* Password hashing with bcrypt
* Request validation with Joi
* Helmet security middleware
* CORS configuration
* Protected API routes
* Centralized 404 handling
* Centralized error handling
* MongoDB indexes for frequently queried fields

---

## 🗄️ Database Design

CrickBoard uses **MongoDB with Mongoose**.

Main models include:

```text
User
Player
Team
Match
Innings
BallEvent
```

The data model connects matches with teams, teams with players, innings with matches, and individual ball events with innings and matches.

Indexes are also used for important query patterns such as:

* User email
* User role/status
* Player ownership
* Team ownership
* Match status
* Match teams
* Innings
* Ball events

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB or a MongoDB connection
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/HiteshLohar/CrickBoard.git

cd CrickBoard
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

Configure the authentication/JWT environment variables required by the backend as well.

Start the backend:

```bash
npm run dev
```

For production-style execution:

```bash
npm start
```

---

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🔄 Application Flow

```text
Register / Login
       │
       ▼
   Dashboard
       │
 ┌─────┼─────────┐
 ▼     ▼         ▼
Players Teams   Matches
               │
               ▼
          Create Match
               │
               ▼
          Match Setup
               │
               ├── Playing XI
               ├── Toss
               └── Start Match
                       │
                       ▼
                 Live Scoring
                       │
                ┌──────┴──────┐
                ▼             ▼
           Ball Events     Innings
                │             │
                └──────┬──────┘
                       ▼
                   Scorecard
                       │
                       ▼
                Public Live View
```

---

## 🎯 What I Built & Learned

This project helped me work with:

* Node.js backend architecture
* Express.js REST APIs
* MongoDB schema design
* Mongoose relationships and indexes
* JWT authentication
* Cookie-based authentication
* Joi request validation
* Middleware architecture
* Centralized error handling
* Cricket scoring domain logic
* Ball-by-ball event modeling
* Match and innings state management
* React Router protected routes
* React Context API
* API integration using Axios
* Light/dark theme management
* Full-stack frontend/backend integration

---

## 📌 Project Status

CrickBoard is an actively developed full-stack cricket scoring application with a structured backend, React frontend, authentication, match management, and detailed ball-by-ball scoring functionality.

---

## 👨‍💻 Author

**Hitesh Lohar**

GitHub:
https://github.com/HiteshLohar

Repository:
https://github.com/HiteshLohar/CrickBoard
