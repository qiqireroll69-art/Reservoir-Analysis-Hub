import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Chapters from "@/pages/Chapters";
import Chapter from "@/pages/Chapter";
import Glossary from "@/pages/Glossary";
import Formulas from "@/pages/Formulas";
import Quiz from "@/pages/Quiz";
import Bookmarks from "@/pages/Bookmarks";
import Search from "@/pages/Search";
import About from "@/pages/About";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chapters" component={Chapters} />
      <Route path="/chapter/:id" component={Chapter} />
      <Route path="/glossary" component={Glossary} />
      <Route path="/formulas" component={Formulas} />
      <Route path="/quiz/:chapterId" component={Quiz} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/search" component={Search} />
      <Route path="/about" component={About} /> 
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="petrolearn-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
