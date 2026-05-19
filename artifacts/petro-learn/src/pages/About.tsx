import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Target, Award } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-slate-900 text-white py-16 md:py-24 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              About PetroLearn
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Bridging the gap between academic theory and industry application in reservoir petrophysics and hydrocarbon phase analysis.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-serif">
          <h2>Our Mission</h2>
          <p>
            PetroLearn was built to provide petroleum engineering students and early-career professionals with a rigorous, accessible, and beautifully designed platform for mastering petrophysics. We believe that complex engineering principles don't require archaic, difficult-to-navigate software.
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-12 not-prose">
            <div className="bg-card p-6 rounded-xl border border-border">
              <BookOpen className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Rigorous Content</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">University-level material covering core petrophysical principles and thermodynamic phase behavior.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <Target className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Focused Learning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">A distraction-free environment designed for deep reading, retention, and quick reference.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-serif font-bold text-xl mb-2">Self-Assessment</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Integrated quizzes and progress tracking to ensure mastery of the material before moving forward.</p>
            </div>
          </div>

          <h2>Course Objectives</h2>
          <p>Upon completing this 7-chapter curriculum, learners will be able to:</p>
          <ul>
            <li>Understand and calculate fundamental rock properties including porosity, permeability, and compressibility.</li>
            <li>Analyze multiphase fluid distribution in porous media using capillary pressure concepts.</li>
            <li>Interpret basic open-hole well logs to derive petrophysical parameters.</li>
            <li>Predict hydrocarbon phase behavior under varying reservoir pressure and temperature conditions.</li>
            <li>Integrate rock and fluid data to estimate initial hydrocarbons in place and assess recovery mechanisms.</li>
          </ul>

          <div className="bg-primary/5 border border-primary/20 p-8 rounded-xl mt-12 text-center not-prose">
            <h3 className="font-serif font-bold text-2xl mb-4">Ready to start?</h3>
            <p className="text-muted-foreground mb-6">Begin your journey into reservoir petrophysics today.</p>
            <Button size="lg" asChild>
              <Link href="/chapters">View Curriculum <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
