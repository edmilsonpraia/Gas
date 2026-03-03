import React, { useState, useEffect } from 'react';
import {
  Calculator24Regular,
  ArrowSync20Regular,
  Play16Regular,
  ChevronRight12Regular,
  Folder16Regular,
  Document16Regular,
  Code16Regular,
  Navigation16Regular,
  Prompt16Regular,
  CheckmarkCircle16Regular,
  DismissCircle16Regular,
} from '@fluentui/react-icons';
import { NumberFormatter, UnitConverter } from '../utils/unitConverter';
import { useLanguage } from '../contexts/LanguageContext';

/* ===== Theme Hook ===== */
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

/* ===== VS Code Colors ===== */
function useTheme(isDark) {
  return {
    bg:        isDark ? '#1e1e1e' : '#ffffff',
    bgSide:    isDark ? '#252526' : '#f3f3f3',
    bgEditor:  isDark ? '#1e1e1e' : '#ffffff',
    bgTerm:    isDark ? '#1e1e1e' : '#1e1e1e',   // terminal always dark
    bgTab:     isDark ? '#2d2d2d' : '#ececec',
    bgTabAct:  isDark ? '#1e1e1e' : '#ffffff',
    bgInput:   isDark ? '#3c3c3c' : '#ffffff',
    border:    isDark ? '#3e3e3e' : '#e5e7eb',
    borderAct: '#007acc',
    txt:       isDark ? '#d4d4d4' : '#1f2937',
    txtS:      isDark ? '#858585' : '#6b7280',
    accent:    '#007acc',
    keyword:   '#569cd6',
    string:    '#ce9178',
    number:    '#b5cea8',
    func:      '#dcdcaa',
    variable:  '#9cdcfe',
    comment:   '#6a9955',
    type:      '#4ec9b0',
    error:     '#f44747',
    lineNum:   isDark ? '#858585' : '#999999',
    lineNumBg: isDark ? '#1e1e1e' : '#f8f8f8',
  };
}

/* ===== Main Component ===== */
export default function TechnicalCalculator({ data }) {
  const { t } = useLanguage();
  const isDark = useDarkMode();
  const T = useTheme(isDark);

  const [activeSection, setActiveSection] = useState('templates'); // 'templates' | 'converter'

  return (
    <div className="animate-fade-in rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}`, backgroundColor: T.bg }}>

      {/* === VS Code Title Bar === */}
      <div className="flex items-center px-3 py-1.5" style={{ backgroundColor: isDark ? '#323233' : '#dddddd', borderBottom: `1px solid ${T.border}` }}>
        <Calculator24Regular className="w-4 h-4 mr-2" style={{ color: T.accent }} />
        <span className="text-[11px] font-medium" style={{ color: isDark ? '#cccccc' : '#333333' }}>
          {t.calculator} — MAGNOLIA FPSO Gas Recovery
        </span>
        <div className="ml-auto flex gap-2">
          {['converter', 'templates'].map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className="text-[10px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: activeSection === s ? T.accent : 'transparent',
                color: activeSection === s ? '#fff' : T.txtS,
              }}
            >
              {s === 'converter' ? (t.unitConverter || 'Unit Converter') : (t.calculationTemplates || 'Templates')}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'converter' && <ConverterIDE isDark={isDark} T={T} />}
      {activeSection === 'templates' && <TemplatesIDE data={data} isDark={isDark} T={T} />}

      {/* === Status Bar === */}
      <div className="flex items-center px-3 py-0.5" style={{ backgroundColor: T.accent }}>
        <span className="text-[10px] text-white font-medium">MAGNOLIA FPSO</span>
        <span className="text-[10px] text-white/60 ml-4">Block 17 — Offshore Angola</span>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-white/80">
          <span>UTF-8</span>
          <span>Gas Recovery Calc v2.0</span>
        </div>
      </div>
    </div>
  );
}

/* ===== UNIT CONVERTER — IDE STYLE ===== */

function ConverterIDE({ isDark, T }) {
  const { t } = useLanguage();
  const [active, setActive] = useState('volume_flow');

  const converters = [
    { id: 'volume_flow', label: t.volumetricFlow || 'Flow Rate', file: 'flow.calc', decimals: 4 },
    { id: 'pressure', label: t.pressure || 'Pressure', file: 'pressure.calc', decimals: 3 },
    { id: 'temperature', label: t.temperature || 'Temp', file: 'temperature.calc', decimals: 2 },
    { id: 'mass_flow', label: t.massFlow || 'Mass Flow', file: 'mass_flow.calc', decimals: 4 },
    { id: 'energy', label: t.energyPower || 'Energy', file: 'energy.calc', decimals: 4 },
    { id: 'volume', label: t.volume || 'Volume', file: 'volume.calc', decimals: 4 },
  ];

  const curr = converters.find(c => c.id === active);

  return (
    <div className="flex" style={{ minHeight: 360 }}>
      {/* Sidebar — File Explorer */}
      <div className="w-48 flex-shrink-0 border-r" style={{ backgroundColor: T.bgSide, borderColor: T.border }}>
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider" style={{ color: T.txtS }}>
          Explorer
        </div>
        <div className="px-2">
          <div className="flex items-center gap-1 px-1 py-0.5">
            <ChevronRight12Regular style={{ color: T.txtS, transform: 'rotate(90deg)' }} />
            <Folder16Regular style={{ color: '#c09553' }} />
            <span className="text-[11px] font-semibold" style={{ color: T.txt }}>converters/</span>
          </div>
          {converters.map(c => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className="w-full flex items-center gap-1.5 pl-6 pr-2 py-0.5 rounded text-left transition-colors"
              style={{
                backgroundColor: active === c.id ? (isDark ? '#37373d' : '#e4e6f1') : 'transparent',
                color: active === c.id ? T.txt : T.txtS,
              }}
            >
              <Document16Regular style={{ color: T.accent }} />
              <span className="text-[11px]">{c.file}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Tabs */}
        <div className="flex border-b" style={{ backgroundColor: T.bgTab, borderColor: T.border }}>
          {converters.filter(c => c.id === active).map(c => (
            <div
              key={c.id}
              className="flex items-center gap-1.5 px-3 py-1.5"
              style={{ backgroundColor: T.bgTabAct, borderBottom: `2px solid ${T.accent}` }}
            >
              <Code16Regular style={{ color: T.accent }} />
              <span className="text-[11px] font-medium" style={{ color: T.txt }}>{c.file}</span>
            </div>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-3 py-1 border-b" style={{ backgroundColor: T.lineNumBg, borderColor: T.border }}>
          <Navigation16Regular style={{ color: T.txtS }} />
          <span className="text-[10px]" style={{ color: T.txtS }}>converters</span>
          <ChevronRight12Regular style={{ color: T.txtS }} />
          <span className="text-[10px]" style={{ color: T.txt }}>{curr?.file}</span>
        </div>

        {/* Converter Content */}
        <div className="flex-1 p-4 overflow-auto" style={{ backgroundColor: T.bgEditor }}>
          {curr && (
            <ConverterEditor
              category={curr.id}
              decimals={curr.decimals}
              isDark={isDark}
              T={T}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ConverterEditor({ category, decimals, isDark, T }) {
  const { t } = useLanguage();
  const units = UnitConverter.getUnits(category);
  const [value, setValue] = useState(category === 'temperature' ? 25 : category === 'pressure' ? 10 : 1000);
  const [unit, setUnit] = useState(units[0]);

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, category),
  }));

  return (
    <div className="space-y-4">
      {/* Input as code block */}
      <div className="rounded overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 px-3 py-1" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f0f0f0', borderBottom: `1px solid ${T.border}` }}>
          <span className="text-[10px] uppercase tracking-wide" style={{ color: T.txtS }}>Input</span>
        </div>
        <div className="p-3 flex gap-3" style={{ backgroundColor: isDark ? '#1e1e1e' : '#fafafa' }}>
          <div className="flex-1">
            <div className="text-[10px] font-mono mb-1" style={{ color: T.comment }}>// {t.value || 'value'}</div>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 rounded text-sm font-mono font-bold focus:outline-none"
              style={{ backgroundColor: T.bgInput, border: `1px solid ${T.border}`, color: T.number }}
              step="any"
            />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono mb-1" style={{ color: T.comment }}>// {t.unit || 'unit'}</div>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-sm font-mono focus:outline-none"
              style={{ backgroundColor: T.bgInput, border: `1px solid ${T.border}`, color: T.keyword }}
            >
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results as terminal output */}
      <div className="rounded overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 px-3 py-1" style={{ backgroundColor: '#2d2d2d', borderBottom: `1px solid ${isDark ? '#3e3e3e' : '#444'}` }}>
          <Prompt16Regular style={{ color: '#cccccc' }} />
          <span className="text-[10px] text-[#cccccc] uppercase tracking-wide">Output</span>
        </div>
        <div className="p-2 font-mono text-xs" style={{ backgroundColor: '#1e1e1e' }}>
          <div className="mb-1" style={{ color: '#6a9955' }}>{'// conversion results'}</div>
          {conversions.map((conv, i) => {
            const isActive = conv.unit === unit;
            return (
              <div key={conv.unit} className="flex items-center py-0.5">
                <span className="w-5 text-right mr-3 select-none" style={{ color: '#858585', fontSize: 10 }}>{i + 1}</span>
                <span style={{ color: isActive ? '#569cd6' : '#9cdcfe' }}>{conv.unit}</span>
                <span style={{ color: '#d4d4d4' }} className="mx-2">:</span>
                <span style={{ color: isActive ? '#4ec9b0' : '#b5cea8' }} className="font-bold">
                  {NumberFormatter.format(conv.value, decimals)}
                </span>
                {isActive && <span className="ml-2 text-[9px] px-1.5 py-0 rounded" style={{ backgroundColor: '#264f78', color: '#4ec9b0' }}>active</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ===== TEMPLATES — IDE STYLE ===== */

function TemplatesIDE({ data, isDark, T }) {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState('economico');
  const [variables, setVariables] = useState({});
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const translateName = (name) => {
    const m = {
      'Q_Recuperado (Sm³/d)': t.recoveredGas, 'Receita Anual Gás (k USD)': t.annualGasRevenue,
      'OPEX Anual (k USD)': t.annualOpex, 'E_Reduzida (tCO₂/ano)': t.reducedEmissions,
      'Economia Multas (k USD/ano)': t.penaltySavings, 'Payback Simples (anos)': t.simplePayback,
      'Gás Total Flare (Sm³/d)': t.totalFlareGas, 'Gás LP Recuperado (Sm³/d)': t.lpRecoveredGas,
      'Gás HP Recuperado (Sm³/d)': t.hpRecoveredGas, 'Gás Total Recuperado (Sm³/d)': t.totalRecoveredGas,
      'Emissões Flare Atual (tCO₂/ano)': t.currentFlareEmissions, 'Taxa Recuperação Global (%)': t.globalRecoveryRate,
      'Emissões LP Atual (tCO₂/ano)': t.currentLpEmissions, 'Emissões HP Atual (tCO₂/ano)': t.currentHpEmissions,
      'Emissões LP Proposto (tCO₂/ano)': t.proposedLpEmissions, 'Emissões HP Proposto (tCO₂/ano)': t.proposedHpEmissions,
      'Redução Total (tCO₂/ano)': t.totalReduction, 'Equiv. Árvores (unidades)': t.equivalentTrees,
      'Equiv. Carros/ano (unidades)': t.equivalentCarsPerYear, 'Vazão Hull Capturada (Sm³/d)': t.capturedHullFlow,
      'Vazão Hull Residual (Sm³/d)': t.residualHullFlow, 'Razão Compressão HP': t.hpCompressionRatio,
      'Vazão Mássica Hull (kg/d)': t.hullMassFlow, 'Vazão Volumétrica Hull (m³/h)': t.hullVolumetricFlow,
      'Densidade Relativa': t.relativeDensity, 'Emissões Anuais (tCO₂)': t.annualEmissions,
      'Emissões Diárias (tCO₂/d)': t.dailyEmissions, 'Emissões Mensais (tCO₂/mês)': t.monthlyEmissions,
      'Potência Teórica (kW)': t.theoreticalPower, 'Potência Real (HP)': t.realPower,
    };
    return m[name] || name;
  };

  const templates = {
    economico: {
      nome: t.economicAnalysis, file: 'economic.calc',
      descricao: t.economicAnalysisDesc,
      variaveis: {
        Q_LP: { valor: data.monitoring?.totals?.totalLP || 27900, label: 'Q_LP', type: 'flow' },
        Q_HP: { valor: data.monitoring?.totals?.totalHP || 40000, label: 'Q_HP', type: 'flow' },
        Red_LP: { valor: 91, label: 'Red_LP', type: 'pct' }, Red_HP: { valor: 91, label: 'Red_HP', type: 'pct' },
        FE: { valor: 0.00275, label: 'FE', type: 'factor' }, P_Gas: { valor: 6.0, label: 'P_Gas', type: 'price' },
        FC: { valor: 0.9, label: 'FC', type: 'factor' }, CAPEX: { valor: 5000, label: 'CAPEX', type: 'cost' },
        OPEX_pct: { valor: 5, label: 'OPEX_pct', type: 'pct' }, Multa: { valor: 50, label: 'Multa', type: 'price' },
      },
      formulas: {
        'Q_Recuperado (Sm³/d)': '(Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)',
        'Receita Anual Gás (k USD)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FC * P_Gas) / 1000',
        'OPEX Anual (k USD)': 'CAPEX * (OPEX_pct / 100)',
        'E_Reduzida (tCO₂/ano)': '((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE',
        'Economia Multas (k USD/ano)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE * Multa) / 1000',
        'Payback Simples (anos)': 'CAPEX / ((((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FC * P_Gas + ((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE * Multa) / 1000)',
      },
    },
    dados: {
      nome: t.simulatorData, file: 'simulator.calc', descricao: t.simulatorDataDesc,
      variaveis: {
        Q_LP_Flare: { valor: data.monitoring?.totals?.totalLP || 27900, label: 'Q_LP_Flare', type: 'flow' },
        Q_HP_Flare: { valor: data.monitoring?.totals?.totalHP || 40000, label: 'Q_HP_Flare', type: 'flow' },
        Red_LP: { valor: 91, label: 'Red_LP', type: 'pct' }, Red_HP: { valor: 91, label: 'Red_HP', type: 'pct' },
        FE: { valor: 0.00275, label: 'FE', type: 'factor' },
      },
      formulas: {
        'Gás Total Flare (Sm³/d)': 'Q_LP_Flare + Q_HP_Flare',
        'Gás LP Recuperado (Sm³/d)': 'Q_LP_Flare * (Red_LP / 100)',
        'Gás HP Recuperado (Sm³/d)': 'Q_HP_Flare * (Red_HP / 100)',
        'Gás Total Recuperado (Sm³/d)': '(Q_LP_Flare * Red_LP/100) + (Q_HP_Flare * Red_HP/100)',
        'Emissões Flare Atual (tCO₂/ano)': '(Q_LP_Flare + Q_HP_Flare) * 365 * FE',
        'Taxa Recuperação Global (%)': '(((Q_LP_Flare * Red_LP/100) + (Q_HP_Flare * Red_HP/100)) / (Q_LP_Flare + Q_HP_Flare)) * 100',
      },
    },
    ambiental: {
      nome: t.environmentalImpact, file: 'environmental.calc', descricao: t.environmentalImpactDesc,
      variaveis: {
        Q_LP: { valor: data.monitoring?.totals?.totalLP || 27900, label: 'Q_LP', type: 'flow' },
        Q_HP: { valor: data.monitoring?.totals?.totalHP || 40000, label: 'Q_HP', type: 'flow' },
        Red_LP: { valor: 91, label: 'Red_LP', type: 'pct' }, Red_HP: { valor: 91, label: 'Red_HP', type: 'pct' },
        FE: { valor: 0.00275, label: 'FE', type: 'factor' }, GWP_CH4: { valor: 28, label: 'GWP_CH4', type: 'factor' },
        Arvores_tCO2: { valor: 0.021, label: 'Arvores_tCO2', type: 'factor' },
        Carros_tCO2: { valor: 4.6, label: 'Carros_tCO2', type: 'factor' },
      },
      formulas: {
        'Emissões LP Atual (tCO₂/ano)': 'Q_LP * 365 * FE',
        'Emissões HP Atual (tCO₂/ano)': 'Q_HP * 365 * FE',
        'Emissões LP Proposto (tCO₂/ano)': 'Q_LP * (1 - Red_LP/100) * 365 * FE',
        'Emissões HP Proposto (tCO₂/ano)': 'Q_HP * (1 - Red_HP/100) * 365 * FE',
        'Redução Total (tCO₂/ano)': '((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE',
        'Equiv. Árvores (unidades)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE) / Arvores_tCO2',
        'Equiv. Carros/ano (unidades)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE) / Carros_tCO2',
      },
    },
    tecnico: {
      nome: t.technicalAnalysisCalc, file: 'technical.calc', descricao: t.technicalAnalysisCalcDesc,
      variaveis: {
        Q_Hull: { valor: 14830, label: 'Q_Hull', type: 'flow' },
        Eta_Hull: { valor: 95, label: 'Eta_Hull', type: 'pct' },
        Q_Comp_HP: { valor: data.compressors?.hp?.vazao || 250000, label: 'Q_Comp_HP', type: 'flow' },
        P_Comp_HP: { valor: data.compressors?.hp?.pressao || 151, label: 'P_Comp_HP', type: 'pressure' },
        T_Hull: { valor: 60, label: 'T_Hull', type: 'temp' },
      },
      formulas: {
        'Vazão Hull Capturada (Sm³/d)': 'Q_Hull * (Eta_Hull / 100)',
        'Vazão Hull Residual (Sm³/d)': 'Q_Hull * (1 - Eta_Hull/100)',
        'Razão Compressão HP': 'P_Comp_HP / 1.0',
        'Vazão Mássica Hull (kg/d)': 'Q_Hull * 0.717',
        'Vazão Volumétrica Hull (m³/h)': 'Q_Hull / 24',
        'Densidade Relativa': '0.717 / 1.225',
      },
    },
    emissoes: {
      nome: t.co2Emissions, file: 'emissions.calc', descricao: t.co2EmissionsDesc,
      variaveis: {
        Q: { valor: data.monitoring?.totals?.totalFlaring || 67900, label: 'Q', type: 'flow' },
        FE: { valor: 0.00275, label: 'FE', type: 'factor' },
        dias: { valor: 365, label: 'dias', type: 'time' },
      },
      formulas: {
        'Emissões Anuais (tCO₂)': 'Q * FE * dias',
        'Emissões Diárias (tCO₂/d)': 'Q * FE',
        'Emissões Mensais (tCO₂/mês)': 'Q * FE * 30',
      },
    },
    compressor: {
      nome: t.compressorPower, file: 'compressor.calc', descricao: t.compressorPowerDesc,
      variaveis: {
        Q: { valor: data.compressors?.hp?.vazao || 250000, label: 'Q', type: 'flow' },
        P1: { valor: 1.0, label: 'P1', type: 'pressure' },
        P2: { valor: data.compressors?.hp?.pressao || 180, label: 'P2', type: 'pressure' },
        eta: { valor: 0.75, label: 'eta', type: 'factor' },
      },
      formulas: {
        'Potência Teórica (kW)': '(Q / 86400) * P1 * 100 * ((P2/P1)**0.286 - 1) / (0.286 * eta)',
        'Potência Real (HP)': '(Q / 86400) * P1 * 100 * ((P2/P1)**0.286 - 1) / (0.286 * eta * 0.746)',
      },
    },
  };

  const current = templates[selectedTemplate];

  useEffect(() => {
    const init = {};
    Object.entries(current.variaveis).forEach(([k, v]) => { init[k] = v.valor; });
    setVariables(init);
    setShowResults(false);
    setResults({});
  }, [selectedTemplate]);

  const handleChange = (k, v) => setVariables(p => ({ ...p, [k]: parseFloat(v) || 0 }));

  const handleRun = () => {
    const calc = {};
    Object.entries(current.formulas).forEach(([name, formula]) => {
      try {
        const jsF = formula.replace(/\*\*/g, '^');
        const fn = new Function(...Object.keys(variables),
          `const pow=Math.pow,sqrt=Math.sqrt,abs=Math.abs;return ${jsF.replace(/\^/g, '**')};`
        );
        calc[name] = fn(...Object.values(variables));
      } catch { calc[name] = null; }
    });
    setResults(calc);
    setShowResults(true);
  };

  const varTypeColor = (type) => {
    const map = { flow: T.keyword, pct: T.string, factor: T.number, price: T.func, cost: T.error, pressure: '#c586c0', temp: T.string, time: T.type };
    return map[type] || T.variable;
  };

  return (
    <div className="flex" style={{ minHeight: 480 }}>
      {/* Sidebar — Variable Explorer */}
      {sidebarOpen && (
        <div className="w-52 flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: T.bgSide, borderColor: T.border }}>
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider flex items-center justify-between" style={{ color: T.txtS }}>
            <span>Variables</span>
            <span className="text-[9px] px-1.5 rounded" style={{ backgroundColor: isDark ? '#333' : '#e0e0e0', color: T.txtS }}>
              {Object.keys(current.variaveis).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5">
            {Object.entries(current.variaveis).map(([k, v]) => (
              <div key={k} className="rounded px-2 py-1.5" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', border: `1px solid ${T.border}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold" style={{ color: varTypeColor(v.type) }}>{v.label}</span>
                  <span className="text-[8px] px-1 rounded" style={{ backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0', color: T.txtS }}>{v.type}</span>
                </div>
                <input
                  type="number"
                  value={variables[k] ?? v.valor}
                  onChange={(e) => handleChange(k, e.target.value)}
                  className="w-full px-1.5 py-1 rounded text-[11px] font-mono font-bold text-right focus:outline-none"
                  style={{ backgroundColor: isDark ? '#1e1e1e' : '#f8f8f8', border: `1px solid ${T.border}`, color: T.number }}
                  step="any"
                />
              </div>
            ))}
          </div>

          {/* Run button in sidebar */}
          <div className="p-2 border-t" style={{ borderColor: T.border }}>
            <button
              onClick={handleRun}
              className="w-full py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#4ec9b0', color: '#1e1e1e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3db89f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ec9b0'}
            >
              <Play16Regular />
              Run
            </button>
          </div>
        </div>
      )}

      {/* Editor + Terminal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Tabs */}
        <div className="flex border-b overflow-x-auto" style={{ backgroundColor: T.bgTab, borderColor: T.border }}>
          {Object.entries(templates).map(([k, tmpl]) => (
            <button
              key={k}
              onClick={() => setSelectedTemplate(k)}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] whitespace-nowrap transition-colors"
              style={{
                backgroundColor: selectedTemplate === k ? T.bgTabAct : 'transparent',
                color: selectedTemplate === k ? T.txt : T.txtS,
                borderBottom: selectedTemplate === k ? `2px solid ${T.accent}` : '2px solid transparent',
              }}
            >
              <Document16Regular style={{ color: selectedTemplate === k ? T.accent : T.txtS, width: 12, height: 12 }} />
              {tmpl.file}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-3 py-1 border-b" style={{ backgroundColor: T.lineNumBg, borderColor: T.border }}>
          <Navigation16Regular style={{ color: T.txtS, width: 12, height: 12 }} />
          <span className="text-[10px]" style={{ color: T.txtS }}>templates</span>
          <ChevronRight12Regular style={{ color: T.txtS }} />
          <span className="text-[10px]" style={{ color: T.txt }}>{current.file}</span>
          <span className="text-[10px] ml-2" style={{ color: T.comment }}>— {current.descricao}</span>
        </div>

        {/* Code Editor — Formulas with line numbers */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: T.bgEditor }}>
          <div className="font-mono text-[12px] leading-6">
            {/* Header comment */}
            <div className="flex">
              <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>1</span>
              <span style={{ color: T.comment }}>{'// ' + current.nome}</span>
            </div>
            <div className="flex">
              <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>2</span>
              <span style={{ color: T.comment }}>{'// ' + (current.descricao || '')}</span>
            </div>
            <div className="flex">
              <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>3</span>
              <span>&nbsp;</span>
            </div>

            {/* Variable declarations */}
            <div className="flex">
              <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>4</span>
              <span style={{ color: T.comment }}>{'// variables'}</span>
            </div>
            {Object.entries(current.variaveis).map(([k, v], i) => (
              <div key={k} className="flex">
                <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>{5 + i}</span>
                <span>
                  <span style={{ color: T.keyword }}>const </span>
                  <span style={{ color: varTypeColor(v.type) }}>{v.label}</span>
                  <span style={{ color: T.txt }}> = </span>
                  <span style={{ color: T.number }}>{variables[k] ?? v.valor}</span>
                  <span style={{ color: T.txt }}>;</span>
                </span>
              </div>
            ))}

            {/* Blank line */}
            {(() => {
              const varCount = Object.keys(current.variaveis).length;
              const blankLine = 5 + varCount;
              return (
                <>
                  <div className="flex">
                    <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>{blankLine}</span>
                    <span>&nbsp;</span>
                  </div>
                  <div className="flex">
                    <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>{blankLine + 1}</span>
                    <span style={{ color: T.comment }}>{'// formulas'}</span>
                  </div>
                  {Object.entries(current.formulas).map(([name, formula], i) => (
                    <div key={name} className="flex group">
                      <span className="w-10 text-right pr-3 select-none" style={{ color: T.lineNum, backgroundColor: T.lineNumBg }}>{blankLine + 2 + i}</span>
                      <span>
                        <span style={{ color: T.keyword }}>let </span>
                        <span style={{ color: T.func }}>{translateName(name)}</span>
                        <span style={{ color: T.txt }}> = </span>
                        <span style={{ color: T.string }}>{formula}</span>
                        <span style={{ color: T.txt }}>;</span>
                      </span>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>

        {/* Terminal Panel — Results */}
        <div className="border-t" style={{ borderColor: T.border }}>
          <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #3e3e3e' }}>
            <div className="flex items-center gap-2">
              <Prompt16Regular style={{ color: '#cccccc', width: 12, height: 12 }} />
              <span className="text-[10px] text-[#cccccc] uppercase tracking-wide">Terminal</span>
            </div>
            <button
              onClick={handleRun}
              className="text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1"
              style={{ backgroundColor: '#4ec9b0', color: '#1e1e1e' }}
            >
              <Play16Regular className="w-3 h-3" />
              Run
            </button>
          </div>
          <div className="p-3 font-mono text-[11px] overflow-auto" style={{ backgroundColor: '#1e1e1e', minHeight: 80, maxHeight: 200 }}>
            {!showResults ? (
              <div>
                <span style={{ color: '#4ec9b0' }}>$</span>
                <span style={{ color: '#cccccc' }}> Press </span>
                <span style={{ color: '#569cd6' }}>Run</span>
                <span style={{ color: '#cccccc' }}> to execute calculations...</span>
              </div>
            ) : (
              <>
                <div style={{ color: '#6a9955' }}>{'> Running ' + current.file + '...'}</div>
                <div className="mt-1" style={{ color: '#858585' }}>{'────────────────────────────────────────'}</div>
                {Object.entries(results).map(([name, value]) => (
                  <div key={name} className="flex items-center gap-2 py-0.5">
                    {value !== null ? (
                      <CheckmarkCircle16Regular style={{ color: '#4ec9b0', width: 12, height: 12 }} />
                    ) : (
                      <DismissCircle16Regular style={{ color: '#f44747', width: 12, height: 12 }} />
                    )}
                    <span style={{ color: '#9cdcfe' }}>{translateName(name)}</span>
                    <span style={{ color: '#858585' }}>=</span>
                    <span className="font-bold" style={{ color: value !== null ? '#4ec9b0' : '#f44747' }}>
                      {value !== null ? NumberFormatter.format(value, 2) : 'ERROR'}
                    </span>
                  </div>
                ))}
                <div className="mt-1" style={{ color: '#858585' }}>{'────────────────────────────────────────'}</div>
                <div style={{ color: '#4ec9b0' }}>
                  {'> Done. '}{Object.keys(results).length}{' calculations completed.'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
