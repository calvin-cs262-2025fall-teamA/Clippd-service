-- Clippd DATABASE SCHEMA FILE

-- 1. UserAccount Table
CREATE TABLE UserAccount (
    ID SERIAL PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    loginID VARCHAR(50) UNIQUE NOT NULL,
    passWord VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('Client', 'Clipper')),
    nickname VARCHAR(50),
    address VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    emailAddress VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    profileImage TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Languages Table
CREATE TABLE Languages (
    userID INT NOT NULL REFERENCES UserAccount(ID) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    PRIMARY KEY (userID, language)
);

-- 3. Client Table
CREATE TABLE Client (
    ID SERIAL PRIMARY KEY,
    userID INT NOT NULL REFERENCES UserAccount(ID) ON DELETE CASCADE
);

-- 4. Clipper Table
CREATE TABLE Clipper (
    ID SERIAL PRIMARY KEY,
    userID INT NOT NULL REFERENCES UserAccount(ID) ON DELETE CASCADE
);

-- 5. FavoriteClippers Table (many-to-many: Client ↔ Clipper)
CREATE TABLE FavoriteClippers (
    clientID INT NOT NULL REFERENCES Client(ID) ON DELETE CASCADE,
    clipperID INT NOT NULL REFERENCES Clipper(ID) ON DELETE CASCADE,
    favoritedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (clientID, clipperID)
);

-- 6. Portfolio Table (1-to-1 with Clipper)
CREATE TABLE Portfolio (
    ID SERIAL PRIMARY KEY,
    clipperID INT UNIQUE NOT NULL REFERENCES Clipper(ID) ON DELETE CASCADE,
    shopName VARCHAR(100) NOT NULL,
    shopAddress VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    description TEXT
);

-- 7. Pictures Table (many-to-one with Portfolio)
CREATE TABLE Pictures (
    ID SERIAL PRIMARY KEY,
    portfolioID INT NOT NULL REFERENCES Portfolio(ID) ON DELETE CASCADE,
    image TEXT NOT NULL,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Service Table (many-to-one with Clipper)
CREATE TABLE Service (
    ID SERIAL PRIMARY KEY,
    clipperID INT NOT NULL REFERENCES Clipper(ID) ON DELETE CASCADE,
    serviceName VARCHAR(100) NOT NULL,
    price DECIMAL(6,2)
);

-- 9. Review Table (many-to-many: Client ↔ Clipper)
CREATE TABLE Review (
    ID SERIAL PRIMARY KEY,
    clientID INT NOT NULL REFERENCES Client(ID) ON DELETE CASCADE,
    clipperID INT NOT NULL REFERENCES Clipper(ID) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);