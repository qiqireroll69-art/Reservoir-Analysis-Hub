import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, chapterProgressTable } from "@workspace/db";
import {
  GetChapterProgressParams,
  UpdateChapterProgressParams,
  UpdateChapterProgressBody,
  GetChapterProgressResponse,
  GetAllProgressResponse,
  GetProgressSummaryResponse,
  UpdateChapterProgressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const TOTAL_CHAPTERS = 7;

function formatProgress(row: typeof chapterProgressTable.$inferSelect) {
  return {
    id: row.id,
    chapterId: row.chapterId,
    completed: row.completed,
    sectionsCompleted: row.sectionsCompleted ?? [],
    lastVisited: row.lastVisited ? row.lastVisited.toISOString() : null,
    quizBestScore: row.quizBestScore ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureChapterProgress(chapterId: number) {
  const existing = await db
    .select()
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.chapterId, chapterId));
  if (existing.length === 0) {
    const [created] = await db
      .insert(chapterProgressTable)
      .values({ chapterId, completed: false, sectionsCompleted: [] })
      .returning();
    return created;
  }
  return existing[0];
}

router.get("/progress", async (_req, res): Promise<void> => {
  const rows = await db.select().from(chapterProgressTable);
  const allProgress = rows.map(formatProgress);
  res.json(GetAllProgressResponse.parse(allProgress));
});

router.get("/progress/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(chapterProgressTable);
  const chaptersProgress = rows.map(formatProgress);
  const completedChapters = chaptersProgress.filter((p) => p.completed).length;
  const percentComplete = Math.round((completedChapters / TOTAL_CHAPTERS) * 100);
  const summary = {
    totalChapters: TOTAL_CHAPTERS,
    completedChapters,
    percentComplete,
    chaptersProgress,
  };
  res.json(GetProgressSummaryResponse.parse(summary));
});

router.get("/progress/:chapterId", async (req, res): Promise<void> => {
  const params = GetChapterProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await ensureChapterProgress(params.data.chapterId);
  res.json(GetChapterProgressResponse.parse(formatProgress(row)));
});

router.patch("/progress/:chapterId", async (req, res): Promise<void> => {
  const params = UpdateChapterProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateChapterProgressBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  await ensureChapterProgress(params.data.chapterId);

  const updates: Partial<typeof chapterProgressTable.$inferInsert> = {};
  if (body.data.completed !== undefined) updates.completed = body.data.completed;
  if (body.data.sectionsCompleted !== undefined) updates.sectionsCompleted = body.data.sectionsCompleted;
  if (body.data.lastVisited !== undefined) updates.lastVisited = new Date(body.data.lastVisited);

  const [updated] = await db
    .update(chapterProgressTable)
    .set(updates)
    .where(eq(chapterProgressTable.chapterId, params.data.chapterId))
    .returning();

  res.json(UpdateChapterProgressResponse.parse(formatProgress(updated)));
});

export default router;
