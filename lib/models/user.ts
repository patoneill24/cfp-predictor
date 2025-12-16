import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTP {
  _id?: ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
