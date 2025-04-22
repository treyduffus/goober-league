import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Citrus } from 'lucide-react';

const Header: React.FC = () => {
  const { currentSeason } = useAppContext();
  const navigate = useNavigate();
  
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Citrus className="h-8 w-8" />
            <h1 className="text-xl font-bold">Goober League</h1>
          </div>
          
          {currentSeason && (
            <div className="hidden sm:block">
              <span className="text-sm font-medium bg-primary-700 py-1 px-3 rounded-full">
                Season: {currentSeason.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;