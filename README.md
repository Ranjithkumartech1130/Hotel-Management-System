# 🏨 Hotel Management System (BestBites)

A comprehensive Hotel and Food Management System with real-time table booking, food ordering, and an advanced admin dashboard.

## 🚀 Features

-   **Stunning UI/UX**: Premium design with glassmorphism, smooth animations, and responsive layout.
-   **Table Management**: Real-time table status tracking (Available/Occupied) with visual map.
-   **Food Menu**: Wide variety of food items with category filtering and "Today's Special" highlights.
-   **Shopping Cart**: Dynamic cart management with local storage persistence.
-   **Email Confirmations**: Automated order confirmation emails sent via Nodemailer.
-   **Admin Dashboard**:
    -   Secure JWT-based Login (configured via environment variables).
    -   Real-time order management and deletion.
    -   Table status toggling and Menu availability control.
    -   CSV Export of orders for business analysis.

---

## 🛠️ Technical Stack

-   **Frontend**: HTML5, CSS3 (Custom Glassmorphism), JavaScript (jQuery), Bootstrap 5.
-   **Backend**: Node.js, Express.js, `dotenv` for configuration.
-   **Authentication**: JSON Web Tokens (JWT).
-   **Email**: Nodemailer (Gmail SMTP).
-   **Data**: JSON-based persistent storage.

---

## 🏃 Local Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.

### 2. Setup Backend
1. Go to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_secret_key
   ADMIN_USERNAME=pooja
   ADMIN_PASSWORD=pooja123
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   ```
4. Start the server: `node server.js`

### 3. Launch Frontend
Open `frontend/index.html` in your browser or visit `http://localhost:5000` (since the backend now serves the frontend).

---

## ☁️ Render Deployment Guide

Follow these steps to deploy this system to [Render](https://render.com/):

### 1. Create a Web Service
- Connect your GitHub repository.
- **Root Directory**: `backend` (or leave empty if your repo root is the project root, but set the Build Command accordingly).
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 2. Configure Environment Variables
In the Render Dashboard, go to **Environment** and add the following keys:
- `JWT_SECRET`: A long random string.
- `ADMIN_USERNAME`: Your preferred admin username (e.g., `pooja`).
- `ADMIN_PASSWORD`: Your preferred admin password (e.g., `pooja123`).
- `EMAIL_USER`: Your Gmail address.
- `EMAIL_PASS`: Your Google App Password.
- `PORT`: `10000` (Render's default).

### 3. Frontend Sync
The app is configured to automatically detect if it's running on Render and will use the correct URL for API calls. No manual code changes are needed in the HTML files.

---

## 📂 Project Structure

```text
Hotel-Management-System/
├── frontend/          # Web interface files
│   ├── assets/       # Images and icons
│   ├── index.html    # Home page
│   ├── admin.html    # Admin Dashboard
│   ├── checkout.html # Checkout page
│   ├── script.js     # Frontend logic
│   └── style.css     # Premium styling
└── backend/           # Node.js server files
    ├── server.js     # Main entry point (serves API & Frontend)
    ├── .env          # Secrets (local only)
    ├── orders.json   # Local Database
    └── package.json  # Dependencies
```

---

© 2026 Hotel Management System. Built for Excellence.
