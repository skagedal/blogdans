SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: updated_at_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.updated_at_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
    NEW.updated_at := current_timestamp;
    RETURN NEW;
END;$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blogdans_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogdans_user (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    photo text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id text NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp with time zone
);


--
-- Name: google_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_user (
    id text NOT NULL,
    blog_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: blogdans_user blogdans_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogdans_user
    ADD CONSTRAINT blogdans_user_pkey PRIMARY KEY (id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: google_user google_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_user
    ADD CONSTRAINT google_user_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: blogdans_user blogdans_user_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER blogdans_user_updated_at_trigger BEFORE UPDATE ON public.blogdans_user FOR EACH ROW EXECUTE FUNCTION public.updated_at_trigger();


--
-- Name: comment comment_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comment_updated_at_trigger BEFORE UPDATE ON public.comment FOR EACH ROW EXECUTE FUNCTION public.updated_at_trigger();


--
-- Name: google_user google_user_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER google_user_updated_at_trigger BEFORE UPDATE ON public.google_user FOR EACH ROW EXECUTE FUNCTION public.updated_at_trigger();


--
-- Name: post post_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER post_updated_at_trigger BEFORE UPDATE ON public.post FOR EACH ROW EXECUTE FUNCTION public.updated_at_trigger();


--
-- Name: comment comment_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.blogdans_user(id);


--
-- Name: comment comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.post(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20250601073353');
