import React, { useState } from 'react';
import { Warning16Regular, ArrowTrendingDown16Regular, LeafOne16Regular, ChevronDown16Regular, ChevronUp16Regular } from '@fluentui/react-icons';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Componente de Comparação de Cenários (Atual vs Proposto)
 */
export default function ScenarioComparison({ data }) {
  const { t } = useLanguage();
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
        <div className="bg-white rounded border border-vs-light-border border-l-4 border-l-[#f44747] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Warning16Regular className="text-[#f44747]" />
            <h3 className="text-xs font-semibold text-gray-800">{t.ghgEmissionsBefore}</h3>
          </div>
          <p className="text-2xl font-bold mb-1 text-[#f44747]">
            {NumberFormatter.format(cenarioAtual.emissoes_total, 0)}
          </p>
          <p className="text-xs text-gray-500">{t.tco2eq} - {t.current}</p>
        </div>

        {/* Emissões GEE - Depois */}
        <div className="bg-white rounded border border-vs-light-border border-l-4 border-l-[#4ec9b0] p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingDown16Regular className="text-[#4ec9b0]" />
            <h3 className="text-xs font-semibold text-gray-800">{t.ghgEmissionsAfter}</h3>
          </div>
          <p className="text-2xl font-bold mb-1 text-[#4ec9b0]">
            {NumberFormatter.format(cenarioProposto.emissoes_total, 0)}
          </p>
          <p className="text-xs text-gray-500">{t.tco2eq} - {t.proposed}</p>
        </div>

        {/* Gás Queimado */}
        <div className="bg-white rounded border border-vs-light-border border-l-4 border-l-[#ce9178] p-4">
          <h3 className="text-xs font-semibold mb-2 text-gray-800">🔥 {t.gasBurned}</h3>
          <p className="text-2xl font-bold mb-1 text-[#ce9178]">
            {NumberFormatter.format(gasQueimatoFlares / 1000, 1)}
          </p>
          <p className="text-xs text-gray-500">K{t.sm3d} - {t.currentFlares}</p>
        </div>

        {/* Gás Recuperado */}
        <div className="bg-white rounded border border-vs-light-border border-l-4 border-l-vs-accent p-4">
          <h3 className="text-xs font-semibold mb-2 text-gray-800">♻️ {t.gasRecovered}</h3>
          <p className="text-2xl font-bold mb-1 text-vs-accent">
            {NumberFormatter.format(gasRecuperadoFlares / 1000, 1)}
          </p>
          <p className="text-xs text-gray-500">K{t.sm3d} - {t.proposed}</p>
        </div>
      </div>

      {/* Botão para Mostrar/Ocultar Especificações - Compacto */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="flex items-center gap-2 px-4 py-2 bg-vs-accent hover:bg-primary-600 text-white rounded text-xs font-medium transition-colors"
        >
          {showSpecs ? <ChevronUp16Regular /> : <ChevronDown16Regular />}
          {showSpecs ? t.hideSpecifications : t.showSpecifications}
        </button>
      </div>

      {/* Especificações Técnicas do Campo - Compacto */}
      {showSpecs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-in">
          {/* Especificações de Óleo, Água e Gás */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">⚗️ {t.oilWaterGas}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-700">{t.density}:</span>
              <span className="font-semibold text-gray-900">920 kg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t.viscosity}:</span>
              <span className="font-semibold text-gray-900">5.5 cPo @ 40°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t.gor}:</span>
              <span className="font-semibold text-gray-900">70 Nm³/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t.reservoirSalinity}:</span>
              <span className="font-semibold text-gray-900">120 g/l</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t.barium}:</span>
              <span className="font-semibold text-gray-900">200 ppm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t.bsw}:</span>
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
          <h4 className="text-sm font-semibold text-gray-800 mb-2">📋 {t.exportSpecifications}</h4>

          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">{t.exportOil}:</h5>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.salinity}:</span>
                <span className="font-medium text-gray-900">&lt; 80 mg/l</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.bsw}:</span>
                <span className="font-medium text-gray-900">&lt; 0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.rvp}:</span>
                <span className="font-medium text-gray-900">&lt; 10 psi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.temperature}:</span>
                <span className="font-medium text-gray-900">45°C</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">{t.producedWater}:</h5>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.disposal}:</span>
                <span className="font-medium text-gray-900">{t.noDischarge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HC:</span>
                <span className="font-medium text-gray-900">&lt; 40 ppm</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-1">{t.slopsWater}:</h5>
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
            <Warning16Regular className="text-[#f44747]" />
            {t.currentScenarioTitle}
          </h3>

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
            <LeafOne16Regular className="text-[#4ec9b0]" />
            {t.proposedScenarioTitle}
          </h3>

          {/* Benefícios */}
          <div className="bg-green-50 p-2 rounded mb-2">
            <h5 className="font-semibold text-green-800 mb-1 text-xs">{t.benefits}:</h5>
            <ul className="space-y-0.5 text-xs text-green-700">
              <li>✓ {t.reductionPercent.replace('{percent}', reducaoPercentual.toFixed(1))}</li>
              <li>✓ {t.flareGasCapture}</li>
              <li>✓ {t.gasReuse}</li>
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
                <ArrowTrendingDown16Regular className="text-green-600" />
                <span className="font-semibold text-green-900 text-xs">{t.reduction}</span>
              </div>
              <p className="text-lg font-bold text-green-700">
                {NumberFormatter.format(reducaoEmissoes, 0)}
              </p>
              <p className="text-xs text-green-600">
                ({reducaoPercentual.toFixed(1)}% {t.reduction.toLowerCase()})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equivalências Ambientais - Compacto */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <LeafOne16Regular className="text-[#4ec9b0]" />
          {t.environmentalImpact}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl mb-1">🚗</div>
            <div className="text-lg font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.carros, 0)}
            </div>
            <div className="text-xs text-gray-600">{t.carsPerYear}</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl mb-1">🌳</div>
            <div className="text-lg font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.arvores, 0)}
            </div>
            <div className="text-xs text-gray-600">{t.trees}</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-lg font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.casas, 0)}
            </div>
            <div className="text-xs text-gray-600">{t.housesPerYear}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
