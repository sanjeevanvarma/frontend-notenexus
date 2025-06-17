import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Success = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setToken(token);
        setUser(user);
        toast({
          title: "Welcome!",
          description: "You've successfully logged in with Google.",
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast({
          title: "Error",
          description: "Failed to parse user data. Please try logging in again.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    } else {
      toast({
        title: "Error",
        description: "Invalid authentication response. Please try logging in again.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [navigate, searchParams, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait while we process your login...</p>
      </div>
    </div>
  );
};

export default Success;
