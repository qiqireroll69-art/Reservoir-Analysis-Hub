import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sigma } from "lucide-react";

const FORMULA_CATEGORIES = [
  {
    category: "Volumetrics",
    description: "Mga kalkulasyon para sa pagtatantya ng mga hydrocarbon na nakaimbak sa reservoir.",
    formulas: [
      { name: "Original Oil in Place (OOIP)", eq: "N = 7758 * A * h * φ * (1 - Sw) / Bo", desc: "Kinakalkula ang stock tank barrels ng langis na nakaimbak. A = Lugar (acres), h = kapal (ft), φ = porosity, Sw = water saturation, Bo = formation volume factor (rb/stb)." },
      { name: "Original Gas in Place (OGIP)", eq: "G = 43560 * A * h * φ * (1 - Sw) / Bg", desc: "Kinakalkula ang standard cubic feet ng gas na nakaimbak. Bg = gas formation volume factor (rcf/scf)." }
    ]
  },
  {
    category: "Mga Pangunahing Katangian ng Bato",
    description: "Mga pangunahing relasyon sa petrophysics.",
    formulas: [
      { name: "Kabuuang Porosity", eq: "φ = Vp / Vb = (Vb - Vg) / Vb", desc: "Ratio ng pore volume (Vp) sa bulk volume (Vb). Ang Vg ay ang grain volume." },
      { name: "Darcy's Law (Linear Flow)", eq: "q = - (k * A / μ) * (dP / dx)", desc: "q = flow rate, k = permeability, A = cross-sectional area, μ = viscosity, dP/dx = pressure gradient." },
      { name: "Isothermal Compressibility", eq: "c = -(1/V) * (dV / dp)T", desc: "Bahagyang pagbabago ng volume sa bawat unit na pagbabago ng pressure sa pare-parehong temperatura." }
    ]
  },
  {
    category: "Capillary Pressure at Distribusyon ng Fluid",
    description: "Mga equation na namamahala sa mga interface ng fluid sa porous media.",
    formulas: [
      { name: "Capillary Pressure (Pangkalahatan)", eq: "Pc = Pnw - Pw", desc: "Pagkakaiba ng pressure sa pagitan ng non-wetting (Pnw) at wetting (Pw) na mga phase." },
      { name: "Laplace Equation", eq: "Pc = (2 * σ * cos θ) / r", desc: "σ = interfacial tension, θ = contact angle, r = capillary radius." },
      { name: "Free Water Level hanggang Pc", eq: "Pc = (ρw - ρnw) * g * h", desc: "Iniuugnay ang capillary pressure sa taas (h) sa itaas ng free water level at pagkakaiba ng density." }
    ]
  },
  {
    category: "Interpretasyon ng Well Log",
    description: "Mga pamantayang equation para sa pag-interpret ng open-hole logs.",
    formulas: [
      { name: "Archie's Equation (Water Saturation)", eq: "Sw^n = (a * Rw) / (φ^m * Rt)", desc: "Sw = water saturation, a = tortuosity factor, m = cementation exponent, n = saturation exponent, Rw = formation water resistivity, Rt = true formation resistivity." },
      { name: "Formation Factor (F)", eq: "F = a / φ^m = Ro / Rw", desc: "Ratio ng resistivity ng 100% water saturated rock (Ro) sa water resistivity (Rw)." },
      { name: "Volume ng Shale (Gamma Ray)", eq: "Vsh = (GRlog - GRmin) / (GRmax - GRmin)", desc: "Linear na kalkulasyon ng shale volume mula sa Gamma Ray log." },
      { name: "Density Porosity", eq: "φd = (ρma - ρb) / (ρma - ρfl)", desc: "ρma = matrix density, ρb = bulk density log reading, ρfl = fluid density." }
    ]
  }
];

export default function Formulas() {
  return (
    <Layout>
      <div className="bg-slate-900 dark:bg-slate-950 text-white py-16 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 flex items-center gap-3">
              <Sigma className="h-10 w-10 text-amber-500" />
              Sheet ng mga Formula
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Mabilis na sanggunian para sa mahahalagang equation sa petrophysics at reservoir engineering.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {FORMULA_CATEGORIES.map((category, index) => (
            <section key={index}>
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{category.category}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid gap-6">
                {category.formulas.map((formula, fIdx) => (
                  <Card key={fIdx} className="border border-border bg-card overflow-hidden">
                    <div className="h-1 w-full bg-primary/20"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium">{formula.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 p-4 rounded-md font-mono text-xl text-primary font-bold overflow-x-auto text-center my-2 border border-border/50 shadow-inner">
                        {formula.eq}
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                        {formula.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
