--------------------------------------------------------------
-- SQL sample Queries for Clippd Service
--------------------------------------------------------------

-- Get the list of clippers info with average rating
SELECT 
  C.ID AS clipperID,
  U.profileImage,
  U.firstName,
  U.lastName,
  P.shopAddress,
  P.shopName,
  P.city,
  P.state,
  P.description,
  PI.image AS shopimage,
  ROUND(AVG(R.rating), 2) AS avgRating
FROM Clipper C
JOIN UserAccount U ON C.UserID = U.ID
LEFT JOIN Portfolio P ON C.ID = P.ClipperID
LEFT JOIN ( -- Pick only one picture
  SELECT PortfolioID, MIN(image) AS image
  FROM Pictures
  GROUP BY PortfolioID
) PI ON PI.PortfolioID = P.ID 
LEFT JOIN Review R ON C.ID = R.ClipperID
GROUP BY C.ID, U.profileImage, U.firstName, U.lastName, P.shopAddress, 
P.shopName, P.city, P.state, P.description, PI.image;

-- Find all clippers located in Grand Rapids, MI
SELECT 
    U.firstName, U.lastName, U.nickname, 
    P.shopName, P.city, P.state
FROM Clipper C
JOIN UserAccount U ON C.userID = U.ID
JOIN Portfolio P ON C.ID = P.clipperID
WHERE P.city LIKE '%Grand Rapids%' AND P.state = 'MI';

-- Show reviews for a specific clipper
SELECT 
    U.nickname AS clientNickname,
    R.rating,
    R.comment,
    R.createdAt
FROM Review R
JOIN Client CL ON R.clientID = CL.ID
JOIN UserAccount U ON CL.userID = U.ID
JOIN Clipper C ON R.clipperID = C.ID
WHERE C.ID = 1
ORDER BY R.createdAt DESC;

-- List all favorite clippers of a specific client
SELECT 
    U.nickname AS clientName,
    C.ID AS clipperID,
    U2.nickname AS clipperName,
    F.favoritedAt
FROM FavoriteClippers F
JOIN Client CL ON F.clientID = CL.ID
JOIN UserAccount U ON CL.userID = U.ID
JOIN Clipper C ON F.clipperID = C.ID
JOIN UserAccount U2 ON C.userID = U2.ID
WHERE CL.ID = 1
ORDER BY F.favoritedAt DESC;

-- Find clippers who speak Korean
SELECT 
    U.firstName, U.lastName, U.nickname, L.language
FROM UserAccount U
JOIN Clipper C ON U.ID = C.userID
JOIN Languages L ON U.ID = L.userID
WHERE L.language = 'Korean';

--Login page info: loginID and basic information. If user is clipper, include clipperID
SELECT 
    U.ID AS userID,
    U.loginID,
    U.nickname,
    U.role,
    U.profileImage,
    U.emailAddress,
    C.ID AS clipperID
FROM UserAccount U
LEFT JOIN Clipper C ON U.ID = C.UserID
WHERE U.loginID = 'alice123' 
  AND U.passWord = 'passAlice!'; -- FIXME: Using hash function for security
