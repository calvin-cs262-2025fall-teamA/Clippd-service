/**
 * This module implements a REST-inspired web service for the Clippd DB hosted
 * on PostgreSQL. Notes:
 *
 * - This service is written in TypeScript and uses Node type-stripping.
 * To do a static type check, run: npm run type-check
 *
 * - The service assumes that the database connection strings and the server
 * mode are set in environment variables (e.g., using a git-ignored `.env` file).
 * See the DB_* variables used by pgPromise.
 *
 * - To execute locally, run:
 *      npm start
 *
 * - To guard against SQL injection attacks, this code uses pgPromise's built-in
 * variable escaping. We don't use JS template strings because this doesn't filter
 * client-supplied values properly.
 *
 * - The endpoints call `next(err)` to handle errors without crashing the service.
 *
 * @author: Team A
 * @date: Fall, 2025
 */
import express from "express";
import cors from "cors";
import pgPromise from "pg-promise";
import "dotenv/config";
// Set up the database
const db = pgPromise()({
    host: process.env.DB_SERVER || "",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_DATABASE || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    ssl: {
        rejectUnauthorized: false
    }
});
// Configure the server and its routes
const app = express();
const port = parseInt(process.env.PORT) || 3000;
const router = express.Router();
app.use(cors());
router.use(express.json());
// Root endpoint
router.get("/", readHello);
// Authentication routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);
// User routes
router.get("/users", readUsers);
router.get("/users/:id", readUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
// Clipper routes
router.get("/clippers", readClippers);
router.get("/clippers/:id", readClipper);
router.post("/clippers", createClipper);
router.put("/clippers/:id", updateClipper);
router.delete("/clippers/:id", deleteClipper);
// Portfolio routes
router.get("/clippers/:id/portfolio", readPortfolio);
router.post("/clippers/:id/portfolio", createPortfolio);
router.put("/portfolio/:id", updatePortfolio);
// Picture routes
router.get("/portfolio/:id/pictures", readPictures);
router.post("/portfolio/:id/pictures", addPicture);
router.delete("/pictures/:id", deletePicture);
// Service routes
router.get("/clippers/:id/services", readServices);
router.post("/clippers/:id/services", addService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);
// Review routes
router.get("/clippers/:id/reviews", readReviews);
router.post("/clippers/:id/reviews", addReview);
router.delete("/reviews/:id", deleteReview);
// Favorites routes
router.get("/clients/:id/favorites", readFavorites);
router.post("/clients/:clientId/favorites/:clipperId", addFavorite);
router.delete("/clients/:clientId/favorites/:clipperId", removeFavorite);
// Specialty routes
router.get("/clippers/:id/specialties", readSpecialties);
router.post("/clippers/:id/specialties", addSpecialty);
router.delete("/specialties/:id", deleteSpecialty);
app.use(router);
app.listen(port, "0.0.0.0", () => {
    console.log(`Listening on port ${port} on all network interfaces`);
});
/**
 * Utility function to standardize response pattern for database queries.
 */
function returnDataOr404(response, data) {
    if (data == null) {
        response.sendStatus(404);
    }
    else {
        response.send(data);
    }
}
/**
 * Root endpoint - health check
 */
function readHello(_request, response) {
    response.send("Hello, Clippd service!");
}
// ==================== AUTHENTICATION ====================
/**
 * Sign up a new user
 */
function signup(request, response, next) {
    db.one(`INSERT INTO UserAccount(firstName, lastName, loginID, passWord, role, city, state, emailAddress, phone, bio, profileImage)
     VALUES (\${firstName}, \${lastName}, \${loginID}, \${passWord}, \${role}, \${city}, \${state}, \${emailAddress}, \${phone}, \${bio}, \${profileImage})
     RETURNING id`, request.body)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Login user - validate credentials
 */
function login(request, response, next) {
    const { loginID, password } = request.body;
    db.oneOrNone("SELECT id, firstName, lastName, role, emailAddress FROM UserAccount WHERE loginID=${loginID} AND passWord=${passWord}", { loginID, password })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== USER CRUD ====================
/**
 * Get user by ID
 */
function readUser(request, response, next) {
    db.oneOrNone("SELECT * FROM UserAccount WHERE id=${id}", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Update user information
 */
function updateUser(request, response, next) {
    db.oneOrNone(`UPDATE UserAccount 
     SET firstName=\${body.firstName}, lastName=\${body.lastName}, 
         emailAddress=\${body.emailAddress}, phone=\${body.phone}, 
         bio=\${body.bio}, profileImage=\${body.profileImage},
         city=\${body.city}, state=\${body.state}
     WHERE id=\${params.id} 
     RETURNING id`, {
        params: request.params,
        body: request.body,
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Delete user account
 */
function deleteUser(request, response, next) {
    db.oneOrNone("DELETE FROM UserAccount WHERE id=${id} RETURNING id", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Get all users (without sensitive fields)
 */
function readUsers(_request, response, next) {
    db.manyOrNone("SELECT id, firstName, lastName, role, emailAddress, city, state, profileImage FROM UserAccount")
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== CLIPPER CRUD ====================
/**
 * Get all clippers with their details
 */
function readClippers(_request, response, next) {
    db.manyOrNone(`SELECT 
      c.id, c.userid,
      u.firstName, u.lastName, u.emailAddress, u.city, u.state, u.bio, u.profileImage,
      p.shopName, p.shopAddress, p.description,
      COALESCE(AVG(r.rating), 0) as rating
    FROM Clipper c
    JOIN UserAccount u ON c.userID = u.id
    LEFT JOIN Portfolio p ON c.id = p.clipperID
    LEFT JOIN Review r ON c.id = r.clipperID
    GROUP BY c.id, u.id, p.id`)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Get single clipper with details
 */
function readClipper(request, response, next) {
    db.oneOrNone(`SELECT 
      c.id, c.userid,
      u.firstName, u.lastName, u.emailAddress, u.city, u.state, u.bio, u.profileImage,
      p.shopName, p.shopAddress, p.description,
      COALESCE(AVG(r.rating), 0) as rating
    FROM Clipper c
    JOIN UserAccount u ON c.userID = u.id
    LEFT JOIN Portfolio p ON c.id = p.clipperID
    LEFT JOIN Review r ON c.id = r.clipperID
    WHERE c.id=\${id}
    GROUP BY c.id, u.id, p.id`, request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Create clipper profile (assumes user already exists)
 */
function createClipper(request, response, next) {
    const { userID } = request.body;
    db.one("INSERT INTO Clipper(userID) VALUES (${userID}) RETURNING id", {
        userID,
    })
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Update clipper (updates associated user account)
 */
function updateClipper(request, response, next) {
    db.oneOrNone(`UPDATE UserAccount 
     SET bio=\${body.bio}, profileImage=\${body.profileImage}
     WHERE id=(SELECT userID FROM Clipper WHERE id=\${params.id})
     RETURNING id`, {
        params: request.params,
        body: request.body,
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Delete clipper profile
 */
function deleteClipper(request, response, next) {
    db.oneOrNone("DELETE FROM Clipper WHERE id=${id} RETURNING id", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== PORTFOLIO ====================
/**
 * Get clipper's portfolio
 */
function readPortfolio(request, response, next) {
    db.oneOrNone("SELECT * FROM Portfolio WHERE clipperID=${id}", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Create portfolio for clipper
 */
function createPortfolio(request, response, next) {
    const portfolioData = {
        ...request.body,
        clipperID: request.params.id,
    };
    db.one(`INSERT INTO Portfolio(clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
     VALUES (\${clipperID}, \${shopName}, \${shopAddress}, \${city}, \${state}, \${latitude}, \${longitude}, \${description})
     RETURNING id`, portfolioData)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Update portfolio
 */
function updatePortfolio(request, response, next) {
    db.oneOrNone(`UPDATE Portfolio 
     SET shopName=\${body.shopName}, shopAddress=\${body.shopAddress},
        city=\${body.city}, state=\${body.state}, latitude=\${body.latitude}, longitude=\${body.longitude}, description=\${body.description}
     WHERE id=\${params.id}
     RETURNING id`, {
        params: request.params,
        body: request.body,
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== PICTURES ====================
/**
 * Get all pictures for a portfolio
 */
function readPictures(request, response, next) {
    db.manyOrNone("SELECT * FROM Pictures WHERE portfolioID=${id} ORDER BY addedAt DESC", request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Add picture to portfolio
 */
function addPicture(request, response, next) {
    const { image } = request.body;
    db.one("INSERT INTO Pictures(portfolioID, image) VALUES (${id}, ${image}) RETURNING id", { id: request.params.id, image })
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Delete picture
 */
function deletePicture(request, response, next) {
    db.oneOrNone("DELETE FROM Pictures WHERE id=${id} RETURNING id", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== SERVICES ====================
/**
 * Get all services for a clipper
 */
function readServices(request, response, next) {
    db.manyOrNone("SELECT * FROM Service WHERE clipperID=${id}", request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Add service for clipper
 */
function addService(request, response, next) {
    const serviceData = {
        clipperID: request.params.id,
        ...request.body,
    };
    db.one("INSERT INTO Service(clipperID, serviceName, price, durationMinutes) VALUES (${clipperID}, ${serviceName}, ${price}, ${durationMinutes}) RETURNING id", serviceData)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Update service
 */
function updateService(request, response, next) {
    db.oneOrNone(`UPDATE Service 
     SET serviceName=\${body.serviceName}, price=\${body.price}, durationMinutes=\${body.durationMinutes}
     WHERE id=\${params.id}
     RETURNING id`, {
        params: request.params,
        body: request.body,
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Delete service
 */
function deleteService(request, response, next) {
    db.oneOrNone("DELETE FROM Service WHERE id=${id} RETURNING id", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== REVIEWS ====================
/**
 * Get all reviews for a clipper
 */
function readReviews(request, response, next) {
    db.manyOrNone(`SELECT 
      r.id, r.rating, r.comment, r.createdAt,
      u.firstName || ' ' || u.lastName as reviewerName,
      u.city as reviewerCity
    FROM Review r
    JOIN Client c ON r.clientID = c.id
    JOIN UserAccount u ON c.userID = u.id
    WHERE r.clipperID=\${id}
    ORDER BY r.createdAt DESC`, request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Add review for clipper
 */
function addReview(request, response, next) {
    const reviewData = {
        clipperID: request.params.id,
        ...request.body,
    };
    db.one("INSERT INTO Review(clientID, clipperID, rating, comment) VALUES (${clientID}, ${clipperID}, ${rating}, ${comment}) RETURNING id", reviewData)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Delete review
 */
function deleteReview(request, response, next) {
    db.oneOrNone("DELETE FROM Review WHERE id=${id} RETURNING id", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== FAVORITES ====================
/**
 * Get all favorite clippers for a client
 */
function readFavorites(request, response, next) {
    db.manyOrNone(`SELECT 
      c.id, c.userid,
      u.firstName, u.lastName, u.city, u.state, u.profileImage,
      p.shopName,
      fc.favoritedAt,
      COALESCE(AVG(r.rating), 0) as rating
    FROM FavoriteClippers fc
    JOIN Clipper c ON fc.clipperID = c.id
    JOIN UserAccount u ON c.userID = u.id
    LEFT JOIN Portfolio p ON c.id = p.clipperID
    LEFT JOIN Review r ON c.id = r.clipperID
    WHERE fc.clientID=\${id}
    GROUP BY c.id, u.id, p.id
    ORDER BY fc.favoritedAt DESC`, request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Add clipper to favorites
 */
function addFavorite(request, response, next) {
    db.one("INSERT INTO FavoriteClippers(clientID, clipperID) VALUES (${clientId}, ${clipperId}) RETURNING clientID, clipperID", request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Remove clipper from favorites
 */
function removeFavorite(request, response, next) {
    db.oneOrNone("DELETE FROM FavoriteClippers WHERE clientID=${clientId} AND clipperID=${clipperId} RETURNING clientID", request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// ==================== SPECIALTIES ====================
/*
* Get all specialties for a clipper
*/
function readSpecialties(request, response, next) {
    db.manyOrNone("SELECT * FROM Specialty WHERE clipperID=${id}", request.params)
        .then((data) => response.send(data))
        .catch(next);
}
/*
* Add specialty for a clipper
*/
function addSpecialty(request, response, next) {
    const data = {
        clipperID: request.params.id,
        hairType: request.body.hairType,
    };
    db.one("INSERT INTO Specialty(clipperID, hairType) VALUES (${clipperID}, ${hairType}) RETURNING id", data)
        .then((data) => response.send(data))
        .catch(next);
}
/*
* Delete specialty
*/
function deleteSpecialty(request, response, next) {
    db.oneOrNone("DELETE FROM Specialty WHERE id=${id} RETURNING id", request.params)
        .then((data) => returnDataOr404(response, data))
        .catch(next);
}
