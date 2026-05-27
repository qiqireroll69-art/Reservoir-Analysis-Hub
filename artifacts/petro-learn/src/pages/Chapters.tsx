import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useGetAllProgress, useGetProgressSummary } from "@workspace/api-client-react";
import { CheckCircle2, ArrowRight, BookOpen, Clock, Activity, Target, BrainCircuit, FlaskConical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const CHAPTERS_META = [
  { id: 1, title: "Panimula sa Reservoir Petrophysics", icon: BookOpen },
  { id: 2, title: "Mga Pangunahing Kaalaman sa Reservoir Petrophysics", icon: Target },
  { id: 3, title: "Fluid Saturation, Wettability, at Capillary Pressure", icon: Activity },
  { id: 4, title: "Interpretasyon ng Well Logs", icon: BrainCircuit },
  { id: 5, title: "Mga PVT Properties at Phase Behavior ng Hydrocarbon", icon: FlaskConical },
  { id: 6, title: "Integrasyon ng Petrophysics at Phase Behavior", icon: Target },
  { id: 7, title: "Aplikasyon sa Reservoir Engineering", icon: BookOpen }
];

export default function Chapters() {
  const { data: summary, isLoading: isLoadingSummary } = useGetProgressSummary();
  const { data: progressList, isLoading: isLoadingProgress } = useGetAllProgress();

  return (
    <Layout>
      <div className="bg-slate-900 dark:bg-slate-950 text-white py-16 md:py-20 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Nilalaman ng Kurso</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Mag-navigate sa komprehensibong kurikulum. Ang pag-aralan ang mga kabanatang ito ay magbibigay sa iyo ng malalim na pag-unawa sa mga katangian ng bato at fluid phase behavior.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Listahan ng Kabanata */}
          <div className="flex-1">
            <div className="space-y-6">
              {CHAPTERS_META.map((chapter) => {
                const progress = progressList?.find(p => p.chapterId === chapter.id);
                const isCompleted = progress?.completed;
                const Icon = chapter.icon;

                return (
                  <Card key={chapter.id} className="overflow-hidden hover-elevate transition-all border-border bg-card group flex flex-col md:flex-row">
                    <div className="w-2 md:w-3 bg-slate-100 dark:bg-slate-800 group-hover:bg-primary transition-colors shrink-0"></div>
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium tracking-widest uppercase">
                            <span className="text-primary font-bold">Kabanata {chapter.id}</span>
                            {isCompleted && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full text-xs normal-case tracking-normal">
                                <CheckCircle2 className="h-3 w-3" /> Natapos Na
                              </span>
                            )}
                          </div>
                          <div className="p-2 bg-primary/10 text-primary rounded-md hidden md:block">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                          <Link href={`/chapter/${chapter.id}`}>
                            {chapter.title}
                          </Link>
                        </h2>
                        {progress?.lastVisited && !isCompleted && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                            <Clock className="h-4 w-4" /> Huling binisita {new Date(progress.lastVisited).toLocaleDateString('fil-PH')}
                          </p>
                        )}
                        {progress?.quizBestScore !== null && progress?.quizBestScore !== undefined && (
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 mb-4">
                            Pinakamataas na Quiz Score: {progress.quizBestScore}%
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/50">
                        <Link href={`/chapter/${chapter.id}`} className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                          {isCompleted ? "Suriin ang Aralin" : "Ipagpatuloy ang Pagbabasa"} <ArrowRight className="h-4 w-4" />
                        </Link>
                        <span className="text-muted-foreground">|</span>
                        <Link href={`/quiz/${chapter.id}`} className="text-muted-foreground hover:text-primary font-medium transition-colors">
                          Kumuha ng Quiz
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Buod ng Progreso */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Kabuuang Progreso</CardTitle>
                  <CardDescription>Iyong paglalakbay sa kurso</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSummary ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : summary ? (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-medium">Pagkumpleto</span>
                          <span className="text-xl font-bold text-primary">{Math.round(summary.percentComplete)}%</span>
                        </div>
                        <Progress value={summary.percentComplete} className="h-2.5" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mga Kabanata</p>
                          <p className="text-2xl font-bold font-serif">{summary.completedChapters} <span className="text-sm text-muted-foreground font-sans font-normal">/ {summary.totalChapters}</span></p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Hindi ma-load ang buod ng progreso.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-slate-800">
                <CardHeader>
                  <CardTitle className="font-serif text-amber-500">Kailangan ng mabilis na review?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-300">
                  <p>I-access ang aming komprehensibong study materials para makatulong sa inyong paghahanda sa eksamen.</p>
                  <div className="flex flex-col gap-2">
                    <Link href="/formulas" className="text-white hover:text-amber-500 transition-colors flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Sheet ng mga Formula
                    </Link>
                    <Link href="/glossary" className="text-white hover:text-amber-500 transition-colors flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Talasalitaan
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
