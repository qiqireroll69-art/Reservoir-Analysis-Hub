import { Link } from "wouter";
import { BookOpen, Target, BrainCircuit, ArrowRight, Activity, FlaskConical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/layout/Layout";
import { useGetProgressSummary } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const CHAPTERS = [
  {
    id: 1,
    title: "Panimula sa Reservoir Petrophysics",
    description: "Mga pangunahing konsepto, rock cycle, at ang mahalagang papel ng petrophysics sa pagsusuri ng reservoir.",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Mga Pangunahing Kaalaman sa Reservoir Petrophysics",
    description: "Porosity, permeability, at ang kanilang pagsukat. Pag-unawa sa Darcy's Law at rock texture.",
    icon: Target,
  },
  {
    id: 3,
    title: "Fluid Saturation, Wettability, at Capillary Pressure",
    description: "Multiphase flow sa porous media, contact angles, at pisika ng distribusyon ng fluid.",
    icon: Activity,
  },
  {
    id: 4,
    title: "Interpretasyon ng Well Logs",
    description: "Gamma ray, resistivity, density, at neutron logs. Pag-ugnay ng log signatures sa mga katangian ng bato.",
    icon: BrainCircuit,
  },
  {
    id: 5,
    title: "Mga PVT Properties at Phase Behavior ng Hydrocarbon",
    description: "Relasyon ng Pressure-Volume-Temperature, phase envelopes, at fluid sampling.",
    icon: FlaskConical,
  },
  {
    id: 6,
    title: "Integrasyon ng Petrophysics at Phase Behavior",
    description: "Pagsasama ng mga katangian ng bato at fluid para sa komprehensibong reservoir modeling.",
    icon: Target,
  },
  {
    id: 7,
    title: "Aplikasyon sa Reservoir Engineering",
    description: "Volumetrics, decline curve analysis, at mga equation ng material balance.",
    icon: BookOpen,
  }
];

export default function Home() {
  const { data: summary, isLoading } = useGetProgressSummary();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 text-white">
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/40 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 text-sm font-medium mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
            Komprehensibong Kurikulum sa Petroleum Engineering
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-tight mb-6 animate-in slide-in-from-bottom-6 duration-700">
            Araling-aral ang Reservoir Petrophysics at Phase Analysis
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed animate-in slide-in-from-bottom-8 duration-1000">
            Isang tumpak at komprehensibong learning platform para sa mga estudyante ng engineering. Pag-aralan ang mga katangian ng bato, fluid saturation, well logging, at PVT behavior.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-1000 delay-300">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-base h-12 px-8" asChild>
              <Link href="/chapters">
                Simulan ang Pag-aaral <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-8 bg-slate-800/50 backdrop-blur-sm" asChild>
              <Link href="/formulas">
                Tingnan ang Sheet ng mga Formula
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 border-b border-border bg-card/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : summary ? (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover-elevate transition-all">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-lg font-bold font-serif mb-1">Progreso Mo sa Kurso</h2>
                    <p className="text-sm text-muted-foreground">
                      {summary.completedChapters} sa {summary.totalChapters} na kabanata ang natapos
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{Math.round(summary.percentComplete)}%</span>
                </div>
                <Progress value={summary.percentComplete} className="h-3" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4 text-foreground">Nilalaman ng Kurso</h2>
            <p className="text-muted-foreground text-lg">Nakaayos nang maayos mula sa mga pangunahing katangian ng bato hanggang sa mga advanced na aplikasyon ng reservoir engineering.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {CHAPTERS.map((chapter, index) => {
              const Icon = chapter.icon;
              const isCompleted = summary?.chaptersProgress?.find(p => p.chapterId === chapter.id)?.completed;
              
              return (
                <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
                  <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer group bg-card border-border overflow-hidden">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 transition-colors"></div>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-4xl font-serif font-bold text-muted/30 group-hover:text-primary/20 transition-colors">
                          0{chapter.id}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-serif leading-tight group-hover:text-primary transition-colors flex items-start gap-2">
                        {chapter.title}
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 text-muted-foreground text-sm leading-relaxed">
                      {chapter.description}
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/50">
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        {isCompleted ? "Suriin ang Kabanata" : "Simulan ang Kabanata"} <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
