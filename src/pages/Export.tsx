import React, { useState, useEffect } from "react";
import { API_URL } from '../config/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle, Trash2 } from "lucide-react";
import Header from "@/components/shared/Header";
import { useAuth } from "@/contexts/AuthContext";

interface Summary {
  _id: string;
  title: string;
  summary: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  youtubeUrl: string;
  createdAt: string;
}

const Export = () => {
  const { token } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch(`${API_URL}/api/summaries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch summaries.');
        }
        const data = await response.json();
        setSummaries(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSummaries();
    }
  }, [token]);

  const handlePdfExport = async (summary: Summary) => {
    setExportingId(summary._id);
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
      setExportingId(null);
    }
  };

  const handleDelete = async (summaryId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this summary?')) {
      return;
    }

    setDeletingId(summaryId);
    try {
      const response = await fetch(`${API_URL}/api/summaries/${summaryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete summary.');
      }

      setSummaries(prevSummaries => prevSummaries.filter(summary => summary._id !== summaryId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header title="Export" backPath="/dashboard" />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Saved Summaries
          </h1>
          <p className="text-xl text-muted-foreground">
            Download any of your previously generated summaries as a PDF.
          </p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>My Summaries</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading your summaries...' : `You have ${summaries.length} saved summaries.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-red-500 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            ) : summaries.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">You haven't generated any summaries yet.</p>
            ) : (
              <div className="space-y-4">
                {summaries.map((summary) => (
                  <div key={summary._id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{summary.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Generated on {new Date(summary.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePdfExport(summary)}
                        disabled={exportingId === summary._id || !!deletingId}
                      >
                        {exportingId === summary._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(summary._id)}
                        disabled={deletingId === summary._id || !!exportingId}
                      >
                        {deletingId === summary._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Export;
