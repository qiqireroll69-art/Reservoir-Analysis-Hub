import { Layout } from "@/components/layout/Layout";
import { useSearchContent, getSearchContentQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Search as SearchIcon, BookOpen, Sigma, FileText, BookA } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || "");
  const query = searchParams.get("q") || "";

  const { data: results, isLoading } = useSearchContent({ q: query }, {
    query: {
      enabled: query.length > 0,
      queryKey: getSearchContentQueryKey({ q: query }),
    }
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'topic': return <BookOpen className="h-5 w-5" />;
      case 'formula': return <Sigma className="h-5 w-5" />;
      case 'glossary': return <BookA className="h-5 w-5" />;
      case 'definition': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getHrefForType = (res: any) => {
    switch (res.type) {
      case 'topic': return `/chapter/${res.chapterId}`;
      case 'formula': return '/formulas';
      case 'glossary': return '/glossary';
      default: return '/';
    }
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
          <div className="text-center py-24 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-serif">Maglagay ng search query sa navigation bar</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : !results || results.results.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-serif mb-2">Walang nahanap na resulta</p>
            <p className="text-sm">Subukan ang ibang keyword o tingnan ang <Link href="/glossary" className="text-primary hover:underline">Talasalitaan</Link></p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              Nahanap ang <strong>{results.results.length}</strong> resulta para sa "{query}"
            </p>
            <div className="space-y-4">
              {results.results.map((res: any, idx: number) => (
                <Link key={idx} href={getHrefForType(res)}>
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-6 flex gap-4">
                      <div className="shrink-0 text-primary p-2 bg-primary/10 rounded-md h-fit mt-0.5">
                        {getIconForType(res.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded uppercase tracking-wider">
                            {getTypeLabel(res.type)}
                          </span>
                          {res.chapterId && (
                            <span className="text-xs text-primary font-medium">Kabanata {res.chapterId}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg font-serif group-hover:text-primary transition-colors mb-1 truncate">
                          {res.title}
                        </h3>
                        {res.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{res.excerpt}</p>
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
