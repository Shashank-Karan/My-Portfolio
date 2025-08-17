import { z } from "zod";

// Contact Schema
export const insertContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required"),
});

export type InsertContact = z.infer<typeof insertContactSchema>;

export interface Contact {
  _id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

// User Schema
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface User {
  _id?: string;
  username: string;
  password: string;
}

// Portfolio Content Schema
export const insertPortfolioContentSchema = z.object({
  heroTitle: z.string().min(1, "Hero title is required"),
  heroSubtitle: z.string().min(1, "Hero subtitle is required"),
  heroDescription: z.string().min(1, "Hero description is required"),
  aboutText: z.string().min(1, "About text is required"),
  skillsList: z.string().min(1, "Skills list is required"),
  projectsList: z.string().min(1, "Projects list is required"),
  profileImage: z.string().optional(),
});

export type InsertPortfolioContent = z.infer<typeof insertPortfolioContentSchema>;

export interface PortfolioContent {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutText: string;
  skillsList: string; // JSON string of skills array
  projectsList: string; // JSON string of projects array
  profileImage?: string; // URL or base64 encoded image
  updatedAt: Date;
}
