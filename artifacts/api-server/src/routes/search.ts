import { Router, type IRouter } from "express";
import { like, or } from "drizzle-orm";
import { db, glossaryTermsTable } from "@workspace/db";
import { SearchContentQueryParams, SearchContentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const CHAPTER_TITLES: Record<number, string> = {
  1: "Introduction to Reservoir Petrophysics",
  2: "Fundamentals of Reservoir Petrophysics",
  3: "Fluid Saturation, Wettability, and Capillary Pressure",
  4: "Well Log Interpretation",
  5: "Hydrocarbon PVT Properties and Phase Behavior",
  6: "Integration of Petrophysics and Phase Behavior",
  7: "Application in Reservoir Engineering",
};

const STATIC_FORMULAS = [
  { title: "Porosity Formula", excerpt: "φ = Vp / Vb — ratio of pore volume to bulk volume", chapterId: 1 },
  { title: "Darcy's Law", excerpt: "Q = -kA(dP/dL)/μ — flow rate proportional to pressure gradient", chapterId: 2 },
  { title: "Water Saturation (Archie)", excerpt: "Sw^n = (a·Rw) / (φ^m · Rt) — Archie's equation for water saturation", chapterId: 2 },
  { title: "Capillary Pressure", excerpt: "Pc = 2σcosθ / r — Young-Laplace equation for capillary pressure", chapterId: 3 },
  { title: "Leverett J-function", excerpt: "J(Sw) = (Pc/σcosθ)·√(k/φ) — dimensionless capillary pressure", chapterId: 3 },
  { title: "Resistivity Index", excerpt: "RI = Rt / Ro = 1/Sw^n — resistivity index for saturation", chapterId: 4 },
  { title: "Formation Factor", excerpt: "F = Ro / Rw = a / φ^m — Archie's formation factor", chapterId: 4 },
  { title: "Gas Compressibility Factor", excerpt: "PV = ZnRT — real gas equation with Z-factor", chapterId: 5 },
  { title: "Oil Formation Volume Factor", excerpt: "Bo = Vres / Vst — ratio of reservoir to surface volume", chapterId: 5 },
  { title: "Pore Volume Compressibility", excerpt: "cf = (1/Vp)(dVp/dP) — pore volume compressibility", chapterId: 6 },
  { title: "STOIIP", excerpt: "N = VbφSo / Bo — Stock Tank Oil Initially In Place", chapterId: 7 },
  { title: "Recovery Factor", excerpt: "RF = (STOIIP - Remaining Oil) / STOIIP — fraction of recoverable oil", chapterId: 7 },
];

const STATIC_TOPICS = [
  { title: "Porosity", excerpt: "The fraction of the rock volume occupied by pore spaces. Classified as primary (depositional) or secondary (diagenetic).", chapterId: 1 },
  { title: "Permeability", excerpt: "The measure of a rock's ability to transmit fluids. Measured in millidarcies (mD).", chapterId: 2 },
  { title: "Wettability", excerpt: "The tendency of a fluid to spread over or adhere to a solid surface in the presence of other immiscible fluids.", chapterId: 3 },
  { title: "Gamma Ray Log", excerpt: "A well log measuring natural radioactivity to distinguish shale from clean formations.", chapterId: 4 },
  { title: "Neutron Porosity Log", excerpt: "Measures the hydrogen index of a formation, used to determine porosity.", chapterId: 4 },
  { title: "Phase Envelope", excerpt: "A pressure-temperature diagram showing the boundaries between single and two-phase regions for hydrocarbon mixtures.", chapterId: 5 },
  { title: "Bubble Point", excerpt: "The pressure at which the first bubble of gas is liberated from an undersaturated oil reservoir.", chapterId: 5 },
  { title: "Dew Point", excerpt: "The pressure at which the first drop of liquid condenses from a gas condensate reservoir.", chapterId: 5 },
  { title: "Net Pay", excerpt: "The thickness of reservoir rock capable of producing hydrocarbons at economic rates.", chapterId: 6 },
  { title: "Material Balance", excerpt: "A fundamental reservoir engineering method equating production to expansion of fluids and rock.", chapterId: 7 },
];

router.get("/search", async (req, res): Promise<void> => {
  const query = SearchContentQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const q = query.data.q.toLowerCase();
  const results: {
    type: "topic" | "definition" | "formula" | "glossary";
    title: string;
    excerpt: string;
    chapterId: number | null;
    chapterTitle: string | null;
    sectionId: string | null;
  }[] = [];

  // Search glossary from DB
  const glossaryRows = await db
    .select()
    .from(glossaryTermsTable)
    .where(
      or(
        like(glossaryTermsTable.term, `%${query.data.q}%`),
        like(glossaryTermsTable.definition, `%${query.data.q}%`)
      )
    );

  for (const row of glossaryRows) {
    results.push({
      type: "glossary",
      title: row.term,
      excerpt: row.definition,
      chapterId: row.chapterId ?? null,
      chapterTitle: row.chapterId ? (CHAPTER_TITLES[row.chapterId] ?? null) : null,
      sectionId: null,
    });
  }

  // Search static topics
  for (const topic of STATIC_TOPICS) {
    if (
      topic.title.toLowerCase().includes(q) ||
      topic.excerpt.toLowerCase().includes(q)
    ) {
      results.push({
        type: "topic",
        title: topic.title,
        excerpt: topic.excerpt,
        chapterId: topic.chapterId,
        chapterTitle: CHAPTER_TITLES[topic.chapterId] ?? null,
        sectionId: null,
      });
    }
  }

  // Search formulas
  for (const formula of STATIC_FORMULAS) {
    if (
      formula.title.toLowerCase().includes(q) ||
      formula.excerpt.toLowerCase().includes(q)
    ) {
      results.push({
        type: "formula",
        title: formula.title,
        excerpt: formula.excerpt,
        chapterId: formula.chapterId,
        chapterTitle: CHAPTER_TITLES[formula.chapterId] ?? null,
        sectionId: null,
      });
    }
  }

  res.json(
    SearchContentResponse.parse({
      query: query.data.q,
      results,
    })
  );
});

export default router;
