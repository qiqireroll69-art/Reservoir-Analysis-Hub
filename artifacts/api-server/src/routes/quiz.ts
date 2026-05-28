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

const CHAPTER_TITLES_FULL: Record<number, string> = {
  1: "Kabanata 1 — Panimula sa Reservoir Petrophysics",
  2: "Kabanata 2 — Mga Pangunahing Kaalaman sa Reservoir Petrophysics",
  3: "Kabanata 3 — Fluid Saturation, Wettability at Capillary Pressure",
  4: "Kabanata 4 — Interpretasyon ng Well Logs",
  5: "Kabanata 5 — Mga PVT Properties at Phase Behavior ng Hydrocarbon",
  6: "Kabanata 6 — Integrasyon ng Petrophysics at Phase Behavior",
  7: "Kabanata 7 — Aplikasyon sa Reservoir Engineering",
};

function inferSuggestedTopic(question: string, chapterId: number): string {
  const q = question.toLowerCase();
  if (q.includes("porosity") || q.includes("porosity")) return "Porosity (φ) at Pore Volume";
  if (q.includes("permeability") || q.includes("darcy")) return "Permeability at Darcy's Law";
  if (q.includes("wettab")) return "Wettability at Contact Angle";
  if (q.includes("capillary") || q.includes("capillar")) return "Capillary Pressure at Young-Laplace Equation";
  if (q.includes("saturation") || q.includes("saturasyon")) return "Fluid Saturation at Archie's Equation";
  if (q.includes("gamma ray") || q.includes("gr log")) return "Gamma Ray Log at Shale Indicator";
  if (q.includes("archie") || q.includes("resistivity")) return "Archie's Equations at Resistivity Log";
  if (q.includes("density log") || q.includes("neutron")) return "Density at Neutron Porosity Logs";
  if (q.includes("well log") || q.includes("log interpretation")) return "Well Log Integration at Payzone Identification";
  if (q.includes("bubble point") || q.includes("bubble")) return "Bubble Point Pressure at Oil Reservoir Depletion";
  if (q.includes("dew point") || q.includes("dew")) return "Dew Point Pressure at Gas Condensate";
  if (q.includes("pvt") || q.includes("z-factor") || q.includes("z factor")) return "PVT Properties at Gas Compressibility Factor";
  if (q.includes("bo ") || q.includes("formation volume factor") || q.includes("fvf")) return "Oil Formation Volume Factor (Bo)";
  if (q.includes("gas condensate") || q.includes("condensate") || q.includes("retrograde")) return "Gas Condensate at Retrograde Condensation";
  if (q.includes("wet gas")) return "Wet Gas (Rich Gas) at Natural Gas Liquids";
  if (q.includes("dry gas")) return "Dry Gas (Lean Gas) at Methane";
  if (q.includes("black oil")) return "Black Oil — Mga Katangian at PVT Properties";
  if (q.includes("volatile")) return "Volatile Oil — Critical Region at Phase Behavior";
  if (q.includes("phase") || q.includes("phase diagram") || q.includes("envelope")) return "Phase Diagram at Reservoir Fluid Classification";
  if (q.includes("material balance") || q.includes("mbe")) return "Material Balance Equation";
  if (q.includes("stoiip") || q.includes("ooip") || q.includes("reserves") || q.includes("in place")) return "Volumetric Reserves Estimation (STOIIP/GIIP)";
  if (q.includes("recovery factor") || q.includes("recovery")) return "Recovery Factor at Drive Mechanisms";
  if (q.includes("clay") || q.includes("shale")) return "Epekto ng Clay sa Reservoir Quality";
  if (q.includes("relative permeability") || q.includes("kr")) return "Relative Permeability at Multiphase Flow";
  if (q.includes("net pay") || q.includes("cutoff")) return "Net Pay Determination at Cutoff Values";
  if (q.includes("nmr") || q.includes("nuclear magnetic")) return "NMR Log at Pore Size Distribution";
  if (q.includes("sonic") || q.includes("acoustic")) return "Sonic Log at Acoustic Velocity";
  if (q.includes("compressibility") || q.includes("rock compress")) return "Rock Compressibility";
  if (q.includes("decline curve") || q.includes("arps")) return "Decline Curve Analysis";
  const defaults: Record<number, string> = {
    1: "Panimula sa Reservoir Petrophysics at Phase Behavior",
    2: "Mga Pangunahing Katangian ng Bato: Porosity at Permeability",
    3: "Fluid Saturation, Wettability, at Capillary Pressure",
    4: "Well Log Interpretation at Archie's Equations",
    5: "PVT Properties at Hydrocarbon Phase Behavior",
    6: "Integrasyon ng Petrophysics at Phase Behavior",
    7: "Aplikasyon sa Reservoir Engineering",
  };
  return defaults[chapterId] ?? "Suriin ang kabanatang ito";
}

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
    whyWrong?: string;
    chapterReference?: string;
    suggestedTopic?: string;
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

    const baseFeedback = {
      questionId: q.id,
      question: q.question,
      userAnswer: answer.answer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };

    if (!isCorrect) {
      const suggestedTopic = inferSuggestedTopic(q.question, q.chapterId);
      const chapterReference = CHAPTER_TITLES_FULL[q.chapterId] ?? `Kabanata ${q.chapterId}`;
      const whyWrong = `Ang iyong sagot na "${answer.answer}" ay hindi tumpak para sa konseptong ito. ${q.explanation} Ang tamang sagot ay: "${q.correctAnswer}".`;
      return {
        ...baseFeedback,
        whyWrong,
        chapterReference,
        suggestedTopic,
      };
    }

    return baseFeedback;
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
