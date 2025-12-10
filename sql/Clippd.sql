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
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
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
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    description TEXT,

    CONSTRAINT unique_clipID UNIQUE (clipperID) -- Ensure one portfolio per clipper
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
    price DECIMAL(6,2),
    durationMinutes INT
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
INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (1, 'Alice', 'Meijer', 'client', 'clientpw', 'Client', 'Alice', '123 Pine St', 'Grand Rapids', 'MI', 'alice@example.com', '616-111-1111', 'Loves stylish short cuts.', 'https://example.com/alice.jpg', 42.963795, -85.670006, '2025-09-27 08:00:00');

INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (7, 'Tom', 'Cat', 'client2', 'clientpw2', 'Client', 'Tom', '123 Pine St', 'Grand Rapids', 'MI', 'tom@example.com', '616-111-1111', 'Loves stylish short cuts.', 'https://example.com/tom.jpg', 42.963795, -85.670006, '2025-09-27 08:00:00');

INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (8, 'Max', 'Verstappen', 'client3', 'clientpw3', 'Client', 'Max', '123 Pine St', 'Grand Rapids', 'MI', 'max@example.com', '616-111-1111', 'Loves stylish short cuts.', 'https://example.com/max.jpg', 42.963795, -85.670006, '2025-09-27 08:00:00');

INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (2, 'Ben', 'Nelson', 'clipper', 'clipperpw', 'Clipper', 'BennyFade', '45 Barber Ln', 'Grand Rapids', 'MI', 'ben@example.com', '616-222-2222', 'Professional barber with 5 years of experience.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', NULL, NULL, '2025-09-29 15:00:00');

INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (3, 'Chris', 'Evans', 'chrisevans', 'passChris!', 'Clipper', 'CPStyles', '99 Main Ave', 'Grand Rapids', 'MI', 'chris@example.com', '616-333-3333', 'Specializes in fades and beard trims.', 'https://image.tmdb.org/t/p/w500/3bOGNsHlrswhyW79uvIHH1V43JI.jpg', NULL, NULL, '2025-09-30 11:00:00');

INSERT INTO Languages (userID, language) VALUES (1, 'English');
INSERT INTO Languages (userID, language) VALUES (2, 'English');
INSERT INTO Languages (userID, language) VALUES (2, 'Korean');
INSERT INTO Languages (userID, language) VALUES (3, 'English');

INSERT INTO Client (ID, userID) VALUES (1, 1);
INSERT INTO Client (ID, userID) VALUES (2, 7);
INSERT INTO Client (ID, userID) VALUES (3, 8);


INSERT INTO Clipper (ID, userID) VALUES (1, 2);
INSERT INTO Clipper (ID, userID) VALUES (2, 3);

INSERT INTO FavoriteClippers (clientID, clipperID, favoritedAt) VALUES (1, 1, '2025-10-12 09:00:00');
INSERT INTO FavoriteClippers (clientID, clipperID, favoritedAt) VALUES (1, 2, '2025-10-12 11:00:00');

INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
VALUES (1, 1, 'Ben''s Barber Studio', '45 Barber Ln', 'Grand Rapids', 'MI', 42.964100, -85.670200, 'A modern barber studio focusing on precision fades.');

INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
VALUES (2, 2, 'Chris Cuts', '99 Main Ave', 'Grand Rapids', 'MI', 42.964800, -85.668900, 'Classic styles with a modern twist.');

INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (1, 1, 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1280&h=900&fit=crop', '2025-10-02 08:00:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (2, 1, 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=1280&h=900&fit=crop', '2025-10-02 08:15:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (21, 1, 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1280&h=900&fit=crop', '2025-10-02 08:30:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (22, 1, 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1280&h=900&fit=crop', '2025-10-02 08:45:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (23, 1, 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1280&h=900&fit=crop', '2025-10-02 09:00:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (3, 2, 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1280&h=900&fit=crop', '2025-10-05 12:00:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (18, 2, 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=1280&h=900&fit=crop', '2025-10-05 12:15:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (19, 2, 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1280&h=900&fit=crop', '2025-10-05 12:30:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (20, 2, 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1280&h=900&fit=crop', '2025-10-05 12:45:00');

INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (1, 1, 'Men’s Haircut', 25.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (2, 1, 'Beard Trim', 15.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (3, 2, 'Kids Haircut', 20.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (4, 2, 'Classic Cut', 22.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (12, 1, 'Coloring', 30.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (13, 1, 'Perm', 35.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (14, 2, 'Women&apos;s Haircut', 45.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (11, 2, 'Highlights', 35.00);



INSERT INTO Specialty (ID, clipperID, hairType) VALUES (1, 1, 'Straight');
INSERT INTO Specialty (ID, clipperID, hairType) VALUES (2, 1, 'Wavy');
INSERT INTO Specialty (ID, clipperID, hairType) VALUES (3, 2, 'Curly');

INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (1, 1, 1, 5, 'Ben did a fantastic job with my fade!', '2025-10-20 09:00:00');
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (2, 1, 1, 5, 'I like his style!', '2025-10-28 16:00:00');
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (3, 1, 2, 4, 'Chris was great and very friendly!', '2025-11-05 09:00:00');

-- Additional data from item.json
-- New UserAccount entries for clippers from item.json
INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (4, 'Mrs.', 'VanderLinden', 'mvanderlinden', 'passVander!', 'Clipper', 'MrsV', '123 Clipper St', 'Grand Rapids', 'MI', 'mvanderlinden@example.com', '616-444-4444', 'Professional stylist with years of experience.', 'https://cdn-icons-png.flaticon.com/512/9159/9159760.png', NULL, NULL, '2025-11-01 10:00:00');

INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (5, 'Tim', 'Smith', 'timsmith', 'passTim!', 'Clipper', 'TimCuts', '456 Barber Ave', 'Grand Rapids', 'MI', 'tim.smith@example.com', '616-555-5555', 'Reliable barber providing quality cuts.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1280&h=900&fit=crop', NULL, NULL, '2025-11-02 14:00:00');

INSERT INTO UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)
VALUES (6, 'Will', 'Johnson', 'willjohnson', 'passWill!', 'Clipper', 'WillStyles', '789 Style Blvd', 'Hudsonville', 'MI', 'will.johnson@example.com', '616-666-6666', 'Master barber specializing in modern styles.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1280&h=900&fit=crop', NULL, NULL, '2025-11-03 16:00:00');

-- New Clipper entries
INSERT INTO Clipper (ID, userID) VALUES (3, 4);
INSERT INTO Clipper (ID, userID) VALUES (4, 5);
INSERT INTO Clipper (ID, userID) VALUES (5, 6);

-- New Portfolio entries
INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
VALUES (3, 3, 'VanderLinden Salon', '123 Clipper St', 'Grand Rapids', 'MI', 42.965000, -85.671000, 'Professional hair styling and cutting services.');

INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
VALUES (4, 4, 'Tim''s Barber Shop', '456 Barber Ave', 'Grand Rapids', 'MI', 42.966000, -85.672000, 'Traditional barbering with modern techniques.');

INSERT INTO Portfolio (ID, clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
VALUES (5, 5, 'Will''s Style Studio', '789 Style Blvd', 'Hudsonville', 'MI', 42.967000, -85.673000, 'Contemporary cuts and styling for all ages.');

-- New Pictures entries for portfolios
-- Mrs. VanderLinden's portfolio images
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (4, 3, 'https://ca.slack-edge.com/T09EKMT6T2B-U09F0SH41RB-g2975a4c0597-512', '2025-11-01 10:15:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (5, 3, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1280&h=900&fit=crop', '2025-11-01 10:16:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (6, 3, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1280&h=900&fit=crop', '2025-11-01 10:17:00');

-- Tim Smith's portfolio images
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (7, 4, 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1280&h=900&fit=crop', '2025-11-02 14:15:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (8, 4, 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=1280&h=900&fit=crop', '2025-11-02 14:16:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (9, 4, 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1280&h=900&fit=crop', '2025-11-02 14:17:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (10, 4, 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1280&h=900&fit=crop', '2025-11-02 14:18:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (11, 4, 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1280&h=900&fit=crop', '2025-11-02 14:19:00');

-- Will Johnson's portfolio images
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (12, 5, 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1280&h=900&fit=crop', '2025-11-03 16:15:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (13, 5, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1280&h=900&fit=crop', '2025-11-03 16:16:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (14, 5, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1280&h=900&fit=crop', '2025-11-03 16:17:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (15, 5, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=1280&h=900&fit=crop', '2025-11-03 16:18:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (16, 5, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1280&h=900&fit=crop', '2025-11-03 16:19:00');
INSERT INTO Pictures (ID, portfolioID, image, addedAt) VALUES (17, 5, 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1280&h=900&fit=crop', '2025-11-03 16:20:00');

-- New Services entries
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (5, 3, 'Women''s Cut & Style', 35.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (6, 3, 'Color Treatment', 60.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (7, 4, 'Men''s Haircut', 20.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (8, 4, 'Buzz Cut', 15.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (9, 5, 'Precision Cut', 30.00);
INSERT INTO Service (ID, clipperID, serviceName, price) VALUES (10, 5, 'Style Consultation', 25.00);

-- New Reviews entries
-- Reviews for Mrs. VanderLinden (clipperID 3)
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (4, 1, 3, 5, 'I love my wife, but not sure about the haircut.', '2025-11-10 10:00:00');
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (5, 1, 3, 5, 'Best barber in town! Very professional.', '2025-11-11 14:00:00');
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (6, 1, 3, 5, 'Best barber in town! Very professional.', '2025-11-12 16:00:00');

-- Reviews for Tim Smith (clipperID 4)
INSERT INTO Review (ID, clientID, clipperID, rating, comment, createdAt) VALUES (7, 1, 4, 4, 'Not the best, but good enough.', '2025-11-13 11:00:00');