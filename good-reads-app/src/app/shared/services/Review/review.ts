import * as mongodb from 'mongodb';
import { User } from '../User/User';

export interface Review {
  _id?: mongodb.ObjectId; 
  Title: string;
  User: User | null;
  content: string;
  Rating: Number;
  UserImage: string | null;
  UserId: mongodb.ObjectId | null;
}
