import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import SideNavigation from './SideNavigation';

const Layout: React.FC = () => {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Side navigation - only visible on md and larger screens */}
        <div className="hidden md:block">
          <SideNavigation />
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile navigation - only visible on small screens */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Layout;