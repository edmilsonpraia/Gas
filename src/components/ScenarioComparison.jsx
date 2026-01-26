import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';

/**
 * Componente de Comparação de Cenários (Atual vs Proposto)
 */
export default function ScenarioComparison({ data }) {
  const [showSpecs, setShowSpecs] = useState(true);

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);
  const equivalencias = EmissionCalculator.calcularEquivalencias(cenarioAtual.emissoes_total);

  // Gás queimado nos flares (LP + HP)
  const gasQueimatoFlares = data.monitoring?.totals?.totalFlaring || 67900;

  // Gás recuperado do flare com o sistema proposto (91% dos flares)
  const gasRecuperadoFlares = gasQueimatoFlares * 0.91;

  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = (reducaoEmissoes / cenarioAtual.emissoes_total) * 100;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Métricas Principais - Compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Emissões GEE - Antes */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />
            <h3 className="text-xs font-semibold">Emissões GEE (Antes)</h3>
          </div>
          <p className="text-2xl font-bold mb-1">
            {NumberFormatter.format(cenarioAtual.emissoes_total, 0)}
          </p>
          <p className="text-xs text-red-100">tCO₂eq/ano - Atual</p>
        </div>

        {/* Emissões GEE - Depois */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} />
            <h3 className="text-xs font-semibold">Emissões GEE (Depois)</h3>
          </div>
          <p className="text-2xl font-bold mb-1">
            {NumberFormatter.format(cenarioProposto.emissoes_total, 0)}
          </p>
          <p className="text-xs text-green-100">tCO₂eq/ano - Proposto</p>
        </div>

        {/* Gás Queimado */}
        <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-xs font-semibold mb-2">🔥 Gás Queimado</h3>
          <p className="text-2xl font-bold mb-1">
            {NumberFormatter.format(gasQueimatoFlares / 1000, 1)}
          </p>
          <p className="text-xs text-orange-100">KSm³/d - Flares Atual</p>
        </div>

        {/* Gás Recuperado */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-xs font-semibold mb-2">♻️ Gás Recuperado</h3>
          <p className="text-2xl font-bold mb-1">
            {NumberFormatter.format(gasRecuperadoFlares / 1000, 1)}
          </p>
          <p className="text-xs text-blue-100">KSm³/d - Proposto</p>
        </div>
      </div>

      {/* Botão para Mostrar/Ocultar Especificações - Compacto */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
        >
          {showSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showSpecs ? 'Ocultar Especificações' : 'Mostrar Especificações'}
        </button>
      </div>

      {/* Especificações Técnicas do Campo - Compacto */}
      {showSpecs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-in">
          {/* Especificações de Óleo, Água e Gás */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">⚗️ Óleo, Água e Gás</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-700">Densidade:</span>
              <span className="font-semibold text-gray-900">920 kg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Viscosidade:</span>
              <span className="font-semibold text-gray-900">5.5 cPo @ 40°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">GOR:</span>
              <span className="font-semibold text-gray-900">70 Nm³/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Salinidade do Reservatório:</span>
              <span className="font-semibold text-gray-900">120 g/l</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Bário:</span>
              <span className="font-semibold text-gray-900">200 ppm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">BSW:</span>
              <span className="font-semibold text-gray-900">0 - 90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">H₂S / CO₂:</span>
              <span className="font-semibold text-gray-900">0% / 5% (gás)</span>
            </div>
          </div>
        </div>

        {/* Especificações de Exportação e Água Produzida */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">📋 Especificações de Exportação</h4>

          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Óleo de Exportação:</h5>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Salinidade:</span>
                <span className="font-medium text-gray-900">&lt; 80 mg/l</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BSW:</span>
                <span className="font-medium text-gray-900">&lt; 0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RVP:</span>
                <span className="font-medium text-gray-900">&lt; 10 psi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperatura:</span>
                <span className="font-medium text-gray-900">45°C</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Água Produzida:</h5>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Disposição:</span>
                <span className="font-medium text-gray-900">Sem descarte</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HC:</span>
                <span className="font-medium text-gray-900">&lt; 40 ppm</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Água de Slops:</h5>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">HC:</span>
                <span className="font-medium text-gray-900">&lt; 15 ppm</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Grid de Comparação - Compacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Cenário Atual */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={16} />
            Cenário Atual
          </h3>

          {/* Imagem do Sistema Atual */}
          <div className="mb-2">
            <img
              src="/01.jpeg"
              alt="Sistema Atual - Método Convencional"
              className="w-full rounded border border-gray-300"
            />
            <p className="text-xs text-gray-500 text-center mt-1">
              Sistema Atual - Método Convencional
            </p>
          </div>

          {/* Legenda Técnica */}
          <div className="bg-gray-50 p-2 rounded mb-2 text-xs">
            <h5 className="font-semibold text-gray-700 mb-1">Legenda:</h5>
            <ul className="space-y-0.5 text-gray-600">
              <li>• <strong>Sep. Trifásico LP:</strong> Separa óleo, água e gás</li>
              <li>• <strong>Hull Vent Blower:</strong> Ventilação do casco</li>
              <li>• <strong>KO Drum:</strong> Separador antes dos flares</li>
              <li>• <strong>Flares LP/HP:</strong> Queima de gás</li>
            </ul>
          </div>

          {/* Emissões por Fonte */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-2 py-1.5 bg-red-50 rounded border border-red-200 text-xs">
              <span className="font-medium text-gray-700">LP Flare + Hull Vent</span>
              <span className="text-red-700">
                <span className="font-bold">{NumberFormatter.format(cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull, 0)}</span> <span className="font-normal text-gray-600">tCO₂eq/ano</span>
              </span>
            </div>
            <div className="flex justify-between items-center px-2 py-1.5 bg-red-50 rounded border border-red-200 text-xs">
              <span className="font-medium text-gray-700">HP Flare</span>
              <span className="text-red-700">
                <span className="font-bold">{NumberFormatter.format(cenarioAtual.emissoes_lp_flare, 0)}</span> <span className="font-normal text-gray-600">tCO₂eq/ano</span>
              </span>
            </div>
            <div className="flex justify-between items-center px-2 py-2 bg-red-100 rounded border-2 border-red-400 text-sm">
              <span className="font-bold text-gray-900">TOTAL</span>
              <span className="text-red-800">
                <span className="font-bold">{NumberFormatter.format(cenarioAtual.emissoes_total, 0)}</span> <span className="font-normal text-gray-700">tCO₂eq/ano</span>
              </span>
            </div>
          </div>

        </div>

        {/* Cenário Proposto */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Leaf className="text-green-600" size={16} />
            Cenário Proposto
          </h3>

          {/* Imagem do Sistema Proposto */}
          <div className="mb-2">
            <img
              src="/02.jpeg"
              alt="Sistema Proposto - Método de Recuperação"
              className="w-full rounded border border-green-500"
            />
            <p className="text-xs text-gray-500 text-center mt-1">
              Sistema Proposto - Recuperação de Gás
            </p>
          </div>

          {/* Benefícios */}
          <div className="bg-green-50 p-2 rounded mb-2">
            <h5 className="font-semibold text-green-800 mb-1 text-xs">Benefícios:</h5>
            <ul className="space-y-0.5 text-xs text-green-700">
              <li>✓ Redução {reducaoPercentual.toFixed(1)}% emissões</li>
              <li>✓ Captura de gás dos flares</li>
              <li>✓ Reaproveitamento do gás</li>
            </ul>
          </div>

          {/* Emissões por Fonte */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-2 py-1.5 bg-green-50 rounded border border-green-200 text-xs">
              <span className="font-medium text-gray-700">LP Flare + Hull Vent</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull, 0)} <span className="font-normal text-gray-600">tCO₂eq/ano</span>
              </span>
            </div>
            <div className="flex justify-between items-center px-2 py-1.5 bg-green-50 rounded border border-green-200 text-xs">
              <span className="font-medium text-gray-700">HP Flare</span>
              <span className="font-bold text-green-700">
                {NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0)} <span className="font-normal text-gray-600">tCO₂eq/ano</span>
              </span>
            </div>
            <div className="flex justify-between items-center px-2 py-2 bg-green-100 rounded border-2 border-green-400 text-sm">
              <span className="font-bold text-gray-900">TOTAL</span>
              <span className="font-bold text-green-800">
                {NumberFormatter.format(cenarioProposto.emissoes_total, 0)} <span className="font-normal text-gray-700">tCO₂eq/ano</span>
              </span>
            </div>
          </div>

          {/* Redução de Emissões */}
          <div className="mt-2">
            <div className="bg-green-50 border-l-2 border-green-500 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown size={14} className="text-green-600" />
                <span className="font-semibold text-green-900 text-xs">Redução</span>
              </div>
              <p className="text-lg font-bold text-green-700">
                {NumberFormatter.format(reducaoEmissoes, 0)}
              </p>
              <p className="text-xs text-green-600">
                ({reducaoPercentual.toFixed(1)}% redução)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equivalências Ambientais - Compacto */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Leaf className="text-green-600" size={16} />
          Impacto Ambiental
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl mb-1">🚗</div>
            <div className="text-lg font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.carros, 0)}
            </div>
            <div className="text-xs text-gray-600">carros/ano</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl mb-1">🌳</div>
            <div className="text-lg font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.arvores, 0)}
            </div>
            <div className="text-xs text-gray-600">árvores</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-lg font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.casas, 0)}
            </div>
            <div className="text-xs text-gray-600">casas/ano</div>
          </div>
        </div>
      </div>
    </div>
  );
}
