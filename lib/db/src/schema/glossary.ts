import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const glossaryTermsTable = pgTable("glossary_terms", {
  id: serial("id").primaryKey(),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  chapterId: integer("chapter_id"),
  category: text("category"),
});

export const insertGlossaryTermSchema = createInsertSchema(glossaryTermsTable).omit({ id: true });
export type InsertGlossaryTerm = z.infer<typeof insertGlossaryTermSchema>;
export type GlossaryTerm = typeof glossaryTermsTable.$inferSelect;
