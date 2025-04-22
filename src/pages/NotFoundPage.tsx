import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <h2 className="mt-2 text-3xl font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center mx-auto"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;