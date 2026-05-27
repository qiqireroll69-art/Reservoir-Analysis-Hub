import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Target, Award } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-slate-900 text-white py-16 md:py-24 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              Tungkol sa PetroLearn
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Pinagsasama ang akademikong teorya at praktikal na aplikasyon sa industriya ng reservoir petrophysics at hydrocarbon phase analysis.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-serif">
          <h2>Ang Aming Misyon</h2>
          <p>
            Ang PetroLearn ay binuo upang magbigay sa mga estudyante ng petroleum engineering at mga baguhang propesyonal ng isang mahigpit, accessible, at magandang dinisenyo na platform para sa pag-aralan ng petrophysics. Naniniwala kami na ang mga kumplikadong prinsipyo ng engineering ay hindi nangangailangan ng lumang at mahirap gamitin na software.
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-12 not-prose">
            <div className="bg-card p-6 rounded-xl border border-border">
              <BookOpen className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Mataas na Kalidad ng Nilalaman</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Materyal na antas-unibersidad na sumasaklaw sa mga pangunahing prinsipyo ng petrophysics at thermodynamic phase behavior.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <Target className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Nakatuong Pag-aaral</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Kapaligiran na walang abala para sa malalim na pagbabasa, pagpapanatili ng kaalaman, at mabilis na sanggunian.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Pagtatasa sa Sarili</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Mga integrated na quiz at pagsubaybay ng progreso upang matiyak ang ganap na pag-unawa bago sumulong.</p>
            </div>
          </div>

          <h2>Mga Layunin ng Kurso</h2>
          <p>Sa pagtatapos ng 7-kabanatang kurikulumna ito, ang mga mag-aaral ay magiging kayang:</p>
          <ul>
            <li>Maunawaan at makalkula ang mga pangunahing katangian ng bato kasama na ang porosity, permeability, at compressibility.</li>
            <li>Suriin ang multiphase fluid distribution sa porous media gamit ang mga konsepto ng capillary pressure.</li>
            <li>Mag-interpret ng mga pangunahing open-hole well logs upang makuha ang mga petrophysical parameters.</li>
            <li>Hulaan ang hydrocarbon phase behavior sa iba't ibang kondisyon ng pressure at temperatura ng reservoir.</li>
            <li>Pagsamahin ang data ng bato at fluid para matantya ang mga hydrocarbon na nakaimbak at masuri ang mga mekanismo ng recovery.</li>
          </ul>

          <div className="bg-primary/5 border border-primary/20 p-8 rounded-xl mt-12 text-center not-prose">
            <h3 className="font-serif font-bold text-2xl mb-4">Handa na bang magsimula?</h3>
            <p className="text-muted-foreground mb-6">Simulan ang iyong paglalakbay sa reservoir petrophysics ngayon.</p>
            <Button size="lg" asChild>
              <Link href="/chapters">Tingnan ang Kurikulum <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
