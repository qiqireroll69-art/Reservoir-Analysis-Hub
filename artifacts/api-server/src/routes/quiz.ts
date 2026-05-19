import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, quizQuestionsTable, quizResultsTable, chapterProgressTable } from "@workspace/db";
import {
  GetChapterQuizParams,
  SubmitQuizParams,
  SubmitQuizBody,
  GetChapterQuizResponse,
  SubmitQuizResponse,
  GetQuizHistoryParams,
  GetQuizHistoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatQuestion(row: typeof quizQuestionsTable.$inferSelect) {
  return {
    id: row.id,
    chapterId: row.chapterId,
    type: row.type as "multiple_choice" | "short_answer",
    question: row.question,
    options: row.options ?? null,
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    order: row.order,
  };
}

function formatResult(row: typeof quizResultsTable.$inferSelect) {
  const feedback = JSON.parse(row.feedback) as {
    questionId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  return {
    id: row.id,
    chapterId: row.chapterId,
    score: row.score,
    total: row.total,
    percentage: row.percentage,
    feedback,
    submittedAt: row.submittedAt.toISOString(),
  };
}

router.get("/quiz/:chapterId", async (req, res): Promise<void> => {
  const params = GetChapterQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.chapterId, params.data.chapterId))
    .orderBy(quizQuestionsTable.order);

  if (questions.length === 0) {
    res.status(404).json({ error: "No quiz found for this chapter" });
    return;
  }

  res.json(GetChapterQuizResponse.parse(questions.map(formatQuestion)));
});

router.post("/quiz/:chapterId/submit", async (req, res): Promise<void> => {
  const params = SubmitQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SubmitQuizBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.chapterId, params.data.chapterId));

  if (questions.length === 0) {
    res.status(404).json({ error: "No quiz found for this chapter" });
    return;
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  let score = 0;
  const feedback = body.data.answers.map((answer) => {
    const q = questionMap.get(answer.questionId);
    if (!q) {
      return {
        questionId: answer.questionId,
        question: "Unknown",
        userAnswer: answer.answer,
        correctAnswer: "",
        isCorrect: false,
        explanation: "",
      };
    }
    const isCorrect =
      answer.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) score++;
    return {
      questionId: q.id,
      question: q.question,
      userAnswer: answer.answer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  const [result] = await db
    .insert(quizResultsTable)
    .values({
      chapterId: params.data.chapterId,
      score,
      total,
      percentage,
      feedback: JSON.stringify(feedback),
    })
    .returning();

  // Update best quiz score in progress
  const existingProgress = await db
    .select()
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.chapterId, params.data.chapterId));

  if (existingProgress.length > 0) {
    const current = existingProgress[0].quizBestScore ?? 0;
    if (percentage > current) {
      await db
        .update(chapterProgressTable)
        .set({ quizBestScore: percentage })
        .where(eq(chapterProgressTable.chapterId, params.data.chapterId));
    }
  } else {
    await db
      .insert(chapterProgressTable)
      .values({
        chapterId: params.data.chapterId,
        completed: false,
        sectionsCompleted: [],
        quizBestScore: percentage,
      });
  }

  res.json(SubmitQuizResponse.parse(formatResult(result)));
});

router.get("/quiz/:chapterId/history", async (req, res): Promise<void> => {
  const params = GetQuizHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const results = await db
    .select()
    .from(quizResultsTable)
    .where(eq(quizResultsTable.chapterId, params.data.chapterId))
    .orderBy(desc(quizResultsTable.submittedAt));

  res.json(GetQuizHistoryResponse.parse(results.map(formatResult)));
});

export default router;
