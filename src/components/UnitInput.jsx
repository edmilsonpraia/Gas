import React, { useState, useEffect } from 'react';
import { Calculator16Regular, ChevronDown16Regular, ChevronUp16Regular } from '@fluentui/react-icons';
import { UnitConverter, Calculator, NumberFormatter } from '../utils/unitConverter';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Componente de input numérico com conversor de unidades integrado
 */
export default function UnitInput({
  label,
  unitType,
  defaultValue = 0,
  defaultUnit = null,
  minValue = 0,
  maxValue = 1000000,
  step = 1,
  onChange,
  helpText = null,
  showCalculator = true
}) {
  const { t } = useLanguage();
  const units = UnitConverter.getUnits(unitType);
  const [value, setValue] = useState(defaultValue);
  const [selectedUnit, setSelectedUnit] = useState(defaultUnit || units[0]);
  const [showConversions, setShowConversions] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange(value, selectedUnit);
    }
  }, [value, selectedUnit]);

  const handleValueChange = (e) => {
    const newValue = parseFloat(e.target.value) || 0;
    setValue(Math.max(minValue, Math.min(maxValue, newValue)));
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    // Converte o valor para a nova unidade
    const convertedValue = UnitConverter.convert(value, selectedUnit, newUnit, unitType);
    setValue(convertedValue);
    setSelectedUnit(newUnit);
  };

  const applyQuickOp = (operation) => {
    const newValue = Calculator.quickOperations[operation](value);
    setValue(Math.max(minValue, Math.min(maxValue, newValue)));
  };

  const conversions = UnitConverter.convertToAll(value, selectedUnit, unitType);

  return (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {helpText && (
          <span className="ml-1 text-[10px] text-gray-500">({helpText})</span>
        )}
      </label>

      <div className="flex gap-1.5">
        <input
          type="number"
          value={value}
          onChange={handleValueChange}
          min={minValue}
          max={maxValue}
          step={step}
          className="input-field flex-1"
        />
        <select
          value={selectedUnit}
          onChange={handleUnitChange}
          className="input-field w-24 text-xs"
        >
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      <div className="mt-1 flex gap-1.5">
        <button
          type="button"
          onClick={() => setShowConversions(!showConversions)}
          className="text-[10px] text-vs-accent hover:text-primary-600 flex items-center gap-0.5"
        >
          {showConversions ? <ChevronUp16Regular /> : <ChevronDown16Regular />}
          {t.conversions}
        </button>
        {showCalculator && (
          <button
            type="button"
            onClick={() => setShowCalc(!showCalc)}
            className="text-[10px] text-vs-accent hover:text-primary-600 flex items-center gap-0.5"
          >
            <Calculator16Regular />
            {t.calculator}
          </button>
        )}
      </div>

      {showConversions && (
        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-[10px]">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(conversions).map(([unit, val]) => (
              <div key={unit} className="flex justify-between">
                <span className="text-gray-600">{unit}:</span>
                <span className="font-medium">{NumberFormatter.format(val, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCalc && (
        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
          <div className="text-[10px] text-gray-600 mb-1">{t.quickOperations}</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => applyQuickOp('double')}
              className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-[10px]"
            >
              × 2
            </button>
            <button
              onClick={() => applyQuickOp('half')}
              className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-[10px]"
            >
              ÷ 2
            </button>
            <button
              onClick={() => applyQuickOp('increase10')}
              className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-[10px]"
            >
              + 10%
            </button>
            <button
              onClick={() => applyQuickOp('decrease10')}
              className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-[10px]"
            >
              - 10%
            </button>
            <button
              onClick={() => applyQuickOp('increase20')}
              className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-[10px]"
            >
              + 20%
            </button>
            <button
              onClick={() => applyQuickOp('decrease20')}
              className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-[10px]"
            >
              - 20%
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
