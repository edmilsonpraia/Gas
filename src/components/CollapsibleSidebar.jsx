import React, { useState, useEffect } from 'react';
import {
  PulseSquare24Regular,
  Settings24Regular,
  Database24Regular,
  Wrench24Regular,
  ChevronLeft16Regular,
  ChevronRight16Regular,
} from '@fluentui/react-icons';
import Sidebar from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * VS Code-style layout: Activity Bar + Collapsible Side Panel
 */
export default function CollapsibleSidebar({ onDataChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('monitoring');
  const [isDark, setIsDark] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const activityItems = [
    { id: 'monitoring', icon: PulseSquare24Regular, tooltip: t.monitoringSystem || 'Monitoramento' },
    { id: 'equipment', icon: Wrench24Regular, tooltip: t.operationalData || 'Equipamentos' },
    { id: 'parameters', icon: Database24Regular, tooltip: t.parameters || 'Parâmetros' },
    { id: 'settings', icon: Settings24Regular, tooltip: t.settings || 'Configurações' },
  ];

  const handleActivityClick = (id) => {
    if (activeView === id && !isCollapsed) {
      setIsCollapsed(true);
    } else {
      setActiveView(id);
      setIsCollapsed(false);
    }
  };

  return (
    <div className="flex h-screen" style={{ flexShrink: 0 }}>
      {/* Activity Bar — always visible */}
      <div
        className="flex flex-col items-center h-full"
        style={{
          width: 48,
          minWidth: 48,
          backgroundColor: isDark ? '#333333' : '#2c2c2c',
          borderRight: `1px solid ${isDark ? '#252526' : '#1e1e1e'}`,
        }}
      >
        {/* Activity Icons */}
        <div className="flex flex-col items-center w-full mt-0 flex-1">
          {activityItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !isCollapsed;
            return (
              <button
                key={item.id}
                onClick={() => handleActivityClick(item.id)}
                title={item.tooltip}
                className="relative w-full flex items-center justify-center transition-colors"
                style={{
                  height: 48,
                  color: isActive ? '#ffffff' : '#858585',
                  backgroundColor: 'transparent',
                  borderLeft: isActive ? '2px solid #007acc' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#d4d4d4';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#858585';
                }}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </div>

        {/* Bottom: Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? (t.expandSidebar || 'Expandir') : (t.collapseSidebar || 'Colapsar')}
          className="w-full flex items-center justify-center mb-2 transition-colors"
          style={{ height: 36, color: '#858585' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#858585'; }}
        >
          {isCollapsed ? <ChevronRight16Regular /> : <ChevronLeft16Regular />}
        </button>
      </div>

      {/* Side Panel — collapsible */}
      <div
        className="h-full overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          width: isCollapsed ? 0 : 256,
          minWidth: isCollapsed ? 0 : 256,
          backgroundColor: isDark ? '#252526' : '#f3f3f3',
          borderRight: isCollapsed ? 'none' : `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        }}
      >
        <Sidebar onDataChange={onDataChange} activeView={activeView} />
      </div>
    </div>
  );
}
