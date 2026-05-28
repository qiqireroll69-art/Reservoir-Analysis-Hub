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

function generateWhyWrong(
  userAnswer: string,
  correctAnswer: string,
  question: string,
  explanation: string
): string {
  const ua = userAnswer.toLowerCase().trim();
  const ca = correctAnswer.toLowerCase().trim();
  const q = question.toLowerCase();

  // ── Formula inversion (user flipped numerator/denominator) ──────────────
  const isFormulaQuestion = q.includes("formula") || q.includes("equation") || q.includes("law") || q.includes("kalkulahin");
  if (isFormulaQuestion) {
    // Detect if both answers contain a division but look like inverses
    const userHasDiv = userAnswer.includes("/") || userAnswer.includes("÷");
    const corrHasDiv = correctAnswer.includes("/") || correctAnswer.includes("÷");
    if (userHasDiv && corrHasDiv && ua !== ca) {
      return `Ang iyong sagot ay nagpapakita ng isang karaniwang pagkakamali: ang pagkakamali sa pagkakasunod-sunod ng numerator at denominator sa formula. Mahalagang tandaan kung aling quantity ang "hinati" sa isa pa. ${explanation}`;
    }
    return `Ang napili mong formula ay hindi tama para sa konseptong ito. Tandaan na ang bawat variable sa equation ay may tiyak na papel — hindi maaaring i-rearrange nang walang algebraic basis. ${explanation}`;
  }

  // ── Definition / concept confusion ─────────────────────────────────────
  if (q.includes("ano ang") || q.includes("kahulugan") || q.includes("ibig sabihin") || q.includes("what is")) {
    // Check if user picked something that sounds related but is different
    const relatedPairs: [string, string, string][] = [
      ["porosity", "permeability", "Ang porosity ay tungkol sa pore SPACE (dami ng butas sa bato), samantalang ang permeability ay tungkol sa flow CAPACITY (kakayahang mag-daloy ng fluid). Magkaugnay sila ngunit magkaibang konsepto."],
      ["permeability", "porosity", "Ang permeability ay nagpapakita kung GAANO KADALI dumadaloy ang fluids, hindi kung GAANO KALAKI ang pore space. Ang mataas na porosity ay hindi laging nangangahulugang mataas na permeability."],
      ["bubble point", "dew point", "Ang bubble point ay para sa LIQUID (oil) na nagsisimulang mag-release ng gas; ang dew point naman ay para sa GAS na nagsisimulang mag-condense ng liquid. Magkaparehong prinsipyo ngunit magkaibang reservoir fluid."],
      ["dew point", "bubble point", "Ang dew point ay para sa GAS CONDENSATE system; ang bubble point naman ay para sa OIL RESERVOIR system. Ang pagkalito sa dalawa ay isang karaniwang pagkakamali."],
      ["total porosity", "effective porosity", "Ang Total Porosity ay kasama ang LAHAT ng pores (kabilang ang isolated at clay-bound); ang Effective Porosity ay ang interconnected pores lamang na may kakayahang mag-flow. Para sa reservoir engineering, ang effective porosity ang ginagamit."],
      ["primary porosity", "secondary porosity", "Ang Primary Porosity ay nabuo KASABAY ng deposition ng bato (intergranular). Ang Secondary Porosity ay nabuo PAGKATAPOS ng deposition sa pamamagitan ng dissolution, fracturing, o dolomitization."],
      ["absolute permeability", "relative permeability", "Ang Absolute Permeability ay sinusukat sa single-fluid condition (100% saturated). Ang Relative Permeability ay ginagamit kapag may DALAWA O HIGIT pang fluids — ito ay dimensionless ratio."],
      ["water-wet", "oil-wet", "Sa water-wet rock, ang TUBIG ang kumakapit sa grain surfaces (wetting phase). Sa oil-wet rock, ang OIL ang kumakapit sa grains. Ang wettability ay malaking epekto sa fluid distribution at recovery."],
      ["bo ", "rs ", "Ang Bo (Formation Volume Factor) ay nagrerepresenta ng VOLUME CHANGE ng oil mula reservoir patungong surface. Ang Rs (Solution GOR) ay nagrerepresenta ng DAMI NG GAS na dissolved sa oil. Magkaibang units at layunin."],
      ["stoiip", "giip", "Ang STOIIP ay para sa OIL (gamit ang 7758 bbl/acre-ft at Bo). Ang GIIP ay para sa GAS (gamit ang 43,560 cu ft/acre-ft at Bg). Magkaibang conversion factors ang ginagamit."],
      ["recovery factor", "stoiip", "Ang STOIIP ay ang TOTAL na langis sa reservoir (hindi lahat nito ma-produce). Ang Recovery Factor ay ang FRACTION ng STOIIP na maaaring ma-produce. Ang reserves = RF × STOIIP."],
      ["productivity index", "flow rate", "Ang Productivity Index (PI) ay hindi lang ang flow rate — ito ay ang flow rate PER UNIT PRESSURE DRAWDOWN (q / ΔP). Mas accurately na nagpapakita ito ng kakayahan ng balon."],
    ];
    for (const [concept, confused, msg] of relatedPairs) {
      if (ua.includes(concept) && (ca.includes(confused) || q.includes(confused))) {
        return msg;
      }
      if (ua.includes(confused) && ca.includes(concept)) {
        return msg;
      }
    }
  }

  // ── Saturation / percentage calculations ─────────────────────────────
  if (q.includes("saturation") || q.includes("saturasyon") || q.includes("kung ano") && q.includes("cc")) {
    if (ua.includes("0.4") || ua.includes("40%") || ua.includes("0.167") || ua.includes("0.83")) {
      return `Mukhang may error sa iyong calculation. Para sa saturation, gamitin ang formula na Sf = Vf / Vp (fluid volume divided by PORE volume, hindi bulk volume). Siguraduhing ginamit mo ang tamang denominator. ${explanation}`;
    }
    return `Ang tamang formula ay Sw + So + Sg = 1.0 — ang kabuuan ng lahat ng saturations ay palaging 1. Kung dalawa ang alam mo, ang ikatlo ay 1 minus ang dalawa. ${explanation}`;
  }

  // ── Calculation errors (numerical answers) ───────────────────────────
  if (/^\d/.test(userAnswer.trim()) || userAnswer.trim().startsWith("0.")) {
    return `Ang iyong numerical na sagot ay hindi tama. Suriin ang iyong calculation — tiyaking ginamit mo ang tamang formula, tamang units, at tamang order ng operasyon. ${explanation}`;
  }

  // ── "None of the above" / "Walang pagkakaiba" traps ─────────────────
  if (ua.includes("walang pagkakaiba") || ua.includes("parehong") || ua.includes("walang epekto") || ua.includes("constant")) {
    return `Ang sagot na "walang pagkakaiba" o "constant" ay isang karaniwang trap sa reservoir petrophysics. Ang karamihan sa mga properties ay nagbabago depende sa pressure, saturation, at temperatura. ${explanation}`;
  }

  // ── Mobility / efficiency confusion ─────────────────────────────────
  if (q.includes("mobility") || q.includes("efficiency") || q.includes("recovery")) {
    if (ua.includes("mas mababa") || ua.includes("bumababa") || ua.includes("mas mataas") || ua.includes("tumataas")) {
      return `Ang direksyon ng trend (tumataas o bumababa) ay dapat na base sa pisikal na prinsipyo. Para sa mobility at recovery, mahalagang maunawaan ang relasyon ng permeability, viscosity, at saturation. ${explanation}`;
    }
  }

  // ── Drive mechanism confusion ────────────────────────────────────────
  if (q.includes("drive") || q.includes("mechanism") || q.includes("recovery factor")) {
    const driveMap: [string, string][] = [
      ["solution gas", "Ang Solution Gas Drive ay galing sa DISSOLVED gas na lumalabas sa oil — ito ay limitado at nagdudulot ng pagtaas ng GOR. Hindi ito ang pinaka-efficient na drive."],
      ["gas cap", "Ang Gas Cap Drive ay galing sa EXPANSION ng free gas cap sa itaas ng oil — mas matagal na pressure support kaysa solution gas drive ngunit hindi pa rin pinaka-efficient."],
      ["water drive", "Ang Water Drive ay galing sa aquifer pressure support — ito ang pinaka-efficient dahil ang tubig ay incompressible at nagbibigay ng stable na pressure."],
      ["rock", "Ang Rock/Fluid Expansion drive ay ang pinakamahina — nagbibigay lamang ng 1–5% recovery. Nangyayari ito sa highly undersaturated reservoirs."],
    ];
    for (const [drive, msg] of driveMap) {
      if (ua.includes(drive)) {
        return msg;
      }
    }
  }

  // ── GOR trend confusion ──────────────────────────────────────────────
  if (q.includes("gor") || q.includes("gas-oil ratio")) {
    return `Ang GOR trend sa solution gas drive ay sumusunod sa pressure behavior: constant sa itaas ng bubble point, pagkatapos ay patuloy na tumataas habang bumababa ang presyon at lumalabas ang gas. Hindi ito constant o bumababa. ${explanation}`;
  }

  // ── Wettability impact confusion ─────────────────────────────────────
  if (q.includes("wettab") || q.includes("oil-wet") || q.includes("water-wet")) {
    return `Ang wettability ay nakakaapekto sa kung SAAN nagtatayo ang bawat fluid sa loob ng pores. Ang fluid na "wets" ang rock (wetting phase) ay kumakapit sa grain surfaces at pumupuno ng pinakamaliit na pores. Ito ay malaking epekto sa relative permeability at recovery. ${explanation}`;
  }

  // ── Default educational message ──────────────────────────────────────
  return `Ang iyong sagot na "${userAnswer}" ay nagpapakita ng isang karaniwang misconception sa konseptong ito. ${explanation} Suriin ang kaugnay na lesson para mas maunawaan ang pundamental na prinsipyo.`;
}

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
      const whyWrong = generateWhyWrong(answer.answer, q.correctAnswer, q.question, q.explanation);
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
