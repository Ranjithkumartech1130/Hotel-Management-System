# 🍔 BestBites - Food Ordering System

BestBites is a modern, responsive food ordering web application featuring a stunning frontend and a robust Node.js backend with an integrated Admin Dashboard.

## 🚀 Features

-   **Stunning UI/UX**: Premium design with smooth animations and responsive layout.
-   **Food Menu**: Wide variety of food items with category filtering (Burger, Pizza, Sweets, etc.).
-   **Shopping Cart**: Dynamic cart management using local storage.
-   **Checkout System**: Secure billing and order placement.
-   **Admin Dashboard**:
    -   Secure JWT-based Login.
    -   Real-time order tracking.
    -   CSV Export of orders for business analysis.

---

## 🛠️ Technical Stack

-   **Frontend**: HTML5, Vanilla CSS, JavaScript (jQuery), Bootstrap 5, Flaticon.
-   **Backend**: Node.js, Express.js.
-   **Authentication**: JSON Web Tokens (JWT).
-   **Data Storage**: JSON File-based storage (`orders.json`).
-   **Export Utility**: `json2csv` for order reporting.

---

## 📦 Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

---

## 🏃 How to Run

### 1. Start the Backend Server
1. Open your terminal or command prompt.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   *The server will run on `http://localhost:5000`*

### 2. Launch the Frontend
1. Simply open the `frontend/index.html` file in any modern web browser.
2. Ensure the backend server is running in the background for the ordering system to work.

---

## 🔐 Admin Access

To access the Admin Dashboard:
1. Click the **User-Lock icon** in the navbar.
2. **Username**: `admin`
3. **Password**: `admin123`

---

## 📄 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/orders` | Place a new order |
| POST | `/api/admin/login` | Admin authentication |
| GET | `/api/admin/orders` | Fetch all orders (Auth required) |
| GET | `/api/admin/export` | Download orders as CSV (Auth required) |

---

## 📂 Project Structure

```text
BestBites-main/
├── frontend/          # Web interface files
│   ├── assets/       # Images and icons
│   ├── index.html    # Home page
│   ├── admin.html    # Admin Dashboard
│   ├── checkout.html # Checkout page
│   ├── script.js     # Frontend logic
│   └── style.css     # Custom styling
└── backend/           # Node.js server files
    ├── server.js     # Main entry point
    ├── orders.json   # Local Database
    └── package.json  # Dependencies
```

---

© 2026 BestBites. Built for Food Lovers.
