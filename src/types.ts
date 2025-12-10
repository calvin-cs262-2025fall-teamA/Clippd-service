/**
 * Type definitions for the Clippd database entities.
 * Fields match the `Clippd.sql` schema (camelCase names used in code).
 */

export interface UserAccount {
  id: number;
  firstName: string;
  lastName: string;
  loginID: string;
  passWord: string;
  role: "Client" | "Clipper";
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

export interface UserAccountInput {
  firstName: string;
  lastName: string;
  loginID: string;
  password: string; // mapped to passWord in DB
  role: "Client" | "Clipper";
  nickname?: string;
  address?: string;
  city: string;
  state: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  loginID: string;
  passWord: string;
  role?: "Client" | "Clipper";
  city?: string;
  state?: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string | null;
}

export interface Language {
  userID: number;
  language: string;
}

export interface Client {
  id: number;
  userID: number;
}

export interface Clipper {
  id: number;
  userID: number;
}

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

export interface FavoriteClipper {
  clientID: number;
  clipperID: number;
  favoritedAt: Date;
}

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

export interface Picture {
  id: number;
  portfolioID: number;
  image: string;
  addedAt: Date;
}

export interface Service {
  id: number;
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

export interface ServiceInput {
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

export interface Specialty {
  id: number;
  clipperID: number;
  hairType: string;
}

export interface Review {
  id: number;
  clientID: number;
  clipperID: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewInput {
  clientID: number;
  clipperID: number;
  rating: number;
  comment?: string;
}

export interface ReviewWithDetails extends Review {
  reviewerName?: string;
  reviewerCity?: string;
}
