import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookmarksTable } from "@workspace/db";
import {
  CreateBookmarkBody,
  DeleteBookmarkParams,
  GetBookmarksResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatBookmark(row: typeof bookmarksTable.$inferSelect) {
  return {
    id: row.id,
    chapterId: row.chapterId,
    sectionId: row.sectionId ?? null,
    title: row.title,
    note: row.note ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/bookmarks", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(bookmarksTable)
    .orderBy(bookmarksTable.createdAt);
  res.json(GetBookmarksResponse.parse(rows.map(formatBookmark)));
});

router.post("/bookmarks", async (req, res): Promise<void> => {
  const body = CreateBookmarkBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [bookmark] = await db
    .insert(bookmarksTable)
    .values({
      chapterId: body.data.chapterId,
      sectionId: body.data.sectionId ?? null,
      title: body.data.title,
      note: body.data.note ?? null,
    })
    .returning();

  res.status(201).json(formatBookmark(bookmark));
});

router.delete("/bookmarks/:id", async (req, res): Promise<void> => {
  const params = DeleteBookmarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(bookmarksTable)
    .where(eq(bookmarksTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Bookmark not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
