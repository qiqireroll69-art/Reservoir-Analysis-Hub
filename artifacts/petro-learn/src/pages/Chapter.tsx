import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useGetChapterProgress,
  useUpdateChapterProgress,
  useCreateBookmark,
  useGetGlossaryTerms,
  getGetChapterProgressQueryKey,
  getGetAllProgressQueryKey,
  getGetProgressSummaryQueryKey,
  getGetGlossaryTermsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  BrainCircuit,
  FlaskConical,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Subsection = {
  id: string;
  title: string;
  content: string[];
  list?: { term: string; description: string }[];
  noteBox?: { title: string; items: string[] };
};

type Section = {
  id: string;
  title: string;
  content: string[];
  subsections?: Subsection[];
  noteBox?: { title: string; items: string[] };
  videoAfter?: { label: string; description: string };
};

type ChapterData = {
  title: string;
  overview: string;
  sections: Section[];
  formulas: { name: string; eq: string; desc: string }[];
  terms: string[];
};

const CHAPTER_TITLES: Record<number, string> = {
  1: "Introduction to Reservoir Petrophysics",
  2: "Fundamentals of Reservoir Petrophysics",
  3: "Fluid Saturation, Wettability & Capillary Pressure",
  4: "Well Log Interpretation",
  5: "Hydrocarbon PVT Properties & Phase Behavior",
  6: "Integration of Petrophysics & Phase Behavior",
  7: "Application in Reservoir Engineering",
};

const CHAPTER_CONTENT: Record<number, ChapterData> = {
  1: {
    title: "Introduction to Reservoir Petrophysics",
    overview:
      "An introduction to the study of reservoir rocks and hydrocarbon phase behavior — the two pillars of reservoir engineering that together determine how much oil and gas is stored and how it flows.",
    sections: [
      {
        id: "sec-1-1",
        title: "What Is Reservoir Petrophysics?",
        content: [
          "Reservoir petrophysics is the study of the physical and chemical properties of reservoir rocks that control how much hydrocarbon (oil and gas) can be stored and how easily it can flow. It covers the measurement of porosity — the fraction of space available to store fluids — and permeability — the rock's ability to transmit those fluids.",
          "Alongside petrophysics, hydrocarbon phase behavior explains how oil and gas change depending on pressure and temperature conditions. It tells us whether the fluid exists as a liquid, a gas, or a mixture of both at any given point in the reservoir, and how that state changes as the reservoir is produced.",
          "The two disciplines are inseparable in modern reservoir engineering: petrophysics answers 'how much fluid is stored and how does it move?' while phase behavior answers 'what form is the fluid in and how will it behave?' Together they form the scientific foundation of all reserves estimation and production forecasting.",
        ],
        noteBox: {
          title: "The Engineering Foundation",
          items: [
            "Porosity → Storage capacity (how much fluid the reservoir holds)",
            "Permeability → Flow capacity (how fast fluid can move toward the well)",
            "Phase Behavior → Production behavior (how the fluid changes during production)",
            "Without these three, reservoir engineering is nothing more than guesswork.",
          ],
        },
      },
      {
        id: "sec-1-2",
        title: "Types of Reservoir Rocks",
        content: [
          "Most hydrocarbon reservoirs are found in two broad categories of sedimentary rock: clastics (primarily sandstone) and carbonates (limestone and dolomite). Each rock type has fundamentally different pore architectures, and this difference controls how predictable their reservoir properties are.",
        ],
        subsections: [
          {
            id: "sec-1-2-a",
            title: "Clastic Rocks (Sandstone)",
            content: [
              "Clastic rocks are formed from fragments of older rocks that have been eroded, transported, and deposited. They primarily consist of quartz grains cemented together. Their pore system is predominantly intergranular — meaning pores exist between the grains — and this makes the relationship between porosity and permeability relatively predictable and consistent.",
              "Sandstone reservoirs are well-sorted when all grains are of similar size, giving higher and more uniform porosity. They are easier to model and characterize than carbonates, and the vast majority of early oil-field reservoir engineering methods were developed specifically for sandstone systems.",
            ],
          },
          {
            id: "sec-1-2-b",
            title: "Carbonate Rocks (Limestone and Dolomite)",
            content: [
              "Carbonates are formed through chemical and biological processes — marine organisms precipitate calcium carbonate, which compacts and lithifies into limestone. After deposition, diagenetic processes (dissolution, dolomitization, fracturing) can create complex secondary pore systems including vugs (large dissolution cavities), moldic pores, and fracture networks.",
              "The porosity-permeability relationship in carbonates is highly unpredictable: two samples may have identical porosities yet vastly different permeabilities because one is fractured and the other is not. This heterogeneity makes carbonate reservoir characterization a significant engineering challenge.",
            ],
            noteBox: {
              title: "Critical Distinction",
              items: [
                "In clastics: high porosity generally means high permeability — the relationship is predictable.",
                "In carbonates: high porosity does NOT guarantee high permeability — the pore connectivity (fractures, vugs) controls flow, not just the pore volume.",
              ],
            },
          },
        ],
      },
      {
        id: "sec-1-3",
        title: "Pore Systems and Flow Behavior",
        content: [
          "Not all porosity contributes equally to fluid production. The architecture of the pore network — how pores are connected, how large the pore throats are — ultimately determines whether hydrocarbons can actually be extracted from the rock.",
        ],
        subsections: [
          {
            id: "sec-1-3-a",
            title: "Connected vs. Isolated Pores",
            content: [
              "Connected pores allow fluids to flow through the rock toward the wellbore. Isolated (or dead-end) pores store fluid but cannot contribute to production because there is no continuous pathway for that fluid to move. Only the connected (effective) pore volume counts toward producible hydrocarbon volumes.",
            ],
          },
          {
            id: "sec-1-3-b",
            title: "Types of Pore Systems",
            content: [
              "Intergranular pores (sandstone) represent the most common and predictable pore type. Flow is relatively uniform and multidirectional. Vuggy pores (carbonate) are large, sometimes poorly connected cavities formed by dissolution. They can store large volumes of fluid but may not be hydraulically connected. Fractured reservoirs can have very high permeability along fracture planes, creating fast pathways for fluid flow, but the matrix blocks between fractures may still hold the bulk of the stored hydrocarbon.",
            ],
          },
        ],
      },
      {
        id: "sec-1-4",
        title: "Methods of Reservoir Data Collection",
        content: [
          "Reliable reservoir characterization depends on integrating two complementary data sources: core analysis from the laboratory and well log measurements from downhole tools. Each has its own strengths and limitations.",
        ],
        subsections: [
          {
            id: "sec-1-4-a",
            title: "Core Analysis",
            content: [
              "Core analysis involves cutting physical rock samples from the wellbore and analyzing them in the laboratory. Routine Core Analysis (RCAL) provides direct measurements of porosity and permeability under controlled conditions. Special Core Analysis (SCAL) covers more advanced measurements including capillary pressure curves, wettability indices, and relative permeability — data essential for reservoir simulation.",
              "Core data is the most direct and accurate reservoir measurement available, but it is expensive, time-consuming, and limited to specific depth intervals. It serves as the ground truth against which well log interpretations are calibrated.",
            ],
          },
          {
            id: "sec-1-4-b",
            title: "Well Logs",
            content: [
              "Well logs provide continuous measurements of formation properties over the entire drilled interval using downhole sensing tools. Common logs include Gamma Ray (lithology and shale content), Density and Neutron (porosity), and Resistivity (fluid type and saturation). The key limitation of well logs is that they measure indirect responses — the formation's physical reaction to energy pulses — which must be interpreted using models and assumptions.",
              "The optimal approach is always to combine core and log data. Core data calibrates the log interpretation models, and logs provide spatial coverage that sparse core samples cannot. Together they produce a far more reliable reservoir description than either alone.",
            ],
          },
        ],
      },
      {
        id: "sec-1-5",
        title: "Effect of Clay on Reservoir Quality",
        content: [
          "Clay minerals are among the most significant controls on reservoir quality in clastic reservoirs. Even small amounts of clay can dramatically reduce porosity and permeability, complicate log interpretation, and lead to significant formation damage if improperly managed during drilling or completion.",
        ],
        subsections: [
          {
            id: "sec-1-5-a",
            title: "Types of Clay Distribution",
            content: [],
            list: [
              {
                term: "Dispersed Clay",
                description:
                  "Clay fills and coats the pore throats, causing the most severe reduction in permeability. Even a small volume of dispersed clay can block fluid flow almost entirely.",
              },
              {
                term: "Laminated Clay",
                description:
                  "Clay occurs as thin layers or laminates between sand beds, primarily restricting vertical flow and creating barriers to vertical permeability (kv).",
              },
              {
                term: "Structural Clay",
                description:
                  "Clay forms part of the rock matrix as grains or nodules. It is more stable and has a less severe impact on flow properties than dispersed clay.",
              },
            ],
          },
          {
            id: "sec-1-5-b",
            title: "Effects of Clay on Reservoir Properties",
            content: [
              "Clay affects virtually every important reservoir property. It reduces porosity by filling pore spaces, reduces permeability by blocking pore throats, and when swelling clays contact fresh water during drilling operations, they can cause severe and sometimes irreversible formation damage. Clay also complicates log interpretation: clay minerals carry bound water and have high natural radioactivity, which inflates apparent water saturation readings if not properly corrected.",
            ],
          },
        ],
      },
      {
        id: "sec-1-6",
        title: "Hydrocarbon Phase Behavior and Fluid Types",
        content: [
          "Oil and gas are not fixed substances — they change phase depending on the pressure and temperature of their environment. Understanding this phase behavior is critical for predicting what will flow from a well and what it will look like when it arrives at the surface.",
        ],
        subsections: [
          {
            id: "sec-1-6-a",
            title: "Key Phase Behavior Concepts",
            content: [],
            list: [
              {
                term: "Bubble Point",
                description:
                  "The pressure at which the first bubble of gas comes out of solution from an oil. Above bubble point, the oil is single-phase (undersaturated). Below it, free gas begins to form.",
              },
              {
                term: "Dew Point",
                description:
                  "The pressure at which the first drop of liquid condenses from a gas. Critical in gas condensate reservoirs where pressure depletion causes liquid dropout in the reservoir itself.",
              },
              {
                term: "Critical Point",
                description:
                  "The unique temperature and pressure at which the properties of liquid and gas become identical and indistinguishable. The bubble point curve and dew point curve meet here.",
              },
            ],
          },
          {
            id: "sec-1-6-b",
            title: "Classification of Reservoir Fluids",
            content: [
              "Reservoir fluids are classified based on their composition, their position relative to the critical point on the phase diagram, and their behavior during production. The five main types span a continuum from heavy crude oil to dry gas.",
            ],
            list: [
              {
                term: "Black Oil",
                description:
                  "The most common reservoir fluid. Heavy crude with low GOR (gas-oil ratio) and low API gravity. Stable and predictable; its initial conditions are well to the left of the critical temperature on the phase diagram.",
              },
              {
                term: "Volatile Oil",
                description:
                  "Lighter crude oil with a high concentration of intermediate hydrocarbons. High GOR and higher API gravity than black oil. Near the critical point, so significant liquid shrinkage occurs when pressure falls below bubble point.",
              },
              {
                term: "Gas Condensate",
                description:
                  "Exists as a single-phase gas in the reservoir, but liquid (condensate) forms as pressure drops below the dew point — retrograde condensation. The liquid deposits in the reservoir and may not be recoverable.",
              },
              {
                term: "Wet Gas",
                description:
                  "Gas in the reservoir that produces some liquid (condensate) at surface conditions, but remains entirely gas in the reservoir throughout production (never crosses the dew point in the reservoir).",
              },
              {
                term: "Dry Gas",
                description:
                  "Essentially pure methane with very little heavier components. Produces no liquid at surface. The simplest fluid system to analyze and produce.",
              },
            ],
          },
          {
            id: "sec-1-6-c",
            title: "Z-Factor and Vapor-Liquid Equilibrium",
            content: [
              "Real gases deviate from ideal gas behavior at high pressures and temperatures. The Z-factor (gas compressibility factor) corrects the ideal gas law for this deviation: PV = ZnRT. When Z = 1, the gas behaves ideally; for real reservoir gases, Z varies with pressure and temperature and must be determined from correlations (such as the Standing-Katz chart) or equations of state.",
              "Vapor-Liquid Equilibrium (VLE) describes the condition where gas and liquid phases coexist in thermodynamic equilibrium. VLE theory is the scientific foundation underpinning all bubble point and dew point calculations, and all PVT laboratory analysis is designed to characterize these equilibrium states under reservoir conditions.",
            ],
          },
        ],
      },
    ],
    formulas: [
      {
        name: "Porosity Definition",
        eq: "φ = Vp / Vb",
        desc: "Ratio of pore volume (Vp) to bulk volume (Vb). Expressed as a decimal or percentage.",
      },
      {
        name: "Real Gas Law (Z-factor)",
        eq: "PV = ZnRT",
        desc: "Z-factor corrects the ideal gas law for real gas behavior. Z = 1 for ideal gas, Z ≠ 1 for real gases.",
      },
      {
        name: "Original Oil in Place (OOIP)",
        eq: "N = 7758 × A × h × φ × (1 − Sw) / Bo",
        desc: "Volumetric estimate of original oil in place (STB), where A = area (acres), h = thickness (ft), φ = porosity, Sw = water saturation, Bo = oil formation volume factor.",
      },
      {
        name: "Original Gas in Place (OGIP)",
        eq: "G = 43,560 × A × h × φ × (1 − Sw) / Bg",
        desc: "Volumetric estimate of original gas in place (scf), where Bg = gas formation volume factor.",
      },
    ],
    terms: [
      "Petrophysics",
      "Porosity (φ)",
      "Permeability (k)",
      "Bubble Point Pressure (Pb)",
      "Dew Point Pressure (Pd)",
      "Z-factor (Gas Compressibility Factor)",
      "Phase Envelope",
      "Primary Porosity",
      "Secondary Porosity",
      "PVT Properties",
    ],
  },

  2: {
    title: "Fundamentals of Reservoir Petrophysics",
    overview:
      "A deep dive into the four core petrophysical properties that every reservoir engineer must master: porosity, permeability, their interrelationship, and rock compressibility.",
    sections: [
      {
        id: "sec-2-1",
        title: "2.1 Porosity",
        content: [
          "Porosity is the primary property of a reservoir rock that defines its capacity to store fluids. It represents the fraction of total rock volume occupied by void spaces — pores — that can hold oil, gas, and water. Think of it like a sponge: more holes means more fluid storage capacity.",
          "Mathematically, porosity (φ) equals pore volume divided by bulk volume. It is expressed either as a decimal (e.g., 0.25) or a percentage (e.g., 25%). Not all porosity contributes equally to production, however, which leads to the critical distinction between total and effective porosity.",
        ],
        subsections: [
          {
            id: "sec-2-1-a",
            title: "Total vs. Effective Porosity",
            content: [
              "Total porosity includes every void space in the rock, whether connected to other pores or not. This includes both connected pores through which fluids can flow, and isolated pores that are sealed off from the flow network.",
              "Effective porosity counts only the interconnected pores that can contribute to fluid flow and production. In most engineering calculations, effective porosity is the parameter that matters, because isolated pores cannot be drained. In tight carbonates, the difference between total and effective porosity can be large and has a major impact on reserves calculations.",
            ],
          },
          {
            id: "sec-2-1-b",
            title: "Primary vs. Secondary Porosity",
            content: [
              "Primary (or depositional) porosity is formed at the time the sediment is deposited. In sandstones, this is the intergranular space between grains that remains after compaction and cementation. It reflects the original packing arrangement of the sediment particles.",
              "Secondary porosity develops after the rock has been lithified, through diagenetic processes. The three main mechanisms are fracturing (tectonic stress opens cracks through the rock), dissolution (acidic groundwater dissolves soluble minerals, creating vugs and enlarged pore channels), and dolomitization (replacement of calcite by dolomite, which has a smaller molar volume and therefore creates new pore space). Secondary porosity dominates the productive capacity of most carbonate reservoirs.",
            ],
          },
          {
            id: "sec-2-1-c",
            title: "Measurement of Porosity",
            content: [
              "Core analysis provides the most direct and accurate porosity measurements. The standard approach measures bulk volume and grain volume separately, then computes pore volume from their difference. The helium porosimeter is the most widely used instrument: helium gas is injected into the core sample under controlled pressure, and Boyle's Law is used to calculate the pore volume from the pressure response.",
              "Fluid saturation methods weigh the core sample dry, then saturate it with a fluid of known density and weigh it again. The difference gives the pore volume directly. Both methods are well-established in routine core analysis and serve as calibration standards for log-derived porosity.",
            ],
          },
          {
            id: "sec-2-1-d",
            title: "Factors Controlling Porosity",
            content: [],
            list: [
              {
                term: "Grain Size and Sorting",
                description:
                  "Well-sorted sediments (uniform grain size) have higher porosity than poorly sorted sediments because small grains fill the spaces between larger ones. Grain size itself has little direct effect on porosity but strongly affects pore throat size and therefore permeability.",
              },
              {
                term: "Cementation",
                description:
                  "Cement minerals (calcite, quartz, clay) precipitate in pore spaces during diagenesis, reducing porosity. Heavy cementation can reduce a reservoir's porosity from 30% to less than 5%.",
              },
              {
                term: "Compaction",
                description:
                  "Overburden pressure crushes sediment grains together as burial depth increases, reducing pore space. Porosity typically decreases with burial depth at a rate controlled by the rock's grain strength and ductility.",
              },
              {
                term: "Dissolution and Dolomitization",
                description:
                  "In carbonates, dissolution of soluble minerals (calcite) by acidic fluids creates new pore space. Dolomitization replaces calcite with dolomite, a mineral with smaller molar volume, also creating new pore space.",
              },
              {
                term: "Clay Content",
                description:
                  "Clay minerals occupy pore space, reducing effective porosity. Swelling clays (smectite) absorb water and expand dramatically, severely reducing permeability.",
              },
              {
                term: "Diagenesis",
                description:
                  "All post-depositional physical, chemical, and biological changes to the sediment collectively alter porosity. Diagenesis can both reduce porosity (cementation, compaction) and increase it (dissolution, fracturing).",
              },
            ],
          },
        ],
        noteBox: undefined,
      },
      {
        id: "sec-2-2",
        title: "2.2 Permeability",
        content: [
          "While porosity measures how much fluid a rock can store, permeability measures how easily that fluid can flow through the rock. A reservoir can have excellent porosity but remain economically unproductive if permeability is too low to allow fluid to flow to the wellbore at commercial rates.",
          "Permeability (k) is measured in Darcies (D) or milliDarcies (mD). Most commercial oil and gas reservoirs have permeabilities ranging from 1 mD to several thousand mD. Tight gas formations may have permeabilities measured in microDarcies (μD) or nanoDarcies (nD), requiring hydraulic fracturing to be economic.",
        ],
        subsections: [
          {
            id: "sec-2-2-a",
            title: "Types of Permeability",
            content: [],
            list: [
              {
                term: "Absolute Permeability (k)",
                description:
                  "The permeability of the rock when 100% saturated with a single fluid. It is a pure rock property, independent of the fluid type. Measured on dry core samples using gas or brine.",
              },
              {
                term: "Effective Permeability (k_eff)",
                description:
                  "The permeability to a specific fluid (oil, water, or gas) when two or more fluids are present simultaneously. Always less than absolute permeability. Depends on both rock properties and fluid saturations.",
              },
              {
                term: "Relative Permeability (k_r)",
                description:
                  "The ratio of effective permeability to absolute permeability: k_r = k_eff / k. A dimensionless number between 0 and 1 that quantifies how the presence of one fluid phase impedes the flow of another. Fundamental to all multiphase reservoir engineering calculations.",
              },
            ],
          },
          {
            id: "sec-2-2-b",
            title: "Darcy's Law",
            content: [
              "Darcy's Law, established experimentally by Henry Darcy in 1856, is the fundamental equation governing fluid flow through porous media. It states that flow rate is directly proportional to permeability and pressure gradient, and inversely proportional to fluid viscosity.",
              "In its linear form: Q = (k × A × ΔP) / (μ × L), where Q is the volumetric flow rate, k is permeability, A is cross-sectional area perpendicular to flow, ΔP is the pressure difference across the flow path, μ is fluid viscosity, and L is the length of the flow path. Darcy's Law assumes laminar, single-phase, incompressible flow — conditions that hold for most practical reservoir engineering calculations.",
            ],
          },
          {
            id: "sec-2-2-c",
            title: "Directional Permeability",
            content: [
              "Permeability is not always the same in all directions. In layered sediments, horizontal permeability (k_h) — measured parallel to the sedimentary layers — is typically much higher than vertical permeability (k_v). The ratio k_v/k_h can range from 0.1 in well-bedded sandstones to nearly 0 in thinly laminated formations with clay-rich barriers.",
              "Vertical permeability critically controls water and gas coning — the tendency of underlying water or overlying gas cap gas to be drawn into the producing well. Low k_v reduces coning tendency and extends the economic production life of the well.",
            ],
          },
          {
            id: "sec-2-2-d",
            title: "Factors Affecting Permeability",
            content: [],
            list: [
              {
                term: "Grain Size and Sorting",
                description:
                  "Larger, well-sorted grains create larger pore throats and higher permeability. Fine-grained, poorly sorted sediments have small, tortuous pore throats and low permeability.",
              },
              {
                term: "Cementation",
                description:
                  "Cement bridges pore throats and dramatically reduces permeability even when porosity remains moderate. Permeability is far more sensitive to cementation than porosity.",
              },
              {
                term: "Clay Content",
                description:
                  "Dispersed clay in pore throats is the most damaging. Swelling clays can reduce permeability by orders of magnitude when they contact fresh water during drilling or workover operations.",
              },
              {
                term: "Fractures",
                description:
                  "Natural fractures can increase bulk permeability by several orders of magnitude, dominating fluid flow in tight matrix carbonates. Fracture permeability is highly sensitive to effective stress changes during production.",
              },
            ],
          },
          {
            id: "sec-2-2-e",
            title: "Laboratory Measurement of Permeability",
            content: [
              "The steady-state core flooding method is the standard technique: fluid is injected at a constant rate until pressure drop stabilizes, then Darcy's Law is applied to calculate permeability. Parameters measured include flow rate (Q), pressure drop (ΔP), fluid viscosity (μ), and core dimensions (cross-sectional area A and length L).",
              "Gas permeability measurements require a correction for the Klinkenberg effect: at low pressures, gas molecules slip along pore walls (gas slippage), resulting in apparent permeability higher than the true liquid-equivalent permeability. Liquid permeability is always the more representative value for reservoir conditions and is obtained by correcting gas measurements to infinite pressure or by measuring directly with brine.",
            ],
          },
        ],
        noteBox: {
          title: "Engineering Significance of Permeability",
          items: [
            "Well productivity index (PI) — how much oil per day per psi of drawdown",
            "Pressure transient behavior — shape of pressure buildup/drawdown curves",
            "Recovery efficiency — how completely hydrocarbons can be swept from the reservoir",
            "Stimulation needs — reservoirs with k < 1 mD typically require hydraulic fracturing to produce commercially",
          ],
        },
      },
      {
        id: "sec-2-3",
        title: "2.3 Porosity-Permeability Relationships",
        content: [
          "The relationship between porosity and permeability is one of the most studied — and most misunderstood — topics in petrophysics. While the two properties are correlated in many rock types, the strength of that correlation varies dramatically between sandstones and carbonates.",
        ],
        subsections: [
          {
            id: "sec-2-3-a",
            title: "Empirical Correlations in Sandstones",
            content: [
              "In clean sandstones, permeability and porosity are typically strongly correlated and often follow an exponential relationship when plotted on a semi-logarithmic scale. This allows the creation of reliable empirical models that can predict permeability from porosity logs in the absence of core data.",
              "The physical reason for this correlation is that both properties are controlled by the same underlying rock fabric — grain size and packing arrangement. Larger, more uniformly packed grains simultaneously create more pore volume (higher porosity) and larger pore throats (higher permeability).",
            ],
          },
          {
            id: "sec-2-3-b",
            title: "Carbonate Complexity",
            content: [
              "In carbonates, the porosity-permeability correlation is notoriously unreliable. Two core samples from the same formation can have identical porosities yet differ by four orders of magnitude in permeability. This occurs because permeability in carbonates is controlled primarily by pore geometry and connectivity — the size and tortuosity of pore throats — rather than by total pore volume.",
              "A vuggy carbonate may have 20% porosity but very low permeability if the vugs are isolated and not connected by permeable pore throats. Conversely, a fractured carbonate with only 5% porosity can have extremely high permeability because fractures provide high-conductivity flow pathways.",
            ],
          },
          {
            id: "sec-2-3-c",
            title: "Rock Fabric and Pore Geometry Controls",
            content: [
              "The most important controls on permeability are not the total amount of pore space, but rather the geometry of the pore network: pore throat size distribution, the tortuosity of flow paths, and the arrangement of grains (grain packing). Rock fabric — the microscopic arrangement of grains and pores — determines pore throat sizes, which in turn govern both permeability and capillary pressure behavior.",
            ],
            noteBox: {
              title: "Clastics vs. Carbonates Summary",
              items: [
                "Clastics: Intergranular pore system → High predictability → Strong porosity-permeability correlation",
                "Carbonates: Vug/fracture pore system → Low predictability → Weak or absent correlation",
                "Rule: Rock fabric controls permeability more than pore volume does.",
              ],
            },
          },
        ],
      },
      {
        id: "sec-2-4",
        title: "2.4 Rock Compressibility",
        content: [
          "Rock compressibility is the fractional change in pore volume per unit change in reservoir pressure. As fluid is produced and reservoir pressure declines, the effective overburden stress on the rock matrix increases, causing the pore space to compact. This mechanism, although small on a per-pore basis, can become a significant energy source in large reservoirs — the compaction drive mechanism.",
        ],
        subsections: [
          {
            id: "sec-2-4-a",
            title: "Types of Compressibility",
            content: [],
            list: [
              {
                term: "Grain Compressibility",
                description:
                  "The compressibility of the solid mineral grains themselves under stress. Typically very small and often neglected in engineering calculations.",
              },
              {
                term: "Pore Volume Compressibility (cf)",
                description:
                  "The fractional reduction in pore volume per unit decrease in reservoir pressure. This is the most important compressibility parameter in reservoir engineering: cf = (1/Vp)(dVp/dP). Typical values range from 3 × 10⁻⁶ psi⁻¹ for hard, consolidated rocks to 15 × 10⁻⁶ psi⁻¹ for soft, unconsolidated sands.",
              },
              {
                term: "Bulk Compressibility",
                description:
                  "The total fractional volume change of the rock (solid + pores) under a change in pressure. Includes contributions from both grain and pore compressibility.",
              },
            ],
          },
          {
            id: "sec-2-4-b",
            title: "Compaction Mechanisms",
            content: [
              "As reservoir pressure declines, several micro-scale mechanisms compact the rock. Grain rotation and closer packing reduces pore space. Ductile grains (such as clay minerals or mica) deform plastically under stress. At high stresses, brittle grains fracture and the fragments fill pore space. Pressure solution at grain contacts causes local dissolution and grain compaction.",
            ],
          },
          {
            id: "sec-2-4-c",
            title: "Engineering Importance",
            content: [
              "Rock compressibility enters the material balance equation as an energy term. In highly compressible formations (chalk reservoirs, unconsolidated sands), compaction provides a substantial fraction of reservoir drive energy. The Ekofisk chalk field in the North Sea is the classic example — compaction drive contributed dramatically to production and also caused several meters of seafloor subsidence above the field, requiring platform raising operations.",
              "For most conventional reservoirs, the combined compressibility of oil, gas, and water dominates, and rock compressibility is a secondary effect. However, it must never be ignored in undersaturated oil reservoirs above bubble point, where rock and water expansion are the only drive mechanisms.",
            ],
          },
        ],
        noteBox: {
          title: "Chapter Key Relationships",
          items: [
            "Porosity → measures fluid storage capacity (how much can it hold?)",
            "Permeability → measures fluid flow capacity (how fast can it flow?)",
            "Compressibility → controls pore volume change with pressure (how does it compress?)",
            "High porosity does NOT guarantee high permeability — pore connectivity is what matters.",
          ],
        },
      },
    ],
    formulas: [
      {
        name: "Porosity",
        eq: "φ = Vp / Vb = (Vb − Vg) / Vb",
        desc: "Pore volume (Vp) divided by bulk volume (Vb). Grain volume Vg = Vb − Vp.",
      },
      {
        name: "Pore Volume from Grain Volume",
        eq: "Vp = Vb − Vg",
        desc: "Pore volume is the difference between bulk volume and grain volume.",
      },
      {
        name: "Darcy's Law (Linear Flow)",
        eq: "Q = −(k × A / μ) × (ΔP / L)",
        desc: "Q = flow rate (cm³/s), k = permeability (Darcy), A = area (cm²), μ = viscosity (cP), ΔP = pressure drop (atm), L = length (cm).",
      },
      {
        name: "Relative Permeability",
        eq: "k_r = k_eff / k_abs",
        desc: "Dimensionless ratio (0–1) of effective permeability to absolute permeability at a given fluid saturation.",
      },
      {
        name: "Pore Volume Compressibility",
        eq: "c_f = (1 / Vp) × (dVp / dP)",
        desc: "Fractional change in pore volume per unit change in reservoir pressure. Units: psi⁻¹.",
      },
    ],
    terms: [
      "Total Porosity",
      "Effective Porosity",
      "Primary Porosity",
      "Secondary Porosity",
      "Absolute Permeability",
      "Effective Permeability",
      "Relative Permeability (kr)",
      "Darcy's Law",
      "Tortuosity",
      "Cementation Exponent (m)",
      "Formation Factor (F)",
      "Pore Volume Compressibility (cf)",
    ],
  },

  3: {
    title: "Fluid Saturation, Wettability, and Capillary Pressure",
    overview:
      "Understanding how oil, water, and gas compete for pore space — the saturation concept — and the surface forces that control fluid distribution, displacement, and ultimate recovery.",
    sections: [
      {
        id: "sec-3-1",
        title: "Fluid Saturation Fundamentals",
        content: [
          "Fluid saturation describes the fraction of the pore volume occupied by each fluid phase. Since the total pore volume is fixed, the saturations of all fluids present must always sum to 1.0 (100%). Understanding saturation at every point in the reservoir is essential for calculating hydrocarbon volumes and predicting production behavior.",
        ],
        subsections: [
          {
            id: "sec-3-1-a",
            title: "Saturation Definitions",
            content: [],
            list: [
              {
                term: "Water Saturation (Sw)",
                description:
                  "Fraction of pore volume occupied by water. The most important saturation parameter — directly used to calculate hydrocarbon volume from the relation: Sh = 1 − Sw.",
              },
              {
                term: "Oil Saturation (So)",
                description:
                  "Fraction of pore volume occupied by oil. In the oil pay zone, So is high (and Sw is low). So decreases during water flooding as water displaces oil.",
              },
              {
                term: "Gas Saturation (Sg)",
                description:
                  "Fraction of pore volume occupied by gas. Increases as reservoir pressure drops below the bubble point and free gas forms from solution.",
              },
              {
                term: "Saturation Balance",
                description:
                  "Sw + So + Sg = 1.0. Since pore volume is fixed, an increase in any one phase must be accompanied by a decrease in at least one other. This constraint drives all material balance calculations.",
              },
            ],
          },
          {
            id: "sec-3-1-b",
            title: "Critical and Residual Saturations",
            content: [],
            list: [
              {
                term: "Irreducible (Connate) Water Saturation (Swirr)",
                description:
                  "The minimum water saturation retained in the rock by capillary and adsorptive forces, which cannot be displaced regardless of the pressure applied. It occupies the smallest pore throats and grain surface films. Swirr is the initial water saturation in the oil and gas pay zone.",
              },
              {
                term: "Residual Oil Saturation (Sor)",
                description:
                  "The oil remaining trapped in pore spaces after water flooding, as isolated ganglia held by capillary forces. Sor represents oil that cannot be produced by conventional waterflooding — it is the target of Enhanced Oil Recovery (EOR) methods.",
              },
              {
                term: "Critical Gas Saturation (Sgc)",
                description:
                  "The minimum gas saturation required before gas becomes hydraulically continuous and begins to flow. Below Sgc, gas exists as isolated bubbles and cannot be produced.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-3-2",
        title: "Wettability",
        content: [
          "Wettability is the tendency of a rock surface to preferentially contact one fluid over another in a multiphase system. It is arguably the single most important rock-fluid interaction parameter because it controls initial fluid distribution in the pore space, the shapes of relative permeability curves, and the efficiency of waterflood displacement.",
        ],
        subsections: [
          {
            id: "sec-3-2-a",
            title: "Wettability States",
            content: [],
            list: [
              {
                term: "Water-Wet System",
                description:
                  "Water coats the grain surfaces and fills the smaller pore spaces. Oil occupies the centers of the larger pores. Most clastic reservoir rocks are naturally water-wet. Waterflood recovery is typically most efficient in water-wet systems.",
              },
              {
                term: "Oil-Wet System",
                description:
                  "Oil coats the grain surfaces. The wettability has been altered by polar organic compounds in the crude oil adsorbing onto rock surfaces. Many carbonate reservoirs exhibit oil-wet or mixed-wet behavior, complicating waterflood design.",
              },
              {
                term: "Mixed-Wet System",
                description:
                  "Parts of the pore system are water-wet and parts are oil-wet. Larger pores contacted by oil tend to become oil-wet; smaller pores always water-wet. Mixed wettability is actually the most common state found in real reservoirs after oil migration.",
              },
            ],
          },
          {
            id: "sec-3-2-b",
            title: "Measuring Wettability",
            content: [
              "The contact angle (θ) measured through the denser fluid at the solid–fluid–fluid interface quantifies wettability. θ < 75° indicates water-wet, θ > 105° indicates oil-wet, and 75° < θ < 105° is intermediate. The Amott wettability index and the USBM (US Bureau of Mines) index are the standard laboratory measurements used on core samples, integrating spontaneous and forced imbibition/drainage tests.",
            ],
          },
        ],
      },
      {
        id: "sec-3-3",
        title: "Capillary Pressure",
        content: [
          "Capillary pressure (Pc) is the pressure difference across the curved interface between two immiscible fluids in a pore space. It arises from interfacial tension (σ) — the surface energy at the fluid-fluid interface — and the curvature of that interface, which is controlled by pore throat radius and wettability.",
          "Capillary pressure governs the initial distribution of fluids in the reservoir before production, controls the height of the transition zone between water and hydrocarbon zones, and determines the minimum pore throat size through which hydrocarbons can enter (the entry pressure).",
        ],
        subsections: [
          {
            id: "sec-3-3-a",
            title: "The Capillary Pressure Curve",
            content: [
              "A capillary pressure curve relates Pc to water saturation (Sw). It is measured in the laboratory using mercury injection (MICP), porous plate, or centrifuge methods. The shape of the curve reveals the pore size distribution: a steep, narrow curve indicates a well-sorted rock with uniform pore throats; a gradual, broad curve indicates a poorly sorted rock with a wide range of pore throat sizes.",
              "The entry pressure (displacement pressure, Pd) is the minimum capillary pressure at which the non-wetting phase (oil or gas) can first enter the largest pore throats. Seal integrity is determined by the entry pressure of the caprock — gas or oil cannot migrate through the seal until Pc exceeds the caprock entry pressure.",
            ],
          },
          {
            id: "sec-3-3-b",
            title: "Free Water Level and Transition Zone",
            content: [
              "The Free Water Level (FWL) is the depth in the reservoir where capillary pressure is zero — where oil and water are in pressure equilibrium. The Oil-Water Contact (OWC) is typically several feet above the FWL, at the depth where Pc equals the entry pressure of the reservoir rock.",
              "Between the FWL and the top of the transition zone, water saturation decreases progressively from 100% upward. The thickness of the transition zone depends on the rock's capillary pressure curve and the density difference between oil and water. Fine-grained rocks with high capillary pressures have thick transition zones; coarse-grained rocks have thin, sharp contacts.",
            ],
          },
          {
            id: "sec-3-3-c",
            title: "The Leverett J-Function",
            content: [
              "The Leverett J-function normalizes capillary pressure data from different rock samples by accounting for the effects of permeability, porosity, interfacial tension, and contact angle. This allows capillary pressure curves from different samples in the same reservoir to be compared and merged into a single representative curve for the reservoir.",
            ],
          },
        ],
      },
      {
        id: "sec-3-4",
        title: "Relative Permeability",
        content: [
          "Relative permeability (kr) quantifies the ability of one fluid phase to flow through a porous medium in the presence of other fluid phases. It is defined as the ratio of the effective permeability to a given phase at a specific saturation to the absolute permeability of the rock. Values range from 0 (that phase cannot flow) to 1 (single-phase flow, no other fluid present).",
          "Relative permeability curves are fundamental inputs to reservoir simulation and govern the economics of oil production. They determine water-oil and gas-oil ratios produced from wells, the efficiency of water flooding, and the timing of water breakthrough.",
        ],
        subsections: [
          {
            id: "sec-3-4-a",
            title: "Key Features of Relative Permeability Curves",
            content: [],
            list: [
              {
                term: "Endpoint k_ro at Swirr",
                description:
                  "The maximum relative permeability to oil, occurring when water saturation is at its irreducible minimum. This endpoint directly reflects the quality of the reservoir rock for oil production.",
              },
              {
                term: "Endpoint k_rw at Sor",
                description:
                  "The maximum relative permeability to water, occurring when residual oil saturation is reached. High values indicate efficient water flow at the end of flooding.",
              },
              {
                term: "Crossover Point",
                description:
                  "The saturation at which k_ro and k_rw are equal. At saturations above the crossover point, more water than oil flows. The crossover saturation correlates with wettability — oil-wet rocks cross over at low water saturations.",
              },
            ],
          },
          {
            id: "sec-3-4-b",
            title: "Drainage and Imbibition",
            content: [
              "Drainage refers to processes where the non-wetting phase (oil or gas) displaces the wetting phase (water). This occurred naturally during hydrocarbon migration into the reservoir and also describes gas injection processes. Imbibition is the reverse — the wetting phase displaces the non-wetting phase. Waterflooding is an imbibition process in water-wet reservoirs.",
              "Hysteresis means that the relative permeability and capillary pressure curves for drainage and imbibition are different — the rock does not return to its original state when the process is reversed. This has important implications for EOR processes and reservoir simulation.",
            ],
          },
        ],
      },
      {
        id: "sec-3-5",
        title: "Mobility and Displacement Efficiency",
        content: [
          "Mobility (λ) of a fluid phase is defined as its relative permeability divided by its viscosity. It determines how easily that fluid flows relative to other phases present in the reservoir.",
        ],
        subsections: [
          {
            id: "sec-3-5-a",
            title: "Mobility Ratio and Its Consequences",
            content: [
              "The Mobility Ratio (M) compares the mobility of the displacing fluid (typically water or gas) to the mobility of the displaced fluid (oil). M = λ_displacing / λ_displaced.",
              "When M < 1, the displaced fluid (oil) is more mobile than the displacing fluid — the displacement front is stable, and the oil is swept out efficiently ahead of the waterfront. When M > 1, the displacing fluid is more mobile than the oil — the front is unstable and breaks into irregular 'fingers' that bypass unswept oil. This fingering leads to early water breakthrough and poor sweep efficiency.",
            ],
            list: [
              {
                term: "Favorable Mobility Ratio (M < 1)",
                description:
                  "Stable displacement front. Water moves evenly through the reservoir, sweeping oil ahead of it efficiently. Achieved when oil viscosity is low or when polymer is added to increase water viscosity.",
              },
              {
                term: "Unfavorable Mobility Ratio (M > 1)",
                description:
                  "Viscous fingering occurs — water breaks through to the producing well prematurely while large volumes of oil remain unswept. Common in heavy oil reservoirs. Leads to high water-oil ratios and poor recovery efficiency.",
              },
            ],
          },
          {
            id: "sec-3-5-b",
            title: "Sweep Efficiency and EOR",
            content: [
              "Sweep efficiency measures the fraction of the reservoir volume contacted by the displacing fluid. Poor sweep leads to oil being bypassed and left in the reservoir. Achieving high sweep efficiency requires a favorable mobility ratio, good reservoir homogeneity, and proper well placement.",
              "Enhanced Oil Recovery (EOR) methods specifically target the improvement of sweep efficiency and reduction of residual oil saturation. Chemical flooding (polymers, surfactants) alters mobility ratios and wettability; thermal methods (steam injection) reduce oil viscosity; miscible gas injection reduces or eliminates interfacial tension and residual oil.",
            ],
          },
        ],
      },
      {
        id: "sec-3-6",
        title: "Fluid Contacts and Reservoir Zonation",
        content: [
          "The vertical distribution of fluids in a reservoir is governed by the interplay of gravity (which separates fluids by density) and capillary forces (which work against gravity to retain wetting-phase fluid in small pores above the FWL). This creates a characteristic vertical saturation profile.",
        ],
        subsections: [
          {
            id: "sec-3-6-a",
            title: "Fluid Contact Definitions",
            content: [],
            list: [
              {
                term: "Oil-Water Contact (OWC)",
                description:
                  "The depth at which log-based water saturation rises sharply toward 100% water. Practically defined as the deepest depth at which oil is producible. Located above the Free Water Level.",
              },
              {
                term: "Gas-Oil Contact (GOC)",
                description:
                  "The boundary between the gas cap (free gas above the bubble point) and the oil zone. Defined by log response — typically a dramatic decrease in density and a neutron-density crossover.",
              },
              {
                term: "Transition Zone",
                description:
                  "The reservoir interval between the FWL and the OWC where both oil and water are mobile and water saturation decreases gradually from 100% upward. The thickness depends on rock quality — tight rocks have thick transition zones; high-permeability rocks have thin, sharp contacts.",
              },
            ],
          },
        ],
      },
    ],
    formulas: [
      {
        name: "Saturation Balance",
        eq: "Sw + So + Sg = 1.0",
        desc: "All fluid phases must sum to 1.0 (or 100%). A change in one saturation requires a corresponding change in another.",
      },
      {
        name: "Young-Laplace Capillary Pressure",
        eq: "Pc = 2σ cos θ / r",
        desc: "σ = interfacial tension, θ = contact angle, r = pore throat radius. Pc increases as pore throat size decreases.",
      },
      {
        name: "Leverett J-Function",
        eq: "J(Sw) = (Pc / σ cos θ) × √(k / φ)",
        desc: "Normalizes capillary pressure curves to allow comparison between different samples and rock types.",
      },
      {
        name: "Fluid Mobility",
        eq: "λ = k_r / μ",
        desc: "Mobility of a fluid phase (λ) equals its relative permeability (k_r) divided by its viscosity (μ, in cP).",
      },
      {
        name: "Mobility Ratio",
        eq: "M = λ_displacing / λ_displaced = (k_r_d / μ_d) / (k_r_o / μ_o)",
        desc: "M < 1 → stable displacement; M > 1 → viscous fingering and poor sweep efficiency.",
      },
    ],
    terms: [
      "Water Saturation (Sw)",
      "Oil Saturation (So)",
      "Irreducible (Connate) Water Saturation (Swirr)",
      "Residual Oil Saturation (Sor)",
      "Wettability",
      "Contact Angle (θ)",
      "Interfacial Tension (σ)",
      "Capillary Pressure (Pc)",
      "Free Water Level (FWL)",
      "Relative Permeability (kr)",
      "Mobility Ratio",
      "Leverett J-function",
    ],
  },

  4: {
    title: "Well Log Interpretation",
    overview:
      "Well logs are the eyes of the reservoir engineer — continuous records of formation properties from surface to total depth. This chapter covers the principal logging tools, how to interpret them for lithology, porosity, and fluid saturation, and how to determine net pay.",
    sections: [
      {
        id: "sec-4-1",
        title: "Introduction to Well Logging",
        content: [
          "A well log is a continuous record of the physical response of a formation to energy transmitted by a downhole measurement tool, plotted as a function of depth. Logs are acquired after drilling and before casing the borehole (open-hole logs) or after casing has been set (cased-hole logs).",
          "Modern well logging provides the only practical way to characterize reservoir properties over the entire drilled interval. While core data gives the most direct measurements, it is limited to short intervals and is expensive. Logs fill the gaps, providing data at every depth.",
        ],
        subsections: [
          {
            id: "sec-4-1-a",
            title: "Types of Logging Operations",
            content: [],
            list: [
              {
                term: "Open-Hole Logging (Wireline)",
                description:
                  "Tools are lowered into the uncased wellbore on an electrical cable (wireline) after drilling is complete. Provides the most comprehensive suite of measurements because the formation is in direct contact with the measuring device.",
              },
              {
                term: "Cased-Hole Logging",
                description:
                  "Measurements taken after steel casing has been cemented in place. Used for monitoring production, detecting fluid movement behind casing, and well integrity verification. Tools must measure through steel and cement, reducing accuracy.",
              },
              {
                term: "Logging While Drilling (LWD) / Measurement While Drilling (MWD)",
                description:
                  "Sensors built into the drill collar acquire real-time formation data during drilling. Eliminates borehole deterioration issues and provides immediate geological guidance for geosteering horizontal wells.",
              },
            ],
          },
        ],
        videoAfter: {
          label: "Lecture Video",
          description:
            "Introduction to Well Logging — Tool Types, Acquisition Methods, and the Wireline Process",
        },
      },
      {
        id: "sec-4-2",
        title: "Gamma Ray Log — Lithology and Shale Volume",
        content: [
          "The Gamma Ray (GR) log measures the natural radioactivity of formations in API units. Radioactivity comes primarily from three elements: potassium (K-40) in clay minerals, uranium (U), and thorium (Th). Because shales are clay-rich, they have high GR readings (typically 75–150 API). Clean sands, limestones, and dolomites have low GR readings (typically 10–30 API). This contrast makes the GR log the primary lithology indicator and the most universally used log in the petroleum industry.",
          "Evaporites (anhydrite, salt, clean carbonates) have very low GR values because they contain almost no potassium, uranium, or thorium. Some clean sands with feldspathic or arkosic content may show elevated GR, which must be distinguished from shale using the spectral GR log.",
        ],
        subsections: [
          {
            id: "sec-4-2-a",
            title: "Shale Volume Calculation",
            content: [
              "The GR index (IGR) normalizes the raw GR reading between the clean sand baseline (GR_min) and the shale line (GR_max). From this, the shale volume (Vsh) is estimated using one of several empirical correlations. The linear relationship is the simplest: Vsh = IGR = (GR_log − GR_min) / (GR_max − GR_min). More sophisticated corrections apply non-linear transforms for older or compacted formations.",
              "Vsh is then used to apply shale corrections to porosity and water saturation calculations, since clay-rich zones reduce resistivity (causing Sw overestimation) and increase apparent neutron porosity (causing φ overestimation).",
            ],
          },
        ],
      },
      {
        id: "sec-4-3",
        title: "Resistivity Logs — Fluid Identification",
        content: [
          "Resistivity logs measure how strongly a formation opposes the flow of electrical current. Salt water is an excellent conductor (low resistivity), while hydrocarbons and cemented rock are resistors (high resistivity). This contrast is the fundamental basis for distinguishing oil-bearing zones from water-bearing zones using logs.",
          "The true formation resistivity (Rt) represents the undisturbed zone deep in the formation, beyond the reach of drilling fluid invasion. Modern deep resistivity tools (induction and laterolog) measure Rt by sending alternating electromagnetic fields into the formation. Shallow resistivity tools measure the flushed zone (Rxo) near the wellbore, where original fluids have been displaced by drilling fluid filtrate.",
        ],
        subsections: [
          {
            id: "sec-4-3-a",
            title: "Invasion and the Resistivity Profile",
            content: [
              "When drilling fluid pressure exceeds formation pressure, mud filtrate invades the formation, displacing original fluids from pore spaces near the wellbore. This creates three zones: the flushed zone (Rxo) immediately adjacent to the borehole where mud filtrate has replaced most original fluids; the invaded zone with intermediate resistivity; and the uninvaded (virgin) zone with true resistivity Rt. Understanding this profile is essential for correctly estimating Sw from logs.",
            ],
          },
          {
            id: "sec-4-3-b",
            title: "Rw Determination",
            content: [
              "The formation water resistivity (Rw) is required for Archie's equation and must be determined independently. Sources include: direct measurement of produced water, SP log analysis, Pickett plot crossplot method, or catalog values for the area. Rw varies with formation water salinity and temperature, and errors in Rw propagate directly into errors in calculated Sw.",
            ],
          },
        ],
        videoAfter: {
          label: "Supplementary Video",
          description:
            "Reading Resistivity Logs — Identifying Hydrocarbon Zones vs. Water Zones and Understanding Invasion Profiles",
        },
      },
      {
        id: "sec-4-4",
        title: "Porosity Logs — Neutron, Density, and Sonic",
        content: [
          "Three independent tools provide porosity estimates from different physical measurements. Used together, they cross-check each other, identify lithology, and detect gas. No single porosity log is definitive — the combination of at least two is the standard of practice.",
        ],
        subsections: [
          {
            id: "sec-4-4-a",
            title: "Neutron Porosity Log (ΦN)",
            content: [
              "The neutron tool bombards the formation with high-energy neutrons. These neutrons slow down primarily by colliding with hydrogen atoms (since hydrogen and neutron have nearly the same mass). The measured hydrogen index is converted to porosity, because hydrogen in the pore space comes from water, oil, or gas.",
              "The key effects to understand: shales have high apparent neutron porosity because clay minerals contain bound water hydrogen. Gas causes a characteristic 'gas effect' — gas has lower hydrogen content per unit volume than liquid, so neutron porosity reads low in gas zones. This creates the diagnostic neutron-density crossover when overlaid with the density log.",
            ],
          },
          {
            id: "sec-4-4-b",
            title: "Density Log (ΦD) and Bulk Density",
            content: [
              "The density tool measures formation bulk density (ρb) by bombarding the formation with gamma rays and measuring the scattered gamma ray intensity. Bulk density is a direct function of matrix density, fluid density, and porosity. Porosity is calculated from: ΦD = (ρma − ρb) / (ρma − ρfl), where ρma is the grain/matrix density and ρfl is the fluid density.",
              "Matrix density values: sandstone 2.65 g/cm³, limestone 2.71 g/cm³, dolomite 2.87 g/cm³. Gas causes a significant density decrease (low ρb) because gas density is much lower than liquid density. Combined neutron-density analysis is the most powerful lithology and porosity tool available.",
            ],
          },
          {
            id: "sec-4-4-c",
            title: "Sonic Log (ΦS) and Interval Transit Time",
            content: [
              "The sonic tool measures the interval transit time (Δt, in μs/ft) — the time for a compressional acoustic wave to travel one foot through the formation. Tight, fast formations (low porosity, hard rock) have low Δt values (~50 μs/ft for limestone). Porous formations have high Δt values (~100+ μs/ft).",
              "Wyllie's time-average equation: 1/Δt = φ/Δtfl + (1−φ)/Δtma, allows porosity to be estimated from the transit time. The sonic log is particularly valuable for fracture identification, lithology determination, and as the primary seismic-to-well tie calibration tool.",
            ],
          },
          {
            id: "sec-4-4-d",
            title: "Neutron-Density Crossover (Gas Detection)",
            content: [
              "In a liquid-saturated formation, neutron and density porosities agree closely. In a gas zone, two opposing effects occur simultaneously: the neutron reads low (gas has low hydrogen index) and the density reads high porosity (gas has low density). When neutron porosity tracks lower than density porosity on the log display, this neutron-density crossover is a powerful indicator of gas. This crossover effect is the most reliable qualitative gas indicator from logs.",
            ],
          },
        ],
      },
      {
        id: "sec-4-5",
        title: "Water Saturation — Archie's Equations",
        content: [
          "Archie's equations (1942) are the cornerstone of quantitative well log interpretation. They relate the electrical resistivity of a water-saturated rock to its porosity and water resistivity (first law), and extend this to water saturation in a partially hydrocarbon-saturated rock (second law).",
          "Archie's work recognized that a clean (shale-free) formation's resistivity is controlled by the conducting water in the pore space, which provides the current pathway. The more pore space there is, and the more of it is filled with conductive water, the lower the resistivity.",
        ],
        subsections: [
          {
            id: "sec-4-5-a",
            title: "Archie's First Law — Formation Factor",
            content: [
              "Formation Factor (F) = Ro / Rw = a / φ^m. Ro is the resistivity of the formation when 100% water-saturated; Rw is the resistivity of the formation water; a is the tortuosity factor (commonly 1.0 for sandstones); φ is porosity; m is the cementation exponent (typically 1.7–2.0 for sandstones, 2.0–2.5 for carbonates).",
              "The formation factor reflects the geometry of the pore network — how tortuous and constricted the pathways are. A high formation factor means the pore network is complex and tortuous, restricting current flow more than the water alone would.",
            ],
          },
          {
            id: "sec-4-5-b",
            title: "Archie's Second Law — Water Saturation",
            content: [
              "Sw^n = (F × Rw) / Rt = (a × Rw) / (φ^m × Rt), where Rt is the true formation resistivity and n is the saturation exponent (typically 2.0). This equation is solved for Sw: Sw = [(a × Rw) / (φ^m × Rt)]^(1/n).",
              "Archie's equation is strictly valid only for clean (shale-free) formations. Shale introduces additional conduction pathways that lower resistivity and cause Archie's equation to overestimate Sw (underestimate hydrocarbon content). Corrected equations — the Waxman-Smits model and the Dual Water model — account for this shaly sand problem.",
            ],
          },
          {
            id: "sec-4-5-c",
            title: "The Shaly Sand Problem",
            content: [
              "In shaly sands, clay minerals provide additional electrical conductivity — clay surfaces are coated with exchangeable cations that allow current to flow even in the absence of free water. This additional conduction path lowers the measured Rt below what it would be if only the pore water were conducting. If Archie's clean-sand equation is applied without correction, Sw will be significantly overestimated, and a productive pay zone may be incorrectly classified as a water zone.",
            ],
          },
        ],
      },
      {
        id: "sec-4-6",
        title: "Advanced Log Tools — NMR and Log Facies",
        content: [
          "Modern logging has evolved far beyond the basic suite. Nuclear Magnetic Resonance (NMR) logging and advanced data analysis techniques provide capabilities impossible with conventional tools.",
        ],
        subsections: [
          {
            id: "sec-4-6-a",
            title: "NMR Logging",
            content: [
              "The NMR log measures the relaxation time of hydrogen nuclei in the pore fluid after excitation by a magnetic pulse. It directly measures the pore size distribution, providing estimates of total porosity, free fluid index (FFI — the producible fluid fraction), and bound volume irreducible (BVI — the irreducible water fraction). NMR also provides a permeability estimate independent of resistivity — a unique capability among logging tools.",
              "NMR is particularly powerful in complex lithologies (carbonates, tuffaceous sands) where conventional porosity logs are unreliable, and in formations where determining whether water is producible or bound requires distinguishing FFI from BVI.",
            ],
          },
          {
            id: "sec-4-6-b",
            title: "Log Facies and Electrofacies",
            content: [
              "Log facies are characteristic patterns on log curves that reflect depositional environment. For example, a funnel-shaped (coarsening-upward) GR pattern suggests a prograding delta or shoreface sequence; a bell-shaped (fining-upward) pattern suggests a fluvial channel fill. Recognizing these patterns allows correlation of depositional environments between wells.",
              "Electrofacies classifies zones by grouping similar log responses using multivariate statistical methods (cluster analysis, neural networks). This allows automated partitioning of the logged interval into rock types without manual depth-by-depth interpretation.",
            ],
          },
        ],
      },
      {
        id: "sec-4-7",
        title: "Net Pay Determination and Cutoff Values",
        content: [
          "Net pay is the thickness of reservoir rock that can produce hydrocarbons at economically viable rates. It is distinguished from gross pay (the entire hydrocarbon-bearing interval) by applying cutoff criteria to petrophysical parameters derived from logs.",
          "Not every zone that contains hydrocarbons qualifies as net pay. Zones with very low porosity may contain hydrocarbons but cannot produce them at useful rates. Zones with high water saturation will produce predominantly water. Shaly zones may appear as tight intervals in the production log even if they have some porosity.",
        ],
        subsections: [
          {
            id: "sec-4-7-a",
            title: "Standard Cutoff Criteria",
            content: [],
            list: [
              {
                term: "Porosity Cutoff (φ > φ_cut)",
                description:
                  "Zones with porosity below the cutoff (typically 6–8% for tight sands, 10–12% for conventional sands) are classified as non-reservoir. The cutoff is calibrated against core-measured porosity and production tests.",
              },
              {
                term: "Water Saturation Cutoff (Sw < Sw_cut)",
                description:
                  "Zones with water saturation above the cutoff (typically 50–60%) are excluded from net pay. Zones with Sw above the cutoff will produce water at an uneconomic water-oil ratio.",
              },
              {
                term: "Shale Volume Cutoff (Vsh < Vsh_cut)",
                description:
                  "Zones with Vsh above the cutoff (typically 30–50%) are classified as non-reservoir shale. Shale volumes above the cutoff reduce permeability to uneconomic levels.",
              },
            ],
          },
          {
            id: "sec-4-7-b",
            title: "Bulk Volume Water (BVW)",
            content: [
              "Bulk Volume Water (BVW = φ × Sw) is a useful diagnostic tool for identifying zones at or near irreducible water saturation. In reservoirs at Swirr, BVW is approximately constant with depth — the BVW is controlled by the rock's capillary properties, not by the height above the free water level. Zones where BVW equals a constant value (the irreducible BVW for that rock type) can be expected to produce water-free. Zones where BVW is above the irreducible value will co-produce water.",
            ],
          },
        ],
      },
    ],
    formulas: [
      {
        name: "GR Index (Shale Indicator)",
        eq: "I_GR = (GR_log − GR_min) / (GR_max − GR_min)",
        desc: "Normalizes the GR reading between clean sand (GR_min) and shale (GR_max). I_GR ranges from 0 (clean) to 1 (pure shale).",
      },
      {
        name: "Density Porosity",
        eq: "ΦD = (ρ_ma − ρ_b) / (ρ_ma − ρ_fl)",
        desc: "ρ_ma = matrix density (sandstone: 2.65 g/cm³, limestone: 2.71 g/cm³), ρ_b = measured bulk density, ρ_fl = fluid density (1.0 for water, ~0.85 for oil, ~0.1 for gas).",
      },
      {
        name: "Archie's Formation Factor",
        eq: "F = Ro / Rw = a / φ^m",
        desc: "a = tortuosity factor (~1.0), φ = porosity, m = cementation exponent (1.7–2.5). F reflects pore geometry and tortuosity.",
      },
      {
        name: "Archie's Water Saturation",
        eq: "Sw = [(a × Rw) / (φ^m × Rt)]^(1/n)",
        desc: "Rw = formation water resistivity, Rt = true formation resistivity, n = saturation exponent (~2.0). The cornerstone of quantitative log interpretation.",
      },
      {
        name: "Bulk Volume Water",
        eq: "BVW = φ × Sw",
        desc: "At irreducible water saturation, BVW is constant with depth for a given rock type. Variable BVW indicates transition zone conditions.",
      },
    ],
    terms: [
      "Gamma Ray Log (GR)",
      "Resistivity Log",
      "Neutron Porosity Log",
      "Density Log",
      "Sonic Log",
      "Archie's Equations",
      "Formation Factor (F)",
      "True Resistivity (Rt)",
      "Shale Volume (Vsh)",
      "Net Pay",
      "Cutoff Values",
      "NMR Log (Nuclear Magnetic Resonance)",
    ],
  },

  5: {
    title: "Hydrocarbon PVT Properties and Phase Behavior",
    overview:
      "Pressure-Volume-Temperature (PVT) analysis characterizes how reservoir fluids behave as pressure and temperature change during production. This chapter covers the phase diagram, fluid classification, and the key PVT properties used in all reservoir engineering calculations.",
    sections: [
      {
        id: "sec-5-1",
        title: "The PVT Concept and Fluid Classification Basis",
        content: [
          "PVT stands for Pressure, Volume, Temperature — the three thermodynamic state variables that determine the phase and physical properties of reservoir fluids. PVT analysis is the process of measuring and describing how a reservoir fluid's volume, density, viscosity, and phase state change as pressure and temperature vary from reservoir to surface conditions.",
          "The behavior of reservoir fluids depends fundamentally on their composition — the relative amounts of light hydrocarbons (methane C1, ethane C2, propane C3, butane C4) versus intermediate and heavy hydrocarbons (C5 through C17+). Fluids rich in light components tend toward gas behavior; fluids rich in heavy components tend toward liquid behavior.",
        ],
        subsections: [
          {
            id: "sec-5-1-a",
            title: "The Pressure-Temperature Phase Diagram",
            content: [
              "The phase diagram (PT diagram) is the master tool for classifying reservoir fluids and predicting their behavior. For a multicomponent hydrocarbon mixture, the phase envelope is a curved two-dimensional region bounded by the bubble point curve on the left and the dew point curve on the right, joining at the critical point at the top.",
              "Inside the phase envelope, two phases (liquid and gas) coexist. Outside the envelope, the fluid is single-phase — either all liquid (at high pressure) or all gas (at low pressure/high temperature). The position of a reservoir's initial conditions on this diagram determines its fluid type and production behavior.",
            ],
          },
          {
            id: "sec-5-1-b",
            title: "Critical Parameters of the Phase Diagram",
            content: [],
            list: [
              {
                term: "Critical Point (Tc, Pc)",
                description:
                  "The unique temperature and pressure at which the distinction between liquid and gas vanishes. Above the critical temperature, no amount of pressure can condense the fluid to a liquid.",
              },
              {
                term: "Cricondentherm",
                description:
                  "The maximum temperature at which two phases can coexist. To the right of the cricondentherm, the fluid will never form two phases regardless of pressure. This defines the upper temperature boundary for gas condensate behavior.",
              },
              {
                term: "Cricondenbar",
                description:
                  "The maximum pressure at which two phases can coexist. Above the cricondenbar, the fluid is always single-phase liquid.",
              },
              {
                term: "Undersaturated Fluid",
                description:
                  "A fluid whose pressure is above the bubble point (for oil) or dew point (for gas condensate), existing as a single phase. The reservoir contains no free second phase.",
              },
              {
                term: "Saturated Fluid",
                description:
                  "A fluid at or below its bubble/dew point, within the two-phase envelope. Both liquid and gas are present simultaneously in the reservoir.",
              },
            ],
          },
        ],
        videoAfter: {
          label: "Lecture Video",
          description:
            "PVT Properties and Phase Behavior — Introduction to Pressure-Temperature Phase Diagrams for Reservoir Fluid Systems",
        },
      },
      {
        id: "sec-5-2",
        title: "The Phase Envelope and Reservoir Depletion Paths",
        content: [
          "The depletion path of a reservoir — the trajectory of pressure and temperature on the PT diagram as the reservoir is produced — determines what the fluid does during production. Most reservoirs deplete at approximately constant temperature (isothermal depletion) as pressure declines.",
        ],
        subsections: [
          {
            id: "sec-5-2-a",
            title: "Depletion in Oil Reservoirs",
            content: [
              "An oil reservoir starts above its bubble point as an undersaturated single-phase liquid. As production proceeds, reservoir pressure declines. When pressure reaches the bubble point, the first bubble of gas is liberated. Below bubble point, both free gas and oil coexist — the oil zone becomes saturated.",
              "Gas saturation builds up as more gas is liberated. When gas saturation exceeds the critical gas saturation, free gas begins to flow toward the well, causing the producing GOR to increase. Effective reservoir management aims to keep reservoir pressure above bubble point for as long as possible to maximize liquid recovery.",
            ],
          },
          {
            id: "sec-5-2-b",
            title: "Depletion in Gas Condensate Reservoirs",
            content: [
              "Gas condensate reservoirs start above the dew point as single-phase gas. As pressure declines and crosses the dew point, liquid condenses — but unlike normal condensation, this liquid forms in the reservoir pore space, where capillary forces trap it. This retrograde condensate buildup reduces gas permeability and the condensate itself may not be recoverable by primary depletion.",
              "The engineering response is pressure maintenance by gas recycling: produced gas (after condensate extraction) is reinjected into the reservoir to maintain pressure above the dew point and prevent retrograde condensation.",
            ],
          },
        ],
        videoAfter: {
          label: "Phase Behavior Demonstration",
          description:
            "Visualizing the Phase Envelope — Pressure-Temperature Diagrams for Black Oil, Volatile Oil, Gas Condensate, and Dry Gas Systems",
        },
      },
      {
        id: "sec-5-3",
        title: "Black Oil — The Most Common Reservoir Fluid",
        content: [
          "Black oil is the most common and most extensively studied reservoir fluid type. It consists predominantly of heavy hydrocarbon molecules (C5+) with relatively small amounts of lighter dissolved gas. Despite the name, black oils range in color from black to dark brown to green depending on composition.",
        ],
        subsections: [
          {
            id: "sec-5-3-a",
            title: "Characteristics of Black Oil",
            content: [],
            list: [
              {
                term: "Low GOR (Gas-Oil Ratio)",
                description:
                  "Typically < 2,000 scf/STB. The low GOR reflects the limited amount of light hydrocarbons dissolved in the oil under reservoir conditions. Solution GOR increases with pressure up to the bubble point.",
              },
              {
                term: "Low API Gravity",
                description:
                  "Typically 15–45° API. Heavy crude (< 20° API), medium crude (20–35° API), light crude (> 35° API). API gravity = (141.5/SG) − 131.5, where SG is specific gravity relative to water.",
              },
              {
                term: "Far from the Critical Point",
                description:
                  "Initial reservoir temperature is well to the left of the critical temperature on the PT diagram. This makes black oil the most stable, most predictable fluid type and the easiest to model.",
              },
              {
                term: "Bo > 1.0 (typically 1.1 to 1.8 res bbl/STB)",
                description:
                  "Oil at reservoir conditions contains dissolved gas and is thermally expanded compared to stock tank conditions. Bo shrinks significantly below bubble point as gas is released.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-5-4",
        title: "Volatile Oil — Near the Critical Region",
        content: [
          "Volatile oils occupy the critical region of the phase diagram, with initial reservoir temperature much closer to the critical temperature than black oil. This proximity to the critical point has dramatic consequences for production behavior.",
        ],
        subsections: [
          {
            id: "sec-5-4-a",
            title: "Characteristics of Volatile Oil",
            content: [],
            list: [
              {
                term: "High GOR",
                description:
                  "Typically 2,000–100,000 scf/STB. Large amounts of intermediate hydrocarbons (C2–C4) are dissolved in the oil, ready to flash to gas when pressure drops below bubble point.",
              },
              {
                term: "High API Gravity",
                description:
                  "Typically 40–60° API. Lighter, less viscous oil. At surface conditions, volatile oil produces a higher-quality, more valuable crude than black oil.",
              },
              {
                term: "Rapid Liquid Volume Shrinkage",
                description:
                  "Below bubble point, the large amount of dissolved intermediate components flashes rapidly to gas. The produced liquid volume fraction decreases sharply, and much of the reservoir oil may arrive at the separator as gas-phase material.",
              },
              {
                term: "Light-Colored Produced Liquid",
                description:
                  "Unlike black oil, the stock tank liquid from volatile reservoirs is typically amber, greenish-yellow, or very light brown — reflecting the high content of intermediate molecular weight hydrocarbons.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-5-5",
        title: "Gas Condensate, Wet Gas, and Dry Gas",
        content: [
          "As the reservoir fluid composition shifts progressively toward lighter hydrocarbons, we move from volatile oil through gas condensate, wet gas, and finally to dry gas. These represent a continuum defined by position on the PT phase diagram relative to the critical point.",
        ],
        subsections: [
          {
            id: "sec-5-5-a",
            title: "Gas Condensate",
            content: [
              "A gas condensate reservoir starts above its dew point as a single-phase gas. The reservoir temperature is between the critical temperature and the cricondentherm. As pressure declines during production, the dew point is crossed and liquid hydrocarbon condenses in the reservoir — retrograde condensation. This condensate is often rich in valuable liquids (pentanes, hexanes, and heavier) but may be difficult to recover once it has dropped out in the pore space.",
              "Surface-separated condensate (also called 'white oil' or 'lease condensate') from gas condensate wells typically has API gravity above 60° and near-water-clear appearance. The gas produced contains valuable intermediate components that are extracted in the gas plant.",
            ],
          },
          {
            id: "sec-5-5-b",
            title: "Wet Gas and Dry Gas",
            content: [
              "Wet gas reservoirs lie to the right of the cricondentherm on the phase diagram. The reservoir fluid is single-phase gas throughout depletion (no retrograde condensation in the reservoir), but the separator conditions fall inside the phase envelope, producing a liquid condensate at the surface. The liquid content of wet gas is typically expressed as gallons of liquid per thousand standard cubic feet (GPM).",
              "Dry gas (predominantly methane) has a phase envelope entirely to the left and below the reservoir conditions. No liquid is formed at any point in the production process. Dry gas is the simplest fluid to model and the least valuable per unit of heating content, but the easiest to process. Reservoir engineering of dry gas reservoirs uses only material balance and gas well deliverability methods.",
            ],
          },
        ],
        videoAfter: {
          label: "PVT Analysis Walkthrough",
          description:
            "PVT Laboratory Analysis — Flash Liberation, Differential Liberation, and Separator Tests for Reservoir Fluid Characterization",
        },
      },
      {
        id: "sec-5-6",
        title: "Key PVT Properties for Reservoir Engineering",
        content: [
          "The PVT laboratory provides a set of fluid property tables and correlations that are the essential inputs to all reservoir engineering calculations. These properties characterize how fluid volumes and densities change with pressure from reservoir conditions to the surface separator.",
        ],
        subsections: [
          {
            id: "sec-5-6-a",
            title: "Oil PVT Properties",
            content: [],
            list: [
              {
                term: "Oil Formation Volume Factor (Bo)",
                description:
                  "The ratio of oil volume at reservoir conditions to oil volume at stock tank conditions (res bbl/STB). Bo > 1 because reservoir oil contains dissolved gas and is thermally expanded. Above bubble point, Bo increases with pressure. Below bubble point, Bo decreases as gas escapes.",
              },
              {
                term: "Solution Gas-Oil Ratio (Rs)",
                description:
                  "Volume of gas dissolved in oil at reservoir pressure and temperature per stock tank barrel of oil (scf/STB). Rs increases with pressure up to the bubble point, then remains constant (the oil is at saturation pressure). Below bubble point, Rs decreases as gas is liberated.",
              },
              {
                term: "Oil Viscosity (μo)",
                description:
                  "Viscosity of the reservoir oil at in-situ conditions (cP). Above bubble point, viscosity increases as pressure decreases. Below bubble point, viscosity decreases as dissolved gas is released, making the oil less viscous.",
              },
            ],
          },
          {
            id: "sec-5-6-b",
            title: "Gas PVT Properties",
            content: [],
            list: [
              {
                term: "Z-Factor (Gas Compressibility Factor)",
                description:
                  "Dimensionless correction for real gas deviation from ideal: PV = ZnRT. Z is determined from the gas specific gravity and reservoir P, T using Standing-Katz correlations or equations of state. Z approaches 1 at low pressures (ideal gas limit).",
              },
              {
                term: "Gas Formation Volume Factor (Bg)",
                description:
                  "Volume of gas at reservoir conditions per unit volume at standard conditions. Bg = 0.00504 × ZT/P (res bbl/scf) or 0.02829 × ZT/P (cuft/scf). Bg is small at high pressure and increases dramatically as pressure declines.",
              },
              {
                term: "Gas Compressibility (cg)",
                description:
                  "For real gases, cg = 1/P − (1/Z)(dZ/dP). Near-ideal gas behavior: cg ≈ 1/P. Gas compressibility is the key property determining how much energy is stored in the gas reservoir at initial pressure.",
              },
            ],
          },
        ],
      },
    ],
    formulas: [
      {
        name: "Real Gas Law (Z-factor)",
        eq: "PV = ZnRT",
        desc: "Z = compressibility factor, n = moles of gas, R = gas constant (10.73 psi·ft³/lbmol·°R), T = absolute temperature (°R).",
      },
      {
        name: "Gas Formation Volume Factor",
        eq: "Bg = 0.02829 × Z × T / P",
        desc: "Bg in ft³/scf; T in °R (= °F + 460), P in psia. Converts reservoir gas volume to standard surface volume.",
      },
      {
        name: "API Gravity",
        eq: "API = (141.5 / SG_oil) − 131.5",
        desc: "SG_oil = specific gravity of oil relative to water at 60°F. API < 20 = heavy oil; 20–35 = medium; > 35 = light; > 60 = condensate.",
      },
      {
        name: "Oil Formation Volume Factor (approximation)",
        eq: "Bo = 0.972 + 1.47×10⁻⁴ × [Rs(γg/γo)^0.5 + 1.25T]^1.175",
        desc: "Standing's correlation for Bo above bubble point. Rs = solution GOR (scf/STB), γg = gas gravity, γo = oil gravity, T = temperature (°F).",
      },
      {
        name: "Gas Compressibility",
        eq: "c_g = 1/P − (1/Z)(dZ/dP)",
        desc: "For ideal gas behavior (Z=1, dZ/dP=0): c_g = 1/P. The gas compressibility controls depletion behavior and material balance.",
      },
    ],
    terms: [
      "PVT Properties",
      "Phase Envelope",
      "Bubble Point Pressure (Pb)",
      "Dew Point Pressure (Pd)",
      "Critical Point (Tc, Pc)",
      "Cricondentherm",
      "Cricondenbar",
      "Retrograde Condensation",
      "Black Oil",
      "Volatile Oil",
      "Gas Condensate",
      "Oil Formation Volume Factor (Bo)",
      "Solution Gas-Oil Ratio (Rs)",
      "Z-factor (Gas Compressibility Factor)",
      "Gas Formation Volume Factor (Bg)",
    ],
  },

  6: {
    title: "Integration of Petrophysics and Phase Behavior",
    overview:
      "In real reservoir engineering, petrophysics and PVT cannot be used in isolation. This chapter explores how rock properties and fluid properties work together to control reservoir performance — and what happens when the integration is done poorly.",
    sections: [
      {
        id: "sec-6-1",
        title: "Why Integration Is Essential",
        content: [
          "Petrophysics without PVT cannot predict production — it tells you where the oil is and how permeable the rock is, but not how the fluid will behave as pressure declines. PVT without petrophysics cannot predict flow — it tells you the fluid properties, but not how fast or how easily the fluid can move through the rock. Only their combination produces a complete, predictive model of reservoir performance.",
          "Consider two reservoirs with identical porosity and permeability: one contains light, low-viscosity oil; the other contains heavy, high-viscosity oil. Reservoir performance will be dramatically different. Permeability controls whether fluid can move, but viscosity controls how hard it is to push. The product of both determines actual flow rates and recovery.",
        ],
        noteBox: {
          title: "The Fundamental Integration Principle",
          items: [
            "Rock properties (petrophysics) determine WHERE fluids are and HOW they can move.",
            "Fluid properties (PVT) determine HOW the fluids behave as pressure changes.",
            "Reserves estimation requires BOTH: petrophysics provides Vb, φ, Sw; PVT provides Bo or Bg.",
            "Reservoir simulation requires BOTH as inputs: static (petrophysical) and dynamic (PVT) data.",
          ],
        },
      },
      {
        id: "sec-6-2",
        title: "Key Integrated Rock and Fluid Properties",
        content: [
          "Reservoir performance is governed by the interaction between rock properties and fluid properties. Neither set of properties alone is sufficient to characterize reservoir behavior.",
        ],
        subsections: [
          {
            id: "sec-6-2-a",
            title: "Critical Rock Properties",
            content: [],
            list: [
              {
                term: "Porosity (φ)",
                description:
                  "Controls the volume of fluid stored in the reservoir. Together with area and net pay, it determines hydrocarbon in place.",
              },
              {
                term: "Permeability (k)",
                description:
                  "Controls the rate at which fluid can flow toward the well. High porosity with low permeability is a common frustration — the fluid is there but won't flow.",
              },
              {
                term: "Relative Permeability (k_r)",
                description:
                  "Controls how easily each fluid phase flows in the presence of others. The shape of relative permeability curves determines producing GOR, WOR, and sweep efficiency over the life of the field.",
              },
              {
                term: "Wettability",
                description:
                  "Governs the initial saturation distribution, the shape of capillary pressure and relative permeability curves, and the efficiency of waterflood displacement.",
              },
              {
                term: "Capillary Pressure",
                description:
                  "Controls the vertical saturation distribution and the thickness of the transition zone. Determines how much of the rock column is in the net pay.",
              },
            ],
          },
          {
            id: "sec-6-2-b",
            title: "Critical PVT Properties",
            content: [],
            list: [
              {
                term: "Formation Volume Factors (Bo, Bg)",
                description:
                  "Convert fluid volumes between reservoir conditions and surface conditions. Essential for OOIP/GIIP calculations and material balance.",
              },
              {
                term: "Fluid Viscosity (μo, μg)",
                description:
                  "Controls flow resistance. High-viscosity heavy oil flows much more slowly through the same rock as low-viscosity light oil. Critical input to the Darcy flow equation and mobility calculations.",
              },
              {
                term: "Fluid Compressibility (Co, Cg)",
                description:
                  "Determines how much energy is stored in the fluid and released as the reservoir depressurizes. Gas has very high compressibility; oil has lower compressibility, close to that of water above the bubble point.",
              },
              {
                term: "Phase Behavior (Pb, Pd)",
                description:
                  "Determines the saturation state throughout reservoir life. Knowing the bubble or dew point relative to reservoir pressure tells us whether we are in single-phase or two-phase flow.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-6-3",
        title: "Volumetric Reserves Estimation",
        content: [
          "The volumetric method is the most fundamental approach to estimating hydrocarbon initially in place. It is entirely dependent on integrated petrophysical and PVT inputs. Errors in either set of inputs propagate directly into errors in reserves.",
        ],
        subsections: [
          {
            id: "sec-6-3-a",
            title: "The OOIP Formula and Its Inputs",
            content: [
              "The stock tank oil initially in place (STOIIP or N) is calculated as: N = (Vb × φ × (1 − Sw)) / Bo. Each term has a specific source: Vb (bulk volume) comes from seismic mapping and geological interpretation; φ (porosity) and Sw (water saturation) come from petrophysical log analysis calibrated to core data; Bo (oil formation volume factor) comes from PVT laboratory analysis of representative fluid samples.",
              "A 10% error in any one of these inputs produces approximately a 10% error in STOIIP. In practice, the largest uncertainties typically come from porosity (especially in carbonates), Sw (affected by clay, invasion, and Archie parameter uncertainty), and Vb (due to structural and stratigraphic uncertainty). PVT errors are usually smaller because laboratory measurements of Bo are relatively precise.",
            ],
          },
          {
            id: "sec-6-3-b",
            title: "Recovery Factor and Recoverable Reserves",
            content: [
              "STOIIP is not the same as recoverable reserves. Recovery Factor (RF) is the fraction of STOIIP that can be economically extracted using current technology. RF depends strongly on drive mechanism (water drive gives 35–75%; solution gas drive gives 5–30%), rock quality, fluid properties, and the development strategy selected.",
              "Recoverable Reserves = STOIIP × RF. The recovery factor is itself a function of integrated rock-fluid properties — particularly relative permeability endpoints, wettability, and fluid viscosity. An excellent PVT description combined with poor relative permeability data will give an incorrect RF prediction.",
            ],
          },
        ],
      },
      {
        id: "sec-6-4",
        title: "Effects of Pressure Depletion on Rock and Fluid",
        content: [
          "Production from a reservoir is essentially the controlled depletion of natural energy stored in the form of elevated fluid and rock pressure. As this pressure declines, both the fluids and the rock respond simultaneously, and these responses interact with each other in ways that control production performance.",
        ],
        subsections: [
          {
            id: "sec-6-4-a",
            title: "Fluid Behavior During Depletion",
            content: [],
            list: [
              {
                term: "Oil Volume Shrinkage",
                description:
                  "Below bubble point, dissolved gas is liberated, and Bo decreases. The oil volume in the reservoir shrinks as gas comes out of solution. This reduces oil production rate because there is less total fluid expansion energy per barrel of oil.",
              },
              {
                term: "Free Gas Liberation",
                description:
                  "Gas released from solution below the bubble point builds up free gas saturation in the pore space. When Sg exceeds the critical gas saturation, free gas flows and the producing GOR rises rapidly.",
              },
              {
                term: "Gas Expansion",
                description:
                  "Free gas expands significantly as pressure declines (Bg increases), providing additional energy for fluid production. In gas reservoirs, this expansion is the primary drive mechanism.",
              },
              {
                term: "Viscosity Changes",
                description:
                  "Below bubble point, oil viscosity decreases as gas comes out of solution (lighter, lower-viscosity oil remains). This improves the mobility ratio, partially compensating for the effect of free gas reducing oil relative permeability.",
              },
            ],
          },
          {
            id: "sec-6-4-b",
            title: "Rock Behavior During Depletion",
            content: [
              "As reservoir pressure declines, effective overburden stress increases, causing the rock matrix to compact. This reduces pore volume (pore volume compressibility effect), which provides additional energy to push fluids out of the rock. In most reservoirs, this compaction drive is a minor contribution to total recovery. In highly compressible chalk reservoirs and in overpressured formations, however, compaction drive can be the dominant mechanism.",
              "In some reservoirs, compaction also irreversibly reduces permeability as pore throats constrict. Fractures may close (reducing fracture permeability) or dilate (increasing natural fracture contribution) depending on the stress direction and orientation relative to the producing structure.",
            ],
          },
        ],
      },
      {
        id: "sec-6-5",
        title: "Multiphase Flow and Mobility in the Integrated Context",
        content: [
          "The Darcy flow equation for a single phase gives flow rate = k × A × ΔP / (μ × L). In a multiphase system, each phase's flow is governed by its effective permeability, which equals k_r × k_abs. The mobility concept combines both rock and fluid properties into a single measure of flow ease.",
          "Mobility ratio M = λ_displacing / λ_displaced = (k_r,disp / μ_disp) / (k_r,oil / μ_oil). When M < 1, displacement is stable. When M > 1, viscous fingering occurs. The success of any waterflood or gas injection project is determined by this ratio, which integrates both the reservoir rock's relative permeability (a petrophysical property) and the fluid viscosities (PVT properties).",
        ],
        subsections: [
          {
            id: "sec-6-5-a",
            title: "Integrated Implications for Waterflood Design",
            content: [
              "Waterflooding displaces oil with injected water. The efficiency depends on: mobility ratio M (controlled by both k_r curves and fluid viscosities); areal sweep efficiency (controlled by well pattern, heterogeneity, and M); vertical sweep efficiency (controlled by permeability layering and gravity); and displacement efficiency (controlled by relative permeability endpoints — specifically Sor).",
              "A heavy oil reservoir with favorable rock properties (high k, good connectivity) may still produce poorly under waterflooding because unfavorable mobility ratio (M >> 1 due to high oil viscosity) causes fingering and early water breakthrough. Polymer flooding — which increases water viscosity to reduce M — is the standard remedy.",
            ],
          },
        ],
      },
      {
        id: "sec-6-6",
        title: "Petrophysics and PVT in Reservoir Simulation",
        content: [
          "Reservoir simulation is the ultimate integration tool — it combines a three-dimensional geological model populated with petrophysical properties with a dynamic fluid model described by PVT equations, and solves the coupled flow equations to predict production performance over the reservoir's life.",
        ],
        subsections: [
          {
            id: "sec-6-6-a",
            title: "Static Petrophysical Inputs",
            content: [],
            list: [
              {
                term: "Porosity (φ)",
                description:
                  "Distributed across the 3D simulation grid from log analysis, geostatistical modeling, and core calibration. Controls fluid storage in each grid cell.",
              },
              {
                term: "Permeability (k_h, k_v)",
                description:
                  "Horizontal and vertical permeability. Controls flow between grid cells. Often the most uncertain property in the simulation model.",
              },
              {
                term: "Net-to-Gross (N/G)",
                description:
                  "Fraction of each grid layer that is productive reservoir rock, based on net pay cutoffs from log analysis.",
              },
              {
                term: "Rock Types and Relative Permeability Curves",
                description:
                  "Different rock types have different k_r and Pc curves, measured from SCAL. Assigning the correct rock type to each grid cell is critical for accurate production forecasting.",
              },
            ],
          },
          {
            id: "sec-6-6-b",
            title: "Dynamic PVT Inputs",
            content: [],
            list: [
              {
                term: "PVT Tables (Bo, Rs, μo, Bg, Z)",
                description:
                  "Look-up tables of fluid properties as functions of pressure. The simulator interpolates these at each pressure step to compute fluid volumes and flow mobilities.",
              },
              {
                term: "Fluid Compressibilities",
                description:
                  "Controls how much fluid expands per unit pressure drop. Critical for material balance validation and history matching.",
              },
              {
                term: "Phase Behavior Model",
                description:
                  "For gas condensate and volatile oil systems, a compositional model (equation of state) is needed to track phase changes accurately throughout the simulation.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-6-7",
        title: "Consequences of Poor Integration",
        content: [
          "The history of petroleum engineering is filled with case studies where poor integration of petrophysical and PVT data led to costly field development mistakes. Understanding these failure modes is as important as understanding the correct methods.",
        ],
        subsections: [
          {
            id: "sec-6-7-a",
            title: "Common Integration Errors and Their Consequences",
            content: [],
            list: [
              {
                term: "Using the Wrong Saturation Model",
                description:
                  "Applying Archie's equation in a shaly sand without correction systematically overestimates Sw, underestimates STOIIP, and may cause productive zones to be abandoned as water zones.",
              },
              {
                term: "Ignoring Wettability Effects",
                description:
                  "Using relative permeability curves measured under water-wet laboratory conditions in an oil-wet or mixed-wet carbonate reservoir leads to poor waterflood history matches and over-optimistic recovery forecasts.",
              },
              {
                term: "Using the Wrong PVT Model",
                description:
                  "Characterizing a volatile oil reservoir with a black oil PVT model (instead of a compositional model) can significantly misrepresent the gas-oil ratio behavior and liquid recovery below bubble point.",
              },
              {
                term: "Over-smoothing Permeability",
                description:
                  "Averaging heterogeneous permeability profiles eliminates key baffles and barriers, causing the simulation to overpredict early sweep efficiency and underpredict water breakthrough time.",
              },
            ],
          },
        ],
        noteBox: {
          title: "Core Integration Principles",
          items: [
            "Most reservoir failures are due to misinterpretation of rock or fluid data, not arithmetic errors.",
            "The reservoir model is only as good as its weakest input — identify and quantify uncertainties.",
            "History matching against actual production data is the ultimate test of integration quality.",
            "Sensitivity analysis on key uncertain parameters (k, φ, Sw, Pc, kr) is always required.",
          ],
        },
      },
    ],
    formulas: [
      {
        name: "STOIIP (Stock Tank Oil Initially In Place)",
        eq: "N = (Vb × φ × (1 − Sw)) / Bo",
        desc: "Vb = bulk volume (res bbl from seismic/geology), φ and Sw from petrophysics, Bo from PVT. All inputs must be consistent.",
      },
      {
        name: "Recoverable Oil Reserves",
        eq: "Np = N × RF",
        desc: "Recoverable reserves = STOIIP × Recovery Factor. RF depends on drive mechanism, rock type, fluid properties, and development strategy.",
      },
      {
        name: "Fluid Mobility",
        eq: "λ = k_r / μ",
        desc: "Combines rock property (relative permeability k_r) and fluid property (viscosity μ) into a single measure of flow ease.",
      },
      {
        name: "Mobility Ratio",
        eq: "M = (k_r,w / μ_w) / (k_r,o / μ_o)",
        desc: "M < 1 → stable waterflood; M = 1 → unit mobility ratio (neutral); M > 1 → viscous fingering. Combines both petrophysical and PVT inputs.",
      },
      {
        name: "Darcy's Law in Field Units",
        eq: "q = 1.127×10⁻³ × (k × A × ΔP) / (μ × L)",
        desc: "q = flow rate (bbl/day), k in mD, A in ft², ΔP in psi, μ in cP, L in ft. The practical form for reservoir engineering.",
      },
    ],
    terms: [
      "Net-to-Gross Ratio (N/G)",
      "Oil Formation Volume Factor (Bo)",
      "Gas Formation Volume Factor (Bg)",
      "Pore Volume Compressibility (cf)",
      "Mobility Ratio",
      "Recovery Factor (RF)",
      "Reservoir Simulation",
      "History Matching",
      "Compaction Drive",
      "STOIIP",
    ],
  },

  7: {
    title: "Application in Reservoir Engineering",
    overview:
      "From drive mechanisms to secondary and enhanced recovery, this final chapter shows how all the preceding petrophysical and PVT principles are applied in the real-world engineering of oil and gas field development and production optimization.",
    sections: [
      {
        id: "sec-7-1",
        title: "Reservoir Energy Sources",
        content: [
          "Every oil and gas reservoir initially contains a certain amount of stored energy, equivalent to the pressure that exists above normal hydrostatic pressure. This energy drives fluids toward the wellbore during production. Understanding the source and magnitude of this energy is fundamental to predicting reservoir performance and designing an optimal production strategy.",
        ],
        subsections: [
          {
            id: "sec-7-1-a",
            title: "Sources of Reservoir Drive Energy",
            content: [],
            list: [
              {
                term: "Fluid Expansion (Oil, Gas, Water)",
                description:
                  "As reservoir pressure declines, fluids expand according to their compressibility. Gas expansion is the most powerful energy source because gas is highly compressible. Oil and water expansion are smaller contributions.",
              },
              {
                term: "Dissolved Gas Expansion",
                description:
                  "Below the bubble point, gas comes out of solution from oil, expanding dramatically as pressure declines. This liberated gas provides a strong drive but causes rapid pressure decline and GOR increase if not managed carefully.",
              },
              {
                term: "Gas Cap Expansion",
                description:
                  "Free gas accumulated above the oil zone in the gas cap expands as pressure declines, pushing down and displacing oil toward production wells. Maintaining a large, intact gas cap is one of the most effective strategies for pressure maintenance.",
              },
              {
                term: "Aquifer Water Influx (Water Encroachment)",
                description:
                  "Natural water encroachment from a connected aquifer replenishes reservoir volume as oil is produced. Active aquifer support can maintain nearly constant reservoir pressure over the life of the field. The most efficient natural drive mechanism.",
              },
              {
                term: "Rock and Fluid Compressibility",
                description:
                  "The expansion of pore volume reduction (compaction) and connate water as pressure declines. Typically a minor contribution except in highly compressible rocks (chalk, unconsolidated sand) or highly overpressured reservoirs.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-7-2",
        title: "Primary Recovery — Solution Gas Drive",
        content: [
          "Primary recovery refers to production driven entirely by natural reservoir energy, without any injection of gas or water. The mechanism that provides this energy is called the drive mechanism, and it fundamentally determines how much oil is produced and how long production remains economic.",
        ],
        subsections: [
          {
            id: "sec-7-2-a",
            title: "Solution Gas Drive Mechanism",
            content: [
              "Solution gas drive (also called dissolved gas drive or depletion drive) is the simplest and most common primary recovery mechanism. The reservoir starts above bubble point as a single-phase liquid. As production reduces reservoir pressure below bubble point, dissolved gas is liberated from the oil.",
              "The liberated gas expands, providing the energy to push oil toward the wellbore. However, as free gas saturation builds up above critical gas saturation, gas begins to flow preferentially (since gas mobility is much higher than oil mobility at high gas saturations). The producing GOR rises sharply, and oil production rate declines rapidly.",
              "Recovery factors for solution gas drive are typically 5–30% of STOIIP — the lowest of all primary drive mechanisms. Pressure maintenance by gas or water injection before GOR begins to rise dramatically improves recovery.",
            ],
          },
          {
            id: "sec-7-2-b",
            title: "Production Characteristics of Solution Gas Drive",
            content: [],
            list: [
              {
                term: "Rapid Pressure Decline",
                description:
                  "With no external energy input, reservoir pressure falls quickly as oil and gas are produced. The pressure decline rate is proportional to production rate and inversely proportional to the total fluid compressibility.",
              },
              {
                term: "Rising Gas-Oil Ratio",
                description:
                  "GOR starts at the initial solution GOR (Rs), then rises steeply below bubble point as free gas saturation exceeds Sgc. A rapidly rising GOR is the diagnostic sign of solution gas drive.",
              },
              {
                term: "Declining Oil Rate",
                description:
                  "As reservoir pressure falls and gas saturation rises (reducing oil relative permeability), oil production rate declines continuously. Eventually, gas flow dominates and oil production becomes uneconomic.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-7-3",
        title: "Primary Recovery — Gas Cap Drive and Water Drive",
        content: [
          "Gas cap drive and water drive are significantly more efficient natural drive mechanisms than solution gas drive because they provide continuous pressure support, maintaining the reservoir at higher average pressure for longer.",
        ],
        subsections: [
          {
            id: "sec-7-3-a",
            title: "Gas Cap Drive",
            content: [
              "In a gas cap reservoir, a free gas phase occupies the structural crest above the oil zone. As oil is produced from the flanks, the gas cap expands downward, displacing oil toward the producing wells. The gas cap maintains reservoir pressure much better than solution gas drive alone.",
              "Recovery factors for gas cap drive are typically 20–40% of STOIIP, significantly better than solution gas drive. The key to maximizing recovery is to prevent gas coning — the premature breakthrough of gas cap gas into the oil-producing wells — by controlling production rates and well placement.",
            ],
          },
          {
            id: "sec-7-3-b",
            title: "Water Drive",
            content: [
              "Water drive is the most efficient natural drive mechanism, capable of recovering 35–75% of STOIIP. It operates through an aquifer — a water-bearing formation connected to the reservoir — that influx water into the reservoir as oil is produced, maintaining reservoir pressure near its original level.",
              "The efficiency of water drive depends on the mobility ratio between water and oil, the rate of water influx relative to production rate, and the degree of permeability heterogeneity. In strong water drive reservoirs, reservoir pressure remains essentially constant until water cuts become uneconomic.",
            ],
          },
          {
            id: "sec-7-3-c",
            title: "Expansion and Compaction Drives",
            content: [
              "Rock and fluid expansion drive is dominant in undersaturated oil reservoirs above bubble point, where the only energy sources are the expansion of the slightly compressible oil, water, and rock. Recovery is very low (1–5% of STOIIP) because liquid and rock compressibilities are small.",
              "Compaction drive occurs when the reservoir rock is sufficiently compressible that its pore volume reduction contributes meaningfully to fluid expulsion. In chalk reservoirs and unconsolidated deep sands, this mechanism can be significant. However, severe compaction may cause irreversible permeability reduction and surface subsidence.",
            ],
          },
        ],
      },
      {
        id: "sec-7-4",
        title: "Combination Drive and Drive Mechanism Identification",
        content: [
          "Most real reservoirs are not driven by a single pure mechanism. Combination drive reservoirs experience simultaneous contributions from solution gas, gas cap expansion, water influx, and rock compressibility. The relative contributions vary over the production life of the field as each energy source is progressively depleted.",
          "Correctly identifying the dominant drive mechanism is critical for optimal field management. Material balance analysis (the Havlena-Odeh method and Craft-Hawkins method) decomposes the cumulative production into contributions from each mechanism, allowing engineers to identify what is driving the reservoir and forecast future performance.",
        ],
        subsections: [
          {
            id: "sec-7-4-a",
            title: "Consequences of Misidentifying Drive Mechanism",
            content: [
              "If a water drive reservoir is mistakenly modeled as a solution gas drive reservoir, injection projects will be improperly designed. Water injection may be initiated when the aquifer could have maintained adequate pressure support, wasting capital. Alternatively, if an active aquifer is unrecognized, depletion may be too rapid, allowing premature gas breakout or edge-water encroachment.",
              "Misidentification of a gas condensate reservoir as a dry gas reservoir can result in ignoring retrograde condensate buildup, leading to loss of valuable condensate production and reduced gas deliverability as condensate blocks near-wellbore pores.",
            ],
          },
        ],
      },
      {
        id: "sec-7-5",
        title: "Secondary Recovery — Water Flooding and Gas Injection",
        content: [
          "When natural reservoir energy is insufficient or declining, secondary recovery methods are used to artificially maintain reservoir pressure and displace oil toward producing wells. Water flooding and gas injection are the two standard secondary recovery techniques.",
          "Water flooding is the dominant secondary recovery method worldwide. Water is injected through dedicated injection wells to displace oil toward producing wells. An effective waterflood design requires: favorable mobility ratio (M ≤ 1), good well pattern geometry to maximize areal sweep, layer-by-layer permeability data for vertical sweep analysis, and careful management of injection rates to control flood-front advancement.",
        ],
        subsections: [
          {
            id: "sec-7-5-a",
            title: "Water Flooding Design Principles",
            content: [],
            list: [
              {
                term: "Five-Spot Pattern",
                description:
                  "One injector surrounded by four producers at equal spacing. The most common well pattern, providing reasonable areal sweep efficiency. Line drive and inverted nine-spot patterns are used in different reservoir geometries.",
              },
              {
                term: "Mobility Ratio Control",
                description:
                  "When M > 1 (heavy oil or low k_rw endpoint), polymer flooding is used to increase water viscosity, reducing M toward unity. This dramatically improves sweep efficiency and delays water breakthrough.",
              },
              {
                term: "Injection Rate Management",
                description:
                  "Injection rate must be balanced against production rate to maintain target reservoir pressure. Over-injection causes fracturing and channeling; under-injection fails to maintain pressure support.",
              },
            ],
          },
          {
            id: "sec-7-5-b",
            title: "Gas Injection",
            content: [
              "Gas injection (GI) is used for pressure maintenance (especially in gas condensate reservoirs to prevent retrograde condensation), gravity drainage enhancement, and miscible flooding to reduce residual oil saturation. Miscible gas injection achieves essentially zero interfacial tension between injected gas and reservoir oil, eliminating capillary trapping and dramatically improving displacement efficiency.",
              "Gas channeling — preferential flow of injected gas along high-permeability streaks — is the major problem with gas injection. This reduces areal sweep efficiency and causes premature gas breakthrough at producing wells.",
            ],
          },
        ],
      },
      {
        id: "sec-7-6",
        title: "Enhanced Oil Recovery (EOR) Techniques",
        content: [
          "Enhanced Oil Recovery (EOR) methods target oil that conventional primary and secondary recovery cannot mobilize — specifically the residual oil trapped in pore spaces by capillary forces (Sor). EOR techniques address this by modifying fluid properties, wettability, or displacement mechanisms beyond what simple water or gas injection can achieve.",
        ],
        subsections: [
          {
            id: "sec-7-6-a",
            title: "EOR Categories and Key Techniques",
            content: [],
            list: [
              {
                term: "Chemical EOR (Polymer, Surfactant, Alkali)",
                description:
                  "Polymer flooding increases water viscosity to improve mobility ratio. Surfactant flooding reduces interfacial tension to mobilize trapped oil ganglia. Alkaline flooding reacts with acidic crude oil to generate surfactant in situ.",
              },
              {
                term: "WAG (Water Alternating Gas)",
                description:
                  "Alternating cycles of water injection and gas injection. The water slugs improve sweep efficiency by reducing the high mobility of gas; the gas slugs improve displacement efficiency. WAG is widely applied in both offshore and onshore fields.",
              },
              {
                term: "FAWAG (Foam Assisted WAG)",
                description:
                  "An advanced variant of WAG where foam is generated at the injection front by reacting a surfactant with the injected gas. Foam has much lower mobility than free gas, dramatically reducing gas channeling and improving conformance in heterogeneous reservoirs.",
              },
              {
                term: "Thermal EOR (Steam, SAGD, In-Situ Combustion)",
                description:
                  "Heat reduces oil viscosity, sometimes by orders of magnitude. Steam injection and Steam-Assisted Gravity Drainage (SAGD) are applied extensively in heavy oil and bitumen reservoirs. In-situ combustion burns a fraction of the oil in place to generate heat.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-7-7",
        title: "Reservoir Performance Monitoring and Material Balance",
        content: [
          "Monitoring reservoir performance over the field life is essential for detecting problems early, validating production forecasts, and optimizing field management. Key performance indicators include reservoir pressure, producing GOR, water cut, and production rate trends.",
        ],
        subsections: [
          {
            id: "sec-7-7-a",
            title: "Key Performance Indicators",
            content: [],
            list: [
              {
                term: "Reservoir Pressure (average static pressure)",
                description:
                  "Monitored through periodic well shut-in pressure buildups (DST, RFT/MDT). Pressure decline rate is the primary indicator of reservoir energy depletion. Sudden pressure changes may indicate communication between reservoir zones.",
              },
              {
                term: "Gas-Oil Ratio (GOR)",
                description:
                  "Rising GOR above the solution GOR indicates free gas is flowing, signaling pressure has dropped below bubble point and/or gas cap breakthrough. GOR trend is the most sensitive indicator of drive mechanism behavior.",
              },
              {
                term: "Water Cut (WC)",
                description:
                  "The fraction of produced liquid that is water. Rising water cut indicates aquifer influx or injected water breakthrough. Water cut management is central to the economics of mature field production.",
              },
            ],
          },
          {
            id: "sec-7-7-b",
            title: "Material Balance — The Reservoir Equation",
            content: [
              "The material balance equation (MBE) is the most powerful classical tool for reservoir analysis. It states that cumulative production equals the sum of the expansion of all fluids and rock in the reservoir: expansion of undersaturated oil + gas cap gas + connate water + rock compressibility + water influx = cumulative oil, gas, and water production.",
              "The MBE allows independent estimation of STOIIP without depending on volumetrics, identification of the dominant drive mechanism, determination of aquifer strength, and prediction of future pressure and production performance. History-matching the MBE to actual production data is one of the most fundamental reservoir engineering tasks.",
            ],
          },
        ],
        noteBox: {
          title: "Recovery Factor Summary by Drive Mechanism",
          items: [
            "Solution Gas Drive: 5–30% of STOIIP — rapid pressure decline, rising GOR",
            "Gas Cap Drive: 20–40% of STOIIP — pressure maintained better, delayed GOR rise",
            "Water Drive: 35–75% of STOIIP — excellent pressure maintenance, rising water cut",
            "Compaction/Expansion Drive: 1–5% of STOIIP — weak energy, small recovery",
            "Secondary Recovery (Waterflood): Additional 15–25% — depends on sweep efficiency",
            "EOR Methods: Additional 5–15% — target residual oil after conventional methods",
          ],
        },
      },
    ],
    formulas: [
      {
        name: "STOIIP (Volumetric)",
        eq: "N = 7758 × A × h × φ × (1 − Sw) / Boi",
        desc: "A = area (acres), h = net pay thickness (ft), φ = porosity, Sw = initial water saturation, Boi = initial oil FVF (res bbl/STB).",
      },
      {
        name: "Recovery Factor",
        eq: "RF = Np / N",
        desc: "Np = cumulative oil produced (STB), N = STOIIP (STB). RF depends on drive mechanism, rock quality, and development strategy.",
      },
      {
        name: "Material Balance (Simplified Oil Reservoir)",
        eq: "Np × Bo ≈ N × (Bo − Boi) + N × Boi × cf × ΔP + We",
        desc: "Left side = cumulative production; right side = oil expansion + rock/water expansion + water influx (We). Used to identify drive mechanisms.",
      },
      {
        name: "Gas Cap Expansion Drive",
        eq: "We + N × m × Bgi × (Bg/Bgi − 1) = Np × Bo",
        desc: "m = ratio of gas cap volume to oil zone volume (at initial conditions). Gas cap drive supplements oil zone expansion.",
      },
      {
        name: "Productivity Index",
        eq: "PI = q / (P_r − P_wf)",
        desc: "PI (bbl/day/psi) = production rate / pressure drawdown. Combines reservoir permeability, thickness, and fluid mobility into a single deliverability measure.",
      },
    ],
    terms: [
      "Solution Gas Drive",
      "Gas Cap Drive",
      "Water Drive",
      "Compaction Drive",
      "Combination Drive Mechanism",
      "Aquifer",
      "Recovery Factor (RF)",
      "Water Flooding",
      "WAG (Water Alternating Gas)",
      "FAWAG (Foam Assisted WAG)",
      "Material Balance Equation (MBE)",
      "Gas-Oil Ratio (GOR)",
      "STOIIP",
    ],
  },
};

const getChapterData = (id: number): ChapterData => {
  if (CHAPTER_CONTENT[id]) return CHAPTER_CONTENT[id];
  return {
    title: CHAPTER_TITLES[id] || `Chapter ${id}`,
    overview: "Content loading...",
    sections: [],
    formulas: [],
    terms: [],
  };
};

function VideoCard({ label, description }: { label: string; description: string }) {
  return (
    <Card className="bg-slate-900 border-slate-700 overflow-hidden relative group cursor-pointer my-8">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-900/20 opacity-80"></div>
      <CardContent className="relative z-10 flex items-center gap-6 p-6">
        <div className="shrink-0 bg-white/10 p-4 rounded-full border border-white/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors">
          <PlayCircle className="h-10 w-10 text-white group-hover:text-amber-400 transition-colors" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-1 block">
            Video Resource
          </span>
          <h3 className="font-bold text-lg font-serif text-white">{label}</h3>
          <p className="text-sm text-slate-300 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-bold text-amber-800 dark:text-amber-400 text-sm uppercase tracking-wide">
          {title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Chapter() {
  const { id } = useParams();
  const chapterId = parseInt(id || "1", 10);
  const chapterData = getChapterData(chapterId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: isLoadingProgress } = useGetChapterProgress(chapterId, {
    query: {
      enabled: !!chapterId,
      queryKey: getGetChapterProgressQueryKey(chapterId),
    },
  });

  const { data: glossary } = useGetGlossaryTerms(
    { chapterId },
    { query: { enabled: !!chapterId, queryKey: getGetGlossaryTermsQueryKey({ chapterId }) } }
  );

  const updateProgress = useUpdateChapterProgress({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetChapterProgressQueryKey(chapterId), data);
        queryClient.invalidateQueries({ queryKey: getGetAllProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProgressSummaryQueryKey() });
        if (data.completed) {
          toast({
            title: "Chapter Completed!",
            description: "Your progress has been saved.",
          });
        }
      },
    },
  });

  const createBookmark = useCreateBookmark({
    mutation: {
      onSuccess: () => {
        toast({ title: "Bookmark Added", description: "Section saved to your bookmarks." });
      },
    },
  });

  const handleMarkComplete = () => {
    updateProgress.mutate({ chapterId, data: { completed: !progress?.completed } });
  };

  const handleAddBookmark = (sectionId: string, sectionTitle: string) => {
    createBookmark.mutate({ data: { chapterId, sectionId, title: sectionTitle, note: null } });
  };

  const renderTextWithGlossary = (text: string) => {
    if (!glossary || glossary.length === 0) return <>{text}</>;
    let elements: (string | React.ReactNode)[] = [text];
    const terms = [...glossary].sort((a, b) => b.term.length - a.term.length);
    terms.forEach((termObj) => {
      const newElements: (string | React.ReactNode)[] = [];
      const cleanTerm = termObj.term.replace(/[()[\]^$.*+?{}|\\]/g, "\\$&");
      const regex = new RegExp(`\\b(${cleanTerm})\\b`, "gi");
      elements.forEach((element) => {
        if (typeof element === "string") {
          const parts = element.split(regex);
          parts.forEach((part) => {
            if (part.toLowerCase() === termObj.term.toLowerCase()) {
              newElements.push(
                <Tooltip key={`${termObj.id}-${Math.random()}`}>
                  <TooltipTrigger className="underline decoration-dashed decoration-primary/50 underline-offset-4 cursor-help hover:text-primary transition-colors font-medium">
                    {part}
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4 bg-popover text-popover-foreground shadow-lg border-border">
                    <p className="font-bold mb-1">{termObj.term}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{termObj.definition}</p>
                  </TooltipContent>
                </Tooltip>
              );
            } else {
              newElements.push(part);
            }
          });
        } else {
          newElements.push(element);
        }
      });
      elements = newElements;
    });
    return <>{elements.map((el, i) => <span key={i}>{el}</span>)}</>;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-serif font-bold text-lg mb-4 text-primary">Chapters</h3>
              <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <Link
                    key={num}
                    href={`/chapter/${num}`}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      chapterId === num
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    data-testid={`link-chapter-sidebar-${num}`}
                  >
                    <span className="text-xs opacity-60 mr-1">Ch {num}</span> {CHAPTER_TITLES[num]}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 max-w-4xl mx-auto lg:mx-0 min-w-0">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 text-primary mb-3 font-medium uppercase tracking-widest text-sm">
                <span>Chapter {chapterId}</span>
                {progress?.completed && (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded-full text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight mb-4">
                {chapterData.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4">
                {chapterData.overview}
              </p>
            </header>

            {/* Main Lecture Video Placeholder */}
            <Card className="mb-10 bg-slate-900 border-slate-800 overflow-hidden relative group cursor-pointer aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-900/20 opacity-80 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col items-center gap-4 text-white p-6 text-center transform group-hover:scale-105 transition-transform duration-500">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                  <PlayCircle className="h-12 w-12 text-white group-hover:text-amber-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-xl font-serif">Lecture Video</h3>
                  <p className="text-sm text-slate-300">
                    Chapter {chapterId} — {chapterData.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Video will be available soon</p>
                </div>
              </div>
            </Card>

            {/* Chapter Sections */}
            <div className="space-y-14 mb-12">
              {chapterData.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 group">
                  {/* Section Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-serif font-bold text-foreground leading-snug pr-4">
                      {section.title}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0 mt-1"
                      onClick={() => handleAddBookmark(section.id, section.title)}
                      title="Bookmark this section"
                      data-testid={`button-bookmark-${section.id}`}
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Section main content paragraphs */}
                  {section.content.length > 0 && (
                    <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-p:leading-relaxed text-muted-foreground mb-6">
                      {section.content.map((paragraph, idx) => (
                        <p key={idx}>{renderTextWithGlossary(paragraph)}</p>
                      ))}
                    </div>
                  )}

                  {/* Section top-level note box */}
                  {section.noteBox && (
                    <NoteBox title={section.noteBox.title} items={section.noteBox.items} />
                  )}

                  {/* Subsections */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="space-y-8 mt-4">
                      {section.subsections.map((sub) => (
                        <div key={sub.id} id={sub.id} className="pl-0 md:pl-5 border-l-2 border-border/50">
                          <h3 className="text-lg font-semibold font-serif text-foreground mb-3">
                            {sub.title}
                          </h3>

                          {sub.content.length > 0 && (
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-muted-foreground mb-4">
                              {sub.content.map((paragraph, idx) => (
                                <p key={idx}>{renderTextWithGlossary(paragraph)}</p>
                              ))}
                            </div>
                          )}

                          {/* Definition list */}
                          {sub.list && sub.list.length > 0 && (
                            <div className="grid gap-3 mt-3">
                              {sub.list.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex gap-3 bg-muted/40 dark:bg-muted/20 rounded-lg p-4 border border-border/50"
                                >
                                  <div className="shrink-0 mt-0.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2"></span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-foreground text-sm">
                                      {item.term}
                                    </span>
                                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Subsection note box */}
                          {sub.noteBox && (
                            <NoteBox title={sub.noteBox.title} items={sub.noteBox.items} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Video Placeholder (for Ch 4 and 5) */}
                  {section.videoAfter && (
                    <VideoCard
                      label={section.videoAfter.label}
                      description={section.videoAfter.description}
                    />
                  )}
                </section>
              ))}
            </div>

            {/* Key Formulas */}
            {chapterData.formulas.length > 0 && (
              <div className="my-12 p-8 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-md">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Key Formulas</h3>
                </div>
                <div className="space-y-6">
                  {chapterData.formulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="pb-6 border-b border-border/50 last:border-0 last:pb-0"
                    >
                      <p className="font-semibold text-foreground mb-2">{formula.name}</p>
                      <div className="bg-muted/50 p-4 rounded-md font-mono text-primary font-bold overflow-x-auto text-base tracking-wide">
                        {formula.eq}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{formula.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms */}
            <div className="my-12 p-8 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-serif font-bold text-primary">Key Terms</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Hover over highlighted terms in the text above to see definitions, or review them
                here.
              </p>
              <div className="flex flex-wrap gap-2">
                {chapterData.terms.map((term, idx) => (
                  <span
                    key={idx}
                    className="bg-background border border-border px-3 py-1 rounded-md text-sm font-medium"
                    data-testid={`tag-term-${idx}`}
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>

            {/* Completion Actions */}
            <Separator className="my-12" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 p-6 md:p-8 bg-card border border-border rounded-xl shadow-sm text-center sm:text-left">
              <div>
                <h3 className="font-bold text-lg mb-1">Finished reading?</h3>
                <p className="text-sm text-muted-foreground">
                  Mark this chapter as complete to track your progress.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleMarkComplete}
                disabled={updateProgress.isPending || isLoadingProgress}
                className={
                  progress?.completed ? "bg-green-600 hover:bg-green-700 text-white" : ""
                }
                data-testid="button-mark-complete"
              >
                {isLoadingProgress ? (
                  <Skeleton className="h-5 w-32" />
                ) : progress?.completed ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Completed
                  </>
                ) : (
                  "Mark as Completed"
                )}
              </Button>
            </div>

            {/* Quiz Preview */}
            <Card className="mb-12 border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">Test Your Knowledge</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Take the quiz to confirm your understanding of {chapterData.title}.
                </p>
                <Button size="lg" asChild className="px-8" data-testid="button-start-quiz">
                  <Link href={`/quiz/${chapterId}`}>
                    Start Chapter Quiz <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Chapter Navigation */}
            <div className="flex justify-between items-center py-6 border-t border-border">
              {chapterId > 1 ? (
                <Link href={`/chapter/${chapterId - 1}`}>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-prev-chapter"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous Chapter
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              {chapterId < 7 ? (
                <Link href={`/chapter/${chapterId + 1}`}>
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary"
                    data-testid="button-next-chapter"
                  >
                    Next Chapter <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
}
