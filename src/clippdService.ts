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

import express from 'express';
import cors from 'cors';
import pgPromise from 'pg-promise';
import 'dotenv/config';

// Import types for compile-time checking.
import type { Request, Response, NextFunction } from 'express';
import type {
  UserAccount,
  UserAccountInput,
  // Clipper,
  ClipperWithDetails,
  // FavoriteClipper,
  Portfolio,
  PortfolioInput,
  Picture,
  Service,
  ServiceInput,
  // Review,
  ReviewWithDetails,
} from './types.js';

// Set up the database
const db = pgPromise()({
  host: process.env.DB_SERVER || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Configure the server and its routes
const app = express();
const port: number = parseInt(process.env.PORT as string) || 3000;
const router = express.Router();

app.use(cors());
app.use(express.json());  // Move this to app level
router.use(express.json());

// Root endpoint
router.get('/', readHello);

// Test login endpoint
router.post('/test-login', (req: Request, res: Response) => {
  try {
    console.log('[TestLogin] Received request');
    res.status(200).json({
      id: 999,
      firstName: 'Test',
      lastName: 'User',
      role: 'Client',
      emailAddress: 'test@example.com',
    });
  } catch (err) {
    console.error('[TestLogin] Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Authentication routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);

// User routes
router.get('/users', readUsers);
router.get('/users/:id', readUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Clipper routes
router.get('/clippers', readClippers);
router.get('/clippers/:id', readClipper);
router.post('/clippers', createClipper);
router.put('/clippers/:id', updateClipper);
router.delete('/clippers/:id', deleteClipper);

// Portfolio routes
router.get('/clippers/:id/portfolio', readPortfolio);
router.post('/clippers/:id/portfolio', createPortfolio);
router.put('/portfolio/:id', updatePortfolio);

// Picture routes
router.get('/portfolio/:id/pictures', readPictures);
router.post('/portfolio/:id/pictures', addPicture);
router.delete('/pictures/:id', deletePicture);

// Service routes
router.get('/clippers/:id/services', readServices);
router.post('/clippers/:id/services', addService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Review routes
router.get('/clippers/:id/reviews', readReviews);
router.post('/clippers/:id/reviews', addReview);
router.delete('/reviews/:id', deleteReview);

// Favorites routes
router.get('/clients/:id/favorites', readFavorites);
router.post('/clients/:clientId/favorites/:clipperId', addFavorite);
router.delete('/clients/:clientId/favorites/:clipperId', removeFavorite);

// Specialty routes
router.get('/clippers/:id/specialties', readSpecialties);
router.post('/clippers/:id/specialties', addSpecialty);
router.delete('/specialties/:id', deleteSpecialty);

app.use(router);

// Error handling middleware
app.use((error: Error, req: Request, res: Response) => {
  console.error('[Error Handler] Error occurred:', error);
  console.error('[Error Handler] Error message:', error.message);
  console.error('[Error Handler] Error stack:', error.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
});

app.listen(port, '0.0.0.0', (): void => {
  console.log(`Listening on port ${port} on all network interfaces`);
});

/**
 * Utility function to standardize response pattern for database queries.
 */
function returnDataOr404(response: Response, data: unknown): void {
  // Use explicit null/undefined check to satisfy ESLint eqeqeq rule.
  if (data === null || data === undefined) {
    response.sendStatus(404);
    return;
  }

  response.send(data);
}

/**
 * Root endpoint - health check
 */
function readHello(_request: Request, response: Response): void {
  response.send('Hello, Clippd service!');
}

// ==================== AUTHENTICATION ====================

/**
 * Sign up a new user
 */
function signup(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.one(
    `INSERT INTO UserAccount(firstName, lastName, loginID, passWord, role, city, state, emailAddress, phone, bio, profileImage)
     VALUES (\${firstName}, \${lastName}, \${loginID}, \${passWord}, \${role}, \${city}, \${state}, \${emailAddress}, \${phone}, \${bio}, \${profileImage})
     RETURNING id`,
    request.body as UserAccountInput,
  )
    .then((data: { id: number }): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Login user - validate credentials
 */
function login(request: Request, response: Response): void {
  try {
    const { loginID, passWord } = request.body;
    
    console.log('[Login] Request received with loginID:', loginID);
    
    if (!loginID || !passWord) {
      console.log('[Login] Missing loginID or passWord');
      response.status(400).json({ error: 'loginID and passWord required' });
      return;
    }

    // Query database for user using template literal syntax
    db.oneOrNone(
      'SELECT id, firstName, lastName, role, emailAddress FROM UserAccount WHERE loginID = ${loginID} AND passWord = ${passWord}',
      { loginID, passWord },
    )
      .then((user: { id: number; firstName: string; lastName: string; role: string; emailAddress: string } | null) => {
        if (user) {
          console.log('[Login] Login successful for user:', loginID);
          response.status(200).json(user);
        } else {
          console.log('[Login] Login failed - invalid credentials');
          response.status(401).json({ error: 'Invalid credentials' });
        }
      })
      .catch((error: Error) => {
        console.error('[Login] Database error:', error.message);
        response.status(500).json({ error: 'Database error', message: error.message });
      });
  } catch (error: unknown) {
    console.error('[Login] Unexpected error:', (error as Error).message);
    response.status(500).json({ error: 'Server error', message: (error as Error).message });
  }
}

// ==================== USER CRUD ====================

/**
 * Get user by ID
 */
function readUser(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone('SELECT * FROM UserAccount WHERE id=${id}', request.params)
    .then((data: UserAccount | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Update user information
 */
function updateUser(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const userId = request.params.id;
  const {
    firstName,
    lastName,
    bio,
    profileImage,
    city,
    state,
    address,
    phone,
    emailAddress,
  } = request.body;

  // Build the update query using pg-promise parameterized syntax
  try {
    const updateFields: { [key: string]: unknown } = {};
    
    // Convert empty strings to NULL for optional fields
    if (firstName !== undefined) updateFields.firstName = firstName || null;
    if (lastName !== undefined) updateFields.lastName = lastName || null;
    if (bio !== undefined) updateFields.bio = bio || null;
    if (profileImage !== undefined) updateFields.profileImage = profileImage || null;
    if (city !== undefined) updateFields.city = city || null;
    if (state !== undefined) updateFields.state = state || null;
    if (address !== undefined) updateFields.address = address || null;
    if (phone !== undefined) updateFields.phone = phone || null;
    if (emailAddress !== undefined) updateFields.emailAddress = emailAddress || null;

    if (Object.keys(updateFields).length === 0) {
      response.status(400).json({ error: 'No fields to update' });
      return;
    }

    // Build SET clause manually
    const setClauses: string[] = [];
    const params: { [key: string]: unknown } = { userId };

    Object.entries(updateFields).forEach(([key, value], index) => {
      const paramName = `val${index}`;
      setClauses.push(`${key}=$\{${paramName}\}`);
      params[paramName] = value;
    });

    const query = `
      UPDATE UserAccount 
      SET ${setClauses.join(', ')}
      WHERE id=$\{userId\}
      RETURNING id, firstName, lastName, bio, profileImage, city, state, emailAddress, phone
    `;

    db.oneOrNone(query, params)
      .then((data: { id: number } | null): void => {
        returnDataOr404(response, data);
      })
      .catch((error: Error): void => {
        next(error);
      });
  } catch (error) {
    next(error as Error);
  }
}

/**
 * Delete user account
 */
function deleteUser(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    'DELETE FROM UserAccount WHERE id=${id} RETURNING id',
    request.params,
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Get all users (without sensitive fields)
 */
function readUsers(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone(
    'SELECT id, firstName, lastName, role, emailAddress, city, state, profileImage FROM UserAccount',
  )
    .then((data: Partial<UserAccount>[]): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

// ==================== CLIPPER CRUD ====================

/**
 * Get all clippers with their details including portfolio images
 */
function readClippers(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  // First get all clippers with their basic info
  db.manyOrNone(
    `SELECT 
      c.id, c.userid,
      u.firstName, u.lastName, u.emailAddress, u.city, u.state, u.bio, u.profileImage,
      p.shopName, p.shopAddress, p.description,
      COALESCE(AVG(r.rating), 0) as rating
    FROM Clipper c
    JOIN UserAccount u ON c.userID = u.id
    LEFT JOIN Portfolio p ON c.id = p.clipperID
    LEFT JOIN Review r ON c.id = r.clipperID
    GROUP BY c.id, u.id, p.id`,
  )
    .then(async (clippers: ClipperWithDetails[]): Promise<void> => {
      // For each clipper, fetch their portfolio images and reviews
      const clippersWithImagesAndReviews = await Promise.all(
        clippers.map(async (clipper) => {
          // Fetch images
          const images = await db.manyOrNone(
            `SELECT pic.image 
             FROM Pictures pic
             JOIN Portfolio p ON pic.portfolioID = p.id
             WHERE p.clipperID = $1
             ORDER BY pic.addedAt`,
            [clipper.id],
          );

          // Fetch reviews with reviewer info
          const reviews = await db.manyOrNone(
            `SELECT 
              r.id, 
              r.clientID,
              r.clipperID, 
              r.rating, 
              r.comment as "reviewContent",
              r.createdAt as "date",
              COALESCE(u.firstName || ' ' || u.lastName, 'Anonymous') AS "reviewerName"
            FROM Review r
            LEFT JOIN Client cl ON r.clientID = cl.id
            LEFT JOIN UserAccount u ON cl.userID = u.id
            WHERE r.clipperID = $1
            ORDER BY r.createdAt DESC`,
            [clipper.id],
          );

          return {
            ...clipper,
            images: images.map((img: { image: string }) => img.image),
            reviews,
          };
        }),
      );

      response.send(clippersWithImagesAndReviews);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Get single clipper with details
 */
function readClipper(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    `SELECT 
      c.id, c.userid,
      u.firstName, u.lastName, u.emailAddress, u.city, u.state, u.bio, u.profileImage,
      p.shopName, p.shopAddress, p.description,
      COALESCE(AVG(r.rating), 0) as rating
    FROM Clipper c
    JOIN UserAccount u ON c.userID = u.id
    LEFT JOIN Portfolio p ON c.id = p.clipperID
    LEFT JOIN Review r ON c.id = r.clipperID
    WHERE c.id=\${id}
    GROUP BY c.id, u.id, p.id`,
    request.params,
  )
    .then((data: ClipperWithDetails | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Create clipper profile (assumes user already exists)
 */
function createClipper(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { userID } = request.body;
  db.one('INSERT INTO Clipper(userID) VALUES (${userID}) RETURNING id', {
    userID,
  })
    .then((data: { id: number }): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Update clipper (updates associated user account)
 */
function updateClipper(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    `UPDATE UserAccount 
     SET bio=\${body.bio}, profileImage=\${body.profileImage}
     WHERE id=(SELECT userID FROM Clipper WHERE id=\${params.id})
     RETURNING id`,
    {
      params: request.params,
      body: request.body,
    },
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Delete clipper profile
 */
function deleteClipper(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    'DELETE FROM Clipper WHERE id=${id} RETURNING id',
    request.params,
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

// ==================== PORTFOLIO ====================

/**
 * Get clipper's portfolio
 */
function readPortfolio(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone('SELECT * FROM Portfolio WHERE clipperID=${id}', request.params)
    .then((data: Portfolio | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Create portfolio for clipper
 */
function createPortfolio(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const portfolioData = {
    ...request.body,
    clipperID: request.params.id,
  };
  db.one(
    `INSERT INTO Portfolio(clipperID, shopName, shopAddress, city, state, latitude, longitude, description)
     VALUES (\${clipperID}, \${shopName}, \${shopAddress}, \${city}, \${state}, \${latitude}, \${longitude}, \${description})
     RETURNING id`,
    portfolioData as PortfolioInput,
  )
    .then((data: { id: number }): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Update portfolio
 */
function updatePortfolio(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    `UPDATE Portfolio 
     SET shopName=\${body.shopName}, shopAddress=\${body.shopAddress},
        city=\${body.city}, state=\${body.state}, latitude=\${body.latitude}, longitude=\${body.longitude}, description=\${body.description}
     WHERE id=\${params.id}
     RETURNING id`,
    {
      params: request.params,
      body: request.body as Partial<PortfolioInput>,
    },
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

// ==================== PICTURES ====================

/**
 * Get all pictures for a portfolio
 */
function readPictures(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone(
    'SELECT * FROM Pictures WHERE portfolioID=${id} ORDER BY addedAt DESC',
    request.params,
  )
    .then((data: Picture[]): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Add picture to portfolio
 */
function addPicture(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { image } = request.body;
  db.one(
    'INSERT INTO Pictures(portfolioID, image) VALUES (${id}, ${image}) RETURNING id',
    { id: request.params.id, image },
  )
    .then((data: { id: number }): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Delete picture
 */
function deletePicture(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    'DELETE FROM Pictures WHERE id=${id} RETURNING id',
    request.params,
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

// ==================== SERVICES ====================

/**
 * Get all services for a clipper
 */
function readServices(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone('SELECT * FROM Service WHERE clipperID=${id}', request.params)
    .then((data: Service[]): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Add service for clipper
 */
function addService(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const serviceData = {
    clipperID: request.params.id,
    ...request.body,
  };
  db.one(
    'INSERT INTO Service(clipperID, serviceName, price, durationMinutes) VALUES (${clipperID}, ${serviceName}, ${price}, ${durationMinutes}) RETURNING id',
    serviceData as ServiceInput,
  )
    .then((data: { id: number }): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Update service
 */
function updateService(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    `UPDATE Service 
     SET serviceName=\${body.serviceName}, price=\${body.price}, durationMinutes=\${body.durationMinutes}
     WHERE id=\${params.id}
     RETURNING id`,
    {
      params: request.params,
      body: request.body,
    },
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Delete service
 */
function deleteService(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    'DELETE FROM Service WHERE id=${id} RETURNING id',
    request.params,
  )
    .then((data: { id: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

// ==================== REVIEWS ====================

/**
 * Get all reviews for a clipper
 */
function readReviews(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone(
    `SELECT 
      r.id, r.rating, r.comment, r.clientid, r.createdat,
      u.firstname || ' ' || u.lastname as "reviewerName",
      u.city as "reviewerCity"
    FROM review r
    JOIN client c ON r.clientid = c.id
    JOIN useraccount u ON c.userid = u.id
    WHERE r.clipperid=$1
    ORDER BY r.id DESC`,
    [parseInt(request.params.id)],
  )
    .then((data: ReviewWithDetails[]): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      console.error('[readReviews] Database error:', error.message);
      next(error);
    });
}

/**
 * Add review for clipper
 */
function addReview(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { clientID, clipperID, rating, comment } = request.body;
  
  // First, ensure the sequence is set correctly
  db.oneOrNone(
    'SELECT setval(pg_get_serial_sequence(\'review\', \'id\'), (SELECT COALESCE(MAX(id), 0) FROM review) + 1)',
  )
    .then((): Promise<{ id: number }> => {
      // Now insert the review
      return db.one(
        'INSERT INTO review(clientid, clipperid, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id',
        [clientID, clipperID, rating, comment],
      );
    })
    .then(async (data: { id: number }): Promise<void> => {
      // Calculate average rating for this clipper
      const ratingData: { averageRating: number } = await db.one(
        'SELECT ROUND(AVG(rating)::numeric, 1) as "averageRating" FROM review WHERE clipperid=$1',
        [clipperID],
      );
      response.status(201).json({ 
        id: data.id, 
        averageRating: ratingData.averageRating, 
      });
    })
    .catch((error: Error): void => {
      console.error('[addReview] Database error:', error.message);
      console.error('[addReview] Full error:', error);
      next(error);
    });
}

/**
 * Update review (rating and comment)
 */
/**
 * Delete review
 */
function deleteReview(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { id } = request.params;
  
  // First, get the clipperID before deleting
  db.oneOrNone(
    'SELECT clipperid FROM review WHERE id=$1',
    [parseInt(id)],
  )
    .then(async (reviewData: { clipperid: number } | null): Promise<void> => {
      if (!reviewData) {
        response.status(404).json({ error: 'Review not found' });
        return;
      }
      
      const clipperID = reviewData.clipperid;
      
      // Delete the review
      const data: { id: number } | null = await db.oneOrNone(
        'DELETE FROM Review WHERE id=$1 RETURNING id',
        [parseInt(id)],
      );
      
      if (!data) {
        response.status(404).json({ error: 'Review not found' });
        return;
      }
      
      // Calculate average rating for this clipper
      const ratingData: { averageRating: number | null } = await db.one(
        'SELECT ROUND(AVG(rating)::numeric, 1) as "averageRating" FROM review WHERE clipperid=$1',
        [clipperID],
      );
      
      response.status(200).json({ 
        id: data.id, 
        averageRating: ratingData.averageRating || 0,
      });
    })
    .catch((error: Error): void => {
      console.error('[deleteReview] Database error:', error.message);
      next(error);
    });
}

// ==================== FAVORITES ====================

/**
 * Get all favorite clippers for a client
 */
function readFavorites(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone(
    `SELECT 
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
    ORDER BY fc.favoritedAt DESC`,
    request.params,
  )
    .then((data: ClipperWithDetails[]): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Add clipper to favorites
 */
function addFavorite(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.one(
    'INSERT INTO FavoriteClippers(clientID, clipperID) VALUES (${clientId}, ${clipperId}) RETURNING clientID, clipperID',
    request.params,
  )
    .then((data: { clientid: number; clipperid: number }): void => {
      response.send(data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Remove clipper from favorites
 */
function removeFavorite(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    'DELETE FROM FavoriteClippers WHERE clientID=${clientId} AND clipperID=${clipperId} RETURNING clientID',
    request.params,
  )
    .then((data: { clientid: number } | null): void => {
      returnDataOr404(response, data);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

// ==================== SPECIALTIES ====================

/*
 * Get all specialties for a clipper
 */
function readSpecialties(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone('SELECT * FROM Specialty WHERE clipperID=${id}', request.params)
    .then((data) => response.send(data))
    .catch(next);
}

/*
 * Add specialty for a clipper
 */
function addSpecialty(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const data = {
    clipperID: request.params.id,
    hairType: request.body.hairType,
  };

  db.one(
    'INSERT INTO Specialty(clipperID, hairType) VALUES (${clipperID}, ${hairType}) RETURNING id',
    data,
  )
    .then((data) => response.send(data))
    .catch(next);
}

/*
 * Delete specialty
 */
function deleteSpecialty(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    'DELETE FROM Specialty WHERE id=${id} RETURNING id',
    request.params,
  )
    .then((data) => returnDataOr404(response, data))
    .catch(next);
}
