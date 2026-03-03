import React, { useState, useEffect } from 'react';
import { Settings24Regular, Database20Regular, PulseSquare20Regular, ChevronDown16Regular, ChevronRight16Regular } from '@fluentui/react-icons';
import UnitInput from './UnitInput';
import { UnitConverter } from '../utils/unitConverter';
import { DataValidator } from '../utils/validators';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Sidebar com parâmetros de entrada
 */
export default function Sidebar({ onDataChange }) {
  const { t } = useLanguage();
  const [useMonitoring, setUseMonitoring] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
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
    const label = field === 'comp1' ? 'Componente 1' : 'Componente 2';
    const validated = DataValidator.validateFlaringFlow(sanitized, `Tocha AP - ${label}`);
    setHpValues(prev => ({ ...prev, [field]: validated.value || sanitized }));
  };

  const validateAndSetLP = (field, value) => {
    const sanitized = DataValidator.sanitizeNumber(value, 0);
    const label = field === 'comp3' ? 'Componente 3' : 'Componente 4';
    const validated = DataValidator.validateFlaringFlow(sanitized, `Tocha BP - ${label}`);
    setLpValues(prev => ({ ...prev, [field]: validated.value || sanitized }));
  };

  const validateAndSetCompressor = (type, field, value, validatorType) => {
    const sanitized = DataValidator.sanitizeNumber(value, 0);
    let validated;

    let typeName = type;
    if (type === 'HP') typeName = 'Compressor AP';
    if (type === 'LP') typeName = 'Compressor BP';
    if (type === 'Blower') typeName = 'Soprador';

    if (validatorType === 'flow') {
      validated = DataValidator.validateCompressorFlow(sanitized, typeName);
    } else if (validatorType === 'pressure') {
      validated = DataValidator.validatePressure(sanitized, `${typeName} - Pressão`);
    } else if (validatorType === 'temperature') {
      validated = DataValidator.validateTemperature(sanitized, `${typeName} - Temperatura`);
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
      <div
        className="px-3 py-2.5 transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#323233' : '#ffffff',
          borderBottom: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Settings24Regular className="w-5 h-5" style={{ color: isDark ? '#ffffff' : '#007acc' }} />
          <h2 className="text-sm font-semibold" style={{ color: isDark ? '#ffffff' : '#1e1e1e' }}>{t.parameters}</h2>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Toggle Sistema de Monitoramento */}
        <div
          className="flex items-center justify-between p-2.5 rounded transition-colors duration-300"
          style={{
            backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
            border: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Database20Regular className="text-vs-accent w-4 h-4" />
            <span className="text-xs font-medium" style={{ color: isDark ? '#d4d4d4' : '#1f2937' }}>{t.monitoringSystem}</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useMonitoring}
              onChange={(e) => setUseMonitoring(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vs-accent/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vs-accent"></div>
          </label>
        </div>

        {useMonitoring && (
          <div className="space-y-2 animate-fade-in">
            {/* HP FLARE */}
            <div className="rounded overflow-hidden" style={{ border: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}` }}>
              <button
                onClick={() => toggleSection('hpFlare')}
                className="w-full px-3 py-2 flex items-center justify-between transition-colors"
                style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', color: isDark ? '#d4d4d4' : '#1f2937' }}
              >
                <div className="flex items-center gap-1.5">
                  <PulseSquare20Regular className="text-vs-accent w-4 h-4" />
                  <span className="font-medium text-xs">{t.hpFlare}</span>
                </div>
                {expandedSections.hpFlare ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
              </button>

              {expandedSections.hpFlare && (
                <div className="p-2.5 space-y-2">
                  <UnitInput
                    label={t.component1}
                    unitType="volume_flow"
                    defaultValue={15000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.firstHpSource}
                    onChange={(val) => validateAndSetHP('comp1', val)}
                  />
                  <UnitInput
                    label={t.component2}
                    unitType="volume_flow"
                    defaultValue={11000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.secondHpSource}
                    onChange={(val) => validateAndSetHP('comp2', val)}
                  />
                  <div className="mt-2 p-2 bg-vs-accent/10 rounded border border-vs-accent/30">
                    <div className="text-[10px] text-vs-accent font-medium">{t.totalHp}</div>
                    <div className="text-sm font-bold text-vs-accent">{totalHP.toLocaleString('pt-BR')} Sm³/d</div>
                  </div>
                </div>
              )}
            </div>

            {/* LP FLARE */}
            <div className="rounded overflow-hidden" style={{ border: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}` }}>
              <button
                onClick={() => toggleSection('lpFlare')}
                className="w-full px-3 py-2 flex items-center justify-between transition-colors"
                style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', color: isDark ? '#d4d4d4' : '#1f2937' }}
              >
                <div className="flex items-center gap-1.5">
                  <PulseSquare20Regular className="text-vs-accent w-4 h-4" />
                  <span className="font-medium text-xs">{t.lpFlare}</span>
                </div>
                {expandedSections.lpFlare ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
              </button>

              {expandedSections.lpFlare && (
                <div className="p-2.5 space-y-2">
                  <UnitInput
                    label={t.component3}
                    unitType="volume_flow"
                    defaultValue={10000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.firstLpSource}
                    onChange={(val) => validateAndSetLP('comp3', val)}
                  />
                  <UnitInput
                    label={t.component4}
                    unitType="volume_flow"
                    defaultValue={8000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.secondLpSource}
                    onChange={(val) => validateAndSetLP('comp4', val)}
                  />
                  <div className="mt-2 p-2 bg-vs-accent/10 rounded border border-vs-accent/30">
                    <div className="text-[10px] text-vs-accent font-medium">{t.totalLp}</div>
                    <div className="text-sm font-bold text-vs-accent">{totalLP.toLocaleString('pt-BR')} Sm³/d</div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Flaring */}
            <div
              className="p-2.5 rounded border-2"
              style={{
                backgroundColor: deltaFromLimit > 0
                  ? (isDark ? 'rgba(244,71,71,0.1)' : '#fef2f2')
                  : (isDark ? 'rgba(78,201,176,0.1)' : '#f0fdf4'),
                borderColor: deltaFromLimit > 0
                  ? (isDark ? 'rgba(244,71,71,0.4)' : '#fca5a5')
                  : (isDark ? 'rgba(78,201,176,0.4)' : '#86efac'),
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: isDark ? '#d4d4d4' : '#1f2937' }}>
                {t.totalFlaringHpLp}
              </div>
              <div className="text-lg font-bold mb-1" style={{ color: isDark ? '#d4d4d4' : '#1f2937' }}>
                {totalFlaring.toLocaleString('pt-BR')} Sm³/d
              </div>
              <div className="text-[10px]" style={{ color: deltaFromLimit > 0 ? '#f44747' : '#4ec9b0' }}>
                {deltaFromLimit > 0 ? '⚠️ ' : '✅ '}
                {Math.abs(deltaFromLimit).toLocaleString('pt-BR')} Sm³/d
                {deltaFromLimit > 0 ? t.aboveLimit : t.belowLimit}
              </div>
            </div>
          </div>
        )}

        {/* Compressores */}
        <div className="pt-2" style={{ borderTop: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}` }}>
          <h3 className="text-xs font-semibold mb-2" style={{ color: isDark ? '#cccccc' : '#374151' }}>{t.operationalData}</h3>

          {/* Compressor HP */}
          <div className="rounded overflow-hidden mb-2" style={{ border: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}` }}>
            <button
              onClick={() => toggleSection('hpCompressor')}
              className="w-full px-3 py-2 flex items-center justify-between transition-colors"
              style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', color: isDark ? '#d4d4d4' : '#1f2937' }}
            >
              <span className="font-medium text-xs">{t.hpCompressor}</span>
              {expandedSections.hpCompressor ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
            </button>

            {expandedSections.hpCompressor && (
              <div className="p-2.5 space-y-2">
                <UnitInput
                  label={t.flow}
                  unitType="volume_flow"
                  defaultValue={250000}
                  minValue={50000}
                  maxValue={500000}
                  step={10000}
                  onChange={(val) => validateAndSetCompressor('HP', 'vazao', val, 'flow')}
                />
                <UnitInput
                  label={t.pressure}
                  unitType="pressure"
                  defaultValue={151}
                  maxValue={200}
                  step={1}
                  onChange={(val) => validateAndSetCompressor('HP', 'pressao', val, 'pressure')}
                />
                <UnitInput
                  label={t.temperature}
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
          <div className="rounded overflow-hidden mb-2" style={{ border: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}` }}>
            <button
              onClick={() => toggleSection('lpCompressor')}
              className="w-full px-3 py-2 flex items-center justify-between transition-colors"
              style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', color: isDark ? '#d4d4d4' : '#1f2937' }}
            >
              <span className="font-medium text-xs">{t.lpCompressor}</span>
              {expandedSections.lpCompressor ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
            </button>

            {expandedSections.lpCompressor && (
              <div className="p-2.5 space-y-2">
                <UnitInput
                  label={t.flow}
                  unitType="volume_flow"
                  defaultValue={200000}
                  minValue={50000}
                  maxValue={500000}
                  step={10000}
                  onChange={(val) => validateAndSetCompressor('LP', 'vazao', val, 'flow')}
                />
                <UnitInput
                  label={t.pressure}
                  unitType="pressure"
                  defaultValue={10}
                  maxValue={50}
                  step={0.5}
                  onChange={(val) => validateAndSetCompressor('LP', 'pressao', val, 'pressure')}
                />
                <UnitInput
                  label={t.temperature}
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
          <div className="rounded overflow-hidden" style={{ border: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}` }}>
            <button
              onClick={() => toggleSection('blower')}
              className="w-full px-3 py-2 flex items-center justify-between transition-colors"
              style={{ backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', color: isDark ? '#d4d4d4' : '#1f2937' }}
            >
              <span className="font-medium text-xs">{t.blowerCompressor}</span>
              {expandedSections.blower ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
            </button>

            {expandedSections.blower && (
              <div className="p-2.5 space-y-2">
                <UnitInput
                  label={t.flow}
                  unitType="volume_flow"
                  defaultValue={250000}
                  minValue={50000}
                  maxValue={500000}
                  step={10000}
                  onChange={(val) => validateAndSetCompressor('Blower', 'vazao', val, 'flow')}
                />
                <UnitInput
                  label={t.pressure}
                  unitType="pressure"
                  defaultValue={1.913}
                  maxValue={5}
                  step={0.01}
                  onChange={(val) => validateAndSetCompressor('Blower', 'pressao', val, 'pressure')}
                />
                <UnitInput
                  label={t.temperature}
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
