-- SOS Store Manager Database Schema

-- Create tables for lookup history and analytics
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(255) PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    plan_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lookups (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL REFERENCES shops(id),
    lookup_type VARCHAR(50) NOT NULL, -- 'ip', 'email', 'phone'
    identifier VARCHAR(255) NOT NULL,
    identifier_hash VARCHAR(64) NOT NULL, -- For privacy
    risk_score INTEGER,
    risk_level VARCHAR(20),
    factors JSONB,
    sources JSONB,
    raw_results JSONB,
    cached BOOLEAN DEFAULT FALSE,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_lookups_shop_id ON lookups(shop_id);
CREATE INDEX idx_lookups_identifier_hash ON lookups(identifier_hash);
CREATE INDEX idx_lookups_created_at ON lookups(created_at);
CREATE INDEX idx_lookups_risk_score ON lookups(risk_score);

-- Analytics table
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL REFERENCES shops(id),
    date DATE NOT NULL,
    total_lookups INTEGER DEFAULT 0,
    high_risk_count INTEGER DEFAULT 0,
    medium_risk_count INTEGER DEFAULT 0,
    low_risk_count INTEGER DEFAULT 0,
    unique_identifiers INTEGER DEFAULT 0,
    api_costs DECIMAL(10, 4) DEFAULT 0,
    UNIQUE(shop_id, date)
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    api_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    request_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    UNIQUE(api_name, date)
);

-- Shop settings and preferences
CREATE TABLE IF NOT EXISTS shop_settings (
    shop_id VARCHAR(255) PRIMARY KEY REFERENCES shops(id),
    auto_check_orders BOOLEAN DEFAULT TRUE,
    risk_threshold INTEGER DEFAULT 75,
    notification_email VARCHAR(255),
    webhook_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Network intelligence (Phase 2)
CREATE TABLE IF NOT EXISTS network_reports (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL REFERENCES shops(id),
    identifier_type VARCHAR(50) NOT NULL,
    identifier_hash VARCHAR(64) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'fraud', 'suspicious', 'verified'
    confidence INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_network_reports_identifier ON network_reports(identifier_hash);
CREATE INDEX idx_network_reports_created_at ON network_reports(created_at);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON shop_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();