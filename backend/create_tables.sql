-- SQL Schema for IDFS Database
-- Generated based on SQLAlchemy models

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS salesdata CASCADE;
DROP TABLE IF EXISTS shipment CASCADE;
DROP TABLE IF EXISTS purchaseorder CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS storeinventory CASCADE;
DROP TABLE IF EXISTS holiday CASCADE;
DROP TABLE IF EXISTS store CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Users Table
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    role VARCHAR DEFAULT 'user'
);

CREATE INDEX ix_user_id ON "user" (id);
CREATE INDEX ix_user_email ON "user" (email);
CREATE INDEX ix_user_full_name ON "user" (full_name);

-- Products Table
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    sku VARCHAR NOT NULL UNIQUE,
    name VARCHAR,
    category VARCHAR,
    price FLOAT
);

CREATE INDEX ix_product_id ON product (id);
CREATE INDEX ix_product_sku ON product (sku);

-- Stores Table
CREATE TABLE store (
    id SERIAL PRIMARY KEY,
    store_id VARCHAR NOT NULL UNIQUE,
    name VARCHAR,
    region VARCHAR,
    city VARCHAR,
    state VARCHAR,
    type VARCHAR,
    cluster INTEGER
);

CREATE INDEX ix_store_id ON store (id);
CREATE INDEX ix_store_store_id ON store (store_id);

-- Store Inventory Table
CREATE TABLE storeinventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product(id),
    store_id INTEGER NOT NULL REFERENCES store(id),
    quantity_on_hand INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10
);

CREATE INDEX ix_storeinventory_id ON storeinventory (id);

-- Holidays Table
CREATE TABLE holiday (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR,
    locale VARCHAR,
    locale_name VARCHAR,
    description VARCHAR,
    transferred BOOLEAN DEFAULT FALSE
);

CREATE INDEX ix_holiday_id ON holiday (id);
CREATE INDEX ix_holiday_date ON holiday (date);

-- Sales Data Table
CREATE TABLE salesdata (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    sku_id INTEGER NOT NULL REFERENCES product(id),
    store_id INTEGER NOT NULL REFERENCES store(id),
    quantity INTEGER NOT NULL,
    onpromotion BOOLEAN DEFAULT FALSE
);

CREATE INDEX ix_salesdata_id ON salesdata (id);
CREATE INDEX ix_salesdata_date ON salesdata (date);
CREATE INDEX ix_salesdata_sku_id ON salesdata (sku_id);
CREATE INDEX ix_salesdata_store_id ON salesdata (store_id);

-- Suppliers Table
CREATE TABLE supplier (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    contact_person VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    address VARCHAR,
    lead_time_days INTEGER DEFAULT 7
);

CREATE INDEX ix_supplier_id ON supplier (id);

-- Purchase Orders Table
CREATE TABLE purchaseorder (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES supplier(id),
    product_id INTEGER NOT NULL REFERENCES product(id),
    order_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price FLOAT,
    total_cost FLOAT,
    status VARCHAR DEFAULT 'pending',
    expected_delivery DATE
);

CREATE INDEX ix_purchaseorder_id ON purchaseorder (id);

-- Shipments Table
CREATE TABLE shipment (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL REFERENCES purchaseorder(id),
    store_id INTEGER NOT NULL REFERENCES store(id),
    shipped_date DATE,
    delivered_date DATE,
    quantity_shipped INTEGER NOT NULL,
    status VARCHAR DEFAULT 'in_transit'
);

CREATE INDEX ix_shipment_id ON shipment (id);

-- Insert sample admin user (password: admin123456)
INSERT INTO "user" (email, full_name, hashed_password, is_active, is_superuser, role)
VALUES (
    'admin@ikea.com',
    'Admin User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8v.DFD4RDFx5cY3q4zi',
    TRUE,
    TRUE,
    'admin'
) ON CONFLICT (email) DO NOTHING;
