import React, { useState, useEffect } from 'react';
import {
  Activity,
  Download,
  FileText,
  Calculator,
  Microscope,
  TrendingDown,
  LineChart,
  Flame
} from 'lucide-react';
import CollapsibleSidebar from './components/CollapsibleSidebar';
import ScenarioComparison from './components/ScenarioComparison';
import TechnicalCalculator from './components/TechnicalCalculator';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import MethodologyFormulas from './components/MethodologyFormulas';
import FlareEmissionForecast from './components/FlareEmissionForecast';
import ComparativeCharts from './components/ComparativeCharts';
import { EmissionCalculator } from './utils/calculations';
import { translations } from './utils/translations';
import * as XLSX from 'xlsx';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'pt';
  });
  // Estado inicial - DISTRIBUIÇÃO CORRECTA:
  // Hull Vent: 40.000 Sm³/d → 40.150 tCO₂eq/ano (MAIOR)
  // LP Flare: 19.925 Sm³/d → 20.000 tCO₂eq/ano (MÉDIO)
  // HP Flare: 7.975 Sm³/d → 8.005 tCO₂eq/ano (MENOR)
  const initialData = {
    monitoring: {
      hpFlare: { comp1: 4000, comp2: 3975 },      // Total: 7.975 Sm³/d
      lpFlare: { comp3: 10000, comp4: 9925 },     // Total: 19.925 Sm³/d
      additional: { param1: 14.830, param2: 26.080 },
      totals: { totalHP: 7975, totalLP: 19925, totalHull: 40000, totalFlaring: 67900 }
    },
    compressors: {
      hp: { vazao: 250000, pressao: 151, temperatura: 80 },
      lp: { vazao: 200000, pressao: 10, temperatura: 60 },
      blower: { vazao: 250000, pressao: 1.913, temperatura: 50 }
    }
  };

  const [data, setData] = useState(initialData);

  // Get translations for current language
  const t = translations[language];

  // Sync dark mode with document.body and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleDataChange = (newData) => {
    setData(newData);
  };

  const handleExport = (format) => {
    const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
    const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.85);

    if (format === 'excel') {
      exportToExcel(cenarioAtual, cenarioProposto);
    } else if (format === 'json') {
      exportToJSON({ cenarioAtual, cenarioProposto, data });
    } else if (format === 'pdf') {
      alert('Exportação PDF em desenvolvimento. Use Excel por enquanto.');
    }
  };

  const exportToExcel = (cenarioAtual, cenarioProposto) => {
    const wb = XLSX.utils.book_new();

    // Aba 1: Resumo Executivo
    const resumo = [
      ['SIMULADOR GAS RECOVERY - CAMPO MAGNÓLIA'],
      ['Relatório Gerado em:', new Date().toLocaleDateString('pt-BR')],
      [],
      ['RESULTADOS COMPARATIVOS'],
      ['Métrica', 'Cenário Atual', 'Cenário Proposto', 'Melhoria'],
      [
        'Emissões Totais (tCO₂eq/ano)',
        cenarioAtual.emissoes_total.toFixed(2),
        cenarioProposto.emissoes_total.toFixed(2),
        `${(((cenarioAtual.emissoes_total - cenarioProposto.emissoes_total) / cenarioAtual.emissoes_total) * 100).toFixed(1)}%`
      ],
      [
        'Custo Ambiental (k USD/ano)',
        (cenarioAtual.custo_ambiental / 1000).toFixed(2),
        (cenarioProposto.custo_ambiental / 1000).toFixed(2),
        `${(((cenarioAtual.custo_ambiental - cenarioProposto.custo_ambiental) / cenarioAtual.custo_ambiental) * 100).toFixed(1)}%`
      ],
      [
        'Receita Anual (k USD)',
        0,
        (cenarioProposto.receita_gas / 1000).toFixed(2),
        'N/A'
      ]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

    // Aba 2: Detalhes Técnicos
    const detalhes = [
      ['DETALHAMENTO TÉCNICO'],
      [],
      ['Emissões por Fonte (tCO₂eq/ano)'],
      ['Fonte', 'Atual', 'Proposto'],
      ['LP Flare', cenarioAtual.emissoes_lp_flare.toFixed(2), cenarioProposto.emissoes_lp_flare.toFixed(2)],
      ['HP Flare', cenarioAtual.emissoes_hp_flare.toFixed(2), cenarioProposto.emissoes_hp_flare.toFixed(2)],
      ['Hull Vent', cenarioAtual.emissoes_hull.toFixed(2), cenarioProposto.emissoes_hull.toFixed(2)],
      ['TOTAL', cenarioAtual.emissoes_total.toFixed(2), cenarioProposto.emissoes_total.toFixed(2)],
      [],
      ['Dados Operacionais'],
      ['Equipamento', 'Vazão (Sm³/d)', 'Pressão (bar)', 'Temperatura (°C)'],
      [
        'Compressor HP',
        data.compressors?.hp?.vazao || 0,
        data.compressors?.hp?.pressao || 0,
        data.compressors?.hp?.temperatura || 0
      ],
      [
        'Compressor LP',
        data.compressors?.lp?.vazao || 0,
        data.compressors?.lp?.pressao || 0,
        data.compressors?.lp?.temperatura || 0
      ],
      [
        'Blower',
        data.compressors?.blower?.vazao || 0,
        data.compressors?.blower?.pressao || 0,
        data.compressors?.blower?.temperatura || 0
      ]
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(detalhes);
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalhes Técnicos');

    // Salvar arquivo
    XLSX.writeFile(wb, `Gas_Recovery_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToJSON = (dataObj) => {
    const jsonStr = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gas_Recovery_Data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: t.dashboard, icon: Activity },
    { id: 'calculator', label: t.calculator, icon: Calculator },
    { id: 'analysis', label: t.analysis, icon: Microscope },
    { id: 'charts', label: t.charts, icon: TrendingDown },
    { id: 'advanced', label: t.advanced, icon: LineChart },
    { id: 'reports', label: t.reports, icon: FileText }
  ];

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar onDataChange={handleDataChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={24} />
                  <h1 className="text-xl font-bold">{t.appTitle}</h1>
                </div>
                <p className="text-primary-100 text-sm">
                  {t.appSubtitle}
                </p>
                <p className="text-primary-200 text-xs mt-0.5">
                  {t.appFooter}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle language={language} onToggle={() => setLanguage(language === 'pt' ? 'en' : 'pt')} />
                <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
                <button
                  onClick={() => handleExport('excel')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download size={18} />
                  <span className="text-sm font-medium">{t.exportExcel}</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download size={18} />
                  <span className="text-sm font-medium">{t.exportPDF}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 flex gap-1 border-t border-primary-500/30">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 flex items-center gap-2 font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'text-white border-white bg-white/10'
                      : 'text-primary-200 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && (
            <ScenarioComparison data={data} />
          )}

          {activeTab === 'charts' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Compacto */}
              <div className="bg-white border-b-2 border-blue-600 px-6 py-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <TrendingDown size={24} className="text-blue-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t.chartsTitle}</h2>
                    <p className="text-xs text-gray-600">{t.chartsSubtitle}</p>
                  </div>
                </div>
              </div>

              {/* Gráficos Comparativos */}
              <ComparativeCharts data={data} />

              {/* Previsão ML - Largura Total */}
              <div className="card border-t-4 border-blue-600">
                <FlareEmissionForecast data={data} />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="card bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <LineChart size={32} className="text-purple-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.advancedTitle}</h2>
                    <p className="text-gray-600">{t.advancedSubtitle}</p>
                  </div>
                </div>
              </div>

              {/* Metodologia e Fórmulas */}
              <MethodologyFormulas data={data} />
            </div>
          )}

          {activeTab === 'calculator' && (
            <TechnicalCalculator data={data} />
          )}

          {activeTab === 'analysis' && (
            <TechnicalAnalysis data={data} />
          )}

          {activeTab === 'reports' && (
            <div className="card animate-fade-in">
              <h2 className="card-header">{t.reportsTitle}</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-green-800">
                    {t.reportsMessage}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleExport('excel')}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {t.exportExcelBtn}
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {t.exportJSONBtn}
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {t.exportPDFBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
