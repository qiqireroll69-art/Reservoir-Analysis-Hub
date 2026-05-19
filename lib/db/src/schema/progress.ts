import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chapterProgressTable = pgTable("chapter_progress", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().unique(),
  completed: boolean("completed").notNull().default(false),
  sectionsCompleted: text("sections_completed").array().notNull().default([]),
  lastVisited: timestamp("last_visited", { withTimezone: true }),
  quizBestScore: integer("quiz_best_score"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChapterProgressSchema = createInsertSchema(chapterProgressTable).omit({ id: true, updatedAt: true });
export type InsertChapterProgress = z.infer<typeof insertChapterProgressSchema>;
export type ChapterProgress = typeof chapterProgressTable.$inferSelect;
