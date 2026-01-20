import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, RefreshCw, Play } from 'lucide-react';
import { NumberFormatter, UnitConverter } from '../utils/unitConverter';

/**
 * Calculadora Técnica com fórmulas personalizadas
 */
export default function TechnicalCalculator({ data }) {

  return (
    <div className="space-y-4 animate-fade-in">
      {/* SEÇÃO 1: CONVERSORES DE UNIDADES - COMPACTO */}
      <UnitConvertersSection />

      {/* Linha Separadora */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* SEÇÃO 2: TEMPLATES DE CÁLCULO */}
      <TemplatesSection data={data} />
    </div>
  );
}

/**
 * Seção de Templates de Cálculo
 */
function TemplatesSection({ data }) {
  const [selectedTemplate, setSelectedTemplate] = useState('economico');
  const [variables, setVariables] = useState({});
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Definir templates
  const templates = {
    'economico': {
      nome: '💰 Análise Econômica Simulador',
      descricao: 'Cálculos econômicos baseados nos parâmetros do simulador',
      variaveis: {
        'Q_LP': { valor: data.monitoring?.totals?.totalLP || 27900, label: 'Q_LP' },
        'Q_HP': { valor: data.monitoring?.totals?.totalHP || 40000, label: 'Q_HP' },
        'Red_LP': { valor: 91, label: 'Red_LP' },
        'Red_HP': { valor: 91, label: 'Red_HP' },
        'FE': { valor: 0.00275, label: 'FE' },
        'P_Gas': { valor: 6.0, label: 'P_Gas' },
        'FC': { valor: 0.9, label: 'FC' },
        'CAPEX': { valor: 5000, label: 'CAPEX' },
        'OPEX_pct': { valor: 5, label: 'OPEX_pct' },
        'Multa': { valor: 50, label: 'Multa' }
      },
      formulas: {
        'Q_Recuperado (Sm³/d)': '(Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)',
        'Receita Anual Gás (k USD)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FC * P_Gas) / 1000',
        'OPEX Anual (k USD)': 'CAPEX * (OPEX_pct / 100)',
        'E_Reduzida (tCO₂/ano)': '((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE',
        'Economia Multas (k USD/ano)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE * Multa) / 1000',
        'Payback Simples (anos)': 'CAPEX / ((((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FC * P_Gas + ((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE * Multa) / 1000)'
      }
    },
    'dados': {
      nome: '📊 Dados do Simulador Atual',
      descricao: 'Parâmetros operacionais e resultados da simulação atual',
      variaveis: {
        'Q_LP_Flare': { valor: data.monitoring?.totals?.totalLP || 27900, label: 'Q_LP_Flare' },
        'Q_HP_Flare': { valor: data.monitoring?.totals?.totalHP || 40000, label: 'Q_HP_Flare' },
        'Red_LP': { valor: 91, label: 'Red_LP' },
        'Red_HP': { valor: 91, label: 'Red_HP' },
        'FE': { valor: 0.00275, label: 'FE' }
      },
      formulas: {
        'Gás Total Flare (Sm³/d)': 'Q_LP_Flare + Q_HP_Flare',
        'Gás LP Recuperado (Sm³/d)': 'Q_LP_Flare * (Red_LP / 100)',
        'Gás HP Recuperado (Sm³/d)': 'Q_HP_Flare * (Red_HP / 100)',
        'Gás Total Recuperado (Sm³/d)': '(Q_LP_Flare * Red_LP/100) + (Q_HP_Flare * Red_HP/100)',
        'Emissões Flare Atual (tCO₂/ano)': '(Q_LP_Flare + Q_HP_Flare) * 365 * FE',
        'Taxa Recuperação Global (%)': '(((Q_LP_Flare * Red_LP/100) + (Q_HP_Flare * Red_HP/100)) / (Q_LP_Flare + Q_HP_Flare)) * 100'
      }
    },
    'ambiental': {
      nome: '🌍 Impacto Ambiental Simulador',
      descricao: 'Análise de emissões e impacto ambiental do projeto',
      variaveis: {
        'Q_LP': { valor: data.monitoring?.totals?.totalLP || 27900, label: 'Q_LP' },
        'Q_HP': { valor: data.monitoring?.totals?.totalHP || 40000, label: 'Q_HP' },
        'Red_LP': { valor: 91, label: 'Red_LP' },
        'Red_HP': { valor: 91, label: 'Red_HP' },
        'FE': { valor: 0.00275, label: 'FE' },
        'GWP_CH4': { valor: 28, label: 'GWP_CH4' },
        'Arvores_tCO2': { valor: 0.021, label: 'Arvores_tCO2' },
        'Carros_tCO2': { valor: 4.6, label: 'Carros_tCO2' }
      },
      formulas: {
        'Emissões LP Atual (tCO₂/ano)': 'Q_LP * 365 * FE',
        'Emissões HP Atual (tCO₂/ano)': 'Q_HP * 365 * FE',
        'Emissões LP Proposto (tCO₂/ano)': 'Q_LP * (1 - Red_LP/100) * 365 * FE',
        'Emissões HP Proposto (tCO₂/ano)': 'Q_HP * (1 - Red_HP/100) * 365 * FE',
        'Redução Total (tCO₂/ano)': '((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE',
        'Equiv. Árvores (unidades)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE) / Arvores_tCO2',
        'Equiv. Carros/ano (unidades)': '(((Q_LP * Red_LP/100) + (Q_HP * Red_HP/100)) * 365 * FE) / Carros_tCO2'
      }
    },
    'tecnico': {
      nome: '⚙️ Análise Técnica Simulador',
      descricao: 'Parâmetros técnicos de compressores e vazões',
      variaveis: {
        'Q_Hull': { valor: 14830, label: 'Q_Hull' },
        'Eta_Hull': { valor: 95, label: 'Eta_Hull' },
        'Q_Comp_HP': { valor: data.compressors?.hp?.vazao || 250000, label: 'Q_Comp_HP' },
        'P_Comp_HP': { valor: data.compressors?.hp?.pressao || 151, label: 'P_Comp_HP' },
        'T_Hull': { valor: 60, label: 'T_Hull' }
      },
      formulas: {
        'Vazão Hull Capturada (Sm³/d)': 'Q_Hull * (Eta_Hull / 100)',
        'Vazão Hull Residual (Sm³/d)': 'Q_Hull * (1 - Eta_Hull/100)',
        'Razão Compressão HP': 'P_Comp_HP / 1.0',
        'Vazão Mássica Hull (kg/d)': 'Q_Hull * 0.717',
        'Vazão Volumétrica Hull (m³/h)': 'Q_Hull / 24',
        'Densidade Relativa': '0.717 / 1.225'
      }
    },
    'emissoes': {
      nome: '💨 Emissões de CO₂',
      descricao: 'Cálculo de emissões de gases de efeito estufa',
      variaveis: {
        'Q': { valor: data.monitoring?.totals?.totalFlaring || 67900, label: 'Q' },
        'FE': { valor: 0.00275, label: 'FE' },
        'dias': { valor: 365, label: 'dias' }
      },
      formulas: {
        'Emissões Anuais (tCO₂)': 'Q * FE * dias',
        'Emissões Diárias (tCO₂/d)': 'Q * FE',
        'Emissões Mensais (tCO₂/mês)': 'Q * FE * 30'
      }
    },
    'compressor': {
      nome: '⚡ Potência de Compressor',
      descricao: 'Cálculo de potência requerida para compressão isotérmica',
      variaveis: {
        'Q': { valor: data.compressors?.hp?.vazao || 250000, label: 'Q' },
        'P1': { valor: 1.0, label: 'P1' },
        'P2': { valor: data.compressors?.hp?.pressao || 180, label: 'P2' },
        'eta': { valor: 0.75, label: 'eta' }
      },
      formulas: {
        'Potência Teórica (kW)': '(Q / 86400) * P1 * 100 * ((P2/P1)**0.286 - 1) / (0.286 * eta)',
        'Potência Real (HP)': '(Q / 86400) * P1 * 100 * ((P2/P1)**0.286 - 1) / (0.286 * eta * 0.746)'
      }
    }
  };

  // Inicializar variáveis do template selecionado
  useEffect(() => {
    const template = templates[selectedTemplate];
    const initialVars = {};
    Object.entries(template.variaveis).forEach(([key, val]) => {
      initialVars[key] = val.valor;
    });
    setVariables(initialVars);
    setShowResults(false);
  }, [selectedTemplate]);

  const handleVariableChange = (varName, newValue) => {
    setVariables(prev => ({
      ...prev,
      [varName]: parseFloat(newValue) || 0
    }));
  };

  const handleCalculate = () => {
    const template = templates[selectedTemplate];
    const calculatedResults = {};

    Object.entries(template.formulas).forEach(([resultName, formula]) => {
      try {
        // Substituir ** por Math.pow para compatibilidade
        let jsFormula = formula.replace(/\*\*/g, '^');

        // Criar função de cálculo segura
        const calcFunc = new Function(...Object.keys(variables), `
          const pow = Math.pow;
          const sqrt = Math.sqrt;
          const abs = Math.abs;
          return ${jsFormula.replace(/\^/g, '**')};
        `);

        const result = calcFunc(...Object.values(variables));
        calculatedResults[resultName] = result;
      } catch (err) {
        calculatedResults[resultName] = null;
      }
    });

    setResults(calculatedResults);
    setShowResults(true);
  };

  const currentTemplate = templates[selectedTemplate];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalcIcon size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Templates de Cálculo</h3>
        </div>

        {/* Seletor de Template - Inline */}
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium focus:border-blue-500 focus:outline-none"
        >
          {Object.entries(templates).map(([key, template]) => (
            <option key={key} value={key}>{template.nome}</option>
          ))}
        </select>
      </div>

      {/* Descrição Compacta */}
      <p className="text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
        {currentTemplate.descricao}
      </p>

      {/* Grid: Variáveis | Fórmulas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Variáveis de Entrada - Compacto */}
        <div className="lg:col-span-1">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Variáveis ({Object.keys(currentTemplate.variaveis).length})</h4>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {Object.entries(currentTemplate.variaveis).map(([varName, varInfo]) => (
              <div key={varName} className="bg-gray-50 border border-gray-200 rounded p-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {varInfo.label}
                </label>
                <input
                  type="number"
                  value={variables[varName] || 0}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right font-semibold focus:border-blue-500 focus:outline-none"
                  step="any"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fórmulas - Compacto */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Fórmulas ({Object.keys(currentTemplate.formulas).length})</h4>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {Object.entries(currentTemplate.formulas).map(([resultName, formula]) => (
              <div key={resultName} className="bg-gray-50 border border-gray-200 rounded p-2">
                <div className="text-xs font-medium text-gray-700">{resultName}</div>
                <div className="text-xs font-mono text-blue-600 mt-0.5">= {formula}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão Calcular - Compacto */}
      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Play size={16} />
        Calcular Resultados
      </button>

      {/* Resultados - Compactos */}
      {showResults && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Resultados ({Object.keys(results).length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(results).map(([resultName, value]) => (
              <div key={resultName} className="bg-green-50 border border-green-200 rounded p-2">
                <div className="text-xs font-medium text-gray-600 mb-0.5">{resultName}</div>
                <div className="text-base font-bold text-green-700">
                  {value !== null ? NumberFormatter.format(value, 2) : '❌ Erro'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Seção de Conversores de Unidades Interativos
 */
function UnitConvertersSection() {
  const [activeConverter, setActiveConverter] = useState('vazao');

  // Estados para cada conversor
  const [vazaoValue, setVazaoValue] = useState(100000);
  const [vazaoUnit, setVazaoUnit] = useState('Sm³/d');

  const [pressaoValue, setPressaoValue] = useState(10);
  const [pressaoUnit, setPressaoUnit] = useState('bar');

  const [tempValue, setTempValue] = useState(25);
  const [tempUnit, setTempUnit] = useState('°C');

  const [massaValue, setMassaValue] = useState(10);
  const [massaUnit, setMassaUnit] = useState('kg/s');

  const [energiaValue, setEnergiaValue] = useState(1000);
  const [energiaUnit, setEnergiaUnit] = useState('kW');

  const [volumeValue, setVolumeValue] = useState(100);
  const [volumeUnit, setVolumeUnit] = useState('m³');

  const converters = [
    { id: 'vazao', label: 'Vazão Volumétrica', icon: '💧' },
    { id: 'pressao', label: 'Pressão', icon: '🔧' },
    { id: 'temperatura', label: 'Temperatura', icon: '🌡️' },
    { id: 'massa', label: 'Vazão Mássica', icon: '⚖️' },
    { id: 'energia', label: 'Energia/Potência', icon: '⚡' },
    { id: 'volume', label: 'Volume', icon: '📦' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw size={18} className="text-green-600" />
        <h3 className="text-base font-semibold text-gray-900">Conversor de Unidades</h3>
      </div>

      {/* Tabs de Conversores - Compactos */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {converters.map(conv => (
          <button
            key={conv.id}
            onClick={() => setActiveConverter(conv.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeConverter === conv.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {conv.icon} {conv.label}
          </button>
        ))}
      </div>

      {/* Conversor de Vazão Volumétrica */}
      {activeConverter === 'vazao' && (
        <VazaoConverter
          value={vazaoValue}
          setValue={setVazaoValue}
          unit={vazaoUnit}
          setUnit={setVazaoUnit}
        />
      )}

      {/* Conversor de Pressão */}
      {activeConverter === 'pressao' && (
        <PressaoConverter
          value={pressaoValue}
          setValue={setPressaoValue}
          unit={pressaoUnit}
          setUnit={setPressaoUnit}
        />
      )}

      {/* Conversor de Temperatura */}
      {activeConverter === 'temperatura' && (
        <TemperaturaConverter
          value={tempValue}
          setValue={setTempValue}
          unit={tempUnit}
          setUnit={setTempUnit}
        />
      )}

      {/* Conversor de Vazão Mássica */}
      {activeConverter === 'massa' && (
        <MassaConverter
          value={massaValue}
          setValue={setMassaValue}
          unit={massaUnit}
          setUnit={setMassaUnit}
        />
      )}

      {/* Conversor de Energia */}
      {activeConverter === 'energia' && (
        <EnergiaConverter
          value={energiaValue}
          setValue={setEnergiaValue}
          unit={energiaUnit}
          setUnit={setEnergiaUnit}
        />
      )}

      {/* Conversor de Volume */}
      {activeConverter === 'volume' && (
        <VolumeConverter
          value={volumeValue}
          setValue={setVolumeValue}
          unit={volumeUnit}
          setUnit={setVolumeUnit}
        />
      )}
    </div>
  );
}

/**
 * Conversor de Vazão Volumétrica
 */
function VazaoConverter({ value, setValue, unit, setUnit }) {
  const units = UnitConverter.getUnits('volume_flow');

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, 'volume_flow')
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded text-xs border border-gray-200">
              <span className="font-medium text-gray-600">{conv.unit}</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(conv.value, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Conversor de Pressão
 */
function PressaoConverter({ value, setValue, unit, setUnit }) {
  const units = UnitConverter.getUnits('pressure');

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, 'pressure')
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded text-xs border border-gray-200">
              <span className="font-medium text-gray-600">{conv.unit}</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(conv.value, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Conversor de Temperatura
 */
function TemperaturaConverter({ value, setValue, unit, setUnit }) {
  const units = UnitConverter.getUnits('temperature');

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, 'temperature')
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded text-xs border border-gray-200">
              <span className="font-medium text-gray-600">{conv.unit}</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(conv.value, 2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Conversor de Vazão Mássica
 */
function MassaConverter({ value, setValue, unit, setUnit }) {
  const units = UnitConverter.getUnits('mass_flow');

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, 'mass_flow')
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded text-xs border border-gray-200">
              <span className="font-medium text-gray-600">{conv.unit}</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(conv.value, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Conversor de Energia/Potência
 */
function EnergiaConverter({ value, setValue, unit, setUnit }) {
  const units = UnitConverter.getUnits('energy');

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, 'energy')
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded text-xs border border-gray-200">
              <span className="font-medium text-gray-600">{conv.unit}</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(conv.value, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Conversor de Volume
 */
function VolumeConverter({ value, setValue, unit, setUnit }) {
  const units = UnitConverter.getUnits('volume');

  const conversions = units.map(u => ({
    unit: u,
    value: UnitConverter.convert(value, unit, u, 'volume')
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded text-xs border border-gray-200">
              <span className="font-medium text-gray-600">{conv.unit}</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(conv.value, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
