-- FleetManager - schema initial
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== USERS ==========
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150)  NOT NULL,
    email           VARCHAR(180)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL CHECK (role IN ('ADMIN','SUPERVISEUR','AGENT')),
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT now()
);

-- ========== DRIVERS ==========
CREATE TABLE drivers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150)  NOT NULL,
    phone           VARCHAR(30),
    license_number  VARCHAR(60),
    status          VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    note            TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT now()
);

-- ========== VEHICLES ==========
CREATE TABLE vehicles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(150)  NOT NULL,
    plate               VARCHAR(30)   NOT NULL UNIQUE,
    current_driver_id   UUID REFERENCES drivers(id) ON DELETE SET NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','inactive')),
    gps_expiry_date     DATE,
    created_at          TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT now()
);
CREATE INDEX idx_vehicles_current_driver ON vehicles(current_driver_id);

-- ========== ASSIGNMENTS (historique chauffeur <-> vehicule) ==========
CREATE TABLE assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id   UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    start_date  DATE NOT NULL,
    end_date    DATE,
    note        TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_assignments_vehicle ON assignments(vehicle_id);
CREATE INDEX idx_assignments_driver ON assignments(driver_id);
CREATE INDEX idx_assignments_active ON assignments(vehicle_id) WHERE end_date IS NULL;

-- ========== PAYMENTS (versements = recettes) ==========
CREATE TABLE payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id   UUID REFERENCES drivers(id) ON DELETE SET NULL,
    amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    date        DATE NOT NULL,
    note        TEXT,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ========== OIL CHANGES (vidanges) ==========
CREATE TABLE oil_changes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id         UUID REFERENCES drivers(id) ON DELETE SET NULL,
    date              DATE NOT NULL,
    mileage           INTEGER NOT NULL CHECK (mileage >= 0),
    cost              NUMERIC(14,2) NOT NULL CHECK (cost >= 0),
    next_change_days  INTEGER,
    next_change_date  DATE,
    note              TEXT,
    created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

-- ========== GPS RECHARGES ==========
CREATE TABLE gps_recharges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id       UUID REFERENCES drivers(id) ON DELETE SET NULL,
    date            DATE NOT NULL,
    amount          NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    validity_days   INTEGER,
    expiry_date     DATE,
    provider        VARCHAR(100),
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ========== EXPENSES (depenses libres) ==========
CREATE TABLE expenses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id     UUID REFERENCES drivers(id) ON DELETE SET NULL,
    date          DATE NOT NULL,
    amount        NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    category      VARCHAR(20) NOT NULL CHECK (category IN ('fuel','repair','insurance','tax','other')),
    description   TEXT NOT NULL,
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_vehicle ON payments(vehicle_id);
CREATE INDEX idx_payments_driver ON payments(driver_id);
CREATE INDEX idx_payments_date ON payments(date);

CREATE INDEX idx_oil_changes_vehicle ON oil_changes(vehicle_id);
CREATE INDEX idx_oil_changes_date ON oil_changes(date);

CREATE INDEX idx_gps_recharges_vehicle ON gps_recharges(vehicle_id);
CREATE INDEX idx_gps_recharges_expiry ON gps_recharges(expiry_date);

CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX idx_expenses_date ON expenses(date);
