import React from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Toggle de tema Dark/Light Mode
 */
export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-300 shadow-md
        ${isDark ? 'bg-gray-700' : 'bg-primary-500'}
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-gray-500' : 'focus:ring-primary-400'}
      `}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {/* Slider */}
      <div
        className={`
          absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md
          transform transition-transform duration-300 flex items-center justify-center
          ${isDark ? 'translate-x-8' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          <Moon size={14} className="text-gray-700" />
        ) : (
          <Sun size={14} className="text-yellow-500" />
        )}
      </div>

      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
        <span className={`ml-1 transition-opacity ${isDark ? 'opacity-0' : 'opacity-100 text-white'}`}>
          ☀️
        </span>
        <span className={`mr-1 transition-opacity ${isDark ? 'opacity-100 text-gray-300' : 'opacity-0'}`}>
          🌙
        </span>
      </div>
    </button>
  );
}
