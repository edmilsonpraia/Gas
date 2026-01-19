import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { UnitConverter, Calculator, NumberFormatter } from '../utils/unitConverter';

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
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {helpText && (
          <span className="ml-2 text-xs text-gray-500">({helpText})</span>
        )}
      </label>

      <div className="flex gap-2">
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
          className="input-field w-32"
        >
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setShowConversions(!showConversions)}
          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {showConversions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Conversões
        </button>
        {showCalculator && (
          <button
            type="button"
            onClick={() => setShowCalc(!showCalc)}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <CalcIcon size={14} />
            Calculadora
          </button>
        )}
      </div>

      {showConversions && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-xs">
          <div className="grid grid-cols-2 gap-2">
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
        <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Operações rápidas:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyQuickOp('double')}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              × 2
            </button>
            <button
              onClick={() => applyQuickOp('half')}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              ÷ 2
            </button>
            <button
              onClick={() => applyQuickOp('increase10')}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              + 10%
            </button>
            <button
              onClick={() => applyQuickOp('decrease10')}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              - 10%
            </button>
            <button
              onClick={() => applyQuickOp('increase20')}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              + 20%
            </button>
            <button
              onClick={() => applyQuickOp('decrease20')}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs"
            >
              - 20%
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
