import { Layout } from "@/components/layout/Layout";
import { useSearchContent } from "@workspace/api-client-react";
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
      enabled: query.length > 0
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
      case 'topic':
      case 'definition':
        return `/chapter/${res.chapterId}${res.sectionId ? `#${res.sectionId}` : ''}`;
      case 'formula':
        return `/formulas`;
      case 'glossary':
        return `/glossary?q=${encodeURIComponent(res.title)}`;
      default:
        return `/`;
    }
  };

  return (
    <Layout>
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">
            Search Results
          </h1>
          <p className="text-slate-300">
            {query ? `Showing results for "${query}"` : "Enter a search term in the navigation bar."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        {!query ? (
          <div className="text-center py-24 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Please enter a search term.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : !results || results.results.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">No results found</h2>
            <p>We couldn't find anything matching "{query}". Try checking your spelling or use more general terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground mb-6">Found {results.results.length} results</p>
            
            {results.results.map((res, idx) => (
              <Link key={idx} href={getHrefForType(res)}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group mb-4">
                  <CardContent className="p-6 flex gap-4">
                    <div className="mt-1 p-2 bg-muted rounded-md text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      {getIconForType(res.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                          {res.type}
                        </span>
                        {res.chapterTitle && (
                          <span className="text-xs text-primary font-medium">
                            Chapter {res.chapterId}: {res.chapterTitle}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors mb-2">
                        {res.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        ...{res.excerpt}...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
