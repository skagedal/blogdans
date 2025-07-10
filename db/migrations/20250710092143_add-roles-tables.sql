-- migrate:up

---- roles table
CREATE TABLE roles(
    role TEXT NOT NULL PRIMARY KEY
);

---- user_roles table
CREATE TABLE user_roles(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES blogdans_user(id),
    FOREIGN KEY (role) REFERENCES roles(role)
);

CREATE TRIGGER user_roles_updated_at_trigger BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();

-- Create index on user_id column
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Add admin role
INSERT INTO roles (role) VALUES ('admin');

-- migrate:down

DROP TABLE user_roles;
DROP TABLE roles;