import { Layout } from "@/components/layout/Layout";
import { useSearchContent, getSearchContentQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Search as SearchIcon, BookOpen, Sigma, FileText, BookA, ArrowRight, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Search() {
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const query = searchParams.get("q") || "";

  const { data: results, isLoading } = useSearchContent({ q: query }, {
    query: {
      enabled: query.length > 0,
      queryKey: getSearchContentQueryKey({ q: query }),
    }
  });

  function highlightText(text: string, term: string): React.ReactNode {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-200 dark:bg-amber-700/50 text-amber-900 dark:text-amber-100 rounded px-0.5 not-italic">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'topic': return <BookOpen className="h-5 w-5" />;
      case 'formula': return <Sigma className="h-5 w-5" />;
      case 'glossary': return <BookA className="h-5 w-5" />;
      case 'definition': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'topic': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'formula': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'glossary': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'definition': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHrefForResult = (res: any) => {
    if (res.type === 'formula') return '/formulas';
    if (res.type === 'glossary') return '/glossary';
    if (res.chapterId) {
      const base = `/chapter/${res.chapterId}`;
      return res.sectionId ? `${base}#${res.sectionId}` : base;
    }
    return '/';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'topic': return 'Paksa';
      case 'formula': return 'Formula';
      case 'glossary': return 'Talasalitaan';
      case 'definition': return 'Kahulugan';
      default: return type;
    }
  };

  const RELATED_TOPICS = [
    { label: "Porosity", href: "/chapter/2#sec-2-1" },
    { label: "Permeability", href: "/chapter/2#sec-2-2" },
    { label: "Capillary Pressure", href: "/chapter/3#sec-3-3" },
    { label: "Archie's Equations", href: "/chapter/4#sec-4-2-b" },
    { label: "Phase Diagram", href: "/chapter/5#sec-5-1" },
    { label: "STOIIP", href: "/chapter/6#sec-6-3-a" },
  ];

  return (
    <Layout>
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-2 flex items-center gap-3">
              <SearchIcon className="h-8 w-8 text-amber-500" />
              Mga Resulta ng Paghahanap
            </h1>
            {query && (
              <p className="text-slate-300">
                Naghahanap para sa: <span className="text-amber-400 font-semibold">"{query}"</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        {!query ? (
          <div className="text-center py-20 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-serif mb-6">Maglagay ng search query sa navigation bar</p>
            <div className="mt-4">
              <p className="text-sm mb-4 font-medium">Mga popular na paksa:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {RELATED_TOPICS.map((t) => (
                  <Link key={t.href} href={t.href}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors px-3 py-1">
                      {t.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : !results || results.results.length === 0 ? (
          <div className="py-16 text-muted-foreground">
            <div className="text-center mb-10">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-serif mb-2">Walang nahanap na resulta para sa "{query}"</p>
              <p className="text-sm mb-4">Subukan ang paghanap sa ibang paraan o tingnan ang mga mungkahi sa ibaba:</p>
            </div>
            <div className="max-w-lg mx-auto">
              <p className="text-sm font-medium mb-3 text-center">Subukan ang mga paksa:</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {RELATED_TOPICS.map((t) => (
                  <Link key={t.href} href={t.href}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors px-3 py-1">
                      {t.label}
                    </Badge>
                  </Link>
                ))}
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <Link href="/glossary" className="text-primary hover:underline flex items-center gap-1">
                  <BookA className="h-4 w-4" /> Talasalitaan
                </Link>
                <Link href="/formulas" className="text-primary hover:underline flex items-center gap-1">
                  <Sigma className="h-4 w-4" /> Mga Formula
                </Link>
                <Link href="/chapters" className="text-primary hover:underline flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> Lahat ng Kabanata
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Nahanap ang <strong>{results.results.length}</strong> resulta para sa "{query}"
              </p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {(['topic', 'formula', 'glossary', 'definition'] as const).map(type => {
                  const count = results.results.filter(r => r.type === type).length;
                  if (count === 0) return null;
                  return (
                    <span key={type} className={`px-2 py-0.5 rounded-full ${getColorForType(type)}`}>
                      {getTypeLabel(type)}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              {results.results.map((res: any, idx: number) => (
                <Link key={idx} href={getHrefForResult(res)}>
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group border-border/60">
                    <CardContent className="p-5 flex gap-4">
                      <div className={`shrink-0 p-2 rounded-md h-fit mt-0.5 ${getColorForType(res.type)}`}>
                        {getIconForType(res.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider ${getColorForType(res.type)}`}>
                            {getTypeLabel(res.type)}
                          </span>
                          {res.chapterId && (
                            <span className="text-xs text-primary font-medium">
                              Kabanata {res.chapterId}
                            </span>
                          )}
                          {res.chapterTitle && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              — {res.chapterTitle}
                            </span>
                          )}
                          {res.sectionId && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Hash className="h-3 w-3" />
                              {res.sectionId}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base font-serif group-hover:text-primary transition-colors mb-1">
                          {highlightText(res.title, query)}
                        </h3>
                        {res.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {highlightText(res.excerpt, query)}
                          </p>
                        )}
                        {res.chapterId && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-3 w-3" />
                            {res.sectionId ? "Pumunta sa seksyon" : "Pumunta sa kabanata"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
