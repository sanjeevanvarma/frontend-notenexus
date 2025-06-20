import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Summary } from '../types/summaries';

export const useSummaries = () => {
  return useQuery({
    queryKey: ['summaries'],
    queryFn: async () => {
      const { data } = await axios.get<Summary[]>(`${API_URL}/api/summaries`);
      return data;
    },
    retry: 1
  });
};
