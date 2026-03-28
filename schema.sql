-- Enable uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    virtual_balance DECIMAL(12, 2) DEFAULT 100000.00, -- Starting balance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Market Assets (The "Cricket" Stocks available to buy)
CREATE TABLE market_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_name VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10) UNIQUE NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    asset_class_id VARCHAR(50), -- Identifier for Large-Cap, Mid-Cap, etc.
    required_lesson_id UUID, -- Links to lessons (forces "Learn First")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Playing XI (The User's Portfolio)
CREATE TABLE playing_xi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES market_assets(id),
    purchase_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Dugout Lessons (The Educational Content)
CREATE TABLE dugout_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content_text TEXT NOT NULL,
    difficulty_level VARCHAR(50),
    reward_amount DECIMAL(10, 2) DEFAULT 0.00 -- Optional cash reward for learning
);

-- 5. User Progress (Tracking unlocked lessons)
CREATE TABLE user_lessons_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES dugout_lessons(id),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Transactions Ledger (History for the Profile screen)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES market_assets(id),
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('BUY', 'SELL')),
    price_at_transaction DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Coach Alerts (Nudges and Notifications)
CREATE TABLE coach_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
