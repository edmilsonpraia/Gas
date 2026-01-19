import React, { useState } from 'react';
import { Calculator as CalcIcon, Plus, Trash2, Play, RefreshCw } from 'lucide-react';
import { Calculator, NumberFormatter, UnitConverter } from '../utils/unitConverter';

/**
 * Calculadora Técnica com fórmulas personalizadas
 */
export default function TechnicalCalculator({ data }) {
  const [formulas, setFormulas] = useState([
    { id: 1, name: 'Total Flaring', formula: 'total_hp + total_lp', active: true },
    { id: 2, name: 'Média HP', formula: '(hp1 + hp2) / 2', active: true },
    { id: 3, name: 'Eficiência (%)', formula: '((61000 - total_flaring) / 61000) * 100', active: true }
  ]);

  const [newFormula, setNewFormula] = useState({ name: '', formula: '' });
  const [results, setResults] = useState({});

  // Variáveis disponíveis
  const variables = {
    hp1: data.monitoring?.hpFlare?.comp1 || 0,
    hp2: data.monitoring?.hpFlare?.comp2 || 0,
    lp1: data.monitoring?.lpFlare?.comp3 || 0,
    lp2: data.monitoring?.lpFlare?.comp4 || 0,
    total_hp: data.monitoring?.totals?.total_hp || 0,
    total_lp: data.monitoring?.totals?.totalLP || 0,
    total_flaring: data.monitoring?.totals?.totalFlaring || 0,
    vazao_hp: data.compressors?.hp?.vazao || 0,
    vazao_lp: data.compressors?.lp?.vazao || 0,
    vazao_blower: data.compressors?.blower?.vazao || 0,
    pressao_hp: data.compressors?.hp?.pressao || 0,
    pressao_lp: data.compressors?.lp?.pressao || 0,
    temp_hp: data.compressors?.hp?.temperatura || 0,
    temp_lp: data.compressors?.lp?.temperatura || 0
  };

  const handleCalculate = () => {
    const newResults = {};
    formulas.forEach(formula => {
      if (formula.active) {
        const result = Calculator.evaluate(formula.formula, variables);
        newResults[formula.id] = result;
      }
    });
    setResults(newResults);
  };

  const handleAddFormula = () => {
    if (newFormula.name && newFormula.formula) {
      const newId = Math.max(...formulas.map(f => f.id), 0) + 1;
      setFormulas([...formulas, {
        id: newId,
        name: newFormula.name,
        formula: newFormula.formula,
        active: true
      }]);
      setNewFormula({ name: '', formula: '' });
    }
  };

  const handleDeleteFormula = (id) => {
    setFormulas(formulas.filter(f => f.id !== id));
    const newResults = { ...results };
    delete newResults[id];
    setResults(newResults);
  };

  const handleToggleFormula = (id) => {
    setFormulas(formulas.map(f =>
      f.id === id ? { ...f, active: !f.active } : f
    ));
  };

  // Calcular automaticamente ao montar
  React.useEffect(() => {
    handleCalculate();
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-4">
          <CalcIcon size={32} className="text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calculadora Técnica</h2>
            <p className="text-gray-600">Crie e avalie fórmulas personalizadas com variáveis do sistema</p>
          </div>
        </div>
      </div>

      {/* Variáveis Disponíveis */}
      <div className="card">
        <h3 className="card-header">Variáveis Disponíveis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(variables).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="text-xs font-mono text-gray-600">{key}</div>
              <div className="text-lg font-bold text-gray-900">
                {NumberFormatter.format(value, 2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use os nomes das variáveis nas suas fórmulas</li>
            <li>• Operadores: + - * / ( ) pow(base, exp) sqrt(x) abs(x)</li>
            <li>• Exemplo: <code className="bg-blue-100 px-2 py-0.5 rounded">total_hp + total_lp</code></li>
            <li>• Exemplo: <code className="bg-blue-100 px-2 py-0.5 rounded">(hp1 + hp2) / 2</code></li>
          </ul>
        </div>
      </div>

      {/* Adicionar Nova Fórmula */}
      <div className="card">
        <h3 className="card-header">Adicionar Nova Fórmula</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Fórmula
            </label>
            <input
              type="text"
              value={newFormula.name}
              onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
              placeholder="Ex: Vazão Total"
              className="input-field"
            />
          </div>
          <div className="md:col-span-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fórmula
            </label>
            <input
              type="text"
              value={newFormula.formula}
              onChange={(e) => setNewFormula({ ...newFormula, formula: e.target.value })}
              placeholder="Ex: vazao_hp + vazao_lp + vazao_blower"
              className="input-field font-mono"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleAddFormula}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!newFormula.name || !newFormula.formula}
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Fórmulas */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Fórmulas Ativas</h3>
          <button
            onClick={handleCalculate}
            className="btn-primary flex items-center gap-2"
          >
            <Play size={18} />
            Calcular Tudo
          </button>
        </div>

        <div className="space-y-3">
          {formulas.map((formula) => (
            <div
              key={formula.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                formula.active
                  ? 'bg-white border-purple-300'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={formula.active}
                      onChange={() => handleToggleFormula(formula.id)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <h4 className="font-semibold text-gray-900">{formula.name}</h4>
                  </div>
                  <div className="ml-8">
                    <div className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded mb-2">
                      {formula.formula}
                    </div>
                    {results[formula.id] !== undefined && formula.active && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Resultado:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {NumberFormatter.format(results[formula.id], 2)}
                        </span>
                      </div>
                    )}
                    {results[formula.id] === null && formula.active && (
                      <div className="text-sm text-red-600">
                        ⚠️ Erro ao calcular fórmula
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFormula(formula.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                  title="Deletar fórmula"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {formulas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma fórmula adicionada. Crie sua primeira fórmula acima!
          </div>
        )}
      </div>

      {/* Fórmulas Pré-definidas */}
      <div className="card">
        <h3 className="card-header">Fórmulas Pré-definidas Sugeridas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Vazões</h4>
            <ul className="text-sm text-blue-800 space-y-1 font-mono">
              <li>• vazao_hp + vazao_lp</li>
              <li>• vazao_blower / total_flaring</li>
              <li>• (vazao_hp + vazao_lp) / 2</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Eficiência</h4>
            <ul className="text-sm text-green-800 space-y-1 font-mono">
              <li>• ((61000 - total_flaring) / 61000) * 100</li>
              <li>• (total_hp / (total_hp + total_lp)) * 100</li>
              <li>• vazao_blower / (vazao_hp + vazao_lp)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Pressão & Temperatura</h4>
            <ul className="text-sm text-purple-800 space-y-1 font-mono">
              <li>• pressao_hp / pressao_lp</li>
              <li>• temp_hp - temp_lp</li>
              <li>• (temp_hp + temp_lp) / 2</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">Avançadas</h4>
            <ul className="text-sm text-orange-800 space-y-1 font-mono">
              <li>• sqrt(pressao_hp * pressao_lp)</li>
              <li>• pow(total_flaring, 0.5)</li>
              <li>• abs(vazao_hp - vazao_lp)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conversores de Unidades */}
      <UnitConvertersSection />
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
    <div className="card">
      <h3 className="card-header flex items-center gap-2">
        <RefreshCw size={24} className="text-primary-600" />
        Conversores de Unidades Interativos
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Converta entre diferentes unidades de medida em tempo real
      </p>

      {/* Tabs de Conversores */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {converters.map(conv => (
          <button
            key={conv.id}
            onClick={() => setActiveConverter(conv.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeConverter === conv.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{conv.icon}</span>
            {conv.label}
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Entrada</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Conversões Automáticas</h4>
        <div className="space-y-2">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-200">
              <span className="text-sm font-medium text-gray-700">{conv.unit}</span>
              <span className="text-lg font-bold text-blue-700">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Entrada</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Conversões Automáticas</h4>
        <div className="space-y-2">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-200">
              <span className="text-sm font-medium text-gray-700">{conv.unit}</span>
              <span className="text-lg font-bold text-green-700">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Entrada</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Conversões Automáticas</h4>
        <div className="space-y-2">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-orange-50 p-3 rounded border border-orange-200">
              <span className="text-sm font-medium text-gray-700">{conv.unit}</span>
              <span className="text-lg font-bold text-orange-700">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Entrada</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Conversões Automáticas</h4>
        <div className="space-y-2">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-purple-50 p-3 rounded border border-purple-200">
              <span className="text-sm font-medium text-gray-700">{conv.unit}</span>
              <span className="text-lg font-bold text-purple-700">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Entrada</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Conversões Automáticas</h4>
        <div className="space-y-2">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-yellow-50 p-3 rounded border border-yellow-200">
              <span className="text-sm font-medium text-gray-700">{conv.unit}</span>
              <span className="text-lg font-bold text-yellow-700">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Entrada</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="input-field text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Conversões Automáticas</h4>
        <div className="space-y-2">
          {conversions.map(conv => (
            <div key={conv.unit} className="flex justify-between items-center bg-pink-50 p-3 rounded border border-pink-200">
              <span className="text-sm font-medium text-gray-700">{conv.unit}</span>
              <span className="text-lg font-bold text-pink-700">
                {NumberFormatter.format(conv.value, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
