import React, { useState } from 'react';
import { Settings, Database, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import UnitInput from './UnitInput';
import { UnitConverter } from '../utils/unitConverter';
import { DataValidator } from '../utils/validators';

/**
 * Sidebar com parâmetros de entrada
 */
export default function Sidebar({ onDataChange }) {
  const [useMonitoring, setUseMonitoring] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    hpFlare: true,
    lpFlare: true,
    additional: true,
    hpCompressor: false,
    lpCompressor: false,
    blower: false
  });

  // Estados para valores de monitoramento
  const [hpValues, setHpValues] = useState({
    comp1: 23000,
    comp2: 17000
  });

  const [lpValues, setLpValues] = useState({
    comp3: 15000,
    comp4: 12900
  });

  const [additionalValues, setAdditionalValues] = useState({
    param1: 14.830,
    param2: 26.080
  });

  // Estados para compressores
  const [compressorHP, setCompressorHP] = useState({
    vazao: 250000,
    pressao: 151,
    temperatura: 80
  });

  const [compressorLP, setCompressorLP] = useState({
    vazao: 200000,
    pressao: 10,
    temperatura: 60
  });

  const [blower, setBlower] = useState({
    vazao: 250000,
    pressao: 1.913,
    temperatura: 50
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Funções de validação e sanitização
  const validateAndSetHP = (field, value) => {
    const sanitized = DataValidator.sanitizeNumber(value, 0);
    const validated = DataValidator.validateFlaringFlow(sanitized, `HP ${field}`);
    setHpValues(prev => ({ ...prev, [field]: validated.value || sanitized }));
  };

  const validateAndSetLP = (field, value) => {
    const sanitized = DataValidator.sanitizeNumber(value, 0);
    const validated = DataValidator.validateFlaringFlow(sanitized, `LP ${field}`);
    setLpValues(prev => ({ ...prev, [field]: validated.value || sanitized }));
  };

  const validateAndSetCompressor = (type, field, value, validatorType) => {
    const sanitized = DataValidator.sanitizeNumber(value, 0);
    let validated;

    if (validatorType === 'flow') {
      validated = DataValidator.validateCompressorFlow(sanitized, type);
    } else if (validatorType === 'pressure') {
      validated = DataValidator.validatePressure(sanitized, `${type} - Pressão`);
    } else if (validatorType === 'temperature') {
      validated = DataValidator.validateTemperature(sanitized, `${type} - Temperatura`);
    }

    const finalValue = validated?.value !== null ? validated.value : sanitized;

    if (type === 'HP') {
      setCompressorHP(prev => ({ ...prev, [field]: finalValue }));
    } else if (type === 'LP') {
      setCompressorLP(prev => ({ ...prev, [field]: finalValue }));
    } else if (type === 'Blower') {
      setBlower(prev => ({ ...prev, [field]: finalValue }));
    }
  };

  // Cálculos automáticos
  const totalHP = hpValues.comp1 + hpValues.comp2;
  const totalLP = lpValues.comp3 + lpValues.comp4;
  const totalFlaring = totalHP + totalLP;
  const limit = 61000;
  const deltaFromLimit = totalFlaring - limit;

  React.useEffect(() => {
    // Notifica componente pai sobre mudanças nos dados
    if (onDataChange) {
      onDataChange({
        monitoring: {
          hpFlare: hpValues,
          lpFlare: lpValues,
          additional: additionalValues,
          totals: { totalHP, totalLP, totalFlaring }
        },
        compressors: {
          hp: compressorHP,
          lp: compressorLP,
          blower: blower
        }
      });
    }
  }, [hpValues, lpValues, additionalValues, compressorHP, compressorLP, blower]);

  return (
    <div className="sidebar">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="text-white" size={24} />
          <h2 className="text-xl font-bold text-white">Parâmetros</h2>
        </div>
        <p className="text-primary-100 text-sm">
          Configure os valores de entrada
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Toggle Sistema de Monitoramento */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary-600" />
            <span className="text-sm font-medium">Sistema de Monitoramento</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useMonitoring}
              onChange={(e) => setUseMonitoring(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {useMonitoring && (
          <div className="space-y-4 animate-fade-in">
            {/* HP FLARE */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('hpFlare')}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary-600" />
                  <span className="font-medium text-sm">HP FLARE</span>
                </div>
                {expandedSections.hpFlare ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedSections.hpFlare && (
                <div className="p-4 space-y-3">
                  <UnitInput
                    label="Componente 1"
                    unitType="volume_flow"
                    defaultValue={15000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText="Primeira fonte HP"
                    onChange={(val) => validateAndSetHP('comp1', val)}
                  />
                  <UnitInput
                    label="Componente 2"
                    unitType="volume_flow"
                    defaultValue={11000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText="Segunda fonte HP"
                    onChange={(val) => validateAndSetHP('comp2', val)}
                  />
                  <div className="mt-3 p-3 bg-primary-50 rounded-md border border-primary-200">
                    <div className="text-xs text-primary-700 font-medium">Total HP</div>
                    <div className="text-lg font-bold text-primary-900">{totalHP.toLocaleString('pt-BR')} Sm³/d</div>
                  </div>
                </div>
              )}
            </div>

            {/* LP FLARE */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('lpFlare')}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary-600" />
                  <span className="font-medium text-sm">LP FLARE</span>
                </div>
                {expandedSections.lpFlare ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedSections.lpFlare && (
                <div className="p-4 space-y-3">
                  <UnitInput
                    label="Componente 3"
                    unitType="volume_flow"
                    defaultValue={10000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText="Primeira fonte LP"
                    onChange={(val) => validateAndSetLP('comp3', val)}
                  />
                  <UnitInput
                    label="Componente 4"
                    unitType="volume_flow"
                    defaultValue={8000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText="Segunda fonte LP"
                    onChange={(val) => validateAndSetLP('comp4', val)}
                  />
                  <div className="mt-3 p-3 bg-primary-50 rounded-md border border-primary-200">
                    <div className="text-xs text-primary-700 font-medium">Total LP</div>
                    <div className="text-lg font-bold text-primary-900">{totalLP.toLocaleString('pt-BR')} Sm³/d</div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Flaring */}
            <div className={`p-4 rounded-lg border-2 ${deltaFromLimit > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
              <div className="text-sm font-medium mb-2">
                🔥 Total Flaring (HP + LP)
              </div>
              <div className="text-2xl font-bold mb-2">
                {totalFlaring.toLocaleString('pt-BR')} Sm³/d
              </div>
              <div className={`text-xs ${deltaFromLimit > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {deltaFromLimit > 0 ? '⚠️ ' : '✅ '}
                {Math.abs(deltaFromLimit).toLocaleString('pt-BR')} Sm³/d
                {deltaFromLimit > 0 ? ' acima do limite' : ' abaixo do limite'}
              </div>
            </div>
          </div>
        )}

        {/* Compressores */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Dados Operacionais</h3>

          {/* Compressor HP */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
            <button
              onClick={() => toggleSection('hpCompressor')}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-sm">Compressor HP</span>
              {expandedSections.hpCompressor ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {expandedSections.hpCompressor && (
              <div className="p-4 space-y-3">
                <UnitInput
                  label="Vazão"
                  unitType="volume_flow"
                  defaultValue={250000}
                  minValue={50000}
                  maxValue={500000}
                  step={10000}
                  onChange={(val) => validateAndSetCompressor('HP', 'vazao', val, 'flow')}
                />
                <UnitInput
                  label="Pressão"
                  unitType="pressure"
                  defaultValue={151}
                  maxValue={200}
                  step={1}
                  onChange={(val) => validateAndSetCompressor('HP', 'pressao', val, 'pressure')}
                />
                <UnitInput
                  label="Temperatura"
                  unitType="temperature"
                  defaultValue={80}
                  maxValue={150}
                  step={1}
                  onChange={(val) => validateAndSetCompressor('HP', 'temperatura', val, 'temperature')}
                />
              </div>
            )}
          </div>

          {/* Compressor LP */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
            <button
              onClick={() => toggleSection('lpCompressor')}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-sm">Compressor LP</span>
              {expandedSections.lpCompressor ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {expandedSections.lpCompressor && (
              <div className="p-4 space-y-3">
                <UnitInput
                  label="Vazão"
                  unitType="volume_flow"
                  defaultValue={200000}
                  minValue={50000}
                  maxValue={500000}
                  step={10000}
                  onChange={(val) => validateAndSetCompressor('LP', 'vazao', val, 'flow')}
                />
                <UnitInput
                  label="Pressão"
                  unitType="pressure"
                  defaultValue={10}
                  maxValue={50}
                  step={0.5}
                  onChange={(val) => validateAndSetCompressor('LP', 'pressao', val, 'pressure')}
                />
                <UnitInput
                  label="Temperatura"
                  unitType="temperature"
                  defaultValue={60}
                  maxValue={150}
                  step={1}
                  onChange={(val) => validateAndSetCompressor('LP', 'temperatura', val, 'temperature')}
                />
              </div>
            )}
          </div>

          {/* Blower */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('blower')}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-sm">Compressor Blower</span>
              {expandedSections.blower ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {expandedSections.blower && (
              <div className="p-4 space-y-3">
                <UnitInput
                  label="Vazão"
                  unitType="volume_flow"
                  defaultValue={250000}
                  minValue={50000}
                  maxValue={500000}
                  step={10000}
                  onChange={(val) => validateAndSetCompressor('Blower', 'vazao', val, 'flow')}
                />
                <UnitInput
                  label="Pressão"
                  unitType="pressure"
                  defaultValue={1.913}
                  maxValue={5}
                  step={0.01}
                  onChange={(val) => validateAndSetCompressor('Blower', 'pressao', val, 'pressure')}
                />
                <UnitInput
                  label="Temperatura"
                  unitType="temperature"
                  defaultValue={50}
                  maxValue={150}
                  step={1}
                  onChange={(val) => validateAndSetCompressor('Blower', 'temperatura', val, 'temperature')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
