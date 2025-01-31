-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    relation_to_dementia_person VARCHAR(255) NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Push tokens tabel
CREATE TABLE push_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifikationer tabel
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks for hurtigere søgning
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_sent ON notifications(sent);

-- Funktion til at opdatere updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger til at opdatere updated_at
CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funktioner til at håndtere push tokens
CREATE OR REPLACE FUNCTION upsert_push_token(
    p_user_id INTEGER,
    p_token TEXT,
    p_platform VARCHAR
) RETURNS void AS $$
BEGIN
    INSERT INTO push_tokens (user_id, token, platform)
    VALUES (p_user_id, p_token, p_platform)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        token = EXCLUDED.token,
        platform = EXCLUDED.platform,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Funktion til at planlægge notifikation
CREATE OR REPLACE FUNCTION schedule_notification(
    p_user_id INTEGER,
    p_appointment_id INTEGER,
    p_title VARCHAR,
    p_body TEXT,
    p_scheduled_for TIMESTAMP WITH TIME ZONE
) RETURNS INTEGER AS $$
DECLARE
    notification_id INTEGER;
BEGIN
    INSERT INTO notifications (
        user_id, 
        appointment_id, 
        title, 
        body, 
        scheduled_for
    )
    VALUES (
        p_user_id,
        p_appointment_id,
        p_title,
        p_body,
        p_scheduled_for
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;
