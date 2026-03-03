import React from 'react';
import { LocalLanguage20Regular } from '@fluentui/react-icons';

function LanguageToggle({ language, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 group relative"
      title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <LocalLanguage20Regular className="text-white" />
      <span className="ml-2 text-sm font-medium text-white">
        {language === 'pt' ? 'PT' : 'EN'}
      </span>
    </button>
  );
}

export default LanguageToggle;
