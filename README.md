# Clippd-service
Backend API service for the Clippd barber booking application.

## Database schema
**UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)\
Languages (ID, UserID, language)\
Client (ID, UserID)\
FavoriteClippers (ClientID, ClipperID, favoritedAt)\
Clipper (ID, UserID)\
Portfolio (ID, ClipperID, shopName, shopAddress, city, state, latitude, longitude, description)\
Pictures (ID, PortfolioID, image, addedAt)\
Service (ID, ClipperID, serviceName, price, durationMinutes)\
Specialty (ID, ClipperID, haiType)\
Review (ID, ClientID, ClipperID, rating, comment, createdAt)**
