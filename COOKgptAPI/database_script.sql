/*
═══════════════════════════════════════════════════════════════════════════════
    CookGPT - Cloud Kitchen Management System
    Microsoft SQL Server Database Script
    
    Instructions:
    1. Open Microsoft SQL Server Management Studio (SSMS)
    2. Connect to your SQL Server instance
    3. Execute this entire script to create the database and all tables
═══════════════════════════════════════════════════════════════════════════════
*/

-- ════════════════════════════════════════════════════════════════════════════
-- CREATE DATABASE
-- ════════════════════════════════════════════════════════════════════════════

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CookGPT_DB')
BEGIN
    CREATE DATABASE CookGPT_DB;
END
GO

USE CookGPT_DB;
GO

-- ════════════════════════════════════════════════════════════════════════════
-- DROP EXISTING TABLES (in correct dependency order)
-- ════════════════════════════════════════════════════════════════════════════

IF OBJECT_ID('dbo.demand_predictions', 'U') IS NOT NULL DROP TABLE dbo.demand_predictions;
IF OBJECT_ID('dbo.kitchen_timers', 'U') IS NOT NULL DROP TABLE dbo.kitchen_timers;
IF OBJECT_ID('dbo.ai_recommendations', 'U') IS NOT NULL DROP TABLE dbo.ai_recommendations;
IF OBJECT_ID('dbo.deliveries', 'U') IS NOT NULL DROP TABLE dbo.deliveries;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.order_items', 'U') IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.cart_items', 'U') IS NOT NULL DROP TABLE dbo.cart_items;
IF OBJECT_ID('dbo.carts', 'U') IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.menu_items', 'U') IS NOT NULL DROP TABLE dbo.menu_items;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.addresses', 'U') IS NOT NULL DROP TABLE dbo.addresses;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 1. USERS TABLE (Custom User with Roles)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.users (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    password            NVARCHAR(128) NOT NULL,
    last_login          DATETIME2 NULL,
    is_superuser        BIT NOT NULL DEFAULT 0,
    username            NVARCHAR(150) NOT NULL UNIQUE,
    first_name          NVARCHAR(150) NOT NULL DEFAULT '',
    last_name           NVARCHAR(150) NOT NULL DEFAULT '',
    email               NVARCHAR(254) NOT NULL UNIQUE,
    is_staff            BIT NOT NULL DEFAULT 0,
    is_active           BIT NOT NULL DEFAULT 1,
    date_joined         DATETIME2 NOT NULL DEFAULT GETDATE(),
    phone               NVARCHAR(15) NOT NULL DEFAULT '',
    role                NVARCHAR(20) NOT NULL DEFAULT 'customer'
                        CHECK (role IN ('customer', 'kitchen_admin', 'delivery_agent')),
    profile_image       NVARCHAR(255) NULL
);
GO

CREATE INDEX ix_users_email ON dbo.users (email);
CREATE INDEX ix_users_role ON dbo.users (role);
CREATE INDEX ix_users_username ON dbo.users (username);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 2. ADDRESSES TABLE (User Delivery Addresses)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.addresses (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    label               NVARCHAR(50) NOT NULL DEFAULT 'Home',
    street              NVARCHAR(MAX) NOT NULL,
    city                NVARCHAR(100) NOT NULL,
    state               NVARCHAR(100) NOT NULL,
    pincode             NVARCHAR(10) NOT NULL,
    latitude            FLOAT NULL,
    longitude           FLOAT NULL,
    is_default          BIT NOT NULL DEFAULT 0,
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE INDEX ix_addresses_user ON dbo.addresses (user_id);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 3. CATEGORIES TABLE (Food Categories)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.categories (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(100) NOT NULL UNIQUE,
    description         NVARCHAR(MAX) NOT NULL DEFAULT '',
    image               NVARCHAR(255) NULL,
    is_active           BIT NOT NULL DEFAULT 1,
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 4. MENU ITEMS TABLE (Food Items)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.menu_items (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(200) NOT NULL,
    description         NVARCHAR(MAX) NOT NULL DEFAULT '',
    price               DECIMAL(10,2) NOT NULL,
    category_id         BIGINT NULL,
    image               NVARCHAR(255) NULL,
    is_available        BIT NOT NULL DEFAULT 1,
    is_vegetarian       BIT NOT NULL DEFAULT 0,
    preparation_time    INT NOT NULL DEFAULT 15,
    calories            INT NULL,
    rating              FLOAT NOT NULL DEFAULT 0.0,
    total_ratings       INT NOT NULL DEFAULT 0,
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_menuitems_category FOREIGN KEY (category_id) 
        REFERENCES dbo.categories(id) ON DELETE SET NULL
);
GO

CREATE INDEX ix_menuitems_category ON dbo.menu_items (category_id);
CREATE INDEX ix_menuitems_available ON dbo.menu_items (is_available);
CREATE INDEX ix_menuitems_name ON dbo.menu_items (name);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 5. CARTS TABLE (Shopping Carts)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.carts (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE,
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 6. CART ITEMS TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.cart_items (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    cart_id             BIGINT NOT NULL,
    menu_item_id        BIGINT NOT NULL,
    quantity            INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_cartitems_cart FOREIGN KEY (cart_id) 
        REFERENCES dbo.carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cartitems_menuitem FOREIGN KEY (menu_item_id) 
        REFERENCES dbo.menu_items(id) ON DELETE CASCADE,
    CONSTRAINT uq_cartitems_cart_menuitem UNIQUE (cart_id, menu_item_id)
);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 7. ORDERS TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.orders (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_number            NVARCHAR(20) NOT NULL UNIQUE,
    user_id                 BIGINT NOT NULL,
    delivery_address_id     BIGINT NULL,
    status                  NVARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'preparing', 'ready',
                                              'out_for_delivery', 'delivered', 'cancelled')),
    subtotal                DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount                DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_charge         DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax                     DECIMAL(10,2) NOT NULL DEFAULT 0,
    total                   DECIMAL(10,2) NOT NULL DEFAULT 0,
    special_instructions    NVARCHAR(MAX) NOT NULL DEFAULT '',
    estimated_delivery_time INT NULL,
    created_at              DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at              DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_address FOREIGN KEY (delivery_address_id) 
        REFERENCES dbo.addresses(id) ON DELETE NO ACTION
);
GO

CREATE INDEX ix_orders_user ON dbo.orders (user_id);
CREATE INDEX ix_orders_status ON dbo.orders (status);
CREATE INDEX ix_orders_created ON dbo.orders (created_at DESC);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 8. ORDER ITEMS TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.order_items (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id                BIGINT NOT NULL,
    menu_item_id            BIGINT NULL,
    menu_item_name          NVARCHAR(200) NOT NULL,
    quantity                INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price              DECIMAL(10,2) NOT NULL,
    total_price             DECIMAL(10,2) NOT NULL,
    special_instructions    NVARCHAR(MAX) NOT NULL DEFAULT '',

    CONSTRAINT fk_orderitems_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_orderitems_menuitem FOREIGN KEY (menu_item_id) 
        REFERENCES dbo.menu_items(id) ON DELETE NO ACTION
);
GO

CREATE INDEX ix_orderitems_order ON dbo.order_items (order_id);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 9. PAYMENTS TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.payments (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id                    BIGINT NOT NULL UNIQUE,
    amount                      DECIMAL(10,2) NOT NULL,
    method                      NVARCHAR(20) NOT NULL DEFAULT 'cash_on_delivery'
                                CHECK (method IN ('cash_on_delivery', 'upi', 'online')),
    status                      NVARCHAR(20) NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    transaction_id              NVARCHAR(100) NOT NULL DEFAULT '',
    payment_gateway_response    NVARCHAR(MAX) NOT NULL DEFAULT '',
    created_at                  DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at                  DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE
);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 10. DELIVERIES TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.deliveries (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id            BIGINT NOT NULL UNIQUE,
    agent_id            BIGINT NULL,
    status              NVARCHAR(20) NOT NULL DEFAULT 'assigned'
                        CHECK (status IN ('assigned', 'picked', 'in_transit', 'delivered', 'failed')),
    pickup_time         DATETIME2 NULL,
    delivery_time       DATETIME2 NULL,
    current_latitude    FLOAT NULL,
    current_longitude   FLOAT NULL,
    estimated_time      INT NULL,
    distance            FLOAT NULL,
    delivery_notes      NVARCHAR(MAX) NOT NULL DEFAULT '',
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliveries_agent FOREIGN KEY (agent_id) 
        REFERENCES dbo.users(id) ON DELETE NO ACTION
);
GO

CREATE INDEX ix_deliveries_agent ON dbo.deliveries (agent_id);
CREATE INDEX ix_deliveries_status ON dbo.deliveries (status);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 11. AI RECOMMENDATIONS TABLE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.ai_recommendations (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    input_ingredients       NVARCHAR(MAX) NOT NULL DEFAULT '[]',   -- JSON array
    recommended_recipes     NVARCHAR(MAX) NOT NULL DEFAULT '[]',   -- JSON array
    created_at              DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_airecommendations_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE INDEX ix_airecommendations_user ON dbo.ai_recommendations (user_id);
CREATE INDEX ix_airecommendations_created ON dbo.ai_recommendations (created_at DESC);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 12. KITCHEN TIMERS TABLE (Kitchen Display System)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.kitchen_timers (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id            BIGINT NOT NULL,
    order_item_id       BIGINT NULL,
    menu_item_name      NVARCHAR(200) NOT NULL,
    estimated_time      INT NOT NULL,
    actual_time         INT NULL,
    started_at          DATETIME2 NULL,
    completed_at        DATETIME2 NULL,
    status              NVARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'in_progress', 'completed')),

    CONSTRAINT fk_kitchentimers_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_kitchentimers_orderitem FOREIGN KEY (order_item_id) 
        REFERENCES dbo.order_items(id) ON DELETE NO ACTION
);
GO

CREATE INDEX ix_kitchentimers_status ON dbo.kitchen_timers (status);
GO

-- ════════════════════════════════════════════════════════════════════════════
-- 13. DEMAND PREDICTIONS TABLE (AI-based Demand Forecasting)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE dbo.demand_predictions (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    menu_item_id            BIGINT NOT NULL,
    predicted_date          DATE NOT NULL,
    predicted_quantity      INT NOT NULL,
    actual_quantity         INT NULL,
    confidence              FLOAT NOT NULL DEFAULT 0.0,
    created_at              DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_demandpredictions_menuitem FOREIGN KEY (menu_item_id) 
        REFERENCES dbo.menu_items(id) ON DELETE CASCADE
);
GO

CREATE INDEX ix_demandpredictions_date ON dbo.demand_predictions (predicted_date);
CREATE INDEX ix_demandpredictions_menuitem ON dbo.demand_predictions (menu_item_id);
GO


-- ════════════════════════════════════════════════════════════════════════════
-- INSERT DEFAULT CATEGORIES
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO dbo.categories (name, description) VALUES
    ('Pizza', 'Delicious pizzas with various toppings'),
    ('Burger', 'Juicy burgers and sandwiches'),
    ('Indian', 'Traditional Indian cuisine'),
    ('Chinese', 'Authentic Chinese food'),
    ('Beverages', 'Refreshing drinks and beverages'),
    ('Dessert', 'Sweet treats and desserts'),
    ('Salad', 'Fresh and healthy salads'),
    ('Other', 'Other food items');
GO


-- ════════════════════════════════════════════════════════════════════════════
-- CREATE A DEFAULT ADMIN USER (password: Admin@123)
-- Note: The password hash below is a Django-compatible PBKDF2 hash.
-- You should use Django's createsuperuser command instead for production.
-- ════════════════════════════════════════════════════════════════════════════

-- To create an admin user, run this Django command instead:
-- python manage.py createsuperuser


-- ════════════════════════════════════════════════════════════════════════════
-- USEFUL VIEWS (Optional)
-- ════════════════════════════════════════════════════════════════════════════

-- View: Order Summary with Customer and Payment details
IF OBJECT_ID('dbo.vw_order_summary', 'V') IS NOT NULL DROP VIEW dbo.vw_order_summary;
GO
CREATE VIEW dbo.vw_order_summary AS
SELECT 
    o.id AS order_id,
    o.order_number,
    o.status AS order_status,
    o.total AS order_total,
    o.created_at AS order_date,
    u.email AS customer_email,
    u.first_name + ' ' + u.last_name AS customer_name,
    u.phone AS customer_phone,
    p.method AS payment_method,
    p.status AS payment_status,
    d.status AS delivery_status,
    d.agent_id AS delivery_agent_id
FROM dbo.orders o
JOIN dbo.users u ON o.user_id = u.id
LEFT JOIN dbo.payments p ON o.id = p.order_id
LEFT JOIN dbo.deliveries d ON o.id = d.order_id;
GO

-- View: Dashboard Statistics
IF OBJECT_ID('dbo.vw_dashboard_stats', 'V') IS NOT NULL DROP VIEW dbo.vw_dashboard_stats;
GO
CREATE VIEW dbo.vw_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM dbo.orders) AS total_orders,
    (SELECT ISNULL(SUM(total), 0) FROM dbo.orders WHERE status = 'delivered') AS total_revenue,
    (SELECT COUNT(*) FROM dbo.users WHERE role = 'customer') AS total_customers,
    (SELECT COUNT(*) FROM dbo.menu_items) AS total_menu_items,
    (SELECT COUNT(*) FROM dbo.orders WHERE status = 'pending') AS pending_orders,
    (SELECT COUNT(*) FROM dbo.orders WHERE status = 'delivered') AS delivered_orders,
    (SELECT COUNT(*) FROM dbo.orders WHERE status = 'cancelled') AS cancelled_orders;
GO

-- View: Popular Items
IF OBJECT_ID('dbo.vw_popular_items', 'V') IS NOT NULL DROP VIEW dbo.vw_popular_items;
GO
CREATE VIEW dbo.vw_popular_items AS
SELECT TOP 20
    oi.menu_item_name,
    SUM(oi.quantity) AS total_ordered,
    SUM(oi.total_price) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count
FROM dbo.order_items oi
GROUP BY oi.menu_item_name
ORDER BY total_ordered DESC;
GO

-- View: Daily Sales Report
IF OBJECT_ID('dbo.vw_daily_sales', 'V') IS NOT NULL DROP VIEW dbo.vw_daily_sales;
GO
CREATE VIEW dbo.vw_daily_sales AS
SELECT
    CAST(o.created_at AS DATE) AS sale_date,
    COUNT(*) AS total_orders,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS average_order_value
FROM dbo.orders o
WHERE o.status != 'cancelled'
GROUP BY CAST(o.created_at AS DATE);
GO


PRINT '════════════════════════════════════════════════════════════';
PRINT '  CookGPT Database Created Successfully!';
PRINT '  Tables: 13 | Views: 4 | Categories: 8';
PRINT '════════════════════════════════════════════════════════════';
GO
