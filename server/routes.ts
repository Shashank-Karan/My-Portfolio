import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertPortfolioContentSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Admin password (in production, this should be in environment variables)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '058933';

  // Middleware to check admin authentication
  const requireAdmin = (req: any, res: any, next: any) => {
    if ((req.session as any)?.isAdmin) {
      next();
    } else {
      res.status(401).json({ success: false, message: "Admin authentication required" });
    }
  };

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (password === ADMIN_PASSWORD) {
        (req.session as any).isAdmin = true;
        res.json({ success: true, message: "Admin logged in successfully" });
      } else {
        res.status(401).json({ success: false, message: "Invalid admin password" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    (req.session as any).isAdmin = false;
    res.json({ success: true, message: "Admin logged out successfully" });
  });

  // Check admin status
  app.get("/api/admin/status", (req, res) => {
    res.json({ isAdmin: !!(req.session as any)?.isAdmin });
  });

  // Get portfolio content
  app.get("/api/portfolio-content", async (req, res) => {
    try {
      const content = await storage.getPortfolioContent();
      
      if (!content) {
        // Return default content if none exists
        const defaultContent = {
          heroTitle: "Shashank Karan",
          heroSubtitle: "Full Stack Developer",
          heroDescription: "I create exceptional digital experiences through clean code and thoughtful design. Passionate about building scalable web applications that solve real-world problems.",
          aboutText: "I work with modern technologies to build robust and scalable applications",
          skillsList: JSON.stringify(["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "Git", "AWS"]),
          projectsList: JSON.stringify([
            {
              title: "E-Commerce Platform",
              description: "A full-stack e-commerce solution built with React and Node.js, featuring user authentication, payment integration, and admin dashboard.",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
              technologies: ["React", "Node.js", "MongoDB"],
              githubUrl: "#",
              demoUrl: "#"
            }
          ]),
          profileImage: ""
        };
        res.json(defaultContent);
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error("Error fetching portfolio content:", error);
      res.status(500).json({ success: false, message: "Failed to fetch content" });
    }
  });

  // Update portfolio content (admin only)
  app.post("/api/admin/portfolio-content", requireAdmin, async (req, res) => {
    try {
      const contentData = insertPortfolioContentSchema.parse(req.body);
      const content = await storage.updatePortfolioContent(contentData);
      res.json({ success: true, message: "Portfolio content updated successfully", content });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid content data", errors: error.errors });
      } else {
        console.error("Portfolio content update error:", error);
        res.status(500).json({ success: false, message: "Failed to update content" });
      }
    }
  });

  // Get all contact messages (admin only)
  app.get("/api/contacts", requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ success: false, message: "Failed to fetch contacts" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json({ success: true, message: "Message sent successfully!", contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid form data", errors: error.errors });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
