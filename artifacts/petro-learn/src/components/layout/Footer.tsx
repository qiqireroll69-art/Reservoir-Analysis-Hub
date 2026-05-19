import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-serif font-bold text-lg mb-4">PetroLearn</h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              A serious, beautifully crafted learning platform for petroleum engineering students. 
              Master reservoir petrophysics and hydrocarbon phase analysis with precision and clarity.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-primary">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/chapters" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  All Chapters
                </Link>
              </li>
              <li>
                <Link href="/formulas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Formula Sheet
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Glossary of Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-primary">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/bookmarks" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/quiz/1" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Quizzes
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PetroLearn. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
