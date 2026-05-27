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
import { BrainCircuit, CheckCircle2, XCircle, ChevronLeft, ArrowRight, RotateCcw } from "lucide-react";
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
      
      submitQuiz.mutate({
        chapterId,
        data: { answers: formattedAnswers }
      });
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

  // Resulta
  if (quizResult) {
    const isPassing = quizResult.percentage >= 70;
    
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 border-8 ${isPassing ? 'bg-green-100 border-green-500/20 text-green-600' : 'bg-amber-100 border-amber-500/20 text-amber-600'}`}>
              <span className="text-3xl font-bold">{Math.round(quizResult.percentage)}%</span>
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">
              {isPassing ? "Napakagaling!" : "Mag-aral pa nang kaunti!"}
            </h1>
            <p className="text-muted-foreground">
              Nakakuha ka ng {quizResult.score} sa {quizResult.total} puntos.
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <h2 className="text-2xl font-serif font-bold border-b pb-2">Detalyadong Feedback</h2>
            {quizResult.feedback.map((fb: any, idx: number) => (
              <Card key={fb.questionId} className={`border-l-4 ${fb.isCorrect ? 'border-l-green-500' : 'border-l-red-500'} bg-card`}>
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    {fb.isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-lg mb-4">
                        <span className="text-muted-foreground mr-2">{idx + 1}.</span> 
                        {fb.question}
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Iyong Sagot</p>
                          <p className={fb.isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                            {fb.userAnswer}
                          </p>
                        </div>
                        {!fb.isCorrect && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                            <p className="text-green-700 dark:text-green-400 mb-1 text-xs uppercase tracking-wider">Tamang Sagot</p>
                            <p className="text-green-800 dark:text-green-300 font-medium">
                              {fb.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-primary/5 p-4 rounded-md mt-4 border border-primary/10">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-bold mr-2">Paliwanag:</span> 
                          {fb.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={handleRetake} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Ulitin ang Quiz
            </Button>
            <Button size="lg" asChild>
              <Link href={`/chapter/${chapterId < 7 ? chapterId + 1 : chapterId}`}>
                Ipagpatuloy ang Pag-aaral <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Pagsasagot ng Quiz
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
                  <div key={i} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50">
                    <RadioGroupItem value={option} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer font-medium leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="short-answer" className="text-muted-foreground">Isulat ang iyong sagot sa ibaba:</Label>
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
      </div>
    </Layout>
  );
}
