import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, PlaySquare, Calendar, Trophy } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
      <div className="flex justify-around items-center py-2">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `flex flex-col items-center p-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
          }
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        
        <NavLink 
          to="/players" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
          }
        >
          <Users size={20} />
          <span className="text-xs mt-1">Players</span>
        </NavLink>
        
        <NavLink 
          to="/create-game" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
          }
        >
          <PlaySquare size={20} />
          <span className="text-xs mt-1">New Game</span>
        </NavLink>
        
        <NavLink 
          to="/games" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
          }
        >
          <Trophy size={20} />
          <span className="text-xs mt-1">Games</span>
        </NavLink>
        
        <NavLink 
          to="/seasons" 
          className={({ isActive }) => 
            `flex flex-col items-center p-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`
          }
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">Seasons</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNavigation;