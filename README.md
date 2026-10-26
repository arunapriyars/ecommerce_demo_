 VibeCart — Shop Your Vibe

[![Full-Stack Assignment](https://img.shields.io/badge/Project-College%20Full--Stack%20Assignment-purple.svg)](https://github.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Tailwind-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-Relational%20SQLite%20(WAL%20Mode)-orange.svg)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)
 Overview

VibeCart is a modern e-commerce web platform engineered for personality and mood-driven shopping. Unlike generic e-commerce clones, VibeCart organizes lifestyle gear, desk setups, gym essentials, apparel, and creative tools around **6 core lifestyle vibes**:
Main Character — *Stand out. Own the room.*
Study Mode — *Deep focus. Zero distractions.*
Gym Beast— *Crush limits. No excuses.*
Gamer Mode** — *High FPS. High intensity.*
Chill Mode** — *Breathe in. Unwind completely.*
Creative Mode** — *Express yourself. Pure artistry.*

Users can take an interactive **"What's Your Vibe?" Quiz** that analyzes their current activity, aesthetic preference, energy level, and gear priorities using a weighted recommendation engine to deliver curated product collections.

---

 Key Features

 Customer Storefront
- **Dynamic Homepage**: Hero composition with floating product cards, interactive trending vibe cards, and handpicked recommendations.
- **Interactive Vibe Quiz ("What's Your Vibe?")**: 4-question personality quiz that decodes your mood and calculates tailored product recommendations.
- **Live Search & Multi-Faceted Filtering**: Real-time search across titles, descriptions, categories, and mood tags with price and rating filters.
- **Rich Product Details**: High-resolution image galleries, dynamic *"Why you'll like it"* attribute badges, stock indicators, and customer reviews.
- **Interactive Shopping Cart**:
  - Live quantity adjustment & real-time recalculation.
  - Dynamic free shipping progress bar 
  - Promo code discounts (e.g. `VIBE20` for 20% off).
- **Vibe Shelf (Wishlist)**: 1-click bookmarking with heart micro-animations and direct *"Move to Cart"* support.
- **5-Step Checkout Pipeline**:
  - Cart review ➔ Shipping coordinates ➔ Order summary ➔ Simulated payment selection (UPI QR code, Credit/Debit card, Cash on Delivery) ➔ Order confirmation with celebration confetti
- **Visual Order Tracking**: Interactive 5-stage progress journey:
  $$\text{Order Placed} \longrightarrow \text{Processing} \longrightarrow \text{Shipped} \longrightarrow \text{Out for Delivery} \longrightarrow \text{Delivered}$$
- **User Authentication & Profile**: Secure JWT token authentication with bcrypt password hashing, customizable avatar, favorite vibe selector, and order history.

 Executive Admin Dashboard
- **Completely Independent Dashboard UI**: Dark-mode command center layout with role guards.
- **Database Telemetry & Analytics**: Real-time metrics for total revenue, total orders, catalog count, active users, and low-stock alerts.
- **Visual Sales Distribution Chart**: Bar distribution showing sales breakdown by vibe aesthetic.
- **Full Products CRUD**: Add, edit, delete, update stock, change pricing, and assign vibe and category tags.
- **Order Fulfillment Pipeline**: Inspect customer shipping coordinates and update order statuses dynamically.
- **Customer Directory**: View all registered user accounts with lifetime order volume and total spend.

---

Screenshots

| Homepage & Hero Floating Composition | Vibe Quiz ("What's Your Vibe?") |
|:---:|:---:|
| ![Homepage Placeholder](https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80) | ![Vibe Quiz Placeholder](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80) |

| Product Catalog & Filtering | Executive Admin Command Center |
|:---:|:---:|
| ![Catalog Placeholder](https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80) | ![Admin Dashboard Placeholder](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80) |

---

Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, React Router DOM v6, React Hot Toast, Canvas Confetti |
| Backend | Node.js, Express.js, RESTful API architecture |
| Database| Relational SQLite (`node:sqlite` DatabaseSync) with WAL mode and foreign key constraints (PostgreSQL schema parity) |
| Authentication | JSON Web Tokens (JWT) & bcryptjs salted password hashing |
| Dev Tools | Nodemon, Concurrently, PostCSS, Autoprefixer |

---

 System Architecture

`mermaid
graph TD
    Client["Client Browser (React + TypeScript + Tailwind)"]
    Router["React Router DOM (Storefront & Admin Layouts)"]
    Context["State Contexts (Auth, Cart, Wishlist)"]
    APIClient["API Service Layer (Fetch + JWT Auth Header)"]

    Express["Express.js Server (Port 5000)"]
    AuthMW["JWT Auth & Admin Middleware"]
    Controllers["Controllers (Products, Cart, Orders, Vibes, Admin)"]
    DBLayer["SQLite Relational DB Engine (vibecart.db)"]

    Client --> Router
    Router --> Context
    Context --> APIClient
    APIClient -- "HTTP REST Requests (/api/*)" --> Express

    Express --> AuthMW
    AuthMW --> Controllers
    Controllers --> DBLayer
```

--

 API Endpoints Reference

 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/profile` — Get current user profile and order counts
- `PUT /api/auth/profile` — Update user profile coordinates and favorite vibe
- `POST /api/auth/logout` — Invalidate user session

 Products (`/api/products`)
- `GET /api/products` — List products with search, category, vibe, price, and rating filters
- `GET /api/products/:id` — Get product details and verified reviews
- `GET /api/products/:id/similar` — Get similar vibe-matched recommendations
- `POST /api/products` — *(Admin)* Create a new product
- `PUT /api/products/:id` — *(Admin)* Update product details, stock, or price
- `DELETE /api/products/:id` — *(Admin)* Delete a product

 Vibes & Recommendations (`/api/vibes`)
- `GET /api/vibes` — List all 6 trending vibes with product counts
- `POST /api/vibes/recommend` — Calculate dominant vibe from 4-question quiz and return matched products

 Shopping Cart (`/api/cart`)
- `GET /api/cart` — Get user's cart items with dynamic free shipping progress
- `POST /api/cart` — Add product to cart with stock validation
- `PUT /api/cart/:id` — Update item quantity (+ / -)
- `DELETE /api/cart/:id` — Remove item from cart
- `DELETE /api/cart` — Clear entire cart

 Wishlist (`/api/wishlist`)
- `GET /api/wishlist` — View all bookmarked items on the user's vibe shelf
- `POST /api/wishlist` — Toggle item saved status
- `POST /api/wishlist/move-to-cart` — Move saved product directly into cart
- `DELETE /api/wishlist/:id` — Remove item from wishlist

 Orders & Tracking (`/api/orders`)
- `POST /api/orders` — Create order, execute stock deduction, and clear cart (Transaction)
- `GET /api/orders` — List user's past order history
- `GET /api/orders/:id` — View single order tracking with 5-stage progress journey

 Admin Portal (`/api/admin`)
- `GET /api/admin/dashboard` — Telemetry stats, revenue, low stock watchlist, and vibe sales chart
- `GET /api/admin/orders` — View all orders with customer details and filter by status
- `PUT /api/admin/orders/:id/status` — Update order fulfillment stage
- `GET /api/admin/users` — View all registered accounts with lifetime order metrics

---

 Getting Started

 Prerequisites
- **Node.js** v20.0.0 or higher (Tested on Node.js v24)
- **npm** v10.0.0 or higher

 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vibecart.git
   cd vibecart
   ```

2. **Install all dependencies (Root, Backend, and Frontend):**
   ```bash
   npm run setup
   ```
   *(Or install manually: `npm install && cd backend && npm install && cd ../frontend && npm install`)*

3. **Database Seeding (Pre-configured):**
   The application auto-seeds on first run, or you can run:
   ```bash
   npm run seed
   ```

---
 Running Locally

To start **both backend and frontend concurrently** with one command from the project root:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

 Demo Credentials

For convenience during evaluation and grading, quick **1-click login buttons** are available on the Login screen, or use these credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Demo Customer** | `user@vibecart.com` | `password123` | Storefront, Wishlist, Cart, Checkout, Order Tracking |
| **Demo Administrator** | `admin@vibecart.com` | `admin123` | Full Storefront + Executive Admin Dashboard (`/admin`) |

---
 Automated Testing

A comprehensive end-to-end integration test runner is included to test all 33 endpoints and capabilities across authentication, quiz calculation, cart, orders, and admin CRUD:

```bash
node test_e2e.js
```

---

 Future Improvements

- [ ] AI-driven semantic search using vector embeddings.
- [ ] Integration with real Razorpay / Stripe payment webhooks.
- [ ] Customer review image uploads.
- [ ] Real-time websocket notification on order dispatch.

---

 Author

**VibeCart Engineering Team**  
*Full-Stack Web Development College Capstone Assignment*
