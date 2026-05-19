import { Layout } from "@/components/layout/Layout";
import { useGetBookmarks, useDeleteBookmark, getGetBookmarksQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Bookmarks() {
  const { data: bookmarks, isLoading } = useGetBookmarks();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteBookmark = useDeleteBookmark({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
        toast({
          title: "Bookmark removed",
          description: "The item has been removed from your saved list.",
        });
      }
    }
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent navigating to link
    deleteBookmark.mutate({ id });
  };

  return (
    <Layout>
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-2 flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-amber-500" />
            My Bookmarks
          </h1>
          <p className="text-slate-300">Quick access to your saved chapter sections.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !bookmarks || bookmarks.length === 0 ? (
          <div className="text-center py-24 bg-card border border-border rounded-xl">
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h2 className="text-2xl font-serif font-bold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-6">
              Save important sections while reading chapters to quickly access them later.
            </p>
            <Button asChild>
              <Link href="/chapters">Browse Chapters</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((bm) => (
              <Link key={bm.id} href={`/chapter/${bm.chapterId}${bm.sectionId ? `#${bm.sectionId}` : ''}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-primary font-medium mb-1">Chapter {bm.chapterId}</div>
                      <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors">
                        {bm.title}
                      </h3>
                      {bm.note && <p className="text-muted-foreground mt-2 text-sm italic">"{bm.note}"</p>}
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                        Saved on {new Date(bm.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 hidden sm:flex items-center gap-1 font-medium">
                        Read <ArrowRight className="h-4 w-4" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 z-10"
                        onClick={(e) => handleDelete(e, bm.id)}
                        disabled={deleteBookmark.isPending}
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
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
