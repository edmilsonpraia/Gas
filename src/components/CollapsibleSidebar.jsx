import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
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
          isCollapsed ? 'w-0' : 'w-80'
        } overflow-hidden`}
      >
        <Sidebar onDataChange={onDataChange} />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-20 ${
          isCollapsed ? 'left-0' : 'left-80'
        } z-50 bg-primary-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-primary-700 transition-all duration-300`}
        title={isCollapsed ? t.expandSidebar : t.collapseSidebar}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary-600 text-white p-4 rounded-full shadow-strong hover:bg-primary-700"
      >
        <Menu size={24} />
      </button>
    </>
  );
}
