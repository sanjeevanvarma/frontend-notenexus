import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, AlertCircle, Trash2, Play, Brain, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Quiz {
  _id: string;
  title: string;
  createdAt: string;
}

const Quizzes = () => {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/quiz`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quizzes.');
        }

        const data = await response.json();
        setQuizzes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchQuizzes();
    }
  }, [token]);

  const handleDeleteQuiz = async (quizId: string) => {
    setDeletingId(quizId);
    try {
      const response = await fetch(`${API_URL}/api/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz.');
      }

      setQuizzes(prevQuizzes => prevQuizzes.filter(q => q._id !== quizId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Quizzes Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">You haven't generated any quizzes yet.</p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/summaries">
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate a New Quiz
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(quiz => (
          <Card key={quiz._id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <CardDescription>
                Created {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end justify-between">
              <Button asChild variant="default" size="sm">
                <Link to={`/quiz/${quiz._id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Take Quiz
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deletingId === quiz._id}>
                    {deletingId === quiz._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this quiz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteQuiz(quiz._id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header title="My Quizzes" />
      <div className="container mx-auto px-4 py-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default Quizzes;
