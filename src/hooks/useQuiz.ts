import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config/api';

export const useGenerateQuiz = () => {
  return useMutation({
    mutationFn: async (summaryId: string) => {
      const { data } = await axios.post(`${API_URL}/api/quiz/generate`, { summaryId });
      return data;
    },
    onError: (error) => {
      console.error('Error generating quiz:', error);
      throw error;
    }
  });
};
