import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config/environment';

interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/auth/me`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}
