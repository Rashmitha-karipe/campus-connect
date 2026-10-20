# Campus-Connect

A full-stack college event management platform where **organizers** request events, **admins** approve or reject them, and **students** discover and register for approved events.

**Live demo:** https://campus-connect-s4hx.onrender.com
**Source code:** https://github.com/Rashmitha-karipe/campus-connect

> The demo runs on a free hosting plan. The first load may take up to a minute (the instance sleeps when idle), and data may reset after a restart.

---

## Problem Statement

In most colleges, event information is scattered across notice boards, WhatsApp groups and posters, so students often miss events or hear about them too late. Registration is manual, and there is no structured way for admins to review event requests before they are announced.

## Solution

Campus-Connect brings event discovery, approval and registration into one web platform with role-based access:

| Role | What they can do |
|---|---|
| **Student** | Browse approved events, open a detail popup with the poster, register or cancel, view "My registrations" |
| **Organizer** | Create event requests with a poster image, track status (pending / approved / rejected) and registration counts |
| **Admin** | Review event requests, approve or reject them, view login activity (successful and failed attempts) |

## Key Features

- Role-based authentication (student, organizer, admin) using JWT
- Admin approval workflow: events stay hidden from students until approved
- Event poster upload with file type and size validation
- Event detail popup built with the native HTML `<dialog>` element
- One registration per student per event, enforced by a database constraint
- Login activity log for admins, including failed attempts
- Responsive layout with keyboard-visible focus styles

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla, no framework) |
| Backend | Node.js, Express.js |
| Database | SQLite (Node's built-in `node:sqlite`) |
| Authentication | JSON Web Tokens (`jsonwebtoken`), password hashing with `bcryptjs` |
| File upload | Multer |
| Tools | Git, GitHub, VS Code, Nodemon |
| Deployment | Render |

## Architecture

```
Browser (HTML / CSS / JS)
        |  fetch() with  Authorization: Bearer <JWT>
        v
Express server
   |-- verifyToken      -> checks the JWT on every protected route
   |-- requireRole      -> checks the user's role (student / organizer / admin)
   |-- routes           -> auth, events, admin
        |
        v
SQLite database (users, events, registrations, login_logs)
```

Role checks happen **on the server**, not only by hiding buttons in the UI, so a user cannot reach another role's data by calling the API directly.

## Database Design

| Table | Purpose | Key columns |
|---|---|---|
| `users` | All accounts | id, name, email (unique), password (hashed), role |
| `events` | Event requests | id, title, description, venue, event_date, image, organizer_id (FK), status |
| `registrations` | Student sign-ups | id, event_id (FK), student_id (FK), `UNIQUE(event_id, student_id)` |
| `login_logs` | Login audit trail | id, user_id, email, success, ip, created_at |

Event `status` is restricted to `pending`, `approved` or `rejected` with a `CHECK` constraint.

## API Endpoints

**Auth** (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a student or organizer account |
| POST | `/login` | Public | Log in and receive a JWT |

**Events** (`/api/events`), requires login

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | Student | List approved events with registration info |
| POST | `/:id/register` | Student | Register for an event |
| DELETE | `/:id/register` | Student | Cancel registration |
| POST | `/` | Organizer | Create an event (multipart form with optional poster) |
| GET | `/mine` | Organizer | List own events with status and counts |

**Admin** (`/api/admin`), requires admin role

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events?status=pending` | List events by status |
| PATCH | `/events/:id` | Approve or reject an event |
| GET | `/logins` | Latest 200 login attempts |

## Security Measures

- Passwords are hashed with **bcrypt** and never stored or logged in plain text
- **JWT** tokens expire after 1 day
- **Server-side role checks** on every protected route
- Public sign-up cannot create admins (only `student` and `organizer` are allowed)
- **Parameterized SQL queries** prevent SQL injection
- User-entered text is **escaped before rendering**, which prevents XSS
- Uploads are limited to JPEG, PNG and WebP, max 2 MB, with generated file names
- Secrets (`JWT_SECRET`, `ADMIN_PASSWORD`) live in environment variables and are excluded from Git

## Project Structure

```
campus-connect/
├── server.js              # App entry point
├── db.js                  # Database setup and default admin
├── middleware/
│   └── auth.js            # verifyToken, requireRole
├── routes/
│   ├── auth.js            # Register, login (with login logging)
│   ├── events.js          # Student and organizer endpoints, uploads
│   └── admin.js           # Approval and login activity
└── public/                # Frontend
    ├── index.html         # Login
    ├── register.html
    ├── student.html
    ├── organizer.html
    ├── admin.html
    ├── css/style.css
    ├── js/                # One script per page + shared common.js
    └── uploads/           # Uploaded posters (created automatically)
```

## Getting Started

**Requirements:** Node.js 22.5 or newer (needed for the built-in `node:sqlite`).

```bash
git clone https://github.com/Rashmitha-karipe/campus-connect.git
cd campus-connect
npm install
```

Create a `.env` file in the project root:

```
JWT_SECRET=replace_with_a_long_random_string
ADMIN_PASSWORD=choose_a_strong_password
PORT=3000
```

Start the app:

```bash
npm run dev     # development, auto-restarts with nodemon
npm start       # production
```

Open http://localhost:3000. A default admin (`admin@campus.com`) is created on first run using `ADMIN_PASSWORD`. If the variable is not set, it falls back to a weak default, so always set it.

## How to Try It

1. Log in as the admin.
2. In a separate (incognito) window, sign up as an **Organizer** and create an event with a poster.
3. As admin, open **Pending** and click **Approve**.
4. In another window, sign up as a **Student**, open the event popup and register.
5. As admin, check the **Login activity** tab to see all attempts.

## Deployment

Deployed on **Render** as a Node web service connected to this GitHub repository.

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `JWT_SECRET`, `ADMIN_PASSWORD`, `NODE_VERSION=22`

## Known Limitations

- SQLite and uploaded images are stored on the server's disk. On a free hosting plan the disk is temporary, so data can reset on restart. For production, use a hosted database and cloud image storage.
- No password reset or email verification yet.
- No rate limiting on login attempts (failed attempts are logged but not blocked).
- No automated tests yet.

## Future Improvements

- Email notifications for approvals and upcoming events
- Search and filters by date, keyword or category
- Rejection reason written by the admin and shown to the organizer
- Registered-student list and attendance tracking for organizers
- Migrate to MySQL/PostgreSQL and cloud image storage (for example Cloudinary)
- Login rate limiting, password reset, and automated tests

## What I Learned

- Designing a relational schema with foreign keys and constraints
- Building a REST API with Express and separating routes and middleware
- Implementing authentication and role-based authorization with JWT
- Handling file uploads safely with validation
- Connecting a vanilla JavaScript frontend to an API using `fetch`
- Version control with Git and deploying a Node app from GitHub

## Author

**Rashmitha Karipe**
GitHub: [@Rashmitha-karipe](https://github.com/Rashmitha-karipe)
