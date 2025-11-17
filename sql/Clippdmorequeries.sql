--This will get the shop name, address, city, state, and basic user info for each clipper.
SELECT c.shopName, c.shopAddress, c.city, c.state, u.firstName, u.lastName, u.profileImage
FROM Clipper cl
JOIN UserAccount u ON cl.userID = u.ID;

-- This will get the clipper’s shop name, address, description, and pictures in the portfolio.
SELECT p.shopName, p.shopAddress, p.city, p.state, p.description, pic.image
FROM Portfolio p
JOIN Pictures pic ON p.ID = pic.portfolioID
WHERE p.clipperID = <clipper_id>;

-- This will get the reviews for a specific clipper, ordered by date.
SELECT r.rating, r.comment, r.createdAt, u.firstName, u.lastName
FROM Review r
JOIN Client c ON r.clientID = c.ID
JOIN UserAccount u ON c.userID = u.ID
WHERE r.clipperID = <clipper_id>
ORDER BY r.createdAt DESC;

-- This will get a list of the client's favorite clippers with their shop details. 
SELECT cl.shopName, cl.shopAddress, cl.city, cl.state, u.firstName, u.lastName
FROM FavoriteClippers fc
JOIN Clipper cl ON fc.clipperID = cl.ID
JOIN UserAccount u ON cl.userID = u.ID
WHERE fc.clientID = <client_id>;

-- To show the list of services a clipper offers on their profile page:
SELECT s.name, s.description, s.price
FROM Service s
JOIN Clipper cl ON s.clipperID = cl.ID
WHERE cl.ID = <clipper_id>;

--This shows the top 5 highest-rated clippers based on average review ratings.
SELECT cl.shopName, cl.shopAddress, u.firstName, u.lastName, AVG(r.rating) AS avgRating
FROM Clipper cl
JOIN Review r ON cl.ID = r.clipperID
JOIN UserAccount u ON cl.userID = u.ID
GROUP BY cl.ID, u.firstName, u.lastName
ORDER BY avgRating DESC
LIMIT 5;

--This is useful if you we later decide to add appointments booking to the app:
SELECT a.appointmentTime, s.serviceName, a.status
FROM Appointment a
JOIN Service s ON a.serviceID = s.ID
WHERE a.clientID = <client_id>
ORDER BY a.appointmentTime DESC;

-- To show how many clients a clipper has served (good for a dashboard or profile page):
SELECT cl.shopName, COUNT(DISTINCT r.clientID) AS numClients
FROM Clipper cl
JOIN Review r ON cl.ID = r.clipperID
GROUP BY cl.ID;
