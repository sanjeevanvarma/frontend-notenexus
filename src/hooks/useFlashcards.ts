import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Flashcard, FlashcardSet } from '@/types/flashcards';

export const useGenerateFlashcards = () => {
  return useMutation({
    mutationFn: async (summaryId: string) => {
      const { data } = await axios.post<FlashcardSet>(
        '/api/flashcards/generate',
        { summaryId }
      );
      return data;
    },
    onError: (error) => {
      console.error('Error generating flashcards:', error);
      throw error; // Re-throw error to be caught by error boundary
    }
  });
};

export const useFlashcardsBySummary = (summaryId: string) => {
  return useQuery({
    queryKey: ['flashcards', summaryId],
    queryFn: async () => {
      const { data } = await axios.get<Flashcard[]>(
        `/api/flashcards/summary/${summaryId}`
      );
      return data;
    },
    enabled: !!summaryId
  });
};

export const useFlashcard = (flashcardId: string) => {
  return useQuery({
    queryKey: ['flashcard', flashcardId],
    queryFn: async () => {
      const { data } = await axios.get<Flashcard>(
        `/api/flashcards/${flashcardId}`
      );
      return data;
    },
    enabled: !!flashcardId
  });
};

export const useDeleteFlashcards = (summaryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/flashcards/summary/${summaryId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', summaryId] });
    },
    onError: (error) => {
      console.error('Error deleting flashcards:', error);
      throw error; // Re-throw error to be caught by error boundary
    }
  });
};
