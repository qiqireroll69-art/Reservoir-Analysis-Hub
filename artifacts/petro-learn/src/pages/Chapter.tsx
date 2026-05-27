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
  1: "Panimula sa Reservoir Petrophysics",
  2: "Mga Pangunahing Kaalaman sa Reservoir Petrophysics",
  3: "Fluid Saturation, Wettability at Capillary Pressure",
  4: "Interpretasyon ng Well Logs",
  5: "Mga PVT Properties at Phase Behavior ng Hydrocarbon",
  6: "Integrasyon ng Petrophysics at Phase Behavior",
  7: "Aplikasyon sa Reservoir Engineering",
};

const CHAPTER_CONTENT: Record<number, ChapterData> = {
  1: {
    title: "Panimula sa Reservoir Petrophysics",
    overview:
      "Isang panimula sa pag-aaral ng mga reservoir rocks at hydrocarbon phase behavior — ang dalawang haligi ng reservoir engineering na magkasamang nagtatakda kung gaano karaming langis at gas ang nakaimbak at kung paano ito dumadaloy.",
    sections: [
      {
        id: "sec-1-1",
        title: "Ano ang Reservoir Petrophysics?",
        content: [
          "Ang reservoir petrophysics ay ang pag-aaral ng pisikal at kemikal na katangian ng mga reservoir rocks na kumokontrol kung gaano karaming hydrocarbon (langis at gas) ang kayang iimbak at kung gaano kadaling dumadaloy ang mga ito. Saklaw nito ang pagsukat ng porosity — ang bahagi ng espasyo na available para mag-imbak ng mga fluid — at permeability — ang kakayahan ng bato na ihatid ang mga fluid na iyon.",
          "Katabi ng petrophysics, ang hydrocarbon phase behavior ay nagpapaliwanag kung paano nagbabago ang langis at gas depende sa kondisyon ng pressure at temperatura. Sinasabi nito kung ang fluid ay umiiral bilang likido, gas, o pinagsamang dalawa sa anumang punto ng reservoir, at kung paano nagbabago ang estado nito habang ginagamit ang reservoir.",
          "Ang dalawang disiplina ay hindi mapaghihiwalay sa modernong reservoir engineering: sumasagot ang petrophysics sa 'gaano karaming fluid ang nakaimbak at paano ito gumagalaw?' habang sumasagot ang phase behavior sa 'anong anyo ang fluid at paano ito kikilos?' Magkasama, bumubuo sila ng siyentipikong pundasyon ng lahat ng reserves estimation at production forecasting.",
        ],
        noteBox: {
          title: "Pundasyon ng Engineering",
          items: [
            "Porosity → Kapasidad ng imbakan (gaano karaming fluid ang kayang hawakan ng reservoir)",
            "Permeability → Kapasidad ng daloy (gaano kabilis maaaring gumalaw ang fluid papunta sa balon)",
            "Phase Behavior → Gawi ng produksyon (paano nagbabago ang fluid sa panahon ng produksyon)",
            "Kung wala ang tatlong ito, ang reservoir engineering ay wala nang ibang mapagbabatayan kundi hula.",
          ],
        },
      },
      {
        id: "sec-1-2",
        title: "Mga Uri ng Reservoir Rocks",
        content: [
          "Karamihan sa mga hydrocarbon reservoir ay matatagpuan sa dalawang pangunahing kategorya ng sedimentary rock: clastics (pangunahin ang sandstone) at carbonates (limestone at dolomite). Ang bawat uri ng bato ay may pundamental na magkaibang pore architecture, at ang pagkakaibang ito ang kumokontrol kung gaano kaprediktibo ang kanilang mga katangian bilang reservoir.",
        ],
        subsections: [
          {
            id: "sec-1-2-a",
            title: "Clastic Rocks (Sandstone)",
            content: [
              "Ang mga clastic rocks ay nabuo mula sa mga piraso ng mas lumang bato na kinain ng erosyon, dinadala, at ini-deposit. Pangunahin itong binubuo ng mga butil ng quartz na pinagsama ng simento. Ang kanilang pore system ay pangunahing intergranular — ibig sabihin, ang mga pores ay nasa pagitan ng mga butil — at ito ay nagpapahintulot ng relatibong predictable at konsistenteng relasyon sa pagitan ng porosity at permeability.",
              "Ang mga sandstone reservoir ay well-sorted kapag ang lahat ng butil ay pareho ang laki, na nagbibigay ng mas mataas at mas pantay na porosity. Mas madali itong i-model at suriin kaysa sa carbonates, at ang karamihan sa mga maagang paraan ng reservoir engineering ay partikular na binuo para sa mga sandstone system.",
            ],
          },
          {
            id: "sec-1-2-b",
            title: "Carbonate Rocks (Limestone at Dolomite)",
            content: [
              "Ang mga carbonate ay nabuo sa pamamagitan ng kemikal at biolohikal na proseso — ang mga organismo sa dagat ay nagde-deposit ng calcium carbonate, na nag-iimpit at nag-li-lithify sa limestone. Pagkatapos ng deposisyon, ang mga diagenetic na proseso (dissolution, dolomitization, fracturing) ay maaaring lumikha ng mga kumplikadong secondary pore system kabilang ang mga vugs (malalaking cavity mula sa dissolution), moldic pores, at fracture network.",
              "Ang relasyon ng porosity-permeability sa mga carbonate ay lubhang hindi mapanghuhulaan: maaaring magkapareho ang porosity ng dalawang sample ngunit malaki ang pagkakaiba ng permeability dahil ang isa ay fractured at ang isa ay hindi. Ang heterogeneity na ito ay ginagawang malaking hamon sa engineering ang pag-characterize ng carbonate reservoir.",
            ],
            noteBox: {
              title: "Kritikal na Pagkakaiba",
              items: [
                "Sa clastics: ang mataas na porosity ay karaniwang nangangahulugang mataas na permeability — predictable ang relasyon.",
                "Sa carbonates: ang mataas na porosity ay HINDI garantiya ng mataas na permeability — ang pore connectivity (fractures, vugs) ang kumokontrol sa daloy, hindi lang ang pore volume.",
              ],
            },
          },
        ],
      },
      {
        id: "sec-1-3",
        title: "Pore Systems at Flow Behavior",
        content: [
          "Hindi pantay ang kontribusyon ng lahat ng porosity sa produksyon ng fluid. Ang arkitektura ng pore network — kung paano konektado ang mga pores, kung gaano kalaki ang mga pore throat — ang nagtatakda kung talaga bang maaaring ma-extract ang mga hydrocarbon mula sa bato.",
        ],
        subsections: [
          {
            id: "sec-1-3-a",
            title: "Konektado vs. Nakahiwalay na Pores",
            content: [
              "Ang mga konektadong pore ay nagpapahintulot sa mga fluid na dumating sa wellbore. Ang mga nakahiwalay (o dead-end) na pore ay nag-iimbak ng fluid ngunit hindi makakatulong sa produksyon dahil walang tuloy-tuloy na daan para gumalaw ang fluid na iyon. Tanging ang konektadong (effective) pore volume lamang ang binibilang sa mga ma-produce na volume ng hydrocarbon.",
            ],
          },
          {
            id: "sec-1-3-b",
            title: "Mga Uri ng Pore System",
            content: [
              "Ang intergranular pores (sandstone) ay kumakatawan sa pinaka-karaniwang at pinaka-predictable na uri ng pore. Ang daloy ay medyo pantay at multi-directional. Ang vuggy pores (carbonate) ay malalaking cavity na minsan ay mahirap konektahin, na nabuo sa pamamagitan ng dissolution. Maaari itong mag-imbak ng malaking volume ng fluid ngunit maaaring hindi hydraulically connected. Ang mga fractured reservoir ay maaaring may napakataas na permeability sa seperated ng fracture, na lumilikha ng mabilis na daan para sa daloy ng fluid, ngunit ang matrix blocks sa pagitan ng mga fracture ay maaari pa ring humawak ng karamihan ng nakaimbak na hydrocarbon.",
            ],
          },
        ],
      },
      {
        id: "sec-1-4",
        title: "Mga Paraan ng Pagkuha ng Reservoir Data",
        content: [
          "Ang maaasahang reservoir characterization ay nakasalalay sa pagsasama ng dalawang komplementaryong pinagkukunan ng data: core analysis mula sa laboratoryo at well log measurements mula sa mga downhole tool. Ang bawat isa ay may sariling kalakasan at limitasyon.",
        ],
        subsections: [
          {
            id: "sec-1-4-a",
            title: "Core Analysis",
            content: [
              "Ang core analysis ay kinabibilangan ng pagputol ng mga pisikal na sample ng bato mula sa wellbore at pag-analisa ng mga ito sa laboratoryo. Ang Routine Core Analysis (RCAL) ay nagbibigay ng direktang sukat ng porosity at permeability sa kontroladong kondisyon. Ang Special Core Analysis (SCAL) ay sumasaklaw ng mas advanced na mga sukat kabilang ang capillary pressure curves, wettability indices, at relative permeability — data na mahalaga para sa reservoir simulation.",
              "Ang core data ay ang pinaka-direkta at pinaka-tumpak na sukat ng reservoir na available, ngunit mahal, matagal, at limitado sa mga tiyak na depth interval. Ito ang nagsisilbing ground truth kung saan nica-calibrate ang mga interpretasyon ng well log.",
            ],
          },
          {
            id: "sec-1-4-b",
            title: "Well Logs",
            content: [
              "Ang mga well log ay nagbibigay ng tuloy-tuloy na sukat ng mga katangian ng formation sa buong na-drill na interval gamit ang mga downhole sensing tool. Ang mga karaniwang log ay kinabibilangan ng Gamma Ray (lithology at shale content), Density at Neutron (porosity), at Resistivity (uri ng fluid at saturation). Ang pangunahing limitasyon ng mga well log ay nagsusukat sila ng mga indirect na tugon — ang pisikal na reaksyon ng formation sa mga energy pulse — na dapat i-interpret gamit ang mga modelo at pagpapalagay.",
              "Ang pinakamabuting paraan ay palaging pinagsasama ang core at log data. Nica-calibrate ng core data ang mga modelo ng interpretasyon ng log, at ang mga log ay nagbibigay ng spatial coverage na hindi magagawa ng mga sparse core sample. Magkasama, gumagawa sila ng mas maaasahang paglalarawan ng reservoir kaysa sa alinman na mag-isa.",
            ],
          },
        ],
      },
      {
        id: "sec-1-5",
        title: "Epekto ng Clay sa Kalidad ng Reservoir",
        content: [
          "Ang mga mineral na clay ay isa sa mga pinakamahalagang kontrol sa kalidad ng reservoir sa mga clastic reservoir. Kahit maliit na halaga ng clay ay maaaring dramatikong bawasan ang porosity at permeability, kumplikado ang interpretasyon ng log, at magdulot ng malaking formation damage kung hindi maayos na pinamamahalaan sa panahon ng drilling o completion.",
        ],
        subsections: [
          {
            id: "sec-1-5-a",
            title: "Mga Uri ng Distribusyon ng Clay",
            content: [],
            list: [
              {
                term: "Dispersed Clay",
                description:
                  "Pinupuno at binabalutan ng clay ang mga pore throat, na nagdudulot ng pinaka-malubhang pagbaba ng permeability. Kahit maliit na volume ng dispersed clay ay maaaring halos ganap na harangin ang daloy ng fluid.",
              },
              {
                term: "Laminated Clay",
                description:
                  "Nagaganap ang clay bilang mga manipis na layer o laminate sa pagitan ng mga sand bed, na pangunahing naghihigpit sa vertical flow at lumilikha ng mga hadlang sa vertical permeability (kv).",
              },
              {
                term: "Structural Clay",
                description:
                  "Nabubuo ang clay bilang bahagi ng rock matrix bilang mga butil o nodule. Ito ay mas matatag at may mas kaunting epekto sa mga katangian ng daloy kaysa sa dispersed clay.",
              },
            ],
          },
          {
            id: "sec-1-5-b",
            title: "Mga Epekto ng Clay sa mga Katangian ng Reservoir",
            content: [
              "Nakakaapekto ang clay sa halos bawat mahalagang katangian ng reservoir. Binabawasan nito ang porosity sa pamamagitan ng pagpuno ng pore space, binabawasan ang permeability sa pamamagitan ng pagharang ng pore throat, at kapag ang mga swelling clay ay nakakontak sa fresh water sa panahon ng drilling operations, maaari itong magdulot ng malubha at minsan ay hindi na mababalik na formation damage. Kino-complicate din ng clay ang interpretasyon ng log: ang mga mineral na clay ay may bound water at mataas na natural radioactivity, na nagpapalaki ng mga apparent water saturation readings kung hindi maayos na itinama.",
            ],
          },
        ],
      },
      {
        id: "sec-1-6",
        title: "Hydrocarbon Phase Behavior at mga Uri ng Fluid",
        content: [
          "Ang langis at gas ay hindi mga naayos na sangkap — nagbabago ang kanilang phase depende sa pressure at temperatura ng kanilang kapaligiran. Ang pag-unawa sa phase behavior na ito ay kritikal para hulaan kung ano ang dadaloy mula sa balon at kung ano ang hitsura nito kapag dumating na sa ibabaw.",
        ],
        subsections: [
          {
            id: "sec-1-6-a",
            title: "Mga Pangunahing Konsepto ng Phase Behavior",
            content: [],
            list: [
              {
                term: "Bubble Point",
                description:
                  "Ang pressure kung saan lumalabas ang unang bula ng gas mula sa solusyon ng langis. Sa itaas ng bubble point, ang langis ay single-phase (undersaturated). Sa ibaba nito, nagsisimulang bumuo ang free gas.",
              },
              {
                term: "Dew Point",
                description:
                  "Ang pressure kung saan nag-ko-condense ang unang patak ng likido mula sa isang gas. Kritikal sa mga gas condensate reservoir kung saan ang pagbaba ng pressure ay nagdudulot ng liquid dropout sa mismong reservoir.",
              },
              {
                term: "Critical Point",
                description:
                  "Ang natatanging temperatura at pressure kung saan nagiging magkaparehong hindi na makilala ang mga katangian ng likido at gas. Dito nagtatagpo ang bubble point curve at dew point curve.",
              },
            ],
          },
          {
            id: "sec-1-6-b",
            title: "Klasipikasyon ng mga Reservoir Fluid",
            content: [
              "Ang mga reservoir fluid ay iklasipika batay sa kanilang komposisyon, posisyon nila kaugnay ng critical point sa phase diagram, at gawi nila sa panahon ng produksyon. Ang limang pangunahing uri ay sumasaklaw ng isang continuum mula sa mabigat na crude oil hanggang sa dry gas.",
            ],
            list: [
              {
                term: "Black Oil",
                description:
                  "Ang pinakakaraniwang reservoir fluid. Mabigat na crude na may mababang GOR (gas-oil ratio) at mababang API gravity. Matatag at predictable; ang paunang kondisyon nito ay nasa kaliwa ng critical temperature sa phase diagram.",
              },
              {
                term: "Volatile Oil",
                description:
                  "Mas magaang na crude oil na may mataas na konsentrasyon ng intermediate hydrocarbons. Mataas na GOR at mas mataas na API gravity kaysa sa black oil. Malapit sa critical point, kaya malaking liquid shrinkage ang nagaganap kapag bumaba ang pressure sa ibaba ng bubble point.",
              },
              {
                term: "Gas Condensate",
                description:
                  "Umiiral bilang single-phase gas sa reservoir, ngunit nabubuo ang likido (condensate) kapag bumaba ang pressure sa ibaba ng dew point — retrograde condensation. Ang likidong ito ay nagde-deposit sa reservoir at maaaring hindi na mababawi.",
              },
              {
                term: "Wet Gas",
                description:
                  "Gas sa reservoir na gumagawa ng ilang likido (condensate) sa surface conditions, ngunit nananatiling ganap na gas sa reservoir sa buong produksyon (hindi kailanman tumatawid sa dew point sa loob ng reservoir).",
              },
              {
                term: "Dry Gas",
                description:
                  "Karaniwang purong methane na may napakakaunting mas mabibigat na sangkap. Walang likidong nagagawa sa surface. Ang pinakasimpleng fluid system na suriin at gamitin.",
              },
            ],
          },
          {
            id: "sec-1-6-c",
            title: "Z-Factor at Vapor-Liquid Equilibrium",
            content: [
              "Ang mga tunay na gas ay lumilihis mula sa ideal gas behavior sa mataas na pressure at temperatura. Ang Z-factor (gas compressibility factor) ay nagwawasto ng ideal gas law para sa paglihis na ito: PV = ZnRT. Kapag ang Z = 1, ang gas ay kumikilos nang ideyal; para sa mga tunay na reservoir gas, nagbabago ang Z depende sa pressure at temperatura at dapat matukoy mula sa mga correlation (tulad ng Standing-Katz chart) o equations of state.",
              "Ang Vapor-Liquid Equilibrium (VLE) ay naglalarawan ng kondisyon kung saan magkasamang umiiral ang gas at liquid phase sa thermodynamic equilibrium. Ang VLE theory ang siyentipikong pundasyon ng lahat ng bubble point at dew point calculations, at ang lahat ng PVT laboratory analysis ay idinisenyo para i-characterize ang mga equilibrium state na ito sa ilalim ng reservoir conditions.",
            ],
          },
        ],
      },
    ],
    formulas: [
      {
        name: "Kahulugan ng Porosity",
        eq: "φ = Vp / Vb",
        desc: "Ratio ng pore volume (Vp) sa bulk volume (Vb). Ipinahayag bilang decimal o porsyento.",
      },
      {
        name: "Real Gas Law (Z-factor)",
        eq: "PV = ZnRT",
        desc: "Ang Z-factor ay nagwawasto ng ideal gas law para sa tunay na gawi ng gas. Z = 1 para sa ideal gas, Z ≠ 1 para sa mga tunay na gas.",
      },
      {
        name: "Original Oil in Place (OOIP)",
        eq: "N = 7758 × A × h × φ × (1 − Sw) / Bo",
        desc: "Volumetric na tantya ng original oil in place (STB), kung saan A = lugar (acres), h = kapal (ft), φ = porosity, Sw = water saturation, Bo = oil formation volume factor.",
      },
      {
        name: "Original Gas in Place (OGIP)",
        eq: "G = 43,560 × A × h × φ × (1 − Sw) / Bg",
        desc: "Volumetric na tantya ng original gas in place (scf), kung saan Bg = gas formation volume factor.",
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
    title: "Mga Pangunahing Kaalaman sa Reservoir Petrophysics",
    overview:
      "Isang malalim na pag-aaral ng apat na pangunahing petrophysical na katangian na dapat araling-aral ng bawat reservoir engineer: porosity, permeability, ang kanilang kaugnayan sa isa't isa, at rock compressibility.",
    sections: [
      {
        id: "sec-2-1",
        title: "2.1 Porosity",
        content: [
          "Ang porosity ay ang pangunahing katangian ng isang reservoir rock na nagtatakda ng kapasidad nitong mag-imbak ng mga fluid. Kinakatawan nito ang bahagi ng kabuuang volume ng bato na inookupahan ng mga void space — pores — na maaaring humawak ng langis, gas, at tubig. Isipin ito na parang espongha: mas maraming butas ay nangangahulugang mas maraming kapasidad para mag-imbak ng fluid.",
          "Sa matematika, ang porosity (φ) ay katumbas ng pore volume na hinati sa bulk volume. Ipinahayag ito bilang decimal (hal., 0.25) o porsyento (hal., 25%). Hindi lahat ng porosity ay pantay ang kontribusyon sa produksyon, gayunpaman, na nagdadala sa kritikal na pagkakaiba sa pagitan ng total at effective porosity.",
        ],
        subsections: [
          {
            id: "sec-2-1-a",
            title: "Total vs. Effective Porosity",
            content: [
              "Ang total porosity ay kinabibilangan ng bawat void space sa bato, konektado man sa ibang pores o hindi. Kabilang dito ang parehong konektadong pores kung saan maaaring dumalan ang mga fluid, at mga nakahiwalay na pores na sealed off mula sa flow network.",
              "Ang effective porosity ay nagbibilang lamang ng mga interconnected pores na maaaring makatulong sa daloy at produksyon ng fluid. Sa karamihan ng kalkulasyon sa engineering, ang effective porosity ang parameter na mahalaga, dahil hindi maaaring ma-drain ang mga nakahiwalay na pores. Sa mga tight carbonate, ang pagkakaiba sa pagitan ng total at effective porosity ay maaaring malaki at may malaking epekto sa mga kalkulasyon ng reserves.",
            ],
          },
          {
            id: "sec-2-1-b",
            title: "Primary vs. Secondary Porosity",
            content: [
              "Ang primary (o depositional) porosity ay nabubuo sa panahon ng deposisyon ng sediment. Sa mga sandstone, ito ang intergranular space sa pagitan ng mga butil na nananatili pagkatapos ng compaction at cementation. Repleksyon ito ng orihinal na pag-aayos ng mga sediment particle.",
              "Ang secondary porosity ay nabubuo pagkatapos ma-lithify ang bato, sa pamamagitan ng mga diagenetic na proseso. Ang tatlong pangunahing mekanismo ay: fracturing (ang tectonic stress ay nagbubukas ng mga bitak sa buong bato), dissolution (ang acidic groundwater ay nagtatunaw ng mga soluble mineral, na lumilikha ng mga vugs at pinalaking pore channel), at dolomitization (ang pagpapalit ng calcite ng dolomite, na may mas maliit na molar volume at kaya lumilikha ng bagong pore space). Ang secondary porosity ang nagdodominyo ng productive capacity ng karamihan sa mga carbonate reservoir.",
            ],
          },
          {
            id: "sec-2-1-c",
            title: "Pagsukat ng Porosity",
            content: [
              "Ang core analysis ay nagbibigay ng pinaka-direkta at pinaka-tumpak na sukat ng porosity. Ang karaniwang paraan ay hiwalay na sinusukat ang bulk volume at grain volume, pagkatapos ay kinakalkula ang pore volume mula sa kanilang pagkakaiba. Ang helium porosimeter ang pinaka-malawakang ginagamit na instrumento: ang helium gas ay ini-inject sa core sample sa ilalim ng kontroladong pressure, at ginagamit ang Boyle's Law para kalkulahin ang pore volume mula sa pressure response.",
              "Ang mga paraan ng fluid saturation ay tinitimbang ang core sample nang tuyo, pagkatapos ay binababad ito sa fluid na may kilalang density at tinitimbang muli. Ang pagkakaiba ay direktang nagbibigay ng pore volume. Parehong mga pamamaraan ay well-established sa routine core analysis at nagsisilbing calibration standard para sa log-derived porosity.",
            ],
          },
          {
            id: "sec-2-1-d",
            title: "Mga Salik na Kumokontrol sa Porosity",
            content: [],
            list: [
              {
                term: "Grain Size at Sorting",
                description:
                  "Ang well-sorted sediment (pantay na laki ng butil) ay may mas mataas na porosity kaysa sa poorly sorted sediment dahil pinupuno ng maliliit na butil ang mga espasyo sa pagitan ng malalaking butil. Ang laki ng butil mismo ay may kaunting direktang epekto sa porosity ngunit lubos na nakakaapekto sa laki ng pore throat at kaya sa permeability.",
              },
              {
                term: "Cementation",
                description:
                  "Ang mga mineral na simento (calcite, quartz, clay) ay nagde-deposit sa mga pore space sa panahon ng diagenesis, na nagbabawas ng porosity. Ang mabigat na cementation ay maaaring magbawas ng porosity ng reservoir mula 30% hanggang mas mababa sa 5%.",
              },
              {
                term: "Compaction",
                description:
                  "Pinipiga ng overburden pressure ang mga butil ng sediment habang tumitindi ang depth ng paglibing, na nagbabawas ng pore space. Ang porosity ay karaniwang bumababa kasabay ng depth ng paglibing sa rate na kontrolado ng lakas at ductility ng butil ng bato.",
              },
              {
                term: "Dissolution at Dolomitization",
                description:
                  "Sa mga carbonate, ang dissolution ng mga soluble mineral (calcite) ng mga acidic na fluid ay lumilikha ng bagong pore space. Ang dolomitization ay nagpapalit ng calcite ng dolomite, isang mineral na may mas maliit na molar volume, na lumilikha rin ng bagong pore space.",
              },
              {
                term: "Clay Content",
                description:
                  "Ang mga mineral na clay ay inookupahan ang pore space, na nagbabawas ng effective porosity. Ang mga swelling clay (smectite) ay sumasipsip ng tubig at lubos na lumalaki, na malubhang nagbabawas ng permeability.",
              },
              {
                term: "Diagenesis",
                description:
                  "Ang lahat ng post-depositional na pisikal, kemikal, at biolohikal na pagbabago sa sediment ay magkasamang nagbabago ng porosity. Ang diagenesis ay maaaring magbawas ng porosity (cementation, compaction) at magpataas nito (dissolution, fracturing).",
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
          "Habang sinusukat ng porosity kung gaano karaming fluid ang kayang iimbak ng bato, sinusukat ng permeability kung gaano kadaling dumadaloy ang fluid na iyon sa pamamagitan ng bato. Ang isang reservoir ay maaaring may napakagandang porosity ngunit mananatiling hindi ekonomikong produktibo kung ang permeability ay napakababa para payagan ang fluid na dumaling sa wellbore sa komersyal na rate.",
          "Ang permeability (k) ay sinusukat sa Darcies (D) o milliDarcies (mD). Karamihan sa mga komersyal na reservoir ng langis at gas ay may permeability na mula 1 mD hanggang ilang libong mD. Ang mga tight gas formation ay maaaring may permeability na sinusukat sa microDarcies (μD) o nanoDarcies (nD), na nangangailangan ng hydraulic fracturing para maging ekonomiko.",
        ],
        subsections: [
          {
            id: "sec-2-2-a",
            title: "Mga Uri ng Permeability",
            content: [],
            list: [
              {
                term: "Absolute Permeability (k)",
                description:
                  "Ang permeability ng bato kapag 100% saturated ng isang fluid. Ito ay purong katangian ng bato, independyente sa uri ng fluid. Sinusukat sa mga tuyo na core sample gamit ang gas o brine.",
              },
              {
                term: "Effective Permeability (k_eff)",
                description:
                  "Ang permeability sa isang tiyak na fluid (langis, tubig, o gas) kapag dalawa o higit pang fluid ang sabay na naroroon. Palaging mas mababa kaysa sa absolute permeability. Nakadepende sa parehong katangian ng bato at fluid saturation.",
              },
              {
                term: "Relative Permeability (k_r)",
                description:
                  "Ang ratio ng effective permeability sa absolute permeability: k_r = k_eff / k. Isang dimensionless na numero sa pagitan ng 0 at 1 na nagkukuntas kung paano hinihiwa ng presensya ng isang fluid phase ang daloy ng iba. Pundamental sa lahat ng multiphase reservoir engineering calculations.",
              },
            ],
          },
          {
            id: "sec-2-2-b",
            title: "Darcy's Law",
            content: [
              "Ang Darcy's Law, na experimentally na itinakda ni Henry Darcy noong 1856, ay ang pundamental na equation na namamahala sa daloy ng fluid sa pamamagitan ng porous media. Sinasabi nito na ang flow rate ay direktang proporsyonal sa permeability at pressure gradient, at inversely proporsyonal sa viscosity ng fluid.",
              "Sa linear form nito: Q = (k × A × ΔP) / (μ × L), kung saan ang Q ay ang volumetric flow rate, k ay ang permeability, A ay ang cross-sectional area na perpendicular sa daloy, ΔP ay ang pressure difference sa buong flow path, μ ay ang viscosity ng fluid, at L ay ang haba ng flow path. Ipinapalagay ng Darcy's Law ang laminar, single-phase, incompressible flow — mga kondisyon na nangunguna sa karamihan ng praktikal na reservoir engineering calculations.",
            ],
          },
          {
            id: "sec-2-2-c",
            title: "Directional Permeability",
            content: [
              "Ang permeability ay hindi palaging pareho sa lahat ng direksyon. Sa mga layered sediment, ang horizontal permeability (k_h) — sinusukat nang parallel sa mga sedimentary layer — ay karaniwang mas mataas kaysa sa vertical permeability (k_v). Ang ratio na k_v/k_h ay maaaring mag-range mula 0.1 sa well-bedded sandstone hanggang halos 0 sa thinly laminated na mga formation na may clay-rich barrier.",
              "Ang vertical permeability ay kritikal na kumokontrol sa water at gas coning — ang tendensiyang mag-akit ng underlying water o overlying gas cap gas papunta sa produksyon ng balon. Ang mababang k_v ay nagbabawas ng tendensiyang mag-cone at nagpapalawig ng ekonomikong buhay ng produksyon ng balon.",
            ],
          },
          {
            id: "sec-2-2-d",
            title: "Mga Salik na Nakakaapekto sa Permeability",
            content: [],
            list: [
              {
                term: "Grain Size at Sorting",
                description:
                  "Ang malalaki, well-sorted na butil ay lumilikha ng mas malaking pore throat at mas mataas na permeability. Ang fine-grained, poorly sorted na sediment ay may maliit, tortuous na pore throat at mababang permeability.",
              },
              {
                term: "Cementation",
                description:
                  "Ang simento ay nagtutulungan sa mga pore throat at dramatikong nagbabawas ng permeability kahit nananatiling katamtaman ang porosity. Ang permeability ay mas sensitive sa cementation kaysa sa porosity.",
              },
              {
                term: "Clay Content",
                description:
                  "Ang dispersed clay sa mga pore throat ay pinaka-mapanira. Ang mga swelling clay ay maaaring magbawas ng permeability ng ilang order ng magnitude kapag nakipagkontak sa fresh water sa panahon ng drilling o workover operations.",
              },
              {
                term: "Fractures",
                description:
                  "Ang mga natural na fracture ay maaaring magpataas ng bulk permeability ng ilang order ng magnitude, na nangunguna sa daloy ng fluid sa mga tight matrix carbonate. Ang fracture permeability ay lubos na sensitive sa mga pagbabago ng effective stress sa panahon ng produksyon.",
              },
            ],
          },
          {
            id: "sec-2-2-e",
            title: "Laboratoryo na Pagsukat ng Permeability",
            content: [
              "Ang steady-state core flooding method ay ang karaniwang teknik: ang fluid ay ini-inject sa pare-parehong rate hanggang manatag ang pressure drop, pagkatapos ay inilalapat ang Darcy's Law para kalkulahin ang permeability. Ang mga parameter na sinusukat ay kinabibilangan ng flow rate (Q), pressure drop (ΔP), viscosity ng fluid (μ), at dimensyon ng core (cross-sectional area A at haba L).",
              "Ang mga sukat ng gas permeability ay nangangailangan ng pagwawasto para sa Klinkenberg effect: sa mababang pressure, ang mga molekulo ng gas ay dumadampi sa mga dingding ng pore (gas slippage), na nagresulta sa apparent permeability na mas mataas kaysa sa tunay na liquid-equivalent permeability. Ang liquid permeability ay palaging mas kinatawan para sa reservoir conditions at nakukuha sa pamamagitan ng pagwawasto ng mga gas measurement sa infinite pressure o sa pamamagitan ng direktang pagsukat gamit ang brine.",
            ],
          },
        ],
        noteBox: {
          title: "Kahalagahan ng Permeability sa Engineering",
          items: [
            "Well productivity index (PI) — gaano karaming langis bawat araw bawat psi ng drawdown",
            "Pressure transient behavior — hugis ng pressure buildup/drawdown curves",
            "Recovery efficiency — kung gaano kabuo ang pagtanggal ng hydrocarbon mula sa reservoir",
            "Pangangailangan ng stimulation — ang mga reservoir na may k < 1 mD ay karaniwang nangangailangan ng hydraulic fracturing para makapag-produce nang komersyal",
          ],
        },
      },
      {
        id: "sec-2-3",
        title: "2.3 Relasyon ng Porosity-Permeability",
        content: [
          "Ang relasyon sa pagitan ng porosity at permeability ay isa sa mga pinaka-pinag-aralan — at pinaka-maling naiintindihan — na paksa sa petrophysics. Habang ang dalawang katangian ay nag-co-correlate sa maraming uri ng bato, ang lakas ng correlation na iyon ay malaki ang pagkakaiba sa pagitan ng sandstone at carbonate.",
        ],
        subsections: [
          {
            id: "sec-2-3-a",
            title: "Empirical Correlations sa Sandstone",
            content: [
              "Sa mga malinis na sandstone, ang permeability at porosity ay karaniwang may malakas na correlation at madalas na sumusunod sa exponential na relasyon kapag ini-plot sa semi-logarithmic scale. Nagpapahintulot ito ng paglikha ng maaasahang empirical model na maaaring hulaan ang permeability mula sa porosity logs sa kawalan ng core data.",
              "Ang pisikal na dahilan para sa correlation na ito ay ang parehong katangian ay kinokontrol ng parehong underlying rock fabric — ang laki ng butil at pag-aayos ng packing. Ang mas malalaki, mas pantay na na-pack na mga butil ay sabay-sabay na lumilikha ng mas maraming pore volume (mas mataas na porosity) at mas malalaking pore throat (mas mataas na permeability).",
            ],
          },
          {
            id: "sec-2-3-b",
            title: "Kumplikasyon sa Carbonate",
            content: [
              "Sa mga carbonate, ang porosity-permeability correlation ay kilalang-kilala sa pagiging hindi mapagkakatiwalaan. Ang dalawang core sample mula sa parehong formation ay maaaring magkapareho ang porosity ngunit magkaibang apat na order ng magnitude sa permeability. Nangyayari ito dahil ang permeability sa mga carbonate ay pangunahing kontrolado ng pore geometry at connectivity — ang laki at tortuosity ng mga pore throat — kaysa sa kabuuang pore volume.",
              "Ang isang vuggy carbonate ay maaaring may 20% porosity ngunit napakababang permeability kung ang mga vugs ay nakahiwalay at hindi konektado ng mga permeable pore throat. Sa kabilang banda, ang isang fractured carbonate na may 5% porosity lamang ay maaaring may napakataas na permeability dahil ang mga fracture ay nagbibigay ng high-conductivity na daan ng daloy.",
            ],
          },
          {
            id: "sec-2-3-c",
            title: "Mga Kontrol ng Rock Fabric at Pore Geometry",
            content: [
              "Ang pinaka-mahalagang kontrol sa permeability ay hindi ang kabuuang halaga ng pore space, kundi ang geometry ng pore network: distribusyon ng laki ng pore throat, ang tortuosity ng mga daan ng daloy, at ang pag-aayos ng mga butil (grain packing). Ang rock fabric — ang mikroskopikong pag-aayos ng mga butil at pores — ang nagtatakda ng laki ng pore throat, na siyang nagpapamahala ng parehong permeability at capillary pressure behavior.",
            ],
            noteBox: {
              title: "Buod: Clastics vs. Carbonates",
              items: [
                "Clastics: Intergranular pore system → Mataas na predictability → Malakas na porosity-permeability correlation",
                "Carbonates: Vug/fracture pore system → Mababang predictability → Mahina o walang correlation",
                "Panuntunan: Ang rock fabric ang kumokontrol sa permeability nang higit pa kaysa sa pore volume.",
              ],
            },
          },
        ],
      },
      {
        id: "sec-2-4",
        title: "2.4 Rock Compressibility",
        content: [
          "Ang rock compressibility ay ang fractional na pagbabago sa pore volume bawat unit na pagbabago sa reservoir pressure. Habang nag-produce ang fluid at bumababa ang reservoir pressure, tumataas ang epektibong overburden stress sa rock matrix, na nagdudulot ng compaction sa pore space. Ang mekanismong ito, bagaman maliit sa bawat pore, ay maaaring maging mahalagang pinagkukunan ng enerhiya sa malalaking reservoir — ang compaction drive mechanism.",
        ],
        subsections: [
          {
            id: "sec-2-4-a",
            title: "Mga Uri ng Compressibility",
            content: [],
            list: [
              {
                term: "Grain Compressibility",
                description:
                  "Ang compressibility ng mismong solid mineral grain sa ilalim ng stress. Karaniwang napakaliit at madalas na hindi pinag-aaralan sa mga kalkulasyon sa engineering.",
              },
              {
                term: "Pore Volume Compressibility (cf)",
                description:
                  "Ang fractional na pagbaba ng pore volume bawat unit na pagbaba sa reservoir pressure. Ito ang pinaka-mahalagang parameter ng compressibility sa reservoir engineering: cf = (1/Vp)(dVp/dP). Ang karaniwang halaga ay mula 3 × 10⁻⁶ psi⁻¹ para sa matigas, consolidated na bato hanggang 15 × 10⁻⁶ psi⁻¹ para sa malambot, unconsolidated na buhangin.",
              },
              {
                term: "Bulk Compressibility",
                description:
                  "Ang kabuuang fractional na pagbabago ng volume ng bato (solid + pores) sa ilalim ng pagbabago ng pressure. Kabilang ang mga kontribusyon mula sa parehong grain at pore compressibility.",
              },
            ],
          },
          {
            id: "sec-2-4-b",
            title: "Mga Mekanismo ng Compaction",
            content: [
              "Habang bumababa ang reservoir pressure, ilang micro-scale na mekanismo ang nag-co-compact ng bato. Ang grain rotation at mas malapit na packing ay nagbabawas ng pore space. Ang mga ductile grain (tulad ng mga mineral na clay o mica) ay plastically deform sa ilalim ng stress. Sa mataas na stress, ang mga brittle grain ay nagbabali at ang mga piraso ay pumupuno ng pore space. Ang pressure solution sa mga grain contact ay nagdudulot ng lokal na dissolution at grain compaction.",
            ],
          },
          {
            id: "sec-2-4-c",
            title: "Kahalagahan sa Engineering",
            content: [
              "Ang rock compressibility ay pumapasok sa material balance equation bilang isang energy term. Sa mga highly compressible na formation (chalk reservoir, unconsolidated sand), ang compaction ay nagbibigay ng malaking bahagi ng reservoir drive energy. Ang Ekofisk chalk field sa North Sea ang klasikong halimbawa — ang compaction drive ay malaki ang kontribusyon sa produksyon at nagdulot din ng ilang metro ng subsidence ng sea floor sa itaas ng field, na nangangailangan ng operasyon ng pagpapataas ng platform.",
              "Para sa karamihan ng conventional reservoir, ang pinagsama-samang compressibility ng langis, gas, at tubig ang dominado, at ang rock compressibility ay isang secondary effect. Gayunpaman, hindi ito dapat balewalain sa mga undersaturated oil reservoir sa itaas ng bubble point, kung saan ang pagpapalawak ng bato at tubig ang tanging drive mechanism.",
            ],
          },
        ],
        noteBox: {
          title: "Mga Pangunahing Relasyon ng Kabanata",
          items: [
            "Porosity → sinusukat ang kapasidad ng pag-iimbak ng fluid (gaano karami ang kayang hawakan?)",
            "Permeability → sinusukat ang kapasidad ng daloy ng fluid (gaano kabilis maaaring dumaan?)",
            "Compressibility → kumokontrol sa pagbabago ng pore volume kasabay ng pressure (paano ito nag-ko-compress?)",
            "Ang mataas na porosity ay HINDI garantiya ng mataas na permeability — ang pore connectivity ang mahalaga.",
          ],
        },
      },
    ],
    formulas: [
      {
        name: "Porosity",
        eq: "φ = Vp / Vb = (Vb − Vg) / Vb",
        desc: "Pore volume (Vp) na hinati sa bulk volume (Vb). Grain volume Vg = Vb − Vp.",
      },
      {
        name: "Pore Volume mula sa Grain Volume",
        eq: "Vp = Vb − Vg",
        desc: "Ang pore volume ay ang pagkakaiba sa pagitan ng bulk volume at grain volume.",
      },
      {
        name: "Darcy's Law (Linear Flow)",
        eq: "Q = −(k × A / μ) × (ΔP / L)",
        desc: "Q = flow rate (cm³/s), k = permeability (Darcy), A = lugar (cm²), μ = viscosity (cP), ΔP = pressure drop (atm), L = haba (cm).",
      },
      {
        name: "Relative Permeability",
        eq: "k_r = k_eff / k_abs",
        desc: "Dimensionless ratio (0–1) ng effective permeability sa absolute permeability sa isang tiyak na fluid saturation.",
      },
      {
        name: "Pore Volume Compressibility",
        eq: "c_f = (1 / Vp) × (dVp / dP)",
        desc: "Fractional na pagbabago ng pore volume bawat unit na pagbabago ng reservoir pressure. Yunit: psi⁻¹.",
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
    title: "Fluid Saturation, Wettability, at Capillary Pressure",
    overview:
      "Pag-unawa sa kung paano nakikipagkumpetensya ang langis, tubig, at gas para sa pore space — ang konsepto ng saturation — at ang mga surface force na kumokontrol sa distribusyon, displacement, at ultimate recovery ng fluid.",
    sections: [
      {
        id: "sec-3-1",
        title: "Mga Pangunahing Kaalaman sa Fluid Saturation",
        content: [
          "Inilalarawan ng fluid saturation ang bahagi ng pore volume na inookupahan ng bawat fluid phase. Dahil naayos ang kabuuang pore volume, ang mga saturation ng lahat ng fluid na naroroon ay dapat palaging magsama-sama sa 1.0 (100%). Ang pag-unawa sa saturation sa bawat punto ng reservoir ay mahalaga para sa pagkalkula ng mga volume ng hydrocarbon at paghula ng gawi ng produksyon.",
        ],
        subsections: [
          {
            id: "sec-3-1-a",
            title: "Mga Kahulugan ng Saturation",
            content: [],
            list: [
              {
                term: "Water Saturation (Sw)",
                description:
                  "Bahagi ng pore volume na inookupahan ng tubig. Ang pinaka-mahalagang parameter ng saturation — direktang ginagamit para kalkulahin ang volume ng hydrocarbon mula sa relasyon: Sh = 1 − Sw.",
              },
              {
                term: "Oil Saturation (So)",
                description:
                  "Bahagi ng pore volume na inookupahan ng langis. Sa oil pay zone, mataas ang So (at mababa ang Sw). Bumababa ang So sa panahon ng water flooding habang pinapalitan ng tubig ang langis.",
              },
              {
                term: "Gas Saturation (Sg)",
                description:
                  "Bahagi ng pore volume na inookupahan ng gas. Tumataas habang bumababa ang reservoir pressure sa ibaba ng bubble point at nabubuo ang free gas mula sa solusyon.",
              },
              {
                term: "Saturation Balance",
                description:
                  "Sw + So + Sg = 1.0. Dahil naayos ang pore volume, ang pagtaas ng alinmang phase ay dapat samahan ng pagbaba ng kahit isa sa iba. Ang constraint na ito ang nagtutulak sa lahat ng material balance calculations.",
              },
            ],
          },
          {
            id: "sec-3-1-b",
            title: "Critical at Residual Saturation",
            content: [],
            list: [
              {
                term: "Irreducible (Connate) Water Saturation (Swirr)",
                description:
                  "Ang minimum na water saturation na napanatili sa bato ng capillary at adsorptive forces, na hindi maaaring mapalis anuman ang inilapat na pressure. Inookupahan nito ang pinakamaliit na pore throat at grain surface film. Ang Swirr ay ang paunang water saturation sa oil at gas pay zone.",
              },
              {
                term: "Residual Oil Saturation (Sor)",
                description:
                  "Ang langis na nanatiling nakulong sa mga pore space pagkatapos ng water flooding, bilang mga isolated ganglia na hawak ng capillary forces. Ang Sor ay kumakatawan sa langis na hindi maaaring gamitin ng conventional waterflooding — ito ang target ng Enhanced Oil Recovery (EOR) methods.",
              },
              {
                term: "Critical Gas Saturation (Sgc)",
                description:
                  "Ang minimum na gas saturation na kinakailangan bago maging hydraulically continuous ang gas at magsimulang dumaling. Sa ibaba ng Sgc, ang gas ay umiiral bilang mga isolated na bula at hindi maaaring ma-produce.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-3-2",
        title: "Wettability",
        content: [
          "Ang wettability ay ang tendensiyang preferentially makipagkontak ang rock surface sa isang fluid kaysa sa isa pa sa isang multiphase system. Ito ay marahil ang pinaka-mahalagang parameter ng rock-fluid interaction dahil kumokontrol ito sa paunang distribusyon ng fluid sa pore space, sa mga hugis ng relative permeability curve, at sa kahusayan ng waterflood displacement.",
        ],
        subsections: [
          {
            id: "sec-3-2-a",
            title: "Mga Estado ng Wettability",
            content: [],
            list: [
              {
                term: "Water-Wet System",
                description:
                  "Ang tubig ay nagbabalot sa mga surface ng butil at pinupuno ang mga mas maliit na pore space. Inookupahan ng langis ang mga sentro ng mas malalaking pores. Karamihan sa mga clastic reservoir rock ay natural na water-wet. Ang waterflood recovery ay karaniwang pinaka-mahusay sa mga water-wet system.",
              },
              {
                term: "Oil-Wet System",
                description:
                  "Ang langis ay nagbabalot sa mga surface ng butil. Ang wettability ay nabago ng mga polar na organic compound sa crude oil na nagsa-adsorb sa mga surface ng bato. Maraming carbonate reservoir ang nagpapakita ng oil-wet o mixed-wet na gawi, na nagko-complicate sa disenyo ng waterflood.",
              },
              {
                term: "Mixed-Wet System",
                description:
                  "Ang ilang bahagi ng pore system ay water-wet at ang iba ay oil-wet. Ang mga mas malalaking pore na nakipagkontak sa langis ay may tendensiyang maging oil-wet; ang mga mas maliit na pore ay palaging water-wet. Ang mixed wettability ay tunay na pinaka-karaniwang estado na matatagpuan sa mga tunay na reservoir pagkatapos ng oil migration.",
              },
            ],
          },
          {
            id: "sec-3-2-b",
            title: "Pagsukat ng Wettability",
            content: [
              "Ang contact angle (θ) na sinusukat sa pamamagitan ng mas masiksik na fluid sa solid-fluid-fluid interface ay nagkukuntas ng wettability. Ang θ < 75° ay nagpapahiwatig ng water-wet, ang θ > 105° ay nagpapahiwatig ng oil-wet, at ang 75° < θ < 105° ay intermediate. Ang Amott wettability index at ang USBM (US Bureau of Mines) index ang mga karaniwang laboratory measurement na ginagamit sa mga core sample, na nag-iintegrate ng spontaneous at forced imbibition/drainage test.",
            ],
          },
        ],
      },
      {
        id: "sec-3-3",
        title: "Capillary Pressure",
        content: [
          "Ang capillary pressure (Pc) ay ang pagkakaiba ng pressure sa buong curved interface sa pagitan ng dalawang immiscible fluid sa pore space. Nagmumula ito sa interfacial tension (σ) — ang surface energy sa fluid-fluid interface — at sa curvature ng interface na iyon, na kontrolado ng pore throat radius at wettability.",
          "Ang capillary pressure ang namamahala sa paunang distribusyon ng fluid sa reservoir bago ang produksyon, kumokontrol sa taas ng transition zone sa pagitan ng water at hydrocarbon zone, at nagtatakda ng minimum na laki ng pore throat kung saan maaaring pumasok ang mga hydrocarbon (ang entry pressure).",
        ],
        subsections: [
          {
            id: "sec-3-3-a",
            title: "Ang Capillary Pressure Curve",
            content: [
              "Ang capillary pressure curve ay naguugnay ng Pc sa water saturation (Sw). Sinusukat ito sa laboratoryo gamit ang mercury injection (MICP), porous plate, o centrifuge na mga pamamaraan. Ang hugis ng curve ay nagpapakita ng distribusyon ng laki ng pore: ang isang matarik, makitid na curve ay nagpapahiwatig ng well-sorted na bato na may pantay na pore throat; ang isang unti-unti, maluwag na curve ay nagpapahiwatig ng poorly sorted na bato na may malawak na hanay ng laki ng pore throat.",
              "Ang entry pressure (displacement pressure, Pd) ay ang minimum na capillary pressure kung saan maaaring pumasok ang non-wetting phase (langis o gas) sa mga pinakamalaking pore throat. Ang seal integrity ay tinutukoy ng entry pressure ng caprock — ang gas o langis ay hindi maaaring mag-migrate sa pamamagitan ng seal hanggang ang Pc ay lumampas sa caprock entry pressure.",
            ],
          },
          {
            id: "sec-3-3-b",
            title: "Free Water Level at Transition Zone",
            content: [
              "Ang Free Water Level (FWL) ay ang lalim sa reservoir kung saan ang capillary pressure ay zero — kung saan ang langis at tubig ay nasa pressure equilibrium. Ang Oil-Water Contact (OWC) ay karaniwang ilang talampakan sa itaas ng FWL, sa lalim kung saan ang Pc ay katumbas ng entry pressure ng reservoir rock.",
              "Sa pagitan ng FWL at ng tuktok ng transition zone, ang water saturation ay unti-unting bumababa mula 100% paakyat. Ang kapal ng transition zone ay nakasalalay sa capillary pressure curve ng bato at sa pagkakaiba ng density sa pagitan ng langis at tubig. Ang mga fine-grained rock na may mataas na capillary pressure ay may makapal na transition zone; ang mga coarse-grained rock ay may manipis, malinaw na mga contact.",
            ],
          },
          {
            id: "sec-3-3-c",
            title: "Ang Leverett J-Function",
            content: [
              "Ang Leverett J-function ay nino-normalize ang capillary pressure data mula sa iba't ibang sample ng bato sa pamamagitan ng pag-account sa mga epekto ng permeability, porosity, interfacial tension, at contact angle. Nagpapahintulot ito ng paghahambing at pagsasama ng mga capillary pressure curve mula sa iba't ibang sample sa parehong reservoir sa isang solong representative curve para sa reservoir.",
            ],
          },
        ],
      },
      {
        id: "sec-3-4",
        title: "Relative Permeability",
        content: [
          "Ang relative permeability (kr) ay nagkukuntas ng kakayahan ng isang fluid phase na dumating sa pamamagitan ng porous medium sa presensya ng iba pang fluid phase. Ito ay tinukoy bilang ratio ng effective permeability sa isang tiyak na phase sa isang tiyak na saturation sa absolute permeability ng bato. Ang mga halaga ay mula 0 (ang phase na iyon ay hindi maaaring dumaan) hanggang 1 (single-phase flow, walang ibang fluid na naroroon).",
          "Ang mga relative permeability curve ay pundamental na input sa reservoir simulation at namamahala sa ekonomika ng produksyon ng langis. Tinutukoy nila ang water-oil at gas-oil ratio na ginagawa ng mga balon, ang kahusayan ng water flooding, at ang timing ng water breakthrough.",
        ],
        subsections: [
          {
            id: "sec-3-4-a",
            title: "Mga Pangunahing Katangian ng Relative Permeability Curves",
            content: [],
            list: [
              {
                term: "Endpoint k_ro sa Swirr",
                description:
                  "Ang maximum na relative permeability sa langis, na nagaganap kapag ang water saturation ay nasa pinakamababa nitong irreducible level. Ang endpoint na ito ay direktang repleksyon ng kalidad ng reservoir rock para sa produksyon ng langis.",
              },
              {
                term: "Endpoint k_rw sa Sor",
                description:
                  "Ang maximum na relative permeability sa tubig, na nagaganap kapang naaabot na ang residual oil saturation. Ang mataas na halaga ay nagpapahiwatig ng mahusay na daloy ng tubig sa pagtatapos ng flooding.",
              },
              {
                term: "Crossover Point",
                description:
                  "Ang saturation kung saan pantay ang k_ro at k_rw. Sa mga saturation na mas mataas kaysa sa crossover point, mas maraming tubig kaysa langis ang dumadating. Ang crossover saturation ay nag-co-correlate sa wettability — ang mga oil-wet rock ay nag-co-cross over sa mababang water saturation.",
              },
            ],
          },
          {
            id: "sec-3-4-b",
            title: "Drainage at Imbibition",
            content: [
              "Ang drainage ay tumutukoy sa mga proseso kung saan ang non-wetting phase (langis o gas) ay pumapalit sa wetting phase (tubig). Ito ay natural na naganap sa panahon ng hydrocarbon migration papasok sa reservoir at naglarawain din ng mga proseso ng gas injection. Ang imbibition ay ang kabaligtaran — ang wetting phase ay pumapalit sa non-wetting phase. Ang waterflooding ay isang imbibition na proseso sa water-wet reservoir.",
              "Ang hysteresis ay nangangahulugang ang mga relative permeability at capillary pressure curve para sa drainage at imbibition ay magkaiba — ang bato ay hindi bumabalik sa orihinal na estado nito kapag binaliktad ang proseso. Ito ay may mahahalagang implikasyon para sa mga proseso ng EOR at reservoir simulation.",
            ],
          },
        ],
      },
      {
        id: "sec-3-5",
        title: "Mobility at Displacement Efficiency",
        content: [
          "Ang mobility (λ) ng isang fluid phase ay tinukoy bilang ang relative permeability nito na hinati sa viscosity nito. Tinutukoy nito kung gaano kadaling dumadaling ang fluid na iyon kaugnay ng iba pang phase na naroroon sa reservoir.",
        ],
        subsections: [
          {
            id: "sec-3-5-a",
            title: "Mobility Ratio at ang mga Kahihinatnan Nito",
            content: [
              "Ang Mobility Ratio (M) ay inihahambing ang mobility ng displacing fluid (karaniwang tubig o gas) sa mobility ng displaced fluid (langis). M = λ_displacing / λ_displaced.",
              "Kapag ang M < 1, ang displaced fluid (langis) ay mas mobile kaysa sa displacing fluid — ang displacement front ay matatag, at ang langis ay mahusay na nasasalis nang maaga sa waterfront. Kapag ang M > 1, ang displacing fluid ay mas mobile kaysa sa langis — ang front ay hindi matatag at nahahati sa mga irregular na 'daliri' na lumalampas sa hindi nasaling langis. Ang fingering na ito ay nagdudulot ng maagang water breakthrough at mahinang sweep efficiency.",
            ],
            list: [
              {
                term: "Favorable Mobility Ratio (M < 1)",
                description:
                  "Matatag na displacement front. Ang tubig ay pantay-pantay na gumagalaw sa buong reservoir, mahusay na nasasalis ang langis nang mauna nito. Naaabot kapag mababa ang viscosity ng langis o kapag ang polymer ay idinagdag para mapataas ang viscosity ng tubig.",
              },
              {
                term: "Unfavorable Mobility Ratio (M > 1)",
                description:
                  "Nagaganap ang viscous fingering — ang tubig ay bumabasag hanggang sa produksyon ng balon nang maaga habang malaking volume ng langis ay nananatiling hindi nasaling. Karaniwang nangyayari sa mga heavy oil reservoir. Nagdudulot ng mataas na water-oil ratio at mahinang recovery efficiency.",
              },
            ],
          },
          {
            id: "sec-3-5-b",
            title: "Sweep Efficiency at EOR",
            content: [
              "Ang sweep efficiency ay sinusukat ang bahagi ng volume ng reservoir na nakipagkontak sa displacing fluid. Ang mahinang sweep ay nagdudulot ng pagtawid sa langis at pagpapaiwan nito sa reservoir. Ang pagkamit ng mataas na sweep efficiency ay nangangailangan ng favorable mobility ratio, magandang homogeneity ng reservoir, at tamang paglalagay ng balon.",
              "Ang mga paraan ng Enhanced Oil Recovery (EOR) ay partikular na naglalayong mapabuti ang sweep efficiency at mabawasan ang residual oil saturation. Ang chemical flooding (polymer, surfactant) ay nagbabago ng mobility ratio at wettability; ang thermal methods (steam injection) ay nagbabawas ng viscosity ng langis; ang miscible gas injection ay nagbabawas o ganap na nag-eelimina ng interfacial tension at residual oil.",
            ],
          },
        ],
      },
      {
        id: "sec-3-6",
        title: "Mga Fluid Contact at Zonasyon ng Reservoir",
        content: [
          "Ang vertical na distribusyon ng mga fluid sa isang reservoir ay kontrolado ng interplay ng gravity (na naghihiwalay ng mga fluid ayon sa density) at capillary forces (na lumalaban sa gravity para mapanatili ang wetting-phase fluid sa maliliit na pores sa itaas ng FWL). Lumilikha ito ng katangian na vertical saturation profile.",
        ],
        subsections: [
          {
            id: "sec-3-6-a",
            title: "Mga Kahulugan ng Fluid Contact",
            content: [],
            list: [
              {
                term: "Oil-Water Contact (OWC)",
                description:
                  "Ang lalim kung saan ang log-based water saturation ay biglang tumataas patungo sa 100% tubig. Praktikong tinukoy bilang pinakamalalim na lalim kung saan maaaring mag-produce ng langis. Matatagpuan sa itaas ng Free Water Level.",
              },
              {
                term: "Gas-Oil Contact (GOC)",
                description:
                  "Ang hangganan sa pagitan ng gas cap (free gas sa itaas ng bubble point) at ng oil zone. Tinutukoy ng log response — karaniwang dramatikong pagbaba ng density at isang neutron-density crossover.",
              },
              {
                term: "Transition Zone",
                description:
                  "Ang reservoir interval sa pagitan ng FWL at ng OWC kung saan ang parehong langis at tubig ay mobile at ang water saturation ay unti-unting bumababa mula 100% paakyat. Ang kapal ay nakasalalay sa kalidad ng bato — ang mga tight rock ay may makapal na transition zone; ang mga high-permeability rock ay may manipis, malinaw na contact.",
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
        desc: "Ang lahat ng fluid phase ay dapat magsama-sama sa 1.0 (o 100%). Ang pagbabago ng isang saturation ay nangangailangan ng katumbas na pagbabago sa isa pa.",
      },
      {
        name: "Young-Laplace Capillary Pressure",
        eq: "Pc = 2σ cos θ / r",
        desc: "σ = interfacial tension, θ = contact angle, r = pore throat radius. Tumataas ang Pc habang bumababa ang laki ng pore throat.",
      },
      {
        name: "Leverett J-Function",
        eq: "J(Sw) = (Pc / σ cos θ) × √(k / φ)",
        desc: "Nino-normalize ang mga capillary pressure curve para payagan ang paghahambing sa pagitan ng iba't ibang sample at uri ng bato.",
      },
      {
        name: "Fluid Mobility",
        eq: "λ = k_r / μ",
        desc: "Ang mobility ng isang fluid phase (λ) ay katumbas ng relative permeability nito (k_r) na hinati sa viscosity nito (μ, sa cP).",
      },
      {
        name: "Mobility Ratio",
        eq: "M = λ_displacing / λ_displaced = (k_r_d / μ_d) / (k_r_o / μ_o)",
        desc: "M < 1 → matatag na displacement; M > 1 → viscous fingering at mahinang sweep efficiency.",
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
    title: "Interpretasyon ng Well Logs",
    overview:
      "Ang mga well log ay ang mga mata ng reservoir engineer — tuloy-tuloy na talaan ng mga katangian ng formation mula sa ibabaw hanggang sa kabuuang lalim. Sinasaklaw ng kabanatang ito ang mga pangunahing logging tool, kung paano i-interpret ang mga ito para sa lithology, porosity, at fluid saturation, at kung paano matukoy ang net pay.",
    sections: [
      {
        id: "sec-4-1",
        title: "Panimula sa Well Logging",
        content: [
          "Ang well log ay isang tuloy-tuloy na talaan ng pisikal na tugon ng isang formation sa enerhiyang ipinadala ng isang downhole measurement tool, na naka-plot bilang function ng lalim. Ang mga log ay kinukuha pagkatapos ng drilling at bago i-case ang borehole (open-hole logs) o pagkatapos malagay ang casing (cased-hole logs).",
          "Ang modernong well logging ay nagbibigay ng tanging praktikal na paraan para ma-characterize ang mga katangian ng reservoir sa buong na-drill na interval. Habang ang core data ay nagbibigay ng pinaka-direktang sukat, limitado ito sa mga maikling interval at mahal. Pinupuno ng mga log ang mga puwang, na nagbibigay ng data sa bawat lalim.",
        ],
        subsections: [
          {
            id: "sec-4-1-a",
            title: "Mga Uri ng Logging Operations",
            content: [],
            list: [
              {
                term: "Open-Hole Logging (Wireline)",
                description:
                  "Ang mga tool ay ibinababa sa uncased wellbore sa isang electrical cable (wireline) pagkatapos makumpleto ang drilling. Nagbibigay ng pinaka-komprehensibong suite ng mga sukat dahil ang formation ay direktang nakikipag-ugnayan sa measuring device.",
              },
              {
                term: "Cased-Hole Logging",
                description:
                  "Mga sukat na kinukuha pagkatapos na mai-cement ang steel casing. Ginagamit para sa pagmamanman ng produksyon, pagtuklas ng galaw ng fluid sa likod ng casing, at pag-verify ng well integrity. Ang mga tool ay dapat sumukat sa pamamagitan ng bakal at simento, na nagbabawas ng katumpakan.",
              },
              {
                term: "Logging While Drilling (LWD) / Measurement While Drilling (MWD)",
                description:
                  "Ang mga sensor na nakalagay sa drill collar ay nagkukuha ng real-time na data ng formation sa panahon ng drilling. Inaalis ang mga isyu ng pagkasira ng borehole at nagbibigay ng agarang geological guidance para sa geosteering ng mga horizontal well.",
              },
            ],
          },
        ],
        videoAfter: {
          label: "Lecture Video",
          description:
            "Panimula sa Well Logging — Mga Uri ng Tool, Mga Paraan ng Pagkuha, at ang Wireline Process",
        },
      },
      {
        id: "sec-4-2",
        title: "Gamma Ray Log — Lithology at Shale Volume",
        content: [
          "Sinusukat ng Gamma Ray (GR) log ang natural radioactivity ng mga formation sa API units. Ang radioactivity ay pangunahing nagmumula sa tatlong elemento: potassium (K-40) sa mga mineral na clay, uranium (U), at thorium (Th). Dahil ang mga shale ay mayaman sa clay, mayroon silang mataas na GR reading (karaniwang 75–150 API). Ang mga malinis na buhangin, limestone, at dolomite ay may mababang GR reading (karaniwang 10–30 API). Ang contrast na ito ay ginagawang pangunahing tagapagpahiwatig ng lithology ang GR log at ang pinaka-malawakang ginagamit na log sa industriya ng petroleum.",
          "Ang mga evaporite (anhydrite, asin, malinis na carbonate) ay may napakababang GR dahil halos walang potassium, uranium, o thorium ang nilalaman nila. Ang ilang malinis na buhangin na may feldspathic o arkosic na nilalaman ay maaaring magpakita ng elevated na GR, na dapat makilala mula sa shale gamit ang spectral GR log.",
        ],
        subsections: [
          {
            id: "sec-4-2-a",
            title: "Kalkulasyon ng Shale Volume",
            content: [
              "Ang GR index (IGR) ay nino-normalize ang raw GR reading sa pagitan ng clean sand baseline (GR_min) at ng shale line (GR_max). Mula rito, ang shale volume (Vsh) ay tinatantya gamit ang isa sa ilang empirical correlation. Ang pinakasimpleng linear na relasyon: Vsh = IGR = (GR_log − GR_min) / (GR_max − GR_min). Ang mas sopistikadong mga pagwawasto ay naglalapat ng non-linear transform para sa mas lumang o compacted na formation.",
              "Ang Vsh ay ginagamit pagkatapos para maglapat ng shale correction sa mga kalkulasyon ng porosity at water saturation, dahil ang mga clay-rich zone ay nagbabawas ng resistivity (na nagdudulot ng overestimation ng Sw) at nagpapalaki ng apparent neutron porosity (na nagdudulot ng overestimation ng φ).",
            ],
          },
        ],
      },
      {
        id: "sec-4-3",
        title: "Resistivity Logs — Pagkilala ng Fluid",
        content: [
          "Sinusukat ng mga resistivity log kung gaano kalakas ang pagtutol ng isang formation sa daloy ng electrical current. Ang asin na tubig ay isang mahusay na conductor (mababang resistivity), habang ang mga hydrocarbon at cement na bato ay mga resistor (mataas na resistivity). Ang contrast na ito ang pundamental na batayan para sa pagkilala ng mga langis-bearing zone mula sa mga tubig-bearing zone gamit ang mga log.",
          "Ang tunay na formation resistivity (Rt) ay kumakatawan sa undisturbed zone na malalim sa formation, lampas sa abot ng drilling fluid invasion. Ang mga modernong deep resistivity tool (induction at laterolog) ay sinusukat ang Rt sa pamamagitan ng pagpapadala ng alternating electromagnetic field sa formation. Ang mga shallow resistivity tool ay sinusukat ang flushed zone (Rxo) malapit sa wellbore, kung saan ang mga orihinal na fluid ay napalitan ng drilling fluid filtrate.",
        ],
        subsections: [
          {
            id: "sec-4-3-a",
            title: "Invasion at ang Resistivity Profile",
            content: [
              "Kapag ang pressure ng drilling fluid ay lumampas sa formation pressure, ang mud filtrate ay pumapasok sa formation, na pinapalitan ang mga orihinal na fluid mula sa mga pore space malapit sa wellbore. Lumilikha ito ng tatlong zone: ang flushed zone (Rxo) kaagad katabi ng borehole kung saan ang mud filtrate ay napalitan na ang karamihan ng orihinal na fluid; ang invaded zone na may intermediate resistivity; at ang uninvaded (virgin) zone na may tunay na resistivity Rt. Ang pag-unawa sa profile na ito ay mahalaga para tamang matantya ang Sw mula sa mga log.",
            ],
          },
          {
            id: "sec-4-3-b",
            title: "Pagtukoy ng Rw",
            content: [
              "Ang formation water resistivity (Rw) ay kinakailangan para sa Archie's equation at dapat matukoy nang hiwalay. Ang mga pinagkukunan ay kinabibilangan ng: direktang sukat ng produced water, SP log analysis, Pickett plot crossplot method, o mga catalog value para sa lugar. Nagbabago ang Rw kasabay ng salinity ng formation water at temperatura, at ang mga error sa Rw ay direktang nagpapalakas ng mga error sa kinakalkula na Sw.",
            ],
          },
        ],
        videoAfter: {
          label: "Karagdagang Video",
          description:
            "Pagbabasa ng Resistivity Logs — Pagkilala ng mga Hydrocarbon Zone vs. Water Zone at Pag-unawa sa mga Invasion Profile",
        },
      },
      {
        id: "sec-4-4",
        title: "Porosity Logs — Neutron, Density, at Sonic",
        content: [
          "Tatlong independyenteng tool ang nagbibigay ng mga tantya ng porosity mula sa iba't ibang pisikal na sukat. Kapag ginamit nang magkasama, nag-cross-check sila sa isa't isa, natutukoy ang lithology, at natukoy ang gas. Walang iisang porosity log ang mapagpasyahan — ang kombinasyon ng kahit dalawa ay pamantayan ng praktis.",
        ],
        subsections: [
          {
            id: "sec-4-4-a",
            title: "Neutron Porosity Log (ΦN)",
            content: [
              "Binobomba ng neutron tool ang formation ng high-energy neutron. Ang mga neutron na ito ay nagpapabagal pangunahin sa pamamagitan ng pakikipagbanggaan sa mga hydrogen atom (dahil ang hydrogen at neutron ay halos magkaparehong masa). Ang sinukat na hydrogen index ay kino-convert sa porosity, dahil ang hydrogen sa pore space ay nagmumula sa tubig, langis, o gas.",
              "Ang mga pangunahing epekto na dapat maunawaan: ang mga shale ay may mataas na apparent neutron porosity dahil ang mga mineral na clay ay naglalaman ng bound water hydrogen. Ang gas ay nagdudulot ng katangian na 'gas effect' — ang gas ay may mas mababang nilalaman ng hydrogen bawat unit ng volume kaysa sa likido, kaya mababa ang pagbabasa ng neutron porosity sa mga gas zone. Lumilikha ito ng diagnostic neutron-density crossover kapag naka-overlay sa density log.",
            ],
          },
          {
            id: "sec-4-4-b",
            title: "Density Log (ΦD) at Bulk Density",
            content: [
              "Sinusukat ng density tool ang formation bulk density (ρb) sa pamamagitan ng pagbomba ng formation ng gamma ray at pagsukat ng scattered gamma ray intensity. Ang bulk density ay direktang function ng matrix density, fluid density, at porosity. Kinakalkula ang porosity mula sa: ΦD = (ρma − ρb) / (ρma − ρfl), kung saan ang ρma ay ang grain/matrix density at ang ρfl ay ang fluid density.",
              "Mga halaga ng matrix density: sandstone 2.65 g/cm³, limestone 2.71 g/cm³, dolomite 2.87 g/cm³. Ang gas ay nagdudulot ng malaking pagbaba ng density (mababang ρb) dahil ang density ng gas ay mas mababa kaysa sa density ng likido. Ang pinagsama na neutron-density analysis ay ang pinaka-makapangyarihang lithology at porosity tool na available.",
            ],
          },
          {
            id: "sec-4-4-c",
            title: "Sonic Log (ΦS) at Interval Transit Time",
            content: [
              "Sinusukat ng sonic tool ang interval transit time (Δt, sa μs/ft) — ang oras para maglakbay ang compressional acoustic wave ng isang talampakan sa pamamagitan ng formation. Ang mga tight, mabilis na formation (mababang porosity, matigas na bato) ay may mababang Δt values (~50 μs/ft para sa limestone). Ang mga porous na formation ay may mataas na Δt values (~100+ μs/ft).",
              "Ang time-average equation ni Wyllie: 1/Δt = φ/Δtfl + (1−φ)/Δtma, ay nagpapahintulot na matantya ang porosity mula sa transit time. Ang sonic log ay partikular na mahalaga para sa pagtukoy ng fracture, pagtukoy ng lithology, at bilang pangunahing seismic-to-well tie calibration tool.",
            ],
          },
          {
            id: "sec-4-4-d",
            title: "Neutron-Density Crossover (Pagtukoy ng Gas)",
            content: [
              "Sa isang liquid-saturated na formation, ang neutron at density porosity ay magkakaayon. Sa isang gas zone, dalawang magkasalungat na epekto ang sabay na nagaganap: mababa ang pagbabasa ng neutron (ang gas ay may mababang hydrogen index) at mataas ang pagbabasa ng density porosity (mababang density ang gas). Kapag ang neutron porosity ay mas mababa kaysa sa density porosity sa log display, ang neutron-density crossover na ito ay isang makapangyarihang tagapagpahiwatig ng gas. Ang crossover effect na ito ang pinaka-maaasahang qualitative gas indicator mula sa mga log.",
            ],
          },
        ],
      },
      {
        id: "sec-4-5",
        title: "Water Saturation — Archie's Equations",
        content: [
          "Ang Archie's equations (1942) ay ang pundasyon ng quantitative well log interpretation. Inuugnay nila ang electrical resistivity ng isang water-saturated na bato sa porosity at water resistivity nito (unang batas), at pinalawak nila ito sa water saturation sa isang partially hydrocarbon-saturated na bato (ikalawang batas).",
          "Nakilala ng trabaho ni Archie na ang resistivity ng isang malinis (walang shale) na formation ay kontrolado ng nagko-conduct na tubig sa pore space, na nagbibigay ng pathway ng current. Habang mas maraming pore space, at habang mas marami ito na puno ng conductive na tubig, mas mababa ang resistivity.",
        ],
        subsections: [
          {
            id: "sec-4-5-a",
            title: "Unang Batas ni Archie — Formation Factor",
            content: [
              "Formation Factor (F) = Ro / Rw = a / φ^m. Ang Ro ay ang resistivity ng formation kapag 100% water-saturated; ang Rw ay ang resistivity ng formation water; ang a ay ang tortuosity factor (karaniwang 1.0 para sa sandstone); ang φ ay ang porosity; ang m ay ang cementation exponent (karaniwang 1.7–2.0 para sa sandstone, 2.0–2.5 para sa carbonate).",
              "Ang formation factor ay repleksyon ng geometry ng pore network — kung gaano kakulusot at makitid ang mga daan. Ang mataas na formation factor ay nangangahulugang ang pore network ay kumplikado at kulot, na mas naghihigpit sa daloy ng current kaysa sa tubig lamang.",
            ],
          },
          {
            id: "sec-4-5-b",
            title: "Ikalawang Batas ni Archie — Water Saturation",
            content: [
              "Sw^n = (F × Rw) / Rt = (a × Rw) / (φ^m × Rt), kung saan ang Rt ay ang tunay na formation resistivity at n ay ang saturation exponent (karaniwang 2.0). Niresolba ang equation na ito para sa Sw: Sw = [(a × Rw) / (φ^m × Rt)]^(1/n).",
              "Ang Archie's equation ay mahigpit na valid lamang para sa mga malinis (walang shale) na formation. Ang shale ay nagpapakilala ng karagdagang conduction pathway na nagpapababa ng resistivity at nagdudulot ng overestimation ng Sw ng Archie's equation (underestimation ng nilalaman ng hydrocarbon). Ang mga corrected equation — ang Waxman-Smits model at ang Dual Water model — ay nag-aaccount sa shaly sand problem na ito.",
            ],
          },
          {
            id: "sec-4-5-c",
            title: "Ang Shaly Sand Problem",
            content: [
              "Sa mga shaly sand, ang mga mineral na clay ay nagbibigay ng karagdagang electrical conductivity — ang mga surface ng clay ay nakabalot ng mga exchangeable cation na nagpapahintulot sa daloy ng current kahit sa kawalan ng free water. Ang karagdagang conduction path na ito ay nagpapababa ng sinukat na Rt sa ibaba ng magiging nito kung ang pore water lamang ang nag-co-conduct. Kung ang clean-sand equation ni Archie ay inilalapat nang walang pagwawasto, ang Sw ay malaki ang overestimation, at ang isang productive pay zone ay maaaring maling makilala bilang water zone.",
            ],
          },
        ],
      },
      {
        id: "sec-4-6",
        title: "Mga Advanced Log Tool — NMR at Log Facies",
        content: [
          "Ang modernong logging ay malayo na ang narating mula sa basic suite. Ang Nuclear Magnetic Resonance (NMR) logging at mga advanced na paraan ng data analysis ay nagbibigay ng mga kakayahan na imposible sa mga conventional tool.",
        ],
        subsections: [
          {
            id: "sec-4-6-a",
            title: "NMR Logging",
            content: [
              "Sinusukat ng NMR log ang relaxation time ng mga hydrogen nuclei sa pore fluid pagkatapos ng excitation ng magnetic pulse. Direkta nitong sinusukat ang pore size distribution, na nagbibigay ng mga tantya ng total porosity, free fluid index (FFI — ang producible fluid fraction), at bound volume irreducible (BVI — ang irreducible water fraction). Ang NMR ay nagbibigay din ng tantya ng permeability na independyente sa resistivity — isang natatanging kakayahan sa mga logging tool.",
              "Ang NMR ay partikular na makapangyarihan sa mga kumplikadong lithology (carbonate, tuffaceous sand) kung saan ang mga conventional porosity log ay hindi mapagkakatiwalaan, at sa mga formation kung saan ang pagtukoy kung ang tubig ay producible o bound ay nangangailangan ng pagkilala sa FFI mula sa BVI.",
            ],
          },
          {
            id: "sec-4-6-b",
            title: "Log Facies at Electrofacies",
            content: [
              "Ang mga log facies ay katangian na pattern sa mga log curve na repleksyon ng depositional environment. Halimbawa, ang funnel-shaped (coarsening-upward) na pattern ng GR ay nagmumungkahi ng prograding delta o shoreface sequence; ang bell-shaped (fining-upward) na pattern ay nagmumungkahi ng fluvial channel fill. Ang pagkilala sa mga pattern na ito ay nagpapahintulot ng correlation ng mga depositional environment sa pagitan ng mga balon.",
              "Ang electrofacies ay nagklasipika ng mga zone sa pamamagitan ng pagpapangkat ng katulad na log response gamit ang multivariate statistical methods (cluster analysis, neural network). Nagpapahintulot ito ng automated na paghati ng na-log na interval sa mga uri ng bato nang walang manu-manong interpretasyon sa bawat lalim.",
            ],
          },
        ],
      },
      {
        id: "sec-4-7",
        title: "Pagtukoy ng Net Pay at Mga Cutoff Value",
        content: [
          "Ang net pay ay ang kapal ng reservoir rock na maaaring mag-produce ng hydrocarbon sa ekonomikong viable na rate. Nakilala ito mula sa gross pay (ang buong hydrocarbon-bearing interval) sa pamamagitan ng paglalapat ng cutoff criteria sa mga petrophysical parameter na nagmumula sa mga log.",
          "Hindi bawat zone na naglalaman ng hydrocarbon ay kwalipikado bilang net pay. Ang mga zone na may napakababang porosity ay maaaring naglalaman ng hydrocarbon ngunit hindi ito magagawa sa mga kapaki-pakinabang na rate. Ang mga zone na may mataas na water saturation ay pangunahing mag-po-produce ng tubig. Ang mga shaly zone ay maaaring lumitaw bilang mga tight interval sa production log kahit may ilang porosity.",
        ],
        subsections: [
          {
            id: "sec-4-7-a",
            title: "Karaniwang Cutoff Criteria",
            content: [],
            list: [
              {
                term: "Porosity Cutoff (φ > φ_cut)",
                description:
                  "Ang mga zone na may porosity na mas mababa sa cutoff (karaniwang 6–8% para sa tight sand, 10–12% para sa conventional sand) ay nakilala bilang non-reservoir. Nica-calibrate ang cutoff laban sa core-measured porosity at production test.",
              },
              {
                term: "Water Saturation Cutoff (Sw < Sw_cut)",
                description:
                  "Ang mga zone na may water saturation na mas mataas sa cutoff (karaniwang 50–60%) ay hindi kasama sa net pay. Ang mga zone na may Sw na mas mataas sa cutoff ay mag-po-produce ng tubig sa hindi ekonomikong water-oil ratio.",
              },
              {
                term: "Shale Volume Cutoff (Vsh < Vsh_cut)",
                description:
                  "Ang mga zone na may Vsh na mas mataas sa cutoff (karaniwang 30–50%) ay nakilala bilang non-reservoir shale. Ang mga shale volume na mas mataas sa cutoff ay nagbabawas ng permeability sa hindi ekonomikong antas.",
              },
            ],
          },
          {
            id: "sec-4-7-b",
            title: "Bulk Volume Water (BVW)",
            content: [
              "Ang Bulk Volume Water (BVW = φ × Sw) ay isang kapaki-pakinabang na diagnostic tool para matukoy ang mga zone na nasa o malapit sa irreducible water saturation. Sa mga reservoir na nasa Swirr, ang BVW ay halos constant kasabay ng lalim — ang BVW ay kontrolado ng capillary properties ng bato, hindi ng taas sa itaas ng free water level. Ang mga zone kung saan ang BVW ay katumbas ng isang constant na halaga (ang irreducible BVW para sa uri ng bato na iyon) ay inaasahang mag-po-produce nang walang tubig. Ang mga zone kung saan ang BVW ay mas mataas sa irreducible na halaga ay mag-po-produce ng tubig nang sabay.",
            ],
          },
        ],
      },
    ],
    formulas: [
      {
        name: "GR Index (Shale Indicator)",
        eq: "I_GR = (GR_log − GR_min) / (GR_max − GR_min)",
        desc: "Nino-normalize ang GR reading sa pagitan ng clean sand (GR_min) at shale (GR_max). Ang I_GR ay mula 0 (malinis) hanggang 1 (purong shale).",
      },
      {
        name: "Density Porosity",
        eq: "ΦD = (ρ_ma − ρ_b) / (ρ_ma − ρ_fl)",
        desc: "ρ_ma = matrix density (sandstone: 2.65 g/cm³, limestone: 2.71 g/cm³), ρ_b = sinukat na bulk density, ρ_fl = fluid density (1.0 para sa tubig, ~0.85 para sa langis, ~0.1 para sa gas).",
      },
      {
        name: "Archie's Formation Factor",
        eq: "F = Ro / Rw = a / φ^m",
        desc: "a = tortuosity factor (~1.0), φ = porosity, m = cementation exponent (1.7–2.5). Ang F ay repleksyon ng pore geometry at tortuosity.",
      },
      {
        name: "Archie's Water Saturation",
        eq: "Sw = [(a × Rw) / (φ^m × Rt)]^(1/n)",
        desc: "Rw = formation water resistivity, Rt = tunay na formation resistivity, n = saturation exponent (~2.0). Ang pundasyon ng quantitative log interpretation.",
      },
      {
        name: "Bulk Volume Water",
        eq: "BVW = φ × Sw",
        desc: "Sa irreducible water saturation, ang BVW ay constant kasabay ng lalim para sa isang tiyak na uri ng bato. Ang variable BVW ay nagpapahiwatig ng mga kondisyon ng transition zone.",
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
    title: "Mga PVT Properties at Phase Behavior ng Hydrocarbon",
    overview:
      "Ang PVT (Pressure-Volume-Temperature) analysis ay nag-characterize kung paano kumilos ang mga reservoir fluid habang nagbabago ang pressure at temperatura sa panahon ng produksyon. Sinasaklaw ng kabanatang ito ang phase diagram, klasipikasyon ng fluid, at mga pangunahing PVT property na ginagamit sa lahat ng reservoir engineering calculation.",
    sections: [
      {
        id: "sec-5-1",
        title: "Ang PVT Concept at Batayan ng Klasipikasyon ng Fluid",
        content: [
          "Ang PVT ay kumakatawan sa Pressure, Volume, Temperature — ang tatlong thermodynamic state variable na nagtatakda ng phase at pisikal na katangian ng mga reservoir fluid. Ang PVT analysis ay ang proseso ng pagsukat at paglalarawan kung paano nagbabago ang volume, density, viscosity, at phase state ng reservoir fluid habang nagbabago ang pressure at temperatura mula sa reservoir patungong surface conditions.",
          "Ang gawi ng mga reservoir fluid ay pundamental na nakasalalay sa kanilang komposisyon — ang kamag-anak na halaga ng mga magaang na hydrocarbon (methane C1, ethane C2, propane C3, butane C4) kumpara sa mga intermediate at mabibigat na hydrocarbon (C5 hanggang C17+). Ang mga fluid na mayaman sa magaang na sangkap ay may tendensiyang kumilos na parang gas; ang mga mayaman sa mabibigat na sangkap ay may tendensiyang kumilos na parang likido.",
        ],
        subsections: [
          {
            id: "sec-5-1-a",
            title: "Ang Pressure-Temperature Phase Diagram",
            content: [
              "Ang phase diagram (PT diagram) ay ang master tool para sa pag-uuri ng mga reservoir fluid at paghula ng kanilang gawi. Para sa isang multicomponent hydrocarbon mixture, ang phase envelope ay isang curved na dalawang-dimensyonal na rehiyon na hangganan ng bubble point curve sa kaliwa at dew point curve sa kanan, na nagtatagpo sa critical point sa tuktok.",
              "Sa loob ng phase envelope, dalawang phase (likido at gas) ang sabay na umiiral. Sa labas ng envelope, ang fluid ay single-phase — alinman ay puro likido (sa mataas na pressure) o puro gas (sa mababang pressure/mataas na temperatura). Ang posisyon ng paunang kondisyon ng reservoir sa diagram na ito ang nagtatakda ng uri ng fluid at gawi ng produksyon nito.",
            ],
          },
          {
            id: "sec-5-1-b",
            title: "Mga Kritikal na Parameter ng Phase Diagram",
            content: [],
            list: [
              {
                term: "Critical Point (Tc, Pc)",
                description:
                  "Ang natatanging temperatura at pressure kung saan nawawala ang pagkakaiba sa pagitan ng likido at gas. Sa itaas ng critical temperature, walang anumang halaga ng pressure ang maaaring mag-condense ng fluid sa likido.",
              },
              {
                term: "Cricondentherm",
                description:
                  "Ang maximum na temperatura kung saan maaaring sabay na umiiral ang dalawang phase. Sa kanan ng cricondentherm, ang fluid ay hindi kailanman bubuo ng dalawang phase anuman ang pressure. Tinutukoy nito ang itaas na temperatura na hangganan ng gas condensate behavior.",
              },
              {
                term: "Cricondenbar",
                description:
                  "Ang maximum na pressure kung saan maaaring sabay na umiiral ang dalawang phase. Sa itaas ng cricondenbar, ang fluid ay palaging single-phase liquid.",
              },
              {
                term: "Undersaturated Fluid",
                description:
                  "Isang fluid na ang pressure ay nasa itaas ng bubble point (para sa langis) o dew point (para sa gas condensate), na umiiral bilang isang phase. Ang reservoir ay walang free second phase.",
              },
              {
                term: "Saturated Fluid",
                description:
                  "Isang fluid na nasa o sa ibaba ng bubble/dew point nito, sa loob ng two-phase envelope. Parehong likido at gas ang sabay na naroroon sa reservoir.",
              },
            ],
          },
        ],
        videoAfter: {
          label: "Lecture Video",
          description:
            "Mga PVT Properties at Phase Behavior — Panimula sa Pressure-Temperature Phase Diagram para sa mga Reservoir Fluid System",
        },
      },
      {
        id: "sec-5-2",
        title: "Ang Phase Envelope at Mga Reservoir Depletion Path",
        content: [
          "Ang depletion path ng isang reservoir — ang trajectory ng pressure at temperatura sa PT diagram habang ginagamit ang reservoir — ang nagtatakda kung ano ang gagawin ng fluid sa panahon ng produksyon. Karamihan sa mga reservoir ay nag-de-deplete sa halos constant na temperatura (isothermal depletion) habang bumababa ang pressure.",
        ],
        subsections: [
          {
            id: "sec-5-2-a",
            title: "Depletion sa mga Oil Reservoir",
            content: [
              "Nagsisimula ang isang oil reservoir sa itaas ng bubble point nito bilang isang undersaturated single-phase liquid. Habang nagpapatuloy ang produksyon, bumababa ang reservoir pressure. Kapag ang pressure ay umabot sa bubble point, napalaya ang unang bula ng gas. Sa ibaba ng bubble point, parehong free gas at langis ang sabay na umiiral — ang oil zone ay nagiging saturated.",
              "Nagtatayo ang gas saturation habang mas maraming gas ang napalaya. Kapag ang gas saturation ay lumampas sa critical gas saturation, ang free gas ay nagsisimulang dumaan patungo sa balon, na nagdudulot ng pagtaas ng producing GOR. Ang epektibong pamamahala ng reservoir ay naglalayong panatilihin ang reservoir pressure sa itaas ng bubble point nang matagal hangga't maaari para ma-maximize ang liquid recovery.",
            ],
          },
          {
            id: "sec-5-2-b",
            title: "Depletion sa mga Gas Condensate Reservoir",
            content: [
              "Ang mga gas condensate reservoir ay nagsisimula sa itaas ng dew point bilang single-phase gas. Habang bumababa ang pressure at tumatawid sa dew point, nag-co-condense ang likido — ngunit hindi tulad ng normal na condensation, nabubuo ang likidong ito sa pore space ng reservoir, kung saan ito ay ikinukulong ng capillary forces. Ang retrograde condensate buildup na ito ay nagbabawas ng gas permeability at ang condensate mismo ay maaaring hindi na mababawi ng primary depletion.",
              "Ang engineering na tugon ay pressure maintenance sa pamamagitan ng gas recycling: ang produced gas (pagkatapos ng condensate extraction) ay i-inject muli sa reservoir para mapanatili ang pressure sa itaas ng dew point at mapigilan ang retrograde condensation.",
            ],
          },
        ],
        videoAfter: {
          label: "Demonstrasyon ng Phase Behavior",
          description:
            "Visualization ng Phase Envelope — Pressure-Temperature Diagram para sa Black Oil, Volatile Oil, Gas Condensate, at Dry Gas System",
        },
      },
      {
        id: "sec-5-3",
        title: "Black Oil — Ang Pinakakaraniwang Reservoir Fluid",
        content: [
          "Ang black oil ay ang pinakakaraniwang at pinaka-malawak na pinag-aralan na uri ng reservoir fluid. Binubuo ito pangunahin ng mabibigat na hydrocarbon molecule (C5+) na may relatibong maliit na halaga ng mas magaang na dissolved gas. Sa kabila ng pangalan, ang mga black oil ay may kulay mula itim hanggang dark brown hanggang berde depende sa komposisyon.",
        ],
        subsections: [
          {
            id: "sec-5-3-a",
            title: "Mga Katangian ng Black Oil",
            content: [],
            list: [
              {
                term: "Mababang GOR (Gas-Oil Ratio)",
                description:
                  "Karaniwang < 2,000 scf/STB. Ang mababang GOR ay repleksyon ng limitadong halaga ng magaang na hydrocarbon na natunaw sa langis sa ilalim ng reservoir conditions. Ang solution GOR ay tumataas kasabay ng pressure hanggang sa bubble point.",
              },
              {
                term: "Mababang API Gravity",
                description:
                  "Karaniwang 15–45° API. Mabigat na crude (< 20° API), katamtamang crude (20–35° API), magaang na crude (> 35° API). API gravity = (141.5/SG) − 131.5, kung saan ang SG ay specific gravity kaugnay ng tubig.",
              },
              {
                term: "Malayo sa Critical Point",
                description:
                  "Ang paunang temperatura ng reservoir ay nasa malayo sa kaliwa ng critical temperature sa PT diagram. Ginagawa nitong pinaka-matatag, pinaka-predictable na uri ng fluid ang black oil at pinakamadaling i-model.",
              },
              {
                term: "Bo > 1.0 (karaniwang 1.1 hanggang 1.8 res bbl/STB)",
                description:
                  "Ang langis sa reservoir conditions ay naglalaman ng dissolved gas at thermally expanded kumpara sa stock tank conditions. Ang Bo ay malaki ang shrinkage sa ibaba ng bubble point habang napalaya ang gas.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-5-4",
        title: "Volatile Oil — Malapit sa Critical Region",
        content: [
          "Ang mga volatile oil ay inookupahan ang critical region ng phase diagram, na ang paunang temperatura ng reservoir ay mas malapit sa critical temperature kaysa sa black oil. Ang pagiging malapit sa critical point na ito ay may dramatikong kahihinatnan para sa gawi ng produksyon.",
        ],
        subsections: [
          {
            id: "sec-5-4-a",
            title: "Mga Katangian ng Volatile Oil",
            content: [],
            list: [
              {
                term: "Mataas na GOR",
                description:
                  "Karaniwang 2,000–100,000 scf/STB. Malaking halaga ng intermediate hydrocarbon (C2–C4) ang natunaw sa langis, handa na mag-flash sa gas kapag bumaba ang pressure sa ibaba ng bubble point.",
              },
              {
                term: "Mataas na API Gravity",
                description:
                  "Karaniwang 40–60° API. Mas magaan, mas kaunting viscous na langis. Sa surface conditions, ang volatile oil ay gumagawa ng mas mataas na kalidad, mas mahalagang crude kaysa sa black oil.",
              },
              {
                term: "Mabilis na Liquid Volume Shrinkage",
                description:
                  "Sa ibaba ng bubble point, ang malaking halaga ng dissolved intermediate component ay mabilis na nag-fla-flash sa gas. Ang produced liquid volume fraction ay mabilis na bumababa, at malaking bahagi ng reservoir oil ay maaaring dumating sa separator bilang gas-phase material.",
              },
              {
                term: "Maliwanag na Kulay ng Produced Liquid",
                description:
                  "Hindi tulad ng black oil, ang stock tank liquid mula sa mga volatile reservoir ay karaniwang amber, greenish-yellow, o napaka-light brown — repleksyon ng mataas na nilalaman ng intermediate molecular weight hydrocarbon.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-5-5",
        title: "Gas Condensate, Wet Gas, at Dry Gas",
        content: [
          "Habang ang komposisyon ng reservoir fluid ay unti-unting naglilipat patungo sa mas magaang na hydrocarbon, lilipat tayo mula sa volatile oil patungo sa gas condensate, wet gas, at sa huli ay dry gas. Kinakatawan nila ang isang continuum na tinutukoy ng posisyon sa PT phase diagram kaugnay ng critical point.",
        ],
        subsections: [
          {
            id: "sec-5-5-a",
            title: "Gas Condensate",
            content: [
              "Ang isang gas condensate reservoir ay nagsisimula sa itaas ng dew point nito bilang isang single-phase gas. Ang temperatura ng reservoir ay nasa pagitan ng critical temperature at ng cricondentherm. Habang bumababa ang pressure sa panahon ng produksyon, tinatawid ang dew point at nag-co-condense ang likidong hydrocarbon sa reservoir — retrograde condensation. Ang condensate na ito ay madalas na mayaman sa mahahalagang likido (pentane, hexane, at mas mabibigat) ngunit maaaring mahirap mabawi kapag na-drop out na ito sa pore space.",
              "Ang surface-separated condensate (tinatawag ding 'white oil' o 'lease condensate') mula sa mga gas condensate well ay karaniwang may API gravity na mas mataas sa 60° at halos transparent na hitsura. Ang gas na ginagawa ay naglalaman ng mahahalagang intermediate component na kinukuha sa gas plant.",
            ],
          },
          {
            id: "sec-5-5-b",
            title: "Wet Gas at Dry Gas",
            content: [
              "Ang mga wet gas reservoir ay nasa kanan ng cricondentherm sa phase diagram. Ang reservoir fluid ay single-phase gas sa buong depletion (walang retrograde condensation sa reservoir), ngunit ang mga kondisyon ng separator ay nasa loob ng phase envelope, na gumagawa ng liquid condensate sa surface. Ang liquid content ng wet gas ay karaniwang ipinahayag bilang gallons ng likido bawat libong standard cubic feet (GPM).",
              "Ang dry gas (pangunahin methane) ay may phase envelope na ganap na nasa kaliwa at ibaba ng reservoir conditions. Walang likidong nabubuo sa anumang punto ng proseso ng produksyon. Ang dry gas ay pinakasimpleng fluid na i-model at pinakamababang halaga bawat unit ng heating content, ngunit pinakamadaling i-process. Ang reservoir engineering ng mga dry gas reservoir ay gumagamit lamang ng material balance at gas well deliverability methods.",
            ],
          },
        ],
        videoAfter: {
          label: "PVT Analysis Walkthrough",
          description:
            "PVT Laboratory Analysis — Flash Liberation, Differential Liberation, at Separator Test para sa Reservoir Fluid Characterization",
        },
      },
      {
        id: "sec-5-6",
        title: "Mga Pangunahing PVT Property para sa Reservoir Engineering",
        content: [
          "Ang PVT laboratoryo ay nagbibigay ng isang set ng fluid property table at correlation na ang mga ito ang mahahalagang input sa lahat ng reservoir engineering calculation. Nag-characterize ang mga katangiang ito kung paano nagbabago ang mga volume at density ng fluid kasabay ng pressure mula sa reservoir conditions hanggang sa surface separator.",
        ],
        subsections: [
          {
            id: "sec-5-6-a",
            title: "Mga PVT Property ng Langis",
            content: [],
            list: [
              {
                term: "Oil Formation Volume Factor (Bo)",
                description:
                  "Ang ratio ng volume ng langis sa reservoir conditions sa volume ng langis sa stock tank conditions (res bbl/STB). Ang Bo > 1 dahil ang reservoir oil ay naglalaman ng dissolved gas at thermally expanded. Sa itaas ng bubble point, tumataas ang Bo kasabay ng pressure. Sa ibaba ng bubble point, bumababa ang Bo habang lumalabas ang gas.",
              },
              {
                term: "Solution Gas-Oil Ratio (Rs)",
                description:
                  "Volume ng gas na natunaw sa langis sa reservoir pressure at temperatura bawat stock tank barrel ng langis (scf/STB). Tumataas ang Rs kasabay ng pressure hanggang sa bubble point, pagkatapos ay nananatiling constant (ang langis ay nasa saturation pressure). Sa ibaba ng bubble point, bumababa ang Rs habang napalaya ang gas.",
              },
              {
                term: "Oil Viscosity (μo)",
                description:
                  "Viscosity ng reservoir oil sa in-situ conditions (cP). Sa itaas ng bubble point, tumataas ang viscosity habang bumababa ang pressure. Sa ibaba ng bubble point, bumababa ang viscosity habang napalaya ang dissolved gas, na ginagawang mas kaunting viscous ang langis.",
              },
            ],
          },
          {
            id: "sec-5-6-b",
            title: "Mga PVT Property ng Gas",
            content: [],
            list: [
              {
                term: "Z-Factor (Gas Compressibility Factor)",
                description:
                  "Dimensionless na pagwawasto para sa paglihis ng tunay na gas mula sa ideal: PV = ZnRT. Tinutukoy ang Z mula sa gas specific gravity at reservoir P, T gamit ang Standing-Katz correlation o equations of state. Ang Z ay lumalapot sa 1 sa mababang pressure (ideal gas limit).",
              },
              {
                term: "Gas Formation Volume Factor (Bg)",
                description:
                  "Volume ng gas sa reservoir conditions bawat unit ng volume sa standard conditions. Bg = 0.00504 × ZT/P (res bbl/scf) o 0.02829 × ZT/P (cuft/scf). Maliit ang Bg sa mataas na pressure at malaki ang pagtaas nito habang bumababa ang pressure.",
              },
              {
                term: "Gas Compressibility (cg)",
                description:
                  "Para sa mga tunay na gas, cg = 1/P − (1/Z)(dZ/dP). Near-ideal gas behavior: cg ≈ 1/P. Ang gas compressibility ang pangunahing katangian na nagtatakda kung gaano karaming enerhiya ang nakaimbak sa gas reservoir sa paunang pressure.",
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
        desc: "Z = compressibility factor, n = moles ng gas, R = gas constant (10.73 psi·ft³/lbmol·°R), T = absolute temperature (°R).",
      },
      {
        name: "Gas Formation Volume Factor",
        eq: "Bg = 0.02829 × Z × T / P",
        desc: "Bg sa ft³/scf; T sa °R (= °F + 460), P sa psia. Kino-convert ang reservoir gas volume sa standard surface volume.",
      },
      {
        name: "API Gravity",
        eq: "API = (141.5 / SG_oil) − 131.5",
        desc: "SG_oil = specific gravity ng langis kaugnay ng tubig sa 60°F. API < 20 = mabigat na langis; 20–35 = katamtaman; > 35 = magaan; > 60 = condensate.",
      },
      {
        name: "Oil Formation Volume Factor (approximation)",
        eq: "Bo = 0.972 + 1.47×10⁻⁴ × [Rs(γg/γo)^0.5 + 1.25T]^1.175",
        desc: "Standing's correlation para sa Bo sa itaas ng bubble point. Rs = solution GOR (scf/STB), γg = gas gravity, γo = oil gravity, T = temperatura (°F).",
      },
      {
        name: "Gas Compressibility",
        eq: "c_g = 1/P − (1/Z)(dZ/dP)",
        desc: "Para sa ideal gas behavior (Z=1, dZ/dP=0): c_g = 1/P. Ang gas compressibility ang kumokontrol sa gawi ng depletion at material balance.",
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
    title: "Integrasyon ng Petrophysics at Phase Behavior",
    overview:
      "Sa tunay na reservoir engineering, ang petrophysics at PVT ay hindi maaaring gamitin nang hiwalay. Tinalakay ng kabanatang ito kung paano magkasamang kumokontrol ang mga katangian ng bato at fluid sa performance ng reservoir — at kung ano ang nangyayari kapag mahina ang integrasyon.",
    sections: [
      {
        id: "sec-6-1",
        title: "Bakit Mahalaga ang Integrasyon",
        content: [
          "Ang petrophysics na walang PVT ay hindi makakapaghula ng produksyon — sinasabi nito kung saan ang langis at gaano ka-permeable ang bato, ngunit hindi kung paano kumilos ang fluid habang bumababa ang pressure. Ang PVT na walang petrophysics ay hindi makakapaghula ng daloy — sinasabi nito ang mga katangian ng fluid, ngunit hindi kung gaano kabilis o gaano kadali ang pagkilos ng fluid sa pamamagitan ng bato. Tanging ang kanilang kombinasyon ang gumagawa ng kumpletong, predictive na modelo ng performance ng reservoir.",
          "Isipin ang dalawang reservoir na may magkaparehong porosity at permeability: ang isa ay naglalaman ng magaan, mababang viscosity na langis; ang isa pa ay naglalaman ng mabigat, mataas na viscosity na langis. Ang performance ng reservoir ay magiging dramatikong magkaiba. Kumokontrol ang permeability kung maaaring gumalaw ang fluid, ngunit kumokontrol ang viscosity kung gaano kahirap itulak. Ang produkto ng dalawa ang nagtatakda ng aktwal na flow rate at recovery.",
        ],
        noteBox: {
          title: "Ang Pundamental na Prinsipyo ng Integrasyon",
          items: [
            "Ang mga katangian ng bato (petrophysics) ay nagtatakda kung SAAN ang mga fluid at kung PAANO sila maaaring gumalaw.",
            "Ang mga katangian ng fluid (PVT) ay nagtatakda kung PAANO kumilos ang mga fluid habang nagbabago ang pressure.",
            "Ang reserves estimation ay nangangailangan ng PAREHONG: nagbibigay ang petrophysics ng Vb, φ, Sw; nagbibigay ang PVT ng Bo o Bg.",
            "Ang reservoir simulation ay nangangailangan ng PAREHONG bilang input: static (petrophysical) at dynamic (PVT) na data.",
          ],
        },
      },
      {
        id: "sec-6-2",
        title: "Mga Pangunahing Integrated Rock at Fluid Property",
        content: [
          "Ang performance ng reservoir ay kontrolado ng interaksyon sa pagitan ng mga katangian ng bato at fluid. Alinman sa set ng mga katangian na nag-iisa ay hindi sapat para ma-characterize ang gawi ng reservoir.",
        ],
        subsections: [
          {
            id: "sec-6-2-a",
            title: "Mga Kritikal na Katangian ng Bato",
            content: [],
            list: [
              {
                term: "Porosity (φ)",
                description:
                  "Kumokontrol sa volume ng fluid na nakaimbak sa reservoir. Kasama ng lugar at net pay, nagtatakda ito ng hydrocarbon in place.",
              },
              {
                term: "Permeability (k)",
                description:
                  "Kumokontrol sa rate ng pagkilos ng fluid patungo sa balon. Ang mataas na porosity na may mababang permeability ay isang karaniwang kabiguan — naroroon ang fluid ngunit hindi dumadaling.",
              },
              {
                term: "Relative Permeability (k_r)",
                description:
                  "Kumokontrol kung gaano kadaling dumadaling ang bawat fluid phase sa presensya ng iba. Ang hugis ng mga relative permeability curve ang nagtatakda ng producing GOR, WOR, at sweep efficiency sa buong buhay ng field.",
              },
              {
                term: "Wettability",
                description:
                  "Namamahala sa paunang distribusyon ng saturation, sa hugis ng capillary pressure at relative permeability curve, at sa kahusayan ng waterflood displacement.",
              },
              {
                term: "Capillary Pressure",
                description:
                  "Kumokontrol sa vertical na distribusyon ng saturation at sa kapal ng transition zone. Nagtatakda kung gaano karaming bahagi ng rock column ang nasa net pay.",
              },
            ],
          },
          {
            id: "sec-6-2-b",
            title: "Mga Kritikal na PVT Property",
            content: [],
            list: [
              {
                term: "Formation Volume Factors (Bo, Bg)",
                description:
                  "Kino-convert ang mga volume ng fluid sa pagitan ng reservoir conditions at surface conditions. Mahalaga para sa mga kalkulasyon ng OOIP/GIIP at material balance.",
              },
              {
                term: "Fluid Viscosity (μo, μg)",
                description:
                  "Kumokontrol sa flow resistance. Ang mabigat na heavy oil na may mataas na viscosity ay mas mabagal dumaan sa parehong bato kaysa sa magaang na langis na may mababang viscosity. Kritikal na input sa Darcy flow equation at mobility calculations.",
              },
              {
                term: "Fluid Compressibility (Co, Cg)",
                description:
                  "Nagtatakda kung gaano karaming enerhiya ang nakaimbak sa fluid at napalaya habang depressurizing ang reservoir. Ang gas ay may napakataas na compressibility; ang langis ay may mas mababang compressibility, malapit sa compressibility ng tubig sa itaas ng bubble point.",
              },
              {
                term: "Phase Behavior (Pb, Pd)",
                description:
                  "Nagtatakda ng saturation state sa buong buhay ng reservoir. Ang pag-alam sa bubble o dew point kaugnay ng reservoir pressure ay nagsasabi sa amin kung nasa single-phase o two-phase flow tayo.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-6-3",
        title: "Volumetric Reserves Estimation",
        content: [
          "Ang volumetric method ay ang pinaka-pundamental na paraan sa pagtatantya ng hydrocarbon na paunang naroroon. Ganap itong nakasalalay sa mga integrated petrophysical at PVT input. Ang mga error sa alinmang set ng input ay direktang nagpapalakas ng mga error sa reserves.",
        ],
        subsections: [
          {
            id: "sec-6-3-a",
            title: "Ang OOIP Formula at ang mga Input Nito",
            content: [
              "Ang stock tank oil initially in place (STOIIP o N) ay kinakalkula bilang: N = (Vb × φ × (1 − Sw)) / Bo. Ang bawat term ay may tiyak na pinagkukunan: ang Vb (bulk volume) ay nagmumula sa seismic mapping at geological interpretation; ang φ (porosity) at Sw (water saturation) ay nagmumula sa petrophysical log analysis na nica-calibrate sa core data; ang Bo (oil formation volume factor) ay nagmumula sa PVT laboratory analysis ng mga representative fluid sample.",
              "Ang 10% na error sa alinmang isa sa mga input na ito ay gumagawa ng halos 10% na error sa STOIIP. Sa praktis, ang pinakamalalaking uncertainty ay karaniwang nagmumula sa porosity (lalo na sa mga carbonate), Sw (apektado ng clay, invasion, at Archie parameter uncertainty), at Vb (dahil sa structural at stratigraphic uncertainty). Ang mga PVT error ay karaniwang mas maliit dahil ang mga laboratoryo na sukat ng Bo ay medyo tumpak.",
            ],
          },
          {
            id: "sec-6-3-b",
            title: "Recovery Factor at Recoverable Reserves",
            content: [
              "Hindi pareho ang STOIIP at recoverable reserves. Ang Recovery Factor (RF) ay ang bahagi ng STOIIP na maaaring ekonomikong ma-extract gamit ang kasalukuyang teknolohiya. Ang RF ay lubos na nakasalalay sa drive mechanism (ang water drive ay nagbibigay ng 35–75%; ang solution gas drive ay nagbibigay ng 5–30%), kalidad ng bato, mga katangian ng fluid, at ang piniling strategy ng pag-unlad.",
              "Recoverable Reserves = STOIIP × RF. Ang recovery factor mismo ay function ng mga integrated rock-fluid property — partikular ang mga relative permeability endpoint, wettability, at fluid viscosity. Ang isang mahusay na paglalarawan ng PVT na pinagsama sa mahinang relative permeability data ay magbibigay ng maling hula ng RF.",
            ],
          },
        ],
      },
      {
        id: "sec-6-4",
        title: "Mga Epekto ng Pressure Depletion sa Bato at Fluid",
        content: [
          "Ang produksyon mula sa isang reservoir ay karaniwang kontroladong pag-ubos ng natural na enerhiya na nakaimbak sa anyo ng elevated fluid at rock pressure. Habang bumababa ang pressure na ito, parehong sabay na tumutugon ang mga fluid at ang bato, at ang mga tugon na ito ay nakikipag-interaksyon sa isa't isa sa mga paraan na kumokontrol sa performance ng produksyon.",
        ],
        subsections: [
          {
            id: "sec-6-4-a",
            title: "Gawi ng Fluid sa Panahon ng Depletion",
            content: [],
            list: [
              {
                term: "Oil Volume Shrinkage",
                description:
                  "Sa ibaba ng bubble point, napalaya ang dissolved gas, at bumababa ang Bo. Ang volume ng langis sa reservoir ay lumiit habang lumalabas ang gas mula sa solusyon. Nagbabawas ito ng oil production rate dahil may mas kaunting kabuuang fluid expansion energy bawat bariles ng langis.",
              },
              {
                term: "Free Gas Liberation",
                description:
                  "Ang gas na napalaya mula sa solusyon sa ibaba ng bubble point ay nagtatayo ng free gas saturation sa pore space. Kapag ang Sg ay lumampas sa critical gas saturation, ang free gas ay dumadaling at mabilis na tumataas ang producing GOR.",
              },
              {
                term: "Gas Expansion",
                description:
                  "Ang free gas ay malaki ang pagpapalawak habang bumababa ang pressure (tumataas ang Bg), na nagbibigay ng karagdagang enerhiya para sa produksyon ng fluid. Sa mga gas reservoir, ang pagpapalawak na ito ang pangunahing drive mechanism.",
              },
              {
                term: "Mga Pagbabago ng Viscosity",
                description:
                  "Sa ibaba ng bubble point, bumababa ang oil viscosity habang lumalabas ang gas mula sa solusyon (ang mas magaan, mas kaunting viscous na langis ang nananatili). Nagpapabuti ito ng mobility ratio, na bahagyang nagkokompensayon sa epekto ng free gas na nagbabawas ng oil relative permeability.",
              },
            ],
          },
          {
            id: "sec-6-4-b",
            title: "Gawi ng Bato sa Panahon ng Depletion",
            content: [
              "Habang bumababa ang reservoir pressure, tumataas ang epektibong overburden stress, na nagdudulot ng compaction ng rock matrix. Nagbabawas ito ng pore volume (pore volume compressibility effect), na nagbibigay ng karagdagang enerhiya para itulak ang mga fluid palabas ng bato. Sa karamihan ng reservoir, ang compaction drive na ito ay maliit na kontribusyon sa kabuuang recovery. Sa mga highly compressible chalk reservoir at sa mga overpressured formation, gayunpaman, ang compaction drive ay maaaring maging dominanteng mekanismo.",
              "Sa ilang reservoir, ang compaction ay nagbabawas din ng permeability nang hindi na mababalik habang nag-ko-constrict ang mga pore throat. Ang mga fracture ay maaaring magsara (nagbabawas ng fracture permeability) o mapalawak (nagpapalaki ng natural fracture contribution) depende sa direksyon ng stress at oryentasyon kaugnay ng producing structure.",
            ],
          },
        ],
      },
      {
        id: "sec-6-5",
        title: "Multiphase Flow at Mobility sa Integrated Context",
        content: [
          "Ang Darcy flow equation para sa isang phase ay nagbibigay ng flow rate = k × A × ΔP / (μ × L). Sa isang multiphase system, ang daloy ng bawat phase ay kontrolado ng effective permeability nito, na katumbas ng k_r × k_abs. Pinagsasama ng konsepto ng mobility ang parehong katangian ng bato at fluid sa isang sukat ng kagalingan ng daloy.",
          "Mobility ratio M = λ_displacing / λ_displaced = (k_r,disp / μ_disp) / (k_r,oil / μ_oil). Kapag ang M < 1, matatag ang displacement. Kapag ang M > 1, nagaganap ang viscous fingering. Ang tagumpay ng anumang waterflood o gas injection project ay tinutukoy ng ratio na ito, na nag-iintegrate ng parehong relative permeability ng reservoir rock (isang petrophysical property) at ang mga fluid viscosity (PVT property).",
        ],
        subsections: [
          {
            id: "sec-6-5-a",
            title: "Mga Integrated na Implikasyon para sa Waterflood Design",
            content: [
              "Ang waterflooding ay nagpapalit ng langis ng injected water. Ang kahusayan ay nakasalalay sa: mobility ratio M (kontrolado ng parehong k_r curves at fluid viscosity); areal sweep efficiency (kontrolado ng well pattern, heterogeneity, at M); vertical sweep efficiency (kontrolado ng permeability layering at gravity); at displacement efficiency (kontrolado ng relative permeability endpoint — partikular ang Sor).",
              "Ang isang heavy oil reservoir na may magandang katangian ng bato (mataas na k, magandang connectivity) ay maaari pa ring mag-produce nang mahinang mahinang sa ilalim ng waterflooding dahil ang unfavorable mobility ratio (M >> 1 dahil sa mataas na oil viscosity) ay nagdudulot ng fingering at maagang water breakthrough. Ang polymer flooding — na nagpapalaki ng water viscosity para bawasan ang M — ang karaniwang lunas.",
            ],
          },
        ],
      },
      {
        id: "sec-6-6",
        title: "Petrophysics at PVT sa Reservoir Simulation",
        content: [
          "Ang reservoir simulation ang ultimate integration tool — pinagsasama nito ang isang three-dimensional geological model na puno ng mga petrophysical property sa isang dynamic fluid model na inilarawan ng mga PVT equation, at nireresolba ang mga coupled flow equation para hulaan ang performance ng produksyon sa buong buhay ng reservoir.",
        ],
        subsections: [
          {
            id: "sec-6-6-a",
            title: "Mga Static Petrophysical Input",
            content: [],
            list: [
              {
                term: "Porosity (φ)",
                description:
                  "Ibinahagi sa buong 3D simulation grid mula sa log analysis, geostatistical modeling, at core calibration. Kumokontrol sa fluid storage sa bawat grid cell.",
              },
              {
                term: "Permeability (k_h, k_v)",
                description:
                  "Horizontal at vertical permeability. Kumokontrol sa daloy sa pagitan ng mga grid cell. Madalas na pinaka-hindi siguradong katangian sa simulation model.",
              },
              {
                term: "Net-to-Gross (N/G)",
                description:
                  "Bahagi ng bawat grid layer na productive reservoir rock, batay sa net pay cutoff mula sa log analysis.",
              },
              {
                term: "Rock Types at Relative Permeability Curves",
                description:
                  "Ang iba't ibang uri ng bato ay may iba't ibang k_r at Pc curves, na sinusukat mula sa SCAL. Ang tamang pagtatalaga ng uri ng bato sa bawat grid cell ay kritikal para sa tumpak na production forecasting.",
              },
            ],
          },
          {
            id: "sec-6-6-b",
            title: "Mga Dynamic PVT Input",
            content: [],
            list: [
              {
                term: "PVT Tables (Bo, Rs, μo, Bg, Z)",
                description:
                  "Mga look-up table ng mga katangian ng fluid bilang function ng pressure. Ang simulator ay nag-iinterpolate ng mga ito sa bawat pressure step para kalkulahin ang mga volume ng fluid at flow mobility.",
              },
              {
                term: "Fluid Compressibility",
                description:
                  "Kumokontrol kung gaano karaming fluid ang lumalawak bawat unit ng pagbaba ng pressure. Kritikal para sa material balance validation at history matching.",
              },
              {
                term: "Phase Behavior Model",
                description:
                  "Para sa mga gas condensate at volatile oil system, ang isang compositional model (equation of state) ay kinakailangan para tumpak na ma-track ang mga pagbabago ng phase sa buong simulation.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-6-7",
        title: "Mga Kahihinatnan ng Mahinang Integrasyon",
        content: [
          "Ang kasaysayan ng petroleum engineering ay puno ng mga case study kung saan ang mahinang integrasyon ng petrophysical at PVT data ay nagdulot ng mga mahal na pagkakamali sa field development. Ang pag-unawa sa mga failure mode na ito ay kasinghalaga ng pag-unawa sa mga tamang pamamaraan.",
        ],
        subsections: [
          {
            id: "sec-6-7-a",
            title: "Mga Karaniwang Integration Error at ang kanilang mga Kahihinatnan",
            content: [],
            list: [
              {
                term: "Paggamit ng Maling Saturation Model",
                description:
                  "Ang paglalapat ng Archie's equation sa isang shaly sand nang walang pagwawasto ay sistematikong nag-o-overestimate ng Sw, nag-u-underestimate ng STOIIP, at maaaring magdulot ng pag-abandono ng mga productive zone bilang mga water zone.",
              },
              {
                term: "Pagbabalewalang mga Epekto ng Wettability",
                description:
                  "Ang paggamit ng mga relative permeability curve na sinukat sa ilalim ng water-wet na kondisyon ng laboratoryo sa isang oil-wet o mixed-wet carbonate reservoir ay nagdudulot ng mahinang waterflood history match at labis na optimistikong recovery forecast.",
              },
              {
                term: "Paggamit ng Maling PVT Model",
                description:
                  "Ang pag-characterize ng isang volatile oil reservoir gamit ang black oil PVT model (sa halip na isang compositional model) ay maaaring malaki ang maling representasyon ng gas-oil ratio behavior at liquid recovery sa ibaba ng bubble point.",
              },
              {
                term: "Over-smoothing ng Permeability",
                description:
                  "Ang pag-average ng mga heterogeneous permeability profile ay nag-aalis ng mahahalagang baffle at hadlang, na nagdudulot ng overpredict ng simulation ng early sweep efficiency at underpredict ng oras ng water breakthrough.",
              },
            ],
          },
        ],
        noteBox: {
          title: "Mga Pangunahing Prinsipyo ng Integrasyon",
          items: [
            "Karamihan sa mga kabiguan ng reservoir ay dahil sa maling interpretasyon ng data ng bato o fluid, hindi sa mga arithmetic error.",
            "Ang reservoir model ay kasinghalaga lang ng pinaka-mahinang input nito — tukuyin at quantify ang mga uncertainty.",
            "Ang history matching laban sa aktwal na production data ang ultimate na pagsubok ng kalidad ng integrasyon.",
            "Ang sensitivity analysis sa mga pangunahing hindi siguradong parameter (k, φ, Sw, Pc, kr) ay palaging kinakailangan.",
          ],
        },
      },
    ],
    formulas: [
      {
        name: "STOIIP (Stock Tank Oil Initially In Place)",
        eq: "N = (Vb × φ × (1 − Sw)) / Bo",
        desc: "Vb = bulk volume (res bbl mula sa seismic/geology), φ at Sw mula sa petrophysics, Bo mula sa PVT. Ang lahat ng input ay dapat na konsistente.",
      },
      {
        name: "Recoverable Oil Reserves",
        eq: "Np = N × RF",
        desc: "Recoverable reserves = STOIIP × Recovery Factor. Ang RF ay nakasalalay sa drive mechanism, uri ng bato, mga katangian ng fluid, at strategy ng pag-unlad.",
      },
      {
        name: "Fluid Mobility",
        eq: "λ = k_r / μ",
        desc: "Pinagsasama ang katangian ng bato (relative permeability k_r) at katangian ng fluid (viscosity μ) sa isang sukat ng kagalingan ng daloy.",
      },
      {
        name: "Mobility Ratio",
        eq: "M = (k_r,w / μ_w) / (k_r,o / μ_o)",
        desc: "M < 1 → matatag na waterflood; M = 1 → unit mobility ratio (neutral); M > 1 → viscous fingering. Pinagsasama ang parehong petrophysical at PVT input.",
      },
      {
        name: "Darcy's Law sa Field Units",
        eq: "q = 1.127×10⁻³ × (k × A × ΔP) / (μ × L)",
        desc: "q = flow rate (bbl/day), k sa mD, A sa ft², ΔP sa psi, μ sa cP, L sa ft. Ang praktikal na anyo para sa reservoir engineering.",
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
    title: "Aplikasyon sa Reservoir Engineering",
    overview:
      "Mula sa mga drive mechanism hanggang sa secondary at enhanced recovery, ipinapakita ng huling kabanatang ito kung paano inilalapat ang lahat ng nakaraang petrophysical at PVT prinsipyo sa tunay na engineering ng pag-unlad ng field ng langis at gas at pag-optimize ng produksyon.",
    sections: [
      {
        id: "sec-7-1",
        title: "Mga Pinagkukunan ng Enerhiya ng Reservoir",
        content: [
          "Ang bawat reservoir ng langis at gas ay paunang naglalaman ng isang tiyak na halaga ng nakaimbak na enerhiya, katumbas ng pressure na umiiral sa itaas ng normal na hydrostatic pressure. Ang enerhiyang ito ang nagtutulak ng mga fluid patungo sa wellbore sa panahon ng produksyon. Ang pag-unawa sa pinagkukunan at magnitude ng enerhiyang ito ay pundamental sa paghula ng performance ng reservoir at pagdisenyo ng optimal na strategy ng produksyon.",
        ],
        subsections: [
          {
            id: "sec-7-1-a",
            title: "Mga Pinagkukunan ng Drive Energy ng Reservoir",
            content: [],
            list: [
              {
                term: "Fluid Expansion (Langis, Gas, Tubig)",
                description:
                  "Habang bumababa ang reservoir pressure, ang mga fluid ay lumalawak ayon sa kanilang compressibility. Ang gas expansion ang pinaka-makapangyarihang pinagkukunan ng enerhiya dahil ang gas ay highly compressible. Ang oil at water expansion ay mas maliit na kontribusyon.",
              },
              {
                term: "Dissolved Gas Expansion",
                description:
                  "Sa ibaba ng bubble point, ang gas ay lumalabas mula sa solusyon mula sa langis, malaki ang pagpapalawak habang bumababa ang pressure. Ang napalaya na gas na ito ay nagbibigay ng malakas na drive ngunit nagdudulot ng mabilis na pagbaba ng pressure at pagtaas ng GOR kung hindi maayos na pinamamahalaan.",
              },
              {
                term: "Gas Cap Expansion",
                description:
                  "Ang free gas na naipon sa itaas ng oil zone sa gas cap ay lumalawak habang bumababa ang pressure, na nagtutulak pababa at nagpapalipat ng langis patungo sa mga produksyon na balon. Ang pagpapanatili ng malaki, buo na gas cap ay isa sa mga pinaka-epektibong strategy para sa pressure maintenance.",
              },
              {
                term: "Aquifer Water Influx (Water Encroachment)",
                description:
                  "Ang natural na pagpasok ng tubig mula sa isang konektadong aquifer ay nagpupuno ng volume ng reservoir habang ginagamit ang langis. Ang aktibong suporta ng aquifer ay maaaring mapanatili ang halos constant na reservoir pressure sa buong buhay ng field. Ang pinaka-mahusay na natural drive mechanism.",
              },
              {
                term: "Rock at Fluid Compressibility",
                description:
                  "Ang pagpapalawak ng pagbaba ng pore volume (compaction) at connate water habang bumababa ang pressure. Karaniwang maliit na kontribusyon maliban sa mga highly compressible rock (chalk, unconsolidated sand) o lubos na overpressured reservoir.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-7-2",
        title: "Primary Recovery — Solution Gas Drive",
        content: [
          "Ang primary recovery ay tumutukoy sa produksyon na ganap na pinapatakbo ng natural na enerhiya ng reservoir, nang walang anumang injection ng gas o tubig. Ang mekanismong nagbibigay ng enerhiyang ito ay tinatawag na drive mechanism, at ito ay pundamental na nagtatakda kung gaano karaming langis ang ginagawa at kung gaano katagal ang produksyon na nananatiling ekonomiko.",
        ],
        subsections: [
          {
            id: "sec-7-2-a",
            title: "Solution Gas Drive Mechanism",
            content: [
              "Ang solution gas drive (tinatawag din na dissolved gas drive o depletion drive) ay ang pinakasimple at pinakakaraniwang primary recovery mechanism. Ang reservoir ay nagsisimula sa itaas ng bubble point bilang isang single-phase liquid. Habang binabawasan ng produksyon ang reservoir pressure sa ibaba ng bubble point, ang dissolved gas ay napalaya mula sa langis.",
              "Ang napalaya na gas ay lumalawak, na nagbibigay ng enerhiya para itulak ang langis patungo sa wellbore. Gayunpaman, habang nagtatayo ang free gas saturation sa itaas ng critical gas saturation, ang gas ay nagsisimulang dumaning preferentially (dahil ang gas mobility ay mas mataas kaysa sa oil mobility sa mataas na gas saturation). Ang producing GOR ay mabilis na tumataas, at ang oil production rate ay mabilis na bumababa.",
              "Ang mga recovery factor para sa solution gas drive ay karaniwang 5–30% ng STOIIP — ang pinakamababa sa lahat ng primary drive mechanism. Ang pressure maintenance ng gas o water injection bago mabilis na tumaas ang GOR ay dramatikong nagpapabuti ng recovery.",
            ],
          },
          {
            id: "sec-7-2-b",
            title: "Mga Katangian ng Produksyon ng Solution Gas Drive",
            content: [],
            list: [
              {
                term: "Mabilis na Pagbaba ng Pressure",
                description:
                  "Nang walang external na input ng enerhiya, ang reservoir pressure ay mabilis na bumabagsak habang ginagamit ang langis at gas. Ang rate ng pagbaba ng pressure ay proporsyonal sa production rate at inversely proporsyonal sa kabuuang fluid compressibility.",
              },
              {
                term: "Tumataas na Gas-Oil Ratio",
                description:
                  "Nagsisimula ang GOR sa paunang solution GOR (Rs), pagkatapos ay mabilis na tumataas sa ibaba ng bubble point habang ang free gas saturation ay lumampas sa Sgc. Ang mabilis na pagtaas ng GOR ang diagnostic na palatandaan ng solution gas drive.",
              },
              {
                term: "Bumababang Oil Rate",
                description:
                  "Habang bumabagsak ang reservoir pressure at tumataas ang gas saturation (nagbabawas ng oil relative permeability), ang oil production rate ay tuloy-tuloy na bumababa. Sa kalaunan, ang daloy ng gas ang nangunguna at ang produksyon ng langis ay nagiging hindi na ekonomiko.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-7-3",
        title: "Primary Recovery — Gas Cap Drive at Water Drive",
        content: [
          "Ang gas cap drive at water drive ay makabuluhang mas mahusay na natural drive mechanism kaysa sa solution gas drive dahil nagbibigay sila ng tuloy-tuloy na pressure support, na nagpapanatili ng reservoir sa mas mataas na average pressure nang mas matagal.",
        ],
        subsections: [
          {
            id: "sec-7-3-a",
            title: "Gas Cap Drive",
            content: [
              "Sa isang gas cap reservoir, ang isang free gas phase ay inookupahan ang structural crest sa itaas ng oil zone. Habang ginagamit ang langis mula sa mga flanks, ang gas cap ay lumalawak pababa, na nagpapalipat ng langis patungo sa mga produksyon na balon. Ang gas cap ay nagpapanatili ng reservoir pressure nang mas mahusay kaysa sa solution gas drive na mag-isa.",
              "Ang mga recovery factor para sa gas cap drive ay karaniwang 20–40% ng STOIIP, makabuluhang mas mahusay kaysa sa solution gas drive. Ang susi para sa pag-maximize ng recovery ay mapigilan ang gas coning — ang maagang breakthrough ng gas cap gas sa mga oil-producing well — sa pamamagitan ng pagkontrol ng mga production rate at paglalagay ng balon.",
            ],
          },
          {
            id: "sec-7-3-b",
            title: "Water Drive",
            content: [
              "Ang water drive ay ang pinaka-mahusay na natural drive mechanism, kayang mag-recover ng 35–75% ng STOIIP. Gumagana ito sa pamamagitan ng isang aquifer — isang water-bearing formation na konektado sa reservoir — na nagpapasok ng tubig sa reservoir habang ginagamit ang langis, na nagpapanatili ng reservoir pressure malapit sa orihinal na antas nito.",
              "Ang kahusayan ng water drive ay nakasalalay sa mobility ratio sa pagitan ng tubig at langis, ang rate ng pagpasok ng tubig kaugnay ng rate ng produksyon, at ang antas ng permeability heterogeneity. Sa mga malakas na water drive reservoir, ang reservoir pressure ay nanatiling halos constant hanggang sa magiging hindi na ekonomiko ang mga water cut.",
            ],
          },
          {
            id: "sec-7-3-c",
            title: "Expansion at Compaction Drive",
            content: [
              "Ang rock at fluid expansion drive ay dominante sa mga undersaturated oil reservoir sa itaas ng bubble point, kung saan ang tanging pinagkukunan ng enerhiya ay ang pagpapalawak ng bahagyang compressible na langis, tubig, at bato. Ang recovery ay napakababa (1–5% ng STOIIP) dahil maliit ang liquid at rock compressibility.",
              "Ang compaction drive ay nagaganap kapang ang reservoir rock ay sapat na compressible na ang pagbaba ng pore volume nito ay makabuluhang nag-aambag sa pag-expulse ng fluid. Sa mga chalk reservoir at unconsolidated deep sand, ang mekanismong ito ay maaaring maging malaki. Gayunpaman, ang malubhang compaction ay maaaring magdulot ng irreversible na pagbaba ng permeability at subsidence ng ibabaw ng lupa.",
            ],
          },
        ],
      },
      {
        id: "sec-7-4",
        title: "Combination Drive at Pagtukoy ng Drive Mechanism",
        content: [
          "Karamihan sa mga tunay na reservoir ay hindi pinapatakbo ng isang purong mekanismo. Ang mga combination drive reservoir ay nakakaranas ng sabay na kontribusyon mula sa solution gas, gas cap expansion, water influx, at rock compressibility. Ang kamag-anak na kontribusyon ay nagbabago sa buong buhay ng produksyon ng field habang unti-unting naubos ang bawat pinagkukunan ng enerhiya.",
          "Ang tamang pagtukoy ng dominanteng drive mechanism ay kritikal para sa optimal na pamamahala ng field. Ang material balance analysis (ang paraan ng Havlena-Odeh at Craft-Hawkins) ay nag-de-decompose ng cumulative production sa mga kontribusyon mula sa bawat mekanismo, na nagpapahintulot sa mga engineer na matukoy kung ano ang nagpapatakbo ng reservoir at hulaan ang hinaharap na performance.",
        ],
        subsections: [
          {
            id: "sec-7-4-a",
            title: "Mga Kahihinatnan ng Maling Pagtukoy ng Drive Mechanism",
            content: [
              "Kung ang isang water drive reservoir ay maling na-model bilang isang solution gas drive reservoir, ang mga injection project ay hindi maayos na madidisenyuhan. Ang water injection ay maaaring simulan kapag ang aquifer ay maaari sana ay nagpanatili ng sapat na pressure support, na aksidente ang kapital. Sa kabilang banda, kung ang isang aktibong aquifer ay hindi nakilala, ang depletion ay maaaring masyadong mabilis, na nagpapahintulot ng maagang gas breakout o edge-water encroachment.",
              "Ang maling pagtukoy ng isang gas condensate reservoir bilang isang dry gas reservoir ay maaaring magresulta sa hindi pagpansin sa retrograde condensate buildup, na nagdudulot ng pagkawala ng mahalagang condensate production at nabawasang gas deliverability habang ang condensate ay naghaharang ng mga near-wellbore pore.",
            ],
          },
        ],
      },
      {
        id: "sec-7-5",
        title: "Secondary Recovery — Water Flooding at Gas Injection",
        content: [
          "Kapag ang natural na enerhiya ng reservoir ay kulang o bumababa, ang mga secondary recovery method ay ginagamit para artipisyal na mapanatili ang reservoir pressure at mapalipat ang langis patungo sa mga producing well. Ang water flooding at gas injection ang dalawang pamantayang secondary recovery technique.",
          "Ang water flooding ang dominanteng secondary recovery method sa buong mundo. Ang tubig ay ini-inject sa pamamagitan ng mga dedicated injection well para mapalipat ang langis patungo sa mga producing well. Ang isang epektibong waterflood design ay nangangailangan ng: favorable mobility ratio (M ≤ 1), magandang geometry ng well pattern para ma-maximize ang areal sweep, layer-by-layer na permeability data para sa vertical sweep analysis, at maingat na pamamahala ng mga injection rate para kontrolin ang advancement ng flood-front.",
        ],
        subsections: [
          {
            id: "sec-7-5-a",
            title: "Mga Prinsipyo ng Disenyo ng Water Flooding",
            content: [],
            list: [
              {
                term: "Five-Spot Pattern",
                description:
                  "Isang injector na napapalibutan ng apat na producer sa pantay na espasyo. Ang pinakakaraniwang well pattern, na nagbibigay ng katamtamang areal sweep efficiency. Ang mga line drive at inverted nine-spot pattern ay ginagamit sa iba't ibang geometry ng reservoir.",
              },
              {
                term: "Kontrol ng Mobility Ratio",
                description:
                  "Kapag ang M > 1 (heavy oil o mababang k_rw endpoint), ang polymer flooding ay ginagamit para mapataas ang water viscosity, na nagbabawas ng M patungo sa unity. Dramatikong nagpapabuti ito ng sweep efficiency at nagpapabagal ng water breakthrough.",
              },
              {
                term: "Pamamahala ng Injection Rate",
                description:
                  "Ang injection rate ay dapat ibalanse laban sa production rate para mapanatili ang target na reservoir pressure. Ang over-injection ay nagdudulot ng fracturing at channeling; ang under-injection ay nabibigo sa pagpapanatili ng pressure support.",
              },
            ],
          },
          {
            id: "sec-7-5-b",
            title: "Gas Injection",
            content: [
              "Ang gas injection (GI) ay ginagamit para sa pressure maintenance (lalo na sa mga gas condensate reservoir para maiwasan ang retrograde condensation), gravity drainage enhancement, at miscible flooding para mabawasan ang residual oil saturation. Ang miscible gas injection ay nakakamit ng halos zero interfacial tension sa pagitan ng injected gas at reservoir oil, na inuubos ang capillary trapping at dramatikong nagpapabuti ng displacement efficiency.",
              "Ang gas channeling — preferential na daloy ng injected gas sa mga high-permeability streak — ang pangunahing problema sa gas injection. Nagbabawas ito ng areal sweep efficiency at nagdudulot ng maagang gas breakthrough sa mga producing well.",
            ],
          },
        ],
      },
      {
        id: "sec-7-6",
        title: "Mga Pamamaraan ng Enhanced Oil Recovery (EOR)",
        content: [
          "Ang mga pamamaraan ng Enhanced Oil Recovery (EOR) ay naglalayong makuha ang langis na hindi kayang mobilisahin ng conventional primary at secondary recovery — partikular ang residual oil na nakulong sa mga pore space ng capillary forces (Sor). Tinutugunan ng mga EOR technique ito sa pamamagitan ng pagbabago ng mga katangian ng fluid, wettability, o displacement mechanism na higit pa sa magagawa ng simpleng water o gas injection.",
        ],
        subsections: [
          {
            id: "sec-7-6-a",
            title: "Mga Kategorya ng EOR at Mga Pangunahing Teknik",
            content: [],
            list: [
              {
                term: "Chemical EOR (Polymer, Surfactant, Alkali)",
                description:
                  "Ang polymer flooding ay nagpapalaki ng water viscosity para mapabuti ang mobility ratio. Ang surfactant flooding ay nagbabawas ng interfacial tension para ma-mobilize ang mga nakulong na oil ganglia. Ang alkaline flooding ay nakikipag-react sa acidic crude oil para lumikha ng surfactant in situ.",
              },
              {
                term: "WAG (Water Alternating Gas)",
                description:
                  "Alternating na cycle ng water injection at gas injection. Ang mga water slug ay nagpapabuti ng sweep efficiency sa pamamagitan ng pagbabawas ng mataas na mobility ng gas; ang mga gas slug ay nagpapabuti ng displacement efficiency. Ang WAG ay malawakang inilalapat sa parehong offshore at onshore field.",
              },
              {
                term: "FAWAG (Foam Assisted WAG)",
                description:
                  "Isang advanced na variant ng WAG kung saan ang foam ay nabubuo sa injection front sa pamamagitan ng pakikipagreact ng surfactant sa injected gas. Ang foam ay may mas mababang mobility kaysa sa free gas, dramatikong nagbabawas ng gas channeling at nagpapabuti ng conformance sa mga heterogeneous reservoir.",
              },
              {
                term: "Thermal EOR (Steam, SAGD, In-Situ Combustion)",
                description:
                  "Ang init ay nagbabawas ng oil viscosity, minsan ng ilang order ng magnitude. Ang steam injection at Steam-Assisted Gravity Drainage (SAGD) ay malawakang inilalapat sa mga heavy oil at bitumen reservoir. Ang in-situ combustion ay nagsusunog ng isang bahagi ng langis in place para makabuo ng init.",
              },
            ],
          },
        ],
      },
      {
        id: "sec-7-7",
        title: "Pagmamanman ng Performance ng Reservoir at Material Balance",
        content: [
          "Ang pagmamanman ng performance ng reservoir sa buong buhay ng field ay mahalaga para maagang matukoy ang mga problema, ma-validate ang mga hula ng produksyon, at ma-optimize ang pamamahala ng field. Ang mga pangunahing performance indicator ay kinabibilangan ng reservoir pressure, producing GOR, water cut, at mga trend ng production rate.",
        ],
        subsections: [
          {
            id: "sec-7-7-a",
            title: "Mga Pangunahing Performance Indicator",
            content: [],
            list: [
              {
                term: "Reservoir Pressure (average static pressure)",
                description:
                  "Mino-monitor sa pamamagitan ng pana-panahong well shut-in pressure buildup (DST, RFT/MDT). Ang rate ng pagbaba ng pressure ang pangunahing tagapagpahiwatig ng pagkaubos ng enerhiya ng reservoir. Ang mga biglang pagbabago ng pressure ay maaaring magpahiwatig ng komunikasyon sa pagitan ng mga zone ng reservoir.",
              },
              {
                term: "Gas-Oil Ratio (GOR)",
                description:
                  "Ang pagtaas ng GOR sa itaas ng solution GOR ay nagpapahiwatig na ang free gas ay dumadaling, na nagpapatanda na ang pressure ay bumaba sa ibaba ng bubble point at/o nagkaroon ng gas cap breakthrough. Ang trend ng GOR ang pinaka-sensitive na tagapagpahiwatig ng gawi ng drive mechanism.",
              },
              {
                term: "Water Cut (WC)",
                description:
                  "Ang bahagi ng produced liquid na tubig. Ang tumataas na water cut ay nagpapahiwatig ng aquifer influx o breakthrough ng injected water. Ang pamamahala ng water cut ay sentral sa ekonomika ng produksyon ng mature field.",
              },
            ],
          },
          {
            id: "sec-7-7-b",
            title: "Material Balance — Ang Reservoir Equation",
            content: [
              "Ang material balance equation (MBE) ay ang pinaka-makapangyarihang klasikal na tool para sa reservoir analysis. Sinasabi nito na ang cumulative production ay katumbas ng kabuuan ng pagpapalawak ng lahat ng fluid at bato sa reservoir: pagpapalawak ng undersaturated oil + gas cap gas + connate water + rock compressibility + water influx = cumulative oil, gas, at water production.",
              "Ang MBE ay nagpapahintulot ng independyenteng pagtatantya ng STOIIP nang hindi umaaasa sa volumetrics, pagtukoy ng dominanteng drive mechanism, pagtukoy ng lakas ng aquifer, at paghula ng hinaharap na pressure at performance ng produksyon. Ang history-matching ng MBE sa aktwal na production data ay isa sa pinaka-pundamental na gawain ng reservoir engineering.",
            ],
          },
        ],
        noteBox: {
          title: "Buod ng Recovery Factor ayon sa Drive Mechanism",
          items: [
            "Solution Gas Drive: 5–30% ng STOIIP — mabilis na pagbaba ng pressure, tumataas na GOR",
            "Gas Cap Drive: 20–40% ng STOIIP — mas mahusay na pagpapanatili ng pressure, naantalang pagtaas ng GOR",
            "Water Drive: 35–75% ng STOIIP — mahusay na pressure maintenance, tumataas na water cut",
            "Compaction/Expansion Drive: 1–5% ng STOIIP — mahinang enerhiya, maliit na recovery",
            "Secondary Recovery (Waterflood): Karagdagang 15–25% — nakasalalay sa sweep efficiency",
            "Mga Pamamaraan ng EOR: Karagdagang 5–15% — target ang residual oil pagkatapos ng conventional methods",
          ],
        },
      },
    ],
    formulas: [
      {
        name: "STOIIP (Volumetric)",
        eq: "N = 7758 × A × h × φ × (1 − Sw) / Boi",
        desc: "A = lugar (acres), h = net pay thickness (ft), φ = porosity, Sw = paunang water saturation, Boi = paunang oil FVF (res bbl/STB).",
      },
      {
        name: "Recovery Factor",
        eq: "RF = Np / N",
        desc: "Np = cumulative oil produced (STB), N = STOIIP (STB). Ang RF ay nakasalalay sa drive mechanism, kalidad ng bato, at strategy ng pag-unlad.",
      },
      {
        name: "Material Balance (Pinasimpleng Oil Reservoir)",
        eq: "Np × Bo ≈ N × (Bo − Boi) + N × Boi × cf × ΔP + We",
        desc: "Kaliwang panig = cumulative production; kanang panig = oil expansion + rock/water expansion + water influx (We). Ginagamit para matukoy ang mga drive mechanism.",
      },
      {
        name: "Gas Cap Expansion Drive",
        eq: "We + N × m × Bgi × (Bg/Bgi − 1) = Np × Bo",
        desc: "m = ratio ng volume ng gas cap sa volume ng oil zone (sa paunang kondisyon). Ang gas cap drive ay nagdadagdag sa pagpapalawak ng oil zone.",
      },
      {
        name: "Productivity Index",
        eq: "PI = q / (P_r − P_wf)",
        desc: "PI (bbl/day/psi) = production rate / pressure drawdown. Pinagsasama ang reservoir permeability, kapal, at fluid mobility sa isang sukat ng deliverability.",
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
    title: CHAPTER_TITLES[id] || `Kabanata ${id}`,
    overview: "Naglo-load ang nilalaman...",
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
            Video na Kagamitan
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
            title: "Natapos ang Kabanata!",
            description: "Nai-save na ang iyong progreso.",
          });
        }
      },
    },
  });

  const createBookmark = useCreateBookmark({
    mutation: {
      onSuccess: () => {
        toast({ title: "Idinagdag ang Bookmark", description: "Nai-save ang seksyon sa iyong mga bookmark." });
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
              <h3 className="font-serif font-bold text-lg mb-4 text-primary">Mga Kabanata</h3>
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
                    <span className="text-xs opacity-60 mr-1">Kab {num}</span> {CHAPTER_TITLES[num]}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Pangunahing Nilalaman */}
          <article className="flex-1 max-w-4xl mx-auto lg:mx-0 min-w-0">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 text-primary mb-3 font-medium uppercase tracking-widest text-sm">
                <span>Kabanata {chapterId}</span>
                {progress?.completed && (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded-full text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Natapos Na
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

            {/* Pangunahing Lecture Video Placeholder */}
            <Card className="mb-10 bg-slate-900 border-slate-800 overflow-hidden relative group cursor-pointer aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-900/20 opacity-80 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col items-center gap-4 text-white p-6 text-center transform group-hover:scale-105 transition-transform duration-500">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                  <PlayCircle className="h-12 w-12 text-white group-hover:text-amber-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-xl font-serif">Lecture Video</h3>
                  <p className="text-sm text-slate-300">
                    Kabanata {chapterId} — {chapterData.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Malapit nang makuha ang video</p>
                </div>
              </div>
            </Card>

            {/* Mga Seksyon ng Kabanata */}
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
                      title="I-bookmark ang seksyong ito"
                      data-testid={`button-bookmark-${section.id}`}
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mga Talata ng Nilalaman ng Seksyon */}
                  {section.content.length > 0 && (
                    <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-p:leading-relaxed text-muted-foreground mb-6">
                      {section.content.map((paragraph, idx) => (
                        <p key={idx}>{renderTextWithGlossary(paragraph)}</p>
                      ))}
                    </div>
                  )}

                  {/* Note Box ng Seksyon */}
                  {section.noteBox && (
                    <NoteBox title={section.noteBox.title} items={section.noteBox.items} />
                  )}

                  {/* Mga Subseksyon */}
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

                          {/* Listahan ng Kahulugan */}
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

                          {/* Note Box ng Subseksyon */}
                          {sub.noteBox && (
                            <NoteBox title={sub.noteBox.title} items={sub.noteBox.items} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Video Placeholder (para sa Kab 4 at 5) */}
                  {section.videoAfter && (
                    <VideoCard
                      label={section.videoAfter.label}
                      description={section.videoAfter.description}
                    />
                  )}
                </section>
              ))}
            </div>

            {/* Mga Pangunahing Formula */}
            {chapterData.formulas.length > 0 && (
              <div className="my-12 p-8 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-md">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Mga Pangunahing Formula</h3>
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

            {/* Mga Pangunahing Termino */}
            <div className="my-12 p-8 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-serif font-bold text-primary">Mga Pangunahing Termino</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Mag-hover sa mga naka-highlight na termino sa teksto sa itaas para makita ang mga kahulugan, o suriin ang mga ito dito.
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

            {/* Mga Aksyon para sa Pagkumpleto */}
            <Separator className="my-12" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 p-6 md:p-8 bg-card border border-border rounded-xl shadow-sm text-center sm:text-left">
              <div>
                <h3 className="font-bold text-lg mb-1">Natapos na ang pagbabasa?</h3>
                <p className="text-sm text-muted-foreground">
                  Markahan ang kabanatang ito bilang natapos para ma-track ang iyong progreso.
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
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Natapos Na
                  </>
                ) : (
                  "Markahan bilang Natapos"
                )}
              </Button>
            </div>

            {/* Quiz Preview */}
            <Card className="mb-12 border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">Subukan ang Iyong Kaalaman</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Kumuha ng quiz para kumpirmahin ang iyong pag-unawa sa {chapterData.title}.
                </p>
                <Button size="lg" asChild className="px-8" data-testid="button-start-quiz">
                  <Link href={`/quiz/${chapterId}`}>
                    Simulan ang Quiz ng Kabanata <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Nabigasyon ng Kabanata */}
            <div className="flex justify-between items-center py-6 border-t border-border">
              {chapterId > 1 ? (
                <Link href={`/chapter/${chapterId - 1}`}>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-prev-chapter"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Nakaraang Kabanata
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
                    Susunod na Kabanata <ChevronRight className="ml-2 h-4 w-4" />
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
