# 👨‍🍳 CookGPT: The Full-Stack Cloud Kitchen Ecosystem

CookGPT is an enterprise-grade, localized Cloud Kitchen platform. It was architected to seamlessly bridge the gap between hungry **Customers**, busy **Kitchen Chefs**, and constantly moving **Delivery Riders** via a centralized, real-time command center.

### ✨ Premium Aesthetic
The platform features a **High Society Premium Light Theme**, utilizing elegant **Playfair Display** typography, champagne-gold accents, and a refined glassmorphism design system to provide an elite culinary experience.

---

## 🏗️ Architecture Matrix

- **Backend API**: Python 3, Django, Django REST Framework, SQLite (Development), Swagger (drf-yasg).
- **Frontend SPA**: Vite, React 18, React Router DOM, Axios.
- **Security**: 
    - Stateless JSON Web Tokens (`djangorestframework-simplejwt`).
    - User Role Access Control lists (`IsKitchenAdmin`, `IsDeliveryRider`).
    - **Environment Protection**: Sensitive keys (Gemini API, Django Secret Key) are managed via `python-dotenv`.
- **Intelligence**: 
    - **Bespoke AI**: Integrated with Google Gemini (via `google-generativeai`) for high-end recipe curation.
    - Offline local-heuristic fallback matching.

---

## 🎯 The Three Pillars (User Personas)

### 1. The Customer App (`/`, `/menu`, `/cart`, `/cookgpt`)
*   **Secure Cart Logic**: Stores cart states inside browser local storage synced against the API upon authenticated checkout.
*   **Live Order Tracking**: After checkout (`/checkout`), the portal automatically initiates a polling loop (`setInterval`) requesting the `GET /api/v1/orders/` endpoint every 15 seconds to drive a CSS-animated visual status bar.
*   **🤖 Bespoke AI (CookGPT)**: A luxury conversational recommendation UI that scans available ingredients and utilizes Gemini AI to return visually structured Recipe Cards.

### 2. The Kitchen Admin Command Center (`/admin`)
*   **Role Protection**: Only users authenticated as `kitchen_admin` can load these routes. Generic logins receive a `403 Forbidden` wall.
*   **Live Analytics**: Hits the server's `dashboard/stats/` for aggregated finance summaries. 
*   **Kitchen Display System (KDS)**: Located at `/admin/orders`. Kitchen staff monitor incoming remote tickets. By altering a dropdown (`Pending ➔ Preparing ➔ Ready`), they instantly mutate the customer's remote loading screen, triggering the real-world cooking loop.
*   **Live Menu Manager**: At `/admin/menu`, Admins perform instant frontend CRUD actions `(Create, Read, Update, Delete)` via `PUT/POST/DELETE` API calls that physically push and mutate menus in the overarching database without touching code.

### 3. The Delivery Agent Portal (`/delivery`)
*   **Mobile-First UX**: Strips away generic navigation for a streamlined, GPS-focused mobile view.
*   **Dispatch Board**: Automatically pulls dispatched delivery tickets.
*   **Real-time GPS Simulator**: Agents click "Sync GPS Now" to fire an automated `PUT` containing lat/long to `/api/v1/delivery/{id}/location/`.
*   **Finalization**: Swiping "Mark Delivered" triggers `PATCH /api/v1/delivery/{id}/status/`, formally closing the order arc and completing the application loop.

---

## 🔍 Deep Architectural & Component Analysis

Following a detailed line-by-line review of the codebase, here is the technical breakdown of the system components:

### 💼 Domain & Application Service Layers
Business logic is decoupled from external libraries or database structures:
*   **Service Interfaces**: Defined in [interfaces](COOKgptAPI/application/interfaces/__init__.py) (e.g., `IOrderService`, `IAIService`) to guarantee a stable API contract.
*   **Business Logic Realization**: Contained in [services](COOKgptAPI/application/services/__init__.py). For instance, [OrderService](COOKgptAPI/application/services/__init__.py#L145) handles the state machine transitions and triggers [PaymentService](COOKgptAPI/application/services/__init__.py#L224) and [DeliveryService](COOKgptAPI/application/services/__init__.py#L248) events.

### 🗄️ Infrastructure & Django ORM Layer
The database schemas are isolated within [infrastructure/models](COOKgptAPI/infrastructure/models/__init__.py):
*   **Relational Schema Mapping**: Core entities such as [MenuItem](COOKgptAPI/infrastructure/models/__init__.py#L76), [CartItem](COOKgptAPI/infrastructure/models/__init__.py#L117), [Payment](COOKgptAPI/infrastructure/models/__init__.py#L201), [Delivery](COOKgptAPI/infrastructure/models/__init__.py#L234), and [KitchenTimer](COOKgptAPI/infrastructure/models/__init__.py#L289) maintain clean foreign key relationships back to [CustomUser](COOKgptAPI/infrastructure/models/__init__.py#L12) and [Order](COOKgptAPI/infrastructure/models/__init__.py#L140).
*   **Encapsulated Repositories**: Data access methods are defined in [domain/repositories](COOKgptAPI/domain/repositories) and implemented in [infrastructure/repositories](COOKgptAPI/infrastructure/repositories/__init__.py), meaning standard ORM queries do not leak into the business logic.

### 🔐 Security & Token Session Lifecycle
*   **Stateless Authorization**: Requests are authorized with JWT headers using [IsAuthenticated](COOKgptAPI/presentation/api/permissions.py), [IsCustomer](COOKgptAPI/presentation/api/permissions.py), [IsKitchenAdmin](COOKgptAPI/presentation/api/permissions.py), and [IsDeliveryAgent](COOKgptAPI/presentation/api/permissions.py) decorators.
*   **Axios Interceptor**: Implemented in [apiClient.js](cookgpt-frontend/src/api/apiClient.js) to append the `Authorization: Bearer <token>` header to all requests. If a `401 Unauthorized` response is returned, the interceptor automatically attempts to rotate tokens via `/auth/refresh/` and retries the failed request seamlessly.

### 🤖 Gemini AI Recipe Curation Engine
*   **Streaming Responses**: The `ai_chat` view utilizes Django's `StreamingHttpResponse` with SSE (`text/event-stream`) to deliver word-by-word recipe updates.
*   **Guardrail Sanitization**: Implemented in [AIService._clean_response](COOKgptAPI/application/services/__init__.py#L420) to filter out internal system thoughts and instruct the model to only output content after the `MASTER_CHEF:` separator.
*   **Offline Matcher**: Uses a local fallback database (`RECIPE_DATABASE`) and ingredient weight calculators when Gemini credentials are unset or the API goes offline.

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
│   ├── .env.example         # Template for environment variables
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

# Install requirements
pip install -r requirements.txt
pip install python-dotenv google-generativeai

# Setup Environment Variables
# Copy .env.example to .env and fill in your keys
cp .env.example .env

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
