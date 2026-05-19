import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, glossaryTermsTable } from "@workspace/db";
import {
  GetGlossaryTermsQueryParams,
  GetGlossaryTermsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/glossary", async (req, res): Promise<void> => {
  const query = GetGlossaryTermsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows;
  if (query.data.chapterId != null) {
    rows = await db
      .select()
      .from(glossaryTermsTable)
      .where(eq(glossaryTermsTable.chapterId, query.data.chapterId))
      .orderBy(glossaryTermsTable.term);
  } else {
    rows = await db
      .select()
      .from(glossaryTermsTable)
      .orderBy(glossaryTermsTable.term);
  }

  const formatted = rows.map((r) => ({
    id: r.id,
    term: r.term,
    definition: r.definition,
    chapterId: r.chapterId ?? null,
    category: r.category ?? null,
  }));

  res.json(GetGlossaryTermsResponse.parse(formatted));
});

export default router;
