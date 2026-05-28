import { Router, type IRouter } from "express";
import { like, or } from "drizzle-orm";
import { db, glossaryTermsTable } from "@workspace/db";
import { SearchContentQueryParams, SearchContentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const CHAPTER_TITLES: Record<number, string> = {
  1: "Panimula sa Reservoir Petrophysics",
  2: "Mga Pangunahing Kaalaman sa Reservoir Petrophysics",
  3: "Fluid Saturation, Wettability at Capillary Pressure",
  4: "Interpretasyon ng Well Logs",
  5: "Mga PVT Properties at Phase Behavior ng Hydrocarbon",
  6: "Integrasyon ng Petrophysics at Phase Behavior",
  7: "Aplikasyon sa Reservoir Engineering",
};

type ContentEntry = {
  title: string;
  excerpt: string;
  chapterId: number;
  sectionId: string;
  type: "topic" | "definition" | "formula";
  keywords: string[];
};

const FULL_CONTENT_INDEX: ContentEntry[] = [
  // ===== CHAPTER 1 =====
  {
    title: "Ano ang Reservoir Petrophysics?",
    excerpt: "Ang reservoir petrophysics ay ang pag-aaral ng pisikal at kemikal na katangian ng mga reservoir rocks na kumokontrol kung gaano karaming hydrocarbon ang kayang iimbak at kung gaano kadaling dumadaloy. Saklaw nito ang pagsukat ng porosity at permeability.",
    chapterId: 1, sectionId: "sec-1-1", type: "topic",
    keywords: ["petrophysics", "reservoir", "porosity", "permeability", "hydrocarbon", "katangian", "pisikal"],
  },
  {
    title: "Clastic Rocks at Sandstone",
    excerpt: "Ang mga clastic rocks ay nabuo mula sa mga piraso ng mas lumang bato. Pangunahin itong binubuo ng mga butil ng quartz na pinagsama ng simento. Ang kanilang pore system ay intergranular — predictable ang relasyon ng porosity at permeability.",
    chapterId: 1, sectionId: "sec-1-2-a", type: "topic",
    keywords: ["clastic", "sandstone", "quartz", "intergranular", "grain", "butil", "clastics", "lithology"],
  },
  {
    title: "Carbonate Rocks — Limestone at Dolomite",
    excerpt: "Ang mga carbonate ay nabuo sa pamamagitan ng kemikal at biolohikal na proseso. Ang diagenetic na proseso (dissolution, dolomitization, fracturing) ay lumilikha ng kumplikadong secondary pore system kabilang ang vugs, moldic pores, at fracture networks.",
    chapterId: 1, sectionId: "sec-1-2-b", type: "topic",
    keywords: ["carbonate", "limestone", "dolomite", "vug", "fracture", "dissolution", "diagenesis", "secondary porosity"],
  },
  {
    title: "Konektado vs Nakahiwalay na Pores",
    excerpt: "Ang mga konektadong pore ay nagpapahintulot sa mga fluid na dumating sa wellbore. Ang mga nakahiwalay (dead-end) na pore ay nag-iimbak ng fluid ngunit hindi makakatulong sa produksyon. Tanging ang effective pore volume lamang ang binibilang sa mga ma-produce na hydrocarbon.",
    chapterId: 1, sectionId: "sec-1-3-a", type: "topic",
    keywords: ["connected pores", "isolated pores", "dead-end", "effective porosity", "pore connectivity", "wellbore"],
  },
  {
    title: "Mga Uri ng Pore System — Intergranular, Vuggy, Fractured",
    excerpt: "Ang intergranular pores (sandstone) ay pinaka-predictable. Ang vuggy pores (carbonate) ay malalaking cavity na nabuo sa pamamagitan ng dissolution. Ang fractured reservoir ay may napakataas na permeability sa fractures na lumilikha ng mabilis na daan para sa fluid flow.",
    chapterId: 1, sectionId: "sec-1-3-b", type: "topic",
    keywords: ["pore system", "intergranular", "vuggy", "fractured", "carbonate", "permeability", "fracture"],
  },
  {
    title: "Core Analysis — RCAL at SCAL",
    excerpt: "Ang core analysis ay kinabibilangan ng pagputol ng mga pisikal na sample ng bato mula sa wellbore. Ang Routine Core Analysis (RCAL) ay nagbibigay ng direktang sukat ng porosity at permeability. Ang Special Core Analysis (SCAL) ay sumasaklaw ng capillary pressure, wettability, at relative permeability.",
    chapterId: 1, sectionId: "sec-1-4-a", type: "topic",
    keywords: ["core analysis", "RCAL", "SCAL", "core sample", "laboratory", "ground truth", "special core analysis"],
  },
  {
    title: "Well Logs — Panimula",
    excerpt: "Ang mga well log ay nagbibigay ng tuloy-tuloy na sukat ng mga katangian ng formation gamit ang mga downhole sensing tool. Mga karaniwang log: Gamma Ray (lithology), Density at Neutron (porosity), Resistivity (fluid type at saturation).",
    chapterId: 1, sectionId: "sec-1-4-b", type: "topic",
    keywords: ["well log", "gamma ray", "density log", "neutron log", "resistivity", "formation", "downhole"],
  },
  {
    title: "Epekto ng Clay sa Reservoir Quality",
    excerpt: "Kahit maliit na halaga ng clay ay maaaring dramatikong bawasan ang porosity at permeability, kumplikado ang interpretasyon ng log, at magdulot ng formation damage. Ang swelling clays ay mapanganib sa panahon ng drilling.",
    chapterId: 1, sectionId: "sec-1-5-b", type: "topic",
    keywords: ["clay", "shale", "formation damage", "swelling", "clay minerals", "permeability reduction"],
  },
  {
    title: "Dispersed, Laminated, at Structural Clay",
    excerpt: "Dispersed Clay: pinupuno ang pore throat, pinaka-malubhang pagbaba ng permeability. Laminated Clay: nagaganap bilang manipis na layer, naghihigpit sa vertical flow. Structural Clay: bahagi ng rock matrix, pinaka-matatag.",
    chapterId: 1, sectionId: "sec-1-5-a", type: "definition",
    keywords: ["dispersed clay", "laminated clay", "structural clay", "pore throat", "clay distribution", "vertical permeability"],
  },
  {
    title: "Bubble Point Pressure",
    excerpt: "Ang pressure kung saan lumalabas ang unang bula ng gas mula sa solusyon ng langis. Sa itaas ng bubble point, ang langis ay single-phase (undersaturated). Sa ibaba nito, nagsisimulang bumuo ang free gas sa reservoir.",
    chapterId: 1, sectionId: "sec-1-6-a", type: "definition",
    keywords: ["bubble point", "bubble point pressure", "gas liberation", "undersaturated", "saturated", "oil reservoir", "Pb"],
  },
  {
    title: "Dew Point Pressure",
    excerpt: "Ang pressure kung saan nag-ko-condense ang unang patak ng likido mula sa isang gas. Kritikal sa mga gas condensate reservoir kung saan ang pagbaba ng pressure ay nagdudulot ng liquid dropout sa mismong reservoir.",
    chapterId: 1, sectionId: "sec-1-6-a", type: "definition",
    keywords: ["dew point", "dew point pressure", "gas condensate", "liquid dropout", "condensation", "Pd"],
  },
  {
    title: "Klasipikasyon ng Reservoir Fluid — Black Oil hanggang Dry Gas",
    excerpt: "Ang limang pangunahing uri ng reservoir fluid: Black Oil (mabigat na crude, mababang GOR), Volatile Oil (mataas na GOR, malapit sa critical point), Gas Condensate (retrograde condensation), Wet Gas (liquid sa surface), at Dry Gas (purong methane).",
    chapterId: 1, sectionId: "sec-1-6-b", type: "topic",
    keywords: ["fluid classification", "black oil", "volatile oil", "gas condensate", "wet gas", "dry gas", "reservoir fluid", "GOR"],
  },
  {
    title: "Z-Factor at Vapor-Liquid Equilibrium",
    excerpt: "Ang Z-factor (gas compressibility factor) ay nagwawasto ng ideal gas law para sa paglihis: PV = ZnRT. Kapag ang Z = 1, ang gas ay kumikilos nang ideyal. Ang VLE ay naglalarawan ng kondisyon kung saan magkasamang umiiral ang gas at liquid phase.",
    chapterId: 1, sectionId: "sec-1-6-c", type: "definition",
    keywords: ["Z-factor", "compressibility factor", "VLE", "vapor liquid equilibrium", "real gas", "ideal gas", "ZnRT"],
  },

  // ===== CHAPTER 2 =====
  {
    title: "Porosity — Kahulugan at Klase",
    excerpt: "Ang porosity (φ) ay ang bahagi ng kabuuang volume ng bato na inookupahan ng mga void space. Kinakalkula bilang φ = Vp / Vb. Classified bilang total porosity (lahat ng void) o effective porosity (konektado lamang, ginagamit sa engineering calculations).",
    chapterId: 2, sectionId: "sec-2-1", type: "definition",
    keywords: ["porosity", "phi", "pore volume", "bulk volume", "void space", "total porosity", "effective porosity", "φ"],
  },
  {
    title: "Primary vs Secondary Porosity",
    excerpt: "Primary porosity ay nabubuo sa panahon ng deposisyon (intergranular space sa sandstone). Secondary porosity ay nabubuo pagkatapos ng lithification: fracturing, dissolution (vugs), at dolomitization. Ang secondary porosity ay nagdodominyo sa mga carbonate reservoir.",
    chapterId: 2, sectionId: "sec-2-1-b", type: "topic",
    keywords: ["primary porosity", "secondary porosity", "depositional porosity", "fracture", "vugs", "dolomitization", "diagenetic"],
  },
  {
    title: "Pagsukat ng Porosity — Core at Log Methods",
    excerpt: "Core: helium porosimeter (pinaka-tumpak), fluid saturation method. Well Logs: density log (φD = (ρma − ρb)/(ρma − ρfl)), neutron porosity log (hydrogen index). Core data ay ginagamit bilang calibration standard para sa log-derived porosity.",
    chapterId: 2, sectionId: "sec-2-1-c", type: "topic",
    keywords: ["porosity measurement", "helium porosimeter", "density log", "neutron log", "porosity calculation", "Boyle's Law"],
  },
  {
    title: "Mga Salik na Kumokontrol sa Porosity — Grain Size, Cementation, Compaction",
    excerpt: "Grain Size at Sorting: well-sorted sediment ay mas mataas na porosity. Cementation: nagde-deposit ang mineral sa pore space, nagbabawas ng porosity. Compaction: ang overburden pressure ay nagdudurog ng grains, nagbabawas ng porosity sa lalim.",
    chapterId: 2, sectionId: "sec-2-1-d", type: "topic",
    keywords: ["grain size", "sorting", "cementation", "compaction", "overburden", "porosity controls", "depth", "diagenesis"],
  },
  {
    title: "Permeability — Kahulugan at Darcy's Law",
    excerpt: "Ang permeability (k) ay ang kakayahan ng bato na ihatid ang mga fluid. Sinusukat sa millidarcies (mD). Darcy's Law: Q = -kA(dP/dL)/μ — ang flow rate ay proporsyonal sa pressure gradient at cross-sectional area, inversely proportional sa fluid viscosity.",
    chapterId: 2, sectionId: "sec-2-2", type: "definition",
    keywords: ["permeability", "darcy", "Darcy's law", "millidarcy", "flow rate", "pressure gradient", "viscosity", "k", "mD"],
  },
  {
    title: "Absolute, Effective, at Relative Permeability",
    excerpt: "Absolute permeability: sinusukat sa 100% isang fluid. Effective permeability: permeability ng isang fluid sa presensya ng ibang fluid. Relative permeability (kr): ratio ng effective sa absolute permeability, mula 0 hanggang 1.",
    chapterId: 2, sectionId: "sec-2-2-a", type: "definition",
    keywords: ["absolute permeability", "effective permeability", "relative permeability", "kr", "multiphase", "two-phase flow"],
  },
  {
    title: "Klinkenberg Effect at Gas Permeability",
    excerpt: "Ang gas ay nagpapakita ng mas mataas na apparent permeability kaysa sa liquid dahil sa gas slippage sa pore walls (Klinkenberg effect). Ang measured gas permeability ay ini-correct sa equivalent liquid permeability para sa mas tumpak na reservoir characterization.",
    chapterId: 2, sectionId: "sec-2-2-b", type: "topic",
    keywords: ["Klinkenberg", "gas permeability", "gas slippage", "liquid permeability", "correction", "apparent permeability"],
  },
  {
    title: "Porosity-Permeability Relationship",
    excerpt: "Sa mga sandstone, ang mataas na porosity ay karaniwang nangangahulugang mataas na permeability — predictable ang relasyon. Sa mga carbonate, hindi garantiya ng permeability ang mataas na porosity dahil ang pore connectivity (fractures, vugs) ang kumokontrol sa daloy.",
    chapterId: 2, sectionId: "sec-2-3", type: "topic",
    keywords: ["porosity permeability relationship", "crossplot", "sandstone", "carbonate", "pore connectivity", "k-phi plot"],
  },
  {
    title: "Rock Compressibility",
    excerpt: "Ang rock compressibility (cf) ay nagtatakda kung gaano kabago ang pore volume kapag nagbago ang pressure. Mahalaga sa material balance calculations. Sa mga highly compressible chalk at overpressured formation, ang compaction drive ay maaaring dominanteng recovery mechanism.",
    chapterId: 2, sectionId: "sec-2-4", type: "definition",
    keywords: ["rock compressibility", "pore volume compressibility", "compaction", "cf", "material balance", "overpressure"],
  },

  // ===== CHAPTER 3 =====
  {
    title: "Water Saturation — Kahulugan at Archie's Equation",
    excerpt: "Ang water saturation (Sw) ay ang bahagi ng pore volume na puno ng tubig. Kinakalkula gamit ang Archie's equation: Sw^n = (a·Rw)/(φ^m·Rt). Ang irreducible water saturation (Swirr) ay ang pinakamababa na Sw sa mataas na capillary pressure.",
    chapterId: 3, sectionId: "sec-3-1", type: "definition",
    keywords: ["water saturation", "Sw", "Archie", "irreducible", "saturation", "Swirr", "pore water"],
  },
  {
    title: "Wettability — Hydrophilic at Hydrophobic",
    excerpt: "Ang wettability ay ang tendensiyang manatili o kumalat ng isang fluid sa solid surface sa presensya ng ibang fluid. Water-wet: ang tubig ay hawak ng bato sa pore walls. Oil-wet: ang langis ay nasa contact sa bato. Mixed-wet: pinaka-karaniwan sa carbonates.",
    chapterId: 3, sectionId: "sec-3-2", type: "definition",
    keywords: ["wettability", "water-wet", "oil-wet", "mixed-wet", "contact angle", "surface energy", "hydrophilic", "hydrophobic"],
  },
  {
    title: "Capillary Pressure — Young-Laplace Equation",
    excerpt: "Ang capillary pressure (Pc) ay ang pressure difference sa pagitan ng non-wetting at wetting fluid sa isang pore throat. Young-Laplace equation: Pc = 2σcosθ/r. Sa reservoir, ito ang nagtatakda ng distribusyon ng mga fluid at ang free water level.",
    chapterId: 3, sectionId: "sec-3-3", type: "definition",
    keywords: ["capillary pressure", "Young-Laplace", "Pc", "pore throat radius", "surface tension", "contact angle", "free water level", "sigma"],
  },
  {
    title: "Leverett J-Function",
    excerpt: "Ang J-function ay isang dimensionless capillary pressure function na nino-normalize ang Pc measurements para sa pagkukumpara ng iba't ibang bato: J(Sw) = (Pc/σcosθ)·√(k/φ). Ginagamit para i-correlate ang capillary pressure data sa pagitan ng iba't ibang sample.",
    chapterId: 3, sectionId: "sec-3-3-b", type: "formula",
    keywords: ["Leverett", "J-function", "capillary pressure", "normalization", "dimensionless", "correlation"],
  },
  {
    title: "Drainage at Imbibition — Hysteresis",
    excerpt: "Drainage: proseso kung saan ang non-wetting fluid (langis) ay pumapasok at pinapalabas ang wetting fluid (tubig). Imbibition: kabaligtaran — ang wetting fluid ay bumabalik. Ang hysteresis ay nagdudulot ng pagkakaiba ng capillary pressure curves sa drainage at imbibition.",
    chapterId: 3, sectionId: "sec-3-3-c", type: "topic",
    keywords: ["drainage", "imbibition", "hysteresis", "capillary pressure curves", "wetting fluid", "non-wetting"],
  },
  {
    title: "Multiphase Flow at Relative Permeability Curves",
    excerpt: "Ang daloy ng bawat phase sa multiphase system ay kontrolado ng effective permeability nito: keff = kr × kabs. Ang Corey exponent model: kro = (1-Sw*)^n, krw = Sw*^m. Ang endpoint saturations (Sor, Swirr) ang nagtatakda ng hangganan ng two-phase region.",
    chapterId: 3, sectionId: "sec-3-4", type: "topic",
    keywords: ["relative permeability", "multiphase flow", "Corey", "kro", "krw", "endpoint saturation", "residual oil", "Sor"],
  },

  // ===== CHAPTER 4 =====
  {
    title: "Gamma Ray Log (GR) — Lithology at Shale Indicator",
    excerpt: "Sinusukat ng Gamma Ray log ang natural radioactivity ng formation para matukoy ang litholohiya at shale content. GR Index: IGR = (GR_log − GR_min)/(GR_max − GR_min). Mataas na GR = shale; mababang GR = clean sand o carbonate.",
    chapterId: 4, sectionId: "sec-4-1", type: "topic",
    keywords: ["gamma ray", "GR log", "shale", "lithology", "radioactivity", "IGR", "shale volume", "clay indicator", "Vsh"],
  },
  {
    title: "Resistivity Log at Fluid Identification",
    excerpt: "Sinusukat ng resistivity log ang electrical resistivity ng formation para matukoy ang uri ng fluid. Mataas na resistivity = hydrocarbon o tight rock; mababang resistivity = saltwater. Ginagamit sa Archie's equation para kalkulahin ang water saturation.",
    chapterId: 4, sectionId: "sec-4-2", type: "topic",
    keywords: ["resistivity log", "fluid identification", "Rt", "Ro", "Rw", "formation resistivity", "shallow resistivity", "deep resistivity"],
  },
  {
    title: "Archie's Equations — Formation Factor at Water Saturation",
    excerpt: "Formation Factor: F = Ro/Rw = a/φ^m. Water Saturation: Sw = [(a·Rw)/(φ^m·Rt)]^(1/n). Ang mga Archie parameters: a (tortuosity factor), m (cementation exponent), n (saturation exponent). Pundasyon ng quantitative log interpretation.",
    chapterId: 4, sectionId: "sec-4-2-b", type: "formula",
    keywords: ["Archie", "formation factor", "water saturation", "cementation exponent", "tortuosity", "m", "n", "Sw", "Rw", "Rt"],
  },
  {
    title: "Density Log — Porosity Determination",
    excerpt: "Sinusukat ng density log ang bulk density ng formation. Density porosity: φD = (ρma − ρb)/(ρma − ρfl). Matrix density para sa sandstone: 2.65 g/cm³, limestone: 2.71 g/cm³. Sensitive sa gas presence — nagbibigay ng low apparent density sa gas-bearing zones.",
    chapterId: 4, sectionId: "sec-4-3", type: "topic",
    keywords: ["density log", "bulk density", "matrix density", "density porosity", "RHOB", "phi D", "rho ma"],
  },
  {
    title: "Neutron Porosity Log at Hydrogen Index",
    excerpt: "Sinusukat ng neutron log ang hydrogen index ng formation. Mataas na HI = mataas na liquid content = mataas na apparent porosity. Sa gas-bearing zones, ang neutron log ay nagpapakita ng mababang porosity (hydrogen-poor gas) habang ang density log ay nagpapakita ng mas mataas na porosity.",
    chapterId: 4, sectionId: "sec-4-4", type: "topic",
    keywords: ["neutron log", "hydrogen index", "neutron porosity", "NPHI", "gas effect", "crossover", "thermal neutron"],
  },
  {
    title: "Neutron-Density Crossover at Gas Detection",
    excerpt: "Sa gas zones, ang neutron log ay nagpapakita ng mas mababang porosity (gas ay hydrogen-poor) habang ang density log ay nagpapakita ng mas mataas na porosity (gas ay low density). Ang 'crossover' na ito sa pagitan ng dalawang log ay isang classic gas indicator.",
    chapterId: 4, sectionId: "sec-4-4-b", type: "topic",
    keywords: ["neutron density crossover", "gas detection", "gas indicator", "crossover effect", "gas zone identification"],
  },
  {
    title: "Sonic Log at Acoustic Velocity",
    excerpt: "Sinusukat ng sonic log ang bilis ng pagpropagasyon ng acoustic wave sa formation (microseconds/foot). Ginagamit para kalkulahin ang porosity (Wyllie time-average equation) at para sa seismic-to-well tie at geomechanical evaluation.",
    chapterId: 4, sectionId: "sec-4-5", type: "topic",
    keywords: ["sonic log", "acoustic", "travel time", "DT", "Wyllie", "compressional wave", "seismic", "geomechanics"],
  },
  {
    title: "NMR Log — Nuclear Magnetic Resonance",
    excerpt: "Ang NMR log ay nagbibigay ng direktang sukat ng pore size distribution, effective porosity, at permeability estimate. Kakayang makilala ang bound water (irreducible) mula sa free fluid. Natatangi dahil hindi ito affected ng litholohiya.",
    chapterId: 4, sectionId: "sec-4-5-b", type: "topic",
    keywords: ["NMR", "nuclear magnetic resonance", "pore size distribution", "T2 distribution", "bound water", "free fluid", "permeability"],
  },
  {
    title: "Payzone Identification at Well Log Integration",
    excerpt: "Ang proseso ng pagtukoy ng productive zones: GR para matukoy ang lithology → Porosity log para kalkulahin ang φ → Resistivity at Archie para kalkulahin ang Sw → Net pay cutoffs para matukoy ang final net pay thickness.",
    chapterId: 4, sectionId: "sec-4-6", type: "topic",
    keywords: ["payzone", "pay zone", "net pay", "log integration", "productive zone", "hydrocarbon indicator", "pay determination"],
  },
  {
    title: "Net Pay at Cutoff Values",
    excerpt: "Net pay ay ang kapal ng reservoir rock na kayang mag-produce ng hydrocarbon sa ekonomikong rate. Karaniwang cutoffs: Porosity > 6-12%, Water Saturation < 50-60%, Vsh < 30-50%. Ang BVW (Bulk Volume Water = φ × Sw) ay indicator ng water-free production.",
    chapterId: 4, sectionId: "sec-4-7", type: "definition",
    keywords: ["net pay", "cutoff", "porosity cutoff", "saturation cutoff", "shale cutoff", "BVW", "bulk volume water", "pay thickness"],
  },

  // ===== CHAPTER 5 =====
  {
    title: "PVT Concept at Phase Diagram",
    excerpt: "Ang PVT (Pressure-Volume-Temperature) analysis ay nag-characterize kung paano kumilos ang mga reservoir fluid. Ang phase diagram ay nagpapakita ng bubble point curve at dew point curve na nagtatagpo sa critical point. Sa loob ng envelope, dalawang phase ang sabay na umiiral.",
    chapterId: 5, sectionId: "sec-5-1", type: "topic",
    keywords: ["PVT", "phase diagram", "pressure temperature", "phase envelope", "PT diagram", "critical point", "bubble point curve", "dew point curve"],
  },
  {
    title: "Critical Point, Cricondentherm, at Cricondenbar",
    excerpt: "Critical Point (Tc, Pc): kung saan nawawala ang pagkakaiba ng likido at gas. Cricondentherm: maximum temperatura kung saan maaaring mag-two-phase. Cricondenbar: maximum pressure kung saan maaaring mag-two-phase. Tinutukoy ang uri ng reservoir fluid.",
    chapterId: 5, sectionId: "sec-5-1-b", type: "definition",
    keywords: ["critical point", "cricondentherm", "cricondenbar", "critical temperature", "critical pressure", "two-phase region", "Tc", "Pc"],
  },
  {
    title: "Depletion Path ng Oil at Gas Reservoir",
    excerpt: "Oil reservoir: nagsisimula sa itaas ng bubble point → bumababa ang pressure → tinatawid ang bubble point → nagbubuong free gas. Gas condensate reservoir: nagsisimula sa itaas ng dew point → retrograde condensation sa reservoir kapag tinatawid ang dew point.",
    chapterId: 5, sectionId: "sec-5-2", type: "topic",
    keywords: ["depletion", "depletion path", "isothermal", "reservoir pressure decline", "free gas", "retrograde condensation"],
  },
  {
    title: "Black Oil — Mga Katangian",
    excerpt: "Ang black oil ay ang pinakakaraniwang reservoir fluid. Mababang GOR (< 2,000 scf/STB), mababang API gravity (15-45° API), malayo sa critical point. Bo karaniwang 1.1 hanggang 1.8 res bbl/STB. Pinaka-matatag at pinaka-predictable na uri ng fluid.",
    chapterId: 5, sectionId: "sec-5-3", type: "definition",
    keywords: ["black oil", "crude oil", "GOR", "API gravity", "formation volume factor", "Bo", "undersaturated oil", "black oil properties"],
  },
  {
    title: "Volatile Oil — Malapit sa Critical Region",
    excerpt: "Volatile oil ay may mataas na GOR (2,000-100,000 scf/STB), mataas na API gravity (40-60° API), at mabilis na liquid shrinkage sa ibaba ng bubble point. Malapit sa critical point, kaya ang malaking bahagi ng reservoir oil ay maaaring dumating sa separator bilang gas.",
    chapterId: 5, sectionId: "sec-5-4", type: "definition",
    keywords: ["volatile oil", "high GOR", "liquid shrinkage", "API gravity", "critical point", "intermediate hydrocarbons"],
  },
  {
    title: "Gas Condensate — Retrograde Condensation",
    excerpt: "Ang gas condensate reservoir ay nagsisimula bilang single-phase gas. Habang bumababa ang pressure sa dew point, nag-co-condense ang likido sa reservoir — retrograde condensation. Ang condensate ay mayaman sa pentane+ at maaaring hindi na mabawi. API gravity > 60°.",
    chapterId: 5, sectionId: "sec-5-5-a", type: "definition",
    keywords: ["gas condensate", "retrograde condensation", "retrograde", "condensate", "dew point", "condensate banking", "high API", "white oil", "lease condensate"],
  },
  {
    title: "Gas Condensate — Mga Importanteng Termino",
    excerpt: "Retrograde Gas: gas na nagiging likido habang bumababa ang pressure. Condensate Banking: pag-ipon ng likido malapit sa balon na humarang sa gas flow. High API Gravity: magaan at malinaw na condensate. Kulay: malinaw, mapusyaw na dilaw, orange, o light amber.",
    chapterId: 5, sectionId: "sec-5-5-a", type: "definition",
    keywords: ["retrograde gas", "condensate banking", "high API gravity", "condensate color", "gas condensate terms"],
  },
  {
    title: "Wet Gas (Rich Gas) — Mga Katangian",
    excerpt: "Wet gas o rich gas ay natural gas na may kasamang mabibigat na hydrocarbons (ethane, propane, butane). Hindi nagkakaroon ng liquid sa reservoir kahit bumaba ang pressure, ngunit nagbubuong liquid sa surface separator. Nangangailangan ng processing plants para ihiwalay ang NGLs.",
    chapterId: 5, sectionId: "sec-5-5-b", type: "definition",
    keywords: ["wet gas", "rich gas", "NGL", "natural gas liquids", "surface separator", "ethane", "propane", "butane", "GPM", "heavy hydrocarbons"],
  },
  {
    title: "Dry Gas — Purong Methane",
    excerpt: "Dry gas o lean gas ay halos methane lamang. Walang liquid na nabubuo sa reservoir at sa surface separator. Pinakasimpleng fluid na i-model. Single-phase gas sa lahat ng kondisyon ng produksyon. Kailangan lamang ng simpleng dehydration bago ipadala sa pipelines.",
    chapterId: 5, sectionId: "sec-5-5-c", type: "definition",
    keywords: ["dry gas", "lean gas", "methane", "CH4", "single phase gas", "no condensate", "dehydration", "pipeline gas"],
  },
  {
    title: "Oil Formation Volume Factor (Bo)",
    excerpt: "Ang Bo ay ang ratio ng volume ng langis sa reservoir conditions sa volume ng langis sa stock tank conditions (res bbl/STB). Bo > 1 dahil ang reservoir oil ay naglalaman ng dissolved gas at thermally expanded. Sa itaas ng bubble point, tumataas ang Bo kasabay ng pressure.",
    chapterId: 5, sectionId: "sec-5-6-a", type: "definition",
    keywords: ["Bo", "oil FVF", "formation volume factor", "oil volume factor", "reservoir conditions", "stock tank", "shrinkage", "res bbl/STB"],
  },
  {
    title: "Solution Gas-Oil Ratio (Rs)",
    excerpt: "Ang Rs ay ang volume ng gas na natunaw sa langis sa reservoir pressure at temperatura bawat stock tank barrel (scf/STB). Tumataas ang Rs kasabay ng pressure hanggang sa bubble point. Sa ibaba ng bubble point, bumababa ang Rs habang napalaya ang gas.",
    chapterId: 5, sectionId: "sec-5-6-a", type: "definition",
    keywords: ["solution GOR", "Rs", "dissolved gas", "gas-oil ratio", "scf/STB", "bubble point", "dissolved gas ratio"],
  },
  {
    title: "Gas Formation Volume Factor (Bg) at Z-Factor",
    excerpt: "Bg = 0.00504 × ZT/P (res bbl/scf). Maliit ang Bg sa mataas na pressure; malaki ang pagtaas nito habang bumababa ang pressure. Z-factor: PV = ZnRT, tinutukoy mula sa Standing-Katz correlation. Para sa ideal gas Z = 1.",
    chapterId: 5, sectionId: "sec-5-6-b", type: "formula",
    keywords: ["Bg", "gas FVF", "gas formation volume factor", "Z factor", "Z-factor", "gas compressibility factor", "Standing-Katz", "real gas"],
  },
  {
    title: "Gas Compressibility (cg)",
    excerpt: "Para sa mga tunay na gas, cg = 1/P − (1/Z)(dZ/dP). Near-ideal: cg ≈ 1/P. Ang gas compressibility ang pangunahing katangian na nagtatakda kung gaano karaming enerhiya ang nakaimbak sa gas reservoir sa paunang pressure.",
    chapterId: 5, sectionId: "sec-5-6-b", type: "formula",
    keywords: ["gas compressibility", "cg", "isothermal compressibility", "reservoir energy", "pressure depletion"],
  },

  // ===== CHAPTER 6 =====
  {
    title: "Rock-Fluid Integration at Wettability Effects",
    excerpt: "Ang wettability ng bato ay nakakaapekto sa lahat ng rock-fluid interaction: capillary pressure, relative permeability, at residual saturation. Ang oil-wet carbonate ay may ibang kr curves kaysa sa water-wet sandstone — kritikal para sa waterflood design.",
    chapterId: 6, sectionId: "sec-6-1", type: "topic",
    keywords: ["rock fluid integration", "wettability effect", "rock-fluid interaction", "capillary number", "mixed wet", "carbonate wettability"],
  },
  {
    title: "Relative Permeability at Reservoir Simulation",
    excerpt: "Ang relative permeability curves (kro, krw, krg) ay essential input sa reservoir simulation. Sinusukat mula sa SCAL experiments. Ang endpoint saturations (Sor, Swirr) at Corey exponents ay nagtatakda ng shape ng curves at ng ultimate recovery.",
    chapterId: 6, sectionId: "sec-6-2", type: "topic",
    keywords: ["relative permeability", "SCAL", "kro", "krw", "krg", "endpoint", "Sor", "Corey exponent", "simulation input"],
  },
  {
    title: "STOIIP — Stock Tank Oil Initially In Place",
    excerpt: "STOIIP formula: N = Vb × φ × (1 − Sw) / Bo. Ang bawat term ay may pinagkukunan: Vb (seismic/geology), φ at Sw (petrophysics/logs), Bo (PVT lab). 10% error sa alinmang input ay gumagawa ng 10% error sa STOIIP.",
    chapterId: 6, sectionId: "sec-6-3-a", type: "formula",
    keywords: ["STOIIP", "OOIP", "oil in place", "volumetric", "N", "Vb", "Bo", "Sw", "reserves estimation", "stock tank oil"],
  },
  {
    title: "GIIP — Gas Initially In Place",
    excerpt: "Gas Initially In Place: G = 43,560 × A × h × φ × (1 − Sw) / Bg. Sa metric: G = (Vb × φ × (1 − Sw)) / Bg. Lahat ng input parameters (porosity, water saturation, Bg) ay may uncertainty na directly nakakaapekto sa GIIP calculation.",
    chapterId: 6, sectionId: "sec-6-3", type: "formula",
    keywords: ["GIIP", "gas in place", "OGIP", "G", "Bg", "gas volumetric", "gas reserves", "gas estimation"],
  },
  {
    title: "Recovery Factor at Recoverable Reserves",
    excerpt: "Recovery Factor (RF): bahagi ng STOIIP na maaaring ma-extract. RF ay nakasalalay sa drive mechanism (water drive: 35-75%; solution gas drive: 5-30%), kalidad ng bato, at fluid properties. Recoverable Reserves = STOIIP × RF.",
    chapterId: 6, sectionId: "sec-6-3-b", type: "formula",
    keywords: ["recovery factor", "RF", "recoverable reserves", "drive mechanism", "water drive", "solution gas drive", "ultimate recovery"],
  },
  {
    title: "Pressure Depletion — Gawi ng Fluid at Bato",
    excerpt: "Sa depletion: Oil volume shrinkage (pagpalaya ng dissolved gas sa ibaba ng bubble point), Free gas liberation (nagtatayo ng gas saturation), Gas expansion (nagbibigay ng drive energy), Viscosity changes (bumababa ang oil viscosity sa ibaba ng bubble point).",
    chapterId: 6, sectionId: "sec-6-4", type: "topic",
    keywords: ["pressure depletion", "reservoir depletion", "oil shrinkage", "free gas", "gas liberation", "drive energy", "viscosity change"],
  },
  {
    title: "Mobility Ratio at Waterflood Design",
    excerpt: "Mobility ratio M = λ_displacing / λ_displaced = (kr,disp/μdisp)/(kr,oil/μoil). Kapag M < 1: matatag ang displacement. Kapag M > 1: viscous fingering. Ang polymer flooding ay nagpapalaki ng water viscosity para bawasan ang M sa heavy oil.",
    chapterId: 6, sectionId: "sec-6-5", type: "formula",
    keywords: ["mobility ratio", "M", "waterflood", "viscous fingering", "displacement efficiency", "sweep efficiency", "polymer flooding", "mobility"],
  },
  {
    title: "Petrophysics at PVT sa Reservoir Simulation",
    excerpt: "Ang reservoir simulation ay nag-iintegrate ng static petrophysical inputs (φ, k, N/G, rock types, kr curves) at dynamic PVT inputs (PVT tables, fluid compressibility, phase behavior model). Ang simulation ay ang ultimate integration tool para sa production forecasting.",
    chapterId: 6, sectionId: "sec-6-6", type: "topic",
    keywords: ["reservoir simulation", "simulation inputs", "PVT tables", "static model", "dynamic model", "history matching", "production forecast"],
  },

  // ===== CHAPTER 7 =====
  {
    title: "Material Balance Equation",
    excerpt: "Ang material balance equation (MBE) ay nagtatakda ng equilibrium sa pagitan ng production at reservoir expansion. Para sa oil reservoir: F = N(Eo + mEg + Efw). Ang MBE ay ginagamit para mag-estimate ng OOIP at drive mechanisms.",
    chapterId: 7, sectionId: "sec-7-1", type: "formula",
    keywords: ["material balance", "MBE", "reservoir expansion", "drive mechanism", "production", "Havlena Odeh", "Craft Hawkins"],
  },
  {
    title: "Volumetrics at Reserves Classification",
    excerpt: "Ang volumetric method ay ang pinaka-pundamental na paraan sa pagtatantya ng hydrocarbon in place. Ang reserves ay classified bilang Proved (1P), Probable (2P), at Possible (3P) batay sa certainty ng recovery. SPE-PRMS ang standard na framework.",
    chapterId: 7, sectionId: "sec-7-2", type: "topic",
    keywords: ["volumetrics", "reserves", "proved reserves", "1P 2P 3P", "SPE PRMS", "reserve classification", "resource classification"],
  },
  {
    title: "Decline Curve Analysis",
    excerpt: "Ang Decline Curve Analysis (DCA) ay isang empirical na paraan ng production forecasting. Ang tatlong uri ng decline: Exponential (constant fractional decline), Hyperbolic (variable decline), at Harmonic (special case). Arps equations ang pinakakaraniwan.",
    chapterId: 7, sectionId: "sec-7-3", type: "topic",
    keywords: ["decline curve", "DCA", "production decline", "Arps", "exponential decline", "hyperbolic decline", "harmonic decline", "production forecast"],
  },
  {
    title: "Drive Mechanisms — Natural at Artificial",
    excerpt: "Natural drive mechanisms: Solution Gas Drive (dissolved gas expansion), Water Drive (aquifer support), Gas Cap Drive (gas cap expansion), Gravity Drainage, Compaction Drive. Artificial lift at enhanced recovery (EOR) ay nagpapalaki ng recovery factor.",
    chapterId: 7, sectionId: "sec-7-4", type: "topic",
    keywords: ["drive mechanism", "solution gas drive", "water drive", "gas cap", "gravity drainage", "EOR", "enhanced recovery", "aquifer", "artificial lift"],
  },
  {
    title: "IPR — Inflow Performance Relationship",
    excerpt: "Ang Inflow Performance Relationship (IPR) ay nagpapakita ng relasyon sa pagitan ng bottom hole flowing pressure (BHFP) at production rate. Ang Vogel equation ang pinakakaraniwan para sa solution gas drive reservoir. Ginagamit para i-design ang artificial lift.",
    chapterId: 7, sectionId: "sec-7-5", type: "topic",
    keywords: ["IPR", "inflow performance", "Vogel", "BHFP", "bottomhole pressure", "production rate", "productivity index", "PI", "well performance"],
  },
  {
    title: "Well Test Analysis — Pressure Transient",
    excerpt: "Ang well testing ay nagbibigay ng average reservoir permeability, skin factor, at reservoir boundaries. Build-up test: ang presyur ay nire-recover pagkatapos ng produksyon. Draw-down test: ang presyur ay bumababa habang nag-produce. Horner plot ang standard method.",
    chapterId: 7, sectionId: "sec-7-6", type: "topic",
    keywords: ["well test", "pressure transient", "buildup test", "drawdown", "skin factor", "Horner plot", "permeability estimation", "reservoir boundaries"],
  },

  // ===== ADDITIONAL FORMULA ENTRIES =====
  {
    title: "Porosity Formula — φ = Vp / Vb",
    excerpt: "Ang porosity (φ) ay katumbas ng pore volume (Vp) na hinati sa bulk volume (Vb). Ipinahayag bilang decimal o porsyento. Ang typical reservoir porosity ay 10–35% para sa sandstone at 5–25% para sa carbonate.",
    chapterId: 1, sectionId: "sec-2-1", type: "formula",
    keywords: ["porosity formula", "phi", "Vp/Vb", "pore volume", "bulk volume", "φ formula"],
  },
  {
    title: "Darcy's Law — Q = kA(ΔP/ΔL)/μ",
    excerpt: "Q = kA(ΔP/ΔL)/μ. Ang flow rate (Q) ay proporsyonal sa permeability (k), cross-sectional area (A), at pressure gradient (ΔP/ΔL), at inversely proporsyonal sa fluid viscosity (μ). Pundasyon ng lahat ng fluid flow calculations sa porous media.",
    chapterId: 2, sectionId: "sec-2-2", type: "formula",
    keywords: ["Darcy's Law", "Darcy equation", "flow rate", "permeability formula", "Q = kA dP/dL mu", "Darcy velocity"],
  },
  {
    title: "Real Gas Law — PV = ZnRT",
    excerpt: "PV = ZnRT. Ang Z-factor ay nagwawasto ng ideal gas law para sa tunay na gawi ng gas. Ang Z ay tinutukoy mula sa Standing-Katz chart gamit ang reduced pressure (Ppr) at reduced temperature (Tpr).",
    chapterId: 5, sectionId: "sec-1-6-c", type: "formula",
    keywords: ["real gas law", "PV = ZnRT", "Z-factor", "ideal gas law", "gas equation of state", "Z factor calculation"],
  },
  {
    title: "Original Oil in Place (OOIP) — N = 7758 × A × h × φ × (1−Sw) / Bo",
    excerpt: "OOIP (N) sa STB: N = 7758 × A(acres) × h(ft) × φ × (1-Sw) / Bo. Ang 7758 ay conversion factor (bbl/acre-ft). Lahat ng input ay may uncertainty na proporsyonal na nakakaapekto sa final OOIP estimate.",
    chapterId: 7, sectionId: "sec-6-3-a", type: "formula",
    keywords: ["OOIP", "STOIIP", "N", "original oil in place", "7758", "volumetric calculation", "acres feet"],
  },
  {
    title: "Bulk Volume Water — BVW = φ × Sw",
    excerpt: "BVW = φ × Sw. Sa mga reservoir na nasa irreducible water saturation, ang BVW ay halos constant kasabay ng lalim para sa isang tiyak na uri ng bato. Ang zones kung saan ang BVW = constant ay inaasahang mag-produce nang walang tubig.",
    chapterId: 4, sectionId: "sec-4-7-b", type: "formula",
    keywords: ["BVW", "bulk volume water", "irreducible water", "transition zone", "water-free production", "Swirr"],
  },
];

router.get("/search", async (req, res): Promise<void> => {
  const query = SearchContentQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const q = query.data.q.toLowerCase().trim();
  if (!q) {
    res.json(SearchContentResponse.parse({ query: query.data.q, results: [] }));
    return;
  }

  const results: {
    type: "topic" | "definition" | "formula" | "glossary";
    title: string;
    excerpt: string;
    chapterId: number | null;
    chapterTitle: string | null;
    sectionId: string | null;
  }[] = [];

  const scored: { entry: typeof results[0]; score: number }[] = [];

  // Score and search glossary from DB (fail gracefully if DB unavailable)
  try {
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
      const titleMatch = row.term.toLowerCase().includes(q);
      scored.push({
        score: titleMatch ? 10 : 5,
        entry: {
          type: "glossary",
          title: row.term,
          excerpt: row.definition,
          chapterId: row.chapterId ?? null,
          chapterTitle: row.chapterId ? (CHAPTER_TITLES[row.chapterId] ?? null) : null,
          sectionId: null,
        },
      });
    }
  } catch {
    // DB unavailable — continue with static index only
  }

  // Score and search full content index
  for (const item of FULL_CONTENT_INDEX) {
    const titleMatch = item.title.toLowerCase().includes(q);
    const excerptMatch = item.excerpt.toLowerCase().includes(q);
    const keywordMatch = item.keywords.some((kw) => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()));

    if (titleMatch || excerptMatch || keywordMatch) {
      let score = 0;
      if (titleMatch) score += 12;
      if (keywordMatch) score += 8;
      if (excerptMatch) score += 4;
      // Exact title match gets highest priority
      if (item.title.toLowerCase() === q) score += 20;

      scored.push({
        score,
        entry: {
          type: item.type,
          title: item.title,
          excerpt: item.excerpt,
          chapterId: item.chapterId,
          chapterTitle: CHAPTER_TITLES[item.chapterId] ?? null,
          sectionId: item.sectionId,
        },
      });
    }
  }

  // Sort by score descending, deduplicate by title
  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  for (const { entry } of scored) {
    const key = `${entry.title}-${entry.chapterId}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(entry);
    }
  }

  res.json(
    SearchContentResponse.parse({
      query: query.data.q,
      results,
    })
  );
});

// Autocomplete suggestions endpoint
router.get("/search/suggestions", async (req, res): Promise<void> => {
  const q = (req.query.q as string || "").toLowerCase().trim();
  if (!q || q.length < 2) {
    res.json({ suggestions: [] });
    return;
  }

  const suggestions: { title: string; chapterId: number | null; type: string }[] = [];

  for (const item of FULL_CONTENT_INDEX) {
    if (
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(q))
    ) {
      suggestions.push({
        title: item.title,
        chapterId: item.chapterId,
        type: item.type,
      });
    }
    if (suggestions.length >= 8) break;
  }

  res.json({ suggestions: suggestions.slice(0, 8) });
});

export default router;
