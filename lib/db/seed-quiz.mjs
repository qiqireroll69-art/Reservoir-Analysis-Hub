import pg from "pg";
const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await pool.query("DELETE FROM quiz_questions");

  const questions = [
    // ─── CHAPTER 1 ──────────────────────────────────────────────────────────
    {
      chapterId: 1, order: 1, type: "multiple_choice",
      question: "Ano ang pangunahing kahulugan ng Reservoir Petrophysics?",
      options: [
        "Pag-aaral ng mga kemikal na reaksyon sa ilalim ng lupa",
        "Pag-aaral ng mga pisikal na katangian ng bato at fluids sa reservoir upang ma-evaluate ang mga hydrocarbon",
        "Pag-aaral ng seismic waves sa ilalim ng dagat",
        "Pag-aaral ng mga mineral na komposisyon ng sedimentary rocks"
      ],
      correctAnswer: "Pag-aaral ng mga pisikal na katangian ng bato at fluids sa reservoir upang ma-evaluate ang mga hydrocarbon",
      explanation: "Ang Reservoir Petrophysics ay ang pag-aaral ng mga pisikal na katangian ng bato (porosity, permeability) at fluids (tubig, langis, gas) sa isang reservoir formation upang ma-evaluate at ma-estimate ang mga hydrocarbon."
    },
    {
      chapterId: 1, order: 2, type: "multiple_choice",
      question: "Alin sa mga sumusunod ang pangunahing pagkakaiba ng Clastic rocks at Carbonate rocks?",
      options: [
        "Ang clastic ay nabuo mula sa mga fragment ng iba pang bato; ang carbonate ay nabuo mula sa mga organismo at kemikal na precipitation",
        "Ang clastic ay mas mataas ang porosity kaysa carbonate",
        "Ang carbonate ay nabuo sa ilalim ng lupa; ang clastic ay sa ibabaw",
        "Walang pagkakaiba — pareho silang uri ng sandstone"
      ],
      correctAnswer: "Ang clastic ay nabuo mula sa mga fragment ng iba pang bato; ang carbonate ay nabuo mula sa mga organismo at kemikal na precipitation",
      explanation: "Ang Clastic rocks (tulad ng sandstone) ay nabuo mula sa mga detrital fragments ng iba pang bato. Ang Carbonate rocks (tulad ng limestone at dolomite) ay nabuo mula sa mga organismo at kemikal na precipitation ng calcium carbonate."
    },
    {
      chapterId: 1, order: 3, type: "multiple_choice",
      question: "Alin sa mga sumusunod ang tamang formula para sa Porosity (φ)?",
      options: [
        "φ = Vb / Vp",
        "φ = Vp / Vb",
        "φ = Vb × Vp",
        "φ = Vp − Vb"
      ],
      correctAnswer: "φ = Vp / Vb",
      explanation: "Ang Porosity (φ) ay ang ratio ng pore volume (Vp) sa bulk volume (Vb) ng bato: φ = Vp / Vb. Ito ay nagpapakita ng fraction ng volume ng bato na occupied ng pores."
    },
    {
      chapterId: 1, order: 4, type: "multiple_choice",
      question: "Ano ang ibig sabihin ng 'Bubble Point' sa konteksto ng reservoir fluids?",
      options: [
        "Ang pinakamataas na presyon na kaya ng reservoir",
        "Ang presyon kung saan unang nagsisimulang lumabas ang gas mula sa liquid oil sa panahon ng depressurization",
        "Ang temperatura kung saan nagiging gas ang lahat ng oil",
        "Ang punto kung saan nagsisimulang pumasok ang tubig sa reservoir"
      ],
      correctAnswer: "Ang presyon kung saan unang nagsisimulang lumabas ang gas mula sa liquid oil sa panahon ng depressurization",
      explanation: "Ang Bubble Point (o saturation pressure) ay ang presyon kung saan unang lumalabas ang dissolved gas mula sa oil bilang free gas habang bumababa ang presyon ng reservoir. Sa itaas ng bubble point, ang oil ay undersaturated."
    },
    {
      chapterId: 1, order: 5, type: "multiple_choice",
      question: "Alin sa mga sumusunod ang pinakamahusay na naglalarawan ng 'Dew Point' para sa gas reservoir?",
      options: [
        "Ang presyon kung saan nagsisimulang mag-condense ang liquid mula sa gas",
        "Ang temperatura kung saan nag-e-evaporate ang lahat ng liquid",
        "Ang presyon kung saan nag-iisahan ang gas at liquid phase",
        "Ang pinakamababang temperatura ng reservoir"
      ],
      correctAnswer: "Ang presyon kung saan nagsisimulang mag-condense ang liquid mula sa gas",
      explanation: "Ang Dew Point ay ang presyon (sa constant temperature) kung saan nagsisimulang mag-condense ang unang droplet ng liquid mula sa isang gas mixture. Mahalaga ito para sa gas condensate reservoirs."
    },
    {
      chapterId: 1, order: 6, type: "multiple_choice",
      question: "Ano ang pangunahing layunin ng RCAL (Routine Core Analysis) sa reservoir characterization?",
      options: [
        "Pagtukoy ng seismic velocity ng bato",
        "Pagsukat ng basic na porosity, permeability, at fluid saturations ng core samples",
        "Pag-aaral ng kemikal na komposisyon ng mga mineral",
        "Pagsukat ng temperatura ng reservoir"
      ],
      correctAnswer: "Pagsukat ng basic na porosity, permeability, at fluid saturations ng core samples",
      explanation: "Ang RCAL (Routine Core Analysis) ay nagbibigay ng basic measurements ng porosity, permeability (air/liquid), at fluid saturations. Ito ang pundasyon ng core-based reservoir characterization."
    },
    {
      chapterId: 1, order: 7, type: "multiple_choice",
      question: "Alin sa mga uri ng clay distribution ang pinakamalaki ang epekto sa pagbaba ng permeability ng sandstone reservoir?",
      options: [
        "Structural clay",
        "Laminated clay",
        "Dispersed clay",
        "Cemented clay"
      ],
      correctAnswer: "Dispersed clay",
      explanation: "Ang Dispersed clay ay nakalagay sa loob ng pore spaces at sa mga pore throats, na direktang nagbabago ng flow paths at nagpapababa ng permeability. Ang Laminated clay ay nasa separate layers habang ang Structural clay ay part ng grain framework."
    },
    {
      chapterId: 1, order: 8, type: "multiple_choice",
      question: "Ang real gas law na PV = ZnRT — ano ang kinakatawan ng Z-factor?",
      options: [
        "Zero temperature correction",
        "Gas compressibility factor na naglalarawan ng deviation ng real gas mula sa ideal gas behavior",
        "Molar mass ng gas",
        "Ratio ng gas volume sa liquid volume"
      ],
      correctAnswer: "Gas compressibility factor na naglalarawan ng deviation ng real gas mula sa ideal gas behavior",
      explanation: "Ang Z-factor (gas deviation factor o compressibility factor) ay isang dimensionless number na naglalarawan ng kung gaano kalayo ang pag-uugali ng real gas mula sa ideal gas. Sa mataas na presyon, malayo sa 1.0 ang Z-factor."
    },
    {
      chapterId: 1, order: 9, type: "multiple_choice",
      question: "Alin sa mga sumusunod na uri ng hydrocarbon fluids ang may pinakamataas na GOR (Gas-Oil Ratio)?",
      options: [
        "Black Oil",
        "Volatile Oil",
        "Gas Condensate",
        "Dry Gas"
      ],
      correctAnswer: "Dry Gas",
      explanation: "Ang Dry Gas ay halos purong methane at may walang limitasyong GOR dahil walang significant liquid phase. Ang order mula sa pinakamababa hanggang pinakamataas na GOR ay: Black Oil → Volatile Oil → Gas Condensate → Wet Gas → Dry Gas."
    },
    {
      chapterId: 1, order: 10, type: "multiple_choice",
      question: "Sa OOIP formula na N = 7758 × A × h × φ × (1 − Sw) / Bo, ano ang kinakatawan ng (1 − Sw)?",
      options: [
        "Ang fraction ng pore space na puno ng tubig",
        "Ang hydrocarbon pore volume fraction — ang bahagi ng pores na puno ng oil",
        "Ang net-to-gross ratio ng reservoir",
        "Ang recovery factor ng reservoir"
      ],
      correctAnswer: "Ang hydrocarbon pore volume fraction — ang bahagi ng pores na puno ng oil",
      explanation: "Ang (1 − Sw) ay ang hydrocarbon saturation — ang fraction ng pore volume na occupied ng oil. Kung ang Sw = 0.30 (30% tubig), ang (1 − 0.30) = 0.70 ay nangangahulugang 70% ng pore space ay puno ng oil."
    },

    // ─── CHAPTER 2 ──────────────────────────────────────────────────────────
    {
      chapterId: 2, order: 1, type: "multiple_choice",
      question: "Ano ang pagkakaiba ng Total Porosity (φt) at Effective Porosity (φe)?",
      options: [
        "Parehong sumusukat ng lahat ng pore spaces — walang pagkakaiba",
        "Ang φt ay kasama ang lahat ng pores kabilang ang isolated at clay-bound pores; ang φe ay yung interconnected pores lamang na maaaring mag-flow",
        "Ang φe ay palaging mas malaki kaysa φt",
        "Ang φt ay para sa gas; ang φe ay para sa langis"
      ],
      correctAnswer: "Ang φt ay kasama ang lahat ng pores kabilang ang isolated at clay-bound pores; ang φe ay yung interconnected pores lamang na maaaring mag-flow",
      explanation: "Ang Total Porosity (φt) ay kinabibilangan ng lahat ng pore spaces, kasama ang mga isolated pores at clay-bound water. Ang Effective Porosity (φe) ay ang interconnected pore spaces lamang na maaaring maglaman at magpadala ng fluids — ito ang may kaugnayan sa reservoir engineering."
    },
    {
      chapterId: 2, order: 2, type: "multiple_choice",
      question: "Alin ang tamang expression ng Darcy's Law para sa flow rate (q)?",
      options: [
        "q = (μ × L) / (k × A × ΔP)",
        "q = (k × A × ΔP) / (μ × L)",
        "q = k × μ × ΔP",
        "q = A × ΔP / k"
      ],
      correctAnswer: "q = (k × A × ΔP) / (μ × L)",
      explanation: "Ang Darcy's Law ay: q = (k × A × ΔP) / (μ × L), kung saan k = permeability (Darcy), A = cross-sectional area, ΔP = pressure differential, μ = fluid viscosity, at L = length. Nagpapakita ito na ang flow rate ay proportional sa pressure gradient at inversely proportional sa viscosity."
    },
    {
      chapterId: 2, order: 3, type: "multiple_choice",
      question: "Ano ang Primary Porosity sa mga bato?",
      options: [
        "Porosity na nabuo pagkatapos ng deposition dahil sa dissolution o fracturing",
        "Porosity na nabuo sa panahon ng original deposition ng bato (intergranular pores)",
        "Porosity sa fractures lamang",
        "Porosity na mas malaki sa 30%"
      ],
      correctAnswer: "Porosity na nabuo sa panahon ng original deposition ng bato (intergranular pores)",
      explanation: "Ang Primary Porosity ay ang pore spaces na nabuo sa panahon ng depositional process ng bato, tulad ng intergranular pores sa sandstone. Ang Secondary Porosity ay nabuo pagkatapos ng deposition sa pamamagitan ng dissolution, fracturing, o dolomitization."
    },
    {
      chapterId: 2, order: 4, type: "multiple_choice",
      question: "Ano ang 'absolute permeability'?",
      options: [
        "Ang permeability na sinusukat sa presensya ng dalawang fluids",
        "Ang permeability ng bato kapag ito ay 100% saturated ng iisang fluid (karaniwang brine o gas)",
        "Ang permeability sa vertical direction lamang",
        "Ang pinakamataas na posibleng permeability ng bato"
      ],
      correctAnswer: "Ang permeability ng bato kapag ito ay 100% saturated ng iisang fluid (karaniwang brine o gas)",
      explanation: "Ang Absolute Permeability (k) ay ang intrinsic na permeability ng bato nang walang ibang fluid, sinusukat gamit ang brine o non-reactive gas. Ginagamit ito bilang reference sa pagkalkula ng effective at relative permeability."
    },
    {
      chapterId: 2, order: 5, type: "multiple_choice",
      question: "Ang isang bato ay may porosity na 0.20 at ang pore volume ay 40 cc. Ano ang bulk volume ng bato?",
      options: [
        "8 cc",
        "50 cc",
        "200 cc",
        "80 cc"
      ],
      correctAnswer: "200 cc",
      explanation: "Gamit ang φ = Vp / Vb: 0.20 = 40 / Vb, kaya Vb = 40 / 0.20 = 200 cc. Ang bulk volume ay laging mas malaki kaysa pore volume."
    },
    {
      chapterId: 2, order: 6, type: "multiple_choice",
      question: "Ano ang Secondary Porosity na nabuo sa pamamagitan ng dolomitization?",
      options: [
        "Ang pagpapalit ng calcium carbonate ng magnesium na nagdudulot ng contraction at bagong pore spaces",
        "Ang pagtunaw ng limestone sa acidic groundwater",
        "Ang pagbuo ng fractures dahil sa tectonic forces",
        "Ang pagbaba ng grain size sa panahon ng compaction"
      ],
      correctAnswer: "Ang pagpapalit ng calcium carbonate ng magnesium na nagdudulot ng contraction at bagong pore spaces",
      explanation: "Sa dolomitization, ang calcium carbonate (CaCO3) ay napapalitan ng magnesium carbonate (dolomite, CaMg(CO3)2). Dahil mas maliit ang dolomite molecule, nagkakaroon ng contraction na lumilikha ng bagong intercrystalline pore spaces."
    },
    {
      chapterId: 2, order: 7, type: "multiple_choice",
      question: "Ang isang reservoir ay may permeability na 100 mD at isa pang section na may 10 mD. Alin ang mas magandang flow path para sa oil production?",
      options: [
        "Ang 10 mD section dahil mas mataas ang pressure",
        "Ang 100 mD section dahil mas madali ang daloy ng fluids",
        "Parehong seksyon ay magkaparehong daloy",
        "Depende sa viscosity ng oil"
      ],
      correctAnswer: "Ang 100 mD section dahil mas madali ang daloy ng fluids",
      explanation: "Ayon sa Darcy's Law, ang flow rate ay direktang proportional sa permeability. Ang 100 mD (millidarcy) ay 10 beses na mas permeable kaysa 10 mD, kaya ang fluids ay mas madaling dumadaloy dito sa parehong pressure differential."
    },
    {
      chapterId: 2, order: 8, type: "multiple_choice",
      question: "Ano ang Rock Compressibility (cf) at bakit ito mahalaga sa reservoir engineering?",
      options: [
        "Ito ang kakayahan ng bato na mag-imbak ng chemical energy; mahalaga para sa EOR",
        "Ito ang pagbabago ng pore volume per unit pressure change; mahalaga sa pag-estimate ng pressure support mula sa pore volume compaction",
        "Ito ang kalakasan ng bato laban sa tensile stress; mahalaga sa wellbore stability",
        "Ito ang thermal expansion ng bato; mahalaga sa steam injection"
      ],
      correctAnswer: "Ito ang pagbabago ng pore volume per unit pressure change; mahalaga sa pag-estimate ng pressure support mula sa pore volume compaction",
      explanation: "Ang Rock Compressibility (cf = (1/Vp) × dVp/dP) ay sumusukat kung gaano kabago ang pore volume kapag nagbago ang reservoir pressure. Kahit maliit, ito ay nagbibigay ng energy drive sa reservoir, lalo na sa highly compressible formations."
    },
    {
      chapterId: 2, order: 9, type: "multiple_choice",
      question: "Sa usapin ng permeability, ang isang 'tight' reservoir ay may permeability na:",
      options: [
        "Higit sa 100 mD",
        "Mula 1 hanggang 100 mD",
        "Mas mababa sa 0.1 mD (< 100 μD)",
        "Eksaktong 1 Darcy"
      ],
      correctAnswer: "Mas mababa sa 0.1 mD (< 100 μD)",
      explanation: "Ang 'tight' reservoirs ay may napakababang permeability na mas mababa sa 0.1 mD (100 microdarcy). Kabilang dito ang tight gas sands at shale formations na kailangan ng hydraulic fracturing para maging produktibo."
    },
    {
      chapterId: 2, order: 10, type: "multiple_choice",
      question: "Ano ang layunin ng Special Core Analysis (SCAL) kumpara sa RCAL?",
      options: [
        "Ang SCAL ay mas mabilis at mas mura kaysa RCAL",
        "Ang SCAL ay nagbibigay ng advanced multiphase flow properties tulad ng relative permeability at capillary pressure",
        "Ang SCAL ay ginagamit lamang para sa carbonate rocks",
        "Ang SCAL ay sumusukat ng porosity at permeability tulad ng RCAL"
      ],
      correctAnswer: "Ang SCAL ay nagbibigay ng advanced multiphase flow properties tulad ng relative permeability at capillary pressure",
      explanation: "Ang Special Core Analysis (SCAL) ay nagbibigay ng advanced reservoir properties na hindi available sa RCAL, kabilang ang relative permeability curves, capillary pressure, wettability measurements, at electrical properties para sa log interpretation."
    },

    // ─── CHAPTER 3 ──────────────────────────────────────────────────────────
    {
      chapterId: 3, order: 1, type: "multiple_choice",
      question: "Ang formula ng fluid saturation ay Sf = Vf / Vp. Kung ang pore volume ay 50 cc at ang oil volume ay 30 cc, ano ang oil saturation (So)?",
      options: [
        "0.167",
        "0.40",
        "0.60",
        "0.83"
      ],
      correctAnswer: "0.60",
      explanation: "So = Vo / Vp = 30 / 50 = 0.60 o 60%. Nangangahulugan ito na 60% ng pore spaces ay puno ng oil. Tandaan na ang kabuuan ng lahat ng saturations ay dapat katumbas ng 1.0: Sw + So + Sg = 1.0."
    },
    {
      chapterId: 3, order: 2, type: "multiple_choice",
      question: "Ano ang 'Irreducible Water Saturation' (Swir o Swi)?",
      options: [
        "Ang pinakamataas na posibleng water saturation sa reservoir",
        "Ang minimum na water saturation na nananatili sa reservoir kahit anong presyon ang gamitin sa displacement",
        "Ang water saturation sa free water level",
        "Ang water saturation pagkatapos ng water flooding"
      ],
      correctAnswer: "Ang minimum na water saturation na nananatili sa reservoir kahit anong presyon ang gamitin sa displacement",
      explanation: "Ang Irreducible Water Saturation (Swir) ay ang minimum na halaga ng water saturation na hindi na maaaring pabababain dahil hawak ito ng capillary forces sa pinakamaliit na pores at sa grain surfaces. Ito ay connected sa wettability at pore geometry."
    },
    {
      chapterId: 3, order: 3, type: "multiple_choice",
      question: "Alin ang tamang formula para sa Capillary Pressure (Pc)?",
      options: [
        "Pc = r / (2σ cosθ)",
        "Pc = (2σ cosθ) / r",
        "Pc = 2σ × r × cosθ",
        "Pc = cosθ / (2σr)"
      ],
      correctAnswer: "Pc = (2σ cosθ) / r",
      explanation: "Ang Capillary Pressure ay Pc = (2σ cosθ) / r, kung saan σ = interfacial tension, θ = contact angle, at r = pore throat radius. Habang mas maliit ang pore throat (r), mas mataas ang capillary pressure — ibig sabihin, mas mahirap palayasin ang wetting phase."
    },
    {
      chapterId: 3, order: 4, type: "multiple_choice",
      question: "Sa isang water-wet reservoir, paano naka-distribute ang tubig at oil sa pore spaces?",
      options: [
        "Ang oil ay kumakapit sa grain surfaces; ang tubig ay nasa gitna ng pores",
        "Ang tubig ay kumakapit sa grain surfaces bilang thin film; ang oil ay nasa gitna ng pore spaces",
        "Ang tubig at oil ay pantay-pantay na naka-distribute sa lahat ng pores",
        "Ang tubig ay nagiging gas sa mataas na presyon"
      ],
      correctAnswer: "Ang tubig ay kumakapit sa grain surfaces bilang thin film; ang oil ay nasa gitna ng pore spaces",
      explanation: "Sa water-wet rock, ang tubig (wetting phase) ay gustong kumapit sa solid grain surfaces at pumuno ng pinakamaliit na pores. Ang oil (non-wetting phase) ay occupy ang gitna ng mas malalaking pores. Ang wettability ay malaking epekto sa relative permeability at recovery."
    },
    {
      chapterId: 3, order: 5, type: "multiple_choice",
      question: "Ano ang 'Free Water Level' (FWL) sa konteksto ng reservoir?",
      options: [
        "Ang pinakamataas na antas ng tubig sa reservoir",
        "Ang depth kung saan ang capillary pressure ay zero at ang oil-water contact ay nasa equilibrium",
        "Ang antas ng tubig sa surface na nagpapakita ng water table",
        "Ang antas ng production water sa wellbore"
      ],
      correctAnswer: "Ang depth kung saan ang capillary pressure ay zero at ang oil-water contact ay nasa equilibrium",
      explanation: "Ang Free Water Level (FWL) ay ang datum kung saan ang capillary pressure (Pc) = 0, at ang oil at water ay nasa pressure equilibrium. Ang Oil-Water Contact (OWC) ay karaniwang nasa itaas ng FWL dahil sa capillary transition zone."
    },
    {
      chapterId: 3, order: 6, type: "multiple_choice",
      question: "Kung ang Sw = 0.25 at Sg = 0.15, ano ang oil saturation (So)?",
      options: [
        "0.40",
        "0.60",
        "0.75",
        "0.85"
      ],
      correctAnswer: "0.60",
      explanation: "Ayon sa conservation ng saturation: Sw + So + Sg = 1.0. Kaya So = 1.0 − Sw − Sg = 1.0 − 0.25 − 0.15 = 0.60 o 60%. Ito ay isang pundamental na constraint sa lahat ng saturation calculations."
    },
    {
      chapterId: 3, order: 7, type: "multiple_choice",
      question: "Paano nakakaapekto ang mas maliit na pore throat radius sa capillary pressure at fluid entry?",
      options: [
        "Nagpapababa ng capillary pressure; mas madaling pumasok ang non-wetting fluid",
        "Nagpataas ng capillary pressure; mas mahirap pumasok ang non-wetting fluid (tulad ng oil)",
        "Walang epekto sa capillary pressure",
        "Nagpapataas ng capillary pressure; mas madaling pumasok ang non-wetting fluid"
      ],
      correctAnswer: "Nagpataas ng capillary pressure; mas mahirap pumasok ang non-wetting fluid (tulad ng oil)",
      explanation: "Ayon sa Pc = (2σ cosθ) / r, ang capillary pressure ay inversely proportional sa pore throat radius. Mas maliit ang r, mas mataas ang Pc — nangangahulugang mas maraming buoyancy pressure ang kailangan para makapasok ang oil sa ganitong maliit na pores."
    },
    {
      chapterId: 3, order: 8, type: "multiple_choice",
      question: "Ano ang 'Residual Oil Saturation' (Sor)?",
      options: [
        "Ang maximum na oil saturation na maaaring makamit sa reservoir",
        "Ang oil saturation na nananatili pagkatapos ng water flooding na hindi na maaaring ma-produce sa conventional methods",
        "Ang initial oil saturation bago magsimula ang production",
        "Ang oil saturation sa gas cap zone"
      ],
      correctAnswer: "Ang oil saturation na nananatili pagkatapos ng water flooding na hindi na maaaring ma-produce sa conventional methods",
      explanation: "Ang Residual Oil Saturation (Sor) ay ang oil na trapped sa mga pores pagkatapos ng water displacement, hawak ng capillary forces bilang discrete droplets. Ito ang target ng Enhanced Oil Recovery (EOR) operations para ma-mobilize ang trapped oil."
    },
    {
      chapterId: 3, order: 9, type: "multiple_choice",
      question: "Ang 'transition zone' sa pagitan ng oil at water sa isang reservoir ay caused ng:",
      options: [
        "Mixing ng oil at water sa mataas na temperatura",
        "Capillary pressure forces na nagdudulot ng gradual na pagbabago ng saturation mula sa 100% water patungong irreducible water saturation",
        "Gravity segregation ng oil at water",
        "Tectonic forces na naghahalo ng fluids"
      ],
      correctAnswer: "Capillary pressure forces na nagdudulot ng gradual na pagbabago ng saturation mula sa 100% water patungong irreducible water saturation",
      explanation: "Ang transition zone ay likas na resulta ng capillary pressure. Sa halip na abrupt na oil-water contact, mayroong gradual na pagbabago ng water saturation na nakadepende sa height above FWL (h = Pc / (g × Δρ))."
    },
    {
      chapterId: 3, order: 10, type: "multiple_choice",
      question: "Ang intermediate-wet na bato (mixed wettability) ay may kontribusyon sa:",
      options: [
        "Pinakamababang oil recovery",
        "Mas mataas na oil recovery kaysa strongly water-wet o oil-wet rocks sa ilang kaso",
        "Walang epekto sa oil recovery",
        "Pinakamataas na capillary pressure"
      ],
      correctAnswer: "Mas mataas na oil recovery kaysa strongly water-wet o oil-wet rocks sa ilang kaso",
      explanation: "Ang mixed wettability (o intermediate-wet) ay maaaring magbigay ng mas magandang recovery dahil ang oil ay may continuity sa larger pores habang ang water ay nananatili sa mas maliit na pores. Ang optimal wettability para sa maximum recovery ay madalas na slightly water-wet."
    },

    // ─── CHAPTER 4 ──────────────────────────────────────────────────────────
    {
      chapterId: 4, order: 1, type: "multiple_choice",
      question: "Ano ang pangunahing gamit ng Gamma Ray (GR) log sa well log interpretation?",
      options: [
        "Pagsukat ng fluid saturation ng bato",
        "Pagsukat ng natural radioactivity ng bato bilang shale indicator at lithology marker",
        "Pagsukat ng acoustic velocity ng bato",
        "Pagsukat ng electrical resistivity ng formation fluid"
      ],
      correctAnswer: "Pagsukat ng natural radioactivity ng bato bilang shale indicator at lithology marker",
      explanation: "Ang Gamma Ray log ay sumusukat ng natural radioactivity ng bato (pangunahin mula sa potassium, uranium, at thorium sa shale). Ginagamit ito para matukoy ang volume of shale (Vsh) at para ibukod ang clean reservoir intervals mula sa shaly intervals."
    },
    {
      chapterId: 4, order: 2, type: "multiple_choice",
      question: "Ang Archie's Formation Factor (F) formula ay F = a / φ^m. Ano ang ibig sabihin ng 'm' (cementation exponent)?",
      options: [
        "Ang moisture content ng bato",
        "Ang tortuosity o complexity ng pore pathways — nagrerepresenta ng degree ng cementation",
        "Ang molar mass ng brine",
        "Ang numero ng pore connections"
      ],
      correctAnswer: "Ang tortuosity o complexity ng pore pathways — nagrerepresenta ng degree ng cementation",
      explanation: "Ang cementation exponent 'm' sa Archie's equation ay nagrerepresenta ng tortuosity ng pore network. Sa loose sand, m ≈ 1.3; sa well-cemented sandstone, m ≈ 2.0. Mas mataas ang m, mas complex ang pore geometry at mas mataas ang formation factor."
    },
    {
      chapterId: 4, order: 3, type: "multiple_choice",
      question: "Alin ang tamang Archie water saturation equation?",
      options: [
        "Sw = (a × Rw) / (φ^m × Rt)^(1/n)",
        "Sw = [(a × Rw) / (φ^m × Rt)]^(1/n)",
        "Sw = a × Rw × φ^m / Rt^n",
        "Sw = (φ^m × Rt) / (a × Rw × n)"
      ],
      correctAnswer: "Sw = [(a × Rw) / (φ^m × Rt)]^(1/n)",
      explanation: "Ang tamang Archie equation para sa water saturation ay Sw = [(a × Rw) / (φ^m × Rt)]^(1/n), kung saan a = tortuosity factor, Rw = formation water resistivity, φ = porosity, m = cementation exponent, Rt = true formation resistivity, at n = saturation exponent."
    },
    {
      chapterId: 4, order: 4, type: "multiple_choice",
      question: "Bakit nagpapakita ng mataas na resistivity ang isang bato sa resistivity log?",
      options: [
        "Dahil puno ito ng conductive brine (maalat na tubig)",
        "Dahil ang hydrocarbons (oil o gas) at freshwater ay non-conductive kaya mataas ang resistivity",
        "Dahil mataas ang porosity ng bato",
        "Dahil ang bato ay may mataas na temperatura"
      ],
      correctAnswer: "Dahil ang hydrocarbons (oil o gas) at freshwater ay non-conductive kaya mataas ang resistivity",
      explanation: "Ang resistivity log ay sumusukat ng kakayahan ng bato na labanan ang electrical current. Ang mga hydrocarbon (oil, gas) at freshwater ay non-conductive, kaya ang bato na puno ng oil o gas ay nagpapakita ng mataas na resistivity. Ang maalat na brine ay highly conductive (mababang resistivity)."
    },
    {
      chapterId: 4, order: 5, type: "multiple_choice",
      question: "Ano ang GR Index (I_GR) kung ang GR_log = 80 API, GR_min = 20 API, at GR_max = 120 API?",
      options: [
        "0.40",
        "0.50",
        "0.60",
        "0.67"
      ],
      correctAnswer: "0.60",
      explanation: "I_GR = (GR_log − GR_min) / (GR_max − GR_min) = (80 − 20) / (120 − 20) = 60 / 100 = 0.60. Ang GR Index ay ginagamit bilang indicator ng shaliness — ang 0.60 ay nagpapakita ng medyo maraming shale content."
    },
    {
      chapterId: 4, order: 6, type: "multiple_choice",
      question: "Ang Density Porosity formula ay ΦD = (ρ_ma − ρ_b) / (ρ_ma − ρ_fl). Ang matrix density (ρ_ma) ng sandstone ay karaniwang:",
      options: [
        "2.71 g/cc",
        "2.65 g/cc",
        "2.87 g/cc",
        "1.00 g/cc"
      ],
      correctAnswer: "2.65 g/cc",
      explanation: "Ang matrix density ng sandstone (quartz) ay ≈ 2.65 g/cc. Para sa limestone, ρ_ma ≈ 2.71 g/cc; para sa dolomite, ρ_ma ≈ 2.87 g/cc. Ang pagkaalam ng tamang matrix density ay kritikal sa accurate na density porosity calculation."
    },
    {
      chapterId: 4, order: 7, type: "multiple_choice",
      question: "Ano ang 'Shaly Sand Problem' sa well log interpretation?",
      options: [
        "Ang problema ng pagkuha ng samples sa malalim na formation",
        "Ang clay/shale sa sandstone ay nagdudulot ng underestimation ng true water saturation dahil sa extra conductivity ng clay minerals",
        "Ang shale ay nagpapataas ng porosity ng sandstone",
        "Ang sandstone ay nagiging mas mahirap mag-drill sa presensya ng shale"
      ],
      correctAnswer: "Ang clay/shale sa sandstone ay nagdudulot ng underestimation ng true water saturation dahil sa extra conductivity ng clay minerals",
      explanation: "Ang clay minerals ay may cation exchange capacity (CEC) na nagdudulot ng extra electrical conductivity. Kapag ginamit ang simple Archie equation sa shaly sand, ang mataas na conductivity ng clay ay maling maipakita bilang mataas na water saturation, na magdudulot ng false pessimistic evaluation."
    },
    {
      chapterId: 4, order: 8, type: "multiple_choice",
      question: "Ano ang Bulk Volume Water (BVW) at bakit ito ginagamit bilang pay zone indicator?",
      options: [
        "BVW = φ × Sw; Kung constant ang BVW sa isang interval, nagpapakita ito ng irreducible water saturation na nagpapahiwatig ng producible hydrocarbon",
        "BVW = Sw / φ; Ginagamit para sukatin ang water cut sa production",
        "BVW = φ + Sw; Nagpapakita ng total fluid content ng bato",
        "BVW = φ × (1 − Sw); Nagpapakita ng hydrocarbon pore volume"
      ],
      correctAnswer: "BVW = φ × Sw; Kung constant ang BVW sa isang interval, nagpapakita ito ng irreducible water saturation na nagpapahiwatig ng producible hydrocarbon",
      explanation: "Ang BVW = φ × Sw. Sa irreducible water saturation condition, ang BVW ay constant o halos constant sa isang pay zone kahit nagbabago ang porosity — ito ay tinatawag na 'tight zone' indicator. Ang variable BVW ay nagpapakita ng transition zone o water production."
    },
    {
      chapterId: 4, order: 9, type: "multiple_choice",
      question: "Alin ang tamang pagkakasunod-sunod ng mga hakbang sa basic well log interpretation para matukoy ang net pay?",
      options: [
        "1. Saturasyon → 2. Porosity → 3. Shale Volume → 4. Net Pay",
        "1. Shale Volume (Vsh) → 2. Porosity (φ) → 3. Water Saturation (Sw) → 4. Net Pay cutoffs",
        "1. Resistivity → 2. Density → 3. Neutron → 4. Net Pay",
        "1. Porosity → 2. Net Pay → 3. Shale Volume → 4. Saturation"
      ],
      correctAnswer: "1. Shale Volume (Vsh) → 2. Porosity (φ) → 3. Water Saturation (Sw) → 4. Net Pay cutoffs",
      explanation: "Ang standard na workflow ng log interpretation ay: una, kalkulahin ang Vsh mula sa GR log; pangalawa, kalkulahin ang porosity mula sa density/neutron logs (corrected for shale); pangatlo, kalkulahin ang Sw gamit ang Archie (o shaly-sand equation); pang-apat, mag-apply ng cutoffs para matukoy ang net pay."
    },
    {
      chapterId: 4, order: 10, type: "multiple_choice",
      question: "Ang NMR (Nuclear Magnetic Resonance) logging ay espesyal na kapaki-pakinabang para sa:",
      options: [
        "Pagsukat ng natural radioactivity ng shale",
        "Pagsukat ng T2 relaxation time para matukoy ang pore size distribution, free fluid at bound fluid volumes",
        "Pagsukat ng acoustic velocity ng bato",
        "Pagsukat ng mataas na temperatura sa formation"
      ],
      correctAnswer: "Pagsukat ng T2 relaxation time para matukoy ang pore size distribution, free fluid at bound fluid volumes",
      explanation: "Ang NMR logging ay sumusukat ng T2 relaxation time ng hydrogen nuclei sa formation fluids. Nagbibigay ito ng pore size distribution, free fluid index (FFI), bulk volume irreducible (BVI), at permeability estimates — lahat nang hindi naapektuhan ng matrix lithology."
    },

    // ─── CHAPTER 5 ──────────────────────────────────────────────────────────
    {
      chapterId: 5, order: 1, type: "multiple_choice",
      question: "Ano ang 'Critical Point' sa isang pressure-temperature (PT) phase diagram?",
      options: [
        "Ang pinakamababang presyon sa reservoir",
        "Ang punto kung saan ang gas at liquid phase ay magkaparehong density at composition — ang dalawang phase ay nagiging isa",
        "Ang temperatura kung saan nagsisimulang mag-flow ang oil",
        "Ang pinakamataas na GOR ng reservoir"
      ],
      correctAnswer: "Ang punto kung saan ang gas at liquid phase ay magkaparehong density at composition — ang dalawang phase ay nagiging isa",
      explanation: "Ang Critical Point ay ang end point ng dew point at bubble point curves sa PT phase diagram. Sa itaas ng critical temperature at pressure, ang fluids ay nasa supercritical state at walang malinaw na pagkakaiba sa pagitan ng gas at liquid."
    },
    {
      chapterId: 5, order: 2, type: "multiple_choice",
      question: "Ang API Gravity formula ay °API = (141.5 / SG) − 131.5. Kung ang SG ng oil ay 0.876, ano ang API gravity nito?",
      options: [
        "20 °API",
        "25 °API",
        "30 °API",
        "35 °API"
      ],
      correctAnswer: "30 °API",
      explanation: "°API = (141.5 / 0.876) − 131.5 = 161.53 − 131.5 ≈ 30 °API. Ang 30 °API ay katumbas ng medium density crude oil. Sa pangkalahatan: < 22 °API = heavy oil, 22–35 °API = medium oil, > 35 °API = light oil."
    },
    {
      chapterId: 5, order: 3, type: "multiple_choice",
      question: "Ano ang Oil Formation Volume Factor (Bo)?",
      options: [
        "Ang volume ng oil sa reservoir conditions divided by ang volume ng oil sa standard conditions",
        "Ang volume ng oil sa standard conditions divided by ang volume ng oil sa reservoir conditions",
        "Ang ratio ng gas volume sa oil volume sa reservoir",
        "Ang compressibility ng oil sa reservoir conditions"
      ],
      correctAnswer: "Ang volume ng oil sa reservoir conditions divided by ang volume ng oil sa standard conditions",
      explanation: "Ang Bo = V_res / V_st. Ang Bo ay palaging > 1.0 para sa undersaturated oil dahil ang oil sa reservoir ay may dissolved gas at mas mainit, kaya mas malaki ang volume. Ginagamit ito para i-convert ang reservoir volumes sa surface (stock tank) conditions para sa reserves calculation."
    },
    {
      chapterId: 5, order: 4, type: "multiple_choice",
      question: "Ano ang 'Solution GOR' (Rs) at paano ito nagbabago habang bumababa ang reservoir pressure sa ibaba ng bubble point?",
      options: [
        "Ang Rs ay tumataas habang bumababa ang presyon dahil mas maraming gas ang lumalabas",
        "Ang Rs ay bumababa habang bumababa ang presyon sa ibaba ng bubble point dahil ang dissolved gas ay lumalabas sa solution",
        "Ang Rs ay constant sa lahat ng presyon",
        "Ang Rs ay zero sa ibaba ng bubble point"
      ],
      correctAnswer: "Ang Rs ay bumababa habang bumababa ang presyon sa ibaba ng bubble point dahil ang dissolved gas ay lumalabas sa solution",
      explanation: "Ang Solution GOR (Rs = V_gas(sc) / V_oil(st)) ay ang dami ng dissolved gas sa oil sa reservoir conditions. Habang bumababa ang presyon sa ibaba ng bubble point, ang gas ay lumalabas sa solution bilang free gas, kaya bumababa ang Rs. Sa bubble point, ang Rs ay maximum (initial solution GOR = Rsi)."
    },
    {
      chapterId: 5, order: 5, type: "multiple_choice",
      question: "Alin ang tamang klasipikasyon ng reservoir fluid batay sa reservoir temperature at pressure relative sa phase envelope?",
      options: [
        "Kung ang reservoir temperature ay mas mataas sa cricondentherm, ito ay black oil",
        "Kung ang reservoir temperature ay mas mataas sa cricondentherm, ito ay dry gas (single phase gas)",
        "Kung ang reservoir pressure ay mas mababa sa bubble point, ito ay gas condensate",
        "Kung ang reservoir temperature ay mas mababa sa critical temperature, ito ay dry gas"
      ],
      correctAnswer: "Kung ang reservoir temperature ay mas mataas sa cricondentherm, ito ay dry gas (single phase gas)",
      explanation: "Ang Cricondentherm ay ang pinakamataas na temperatura sa two-phase region. Kung ang reservoir temperature ay mas mataas sa cricondentherm, ang fluids ay nasa single-phase gas state sa lahat ng presyon — ito ang dry gas. Walang liquid ang magfo-form kahit sa surface."
    },
    {
      chapterId: 5, order: 6, type: "multiple_choice",
      question: "Ano ang 'retrograde condensation' at sa anong uri ng reservoir ito nangyayari?",
      options: [
        "Ang process kung saan ang gas ay nag-e-evaporate habang tumataas ang presyon — nangyayari sa black oil reservoir",
        "Ang pagbuo ng liquid condensate habang BUMABABA ang presyon sa loob ng two-phase region — nangyayari sa gas condensate reservoir",
        "Ang pagbuo ng gas bubbles habang TUMATAAS ang presyon — nangyayari sa water reservoir",
        "Ang process ng oil expansion sa pagtaas ng temperatura"
      ],
      correctAnswer: "Ang pagbuo ng liquid condensate habang BUMABABA ang presyon sa loob ng two-phase region — nangyayari sa gas condensate reservoir",
      explanation: "Sa gas condensate reservoir, habang bumababa ang presyon sa ibaba ng dew point, nagsisimulang mag-condense ang liquid droplets mula sa gas — tinatawag itong retrograde condensation. Ang condensate saturation ay tumataas sa ibaba ng dew point, at kapag naabot na ang maximum condensate saturation, bumababa na ito dahil sa re-vaporization."
    },
    {
      chapterId: 5, order: 7, type: "multiple_choice",
      question: "Ano ang pagkakaiba ng Wet Gas at Dry Gas reservoir?",
      options: [
        "Ang wet gas ay may mixed na tubig; ang dry gas ay walang tubig",
        "Ang wet gas ay may sapat na heavy hydrocarbons para mag-produce ng NGL (natural gas liquids) sa surface; ang dry gas ay halos purong methane",
        "Ang wet gas ay mas mataas ang presyon kaysa dry gas",
        "Ang wet gas ay nasa liquid phase sa reservoir; ang dry gas ay nasa gas phase"
      ],
      correctAnswer: "Ang wet gas ay may sapat na heavy hydrocarbons para mag-produce ng NGL (natural gas liquids) sa surface; ang dry gas ay halos purong methane",
      explanation: "Ang Wet Gas (o Rich Gas) ay naglalaman ng mas mabibigat na hydrocarbon components (ethane, propane, butane, pentane+) na condensate sa surface conditions bilang Natural Gas Liquids (NGL). Ang Dry Gas (Lean Gas) ay halos purong methane at walang significant na liquid production sa surface."
    },
    {
      chapterId: 5, order: 8, type: "multiple_choice",
      question: "Bakit mas mataas ang Bo (oil formation volume factor) ng volatile oil kumpara sa black oil?",
      options: [
        "Dahil mas mababa ang GOR ng volatile oil",
        "Dahil mas maraming dissolved gas ang volatile oil at ang molecules ay mas maliit at mas mobile sa mas mataas na temperatura ng reservoir",
        "Dahil mas mababa ang API gravity ng volatile oil",
        "Dahil ang volatile oil ay laging saturated sa reservoir conditions"
      ],
      correctAnswer: "Dahil mas maraming dissolved gas ang volatile oil at ang molecules ay mas maliit at mas mobile sa mas mataas na temperatura ng reservoir",
      explanation: "Ang Volatile Oil ay may mas mataas na GOR (1,000–3,300 scf/STB) at mas mataas na API gravity (> 45 °API) kaysa black oil. Ito ay may mas malaking dissolved gas content, kaya mas malaki ang Bo (maaaring > 1.75 RB/STB). Ang reservoir temperature nito ay malapit sa critical temperature."
    },
    {
      chapterId: 5, order: 9, type: "multiple_choice",
      question: "Ano ang isothermal oil compressibility (co) at paano ito gumagana sa ibaba ng bubble point?",
      options: [
        "Ang co ay constant sa lahat ng presyon",
        "Sa ibaba ng bubble point, ang co ay tumataas nang malaki dahil sa paglabas ng gas — effective compressibility ay mas mataas dahil sa dalawang fluid phases",
        "Sa ibaba ng bubble point, ang co ay bumababa nang malaki",
        "Ang co ay zero sa ibaba ng bubble point"
      ],
      correctAnswer: "Sa ibaba ng bubble point, ang co ay tumataas nang malaki dahil sa paglabas ng gas — effective compressibility ay mas mataas dahil sa dalawang fluid phases",
      explanation: "Sa ibaba ng bubble point, ang free gas ay lumalabas mula sa solution. Ang gas ay mas compressible kaysa liquid, kaya ang effective (or total) compressibility ng reservoir system ay tumataas nang malaki. Ito ay nagbibigay ng additional energy drive sa reservoir."
    },
    {
      chapterId: 5, order: 10, type: "multiple_choice",
      question: "Alin ang tamang order ng hydrocarbon fluid types mula sa pinakamababa hanggang pinakamataas na GOR?",
      options: [
        "Dry Gas → Wet Gas → Gas Condensate → Volatile Oil → Black Oil",
        "Black Oil → Volatile Oil → Gas Condensate → Wet Gas → Dry Gas",
        "Black Oil → Gas Condensate → Volatile Oil → Wet Gas → Dry Gas",
        "Volatile Oil → Black Oil → Wet Gas → Gas Condensate → Dry Gas"
      ],
      correctAnswer: "Black Oil → Volatile Oil → Gas Condensate → Wet Gas → Dry Gas",
      explanation: "Ang tamang order ng pagtaas ng GOR ay: Black Oil (< 2,000 scf/STB) → Volatile Oil (2,000–3,300 scf/STB) → Gas Condensate (3,300–100,000 scf/STB) → Wet Gas (> 100,000 scf/STB) → Dry Gas (walang significant liquid). Ito ay nagpapakita rin ng pagtaas ng reservoir temperature at dominance ng lighter components."
    },

    // ─── CHAPTER 6 ──────────────────────────────────────────────────────────
    {
      chapterId: 6, order: 1, type: "multiple_choice",
      question: "Ano ang 'relative permeability' (kr) at paano ito naiiba sa absolute permeability?",
      options: [
        "Ang kr ay palaging mas malaki kaysa absolute permeability",
        "Ang kr ay ang dimensionless ratio ng effective permeability ng isang fluid sa absolute permeability — sumusukat ng kakayahan ng bato na mag-conduct ng isa sa maraming fluids",
        "Ang kr ay sumusukat ng permeability sa vertical direction lamang",
        "Ang kr ay palaging 1.0 sa reservoir conditions"
      ],
      correctAnswer: "Ang kr ay ang dimensionless ratio ng effective permeability ng isang fluid sa absolute permeability — sumusukat ng kakayahan ng bato na mag-conduct ng isa sa maraming fluids",
      explanation: "Ang relative permeability (kr_o = k_o / k; kr_w = k_w / k) ay ang ratio ng effective permeability ng isa sa maraming fluids sa absolute permeability. Ito ay isang function ng fluid saturation at wettability, at palaging nag-iiba sa pagitan ng 0 at 1."
    },
    {
      chapterId: 6, order: 2, type: "multiple_choice",
      question: "Ang fractional flow equation ay fw = 1 / [1 + (kro/krw) × (μw/μo)]. Ano ang mangyayari sa fw habang tumataas ang water saturation (Sw)?",
      options: [
        "Ang fw ay bumababa dahil mas maraming oil ang dumadaloy",
        "Ang fw ay tumataas dahil habang tumataas ang Sw, ang kro ay bumababa at krw ay tumataas, na nagpapataas ng water cut",
        "Ang fw ay constant sa lahat ng saturations",
        "Ang fw ay negative sa mataas na water saturation"
      ],
      correctAnswer: "Ang fw ay tumataas dahil habang tumataas ang Sw, ang kro ay bumababa at krw ay tumataas, na nagpapataas ng water cut",
      explanation: "Sa fractional flow curve, habang tumataas ang Sw (water saturation), ang kro (oil relative perm) ay bumababa habang ang krw (water relative perm) ay tumataas. Ang resulta ay mas mataas na fw (water fraction sa produced fluid), na nagpapakita ng pagtaas ng water cut sa produksyon."
    },
    {
      chapterId: 6, order: 3, type: "multiple_choice",
      question: "Ang Mobility Ratio (M) = λ_w / λ_o. Kung ang M > 1, ano ang implikasyon nito sa water flooding?",
      options: [
        "Mas mabilis ang oil kaysa tubig — magandang sweep efficiency",
        "Mas mabilis ang tubig kaysa oil — maaaring magdulot ng 'fingering' at masamang sweep efficiency",
        "Walang epekto sa sweep efficiency",
        "Ang tubig at oil ay magkaparehong bilis"
      ],
      correctAnswer: "Mas mabilis ang tubig kaysa oil — maaaring magdulot ng 'fingering' at masamang sweep efficiency",
      explanation: "Ang Mobility Ratio M = (krw/μw) / (kro/μo). Kung M > 1, ang tubig ay mas mobile kaysa oil — ito ay unfavorable dahil ang tubig ay may tendency na 'finger through' at mag-bypass ng oil, na nagdudulot ng masamang areal sweep efficiency at maagang water breakthrough."
    },
    {
      chapterId: 6, order: 4, type: "multiple_choice",
      question: "Paano nakakaapekto ang 'solution gas drive' sa production behavior ng oil reservoir?",
      options: [
        "Ang pressure ay mananatiling constant habang nagpo-produce",
        "Ang dissolved gas ay lumalabas sa solution habang bumababa ang presyon, nagbibigay ng energy drive ngunit nagdudulot din ng pagtaas ng GOR",
        "Ang solution gas drive ay nagpapababa ng GOR sa panahon ng produksyon",
        "Ang solution gas drive ay ang pinaka-efficient na drive mechanism"
      ],
      correctAnswer: "Ang dissolved gas ay lumalabas sa solution habang bumababa ang presyon, nagbibigay ng energy drive ngunit nagdudulot din ng pagtaas ng GOR",
      explanation: "Sa solution gas drive (o dissolved gas drive), ang energy para sa produksyon ay galing sa expansion ng dissolved gas habang bumababa ang reservoir pressure sa ibaba ng bubble point. Ang GOR ay unang mababa, pagkatapos ay tumataas habang bumababa ang presyon. Recovery factor ay karaniwang 15–30% OOIP."
    },
    {
      chapterId: 6, order: 5, type: "multiple_choice",
      question: "Ano ang 'Capillary Number' (Nc) at bakit ito mahalaga sa EOR?",
      options: [
        "Ang Nc ay sumusukat ng compressibility ng fluids",
        "Ang Nc ay ang ratio ng viscous forces sa capillary forces — mas mataas ang Nc, mas maraming trapped oil ang maaaring ma-mobilize",
        "Ang Nc ay sumusukat ng thermal energy ng reservoir",
        "Ang Nc ay ang bilang ng pore connections sa bato"
      ],
      correctAnswer: "Ang Nc ay ang ratio ng viscous forces sa capillary forces — mas mataas ang Nc, mas maraming trapped oil ang maaaring ma-mobilize",
      explanation: "Ang Capillary Number (Nc = μv/σ) ay ang ratio ng viscous forces sa capillary forces. Para ma-mobilize ang residual oil (Sor), kailangan itaas ang Nc ng mga 2–3 orders of magnitude. Ito ang basis ng chemical EOR — ang surfactants ay nagpapababa ng interfacial tension (σ) para mapataas ang Nc."
    },
    {
      chapterId: 6, order: 6, type: "multiple_choice",
      question: "Sa relative permeability curves, ano ang ibig sabihin ng 'crossover point'?",
      options: [
        "Ang punto kung saan ang reservoir ay nagsisimulang mag-produce ng tubig",
        "Ang water saturation kung saan ang kr_w = kr_o — nagpapakita ng balanced mobility ng dalawang phases",
        "Ang pinakamataas na porosity ng reservoir",
        "Ang punto kung saan nababago ang wettability ng bato"
      ],
      correctAnswer: "Ang water saturation kung saan ang kr_w = kr_o — nagpapakita ng balanced mobility ng dalawang phases",
      explanation: "Ang crossover point sa relative permeability curves ay ang Sw kung saan ang kr_w = kr_o. Sa water-wet rocks, ang crossover ay karaniwang nasa mataas na Sw (> 0.5); sa oil-wet rocks, maagang mangyari ang crossover. Nagpapakita ito ng balance ng mobility ng dalawang phases."
    },
    {
      chapterId: 6, order: 7, type: "multiple_choice",
      question: "Ang 'rock-fluid interaction' ay nakakaapekto sa reservoir performance sa pamamagitan ng:",
      options: [
        "Pagbabago ng kapal ng formation",
        "Wettability, capillary pressure, at relative permeability na nagtutukoy ng fluid distribution at displacement efficiency",
        "Pagbabago ng seismic velocity ng bato",
        "Pagbabago ng lithology ng reservoir"
      ],
      correctAnswer: "Wettability, capillary pressure, at relative permeability na nagtutukoy ng fluid distribution at displacement efficiency",
      explanation: "Ang rock-fluid interaction ay komplikadong proseso na nakakaapekto sa wettability (distribution ng fluids sa pores), capillary pressure (imbak ng energy at fluid contacts), at relative permeability (flow capacity ng bawat phase). Sama-sama, tinutukoy nila ang displacement efficiency at ultimate recovery."
    },
    {
      chapterId: 6, order: 8, type: "multiple_choice",
      question: "Ano ang 'mobility' (λ) ng isang fluid at paano ito kinakalkula?",
      options: [
        "λ = k × μ — bawat fluid ay may sariling mobility na proportional sa permeability at viscosity",
        "λ = kr / μ — ang effective permeability ng fluid divided by viscosity",
        "λ = μ / kr — ang viscosity divided by relative permeability",
        "λ = k × kr — ang product ng absolute at relative permeability"
      ],
      correctAnswer: "λ = kr / μ — ang effective permeability ng fluid divided by viscosity",
      explanation: "Ang Mobility (λ = kr / μ) ay sumusukat ng kakayahan ng isang fluid na dumadaloy sa bato. Mas mataas ang kr (relative permeability) at mas mababa ang μ (viscosity), mas mataas ang mobility. Ginagamit ito sa pagkalkula ng Mobility Ratio (M) na critical sa water/gas flooding design."
    },
    {
      chapterId: 6, order: 9, type: "multiple_choice",
      question: "Bakit mas mababa ang recovery factor ng oil-wet reservoir kumpara sa water-wet reservoir sa ilalim ng water flooding?",
      options: [
        "Dahil mas mataas ang porosity ng water-wet reservoir",
        "Sa oil-wet rock, ang oil ay kumakapit sa grains at mas mahirap ilabas; ang tubig ay dumadaraan sa gitna ng pores nang hindi nang-displace ng oil",
        "Dahil mas mataas ang permeability ng water-wet reservoir",
        "Walang pagkakaiba sa recovery ng dalawang uri ng wettability"
      ],
      correctAnswer: "Sa oil-wet rock, ang oil ay kumakapit sa grains at mas mahirap ilabas; ang tubig ay dumadaraan sa gitna ng pores nang hindi nang-displace ng oil",
      explanation: "Sa oil-wet rocks, ang oil ay strongly adhered sa grain surfaces. Kapag nag-flood ng tubig, ang tubig ay dumadaraan sa gitna ng larger pores (non-wetting phase), habang ang oil ay nananatili sa grain surfaces. Ito ay nagdudulot ng mas mataas na residual oil saturation (Sor) at mas mababang recovery."
    },
    {
      chapterId: 6, order: 10, type: "multiple_choice",
      question: "Ano ang epekto ng 'gas cap drive' sa oil reservoir performance?",
      options: [
        "Ang gas cap ay nagpapababa ng reservoir pressure nang mabilis",
        "Ang gas cap ay nagbibigay ng pressure support sa pag-expand ng free gas sa ibabaw ng oil, na tumutulong sa mas mabagal na pressure decline at mas magandang oil recovery",
        "Ang gas cap drive ay ang pinaka-inefficient na drive mechanism",
        "Ang gas cap ay hindi nakakaapekto sa oil production rate"
      ],
      correctAnswer: "Ang gas cap ay nagbibigay ng pressure support sa pag-expand ng free gas sa ibabaw ng oil, na tumutulong sa mas mabagal na pressure decline at mas magandang oil recovery",
      explanation: "Ang Gas Cap Drive ay nagbibigay ng energy sa pamamagitan ng pagtaas ng free gas cap na nagpupush ng oil pababa. Ang recovery factor ay karaniwang 20–40% OOIP — mas mataas kaysa solution gas drive. Ang GOR ay tumataas habang lumalaki ang gas cap zone."
    },

    // ─── CHAPTER 7 ──────────────────────────────────────────────────────────
    {
      chapterId: 7, order: 1, type: "multiple_choice",
      question: "Alin ang STOIIP (Stock Tank Original Oil In Place) formula?",
      options: [
        "N = 7758 × A × h × φ × Sw / Boi",
        "N = 7758 × A × h × φ × (1 − Sw) / Boi",
        "N = 43,560 × A × h × φ × (1 − Sw) / Bgi",
        "N = 7758 × A × h × (1 − φ) × (1 − Sw) / Boi"
      ],
      correctAnswer: "N = 7758 × A × h × φ × (1 − Sw) / Boi",
      explanation: "Ang STOIIP formula ay N = 7758 × A × h × φ × (1 − Sw) / Boi, kung saan 7758 ay ang conversion factor (bbl/acre-ft), A = drainage area (acres), h = net pay thickness (ft), φ = porosity, (1 − Sw) = hydrocarbon saturation, at Boi = initial oil FVF."
    },
    {
      chapterId: 7, order: 2, type: "multiple_choice",
      question: "Ano ang Recovery Factor (RF) at paano ito ginagamit sa reserves calculation?",
      options: [
        "RF = Np / N; Ang reserves ay RF × STOIIP — nagpapakita ng fraction ng OOIP na maaaring ma-produce",
        "RF = N / Np; Ang reserves ay RF × production rate",
        "RF = (N − Np) / N; Nagpapakita ng remaining reserves",
        "RF = Np × Bo; Nagpapakita ng produced oil volume sa reservoir conditions"
      ],
      correctAnswer: "RF = Np / N; Ang reserves ay RF × STOIIP — nagpapakita ng fraction ng OOIP na maaaring ma-produce",
      explanation: "Ang Recovery Factor (RF = Np / N) ay ang fraction ng original oil in place na maaaring ma-produce sa economic limit. Ang recoverable reserves ay RF × STOIIP. Ang RF ay nakadepende sa drive mechanism, wettability, viscosity, at development strategy."
    },
    {
      chapterId: 7, order: 3, type: "multiple_choice",
      question: "Alin ang pinaka-efficient na primary drive mechanism sa terms ng oil recovery factor?",
      options: [
        "Solution Gas Drive (15–30% OOIP)",
        "Gas Cap Drive (20–40% OOIP)",
        "Water Drive (25–50% OOIP)",
        "Rock/Fluid Expansion (1–5% OOIP)"
      ],
      correctAnswer: "Water Drive (25–50% OOIP)",
      explanation: "Ang Natural Water Drive ay karaniwang pinaka-efficient na primary drive mechanism dahil ang tubig ay incompressible at nagbibigay ng malakas na pressure support. Ang recovery factor ay karaniwang 25–50% OOIP, na mas mataas kaysa solution gas (15–30%) at gas cap drive (20–40%)."
    },
    {
      chapterId: 7, order: 4, type: "multiple_choice",
      question: "Ano ang 'Productivity Index' (PI) at paano ito ginagamit sa reservoir management?",
      options: [
        "PI = (P_r − P_wf) / q; Nagpapakita ng pressure loss per unit flow rate",
        "PI = q / (P_r − P_wf); Nagpapakita ng produksyon per unit pressure drawdown — mas mataas ang PI, mas produktibo ang balon",
        "PI = q × μ; Nagpapakita ng viscosity-corrected production rate",
        "PI = P_r × q; Nagpapakita ng total energy ng reservoir"
      ],
      correctAnswer: "PI = q / (P_r − P_wf); Nagpapakita ng produksyon per unit pressure drawdown — mas mataas ang PI, mas produktibo ang balon",
      explanation: "Ang Productivity Index (PI = q / (P_r − P_wf)) ay sumusukat ng productivity ng balon. Ginagamit ito para matantiya ang maximum production rate, mag-design ng artificial lift systems, at subaybayan ang performance ng balon sa panahon. Ang pagbaba ng PI ay maaaring magpahiwatig ng formation damage o reservoir depletion."
    },
    {
      chapterId: 7, order: 5, type: "multiple_choice",
      question: "Ano ang pangunahing layunin ng Secondary Recovery methods (water o gas injection)?",
      options: [
        "Palitan ang primary drive mechanism ng mas mahusay na artificial drive para mapanatili ang reservoir pressure at mag-displace ng karagdagang oil",
        "Baguhin ang chemistry ng reservoir fluids",
        "Maglagay ng bagong perforations sa wellbore",
        "Palawakin ang drainage area ng balon"
      ],
      correctAnswer: "Palitan ang primary drive mechanism ng mas mahusay na artificial drive para mapanatili ang reservoir pressure at mag-displace ng karagdagang oil",
      explanation: "Ang Secondary Recovery (water flooding o gas injection) ay nagpapanatili ng reservoir pressure at nagdadagdag ng displacement energy pagkatapos mawalan ng natural pressure support. Ang water flooding ay karaniwang nagdaragdag ng 15–25% OOIP sa primary recovery."
    },
    {
      chapterId: 7, order: 6, type: "multiple_choice",
      question: "Ano ang Material Balance Equation (MBE) at para saan ito ginagamit?",
      options: [
        "Isang seismic interpretation tool para matukoy ang reservoir boundaries",
        "Isang mass conservation equation na nag-e-equate ng expansion ng reservoir fluids at rock sa cumulative production — ginagamit para ma-estimate ang OOIP at drive mechanisms",
        "Isang formula para kalkulahin ang production rate mula sa wellbore",
        "Isang method para mag-calculate ng viscosity ng oil"
      ],
      correctAnswer: "Isang mass conservation equation na nag-e-equate ng expansion ng reservoir fluids at rock sa cumulative production — ginagamit para ma-estimate ang OOIP at drive mechanisms",
      explanation: "Ang Material Balance Equation (MBE) ay isang pundamental na tool sa reservoir engineering na nagsasabing ang cumulative production ay dapat katumbas ng total expansion ng fluids at rock sa loob ng reservoir. Ginagamit ito para ma-verify ang OOIP, matukoy ang active drive mechanisms, at ma-predict ang future performance."
    },
    {
      chapterId: 7, order: 7, type: "multiple_choice",
      question: "Alin ang uri ng EOR (Enhanced Oil Recovery) na gumagamit ng heat para mabawasan ang viscosity ng heavy oil?",
      options: [
        "Chemical EOR (surfactant flooding)",
        "Miscible Gas EOR (CO2 injection)",
        "Thermal EOR (steam injection, in-situ combustion)",
        "Microbial EOR (MEOR)"
      ],
      correctAnswer: "Thermal EOR (steam injection, in-situ combustion)",
      explanation: "Ang Thermal EOR ay ginagamit para sa heavy oil at tar sands kung saan ang viscosity ng oil ay napakataas para sa conventional production. Ang steam injection (SAGD, CSS) ay nagpapainit ng oil at nagpapababa ng viscosity nang malaki, na nagpapahintulot sa oil na dumadaloy. Ang in-situ combustion ay nagsusunog ng maliit na bahagi ng oil para mapainit ang reservoir."
    },
    {
      chapterId: 7, order: 8, type: "multiple_choice",
      question: "Ano ang GOR trend na karaniwan sa isang solution gas drive reservoir habang tumatagal ang produksyon?",
      options: [
        "Ang GOR ay constant sa lahat ng panahon ng produksyon",
        "Ang GOR ay unang mababa (sa itaas ng bubble point), pagkatapos ay tumataas nang mabilis habang bumababa ang presyon sa ibaba ng bubble point",
        "Ang GOR ay tumataas-bumababa nang paulit-ulit",
        "Ang GOR ay patuloy na bumababa sa buong produksyon"
      ],
      correctAnswer: "Ang GOR ay unang mababa (sa itaas ng bubble point), pagkatapos ay tumataas nang mabilis habang bumababa ang presyon sa ibaba ng bubble point",
      explanation: "Sa solution gas drive reservoir: Sa itaas ng bubble point, ang oil ay undersaturated at ang GOR ay constant (equal sa initial solution GOR, Rsi). Sa ibaba ng bubble point, ang free gas ay lumalabas at ang GOR ay tumataas nang mabilis. Ang mataas at patuloy na pagtaas ng GOR ay nagpapahiwatig ng advanced depletion."
    },
    {
      chapterId: 7, order: 9, type: "multiple_choice",
      question: "Ang GIIP (Gas Initially In Place) formula ay G = 43,560 × A × h × φ × (1 − Sw) / Bgi. Bakit 43,560 ang conversion factor (imbes na 7758 para sa oil)?",
      options: [
        "Dahil mas mababa ang density ng gas kaysa oil",
        "Dahil ang 43,560 ay ang conversion factor mula sa acre-feet sa cubic feet (cu ft/acre-ft), na naaangkop sa gas volumes",
        "Dahil ang gas ay mas compressible kaysa oil",
        "Dahil ang gas reserves ay palaging mas malaki kaysa oil reserves"
      ],
      correctAnswer: "Dahil ang 43,560 ay ang conversion factor mula sa acre-feet sa cubic feet (cu ft/acre-ft), na naaangkop sa gas volumes",
      explanation: "Ang 43,560 cu ft/acre-ft ay ang bilang ng cubic feet sa isang acre-foot (1 acre = 43,560 sq ft). Para sa gas, ang volume ay sinusukat sa standard cubic feet (scf), kaya ginagamit ang 43,560. Para sa oil, ginagamit ang 7,758 bbl/acre-ft (1 acre-ft = 7,758 barrels)."
    },
    {
      chapterId: 7, order: 10, type: "multiple_choice",
      question: "Ano ang 'Decline Curve Analysis' (DCA) at para sa anong layunin ito ginagamit?",
      options: [
        "Isang seismic tool para matukoy ang declining reservoir boundaries",
        "Isang empirical method (Arps equations) na nag-a-analyze ng historical production data para mag-forecast ng future production at ma-estimate ang remaining reserves",
        "Isang tool para matukoy ang declining permeability ng reservoir",
        "Isang method para matukoy ang optimal injection rate sa water flooding"
      ],
      correctAnswer: "Isang empirical method (Arps equations) na nag-a-analyze ng historical production data para mag-forecast ng future production at ma-estimate ang remaining reserves",
      explanation: "Ang Decline Curve Analysis (DCA) gamit ang Arps equations (exponential, hyperbolic, harmonic) ay nag-a-analyze ng rate-time production data para mag-forecast ng future production rates at ma-estimate ng Estimated Ultimate Recovery (EUR) at remaining reserves. Ito ay isa sa pinaka-widely used na methods sa reserves estimation."
    },
  ];

  // Insert all questions
  for (const q of questions) {
    await pool.query(
      `INSERT INTO quiz_questions (chapter_id, type, question, options, correct_answer, explanation, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [q.chapterId, q.type, q.question, q.options || null, q.correctAnswer, q.explanation, q.order]
    );
  }

  console.log(`✅ Seeded ${questions.length} quiz questions across 7 chapters.`);
  await pool.end();
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
