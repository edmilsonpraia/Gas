import React, { useState, useEffect } from 'react';
import {
  PulseSquare24Regular,
  ArrowDownload20Regular,
  Document24Regular,
  Calculator24Regular,
  Beaker24Regular,
  ArrowTrendingDown24Regular,
  DataLine24Regular,
  Fire24Regular,
} from '@fluentui/react-icons';
import CollapsibleSidebar from './components/CollapsibleSidebar';
import TechnicalCalculator from './components/TechnicalCalculator';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import MethodologyFormulas from './components/MethodologyFormulas';
import FlareEmissionForecast from './components/FlareEmissionForecast';
import ComparativeCharts from './components/ComparativeCharts';
import SystemDiagram from './components/SystemDiagram';
import ReportsPanel from './components/ReportsPanel';
import AIAssistant from './components/AIAssistant';
import { EmissionCalculator } from './utils/calculations';
import { useLanguage } from './contexts/LanguageContext';
import * as XLSX from 'xlsx';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Use language context
  const { language, toggleLanguage, t } = useLanguage();

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
    { id: 'overview', label: t.dashboard, icon: PulseSquare24Regular },
    { id: 'calculator', label: t.calculator, icon: Calculator24Regular },
    { id: 'analysis', label: t.analysis, icon: Beaker24Regular },
{ id: 'charts', label: t.charts, icon: ArrowTrendingDown24Regular },
    { id: 'advanced', label: t.advanced, icon: DataLine24Regular },
    { id: 'reports', label: t.reports, icon: Document24Regular }
  ];

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar onDataChange={handleDataChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? '#323233' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#1e1e1e',
            borderBottom: isDarkMode ? 'none' : '1px solid #e5e5e5',
          }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Fire24Regular style={{ color: isDarkMode ? '#ffffff' : '#007acc' }} />
                  <h1 className="text-xl font-bold">{t.appTitle}</h1>
                </div>
                <p className="text-sm" style={{ color: isDarkMode ? '#cccccc' : '#6b7280' }}>
                  {t.appSubtitle}
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDarkMode ? '#999999' : '#9ca3af' }}>
                  {t.appFooter}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle language={language} onToggle={toggleLanguage} />
                <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
                <button
                  onClick={() => handleExport('excel')}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                    color: isDarkMode ? '#ffffff' : '#1f2937',
                  }}
                >
                  <ArrowDownload20Regular />
                  <span className="text-sm font-medium">{t.exportExcel}</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                    color: isDarkMode ? '#ffffff' : '#1f2937',
                  }}
                >
                  <ArrowDownload20Regular />
                  <span className="text-sm font-medium">{t.exportPDF}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="px-8 flex gap-1"
            style={{ borderTop: `1px solid ${isDarkMode ? '#3c3c3c' : '#e5e5e5'}` }}
          >
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-6 py-3 flex items-center gap-2 font-medium border-b-2 transition-all"
                  style={{
                    color: isActive
                      ? (isDarkMode ? '#ffffff' : '#007acc')
                      : (isDarkMode ? '#858585' : '#6b7280'),
                    borderBottomColor: isActive ? '#007acc' : 'transparent',
                    backgroundColor: isActive
                      ? (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,122,204,0.05)')
                      : 'transparent',
                  }}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <SystemDiagram data={data} />
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header */}
              <div className="card border-l-2 border-l-vs-accent">
                <div className="flex items-center gap-2">
                  <ArrowTrendingDown24Regular className="text-vs-accent" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.chartsTitle}</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      MAGNOLIA FPSO — {t.chartsSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparative Charts */}
              <ComparativeCharts data={data} />

              {/* ML Forecast */}
              <FlareEmissionForecast data={data} />
            </div>
          )}

          {activeTab === 'advanced' && (
            <MethodologyFormulas data={data} />
          )}

          {activeTab === 'calculator' && (
            <TechnicalCalculator data={data} />
          )}

          {activeTab === 'analysis' && (
            <TechnicalAnalysis data={data} />
          )}

          {activeTab === 'reports' && (
            <ReportsPanel data={data} onExport={handleExport} />
          )}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant data={data} isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
