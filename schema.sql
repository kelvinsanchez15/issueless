-- Next-auth recommended Schema for a Postgres database.
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS repositories CASCADE;
DROP TABLE IF EXISTS stars CASCADE;
DROP TABLE IF EXISTS issues CASCADE;

CREATE TABLE accounts
  (
    id                   SERIAL,
    compound_id          VARCHAR(255) NOT NULL,
    user_id              INTEGER NOT NULL,
    provider_type        VARCHAR(255) NOT NULL,
    provider_id          VARCHAR(255) NOT NULL,
    provider_account_id  VARCHAR(255) NOT NULL,
    refresh_token        TEXT,
    access_token         TEXT,
    access_token_expires TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE TABLE sessions
  (
    id            SERIAL,
    user_id       INTEGER NOT NULL,
    expires       TIMESTAMPTZ NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    access_token  VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE TABLE users
  (
    id             SERIAL,
    name           VARCHAR(255),
    email          VARCHAR(255),
    email_verified TIMESTAMPTZ,
    username       VARCHAR(255),
    image          VARCHAR(255),
    bio            TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE TABLE verification_requests
  (
    id         SERIAL,
    identifier VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires    TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );

CREATE UNIQUE INDEX compound_id
  ON accounts(compound_id);

CREATE INDEX provider_account_id
  ON accounts(provider_account_id);

CREATE INDEX provider_id
  ON accounts(provider_id);

CREATE INDEX user_id
  ON accounts(user_id);

CREATE UNIQUE INDEX session_token
  ON sessions(session_token);

CREATE UNIQUE INDEX access_token
  ON sessions(access_token);

CREATE UNIQUE INDEX email
  ON users(email);

CREATE UNIQUE INDEX token
  ON verification_requests(token);

-- Extra index
CREATE UNIQUE INDEX username
  ON users(username);

-- Project schema
CREATE TABLE repositories
  (
    id             SERIAL PRIMARY KEY NOT NULL,
    name           VARCHAR(255) NOT NULL,
    description    VARCHAR(255),    
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),    
    owner_id       INTEGER,
    UNIQUE (name, owner_id),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE   
    -- watchers_count
  );

CREATE TABLE stars  (    
    id             SERIAL PRIMARY KEY NOT NULL,
    UNIQUE (repository_id, user_id),
    repository_id  INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE
  );

CREATE TABLE issues
  (
    id             SERIAL PRIMARY KEY NOT NULL,
    number         INTEGER,
    title          VARCHAR(255) NOT NULL,
    body           TEXT,
    state          BOOLEAN NOT NULL DEFAULT TRUE,
    assignee       VARCHAR(255),    
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at      TIMESTAMP,
    user_id        INTEGER,    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,    
    repo_id        INTEGER,
    UNIQUE (number, repo_id),
    FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

-- add labels table

CREATE OR REPLACE FUNCTION issue_number_function()
RETURNS TRIGGER AS
$BODY$
DECLARE
  max INTEGER:=NULL;
BEGIN
  SELECT count(number) INTO max FROM issues WHERE repo_id=NEW.repo_id;
  IF max IS NULL THEN
    max:=1;
  ELSE
    max=max+1;
  END IF;
  NEW.number:=max;
  RETURN NEW;
END;
$BODY$
LANGUAGE 'plpgsql';

CREATE TRIGGER issue_number_trigger
BEFORE INSERT
ON issues
FOR EACH ROW
EXECUTE PROCEDURE issue_number_function();

