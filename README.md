# Clippd-service
This one will eventually hold your data service application.

## Database schema
**User (ID, name, loginID, PW, role, phone, date)\
Profile (ID, UserID, nickname, address, emailAddress, bio, profileImage)\
Languages (ProfileID, language)\
Client (ID, UserID)\
FavoriteClippers (ClientID, ClipperID, date)\
Clipper (ID, UserID,)\
Portfolio (ID, ClipperID, shopName, shopAddress, decription)\
Pictures (ID, PortfolioID, image, date)\
Service (ID, ClipperID, serviceName, price)\
Review (ID, ClientID, ClipperID, rating, comment, date)**
