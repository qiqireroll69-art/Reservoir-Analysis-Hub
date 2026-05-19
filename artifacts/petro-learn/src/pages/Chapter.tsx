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
  getGetProgressSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, BookmarkPlus, ChevronLeft, ChevronRight, PlayCircle, BookOpen, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Hardcoded chapter content based on petroleum engineering principles
const CHAPTER_CONTENT: Record<number, any> = {
  1: {
    title: "Introduction to Reservoir Petrophysics",
    sections: [
      {
        id: "sec-1-1",
        title: "The Role of Petrophysics",
        content: [
          "Petrophysics is the study of physical and chemical rock properties and their interactions with fluids. In the context of reservoir engineering, it provides the foundational data required to evaluate the economic viability of a hydrocarbon accumulation. The discipline bridges geology, which describes the depositional environment, and reservoir engineering, which predicts fluid flow and recovery.",
          "A petrophysicist must integrate diverse data sources, from pore-scale core analysis to well logs and field-wide seismic data. The primary objective is to determine hydrocarbon-in-place and understand the flow characteristics of the reservoir rock."
        ]
      },
      {
        id: "sec-1-2",
        title: "The Rock Cycle and Reservoir Rocks",
        content: [
          "The majority of hydrocarbon reservoirs are found in sedimentary rocks, primarily sandstones and carbonates. The depositional environment and subsequent diagenetic processes (compaction, cementation, dissolution) dictate the ultimate petrophysical properties of the rock.",
          "Sandstones typically exhibit primary intergranular porosity, meaning the pore space was formed at the time of deposition. Their properties are strongly influenced by sorting, grain size, and clay content. Carbonates (limestones and dolomites), on the other hand, often possess secondary porosity created through diagenesis, leading to complex, heterogeneous pore networks including vugs and fractures."
        ]
      },
      {
        id: "sec-1-3",
        title: "Key Petrophysical Parameters",
        content: [
          "The fundamental triad of petrophysics consists of porosity (fluid storage capacity), permeability (fluid flow capacity), and water saturation (fraction of pore space occupied by formation water). Together, these parameters allow us to calculate the volume of hydrocarbons and predict their ability to be produced.",
          "Additional properties, such as wettability, capillary pressure, and relative permeability, govern the distribution of fluids within the pore space and dictate the efficiency of secondary and tertiary recovery methods."
        ]
      }
    ],
    formulas: [
      { name: "Original Oil in Place (OOIP)", eq: "N = 7758 * A * h * φ * (1 - Sw) / Bo", desc: "Volumetric calculation of initial oil." },
      { name: "Original Gas in Place (OGIP)", eq: "G = 43560 * A * h * φ * (1 - Sw) / Bg", desc: "Volumetric calculation of initial gas." }
    ],
    terms: ["Petrophysics", "Porosity", "Permeability", "Diagenesis"]
  },
  2: {
    title: "Fundamentals of Reservoir Petrophysics",
    sections: [
      {
        id: "sec-2-1",
        title: "Porosity (φ)",
        content: [
          "Porosity is defined as the ratio of void space to the bulk volume of the rock. It represents the storage capacity of the reservoir. Absolute (or total) porosity includes all void space regardless of connectivity, whereas effective porosity only includes interconnected pores that can contribute to fluid flow.",
          "In reservoir calculations, effective porosity is the critical parameter. Typical sandstone porosities range from 10% to 30%, while carbonate porosities can be highly variable, sometimes falling below 5% but still being productive due to fracture networks."
        ]
      },
      {
        id: "sec-2-2",
        title: "Permeability (k) and Darcy's Law",
        content: [
          "Permeability is a measure of the rock's ability to transmit fluids. It is defined mathematically by Darcy's Law, which states that the flow rate (q) of a fluid is directly proportional to the permeability (k) and the pressure gradient (ΔP/L), and inversely proportional to the fluid viscosity (μ).",
          "Absolute permeability assumes the rock is 100% saturated with a single fluid. In petroleum reservoirs, multiple fluids (oil, water, gas) are present, necessitating the use of effective and relative permeability concepts. Permeability is highly sensitive to the size of the pore throats connecting the larger pore bodies."
        ]
      },
      {
        id: "sec-2-3",
        title: "Rock Compressibility",
        content: [
          "As reservoir pressure declines during production, the effective stress on the rock matrix increases. This causes a slight reduction in bulk volume and pore volume, a phenomenon known as pore volume compressibility. While small, this compaction provides a drive mechanism for fluid production, particularly in under-saturated volumetric reservoirs.",
          "Failure to account for rock compressibility can lead to underestimating reserves and potential issues with surface subsidence in highly compressible formations like unconsolidated sands or chalks."
        ]
      }
    ],
    formulas: [
      { name: "Porosity", eq: "φ = Vp / Vb = (Vb - Vg) / Vb", desc: "Ratio of pore volume to bulk volume." },
      { name: "Darcy's Law (Linear Flow)", eq: "q = - (k * A / μ) * (dP / dx)", desc: "Fundamental equation for fluid flow in porous media." },
      { name: "Isothermal Compressibility", eq: "c = -(1/V) * (dV / dp)T", desc: "Fractional change in volume per unit change in pressure." }
    ],
    terms: ["Effective Porosity", "Absolute Permeability", "Darcy's Law", "Compressibility"]
  }
};

// Fallback content for chapters not explicitly defined above
const getChapterData = (id: number) => {
  if (CHAPTER_CONTENT[id]) return CHAPTER_CONTENT[id];
  return {
    title: `Chapter ${id} Content`,
    sections: [
      {
        id: `sec-${id}-1`,
        title: "Core Concepts",
        content: ["This is a placeholder for chapter content. In a complete application, this would contain the detailed educational text for this section of reservoir petrophysics.", "The text would cover theoretical principles, practical applications, and examples relevant to the petroleum industry."]
      },
      {
        id: `sec-${id}-2`,
        title: "Advanced Applications",
        content: ["Detailed discussion of the mathematical models and empirical correlations used to analyze this aspect of petrophysics.", "Integration with other data sources to build a comprehensive reservoir model."]
      }
    ],
    formulas: [
      { name: "Placeholder Equation", eq: "y = mx + b", desc: "Linear relationship placeholder." }
    ],
    terms: ["Concept A", "Concept B"]
  };
};

export default function Chapter() {
  const { id } = useParams();
  const chapterId = parseInt(id || "1", 10);
  const chapterData = getChapterData(chapterId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: isLoadingProgress } = useGetChapterProgress(chapterId, {
    query: {
      enabled: !!chapterId,
      queryKey: getGetChapterProgressQueryKey(chapterId)
    }
  });

  const { data: glossary } = useGetGlossaryTerms({ chapterId }, {
    query: {
      enabled: !!chapterId
    }
  });

  const updateProgress = useUpdateChapterProgress({
    mutation: {
      onSuccess: (data) => {
        // Optimistically update the specific chapter cache
        queryClient.setQueryData(getGetChapterProgressQueryKey(chapterId), data);
        // Invalidate global progress to update nav/home progress bars
        queryClient.invalidateQueries({ queryKey: getGetAllProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProgressSummaryQueryKey() });
        
        if (data.completed) {
          toast({
            title: "Chapter Completed!",
            description: "Your progress has been saved.",
            variant: "default",
          });
        }
      }
    }
  });

  const createBookmark = useCreateBookmark({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Bookmark Added",
          description: "This section has been saved to your bookmarks.",
        });
      }
    }
  });

  const handleMarkComplete = () => {
    updateProgress.mutate({
      chapterId,
      data: {
        completed: !progress?.completed
      }
    });
  };

  const handleAddBookmark = (sectionId: string, sectionTitle: string) => {
    createBookmark.mutate({
      data: {
        chapterId,
        sectionId,
        title: sectionTitle,
        note: null
      }
    });
  };

  // Helper to render text with tooltips for glossary terms
  const renderTextWithGlossary = (text: string) => {
    if (!glossary || glossary.length === 0) return text;

    let elements: (string | React.ReactNode)[] = [text];
    
    // Sort by term length descending so we match longer phrases first (e.g. "Effective Porosity" before "Porosity")
    const terms = [...glossary].sort((a, b) => b.term.length - a.term.length);

    terms.forEach(termObj => {
      const newElements: (string | React.ReactNode)[] = [];
      const regex = new RegExp(`\\b(${termObj.term})\\b`, 'gi');
      
      elements.forEach(element => {
        if (typeof element === 'string') {
          const parts = element.split(regex);
          parts.forEach(part => {
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
                {[1, 2, 3, 4, 5, 6, 7].map((id) => (
                  <Link 
                    key={id} 
                    href={`/chapter/${id}`}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      chapterId === id 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Chapter {id}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <article className="flex-1 max-w-4xl mx-auto lg:mx-0 min-w-0">
            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 text-primary mb-3 font-medium uppercase tracking-widest text-sm">
                <span>Chapter {chapterId}</span>
                {progress?.completed && (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight mb-6">
                {chapterData.title}
              </h1>
            </header>

            {/* Video Placeholder */}
            <Card className="mb-12 bg-slate-900 border-slate-800 overflow-hidden relative group cursor-pointer aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-900/20 opacity-80 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col items-center gap-4 text-white p-6 text-center transform group-hover:scale-105 transition-transform duration-500">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                  <PlayCircle className="h-12 w-12 text-white group-hover:text-amber-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-xl font-serif">Lecture Video</h3>
                  <p className="text-sm text-slate-300">Watch the professor's introduction to this topic</p>
                </div>
              </div>
            </Card>

            {/* Text Content Sections */}
            <div className="space-y-12 mb-12">
              {chapterData.sections.map((section: any) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 group">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      {section.title}
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      onClick={() => handleAddBookmark(section.id, section.title)}
                      title="Bookmark this section"
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-serif prose-p:leading-relaxed text-muted-foreground">
                    {section.content.map((paragraph: string, idx: number) => (
                      <p key={idx}>{renderTextWithGlossary(paragraph)}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Formulas Box */}
            {chapterData.formulas && chapterData.formulas.length > 0 && (
              <div className="my-12 p-8 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-md">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Key Formulas</h3>
                </div>
                <div className="space-y-6">
                  {chapterData.formulas.map((formula: any, idx: number) => (
                    <div key={idx} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
                      <p className="font-medium text-foreground mb-2">{formula.name}</p>
                      <div className="bg-muted/50 p-4 rounded-md font-mono text-primary font-bold overflow-x-auto text-lg">
                        {formula.eq}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{formula.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms Box */}
            <div className="my-12 p-8 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-serif font-bold text-primary">Key Terms</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Hover over terms in the text above to see their definitions, or review them here.</p>
              <div className="flex flex-wrap gap-2">
                {chapterData.terms.map((term: string, idx: number) => (
                  <span key={idx} className="bg-background border border-border px-3 py-1 rounded-md text-sm font-medium">
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
                <p className="text-sm text-muted-foreground">Mark this chapter as complete to track your progress.</p>
              </div>
              <Button 
                size="lg" 
                onClick={handleMarkComplete}
                disabled={updateProgress.isPending}
                className={progress?.completed ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                {progress?.completed ? (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Completed</>
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
                  Take the chapter quiz to ensure you've understood the core concepts of {chapterData.title}.
                </p>
                <Button size="lg" asChild className="px-8">
                  <Link href={`/quiz/${chapterId}`}>
                    Start Quiz <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Navigation footer */}
            <div className="flex justify-between items-center py-6 border-t border-border">
              {chapterId > 1 ? (
                <Link href={`/chapter/${chapterId - 1}`}>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous Chapter
                  </Button>
                </Link>
              ) : <div></div>}
              
              {chapterId < 7 ? (
                <Link href={`/chapter/${chapterId + 1}`}>
                  <Button variant="ghost" className="text-primary hover:text-primary">
                    Next Chapter <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : <div></div>}
            </div>
            
          </article>
        </div>
      </div>
    </Layout>
  );
}
