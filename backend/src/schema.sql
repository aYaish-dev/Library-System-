CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  sso_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student','faculty','staff'))
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  digital_link TEXT
);

CREATE TABLE IF NOT EXISTS resource_copies (
  id SERIAL PRIMARY KEY,
  resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available','checked_out','on_hold','missing','under_repair')),
  due_date TIMESTAMP NULL,
  branch TEXT,
  floor TEXT,
  shelf TEXT
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  copy_id INT NOT NULL REFERENCES resource_copies(id),
  status TEXT NOT NULL CHECK (status IN ('active','cancelled','fulfilled','expired')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
