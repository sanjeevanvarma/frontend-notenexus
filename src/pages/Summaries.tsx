import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Play, Download, AlertCircle, Loader2, BrainCircuit, BookOpen } from "lucide-react";
import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import Header from "@/components/shared/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

interface Summary {
  _id: string;
  title: string;
  summary: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  youtubeUrl: string;
}

const Summaries = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch(`${API_URL}/api/summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate summary.');
      }

      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfExport = async () => {
    if (!summary) return;

    setIsExporting(true);
    try {
      const response = await fetch(`${API_URL}/api/pdf/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(summary),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${summary.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during PDF export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!summary) return;

    setIsGeneratingQuiz(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ summaryId: summary._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate quiz.');
      }

      const quiz = await response.json();
      navigate(`/quiz/${quiz._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!summary) return;

    setIsGeneratingFlashcards(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/flashcards/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ summaryId: summary._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate flashcards.');
      }

      const flashcards = await response.json();
      navigate(`/flashcards/${flashcards._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header title="AI Summaries" />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12 animate-fade-in">
          <Card className="border-0 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Generate AI Summary</CardTitle>
              <CardDescription>Paste a YouTube URL to generate a summary</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-4">
                <Input
                  type="url"
                  placeholder="Paste YouTube URL here"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" />Generate</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto my-8 animate-fade-in">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {summary && (
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
                      <Button onClick={handlePdfExport} disabled={isExporting || isGeneratingQuiz || isGeneratingFlashcards} className="w-full sm:w-auto">
                        {isExporting ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting...</>
                        ) : (
                          <><Download className="w-4 h-4 mr-2" />Export to PDF</>
                        )}
                      </Button>
                      <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz || isExporting || isGeneratingFlashcards} className="w-full sm:w-auto">
                        {isGeneratingQuiz ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Quiz...</>
                        ) : (
                          <><BrainCircuit className="w-4 h-4 mr-2" />Generate Quiz</>
                        )}
                      </Button>
                      <Button onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards || isExporting || isGeneratingQuiz} className="w-full sm:w-auto">
                        {isGeneratingFlashcards ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Flashcards...</>
                        ) : (
                          <><BookOpen className="w-4 h-4 mr-2" />Generate Flashcards</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summaries;
