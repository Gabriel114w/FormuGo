import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  expression: text("expression").notNull(),
  result: text("result").notNull(),
  explanation: jsonb("explanation").$type<string[]>(), // Array of explanation steps
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertHistorySchema = createInsertSchema(history).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===
export type HistoryItem = typeof history.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;

// Request types
export type CreateHistoryRequest = InsertHistory;

// Response types
export type HistoryResponse = HistoryItem;
export type HistoryListResponse = HistoryItem[];

// Export auth models
export * from "./models/auth";
