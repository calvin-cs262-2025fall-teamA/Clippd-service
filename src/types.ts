/**
 * @fileoverview Type definitions for Clippd backend service
 * @description Defines all database entity interfaces and input types
 * Fields match the `Clippd.sql` schema with camelCase naming convention
 * @version 1.0.0
 */

/**
 * User account information in the system
 * @typedef {Object} UserAccount
 * @property {number} id - Unique user ID
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} loginID - Login ID/username
 * @property {string} passWord - Password hash
 * @property {"Client"|"Clipper"} role - User role type
 * @property {string} [nickname] - User nickname
 * @property {string} [address] - Street address
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} emailAddress - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [bio] - User biography
 * @property {string} [profileImage] - Profile image URL
 * @property {number|null} [latitude] - Latitude coordinate
 * @property {number|null} [longitude] - Longitude coordinate
 * @property {Date} createdAt - Account creation timestamp
 */
export interface UserAccount {
  id: number;
  firstName: string;
  lastName: string;
  loginID: string;
  passWord: string;
  role: 'Client' | 'Clipper';
  nickname?: string;
  address?: string;
  city: string;
  state: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
}

/**
 * User account input for creation/updates
 * @typedef {Object} UserAccountInput
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} loginID - Login ID/username
 * @property {string} password - Password (mapped to passWord in DB)
 * @property {"Client"|"Clipper"} role - User role type
 * @property {string} [nickname] - User nickname
 * @property {string} [address] - Street address
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} emailAddress - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [bio] - User biography
 * @property {string} [profileImage] - Profile image URL
 */
export interface UserAccountInput {
  firstName: string;
  lastName: string;
  loginID: string;
  password: string; // mapped to passWord in DB
  role: 'Client' | 'Clipper';
  nickname?: string;
  address?: string;
  city: string;
  state: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}

/**
 * Signup input data
 * @typedef {Object} SignupInput
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} loginID - Login ID/username
 * @property {string} passWord - Password
 * @property {"Client"|"Clipper"} [role] - User role type
 * @property {string} [city] - City
 * @property {string} [state] - State
 * @property {string} emailAddress - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [bio] - User biography
 * @property {string|null} [profileImage] - Profile image URL
 */
export interface SignupInput {
  firstName: string;
  lastName: string;
  loginID: string;
  passWord: string;
  role?: 'Client' | 'Clipper';
  city?: string;
  state?: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string | null;
}

/**
 * Language spoken by a user
 * @typedef {Object} Language
 * @property {number} userID - User ID
 * @property {string} language - Language name
 */
export interface Language {
  userID: number;
  language: string;
}

/**
 * Client user information
 * @typedef {Object} Client
 * @property {number} id - Client ID
 * @property {number} userID - Associated user account ID
 */
export interface Client {
  id: number;
  userID: number;
}

/**
 * Clipper user information
 * @typedef {Object} Clipper
 * @property {number} id - Clipper ID
 * @property {number} userID - Associated user account ID
 */
export interface Clipper {
  id: number;
  userID: number;
}

/**
 * Clipper information with additional user details
 * @typedef {Object} ClipperWithDetails
 * @property {number} id - Clipper ID
 * @property {number} userID - Associated user account ID
 * @property {string} [firstName] - First name
 * @property {string} [lastName] - Last name
 * @property {string} [emailAddress] - Email address
 * @property {string} [city] - City
 * @property {string} [state] - State
 * @property {string} [bio] - Biography
 * @property {string} [profileImage] - Profile image URL
 * @property {string} [shopName] - Shop name
 * @property {string} [shopAddress] - Shop address
 * @property {string} [description] - Shop description
 * @property {number} [rating] - Average rating
 */
export interface ClipperWithDetails extends Clipper {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  city?: string;
  state?: string;
  bio?: string;
  profileImage?: string;
  shopName?: string;
  shopAddress?: string;
  description?: string;
  rating?: number;
}

/**
 * Favorite clipper relationship
 * @typedef {Object} FavoriteClipper
 * @property {number} clientID - Client ID
 * @property {number} clipperID - Clipper ID
 * @property {Date} favoritedAt - When the favorite was added
 */
export interface FavoriteClipper {
  clientID: number;
  clipperID: number;
  favoritedAt: Date;
}

/**
 * Clipper's portfolio/shop information
 * @typedef {Object} Portfolio
 * @property {number} id - Portfolio ID
 * @property {number} clipperID - Clipper ID
 * @property {string} shopName - Shop name
 * @property {string} [shopAddress] - Shop address
 * @property {string} city - City
 * @property {string} state - State
 * @property {number|null} [latitude] - Latitude coordinate
 * @property {number|null} [longitude] - Longitude coordinate
 * @property {string} [description] - Shop description
 */
export interface Portfolio {
  id: number;
  clipperID: number;
  shopName: string;
  shopAddress?: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
}

/**
 * Portfolio input for creation/updates
 * @typedef {Object} PortfolioInput
 * @property {number} clipperID - Clipper ID
 * @property {string} shopName - Shop name
 * @property {string} [shopAddress] - Shop address
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} [description] - Shop description
 * @property {number|null} [latitude] - Latitude coordinate
 * @property {number|null} [longitude] - Longitude coordinate
 */
export interface PortfolioInput {
  clipperID: number;
  shopName: string;
  shopAddress?: string;
  city: string;
  state: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Portfolio picture/image
 * @typedef {Object} Picture
 * @property {number} id - Picture ID
 * @property {number} portfolioID - Portfolio ID
 * @property {string} image - Image URL or data
 * @property {Date} addedAt - When the picture was added
 */
export interface Picture {
  id: number;
  portfolioID: number;
  image: string;
  addedAt: Date;
}

/**
 * Service offered by a clipper
 * @typedef {Object} Service
 * @property {number} id - Service ID
 * @property {number} clipperID - Clipper ID
 * @property {string} serviceName - Service name
 * @property {number} [price] - Service price
 * @property {number|null} [durationMinutes] - Service duration in minutes
 */
export interface Service {
  id: number;
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

/**
 * Service input for creation/updates
 * @typedef {Object} ServiceInput
 * @property {number} clipperID - Clipper ID
 * @property {string} serviceName - Service name
 * @property {number} [price] - Service price
 * @property {number|null} [durationMinutes] - Service duration in minutes
 */
export interface ServiceInput {
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

/**
 * Clipper's specialty hair type
 * @typedef {Object} Specialty
 * @property {number} id - Specialty ID
 * @property {number} clipperID - Clipper ID
 * @property {string} hairType - Hair type specialty
 */
export interface Specialty {
  id: number;
  clipperID: number;
  hairType: string;
}

/**
 * Customer review of a clipper
 * @typedef {Object} Review
 * @property {number} id - Review ID
 * @property {number} clientID - Client ID
 * @property {number} clipperID - Clipper ID
 * @property {number} rating - Review rating
 * @property {string} [comment] - Review comment
 * @property {Date} createdAt - Review creation timestamp
 */
export interface Review {
  id: number;
  clientID: number;
  clipperID: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

/**
 * Review input for creation
 * @typedef {Object} ReviewInput
 * @property {number} clientID - Client ID
 * @property {number} clipperID - Clipper ID
 * @property {number} rating - Review rating
 * @property {string} [comment] - Review comment
 */
export interface ReviewInput {
  clientID: number;
  clipperID: number;
  rating: number;
  comment?: string;
}

/**
 * Review with additional reviewer details
 * @typedef {Object} ReviewWithDetails
 * @property {number} id - Review ID
 * @property {number} clientID - Client ID
 * @property {number} clipperID - Clipper ID
 * @property {number} rating - Review rating
 * @property {string} [comment] - Review comment
 * @property {Date} createdAt - Review creation timestamp
 * @property {string} [reviewerName] - Reviewer's name
 * @property {string} [reviewerCity] - Reviewer's city
 */
export interface ReviewWithDetails extends Review {
  reviewerName?: string;
  reviewerCity?: string;
}
