import { useParams } from 'react-router-dom';
import PasswordResetRequest from '../components/PasswordResetRequest';
import PasswordReset from '../components/PasswordReset';

const PasswordResetPage = () => {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {token ? (
          <PasswordReset />
        ) : (
          <PasswordResetRequest />
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
