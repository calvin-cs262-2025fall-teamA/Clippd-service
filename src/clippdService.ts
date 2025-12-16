/**
 * @fileoverview Clippd REST API service backend
 * @description Main backend service implementing REST API for Clippd application
 * Handles user authentication, clipper management, services, portfolios, and reviews
 * Built with Express.js and PostgreSQL
 * 
 * Notes:
 * - Written in TypeScript with Node type-stripping
 * - Assumes database connection strings in environment variables (.env file)
 * - Uses pgPromise for SQL injection protection via variable escaping
 * - All endpoints use error handling via next(err) to prevent crashes
 * 
 * @author Team A
 * @version 1.0.0
 * @date Fall, 2025
 */

import express from 'express';
import cors from 'cors';
import pgPromise from 'pg-promise';
import 'dotenv/config';

// Import types for compile-time checking.
import type { Request, Response, NextFunction } from 'express';
import type {
  UserAccount,
  // UserAccountInput,
  SignupInput,
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
app.use(express.json()); // Move this to app level
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
router.put('/auth/user/profile', updateUserProfile);

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
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
/**
 * Health check endpoint for Clippd service
 * @function readHello
 * @param {Request} _request - Express request object (unused)
 * @param {Response} response - Express response object
 * @returns {void}
 */
function readHello(_request: Request, response: Response): void {
  response.send('Hello, Clippd service!');
}

// ==================== AUTHENTICATION ====================

/**
 * Register a new user account with automatic role-based record creation
 * Creates corresponding Client or Clipper record based on role
 * @function signup
 * @param {Request} request - Express request with body containing SignupInput
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void}
 * @throws Will pass database errors to error handler
 */
function signup(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  // Provide defaults for optional fields using SignupInput interface
  const signupData: SignupInput = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    loginID: request.body.loginID,
    passWord: request.body.passWord,
    role: request.body.role || 'Client',
    emailAddress: request.body.emailAddress,
    city: request.body.city || '',
    state: request.body.state || '',
    phone: request.body.phone || '',
    bio: request.body.bio || '',
    profileImage: request.body.profileImage || null,
  };

  db.one(
    `INSERT INTO UserAccount(firstName, lastName, loginID, passWord, role, city, state, emailAddress, phone, bio, profileImage)
     VALUES (\${firstName}, \${lastName}, \${loginID}, \${passWord}, \${role}, \${city}, \${state}, \${emailAddress}, \${phone}, \${bio}, \${profileImage})
     RETURNING id`,
    signupData,
  )
    .then(async (data: { id: number }): Promise<void> => {
      const { role } = signupData;

      try {
        // Automatically create Client or Clipper record based on role
        if (role === 'Client') {
          await db.none('INSERT INTO Client(userID) VALUES($1)', [data.id]);
          console.log(`[signup] Created Client record for userID ${data.id}`);
        } else if (role === 'Clipper') {
          await db.none('INSERT INTO Clipper(userID) VALUES($1)', [data.id]);
          console.log(`[signup] Created Clipper record for userID ${data.id}`);
        }
        response.send(data);
      } catch (err) {
        console.error('[signup] Error creating role record:', err);
        // Return success with user ID even if role record creation fails
        response.send(data);
      }
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Authenticate user with loginID and password
 * Returns user info on success or error if credentials invalid
 * @function login
 * @param {Request} request - Express request with body containing {loginID, passWord}
 * @param {Response} response - Express response object
 * @returns {void} User object with id, firstName, lastName, role, emailAddress, city, state, profileImage
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
      'SELECT id, firstName, lastName, role, emailAddress, city, state, profileImage FROM UserAccount WHERE loginID = ${loginID} AND passWord = ${passWord}',
      { loginID, passWord },
    )
      .then(
        (
          user: {
            id: number;
            firstName: string;
            lastName: string;
            role: string;
            emailAddress: string;
          } | null,
        ) => {
          if (user) {
            console.log('[Login] Login successful for user:', loginID);
            response.status(200).json(user);
          } else {
            console.log('[Login] Login failed - invalid credentials');
            response.status(401).json({ error: 'Invalid credentials' });
          }
        },
      )
      .catch((error: Error) => {
        console.error('[Login] Database error:', error.message);
        response
          .status(500)
          .json({ error: 'Database error', message: error.message });
      });
  } catch (error: unknown) {
    console.error('[Login] Unexpected error:', (error as Error).message);
    response
      .status(500)
      .json({ error: 'Server error', message: (error as Error).message });
  }
}

// ==================== USER PROFILE ====================

/**
 * Update current authenticated user's profile
 * Updates user account information (name, location, contact, profile image)
 * @function updateUserProfile
 * @param {Request} request - Express request with body containing {userId, firstName, lastName, city, state, profileImage, phoneNumber, email}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Updated user data or 400/404 error
 * @throws Will pass database errors to error handler
 */
function updateUserProfile(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    // Extract user ID from request (assuming it's in cookies or session)
    // For now, we'll get it from request.body since the client sends it
    const userId = request.body.userId;
    const {
      firstName,
      lastName,
      city,
      state,
      profileImage,
      phoneNumber,
      email,
    } = request.body;

    if (!userId) {
      response.status(400).json({ error: 'User ID is required' });
      return;
    }

    console.log('[updateUserProfile] Received request with:', {
      userId,
      firstName,
      lastName,
      city,
      state,
      profileImage: profileImage ? 'image provided' : 'no image',
      phoneNumber,
      email,
    });

    const updateFields: { [key: string]: unknown } = {};

    if (firstName !== undefined) {
      updateFields.firstName = firstName;
    }
    if (lastName !== undefined) {
      updateFields.lastName = lastName;
    }
    if (city !== undefined) {
      updateFields.city = city;
    }
    if (state !== undefined) {
      updateFields.state = state;
    }
    if (profileImage !== undefined) {
      updateFields.profileImage = profileImage;
    }
    if (phoneNumber !== undefined) {
      updateFields.phone = phoneNumber;
    }
    if (email !== undefined) {
      updateFields.emailAddress = email;
    }

    if (Object.keys(updateFields).length === 0) {
      response.status(400).json({ error: 'No fields to update' });
      return;
    }

    const setClauses: string[] = [];
    const params: { [key: string]: unknown } = { userId };

    Object.entries(updateFields).forEach(([key, value], index) => {
      const paramName = `val${index}`;
      setClauses.push(`${key}=$` + `{${paramName}}`);
      params[paramName] = value;
    });

    const query =
      `
      UPDATE UserAccount 
      SET ${setClauses.join(', ')}
      WHERE id=$` +
      `{userId}
      RETURNING id, firstName, lastName, city, state, emailAddress, profileImage, phone
    `;

    console.log('[updateUserProfile] Executing query:', query);
    console.log('[updateUserProfile] With params:', params);

    db.oneOrNone(query, params)
      .then((data: unknown): void => {
        if (data) {
          console.log(
            '[updateUserProfile] Update successful, returned data:',
            data,
          );
          response.status(200).json(data);
        } else {
          console.log('[updateUserProfile] User not found with ID:', userId);
          response.status(404).json({ error: 'User not found' });
        }
      })
      .catch((error: Error): void => {
        console.error('[updateUserProfile] Database error:', error.message);
        next(error);
      });
  } catch (error: unknown) {
    console.error('[updateUserProfile] Error:', (error as Error).message);
    next(error as Error);
  }
}

// ==================== USER CRUD ====================

/**
 * Retrieve a single user's account information by ID
 * @function readUser
 * @param {Request} request - Express request with params containing {id}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} UserAccount object or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Update existing user account information
 * @function updateUser
 * @param {Request} request - Express request with params {id} and body with user fields to update
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Updated user object or 404 if not found
 * @throws Will pass database errors to error handler
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
    images,
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
    if (firstName !== undefined) {
      updateFields.firstName = firstName || null;
    }
    if (lastName !== undefined) {
      updateFields.lastName = lastName || null;
    }
    if (bio !== undefined) {
      updateFields.bio = bio || null;
    }
    if (profileImage !== undefined) {
      updateFields.profileImage = profileImage || null;
    }
    if (images !== undefined) {
      updateFields.images = images && images.length > 0 ? images : null;
    }
    if (city !== undefined) {
      updateFields.city = city || null;
    }
    if (state !== undefined) {
      updateFields.state = state || null;
    }
    if (address !== undefined) {
      updateFields.address = address || null;
    }
    if (phone !== undefined) {
      updateFields.phone = phone || null;
    }
    if (emailAddress !== undefined) {
      updateFields.emailAddress = emailAddress || null;
    }

    if (Object.keys(updateFields).length === 0) {
      response.status(400).json({ error: 'No fields to update' });
      return;
    }

    // Build SET clause manually
    const setClauses: string[] = [];
    const params: { [key: string]: unknown } = { userId };

    Object.entries(updateFields).forEach(([key, value], index) => {
      const paramName = `val${index}`;
      // Avoid template string interpolation for pg-promise placeholder
      setClauses.push(`${key}=$` + `{${paramName}}`);
      params[paramName] = value;
    });

    const query =
      `
      UPDATE UserAccount 
      SET ${setClauses.join(', ')}
      WHERE id=$` +
      `{userId}
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
 * Delete user account by ID
 * @function deleteUser
 * @param {Request} request - Express request with params containing {id}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted user ID or 404 if not found
 * @throws Will pass database errors to error handler
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
/**
 * Retrieve all user accounts with public information
 * Returns user list with id, firstName, lastName, role, emailAddress, city, state, profileImage
 * @function readUsers
 * @param {Request} _request - Express request object (unused)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Array of UserAccount objects
 * @throws Will pass database errors to error handler
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
      u.firstName, u.lastName, u.emailAddress, u.phone, u.city, u.state, u.bio, u.address, u.profileImage,
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
              r.createdAt,
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

      console.log(
        '[readClippers] Response sample:',
        clippersWithImagesAndReviews[0],
      );
      response.send(clippersWithImagesAndReviews);
    })
    .catch((error: Error): void => {
      next(error);
    });
}

/**
 * Retrieve single clipper by ID with portfolio images and reviews
 * Includes calculated rating from reviews
 * @function readClipper
 * @param {Request} request - Express request with params containing {id}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} ClipperWithDetails object or 404 if not found
 * @throws Will pass database errors to error handler
 */
function readClipper(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.oneOrNone(
    `SELECT 
      c.id, c.userid,
      u.firstName, u.lastName, u.emailAddress, u.city, u.state, u.address as address, u.bio, u.profileImage,
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
 * Create new clipper profile linked to existing user account
 * @function createClipper
 * @param {Request} request - Express request with body containing {userID}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} New clipper object with {id}
 * @throws Will pass database errors to error handler
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
 * Update clipper profile information via associated user account
 * Updates bio and profile image visible in clipper's public profile
 * @function updateClipper
 * @param {Request} request - Express request with params {id} and body with {bio, profileImage}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Updated user ID or 404 if clipper not found
 * @throws Will pass database errors to error handler
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
/**
 * Delete clipper profile
 * Does not delete associated user account
 * @function deleteClipper
 * @param {Request} request - Express request with params containing {id}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted clipper ID or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Retrieve clipper's portfolio containing shop information
 * @function readPortfolio
 * @param {Request} request - Express request with params containing {id}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Portfolio object or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Create portfolio for clipper with shop information and location
 * @function createPortfolio
 * @param {Request} request - Express request with params {id} and body with PortfolioInput fields
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} New portfolio object with {id}
 * @throws Will pass database errors to error handler
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
 * Update portfolio information including shop details and location coordinates
 * @function updatePortfolio
 * @param {Request} request - Express request with params {id} and body with PortfolioInput fields to update
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Updated portfolio ID or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Retrieve all portfolio pictures for a clipper
 * Ordered by most recent upload first
 * @function readPictures
 * @param {Request} request - Express request with params containing {id} (portfolio ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Array of Picture objects
 * @throws Will pass database errors to error handler
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
 * Add picture to clipper's portfolio
 * Image stored as base64 string
 * @function addPicture
 * @param {Request} request - Express request with params {id} (portfolio ID) and body {image}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} New picture object with {id}
 * @throws Will pass database errors to error handler
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
 * Delete picture from portfolio
 * @function deletePicture
 * @param {Request} request - Express request with params containing {id} (picture ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted picture ID or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Retrieve all services offered by a clipper
 * @function readServices
 * @param {Request} request - Express request with params containing {id} (clipper ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Array of Service objects
 * @throws Will pass database errors to error handler
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
 * Creates new service offering with price and duration
 * @function addService
 * @param {Request} request - Express request with params {id} (clipper ID) and body with ServiceInput fields
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} New service object with {id}
 * @throws Will pass database errors to error handler
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
 * Update service offering information
 * Updates service name, price, and duration
 * @function updateService
 * @param {Request} request - Express request with params {id} and body with service fields to update
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Updated service ID or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Delete service offering
 * @function deleteService
 * @param {Request} request - Express request with params containing {id}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted service ID or 404 if not found
 * @throws Will pass database errors to error handler
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
 * Retrieve all reviews for a clipper with reviewer information
 * Includes rating, comment, reviewer name, and reviewer city
 * @function readReviews
 * @param {Request} request - Express request with params containing {id} (clipper ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Array of ReviewWithDetails objects
 * @throws Will pass database errors to error handler
 */
function readReviews(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  db.manyOrNone(
    `SELECT 
      r.id, 
      r.rating, 
      r.comment as "reviewContent",
      r.clientid as "clientID", 
      r.createdat,
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
 * Accepts either clientID or userID, calculates average rating after submission
 * @function addReview
 * @param {Request} request - Express request with body containing ReviewInput fields (clientID or userID, clipperID, rating, comment)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} New review with {id, averageRating}
 * @throws Will pass database errors to error handler
 */
function addReview(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { clientID, userID, clipperID, rating, comment } = request.body;

  // If userID is provided instead of clientID, look up the clientID
  const lookupClientID = async (): Promise<number> => {
    if (clientID !== undefined && clientID !== null) {
      return clientID;
    }
    if (userID !== undefined && userID !== null) {
      const clientData: { id: number } | null = await db.oneOrNone(
        'SELECT id FROM client WHERE userid=$1',
        [userID],
      );
      if (!clientData) {
        throw new Error(`No client found for userID ${userID}`);
      }
      return clientData.id;
    }
    throw new Error('Either clientID or userID must be provided');
  };

  // First, ensure the sequence is set correctly
  db.oneOrNone(
    'SELECT setval(pg_get_serial_sequence(\'review\', \'id\'), (SELECT COALESCE(MAX(id), 0) FROM review) + 1)',
  )
    .then(async (): Promise<{ id: number }> => {
      const finalClientID = await lookupClientID();
      // Now insert the review
      return db.one(
        'INSERT INTO review(clientid, clipperid, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id',
        [finalClientID, clipperID, rating, comment],
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
 * Delete review
 * Removes review and recalculates clipper's average rating
 * @function deleteReview
 * @param {Request} request - Express request with params containing {id} (review ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted review ID or 404 if not found
 * @throws Will pass database errors to error handler
 */
function deleteReview(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { id } = request.params;

  // First, get the clipperID before deleting
  db.oneOrNone('SELECT clipperid FROM review WHERE id=$1', [parseInt(id)])
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
 * Retrieve all favorite clippers for a client
 * Returns clippers with basic info, shop name, and average rating
 * @function readFavorites
 * @param {Request} request - Express request with params containing {id} (client ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Array of ClipperWithDetails objects sorted by favorited date
 * @throws Will pass database errors to error handler
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
 * Add clipper to client's favorites
 * @function addFavorite
 * @param {Request} request - Express request with params containing {clientId, clipperId}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Favorite relationship with {clientID, clipperID}
 * @throws Will pass database errors to error handler
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
 * Remove clipper from client's favorites
 * @function removeFavorite
 * @param {Request} request - Express request with params containing {clientId, clipperId}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted favorite relationship with {clientID, clipperID}
 * @throws Will pass database errors to error handler
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

/**
 * Retrieve all hair specialties for a clipper
 * @function readSpecialties
 * @param {Request} request - Express request with params containing {id} (clipper ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Array of Specialty objects
 * @throws Will pass database errors to error handler
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

/**
 * Add hair specialty for a clipper
 * Indicates specific hair types the clipper specializes in
 * @function addSpecialty
 * @param {Request} request - Express request with params {id} (clipper ID) and body {hairType}
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} New specialty object with {id}
 * @throws Will pass database errors to error handler
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

/**
 * Delete hair specialty
 * @function deleteSpecialty
 * @param {Request} request - Express request with params containing {id} (specialty ID)
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {void} Deleted specialty ID or 404 if not found
 * @throws Will pass database errors to error handler
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
