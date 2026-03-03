import React, { useState, useEffect } from 'react';
import {
  ChevronDown12Regular,
  ChevronRight12Regular,
  MoreHorizontal16Regular,
  Circle12Regular,
} from '@fluentui/react-icons';
import UnitInput from './UnitInput';
import { DataValidator } from '../utils/validators';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * VS Code-style Sidebar Panel — Explorer tree-view with inputs
 */
export default function Sidebar({ onDataChange, activeView }) {
  const { t } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const [useMonitoring, setUseMonitoring] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    hpFlare: true,
    lpFlare: true,
    additional: true,
    hpCompressor: false,
    lpCompressor: false,
    blower: false,
  });

  const [hpValues, setHpValues] = useState({ comp1: 23000, comp2: 17000 });
  const [lpValues, setLpValues] = useState({ comp3: 15000, comp4: 12900 });
  const [additionalValues] = useState({ param1: 14.830, param2: 26.080 });
  const [compressorHP, setCompressorHP] = useState({ vazao: 250000, pressao: 151, temperatura: 80 });
  const [compressorLP, setCompressorLP] = useState({ vazao: 200000, pressao: 10, temperatura: 60 });
  const [blower, setBlower] = useState({ vazao: 250000, pressao: 1.913, temperatura: 50 });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

    if (type === 'HP') setCompressorHP(prev => ({ ...prev, [field]: finalValue }));
    else if (type === 'LP') setCompressorLP(prev => ({ ...prev, [field]: finalValue }));
    else if (type === 'Blower') setBlower(prev => ({ ...prev, [field]: finalValue }));
  };

  const totalHP = hpValues.comp1 + hpValues.comp2;
  const totalLP = lpValues.comp3 + lpValues.comp4;
  const totalFlaring = totalHP + totalLP;
  const limit = 61000;
  const deltaFromLimit = totalFlaring - limit;
  const isOverLimit = deltaFromLimit > 0;

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({
        monitoring: {
          hpFlare: hpValues,
          lpFlare: lpValues,
          additional: additionalValues,
          totals: { totalHP, totalLP, totalFlaring },
        },
        compressors: { hp: compressorHP, lp: compressorLP, blower },
      });
    }
  }, [hpValues, lpValues, additionalValues, compressorHP, compressorLP, blower]);

  // --- Sub-components ---

  const SectionHeader = ({ label, sectionKey, badge = null }) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center gap-1 transition-colors group"
        style={{
          padding: '4px 8px',
          backgroundColor: isDark ? '#383838' : '#e8e8e8',
          color: isDark ? '#cccccc' : '#616161',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#404040' : '#d6d6d6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#383838' : '#e8e8e8';
        }}
      >
        {isExpanded ? (
          <ChevronDown12Regular className="w-3 h-3 flex-shrink-0" />
        ) : (
          <ChevronRight12Regular className="w-3 h-3 flex-shrink-0" />
        )}
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          flex: 1,
          textAlign: 'left',
        }}>
          {label}
        </span>
        {badge && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: 10,
            backgroundColor: badge.color || '#007acc',
            color: '#ffffff',
            lineHeight: '14px',
          }}>
            {badge.text}
          </span>
        )}
      </button>
    );
  };

  const TreeItem = ({ children, depth = 1 }) => (
    <div
      style={{
        paddingLeft: depth * 16,
        borderLeft: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        marginLeft: 8,
      }}
    >
      {children}
    </div>
  );

  const TotalBadge = ({ label, value, unit = 'Sm³/d', color = '#007acc' }) => (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '4px 8px 4px 24px',
        fontSize: 11,
      }}
    >
      <span style={{ color: isDark ? '#858585' : '#858585' }}>{label}</span>
      <span style={{
        fontWeight: 600,
        fontSize: 11,
        color,
        fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      }}>
        {value.toLocaleString('pt-BR')} {unit}
      </span>
    </div>
  );

  // --- Render views ---

  const renderMonitoringView = () => (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        }}
      >
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isDark ? '#bbbbbb' : '#616161',
        }}>
          {t.monitoringSystem || 'Monitoramento'}
        </span>
        <MoreHorizontal16Regular style={{ color: isDark ? '#858585' : '#858585', cursor: 'pointer' }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Toggle monitoring */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '6px 12px',
            borderBottom: `1px solid ${isDark ? '#2d2d2d' : '#f0f0f0'}`,
          }}
        >
          <span style={{ fontSize: 11, color: isDark ? '#cccccc' : '#616161' }}>
            {t.monitoringSystem || 'Sistema de Monitoramento'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useMonitoring}
              onChange={(e) => setUseMonitoring(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="w-8 h-4 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-vs-accent"
              style={{ backgroundColor: useMonitoring ? undefined : (isDark ? '#555' : '#ccc') }}
            />
          </label>
        </div>

        {useMonitoring && (
          <div>
            {/* HP FLARE */}
            <SectionHeader
              label={t.hpFlare || 'HP Flare'}
              sectionKey="hpFlare"
              badge={{ text: totalHP.toLocaleString('pt-BR'), color: '#007acc' }}
            />
            {expandedSections.hpFlare && (
              <TreeItem>
                <div className="py-1.5 pr-2">
                  <UnitInput
                    label={t.component1 || 'Componente 1'}
                    unitType="volume_flow"
                    defaultValue={15000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.firstHpSource}
                    onChange={(val) => validateAndSetHP('comp1', val)}
                    showCalculator={false}
                  />
                  <UnitInput
                    label={t.component2 || 'Componente 2'}
                    unitType="volume_flow"
                    defaultValue={11000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.secondHpSource}
                    onChange={(val) => validateAndSetHP('comp2', val)}
                    showCalculator={false}
                  />
                </div>
              </TreeItem>
            )}

            {/* LP FLARE */}
            <SectionHeader
              label={t.lpFlare || 'LP Flare'}
              sectionKey="lpFlare"
              badge={{ text: totalLP.toLocaleString('pt-BR'), color: '#007acc' }}
            />
            {expandedSections.lpFlare && (
              <TreeItem>
                <div className="py-1.5 pr-2">
                  <UnitInput
                    label={t.component3 || 'Componente 3'}
                    unitType="volume_flow"
                    defaultValue={10000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.firstLpSource}
                    onChange={(val) => validateAndSetLP('comp3', val)}
                    showCalculator={false}
                  />
                  <UnitInput
                    label={t.component4 || 'Componente 4'}
                    unitType="volume_flow"
                    defaultValue={8000}
                    defaultUnit="Sm³/d"
                    maxValue={100000}
                    step={100}
                    helpText={t.secondLpSource}
                    onChange={(val) => validateAndSetLP('comp4', val)}
                    showCalculator={false}
                  />
                </div>
              </TreeItem>
            )}

            {/* TOTAL */}
            <TotalBadge
              label={t.totalHp || 'Total HP'}
              value={totalHP}
              color="#569cd6"
            />
            <TotalBadge
              label={t.totalLp || 'Total LP'}
              value={totalLP}
              color="#569cd6"
            />
            <div
              style={{
                margin: '4px 8px',
                padding: '6px 10px',
                borderRadius: 3,
                backgroundColor: isOverLimit
                  ? (isDark ? 'rgba(244,71,71,0.12)' : '#fef2f2')
                  : (isDark ? 'rgba(78,201,176,0.12)' : '#f0fdf4'),
                border: `1px solid ${isOverLimit
                  ? (isDark ? 'rgba(244,71,71,0.3)' : '#fca5a5')
                  : (isDark ? 'rgba(78,201,176,0.3)' : '#86efac')}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: isDark ? '#858585' : '#858585', textTransform: 'uppercase', fontWeight: 600 }}>
                  {t.totalFlaringHpLp || 'Total Flaring'}
                </span>
                <Circle12Regular style={{
                  color: isOverLimit ? '#f44747' : '#4ec9b0',
                  width: 8,
                  height: 8,
                }} />
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: isDark ? '#d4d4d4' : '#1e1e1e',
                fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                marginTop: 2,
              }}>
                {totalFlaring.toLocaleString('pt-BR')} Sm³/d
              </div>
              <div style={{
                fontSize: 10,
                color: isOverLimit ? '#f44747' : '#4ec9b0',
                marginTop: 2,
                fontWeight: 500,
              }}>
                {isOverLimit ? '▲' : '▼'} {Math.abs(deltaFromLimit).toLocaleString('pt-BR')} Sm³/d
                {isOverLimit ? (t.aboveLimit || ' acima do limite') : (t.belowLimit || ' abaixo do limite')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEquipmentView = () => (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        }}
      >
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isDark ? '#bbbbbb' : '#616161',
        }}>
          {t.operationalData || 'Dados Operacionais'}
        </span>
        <MoreHorizontal16Regular style={{ color: '#858585', cursor: 'pointer' }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* HP Compressor */}
        <SectionHeader label={t.hpCompressor || 'Compressor HP'} sectionKey="hpCompressor" />
        {expandedSections.hpCompressor && (
          <TreeItem>
            <div className="py-1.5 pr-2">
              <UnitInput
                label={t.flow || 'Vazão'}
                unitType="volume_flow"
                defaultValue={250000}
                minValue={50000}
                maxValue={500000}
                step={10000}
                onChange={(val) => validateAndSetCompressor('HP', 'vazao', val, 'flow')}
                showCalculator={false}
              />
              <UnitInput
                label={t.pressure || 'Pressão'}
                unitType="pressure"
                defaultValue={151}
                maxValue={200}
                step={1}
                onChange={(val) => validateAndSetCompressor('HP', 'pressao', val, 'pressure')}
                showCalculator={false}
              />
              <UnitInput
                label={t.temperature || 'Temperatura'}
                unitType="temperature"
                defaultValue={80}
                maxValue={150}
                step={1}
                onChange={(val) => validateAndSetCompressor('HP', 'temperatura', val, 'temperature')}
                showCalculator={false}
              />
            </div>
          </TreeItem>
        )}

        {/* LP Compressor */}
        <SectionHeader label={t.lpCompressor || 'Compressor LP'} sectionKey="lpCompressor" />
        {expandedSections.lpCompressor && (
          <TreeItem>
            <div className="py-1.5 pr-2">
              <UnitInput
                label={t.flow || 'Vazão'}
                unitType="volume_flow"
                defaultValue={200000}
                minValue={50000}
                maxValue={500000}
                step={10000}
                onChange={(val) => validateAndSetCompressor('LP', 'vazao', val, 'flow')}
                showCalculator={false}
              />
              <UnitInput
                label={t.pressure || 'Pressão'}
                unitType="pressure"
                defaultValue={10}
                maxValue={50}
                step={0.5}
                onChange={(val) => validateAndSetCompressor('LP', 'pressao', val, 'pressure')}
                showCalculator={false}
              />
              <UnitInput
                label={t.temperature || 'Temperatura'}
                unitType="temperature"
                defaultValue={60}
                maxValue={150}
                step={1}
                onChange={(val) => validateAndSetCompressor('LP', 'temperatura', val, 'temperature')}
                showCalculator={false}
              />
            </div>
          </TreeItem>
        )}

        {/* Blower */}
        <SectionHeader label={t.blowerCompressor || 'Blower'} sectionKey="blower" />
        {expandedSections.blower && (
          <TreeItem>
            <div className="py-1.5 pr-2">
              <UnitInput
                label={t.flow || 'Vazão'}
                unitType="volume_flow"
                defaultValue={250000}
                minValue={50000}
                maxValue={500000}
                step={10000}
                onChange={(val) => validateAndSetCompressor('Blower', 'vazao', val, 'flow')}
                showCalculator={false}
              />
              <UnitInput
                label={t.pressure || 'Pressão'}
                unitType="pressure"
                defaultValue={1.913}
                maxValue={5}
                step={0.01}
                onChange={(val) => validateAndSetCompressor('Blower', 'pressao', val, 'pressure')}
                showCalculator={false}
              />
              <UnitInput
                label={t.temperature || 'Temperatura'}
                unitType="temperature"
                defaultValue={50}
                maxValue={150}
                step={1}
                onChange={(val) => validateAndSetCompressor('Blower', 'temperatura', val, 'temperature')}
                showCalculator={false}
              />
            </div>
          </TreeItem>
        )}

        {/* Equipment summary */}
        <div style={{ padding: '8px 12px', marginTop: 4 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#858585' : '#858585',
            marginBottom: 6,
          }}>
            Status
          </div>
          {[
            { name: 'Compressor HP', status: 'Online', color: '#4ec9b0' },
            { name: 'Compressor LP', status: 'Online', color: '#4ec9b0' },
            { name: 'Blower', status: 'Online', color: '#4ec9b0' },
          ].map((eq) => (
            <div
              key={eq.name}
              className="flex items-center justify-between"
              style={{
                padding: '3px 0',
                fontSize: 11,
                color: isDark ? '#cccccc' : '#616161',
              }}
            >
              <span>{eq.name}</span>
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 3,
                backgroundColor: `${eq.color}20`,
                color: eq.color,
              }}>
                {eq.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParametersView = () => (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        }}
      >
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isDark ? '#bbbbbb' : '#616161',
        }}>
          {t.parameters || 'Parâmetros'}
        </span>
        <MoreHorizontal16Regular style={{ color: '#858585', cursor: 'pointer' }} />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 12px' }}>
        {/* System info */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#858585' : '#858585',
            marginBottom: 8,
          }}>
            FPSO Magnolia
          </div>
          {[
            { key: 'Limite Flaring', value: '61.000 Sm³/d' },
            { key: 'Hull Vent', value: '40.000 Sm³/d' },
            { key: 'Eficiência Comb.', value: '98%' },
            { key: 'CO₂ Factor', value: '2.68 kg/Sm³' },
          ].map((param) => (
            <div
              key={param.key}
              className="flex items-center justify-between"
              style={{
                padding: '4px 0',
                fontSize: 11,
                borderBottom: `1px solid ${isDark ? '#2d2d2d' : '#f0f0f0'}`,
              }}
            >
              <span style={{ color: isDark ? '#858585' : '#858585' }}>{param.key}</span>
              <span style={{
                color: isDark ? '#4ec9b0' : '#007acc',
                fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                fontSize: 11,
                fontWeight: 500,
              }}>
                {param.value}
              </span>
            </div>
          ))}
        </div>

        {/* Recovery rates */}
        <div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#858585' : '#858585',
            marginBottom: 8,
          }}>
            {t.recoveryRate || 'Taxas de Recuperação'}
          </div>
          {[
            { key: 'LP Recovery', value: '85%', color: '#4ec9b0' },
            { key: 'HP Recovery', value: '85%', color: '#4ec9b0' },
            { key: 'Hull Recovery', value: '70%', color: '#dcdcaa' },
          ].map((rate) => (
            <div key={rate.key} style={{ marginBottom: 6 }}>
              <div className="flex items-center justify-between" style={{ fontSize: 11, marginBottom: 2 }}>
                <span style={{ color: isDark ? '#cccccc' : '#616161' }}>{rate.key}</span>
                <span style={{ color: rate.color, fontWeight: 600, fontSize: 11 }}>{rate.value}</span>
              </div>
              <div style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: isDark ? '#3c3c3c' : '#e5e5e5',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: rate.value,
                  backgroundColor: rate.color,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${isDark ? '#3c3c3c' : '#e5e5e5'}`,
        }}
      >
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isDark ? '#bbbbbb' : '#616161',
        }}>
          {t.settings || 'Configurações'}
        </span>
        <MoreHorizontal16Regular style={{ color: '#858585', cursor: 'pointer' }} />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 12px' }}>
        <div style={{
          fontSize: 11,
          color: isDark ? '#858585' : '#858585',
          marginBottom: 12,
        }}>
          Gas Recovery Simulator v1.0
        </div>

        {[
          { label: t.monitoringSystem || 'Sistema de Monitoramento', value: useMonitoring ? 'Ativo' : 'Inativo', color: useMonitoring ? '#4ec9b0' : '#858585' },
          { label: 'API Status', value: 'Offline', color: '#858585' },
          { label: 'Auto-save', value: 'Desativado', color: '#858585' },
        ].map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between"
            style={{
              padding: '6px 0',
              fontSize: 11,
              borderBottom: `1px solid ${isDark ? '#2d2d2d' : '#f0f0f0'}`,
              color: isDark ? '#cccccc' : '#616161',
            }}
          >
            <span>{setting.label}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: setting.color,
            }}>
              {setting.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Main render ---
  const viewMap = {
    monitoring: renderMonitoringView,
    equipment: renderEquipmentView,
    parameters: renderParametersView,
    settings: renderSettingsView,
  };

  const renderView = viewMap[activeView] || renderMonitoringView;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: isDark ? '#252526' : '#f3f3f3',
        color: isDark ? '#cccccc' : '#616161',
        width: 256,
        minWidth: 256,
      }}
    >
      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {/* Mini Status Bar — VS Code style */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          height: 22,
          padding: '0 8px',
          backgroundColor: '#007acc',
          color: '#ffffff',
          fontSize: 11,
          fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
        }}
      >
        <div className="flex items-center gap-2">
          <Circle12Regular style={{ width: 8, height: 8, color: isOverLimit ? '#ffcc00' : '#ffffff' }} />
          <span>{totalFlaring.toLocaleString('pt-BR')} Sm³/d</span>
        </div>
        <span style={{ fontSize: 10, opacity: 0.85 }}>
          {isOverLimit ? 'Warning' : 'OK'}
        </span>
      </div>
    </div>
  );
}
