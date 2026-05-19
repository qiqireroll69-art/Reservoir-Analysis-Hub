import { Layout } from "@/components/layout/Layout";
import { useGetGlossaryTerms } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, BookA } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Glossary() {
  const { data: terms, isLoading } = useGetGlossaryTerms();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = useMemo(() => {
    if (!terms) return [];
    if (!searchQuery.trim()) return terms;
    
    const query = searchQuery.toLowerCase();
    return terms.filter(
      term => 
        term.term.toLowerCase().includes(query) || 
        term.definition.toLowerCase().includes(query)
    );
  }, [terms, searchQuery]);

  // Group terms alphabetically
  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof filteredTerms> = {};
    filteredTerms.forEach(term => {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(term);
    });
    
    // Sort keys alphabetically
    return Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        // Sort terms within group
        acc[key] = groups[key].sort((a, b) => a.term.localeCompare(b.term));
        return acc;
      }, {} as Record<string, typeof filteredTerms>);
  }, [filteredTerms]);

  return (
    <Layout>
      <div className="bg-slate-900 dark:bg-slate-950 text-white py-16 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 flex items-center gap-3">
              <BookA className="h-10 w-10 text-amber-500" />
              Glossary of Terms
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              A comprehensive dictionary of petrophysics and reservoir engineering terminology.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                type="search" 
                placeholder="Search terms or definitions..." 
                className="w-full bg-slate-800/50 border-slate-700 text-white pl-10 py-6 text-lg focus-visible:ring-amber-500 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-10 w-12" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : Object.keys(groupedTerms).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No terms found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedTerms).map(([letter, termsList]) => (
                <div key={letter} className="relative">
                  <h2 className="text-3xl font-serif font-bold text-primary mb-6 flex items-center gap-4">
                    <span className="bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center rounded-lg shadow-sm">
                      {letter}
                    </span>
                    <div className="h-px bg-border flex-1"></div>
                  </h2>
                  <div className="grid gap-6 pl-0 md:pl-16">
                    {termsList.map(term => (
                      <div key={term.id} className="bg-card border border-border p-6 rounded-xl hover-elevate transition-shadow">
                        <h3 className="text-xl font-bold font-serif mb-2 text-foreground">{term.term}</h3>
                        <p className="text-muted-foreground leading-relaxed">{term.definition}</p>
                        {(term.chapterId || term.category) && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                            {term.category && (
                              <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded-md uppercase tracking-wider">
                                {term.category}
                              </span>
                            )}
                            {term.chapterId && (
                              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md uppercase tracking-wider">
                                Chapter {term.chapterId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
