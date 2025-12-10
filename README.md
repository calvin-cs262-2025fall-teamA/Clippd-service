# Clippd-service
This is the data service application for the [Clippd project](https://github.com/calvin-cs262-2025fall-teamA/Clippd-project), which is deployed [here](https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net).

Based on this URL, the service implements the following endpoints:
- `/` — a hello message
- `/users` — the full list of users
- `/users/:id` — the single user with the given ID (e.g., `/users/1`)
- `/clippers` — the full list of clippers
- `/clippers/:id` — the single clipper with the given ID (e.g., `/clippers/1`)
- `/clippers/:id/portfolio` — the full portfolio for the given clipper
- `/portfolio/:id` — the single portfolio entry with the given ID
- `/portfolio/:id/pictures` — the full list of pictures for the given portfolio
- `/clippers/:id/services` — the full list of services for the given clipper
- `/clippers/:id/reviews` — the full list of reviews for the given clipper
- `/clients/:id/favorites` — the full list of favorite clippers for the given client
- `/clients/:clientId/favorites/:clipperId` — a specific favorite relationship
- `/clippers/:id/specialties` — the full list of specialties for the given clipper

It is based on the [standard Azure App Service tutorial for Node.js](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=linux&pivots=development-environment-cli).

The database is relational with the schema specified in the `sql/` sub-directory and is hosted [on Azure PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql/). The database server, user and password are stored as Azure application settings so that they aren’t exposed in this (public) repo.

# Database schema
**UserAccount (ID, firstName, lastName, loginID, passWord, role, nickname, address, city, state, emailAddress, phone, bio, profileImage, latitude, longitude, createdAt)\
Languages (UserID, language)\
Client (ID, UserID)\
FavoriteClippers (ClientID, ClipperID, favoritedAt)\
Clipper (ID, UserID)\
Portfolio (ID, ClipperID, shopName, shopAddress, city, state, latitude, longitude, description)\
Pictures (ID, PortfolioID, image, addedAt)\
Service (ID, ClipperID, serviceName, price, durationMinutes)\
Specialty (ID, ClipperID, haiType)\
Review (ID, ClientID, ClipperID, rating, comment, createdAt)**