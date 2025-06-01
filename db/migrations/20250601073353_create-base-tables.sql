-- migrate:up

---- trigger for updating updated_at columns

CREATE FUNCTION updated_at_trigger() RETURNS trigger
    LANGUAGE plpgsql AS
$$BEGIN
    NEW.updated_at := current_timestamp;
    RETURN NEW;
END;$$;

---- blogdans user

CREATE TABLE blogdans_user(
    id UUID NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    photo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER blogdans_user_updated_at_trigger BEFORE UPDATE ON blogdans_user
    FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();

---- google user

CREATE TABLE google_user(
    id TEXT NOT NULL PRIMARY KEY,
    blog_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER google_user_updated_at_trigger BEFORE UPDATE ON google_user
    FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();

---- post

CREATE TABLE post(
    -- This is the slug
    id TEXT NOT NULL PRIMARY KEY,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER post_updated_at_trigger BEFORE UPDATE ON post
    FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();

---- comment

CREATE TABLE comment(
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id TEXT NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ DEFAULT NULL,

    FOREIGN KEY (post_id) REFERENCES post(id),
    FOREIGN KEY (author_id) REFERENCES blogdans_user(id)
);

CREATE TRIGGER comment_updated_at_trigger BEFORE UPDATE ON comment
    FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();

-- migrate:down

