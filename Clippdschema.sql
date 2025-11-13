-- Clippd DATABASE SCHEMA FILE 

-- Enum for user roles- Research this will restrict the role values in UserAccount table
CREATE TYPE user_role AS ENUM ('Client', 'Clipper');

-- UserAccount Table
CREATE TABLE UserAccount (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    login_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Client',
    nickname VARCHAR(50),
    address VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    email_address VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Language Table (each user can have multiple languages)
CREATE TABLE Language (
    user_id INT NOT NULL REFERENCES UserAccount(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, language)
);

-- Client Table (1-to-1 with UserAccount)
CREATE TABLE Client (
    user_id INT PRIMARY KEY REFERENCES UserAccount(id) ON DELETE CASCADE
);

-- Clipper Table (1-to-1 with UserAccount)
CREATE TABLE Clipper (
    user_id INT PRIMARY KEY REFERENCES UserAccount(id) ON DELETE CASCADE
);

-- FavoriteClippers Table (many-to-many: Client ↔ Clipper)
CREATE TABLE FavoriteClippers (
    client_id INT NOT NULL REFERENCES Client(user_id) ON DELETE CASCADE,
    clipper_id INT NOT NULL REFERENCES Clipper(user_id) ON DELETE CASCADE,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id, clipper_id)
);

-- Portfolio Table (1-to-1 with Clipper)
CREATE TABLE Portfolio (
    id SERIAL PRIMARY KEY,
    clipper_id INT UNIQUE NOT NULL REFERENCES Clipper(user_id) ON DELETE CASCADE,
    shop_name VARCHAR(100) NOT NULL,
    shop_address VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    description TEXT
);

-- Picture Table (many-to-one with Portfolio)
CREATE TABLE Picture (
    id SERIAL PRIMARY KEY,
    portfolio_id INT NOT NULL REFERENCES Portfolio(id) ON DELETE CASCADE,
    image TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Table (many-to-one with Clipper)
CREATE TABLE Service (
    id SERIAL PRIMARY KEY,
    clipper_id INT NOT NULL REFERENCES Clipper(user_id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(6,2) CHECK (price >= 0) NOT NULL
);

-- Review Table (many-to-many: Client ↔ Clipper)
CREATE TABLE Review (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES Client(user_id) ON DELETE CASCADE,
    clipper_id INT NOT NULL REFERENCES Clipper(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (client_id, clipper_id)
);
