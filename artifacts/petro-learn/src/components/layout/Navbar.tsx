import { Link, useLocation } from "wouter";
import { BookOpen, Search, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
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
              PetroLearn
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
          <form onSubmit={handleSearch} className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Maghanap ng konsepto, formula..."
              className="w-full bg-muted/50 pl-9 rounded-full focus-visible:ring-primary h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

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
                    PetroLearn
                  </span>
                </div>
                
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Maghanap..."
                    className="w-full bg-muted pl-9 rounded-md h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
