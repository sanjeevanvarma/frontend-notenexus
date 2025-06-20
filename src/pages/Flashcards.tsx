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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(id || null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: flashcards, isLoading: isFetchingFlashcards, error: flashcardsError } = useFlashcardsBySummary(id || "");
  const generateMutation = useGenerateFlashcards();
  const deleteMutation = useDeleteFlashcards();

  const generateFlashcards = (variables: { summaryId: string }) => {
    generateMutation.mutate(variables, {
      onSuccess: () => {
        toast.success('Flashcards generated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to generate flashcards');
      }
    });
  };

  const handleDeleteAllFlashcards = () => {
    if (!selectedSummaryId) return;

    deleteMutation.mutate({ summaryId: selectedSummaryId }, {
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

  const isGeneratingFlashcards = generateMutation.isPending;
  const isDeletingFlashcards = deleteMutation.isPending;

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
        <Header title="Flashcards" />
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
                      disabled={isDeletingFlashcards}
                    >
                      {isDeletingFlashcards ? 'Deleting...' : 'Delete All Flashcards'}
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

        <div className="flex flex-col items-center justify-center h-full">
          {flashcards && flashcards.length > 0 ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-96 h-64 bg-white rounded-lg shadow-lg p-4 transform transition-transform duration-300" 
                   onClick={() => setIsFlipped(!isFlipped)}
                   style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                <div className="absolute inset-0 bg-white rounded-lg shadow-lg p-4 transform transition-transform duration-300"
                     style={{ backfaceVisibility: 'hidden' }}>
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{flashcards[currentCard].question}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {flashcards[currentCard].category}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
                      {isFlipped ? 'Show Question' : 'Show Answer'}
                    </Button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white rounded-lg shadow-lg p-4 transform transition-transform duration-300 rotateY(180deg)"
                     style={{ backfaceVisibility: 'hidden' }}>
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <p className="text-gray-600">{flashcards[currentCard].answer}</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
                      Show Question
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={prevCard}
                    disabled={currentCard === 0 || !flashcards}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextCard}
                    disabled={!flashcards || currentCard === flashcards.length - 1}
                    className="w-full sm:w-auto"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Next
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllFlashcards}
                  className="w-full sm:w-auto"
                  disabled={isDeletingFlashcards}
                >
                  {isDeletingFlashcards ? 'Deleting...' : 'Delete All Flashcards'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Flashcards Found</h2>
              <p className="text-gray-500 mb-6">You haven't generated any flashcards yet.</p>
              <Button onClick={() => {
                if (id) {
                  generateFlashcards({ summaryId: id });
                }
              }}
              disabled={isGeneratingFlashcards}
              >
                {isGeneratingFlashcards ? 'Generating...' : 'Generate New Flashcards'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
