-- Clippd DATABASE SCHEMA with sample data

-- FIX ME: Using for testing the app.
-- Drop previous versions of the tables if they exist, in reverse order of foreign keys.
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS FavoriteClippers;
DROP TABLE IF EXISTS Pictures;
DROP TABLE IF EXISTS Portfolio;
DROP TABLE IF EXISTS Service;
DROP TABLE IF EXISTS Specialty;
DROP TABLE IF EXISTS Client;
DROP TABLE IF EXISTS Clipper;
DROP TABLE IF EXISTS Languages;
DROP TABLE IF EXISTS UserAccount;

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

-- 9. Specialty Table (many-to-one with Clipper)
CREATE TABLE Specialty (
    ID SERIAL PRIMARY KEY,
    clipperID INT NOT NULL REFERENCES Clipper(ID) ON DELETE CASCADE,
    hairType VARCHAR(100) NOT NULL
);

-- 10. Review Table (many-to-many: Client ↔ Clipper)
CREATE TABLE Review (
    ID SERIAL PRIMARY KEY,
    clientID INT NOT NULL REFERENCES Client(ID) ON DELETE CASCADE,
    clipperID INT NOT NULL REFERENCES Clipper(ID) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FIX ME: Using for testing the app.
-- Allow users to select data from the tables.
GRANT SELECT ON UserAccount TO PUBLIC;
GRANT SELECT ON Languages TO PUBLIC;
GRANT SELECT ON Client TO PUBLIC;
GRANT SELECT ON Clipper TO PUBLIC;
GRANT SELECT ON FavoriteClippers TO PUBLIC;
GRANT SELECT ON Portfolio TO PUBLIC;
GRANT SELECT ON Pictures TO PUBLIC;
GRANT SELECT ON Service TO PUBLIC;
GRANT SELECT ON Specialty TO PUBLIC;
GRANT SELECT ON Review TO PUBLIC;

-- Sample data
INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, createdAt) VALUES (1, 'Alice', 'Meijer', 'alice123', 'passAlice!', 'Client', 'Ali', '123 Pine St', 'Grand Rapids', 'MI', 'alice@example.com', '616-111-1111', 'Loves stylish short cuts.', 'https://example.com/alice.jpg', '2025-09-27 08:00:00');
INSERT INTO UserAccount VALUES (2, 'Ben', 'Nelson', 'bennel', 'passBen!', 'Clipper', 'BennyFade', '45 Barber Ln', 'Grand Rapids', 'MI', 'ben@example.com', '616-222-2222', 'Professional barber with 5 years of experience.', 'https://example.com/ben.jpg', '2025-09-29 15:00:00');
INSERT INTO UserAccount VALUES (3, 'Chris', 'Evans', 'chrisevans', 'passChris!', 'Clipper', 'CPStyles', '99 Main Ave', 'Grand Rapids', 'MI', 'chris@example.com', '616-333-3333', 'Specializes in fades and beard trims.', 'https://example.com/chris.jpg', '2025-09-30 11:00:00');

INSERT INTO Languages (userID, language) VALUES (1, 'English');
INSERT INTO Languages (userID, language) VALUES (2, 'English');
INSERT INTO Languages (userID, language) VALUES (2, 'Korean');
INSERT INTO Languages (userID, language) VALUES (3, 'English');

INSERT INTO Client (ID, userID) VALUES (1, 1);

INSERT INTO Clipper (ID, userID) VALUES (1, 2);
INSERT INTO Clipper (ID, userID) VALUES (2, 3);

INSERT INTO FavoriteClippers (clientID, clipperID, favoritedAt) VALUES (1, 1, '2025-10-12 09:00:00');
INSERT INTO FavoriteClippers (clientID, clipperID, favoritedAt) VALUES (1, 2, '2025-10-12 11:00:00');

INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, description) VALUES (1, 1, 'Ben’s Barber Studio', '45 Barber Ln', 'Grand Rapids', 'MI', 'A modern barber studio focusing on precision fades.');
INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, description) VALUES (2, 2, 'Chris Cuts', '99 Main Ave', 'Grand Rapids', 'MI', 'Classic styles with a modern twist.');

INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (1, 1, 'https://example.com/ben_portfolio1.jpg', '2025-10-02 08:00:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (2, 1, 'https://example.com/ben_portfolio2.jpg', '2025-10-02 08:15:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (3, 2, 'https://example.com/chris_portfolio1.jpg', '2025-10-05 12:00:00');

INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (1, 1, 'Men’s Fade', 25.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (2, 1, 'Beard Trim', 15.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (3, 2, 'Kids Haircut', 20.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (4, 2, 'Classic Cut', 22.00);

INSERT INTO Specialty (ID, clipperID, hairType) VALUES (1, 1, 'Straight');
INSERT INTO Specialty (ID, clipperID, hairType) VALUES (2, 1, 'Wavy');
INSERT INTO Specialty (ID, clipperID, hairType) VALUES (3, 2, 'Curly');

INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (1, 1, 1, 5, 'Ben did a fantastic job with my fade!', '2025-10-20 09:00:00');
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (2, 1, 1, 5, 'I like his style!', '2025-10-28 16:00:00');
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (3, 1, 2, 4, 'Chris was great and very friendly!', '2025-11-05 09:00:00');