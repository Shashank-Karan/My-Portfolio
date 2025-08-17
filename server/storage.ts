import { type User, type InsertUser, type Contact, type InsertContact, type PortfolioContent, type InsertPortfolioContent } from "@shared/schema";
import { ContactModel, UserModel, PortfolioContentModel, connectDB } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getPortfolioContent(): Promise<PortfolioContent | undefined>;
  updatePortfolioContent(content: InsertPortfolioContent): Promise<PortfolioContent>;
}

export class DatabaseStorage implements IStorage {
  private connectionPromise: Promise<void>;
  
  constructor() {
    // Ensure database connection when storage is instantiated
    this.connectionPromise = connectDB();
  }

  private async ensureConnection() {
    await this.connectionPromise;
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findById(id).lean();
      return user ? { ...user, _id: user._id.toString() } : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findOne({ username }).lean();
      return user ? { ...user, _id: user._id.toString() } : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      await this.ensureConnection();
      const user = new UserModel(insertUser);
      const savedUser = await user.save();
      return { ...savedUser.toObject(), _id: savedUser._id.toString() };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      await this.ensureConnection();
      const contact = new ContactModel({
        ...insertContact,
        createdAt: new Date(),
      });
      const savedContact = await contact.save();
      return { ...savedContact.toObject(), _id: savedContact._id.toString() };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      await this.ensureConnection();
      const contacts = await ContactModel.find().sort({ createdAt: -1 }).lean();
      return contacts.map(contact => ({ ...contact, _id: contact._id.toString() }));
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async getPortfolioContent(): Promise<PortfolioContent | undefined> {
    try {
      await this.ensureConnection();
      const content = await PortfolioContentModel.findOne().lean();
      return content ? { ...content, _id: content._id.toString() } : undefined;
    } catch (error) {
      console.error('Error getting portfolio content:', error);
      return undefined;
    }
  }

  async updatePortfolioContent(insertContent: InsertPortfolioContent): Promise<PortfolioContent> {
    try {
      await this.ensureConnection();
      
      // Check if content exists
      const existing = await PortfolioContentModel.findOne();
      
      if (existing) {
        // Update existing content
        const updatedContent = await PortfolioContentModel.findByIdAndUpdate(
          existing._id,
          { ...insertContent, updatedAt: new Date() },
          { new: true }
        ).lean();
        
        if (!updatedContent) {
          throw new Error('Failed to update portfolio content');
        }
        
        return { ...updatedContent, _id: updatedContent._id.toString() };
      } else {
        // Create new content
        const content = new PortfolioContentModel({
          ...insertContent,
          updatedAt: new Date(),
        });
        const savedContent = await content.save();
        return { ...savedContent.toObject(), _id: savedContent._id.toString() };
      }
    } catch (error) {
      console.error('Error updating portfolio content:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
