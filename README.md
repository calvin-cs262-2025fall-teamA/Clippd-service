# Clippd-service
Backend API service for the Clippd barber booking application.

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

## API Routes

### Base URL
```
http://localhost:3000/api
```

### Authentication Routes (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user info

### Barber Routes (`/api/barbers`)
- `GET /` - Get all barbers (with filters)
- `GET /:id` - Get single barber details
- `POST /` - Create barber profile (private)
- `PUT /:id` - Update barber profile (private)
- `DELETE /:id` - Delete barber profile (private)
- `GET /:id/reviews` - Get barber reviews
- `POST /:id/reviews` - Add review (private)

### Favorites Routes (`/api/favorites`)
- `GET /` - Get user's favorites (private)
- `POST /:barberId` - Add to favorites (private)
- `DELETE /:barberId` - Remove from favorites (private)
- `GET /check/:barberId` - Check if favorited (private)

### User Routes (`/api/users`)
- `GET /profile` - Get user profile (private)
- `PUT /profile` - Update user profile (private)
- `PUT /preferences` - Update user preferences (private)
- `DELETE /account` - Delete user account (private)

## Response Format

All responses follow this structure:

```json
{
  "success": true/false,
  "message": "Description of result",
  "data": { ... } or [ ... ],
  "error": "Error message (if applicable)"
}
```

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file with database connection and JWT secret
3. Run server: `npm start` or `npm run dev` (with nodemon)

## Next Steps

1. Implement database connection and queries
2. Add authentication middleware for protected routes
3. Add input validation and sanitization
4. Implement business logic in each route
5. Connect to PostgreSQL database using the schema above