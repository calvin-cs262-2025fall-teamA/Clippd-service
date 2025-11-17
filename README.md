# Clippd-service
This one will eventually hold your data service application.

## Database schema
**UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, createdAt)\
Languages (ID, UserID, language)\
Client (ID, UserID)\
FavoriteClippers (ClientID, ClipperID, favoritedAt)\
Clipper (ID, UserID)\
Portfolio (ID, ClipperID, shopName, shopAddress, city, state, description)\
Pictures (ID, PortfolioID, image, addedAt)\
Service (ID, ClipperID, serviceName, price)\
Specialty (ID, ClipperID, haiType)\
Review (ID, ClientID, ClipperID, rating, comment, createdAt)**