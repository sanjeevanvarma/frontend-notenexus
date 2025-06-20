import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, Play, RotateCcw, Download, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/shared/Header";
import { useFlashcardsBySummary, useGenerateFlashcards, useDeleteFlashcards } from "@/hooks/useFlashcards";
import { Flashcard } from "@/types/flashcards";
import { toast } from "sonner";
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import type { Summary } from '@/types/summaries';

const Flashcards = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(id || null);

  const { data: flashcards, isLoading: isFetchingFlashcards, error: flashcardsError } = useFlashcardsBySummary(id || "");
  const { mutate: generateFlashcards } = useGenerateFlashcards();
  const { mutate: deleteFlashcards } = useDeleteFlashcards();

  useEffect(() => {
    if (!id) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/api/summaries/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }
        
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError('Failed to fetch summary');
      }
    };

    fetchSummary();
  }, [id]);

  const handleDeleteAllFlashcards = () => {
    if (!selectedSummaryId) return;

    deleteFlashcards(selectedSummaryId, {
      onSuccess: () => {
        toast.success('Flashcards deleted successfully!');
        setSelectedSummaryId(null);
        setCurrentCard(0);
        setIsFlipped(false);
      },
      onError: (error) => {
        toast.error('Failed to delete flashcards');
      }
    });
  };

  const nextCard = () => {
    if (!flashcards || flashcards.length === 0) return;
    setCurrentCard((prev) => {
      const nextIndex = (prev + 1) % flashcards.length;
      setIsFlipped(false);
      return nextIndex;
    });
  };

  const prevCard = () => {
    if (!flashcards || flashcards.length === 0) return;
    setCurrentCard((prev) => {
      const prevIndex = (prev - 1 + flashcards.length) % flashcards.length;
      setIsFlipped(false);
      return prevIndex;
    });
  };

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header title="Generate Flashcards" />
        <div className="container mx-auto px-4 py-12">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {flashcardsError && (
            <Alert variant="destructive">
              <AlertDescription>Failed to load flashcards</AlertDescription>
            </Alert>
          )}
          <div className="max-w-3xl mx-auto mb-12 animate-fade-in">
            <Card className="border-0 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Generate Flashcards</CardTitle>
                <CardDescription>Select a summary to generate flashcards</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="summaryId" className="text-sm font-medium">
                        Summary ID
                      </label>
                      <Input
                        id="summaryId"
                        placeholder="Enter summary ID"
                        disabled
                        value={id || ''}
                      />
                    </div>
                    <Button
                      onClick={() => navigate('/summaries')}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Select Summary
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header title="Smart Flashcards" />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto my-8 animate-fade-in">
          <Card className="border-0 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{summary.title}</CardTitle>
              <CardDescription>
                {summary.channelTitle} &middot; {new Date(summary.publishedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <img src={summary.thumbnail} alt={summary.title} className="w-full md:w-1/3 rounded-lg shadow-lg" />
                <div className="flex-1 space-y-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{summary.summary}</p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                      onClick={handleDeleteAllFlashcards}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      Delete All Flashcards
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={prevCard}
                        disabled={currentCard === 0 || !flashcards}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={nextCard}
                        disabled={!flashcards || currentCard === flashcards.length - 1}
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {flashcards && flashcards.length > 0 ? (
          <div className="relative w-full max-w-md mx-auto my-8">
            <Card className={`transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
              <CardContent className="p-6">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">
                    {currentCard + 1}/{flashcards.length}
                  </Badge>
                </div>
                <div className={`transition-opacity duration-500 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                  <h3 className="text-2xl font-semibold mb-2">
                    {flashcards[currentCard].question}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFlipped(true)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Show Answer
                    </Button>
                  </div>
                </div>
                <div className={`transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-lg mb-4">
                    {flashcards[currentCard].answer}
                  </p>
                  <Badge variant="outline">
                    {flashcards[currentCard].category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center py-8">
            <div className="flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">
                No Flashcards Yet
              </h3>
              <p className="text-muted-foreground">
                Generate flashcards for this summary to start learning!
              </p>
              <Button 
                onClick={() => generateFlashcards(summary._id)}
              >
                Generate Flashcards
              </Button>
            </div>
            <p>No flashcards available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
