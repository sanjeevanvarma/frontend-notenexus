import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, RotateCcw, Download, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Header from "@/components/shared/Header";
import { useFlashcardsBySummary, useGenerateFlashcards, useDeleteFlashcards } from "@/hooks/useFlashcards";
import { Flashcard } from "@/types/flashcards";
import { toast } from "sonner";

const Flashcards = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);

  const { data: flashcards, isLoading: isFetchingFlashcards } = useFlashcardsBySummary(selectedSummaryId || "");
  const { mutate: generateFlashcards } = useGenerateFlashcards();
  const { mutate: deleteFlashcards } = useDeleteFlashcards(selectedSummaryId || "");

  const handleGenerateFlashcards = (summaryId: string) => {
    setIsProcessing(true);
    generateFlashcards(summaryId, {
      onSuccess: () => {
        setSelectedSummaryId(summaryId);
        toast.success('Flashcards generated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to generate flashcards');
      },
      onSettled: () => {
        setIsProcessing(false);
      }
    });
  };

  const handleDeleteAllFlashcards = () => {
    if (!selectedSummaryId) return;

    deleteFlashcards(undefined, {
      onSuccess: () => {
        toast.success('Flashcards deleted successfully!');
        setSelectedSummaryId(null);
      },
      onError: (error) => {
        toast.error('Failed to delete flashcards');
      }
    });
  };

  const nextCard = () => {
    if (!flashcards) return;
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    if (!flashcards) return;
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header title="Smart Flashcards" />

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                <BookOpen className="w-6 h-6 mr-2 inline" />
                Smart Flashcards
              </CardTitle>
              <CardDescription>
                Generate and study flashcards from your video summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="youtubeUrl" className="text-sm font-medium">
                    YouTube URL
                  </label>
                  <Input
                    id="youtubeUrl"
                    placeholder="Enter YouTube URL"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => {
                    // This button will be used to navigate to summaries page
                    // where user can select a summary to generate flashcards
                    // For now, we'll keep it as a placeholder
                  }}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Select Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcards Controls */}
        {selectedSummaryId && (
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="destructive"
              onClick={handleDeleteAllFlashcards}
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
        )}

        {/* Flashcard Display */}
        {flashcards && flashcards.length > 0 && (
          <div className="relative w-full max-w-md mx-auto">
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
                    <Badge variant="outline">
                      {flashcards[currentCard].category}
                    </Badge>
                  </div>
                </div>
                <div className={`transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-lg mb-4">
                    {flashcards[currentCard].answer}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFlipped(false)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Show Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isFetchingFlashcards && (
          <div className="text-center py-8">
            <Clock className="w-6 h-6 mx-auto animate-spin mb-2" />
            <p>Loading flashcards...</p>
          </div>
        )}

        {/* Empty State */}
        {!isFetchingFlashcards && (!flashcards || flashcards.length === 0) && (
          <div className="text-center py-8">
            <p>No flashcards available. Generate some by selecting a summary.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
