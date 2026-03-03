import React, { useState } from 'react';
import { ChevronLeft20Regular, ChevronRight20Regular, Navigation24Regular } from '@fluentui/react-icons';
import Sidebar from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Wrapper para tornar a sidebar expansível/colapsável
 */
export default function CollapsibleSidebar({ onDataChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-0' : 'w-64'
        } overflow-hidden`}
      >
        <Sidebar onDataChange={onDataChange} />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-20 ${
          isCollapsed ? 'left-0' : 'left-64'
        } z-50 bg-vs-accent text-white p-2 rounded-r-lg shadow-lg hover:bg-primary-600 transition-all duration-300`}
        title={isCollapsed ? t.expandSidebar : t.collapseSidebar}
      >
        {isCollapsed ? <ChevronRight20Regular /> : <ChevronLeft20Regular />}
      </button>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-vs-accent text-white p-4 rounded-full shadow-medium hover:bg-primary-600"
      >
        <Navigation24Regular />
      </button>
    </>
  );
}
