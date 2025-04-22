import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, PlaySquare, Calendar, Trophy } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const SideNavigation: React.FC = () => {
  const { currentSeason } = useAppContext();

  return (
    <aside className="h-full w-56 bg-white border-r border-gray-200">
      <div className="p-4 space-y-6">
        {currentSeason && (
          <div className="px-4 py-2 bg-primary-50 rounded-md border border-primary-100">
            <p className="text-xs text-primary-600 font-medium">CURRENT SEASON</p>
            <p className="text-sm font-medium">{currentSeason.name}</p>
          </div>
        )}
        
        <nav className="space-y-1">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Home size={18} className="mr-3" />
            <span>Home</span>
          </NavLink>
          
          <NavLink 
            to="/players" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Users size={18} className="mr-3" />
            <span>Players</span>
          </NavLink>
          
          <NavLink 
            to="/create-game" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <PlaySquare size={18} className="mr-3" />
            <span>New Game</span>
          </NavLink>
          
          <NavLink 
            to="/games" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Trophy size={18} className="mr-3" />
            <span>Game History</span>
          </NavLink>
          
          <NavLink 
            to="/seasons" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Calendar size={18} className="mr-3" />
            <span>Seasons</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default SideNavigation;