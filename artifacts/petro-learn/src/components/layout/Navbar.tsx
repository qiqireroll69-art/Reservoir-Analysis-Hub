import { Link, useLocation } from "wouter";
import { BookOpen, Search, Menu, Moon, Sun, BookOpen as BookOpenIcon, Sigma, FileText, BookA, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

type Suggestion = {
  title: string;
  chapterId: number | null;
  type: string;
};

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const resp = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      if (resp.ok) {
        const data = await resp.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setActiveSuggestion(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 220);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setShowSuggestions(false);
      setSuggestions([]);
      setLocation(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    setSuggestions([]);
    setLocation(`/search?q=${encodeURIComponent(suggestion.title)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'formula': return <Sigma className="h-3.5 w-3.5 text-purple-500" />;
      case 'glossary': return <BookA className="h-3.5 w-3.5 text-green-500" />;
      case 'definition': return <FileText className="h-3.5 w-3.5 text-orange-500" />;
      default: return <BookOpenIcon className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/chapters", label: "Mga Kabanata" },
    { href: "/formulas", label: "Mga Kagamitan" },
    { href: "/quiz/1", label: "Quiz" },
    { href: "/about", label: "Tungkol Sa" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-2 mr-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:bg-accent transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight hidden sm:inline-block">
              PETROTuKLAS
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href || (link.href !== "/" && location.startsWith(link.href))
                  ? "text-primary border-b-2 border-primary py-5 -mb-[22px]"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 md:flex-none items-center justify-end gap-4">
          {/* Desktop search with autocomplete */}
          <div ref={searchRef} className="relative w-full max-w-sm hidden sm:block">
            <form onSubmit={handleSearch}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Maghanap ng konsepto, formula..."
                className="w-full bg-muted/50 pl-9 pr-8 rounded-full focus-visible:ring-primary h-9"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50">
                <div className="py-1">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent transition-colors text-sm ${
                        i === activeSuggestion ? 'bg-accent' : ''
                      }`}
                      onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s); }}
                    >
                      <span className="shrink-0">{getSuggestionIcon(s.type)}</span>
                      <span className="flex-1 truncate font-medium">{s.title}</span>
                      {s.chapterId && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Kab. {s.chapterId}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-border/50">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onMouseDown={(e) => { e.preventDefault(); if (searchQuery.trim()) { setShowSuggestions(false); setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`); } }}
                    >
                      <Search className="h-3 w-3" />
                      Tingnan ang lahat ng resulta para sa "{searchQuery}"
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
            aria-label="Baguhin ang Tema"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-serif font-bold text-xl tracking-tight">
                    PETROTuKLAS
                  </span>
                </div>
                
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Maghanap..."
                    className="w-full bg-muted pl-9 rounded-md h-9"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </form>

                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        location === link.href || (link.href !== "/" && location.startsWith(link.href))
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Link href="/bookmarks" className="text-lg font-medium text-muted-foreground hover:text-primary">
                    Mga Bookmark
                  </Link>
                  <Link href="/glossary" className="text-lg font-medium text-muted-foreground hover:text-primary">
                    Talasalitaan
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
