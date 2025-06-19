import { useParams } from 'react-router-dom';
import PasswordResetRequest from '../components/PasswordResetRequest';
import PasswordReset from '../components/PasswordReset';

const PasswordResetPage = () => {
  const { token } = useParams<{ token?: string }>();
  
  // If token is undefined, check for token in URL params as fallback
  if (!token) {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      // Redirect to proper path with token
      window.location.href = `/password-reset/${urlToken}`;
      return null;
    }
    return <PasswordResetRequest />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {token ? (
          <PasswordReset token={token} />
        ) : (
          <PasswordResetRequest />
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
