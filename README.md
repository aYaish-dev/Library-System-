# 📚 Library Resource Tracking System (LRTS)

The **Library Resource Tracking System (LRTS)** is a web application designed to modernize university library operations. It provides a seamless experience for students to discover, reserve, and review resources, while offering staff powerful tools for inventory management and analytics.

## 🚀 Key Features

### 🌟 For Users (Students/Faculty)

* **Smart Catalog**: Advanced search with filtering by genre, author, and availability status.
* **Social & Discovery**: Rate and review books to share insights with the community.
* **Reservation System**: Join waitlists for unavailable items and get notified when they become free.
* **Dashboard**: Track active loans, due dates, and calculated fines in real-time.
* **Responsive Design**: A modern, glassmorphism-inspired UI that works on all devices.

### 🛡️ For Administrators & Staff

* **Command Center**: A comprehensive dashboard to monitor overdue loans and system health.
* **Inventory Control**: Manage physical copies, track locations (Branch/Floor/Shelf), and override statuses.
* **Analytics**: Visualize borrowing trends, waitlist pressure, and top-performing resources.
* **User Management**: Role-based access control (RBAC) for Admins, Staff, Faculty, and Students.

---

## 🛠️ Technology Stack

**Frontend**

* **Framework**: React (Vite)
* **Language**: JavaScript (ES6+)
* **Styling**: Modern CSS with CSS Variables & Glassmorphism
* **State Management**: Custom Hooks & Context

**Backend**

* **Runtime**: Node.js & Express
* **Language**: TypeScript
* **Database**: PostgreSQL (via Prisma ORM)
* **Caching**: Redis (for session/performance optimization)
* **Validation**: Zod
* **Authentication**: JWT (JSON Web Tokens)

---

## 📖 Setup Tutorial

Follow these steps to get the system running on your local machine.

### Prerequisites

* **Node.js** (v18 or higher)
* **Docker Desktop** (recommended for running the database)
* **Git**

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd library-system

```

### Step 2: Start Infrastructure (Database)

The system requires PostgreSQL and Redis. The easiest way to run these is with Docker.

1. Open a terminal in the root directory.
2. Run the following command to start the databases:
```bash
docker-compose up -d

```


*This reads the `docker-compose.yml` file and spins up the required services.*

### Step 3: Backend Configuration

1. Navigate to the backend folder:
```bash
cd backend

```


2. Install dependencies:
```bash
npm install

```


3. **Environment Setup**:
* Create a `.env` file in the `backend` folder.
* Add your database connection string (default from docker-compose):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/lrts_db?schema=public"
PORT=4000
JWT_SECRET="supersecretkey"

```




4. **Database Initialization**:
* Apply the database schema:
```bash
npx prisma db push

```


* Generate the Prisma client:
```bash
npx prisma generate

```




5. **Seed Data (The "Monster" Seed)**:
* Populate the database with real books, users, and reviews:
```bash
npx tsx prisma/seed_real.ts

```




6. **Start the Server**:
```bash
npm run dev

```


*The backend will start on `http://localhost:4000`.*

### Step 4: Frontend Configuration

1. Open a new terminal window and navigate to the frontend folder:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```


3. **Start the Application**:
```bash
npm run dev

```


4. Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

---

## 🔐 Default Login Credentials

The system comes pre-loaded with the following accounts (password is the same for all):

| Role | Email | Password |
| --- | --- | --- |
| **Student** | `student@uni.edu` | `123456` |
| **Staff** | `staff@uni.edu` | `123456` |
| **Admin** | `admin@uni.edu` | `123456` |

*You can also register a new account via the Sign-Up page.*

---

## 🧪 Running Tests

To ensure the system authorization logic is working correctly:

```bash
cd backend
npm test

```

*This runs the authorization test suite located in `backend/tests/authz.test.ts`.*

---

## 📂 Project Structure

```
├── backend/
│   ├── prisma/          # Database schema & seeds
│   ├── src/
│   │   ├── controllers/ # Route logic
│   │   ├── middleware/  # Auth & Error handling
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Business logic (Loans, Reservations)
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/       # React components for each page
│   │   ├── api.js       # API communication layer
│   │   └── style.css    # Global styles
│   └── ...
└── docker-compose.yml   # Database orchestration

```


