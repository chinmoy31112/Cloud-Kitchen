# 👨‍🍳 CookGPT: The Full-Stack Cloud Kitchen Ecosystem

CookGPT is an enterprise-grade, localized Cloud Kitchen platform. It was architected to seamlessly bridge the gap between hungry **Customers**, busy **Kitchen Chefs**, and constantly moving **Delivery Riders** via a centralized, real-time command center.

This repository is split into a robust **Django REST framework backend** and a visually stunning **Vite + React frontend** utilizing custom glassmorphism, responsive native layouts, and secure role-based JWT authentication.

---

## 🏗️ Architecture Matrix

- **Backend API**: Python 3, Django, Django REST Framework, SQLite (Development), Swagger (drf-yasg).
- **Frontend SPA**: Vite, React 18, React Router DOM, Axios.
- **Security**: Stateless JSON Web Tokens (`djangorestframework-simplejwt`), User Role Access Control lists (`IsKitchenAdmin`, `IsDeliveryRider`).
- **Intelligence**: Offline local-heuristic text matching for the 'CookGPT' recipe generator (0 API calls required).

---

## 🎯 The Three Pillars (User Personas)

### 1. The Customer App (`/`, `/menu`, `/cart`, `/cookgpt`)
*   **Secure Cart Logic**: Stores cart states inside browser local storage synced against the API upon authenticated checkout.
*   **Live Order Tracking**: After checkout (`/checkout`), the portal automatically initiates a polling loop (`setInterval`) requesting the `GET /api/v1/orders/` endpoint every 15 seconds to drive a CSS-animated visual status bar.
*   **🤖 CookGPT AI**: A localized conversational recommendation UI that scans available ingredients and utilizes a Math Heuristic to return visually structured Recipe Cards.

### 2. The Kitchen Admin Command Center (`/admin`)
*   **Role Protection**: Only users authenticated as `kitchen_admin` can load these routes. Generic logins receive a `403 Forbidden` wall.
*   **Live Analytics**: Hits the server's `dashboard/stats/` for aggregated finance summaries. 
*   **Kitchen Display System (KDS)**: Located at `/admin/orders`. Kitchen staff monitor incoming remote tickets. By altering a dropdown (`Pending ➔ Preparing ➔ Ready`), they instantly mutate the customer's remote loading screen, triggering the real-world cooking loop.
*   **Live Menu Manager**: At `/admin/menu`, Admins perform instant frontend CRUD actions `(Create, Read, Update, Delete)` via `PUT/POST/DELETE` API calls that physically push and mutate menus in the overarching database without touching code.

### 3. The Delivery Agent Portal (`/delivery`)
*   **Mobile-First UX**: Strips away generic navigation for a streamlined, GPS-focused mobile view.
*   **Dispatch Board**: Automatically pulls dispatched delivery tickets.
*   **Real-time GPS Simulator**: Agents click "Sync GPS Now" to fire an automated `PATCH` containing lat/long to `/api/v1/delivery/{id}/location/`.
*   **Finalization**: Swiping "Mark Delivered" triggers `PATCH /api/v1/delivery/{id}/status/`, formally closing the order arc and completing the application loop.

---

## 💻 Tech Stack & Folder Structure

The repository is modularly segmented:

```
Cloude Kitchen/
├── COOKgptAPI/              # The Django Backend Interface
│   ├── application/         # Core business logic (Services/Interfaces)
│   ├── cookgpt/             # Django Settings & Master URLs
│   ├── domain/              # Entities, rules, and repositories
│   ├── infrastructure/      # Database models & ORM migrations
│   ├── presentation/        # API Views and API Url mapping
│   ├── manage.py           
│   ├── seed_menu.py         # Scripts to hydrate the Database
│   └── create_rider.py      # Automated testing scripts
│
└── cookgpt-frontend/        # The React SPA
    ├── src/
    │   ├── api/             # Axios Interceptors handling JWT injection
    │   ├── components/      # Reusable UI (BaseLayout, AdminLayout, DeliveryLayout)
    │   ├── context/         # AuthContext (React Global State)
    │   └── pages/           # Page Routing (Admin, Customer, Delivery)
```

---

## 🚀 Setup & Installation
This project runs entirely locally. Follow these specific steps to run the exact environment.

### 1. The Backend Shell
Open a terminal and navigate to `COOKgptAPI`.
```bash
cd "Cloude Kitchen/COOKgptAPI"

# Activate your virtual environment (Windows)
.\venv\Scripts\activate

# Install requirements (if not already done)
pip install -r requirements.txt

# Run migrations and seed data
python manage.py migrate
python seed_menu.py

# Spin up the backend (Runs on port 8000)
python manage.py runserver
```

### 2. The Frontend Shell
Open a separate terminal and navigate to `cookgpt-frontend`.
```bash
cd "Cloude Kitchen/cookgpt-frontend"

# Install node packages
npm install

# Start the Vite development build (Runs on port 5173)
npm run dev
```

---

## 🔐 Testing Accounts (Pre-Seeded)

To successfully view all three application personas without `403 Access Denied` errors, use the following roles that were statically pushed into the database.

| Persona | Environment/URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Kitchen Admin** | `http://localhost:5173/admin` | `admin2@cookgpt.com` | `password123` |
| **Delivery Agent** | `http://localhost:5173/delivery` | `rider@cookgpt.com` | `password123` |
| **Customer** | `http://localhost:5173/` | *(Create your own account)* | *(Any)* |

> **Important Testing Note**: Your browser's `localStorage` syncs across tabs. To test an Admin dropping an order off to a Delivery Agent simultaneously alongside a Customer placing that order, **you must use two completely separate Browsers (Chrome + Edge)** or an **Incognito Session**, so their JWT tokens do not clash!

---

## 📖 API Documentation

Need to inspect the backend structure? While the Django server is running, navigate to `http://127.0.0.1:8000/swagger/` to explicitly visualize and test all `POST/GET/PUT/PATCH/DELETE` endpoints via the integrated `drf-yasg` documentation suite.
