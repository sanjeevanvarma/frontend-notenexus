import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, XCircle, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  _id: string;
}

interface QuizData {
  _id: string;
  title: string;
  questions: Question[];
}

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quiz/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz data.');
        }

        const data = await response.json();
        setQuiz(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchQuiz();
    }
  }, [id, token]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return; // Prevent changing answer

    setSelectedAnswer(answer);
    const correct = answer === quiz!.questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center py-12">Quiz not found.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header title="Quiz Time!" />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-0 bg-card/60 backdrop-blur-sm animate-fade-in">
          {!quizFinished ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{quiz.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                </CardTitle>
                <CardDescription className="pt-4 text-lg">{currentQuestion.question}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={cn(
                          "justify-start w-full text-left h-auto py-3 whitespace-normal",
                          isSelected && isCorrect === true && "bg-green-200 border-green-400 hover:bg-green-200 text-green-900",
                          isSelected && isCorrect === false && "bg-red-200 border-red-400 hover:bg-red-200 text-red-900",
                          selectedAnswer && isCorrectAnswer && "bg-green-200 border-green-400 text-green-900"
                        )}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={!!selectedAnswer}
                      >
                        {isSelected && isCorrect === true && <CheckCircle className="w-5 h-5 mr-3" />}
                        {isSelected && isCorrect === false && <XCircle className="w-5 h-5 mr-3" />}
                        {!isSelected && selectedAnswer && isCorrectAnswer && <Target className="w-5 h-5 mr-3" />}
                        {option}
                      </Button>
                    );
                  })}
                </div>
                {selectedAnswer && (
                  <div className="mt-6 text-center">
                    <Button onClick={handleNextQuestion} className="w-full sm:w-auto">
                      {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold">Quiz Completed!</h2>
              <p className="text-muted-foreground mt-2">You scored:</p>
              <p className="text-4xl font-bold my-4">{score} / {quiz.questions.length}</p>
              <Button asChild>
                <Link to="/quizzes">Back to Quizzes</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
