import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated, authStorage } from "./replit_integrations/auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // Update user plan endpoint
  app.post("/api/user/plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      if (!["free", "premium"].includes(plan)) {
        return res.status(400).json({ message: "Plano inválido" });
      }

      await db.update(users)
        .set({ plan, planSelectedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Erro ao atualizar plano" });
    }
  });
  // History routes
  app.get(api.history.list.path, async (req, res) => {
    const items = await storage.getHistory();
    res.json(items);
  });

  app.post(api.history.create.path, async (req, res) => {
    try {
      const input = api.history.create.input.parse(req.body);
      const item = await storage.createHistory(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.history.clear.path, async (req, res) => {
    await storage.clearHistory();
    res.status(204).send();
  });

  // Seed data
  const existingHistory = await storage.getHistory();
  if (existingHistory.length === 0) {
    await storage.createHistory({
      expression: "2 + 3 * 4",
      result: "14",
      explanation: [
        "Found multiplication 3 * 4. Result is 12.",
        "Found addition 2 + 12. Result is 14.",
        "Final Answer: 14"
      ]
    });
    await storage.createHistory({
      expression: "sqrt(9)",
      result: "3",
      explanation: [
        "The square root of 9 is 3.",
        "Final Answer: 3"
      ]
    });
  }

  return httpServer;
}
