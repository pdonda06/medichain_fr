import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protected route component that redirects to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 