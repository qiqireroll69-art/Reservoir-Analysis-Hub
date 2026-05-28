import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { 
  useGetChapterQuiz, 
  useSubmitQuiz, 
  useGetQuizHistory,
  getGetQuizHistoryQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit, CheckCircle2, XCircle, ChevronLeft, ArrowRight,
  RotateCcw, AlertTriangle, BookOpen, Lightbulb, MapPin
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

export default function Quiz() {
  const { chapterId: chapterIdStr } = useParams();
  const chapterId = parseInt(chapterIdStr || "1", 10);
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: questions, isLoading: isLoadingQuestions } = useGetChapterQuiz(chapterId);
  const { data: history } = useGetQuizHistory(chapterId);
  
  const submitQuiz = useSubmitQuiz({
    mutation: {
      onSuccess: (data) => {
        setQuizResult(data);
        queryClient.invalidateQueries({ queryKey: getGetQuizHistoryQueryKey(chapterId) });
      }
    }
  });

  const bestScore = history && history.length > 0 
    ? Math.max(...history.map(h => h.percentage)) 
    : null;

  const currentQuestion = questions?.[currentQuestionIndex];
  const isLastQuestion = questions && currentQuestionIndex === questions.length - 1;
  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  const handleNext = () => {
    if (isLastQuestion) {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: parseInt(qId, 10),
        answer: ans
      }));
      submitQuiz.mutate({ chapterId, data: { answers: formattedAnswers } });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleRetake = () => {
    setQuizResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  if (isLoadingQuestions) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <Card>
            <CardHeader><Skeleton className="h-8 w-full" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center max-w-lg">
          <BrainCircuit className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-serif font-bold mb-4">Hindi available ang Quiz</h2>
          <p className="text-muted-foreground mb-8">Wala pang mga tanong na naka-configure para sa kabanatang ito.</p>
          <Button asChild><Link href={`/chapter/${chapterId}`}>Bumalik sa Kabanata</Link></Button>
        </div>
      </Layout>
    );
  }

  // === Results view ===
  if (quizResult) {
    const isPassing = quizResult.percentage >= 70;
    const wrongCount = quizResult.feedback.filter((fb: any) => !fb.isCorrect).length;
    
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
          {/* Score ring */}
          <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full mb-6 border-8 ${
              isPassing
                ? 'bg-green-100 dark:bg-green-900/20 border-green-500/30 text-green-600 dark:text-green-400'
                : 'bg-amber-100 dark:bg-amber-900/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              <span className="text-3xl font-bold">{Math.round(quizResult.percentage)}%</span>
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">
              {isPassing ? "Napakagaling!" : "Mag-aral pa nang kaunti!"}
            </h1>
            <p className="text-muted-foreground mb-4">
              Nakakuha ka ng <strong>{quizResult.score}</strong> sa <strong>{quizResult.total}</strong> puntos.
            </p>
            {wrongCount > 0 && (
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>May <strong>{wrongCount}</strong> tanong na kailangang suriin — basahin ang error analysis sa ibaba.</span>
              </div>
            )}
          </div>

          {/* Detailed feedback */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-serif font-bold border-b pb-3 flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              Detalyadong Feedback
            </h2>

            {quizResult.feedback.map((fb: any, idx: number) => (
              <Card
                key={fb.questionId}
                className={`overflow-hidden border-l-4 ${
                  fb.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                }`}
              >
                <CardContent className="p-6">
                  {/* Question text */}
                  <div className="flex gap-3 mb-5">
                    {fb.isCorrect
                      ? <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                      : <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                    }
                    <p className="font-medium text-lg font-serif leading-snug">
                      <span className="text-muted-foreground mr-2 text-base font-sans">{idx + 1}.</span>
                      {fb.question}
                    </p>
                  </div>

                  {/* Answer boxes */}
                  <div className="grid md:grid-cols-2 gap-3 text-sm mb-4 pl-9">
                    <div className={`p-3 rounded-lg border ${
                      fb.isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    }`}>
                      <p className={`text-xs uppercase tracking-wider mb-1.5 font-semibold ${
                        fb.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        Iyong Sagot
                      </p>
                      <p className={`font-medium leading-relaxed ${
                        fb.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {fb.userAnswer}
                      </p>
                    </div>
                    {!fb.isCorrect && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                        <p className="text-xs uppercase tracking-wider mb-1.5 font-semibold text-green-600 dark:text-green-400">
                          Tamang Sagot
                        </p>
                        <p className="font-medium text-green-800 dark:text-green-200 leading-relaxed">
                          {fb.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Analysis — wrong answers only */}
                  {!fb.isCorrect && (
                    <div className="pl-9 space-y-3 mb-4">
                      {fb.whyWrong && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                                Bakit Mali ang Sagot Mo
                              </p>
                              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                                {fb.whyWrong}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        {fb.chapterReference && (
                          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">
                                  Reference
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                  {fb.chapterReference}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {fb.suggestedTopic && (
                          <div className="flex-1 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-0.5">
                                  Isuggestong Aralin
                                </p>
                                <Link
                                  href={`/chapter/${fb.chapterReference?.match(/\d+/)?.[0] || quizResult.chapterId}`}
                                  className="text-sm text-violet-700 dark:text-violet-300 font-medium hover:underline flex items-center gap-1 group"
                                >
                                  {fb.suggestedTopic}
                                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Explanation — always shown */}
                  <div className="rounded-lg p-4 bg-primary/5 border border-primary/15 pl-9 ml-0">
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                          Paliwanag
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {fb.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={handleRetake} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Ulitin ang Quiz
            </Button>
            <Button size="lg" asChild variant="outline">
              <Link href={`/chapter/${chapterId}`}>
                <BookOpen className="mr-2 h-4 w-4" /> Bumalik sa Kabanata
              </Link>
            </Button>
            {chapterId < 7 && (
              <Button size="lg" asChild className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                <Link href={`/chapter/${chapterId + 1}`}>
                  Susunod na Kabanata <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // === Quiz-taking view ===
  const progressPercent = (currentQuestionIndex / questions.length) * 100;

  return (
    <Layout>
      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl flex justify-between items-center">
          <div>
            <Link href={`/chapter/${chapterId}`} className="text-slate-400 hover:text-white text-sm flex items-center mb-2 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Bumalik sa Kabanata
            </Link>
            <h1 className="text-2xl font-serif font-bold">Kabanata {chapterId} — Pagsubok sa Kaalaman</h1>
          </div>
          {bestScore !== null && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Nakaraang Pinakamataas</p>
              <p className="text-xl font-bold text-amber-500">{bestScore}%</p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Tanong {currentQuestionIndex + 1} sa {questions.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Card className="border-border shadow-md mb-8">
          <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Tanong {currentQuestionIndex + 1}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentQuestion?.type === 'multiple_choice' ? 'Maramihang Pagpili' : 'Maikling Sagot'}
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl font-serif leading-snug">
              {currentQuestion?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            {currentQuestion?.type === 'multiple_choice' && currentQuestion.options ? (
              <RadioGroup 
                value={answers[currentQuestion.id] || ""} 
                onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50"
                  >
                    <RadioGroupItem value={option} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer font-medium leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="short-answer" className="text-muted-foreground">
                  Isulat ang iyong sagot sa ibaba:
                </Label>
                <Textarea 
                  id="short-answer"
                  value={answers[currentQuestion!.id] || ""}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion!.id]: e.target.value }))}
                  placeholder="Ilagay ang iyong sagot..."
                  className="min-h-[120px] text-lg p-4"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/20 border-t border-border/50 p-6 flex justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Nakaraan
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isAnswered || submitQuiz.isPending}
              className={isLastQuestion ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" : ""}
            >
              {submitQuiz.isPending ? "Isinusumite..." : isLastQuestion ? "Isumite ang Quiz" : "Susunod na Tanong"}
              {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>

        {/* Question nav dots */}
        <div className="flex justify-center gap-2 flex-wrap">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQuestionIndex(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentQuestionIndex
                  ? 'bg-primary scale-125'
                  : answers[questions[i].id] !== undefined
                  ? 'bg-primary/40'
                  : 'bg-muted-foreground/30'
              }`}
              aria-label={`Tanong ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
