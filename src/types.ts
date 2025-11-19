/**
 * Type definitions for the Clippd database entities.
 */

export interface UserAccount {
  id: number;
  firstname: string;
  lastname: string;
  loginid: string;
  password: string;
  role: "Client" | "Clipper";
  nickname?: string;
  address?: string;
  city: string;
  state: string;
  emailaddress: string;
  phone?: string;
  bio?: string;
  profileimage?: string;
  createdat: Date;
}

export interface UserAccountInput {
  firstName: string;
  lastName: string;
  loginID: string;
  password: string;
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

export interface Language {
  userid: number;
  language: string;
}

export interface Client {
  id: number;
  userid: number;
}

export interface Clipper {
  id: number;
  userid: number;
}

export interface ClipperWithDetails extends Clipper {
  firstname?: string;
  lastname?: string;
  emailaddress?: string;
  city?: string;
  state?: string;
  bio?: string;
  profileimage?: string;
  shopname?: string;
  shopaddress?: string;
  description?: string;
  rating?: number;
}

export interface FavoriteClipper {
  clientid: number;
  clipperid: number;
  favoritedat: Date;
}

export interface Portfolio {
  id: number;
  clipperid: number;
  shopname: string;
  shopaddress?: string;
  city: string;
  state: string;
  description?: string;
}

export interface PortfolioInput {
  clipperID: number;
  shopName: string;
  shopAddress?: string;
  city: string;
  state: string;
  description?: string;
}

export interface Picture {
  id: number;
  portfolioid: number;
  image: string;
  addedat: Date;
}

export interface Service {
  id: number;
  clipperid: number;
  servicename: string;
  price: number;
}

export interface ServiceInput {
  clipperID: number;
  serviceName: string;
  price: number;
}

export interface Specialty {
  id: number;
  clipperid: number;
  hairtype: string;
}

export interface Review {
  id: number;
  clientid: number;
  clipperid: number;
  rating: number;
  comment?: string;
  createdat: Date;
}

export interface ReviewInput {
  clientID: number;
  clipperID: number;
  rating: number;
  comment?: string;
}

export interface ReviewWithDetails extends Review {
  reviewername?: string;
  reviewercity?: string;
}
